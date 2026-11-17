"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(email: string, password: string) {
  try {
    const mail = email.trim().toLowerCase();
    if (!mail || !password || password.length < 6) {
      return { ok: false, error: "أدخل بريداً صحيحاً وكلمة مرور لا تقل عن 6 أحرف." };
    }
    const existing = await prisma.user.findUnique({ where: { email: mail } });
    if (existing) {
      return { ok: false, error: "هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول." };
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: mail,
        name: mail.split("@")[0],
        role: "user",
        password: hashed, // hashed — so the account can actually log in
      }
    });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
