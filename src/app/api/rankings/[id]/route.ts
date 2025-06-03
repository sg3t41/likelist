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

    // 順位変更の場合、位置を入れ替える
    if (position && position !== existingItem.position) {
      const oldPosition = existingItem.position;
      
      if (existingItem.mainCategoryId) {
        // 大カテゴリの場合: 直接作成アイテムと参照アイテムを両方考慮
        const [directItems, references] = await Promise.all([
          prisma.rankingItem.findMany({
            where: { mainCategoryId: existingItem.mainCategoryId },
          }),
          prisma.mainCategoryItemReference.findMany({
            where: { mainCategoryId: existingItem.mainCategoryId },
          })
        ]);

        // 新しい位置にアイテムがあるかチェック
        const directItemAtNewPos = directItems.find(item => item.position === position && item.id !== params.id);
        const refAtNewPos = references.find(ref => ref.position === position);

        if (directItemAtNewPos) {
          // 直接作成されたアイテムと位置を入れ替える
          await prisma.rankingItem.update({
            where: { id: directItemAtNewPos.id },
            data: { position: oldPosition }
          });
        } else if (refAtNewPos) {
          // 参照アイテムと位置を入れ替える
          await prisma.mainCategoryItemReference.update({
            where: { id: refAtNewPos.id },
            data: { position: oldPosition }
          });
        }
      } else {
        // 小カテゴリの場合: 従来の処理
        const categoryItems = await prisma.rankingItem.findMany({
          where: { subCategoryId: existingItem.subCategoryId },
          orderBy: { position: 'asc' }
        });

        const itemAtNewPosition = categoryItems.find(item => item.position === position && item.id !== params.id);
        if (itemAtNewPosition) {
          await prisma.rankingItem.update({
            where: { id: itemAtNewPosition.id },
            data: { position: oldPosition }
          });
        }
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