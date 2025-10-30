// FlashCard.tsx
import { useState } from "react";
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import type { CardType } from "../types/cardType";

interface FlashCardProps {
  characters: CardType[];
  callback: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ characters, callback }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [isRotate, setIsRotate] = useState(false);
  const onLeftHandle = () => {
    if (cardIndex > 0) {
      setIsRotate(false);
      setCardIndex((prev) => prev - 1);
    }
  };
  const onRightHandle = () => {
    if (cardIndex < characters.length - 1) {
      setIsRotate(false);
      setCardIndex((prev) => prev + 1);
    }
  };
  return (
    <div className="relative w-full h-full py-2">
      <div className=" w-full h-full flex px-2 overflow-hidden">
        <div className="relative flex-1 mx-1" style={{ perspective: "1000px" }}>
          <div
            className={`relative w-full h-full transition-transform duration-500`}
            style={{
              transformStyle: "preserve-3d",
              transform: isRotate ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Mặt trước */}
            <div
              className="absolute w-full h-full flex justify-center items-center border border-gray-400 pb-2 rounded-2xl bg-white"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-red-700 text-4xl">
                {characters[cardIndex].name}
              </div>
            </div>

            {/* Mặt sau */}
            <div
              className="absolute w-full h-full flex justify-center items-center border border-gray-400 pb-2 rounded-2xl bg-white"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="flex w-36 flex-col text-2xl items-center gap-4 flex-wrap">
                <div>{characters[cardIndex].mean}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute w-54 h-[260px] rotate-[-2deg] translate-y-2 bg-gray-200 z-[-1] rounded-2xl"></div>
        <div className="absolute w-full flex justify-between items-center left-0 top-0 bottom-0">
          <CircleChevronLeft
            className={`bg-white cursor-pointer ${
              cardIndex === 0
                ? "fill-gray-200"
                : "fill-gray-700 hover:fill-gray-500"
            }`}
            color="white"
            size={32}
            onClick={onLeftHandle}
          />
          <CircleChevronRight
            className={`bg-white cursor-pointer ${
              cardIndex === characters.length - 1
                ? "fill-gray-200"
                : "fill-gray-700 hover:fill-gray-500"
            }`}
            color="white"
            size={32}
            onClick={onRightHandle}
          />
        </div>
        <div className="absolute left-0 bottom-8 flex justify-center w-full">
          <div
            className="border text-xs py-1 px-2 rounded-xl bg-gray-300 cursor-pointer"
            onClick={() => setIsRotate((prev) => !prev)}
          >
            Lật thẻ
          </div>
        </div>
        <div className="absolute bottom-2 -left-12 font-bold text-sm">
          {cardIndex + 1} / {characters.length}
        </div>
      </div>
      <div className="absolute left-[-3.75rem] top-3/5 -translate-y-1/2 flex flex-col items-center gap-2 text-[10px] font-bold w-14">
        <a
          className="bg-white w-full text-center py-1 hover:bg-gray-400 cursor-pointer"
          onClick={callback}
        >
          Quay lại
        </a>
      </div>
    </div>
  );
};

export default FlashCard;
