# Vitest + jsdom + Lefthook テスト環境構築プラン

## 概要

釣り船料金計算アプリケーションに包括的なテスト環境を構築します。**カバレッジ目標はC0/C1ともに100%必須**とし、pre-commitで全テスト実行、カバレッジ達成後にリファクタリングを検討する段階的アプローチを採用します。

## 重要な原則

本プランは以下の厳格な原則に基づきます：

1. **カバレッジ (C0, C1) を 100% にする** - 95%は妥協案ではなく最低限。可能な限り100%を目指す
2. **必要十分でメンテナブルなテストコードを書く** - 不足も過剰もNG
3. **振る舞いをテストする** - 特別な理由がない限り、内部実装ではなく振る舞いをテストする
4. **モック・スタブは原則禁止** - 外部APIが存在する場合のみ例外（現在は外部依存なし）
5. **実DOM・実データで結合テストをする** - jsdomで完全なDOM環境を構築してテストする
6. **すべての分岐をテストする** - if/else、switch/case、三項演算子、論理演算子すべて
7. **完全な値検証を行う** - 曖昧なmatcherは禁止
8. **変更のたびに必ずテストを実行する** - 例外なし

## プロジェクト現状

- **言語**: Vanilla JavaScript（ビルドツールなし）
- **主要ファイル**: 
  - `main.js` (986行): コア計算ロジック、DOM操作、イベントハンドリング
  - `plans-data.js` (131行): プランとレンタルデータ定義
  - `index.html`: UI構造
  - `styles.css`: スタイル定義
- **外部依存**: なし
- **グローバル変数**: `window.plans`, `window.commonRental`, `window.holidays`

## テスト対象とカバレッジに関する厳格なルール

### すべてのpublic関数を100%カバー

- **外部に公開されたすべての関数**は、正常系と異常系を分けて必ずテストする
- **論理分岐カバレッジ**：`if`、`else if`、`switch`、三項演算子、`&&`/`||` 等のすべての条件を**100%カバー必須**
  - C0 (statement coverage) カバレッジは**100%必須**
  - C1 (branch coverage) カバレッジも**100%必須**
- **private的な関数は直接テストしない** - public関数経由でカバーする設計にする

### 正常系と異常系（全分岐）のテスト

- **正常系**
  - 条件が満たされたときに、期待した結果（DOM更新、戻り値、状態変更など）が得られることを検証
- **異常系**
  - エラーや条件不足を引き起こす入力を与え、期待した例外や失敗が発生することを確認
  - 例外に加えて、副作用もテスト（例：「DOMが更新されない」「状態が変化しない」など）

### 複数レコード・ループ・条件分岐の徹底テスト

- **複数データが絡む処理**では、最低2〜3個のテストデータを用意してループの挙動を保証する
  - 例：`calculateTotal()`で複数の人数パターンをテスト
  - 例：レンタル選択で複数アイテムを選択した場合のテスト
- **1件のみのテストはNG** - 本番では複数データが前提なら、テストでも複数データで検証
- **すべての分岐を通す**
  - `if (men > 0)`なら、`men === 0`と`men > 0`の両方をテスト
  - `switch (plan)`なら、すべてのcase（default含む）をテスト
  - 三項演算子`a ? b : c`なら、aがtrueの場合とfalseの場合の両方をテスト

## 実装ステップ

### Step 1: テスト環境の初期セットアップ

#### 1.1 依存関係のインストール

```bash
npm init -y
npm install -D vitest @vitest/ui @vitest/coverage-v8 jsdom vite lefthook
```

#### 1.2 `package.json` の作成

```json
{
  "name": "boarding-fee-calculator",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "jsdom": "^23.0.0",
    "lefthook": "^1.5.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

#### 1.3 `vite.config.js` の作成

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['main.js', 'plans-data.js'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        'coverage/',
      ],
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  root: '.',
  publicDir: '.',
});
```

#### 1.4 テストディレクトリ構造の作成

```
/tests
  ├── setup.js                    # グローバルセットアップとモック
  ├── helpers/
  │   └── test-utils.js          # 共通テストユーティリティ
  ├── unit/
  │   ├── calculations.test.js   # calculateTotal関連テスト
  │   ├── date-utils.test.js     # getRateType、日付関数テスト
  │   └── pricing.test.js        # getShikakePrices、getTimesForPlanテスト
  └── integration/
      ├── dom-interactions.test.js    # DOM操作とイベントテスト
      ├── form-validation.test.js     # バリデーションテスト
      └── rental-selection.test.js    # レンタル選択とUI更新テスト
```

#### 1.5 `tests/setup.js` の作成

**重要**: モック/スタブは原則禁止。実データを使用する。

