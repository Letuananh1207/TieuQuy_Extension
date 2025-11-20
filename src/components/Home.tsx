import { useRef, useContext } from "react";
import { Mail, Gem, Zap, MessageCircleWarning } from "lucide-react";
import MovingEye from "./MovingEye";
import PinyinInput from "../components/PinyinInput";
import type { UserType } from "../types/userType";
import { AppContext } from "../contexts/AppContext";

interface HomeProps {
  user?: UserType;
  showTutorial?: boolean;
  handleActive?: () => void;
  handleDeActive?: () => void;
  isActive?: boolean;
}

const Home: React.FC<HomeProps> = ({
  user,
  showTutorial,
  isActive,
  handleActive,
  handleDeActive,
}) => {
  const faceRef = useRef<HTMLDivElement>(null);
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext chưa được cung cấp");
  const { setActiveTab } = context;
  return user?.premium?.plan ? (
    <div className="h-full w-full flex flex-col justify-center gap-2 items-center flex-1 bg-[url(/manga_paper_center.png)] bg-cover bg-no-repeat pr-4 pl-2 ">
      {/* Avatar */}
      <div className="relative w-full flex items-center justify-center">
        <div
          ref={faceRef}
          className="relative w-26 h-26 rounded-full border bg-white flex items-center justify-center overflow-hidden"
        >
          <img
            src={user?.premium?.active ? "./char01.png" : "char01_night.png"}
            alt="BotImg"
            className="w-full h-full object-cover rounded-full bg-[url('/manga_paper_center.png')]"
          />
          <MovingEye faceRef={faceRef} />
        </div>
      </div>
      <div className="flex flex-col gap-2 absolute right-4 top-4 z-50">
        <div className="relative">
          <Mail
            size={28}
            className="border border-gray-300 bg-white stroke-gray-600 rounded-full p-1 cursor-pointer hover:bg-gray-500 hover:stroke-white"
            onClick={() => setActiveTab("mail")}
          />
          {(user?.needUpdate || showTutorial) && (
            <div className="absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center rounded-full bg-gray-400 text-[9px] font-semibold"></div>
          )}
        </div>

        {!user?.premium?.active && (
          <Gem
            color="gray"
            size={28}
            className="border border-gray-300 bg-white rounded-full p-1 cursor-pointer hover:bg-gray-500 hover:fill-white hover:stroke-gray-500"
            onClick={() => setActiveTab("premium")}
          />
        )}
      </div>

      {/* Ô nhập liệu */}
      {user?.premium?.active ? (
        <>
          <div className="w-full">
            <PinyinInput />
          </div>
          <div className="flex text-xs w-full justify-end">
            <div className="flex items-center gap-1 text-[10px] mt-1">
              <div title="Chế độ search nhanh">
                <Zap
                  size={16}
                  fill="yellow"
                  className="stroke-gray-600 border border-gray-300 rounded-full bg-white p-0.5"
                  strokeWidth={1}
                />
              </div>
              {/* Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isActive} // ← HIỂN THỊ TRẠNG THÁI
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleActive && handleActive();
                    } else {
                      handleDeActive && handleDeActive();
                    }
                  }}
                />

                <div
                  className="
      w-7 h-3 rounded-md transition-colors
      bg-gray-400 peer-checked:bg-gray-700
    "
                ></div>

                <div
                  className="
      absolute top-0.5 left-0.5 w-2 h-2 bg-white rounded-sm 
      transition-transform peer-checked:translate-x-3
    "
                ></div>
              </label>
            </div>
          </div>
        </>
      ) : (
        user?.premium?.plan && (
          <div className="text-[10px] text-gray-500 text-center">
            <div className="font-bold">Cảm ơn bạn đã sử dụng sản phẩm</div>
            <div>
              *Để tiếp tục sử dụng mong bạn tiếp tục đăng ký để sử dụng lâu dài
            </div>
          </div>
        )
      )}
    </div>
  ) : (
    <div className="w-full h-full flex gap-2 justify-center items-center text-xs">
      <MessageCircleWarning />
      <div>Ký tự không hợp lệ</div>
    </div>
  );
};

export default Home;
