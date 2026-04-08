import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPage = nextUrl.pathname === "/login" || nextUrl.pathname.startsWith("/api/auth");
      
      if (!isLoggedIn && !isPublicPage) {
        return false; // Redirect to login
      }
      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as any;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;

export const { auth } = NextAuth(authConfig);
