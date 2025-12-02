import { useState, useEffect } from 'react';
import { WeightRecord } from '../types';
import { STORAGE_KEYS } from '../constants/storage';

/**
 * 管理體重記錄的 Hook
 */
export const useWeightRecords = () => {
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);

  // 載入體重記錄
  useEffect(() => {
    const savedWeightRecords = localStorage.getItem(STORAGE_KEYS.WEIGHT_RECORDS);
    if (savedWeightRecords) {
      setWeightRecords(JSON.parse(savedWeightRecords));
    }
  }, []);

  // 儲存體重記錄
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_RECORDS, JSON.stringify(weightRecords));
  }, [weightRecords]);

  const addWeightRecord = (record: WeightRecord) => {
    setWeightRecords((prev) => {
      // Remove any existing record for the same date (keep only the latest)
      const filtered = prev.filter((r) => r.date !== record.date);
      return [...filtered, record];
    });
  };

  const deleteWeightRecord = (id: string) => {
    setWeightRecords((prev) => prev.filter((record) => record.id !== id));
  };

  const resetWeightRecords = () => {
    localStorage.removeItem(STORAGE_KEYS.WEIGHT_RECORDS);
    setWeightRecords([]);
  };

  return {
    weightRecords,
    addWeightRecord,
    deleteWeightRecord,
    resetWeightRecords,
  };
};
