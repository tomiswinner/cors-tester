# Front — ローカル起動方法（簡易）

前提:

- Node.js（推奨 v16 / v18）がインストールされていること

コマンド:

```bash
cd front
# 依存をインストール
npm ci || npm install

# TypeScript をビルド
npm run build

# サーバ起動（デフォルト: http://localhost:3000）
npm start
```

Docker で起動する場合:

```bash
docker build -t cors-test-front:local .
docker run -p 3000:3000 cors-test-front:local
```
