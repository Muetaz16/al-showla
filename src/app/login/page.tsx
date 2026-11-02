"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/auth-actions";
import { useLang } from "@/lib/useLang";

export default function Login() {
  const [lang] = useLang();
  const isAr = lang === "ar";
  const tx = (ar: string, en: string) => (isAr ? ar : en);
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (emailMode === "register") {
        const res = await registerUser(email, password);
        if (!res.ok) {
          setError(res.error || "Failed to register");
          setLoading(false);
          return;
        }
      }
      
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(tx("البريد الإلكتروني أو كلمة المرور غير صحيحة.", "Incorrect email or password."));
      } else {
        router.push("/profile");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" dir={isAr ? "rtl" : "ltr"}>
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          background: var(--bg);
          font-family: 'Cairo', sans-serif;
        }
        .login-image {
          flex: 1;
          background: linear-gradient(135deg, rgba(0,81,162,0.8) 0%, rgba(0,31,77,0.9) 100%), url('https://images.unsplash.com/photo-1541888081622-4a7b7d0d08eb?auto=format&fit=crop&q=80');
          background-size: cover;
          background-position: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px;
          color: white;
          text-align: center;
        }
        .login-image h1 { font-size: 3rem; font-weight: 900; margin-bottom: 20px; }
        .login-image p { font-size: 1.2rem; max-width: 400px; line-height: 1.6; opacity: 0.9; }
        
        .login-form-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          background: var(--bg);
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--surface);
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border: 1px solid var(--border);
        }
        .input-group { margin-bottom: 20px; text-align: start; }
        .input-group label { display: block; margin-bottom: 8px; font-size: 0.95rem; font-weight: 700; color: var(--text); }
        .input-field {
          width: 100%; padding: 14px 16px; border-radius: 12px;
          border: 1.5px solid var(--border); background: var(--bg); color: var(--text);
          font-size: 1rem; font-family: 'Cairo', sans-serif; outline: none; transition: 0.2s;
        }
        .input-field:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(0,81,162,0.1); }
        .submit-btn {
          width: 100%; padding: 16px; border-radius: 12px; border: none;
          background: var(--primary); color: white; font-size: 1.1rem; font-weight: 800;
          font-family: 'Cairo', sans-serif; cursor: pointer; transition: 0.3s;
          box-shadow: 0 4px 14px rgba(0,81,162,0.3);
        }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,81,162,0.4); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        
        .error-msg { background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; text-align: center; }
        .toggle-mode { text-align: center; margin-top: 20px; color: var(--text-secondary); font-size: 0.95rem; }
        .toggle-mode span { color: var(--primary); font-weight: bold; cursor: pointer; text-decoration: underline; }
        
        @media(max-width: 900px) {
          .login-image { display: none; }
        }
      `}</style>

      <div className="login-image">
        <h1>{tx("الشعلة الرائدة", "Al-Showla Al-Raeda")}</h1>
        <p>{tx("بوابة المقاولين والشركات للوصول السريع لكتالوج المنتجات، طلبات عروض الأسعار، وتتبع الشحنات بكل سهولة وموثوقية.", "The portal for contractors and companies: quick access to the product catalog, quotation requests and shipment tracking.")}</p>
        <Link href="/" style={{ color: "#fff", marginTop: 40, textDecoration: "underline" }}>{tx("العودة للموقع", "Back to site")}</Link>
      </div>

      <div className="login-form-container">
        <div className="login-card">
          <h2 style={{ textAlign: "center", marginBottom: 10, fontSize: "1.8rem", color: "var(--text)" }}>{tx("أهلاً بك 👋", "Welcome 👋")}</h2>
          <p style={{ textAlign: "center", marginBottom: 30, color: "var(--text-secondary)" }}>{tx("قم بتسجيل الدخول للوصول لحسابك", "Sign in to access your account")}</p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleEmailAuth}>
            <div className="input-group">
              <label>{tx("البريد الإلكتروني", "Email")}</label>
              <input 
                type="email" 
                value={email} onChange={e => setEmail(e.target.value)}
                className="input-field" 
                placeholder="name@company.com" dir="ltr" required 
              />
            </div>
            <div className="input-group">
              <label>{tx("كلمة المرور", "Password")}</label>
              <input 
                type="password" 
                value={password} onChange={e => setPassword(e.target.value)}
                className="input-field" 
                placeholder="••••••••" dir="ltr" required 
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? tx("جاري المعالجة...", "Processing...") : (emailMode === "login" ? tx("تسجيل الدخول", "Sign in") : tx("إنشاء حساب جديد", "Create account"))}
            </button>
            
            <div className="toggle-mode">
              {emailMode === "login" ? tx("ليس لديك حساب؟ ", "Don't have an account? ") : tx("لديك حساب بالفعل؟ ", "Already have an account? ")}
              <span onClick={() => setEmailMode(emailMode === "login" ? "register" : "login")}>
                {emailMode === "login" ? tx("سجل الآن", "Sign up") : tx("سجل الدخول", "Sign in")}
              </span>
            </div>

            <div style={{ marginTop: 24, padding: 16, background: "var(--blue-light, #e8f2fc)", borderRadius: 12, border: "1px solid rgba(0,81,162,0.2)", textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)", marginBottom: 8 }}>{tx("👷 هل أنت مقاول؟", "👷 Are you a contractor?")}</div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.6 }}>
                {tx("حسابات المقاولين تُسجَّل من بوابة منفصلة.", "Contractor accounts are registered through a separate portal.")}
              </p>
              <Link href="/contractor/login" style={{ display: "inline-block", padding: "10px 20px", background: "var(--primary)", color: "#fff", borderRadius: 10, textDecoration: "none", fontWeight: 800, fontSize: 13 }}>
                {tx("دخول بوابة المقاولين ←", "Contractor portal →")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
