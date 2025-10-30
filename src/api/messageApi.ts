// src/api/messageApi.ts
const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/messages"; // nếu dùng Vite

export const messageApi = {
  async getAll(userId?: string) {
    const query = userId ? `?userId=${userId}` : "";
    const res = await fetch(`${API_URL}${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Không thể lấy tin nhắn.");
    return data.data;
  },

  async send(payload: {
    sendUser: string;
    receiveEmail: string | null;
    title: string;
    content: string;
    public: boolean;
  }) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gửi thất bại.");
    return data.data;
  },

  async delete(id: string) {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Không thể xóa.");
    return data.data;
  },

  async update(id: string, payload: { title: string; content: string }) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cập nhật thất bại.");
    return data.data;
  },
};
