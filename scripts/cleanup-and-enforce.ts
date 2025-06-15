/**
 * データベースクリーンアップと制約強化スクリプト
 * 開発段階での整理とDB厳密化
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupAndEnforce() {
  console.log('=== データベースクリーンアップ開始 ===\n');

  try {
    // 1. 孤立したアイテムの削除（カテゴリが設定されていない）
    console.log('🗑️ 孤立したアイテムを削除中...');
    const orphanedItems = await prisma.rankingItem.deleteMany({
      where: {
        AND: [
          { subCategoryId: null },
          { mainCategoryId: null }
        ]
      }
    });
    console.log(`削除した孤立アイテム: ${orphanedItems.count}個\n`);

    // 2. 削除マークされたアイテムのクリーンアップ
    console.log('🗑️ 削除マークされたアイテムを処理中...');
    const deletedItems = await prisma.rankingItem.findMany({
      where: {
        title: '[削除されたアイテム]'
      },
      include: {
        mainCategoryReferences: true
      }
    });

    for (const item of deletedItems) {
      if (item.mainCategoryReferences.length === 0) {
        // 参照がない削除マークアイテムは完全削除
        await prisma.rankingItem.delete({
          where: { id: item.id }
        });
        console.log(`参照なし削除マークアイテムを完全削除: ${item.id}`);
      }
    }
    console.log();

    // 3. 壊れた参照の削除
    console.log('🔗 壊れた参照を削除中...');
    const brokenRefs = await prisma.$queryRaw<{id: string}[]>`
      SELECT r.id
      FROM "MainCategoryItemReference" r
      LEFT JOIN "RankingItem" ri ON r."rankingItemId" = ri.id
      LEFT JOIN "MainCategory" mc ON r."mainCategoryId" = mc.id
      WHERE ri.id IS NULL OR mc.id IS NULL OR ri."subCategoryId" IS NULL
    `;

    for (const ref of brokenRefs) {
      await prisma.mainCategoryItemReference.delete({
        where: { id: ref.id }
      });
      console.log(`壊れた参照を削除: ${ref.id}`);
    }
    console.log();

    // 4. 異常なposition値の修正
    console.log('⚠️ 異常なposition値を修正中...');
    const abnormalItems = await prisma.rankingItem.findMany({
      where: {
        OR: [
          { position: { lt: 1 } },
          { position: { gt: 11 } }
        ]
      }
    });

    for (const item of abnormalItems) {
      // 適切な空きポジションを見つけて設定
      const categoryId = item.subCategoryId || item.mainCategoryId;
      const isMainCategory = !!item.mainCategoryId;
      
      if (categoryId) {
        let nextPosition = 1;
        let usedPositions: number[] = [];

        if (isMainCategory) {
          // 大カテゴリの場合
          const [directItems, refs] = await Promise.all([
            prisma.rankingItem.findMany({
              where: { mainCategoryId: categoryId, position: { not: null } },
              select: { position: true }
            }),
            prisma.mainCategoryItemReference.findMany({
              where: { mainCategoryId: categoryId, position: { not: null } },
              select: { position: true }
            })
          ]);
          usedPositions = [
            ...directItems.map(i => i.position!),
            ...refs.map(r => r.position!)
          ];
        } else {
          // 小カテゴリの場合
          const items = await prisma.rankingItem.findMany({
            where: { subCategoryId: categoryId, position: { not: null } },
            select: { position: true }
          });
          usedPositions = items.map(i => i.position!);
        }

        while (usedPositions.includes(nextPosition)) {
          nextPosition++;
        }

        await prisma.rankingItem.update({
          where: { id: item.id },
          data: { position: Math.min(nextPosition, 11) }
        });
        console.log(`異常position修正: ${item.id} -> position ${Math.min(nextPosition, 11)}`);
      }
    }
    console.log();

    // 5. 重複positionの解決
    console.log('🎯 重複positionを解決中...');
    const duplicates = await prisma.$queryRaw<{
      subCategoryId: string | null,
      mainCategoryId: string | null,
      position: number,
      count: number
    }[]>`
      SELECT "subCategoryId", "mainCategoryId", position, COUNT(*) as count
      FROM "RankingItem" 
      WHERE position IS NOT NULL
      GROUP BY "subCategoryId", "mainCategoryId", position
      HAVING COUNT(*) > 1
    `;

    for (const dup of duplicates) {
      const categoryId = dup.subCategoryId || dup.mainCategoryId;
      const isMainCategory = !!dup.mainCategoryId;
      
      const duplicateItems = await prisma.rankingItem.findMany({
        where: {
          ...(isMainCategory 
            ? { mainCategoryId: categoryId } 
            : { subCategoryId: categoryId }
          ),
          position: dup.position
        },
        orderBy: { createdAt: 'asc' }
      });

      // 最初のアイテム以外は新しいpositionを割り当て
      for (let i = 1; i < duplicateItems.length; i++) {
        let newPosition = dup.position + i;
        while (newPosition <= 11) {
          const existingAtNewPos = await prisma.rankingItem.findFirst({
            where: {
              ...(isMainCategory 
                ? { mainCategoryId: categoryId } 
                : { subCategoryId: categoryId }
              ),
              position: newPosition,
              id: { not: duplicateItems[i].id }
            }
          });
          
          if (!existingAtNewPos) break;
          newPosition++;
        }

        if (newPosition <= 11) {
          await prisma.rankingItem.update({
            where: { id: duplicateItems[i].id },
            data: { position: newPosition }
          });
          console.log(`重複position解決: ${duplicateItems[i].id} -> position ${newPosition}`);
        }
      }
    }
    console.log();

    // 6. 空のカテゴリの削除
    console.log('📁 空のカテゴリを削除中...');
    const emptySubs = await prisma.subCategory.findMany({
      where: {
        rankingItems: { none: {} }
      }
    });

    for (const emptySub of emptySubs) {
      await prisma.subCategory.delete({
        where: { id: emptySub.id }
      });
      console.log(`空のサブカテゴリを削除: ${emptySub.name}`);
    }

    const emptyMains = await prisma.mainCategory.findMany({
      where: {
        AND: [
          { rankingItems: { none: {} } },
          { itemReferences: { none: {} } },
          { subCategories: { none: {} } }
        ]
      }
    });

    for (const emptyMain of emptyMains) {
      await prisma.mainCategory.delete({
        where: { id: emptyMain.id }
      });
      console.log(`空のメインカテゴリを削除: ${emptyMain.name}`);
    }
    console.log();

    // 7. 最終統計
    console.log('📊 クリーンアップ後の統計:');
    const [finalUserCount, finalCategoryCount, finalSubCount, finalItemCount, finalRefCount] = await Promise.all([
      prisma.user.count(),
      prisma.mainCategory.count(),
      prisma.subCategory.count(),
      prisma.rankingItem.count(),
      prisma.mainCategoryItemReference.count(),
    ]);

    console.log(`  ユーザー数: ${finalUserCount}`);
    console.log(`  メインカテゴリ数: ${finalCategoryCount}`);
    console.log(`  サブカテゴリ数: ${finalSubCount}`);
    console.log(`  ランキングアイテム数: ${finalItemCount}`);
    console.log(`  参照アイテム数: ${finalRefCount}\n`);

    console.log('✅ データベースクリーンアップ完了');

  } catch (error) {
    console.error('クリーンアップエラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
if (require.main === module) {
  cleanupAndEnforce()
    .then(() => {
      console.log('クリーンアップ完了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('クリーンアップ失敗:', error);
      process.exit(1);
    });
}

export { cleanupAndEnforce };