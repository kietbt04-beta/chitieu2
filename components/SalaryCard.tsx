"use client";
import { FormEvent, useState } from "react";
import { fmt, uid } from "@/lib/format";
import { Salary } from "@/lib/types";
import { useApp } from "./AppProvider";
import { Card, Field, MoneyInput } from "./ui";

const monthLabel = (m: string) => `Tháng ${m.slice(5)}/${m.slice(0, 4)}`;

export default function SalaryCard() {
  const { data, save, remove, toast } = useApp();
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(thisMonth);
  const [formKey, setFormKey] = useState(0); // đổi key để nạp lại số tiền khi chọn tháng khác
  const [busy, setBusy] = useState(false);
  const rowOf = (m: string, i: 1 | 2) => data.salaries.find((s) => s.month === m && s.installment === i);

  const months = [...new Set(data.salaries.map((s) => s.month))].sort((a, b) => b.localeCompare(a));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return toast("Chọn tháng hợp lệ.");
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    let ok = true;
    for (const i of [1, 2] as const) {
      const raw = String(fd.get(`d${i}`) ?? "");
      const old = rowOf(month, i);
      if (raw === "") { if (old) ok = (await remove("salaries", old.id)) && ok; continue; } // để trống = không có đợt này
      const amount = Number(raw);
      if (!Number.isFinite(amount) || amount < 0) { toast("Số tiền không hợp lệ."); ok = false; break; }
      ok = (await save("salaries", { id: old?.id ?? uid(), month, installment: i, amount: Math.round(amount) } satisfies Salary)) && ok;
    }
    setBusy(false);
    if (ok) toast(`Đã lưu lương ${monthLabel(month)}.`);
  }

  const total = (rowOf(month, 1)?.amount ?? 0) + (rowOf(month, 2)?.amount ?? 0);
  return (
    <Card title="💼 Lương tháng" chip="Nhận 2 đợt" className="sect">
      <form id="salary-form" onSubmit={submit} key={`${month}-${formKey}`}>
        <Field label="Tháng"><input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setFormKey((k) => k + 1); }} required /></Field>
        <div className="formgrid">
          <Field label="Lương đợt 1 (đ)"><MoneyInput name="d1" defaultValue={rowOf(month, 1)?.amount} /></Field>
          <Field label="Lương đợt 2 (đ)"><MoneyInput name="d2" defaultValue={rowOf(month, 2)?.amount} /></Field>
        </div>
        <div className="hint">Tổng lương {monthLabel(month)} hiện tại: <b>{fmt(total)}</b>. Chỉ có 1 đợt thì để trống đợt còn lại; xóa số của một đợt rồi bấm Lưu để bỏ đợt đó. Lương được cộng vào “Thu nhập − chi tiêu” ở báo cáo (khi xem theo Tháng, Quý hoặc Năm), không hiện ở Dashboard.</div>
        <div className="modalfooter"><button className="btn primary" disabled={busy}>{busy ? "Đang lưu…" : "Lưu lương"}</button></div>
      </form>
      {months.length > 0 && (
        <div className="tablewrap" style={{ marginTop: 14 }}><table className="data">
          <thead><tr><th>Tháng</th><th>Đợt 1</th><th>Đợt 2</th><th style={{ textAlign: "right" }}>Tổng lương</th><th /></tr></thead>
          <tbody>{months.map((m) => {
            const a = rowOf(m, 1), b = rowOf(m, 2);
            return (
              <tr key={m}>
                <td><b>{monthLabel(m)}</b></td><td>{a ? fmt(a.amount) : "—"}</td><td>{b ? fmt(b.amount) : "—"}</td>
                <td className="money pos">{fmt((a?.amount ?? 0) + (b?.amount ?? 0))}</td>
                <td><div className="rowact">
                  <button className="btn sm" onClick={() => { setMonth(m); setFormKey((k) => k + 1); document.getElementById("salary-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>Sửa</button>
                  <button className="btn sm danger" onClick={async () => {
                    if (!confirm(`Xóa toàn bộ lương ${monthLabel(m)}?`)) return;
                    let ok = true; for (const r of [a, b]) if (r) ok = (await remove("salaries", r.id)) && ok;
                    if (ok) toast("Đã xóa lương.");
                  }}>Xóa</button>
                </div></td>
              </tr>);
          })}</tbody>
        </table></div>
      )}
    </Card>
  );
}
