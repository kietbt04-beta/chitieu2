import { Shift } from "./types";

export const sum = (a: number[]) => a.reduce((t, x) => t + x, 0);
/** Lợi nhuận ca = thu nhập − xăng phân bổ − chi phí khác. Xăng phân bổ chỉ để tính lợi nhuận, không cộng thêm vào tiền đã chi. */
export const shiftProfit = (s: Shift) => s.earnings - s.fuel_cost - s.other_cost;

export function byCategory(expenses: { category: string; amount: number }[]): [string, number][] {
  const m: Record<string, number> = {};
  for (const e of expenses) m[e.category] = (m[e.category] || 0) + e.amount;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}
