"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AddCategoryModal from "@/components/AddCategoryModal";
import AddSubCategoryModal from "@/components/AddSubCategoryModal";
import AddRankingItemModal from "@/components/AddRankingItemModal";
import EditRankingItemModal from "@/components/EditRankingItemModal";
import UserRankingHeader from "@/components/UserRankingHeader";

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
  position?: number;
  sourceSubCategoryName?: string;
  sourceSubCategoryId?: string;
  isReference?: boolean;
  referenceId?: string;
  isDeleted?: boolean;
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

  // 初期状態をサーバーから受け取った値で設定
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialSelection?.subCategory || "");
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
  const [draggedItem, setDraggedItem] = useState<{ item: RankingItem; position: number } | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const [touchDragElement, setTouchDragElement] = useState<HTMLElement | null>(null);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // 緊急時のドラッグ状態リセット関数
  const resetDragState = () => {
    setDraggedItem(null);
    setDragOverPosition(null);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    if (touchDragElement && document.body.contains(touchDragElement)) {
      document.body.removeChild(touchDragElement);
      setTouchDragElement(null);
    }
  };

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    router.push(`/u/${pageUser.id}?${newParams.toString()}`);
  };

  const handleCategorySelect = async (mainCat: MainCategory, subCat: Category, subCatId: string) => {
    setSelectedMainCategory(mainCat);
    setSelectedCategory(subCat);
    setSelectedSubCategoryId(subCatId);
    setIsMainCategoryView(false);
    setIsMenuOpen(false);
    
    // URLを更新
    updateURL({
      mainCategory: mainCat,
      subCategory: subCat,
      subCategoryId: subCatId
    });
    
    // 小カテゴリのランキングを取得
    try {
      const response = await fetch(`/api/rankings?subCategoryId=${subCatId}&userId=${pageUser.id}`);
      if (response.ok) {
        const items = await response.json();
        const rankingMap: RankingMap = {};
        items.forEach((item: any) => {
          const position = item.position || Object.keys(rankingMap).length + 1;
          rankingMap[position] = {
            id: item.id,
            title: item.title,
            description: item.description
          };
        });
        setRankings(prev => ({
          ...prev,
          [subCat]: rankingMap
        }));
      }
    } catch (error) {
      console.error("Error fetching subcategory rankings:", error);
    }
  };

  const handleMainCategorySelect = (mainCat: any) => {
    setSelectedMainCategory(mainCat.name);
    setSelectedMainCategoryId(mainCat.id);
    setSelectedCategory("");
    setIsMainCategoryView(true);
    setIsMenuOpen(false);
    
    // URLを更新
    updateURL({
      mainCategoryId: mainCat.id,
      mainCategory: mainCat.name,
      view: 'main'
    });
    
    fetchMainCategoryRankings(mainCat.id);
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
            sourceSubCategoryName: item.sourceSubCategoryName,
            sourceSubCategoryId: item.sourceSubCategoryId,
            isReference: item.isReference,
            referenceId: item.referenceId,
            isDeleted: item.isDeleted
          };
        });
        setRankings({
          ...rankings,
          [`main_${mainCategoryId}`]: rankingMap
        });
      }
    } catch (error) {
      console.error("Error fetching main category rankings:", error);
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
                description: item.description
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
                description: item.description
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

  const handleEditItem = async (id: string, title: string, description: string, position?: number) => {
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
                description: item.description
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

  const handleDrop = async (e: React.DragEvent, dropPosition: number) => {
    e.preventDefault();
    setDragOverPosition(null);

    console.log("handleDrop:", { draggedItem, dropPosition });

    if (!draggedItem || draggedItem.position === dropPosition) {
      setDraggedItem(null);
      return;
    }

    // 順位を入れ替える
    console.log("Changing position from", draggedItem.position, "to", dropPosition);
    await handlePositionChange(draggedItem.item, dropPosition);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverPosition(null);
  };

  // タッチイベントのハンドラー
  const handleTouchStart = (e: React.TouchEvent, item: RankingItem, position: number) => {
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    
    // 長押しでドラッグ開始
    const timer = setTimeout(() => {
      setDraggedItem({ item, position });
      
      // ドラッグ中の要素を作成
      const element = e.currentTarget as HTMLElement;
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.top = `${touch.clientY - 40}px`;
      clone.style.left = '10px';
      clone.style.right = '10px';
      clone.style.zIndex = '1000';
      clone.style.opacity = '0.8';
      clone.style.pointerEvents = 'none';
      clone.classList.add('shadow-lg');
      document.body.appendChild(clone);
      setTouchDragElement(clone);
      
      // 振動フィードバック（対応デバイスのみ）
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 300); // 300ms長押し
    
    setLongPressTimer(timer);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    // 長押し中でない場合はスクロールを許可
    if (!draggedItem) {
      if (longPressTimer && Math.abs(touch.clientY - touchStartY) > 10) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      return;
    }
    
    // ドラッグ要素を移動
    if (touchDragElement) {
      touchDragElement.style.top = `${touch.clientY - 40}px`;
      
      // タッチ位置の要素を取得
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elementBelow) {
        const rankingItem = elementBelow.closest('[id^="ranking-item-"]');
        if (rankingItem) {
          const position = parseInt(rankingItem.id.split('-')[2]);
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
    
    // ドラッグ要素を削除
    if (touchDragElement) {
      try {
        if (document.body.contains(touchDragElement)) {
          document.body.removeChild(touchDragElement);
        }
      } catch (error) {
        console.warn('Failed to remove touch drag element:', error);
      }
      setTouchDragElement(null);
    }
    
    // 位置変更処理
    if (draggedItem && dragOverPosition && draggedItem.position !== dragOverPosition) {
      await handlePositionChange(draggedItem.item, dragOverPosition);
    }
    
    // 必ずドラッグ状態をクリア（少し遅延させて確実に）
    setTimeout(() => {
      setDraggedItem(null);
      setDragOverPosition(null);
    }, 50);
  };

  // 初期ハイライトのタイマー処理
  useEffect(() => {
    if (highlightPosition) {
      const timer = setTimeout(() => setHighlightPosition(null), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

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

  // タッチドラッグのクリーンアップ
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // ページが非表示になった時にドラッグ状態をリセット
        resetDragState();
      }
    };

    // スクロールが無効になった場合の緊急リセット
    const handleTouchStart = () => {
      if (draggedItem && !touchDragElement) {
        // ドラッグ状態なのにドラッグ要素がない場合はリセット
        resetDragState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleTouchStart);
      // コンポーネントアンマウント時に確実にドラッグ状態をリセット
      resetDragState();
    };
  }, [draggedItem, longPressTimer, touchDragElement, resetDragState]);

  // ドラッグ中のタッチムーブイベントでスクロール防止
  useEffect(() => {
    let preventScrollHandler: ((e: TouchEvent) => void) | null = null;

    if (draggedItem && touchDragElement) {
      // ドラッグ要素が存在する場合のみスクロールを防止
      preventScrollHandler = (e: TouchEvent) => {
        e.preventDefault();
      };
      
      document.addEventListener('touchmove', preventScrollHandler, { passive: false });
    }
    
    return () => {
      if (preventScrollHandler) {
        document.removeEventListener('touchmove', preventScrollHandler);
      }
    };
  }, [draggedItem, touchDragElement]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UserRankingHeader
        pageUser={pageUser}
        currentUser={currentUser}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      {/* ハンバーガーメニュー */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black opacity-50 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto transform transition-transform duration-300 ease-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  カテゴリー
                </h2>
              </div>
              {isOwner && (
                <button
                  onClick={() => {
                    setIsAddCategoryModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 text-sm font-medium"
                  title="大カテゴリを追加"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>追加</span>
                </button>
              )}
            </div>
            {allCategories.map((mainCat) => (
              <div key={mainCat.id} className="mb-4">
                <div className="flex items-center justify-between">
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
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <svg 
                        className={`w-4 h-4 text-gray-500 transform transition-transform ${expandedCategories.has(mainCat.id) ? 'rotate-90' : ''}`}
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
                      className={`flex-1 text-left text-lg font-semibold transition-colors px-4 py-2 rounded-md ${
                        isMainCategoryView && selectedMainCategoryId === mainCat.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {mainCat.name}
                    </button>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setSelectedMainCategoryForAdd(mainCat);
                        setIsAddSubCategoryModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
                      title="小カテゴリを追加"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
                {expandedCategories.has(mainCat.id) && (
                  <div className="ml-5 mt-2 space-y-1">
                    {mainCat.subCategories.map((subCat: any) => (
                      <div key={subCat.id} className="flex items-center">
                        <span className="mr-2 text-gray-400">└</span>
                        <button
                          onClick={() => {
                            handleCategorySelect(mainCat.name, subCat.name, subCat.id);
                            setIsMenuOpen(false);
                          }}
                          className={`flex-1 text-left px-4 py-2 rounded-md transition-colors ${
                            selectedCategory === subCat.name
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {subCat.name}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* サイドバー（デスクトップ） */}
          <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                カテゴリー
              </h2>
              {isOwner && (
                <button
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 text-sm font-medium"
                  title="大カテゴリを追加"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>追加</span>
                </button>
              )}
            </div>
            
            {allCategories.map((mainCat) => (
              <div key={mainCat.id} className="mb-4">
                <div className="flex items-center justify-between">
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
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <svg 
                        className={`w-4 h-4 text-gray-500 transform transition-transform ${expandedCategories.has(mainCat.id) ? 'rotate-90' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMainCategorySelect(mainCat)}
                      className={`flex-1 text-left text-lg font-semibold transition-colors px-4 py-2 rounded-md ${
                        isMainCategoryView && selectedMainCategoryId === mainCat.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {mainCat.name}
                    </button>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setSelectedMainCategoryForAdd(mainCat);
                        setIsAddSubCategoryModalOpen(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
                      title="小カテゴリを追加"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
                {expandedCategories.has(mainCat.id) && (
                  <div className="ml-5 mt-2 space-y-1">
                    {mainCat.subCategories.map((subCat: any) => (
                      <div key={subCat.id} className="flex items-center">
                        <span className="mr-2 text-gray-400">└</span>
                        <button
                          onClick={() => handleCategorySelect(mainCat.name, subCat.name, subCat.id)}
                          className={`flex-1 text-left px-4 py-2 rounded-md transition-colors ${
                            selectedCategory === subCat.name
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {subCat.name}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1">
            {!selectedCategory && !isMainCategoryView ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  カテゴリを選択してください
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  左のサイドバーからカテゴリを選択すると、好きなものリストが表示されます。
                </p>
              </div>
            ) : (
              /* 既存のランキング表示 */
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  {isEditingTitle ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            // handleSaveTitle();
                          }
                          if (e.key === 'Escape') setIsEditingTitle(false);
                        }}
                        className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 outline-none text-gray-900 dark:text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          // handleSaveTitle();
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsEditingTitle(false)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {isMainCategoryView ? selectedMainCategory : selectedCategory}
                    </h2>
                  )}
                  <div className="relative ranking-menu-container">
                    <button
                      onClick={() => setIsRankingMenuOpen(!isRankingMenuOpen)}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-md"
                      title="メニュー"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    
                    {isRankingMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleCopyRankingUrl();
                              setIsRankingMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
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
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            Xで共有
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from({ length: 11 }, (_, index) => {
                  const position = index + 1;
                  const currentRankings = isMainCategoryView 
                    ? rankings[`main_${selectedMainCategoryId}`] || {}
                    : rankings[selectedCategory] || {};
                  
                  // 順位に対応するアイテムを取得
                  const item = currentRankings[position];
                  
                  return (
                    <div
                      id={`ranking-item-${index + 1}`}
                      key={item?.id || `empty-${index}`}
                      className={`px-6 py-4 flex items-center justify-between transition-all duration-300 ${
                        highlightPosition === index + 1
                          ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-inset ring-blue-500 dark:ring-blue-400'
                          : dragOverPosition === position
                          ? 'bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-blue-500'
                          : ''
                      } ${item && isOwner && !item.isDeleted ? 'cursor-move touch-none' : ''} ${
                        draggedItem?.position === position ? 'opacity-50' : ''
                      } ${
                        draggedItem && !touchDragElement && draggedItem.position === position ? 'scale-105' : ''
                      }`}
                      draggable={!!(item && isOwner && !item.isDeleted)}
                      onDragStart={(e) => item && !item.isDeleted && handleDragStart(e, item, position)}
                      onDragOver={(e) => handleDragOver(e, position)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, position)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => {
                        // 長押しでのみドラッグ開始するため、通常のタッチは素通し
                        if (item && isOwner && !item.isDeleted) {
                          handleTouchStart(e, item, position);
                        }
                      }}
                      onTouchMove={(e) => {
                        // ドラッグ中のみ処理、通常スクロールは阻害しない
                        if (draggedItem) {
                          handleTouchMove(e);
                        }
                      }}
                      onTouchEnd={(e) => {
                        // ドラッグ中またはタイマー実行中のみ処理
                        if (draggedItem || longPressTimer) {
                          handleTouchEnd(e);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-medium truncate ${
                            item?.isDeleted 
                              ? "text-gray-400 dark:text-gray-600 italic" 
                              : "text-gray-900 dark:text-white"
                          }`}>
                            {item ? item.title : "―"}
                          </h3>
                          {item?.description && !item?.isDeleted && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
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
                              className="text-xs text-blue-600 dark:text-blue-400 mt-1 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                            >
{item.sourceSubCategoryName} {position}位
                            </button>
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
                            className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-md"
                            title="メニュー"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {openItemMenuId === `item-${item.id}` && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                              <div className="py-1">
                                {isOwner && (
                                  <>
                                    {!item.isDeleted && (
                                      <button
                                        onClick={() => {
                                          setSelectedItemForEdit(item);
                                          setIsEditRankingItemModalOpen(true);
                                          setOpenItemMenuId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        編集
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        handleDeleteRankingItem(
                                          item.id.toString(),
                                          item.isReference || false,
                                          item.referenceId
                                        );
                                        setOpenItemMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      削除
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    handleShareItem(item, index + 1);
                                    setOpenItemMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                  </svg>
                                  Xで共有
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : isOwner ? (
                        <button
                          onClick={() => {
                            console.log("Plus button clicked for position:", index + 1);
                            console.log("Current state:", { selectedCategory, selectedMainCategory, isMainCategoryView, selectedSubCategoryId, selectedMainCategoryId });
                            setTargetPosition(index + 1);
                            setIsAddRankingItemModalOpen(true);
                          }}
                          className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all ml-2"
                          title={`${index + 1}位に項目を追加`}
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
            console.log("Adding category:", { mainCategory, subCategories });
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
                console.log("Category added successfully");
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
            console.log("Adding subcategory:", { subCategoryName, mainCategoryId: selectedMainCategoryForAdd.id });
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
                console.log("Subcategory added successfully");
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
          onAdd={async (title: string, description: string, subCategoryId?: string, existingItemId?: string) => {
            console.log("onAdd called with:", { title, description, subCategoryId, existingItemId, targetPosition, isMainCategoryView, selectedMainCategoryId, selectedSubCategoryId });
            
            const requestBody = {
              title,
              description,
              position: targetPosition,
              subCategoryId: isMainCategoryView && existingItemId ? subCategoryId : (!isMainCategoryView ? selectedSubCategoryId : undefined),
              mainCategoryId: isMainCategoryView ? selectedMainCategoryId : undefined,
              existingItemId
            };
            
            console.log("Sending request body:", requestBody);
            
            try {
              const response = await fetch('/api/rankings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
              });

              console.log("API response status:", response.status);
              if (response.ok) {
                console.log("API call successful, refreshing rankings");
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
                        description: item.description
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
    </div>
  );
}