"use client";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { DebtForm, PaymentForm } from "@/components/forms";
import { Card, Kpi, PageHead } from "@/components/ui";
import { debtStatus, sum } from "@/lib/calc";
import { fmt, viDate } from "@/lib/format";
import { Debt, DebtPayment } from "@/lib/types";

export default function Debts() {
  const { data, remove, toast } = useApp();
  const [debtForm, setDebtForm] = useState<Debt | "new" | null>(null);
  const [pay, setPay] = useState<{ debt: Debt; payment?: DebtPayment } | null>(null);
  const total = sum(data.debts.map((d) => d.total));
  const paid = sum(data.debtPayments.filter((p) => data.debts.some((d) => d.id === p.debt_id)).map((p) => p.amount));
  const sorted = [...data.debts].sort((a, b) => debtStatus(data, b.id).remaining - debtStatus(data, a.id).remaining);
  return (
    <>
      <PageHead title="Khoản nợ" sub="Theo dõi các khoản nợ phải trả, đã trả bao nhiêu và còn nợ bao nhiêu." action="Thêm khoản nợ" onAction={() => setDebtForm("new")} />
      <div className="kpis">
        <Kpi cls="red" title="Còn nợ" value={Math.max(total - paid, 0)} desc="Tổng số tiền chưa trả" icon="⚖" />
        <Kpi cls="green" title="Đã trả" value={paid} desc="Tổng các lần trả nợ" icon="✔" />
        <Kpi cls="purple" title="Tổng nợ ban đầu" value={total} desc="Tất cả các khoản nợ" icon="▤" />
        <Kpi cls="dark" title="Số khoản nợ" value={data.debts.length} raw desc={`${data.debts.filter((d) => debtStatus(data, d.id).remaining === 0).length} khoản đã trả xong`} icon="◈" />
      </div>
      {!sorted.length && <Card title="Chưa có khoản nợ" className="sect"><div className="empty">Bấm “Thêm khoản nợ” để bắt đầu theo dõi.</div></Card>}
      {sorted.map((d) => {
        const st = debtStatus(data, d.id), pct = Math.min(100, (st.paid / st.total) * 100);
        const pays = data.debtPayments.filter((p) => p.debt_id === d.id).sort((a, b) => b.date.localeCompare(a.date));
        return (
          <Card key={d.id} title={`⚖ ${d.name}`} chip={st.remaining === 0 ? "Đã trả xong" : `Vay ngày ${viDate(d.date)}`} className="sect">
            <div className="reportbar" style={{ margin: "4px 0 12px" }}>
              <div className="track"><div style={{ width: `${pct}%`, background: st.remaining === 0 ? "#139b76" : "#7c3aed" }} /></div>
              <strong style={{ width: 52 }}>{Math.round(pct)}%</strong>
            </div>
            <div className="minirow"><span className="rname">Tổng nợ</span><span className="rvalue">{fmt(st.total)}</span></div>
            <div className="minirow"><span className="rname">Đã trả</span><span className="rvalue pos">{fmt(st.paid)}</span></div>
            <div className="minirow"><b>Còn nợ</b><span className={`rvalue ${st.remaining ? "neg" : "pos"}`}>{fmt(st.remaining)}</span></div>
            <div className="rowact" style={{ justifyContent: "flex-start", margin: "12px 0" }}>
              {st.remaining > 0 && <button className="btn sm primary" onClick={() => setPay({ debt: d })}>＋ Trả nợ</button>}
              <button className="btn sm" onClick={() => setDebtForm(d)}>Sửa khoản nợ</button>
              <button className="btn sm danger" onClick={async () => { if (confirm(`Xóa khoản nợ "${d.name}" và toàn bộ lịch sử trả nợ của nó?`) && (await remove("debts", d.id))) toast("Đã xóa khoản nợ."); }}>Xóa</button>
            </div>
            {pays.length > 0 && (
              <div className="tablewrap"><table className="data">
                <thead><tr><th>Ngày trả</th><th style={{ textAlign: "right" }}>Số tiền</th><th /></tr></thead>
                <tbody>{pays.map((p) => (
                  <tr key={p.id}><td>{viDate(p.date)}</td><td className="money pos">{fmt(p.amount)}</td>
                    <td><div className="rowact">
                      <button className="btn sm" onClick={() => setPay({ debt: d, payment: p })}>Sửa</button>
                      <button className="btn sm danger" onClick={async () => { if (confirm("Xóa lần trả nợ này?") && (await remove("debtPayments", p.id))) toast("Đã xóa."); }}>Xóa</button>
                    </div></td></tr>))}</tbody>
              </table></div>
            )}
          </Card>
        );
      })}
      {debtForm && <DebtForm initial={debtForm === "new" ? undefined : debtForm} onClose={() => setDebtForm(null)} />}
      {pay && <PaymentForm debt={pay.debt} initial={pay.payment} onClose={() => setPay(null)} />}
    </>
  );
}
