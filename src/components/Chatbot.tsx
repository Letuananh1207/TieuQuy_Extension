import { useState, useEffect, useContext } from "react";
import { SquareCheck, Search, Star } from "lucide-react";
import { AppContext } from "../contexts/AppContext";
import Premium from "./Premium";
import ContentFlash from "./ContentFlash";
import CheckTab from "./CheckTab";
import Library from "./Library";
import Home from "./Home";
import MinimizedChatBot from "./MinimizedChatBot";
import { toSimplified } from "../ultities/convertChinese";

const ChatBot: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext chưa được cung cấp");
  const { activeTab, setActiveTab, setCharacter, setWord } = context;

  // Map tab
  const tabMap = {
    home: {
      name: "Home",
      component: <Home />,
    },
    search: { name: "", component: <ContentFlash /> },
    library: { name: "Sổ Tay", component: <Library /> },
    check: { name: "Nhiệm vụ hàng ngày", component: <CheckTab /> },
    userCheck: {
      name: "Yêu cầu nâng cấp",
      component: <></>,
    },
    mail: { name: "Hộp thư", component: <></> },
    premium: { name: "Premium", component: <Premium /> },
  };

  // Nhận tín hiệu từ contentScript gửi vào
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.minimized !== undefined) {
        setIsMinimized(event.data.minimized);
      }

      if (event.data?.type === "JP_CHAT_SELECTED_TEXT" && event.data.text) {
        const rawText = event.data.text.trim();

        // 🀄 Chỉ lấy ký tự tiếng Trung (bao gồm giản thể & phồn thể)
        const chineseOnly = rawText.replace(
          /[^\u4E00-\u9FFF\u3400-\u4DBF]/g,
          ""
        );

        if (chineseOnly.length > 0) {
          onSearch(toSimplified(chineseOnly).slice(0, 5));
          console.log("📩 Nhận text tiếng Trung:", chineseOnly);
        } else {
          console.log("⛔ Không có ký tự tiếng Trung hợp lệ, bỏ qua:", rawText);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Gửi tín hiệu ngược ra ngoài khi mở rộng từ trong iframe
  const handleExpand = () => {
    setIsMinimized(false);
    window.parent.postMessage({ minimized: false }, "*");
  };

  // Gửi tín hiệu ngược ra ngoài khi thu nhỏ từ trong iframe
  // const handleMinimize = () => {
  //   setIsMinimized(true);
  //   window.parent.postMessage({ minimized: true }, "*");
  // };

  const onSearch = (string: string) => {
    setWord(string);
    setCharacter(string[0]);
    setActiveTab("search");
  };
  if (isMinimized) {
    return <MinimizedChatBot onExpand={handleExpand} />;
  }

  return (
    <div className="relative h-[280px] w-[300px] flex items-center select-none">
      {/* Cột trái */}
      <div className="w-[60px] flex flex-col items-center bg-[url('/manga_paper.png')] gap-4 border-r-4 border-double bg-clip-padding h-full px-3 py-4">
        {activeTab === "home" ? (
          <>
            <Search
              size={32}
              color="white"
              className="border rounded-full p-1 bg-gray-600 "
            />
            <Star
              size={32}
              className="border rounded-full p-1 bg-white hover:stroke-gray-600 hover:bg-gray-600 hover:fill-white cursor-pointer "
              color="purple"
              fill="yellow"
              onClick={() => setActiveTab("library")}
            />
            <SquareCheck
              size={32}
              className="cursor-pointer border rounded-full p-1 bg-white  hover:stroke-gray-600 hover:bg-gray-600 hover:fill-white "
              color="white"
              fill="green"
              onClick={() => setActiveTab("check")}
            />
            {/* <Gem
              size={32}
              className="cursor-pointer border rounded-full p-1 bg-white  hover:stroke-gray-600 hover:bg-gray-600 hover:fill-white "
              color="purple"
              fill="#67e8f9"
              onClick={() => setActiveTab("premium")}
            /> */}
          </>
        ) : (
          <>
            {/* <CornerUpLeft
              size={32}
              className="cursor-pointer border rounded-full p-1 bg-white stroke-purple hover:bg-gray-600 hover:stroke-white "
              onClick={() => setActiveTab("home")}
            /> */}
            <div className="text-center text-sm">{tabMap[activeTab].name}</div>
          </>
        )}
      </div>

      {/* Nội dung tab */}
      {tabMap[activeTab].component}
    </div>
  );
};

export default ChatBot;
