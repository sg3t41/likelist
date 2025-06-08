"use client";

import { memo } from "react";
import ProgressiveImage from "./ProgressiveImage";

interface RankingItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  images?: Array<{ url: string; alt?: string }>;
  position?: number;
  isPinned?: boolean;
  isReference?: boolean;
  sourceSubCategoryName?: string;
  sourceSubCategoryId?: string;
}

interface RankingListProps {
  items: RankingItem[];
  isOwner: boolean;
  onItemClick?: (item: RankingItem) => void;
  onEditItem?: (item: RankingItem) => void;
  onDeleteItem?: (item: RankingItem) => void;
  onTogglePin?: (item: RankingItem) => void;
  highlightPosition?: number;
}

// メモ化されたランキングリストコンポーネント
const RankingList = memo(function RankingList({
  items,
  isOwner,
  onItemClick,
  onEditItem,
  onDeleteItem,
  onTogglePin,
  highlightPosition
}: RankingListProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: 11 }, (_, index) => {
        const position = index + 1;
        const item = items.find(item => (item.position || 999) === position);
        
        return (
          <div
            key={position}
            className={`px-3 sm:px-6 py-4 sm:py-5 flex items-center justify-between transition-all duration-300 group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 relative ${
              highlightPosition === position
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 ring-2 ring-inset ring-purple-400 shadow-lg'
                : item ? 'hover:shadow-md' : ''
            }`}
          >
            {/* ピン留めバッジ */}
            {item?.isPinned && (
              <div className="absolute top-2 right-2 bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                <span className="text-sm">📌</span>
              </div>
            )}

            {/* 順位 */}
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg ${
                position <= 3 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                  : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }`}>
                {position}
              </div>
            </div>

            {/* コンテンツエリア */}
            <div className="flex-1 mx-4 min-w-0">
              {item ? (
                <div className="flex items-start space-x-4">
                  {/* 画像 */}
                  {item.images && item.images.length > 0 && (
                    <div className="flex-shrink-0">
                      <ProgressiveImage
                        src={item.images[0].url}
                        alt={item.images[0].alt || item.title}
                        width={80}
                        height={80}
                        className="rounded-lg cursor-pointer"
                        onClick={() => onItemClick?.(item)}
                      />
                    </div>
                  )}

                  {/* テキスト情報 */}
                  <div className="flex-1 min-w-0">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-base sm:text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors block ${
                          item.title.length > 30 ? 'text-sm sm:text-base' : ''
                        }`}
                      >
                        {item.isPinned && (
                          <span className="text-gray-600" title="ピン留め中">📌</span>
                        )}
                        <span className="break-words">{item.title}</span>
                      </a>
                    ) : (
                      <div className="text-base sm:text-lg font-medium text-gray-900">
                        {item.isPinned && (
                          <span className="text-gray-600" title="ピン留め中">📌</span>
                        )}
                        <span className="break-words">{item.title}</span>
                      </div>
                    )}
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 break-words line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* 参照元情報 */}
                    {item.isReference && item.sourceSubCategoryName && (
                      <div className="flex items-center mt-2 text-xs text-purple-600 bg-purple-50 rounded-full px-2 py-1 w-fit">
                        <span className="mr-1">🔗</span>
                        {item.sourceSubCategoryName}より
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm">項目を追加</p>
                </div>
              )}
            </div>

            {/* アクションボタン */}
            {item && isOwner && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onTogglePin?.(item)}
                  className={`p-2 rounded-md transition-colors ${
                    item.isPinned 
                      ? 'text-amber-600 hover:bg-amber-50' 
                      : 'text-gray-400 hover:bg-gray-50 hover:text-amber-600'
                  }`}
                  title={item.isPinned ? "ピン留めを解除" : "ピン留めする"}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,4V6H10V4H14M16,2H8A2,2 0 0,0 6,4V6H5A1,1 0 0,0 4,7V10A1,1 0 0,0 5,11H6V19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V11H19A1,1 0 0,0 20,10V7A1,1 0 0,0 19,6H18V4A2,2 0 0,0 16,2Z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => onEditItem?.(item)}
                  className="p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                  title="編集"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => onDeleteItem?.(item)}
                  className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                  title="削除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default RankingList;