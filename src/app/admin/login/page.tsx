"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, getSession } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (getSession()) router.replace("/admin");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // UX delay
    const user = login(username, password);
    if (user) {
      router.replace("/admin");
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1e",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "'Cairo', sans-serif",
      backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(0,81,162,.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(245,158,11,.15) 0%, transparent 50%)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Cairo', sans-serif; }
        .login-input {
          width: 100%; padding: 14px 16px; background: rgba(255,255,255,.06);
          border: 1.5px solid rgba(255,255,255,.12); color: #fff;
          font-family: 'Cairo', sans-serif; font-size: 14px; outline: none;
          transition: border-color .25s, background .25s; border-radius: 4px;
        }
        .login-input:focus { border-color: #3b82f6; background: rgba(255,255,255,.1); }
        .login-input::placeholder { color: rgba(255,255,255,.35); }
        .login-btn {
          width: 100%; padding: 15px; background: linear-gradient(135deg, #0051a2, #003578);
          color: #fff; border: none; font-family: 'Cairo', sans-serif;
          font-size: 15px; font-weight: 800; cursor: pointer; border-radius: 4px;
          transition: all .3s; letter-spacing: .02em;
          box-shadow: 0 4px 20px rgba(0,81,162,.4);
        }
        .login-btn:hover:not(:disabled) { background: linear-gradient(135deg, #0068cc, #0051a2); transform: translateY(-1px); box-shadow: 0 8px 28px rgba(0,81,162,.5); }
        .login-btn:disabled { opacity: .7; cursor: not-allowed; transform: none; }
        .hint-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 6px; padding: 12px 16px; margin-top: 20px; }
        .hint-row { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; }
        .hint-label { color: rgba(255,255,255,.4); }
        .hint-val { color: rgba(245,158,11,.8); font-weight: 700; letter-spacing: .04em; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        .card { animation: fadeIn .5s ease; }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        .dot-pulse { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>

      {/* Background grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

      <div className="card" style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, background: "linear-gradient(135deg, #0051a2, #001f4d)",
            border: "2px solid rgba(255,255,255,.15)", borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(0,81,162,.4)",
          }}>🔥</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>الشعلة الرائدة</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", letterSpacing: ".1em" }}>ADMIN PORTAL</p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,.05)", border: "1.5px solid rgba(255,255,255,.1)",
          borderRadius: 12, padding: "36px 32px", backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,.5)",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6, textAlign: "center" }}>
            تسجيل الدخول
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", textAlign: "center", marginBottom: 28 }}>
            لوحة إدارة المنصة
          </p>

          <form onSubmit={handleSubmit} dir="rtl">
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 8, letterSpacing: ".08em" }}>
                👤 اسم المستخدم
              </label>
              <input
                className="login-input"
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                placeholder="أدخل اسم المستخدم"
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 8, letterSpacing: ".08em" }}>
                🔒 كلمة المرور
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="login-input"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                  style={{ paddingInlineEnd: 48 }}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", top: "50%", transform: "translateY(-50%)",
                    insetInlineEnd: 14, background: "none", border: "none",
                    color: "rgba(255,255,255,.5)", cursor: "pointer", fontSize: 16,
                  }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.4)",
                borderRadius: 6, padding: "10px 14px", marginBottom: 16,
                color: "#fca5a5", fontSize: 13, fontWeight: 700, textAlign: "center",
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{
                    width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    display: "inline-block", animation: "spin .8s linear infinite",
                  }} />
                  جارٍ التحقق...
                </span>
              ) : "🚀 دخول"}
            </button>
          </form>

          {/* Credentials hint — development only; never rendered in production build */}
          {process.env.NODE_ENV !== "production" && (
            <div className="hint-card">
              <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.3)", marginBottom: 8, letterSpacing: ".1em" }}>
                بيانات الدخول التجريبية (بيئة التطوير فقط)
              </div>
              {[
                { role: "👑 Super Admin", user: "admin", pass: "admin1234" },
                { role: "🧑‍💼 Manager", user: "manager", pass: "manager123" },
                { role: "📦 Warehouse", user: "warehouse", pass: "store456" },
              ].map(r => (
                <div key={r.user} className="hint-row">
                  <span className="hint-label">{r.role}</span>
                  <span className="hint-val">{r.user} / {r.pass}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to site */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/" style={{ color: "rgba(255,255,255,.35)", fontSize: 12, textDecoration: "none", transition: "color .2s" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,.7)"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,.35)"; }}>
            ← العودة للموقع
          </a>
        </div>
      </div>
    </div>
  );
}
