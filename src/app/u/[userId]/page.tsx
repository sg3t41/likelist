import { prisma } from "@/lib/prisma";
import UserRankingPage from "@/components/UserRankingPage";
import { notFound } from "next/navigation";

export default async function UserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  // ユーザー情報を取得
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      image: true
    }
  });

  if (!user) {
    notFound();
  }

  return <UserRankingPage pageUser={user} />;
}