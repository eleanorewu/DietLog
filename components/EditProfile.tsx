import React, { useState } from 'react';
import { ActivityLevel, Goal, UserProfile } from '../types';
import { calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from '../utils';
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

  const handleSave = () => {
    // Recalculate stats based on new input
    const bmr = calculateBMR(user.gender, formData.weight, formData.height, formData.age);
    const tdee = calculateTDEE(bmr, formData.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, formData.goal);
    const macros = calculateMacros(targetCalories, formData.goal);

    const updatedProfile: UserProfile = {
      ...user,
      ...formData,
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
                onChange={(e) => handleChange('height', parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">體重 (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 outline-none font-medium"
              />
            </div>
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