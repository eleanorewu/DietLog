import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { getTodayString, isFutureDate } from '../utils';
import { FoodLog } from '../types';

interface MonthCalendarViewProps {
  logs: FoodLog[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

export const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({
  logs,
  selectedDate,
  onDateSelect,
  onClose,
}) => {
  const today = getTodayString();
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const date = new Date(selectedDate + 'T00:00:00');
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  // 取得該月所有日期
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  // 建立日期陣列（包含上月的填充天數）
  const days: (number | null)[] = [];
  for (let i = firstDayOfMonth; i > 0; i--) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // 檢查某個日期是否有紀錄
  const hasLogs = (dateString: string): boolean => {
    return logs.some((log) => log.date === dateString);
  };

  // 取得日期對應的字串
  const getDateString = (day: number): string => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  // 檢查該月是否有任何紀錄
  const monthHasLogs = days.some((day) => {
    if (day === null) return false;
    return hasLogs(getDateString(day));
  });

  return (
    <div className="flex flex-col h-full bg-white animate-slideIn">
      {/* Header */}
      <div className="flex items-center p-4">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
        >
          <LogOut className="rotate-180" size={24} />
        </button>
        <h1 className="text-xl font-bold ml-2">日曆</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        {/* Month Title */}
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">
          {currentMonth.getMonth() + 1}月 {currentMonth.getFullYear()}
        </h2>

        {/* Legend - Only show if month has records */}
        {monthHasLogs && (
          <div className="flex items-center justify-center gap-4 mb-6 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-600">已選</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-emerald-500 bg-slate-50" />
              <span className="text-slate-600">今天</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-slate-400" />
                </div>
              </div>
              <span className="text-slate-600">有紀錄</span>
            </div>
          </div>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="text-sm font-medium text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors"
          >
            今天
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 h-8 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-14" />;
            }

            const dateStr = getDateString(day);
            const isSelected = dateStr === selectedDate;
            const isCurrentDay = dateStr === today;
            const isFuture = isFutureDate(dateStr);
            const hasRecord = hasLogs(dateStr);

            return (
              <button
                key={day}
                onClick={() => {
                  if (!isFuture) {
                    onDateSelect(dateStr);
                    onClose();
                  }
                }}
                disabled={isFuture}
                className={`h-14 rounded-lg font-semibold text-sm relative flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md'
                    : isFuture
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-50'
                    : isCurrentDay
                    ? 'bg-slate-50 text-emerald-600 border-2 border-emerald-500'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  <span>{day}</span>
                  {hasRecord && (
                    <div className="w-1.5 h-1.5 rounded-full bg-current mt-1" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
