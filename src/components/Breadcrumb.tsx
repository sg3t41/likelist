"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);

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
          
          newItems.push({
            name: mainCategory,
            href: targetMainCategoryId 
              ? `/u/${pageUser.id}?mainCategoryId=${targetMainCategoryId}&mainCategory=${encodeURIComponent(mainCategory)}&view=main`
              : `/u/${pageUser.id}?mainCategory=${encodeURIComponent(mainCategory)}&view=main`
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <ol role="list" className="flex items-center space-x-2 py-3 text-sm px-4 sm:px-6 lg:px-8">
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
                  className="text-purple-600 hover:text-purple-800 transition-colors hover:underline"
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