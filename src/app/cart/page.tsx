"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  getCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount,
  type CartItem,
} from "@/lib/cart";
import { CURRENCY_SYMBOLS, formatPrice, unitLabel, type Currency } from "@/lib/products";
import { placeOrder } from "@/app/actions";
import { validateCoupon, applyCouponUse, saveBoqFile, notifyQuoteGenerated } from "@/app/cms-actions";
import { getContractorSession, type ContractorUser } from "@/lib/contractor-auth";

type Lang = "ar" | "en";

const T = {
  ar: {
    title: "سلة الطلبات",
    subtitle: "راجع منتجاتك وأرسل طلبك أو احصل على عرض سعر PDF",
    back: "→ الكتالوج",
    empty: "السلة فارغة",
    emptySub: "لم تضف أي منتجات بعد. تصفح الكتالوج وأضف ما تريد.",
    browseCatalog: "تصفح الكتالوج",
    product: "المنتج",
    qty: "الكمية",
    unitPrice: "سعر الوحدة",
    total: "المجموع",
    actions: "إجراءات",
    remove: "حذف",
    subtotal: "المجموع الفرعي",
    vat: "ضريبة القيمة المضافة (0%)",
    grandTotal: "الإجمالي",
    currency: "العملة",
    generatePDF: "🖨️ توليد عرض سعر PDF",
    sendWhatsApp: "📱 إرسال عبر واتساب",
    sendOrder: "📧 إرسال الطلب",
    clearCart: "تفريغ السلة",
    notes: "ملاحظات الطلب",
    notesPlaceholder: "أي متطلبات خاصة أو ملاحظات للتوريد...",
    companyInfo: "بيانات الشركة",
    companyName: "اسم الشركة / المقاول",
    contactName: "اسم المسؤول",
    phone: "الهاتف",
    projectName: "اسم المشروع",
    deliveryAddress: "عنوان التوصيل",
    requestedDate: "التاريخ المطلوب للتوصيل",
    orderSent: "✅ تم إرسال طلبك بنجاح!",
    orderSentSub: "سيتواصل معك فريقنا خلال 24 ساعة لتأكيد الطلب والسعر النهائي.",
    items: "منتجات",
    pdfNote: "سيتم فتح نافذة الطباعة لحفظ عرض السعر كـ PDF",
    inStock: "متوفر",
    outOfStock: "غير متوفر",
    addNotes: "إضافة ملاحظة",
    noteFor: "ملاحظة للمنتج",
  },
  en: {
    title: "Order Cart",
    subtitle: "Review your products and send your order or generate a PDF quote",
    back: "← Catalog",
    empty: "Cart is Empty",
    emptySub: "You haven't added any products yet. Browse the catalog and add what you need.",
    browseCatalog: "Browse Catalog",
    product: "Product",
    qty: "Qty",
    unitPrice: "Unit Price",
    total: "Total",
    actions: "Actions",
    remove: "Remove",
    subtotal: "Subtotal",
    vat: "VAT (0%)",
    grandTotal: "Grand Total",
    currency: "Currency",
    generatePDF: "🖨️ Generate PDF Quote",
    sendWhatsApp: "📱 Send via WhatsApp",
    sendOrder: "📧 Send Order",
    clearCart: "Clear Cart",
    notes: "Order Notes",
    notesPlaceholder: "Any special requirements or delivery notes...",
    companyInfo: "Company Information",
    companyName: "Company / Contractor Name",
    contactName: "Contact Person",
    phone: "Phone",
    projectName: "Project Name",
    deliveryAddress: "Delivery Address",
    requestedDate: "Requested Delivery Date",
    orderSent: "✅ Your order was sent successfully!",
    orderSentSub: "Our team will contact you within 24 hours to confirm the order and final pricing.",
    items: "items",
    pdfNote: "Print dialog will open to save as PDF",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    addNotes: "Add Note",
    noteFor: "Note for product",
  },
};

