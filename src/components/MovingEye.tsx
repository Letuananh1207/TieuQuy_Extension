import { useEffect, useState, type RefObject } from "react";
import { motion, useAnimation } from "framer-motion";

interface MovingEyeProps {
  faceRef: RefObject<HTMLDivElement | null>;
}

const MovingEye: React.FC<MovingEyeProps> = ({ faceRef }) => {
  const controlsLeft = useAnimation();
  const controlsRight = useAnimation();
  const [isMoving, setIsMoving] = useState(false);
  useEffect(() => {
    let moveTimeout: ReturnType<typeof setTimeout>;

    const handleMouseMove = (e: MouseEvent) => {
      if (!faceRef.current) return;

      setIsMoving(true);
      clearTimeout(moveTimeout);

      const rect = faceRef.current.getBoundingClientRect();
      const faceCenterX = rect.left + rect.width / 2;
      const faceCenterY = rect.top + rect.height / 2;

      const offsetX = e.clientX - faceCenterX;
      const offsetY = e.clientY - faceCenterY;

      const maxMove = 4;
      const moveX = Math.max(-maxMove, Math.min(maxMove, offsetX / 40));
      const moveY = Math.max(-maxMove, Math.min(maxMove, offsetY / 40));

      controlsLeft.start({
        x: moveX - 1,
        y: moveY,
        transition: { duration: 0.1 },
      });
      controlsRight.start({
        x: moveX + 1,
        y: moveY,
        transition: { duration: 0.1 },
      });

      moveTimeout = setTimeout(() => setIsMoving(false), 3000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(moveTimeout);
    };
  }, [controlsLeft, controlsRight]);

  // 👁️ Chớp mắt ngẫu nhiên khi nghỉ
  useEffect(() => {
    if (isMoving) return;
    let isMounted = true;

    const blink = async (controls: any) => {
      while (isMounted && !isMoving) {
        const delay = Math.random() * 3000 + 1500;
        await new Promise((r) => setTimeout(r, delay));

        if (isMounted && !isMoving) {
          await controls.start({ scaleY: 0.2, transition: { duration: 0.08 } });
          await controls.start({ scaleY: 1, transition: { duration: 0.12 } });
        }
      }
    };

    blink(controlsLeft);
    blink(controlsRight);

    return () => {
      isMounted = false;
    };
  }, [isMoving, controlsLeft, controlsRight]);

  // Hành vi mắt tinh nghịch khi không di chuyển
  useEffect(() => {
    if (isMoving) return;
    let isMounted = true;

    const playfulEyeMove = async () => {
      while (isMounted && !isMoving) {
        // thời gian giữa các chuyển động
        const delay = Math.random() * 2500 + 1000;
        await new Promise((r) => setTimeout(r, delay));
        if (!isMounted || isMoving) break;

        // 🎲 chọn mẫu hành vi ngẫu nhiên
        const behavior = Math.random();

        let moveX = 0;
        let moveY = 0;
        let duration = 0.4;

        if (behavior < 0.3) {
          // Nhìn qua trái hoặc phải nhanh
          moveX = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 2);
          moveY = Math.random() * 1.5 - 0.75;
          duration = 0.25;
        } else if (behavior < 0.6) {
          // Nhìn lên hoặc xuống như đang tò mò
          moveX = Math.random() * 1.5 - 0.75;
          moveY = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2);
          duration = 0.35;
        } else if (behavior < 0.8) {
          // Đảo tròn nhẹ (di chuyển theo quỹ đạo)
          const angle = Math.random() * Math.PI * 2;
          moveX = Math.cos(angle) * 3;
          moveY = Math.sin(angle) * 2;
          duration = 0.5;
        } else {
          // Nhìn quanh 2 lần nhanh (tinh nghịch)
          for (let i = 0; i < 2; i++) {
            const dirX =
              (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 2);
            const dirY = Math.random() * 2 - 1;
            await Promise.all([
              controlsLeft.start({
                x: dirX - 1,
                y: dirY,
                transition: { duration: 0.15 },
              }),
              controlsRight.start({
                x: dirX + 1,
                y: dirY,
                transition: { duration: 0.15 },
              }),
            ]);
            await new Promise((r) => setTimeout(r, 100));
          }
          // Quay lại trung tâm
          await Promise.all([
            controlsLeft.start({ x: 0, y: 0, transition: { duration: 0.3 } }),
            controlsRight.start({ x: 0, y: 0, transition: { duration: 0.3 } }),
          ]);
          continue;
        }

        // Áp dụng chuyển động
        await Promise.all([
          controlsLeft.start({
            x: moveX - 1,
            y: moveY,
            transition: { duration, ease: "easeInOut" },
          }),
          controlsRight.start({
            x: moveX + 1,
            y: moveY,
            transition: { duration, ease: "easeInOut" },
          }),
        ]);

        // 1 chút thời gian trước khi quay lại trung tâm
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
        await Promise.all([
          controlsLeft.start({
            x: 0,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" },
          }),
          controlsRight.start({
            x: 0,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" },
          }),
        ]);
      }
    };

    playfulEyeMove();
    return () => {
      isMounted = false;
    };
  }, [isMoving, controlsLeft, controlsRight]);

  return (
    <div className="absolute flex justify-between w-[35px] pt-1">
      {/* Mắt trái */}
      <motion.div
        className="w-1 h-1 bg-black rounded-full"
        animate={controlsLeft}
        transition={{ duration: 0.2 }}
      />
      {/* Mắt phải */}
      <motion.div
        className="w-1 h-1 bg-black rounded-full"
        animate={controlsRight}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
};

export default MovingEye;
