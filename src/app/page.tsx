import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  // 現在のログインユーザー情報を取得
  const currentUser = await getCurrentUser();
  
  if (currentUser) {
    // セッションがある場合の処理
    const userId = (currentUser as any).userId;
    const username = (currentUser as any).username;
    
    if (userId) {
      // ユーザーIDがある場合はDBで確認
      const dbUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (dbUser) {
        redirect(`/u/${userId}`);
      }
    } else if (username) {
      // ユーザーIDがないがusernameがある場合（旧セッション対応）
      const dbUser = await prisma.user.findUnique({
        where: { username }
      });
      
      if (dbUser) {
        redirect(`/u/${dbUser.id}`);
      }
    }
    
    // セッションはあるがDBにユーザーが見つからない場合は、
    // ログアウトせずにHomeClientを表示（再ログインを促す）
  }
  
  // 未ログインまたはセッションが無効な場合
  return <HomeClient currentUser={currentUser} />;
}