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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          カテゴリを追加
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              大カテゴリ名
            </label>
            <input
              type="text"
              value={mainCategory}
              onChange={(e) => setMainCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="例: スポーツ"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              小カテゴリ（任意）
            </label>
            {subCategories.map((subCat, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={subCat}
                  onChange={(e) => handleSubCategoryChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="例: 野球"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSubCategory(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                >
                  削除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSubCategory}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              + 小カテゴリを追加
            </button>
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