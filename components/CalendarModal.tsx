import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { getTodayString, isFutureDate, isToday } from '../utils';
import { FoodLog } from '../types';

interface CalendarModalProps {
  logs: FoodLog[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
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

  // 月份文字
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-[90%] max-h-[80vh] overflow-y-auto no-scrollbar animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <LogOut className="rotate-180" size={20} />
          </button>
          <h2 className="text-lg font-bold text-slate-800">
            {currentMonth.getFullYear()}年 {monthNames[currentMonth.getMonth()]}
          </h2>
          <div className="w-8" />
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="text-sm font-medium text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg transition-colors"
          >
            今天
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ChevronRight size={20} />
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
        <div className="grid grid-cols-7 gap-2 mb-6">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-12" />;
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
                className={`h-12 rounded-lg font-medium text-sm relative flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md'
                    : isFuture
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-50'
                    : isCurrentDay
                    ? 'bg-slate-50 text-emerald-600 border-2 border-emerald-500'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{day}</span>
                {hasRecord && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-emerald-500 flex-shrink-0" />
            <span>已選</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-slate-50 border-2 border-emerald-500 flex-shrink-0" />
            <span>今天</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 relative">
              <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-slate-500" />
            </div>
            <span>有紀錄</span>
          </div>
        </div>
      </div>
    </div>
  );
};
