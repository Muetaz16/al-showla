"use client";

import { useState } from "react";
import { submitSiteVisit } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useLang } from "@/lib/useLang";

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
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";
  const tx = (ar: string, en: string) => (isAr ? ar : en);
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
    if (tooBig) { setError(tx("حجم إحدى الصور كبير (الحد 250 ك.ب للصورة). اختر صوراً أصغر.", "One of the photos is too large (max 250 KB each). Please choose smaller photos.")); return; }
    const urls = await Promise.all(picked.map(readImageAsDataUrl));
    setPhotos(urls);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      issueType: fd.get("issueType") as string,
      projectLocation: fd.get("projectLocation") as string,
      city: fd.get("city") as string,
      preferredTime: fd.get("preferredTime") as string,
      imageUrls: photos,
    };

    const res = await submitSiteVisit(data);
    if (res) { setRefId(res); setSuccess(true); }
    else setError(tx("حدث خطأ، يرجى المحاولة مرة أخرى.", "Something went wrong, please try again."));
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }} dir={isAr ? "rtl" : "ltr"}>
        <h2>✅ {tx("تم تسجيل طلب الزيارة بنجاح", "Site visit request received")}</h2>
        <p>{tx("سيقوم مهندسنا بالتواصل معكم لتأكيد الموعد.", "Our engineer will contact you to confirm the appointment.")}</p>
        <p style={{ marginTop: 12 }}>{tx("رقمك المرجعي:", "Your reference:")} <strong style={{ color: "var(--accent)", fontFamily: "monospace" }}>{refId}</strong></p>
        <a href="/" style={{ color: "var(--blue)" }}>{tx("العودة للرئيسية", "Back to home")}</a>
      </div>
    );
  }

  return (
      <>
      <SiteHeader lang={lang} onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")} />
    <div dir={isAr ? "rtl" : "ltr"} style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h1 style={{ color: "var(--primary)" }}>{tx("طلب زيارة موقع ميدانية", "Request a Site Visit")}</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 30 }}>
        {tx("هل تواجه مشكلة فنية في موقعك؟ مهندسو الشعلة الرائدة مستعدون لتقديم الدعم الفني في الموقع.", "Facing a technical issue on site? Al-Showla Al-Raeda engineers are ready to provide on-site technical support.")}
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <input name="name" placeholder={tx("الاسم الكامل", "Full name")} required style={inputStyle} />
        <input name="phone" type="tel" placeholder={tx("رقم الهاتف", "Phone number")} required dir="ltr" style={{ ...inputStyle, textAlign: isAr ? "right" : "left" }} />
        <input name="email" type="email" placeholder={tx("البريد الإلكتروني (اختياري)", "Email (optional)")} dir="ltr" style={{ ...inputStyle, textAlign: isAr ? "right" : "left" }} />

        <select name="issueType" required style={inputStyle}>
          <option value="">{tx("-- اختر نوع المشكلة --", "-- Select issue type --")}</option>
          <option value="waterproofing">{tx("مشاكل تسربات المياه والعزل", "Water leaks & waterproofing")}</option>
          <option value="flooring">{tx("أرضيات الإيبوكسي", "Epoxy flooring")}</option>
          <option value="concrete">{tx("إصلاح وتشققات الخرسانة", "Concrete cracks & repair")}</option>
          <option value="other">{tx("أخرى", "Other")}</option>
        </select>
        
        <input name="city" placeholder={tx("المدينة", "City")} required style={inputStyle} />
        <input name="projectLocation" placeholder={tx("عنوان المشروع بالتفصيل", "Detailed project address")} required style={inputStyle} />
        
        <div>
          <label style={{ fontSize: 13, color: "var(--gray)", display: "block", marginBottom: 5 }}>{tx("الوقت المفضل للزيارة:", "Preferred visit time:")}</label>
          <input name="preferredTime" type="datetime-local" required style={{...inputStyle, width: "100%"}} />
        </div>

        <div>
          <label style={{ fontSize: 13, color: "var(--gray)", display: "block", marginBottom: 5 }}>{tx("إرفاق صور للحالة (حتى 4 صور، اختياري):", "Attach photos of the issue (up to 4, optional):")}</label>
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
          {loading ? tx("جاري الإرسال...", "Sending...") : tx("إرسال الطلب", "Submit request")}
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
