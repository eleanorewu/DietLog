import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WeightRecord, UserProfile } from '../../types';
import { SquarePen, List } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface WeightTrackingProps {
  user: UserProfile;
  weightRecords: WeightRecord[];
  onUpdateWeight: (newWeight: number) => void;
  onNavigateToDataList?: () => void;
}

export const WeightTracking: React.FC<WeightTrackingProps> = ({
  user,
  weightRecords,
  onUpdateWeight,
  onNavigateToDataList
}) => {
  const { theme } = useTheme();
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState(user.weight.toString());

  // Helper function to handle decimal input with max 2 decimal places
  const handleDecimalInput = (value: string, setter: (val: string) => void) => {
    if (value === '') {
      setter('');
      return;
    }
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value)) {
      setter(value);
    }
  };

  const handleSaveWeight = () => {
    const newWeight = Number(weightInput);
    if (Number.isFinite(newWeight) && newWeight > 0) {
      onUpdateWeight(newWeight);
      setIsEditingWeight(false);
    }
  };

  const handleCancelWeightEdit = () => {
    setWeightInput(user.weight.toString());
    setIsEditingWeight(false);
  };

  // Calculate weight progress
  const weightProgress = user.weight - user.targetWeight;
  const totalWeightToLose = Math.abs(weightProgress);
  
  // Calculate estimated weeks to reach target
  const estimatedWeeks = user.weeklyWeightLoss > 0 
    ? Math.ceil(totalWeightToLose / user.weeklyWeightLoss) 
    : 0;

  // Prepare data for chart
  const chartData = weightRecords
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(record => ({
      date: record.date,
      weight: record.weight,
      displayDate: new Date(record.date + 'T00:00:00').toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
    }));
  
  // 計算圖表的最小和最大體重，用於設定 Y 軸範圍
  const weights = chartData.map(d => d.weight);
  const minWeight = Math.min(...weights, user.targetWeight);
  const maxWeight = Math.max(...weights, user.targetWeight);
  
  // 計算 Y 軸刻度，以 2kg 為間距
  const minTick = Math.floor(minWeight - 1); // 向下取整並減 1kg
  const maxTick = Math.ceil(maxWeight + 1);  // 向上取整並加 1kg
  const ticks = [];
  for (let i = minTick; i <= maxTick; i += 2) {
    ticks.push(i);
  }
  
  // 根據主題設置圖表顏色
  const gridColor = theme === 'dark' ? '#374151' : '#f1f5f9'; // dark: gray-700, light: slate-100
  const axisStroke = theme === 'dark' ? '#4B5563' : '#cbd5e1'; // dark: gray-600, light: slate-300
  const tickColor = theme === 'dark' ? '#9CA3AF' : '#64748b'; // dark: gray-400, light: slate-500

  return (
    <div className="space-y-4">
      {/* Current Weight Card */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-600 shadow-sm transition-colors duration-150">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-700 dark:text-gray-200">當前體重</h3>
          {!isEditingWeight && (
            <button 
              onClick={() => setIsEditingWeight(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
            >
              <SquarePen className="text-slate-600 dark:text-gray-300" size={16} />
            </button>
          )}
        </div>

        {isEditingWeight ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={weightInput}
                onChange={(e) => handleDecimalInput(e.target.value, setWeightInput)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveWeight();
                  if (e.key === 'Escape') handleCancelWeightEdit();
                }}
                className="flex-1 bg-white dark:bg-gray-800 border-2 border-green-400 dark:border-green-500 rounded-lg p-2 text-lg font-bold text-slate-700 dark:text-gray-100 outline-none transition-colors duration-150"
                placeholder="輸入體重"
                autoFocus
              />
              <span className="text-sm font-medium text-slate-600 dark:text-gray-400">kg</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveWeight}
                className="flex-1 bg-green-600 dark:bg-green-700 text-white py-2 rounded-lg font-medium text-sm hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-150"
              >
                儲存並更新
              </button>
              <button
                onClick={handleCancelWeightEdit}
                className="flex-1 bg-white dark:bg-gray-600 text-slate-600 dark:text-gray-200 py-2 rounded-lg font-medium text-sm border border-slate-200 dark:border-gray-500 hover:bg-slate-50 dark:hover:bg-gray-500 transition-colors duration-150"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-green-700 dark:text-green-500">
                {user.weight.toFixed(2)}
              </span>
              <span className="text-lg font-medium text-slate-600 dark:text-gray-400">kg</span>
            </div>
            
            <div className="pt-3 border-t border-slate-100 dark:border-gray-600">
              {weightProgress > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-gray-400">還需減重</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{totalWeightToLose.toFixed(2)} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-gray-400">預估達成時間</span>
                    <span className="font-bold text-green-600 dark:text-green-400">約 {estimatedWeeks} 週</span>
                  </div>
                </div>
              ) : weightProgress < 0 ? (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  🎉 已超過目標 {Math.abs(weightProgress).toFixed(2)} kg
                </p>
              ) : (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  🎉 已達成目標！
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Weight Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-600 shadow-sm transition-colors duration-150">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-700 dark:text-gray-200">體重</h3>
            <button 
              onClick={onNavigateToDataList}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
            >
              <List className="text-slate-600 dark:text-gray-300" size={16} />
              <span className="text-sm font-medium text-slate-600 dark:text-gray-300">列表</span>
            </button>
          </div>
          <div className="h-64 relative">
            <div className="w-full h-full overflow-x-auto overflow-y-hidden">
              <div style={{ minWidth: '100%', width: Math.max(chartData.length * 14, 320), height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: chartData.length > 14 ? 50 : 5 }}>
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
                      domain={[minTick, maxTick]}
                      ticks={ticks}
                      tick={{ fontSize: 11, fill: tickColor }}
                      stroke={axisStroke}
                      width={35}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#fff', 
                        border: `1px solid ${theme === 'dark' ? '#374151' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: theme === 'dark' ? '#E5E7EB' : '#475569'
                      }}
                      labelStyle={{ color: theme === 'dark' ? '#E5E7EB' : '#475569' }}
                      formatter={(value: number) => [`${value.toFixed(2)} kg`, '體重']}
                    />
                    <ReferenceLine 
                      y={user.targetWeight} 
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
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
