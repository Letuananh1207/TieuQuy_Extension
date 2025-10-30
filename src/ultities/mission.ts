import { getStorage, setStorage } from "./storage";

/* -------------------------
 🎯 Danh sách nhiệm vụ cố định
-------------------------- */
export interface Mission {
  id: string;
  name: string;
  desc: string;
  goal: number | boolean;
  type: "search" | "nguonGoc" | "overNight";
  progress: number;
  completed: boolean;
}

export const missionLists: Mission[] = [
  {
    id: "m1",
    name: "Ong nhỏ chăm chỉ",
    desc: "Đọc 10 hán tự",
    goal: 10,
    type: "search",
    progress: 0,
    completed: false,
  },
  {
    id: "m2",
    name: "Ong lớn chăm chỉ",
    desc: "Đọc 30 hán tự",
    goal: 30,
    type: "search",
    progress: 0,
    completed: false,
  },
  {
    id: "m3",
    name: "Nhà khảo cổ",
    desc: "Đọc và xem ảnh 5 nguồn gốc",
    goal: 5,
    type: "nguonGoc",
    progress: 0,
    completed: false,
  },
  {
    id: "m4",
    name: "Cú đêm",
    desc: "Tra cứu sau 12h đêm",
    goal: true,
    type: "overNight",
    progress: 0,
    completed: false,
  },
];

/* -------------------------
 🕗 Hỗ trợ bộ nhớ hằng ngày (tồn tại đến 8h sáng)
-------------------------- */
const getNext8AM = (): number => {
  const now = new Date();
  const next = new Date(now);
  if (now.getHours() >= 8) next.setDate(next.getDate() + 1);
  next.setHours(8, 0, 0, 0);
  return next.getTime();
};

const getDailyStorage = async <T>(key: string, defaultValue: T): Promise<T> => {
  const stored = (await getStorage<{ value: T; expireAt: number }>(key)) || {
    value: defaultValue,
    expireAt: 0,
  };
  if (Date.now() >= stored.expireAt) {
    await setStorage(key, { value: defaultValue, expireAt: getNext8AM() });
    return defaultValue;
  }
  return stored.value;
};

const setDailyStorage = async <T>(key: string, value: T): Promise<void> => {
  await setStorage(key, { value, expireAt: getNext8AM() });
};

/* -------------------------
 📊 Các hành động nhiệm vụ
-------------------------- */

// ✅ Đếm số từ đã search
export const countSearch = async (character: string): Promise<void> => {
  let characters = await getDailyStorage<string[]>("m_characters", []);
  if (!characters.includes(character)) {
    characters.push(character);
    await setDailyStorage("m_characters", characters);
  }
  console.log("🔍 Đã search", characters.length);

  // 🕛 Kiểm tra xem có phải ban đêm (0h - 4h59)
  const now = new Date();
  const hour = now.getHours();
  if (hour >= 0 && hour < 5) {
    const nightDone = await getDailyStorage<boolean>("m_overNight", false);
    if (!nightDone) {
      console.log("🌙 Đang trong khung giờ Cú đêm → gọi overNightSubmit()");
      await overNightSubmit();
    }
  }
};

// 📖 Đếm số lần xem nguồn gốc
export const countNguonGoc = async (character: string): Promise<void> => {
  let characters = await getDailyStorage<string[]>("m_nguonGoc", []);
  if (!characters.includes(character)) {
    characters.push(character);
    await setDailyStorage("m_nguonGoc", characters);
  }
  console.log("📖 Đã đọc nguồn gốc", characters.length);
};

// 🌙 Check tra cứu sau 12h đêm
export const overNightSubmit = async (): Promise<void> => {
  const now = new Date();
  const hour = now.getHours();

  // chỉ tính từ 0h đến 4h59
  if (hour >= 0 && hour < 5) {
    const done = await getDailyStorage<boolean>("m_overNight", false);
    if (!done) {
      await setDailyStorage("m_overNight", true);
      console.log("🌙 Đã hoàn thành nhiệm vụ Cú đêm");
    }
  }
};

/* -------------------------
 🧾 Hàm tổng hợp: trả về danh sách nhiệm vụ + trạng thái
-------------------------- */
export const getMissionStatus = async () => {
  const [characters, nguonGoc, overNight] = await Promise.all([
    getDailyStorage<string[]>("m_characters", []),
    getDailyStorage<string[]>("m_nguonGoc", []),
    getDailyStorage<boolean>("m_overNight", false),
  ]);

  // 🧮 Tính trạng thái từng nhiệm vụ
  const results = missionLists.map((mission) => {
    let progress = 0;
    let completed = false;

    switch (mission.type) {
      case "search":
        progress = characters.length;
        completed = progress >= (mission.goal as number);
        break;
      case "nguonGoc":
        progress = nguonGoc.length;
        completed = progress >= (mission.goal as number);
        break;
      case "overNight":
        completed = overNight === true;
        break;
    }

    return { ...mission, progress, completed };
  });

  // ✅ Kiểm tra số nhiệm vụ hoàn thành
  const completedCount = results.filter((m) => m.completed).length;

  // 👉 Nếu đạt >= 3 nhiệm vụ và chưa cộng streak hôm nay thì cộng
  if (completedCount >= 3) {
    await updateStreakIfQualified();
  }

  return results;
};

/* -------------------------
🔥 STREAK SYSTEM (lưu vĩnh viễn)
-------------------------- */

// 📦 Lưu streak (vĩnh viễn)
export const saveStreak = async (value: number): Promise<void> => {
  await setStorage("m_streak", value);
};

// 📦 Lấy streak hiện tại
export const getStreak = async (): Promise<number> => {
  const stored = (await getStorage<number>("m_streak")) ?? 0;
  return stored;
};

// 🧮 Kiểm tra & cộng streak nếu đạt ≥ 3/4 nhiệm vụ
export const updateStreakIfQualified = async (): Promise<void> => {
  const missions = await getMissionStatus();
  const completedCount = missions.filter((m) => m.completed).length;
  const total = missions.length;

  // Cần hoàn thành ít nhất 3/4 nhiệm vụ
  const qualified = completedCount >= Math.ceil((3 / 4) * total);
  if (!qualified) return;

  // Mỗi ngày chỉ cộng 1 lần (reset 8h sáng)
  const alreadyAdded = await getDailyStorage<boolean>("m_streakAdded", false);
  if (alreadyAdded) return;

  // ✅ Cộng streak
  const current = await getStreak();
  const newStreak = current + 1;
  await saveStreak(newStreak);
  await setDailyStorage("m_streakAdded", true);

  console.log(`🔥 Streak +1 → hiện tại: ${newStreak}`);
};
