"use client";

import { useState } from "react";
import { registerToolWarranty } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useLang } from "@/lib/useLang";

export default function WarrantyPage() {
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";
  const tx = (ar: string, en: string) => (isAr ? ar : en);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refId, setRefId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await registerToolWarranty(
      fd.get("serialNumber") as string,
      fd.get("productId") as string,
      fd.get("productName") as string,
      fd.get("clientName") as string,
      fd.get("purchaseDate") as string
    );

    if (res) { setRefId(res); setSuccess(true); }
    else setError(tx("الرقم التسلسلي غير صحيح أو مسجل مسبقاً.", "The serial number is invalid or already registered."));
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }} dir={isAr ? "rtl" : "ltr"}>
        <h2>✅ {tx("تم تفعيل الضمان بنجاح", "Warranty activated successfully")}</h2>
        <p>{tx("الآن عدتك الكهربائية تحت حماية الشعلة الرائدة.", "Your power tool is now protected by Al-Showla Al-Raeda.")}</p>
        <p style={{ marginTop: 12 }}>{tx("رقم التسجيل المرجعي:", "Registration reference:")} <strong style={{ color: "var(--accent)", fontFamily: "monospace" }}>{refId}</strong></p>
        <a href="/" style={{ color: "var(--blue)" }}>{tx("العودة للرئيسية", "Back to home")}</a>
      </div>
    );
  }

  return (
      <>
      <SiteHeader lang={lang} onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")} />
    <div dir={isAr ? "rtl" : "ltr"} style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h1 style={{ color: "var(--primary)" }}>{tx("تفعيل ضمان العدد الكهربائية", "Power Tool Warranty Activation")}</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 30 }}>
        {tx("سجل أدواتك الكهربائية برقمها التسلسلي لضمان حقوقك ومتابعة الصيانة.", "Register your power tools by serial number to secure your warranty and track maintenance.")}
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <input name="clientName" placeholder={tx("الاسم الرباعي", "Full name")} required style={inputStyle} />
        <input name="productName" placeholder={tx("اسم أو موديل العدة (مثال: منشار ديوالت)", "Tool name or model (e.g. DeWalt saw)")} required style={inputStyle} />
        <input name="productId" placeholder={tx("كود المنتج (اختياري)", "Product code (optional)")} style={inputStyle} />
        <input name="serialNumber" placeholder={tx("الرقم التسلسلي (S/N) الموجود على العدة", "Serial number (S/N) on the tool")} required style={inputStyle} />

        <div>
          <label style={{ fontSize: 13, color: "var(--gray)", display: "block", marginBottom: 5 }}>{tx("تاريخ الشراء:", "Purchase date:")}</label>
          <input name="purchaseDate" type="date" required style={{...inputStyle, width: "100%"}} />
        </div>

        {error && <div style={{ background: "rgba(239,68,68,.1)", color: "#dc2626", padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{
          background: "var(--accent)", color: "#fff", padding: 15, borderRadius: 8,
          border: "none", fontSize: 16, fontWeight: "bold", cursor: "pointer", marginTop: 15
        }}>
          {loading ? tx("جاري التفعيل...", "Activating...") : tx("تفعيل الضمان", "Activate warranty")}
        </button>
      </form>
    </div>
      <SiteFooter lang={lang} />
      </>
  );
}

const inputStyle = {
  padding: "12px", borderRadius: "8px", border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontFamily: "inherit"
};
