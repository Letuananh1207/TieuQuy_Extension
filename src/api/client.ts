// src/api/client.ts
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // nếu dùng Vite
const api = axios.create({
  baseURL: API_BASE_URL, // ⚠️ đổi thành URL backend của bạn
  timeout: 5000,
});

export default api;
