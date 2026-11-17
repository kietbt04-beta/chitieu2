import { Data, Shift } from "./types";

export const sum = (a: number[]) => a.reduce((t, x) => t + x, 0);
export const shiftProfit = (s: Shift) => s.earnings - s.fuel_cost - s.other_cost;

/**
 * Số dư ví được TÍNH từ dữ liệu gốc (không lưu riêng) nên không thể bị cộng/trừ trùng:
 *  số dư = số dư mở đầu − chi tiêu + thu nhập ca đã nhận − chuyển đi + chuyển đến.
 * Xăng phân bổ của ca (fuel_cost) chỉ dùng tính lợi nhuận, không đụng đến ví.
 */
export function walletBalance(d: Data, id: string): number {
  const w = d.wallets.find((x) => x.id === id);
  if (!w) return 0;
  return (
    w.opening_balance -
    sum(d.expenses.filter((e) => e.wallet_id === id).map((e) => e.amount)) +
    sum(d.shifts.filter((s) => s.wallet_id === id).map((s) => s.earnings)) -
    sum(d.transfers.filter((t) => t.from_wallet === id).map((t) => t.amount)) +
    sum(d.transfers.filter((t) => t.to_wallet === id).map((t) => t.amount))
  );
}
export const totalBalance = (d: Data) => sum(d.wallets.map((w) => walletBalance(d, w.id)));
export const walletInUse = (d: Data, id: string) =>
  d.expenses.some((e) => e.wallet_id === id) || d.shifts.some((s) => s.wallet_id === id) || d.transfers.some((t) => t.from_wallet === id || t.to_wallet === id);

export function byCategory(expenses: { category: string; amount: number }[]): [string, number][] {
  const m: Record<string, number> = {};
  for (const e of expenses) m[e.category] = (m[e.category] || 0) + e.amount;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}
