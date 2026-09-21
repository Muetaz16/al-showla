"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getWeeklyReport } from "@/app/cms-actions";

export default function WeeklyDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getWeeklyReport(7).then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}>جاري تحميل التقرير الأسبوعي...</div>;
  if (!data) return <div style={{ padding: 50, textAlign: "center" }}>تعذّر تحميل التقرير.</div>;

  const stat = (bg: string, border: string, color: string, label: string, value: any, sub?: string) => (
    <div style={{ background: bg, padding: 25, borderRadius: 12, border: `1px solid ${border}` }}>
      <h3 style={{ margin: "0 0 10px 0", color, fontSize: 15 }}>{label}</h3>
      <div style={{ fontSize: 30, fontWeight: 900, color }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color, opacity: 0.7, marginTop: 5 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20, fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <style>{`@media print { .no-print { display:none !important; } }`}</style>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h1 style={{ color: "var(--primary)", margin: 0 }}>📊 الملخص الأسبوعي للإدارة</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => window.print()} style={{ background: "var(--blue)", color: "#fff", border: "none", padding: "10px 15px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>🖨️ طباعة / PDF</button>
          <Link href="/admin" style={{ background: "var(--surface)", padding: "10px 15px", borderRadius: 8, textDecoration: "none", color: "var(--text)", border: "1px solid var(--border)" }}>← لوحة التحكم</Link>
        </div>
      </div>
      <p style={{ color: "var(--text-secondary)", marginBottom: 30 }}>تقرير عن آخر {data.periodDays} أيام، محسوب من بيانات النظام الفعلية.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 30 }}>
        {stat("#eff6ff", "#bfdbfe", "#1e40af", "مبيعات الفترة", `${data.salesTotal.toLocaleString()} د.ل`, `من ${data.salesCount} طلب`)}
        {stat("#fef3c7", "#fde68a", "#92400e", "الطلبات المعلقة", data.pendingOrders, "تحتاج مراجعة")}
        {stat("#f0fdf4", "#bbf7d0", "#166534", "الاستفسارات", data.inquiries, "رسائل تواصل")}
        {stat("#faf5ff", "#e9d5ff", "#6b21a8", "طلبات عروض/عينات/زيارات", data.quoteRequests, "طلبات فنية")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 30 }}>
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          <h3 style={{ padding: 16, margin: 0, borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>👁️ الأكثر مشاهدة</h3>
          {data.topViewed.length === 0 ? <p style={{ padding: 16, color: "var(--gray)" }}>لا توجد بيانات بعد.</p> : (
            <ul style={{ margin: 0, padding: "10px 20px" }}>
              {data.topViewed.map((p: any) => <li key={p.id} style={{ padding: "6px 0" }}>{p.name} — <strong>{p.views}</strong> مشاهدة</li>)}
            </ul>
          )}
        </div>
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          <h3 style={{ padding: 16, margin: 0, borderBottom: "1px solid var(--border)", background: "#fef2f2", color: "#991b1b" }}>🔎 عمليات بحث دون نتائج</h3>
          {data.topNoResult.length === 0 ? <p style={{ padding: 16, color: "var(--gray)" }}>لا توجد عمليات بحث فاشلة — ممتاز.</p> : (
            <ul style={{ margin: 0, padding: "10px 20px" }}>
              {data.topNoResult.map((s: any, i: number) => <li key={i} style={{ padding: "6px 0" }}>&quot;{s.query}&quot; — <strong>{s.count}</strong> مرة</li>)}
            </ul>
          )}
        </div>
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <h3 style={{ padding: 16, margin: 0, borderBottom: "1px solid var(--border)", background: "#fef2f2", color: "#991b1b" }}>⚠️ نواقص المخزون (≤ 15)</h3>
        {data.lowStock.length === 0 ? <p style={{ padding: 16, color: "var(--gray)" }}>لا توجد نواقص.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <tbody>
              {data.lowStock.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: 13, fontFamily: "monospace" }}>{item.id}</td>
                  <td style={{ padding: 13, fontWeight: "bold" }}>{item.name}</td>
                  <td style={{ padding: 13 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: "bold", background: item.stock < 5 ? "#fee2e2" : "#fef3c7", color: item.stock < 5 ? "#dc2626" : "#d97706" }}>{item.stock} قطعة</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ fontSize: 12, color: "var(--gray)", marginTop: 20 }}>
        ملاحظة: الإرسال التلقائي أسبوعياً بالبريد يتطلب ربط مزوّد بريد (SMTP) ومهمة مجدولة — هذا التقرير متاح حالياً عند الطلب من اللوحة.
      </p>
    </div>
  );
}
