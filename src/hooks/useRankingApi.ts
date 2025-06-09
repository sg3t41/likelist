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
        console.log(`Main category API response - Item ${position}:`, item);
        console.log(`Images for item ${position}:`, item.images);
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
      
      console.log('[useRankingApi] Setting main category rankings:', `main_${mainCategoryId}`, Object.keys(rankingMap).length, 'items');
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
        console.log(`Sub category API response - Item ${position}:`, item);
        console.log(`Images for item ${position}:`, item.images);
        rankingMap[position] = {
          id: item.id,
          title: item.title,
          description: item.description,
          url: item.url,
          images: item.images,
          isPinned: item.isPinned,
        };
      });
      
      console.log('[useRankingApi] Setting sub category rankings:', categoryName, Object.keys(rankingMap).length, 'items');
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
    referenceId?: string,
    currentMainCategoryId?: string,
    currentSubCategoryId?: string,
    currentCategoryName?: string
  ) => {
    if (!confirm("この項目を削除しますか？")) {
      return;
    }

    try {
      console.log('Deleting item:', { itemId, isReference, referenceId, currentMainCategoryId, currentSubCategoryId, currentCategoryName });
      
      if (isReference && referenceId) {
        // 参照アイテムの場合
        const response = await fetch(`/api/rankings/main-category/${referenceId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete reference: ${response.status}`);
        }
        console.log('Reference deleted successfully');
      } else {
        // 通常のアイテムの場合
        const response = await fetch(`/api/rankings/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Delete failed:', { 
            status: response.status, 
            statusText: response.statusText,
            error: errorText,
            url: response.url
          });
          
          // より具体的なエラーメッセージを生成
          let errorMessage = `削除に失敗しました (${response.status})`;
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error) {
              errorMessage += `: ${errorJson.error}`;
            }
          } catch {
            if (errorText) {
              errorMessage += `: ${errorText}`;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        console.log('Item deleted successfully');
      }
      
      // 成功した場合、現在のビューのデータを再取得
      if (currentMainCategoryId) {
        // メインカテゴリビューの場合
        console.log('Refreshing main category rankings:', currentMainCategoryId);
        await fetchMainCategoryRankings(currentMainCategoryId);
      } else if (currentSubCategoryId && currentCategoryName) {
        // サブカテゴリビューの場合
        console.log('Refreshing subcategory rankings:', currentSubCategoryId, currentCategoryName);
        await fetchSubCategoryRankings(currentSubCategoryId, currentCategoryName);
      }
      
      console.log('Rankings refreshed successfully');
      return true;
    } catch (error) {
      console.error("Error deleting ranking item:", error);
      
      // エラーメッセージをより詳細に表示
      const message = error instanceof Error ? error.message : "削除に失敗しました";
      alert(message);
      return false;
    }
  }, [fetchMainCategoryRankings, fetchSubCategoryRankings]);

  return {
    fetchMainCategoryRankings,
    fetchSubCategoryRankings,
    refreshCategories,
    deleteRankingItem,
  };
}