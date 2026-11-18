"use client";
import { FormEvent, useState } from "react";
import { CATS, Debt, DebtPayment, Expense, Income, Shift } from "@/lib/types";
import { debtStatus } from "@/lib/calc";
import { fmt } from "@/lib/format";
import { todayIso, uid } from "@/lib/format";
import { useApp } from "./AppProvider";
import { Field, Modal, MoneyInput } from "./ui";

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
          <Field label="Số tiền (đ)"><MoneyInput name="amount" defaultValue={initial?.amount} required /></Field>
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
          <Field label="Thu nhập ca (đ)"><MoneyInput name="earnings" defaultValue={initial?.earnings ?? 0} required /></Field>
        </div>
        <div className="formgrid">
          <Field label="Xăng phân bổ cho ca (đ)"><MoneyInput name="fuel_cost" defaultValue={initial?.fuel_cost ?? 0} required /></Field>
          <Field label="Chi phí khác (đ)"><MoneyInput name="other_cost" defaultValue={initial?.other_cost ?? 0} required /></Field>
        </div>
        {err && <p className="errtxt">{err}</p>}
        <div className="hint">Xăng phân bổ chỉ để tính lợi nhuận của ca, <b>không tính thêm vào tiền đã chi</b> vì tiền xăng đã ghi khi đổ xăng ở trang Chi tiêu.</div>
        <Footer onClose={onClose} label="Lưu ca làm việc" busy={busy} />
      </form>
    </Modal>
  );
}

export function IncomeForm({ initial, onClose }: { initial?: Income; onClose: () => void }) {
  const { save, toast } = useApp();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const amount = num(fd, "amount"), source = str(fd, "source");
    if (!source) return setErr("Nhập nguồn thu nhập (công việc).");
    if (!Number.isFinite(amount) || amount <= 0) return setErr("Số tiền phải lớn hơn 0.");
    setBusy(true);
    const ok = await save("incomes", { id: initial?.id ?? uid(), source, amount: Math.round(amount), date: str(fd, "date") } satisfies Income);
    setBusy(false); if (ok) { toast(initial ? "Đã cập nhật thu nhập." : "Đã thêm thu nhập."); onClose(); }
  }
  return (
    <Modal title={initial ? "Sửa thu nhập khác" : "Thêm thu nhập từ công việc khác"} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Công việc / nguồn thu"><input name="source" defaultValue={initial?.source} placeholder="Ví dụ: Làm thêm, bán hàng, freelance..." required autoFocus /></Field>
        <div className="formgrid">
          <Field label="Số tiền nhận (đ)"><MoneyInput name="amount" defaultValue={initial?.amount} required /></Field>
          <Field label="Ngày nhận"><input name="date" type="date" defaultValue={initial?.date ?? todayIso()} required /></Field>
        </div>
        {err && <p className="errtxt">{err}</p>}
        <div className="hint">Khoản này được cộng vào <b>Tổng thu nhập</b> trong Báo cáo tháng, cùng với lương và ShopeeFood. Không hiện ở Dashboard.</div>
        <Footer onClose={onClose} label="Lưu thu nhập" busy={busy} />
      </form>
    </Modal>
  );
}

export function DebtForm({ initial, onClose }: { initial?: Debt; onClose: () => void }) {
  const { data, save, toast } = useApp();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const total = num(fd, "total"), name = str(fd, "name");
    if (!name) return setErr("Nhập tên khoản nợ.");
    if (!Number.isFinite(total) || total <= 0) return setErr("Số tiền nợ phải lớn hơn 0.");
    if (initial && total < debtStatus(data, initial.id).paid) return setErr("Tổng nợ không được nhỏ hơn số tiền đã trả.");
    setBusy(true);
    const ok = await save("debts", { id: initial?.id ?? uid(), name, total: Math.round(total), date: str(fd, "date") } satisfies Debt);
    setBusy(false); if (ok) { toast(initial ? "Đã cập nhật khoản nợ." : "Đã thêm khoản nợ."); onClose(); }
  }
  return (
    <Modal title={initial ? "Sửa khoản nợ" : "Thêm khoản nợ"} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Tên khoản nợ / người cho vay"><input name="name" defaultValue={initial?.name} placeholder="Ví dụ: Nợ anh Hai, trả góp xe..." required autoFocus /></Field>
        <div className="formgrid">
          <Field label="Tổng số tiền nợ (đ)"><MoneyInput name="total" defaultValue={initial?.total} required /></Field>
          <Field label="Ngày vay"><input name="date" type="date" defaultValue={initial?.date ?? todayIso()} required /></Field>
        </div>
        {err && <p className="errtxt">{err}</p>}
        <div className="hint">Mỗi lần trả nợ ghi riêng bằng nút “Trả nợ”; web tự tính số đã trả và còn nợ.</div>
        <Footer onClose={onClose} label="Lưu khoản nợ" busy={busy} />
      </form>
    </Modal>
  );
}

export function PaymentForm({ debt, initial, onClose }: { debt: Debt; initial?: DebtPayment; onClose: () => void }) {
  const { data, save, toast } = useApp();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const st = debtStatus(data, debt.id);
  const room = st.remaining + (initial?.amount ?? 0);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const amount = num(fd, "amount");
    if (!Number.isFinite(amount) || amount <= 0) return setErr("Số tiền phải lớn hơn 0.");
    if (amount > room) return setErr(`Số tiền trả vượt quá số còn nợ (${fmt(room)}).`);
    setBusy(true);
    const ok = await save("debtPayments", { id: initial?.id ?? uid(), debt_id: debt.id, amount: Math.round(amount), date: str(fd, "date") } satisfies DebtPayment);
    setBusy(false); if (ok) { toast("Đã ghi lần trả nợ."); onClose(); }
  }
  return (
    <Modal title={`Trả nợ: ${debt.name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="formgrid">
          <Field label="Số tiền trả (đ)"><MoneyInput name="amount" defaultValue={initial?.amount} required /></Field>
          <Field label="Ngày trả"><input name="date" type="date" defaultValue={initial?.date ?? todayIso()} required /></Field>
        </div>
        {err && <p className="errtxt">{err}</p>}
        <div className="hint">Còn nợ: <b>{fmt(room)}</b>. Khoản trả nợ hiện riêng trong Báo cáo tháng, không bị tính trùng vào Chi tiêu hằng ngày.</div>
        <Footer onClose={onClose} label="Lưu lần trả" busy={busy} />
      </form>
    </Modal>
  );
}
