import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getUserProfile, saveUserProfile, deleteUserProfile } from '../services/firestore';

/**
 * 管理使用者個人檔案的 Hook (使用 Firestore)
 */
export const useUserProfile = (firebaseUid: string | null) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 載入使用者資料從 Firestore
  useEffect(() => {
    if (!firebaseUid) {
      setUser(null);
      setLoading(false);
      return;
    }

    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(firebaseUid);
        setUser(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [firebaseUid]);

  // 更新使用者資料到 Firestore
  const updateUser = async (updatedUser: UserProfile) => {
    if (!firebaseUid) return;

    try {
      await saveUserProfile(firebaseUid, updatedUser);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };

  // 建立新使用者資料
  const createUser = async (newUser: UserProfile) => {
    if (!firebaseUid) return;

    try {
      await saveUserProfile(firebaseUid, newUser);
      setUser(newUser);
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw error;
    }
  };

  // 重置使用者資料
  const resetUser = async () => {
    if (!firebaseUid) return;

    try {
      await deleteUserProfile(firebaseUid);
      setUser(null);
    } catch (error) {
      console.error('Failed to reset user profile:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    setUser: createUser,
    updateUser,
    resetUser,
  };
};
