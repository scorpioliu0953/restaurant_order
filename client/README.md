# 餐廳點餐系統

一個使用 React + Supabase 建構的即時餐廳點餐系統，支援顧客掃碼點餐、廚房即時接單、後台管理等功能。

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/scorpioliu0953/restaurant_order)

> **一鍵部署說明**：點擊上方按鈕後，Netlify 會自動 Fork 此專案到你的 GitHub，並引導你完成部署。部署時需要填入你自己的 Supabase 環境變數。

## 功能特色

### 顧客端
- 掃描桌上 QR Code 進入點餐頁面
- 瀏覽菜單（依類別分類）
- 加入購物車、調整數量
- 送出訂單

### 廚房端
- 即時接收新訂單（無需重新整理）
- 三欄式看板：接單中 → 製作中 → 已完成
- 單品完成標記功能

### 管理後台
- **POS 桌況**：查看所有桌位狀態、結帳
- **菜單管理**：新增/編輯餐點、類別管理、拖曳排序
- **營收統計**：依年/月/日篩選，支付方式分類統計
- **桌位編輯**：編輯桌名、座位數、下載 QR Code

## 技術架構

- **前端**：React 19 + TypeScript + Vite + Tailwind CSS v4
- **後端**：Supabase（PostgreSQL + Auth + Realtime）
- **部署**：Netlify（靜態網站託管）

```
┌─────────────┐     ┌─────────────┐
│   React     │────▶│  Supabase   │
│  Frontend   │◀────│  (BaaS)     │
└─────────────┘     └─────────────┘
      │                   │
      │   Realtime        │
      └───────────────────┘
```

---

## 快速開始

### 1. 建立 Supabase 專案

1. 前往 [supabase.com](https://supabase.com) 註冊/登入
2. 點擊 **New Project** 建立新專案
3. 記下以下資訊（稍後會用到）：
   - Project URL（如 `https://xxxxx.supabase.co`）
   - anon public key

### 2. 設定資料庫

在 Supabase Dashboard 的 **SQL Editor** 執行以下 SQL：

```sql
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

-- 插入預設資料
INSERT INTO categories (id, name, order_index) VALUES
  ('cat_1', '主食', 1),
  ('cat_2', '小菜', 2),
  ('cat_3', '飲料', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tables (id, name, status, seats) VALUES
  (1, '桌號 1', 'available', 4),
  (2, '桌號 2', 'available', 4),
  (3, '桌號 3', 'available', 4),
  (4, '桌號 4', 'available', 4)
ON CONFLICT (id) DO NOTHING;
```

### 3. 啟用 Realtime

1. 在 Supabase Dashboard 左側點擊 **Database** → **Publications**
2. 點擊 `supabase_realtime`
3. 將 `orders` 和 `tables` 加入發布

或在 SQL Editor 執行：

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
```

### 4. 設定 RLS（Row Level Security）

```sql
-- 啟用 RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 公開讀取
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read tables" ON tables FOR SELECT USING (true);
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);

-- 公開寫入（點餐、更新訂單狀態）
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Public update tables" ON tables FOR UPDATE USING (true);

-- 認證用戶完整權限（管理員）
CREATE POLICY "Auth full categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full menu_items" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full tables" ON tables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
```

### 5. 建立管理員帳號

1. 在 Supabase Dashboard 左側點擊 **Authentication** → **Users**
2. 點擊 **Add user** → **Create new user**
3. 輸入 Email 和密碼（這將用於登入管理後台）

---

## 本地開發

### 安裝依賴

```bash
cd client
npm install
```

### 設定環境變數

在 `client/` 目錄建立 `.env` 檔案：

```env
VITE_SUPABASE_URL=https://你的專案.supabase.co
VITE_SUPABASE_ANON_KEY=你的_anon_key
```

### 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器訪問：
- 首頁：http://localhost:5173
- 顧客點餐（桌號1）：http://localhost:5173/table/1
- 廚房看板：http://localhost:5173/kitchen
- 管理後台：http://localhost:5173/admin

---

## 部署到 Netlify

### 方法 A：手動上傳

1. 建置專案：
   ```bash
   cd client
   npm run build
   ```

2. 前往 [app.netlify.com](https://app.netlify.com)

3. 將 `client/dist` 資料夾拖曳上傳

### 方法 B：連接 GitHub 自動部署

1. 在 Netlify Dashboard 點擊 **Add new site** → **Import an existing project**

2. 選擇 **GitHub** 並授權

3. 選擇你的 repository

4. 設定建置選項：
   | 欄位 | 值 |
   |------|-----|
   | Base directory | `client` |
   | Build command | `npm run build` |
   | Publish directory | `client/dist` |

5. 點擊 **Add environment variables** 加入：
   - `VITE_SUPABASE_URL` = 你的 Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = 你的 anon key

6. 點擊 **Deploy site**

### 部署完成後

你會得到一個網址（如 `https://xxx.netlify.app`），這就是你的點餐系統！

- 顧客掃碼：`https://xxx.netlify.app/table/1`
- 廚房看板：`https://xxx.netlify.app/kitchen`
- 管理後台：`https://xxx.netlify.app/admin`

---

## 使用說明

### 管理後台登入

使用你在 Supabase Authentication 建立的 Email 和密碼登入。

### 新增餐點

1. 登入管理後台
2. 點擊左側 **菜單管理**
3. 在右側表單填寫餐點資訊
4. 可上傳圖片或使用預設圖片
5. 點擊 **新增**

### 管理類別

1. 在菜單管理頁面，右下方有 **類別管理**
2. 可新增、編輯、刪除類別
3. 拖曳類別可調整排序（前台會同步更新）

### 桌位管理

1. 點擊 **POS 桌況**
2. 右上角點擊 **開啟** 進入編輯模式
3. 可增減桌數、編輯桌名、調整座位數
4. 點擊 **下載 QR Code** 取得該桌的點餐連結

### 結帳流程

1. 在 POS 桌況點擊有訂單的桌位
2. 查看已點餐點，可調整數量或新增
3. 選擇付款方式（LINE Pay / 街口 / 現金）
4. 結帳完成後桌位自動清空

---

## 專案結構

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
│   ├── components/
│   │   └── ErrorBoundary.tsx   # 錯誤邊界
│   ├── types.ts            # TypeScript 型別定義
│   └── main.tsx            # 應用程式入口
├── .env                    # 環境變數（不會上傳 Git）
├── netlify.toml            # Netlify 設定
└── package.json
```

---

## 常見問題

### Q: 顧客點餐頁面顯示空白？
A: 確認 Supabase 的 RLS 政策已正確設定，允許公開讀取 `categories` 和 `menu_items`。

### Q: 廚房看板沒有即時更新？
A: 確認已在 Supabase 啟用 `orders` 資料表的 Realtime。

### Q: 直接訪問 /table/1 顯示 404？
A: 確認 `public/_redirects` 檔案存在且內容為 `/*    /index.html   200`。

### Q: 管理後台登入失敗？
A: 確認已在 Supabase Authentication 建立用戶，且使用正確的 Email 和密碼。

---

## 授權

MIT License
