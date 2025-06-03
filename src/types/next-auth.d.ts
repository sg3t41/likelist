import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      userId?: string | null
    }
  }

  interface JWT {
    username?: string | null
    userId?: string | null
    accessToken?: string | null
    refreshToken?: string | null
    accessTokenExpires?: number
  }
}