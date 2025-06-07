import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sukilist.jp';

  try {
    // ユーザー一覧を取得（最低1つ以上のカテゴリを持つユーザーのみ）
    const users = await prisma.user.findMany({
      where: {
        mainCategories: {
          some: {
            id: {
              not: undefined,
            },
          },
        },
      },
      select: {
        id: true,
        updatedAt: true,
        mainCategories: {
          select: {
            id: true,
            name: true,
            updatedAt: true,
            subCategories: {
              select: {
                id: true,
                name: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    const sitemap: MetadataRoute.Sitemap = [
      // ホームページ
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];

    // ユーザーページを追加
    for (const user of users) {
      // ユーザートップページ
      sitemap.push({
        url: `${baseUrl}/u/${user.id}`,
        lastModified: user.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      // 大カテゴリページを追加
      for (const mainCategory of user.mainCategories) {
        sitemap.push({
          url: `${baseUrl}/u/${user.id}?mainCategoryId=${mainCategory.id}&mainCategory=${encodeURIComponent(mainCategory.name)}&view=main`,
          lastModified: mainCategory.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.7,
        });

        // 小カテゴリページを追加
        for (const subCategory of mainCategory.subCategories) {
          sitemap.push({
            url: `${baseUrl}/u/${user.id}?mainCategory=${encodeURIComponent(mainCategory.name)}&subCategory=${encodeURIComponent(subCategory.name)}&subCategoryId=${subCategory.id}`,
            lastModified: subCategory.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      }
    }

    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // エラーの場合は最低限のサイトマップを返す
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}