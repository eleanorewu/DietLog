import React, { useState } from 'react';
import { ActivityLevel, Goal, UserProfile } from '../../types';
import { calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE, calculateBMI, getBMICategory, getBMIDescription } from '../../utils';
import { Button } from '../ui/Button';
import { LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface EditProfileProps {
  user: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ user, onSave, onCancel }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: user.name,
    age: user.age,
    height: user.height,
    weight: user.weight,
    activityLevel: user.activityLevel,
    goal: user.goal,
    targetWeight: user.targetWeight,
    weeklyWeightLoss: user.weeklyWeightLoss,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper function to handle decimal input with max 2 decimal places
  const handleDecimalInput = (value: string, field: string) => {
    // Allow empty string
    if (value === '') {
      handleChange(field, '');
      return;
    }
    
    // Allow numbers with up to 2 decimal places
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value)) {
      handleChange(field, value);
    }
  };

  // Normalize numeric inputs for BMI display in EditProfile
  const heightNum = Number(formData.height);
  const weightNum = Number(formData.weight);
  const targetWeightNum = Number(formData.targetWeight);
  const weeklyWeightLossNum = Number(formData.weeklyWeightLoss);
  
  const hasValidHeightWeight = Number.isFinite(heightNum) && Number.isFinite(weightNum) && heightNum > 0 && weightNum > 0;
  const bmiValue = hasValidHeightWeight ? calculateBMI(weightNum, heightNum) : null;

  // Calculate weeks to reach target weight
  const calculateWeeksToTarget = () => {
    if (!hasValidHeightWeight || !Number.isFinite(targetWeightNum) || !Number.isFinite(weeklyWeightLossNum) || 
        targetWeightNum <= 0 || weeklyWeightLossNum <= 0) return 0;
    const weightDiff = Math.abs(weightNum - targetWeightNum);
    const weeks = weightDiff / weeklyWeightLossNum;
    return Math.ceil(weeks);
  };

  const handleSave = () => {
    // Recalculate stats based on new input
    const weightVal = Number(formData.weight);
    const heightVal = Number(formData.height);
    const targetWeightVal = Number(formData.targetWeight);
    const weeklyWeightLossVal = Number(formData.weeklyWeightLoss);
    
    const bmr = calculateBMR(user.gender, weightVal, heightVal, formData.age);
    const tdee = calculateTDEE(bmr, formData.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, formData.goal);
    const macros = calculateMacros(targetCalories, formData.goal);

    const updatedProfile: UserProfile = {
      ...user,
      name: formData.name,
      age: formData.age,
      height: heightVal,
      weight: weightVal,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      targetWeight: targetWeightVal,
      weeklyWeightLoss: weeklyWeightLossVal,
      tdee,
      targetCalories,
      targetProtein: macros.protein,
      targetFat: macros.fat,
      targetCarbs: macros.carbs,
    };
    onSave(updatedProfile);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 animate-slideIn transition-colors duration-200">
      <div className="flex items-center p-4">
        <button onClick={onCancel} className="p-2 -ml-2 text-slate-600 dark:text-gray-300 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors duration-200">
          <LogOut className="rotate-180" size={24}/>
        </button>
        <h1 className="text-xl font-bold ml-2 text-slate-900 dark:text-gray-100">編輯個人檔案</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        {/* Basic Stats */}
        <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-xl space-y-4 transition-colors duration-200">
          <h3 className="font-bold text-slate-700 dark:text-gray-200">基本資料</h3>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 mb-1">年齡<span className="text-red-500 dark:text-red-400">*</span></label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (/^\d+$/.test(val) && parseInt(val) > 0)) {
                  handleChange('age', parseInt(val) || '');
                }
              }}
              className="w-full bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 rounded-lg p-2 outline-none font-medium text-slate-900 dark:text-gray-100 transition-colors duration-200"
              min="1"
              step="1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 mb-1">身高 (cm)<span className="text-red-500 dark:text-red-400">*</span></label>
              <input
                type="text"
                value={formData.height}
                placeholder="範例: 165.5"
                onChange={(e) => handleDecimalInput(e.target.value, 'height')}
                className="w-full bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 rounded-lg p-2 outline-none font-medium text-slate-900 dark:text-gray-100 transition-colors duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 mb-1">
                初始體重 (kg)<span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.weight}
                placeholder="範例: 60.45"
                onChange={(e) => handleDecimalInput(e.target.value, 'weight')}
                className="w-full bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 rounded-lg p-2 outline-none font-medium text-slate-900 dark:text-gray-100 transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* 提示訊息 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>初始體重</strong>用於計算基礎代謝率。日常體重測量請使用「當前體重」功能。
            </p>
          </div>

          {/* BMI Display with Progress Bar - left-aligned vertical layout */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border border-emerald-200 dark:border-emerald-700 p-4 rounded-lg transition-colors duration-200">
            <p className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-3">體重數值 (BMI)</p>
            
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

            
            {/* Tip text - only when BMI available */}
            {bmiValue && (
              <p className="text-sm text-slate-600 dark:text-gray-300">{getBMIDescription(bmiValue)}</p>
            )}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-200 mb-2">活動量等級</label>
          <div className="space-y-2">
            {[
              { val: 'sedentary', label: '久坐 (辦公室工作)' },
              { val: 'light', label: '輕度活動 (1-2天/週)' },
              { val: 'moderate', label: '中度活動 (3-5天/週)' },
              { val: 'active', label: '高度活動 (每天運動)' },
              { val: 'veryActive', label: '超高度活動 (每天高強度運動或體力工作)' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleChange('activityLevel', opt.val)}
                className={`w-full p-3 rounded-lg border text-left text-sm font-medium transition-colors ${
                  formData.activityLevel === opt.val
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-200 mb-2">目標</label>
          <div className="space-y-2">
            {[
              { val: 'lose', label: '減重' },
              { val: 'maintain', label: '維持體重' },
              { val: 'gain', label: '增肌' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => handleChange('goal', opt.val)}
                className={`w-full p-3 rounded-lg border text-left text-sm font-medium transition-colors ${
                  formData.goal === opt.val
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Weight and Weekly Weight Loss */}
        <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-xl space-y-4 transition-colors duration-200">
          <h3 className="font-bold text-slate-700 dark:text-gray-200">減重計劃</h3>          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 mb-1">目標體重 (kg)<span className="text-red-500 dark:text-red-400">*</span></label>
              <input
                type="text"
                value={formData.targetWeight}
                placeholder="範例: 55.50"
                onChange={(e) => handleDecimalInput(e.target.value, 'targetWeight')}
                className="w-full bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 rounded-lg p-2 outline-none font-medium text-slate-900 dark:text-gray-100 transition-colors duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 mb-1">每週減重 (kg)<span className="text-red-500 dark:text-red-400">*</span></label>
              <input
                type="text"
                value={formData.weeklyWeightLoss}
                placeholder="範例: 0.5"
                onChange={(e) => handleDecimalInput(e.target.value, 'weeklyWeightLoss')}
                className="w-full bg-white dark:bg-gray-600 border border-slate-200 dark:border-gray-500 rounded-lg p-2 outline-none font-medium text-slate-900 dark:text-gray-100 transition-colors duration-200"
                required
              />
            </div>
          </div>

          {/* Display estimated weeks to reach target */}
          {hasValidHeightWeight && Number.isFinite(targetWeightNum) && Number.isFinite(weeklyWeightLossNum) && 
           targetWeightNum > 0 && weeklyWeightLossNum > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 p-3 rounded-lg transition-colors duration-200">
              <p className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">預估達成時間</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-1">
                約 {calculateWeeksToTarget()} 週
              </p>
              <p className="text-xs text-slate-600 dark:text-gray-300">
                從目前 {weightNum.toFixed(2)} kg 到目標 {targetWeightNum.toFixed(2)} kg
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                需減重 {Math.abs(weightNum - targetWeightNum).toFixed(2)} kg，
                每週減 {weeklyWeightLossNum.toFixed(2)} kg
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 pb-8 transition-colors duration-200">
        <Button fullWidth onClick={handleSave}>
          更新並重新計算
        </Button>
      </div>
    </div>
  );
};