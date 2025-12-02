import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UserProfile } from '../../types';

interface ThemeToggleProps {
  user: UserProfile;
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ user, onThemeChange }) => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    onThemeChange(newTheme);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-600 shadow-sm transition-colors duration-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg transition-colors duration-200">
            {theme === 'light' ? (
              <Sun className="text-green-500" size={20} />
            ) : (
              <Moon className="text-green-300" size={20} />
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400">色彩模式</h3>
            <p className="text-xs font-bold text-slate-600 dark:text-gray-200">
              {theme === 'light' ? '淺色主題' : '深色主題'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          className={`
            relative w-14 h-7 rounded-full transition-all duration-300 ease-in-out
            ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'}
          `}
        >
          <div
            className={`
              absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md
              transition-transform duration-300 ease-in-out
              ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  );
};
