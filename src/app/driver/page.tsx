"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDriverSession, driverLogout, type DriverUser } from "@/lib/driver-auth";
import { getDriverOrders } from "@/app/cms-actions";

const STATUS_LABELS: Record<string, string> = {
  pending: "معلق", confirmed: "مؤكد", processing: "قيد التجهيز", delivered: "تم التوصيل", cancelled: "ملغي",
};

export default function DriverPage() {
  const [user, setUser] = useState<DriverUser | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const session = getDriverSession();
    if (!session) { router.push("/driver/login"); return; }
    setUser(session);
    getDriverOrders(session.id).then(setOrders);
  }, [router]);

  if (!user) return <div style={{ textAlign: "center", padding: 100, fontFamily: "'Cairo',sans-serif" }}>جاري التحميل...</div>;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#050a15", color: "#e2e8f0", fontFamily: "'Cairo', sans-serif" }}>
      <header style={{ padding: "20px 5%", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>🚚 {user.name}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>مهام التوصيل</div>
        </div>
        <button onClick={() => { driverLogout(); router.push("/driver/login"); }} style={{ background: "rgba(239,68,68,.15)", color: "#ef4444", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>خروج</button>
      </header>
      <main style={{ padding: "24px 5%", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "rgba(255,255,255,.5)" }}>الطلبات المعيّنة ({orders.length})</h2>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(255,255,255,.3)" }}>لا توجد مهام توصيل حالياً</div>
        ) : orders.map(o => (
          <div key={o.id} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, padding: 20, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <strong style={{ color: "#3b82f6" }}>{o.id}</strong>
              <span style={{ fontSize: 12, background: "rgba(59,130,246,.15)", color: "#3b82f6", padding: "4px 10px", borderRadius: 20 }}>{STATUS_LABELS[o.status] || o.status}</span>
            </div>
            <div style={{ fontSize: 14 }}>العميل: {o.client || "—"}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 4 }}>📞 {o.phone || "—"}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 4 }}>💰 {(o.total || 0).toLocaleString()} د.ل</div>
          </div>
        ))}
      </main>
    </div>
  );
}
