"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  pageUser?: {
    name: string | null;
    username: string | null;
    id: string;
  };
  allCategories?: any[];
}

export default function Breadcrumb({ items, className = "", pageUser, allCategories }: BreadcrumbProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 初期状態を設定してレイアウトシフトを防ぐ
  const getInitialItems = () => {
    const initialItems: BreadcrumbItem[] = [
      { name: "ホーム", href: "/" }
    ];
    
    // パス情報から初期項目を構築
    if (pathname.startsWith("/u/") && pageUser) {
      initialItems.push({
        name: pageUser.name || pageUser.username || "ユーザー",
        href: `/u/${pageUser.id}`
      });
    } else if (pathname === "/contact") {
      initialItems.push({ name: "お問い合わせ", current: true });
    } else if (pathname === "/privacy") {
      initialItems.push({ name: "プライバシーポリシー", current: true });
    } else if (pathname === "/terms") {
      initialItems.push({ name: "利用規約", current: true });
    } else if (pathname === "/disclaimer") {
      initialItems.push({ name: "免責事項", current: true });
    }
    
    return initialItems;
  };
  
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>(
    items || getInitialItems()
  );

  useEffect(() => {
    if (items) {
      setBreadcrumbItems(items);
      return;
    }

    // 自動生成
    const newItems: BreadcrumbItem[] = [
      { name: "ホーム", href: "/" }
    ];

    // ユーザーページの場合
    if (pathname.startsWith("/u/") && pageUser) {
      newItems.push({
        name: pageUser.name || pageUser.username || "ユーザー",
        href: `/u/${pageUser.id}`
      });

      // クエリパラメータに基づいてカテゴリ情報を追加
      const mainCategory = searchParams.get("mainCategory");
      const subCategory = searchParams.get("subCategory");
      const view = searchParams.get("view");

      if (mainCategory) {
        const mainCategoryId = searchParams.get("mainCategoryId");
        
        if (view === "main") {
          // 大カテゴリビューの場合
          newItems.push({
            name: mainCategory,
            current: true
          });
        } else if (subCategory && subCategory !== "全般") {
          // 小カテゴリビューの場合 - 大カテゴリをクリック可能に
          const subCategoryId = searchParams.get("subCategoryId");
          
          // allCategoriesから該当する大カテゴリIDを探す
          let targetMainCategoryId = mainCategoryId;
          if (!targetMainCategoryId && allCategories && subCategoryId) {
            for (const cat of allCategories) {
              const foundSubCat = cat.subCategories?.find((sub: any) => sub.id === subCategoryId);
              if (foundSubCat) {
                targetMainCategoryId = cat.id;
                break;
              }
            }
          }
          
          const mainCategoryHref = targetMainCategoryId 
            ? `/u/${pageUser.id}?mainCategoryId=${targetMainCategoryId}&mainCategory=${encodeURIComponent(mainCategory)}&view=main`
            : `/u/${pageUser.id}?mainCategory=${encodeURIComponent(mainCategory)}&view=main`;
          
          newItems.push({
            name: mainCategory,
            href: mainCategoryHref
          });
          newItems.push({
            name: subCategory,
            current: true
          });
        } else if (subCategory === "全般") {
          // 全般の場合は大カテゴリとして扱う
          newItems.push({
            name: mainCategory,
            current: true
          });
        }
      }
    }
    
    // 固定ページの場合
    else if (pathname === "/privacy") {
      newItems.push({ name: "プライバシーポリシー", current: true });
    }
    else if (pathname === "/terms") {
      newItems.push({ name: "利用規約", current: true });
    }
    else if (pathname === "/contact") {
      newItems.push({ name: "お問い合わせ", current: true });
    }
    else if (pathname === "/disclaimer") {
      newItems.push({ name: "免責事項", current: true });
    }

    setBreadcrumbItems(newItems);
  }, [pathname, searchParams, items, pageUser, allCategories]);

  // ホームページまたはアイテムが1つ以下の場合は表示しない
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={`${className}`} aria-label="パンくずリスト">
      <div>
        <div className="bg-white rounded-lg shadow">
          <ol role="list" className="flex items-center space-x-2 py-4 px-8 sm:px-10 text-sm">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="flex-shrink-0 w-4 h-4 text-gray-400 mx-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {item.href && !item.current ? (
                <Link
                  href={item.href}
                  prefetch={false}
                  className="text-purple-600 hover:text-purple-800 transition-colors hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href!);
                    router.refresh(); // 強制的にサーバーコンポーネントを再レンダリング
                  }}
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className={
                    item.current
                      ? "font-medium text-gray-900 truncate max-w-xs"
                      : "text-gray-500 truncate max-w-xs"
                  }
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
        </div>
      </div>
    </nav>
  );
}