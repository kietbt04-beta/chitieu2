"use client";
import { useApp } from "@/components/AppProvider";
import ExpenseTable from "@/components/ExpenseTable";
import SalaryCard from "@/components/SalaryCard";
import { Card, CatBars, Kpi, PageHead, PeriodFilter } from "@/components/ui";
import { byCategory, salaryInRange, shiftProfit, sum } from "@/lib/calc";
import { fmt } from "@/lib/format";
import { inRange } from "@/lib/period";

export default function Reports() {
  const { data, range, period } = useApp();
  const exp = data.expenses.filter((e) => inRange(e.date, range)).sort((a, b) => b.date.localeCompare(a.date));
  const sh = data.shifts.filter((s) => inRange(s.date, range));
  const spent = sum(exp.map((e) => e.amount)), earn = sum(sh.map((s) => s.earnings)), profit = sum(sh.map(shiftProfit));
  const salary = salaryInRange(data.salaries, range, period);
  const other = sum(data.incomes.filter((i) => inRange(i.date, range)).map((i) => i.amount));
  const debtPaid = sum(data.debtPayments.filter((p) => inRange(p.date, range) && data.debts.some((d) => d.id === p.debt_id)).map((p) => p.amount));
  const income = salary + earn + other, left = income - spent;
  return (
    <>
      <PageHead title="Báo cáo tháng" sub="Cuối kỳ xem lại tiền đã chi, lương, ShopeeFood, thu nhập khác và trả nợ." />
      <PeriodFilter />
      <div className="kpis">
        <Kpi cls="red" title="Đã chi" value={spent} desc="Tổng tiền ra thực tế" icon="↗" />
        <Kpi cls="green" title="ShopeeFood kiếm được" value={earn} desc="Tiền công đã ghi nhận" icon="♧" />
        <Kpi cls="purple" title="Lợi nhuận chạy xe" value={profit} desc="Sau chi phí ShopeeFood" icon="◈" />
        <Kpi cls="dark" title="Thu nhập − chi tiêu" value={left} desc="Lương + ShopeeFood + thu nhập khác − chi" icon="▣" />
      </div>
      <div className="two sect">
        <Card title="Tôi đã chi những gì?"><CatBars data={byCategory(exp)} /></Card>
        <Card title="Kết quả thu chi">
          <div className="minirow"><span>💼 Lương tháng</span><span className="rvalue pos">{fmt(salary)}</span></div>
          <div className="minirow"><span>♧ Thu nhập ShopeeFood</span><span className="rvalue pos">{fmt(earn)}</span></div>
          <div className="minirow"><span>✚ Thu nhập khác</span><span className="rvalue pos">{fmt(other)}</span></div>
          <div className="minirow"><b>Tổng thu nhập</b><span className="rvalue pos">{fmt(income)}</span></div>
          <div className="minirow"><span>Tổng chi tiêu</span><span className="rvalue neg">−{fmt(spent)}</span></div>
          <div className="minirow"><b>Thu nhập − chi tiêu</b><span className={`rvalue ${left >= 0 ? "pos" : "neg"}`}>{fmt(left)}</span></div>
          <div className="minirow"><span>⚖ Đã trả nợ trong kỳ</span><span className="rvalue neg">−{fmt(debtPaid)}</span></div>
          <div className="minirow"><b>Còn lại sau khi trả nợ</b><span className={`rvalue ${left - debtPaid >= 0 ? "pos" : "neg"}`}>{fmt(left - debtPaid)}</span></div>
          {(period === "Ngày" || period === "Tuần") && <div className="alertline" style={{ marginTop: 10 }}>Lương tính theo tháng nên không hiện khi xem theo Ngày hoặc Tuần. Chọn Tháng, Quý hoặc Năm để thấy lương.</div>}
          <div className="footnote">Lợi nhuận chạy xe {fmt(profit)} (đã trừ xăng phân bổ {fmt(sum(sh.map((s) => s.fuel_cost)))} và chi phí khác {fmt(sum(sh.map((s) => s.other_cost)))}) chỉ để tham khảo; xăng đã nằm trong tổng chi tiêu nên không bị trừ hai lần.</div>
        </Card>
      </div>
      <SalaryCard />
      <Card title="Nhật ký chi tiêu" chip={`${exp.length} khoản`} className="sect"><ExpenseTable rows={exp} editable={false} /></Card>
    </>
  );
}
