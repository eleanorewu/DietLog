# 體重管理優化說明

## 📋 優化目標

解決體重資訊在四個不同位置顯示不一致的問題：

1. 我的個人檔案（編輯體重）
2. 當前體重（儀表板體重追蹤）
3. 體重折線圖
4. 體重記錄列表

---

## 🔧 核心改變

### 1. **重新定義體重概念**

#### **個人檔案中的體重 → 初始體重**

- **用途**：作為基礎代謝率 (BMR) 和 TDEE 計算的基準
- **何時修改**：
  - Onboarding 設定時
  - 極少數需要調整基準體重時（例如長期體重變化後重新設定基準）
- **修改影響**：
  - 更新 `user.weight`
  - 重新計算所有代謝指標（BMR、TDEE、目標熱量、巨量營養素）
- **UI 標示**：改為「初始體重」，並加上說明提示

#### **當前體重 → 最新體重記錄**

- **資料來源**：從 `weightRecords` 陣列中取得最新一筆（根據 timestamp 排序）
- **何時修改**：每次測量體重時
- **修改方式**：
  - 只新增體重記錄到 `weightRecords`
  - **不再更新** `user.weight`
- **顯示邏輯**：
  ```typescript
  const currentWeight =
    weightRecords.length > 0
      ? weightRecords.sort((a, b) => b.timestamp - a.timestamp)[0].weight
      : user.weight; // 如果沒有記錄，顯示初始體重
  ```

---

### 2. **移除「當天只保留一筆記錄」的限制**

#### **舊邏輯**（已移除）

```typescript
// 檢查今天是否已有體重記錄
const existingRecord = weightRecords.find((record) => record.date === today);

if (existingRecord) {
  // 如果今天已有記錄，先刪除舊的
  await deleteWeightRecord(existingRecord.id);
}
```

#### **新邏輯**

- **保留所有測量記錄**：每次測量都建立新記錄，不刪除同一天的舊記錄
- **優點**：
  - 更真實反映體重波動
  - 避免使用者困惑（為什麼測量後舊記錄消失）
  - 可以追蹤一天內的體重變化（例如早晚差異）

---

### 3. **刪除體重記錄後的自動同步機制**

#### **新增 `handleDeleteWeightRecord` 函數**

```typescript
const handleDeleteWeightRecord = async (recordId: string) => {
  if (!user) return;

  try {
    await deleteWeightRecord(recordId);

    // 刪除後，如果還有記錄，用最新的記錄更新 user.weight（用於基礎代謝計算）
    const remainingRecords = weightRecords.filter((r) => r.id !== recordId);
    if (remainingRecords.length > 0) {
      const latestRecord = remainingRecords.sort(
        (a, b) => b.timestamp - a.timestamp
      )[0];

      // 更新 user.weight 並重新計算代謝指標
      const bmr = calculateBMR(
        user.gender,
        latestRecord.weight,
        user.height,
        user.age
      );
      const tdee = calculateTDEE(bmr, user.activityLevel);
      const targetCalories = calculateTargetCalories(tdee, user.goal);
      const macros = calculateMacros(targetCalories, user.goal);

      const updatedProfile: UserProfile = {
        ...user,
        weight: latestRecord.weight,
        tdee,
        targetCalories,
        targetProtein: macros.protein,
        targetFat: macros.fat,
        targetCarbs: macros.carbs,
      };

      await updateUser(updatedProfile);
    }
  } catch (error) {
    console.error("Failed to delete weight record:", error);
  }
};
```

#### **邏輯說明**

1. 刪除指定的體重記錄
2. 檢查是否還有其他記錄
3. 如果有，取得最新的記錄
4. 用最新記錄的體重更新 `user.weight`
5. 重新計算所有代謝指標
6. 確保「初始體重」始終與最新記錄同步

---

## 📊 資料流程圖

### **新增體重記錄**

```
使用者輸入新體重
    ↓
建立新的 WeightRecord
    ↓
儲存到 Firestore (weightRecords collection)
    ↓
Firestore 即時同步更新 weightRecords state
    ↓
「當前體重」自動顯示最新記錄
    ↓
體重圖表和列表自動更新
```

### **刪除體重記錄**

