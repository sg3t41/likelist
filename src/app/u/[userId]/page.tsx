import { prisma } from "@/lib/prisma";
import UserRankingClient from "@/components/UserRankingClient";
import CategoryNotFoundPage from "@/components/CategoryNotFoundPage";
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
      image: true,
    },
  });

  if (!user) {
    notFound();
  }

  // 現在のログインユーザー情報を取得
  const currentUser = await getCurrentUser();

  // セッションのユーザーIDが存在しない場合の処理
  if (currentUser && (currentUser as any).userId) {
    const sessionUser = await prisma.user.findUnique({
      where: { id: (currentUser as any).userId },
    });

    if (!sessionUser) {
      // セッションのユーザーがDBに存在しない場合は、セッションを無効として扱う
      return notFound();
    }
  }

  // カテゴリー情報を取得
  const categories = await prisma.mainCategory.findMany({
    where: { userId: user.id },
    include: {
      subCategories: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
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

  // カテゴリ存在チェック
  if (initialSelection.view === "main" && initialSelection.mainCategoryId) {
    const mainCategory = await prisma.mainCategory.findFirst({
      where: {
        id: initialSelection.mainCategoryId,
        userId: user.id,
      },
    });

    if (!mainCategory) {
      return (
        <CategoryNotFoundPage
          categoryType="main"
          categoryName={initialSelection.mainCategory}
          userId={user.id}
        />
      );
    }
  } else if (initialSelection.subCategoryId) {
    const subCategory = await prisma.subCategory.findFirst({
      where: {
        id: initialSelection.subCategoryId,
        userId: user.id,
      },
    });

    if (!subCategory) {
      return (
        <CategoryNotFoundPage
          categoryType="sub"
          categoryName={initialSelection.subCategory}
          userId={user.id}
        />
      );
    }
  }

  // 初期ランキングデータを取得
  let initialRankings = null;
  if (initialSelection.view === "main" && initialSelection.mainCategoryId) {
    // 大カテゴリのランキングを取得

    // 直接作成されたアイテム
    const directItems = await prisma.rankingItem.findMany({
      where: {
        userId: user.id,
        mainCategoryId: initialSelection.mainCategoryId,
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    // 参照アイテム
    const references = await prisma.mainCategoryItemReference.findMany({
      where: { mainCategoryId: initialSelection.mainCategoryId },
      include: {
        rankingItem: {
          include: {
            subCategory: true,
            images: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    // 結合して整形
    const allItems = [
      ...directItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        url: item.url,
        images: item.images?.slice(0, 1) || [],
        position: item.position || 999,
        isReference: false,
      })),
      ...references.map((ref) => ({
        id: ref.rankingItem.id,
        title: ref.rankingItem.title,
        description: ref.rankingItem.description,
        url: ref.rankingItem.url,
        images: ref.rankingItem.images,
        position: ref.position || 999,
        sourceSubCategoryName: ref.rankingItem.subCategory?.name,
        sourceSubCategoryId: ref.rankingItem.subCategoryId,
        isReference: true,
        referenceId: ref.id,
      })),
    ].sort((a, b) => (a.position || 999) - (b.position || 999));

    initialRankings = {
      type: "main",
      categoryId: initialSelection.mainCategoryId,
      items: allItems,
    };
  } else if (initialSelection.subCategoryId) {
    // 小カテゴリのランキングを取得
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: initialSelection.subCategoryId },
      select: { name: true },
    });

    const items = await prisma.rankingItem.findMany({
      where: {
        userId: user.id,
        subCategoryId: initialSelection.subCategoryId,
      },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    initialRankings = {
      type: "sub",
      categoryId: initialSelection.subCategoryId,
      categoryName: subCategory?.name || initialSelection.subCategory,
      items: items.map((item, index) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        url: item.url,
        images: item.images?.slice(0, 1) || [],
        position: item.position || (index + 1), // positionがnullの場合はインデックス+1を使用
      })),
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
