// ==========================
// 🧩 Nhận tín hiệu từ popup
// ==========================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    // === BẬT ===
    case "ACTIVATE_CHATBUDDY":
      if (window.__JP_CHATBUDDY_ACTIVE__) {
        console.log("⚙️ JP ChatBuddy đã được kích hoạt trước đó ✅");
        return;
      }
      console.log("🔔 Nhận tín hiệu kích hoạt từ popup!");
      window.__JP_CHATBUDDY_ACTIVE__ = true;
      startChatBuddy();
      sendResponse({ active: true });
      break;

    // === TẮT ===
    case "DEACTIVATE_CHATBUDDY":
      if (!window.__JP_CHATBUDDY_ACTIVE__) {
        console.log("⚙️ JP ChatBuddy hiện đang tắt, bỏ qua.");
        return;
      }
      console.log("🔕 Nhận tín hiệu TẮT từ popup!");
      stopChatBuddy();
      window.__JP_CHATBUDDY_ACTIVE__ = false;
      sendResponse({ active: false });
      break;

    // === LẤY TRẠNG THÁI ===
    case "GET_CHATBUDDY_STATUS":
      console.log(
        "📡 Gửi lại trạng thái hiện tại:",
        window.__JP_CHATBUDDY_ACTIVE__
      );
      sendResponse({ active: !!window.__JP_CHATBUDDY_ACTIVE__ });
      break;

    default:
      break;
  }

  // Giúp sendResponse hoạt động async
  return true;
});

// ==========================
// 🚀 Hàm khởi động chính
// ==========================
function startChatBuddy() {
  console.log("JP ChatBuddy content script activated ✅");

  // Nếu đã tồn tại container thì không tạo lại
  if (document.getElementById("jp-chatbot-container")) {
    console.log("⚠️ Đã tồn tại container, bỏ qua khởi tạo mới.");
    return;
  }

  // Biến toàn cục (để có thể cleanup)
  window.__JP_CHATBUDDY__ = {
    searchIcon: null,
    iframe: null,
    container: null,
    currentRange: null,
  };

  const state = window.__JP_CHATBUDDY__;

  // 🧱 Tạo container
  const container = document.createElement("div");
  container.id = "jp-chatbot-container";
  Object.assign(container.style, {
    position: "fixed",
    bottom: "0px",
    right: "10px",
    width: "300px",
    height: "280px",
    zIndex: "99999",
  });
  document.body.appendChild(container);
  state.container = container;

  // 🪟 Thêm iframe React app
  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("dist/index.html");
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: white;
    box-shadow:
      0 0 15px rgba(255, 255, 255, 0.6),
      0 0 25px rgba(0, 0, 0, 0.4);
  `;
  container.appendChild(iframe);
  state.iframe = iframe;

  // 📩 Lắng nghe tín hiệu thu nhỏ/phóng to từ iframe
  window.addEventListener("message", handleIframeMessage);

  // 🎯 Lắng nghe chọn chữ
  document.addEventListener("mouseup", handleTextSelect);

  // 👂 Theo dõi scroll/resize để cập nhật icon
  window.addEventListener("scroll", updateIconPosition);
  window.addEventListener("resize", updateIconPosition);

  console.log("JP ChatBuddy injected ✅");
}

// ==========================
// 🧹 Hàm dọn dẹp khi tắt
// ==========================
function stopChatBuddy() {
  console.log("🧹 Tắt JP ChatBuddy và dọn dẹp DOM...");

  const state = window.__JP_CHATBUDDY__;
  if (!state) {
    console.log("⚠️ Không tìm thấy state, có thể đã dọn rồi.");
    return;
  }

  // Xóa container nếu còn
  if (state.container && state.container.parentNode)
    state.container.parentNode.removeChild(state.container);

  // Xóa icon tìm kiếm nếu có
  if (state.searchIcon && state.searchIcon.parentNode)
    state.searchIcon.parentNode.removeChild(state.searchIcon);

  // Gỡ event listeners
  window.removeEventListener("message", handleIframeMessage);
  document.removeEventListener("mouseup", handleTextSelect);
  window.removeEventListener("scroll", updateIconPosition);
  window.removeEventListener("resize", updateIconPosition);

  // Dọn global
  delete window.__JP_CHATBUDDY__;
  console.log("❌ JP ChatBuddy đã được tắt hoàn toàn.");
}

// ==========================
// 📦 Các hàm phụ trợ
// ==========================
function handleIframeMessage(event) {
  if (event.data?.minimized !== undefined) {
    const minimized = event.data.minimized;
    const container = document.getElementById("jp-chatbot-container");
    if (container) container.style.height = minimized ? "40px" : "280px";
  }
}

function handleTextSelect() {
  const state = window.__JP_CHATBUDDY__;
  if (!state || !window.__JP_CHATBUDDY_ACTIVE__) return;

  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (text && text.length > 0) {
    state.currentRange = selection.getRangeAt(0);

    if (!state.searchIcon) {
      const searchIcon = document.createElement("img");
      searchIcon.src = chrome.runtime.getURL("dist/search.png");
      Object.assign(searchIcon.style, {
        position: "absolute",
        cursor: "pointer",
        width: "32px",
        height: "32px",
        zIndex: 999999,
        background: "white",
        borderRadius: "50%",
        padding: "2px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        transition: "top 0.05s, left 0.05s",
      });
      document.body.appendChild(searchIcon);
      state.searchIcon = searchIcon;
    }

    updateIconPosition();
    state.searchIcon.style.display = "block";

    // Gửi text vào iframe khi click icon
    state.searchIcon.onclick = () => {
      if (state.iframe?.contentWindow) {
        state.iframe.contentWindow.postMessage(
          { type: "JP_CHAT_SELECTED_TEXT", text },
          "*"
        );
      }
      state.searchIcon.style.display = "none";
      selection.removeAllRanges();
      state.currentRange = null;
    };
  } else {
    if (state.searchIcon) state.searchIcon.style.display = "none";
    state.currentRange = null;
  }
}

function updateIconPosition() {
  const state = window.__JP_CHATBUDDY__;
  if (!state?.currentRange || !state?.searchIcon) return;

  const rect = state.currentRange.getBoundingClientRect();
  if (!rect || rect.width === 0) return;

  const top = rect.top + window.scrollY - 30;
  const left = rect.right + window.scrollX + 10;

  Object.assign(state.searchIcon.style, {
    top: `${top}px`,
    left: `${left}px`,
  });
}
