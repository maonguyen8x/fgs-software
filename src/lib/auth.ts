import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { SESSION_REMEMBER_SECONDS, SESSION_SHORT_SECONDS } from "@/config/admin-auth";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar ?? undefined,
          rememberMe: credentials.rememberMe === "true",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_REMEMBER_SECONDS,
  },
  jwt: {
    maxAge: SESSION_REMEMBER_SECONDS,
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user) {
        const remember = Boolean((user as { rememberMe?: boolean }).rememberMe);
        token.rememberMe = remember;
        const maxAge = remember ? SESSION_REMEMBER_SECONDS : SESSION_SHORT_SECONDS;
        token.exp = Math.floor(Date.now() / 1000) + maxAge;
        token.name = user.name;
        if (user.image) token.picture = user.image as string;
      }
      if (trigger === "update" && updateSession) {
        if (updateSession.name) token.name = updateSession.name as string;
        if (updateSession.image !== undefined) {
          token.picture = (updateSession.image as string | null) ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.picture === "string") session.user.image = token.picture;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
