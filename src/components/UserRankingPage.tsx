"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import AddCategoryModal from "@/components/AddCategoryModal";
import AddSubCategoryModal from "@/components/AddSubCategoryModal";
import AddRankingItemModal from "@/components/AddRankingItemModal";
import EditRankingItemModal from "@/components/EditRankingItemModal";

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
};

type RankingMap = {
  [position: number]: RankingItem;
};

type Rankings = {
  [key in Category]: RankingMap;
};

const initialRankings: Rankings = {};

export default function UserRankingPage({ pageUser }: { pageUser: PageUser }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  
  // 現在のユーザーがページの所有者かどうか
  const isOwner = session?.user && (session.user as any).userId === pageUser.id;

  const [selectedCategory, setSelectedCategory] = useState<Category>("");
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory>("");
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string>("");
  const [isMainCategoryView, setIsMainCategoryView] = useState(false);
  const [rankings, setRankings] = useState<Rankings>(initialRankings);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSubCategoryModalOpen, setIsAddSubCategoryModalOpen] = useState(false);
  const [isAddRankingItemModalOpen, setIsAddRankingItemModalOpen] = useState(false);
  const [isEditRankingItemModalOpen, setIsEditRankingItemModalOpen] = useState(false);
  const [selectedMainCategoryForAdd, setSelectedMainCategoryForAdd] = useState<any>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<any>(null);
  const [userCategories, setUserCategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [targetPosition, setTargetPosition] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [highlightPosition, setHighlightPosition] = useState<number | null>(null);
  const [copiedRanking, setCopiedRanking] = useState(false);
  const [sharedRanking, setSharedRanking] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [isRankingMenuOpen, setIsRankingMenuOpen] = useState(false);
  const [openItemMenuId, setOpenItemMenuId] = useState<string | null>(null);

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
            referenceId: item.referenceId
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

  // カテゴリ取得処理（特定ユーザーのカテゴリを取得）
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/categories?userId=${pageUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setAllCategories(data.userCategories || []);
          // 全カテゴリを展開状態にする
          const allCategoryIds = new Set((data.userCategories || []).map((cat: any) => cat.id));
          setExpandedCategories(allCategoryIds);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [pageUser.id]);

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

  const handleDeleteRankingItem = async (itemId: string) => {
    if (!confirm("この項目を削除しますか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/rankings/${itemId}`, {
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

  // URLパラメータから初期状態を復元
  useEffect(() => {
    if (!isInitialized && allCategories.length > 0) {
      const mainCategoryId = searchParams.get('mainCategoryId');
      const mainCategory = searchParams.get('mainCategory');
      const subCategory = searchParams.get('subCategory');
      const subCategoryId = searchParams.get('subCategoryId');
      const view = searchParams.get('view');
      const highlight = searchParams.get('highlight');

      if (view === 'main' && mainCategoryId && mainCategory) {
        // 大カテゴリビューを復元
        const mainCat = allCategories.find(cat => cat.id === mainCategoryId);
        if (mainCat) {
          handleMainCategorySelect(mainCat);
        }
      } else if (subCategoryId && subCategory && mainCategory) {
        // 小カテゴリビューを復元
        const mainCat = allCategories.find(cat => cat.name === mainCategory);
        if (mainCat) {
          const subCat = mainCat.subCategories.find((sub: any) => sub.id === subCategoryId);
          if (subCat) {
            handleCategorySelect(mainCategory, subCategory, subCategoryId);
          }
        }
      }
      
      // ハイライト位置を設定
      if (highlight) {
        const position = parseInt(highlight);
        if (!isNaN(position)) {
          setHighlightPosition(position);
          // 3秒後にハイライトを解除
          setTimeout(() => setHighlightPosition(null), 3000);
        }
      }
      
      setIsInitialized(true);
    }
  }, [allCategories, searchParams, isInitialized]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <img
                    src={pageUser.image || `https://unavatar.io/twitter/${pageUser.username}`}
                    alt={`@${pageUser.username}`}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      // 画像の読み込みに失敗した場合はフォールバック
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                    onLoad={() => {
                    }}
                  />
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ display: 'none' }}>
                    {(pageUser.username || pageUser.name || 'U').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>{pageUser.name || `@${pageUser.username}`} の</span>
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-extrabold" style={{ fontFamily: 'var(--font-fredoka)' }}>
                      好きなものリスト
                    </span>
                  </h1>
                  {pageUser.name && (
                    <p className="text-sm text-gray-500">
                      @{pageUser.username}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* ログイン/ログアウトボタン */}
              {status === "authenticated" ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-white/50 transition-all"
                  >
                    {session?.user?.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name || ''}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                      <button
                        onClick={() => {
                          router.push(`/u/${(session.user as any).userId}`);
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        マイリスト
                      </button>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        ログアウト
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signIn("twitter")}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Xでログイン
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ハンバーガーメニュー */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black opacity-50 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto transform transition-transform duration-300 ease-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
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
                <h2 className="text-xl font-bold text-gray-900">
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
                      className="p-1 hover:bg-gray-100 rounded"
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
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all"
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
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          <div className="hidden lg:block w-80 bg-white rounded-lg shadow p-6 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
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
                      className="p-1 hover:bg-gray-100 rounded"
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
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all"
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
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  カテゴリを選択してください
                </h2>
                <p className="text-gray-600">
                  左のサイドバーからカテゴリを選択すると、好きなものリストが表示されます。
                </p>
              </div>
            ) : (
              /* 既存のランキング表示 */
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
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
                        className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 outline-none text-gray-900"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          // handleSaveTitle();
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
                    <h2 className="text-xl font-semibold text-gray-900">
                      {isMainCategoryView ? selectedMainCategory : selectedCategory}
                    </h2>
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
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
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
                          ? 'bg-blue-50 ring-2 ring-inset ring-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item ? item.title : "―"}
                          </h3>
                          {item?.description && (
                            <p className="text-sm text-gray-500 truncate">
                              {item.description}
                            </p>
                          )}
                          {item?.sourceSubCategoryName && item?.sourceSubCategoryId && (
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
                              {item.sourceSubCategoryName}
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
                                        handleDeleteRankingItem(item.id);
                                        setOpenItemMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
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
          onAdd={async (title: string, description: string, subCategoryId?: string, existingItemId?: string) => {
            try {
              const response = await fetch('/api/rankings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  title,
                  description,
                  position: targetPosition,
                  subCategoryId: isMainCategoryView ? subCategoryId : selectedSubCategoryId,
                  mainCategoryId: isMainCategoryView ? selectedMainCategoryId : undefined,
                  existingItemId
                }),
              });

              if (response.ok) {
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