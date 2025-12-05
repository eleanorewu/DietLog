# 環境變數設定說明

## 環境文件說明

專案使用以下環境變數文件：

- **`.env`** - 本地開發環境（預設）
- **`.env.development`** - 開發環境
- **`.env.production`** - 正式環境

## 設定步驟

### 1. 取得 Firebase 配置

前往 [Firebase Console](https://console.firebase.google.com/)：

1. 選擇你的專案
2. 點擊「專案設定」（齒輪圖示）
3. 在「一般」頁籤中，找到「你的應用程式」區塊
4. 選擇網頁應用程式，複製配置資訊

### 2. 填入環境變數

開啟對應的環境文件，填入你的 Firebase 配置：

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. 環境切換

#### 本地開發（使用 .env）
```bash
npm run dev
```

#### 開發環境部署
```bash
npm run build
# Vite 會自動載入 .env.production
```

#### 正式環境部署
確保 `.env.production` 已填入正式環境的 Firebase 配置，然後：
```bash
npm run build
npm run preview  # 預覽正式環境
```

## 安全注意事項

⚠️ **重要**：
- 環境變數文件已加入 `.gitignore`，不會被提交到 Git
- 不要在公開場合分享環境變數內容
- 開發和正式環境使用不同的 Firebase 專案
- 定期輪換 API 金鑰

## 驗證設定

啟動開發伺服器後，檢查 Console 是否顯示：
```
Firebase 已初始化 - 環境: development
```

如果看到錯誤訊息，請確認：
1. 環境變數文件已建立
2. 所有必要的變數都已填入
3. Firebase 專案設定正確

## 團隊協作

新成員加入時：
1. 複製 `.env.example` 為 `.env`
2. 向團隊管理員索取開發環境的 Firebase 配置
3. 填入配置後即可開始開發
