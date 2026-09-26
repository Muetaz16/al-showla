"use client";

import { useState } from "react";
import { PRODUCTS, CATEGORIES, unitLabel, type Product } from "@/lib/products";
import { submitSampleRequest } from "@/app/cms-actions";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Lang = "ar" | "en";

const T = {
  ar: {
    title: "طلب عينة أو معاينة منتج",
    subtitle: "يمكنك طلب عينة أو معاينة منتج قبل الطلب بالكميات الكبيرة، وفق الشروط الموضحة أدناه.",
    back: "→ الكتالوج",
    step1: "اختر المنتج",
    step2: "بياناتك",
    step3: "تأكيد",
    selectProduct: "اختر منتجاً",
    searchProduct: "ابحث عن منتج...",
    name: "الاسم الكامل",
    company: "اسم الشركة / المقاول",
    customerType: "نوع العميل",
    customerTypeOptions: ["مقاول", "شركة مقاولات", "مطوّر عقاري", "جهة حكومية", "تاجر / موزّع", "فرد"],
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني",
    address: "العنوان / المدينة",
    projectLocation: "موقع المشروع",
    purpose: "الغرض من العينة / المعاينة",
    purposeOptions: ["اختبار الجودة قبل الطلب الكبير", "تقييم لمشروع معين", "مقارنة مع منتج آخر", "معاينة المنتج", "أخرى"],
    quantity: "الكمية المطلوبة",
    notes: "ملاحظات إضافية",
    notesPlaceholder: "أي تفاصيل أخرى حول طلبك...",
    submit: "إرسال الطلب",
    success: "✅ تم إرسال طلبك بنجاح!",
    successSub: "سيتواصل معك فريقنا لمراجعة الطلب والرد عليه بعد اعتماد الإدارة. يخضع التنفيذ لتوفر المنتج وموقع المشروع.",
    newRequest: "طلب آخر",
    selectedProduct: "المنتج المختار",
    change: "تغيير",
    required: "هذا الحقل مطلوب",
    disclaimerTitle: "شروط الخدمة",
    disclaimer: "يخضع توفير العينات أو المعاينات للموافقة، ونوع المنتج، والكميات المتاحة، وموقع المشروع، وقد تطبق رسوم شحن أو رسوم على بعض المنتجات.",
    allCategories: "كل الفئات",
  },
  en: {
    title: "Request a Product Sample or Viewing",
    subtitle: "Request a sample or a viewing of a product before bulk ordering, subject to the terms below.",
    back: "← Catalog",
    step1: "Choose Product",
    step2: "Your Details",
    step3: "Confirm",
    selectProduct: "Select a Product",
    searchProduct: "Search product...",
    name: "Full Name",
    company: "Company / Contractor Name",
    customerType: "Customer Type",
    customerTypeOptions: ["Contractor", "Contracting company", "Real-estate developer", "Government entity", "Trader / Distributor", "Individual"],
    phone: "Phone Number",
    email: "Email Address",
    address: "Address / City",
    projectLocation: "Project Location",
    purpose: "Purpose of Sample / Viewing",
    purposeOptions: ["Quality test before bulk order", "Evaluation for specific project", "Comparison with another product", "Product viewing", "Other"],
    quantity: "Requested Quantity",
    notes: "Additional Notes",
    notesPlaceholder: "Any other details about your request...",
    submit: "Submit Request",
    success: "✅ Your request was submitted successfully!",
    successSub: "Our team will review your request and respond after management approval. Fulfilment is subject to product availability and project location.",
    newRequest: "New Request",
    selectedProduct: "Selected Product",
    change: "Change",
    required: "This field is required",
    disclaimerTitle: "Service Terms",
    disclaimer: "The provision of samples or product viewings is subject to approval, product type, available quantities, and project location; shipping fees or other charges may apply to some products.",
    allCategories: "All Categories",
  },
};

