/**
 * LocalStorage 鍵值常數
 */
export const STORAGE_KEYS = {
  USER: 'dietlog_user_v1',
  LOGS: 'dietlog_logs_v1',
  WEIGHT_RECORDS: 'dietlog_weight_records_v1',
  THEME: 'theme',
} as const;

/**
 * View 類型定義
 */
export type View = 
  | 'onboarding' 
  | 'dashboard' 
  | 'food-entry' 
  | 'settings' 
  | 'edit-profile' 
  | 'calendar' 
  | 'weight-data-list';
