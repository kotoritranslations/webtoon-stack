// src/lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

const newUserIds = new Set<string>();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { prompt: "select_account" },
      },
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },

  events: {
    async createUser({ user }) {
      if (!user.email) return;

      try {
        // Generar username único basado en el email
        const base = user.email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "") || "user";

        let username = base;
        let counter = 1;
        while (await prisma.user.findUnique({ where: { username }, select: { id: true } })) {
          username = `${base}${counter++}`;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            username,
            displayName: user.name || username,
            isCreator: true,
          },
        });

        if (user.id) newUserIds.add(user.id);

        console.log(`✅ Usuario creado: ${username}`);
      } catch (err) {
        console.error("❌ Error en createUser:", err);
      }
    },
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },

    async session({ session, user }) {
      if (!session.user) return session;

      session.user.id = user.id;

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          username: true,
          isCreator: true,
          displayName: true,
          avatar: true,
        },
      });

      if (dbUser) {
        session.user.username = dbUser.username;
        session.user.isCreator = dbUser.isCreator;
        session.user.displayName = dbUser.displayName;
        session.user.avatar = dbUser.avatar;
      }

      if (newUserIds.has(user.id)) {
        session.user.isNewUser = true;
        newUserIds.delete(user.id);
      } else {
        session.user.isNewUser = false;
      }

      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
});