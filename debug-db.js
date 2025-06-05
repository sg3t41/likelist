const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkImageData() {
  try {
    console.log('=== Checking RankingItems with URLs ===');
    const itemsWithUrls = await prisma.rankingItem.findMany({
      where: {
        OR: [
          { url: { not: null } },
          { images: { some: {} } }
        ]
      },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      },
      take: 5
    });
    
    console.log('Items with URLs or images:', JSON.stringify(itemsWithUrls, null, 2));
    
    console.log('\n=== Checking RankingItemImages table ===');
    const allImages = await prisma.rankingItemImage.findMany({
      take: 10
    });
    
    console.log('All images:', JSON.stringify(allImages, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageData();