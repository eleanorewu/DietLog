# 專案結構優化總結

## 📅 優化日期

2025 年 12 月 2 日

## 🎯 優化目標

根據 React 最佳實踐，重構專案結構，提升代碼可維護性和可擴展性。

## 📂 新的專案結構

````
dietlog/
├── components/
│   ├── ui/                      # 通用 UI 組件
│   │   ├── Button.tsx          # 按鈕組件（4種變體）
│   │   ├── Dialog.tsx          # 對話框組件
│   │   ├── ThemeToggle.tsx     # 主題切換開關
│   │   └── index.ts            # 統一匯出
│   ├── features/                # 功能組件
│   │   ├── CalorieTracking.tsx # 熱量追蹤圖表
│   │   ├── WeightTracking.tsx  # 體重追蹤圖表
│   │   ├── SwipeableItem.tsx   # 滑動刪除組件
│   │   └── index.ts            # 統一匯出
│   └── pages/                   # 頁面級組件
│       ├── Dashboard.tsx        # 主頁面
│       ├── FoodEntry.tsx        # 飲食記錄表單
│       ├── EditProfile.tsx      # 編輯個人檔案
│       ├── MonthCalendarView.tsx # 月曆檢視
│       ├── Onboarding.tsx       # 使用者引導
│       ├── WeightDataList.tsx   # 體重記錄列表
│       └── index.ts             # 統一匯出
├── hooks/                       # 自定義 Hooks
│   ├── useUserProfile.ts       # 使用者資料管理
│   ├── useFoodLogs.ts          # 飲食記錄管理
│   ├── useWeightRecords.ts     # 體重記錄管理
│   ├── useNavigation.ts        # 導航狀態管理
│   └── index.ts                # 統一匯出
├── constants/                   # 常數定義
│   └── storage.ts              # Storage Keys & View 類型
├── contexts/
│   └── ThemeContext.tsx        # 主題狀態管理
├── types.ts                    # TypeScript 類型定義
├── utils.ts                    # 工具函數
└── App.tsx                     # 主應用（已精簡）

## ✨ 主要改進

### 1. 組件分類整理
- **UI 組件** (`components/ui/`): 可復用的通用組件
- **功能組件** (`components/features/`): 特定功能的複雜組件
- **頁面組件** (`components/pages/`): 完整的頁面視圖

### 2. 狀態管理抽離
創建了 4 個 Custom Hooks：

#### `useUserProfile`
```typescript
const { user, setUser, updateUser, resetUser } = useUserProfile();
````

- 管理使用者個人檔案
- 自動 localStorage 持久化
- 資料遷移邏輯封裝

#### `useFoodLogs`

```typescript
const { logs, addLog, updateLog, deleteLog, resetLogs } = useFoodLogs();
```

- 管理飲食記錄 CRUD
- 自動 localStorage 同步

#### `useWeightRecords`

```typescript
const {
  weightRecords,
  addWeightRecord,
  deleteWeightRecord,
  resetWeightRecords,
} = useWeightRecords();
```

- 管理體重記錄
- 自動去重（同日期只保留最新）

#### `useNavigation`

```typescript
const { view, selectedDate, navigateTo, navigateToDate } = useNavigation();
```

- 集中管理導航狀態
- 提供語義化的導航方法

### 3. 常數統一管理

創建 `constants/storage.ts`：

```typescript
export const STORAGE_KEYS = {
  USER: 'dietlog_user_v1',
  LOGS: 'dietlog_logs_v1',
  WEIGHT_RECORDS: 'dietlog_weight_records_v1',
  THEME: 'theme',
} as const;

