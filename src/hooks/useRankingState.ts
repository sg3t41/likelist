/**
 * ランキング状態管理のカスタムフック
 */

import { useState, useCallback, useEffect } from 'react';
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
  const [lastUpdateTimestamps, setLastUpdateTimestamps] = useState<Record<string, number>>({});

  // 楽観的更新でsetRankingsを呼ぶ場合のラッパー関数
  const setRankingsWithTimestamp = useCallback((updater: React.SetStateAction<Rankings>, dataKey?: string) => {
    if (dataKey) {
      console.log('[useRankingState] Optimistic update for key:', dataKey);
      setLastUpdateTimestamps(prev => ({
        ...prev,
        [dataKey]: Date.now()
      }));
    }
    setRankings(updater);
  }, []);

  // 最近更新されたかどうかをチェックする関数（5秒以内の更新はスキップ）
  const isRecentlyUpdated = useCallback((dataKey: string): boolean => {
    const lastUpdate = lastUpdateTimestamps[dataKey];
    if (!lastUpdate) return false;
    return Date.now() - lastUpdate < 5000; // 5秒以内
  }, [lastUpdateTimestamps]);

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

  // URLパラメータ変更時の状態同期（競合を防ぐため、まとめて更新）
  useEffect(() => {
    if (initialSelection) {
      const updates: Record<string, any> = {};
      
      if (initialSelection.mainCategory && selectedMainCategory !== initialSelection.mainCategory) {
        updates.mainCategory = initialSelection.mainCategory;
      }
      if (initialSelection.subCategory && selectedCategory !== initialSelection.subCategory) {
        updates.subCategory = initialSelection.subCategory;
      }
      if (initialSelection.mainCategoryId && selectedMainCategoryId !== initialSelection.mainCategoryId) {
        updates.mainCategoryId = initialSelection.mainCategoryId;
      }
      if (initialSelection.subCategoryId && selectedSubCategoryId !== initialSelection.subCategoryId) {
        updates.subCategoryId = initialSelection.subCategoryId;
      }
      if (initialSelection.view === 'main' && !isMainCategoryView) {
        updates.isMainCategoryView = true;
      } else if (initialSelection.view !== 'main' && isMainCategoryView) {
        updates.isMainCategoryView = false;
      }
      
      // 一度に全ての更新を実行（競合を防ぐ）
      if (Object.keys(updates).length > 0) {
        console.log('[useRankingState] Batch updating states:', updates);
        if (updates.mainCategory) setSelectedMainCategory(updates.mainCategory);
        if (updates.subCategory) setSelectedCategory(updates.subCategory);
        if (updates.mainCategoryId) setSelectedMainCategoryId(updates.mainCategoryId);
        if (updates.subCategoryId) setSelectedSubCategoryId(updates.subCategoryId);
        if (updates.isMainCategoryView !== undefined) setIsMainCategoryView(updates.isMainCategoryView);
      }
    }
  }, [initialSelection?.mainCategory, initialSelection?.subCategory, initialSelection?.mainCategoryId, initialSelection?.subCategoryId, initialSelection?.view]);

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
    setRankingsWithTimestamp,
    isRecentlyUpdated,
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