"use client";

import { signIn } from "next-auth/react";

interface HomeClientProps {
  currentUser?: any;
}

export default function HomeClient({ currentUser }: HomeClientProps) {
  const username = currentUser ? (currentUser as any).username : null;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            好きなものリストへようこそ
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {currentUser 
              ? `${username ? `@${username}として` : ''}ログイン中です。ページを読み込み中...` 
              : "あなたの好きなものリストを作成・共有しましょう"
            }
          </p>
          {currentUser && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              自動的にリダイレクトされない場合は、下のボタンをクリックしてください
            </p>
          )}
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => signIn('twitter')}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            {currentUser ? "再ログイン" : "Xでログイン"}
          </button>
          
          {currentUser && username && (
            <a
              href={`/u/${(currentUser as any).userId || username}`}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              マイページに移動
            </a>
          )}
        </div>
      </div>
    </div>
  );
}