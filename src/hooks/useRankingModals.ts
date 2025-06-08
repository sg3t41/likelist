/**
 * ランキング関連モーダル管理のカスタムフック
 */

import { useState, useCallback } from 'react';
import { RankingItem } from '@/types';

export function useRankingModals() {
  // モーダル開閉状態
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSubCategoryModalOpen, setIsAddSubCategoryModalOpen] = useState(false);
  const [isAddRankingItemModalOpen, setIsAddRankingItemModalOpen] = useState(false);
  const [isEditRankingItemModalOpen, setIsEditRankingItemModalOpen] = useState(false);
  
  // モーダル関連の選択状態
  const [selectedMainCategoryForAdd, setSelectedMainCategoryForAdd] = useState<any>(null);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<RankingItem | null>(null);
  const [targetPosition, setTargetPosition] = useState<number>(0);

  // モーダル開閉関数
  const openAddCategoryModal = useCallback(() => {
    setIsAddCategoryModalOpen(true);
  }, []);

  const closeAddCategoryModal = useCallback(() => {
    setIsAddCategoryModalOpen(false);
  }, []);

  const openAddSubCategoryModal = useCallback((mainCategory: any) => {
    setSelectedMainCategoryForAdd(mainCategory);
    setIsAddSubCategoryModalOpen(true);
  }, []);

  const closeAddSubCategoryModal = useCallback(() => {
    setIsAddSubCategoryModalOpen(false);
    setSelectedMainCategoryForAdd(null);
  }, []);

  const openAddRankingItemModal = useCallback((position: number) => {
    setTargetPosition(position);
    setIsAddRankingItemModalOpen(true);
  }, []);

  const closeAddRankingItemModal = useCallback(() => {
    setIsAddRankingItemModalOpen(false);
    setTargetPosition(0);
  }, []);

  const openEditRankingItemModal = useCallback((item: RankingItem) => {
    setSelectedItemForEdit(item);
    setIsEditRankingItemModalOpen(true);
  }, []);

  const closeEditRankingItemModal = useCallback(() => {
    setIsEditRankingItemModalOpen(false);
    setSelectedItemForEdit(null);
  }, []);

  return {
    // 状態
    isAddCategoryModalOpen,
    isAddSubCategoryModalOpen,
    isAddRankingItemModalOpen,
    isEditRankingItemModalOpen,
    selectedMainCategoryForAdd,
    selectedItemForEdit,
    targetPosition,
    
    // アクション
    openAddCategoryModal,
    closeAddCategoryModal,
    openAddSubCategoryModal,
    closeAddSubCategoryModal,
    openAddRankingItemModal,
    closeAddRankingItemModal,
    openEditRankingItemModal,
    closeEditRankingItemModal,
  };
}