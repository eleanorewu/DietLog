import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  disabled?: boolean;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({ 
  children, 
  onDelete,
  disabled = false 
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80; // 滑動距離閾值
  const DELETE_ZONE = 120; // 刪除區域寬度

  useEffect(() => {
    // 檢測是否為手機裝置
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setShowDeleteButton(isMobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const clamp = (val: number, a = -DELETE_ZONE, b = 0) => Math.max(a, Math.min(b, val));

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || !showDeleteButton) return;

    // 如果已經打開，先攔截此次觸控來收回
    if (translateX !== 0) {
      setTranslateX(0);
      return;
    }

    setIsSwiping(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || disabled || !showDeleteButton) return;

    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;

    // 允許向左滑動 (負值位移)，也允許向右拉回 (正值)
    const next = clamp(-diff);
    setTranslateX(next);
  };

  const handleTouchEnd = () => {
    if (!showDeleteButton) return;

    setIsSwiping(false);

    // 如果滑動距離超過閾值，保持在刪除位置，否則回彈
    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      setTranslateX(-DELETE_ZONE);
    } else {
      setTranslateX(0);
    }
  };

  const handleDelete = () => {
    // 簡短的滑出動畫再執行刪除
    setTranslateX(-400);
    setTimeout(() => onDelete(), 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    // 如果已經滑出，點擊收回
    if (translateX !== 0) {
      e.stopPropagation();
      e.preventDefault();
      setTranslateX(0);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Outer clipper: 隱藏所有溢出內容，但保留 1px 讓 border 顯示 */}
      <div className="relative overflow-hidden rounded-xl" style={{ margin: '0 1px' }}>
        {/* 刪除按鈕背景層 - 固定在右側，被滑動內容遮住 */}
        {showDeleteButton && (
          <div className="absolute top-0 right-0 bottom-0 w-[120px] bg-red-500 flex items-center justify-center">
            <button
              onClick={handleDelete}
              className="w-full h-full flex items-center justify-center text-white"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}

        {/* 可滑動的前景內容層 - 覆蓋在刪除按鈕之上 */}
        <div
          className="relative w-full"
          style={{
            transform: `translateX(${translateX}px)`,
            transition: isSwiping ? 'none' : 'transform 0.28s cubic-bezier(.2,.9,.2,1)',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
