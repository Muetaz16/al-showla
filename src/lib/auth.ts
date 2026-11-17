// ─────────────────────────────────────────────
//  Auth utilities — admin session
//  Credentials are validated SERVER-SIDE against the DB (see admin-actions.ts);
//  the resulting session is kept in localStorage for the dashboard UI.
// ─────────────────────────────────────────────

import { adminLogin } from "@/app/admin-actions";

const AUTH_KEY = "alshowla_admin_auth";

export interface AdminUser {
  username: string;
  role: "superadmin" | "admin" | "sub";
  name: string;
  nameAr: string;
  avatar: string;
  loginAt: number;
}

export async function login(username: string, password: string): Promise<AdminUser | null> {
  const user = await adminLogin(username, password); // server-side bcrypt check
  if (user && typeof window !== "undefined") {
    // Stamp with the BROWSER clock so the 8-hour session check can't be thrown off
    // by any difference between the server's clock and the user's device.
    user.loginAt = Date.now();
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }
  return user;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function getSession(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const user: AdminUser = JSON.parse(raw);
    // Session expires after 8 hours
    if (Date.now() - user.loginAt > 8 * 60 * 60 * 1000) {
      logout();
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function canAccess(user: AdminUser | null, feature: "products" | "orders" | "users" | "reports" | "settings" | "inventory"): boolean {
  if (!user) return false;
  if (user.role === "superadmin") return true;
  if (user.role === "admin") return feature !== "settings";
  // sub-admin: only products and orders
  return feature === "products" || feature === "orders" || feature === "inventory";
}
