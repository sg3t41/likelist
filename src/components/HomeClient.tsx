"use client";

import { signIn } from "next-auth/react";
import FloatingMenuButton from "@/components/FloatingMenuButton";
import MainTitle from "@/components/MainTitle";

interface HomeClientProps {
  currentUser?: any;
}

export default function HomeClient({ currentUser }: HomeClientProps) {
  const username = currentUser ? (currentUser as any).username : null;
  
  return (
    <>
      <FloatingMenuButton />
      
      <MainTitle />

      <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center relative overflow-hidden" style={{minHeight: 'calc(100vh - 200px)'}}>
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-md w-full space-y-8 p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl">
        <div className="text-center">
          {/* ロゴ・アイコン部分 */}
          <div className="mx-auto w-20 h-20 mb-6 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-3xl">❤️</span>
          </div>
          
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            すきなものリスト
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            {currentUser 
              ? (
                <>
                  <span className="text-purple-600 font-semibold">
                    {username ? `@${username}` : 'あなた'}
                  </span>
                  としてログイン中
                  <span className="block text-sm mt-2 text-gray-500">
                    ページを読み込み中...
                  </span>
                </>
              )
              : (
                <>
                  あなたの「好き」を整理して
                  <span className="block">みんなとシェアしよう！</span>
                </>
              )
            }
          </p>
          {currentUser && (
            <p className="mt-3 text-xs text-gray-500 animate-pulse">
              自動的にリダイレクトされない場合は、下のボタンをクリックしてください
            </p>
          )}
        </div>
        
        {/* 特徴説明（未ログイン時のみ） */}
        {!currentUser && (
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-xs text-gray-600">簡単作成</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <p className="text-xs text-gray-600">ランキング化</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔗</div>
              <p className="text-xs text-gray-600">簡単シェア</p>
            </div>
          </div>
        )}
        
        <div className="mt-8 space-y-4">
          <button
            onClick={() => signIn('twitter')}
            className="w-full flex justify-center items-center gap-3 px-6 py-4 text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            {currentUser ? "再ログイン" : "Xでログインして始める"}
          </button>
        </div>
        
        {/* フッター的な装飾 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            好きなものを、もっと楽しく整理しよう
          </p>
        </div>
        </div>
      </div>
    </>
  );
}