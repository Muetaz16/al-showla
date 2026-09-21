"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { driverLogin } from "@/lib/driver-auth";

export default function DriverLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = driverLogin(username, password);
    if (!user) { setError("بيانات الدخول غير صحيحة"); return; }
    router.push("/driver");
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#050a15", fontFamily: "'Cairo', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20, padding: 40, width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🚚</div>
          <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>بوابة السائقين</h1>
        </div>
        {error && <div style={{ background: "rgba(239,68,68,.15)", color: "#ef4444", padding: 10, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="اسم المستخدم" style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.3)", color: "#fff" }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" style={{ width: "100%", padding: 12, marginBottom: 20, borderRadius: 10, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.3)", color: "#fff" }} />
        <button type="submit" style={{ width: "100%", padding: 14, background: "linear-gradient(135deg,#3b82f6,#001f4d)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>دخول</button>
        {process.env.NODE_ENV !== "production" && (
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "rgba(255,255,255,.3)" }}>driver1 / driver123 (بيئة التطوير فقط)</p>
        )}
      </form>
    </div>
  );
}
