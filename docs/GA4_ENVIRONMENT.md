# GA4 環境分離の動作確認

## ✅ 実装内容

ローカル開発環境では本番GA4にデータを送信しないように保護されています。

### 環境判定ロジック

```javascript
const isProduction = window.location.hostname !== 'localhost' && 
                     !window.location.hostname.match(/127\.0\.0\.1/);
```

## 🔧 開発環境（localhost）での動作

### 開発サーバー起動

```bash
npm run dev
# → http://localhost:5173/boarding_fee_-calculater/
```

### GA4の動作

- GA4スクリプトは**読み込まれません**
- `window.gtag`はモック関数に置き換えられます
- コンソールに以下のように表示されます：

```
🔧 Development mode: GA4 disabled
📊 [GA4 Mock] event form_start {...}
📊 [GA4 Mock] event form_submit {...}
```

### データ送信

❌ **本番GA4には一切データが送信されません**

## 🚀 本番環境（GitHub Pages）での動作

### 本番URL

```
https://[ユーザー名].github.io/boarding_fee_-calculater/
```

### GA4の動作

- GA4スクリプトが正常に読み込まれます
- 実際のイベントトラッキングが動作します
- GA4ダッシュボードにデータが表示されます

### データ送信

✅ **本番GA4にイベントデータが正常に送信されます**

## 📊 動作確認方法

### 1. ローカル開発環境

```bash
npm run dev
# ブラウザの開発者ツール（Console）を開く
```

**確認ポイント：**
- コンソールに `🔧 Development mode: GA4 disabled` が表示される
- `📊 [GA4 Mock]` でイベントログが表示される
- Networkタブに `gtag/js` リクエストが**ない**

### 2. ビルド後のプレビュー

```bash
npm run build
npm run preview
# → http://localhost:4173/boarding_fee_-calculater/
```

**確認ポイント：**
- localhostなので、開発モードと同じ動作
- GA4スクリプトは読み込まれない

### 3. 本番環境（GitHub Pages）

デプロイ後、実際のURLにアクセス

**確認ポイント：**
- コンソールに開発モードのログが**ない**
- Networkタブに `gtag/js` リクエストが**ある**
- GA4ダッシュボードでイベントが確認できる

## 🛡️ 保護される理由

### ホスト名による判定

| 環境 | ホスト名 | GA4 |
|------|---------|-----|
| npm run dev | localhost:5173 | ❌ 無効 |
| npm run preview | localhost:4173 | ❌ 無効 |
| GitHub Pages | [username].github.io | ✅ 有効 |
| カスタムドメイン | ichinosemaru.jp | ✅ 有効 |

### 二重保護

1. **index.html**: ホスト名チェック → 本番以外ではGA4スクリプトを読み込まない
2. **ga4-tracking.js**: 各イベント送信前にも再チェック → 念のための保護

## 🧪 テスト環境

テスト環境では、本番環境をシミュレート：

```javascript
// tests/setup.js
global.window.location = {
  hostname: 'ichinosemaru.jp', // 本番ホスト名をシミュレート
};
```

これにより、テストコードでGA4の動作を検証できます。

## 📝 注意事項

### カスタムドメインを使用する場合

カスタムドメイン（例: `www.ichinosemaru.jp`）を使用する場合は、そのままで動作します（localhostではないため）。

### 新しい開発環境を追加する場合

`ga4-tracking.js`の`isProduction()`関数を更新：

```javascript
function isProduction() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  // 追加の開発環境があればここに追加
  const devHosts = ['localhost', '127.0.0.1', 'dev.example.com'];
  return !devHosts.some(host => hostname.includes(host));
}
```

## ✅ まとめ

✅ ローカル開発環境では本番GA4にデータを送信しない  
✅ コンソールログで動作を確認できる  
✅ テストコードは本番動作をシミュレート  
✅ GitHub Pagesでは正常にGA4が動作  
