import { prisma } from "@/lib/prisma";
import UserRankingClient from "@/components/UserRankingClient";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UserPage({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const urlParams = await searchParams;

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

  // 現在のログインユーザー情報を取得
  const currentUser = await getCurrentUser();

  // カテゴリー情報を取得
  const categories = await prisma.mainCategory.findMany({
    where: { userId: user.id },
    include: {
      subCategories: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  // URLパラメータから初期選択状態を決定
  const initialSelection = {
    mainCategoryId: urlParams.mainCategoryId as string | undefined,
    mainCategory: urlParams.mainCategory as string | undefined,
    subCategoryId: urlParams.subCategoryId as string | undefined,
    subCategory: urlParams.subCategory as string | undefined,
    view: urlParams.view as string | undefined,
    highlight: urlParams.highlight as string | undefined,
  };

  // 初期ランキングデータを取得
  let initialRankings = null;
  if (initialSelection.view === 'main' && initialSelection.mainCategoryId) {
    // 大カテゴリのランキングを取得
    
    // 直接作成されたアイテム
    const directItems = await prisma.rankingItem.findMany({
      where: { 
        userId: user.id,
        mainCategoryId: initialSelection.mainCategoryId
      }
    });

    // 参照アイテム
    const references = await prisma.mainCategoryItemReference.findMany({
      where: { mainCategoryId: initialSelection.mainCategoryId },
      include: {
        rankingItem: {
          include: {
            subCategory: true
          }
        }
      }
    });
    
    // 結合して整形
    const allItems = [
      ...directItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        position: item.position || 999,
        isReference: false,
      })),
      ...references.map(ref => ({
        id: ref.rankingItem.id,
        title: ref.rankingItem.title,
        description: ref.rankingItem.description,
        position: ref.position || 999,
        sourceSubCategoryName: ref.rankingItem.subCategory?.name,
        sourceSubCategoryId: ref.rankingItem.subCategoryId,
        isReference: true,
        referenceId: ref.id
      }))
    ].sort((a, b) => (a.position || 999) - (b.position || 999));
    
    initialRankings = {
      type: 'main',
      categoryId: initialSelection.mainCategoryId,
      items: allItems
    };
  } else if (initialSelection.subCategoryId) {
    // 小カテゴリのランキングを取得
    const items = await prisma.rankingItem.findMany({
      where: { 
        userId: user.id,
        subCategoryId: initialSelection.subCategoryId
      }
    });
    
    initialRankings = {
      type: 'sub',
      categoryId: initialSelection.subCategoryId,
      categoryName: initialSelection.subCategory,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        position: item.position
      }))
    };
  }

  return (
    <UserRankingClient 
      pageUser={user} 
      currentUser={currentUser}
      initialCategories={categories}
      initialSelection={initialSelection}
      initialRankings={initialRankings}
    />
  );
}