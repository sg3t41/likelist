import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka, Comfortaa } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
