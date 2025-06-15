/**
 * 本番データベースの状態分析スクリプト
 * 問題のあるデータを特定する
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeData() {
  console.log('=== データベース分析開始 ===\n');

  try {
    // 1. 基本統計
    const [userCount, categoryCount, subCategoryCount, itemCount, refCount] = await Promise.all([
      prisma.user.count(),
      prisma.mainCategory.count(),
      prisma.subCategory.count(),
      prisma.rankingItem.count(),
      prisma.mainCategoryItemReference.count(),
    ]);

    console.log('📊 基本統計:');
    console.log(`  ユーザー数: ${userCount}`);
    console.log(`  メインカテゴリ数: ${categoryCount}`);
    console.log(`  サブカテゴリ数: ${subCategoryCount}`);
    console.log(`  ランキングアイテム数: ${itemCount}`);
    console.log(`  参照アイテム数: ${refCount}\n`);

    // 2. position関連の問題
    const [itemsWithoutPosition, itemsWithDuplicatePosition] = await Promise.all([
      prisma.rankingItem.count({
        where: { position: null }
      }),
      prisma.$queryRaw`
        SELECT "subCategoryId", "mainCategoryId", position, COUNT(*) as count
        FROM "RankingItem" 
        WHERE position IS NOT NULL
        GROUP BY "subCategoryId", "mainCategoryId", position
        HAVING COUNT(*) > 1
      `
    ]);

    console.log('🎯 Position関連の問題:');
    console.log(`  positionがnullのアイテム: ${itemsWithoutPosition}`);
    console.log(`  重複positionの組み合わせ: ${(itemsWithDuplicatePosition as any[]).length}\n`);

    if ((itemsWithDuplicatePosition as any[]).length > 0) {
      console.log('重複position詳細:');
      (itemsWithDuplicatePosition as any[]).forEach((dup: any) => {
        console.log(`  ${dup.subCategoryId || dup.mainCategoryId} - position ${dup.position}: ${dup.count}個`);
      });
      console.log();
    }

    // 3. 孤立データ
    const [orphanedItems, orphanedRefs] = await Promise.all([
      prisma.rankingItem.findMany({
        where: {
          AND: [
            { subCategoryId: null },
            { mainCategoryId: null }
          ]
        },
        select: { id: true, title: true, createdAt: true }
      }),
      prisma.mainCategoryItemReference.findMany({
        where: {
          OR: [
            { mainCategory: null },
            { rankingItem: null }
          ]
        },
        include: {
          mainCategory: { select: { id: true, name: true } },
          rankingItem: { select: { id: true, title: true } }
        }
      })
    ]);

    console.log('🗑️ 孤立データ:');
    console.log(`  カテゴリ未設定のアイテム: ${orphanedItems.length}`);
    console.log(`  壊れた参照: ${orphanedRefs.length}\n`);

    if (orphanedItems.length > 0) {
      console.log('孤立アイテム詳細:');
      orphanedItems.forEach(item => {
        console.log(`  ${item.id}: "${item.title}" (${item.createdAt})`);
      });
      console.log();
    }

    if (orphanedRefs.length > 0) {
      console.log('壊れた参照詳細:');
      orphanedRefs.forEach(ref => {
        console.log(`  ${ref.id}: カテゴリ=${ref.mainCategory?.name || 'なし'} アイテム=${ref.rankingItem?.title || 'なし'}`);
      });
      console.log();
    }

    // 4. 削除マークされたアイテム
    const deletedItems = await prisma.rankingItem.findMany({
      where: {
        title: '[削除されたアイテム]'
      },
      include: {
        mainCategoryReferences: {
          include: {
            mainCategory: { select: { name: true } }
          }
        }
      }
    });

    console.log('🗑️ 削除マークされたアイテム:');
    console.log(`  削除マーク付きアイテム: ${deletedItems.length}\n`);

    if (deletedItems.length > 0) {
      console.log('削除マークアイテム詳細:');
      deletedItems.forEach(item => {
        const refs = item.mainCategoryReferences.map(ref => ref.mainCategory.name).join(', ');
        console.log(`  ${item.id}: 参照先=[${refs}] position=${item.position}`);
      });
      console.log();
    }

    // 5. 異常なposition値
    const abnormalPositions = await prisma.rankingItem.findMany({
      where: {
        OR: [
          { position: { lt: 1 } },
          { position: { gt: 11 } }
        ]
      },
      select: { id: true, title: true, position: true, subCategoryId: true, mainCategoryId: true }
    });

    console.log('⚠️ 異常なposition値:');
    console.log(`  範囲外position (1-11以外): ${abnormalPositions.length}\n`);

    if (abnormalPositions.length > 0) {
      console.log('範囲外position詳細:');
      abnormalPositions.forEach(item => {
        console.log(`  ${item.id}: "${item.title}" position=${item.position}`);
      });
      console.log();
    }

    // 6. 参照の問題
    const refProblems = await prisma.$queryRaw`
      SELECT r.id, r.position, r."mainCategoryId", 
             ri.id as item_id, ri.title, ri."subCategoryId"
      FROM "MainCategoryItemReference" r
      LEFT JOIN "RankingItem" ri ON r."rankingItemId" = ri.id
      WHERE ri.id IS NULL OR ri."subCategoryId" IS NULL
    `;

    console.log('🔗 参照の問題:');
    console.log(`  問題のある参照: ${(refProblems as any[]).length}\n`);

    if ((refProblems as any[]).length > 0) {
      console.log('問題のある参照詳細:');
      (refProblems as any[]).forEach((ref: any) => {
        console.log(`  参照ID=${ref.id}: アイテム=${ref.item_id || 'なし'} title="${ref.title || 'なし'}"`);
      });
      console.log();
    }

    console.log('=== 分析完了 ===');

  } catch (error) {
    console.error('分析エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
if (require.main === module) {
  analyzeData()
    .then(() => {
      console.log('分析完了');
      process.exit(0);
    })
    .catch((error) => {
      console.error('分析失敗:', error);
      process.exit(1);
    });
}

export { analyzeData };