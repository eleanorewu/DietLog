import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { STORAGE_KEYS } from '../constants/storage';

/**
 * 管理使用者個人檔案的 Hook
 */
export const useUserProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // 載入使用者資料
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (savedUser) {
      let parsedUser = JSON.parse(savedUser);
      
      // Migration: Add default values for new fields if they don't exist
      if (!parsedUser.targetWeight) {
        parsedUser.targetWeight = parsedUser.weight - 5;
      }
      if (!parsedUser.weeklyWeightLoss) {
        parsedUser.weeklyWeightLoss = 0.5;
      }
      
      setUser(parsedUser);
    }
  }, []);

  // 儲存使用者資料
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }, [user]);

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const resetUser = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  return {
    user,
    setUser,
    updateUser,
    resetUser,
  };
};
