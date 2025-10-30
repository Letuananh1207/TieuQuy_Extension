// Library.tsx
import { useEffect, useState } from "react";
import {
  getLibrary,
  removeFromLibrary,
  exportStorageToExcel,
} from "../ultities/storage";
import { BookOpen, Trash2 } from "lucide-react";
import FlashCard from "./FlashCard";
import type { CardType } from "../types/cardType";
const Library: React.FC = () => {
  const [library, setLibrary] = useState<CardType[]>([
    { name: "你", mean: "Bạn, anh, chị, mày", hanviet: "Nhĩ" },
    { name: "好", mean: "Tốt", hanviet: "Hảo" },
    { name: "先", mean: "Trước", hanviet: "Tiên" },
    { name: "生", mean: "Sinh", hanviet: "Sinh" },
  ]);
  const [libraryMode, setLibraryMode] = useState<
    "default" | "flashcard" | "excel"
  >("default");

  const [showAlert, setShowAlert] = useState(false);
  const [pendingWord, setPendingWord] = useState<string | null>(null);

  const tabMap = {
    flashcard: (
      <FlashCard
        characters={library}
        callback={() => setLibraryMode("default")}
      />
    ),
    excel: (
      <FlashCard
        characters={library}
        callback={() => setLibraryMode("default")}
      />
    ),
  };

  const removeWord = (word: string) => {
    setPendingWord(word);
    setShowAlert(true); // chỉ hiển thị alert trước
  };

  const confirmRemove = async () => {
    if (pendingWord) {
      await removeFromLibrary(pendingWord);
    }
    setShowAlert(false);
    setPendingWord(null);
  };

  const cancelRemove = () => {
    setShowAlert(false);
    setPendingWord(null);
  };

  const exportExcel = async () => {
    await exportStorageToExcel();
  };

  useEffect(() => {
    (async () => {
      const savedLibrary = await getLibrary();
      setLibrary(savedLibrary);
    })();
  }, [pendingWord]);

  return library.length > 0 ? (
    <div className="w-full h-full">
      {/* Man hinh default */}
      {libraryMode === "default" && (
        <div className="relative w-full h-full pl-2 pr-4 pt-2 pb-2 ">
          <div className="h-full flex flex-col gap-x-3 gap-y-4 overflow-y-auto hide-scrollbar">
            {library.map((hanzi) => (
              <div className="w-full flex justify-start gap-2" key={hanzi.name}>
                <div
                  className="w-10 h-12 border text-xl flex justify-center items-center rounded-md bg-[url('/manga_paper_center.png')] bg-cover mx-auto"
                  key={hanzi.name}
                >
                  {hanzi.name}
                </div>
                <div className="relative flex-1 h-full border flex flex-col px-2 justify-center">
                  <div className="uppercase text-sm font-bold">
                    {hanzi.hanviet}
                  </div>
                  <div className="text-sm">{hanzi.mean}</div>
                  <div
                    className="absolute h-full right-0 top-0 border-l px-1 flex items-center cursor-pointer bg-gray-200 hover:bg-gray-100"
                    onClick={() => removeWord(hanzi.name)}
                  >
                    <Trash2 size={14} color="gray" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute -left-15 top-3/5 -translate-y-1/2 flex flex-col items-center gap-2 text-[10px] font-bold w-14">
            <a
              className="bg-white w-full text-center py-1 hover:bg-gray-400 cursor-pointer"
              onClick={() => setLibraryMode("flashcard")}
            >
              Flashcard
            </a>
            <a
              className="bg-white w-full text-center py-1 hover:bg-gray-400 cursor-pointer"
              onClick={exportExcel}
            >
              Xuất excel
            </a>
          </div>
          {showAlert && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="bg-white border rounded-xl shadow-lg p-2 w-32 text-center">
                <div className="font-semibold text-base mb-2">Thông báo</div>
                <div className="mb-2 text-xs">Bạn có muốn xóa từ này?</div>
                <div className="flex justify-center gap-3 text-[10px]">
                  <button
                    className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    onClick={cancelRemove}
                  >
                    Hủy
                  </button>
                  <button
                    className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    onClick={confirmRemove}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {libraryMode !== "default" && tabMap[libraryMode]}
    </div>
  ) : (
    <div className="h-full w-full flex flex-col justify-center items-center text-gray-500">
      <BookOpen size={32} color="gray" />
      Trống trơn
    </div>
  );
};

export default Library;
