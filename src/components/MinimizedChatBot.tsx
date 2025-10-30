// MinimizedChatBot.tsx
import React from "react";
import { Search } from "lucide-react";
import PinyinInputMini from "../components/PinyinInputMini";

interface MinimizedChatBotProps {
  onExpand?: () => void; //
}

const MinimizedChatBot: React.FC<MinimizedChatBotProps> = ({ onExpand }) => {
  return (
    <div
      className="h-[40px] w-[300px] flex gap-2 items-center cursor-pointer select-none relative bg-gray-100 pl-4"
      onClick={onExpand}
    >
      <Search size={20} color="gray" />
      <div className="pt-2">
        <PinyinInputMini />
      </div>
      <div className="flex-1"></div>
      <div className="border rounded-full bg-[url(./manga_paper_center.png)]">
        <img src="./char01.png" alt="BotImg" className="w-10" />
      </div>
    </div>
  );
};

export default MinimizedChatBot;
