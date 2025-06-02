"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "authenticated" && session?.user && (session.user as any).userId) {
      // ログイン済みの場合は自分のランキングページへリダイレクト
      router.push(`/u/${(session.user as any).userId}`);
    }
  }, [session, status, router]);
  
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }
  
  // 未ログインの場合はログインページを表示
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            好きなものリストへようこそ
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            あなたの好きなものリストを作成・共有しましょう
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => signIn('twitter')}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Xでログイン
          </button>
        </div>
      </div>
    </div>
  );
}