```javascript
import { beforeEach } from 'vitest';

// 実データをインポート（モックしない）
// plans-data.jsをESモジュール化する必要がある場合は、
// export { plans, commonRental }; を追加してインポート
// または、テスト環境でHTMLをロードしてwindow経由で取得

// 祝日データは実データまたはテスト用の実データを用意
const holidays = [
  '2026-01-01', // 元日
  '2026-01-12', // 成人の日
  '2026-02-11', // 建国記念の日
  '2026-02-23', // 天皇誕生日
  '2026-03-20', // 春分の日
  '2026-04-29', // 昭和の日
  '2026-05-03', // 憲法記念日
  '2026-05-04', // みどりの日
  '2026-05-05', // こどもの日
  '2026-05-06', // 振替休日
];

// Setup global window objects before each test
beforeEach(() => {
  // Reset DOM
  document.body.innerHTML = '';
  
  // plans-data.jsを動的にロード（実データを使用）
  // 方法1: plans-data.jsをESモジュール化してインポート
  // 方法2: scriptタグでロードしてwindow.plansを使用
  // 方法3: eval()で読み込み（非推奨だが動作確認用）
  
  // 祝日データをセット
  global.window.holidays = holidays;
  
  // Mock window.location.href (for mailto) - これは副作用のみなので例外的にモック
  delete window.location;
  window.location = { href: '' };
});
```

**実装方針**:
1. `plans-data.js`を以下のように変更してESモジュール化：
```javascript
// plans-data.js の末尾に追加
export { plans, commonRental };
```

2. `tests/setup.js`で実データをインポート：
```javascript
import { plans, commonRental } from '../plans-data.js';

beforeEach(() => {
  document.body.innerHTML = '';
  global.window.plans = plans;
  global.window.commonRental = commonRental;
  global.window.holidays = holidays;
  delete window.location;
  window.location = { href: '' };
});
```

これにより、モックではなく**実データ**でテストが実行される。

#### 1.6 `tests/helpers/test-utils.js` の作成

```javascript
/**
 * Setup minimal DOM structure for testing
 */
export function setupDOM() {
  document.body.innerHTML = `
    <select id="tripType">
      <option value="乗合船">乗合船</option>
      <option value="仕立て船">仕立て船</option>
    </select>
    <select id="planSelect"></select>
    <input type="date" id="date" value="2026-03-15" />
    <select id="menCount"></select>
    <select id="womenCount"></select>
    <select id="studentCount"></select>
    <div id="rentalList"></div>
    <div id="shikakeList"></div>
    <div id="breakdown"></div>
    <div id="fixedTotalAmount"></div>
    <div id="priceMen"></div>
    <div id="priceWomen"></div>
    <div id="priceStudent"></div>
    <div id="planTimes"></div>
    <div id="planSupplement"></div>
    <div id="dateWeekday"></div>
    <button id="mailtoBtn"></button>
    <button id="resetBtn"></button>
    
    <!-- Modal elements -->
    <div id="personalInfoModal" style="display:none;">
      <form id="personalInfoForm">
        <input type="text" id="visitorName" required />
        <input type="text" id="visitorKana" required />
        <input type="tel" id="visitorPhone" required />
        <button type="button" id="modalCloseBtn"></button>
        <button type="button" id="modalCancelBtn"></button>
        <button type="submit" id="modalSubmitBtn"></button>
      </form>
    </div>
    
    <div id="alertModal" style="display:none;">
      <div id="alertMessage"></div>
      <button id="alertOkBtn"></button>
    </div>
  `;
}

/**
 * Clean up DOM after test
 */
export function cleanupDOM() {
  document.body.innerHTML = '';
}

/**
 * Set form values programmatically and trigger events
 */
export function setFormValues(values) {
  if (values.tripType !== undefined) {
    const el = document.getElementById('tripType');
    el.value = values.tripType;
    el.dispatchEvent(new Event('change'));
  }
  if (values.date !== undefined) {
    const el = document.getElementById('date');
    el.value = values.date;
    el.dispatchEvent(new Event('change'));
  }
  if (values.men !== undefined) {
    const el = document.getElementById('menCount');
    el.value = values.men;
    el.dispatchEvent(new Event('change'));
  }
  if (values.women !== undefined) {
    const el = document.getElementById('womenCount');
    el.value = values.women;
    el.dispatchEvent(new Event('change'));
  }
  if (values.student !== undefined) {
    const el = document.getElementById('studentCount');
    el.value = values.student;
    el.dispatchEvent(new Event('change'));
  }
}

/**
 * Reset state object to initial values
 * 注: モックではなく、実際のstateオブジェクトを直接操作する
 */
export function resetState(stateObj) {
  stateObj.tripType = '乗合船';
  stateObj.plan = null;
  stateObj.date = null;
  stateObj.men = 0;
  stateObj.women = 0;
  stateObj.student = 0;
  stateObj.rentals = {};
  stateObj.shikake = {};
  stateObj.visitorName = '';
  stateObj.visitorKana = '';
  stateObj.visitorPhone = '';
}
```

### Step 2: モック/スタブ使用の厳格な制限

#### 2.1 実DOM・実データを使用したテストを強く推奨（原則）

