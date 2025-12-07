import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto transition-colors duration-300">
      {/* Logo 和標題區 */}
      <div className="text-center mb-4 mt-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-slate-300/50 dark:shadow-gray-700/50 mb-3 overflow-hidden">
          <img 
            src="/icons/icon-192.png" 
            alt="DietLog Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-600 dark:text-gray-400 text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {/* 表單內容 */}
      <div className="w-full px-2 flex-1 flex flex-col justify-center">
        {children}
      </div>

      {/* 底部版權 */}
      <div className="text-center mt-4 text-sm text-slate-500 dark:text-gray-500">
        <p>© 2025 DietLog. 智慧飲食紀錄</p>
      </div>
    </div>
  );
};
