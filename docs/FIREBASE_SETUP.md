# Firebase 環境配置說明

## 📋 設定步驟

### 1. 從 Firebase Console 取得配置資訊

#### 測試環境 (Development)

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的**測試專案**
3. 點擊專案設定（齒輪圖示）→ 一般設定
4. 在「你的應用程式」區塊中，找到 Firebase SDK 配置
5. 複製所有配置值

#### 正式環境 (Production)

重複上述步驟，但選擇你的**正式專案**

### 2. 設定環境變數檔案

#### 開發環境

編輯 `.env.development` 檔案，填入測試專案的配置：

```env
VITE_FIREBASE_API_KEY=你的測試專案_api_key
VITE_FIREBASE_AUTH_DOMAIN=你的測試專案.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=你的測試專案_id
VITE_FIREBASE_STORAGE_BUCKET=你的測試專案.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=你的測試專案_sender_id
VITE_FIREBASE_APP_ID=你的測試專案_app_id
VITE_FIREBASE_MEASUREMENT_ID=你的測試專案_measurement_id
VITE_ENV=development
```

#### 正式環境

編輯 `.env.production` 檔案，填入正式專案的配置：

```env
VITE_FIREBASE_API_KEY=你的正式專案_api_key
VITE_FIREBASE_AUTH_DOMAIN=你的正式專案.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=你的正式專案_id
VITE_FIREBASE_STORAGE_BUCKET=你的正式專案.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=你的正式專案_sender_id
VITE_FIREBASE_APP_ID=你的正式專案_app_id
VITE_FIREBASE_MEASUREMENT_ID=你的正式專案_measurement_id
VITE_ENV=production
```

### 3. 在 Firebase Console 啟用服務

對於**測試專案**和**正式專案**，都需要啟用以下服務：

#### Authentication（身份驗證）

1. 在左側選單選擇「Authentication」
2. 點擊「開始使用」
3. 啟用你需要的登入方式（例如：Email/Password、Google、Facebook 等）

#### Firestore Database（資料庫）

1. 在左側選單選擇「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇模式：
   - **測試專案**：可以選擇「測試模式」（開發時使用）
   - **正式專案**：務必選擇「正式環境模式」並設定安全規則

#### Storage（儲存空間）

1. 在左側選單選擇「Storage」
2. 點擊「開始使用」
3. 設定安全規則（建議先用測試模式，之後再調整）

### 4. 設定 Firestore 安全規則（重要！）

#### 開發/測試環境規則

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 正式環境規則（更嚴格）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 使用者只能存取自己的資料
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /foodLogs/{logId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    match /weightRecords/{recordId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. 設定 Storage 安全規則

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

## 🚀 執行專案

### 開發模式（使用測試專案）

```bash
npm run dev
```

### 正式環境打包（使用正式專案）

```bash
npm run build
```

## 📁 檔案說明

- `.env.example` - 環境變數範例檔（可提交到 Git）
- `.env.development` - 開發環境配置（**不要提交到 Git**）
- `.env.production` - 正式環境配置（**不要提交到 Git**）
- `config/firebase.ts` - Firebase 初始化檔案
- `vite-env.d.ts` - TypeScript 環境變數型別定義

## 🔒 安全注意事項

1. ❌ **絕對不要**將 `.env.development` 或 `.env.production` 提交到 Git
2. ✅ 已在 `.gitignore` 中設定忽略這些檔案
3. ✅ 只提交 `.env.example` 作為範本
4. 🔐 正式環境務必設定嚴格的 Firestore 和 Storage 安全規則
5. 🔐 不要在客戶端程式碼中暴露敏感的 API 金鑰或密鑰

## 🆘 疑難排解

### 問題：執行時出現 "Missing Firebase configuration keys" 錯誤

**解決方法**：檢查 `.env.development` 檔案是否存在且所有必要欄位都已填寫

### 問題：無法讀取/寫入 Firestore

**解決方法**：

1. 確認 Firestore 已在 Firebase Console 中啟用
2. 檢查安全規則是否正確設定
3. 確認使用者已登入（`request.auth != null`）

### 問題：無法上傳照片到 Storage

**解決方法**：

1. 確認 Storage 已在 Firebase Console 中啟用
2. 檢查 Storage 安全規則
3. 確認檔案路徑和使用者權限

## 📚 使用方式

在你的應用程式中使用 Firebase：

```typescript
import { auth, db, storage } from "./config/firebase";

// 使用 Authentication
import { signInWithEmailAndPassword } from "firebase/auth";

// 使用 Firestore
import { collection, addDoc } from "firebase/firestore";

// 使用 Storage
import { ref, uploadBytes } from "firebase/storage";
```

## 🌐 環境變數在 Vite 中的使用

Vite 會根據執行模式自動載入對應的環境變數：

- `npm run dev` → 載入 `.env.development`
- `npm run build` → 載入 `.env.production`

在程式碼中存取環境變數：

```typescript
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

⚠️ 注意：環境變數必須以 `VITE_` 開頭才能在客戶端程式碼中使用。
