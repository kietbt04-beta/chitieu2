"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";
import TopbarRight from "./TopbarRight";

const NAV: [string, string, string, string][] = [
  ["TRANG CHÍNH", "/", "▦", "Dashboard"],
  ["CHI TIÊU", "/chi-tieu", "▤", "Chi tiêu hằng ngày"],
  ["", "/danh-muc", "◈", "Danh mục chi tiêu"],
  ["CÔNG VIỆC", "/shopee", "♧", "Tài xế ShopeeFood"],
  ["", "/thu-nhap-khac", "✚", "Thu nhập khác"],
  ["TÀI CHÍNH CÁ NHÂN", "/khoan-no", "⚖", "Khoản nợ"],
  ["", "/bao-cao", "◩", "Báo cáo tháng"],
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { ready, local } = useApp();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => setOpen(false), [path]);
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const p = (n: number) => String(n).padStart(2, "0");
  const short = now ? `${p(now.getDate())}/${p(now.getMonth() + 1)} ${p(now.getHours())}:${p(now.getMinutes())}` : "…";
  const when = now ? `${days[now.getDay()]}, ${p(now.getDate())}/${p(now.getMonth() + 1)}/${now.getFullYear()} · ${p(now.getHours())}:${p(now.getMinutes())}` : "…";

  return (
    <div className="layout">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link href="/" className="brand" style={{ textDecoration: "none", color: "inherit" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="avatarimg" src="/avatar-256.png" alt="Kiệt Beta" width={43} height={43} /><div><h3>Bùi Thế Kiệt</h3><p>Quản lý chi tiêu cá nhân</p></div>
        </Link>
        <nav className="nav">
          {NAV.map(([label, href, icon, text]) => (
            <div key={href}>
              {label && <div className="navlabel">{label}</div>}
              <Link href={href} className={`navbtn ${path === href ? "active" : ""}`} style={{ textDecoration: "none" }}><span className="navicon">{icon}</span>{text}</Link>
            </div>
          ))}
        </nav>
        <div className="navfoot">
          <Link href="/tro-ly-ai" className={`aibtn ${path === "/tro-ly-ai" ? "active" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" /></svg>
            Trợ lý AI
          </Link>
          {local && <div className="sidebarhint">CHẾ ĐỘ CỤC BỘ · CHƯA NỐI SUPABASE</div>}
        </div>
      </aside>
      <div className={`mobileoverlay ${open ? "show" : ""}`} onClick={() => setOpen(false)} />
      <div className="main">
        <header className="topbar">
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <button className="iconbtn mobilebtn" aria-label="Mở menu" onClick={() => setOpen(true)}>☰</button>
            <Link href="/" aria-label="Về Dashboard" className="topbarlink"><img className="avatarimg topbarlogo" src="/avatar-256.png" alt="Kiệt Beta" width={40} height={40} /></Link>
            <div className="datewrap">
              <button className="datepill" aria-expanded={dateOpen} onClick={() => setDateOpen((v) => !v)}>
                <svg className="dpclock" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                <span className="dp-long">{when}</span><span className="dp-short">{short}</span>
                <svg className="dpchev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              {dateOpen && <div className="datepop" onClick={() => setDateOpen(false)}>{when}</div>}
            </div>
          </div>
          <TopbarRight />
        </header>
        <main className="content">{ready ? children : <div className="card">Đang tải dữ liệu…</div>}</main>
      </div>
    </div>
  );
}
