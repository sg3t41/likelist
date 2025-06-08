"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import AddCategoryModal from "@/components/AddCategoryModal";
import AddSubCategoryModal from "@/components/AddSubCategoryModal";
import AddRankingItemModal from "@/components/AddRankingItemModal";
import EditRankingItemModal from "@/components/EditRankingItemModal";
import UserProfileSection from "@/components/UserProfileSection";
import SummaryView from "@/components/SummaryView";
import ImageModal from "@/components/ImageModal";
import RankingSkeleton from "@/components/RankingSkeleton";
import BreadcrumbWrapper from "@/components/BreadcrumbWrapper";
import FloatingMenuButton from "@/components/FloatingMenuButton";
import MainTitle from "@/components/MainTitle";

type PageUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
};

type MainCategory = string;
type SubCategory = string;
type Category = string;

type RankingItem = {
  id: number | string;
  title: string;
  description?: string;
  url?: string;
  images?: { id: string; url: string; order: number }[];
  position?: number;
  sourceSubCategoryName?: string;
  sourceSubCategoryId?: string;
  isReference?: boolean;
  referenceId?: string;
  isDeleted?: boolean;
  isPinned?: boolean;
};

type RankingMap = {
  [position: number]: RankingItem;
};

type Rankings = {
  [key in Category]: RankingMap;
};

const initialRankings: Rankings = {};

interface UserRankingClientProps {
  pageUser: PageUser;
  currentUser: any | null;
  initialCategories: any[];
  initialSelection?: {
    mainCategoryId?: string;
    mainCategory?: string;
    subCategoryId?: string;
    subCategory?: string;
    view?: string;
    highlight?: string;
  };
  initialRankings?: any;
}

