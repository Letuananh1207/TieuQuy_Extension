// Premium.tsx
import { useState } from "react";
import { LucideCrown, Check, QrCode, MessageSquareMore } from "lucide-react";
const Premium: React.FC = () => {
  const packageDatas = [
    {
      key: "free",
      name: "3 ngày",
      description: "Không giới hạn",
      price: "Hiện tại",
      color: "bg-gray-600",
    },
    {
      key: "6thang",
      name: "6 tháng",
      description: "Không giới hạn",
      price: "249.999đ",
      color: "bg-yellow-600",
    },
    {
      key: "1nam",
      name: "1 năm (Best)",
      description: "Không giới hạn",
      price: "499.000đ",
      color: "bg-purple-600",
    },
  ];

  const [selectedOption, setselectedOption] = useState<"6thang" | "1nam">(
    "6thang"
  );
  return (
    <div className="relative w-full h-full bg-[url('/manga_paper_center.png')] bg-center bg-cover">
      <div className="w-full h-full flex flex-col items-stretch overflow-y-auto hide-scrollbar gap-2  px-4">
        {/* Tiêu đề */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="uppercase font-bold text-base">
            Tiểu quỷ Hán Tự Lục
          </div>
          <div className="text-[10px] flex gap-1">
            <div className="flex items-center">
              <Check size={12} />
              <span>3300 Hán tự</span>
            </div>
            <div className="flex items-center">
              <Check size={12} />
              <span>Nguồn gốc</span>
            </div>
            <div className="flex items-center">
              <Check size={12} />
              <span>Cách nhớ</span>
            </div>
          </div>
        </div>
        {/* Đăng ký */}
        <div
          id="upGrade"
          className="flex flex-col flex-1 w-full border-4 border-double bg-white py-3 px-4 gap-4"
        >
          {packageDatas.map((packageData) => (
            <div
              key={packageData.key}
              className="relative flex flex-col text-sm p-1 border gap-1 bg-white shadow cursor-pointer"
            >
              <div
                className={` absolute -top-2 -right-2 ${packageData.color} text-white text-[9px] px-2 py-[1px] rounded-full shadow`}
              >
                {packageData.price}
              </div>
              <div className="font-bold">{packageData.name}</div>
              <div className="text-[10px] text-gray-600">
                {packageData.description}
              </div>
              <div className="absolute right-1 bottom-1">
                {packageData.key === "free" && (
                  <input
                    readOnly
                    type="radio"
                    className=" cursor-pointer accent-gray-600"
                    checked
                  />
                )}
                {packageData.key === "1nam" && (
                  <LucideCrown size={18} fill="yellow" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Đăng ký */}
        <div className="flex flex-col gap-1">
          {/* Tiêu đề */}
          <div
            id="register"
            className="uppercase font-bold text-sm my-1 flex items-center gap-1"
          >
            <QrCode size={12} />
            <span>Đăng ký</span>
            <div className="flex-1"></div>
            <button
              className={`font-normal text-xs cursor-pointer px-0.5 rounded-sm transition-colors
                ${
                  selectedOption === "6thang"
                    ? "bg-gray-400 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-200"
                }
              `}
              onClick={() => setselectedOption("6thang")}
            >
              月
            </button>

            <button
              className={`font-normal text-xs cursor-pointer px-0.5 rounded-sm transition-colors
                ${
                  selectedOption === "1nam"
                    ? "bg-gray-400 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-200"
                }
              `}
              onClick={() => setselectedOption("1nam")}
            >
              年
            </button>
          </div>
          <div className="relative flex bg-white w-full border p-1 text-sm">
            <div className="h-full flex flex-1 flex-col gap-2 min-w-0">
              <div className="text-center font-bold">
                {selectedOption === "6thang" ? "6 tháng" : "1 năm"}
              </div>
              <div className="text-[10px] text-gray-400 font-bold px-1 break-all flex flex-col gap-0.5">
                Nội dung :
                <div className="text-black border p-1">
                  1213432_{selectedOption}
                </div>
              </div>
            </div>
            <img
              src="./qr-code.png"
              alt="qr-code"
              className="w-[96px] h-auto flex-shrink-0"
            />
          </div>
        </div>

        {/* Liên hệ */}
        <div className="flex flex-col gap-1">
          {/* Tiêu đề */}
          <div
            id="contact"
            className="uppercase font-bold text-sm my-1 flex items-center gap-1  border-b border-gray-400"
          >
            <div className="flex-1"></div>
            <MessageSquareMore size={12} />
            <span>Fanpage</span>
          </div>
          <div className="relative flex w-full py-2 px-2 justify-start items-center text-xs gap-2 bg-white border">
            <img
              src="./icons8-facebook.svg"
              alt="facebook_icon"
              className="w-6"
            />
            <div>
              Sau khi thanh toán hãy nhắn tin cho chúng tớ{" "}
              <a
                href="https://www.facebook.com/profile.php?id=100095412613765&locale=vi_VN"
                target="_blank"
                className="border-b font-bold"
              >
                tại đây nhé.
              </a>
            </div>
          </div>
        </div>

        {/* Mục lục */}
        {/* <div className="absolute left-[-3.75rem] top-3/5 -translate-y-1/2 flex flex-col items-center gap-2 text-[10px] font-bold w-14">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const container = document.querySelector(".overflow-y-auto");
              container?.scrollTo({ top: 0 });
            }}
            className="bg-white w-full text-center py-1 hover:bg-gray-400"
          >
            Gói
          </a>
          <a
            href="#register"
            className="bg-white w-full text-center py-1 hover:bg-gray-400"
          >
            Đăng ký
          </a>
          <a
            href="#contact"
            className="bg-white w-full text-center py-1 hover:bg-gray-400"
          >
            Fanpage
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default Premium;
