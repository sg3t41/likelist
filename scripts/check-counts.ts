import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCounts() {
  try {
    const userCount = await prisma.user.count();
    const itemCount = await prisma.rankingItem.count();
    const categoryCount = await prisma.mainCategory.count();
    
    console.log('📊 現在のデータ数:');
    console.log(`👤 User: ${userCount}`);
    console.log(`📝 RankingItem: ${itemCount}`);
    console.log(`📁 MainCategory: ${categoryCount}`);
    console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();