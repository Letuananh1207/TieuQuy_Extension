import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserType } from "../types/userType";
import {
  Inbox,
  Power,
  Crown,
  LogOut,
  PowerOff,
  UserRoundCheck,
  Undo2,
} from "lucide-react";
import Premium from "./Premium";
import MailBox from "./MailBox";
import UserCheck from "./UserCheck";
import Tutorial from "./Tutorial";

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
  const [mode, setMode] = useState<"home" | "premium" | "userCheck" | "mail">(
    "home"
  );
  const [showAlert, setShowAlert] = useState(false);

  const tagName = {
    home: "Trang chủ",
    premium: "Nâng cấp",
    userCheck: "Yêu cầu nâng cấp",
    mail: "Hộp thư",
  };

  const confirmLogout = () => {
    setShowAlert(false);
    handleLogout();
  };

  // ✨ Animation variants (paper-turn effect)
  const variants = {
    initial: { opacity: 0, scale: 0.95, rotateY: -10 },
    animate: { opacity: 1, scale: 1, rotateY: 0 },
    exit: { opacity: 0, scale: 0.95, rotateY: 10 },
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
            <Crown
              size={12}
              className="absolute -top-1 -left-1 -rotate-40"
              strokeWidth={1}
              fill="#ffc53d"
            />
          )}
        </div>

        {/* Sidebar buttons */}
        {mode === "home" ? (
          <>
            <Power
              size={30}
              className="border bg-gray-500 stroke-white rounded-full p-1 cursor-pointer hover:bg-gray-600"
              onClick={() => setMode("home")}
            />
            {user.role === "admin" && (
              <UserRoundCheck
                size={30}
                className="border bg-white stroke-gray-600 rounded-full p-1 cursor-pointer hover:bg-gray-500 hover:stroke-white"
                onClick={() => setMode("userCheck")}
              />
            )}
            <div className="relative">
              <Inbox
                size={30}
                className="border bg-white stroke-gray-600 rounded-full p-1 cursor-pointer hover:bg-gray-500 hover:stroke-white"
                onClick={() => setMode("mail")}
              />
              {(user.needUpdate || showTutorial) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center rounded-full bg-gray-400 text-[9px] font-semibold"></div>
              )}
            </div>
            {!user.premium?.active && (
              <Crown
                color="purple"
                size={30}
                className="border bg-white rounded-full p-1 cursor-pointer hover:bg-gray-500 hover:fill-white hover:stroke-gray-500"
                onClick={() => setMode("premium")}
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
              {tagName[mode]}
            </div>
            <div className="flex-1" />
            <Undo2
              size={28}
              onClick={() => setMode("home")}
              className="border bg-white rounded-full p-1 cursor-pointer hover:bg-gray-500 hover:stroke-white"
            />
            <div className="flex-1" />
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 bg-[url(/manga_paper_center.png)] bg-center bg-cover relative perspective-1000">
        <AnimatePresence mode="wait">
          {mode === "home" && (
            <motion.div
              key="home"
              variants={variants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {user.premium?.active ? (
                <div className="flex flex-col items-center gap-2">
                  {isActive ? (
                    <PowerOff
                      size={46}
                      color="gray"
                      onClick={handleDeActive}
                      className="rounded-full p-2 cursor-pointer bg-white shadow-sm border hover:bg-gray-50"
                    />
                  ) : (
                    <Power
                      size={46}
                      color="gray"
                      onClick={handleActive}
                      className="rounded-full p-2 cursor-pointer bg-white shadow-sm border hover:bg-gray-50"
                    />
                  )}
                  <div className="font-semibold text-sm">
                    {isActive ? "Tắt" : "Bật"}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Power
                    size={46}
                    color="gray"
                    className="rounded-full p-2 bg-white shadow-sm border"
                  />
                  <div className="text-xs">Gia hạn để tiếp tục sử dụng</div>
                </div>
              )}
            </motion.div>
          )}

          {mode === "premium" && (
            <motion.div
              key="premium"
              variants={variants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 overflow-y-scroll hide-scrollbar py-4"
            >
              <Premium />
            </motion.div>
          )}

          {mode === "userCheck" && (
            <motion.div
              key="userCheck"
              variants={variants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <UserCheck user={user} />
            </motion.div>
          )}

          {mode === "mail" && (
            <motion.div
              key="mail"
              variants={variants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <MailBox user={user} />
            </motion.div>
          )}
        </AnimatePresence>
        {showTutorial && <Tutorial setShowTutorial={setShowTutorial} />}
      </div>

      {/* Alert */}
      {showAlert && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
