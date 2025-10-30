import ReactDOM from "react-dom/client";
import { useEffect, useState } from "react";
import Introduce from "./components/Introduce";
import ConfigBoard from "./components/ConfigBoard";
import type { UserType } from "./types/userType";
import "./popup.css";

export default function Popup() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false); // ✅ Thông báo đăng nhập thành công
  const [showTutorial, setShowTutorial] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL; // nếu dùng Vite

  // const [user, setUser] = useState<UserType | null>({
  //   _id: "68feea38c37b433b70818931",
  //   displayName: "Tuấn Anh Lê",
  //   email: "tuananh12072002@gmail.com",
  //   photo:
  //     "https://lh3.googleusercontent.com/a/ACg8ocKXmIO7qdm-D2pveUQ0_xZPhrPn5XZ6CLxzqk6-LNiZier_M_3L9Q=s96-c",
  //   premium: {
  //     plan: "3_days",
  //     expiresAt: "",
  //     remainingDays: 3,
  //     active: false,
  //   },
  //   role: "admin",
  //   needUpdate: true,
  // });

  // ===============================
  // 📦 Lấy thông tin user
  // ===============================
  const loadUser = () => {
    setLoading(true);
    chrome.runtime.sendMessage(
      { type: "GET_USER_STATUS" },
      (user: UserType) => {
        setUser(user);
        console.log(user);
        setLoading(false);
      }
    );
  };

  // ===============================
  // 🚀 Khi popup mở
  // ===============================
  useEffect(() => {
    const checkAndCancelPremium = async (user: UserType) => {
      if (!user?.premium) return;

      const now = new Date();
      const expiresAt = new Date(user.premium.expiresAt);

      // Nếu đã hết hạn và vẫn active → gọi API hủy
      if (expiresAt < now && user.premium.active) {
        console.log("⏳ Premium hết hạn, đang hủy...");
        try {
          const res = await fetch(`${API_URL}/api/cancel_premium`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user._id }),
          });
          const data = await res.json();
          if (data.success) {
            console.log("✅ Premium đã được hủy.");
            // reload lại user để cập nhật trạng thái mới
            loadUser();
          } else {
            console.warn("⚠️ Hủy premium thất bại:", data.error);
          }
        } catch (err) {
          console.error("Lỗi khi gọi API hủy premium:", err);
        }
      }
    };

    // --- tải user ---
    loadUser();

    // --- kiểm tra premium ---
    chrome.runtime.sendMessage(
      { type: "GET_USER_STATUS" },
      (user: UserType) => {
        if (user) checkAndCancelPremium(user);
      }
    );

    // --- Kiểm tra trạng thái ChatBuddy ---
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;
      chrome.tabs.sendMessage(
        tabId,
        { type: "GET_CHATBUDDY_STATUS" },
        (response) => {
          if (response?.active !== undefined) {
            setActive(response.active);
          } else {
            chrome.storage.local.get("chatBuddyActive", (data) => {
              setActive(!!data.chatBuddyActive);
            });
          }
        }
      );
    });

    // --- Kiểm tra tutorial ---
    chrome.runtime.sendMessage({ type: "CHECK_TUTORIAL_STATUS" }, (res) => {
      if (!res.tutorialShown) {
        setShowTutorial(true);
      }
    });
  }, []);

  // ===============================
  // 🔑 Đăng nhập / đăng xuất
  // ===============================
  const handleLogin = () => {
    setLoading(true);

    const authUrl = `${API_URL}/api/auth/google?prompt=select_account`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError) {
          console.error("Lỗi khi đăng nhập:", chrome.runtime.lastError);
          setLoading(false);
          return;
        }

        if (redirectUrl) {
          const token = new URL(redirectUrl).searchParams.get("token");
          if (token) {
            chrome.storage.local.set({ token }, () => {
              loadUser();
              // ✅ Hiển thị thông báo nhỏ
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 100);
            });
          } else {
            console.warn("⚠️ Không lấy được token từ redirectUrl");
            setLoading(false);
          }
        } else {
          console.warn("⚠️ Không có redirectUrl sau khi login");
          setLoading(false);
        }
      }
    );
  };

  const handleLogout = () => {
    chrome.runtime.sendMessage({ type: "CLEAR_USER_CACHE" }, () => {
      setUser(null);
      setActive(false);
    });
  };

  const toggleChatBuddy = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      const newState = !active;
      const type = newState ? "ACTIVATE_CHATBUDDY" : "DEACTIVATE_CHATBUDDY";

      chrome.tabs.sendMessage(tabId, { type }, () => {
        setActive(newState);
        chrome.storage.local.set({ chatBuddyActive: newState });
      });
    });
  };

  // ===============================
  // 🧩 UI
  // ===============================
  return (
    <div className="w-[300px] h-[400px] shadow-lg text-gray-800 font-sans relative flex flex-col">
      {user ? (
        <ConfigBoard
          user={user}
          handleLogout={handleLogout}
          handleActive={toggleChatBuddy}
          handleDeActive={toggleChatBuddy}
          isActive={active}
          showTutorial={showTutorial}
          setShowTutorial={setShowTutorial}
        />
      ) : (
        <Introduce handleLogin={handleLogin} isLoading={loading} />
      )}

      {/* ✅ Thông báo nhỏ fit-content */}
      {showSuccess && (
        <div
          className="
          w-
            absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
            bg-white/20 px-2 py-2 shadow-md
            text-xs font-medium animate-fadeFloat pointer-events-none
          "
        >
          Đăng nhập thành công
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Popup />);
