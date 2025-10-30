// SpeechBubble.tsx
import React from "react";

interface SpeechBubbleProps {
  text: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text }) => {
  return (
    <div className="relative bg-white border border-black rounded-xl p-3">
      {/* Nội dung */}
      <p className="text-black text-center text-xs">{text}</p>

      {/* Tail (đuôi) */}
      <div className="absolute -bottom-3 left-4 w-2 h-2 bg-white border-2 border-black rotate-45"></div>
    </div>
  );
};

export default SpeechBubble;
