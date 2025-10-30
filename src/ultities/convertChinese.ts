import { Converter } from "opencc-js";

// Chuyển Phồn thể → Giản thể
export const toSimplified = (input: string) => {
  const converter = Converter({ from: "tw", to: "cn" });
  return converter(input);
};

// Chuyển Giản thể → Phồn thể
export const toTraditional = (input: string) => {
  const converter = Converter({ from: "cn", to: "tw" });
  return converter(input);
};
