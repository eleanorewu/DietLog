import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { FoodEntry } from './components/FoodEntry';
import { EditProfile } from './components/EditProfile';
import { CalendarView } from './components/CalendarView';
import { WeightTracking } from './components/WeightTracking';
import { FoodLog, UserProfile, WeightRecord } from './types';
import { Trash2, LogOut, Plus } from 'lucide-react';
import { getTodayString, calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from './utils';

// Simple mock for local storage persistence
const STORAGE_KEY_USER = 'dietlog_user_v1';
const STORAGE_KEY_LOGS = 'dietlog_logs_v1';
const STORAGE_KEY_WEIGHT_RECORDS = 'dietlog_weight_records_v1';

type View = 'onboarding' | 'dashboard' | 'food-entry' | 'settings' | 'edit-profile' | 'calendar';

function App() {
  const [view, setView] = useState<View>('onboarding');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  
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
    
    // Create initial weight record
    const initialRecord: WeightRecord = {
      id: Date.now().toString(),
      date: getTodayString(),
      timestamp: Date.now(),
      weight: profile.weight,
    };
    setWeightRecords([initialRecord]);
    
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

  const handleReset = () => {
    if (confirm("您確定要刪除所有資料並重置嗎？")) {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_LOGS);
        localStorage.removeItem(STORAGE_KEY_WEIGHT_RECORDS);
        setUser(null);
        setLogs([]);
        setWeightRecords([]);
        setEditingLog(null);
        setSelectedDate(getTodayString());
        setView('onboarding');
    }
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
            <CalendarView
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
                   <h1 className="text-2xl font-bold ml-2">設定</h1>
                </div>

                <div className="space-y-4">
                  {/* Weight Tracking Section */}
                  <WeightTracking
                    user={user}
                    weightRecords={weightRecords}
                    onUpdateWeight={handleUpdateWeight}
                  />

                  {/* Profile Section */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                       <h3 className="text-sm font-bold text-slate-400 uppercase">我的個人檔案</h3>
                       <button 
                         onClick={() => setView('edit-profile')}
                         className="text-sm text-emerald-600 font-bold hover:underline"
                       >
                         編輯
                       </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">每日目標</span>
                        <span className="font-bold text-emerald-600">{user.targetCalories} kcal</span>
                      </div>
                       <div className="flex justify-between">
                        <span className="text-slate-600">每日總消耗 (TDEE)</span>
                        <span className="font-bold">{user.tdee} kcal</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-slate-600">身高</span>
                         <span className="font-bold">{user.height} cm</span>
                      </div>
                       <div className="flex justify-between">
                         <span className="text-slate-600">年齡</span>
                         <span className="font-bold">{user.age} 歲</span>
                      </div>
                    </div>
                  </div>

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
        </div>

        {/* Floating Add Record button (inside the mobile container) */}
        {view === 'dashboard' && (
          <button
            onClick={handleOpenAddFood}
            aria-label="新增紀錄"
            className="absolute bottom-4 right-4 z-20 p-4 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus size={20} />
          </button>
        )}

      </div>
    </div>
  );
}

export default App;