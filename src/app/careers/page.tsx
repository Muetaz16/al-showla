"use client";

import { useState } from "react";
import { submitCareerApplication } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useLang } from "@/lib/useLang";

const MAX_CV_BYTES = 1_200_000; // ~1.2MB — keeps the stored data URL reasonable

export default function CareersPage() {
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";
  const tx = (ar: string, en: string) => (isAr ? ar : en);
  const [sent, setSent] = useState(false);
  const [ref, setRef] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cv, setCv] = useState<{ name: string; dataUrl: string } | null>(null);
  const [form, setForm] = useState({
    name: "", phone: "", email: "", position: "", city: "",
    qualification: "", experience: "", message: "",
  });

  const handleCv = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_CV_BYTES) {
      setError(tx("حجم الملف كبير جداً — الحد الأقصى 1.2 ميغابايت. يرجى ضغط الملف أو إرساله لاحقاً بالبريد.", "The file is too large — max 1.2 MB. Please compress it or email it later."));
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCv({ name: file.name, dataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const result = await submitCareerApplication({
      ...form,
      cvName: cv?.name || null,
      cvFile: cv?.dataUrl || null,
    });
    setSaving(false);
    if (result) {
      setRef(result);
      setSent(true);
    } else {
      setError(tx("تعذّر إرسال الطلب. حاول مرة أخرى.", "Couldn't send the application. Please try again."));
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text", required = true) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{label}{required && " *"}</label>
      <input
        required={required} type={type} value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
      />
    </div>
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader lang={lang} onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")} />
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 5%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f1c2e" }}>{tx("الوظائف والتوظيف", "Careers")}</h1>
        <p style={{ color: "#64748b", marginBottom: 24 }}>{tx("انضم لفريق الشعلة الرائدة — عبّئ النموذج وأرفق سيرتك الذاتية وسنتواصل معك.", "Join the Al-Showla Al-Raeda team — fill in the form, attach your CV and we'll get in touch.")}</p>
        {sent ? (
          <div style={{ background: "#d1fae5", padding: 28, borderRadius: 12, textAlign: "center", color: "#059669" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{tx("تم استلام طلبك بنجاح", "Your application was received")}</div>
            <div style={{ color: "#047857", fontSize: 14 }}>{tx("الرقم المرجعي لطلبك:", "Your reference number:")}</div>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1, margin: "6px 0", direction: "ltr" }}>{ref}</div>
            <div style={{ color: "#047857", fontSize: 13 }}>{tx("يرجى الاحتفاظ بهذا الرقم لمتابعة طلبك.", "Please keep this number to follow up on your application.")}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 28, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
            {field("name", tx("الاسم الكامل", "Full name"))}
            {field("phone", tx("الهاتف", "Phone"), "tel")}
            {field("email", tx("البريد الإلكتروني", "Email"), "email")}
            {field("position", tx("الوظيفة المطلوبة", "Position applied for"))}
            {field("city", tx("المدينة", "City"))}
            {field("qualification", tx("المؤهل العلمي", "Qualification"))}
            {field("experience", tx("سنوات الخبرة", "Years of experience"))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{tx("السيرة الذاتية (CV) — PDF أو صورة", "CV — PDF or image")}</label>
              <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleCv}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc" }} />
              {cv && <div style={{ marginTop: 6, fontSize: 12, color: "#059669", fontWeight: 700 }}>✓ {cv.name}</div>}
              <div style={{ marginTop: 4, fontSize: 11, color: "#94a3b8" }}>{tx("الحد الأقصى 1.2 ميغابايت.", "Max 1.2 MB.")}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>{tx("رسالة / ملاحظات", "Message / notes")}</label>
              <textarea rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            </div>
            {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 700 }}>{error}</div>}
            <button type="submit" disabled={saving} style={{ width: "100%", padding: 14, background: "#0051a2", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>{saving ? tx("جاري الإرسال...", "Sending...") : tx("إرسال الطلب", "Submit application")}</button>
          </form>
        )}
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
