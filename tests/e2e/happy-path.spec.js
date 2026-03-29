import { test, expect } from '@playwright/test';

test.describe('乗合船 ハッピーパス', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // プランが読み込まれるまで待つ
    await expect(page.locator('#planSelect')).not.toHaveValue('');
  });

  test('初期表示: 乗合船が選択されプランが表示される', async ({ page }) => {
    await expect(page.locator('#tripType')).toHaveValue('乗合船');
    const options = page.locator('#planSelect option');
    await expect(options).not.toHaveCount(0);
  });

  test('午前アジ: 男性2名で料金が正しく計算される', async ({ page }) => {
    await page.selectOption('#planSelect', '午前アジ');
    await page.selectOption('#menCount', '2');

    // 単価表示を確認
    await expect(page.locator('#priceMen')).toContainText('6,800');

    // 合計金額を確認（6800 × 2 = 13,600）
    await expect(page.locator('#fixedTotalAmount')).toContainText('13,600');
  });

  test('午前アジ: 男性2名+女性1名+学生1名で料金が正しく計算される', async ({ page }) => {
    await page.selectOption('#planSelect', '午前アジ');
    await page.selectOption('#menCount', '2');
    await page.selectOption('#womenCount', '1');
    await page.selectOption('#studentCount', '1');

    // 合計金額を確認（6800×2 + 5500×1 + 3800×1 = 22,900）
    await expect(page.locator('#fixedTotalAmount')).toContainText('22,900');
  });

  test('レンタル品を選択すると料金に加算される', async ({ page }) => {
    await page.selectOption('#planSelect', '午前アジ');
    await page.selectOption('#menCount', '1');

    // レンタル前の金額を確認
    await expect(page.locator('#fixedTotalAmount')).toContainText('6,800');

    // 竿レンタルの数量を1に変更
    const rodRentalRow = page.locator('.rental-item', { hasText: '竿' });
    await rodRentalRow.locator('select').selectOption('1');

    // 合計にレンタル料が加算される（6800 + 600 = 7,400）
    await expect(page.locator('#fixedTotalAmount')).toContainText('7,400');
  });

  test('リセットボタンで全入力がクリアされる', async ({ page }) => {
    await page.selectOption('#planSelect', '午前アジ');
    await page.selectOption('#menCount', '3');
    await expect(page.locator('#fixedTotalAmount')).not.toContainText('—');

    await page.click('#resetBtn');

    await expect(page.locator('#menCount')).toHaveValue('0');
    await expect(page.locator('#womenCount')).toHaveValue('0');
    await expect(page.locator('#studentCount')).toHaveValue('0');
  });
});

test.describe('仕立て船 ハッピーパス', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#planSelect')).not.toHaveValue('');
    await page.selectOption('#tripType', '仕立て船');
    // プラン切り替えを待つ
    await expect(page.locator('#planSelect')).not.toHaveValue('');
  });

  test('仕立て船に切り替えるとプランが更新される', async ({ page }) => {
    await expect(page.locator('#tripType')).toHaveValue('仕立て船');
    const options = page.locator('#planSelect option');
    await expect(options).not.toHaveCount(0);
  });

  test('仕立て船: 最低人数未満でも最低料金が適用される', async ({ page }) => {
    await page.selectOption('#planSelect', '午前アジ');
    // 平日を選択（最低8名 / 最低金額 54,400円）
    const dateInput = page.locator('#date');
    // 2026年の平日を設定（2026-04-06 = 月曜日）
    await dateInput.fill('2026-04-06');

    // 男性1名（最低人数8名未満）
    await page.selectOption('#menCount', '1');

    // 最低料金が適用される（54,400円）
    await expect(page.locator('#fixedTotalAmount')).toContainText('54,400');
  });

  test('仕立て船: 最低人数以上なら人数×単価で計算される', async ({ page }) => {
    await page.selectOption('#planSelect', '午前アジ');
    const dateInput = page.locator('#date');
    await dateInput.fill('2026-04-06');

    // 男性10名（最低人数8名以上）
    await page.selectOption('#menCount', '10');

    // 人数×単価（6800×10 = 68,000）
    await expect(page.locator('#fixedTotalAmount')).toContainText('68,000');
  });
});

test.describe('予約フロー（メール作成まで）', () => {
  test('プラン選択→人数入力→予約→個人情報入力→メール作成までの一連の操作', async ({ browser }) => {
    // 新しいコンテキストでページロード前にlocation.hrefフックを仕込む
    const context = await browser.newContext();
    await context.addInitScript(() => {
      window.__capturedMailto = null;
      // Navigation API: beforenavigate でmailto:をキャプチャ・ブロック
      if (typeof navigation !== 'undefined') {
        navigation.addEventListener('navigate', (e) => {
          if (e.destination.url.startsWith('mailto:')) {
            window.__capturedMailto = e.destination.url;
            e.preventDefault();
          }
        });
      }
    });

    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('#planSelect')).not.toHaveValue('');

    // 1. プラン選択・人数入力
    await page.selectOption('#planSelect', '午前アジ');
    await page.selectOption('#menCount', '2');
    await page.selectOption('#womenCount', '1');
    await expect(page.locator('#fixedTotalAmount')).toContainText('19,100');

    // 2. 予約へ進むボタン
    await page.click('#mailtoBtn');
    await expect(page.locator('#personalInfoModal')).toBeVisible();

    // 3. 個人情報を入力
    await page.fill('#visitorName', 'テスト太郎');
    await page.fill('#visitorKana', 'テストタロウ');
    await page.fill('#visitorPhone', '090-1234-5678');

    // 4. 予約メールを作成ボタンをクリック
    await page.click('#modalSubmitBtn');

    // 5. mailto URL が正しく生成されたことを検証
    const mailtoUrl = await page.evaluate(() => window.__capturedMailto);
    expect(mailtoUrl).not.toBeNull();
    expect(mailtoUrl).toContain('mailto:ichinosemaru1@docomo.ne.jp');
    expect(mailtoUrl).toContain(encodeURIComponent('釣り船予約依頼'));
    expect(mailtoUrl).toContain(encodeURIComponent('テスト太郎'));
    expect(mailtoUrl).toContain(encodeURIComponent('テストタロウ'));
    expect(mailtoUrl).toContain(encodeURIComponent('090-1234-5678'));
    expect(mailtoUrl).toContain(encodeURIComponent('午前アジ'));

    // モーダルが閉じていることを確認
    await expect(page.locator('#personalInfoModal')).not.toBeVisible();

    await context.close();
  });
});

test.describe('予約バリデーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#planSelect')).not.toHaveValue('');
  });

  test('人数0名で予約ボタンを押すとアラートが表示される', async ({ page }) => {
    await page.selectOption('#planSelect', '午前アジ');
    await page.click('#mailtoBtn');

    await expect(page.locator('#alertModal')).toBeVisible();
  });

  test('人数を入力して予約ボタンを押すと個人情報モーダルが表示される', async ({ page }) => {
    await page.selectOption('#planSelect', '午前アジ');
    await page.selectOption('#menCount', '1');
    await page.click('#mailtoBtn');

    await expect(page.locator('#personalInfoModal')).toBeVisible();
    await expect(page.locator('#visitorName')).toBeVisible();
    await expect(page.locator('#visitorKana')).toBeVisible();
    await expect(page.locator('#visitorPhone')).toBeVisible();
  });
});
