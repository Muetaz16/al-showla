"use server";

import { prisma } from "@/lib/prisma";
import { FAQ_SEED, BLOG_SEED, BANNER_SEED } from "@/lib/seeds";
import { addLog, addNotification } from "@/app/actions";

async function notifyAdmin(title: string, body: string) {
  await addNotification("admin", title, body);
}

// ── Stock ───────────────────────────────────────────────────────

export async function updateProductStockCount(id: string, stockCount: number): Promise<boolean> {
  try {
    const nowInStock = stockCount > 0;
    await prisma.product.update({
      where: { id },
      data: {
        stockCount: Math.max(0, stockCount),
        inStock: nowInStock,
      }
    });
    // Restock trigger: if the product is back in stock, notify everyone waiting on it (item 6)
    if (nowInStock) await fireRestockAlerts(id);
    return true;
  } catch (err) {
    console.error("updateProductStockCount error:", err);
    return false;
  }
}

// Notifies all pending restock-alert subscribers for a product and marks them notified.
export async function fireRestockAlerts(productId: string): Promise<number> {
  try {
    const pending = await prisma.restockAlert.findMany({ where: { productId, isNotified: false } });
    for (const alert of pending) {
      await notifyAdmin(
        "تنبيه توفر منتج — إشعار عميل 🔔",
        `المنتج ${alert.productName} أصبح متوفراً. أبلغ ${alert.clientName} على واتساب ${alert.whatsappNumber}`,
      );
    }
    if (pending.length > 0) {
      await prisma.restockAlert.updateMany({
        where: { productId, isNotified: false },
        data: { isNotified: true },
      });
    }
    return pending.length;
  } catch (e) {
    console.error("fireRestockAlerts error:", e);
    return 0;
  }
}

// ── Submissions ─────────────────────────────────────────────────

