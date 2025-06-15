import { prisma } from "@/lib/prisma";

/**
 * カテゴリ内の次の利用可能なpositionを取得
 * 1〜11の範囲で最初の空きpositionを返す
 */
export async function getNextAvailablePosition(
  categoryId: string,
  categoryType: "sub" | "main"
): Promise<number> {
  if (categoryType === "sub") {
    // 小カテゴリの場合
    const items = await prisma.rankingItem.findMany({
      where: { subCategoryId: categoryId },
      select: { position: true },
      orderBy: { position: "asc" },
    });
    
    const usedPositions = items
      .map(item => item.position)
      .filter((pos): pos is number => pos !== null);
    
    // 1〜11で最初の空きを探す
    for (let i = 1; i <= 11; i++) {
      if (!usedPositions.includes(i)) {
        return i;
      }
    }
    
    // 空きがない場合（通常は起こらない）
    return 11;
  } else {
    // 大カテゴリの場合：直接アイテムと参照アイテムの両方を考慮
    const [directItems, references] = await Promise.all([
      prisma.rankingItem.findMany({
        where: { mainCategoryId: categoryId },
        select: { position: true },
      }),
      prisma.mainCategoryItemReference.findMany({
        where: { mainCategoryId: categoryId },
        select: { position: true },
      }),
    ]);
    
    const usedPositions = [
      ...directItems.map(item => item.position).filter((pos): pos is number => pos !== null),
      ...references.map(ref => ref.position).filter((pos): pos is number => pos !== null),
    ];
    
    // 1〜11で最初の空きを探す
    for (let i = 1; i <= 11; i++) {
      if (!usedPositions.includes(i)) {
        return i;
      }
    }
    
    return 11;
  }
}

/**
 * position変更時の再配置処理
 * 指定位置にアイテムを移動し、他のアイテムを適切にシフト
 */
export async function repositionItems(
  itemId: string,
  newPosition: number,
  categoryId: string,
  categoryType: "sub" | "main",
  isReference: boolean = false,
  referenceId?: string
) {
  if (categoryType === "sub") {
    // 小カテゴリの場合
    await prisma.$transaction(async (tx) => {
      // 現在のアイテムの位置を取得
      const currentItem = await tx.rankingItem.findUnique({
        where: { id: itemId },
        select: { position: true },
      });
      
      if (!currentItem) return;
      
      const oldPosition = currentItem.position;
      
      // 同じカテゴリの全アイテムを取得
      const allItems = await tx.rankingItem.findMany({
        where: { subCategoryId: categoryId },
        orderBy: { position: "asc" },
      });
      
      // 位置の再配置
      if (oldPosition && oldPosition !== newPosition) {
        if (newPosition < oldPosition) {
          // 上に移動：間のアイテムを下にシフト
          await tx.rankingItem.updateMany({
            where: {
              subCategoryId: categoryId,
              position: {
                gte: newPosition,
                lt: oldPosition,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
        } else {
          // 下に移動：間のアイテムを上にシフト
          await tx.rankingItem.updateMany({
            where: {
              subCategoryId: categoryId,
              position: {
                gt: oldPosition,
                lte: newPosition,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });
        }
      }
      
      // 対象アイテムを新しい位置に移動
      await tx.rankingItem.update({
        where: { id: itemId },
        data: { position: newPosition },
      });
    });
  } else {
    // 大カテゴリの場合
    await prisma.$transaction(async (tx) => {
      let oldPosition: number | null = null;
      
      if (isReference && referenceId) {
        // 参照アイテムの場合
        const currentRef = await tx.mainCategoryItemReference.findUnique({
          where: { id: referenceId },
          select: { position: true },
        });
        oldPosition = currentRef?.position || null;
      } else {
        // 直接アイテムの場合
        const currentItem = await tx.rankingItem.findUnique({
          where: { id: itemId },
          select: { position: true },
        });
        oldPosition = currentItem?.position || null;
      }
      
      if (oldPosition && oldPosition !== newPosition) {
        if (newPosition < oldPosition) {
          // 上に移動：間のアイテムを下にシフト
          // 直接アイテムのシフト
          await tx.rankingItem.updateMany({
            where: {
              mainCategoryId: categoryId,
              position: {
                gte: newPosition,
                lt: oldPosition,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
          // 参照アイテムのシフト
          await tx.mainCategoryItemReference.updateMany({
            where: {
              mainCategoryId: categoryId,
              position: {
                gte: newPosition,
                lt: oldPosition,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
        } else {
          // 下に移動：間のアイテムを上にシフト
          // 直接アイテムのシフト
          await tx.rankingItem.updateMany({
            where: {
              mainCategoryId: categoryId,
              position: {
                gt: oldPosition,
                lte: newPosition,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });
          // 参照アイテムのシフト
          await tx.mainCategoryItemReference.updateMany({
            where: {
              mainCategoryId: categoryId,
              position: {
                gt: oldPosition,
                lte: newPosition,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });
        }
      }
      
      // 対象アイテムを新しい位置に移動
      if (isReference && referenceId) {
        await tx.mainCategoryItemReference.update({
          where: { id: referenceId },
          data: { position: newPosition },
        });
      } else {
        await tx.rankingItem.update({
          where: { id: itemId },
          data: { position: newPosition },
        });
      }
    });
  }
}

/**
 * アイテム削除時の位置再調整
 * 削除されたアイテムより下のアイテムを上にシフト
 */
export async function adjustPositionsAfterDelete(
  deletedPosition: number,
  categoryId: string,
  categoryType: "sub" | "main"
) {
  if (!deletedPosition) return;
  
  await prisma.$transaction(async (tx) => {
    if (categoryType === "sub") {
      // 小カテゴリの場合
      await tx.rankingItem.updateMany({
        where: {
          subCategoryId: categoryId,
          position: {
            gt: deletedPosition,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
    } else {
      // 大カテゴリの場合
      // 直接アイテムのシフト
      await tx.rankingItem.updateMany({
        where: {
          mainCategoryId: categoryId,
          position: {
            gt: deletedPosition,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
      // 参照アイテムのシフト
      await tx.mainCategoryItemReference.updateMany({
        where: {
          mainCategoryId: categoryId,
          position: {
            gt: deletedPosition,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });
    }
  });
}