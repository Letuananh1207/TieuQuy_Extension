import {
  createContext,
  useState,
  type ReactNode,
  type FC,
  useEffect,
} from "react";
import type { HanziData } from "../types/HanziData";
import { countSearch } from "../ultities/mission";

// 👇 Tab type
export type TabType =
  | "home"
  | "search"
  | "library"
  | "check"
  | "premium"
  | "userCheck"
  | "mail";

// 👇 AppContext type
export interface AppContextType {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
  character: string;
  setCharacter: React.Dispatch<React.SetStateAction<string>>;
  word: string;
  setWord: React.Dispatch<React.SetStateAction<string>>;
  hanziData: HanziData | null;
  setHanziData: React.Dispatch<React.SetStateAction<HanziData | null>>;
}

// 👇 Tạo context
export const AppContext = createContext<AppContextType | undefined>(undefined);

// 👇 Provider
export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [character, setCharacter] = useState("");
  const [word, setWord] = useState("");
  const [hanziData, setHanziData] = useState<HanziData | null>(null);
  useEffect(() => {
    if (character) {
      countSearch(character);
    }
  }, [character]); // ✅ chạy mỗi khi giá trị character thay đổi

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        character,
        setCharacter,
        word,
        setWord,
        hanziData,
        setHanziData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
