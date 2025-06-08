import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "すきなものリスト - あなたの好きなものを整理して、みんなとシェアしよう",
  description: "好きなものをカテゴリ別にランキング形式で整理・公開できるサービス。アニメ、映画、音楽、本など、あなたの趣味を見つけて共有しましょう。",
  keywords: "好きなもの, ランキング, リスト, 趣味, 共有, おすすめ, アニメ, 映画, 音楽, 本",
  openGraph: {
    title: "すきなものリスト",
    description: "あなたの好きなものを整理して、みんなとシェアしよう",
    type: "website",
    siteName: "すきなものリスト",
  },
  twitter: {
    card: "summary_large_image",
    title: "すきなものリスト",
    description: "あなたの好きなものを整理して、みんなとシェアしよう",
  },
};

export default async function Home() {
  // 現在のログインユーザー情報を取得
  const currentUser = await getCurrentUser();
  
  if (currentUser) {
    // セッションがある場合の処理
    const userId = (currentUser as any).userId;
    const username = (currentUser as any).username;
    
    
    // userIdとusernameの両方をチェック
    let dbUser = null;
    
    if (userId) {
      // ユーザーIDがある場合はDBで確認
      dbUser = await prisma.user.findUnique({
        where: { id: userId }
      });
    }
    
    if (!dbUser && username) {
      // ユーザーIDでの検索に失敗した場合、usernameで検索
      dbUser = await prisma.user.findUnique({
        where: { username }
      });
    }
    
    if (!dbUser && currentUser.email) {
      // それでも見つからない場合、emailで検索（最終手段）
      dbUser = await prisma.user.findUnique({
        where: { email: currentUser.email }
      });
    }
    
    if (dbUser) {
      redirect(`/u/${dbUser.id}`);
    } else {
    }
  }
  
  // 未ログインまたはセッションが無効な場合
  return <HomeClient currentUser={currentUser} />;
}