"use client";

import { useState } from "react";
import { submitCareerApplication } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

const MAX_CV_BYTES = 1_200_000; // ~1.2MB — keeps the stored data URL reasonable

export default function CareersPage() {
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
      setError("حجم الملف كبير جداً — الحد الأقصى 1.2 ميغابايت. يرجى ضغط الملف أو إرساله لاحقاً بالبريد.");
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
      setError("تعذّر إرسال الطلب. حاول مرة أخرى.");
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
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f7f9fc", fontFamily: "'Cairo', sans-serif" }}>
      <SiteHeader />
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 5%" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f1c2e" }}>الوظائف والتوظيف</h1>
        <p style={{ color: "#64748b", marginBottom: 24 }}>انضم لفريق الشعلة الرائدة — عبّئ النموذج وأرفق سيرتك الذاتية وسنتواصل معك.</p>
        {sent ? (
          <div style={{ background: "#d1fae5", padding: 28, borderRadius: 12, textAlign: "center", color: "#059669" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>تم استلام طلبك بنجاح</div>
            <div style={{ color: "#047857", fontSize: 14 }}>الرقم المرجعي لطلبك:</div>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1, margin: "6px 0", direction: "ltr" }}>{ref}</div>
            <div style={{ color: "#047857", fontSize: 13 }}>يرجى الاحتفاظ بهذا الرقم لمتابعة طلبك.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 28, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
            {field("name", "الاسم الكامل")}
            {field("phone", "الهاتف", "tel")}
            {field("email", "البريد الإلكتروني", "email")}
            {field("position", "الوظيفة المطلوبة")}
            {field("city", "المدينة")}
            {field("qualification", "المؤهل العلمي")}
            {field("experience", "سنوات الخبرة")}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>السيرة الذاتية (CV) — PDF أو صورة</label>
              <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={handleCv}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc" }} />
              {cv && <div style={{ marginTop: 6, fontSize: 12, color: "#059669", fontWeight: 700 }}>✓ {cv.name}</div>}
              <div style={{ marginTop: 4, fontSize: 11, color: "#94a3b8" }}>الحد الأقصى 1.2 ميغابايت.</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 700, marginBottom: 6, fontSize: 13 }}>رسالة / ملاحظات</label>
              <textarea rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            </div>
            {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 700 }}>{error}</div>}
            <button type="submit" disabled={saving} style={{ width: "100%", padding: 14, background: "#0051a2", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>{saving ? "جاري الإرسال..." : "إرسال الطلب"}</button>
          </form>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