export async function submitSampleRequest(data: Record<string, unknown>): Promise<boolean> {
  try {
    const id = "SMP-" + Date.now();
    await prisma.sampleRequest.create({
      data: {
        id,
        name: data.name as string | undefined,
        data: data as any,
        status: "pending",
      }
    });
    await notifyAdmin("طلب عينة جديد 🧪", `طلب عينة من ${data.name || "عميل"}`);
    await addLog({ user: String(data.name || "guest"), action: `طلب عينة ${id}`, type: "sample" });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function submitContactMessage(data: Record<string, unknown>): Promise<boolean> {
  try {
    // Anti-spam honeypot: silently accept (return true) but do not persist bot submissions
    if (String((data as Record<string, unknown>).company_website || "").trim()) return true;
    const id = "MSG-" + Date.now();
    await prisma.contactMessage.create({
      data: {
        id,
        name: data.name as string || "Unknown",
        subject: data.subject as string | undefined,
        data: data as any,
        read: false,
      }
    });
    await notifyAdmin("رسالة تواصل جديدة ✉️", `من ${data.name}: ${String(data.subject || "").slice(0, 50)}`);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function submitCareerApplication(data: Record<string, unknown>): Promise<string | null> {
  try {
    const ref = "JOB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    await prisma.careerApplication.create({
      data: {
        id: ref,
        name: data.name as string || "Unknown",
        data: { ...data, ref } as any,
        status: "new",
      }
    });
    await notifyAdmin("طلب توظيف جديد 👔", `من ${data.name}${data.position ? " — " + data.position : ""} (${ref})`);
    return ref;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function submitAppointment(data: Record<string, unknown>): Promise<boolean> {
  try {
    const id = "APT-" + Date.now();
    await prisma.appointment.create({
      data: {
        id,
        name: data.name as string || "Unknown",
        preferredDate: data.preferredDate as string | undefined,
        data: data as any,
        status: "pending",
      }
    });
    await notifyAdmin("موعد استشارة جديد 📅", `${data.name} — ${data.preferredDate}`);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function submitReturnRequest(data: Record<string, unknown>): Promise<boolean> {
  try {
    const id = "RET-" + Date.now();
    await prisma.returnRequest.create({
      data: {
        id,
        name: data.name as string || "Unknown",
        orderId: data.orderId as string || "Unknown",
        data: data as any,
        status: "pending",
      }
    });
    await notifyAdmin("طلب إرجاع/استبدال 🔄", `طلب ${data.orderId} من ${data.name}`);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function submitSatisfactionSurvey(data: Record<string, unknown>): Promise<boolean> {
  try {
    const id = "SAT-" + Date.now();
    await prisma.satisfactionSurvey.create({
      data: {
        id,
        rating: Number(data.rating) || 0,
        orderId: data.orderId as string || "Unknown",
        data: data as any,
      }
    });
    await notifyAdmin("استبيان رضا ⭐", `تقييم ${data.rating}/5 للطلب ${data.orderId}`);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function notifyQuoteGenerated(client: string, total: number): Promise<void> {
  await notifyAdmin("عرض سعر جديد 📄", `عرض سعر لـ ${client} — ${total} د.ل`);
}

// ── BOQ ─────────────────────────────────────────────────────────

const BOQ_MAX_BYTES = 400_000;

export async function saveBoqFile(
  base64: string,
  fileName: string,
): Promise<{ ok: true; refId: string; fileName: string } | { ok: false; message: string }> {
  try {
    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > BOQ_MAX_BYTES) {
      return {
        ok: false,
        message: "حجم الملف كبير (الحد 400 ك.ب). أرسل الملف عبر واتساب مع الطلب.",
      };
    }
    const refId = "BOQ-" + Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    
    await prisma.boqMetadata.create({
      data: {
        id: refId,
        fileName: safeName,
        sizeBytes: buffer.length,
        data: base64,
      }
    });

    await notifyAdmin("ملف BOQ مرفق 📋", `ملف ${safeName} — مرجع ${refId}`);
    return { ok: true, refId, fileName: safeName };
  } catch (e) {
    console.error("saveBoqFile error:", e);
    return { ok: false, message: "تعذر حفظ الملف. حاول مرة أخرى أو أرسله عبر واتساب." };
  }
}

// ── Coupons ─────────────────────────────────────────────────────

export async function validateCoupon(code: string): Promise<{ valid: boolean; discount: number; message?: string }> {
  try {
    const c = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });
    if (!c) return { valid: false, discount: 0, message: "كود غير صالح" };
    if (c.expiresAt && c.expiresAt < new Date()) return { valid: false, discount: 0, message: "انتهت صلاحية الكود" };
    if (c.maxUses && c.usedCount >= c.maxUses) return { valid: false, discount: 0, message: "استُنفذت مرات الاستخدام" };
    return { valid: true, discount: c.discountPercent || 0 };
  } catch {
    return { valid: false, discount: 0 };
  }
}

export async function applyCouponUse(code: string): Promise<void> {
  try {
    await prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } }
    });
  } catch (e) {
    console.error(e);
  }
}

export async function createCoupon(data: { code: string; discountPercent: number; expiresAt?: string; maxUses?: number }): Promise<boolean> {
  try {
    await prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        usedCount: 0,
      }
    });
    return true;
  } catch {
    return false;
  }
}

export async function getCoupons(): Promise<any[]> {
  try {
    const coupons = await prisma.coupon.findMany();
    return coupons.map((d: any) => ({ ...d, expiresAt: d.expiresAt?.toISOString() }));
  } catch {
    return [];
  }
}

// ── FAQ / Blog / Banners ────────────────────────────────────────

async function seedFaq() {
  const count = await prisma.faqItem.count();
  if (count === 0) {
    for (const item of FAQ_SEED) {
      await prisma.faqItem.create({ data: item as any });
    }
  }
}

export async function getFaqItems(): Promise<any[]> {
  await seedFaq();
  return prisma.faqItem.findMany({ orderBy: { order: 'asc' } });
}