- **DOM操作に関する処理**は、jsdomで実際のDOM環境を構築してテストする
- **モック/スタブは原則禁止** - 外部API（存在する場合）のみ例外
  - 現在は外部依存がないため、モック/スタブは一切使用しない
- **状態管理とDOM更新**は実際に発生させてテストする
  - 例：`calculateAndRender()`は実際にDOMを更新し、その結果を検証
  - 例：イベントリスナーは`dispatchEvent`で実際に発火させてテスト

#### 2.2 DOM・状態の変更結果を必ずテストする

- DOM要素を取得して返す処理なら、戻り値とDOMの状態を比較
- DOMを作成・更新する処理なら、その変更結果を実際に確認
- 状態オブジェクト（`state`）を更新する処理なら、更新後の値を検証
- **スタブで済ませない** - 実際にDOMや状態が変化するかを確認することで予期せぬ不具合を早期検出

#### 2.3 カバレッジ除外は最小限に

以下のコードのみ、カバレッジ除外を検討（ただし可能な限りテストすることを推奨）：

1. **初期化IIFE**（即時実行関数） - テスト困難な場合のみ除外
   - `setToday()` - DOM要素に依存する初期化
   - `init()` - アプリケーション起動処理

2. **副作用のみの処理** - テスト不可能な場合のみ除外
   - `window.location.href =` （メール起動）

除外する場合は`/* istanbul ignore next */`コメントを使用するが、**安易に除外せず、まずテスト方法を検討すること**。

#### 2.4 テストコードの構成とスタイル

##### describe / test / beforeEach の使い分け

- **`describe`**
  - テスト対象の関数や機能をまとめる単位（例：`describe('calculateTotal')`）
  - ネストして条件や状態の違いを表現（例：`describe('乗合船の場合')`）
- **`test`** または **`it`**
  - 単一のテストケースを定義
  - **1テスト1責務** - 1〜2個程度のアサーションに抑える
  - テスト名は仕様と期待結果が一目で分かる記述（例：`test('男性2名の場合、13600円を返す')`）
- **`beforeEach`**
  - テスト前の共通準備（DOM構築、状態初期化など）
  - 過度な依存関係を生まないよう注意

##### 完全な値検証を必須とする（曖昧なmatcherは禁止）

- **値を完全に検証しない曖昧なmatcherは禁止**
  - `toBeTruthy()`、`toBeDefined()`、`toContain()`など、型や存在のみを確認するmatcherは**禁止**
  - これらは十分な検証にならず、不具合やリグレッションの温床となる
- **代わりに完全な値検証matcherを使用**
  - **必須**：`toBe()`、`toEqual()`、`toStrictEqual()`など、値の完全一致を主張するmatcherを使用
  - オブジェクトや配列は完全な期待値を定義して比較

**Bad Example（禁止）**
```javascript
// 曖昧で不十分な検証
expect(result.total).toBeTruthy();
expect(result.breakdown).toBeDefined();
expect(result.breakdown.men).toBeGreaterThan(0);
```

**Good Example（必須）**
```javascript
// 完全な値検証
expect(result.total).toBe(13600);
expect(result.breakdown).toStrictEqual({
  men: 2,
  women: 0,
  student: 0,
  totalPeople: 2,
  minPeopleUsed: 0,
  minPriceUsed: 0,
  extraCount: 0,
  extraChargeAmount: 0,
  shortageCount: 0,
  extraBreakdown: { men: 0, women: 0, student: 0 }
});
```

##### コレクションに対する完全一致アサーション

- **常に完全な期待値で比較する**
  - DOM要素のリスト、計算結果の配列、状態オブジェクトなどが対象
  - 個別要素ごとのアサーションは**禁止**
  - 利点：`expect`を1回で意図が明確になり、保守も容易

**Bad Example（禁止）**
```javascript
// 冗長で全体像が不明瞭
expect(rentalList[0].name).toBe('竿（手巻き）');
expect(rentalList[0].price).toBe(1200);
expect(rentalList[1].name).toBe('竿（電動リール）');
expect(rentalList[1].price).toBe(2200);
```

**Good Example（必須）**
```javascript
// 完全な期待値で一括検証
const expectedRentals = [
  { name: '竿（手巻き）', price: 1200 },
  { name: '竿（電動リール）', price: 2200 }
];
expect(rentalList).toStrictEqual(expectedRentals);
```

#### 2.5 Unit Tests: `tests/unit/calculations.test.js`

