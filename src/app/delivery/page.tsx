"use client";

import { useState, useEffect } from "react";
import { getDeliveryZones } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useLang } from "@/lib/useLang";

type Zone = { id: string; city: string; estimatedDays: string; fees: number; conditions?: string | null };

export default function DeliveryZonesPage() {
  const [lang, setLang] = useLang();
  const isAr = lang === "ar";
  const tx = (ar: string, en: string) => (isAr ? ar : en);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeliveryZones().then((data) => {
      setZones(data as Zone[]);
      setLoading(false);
    });
  }, []);

  const selectedZone = zones.find((z) => z.city === selectedCity);

  return (
      <>
      <SiteHeader lang={lang} onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")} />
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20, fontFamily: "'Cairo', sans-serif" }} dir={isAr ? "rtl" : "ltr"}>
      <h1 style={{ color: "var(--primary)", textAlign: "center", marginBottom: 10 }}>🚚 {tx("حاسبة مناطق التوصيل", "Delivery Zones")}</h1>
      <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: 40 }}>
        {tx("اختر مدينتك لمعرفة توفر خدمة التوصيل والمدة التقريبية وأي شروط أو رسوم. تُدار بيانات المناطق من إدارة الشركة.",
          "Choose your city to check delivery availability, estimated time and any conditions or fees. Zone data is managed by the company.")}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 30 }}>
        {/* Selector */}
        <div style={{ flex: "1 1 320px", background: "var(--surface)", padding: 25, borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,.05)" }}>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>{tx("تحقق من مدينتك", "Check your city")}</h2>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>{tx("المدينة:", "City:")}</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "inherit" }}
            >
              <option value="">{tx("-- اختر المدينة --", "-- Select city --")}</option>
              {zones.map((z) => <option key={z.id} value={z.city}>{z.city}</option>)}
            </select>
          </div>

          {loading && <p style={{ color: "var(--text-secondary)" }}>{tx("جارٍ التحميل...", "Loading...")}</p>}

          {!loading && selectedCity && !selectedZone && (
            <div style={{ background: "#fef3c7", color: "#b45309", padding: 16, borderRadius: 8, fontWeight: "bold", textAlign: "center" }}>
              {tx("هذه المدينة غير مدرجة حالياً. يرجى التواصل مع قسم المبيعات لتأكيد إمكانية التوصيل.", "This city isn't listed yet. Please contact sales to confirm delivery.")}
            </div>
          )}

          {selectedZone && (
            <div style={{ background: "var(--bg)", padding: 20, borderRadius: 8, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: "bold" }}>{tx("حالة الخدمة:", "Service:")}</span>
                <span style={{ fontWeight: 900, color: "#059669" }}>{tx("متوفرة ✓", "Available ✓")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: "bold" }}>{tx("المدة التقريبية:", "Estimated time:")}</span>
                <span>{selectedZone.estimatedDays || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: "bold" }}>{tx("الرسوم:", "Fees:")}</span>
                <span style={{ fontWeight: 900, color: "var(--primary)" }}>
                  {selectedZone.fees > 0 ? `${selectedZone.fees} ${tx("د.ل", "LYD")}` : tx("حسب الطلب", "On request")}
                </span>
              </div>
              {selectedZone.conditions && (
                <div style={{ marginTop: 12, padding: 10, background: "#eff6ff", color: "#1e40af", borderRadius: 6, fontSize: 13 }}>
                  {selectedZone.conditions}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: "1 1 300px" }}>
          <div style={{ background: "var(--blue-deeper, #001f4d)", color: "#fff", padding: 25, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0, color: "#fff" }}>📦 {tx("سياسة الشحن والتوصيل", "Shipping & Delivery Policy")}</h3>
            <ul style={{ paddingInlineStart: 20, lineHeight: 1.9, fontSize: 14 }}>
              <li>{tx("تُجهَّز الطلبات بعد تأكيدها من قسم المبيعات.", "Orders are prepared once confirmed by the sales team.")}</li>
              <li>{tx("تختلف المدة والرسوم حسب المدينة وحجم الطلب.", "Time and fees vary by city and order size.")}</li>
              <li>{tx("لطلبيات المشاريع الكبيرة، يرجى التواصل مع قسم المبيعات لتسعيرة النقل.", "For large project orders, please contact sales for a transport quote.")}</li>
              <li>{tx("الأرقام المعروضة تقديرية وتخضع للتأكيد عند تأكيد الطلب.", "Figures shown are estimates and are confirmed when the order is confirmed.")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
      <SiteFooter lang={lang} />
      </>
  );
}
