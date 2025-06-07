"use client";

import { useRouter } from "next/navigation";

interface UserNotFoundPageProps {
  username: string;
}

export default function UserNotFoundPage({ username }: UserNotFoundPageProps) {
  const router = useRouter();

  const handleRequestRanking = () => {
    // Twitter Web Intent でメンション付きツイート
    const tweetText = `@${username} ランキングアプリでランキング作成してみませんか？✨\n\nあなたのランキングが見たいです！\n\n#ランキングアプリ`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    window.open(tweetUrl, '_blank', 'width=600,height=400');
  };


  const handleViewProfile = () => {
    // Twitterプロフィールを開く
    const profileUrl = `https://twitter.com/${username}`;
    window.open(profileUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-gray-50 to-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ホームに戻る
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              ランキング
            </h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <img
                src={`https://unavatar.io/twitter/${username}`}
                alt={`@${username}`}
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  // 画像の読み込みに失敗した場合はフォールバック
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl" style={{ display: 'none' }}>
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              @{username}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              このユーザーのランキングはまだありません
            </p>
            <p className="text-gray-600 mb-6">
              このユーザーはまだランキングを作成していないようです。<br />
              公開ツイートでランキング作成をリクエストしてみませんか？
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <button
              onClick={handleRequestRanking}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              公開でリクエストする（ツイート）
            </button>

            <button
              onClick={handleViewProfile}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Xプロフィールを見る
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              💡 ヒント: @{username} さんがアプリにログインすると、ランキングを作成できます
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}