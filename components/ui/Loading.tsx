import React from 'react';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = '載入中...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        {/* Logo with Spinning Border */}
        <div className="relative w-16 h-16">
          {/* Spinning border */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-gray-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent dark:border-green-400 animate-spin"></div>
          
          {/* Logo */}
          <div className="absolute inset-2 flex items-center justify-center">
            <img 
              src="/icons/icon-192.png" 
              alt="DietLog Logo" 
              className="w-12 h-12 object-cover rounded-lg"
            />
          </div>
        </div>
        
        {/* Loading Text */}
        <p className="text-slate-600 dark:text-gray-400 font-medium text-sm animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};
