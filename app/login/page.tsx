"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

type Mode = "in" | "up" | "forgot";

const MailIcon = () => <svg className="lg-ico" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.5 7 8.5 6.5L20.5 7" /></svg>;
const LockIcon = () => <svg className="lg-ico" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>;
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" /><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.100 0 24s.9 7.600 2.600 10.800l7.900-6.100z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" /></svg>
);

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("in");
  const [err, setErr] = useState(""); const [info, setInfo] = useState(""); const [busy, setBusy] = useState(false);
  const [google, setGoogle] = useState(false);

  useEffect(() => { if (!supabaseConfigured) router.replace("/"); }, [router]);
  // Chỉ hiện nút Google khi Supabase đã bật đăng nhập Google
  useEffect(() => {
    if (!supabaseConfigured) return;
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! } })
      .then((r) => r.json()).then((s) => setGoogle(Boolean(s?.external?.google))).catch(() => setGoogle(false));
  }, []);

  const go = (m: Mode) => { setMode(m); setErr(""); setInfo(""); };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); setInfo("");
    const fd = new FormData(e.currentTarget); const email = String(fd.get("email")).trim(), password = String(fd.get("password") ?? "");
    const sb = getSupabase(); if (!sb) return;
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) setErr("Email hoặc mật khẩu không đúng."); else router.replace("/");
      } else if (mode === "up") {
        if (password.length < 8) { setErr("Mật khẩu tối thiểu 8 ký tự."); return; }
        const { data, error } = await sb.auth.signUp({ email, password });
        if (error) setErr(error.message);
        else if (data.session) router.replace("/");
        else setInfo("Đã tạo tài khoản. Kiểm tra email để xác nhận rồi đăng nhập.");
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/dat-lai-mat-khau` });
        if (error) setErr(error.message); else setInfo("Đã gửi liên kết đặt lại mật khẩu. Kiểm tra hộp thư của bạn.");
      }
    } finally { setBusy(false); }
  }

  async function withGoogle() {
    setErr("");
    const { error } = await getSupabase()!.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/` } });
    if (error) setErr("Không thể đăng nhập bằng Google: " + error.message);
  }

  const title = mode === "in" ? "Đăng nhập" : mode === "up" ? "Tạo tài khoản" : "Quên mật khẩu";
  return (
    <div className="lg-page">
      <div className="lg-card">
        <div className="lg-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar-256.png" alt="Kiệt Beta" width={64} height={64} className="lg-logo" />
          <div><div className="lg-name">KIET BETA</div><div className="lg-sub">{title}</div></div>
        </div>

        {mode !== "forgot" && google && (
          <>
            <button type="button" className="lg-google" onClick={withGoogle}><GoogleIcon /><span>Tiếp tục với Google</span></button>
            <div className="lg-or"><span>HOẶC</span></div>
          </>
        )}

        <form onSubmit={submit}>
          <label className="lg-label" htmlFor="lg-email">Email</label>
          <div className="lg-field"><MailIcon /><input id="lg-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>

          {mode !== "forgot" && (
            <>
              <div className="lg-row"><label className="lg-label" htmlFor="lg-pass">Mật khẩu</label>{mode === "in" && <button type="button" className="lg-link" onClick={() => go("forgot")}>Quên mật khẩu?</button>}</div>
              <div className="lg-field"><LockIcon /><input id="lg-pass" name="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder="••••••••" required /></div>
            </>
          )}

          {err && <p className="lg-err">{err}</p>}{info && <p className="lg-info">{info}</p>}
          <button className="lg-submit" disabled={busy}>{busy ? "Đang xử lý…" : mode === "forgot" ? "Gửi liên kết đặt lại" : title}</button>
        </form>
      </div>

      <p className="lg-foot">
        {mode === "in" ? <>Bạn chưa có tài khoản? <button className="lg-link strong" onClick={() => go("up")}>Tạo một tài khoản</button></>
          : <>Đã có tài khoản? <button className="lg-link strong" onClick={() => go("in")}>Đăng nhập</button></>}
      </p>
    </div>
  );
}
