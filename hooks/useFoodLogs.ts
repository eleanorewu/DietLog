import { useState, useEffect } from 'react';
import { FoodLog } from '../types';
import { STORAGE_KEYS } from '../constants/storage';

/**
 * 管理飲食記錄的 Hook
 */
export const useFoodLogs = () => {
  const [logs, setLogs] = useState<FoodLog[]>([]);

  // 載入飲食記錄
  useEffect(() => {
    const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  // 儲存飲食記錄
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  const addLog = (log: FoodLog) => {
    setLogs((prev) => [...prev, log]);
  };

  const updateLog = (updatedLog: FoodLog) => {
    setLogs((prev) =>
      prev.map((log) => (log.id === updatedLog.id ? updatedLog : log))
    );
  };

  const deleteLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const resetLogs = () => {
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    setLogs([]);
  };

  return {
    logs,
    addLog,
    updateLog,
    deleteLog,
    resetLogs,
  };
};
