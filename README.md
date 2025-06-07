# すきなものリスト

あなたの「好き」を整理してシェアする Web アプリケーション

## 🌟 サービス概要

すきなものリストは、あなたの好きなものを11位まで整理してランキング形式で保存・共有できるサービスです。

### 主な機能

- **ランキング作成**: 好きなもの・ことをカテゴリ別に11位まで整理
- **カテゴリ管理**: 大カテゴリ・小カテゴリで分類
- **画像追加**: お気に入りのアイテムに画像を追加
- **URL添付**: 商品やサービスのリンクを保存
- **簡単共有**: Twitterでランキングやアイテムをワンクリックシェア
- **レスポンシブ対応**: スマホ・タブレット・PCで快適に利用可能

## 🚀 開発環境のセットアップ

### 前提条件

- Node.js 18.x 以上
- npm または yarn

### 環境構築

1. リポジトリをクローン
```bash
git clone <repository-url>
cd ranking11
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.local.example .env.local
# .env.local を編集して必要な環境変数を設定
```

4. データベースのセットアップ
```bash
npx prisma generate
npx prisma db push
```

5. 開発サーバーを起動
```bash
npm run dev
```

6. ブラウザで開く
[http://localhost:3000](http://localhost:3000)

## 🛠 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **認証**: NextAuth.js (Twitter OAuth)
- **データベース**: PostgreSQL (Neon)
- **ORM**: Prisma
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel
- **ドメイン**: [sukilist.jp](https://sukilist.jp)

## 📁 プロジェクト構成

```
src/
├── app/              # App Router ページ
├── components/       # React コンポーネント
├── contexts/         # React Context
├── lib/             # ライブラリとユーティリティ
└── types/           # TypeScript 型定義
```

## 🌐 本番環境

**URL**: [https://sukilist.jp](https://sukilist.jp)

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。
