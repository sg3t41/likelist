import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// キャッシュ設定: ピン留めの場合はキャッシュしない
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "recent"; // "recent" or "pinned"
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let items;

    if (type === "pinned") {
      // ピン留めされたアイテムを取得（メインカテゴリ参照も含む）
      items = await prisma.rankingItem.findMany({
        where: {
          userId: userId,
          isPinned: true,
          OR: [
            { subCategoryId: { not: null } },
            { mainCategoryId: { not: null } }
          ]
        },
        include: {
          subCategory: {
            include: {
              mainCategory: true,
            },
          },
          mainCategory: true,
          mainCategoryReferences: true, // メインカテゴリ参照も取得
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: limit,
      });
    } else {
      // 最新更新順でアイテムを取得（小カテゴリまたは大カテゴリに紐付く）
      items = await prisma.rankingItem.findMany({
        where: {
          userId: userId,
          OR: [
            { subCategoryId: { not: null } },
            { mainCategoryId: { not: null } }
          ]
        },
        include: {
          subCategory: {
            include: {
              mainCategory: true,
            },
          },
          mainCategory: true,
          mainCategoryReferences: true, // メインカテゴリ参照も取得
          images: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: limit,
      });
    }

    // レスポンス用にデータを整形
    console.log('[Summary API] Raw items:', items.map(i => ({ 
      id: i.id, 
      title: i.title, 
      position: i.position, 
      subCategoryId: i.subCategoryId,
      mainCategoryId: i.mainCategoryId,
      mainCategoryReferences: i.mainCategoryReferences
    })));
    
    const formattedItems = items.map((item) => {
      // 小カテゴリに紐付いている場合
      if (item.subCategory) {
        // サブカテゴリの順位を優先して表示
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          url: item.url,
          position: item.position, // サブカテゴリ内での順位
          isPinned: item.isPinned,
          images: item.images,
          updatedAt: item.updatedAt,
          category: {
            main: item.subCategory.mainCategory.name,
            sub: item.subCategory.name,
            mainId: item.subCategory.mainCategory.id,
            subId: item.subCategory.id,
          },
        };
      }
      // 大カテゴリ直下の場合
      else if (item.mainCategory) {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          url: item.url,
          position: item.position, // メインカテゴリ内での順位
          isPinned: item.isPinned,
          images: item.images,
          updatedAt: item.updatedAt,
          category: {
            main: item.mainCategory.name,
            sub: "全般", // 大カテゴリ直下の場合は"全般"と表示
            mainId: item.mainCategory.id,
            subId: null,
          },
        };
      }
    }).filter(Boolean); // nullを除外

    // キャッシュヘッダーを設定（ピン留めの場合はキャッシュしない）
    const response = NextResponse.json({
      items: formattedItems,
      type,
      total: formattedItems.length,
    });
    
    if (type === 'pinned') {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    } else {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    }
    
    return response;
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}