# build
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
## npm ci は、package-lock.json ベースでインストールする、かつ、package.json と lock ファイルの不整合を検出してくれる
## Vite ビルドには devDependencies が必要なので --only=production は付けない
RUN npm ci
COPY . .
RUN npm run build

# runtime
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

## npm prune は devDependencies を削除してくれるが、
## 不足してるパッケージは追加してくれないので、npm ci --only=production を build で使う方が確実。
