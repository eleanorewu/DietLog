import React, { useState, useEffect } from 'react';
import { Onboarding, Dashboard, FoodEntry, EditProfile, MonthCalendarView, WeightDataList } from './components/pages';
import { WeightTracking, CalorieTracking } from './components/features';
import { ThemeToggle, Dialog } from './components/ui';
import { FoodLog, UserProfile, WeightRecord } from './types';
import { Trash2, LogOut, SquarePen } from 'lucide-react';
import { getTodayString, calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from './utils';
import { ThemeProvider } from './contexts/ThemeContext';
import { useUserProfile, useFoodLogs, useWeightRecords, useNavigation } from './hooks';

function App() {
  // 使用 custom hooks 管理狀態
  const { user, setUser, updateUser, resetUser } = useUserProfile();
  const { logs, addLog, updateLog, deleteLog, resetLogs } = useFoodLogs();
  const { weightRecords, addWeightRecord, deleteWeightRecord, resetWeightRecords } = useWeightRecords();
  const { view, selectedDate, setSelectedDate, navigateTo, navigateToDate } = useNavigation();
  
  // UI 狀態
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<FoodLog | null>(null);
  const [defaultMealType, setDefaultMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | undefined>(undefined);

  // 初始化：檢查是否有使用者資料，設置初始體重記錄
  // 只在應用載入時執行一次
  useEffect(() => {
    if (user) {
      navigateTo('dashboard');
      // 如果是舊使用者且沒有體重記錄，建立初始記錄
      if (weightRecords.length === 0) {
        const initialRecord: WeightRecord = {
          id: Date.now().toString(),
          date: getTodayString(),
          timestamp: Date.now(),
          weight: user.weight,
        };
        addWeightRecord(initialRecord);
      }
    } else {
      navigateTo('onboarding');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在初始化時執行一次

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    
    // 建立初始體重記錄
    if (weightRecords.length === 0) {
      const initialRecord: WeightRecord = {
        id: Date.now().toString(),
        date: getTodayString(),
        timestamp: Date.now(),
        weight: profile.weight,
      };
      addWeightRecord(initialRecord);
    }
    
    navigateTo('dashboard');
  };

  const handleSaveFood = (log: FoodLog) => {
    if (editingLog) {
      updateLog(log);
    } else {
      addLog(log);
    }
    setEditingLog(null);
    navigateTo('dashboard');
  };

  const handleDeleteFood = (id: string) => {
    deleteLog(id);
    if (editingLog && editingLog.id === id) {
      setEditingLog(null);
      if (view === 'food-entry') {
        navigateTo('dashboard');
      }
    }
  };

  const handleOpenAddFood = (mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setEditingLog(null);
    setDefaultMealType(mealType);
    navigateTo('food-entry');
  };

  const handleOpenEditFood = (log: FoodLog) => {
    setEditingLog(log);
    navigateTo('food-entry');
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    updateUser(updatedProfile);
    
    // 確保有體重記錄
    if (weightRecords.length === 0) {
      const initialRecord: WeightRecord = {
        id: Date.now().toString(),
        date: getTodayString(),
        timestamp: Date.now(),
        weight: updatedProfile.weight,
      };
      addWeightRecord(initialRecord);
    }
    
    navigateTo('settings');
  };

  const handleUpdateWeight = (newWeight: number) => {
    if (!user) return;

    // 重新計算所有指標
    const bmr = calculateBMR(user.gender, newWeight, user.height, user.age);
    const tdee = calculateTDEE(bmr, user.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, user.goal);
    const macros = calculateMacros(targetCalories, user.goal);

    const updatedProfile: UserProfile = {
      ...user,
      weight: newWeight,
      tdee,
      targetCalories,
      targetProtein: macros.protein,
      targetFat: macros.fat,
      targetCarbs: macros.carbs,
    };

    updateUser(updatedProfile);
    handleAddWeightRecord(newWeight);
  };

  const handleAddWeightRecord = (weight: number) => {
    const newRecord: WeightRecord = {
      id: Date.now().toString(),
      date: getTodayString(),
      timestamp: Date.now(),
      weight,
    };
    addWeightRecord(newRecord);
  };

  const handleReset = () => {
    setResetDialogOpen(true);
  };
  
  const confirmReset = () => {
    resetUser();
    resetLogs();
    resetWeightRecords();
    setEditingLog(null);
    setSelectedDate(getTodayString());
    navigateTo('onboarding');
    setResetDialogOpen(false);
  };

  return (
    <ThemeProvider>
      <div className="bg-gray-100 dark:bg-gray-800 min-h-screen flex justify-center items-center max-md:p-0 max-md:min-h-screen transition-colors duration-200">
        {/* Mobile container - fixed size on desktop/tablet, full screen on mobile */}
        <div className="
          md:w-[375px] md:h-[667px] md:rounded-2xl md:shadow-2xl
          max-md:w-full max-md:h-screen max-md:rounded-none
          bg-white dark:bg-gray-900 overflow-hidden relative flex flex-col transition-colors duration-150
        ">{/* Main Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar w-full">
          
          {view === 'onboarding' && (
            <Onboarding onComplete={handleOnboardingComplete} />
          )}

          {view === 'dashboard' && user && (
            <Dashboard 
              user={user} 
              logs={logs} 
              onAddFood={handleOpenAddFood}
              onEditFood={handleOpenEditFood}
              onDeleteFood={handleDeleteFood}
              onOpenSettings={() => navigateTo('settings')}
              onOpenCalendar={() => navigateTo('calendar')}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          )}

          {view === 'food-entry' && (
            <FoodEntry 
              onSave={handleSaveFood}
              onDelete={editingLog ? handleDeleteFood : undefined}
              onCancel={() => navigateTo('dashboard')} 
              initialData={editingLog}
              initialDate={selectedDate}
              initialMealType={defaultMealType}
            />
          )}

          {view === 'edit-profile' && user && (
            <EditProfile 
              user={user}
              onSave={handleSaveProfile}
              onCancel={() => navigateTo('settings')}
            />
          )}

          {view === 'calendar' && (
            <MonthCalendarView
              logs={logs}
              selectedDate={selectedDate}
              onDateSelect={navigateToDate}
              onClose={() => navigateTo('dashboard')}
            />
          )}

          {view === 'settings' && user && (
             <div className="p-6 h-full flex flex-col animate-slideIn bg-slate-50 dark:bg-gray-900 overflow-y-auto no-scrollbar transition-colors duration-150">
                <div className="flex items-center mb-6">
                   <button onClick={() => navigateTo('dashboard')} className="p-2 -ml-2 text-slate-600 dark:text-gray-300 rounded-full hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors duration-150">
                      <LogOut className="rotate-180" size={24}/>
                   </button>
                   <h1 className="text-xl font-bold ml-2 text-slate-900 dark:text-gray-100">設定</h1>
                </div>

                <div className="space-y-4">
                  {/* Theme Toggle Section */}
                  <ThemeToggle />
                  
                  {/* Profile Section */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-slate-100 dark:border-gray-600 shadow-sm transition-colors duration-150">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-base font-bold text-slate-700 dark:text-gray-200">我的個人檔案</h3>
                       <button 
                         onClick={() => navigateTo('edit-profile')}
                         className="p-2 hover:bg-slate-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
                       >
                         <SquarePen className="text-slate-600 dark:text-gray-300" size={16} />
                       </button>
                    </div>
                    
                    <div className="space-y-3">
                       <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600 dark:text-gray-400">年齡</span>
                         <span className="font-bold text-slate-900 dark:text-gray-100">{user.age} 歲</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600 dark:text-gray-400">身高</span>
                         <span className="font-bold text-slate-900 dark:text-gray-100">{user.height} cm</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600 dark:text-gray-400">體重</span>
                         <span className="font-bold text-slate-900 dark:text-gray-100">{user.weight} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600 dark:text-gray-400">活動量等級</span>
                         <span className="font-bold text-slate-900 dark:text-gray-100">
                           {user.activityLevel === 'sedentary' && '久坐'}
                           {user.activityLevel === 'light' && '輕度活動'}
                           {user.activityLevel === 'moderate' && '中度活動'}
                           {user.activityLevel === 'active' && '高度活動'}
                           {user.activityLevel === 'veryActive' && '超高度活動'}
                         </span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600 dark:text-gray-400">目標</span>
                         <span className="font-bold text-slate-900 dark:text-gray-100">
                           {user.goal === 'lose' && '減重'}
                           {user.goal === 'maintain' && '維持體重'}
                           {user.goal === 'gain' && '增肌'}
                         </span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600 dark:text-gray-400">目標體重</span>
                         <span className="font-bold text-slate-900 dark:text-gray-100">{user.targetWeight.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600 dark:text-gray-400">每週減重</span>
                         <span className="font-bold text-slate-900 dark:text-gray-100">{user.weeklyWeightLoss.toFixed(2)} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Calorie Tracking Section */}
                  <CalorieTracking
                    user={user}
                    logs={logs}
                  />

                  {/* Weight Tracking Section */}
                  <WeightTracking
                    user={user}
                    weightRecords={weightRecords}
                    onUpdateWeight={handleUpdateWeight}
                    onNavigateToDataList={() => navigateTo('weight-data-list')}
                  />

                  <button 
                    onClick={handleReset}
                    className="w-full flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-150"
                  >
                    <Trash2 size={20} className="mr-2" />
                    重置所有資料
                  </button>
                  <p className="text-center text-xs text-slate-400 dark:text-gray-500 mt-4 pb-4">DietLog v1.2</p>
                </div>
             </div>
          )}

          {/* Weight Data List View */}
          {view === 'weight-data-list' && user && (
            <WeightDataList
              weightRecords={weightRecords}
              onBack={() => navigateTo('settings')}
              onDeleteWeightRecord={deleteWeightRecord}
            />
          )}
        </div>

      </div>
      
      {/* 重置確認 Dialog */}
      <Dialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={confirmReset}
        title="重置所有資料"
        message="您確定要刪除所有資料並重置嗎？這將清除您的個人資料、飲食記錄和體重記錄，此操作無法復原。"
        confirmText="確定重置"
        cancelText="取消"
        isDangerous={true}
      />
      </div>
    </ThemeProvider>
  );
}

export default App;