"use client";

import { useState } from "react";

interface RankingToolbarProps {
  title: string;
  isOwner: boolean;
  isEditingTitle: boolean;
  editingTitle: string;
  copiedRanking: boolean;
  sharedRanking: boolean;
  onTitleEdit: (newTitle: string) => void;
  onCopyUrl: () => void;
  onShare: () => void;
  onDeleteCategory: () => void;
  onStartEditTitle: () => void;
  onCancelEditTitle: () => void;
  setEditingTitle: (title: string) => void;
}

export default function RankingToolbar({
  title,
  isOwner,
  isEditingTitle,
  editingTitle,
  copiedRanking,
  sharedRanking,
  onTitleEdit,
  onCopyUrl,
  onShare,
  onDeleteCategory,
  onStartEditTitle,
  onCancelEditTitle,
  setEditingTitle,
}: RankingToolbarProps) {
  const [isRankingMenuOpen, setIsRankingMenuOpen] = useState(false);

  const handleSaveTitle = () => {
    onTitleEdit(editingTitle);
    onCancelEditTitle();
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      {isEditingTitle ? (
        <div className="flex items-center space-x-2 flex-1">
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveTitle();
              }
              if (e.key === 'Escape') onCancelEditTitle();
            }}
            className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 outline-none text-gray-900"
            autoFocus
          />
          <button
            onClick={handleSaveTitle}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={onCancelEditTitle}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>
      )}
      
      <div className="relative ranking-menu-container">
        <button
          onClick={() => setIsRankingMenuOpen(!isRankingMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
          title="メニュー"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
        
        {isRankingMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
            <div className="py-1">
              <button
                onClick={() => {
                  onCopyUrl();
                  setIsRankingMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                {copiedRanking ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    コピーしました！
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    URLをコピー
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  onShare();
                  setIsRankingMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Xで共有
              </button>
              {isOwner && (
                <>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      onStartEditTitle();
                      setIsRankingMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    タイトルを編集
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      onDeleteCategory();
                      setIsRankingMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    カテゴリを削除
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}