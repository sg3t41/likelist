import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test data...');

  // テストユーザーを作成
  const testUser = await prisma.user.create({
    data: {
      username: 'testuser',
      name: 'テストユーザー',
      email: 'test@example.com',
    }
  });

  console.log('Created test user:', testUser);

  // 大カテゴリ1: 音楽
  const musicCategory = await prisma.mainCategory.create({
    data: {
      name: '音楽',
      userId: testUser.id,
      subCategories: {
        create: [
          { name: 'JPOP', userId: testUser.id },
          { name: 'HIPHOP', userId: testUser.id },
          { name: 'ROCK', userId: testUser.id },
        ]
      }
    },
    include: {
      subCategories: true
    }
  });

  console.log('Created music category with subcategories');

  // 大カテゴリ2: 映画
  const movieCategory = await prisma.mainCategory.create({
    data: {
      name: '映画',
      userId: testUser.id,
      subCategories: {
        create: [
          { name: 'アクション', userId: testUser.id },
          { name: 'コメディ', userId: testUser.id },
          { name: 'SF', userId: testUser.id },
        ]
      }
    },
    include: {
      subCategories: true
    }
  });

  console.log('Created movie category with subcategories');

  // 大カテゴリ3: 食べ物
  const foodCategory = await prisma.mainCategory.create({
    data: {
      name: '食べ物',
      userId: testUser.id,
      subCategories: {
        create: [
          { name: '和食', userId: testUser.id },
          { name: '洋食', userId: testUser.id },
          { name: 'スイーツ', userId: testUser.id },
        ]
      }
    },
    include: {
      subCategories: true
    }
  });

  console.log('Created food category with subcategories');

  // JPOPカテゴリにアイテムを追加
  const jpopSubCategory = musicCategory.subCategories.find(sub => sub.name === 'JPOP');
  if (jpopSubCategory) {
    await prisma.rankingItem.createMany({
      data: [
        { title: 'YOASOBI - 夜に駆ける', description: '疾走感のある名曲', position: 1, subCategoryId: jpopSubCategory.id, userId: testUser.id },
        { title: '米津玄師 - Lemon', description: '心に響くメロディ', position: 2, subCategoryId: jpopSubCategory.id, userId: testUser.id },
        { title: 'Official髭男dism - Pretender', description: '切ないラブソング', position: 3, subCategoryId: jpopSubCategory.id, userId: testUser.id },
        { title: 'あいみょん - マリーゴールド', description: '温かい歌声', position: 5, subCategoryId: jpopSubCategory.id, userId: testUser.id },
        { title: 'King Gnu - 白日', description: '独特な世界観', position: 7, subCategoryId: jpopSubCategory.id, userId: testUser.id },
      ]
    });
    console.log('Added JPOP items');
  }

  // HIPHOPカテゴリにアイテムを追加
  const hiphopSubCategory = musicCategory.subCategories.find(sub => sub.name === 'HIPHOP');
  if (hiphopSubCategory) {
    await prisma.rankingItem.createMany({
      data: [
        { title: 'ZORN - 家族', description: 'リアルなリリック', position: 2, subCategoryId: hiphopSubCategory.id, userId: testUser.id },
        { title: '舐達麻 - BUDS MONTAGE', description: 'ダークな雰囲気', position: 4, subCategoryId: hiphopSubCategory.id, userId: testUser.id },
        { title: 'BAD HOP - Life Style', description: 'ストリートの美学', position: 6, subCategoryId: hiphopSubCategory.id, userId: testUser.id },
        { title: 'JP THE WAVY - Cho Wavy De Gomenne', description: 'キャッチーなフック', position: 9, subCategoryId: hiphopSubCategory.id, userId: testUser.id },
      ]
    });
    console.log('Added HIPHOP items');
  }

  // 音楽大カテゴリに直接アイテムを追加
  await prisma.rankingItem.createMany({
    data: [
      { title: 'ビートルズ - Let It Be', description: '永遠の名曲', position: 3, mainCategoryId: musicCategory.id, userId: testUser.id },
      { title: 'クイーン - Bohemian Rhapsody', description: '壮大なロックオペラ', position: 6, mainCategoryId: musicCategory.id, userId: testUser.id },
      { title: 'マイケル・ジャクソン - Thriller', description: 'キング・オブ・ポップ', position: 10, mainCategoryId: musicCategory.id, userId: testUser.id },
    ]
  });
  console.log('Added direct music category items');

  // JPOPのアイテムを音楽大カテゴリに参照として追加
  const jpopItems = await prisma.rankingItem.findMany({
    where: { subCategoryId: jpopSubCategory?.id }
  });

  if (jpopItems.length > 0) {
    await prisma.mainCategoryItemReference.create({
      data: {
        mainCategoryId: musicCategory.id,
        rankingItemId: jpopItems[0].id, // YOASOBI
        position: 4
      }
    });
    await prisma.mainCategoryItemReference.create({
      data: {
        mainCategoryId: musicCategory.id,
        rankingItemId: jpopItems[1].id, // 米津玄師
        position: 5
      }
    });
    console.log('Added JPOP references to music category');
  }

  // HIPHOPのアイテムを音楽大カテゴリに参照として追加
  const hiphopItems = await prisma.rankingItem.findMany({
    where: { subCategoryId: hiphopSubCategory?.id }
  });

  if (hiphopItems.length > 0) {
    await prisma.mainCategoryItemReference.create({
      data: {
        mainCategoryId: musicCategory.id,
        rankingItemId: hiphopItems[2].id, // BAD HOP
        position: 9
      }
    });
    console.log('Added HIPHOP reference to music category');
  }

  console.log('Test data created successfully!');
  console.log(`Test user ID: ${testUser.id}`);
  console.log(`Access the app at: http://localhost:3000/u/${testUser.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });