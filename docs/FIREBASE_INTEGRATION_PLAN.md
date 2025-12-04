# Firebase 整合完整計畫

## 📊 目前狀態

- ✅ Firebase 配置已完成
- ✅ 環境變數已設定
- ❌ 還在使用 localStorage（資料只存在本地）
- ❌ 沒有使用者認證系統
- ❌ 資料不會同步到雲端

## 🎯 完整整合步驟

### 階段 0：在 Firebase Console 啟用服務（必須先做）

#### 測試專案 (dietlog-dev)

1. 前往 https://console.firebase.google.com/project/dietlog-dev/authentication

   - 點擊「開始使用」
   - 啟用「電子郵件/密碼」登入方法

2. 前往 https://console.firebase.google.com/project/dietlog-dev/firestore

   - 點擊「建立資料庫」
   - 選擇位置：`asia-east1`（台灣）或 `asia-northeast1`（日本）
   - 選擇「測試模式」（30 天後自動鎖定，可以之後改）

3. 前往 https://console.firebase.google.com/project/dietlog-dev/storage
   - 點擊「開始使用」
   - 使用預設設定

### 階段 1：建立認證系統 🔐

#### 需要建立的頁面/元件：

1. **LoginPage.tsx** - 登入頁面

   - Email + 密碼登入
   - 「還沒有帳號？註冊」連結
   - 「忘記密碼？」連結

2. **RegisterPage.tsx** - 註冊頁面

   - Email + 密碼註冊
   - 密碼確認
   - 「已有帳號？登入」連結

3. **useAuth.ts** - 認證 Hook
   - 登入功能
   - 註冊功能
   - 登出功能
   - 密碼重設功能
   - 監聽認證狀態變化

#### 流程：

```
使用者打開 App
    ↓
檢查是否已登入？
    ↓
否 → 顯示 Login/Register 頁面
    ↓
登入成功
    ↓
檢查是否有個人檔案？
    ↓
否 → 顯示 Onboarding（收集身體資料）
是 → 顯示 Dashboard
```

### 階段 2：整合 Firestore 資料庫 💾

#### 需要修改的檔案：

1. **useUserProfile.ts** - 改用 Firestore

   ```
   localStorage → Firestore collection: users/{userId}
   ```

2. **useFoodLogs.ts** - 改用 Firestore

   ```
   localStorage → Firestore collection: foodLogs/{userId}/logs/{logId}
   ```

3. **useWeightRecords.ts** - 改用 Firestore
   ```
   localStorage → Firestore collection: weightRecords/{userId}/records/{recordId}
   ```

#### Firestore 資料結構：

```
users/
  {userId}/
    profile: { name, age, gender, height, weight, ... }

foodLogs/
  {userId}/
    logs/
      {logId}/
        { date, mealType, food, calories, protein, ... }

weightRecords/
  {userId}/
    records/
      {recordId}/
        { date, weight, timestamp }
```

### 階段 3：整合 Firebase Storage 📸

#### 需要修改的功能：

1. **照片上傳** - FoodEntry.tsx

   ```
   本地 blob → Firebase Storage: users/{userId}/photos/{photoId}
   儲存 URL 到 Firestore
   ```

2. **照片顯示**

   ```
   從 Firestore 讀取 photoURL
   從 Storage 下載顯示
   ```

3. **照片刪除**
   ```
   從 Storage 刪除檔案
   從 Firestore 移除 URL
   ```

## 🚀 部署到線上

完成上述整合後，你需要：

### 1. 建置專案

```bash
npm run build
```

### 2. 部署選項

#### 選項 A：Firebase Hosting（推薦）✨

```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 初始化 Hosting
firebase init hosting

# 部署
firebase deploy
```

**優點**：

- 與 Firebase 服務整合最好
- 免費額度很高
- 自動 HTTPS
- 全球 CDN

#### 選項 B：Vercel

```bash
# 安裝 Vercel CLI
npm install -g vercel

# 部署
vercel
```

**優點**：

- 操作簡單
- 自動從 GitHub 部署
- 預覽環境

#### 選項 C：Netlify

- 直接連接 GitHub repo
- 自動部署

### 3. 環境變數設定

**重要**：部署時需要在平台上設定環境變數！

#### Firebase Hosting

在 `firebase.json` 旁建立 `.env.production`（已有）

#### Vercel/Netlify

在平台的設定頁面中加入：

```
VITE_FIREBASE_API_KEY=你的正式專案_api_key
VITE_FIREBASE_AUTH_DOMAIN=dietlog-137f9.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dietlog-137f9
...（其他環境變數）
```

## ⚠️ 重要：安全規則

部署前務必設定 Firestore 和 Storage 的安全規則！

### Firestore 安全規則

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 使用者資料
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 飲食記錄
    match /foodLogs/{userId}/logs/{logId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 體重記錄
    match /weightRecords/{userId}/records/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage 安全規則

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📝 總結

### ❌ 現在就推上 GitHub 能用嗎？

**不能**。因為：

1. 沒有登入/註冊功能
2. 資料還在 localStorage（不會同步）
3. 無法使用 Firestore 和 Storage

### ✅ 完成整合後才能：

1. 使用者可以註冊/登入
2. 資料儲存在雲端（Firestore）
3. 照片上傳到雲端（Storage）
4. 多裝置同步
5. 資料不會遺失

## 🎯 建議的實施順序

1. **今天**：在 Firebase Console 啟用所有服務
2. **第 1-2 天**：建立登入/註冊頁面（我可以幫你）
3. **第 3-4 天**：整合 Firestore（取代 localStorage）
4. **第 5 天**：整合 Storage（照片上傳）
5. **第 6 天**：測試所有功能
6. **第 7 天**：部署到線上

## 💡 需要我幫你做什麼？

我可以立即幫你：

1. ✅ 建立完整的 Auth 系統（登入/註冊頁面）
2. ✅ 建立 useAuth Hook
3. ✅ 修改 App.tsx 的路由邏輯
4. ✅ 整合 Firestore（取代 localStorage）
5. ✅ 整合 Storage（照片上傳）

你想從哪裡開始？我建議先建立 Auth 系統！
