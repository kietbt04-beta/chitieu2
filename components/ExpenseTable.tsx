"use client";
import { useState } from "react";
import { CATS, Expense } from "@/lib/types";
import { fmt, viDate } from "@/lib/format";
import { useApp } from "./AppProvider";
import { ExpenseForm } from "./forms";

export default function ExpenseTable({ rows, editable = true }: { rows: Expense[]; editable?: boolean }) {
  const { remove, toast } = useApp();
  const [edit, setEdit] = useState<Expense | null>(null);
  if (!rows.length) return <div className="empty">Chưa có giao dịch nào.</div>;
  return (
    <>
      <div className="tablewrap"><table className="data">
        <thead><tr><th>Khoản chi</th><th>Ngày</th><th>Danh mục</th><th style={{ textAlign: "right" }}>Số tiền</th>{editable && <th />}</tr></thead>
        <tbody>{rows.map((x) => (
          <tr key={x.id}>
            <td><b>{CATS[x.category]?.icon ?? "📦"} {x.description}</b></td><td>{viDate(x.date)}</td><td><span className="tag">{x.category}</span></td>
            <td className="money neg">−{fmt(x.amount)}</td>
            {editable && <td><div className="rowact">
              <button className="btn sm" onClick={() => setEdit(x)}>Sửa</button>
              <button className="btn sm danger" onClick={async () => { if (confirm(`Xóa khoản chi "${x.description}"? `) && (await remove("expenses", x.id))) toast("Đã xóa khoản chi."); }}>Xóa</button>
            </div></td>}
          </tr>))}</tbody>
      </table></div>
      {edit && <ExpenseForm initial={edit} onClose={() => setEdit(null)} />}
    </>
  );
}
