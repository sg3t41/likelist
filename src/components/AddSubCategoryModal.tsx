"use client";

import { useState } from "react";

interface AddSubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainCategoryId: string;
  mainCategoryName: string;
  onAdd: (subCategoryName: string) => Promise<void>;
}

export default function AddSubCategoryModal({ 
  isOpen, 
  onClose, 
  mainCategoryId, 
  mainCategoryName,
  onAdd 
}: AddSubCategoryModalProps) {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subCategoryName.trim()) {
      alert("小カテゴリ名を入力してください");
      return;
    }

    setIsLoading(true);
    try {
      await onAdd(subCategoryName);
      setSubCategoryName("");
      onClose();
    } catch (error) {
      console.error("Error adding subcategory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🏷️</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
              サブフォルダを作成
            </h2>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
              <span>⭐</span>
              <span className="font-medium">{mainCategoryName}</span>
              <span>に追加</span>
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-4 text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <span>🏷️</span>
              サブカテゴリ名
            </label>
            <div className="relative">
              <input
                type="text"
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                className="w-full px-4 py-4 border-2 border-orange-200 dark:border-orange-700 rounded-xl bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white focus:border-orange-400 dark:focus:border-orange-500 focus:ring-0 transition-all backdrop-blur-sm text-lg"
                placeholder="例: 野球、サッカー、バスケットボール..."
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-orange-400 text-2xl">✨</span>
              </div>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
              <span>💡</span>
              <span>このカテゴリで好きなものを整理できます</span>
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-orange-200 dark:border-orange-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl font-semibold transition-all transform hover:scale-105"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  作成中...
                </>
              ) : (
                <>
                  <span>🏷️</span>
                  作成
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}