export async function saveFaqItem(item: Record<string, unknown>): Promise<boolean> {
  try {
    const id = String(item.id || "faq-" + Date.now());
    await prisma.faqItem.upsert({
      where: { id },
      update: {
        questionAr: item.questionAr as string || "",
        questionEn: item.questionEn as string || "",
        answerAr: item.answerAr as string || "",
        answerEn: item.answerEn as string || "",
        order: Number(item.order) || 0,
      },
      create: {
        id,
        questionAr: item.questionAr as string || "",
        questionEn: item.questionEn as string || "",
        answerAr: item.answerAr as string || "",
        answerEn: item.answerEn as string || "",
        order: Number(item.order) || 0,
      }
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteFaqItem(id: string): Promise<boolean> {
  try {
    await prisma.faqItem.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

async function seedBlog() {
  const count = await prisma.blogPost.count();
  if (count === 0) {
    for (const item of BLOG_SEED) {
      await prisma.blogPost.create({ data: item as any });
    }
  }
}

export async function getBlogPosts(): Promise<any[]> {
  await seedBlog();
  const posts = await prisma.blogPost.findMany({ orderBy: { date: 'desc' } });
  return posts.map((d: any) => ({ ...d, date: d.date.toISOString() }));
}

export async function getBlogPost(slug: string): Promise<any | null> {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return null;
  return { ...post, date: post.date.toISOString() };
}

export async function saveBlogPost(post: Record<string, unknown>): Promise<boolean> {
  try {
    const id = String(post.id || "blog-" + Date.now());
    await prisma.blogPost.upsert({
      where: { id },
      update: {
        titleAr: post.titleAr as string || "",
        titleEn: post.titleEn as string || "",
        slug: post.slug as string,
        excerptAr: post.excerptAr as string || "",
        excerptEn: post.excerptEn as string || "",
        bodyAr: post.bodyAr as string || "",
        bodyEn: post.bodyEn as string || "",
        published: post.published as boolean || false,
      },
      create: {
        id,
        titleAr: post.titleAr as string || "",
        titleEn: post.titleEn as string || "",
        slug: post.slug as string,
        excerptAr: post.excerptAr as string || "",
        excerptEn: post.excerptEn as string || "",
        bodyAr: post.bodyAr as string || "",
        bodyEn: post.bodyEn as string || "",
        published: post.published as boolean || false,
      }
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  try {
    await prisma.blogPost.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

async function seedBanners() {
  const count = await prisma.banner.count();
  if (count === 0) {
    for (const item of BANNER_SEED) {
      await prisma.banner.create({ data: item as any });
    }
  }
}

export async function getBanners(): Promise<any[]> {
  await seedBanners();
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  });
  return banners;
}

export async function getAllBanners(): Promise<any[]> {
  await seedBanners();
  return prisma.banner.findMany({ orderBy: { order: 'asc' } });
}

export async function saveBanner(banner: Record<string, unknown>): Promise<boolean> {
  try {
    const id = String(banner.id || "banner-" + Date.now());
    await prisma.banner.upsert({
      where: { id },
      update: {
        titleAr: banner.titleAr as string || "",
        titleEn: banner.titleEn as string || "",
        subtitleAr: banner.subtitleAr as string || "",
        subtitleEn: banner.subtitleEn as string || "",
        imageUrl: banner.imageUrl as string,
        link: banner.link as string | null,
        active: banner.active as boolean,
        order: Number(banner.order) || 0,
      },
      create: {
        id,
        titleAr: banner.titleAr as string || "",
        titleEn: banner.titleEn as string || "",
        subtitleAr: banner.subtitleAr as string || "",
        subtitleEn: banner.subtitleEn as string || "",
        imageUrl: banner.imageUrl as string,
        link: banner.link as string | null,
        active: banner.active as boolean,
        order: Number(banner.order) || 0,
      }
    });
    return true;
  } catch {
    return false;
  }
}

// ── Admin lists ─────────────────────────────────────────────────

export async function getSubmissions(collection: string): Promise<any[]> {
  try {
    switch (collection) {
      case "sample_requests":
        return await prisma.sampleRequest.findMany({ orderBy: { date: 'desc' }, take: 100 });
      case "contact_messages":
        return await prisma.contactMessage.findMany({ orderBy: { date: 'desc' }, take: 100 });
      case "career_applications":
        return await prisma.careerApplication.findMany({ orderBy: { date: 'desc' }, take: 100 });
      case "appointments":
        return await prisma.appointment.findMany({ orderBy: { date: 'desc' }, take: 100 });
      case "return_requests":
        return await prisma.returnRequest.findMany({ orderBy: { date: 'desc' }, take: 100 });
      case "satisfaction_surveys":
        return await prisma.satisfactionSurvey.findMany({ orderBy: { date: 'desc' }, take: 100 });
      case "tender_requests":
        return await prisma.tenderSupplyRequest.findMany({ orderBy: { date: 'desc' }, take: 100 });
      case "restock_alerts":
        return await prisma.restockAlert.findMany({ orderBy: { date: 'desc' }, take: 100 });
      case "tool_warranties":
        return await prisma.toolWarranty.findMany({ orderBy: { date: 'desc' }, take: 100 });
      case "site_visits":
        return await prisma.siteVisitRequest.findMany({ orderBy: { date: 'desc' }, take: 100 });
      case "workshop_registrations":
        return await prisma.workshopRegistration.findMany({ orderBy: { date: 'desc' }, take: 100 });
      default:
        return [];
    }
  } catch {
    return [];
  }
}

// ── Driver assignment ─────────────────────────────────────────────

export async function assignDriverToOrder(orderId: string, driverId: string, driverName: string): Promise<boolean> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { driverId, driverName, status: "processing" }
    });
    await addNotification(driverId, "مهمة توصيل جديدة 🚚", `تم تعيينك لطلب ${orderId}`);
    return true;
  } catch {
    return false;
  }
}

export async function getDriverOrders(driverId: string): Promise<any[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { driverId }
    });
    return orders.map((o: any) => ({ ...o, details: o.details as any, date: o.date.toISOString() }));
  } catch {
    return [];
  }
}

// ── Chat ────────────────────────────────────────────────────────

let staffIndex = 0;
const STAFF = ["sales1", "sales2", "sales3"];

export async function startChatSession(clientName: string): Promise<string> {
  const id = "CHAT-" + Date.now();
  const assignedTo = STAFF[staffIndex % STAFF.length];
  staffIndex++;
  
  await prisma.chatSession.create({
    data: {
      id,
      clientName,
      assignedTo,
      status: "open",
    }
  });
  return id;
}

export async function sendChatMessage(sessionId: string, sender: string, message: string): Promise<boolean> {
  try {
    await prisma.chatMessage.create({
      data: {
        sessionId,
        sender,
        message,
        timestamp: Date.now(),
      }
    });
    if (sender !== "admin") {
      await notifyAdmin("رسالة شات جديدة 💬", `${sender}: ${message.slice(0, 60)}`);
    }
    return true;
  } catch {
    return false;
  }
}

export async function getChatMessages(sessionId: string): Promise<any[]> {
  try {
    const msgs = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' }
    });
    return msgs.map((m: any) => ({ ...m, timestamp: Number(m.timestamp) }));
  } catch {
    return [];
  }
}

