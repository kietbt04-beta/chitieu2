"use client";
import { FormEvent, useState } from "react";
import { CATS, Expense, Shift } from "@/lib/types";
import { todayIso, uid } from "@/lib/format";
import { useApp } from "./AppProvider";
import { Field, Modal } from "./ui";

const num = (fd: FormData, k: string) => Number(fd.get(k));
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
function Footer({ onClose, label, busy }: { onClose: () => void; label: string; busy: boolean }) {
  return <div className="modalfooter"><button type="button" className="btn" onClick={onClose}>Hủy</button><button className="btn primary" disabled={busy}>{busy ? "Đang lưu…" : label}</button></div>;
}

export function ExpenseForm({ initial, onClose }: { initial?: Expense; onClose: () => void }) {
  const { save, toast } = useApp();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const amount = num(fd, "amount"), description = str(fd, "description");
    if (!description) return setErr("Nhập tên khoản chi.");
    if (!Number.isFinite(amount) || amount <= 0) return setErr("Số tiền phải lớn hơn 0.");
    setBusy(true);
    const ok = await save("expenses", { id: initial?.id ?? uid(), description, amount: Math.round(amount), date: str(fd, "date"), category: str(fd, "category") } satisfies Expense);
    setBusy(false); if (ok) { toast(initial ? "Đã cập nhật khoản chi." : "Đã thêm khoản chi."); onClose(); }
  }
  return (
    <Modal title={initial ? "Sửa chi tiêu" : "Thêm chi tiêu hằng ngày"} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Khoản chi"><input name="description" defaultValue={initial?.description} placeholder="Ví dụ: Ăn cơm, đổ xăng..." required autoFocus /></Field>
        <div className="formgrid">
          <Field label="Số tiền (đ)"><input name="amount" type="number" min="1" step="1" defaultValue={initial?.amount} required /></Field>
          <Field label="Ngày chi"><input name="date" type="date" defaultValue={initial?.date ?? todayIso()} required /></Field>
        </div>
        <Field label="Danh mục"><select name="category" defaultValue={initial?.category ?? "Ăn uống"}>{Object.keys(CATS).map((c) => <option key={c}>{c}</option>)}</select></Field>
        {err && <p className="errtxt">{err}</p>}
        <Footer onClose={onClose} label="Lưu khoản chi" busy={busy} />
      </form>
    </Modal>
  );
}

export function ShiftForm({ initial, onClose }: { initial?: Shift; onClose: () => void }) {
  const { save, toast } = useApp();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const earnings = num(fd, "earnings"), fuel = num(fd, "fuel_cost"), other = num(fd, "other_cost"), hours = num(fd, "hours"), orders = num(fd, "orders");
    if ([earnings, fuel, other, hours, orders].some((x) => !Number.isFinite(x) || x < 0)) return setErr("Các số không được âm.");
    if (hours <= 0) return setErr("Số giờ phải lớn hơn 0.");
    setBusy(true);
    const ok = await save("shifts", { id: initial?.id ?? uid(), date: str(fd, "date"), hours, orders: Math.round(orders), earnings: Math.round(earnings), fuel_cost: Math.round(fuel), other_cost: Math.round(other) } satisfies Shift);
    setBusy(false); if (ok) { toast(initial ? "Đã cập nhật ca." : "Đã thêm ca làm việc."); onClose(); }
  }
  return (
    <Modal title={initial ? "Sửa ca ShopeeFood" : "Thêm ca ShopeeFood"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="formgrid">
          <Field label="Ngày chạy"><input type="date" name="date" defaultValue={initial?.date ?? todayIso()} required /></Field>
          <Field label="Số đơn"><input type="number" min="0" name="orders" defaultValue={initial?.orders ?? 0} required /></Field>
        </div>
        <div className="formgrid">
          <Field label="Số giờ chạy"><input type="number" step="0.5" min="0.5" name="hours" defaultValue={initial?.hours ?? 4} required /></Field>
          <Field label="Thu nhập ca (đ)"><input type="number" min="0" name="earnings" defaultValue={initial?.earnings ?? 0} required /></Field>
        </div>
        <div className="formgrid">
          <Field label="Xăng phân bổ cho ca (đ)"><input type="number" min="0" name="fuel_cost" defaultValue={initial?.fuel_cost ?? 0} required /></Field>
          <Field label="Chi phí khác (đ)"><input type="number" min="0" name="other_cost" defaultValue={initial?.other_cost ?? 0} required /></Field>
        </div>
        {err && <p className="errtxt">{err}</p>}
        <div className="hint">Xăng phân bổ chỉ để tính lợi nhuận của ca, <b>không tính thêm vào tiền đã chi</b> vì tiền xăng đã ghi khi đổ xăng ở trang Chi tiêu.</div>
        <Footer onClose={onClose} label="Lưu ca làm việc" busy={busy} />
      </form>
    </Modal>
  );
}
