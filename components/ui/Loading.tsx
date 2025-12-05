import React from 'react';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = '載入中...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        {/* Logo or App Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-gray-700"></div>
          <div className="w-16 h-16 rounded-full border-4 border-green-500 border-t-transparent dark:border-green-400 absolute top-0 left-0 animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <p className="text-slate-600 dark:text-gray-400 font-medium text-sm animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};
