# CLAUDE.md

## プロジェクト概要

金沢八景 一之瀬丸の釣り船料金計算ツール。乗合船・仕立て船の料金、レンタル品を含めた総額を自動計算するWebアプリ。
GitHub Pages でホスティング（https://www.ichinosemaru.com/）。

## 技術スタック

- HTML / CSS / Vanilla JS（フレームワークなし）
- Vite（開発サーバー・ビルド）
- Vitest + jsdom（テスト）
- Lefthook（pre-commit でテスト自動実行、pre-push でカバレッジチェック）
- GA4（本番のみ）

## よく使うコマンド

- `npm run dev` — 開発サーバー起動（http://localhost:5173/boarding_fee_-calculater/）
- `npm run test:run` — テスト実行
- `npm run test:coverage` — カバレッジ付きテスト

## ファイル構成

- `plans-data.js` — 全プランの料金・レンタル・チャーター情報（**料金変更はここ**）
- `main.js` — メインロジック（計算・レンダリング・状態管理）
- `index.html` / `styles.css` — UI
- `ga4-tracking.js` — GA4イベントトラッキング
- `tests/unit/` — ユニットテスト
- `tests/integration/` — 統合テスト

## 料金変更時の注意事項

### plans-data.js の構造

各プランは以下のフィールドを持つ:
- `basePrice` — `{ men, women, student }` 乗船料（1人あたり）
- `charter` — `{ weekday, holiday, sunday }` 各に `{ minPeople, minPrice }`。minPrice は通常 men × minPeople
- `rental` — レンタル品。単純な数値（`"竿（手巻き）": 1200`）または返金付き（`"ビシセット": { "price": 2200, "refund": 2000 }`）
- `note` — 付帯情報（餌・氷など）
- `visibleShared` — 乗合船メニューに表示するか
- `visibleCharter` — 仕立て船メニューに表示するか

### 料金変更時のチェックリスト

料金変更は漏れが起きやすい。以下を毎回確認すること:

1. **basePrice を変更したら charter の minPrice も必ず更新する**
   - minPrice = men の料金 × minPeople で計算
   - weekday / holiday / sunday すべて確認
   - 忘れると乗合と仕立てで料金の整合性が崩れる
2. **表示フラグ（visibleShared / visibleCharter）を個別に確認する**
   - 乗合だけ非表示にして仕立ては残す、またはその逆のケースがある
   - 「削除」ではなく必ずフラグで制御する。プランデータ自体は消さない
3. **レンタル品の変更は同じレンタル品を持つ他プランも確認する**
   - 例: 電動リールは複数プランにまたがる。1つだけ変更すると不整合になる
4. **テストにハードコードされた期待値がある** — 料金変更したらテストも更新が必要
   - `tests/unit/calculations.test.js` — 計算ロジック（特にマダイ五目・午前アジ）
   - `tests/integration/calculate-and-render.test.js` — レンダリング結果（午前アジ）
5. コミット時に Lefthook が自動でテスト実行 — テストが通らないとコミットできない

## ブランチ運用

- main ブランチから新しいブランチを切って作業し、PRを作成してマージする
- ブランチ名は自由（内容がわかれば OK）
- コミットメッセージは日本語で丁寧に書く
- 変更は小さい単位でこまめにコミットする（作業量の把握・請求に使うため）
- main に直接コミットしない

## 祝日データ

`plans-data.js` の `holidays` 配列に祝日を `YYYY-MM-DD` 形式で管理。料金タイプ判定（平日/土曜・連休中日/日曜・連休最終日）に使用される。年が変わったら更新が必要。
