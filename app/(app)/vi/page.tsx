"use client";
import { useState } from "react";
import { useApp, useWalletName } from "@/components/AppProvider";
import { TransferForm, WalletForm } from "@/components/forms";
import { Card, PageHead } from "@/components/ui";
import { totalBalance, walletBalance, walletInUse } from "@/lib/calc";
import { fmt, viDate } from "@/lib/format";
import { Wallet } from "@/lib/types";

const ICON = { cash: "💵", bank: "🏦", other: "👛" };
export default function Wallets() {
  const { data, remove, toast } = useApp(); const wname = useWalletName();
  const [wf, setWf] = useState<Wallet | "new" | null>(null); const [tf, setTf] = useState(false);
  const transfers = [...data.transfers].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHead title="Ví và tài khoản" sub="Tiền hiện có trong túi và ngân hàng. Không theo dõi ví app ShopeeFood." action="Chuyển tiền giữa ví" onAction={() => setTf(true)} />
      <div className="walletsum"><div className="muted" style={{ fontWeight: 760 }}>TỔNG SỐ DƯ HIỆN CÓ</div><strong>{fmt(totalBalance(data))}</strong><div className="muted">Gồm {data.wallets.length} ví đang hoạt động</div></div>
      <div className="walletgrid">
        {data.wallets.map((w) => (
          <div className="walletcard" key={w.id}>
            <div className="cardheader"><h2>{ICON[w.kind]} {w.name}</h2><span className="badge">Đang dùng</span></div>
            <div className={`amount ${walletBalance(data, w.id) < 0 ? "neg" : ""}`}>{fmt(walletBalance(data, w.id))}</div>
            <div className="simplehint">Số dư mở đầu: {fmt(w.opening_balance)}</div>
            <div className="rowact" style={{ justifyContent: "flex-start", marginTop: 12 }}>
              <button className="btn sm" onClick={() => setWf(w)}>Sửa / đặt số dư mở đầu</button>
              {w.kind === "other" && <button className="btn sm danger" onClick={async () => {
                if (walletInUse(data, w.id)) return toast("Ví đã có giao dịch nên không thể xóa.");
                if (confirm(`Xóa ví "${w.name}"?`) && (await remove("wallets", w.id))) toast("Đã xóa ví.");
              }}>Xóa</button>}
            </div>
          </div>
        ))}
      </div>
      <div className="sect"><button className="btn" onClick={() => setWf("new")}>＋ Thêm ví</button></div>
      <Card title="Lịch sử chuyển ví" chip="Không tính thu/chi" className="sect">
        {!transfers.length ? <div className="empty">Chưa có lần chuyển nào.</div> : (
          <div className="tablewrap"><table className="data"><thead><tr><th>Ngày</th><th>Từ</th><th>Đến</th><th style={{ textAlign: "right" }}>Số tiền</th><th /></tr></thead>
            <tbody>{transfers.map((t) => (
              <tr key={t.id}><td>{viDate(t.date)}</td><td>{wname(t.from_wallet)}</td><td>{wname(t.to_wallet)}</td><td className="money">{fmt(t.amount)}</td>
                <td><div className="rowact"><button className="btn sm danger" onClick={async () => { if (confirm("Xóa lần chuyển này? Số dư hai ví sẽ trở lại như trước.") && (await remove("transfers", t.id))) toast("Đã xóa."); }}>Xóa</button></div></td></tr>))}</tbody></table></div>)}
      </Card>
      <Card title="Cách hoạt động" className="sect">
        <div className="minirow"><div><div className="rname">Chi tiêu hằng ngày</div><div className="rdesc">Trừ đúng một lần từ ví đã chọn.</div></div><span className="tag">Tiền ra</span></div>
        <div className="minirow"><div><div className="rname">Thu nhập ShopeeFood</div><div className="rdesc">Chỉ cộng vào ví khi bạn chọn ví nhận tiền ở ca.</div></div><span className="tag">Tiền vào</span></div>
        <div className="minirow"><div><div className="rname">Chuyển ví</div><div className="rdesc">Một ví giảm, ví kia tăng; không phải thu nhập hay chi tiêu.</div></div><span className="tag">Chuyển ví</span></div>
        <div className="footnote">Số dư luôn được tính lại từ số dư mở đầu và các giao dịch, nên sửa/xóa giao dịch không bao giờ làm lệch hay cộng trùng số dư.</div>
      </Card>
      {wf && <WalletForm initial={wf === "new" ? undefined : wf} onClose={() => setWf(null)} />}
      {tf && <TransferForm onClose={() => setTf(false)} />}
    </>
  );
}
