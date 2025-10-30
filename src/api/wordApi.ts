// src/api/wordApi.ts
import api from "./client";
import type { HanziData } from "../types/HanziData";

export const getHanziData = {
  search: async (query: string): Promise<HanziData> => {
    const res = await api.get(`/api/words/char/${query}`);
    return res.data;
  },

  check: async (word: string): Promise<string[]> => {
    const res = await api.get(`/api/words?word=${encodeURIComponent(word)}`);
    return res.data.valid; // dựa theo controller trả về { original, valid }
  },
};
