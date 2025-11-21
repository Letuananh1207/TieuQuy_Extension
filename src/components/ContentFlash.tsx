import {
  Play,
  Star,
  Search,
  Frown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect, useContext, useRef } from "react";
import { useSearchWords } from "../hooks/useWordQuery";
import React from "react";
import { AppContext } from "../contexts/AppContext";
import {
  addToLibrary,
  isInLibrary,
  removeFromLibrary,
} from "../ultities/storage";
import { countNguonGoc } from "../ultities/mission";

const ContentFlash: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState({
    cachNho: false,
    nguonGoc: false,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [exists, setExists] = useState(false);
  const appContext = useContext(AppContext);
  if (!appContext) return <div>Lỗi: AppContext chưa được khởi tạo!</div>;

  const {
    character,
    hanziData,
    setHanziData,
    word,
    setCharacter,
    setActiveTab,
  } = appContext;
  const { data, isFetching, isError } = useSearchWords(character);
  const [minhhoaMode, setMinhhoaMode] = useState<
    "default" | "cachNho" | "nguonGoc"
  >("cachNho");

  const navigationTarget = (mode: string) => {
    const currentIndex = [...word].indexOf(character);
    if (mode === "left") {
      return currentIndex === 0 ? null : [...word][currentIndex - 1];
    }
    return currentIndex === word.length - 1
      ? null
      : [...word][currentIndex + 1];
  };

  const onSearch = (character: string) => {
    setCharacter(character);
    setActiveTab("search");
  };

  const handleRemove = async (word: string) => {
    await removeFromLibrary(word);
    setExists(!exists);
  };

  const handleAdd = async (word: string, mean?: string, hanviet?: string) => {
    const card = { name: word, mean, hanviet };
    await addToLibrary(card);
    setExists(!exists);
  };

  useEffect(() => {
    if (data) setHanziData(data);
  }, [data, setHanziData]);

  useEffect(() => {
    (async () => {
      const result = await isInLibrary(character);
      setExists(result);
    })();
  }, [character]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
    setImageLoaded({
      cachNho: false,
      nguonGoc: false,
    });

    setMinhhoaMode("cachNho");
  }, [character]);

  if (isFetching)
    return (
      <div className="w-full h-full flex justify-center items-center gap-1 text-sm">
        <Search />
        搜索中...
      </div>
    );
  if (!hanziData || isError)
    return (
      <div className="w-full flex flex-col">
        <div className="w-full flex flex-col justify-center items-center gap-1 text-sm">
          <Frown />
          Không có dữ liệu để hiển thị.
          <div className="text-xs">(*Hán tự không thông dụng)</div>
        </div>
        {word !== character && (
          <div className="flex justify-center items-center mt-4 mb-1 mr-2 gap-1 text-[12px]">
            <ChevronLeft
              size={18}
              color="gray"
              fill="gray"
              onClick={() => {
                const target = navigationTarget("left");
                if (target) {
                  onSearch(target);
                }
              }}
              className={`border border-gray-300 p-0.5 rounded cursor-pointer transition
                ${
                  navigationTarget("left")
                    ? "hover:bg-gray-200"
                    : "opacity-50 cursor-not-allowed"
                }
              `}
            />
            {[...word].map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  if (item !== character) onSearch(item);
                }}
                className={`border border-gray-300 px-0.5 cursor-pointer ${
                  item === character
                    ? "bg-gray-400 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {item}
              </div>
            ))}

            <ChevronRight
              size={18}
              color="gray "
              fill="gray"
              onClick={() => {
                const target = navigationTarget("right");
                if (target) {
                  onSearch(target);
                }
              }}
              className={`border border-gray-300 p-0.5 rounded cursor-pointer transition
                ${
                  navigationTarget("right")
                    ? "hover:bg-gray-200"
                    : "opacity-50 cursor-not-allowed"
                }
              `}
            />
          </div>
        )}
      </div>
    );

  const minhhoaMap = {
    cachNho: hanziData?.cachnho_img && (
      <>
        {!imageLoaded.cachNho && (
          <div className="absolute inset-0 flex justify-center items-center bg-gray-100">
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={hanziData.cachnho_img}
          alt="Cách nhớ"
          onLoad={() => setImageLoaded((prev) => ({ ...prev, cachNho: true }))}
          onError={() => setImageLoaded((prev) => ({ ...prev, cachNho: true }))}
          className={`transition-opacity duration-300 ${
            imageLoaded.cachNho ? "opacity-100" : "opacity-0"
          }`}
        />
      </>
    ),

    nguonGoc: hanziData?.nguongoc_img && (
      <>
        {!imageLoaded.nguonGoc && (
          <div className="absolute inset-0 flex justify-center items-center bg-gray-100">
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={hanziData.nguongoc_img}
          alt="Nguồn gốc"
          onLoad={() => setImageLoaded((prev) => ({ ...prev, nguonGoc: true }))}
          onError={() =>
            setImageLoaded((prev) => ({ ...prev, nguonGoc: true }))
          }
          className={`transition-opacity duration-300 ${
            imageLoaded.nguonGoc ? "opacity-100" : "opacity-0"
          }`}
        />
      </>
    ),
  };

  // UI chính
  return (
    <div className="relative w-full h-full flex flex-col pl-2 pr-4 pb-2 pt-2">
      {/*  Header */}
      <div className="flex gap-2">
        <div className="relative px-3 py-3 border w-fit text-3xl bg-[url('/manga_paper_center.png')] bg-contain">
          {hanziData.character}
          <div className="absolute text-sm right-0 -bottom-0.5">
            {hanziData.phonthe}
          </div>
        </div>

        <div className="relative flex flex-1 py-1 pl-2 pr-1 border h-[62px]">
          {minhhoaMode === "default" ? (
            <>
              <div className="flex flex-1 flex-col justify-center text-base max-w-[139px]">
                <div className="uppercase font-bold">{hanziData.hanviet}</div>
                <div className="first-letter:uppercase text-sm truncate whitespace-nowrap overflow-hidden">
                  {Array.isArray(hanziData.meaning)
                    ? hanziData.meaning.join(", ")
                    : hanziData.meaning}
                </div>
              </div>
              <div
                className="absolute right-1"
                title={`${exists ? "Xóa-" : "Thêm+"}`}
              >
                <Star
                  size={18}
                  className={`cursor-pointer ${
                    exists ? "fill-yellow-400" : "hover:fill-yellow-400"
                  }`}
                  onClick={() =>
                    exists
                      ? handleRemove(character)
                      : handleAdd(
                          character,
                          hanziData.meaning.join(", "),
                          hanziData.hanviet
                        )
                  }
                />
              </div>
            </>
          ) : (
            <>
              {minhhoaMap[minhhoaMode]}
              <div
                className="absolute right-1"
                title={`${exists ? "Xóa-" : "Thêm+"}`}
              >
                <Star
                  size={14}
                  className={`cursor-pointer ${
                    exists ? "fill-yellow-400" : "hover:fill-yellow-400"
                  }`}
                  onClick={() =>
                    exists
                      ? handleRemove(character)
                      : handleAdd(
                          character,
                          hanziData.meaning.join(", "),
                          hanziData.hanviet
                        )
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>

      <hr className="my-2" />

      {/* Nội dung chính */}
      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto hide-scrollbar"
        ref={scrollRef}
      >
        {/* #1. Ý nghĩa */}
        {hanziData.meaning && (
          <div className="flex flex-col relative">
            <div className="flex items-center">
              {/* <span className="uppercase text-[10px] font-bold">
                [ {hanziData.hanviet} ]
              </span> */}
              <div className="flex-1"></div>
              <div id="tuGhep" className="text-sm font-bold self-end">
                #1. Ý nghĩa
              </div>
            </div>
            <div className="w-full text-xs border p-2 gap-x-2">
              <div className="flex gap-1 w-full">
                <span className="uppercase font-bold">{hanziData.hanviet}</span>
                <span>[{hanziData.pinyin}]</span>-
                <span> {hanziData.meaning.join(", ")}</span>
              </div>
            </div>
          </div>
        )}
        {/* #2. Cách nhớ */}
        {hanziData.cachnho_content && (
          <div className="flex flex-col relative">
            <div id="cachNho" className="text-sm font-bold self-start">
              #2. Cách nhớ
            </div>
            <div
              className="text-xs border p-2"
              dangerouslySetInnerHTML={{
                __html: hanziData.cachnho_content || "",
              }}
            />
            <div
              className="absolute right-0 -bottom-2 cursor-pointer p-0.5 bg-white border rounded-full border-gray-500"
              onClick={() => setMinhhoaMode("cachNho")}
            >
              <Play size={12} fill="black" />
            </div>
          </div>
        )}
        {/* #3. Nguồn gốc */}
        {hanziData.nguongoc_content && (
          <div className="flex flex-col relative">
            <div id="nguonGoc" className="text-sm font-bold self-end">
              #3. Nguồn gốc
            </div>
            <div
              className="text-xs border p-2"
              dangerouslySetInnerHTML={{
                __html: hanziData.nguongoc_content || "",
              }}
            />
            <div
              className="absolute right-0 -bottom-2 cursor-pointer p-0.5 bg-white border rounded-full border-gray-500"
              onClick={() => {
                setMinhhoaMode("nguonGoc");
                countNguonGoc(character);
              }}
            >
              <Play size={12} fill="black" />
            </div>
          </div>
        )}
        {word !== character && (
          <div className="flex justify-center items-center mt-4 mb-1 mr-2 gap-1 text-[12px]">
            <ChevronLeft
              size={18}
              color="gray"
              fill="gray"
              onClick={() => {
                const target = navigationTarget("left");
                if (target) {
                  onSearch(target);
                }
              }}
              className={`border border-gray-300 p-0.5 rounded cursor-pointer transition
                ${
                  navigationTarget("left")
                    ? "hover:bg-gray-200"
                    : "opacity-50 cursor-not-allowed"
                }
              `}
            />
            {[...word].map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  if (item !== character) onSearch(item);
                }}
                className={`border border-gray-300 px-0.5 cursor-pointer ${
                  item === character
                    ? "bg-gray-400 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {item}
              </div>
            ))}

            <ChevronRight
              size={18}
              color="gray "
              fill="gray"
              onClick={() => {
                const target = navigationTarget("right");
                if (target) {
                  onSearch(target);
                }
              }}
              className={`border border-gray-300 p-0.5 rounded cursor-pointer transition
                ${
                  navigationTarget("right")
                    ? "hover:bg-gray-200"
                    : "opacity-50 cursor-not-allowed"
                }
              `}
            />
          </div>
        )}
      </div>

      {/* Thanh mục lục bên trái */}
      <div className="absolute -left-14 top-3/5 -translate-y-1/2 flex flex-col items-center gap-2 text-[10px] font-bold w-13">
        <a
          href="#tuGhep"
          className="bg-white w-full text-center py-1 hover:bg-gray-400"
        >
          Ý nghĩa
        </a>
        <a
          href="#cachNho"
          className="bg-white w-full text-center py-1 hover:bg-gray-400"
        >
          Cách nhớ
        </a>
        <a
          href="#nguonGoc"
          className="bg-white w-full text-center py-1 hover:bg-gray-400"
        >
          Nguồn gốc
        </a>
      </div>
      <div className="absolute -left-14 top-4 w-13 flex flex-col items-center bg-white/60">
        <span>{character}</span>
        <span className="text-xs">là gì?</span>
      </div>
    </div>
  );
};

export default ContentFlash;
