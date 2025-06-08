import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka, Comfortaa } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 遊び心のあるフォント
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa", 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "すきなものリスト",
  description: "あなたの好きなものを整理してシェアしよう",
  metadataBase: new URL('https://sukilist.jp'),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "すきなものリスト",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "すきなものリスト",
    description: "あなたの好きなものを整理してシェアしよう",
    url: "https://sukilist.jp",
    siteName: "すきなものリスト",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "すきなものリスト",
    description: "あなたの好きなものを整理してシェアしよう",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  themeColor: "#8B5CF6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${comfortaa.variable} antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
