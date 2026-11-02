"use client";

import { useState, useEffect } from "react";
import { registerWorkshop, getWorkshops } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useLang } from "@/lib/useLang";

type Workshop = { id: string; title: string; instructor: string; date: string; location: string; availableSeats: number };

export default function TrainingPage() {
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";
  const tx = (ar: string, en: string) => (isAr ? ar : en);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const load = () => getWorkshops().then((w) => {
    setWorkshops(w as Workshop[]);
    if (w.length && !selectedId) setSelectedId(w[0].id);
  });

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const selected = workshops.find((w) => w.id === selectedId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedId) { setError(tx("اختر ورشة أولاً", "Please choose a workshop first")); return; }
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const contactInfo = { phone: fd.get("phone"), profession: fd.get("profession") };

    const res = await registerWorkshop(selectedId, fd.get("participantName") as string, contactInfo);
    if (res.ok) { setSuccess(true); }
    else { setError((res as any).message || tx("تعذر التسجيل", "Registration failed")); await load(); }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }} dir={isAr ? "rtl" : "ltr"}>
        <h2>✅ {tx("تم تسجيلك بنجاح", "You're registered")}</h2>
        <p>{tx("ننتظرك في ورشة العمل! سيصلك تذكير بموعد الدورة قريباً.", "See you at the workshop! You'll receive a reminder before it starts.")}</p>
        <a href="/" style={{ color: "var(--blue)" }}>{tx("العودة للرئيسية", "Back to home")}</a>
      </div>
    );
  }

  return (
    <>
      <SiteHeader lang={lang} onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")} />
      <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }} dir={isAr ? "rtl" : "ltr"}>
      <h1 style={{ color: "var(--primary)" }}>{tx("الورش التدريبية", "Training Workshops")}</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 30 }}>
        {tx("سجل الآن في الورش التدريبية الاحترافية للتعرف على أحدث أنظمة البناء وتقنيات التنفيذ.", "Register for our professional workshops to learn the latest building systems and application techniques.")}
      </p>

      {workshops.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>{tx("لا توجد ورش متاحة حالياً. تابعنا لمعرفة الورش القادمة.", "No workshops available right now. Follow us for upcoming ones.")}</p>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {workshops.map((w) => {
              const full = w.availableSeats <= 0;
              const active = w.id === selectedId;
              return (
                <button type="button" key={w.id} onClick={() => !full && setSelectedId(w.id)} disabled={full}
                  style={{
                    textAlign: "start", padding: 15, borderRadius: 12, cursor: full ? "not-allowed" : "pointer",
                    border: `2px solid ${active ? "var(--blue)" : "var(--border)"}`,
                    background: active ? "var(--blue-light, #e8f2fc)" : "var(--surface)", opacity: full ? 0.6 : 1,
                  }}>
                  <h3 style={{ margin: "0 0 6px 0", color: "var(--blue-deeper, #001f4d)" }}>{w.title}</h3>
                  <p style={{ margin: "0 0 5px 0", fontSize: 14 }}>
                    {new Date(w.date).toLocaleDateString(isAr ? "ar-LY" : "en-GB")} · {w.location} · {w.instructor}
                  </p>
                  <span style={{ fontSize: 12, fontWeight: "bold", color: full ? "#dc2626" : "#d97706" }}>
                    {full ? tx("اكتمل العدد", "Fully booked") : tx(`تبقى ${w.availableSeats} مقعد`, `${w.availableSeats} seats left`)}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <input name="participantName" placeholder={tx("الاسم الثلاثي", "Full name")} required style={inputStyle} />
            <input name="phone" placeholder={tx("رقم الهاتف (واتساب)", "Phone (WhatsApp)")} required type="tel" style={inputStyle} />
            <select name="profession" required style={inputStyle}>
              <option value="">{tx("-- المهنة --", "-- Profession --")}</option>
              <option value="engineer">{tx("مهندس مدني / معماري", "Civil / architectural engineer")}</option>
              <option value="contractor">{tx("مقاول", "Contractor")}</option>
              <option value="technician">{tx("فني تطبيق / سباك / فني ديكور", "Applicator / plumber / decor technician")}</option>
              <option value="student">{tx("طالب / أخرى", "Student / other")}</option>
            </select>

            {error && <div style={{ background: "rgba(239,68,68,.1)", color: "#dc2626", padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{error}</div>}

            <button type="submit" disabled={loading || !selected || (selected?.availableSeats ?? 0) <= 0} style={{
              background: "var(--accent)", color: "#fff", padding: 15, borderRadius: 8,
              border: "none", fontSize: 16, fontWeight: "bold", cursor: "pointer", marginTop: 5, opacity: (loading || !selected) ? 0.7 : 1,
            }}>
              {loading ? tx("جاري التسجيل...", "Registering...") : tx("تأكيد الحجز", "Confirm booking")}
            </button>
          </form>
        </>
      )}
      </div>
      <SiteFooter lang={lang} />
    </>
  );
}

const inputStyle = {
  padding: "12px", borderRadius: "8px", border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontFamily: "inherit",
};
