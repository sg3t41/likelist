"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  placeholder?: string; // ベース64エンコードされた小さな画像
  onClick?: () => void;
  priority?: boolean;
}

/**
 * プログレッシブ画像読み込みコンポーネント（Vercel最適化）
 * Intersection Observer を使用した遅延読み込み
 */
export default function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className = "",
  placeholder,
  onClick,
  priority = false
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // priorityがtrueなら即座に読み込み
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer による遅延読み込み
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // 50px手前で読み込み開始
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // エラー時の代替表示
  if (hasError) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer ${className}`}
        style={{ width, height }}
        onClick={onClick}
      >
        <div className="text-center p-2">
          <svg className="w-6 h-6 mx-auto text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs text-gray-500">画像エラー</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ width, height }}
      onClick={onClick}
    >
      {/* プレースホルダー画像またはスケルトン */}
      {!isLoaded && (
        <div className="absolute inset-0">
          {placeholder ? (
            <Image
              src={placeholder}
              alt=""
              width={width}
              height={height}
              className="blur-sm scale-110 transition-all duration-300"
              unoptimized
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* メイン画像 */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`absolute inset-0 transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          priority={priority}
          unoptimized={true} // Vercel対応
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}

      {/* ローディングインジケーター */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}