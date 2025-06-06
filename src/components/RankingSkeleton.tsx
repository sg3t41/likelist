export default function RankingSkeleton() {
  return (
    <div className="space-y-4">
      {/* ヘッダースケルトン */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      </div>

      {/* ランキング項目スケルトン */}
      {[1, 2, 3, 4, 5].map((position) => (
        <div key={position} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* 順位 */}
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 animate-pulse">
            {/* タイトル */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            
            {/* 説明 */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>

            {/* 画像スケルトン */}
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>

          {/* メニューボタン */}
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}