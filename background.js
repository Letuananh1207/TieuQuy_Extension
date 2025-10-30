// ==========================
// 🧠 Background Service Worker
// ==========================
const API_BASE_URL = "https://tieuquyhantuluc.onrender.com";

chrome.runtime.onInstalled.addListener((details) => {
  console.log("JP ChatBuddy background script loaded ✅");

  // 🆕 Khi extension được cài đặt lần đầu
  if (details.reason === "install") {
    chrome.storage.local.set({ tutorialShown: false }, () => {
      console.log("🎉 Extension mới cài — đánh dấu tutorial chưa xem");
    });

    // 👉 Mở trang hướng dẫn (tuỳ chọn)
    chrome.tabs.create({ url: chrome.runtime.getURL("tutorial.html") });
  }

  // ⚙️ Nếu là bản cập nhật lớn, reset hướng dẫn (nếu cần)
  if (details.reason === "update") {
    const currentVersion = chrome.runtime.getManifest().version;
    const previousVersion = details.previousVersion || "0.0.0";

    if (currentVersion.split(".")[0] !== previousVersion.split(".")[0]) {
      chrome.storage.local.set({ tutorialShown: false }, () => {
        console.log(
          `🔁 Cập nhật lớn từ ${previousVersion} → ${currentVersion} — reset tutorial`
        );
      });
    }
  }
});

const isMessageRead = async (id) => {
  if (!id) return false;
  return new Promise((resolve) => {
    chrome.storage.local.get("read_messages", (result) => {
      const messages = result.read_messages || [];
      const read = messages.some((m) => m.id === id);
      resolve(read);
    });
  });
};

const CACHE_DURATION = 5 * 1000; // 5 phút

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // ===============================
  // 📦 Lấy trạng thái user
  // ===============================
  // ===============================
  // 📦 GET_USER_STATUS có log chi tiết
  // ===============================
  if (msg.type === "GET_USER_STATUS") {
    chrome.storage.local.get(
      ["token", "user", "lastChecked"],
      function (result) {
        var token = result.token;
        var user = result.user;
        var lastChecked = result.lastChecked;
        var now = Date.now();

        // 🧩 Hàm kiểm tra đã đọc
        const isMessageRead = async (id) => {
          if (!id) return false;
          return new Promise((resolve) => {
            chrome.storage.local.get("read_messages", (result) => {
              const messages = result.read_messages || [];
              const read = messages.some((m) => String(m.id) === String(id));
              console.log("🔍 [isMessageRead] Kiểm tra:", id);
              console.log("📜 Danh sách read_messages:", messages);
              console.log("📬 Kết quả kiểm tra =", read);
              resolve(read);
            });
          });
        };

        // 🧠 Hàm xử lý người dùng
        const handleUser = async (u) => {
          console.log("🧠 ---- BẮT ĐẦU KIỂM TRA USER ----");
          console.log("👤 User:", u.email || "(ẩn)");
          console.log("💬 latestMessage =", u.latestMessage);

          if (u.latestMessage) {
            const read = await isMessageRead(u.latestMessage);
            u.needUpdate = !read;
            console.log(
              `📊 Kết quả: latestMessage=${u.latestMessage}, isRead=${read}, needUpdate=${u.needUpdate}`
            );
          } else {
            console.log("⚠️ latestMessage không tồn tại → needUpdate=false");
            u.needUpdate = false;
          }

          chrome.storage.local.set({ user: u, lastChecked: now }, function () {
            console.log("✅ Đã cập nhật user vào local storage:", u.needUpdate);
            console.log("🧠 ---- KẾT THÚC KIỂM TRA USER ----");
            sendResponse(u);
          });
        };

        // ⚙️ Cache còn hạn
        if (user && now - (lastChecked || 0) < CACHE_DURATION) {
          console.log("📦 Dùng cache user:", user.email || "(ẩn)");
          handleUser(user);
          return true;
        }

        // ❌ Không có token
        if (!token) {
          console.log("⚠️ Không có token, user null");
          sendResponse(null);
          return;
        }

        // 🌐 Gọi API backend
        fetch(`${API_BASE_URL}/api/current_user`, {
          headers: { Authorization: "Bearer " + token },
        })
          .then((res) => res.json())
          .then((newUser) => {
            if (newUser.error) {
              console.warn("❌ Token không hợp lệ hoặc hết hạn");
              chrome.storage.local.remove(["token", "user", "lastChecked"]);
              sendResponse(null);
              return;
            }

            if (newUser.premium && newUser.premium.expiresAt) {
              var remaining =
                Math.ceil(
                  (new Date(newUser.premium.expiresAt) - new Date()) /
                    (1000 * 60 * 60 * 24)
                ) || 0;
              newUser.premium.remainingDays = remaining;
              newUser.premium.active = remaining > 0;
            }

            handleUser(newUser);
          })
          .catch((err) => {
            console.error("Lỗi khi gọi /api/current_user:", err);
            sendResponse(null);
          });

        return true; // Giữ sendResponse async
      }
    );

    return true;
  }

  // ===============================
  // 🧹 Dọn cache khi logout
  // ===============================
  if (msg.type === "CLEAR_USER_CACHE") {
    chrome.storage.local.remove(["token", "user", "lastChecked"], () => {
      console.log("🧹 Đã xóa cache đăng nhập.");
      sendResponse({ success: true });
    });
    return true;
  }

  // ===============================
  // 🎓 Tutorial (Onboarding)
  // ===============================
  if (msg.type === "CHECK_TUTORIAL_STATUS") {
    chrome.storage.local.get("tutorialShown", (data) => {
      sendResponse({ tutorialShown: data.tutorialShown ?? false });
    });
    return true;
  }

  if (msg.type === "COMPLETE_TUTORIAL") {
    chrome.storage.local.set({ tutorialShown: true }, () => {
      console.log("✅ Người dùng đã hoàn tất tutorial");
      sendResponse({ success: true });
    });
    return true;
  }
});
