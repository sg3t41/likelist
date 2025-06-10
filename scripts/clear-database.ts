/**
 * Vercelデータベースの全テーブルデータを削除するスクリプト
 * 外部キー制約を考慮して適切な順序で削除
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️  データベースの削除を開始...');

    // 外部キー制約を考慮した削除順序
    console.log('📊 MainCategoryItemReference を削除中...');
    const deletedReferences = await prisma.mainCategoryItemReference.deleteMany({});
    console.log(`✅ ${deletedReferences.count} 件の MainCategoryItemReference を削除`);

    console.log('🖼️  RankingItemImage を削除中...');
    const deletedImages = await prisma.rankingItemImage.deleteMany({});
    console.log(`✅ ${deletedImages.count} 件の RankingItemImage を削除`);

    console.log('📝 RankingItem を削除中...');
    const deletedItems = await prisma.rankingItem.deleteMany({});
    console.log(`✅ ${deletedItems.count} 件の RankingItem を削除`);

    console.log('📂 SubCategory を削除中...');
    const deletedSubCategories = await prisma.subCategory.deleteMany({});
    console.log(`✅ ${deletedSubCategories.count} 件の SubCategory を削除`);

    console.log('📁 MainCategory を削除中...');
    const deletedMainCategories = await prisma.mainCategory.deleteMany({});
    console.log(`✅ ${deletedMainCategories.count} 件の MainCategory を削除`);

    console.log('👤 User を削除中...');
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ ${deletedUsers.count} 件の User を削除`);

    console.log('🎉 データベースの削除が完了しました！');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトの実行確認
const args = process.argv.slice(2);
if (args.includes('--confirm')) {
  clearDatabase()
    .then(() => {
      console.log('✨ 削除処理が正常に完了しました');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 削除処理に失敗しました:', error);
      process.exit(1);
    });
} else {
  console.log('⚠️  このスクリプトは全てのデータを削除します。');
  console.log('🔥 実行するには --confirm フラグを追加してください:');
  console.log('   npx ts-node scripts/clear-database.ts --confirm');
  console.log('');
  console.log('💡 または特定のテーブルのみ削除する場合は:');
  console.log('   npx ts-node scripts/clear-specific-table.ts --confirm --table=User');
}