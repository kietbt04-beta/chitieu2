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
  const existing = data.salaries.find((s) => s.month === month);
  const list = [...data.salaries].sort((a, b) => b.month.localeCompare(a.month));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amount = Number(new FormData(e.currentTarget).get("amount"));
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return toast("Chọn tháng hợp lệ.");
    if (!Number.isFinite(amount) || amount < 0) return toast("Số tiền không hợp lệ.");
    setBusy(true);
    const ok = await save("salaries", { id: existing?.id ?? uid(), month, amount: Math.round(amount) } satisfies Salary);
    setBusy(false);
    if (ok) toast(existing ? `Đã cập nhật lương ${monthLabel(month)}.` : `Đã lưu lương ${monthLabel(month)}.`);
  }

  return (
    <Card title="💼 Lương tháng" chip="Nhập một lần mỗi tháng" className="sect">
      <form onSubmit={submit} key={`${month}-${formKey}`}>
        <div className="formgrid">
          <Field label="Tháng"><input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setFormKey((k) => k + 1); }} required /></Field>
          <Field label="Lương nhận được (đ)"><MoneyInput name="amount" defaultValue={existing?.amount} required /></Field>
        </div>
        <div className="hint">Mỗi tháng chỉ có một khoản lương: nhập lại cùng tháng sẽ cập nhật số cũ. Lương được cộng vào “Thu nhập − chi tiêu” ở báo cáo (khi xem theo Tháng, Quý hoặc Năm), không hiện ở Dashboard.</div>
        <div className="modalfooter"><button className="btn primary" disabled={busy}>{busy ? "Đang lưu…" : existing ? "Cập nhật lương" : "Lưu lương"}</button></div>
      </form>
      {list.length > 0 && (
        <div className="tablewrap" style={{ marginTop: 14 }}><table className="data">
          <thead><tr><th>Tháng</th><th style={{ textAlign: "right" }}>Lương</th><th /></tr></thead>
          <tbody>{list.map((s) => (
            <tr key={s.id}>
              <td><b>{monthLabel(s.month)}</b></td><td className="money pos">{fmt(s.amount)}</td>
              <td><div className="rowact">
                <button className="btn sm" onClick={() => { setMonth(s.month); setFormKey((k) => k + 1); }}>Sửa</button>
                <button className="btn sm danger" onClick={async () => { if (confirm(`Xóa lương ${monthLabel(s.month)}?`) && (await remove("salaries", s.id))) toast("Đã xóa lương."); }}>Xóa</button>
              </div></td>
            </tr>))}</tbody>
        </table></div>
      )}
    </Card>
  );
}
