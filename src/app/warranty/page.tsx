"use client";

import { useState } from "react";
import { registerToolWarranty } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export default function WarrantyPage() {
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
    else setError("الرقم التسلسلي غير صحيح أو مسجل مسبقاً.");
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }} dir="rtl">
        <h2>✅ تم تفعيل الضمان بنجاح</h2>
        <p>الآن عدتك الكهربائية تحت حماية الشعلة الرائدة.</p>
        <p style={{ marginTop: 12 }}>رقم التسجيل المرجعي: <strong style={{ color: "var(--accent)", fontFamily: "monospace" }}>{refId}</strong></p>
        <a href="/" style={{ color: "var(--blue)" }}>العودة للرئيسية</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <SiteHeader />
      <h1 style={{ color: "var(--primary)" }}>تفعيل ضمان العدد الكهربائية</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 30 }}>
        سجل أدواتك الكهربائية برقمها التسلسلي لضمان حقوقك ومتابعة الصيانة.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <input name="clientName" placeholder="الاسم الرباعي" required style={inputStyle} />
        <input name="productName" placeholder="اسم أو موديل العدة (مثال: منشار ديوالت)" required style={inputStyle} />
        <input name="productId" placeholder="كود المنتج (اختياري)" style={inputStyle} />
        <input name="serialNumber" placeholder="الرقم التسلسلي (S/N) الموجود على العدة" required style={inputStyle} />
        
        <div>
          <label style={{ fontSize: 13, color: "var(--gray)", display: "block", marginBottom: 5 }}>تاريخ الشراء:</label>
          <input name="purchaseDate" type="date" required style={{...inputStyle, width: "100%"}} />
        </div>

        {error && <div style={{ background: "rgba(239,68,68,.1)", color: "#dc2626", padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{
          background: "var(--accent)", color: "#fff", padding: 15, borderRadius: 8,
          border: "none", fontSize: 16, fontWeight: "bold", cursor: "pointer", marginTop: 15
        }}>
          {loading ? "جاري التفعيل..." : "تفعيل الضمان"}
        </button>
      </form>
      <SiteFooter />
    </div>
  );
}

const inputStyle = {
  padding: "12px", borderRadius: "8px", border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontFamily: "inherit"
};
