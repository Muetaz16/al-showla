"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { contractorLogin, getContractorSession } from "@/lib/contractor-auth";

export default function ContractorLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (getContractorSession()) router.replace("/contractor");
  }, [router]);

  if (!mounted) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const user = contractorLogin(username, password);
      if (user) {
        router.push("/contractor");
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 60% 0%, #0d1b3e, #000000)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', sans-serif", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: rgba(59,130,246,0.6) !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-card { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .btn-login { cursor: pointer; transition: all 0.3s; }
        .btn-login:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(59,130,246,0.5); }
        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }
        .demo-tag { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
        .demo-tag:hover { background: rgba(59,130,246,0.2); }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 900, width: "100%", gap: 0, borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>

        {/* Left Panel - Branding */}
        <div style={{ background: "linear-gradient(135deg, #0051a2 0%, #001f4d 100%)", padding: 52, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 12 }}>الشعلة الرائدة</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
              بوابة المقاولين والشركات<br />
              تتبع طلباتك وتاريخك مع الشركة
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { ico: "📦", label: "إدارة الطلبات" },
              { ico: "📊", label: "تتبع الحالات" },
              { ico: "📋", label: "الكتالوج الكامل" },
              { ico: "💬", label: "تواصل فوري" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 22 }}>{s.ico}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 700, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-card" style={{ background: "rgba(10,18,35,0.97)", backdropFilter: "blur(20px)", padding: 52, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6 }}>تسجيل الدخول 👋</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>أدخل بياناتك للوصول لبوابتك</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".08em" }}>اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="اسم المستخدم"
                style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'Cairo',sans-serif", transition: "all 0.3s" }}
                required
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".08em" }}>كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'Cairo',sans-serif", transition: "all 0.3s" }}
                required
              />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#ef4444", marginBottom: 20, fontWeight: 700 }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-login"
              style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg, #3b82f6, #0051a2)", border: "none", borderRadius: 12, color: "#fff", fontSize: 16, fontWeight: 900, fontFamily: "'Cairo',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? (
                <span style={{ display: "inline-block", width: 20, height: 20, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              ) : "دخول →"}
            </button>
          </form>



          <div style={{ marginTop: 24, textAlign: "center" }}>
            <a href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← العودة للموقع</a>
          </div>
        </div>
      </div>
    </div>
  );
}