```javascript
import { describe, test, expect, beforeEach } from 'vitest';
import { setupDOM, cleanupDOM } from '../helpers/test-utils.js';

describe('calculateTotal - 乗合船（Regular Boat）', () => {
  beforeEach(() => {
    setupDOM();
    // main.jsをロードまたは関数をインポート
  });

  test('男性2名の場合、正しい料金を計算する', () => {
    state.tripType = '乗合船';
    state.plan = '午前アジ';
    state.men = 2;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
    
    const result = calculateTotal();
    
    // 完全な値検証（曖昧なmatcherは使用しない）
    expect(result.total).toBe(13600); // 6800 * 2
    expect(result.subtotal).toBe(13600);
    expect(result.rentalTotal).toBe(0);
    expect(result.breakdown).toStrictEqual({
      men: 2,
      women: 0,
      student: 0,
      totalPeople: 2,
      minPeopleUsed: 0,
      minPriceUsed: 0,
      extraCount: 0,
      extraChargeAmount: 0,
      shortageCount: 0,
      extraBreakdown: { men: 0, women: 0, student: 0 }
    });
  });

  test('混合グループ（男性1名、女性1名、子供1名）の場合、正しい料金を計算する', () => {
    state.tripType = '乗合船';
    state.plan = '午前アジ';
    state.men = 1;
    state.women = 1;
    state.student = 1;
    state.rentals = {};
    
    const result = calculateTotal();
    
    expect(result.total).toBe(16100); // 6800 + 5500 + 3800
    expect(result.breakdown.totalPeople).toBe(3);
  });

  test('レンタルを含む料金計算（男性1名 + ビシセット1個）', () => {
    state.tripType = '乗合船';
    state.plan = '午前アジ';
    state.men = 1;
    state.women = 0;
    state.student = 0;
    state.rentals = { 'ビシセット': 1 };
    
    const result = calculateTotal();
    
    expect(result.total).toBe(9000); // 6800 + 2200
    expect(result.rentalTotal).toBe(2200);
  });

  test('人数ゼロの場合、0円を返す', () => {
    state.tripType = '乗合船';
    state.plan = '午前アジ';
    state.men = 0;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
    
    const result = calculateTotal();
    
    expect(result.total).toBe(0);
  });

  test('複数レンタル（竿2本、カッパ1着）の料金を正しく計算する', () => {
    state.tripType = '乗合船';
    state.plan = 'マダイ五目';
    state.men = 0;
    state.women = 0;
    state.student = 0;
    state.rentals = {
      '竿（手巻き）': 2,
      'カッパ長靴セット': 1
    };
    
    const result = calculateTotal();
    
    expect(result.total).toBe(3000); // 1200*2 + 600
    expect(result.rentalTotal).toBe(3000);
  });
});

describe('calculateTotal - 仕立て船（Charter Boat）', () => {
  test('8名以下（男性5名）の場合、最低料金が適用される', () => {
    state.tripType = '仕立て船';
    state.plan = '午前アジ';
    state.men = 5;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
    
    const result = calculateTotal();
    
    expect(result.total).toBe(54400); // 6800 * 8
    expect(result.breakdown.minPeopleUsed).toBe(8);
    expect(result.breakdown.minPriceUsed).toBe(54400);
    expect(result.breakdown.shortageCount).toBe(3);
  });

  test('8名を超える場合（男性10名）、追加料金が発生する', () => {
    state.tripType = '仕立て船';
    state.plan = '午前アジ';
    state.men = 10;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
    
    const result = calculateTotal();
    
    expect(result.total).toBe(68000); // 54400 + 6800*2
    expect(result.breakdown.extraCount).toBe(2);
    expect(result.breakdown.extraChargeAmount).toBe(13600);
  });

  test('追加人数の割り当て（男性5名、女性3名、子供2名）で子供から優先される', () => {
    state.tripType = '仕立て船';
    state.plan = '午前アジ';
    state.men = 5;
    state.women = 3;
    state.student = 2;
    state.rentals = {};
    
    const result = calculateTotal();
    
    expect(result.total).toBe(62000); // 54400 + 3800*2
    expect(result.breakdown.extraCount).toBe(2);
    expect(result.breakdown.extraBreakdown.student).toBe(2);
    expect(result.breakdown.extraBreakdown.women).toBe(0);
    expect(result.breakdown.extraBreakdown.men).toBe(0);
  });

  test('1名の場合でも最低料金が適用される', () => {
    state.tripType = '仕立て船';
    state.plan = '午前アジ';
    state.men = 1;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
    
    const result = calculateTotal();
    
    expect(result.total).toBe(54400);
    expect(result.breakdown.shortageCount).toBe(7);
  });

  test('レンタル込み（男性9名 + 竿2本）の料金計算', () => {
    state.tripType = '仕立て船';
    state.plan = '午前アジ';
    state.men = 9;
    state.women = 0;
    state.student = 0;
    state.rentals = { '竿（竿,リール）': 2 };
    
    const result = calculateTotal();
    
    expect(result.total).toBe(62200); // 54400 + 6800 + 600*2
    expect(result.rentalTotal).toBe(1200);
  });
});
```

#### 2.6 Unit Tests: `tests/unit/date-utils.test.js`

**注意**: 以下はテンプレート例です。実装時はコメントを外し、実際の関数をインポートしてテストを実行してください。

