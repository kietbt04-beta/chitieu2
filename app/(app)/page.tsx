"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/components/AppProvider";
import { Bars, Card, Donut, Kpi, PageHead, PeriodFilter } from "@/components/ui";
import { byCategory, shiftProfit, sum, totalBalance } from "@/lib/calc";
import { fmt, viDate } from "@/lib/format";
import { getBuckets, inRange } from "@/lib/period";
import { CATS } from "@/lib/types";

export default function Overview() {
  const { data, range, period, shift } = useApp();
  const exp = useMemo(() => data.expenses.filter((e) => inRange(e.date, range)), [data, range]);
  const sh = useMemo(() => data.shifts.filter((s) => inRange(s.date, range)), [data, range]);
  const cats = byCategory(exp);
  const buckets = getBuckets(period, shift);
  const chart = buckets.map((b) => ({ bucket: b, a: sum(data.shifts.filter((s) => inRange(s.date, b)).map((s) => s.earnings)), b: sum(data.expenses.filter((e) => inRange(e.date, b)).map((e) => e.amount)) }));
  const top = [...exp].sort((a, b) => b.amount - a.amount).slice(0, 3);
  return (
    <>
      <PageHead title="Tổng quan" sub="Đã chi những gì và thu nhập ShopeeFood được bao nhiêu?" />
      <PeriodFilter />
      <div className="kpis">
        <Kpi cls="red" title="Tổng chi tiêu" value={sum(exp.map((e) => e.amount))} desc="Tiền đã thực chi trong kỳ" icon="↗" />
        <Kpi cls="green" title="Thu nhập ShopeeFood" value={sum(sh.map((s) => s.earnings))} desc="Tiền công, thưởng, tip đã ghi nhận" icon="♧" />
        <Kpi cls="purple" title="Lợi nhuận ShopeeFood" value={sum(sh.map(shiftProfit))} desc="Thu nhập trừ chi phí chạy xe" icon="◈" />
        <Kpi cls="dark" title="Tổng số dư hiện có" value={totalBalance(data)} desc="Tất cả các ví" icon="▣" />
      </div>
      <div className="two sect">
        <Bars title="Thu nhập ShopeeFood & chi tiêu" chip={period === "Ngày" ? "7 ngày gần nhất" : "Theo kỳ đã chọn"} data={chart} la="Thu nhập ShopeeFood" lb="Chi tiêu" />
        <Donut data={cats} />
      </div>
      <div className="three sect">
        <Card title="🔥 Top khoản chi" chip="Trong kỳ">
          {top.length === 0 && <div className="empty">Chưa có khoản chi.</div>}
          {top.map((x, i) => <div className="minirow" key={x.id}><span className="rname">{i + 1}. {x.description}</span><span className="rvalue neg">{fmt(x.amount)}</span></div>)}
        </Card>
        <Card title="💡 Điểm đáng chú ý">
          <div className="alertline">{cats[0] ? <>Danh mục chi nhiều nhất: <b>{CATS[cats[0][0]]?.icon} {cats[0][0]}</b> ({fmt(cats[0][1])}).</> : "Chưa có dữ liệu chi tiêu trong kỳ này."}</div>
          <div className="tipline" style={{ marginTop: 10 }}>Xăng phân bổ cho ca ShopeeFood chỉ tính vào lợi nhuận, <b>không cộng trùng</b> vào tiền đã chi.</div>
        </Card>
        <Card title="🛵 ShopeeFood gần đây">
          {sh.length === 0 && <div className="empty">Chưa có ca nào trong kỳ.</div>}
          {sh.slice(0, 3).map((x) => <div className="minirow" key={x.id}><div><div className="rname">Ca {viDate(x.date)}</div><div className="rdesc">{x.orders} đơn · {x.hours} giờ</div></div><span className="rvalue pos">+{fmt(x.earnings)}</span></div>)}
        </Card>
      </div>
      <div className="sect" style={{ display: "flex", justifyContent: "center", gap: 9, flexWrap: "wrap" }}>
        <Link href="/chi-tieu" className="btn primary">Xem chi tiêu →</Link><Link href="/shopee" className="btn">Xem ShopeeFood →</Link>
      </div>
    </>
  );
}
