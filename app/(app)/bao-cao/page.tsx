"use client";
import { useApp } from "@/components/AppProvider";
import ExpenseTable from "@/components/ExpenseTable";
import { Card, CatBars, Kpi, PageHead, PeriodFilter } from "@/components/ui";
import { byCategory, shiftProfit, sum, totalBalance } from "@/lib/calc";
import { fmt } from "@/lib/format";
import { inRange } from "@/lib/period";

export default function Reports() {
  const { data, range } = useApp();
  const exp = data.expenses.filter((e) => inRange(e.date, range)).sort((a, b) => b.date.localeCompare(a.date));
  const sh = data.shifts.filter((s) => inRange(s.date, range));
  const spent = sum(exp.map((e) => e.amount)), earn = sum(sh.map((s) => s.earnings)), profit = sum(sh.map(shiftProfit));
  return (
    <>
      <PageHead title="Báo cáo tháng" sub="Cuối kỳ xem lại tiền đã chi và thu nhập ShopeeFood." />
      <PeriodFilter />
      <div className="kpis">
        <Kpi cls="red" title="Đã chi" value={spent} desc="Tổng tiền ra thực tế" icon="↗" />
        <Kpi cls="green" title="ShopeeFood kiếm được" value={earn} desc="Tiền công đã ghi nhận" icon="♧" />
        <Kpi cls="purple" title="Lợi nhuận chạy xe" value={profit} desc="Sau chi phí ShopeeFood" icon="◈" />
        <Kpi cls="dark" title="Tiền hiện có" value={totalBalance(data)} desc="Tổng số dư các ví" icon="▣" />
      </div>
      <div className="two sect">
        <Card title="Tôi đã chi những gì?"><CatBars data={byCategory(exp)} /></Card>
        <Card title="Kết quả thu chi">
          <div className="minirow"><span>Thu nhập ShopeeFood</span><span className="rvalue pos">{fmt(earn)}</span></div>
          <div className="minirow"><span>Xăng phân bổ</span><span className="rvalue neg">{fmt(sum(sh.map((s) => s.fuel_cost)))}</span></div>
          <div className="minirow"><span>Chi phí khác của ca</span><span className="rvalue neg">{fmt(sum(sh.map((s) => s.other_cost)))}</span></div>
          <div className="minirow"><b>Lợi nhuận ShopeeFood</b><span className="rvalue pos">{fmt(profit)}</span></div>
          <div className="minirow"><b>Thu nhập − tổng chi tiêu</b><span className={`rvalue ${earn - spent >= 0 ? "pos" : "neg"}`}>{fmt(earn - spent)}</span></div>
          <div className="footnote">Chuyển ví và số dư mở đầu không tính vào thu/chi. Xăng phân bổ cho ca không bị trừ lần hai khỏi tiền đã chi.</div>
        </Card>
      </div>
      <Card title="Nhật ký chi tiêu" chip={`${exp.length} khoản`} className="sect"><ExpenseTable rows={exp} editable={false} /></Card>
    </>
  );
}