```javascript
import { describe, test, expect, beforeEach } from 'vitest';
// import { getRateType, parseISODate, toISODate, offsetISO, getWeekdayName, formatDateWithWeekday } from '../../main.js';

describe('getRateType', () => {
  beforeEach(() => {
    window.holidays = [
      '2026-05-03', // 日曜
      '2026-05-04', // 月曜（祝日）
      '2026-05-05', // 火曜（祝日）
      '2026-05-06', // 水曜（祝日）
      '2026-03-20', // 単独祝日
      '2026-04-24', // 金曜祝日
    ];
  });

  test('平日を正しく判定', () => {
    expect(getRateType('2026-03-10')).toBe('weekday'); // 火曜
  });

  test('土曜日を正しく判定', () => {
    expect(getRateType('2026-03-14')).toBe('saturday');
  });

  test('日曜日を正しく判定', () => {
    expect(getRateType('2026-03-15')).toBe('sunday');
  });

  test('単独祝日はsunday扱い', () => {
    expect(getRateType('2026-03-20')).toBe('sunday');
  });

  test('金曜祝日はsaturday扱い', () => {
    expect(getRateType('2026-04-24')).toBe('saturday');
  });

  test('連休の先頭日はsaturday扱い', () => {
    expect(getRateType('2026-05-04')).toBe('saturday'); // 連休先頭
  });

  test('連休の中日はsaturday扱い', () => {
    expect(getRateType('2026-05-05')).toBe('saturday'); // 中日
  });

  test('連休の最終日はsunday扱い', () => {
    expect(getRateType('2026-05-06')).toBe('sunday'); // 最終日
  });

  test('日曜の翌日が祝日の場合はsaturday扱い', () => {
    expect(getRateType('2026-05-03')).toBe('saturday'); // 日曜+翌日祝日
  });

  test('nullの場合はweekday', () => {
    expect(getRateType(null)).toBe('weekday');
  });

  test('不正な日付はweekday', () => {
    expect(getRateType('invalid')).toBe('weekday');
  });
});

describe('parseISODate, toISODate, offsetISO', () => {
  test('parseISODate: 正しくDateオブジェクトに変換', () => {
    const date = parseISODate('2026-03-15');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2); // 0-indexed
    expect(date.getDate()).toBe(15);
  });

  test('toISODate: Dateを文字列に変換', () => {
    const date = new Date(2026, 2, 15);
    expect(toISODate(date)).toBe('2026-03-15');
  });

  test('offsetISO: 日付を加算', () => {
    expect(offsetISO('2026-03-15', 1)).toBe('2026-03-16');
    expect(offsetISO('2026-03-15', -1)).toBe('2026-03-14');
  });
});

describe('getWeekdayName', () => {
  test('各曜日の名前を返す', () => {
    expect(getWeekdayName('2026-03-15')).toBe('日'); // Sunday
    expect(getWeekdayName('2026-03-16')).toBe('月'); // Monday
    expect(getWeekdayName('2026-03-17')).toBe('火'); // Tuesday
  });

  test('nullの場合は空文字列', () => {
    expect(getWeekdayName(null)).toBe('');
  });
});

describe('formatDateWithWeekday', () => {
  test('日付と曜日をフォーマット', () => {
    expect(formatDateWithWeekday('2026-03-15')).toBe('2026-03-15（日）');
  });

  test('nullの場合は「未選択」', () => {
    expect(formatDateWithWeekday(null)).toBe('未選択');
  });
});
```

#### 2.7 Unit Tests: `tests/unit/pricing.test.js`

**注意**: 以下は実装例です。実際の関数をインポートしてテストを実行してください。

```javascript
import { describe, test, expect } from 'vitest';
// import { getShikakePrices, getTimesForPlan } from '../../main.js';

describe('getShikakePrices', () => {
  test('マダイプラン', () => {
    const result = getShikakePrices('マダイ五目');
    // 完全な期待値で検証（toHavePropertyは使わない）
    expect(result).toStrictEqual({
      '仕掛け': { price: 550, note: '500〜600円' }
    });
  });

  test('ヤリスルメイカプラン', () => {
    const result = getShikakePrices('ヤリスルメイカ');
    // 完全な期待値で検証
    expect(result).toStrictEqual({
      'オモリ（150号）': { price: 600, note: '600円' },
      '仕掛け': { price: 1250, note: '1000〜1500円' }
    });
  });

  test('タチアジプラン', () => {
    const result = getShikakePrices('タチアジリレー');
    expect(result).toStrictEqual({
      '仕掛け': { price: 375, note: '250〜500円' }
    });
  });

  test('カワハギプラン', () => {
    const result = getShikakePrices('カワハギ');
    expect(result).toStrictEqual({
      '仕掛け': { price: 500, note: '400〜600円' }
    });
  });

  test('マゴチプラン', () => {
    const result = getShikakePrices('マゴチ');
    expect(result).toStrictEqual({
      '仕掛け': { price: 450, note: '450円程度' }
    });
  });

  test('午前・午後船', () => {
    const result = getShikakePrices('午前アジ');
    expect(result).toStrictEqual({
      '仕掛け': { price: 375, note: '250〜500円' }
    });
  });

  test('不明なプラン', () => {
    const result = getShikakePrices('UnknownPlan');
    expect(result).toStrictEqual({});
  });

  test('nullの場合', () => {
    const result = getShikakePrices(null);
    expect(result).toStrictEqual({});
  });
});

describe('getTimesForPlan', () => {
  test('午後プランの時間', () => {
    const result = getTimesForPlan('午後アジ');
    expect(result).toStrictEqual({ meet: '12:30', depart: '13:00' });
  });

  test('午前プランの時間', () => {
    const result = getTimesForPlan('午前アジ');
    expect(result).toStrictEqual({ meet: '06:30', depart: '07:00' });
  });

  test('午後を含まないプランの時間', () => {
    const result = getTimesForPlan('マダイ五目');
    expect(result).toStrictEqual({ meet: '06:30', depart: '07:00' });
  });

  test('nullの場合', () => {
    const result = getTimesForPlan(null);
    expect(result).toStrictEqual({ meet: '', depart: '' });
  });
});
```

