import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      // ピン留めされたアイテムを取得
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
    const formattedItems = items.map((item) => {
      // 小カテゴリに紐付いている場合
      if (item.subCategory) {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          url: item.url,
          position: item.position,
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
          position: item.position,
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

    return NextResponse.json({
      items: formattedItems,
      type,
      total: formattedItems.length,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}