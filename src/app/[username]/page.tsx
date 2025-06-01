import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import UserNotFoundPage from "@/components/UserNotFoundPage";

export default async function UsernamePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  // @で始まる場合、または%40で始まる場合（URL encoded @）を処理
  let cleanUsername: string;
  if (username.startsWith('@')) {
    cleanUsername = username.slice(1);
  } else if (username.startsWith('%40')) {
    cleanUsername = decodeURIComponent(username).slice(1);
  } else {
    notFound();
  }
  
  // ユーザー名からユーザー情報を取得
  const user = await prisma.user.findFirst({
    where: { 
      username: cleanUsername 
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true
    }
  });

  if (!user) {
    // ユーザーが見つからない場合は専用ページを表示
    return <UserNotFoundPage username={cleanUsername} />;
  }

  // 内部IDのURLにリダイレクト
  redirect(`/u/${user.id}`);
}