#### 2.8 Integration Tests: `tests/integration/dom-interactions.test.js`

```javascript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { setupDOM, cleanupDOM } from '../helpers/test-utils.js';

describe('DOM Interactions', () => {
  beforeEach(() => {
    setupDOM();
    // Load main.js or initialize app
  });

  afterEach(() => {
    cleanupDOM();
  });

  test('プラン選択でレンタルオプションが更新される', () => {
    const planSelect = document.getElementById('planSelect');
    const rentalList = document.getElementById('rentalList');
    
    // プラン変更をシミュレート
    planSelect.value = 'マダイ五目';
    planSelect.dispatchEvent(new Event('change'));
    
    // レンタル一覧の子要素を取得して完全に検証（toContainは使わない）
    const rentalItems = Array.from(rentalList.querySelectorAll('.rental-item'));
    const rentalNames = rentalItems.map(item => item.querySelector('div').textContent.split('：')[0]);
    expect(rentalNames).toEqual(expect.arrayContaining(['竿（手巻き）', '竿（電動リール）']));
  });

  test('船種変更でプラン一覧が更新される', () => {
    const tripTypeSelect = document.getElementById('tripType');
    const planSelect = document.getElementById('planSelect');
    
    tripTypeSelect.value = '仕立て船';
    tripTypeSelect.dispatchEvent(new Event('change'));
    
    // 完全な期待値で検証（toBeGreaterThanは使わない）
    const planNames = Array.from(planSelect.options).map(opt => opt.value);
    // 仕立て船で表示されるべきプラン一覧（実データに基づく）
    expect(planNames.length).toBe(8); // 乗合船のプランがすべて表示される想定
    expect(planNames).toContain('午前アジ');
  });

  test('人数変更で金額が再計算される', () => {    
    const menSelect = document.getElementById('menCount');
    const breakdown = document.getElementById('breakdown');
    
    menSelect.value = '2';
    menSelect.dispatchEvent(new Event('change'));
    
    // 完全な期待値で検証（toContainは使わない）
    // breakdownの完全なHTMLまたはテキストコンテンツを検証
    expect(breakdown.textContent).toMatch(/13,600/);
    // より厳密には、stateやDOMの具体的な値を検証
    expect(state.men).toBe(2);
    const totalEl = document.getElementById('fixedTotalAmount');
    expect(totalEl.textContent).toBe('合計：13,600円');
  });
});
```

#### 2.9 Integration Tests: `tests/integration/form-validation.test.js`

**注意**: 以下は実装例です。実際のDOM環境とイベントハンドラーをセットアップしてテストを実行してください。

```javascript
import { describe, test, expect, beforeEach } from 'vitest';
import { setupDOM, cleanupDOM } from '../helpers/test-utils.js';

describe('Form Validation', () => {
  beforeEach(() => {
    setupDOM();
    // main.jsをロードしてイベントハンドラーを設定
  });

  test('人数ゼロの場合、メール送信をブロック', () => {
    const mailtoBtn = document.getElementById('mailtoBtn');
    const alertModal = document.getElementById('alertModal');
    const alertMessage = document.getElementById('alertMessage');
    
    // 人数0の状態でmailtoボタンをクリック
    state.men = 0;
    state.women = 0;
    state.student = 0;
    mailtoBtn.click();
    
    // アラートモーダルが表示され、適切なメッセージが表示される
    expect(alertModal.style.display).toBe('flex');
    expect(alertMessage.textContent).toBe('人数を1名以上選択してください');
  });

  test('過去の日付の場合、メール送信をブロック', () => {
    const mailtoBtn = document.getElementById('mailtoBtn');
    const alertModal = document.getElementById('alertModal');
    const alertMessage = document.getElementById('alertMessage');
    
    // 過去の日付を設定
    state.date = '2020-01-01';
    state.men = 1;
    mailtoBtn.click();
    
    // アラートモーダルが表示される
    expect(alertModal.style.display).toBe('flex');
    expect(alertMessage.textContent).toBe('未来の日付を選択してください');
  });

  test('正常な入力の場合、個人情報モーダルが表示される', () => {
    const mailtoBtn = document.getElementById('mailtoBtn');
    const personalInfoModal = document.getElementById('personalInfoModal');
    
    // 人数と未来の日付を設定
    state.date = '2026-12-31';
    state.men = 2;
    mailtoBtn.click();
    
    // 個人情報モーダルが表示される
    expect(personalInfoModal.style.display).toBe('flex');
  });
});
```