export default function UserRankingClient({ 
  pageUser, 
  currentUser,
  initialCategories,
  initialSelection,
  initialRankings: serverInitialRankings
}: UserRankingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  
  // 現在のユーザーがページの所有者かどうか
  const isOwner = currentUser && currentUser.userId === pageUser.id;

  // 初期状態をサーバーから受け取った値で設定（サーバーデータ優先）
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    serverInitialRankings?.type === 'sub' ? serverInitialRankings.categoryName : initialSelection?.subCategory || ""
  );
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory>(initialSelection?.mainCategory || "");
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string>(initialSelection?.mainCategoryId || "");
  const [isMainCategoryView, setIsMainCategoryView] = useState(initialSelection?.view === 'main');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(initialSelection?.subCategoryId || "");
  
  // 初期ランキングデータを設定
  const getInitialRankings = () => {
    const rankings: Rankings = {};
    if (serverInitialRankings) {
      const rankingMap: RankingMap = {};
      serverInitialRankings.items.forEach((item: any) => {
        rankingMap[item.position] = item;
      });
      
      if (serverInitialRankings.type === 'main') {
        rankings[`main_${serverInitialRankings.categoryId}`] = rankingMap;
      } else {
        rankings[serverInitialRankings.categoryName] = rankingMap;
      }
    }
    return rankings;
  };
  
  const [rankings, setRankings] = useState<Rankings>(getInitialRankings());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSubCategoryModalOpen, setIsAddSubCategoryModalOpen] = useState(false);
  const [isAddRankingItemModalOpen, setIsAddRankingItemModalOpen] = useState(false);
  const [isEditRankingItemModalOpen, setIsEditRankingItemModalOpen] = useState(false);
  const [selectedMainCategoryForAdd, setSelectedMainCategoryForAdd] = useState<any>(null);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>(initialCategories);
  const [targetPosition, setTargetPosition] = useState<number>(0);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [highlightPosition, setHighlightPosition] = useState<number | null>(
    initialSelection?.highlight ? parseInt(initialSelection.highlight) : null
  );
  const [copiedRanking, setCopiedRanking] = useState(false);
  const [sharedRanking, setSharedRanking] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(initialCategories.map(cat => cat.id)));
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [isRankingMenuOpen, setIsRankingMenuOpen] = useState(false);
  const [openItemMenuId, setOpenItemMenuId] = useState<string | null>(null);
  const [selectedItemForMove, setSelectedItemForMove] = useState<{item: RankingItem, position: number} | null>(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{type: 'main' | 'sub', id: string, name: string, subCategories?: any[]} | null>(null);
  const [openCategoryMenuId, setOpenCategoryMenuId] = useState<string | null>(null);
  
  // Drag and drop state variables
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{item: RankingItem, position: number} | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const [touchStartPosition, setTouchStartPosition] = useState<{x: number, y: number} | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchDragElement, setTouchDragElement] = useState<HTMLElement | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<{url: string, alt: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set());

  // 初期化済みフラグ
  const [isInitialized, setIsInitialized] = useState(false);
  
  // initialSelectionからの状態設定（初回のみ）
  useEffect(() => {
    if (!isInitialized && allCategories.length > 0) {
      if (initialSelection.subCategoryId) {
        // 小カテゴリが指定されている場合
        const mainCat = allCategories.find(cat => cat.name === initialSelection.mainCategory);
        if (mainCat) {
          const subCat = mainCat.subCategories.find((sub: any) => sub.id === initialSelection.subCategoryId);
          if (subCat) {
            setSelectedMainCategory(mainCat.name);
            setSelectedCategory(subCat.name);
            setSelectedSubCategoryId(initialSelection.subCategoryId);
            setIsMainCategoryView(false);
            
            // initialRankingsがある場合はそれを使用
            if (initialRankings && initialRankings.type === "sub") {
              const rankingMap: RankingMap = {};
              initialRankings.items.forEach((item: any) => {
                const position = item.position || Object.keys(rankingMap).length + 1;
                rankingMap[position] = {
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  url: item.url,
                  images: item.images,
                  isPinned: item.isPinned
                };
              });
              setRankings(prev => ({
                ...prev,
                [subCat.name]: rankingMap
              }));
            }
          }
        }
      } else if (initialSelection.view === 'main' && initialSelection.mainCategoryId) {
        // 大カテゴリが指定されている場合
        const mainCat = allCategories.find(cat => cat.id === initialSelection.mainCategoryId);
        if (mainCat) {
          setSelectedMainCategory(mainCat.name);
          setSelectedMainCategoryId(mainCat.id);
          setSelectedCategory("");
          setIsMainCategoryView(true);
          
          // initialRankingsがある場合はそれを使用
          if (initialRankings && initialRankings.type === "main") {
            const rankingMap: RankingMap = {};
            initialRankings.items.forEach((item: any) => {
              const position = item.position || Object.keys(rankingMap).length + 1;
              rankingMap[position] = {
                id: item.id,
                title: item.title,
                description: item.description,
                url: item.url,
                images: item.images,
                isPinned: item.isPinned
              };
            });
            setMainCategoryRankings(rankingMap);
          }
        }
      }
      setIsInitialized(true);
    }
  }, [allCategories, initialSelection, initialRankings, isInitialized]);
  
  // URL変更の監視（初期化後）
  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    
    const mainCategoryParam = searchParams.get('mainCategory');
    const subCategoryParam = searchParams.get('subCategory');
    const subCategoryIdParam = searchParams.get('subCategoryId');
    const mainCategoryIdParam = searchParams.get('mainCategoryId');
    const viewParam = searchParams.get('view');
    
    
    if (subCategoryIdParam && subCategoryParam && mainCategoryParam) {
      // 小カテゴリナビゲーション
      const mainCat = allCategories.find(cat => cat.name === mainCategoryParam);
      if (mainCat) {
        const subCat = mainCat.subCategories.find((sub: any) => sub.id === subCategoryIdParam);
        if (subCat) {
          setSelectedMainCategory(mainCat.name);
          setSelectedCategory(subCat.name);
          setSelectedSubCategoryId(subCategoryIdParam);
          setIsMainCategoryView(false);
          setSelectedMainCategoryId('');
          
          // データを再取得
          const fetchRankings = async () => {
            setIsLoading(true);
            try {
              const response = await fetch(`/api/rankings?subCategoryId=${subCategoryIdParam}&userId=${pageUser.id}`);
              if (response.ok) {
                const items = await response.json();
                const rankingMap: RankingMap = {};
                items.forEach((item: any) => {
                  const position = item.position || Object.keys(rankingMap).length + 1;
                  rankingMap[position] = {
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    url: item.url,
                    images: item.images,
                    isPinned: item.isPinned
                  };
                });
                setRankings(prev => ({
                  ...prev,
                  [subCat.name]: rankingMap
                }));
              }
            } catch (error) {
              console.error("Error fetching subcategory rankings:", error);
            } finally {
              setIsLoading(false);
            }
          };
          
          fetchRankings();
        }
      }
    } else if (viewParam === 'main' && mainCategoryParam) {
      // 大カテゴリナビゲーション
      let mainCat;
      if (mainCategoryIdParam) {
        mainCat = allCategories.find(cat => cat.id === mainCategoryIdParam);
      } else {
        mainCat = allCategories.find(cat => cat.name === mainCategoryParam);
      }
      
      if (mainCat) {
        setSelectedMainCategory(mainCat.name);
        setSelectedMainCategoryId(mainCat.id);
        setSelectedCategory("");
        setSelectedSubCategoryId('');
        setIsMainCategoryView(true);
        
        fetchMainCategoryRankings(mainCat.id);
      }
    } else {
      // トップページに戻る（URLパラメータがない場合）
      setSelectedMainCategory("");
      setSelectedCategory("");
      setSelectedSubCategoryId('');
      setSelectedMainCategoryId('');
      setIsMainCategoryView(false);
    }
  }, [searchParams, allCategories, isInitialized, pageUser.id]);


  // タイトル編集関数
  const handleSaveTitle = async () => {
    if (!editingTitle.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    try {
      if (isMainCategoryView && selectedMainCategoryId) {
        // 大カテゴリのタイトル編集
        const response = await fetch(`/api/categories/${selectedMainCategoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: editingTitle.trim() }),
        });

        if (response.ok) {
          // カテゴリリストを再取得
          const res = await fetch(`/api/categories?userId=${pageUser.id}`);
          if (res.ok) {
            const data = await res.json();
            setAllCategories(data.userCategories || []);
          }
          
          setSelectedMainCategory(editingTitle.trim());
          setIsEditingTitle(false);
        } else {
          const errorData = await response.json();
          alert(`タイトルの更新に失敗しました: ${errorData.error || 'Unknown error'}`);
        }
      } else if (!isMainCategoryView && selectedSubCategoryId) {
        // 小カテゴリのタイトル編集
        const response = await fetch(`/api/subcategories/${selectedSubCategoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: editingTitle.trim() }),
        });

        if (response.ok) {
          // カテゴリリストを再取得
          const res = await fetch(`/api/categories?userId=${pageUser.id}`);
          if (res.ok) {
            const data = await res.json();
            setAllCategories(data.userCategories || []);
          }
          
          setSelectedCategory(editingTitle.trim());
          setIsEditingTitle(false);
        } else {
          const errorData = await response.json();
          alert(`タイトルの更新に失敗しました: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error("Error updating title:", error);
      alert("タイトルの更新に失敗しました");
    }
  };

  // Reset drag state function
  const resetDragState = () => {
    setIsDragging(false);
    setDraggedItem(null);
    setDragOverPosition(null);
    setTouchStartPosition(null);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    if (touchDragElement) {
      touchDragElement.remove();
      setTouchDragElement(null);
    }
    // Re-enable scrolling
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  };

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    router.push(`/u/${pageUser.id}?${newParams.toString()}`);
  };

  const clearSelectionAndNavigateToTop = () => {
    // URLのみを更新 - 状態の更新はuseEffectに任せる
    router.push(`/u/${pageUser.id}`);
  };

  const handleCategorySelect = (mainCat: string, subCat: string, subCatId: string) => {
    setIsMenuOpen(false);
    
    // URLのみを更新 - 状態の更新とデータ取得はuseEffectに任せる
    updateURL({
      mainCategory: mainCat,
      subCategory: subCat,
      subCategoryId: subCatId
    });
  };

  const handleMainCategorySelect = (mainCat: any) => {
    setIsMenuOpen(false);
    
    // URLのみを更新 - 状態の更新とデータ取得はuseEffectに任せる
    updateURL({
      mainCategoryId: mainCat.id,
      mainCategory: mainCat.name,
      view: 'main'
    });
  };

  const fetchMainCategoryRankings = async (mainCategoryId: string) => {
    try {
      const response = await fetch(`/api/rankings?mainCategoryId=${mainCategoryId}&userId=${pageUser.id}`);
      if (response.ok) {
        const items = await response.json();
        const rankingMap: RankingMap = {};
        items.forEach((item: any) => {
          const position = item.position || Object.keys(rankingMap).length + 1;
          rankingMap[position] = {
            id: item.id,
            title: item.title,
            description: item.description,
            url: item.url,
            images: item.images,
            sourceSubCategoryName: item.sourceSubCategoryName,
            sourceSubCategoryId: item.sourceSubCategoryId,
            isReference: item.isReference,
            referenceId: item.referenceId,
            isDeleted: item.isDeleted,
            isPinned: item.isPinned
          };
        });
        setRankings(prev => ({
          ...prev,
          [`main_${mainCategoryId}`]: rankingMap
        }));
      }
    } catch (error) {
      console.error("Error fetching main category rankings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePin = async (item: RankingItem) => {
    try {
      const response = await fetch(`/api/rankings/${item.id}/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPinned: !item.isPinned,
        }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        
        // ピン留め状態を更新
        if (item.isPinned) {
          setPinnedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(item.id.toString());
            return newSet;
          });
        } else {
          setPinnedItems(prev => {
            const newSet = new Set(prev);
            newSet.add(item.id.toString());
            return newSet;
          });
        }
        
        // 現在のカテゴリのランキングを再取得
        if (isMainCategoryView && selectedMainCategoryId) {
          await fetchMainCategoryRankings(selectedMainCategoryId);
        } else if (selectedSubCategoryId) {
          const response = await fetch(`/api/rankings?subCategoryId=${selectedSubCategoryId}&userId=${pageUser.id}`);
          if (response.ok) {
            const items = await response.json();
            const rankingMap: RankingMap = {};
            items.forEach((item: any) => {
              const position = item.position || Object.keys(rankingMap).length + 1;
              rankingMap[position] = {
                id: item.id,
                title: item.title,
                description: item.description,
                url: item.url,
                images: item.images,
                isPinned: item.isPinned
              };
            });
            setRankings(prev => ({
              ...prev,
              [selectedCategory]: rankingMap
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const handleShareItem = async (item: RankingItem, position: number) => {
    const currentUrl = window.location.origin;
    const params = new URLSearchParams(window.location.search);
    params.set('highlight', position.toString());
    
    const shareUrl = `${currentUrl}/u/${pageUser.id}?${params.toString()}`;
    
    // ツイート内容を作成
    const userName = pageUser.name || pageUser.username || 'ユーザー';
    const categoryText = isMainCategoryView 
      ? `${userName}さんの【${selectedMainCategory}】` 
      : `${userName}さんの【${selectedMainCategory} - ${selectedCategory}】`;
    
    const tweetText = `${categoryText}の好きなもの ${position}位は「${item.title}」${item.description ? '\n' + item.description : ''}\n\n`;
    
    // X(Twitter)の共有URLを作成
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    
    // 新しいウィンドウでTwitter共有画面を開く
    window.open(twitterShareUrl, '_blank', 'width=600,height=400');
    
    // 共有ボタンのフィードバック
    setCopiedItemId(item.id.toString());
    setTimeout(() => setCopiedItemId(null), 2000);
  };

  const handleCopyRankingUrl = async () => {
    const currentUrl = window.location.origin;
    const shareUrl = `${currentUrl}/u/${pageUser.id}?${window.location.search}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedRanking(true);
      setTimeout(() => setCopiedRanking(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      prompt("共有URL:", shareUrl);
    }
  };

  const handleShareRanking = () => {
    const currentUrl = window.location.origin;
    const shareUrl = `${currentUrl}/u/${pageUser.id}?${window.location.search}`;
    
    // ツイート内容を作成
    const userName = pageUser.name || pageUser.username || 'ユーザー';
    const categoryText = isMainCategoryView 
      ? `${userName}さんの【${selectedMainCategory}】の好きなものリスト` 
      : `${userName}さんの【${selectedMainCategory} - ${selectedCategory}】の好きなものリスト`;
    
    const currentRankings = isMainCategoryView 
      ? rankings[`main_${selectedMainCategoryId}`] || {}
      : rankings[selectedCategory] || {};
    
    // 上位3つを取得
    const top3 = [];
    for (let i = 1; i <= 3; i++) {
      if (currentRankings[i]) {
        top3.push(`${i}位: ${currentRankings[i].title}`);
      }
    }
    
    const tweetText = `${categoryText}\n${top3.join('\n')}\n\n`;
    
    // X(Twitter)の共有URLを作成
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    
    // 新しいウィンドウでTwitter共有画面を開く
    window.open(twitterShareUrl, '_blank', 'width=600,height=400');
    
    // 共有ボタンのフィードバック
    setSharedRanking(true);
    setTimeout(() => setSharedRanking(false), 2000);
  };

  // 削除関数
  const handleDeleteMainCategory = async (categoryId: string) => {
    if (!confirm("この大カテゴリとそのすべての小カテゴリ、項目を削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // カテゴリリストを再取得
        const res = await fetch(`/api/categories?userId=${pageUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setAllCategories(data.userCategories || []);
        }
        
        // 削除したカテゴリが選択されていた場合、選択を解除
        if (selectedMainCategoryId === categoryId) {
          setIsMainCategoryView(false);
          setSelectedCategory("");
          setSelectedSubCategoryId("");
          setSelectedMainCategory("");
          setSelectedMainCategoryId("");
        }
      } else {
        const errorData = await response.json();
        console.error("Delete failed:", response.status, errorData);
        alert(`削除に失敗しました: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting main category:", error);
      alert("削除に失敗しました");
    }
  };

  const handleDeleteSubCategory = async (subcategoryId: string) => {
    if (!confirm("この小カテゴリとそのすべての項目を削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/subcategories/${subcategoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // カテゴリリストを再取得
        const res = await fetch(`/api/categories?userId=${pageUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setAllCategories(data.userCategories || []);
        }
        
        // 削除したカテゴリが選択されていた場合、選択を解除
        if (selectedSubCategoryId === subcategoryId) {
          setSelectedCategory("");
          setSelectedSubCategoryId("");
          setIsMainCategoryView(false);
        }
      } else {
        const errorData = await response.json();
        console.error("Delete failed:", response.status, errorData);
        alert(`削除に失敗しました: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting sub category:", error);
      alert("削除に失敗しました");
    }
  };

  const handleDeleteRankingItem = async (itemOrReferenceId: string, isReference: boolean = false, referenceId?: string) => {
    if (!confirm("この項目を削除しますか？")) {
      return;
    }

    try {
      // 大カテゴリの参照アイテムの場合は参照のみ削除
      const endpoint = isMainCategoryView && isReference && referenceId
        ? `/api/rankings/main-category/${referenceId}`
        : `/api/rankings/${itemOrReferenceId}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        // ランキングを再取得
        if (isMainCategoryView && selectedMainCategoryId) {
          await fetchMainCategoryRankings(selectedMainCategoryId);
        } else if (selectedSubCategoryId) {
          // 小カテゴリのランキングを再取得
          const response = await fetch(`/api/rankings?subCategoryId=${selectedSubCategoryId}&userId=${pageUser.id}`);
          if (response.ok) {
            const items = await response.json();
            const rankingMap: RankingMap = {};
            items.forEach((item: any) => {
              const position = item.position || Object.keys(rankingMap).length + 1;
              rankingMap[position] = {
                id: item.id,
                title: item.title,
                description: item.description,
                url: item.url,
                images: item.images,
                isPinned: item.isPinned
              };
            });
            setRankings(prev => ({
              ...prev,
              [selectedCategory]: rankingMap
            }));
          }
        }
      } else {
        const errorData = await response.json();
        console.error("Delete failed:", response.status, errorData);
        alert(`削除に失敗しました: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting ranking item:", error);
      alert("削除に失敗しました");
    }
  };

  const handlePositionChange = async (item: RankingItem, newPosition: number) => {
    if (newPosition < 1 || newPosition > 11) {
      alert("順位は1から11の間で指定してください");
      return;
    }

    try {
      const endpoint = isMainCategoryView && item.referenceId 
        ? `/api/rankings/main-category/${item.referenceId}`
        : `/api/rankings/${item.id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: item.title,
          description: item.description || '',
          position: newPosition,
          ...(isMainCategoryView && { mainCategoryId: selectedMainCategoryId })
        }),
      });

      if (response.ok) {
        // ランキングを再取得
        if (isMainCategoryView && selectedMainCategoryId) {
          await fetchMainCategoryRankings(selectedMainCategoryId);
        } else if (selectedSubCategoryId) {
          // 小カテゴリのランキングを再取得
          const response = await fetch(`/api/rankings?subCategoryId=${selectedSubCategoryId}&userId=${pageUser.id}`);
          if (response.ok) {
            const items = await response.json();
            const rankingMap: RankingMap = {};
            items.forEach((item: any) => {
              const position = item.position || Object.keys(rankingMap).length + 1;
              rankingMap[position] = {
                id: item.id,
                title: item.title,
                description: item.description,
                url: item.url,
                images: item.images,
                isPinned: item.isPinned
              };
            });
            setRankings(prev => ({
              ...prev,
              [selectedCategory]: rankingMap
            }));
          }
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to update position:", errorData);
        alert(`順位の変更に失敗しました: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating position:", error);
      alert("順位の変更に失敗しました");
    }
  };

  const handleEditItem = async (id: string, title: string, description: string, url: string, position?: number) => {
    try {
      // 編集対象のアイテムを探す
      const currentRankings = isMainCategoryView 
        ? rankings[`main_${selectedMainCategoryId}`] || {}
        : rankings[selectedCategory] || {};
      
      let targetItem: RankingItem | null = null;
      for (const pos in currentRankings) {
        if (currentRankings[pos].id === id) {
          targetItem = currentRankings[pos];
          break;
        }
      }

      if (!targetItem) return;

      // タイトルと説明を更新
      const endpoint = isMainCategoryView && targetItem.referenceId 
        ? `/api/rankings/main-category/${targetItem.referenceId}`
        : `/api/rankings/${id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          url,
          position,
          ...(isMainCategoryView && { mainCategoryId: selectedMainCategoryId })
        }),
      });

      if (response.ok) {
        // ランキングを再取得
        if (isMainCategoryView && selectedMainCategoryId) {
          await fetchMainCategoryRankings(selectedMainCategoryId);
        } else if (selectedSubCategoryId) {
          // 小カテゴリのランキングを再取得
          const response = await fetch(`/api/rankings?subCategoryId=${selectedSubCategoryId}&userId=${pageUser.id}`);
          if (response.ok) {
            const items = await response.json();
            const rankingMap: RankingMap = {};
            items.forEach((item: any) => {
              const position = item.position || Object.keys(rankingMap).length + 1;
              rankingMap[position] = {
                id: item.id,
                title: item.title,
                description: item.description,
                url: item.url,
                images: item.images,
                isPinned: item.isPinned
              };
            });
            setRankings(prev => ({
              ...prev,
              [selectedCategory]: rankingMap
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error editing item:", error);
      alert("編集に失敗しました");
    }
  };

  // ドラッグ&ドロップのハンドラー
  const handleDragStart = (e: React.DragEvent, item: RankingItem, position: number) => {
    setDraggedItem({ item, position });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPosition(position);
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };


  // タッチイベントのハンドラー（改善版）
  const handleTouchStart = (e: React.TouchEvent, item: RankingItem, position: number) => {
    // 既にドラッグ中またはオーナーでない場合は何もしない
    if (isDragging || !isOwner || item.isDeleted) {
      return;
    }
    
    const touch = e.touches[0];
    setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
    
    // 長押しタイマーを設定（300ms）
    const timer = setTimeout(() => {
      // 長押し成功 → ドラッグモード開始
      setIsDragging(true);
      setDraggedItem({ item, position });
      
      // スクロールを一時的に無効化
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      // ドラッグ中の要素を作成
      const element = e.currentTarget as HTMLElement;
      const rect = element.getBoundingClientRect();
      const clone = element.cloneNode(true) as HTMLElement;
      
      clone.style.position = 'fixed';
      clone.style.top = `${touch.clientY - rect.height / 2}px`;
      clone.style.left = `${Math.max(10, Math.min(touch.clientX - rect.width / 2, window.innerWidth - rect.width - 10))}px`;
      clone.style.width = `${rect.width - 20}px`;
      clone.style.zIndex = '9999';
      clone.style.opacity = '0.9';
      clone.style.pointerEvents = 'none';
      clone.style.transform = 'rotate(2deg) scale(1.05)';
      clone.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      clone.style.borderRadius = '8px';
      clone.classList.add('touch-drag-clone');
      
      document.body.appendChild(clone);
      setTouchDragElement(clone);
      
      // 振動フィードバック
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 300);
    
    setLongPressTimer(timer);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    // 長押し判定中の場合
    if (longPressTimer && touchStartPosition) {
      const deltaX = Math.abs(touch.clientX - touchStartPosition.x);
      const deltaY = Math.abs(touch.clientY - touchStartPosition.y);
      
      // 移動量が閾値を超えたら長押しをキャンセル（通常のスクロールとして扱う）
      if (deltaX > 15 || deltaY > 15) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
        setTouchStartPosition(null);
      }
      // この時点では preventDefault しない → 通常のスクロールが可能
      return;
    }
    
    // ドラッグ中でない場合は何もしない（通常のスクロールを許可）
    if (!isDragging || !draggedItem || !touchDragElement) {
      return;
    }
    
    // ドラッグ中の場合のみ preventDefault
    e.preventDefault();
    e.stopPropagation();
    
    // ドラッグ要素を移動
    const rect = touchDragElement.getBoundingClientRect();
    touchDragElement.style.top = `${touch.clientY - rect.height / 2}px`;
    touchDragElement.style.left = `${Math.max(10, Math.min(touch.clientX - rect.width / 2, window.innerWidth - rect.width - 10))}px`;
    
    // ドロップ位置を判定
    touchDragElement.style.display = 'none';
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    touchDragElement.style.display = 'block';
    
    if (elementBelow) {
      const rankingItem = elementBelow.closest('[id^="ranking-item-"]');
      if (rankingItem) {
        const position = parseInt(rankingItem.id.split('-')[2]);
        if (!isNaN(position) && position !== dragOverPosition) {
          setDragOverPosition(position);
        }
      }
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    // 長押しタイマーをクリア
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // ドラッグ中だった場合の処理
    if (isDragging && draggedItem) {
      e.preventDefault();
      e.stopPropagation();
      
      // 位置変更処理
      if (dragOverPosition && draggedItem.position !== dragOverPosition) {
        try {
          await handlePositionChange(draggedItem.item, dragOverPosition);
        } catch (error) {
          console.error('Failed to change position:', error);
        }
      }
    }
    
    // 状態をリセット
    resetDragState();
  };

  // 初期ハイライトのタイマー処理
  useEffect(() => {
    if (highlightPosition) {
      const timer = setTimeout(() => setHighlightPosition(null), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 順位選択モーダルコンポーネント
  const PositionSelectModal = ({ isOpen, onClose, item, currentPosition, onMove }: {
    isOpen: boolean;
    onClose: () => void;
    item: RankingItem;
    currentPosition: number;
    onMove: (newPosition: number) => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            順位を選択
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            「{item.title}」の新しい順位を選択してください
          </p>
          
          <div className="grid grid-cols-4 gap-2 mb-6">
            {Array.from({ length: 11 }, (_, i) => i + 1).map((pos) => (
              <button
                key={pos}
                onClick={() => {
                  onMove(pos);
                  onClose();
                }}
                className={`p-3 rounded-md text-center font-medium transition-colors ${
                  pos === currentPosition
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ハイライト位置が変更されたらスクロール
  useEffect(() => {
    if (highlightPosition) {
      setTimeout(() => {
        const element = document.getElementById(`ranking-item-${highlightPosition}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [highlightPosition]);

  // クリック外でメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isRankingMenuOpen && !(event.target as Element).closest('.ranking-menu-container')) {
        setIsRankingMenuOpen(false);
      }
      if (openItemMenuId && !(event.target as Element).closest('.item-menu-container')) {
        setOpenItemMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isRankingMenuOpen, openItemMenuId]);


  // グローバルなスクロール防止は削除
  // ドラッグ中のスクロール防止は各タッチイベントハンドラー内で個別に処理

  // カテゴリ削除確認モーダル
  const DeleteCategoryModal = () => {
    if (!showDeleteCategoryModal || !categoryToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            カテゴリを削除しますか？
          </h3>
          
          <div className="mb-6 text-sm text-gray-600">
            <p className="mb-2">
              <span className="font-semibold text-gray-900">
                「{categoryToDelete.name}」
              </span>
              を削除しようとしています。
            </p>
            
            {categoryToDelete.type === 'main' && categoryToDelete.subCategories && categoryToDelete.subCategories.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-yellow-800 font-medium mb-2">
                  以下の小カテゴリも削除されます：
                </p>
                <ul className="list-disc list-inside text-yellow-700">
                  {categoryToDelete.subCategories.map((sub: any) => (
                    <li key={sub.id}>{sub.name}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <p className="mt-4 text-red-600">
              この操作は取り消せません。関連するすべての項目も削除されます。
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteCategoryModal(false);
                setCategoryToDelete(null);
              }}
              className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              キャンセル
            </button>
            <button
              onClick={async () => {
                if (!categoryToDelete) return;
                
                try {
                  if (categoryToDelete.type === 'main') {
                    await handleDeleteMainCategory(categoryToDelete.id);
                  } else {
                    await handleDeleteSubCategory(categoryToDelete.id);
                  }
                  setShowDeleteCategoryModal(false);
                  setCategoryToDelete(null);
                } catch (error) {
                  console.error("Error deleting category:", error);
                }
              }}
              className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    );
  };

  // パンくずリスト生成
  const generateBreadcrumbItems = () => {
    const userName = pageUser.name || `@${pageUser.username}` || "ユーザー";
    const items = [
      {
        name: "すきなものリスト",
        href: "/",
      },
      {
        name: `${userName}のリスト`,
        href: `/u/${pageUser.id}`,
      },
    ];

    if (isMainCategoryView && selectedMainCategory) {
      items.push({
        name: selectedMainCategory,
        current: true,
      });
    } else if (selectedCategory && selectedMainCategory) {
      items.push({
        name: selectedMainCategory,
        href: `/u/${pageUser.id}`,
      });
      items.push({
        name: selectedCategory,
        current: true,
      });
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-300/10 to-indigo-300/10 rounded-full blur-3xl"></div>
      </div>
      <FloatingMenuButton 
        allCategories={allCategories}
        pageUser={pageUser}
        isOwner={isOwner}
        onCategorySelect={handleCategorySelect}
        onMainCategorySelect={handleMainCategorySelect}
        onAddCategory={() => setIsAddCategoryModalOpen(true)}
        onAddSubCategory={(mainCat) => {
          setSelectedMainCategoryForAdd(mainCat);
          setIsAddSubCategoryModalOpen(true);
        }}
        onClearSelection={clearSelectionAndNavigateToTop}
        expandedCategories={expandedCategories}
        setExpandedCategories={setExpandedCategories}
        selectedCategory={selectedCategory}
        isMainCategoryView={isMainCategoryView}
      />
      
      <MainTitle />
      
      <BreadcrumbWrapper pageUser={pageUser} allCategories={allCategories} />


      {/* ハンバーガーメニュー */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black opacity-50 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-lg shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg text-purple-400 hover:text-purple-600 hover:bg-purple-100 transition-all"
                  title="閉じる"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📁</span>
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  フォルダ
                </h2>
              </div>
              {isOwner && (
                <button
                  onClick={() => {
                    setIsAddCategoryModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-1.5 text-sm font-medium"
                  title="新しいフォルダを作成"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>新規</span>
                </button>
              )}
            </div>
            
            
            {allCategories.map((mainCat) => (
              <div key={mainCat.id} className="mb-3">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => {
                        setExpandedCategories(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(mainCat.id)) {
                            newSet.delete(mainCat.id);
                          } else {
                            newSet.add(mainCat.id);
                          }
                          return newSet;
                        });
                      }}
                      className="p-1.5 hover:bg-purple-100 rounded-lg transition-all"
                    >
                      <svg 
                        className={`w-4 h-4 text-purple-500 transform transition-transform ${expandedCategories.has(mainCat.id) ? 'rotate-90' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        handleMainCategorySelect(mainCat);
                        setIsMenuOpen(false);
                      }}
                      className={`flex-1 text-left transition-all px-3 py-2.5 rounded-xl flex items-center gap-2 group-hover:shadow-md transform hover:scale-[1.02] ${
                        isMainCategoryView && selectedMainCategoryId === mainCat.id
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                          : "bg-gradient-to-r from-purple-50 to-pink-50 text-gray-700 hover:from-purple-100 hover:to-pink-100"
                      }`}
                    >
                      <span className="text-base">
                        {expandedCategories.has(mainCat.id) ? '📂' : '⭐'}
                      </span>
                      <span className="font-semibold text-sm truncate">{mainCat.name}</span>
                    </button>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setSelectedMainCategoryForAdd(mainCat);
                        setIsAddSubCategoryModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all transform hover:scale-110 opacity-60 hover:opacity-100"
                      title="サブフォルダを作成"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
                {expandedCategories.has(mainCat.id) && (
                  <div className="ml-6 mt-2 space-y-1 border-l-2 border-purple-200 pl-3">
                    {mainCat.subCategories.map((subCat: any) => (
                      <div key={subCat.id} className="flex items-center group">
                        <button
                          onClick={() => {
                            handleCategorySelect(mainCat.name, subCat.name, subCat.id);
                            setIsMenuOpen(false);
                          }}
                          className={`flex-1 text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 transform hover:scale-[1.02] ${
                            selectedCategory === subCat.name
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                              : "bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 hover:from-blue-100 hover:to-purple-100"
                          }`}
                        >
                          <span className="text-sm">🏷️</span>
                          <span className="text-sm font-medium truncate">{subCat.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ユーザープロフィールセクション */}
        <UserProfileSection 
          pageUser={pageUser}
          categoryCount={allCategories.length}
          itemCount={allCategories.reduce((total, cat) => {
            return total + (cat.subCategories?.reduce((subTotal: number, sub: any) => {
              return subTotal + (sub._count?.rankingItems || 0);
            }, 0) || 0);
          }, 0)}
        />

        <div className="flex gap-8">
          {/* サイドバー（デスクトップ）- ファイラ風デザイン */}
          <div className="hidden lg:block w-80 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 h-fit">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-lg">📁</span>
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  フォルダ
                </h2>
              </div>
              {isOwner && (
                <button
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-1.5 text-sm font-medium"
                  title="新しいフォルダを作成"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>新規</span>
                </button>
              )}
            </div>
            
            
            {allCategories.map((mainCat) => (
              <div key={mainCat.id} className="mb-3">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => {
                        setExpandedCategories(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(mainCat.id)) {
                            newSet.delete(mainCat.id);
                          } else {
                            newSet.add(mainCat.id);
                          }
                          return newSet;
                        });
                      }}
                      className="p-1.5 hover:bg-purple-100 rounded-lg transition-all"
                    >
                      <svg 
                        className={`w-4 h-4 text-purple-500 transform transition-transform ${expandedCategories.has(mainCat.id) ? 'rotate-90' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMainCategorySelect(mainCat)}
                      className={`flex-1 text-left transition-all px-4 py-3 rounded-xl flex items-center gap-3 group-hover:shadow-md transform hover:scale-[1.02] ${
                        isMainCategoryView && selectedMainCategoryId === mainCat.id
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                          : "bg-gradient-to-r from-purple-50 to-pink-50 text-gray-700 hover:from-purple-100 hover:to-pink-100"
                      }`}
                    >
                      <span className="text-lg">
                        ⭐
                      </span>
                      <span className="font-semibold text-sm truncate">{mainCat.name}</span>
                    </button>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setSelectedMainCategoryForAdd(mainCat);
                        setIsAddSubCategoryModalOpen(true);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all transform hover:scale-110 opacity-60 hover:opacity-100"
                      title="サブフォルダを作成"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
                {expandedCategories.has(mainCat.id) && (
                  <div className="ml-8 mt-2 space-y-1 border-l-2 border-gradient-to-b from-purple-200 to-pink-200 pl-4">
                    {mainCat.subCategories.map((subCat: any) => (
                      <div key={subCat.id} className="flex items-center group">
                        <button
                          onClick={() => handleCategorySelect(mainCat.name, subCat.name, subCat.id)}
                          className={`flex-1 text-left px-4 py-2.5 rounded-lg transition-all flex items-center gap-3 transform hover:scale-[1.02] ${
                            selectedCategory === subCat.name
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                              : "bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 hover:from-blue-100 hover:to-purple-100"
                          }`}
                        >
                          <span className="text-sm">🏷️</span>
                          <span className="text-sm font-medium truncate">{subCat.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-6">
                <RankingSkeleton />
              </div>
            ) : !selectedCategory && !isMainCategoryView ? (
              <SummaryView pageUser={pageUser} />
            ) : (
              /* メインコンテンツエリア - 装飾強化 */
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 flex items-center justify-between">
                  {isEditingTitle ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveTitle();
                          }
                          if (e.key === 'Escape') setIsEditingTitle(false);
                        }}
                        className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 outline-none text-gray-900"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          handleSaveTitle();
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsEditingTitle(false)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white text-lg">🏆</span>
                      </div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        {isMainCategoryView ? (
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {selectedMainCategory}
                          </span>
                        ) : (
                          <>
                            <span className="text-sm text-purple-400 font-medium flex items-center gap-1">
                              <span>⭐</span>
                              <span>{selectedMainCategory}</span>
                            </span>
                            <span className="text-purple-300">/</span>
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-1">
                              <span className="text-base">🏷️</span>
                              <span>{selectedCategory}</span>
                            </span>
                          </>
                        )}
                      </h2>
                    </div>
                  )}
                  <div className="relative ranking-menu-container">
                    <button
                      onClick={() => setIsRankingMenuOpen(!isRankingMenuOpen)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                      title="メニュー"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    
                    {isRankingMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleCopyRankingUrl();
                              setIsRankingMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            {copiedRanking ? (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                コピーしました！
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                URLをコピー
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              handleShareRanking();
                              setIsRankingMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            Xで共有
                          </button>
                          {isOwner && (
                            <>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={() => {
                                  const currentTitle = isMainCategoryView 
                                    ? selectedMainCategory 
                                    : selectedCategory;
                                  setEditingTitle(currentTitle);
                                  setIsEditingTitle(true);
                                  setIsRankingMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                タイトルを編集
                              </button>
                            </>
                          )}
                          {isOwner && (
                            <>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                onClick={() => {
                                  // 現在選択されているカテゴリの情報を取得
                                  if (isMainCategoryView) {
                                    const mainCat = allCategories.find(cat => cat.id === selectedMainCategoryId);
                                    if (mainCat) {
                                      setCategoryToDelete({
                                        type: 'main',
                                        id: mainCat.id,
                                        name: mainCat.name,
                                        subCategories: mainCat.subCategories
                                      });
                                    }
                                  } else {
                                    // 小カテゴリの場合、親カテゴリを探す
                                    const targetSubCategory = allCategories.flatMap(cat => 
                                      cat.subCategories.map((sub: any) => ({ ...sub, mainCategoryId: cat.id }))
                                    ).find((sub: any) => sub.id === selectedSubCategoryId);
                                    
                                    if (targetSubCategory) {
                                      setCategoryToDelete({
                                        type: 'sub',
                                        id: targetSubCategory.id,
                                        name: targetSubCategory.name
                                      });
                                    }
                                  }
                                  setShowDeleteCategoryModal(true);
                                  setIsRankingMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                カテゴリを削除
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-purple-100">
                {Array.from({ length: 11 }, (_, index) => {
                  const position = index + 1;
                  
                  // より確実なデータ取得
                  const getCurrentRankings = () => {
                    if (isMainCategoryView && selectedMainCategoryId) {
                      return rankings[`main_${selectedMainCategoryId}`] || {};
                    } else if (!isMainCategoryView && selectedCategory) {
                      return rankings[selectedCategory] || {};
                    }
                    
                    // フォールバック：serverInitialRankingsから直接取得
                    if (serverInitialRankings && 
                        ((isMainCategoryView && serverInitialRankings.categoryId === selectedMainCategoryId) ||
                         (!isMainCategoryView && serverInitialRankings.categoryName === selectedCategory))) {
                      const rankingMap: RankingMap = {};
                      serverInitialRankings.items.forEach((item: any) => {
                        rankingMap[item.position] = item;
                      });
                      return rankingMap;
                    }
                    
                    return {};
                  };
                  
                  const currentRankings = getCurrentRankings();
                  const item = currentRankings[position];
                  
                  return (
                    <div
                      id={`ranking-item-${index + 1}`}
                      key={item?.id || `empty-${index}`}
                      className={`px-3 sm:px-6 py-4 sm:py-5 flex items-center justify-between transition-all duration-300 group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 relative ${
                        highlightPosition === index + 1
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 ring-2 ring-inset ring-purple-400 shadow-lg'
                          : item ? 'hover:shadow-md' : ''
                      }`}
                      // タッチイベントハンドラーを完全に削除
                    >
                      {/* ピン留めバッジ */}
                      {item?.isPinned && (
                        <div className="absolute top-2 right-2 bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                          <span className="text-sm">📌</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
                        {/* ランキング番号（クリック不可） */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md transform transition-all duration-300 ${
                          index === 0 
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 scale-110' 
                            : index === 1 
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 scale-105' 
                            : index === 2 
                            ? 'bg-gradient-to-br from-orange-400 to-amber-600 scale-105' 
                            : 'bg-gradient-to-br from-blue-100 to-blue-200'
                        }`}>
                          {index < 3 ? (
                            <span className="text-2xl" role="img" aria-label={`${index + 1}位`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className={`font-bold ${
                              index < 3 ? 'text-white text-lg' : 'text-blue-700 text-sm'
                            }`}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        
                        {/* コンテンツ部分：装飾強化 */}
                        <div className="flex-1 min-w-0">
                          {item?.url && !item?.isDeleted ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-base sm:text-lg font-semibold block hover:underline transition-all break-words ${
                                item?.isDeleted 
                                  ? "text-gray-400 italic" 
                                  : "text-purple-700 hover:text-purple-800 group-hover:scale-[1.02]"
                              }`}
                            >
                              {item.isPinned && (
                                <span className="text-gray-600" title="ピン留め中">📌</span>
                              )}
                              <span className="break-words">{item.title}</span>
                            </a>
                          ) : (
                            <h3 className={`text-base sm:text-lg font-semibold break-words ${
                              item?.isDeleted 
                                ? "text-gray-400 italic" 
                                : item 
                                ? "text-gray-900 group-hover:text-purple-700 transition-colors"
                                : "text-gray-400"
                            }`}>
                              {item ? (
                                <>
                                  {item.isPinned && (
                                    <span className="text-gray-600" title="ピン留め中">📌</span>
                                  )}
                                  <span className="break-words">{item.title}</span>
                                </>
                              ) : (
                                <span className="italic">空きスロット</span>
                              )}
                            </h3>
                          )}
                          {item?.description && !item?.isDeleted && (
                            <p className="text-sm text-gray-600 truncate mt-1 group-hover:text-gray-700 transition-colors overflow-hidden">
                              {item.description}
                            </p>
                          )}
                          {item?.sourceSubCategoryName && item?.sourceSubCategoryId && !item?.isDeleted && (
                            <button
                              onClick={() => {
                                // メインカテゴリを探す
                                const targetSubCategory = allCategories.flatMap(cat => 
                                  cat.subCategories.map((sub: any) => ({ ...sub, mainCategoryName: cat.name }))
                                ).find((sub: any) => sub.id === item.sourceSubCategoryId);
                                
                                if (targetSubCategory) {
                                  handleCategorySelect(
                                    targetSubCategory.mainCategoryName, 
                                    targetSubCategory.name, 
                                    targetSubCategory.id
                                  );
                                }
                              }}
                              className="text-xs text-blue-600 mt-1 hover:text-blue-700 hover:underline"
                            >
                              {item.sourceSubCategoryName} {position}位
                            </button>
                          )}
                          {item?.images && item.images.length > 0 && !item?.isDeleted && (
                            <div className="mt-3">
                              <div 
                                className="relative overflow-hidden rounded-xl border-2 border-purple-200 w-32 h-32 cursor-pointer hover:border-purple-400 transition-all transform hover:scale-105 shadow-md hover:shadow-lg group/image"
                                onClick={() => setSelectedImageModal({url: item.images[0].url, alt: `${item.title} - 画像`})}
                              >
                                <Image
                                  src={item.images[0].url}
                                  alt={`${item.title} - 画像`}
                                  fill
                                  className="object-cover group-hover/image:scale-110 transition-transform duration-300"
                                  sizes="(max-width: 768px) 128px, 128px"
                                  unoptimized
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-2 right-2 text-white opacity-0 group-hover/image:opacity-100 transition-opacity">
                                  <span className="text-xs bg-black/50 rounded px-1">🔍</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {item ? (
                        <div className="relative item-menu-container ml-2">
                          <button
                            onClick={() => {
                              const menuId = `item-${item.id}`;
                              setOpenItemMenuId(openItemMenuId === menuId ? null : menuId);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            title="メニュー"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {openItemMenuId === `item-${item.id}` && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                              <div className="py-1">
                                {isOwner && (
                                  <>
                                    {!item.isDeleted && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setSelectedItemForMove({ item, position });
                                            setOpenItemMenuId(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                          </svg>
                                          順位を変更
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedItemForEdit(item);
                                            setIsEditRankingItemModalOpen(true);
                                            setOpenItemMenuId(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                          編集
                                        </button>
                                        <button
                                          onClick={() => {
                                            handleTogglePin(item);
                                            setOpenItemMenuId(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <svg className="w-4 h-4" fill={item.isPinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                          </svg>
                                          {item.isPinned ? "ピン留めを解除" : "ピン留め"}
                                        </button>
                                      </>
                                    )}
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    handleShareItem(item, index + 1);
                                    setOpenItemMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                  </svg>
                                  Xで共有
                                </button>
                                {isOwner && (
                                  <button
                                    onClick={() => {
                                      handleDeleteRankingItem(
                                        item.id.toString(),
                                        item.isReference || false,
                                        item.referenceId
                                      );
                                      setOpenItemMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    削除
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : isOwner ? (
                        <button
                          onClick={() => {
                            setTargetPosition(index + 1);
                            setIsAddRankingItemModalOpen(true);
                          }}
                          className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-110 ml-2 opacity-60 group-hover:opacity-100"
                          title={`${index + 1}位に好きなものを追加 ✨`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* モーダル */}
      {isAddCategoryModalOpen && (
        <AddCategoryModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onAdd={async (mainCategory: string, subCategories: string[]) => {
            try {
              const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  mainCategoryName: mainCategory,
                  subCategories: subCategories
                }),
              });

              if (response.ok) {
                // カテゴリリストを再取得
                const categoriesResponse = await fetch(`/api/categories?userId=${pageUser.id}`);
                if (categoriesResponse.ok) {
                  const data = await categoriesResponse.json();
                  setAllCategories(data.userCategories || []);
                }
              } else {
                const errorText = await response.text();
                console.error("Failed to add category:", response.status, errorText);
              }
            } catch (error) {
              console.error("Error adding category:", error);
            }
          }}
        />
      )}

      {isAddSubCategoryModalOpen && selectedMainCategoryForAdd && (
        <AddSubCategoryModal
          isOpen={isAddSubCategoryModalOpen}
          onClose={() => setIsAddSubCategoryModalOpen(false)}
          mainCategoryId={selectedMainCategoryForAdd.id}
          mainCategoryName={selectedMainCategoryForAdd.name}
          onAdd={async (subCategoryName: string) => {
            try {
              const response = await fetch(`/api/categories/${selectedMainCategoryForAdd.id}/subcategories`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: subCategoryName
                }),
              });

              if (response.ok) {
                // カテゴリリストを再取得
                const categoriesResponse = await fetch(`/api/categories?userId=${pageUser.id}`);
                if (categoriesResponse.ok) {
                  const data = await categoriesResponse.json();
                  setAllCategories(data.userCategories || []);
                }
              } else {
                const errorText = await response.text();
                console.error("Failed to add subcategory:", response.status, errorText);
              }
            } catch (error) {
              console.error("Error adding subcategory:", error);
            }
          }}
        />
      )}

      {isAddRankingItemModalOpen && (
        <AddRankingItemModal
          isOpen={isAddRankingItemModalOpen}
          onClose={() => setIsAddRankingItemModalOpen(false)}
          categoryName={isMainCategoryView ? selectedMainCategory : selectedCategory}
          isMainCategoryView={isMainCategoryView}
          subCategories={isMainCategoryView ? allCategories.find(cat => cat.id === selectedMainCategoryId)?.subCategories : undefined}
          onAdd={async (title: string, description: string, url?: string, subCategoryId?: string, existingItemId?: string, imageUrl?: string) => {
            
            const requestBody = {
              title,
              description,
              url,
              position: targetPosition,
              subCategoryId: isMainCategoryView && existingItemId ? subCategoryId : (!isMainCategoryView ? selectedSubCategoryId : undefined),
              mainCategoryId: isMainCategoryView ? selectedMainCategoryId : undefined,
              existingItemId
            };
            
            
            try {
              const response = await fetch('/api/rankings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
              });

              if (response.ok) {
                
                // 画像が指定されている場合は保存
                if (imageUrl && imageUrl.trim() && !existingItemId) {
                  const responseData = await response.json();
                  const newItemId = responseData.id;
                  
                  if (newItemId) {
                    try {
                      const imageResponse = await fetch(`/api/rankings/${newItemId}/images`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ images: [imageUrl.trim()] }),
                      });
                      
                      if (!imageResponse.ok) {
                        console.error('Failed to save image:', await imageResponse.text());
                      }
                    } catch (imageError) {
                      console.error('Error saving image:', imageError);
                    }
                  }
                }
                
                // ランキングを再取得
                if (isMainCategoryView) {
                  fetchMainCategoryRankings(selectedMainCategoryId);
                } else {
                  const rankingResponse = await fetch(`/api/rankings?subCategoryId=${selectedSubCategoryId}&userId=${pageUser.id}`);
                  if (rankingResponse.ok) {
                    const items = await rankingResponse.json();
                    const rankingMap: RankingMap = {};
                    items.forEach((item: any) => {
                      const position = item.position || Object.keys(rankingMap).length + 1;
                      rankingMap[position] = {
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        url: item.url,
                        images: item.images,
                        isPinned: item.isPinned
                      };
                    });
                    setRankings(prev => ({
                      ...prev,
                      [selectedCategory]: rankingMap
                    }));
                  }
                }
              } else {
                const errorText = await response.text();
                console.error('Failed to add ranking item:', response.status, errorText);
              }
            } catch (error) {
              console.error('Error adding ranking item:', error);
            }
          }}
        />
      )}

      {isEditRankingItemModalOpen && selectedItemForEdit && (
        <EditRankingItemModal
          isOpen={isEditRankingItemModalOpen}
          onClose={() => setIsEditRankingItemModalOpen(false)}
          item={selectedItemForEdit}
          totalItems={Object.keys(isMainCategoryView ? rankings[`main_${selectedMainCategoryId}`] || {} : rankings[selectedCategory] || {}).length}
          onSave={handleEditItem}
        />
      )}

      {/* 順位選択モーダル */}
      {selectedItemForMove && (
        <PositionSelectModal
          isOpen={!!selectedItemForMove}
          onClose={() => setSelectedItemForMove(null)}
          item={selectedItemForMove.item}
          currentPosition={selectedItemForMove.position}
          onMove={(newPosition) => {
            handlePositionChange(selectedItemForMove.item, newPosition);
            setSelectedItemForMove(null);
          }}
        />
      )}

      {/* カテゴリ削除確認モーダル */}
      <DeleteCategoryModal />

      {/* 画像モーダル */}
      {selectedImageModal && (
        <ImageModal
          isOpen={!!selectedImageModal}
          onClose={() => setSelectedImageModal(null)}
          imageUrl={selectedImageModal.url}
          alt={selectedImageModal.alt}
        />
      )}
    </div>
  );
}