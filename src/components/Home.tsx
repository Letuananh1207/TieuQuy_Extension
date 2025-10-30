import { useRef } from "react";
import MovingEye from "./MovingEye";
import PinyinInput from "../components/PinyinInput";

const Home: React.FC = () => {
  const faceRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-full w-full flex flex-col justify-center gap-2 items-center flex-1 bg-[url(/manga_paper_center.png)] bg-contain pr-4 pl-2 ">
      {/* Avatar */}
      <div className="relative w-full flex items-center justify-center">
        <div
          ref={faceRef}
          className="relative w-26 h-26 rounded-full border bg-white flex items-center justify-center overflow-hidden"
        >
          <img
            src="./char01.png"
            alt="BotImg"
            className="w-full h-full object-cover rounded-full bg-[url('/manga_paper_center.png')]"
          />
          <MovingEye faceRef={faceRef} />
        </div>
      </div>

      {/* Ô nhập liệu */}
      <div className="w-full">
        <PinyinInput />
      </div>
    </div>
  );
};

export default Home;
