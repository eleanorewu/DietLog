import { useState, useEffect } from 'react';
import { WeightRecord } from '../types';
import {
  subscribeWeightRecords,
  addWeightRecord as addWeightRecordToFirestore,
  deleteWeightRecord as deleteWeightRecordFromFirestore
} from '../services/firestore';

/**
 * 管理體重記錄的 Hook (使用 Firestore 即時同步)
 */
export const useWeightRecords = (firebaseUid: string | null) => {
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 訂閱 Firestore 即時更新
  useEffect(() => {
    if (!firebaseUid) {
      setWeightRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeWeightRecords(firebaseUid, (updatedRecords) => {
      setWeightRecords(updatedRecords);
      setLoading(false);
    });

    // 清理訂閱
    return () => unsubscribe();
  }, [firebaseUid]);

  const addWeightRecord = async (record: WeightRecord) => {
    if (!firebaseUid) return;

    try {
      await addWeightRecordToFirestore(firebaseUid, record);
      // Firestore 訂閱會自動更新 state
    } catch (error) {
      console.error('Failed to add weight record:', error);
      throw error;
    }
  };

  const deleteWeightRecord = async (id: string) => {
    if (!firebaseUid) return;

    try {
      await deleteWeightRecordFromFirestore(id);
      // Firestore 訂閱會自動更新 state
    } catch (error) {
      console.error('Failed to delete weight record:', error);
      throw error;
    }
  };

  const resetWeightRecords = () => {
    // 不刪除 Firestore 資料，只清空本地 state
    setWeightRecords([]);
  };

  return {
    weightRecords,
    loading,
    addWeightRecord,
    deleteWeightRecord,
    resetWeightRecords,
  };
};
