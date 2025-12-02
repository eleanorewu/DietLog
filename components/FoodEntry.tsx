import React, { useState, useRef, useEffect } from 'react';
import { FoodLog, MealType } from '../types';
import { Button } from './Button';
import { generateId, getTodayString, isFutureDate } from '../utils';
import { LogOut, Image as ImageIcon, Trash2, Lock } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Dialog } from './Dialog';
import { useTheme } from '../contexts/ThemeContext';

interface FoodEntryProps {
  onSave: (log: FoodLog) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
  initialDate?: string;
  initialData?: FoodLog | null;
  initialMealType?: MealType;
}

export const FoodEntry: React.FC<FoodEntryProps> = ({ 
  onSave, 
  onDelete,
  onCancel, 
  initialDate,
  initialData,
  initialMealType
}) => {
  const { theme } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  }>({});
  const [formData, setFormData] = useState({
    name: '',
    mealType: (initialMealType || 'breakfast') as MealType,
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
    } else if (initialMealType) {
      // If no initialData but has initialMealType, set the mealType
      setFormData(prev => ({
        ...prev,
        mealType: initialMealType
      }));
    }
  }, [initialData, initialMealType]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        setIsCompressing(true);
        
        // 壓縮設定
        const options = {
          maxSizeMB: 1,              // 最大檔案大小 1MB
          maxWidthOrHeight: 1920,    // 最大寬度或高度
          useWebWorker: true,        // 使用 Web Worker 提升效能
          fileType: 'image/jpeg',    // 輸出格式
        };
        
        // 壓縮圖片
        const compressedFile = await imageCompression(file, options);
        
        // 將壓縮後的圖片轉為 base64 URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressedFile);
        
      } catch (error) {
        console.error('圖片壓縮失敗:', error);
        // 壓縮失敗時使用原始圖片
        const objectUrl = URL.createObjectURL(file);
        setPhotoPreview(objectUrl);
        setIsCompressing(false);
      }
    }
  };

  const handleChange = (field: string, value: any) => {
    // 如果是數字欄位，只允許數字和空字串
    if (['calories', 'protein', 'carbs', 'fat'].includes(field)) {
      // 允許空字串、數字、或以數字開頭的字串
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // 清除該欄位的錯誤訊息
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      } else {
        // 顯示該欄位的錯誤訊息
        setFieldErrors((prev) => ({ ...prev, [field]: '請輸入有效的數字' }));
        // 3秒後自動清除錯誤訊息
        setTimeout(() => {
          setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        }, 3000);
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
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
      setDeleteDialogOpen(true);
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 animate-slideIn transition-colors duration-200">
      {/* 未來日期警告 */}
      {isFutureDate_flag && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-6 py-3 flex items-center space-x-2">
          <Lock size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">未來日期無法編輯，請返回選擇當日或過去日期</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button onClick={onCancel} className="p-2 -ml-2 text-slate-600 dark:text-gray-300 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors duration-200">
            <LogOut className="rotate-180" size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2 text-slate-900 dark:text-gray-100">{initialData ? '編輯飲食紀錄' : '新增飲食'}</h1>
        </div>
        {initialData && !isFutureDate_flag && (
          <button onClick={handleDelete} className="p-2 text-red-500 dark:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200">
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Image Upload Area */}
        <div 
          className={`h-64 bg-slate-50 dark:bg-gray-800 relative flex items-center justify-center group transition-colors duration-200 ${
            isFutureDate_flag ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !isFutureDate_flag && !isCompressing && fileInputRef.current?.click()}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center text-emerald-500 dark:text-emerald-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 dark:border-emerald-400 mb-3"></div>
              <span className="font-medium">壓縮圖片中...</span>
            </div>
          ) : photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-slate-400 dark:text-gray-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
              <ImageIcon size={48} className="mb-2" />
              <span className="font-medium">上傳圖片</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange} 
          />
          {photoPreview && !isCompressing && (
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
            <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2">食物名稱</label>
            <input
              type="text"
              placeholder="例如：雞胸肉沙拉"
              value={formData.name}
              onChange={(e) => !isFutureDate_flag && handleChange('name', e.target.value)}
              disabled={isFutureDate_flag}
              className="w-full text-xl font-semibold border-b border-slate-200 dark:border-gray-600 py-2 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none bg-transparent placeholder-slate-300 dark:placeholder-gray-600 text-slate-900 dark:text-gray-100 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Meal Type */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">餐別</label>
            <div className="grid grid-cols-4 gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => !isFutureDate_flag && handleChange('mealType', type)}
                  disabled={isFutureDate_flag}
                  className={`py-2 px-1 rounded-lg text-sm font-medium truncate transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.mealType === type
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {mealTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Macros Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3">營養成分</label>
            <div className="space-y-3">
              <div className="col-span-1">
                <label className="text-xs text-slate-500 dark:text-gray-400 mb-2 block">熱量 (kcal)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={formData.calories}
                  onChange={(e) => handleChange('calories', e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-gray-700 rounded-xl text-2xl font-bold text-emerald-600 dark:text-emerald-400 outline-none border-2 border-transparent focus:border-emerald-500 dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-gray-600 transition-all"
                />
                {fieldErrors.calories && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1">{fieldErrors.calories}</p>
                )}
              </div>
              <div className="space-y-3">
                 <div className="flex flex-col min-w-0">
                    <label className="text-xs text-slate-500 dark:text-gray-400 font-medium mb-1">蛋白質 (g)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={formData.protein}
                      onChange={(e) => handleChange('protein', e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-gray-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-gray-100 outline-none border-2 border-transparent focus:border-emerald-500 dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-gray-600 transition-all"
                    />
                    {fieldErrors.protein && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{fieldErrors.protein}</p>
                    )}
                 </div>
                 <div className="flex flex-col min-w-0">
                    <label className="text-xs text-slate-500 dark:text-gray-400 font-medium mb-1">碳水 (g)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={formData.carbs}
                      onChange={(e) => handleChange('carbs', e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-gray-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-gray-100 outline-none border-2 border-transparent focus:border-emerald-500 dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-gray-600 transition-all"
                    />
                    {fieldErrors.carbs && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{fieldErrors.carbs}</p>
                    )}
                 </div>
                 <div className="flex flex-col min-w-0">
                    <label className="text-xs text-slate-500 dark:text-gray-400 font-medium mb-1">脂肪 (g)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={formData.fat}
                      onChange={(e) => handleChange('fat', e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-gray-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-gray-100 outline-none border-2 border-transparent focus:border-emerald-500 dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-gray-600 transition-all"
                    />
                    {fieldErrors.fat && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{fieldErrors.fat}</p>
                    )}
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Sticky Bottom Button */}
      <div className="p-4 bg-white dark:bg-gray-900 pb-8 transition-colors duration-200">
        <Button 
          fullWidth 
          onClick={handleSubmit}
          disabled={isFutureDate_flag}
          className={isFutureDate_flag ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {initialData ? '更新紀錄' : '儲存紀錄'}
        </Button>
      </div>
      
      {/* 刪除確認 Dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          if (initialData && onDelete) {
            onDelete(initialData.id);
          }
        }}
        title="刪除飲食紀錄"
        message="確定要刪除這筆紀錄嗎？此操作無法復原。"
        confirmText="刪除"
        cancelText="取消"
        isDangerous={true}
      />
    </div>
  );
};