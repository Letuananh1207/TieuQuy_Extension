import { Trash2 } from "lucide-react";
import type { UserType } from "../types/userType";
import type { MessageType } from "../hooks/useMessageActions";

interface MailListProps {
  messages: MessageType[];
  readIds: string[];
  user: UserType;
  onOpenMail: (index: number) => void;
  onDelete: (id: string) => void;
}

const MailList: React.FC<MailListProps> = ({
  messages,
  readIds,
  user,
  onOpenMail,
  onDelete,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg, i) => {
        const isRead = readIds.includes(msg._id);
        return (
          <div
            key={msg._id}
            onClick={() => onOpenMail(i)}
            className="relative flex flex-col gap-0.5 border text-xs px-2 py-3 bg-[url(/manga_paper_normal.png)] cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="flex justify-between items-center w-52 font-bold truncate">
              <span>{msg.title}</span>
              {!isRead && (
                <span className="absolute right-1 top-0 text-gray-500 text-sm">
                  ●
                </span>
              )}
            </div>
            <div
              className="w-56 text-xs line-clamp-2"
              dangerouslySetInnerHTML={{ __html: msg.content }}
            ></div>
            {user.role === "admin" && (
              <Trash2
                size={14}
                className="absolute right-1 bottom-1 text-gray-500 hover:text-red-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(msg._id);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MailList;
