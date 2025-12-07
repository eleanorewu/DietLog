import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FoodLog, UserProfile } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface CalorieTrackingProps {
  user: UserProfile;
  logs: FoodLog[];
}

export const CalorieTracking: React.FC<CalorieTrackingProps> = ({ user, logs }) => {
  const { theme } = useTheme();
  // 計算每天的總卡路里
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

  // 準備圖表數據（只顯示有記錄的日期）
  const prepareChartData = () => {
    const dailyCalories = getDailyCalories();
    const dates = Object.keys(dailyCalories).sort();
    
    if (dates.length === 0) return [];
    
    // 只包含有記錄的日期
    const chartData = dates.map(dateString => {
      const date = new Date(dateString + 'T00:00:00');
      const displayDate = `${date.getMonth() + 1}/${date.getDate()}`;
      
      return {
        date: dateString,
        displayDate: displayDate,
        calories: dailyCalories[dateString],
      };
    });
    
    return chartData;
  };

  const chartData = prepareChartData();
  // 只要有任何記錄就顯示圖表
  const hasAnyLogs = chartData.length > 0;
  
  // 根據主題設置圖表顏色
  const gridColor = theme === 'dark' ? '#374151' : '#f1f5f9'; // dark: gray-700, light: slate-100
  const axisStroke = theme === 'dark' ? '#4B5563' : '#cbd5e1'; // dark: gray-600, light: slate-300
  const tickColor = theme === 'dark' ? '#9CA3AF' : '#64748b'; // dark: gray-400, light: slate-500

  return (
    <div className="space-y-4">
      {/* Calorie Chart Card */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-600 shadow-sm transition-colors duration-150">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-700 dark:text-gray-200">卡路里</h3>
        </div>

        {/* Daily Target */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-slate-600 dark:text-gray-400">每日目標</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{user.targetCalories} kcal</span>
        </div>

        {/* TDEE */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-slate-600 dark:text-gray-400">每日總消耗 (TDEE)</span>
          <span className="font-bold text-slate-900 dark:text-gray-100">{user.tdee} kcal</span>
        </div>

        {/* Bar Chart or Empty State */}
        <div className="h-64">
          {!hasAnyLogs ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-slate-400">尚無飲食記錄</p>
            </div>
          ) : (
            <div className="w-full h-full overflow-x-auto overflow-y-hidden">
              <div style={{ minWidth: '100%', width: Math.max(chartData.length * 50, 320), height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: chartData.length > 14 ? 65 : 35 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                      dataKey="displayDate" 
                      tick={{ fontSize: 12, fill: tickColor }}
                      stroke={axisStroke}
                      interval={0}
                      angle={chartData.length > 14 ? -45 : 0}
                      textAnchor={chartData.length > 14 ? 'end' : 'middle'}
                      height={chartData.length > 14 ? 60 : 30}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: tickColor }}
                      stroke={axisStroke}
                      width={35}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', 
                        border: '1px solid',
                        borderColor: theme === 'dark' ? '#374151' : '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: theme === 'dark' ? '#E5E7EB' : '#475569'
                      }}
                      labelStyle={{ color: theme === 'dark' ? '#E5E7EB' : '#475569' }}
                      formatter={(value: number) => [`${value} kcal`, '攝取熱量']}
                      cursor={{ fill: 'transparent' }}
                    />
                    {/* 目標熱量參考線 */}
                    <ReferenceLine 
                      y={user.targetCalories} 
                      stroke={tickColor} 
                      strokeDasharray="5 5"
                      label={{ 
                        value: '目標', 
                        position: 'insideTopRight',
                        fill: tickColor, 
                        fontSize: 12,
                        offset: 10
                      }}
                    />
                    <Bar 
                      dataKey="calories" 
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
                      barSize={8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
