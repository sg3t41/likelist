"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Footer() {
  useEffect(() => {
    // 既存のService Workerをクリーンアップ
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
          console.log('Service Worker unregistered');
        });
      });
      
      // キャッシュも削除
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
            console.log('Cache deleted:', cacheName);
          });
        });
      }
    }
  }, []);
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サイト情報 */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              すきなものリスト
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              あなたの好きなものを整理してシェアするプラットフォーム。
              カテゴリ別にランキングを作成し、思い出を大切に保管しましょう。
            </p>
          </div>

          {/* リンク */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              サイトについて
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link 
                  href="/disclaimer" 
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  免責事項
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* アプリ・サポート */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              サポート
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  ヘルプ・お問い合わせ
                </Link>
              </li>
            </ul>
            
            {/* アフィリエイト表示 */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 leading-relaxed">
                当サイトはAmazonアソシエイト・プログラムの参加者です。
              </p>
            </div>
          </div>
        </div>

        {/* コピーライト */}
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} すきなものリスト. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}