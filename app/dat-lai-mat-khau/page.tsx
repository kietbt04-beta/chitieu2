"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function ResetPassword() {
  const router = useRouter();
  const [ready, setReady] = useState(false); const [err, setErr] = useState(""); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const sb = getSupabase(); if (!sb) return;
    const { data: sub } = sb.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY" || ev === "SIGNED_IN") setReady(true); });
    sb.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr("");
    const fd = new FormData(e.currentTarget); const p1 = String(fd.get("p1")), p2 = String(fd.get("p2"));
    if (p1.length < 8) return setErr("Mật khẩu tối thiểu 8 ký tự.");
    if (p1 !== p2) return setErr("Hai mật khẩu chưa khớp.");
    setBusy(true);
    const { error } = await getSupabase()!.auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) setErr(error.message); else { setOk(true); setTimeout(() => router.replace("/"), 1500); }
  }
  return (
    <div className="lg-page"><div className="lg-card">
      <div className="lg-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/avatar-256.png" alt="Kiệt Beta" width={64} height={64} className="lg-logo" />
        <div><div className="lg-name">KIET BETA</div><div className="lg-sub">Đặt lại mật khẩu</div></div>
      </div>
      {!ready ? <p className="lg-info">Đang xác thực liên kết… Nếu trang không chuyển tiếp, hãy mở lại liên kết trong email hoặc yêu cầu liên kết mới ở trang đăng nhập.</p> : (
        <form onSubmit={submit}>
          <label className="lg-label" htmlFor="p1">Mật khẩu mới</label>
          <div className="lg-field"><input id="p1" name="p1" type="password" autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" required style={{ paddingLeft: 18 }} /></div>
          <label className="lg-label" htmlFor="p2">Nhập lại mật khẩu</label>
          <div className="lg-field"><input id="p2" name="p2" type="password" autoComplete="new-password" required style={{ paddingLeft: 18 }} /></div>
          {err && <p className="lg-err">{err}</p>}{ok && <p className="lg-info">Đã đổi mật khẩu. Đang chuyển về trang chính…</p>}
          <button className="lg-submit" disabled={busy || ok}>{busy ? "Đang lưu…" : "Đổi mật khẩu"}</button>
        </form>
      )}
    </div></div>
  );
}