// ── PDF GENERATOR ──
function generateQuoteHTML(
  items: CartItem[], currency: Currency, lang: Lang,
  company: string, contact: string, phone: string, project: string, address: string, orderNotes: string
): string {
  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const today = new Date().toLocaleDateString(lang === "ar" ? "ar-LY" : "en-GB");
  const quoteNum = `QT-${Date.now().toString().slice(-6)}`;
  const total = getCartTotal(items, currency);
  const sym = CURRENCY_SYMBOLS[currency];

  const rows = items.map((item, i) => {
    const name = lang === "ar" ? item.product.nameAr : item.product.nameEn;
    const unit = formatPrice(item.product.priceBase, currency);
    const lineTotal = formatPrice(item.product.priceBase * item.quantity, currency);
    return `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 12px;color:#64748b;font-size:12px;">${i + 1}</td>
        <td style="padding:10px 12px;">
          <strong style="font-size:13px;color:#0f1c2e;">${name}</strong><br>
          <span style="font-size:11px;color:#64748b;">${item.product.brand} · ${unitLabel(item.product.unit, lang)}</span>
          ${item.notes ? `<br><em style="font-size:11px;color:#0051a2;">${item.notes}</em>` : ""}
        </td>
        <td style="padding:10px 12px;text-align:center;font-size:13px;font-weight:700;">${item.quantity}</td>
        <td style="padding:10px 12px;text-align:center;font-size:13px;">${unit}</td>
        <td style="padding:10px 12px;text-align:center;font-size:13px;font-weight:800;color:#0051a2;">${lineTotal}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <title>عرض سعر / Quote ${quoteNum}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; color:#0f1c2e; background:#fff; padding:32px; font-size:13px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:20px; border-bottom:3px solid #0051a2; }
    .logo-area h1 { font-size:22px; font-weight:900; color:#0051a2; }
    .logo-area p { font-size:12px; color:#64748b; margin-top:3px; }
    .quote-meta { text-align:${lang === "ar" ? "left" : "right"}; }
    .quote-meta .qnum { font-size:18px; font-weight:900; color:#001f4d; }
    .quote-meta .qdate { font-size:12px; color:#64748b; margin-top:4px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:28px; }
    .info-box { background:#f7f9fc; border:1px solid #e2e8f0; padding:14px 16px; }
    .info-box h3 { font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:#64748b; margin-bottom:10px; }
    .info-row { font-size:12px; color:#3d5473; margin-bottom:4px; }
    .info-row strong { color:#0f1c2e; }
    table { width:100%; border-collapse:collapse; margin-bottom:24px; }
    thead tr { background:#001f4d; color:#fff; }
    thead th { padding:12px; font-size:11px; font-weight:700; letter-spacing:.05em; }
    .total-box { display:flex; justify-content:flex-end; }
    .total-inner { border:2px solid #0051a2; padding:16px 24px; min-width:280px; }
    .total-row { display:flex; justify-content:space-between; font-size:13px; padding:5px 0; color:#3d5473; }
    .total-grand { font-size:20px; font-weight:900; color:#0051a2; border-top:2px solid #0051a2; margin-top:8px; padding-top:8px; display:flex; justify-content:space-between; }
    .footer { margin-top:32px; padding-top:16px; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; color:#94a3b8; }
    .validity { background:#e8f2fc; border:1px solid #0051a2; padding:10px 16px; margin-bottom:24px; font-size:12px; color:#003578; }
    .notes-box { background:#fffbeb; border:1px solid #f59e0b; padding:12px 16px; margin-bottom:20px; font-size:12px; }
    @media print { body { padding:16px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">
      <h1>${lang === "ar" ? "الشعلة الرائدة" : "AL-SHOWLA AL-RAEDA"}</h1>
      <p>${lang === "ar" ? "مواد البناء والحلول الإنشائية · بنغازي، ليبيا" : "Building Materials & Construction · Benghazi, Libya"}</p>
      <p style="margin-top:3px;font-size:11px;color:#94a3b8;">+218 94 802 0200 · info@alshowla.com</p>
    </div>
    <div class="quote-meta">
      <div class="qnum">${lang === "ar" ? "عرض سعر" : "QUOTATION"} #${quoteNum}</div>
      <div class="qdate">${lang === "ar" ? "التاريخ:" : "Date:"} ${today}</div>
    </div>
  </div>

  <div class="validity">
    ⚠️ ${lang === "ar" ? "هذا العرض صالح لمدة 30 يوماً من تاريخ الإصدار. الأسعار قابلة للتغيير بعد انتهاء الصلاحية." : "This quotation is valid for 30 days from the issue date. Prices may change after expiry."}
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>${lang === "ar" ? "بيانات العميل" : "Client Information"}</h3>
      ${company ? `<div class="info-row"><strong>${t.companyName}:</strong> ${company}</div>` : ""}
      ${contact ? `<div class="info-row"><strong>${t.contactName}:</strong> ${contact}</div>` : ""}
      ${phone ? `<div class="info-row"><strong>${t.phone}:</strong> ${phone}</div>` : ""}
      ${project ? `<div class="info-row"><strong>${t.projectName}:</strong> ${project}</div>` : ""}
      ${address ? `<div class="info-row"><strong>${t.deliveryAddress}:</strong> ${address}</div>` : ""}
    </div>
    <div class="info-box">
      <h3>${lang === "ar" ? "بيانات المورد" : "Supplier Information"}</h3>
      <div class="info-row"><strong>${lang === "ar" ? "الشركة:" : "Company:"}</strong> ${lang === "ar" ? "شركة الشعلة الرائدة" : "Al-Showla Al-Raeda Co."}</div>
      <div class="info-row"><strong>${lang === "ar" ? "العنوان:" : "Address:"}</strong> ${lang === "ar" ? "بنغازي، ليبيا" : "Benghazi, Libya"}</div>
      <div class="info-row"><strong>${lang === "ar" ? "الهاتف:" : "Phone:"}</strong> +218 94 802 0200</div>
      <div class="info-row"><strong>${lang === "ar" ? "البريد:" : "Email:"}</strong> info@alshowla.com</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th style="text-align:${lang === "ar" ? "right" : "left"};">${t.product}</th>
        <th style="width:70px;">${t.qty}</th>
        <th style="width:110px;">${t.unitPrice}</th>
        <th style="width:110px;">${t.total}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  ${orderNotes ? `<div class="notes-box"><strong>${t.notes}:</strong> ${orderNotes}</div>` : ""}

  <div class="total-box">
    <div class="total-inner">
      <div class="total-row"><span>${t.subtotal}:</span><span>${sym} ${total.toFixed(0)}</span></div>
      <div class="total-row"><span>${t.vat}:</span><span>${sym} 0</span></div>
      <div class="total-grand"><span>${t.grandTotal}:</span><span>${sym} ${total.toFixed(0)}</span></div>
    </div>
  </div>

  <div class="footer">
    <p>${lang === "ar" ? "شكراً لتعاملكم مع الشعلة الرائدة · جميع الأسعار بالدينار الليبي ما لم يُذكر غير ذلك" : "Thank you for your business · All prices in LYD unless otherwise stated"}</p>
    <p style="margin-top:4px;">www.alshowla.com · +218 94 802 0200</p>
  </div>
</body>
</html>`;
}

// ── MAIN CART PAGE ──
export default function CartPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [currency, setCurrency] = useState<Currency>("LYD");
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+218"); // ليبيا افتراضياً
  const [project, setProject] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [boqRef, setBoqRef] = useState<string | null>(null);
  const [boqFileName, setBoqFileName] = useState<string | null>(null);
  const [boqError, setBoqError] = useState("");
  const [boqUploading, setBoqUploading] = useState(false);
  const [contractor, setContractor] = useState<ContractorUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = T[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const total = getCartTotal(items, currency);
  const discountedTotal = total * (1 - discountPercent / 100);
  const sym = CURRENCY_SYMBOLS[currency];

  useEffect(() => {
    setItems(getCart());
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    
    const session = getContractorSession();
    if (session) {
      setContractor(session);
      setCompany(prev => prev || session.company);
      setContact(prev => prev || session.nameAr);
      
      let p = session.phone;
      if (p.startsWith("218")) p = p.slice(3);
      else if (p.startsWith("+218")) p = p.slice(4);
      setPhone(prev => prev || p);
    }
  }, [lang, dir]);

  // Listen for storage events (cart updated from catalog)
  useEffect(() => {
    const handler = () => setItems(getCart());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleRemove = (id: string) => {
    setItems(removeFromCart(id));
    window.dispatchEvent(new Event("storage"));
  };

  const handleQty = (id: string, qty: number) => {
    setItems(updateQuantity(id, qty));
  };

  const handleClear = () => {
    clearCart();
    setItems([]);
    window.dispatchEvent(new Event("storage"));
  };

  const handleSaveNote = (id: string) => {
    const updated = items.map(i => i.product.id === id ? { ...i, notes: noteText } : i);
    setItems(updated);
    import("@/lib/cart").then(({ saveCart }) => saveCart(updated));
    setEditNoteId(null);
  };

  const handlePDF = async () => {
    const html = generateQuoteHTML(items, currency, lang, company, contact, phone, project, address, orderNotes);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 600);
    }
    await notifyQuoteGenerated(company || contact || "زائر", discountedTotal);
    alert(t.pdfNote);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const res = await validateCoupon(couponCode.trim());
    if (res.valid) {
      setDiscountPercent(res.discount);
      setCouponMessage(lang === "ar" ? `خصم ${res.discount}%` : `${res.discount}% off`);
    } else {
      setDiscountPercent(0);
      setCouponMessage((res as any).message || (lang === "ar" ? "كود غير صالح" : "Invalid code"));
    }
  };

  const handleBoqUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBoqUploading(true);
    setBoqError("");
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const result = await saveBoqFile(base64, file.name);
      setBoqUploading(false);
      if (result.ok) {
        setBoqRef(result.refId);
        setBoqFileName(result.fileName);
      } else {
        setBoqRef(null);
        setBoqFileName(null);
        setBoqError((result as any).message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWhatsApp = () => {
    const lines = items.map(i => `• ${lang === "ar" ? i.product.nameAr : i.product.nameEn} × ${i.quantity} = ${formatPrice(i.product.priceBase * i.quantity, currency)}`);
    const msg = [
      lang === "ar" ? "🏗️ طلب جديد من الموقع الإلكتروني:" : "🏗️ New order from website:",
      "",
      ...lines,
      "",
      `${t.grandTotal}: ${sym} ${total.toFixed(0)}`,
      company ? `${t.companyName}: ${company}` : "",
      phone ? `${t.phone}: ${countryCode}${phone}` : "",
      orderNotes ? `${t.notes}: ${orderNotes}` : "",
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/218948020200?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const fullPhone = phone ? `${countryCode}${phone}` : "";
    const orderData = {
      client: company || contact || "زائر",
      phone: fullPhone,
      items: items.length,
      total: discountedTotal,
      details: items.map(i => ({ productId: i.product.id, quantity: i.quantity, productName: i.product.nameAr, unitPrice: i.product.priceBase })),
      notes: orderNotes,
      boqRef: boqRef || undefined,
      boqFileName: boqFileName || undefined,
      couponCode: discountPercent > 0 ? couponCode : undefined,
      contractorId: contractor?.id || undefined,
    };
    
    const res = await placeOrder(orderData);
    
    if (res === "LIMIT_EXCEEDED") {
      alert(lang === "ar" ? "❌ تجاوزت الحد الائتماني (الديون) المسموح لك به!" : "❌ Credit limit exceeded!");
      setIsSubmitting(false);
      return;
    }
    
    if (!res) {
      alert(lang === "ar" ? "❌ حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى." : "❌ An error occurred while sending the order, please try again.");
      setIsSubmitting(false);
      return;
    }
    
    if (contractor) {
      const updatedUser = { ...contractor, balance: (contractor.balance || 0) + discountedTotal };
      localStorage.setItem("alshowla_contractor_auth", JSON.stringify(updatedUser));
    }
    
    if (discountPercent > 0) await applyCouponUse(couponCode);
    setSubmitted(true);
    clearCart();
    setItems([]);
    window.dispatchEvent(new Event("storage"));
    setIsSubmitting(false);
  };

  const inpStyle = {
    width: "100%", padding: "10px 13px", border: "1.5px solid var(--gray-light)",
    background: "#f7f9fc", color: "var(--text)", fontFamily: "inherit",
    fontSize: 13, outline: "none", boxSizing: "border-box" as const,
    transition: "border-color .25s",
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--off)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: "'Cairo', sans-serif" }} dir={dir}>
        <style>{`:root{--blue:#0051a2;--blue-light:#e8f2fc;--accent:#f59e0b;--white:#fff;--off:#f7f9fc;--gray:#64748b;--gray-light:#e2e8f0;--text:#0f1c2e;--text2:#3d5473;}`}</style>
        <div style={{ background: "#fff", padding: "56px 48px", border: "1.5px solid var(--gray-light)", textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: "0 0 12px" }}>{t.orderSent}</h2>
          <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>{t.orderSentSub}</p>
          <a href="/products" style={{ display: "inline-block", background: "var(--blue)", color: "#fff", padding: "13px 32px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            {t.browseCatalog}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--off)", fontFamily: "'Cairo', sans-serif" }} dir={dir} lang={lang}>
      <style>{`
        :root{--blue:#0051a2;--blue-dark:#003578;--blue-deeper:#001f4d;--blue-light:#e8f2fc;--blue-soft:#d0e6f8;--accent:#f59e0b;--white:#fff;--off:#f7f9fc;--gray:#64748b;--gray-light:#e2e8f0;--text:#0f1c2e;--text2:#3d5473;}
        body{font-family:'Cairo',sans-serif;}
        input:focus,textarea:focus,select:focus{border-color:#0051a2!important;background:#fff!important;outline:none;}
        .qty-btn{width:30px;height:30px;border:1px solid var(--gray-light);background:var(--white);cursor:pointer;font-size:14px;font-weight:700;color:var(--blue);display:flex;align-items:center;justify-content:center;transition:all .2s;}
        .qty-btn:hover{background:var(--blue);color:#fff;border-color:var(--blue);}
        @media(max-width:900px){.cart-layout{flex-direction:column!important;}}
        @media(max-width:600px){.cart-table th:nth-child(3),.cart-table td:nth-child(3){display:none;}}
      `}</style>

      {/* NAV */}
      <div style={{ background: "#001f4d", padding: "0 5%", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/products" style={{ color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>{t.back}</a>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,.6)", fontSize: 13 }}>
            🛒 {getCartCount(items)} {t.items}
          </span>
          <button onClick={() => setLang(l => l === "ar" ? "en" : "ar")}
            style={{ background: "rgba(255,255,255,.15)", border: "none", color: "#fff", padding: "6px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
            {lang === "ar" ? "EN" : "AR"}
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #001f4d, #003578)", padding: "36px 5% 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>
            🛒 {t.title}
          </h1>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14, margin: 0 }}>{t.subtitle}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 5%" }}>
        {items.length === 0 ? (
          /* EMPTY STATE */
          <div style={{ background: "#fff", border: "1.5px solid var(--gray-light)", padding: "80px 40px", textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--text)", margin: "0 0 10px" }}>{t.empty}</h2>
            <p style={{ color: "var(--gray)", fontSize: 14, marginBottom: 24 }}>{t.emptySub}</p>
            <a href="/products" style={{ background: "var(--blue)", color: "#fff", padding: "13px 32px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
              {t.browseCatalog}
            </a>
          </div>
        ) : (
          <div className="cart-layout" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            {/* ── LEFT: TABLE + NOTES ── */}
            <div style={{ flex: 1 }}>
              {/* Currency selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--gray)" }}>{t.currency}:</label>
                {(["LYD", "USD", "EUR"] as Currency[]).map(c => (
                  <button key={c} onClick={() => setCurrency(c)}
                    style={{
                      padding: "6px 14px", border: `1.5px solid ${currency === c ? "var(--blue)" : "var(--gray-light)"}`,
                      background: currency === c ? "var(--blue)" : "#fff", color: currency === c ? "#fff" : "var(--text2)",
                      fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    }}>
                    {CURRENCY_SYMBOLS[c]} {c}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div style={{ background: "#fff", border: "1.5px solid var(--gray-light)", overflowX: "auto" }}>
                <table className="cart-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#001f4d", color: "#fff" }}>
                      <th style={{ padding: "12px 14px", textAlign: lang === "ar" ? "right" : "left", fontWeight: 700, fontSize: 11 }}>{t.product}</th>
                      <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, fontSize: 11, width: 110 }}>{t.qty}</th>
                      <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, fontSize: 11, width: 120 }}>{t.unitPrice}</th>
                      <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, fontSize: 11, width: 120 }}>{t.total}</th>
                      <th style={{ padding: "12px 14px", width: 70 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <React.Fragment key={item.product.id}>
                        <tr style={{ borderBottom: "1px solid var(--gray-light)" }}>
                          <td style={{ padding: "14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.product.imageUrl} alt={item.product.nameAr}
                                style={{ width: 54, height: 42, objectFit: "cover", flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text)", lineHeight: 1.3 }}>
                                  {lang === "ar" ? item.product.nameAr : item.product.nameEn}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>{item.product.brand}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                                  <span style={{
                                    fontSize: 9, fontWeight: 800, padding: "2px 7px",
                                    background: item.product.inStock ? "rgba(16,185,129,.1)" : "rgba(239,68,68,.1)",
                                    color: item.product.inStock ? "#059669" : "#dc2626",
                                    border: `1px solid ${item.product.inStock ? "#059669" : "#dc2626"}`,
                                  }}>
                                    {item.product.inStock ? t.inStock : t.outOfStock}
                                  </span>
                                  <button onClick={() => { setEditNoteId(item.product.id === editNoteId ? null : item.product.id); setNoteText(item.notes || ""); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: "var(--blue)", fontWeight: 700, fontFamily: "inherit", padding: 0 }}>
                                    📝 {item.notes ? lang === "ar" ? "تعديل الملاحظة" : "Edit note" : t.addNotes}
                                  </button>
                                </div>
                                {item.notes && (
                                  <div style={{ fontSize: 11, color: "var(--blue)", marginTop: 3, fontStyle: "italic" }}>
                                    📌 {item.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px", textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                              <button className="qty-btn" onClick={() => handleQty(item.product.id, item.quantity - 1)}>−</button>
                              <span style={{ fontWeight: 800, fontSize: 14, minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                              <button className="qty-btn" onClick={() => handleQty(item.product.id, item.quantity + 1)}>+</button>
                            </div>
                          </td>
                          <td style={{ padding: "14px", textAlign: "center", color: "var(--text2)", fontSize: 13 }}>
                            {formatPrice(item.product.priceBase, currency)}
                          </td>
                          <td style={{ padding: "14px", textAlign: "center", fontWeight: 800, fontSize: 14, color: "var(--blue)" }}>
                            {formatPrice(item.product.priceBase * item.quantity, currency)}
                          </td>
                          <td style={{ padding: "14px", textAlign: "center" }}>
                            <button onClick={() => handleRemove(item.product.id)}
                              style={{ background: "none", border: "1px solid #fee2e2", color: "#dc2626", cursor: "pointer", padding: "5px 9px", fontSize: 11, fontWeight: 700, fontFamily: "inherit", transition: "all .2s" }}
                              onMouseEnter={e => { const el = e.currentTarget; el.style.background = "#dc2626"; el.style.color = "#fff"; }}
                              onMouseLeave={e => { const el = e.currentTarget; el.style.background = "none"; el.style.color = "#dc2626"; }}>
                              ✕
                            </button>
                          </td>
                        </tr>
                        {editNoteId === item.product.id && (
                          <tr key={`note-${item.product.id}`} style={{ background: "#f0f7ff" }}>
                            <td colSpan={5} style={{ padding: "10px 14px" }}>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input type="text" value={noteText} onChange={e => setNoteText(e.target.value)}
                                  placeholder={`${t.noteFor}: ${lang === "ar" ? item.product.nameAr : item.product.nameEn}`}
                                  style={{ ...inpStyle, flex: 1 }} />
                                <button onClick={() => handleSaveNote(item.product.id)}
                                  style={{ background: "var(--blue)", color: "#fff", border: "none", padding: "10px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                  {lang === "ar" ? "حفظ" : "Save"}
                                </button>
                                <button onClick={() => setEditNoteId(null)}
                                  style={{ background: "none", border: "1.5px solid var(--gray-light)", color: "var(--gray)", padding: "9px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                                  {lang === "ar" ? "إلغاء" : "Cancel"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Clear + Notes */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 16, gap: 16, flexWrap: "wrap" }}>
                <button onClick={handleClear}
                  style={{ background: "none", border: "1px solid #fee2e2", color: "#dc2626", padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  🗑️ {t.clearCart}
                </button>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--gray)", display: "block", marginBottom: 6 }}>{t.notes}:</label>
                  <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                    placeholder={t.notesPlaceholder} rows={2}
                    style={{ ...inpStyle, resize: "vertical" }} />
                </div>
              </div>
            </div>

            {/* ── RIGHT: SUMMARY + FORM ── */}
            <div style={{ width: 320, flexShrink: 0 }}>
              {/* Order Total */}
              <div style={{ background: "#fff", border: "1.5px solid var(--gray-light)", padding: "22px", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 900, color: "var(--text)", margin: "0 0 16px", paddingBottom: 12, borderBottom: "2px solid var(--blue)" }}>
                  {lang === "ar" ? "ملخص الطلب" : "Order Summary"}
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text2)", marginBottom: 8 }}>
                  <span>{t.subtotal} ({items.length} {lang === "ar" ? "منتج" : "items"})</span>
                  <span>{sym} {total.toFixed(0)}</span>
                </div>
                {discountPercent > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#059669", marginBottom: 8 }}>
                    <span>{lang === "ar" ? `خصم (${discountPercent}%)` : `Discount (${discountPercent}%)`}</span>
                    <span>-{sym} {(total - discountedTotal).toFixed(0)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
                  <span>{t.vat}</span><span>{sym} 0</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 900, color: "var(--blue)", borderTop: "2px solid var(--blue)", paddingTop: 12 }}>
                  <span>{t.grandTotal}</span>
                  <span>{sym} {discountedTotal.toFixed(0)}</span>
                </div>
                <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder={lang === "ar" ? "كود الخصم" : "Coupon code"} style={{ ...inpStyle, flex: 1, fontSize: 12 }} />
                  <button type="button" onClick={handleApplyCoupon} style={{ padding: "8px 12px", background: "var(--blue)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11 }}>{lang === "ar" ? "تطبيق" : "Apply"}</button>
                </div>
                {couponMessage && <div style={{ fontSize: 11, color: discountPercent > 0 ? "#059669" : "#dc2626", marginTop: 6 }}>{couponMessage}</div>}
              </div>

              {/* BOQ Upload */}
              <div style={{ background: "#fff", border: "1.5px solid var(--gray-light)", padding: "16px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>📋 {lang === "ar" ? "إرفاق BOQ / كشف الكميات" : "Attach BOQ"}</div>
                <div style={{ fontSize: 11, color: "var(--gray)", marginBottom: 8 }}>{lang === "ar" ? "يُحفظ في قاعدة البيانات (حد أقصى 400 ك.ب)" : "Saved to database (max 400 KB)"}</div>
                <input type="file" accept=".pdf,.xlsx,.xls,.csv" onChange={handleBoqUpload} style={{ fontSize: 12 }} />
                {boqUploading && <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 6 }}>{lang === "ar" ? "جاري الحفظ..." : "Saving..."}</div>}
                {boqRef && <div style={{ fontSize: 11, color: "#059669", marginTop: 6 }}>✅ {boqFileName} ({boqRef})</div>}
                {boqError && <div style={{ fontSize: 11, color: "#dc2626", marginTop: 6 }}>{boqError}</div>}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                <button onClick={handlePDF} style={{ background: "#001f4d", color: "#fff", border: "none", padding: "13px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
                  {t.generatePDF}
                </button>
                <button onClick={handleWhatsApp} style={{ background: "#25D366", color: "#fff", border: "none", padding: "13px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
                  {t.sendWhatsApp}
                </button>
              </div>

              {/* Company Info Form */}
              <div style={{ background: "#fff", border: "1.5px solid var(--gray-light)", padding: "20px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 900, color: "var(--text)", margin: "0 0 14px" }}>🏢 {t.companyInfo}</h3>
                <form onSubmit={handleSend}>
                  {[
                    { label: t.companyName, val: company, set: setCompany },
                    { label: t.contactName, val: contact, set: setContact },
                  ].map((f) => (
                    <div key={f.label} style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "var(--gray)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                      <input type="text" value={f.val} onChange={e => f.set(e.target.value)} style={inpStyle} />
                    </div>
                  ))}

                  {/* حقل الهاتف مع اختيار رمز الدولة */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: "var(--gray)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{t.phone}</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        style={{ ...inpStyle, width: 110, flexShrink: 0, cursor: "pointer", paddingInlineEnd: 4 }}
                      >
                        <option value="+218">🇱🇾 +218 ليبيا</option>
                        <option value="+966">🇸🇦 +966 السعودية</option>
                        <option value="+971">🇦🇪 +971 الإمارات</option>
                        <option value="+20">🇪🇬 +20 مصر</option>
                        <option value="+216">🇹🇳 +216 تونس</option>
                        <option value="+213">🇩🇿 +213 الجزائر</option>
                        <option value="+212">🇲🇦 +212 المغرب</option>
                        <option value="+974">🇶🇦 +974 قطر</option>
                        <option value="+965">🇰🇼 +965 الكويت</option>
                        <option value="+973">🇧🇭 +973 البحرين</option>
                        <option value="+968">🇴🇲 +968 عُمان</option>
                        <option value="+962">🇯🇴 +962 الأردن</option>
                        <option value="+961">🇱🇧 +961 لبنان</option>
                        <option value="+963">🇸🇾 +963 سوريا</option>
                        <option value="+44">🇬🇧 +44 بريطانيا</option>
                        <option value="+1">🇺🇸 +1 أمريكا</option>
                        <option value="+49">🇩🇪 +49 ألمانيا</option>
                        <option value="+33">🇫🇷 +33 فرنسا</option>
                        <option value="+39">🇮🇹 +39 إيطاليا</option>
                        <option value="+90">🇹🇷 +90 تركيا</option>
                      </select>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="912345678"
                        style={{ ...inpStyle, flex: 1 }}
                      />
                    </div>
                  </div>

                  {[
                    { label: t.projectName, val: project, set: setProject },
                    { label: t.deliveryAddress, val: address, set: setAddress },
                  ].map((f) => (
                    <div key={f.label} style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "var(--gray)", display: "block", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                      <input type="text" value={f.val} onChange={e => f.set(e.target.value)} style={inpStyle} />
                    </div>
                  ))}
                  <button type="submit" disabled={isSubmitting} style={{
                    marginTop: 8, width: "100%", background: "var(--blue)", color: "#fff",
                    border: "none", padding: "13px", fontSize: 13, fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: isSubmitting ? 0.7 : 1
                  }}>
                    {isSubmitting ? "⏳..." : t.sendOrder}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
