"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Service Worker の登録
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {})
        .catch(() => {});
    }

    // PWA インストールプロンプトの監視
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(event);
    };

    // インストール完了の監視
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    // 既にインストール済みかチェック
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };
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
              アプリ・サポート
            </h4>
            <ul className="space-y-2">
              {/* PWAインストールボタン - モバイルでのみ表示 */}
              {!isInstalled && deferredPrompt && (
                <li>
                  <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600 text-sm transition-colors group"
                  >
                    <span className="text-purple-500 group-hover:text-purple-700">📱</span>
                    アプリをインストール
                  </button>
                </li>
              )}
              {isInstalled && (
                <li className="flex items-center gap-2 text-green-600 text-sm">
                  <span>✅</span>
                  アプリインストール済み
                </li>
              )}
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