### Step 3: Lefthook導入とpre-commit統合

#### 3.1 Lefthook のインストールと設定

```bash
npx lefthook install
```

#### 3.2 `lefthook.yml` の作成

```yaml
pre-commit:
  parallel: false
  commands:
    tests:
      run: npm run test:run
      stage_fixed: true
      
pre-push:
  commands:
    coverage:
      run: npm run test:coverage
      stage_fixed: true
```

#### 3.3 `.vscode/settings.json` の作成（任意）

```json
{
  "vitest.enable": true,
  "vitest.commandLine": "npm test",
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
}
```

### Step 4: カバレッジ達成後の評価フェーズ

#### 4.1 リファクタリング判断基準

95%カバレッジ達成後、以下の観点で評価：

1. **新機能追加の難易度**
   - 現状のコード構造で新機能を追加できるか？
   - テストの追加は容易か？

2. **テストの保守コスト**
   - テストが壊れやすくないか？
   - モックやセットアップが複雑すぎないか？

3. **コードの可読性**
   - 関数が長すぎないか？（目安：50行以上）
   - 責務が明確に分離されているか？

#### 4.2 段階的リファクタリングの選択肢

必要と判断した場合のみ実施：

**Phase 1: 純粋関数の抽出**
```
src/
  ├── calculations.js    # calculateTotal, getRateType等
  ├── pricing.js         # getShikakePrices, getTimesForPlan
  └── date-utils.js      # parseISODate, toISODate, offsetISO
```

**Phase 2: DOM操作の分離**
```
src/
  ├── dom/
  │   ├── form-handlers.js
  │   ├── modal-handlers.js
  │   └── render.js
```

**Phase 3: 状態管理の分離**
```
src/
  ├── state.js
  └── store.js
```

## カバレッジ除外の詳細設定

### 方法1: コメントで個別除外

```javascript
// 例: 初期化IIFEを除外する場合
/* istanbul ignore next */
(function setToday() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  dateEl.value = yyyy + '-' + mm + '-' + dd;
  state.date = dateEl.value;
  updateDateWeekdayDisplay();
})();
```

### 方法2: vite.config.jsで除外

すでに`exclude`に以下を設定済み：
- `node_modules/`
- `tests/`
- `**/*.config.js`
- `coverage/`

追加で特定の行や関数を除外する場合は、コメント方式を推奨。

## テスト実行とトラブルシューティング

### 必須のテスト実行プロトコル

- **変更のたびにテストを実行すること（例外なし）**
  - **テストファイルを変更したら、必ず自分でテストを実行する**
  - **実装ファイル（main.js等）を変更したら、必ず関連テストを実行する**
  - コマンド：`npm run test:run <path_to_spec>`
  - 例：`npm run test:run tests/unit/calculations.test.js`

### テスト結果の取り扱い

- **テスト失敗時**
  1. 直ちにエラー出力を分析する
  2. 次の観点で体系的に対処する：
     - 構文：コード構造を修正
     - 期待：テストロジックを修正
     - セットアップ：データ/環境問題を解消
  3. **すべてのテストに合格するまで先へ進まない**
- **テスト成功時**
  - カバレッジを確認し、100%に達していることを確認
  - 未カバーの分岐があれば追加テストを書く

### 必須プラクティス

- **ファイル構成**
  - 慣習に従う：
    - `tests/unit/xxx.test.js` - 純粋関数のテスト
    - `tests/integration/xxx.test.js` - DOM操作・統合テスト
- **解決の道筋**
  - ドキュメントを確認
  - 類似テストを参照
  - 必要に応じて助けを求める

## 実行コマンド一覧

```bash
# 依存関係インストール
npm install

# テストをwatch modeで実行（開発時推奨）
npm test

# テストを一度だけ実行して終了（watchモード回避）
npm run test:run

# 特定のテストファイルのみ実行して終了（watchモード回避）
npm run test:run tests/unit/calculations.test.js

# UI付きでテスト実行
npm run test:ui

# カバレッジレポート生成（必須）
npm run test:coverage

# Lefthookインストール
npx lefthook install

# Lefthook実行（手動テスト用）
npx lefthook run pre-commit
npx lefthook run pre-push
```

