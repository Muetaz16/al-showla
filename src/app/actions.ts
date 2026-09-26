"use server";

// ─────────────────────────────────────────────────────────────────
//  Alshowla Al-Raeda — PostgreSQL Server Actions
//  All reads/writes go through Prisma to PostgreSQL
// ─────────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import { Product, PRODUCTS as INITIAL_PRODUCTS } from "@/lib/products";

// ════════════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════════════

export async function getProducts(): Promise<Product[]> {
  // Catalog is served from the static real-product list (src/lib/catalog-data.ts).
  // These are the supplier's actual products with local images and no prices; the
  // catalog is fixed content, so we bypass the DB to guarantee it shows everywhere.
  return INITIAL_PRODUCTS;
}

async function seedProducts() {
  for (const p of INITIAL_PRODUCTS) {
    const { brand, certificates, ...rest } = p;
    await prisma.product.create({
      data: {
        ...rest,
        priceBase: rest.priceBase ?? 0,
        legacyBrand: brand,
        certificates: {
          create: certificates.map(c => ({
            certNumber: "N/A",
            grantingAuthority: c.issuer || "Unknown",
            isIso9001: c.nameEn.includes("ISO 9001"),
            scope: c.nameEn,
          }))
        }
      }
    });
  }
  console.log(`✅ Seeded ${INITIAL_PRODUCTS.length} products to PostgreSQL`);
}

export async function addProduct(product: Product): Promise<boolean> {
  try {
    const { brand, certificates, ...rest } = product;
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        ...rest,
        priceBase: rest.priceBase ?? 0,
        legacyBrand: brand,
      },
      create: {
        ...rest,
        priceBase: rest.priceBase ?? 0,
        legacyBrand: brand,
        certificates: {
          create: certificates.map(c => ({
            certNumber: "N/A",
            grantingAuthority: c.issuer || "Unknown",
            isIso9001: c.nameEn.includes("ISO 9001"),
            scope: c.nameEn,
          }))
        }
      }
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({
      where: { id }
    });
    return true;
  } catch (err) {
    console.error("deleteProduct error:", err);
    return false;
  }
}

export async function updateProductStock(id: string, inStock: boolean): Promise<boolean> {
  try {
    await prisma.product.update({
      where: { id },
      data: { inStock }
    });
    return true;
  } catch (err) {
    console.error("updateProductStock error:", err);
    return false;
  }
}

// ════════════════════════════════════════════════════════════════
//  ORDERS
// ════════════════════════════════════════════════════════════════

export async function getOrders(): Promise<any[]> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { date: 'desc' }
    });
    return orders.map(o => ({
      ...o,
      date: o.date.toISOString(),
      details: o.details as any
    }));
  } catch (err) {
    console.error("getOrders error:", err);
    return [];
  }
}

export async function placeOrder(order: any): Promise<string> {
  try {
    const id = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    
    // If placed by a contractor, update their wallet balance
    if (order.contractorId && order.total) {
      const contractor = await prisma.contractor.findUnique({
        where: { id: order.contractorId }
      });
      
      let currentBalance = contractor?.balance || 0;
      let creditLimit = contractor?.creditLimit || 0;
      
      if (!contractor) {
        // Fallback to local hardcoded limit if not in DB yet
        const { DEMO_CONTRACTORS } = await import('@/lib/contractor-auth');
        const demo = Object.values(DEMO_CONTRACTORS).find(c => c.user.id === order.contractorId);
        if (demo) {
          currentBalance = demo.user.balance || 0;
          creditLimit = demo.user.creditLimit || 5000;
        }
      }

      if (currentBalance + order.total > creditLimit) {
        return "LIMIT_EXCEEDED";
      }

      await prisma.$transaction([
        prisma.contractor.upsert({
          where: { id: order.contractorId },
          update: { balance: currentBalance + order.total },
          create: { id: order.contractorId, balance: currentBalance + order.total, creditLimit }
        }),
        prisma.order.create({
          data: {
            id,
            client: order.client,
            contractorId: order.contractorId,
            driverId: order.driverId,
            driverName: order.driverName,
            total: order.total,
            status: "pending",
            details: order.details as any,
          }
        })
      ]);
    } else {
      await prisma.order.create({
        data: {
          id,
          client: order.client,
          contractorId: order.contractorId,
          driverId: order.driverId,
          driverName: order.driverName,
          total: order.total,
          status: "pending",
          details: order.details as any,
        }
      });
    }

    // Trigger Notification for Admin
    await addNotification("admin", "طلب جديد 📦", `تم استلام طلب جديد (${id}) من ${order.client}`);

    if (order.contractorId) {
      await addNotification(order.contractorId, "تم استلام طلبك ✅", `طلبك رقم ${id} قيد المراجعة — سنُعلمك عند الموافقة`);
    }

    return id;
  } catch (err) {
    console.error("placeOrder error:", err);
    return "";
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<boolean> {
  try {
    const orderData = await prisma.order.findUnique({ where: { id } });
    if (!orderData) return false;

    // Deduct stock if order is moving to processing and hasn't been deducted yet
    if ((status === "processing" || status === "delivered") && orderData.details && !orderData.stockDeducted) {
      const details = orderData.details as any[];
      
      const transactions = [];
      for (const item of details) {
        if (item.productId) {
          const pData = await prisma.product.findUnique({ where: { id: item.productId } });
          if (pData) {
            const currentStock = pData.stockCount ?? 50;
            transactions.push(
              prisma.product.update({
                where: { id: item.productId },
                data: { stockCount: Math.max(0, currentStock - item.quantity) }
              })
            );
          }
        }
      }
      transactions.push(
        prisma.order.update({
          where: { id },
          data: { status, stockDeducted: true }
        })
      );
      
      await prisma.$transaction(transactions);
    } else {
      await prisma.order.update({
        where: { id },
        data: { status }
      });
    }

    // Trigger Notification for the Contractor
    if (orderData.contractorId) {
      const statusNotifs: Record<string, { title: string; body: string }> = {
        pending:    { title: "طلبك معلّق ⏳", body: `طلبك رقم ${id} لا يزال قيد المراجعة` },
        confirmed:  { title: "تمت الموافقة على طلبك ✅", body: `طلبك رقم ${id} تم تأكيده من الإدارة` },
        processing: { title: "طلبك قيد التجهيز 📦", body: `جاري تجهيز طلبك رقم ${id} للتوصيل` },
        delivered:  { title: "تم توصيل طلبك 🚚", body: `طلبك رقم ${id} تم تسليمه بنجاح` },
        cancelled:  { title: "تم إلغاء الطلب ❌", body: `طلبك رقم ${id} تم إلغاؤه — تواصل معنا للاستفسار` },
      };
      const msg = statusNotifs[status] || {
        title: "تحديث حالة الطلب 🔄",
        body: `تم تحديث طلبك (${id})`,
      };
      await addNotification(orderData.contractorId, msg.title, msg.body);
    }

    return true;
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return false;
  }
}

// ════════════════════════════════════════════════════════════════
//  FAVORITES (B2B Accounts)
// ════════════════════════════════════════════════════════════════

export async function getFavorites(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.favorites || [];
  } catch (err) {
    console.error("getFavorites error:", err);
    return [];
  }
}

export async function toggleFavorite(userId: string, productId: string, isAdding: boolean): Promise<boolean> {
  if (!userId) return false;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    let favorites = user?.favorites || [];
    
    if (isAdding && !favorites.includes(productId)) {
      favorites.push(productId);
    } else if (!isAdding) {
      favorites = favorites.filter(id => id !== productId);
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { favorites }
    });
    return true;
  } catch (err) {
    console.error("toggleFavorite error:", err);
    return false;
  }
}

