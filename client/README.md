# 餐廳點餐系統

一個使用 React + Supabase 建構的即時餐廳點餐系統，支援顧客掃碼點餐、廚房即時接單、後台管理等功能。

## 功能特色

| 端點 | 功能 |
|------|------|
| **顧客端** | 掃描 QR Code 點餐、瀏覽菜單、購物車、送出訂單 |
| **廚房端** | 即時接單看板（接單中 → 製作中 → 已完成）、單品完成標記 |
| **管理後台** | POS 桌況、菜單管理、類別管理、營收統計、桌位編輯 |

---

# 部署教學

請依照以下步驟完成部署，全程約 15-20 分鐘。

## 步驟一：註冊必要帳號

請先註冊以下三個免費服務：

| 服務 | 用途 | 註冊連結 |
|------|------|----------|
| **GitHub** | 程式碼託管 | [github.com](https://github.com) |
| **Supabase** | 資料庫 + 即時功能 + 用戶認證 | [supabase.com](https://supabase.com) |
| **Netlify** | 網站託管 | [netlify.com](https://netlify.com) |

> 以上服務皆提供免費方案，足夠小型餐廳使用。

---

## 步驟二：建立 Supabase 專案

1. 登入 [supabase.com](https://supabase.com)
2. 點擊 **New Project**
3. 填寫專案名稱（如 `restaurant-order`）
4. 設定資料庫密碼（請記住，稍後會用到）
5. 選擇地區（建議選 **Northeast Asia (Tokyo)**）
6. 點擊 **Create new project**
7. 等待專案建立完成（約 1-2 分鐘）

### 記下重要資訊

專案建立後，到左側 **Project Settings** → **API**，記下：

- **Project URL**（如 `https://xxxxx.supabase.co`）
- **anon public** key（一長串 `eyJhbG...` 開頭的文字）

> ⚠️ 這兩個值稍後部署時會用到，請先複製到記事本備用。

---

## 步驟三：設定資料庫

1. 在 Supabase 左側點擊 **SQL Editor**
2. 點擊 **New query**
3. 複製以下 SQL 貼上並執行（點擊 **Run** 或按 `Ctrl+Enter`）

```sql
-- ============================
-- 第一段：建立資料表
-- ============================

-- 建立類別資料表
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  order_index INT DEFAULT 0
);

-- 建立菜單資料表
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  categoryid TEXT REFERENCES categories(id),
  name TEXT NOT NULL,
  price INT NOT NULL,
  image TEXT,
  description TEXT
);

-- 建立桌位資料表
CREATE TABLE IF NOT EXISTS tables (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  seats INT DEFAULT 4
);

-- 建立訂單資料表
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tableid INT REFERENCES tables(id),
  items JSONB NOT NULL,
  totalprice INT NOT NULL,
  status TEXT DEFAULT 'pending',
  paymentstatus TEXT DEFAULT 'unpaid',
  paymentmethod TEXT,
  createdat TIMESTAMP DEFAULT NOW()
);

-- 插入預設類別
INSERT INTO categories (id, name, order_index) VALUES
  ('cat_1', '主食', 1),
  ('cat_2', '小菜', 2),
  ('cat_3', '飲料', 3)
ON CONFLICT (id) DO NOTHING;

-- 插入預設桌位
INSERT INTO tables (id, name, status, seats) VALUES
  (1, '桌號 1', 'available', 4),
  (2, '桌號 2', 'available', 4),
  (3, '桌號 3', 'available', 4),
  (4, '桌號 4', 'available', 4)
ON CONFLICT (id) DO NOTHING;
```

執行成功後會顯示 `Success. No rows returned`。

---

## 步驟四：啟用即時功能 (Realtime)

這步驟讓廚房能即時收到新訂單。

1. 在 SQL Editor 執行以下指令：

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
```

---

## 步驟五：設定資料安全政策 (RLS)

這步驟設定誰可以讀寫資料。

1. 在 SQL Editor 執行以下指令：

```sql
-- 啟用 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 公開讀取（所有人可看菜單和桌位）
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read tables" ON tables FOR SELECT USING (true);
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);

-- 公開寫入（顧客可點餐、更新訂單狀態）
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Public update tables" ON tables FOR UPDATE USING (true);

-- 管理員完整權限
CREATE POLICY "Auth full categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full menu_items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full tables" ON tables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
```

---

## 步驟六：建立管理員帳號

1. 在 Supabase 左側點擊 **Authentication** → **Users**
2. 點擊 **Add user** → **Create new user**
3. 輸入：
   - **Email**：你的管理員信箱
   - **Password**：設定密碼
4. 點擊 **Create user**

> 這個帳號用來登入管理後台。

---

## 步驟七：部署到 Netlify

### 方法 A：一鍵部署（推薦）

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/scorpioliu0953/restaurant_order)

1. 點擊上方按鈕
2. 登入 Netlify（會要求連接 GitHub 帳號）
3. 填入環境變數：
   - `VITE_SUPABASE_URL`：貼上步驟二記下的 Project URL
   - `VITE_SUPABASE_ANON_KEY`：貼上步驟二記下的 anon key
4. 點擊 **Save & Deploy**
5. 等待部署完成（約 1-2 分鐘）

### 方法 B：手動部署

如果一鍵部署失敗，可以：

1. Fork 此專案到你的 GitHub
2. 在 Netlify Dashboard 點擊 **Add new site** → **Import an existing project**
3. 選擇 GitHub → 選擇你 Fork 的 repository
4. 設定建置選項：

| 欄位 | 值 |
|------|-----|
| Base directory | `client` |
| Build command | `npm run build` |
| Publish directory | `client/dist` |

5. 加入環境變數：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. 點擊 **Deploy site**

---

## 步驟八：開始使用

部署完成後，Netlify 會給你一個網址（如 `https://xxx.netlify.app`）。

| 頁面 | 網址 | 說明 |
|------|------|------|
| 首頁 | `https://xxx.netlify.app` | 入口選單 |
| 顧客點餐 | `https://xxx.netlify.app/table/1` | 掃 QR Code 進入 |
| 廚房看板 | `https://xxx.netlify.app/kitchen` | 即時接單畫面 |
| 管理後台 | `https://xxx.netlify.app/admin` | 登入後管理 |

### 首次使用建議

1. 先到 **管理後台** 登入（用步驟六建立的帳號）
2. 到 **菜單管理** 新增你的餐點
3. 到 **POS 桌況** 調整桌位數量
4. 下載各桌的 QR Code 列印出來
5. 開啟 **廚房看板** 準備接單

---

# 使用說明

## 管理後台操作

### 新增餐點
1. 登入管理後台
2. 點擊左側 **菜單管理**
3. 在右側填寫餐點名稱、價格、類別
4. 可上傳圖片或使用預設圖片
5. 點擊 **新增**

### 管理類別
1. 在菜單管理頁面右下方 **類別管理**
2. 可新增、編輯、刪除類別
3. 拖曳類別可調整顯示順序

### 桌位管理
1. 點擊 **POS 桌況**
2. 右上角點擊 **開啟** 進入編輯模式
3. 可增減桌數、編輯桌名、調整座位數
4. 點擊 **下載 QR Code** 取得點餐連結

### 結帳流程
1. 點擊有訂單的桌位
2. 查看餐點明細，可調整數量
3. 選擇付款方式（LINE Pay / 街口 / 現金）
4. 結帳完成後桌位自動清空

---

# 本地開發（可選）

如果你想在自己電腦上修改程式碼：

```bash
# 1. Clone 專案
git clone https://github.com/scorpioliu0953/restaurant_order.git
cd restaurant_order/client

# 2. 安裝依賴
npm install

# 3. 建立環境變數檔案
# 在 client 目錄建立 .env 檔案，內容：
# VITE_SUPABASE_URL=你的URL
# VITE_SUPABASE_ANON_KEY=你的KEY

# 4. 啟動開發伺服器
npm run dev
```

開啟 http://localhost:5173 即可預覽。

---

# 技術架構

```
┌─────────────────┐         ┌─────────────────┐
│  React 前端     │ ──────▶ │   Supabase      │
│  (Netlify)      │ ◀────── │   (BaaS)        │
└─────────────────┘         └─────────────────┘
        │                           │
        │      Realtime 即時推播     │
        └───────────────────────────┘
```

- **前端**：React 19 + TypeScript + Vite + Tailwind CSS v4
- **後端**：Supabase（PostgreSQL + Auth + Realtime）
- **部署**：Netlify（靜態網站託管）

---

# 專案結構

```
client/
├── public/
│   └── _redirects          # Netlify SPA 路由設定
├── src/
│   ├── api.ts              # Supabase API 封裝
│   ├── lib/
│   │   └── supabase.ts     # Supabase 客戶端
│   ├── pages/
│   │   ├── Home.tsx        # 首頁
│   │   ├── CustomerOrder.tsx   # 顧客點餐
│   │   ├── KitchenDashboard.tsx # 廚房看板
│   │   └── AdminDashboard.tsx  # 管理後台
│   └── types.ts            # TypeScript 型別定義
├── .env                    # 環境變數（不上傳 Git）
└── netlify.toml            # Netlify 設定
```

---

# 常見問題

### Q: 顧客點餐頁面空白？
**A:** 確認步驟五的 RLS 政策已執行成功。

### Q: 廚房看板沒有即時更新？
**A:** 確認步驟四已執行，啟用 Realtime。

### Q: 網址 /table/1 顯示 404？
**A:** 確認 `public/_redirects` 檔案存在。

### Q: 管理後台無法登入？
**A:** 確認步驟六已建立用戶，且密碼正確。

### Q: 環境變數在哪裡找？
**A:** Supabase Dashboard → Project Settings → API

---

# 授權

MIT License
