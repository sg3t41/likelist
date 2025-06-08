"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useScrollHeader } from "@/hooks/useScrollHeader";

interface FloatingMenuButtonProps {
  allCategories?: any[];
  pageUser?: any;
  isOwner?: boolean;
  onCategorySelect?: (mainCat: any, subCat: any, subCatId: string) => void;
  onMainCategorySelect?: (mainCat: any) => void;
  onAddCategory?: () => void;
  onAddSubCategory?: (mainCat: any) => void;
  expandedCategories?: Set<string>;
  setExpandedCategories?: (categories: Set<string>) => void;
}

export default function FloatingMenuButton({ 
  allCategories = [],
  pageUser,
  isOwner = false,
  onCategorySelect,
  onMainCategorySelect,
  onAddCategory,
  onAddSubCategory,
  expandedCategories = new Set(),
  setExpandedCategories
}: FloatingMenuButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isVisible = useScrollHeader();

  return (
    <>
      {/* フローティングハンバーガーボタン */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className={`fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'
        }`}
        aria-label="メニューを開く"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* フルスクリーンメニューオーバーレイ */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed top-0 left-0 w-80 h-full bg-white/95 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 overflow-y-auto">
            {/* ヘッダー部分 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg text-purple-400 hover:text-purple-600 hover:bg-purple-100 transition-all"
                  title="閉じる"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📁</span>
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  フォルダ
                </h2>
              </div>
              {isOwner && (
                <button
                  onClick={() => {
                    onAddCategory?.();
                    setIsMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-1.5 text-sm font-medium"
                  title="新しいフォルダを作成"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  追加
                </button>
              )}
            </div>

            {/* カテゴリリスト */}
            <div className="flex-1 overflow-y-auto pb-20">
              {allCategories.map((category) => (
                <div key={category.id} className="border-b border-purple-100/50">
                  <div className="flex items-center">
                    {/* メインカテゴリクリック領域 - カテゴリページに飛ぶ */}
                    <button
                      onClick={() => {
                        onMainCategorySelect?.(category);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 flex-1 min-w-0 p-4 hover:bg-purple-50/50 transition-all group text-left rounded-l-lg border-r border-gray-200"
                      title={`${category.name}のページを表示`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-white text-sm">📂</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors block">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          クリックでページを表示
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {category.subCategories?.length || 0}
                      </span>
                    </button>
                    
                    {/* 右側のボタンエリア */}
                    <div className="flex items-center px-2">
                      {/* 展開/折りたたみボタン - オーナーの場合は常に表示 */}
                      {(category.subCategories?.length > 0 || isOwner) && (
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedCategories);
                            if (newExpanded.has(category.id)) {
                              newExpanded.delete(category.id);
                            } else {
                              newExpanded.add(category.id);
                            }
                            setExpandedCategories?.(newExpanded);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-md transition-all"
                          title={expandedCategories.has(category.id) ? "サブフォルダを隠す" : "サブフォルダを表示"}
                        >
                          <svg
                            className={`w-4 h-4 text-blue-500 transition-transform duration-200 ${
                              expandedCategories.has(category.id) ? "rotate-90" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {expandedCategories.has(category.id) && (
                    <div className="bg-gray-50/30">
                      {category.subCategories?.map((subCat: any) => (
                        <div key={subCat.id} className="ml-4">
                          <button
                            onClick={() => {
                              onCategorySelect?.(category.name, subCat.name, subCat.id);
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50/50 transition-all group/sub"
                          >
                            <span className="text-sm">🏷️</span>
                            <span className="text-sm font-medium truncate group-hover/sub:text-purple-700 transition-colors">
                              {subCat.name}
                            </span>
                          </button>
                        </div>
                      ))}
                      
                      {/* サブカテゴリ追加ボタン - オーナーの場合は常に表示 */}
                      {isOwner && (
                        <div className="ml-4 p-2">
                          <button
                            onClick={() => {
                              onAddSubCategory?.(category);
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50/50 transition-all group/add border-2 border-dashed border-blue-200 rounded-lg"
                            title={`${category.name}にサブカテゴリを追加`}
                          >
                            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-blue-600 group-hover/add:text-blue-700 transition-colors">
                              {category.name}にサブカテゴリを追加
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 下部のユーザーメニュー */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 space-y-3">
              {/* ユーザー情報とアクション */}
              {session?.user ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {(session.user as any).image && (
                      <Image
                        src={(session.user as any).image}
                        alt={(session.user as any).name || ''}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {(session.user as any).name || (session.user as any).username}
                      </p>
                      <p className="text-sm text-gray-600">ログイン中</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      router.push(`/u/${(session.user as any).userId}`);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    マイリスト
                  </button>

                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ログアウト
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn("twitter")}
                  className="flex items-center justify-center gap-3 w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Xでログイン
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}