const DRIVER_KEY = "alshowla_driver_auth";

export interface DriverUser {
  id: string;
  name: string;
  phone: string;
  active: boolean;
}

const DRIVERS: Record<string, { password: string; user: DriverUser }> = {
  driver1: { password: "driver123", user: { id: "driver1", name: "أحمد السائق", phone: "0911111111", active: true } },
  driver2: { password: "driver456", user: { id: "driver2", name: "محمد السائق", phone: "0922222222", active: true } },
};

export function driverLogin(username: string, password: string): DriverUser | null {
  const acc = DRIVERS[username];
  if (!acc || acc.password !== password || !acc.user.active) return null;
  const user = { ...acc.user };
  if (typeof window !== "undefined") {
    localStorage.setItem(DRIVER_KEY, JSON.stringify(user));
  }
  return user;
}

export function driverLogout(): void {
  if (typeof window !== "undefined") localStorage.removeItem(DRIVER_KEY);
}

export function getDriverSession(): DriverUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRIVER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAllDrivers(): DriverUser[] {
  return Object.values(DRIVERS).map((d) => d.user);
}
