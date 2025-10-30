// src/hooks/useWordQuery.ts
import { useQuery } from "@tanstack/react-query";
import { getHanziData } from "../api/wordApi";
import type { HanziData } from "../types/HanziData";

export const useSearchWords = (character: string) => {
  return useQuery<HanziData>({
    queryKey: ["hanzi", character], // Tên định danh cache (duy nhất) , tham số
    queryFn: () => getHanziData.search(character), // Hàm fetch
    enabled: !!character, // chỉ fetch khi có ký tự
    staleTime: 1000 * 60 * 10, // 10 phút
    gcTime: 1000 * 60 * 60, // 1 giờ
    retry: 1,
  });
};

export const useCheckWords = (word: string) => {
  return useQuery<string[]>({
    queryKey: ["checkWord", word],
    queryFn: async () => {
      if (!word) return [];
      const res = await getHanziData.check(word);
      return res; // string[]
    },
    enabled: false, // chỉ fetch khi gọi refetch
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
};
