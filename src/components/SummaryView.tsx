"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type SummaryItem = {
  id: string | number;
  title: string;
  description?: string;
  url?: string;
  position?: number;
  isPinned?: boolean;
  images?: { id: string; url: string; order: number }[];
  updatedAt: string;
  category: {
    main: string;
    sub: string;
    mainId: string;
    subId: string;
  };
};

type User = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
};

interface SummaryViewProps {
  pageUser: User;
}

export default function SummaryView({ pageUser }: SummaryViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"recent" | "pinned">("pinned");
  const [items, setItems] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummaryData = async (type: "recent" | "pinned") => {
    setLoading(true);
    try {
      const limit = type === "recent" ? 10 : undefined;
      const url = `/api/summary?userId=${pageUser.id}&type=${type}${limit ? `&limit=${limit}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData(activeTab);
  }, [activeTab, pageUser.id]);

  const handleItemClick = (item: SummaryItem) => {
    // 小カテゴリがある場合は小カテゴリページへ、ない場合は大カテゴリページへ遷移
    const params = new URLSearchParams();
    
    if (item.category.subId) {
      // 小カテゴリページへの遷移
      params.set('mainCategory', item.category.main);
      params.set('subCategory', item.category.sub);
      params.set('subCategoryId', item.category.subId);
    } else {
      // 大カテゴリページへの遷移
      params.set('mainCategoryId', item.category.mainId);
      params.set('mainCategory', item.category.main);
      params.set('view', 'main');
    }
    
    router.push(`/u/${pageUser.id}?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "今日";
    } else if (diffDays === 1) {
      return "昨日";
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-lg">🏆</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              すべての好きなものリスト
            </h2>
          </div>
        </div>

        {/* タブ */}
        <div className="flex space-x-1 bg-white/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("pinned")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "pinned"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-purple-700 hover:bg-white/50"
            }`}
          >
            📌 ピン留め
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === "recent"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-purple-700 hover:bg-white/50"
            }`}
          >
            ⏰ 最新更新
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="divide-y divide-purple-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">読み込み中...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">
                {activeTab === "recent" ? "📝" : "📌"}
              </span>
            </div>
            <p className="text-gray-500">
              {activeTab === "recent" 
                ? "まだアイテムが登録されていません" 
                : "ピン留めされたアイテムがありません"
              }
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="mx-4 mb-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-lg cursor-pointer transition-all duration-200 group transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">

                {/* 画像 - より大きく */}
                {item.images && item.images.length > 0 && (
                  <div className="flex-shrink-0 w-16 h-16 relative rounded-xl overflow-hidden shadow-md border-2 border-white">
                    <Image
                      src={item.images[0].url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                )}

                {/* アイテム情報 - 整理された表示 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {item.isPinned && (
                      <span className="text-amber-500" title="ピン留め中">📌</span>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words group-hover:text-purple-700 transition-colors">
                      {item.title}
                    </h3>
                    {item.url && (
                      <div className="px-2 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        🔗 リンク
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm">
                      <span className="text-purple-600 font-medium">{item.category.main}</span>
                      {item.category.sub !== "全般" && (
                        <>
                          <span className="text-gray-400 mx-1">＞</span>
                          <span className="text-pink-600 font-medium">{item.category.sub}</span>
                        </>
                      )}
                    </span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {item.position || 1}位
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed break-words">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* 更新日時 - ピン留めタブでは非表示 */}
                {activeTab !== "pinned" && (
                  <div className="flex-shrink-0 ml-4">
                    <div className="text-xs text-gray-400 text-center">
                      {formatDate(item.updatedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}