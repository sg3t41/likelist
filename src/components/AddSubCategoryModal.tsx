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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          「{mainCategoryName}」に小カテゴリを追加
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              小カテゴリ名
            </label>
            <input
              type="text"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="例: 野球"
              autoFocus
            />
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