export default function SampleRequestPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [form, setForm] = useState({ name: "", company: "", customerType: "", phone: "", email: "", address: "", projectLocation: "", purpose: "", quantity: "1", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  const filteredProducts = PRODUCTS.filter((p) => {
    const q = searchQ.toLowerCase();
    const match = (lang === "ar" ? p.nameAr : p.nameEn).toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    const cat = filterCat === "all" || p.categoryId === filterCat;
    return match && cat;
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = t.required;
    if (!form.phone.trim()) newErrors.phone = t.required;
    if (!form.email.trim()) newErrors.email = t.required;
    if (!form.address.trim()) newErrors.address = t.required;
    if (!form.purpose) newErrors.purpose = t.required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedProduct) return;
    setSaving(true);
    const ok = await submitSampleRequest({
      ...form,
      productId: selectedProduct.id,
      productName: selectedProduct.nameAr,
    });
    setSaving(false);
    if (ok) setSubmitted(true);
  };

  const inp = (field: keyof typeof form, label: string, type = "text", required = false) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "var(--gray)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      <input type={type} value={form[field]}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        style={{
          width: "100%", padding: "11px 14px", border: `1.5px solid ${errors[field] ? "#dc2626" : "var(--gray-light)"}`,
          background: "var(--off)", color: "var(--text)", fontFamily: "inherit", fontSize: 14,
          outline: "none", boxSizing: "border-box", transition: "border-color .25s",
        }}
        onFocus={e => { e.target.style.borderColor = "#0051a2"; e.target.style.background = "#fff"; }}
        onBlur={e => { e.target.style.borderColor = errors[field] ? "#dc2626" : "var(--gray-light)"; e.target.style.background = "var(--off)"; }}
      />
      {errors[field] && <p style={{ color: "#dc2626", fontSize: 11, margin: "4px 0 0", fontWeight: 600 }}>{errors[field]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--off)", fontFamily: "'Cairo', sans-serif" }} dir={dir} lang={lang}>
      <SiteHeader lang={lang} onToggleLang={() => setLang(l => l === "ar" ? "en" : "ar")} />
      <style>{`
        :root{--blue:#0051a2;--blue-dark:#003578;--blue-deeper:#001f4d;--blue-light:#e8f2fc;--blue-soft:#d0e6f8;--accent:#f59e0b;--white:#fff;--off:#f7f9fc;--gray:#64748b;--gray-light:#e2e8f0;--text:#0f1c2e;--text2:#3d5473;}
        body{font-family:'Cairo',sans-serif;}
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        .prod-option{padding:12px 14px;border:1.5px solid var(--gray-light);background:var(--white);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px;}
        .prod-option:hover{border-color:var(--blue);background:var(--blue-light);}
        .prod-option.selected{border-color:var(--blue);background:var(--blue-light);border-width:2px;}
        .step-dot{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;transition:all .3s;}
        .step-dot.done{background:var(--blue);color:#fff;}
        .step-dot.active{background:var(--accent);color:#fff;}
        .step-dot.pending{background:var(--gray-light);color:var(--gray);}
      `}</style>


      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, var(--blue-deeper), #003578)", padding: "40px 5% 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>🧪 {t.title}</h1>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14, margin: "0 0 18px" }}>{t.subtitle}</p>
          {/* Approved service-terms disclaimer (replaces prior unapproved free/fast/no-obligation promises) */}
          <div style={{ background: "rgba(245,158,11,.12)", border: "1px solid rgba(245,158,11,.4)", padding: "14px 18px", borderRadius: 6 }}>
            <div style={{ fontWeight: 800, color: "#fbbf24", fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>ℹ️ {t.disclaimerTitle}</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.75)", margin: 0, lineHeight: 1.8 }}>{t.disclaimer}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 5%" }}>
        {/* STEPS */}
        {!submitted && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36 }}>
            {[{ n: 1, l: t.step1 }, { n: 2, l: t.step2 }, { n: 3, l: t.step3 }].map((s, i) => (
              <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div className={`step-dot ${step > s.n ? "done" : step === s.n ? "active" : "pending"}`}>{step > s.n ? "✓" : s.n}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: step === s.n ? "var(--accent)" : "var(--gray)", whiteSpace: "nowrap" }}>{s.l}</span>
                </div>
                {i < 2 && <div style={{ width: 60, height: 2, background: step > s.n ? "var(--blue)" : "var(--gray-light)", margin: "0 8px", marginBottom: 20, transition: "background .3s" }} />}
              </div>
            ))}
          </div>
        )}

        {/* SUCCESS */}
        {submitted ? (
          <div style={{ background: "var(--white)", padding: 48, textAlign: "center", border: "1.5px solid var(--gray-light)" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: "0 0 12px" }}>{t.success}</h2>
            <p style={{ color: "var(--text2)", fontSize: 14, maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.8 }}>{t.successSub}</p>
            {selectedProduct && (
              <div style={{ background: "var(--blue-light)", border: "1.5px solid var(--blue)", padding: "14px 20px", display: "inline-block", marginBottom: 28, textAlign: lang === "ar" ? "right" : "left" }}>
                <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700, marginBottom: 4 }}>{t.selectedProduct}</div>
                <div style={{ fontWeight: 800, color: "var(--text)", fontSize: 14 }}>{lang === "ar" ? selectedProduct.nameAr : selectedProduct.nameEn}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>{selectedProduct.brand}</div>
              </div>
            )}
            <br />
            <button onClick={() => { setSubmitted(false); setStep(1); setSelectedProduct(null); setForm({ name: "", company: "", customerType: "", phone: "", email: "", address: "", projectLocation: "", purpose: "", quantity: "1", notes: "" }); }}
              style={{ background: "var(--blue)", color: "#fff", border: "none", padding: "13px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {t.newRequest}
            </button>
          </div>
        ) : step === 1 ? (
          /* STEP 1: PRODUCT SELECTION */
          <div style={{ background: "var(--white)", padding: "28px", border: "1.5px solid var(--gray-light)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder={t.searchProduct}
                  style={{ width: "100%", padding: "10px 40px 10px 14px", border: "1.5px solid var(--gray-light)", background: "var(--off)", fontFamily: "inherit", fontSize: 13, outline: "none", color: "var(--text)", boxSizing: "border-box" }} />
                <span style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", insetInlineEnd: 12, color: "var(--gray)" }}>🔍</span>
              </div>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                style={{ padding: "10px 14px", border: "1.5px solid var(--gray-light)", background: "var(--off)", fontFamily: "inherit", fontSize: 13, color: "var(--text)", cursor: "pointer", outline: "none" }}>
                <option value="all">{t.allCategories}</option>
                {CATEGORIES.filter(c => c.id !== "all").map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {lang === "ar" ? c.nameAr : c.nameEn}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 420, overflowY: "auto" }}>
              {filteredProducts.map((p) => (
                <div key={p.id} className={`prod-option${selectedProduct?.id === p.id ? " selected" : ""}`}
                  onClick={() => setSelectedProduct(p)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.nameAr} style={{ width: 52, height: 40, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text)" }}>{lang === "ar" ? p.nameAr : p.nameEn}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>{p.brand} · {unitLabel(p.unit, lang)}</div>
                  </div>
                  {selectedProduct?.id === p.id && <span style={{ color: "var(--blue)", fontSize: 18 }}>✓</span>}
                </div>
              ))}
            </div>
            <button disabled={!selectedProduct} onClick={() => setStep(2)}
              style={{
                marginTop: 20, width: "100%", background: selectedProduct ? "var(--blue)" : "var(--gray-light)",
                color: selectedProduct ? "#fff" : "var(--gray)", border: "none", padding: "14px",
                fontSize: 14, fontWeight: 700, cursor: selectedProduct ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all .25s",
              }}>
              {lang === "ar" ? "التالي →" : "Next →"}
            </button>
          </div>
        ) : step === 2 ? (
          /* STEP 2: FORM */
          <form onSubmit={handleSubmit} style={{ background: "var(--white)", padding: "28px", border: "1.5px solid var(--gray-light)" }}>
            {selectedProduct && (
              <div style={{ background: "var(--blue-light)", border: "1.5px solid var(--blue)", padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedProduct.imageUrl} alt="" style={{ width: 44, height: 36, objectFit: "cover" }} />
                  <div>
                    <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 700 }}>{t.selectedProduct}</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text)" }}>{lang === "ar" ? selectedProduct.nameAr : selectedProduct.nameEn}</div>
                  </div>
                </div>
                <button type="button" onClick={() => setStep(1)}
                  style={{ background: "none", border: "1px solid var(--blue)", color: "var(--blue)", padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {t.change}
                </button>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <div>{inp("name", t.name, "text", true)}</div>
              <div>{inp("company", t.company)}</div>
              {/* Customer type */}
              <div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "var(--gray)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>{t.customerType}</label>
                  <select value={form.customerType} onChange={e => setForm(f => ({ ...f, customerType: e.target.value }))}
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-light)", background: "var(--off)", color: form.customerType ? "var(--text)" : "var(--gray)", fontFamily: "inherit", fontSize: 14, outline: "none" }}>
                    <option value="">{lang === "ar" ? "اختر..." : "Select..."}</option>
                    {t.customerTypeOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>{inp("phone", t.phone, "tel", true)}</div>
              <div>{inp("email", t.email, "email", true)}</div>
              <div>{inp("address", t.address, "text", true)}</div>
              <div>{inp("projectLocation", t.projectLocation)}</div>
            </div>

            {/* Purpose */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "var(--gray)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                {t.purpose} <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${errors.purpose ? "#dc2626" : "var(--gray-light)"}`, background: "var(--off)", color: form.purpose ? "var(--text)" : "var(--gray)", fontFamily: "inherit", fontSize: 14, outline: "none" }}>
                <option value="">{lang === "ar" ? "اختر السبب..." : "Select reason..."}</option>
                {t.purposeOptions.map((o, i) => <option key={i} value={o}>{o}</option>)}
              </select>
              {errors.purpose && <p style={{ color: "#dc2626", fontSize: 11, margin: "4px 0 0", fontWeight: 600 }}>{errors.purpose}</p>}
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "var(--gray)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>{t.quantity}</label>
              <input type="number" min="1" max="10" value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-light)", background: "var(--off)", color: "var(--text)", fontFamily: "inherit", fontSize: 14, outline: "none" }} />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "var(--gray)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>{t.notes}</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder={t.notesPlaceholder} rows={3}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--gray-light)", background: "var(--off)", color: "var(--text)", fontFamily: "inherit", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setStep(1)}
                style={{ padding: "13px 24px", border: "1.5px solid var(--blue)", background: "transparent", color: "var(--blue)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {lang === "ar" ? "→ رجوع" : "← Back"}
              </button>
              <button type="submit"
                style={{ flex: 1, background: "var(--blue)", color: "#fff", border: "none", padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background .25s" }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = "#003578"; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = "var(--blue)"; }}>
                🚀 {t.submit}
              </button>
            </div>
          </form>
        ) : null}
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
