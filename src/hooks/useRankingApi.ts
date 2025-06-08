/**
 * ランキングAPI呼び出し管理のカスタムフック
 */

import { useCallback } from 'react';
import { RankingItem, Rankings, RankingMap } from '@/types';
import { RankingService, CategoryService } from '@/services';

interface UseRankingApiProps {
  pageUserId: string;
  rankings: Rankings;
  setRankings: React.Dispatch<React.SetStateAction<Rankings>>;
  setAllCategories: React.Dispatch<React.SetStateAction<any[]>>;
}

export function useRankingApi({
  pageUserId,
  rankings,
  setRankings,
  setAllCategories,
}: UseRankingApiProps) {
  
  /**
   * メインカテゴリのランキングを取得
   */
  const fetchMainCategoryRankings = useCallback(async (mainCategoryId: string) => {
    try {
      const items = await RankingService.getRankings({
        mainCategoryId,
        userId: pageUserId,
      });
      
      const rankingMap: RankingMap = {};
      items.forEach((item: any) => {
        const position = item.position || Object.keys(rankingMap).length + 1;
        rankingMap[position] = {
          id: item.id,
          title: item.title,
          description: item.description,
          url: item.url,
          images: item.images,
          isPinned: item.isPinned,
          sourceSubCategoryName: item.sourceSubCategoryName,
          sourceSubCategoryId: item.sourceSubCategoryId,
          isReference: item.isReference,
          referenceId: item.referenceId,
        };
      });
      
      setRankings(prev => ({
        ...prev,
        [`main_${mainCategoryId}`]: rankingMap,
      }));
    } catch (error) {
      console.error("Error fetching main category rankings:", error);
    }
  }, [pageUserId, setRankings]);

  /**
   * サブカテゴリのランキングを取得
   */
  const fetchSubCategoryRankings = useCallback(async (subCategoryId: string, categoryName: string) => {
    try {
      const items = await RankingService.getRankings({
        subCategoryId,
        userId: pageUserId,
      });
      
      const rankingMap: RankingMap = {};
      items.forEach((item: any) => {
        const position = item.position || Object.keys(rankingMap).length + 1;
        rankingMap[position] = {
          id: item.id,
          title: item.title,
          description: item.description,
          url: item.url,
          images: item.images,
          isPinned: item.isPinned,
        };
      });
      
      setRankings(prev => ({
        ...prev,
        [categoryName]: rankingMap,
      }));
    } catch (error) {
      console.error("Error fetching subcategory rankings:", error);
    }
  }, [pageUserId, setRankings]);

  /**
   * カテゴリ一覧を再取得
   */
  const refreshCategories = useCallback(async () => {
    try {
      const data = await CategoryService.getCategories(pageUserId);
      setAllCategories(data.userCategories || []);
    } catch (error) {
      console.error("Error refreshing categories:", error);
    }
  }, [pageUserId, setAllCategories]);

  /**
   * ランキングアイテムを削除
   */
  const deleteRankingItem = useCallback(async (
    itemId: string,
    isReference: boolean = false,
    referenceId?: string
  ) => {
    if (!confirm("この項目を削除しますか？")) {
      return;
    }

    try {
      if (isReference && referenceId) {
        // 参照アイテムの場合
        await fetch(`/api/rankings/main-category/${referenceId}`, {
          method: 'DELETE',
        });
      } else {
        // 通常のアイテムの場合
        await RankingService.deleteRanking(itemId);
      }
      
      // 成功した場合、現在のビューを再取得
      return true;
    } catch (error) {
      console.error("Error deleting ranking item:", error);
      alert("削除に失敗しました");
      return false;
    }
  }, []);

  return {
    fetchMainCategoryRankings,
    fetchSubCategoryRankings,
    refreshCategories,
    deleteRankingItem,
  };
}