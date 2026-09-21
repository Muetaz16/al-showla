"use client";

import { useEffect, useRef, useState } from "react";
import { startChatSession, sendChatMessage, getChatMessages } from "@/app/cms-actions";

export default function ChatPage() {
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [starting, setStarting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;
    const load = () => getChatMessages(sessionId).then(setMessages);
    load();
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, [sessionId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleStart = async () => {
    if (!name.trim()) return;
    setStarting(true);
    const id = await startChatSession(name.trim());
    setSessionId(id);
    await sendChatMessage(id, name.trim(), "مرحباً، أحتاج مساعدة في اختيار المواد.");
    setStarting(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !input.trim()) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { sender: name, message: msg, timestamp: Date.now() }]);
    await sendChatMessage(sessionId, name, msg);
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#001f4d", padding: "0 5%", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 700 }}>→ الرئيسية</a>
        <span style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>💬 شات المبيعات</span>
      </div>
      {!sessionId ? (
        <div style={{ maxWidth: 400, margin: "80px auto", padding: 28, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,.08)", textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>ابدأ محادثة</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>فريق المبيعات جاهز لمساعدتك (رد تلقائي + إشعار للإدارة)</p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="اسمك" style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 12 }} />
          <button onClick={handleStart} disabled={starting || !name.trim()} style={{ width: "100%", padding: 14, background: "#0051a2", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>{starting ? "..." : "بدء المحادثة"}</button>
        </div>
      ) : (
        <div style={{ flex: 1, maxWidth: 600, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", padding: "16px 5%" }}>
          <div style={{ flex: 1, overflowY: "auto", background: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, minHeight: 400 }}>
            {messages.map((m, i) => (
              <div key={m.id || i} style={{ marginBottom: 12, textAlign: m.sender === name ? "left" : "right" }}>
                <div style={{ display: "inline-block", background: m.sender === name ? "#e8f2fc" : "#f1f5f9", padding: "10px 14px", borderRadius: 12, maxWidth: "80%", fontSize: 14 }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{m.sender}</div>
                  {m.message}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="اكتب رسالتك..." style={{ flex: 1, padding: 14, borderRadius: 10, border: "1px solid #e2e8f0" }} />
            <button type="submit" style={{ padding: "14px 24px", background: "#0051a2", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>إرسال</button>
          </form>
        </div>
      )}
    </div>
  );
}
