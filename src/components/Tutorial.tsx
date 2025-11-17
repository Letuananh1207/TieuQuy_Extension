// SpeechBubble.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TutorialProps {
  setShowTutorial: (status: boolean) => void;
}

const Tutorial: React.FC<TutorialProps> = ({ setShowTutorial }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    { image: "Step1.png", desc: "Bật extension ở thanh điều hướng" },
    { image: "Step2.png", desc: "Khởi động từ điển" },
    { image: "Step4.png", desc: "Bôi đen từ hoặc hán tự muốn học" },
    { image: "Step5.png", desc: "Màn hình tra cứu hiện ở góc phải màn hình" },
  ];

  const handleSlide = () => {
    if (currentIndex >= slides.length - 1) {
      setShowTutorial(false);
      chrome.runtime.sendMessage({ type: "COMPLETE_TUTORIAL" });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="absolute w-[300px] -left-12 h-full bg-black/35 flex justify-center items-center z-100"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-54 h-fit bg-[url(/manga_paper_normal.png)] border-2 border-double border-gray-400 p-3 flex flex-col items-center text-sm gap-3 shadow-sm"
      >
        <div className="font-bold">Hướng dẫn tân thủ</div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="text-xs flex flex-col items-center gap-2"
          >
            <div className="text-center">
              <span className="font-bold border-b">
                Bước {currentIndex + 1}:
              </span>{" "}
              {slides[currentIndex].desc}
            </div>
            <motion.img
              key={slides[currentIndex].image}
              src={`./${slides[currentIndex].image}`}
              alt="Minh họa"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="rounded-md shadow-md"
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-1 mt-2 w-full items-center">
          {slides.map((_, index) => (
            <button
              key={index}
              aria-label={`Chuyển tới bước ${index + 1}`}
              className={`border border-gray-400 rounded-full w-3 h-3 transition-transform ${
                currentIndex === index ? "bg-white scale-110" : "bg-gray-200"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
          <div className="flex-1" />
          <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.08 }}
            className="border border-gray-400 text-[10px] bg-white/80 hover:bg-gray-200 px-2 py-0.5 rounded-sm cursor-pointer"
            onClick={handleSlide}
          >
            {currentIndex !== slides.length - 1 ? "Tiếp tục" : "Bắt đầu"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Tutorial;
