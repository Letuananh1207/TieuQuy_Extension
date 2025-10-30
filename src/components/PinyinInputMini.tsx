import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { Search } from "lucide-react";
import { AppContext } from "../contexts/AppContext";
import { toSimplified } from "../ultities/convertChinese";

type FormValues = {
  query: string;
};

const PinyinInput: React.FC = () => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [composition, setComposition] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0); // 🆕 index đang chọn

  const appContext = useContext(AppContext);
  if (!appContext) {
    return <div>Lỗi: AppContext chưa được khởi tạo!</div>;
  }
  const { setActiveTab, setCharacter, setWord } = appContext;

  const {
    getValues,
    register,
    handleSubmit,
    formState: { errors },
    setValue: setFormValue,
  } = useForm<FormValues>({
    defaultValues: { query: "" },
  });

  const onSubmit = (data: FormValues) => {
    setWord(getValues().query);
    setCharacter(toSimplified(data.query.trim()));
    setActiveTab("search");
  };

  const onSearch = (character: string) => {
    setWord(getValues().query);
    setCharacter(character);
    setActiveTab("search");
  };

  const queryToCharacter = () => {
    const query: string = toSimplified(getValues().query) || "";
    // Lọc chỉ các ký tự Trung Quốc
    const chineseChars = query.match(/[\u4e00-\u9fff]/g) || [];
    return chineseChars;
  };

  const fetchSuggestions = async (pinyin: string) => {
    try {
      const res = await fetch(
        `https://inputtools.google.com/request?text=${pinyin}&itc=zh-t-i0-pinyin&num=10`
      );
      const data = await res.json();
      const list = data?.[1]?.[0]?.[1] || [];
      setSuggestions(list);
      setSelectedIndex(0); // reset khi có gợi ý mới
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    setFormValue("query", v);

    const last = v.split(" ").pop() || "";
    setComposition(last);

    if (last.length > 0) fetchSuggestions(last);
    else setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    // ← di chuyển sang trái
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }
    // → di chuyển sang phải
    else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    }
    // Enter hoặc Space để chọn
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      if (selected) {
        const newValue = value.replace(composition, selected) + "";
        setValue(newValue);
        setFormValue("query", newValue);
        setSuggestions([]);
        setComposition("");
      }
    }
  };

  return (
    <div className="relative w-full pb-2">
      <form
        className="w-full flex items-stretch relative"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="relative w-full h-full">
          <input
            {...register("query", {
              required: "Bạn chưa nhập nội dung",
              maxLength: {
                value: 1,
                message: "Chỉ được tối đa 1 kí tự",
              },
              pattern: {
                value: /^[\u4E00-\u9FFF]+$/,
                message: "Chỉ được nhập ký tự tiếng Trung",
              },
            })}
            value={value}
            autoComplete="off"
            spellCheck={false}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              errors.query?.type === "required"
                ? "Bạn vẫn chưa nhập?"
                : "请输入内容"
            }
            className={`border p-2 w-full bg-white outline-none h-7 text-xs ${
              errors.query ? "border-red-500" : ""
            }`}
          />

          {suggestions.length > 0 && (
            <div
              className="
              absolute bottom-full mb-1 left-0
              bg-white border rounded shadow text-xs px-2 py-1
              flex flex-wrap gap-1
              max-w-[220px]
              overflow-hidden
              whitespace-nowrap
            "
            >
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`cursor-pointer px-1 rounded transition-all ${
                    selectedIndex === i
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-200"
                  }`}
                  onMouseDown={() => {
                    const newValue = value.replace(composition, s) + "";
                    setValue(newValue);
                    setFormValue("query", newValue);
                    setSuggestions([]);
                    setComposition("");
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="px-2 bg-black text-white items-center justify-center cursor-pointer hidden"
        >
          <Search size={18} />
        </button>
      </form>
      {errors.query?.type === "maxLength" && (
        <div className="absolute flex -bottom-5 left-0.5 gap-1 text-[10px] bg-black/10">
          {queryToCharacter().map((item, index) => (
            <div
              className="border p-1 bg-white transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
              key={item + index}
              onClick={() => onSearch(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PinyinInput;
