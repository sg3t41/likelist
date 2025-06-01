"use client";

import { useState, useEffect } from "react";

interface AddRankingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  isMainCategoryView?: boolean;
  subCategories?: Array<{ id: string; name: string }>;
  onAdd: (title: string, description: string, subCategoryId?: string, existingItemId?: string) => Promise<void>;
}

export default function AddRankingItemModal({ 
  isOpen, 
  onClose, 
  categoryName,
  isMainCategoryView,
  subCategories,
  onAdd 
}: AddRankingItemModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [addMode, setAddMode] = useState<"direct" | "subcategory" | "existing">("direct");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [existingItems, setExistingItems] = useState<Array<{id: string, title: string, description?: string}>>([]);
  const [selectedExistingItemId, setSelectedExistingItemId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // 小カテゴリが選択された時に既存項目を取得
  useEffect(() => {
    const fetchExistingItems = async () => {
      if (selectedSubCategoryId && addMode === "existing") {
        setIsLoadingItems(true);
        try {
          const response = await fetch(`/api/rankings?subCategoryId=${selectedSubCategoryId}`);
          if (response.ok) {
            const items = await response.json();
            setExistingItems(items.map((item: any) => ({
              id: item.id,
              title: item.title,
              description: item.description
            })));
          }
        } catch (error) {
          console.error("Error fetching existing items:", error);
        } finally {
          setIsLoadingItems(false);
        }
      }
    };

    fetchExistingItems();
  }, [selectedSubCategoryId, addMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (addMode === "existing") {
      if (!selectedExistingItemId) {
        alert("既存の項目を選択してください");
        return;
      }
    } else {
      if (!title.trim()) {
        alert("タイトルを入力してください");
        return;
      }
    }

    if (isMainCategoryView && addMode === "existing" && !selectedSubCategoryId) {
      alert("小カテゴリを選択してください");
      return;
    }

    setIsLoading(true);
    try {
      if (addMode === "existing") {
        await onAdd("", "", selectedSubCategoryId, selectedExistingItemId);
      } else {
        // 新規項目追加（大カテゴリ直接 or 小カテゴリ）
        await onAdd(title, description);
      }
      
      setTitle("");
      setDescription("");
      setSelectedSubCategoryId("");
      setSelectedExistingItemId("");
      setExistingItems([]);
      setAddMode("direct");
      onClose();
    } catch (error) {
      console.error("Error adding ranking item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          「{categoryName}」に項目を追加
        </h2>
        <form onSubmit={handleSubmit}>
          {isMainCategoryView && subCategories && subCategories.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                追加先を選択
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="direct"
                    checked={addMode === "direct"}
                    onChange={(e) => setAddMode(e.target.value as "direct" | "subcategory" | "existing")}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {categoryName}に直接追加（新規項目）
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="existing"
                    checked={addMode === "existing"}
                    onChange={(e) => setAddMode(e.target.value as "direct" | "subcategory" | "existing")}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    小カテゴリから既存項目を選択
                  </span>
                </label>
              </div>
            </div>
          )}

          {isMainCategoryView && addMode === "existing" && subCategories && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                小カテゴリを選択
              </label>
              <select
                value={selectedSubCategoryId}
                onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">小カテゴリを選択してください</option>
                {subCategories.map((subCat) => (
                  <option key={subCat.id} value={subCat.id}>
                    {subCat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {addMode === "existing" && selectedSubCategoryId && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                既存項目を選択
              </label>
              {isLoadingItems ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  項目を読み込み中...
                </div>
              ) : existingItems.length > 0 ? (
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md">
                  {existingItems.map((item) => (
                    <label key={item.id} className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      <input
                        type="radio"
                        value={item.id}
                        checked={selectedExistingItemId === item.id}
                        onChange={(e) => setSelectedExistingItemId(e.target.value)}
                        className="mr-3 mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  この小カテゴリには項目がありません
                </div>
              )}
            </div>
          )}

          {addMode !== "existing" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  タイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="例: 東京スカイツリー"
                  autoFocus
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  説明（任意）
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="例: 世界一高い電波塔"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "追加中..." : "追加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}