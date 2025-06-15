"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageUser, InitialSelection } from "@/types";
import { useRankingState } from "@/hooks/useRankingState";
import { useRankingModals } from "@/hooks/useRankingModals";
import { useRankingPin } from "@/hooks/useRankingPin";
import { useRankingApi } from "@/hooks/useRankingApi";
import { useRankingShare } from "@/hooks/useRankingShare";
import { CategoryService } from "@/services";

// Components
import Header from "@/components/Header";
import FloatingMenuButton from "@/components/FloatingMenuButton";
import MainTitle from "@/components/MainTitle";
import BreadcrumbWrapper from "@/components/BreadcrumbWrapper";
import CategoryList from "@/components/CategoryList";
import RankingGrid from "@/components/ranking/RankingGrid";
import RankingToolbar from "@/components/ranking/RankingToolbar";
import PositionMoveModal from "@/components/ranking/PositionMoveModal";
import ImageModal from "@/components/ImageModal";
import UserProfileSection from "@/components/UserProfileSection";
import SummaryView from "@/components/SummaryView";

// Modals
import AddCategoryModal from "@/components/AddCategoryModal";
import AddSubCategoryModal from "@/components/AddSubCategoryModal";
import AddRankingItemModal from "@/components/AddRankingItemModal";
import EditRankingItemModal from "@/components/EditRankingItemModal";
import DeleteCategoryModal from "@/components/DeleteCategoryModal";

interface UserRankingClientProps {
  pageUser: PageUser;
  currentUser: any | null;
  initialCategories: any[];
  initialSelection?: InitialSelection;
  initialRankings?: any;
  totalCategoryCount?: number;
  totalItemCount?: number;
}

