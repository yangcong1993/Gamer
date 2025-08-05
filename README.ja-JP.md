# GAMER Next.js Blog

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.5-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0)


Gamerは、Next.jsで開発された「ゲーム」をテーマにした個人ウェブサイトです。モダンなWeb技術と、ゲームならではのユニークなインタラクティブ体験を融合させました。

## :sparkles: サンプルサイト

- [Ripple's Blog](https://hiripple.com)

あなたもGamerを使用している場合は、ぜひプルリクエストを送ってください！

## :rocket: 主な特徴

- **:zap: 最高のパフォーマンス**：LightHouse、Gtmetrixテストで優れたパフォーマンスを発揮。平均パフォーマンス95%、SEOとベストプラクティスはほぼ100%。
- **:art: ゲーム風デザイン**：テーマに完璧にマッチした、シンプルでありながら洗練されたゲーム風UI/コンポーネントデザイン。
- **:gem: 細部へのこだわり**：レスポンシブデザイン、スムーズでモダンなフロントエンドアニメーション。
- **☀️ ダーク/ライトモード**：設定を記憶できる、洗練されたダーク/ライトモード。
- **🌎 国際化対応**：ルートレベルでの国際化をサポートし、SEOにも優れ、シームレスな言語切り替えが可能。
- **:computer: リアルタイムステータス**：WebSocket接続により、ブロガーのステータスやオンライン人数をリアルタイムで確認し、ライブコメントを送信。
- **:pencil: 構文サポート**：多様なライティングニーズに応える豊富なMarkdownおよびLaTeX構文をサポート。
- **🔌 拡張可能**：Buttondown、kBar、Umamiなどのプラグインを選択して機能を拡張可能。

## 🎮 特色機能

「ゲームをプレイするようにブログを閲覧できます！」

- **完全なキーボード/ゲームパッド対応**：マウスなしでスムーズにブログを閲覧でき、ゲームパッドの振動フィードバックもサポート。
- **仲間との探索**：Nikoと一緒にさまざまなページを探索し、架空の三人称視点でブログ記事やページを紹介。隠されたインタラクションも多数。
- **クエスト：イースターエッグ**：20以上のゲーム作品の要素を取り入れ、テーマに合わせてスタイリッシュに調整。
- **Sparks**：深い赤の通路を抜け、「海原電鉄」に乗って、まったく異なるスタイルの世界へ。

### 🔧 技術スタック

- **Next.js 15** + **React 19** + **TypeScript**
- **Tailwind CSS 4** スタイリングシステム
- **Contentlayer** コンテンツ管理
- **Supabase** バックエンドサービス
- **Framer Motion** アニメーションライブラリ
- **MDX** サポート

## 🚀 クイックスタート

### 前提条件

- Node.js 18+
- Yarn または npm

### インストール

```bash
npm install
```

### 環境設定

`.env.example` を `.env.local` にコピーし、環境変数を設定します。

### 開発モード

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセスして結果を確認します。

### ビルドとデプロイ

```bash
npm run build
npm start
```

## 📁 プロジェクト構造

```
GAMER-Nextjs-blog/
├── app/                  # Next.js App Router
│   ├── [locale]/         # 国際化ルート
│   │   └── (main)/       # メインページ
│   │       ├── blog/     # ブログページ
│   │       ├── projects/
│   │       ├── sparks/
│   │       └── ...
│   └── api/              # APIルート
├── components/           # Reactコンポーネント
│   ├── CharacterOverlay.tsx   # キャラクター操作コンポーネント
│   ├── AnimatedConstruction.tsx # 建築アニメーション
│   ├── GuessGame.tsx          # 推測ゲームコンポーネント
│   └── ...
├── data/                 # 静的データ
│   ├── blog/             # ブログ記事 (MDX)
│   ├── authors/          # 著者情報
│   └── projectsData.ts   # プロジェクトデータ
├── contexts/             # React Context
├── css/                  # スタイルシート
├── public/               # 静的アセット
└── supabase/             # Supabase Edge Functions
```

## 🌐 国際化

このプロジェクトでは `next-intl` を使用して多言語をサポートしています：

```typescript
// messages/ja.json
{
  "home": {
    "title": "私のブログへようこそ",
    "description": "ゲーム化されたパーソナルスペース"
  }
}
```

## 📝 ブログ執筆

カスタムスタイルについては、`style-test.mdx` を参照してください。

MDX形式でブログ記事を執筆します：

```mdx
---
title: '私の最初のブログ記事'
date: '2024-01-01'
tags: ['技術', '共有']
draft: false
summary: 'これはブログ記事の例です。'
---

# 私のブログへようこそ

ここでは**Markdown**構文やReactコンポーネントを使用できます！
```

## 🔧 デプロイ

### Vercelでのデプロイ

1.  このリポジトリをフォークします。
2.  Vercelでプロジェクトをインポートします。
3.  環境変数を設定します。
4.  デプロイ完了です。

## 🤝 コントリビューション

Issueやプルリクエストを歓迎します！

1.  リポジトリをフォークします。
2.  機能ブランチを作成します (`git checkout -b feature/AmazingFeature`)。
3.  変更をコミットします (`git commit -m 'Add some AmazingFeature'`)。
4.  ブランチにプッシュします (`git push origin feature/AmazingFeature`)。
5.  プルリクエストを開きます。

## 📄 ライセンス

このプロジェクトは [GNU GPL v3](https://choosealicense.com/licenses/gpl-3.0/) ライセンスの下で公開されています。

Gamerを使用する際、**ウェブサイトフッターの署名リンクを削除しないでください**。

## 🙏 謝辞

-   [Tailwind Nextjs Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) をベースに開発しました。
-   使用されているすべてのオープンソースプロジェクトの貢献者に感謝します。

## 📞 連絡先

-   ウェブサイト: [https://hiripple.com](https://hiripple.com)
-   GitHub: [@CelestialRipple](https://github.com/CelestialRipple)
-   メール: me@hiripple.com

---

⭐ このプロジェクトが役に立ったら、ぜひスターを付けてください！
