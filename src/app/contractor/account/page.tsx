"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getContractorSession, type ContractorUser } from "@/lib/contractor-auth";
import { getContractorStatement } from "@/app/cms-actions";

type Ledger = { id: string; date: string; type: "INVOICE" | "PAYMENT"; amount: number; description: string };

export default function ContractorAccountPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<ContractorUser | null>(null);
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState<Ledger[]>([]);

  useEffect(() => {
    const session = getContractorSession();
    if (!session) { window.location.href = "/contractor/login"; return; }
    setUser(session);
    getContractorStatement(session.id).then((s) => {
      setBalance(s.balance);
      setLedger(s.ledger);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 50, textAlign: "center" }}>جاري تحميل كشف الحساب...</div>;

  const today = new Date().toLocaleDateString("ar-LY");
  let running = 0;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20, fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
          .statement-print { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ color: "var(--primary)", margin: 0 }}>📄 كشف حساب المقاول</h1>
        <Link href="/contractor" style={{ background: "var(--surface)", padding: "10px 15px", borderRadius: 8, textDecoration: "none", color: "var(--text)", border: "1px solid var(--border)" }}>
          العودة للوحة المقاول
        </Link>
      </div>

      <div className="statement-print">
        <div style={{ display: "flex", gap: 20, marginBottom: 30, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 250px", background: "var(--blue-deeper, #001f4d)", color: "#fff", padding: 25, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0, color: "rgba(255,255,255,0.7)" }}>المقاول</h3>
            <div style={{ fontSize: 22, fontWeight: "bold" }}>{user?.company || user?.nameAr}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>رقم الحساب: {user?.id} · تاريخ الكشف: {today}</div>
          </div>

          <div style={{ flex: "1 1 250px", background: balance < 0 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${balance < 0 ? "#ef4444" : "#10b981"}`, padding: 25, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0, color: balance < 0 ? "#991b1b" : "#065f46" }}>الرصيد الحالي</h3>
            <div style={{ fontSize: 30, fontWeight: "900", color: balance < 0 ? "#dc2626" : "#059669", direction: "ltr", textAlign: "right" }}>
              {Math.abs(balance).toLocaleString()} د.ل {balance < 0 ? "(مدين)" : "(دائن)"}
            </div>
          </div>
        </div>

        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          <h3 style={{ padding: "20px", margin: 0, borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>الحركات المالية</h3>
          {ledger.length === 0 ? (
            <p style={{ padding: 20, color: "var(--gray)" }}>لا توجد حركات مالية مسجلة على هذا الحساب.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                  {["التاريخ", "رقم الحركة", "البيان", "مدين (د.ل)", "دائن (د.ل)", "الرصيد"].map((h) => (
                    <th key={h} style={{ padding: 13, borderBottom: "1px solid var(--border)", color: "var(--gray)", fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ledger.map((t) => {
                  running += t.type === "PAYMENT" ? t.amount : -t.amount;
                  return (
                    <tr key={t.id + t.date} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 13 }}>{new Date(t.date).toLocaleDateString("ar-LY")}</td>
                      <td style={{ padding: 13, fontFamily: "monospace" }}>{t.id}</td>
                      <td style={{ padding: 13 }}>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold", marginLeft: 10, background: t.type === "INVOICE" ? "#fee2e2" : "#d1fae5", color: t.type === "INVOICE" ? "#dc2626" : "#059669" }}>
                          {t.type === "INVOICE" ? "فاتورة" : "دفعة"}
                        </span>
                        {t.description}
                      </td>
                      <td style={{ padding: 13, color: "#dc2626" }}>{t.type === "INVOICE" ? t.amount.toLocaleString() : "-"}</td>
                      <td style={{ padding: 13, color: "#059669" }}>{t.type === "PAYMENT" ? t.amount.toLocaleString() : "-"}</td>
                      <td style={{ padding: 13, fontWeight: 700, direction: "ltr", textAlign: "right" }}>{running.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="no-print" style={{ marginTop: 20, textAlign: "center" }}>
        <button onClick={() => window.print()}
          style={{ background: "var(--blue)", color: "#fff", border: "none", padding: "12px 25px", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>
          🖨️ طباعة / تصدير PDF
        </button>
        <p style={{ fontSize: 12, color: "var(--gray)", marginTop: 8 }}>استخدم خيار &quot;حفظ كـ PDF&quot; في نافذة الطباعة للحصول على نسخة PDF من الكشف.</p>
      </div>
    </div>
  );
}