export default function UserRankingClient({
  pageUser,
  currentUser,
  initialCategories,
  initialSelection,
  initialRankings: serverInitialRankings,
  totalCategoryCount = 0,
  totalItemCount = 0,
}: UserRankingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOwner = currentUser && currentUser.userId === pageUser.id;

  // URLパラメータから現在の状態を直接計算
  const urlMainCategoryId = searchParams.get('mainCategoryId');
  const urlMainCategory = searchParams.get('mainCategory');
  const urlSubCategory = searchParams.get('subCategory');
  const urlSubCategoryId = searchParams.get('subCategoryId');
  const urlView = searchParams.get('view');

  // URLパラメータに基づいて現在のビュー状態を決定
  const currentViewState = (() => {
    if (urlMainCategoryId && urlMainCategory && urlView === 'main') {
      return {
        isMainCategoryView: true,
        selectedMainCategoryId: urlMainCategoryId,
        selectedMainCategory: urlMainCategory,
        selectedCategory: "",
        selectedSubCategoryId: ""
      };
    } else if (urlSubCategoryId && urlSubCategory && urlMainCategory) {
      return {
        isMainCategoryView: false,
        selectedMainCategoryId: "",
        selectedMainCategory: urlMainCategory,
        selectedCategory: urlSubCategory,
        selectedSubCategoryId: urlSubCategoryId
      };
    } else {
      return {
        isMainCategoryView: false,
        selectedMainCategoryId: "",
        selectedMainCategory: "",
        selectedCategory: "",
        selectedSubCategoryId: ""
      };
    }
  })();

  // カスタムフック群
  const state = useRankingState({
    initialCategories,
    initialSelection,
    serverInitialRankings,
  });

  const modals = useRankingModals();

  const api = useRankingApi({
    pageUserId: pageUser.id,
    rankings: state.rankings,
    setRankings: state.setRankings,
    setAllCategories: state.setAllCategories,
  });

  const pinFeature = useRankingPin({
    rankings: state.rankings,
    setRankings: state.setRankings,
    setRankingsWithTimestamp: state.setRankingsWithTimestamp,
    isMainCategoryView: currentViewState.isMainCategoryView,
    selectedMainCategoryId: currentViewState.selectedMainCategoryId,
    selectedCategory: currentViewState.selectedCategory,
  });

  const shareFeature = useRankingShare({
    pageUser,
    isMainCategoryView: currentViewState.isMainCategoryView,
    selectedMainCategory: currentViewState.selectedMainCategory,
    selectedCategory: currentViewState.selectedCategory,
    selectedMainCategoryId: currentViewState.selectedMainCategoryId,
    rankings: state.rankings,
    setCopiedRanking: state.setCopiedRanking,
    setSharedRanking: state.setSharedRanking,
  });

  // URL更新関数
  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    const newUrl = `/u/${pageUser.id}?${newParams.toString()}`;
    router.push(newUrl);
  };

  // カテゴリ選択処理
  const handleCategorySelect = async (mainCat: string, subCat: string, subCatId: string) => {
    state.setSelectedMainCategory(mainCat);
    state.setSelectedCategory(subCat);
    state.setSelectedSubCategoryId(subCatId);
    state.setIsMainCategoryView(false);
    state.setIsMenuOpen(false);
    
    updateURL({
      mainCategory: mainCat,
      subCategory: subCat,
      subCategoryId: subCatId
    });
    
    await api.fetchSubCategoryRankings(subCatId, subCat);
  };

  const handleMainCategorySelect = (mainCat: any) => {
    state.setSelectedMainCategory(mainCat.name);
    state.setSelectedMainCategoryId(mainCat.id);
    state.setSelectedCategory("");
    state.setIsMainCategoryView(true);
    state.setIsMenuOpen(false);
    
    updateURL({
      mainCategoryId: mainCat.id,
      mainCategory: mainCat.name,
      view: 'main'
    });
    
    api.fetchMainCategoryRankings(mainCat.id);
  };

  const clearSelectionAndNavigateToTop = () => {
    state.setSelectedCategory("");
    state.setSelectedMainCategory("");
    state.setSelectedMainCategoryId("");
    state.setIsMainCategoryView(false);
    router.push(`/u/${pageUser.id}`);
  };

  // タイトル編集
  const handleTitleEdit = async (newTitle: string) => {
    // TODO: APIでタイトル更新
  };

  const handleStartEditTitle = () => {
    const currentTitle = currentViewState.isMainCategoryView 
      ? currentViewState.selectedMainCategory 
      : currentViewState.selectedCategory;
    state.setEditingTitle(currentTitle);
    state.setIsEditingTitle(true);
  };

  // カテゴリ削除処理
  const handleDeleteCategory = () => {
    if (currentViewState.isMainCategoryView) {
      const mainCat = state.allCategories.find(cat => cat.id === currentViewState.selectedMainCategoryId);
      if (mainCat) {
        state.setCategoryToDelete({
          type: 'main',
          id: mainCat.id,
          name: mainCat.name,
          subCategories: mainCat.subCategories
        });
      }
    } else {
      const targetSubCategory = state.allCategories.flatMap(cat => 
        cat.subCategories.map((sub: any) => ({ ...sub, mainCategoryId: cat.id }))
      ).find((sub: any) => sub.id === currentViewState.selectedSubCategoryId);
      
      if (targetSubCategory) {
        state.setCategoryToDelete({
          type: 'sub',
          id: targetSubCategory.id,
          name: targetSubCategory.name
        });
      }
    }
    state.setShowDeleteCategoryModal(true);
  };

  // アイテム操作
  const handleMoveItem = (item: any, position: number) => {
    state.setSelectedItemForMove({ item, position });
  };

  const handlePositionChange = async (newPosition: number) => {
    if (!state.selectedItemForMove) return;
    
    const { item, position: oldPosition } = state.selectedItemForMove;
    
    try {
      // 大カテゴリの参照アイテムの場合は別のAPIを使用
      if (currentViewState.isMainCategoryView && item.isReference && item.referenceId) {
        const response = await fetch(`/api/rankings/main-category/${item.referenceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            position: newPosition
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update reference position');
        }
      } else {
        // 通常のアイテムの場合
        const response = await fetch(`/api/rankings/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: item.title,
            description: item.description,
            url: item.url,
            position: newPosition
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update position');
        }
      }

      // 更新後のデータを再取得
      console.log('[handlePositionChange] Fetching updated data...', {
        isMainCategoryView: currentViewState.isMainCategoryView,
        selectedMainCategoryId: currentViewState.selectedMainCategoryId,
        selectedSubCategoryId: currentViewState.selectedSubCategoryId,
        selectedCategory: currentViewState.selectedCategory
      });
      
      if (currentViewState.isMainCategoryView && currentViewState.selectedMainCategoryId) {
        console.log('[handlePositionChange] Fetching main category rankings...');
        await api.fetchMainCategoryRankings(currentViewState.selectedMainCategoryId);
      } else if (!currentViewState.isMainCategoryView && currentViewState.selectedSubCategoryId && currentViewState.selectedCategory) {
        console.log('[handlePositionChange] Fetching sub category rankings...');
        await api.fetchSubCategoryRankings(currentViewState.selectedSubCategoryId, currentViewState.selectedCategory);
      } else {
        console.warn('[handlePositionChange] No category selected for fetching');
      }
      
      // ハイライト表示
      state.setHighlightPosition(newPosition);
      
    } catch (error) {
      console.error("Error moving item:", error);
      alert("アイテムの移動に失敗しました。");
    } finally {
      state.setSelectedItemForMove(null);
    }
  };

  // 現在のランキングを取得（URLパラメータベース）- useMemoで最適化
  const currentRankings = useMemo(() => {
    if (currentViewState.isMainCategoryView && currentViewState.selectedMainCategoryId) {
      const key = `main_${currentViewState.selectedMainCategoryId}`;
      const rankings = state.rankings[key] || {};
      console.log('[UserRankingClient] Getting main category rankings:', key, rankings);
      return rankings;
    } else if (!currentViewState.isMainCategoryView && currentViewState.selectedCategory) {
      const rankings = state.rankings[currentViewState.selectedCategory] || {};
      console.log('[UserRankingClient] Getting sub category rankings:', currentViewState.selectedCategory, rankings);
      return rankings;
    }
    return {};
  }, [
    currentViewState.isMainCategoryView,
    currentViewState.selectedMainCategoryId,
    currentViewState.selectedCategory,
    state.rankings
  ]);

  console.log('[UserRankingClient] Current rankings (memo):', {
    currentViewState,
    rankingsKeys: Object.keys(state.rankings),
    currentRankingsKeys: Object.keys(currentRankings),
    currentRankings
  });
  const currentTitle = currentViewState.isMainCategoryView ? currentViewState.selectedMainCategory : currentViewState.selectedCategory;
  
  // サーバーから渡されたカテゴリ数とアイテム数を使用
  const categoryCount = totalCategoryCount;
  const itemCount = totalItemCount;

  // ハイライト位置のスクロール処理
  useEffect(() => {
    if (state.highlightPosition) {
      setTimeout(() => {
        const element = document.getElementById(`ranking-item-${state.highlightPosition}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [state.highlightPosition]);

  // URLパラメータ変更の監視と状態更新
  useEffect(() => {
    // 状態を同期的に更新
    state.setSelectedMainCategoryId(currentViewState.selectedMainCategoryId);
    state.setSelectedMainCategory(currentViewState.selectedMainCategory);
    state.setSelectedCategory(currentViewState.selectedCategory);
    state.setSelectedSubCategoryId(currentViewState.selectedSubCategoryId);
    state.setIsMainCategoryView(currentViewState.isMainCategoryView);

    // データ取得（既にデータが存在する場合は取得をスキップ）
    if (currentViewState.isMainCategoryView && currentViewState.selectedMainCategoryId) {
      const dataKey = `main_${currentViewState.selectedMainCategoryId}`;
      const existingData = state.rankings[dataKey];
      
      // データが存在しないか、空の場合、かつ最近更新されていない場合のみ取得
      if (!existingData || Object.keys(existingData).length === 0) {
        if (state.isRecentlyUpdated(dataKey)) {
          console.log('[UserRankingClient] Skipping fetch - recently updated:', dataKey);
        } else {
          console.log('[UserRankingClient] Fetching main category data:', currentViewState.selectedMainCategoryId);
          api.fetchMainCategoryRankings(currentViewState.selectedMainCategoryId);
        }
      } else {
        console.log('[UserRankingClient] Skipping fetch - data already exists:', dataKey, Object.keys(existingData).length, 'items');
      }
    } else if (!currentViewState.isMainCategoryView && currentViewState.selectedSubCategoryId) {
      const dataKey = currentViewState.selectedCategory;
      const existingData = state.rankings[dataKey];
      
      // データが存在しないか、空の場合、かつ最近更新されていない場合のみ取得
      if (!existingData || Object.keys(existingData).length === 0) {
        if (state.isRecentlyUpdated(dataKey)) {
          console.log('[UserRankingClient] Skipping fetch - recently updated:', dataKey);
        } else {
          console.log('[UserRankingClient] Fetching sub category data:', currentViewState.selectedSubCategoryId, currentViewState.selectedCategory);
          api.fetchSubCategoryRankings(currentViewState.selectedSubCategoryId, currentViewState.selectedCategory);
        }
      } else {
        console.log('[UserRankingClient] Skipping fetch - data already exists:', dataKey, Object.keys(existingData).length, 'items');
      }
    }
  }, [searchParams.toString(), state.rankings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* ヘッダー */}
      <Header pageUser={pageUser} />

      <FloatingMenuButton 
        allCategories={state.allCategories}
        pageUser={pageUser}
        isOwner={isOwner}
        onCategorySelect={handleCategorySelect}
        onMainCategorySelect={handleMainCategorySelect}
        onAddCategory={modals.openAddCategoryModal}
        onAddSubCategory={modals.openAddSubCategoryModal}
        onClearSelection={clearSelectionAndNavigateToTop}
        expandedCategories={state.expandedCategories}
        setExpandedCategories={state.setExpandedCategories}
        selectedCategory={currentViewState.selectedCategory}
        isMainCategoryView={currentViewState.isMainCategoryView}
        selectedMainCategoryId={currentViewState.selectedMainCategoryId}
        selectedSubCategoryId={currentViewState.selectedSubCategoryId}
      />
      
      <MainTitle />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 space-y-8">
        {/* パンくずリスト */}
        <BreadcrumbWrapper pageUser={pageUser} allCategories={state.allCategories} />
        <div className="flex gap-8">
          {/* サイドバー（デスクトップ） */}
          <div className="hidden lg:block w-80 bg-white rounded-lg shadow h-fit">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📁</span>
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  カテゴリ
                </h2>
              </div>
              {isOwner && (
                <button
                  onClick={modals.openAddCategoryModal}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-1.5 text-sm font-medium"
                  title="新しいカテゴリを作成"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  追加
                </button>
              )}
            </div>

            <CategoryList
              allCategories={state.allCategories}
              expandedCategories={state.expandedCategories}
              setExpandedCategories={state.setExpandedCategories}
              onCategorySelect={handleCategorySelect}
              onMainCategorySelect={handleMainCategorySelect}
              onAddCategory={modals.openAddCategoryModal}
              onAddSubCategory={modals.openAddSubCategoryModal}
              isOwner={isOwner}
              wrapperClass="pb-0"
              selectedMainCategoryId={currentViewState.selectedMainCategoryId}
              selectedSubCategoryId={currentViewState.selectedSubCategoryId}
              isMainCategoryView={currentViewState.isMainCategoryView}
            />
          </div>

          <div className="flex-1">
            {!currentViewState.selectedCategory && !currentViewState.isMainCategoryView ? (
              <div className="space-y-8">
                <UserProfileSection 
                  pageUser={pageUser} 
                  categoryCount={state.allCategories.length}
                  subCategoryCount={state.allCategories.reduce((total, cat) => total + (cat.subCategories?.length || 0), 0)}
                  itemCount={totalItemCount}
                />
                <SummaryView pageUser={pageUser} />
              </div>
            ) : (
              <div className="space-y-8">
                <UserProfileSection 
                  pageUser={pageUser} 
                  categoryCount={state.allCategories.length}
                  subCategoryCount={state.allCategories.reduce((total, cat) => total + (cat.subCategories?.length || 0), 0)}
                  itemCount={totalItemCount}
                />
                <div className="bg-white rounded-lg shadow">
                <RankingToolbar
                  title={currentTitle}
                  isOwner={isOwner}
                  isEditingTitle={state.isEditingTitle}
                  editingTitle={state.editingTitle}
                  copiedRanking={state.copiedRanking}
                  sharedRanking={state.sharedRanking}
                  onTitleEdit={handleTitleEdit}
                  onCopyUrl={shareFeature.handleCopyRankingUrl}
                  onShare={shareFeature.handleShareRanking}
                  onDeleteCategory={handleDeleteCategory}
                  onStartEditTitle={handleStartEditTitle}
                  onCancelEditTitle={() => state.setIsEditingTitle(false)}
                  setEditingTitle={state.setEditingTitle}
                />

                <RankingGrid
                  rankings={currentRankings}
                  pageUser={pageUser}
                  isOwner={isOwner}
                  isMainCategoryView={currentViewState.isMainCategoryView}
                  highlightPosition={state.highlightPosition}
                  allCategories={state.allCategories}
                  onCategorySelect={handleCategorySelect}
                  onTogglePin={pinFeature.handleTogglePin}
                  onShareItem={shareFeature.handleShareItem}
                  onEditItem={modals.openEditRankingItemModal}
                  onDeleteItem={(itemId: string, isReference?: boolean, referenceId?: string) => 
                    api.deleteRankingItem(
                      itemId,
                      isReference,
                      referenceId,
                      currentViewState.selectedMainCategoryId,
                      currentViewState.selectedSubCategoryId,
                      currentViewState.selectedCategory
                    )
                  }
                  onMoveItem={handleMoveItem}
                  onAddItem={modals.openAddRankingItemModal}
                  onImageClick={(url, alt) => state.setSelectedImageModal({ url, alt })}
                />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* モーダル群 */}
      {modals.isAddCategoryModalOpen && (
        <AddCategoryModal
          isOpen={modals.isAddCategoryModalOpen}
          onClose={modals.closeAddCategoryModal}
          onAdd={async (mainCategory: string, subCategories: string[]) => {
            try {
              await CategoryService.createCategory({
                mainCategoryName: mainCategory,
                subCategories: subCategories
              });
              await api.refreshCategories();
            } catch (error) {
              // Error adding category
            }
          }}
        />
      )}

      {modals.isAddSubCategoryModalOpen && modals.selectedMainCategoryForAdd && (
        <AddSubCategoryModal
          isOpen={modals.isAddSubCategoryModalOpen}
          onClose={modals.closeAddSubCategoryModal}
          mainCategoryId={modals.selectedMainCategoryForAdd.id}
          mainCategoryName={modals.selectedMainCategoryForAdd.name}
          onAdd={async (subCategoryName: string) => {
            try {
              await CategoryService.createSubCategory(
                modals.selectedMainCategoryForAdd.id,
                subCategoryName
              );
              await api.refreshCategories();
            } catch (error) {
              // Error adding subcategory
            }
          }}
        />
      )}

      {modals.isAddRankingItemModalOpen && (
        <AddRankingItemModal
          isOpen={modals.isAddRankingItemModalOpen}
          onClose={modals.closeAddRankingItemModal}
          categoryName={currentViewState.isMainCategoryView ? currentViewState.selectedMainCategory : currentViewState.selectedCategory}
          isMainCategoryView={currentViewState.isMainCategoryView}
          subCategories={currentViewState.isMainCategoryView ? state.allCategories.find(cat => cat.id === currentViewState.selectedMainCategoryId)?.subCategories : undefined}
          onAdd={async (title: string, description: string, url?: string, subCategoryId?: string, existingItemId?: string, imageUrl?: string) => {
            try {
              // APIデータの準備
              const createData = {
                title,
                description,
                url,
                position: modals.targetPosition,
                subCategoryId: currentViewState.isMainCategoryView ? subCategoryId : currentViewState.selectedSubCategoryId,
                mainCategoryId: currentViewState.isMainCategoryView ? currentViewState.selectedMainCategoryId : undefined,
                existingItemId
              };

              // API呼び出し
              const response = await fetch('/api/rankings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(createData),
              });

              if (!response.ok) {
                throw new Error('Failed to create ranking item');
              }

              const newItem = await response.json();
              
              // 画像アップロード（imageUrlがある場合）
              let finalImages = [];
              if (imageUrl && newItem.id) {
                console.log('Uploading image:', imageUrl);
                try {
                  const imageResponse = await fetch(`/api/rankings/${newItem.id}/images`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ images: [imageUrl] }),
                  });
                  
                  if (imageResponse.ok) {
                    const imageData = await imageResponse.json();
                    console.log('Image upload response:', imageData);
                    finalImages = imageData.images || [];
                    console.log('Final images:', finalImages);
                  } else {
                    console.error('Failed to upload image:', imageResponse.status);
                  }
                } catch (error) {
                  console.error('Error uploading image:', error);
                }
              }

              // データを再取得（楽観的更新の代わりに）
              if (currentViewState.isMainCategoryView && currentViewState.selectedMainCategoryId) {
                await api.fetchMainCategoryRankings(currentViewState.selectedMainCategoryId);
              } else if (!currentViewState.isMainCategoryView && currentViewState.selectedSubCategoryId && currentViewState.selectedCategory) {
                await api.fetchSubCategoryRankings(currentViewState.selectedSubCategoryId, currentViewState.selectedCategory);
              }
              
              // ハイライト表示
              state.setHighlightPosition(modals.targetPosition);
              
              // モーダルを閉じる
              modals.closeAddRankingItemModal();
              
            } catch (error) {
              console.error("Error adding ranking item:", error);
              alert("アイテムの追加に失敗しました。");
            }
          }}
        />
      )}

      {modals.isEditRankingItemModalOpen && modals.selectedItemForEdit && (
        <EditRankingItemModal
          isOpen={modals.isEditRankingItemModalOpen}
          onClose={modals.closeEditRankingItemModal}
          item={modals.selectedItemForEdit}
          totalItems={Object.keys(currentRankings).length}
          onSave={async (id: string, title: string, description: string, url: string, imageUrls?: string[]) => {
            try {
              // API呼び出し
              const response = await fetch(`/api/rankings/${id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  title,
                  description,
                  url
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to update ranking item');
              }

              // 画像データを更新
              let updatedImages = modals.selectedItemForEdit?.images || [];
              if (imageUrls) {
                try {
                  const imageResponse = await fetch(`/api/rankings/${id}/images`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ images: imageUrls }),
                  });
                  
                  if (imageResponse.ok) {
                    const imageData = await imageResponse.json();
                    updatedImages = imageData.images || [];
                  }
                } catch (error) {
                  console.error('Error updating images:', error);
                  // 画像更新に失敗しても、テキスト更新は続行
                }
              }

              // ランキングデータの楽観的更新（画像も含む）
              const currentKey = currentViewState.isMainCategoryView 
                ? `main_${currentViewState.selectedMainCategoryId}` 
                : currentViewState.selectedCategory;
              
              console.log('[UserRankingClient] Optimistic update - editing item in:', currentKey, 'id:', id);
              
              state.setRankingsWithTimestamp(prev => {
                const currentRankings = prev[currentKey] || {};
                const updatedRankings = { ...currentRankings };
                
                // 既存のアイテムを見つけて更新
                for (const [pos, item] of Object.entries(updatedRankings)) {
                  if (item.id === id) {
                    updatedRankings[parseInt(pos)] = {
                      ...item,
                      title,
                      description,
                      url,
                      images: updatedImages
                    };
                    break;
                  }
                }
                
                return {
                  ...prev,
                  [currentKey]: updatedRankings
                };
              }, currentKey);
              
              // モーダルを閉じる
              modals.closeEditRankingItemModal();
              
            } catch (error) {
              console.error("Error updating ranking item:", error);
              alert("アイテムの更新に失敗しました。");
            }
          }}
        />
      )}

      <PositionMoveModal
        isOpen={!!state.selectedItemForMove}
        onClose={() => state.setSelectedItemForMove(null)}
        item={state.selectedItemForMove?.item || null}
        currentPosition={state.selectedItemForMove?.position || 0}
        onMove={handlePositionChange}
      />

      {state.selectedImageModal && (
        <ImageModal
          isOpen={!!state.selectedImageModal}
          imageUrl={state.selectedImageModal.url}
          alt={state.selectedImageModal.alt}
          onClose={() => state.setSelectedImageModal(null)}
        />
      )}

      <DeleteCategoryModal
        isOpen={state.showDeleteCategoryModal}
        onClose={() => {
          state.setShowDeleteCategoryModal(false);
          state.setCategoryToDelete(null);
        }}
        category={state.categoryToDelete}
        onConfirm={async () => {
          if (!state.categoryToDelete) return;
          
          try {
            if (state.categoryToDelete.type === 'main') {
              await CategoryService.deleteCategory(state.categoryToDelete.id);
              // メインカテゴリ削除後はホーム画面へリダイレクト
              router.push(`/u/${pageUser.id}`);
            } else {
              await CategoryService.deleteSubCategory(state.categoryToDelete.id);
              // サブカテゴリ削除後はメインカテゴリビューへリダイレクト
              const mainCat = state.allCategories.find(cat => 
                cat.subCategories.some((sub: any) => sub.id === state.categoryToDelete?.id)
              );
              if (mainCat) {
                router.push(`/u/${pageUser.id}?mainCategoryId=${mainCat.id}&mainCategory=${encodeURIComponent(mainCat.name)}&view=main`);
              }
            }
            await api.refreshCategories();
          } catch (error) {
            console.error("Error deleting category:", error);
            alert("カテゴリの削除に失敗しました。");
          }
        }}
      />
    </div>
  );
}