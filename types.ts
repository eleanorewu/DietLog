export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export type Goal = 'lose' | 'maintain' | 'gain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Theme = 'light' | 'dark';

export interface UserProfile {
  name: string;
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  goal: Goal;
  targetWeight: number; // kg - 目標體重
  weeklyWeightLoss: number; // kg/week - 每週減重目標
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
}

export interface FoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  mealType: MealType;
  name: string;
  photoUrl?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  userId?: string; // Firebase UID - for Firestore sync
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  weight: number; // kg
  note?: string; // 可選的備註
  userId?: string; // Firebase UID - for Firestore sync
}
