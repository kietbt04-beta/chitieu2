"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Card, PageHead } from "@/components/ui";
import { SUGGESTIONS, answer } from "@/lib/assistant";

interface Msg { from: "me" | "ai"; text: string }

export default function Assistant() {
  const { data } = useApp();
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "ai", text: "Xin chào! Mình trả lời nhanh các câu hỏi về chi tiêu, thu nhập, lương và khoản nợ của bạn. Bạn chọn một câu gợi ý bên dưới hoặc tự gõ nhé." }]);
  const [q, setQ] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs]);

  const ask = (text: string) => {
    const t = text.trim(); if (!t) return;
    setMsgs((m) => [...m, { from: "me", text: t }, { from: "ai", text: answer(t, data) }]); setQ("");
  };
  const submit = (e: FormEvent) => { e.preventDefault(); ask(q); };

  return (
    <>
      <PageHead title="Trợ lý AI" sub="Hỏi nhanh về số liệu của bạn. Câu trả lời được tính ngay trên dữ liệu của bạn." />
      <Card title="✧ Trợ lý">
        <div className="chatbox">
          {msgs.map((m, i) => <div key={i} className={`bubble ${m.from === "ai" ? "bot" : "user"}`}>{m.text}</div>)}
          <div ref={end} />
        </div>
        <div className="pills">{SUGGESTIONS.map((s) => <button key={s} className="pill" onClick={() => ask(s)}>{s}</button>)}</div>
        <form onSubmit={submit} className="chatform">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập câu hỏi, ví dụ: tháng này chi bao nhiêu?" aria-label="Câu hỏi" />
          <button className="btn primary">Gửi</button>
        </form>
        <div className="footnote">Trợ lý này đọc dữ liệu có sẵn của bạn và trả lời theo các mẫu câu hỏi thông dụng, chưa phải mô hình AI tự do nên có thể không hiểu mọi câu hỏi.</div>
      </Card>
    </>
  );
}
