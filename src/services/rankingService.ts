/**
 * ランキング関連のAPIサービス
 * API呼び出しを統一し、エラーハンドリングを一元化
 */

import { RankingItem } from '@/types';

export interface CreateRankingData {
  title: string;
  description?: string;
  url?: string;
  position: number;
  subCategoryId?: string;
  mainCategoryId?: string;
  existingItemId?: string;
}

export interface UpdateRankingData {
  title?: string;
  description?: string;
  url?: string;
  position?: number;
  isPinned?: boolean;
}

export interface GetRankingsParams {
  subCategoryId?: string;
  mainCategoryId?: string;
  userId: string;
}

export class RankingService {
  /**
   * ランキングアイテム一覧を取得
   */
  static async getRankings(params: GetRankingsParams): Promise<RankingItem[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    
    const response = await fetch(`/api/rankings?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch rankings: ${response.status}`);
    }
    return response.json();
  }

  /**
   * ランキングアイテムを作成
   */
  static async createRanking(data: CreateRankingData): Promise<RankingItem> {
    const response = await fetch('/api/rankings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create ranking: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  /**
   * ランキングアイテムを更新
   */
  static async updateRanking(itemId: string, data: UpdateRankingData): Promise<RankingItem> {
    const response = await fetch(`/api/rankings/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update ranking: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  /**
   * ピン留め状態を切り替え
   */
  static async togglePin(itemId: string, isPinned: boolean): Promise<RankingItem> {
    const response = await fetch(`/api/rankings/${itemId}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to toggle pin: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  /**
   * ランキングアイテムを削除
   */
  static async deleteRanking(itemId: string): Promise<void> {
    const response = await fetch(`/api/rankings/${itemId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete ranking: ${response.status} - ${errorText}`);
    }
  }

  /**
   * 画像をアップロード
   */
  static async uploadImages(itemId: string, images: string[]): Promise<any[]> {
    const response = await fetch(`/api/rankings/${itemId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload images: ${response.status} - ${errorText}`);
    }
    return response.json();
  }
}

/**
 * メインカテゴリ参照関連のAPIサービス
 */
export class MainCategoryReferenceService {
  /**
   * メインカテゴリ参照を更新
   */
  static async updateReference(referenceId: string, data: UpdateRankingData): Promise<any> {
    const response = await fetch(`/api/rankings/main-category/${referenceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update reference: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  /**
   * メインカテゴリ参照を削除
   */
  static async deleteReference(referenceId: string): Promise<void> {
    const response = await fetch(`/api/rankings/main-category/${referenceId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete reference: ${response.status} - ${errorText}`);
    }
  }
}