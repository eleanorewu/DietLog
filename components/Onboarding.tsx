import React, { useState } from 'react';
import { ActivityLevel, Gender, Goal, UserProfile } from '../types';
import { calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE, calculateBMI, getBMICategory, getBMIDescription } from '../utils';
import { Button } from './Button';
import { Ruler, Weight, User, Activity, Target } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female' as Gender,
    age: 25,
    // no defaults for height/weight per design request
    height: '' as number | string,
    weight: '' as number | string,
    activityLevel: 'light' as ActivityLevel,
    goal: 'lose' as Goal,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Normalize numeric inputs for BMI display
  const heightNum = Number(formData.height);
  const weightNum = Number(formData.weight);
  const hasValidHeightWeight = Number.isFinite(heightNum) && Number.isFinite(weightNum) && heightNum > 0 && weightNum > 0;
  const bmiValue = hasValidHeightWeight ? calculateBMI(weightNum, heightNum) : null;

  const handleFinish = () => {
    const weightNum = Number(formData.weight);
    const heightNum = Number(formData.height);
    const bmr = calculateBMR(formData.gender, weightNum, heightNum, formData.age);
    const tdee = calculateTDEE(bmr, formData.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, formData.goal);
    const macros = calculateMacros(targetCalories, formData.goal);

    const profile: UserProfile = {
      ...formData,
      height: heightNum,
      weight: weightNum,
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
    <div className="flex flex-col h-full p-6 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">歡迎使用 NutriLog</h1>
        <p className="text-slate-500 mb-8">讓我們為您建立個人化計畫。</p>

        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">請問您的名字是？</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="輸入名字"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">性別</label>
              <div className="grid grid-cols-2 gap-4">
                {(['male', 'female'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => handleChange('gender', g)}
                    className={`p-4 rounded-xl border-2 font-medium ${
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
              <label className="block text-sm font-medium text-slate-700 mb-2">年齡</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-3">
                <User className="text-slate-400 mr-3" />
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  className="w-full outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">身高 (cm)</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-3">
                <Ruler className="text-slate-400 mr-3" />
                <input
                  type="number"
                  value={formData.height}
                  placeholder="範例: 165"
                  onChange={(e) => handleChange('height', e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">體重 (kg)</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-3">
                <Weight className="text-slate-400 mr-3" />
                <input
                  type="number"
                  value={formData.weight}
                  placeholder="範例: 60"
                  onChange={(e) => handleChange('weight', e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full outline-none"
                />
              </div>
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
                    className={`w-full p-4 rounded-xl border-2 text-left font-medium flex items-center ${
                      formData.activityLevel === opt.val
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 bg-white text-slate-500'
                    }`}
                  >
                    <Activity size={20} className="mr-3" />
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
                    className={`w-full p-4 rounded-xl border-2 text-left font-medium flex items-center ${
                      formData.goal === opt.val
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 bg-white text-slate-500'
                    }`}
                  >
                    <Target size={20} className="mr-3" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex space-x-4">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
            上一步
          </Button>
        )}
        <Button
          fullWidth
          className="flex-1"
          onClick={() => {
            if (step < 4) setStep(step + 1);
            else handleFinish();
          }}
        >
          {step === 4 ? '建立計畫' : '下一步'}
        </Button>
      </div>
    </div>
  );
};