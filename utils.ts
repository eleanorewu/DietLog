import { ActivityLevel, Gender, Goal, UserProfile } from './types';

export const calculateBMR = (
  gender: Gender,
  weight: number,
  height: number,
  age: number
): number => {
  // Mifflin-St Jeor Equation
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
};

export const getActivityMultiplier = (level: ActivityLevel): number => {
  switch (level) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'active':
      return 1.725;
    default:
      return 1.2;
  }
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  return Math.round(bmr * getActivityMultiplier(activityLevel));
};

export const calculateTargetCalories = (tdee: number, goal: Goal): number => {
  switch (goal) {
    case 'lose':
      return tdee - 500;
    case 'gain':
      return tdee + 300;
    case 'maintain':
    default:
      return tdee;
  }
};

export const calculateMacros = (targetCalories: number, goal: Goal) => {
  // Simple macro split logic based on PRD
  // Lose/High Protein: C 35% / P 40% / F 25%
  // Balanced: C 50% / P 20% / F 30%
  
  let proteinRatio = 0.2;
  let fatRatio = 0.3;
  let carbsRatio = 0.5;

  if (goal === 'lose' || goal === 'gain') {
     proteinRatio = 0.4;
     fatRatio = 0.25;
     carbsRatio = 0.35;
  }

  return {
    protein: Math.round((targetCalories * proteinRatio) / 4), // 4 cal/g
    fat: Math.round((targetCalories * fatRatio) / 9), // 9 cal/g
    carbs: Math.round((targetCalories * carbsRatio) / 4), // 4 cal/g
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const getTodayString = (): string => {
  // 使用台灣台北時區 (Asia/Taipei)
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const formattedDate = formatter.format(date);
  return formattedDate; // 格式: YYYY-MM-DD
};

export const isFutureDate = (dateString: string): boolean => {
  const today = getTodayString();
  return dateString > today;
};

export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

// 取得該週的星期一日期
export const getWeekStart = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const dayOfWeek = date.getDay(); // 0 = 日, 1 = 一
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  date.setDate(date.getDate() + daysToMonday);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 取得該週的所有七天（一到日）
export const getWeekDays = (weekStartDate: string): string[] => {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(weekStartDate, i));
  }
  return days;
};

// 取得上一週的開始日期
export const getPreviousWeekStart = (weekStartDate: string): string => {
  return addDays(weekStartDate, -7);
};

// 取得下一週的開始日期
export const getNextWeekStart = (weekStartDate: string): string => {
  return addDays(weekStartDate, 7);
};

// 取得日期對應的星期名稱（繁中）
export const getDayName = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  const dayOfWeek = date.getDay();
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  return dayNames[dayOfWeek];
};

export const addDays = (dateString: string, days: number): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};