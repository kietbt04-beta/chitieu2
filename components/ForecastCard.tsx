"use client";
import { fmt } from "@/lib/format";
import { Forecast } from "@/lib/forecast";
import { Card } from "./ui";

export default function ForecastCard({ title, noun, f, color, good }: { title: string; noun: string; f: Forecast; color: string; good: "high" | "low" }) {
  const pct = f.projected > 0 ? Math.min(100, (f.sofar / f.projected) * 100) : 0;
  return (
    <Card title={title} chip={f.label}>
      <div className="muted small">Dự đoán cả tháng</div>
      <div style={{ fontSize: 34, fontWeight: 850, letterSpacing: -0.8, margin: "6px 0 14px", color }}>{fmt(f.projected)}</div>
      <div className="reportbar" style={{ margin: "0 0 14px" }}>
        <div className="track"><div style={{ width: `${pct}%`, background: color }} /></div>
      </div>
      <div className="minirow"><span className="rname">{noun} đến hôm nay</span><span className="rvalue">{fmt(f.sofar)}</span></div>
      <div className="minirow"><span className="rname">Trung bình mỗi ngày</span><span className="rvalue">{fmt(f.avg)}</span></div>
      <div className="minirow"><span className="rname">Còn lại trong tháng</span><span className="rvalue">{f.remaining} ngày (đã qua {f.elapsed}/{f.days})</span></div>
      <div className="footnote">
        {f.lowConfidence ? <b>Mới qua {f.elapsed} ngày nên dự đoán chưa chính xác. </b> : null}
        Ước tính = trung bình mỗi ngày từ đầu tháng × số ngày của tháng. Chỉ mang tính tham khảo, {good === "low" ? "chi nhiều hơn dự đoán sẽ làm con số này tăng." : "chạy thêm ca sẽ làm con số này tăng."}
      </div>
    </Card>
  );
}
