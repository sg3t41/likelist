import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata);
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  // 明示的にURLを設定
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }),
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 90 * 24 * 60 * 60, // 90日間
    updateAge: 7 * 24 * 60 * 60, // 7日ごとに更新（頻度を下げる）
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 90 * 24 * 60 * 60 // 90日間
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback called:', { user: user?.name, provider: account?.provider });
      
      if (account?.provider === "twitter") {
        try {
          // Twitter v2 APIではusernameがdata内にある
          const twitterProfile = profile as any;
          console.log('Twitter profile received:', twitterProfile);
          
          const username = twitterProfile.data?.username || twitterProfile.username;
          
          if (!username) {
            console.error("Username not found in profile:", profile);
            // usernameが取得できない場合でも、ログインは許可する
            console.log("Proceeding without username - user will need to set it later");
            return true;
          }

          console.log(`Attempting to save user with username: ${username}`);

          // Prisma接続を確実にするため、リトライロジックを追加
          let retries = 3; // リトライ回数を減らして高速化
          while (retries > 0) {
            try {
              const savedUser = await prisma.user.upsert({
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
              console.log(`User saved successfully: ${savedUser.id}`);
              return true;
            } catch (dbError: any) {
              retries--;
              console.error(`Database error (retries left: ${retries}):`, dbError);
              
              if (retries === 0) {
                // 最後のリトライでも失敗した場合、ログインは許可するがDB保存はスキップ
                console.error("Failed to save user to database, but allowing login");
                return true;
              }
              
              // 短い待機時間
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        } catch (error) {
          console.error("Unexpected error in signIn callback:", error);
          // エラーが発生してもログインは許可（ユーザー体験を優先）
          return true;
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
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : Date.now() + 90 * 24 * 60 * 60 * 1000; // 90日後（長期保持）
        
        if (username) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { username },
            });
            if (dbUser) {
              token.userId = dbUser.id;
            }
          } catch (error) {
            console.error("Error fetching user in JWT callback:", error);
          }
        }
      } else if (token.username && !token.userId) {
        // This runs on subsequent requests when we have username but no userId
        // This handles the case where the user exists but userId wasn't set in the token
        try {
          const dbUser = await prisma.user.findUnique({
            where: { username: token.username as string },
          });
          if (dbUser) {
            token.userId = dbUser.id;
          }
        } catch (error) {
          console.error("Error fetching user by username in JWT callback:", error);
        }
      }
      
      // Twitter JWTトークンは長期保持するため、期限切れチェックを簡素化
      // ユーザー情報があれば常にトークンを返す
      if (token.userId && token.username) {
        return token;
      }
      
      // ユーザー情報がない場合のみ再認証が必要
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