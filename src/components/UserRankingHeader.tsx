"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  userId?: string;
};

interface UserRankingHeaderProps {
  pageUser: User;
  currentUser: User | null;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export default function UserRankingHeader({ 
  pageUser, 
  currentUser, 
  isMenuOpen, 
  setIsMenuOpen 
}: UserRankingHeaderProps) {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
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
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
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
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-white/50 transition-all"
                >
                  {currentUser.image && (
                    <img
                      src={currentUser.image}
                      alt={currentUser.name || ''}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                    <button
                      onClick={() => {
                        router.push(`/u/${currentUser.userId}`);
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
  );
}