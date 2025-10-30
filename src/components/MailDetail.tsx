import { ArrowLeft, Globe, Send, Pencil } from "lucide-react";
import type { UserType } from "../types/userType";
import type { MessageType } from "../hooks/useMessageActions";

interface MailDetailProps {
  mode: "mailContent" | "sendMail";
  setMode: (mode: "default" | "mailContent" | "sendMail") => void;
  selectedMail: number;
  messages: MessageType[];
  editMode: boolean;
  setEditMode: (val: boolean) => void;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editContent: string;
  setEditContent: (val: string) => void;
  user: UserType;
  savingEdit: boolean;
  updateMessage: (id: string, title: string, content: string) => void;
  title: string;
  setTitle: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  receiverEmail: string;
  setReceiverEmail: (val: string) => void;
  isPublic: boolean;
  setIsPublic: (val: boolean) => void;
  handleSend: () => void;
  sending: boolean;
}

const MailDetail: React.FC<MailDetailProps> = ({
  mode,
  setMode,
  selectedMail,
  messages,
  editMode,
  setEditMode,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  user,
  savingEdit,
  updateMessage,
  title,
  setTitle,
  content,
  setContent,
  receiverEmail,
  setReceiverEmail,
  isPublic,
  setIsPublic,
  handleSend,
  sending,
}) => {
  if (mode === "mailContent") {
    const msg = messages[selectedMail];
    return (
      <div className="relative flex flex-col w-full">
        <div className="h-full bg-[url(/manga_paper_normal.png)] py-4 px-2 flex flex-col items-center gap-2 border w-full">
          {!editMode ? (
            <>
              <div className="text-sm font-bold">{msg.title}</div>
              <div
                className="text-xs border-t px-1 text-left whitespace-pre-line w-full flex-1 overflow-y-scroll hide-scrollbar mailContent pt-2"
                dangerouslySetInnerHTML={{ __html: msg.content }}
              />
            </>
          ) : (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border w-full px-2 py-1 mt-4 rounded outline-0 text-xs"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="border w-full h-40 px-2 py-1 text-xs rounded flex-1 outline-0 hide-scrollbar"
              />
              <div className="flex gap-2 mt-2 text-[10px]">
                <button
                  onClick={() => {
                    if (!editTitle.trim())
                      return alert("Tiêu đề không được để trống");
                    updateMessage(
                      msg._id,
                      editTitle,
                      editContent.replace(/\n/g, "<br>")
                    );
                    setEditMode(false);
                  }}
                  disabled={savingEdit}
                  className="border px-2 py-1 rounded bg-gray-500 hover:bg-gray-600 cursor-pointer text-xs text-white"
                >
                  {savingEdit ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="border px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 cursor-pointer text-xs"
                >
                  Hủy
                </button>
              </div>
            </>
          )}
        </div>
        <div className="absolute flex justify-between left-0 top-4 px-4 w-full">
          <ArrowLeft
            size={18}
            className="cursor-pointer hover:text-gray-700"
            onClick={() => setMode("default")}
          />
          {user.role === "admin" && !editMode && (
            <Pencil
              size={14}
              className="text-gray-600 hover:text-blue-500 cursor-pointer"
              onClick={() => {
                setEditMode(true);
                setEditTitle(msg.title);
                setEditContent(msg.content.replace(/<br>/g, "\n"));
              }}
            />
          )}
        </div>
      </div>
    );
  }

  if (mode === "sendMail") {
    return (
      <div className="relative flex flex-col gap-2 w-full p-3 border bg-[url(/manga_paper_normal.png)]">
        <ArrowLeft
          size={20}
          className="absolute left-1 top-1 cursor-pointer hover:text-gray-700"
          onClick={() => setMode("default")}
        />
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Soạn tin nhắn</h3>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`flex items-center gap-1 text-xs px-2 py-1 border rounded cursor-pointer ${
              isPublic ? "bg-gray-200 text-gray-800" : "bg-gray-400 text-white"
            }`}
          >
            <Globe size={14} /> {isPublic ? "Công khai" : "Riêng tư"}
          </button>
        </div>
        {!isPublic && (
          <input
            type="text"
            placeholder="Email người nhận"
            className="border px-2 py-1 text-xs rounded outline-0"
            value={receiverEmail}
            autoComplete="off"
            onChange={(e) => setReceiverEmail(e.target.value)}
          />
        )}
        <input
          type="text"
          placeholder="Tiêu đề"
          className="border px-2 py-1 text-xs rounded outline-0"
          value={title}
          autoComplete="off"
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Nội dung"
          className="border w-full h-40 px-2 py-1 text-xs rounded flex-1 outline-0"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center justify-center gap-1 border rounded px-3 py-1 text-xs bg-white hover:bg-gray-100 cursor-pointer"
        >
          <Send size={12} /> {sending ? "Đang gửi..." : "Gửi"}
        </button>
      </div>
    );
  }

  return null;
};

export default MailDetail;
