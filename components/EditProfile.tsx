import React, { useState } from 'react';
import { ActivityLevel, Goal, UserProfile } from '../types';
import { calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE, calculateBMI, getBMICategory, getBMIDescription } from '../utils';
import { Button } from './Button';
import { User, Activity, Target, LogOut } from 'lucide-react';

interface EditProfileProps {
  user: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    age: user.age,
    height: user.height,
    weight: user.weight,
    activityLevel: user.activityLevel,
    goal: user.goal,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Normalize numeric inputs for BMI display in EditProfile
  const heightNum = Number(formData.height);
  const weightNum = Number(formData.weight);
  const hasValidHeightWeight = Number.isFinite(heightNum) && Number.isFinite(weightNum) && heightNum > 0 && weightNum > 0;
  const bmiValue = hasValidHeightWeight ? calculateBMI(weightNum, heightNum) : null;

  const handleSave = () => {
    // Recalculate stats based on new input
    const weightVal = Number(formData.weight);
    const heightVal = Number(formData.height);
    const bmr = calculateBMR(user.gender, weightVal, heightVal, formData.age);
    const tdee = calculateTDEE(bmr, formData.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, formData.goal);
    const macros = calculateMacros(targetCalories, formData.goal);

    const updatedProfile: UserProfile = {
      ...user,
      ...formData,
      height: heightVal,
      weight: weightVal,
      tdee,
      targetCalories,
      targetProtein: macros.protein,
      targetFat: macros.fat,
      targetCarbs: macros.carbs,
    };
    onSave(updatedProfile);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-slideIn">
      <div className="flex items-center p-4 border-b border-slate-100">
        <button onClick={onCancel} className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-50">
          <LogOut className="rotate-180" size={20}/>
        </button>
        <h1 className="text-lg font-bold ml-2">編輯個人檔案</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        {/* Basic Stats */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
          <h3 className="font-bold text-slate-700">基本資料</h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">年齡</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">身高 (cm)</label>
              <input
                type="number"
                value={formData.height}
                placeholder="範例: 165"
                onChange={(e) => handleChange('height', e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">體重 (kg)</label>
              <input
                type="number"
                value={formData.weight}
                placeholder="範例: 60"
                onChange={(e) => handleChange('weight', e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none font-medium"
              />
            </div>
          </div>

          {/* BMI Display with Progress Bar - left-aligned vertical layout */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4 rounded-lg">
            <p className="text-xs font-semibold text-slate-600 mb-3">體重數值 (BMI)</p>
            
            {/* BMI Number - large and bold */}
            {bmiValue ? (
              <p className={`text-3xl font-bold ${getBMICategory(bmiValue).color} mb-1`}>{bmiValue}</p>
            ) : (
              <p className="text-sm text-slate-400" style={{ fontSize: '14px', marginBottom: '12px' }}>請填寫身高體重計算</p>
            )}
            
            {/* Category label */}
            {bmiValue && (
              <p className={`text-sm font-semibold ${getBMICategory(bmiValue).color} mb-3`}>{getBMICategory(bmiValue).category}</p>
            )}

            {/* BMI Progress Bar */}
            {bmiValue && (
              <div className="mb-3">
                <div className="flex items-center relative rounded-full shadow-md" style={{ height: '14px', overflow: 'visible', background: 'linear-gradient(to right, #3B82F6 0%, #3B82F6 20%, #10B981 20%, #10B981 40%, #F59E0B 40%, #F59E0B 60%, #EF8E51 60%, #EF8E51 80%, #EF4444 80%, #EF4444 100%)' }}>
                  {/* BMI Position Indicator - 16x16, above the bar; only show when valid */}
                  {hasValidHeightWeight && (
                    <div
                      className="absolute bg-white rounded-full flex items-center justify-center"
                      style={{
                        width: '16px',
                        height: '16px',
                        left: `${Math.min(Math.max((bmiValue! - 15) / (40 - 15) * 100, 0), 100)}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 50,
                        boxShadow: '0 4px 8px rgba(15, 23, 42, 0.12)'
                      }}
                    />
                  )}
                </div>

                {/* BMI Scale Labels */}
                <div className="flex justify-between text-xs font-semibold text-slate-600 px-1 mt-1">
                  <span>18.5</span>
                  <span>24</span>
                  <span>27</span>
                  <span>30</span>
                  <span>35</span>
                </div>
              </div>
            )}

            {/* Tip text - only when BMI available */}
            {bmiValue && (
              <p className="text-sm text-slate-600">{getBMIDescription(bmiValue)}</p>
            )}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">活動量等級</label>
          <div className="space-y-2">
            {[
              { val: 'sedentary', label: '久坐 (辦公室工作)' },
              { val: 'light', label: '輕度活動 (1-2天/週)' },
              { val: 'moderate', label: '中度活動 (3-5天/週)' },
              { val: 'active', label: '高度活動 (每天運動)' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleChange('activityLevel', opt.val)}
                className={`w-full p-3 rounded-lg border text-left text-sm font-medium flex items-center transition-colors ${
                  formData.activityLevel === opt.val
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <Activity size={16} className="mr-2" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">目標</label>
          <div className="space-y-2">
            {[
              { val: 'lose', label: '減重' },
              { val: 'maintain', label: '維持體重' },
              { val: 'gain', label: '增肌' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleChange('goal', opt.val)}
                className={`w-full p-3 rounded-lg border text-left text-sm font-medium flex items-center transition-colors ${
                  formData.goal === opt.val
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                <Target size={16} className="mr-2" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-100 pb-8">
        <Button fullWidth onClick={handleSave}>
          更新並重新計算
        </Button>
      </div>
    </div>
  );
};