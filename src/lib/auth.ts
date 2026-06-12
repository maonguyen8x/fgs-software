import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAdminLoginUrl } from "@/config/admin";
import { SESSION_REMEMBER_SECONDS, SESSION_SHORT_SECONDS } from "@/config/admin-auth";
import { verifyAdminToken } from "@/lib/admin-signed-token";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        loginTicket: { label: "Login Ticket", type: "text" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        const ticket = credentials?.loginTicket
          ? verifyAdminToken<{ type: string; userId: string }>(credentials.loginTicket)
          : null;

        if (!ticket || ticket.type !== "login_ticket" || !ticket.userId) return null;

        const user = await prisma.user.findUnique({
          where: { id: ticket.userId },
        });
        if (!user || !user.isActive) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar ?? undefined,
          role: user.role,
          rememberMe: credentials?.rememberMe === "true",
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
    signIn: getAdminLoginUrl(),
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
        if ((user as { role?: string }).role) {
          token.role = (user as { role?: string }).role;
        }
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
        if (typeof token.role === "string") session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
