"use client";

interface MainTitleProps {
  className?: string;
}

export default function MainTitle({ className = "" }: MainTitleProps) {
  return (
    <div className={`py-16 px-4 text-center relative overflow-hidden ${className}`}>
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-orange-50/50"></div>
      <div className="absolute top-0 left-1/4 w-24 h-24 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            すきなもの
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            リスト
          </span>
        </h1>
        
        <div className="flex items-center justify-center gap-2 text-xl md:text-2xl text-gray-600 mb-2">
          <span className="animate-pulse">✨</span>
          <p className="font-medium">あなたの「好き」を整理して、みんなとシェアしよう</p>
          <span className="animate-pulse">✨</span>
        </div>
        
        {/* 装飾的な下線 */}
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mt-6"></div>
      </div>
    </div>
  );
}