import { Data } from "./types";
import { byCategory, debtStatus, salaryInRange, shiftProfit, sum } from "./calc";
import { fmt, iso } from "./format";
import { monthForecast } from "./forecast";
import { getRange } from "./period";
import { FUEL_CAT } from "./types";

/** Trợ lý trả lời dựa trên dữ liệu của bạn ngay trên máy (không gửi dữ liệu ra dịch vụ AI bên ngoài). */
export const SUGGESTIONS = ["Tháng này tôi chi bao nhiêu?", "Thu nhập ShopeeFood tháng này?", "Tôi còn nợ bao nhiêu?", "Dự đoán chi tiêu tháng này", "Tháng này còn lại bao nhiêu?", "Chi nhiều nhất vào đâu?"];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

export function answer(q: string, d: Data, now = new Date()): string {
  const t = norm(q), has = (...w: string[]) => w.some((x) => t.includes(x));
  const range = getRange("Tháng", 0, now), inM = (date: string) => date >= range.start && date <= range.end;
  const exp = d.expenses.filter((e) => inM(e.date)), sh = d.shifts.filter((s) => inM(s.date));
  const spent = sum(exp.map((e) => e.amount)), earn = sum(sh.map((s) => s.earnings));
  const salary = salaryInRange(d.salaries, range, "Tháng"), other = sum(d.incomes.filter((i) => inM(i.date)).map((i) => i.amount));
  const income = salary + earn + other, label = range.label.toLowerCase();

  if (has("no ", " no", "khoan no", "con no") || t === "no") {
    const rows = d.debts.map((x) => ({ x, s: debtStatus(d, x.id) })).filter((r) => r.s.remaining > 0);
    if (!d.debts.length) return "Bạn chưa ghi khoản nợ nào. Vào mục Khoản nợ để thêm.";
    if (!rows.length) return "Tuyệt vời, tất cả khoản nợ đã được trả xong 🎉";
    return `Bạn còn nợ tổng cộng ${fmt(sum(rows.map((r) => r.s.remaining)))}:\n` + rows.map((r) => `• ${r.x.name}: còn ${fmt(r.s.remaining)} (đã trả ${fmt(r.s.paid)} / ${fmt(r.s.total)})`).join("\n");
  }
  if (has("du doan")) {
    const fs = monthForecast(d.expenses.map((e) => ({ date: e.date, amount: e.amount })), now);
    const fi = monthForecast(d.shifts.map((s) => ({ date: s.date, amount: s.earnings })), now);
    return `Theo mức trung bình từ đầu tháng đến nay:\n• Dự đoán chi tiêu cả ${label}: ${fmt(fs.projected)} (đã chi ${fmt(fs.sofar)}, trung bình ${fmt(fs.avg)}/ngày)\n• Dự đoán thu nhập ShopeeFood: ${fmt(fi.projected)} (đã kiếm ${fmt(fi.sofar)})\nĐây chỉ là ước tính tham khảo.`;
  }
  if (has("xang")) {
    const poured = sum(exp.filter((e) => e.category === FUEL_CAT).map((e) => e.amount)), alloc = sum(sh.map((s) => s.fuel_cost));
    return `Trong ${label}: đã đổ xăng ${fmt(poured)}, đã phân bổ cho các ca ShopeeFood ${fmt(alloc)}, chưa phân bổ ${fmt(Math.max(poured - alloc, 0))}. Xăng phân bổ chỉ để tính lợi nhuận, không cộng thêm vào tiền đã chi.`;
  }
  if (has("shopee", "driver", "tai xe", "chay xe", "ca lam", "kiem duoc")) {
    return `Trong ${label}, ShopeeFood: ${sh.length} ca, ${sum(sh.map((s) => s.orders))} đơn, ${sum(sh.map((s) => s.hours))} giờ.\nThu nhập ${fmt(earn)}, lợi nhuận sau xăng và chi phí ca ${fmt(sum(sh.map(shiftProfit)))}.`;
  }
  if (has("luong")) {
    const ms = d.salaries.filter((s) => s.month === iso(now).slice(0, 7));
    return ms.length ? `Lương ${label}: ${fmt(salary)}` + (ms.length > 1 ? ` (${ms.sort((a, b) => a.installment - b.installment).map((m) => `đợt ${m.installment}: ${fmt(m.amount)}`).join(", ")})` : "") + "." : `Bạn chưa nhập lương ${label}. Vào Báo cáo tháng để nhập.`;
  }
  if (has("thu nhap khac", "lam them", "freelance")) return `Thu nhập khác trong ${label}: ${fmt(other)}.`;
  if (has("con lai", "du ", "thu nhap - chi", "tiet kiem", "lai")) {
    return `${range.label}: tổng thu nhập ${fmt(income)} (lương ${fmt(salary)} + ShopeeFood ${fmt(earn)} + thu nhập khác ${fmt(other)}), tổng chi ${fmt(spent)}.\nThu nhập − chi tiêu = ${fmt(income - spent)}.`;
  }
  if (has("nhieu nhat", "danh muc", "vao dau", "an gi", "tieu vao")) {
    const cats = byCategory(exp);
    return cats.length ? `Chi nhiều nhất ${label}:\n` + cats.slice(0, 4).map(([c, v], i) => `${i + 1}. ${c}: ${fmt(v)} (${Math.round((v / Math.max(spent, 1)) * 100)}%)`).join("\n") : `Chưa có khoản chi nào trong ${label}.`;
  }
  if (has("chi", "tieu", "mat bao nhieu", "bao nhieu tien")) {
    const top = byCategory(exp)[0];
    return `Trong ${label} bạn đã chi ${fmt(spent)} cho ${exp.length} khoản.` + (top ? ` Nhiều nhất là ${top[0]} (${fmt(top[1])}).` : "");
  }
  return "Mình chưa hiểu câu hỏi này. Bạn thử hỏi về: chi tiêu tháng này, thu nhập ShopeeFood, lương, khoản nợ, xăng, dự đoán, hoặc “tháng này còn lại bao nhiêu”.";
}
