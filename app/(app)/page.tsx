"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Bars, Card, Donut, Kpi, PageHead, PeriodFilter } from "@/components/ui";
import { byCategory, shiftProfit, sum } from "@/lib/calc";
import { fmt, viDate } from "@/lib/format";
import { getBuckets, inRange } from "@/lib/period";
import { CATS } from "@/lib/types";
import { monthForecast } from "@/lib/forecast";
import ForecastCard from "@/components/ForecastCard";

type View = "chi" | "shopee";
const TABS: [View, string][] = [["chi", "Spend"], ["shopee", "Driver"]];

export default function Overview() {
  const { data, range, period, shift } = useApp();
  const [view, setView] = useState<View>("chi");
  const exp = useMemo(() => data.expenses.filter((e) => inRange(e.date, range)), [data, range]);
  const sh = useMemo(() => data.shifts.filter((s) => inRange(s.date, range)), [data, range]);
  const cats = byCategory(exp);
  const buckets = getBuckets(period, shift);
  const chip = period === "Ngày" ? "7 ngày gần nhất" : "Theo kỳ đã chọn";
  const spent = sum(exp.map((e) => e.amount));
  const earn = sum(sh.map((s) => s.earnings));
  const costs = sum(sh.map((s) => s.fuel_cost + s.other_cost));
  const fcSpend = useMemo(() => monthForecast(data.expenses.map((e) => ({ date: e.date, amount: e.amount }))), [data]);
  const fcIncome = useMemo(() => monthForecast(data.shifts.map((x) => ({ date: x.date, amount: x.earnings }))), [data]);
  const top = [...exp].sort((a, b) => b.amount - a.amount).slice(0, 3);

  return (
    <>
      <PageHead title="Dashboard" sub="Đã chi những gì và thu nhập ShopeeFood được bao nhiêu?" />
      <div className="period" style={{ display: "inline-flex", marginBottom: 20 }} role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={view === k} className={view === k ? "active" : ""} style={{ padding: "10px 22px", fontSize: 13 }} onClick={() => setView(k)}>{label}</button>
        ))}
      </div>
      <PeriodFilter />

      {view === "chi" ? (
        <>
          <div className="kpis">
            <Kpi cls="red" title="Tổng chi tiêu" value={spent} desc="Tiền đã thực chi trong kỳ" icon="↗" />
            <Kpi cls="purple" title="Số khoản chi" value={exp.length} raw desc="Giao dịch trong kỳ" icon="▤" />
            <Kpi cls="green" title="Khoản chi lớn nhất" value={top[0]?.amount ?? 0} desc={top[0]?.description ?? "Chưa có khoản chi"} icon="🔥" />
            <Kpi cls="dark" title="Chi trung bình mỗi ngày" value={fcSpend.avg} desc="Tính từ đầu tháng đến hôm nay" icon="◷" />
          </div>
          <div className="sect"><ForecastCard title="🔮 Dự đoán chi tiêu tháng này" noun="Đã chi" f={fcSpend} color="#ea5964" good="low" /></div>
          <div className="two sect">
            <Bars title="Chi tiêu theo kỳ" chip={chip} hideA la="" lb="Chi tiêu" data={buckets.map((b) => ({ bucket: b, a: 0, b: sum(data.expenses.filter((e) => inRange(e.date, b)).map((e) => e.amount)) }))} />
            <Donut data={cats} />
          </div>
          <div className="equal2 sect">
            <Card title="🔥 Top khoản chi" chip="Trong kỳ">
              {top.length === 0 && <div className="empty">Chưa có khoản chi.</div>}
              {top.map((x, i) => <div className="minirow" key={x.id}><span className="rname">{i + 1}. {x.description}</span><span className="rvalue neg">{fmt(x.amount)}</span></div>)}
            </Card>
            <Card title="💡 Điểm đáng chú ý">
              <div className="alertline">{cats[0] ? <>Danh mục chi nhiều nhất: <b>{CATS[cats[0][0]]?.icon} {cats[0][0]}</b> ({fmt(cats[0][1])}).</> : "Chưa có dữ liệu chi tiêu trong kỳ này."}</div>
              <div className="tipline" style={{ marginTop: 10 }}>Xăng phân bổ cho ca ShopeeFood chỉ tính vào lợi nhuận, <b>không cộng trùng</b> vào tiền đã chi.</div>
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="kpis">
            <Kpi cls="green" title="Thu nhập ShopeeFood" value={earn} desc="Tiền công, thưởng, tip đã ghi nhận" icon="♧" />
            <Kpi cls="red" title="Xăng & chi phí chạy xe" value={costs} desc="Xăng phân bổ + chi phí khác" icon="⛽" />
            <Kpi cls="purple" title="Lợi nhuận ShopeeFood" value={sum(sh.map(shiftProfit))} desc="Thu nhập trừ chi phí chạy xe" icon="◈" />
            <Kpi cls="dark" title="Số ca làm việc" value={sh.length} raw desc={`${sum(sh.map((s) => s.orders))} đơn · ${sum(sh.map((s) => s.hours))} giờ`} icon="🛵" />
          </div>
          <div className="sect"><ForecastCard title="🔮 Dự đoán thu nhập ShopeeFood tháng này" noun="Đã kiếm" f={fcIncome} color="#139b76" good="high" /></div>
          <div className="two sect">
            <Bars title="Thu nhập ShopeeFood theo kỳ" chip={chip} la="Thu nhập" lb="Chi phí ca" data={buckets.map((b) => { const s = data.shifts.filter((x) => inRange(x.date, b)); return { bucket: b, a: sum(s.map((x) => x.earnings)), b: sum(s.map((x) => x.fuel_cost + x.other_cost)) }; })} />
            <Card title="🛵 Ca gần đây">
              {sh.length === 0 && <div className="empty">Chưa có ca nào trong kỳ.</div>}
              {[...sh].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((x) => (
                <div className="minirow" key={x.id}><div><div className="rname">Ca {viDate(x.date)}</div><div className="rdesc">{x.orders} đơn · {x.hours} giờ</div></div><span className="rvalue pos">+{fmt(x.earnings)}</span></div>
              ))}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
