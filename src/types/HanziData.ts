// src/types/HanziData.ts
export interface HanziData {
  _id: string;
  character: string;
  pinyin?: string;
  phonthe?: string;
  hanviet: string;
  meaning: string[];
  cachnho_img?: string;
  cachnho_content: string;
  nguongoc_img?: string;
  nguongoc_content?: string;
  tughep: string[];
}
