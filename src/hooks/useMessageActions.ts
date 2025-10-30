// src/hooks/useMessageActions.ts
import { useState, useEffect } from "react";
import { messageApi } from "../api/messageApi";
import type { UserType } from "../types/userType";

export interface MessageType {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

export const useMessageActions = (user: UserType | null) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // 📨 Lấy danh sách tin nhắn
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await messageApi.getAll(user?._id);
      setMessages(data);
    } catch (err) {
      console.error(err);
      alert("Không thể tải danh sách tin nhắn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ✉️ Gửi tin nhắn
  const sendMessage = async (payload: {
    title: string;
    content: string;
    receiverEmail: string | null;
    isPublic: boolean;
  }) => {
    if (!user?._id) return alert("Thiếu thông tin người gửi!");
    setSending(true);
    try {
      const data = await messageApi.send({
        sendUser: user._id,
        receiveEmail: payload.isPublic ? null : payload.receiverEmail,
        title: payload.title,
        content: payload.content,
        public: payload.isPublic,
      });
      await fetchMessages();
      return data;
    } catch (err: any) {
      alert(err.message || "Gửi thất bại.");
    } finally {
      setSending(false);
    }
  };

  // 🗑️ Xóa tin nhắn
  const deleteMessage = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa tin nhắn này?")) return;
    try {
      await messageApi.delete(id);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      alert("Đã xóa tin nhắn.");
    } catch (err: any) {
      alert(err.message || "Xóa thất bại.");
    }
  };

  // ✏️ Cập nhật tin nhắn
  const updateMessage = async (id: string, title: string, content: string) => {
    setSavingEdit(true);
    try {
      const data = await messageApi.update(id, { title, content });
      setMessages((prev) => prev.map((m) => (m._id === id ? data : m)));
      alert("Đã lưu thay đổi!");
    } catch (err: any) {
      alert(err.message || "Lỗi khi cập nhật.");
    } finally {
      setSavingEdit(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    savingEdit,
    fetchMessages,
    sendMessage,
    deleteMessage,
    updateMessage,
  };
};
