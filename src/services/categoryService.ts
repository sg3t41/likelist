/**
 * カテゴリ関連のAPIサービス
 */

import { Category, SubCategory } from '@/types';

export interface CreateCategoryData {
  mainCategoryName: string;
  subCategories: string[];
}

export class CategoryService {
  /**
   * ユーザーのカテゴリ一覧を取得
   */
  static async getCategories(userId: string): Promise<{ userCategories: Category[] }> {
    const response = await fetch(`/api/categories?userId=${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    return response.json();
  }

  /**
   * メインカテゴリを作成
   */
  static async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create category: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  /**
   * メインカテゴリを削除
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete category: ${response.status} - ${errorText}`);
    }
  }

  /**
   * サブカテゴリを作成
   */
  static async createSubCategory(mainCategoryId: string, name: string): Promise<SubCategory> {
    const response = await fetch(`/api/categories/${mainCategoryId}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create subcategory: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  /**
   * サブカテゴリを削除
   */
  static async deleteSubCategory(subcategoryId: string): Promise<void> {
    const response = await fetch(`/api/subcategories/${subcategoryId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete subcategory: ${response.status} - ${errorText}`);
    }
  }
}

/**
 * サマリー関連のAPIサービス
 */
export class SummaryService {
  /**
   * サマリーデータを取得
   */
  static async getSummaryData(userId: string, type: 'recent' | 'pinned', limit?: number) {
    const params = new URLSearchParams({ userId, type });
    if (limit) params.set('limit', limit.toString());
    
    const response = await fetch(`/api/summary?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch summary data: ${response.status}`);
    }
    return response.json();
  }
}