// UserCheck.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Search, Crown, Loader2 } from "lucide-react";

type FormValues = {
  query: string;
};

interface User {
  _id: string;
  email: string;
  premium?: {
    plan?: string;
    expiresAt?: string;
    remainingDays?: number;
    active?: boolean;
  };
}

interface UserCheckProps {
  user: User; // user admin hiện tại
}

const UserCheck: React.FC<UserCheckProps> = ({ user }) => {
  const [selectedOption, setSelectedOption] = useState<string>("6month");
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // nếu dùng Vite

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { query: "" },
  });

  // 🔍 Gọi API tìm user theo email
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setUserData(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/email/${encodeURIComponent(data.query)}`
      );
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Không tìm thấy user");
      }

      setUserData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Gửi yêu cầu nâng cấp premium
  const handleConfirm = async () => {
    if (!userData) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/upgrade_plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userData._id, // id user cần nâng cấp
          plan: selectedOption === "6month" ? "6_months" : "12_months",
          sendUser: user._id, // admin gửi tin nhắn
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Thao tác thất bại");

      alert(
        `Đã cập nhật premium thành công! Gói hiện tại: ${result.premium.plan}`
      );

      // Cập nhật lại userData với premium mới
      setUserData((prev) =>
        prev ? { ...prev, premium: result.premium } : prev
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 px-2 text-sm pb-8">
      {/* Header */}
      <div className="font-bold flex items-center gap-1 text-lg">
        Premium <Crown fill="orange" />
      </div>

      {/* Form nhập email */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex items-stretch gap-1"
      >
        <input
          id="email"
          type="text"
          autoComplete="off"
          className={`bg-white outline-0 text-xs px-2 py-1 flex-1 rounded border ${
            errors.query ? "border-red-400" : "border-gray-300"
          }`}
          placeholder={errors.query?.message || "Email"}
          {...register("query", {
            required: "Vẫn chưa nhập email",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Email không hợp lệ",
            },
          })}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gray-500 w-8 flex justify-center items-center rounded hover:bg-gray-400 transition cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-white" />
          ) : (
            <Search size={16} color="white" />
          )}
        </button>
      </form>

      {/* Lỗi */}
      {error && <div className="text-red-500 text-xs">{error}</div>}

      {/* Thông tin người dùng + gói chọn */}
      {userData && (
        <div className="w-full flex flex-col gap-2 mt-2 text-[10px]">
          <div className="flex gap-2 items-stretch min-w-0">
            <div
              className="flex-1 min-w-0 pl-1 truncate text-gray-700 text-xs bg-white"
              title={userData.email}
            >
              {userData.email}
            </div>

            {/* Radio 6 tháng */}
            <label
              htmlFor="6month"
              className={`flex items-center gap-1 cursor-pointer rounded-md px-2 py-1 border transition ${
                selectedOption === "6month"
                  ? "bg-black text-white border-black"
                  : "hover:bg-gray-100 border-gray-300"
              }`}
            >
              <input
                type="radio"
                id="6month"
                name="option"
                value="6month"
                checked={selectedOption === "6month"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="hidden"
              />
              6月
            </label>

            {/* Radio 1 năm */}
            <label
              htmlFor="1year"
              className={`flex items-center gap-1 cursor-pointer rounded-md px-2 py-1 border transition ${
                selectedOption === "1year"
                  ? "bg-black text-white border-black"
                  : "hover:bg-gray-100 border-gray-300"
              }`}
            >
              <input
                type="radio"
                id="1year"
                name="option"
                value="1year"
                checked={selectedOption === "1year"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="hidden"
              />
              1年
            </label>
          </div>

          {/* Nút xác nhận */}
          <button
            onClick={handleConfirm}
            className="w-full bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-400 transition self-end font-bold cursor-pointer"
          >
            Xác nhận
          </button>
        </div>
      )}
    </div>
  );
};

export default UserCheck;
