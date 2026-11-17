"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [err, setErr] = useState(""); const [info, setInfo] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { if (!supabaseConfigured) router.replace("/"); }, [router]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); setInfo("");
    const fd = new FormData(e.currentTarget); const email = String(fd.get("email")), password = String(fd.get("password"));
    const sb = getSupabase(); if (!sb) return;
    setBusy(true);
    if (mode === "in") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) setErr("Email hoặc mật khẩu không đúng."); else router.replace("/");
    } else {
      if (password.length < 8) { setErr("Mật khẩu tối thiểu 8 ký tự."); setBusy(false); return; }
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) setErr(error.message);
      else if (data.session) router.replace("/");
      else setInfo("Đã tạo tài khoản. Kiểm tra email để xác nhận rồi đăng nhập.");
    }
    setBusy(false);
  }
  return (
    <div className="loginwrap"><form className="loginbox" onSubmit={submit}>
      <div className="klogo">K</div>
      <h1>Bùi Thế Kiệt</h1><p className="hint" style={{ marginBottom: 20 }}>Chi tiêu & ShopeeFood · {mode === "in" ? "Đăng nhập" : "Tạo tài khoản"}</p>
      <div className="field"><label>Email</label><input name="email" type="email" autoComplete="email" required /></div>
      <div className="field"><label>Mật khẩu</label><input name="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} required /></div>
      {err && <p className="errtxt">{err}</p>}{info && <p className="hint" style={{ marginBottom: 12 }}>{info}</p>}
      <button className="btn primary" style={{ width: "100%", padding: 13 }} disabled={busy}>{busy ? "Đang xử lý…" : mode === "in" ? "Đăng nhập" : "Tạo tài khoản"}</button>
      <button type="button" className="btn" style={{ width: "100%", marginTop: 8, border: 0, background: "transparent" }} onClick={() => { setMode(mode === "in" ? "up" : "in"); setErr(""); setInfo(""); }}>
        {mode === "in" ? "Chưa có tài khoản? Tạo mới" : "Đã có tài khoản? Đăng nhập"}
      </button>
    </form></div>
  );
}