export type View = 'onboarding' | 'dashboard' | 'food-entry' | ...;
```

### 4. App.tsx 精簡化

**優化前**: 416 行，包含所有邏輯
**優化後**: ~320 行，專注於組件組合

移除的代碼：

- ❌ localStorage 直接操作（移至 hooks）
- ❌ 複雜的 useEffect 鏈（移至 hooks）
- ❌ 重複的狀態管理邏輯（抽取到 hooks）
- ❌ 硬編碼的常數（移至 constants）

保留的職責：

- ✅ 組件組合與佈局
- ✅ 事件處理函數協調
- ✅ UI 狀態管理（editingLog, defaultMealType）

## 📈 優化成果

### 代碼品質提升

- **關注點分離**: 每個模組職責單一明確
- **可測試性**: Hooks 可獨立測試
- **可讀性**: import 語句更清晰，組件分類明確
- **可維護性**: 修改影響範圍更小

### 開發體驗改善

- **自動補全**: index.ts 提供統一匯入點
- **路徑簡化**: 使用 barrel exports
- **重用性**: UI 組件易於在其他專案重用

### 檔案對照表

| 舊位置                             | 新位置                                    | 類型         |
| ---------------------------------- | ----------------------------------------- | ------------ |
| `components/Button.tsx`            | `components/ui/Button.tsx`                | UI           |
| `components/Dialog.tsx`            | `components/ui/Dialog.tsx`                | UI           |
| `components/ThemeToggle.tsx`       | `components/ui/ThemeToggle.tsx`           | UI           |
| `components/CalorieTracking.tsx`   | `components/features/CalorieTracking.tsx` | Feature      |
| `components/WeightTracking.tsx`    | `components/features/WeightTracking.tsx`  | Feature      |
| `components/SwipeableItem.tsx`     | `components/features/SwipeableItem.tsx`   | Feature      |
| `components/Dashboard.tsx`         | `components/pages/Dashboard.tsx`          | Page         |
| `components/FoodEntry.tsx`         | `components/pages/FoodEntry.tsx`          | Page         |
| `components/EditProfile.tsx`       | `components/pages/EditProfile.tsx`        | Page         |
| `components/MonthCalendarView.tsx` | `components/pages/MonthCalendarView.tsx`  | Page         |
| `components/Onboarding.tsx`        | `components/pages/Onboarding.tsx`         | Page         |
| `components/WeightDataList.tsx`    | `components/pages/WeightDataList.tsx`     | Page         |
| `App.tsx`（邏輯）                  | `hooks/*`                                 | Custom Hooks |
| `App.tsx`（常數）                  | `constants/storage.ts`                    | Constants    |

## 🔧 使用範例

### 在組件中使用 Hooks

```typescript
import { useUserProfile, useFoodLogs } from "../hooks";

function MyComponent() {
  const { user, updateUser } = useUserProfile();
  const { logs, addLog } = useFoodLogs();

  // 使用狀態和方法
}
```

### 統一匯入組件

```typescript
// 舊方式 ❌
import { Dashboard } from "./components/Dashboard";
import { FoodEntry } from "./components/FoodEntry";
import { Button } from "./components/Button";

// 新方式 ✅
import { Dashboard, FoodEntry } from "./components/pages";
import { Button } from "./components/ui";
```

## 📝 注意事項

### Import 路徑變化

- 頁面/功能組件內：`from '../../types'`（多一層）
- 統一匯出使用：`from './components/pages'`

### 向後相容

- ✅ 所有功能保持不變
- ✅ LocalStorage 格式未變
- ✅ 使用者資料完全相容
- ✅ 無需資料遷移

### 建置驗證

```bash
✓ npm run build
✓ 1679 modules transformed
✓ built in 1.26s
```

## 🚀 未來擴展方向

當專案持續成長時（20+ 組件），可考慮：

1. **Feature-based 架構**: 依功能模組化（food-tracking/, weight-tracking/）
2. **Shared 資料夾**: 抽取共用邏輯
3. **Services 層**: API 呼叫、複雜業務邏輯
4. **測試檔案**: 每個 hook 和組件配對測試

## 📚 參考資料

- [React Folder Structure - Robin Wieruch](https://www.robinwieruch.de/react-folder-structure/)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [React Best Practices](https://react.dev/learn/thinking-in-react)

---

**版本**: v1.4 (架構優化版)
**優化者**: GitHub Copilot
**審核者**: eleanorewu
