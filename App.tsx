import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { FoodEntry } from './components/FoodEntry';
import { EditProfile } from './components/EditProfile';
import { MonthCalendarView } from './components/MonthCalendarView';
import { WeightTracking } from './components/WeightTracking';
import { WeightDataList } from './components/WeightDataList';
import { CalorieTracking } from './components/CalorieTracking';
import { FoodLog, UserProfile, WeightRecord } from './types';
import { Trash2, LogOut, SquarePen } from 'lucide-react';
import { getTodayString, calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from './utils';
import { Dialog } from './components/Dialog';

// Simple mock for local storage persistence
const STORAGE_KEY_USER = 'dietlog_user_v1';
const STORAGE_KEY_LOGS = 'dietlog_logs_v1';
const STORAGE_KEY_WEIGHT_RECORDS = 'dietlog_weight_records_v1';

type View = 'onboarding' | 'dashboard' | 'food-entry' | 'settings' | 'edit-profile' | 'calendar' | 'weight-data-list';

function App() {
  const [view, setView] = useState<View>('onboarding');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  
  // New States for Features
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [editingLog, setEditingLog] = useState<FoodLog | null>(null);
  const [defaultMealType, setDefaultMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | undefined>(undefined);

  // Load data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
    const savedWeightRecords = localStorage.getItem(STORAGE_KEY_WEIGHT_RECORDS);

    let parsedUser = null;

    if (savedUser) {
      parsedUser = JSON.parse(savedUser);
      
      // Migration: Add default values for new fields if they don't exist
      if (!parsedUser.targetWeight) {
        parsedUser.targetWeight = parsedUser.weight - 5; // Default: 5kg less than current
      }
      if (!parsedUser.weeklyWeightLoss) {
        parsedUser.weeklyWeightLoss = 0.5; // Default: 0.5kg per week
      }
      
      setUser(parsedUser);
      setView('dashboard');
    } else {
      setView('onboarding');
    }

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }

    if (savedWeightRecords) {
      setWeightRecords(JSON.parse(savedWeightRecords));
    } else if (parsedUser) {
      // Migration: Create initial weight record for existing users
      const initialRecord: WeightRecord = {
        id: Date.now().toString(),
        date: getTodayString(),
        timestamp: Date.now(),
        weight: parsedUser.weight,
      };
      setWeightRecords([initialRecord]);
    }
  }, []);

  // Save logs on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  // Save user on change
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
  }, [user]);

  // Save weight records on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WEIGHT_RECORDS, JSON.stringify(weightRecords));
  }, [weightRecords]);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    
    // Create initial weight record only if no records exist
    if (weightRecords.length === 0) {
      const initialRecord: WeightRecord = {
        id: Date.now().toString(),
        date: getTodayString(),
        timestamp: Date.now(),
        weight: profile.weight,
      };
      setWeightRecords([initialRecord]);
    }
    
    setView('dashboard');
  };

  const handleSaveFood = (log: FoodLog) => {
    if (editingLog) {
      // Update existing log
      setLogs((prev) => prev.map((item) => (item.id === log.id ? log : item)));
    } else {
      // Create new log
      setLogs((prev) => [log, ...prev]);
    }
    setEditingLog(null);
    setView('dashboard');
  };

  const handleDeleteFood = (id: string) => {
    setLogs((prev) => prev.filter((item) => item.id !== id));
    // Only reset editing log and change view if we're in the food-entry view
    if (editingLog && editingLog.id === id) {
      setEditingLog(null);
      if (view === 'food-entry') {
        setView('dashboard');
      }
    }
  };

  const handleOpenAddFood = (mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setEditingLog(null);
    setDefaultMealType(mealType);
    setView('food-entry');
  };

  const handleOpenEditFood = (log: FoodLog) => {
    setEditingLog(log);
    setView('food-entry');
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    
    // Ensure there's at least one weight record
    if (weightRecords.length === 0) {
      const initialRecord: WeightRecord = {
        id: Date.now().toString(),
        date: getTodayString(),
        timestamp: Date.now(),
        weight: updatedProfile.weight,
      };
      setWeightRecords([initialRecord]);
    }
    
    setView('settings');
  };

  const handleUpdateWeight = (newWeight: number) => {
    if (!user) return;

    // Recalculate all metrics with new weight
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

    setUser(updatedProfile);

    // Automatically add a weight record when updating weight
    handleAddWeightRecord(newWeight);
  };

  const handleAddWeightRecord = (weight: number) => {
    const today = getTodayString();
    const newRecord: WeightRecord = {
      id: Date.now().toString(),
      date: today,
      timestamp: Date.now(),
      weight,
    };
    
    // Remove any existing record from today, keep only the latest
    setWeightRecords(prev => {
      const filteredRecords = prev.filter(record => record.date !== today);
      return [newRecord, ...filteredRecords];
    });
  };

  const handleDeleteWeightRecord = (recordId: string) => {
    setWeightRecords(prev => prev.filter(record => record.id !== recordId));
  };

  const handleReset = () => {
    setResetDialogOpen(true);
  };
  
  const confirmReset = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    localStorage.removeItem(STORAGE_KEY_WEIGHT_RECORDS);
    setUser(null);
    setLogs([]);
    setWeightRecords([]);
    setEditingLog(null);
    setSelectedDate(getTodayString());
    setView('onboarding');
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center max-md:p-0 max-md:min-h-screen">
      {/* Mobile container - fixed size on desktop/tablet, full screen on mobile */}
      <div className="
        md:w-[375px] md:h-[667px] md:rounded-2xl md:shadow-2xl
        max-md:w-full max-md:h-screen max-md:rounded-none
        bg-white overflow-hidden relative flex flex-col
      ">

        {/* Main Content Area */}
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
              onOpenSettings={() => setView('settings')}
              onOpenCalendar={() => setView('calendar')}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          )}

          {view === 'food-entry' && (
            <FoodEntry 
              onSave={handleSaveFood}
              onDelete={editingLog ? handleDeleteFood : undefined}
              onCancel={() => setView('dashboard')} 
              initialData={editingLog}
              initialDate={selectedDate}
              initialMealType={defaultMealType}
            />
          )}

          {view === 'edit-profile' && user && (
            <EditProfile 
              user={user}
              onSave={handleSaveProfile}
              onCancel={() => setView('settings')}
            />
          )}

          {view === 'calendar' && (
            <MonthCalendarView
              logs={logs}
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setView('dashboard');
              }}
              onClose={() => setView('dashboard')}
            />
          )}

          {view === 'settings' && user && (
             <div className="p-6 h-full flex flex-col animate-slideIn bg-slate-50 overflow-y-auto no-scrollbar">
                <div className="flex items-center mb-6">
                   <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-200">
                      <LogOut className="rotate-180" size={24}/>
                   </button>
                   <h1 className="text-xl font-bold ml-2">設定</h1>
                </div>

                <div className="space-y-4">
                  {/* Profile Section */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-base font-bold text-slate-700">我的個人檔案</h3>
                       <button 
                         onClick={() => setView('edit-profile')}
                         className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                       >
                         <SquarePen className="text-slate-600" size={16} />
                       </button>
                    </div>
                    
                    <div className="space-y-3">
                       <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600">年齡</span>
                         <span className="font-bold text-slate-900">{user.age} 歲</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600">身高</span>
                         <span className="font-bold text-slate-900">{user.height} cm</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600">體重</span>
                         <span className="font-bold text-slate-900">{user.weight} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600">活動量等級</span>
                         <span className="font-bold text-slate-900">
                           {user.activityLevel === 'sedentary' && '久坐'}
                           {user.activityLevel === 'light' && '輕度活動'}
                           {user.activityLevel === 'moderate' && '中度活動'}
                           {user.activityLevel === 'active' && '高度活動'}
                           {user.activityLevel === 'veryActive' && '超高度活動'}
                         </span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600">目標</span>
                         <span className="font-bold text-slate-900">
                           {user.goal === 'lose' && '減重'}
                           {user.goal === 'maintain' && '維持體重'}
                           {user.goal === 'gain' && '增肌'}
                         </span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600">目標體重</span>
                         <span className="font-bold text-slate-900">{user.targetWeight.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-slate-600">每週減重</span>
                         <span className="font-bold text-slate-900">{user.weeklyWeightLoss.toFixed(2)} kg</span>
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
                    onNavigateToDataList={() => setView('weight-data-list')}
                  />

                  <button 
                    onClick={handleReset}
                    className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={20} className="mr-2" />
                    重置所有資料
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4 pb-4">DietLog v1.2</p>
                </div>
             </div>
          )}

          {/* Weight Data List View */}
          {view === 'weight-data-list' && user && (
            <WeightDataList
              weightRecords={weightRecords}
              onBack={() => setView('settings')}
              onDeleteWeightRecord={handleDeleteWeightRecord}
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
  );
}

export default App;