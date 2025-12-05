import React from 'react';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = '載入中...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="w-20 h-20 flex items-center justify-center">
          <img 
            src="/icons/icon-192.png" 
            alt="DietLog Logo" 
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
        
        {/* Loading Text with Spinner */}
        <div className="flex items-center gap-3">
          {/* Spinning dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-slate-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-slate-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-slate-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          <p className="text-slate-600 dark:text-gray-400 font-medium text-base">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
