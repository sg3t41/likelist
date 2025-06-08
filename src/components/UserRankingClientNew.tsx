"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageUser, InitialSelection } from "@/types";
import { useRankingState } from "@/hooks/useRankingState";
import { useRankingModals } from "@/hooks/useRankingModals";
import { useRankingPin } from "@/hooks/useRankingPin";
import { useRankingApi } from "@/hooks/useRankingApi";
import { useRankingShare } from "@/hooks/useRankingShare";
import { CategoryService } from "@/services";

// Components
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

interface UserRankingClientProps {
  pageUser: PageUser;
  currentUser: any | null;
  initialCategories: any[];
  initialSelection?: InitialSelection;
  initialRankings?: any;
}

export default function UserRankingClient({
  pageUser,
  currentUser,
  initialCategories,
  initialSelection,
  initialRankings: serverInitialRankings,
}: UserRankingClientProps) {
  const router = useRouter();
  const isOwner = currentUser && currentUser.userId === pageUser.id;

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
    isMainCategoryView: state.isMainCategoryView,
    selectedMainCategoryId: state.selectedMainCategoryId,
    selectedCategory: state.selectedCategory,
  });

  const shareFeature = useRankingShare({
    pageUser,
    isMainCategoryView: state.isMainCategoryView,
    selectedMainCategory: state.selectedMainCategory,
    selectedCategory: state.selectedCategory,
    selectedMainCategoryId: state.selectedMainCategoryId,
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
    router.push(`/u/${pageUser.id}?${newParams.toString()}`);
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
    console.log("Title edit:", newTitle);
  };

  const handleStartEditTitle = () => {
    const currentTitle = state.isMainCategoryView 
      ? state.selectedMainCategory 
      : state.selectedCategory;
    state.setEditingTitle(currentTitle);
    state.setIsEditingTitle(true);
  };

  // カテゴリ削除処理
  const handleDeleteCategory = () => {
    if (state.isMainCategoryView) {
      const mainCat = state.allCategories.find(cat => cat.id === state.selectedMainCategoryId);
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
      ).find((sub: any) => sub.id === state.selectedSubCategoryId);
      
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
    if (state.selectedItemForMove) {
      // TODO: API呼び出し
      console.log("Position change:", state.selectedItemForMove.item.id, newPosition);
      state.setSelectedItemForMove(null);
    }
  };

  // 現在のランキングを取得
  const getCurrentRankings = () => {
    if (state.isMainCategoryView && state.selectedMainCategoryId) {
      return state.rankings[`main_${state.selectedMainCategoryId}`] || {};
    } else if (!state.isMainCategoryView && state.selectedCategory) {
      return state.rankings[state.selectedCategory] || {};
    }
    return {};
  };

  const currentRankings = getCurrentRankings();
  const currentTitle = state.isMainCategoryView ? state.selectedMainCategory : state.selectedCategory;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl"></div>
      </div>

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
        selectedCategory={state.selectedCategory}
        isMainCategoryView={state.isMainCategoryView}
        selectedMainCategoryId={state.selectedMainCategoryId}
        selectedSubCategoryId={state.selectedSubCategoryId}
      />
      
      <MainTitle />
      <BreadcrumbWrapper pageUser={pageUser} allCategories={state.allCategories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              selectedMainCategoryId={state.selectedMainCategoryId}
              selectedSubCategoryId={state.selectedSubCategoryId}
              isMainCategoryView={state.isMainCategoryView}
            />
          </div>

          <div className="flex-1">
            {!state.selectedCategory && !state.isMainCategoryView ? (
              <div className="space-y-8">
                <UserProfileSection pageUser={pageUser} />
                <SummaryView pageUser={pageUser} />
              </div>
            ) : (
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
                  isMainCategoryView={state.isMainCategoryView}
                  highlightPosition={state.highlightPosition}
                  allCategories={state.allCategories}
                  onCategorySelect={handleCategorySelect}
                  onTogglePin={pinFeature.handleTogglePin}
                  onShareItem={shareFeature.handleShareItem}
                  onEditItem={modals.openEditRankingItemModal}
                  onDeleteItem={api.deleteRankingItem}
                  onMoveItem={handleMoveItem}
                  onAddItem={modals.openAddRankingItemModal}
                  onImageClick={(url, alt) => state.setSelectedImageModal({ url, alt })}
                />
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
              console.error("Error adding category:", error);
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
              console.error("Error adding subcategory:", error);
            }
          }}
        />
      )}

      {modals.isAddRankingItemModalOpen && (
        <AddRankingItemModal
          isOpen={modals.isAddRankingItemModalOpen}
          onClose={modals.closeAddRankingItemModal}
          categoryName={state.isMainCategoryView ? state.selectedMainCategory : state.selectedCategory}
          isMainCategoryView={state.isMainCategoryView}
          subCategories={state.isMainCategoryView ? state.allCategories.find(cat => cat.id === state.selectedMainCategoryId)?.subCategories : undefined}
          onAdd={async () => {
            // TODO: ランキングアイテム追加処理
            console.log("Add ranking item");
          }}
        />
      )}

      {modals.isEditRankingItemModalOpen && modals.selectedItemForEdit && (
        <EditRankingItemModal
          isOpen={modals.isEditRankingItemModalOpen}
          onClose={modals.closeEditRankingItemModal}
          item={modals.selectedItemForEdit}
          totalItems={Object.keys(currentRankings).length}
          onSave={async () => {
            // TODO: ランキングアイテム編集処理
            console.log("Edit ranking item");
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
          src={state.selectedImageModal.url}
          alt={state.selectedImageModal.alt}
          onClose={() => state.setSelectedImageModal(null)}
        />
      )}
    </div>
  );
}