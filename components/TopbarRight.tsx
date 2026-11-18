"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildNotices } from "@/lib/notifications";
import { useApp } from "./AppProvider";

const NAME = "Bùi Thế Kiệt";
const READ_KEY = "chitieu2:read-notices";

function useClickAway(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", down); document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open, close]);
  return ref;
}

export default function TopbarRight() {
  const { data, ready, local, email, logout, dark, toggleDark } = useApp();
  const [panel, setPanel] = useState<"bell" | "account" | null>(null);
  const [read, setRead] = useState<string[]>([]);
  useEffect(() => { try { setRead(JSON.parse(localStorage.getItem(READ_KEY) || "[]")); } catch {} }, []);
  const notices = useMemo(() => (ready ? buildNotices(data) : []), [data, ready]);
  const unread = notices.filter((n) => !read.includes(n.id));
  const markRead = (ids: string[]) => { const next = [...new Set([...read, ...ids])].slice(-200); setRead(next); try { localStorage.setItem(READ_KEY, JSON.stringify(next)); } catch {} };
  const close = () => setPanel(null);
  const bellRef = useClickAway(panel === "bell", close);
  const accRef = useClickAway(panel === "account", close);

  return (
    <div className="topright">
      {local && <span className="localtag demotag-lite">DỮ LIỆU TRONG TRÌNH DUYỆT</span>}
      <button className="iconbtn" title="Đổi giao diện sáng/tối" onClick={toggleDark}>{dark ? "☀" : "☾"}</button>

      <div className="popwrap" ref={bellRef}>
        <button className="iconbtn bellbtn" aria-label="Thông báo" aria-expanded={panel === "bell"} onClick={() => setPanel(panel === "bell" ? null : "bell")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
          {unread.length > 0 && <span className="badgecount">{unread.length > 99 ? "99+" : unread.length}</span>}
        </button>
        {panel === "bell" && (
          <div className="popmenu" role="dialog" aria-label="Thông báo">
            <div className="pophead"><b>Thông báo</b>{unread.length > 0 && <button className="linkbtn" onClick={() => markRead(notices.map((n) => n.id))}>Đánh dấu đã đọc</button>}</div>
            {notices.length === 0 && <div className="empty" style={{ padding: 18 }}>Không có thông báo nào. Mọi thứ đang ổn 👍</div>}
            {notices.map((n) => (
              <Link key={n.id} href={n.href} className={`noticeitem ${read.includes(n.id) ? "" : "unread"}`} onClick={() => { markRead([n.id]); close(); }}>
                <span className="noticeico">{n.icon}</span>
                <span><b>{n.title}</b><span className="noticetext">{n.text}</span></span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="popwrap" ref={accRef}>
        <button className="accbtn" aria-expanded={panel === "account"} onClick={() => setPanel(panel === "account" ? null : "account")}>
          <span className="accavatar">B</span>
          <span className="acctext"><b>{NAME}</b><small>{email ?? "Chế độ cục bộ"}</small></span>
          <svg className="accchev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
        {panel === "account" && (
          <div className="popmenu" style={{ width: 260 }}>
            <div className="pophead" style={{ display: "block" }}><b>{NAME}</b><div className="small muted" style={{ wordBreak: "break-all" }}>{email ?? "Dữ liệu đang lưu trong trình duyệt này"}</div></div>
            <button className="menuitem" onClick={() => { toggleDark(); close(); }}>{dark ? "☀ Giao diện sáng" : "☾ Giao diện tối"}</button>
            {email && <button className="menuitem danger" onClick={() => { close(); logout(); }}>⎋ Đăng xuất</button>}
          </div>
        )}
      </div>
    </div>
  );
}