export async function getChatSessions(): Promise<any[]> {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return sessions.map((s: any) => ({ ...s, createdAt: s.createdAt.toISOString() }));
  } catch {
    return [];
  }
}

// ── Phase 2 Submissions ─────────────────────────────────────────

// Returns a human reference number on success, or null on failure.
export async function submitTenderSupply(data: any): Promise<string | null> {
  try {
    const id = "TSR-" + Date.now();
    await prisma.tenderSupplyRequest.create({
      data: {
        id,
        projectName: data.projectName,
        owner: data.owner,
        location: data.location,
        duration: data.duration,
        supplyPeriod: data.supplyPeriod,
        fileUrl: data.fileUrl || null,
        contactInfo: data.contactInfo || {},
      }
    });
    await notifyAdmin("طلب توريد مناقصة جديد 🏗️", `مشروع ${data.projectName} — مرجع ${id}`);
    await addLog({ user: String(data.owner || "guest"), action: `طلب توريد ${id}`, type: "tender" });
    return id;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function submitRestockAlert(productId: string, productName: string, clientName: string, whatsappNumber: string): Promise<boolean> {
  try {
    await prisma.restockAlert.create({
      data: { productId, productName, clientName: clientName || "عميل", whatsappNumber }
    });
    await notifyAdmin("طلب تنبيه توفر منتج 🔔", `${productName} لـ ${clientName || "عميل"}`);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// Returns a human reference number on success, or null on failure.
export async function registerToolWarranty(serialNumber: string, productId: string, productName: string, clientName: string, purchaseDate: string): Promise<string | null> {
  try {
    const id = "WTY-" + Date.now();
    await prisma.toolWarranty.create({
      data: {
        id,
        serialNumber,
        productId,
        productName,
        clientName,
        purchaseDate: new Date(purchaseDate),
      }
    });
    await notifyAdmin("تسجيل ضمان عدة جديد 🔧", `${productName} - ${serialNumber} — مرجع ${id}`);
    return id;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Returns a human reference number on success, or null on failure.
export async function submitSiteVisit(data: any): Promise<string | null> {
  try {
    const id = "SV-" + Date.now();
    await prisma.siteVisitRequest.create({
      data: {
        id,
        issueType: data.issueType,
        projectLocation: data.projectLocation,
        city: data.city,
        preferredTime: data.preferredTime,
        imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls.slice(0, 4) : [],
      }
    });
    await notifyAdmin("طلب زيارة موقع ميدانية 👷", `مدينة ${data.city} — مرجع ${id}`);
    return id;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// ── Workshops (training) ─────────────────────────────────────────

const WORKSHOP_SEED = [
  { id: "ws-01", title: "ورشة أنظمة العزل المائي", instructor: "القسم الفني — الشعلة الرائدة", date: new Date(Date.now() + 14 * 864e5), location: "بنغازي", availableSeats: 20 },
];

export async function getWorkshops(): Promise<any[]> {
  try {
    const count = await prisma.workshop.count();
    if (count === 0) {
      for (const w of WORKSHOP_SEED) await prisma.workshop.create({ data: w as any });
    }
    const list = await prisma.workshop.findMany({ orderBy: { date: 'asc' } });
    return list.map((w: any) => ({ ...w, date: w.date.toISOString() }));
  } catch {
    return [];
  }
}

export async function saveWorkshop(w: Record<string, unknown>): Promise<boolean> {
  try {
    const id = String(w.id || "ws-" + Date.now());
    const payload = {
      title: String(w.title || ""),
      instructor: String(w.instructor || ""),
      date: w.date ? new Date(w.date as string) : new Date(),
      location: String(w.location || ""),
      availableSeats: Number(w.availableSeats) || 0,
    };
    await prisma.workshop.upsert({ where: { id }, update: payload, create: { id, ...payload } });
    return true;
  } catch {
    return false;
  }
}

export async function deleteWorkshop(id: string): Promise<boolean> {
  try { await prisma.workshop.delete({ where: { id } }); return true; } catch { return false; }
}

// Enforces capacity and decrements the seat count atomically.
export async function registerWorkshop(workshopId: string, participantName: string, contactInfo: any): Promise<{ ok: boolean; message?: string }> {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const ws = await tx.workshop.findUnique({ where: { id: workshopId } });
      if (!ws) return { ok: false, message: "الورشة غير موجودة" };
      if (ws.availableSeats <= 0) return { ok: false, message: "اكتمل العدد — لا توجد مقاعد متاحة" };
      await tx.workshop.update({ where: { id: workshopId }, data: { availableSeats: { decrement: 1 } } });
      await tx.workshopRegistration.create({ data: { workshopId, participantName, contactInfo } });
      return { ok: true };
    });
    if (result.ok) await notifyAdmin("تسجيل في ورشة تدريب 🎓", `${participantName}`);
    return result;
  } catch (e) {
    console.error(e);
    return { ok: false, message: "تعذر التسجيل، حاول مجدداً" };
  }
}

// ── Delivery zones ───────────────────────────────────────────────

const DELIVERY_ZONE_SEED = [
  { id: "dz-bng", city: "بنغازي", estimatedDays: "1 - 2 يوم", fees: 0, conditions: "توصيل داخل المدينة" },
  { id: "dz-tri", city: "طرابلس", estimatedDays: "3 - 5 أيام", fees: 0, conditions: "حسب حجم الطلب" },
  { id: "dz-mis", city: "مصراتة", estimatedDays: "2 - 4 أيام", fees: 0, conditions: "" },
  { id: "dz-sab", city: "سبها", estimatedDays: "5 - 7 أيام", fees: 0, conditions: "قد تُطبَّق رسوم شحن" },
];

export async function getDeliveryZones(): Promise<any[]> {
  try {
    const count = await prisma.deliveryZone.count();
    if (count === 0) {
      for (const z of DELIVERY_ZONE_SEED) await prisma.deliveryZone.create({ data: z as any });
    }
    return await prisma.deliveryZone.findMany({ orderBy: { city: 'asc' } });
  } catch {
    return [];
  }
}

export async function saveDeliveryZone(z: Record<string, unknown>): Promise<boolean> {
  try {
    const city = String(z.city || "").trim();
    if (!city) return false;
    const id = String(z.id || "dz-" + Date.now());
    const payload = {
      city,
      estimatedDays: String(z.estimatedDays || ""),
      fees: Number(z.fees) || 0,
      conditions: (z.conditions as string) || null,
    };
    await prisma.deliveryZone.upsert({ where: { id }, update: payload, create: { id, ...payload } });
    return true;
  } catch {
    return false;
  }
}

export async function deleteDeliveryZone(id: string): Promise<boolean> {
  try { await prisma.deliveryZone.delete({ where: { id } }); return true; } catch { return false; }
}

// ── Technical documents (TDS/SDS library) ────────────────────────

export async function getTechnicalDocuments(): Promise<any[]> {
  try {
    const list = await prisma.technicalDocument.findMany({ orderBy: { title: 'asc' } });
    return list.map((d: any) => ({ ...d, date: d.date?.toISOString?.() ?? null }));
  } catch {
    return [];
  }
}

// ── Case Studies (item 8) ────────────────────────────────────────

export async function getCaseStudies(): Promise<any[]> {
  try {
    const list = await prisma.caseStudy.findMany({ orderBy: { date: 'desc' } });
    return list.map((c: any) => ({ ...c, date: c.date?.toISOString?.() ?? null }));
  } catch {
    return [];
  }
}

export async function saveCaseStudy(cs: Record<string, unknown>): Promise<boolean> {
  try {
    const id = String(cs.id || "case-" + Date.now());
    const payload = {
      title: String(cs.title || ""),
      description: String(cs.description || ""),
      status: String(cs.status || "منجز"),
      owner: String(cs.owner || ""),
      imageUrls: Array.isArray(cs.imageUrls) ? (cs.imageUrls as string[]) : [],
      productIds: Array.isArray(cs.productIds) ? (cs.productIds as string[]) : [],
    };
    await prisma.caseStudy.upsert({ where: { id }, update: payload, create: { id, ...payload } });
    return true;
  } catch {
    return false;
  }
}

export async function deleteCaseStudy(id: string): Promise<boolean> {
  try { await prisma.caseStudy.delete({ where: { id } }); return true; } catch { return false; }
}

// ── Approved applicators directory (item 9) ──────────────────────

export async function getApplicators(): Promise<any[]> {
  try {
    const list = await prisma.applicator.findMany({ orderBy: { date: 'desc' } });
    return list.map((a: any) => ({ ...a, date: a.date?.toISOString?.() ?? null }));
  } catch {
    return [];
  }
}

export async function saveApplicator(a: Record<string, unknown>): Promise<boolean> {
  try {
    const id = String(a.id || "app-" + Date.now());
    const payload = {
      name: String(a.name || ""),
      systemSpecialty: String(a.systemSpecialty || ""),
      contactInfo: (a.contactInfo as any) || {},
      certifications: Array.isArray(a.certifications) ? (a.certifications as string[]) : [],
    };
    await prisma.applicator.upsert({ where: { id }, update: payload, create: { id, ...payload } });
    return true;
  } catch {
    return false;
  }
}

export async function deleteApplicator(id: string): Promise<boolean> {
  try { await prisma.applicator.delete({ where: { id } }); return true; } catch { return false; }
}

// ── Contractor billing & statement (item 15) ─────────────────────

export async function createInvoice(data: { contractorId: string; number: string; amount: number; description?: string }): Promise<boolean> {
  try {
    await prisma.invoice.create({
      data: {
        contractorId: data.contractorId,
        number: data.number || "INV-" + Date.now(),
        amount: Number(data.amount) || 0,
        description: data.description || null,
      },
    });
    await addNotification(data.contractorId, "فاتورة جديدة 🧾", `فاتورة ${data.number} بقيمة ${data.amount} د.ل`);
    return true;
  } catch (e) { console.error(e); return false; }
}

export async function createPayment(data: { contractorId: string; amount: number; method?: string; note?: string }): Promise<boolean> {
  try {
    await prisma.payment.create({
      data: {
        contractorId: data.contractorId,
        amount: Number(data.amount) || 0,
        method: data.method || null,
        note: data.note || null,
      },
    });
    await addNotification(data.contractorId, "تم تسجيل دفعة ✅", `دفعة بقيمة ${data.amount} د.ل`);
    return true;
  } catch (e) { console.error(e); return false; }
}

// Returns the contractor's invoices, payments, a merged ledger and computed balance.
export async function getContractorStatement(contractorId: string): Promise<{
  balance: number; totalInvoiced: number; totalPaid: number;
  ledger: { id: string; date: string; type: "INVOICE" | "PAYMENT"; amount: number; description: string }[];
}> {
  try {
    const [invoices, payments] = await Promise.all([
      prisma.invoice.findMany({ where: { contractorId }, orderBy: { date: 'asc' } }),
      prisma.payment.findMany({ where: { contractorId }, orderBy: { date: 'asc' } }),
    ]);
    const totalInvoiced = invoices.reduce((s: number, i: any) => s + i.amount, 0);
    const totalPaid = payments.reduce((s: number, p: any) => s + p.amount, 0);
    const ledger = [
      ...invoices.map((i: any) => ({ id: i.number || i.id, date: i.date.toISOString(), type: "INVOICE" as const, amount: i.amount, description: i.description || "فاتورة مبيعات" })),
      ...payments.map((p: any) => ({ id: p.id, date: p.date.toISOString(), type: "PAYMENT" as const, amount: p.amount, description: p.note || `دفعة (${p.method || "—"})` })),
    ].sort((a, b) => a.date.localeCompare(b.date));
    // Negative balance = contractor owes the company
    return { balance: totalPaid - totalInvoiced, totalInvoiced, totalPaid, ledger };
  } catch (e) {
    console.error(e);
    return { balance: 0, totalInvoiced: 0, totalPaid: 0, ledger: [] };
  }
}

// ── Search analytics + product views (item 20) ───────────────────

export async function logSearch(query: string, hasResults: boolean): Promise<void> {
  try {
    const q = (query || "").trim();
    if (!q) return;
    await prisma.searchLog.create({ data: { query: q.slice(0, 120), hasResults } });
  } catch (e) { console.error(e); }
}

export async function incrementProductView(id: string): Promise<void> {
  try { await prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } }); }
  catch { /* product may not be in DB yet — ignore */ }
}

// Aggregates a management report for the last N days (item 20 — admin-only, no email).
export async function getWeeklyReport(days = 7): Promise<any> {
  try {
    const since = new Date(Date.now() - days * 864e5);
    const [orders, contactMessages, tenders, sampleReqs, siteVisits, searchLogs, topProducts, lowStock] = await Promise.all([
      prisma.order.findMany({ where: { date: { gte: since } } }),
      prisma.contactMessage.count({ where: { date: { gte: since } } }),
      prisma.tenderSupplyRequest.count({ where: { date: { gte: since } } }),
      prisma.sampleRequest.count({ where: { date: { gte: since } } }),
      prisma.siteVisitRequest.count({ where: { date: { gte: since } } }),
      prisma.searchLog.findMany({ where: { date: { gte: since } } }),
      prisma.product.findMany({ orderBy: { viewCount: 'desc' }, take: 5 }),
      prisma.product.findMany({ where: { stockCount: { lte: 15 } }, orderBy: { stockCount: 'asc' }, take: 10 }),
    ]);
    // Top no-result searches
    const noResult: Record<string, number> = {};
    for (const s of searchLogs) if (!s.hasResults) noResult[s.query] = (noResult[s.query] || 0) + 1;
    const topNoResult = Object.entries(noResult).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([query, count]) => ({ query, count }));

    const salesTotal = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
    return {
      periodDays: days,
      salesTotal,
      salesCount: orders.length,
      pendingOrders: orders.filter((o: any) => o.status === "pending").length,
      inquiries: contactMessages,
      quoteRequests: tenders + sampleReqs + siteVisits,
      totalSearches: searchLogs.length,
      topViewed: topProducts.map((p: any) => ({ id: p.id, name: p.nameAr, views: p.viewCount || 0 })),
      topNoResult,
      lowStock: lowStock.map((p: any) => ({ id: p.id, name: p.nameAr, stock: p.stockCount ?? 0 })),
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function saveTechnicalDocument(doc: Record<string, unknown>): Promise<boolean> {
  try {
    const id = String(doc.id || "doc-" + Date.now());
    const payload = {
      title: String(doc.title || ""),
      docType: String(doc.docType || "TDS"),
      fileUrl: String(doc.fileUrl || ""),
      brandId: (doc.brandId as string) || null,
      productId: (doc.productId as string) || null,
    };
    await prisma.technicalDocument.upsert({ where: { id }, update: payload, create: { id, ...payload } });
    return true;
  } catch {
    return false;
  }
}

export async function deleteTechnicalDocument(id: string): Promise<boolean> {
  try { await prisma.technicalDocument.delete({ where: { id } }); return true; } catch { return false; }
}
