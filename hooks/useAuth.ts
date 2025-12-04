import { useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthError {
  code: string;
  message: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 監聽認證狀態變化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 註冊
  const register = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 如果有提供顯示名稱，更新個人資料
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return userCredential.user;
    } catch (err) {
      const authError = err as AuthError;
      const errorMessage = getErrorMessage(authError.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 登入
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      const authError = err as AuthError;
      const errorMessage = getErrorMessage(authError.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      const authError = err as AuthError;
      const errorMessage = getErrorMessage(authError.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Google 登入
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    } catch (err) {
      const authError = err as AuthError;
      const errorMessage = getErrorMessage(authError.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 重設密碼
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const authError = err as AuthError;
      const errorMessage = getErrorMessage(authError.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 清除錯誤
  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
    clearError,
  };
};

// 將 Firebase 錯誤代碼轉換為使用者友善的訊息
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return '此電子郵件已被註冊';
    case 'auth/invalid-email':
      return '電子郵件格式不正確';
    case 'auth/operation-not-allowed':
      return '此登入方式尚未啟用';
    case 'auth/weak-password':
      return '密碼強度不足，請使用至少 6 個字元';
    case 'auth/user-disabled':
      return '此帳號已被停用';
    case 'auth/user-not-found':
      return '找不到此帳號';
    case 'auth/wrong-password':
      return '密碼錯誤';
    case 'auth/invalid-credential':
      return '登入資訊錯誤，請檢查電子郵件和密碼';
    case 'auth/too-many-requests':
      return '嘗試次數過多，請稍後再試';
    case 'auth/network-request-failed':
      return '網路連線失敗，請檢查網路設定';
    default:
      return '發生未知錯誤，請稍後再試';
  }
};
