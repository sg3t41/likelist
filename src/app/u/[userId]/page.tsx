import { prisma } from "@/lib/prisma";
import UserRankingClient from "@/components/UserRankingClient";
import CategoryNotFoundPage from "@/components/CategoryNotFoundPage";
import StructuredData from "@/components/StructuredData";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
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
    return {
      title: "ユーザーが見つかりません | すきなものリスト",
      description: "指定されたユーザーは見つかりませんでした。",
    };
  }

  const userName = user.name || `@${user.username}` || "ユーザー";
  const baseUrl = "https://sukilist.jp";
  const pageUrl = `${baseUrl}/u/${userId}`;
  
  // カテゴリ情報を取得
  let categoryInfo = "";
  let description = `${userName}さんの好きなものリスト`;
  let pageTitle = `${userName}さんの好きなものリスト`;

  try {
    // URLパラメータから現在の表示内容を判定
    if (urlParams.view === "main" && urlParams.mainCategoryId) {
      // 大カテゴリビューの場合
      const mainCategory = await prisma.mainCategory.findFirst({
        where: {
          id: urlParams.mainCategoryId as string,
          userId: user.id,
        },
      });

      if (mainCategory) {
        categoryInfo = mainCategory.name;
        pageTitle = `${userName}さんの【${categoryInfo}】ランキング`;
        
        // トップ3の項目を取得して説明に含める
        const directItems = await prisma.rankingItem.findMany({
          where: {
            userId: user.id,
            mainCategoryId: urlParams.mainCategoryId as string,
          },
          orderBy: { position: "asc" },
          take: 3,
        });

        const references = await prisma.mainCategoryItemReference.findMany({
          where: { mainCategoryId: urlParams.mainCategoryId as string },
          include: {
            rankingItem: true,
          },
          orderBy: { position: "asc" },
          take: 3,
        });

        const top3Items = [
          ...directItems.map(item => ({ title: item.title, position: item.position || 999 })),
          ...references.map(ref => ({ title: ref.rankingItem.title, position: ref.position || 999 })),
        ]
          .sort((a, b) => a.position - b.position)
          .slice(0, 3);

        if (top3Items.length > 0) {
          const top3Text = top3Items.map((item, index) => `${index + 1}位:${item.title}`).join(", ");
          description = `${userName}さんの【${categoryInfo}】ランキング。${top3Text}など、お気に入りをチェック！`;
        } else {
          description = `${userName}さんの【${categoryInfo}】ランキング。好きなものを11位まで整理して公開中！`;
        }
      }
    } else if (urlParams.subCategoryId) {
      // 小カテゴリビューの場合
      const subCategory = await prisma.subCategory.findFirst({
        where: {
          id: urlParams.subCategoryId as string,
          userId: user.id,
        },
        include: {
          mainCategory: true,
        },
      });

      if (subCategory) {
        const mainCategoryName = subCategory.mainCategory.name;
        const subCategoryName = subCategory.name;
        categoryInfo = `${mainCategoryName} - ${subCategoryName}`;
        pageTitle = `${userName}さんの【${categoryInfo}】ランキング`;

        // トップ3の項目を取得
        const items = await prisma.rankingItem.findMany({
          where: {
            userId: user.id,
            subCategoryId: urlParams.subCategoryId as string,
          },
          orderBy: { position: "asc" },
          take: 3,
        });

        if (items.length > 0) {
          const top3Text = items.map((item, index) => `${index + 1}位:${item.title}`).join(", ");
          description = `${userName}さんの【${categoryInfo}】ランキング。${top3Text}など、厳選されたお気に入りをチェック！`;
        } else {
          description = `${userName}さんの【${categoryInfo}】ランキング。好きなものを11位まで整理して公開中！`;
        }
      }
    } else {
      // トップページの場合
      const categoryCount = await prisma.mainCategory.count({
        where: { userId: user.id },
      });

      const itemCount = await prisma.rankingItem.count({
        where: { userId: user.id },
      });

      if (categoryCount > 0 || itemCount > 0) {
        description = `${userName}さんの好きなものリスト。${categoryCount}個のカテゴリ、${itemCount}個のお気に入りアイテムを公開中！`;
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
    // エラーの場合はデフォルトの説明を使用
  }

  const currentUrl = new URL(pageUrl);
  if (urlParams.mainCategoryId) currentUrl.searchParams.set('mainCategoryId', urlParams.mainCategoryId as string);
  if (urlParams.mainCategory) currentUrl.searchParams.set('mainCategory', urlParams.mainCategory as string);
  if (urlParams.subCategoryId) currentUrl.searchParams.set('subCategoryId', urlParams.subCategoryId as string);
  if (urlParams.subCategory) currentUrl.searchParams.set('subCategory', urlParams.subCategory as string);
  if (urlParams.view) currentUrl.searchParams.set('view', urlParams.view as string);

  return {
    title: pageTitle,
    description,
    keywords: [
      "好きなもの",
      "ランキング",
      "おすすめ",
      userName,
      categoryInfo,
      "リスト",
      "お気に入り",
      "趣味",
      "コレクション"
    ].filter(Boolean).join(", "),
    authors: [{ name: userName }],
    creator: userName,
    publisher: "すきなものリスト",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: currentUrl.toString(),
    },
    openGraph: {
      title: pageTitle,
      description,
      url: currentUrl.toString(),
      siteName: "すきなものリスト",
      images: [
        {
          url: user.image || `${baseUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${userName}さんのプロフィール画像`,
        },
      ],
      locale: "ja_JP",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      creator: user.username ? `@${user.username}` : undefined,
      images: [user.image || `${baseUrl}/og-default.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
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

  // 構造化データ用の情報を準備
  let structuredDataCategoryName = "";
  let structuredDataItems: any[] = [];
  const baseUrl = "https://sukilist.jp";
  const currentUrl = new URL(`${baseUrl}/u/${userId}`);
  
  if (initialSelection.mainCategoryId) currentUrl.searchParams.set('mainCategoryId', initialSelection.mainCategoryId);
  if (initialSelection.mainCategory) currentUrl.searchParams.set('mainCategory', initialSelection.mainCategory);
  if (initialSelection.subCategoryId) currentUrl.searchParams.set('subCategoryId', initialSelection.subCategoryId);
  if (initialSelection.subCategory) currentUrl.searchParams.set('subCategory', initialSelection.subCategory);
  if (initialSelection.view) currentUrl.searchParams.set('view', initialSelection.view);

  if (initialRankings) {
    if (initialRankings.type === "main" && initialSelection.mainCategory) {
      structuredDataCategoryName = initialSelection.mainCategory;
    } else if (initialRankings.type === "sub" && initialSelection.mainCategory && initialSelection.subCategory) {
      structuredDataCategoryName = `${initialSelection.mainCategory} - ${initialSelection.subCategory}`;
    }
    
    structuredDataItems = initialRankings.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.url,
      position: item.position || 1,
    }));
  }

  return (
    <>
      <UserRankingClient
        pageUser={user}
        currentUser={currentUser}
        initialCategories={categories}
        initialSelection={initialSelection}
        initialRankings={initialRankings}
      />
      <StructuredData
        user={user}
        categoryName={structuredDataCategoryName}
        items={structuredDataItems}
        pageUrl={currentUrl.toString()}
        isMainCategory={initialSelection.view === "main"}
      />
    </>
  );
}
