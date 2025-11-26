import React, { useState, useRef, useEffect } from 'react';
import { FoodLog, MealType } from '../types';
import { Button } from './Button';
import { generateId, getTodayString, isFutureDate } from '../utils';
import { Camera, ArrowLeft, Image as ImageIcon, Trash2, Lock } from 'lucide-react';

interface FoodEntryProps {
  onSave: (log: FoodLog) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
  initialDate?: string;
  initialData?: FoodLog | null;
}

export const FoodEntry: React.FC<FoodEntryProps> = ({ 
  onSave, 
  onDelete,
  onCancel, 
  initialDate,
  initialData 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    mealType: 'breakfast' as MealType,
    calories: '' as string | number,
    protein: '' as string | number,
    fat: '' as string | number,
    carbs: '' as string | number,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        mealType: initialData.mealType,
        calories: initialData.calories,
        protein: initialData.protein,
        fat: initialData.fat,
        carbs: initialData.carbs,
      });
      if (initialData.photoUrl) {
        setPhotoPreview(initialData.photoUrl);
      }
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const log: FoodLog = {
      id: initialData ? initialData.id : generateId(),
      date: initialData ? initialData.date : (initialDate || getTodayString()),
      timestamp: initialData ? initialData.timestamp : Date.now(),
      name: formData.name || '未知名稱',
      mealType: formData.mealType,
      photoUrl: photoPreview || undefined,
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      fat: Number(formData.fat) || 0,
      carbs: Number(formData.carbs) || 0,
    };
    onSave(log);
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
      if (confirm('確定要刪除這筆紀錄嗎？')) {
        onDelete(initialData.id);
      }
    }
  };

  const mealTypeLabels: Record<MealType, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '點心'
  };

  const recordDate = initialData ? initialData.date : (initialDate || getTodayString());
  const isFutureDate_flag = isFutureDate(recordDate);

  return (
    <div className="flex flex-col h-full bg-white animate-slideIn">
      {/* 未來日期警告 */}
      {isFutureDate_flag && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center space-x-2">
          <Lock size={16} className="text-amber-600 flex-shrink-0" />
          <span className="text-xs text-amber-700 font-medium">未來日期無法編輯，請返回選擇當日或過去日期</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center">
          <button onClick={onCancel} className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-50">
            <ArrowLeft />
          </button>
          <h1 className="text-lg font-bold ml-2">{initialData ? '編輯紀錄' : '新增飲食'}</h1>
        </div>
        {initialData && !isFutureDate_flag && (
          <button onClick={handleDelete} className="p-2 text-red-500 rounded-full hover:bg-red-50">
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Image Upload Area */}
        <div 
          className={`h-64 bg-slate-50 relative flex items-center justify-center border-b border-slate-100 group ${
            isFutureDate_flag ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !isFutureDate_flag && fileInputRef.current?.click()}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-500 transition-colors">
              <Camera size={48} className="mb-2" />
              <span className="font-medium">點擊拍攝照片</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange} 
          />
          {photoPreview && (
            <button 
              className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <ImageIcon size={20} />
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className={`p-6 space-y-6 ${isFutureDate_flag ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">食物名稱</label>
            <input
              type="text"
              placeholder="例如：雞胸肉沙拉"
              value={formData.name}
              onChange={(e) => !isFutureDate_flag && handleChange('name', e.target.value)}
              disabled={isFutureDate_flag}
              className="w-full text-xl font-semibold border-b border-slate-200 py-2 focus:border-emerald-500 outline-none bg-transparent placeholder-slate-300 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Meal Type */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">餐別</label>
            <div className="grid grid-cols-4 gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => !isFutureDate_flag && handleChange('mealType', type)}
                  disabled={isFutureDate_flag}
                  className={`py-2 px-1 rounded-lg text-sm font-medium truncate transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.mealType === type
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {mealTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Macros Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">營養成分</label>
            <div className="space-y-3">
              <div className="col-span-1">
                <label className="text-xs text-slate-500 mb-2 block">熱量 (kcal)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.calories}
                  onChange={(e) => handleChange('calories', e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-xl text-2xl font-bold text-emerald-600 outline-none border border-transparent focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-3">
                 <div className="flex flex-col min-w-0">
                    <label className="text-xs text-slate-500 font-medium mb-1">蛋白質 (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.protein}
                      onChange={(e) => handleChange('protein', e.target.value)}
                      className="w-full p-2 bg-slate-50 rounded-lg text-sm font-semibold outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                    />
                 </div>
                 <div className="flex flex-col min-w-0">
                    <label className="text-xs text-slate-500 font-medium mb-1">碳水 (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.carbs}
                      onChange={(e) => handleChange('carbs', e.target.value)}
                      className="w-full p-2 bg-slate-50 rounded-lg text-sm font-semibold outline-none focus:ring-1 focus:ring-orange-500 transition-shadow"
                    />
                 </div>
                 <div className="flex flex-col min-w-0">
                    <label className="text-xs text-slate-500 font-medium mb-1">脂肪 (g)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.fat}
                      onChange={(e) => handleChange('fat', e.target.value)}
                      className="w-full p-2 bg-slate-50 rounded-lg text-sm font-semibold outline-none focus:ring-1 focus:ring-yellow-500 transition-shadow"
                    />
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Sticky Bottom Button */}
      <div className="p-4 bg-white border-t border-slate-100 pb-8">
        <Button 
          fullWidth 
          onClick={handleSubmit}
          disabled={isFutureDate_flag}
          className={isFutureDate_flag ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {initialData ? '更新紀錄' : '儲存紀錄'}
        </Button>
      </div>
    </div>
  );
};