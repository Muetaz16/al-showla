"use client";

import { useState } from "react";
import { submitTenderSupply, saveBoqFile } from "@/app/cms-actions";

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function TendersPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refId, setRefId] = useState("");
  const [error, setError] = useState("");
  const [boqFile, setBoqFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    // Optional BOQ/quantity-table upload (Excel/PDF)
    let fileUrl: string | null = null;
    if (boqFile) {
      const base64 = await readFileAsBase64(boqFile);
      const up = await saveBoqFile(base64, boqFile.name);
      if (!up.ok) { setError((up as any).message); setLoading(false); return; }
      fileUrl = up.refId;
    }

    const data = {
      projectName: fd.get("projectName") as string,
      owner: fd.get("owner") as string,
      location: fd.get("location") as string,
      duration: fd.get("duration") as string,
      supplyPeriod: fd.get("supplyPeriod") as string,
      fileUrl,
      contactInfo: {
        name: fd.get("contactName"),
        phone: fd.get("contactPhone"),
        email: fd.get("contactEmail")
      }
    };

    const res = await submitTenderSupply(data);
    if (res) { setRefId(res); setSuccess(true); }
    else setError("حدث خطأ، يرجى المحاولة مرة أخرى.");
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }} dir="rtl">
        <h2>✅ تم استلام طلب المناقصة بنجاح</h2>
        <p>سيقوم فريق المبيعات بالتواصل معكم قريباً.</p>
        <p style={{ marginTop: 12 }}>رقمك المرجعي: <strong style={{ color: "var(--accent)", fontFamily: "monospace" }}>{refId}</strong></p>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>يرجى الاحتفاظ بالرقم المرجعي لمتابعة طلبك.</p>
        <a href="/" style={{ color: "var(--blue)" }}>العودة للرئيسية</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1 style={{ color: "var(--primary)" }}>تسجيل التوريد للمشاريع والمناقصات</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 30 }}>
        يرجى تعبئة بيانات المشروع ليتمكن فريقنا من تجهيز عرض السعر وجدول الكميات المناسب.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <input name="projectName" placeholder="اسم المشروع" required style={inputStyle} />
        <input name="owner" placeholder="الجهة المالكة" required style={inputStyle} />
        <input name="location" placeholder="موقع المشروع" required style={inputStyle} />
        
        <div style={{ display: "flex", gap: 15 }}>
          <input name="duration" placeholder="مدة التنفيذ" required style={{...inputStyle, flex: 1}} />
          <input name="supplyPeriod" placeholder="فترة التوريد المطلوبة" required style={{...inputStyle, flex: 1}} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "bold" }}>جدول الكميات (BOQ) — Excel أو PDF (اختياري، حد 400 ك.ب)</label>
          <input name="boq" type="file" accept=".xlsx,.xls,.csv,.pdf"
            onChange={(e) => setBoqFile(e.target.files?.[0] || null)} style={inputStyle} />
        </div>

        <h3 style={{ marginTop: 15, fontSize: 16 }}>بيانات المسؤول</h3>
        <input name="contactName" placeholder="اسم المسؤول" required style={inputStyle} />
        <input name="contactPhone" placeholder="رقم الهاتف" required type="tel" style={inputStyle} />
        <input name="contactEmail" placeholder="البريد الإلكتروني" type="email" style={inputStyle} />

        {error && <div style={{ background: "rgba(239,68,68,.1)", color: "#dc2626", padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{
          background: "var(--accent)", color: "#fff", padding: 15, borderRadius: 8,
          border: "none", fontSize: 16, fontWeight: "bold", cursor: "pointer", marginTop: 15
        }}>
          {loading ? "جاري الإرسال..." : "إرسال الطلب"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "12px", borderRadius: "8px", border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontFamily: "inherit"
};
