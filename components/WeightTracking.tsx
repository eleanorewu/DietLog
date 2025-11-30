import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WeightRecord, UserProfile } from '../types';
import { SquarePen } from 'lucide-react';

interface WeightTrackingProps {
  user: UserProfile;
  weightRecords: WeightRecord[];
  onUpdateWeight: (newWeight: number) => void;
}

export const WeightTracking: React.FC<WeightTrackingProps> = ({
  user,
  weightRecords,
  onUpdateWeight
}) => {
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

  return (
    <div className="space-y-4">
      {/* Current Weight Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-700">目前體重</h3>
          {!isEditingWeight && (
            <button 
              onClick={() => setIsEditingWeight(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <SquarePen className="text-slate-600" size={16} />
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
                className="flex-1 bg-white border-2 border-green-400 rounded-lg p-2 text-lg font-bold text-slate-700 outline-none"
                placeholder="輸入體重"
                autoFocus
              />
              <span className="text-sm font-medium text-slate-600">kg</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveWeight}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
              >
                儲存並更新
              </button>
              <button
                onClick={handleCancelWeightEdit}
                className="flex-1 bg-white text-slate-600 py-2 rounded-lg font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold text-green-700">
                {user.weight.toFixed(2)}
              </span>
              <span className="text-lg font-medium text-slate-600">kg</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-500 mb-1">目標體重</p>
                <p className="font-bold text-slate-900">{user.targetWeight.toFixed(2)} kg</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-500 mb-1">每週減重</p>
                <p className="font-bold text-slate-900">{user.weeklyWeightLoss.toFixed(2)} kg</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-slate-100">
              {weightProgress > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">還需減重</span>
                    <span className="font-bold text-orange-600">{totalWeightToLose.toFixed(2)} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">預估達成時間</span>
                    <span className="font-bold text-green-600">約 {estimatedWeeks} 週</span>
                  </div>
                </div>
              ) : weightProgress < 0 ? (
                <p className="text-sm text-green-600 font-medium">
                  🎉 已超過目標 {Math.abs(weightProgress).toFixed(2)} kg
                </p>
              ) : (
                <p className="text-sm text-green-600 font-medium">
                  🎉 已達成目標！
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Weight Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-700 mb-4">體重趨勢</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  stroke="#cbd5e1"
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  stroke="#cbd5e1"
                  width={45}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} kg`, '體重']}
                />
                <ReferenceLine 
                  y={user.targetWeight} 
                  stroke="#10b981" 
                  strokeDasharray="5 5"
                  label={{ value: '目標', position: 'right', fill: '#10b981', fontSize: 12 }}
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
      )}

      {/* Weight Records History */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-bold text-slate-700 mb-4">體重歷史記錄</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {weightRecords
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(record => (
              <div 
                key={record.id} 
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {record.weight.toFixed(2)} kg
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(record.date + 'T00:00:00').toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};
