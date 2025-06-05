import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subCategoryId = searchParams.get("subCategoryId");
    const mainCategoryId = searchParams.get("mainCategoryId");
    const targetUserId = searchParams.get("userId");

    let rankingItems;

    if (subCategoryId) {
      // 小カテゴリの場合
      rankingItems = await prisma.rankingItem.findMany({
        where: { subCategoryId },
        include: {
          user: {
            select: { name: true, username: true },
          },
          subCategory: {
            select: { name: true },
          },
          images: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { position: "asc" },
      });
    } else if (mainCategoryId) {
      // 大カテゴリの場合：直接所属のアイテムと参照アイテムを取得
      
      // 直接作成されたアイテム
      const directItems = await prisma.rankingItem.findMany({
        where: { mainCategoryId },
        include: {
          user: {
            select: { name: true, username: true },
          },
          images: {
            orderBy: { order: "asc" },
          },
        },
      });

      // 参照アイテム（削除されたアイテムも含む）
      const references = await prisma.mainCategoryItemReference.findMany({
        where: { mainCategoryId },
        include: {
          rankingItem: {
            include: {
              user: {
                select: { name: true, username: true },
              },
              subCategory: {
                select: { id: true, name: true },
              },
              images: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      // 結合して整形
      rankingItems = [
        ...directItems.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          url: item.url,
          images: item.images,
          position: item.position,
          user: item.user,
          isReference: false,
        })),
        ...references.map(ref => {
          // アイテムが削除されている場合（実際のアイテムが存在しないか、削除マークされている場合）
          if (!ref.rankingItem || !ref.rankingItem.subCategoryId) {
            return {
              id: ref.rankingItem ? ref.rankingItem.id : `deleted-${ref.id}`,
              title: "[削除されたアイテム]",
              description: "",
              position: ref.position,
              user: null,
              isReference: true,
              referenceId: ref.id,
              sourceSubCategoryName: null,
              sourceSubCategoryId: null,
              isDeleted: true
            };
          }
          return {
            id: ref.rankingItem.id,
            title: ref.rankingItem.title,
            description: ref.rankingItem.description,
            url: ref.rankingItem.url,
            images: ref.rankingItem.images,
            position: ref.position,
            user: ref.rankingItem.user,
            isReference: true,
            referenceId: ref.id,
            sourceSubCategoryName: ref.rankingItem.subCategory?.name,
            sourceSubCategoryId: ref.rankingItem.subCategory?.id,
          };
        }),
      ].sort((a, b) => (a.position || 999) - (b.position || 999));
    } else {
      return NextResponse.json({ error: "SubCategory ID or MainCategory ID is required" }, { status: 400 });
    }

    return NextResponse.json(rankingItems);
  } catch (error) {
    console.error("Error fetching ranking items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;
    const { title, description, url, subCategoryId, mainCategoryId, existingItemId, position } = await request.json();

    if (existingItemId) {
      // 既存項目をメインカテゴリに追加する場合
      if (!mainCategoryId) {
        return NextResponse.json({ error: "MainCategory ID is required for existing item" }, { status: 400 });
      }

      // 既存項目を取得
      const existingItem = await prisma.rankingItem.findUnique({
        where: { id: existingItemId },
      });

      if (!existingItem) {
        return NextResponse.json({ error: "Existing item not found" }, { status: 404 });
      }

      // 既に同じ項目が大カテゴリに存在するかチェック
      const existingReference = await prisma.mainCategoryItemReference.findUnique({
        where: {
          mainCategoryId_rankingItemId: {
            mainCategoryId: mainCategoryId,
            rankingItemId: existingItemId,
          },
        },
      });

      if (existingReference) {
        return NextResponse.json({ error: "Item already exists in this main category" }, { status: 400 });
      }

      // 参照を作成
      const reference = await prisma.mainCategoryItemReference.create({
        data: {
          mainCategoryId: mainCategoryId,
          rankingItemId: existingItemId,
          position: position || null,
        },
        include: {
          rankingItem: {
            include: {
              user: {
                select: { name: true, username: true },
              },
              subCategory: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      // レスポンスを整形
      const responseItem = {
        ...reference.rankingItem,
        position: reference.position,
        isReference: true,
        referenceId: reference.id,
      };

      return NextResponse.json(responseItem);
    } else {
      // 新規項目を追加する場合
      if (!title || (!subCategoryId && !mainCategoryId)) {
        return NextResponse.json({ error: "Title and either subCategoryId or mainCategoryId are required" }, { status: 400 });
      }

      // カテゴリの存在確認
      if (subCategoryId) {
        const subCategory = await prisma.subCategory.findUnique({
          where: { id: subCategoryId },
        });

        if (!subCategory) {
          return NextResponse.json({ error: "SubCategory not found" }, { status: 404 });
        }
      }

      if (mainCategoryId) {
        const mainCategory = await prisma.mainCategory.findUnique({
          where: { id: mainCategoryId },
        });

        if (!mainCategory) {
          return NextResponse.json({ error: "MainCategory not found" }, { status: 404 });
        }
      }

      // ランキングアイテムを作成
      const rankingItem = await prisma.rankingItem.create({
        data: {
          title,
          description,
          url,
          position: position || null,
          subCategoryId: subCategoryId || null,
          mainCategoryId: mainCategoryId || null,
          userId,
        },
        include: {
          user: {
            select: { name: true, username: true },
          },
          subCategory: {
            select: { name: true },
          },
          mainCategory: {
            select: { name: true },
          },
        },
      });

      console.log("Created ranking item:", {
        id: rankingItem.id,
        title: rankingItem.title,
        position: rankingItem.position,
        mainCategoryId: rankingItem.mainCategoryId,
        subCategoryId: rankingItem.subCategoryId
      });

      return NextResponse.json(rankingItem);
    }
  } catch (error) {
    console.error("Error creating ranking item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}