import express, { Request, Response } from "express";

const app = express();
const port = Number(process.env.PORT || 8080);

// JSON / URLEncoded ボディのパース & ログ & キャッシュ無効化
app.use(
  express.json(),
  express.urlencoded({ extended: true }),
  (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    res.setHeader("Cache-Control", "no-store"); // 304 を防ぐ
    next();
  }
);

/** CORS設定 interface */
interface CorsConfig {
  enabled: boolean;
  allowOrigin: string;
  allowMethods: string;
  allowHeaders: string;
}

/** cors 設定初期値 */
let corsConfig: CorsConfig = {
  enabled: true,
  allowOrigin: "*",
  allowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowHeaders: "", // 空の場合、デフォルトで許可されるヘッダーが使用される（`Accept`, `Accept-Language`, `Content-Language`, `Content-Type`, `Range`）
};

/** CORS ヘッダーを設定する関数 */
function setCorsHeaders(req: Request, res: Response) {
  if (!corsConfig.enabled) return;

  const origin = corsConfig.allowOrigin === "*" 
    ? (req.headers.origin || "*")
    : corsConfig.allowOrigin;
  
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", corsConfig.allowMethods);
  if (corsConfig.allowHeaders) {
    res.setHeader("Access-Control-Allow-Headers", corsConfig.allowHeaders);
  }
}

/** メモリ上のデータストア interface */
interface Item {
  id: number;
  name: string;
  value?: string;
}

/** メモリ上のデータストア初期値 */
let items: Item[] = [
  { id: 1, name: "item1", value: "foo" },
  { id: 2, name: "item2", value: "bar" },
];

/** メモリ上のデータストア nextId 初期値 */
let nextId = 3;

// ========== CORS 設定 API ==========

// OPTIONS /api/cors-config - cors 設定用のAPIなので、常にCORS許可するように OPTIONS メソッドを別途用意
app.options("/api/cors-config", (req, res) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  res.status(204).end();
});


// GET /api/cors-config - 現在の cors 設定を取得
app.get("/api/cors-config", (req, res) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.json(corsConfig);
});

// POST /api/cors-config - cors 設定を更新
app.post("/api/cors-config", (req, res) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  
  corsConfig = { ...corsConfig, ...req.body };
  console.log("CORS config updated:", corsConfig);
  res.json(corsConfig);
});

// =============================== Items API ===============================
// cors 実験用の適当なデータ操作API

// プリフライト (OPTIONS) - items　用
app.options("/api/*", (req, res) => {
  setCorsHeaders(req, res);
  res.setHeader("Cache-Control", "no-store");
  res.status(204).end();
});

// GET /api/items - 全件取得
app.get("/api/items", (req, res) => {
  setCorsHeaders(req, res);
  res.json(items);
});

// POST /api/items - 新規作成
app.post("/api/items", (req, res) => {
  setCorsHeaders(req, res);
  const { name, value } = req.body;
  const item: Item = { id: nextId++, name, value };
  items.push(item);
  res.status(201).json(item);
});

// PUT /api/items/:id - 全置換
app.put("/api/items/:id", (req, res) => {
  setCorsHeaders(req, res);
  const idx = items.findIndex((i) => i.id === Number(req.params.id));
  if (idx === -1) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const { name, value } = req.body;
  items[idx] = { id: items[idx].id, name, value };
  res.json(items[idx]);
});

// PATCH /api/items/:id - 部分更新
app.patch("/api/items/:id", (req, res) => {
  setCorsHeaders(req, res);
  const idx = items.findIndex((i) => i.id === Number(req.params.id));
  if (idx === -1) {
    res.status(404).json({ error: "not found" });
    return;
  }
  items[idx] = { ...items[idx], ...req.body };
  res.json(items[idx]);
});

// DELETE /api/items/:id - 削除
app.delete("/api/items/:id", (req, res) => {
  setCorsHeaders(req, res);
  const idx = items.findIndex((i) => i.id === Number(req.params.id));
  if (idx === -1) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const deleted = items.splice(idx, 1)[0];
  res.json(deleted);
});

app.listen(port, () => {
  console.log(`Back running at http://0.0.0.0:${port}`);
  console.log(`CORS config:`, corsConfig);
});
