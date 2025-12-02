import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確定',
  cancelText = '取消',
  isDangerous = false,
}) => {
  const { theme } = useTheme();
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog 內容 */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 animate-slideIn transition-colors duration-200">
        <div className="p-6">
          {/* 標題 */}
          <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100 mb-3">
            {title}
          </h3>
          
          {/* 訊息內容 */}
          <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed mb-6">
            {message}
          </p>
          
          {/* 按鈕群組 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                isDangerous
                  ? 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
