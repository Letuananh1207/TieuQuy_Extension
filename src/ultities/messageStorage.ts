// messageStorage.ts
import { getStorage, setStorage, removeStorage } from "./storage";

// ----------------------------
// KIỂU DỮ LIỆU
// ----------------------------

export interface ReadMessage {
  id: string; // ID duy nhất của tin nhắn
  title?: string; // Tiêu đề hoặc nội dung ngắn
  sender?: string; // Người gửi
  readAt: string; // Thời điểm đã đọc (ISO string)
}

// ----------------------------
// HÀM QUẢN LÝ DANH SÁCH TIN ĐÃ ĐỌC
// ----------------------------

/**
 * Lưu lại 1 tin nhắn đã đọc
 */
export const addReadMessage = async (message: ReadMessage): Promise<void> => {
  if (!message?.id) return;

  const messages: ReadMessage[] =
    (await getStorage<ReadMessage[]>("read_messages")) || [];

  // Nếu tin này đã có rồi thì bỏ qua
  const exists = messages.some((m) => m.id === message.id);
  if (exists) {
    console.log(`⚠️ Tin nhắn '${message.id}' đã được lưu trước đó.`);
    return;
  }

  // Thêm tin mới
  messages.push({
    ...message,
    readAt: message.readAt || new Date().toISOString(),
  });

  await setStorage("read_messages", messages);
  console.log(`✅ Đã lưu tin nhắn đã đọc: ${message.id}`);
};

/**
 * Lấy danh sách tất cả tin nhắn đã đọc
 */
export const getReadMessages = async (): Promise<ReadMessage[]> => {
  return (await getStorage<ReadMessage[]>("read_messages")) || [];
};

/**
 * Kiểm tra xem 1 tin nhắn đã được đọc chưa
 */
export const isMessageRead = async (id: string): Promise<boolean> => {
  if (!id) return false;
  const messages: ReadMessage[] =
    (await getStorage<ReadMessage[]>("read_messages")) || [];
  return messages.some((m) => m.id === id);
};

/**
 * Xóa 1 tin nhắn khỏi danh sách đã đọc
 */
export const removeReadMessage = async (id: string): Promise<void> => {
  if (!id) return;
  const messages: ReadMessage[] =
    (await getStorage<ReadMessage[]>("read_messages")) || [];
  const updated = messages.filter((m) => m.id !== id);
  await setStorage("read_messages", updated);
  console.log(`🗑️ Đã xóa tin nhắn: ${id}`);
};

/**
 * Xóa toàn bộ lịch sử tin nhắn đã đọc
 */
export const clearAllReadMessages = async (): Promise<void> => {
  await removeStorage("read_messages");
  console.log("🧹 Đã xóa toàn bộ danh sách tin nhắn đã đọc.");
};
