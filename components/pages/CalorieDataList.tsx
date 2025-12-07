import React from 'react';
import { FoodLog } from '../../types';
import { LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface CalorieDataListProps {
  logs: FoodLog[];
  onBack: () => void;
}

export const CalorieDataList: React.FC<CalorieDataListProps> = ({
  logs,
  onBack
}) => {
  const { theme } = useTheme();

  // 計算每日總熱量
  const getDailyCalories = () => {
    const dailyData: { [date: string]: number } = {};
    
    logs.forEach(log => {
      if (dailyData[log.date]) {
        dailyData[log.date] += log.calories;
      } else {
        dailyData[log.date] = log.calories;
      }
    });
    
    return dailyData;
  };

  const dailyCalories = getDailyCalories();
  const dates = Object.keys(dailyCalories).sort((a, b) => b.localeCompare(a)); // 倒序排列

  return (
    <div className="flex flex-col p-2 h-full bg-slate-50 dark:bg-gray-900 animate-slideIn transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center p-4">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 text-slate-600 dark:text-gray-300 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <LogOut className="rotate-180" size={24}/>
        </button>
        <h1 className="text-xl font-bold ml-2 text-slate-900 dark:text-gray-100">卡路里</h1>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {dates.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-gray-500">
            <p>尚無飲食記錄</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dates.map(date => {
              const dateObj = new Date(date + 'T00:00:00');
              const year = dateObj.getFullYear();
              const month = dateObj.getMonth() + 1;
              const day = dateObj.getDate();
              const displayDate = `${year}/${month}/${day}`;
              const calories = dailyCalories[date];
              
              return (
                <div 
                  key={date} 
                  className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-slate-100 dark:border-gray-600 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          {calories}
                        </span>
                        <span className="text-base font-medium text-slate-600 dark:text-gray-300">kcal</span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-gray-400">
                        {displayDate}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
