"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import ExpenseTable from "@/components/ExpenseTable";
import { ExpenseForm } from "@/components/forms";
import { Card, Donut, PageHead, PeriodFilter } from "@/components/ui";
import { byCategory, sum } from "@/lib/calc";
import { fmt } from "@/lib/format";
import { inRange } from "@/lib/period";
import { CATS } from "@/lib/types";

export default function Expenses() {
  const { data, range } = useApp();
  const [adding, setAdding] = useState(false);
  const [cat, setCat] = useState("Tất cả"); const [q, setQ] = useState("");
  const inPeriod = useMemo(() => data.expenses.filter((e) => inRange(e.date, range)), [data, range]);
  const list = inPeriod.filter((e) => (cat === "Tất cả" || e.category === cat) && e.description.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHead title="Chi tiêu hằng ngày" sub="Ghi lại số tiền đã tiêu và xem chi vào những đâu." action="Thêm chi tiêu" onAction={() => setAdding(true)} />
      <PeriodFilter />
      <div className="equal2">
        <Card title="Chi tiêu trong kỳ" chip="Đã thực chi">
          <div style={{ fontSize: 36, fontWeight: 850, color: "#ea5964", margin: "14px 0" }}>{fmt(sum(inPeriod.map((e) => e.amount)))}</div>
          <div className="simplehint">{inPeriod.length} khoản chi. Mỗi khoản chỉ được tính một lần.</div>
        </Card>
        <Donut data={byCategory(inPeriod)} />
      </div>
      <Card title="Danh sách chi tiêu" chip={`${list.length} giao dịch`} className="sect">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên khoản chi…" aria-label="Tìm kiếm" style={{ width: "100%", maxWidth: 360, height: 40, border: "1px solid var(--line)", borderRadius: 11, padding: "0 12px", background: "var(--card)", color: "var(--ink)" }} />
        <div className="pills">{["Tất cả", ...Object.keys(CATS)].map((n) => <button key={n} className={`pill ${cat === n ? "sel" : ""}`} onClick={() => setCat(n)}>{n}</button>)}</div>
        <ExpenseTable rows={list} />
      </Card>
      {adding && <ExpenseForm onClose={() => setAdding(false)} />}
    </>
  );
}
