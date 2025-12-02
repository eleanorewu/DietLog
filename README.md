# DietLog 產品規格書

## 1. 產品概述

### 1.1 產品名稱

DietLog - 飲食控制紀錄 PWA  
http://dietlog-pwa.vercel.app

### 1.2 產品定位

一款輕量級的漸進式網頁應用程式（PWA），專為需要管理飲食與體重的使用者設計。提供簡潔直觀的介面，讓使用者能輕鬆記錄每日飲食、追蹤營養攝取、監控體重變化，並根據個人化目標調整飲食計畫。

### 1.3 目標使用者

- 需要紀錄飲食的使用者
- 需要量身定制飲食建議的使用者
- 注重營養均衡的健康管理者

### 1.4 核心價值

- **簡單易用**：直觀的操作介面，快速記錄飲食
- **個人化**：根據使用者身體數據計算專屬營養目標
- **視覺化追蹤**：圖表呈現攝取狀況與體重變化趨勢
- **隨時隨地**：PWA 技術支援離線使用與安裝到裝置

---

## 2. 技術架構

### 2.1 技術棧

- **前端框架**：React 19.2.0
- **狀態管理**：React Context API（主題管理）
- **建構工具**：Vite 6.2.0
- **程式語言**：TypeScript 5.8.2
- **樣式方案**：Tailwind CSS（CDN，支援 dark mode）
- **圖表庫**：Recharts 3.5.0
- **圖示庫**：Lucide React 0.554.0
- **PWA 支援**：vite-plugin-pwa 1.1.0
- **圖片處理**：browser-image-compression 2.0.2

### 2.2 應用架構

- **單頁應用程式（SPA）**：React-based 無路由單頁設計
- **狀態管理**：React Hooks + Context API
- **本地儲存（LocalStorage）**：資料儲存於瀏覽器本地
- **響應式設計**：適配桌面與行動裝置（Tailwind CSS）
- **離線優先**：支援 PWA 離線功能
- **主題系統**：Light/Dark Mode 自動偵測與持久化

### 2.3 儲存架構

使用 LocalStorage 儲存四組主要資料：

- `dietlog_user_v1`：使用者個人檔案（包含營養目標、身體數據等）
- `dietlog_logs_v1`：飲食記錄（每日飲食條目與營養資訊）
- `dietlog_weight_records_v1`：體重記錄（體重追蹤資料）
- `theme`：主題偏好設定（'light' | 'dark'，獨立儲存以優化載入速度）

### 2.4 專案結構

```
dietlog/
├── components/           # React 組件（依功能分類）
│   ├── ui/              # 通用 UI 組件
│   │   ├── Button.tsx   # 通用按鈕組件（4 種變體）
│   │   ├── Dialog.tsx   # 確認對話框
│   │   ├── ThemeToggle.tsx  # 主題切換開關
│   │   └── index.ts     # 統一匯出
│   ├── features/        # 功能性組件
│   │   ├── CalorieTracking.tsx  # 熱量追蹤圖表
│   │   ├── WeightTracking.tsx   # 體重追蹤圖表
│   │   ├── SwipeableItem.tsx    # 滑動刪除組件
│   │   └── index.ts     # 統一匯出
│   └── pages/           # 頁面組件
│       ├── Dashboard.tsx    # 主頁面儀表板
│       ├── FoodEntry.tsx    # 飲食記錄表單
│       ├── EditProfile.tsx  # 編輯個人檔案
│       ├── MonthCalendarView.tsx  # 月曆檢視
│       ├── Onboarding.tsx   # 使用者引導流程（5 步驟）
│       ├── WeightDataList.tsx  # 體重記錄列表
│       └── index.ts     # 統一匯出
├── hooks/               # 自訂 React Hooks（狀態管理）
│   ├── useUserProfile.ts    # 使用者資料與 localStorage 持久化
│   ├── useFoodLogs.ts       # 飲食記錄 CRUD 操作
│   ├── useWeightRecords.ts  # 體重記錄管理與去重
│   ├── useNavigation.ts     # 導航狀態管理
│   └── index.ts         # 統一匯出
├── constants/           # 常數定義
│   └── storage.ts       # LocalStorage 鍵值與類型定義
├── contexts/            # React Context
│   └── ThemeContext.tsx # 主題狀態管理
├── public/              # 靜態資源
│   ├── icons/          # PWA 圖示
│   └── manifest.json   # PWA Manifest
├── scripts/             # 工具腳本
│   └── generate-icons.js  # 圖示生成器
├── App.tsx              # 主應用組件（簡化版，使用 custom hooks）
├── index.tsx            # 應用入口
├── types.ts             # TypeScript 類型定義
├── utils.ts             # 工具函數（計算 BMI、TDEE、營養素等）
├── index.html           # HTML 模板
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
├── package.json         # 專案依賴
├── REFACTORING.md       # 架構重構文件
└── README.md            # 產品規格書
```

**架構說明**

