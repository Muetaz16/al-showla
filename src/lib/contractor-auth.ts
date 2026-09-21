// ─────────────────────────────────────────────────────────────
//  Contractor Auth — بوابة المقاولين
//  Manages contractor accounts separately from admin accounts
// ─────────────────────────────────────────────────────────────

const CONTRACTOR_AUTH_KEY = "alshowla_contractor_auth";

export interface ContractorUser {
  id: string;
  username: string;
  nameAr: string;
  nameEn: string;
  company: string;
  phone: string;
  email: string;
  avatar: string;
  loginAt: number;
  active: boolean;
  discountRate: number; // Percentage, e.g. 10 for 10%
  balance: number;      // Current debt/balance (e.g. 1500 means they owe 1500)
  creditLimit: number;  // Max allowed debt (e.g. 5000)
}

// ── Hardcoded demo contractor accounts (Firestore-managed in production) ──
export const DEMO_CONTRACTORS: Record<string, { password: string; user: ContractorUser }> = {
  "contractor@example.com": {
    password: "password123",
    user: {
      id: "CON-001",
      username: "contractor@example.com",
      nameAr: "محمد العمراني",
      nameEn: "Mohammed Al-Omrani",
      company: "شركة العمراني للمقاولات",
      phone: "218912345678",
      email: "contractor@example.com",
      avatar: "🏗️",
      loginAt: 0,
      active: true,
      discountRate: 15, // 15% discount
      balance: 1200,    // owes 1200
      creditLimit: 10000,
    },
  },
  "admin@example.com": {
    password: "password123",
    user: {
      id: "CON-ADMIN",
      username: "admin@example.com",
      nameAr: "مدير النظام",
      nameEn: "Admin User",
      company: "إدارة الشعلة",
      phone: "218923456789",
      email: "admin@example.com",
      avatar: "👑",
      loginAt: 0,
      active: true,
      discountRate: 10,
      balance: 0,
      creditLimit: 50000,
    },
  },
  "user@example.com": {
    password: "password123",
    user: {
      id: "CON-USER",
      username: "user@example.com",
      nameAr: "مستخدم تجريبي",
      nameEn: "Normal User",
      company: "مستخدم عادي",
      phone: "218934567890",
      email: "user@example.com",
      avatar: "👤",
      loginAt: 0,
      active: true,
      discountRate: 5,
      balance: 4800,
      creditLimit: 5000,
    },
  },
  contractor3: {
    password: "contra789",
    user: {
      id: "CON-003",
      username: "contractor3",
      nameAr: "خالد البنغازي",
      nameEn: "Khaled Al-Tarabulsi",
      company: "مجموعة بنغازي للمقاولات",
      phone: "218934567890",
      email: "khaled@benghazi-group.ly",
      avatar: "🔧",
      loginAt: 0,
      active: true,
      discountRate: 5, // 5% discount
      balance: 4800,
      creditLimit: 5000, // Close to limit
    },
  },
};

export function contractorLogin(username: string, password: string): ContractorUser | null {
  const acc = DEMO_CONTRACTORS[username.toLowerCase()];
  if (!acc || acc.password !== password) return null;
  if (!acc.user.active) return null;

  const user: ContractorUser = { ...acc.user, loginAt: Date.now() };
  if (typeof window !== "undefined") {
    localStorage.setItem(CONTRACTOR_AUTH_KEY, JSON.stringify(user));
  }
  return user;
}

export function contractorLogout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CONTRACTOR_AUTH_KEY);
  }
}

export function getContractorSession(): ContractorUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONTRACTOR_AUTH_KEY);
    if (!raw) return null;
    const user: ContractorUser = JSON.parse(raw);
    // Session expires after 12 hours
    if (Date.now() - user.loginAt > 12 * 60 * 60 * 1000) {
      contractorLogout();
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

// List all contractors (for admin panel)
export function getAllContractors(): ContractorUser[] {
  return Object.values(DEMO_CONTRACTORS).map(c => c.user);
}
