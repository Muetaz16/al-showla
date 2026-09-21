"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { getProducts } from "@/app/actions";
import { addToCart } from "@/lib/cart";
import type { Product } from "@/lib/products";

type Entry = { original: string; query: string; qty: number };
type Row = { id: number; originalLine: string; extractedQty: number; extractedQuery: string; matchedProduct: Product | null };

export default function QuickOrderPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [parsedItems, setParsedItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => { getProducts().then((p) => setProducts(p as Product[])); }, []);

  const matchEntry = (list: Product[], e: Entry, index: number): Row => {
    const sqLow = e.query.toLowerCase().trim();
    const matched = list.find((p) =>
      p.id.toLowerCase() === sqLow ||
      p.nameAr.toLowerCase().includes(sqLow) ||
      p.nameEn.toLowerCase().includes(sqLow) ||
      p.specAr?.some((s) => s.toLowerCase().includes(sqLow)) ||
      p.specEn?.some((s) => s.toLowerCase().includes(sqLow)),
    );
    return { id: index, originalLine: e.original, extractedQty: e.qty || 1, extractedQuery: e.query, matchedProduct: matched || null };
  };

  // Parse a free-text line: "100x code", "code 50", "20 اسم المنتج"
  const lineToEntry = (line: string): Entry => {
    let qty = 1;
    let query = line;
    const startMatch = line.match(/^(\d+)[x\*\s-]+(.*)/i);
    const endMatch = line.match(/(.*)[\s\*-]+(\d+)$/i);
    if (startMatch) { qty = parseInt(startMatch[1]); query = startMatch[2].trim(); }
    else if (endMatch) { qty = parseInt(endMatch[2]); query = endMatch[1].trim(); }
    return { original: line, query, qty };
  };

  const handleParseText = async () => {
    setLoading(true); setAdded(false);
    const list = products.length ? products : await getProducts();
    const entries = text.split("\n").map((l) => l.trim()).filter(Boolean).map(lineToEntry);
    setParsedItems(entries.map((e, i) => matchEntry(list as Product[], e, i)));
    setLoading(false);
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setLoading(true); setAdded(false); setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, blankrows: false });
      const list = products.length ? products : (await getProducts() as Product[]);
      const entries: Entry[] = rows.map((cells) => {
        const arr = (cells || []).map((c) => (c == null ? "" : String(c).trim()));
        // qty = first purely-numeric cell; code/name = first non-numeric cell
        const qtyCell = arr.find((c) => /^\d+(\.\d+)?$/.test(c));
        const query = arr.find((c) => c && !/^\d+(\.\d+)?$/.test(c)) || arr[0] || "";
        return { original: arr.filter(Boolean).join(" | "), query, qty: qtyCell ? Math.round(Number(qtyCell)) : 1 };
      }).filter((e) => e.query);
      setParsedItems(entries.map((e, i) => matchEntry(list, e, i)));
    } catch (err) {
      console.error(err);
      alert("تعذر قراءة الملف. تأكد أنه ملف Excel (.xlsx) أو CSV صالح.");
    }
    setLoading(false);
  };

  const matchedCount = parsedItems.filter((i) => i.matchedProduct).length;

  const handleAddToCart = (thenCheckout: boolean) => {
    setAdding(true);
    let addedCount = 0;
    parsedItems.forEach((item) => {
      if (item.matchedProduct) { addToCart(item.matchedProduct, item.extractedQty); addedCount++; }
    });
    window.dispatchEvent(new Event("storage"));
    setTimeout(() => {
      setAdding(false); setAdded(true);
      if (thenCheckout) router.push("/cart");
    }, 400);
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20, fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      <h1 style={{ color: "var(--primary)", textAlign: "center", marginBottom: 10 }}>⚡ الطلب السريع بالأكواد</h1>
      <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: 30 }}>
        نظام لمسؤولي المشتريات: أدخل أكواد المنتجات والكميات مباشرة، أو ارفع ملف Excel / CSV لبناء قائمة طلب جاهزة.
      </p>

      <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
        {/* Input area */}
        <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ marginTop: 0 }}>الإدخال اليدوي:</h3>
          <p style={{ fontSize: 13, color: "var(--gray)", marginBottom: 10 }}>
            صيغ مدعومة: <code>100x SIKA-107</code> · <code>P-01 50</code> · <code>20 مطرقة ديوالت</code>
          </p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="الصق طلباتك هنا..."
            style={{ minHeight: 220, padding: 15, borderRadius: 8, border: "1px solid var(--border)", fontFamily: "monospace", fontSize: 14 }} />
          <button onClick={handleParseText} disabled={loading || text.trim() === ""}
            style={{ marginTop: 12, padding: 12, background: "var(--blue)", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>
            {loading ? "جاري التحليل..." : "تحليل النص 🔍"}
          </button>

          <div style={{ marginTop: 20, padding: 16, border: "1px dashed var(--border)", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>أو ارفع ملف Excel / CSV</div>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
            {fileName && <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 6 }}>📎 {fileName}</div>}
            <div style={{ fontSize: 11, color: "var(--gray)", marginTop: 8 }}>الصيغة: عمود للكود/الاسم وعمود للكمية.</div>
          </div>
        </div>

        {/* Results area */}
        <div style={{ flex: "1 1 400px" }}>
          <h3 style={{ marginTop: 0 }}>نتائج التحليل {parsedItems.length > 0 && `(${matchedCount}/${parsedItems.length})`}:</h3>

          {parsedItems.length === 0 ? (
            <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: 8, padding: 40, textAlign: "center", color: "var(--gray)" }}>
              أدخل الطلبات أو ارفع ملفاً ثم اعرض النتائج هنا.
            </div>
          ) : (
            <div>
              <div style={{ maxHeight: 380, overflowY: "auto", paddingInlineEnd: 10 }}>
                {parsedItems.map((item) => (
                  <div key={item.id} style={{ padding: 15, marginBottom: 10, borderRadius: 8, border: `1px solid ${item.matchedProduct ? "#10b981" : "#ef4444"}`, background: item.matchedProduct ? "#f0fdf4" : "#fef2f2" }}>
                    <div style={{ fontSize: 12, color: "var(--gray)", marginBottom: 5 }}>النص الأصلي: &quot;{item.originalLine}&quot;</div>
                    {item.matchedProduct ? (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong>{item.matchedProduct.nameAr}</strong>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>الكود: {item.matchedProduct.id}</div>
                        </div>
                        <div style={{ background: "#10b981", color: "#fff", padding: "4px 10px", borderRadius: 20, fontSize: 14, fontWeight: "bold" }}>الكمية: {item.extractedQty}</div>
                      </div>
                    ) : (
                      <div style={{ color: "#ef4444", fontSize: 14, fontWeight: "bold" }}>❌ لم يتم التعرف على: &quot;{item.extractedQuery}&quot;</div>
                    )}
                  </div>
                ))}
              </div>

              {matchedCount > 0 && (
                <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  <button onClick={() => handleAddToCart(false)} disabled={adding}
                    style={{ flex: 1, padding: 14, background: "var(--surface)", color: "var(--primary)", border: "1.5px solid var(--blue)", borderRadius: 8, fontWeight: "bold", fontSize: 15, cursor: "pointer" }}>
                    🛒 إضافة للسلة
                  </button>
                  <button onClick={() => handleAddToCart(true)} disabled={adding}
                    style={{ flex: 1, padding: 14, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", fontSize: 15, cursor: "pointer" }}>
                    {adding ? "..." : "بناء الطلب ومتابعة ←"}
                  </button>
                </div>
              )}
              {added && <div style={{ marginTop: 10, color: "#059669", fontSize: 13, fontWeight: 700 }}>✅ تمت إضافة {matchedCount} منتج إلى السلة.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
