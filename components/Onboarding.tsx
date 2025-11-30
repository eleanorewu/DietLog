import React, { useState } from 'react';
import { ActivityLevel, Gender, Goal, UserProfile } from '../types';
import { calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE, calculateBMI, getBMICategory, getBMIDescription } from '../utils';
import { Button } from './Button';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [touched, setTouched] = useState({
    name: false,
    age: false,
    height: false,
    weight: false,
    targetWeight: false,
    weeklyWeightLoss: false,
  });
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female' as Gender,
    age: '' as number | string,
    // no defaults for height/weight per design request
    height: '' as number | string,
    weight: '' as number | string,
    activityLevel: 'light' as ActivityLevel,
    goal: 'lose' as Goal,
    targetWeight: '' as number | string,
    weeklyWeightLoss: '' as number | string,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Error messages
  const getNameError = () => {
    if (!touched.name) return '';
    if (formData.name.trim() === '') return '請輸入名字';
    return '';
  };

  const getAgeError = () => {
    if (!touched.age) return '';
    if (formData.age === '') return '請輸入年齡';
    const ageNum = Number(formData.age);
    if (!Number.isFinite(ageNum) || ageNum <= 0) return '請輸入有效的年齡';
    return '';
  };

  const getHeightError = () => {
    if (!touched.height) return '';
    if (formData.height === '') return '請輸入身高';
    const heightNum = Number(formData.height);
    if (!Number.isFinite(heightNum) || heightNum <= 0) return '請輸入有效的身高（公分）';
    return '';
  };

  const getWeightError = () => {
    if (!touched.weight) return '';
    if (formData.weight === '') return '請輸入體重';
    const weightNum = Number(formData.weight);
    if (!Number.isFinite(weightNum) || weightNum <= 0) return '請輸入有效的體重（公斤）';
    return '';
  };

  const getTargetWeightError = () => {
    if (!touched.targetWeight) return '';
    if (formData.targetWeight === '') return '請輸入目標體重';
    const targetWeightNum = Number(formData.targetWeight);
    if (!Number.isFinite(targetWeightNum) || targetWeightNum <= 0) return '請輸入有效的目標體重（公斤）';
    return '';
  };

  const getWeeklyWeightLossError = () => {
    if (!touched.weeklyWeightLoss) return '';
    if (formData.weeklyWeightLoss === '') return '請輸入預計每週減重';
    const weeklyWeightLossNum = Number(formData.weeklyWeightLoss);
    if (!Number.isFinite(weeklyWeightLossNum) || weeklyWeightLossNum <= 0) return '請輸入有效的每週減重數值（公斤）';
    return '';
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

  // Normalize numeric inputs for BMI display
  const heightNum = Number(formData.height);
  const weightNum = Number(formData.weight);
  const ageNum = Number(formData.age);
  const targetWeightNum = Number(formData.targetWeight);
  const weeklyWeightLossNum = Number(formData.weeklyWeightLoss);
  
  const hasValidHeightWeight = Number.isFinite(heightNum) && Number.isFinite(weightNum) && heightNum > 0 && weightNum > 0;
  const bmiValue = hasValidHeightWeight ? calculateBMI(weightNum, heightNum) : null;

  // Validation helpers
  const isStep1Valid = formData.name.trim() !== '' && 
                       formData.age !== '' && 
                       Number.isFinite(ageNum) && 
                       ageNum > 0;
  
  const isStep2Valid = formData.height !== '' && 
                       formData.weight !== '' && 
                       Number.isFinite(heightNum) && 
                       Number.isFinite(weightNum) && 
                       heightNum > 0 && 
                       weightNum > 0;
  
  const isStep4Valid = formData.targetWeight !== '' && 
                       formData.weeklyWeightLoss !== '' && 
                       Number.isFinite(targetWeightNum) && 
                       Number.isFinite(weeklyWeightLossNum) && 
                       targetWeightNum > 0 && 
                       weeklyWeightLossNum > 0;

  // Calculate weeks to reach target weight (rounded up)
  const calculateWeeksToTarget = () => {
    if (!isStep2Valid || !isStep4Valid) return 0;
    const weightDiff = Math.abs(weightNum - targetWeightNum);
    const weeks = weightDiff / weeklyWeightLossNum;
    return Math.ceil(weeks);
  };

  const handleFinish = () => {
    const weightNum = Number(formData.weight);
    const heightNum = Number(formData.height);
    const ageNum = Number(formData.age);
    const targetWeightNum = Number(formData.targetWeight);
    const weeklyWeightLossNum = Number(formData.weeklyWeightLoss);
    
    const bmr = calculateBMR(formData.gender, weightNum, heightNum, ageNum);
    const tdee = calculateTDEE(bmr, formData.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, formData.goal);
    const macros = calculateMacros(targetCalories, formData.goal);

    const profile: UserProfile = {
      name: formData.name,
      gender: formData.gender,
      age: ageNum,
      height: heightNum,
      weight: weightNum,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
      targetWeight: targetWeightNum,
      weeklyWeightLoss: weeklyWeightLossNum,
      tdee,
      targetCalories,
      targetProtein: macros.protein,
      targetFat: macros.fat,
      targetCarbs: macros.carbs,
    };
    onComplete(profile);
  };

  const genderLabels = {
    male: '生理男',
    female: '生理女'
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - 固定在頂部 */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-md mx-auto px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">歡迎使用 DietLog</h1>
          <p className="text-sm text-slate-500">讓我們為您建立個人化計畫。</p>
        </div>
        
        {/* 進度條 */}
        <div className="relative">
          <div className="w-full" style={{ height: '3px', backgroundColor: '#f1f5f9' }}>
            <div 
              className="h-full bg-emerald-500 transition-all duration-300 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
          {/* 步驟提示 */}
          <div className="absolute right-2 -bottom-5">
            <span className="text-xs">
              <span className="text-slate-600">{step}</span>
              <span className="text-slate-400"> / 5</span>
            </span>
          </div>
        </div>
      </div>

      {/* 內容區域 - 可滾動 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-6 py-6">
          {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">請問您的名字是？<span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none ${
                  getNameError() ? 'border-red-500' : 'border-slate-200'
                }`}
                placeholder="輸入名字"
                required
              />
              {getNameError() && (
                <p className="text-red-500 text-xs mt-1">{getNameError()}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">性別</label>
              <div className="grid grid-cols-2 gap-4">
                {(['male', 'female'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => handleChange('gender', g)}
                    className={`px-4 py-3 rounded-xl border-2 font-medium ${
                      formData.gender === g
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 bg-white text-slate-500'
                    }`}
                  >
                    {genderLabels[g]}
                  </button>
                ))}
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">年齡<span className="text-red-500">*</span></label>
              <div className={`flex items-center bg-white border rounded-xl px-4 py-3 ${
                getAgeError() ? 'border-red-500' : 'border-slate-200'
              }`}>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (/^\d+$/.test(val) && parseInt(val) > 0)) {
                      handleChange('age', val);
                    }
                  }}
                  onBlur={() => handleBlur('age')}
                  className="w-full outline-none"
                  placeholder="輸入年齡"
                  min="1"
                  step="1"
                  required
                />
              </div>
              {getAgeError() && (
                <p className="text-red-500 text-xs mt-1">{getAgeError()}</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">身高 (cm)<span className="text-red-500">*</span></label>
              <div className={`flex items-center bg-white border rounded-xl px-4 py-3 ${
                getHeightError() ? 'border-red-500' : 'border-slate-200'
              }`}>
                <input
                  type="text"
                  value={formData.height}
                  placeholder="範例: 165.5"
                  onChange={(e) => handleDecimalInput(e.target.value, 'height')}
                  onBlur={() => handleBlur('height')}
                  className="w-full outline-none"
                  required
                />
              </div>
              {getHeightError() && (
                <p className="text-red-500 text-xs mt-1">{getHeightError()}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">體重 (kg)<span className="text-red-500">*</span></label>
              <div className={`flex items-center bg-white border rounded-xl px-4 py-3 ${
                getWeightError() ? 'border-red-500' : 'border-slate-200'
              }`}>
                <input
                  type="text"
                  value={formData.weight}
                  placeholder="範例: 60.45"
                  onChange={(e) => handleDecimalInput(e.target.value, 'weight')}
                  onBlur={() => handleBlur('weight')}
                  className="w-full outline-none"
                  required
                />
              </div>
              {getWeightError() && (
                <p className="text-red-500 text-xs mt-1">{getWeightError()}</p>
              )}
            </div>

            {/* BMI Display with Progress Bar - left-aligned vertical layout */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
              <p className="text-xs font-semibold text-slate-500 mb-3">體重數值 (BMI)</p>
              
              {/* BMI Number - large and bold */}
              {bmiValue ? (
                <p className={`text-4xl font-bold ${getBMICategory(bmiValue).color} mb-1`}>{bmiValue}</p>
              ) : (
                <p className="text-sm text-slate-400" style={{ fontSize: '14px', marginBottom: '12px' }}>請填寫身高體重計算</p>
              )}
              
              {/* Category label */}
              {bmiValue && (
                <p className={`text-sm font-semibold ${getBMICategory(bmiValue).color} mb-3`}>{getBMICategory(bmiValue).category}</p>
              )}

              {/* Tip text - only when BMI available */}
              {bmiValue && (
                <p className="text-sm text-slate-600">{getBMIDescription(bmiValue)}</p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">活動量等級</label>
              <div className="space-y-3">
                {[
                  { val: 'sedentary', label: '久坐 (辦公室工作)' },
                  { val: 'light', label: '輕度活動 (每週運動 1-2 天)' },
                  { val: 'moderate', label: '中度活動 (每週運動 3-5 天)' },
                  { val: 'active', label: '高度活動 (每天運動)' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => handleChange('activityLevel', opt.val)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left font-medium ${
                      formData.activityLevel === opt.val
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 bg-white text-slate-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">您的目標</label>
              <div className="space-y-3">
                {[
                  { val: 'lose', label: '減重' },
                  { val: 'maintain', label: '維持體重' },
                  { val: 'gain', label: '增肌' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => handleChange('goal', opt.val)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left font-medium ${
                      formData.goal === opt.val
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 bg-white text-slate-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">目標體重 (kg)<span className="text-red-500">*</span></label>
              <div className={`flex items-center bg-white border rounded-xl px-4 py-3 ${
                getTargetWeightError() ? 'border-red-500' : 'border-slate-200'
              }`}>
                <input
                  type="text"
                  value={formData.targetWeight}
                  placeholder="範例: 55.50"
                  onChange={(e) => handleDecimalInput(e.target.value, 'targetWeight')}
                  onBlur={() => handleBlur('targetWeight')}
                  className="w-full outline-none"
                  required
                />
              </div>
              {getTargetWeightError() && (
                <p className="text-red-500 text-xs mt-1">{getTargetWeightError()}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">預計每週減重 (kg/週)<span className="text-red-500">*</span></label>
              <div className={`flex items-center bg-white border rounded-xl px-4 py-3 ${
                getWeeklyWeightLossError() ? 'border-red-500' : 'border-slate-200'
              }`}>
                <input
                  type="text"
                  value={formData.weeklyWeightLoss}
                  placeholder="範例: 0.5"
                  onChange={(e) => handleDecimalInput(e.target.value, 'weeklyWeightLoss')}
                  onBlur={() => handleBlur('weeklyWeightLoss')}
                  className="w-full outline-none"
                  required
                />
              </div>
              {getWeeklyWeightLossError() && (
                <p className="text-red-500 text-xs mt-1">{getWeeklyWeightLossError()}</p>
              )}
            </div>

            {/* Display estimated weeks to reach target */}
            {isStep2Valid && isStep4Valid && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <p className="text-xs font-semibold text-slate-500 mb-2">預估達成時間</p>
                <p className="text-2xl font-bold text-blue-700 mb-1">
                  約 {calculateWeeksToTarget()} 週
                </p>
                <p className="text-sm text-slate-600">
                  從目前 {Number(formData.weight).toFixed(2)} kg 到目標 {Number(formData.targetWeight).toFixed(2)} kg
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  需減重 {Math.abs(weightNum - targetWeightNum).toFixed(2)} kg，
                  每週減 {Number(formData.weeklyWeightLoss).toFixed(2)} kg
                </p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* 底部按鈕區域 - 固定在底部 */}
      <div className="bg-white border-t border-slate-100 p-6 max-w-md mx-auto w-full">
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              上一步
            </Button>
          )}
          <Button
            fullWidth={step === 1}
            className={step === 1 ? '' : 'flex-1'}
            disabled={
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid) ||
              (step === 5 && !isStep4Valid)
            }
            onClick={() => {
              if (step < 5) setStep(step + 1);
              else handleFinish();
            }}
          >
            {step === 5 ? '建立計畫' : '下一步'}
          </Button>
        </div>
      </div>
    </div>
  );
};