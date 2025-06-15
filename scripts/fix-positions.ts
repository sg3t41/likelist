/**
 * 既存データのposition修正スクリプト
 * Vercel/Neonデータベース用
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPositions() {
  console.log('Starting position fix...');

  try {
    // 小カテゴリのアイテム修正
    const subCategoryItems = await prisma.rankingItem.findMany({
      where: {
        subCategoryId: { not: null },
        position: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${subCategoryItems.length} sub-category items without position`);

    // 小カテゴリごとにグループ化
    const subCategoryGroups = subCategoryItems.reduce((acc, item) => {
      const key = item.subCategoryId!;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, typeof subCategoryItems>);

    // 各小カテゴリの既存のposition取得とアップデート
    for (const [subCategoryId, items] of Object.entries(subCategoryGroups)) {
      const existingPositions = await prisma.rankingItem.findMany({
        where: {
          subCategoryId,
          position: { not: null },
        },
        select: { position: true },
      });

      const usedPositions = existingPositions.map(item => item.position!);
      let nextPosition = 1;

      for (const item of items) {
        // 空いているpositionを見つける
        while (usedPositions.includes(nextPosition)) {
          nextPosition++;
        }

        await prisma.rankingItem.update({
          where: { id: item.id },
          data: { position: nextPosition },
        });

        console.log(`Updated sub-category item ${item.id} to position ${nextPosition}`);
        usedPositions.push(nextPosition);
        nextPosition++;
      }
    }

    // 大カテゴリのアイテム修正
    const mainCategoryItems = await prisma.rankingItem.findMany({
      where: {
        mainCategoryId: { not: null },
        position: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${mainCategoryItems.length} main-category items without position`);

    // 大カテゴリごとにグループ化
    const mainCategoryGroups = mainCategoryItems.reduce((acc, item) => {
      const key = item.mainCategoryId!;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, typeof mainCategoryItems>);

    // 各大カテゴリの既存のposition取得とアップデート
    for (const [mainCategoryId, items] of Object.entries(mainCategoryGroups)) {
      // 直接アイテムと参照アイテムの両方のpositionを考慮
      const [existingDirectItems, existingReferences] = await Promise.all([
        prisma.rankingItem.findMany({
          where: {
            mainCategoryId,
            position: { not: null },
          },
          select: { position: true },
        }),
        prisma.mainCategoryItemReference.findMany({
          where: {
            mainCategoryId,
            position: { not: null },
          },
          select: { position: true },
        }),
      ]);

      const usedPositions = [
        ...existingDirectItems.map(item => item.position!),
        ...existingReferences.map(ref => ref.position!),
      ];

      let nextPosition = 1;

      for (const item of items) {
        // 空いているpositionを見つける
        while (usedPositions.includes(nextPosition)) {
          nextPosition++;
        }

        await prisma.rankingItem.update({
          where: { id: item.id },
          data: { position: nextPosition },
        });

        console.log(`Updated main-category item ${item.id} to position ${nextPosition}`);
        usedPositions.push(nextPosition);
        nextPosition++;
      }
    }

    // 参照アイテムの修正
    const references = await prisma.mainCategoryItemReference.findMany({
      where: {
        position: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`Found ${references.length} references without position`);

    // 大カテゴリごとにグループ化
    const referenceGroups = references.reduce((acc, ref) => {
      const key = ref.mainCategoryId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(ref);
      return acc;
    }, {} as Record<string, typeof references>);

    for (const [mainCategoryId, refs] of Object.entries(referenceGroups)) {
      // 直接アイテムと参照アイテムの両方のpositionを考慮
      const [existingDirectItems, existingReferences] = await Promise.all([
        prisma.rankingItem.findMany({
          where: {
            mainCategoryId,
            position: { not: null },
          },
          select: { position: true },
        }),
        prisma.mainCategoryItemReference.findMany({
          where: {
            mainCategoryId,
            position: { not: null },
          },
          select: { position: true },
        }),
      ]);

      const usedPositions = [
        ...existingDirectItems.map(item => item.position!),
        ...existingReferences.map(ref => ref.position!),
      ];

      let nextPosition = 1;

      for (const ref of refs) {
        // 空いているpositionを見つける
        while (usedPositions.includes(nextPosition)) {
          nextPosition++;
        }

        await prisma.mainCategoryItemReference.update({
          where: { id: ref.id },
          data: { position: nextPosition },
        });

        console.log(`Updated reference ${ref.id} to position ${nextPosition}`);
        usedPositions.push(nextPosition);
        nextPosition++;
      }
    }

    console.log('Position fix completed successfully!');

  } catch (error) {
    console.error('Error fixing positions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
if (require.main === module) {
  fixPositions()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { fixPositions };