import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FoodLog, UserProfile, MealType } from '../types';
import { Flame, ChevronLeft, ChevronRight, Settings, Lock, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { isFutureDate, getTodayString, getWeekStart, getWeekDays, getPreviousWeekStart, getNextWeekStart, getDayName, isToday } from '../utils';
import { SwipeableItem } from './SwipeableItem';

interface DashboardProps {
  user: UserProfile;
  logs: FoodLog[];
  onAddFood: (mealType?: MealType) => void;
  onEditFood: (log: FoodLog) => void;
  onDeleteFood: (id: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenSettings: () => void;
  onOpenCalendar: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  logs, 
  onAddFood, 
  onEditFood,
  onDeleteFood,
  selectedDate,
  onDateChange,
  onOpenSettings,
  onOpenCalendar
}) => {
  // 計算當週起始日期
  const weekStart = getWeekStart(selectedDate);
  const weekDays = getWeekDays(weekStart);
  
  // Filter logs by the selected date
  const todaysLogs = logs.filter((log) => log.date === selectedDate);

  const totalCalories = todaysLogs.reduce((acc, log) => acc + log.calories, 0);
  const totalProtein = todaysLogs.reduce((acc, log) => acc + log.protein, 0);
  const totalFat = todaysLogs.reduce((acc, log) => acc + log.fat, 0);
  const totalCarbs = todaysLogs.reduce((acc, log) => acc + log.carbs, 0);

  const remaining = user.targetCalories - totalCalories;
  const isOver = remaining < 0;

  const data = [
    { name: '已攝取', value: totalCalories },
    { name: '剩餘', value: Math.max(0, remaining) },
  ];

  const COLORS = isOver ? ['#EF4444', '#f3f4f6'] : ['#10B981', '#f3f4f6'];

  const MacroBar = ({
    label,
    current,
    target,
    color,
  }: {
    label: string;
    current: number;
    target: number;
    color: string;
  }) => {
    const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const isOver = current > target && target > 0;
    const barColorClass = isOver ? 'bg-red-500' : color;
    const valueColorClass = isOver ? 'text-red-500' : 'text-slate-700';

    return (
      <div className="flex flex-col items-center justify-center min-w-0">
        <div className="text-sm text-slate-700 text-center">
          <div className="font-medium leading-tight break-words">{label}</div>
        </div>

        <div className="mt-1.5">
          <div className={`text-sm font-bold tabular-nums whitespace-nowrap ${valueColorClass}`}>
            {current} / {target}g
          </div>
        </div>

        <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  const renderMealSection = (type: MealType, title: string) => {
    const meals = todaysLogs.filter((l) => l.mealType === type);
    const cals = meals.reduce((acc, m) => acc + m.calories, 0);
    const isFutureDate_flag = isFutureDate(selectedDate);

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <span className="text-xs font-medium text-slate-400">{cals} kcal</span>
        </div>
        {meals.length === 0 ? (
          <div 
            onClick={!isFutureDate_flag ? () => onAddFood(type) : undefined}
            className={`border border-dashed border-slate-300 rounded-xl p-3 text-center text-sm ${
              isFutureDate_flag 
                ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                : 'text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors'
            }`}
          >
            + 新增{title}
          </div>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <SwipeableItem 
                key={meal.id}
                onDelete={() => onDeleteFood(meal.id)}
                disabled={isFutureDate_flag}
              >
                <div 
                  onClick={() => !isFutureDate_flag && onEditFood(meal)}
                  className={`bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center transition-transform group ${
                    isFutureDate_flag 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'active:scale-[0.98] cursor-pointer hover:bg-slate-50'
                  }`}
                >
                  <div className="w-11 h-11 rounded-lg bg-slate-100 mr-2.5 overflow-hidden flex-shrink-0">
                    {meal.photoUrl ? (
                      <img src={meal.photoUrl} alt={meal.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Flame size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800 text-sm">{meal.name}</h4>
                    <p className="text-xs text-slate-500">
                      蛋:{meal.protein} 脂:{meal.fat} 碳:{meal.carbs}
                    </p>
                  </div>
                  <div className="text-emerald-600 font-bold text-sm mr-2">{meal.calories}</div>
                  
                  {/* 桌面版刪除按鈕 - 懸停時顯示 */}
                  {!isFutureDate_flag && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('確定要刪除這筆記錄嗎？')) {
                          onDeleteFood(meal.id);
                        }
                      }}
                      className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                      title="刪除記錄"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  )}
                </div>
              </SwipeableItem>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-20 animate-fadeIn">
      <div className="bg-white  mb-2 pb-2 pt-4 px-2 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-3 mx-2 ">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl text-slate-800">DietLog</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={onOpenCalendar}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="打開日曆"
            >
              <Calendar size={20} />
            </button>
            <button 
              onClick={onOpenSettings}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1">
          <button 
            onClick={() => onDateChange(getPreviousWeekStart(weekStart))}
            className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex justify-center gap-1">
            {weekDays.map((date) => {
              const isSelected = date === selectedDate;
              const isFuture = isFutureDate(date);
              const isCurrentDay = isToday(date);
              const dayNum = new Date(date + 'T00:00:00').getDate();
              const dayName = getDayName(date);

              return (
                <button
                  key={date}
                  onClick={() => onDateChange(date)}
                  className={`flex flex-col items-center justify-center rounded-lg transition-all text-xs font-semibold ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-md'
                      : isFuture
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                      : isCurrentDay
                      ? 'bg-slate-50 text-emerald-600 border-2 border-emerald-500'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                  disabled={isFuture}
                  style={{ width: '34px', height: '52px' }}
                >
                  <span className="text-xs mb-1">{dayName}</span>
                  <span>{dayNum}</span>
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => onDateChange(getNextWeekStart(weekStart))}
            className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {isFutureDate(selectedDate) ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="bg-white p-6 text-center max-w-xs">
            <Lock size={48} className="text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">未來日期無法新增紀錄</h2>
            <p className="text-sm text-slate-500">只能紀錄當日及過去的飲食</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white mx-4 p-2 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-800">今日攝取概況</h2>
            </div>

            {/* 每日目標與 TDEE 資訊 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 rounded-xl p-2.5">
                <p className="text-xs text-slate-500 font-medium mb-1">每日目標</p>
                <p className="text-lg font-bold text-emerald-600">{user.targetCalories} kcal</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5">
                <p className="text-xs text-slate-500 font-medium mb-1">每日總消耗 (TDEE)</p>
                <p className="text-lg font-bold text-slate-700">{user.tdee} kcal</p>
              </div>
            </div>

            <div className="flex flex-col items-center relative mb-6">
              <div className="w-44 h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="flex items-center justify-center">
                    <span className={`text-3xl font-bold ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
                      {Math.abs(remaining)}
                    </span>
                    {isOver && (
                      <AlertCircle size={24} className="text-red-500 ml-1" />
                    )}
                  </div>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wide">
                    {isOver ? '超標' : '剩餘'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MacroBar
                label="蛋白質"
                current={totalProtein}
                target={user.targetProtein}
                color="bg-blue-500"
                />
              <MacroBar
                label="碳水"
                current={totalCarbs}
                target={user.targetCarbs}
                color="bg-orange-500"
                />
              <MacroBar
                label="脂肪"
                current={totalFat}
                target={user.targetFat}
                color="bg-yellow-500"
                />
            </div>
          </div>

          <div className="px-4">
            {renderMealSection('breakfast', '早餐')}
            {renderMealSection('lunch', '午餐')}
            {renderMealSection('dinner', '晚餐')}
            {renderMealSection('snack', '點心')}
          </div>
        </>
      )}
    </div>
  );
};
