// ─────────────────────────────────────────────
//  Auth utilities — client-side session
// ─────────────────────────────────────────────

const AUTH_KEY = "alshowla_admin_auth";

export interface AdminUser {
  username: string;
  role: "superadmin" | "admin" | "sub";
  name: string;
  nameAr: string;
  avatar: string;
  loginAt: number;
}

// ── Hardcoded admin accounts ──
const ACCOUNTS: Record<string, { password: string; user: AdminUser }> = {
  admin: {
    password: "admin1234",
    user: {
      username: "admin",
      role: "superadmin",
      name: "System Administrator",
      nameAr: "مدير النظام",
      avatar: "👑",
      loginAt: 0,
    },
  },
  manager: {
    password: "manager123",
    user: {
      username: "manager",
      role: "admin",
      name: "Sales Manager",
      nameAr: "مدير المبيعات",
      avatar: "🧑‍💼",
      loginAt: 0,
    },
  },
  warehouse: {
    password: "store456",
    user: {
      username: "warehouse",
      role: "sub",
      name: "Warehouse Staff",
      nameAr: "موظف المستودع",
      avatar: "📦",
      loginAt: 0,
    },
  },
};

export function login(username: string, password: string): AdminUser | null {
  const acc = ACCOUNTS[username.toLowerCase()];
  if (!acc || acc.password !== password) return null;
  const user: AdminUser = { ...acc.user, loginAt: Date.now() };
  if (typeof window !== "undefined") {
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
