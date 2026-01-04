# テストガイド

このディレクトリには、乗船料金計算アプリのテストが含まれています。

## セットアップ

### 依存パッケージのインストール

プロジェクトルートで以下を実行:
```bash
npm install
```

### Git Hooksの設定（任意）

自動テスト実行を有効にする場合:
```bash
npx lefthook install
```

これにより:
- **pre-commit**: コミット時に自動的にテストが実行されます
- **pre-push**: プッシュ時に自動的にカバレッジチェックが実行されます

フックを一時的に無効化する場合:
```bash
git commit --no-verify
git push --no-verify
```

## テストの実行

### 基本コマンド

```bash
# 1回だけテスト実行（推奨）
npm run test:run

# ウォッチモードでテスト実行（開発時に変更を監視したい場合）
npm test

# UIでテスト実行（ブラウザで結果を確認）
npm run test:ui

# カバレッジ付きでテスト実行
npm run test:coverage
```

### カバレッジレポート

カバレッジを実行すると、`coverage/` ディレクトリにHTMLレポートが生成されます:
```bash
npm run test:coverage
open coverage/index.html
```

## テストの構成

```
tests/
├── README.md                    # このファイル
├── setup.js                     # グローバルテストセットアップ
├── helpers/
│   └── test-utils.js            # テストユーティリティ関数
├── unit/                        # ユニットテスト
│   ├── calculations.test.js     # 料金計算テスト（18テスト）
│   ├── date-utils.test.js       # 日付ユーティリティテスト（47テスト）
│   └── pricing.test.js          # 価格取得テスト（26テスト）
└── integration/                 # 統合テスト（未実装）
    ├── dom-interactions.test.js # DOM操作テスト（予定）
    ├── form-validation.test.js  # フォームバリデーションテスト（予定）
    └── rendering.test.js        # レンダリングテスト（予定）
```

## テスト状況

### 現在の状態

- ✅ **91個のテスト** - すべて合格
- **カバレッジ**:
  - Statements: 44.36% / 100%
  - Branches: 80.39% / 100%
  - Functions: 34.48% / 100%
  - Lines: 44.36% / 100%

### テスト済みの機能

#### ✅ ユニットテスト（完全カバー）

**料金計算** (18テスト)
- 乗合船の料金計算（人数ゼロ、単一属性、混合グループ）
- 仕立て船の料金計算（最低料金、追加料金、優先順位割り当て）
- レンタル品の料金計算（単一、複数、ゼロ、負の値）

**日付ユーティリティ** (47テスト)
- 日付パース・変換（parseISODate, toISODate, offsetISO）
- 料金タイプ判定（平日、土曜、日曜、祝日、連休）
- 曜日名取得・フォーマット

**価格取得** (26テスト)
- 仕掛け価格取得（マダイ、ヤリスルメイカ、タチアジ、カワハギ、マゴチなど）
- 集合・出船時刻取得（午前、午後）

#### ⏳ 統合テスト（未実装）

以下のDOM操作関数のテストが必要:
- DOM更新関数（updatePlanOptions, renderShikakeOptions など）
- イベントハンドラー
- バリデーション（過去日付チェック、人数チェック）
- フォーム送信（mailto生成）

## テスト原則

このプロジェクトでは、以下の原則に従ってテストを実装しています:

### 1. モック・スタブを使用しない
- 実データ（`plans-data.js`）を使用
- 外部APIのみモック可能（例: `window.location.href` for mailto）

### 2. 実DOMでテスト
- jsdom環境を使用
- 実際のDOM操作をテスト

### 3. 完全な値アサーション
- `toBeTruthy()`, `toContain()`, `toBeGreaterThan()` を使用しない
- 常に具体的な値で検証（`toBe(6800)`, `toStrictEqual({ ... })`）

### 4. 100%ブランチカバレッジを目指す
- すべての if/else 分岐をテスト
- すべての switch case をテスト
- すべての三項演算子をテスト
- すべての論理演算子（&&, ||）をテスト

### 5. 複数のデータレコードでテスト
- 1件だけでなく複数のパターンをテスト
- エッジケース（ゼロ、負の値、null、undefined）を含む

### 6. テストの独立性
- 各テストで `beforeEach` を使用して状態をリセット
- テスト間の依存関係を排除

## テストの書き方

### ユニットテストの例

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateTotal, state } from '../../main.js';

describe('calculateTotal', () => {
  beforeEach(() => {
    // 各テスト前に状態をリセット
    state.tripType = '乗合船';
    state.plan = '午前アジ';
    state.men = 0;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
  });

  it('calculates zero total when no people', () => {
    const result = calculateTotal();
    
    // ❌ 曖昧なマッチャー
    // expect(result.total).toBeTruthy();
    
    // ✅ 完全な値アサーション
    expect(result.total).toBe(0);
    expect(result.subtotal).toBe(0);
    expect(result.rentalTotal).toBe(0);
  });
});
```

### 統合テストの例（予定）

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { setupDOM, cleanupDOM } from '../helpers/test-utils.js';

describe('Plan selection', () => {
  beforeEach(() => {
    setupDOM();
  });

  it('updates rental options when plan changes', () => {
    const planSelect = document.getElementById('planSelect');
    planSelect.value = 'マダイ五目';
    planSelect.dispatchEvent(new Event('change'));
    
    const rentalItems = document.querySelectorAll('.rental-item');
    expect(rentalItems.length).toBeGreaterThan(0);
    // 具体的なレンタル品目を検証
  });
});
```

## トラブルシューティング

### テストが失敗する

```bash
# キャッシュをクリアして再実行
npm run test:run -- --clearCache
```

### カバレッジが表示されない

```bash
# coverage ディレクトリを削除して再実行
rm -rf coverage
npm run test:coverage
```

### テストが遅い

```bash
# 並列実行を無効化（デバッグ用）
npm run test:run -- --no-threads
```

## 関連ドキュメント

- [TESTING_PLAN.md](../TESTING_PLAN.md) - 詳細なテスト計画書
- [TEST_IMPLEMENTATION_SUMMARY.md](../TEST_IMPLEMENTATION_SUMMARY.md) - テスト実装サマリー
- [Vitest公式ドキュメント](https://vitest.dev/)
- [jsdom公式ドキュメント](https://github.com/jsdom/jsdom)

## 次のステップ

1. **統合テストの実装** - DOM操作関数のテストを追加
2. **カバレッジ100%達成** - 未カバーの関数をテスト
3. **E2Eテストの検討** - Playwright等を使用した実ブラウザテスト
