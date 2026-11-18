import { Data } from "./types";
import { debtStatus, sum } from "./calc";
import { fmt, iso } from "./format";
import { monthForecast } from "./forecast";

export interface Notice { id: string; icon: string; title: string; text: string; href: string }

/** Thông báo tự tạo từ dữ liệu hiện có (không cần máy chủ). id đổi khi tình huống đổi, nên thông báo đã đọc sẽ hiện lại khi có thay đổi mới. */
export function buildNotices(d: Data, now = new Date()): Notice[] {
  const out: Notice[] = [];
  const ym = iso(now).slice(0, 7), today = iso(now);
  const monthName = `${ym.slice(5)}/${ym.slice(0, 4)}`;

  const salaryThisMonth = sum(d.salaries.filter((s) => s.month === ym).map((s) => s.amount));
  if (!d.salaries.some((s) => s.month === ym)) {
    out.push({ id: `salary-${ym}`, icon: "💼", title: `Chưa nhập lương tháng ${monthName}`, text: "Nhập lương ở Báo cáo tháng để báo cáo thu nhập − chi tiêu chính xác.", href: "/bao-cao" });
  }

  const owing = d.debts.map((x) => debtStatus(d, x.id)).filter((s) => s.remaining > 0);
  if (owing.length) {
    const rest = sum(owing.map((s) => s.remaining));
    out.push({ id: `debt-${owing.length}-${rest}`, icon: "⚖", title: `Còn nợ ${fmt(rest)}`, text: `${owing.length} khoản nợ chưa trả xong.`, href: "/khoan-no" });
  }

  if (now.getHours() >= 18 && !d.expenses.some((e) => e.date === today)) {
    out.push({ id: `noexp-${today}`, icon: "📝", title: "Hôm nay chưa ghi chi tiêu", text: "Ghi lại các khoản đã chi trong ngày để không bị sót.", href: "/chi-tieu" });
  }

  const income = salaryThisMonth + sum(d.shifts.filter((s) => s.date.startsWith(ym)).map((s) => s.earnings)) + sum(d.incomes.filter((i) => i.date.startsWith(ym)).map((i) => i.amount));
  const projected = monthForecast(d.expenses.map((e) => ({ date: e.date, amount: e.amount })), now).projected;
  if (income > 0 && projected > income) {
    out.push({ id: `over-${ym}`, icon: "⚠️", title: "Dự đoán chi tiêu vượt thu nhập", text: `Dự đoán chi cả tháng ${fmt(projected)}, trong khi thu nhập đã nhận ${fmt(income)}.`, href: "/" });
  }
  return out;
}
