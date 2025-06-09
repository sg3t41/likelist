/**
 * ピン留め機能のカスタムフック
 */

import { useCallback } from 'react';
import { RankingItem, Rankings } from '@/types';
import { RankingService } from '@/services/rankingService';

interface UseRankingPinProps {
  rankings: Rankings;
  setRankings: React.Dispatch<React.SetStateAction<Rankings>>;
  isMainCategoryView: boolean;
  selectedMainCategoryId: string;
  selectedCategory: string;
}

export function useRankingPin({
  rankings,
  setRankings,
  isMainCategoryView,
  selectedMainCategoryId,
  selectedCategory,
}: UseRankingPinProps) {
  const handleTogglePin = useCallback(async (item: RankingItem) => {
    const newPinState = !item.isPinned;
    
    // 即座にローカル状態を更新
    setRankings(prev => {
      const currentKey = isMainCategoryView ? `main_${selectedMainCategoryId}` : selectedCategory;
      const currentRankings = prev[currentKey] || {};
      
      // アイテムの位置を見つける（配列に変換して安全に検索）
      const rankingsArray = Object.entries(currentRankings)
        .map(([pos, item]) => ({ position: parseInt(pos), item }))
        .sort((a, b) => a.position - b.position);
      
      const foundIndex = rankingsArray.findIndex(({ item: rankingItem }) => rankingItem.id === item.id);
      
      if (foundIndex !== -1) {
        const itemPosition = rankingsArray[foundIndex].position;
        const updatedRankings = {
          ...currentRankings,
          [itemPosition]: {
            ...currentRankings[itemPosition],
            isPinned: newPinState
          }
        };
        
        return {
          ...prev,
          [currentKey]: updatedRankings
        };
      }
      
      return prev;
    });

    // APIコール
    try {
      await RankingService.togglePin(item.id, newPinState);
      
      // 成功した場合、SummaryViewに変更を通知（詳細情報を含む）
      window.dispatchEvent(new CustomEvent('pinStatusChanged', {
        detail: { itemId: item.id, isPinned: newPinState }
      }));
    } catch (error) {
      console.error("Error toggling pin:", error);
      
      // エラーの場合は状態を元に戻す
      setRankings(prev => {
        const currentKey = isMainCategoryView ? `main_${selectedMainCategoryId}` : selectedCategory;
        const currentRankings = prev[currentKey] || {};
        
        // アイテムの位置を見つける（配列に変換して安全に検索）
        const rankingsArray = Object.entries(currentRankings)
          .map(([pos, item]) => ({ position: parseInt(pos), item }))
          .sort((a, b) => a.position - b.position);
        
        const foundIndex = rankingsArray.findIndex(({ item: rankingItem }) => rankingItem.id === item.id);
        
        if (foundIndex !== -1) {
          const itemPosition = rankingsArray[foundIndex].position;
          const revertedRankings = {
            ...currentRankings,
            [itemPosition]: {
              ...currentRankings[itemPosition],
              isPinned: item.isPinned // 元の状態に戻す
            }
          };
          
          return {
            ...prev,
            [currentKey]: revertedRankings
          };
        }
        
        return prev;
      });
    }
  }, [rankings, setRankings, isMainCategoryView, selectedMainCategoryId, selectedCategory]);

  return {
    handleTogglePin,
  };
}