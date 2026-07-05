# チョコット先生（Chocotte-Sensei）

日本人の先生と生徒をつなぐ学びのマッチング Web サービスです。

- **フロント / API / 管理画面**: Next.js 16（App Router）+ TypeScript
- **DB**: PostgreSQL + Prisma 6
- **認証**: NextAuth（Auth.js v5）Credentials + JWT
- **決済**: PayPal REST API（未設定時はテストモード）
- **本番ホスティング想定**: GitHub → **Cloudflare Pages / Workers**（OpenNext）

---

## ローカル開発

### 前提

- Node.js 20 以上
- PostgreSQL 14 以上

### セットアップ

```bash
# 依存関係
npm install

# 環境変数
cp .env.example .env
# DATABASE_URL / AUTH_SECRET / AUTH_URL を編集

# Prisma
npm run db:generate
npm run db:push      # または npm run db:migrate
npm run db:seed      # カテゴリー・管理者（任意）

# 開発サーバー
npm run dev
```

http://localhost:3000 で確認できます。

### よく使うコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番ビルドのローカル実行 |
| `npm run lint` | ESLint |
| `npm run db:generate` | Prisma Client 生成 |
| `npm run db:migrate` | マイグレーション（開発） |
| `npm run db:push` | スキーマを DB に反映（プロトタイプ向け） |
| `npm run db:seed` | シードデータ投入 |
| `npm run db:studio` | Prisma Studio |

---

## 環境変数一覧

| 変数 | 必須 | 説明 |
|------|:----:|------|
| `DATABASE_URL` | ✅ | PostgreSQL 接続 URL（**Cloudflare 本番は Prisma Accelerate の `prisma://` URL 必須**） |
| `AUTH_SECRET` | ✅ | NextAuth 署名用シークレット（32バイト以上） |
| `AUTH_URL` | ✅ | アプリの公開 URL（例: `https://chocotte-sensei.com`） |
| `AUTH_TRUST_HOST` | 推奨 | Cloudflare 背後では `true` |
| `PAYPAL_MODE` | 任意 | `sandbox` / `live`（未設定時はテストモード） |
| `PAYPAL_CLIENT_ID` | 任意 | PayPal REST API |
| `PAYPAL_CLIENT_SECRET` | 任意 | PayPal REST API |
| `NODE_VERSION` | Cloudflare | ビルド時 `20` 推奨 |

詳細は [.env.example](./.env.example) を参照してください。

---

## 本番デプロイ（GitHub → Cloudflare）

Next.js App Router（SSR / Server Actions）を Cloudflare で動かすには **OpenNext Cloudflare アダプタ** を使用します。

### 1. PostgreSQL を用意

Cloudflare 自体は PostgreSQL をホストしません。外部サービスを利用してください。

