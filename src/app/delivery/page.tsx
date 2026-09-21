"use client";

import { useState, useEffect } from "react";
import { getDeliveryZones } from "@/app/cms-actions";

type Zone = { id: string; city: string; estimatedDays: string; fees: number; conditions?: string | null };

export default function DeliveryZonesPage() {
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
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20, fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <h1 style={{ color: "var(--primary)", textAlign: "center", marginBottom: 10 }}>🚚 حاسبة مناطق التوصيل</h1>
      <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: 40 }}>
        اختر مدينتك لمعرفة توفر خدمة التوصيل والمدة التقريبية وأي شروط أو رسوم. تُدار بيانات المناطق من إدارة الشركة.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 30 }}>
        {/* Selector */}
        <div style={{ flex: "1 1 320px", background: "var(--surface)", padding: 25, borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,.05)" }}>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>تحقق من مدينتك</h2>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>المدينة:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "inherit" }}
            >
              <option value="">-- اختر المدينة --</option>
              {zones.map((z) => <option key={z.id} value={z.city}>{z.city}</option>)}
            </select>
          </div>

          {loading && <p style={{ color: "var(--text-secondary)" }}>جارٍ التحميل...</p>}

          {!loading && selectedCity && !selectedZone && (
            <div style={{ background: "#fef3c7", color: "#b45309", padding: 16, borderRadius: 8, fontWeight: "bold", textAlign: "center" }}>
              هذه المدينة غير مدرجة حالياً. يرجى التواصل مع قسم المبيعات لتأكيد إمكانية التوصيل.
            </div>
          )}

          {selectedZone && (
            <div style={{ background: "var(--bg)", padding: 20, borderRadius: 8, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: "bold" }}>حالة الخدمة:</span>
                <span style={{ fontWeight: 900, color: "#059669" }}>متوفرة ✓</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: "bold" }}>المدة التقريبية:</span>
                <span>{selectedZone.estimatedDays || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: "bold" }}>الرسوم:</span>
                <span style={{ fontWeight: 900, color: "var(--primary)" }}>
                  {selectedZone.fees > 0 ? `${selectedZone.fees} د.ل` : "حسب الطلب"}
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
            <h3 style={{ marginTop: 0, color: "#fff" }}>📦 سياسة الشحن والتوصيل</h3>
            <ul style={{ paddingInlineStart: 20, lineHeight: 1.9, fontSize: 14 }}>
              <li>تُجهَّز الطلبات بعد تأكيدها من قسم المبيعات.</li>
              <li>تختلف المدة والرسوم حسب المدينة وحجم الطلب.</li>
              <li>لطلبيات المشاريع الكبيرة، يرجى التواصل مع قسم المبيعات لتسعيرة النقل.</li>
              <li>الأرقام المعروضة تقديرية وتخضع للتأكيد عند تأكيد الطلب.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
