import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { FoodEntry } from './components/FoodEntry';
import { EditProfile } from './components/EditProfile';
import { CalendarView } from './components/CalendarView';
import { FoodLog, UserProfile } from './types';
import { Trash2, LogOut, Plus } from 'lucide-react';
import { getTodayString } from './utils';

// Simple mock for local storage persistence
const STORAGE_KEY_USER = 'nutrilog_user_v1';
const STORAGE_KEY_LOGS = 'nutrilog_logs_v1';

type View = 'onboarding' | 'dashboard' | 'food-entry' | 'settings' | 'edit-profile' | 'calendar';

function App() {
  const [view, setView] = useState<View>('onboarding');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  
  // New States for Features
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [editingLog, setEditingLog] = useState<FoodLog | null>(null);

  // Load data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
    } else {
      setView('onboarding');
    }

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
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

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
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
    setEditingLog(null);
    setView('dashboard');
  };

  const handleOpenAddFood = () => {
    setEditingLog(null);
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

  const handleReset = () => {
    if (confirm("您確定要刪除所有資料並重置嗎？")) {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_LOGS);
        setUser(null);
        setLogs([]);
        setEditingLog(null);
        setSelectedDate(getTodayString());
        setView('onboarding');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center">
      {/* Mobile container simulator (fixed iPhone SE size) */}
      <div className="w-[375px] h-[667px] bg-white rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">

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
             <div className="p-6 h-full flex flex-col animate-slideIn bg-slate-50">
                <div className="flex items-center mb-8">
                   <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-200">
                      <LogOut className="rotate-180" size={24}/>
                   </button>
                   <h1 className="text-2xl font-bold ml-2">設定</h1>
                </div>

                <div className="space-y-4">
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
                         <span className="text-slate-600">目前體重</span>
                         <span className="font-bold">{user.weight} kg</span>
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
                    className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-xl font-medium mt-auto hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={20} className="mr-2" />
                    重置所有資料
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4">NutriLog v1.1</p>
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