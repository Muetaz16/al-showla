"use client";

import { useState } from "react";
import { submitRestockAlert } from "@/app/cms-actions";

type Lang = "ar" | "en";

// §6: proper "notify me when available" popup — replaces the old prompt() calls.
export function RestockAlertModal({
  product, lang, onClose,
}: {
  product: { id: string; nameAr: string; nameEn: string };
  lang: Lang;
  onClose: () => void;
}) {
  const isAr = lang === "ar";
  const [name, setName] = useState("");
  const [num, setNum] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!name.trim()) { setErr(isAr ? "يرجى إدخال الاسم" : "Please enter your name"); return; }
    const clean = num.replace(/[\s-]/g, "");
    if (!/^\+?\d{9,15}$/.test(clean)) { setErr(isAr ? "رقم واتساب غير صحيح" : "Invalid WhatsApp number"); return; }
    setSaving(true);
    try {
      await submitRestockAlert(product.id, isAr ? product.nameAr : product.nameEn, name.trim(), clean);
      setDone(true);
    } catch {
      setErr(isAr ? "تعذّر التسجيل. حاول مجدداً." : "Failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} dir={isAr ? "rtl" : "ltr"}
      style={{ position: "fixed", inset: 0, background: "rgba(0,18,46,.7)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Cairo', sans-serif" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420, padding: 28, position: "relative", boxShadow: "0 24px 60px rgba(0,0,0,.4)" }}>
        <button onClick={onClose} aria-label="close"
          style={{ position: "absolute", top: 14, insetInlineEnd: 14, background: "rgba(0,0,0,.06)", border: "none", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>✕</button>

        {done ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🔔</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#059669", marginBottom: 8 }}>
              {isAr ? "تم تسجيل طلبك!" : "You're on the list!"}
            </div>
            <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.8, margin: 0 }}>
              {isAr ? "سنعلمك عبر واتساب فور توفر المنتج." : "We'll notify you on WhatsApp as soon as it's back in stock."}
            </p>
            <button onClick={onClose} style={{ marginTop: 18, background: "#0051a2", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
              {isAr ? "تم" : "Done"}
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>🔔</div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f1c2e", margin: "0 0 4px" }}>
              {isAr ? "أعلمني عند التوفر" : "Notify me when available"}
            </h3>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>
              {isAr ? product.nameAr : product.nameEn}
            </p>

            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{isAr ? "الاسم" : "Name"}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 14, fontFamily: "inherit", boxSizing: "border-box" }} />

            <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{isAr ? "رقم واتساب" : "WhatsApp number"}</label>
            <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="218 9x xxx xxxx" dir="ltr"
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 14, fontFamily: "inherit", boxSizing: "border-box" }} />

            {err && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{err}</div>}

            <button type="submit" disabled={saving}
              style={{ width: "100%", padding: 13, background: "#f59e0b", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, cursor: saving ? "wait" : "pointer", fontFamily: "inherit" }}>
              {saving ? (isAr ? "جارٍ التسجيل..." : "Saving...") : (isAr ? "سجّلني" : "Notify me")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