// ════════════════════════════════════════════════════════════════
//  REVIEWS & RATINGS
// ════════════════════════════════════════════════════════════════

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { date: 'desc' }
    });
    return reviews.map(r => ({
      ...r,
      date: r.date.toISOString(),
    }));
  } catch (err) {
    console.error("getProductReviews error:", err);
    return [];
  }
}

export async function addProductReview(review: Review): Promise<boolean> {
  try {
    const id = "REV-" + Math.floor(10000 + Math.random() * 90000);
    
    await prisma.review.create({
      data: {
        id,
        productId: review.productId,
        userId: review.userId,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
      }
    });
    
    const p = await prisma.product.findUnique({ where: { id: review.productId } });
    if (p) {
      const newCount = (p.reviewCount || 0) + 1;
      const newRating = ((p.rating || 0) * (p.reviewCount || 0) + review.rating) / newCount;
      await prisma.product.update({
        where: { id: review.productId },
        data: { reviewCount: newCount, rating: newRating }
      });
    }
    return true;
  } catch (err) {
    console.error("addProductReview error:", err);
    return false;
  }
}

// ════════════════════════════════════════════════════════════════
//  USERS & CLIENTS (Admin)
// ════════════════════════════════════════════════════════════════

export async function getRealUsers(): Promise<any[]> {
  try {
    const users = await prisma.user.findMany();
    return users.map(user => ({
      uid: user.id,
      email: user.email || "-",
      phoneNumber: "-", // You can add phone field later if needed
      displayName: user.name || "-",
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════
//  AUDIT LOGS
// ════════════════════════════════════════════════════════════════

export interface AuditLog {
  id?: string;
  time: string;
  user: string;
  action: string;
  type: string;
  timestamp: number;
}

export async function addLog(log: Omit<AuditLog, "id" | "time" | "timestamp">): Promise<void> {
  try {
    const now = new Date();
    await prisma.log.create({
      data: {
        ...log,
        time: now.toLocaleTimeString("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime(),
      }
    });
  } catch (err) {
    console.error("addLog error:", err);
  }
}

export async function getLogs(): Promise<AuditLog[]> {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    return logs.map(l => ({ ...l, timestamp: Number(l.timestamp) }));
  } catch (err) {
    console.error("getLogs error:", err);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════
//  CONTRACTOR WALLETS
// ════════════════════════════════════════════════════════════════

export async function getContractorWallet(id: string): Promise<{ balance: number, creditLimit: number } | null> {
  try {
    const c = await prisma.contractor.findUnique({ where: { id } });
    if (c) {
      return { balance: c.balance, creditLimit: c.creditLimit };
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function updateContractorWallet(id: string, balance: number, creditLimit: number): Promise<boolean> {
  try {
    await prisma.contractor.upsert({
      where: { id },
      update: { balance, creditLimit },
      create: { id, balance, creditLimit }
    });
    return true;
  } catch (e) {
    return false;
  }
}

// ════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ════════════════════════════════════════════════════════════════

export interface Notification {
  id?: string;
  target: string; // 'admin' or contractorId
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

export async function addNotification(target: string, title: string, body: string): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        target,
        title,
        body,
        timestamp: Date.now(),
        read: false
      }
    });
  } catch (err) {
    console.error("addNotification error:", err);
  }
}

export async function getAdminNotifications(): Promise<Notification[]> {
  try {
    const notifs = await prisma.notification.findMany({
      where: { target: "admin" },
      orderBy: { timestamp: 'desc' },
      take: 20
    });
    return notifs.map(n => ({ ...n, timestamp: Number(n.timestamp) }));
  } catch (err) {
    return [];
  }
}
