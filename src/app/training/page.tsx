"use client";

import { useState, useEffect } from "react";
import { registerWorkshop, getWorkshops } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Workshop = { id: string; title: string; instructor: string; date: string; location: string; availableSeats: number };

export default function TrainingPage() {
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
    if (!selectedId) { setError("اختر ورشة أولاً"); return; }
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const contactInfo = { phone: fd.get("phone"), profession: fd.get("profession") };

    const res = await registerWorkshop(selectedId, fd.get("participantName") as string, contactInfo);
    if (res.ok) { setSuccess(true); }
    else { setError((res as any).message || "تعذر التسجيل"); await load(); }
    setLoading(false);
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }} dir="rtl">
        <h2>✅ تم تسجيلك بنجاح</h2>
        <p>ننتظرك في ورشة العمل! سيصلك تذكير بموعد الدورة قريباً.</p>
        <a href="/" style={{ color: "var(--blue)" }}>العودة للرئيسية</a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }} dir="rtl">
      <SiteHeader />
      <h1 style={{ color: "var(--primary)" }}>الورش التدريبية</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 30 }}>
        سجل الآن في الورش التدريبية الاحترافية للتعرف على أحدث أنظمة البناء وتقنيات التنفيذ.
      </p>

      {workshops.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>لا توجد ورش متاحة حالياً. تابعنا لمعرفة الورش القادمة.</p>
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
                    {new Date(w.date).toLocaleDateString("ar-LY")} · {w.location} · {w.instructor}
                  </p>
                  <span style={{ fontSize: 12, fontWeight: "bold", color: full ? "#dc2626" : "#d97706" }}>
                    {full ? "اكتمل العدد" : `تبقى ${w.availableSeats} مقعد`}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <input name="participantName" placeholder="الاسم الثلاثي" required style={inputStyle} />
            <input name="phone" placeholder="رقم الهاتف (واتساب)" required type="tel" style={inputStyle} />
            <select name="profession" required style={inputStyle}>
              <option value="">-- المهنة --</option>
              <option value="engineer">مهندس مدني / معماري</option>
              <option value="contractor">مقاول</option>
              <option value="technician">فني تطبيق / سباك / فني ديكور</option>
              <option value="student">طالب / أخرى</option>
            </select>

            {error && <div style={{ background: "rgba(239,68,68,.1)", color: "#dc2626", padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{error}</div>}

            <button type="submit" disabled={loading || !selected || (selected?.availableSeats ?? 0) <= 0} style={{
              background: "var(--accent)", color: "#fff", padding: 15, borderRadius: 8,
              border: "none", fontSize: 16, fontWeight: "bold", cursor: "pointer", marginTop: 5, opacity: (loading || !selected) ? 0.7 : 1,
            }}>
              {loading ? "جاري التسجيل..." : "تأكيد الحجز"}
            </button>
          </form>
        </>
      )}
      <SiteFooter />
    </div>
  );
}

const inputStyle = {
  padding: "12px", borderRadius: "8px", border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontFamily: "inherit",
};
