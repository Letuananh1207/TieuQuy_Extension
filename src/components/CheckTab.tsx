// CheckTab.tsx
import { useState, useEffect } from "react";
import { Flame, Info } from "lucide-react";
import { type Mission, getMissionStatus, getStreak } from "../ultities/mission";
const CheckTab: React.FC = () => {
  const [checkList, setCheckList] = useState<Mission[]>([]);
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    const fetchMissions = async () => {
      const missions = await getMissionStatus();
      const mem_streak = await getStreak();
      setCheckList(missions);
      setStreak(mem_streak);
    };
    fetchMissions();
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="w-full flex flex-col mx-auto text-lg gap-3 px-4 pb-1">
        {checkList.map((item) => (
          <div key={item.id}>
            <label
              className="flex gap-4 flex-row-reverse items-center cursor-pointer"
              htmlFor={item.id}
            >
              <input
                className="
                    appearance-none w-5 h-5 mt-1 border-2 border-black rounded-sm cursor-pointer
                    checked:bg-black checked:border-black
                    flex items-center justify-center
                    transition-all duration-150
                    relative
                    checked:before:content-['✓']          /* dấu ✓ */
                    checked:before:text-white             /* màu trắng */
                    checked:before:text-[10px]            /* nhỏ lại */
                    checked:before:absolute               /* căn giữa */
                    checked:before:top-px              /* chỉnh nhẹ cho cân */
                    checked:before:left-1
                "
                checked={item.completed}
                id={item.id}
                type="checkbox"
              />
              <div className="flex-1">{item.name}</div>
            </label>
            {item.desc && <div className="text-xs">*{item.desc}</div>}
          </div>
        ))}
      </div>
      <div className="w-14 gap-1 absolute -left-15 top-4/5 -translate-y-1/2 flex justify-center items-center font-bold text-lg bg-white">
        <Flame size={16} fill="orange" />
        <span>{streak}</span>
      </div>
      <div className="w-14 absolute -left-13 bottom-11 -translate-y-1/2 flex justify-center cursor-pointer ">
        <span title="Hoàn thành ít nhất 3/4 nhiệm vụ hàng ngày để nhận 1 điểm nhiệt huyết.">
          <Info size={10} className="fill-gray-400" />
        </span>
      </div>
      {/* <div className="absolute text-[10px] top-1 right-0 flex items-center gap-1">
        <RotateCw size={8} />
        8h00 AM
      </div> */}
    </div>
  );
};

export default CheckTab;