| サービス | 備考 |
|---------|------|
| [Neon](https://neon.tech) | サーバーレス向け・Cloudflare 連携実績あり |
| [Supabase](https://supabase.com) | 管理 UI が使いやすい |
| [Railway](https://railway.app) | シンプル |

接続 URL を `DATABASE_URL` に設定（`?sslmode=require` 推奨）。

### 2. コード側の本番設定

1. `src/constants/site.ts` の `SITE.url` を本番ドメインに変更
2. `public/favicon.ico` を配置（OGP・構造化データ用）
3. `.env` / Cloudflare 環境変数を本番値に設定

### 3. OpenNext + Cloudflare のセットアップ

```bash
npm install @opennextjs/cloudflare wrangler --save-dev
```

`package.json` には以下のスクリプトが設定済みです:

| スクリプト | 説明 |
|-----------|------|
| `npm run build:cloudflare` | Prisma 生成 + OpenNext ビルド |
| `npm run preview` | ビルド後、Wrangler でローカルプレビュー |
| `npm run deploy` | ビルド後、Cloudflare Workers へデプロイ |

`wrangler.jsonc` と `open-next.config.ts` がプロジェクトルートにあります。`name` や `compatibility_date` を必要に応じて編集してください。

```bash
# ローカルで Cloudflare 向けビルドを検証
npm run build:cloudflare
npm run preview
```

### 4. Cloudflare ダッシュボード設定

**Cloudflare Pages**（Git 連携）または **Workers** で GitHub リポジトリを接続します。

| 項目 | 値（例） |
|------|---------|
| ビルドコマンド | `npm run build:cloudflare` |
| 出力ディレクトリ | OpenNext の指示に従う（`.open-next` 等） |
| Node.js バージョン | `20` |
| 環境変数 | `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, PayPal 関連 |

シークレット値（`DATABASE_URL`, `AUTH_SECRET`, `PAYPAL_CLIENT_SECRET`）は **Encrypt** を有効にして保存してください。

### 5. データベースマイグレーション（本番）

Cloudflare のビルド環境から DB へ直接 migrate しない運用を推奨します。

```bash
# ローカルまたは CI から本番 DB へ（DATABASE_URL を本番に向ける）
npx prisma migrate deploy
```

初回のみ:

```bash
npm run db:seed   # カテゴリー・管理者（必要に応じて）
```

### 6. NextAuth（Auth.js）

| 設定 | 内容 |
|------|------|
| `AUTH_SECRET` | 本番用に新規生成（`openssl rand -base64 32`） |
| `AUTH_URL` | `https://your-domain.com`（末尾スラッシュなし） |
| `trustHost` | `auth.ts` で `trustHost: true` 済み |
| カスタムドメイン | Cloudflare DNS で Pages/Workers に向ける |

### 7. PayPal

1. [PayPal Developer](https://developer.paypal.com/) でアプリ作成
2. **Sandbox** で購入フロー全体をテスト
3. 本番公開時に `PAYPAL_MODE=live` と Live 認証情報に切り替え
4. 未設定のままではテストモード（実請求なし）で動作

### 8. デプロイ後の確認

- トップページ / 先生検索 / ログイン
- 先生・生徒登録
- 連絡先購入（Sandbox）
- 管理画面 `/admin`（管理者アカウント）
- `/sitemap.xml` / `/robots.txt`
- [Google Rich Results Test](https://search.google.com/test/rich-results) で JSON-LD 確認

---

## Cloudflare 向け補足

| 項目 | 推奨 |
|------|------|
| **DB 接続** | **Cloudflare 本番は Prisma Accelerate（`prisma://`）必須**。Neon 等 + Accelerate 推奨 |
| **環境変数** | Production / Preview で値を分ける（Preview は Sandbox PayPal 等） |
| **キャッシュ** | 動的ページ（検索・プロフィール・管理画面）は CDN キャッシュしない |
| **WAF** | Cloudflare WAF / Bot Fight Mode の検討 |
| **Hyperdrive** | Cloudflare Hyperdrive で DB レイテンシ改善（任意） |

---

## ディレクトリ構成（概要）

```
src/
  app/           # App Router（公開 / 認証 / 先生 / 生徒 / 管理）
  components/    # UI コンポーネント
  lib/           # データ取得・ビジネスロジック
  schemas/       # Zod バリデーション
  constants/     # 定数
prisma/          # スキーマ・マイグレーション・シード
```

---

## 公開前チェックリスト

### 先生登録
- [ ] `/register/teacher` から登録できる
- [ ] ログイン後 `/dashboard` に遷移する
- [ ] プロフィール編集・公開申請ができる

### 生徒登録
- [ ] `/register/student` から登録できる
- [ ] ログイン後 `/mypage` に遷移する
- [ ] プロフィール編集ができる

### 検索
- [ ] `/teachers` でキーワード・カテゴリー・地域検索が動く
- [ ] ページネーション・並び替えが動く
- [ ] カテゴリー / 地域ページが表示される

### 購入
- [ ] 公開プロフィールから購入画面へ遷移できる
- [ ] PayPal Sandbox（またはテストモード）で購入完了できる
- [ ] 銀行振込は PENDING → 管理画面で COMPLETED にできる
- [ ] 購入後のみ連絡先が表示される

### レビュー
- [ ] 購入完了済み生徒のみ投稿できる
- [ ] 管理画面で承認 / 非公開 / 削除できる
- [ ] 承認済みのみ公開プロフィールに表示される

### 本人確認
- [ ] 先生が `/verification` から申請できる
- [ ] 管理画面で承認 / 却下できる
- [ ] 承認後「本人確認済み」バッジが表示される

### お気に入り
- [ ] 生徒のみ ♡ 登録 / 解除できる
- [ ] `/mypage/favorites` に一覧表示される
- [ ] 未ログイン時はログインへ誘導される

### 管理画面
- [ ] `/admin` は ADMIN のみアクセス可能
- [ ] 先生 / 生徒 / 購入 / レビュー / 本人確認 / お問い合わせ管理が動く

### インフラ・SEO
- [ ] `SITE.url` と `AUTH_URL` が本番ドメインと一致
- [ ] `prisma migrate deploy` 済み
- [ ] SSL（Cloudflare）有効
- [ ] sitemap / robots が正しい URL を返す

---

## ライセンス

Private — All rights reserved.