- **components/ui/**：可重用的基礎 UI 元件（按鈕、對話框、主題切換）
- **components/features/**：特定功能模組（圖表、互動組件）
- **components/pages/**：完整頁面級組件
- **hooks/**：業務邏輯抽離為 Custom Hooks，實現狀態管理與 UI 解耦
- **constants/**：集中管理常數，避免硬編碼
- 每個組件資料夾包含 `index.ts` 統一匯出，簡化引用路徑

---

## 3. 功能規格

### 3.1 使用者引導（Onboarding）

#### 3.1.1 功能描述

初次使用時，引導使用者建立個人化檔案，分為 5 個步驟。

#### 3.1.2 步驟流程

**步驟 1：基本資訊**

- 名字（必填）
- 性別：生理男 / 生理女
- 年齡（必填）

**步驟 2：身體數據**

- 身高（cm，必填，支援小數點後兩位）
- 體重（kg，必填，支援小數點後兩位）
- 即時顯示 BMI 值與健康狀態分類

**步驟 3：活動量等級**

- 久坐（辦公室工作）
- 輕度活動（每週運動 1-2 天）
- 中度活動（每週運動 3-5 天）
- 高度活動（每天運動）
- 超高度活動（每天高強度運動或體力工作）

**步驟 4：目標選擇**

- 減重
- 維持體重
- 增肌

**步驟 5：目標設定**

- 目標體重（kg，必填）
- 預計每週減重（kg/週，必填）
- 顯示預估達成時間（週數）

#### 3.1.3 計算邏輯

- **BMR（基礎代謝率）**：使用 Mifflin-St Jeor 公式
  - 男性：`10 × 體重 + 6.25 × 身高 - 5 × 年齡 + 5`
  - 女性：`10 × 體重 + 6.25 × 身高 - 5 × 年齡 - 161`
- **TDEE（每日總消耗）**：`BMR × 活動係數`
  - 久坐：1.2
  - 輕度活動：1.375
  - 中度活動：1.55
  - 高度活動：1.725
  - 超高度活動：1.9
- **目標熱量**：
  - 減重：`TDEE - 500 kcal`
  - 維持：`TDEE`
  - 增肌：`TDEE + 300 kcal`
- **巨量營養素分配**：
  - 減重/增肌：蛋白質 40% / 碳水 35% / 脂肪 25%
  - 維持：蛋白質 20% / 碳水 50% / 脂肪 30%

#### 3.1.4 驗證規則

- 名字不可為空
- 年齡必須為正整數
- 身高、體重、目標體重、每週減重必須為正數
- 數值欄位支援最多兩位小數

---

### 3.2 主控面板（Dashboard）

#### 3.2.1 功能描述

顯示使用者每日飲食攝取概況、營養素達成狀況與飲食記錄。

#### 3.2.2 介面元件

**頂部導航**

- 日期選擇器（週曆檢視）
- 設定按鈕
- 日曆按鈕（切換至月曆檢視）

**週曆檢視**

- 顯示本週七天（一到日）
- 每日顯示日期與星期
- 有記錄的日期顯示圓點標記
- 選中日期高亮顯示
- 今日日期特殊標記
- 未來日期灰階顯示且不可選
- 前後週切換按鈕

**每日攝取概況**

- **已攝取**：當日總熱量
- **每日目標**：使用者目標熱量
- **TDEE**：使用者總消耗熱量
- **環形進度圖**：
  - 綠色：未超標
  - 紅色：已超標
  - 中心顯示剩餘或超標熱量

**巨量營養素追蹤**

- 蛋白質、碳水、脂肪
- 進度條顯示攝取比例
- 當前值 / 目標值（g）
- 超標時顯示警示圖示與紅色標記

**餐別分類**

- 早餐、午餐、晚餐、點心
- 每個餐別顯示總熱量
- 食物清單：
  - 食物圖片（若有）
  - 食物名稱
  - 熱量、蛋白質、碳水、脂肪
- 滑動刪除功能（行動裝置）
- 懸停顯示刪除按鈕（桌面裝置）
- 新增按鈕（每個餐別底部）

**未來日期鎖定**

- 顯示鎖定圖示與提示訊息
- 禁止新增或編輯記錄

#### 3.2.3 互動行為

- 點擊日期切換查看該日記錄
- 點擊食物項目進入編輯模式
- 滑動或點擊刪除按鈕刪除記錄（需確認）
- 點擊「新增」按鈕新增飲食記錄

---

### 3.3 飲食記錄（Food Entry）

#### 3.3.1 功能描述

新增或編輯單筆飲食記錄，包含圖片、名稱、餐別與營養資訊。

#### 3.3.2 介面元件

**頂部導航**

- 返回按鈕
- 標題（新增紀錄 / 編輯紀錄）
- 刪除按鈕（編輯模式且非未來日期）

**圖片上傳區**

- 點擊上傳圖片
- 支援圖片壓縮（最大 1MB，最大寬高 1920px）
- 預覽已上傳圖片
- 更換圖片按鈕（右下角浮動按鈕）

**表單欄位**

- **食物名稱**：文字輸入，預設「未知名稱」
- **餐別選擇**：早餐 / 午餐 / 晚餐 / 點心
- **營養成分**：
  - 熱量（kcal）
  - 蛋白質（g）
  - 碳水（g）
  - 脂肪（g）

**底部按鈕**

- 儲存紀錄 / 更新紀錄
- 未來日期時禁用且顯示提示

#### 3.3.3 互動行為

- 圖片壓縮過程顯示載入動畫
- 數值欄位僅接受數字與小數點
- 無效輸入時顯示錯誤提示（3 秒後自動消失）
- 刪除操作需二次確認

#### 3.3.4 資料結構

```typescript
interface FoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  photoUrl?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
```

---

### 3.4 月曆檢視（Month Calendar View）

#### 3.4.1 功能描述

以月為單位檢視飲食記錄狀況，快速跳轉至特定日期。

#### 3.4.2 介面元件

- 月份切換按鈕（上一月 / 下一月）
- 日期格線（7 列 × 最多 6 行）
- 有記錄的日期顯示綠色圓點
- 選中日期高亮顯示
- 未來日期灰階顯示且不可選
- 關閉按鈕返回主控面板

#### 3.4.3 互動行為

- 點擊日期選擇該日並返回主控面板
- 未來日期不可點擊

---

### 3.5 設定頁面（Settings）

#### 3.5.1 功能描述

檢視與編輯使用者個人檔案、查看熱量與體重追蹤資訊。

#### 3.5.2 介面元件

**頂部導航**

- 返回按鈕
- 標題：設定

**深色模式切換**

- 精美的 Toggle Switch 切換開關
- 太陽圖示（淺色模式）/ 月亮圖示（深色模式）
- 平滑的滑動動畫效果與顏色過渡
- 即時顯示當前主題狀態
- 設定自動保存至 localStorage
- 下次啟動時自動載入使用者偏好
- 首次訪問時自動適應系統設定

**個人檔案區塊**

- 顯示：年齡、身高、體重、活動量等級、目標、目標體重、每週減重
- 編輯按鈕（進入編輯個人檔案頁面）

**熱量追蹤區塊**

- 7 天熱量趨勢折線圖
- X 軸：日期
- Y 軸：熱量值
- 參考線：每日目標熱量（綠色虛線）

**體重追蹤區塊**

- 當前體重顯示與編輯功能
- 減重進度資訊：
  - 還需減重（kg）
  - 預估達成時間（週）
- 體重趨勢折線圖
- 參考線：目標體重（綠色虛線）
- 查看體重資料列表按鈕

**重置按鈕**

- 刪除所有資料並回到引導頁面
- 需二次確認

#### 3.5.3 互動行為

- 點擊編輯按鈕修改體重（自動新增體重記錄）
- 點擊列表按鈕進入體重資料列表

---

### 3.6 編輯個人檔案（Edit Profile）

#### 3.6.1 功能描述

修改使用者個人資料，重新計算營養目標。

#### 3.6.2 介面元件

- 與引導流程相同的表單欄位
- 預填現有資料
- 儲存按鈕
- 取消按鈕

#### 3.6.3 互動行為

- 修改資料後自動重新計算 TDEE、目標熱量與巨量營養素
- 儲存後返回設定頁面

---

### 3.7 體重資料列表（Weight Data List）

#### 3.7.1 功能描述

檢視所有體重記錄，支援刪除功能。

#### 3.7.2 介面元件

- 返回按鈕
- 標題：體重記錄
- 記錄清單：
  - 日期
  - 體重值
  - 刪除按鈕

#### 3.7.3 體重記錄規則

- **單日唯一記錄**：
  - 系統僅保留每日最後一筆體重記錄
  - 當同一天有多次體重更新時，新的記錄會覆蓋舊的記錄
  - 確保每個日期（YYYY-MM-DD）只對應一筆體重資料
- **記錄時機**：
  - 在設定頁面手動更新體重時自動記錄
  - 編輯個人檔案修改體重時自動記錄
  - 相同日期的多次更新會以最新一筆為準
- **資料一致性**：
  - 體重趨勢圖表使用每日最後上傳的體重值
  - 體重資料列表顯示每日唯一記錄
  - 刪除記錄後該日期不再顯示體重資料點

#### 3.7.4 互動行為

- 滑動或點擊刪除按鈕刪除記錄（需確認）
- 最新記錄排在最上方

#### 3.7.5 資料結構

```typescript
interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  weight: number; // kg
  note?: string;
}
```

---

### 3.8 熱量追蹤（Calorie Tracking）

#### 3.8.1 功能描述

在設定頁面顯示所有有記錄日期的熱量攝取趨勢圖表。

#### 3.8.2 長條圖規格設計

**圖表類型與基本配置**

- **圖表類型**：長條圖（Bar Chart）
- **圖表高度**：256px（固定高度）
- **資料範圍**：所有有飲食記錄的日期（不限時間範圍）
- **圖表庫**：Recharts 3.5.0

**軸線設定**

- **X 軸（日期軸）**：
  - 資料來源：`displayDate`（月/日格式，如「12/1」）
  - 字體大小：12px
  - 字體顏色：#64748b（slate-500）
  - 軸線顏色：#cbd5e1（slate-300）
  - 標籤間隔：`interval={0}`（顯示所有日期）
  - 標籤角度：
    - ≤14 筆記錄：水平顯示（angle=0）
    - > 14 筆記錄：傾斜 -45 度（angle=-45, textAnchor='end'）
  - 軸高度：
    - ≤14 筆記錄：30px
    - > 14 筆記錄：60px（為傾斜標籤預留空間）
- **Y 軸（熱量軸）**：
  - 單位：kcal
  - 字體大小：12px
  - 字體顏色：#64748b（slate-500）
  - 軸線顏色：#cbd5e1（slate-300）
  - 固定寬度：50px（左側固定區域）

**視覺元素**

- **長條（Bar）**：
  - 填充色：#10b981（emerald-500 翠綠色）
  - 頂部圓角：8px（`radius={[8, 8, 0, 0]}`）
  - 單個長條寬度：40px
  - 間距：由 Recharts 自動計算
- **網格線（CartesianGrid）**：
  - 樣式：虛線（`strokeDasharray="3 3"`）
  - 顏色：#f1f5f9（slate-100 淺灰色）
- **參考線（ReferenceLine）**：
  - Y 值：`user.targetCalories`（目標熱量）
  - 顏色：#64748b（slate-500 灰色）
  - 樣式：虛線（`strokeDasharray="5 5"`）
  - 標籤：「目標」，位置右上角（insideTopRight），字體大小 12px

**互動元素**

- **Tooltip（懸停提示）**：
  - 觸發方式：滑鼠懸停於長條上
  - 背景色：#ffffff（白色）
  - 邊框：1px solid #e2e8f0（slate-200）
  - 圓角：8px
  - 字體大小：12px
  - 文字顏色：#475569（slate-600）
  - 顯示內容：「攝取熱量：XXX kcal」

**邊距設定（Margin）**

- ≤14 筆記錄：`{ top: 20, right: 30, left: 0, bottom: 35 }`
- > 14 筆記錄：`{ top: 20, right: 30, left: 0, bottom: 65 }`

#### 3.8.3 資料處理邏輯

**資料聚合**

```typescript
// 按日期分組計算每日總熱量
const dailyData: { [date: string]: number } = {};
logs.forEach((log) => {
  if (dailyData[log.date]) {
    dailyData[log.date] += log.calories;
  } else {
    dailyData[log.date] = log.calories;
  }
});
```

**圖表資料準備**

- 提取所有有記錄的日期，按日期排序（升序）
- 轉換日期格式為「月/日」顯示格式
- 建立圖表資料結構：
  ```typescript
  {
    date: string,        // 原始日期 YYYY-MM-DD
    displayDate: string, // 顯示日期 M/D
    calories: number     // 當日總熱量
  }
  ```

**空資料處理**

- 當 `chartData.length === 0` 時：
  - 顯示空狀態訊息：「尚無飲食記錄」
  - 文字樣式：text-sm text-slate-400
  - 位置：垂直水平居中

**顯示規則**

- ✅ 有記錄的日期：顯示對應高度的綠色長條
- ❌ 無記錄的日期：不顯示，不佔用圖表空間
- 📊 資料點數量：無上限，顯示所有歷史記錄

#### 3.8.4 響應式滾動設計

**佈局結構**

```
外層容器（h-64）
├─ 固定 Y 軸區域（flex-shrink-0, width: 50px）
│  └─ ResponsiveContainer + BarChart（僅顯示 Y 軸）
└─ 可滾動圖表區域（flex-1, overflow-x-auto）
   └─ 動態寬度容器
      └─ ResponsiveContainer + BarChart（顯示長條與 X 軸）
```

**動態寬度計算**

- 最小寬度：`Math.max(chartData.length × 40, 350)`
  - 每筆記錄佔用 40px 寬度
  - 至少保持 350px 最小寬度
- 當記錄數量較少時：寬度自適應容器（100%）
- 當記錄數量較多時：超出容器寬度，啟用水平滾動

**滾動行為**

- Y 軸固定不動，始終可見
- X 軸與長條可水平滾動
- 滾動條樣式：瀏覽器預設樣式
- 支援觸控滑動（行動裝置）

#### 3.8.5 卡片資訊區塊

**卡片佈局**

- 背景色：白色
- 內邊距：16px
- 圓角：12px
- 邊框：1px solid #f1f5f9（slate-100）
- 陰影：shadow-sm（淺陰影）

**顯示資訊**

1. **標題**：「卡路里」（text-base font-bold text-slate-700）
2. **每日目標**：
   - 標籤：「每日目標」
   - 數值：`{user.targetCalories} kcal`（font-bold text-emerald-600）
3. **每日總消耗**：
   - 標籤：「每日總消耗 (TDEE)」
   - 數值：`{user.tdee} kcal`（font-bold text-slate-900）
4. **長條圖**：（詳見上述規格）

---

### 3.9 體重追蹤（Weight Tracking）

#### 3.9.1 功能描述

在設定頁面顯示體重變化趨勢折線圖，追蹤體重達成進度。

#### 3.9.2 折線圖規格設計

**圖表類型與基本配置**

- **圖表類型**：折線圖（Line Chart）
- **圖表高度**：256px（固定高度）
- **資料範圍**：所有體重記錄（按時間戳排序）
- **圖表庫**：Recharts 3.5.0

**軸線設定**

- **X 軸（日期軸）**：
  - 資料來源：`displayDate`（月/日格式，使用 zh-TW 地區格式）
  - 字體大小：12px
  - 字體顏色：#64748b（slate-500）
  - 軸線顏色：#cbd5e1（slate-300）
  - 標籤間隔：`interval={0}`（顯示所有日期）
  - 標籤角度：
    - ≤14 筆記錄：水平顯示（angle=0）
    - > 14 筆記錄：傾斜 -45 度（angle=-45, textAnchor='end'）
  - 軸高度：
    - ≤14 筆記錄：30px
    - > 14 筆記錄：60px
- **Y 軸（體重軸）**：
  - 單位：kg
  - 字體大小：12px
  - 字體顏色：#64748b（slate-500）
  - 軸線顏色：#cbd5e1（slate-300）
  - 固定寬度：50px
  - 數值格式：保留兩位小數（`tickFormatter={(value) => value.toFixed(2)}`）
  - 動態範圍：`[Math.floor(minWeight - padding), Math.ceil(maxWeight + padding)]`
    - padding = (maxWeight - minWeight) × 0.1，最少 2kg

**視覺元素**

- **折線（Line）**：
  - 類型：`monotone`（平滑曲線）
  - 顏色：#10b981（emerald-500 翠綠色）
  - 線條粗細：2px（`strokeWidth={2}`）
- **資料點（Dot）**：
  - 填充色：#10b981（emerald-500）
  - 半徑：4px（`r={4}`）
  - 懸停時半徑：6px（`activeDot={{ r: 6 }}`）
- **網格線（CartesianGrid）**：
  - 樣式：虛線（`strokeDasharray="3 3"`）
  - 顏色：#f1f5f9（slate-100）
- **參考線（ReferenceLine）**：
  - Y 值：`user.targetWeight`（目標體重）
  - 顏色：#10b981（emerald-500 翠綠色）
  - 樣式：虛線（`strokeDasharray="5 5"`）
  - 標籤：「目標」，位置右側（right），綠色文字，字體大小 12px

**互動元素**

- **Tooltip（懸停提示）**：
  - 觸發方式：滑鼠懸停於資料點或折線上
  - 背景色：#ffffff（白色）
  - 邊框：1px solid #e2e8f0（slate-200）
  - 圓角：8px
  - 字體大小：12px
  - 文字顏色：#475569（slate-600）
  - 顯示內容：「體重：XX.XX kg」（保留兩位小數）

**邊距設定（Margin）**

- ≤14 筆記錄：`{ top: 5, right: 20, left: 0, bottom: 5 }`
- > 14 筆記錄：`{ top: 5, right: 20, left: 0, bottom: 50 }`

#### 3.9.3 資料處理邏輯

**資料排序與轉換**

```typescript
// 按時間戳排序，確保折線圖按時間順序顯示
const chartData = weightRecords
  .sort((a, b) => a.timestamp - b.timestamp)
  .map((record) => ({
    date: record.date,
    weight: record.weight,
    displayDate: new Date(record.date + "T00:00:00").toLocaleDateString(
      "zh-TW",
      { month: "numeric", day: "numeric" }
    ),
  }));
```

**Y 軸動態範圍計算**

```typescript
const weights = chartData.map((d) => d.weight);
const minWeight = Math.min(...weights, user.targetWeight);
const maxWeight = Math.max(...weights, user.targetWeight);
const yAxisPadding = (maxWeight - minWeight) * 0.1 || 2; // 至少 2kg padding
const yDomain = [
  Math.floor(minWeight - yAxisPadding),
  Math.ceil(maxWeight + yAxisPadding),
];
```

**空資料處理**

- 當 `chartData.length === 0` 時：
  - 不顯示圖表卡片
  - 僅顯示「當前體重」卡片

**顯示規則**

- ✅ 有記錄的日期：顯示對應體重的資料點
- ❌ 無記錄的日期：不顯示，折線跳過（不連接不相鄰的點）
- 📊 資料點數量：無上限，顯示所有歷史記錄
- 🔄 記錄覆蓋：同一天多次記錄時，僅保留最後一筆（見 3.7.3 體重記錄規則）

#### 3.9.4 響應式滾動設計

**佈局結構**

```
外層容器（h-64）
└─ 可滾動容器（overflow-x-auto, overflow-y-hidden）
   └─ 動態寬度容器
      └─ ResponsiveContainer + LineChart
```

**動態寬度計算**

- 最小寬度：`Math.max(chartData.length × 50, 400)`
  - 每筆記錄佔用 50px 寬度
  - 至少保持 400px 最小寬度
- 當記錄數量較少時：寬度自適應容器（100%）
- 當記錄數量較多時：超出容器寬度，啟用水平滾動

**滾動行為**

- 整個圖表（包含 Y 軸）可水平滾動
- 滾動條樣式：瀏覽器預設樣式
- 支援觸控滑動（行動裝置）

#### 3.9.5 卡片資訊區塊

**當前體重卡片**

- **標題**：「當前體重」（text-base font-bold text-slate-700）
- **編輯按鈕**：鉛筆圖示（SquarePen, size=16）
- **顯示模式**：
  - 體重數值：大字顯示（text-2xl font-bold text-green-700）
  - 單位：kg（text-lg font-medium text-slate-600）
  - 分隔線：border-t border-slate-100
  - 進度資訊：
    - **還需減重**：`XX.XX kg`（font-bold text-orange-600）
    - **預估達成時間**：`約 X 週`（font-bold text-green-600）
    - **已達成**：🎉 已達成目標！（text-green-600）
    - **已超過**：🎉 已超過目標 XX.XX kg（text-green-600）
- **編輯模式**：
  - 輸入框：綠色邊框（border-2 border-green-400）
  - 支援小數點後兩位
  - 快捷鍵：Enter 儲存、Escape 取消
  - 按鈕：
    - 儲存：綠色按鈕（bg-green-600）
    - 取消：灰色邊框按鈕（border border-slate-200）

**體重趨勢圖卡片**

- **標題**：「體重」（text-base font-bold text-slate-700）
- **列表按鈕**：清單圖示 + 「列表」文字（List icon, size=16）
- **折線圖**：（詳見上述規格）
- **顯示條件**：`chartData.length > 0`（至少有一筆體重記錄）

#### 3.9.6 體重更新邏輯

**更新時機**

- 在設定頁面點擊編輯按鈕手動更新
- 在編輯個人檔案頁面修改體重

**記錄規則**（詳見 3.7.3）

- 同一天僅保留最後一筆記錄
- 自動新增時間戳（`Date.now()`）
- 自動生成唯一 ID（`Date.now().toString()`）

**資料同步**

- 更新 `UserProfile.weight`
- 新增或覆蓋 `WeightRecord`
- 即時儲存至 LocalStorage（`dietlog_weight_records_v1`）
- 自動重新計算進度資訊

---

## 4. UI/UX 設計規範

### 4.1 設計風格

- **簡約現代**：扁平化設計，減少視覺干擾
- **綠色系主題**：代表健康與活力
- **卡片式佈局**：清晰分隔不同功能區塊

### 4.2 色彩系統

**淺色模式（Light Mode）**

- **主色調**：Emerald 500 (#10B981) - 按鈕、進度條、高亮
- **輔助色**：
  - Slate 50-900 - 背景、文字、邊框
  - Red 500 (#EF4444) - 超標警示、刪除按鈕
  - Blue 500 (#3B82F6) - 資訊提示
  - Amber 600 (#D97706) - 警告提示
- **背景色**：Gray 100 (#F3F4F6)

**深色模式（Dark Mode）**

- **主色調**：Emerald 500 (#10B981) 保持一致
- **輔助色**：
  - Gray 700-900 - 背景層級
  - Gray 200-400 - 文字顏色
  - Gray 600 - 邊框、分隔線
  - Red 400-500 - 超標警示、刪除按鈕（柔和版本）
  - Emerald 400 - 高亮文字（柔和版本）
  - Amber 400 - 警告提示（柔和版本）
- **背景色**：
  - 主背景：Gray 900 (#111827)
  - 卡片背景：Gray 800 (#1F2937)
  - 次級背景：Gray 700 (#374151)
- **過渡效果**：所有顏色變化添加 `transition-colors duration-200` 實現平滑切換

### 4.3 字體系統

- **標題**：粗體（Font Weight 700-800）
- **正文**：中等（Font Weight 400-500）
- **數據**：粗體（Font Weight 600-700）
- **尺寸**：
  - 特大標題：2xl (24px)
  - 大標題：xl (20px)
  - 中標題：lg (18px)
  - 正文：sm-base (14-16px)
  - 小字：xs (12px)

### 4.4 間距系統

- 基於 Tailwind CSS 間距系統（0.25rem 倍數）
- 卡片內邊距：16-24px
- 元素間距：8-16px

### 4.5 響應式設計

- **行動優先**：預設為手機尺寸（375×667px）
- **桌面模式**：
  - 固定寬度容器（375px）
  - 固定高度（667px）
  - 圓角陰影效果模擬手機介面
- **平板模式**：介於行動與桌面之間

### 4.6 動畫與過渡

- **淡入動畫**：頁面切換（fadeIn）
- **滑入動畫**：側邊欄、彈窗（slideIn）
- **進度條動畫**：平滑過渡（transition-all duration-300）
- **按鈕回饋**：點擊縮放（active:scale-[0.98]）

---

## 5. 資料管理

### 5.1 資料儲存

- **技術**：LocalStorage API
- **容量限制**：約 5-10 MB（依瀏覽器而異）
- **資料持久化**：關閉瀏覽器後資料仍保留

### 5.2 資料同步

- 所有資料變更即時儲存至 LocalStorage
- 使用 `useEffect` 監聽狀態變化自動儲存

### 5.3 資料遷移

- 版本化儲存鍵（如 `_v1`）
- 載入時檢查並補充新增欄位預設值
- 向後相容舊版本資料

### 5.4 資料備份與重置

- 支援完整重置功能（清除所有 LocalStorage 資料）
- 無自動備份功能（未來可擴充雲端同步）

---

## 6. 進階功能

### 6.1 日期管理

- **時區處理**：使用台灣時區（Asia/Taipei）
- **日期格式**：YYYY-MM-DD
- **未來日期限制**：無法新增或編輯未來日期的記錄

### 6.2 圖片處理

- **壓縮演算法**：browser-image-compression
- **壓縮設定**：
  - 最大檔案大小：1 MB
  - 最大寬高：1920px
  - 輸出格式：JPEG
  - 使用 Web Worker 提升效能
- **儲存方式**：Base64 編碼儲存於 LocalStorage

### 6.3 滑動互動（Swipeable Item）

- **技術**：Touch Events API
- **功能**：向左滑動顯示刪除按鈕
- **平台適配**：僅在行動裝置啟用，桌面使用懸停顯示

### 6.4 對話框（Dialog）

- **功能**：二次確認操作（刪除、重置）
- **類型**：
  - 一般確認
  - 危險操作（紅色確認按鈕）
- **互動**：點擊遮罩或取消按鈕關閉

### 6.5 深色模式（Dark Mode）

- **技術實現**：
  - React Context API 管理全局主題狀態
  - Tailwind CSS `dark:` 修飾符（class 模式）實現樣式切換
  - 主題狀態同步到 `document.documentElement.classList`
  - 獨立的 ThemeContext 與 UserProfile 雙軌管理
- **狀態管理**：
  - ThemeContext 提供主題狀態與切換函數
  - ThemeProvider 包裹整個應用
  - 主題偏好優先使用 localStorage 獨立儲存
  - 同步更新 UserProfile.theme（用於未來擴充）
- **智慧初始化**：
  - **優先級 1**：localStorage 儲存的使用者偏好設定
  - **優先級 2**：系統偏好設定檢測（`prefers-color-scheme`）
  - **優先級 3**：預設為淺色模式
  - 首次訪問時自動適應系統深色/淺色模式
- **持久化儲存**：
  - 使用 `localStorage.setItem('theme', 'light'|'dark')` 獨立儲存
  - 主題切換時即時保存
  - 頁面重新整理後自動恢復使用者選擇
  - 跨瀏覽器分頁同步（未來可擴充）
- **UI 組件**：
  - 精美的切換開關（Toggle Switch）位於設定頁面
  - 太陽圖示（淺色模式）/ 月亮圖示（深色模式）視覺化當前狀態
  - 平滑的滑動動畫效果（slate-600 深色背景）
  - 即時切換反饋
- **全局支援**：
  - 所有頁面和組件完整適配（12+ 組件）
  - 顏色過渡動畫（`transition-colors duration-200`）
  - 保持品牌色一致性（Emerald 綠色系）
  - 圖表動態顏色調整（Recharts 主題感知）
  - 表單輸入框深色模式優化

---

## 7. PWA 特性

### 7.1 Manifest 設定

```json
{
  "name": "DietLog",
  "short_name": "DietLog",
  "description": "輕鬆記錄每日飲食，管理健康生活。",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" }
  ]
}
```

### 7.2 離線支援

- Service Worker 快取靜態資源
- 應用程式外殼快取策略
- 離線時仍可訪問已載入頁面

### 7.3 安裝提示

- 支援「新增至主畫面」功能
- 獨立視窗模式（standalone）

---

## 8. 效能優化

### 8.1 載入優化

- Vite 快速建構與熱更新
- 程式碼分割（Code Splitting）
- 圖片壓縮減少儲存空間

### 8.2 渲染優化

- React 19 自動批次更新
- 避免不必要的重新渲染（useMemo、useCallback）
- 虛擬滾動（未來可擴充）

### 8.3 資料優化

- LocalStorage 讀寫最小化
- 批次更新避免頻繁儲存

---

## 9. 無障礙設計（Accessibility）

### 9.1 鍵盤導航

- 支援 Tab 鍵切換焦點
- Enter 鍵確認操作
- Escape 鍵取消操作

### 9.2 語意化 HTML

- 使用適當的標籤（button、input、label）
- 提供 aria-label 與 title 屬性

### 9.3 對比度

- 符合 WCAG AA 標準
- 文字與背景對比度足夠

---

## 10. 安全性

### 10.1 資料隱私

- 所有資料儲存於使用者本地
- 無伺服器端資料收集
- 無需註冊或登入

### 10.2 輸入驗證

- 前端驗證所有表單輸入
- 防止無效數據寫入

---

## 11. 測試策略

### 11.1 功能測試

- 使用者引導流程完整性
- 飲食記錄新增、編輯、刪除
- 日期切換與篩選
- 圖表資料正確性

### 11.2 跨瀏覽器測試

- Chrome、Firefox、Safari、Edge
- iOS Safari、Android Chrome

### 11.3 響應式測試

- 不同螢幕尺寸適配
- 觸控與滑鼠操作

---

## 12. 未來擴充方向

### 12.1 雲端同步

- 使用者帳號系統
- 跨裝置資料同步
- 資料備份與恢復

### 12.2 AI 營養辨識

- 整合 Gemini API
- 圖片辨識食物與營養成分
- 自動填寫營養資訊

### 12.3 社群功能

- 分享飲食記錄
- 好友互動與挑戰
- 健康食譜推薦

### 12.4 進階分析

- 長期趨勢分析
- 營養均衡評分
- 健康建議推送

### 12.5 整合其他健康資料

- 運動記錄
- 睡眠追蹤
- 水分攝取

---

## 13. 版本資訊

### 當前版本：v1.4

**主要功能**

- ✅ 使用者引導與個人檔案建立
- ✅ 飲食記錄新增、編輯、刪除
- ✅ 每日營養追蹤與視覺化
- ✅ 體重記錄與趨勢圖
- ✅ 月曆與週曆檢視
- ✅ 圖片上傳與壓縮
- ✅ 深色模式（Dark Mode）與主題持久化
- ✅ 系統偏好設定自動偵測
- ✅ PWA 支援與離線功能
- ✅ 響應式設計
- ✅ 模組化架構與狀態管理優化

**最新更新（v1.4 - 2025/12/03）**

- 🏗️ **架構重構**：實作關注點分離與狀態管理優化
- 📁 **組件分類**：建立 `ui/`、`features/`、`pages/` 三層結構
- 🎣 **Custom Hooks**：抽離業務邏輯（useUserProfile、useFoodLogs、useWeightRecords、useNavigation）
- 🔧 **常數管理**：建立 `constants/storage.ts` 統一管理 LocalStorage 鍵值
- 📦 **Barrel Exports**：每個資料夾新增 `index.ts` 簡化引用
- ✨ **App.tsx 精簡**：從 416 行減至 ~320 行（移除 96 行重複邏輯）
- 📚 **文件完善**：新增 `REFACTORING.md` 記錄架構演進

**版本歷史**

**v1.3 (2025/12/02)**

- 🎨 新增完整深色模式支援
- 💾 主題偏好 localStorage 持久化
- 🌓 自動偵測系統色彩模式偏好
- ✨ 所有組件深色模式適配（12+ 組件）
- 📊 圖表動態主題顏色調整
- 🎯 優化輸入框深色模式顯示

**已知限制**

- 僅支援本地資料儲存
- 無雲端同步功能
- 無 AI 自動辨識食物

---

## 14. 開發與部署

### 14.1 開發環境

- Node.js（建議 v18 以上）
- npm 或 yarn

### 14.2 開發指令

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建構生產版本
npm run build

# 預覽生產版本
npm run preview
```

### 14.3 部署

- **平台**：Vercel
- **網址**：http://dietlog-pwa.vercel.app
- **自動部署**：推送至主分支自動觸發

---

## 15. 聯絡資訊

**專案名稱**：DietLog  
**Repository**：eleanorewu/DietLog  
**主要分支**：main  
**授權**：私有專案

---

## 附錄 A：資料結構完整定義

### UserProfile

```typescript
interface UserProfile {
  name: string;
  gender: "male" | "female";
  age: number;
  height: number; // cm
  weight: number; // kg
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  goal: "lose" | "maintain" | "gain";
  targetWeight: number; // kg
  weeklyWeightLoss: number; // kg/week
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
}
```

### FoodLog

```typescript
interface FoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  photoUrl?: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}
```

### WeightRecord

```typescript
interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  weight: number; // kg
  note?: string;
}
```

---

## 附錄 B：計算公式彙整

### BMI 計算

```
BMI = 體重(kg) ÷ (身高(m))²
```

### BMR 計算（Mifflin-St Jeor 公式）

```
男性：10 × 體重 + 6.25 × 身高 - 5 × 年齡 + 5
女性：10 × 體重 + 6.25 × 身高 - 5 × 年齡 - 161
```

### TDEE 計算

```
TDEE = BMR × 活動係數
```

### 目標熱量

```
減重：TDEE - 500 kcal
維持：TDEE
增肌：TDEE + 300 kcal
```

### 巨量營養素分配

**減重/增肌模式**

- 蛋白質：目標熱量 × 40% ÷ 4 (g)
- 碳水：目標熱量 × 35% ÷ 4 (g)
- 脂肪：目標熱量 × 25% ÷ 9 (g)

**維持模式**

- 蛋白質：目標熱量 × 20% ÷ 4 (g)
- 碳水：目標熱量 × 50% ÷ 4 (g)
- 脂肪：目標熱量 × 30% ÷ 9 (g)

---

_此規格書最後更新日期：2025 年 12 月 3 日_
