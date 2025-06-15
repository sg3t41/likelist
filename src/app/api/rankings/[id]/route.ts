import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any).userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).userId;
    const { title, description, url, position, isPinned } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // アイテムの存在確認と権限チェック
    const existingItem = await prisma.rankingItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 順位変更の場合、位置を入れ替える（トランザクション内で実行）
    let updatedItem;
    
    if (position !== undefined && position !== existingItem.position) {
      updatedItem = await prisma.$transaction(async (tx) => {
        const oldPosition = existingItem.position;
        
        if (existingItem.mainCategoryId) {
          // 大カテゴリの場合: 直接作成アイテムと参照アイテムを両方考慮
          const [directItems, references] = await Promise.all([
            tx.rankingItem.findMany({
              where: { mainCategoryId: existingItem.mainCategoryId },
            }),
            tx.mainCategoryItemReference.findMany({
              where: { mainCategoryId: existingItem.mainCategoryId },
            })
          ]);

          // 新しい位置にアイテムがあるかチェック
          const directItemAtNewPos = directItems.find(item => item.position === position && item.id !== id);
          const refAtNewPos = references.find(ref => ref.position === position);

          // 位置の交換
          if (directItemAtNewPos) {
            // 直接作成されたアイテムと位置を入れ替える
            await tx.rankingItem.update({
              where: { id: directItemAtNewPos.id },
              data: { position: oldPosition }
            });
          } else if (refAtNewPos) {
            // 参照アイテムと位置を入れ替える
            await tx.mainCategoryItemReference.update({
              where: { id: refAtNewPos.id },
              data: { position: oldPosition }
            });
          }
        } else if (existingItem.subCategoryId) {
          // 小カテゴリの場合: 従来の処理
          const categoryItems = await tx.rankingItem.findMany({
            where: { subCategoryId: existingItem.subCategoryId },
            orderBy: { position: 'asc' }
          });

          const itemAtNewPosition = categoryItems.find(item => item.position === position && item.id !== id);
          if (itemAtNewPosition) {
            await tx.rankingItem.update({
              where: { id: itemAtNewPosition.id },
              data: { position: oldPosition }
            });
          }
        }

        // 移動元のアイテムを新しい位置に更新（トランザクション内で実行）
        return await tx.rankingItem.update({
          where: { id },
          data: {
            title,
            description: description || null,
            url: url || null,
            position: position,
            isPinned: isPinned !== undefined ? isPinned : undefined,
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
            images: {
              orderBy: { order: "asc" },
            },
          },
        });
      });
    } else {
      // 位置変更がない場合は通常の更新
      updatedItem = await prisma.rankingItem.update({
        where: { id },
        data: {
          title,
          description: description || null,
          url: url || null,
          position: position !== undefined ? position : undefined,
          isPinned: isPinned !== undefined ? isPinned : undefined,
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
          images: {
            orderBy: { order: "asc" },
          },
        },
      });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating ranking item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    console.log('[DELETE API] Session:', { 
      hasSession: !!session, 
      userId: session?.user ? (session.user as any).userId : null 
    });
    
    if (!session?.user || !(session.user as any).userId) {
      console.log('[DELETE API] Unauthorized access attempt');
      return NextResponse.json({ 
        error: "認証が必要です。ログインしてください。" 
      }, { status: 401 });
    }

    const userId = (session.user as any).userId;
    console.log('[DELETE API] Attempting to delete item:', { id, userId });

    // アイテムの存在確認と権限チェック
    const existingItem = await prisma.rankingItem.findUnique({
      where: { id },
      include: {
        mainCategoryReferences: true,
      },
    });

    console.log('[DELETE API] Found item:', { 
      exists: !!existingItem, 
      itemUserId: existingItem?.userId, 
      requestUserId: userId,
      hasReferences: existingItem?.mainCategoryReferences?.length || 0
    });

    if (!existingItem) {
      console.log('[DELETE API] Item not found:', id);
      return NextResponse.json({ 
        error: "削除対象のアイテムが見つかりません。" 
      }, { status: 404 });
    }

    if (existingItem.userId !== userId) {
      console.log('[DELETE API] Permission denied:', { itemUserId: existingItem.userId, requestUserId: userId });
      return NextResponse.json({ 
        error: "このアイテムを削除する権限がありません。" 
      }, { status: 403 });
    }

    // 削除処理をトランザクションで実行
    const hasReferences = existingItem.mainCategoryReferences.length > 0;

    await prisma.$transaction(async (tx) => {
      if (hasReferences) {
        // 参照がある場合は、項目を「削除済み」としてマークする
        console.log('[DELETE API] Marking item as deleted (has references)');
        await tx.rankingItem.update({
          where: { id },
          data: {
            title: "[削除されたアイテム]",
            description: null,
            // 小カテゴリから切り離す（大カテゴリの参照は残す）
            subCategoryId: null,
          },
        });
      } else {
        // 参照がない場合は関連データを明示的に削除してから本体を削除
        console.log('[DELETE API] Permanently deleting item (no references)');
        
        // 1. 画像を先に削除
        await tx.rankingItemImage.deleteMany({
          where: { rankingItemId: id },
        });
        
        // 2. メインカテゴリ参照を削除（念のため）
        await tx.mainCategoryItemReference.deleteMany({
          where: { rankingItemId: id },
        });
        
        // 3. 本体を削除
        await tx.rankingItem.delete({
          where: { id },
        });
      }
    });

    console.log('[DELETE API] Item deletion completed successfully');
    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("[DELETE API] Error deleting ranking item:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      itemId: await params.then(p => p.id).catch(() => 'unknown')
    });
    
    // より詳細なエラー情報をレスポンスに含める
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ 
      error: "サーバーエラーが発生しました。",
      details: errorMessage
    }, { status: 500 });
  }
}