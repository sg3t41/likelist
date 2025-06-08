/**
 * ランキング関連の型定義
 * プロジェクト全体で統一的に使用される型を定義
 */

export interface RankingItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  images?: Array<{ id: string; url: string; order: number }>;
  position?: number;
  sourceSubCategoryName?: string;
  sourceSubCategoryId?: string;
  isReference?: boolean;
  referenceId?: string;
  isDeleted?: boolean;
  isPinned?: boolean;
}

export interface RankingMap {
  [position: number]: RankingItem;
}

export interface Rankings {
  [key: string]: RankingMap;
}

export interface PageUser {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  mainCategoryId: string;
  userId: string;
}

export interface InitialSelection {
  mainCategoryId?: string;
  mainCategory?: string;
  subCategoryId?: string;
  subCategory?: string;
  view?: string;
  highlight?: string;
}