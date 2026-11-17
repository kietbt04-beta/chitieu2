"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";

const NAV: [string, string, string, string][] = [
  ["TRANG CHÍNH", "/", "▦", "Dashboard"],
  ["CHI TIÊU", "/chi-tieu", "▤", "Chi tiêu hằng ngày"],
  ["", "/danh-muc", "◈", "Danh mục chi tiêu"],
  ["CÔNG VIỆC", "/shopee", "♧", "Tài xế ShopeeFood"],
  ["TÀI CHÍNH CÁ NHÂN", "/bao-cao", "◩", "Báo cáo tháng"],
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { ready, local, email, logout, dark, toggleDark } = useApp();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => setOpen(false), [path]);
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const p = (n: number) => String(n).padStart(2, "0");
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
          {email && <><div className="sidebarhint" style={{ paddingTop: 0 }}>{email}</div><button className="btn logoutbtn" onClick={logout}>Đăng xuất</button></>}
          {local && <div className="sidebarhint">CHẾ ĐỘ CỤC BỘ · CHƯA NỐI SUPABASE</div>}
        </div>
      </aside>
      <div className={`mobileoverlay ${open ? "show" : ""}`} onClick={() => setOpen(false)} />
      <div className="main">
        <header className="topbar">
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <button className="iconbtn mobilebtn" aria-label="Mở menu" onClick={() => setOpen(true)}>☰</button>
            <div className="datepill">◷ <span>{when}</span></div>
          </div>
          <div className="topright">
            {local && <span className="localtag demotag-lite">DỮ LIỆU TRONG TRÌNH DUYỆT</span>}
            <button className="iconbtn" title="Đổi giao diện sáng/tối" onClick={toggleDark}>{dark ? "☀" : "☾"}</button>
          </div>
        </header>
        <main className="content">{ready ? children : <div className="card">Đang tải dữ liệu…</div>}</main>
      </div>
    </div>
  );
}
