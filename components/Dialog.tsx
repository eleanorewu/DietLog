import React from 'react';

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
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog 內容 */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 animate-slideIn">
        <div className="p-6">
          {/* 標題 */}
          <h3 className="text-lg font-bold text-slate-800 mb-3">
            {title}
          </h3>
          
          {/* 訊息內容 */}
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            {message}
          </p>
          
          {/* 按鈕群組 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                isDangerous
                  ? 'bg-red-500 text-white hover:bg-red-600'
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
