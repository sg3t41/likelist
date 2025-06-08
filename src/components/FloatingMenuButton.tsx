"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import CategoryList from "@/components/CategoryList";

interface FloatingMenuButtonProps {
  allCategories?: any[];
  pageUser?: any;
  isOwner?: boolean;
  onCategorySelect?: (mainCat: any, subCat: any, subCatId: string) => void;
  onMainCategorySelect?: (mainCat: any) => void;
  onAddCategory?: () => void;
  onAddSubCategory?: (mainCat: any) => void;
  onClearSelection?: () => void;
  expandedCategories?: Set<string>;
  setExpandedCategories?: (categories: Set<string>) => void;
  selectedCategory?: string;
  isMainCategoryView?: boolean;
  selectedMainCategoryId?: string;
  selectedSubCategoryId?: string;
}

export default function FloatingMenuButton({ 
  allCategories = [],
  pageUser,
  isOwner = false,
  onCategorySelect,
  onMainCategorySelect,
  onAddCategory,
  onAddSubCategory,
  onClearSelection,
  expandedCategories = new Set(),
  setExpandedCategories,
  selectedCategory,
  isMainCategoryView = false,
  selectedMainCategoryId,
  selectedSubCategoryId
}: FloatingMenuButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
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
                  カテゴリ
                </h2>
              </div>
              {isOwner && (
                <button
                  onClick={() => {
                    onAddCategory?.();
                    setIsMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-1.5 text-sm font-medium"
                  title="新しいカテゴリを作成"
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
              {/* ユーザー情報ヘッダー */}
              {pageUser && (
                <div className="border-b border-purple-100/50 bg-gradient-to-r from-purple-50 to-pink-50">
                  <button
                    onClick={() => {
                      onClearSelection?.();
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-4 text-left hover:bg-purple-50/50 transition-colors group"
                    title={`${pageUser.name || pageUser.username}さんのトップページ`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* ユーザーアイコン */}
                      <div className="relative">
                        {pageUser.image ? (
                          <img
                            src={pageUser.image}
                            alt={pageUser.name || pageUser.username || 'ユーザー'}
                            className="w-10 h-10 rounded-full object-cover shadow-sm"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${pageUser.image ? 'hidden' : ''}`}>
                          {(pageUser.name || pageUser.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        {/* オンラインインジケーター風の装飾 */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">📋</span>
                        </div>
                      </div>
                      
                      {/* ユーザー情報テキスト */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {pageUser.name || pageUser.username || 'ユーザー'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{pageUser.username || pageUser.name || 'user'}
                        </p>
                        <p className="text-sm text-purple-600 font-medium">
                          {isOwner ? 'あなたのリスト' : 'さんのリスト'}
                        </p>
                      </div>
                      
                      {/* リンクアイコン */}
                      <div className="w-6 h-6 text-purple-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              )}
              
              <CategoryList
                allCategories={allCategories}
                expandedCategories={expandedCategories}
                setExpandedCategories={setExpandedCategories}
                onCategorySelect={onCategorySelect}
                onMainCategorySelect={onMainCategorySelect}
                onAddCategory={onAddCategory}
                onAddSubCategory={onAddSubCategory}
                isOwner={isOwner}
                onMenuClose={() => setIsMenuOpen(false)}
                selectedMainCategoryId={selectedMainCategoryId}
                selectedSubCategoryId={selectedSubCategoryId}
                isMainCategoryView={isMainCategoryView}
              />
            </div>

            {/* 下部のユーザーメニュー */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 space-y-3">
              {/* ユーザー情報とアクション */}
              {session?.user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg w-full hover:bg-gray-100 transition-colors"
                    >
                      {(session.user as any).image && (
                        <Image
                          src={(session.user as any).image}
                          alt={(session.user as any).name || ''}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      )}
                      <div className="text-left flex-1">
                        <p className="font-medium text-gray-900">
                          {(session.user as any).name || (session.user as any).username}
                        </p>
                        <p className="text-sm text-gray-600">ログイン中</p>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* ユーザーメニューポップアップ */}
                    {showUserMenu && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => {
                            router.push(`/u/${(session.user as any).userId}`);
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full p-3 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          マイリスト
                        </button>
                        <button
                          onClick={() => signOut()}
                          className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          ログアウト
                        </button>
                      </div>
                    )}
                  </div>
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