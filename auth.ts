import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Twitter from "next-auth/providers/twitter";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createHash } from "node:crypto";
import { UserRole } from "@prisma/client";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { type: "email" },
      password: { type: "password" }
    },
    async authorize(credentials) {
      if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") return null;
      const email = credentials.email.trim().toLowerCase();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash || !user.emailVerified) return null;
      if (!(await compare(credentials.password, user.passwordHash))) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role };
    }
  })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
}
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(Facebook({ clientId: process.env.FACEBOOK_CLIENT_ID, clientSecret: process.env.FACEBOOK_CLIENT_SECRET }));
}
if (process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET) {
  providers.push(Twitter({ clientId: process.env.X_CLIENT_ID, clientSecret: process.env.X_CLIENT_SECRET }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "jwt", maxAge: 1209600 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;

      // Keep authorization tied to the database role, not a stale role in an old JWT.
      if (token.sub) {
        const currentUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, name: true, email: true, passwordHash: true }
        });
        if (currentUser) {
          const passwordVersion = currentUser.passwordHash
            ? createHash("sha256").update(currentUser.passwordHash).digest("hex")
            : null;

          // JWT sessions are stateless. A password-hash fingerprint lets us
          // revoke existing tokens on the next request after a password reset.
          if (token.passwordVersion !== undefined && token.passwordVersion !== passwordVersion) {
            delete token.sub;
            delete token.name;
            delete token.email;
            delete token.passwordVersion;
            token.role = "CLIENT";
            return token;
          }

          token.passwordVersion = passwordVersion;
          token.role = currentUser.role;
          token.name = currentUser.name ?? token.name;
          token.email = currentUser.email;
        } else {
          delete token.sub;
          delete token.passwordVersion;
          token.role = "CLIENT";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        session.user.role = Object.values(UserRole).includes(token.role as UserRole) ? token.role as UserRole : UserRole.CLIENT;
      }
      return session;
    }
  }
});
