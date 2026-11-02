"use client";

import { useState } from "react";
import { submitAppointment } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useLang } from "@/lib/useLang";

export default function AppointmentPage() {
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";
  const tx = (ar: string, en: string) => (isAr ? ar : en);
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
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader lang={lang} onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")} />
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 5%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f1c2e" }}>{tx("حجز موعد استشارة", "Book a Consultation")}</h1>
        <p style={{ color: "#64748b", marginBottom: 24 }}>{tx("احجز موعداً مع فريق المبيعات لمناقشة مشروعك.", "Book a meeting with our sales team to discuss your project.")}</p>
        {sent ? (
          <div style={{ background: "#d1fae5", padding: 24, borderRadius: 12, textAlign: "center", fontWeight: 700, color: "#059669" }}>✅ {tx("تم حجز الموعد — سنتواصل معك للتأكيد", "Appointment booked — we'll contact you to confirm")}</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 28, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
            {[
              { key: "name", label: tx("الاسم", "Name"), type: "text" },
              { key: "phone", label: tx("الهاتف", "Phone"), type: "tel" },
              { key: "email", label: tx("البريد", "Email"), type: "email" },
              { key: "preferredDate", label: tx("التاريخ المفضل", "Preferred date"), type: "date" },
              { key: "preferredTime", label: tx("الوقت المفضل", "Preferred time"), type: "time" },
              { key: "topic", label: tx("موضوع الاستشارة", "Consultation topic"), type: "text" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{f.label}</label>
                <input required={f.key !== "email"} type={f.type} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{tx("ملاحظات", "Notes")}</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            </div>
            <button type="submit" disabled={saving} style={{ width: "100%", padding: 14, background: "#0051a2", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>{saving ? tx("جاري الحجز...", "Booking...") : tx("تأكيد الحجز", "Confirm booking")}</button>
          </form>
        )}
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
