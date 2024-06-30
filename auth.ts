import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { validateJWT } from "./lib/authHelpers"

// Define a custom user type that matches what your validateJWT function returns
type CustomUser = {
  id: string;
  name?: string | null;
  email?: string | null;
}

export const config = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (typeof credentials?.token !== "string") {
          return null
        }
        const jwtPayload = await validateJWT(credentials.token)
        if (jwtPayload) {
          return {
            id: jwtPayload.sub!,
            name: jwtPayload.name,
            email: jwtPayload.email,
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)