## カバレッジレポートの確認

```bash
# カバレッジ実行後、HTMLレポートを開く
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

## 注意事項

1. **main.jsからの関数export**
   - 現在、main.jsは即時実行されるスクリプトのため、関数を直接importできません
   - テストを実装する際は、main.jsの末尾に以下を追加することを検討：

```javascript
// Export for testing (only in test environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateTotal,
    getRateType,
    getShikakePrices,
    getTimesForPlan,
    parseISODate,
    toISODate,
    offsetISO,
    isHolidayISO,
    getWeekdayName,
    formatDateWithWeekday,
    state
  };
}
```

2. **DOM依存の関数**
   - `populateCountSelects`, `updatePlanOptions`, `renderShikakeOptions`, `renderRentalOptions`等は、jsdomでDOM環境を構築してからテストする必要があります

3. **イベントリスナー**
   - イベントリスナーのテストは、`dispatchEvent`を使って手動でイベントを発火させます

## 補足：Tips

### DOM要素やオブジェクトのモックは避ける

- **DOM要素に対するモックは困難。代わりに実DOMをテストせよ**
  - jsdomで実際のDOM環境を構築し、`document.getElementById`等で実要素を取得してテスト
  - スタブで済ませると、実際のDOM構造との不整合を見逃す危険がある
  - 原則：DOM操作の結果（要素の追加、削除、属性変更）を実際に検証すること

### 複数のDOM要素・状態の変更を一括検証

- 1つの操作で複数のDOM要素や状態が更新される場合、すべてをテストする
  - 例：`calculateAndRender()`は`breakdown`、`fixedTotalAmount`、`state`を更新
  - すべての副作用を検証し、意図しない変更がないことを確認

### 時間依存のテストは時刻を固定

- `vi.setSystemTime(new Date('2026-03-15'))`で現在時刻を固定
- 日付計算のテストでは、固定日付から相対的にテストデータを作成

### 予測不能な値の取り扱い（例外的）

- **基本方針**：IDやタイムスタンプも予測可能にする
  - 例：テストデータでIDを指定、`vi.setSystemTime`でタイムスタンプ固定
- **真に予測不能な場合のみ**、以下の厳格な条件下で例外を許可：
  1. 値を厳密に予測することが本当に困難
  2. 予測可能にする合理的手段が存在しない
  3. その値がテストの目的に対して本質ではない

```javascript
// 例外的ケース：UUID等の予測不能な値
const expected = {
  id: expect.any(String), // UUIDなど
  name: '田中太郎',
  createdAt: expect.any(Date)
};
expect(result).toEqual(expected);
```

## ベストプラクティス

### 1テスト1責務

- 各`test`ブロックに1つの関心事を持たせる
- 複数のアサーションがある場合、それらが1つの責務を検証するか確認
- 複数の責務がある場合はテストを分割

### 分かりやすいテスト名

- `test('男性2名の場合、13600円を返す')`のように、条件と期待結果を明記
- 「正常系」「異常系」だけでは不十分 - 具体的な条件を書く

### DRY原則とバランス

- 繰り返し処理は`beforeEach`や`let`で共通化
- ただし抽象化のし過ぎは可読性を損なう
- テストケースごとに必要なデータは、そのテスト内で明示的に定義することも検討

### 異常系テストの徹底

- エラーが発生する条件をすべてテスト
- 例外だけでなく、副作用（DOMが更新されない等）も検証
- エッジケース（0、負数、null、undefined、空文字列等）を網羅

### カバレッジレポートの活用

- `npm run test:coverage`実行後、`coverage/index.html`を開く
- 未カバーの行・分岐を視覚的に確認
- **100%達成まで追加テストを書く**

## 今後の検討事項

1. **カバレッジ除外の最終判断**
   - 上記の除外候補は最小限に抑える
   - 可能な限りテストを書くことを優先

2. **テスト実行時間の監視**
   - pre-commitでの全テスト実行が遅くなった場合（5秒超）、対策を検討
   - `--pool=threads`での並列実行
   - watch modeの活用

3. **HTMLカバレッジレポートの活用**
   - 定期的に`coverage/index.html`を確認
   - 未カバー箇所を視覚的に把握し、即座に追加テストを書く

4. **CI/CDパイプライン統合**
   - GitHub ActionsやGitLab CIでの自動実行
   - プルリクエスト時のカバレッジレポート生成
   - カバレッジが100%未満の場合はマージブロック

## 参考リンク

- [Vitest Documentation](https://vitest.dev/)
- [jsdom Documentation](https://github.com/jsdom/jsdom)
- [Lefthook Documentation](https://github.com/evilmartians/lefthook)
- [Istanbul (Coverage) Documentation](https://istanbul.js.org/)

---

これらの厳格な原則を徹底することで、高品質で保守性の高いテストコードを構築できます。
