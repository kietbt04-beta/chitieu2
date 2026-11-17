export type WalletKind = "cash" | "bank" | "other";
export interface Wallet { id: string; name: string; kind: WalletKind; opening_balance: number }
export interface Expense { id: string; date: string; description: string; category: string; amount: number; wallet_id: string }
export interface Shift { id: string; date: string; hours: number; orders: number; earnings: number; fuel_cost: number; other_cost: number; wallet_id: string | null }
export interface Transfer { id: string; date: string; from_wallet: string; to_wallet: string; amount: number }
export interface Data { wallets: Wallet[]; expenses: Expense[]; shifts: Shift[]; transfers: Transfer[] }
export type Table = keyof Data;
export const EMPTY: Data = { wallets: [], expenses: [], shifts: [], transfers: [] };

export const CATS: Record<string, { icon: string; color: string }> = {
  "Ăn uống": { icon: "🍜", color: "#f59b72" },
  "Xăng xe": { icon: "⛽", color: "#e8b356" },
  "Mua sắm": { icon: "🛍️", color: "#9b81ee" },
  "Hóa đơn": { icon: "🧾", color: "#5aa6ed" },
  "Đi lại": { icon: "🛵", color: "#63cdaa" },
  "Khác": { icon: "📦", color: "#98a5b7" },
};
export const FUEL_CAT = "Xăng xe";
