import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });
        
        if (user && user.password && credentials.password) {
          const bcrypt = require("bcryptjs");
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (isValid) {
            return user as any;
          }
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
}

export default NextAuth(authOptions)
