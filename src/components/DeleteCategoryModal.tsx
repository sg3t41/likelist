"use client";

import { useState } from "react";
import { Category } from "@/types";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  category: {
    id: string;
    name: string;
    type: 'main' | 'sub';
    subCategories?: any[];
  } | null;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  category,
}: DeleteCategoryModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !category) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {category.type === 'main' ? 'カテゴリ' : 'サブカテゴリ'}の削除
          </h2>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-gray-700 mb-2">
                「<span className="font-semibold text-gray-900">{category.name}</span>」を削除してもよろしいですか？
              </p>
              {category.type === 'main' && (
                <>
                  <p className="text-sm text-red-600 mb-3">
                    ⚠️ このカテゴリに含まれるすべてのサブカテゴリとアイテムも削除されます。
                  </p>
                  {category.subCategories && category.subCategories.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-red-800 mb-2">
                        削除されるサブカテゴリ ({category.subCategories.length}件):
                      </p>
                      <div className="max-h-32 overflow-y-auto">
                        <ul className="space-y-1">
                          {category.subCategories.map((sub: any) => (
                            <li key={sub.id} className="text-sm text-red-700 flex items-center gap-2">
                              <span className="text-red-400">・</span>
                              <span>{sub.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
              {category.type === 'sub' && (
                <p className="text-sm text-orange-600">
                  ⚠️ このサブカテゴリに含まれるすべてのアイテムも削除されます。
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                この操作は取り消せません。
              </p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                削除中...
              </>
            ) : (
              '削除する'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}