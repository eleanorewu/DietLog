# 🚀 快速開始

## 首次設定

1. **安裝依賴**
```bash
npm install
```

2. **設定環境變數**
```bash
# 複製環境變數範例（已自動建立）
# 編輯 .env 文件，填入你的 Firebase 配置
```

3. **取得 Firebase 配置**
   - 前往 [Firebase Console](https://console.firebase.google.com/)
   - 選擇專案 → 專案設定 → 你的應用程式
   - 複製配置資訊到 `.env` 文件

4. **啟動開發伺服器**
```bash
npm run dev
```

## 環境說明

### 📁 環境文件
- `.env` - 本地開發（預設）
- `.env.development` - 開發環境
- `.env.production` - 正式環境

### 🛠️ 指令說明

| 指令 | 說明 | 環境 |
|------|------|------|
| `npm run dev` | 啟動開發伺服器 | development |
| `npm run build` | 建置正式版本 | production |
| `npm run build:dev` | 建置開發版本 | development |
| `npm run preview` | 預覽正式版本 | production |
| `npm run preview:dev` | 預覽開發版本 | development |

## ⚠️ 目前狀態

**你需要完成以下步驟才能啟動專案：**

1. ✅ 已建立環境變數文件
2. ❌ **請填入 Firebase 配置到 `.env` 文件**

開啟 `.env` 文件，將以下內容替換為你的實際 Firebase 配置：

```env
VITE_FIREBASE_API_KEY=你的_API_金鑰
VITE_FIREBASE_AUTH_DOMAIN=你的專案ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=你的專案ID
VITE_FIREBASE_STORAGE_BUCKET=你的專案ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=你的發送者ID
VITE_FIREBASE_APP_ID=你的應用程式ID
VITE_FIREBASE_MEASUREMENT_ID=你的測量ID
```

## 📝 取得 Firebase 配置步驟

1. 開啟 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的專案（或建立新專案）
3. 點擊左側選單的「專案設定」⚙️
4. 滾動到「你的應用程式」區塊
5. 如果還沒有網頁應用程式，點擊 `</>` 新增
6. 複製 `firebaseConfig` 物件中的值
7. 貼上到對應的環境變數中

## 🔐 安全提醒

- ✅ 環境變數文件已加入 `.gitignore`
- ✅ 不會被提交到 Git 版本控制
- ⚠️ 不要將環境變數分享到公開場合
- ⚠️ 建議開發和正式環境使用不同的 Firebase 專案

## 🐛 常見問題

### 啟動後看到 Firebase 錯誤
- 確認 `.env` 文件已建立
- 確認所有環境變數都已正確填入
- 重新啟動開發伺服器

### 環境變數沒有載入
- Vite 只會載入 `VITE_` 開頭的環境變數
- 修改環境變數後需要重新啟動開發伺服器

## 📚 更多資訊

詳細的環境設定說明請參考：`docs/ENVIRONMENT_SETUP.md`
