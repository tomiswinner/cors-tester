# Back — ローカル起動方法（簡易）

前提:

- Node.js がインストールされているか、Docker を使えること

コマンド:

```bash
cd back
npm install
npm run build
npm start

# または Docker を使う場合
docker build -t cors-test-back:local .
docker run -p 8080:8080 cors-test-back:local
```
