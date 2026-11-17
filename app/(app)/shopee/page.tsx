"use client";
import { useState } from "react";
import { useApp, useWalletName } from "@/components/AppProvider";
import { ShiftForm } from "@/components/forms";
import { Bars, Card, Kpi, PageHead, PeriodFilter } from "@/components/ui";
import { shiftProfit, sum } from "@/lib/calc";
import { fmt, viDate } from "@/lib/format";
import { getBuckets, inRange } from "@/lib/period";
import { FUEL_CAT, Shift } from "@/lib/types";

export default function Shopee() {
  const { data, range, period, shift, remove, toast } = useApp(); const wname = useWalletName();
  const [form, setForm] = useState<Shift | "new" | null>(null);
  const shifts = data.shifts.filter((s) => inRange(s.date, range)).sort((a, b) => b.date.localeCompare(a.date));
  const hours = sum(shifts.map((s) => s.hours)), orders = sum(shifts.map((s) => s.orders));
  const earn = sum(shifts.map((s) => s.earnings)), fuel = sum(shifts.map((s) => s.fuel_cost)), other = sum(shifts.map((s) => s.other_cost));
  const fuelPaid = sum(data.expenses.filter((e) => e.category === FUEL_CAT && inRange(e.date, range)).map((e) => e.amount));
  const chart = getBuckets(period, shift).map((b) => { const s = data.shifts.filter((x) => inRange(x.date, b)); return { bucket: b, a: sum(s.map((x) => x.earnings)), b: sum(s.map((x) => x.fuel_cost + x.other_cost)) }; });
  return (
    <>
      <PageHead title="Tài xế ShopeeFood" sub="Theo dõi tiền công kiếm được, số ca và chi phí chạy xe." action="Thêm ca làm việc" onAction={() => setForm("new")} />
      <PeriodFilter />
      <div className="infonote">✦ Không cần nhập từng đơn tiền mặt hay từng lần nạp ví app. Khi app chốt thu nhập, chỉ ghi <b>tổng thu nhập của ca</b> một lần.</div>
      <div className="kpis">
        <Kpi cls="green" title="Thu nhập ShopeeFood" value={earn} desc="Tổng tiền kiếm được trong kỳ" icon="↗" />
        <Kpi cls="red" title="Xăng & chi phí chạy xe" value={fuel + other} desc="Xăng phân bổ + chi phí khác của ca" icon="⛽" />
        <Kpi cls="purple" title="Lợi nhuận ước tính" value={earn - fuel - other} desc="Thu nhập − xăng − chi phí khác" icon="◈" />
        <Kpi cls="dark" title="Số ca làm việc" value={shifts.length} raw desc={`${orders} đơn · ${hours} giờ`} icon="♧" />
      </div>
      <div className="two sect">
        <Bars title="Thu nhập theo kỳ" chip="Tổng hợp tự động" data={chart} la="Thu nhập" lb="Chi phí ca" />
        <Card title="Chỉ số & phân bổ xăng">
          <div className="minirow"><span className="rname">Thu nhập / giờ</span><span className="rvalue">{fmt(earn / Math.max(hours, 1))}</span></div>
          <div className="minirow"><span className="rname">Thu nhập / đơn</span><span className="rvalue">{fmt(earn / Math.max(orders, 1))}</span></div>
          <div className="minirow"><div><div className="rname">Xăng đã đổ (từ Chi tiêu)</div><div className="rdesc">Danh mục “{FUEL_CAT}” trong kỳ</div></div><span className="rvalue">{fmt(fuelPaid)}</span></div>
          <div className="minirow"><div><div className="rname">Xăng đã phân bổ cho ca</div><div className="rdesc">Chưa phân bổ: {fmt(Math.max(fuelPaid - fuel, 0))}</div></div><span className="rvalue">{fmt(fuel)}</span></div>
          {fuel > fuelPaid && <div className="warnline">Xăng phân bổ cho ca ({fmt(fuel)}) đang lớn hơn xăng đã ghi ở Chi tiêu ({fmt(fuelPaid)}). Kiểm tra lại để lợi nhuận không bị lệch.</div>}
        </Card>
      </div>
      <Card title="Quản lý ca làm việc" chip={`${shifts.length} ca`} className="sect">
        {!shifts.length ? <div className="empty">Chưa có ca nào trong kỳ này.</div> : (
          <div className="tablewrap"><table className="data">
            <thead><tr><th>Ngày chạy</th><th>Giờ</th><th>Đơn</th><th>Thu nhập</th><th>Xăng</th><th>Chi phí khác</th><th>Nhận về</th><th style={{ textAlign: "right" }}>Lợi nhuận</th><th /></tr></thead>
            <tbody>{shifts.map((x) => (
              <tr key={x.id}>
                <td><b>{viDate(x.date)}</b></td><td>{x.hours}</td><td>{x.orders}</td><td className="pos">{fmt(x.earnings)}</td><td>{fmt(x.fuel_cost)}</td><td>{fmt(x.other_cost)}</td>
                <td>{x.wallet_id ? wname(x.wallet_id) : <span className="tag">Chưa nhận</span>}</td><td className="money pos">{fmt(shiftProfit(x))}</td>
                <td><div className="rowact"><button className="btn sm" onClick={() => setForm(x)}>Sửa</button>
                  <button className="btn sm danger" onClick={async () => { if (confirm("Xóa ca này? Nếu tiền công đã về ví, số dư ví sẽ giảm tương ứng.") && (await remove("shifts", x.id))) toast("Đã xóa ca."); }}>Xóa</button></div></td>
              </tr>))}</tbody>
          </table></div>
        )}
        <div className="footnote">Xăng đổ 100k ghi một lần ở Chi tiêu; phân bổ 30k cho ca A và 20k cho ca B chỉ để tính lợi nhuận, không trừ ví thêm.</div>
      </Card>
      {form && <ShiftForm initial={form === "new" ? undefined : form} onClose={() => setForm(null)} />}
    </>
  );
}
