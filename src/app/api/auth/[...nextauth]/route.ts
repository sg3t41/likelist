import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      authorization: {
        params: {
          scope: "users.read tweet.read",
        },
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "twitter") {
        try {
          // Twitter v2 APIではusernameがdata内にある
          const twitterProfile = profile as any;
          const username = twitterProfile.data?.username || twitterProfile.username;
          
          if (!username) {
            console.error("Username not found in profile:", profile);
            return false;
          }

          // Prisma接続を確実にするため、リトライロジックを追加
          let retries = 3;
          while (retries > 0) {
            try {
              await prisma.user.upsert({
                where: { username },
                update: {
                  name: user.name,
                  email: user.email,
                  image: user.image,
                },
                create: {
                  username,
                  name: user.name,
                  email: user.email,
                  image: user.image,
                },
              });
              return true;
            } catch (dbError: any) {
              retries--;
              console.error(`Database error (retries left: ${retries}):`, dbError);
              
              if (retries === 0) {
                throw dbError;
              }
              
              // 短い待機時間を設定
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        } catch (error) {
          console.error("Error saving user:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      // This runs on initial sign-in when account and profile are available
      if (account && profile) {
        const twitterProfile = profile as any;
        const username = twitterProfile.data?.username || twitterProfile.username;
        
        token.username = username;
        
        if (username) {
          const dbUser = await prisma.user.findUnique({
            where: { username },
          });
          if (dbUser) {
            token.userId = dbUser.id;
          }
        }
      } else if (token.username && !token.userId) {
        // This runs on subsequent requests when we have username but no userId
        // This handles the case where the user exists but userId wasn't set in the token
        const dbUser = await prisma.user.findUnique({
          where: { username: token.username as string },
        });
        if (dbUser) {
          token.userId = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).username = token.username;
        (session.user as any).userId = token.userId;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };