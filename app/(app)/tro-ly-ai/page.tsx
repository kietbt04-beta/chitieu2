"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Card, PageHead } from "@/components/ui";
import { Ctx, SUGGESTIONS, answer } from "@/lib/assistant";

interface Msg { from: "me" | "ai"; text: string }

export default function Assistant() {
  const { data } = useApp();
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "ai", text: "Xin chào! Mình trả lời về chi tiêu, thu nhập, lương, khoản nợ, xăng và ShopeeFood theo bất kỳ khoảng thời gian nào (hôm nay, tuần trước, tháng 10, 30 ngày qua…), và hướng dẫn cách dùng web. Bạn chọn câu gợi ý hoặc tự gõ nhé." }]);
  const [q, setQ] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const ctx = useRef<Ctx>({});
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs]);

  const ask = (text: string) => {
    const t = text.trim(); if (!t) return;
    const r = answer(t, data, ctx.current); ctx.current = r.ctx;
    setMsgs((m) => [...m, { from: "me", text: t }, { from: "ai", text: r.text }]); setQ("");
  };
  const submit = (e: FormEvent) => { e.preventDefault(); ask(q); };

  return (
    <>
      <PageHead title="Trợ lý AI" sub="Hỏi bằng tiếng Việt về số liệu của bạn hoặc cách dùng web. Câu trả lời được tính ngay trong trình duyệt." />
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
        <div className="footnote">Trợ lý chạy ngay trong web, không gửi dữ liệu ra ngoài. Nó hiểu nhiều cách hỏi (khoảng thời gian, danh mục, so sánh, câu hỏi nối tiếp) nhưng không phải AI tự do như ChatGPT nên có thể chưa hiểu mọi câu.</div>
      </Card>
    </>
  );
}
