// ==========================
// 🧠 Background Service Worker
// ==========================
// const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = "https://tieuquyhantuluc.onrender.com";

console.log("🚀 [Background] Đang khởi động service worker...");

// Khi cài đặt hoặc cập nhật
chrome.runtime.onInstalled.addListener((details) => {
  console.log("JP ChatBuddy background script loaded ✅");

  if (details.reason === "install") {
    chrome.storage.local.set({ tutorialShown: false }, () => {
      console.log("🎉 Extension mới cài — tutorial chưa xem");
    });
    chrome.tabs.create({ url: chrome.runtime.getURL("tutorial.html") });
  }

  if (details.reason === "update") {
    const currentVersion = chrome.runtime.getManifest().version;
    const prev = details.previousVersion || "0.0.0";
    if (currentVersion.split(".")[0] !== prev.split(".")[0]) {
      chrome.storage.local.set({ tutorialShown: false });
      console.log(`🔁 Update lớn: ${prev} → ${currentVersion}`);
    }
  }
});

const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("📩 [Background] Nhận message:", msg);

  // ===============================
  // 📦 Lấy trạng thái user
  // ===============================
  if (msg.type === "GET_USER_STATUS") {
    console.log("🔍 [GET_USER_STATUS] Bắt đầu kiểm tra...");

    chrome.storage.local.get(
      ["token", "user", "lastChecked"],
      async ({ token, user, lastChecked }) => {
        const now = Date.now();

        // ✅ Nếu có cache hợp lệ
        if (user && now - (lastChecked || 0) < CACHE_DURATION) {
          console.log("📦 Dùng cache user:", user.email || "(ẩn)");
          sendResponse(user);
          return;
        }

        if (!token) {
          console.warn("⚠️ Không có token → user null");
          sendResponse(null);
          return;
        }

        try {
          const res = await fetch(`${API_BASE_URL}/api/current_user`, {
            headers: { Authorization: "Bearer " + token },
          });

          // Trường hợp API trả về HTML lỗi (VD: 404, redirect)
          const text = await res.text();
          try {
            const newUser = JSON.parse(text);

            if (newUser.error) {
              console.warn("❌ Token không hợp lệ:", newUser.error);
              chrome.storage.local.remove(["token", "user", "lastChecked"]);
              sendResponse(null);
              return;
            }

            console.log("✅ Nhận user hợp lệ:", newUser.email);

            // Tính ngày premium còn lại
            if (newUser.premium && newUser.premium.expiresAt) {
              const remaining =
                Math.ceil(
                  (new Date(newUser.premium.expiresAt) - new Date()) /
                    (1000 * 60 * 60 * 24)
                ) || 0;
              newUser.premium.remainingDays = remaining;
              newUser.premium.active = remaining > 0;
            }

            // Lưu cache
            chrome.storage.local.set({ user: newUser, lastChecked: now }, () =>
              console.log("💾 Cache user mới vào local storage.")
            );

            sendResponse(newUser);
          } catch {
            console.error("❌ Phản hồi không phải JSON:", text.slice(0, 100));
            sendResponse(null);
          }
        } catch (err) {
          console.error("💥 Lỗi khi gọi API current_user:", err);
          sendResponse(null);
        }
      }
    );

    return true; // Giữ sendResponse async
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
  // 🎓 Tutorial
  // ===============================
  if (msg.type === "CHECK_TUTORIAL_STATUS") {
    chrome.storage.local.get("tutorialShown", (data) => {
      sendResponse({ tutorialShown: data.tutorialShown ?? false });
    });
    return true;
  }

  if (msg.type === "COMPLETE_TUTORIAL") {
    chrome.storage.local.set({ tutorialShown: true }, () => {
      console.log("✅ User đã hoàn tất tutorial");
      sendResponse({ success: true });
    });
    return true;
  }

  // ===============================
  // 🚫 Nếu không khớp message nào
  // ===============================
  console.warn("⚠️ Không có listener cho message:", msg.type);
  sendResponse(null);
  return true;
});
