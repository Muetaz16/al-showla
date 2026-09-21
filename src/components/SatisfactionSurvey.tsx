"use client";

import { useState } from "react";
import { submitSatisfactionSurvey } from "@/app/cms-actions";

export function SatisfactionSurvey({ orderId, clientName }: { orderId: string; clientName?: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await submitSatisfactionSurvey({ orderId, rating, comment, name: clientName || "عميل" });
    setSaving(false);
    if (ok) setSent(true);
  };

  if (sent) return <div style={{ marginTop: 12, padding: 12, background: "#d1fae5", borderRadius: 8, fontSize: 13, color: "#059669", fontWeight: 700 }}>شكراً لتقييمك! ⭐</div>;

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12, padding: 16, background: "#fffbeb", borderRadius: 10, border: "1px solid #f59e0b" }}>
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>⭐ كيف كانت تجربتك؟</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => setRating(n)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", opacity: n <= rating ? 1 : 0.3 }}>★</button>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="تعليقك (اختياري)" rows={2} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 8, fontSize: 13 }} />
      <button type="submit" disabled={saving} style={{ padding: "8px 16px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>{saving ? "..." : "إرسال التقييم"}</button>
    </form>
  );
}
