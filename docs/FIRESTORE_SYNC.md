# Firebase Firestore 同步整合完成

## 🎉 已完成的功能

### 1. Firestore 服務層

- ✅ 建立 `services/firestore.ts`
- ✅ 所有 CRUD 操作（UserProfile, FoodLogs, WeightRecords）
- ✅ 即時同步訂閱 (onSnapshot)
- ✅ 自動資料遷移功能

### 2. Hooks 更新

- ✅ `useUserProfile` - 使用 Firestore 儲存個人檔案
- ✅ `useFoodLogs` - 即時同步飲食記錄
- ✅ `useWeightRecords` - 即時同步體重記錄
- ✅ 所有 hooks 都接收 Firebase UID 參數

### 3. App.tsx 整合

- ✅ 傳入 Firebase UID 到所有 hooks
- ✅ 自動執行 localStorage 到 Firestore 的資料遷移
- ✅ 所有 handlers 改為 async/await
- ✅ 錯誤處理

### 4. 安全性設定

- ✅ Firestore 安全規則 (`firestore.rules`)
- ✅ Firestore 索引設定 (`firestore.indexes.json`)

## 📋 部署步驟

### 步驟 1: 部署 Firestore 規則和索引

在專案根目錄執行：

```bash
# 安裝 Firebase CLI (如果還沒安裝)
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 初始化 Firestore (如果還沒初始化)
firebase init firestore

# 部署 Firestore 規則
firebase deploy --only firestore:rules

# 部署 Firestore 索引
firebase deploy --only firestore:indexes
```

### 步驟 2: 測試本地環境

```bash
# 安裝依賴
npm install

# 本地測試
npm run dev
```

### 步驟 3: 測試資料同步

1. **在手機上操作：**

   - 登入 Google 帳號
   - 完成 Onboarding
   - 新增一筆飲食記錄

2. **在電腦上操作：**

   - 使用相同的 Google 帳號登入
   - 檢查是否看到剛才在手機新增的記錄 ✨

3. **即時同步測試：**
   - 同時開啟手機和電腦
   - 在手機新增記錄
   - 電腦應該即時顯示（無需重新整理）

### 步驟 4: 部署到 Vercel

```bash
# 推送到 GitHub
git add .
git commit -m "feat: integrate Firestore for cross-device sync"
git push

# Vercel 會自動部署
```

確認 Vercel 環境變數已設定：

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## 🔄 資料遷移流程

### 自動遷移

- 首次登入時，系統會自動檢查 localStorage 是否有資料
- 如果 Firestore 還沒有該使用者的資料，會自動遷移
- 遷移包括：UserProfile、FoodLogs、WeightRecords

### 手動遷移（如果需要）

在瀏覽器 Console 執行：

```javascript
// 查看 localStorage 資料
console.log("User:", localStorage.getItem("dietlog_user"));
console.log("Logs:", localStorage.getItem("dietlog_logs"));
console.log("Weights:", localStorage.getItem("dietlog_weight_records"));
```

## 📊 資料結構

### Firestore Collections

```
users/{userId}
  - name: string
  - gender: string
  - age: number
  - height: number
  - weight: number
  - activityLevel: string
  - goal: string
  - targetWeight: number
  - weeklyWeightLoss: number
  - tdee: number
  - targetCalories: number
  - targetProtein: number
  - targetFat: number
  - targetCarbs: number

foodLogs/{logId}
  - userId: string (Firebase UID)
  - id: string
  - date: string (YYYY-MM-DD)
  - timestamp: number
  - mealType: string
  - name: string
  - calories: number
  - protein: number
  - fat: number
  - carbs: number
  - photoUrl?: string

weightRecords/{recordId}
  - userId: string (Firebase UID)
  - id: string
  - date: string (YYYY-MM-DD)
  - timestamp: number
  - weight: number
  - note?: string
```

## 🎯 核心功能

### 即時同步

- 使用 Firestore `onSnapshot` 監聽資料變化
- 任何裝置的更新都會即時反映到其他裝置
- 無需手動重新整理頁面

### 離線支援

- Firestore 自動提供離線快取
- 離線時可以繼續操作
- 連線恢復後自動同步

### 安全性

- 所有資料都有安全規則保護
- 使用者只能存取自己的資料
- 必須登入才能讀寫資料

## 🐛 故障排除

### 1. 索引錯誤

如果看到 "missing index" 錯誤：

- 點擊錯誤訊息中的連結自動建立索引
- 或執行 `firebase deploy --only firestore:indexes`

### 2. 權限錯誤

如果看到 "permission denied" 錯誤：

- 確認已部署 Firestore 規則
- 確認使用者已登入
- 檢查資料的 userId 是否正確

### 3. 資料未同步

- 檢查網路連線
- 開啟瀏覽器 Console 查看錯誤訊息
- 確認 Firebase 專案設定正確

## 📝 注意事項

1. **首次使用：** 每位使用者首次登入時會自動遷移 localStorage 資料
2. **資料隱私：** 所有資料都綁定 Firebase UID，不同使用者看不到彼此的資料
3. **效能：** 使用即時訂閱，資料更新即時且不會增加過多請求
4. **成本：** Firestore 免費額度足夠個人使用，但請注意讀寫次數

---

**🎊 恭喜！你的應用程式現在支援跨裝置即時同步了！**

手機和電腦的資料會完美同步，再也不用擔心資料不一致的問題！
