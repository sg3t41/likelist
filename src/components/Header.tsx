"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useScrollHeader } from "@/hooks/useScrollHeader";

interface HeaderProps {
  pageUser?: any;
}

export default function Header({ pageUser }: HeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isVisible = useScrollHeader();

  return (
    <div className="fixed top-4 left-0 right-0 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
      <header className={`flex justify-end transition-all duration-300 pointer-events-auto ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'
      }`}>
      {session?.user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-300"
              aria-label="ユーザーメニュー"
            >
              {(session.user as any).image ? (
                <Image
                  src={(session.user as any).image}
                  alt={(session.user as any).name || ''}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {((session.user as any).name || (session.user as any).username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* ドロップダウンメニュー */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-40">
                  <button
                    onClick={() => {
                      router.push(`/u/${(session.user as any).userId}`);
                      router.refresh();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-3 w-full p-3 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    マイリスト
                  </button>
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ログアウト
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn("twitter")}
            className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            aria-label="Xでログイン"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            ログイン
          </button>
        )}
      </header>
    </div>
  );
}