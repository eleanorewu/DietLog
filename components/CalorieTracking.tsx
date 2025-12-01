import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FoodLog, UserProfile } from '../types';

interface CalorieTrackingProps {
  user: UserProfile;
  logs: FoodLog[];
}

export const CalorieTracking: React.FC<CalorieTrackingProps> = ({ user, logs }) => {
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

  // 準備圖表數據（顯示所有有記錄的日期）
  const prepareChartData = () => {
    const dailyCalories = getDailyCalories();
    const dates = Object.keys(dailyCalories).sort();
    
    if (dates.length === 0) return [];
    
    // 取得最早和最晚的日期
    const firstDate = new Date(dates[0] + 'T00:00:00');
    const lastDate = new Date(dates[dates.length - 1] + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 如果最後日期是今天之前，則使用今天作為結束日期
    const endDate = lastDate > today ? lastDate : today;
    
    const chartData = [];
    const currentDate = new Date(firstDate);
    
    // 從最早日期遍歷到結束日期
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const displayDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
      
      chartData.push({
        date: dateString,
        displayDate: displayDate,
        calories: dailyCalories[dateString] || 0,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return chartData;
  };

  const chartData = prepareChartData();
  const daysWithLogs = chartData.filter(day => day.calories > 0).length;

  return (
    <div className="space-y-4">
      {/* Calorie Chart Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-700">卡路里</h3>
        </div>

        {/* Daily Target */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-slate-600">每日目標</span>
          <span className="font-bold text-emerald-600">{user.targetCalories} kcal</span>
        </div>

        {/* TDEE */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-slate-600">每日總消耗 (TDEE)</span>
          <span className="font-bold text-slate-900">{user.tdee} kcal</span>
        </div>

        {/* Bar Chart or Empty State */}
        <div className="h-64">
          {daysWithLogs === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-slate-400">尚無飲食記錄</p>
            </div>
          ) : (
            <div className="w-full h-full overflow-x-auto overflow-y-hidden">
              <div style={{ minWidth: '100%', width: Math.max(chartData.length * 40, 400), height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="displayDate" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                      interval={0}
                      angle={chartData.length > 14 ? -45 : 0}
                      textAnchor={chartData.length > 14 ? 'end' : 'middle'}
                      height={chartData.length > 14 ? 60 : 30}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                      width={45}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#475569'
                      }}
                      labelStyle={{ color: '#475569' }}
                      formatter={(value: number) => [`${value} kcal`, '攝取熱量']}
                    />
                    {/* 目標熱量參考線 */}
                    <ReferenceLine 
                      y={user.targetCalories} 
                      stroke="#64748b" 
                      strokeDasharray="5 5"
                      label={{ 
                        value: '目標', 
                        position: 'insideTopRight',
                        fill: '#475569', 
                        fontSize: 12,
                        offset: 10
                      }}
                    />
                    <Bar 
                      dataKey="calories" 
                      fill="#10b981"
                      radius={[8, 8, 0, 0]}
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
