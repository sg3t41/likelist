"use client";

import { useState, useEffect } from "react";

interface EditRankingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    description?: string;
    url?: string;
    images?: { id: string; url: string; order: number }[];
    position?: number;
  } | null;
  totalItems: number;
  onSave: (id: string, title: string, description: string, url: string, position?: number) => Promise<void>;
}

export default function EditRankingItemModal({ 
  isOpen, 
  onClose, 
  item,
  totalItems,
  onSave 
}: EditRankingItemModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingImages, setIsSavingImages] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setUrl(item.url || "");
      setImageUrls(item.images?.map(img => img.url) || []);
    }
  }, [item]);

  const addImageUrl = () => {
    if (imageUrls.length >= 1) {
      alert("画像は1枚まで追加できます");
      return;
    }
    setImageUrls([...imageUrls, ""]);
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item || !title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    setIsLoading(true);
    try {
      // 画像を更新（空の配列でも送信して既存画像をクリア）
      setIsSavingImages(true);
      const validUrls = imageUrls.filter(url => url.trim());
      const response = await fetch(`/api/rankings/${item.id}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: validUrls }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update images:', errorData);
        throw new Error('画像の更新に失敗しました');
      }
      
      // タイトル、説明、URLを保存（これにより再取得がトリガーされる）
      await onSave(item.id, title, description, url);
      
      onClose();
    } catch (error) {
      console.error("Error editing ranking item:", error);
    } finally {
      setIsLoading(false);
      setIsSavingImages(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          項目を編集
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              説明
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="説明を入力（任意）"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              リンクを追加
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://example.com"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                画像リンク
              </label>
              <button
                type="button"
                onClick={addImageUrl}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={imageUrls.length >= 1}
              >
                画像を追加 {imageUrls.length > 0 && `(${imageUrls.length}/1)`}
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {imageUrls.map((imageUrl, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="画像URL"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              {imageUrls.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  画像がありません
                </p>
              )}
            </div>
          </div>

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
              disabled={isLoading || isSavingImages}
            >
              {isLoading || isSavingImages ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}