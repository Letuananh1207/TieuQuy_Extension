import { useState, useEffect } from "react";
import {
  Circle,
  MoveRight,
  Brain,
  Languages,
  LibraryBig,
  BetweenHorizontalStart,
} from "lucide-react";

interface IntroduceProps {
  handleLogin: () => void;
  isLoading: boolean;
}

const Introduce: React.FC<IntroduceProps> = ({ handleLogin, isLoading }) => {
  const featureList = [
    { label: "3300 chữ Hán", icon: <Languages size={16} /> },
    { label: "Đầy đủ cách nhớ, nguồn gốc", icon: <Brain size={16} /> },
    { label: "Sổ tay cá nhân hóa", icon: <LibraryBig size={16} /> },
    {
      label: "Flash card, xuất file excel",
      icon: <BetweenHorizontalStart size={16} />,
    },
  ];

  const [index, setIndex] = useState(0);
  const [showFlash, setShowFlash] = useState(true);
  const [flashVisible, setFlashVisible] = useState(false);

  // Trigger fade-in khi mounted
  useEffect(() => {
    setFlashVisible(true);
    const timer = setTimeout(() => setShowFlash(false), 2000); // 2s flashscreen
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* FlashScreen */}
      {showFlash && (
        <div
          className={`absolute inset-0 flex flex-col justify-center items-center bg-[url(./manga_paper_center.png)] bg-center bg-cover z-50 transition-opacity duration-700 ${
            flashVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src="./search.png"
            alt="Icon"
            className="w-auto h-16 animate-spin-slow"
          />
        </div>
      )}

      {/* Giới thiệu */}
      <div className="relative w-full h-full flex flex-col justify-center items-center bg-[url(/manga_paper_center.png)] bg-center bg-cover pb-6">
        {/* Slide hiện tại */}
        {!showFlash && index === 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-base">
              <p>Chào mừng đến với</p>
              <p className="font-bold">Tiểu Quỷ Hán Tự Lục</p>
            </div>
            <img src="./introduce_p1.png" alt="Ảnh minh họa" />
          </div>
        )}

        {!showFlash && index === 1 && (
          <div className="flex flex-col items-center text-xs gap-6">
            <div className="flex flex-col items-center gap-1">
              <div className="font-bold text-base">Tiểu Quỷ Hán Tự Lục</div>
              <p className="text-xs text-center">
                Những gì bạn sẽ nhận được khi sử dụng:
              </p>
            </div>
            <ul className="text-[13px] flex flex-col gap-4">
              {featureList.map((item) => (
                <li key={item.label} className="flex items-center gap-4">
                  <span className="border rounded-full p-1 bg-black/10">
                    {item.icon}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!showFlash && index === 2 && (
          <div className="flex flex-col items-center text-xs gap-8">
            <div className="flex flex-col items-center gap-1">
              <div className="font-bold text-base">Tiểu Quỷ Hán Tự Lục</div>
              <p className="text-xs text-center">
                Đăng nhập để bắt đầu sử dụng:
              </p>
            </div>
            <div className="border p-1 rounded-full bg-white">
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin bg-white"></div>
              ) : (
                <img
                  src="./google_ic.svg"
                  alt="Google icon"
                  className="cursor-pointer "
                  onClick={handleLogin}
                />
              )}
            </div>
          </div>
        )}

        {/* Slide dot & button */}
        {!showFlash && (
          <div className="w-full absolute bottom-6 right-0 flex items-center justify-between px-3">
            <div className="w-1/3"></div>
            {index === 0 && (
              <div className="flex justify-center gap-2">
                <Circle size={12} fill="white" color="gray" />
                <Circle size={12} color="gray" />
              </div>
            )}
            {index === 1 && (
              <div className="flex justify-center gap-2">
                <Circle size={12} color="gray" />
                <Circle size={12} color="gray" fill="white" />
              </div>
            )}

            {[0, 1].includes(index) && (
              <button
                className="flex items-center gap-1 text-sm border rounded-2xl bg-black/20 px-3 hover:bg-black/40 cursor-pointer"
                onClick={() => setIndex((prev) => prev + 1)}
              >
                <span>{index === 0 ? "Tiếp tục" : "Bắt đầu"}</span>
                <MoveRight size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Introduce;
