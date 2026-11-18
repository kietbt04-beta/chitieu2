"use client";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { IncomeForm } from "@/components/forms";
import { Card, Kpi, PageHead, PeriodFilter } from "@/components/ui";
import { sum } from "@/lib/calc";
import { fmt, viDate } from "@/lib/format";
import { inRange } from "@/lib/period";
import { Income } from "@/lib/types";

export default function OtherIncome() {
  const { data, range, remove, toast } = useApp();
  const [form, setForm] = useState<Income | "new" | null>(null);
  const rows = data.incomes.filter((i) => inRange(i.date, range)).sort((a, b) => b.date.localeCompare(a.date));
  const total = sum(rows.map((r) => r.amount));
  const bySource = Object.entries(rows.reduce<Record<string, number>>((m, r) => ({ ...m, [r.source]: (m[r.source] || 0) + r.amount }), {})).sort((a, b) => b[1] - a[1]);
  return (
    <>
      <PageHead title="Thu nhập khác" sub="Tiền kiếm thêm từ các công việc khác ngoài lương và ShopeeFood." action="Thêm thu nhập" onAction={() => setForm("new")} />
      <PeriodFilter />
      <div className="kpis">
        <Kpi cls="green" title="Thu nhập khác" value={total} desc="Tổng tiền nhận trong kỳ" icon="✚" />
        <Kpi cls="purple" title="Số lần nhận" value={rows.length} raw desc="Khoản thu trong kỳ" icon="▤" />
        <Kpi cls="dark" title="Nguồn lớn nhất" value={bySource[0]?.[1] ?? 0} desc={bySource[0]?.[0] ?? "Chưa có thu nhập"} icon="🔥" />
      </div>
      <Card title="Danh sách thu nhập khác" chip={`${rows.length} khoản`} className="sect">
        {!rows.length ? <div className="empty">Chưa có thu nhập nào trong kỳ này.</div> : (
          <div className="tablewrap"><table className="data">
            <thead><tr><th>Công việc / nguồn</th><th>Ngày nhận</th><th style={{ textAlign: "right" }}>Số tiền</th><th /></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id}>
                <td><b>{r.source}</b></td><td>{viDate(r.date)}</td><td className="money pos">+{fmt(r.amount)}</td>
                <td><div className="rowact">
                  <button className="btn sm" onClick={() => setForm(r)}>Sửa</button>
                  <button className="btn sm danger" onClick={async () => { if (confirm(`Xóa khoản thu "${r.source}"?`) && (await remove("incomes", r.id))) toast("Đã xóa."); }}>Xóa</button>
                </div></td>
              </tr>))}</tbody>
          </table></div>
        )}
        <div className="footnote">Thu nhập khác được cộng vào “Tổng thu nhập” và “Thu nhập − chi tiêu” trong Báo cáo tháng, cùng với lương và ShopeeFood.</div>
      </Card>
      {form && <IncomeForm initial={form === "new" ? undefined : form} onClose={() => setForm(null)} />}
    </>
  );
}
