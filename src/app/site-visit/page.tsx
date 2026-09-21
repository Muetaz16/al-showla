"use client";

import { useState } from "react";
import { submitSiteVisit } from "@/app/cms-actions";

// Photos are read to compressed data URLs (max 4, ~250KB each) so they can be stored
// without an external file service.
const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 260_000;
const readImageAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function SiteVisitPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refId, setRefId] = useState("");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotos = async (files: FileList | null) => {
    if (!files) return;
    setError("");
    const picked = Array.from(files).slice(0, MAX_PHOTOS);
    const tooBig = picked.find((f) => f.size > MAX_PHOTO_BYTES);
    if (tooBig) { setError("حجم إحدى الصور كبير (الحد 250 ك.ب للصورة). اختر صوراً أصغر."); return; }
    const urls = await Promise.all(picked.map(readImageAsDataUrl));
    setPhotos(urls);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const data = {
      issueType: fd.get("issueType") as string,
      projectLocation: fd.get("projectLocation") as string,
      city: fd.get("city") as string,
      preferredTime: fd.get("preferredTime") as string,
      imageUrls: photos,
    };

    const res = await submitSiteVisit(data);
    if (res) { setRefId(res); setSuccess(true); }
    else setError("حدث خطأ، يرجى المحاولة مرة أخرى.");
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }} dir="rtl">
        <h2>✅ تم تسجيل طلب الزيارة بنجاح</h2>
        <p>سيقوم مهندسنا بالتواصل معكم لتأكيد الموعد.</p>
        <p style={{ marginTop: 12 }}>رقمك المرجعي: <strong style={{ color: "var(--accent)", fontFamily: "monospace" }}>{refId}</strong></p>
        <a href="/" style={{ color: "var(--blue)" }}>العودة للرئيسية</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h1 style={{ color: "var(--primary)" }}>طلب زيارة موقع ميدانية</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 30 }}>
        هل تواجه مشكلة فنية في موقعك؟ مهندسو الشعلة الرائدة مستعدون لتقديم الدعم الفني في الموقع.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <select name="issueType" required style={inputStyle}>
          <option value="">-- اختر نوع المشكلة --</option>
          <option value="waterproofing">مشاكل تسربات المياه والعزل</option>
          <option value="flooring">أرضيات الإيبوكسي</option>
          <option value="concrete">إصلاح وتشققات الخرسانة</option>
          <option value="other">أخرى</option>
        </select>
        
        <input name="city" placeholder="المدينة" required style={inputStyle} />
        <input name="projectLocation" placeholder="عنوان المشروع بالتفصيل" required style={inputStyle} />
        
        <div>
          <label style={{ fontSize: 13, color: "var(--gray)", display: "block", marginBottom: 5 }}>الوقت المفضل للزيارة:</label>
          <input name="preferredTime" type="datetime-local" required style={{...inputStyle, width: "100%"}} />
        </div>

        <div>
          <label style={{ fontSize: 13, color: "var(--gray)", display: "block", marginBottom: 5 }}>إرفاق صور للحالة (حتى 4 صور، اختياري):</label>
          <input type="file" accept="image/*" multiple onChange={(e) => handlePhotos(e.target.files)} style={{...inputStyle, width: "100%"}} />
          {photos.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} />
              ))}
            </div>
          )}
        </div>

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
