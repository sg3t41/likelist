"use client";

import Image from "next/image";
import { PageUser } from "@/types";

interface UserProfileSectionProps {
  pageUser: PageUser;
  categoryCount?: number;
  subCategoryCount?: number;
  itemCount?: number;
}

export default function UserProfileSection({ 
  pageUser, 
  categoryCount = 0,
  subCategoryCount = 0,
  itemCount = 0 
}: UserProfileSectionProps) {
  const userName = pageUser.name || `@${pageUser.username}` || "ユーザー";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-6">
        {/* プロフィール画像 */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 relative">
            {pageUser.image ? (
              <Image
                src={pageUser.image}
                alt={`${userName}のプロフィール画像`}
                width={80}
                height={80}
                className="rounded-full object-cover ring-4 ring-purple-100 shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl ring-4 ring-purple-100 shadow-lg">
                {(pageUser.username || pageUser.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* ユーザー情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {pageUser.name || `@${pageUser.username}`}
            </h1>
            {pageUser.name && pageUser.username && (
              <span className="text-lg text-gray-500 truncate">
                @{pageUser.username}
              </span>
            )}
          </div>
          

          {/* 統計情報 - インライン表示 */}
          <div className="flex items-center gap-3 sm:gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full border border-purple-200 w-40">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">📁</span>
              </div>
              <span className="text-sm font-semibold text-purple-700 whitespace-nowrap">{categoryCount} カテゴリ</span>
            </div>
            
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full border border-blue-200 w-40">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">🏷️</span>
              </div>
              <span className="text-sm font-semibold text-blue-700 whitespace-nowrap">{subCategoryCount} サブカテゴリ</span>
            </div>
            
            <div className="flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-full border border-pink-200 w-40">
              <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">📋</span>
              </div>
              <span className="text-sm font-semibold text-pink-700 whitespace-nowrap">{itemCount} アイテム</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}