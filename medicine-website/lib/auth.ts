import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db/client";
import bcrypt from "bcrypt";
import { storage } from "./db/storage";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Check if admin
        const admin = await storage.getAdminByEmail(email);
        if (admin) {
          const isValid = await bcrypt.compare(password, admin.password);
          if (isValid) {
            await storage.updateAdminLastLogin(admin.id);
            return {
              id: admin.id,
              email: admin.email,
              name: admin.fullName,
              role: "admin",
            } as any;
          }
        }

        // Check regular user
        const user = await storage.getUserByEmail(email);
        if (user) {
          const isValid = await bcrypt.compare(password, user.password);
          if (isValid) {
            return {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: "user",
            } as any;
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
});
