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
  const itemRef = useRef<HTMLDivElement>(null);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || !showDeleteButton) return;
    setIsSwiping(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || disabled || !showDeleteButton) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    // 只允許向左滑動
    if (diff > 0 && diff <= DELETE_ZONE) {
      setTranslateX(-diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping || disabled || !showDeleteButton) return;
    
    setIsSwiping(false);
    
    // 如果滑動距離超過閾值，保持在刪除位置
    if (Math.abs(translateX) > SWIPE_THRESHOLD) {
      setTranslateX(-DELETE_ZONE);
    } else {
      // 否則回彈
      setTranslateX(0);
    }
  };

  const handleDelete = () => {
    // 先滑出動畫
    setTranslateX(-400);
    setTimeout(() => {
      onDelete();
    }, 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    // 如果已經滑出，攔截點擊並收回
    if (translateX !== 0) {
      e.stopPropagation();
      e.preventDefault();
      setTranslateX(0);
    }
    // 否則不攔截，讓點擊事件正常傳遞給 children
  };

  return (
    <div className="relative overflow-hidden" ref={itemRef}>
      {/* 刪除按鈕背景 - 只在手機顯示 */}
      {showDeleteButton && (
        <div className="absolute inset-0 flex items-center justify-end">
          <button
            onClick={handleDelete}
            className="h-full w-[120px] bg-red-500 flex items-center justify-center text-white"
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}
      
      {/* 可滑動的內容 */}
      <div
        className="relative overflow-hidden"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {children}
      </div>
    </div>
  );
};
