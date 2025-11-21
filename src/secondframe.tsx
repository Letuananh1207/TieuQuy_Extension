import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

export default function SecondFrame() {
  const [loading, setLoading] = useState(true);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  // Lấy URL từ query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("img");
    if (url) setImgUrl(url);
  }, []);

  if (!imgUrl) return null; // Không có ảnh thì render nothing

  return (
    <div className="w-[280px] h-[280px] flex justify-center items-center border overflow-hidden bg-black/30 relative">
      {/* Spinner khi đang tải ảnh */}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-white/40 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      <img
        src={imgUrl}
        alt="Hình ảnh bổ sung"
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}

// Render React
ReactDOM.createRoot(document.getElementById("root")!).render(<SecondFrame />);
