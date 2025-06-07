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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">✏️</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            好きなものを編集
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <span>🏷️</span>
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white focus:border-purple-400 dark:focus:border-purple-500 focus:ring-0 transition-all backdrop-blur-sm"
              placeholder="好きなものの名前を入力..."
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <span>📝</span>
              説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white focus:border-purple-400 dark:focus:border-purple-500 focus:ring-0 transition-all backdrop-blur-sm resize-none"
              placeholder="どんなところが好きか教えてください... ✨"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <span>🔗</span>
              リンク
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white focus:border-purple-400 dark:focus:border-purple-500 focus:ring-0 transition-all backdrop-blur-sm"
              placeholder="https://example.com"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <span>🖼️</span>
                画像
              </label>
              <button
                type="button"
                onClick={addImageUrl}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                disabled={imageUrls.length >= 1}
              >
                <span>✨</span>
                画像を追加 {imageUrls.length > 0 && `(${imageUrls.length}/1)`}
              </button>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {imageUrls.map((imageUrl, index) => (
                <div key={index} className="flex gap-3 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="画像URLを入力..."
                    className="flex-1 px-3 py-2 border-2 border-purple-200 dark:border-purple-600 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white text-sm focus:border-purple-400 dark:focus:border-purple-500 focus:ring-0 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all transform hover:scale-110"
                    title="画像を削除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              {imageUrls.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-purple-200 dark:border-purple-700 rounded-xl bg-purple-50/30 dark:bg-purple-900/10">
                  <span className="text-4xl mb-2 block">🖼️</span>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    まだ画像がありません
                  </p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                    上のボタンから追加してください
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-purple-200 dark:border-purple-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl font-semibold transition-all transform hover:scale-105"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              disabled={isLoading || isSavingImages}
            >
              {isLoading || isSavingImages ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <span>✨</span>
                  保存
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}