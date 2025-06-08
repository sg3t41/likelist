/**
 * ランキング状態管理のカスタムフック
 */

import { useState, useCallback } from 'react';
import { Rankings, InitialSelection } from '@/types';

interface UseRankingStateProps {
  initialCategories: any[];
  initialSelection?: InitialSelection;
  serverInitialRankings?: any;
}

export function useRankingState({
  initialCategories,
  initialSelection,
  serverInitialRankings,
}: UseRankingStateProps) {
  // カテゴリ選択状態
  const [selectedCategory, setSelectedCategory] = useState<string>(
    serverInitialRankings?.type === 'sub' ? serverInitialRankings.categoryName : initialSelection?.subCategory || ""
  );
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>(initialSelection?.mainCategory || "");
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string>(initialSelection?.mainCategoryId || "");
  const [isMainCategoryView, setIsMainCategoryView] = useState(initialSelection?.view === 'main');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(initialSelection?.subCategoryId || "");

  // ランキングデータ
  const getInitialRankings = useCallback(() => {
    const rankings: Rankings = {};
    if (serverInitialRankings) {
      const rankingMap: { [position: number]: any } = {};
      serverInitialRankings.items.forEach((item: any) => {
        rankingMap[item.position] = item;
      });
      
      if (serverInitialRankings.type === 'main') {
        rankings[`main_${serverInitialRankings.categoryId}`] = rankingMap;
      } else {
        rankings[serverInitialRankings.categoryName] = rankingMap;
      }
    }
    return rankings;
  }, [serverInitialRankings]);

  const [rankings, setRankings] = useState<Rankings>(getInitialRankings());
  const [allCategories, setAllCategories] = useState<any[]>(initialCategories);

  // UI状態
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState<number | null>(
    initialSelection?.highlight ? parseInt(initialSelection.highlight) : null
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(initialCategories.map(cat => cat.id))
  );

  // タイトル編集
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");

  // 共有状態
  const [copiedRanking, setCopiedRanking] = useState(false);
  const [sharedRanking, setSharedRanking] = useState(false);

  // カテゴリ削除関連
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    type: 'main' | 'sub';
    id: string;
    name: string;
    subCategories?: any[];
  } | null>(null);

  // 画像モーダル
  const [selectedImageModal, setSelectedImageModal] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  // ムーブモーダル
  const [selectedItemForMove, setSelectedItemForMove] = useState<{
    item: any;
    position: number;
  } | null>(null);

  return {
    // カテゴリ選択
    selectedCategory,
    setSelectedCategory,
    selectedMainCategory,
    setSelectedMainCategory,
    selectedMainCategoryId,
    setSelectedMainCategoryId,
    isMainCategoryView,
    setIsMainCategoryView,
    selectedSubCategoryId,
    setSelectedSubCategoryId,

    // データ
    rankings,
    setRankings,
    allCategories,
    setAllCategories,

    // UI状態
    isMenuOpen,
    setIsMenuOpen,
    highlightPosition,
    setHighlightPosition,
    expandedCategories,
    setExpandedCategories,

    // タイトル編集
    isEditingTitle,
    setIsEditingTitle,
    editingTitle,
    setEditingTitle,

    // 共有
    copiedRanking,
    setCopiedRanking,
    sharedRanking,
    setSharedRanking,

    // カテゴリ削除
    showDeleteCategoryModal,
    setShowDeleteCategoryModal,
    categoryToDelete,
    setCategoryToDelete,

    // 画像モーダル
    selectedImageModal,
    setSelectedImageModal,

    // ムーブモーダル
    selectedItemForMove,
    setSelectedItemForMove,
  };
}