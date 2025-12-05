import React, { useState, FormEvent } from 'react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, loginWithGoogle, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    // 基本驗證
    if (!formData.email || !validateEmail(formData.email)) {
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      return;
    }

    try {
      // 先嘗試登入
      await login(formData.email, formData.password);
      // 登入成功後，App.tsx 會自動處理導航（檢查是否有 profile）
    } catch (loginError: any) {
      // 如果是找不到使用者，自動嘗試註冊
      if (loginError.message?.includes('找不到') || 
          loginError.message?.includes('登入資訊錯誤')) {
        try {
          setIsRegistering(true);
          await register(formData.email, formData.password);
          // 註冊成功後，App.tsx 會自動導航到 onboarding
        } catch (registerError) {
          setIsRegistering(false);
          // 註冊也失敗，顯示錯誤
        }
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      clearError();
      await loginWithGoogle();
      // 登入成功後，App.tsx 會自動處理導航
    } catch (err) {
      console.error('Google 登入失敗:', err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      clearError();
    }
  };

  return (
    <AuthLayout title="DietLog" subtitle="開始紀錄你的飲食">
      <div className="space-y-6">
        {/* 全域錯誤訊息 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email 輸入框 */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
              電子郵件
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-colors duration-200
                  bg-white dark:bg-gray-700 
                  text-slate-900 dark:text-white
                  placeholder-slate-400 dark:placeholder-gray-500
                  border-slate-200 dark:border-gray-600 
                  focus:border-emerald-500 dark:focus:border-emerald-600
                  focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="your@email.com"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password 輸入框 */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
              密碼
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 w-5 h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-colors duration-200
                  bg-white dark:bg-gray-700 
                  text-slate-900 dark:text-white
                  placeholder-slate-400 dark:placeholder-gray-500
                  border-slate-200 dark:border-gray-600 
                  focus:border-emerald-500 dark:focus:border-emerald-600
                  focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                placeholder="至少 6 個字元"
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
              {isRegistering ? '正在為您建立帳號...' : '新帳號將自動建立'}
            </p>
          </div>

          {/* 登入/註冊按鈕 */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            className="mt-6"
          >
            {loading ? (isRegistering ? '建立帳號中...' : '登入中...') : '繼續'}
          </Button>
        </form>

        {/* 分隔線 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm mx-2">
            <span className="px-2 bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400">
              或
            </span>
          </div>
        </div>

        {/* Google 登入按鈕 */}
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 py-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>使用 Google 登入</span>
        </Button>

        {/* 提示訊息 */}
        <p className="text-center text-xs text-slate-500 dark:text-gray-400 mt-4">
          首次使用將自動建立帳號
        </p>
      </div>
    </AuthLayout>
  );
};
