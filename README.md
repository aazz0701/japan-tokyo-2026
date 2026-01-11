# Tokyo Trip 2026 (東京滑雪之旅)

這是專為 2026 年東京滑雪之旅打造的 PWA 旅遊管理應用程式。提供行程規劃、公費記帳與購物清單管理功能。

## ✨ 主要功能

- **行程管理 (Itinerary)**
  - 每日行程檢視 (Tab 切換)
  - 詳細行程資訊 (交通、地圖導航、備註)
  - 整合當地天氣預報 (Open-Meteo API)
  - **[管理員限定]** 編輯、新增、刪除行程
- **公費記帳 (Accounting)**
  - 紀錄共同支出
  - 自動計算每人應收/應付餘額
  - **[管理員限定]** 新增、刪除支出
- **購物清單 (Shopping)**
  - 想買清單 / 已購清單
  - **[管理員限定]** 編輯清單、標記購買狀態
- **旅遊資訊 (Info)**
  - 簡易匯率換算
  - 緊急聯絡資訊
  - **[隱藏功能]** 管理員模式開關

## 🛠️ 技術棧

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS, [shadcn/ui](https://ui.shadcn.com/)
- **PWA**: next-pwa (支援離線存取與安裝至主畫面)

## 🚀 快速開始

### 1. 安裝套件

```bash
npm install
```

### 2. 環境設定

專案使用 Firebase 作為後端。請確保 `lib/firebase.ts` 中已設定正確的 Firebase Config。

### 3. 啟動開發伺服器

```bash
npm run dev
```
打開瀏覽器前往 [http://localhost:3000](http://localhost:3000) 即可看到結果。

## 🔐 管理員模式 (Admin Mode)

為了防止誤觸，編輯功能預設為隱藏。

1. 前往 **Info (資訊)** 頁面。
2. 滑至最下方，連續點擊版本號文字 **"Tokyo Trip 2026 PWA v1.0"** 5 次。
3. 輸入 PIN 碼：`2026`。
4. 解鎖後即可看見編輯按鈕與新增表單。

## 📦 資料庫管理 (Data Management)

本專案提供腳本可將 Firestore 資料備份至本地 JSON 檔案，或從 JSON 還原。

### 備份資料 (Export)
將雲端資料庫的內容下載至 `data/backup.json`：

```bash
npx tsx scripts/manage_data.ts --export
```

### 還原資料 (Import)
將 `data/backup.json` 的內容覆蓋回雲端資料庫：
> ⚠️ 注意：此操作會覆寫雲端上的現有資料，請謹慎使用。

```bash
npx tsx scripts/manage_data.ts --import
```

## 📂 其他工具指令

- **批次更新住宿座標** (用於更新行程中的住宿經緯度資料)：
  ```bash
  npx tsx scripts/update_accommodation.ts
  ```
