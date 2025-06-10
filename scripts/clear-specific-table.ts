/**
 * 特定のテーブルのデータを削除するスクリプト
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type TableName = 'User' | 'MainCategory' | 'SubCategory' | 'RankingItem' | 'RankingItemImage' | 'MainCategoryItemReference';

async function clearSpecificTable(tableName: TableName) {
  try {
    console.log(`🗑️  ${tableName} テーブルの削除を開始...`);

    let deletedCount = 0;

    switch (tableName) {
      case 'User':
        const deletedUsers = await prisma.user.deleteMany({});
        deletedCount = deletedUsers.count;
        break;
      case 'MainCategory':
        const deletedMainCategories = await prisma.mainCategory.deleteMany({});
        deletedCount = deletedMainCategories.count;
        break;
      case 'SubCategory':
        const deletedSubCategories = await prisma.subCategory.deleteMany({});
        deletedCount = deletedSubCategories.count;
        break;
      case 'RankingItem':
        const deletedItems = await prisma.rankingItem.deleteMany({});
        deletedCount = deletedItems.count;
        break;
      case 'RankingItemImage':
        const deletedImages = await prisma.rankingItemImage.deleteMany({});
        deletedCount = deletedImages.count;
        break;
      case 'MainCategoryItemReference':
        const deletedReferences = await prisma.mainCategoryItemReference.deleteMany({});
        deletedCount = deletedReferences.count;
        break;
      default:
        throw new Error(`未対応のテーブル名: ${tableName}`);
    }

    console.log(`✅ ${deletedCount} 件の ${tableName} を削除しました`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// コマンドライン引数の解析
const args = process.argv.slice(2);
const confirmFlag = args.includes('--confirm');
const tableArg = args.find(arg => arg.startsWith('--table='));
const tableName = tableArg?.split('=')[1] as TableName;

if (confirmFlag && tableName) {
  const validTables: TableName[] = ['User', 'MainCategory', 'SubCategory', 'RankingItem', 'RankingItemImage', 'MainCategoryItemReference'];
  
  if (validTables.includes(tableName)) {
    clearSpecificTable(tableName)
      .then(() => {
        console.log('✨ 削除処理が正常に完了しました');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 削除処理に失敗しました:', error);
        process.exit(1);
      });
  } else {
    console.error(`❌ 無効なテーブル名: ${tableName}`);
    console.log('📋 有効なテーブル名:', validTables.join(', '));
    process.exit(1);
  }
} else {
  console.log('⚠️  このスクリプトは指定されたテーブルの全データを削除します。');
  console.log('🔥 実行するには --confirm と --table フラグを追加してください:');
  console.log('');
  console.log('📋 使用例:');
  console.log('   npx ts-node scripts/clear-specific-table.ts --confirm --table=User');
  console.log('   npx ts-node scripts/clear-specific-table.ts --confirm --table=RankingItem');
  console.log('');
  console.log('📝 有効なテーブル名:');
  console.log('   - User');
  console.log('   - MainCategory');
  console.log('   - SubCategory');
  console.log('   - RankingItem');
  console.log('   - RankingItemImage');
  console.log('   - MainCategoryItemReference');
}