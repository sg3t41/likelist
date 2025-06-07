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
    
    console.log("Home page: currentUser found", { userId, username, email: currentUser.email });
    
    // userIdとusernameの両方をチェック
    let dbUser = null;
    
    if (userId) {
      // ユーザーIDがある場合はDBで確認
      dbUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      console.log("Home page: Found user by ID", !!dbUser);
    }
    
    if (!dbUser && username) {
      // ユーザーIDでの検索に失敗した場合、usernameで検索
      dbUser = await prisma.user.findUnique({
        where: { username }
      });
      console.log("Home page: Found user by username", !!dbUser);
    }
    
    if (!dbUser && currentUser.email) {
      // それでも見つからない場合、emailで検索（最終手段）
      dbUser = await prisma.user.findUnique({
        where: { email: currentUser.email }
      });
      console.log("Home page: Found user by email", !!dbUser);
    }
    
    if (dbUser) {
      console.log("Home page: Redirecting to", `/u/${dbUser.id}`);
      redirect(`/u/${dbUser.id}`);
    } else {
      console.log("Home page: No DB user found, showing HomeClient with currentUser");
    }
  }
  
  // 未ログインまたはセッションが無効な場合
  return <HomeClient currentUser={currentUser} />;
}