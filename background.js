// ==========================
// 🧠 Background Service Worker
// ==========================
const API_BASE_URL = "https://tieuquyhantuluc.onrender.com";

const isMessageRead = async (id) => {
  if (!id) return false;
  return new Promise((resolve) => {
    chrome.storage.local.get("read_messages", (result) => {
      const messages = result.read_messages || [];
      const read = messages.some((m) => m.id === id);

      // console.log("🔍 [isMessageRead] Kiểm tra:", id); // ⚠️ có thể lộ ID tin nhắn
      // console.log("📜 Danh sách read_messages:", messages); // ⚠️ có thể lộ dữ liệu nhạy cảm
      // console.log("📬 Kết quả kiểm tra =", read); // có thể OK, nhưng vẫn liên quan tin nhắn

      resolve(read);
    });
  });
};

const CACHE_DURATION = 3 * 5 * 1000; // 15 phút

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_USER_STATUS") {
    chrome.storage.local.get(
      ["token", "user", "lastChecked"],
      function (result) {
        var token = result.token;
        var user = result.user;
        var lastChecked = result.lastChecked;
        var now = Date.now();

        const isMessageRead = async (id) => {
          if (!id) return false;
          return new Promise((resolve) => {
            chrome.storage.local.get("read_messages", (result) => {
              const messages = result.read_messages || [];
              const read = messages.some((m) => String(m.id) === String(id));

              // console.log("🔍 [isMessageRead] Kiểm tra:", id); // ⚠️ nhạy cảm
              // console.log("📜 Danh sách read_messages:", messages); // ⚠️ nhạy cảm
              // console.log("📬 Kết quả kiểm tra =", read);

              resolve(read);
            });
          });
        };

        const handleUser = async (u) => {
          // console.log("🧠 ---- BẮT ĐẦU KIỂM TRA USER ----");
          // console.log("👤 User:", u.email || "(ẩn)"); // ⚠️ nhạy cảm
          // console.log("💬 latestMessage =", u.latestMessage); // ⚠️ nhạy cảm

          if (u.latestMessage) {
            const read = await isMessageRead(u.latestMessage);
            u.needUpdate = !read;
            // console.log(
            //   `📊 Kết quả: latestMessage=${u.latestMessage}, isRead=${read}, needUpdate=${u.needUpdate}`
            // ); // ⚠️ nhạy cảm
          } else {
            // console.log("⚠️ latestMessage không tồn tại → needUpdate=false");
            u.needUpdate = false;
          }

          chrome.storage.local.set({ user: u, lastChecked: now }, function () {
            // console.log("✅ Đã cập nhật user vào local storage:", u.needUpdate);
            // console.log("🧠 ---- KẾT THÚC KIỂM TRA USER ----");
            sendResponse(u);
          });
        };

        if (user && now - (lastChecked || 0) < CACHE_DURATION) {
          // console.log("📦 Dùng cache user:", user.email || "(ẩn)"); // ⚠️ nhạy cảm
          handleUser(user);
          return true;
        }

        if (!token) {
          // console.log("⚠️ Không có token, user null"); // ⚠️ nhạy cảm
          sendResponse(null);
          return;
        }

        fetch(`${API_BASE_URL}/api/current_user`, {
          headers: { Authorization: "Bearer " + token },
        })
          .then((res) => res.json())
          .then((newUser) => {
            if (newUser.error) {
              // console.warn("❌ Token không hợp lệ hoặc hết hạn"); // ⚠️ nhạy cảm
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
            // console.error("Lỗi khi gọi /api/current_user:", err); // có thể log an toàn
            sendResponse(null);
          });

        return true;
      }
    );

    return true;
  }

  if (msg.type === "CLEAR_USER_CACHE") {
    chrome.storage.local.remove(["token", "user", "lastChecked"], () => {
      // console.log("🧹 Đã xóa cache đăng nhập."); // OK, không nhạy cảm
      sendResponse({ success: true });
    });
    return true;
  }

  if (msg.type === "CHECK_TUTORIAL_STATUS") {
    chrome.storage.local.get("tutorialShown", (data) => {
      sendResponse({ tutorialShown: data.tutorialShown ?? false });
    });
    return true;
  }

  if (msg.type === "COMPLETE_TUTORIAL") {
    chrome.storage.local.set({ tutorialShown: true }, () => {
      // console.log("✅ Người dùng đã hoàn tất tutorial"); // OK
      sendResponse({ success: true });
    });
    return true;
  }
});
