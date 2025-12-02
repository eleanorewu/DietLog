import { useState } from 'react';
import { View } from '../constants/storage';
import { getTodayString } from '../utils';

/**
 * 管理應用程式導航狀態的 Hook
 */
export const useNavigation = () => {
  const [view, setView] = useState<View>('onboarding');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  const navigateTo = (newView: View) => {
    setView(newView);
  };

  const navigateToDate = (date: string) => {
    setSelectedDate(date);
    setView('dashboard');
  };

  return {
    view,
    selectedDate,
    setView,
    setSelectedDate,
    navigateTo,
    navigateToDate,
  };
};
