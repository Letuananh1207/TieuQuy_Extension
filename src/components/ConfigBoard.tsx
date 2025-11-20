import { useState, useContext } from "react";
import {
  Search,
  Gem,
  LogOut,
  UserRoundCheck,
  Undo2,
  Star,
  SquareCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserType } from "../types/userType";
import { AppContext } from "../contexts/AppContext";
import Premium from "./Premium";
import UserCheck from "./UserCheck";
import Tutorial from "./Tutorial";
import Home from "./Home";
import Content from "./Content";
import Library from "./Library";
import CheckTab from "./CheckTab";
import MailBox from "./MailBox";

interface ConfigBoardProps {
  user: UserType;
  handleLogout: () => void;
  handleActive: () => void;
  handleDeActive: () => void;
  isActive: boolean;
  showTutorial: boolean;
  setShowTutorial: (status: boolean) => void;
}

const ConfigBoard: React.FC<ConfigBoardProps> = ({
  user,
  handleLogout,
  handleActive,
  handleDeActive,
  isActive,
  showTutorial,
  setShowTutorial,
}) => {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext chưa được cung cấp");
  const { activeTab, setActiveTab } = context;
  // Map tab
  const tabMap = {
    home: {
      name: "Home",
      component: (
        <Home
          user={user}
          showTutorial={showTutorial}
          handleActive={handleActive}
          handleDeActive={handleDeActive}
          isActive={isActive}
        />
      ),
    },
    search: { name: "Tra cứu", component: <Content /> },
    library: { name: "Sổ Tay", component: <Library /> },
    check: { name: "Nhiệm vụ hàng ngày", component: <CheckTab /> },
    premium: { name: "Đăng ký", component: <Premium user={user} /> },
    userCheck: {
      name: "Yêu cầu nâng cấp",
      component: <UserCheck user={user} />,
    },
    mail: { name: "Hộp thư", component: <MailBox user={user} /> },
  };

  const [showAlert, setShowAlert] = useState(false);

  const confirmLogout = () => {
    setShowAlert(false);
    handleLogout();
  };

  // ✨ Animation variants (paper-turn effect)
  // const variants = {
  //   initial: { opacity: 0, rotate: -2, scale: 0.98 },
  //   animate: { opacity: 1, rotate: 0, scale: 1 },
  //   exit: { opacity: 0, rotate: 2, scale: 0.98 },
  // };

  const variantsOff = {
    initial: { opacity: 1, x: 0, scale: 1, rotate: 0 },
    animate: { opacity: 1, x: 0, scale: 1, rotate: 0 },
    exit: { opacity: 1, x: 0, scale: 1, rotate: 0 },
  };

  return (
    <div className="h-full w-full flex relative overflow-hidden">
      {/* Sidebar */}
      <div className="w-12 flex flex-col items-center py-2 gap-4 border-r-2 border-double bg-[url(/manga_paper.png)] bg-clip-padding">
        <div className="relative">
          <img
            src={user.photo}
            alt="User"
            className="rounded-full w-8 border"
          />
          {user.premium?.active && (
            <Gem
              size={12}
              className="absolute -top-1 -left-1 -rotate-40"
              strokeWidth={1}
              fill="#ffc53d"
            />
          )}
        </div>

        {/* Sidebar buttons */}
        {activeTab === "home" ? (
          <>
            <Search
              size={30}
              color="white"
              className="border rounded-full p-1 bg-gray-600 "
              onClick={() => setActiveTab("home")}
            />
            <Star
              size={30}
              className="border rounded-full p-1 bg-white hover:stroke-gray-600 hover:bg-gray-600 hover:fill-white cursor-pointer "
              color="purple"
              fill="yellow"
              onClick={() => setActiveTab("library")}
            />
            <SquareCheck
              size={30}
              className="cursor-pointer border rounded-full p-1 bg-white  hover:stroke-gray-600 hover:bg-gray-600 hover:fill-white "
              color="white"
              fill="green"
              onClick={() => setActiveTab("check")}
            />
            {user.role === "admin" && (
              <UserRoundCheck
                size={30}
                className="border bg-white stroke-gray-600 rounded-full p-1 cursor-pointer hover:bg-gray-500 hover:stroke-white"
                onClick={() => setActiveTab("userCheck")}
              />
            )}

            <div className="flex-1" />
            <LogOut
              size={30}
              color="purple"
              className="border bg-white rounded-full p-1 cursor-pointer hover:bg-gray-500 hover:stroke-white"
              onClick={() => setShowAlert(true)}
            />
          </>
        ) : (
          <>
            <div className="text-center text-sm bg-white/50 rounded-md px-1 py-2">
              {tabMap[activeTab].name}
            </div>
            <div className="flex-1" />
            <Undo2
              size={28}
              onClick={() => setActiveTab("home")}
              className="border bg-white rounded-full p-1 cursor-pointer hover:bg-gray-500 hover:stroke-white"
            />
            {/* <div className="flex-1" /> */}
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 bg-[url(/manga_paper_center.png)] bg-center bg-cover relative perspective-1000">
        <AnimatePresence mode="wait">
          {tabMap[activeTab] && (
            <motion.div
              key={activeTab}
              variants={variantsOff}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0  bg-white"
            >
              {tabMap[activeTab].component}
            </motion.div>
          )}
        </AnimatePresence>

        {showTutorial && <Tutorial setShowTutorial={setShowTutorial} />}
      </div>

      {/* Alert */}
      {showAlert && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-black rounded-lg shadow-md p-3 w-36 text-center"
          >
            <div className="font-semibold text-sm mb-1">Thông báo</div>
            <div className="text-xs mb-3">Bạn có muốn thoát?</div>
            <div className="flex justify-center gap-2">
              <button
                className="px-2 py-1 text-xs rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                onClick={() => setShowAlert(false)}
              >
                Hủy
              </button>
              <button
                className="px-2 py-1 text-xs rounded border border-black bg-black text-white hover:bg-gray-800 cursor-pointer"
                onClick={confirmLogout}
              >
                Xác nhận
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ConfigBoard;
