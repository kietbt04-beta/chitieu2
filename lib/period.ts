import { iso } from "./format";

export type Period = "Ngày" | "Tuần" | "Tháng" | "Quý" | "Năm";
export const PERIODS: Period[] = ["Ngày", "Tuần", "Tháng", "Quý", "Năm"];
export interface Range { start: string; end: string; label: string }
export interface Bucket { label: string; start: string; end: string }

const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mon = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const pad = (n: number) => String(n).padStart(2, "0");

export function getRange(p: Period, shift: number, now = new Date()): Range {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (p === "Ngày") {
    const d = addDays(base, shift);
    return { start: iso(d), end: iso(d), label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` };
  }
  if (p === "Tuần") {
    const s = mon(addDays(base, shift * 7)), e = addDays(s, 6);
    return { start: iso(s), end: iso(e), label: `${pad(s.getDate())}/${pad(s.getMonth() + 1)} – ${pad(e.getDate())}/${pad(e.getMonth() + 1)}/${e.getFullYear()}` };
  }
  if (p === "Tháng") {
    const s = new Date(base.getFullYear(), base.getMonth() + shift, 1), e = new Date(s.getFullYear(), s.getMonth() + 1, 0);
    return { start: iso(s), end: iso(e), label: `Tháng ${s.getMonth() + 1}/${s.getFullYear()}` };
  }
  if (p === "Quý") {
    const q = Math.floor(base.getMonth() / 3) + shift;
    const s = new Date(base.getFullYear(), q * 3, 1), e = new Date(s.getFullYear(), s.getMonth() + 3, 0);
    return { start: iso(s), end: iso(e), label: `Quý ${Math.floor(s.getMonth() / 3) + 1}/${s.getFullYear()}` };
  }
  const y = base.getFullYear() + shift;
  return { start: `${y}-01-01`, end: `${y}-12-31`, label: `Năm ${y}` };
}

export const inRange = (date: string, r: { start: string; end: string }) => date >= r.start && date <= r.end;

/** Chia kỳ thành các cột biểu đồ. */
export function getBuckets(p: Period, shift: number, now = new Date()): Bucket[] {
  const r = getRange(p, shift, now);
  const s = new Date(r.start + "T00:00:00");
  if (p === "Ngày") return Array.from({ length: 7 }, (_, i) => { const d = addDays(s, i - 6); return { label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`, start: iso(d), end: iso(d) }; });
  if (p === "Tuần") return Array.from({ length: 7 }, (_, i) => { const d = addDays(s, i); return { label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`, start: iso(d), end: iso(d) }; });
  if (p === "Tháng") {
    const last = new Date(s.getFullYear(), s.getMonth() + 1, 0).getDate(), out: Bucket[] = [];
    for (let a = 1; a <= last; a += 7) { const b = Math.min(a + 6, last); out.push({ label: `${a}–${b}`, start: iso(new Date(s.getFullYear(), s.getMonth(), a)), end: iso(new Date(s.getFullYear(), s.getMonth(), b)) }); }
    return out;
  }
  const months = p === "Quý" ? 3 : 12;
  return Array.from({ length: months }, (_, i) => { const a = new Date(s.getFullYear(), s.getMonth() + i, 1), b = new Date(a.getFullYear(), a.getMonth() + 1, 0); return { label: `T${a.getMonth() + 1}`, start: iso(a), end: iso(b) }; });
}
