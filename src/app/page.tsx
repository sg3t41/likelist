import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  // 現在のログインユーザー情報を取得
  const currentUser = await getCurrentUser();
  
  if (currentUser && (currentUser as any).userId) {
    // ユーザーIDがセッションにある場合、DBに存在するか確認
    const dbUser = await prisma.user.findUnique({
      where: { id: (currentUser as any).userId }
    });
    
    if (dbUser) {
      // ユーザーが存在する場合はリダイレクト
      redirect(`/u/${(currentUser as any).userId}`);
    }
    // ユーザーが存在しない場合は、セッションが古いのでログイン画面を表示
  }
  
  // 未ログインまたはセッションが無効な場合
  return <HomeClient />;
}