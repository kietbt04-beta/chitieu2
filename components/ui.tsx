"use client";
import { ReactNode, useEffect } from "react";
import { fmt } from "@/lib/format";
import { CATS } from "@/lib/types";
import { PERIODS, Bucket } from "@/lib/period";
import { useApp } from "./AppProvider";

export function PageHead({ title, sub, action, onAction }: { title: string; sub: string; action?: string; onAction?: () => void }) {
  return (
    <div className="head">
      <div><h1>{title}</h1><p>{sub}</p></div>
      {action && <button className="btn primary" onClick={onAction}>＋ {action}</button>}
    </div>
  );
}

export function PeriodFilter() {
  const { period, setPeriod, shift, setShift, range } = useApp();
  return (
    <div className="filterbar">
      <div className="period">
        {PERIODS.map((p) => <button key={p} className={period === p ? "active" : ""} onClick={() => setPeriod(p)}>{p}</button>)}
      </div>
      <div className="rangetxt">
        <button className="btn" style={{ padding: "7px 11px" }} aria-label="Kỳ trước" onClick={() => setShift(shift - 1)}>‹</button>
        &nbsp; {range.label} &nbsp;
        <button className="btn" style={{ padding: "7px 11px" }} aria-label="Kỳ sau" onClick={() => setShift(shift + 1)}>›</button>
        {shift !== 0 && <>&nbsp;<button className="btn sm" onClick={() => setShift(0)}>Hiện tại</button></>}
      </div>
    </div>
  );
}

export function Kpi({ cls, title, value, desc, icon, raw }: { cls: string; title: string; value: number; desc: string; icon: string; raw?: boolean }) {
  return (
    <div className={`kpi ${cls}`}>
      <span className="ki">{icon}</span>
      <div className="kt">{title}</div>
      <div className="kv">{raw ? value : fmt(value)}</div>
      <div className="ks">{desc}</div>
    </div>
  );
}

export function Card({ title, chip, children, className = "" }: { title: string; chip?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`card ${className}`}>
      <div className="cardheader"><h2>{title}</h2>{chip && <span className="chchip">{chip}</span>}</div>
      {children}
    </div>
  );
}

export function Donut({ data }: { data: [string, number][] }) {
  const total = data.reduce((t, d) => t + d[1], 0);
  let p = 0;
  const grad = data.map(([n, v]) => { const s = p; p += (v / Math.max(total, 1)) * 100; return `${CATS[n]?.color ?? "#bbb"} ${s}% ${p}%`; }).join(",");
  return (
    <Card title="Chi tiêu theo danh mục" chip="Trong kỳ">
      <div className="ringlayout">
        <div className="donut" style={{ background: `conic-gradient(${grad || "#ddd 0 100%"})` }}>
          <div><div style={{ fontSize: 9, fontWeight: 500 }}>TỔNG CHI<strong style={{ fontSize: 14, display: "block", marginTop: 3 }}>{fmt(total)}</strong></div></div>
        </div>
        <div className="catlist">
          {data.length === 0 && <span className="muted small">Chưa có khoản chi.</span>}
          {data.slice(0, 6).map(([n, v]) => (
            <div className="catrow" key={n}><span><i className="dot" style={{ background: CATS[n]?.color ?? "#aaa" }} />{n}</span><strong>{Math.round((v / Math.max(total, 1)) * 100)}%</strong></div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export interface BarDatum { bucket: Bucket; a: number; b: number }
export function Bars({ title, chip, data, la, lb, hideA }: { title: string; chip: string; data: BarDatum[]; la: string; lb: string; hideA?: boolean }) {
  const max = Math.max(...data.map((d) => Math.max(hideA ? 0 : d.a, d.b)), 1);
  return (
    <Card title={title} chip={chip}>
      <div className="bars">
        {data.map((d, i) => (
          <div className="bargroup" key={i}>
            <div className="barpair">
              {!hideA && <div className="bar income" title={`${la}: ${fmt(d.a)}`} style={{ height: `${(d.a / max) * 100}%` }} />}
              <div className="bar expense" title={`${lb}: ${fmt(d.b)}`} style={{ height: `${(d.b / max) * 100}%` }} />
            </div>
            <div className="barname">{d.bucket.label}</div>
          </div>
        ))}
      </div>
      <div className="legend">{!hideA && <span><i className="dot" style={{ background: "#1ab47f" }} />{la}</span>}<span><i className="dot" style={{ background: "#ef5b59" }} />{lb}</span></div>
    </Card>
  );
}

export function CatBars({ data }: { data: [string, number][] }) {
  const max = Math.max(...data.map((d) => d[1]), 1);
  if (!data.length) return <div className="empty">Chưa có khoản chi trong kỳ này.</div>;
  return <>{data.map(([n, v]) => (
    <div className="reportbar" key={n}><span>{CATS[n]?.icon ?? "📦"} {n}</span><div className="track"><div style={{ width: `${(v / max) * 100}%`, background: CATS[n]?.color ?? "#aaa" }} /></div><strong>{fmt(v)}</strong></div>
  ))}</>;
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="modalshade show" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true">
        <div className="modalhead"><h2>{title}</h2><button className="iconbtn" onClick={onClose} aria-label="Đóng">×</button></div>
        {children}
      </section>
    </div>
  );
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => <div className="field"><label>{label}</label>{children}</div>;
