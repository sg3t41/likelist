"use client";

import { useState, useEffect } from "react";

interface AddRankingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  isMainCategoryView?: boolean;
  subCategories?: Array<{ id: string; name: string }>;
  onAdd: (
    title: string,
    description: string,
    url?: string,
    subCategoryId?: string,
    existingItemId?: string,
    imageUrl?: string,
  ) => Promise<void>;
}

export default function AddRankingItemModal({
  isOpen,
  onClose,
  categoryName,
  isMainCategoryView,
  subCategories,
  onAdd,
}: AddRankingItemModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [addMode, setAddMode] = useState<"direct" | "subcategory" | "existing">(
    "direct",
  );
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [existingItems, setExistingItems] = useState<
    Array<{ id: string; title: string; description?: string }>
  >([]);
  const [selectedExistingItemId, setSelectedExistingItemId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // 小カテゴリが選択された時に既存項目を取得
  useEffect(() => {
    const fetchExistingItems = async () => {
      if (selectedSubCategoryId && addMode === "existing") {
        setIsLoadingItems(true);
        try {
          const response = await fetch(
            `/api/rankings?subCategoryId=${selectedSubCategoryId}`,
          );
          if (response.ok) {
            const items = await response.json();
            setExistingItems(
              items.map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
              })),
            );
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

    if (
      isMainCategoryView &&
      addMode === "existing" &&
      !selectedSubCategoryId
    ) {
      alert("小カテゴリを選択してください");
      return;
    }

    setIsLoading(true);
    try {
      if (addMode === "existing") {
        await onAdd("", "", "", selectedSubCategoryId, selectedExistingItemId);
      } else {
        // 新規項目追加（大カテゴリ直接 or 小カテゴリ）
        await onAdd(title, description, url, undefined, undefined, imageUrl);
      }

      setTitle("");
      setDescription("");
      setUrl("");
      setImageUrl("");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">✨</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            新しい好きなものを追加
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          {isMainCategoryView && subCategories && subCategories.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                <span>🎨</span>
                追加方法を選択
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 bg-white/70 rounded-lg border-2 border-transparent cursor-pointer transition-all hover:border-blue-300 has-[:checked]:border-blue-500[:checked]:border-blue-400 has-[:checked]:bg-blue-50[:checked]:bg-blue-900/30">
                  <input
                    type="radio"
                    value="direct"
                    checked={addMode === "direct"}
                    onChange={(e) =>
                      setAddMode(
                        e.target.value as "direct" | "subcategory" | "existing",
                      )
                    }
                    className="mr-3 text-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      新規で追加
                    </span>
                    <p className="text-xs text-gray-600">
                      まったく新しいアイテムを作成
                    </p>
                  </div>
                </label>
                <label className="flex items-center p-3 bg-white/70 rounded-lg border-2 border-transparent cursor-pointer transition-all hover:border-purple-300 has-[:checked]:border-purple-500[:checked]:border-purple-400 has-[:checked]:bg-purple-50[:checked]:bg-purple-900/30">
                  <input
                    type="radio"
                    value="existing"
                    checked={addMode === "existing"}
                    onChange={(e) =>
                      setAddMode(
                        e.target.value as "direct" | "subcategory" | "existing",
                      )
                    }
                    className="mr-3 text-purple-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      小カテゴリから選択
                    </span>
                    <p className="text-xs text-gray-600">
                      既存のアイテムを参照
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {isMainCategoryView && addMode === "existing" && subCategories && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                小カテゴリを選択
              </label>
              <select
                value={selectedSubCategoryId}
                onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
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
              <label className="block text-sm font-medium mb-2 text-gray-700">
                既存項目を選択
              </label>
              {isLoadingItems ? (
                <div className="text-center py-4 text-gray-500">
                  項目を読み込み中...
                </div>
              ) : existingItems.length > 0 ? (
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                  {existingItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <input
                        type="radio"
                        value={item.id}
                        checked={selectedExistingItemId === item.id}
                        onChange={(e) =>
                          setSelectedExistingItemId(e.target.value)
                        }
                        className="mr-3 mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  この小カテゴリには項目がありません
                </div>
              )}
            </div>
          )}

          {addMode !== "existing" && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-purple-700 flex items-center gap-2">
                  <span>🏷️</span>
                  タイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl bg-white/80 text-gray-900 focus:border-purple-400 focus:ring-0 transition-all backdrop-blur-sm"
                  placeholder="例: 東京スカイツリー"
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-purple-700 flex items-center gap-2">
                  <span>📝</span>
                  説明
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl bg-white/80 text-gray-900 focus:border-purple-400 focus:ring-0 transition-all backdrop-blur-sm resize-none"
                  placeholder="例: 世界一高い電波塔で、景色が素晴らしい... ✨"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-purple-700 flex items-center gap-2">
                  <span>🔗</span>
                  リンク
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl bg-white/80 text-gray-900 focus:border-purple-400 focus:ring-0 transition-all backdrop-blur-sm"
                  placeholder="https://example.com"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-purple-700 flex items-center gap-2">
                  <span>🖼️</span>
                  画像
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl bg-white/80 text-gray-900 focus:border-purple-400 focus:ring-0 transition-all backdrop-blur-sm"
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrl && (
                  <div className="mt-4 p-3 bg-purple-50/50 rounded-xl border border-purple-200">
                    <p className="text-xs text-purple-600 mb-2 font-medium">プレビュー:</p>
                    <img
                      src={imageUrl}
                      alt="プレビュー"
                      className="w-32 h-32 object-cover rounded-xl border-2 border-purple-200 shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex gap-3 justify-end pt-6 border-t border-purple-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-purple-600 hover:bg-purple-100 rounded-xl font-semibold transition-all transform hover:scale-105"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  追加中...
                </>
              ) : (
                <>
                  <span>✨</span>
                  追加
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
