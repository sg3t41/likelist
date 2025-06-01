import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;
    const { title, description, position } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // アイテムの存在確認と権限チェック
    const existingItem = await prisma.rankingItem.findUnique({
      where: { id: params.id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 順位変更の場合、同じカテゴリ内の他のアイテムの順位も調整する必要がある
    if (position && position !== existingItem.position) {
      // 同じカテゴリのアイテムを取得
      const categoryFilter = existingItem.mainCategoryId 
        ? { mainCategoryId: existingItem.mainCategoryId }
        : { subCategoryId: existingItem.subCategoryId };
      
      const categoryItems = await prisma.rankingItem.findMany({
        where: categoryFilter,
        orderBy: { position: 'asc' }
      });

      // 新しい位置に既にアイテムがある場合は、そのアイテムの位置をクリアする
      const itemAtNewPosition = categoryItems.find(item => item.position === position);
      if (itemAtNewPosition && itemAtNewPosition.id !== params.id) {
        await prisma.rankingItem.update({
          where: { id: itemAtNewPosition.id },
          data: { position: null }
        });
      }
    }

    // アイテムを更新
    const updatedItem = await prisma.rankingItem.update({
      where: { id: params.id },
      data: {
        title,
        description: description || null,
        position: position || null,
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

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating ranking item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;

    // アイテムの存在確認と権限チェック
    const existingItem = await prisma.rankingItem.findUnique({
      where: { id: params.id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 削除前に、この項目を参照している大カテゴリがあるかチェック
    const references = await prisma.mainCategoryItemReference.findMany({
      where: { rankingItemId: params.id },
      include: {
        mainCategory: true,
      },
    });

    // 各参照を直接項目に変換
    for (const ref of references) {
      await prisma.rankingItem.create({
        data: {
          title: existingItem.title,
          description: existingItem.description,
          position: ref.position,
          mainCategoryId: ref.mainCategoryId,
          userId: ref.mainCategory.userId,
        },
      });
    }

    // アイテムを削除（参照も自動的に削除される）
    await prisma.rankingItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting ranking item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}