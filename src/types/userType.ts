export interface UserType {
  _id: string;
  displayName: string;
  email: string;
  photo?: string;
  premium?: {
    plan: "3_days" | "6_months" | "12_months";
    expiresAt: string;
    remainingDays: number;
    active: boolean;
  };
  role: string;
  needUpdate: boolean;
}
