// ==========================
// 🧩 Nhận tín hiệu từ popup
// ==========================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "ACTIVATE_CHATBUDDY":
      if (window.__JP_CHATBUDDY_ACTIVE__) return;
      window.__JP_CHATBUDDY_ACTIVE__ = true;
      initChatBuddyState();
      sendResponse({ active: true });
      break;

    case "DEACTIVATE_CHATBUDDY":
      if (!window.__JP_CHATBUDDY_ACTIVE__) return;
      stopChatBuddy();
      window.__JP_CHATBUDDY_ACTIVE__ = false;
      sendResponse({ active: false });
      break;

    case "GET_CHATBUDDY_STATUS":
      sendResponse({ active: !!window.__JP_CHATBUDDY_ACTIVE__ });
      break;

    // ==========================
    // 🖼️ Nhận tín hiệu mở iframe hiển thị ảnh
    // ==========================
    case "OPEN_IMAGE_PREVIEW":
      console.log("Đã nhận được tín hiệu");
      openImagePreview(message.imageUrl, message.position || "right");
      sendResponse({ ok: true });
      break;
  }
  return true;
});

// ==========================
// 🧱 Khởi tạo state nhưng không tạo iframe
// ==========================
function initChatBuddyState() {
  if (window.__JP_CHATBUDDY__) return;

  window.__JP_CHATBUDDY__ = {
    searchIcon: null,
    iframe: null,
    container: null,
    currentRange: null,

    // thêm vùng lưu iframe ảnh
    imageIframe: null,
    imageIframeContainer: null,
  };

  document.addEventListener("mouseup", handleTextSelect);
  window.addEventListener("scroll", updateIconPosition);
  window.addEventListener("resize", updateIconPosition);
  document.addEventListener("click", handleOutsideClick);
}

// ==========================
// 🚀 Tạo iframe khi nhấn icon search
// ==========================
function createIframe() {
  const state = window.__JP_CHATBUDDY__;
  if (state.iframe) return state.iframe;

  const container = document.createElement("div");
  container.id = "jp-chatbot-container";
  Object.assign(container.style, {
    position: "absolute",
    width: "300px",
    height: "280px",
    zIndex: "99999",
    display: "none",
  });
  document.body.appendChild(container);
  state.container = container;

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("dist/index.html");
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: white;
    box-shadow: 0 0 15px rgba(255,255,255,0.6), 0 0 25px rgba(0,0,0,0.4);
  `;
  container.appendChild(iframe);
  state.iframe = iframe;

  window.addEventListener("message", handleIframeMessage);

  return iframe;
}

// ==========================
// 🧹 Dọn dẹp
// ==========================
function stopChatBuddy() {
  const state = window.__JP_CHATBUDDY__;
  if (!state) return;

  state.container?.parentNode?.removeChild(state.container);
  state.searchIcon?.parentNode?.removeChild(state.searchIcon);
  state.imageIframeContainer?.parentNode?.removeChild(
    state.imageIframeContainer
  );

  document.removeEventListener("mouseup", handleTextSelect);
  document.removeEventListener("click", handleOutsideClick);
  window.removeEventListener("scroll", updateIconPosition);
  window.removeEventListener("resize", updateIconPosition);
  window.removeEventListener("message", handleIframeMessage);

  delete window.__JP_CHATBUDDY__;
}

// ==========================
// 📦 Các hàm phụ trợ
// ==========================
function handleIframeMessage(event) {
  const container = document.getElementById("jp-chatbot-container");
  if (event.data?.minimized !== undefined && container)
    container.style.height = event.data.minimized ? "40px" : "280px";
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

    state.searchIcon.onclick = () => {
      const iframe = createIframe();
      const rect = state.currentRange.getBoundingClientRect();
      state.container.style.top = `${rect.bottom + window.scrollY + 5}px`;
      state.container.style.left = `${rect.left + window.scrollX}px`;
      state.container.style.display = "block";

      const sendText = () => {
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            { type: "JP_CHAT_SELECTED_TEXT", text },
            "*"
          );
        }
      };

      if (!iframe.hasAttribute("data-loaded")) {
        iframe.onload = () => {
          iframe.setAttribute("data-loaded", "true");
          sendText();
        };
      } else {
        sendText();
      }

      state.searchIcon.style.display = "none";
      selection.removeAllRanges();
      state.currentRange = null;
    };
  } else {
    state.searchIcon?.style && (state.searchIcon.style.display = "none");
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

  Object.assign(state.searchIcon.style, { top: `${top}px`, left: `${left}px` });
}

// ==========================
// Ẩn iframe khi click ra ngoài
// ==========================
function handleOutsideClick(e) {
  const state = window.__JP_CHATBUDDY__;
  if (!state || !state.container) return;

  if (
    state.container.contains(e.target) ||
    state.searchIcon?.contains(e.target) ||
    state.imageIframeContainer?.contains(e.target)
  ) {
    return;
  }

  state.container.style.display = "none";
  state.imageIframeContainer &&
    (state.imageIframeContainer.style.display = "none");
}

// ==========================
// 🖼️ IFRAME HIỂN THỊ ẢNH (LEFT / RIGHT)
// ==========================
function openImagePreview(imageUrl, position = "right") {
  const state = window.__JP_CHATBUDDY__;
  if (!state || !state.container) return;

  // Tạo container nếu chưa có
  if (!state.imageIframeContainer) {
    const imgContainer = document.createElement("div");
    imgContainer.id = "jp-image-preview-container";

    Object.assign(imgContainer.style, {
      position: "absolute",
      width: "280px",
      height: "280px",
      zIndex: "99998",
      display: "none",
      background: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      overflow: "hidden",
    });

    document.body.appendChild(imgContainer);
    state.imageIframeContainer = imgContainer;

    const imgIframe = document.createElement("iframe");
    imgIframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    `;
    imgContainer.appendChild(imgIframe);
    state.imageIframe = imgIframe;
  }

  // Gán URL ảnh vào iframe preview
  state.imageIframe.src =
    chrome.runtime.getURL("dist/secondframe.html") +
    "?img=" +
    encodeURIComponent(imageUrl);

  // Lấy vị trí iframe chính
  const rect = state.container.getBoundingClientRect();

  state.imageIframeContainer.style.top = `${rect.top}px`;

  if (position === "left") {
    state.imageIframeContainer.style.left = `${rect.left - 270}px`;
  } else {
    state.imageIframeContainer.style.left = `${rect.right + 10}px`;
  }

  state.imageIframeContainer.style.display = "block";
}
