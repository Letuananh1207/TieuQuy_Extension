import { useState, useEffect } from "react";
import { MailPlus } from "lucide-react";
import { useMessageActions } from "../hooks/useMessageActions";
import type { UserType } from "../types/userType";
import { addReadMessage, getReadMessages } from "../ultities/messageStorage";
import MailList from "./MailList";
import MailDetail from "./MailDetail";

const MailBox: React.FC<{ user: UserType }> = ({ user }) => {
  const {
    messages,
    loading,
    sending,
    savingEdit,
    sendMessage,
    deleteMessage,
    updateMessage,
  } = useMessageActions(user);

  const [mode, setMode] = useState<"default" | "mailContent" | "sendMail">(
    "default"
  );
  const [selectedMail, setSelectedMail] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [readIds, setReadIds] = useState<string[]>([]);

  // Lấy danh sách tin đã đọc
  useEffect(() => {
    const fetchRead = async () => {
      const readMessages = await getReadMessages();
      setReadIds(readMessages.map((m) => m.id));
    };
    fetchRead();
  }, [messages]);

  const openMail = async (index: number) => {
    const msg = messages[index];
    if (!msg) return;

    setSelectedMail(index);
    setMode("mailContent");

    try {
      await addReadMessage({
        id: msg._id,
        title: msg.title,
        readAt: new Date().toISOString(),
      });
      setReadIds((prev) => [...prev, msg._id]);
    } catch (error) {
      console.error("❌ Lỗi khi lưu tin nhắn đã đọc:", error);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) return alert("Vui lòng nhập đầy đủ");
    await sendMessage({ title, content, receiverEmail, isPublic });
    setTitle("");
    setContent("");
    setReceiverEmail("");
    setIsPublic(true);
    setMode("default");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full text-sm text-gray-500 bg-[url(/manga_paper_center.png)] bg-center bg-cover">
        Đang tải tin nhắn...
      </div>
    );

  return (
    <div className="h-full py-2 px-1 flex relative bg-[url(/manga_paper_center.png)] bg-center bg-cover">
      {mode === "default" && (
        <>
          <MailList
            messages={messages}
            readIds={readIds}
            user={user}
            onOpenMail={openMail}
            onDelete={deleteMessage}
          />
          {user.role === "admin" && (
            <MailPlus
              size={38}
              className="absolute bottom-6 right-2 cursor-pointer border bg-white rounded-full p-2 hover:bg-gray-500 hover:stroke-white"
              onClick={() => setMode("sendMail")}
            />
          )}
        </>
      )}

      {/* Chi tiết và soạn mail */}
      {mode !== "default" && (
        <MailDetail
          mode={mode}
          setMode={setMode}
          selectedMail={selectedMail}
          messages={messages}
          editMode={editMode}
          setEditMode={setEditMode}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editContent={editContent}
          setEditContent={setEditContent}
          user={user}
          savingEdit={savingEdit}
          updateMessage={updateMessage}
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          receiverEmail={receiverEmail}
          setReceiverEmail={setReceiverEmail}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          handleSend={handleSend}
          sending={sending}
        />
      )}
    </div>
  );
};

export default MailBox;
