export interface Expense { id: string; date: string; description: string; category: string; amount: number }
export interface Shift { id: string; date: string; hours: number; orders: number; earnings: number; fuel_cost: number; other_cost: number }
/** Lương tháng: mỗi tháng tối đa 2 đợt (installment 1 hoặc 2), month dạng "YYYY-MM". */
export interface Salary { id: string; month: string; installment: 1 | 2; amount: number }
/** Thu nhập thêm từ công việc khác ngoài lương và ShopeeFood. */
export interface Income { id: string; date: string; source: string; amount: number }
/** Khoản nợ phải trả; số đã trả tính từ các lần trả nợ (DebtPayment). */
export interface Debt { id: string; name: string; total: number; date: string }
export interface DebtPayment { id: string; debt_id: string; date: string; amount: number }
export interface Data { expenses: Expense[]; shifts: Shift[]; salaries: Salary[]; incomes: Income[]; debts: Debt[]; debtPayments: DebtPayment[] }
export type Row = Expense | Shift | Salary | Income | Debt | DebtPayment;
export type Table = keyof Data;
export const EMPTY: Data = { expenses: [], shifts: [], salaries: [], incomes: [], debts: [], debtPayments: [] };

export const CATS: Record<string, { icon: string; color: string }> = {
  "Ăn uống": { icon: "🍜", color: "#f59b72" },
  "Xăng xe": { icon: "⛽", color: "#e8b356" },
  "Mua sắm": { icon: "🛍️", color: "#9b81ee" },
  "Hóa đơn": { icon: "🧾", color: "#5aa6ed" },
  "Đi lại": { icon: "🛵", color: "#63cdaa" },
  "Khác": { icon: "📦", color: "#98a5b7" },
};
export const FUEL_CAT = "Xăng xe";
