"use client";

interface CategoryNotFoundPageProps {
  categoryType: 'main' | 'sub';
  categoryName?: string;
  userId: string;
}

export default function CategoryNotFoundPage({ 
  categoryType, 
  categoryName, 
  userId 
}: CategoryNotFoundPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-md w-full space-y-8 p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl mx-4">
        <div className="text-center">
          {/* アイコン */}
          <div className="mx-auto w-20 h-20 mb-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl">📂</span>
          </div>
          
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-4">
            カテゴリが見つかりません
          </h2>
          
          <div className="space-y-4 text-gray-600">
            <p className="text-lg">
              {categoryType === 'main' ? 'メインカテゴリ' : 'サブカテゴリ'}
              {categoryName && (
                <>
                  「<span className="font-semibold text-gray-800">{categoryName}</span>」
                </>
              )}
              が存在しないか、削除されています。
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-blue-800 mb-2">考えられる原因：</p>
              <ul className="text-blue-700 space-y-1">
                <li>• カテゴリが削除されました</li>
                <li>• URLが間違っています</li>
                <li>• アクセス権限がありません</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <a
            href={`/u/${userId}`}
            className="w-full flex justify-center items-center gap-3 px-6 py-3 text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="text-xl">🏠</span>
            ユーザーページに戻る
          </a>
          
          <a
            href="/"
            className="w-full flex justify-center items-center gap-3 px-6 py-3 text-base font-medium rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transform hover:scale-[1.02] transition-all duration-200"
          >
            <span className="text-xl">🔙</span>
            トップページに戻る
          </a>
        </div>
      </div>
    </div>
  );
}