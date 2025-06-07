import Script from "next/script";

interface RankingItem {
  id: string | number;
  title: string;
  description?: string;
  url?: string;
  position: number;
}

interface User {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

interface StructuredDataProps {
  user: User;
  categoryName?: string;
  items?: RankingItem[];
  pageUrl: string;
  isMainCategory?: boolean;
}

export default function StructuredData({
  user,
  categoryName,
  items = [],
  pageUrl,
  isMainCategory = false,
}: StructuredDataProps) {
  const userName = user.name || `@${user.username}` || "ユーザー";
  const baseUrl = "https://sukilist.jp";

  // Person schema for user
  const personSchema = {
    "@type": "Person",
    "@id": `${baseUrl}/u/${user.id}#person`,
    name: userName,
    url: `${baseUrl}/u/${user.id}`,
    image: user.image,
    identifier: user.username ? `@${user.username}` : user.id,
    sameAs: user.username ? [`https://twitter.com/${user.username}`] : undefined,
  };

  // WebPage schema
  const webPageSchema = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: categoryName 
      ? `${userName}さんの【${categoryName}】ランキング | すきなものリスト`
      : `${userName}さんの好きなものリスト`,
    description: categoryName
      ? `${userName}さんが厳選した【${categoryName}】の好きなものランキング。トップ11まで整理されたお気に入りアイテムをチェック！`
      : `${userName}さんの好きなものを整理したランキングリスト。カテゴリ別に11位まで整理されたお気に入りアイテム一覧。`,
    inLanguage: "ja-JP",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${baseUrl}#website`,
      name: "すきなものリスト",
      url: baseUrl,
    },
    author: {
      "@id": `${baseUrl}/u/${user.id}#person`,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}#organization`,
      name: "すきなものリスト",
      url: baseUrl,
    },
  };

  // ItemList schema for rankings
  const itemListSchema = items.length > 0 ? {
    "@type": "ItemList",
    "@id": `${pageUrl}#itemlist`,
    name: categoryName 
      ? `${userName}さんの【${categoryName}】ランキング`
      : `${userName}さんの好きなものリスト`,
    description: categoryName
      ? `${userName}さんが選んだ【${categoryName}】の好きなものトップ${items.length}`
      : `${userName}さんの好きなものランキング`,
    numberOfItems: items.length,
    itemListElement: items
      .sort((a, b) => (a.position || 999) - (b.position || 999))
      .slice(0, 11) // 最大11位まで
      .map((item, index) => ({
        "@type": "ListItem",
        position: item.position || index + 1,
        name: item.title,
        description: item.description,
        url: item.url,
        item: {
          "@type": "Thing",
          "@id": `${pageUrl}#item-${item.id}`,
          name: item.title,
          description: item.description,
          url: item.url,
        },
      })),
    author: {
      "@id": `${baseUrl}/u/${user.id}#person`,
    },
  } : null;

  // Collection schema for category view
  const collectionSchema = categoryName ? {
    "@type": "Collection",
    "@id": `${pageUrl}#collection`,
    name: `${userName}さんの【${categoryName}】コレクション`,
    description: `${userName}さんが厳選した【${categoryName}】の好きなものコレクション`,
    creator: {
      "@id": `${baseUrl}/u/${user.id}#person`,
    },
    hasPart: itemListSchema ? [{
      "@id": `${pageUrl}#itemlist`,
    }] : undefined,
  } : null;

  // BreadcrumbList schema
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "すきなものリスト",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${userName}さんのリスト`,
        item: `${baseUrl}/u/${user.id}`,
      },
      ...(categoryName ? [{
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: pageUrl,
      }] : []),
    ],
  };

  // Combine all schemas
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      personSchema,
      webPageSchema,
      breadcrumbSchema,
      ...(itemListSchema ? [itemListSchema] : []),
      ...(collectionSchema ? [collectionSchema] : []),
    ].filter(Boolean),
  };

  return (
    <Script
      id={`structured-data-${user.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 0),
      }}
    />
  );
}