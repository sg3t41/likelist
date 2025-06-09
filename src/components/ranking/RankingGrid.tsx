"use client";

import { useState } from "react";
import Image from "next/image";
import { RankingItem, RankingMap, PageUser } from "@/types";

interface RankingGridProps {
  rankings: RankingMap;
  pageUser: PageUser;
  isOwner: boolean;
  isMainCategoryView: boolean;
  highlightPosition: number | null;
  allCategories: any[];
  onCategorySelect: (mainCat: string, subCat: string, subCatId: string) => void;
  onTogglePin: (item: RankingItem) => void;
  onShareItem: (item: RankingItem, position: number) => void;
  onEditItem: (item: RankingItem) => void;
  onDeleteItem: (itemId: string, isReference?: boolean, referenceId?: string) => void;
  onMoveItem: (item: RankingItem, position: number) => void;
  onAddItem: (position: number) => void;
  onImageClick: (url: string, alt: string) => void;
}

export default function RankingGrid({
  rankings,
  pageUser,
  isOwner,
  isMainCategoryView,
  highlightPosition,
  allCategories,
  onCategorySelect,
  onTogglePin,
  onShareItem,
  onEditItem,
  onDeleteItem,
  onMoveItem,
  onAddItem,
  onImageClick,
}: RankingGridProps) {
  const [openItemMenuId, setOpenItemMenuId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-purple-100">
      {Array.from({ length: 11 }, (_, index) => {
        const position = index + 1;
        const item = rankings[position];
        
        return (
          <div
            id={`ranking-item-${position}`}
            key={item?.id || `empty-${index}`}
            className={`px-3 sm:px-6 py-4 sm:py-5 flex items-center justify-between transition-all duration-300 group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 relative ${
              highlightPosition === position
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 ring-2 ring-inset ring-purple-400 shadow-lg'
                : item ? 'hover:shadow-md' : ''
            }`}
          >
            {/* ピン留めバッジ */}
            {item?.isPinned && (
              <div className="absolute top-2 right-2 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-sm">📌</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
              {/* ランキング番号 */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md transform transition-all duration-300 ${
                index === 0 
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 scale-110' 
                  : index === 1 
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400 scale-105' 
                  : index === 2 
                  ? 'bg-gradient-to-br from-orange-400 to-amber-600 scale-105' 
                  : 'bg-gradient-to-br from-blue-100 to-blue-200'
              }`}>
                {index < 3 ? (
                  <span className="text-2xl" role="img" aria-label={`${position}位`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className={`font-bold ${
                    index < 3 ? 'text-white text-lg' : 'text-blue-700 text-sm'
                  }`}>
                    {position}
                  </span>
                )}
              </div>
              
              {/* コンテンツ部分 */}
              <div className={`flex-1 min-w-0 ${item?.isPinned ? 'pr-10' : ''}`}>
                {item?.url && !item?.isDeleted ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-base sm:text-lg font-semibold block hover:underline transition-all break-words ${
                      item?.isDeleted 
                        ? "text-gray-400 italic" 
                        : "text-purple-700 hover:text-purple-800 group-hover:scale-[1.02]"
                    }`}
                  >
                    <span className="break-words">{item.title}</span>
                  </a>
                ) : (
                  <h3 className={`text-base sm:text-lg font-semibold break-words ${
                    item?.isDeleted 
                      ? "text-gray-400 italic" 
                      : item 
                      ? "text-gray-900 group-hover:text-purple-700 transition-colors"
                      : "text-gray-400"
                  }`}>
                    {item ? (
                      <span className="break-words">{item.title}</span>
                    ) : (
                      <span className="italic">空きスロット</span>
                    )}
                  </h3>
                )}
                
                {item?.description && !item?.isDeleted && (
                  <p className="text-sm text-gray-600 truncate mt-1 group-hover:text-gray-700 transition-colors overflow-hidden">
                    {item.description}
                  </p>
                )}
                
                {item?.sourceSubCategoryName && item?.sourceSubCategoryId && !item?.isDeleted && (
                  <button
                    onClick={() => {
                      const targetSubCategory = allCategories.flatMap(cat => 
                        cat.subCategories.map((sub: any) => ({ ...sub, mainCategoryName: cat.name }))
                      ).find((sub: any) => sub.id === item.sourceSubCategoryId);
                      
                      if (targetSubCategory) {
                        onCategorySelect(
                          targetSubCategory.mainCategoryName, 
                          targetSubCategory.name, 
                          targetSubCategory.id
                        );
                      }
                    }}
                    className="text-xs text-blue-600 mt-1 hover:text-blue-700 hover:underline"
                  >
                    {item.sourceSubCategoryName} {position}位
                  </button>
                )}
                
                {item?.images && item.images.length > 0 && !item?.isDeleted && (
                  <div className="mt-3">
                    {console.log(`RankingGrid - Item ${position} images:`, item.images)}
                    <div 
                      className="relative overflow-hidden rounded-xl border-2 border-purple-200 w-32 h-32 cursor-pointer hover:border-purple-400 transition-all transform hover:scale-105 shadow-md hover:shadow-lg group/image"
                      onClick={() => onImageClick(item.images![0].url, `${item.title} - 画像`)}
                    >
                      <Image
                        src={item.images[0].url}
                        alt={`${item.title} - 画像`}
                        fill
                        className="object-cover group-hover/image:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 128px, 128px"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-2 right-2 text-white opacity-0 group-hover/image:opacity-100 transition-opacity">
                        <span className="text-xs bg-black/50 rounded px-1">🔍</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {item ? (
              <div className="relative item-menu-container ml-2">
                <button
                  onClick={() => {
                    const menuId = `item-${item.id}`;
                    setOpenItemMenuId(openItemMenuId === menuId ? null : menuId);
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  title="メニュー"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                
                {openItemMenuId === `item-${item.id}` && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1">
                      {isOwner && (
                        <>
                          {!item.isDeleted && (
                            <>
                              <button
                                onClick={() => {
                                  onMoveItem(item, position);
                                  setOpenItemMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                                順位を変更
                              </button>
                              <button
                                onClick={() => {
                                  onEditItem(item);
                                  setOpenItemMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                編集
                              </button>
                              <button
                                onClick={() => {
                                  onTogglePin(item);
                                  setOpenItemMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill={item.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                {item.isPinned ? "ピン留めを解除" : "ピン留め"}
                              </button>
                            </>
                          )}
                        </>
                      )}
                      <button
                        onClick={() => {
                          onShareItem(item, position);
                          setOpenItemMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Xで共有
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => {
                            onDeleteItem(
                              item.id.toString(),
                              item.isReference || false,
                              item.referenceId
                            );
                            setOpenItemMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : isOwner ? (
              <button
                onClick={() => onAddItem(position)}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-110 ml-2 opacity-60 group-hover:opacity-100"
                title={`${position}位に好きなものを追加 ✨`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}