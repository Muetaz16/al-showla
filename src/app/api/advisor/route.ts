import { NextResponse } from "next/server";
import { PRODUCTS, CATEGORIES, searchProducts } from "@/lib/products";

// ── AI Technical Advisor (item 11) ────────────────────────────────
// Grounded in the Al-Showla catalog. Uses Google Gemini when
// GEMINI_API_KEY is set; otherwise falls back to a rule-based catalog
// assistant so the page still works with no key / offline.

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

type ChatMsg = { role: "user" | "assistant"; content: string };

function categoryLine(lang: "ar" | "en") {
  return CATEGORIES.map((c) => (lang === "ar" ? c.nameAr : c.nameEn)).join("، ");
}

// Retrieve up to `limit` products relevant to the query (keeps prompt small).
function relevantProducts(query: string, lang: "ar" | "en", limit = 18) {
  let matched = query.trim() ? searchProducts(PRODUCTS, query, lang) : [];
  if (matched.length === 0) matched = PRODUCTS.slice(0, limit);
  return matched.slice(0, limit);
}

function productLine(p: (typeof PRODUCTS)[number]) {
  const specs = (p.specAr || []).slice(0, 3).join("؛ ");
  const brand = p.brand && p.brand !== "General" ? p.brand : "—";
  return `[${p.id}] ${p.nameAr} | ${p.nameEn} — ${brand} — ${p.unit}${specs ? " — " + specs : ""}`;
}

function buildSystemPrompt(query: string, lang: "ar" | "en") {
  const prods = relevantProducts(query, lang).map(productLine).join("\n");
  const rules = lang === "ar"
    ? `أنت "المستشار الفني" لشركة الشعلة الرائدة لاستيراد مواد البناء في بنغازي، ليبيا.
قواعد صارمة:
- أجب فقط ضمن نطاق مواد البناء ومنتجات الشركة أدناه. إذا سُئلت عن شيء خارج ذلك، اعتذر بلطف ووجّه المستخدم لمواد البناء.
- لا تخترع أرقاماً فنية أو مواصفات غير مذكورة في القائمة. إذا لم تتوفر المعلومة قل "يرجى التواصل مع فريق المبيعات للتأكد".
- عند التوصية بمنتج، اذكر كوده بين قوسين مثل [${PRODUCTS[0]?.id}] ليظهر رابط سريع له.
- كن مختصراً وعملياً، وبالعربية الفصحى المبسطة.
- الأقسام المتاحة: ${categoryLine("ar")}.

منتجات ذات صلة بسؤال المستخدم:
${prods}`
    : `You are the "Technical Advisor" for Al-Showla Al-Raeda, a building-materials importer in Benghazi, Libya.
Strict rules:
- Answer ONLY within building materials and the company products below. Politely decline anything else.
- Never invent technical figures/specs not in the list. If unknown, say "please contact the sales team to confirm".
- When recommending a product, cite its code in brackets like [${PRODUCTS[0]?.id}] so a quick link appears.
- Be concise and practical.
- Available sections: ${categoryLine("en")}.

Products relevant to the user's question:
${prods}`;
  return rules;
}

// Rule-based fallback when no API key is configured.
function ruleBasedReply(query: string, lang: "ar" | "en") {
  const matched = relevantProducts(query, lang, 6);
  if (matched.length === 0) {
    return lang === "ar"
      ? "لم أجد منتجاً مطابقاً. يرجى وصف الاستخدام أو المادة أكثر، أو تواصل مع فريق المبيعات."
      : "I couldn't find a matching product. Please describe the use case, or contact sales.";
  }
  const list = matched
    .map((p) => `• ${lang === "ar" ? p.nameAr : p.nameEn} [${p.id}]`)
    .join("\n");
  return lang === "ar"
    ? `إليك منتجات قد تناسب طلبك:\n${list}\n\n(المساعد الذكي غير مُفعّل حالياً — هذه نتائج من الكتالوج. للاستشارة الكاملة فعّل مفتاح Gemini.)`
    : `Here are products that may fit your request:\n${list}\n\n(The AI assistant isn't enabled yet — these are catalog matches. Enable the Gemini key for full advice.)`;
}

async function callGemini(system: string, messages: ChatMsg[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
    }),
  });
  if (!res.ok) {
    console.error("Gemini error", res.status, await res.text().catch(() => ""));
    return null;
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  return text || null;
}

// Product codes referenced in a reply -> so the UI can render quick links.
function extractProductRefs(text: string) {
  const ids = new Set<string>();
  const re = /\[([A-Za-z0-9\-_]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (PRODUCTS.some((p) => p.id === m![1])) ids.add(m![1]);
  }
  return [...ids].map((id) => {
    const p = PRODUCTS.find((x) => x.id === id)!;
    return { id, nameAr: p.nameAr, nameEn: p.nameEn };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: ChatMsg[] = Array.isArray(body?.messages) ? body.messages : [];
    const lang: "ar" | "en" = body?.lang === "en" ? "en" : "ar";
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const system = buildSystemPrompt(lastUser, lang);
    let reply = await callGemini(system, messages);
    let aiEnabled = true;
    if (!reply) {
      reply = ruleBasedReply(lastUser, lang);
      aiEnabled = false;
    }
    return NextResponse.json({ reply, products: extractProductRefs(reply), aiEnabled });
  } catch (e) {
    console.error("advisor route error", e);
    return NextResponse.json(
      { reply: "حدث خطأ. حاول مرة أخرى. / An error occurred, please try again.", products: [], aiEnabled: false },
      { status: 200 },
    );
  }
}
