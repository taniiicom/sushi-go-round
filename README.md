https://github.com/user-attachments/assets/11cc11a0-51e4-4058-af44-cc4d46454b3e

https://github.com/user-attachments/assets/17f945b5-86cd-4816-bf7f-1f261670104c

# create-nexpress-app

Next.js x Express x Prisma x OpenAPI x TS の高速開発モノレポテンプレート

an "express" development monorepo template with Next.js x Express x Prisma x OpenAPI x TS to release 1app / 1month.

## つかいかた / howto.

```bash
npx create-nexpress-app
```

## スタック / stack.

- typescript

front
- nextjs v14
- chakra-ui v2

server
- express
- docker

shared
- prisma
- openapi

## 特徴 / features.

- `server`, `front` それぞれ `packages` で管理するスタンダードなモノレポ構成
- `server` 側で, `prisma`, `openapi` を定義することで管理をシンプルにしつつ, 生成された型定義を `shared` パッケージで共有
- 自動生成スクリプトをルート直下の `scripts` に集約