```
使用者刪除某筆記錄
    ↓
從 Firestore 刪除該記錄
    ↓
取得剩餘記錄中的最新一筆
    ↓
用該體重更新 user.weight (初始體重)
    ↓
重新計算 BMR, TDEE, 目標熱量等
    ↓
更新 Firestore 中的 user profile
    ↓
所有顯示位置自動同步
```

### **編輯個人檔案體重**

```
使用者在「我的個人檔案」修改初始體重
    ↓
更新 user.weight
    ↓
重新計算 BMR, TDEE, 目標熱量等
    ↓
更新 Firestore 中的 user profile
    ↓
❗ 不會新增體重記錄
    ↓
「當前體重」仍顯示最新記錄（不受影響）
```

---

## 🎯 使用者體驗改善

### **Before（舊設計）**

❌ 在個人檔案修改體重 → 當前體重改變，但圖表和列表沒更新 → 使用者困惑  
❌ 同一天測量多次 → 只保留最新一筆 → 使用者不知道舊記錄去哪了  
❌ 初始體重和當前體重混淆 → 不知道該在哪裡更新

### **After（新設計）**

✅ **清楚的職責劃分**：

- 「初始體重」（個人檔案）：調整基準值
- 「當前體重」（儀表板）：日常測量

✅ **完整的記錄保留**：

- 所有測量都被記錄
- 體重波動更真實

✅ **自動同步機制**：

- 刪除記錄後自動更新基準體重
- 所有顯示位置保持一致

✅ **更好的提示訊息**：

- 個人檔案加上「初始體重」標籤
- 加上使用說明提示

---

## 🔍 修改檔案清單

### 1. `/components/features/WeightTracking.tsx`

- ✅ 當前體重改為從 `weightRecords` 取得最新記錄
- ✅ 編輯時只新增記錄，不更新 `user.weight`
- ✅ 取消時恢復為當前體重（而非 `user.weight`）

### 2. `/components/pages/EditProfile.tsx`

- ✅ 體重欄位標籤改為「初始體重」
- ✅ 新增提示訊息說明用途

### 3. `/App.tsx`

- ✅ 修改 `handleUpdateWeight`：移除更新 `user.weight` 的邏輯
- ✅ 修改 `handleAddWeightRecord`：移除刪除當天舊記錄的邏輯
- ✅ 新增 `handleDeleteWeightRecord`：刪除後自動同步最新體重
- ✅ 將 `WeightDataList` 的 `onDeleteWeightRecord` 改為使用新函數

---

## 🧪 測試檢查項目

### ✅ 基本功能測試

- [ ] 在「當前體重」新增記錄 → 圖表和列表同步更新
- [ ] 在「當前體重」編輯 → 只新增記錄，不更新個人檔案
- [ ] 同一天測量多次 → 所有記錄都被保留
- [ ] 體重列表刪除記錄 → 個人檔案體重自動更新為最新記錄

### ✅ 邊界條件測試

- [ ] 刪除所有記錄只剩一筆 → 無法刪除最後一筆
- [ ] 沒有體重記錄時 → 當前體重顯示個人檔案的初始體重
- [ ] 修改個人檔案初始體重 → 不影響體重記錄列表

### ✅ 一致性測試

- [ ] 四個位置顯示的體重資訊都正確且一致
- [ ] 圖表資料與列表資料完全相同

---

## 💡 未來可考慮的優化

1. **體重記錄標籤**

   - 區分「初始體重」、「日常測量」等標籤
   - 可以在列表中顯示標籤

2. **圖表顯示模式**

   - 「顯示所有記錄」模式：顯示每次測量
   - 「每日平均」模式：同一天多筆取平均

3. **體重變化提醒**

   - 體重變化超過設定閾值時給予提醒
   - 達成階段性目標時的慶祝動畫

4. **體重趨勢分析**
   - 計算移動平均線
   - 預測達成目標的日期

---

## 📝 技術債務清單

- ✅ 已移除「當天只保留一筆」的限制
- ✅ 已統一體重資料來源
- ⏳ 考慮是否需要 Firestore 索引優化（如果體重記錄數量很大）

---

**優化完成日期**：2025 年 12 月 7 日  
**優化者**：GitHub Copilot
