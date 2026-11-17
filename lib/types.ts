export interface Expense { id: string; date: string; description: string; category: string; amount: number }
export interface Shift { id: string; date: string; hours: number; orders: number; earnings: number; fuel_cost: number; other_cost: number }
/** Lương tháng: mỗi tháng một khoản (month dạng "YYYY-MM"). */
export interface Salary { id: string; month: string; amount: number }
export interface Data { expenses: Expense[]; shifts: Shift[]; salaries: Salary[] }
export type Table = keyof Data;
export const EMPTY: Data = { expenses: [], shifts: [], salaries: [] };

export const CATS: Record<string, { icon: string; color: string }> = {
  "Ăn uống": { icon: "🍜", color: "#f59b72" },
  "Xăng xe": { icon: "⛽", color: "#e8b356" },
  "Mua sắm": { icon: "🛍️", color: "#9b81ee" },
  "Hóa đơn": { icon: "🧾", color: "#5aa6ed" },
  "Đi lại": { icon: "🛵", color: "#63cdaa" },
  "Khác": { icon: "📦", color: "#98a5b7" },
};
export const FUEL_CAT = "Xăng xe";
