"use client";
import { useApp } from "@/components/AppProvider";
import { Card, CatBars, Donut, PageHead, PeriodFilter } from "@/components/ui";
import { byCategory, sum } from "@/lib/calc";
import { fmt } from "@/lib/format";
import { inRange } from "@/lib/period";
import { CATS } from "@/lib/types";

export default function Categories() {
  const { data, range } = useApp();
  const exp = data.expenses.filter((e) => inRange(e.date, range));
  const arr = byCategory(exp), total = sum(exp.map((e) => e.amount));
  return (
    <>
      <PageHead title="Danh mục chi tiêu" sub="Loại khoản chi nào đang tốn nhiều tiền nhất." />
      <PeriodFilter />
      <div className="equal2">
        <Card title="Chi theo danh mục"><CatBars data={arr} /></Card>
        <Donut data={arr} />
      </div>
      <Card title="Chi tiết tỷ trọng" chip={`Tổng ${fmt(total)}`} className="sect">
        <div className="tablewrap"><table className="data">
          <thead><tr><th>Danh mục</th><th>Số khoản</th><th>Tỷ trọng</th><th style={{ textAlign: "right" }}>Số tiền</th></tr></thead>
          <tbody>{Object.keys(CATS).map((c) => { const v = arr.find((a) => a[0] === c)?.[1] ?? 0; return (
            <tr key={c}><td><b>{CATS[c].icon} {c}</b></td><td>{exp.filter((e) => e.category === c).length}</td><td>{Math.round((v / Math.max(total, 1)) * 100)}%</td><td className="money">{fmt(v)}</td></tr>); })}</tbody>
        </table></div>
        <div className="footnote">Mỗi khoản chi thuộc đúng một danh mục nên tổng các danh mục luôn bằng tổng chi tiêu, không tính trùng.</div>
      </Card>
    </>
  );
}
