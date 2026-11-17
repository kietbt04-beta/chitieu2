import { iso } from "./format";
import { sum } from "./calc";

export interface Forecast {
  label: string; sofar: number; avg: number; projected: number;
  days: number; elapsed: number; remaining: number; lowConfidence: boolean;
}

/** Dự đoán cả tháng hiện tại = trung bình mỗi ngày từ đầu tháng đến hôm nay × số ngày của tháng. */
export function monthForecast(items: { date: string; amount: number }[], now = new Date()): Forecast {
  const y = now.getFullYear(), m = now.getMonth();
  const days = new Date(y, m + 1, 0).getDate(), elapsed = now.getDate();
  const start = iso(new Date(y, m, 1)), today = iso(now);
  const sofar = sum(items.filter((i) => i.date >= start && i.date <= today).map((i) => i.amount));
  const avg = sofar / elapsed;
  return { label: `Tháng ${m + 1}/${y}`, sofar, avg, projected: Math.round(avg * days), days, elapsed, remaining: days - elapsed, lowConfidence: elapsed < 5 };
}
