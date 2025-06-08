"use client";

import { useState } from "react";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (mainCategory: string, subCategories: string[]) => Promise<void>;
}

export default function AddCategoryModal({ isOpen, onClose, onAdd }: AddCategoryModalProps) {
  const [mainCategory, setMainCategory] = useState("");
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSubCategory = () => {
    setSubCategories([...subCategories, ""]);
  };

  const handleRemoveSubCategory = (index: number) => {
    setSubCategories(subCategories.filter((_, i) => i !== index));
  };

  const handleSubCategoryChange = (index: number, value: string) => {
    const newSubCategories = [...subCategories];
    newSubCategories[index] = value;
    setSubCategories(newSubCategories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSubCategories = subCategories.filter(cat => cat.trim() !== "");
    
    if (!mainCategory.trim()) {
      alert("大カテゴリ名を入力してください");
      return;
    }

    setIsLoading(true);
    try {
      await onAdd(mainCategory, validSubCategories);
      setMainCategory("");
      setSubCategories([]);
      onClose();
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">📁</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            新しいカテゴリを作成
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-green-700 flex items-center gap-2">
              <span>⭐</span>
              メインカテゴリ
            </label>
            <input
              type="text"
              value={mainCategory}
              onChange={(e) => setMainCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-xl bg-white/80 text-gray-900 focus:border-green-400 focus:ring-0 transition-all backdrop-blur-sm"
              placeholder="例: スポーツ、映画、書籍..."
              autoFocus
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-blue-700 flex items-center gap-2">
                <span>🏷️</span>
                サブカテゴリ
              </label>
              <button
                type="button"
                onClick={handleAddSubCategory}
                className="px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md flex items-center gap-1"
              >
                <span>✨</span>
                追加
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {subCategories.map((subCat, index) => (
                <div key={index} className="flex gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                  <input
                    type="text"
                    value={subCat}
                    onChange={(e) => handleSubCategoryChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-blue-200 rounded-lg bg-white/80 text-gray-900 focus:border-blue-400 focus:ring-0 transition-all"
                    placeholder="例: 野球、サッカー..."
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubCategory(index)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all transform hover:scale-110"
                    title="サブカテゴリを削除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              {subCategories.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30">
                  <span className="text-4xl mb-2 block">🏷️</span>
                  <p className="text-sm text-blue-600">
                    サブカテゴリを追加してみてください
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    より細かく分類できます
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-green-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-green-600 hover:bg-green-100 rounded-xl font-semibold transition-all transform hover:scale-105"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
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
                  <span>📁</span>
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