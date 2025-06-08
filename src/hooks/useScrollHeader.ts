import { useState, useEffect } from 'react';

export function useScrollHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        // ページ上部では常に表示
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // 下スクロール時は隠す
        setIsVisible(false);
      } else {
        // 上スクロール時は表示
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return isVisible;
}