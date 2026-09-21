"use client";

import { useState } from "react";
import { submitAppointment } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export default function AppointmentPage() {
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", preferredDate: "", preferredTime: "", topic: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await submitAppointment(form);
    setSaving(false);
    if (ok) setSent(true);
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader />
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 5%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f1c2e" }}>حجز موعد استشارة</h1>
        <p style={{ color: "#64748b", marginBottom: 24 }}>احجز موعداً مع فريق المبيعات لمناقشة مشروعك.</p>
        {sent ? (
          <div style={{ background: "#d1fae5", padding: 24, borderRadius: 12, textAlign: "center", fontWeight: 700, color: "#059669" }}>✅ تم حجز الموعد — سنتواصل معك للتأكيد</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 28, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
            {[
              { key: "name", label: "الاسم", type: "text" },
              { key: "phone", label: "الهاتف", type: "tel" },
              { key: "email", label: "البريد", type: "email" },
              { key: "preferredDate", label: "التاريخ المفضل", type: "date" },
              { key: "preferredTime", label: "الوقت المفضل", type: "time" },
              { key: "topic", label: "موضوع الاستشارة", type: "text" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{f.label}</label>
                <input required={f.key !== "email"} type={f.type} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>ملاحظات</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            </div>
            <button type="submit" disabled={saving} style={{ width: "100%", padding: 14, background: "#0051a2", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>{saving ? "جاري الحجز..." : "تأكيد الحجز"}</button>
          </form>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
