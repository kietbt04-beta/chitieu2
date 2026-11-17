export const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(Number(n) || 0)) + "đ";
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const todayIso = () => iso(new Date());
export const viDate = (s: string) => { const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };
export const viShort = (s: string) => viDate(s).slice(0, 5);
export const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
