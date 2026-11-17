"use server";

// ─────────────────────────────────────────────────────────────
//  Admin accounts & management — DB-backed (Postgres via Prisma)
//  Admins are stored as User rows with role in (superadmin|admin|sub).
//  A set of BOOTSTRAP accounts seeds the DB on first run and acts as an
//  offline fallback, so the admin can never be locked out.
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { AdminUser } from "@/lib/auth";

type Role = "superadmin" | "admin" | "sub";
const ADMIN_ROLES: Role[] = ["superadmin", "admin", "sub"];

const BOOTSTRAP: { username: string; password: string; role: Role; nameAr: string }[] = [
  { username: "admin", password: "admin1234", role: "superadmin", nameAr: "مدير النظام" },
  { username: "manager", password: "manager123", role: "admin", nameAr: "مدير المبيعات" },
  { username: "warehouse", password: "store456", role: "sub", nameAr: "موظف المستودع" },
];

function avatarFor(role: string) {
  return role === "superadmin" ? "👑" : role === "admin" ? "🧑‍💼" : "📦";
}

function toAdminUser(u: { email: string | null; role: string | null; name: string | null }): AdminUser {
  const role = (u.role as Role) || "sub";
  const name = u.name || u.email || "Admin";
  return { username: (u.email || "").toLowerCase(), role, name, nameAr: name, avatar: avatarFor(role), loginAt: Date.now() };
}

async function seedAdminsIfEmpty() {
  const count = await prisma.user.count({ where: { role: { in: ADMIN_ROLES } } });
  if (count > 0) return;
  for (const a of BOOTSTRAP) {
    const hashed = await bcrypt.hash(a.password, 10);
    await prisma.user.upsert({
      where: { email: a.username },
      update: {}, // leave any existing same-email account untouched
      create: { email: a.username, name: a.nameAr, role: a.role, password: hashed },
    });
  }
}

export async function adminLogin(username: string, password: string): Promise<AdminUser | null> {
  const uname = username.trim().toLowerCase();
  try {
    await seedAdminsIfEmpty();
    const dbu = await prisma.user.findFirst({ where: { email: uname, role: { in: ADMIN_ROLES } } });
    if (dbu && dbu.password) {
      const ok = await bcrypt.compare(password, dbu.password);
      return ok ? toAdminUser(dbu) : null; // DB is authoritative once seeded
    }
    // not a DB admin → fall through to bootstrap
  } catch (e) {
    console.error("adminLogin: DB error, using bootstrap accounts", e);
  }
  const acc = BOOTSTRAP.find((a) => a.username === uname);
  if (acc && acc.password === password) {
    return { username: acc.username, role: acc.role, name: acc.nameAr, nameAr: acc.nameAr, avatar: avatarFor(acc.role), loginAt: Date.now() };
  }
  return null;
}

export async function listAdminUsers(): Promise<{ username: string; role: string; name: string }[]> {
  try {
    await seedAdminsIfEmpty();
    const rows = await prisma.user.findMany({ where: { role: { in: ADMIN_ROLES } }, orderBy: { email: "asc" } });
    return rows.map((r) => ({ username: (r.email || "").toLowerCase(), role: r.role || "sub", name: r.name || "" }));
  } catch {
    return BOOTSTRAP.map((a) => ({ username: a.username, role: a.role, name: a.nameAr }));
  }
}

export async function createAdminUser(actorRole: string, username: string, password: string, role: Role, name: string) {
  if (actorRole !== "superadmin") return { ok: false, error: "صلاحيات غير كافية — المدير العام فقط." };
  const uname = username.trim().toLowerCase();
  if (!uname || !password || password.length < 6) return { ok: false, error: "أدخل اسم مستخدم وكلمة مرور (6 أحرف على الأقل)." };
  if (!ADMIN_ROLES.includes(role)) return { ok: false, error: "دور غير صالح." };
  try {
    await seedAdminsIfEmpty();
    const existing = await prisma.user.findUnique({ where: { email: uname } });
    if (existing) return { ok: false, error: "اسم المستخدم مستخدم بالفعل." };
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email: uname, name: name || uname, role, password: hashed } });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || "خطأ في الإنشاء." };
  }
}

export async function changeAdminPassword(actorRole: string, actorUsername: string, targetUsername: string, newPassword: string) {
  const target = targetUsername.trim().toLowerCase();
  const actor = actorUsername.trim().toLowerCase();
  if (actorRole !== "superadmin" && actor !== target) return { ok: false, error: "يمكنك تغيير كلمة مرورك فقط." };
  if (!newPassword || newPassword.length < 6) return { ok: false, error: "كلمة المرور 6 أحرف على الأقل." };
  try {
    await seedAdminsIfEmpty();
    const u = await prisma.user.findFirst({ where: { email: target, role: { in: ADMIN_ROLES } } });
    if (!u) return { ok: false, error: "المستخدم غير موجود." };
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: u.id }, data: { password: hashed } });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || "خطأ في التحديث." };
  }
}

export async function deleteAdminUser(actorRole: string, actorUsername: string, targetUsername: string) {
  if (actorRole !== "superadmin") return { ok: false, error: "صلاحيات غير كافية." };
  const target = targetUsername.trim().toLowerCase();
  if (target === actorUsername.trim().toLowerCase()) return { ok: false, error: "لا يمكنك حذف حسابك الحالي." };
  try {
    const admins = await prisma.user.findMany({ where: { role: { in: ADMIN_ROLES } } });
    const t = admins.find((a) => (a.email || "").toLowerCase() === target);
    if (!t) return { ok: false, error: "المستخدم غير موجود." };
    if (t.role === "superadmin" && admins.filter((a) => a.role === "superadmin").length <= 1) {
      return { ok: false, error: "لا يمكن حذف آخر مدير عام." };
    }
    await prisma.user.delete({ where: { id: t.id } });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message || "خطأ في الحذف." };
  }
}
