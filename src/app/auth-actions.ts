"use server";
import { prisma } from "@/lib/prisma";

export async function registerUser(email: string, password: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول." };
    }
    await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        // In a real app you should hash the password using bcrypt or similar.
      }
    });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
