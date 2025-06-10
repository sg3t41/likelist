/**
 * ピン留め機能のカスタムフック
 */

import { useCallback } from 'react';
import { RankingItem, Rankings } from '@/types';
import { RankingService } from '@/services/rankingService';

interface UseRankingPinProps {
  rankings: Rankings;
  setRankings: React.Dispatch<React.SetStateAction<Rankings>>;
  setRankingsWithTimestamp: (updater: React.SetStateAction<Rankings>, dataKey?: string) => void;
  isMainCategoryView: boolean;
  selectedMainCategoryId: string;
  selectedCategory: string;
}

export function useRankingPin({
  rankings,
  setRankings,
  setRankingsWithTimestamp,
  isMainCategoryView,
  selectedMainCategoryId,
  selectedCategory,
}: UseRankingPinProps) {
  const handleTogglePin = useCallback(async (item: RankingItem) => {
    const newPinState = !item.isPinned;
    const currentKey = isMainCategoryView ? `main_${selectedMainCategoryId}` : selectedCategory;
    
    console.log('[Pin] Toggle pin:', { itemId: item.id, from: item.isPinned, to: newPinState });

    try {
      // 1. APIコールを先に実行（楽観的更新なし）
      const updatedItem = await RankingService.togglePin(item.id, newPinState);
      console.log('[Pin] API success:', { itemId: item.id, isPinned: updatedItem.isPinned });
      
      // 2. APIレスポンスに基づいて状態更新（確実）
      setRankingsWithTimestamp(prev => {
        const currentRankings = prev[currentKey] || {};
        
        // アイテムの位置を見つける
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
              isPinned: updatedItem.isPinned // APIレスポンスの値を使用
            }
          };
          
          console.log('[Pin] State updated:', { itemId: item.id, position: itemPosition, isPinned: updatedItem.isPinned });
          
          return {
            ...prev,
            [currentKey]: updatedRankings
          };
        }
        
        return prev;
      }, currentKey);
      
      // 3. SummaryViewに変更を通知
      window.dispatchEvent(new CustomEvent('pinStatusChanged', {
        detail: { itemId: item.id, isPinned: updatedItem.isPinned }
      }));
      
    } catch (error) {
      console.error("Error toggling pin:", error);
      alert("ピン留めの更新に失敗しました");
    }
  }, [setRankingsWithTimestamp, isMainCategoryView, selectedMainCategoryId, selectedCategory]);

  return {
    handleTogglePin,
  };
}