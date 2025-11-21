import ReactDOM from "react-dom/client";
import { AppProvider } from "./contexts/AppContext";
import { useEffect, useState } from "react";
import Introduce from "./components/Introduce";
import ConfigBoard from "./components/ConfigBoard";
import type { UserType } from "./types/userType";
import "./popup.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

export default function Popup() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
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
  //     active: true,
  //   },
  //   role: "member",
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
        // console.log(user); // ⚠️ có thể lộ email, token, latestMessage → comment
        setLoading(false);
      }
    );
  };

  // ===============================
  // 🚀 Khi popup mở
  // ===============================
  useEffect(() => {
    // Wake up server để tránh delay khi login
    const awakeServer = async () => {
      await fetch(`${API_URL}/api/ping`)
        .then(() => console.log("✅ Server sẵn sàng"))
        .catch(() => console.warn("⚠️ Server đang khởi động..."));
    };

    const checkAndCancelPremium = async (user: UserType) => {
      if (!user?.premium) return;

      const now = new Date();
      const expiresAt = new Date(user.premium.expiresAt);

      if (expiresAt < now && user.premium.active) {
        // console.log("⏳ Premium hết hạn, đang hủy..."); // OK nhưng info nhẹ
        try {
          const res = await fetch(`${API_URL}/api/cancel_premium`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: user._id }),
          });
          const data = await res.json();
          if (data.success) {
            // console.log("✅ Premium đã được hủy."); // OK
            loadUser();
          } else {
            // console.warn("⚠️ Hủy premium thất bại:", data.error); // info nhẹ
          }
        } catch (err) {
          // console.error("Lỗi khi gọi API hủy premium:", err); // OK, không nhạy cảm
        }
      }
    };

    // Đánh thức server
    awakeServer();
    // --- tải user ---
    loadUser();

    chrome.runtime.sendMessage(
      { type: "GET_USER_STATUS" },
      (user: UserType) => {
        if (user) checkAndCancelPremium(user);
      }
    );

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

    const extensionId = chrome.runtime.id;
    const authUrl = `${API_URL}/api/auth/google?extensionId=${extensionId}`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError) {
          // console.error("Lỗi khi đăng nhập:", chrome.runtime.lastError); // OK, nhẹ
          setLoading(false);
          return;
        }

        if (!redirectUrl) {
          // console.warn("⚠ Không có redirectUrl từ Google"); // OK
          setLoading(false);
          return;
        }

        // console.log("🔁 Redirect URL:", redirectUrl); // ⚠️ có token trong URL → comment

        const token = new URL(redirectUrl).searchParams.get("token");

        if (!token) {
          // console.warn("⚠ Không tìm thấy token trong redirectUrl"); // OK
          setLoading(false);
          return;
        }

        chrome.storage.local.set({ token }, () => {
          // console.log("🔐 Token đã lưu:", token); // ⚠️ lộ token → comment
          loadUser();
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 1000);
        });
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
    <AppProvider>
      <QueryClientProvider client={queryClient}>
        <div className="w-[300px] h-[400px] shadow-lg text-gray-800 font-sans relative flex flex-col select-none">
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

          {showSuccess && (
            <div
              className="
                absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                bg-white/20 px-2 py-2 shadow-md
                text-xs font-medium animate-fadeFloat pointer-events-none
              "
            >
              Đăng nhập thành công
            </div>
          )}
        </div>
      </QueryClientProvider>
    </AppProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Popup />);
