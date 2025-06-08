"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useScrollHeader } from "@/hooks/useScrollHeader";

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
  const isVisible = useScrollHeader();

  return (
    <header className={`bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-40 transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
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
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer" style={{ fontFamily: 'var(--font-fredoka)' }}>
              すきなものリスト
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-all"
                >
                  {currentUser.image && (
                    <Image
                      src={currentUser.image}
                      alt={currentUser.name || ''}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  )}
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
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
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
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