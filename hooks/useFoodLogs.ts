import { useState, useEffect } from 'react';
import { FoodLog } from '../types';
import { 
  subscribeFoodLogs, 
  addFoodLog as addFoodLogToFirestore,
  updateFoodLog as updateFoodLogInFirestore,
  deleteFoodLog as deleteFoodLogFromFirestore
} from '../services/firestore';

/**
 * 管理飲食記錄的 Hook (使用 Firestore 即時同步)
 */
export const useFoodLogs = (firebaseUid: string | null) => {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 訂閱 Firestore 即時更新
  useEffect(() => {
    if (!firebaseUid) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeFoodLogs(firebaseUid, (updatedLogs) => {
      setLogs(updatedLogs);
      setLoading(false);
    });

    // 清理訂閱
    return () => unsubscribe();
  }, [firebaseUid]);

  const addLog = async (log: FoodLog) => {
    if (!firebaseUid) return;

    try {
      await addFoodLogToFirestore(firebaseUid, log);
      // Firestore 訂閱會自動更新 state
    } catch (error) {
      console.error('Failed to add food log:', error);
      throw error;
    }
  };

  const updateLog = async (updatedLog: FoodLog) => {
    if (!firebaseUid) return;

    try {
      await updateFoodLogInFirestore(firebaseUid, updatedLog);
      // Firestore 訂閱會自動更新 state
    } catch (error) {
      console.error('Failed to update food log:', error);
      throw error;
    }
  };

  const deleteLog = async (id: string) => {
    if (!firebaseUid) return;

    try {
      await deleteFoodLogFromFirestore(id);
      // Firestore 訂閱會自動更新 state
    } catch (error) {
      console.error('Failed to delete food log:', error);
      throw error;
    }
  };

  const resetLogs = () => {
    // 不刪除 Firestore 資料，只清空本地 state
    setLogs([]);
  };

  return {
    logs,
    loading,
    addLog,
    updateLog,
    deleteLog,
    resetLogs,
  };
};
