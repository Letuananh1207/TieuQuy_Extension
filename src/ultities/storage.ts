// storage.ts
import type { CardType } from "../types/cardType";
import * as XLSX from "xlsx";

// ----------------------------
// HÀM CƠ BẢN
// ----------------------------

export const setStorage = async (key: string, value: any): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
};

export const getStorage = async <T = any>(
  key: string
): Promise<T | undefined> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => resolve(result[key]));
  });
};

export const removeStorage = async (key: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, () => resolve());
  });
};

// ----------------------------
// HÀM QUẢN LÝ THƯ VIỆN FLASHCARD
// ----------------------------

/**
 * Thêm 1 thẻ mới vào thư viện (nếu chưa tồn tại)
 */
export const addToLibrary = async (card: CardType): Promise<void> => {
  if (!card?.name) return;

  const library: CardType[] = (await getStorage<CardType[]>("library")) || [];

  // Kiểm tra nếu từ đã tồn tại (theo `name`)
  const exists = library.some((item) => item.name === card.name);
  if (!exists) {
    library.push(card);
    await setStorage("library", library);
    console.log(`✅ Đã thêm: ${card.name}`);
  } else {
    console.log(`⚠️ Từ '${card.name}' đã tồn tại trong thư viện.`);
  }
};

/**
 * Lấy danh sách toàn bộ thẻ trong thư viện
 */
export const getLibrary = async (): Promise<CardType[]> => {
  const library: CardType[] = (await getStorage<CardType[]>("library")) || [];
  return library;
};

/**
 * Xóa 1 thẻ khỏi thư viện
 */
export const removeFromLibrary = async (name: string): Promise<void> => {
  if (!name) return;

  const library: CardType[] = (await getStorage<CardType[]>("library")) || [];
  const updatedLibrary = library.filter((item) => item.name !== name);
  await setStorage("library", updatedLibrary);
  console.log(`🗑️ Đã xóa: ${name}`);
};

/**
 * Kiểm tra xem 1 thẻ có trong thư viện không
 */
export const isInLibrary = async (name: string): Promise<boolean> => {
  if (!name) return false;

  const library: CardType[] = (await getStorage<CardType[]>("library")) || [];
  return library.some((item) => item.name === name);
};

export const exportStorageToExcel = async (): Promise<void> => {
  try {
    const library = await getLibrary(); // Lấy danh sách thẻ

    if (!library || library.length === 0) {
      console.warn("⚠️ Không có dữ liệu để xuất.");
      return;
    }

    // Tạo dữ liệu bảng (đổi tiêu đề sang tiếng Việt)
    const rows = library.map((item) => ({
      "Hán tự": item.name || "",
      "Hán Việt": item.hanviet || "",
      "Ý nghĩa": item.mean || "",
    }));

    // Tạo worksheet và workbook
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Thư viện Hán tự");

    // Xuất file
    const now = new Date().toISOString().split("T")[0];
    const filename = `Thu_vien_Han_Tu_${now}.xlsx`;

    XLSX.writeFile(workbook, filename);
    console.log(`✅ Đã xuất file: ${filename}`);
  } catch (error) {
    console.error("❌ Lỗi khi xuất Excel:", error);
  }
};
