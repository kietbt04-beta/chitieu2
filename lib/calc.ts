import { Data, Salary, Shift } from "./types";
import type { Period } from "./period";

export const sum = (a: number[]) => a.reduce((t, x) => t + x, 0);
/** Lợi nhuận ca = thu nhập − xăng phân bổ − chi phí khác. Xăng phân bổ chỉ để tính lợi nhuận, không cộng thêm vào tiền đã chi. */
export const shiftProfit = (s: Shift) => s.earnings - s.fuel_cost - s.other_cost;

export function byCategory(expenses: { category: string; amount: number }[]): [string, number][] {
  const m: Record<string, number> = {};
  for (const e of expenses) m[e.category] = (m[e.category] || 0) + e.amount;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

/** Tổng lương của các tháng nằm trong kỳ. Chỉ tính khi xem theo Tháng/Quý/Năm (lương không thuộc về một ngày hay một tuần cụ thể). */
export function salaryInRange(salaries: Salary[], range: { start: string; end: string }, period: Period): number {
  if (period === "Ngày" || period === "Tuần") return 0;
  const a = range.start.slice(0, 7), b = range.end.slice(0, 7);
  return sum(salaries.filter((s) => s.month >= a && s.month <= b).map((s) => s.amount));
}

/** Số đã trả, còn nợ của một khoản nợ. */
export function debtStatus(d: Data, debtId: string) {
  const debt = d.debts.find((x) => x.id === debtId);
  const paid = sum(d.debtPayments.filter((p) => p.debt_id === debtId).map((p) => p.amount));
  const total = debt?.total ?? 0;
  return { total, paid, remaining: Math.max(total - paid, 0) };
}
