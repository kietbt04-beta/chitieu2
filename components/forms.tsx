"use client";
import { FormEvent, useState } from "react";
import { CATS, Expense, Shift, Transfer, Wallet } from "@/lib/types";
import { fmt, todayIso, uid } from "@/lib/format";
import { walletBalance } from "@/lib/calc";
import { useApp } from "./AppProvider";
import { Field, Modal } from "./ui";

const num = (fd: FormData, k: string) => Number(fd.get(k));
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
function Footer({ onClose, label, busy }: { onClose: () => void; label: string; busy: boolean }) {
  return <div className="modalfooter"><button type="button" className="btn" onClick={onClose}>Hủy</button><button className="btn primary" disabled={busy}>{busy ? "Đang lưu…" : label}</button></div>;
}

export function ExpenseForm({ initial, onClose }: { initial?: Expense; onClose: () => void }) {
  const { data, save, toast } = useApp();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const amount = num(fd, "amount"), description = str(fd, "description");
    if (!description) return setErr("Nhập tên khoản chi.");
    if (!Number.isFinite(amount) || amount <= 0) return setErr("Số tiền phải lớn hơn 0.");
    setBusy(true);
    const ok = await save("expenses", { id: initial?.id ?? uid(), description, amount: Math.round(amount), date: str(fd, "date"), category: str(fd, "category"), wallet_id: str(fd, "wallet_id") } satisfies Expense);
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
        <div className="formgrid">
          <Field label="Danh mục"><select name="category" defaultValue={initial?.category ?? "Ăn uống"}>{Object.keys(CATS).map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Trả bằng ví"><select name="wallet_id" defaultValue={initial?.wallet_id ?? data.wallets[0]?.id}>{data.wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></Field>
        </div>
        {err && <p className="errtxt">{err}</p>}
        <div className="hint">Tiền chỉ bị trừ một lần từ ví đã chọn. Sửa hoặc xóa sẽ tự cập nhật số dư.</div>
        <Footer onClose={onClose} label="Lưu khoản chi" busy={busy} />
      </form>
    </Modal>
  );
}

export function ShiftForm({ initial, onClose }: { initial?: Shift; onClose: () => void }) {
  const { data, save, toast } = useApp();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const earnings = num(fd, "earnings"), fuel = num(fd, "fuel_cost"), other = num(fd, "other_cost"), hours = num(fd, "hours"), orders = num(fd, "orders");
    if ([earnings, fuel, other, hours, orders].some((x) => !Number.isFinite(x) || x < 0)) return setErr("Các số không được âm.");
    if (hours <= 0) return setErr("Số giờ phải lớn hơn 0.");
    const w = str(fd, "wallet_id");
    setBusy(true);
    const ok = await save("shifts", { id: initial?.id ?? uid(), date: str(fd, "date"), hours, orders: Math.round(orders), earnings: Math.round(earnings), fuel_cost: Math.round(fuel), other_cost: Math.round(other), wallet_id: w || null } satisfies Shift);
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
        <Field label="Tiền công đã về ví nào?">
          <select name="wallet_id" defaultValue={initial?.wallet_id ?? ""}><option value="">Chưa nhận tiền</option>{data.wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>
        </Field>
        {err && <p className="errtxt">{err}</p>}
        <div className="hint">Chỉ chọn ví khi tiền công đã thực nhận. Xăng phân bổ chỉ để tính lợi nhuận, <b>không trừ ví thêm</b> vì đã ghi khi đổ xăng ở Chi tiêu.</div>
        <Footer onClose={onClose} label="Lưu ca làm việc" busy={busy} />
      </form>
    </Modal>
  );
}

export function TransferForm({ initial, onClose }: { initial?: Transfer; onClose: () => void }) {
  const { data, saveTransfer, toast } = useApp();
  const [from, setFrom] = useState(initial?.from_wallet ?? data.wallets[1]?.id ?? data.wallets[0]?.id);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    setBusy(true);
    const ok = await saveTransfer({ id: initial?.id, date: str(fd, "date"), from_wallet: str(fd, "from_wallet"), to_wallet: str(fd, "to_wallet"), amount: Math.round(num(fd, "amount")) });
    setBusy(false); if (ok) { toast("Đã chuyển tiền giữa hai ví."); onClose(); }
  }
  const avail = from ? walletBalance(data, from) : 0;
  return (
    <Modal title="Chuyển tiền giữa các ví" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="formgrid">
          <Field label="Từ ví"><select name="from_wallet" value={from} onChange={(e) => setFrom(e.target.value)}>{data.wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></Field>
          <Field label="Đến ví"><select name="to_wallet" defaultValue={initial?.to_wallet ?? data.wallets.find((w) => w.id !== from)?.id}>{data.wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></Field>
        </div>
        <div className="formgrid">
          <Field label="Số tiền (đ)"><input type="number" min="1" name="amount" defaultValue={initial?.amount} required /></Field>
          <Field label="Ngày"><input type="date" name="date" defaultValue={initial?.date ?? todayIso()} required /></Field>
        </div>
        <div className="hint">Số dư ví nguồn: <b>{fmt(avail)}</b>. Chuyển ví không tính là thu nhập hay chi tiêu; tổng tiền không đổi.</div>
        <Footer onClose={onClose} label="Chuyển tiền" busy={busy} />
      </form>
    </Modal>
  );
}

export function WalletForm({ initial, onClose }: { initial?: Wallet; onClose: () => void }) {
  const { save, toast } = useApp();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = new FormData(e.currentTarget);
    const name = str(fd, "name"), opening = num(fd, "opening_balance");
    if (!name) return setErr("Nhập tên ví.");
    if (!Number.isFinite(opening)) return setErr("Số dư mở đầu không hợp lệ.");
    setBusy(true);
    const ok = await save("wallets", { id: initial?.id ?? uid(), name, kind: initial?.kind ?? "other", opening_balance: Math.round(opening) } satisfies Wallet);
    setBusy(false); if (ok) { toast("Đã lưu ví."); onClose(); }
  }
  return (
    <Modal title={initial ? "Sửa ví" : "Thêm ví mới"} onClose={onClose}>
      <form onSubmit={submit}>
        <Field label="Tên ví"><input name="name" defaultValue={initial?.name} placeholder="Ví dụ: Momo" required autoFocus /></Field>
        <Field label="Số dư mở đầu (đ)"><input name="opening_balance" type="number" step="1" defaultValue={initial?.opening_balance ?? 0} required /></Field>
        {err && <p className="errtxt">{err}</p>}
        <div className="hint">Số dư mở đầu là mốc bắt đầu theo dõi, <b>không phải thu nhập</b>. Số dư hiện tại = mở đầu − chi + thu nhập nhận + chuyển vào − chuyển ra.</div>
        <Footer onClose={onClose} label="Lưu ví" busy={busy} />
      </form>
    </Modal>
  );
}
