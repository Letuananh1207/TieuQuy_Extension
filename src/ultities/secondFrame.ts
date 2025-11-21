/**
 * Gửi tín hiệu mở iframe preview ảnh
 * @param imageUrl URL ảnh cần hiển thị
 * @param position 'left' | 'right' (mặc định 'right')
 */
export function sendOpenImagePreviewMessage(
  imageUrl: string,
  position: "left" | "right" = "right"
) {
  // Lấy tab đang active
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    // Gửi message tới content script của tab đó
    chrome.tabs.sendMessage(
      tabId,
      {
        type: "OPEN_IMAGE_PREVIEW",
        imageUrl,
        position,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
          return;
        }
        if (response?.ok) {
          console.log("OPEN_IMAGE_PREVIEW message sent successfully");
        } else {
          console.warn("OPEN_IMAGE_PREVIEW message not acknowledged");
        }
      }
    );
  });
}
