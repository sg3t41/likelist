// クライアントサイドでの画像最適化ユーティリティ（Vercel安全）

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

/**
 * クライアントサイドで画像を最適化する（Vercel対応）
 * ファイルアップロード時に使用
 */
export function optimizeImageFile(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // アスペクト比を保持しながらリサイズ
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // 高品質な描画設定
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 画像を描画
      ctx.drawImage(img, 0, 0, width, height);

      // Blobに変換
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to optimize image'));
            return;
          }

          // 最適化されたファイルを作成
          const optimizedFile = new File(
            [blob],
            `optimized_${file.name}`,
            { type: `image/${format}` }
          );

          resolve(optimizedFile);
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 画像ファイルの検証
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  // ファイルタイプの確認
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'サポートされていない画像形式です。JPEG、PNG、WebPのみ対応しています。'
    };
  }

  // ファイルサイズの確認（5MB制限）
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: 'ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。'
    };
  }

  return { isValid: true };
}

/**
 * 画像URLの事前読み込み（パフォーマンス向上）
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * 複数画像の遅延読み込み
 */
export function lazyLoadImages(imageUrls: string[], delay = 100): void {
  imageUrls.forEach((url, index) => {
    setTimeout(() => {
      preloadImage(url).catch(console.error);
    }, index * delay);
  });
}