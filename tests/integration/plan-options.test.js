import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { plans, commonRental } from '../../plans-data.js';
import {
  state,
  updatePlanOptions,
  setDOMElements
} from '../../main.js';

/**
 * updatePlanOptions() の統合テスト
 * 
 * テスト対象:
 * - プランセレクトボックスの初期化
 * - plans オブジェクトからプラン取得とオプション生成
 * - state.plan の初期値設定
 * - 依存関数の呼び出し
 * 
 * カバレッジ目標: C0/C1 100%
 */

describe('updatePlanOptions', () => {
  let planSelectEl;

  beforeEach(() => {
    // DOM構築
    document.body.innerHTML = `
      <select id="planSelect"></select>
      <div id="priceMen"></div>
      <div id="priceWomen"></div>
      <div id="priceStudent"></div>
      <div id="planTimes"></div>
      <div id="planSupplement"></div>
      <div id="shikakeList"></div>
      <div id="rentalList"></div>
      <div id="breakdown"></div>
      <div id="fixedTotalAmount"></div>
    `;

    planSelectEl = document.getElementById('planSelect');

    // グローバルに実データを設定
    global.window = global.window || {};
    global.window.plans = plans;
    global.window.commonRental = commonRental;

    // main.jsのDOM参照を更新（テスト環境で必要）
    setDOMElements({
      planSelectEl: planSelectEl,
      priceMenEl: document.getElementById('priceMen'),
      priceWomenEl: document.getElementById('priceWomen'),
      priceStudentEl: document.getElementById('priceStudent'),
      planTimesEl: document.getElementById('planTimes'),
      shikakeListEl: document.getElementById('shikakeList'),
      rentalListEl: document.getElementById('rentalList'),
      breakdownEl: document.getElementById('breakdown'),
      fixedTotalAmountEl: document.getElementById('fixedTotalAmount')
    });

    // stateを初期化
    state.tripType = '乗合船';
    state.plan = null;
    state.date = null;
    state.men = 0;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
    state.shikake = {};
  });

  afterEach(() => {
    document.body.innerHTML = '';
    // 実データに復元
    global.window.plans = plans;
  });

  // ========================================
  // 正常系テスト
  // ========================================

  test('乗合船の場合、visibleShared=trueのプランのみが表示される', () => {
    state.tripType = '乗合船';
    updatePlanOptions();
    
    const actualOptions = Array.from(planSelectEl.options);
    const visibleSharedPlans = Object.keys(plans).filter(name => plans[name].visibleShared === true);
    
    expect(actualOptions.length).toBe(visibleSharedPlans.length);
    
    actualOptions.forEach((opt) => {
      expect(plans[opt.value]).toBeDefined();
      expect(plans[opt.value].visibleShared).toBe(true);
      expect(opt.value).toBe(opt.textContent);
    });
  });

  test('state.plan が表示される最初のプラン名に設定される', () => {
    state.tripType = '乗合船';
    expect(state.plan).toBeNull();
    
    updatePlanOptions();
    
    const visiblePlans = Object.keys(plans).filter(name => plans[name].visibleShared === true);
    expect(state.plan).toBe(visiblePlans[0]);
    expect(state.plan).toBe(planSelectEl.value);
  });

  test('既存のオプションがクリアされて新しいプランのみが表示される', () => {
    // 既存のダミーオプションを追加
    const dummyOption = document.createElement('option');
    dummyOption.value = 'ダミープラン';
    dummyOption.textContent = 'ダミープラン';
    planSelectEl.appendChild(dummyOption);
    
    expect(planSelectEl.options.length).toBe(1);
    
    state.tripType = '乗合船';
    updatePlanOptions();
    
    // ダミーオプションは削除され、visibleShared=trueのプランのみになる
    const optionValues = Array.from(planSelectEl.options).map(opt => opt.value);
    const visibleSharedPlans = Object.keys(plans).filter(name => plans[name].visibleShared === true);
    expect(optionValues).not.toContain('ダミープラン');
    expect(optionValues).toStrictEqual(visibleSharedPlans);
  });

  test('仕立て船の場合、visibleCharter=trueのプランのみが表示される', () => {
    state.tripType = '仕立て船';
    updatePlanOptions();
    
    const displayedPlanNames = Array.from(planSelectEl.options).map(opt => opt.value);
    const visibleCharterPlans = Object.keys(plans).filter(name => 
      plans[name].visibleCharter === true
    );
    
    expect(displayedPlanNames).toStrictEqual(visibleCharterPlans);
    
    // visibleCharter=false のプランは含まれないことを確認
    const invisiblePlans = Object.keys(plans).filter(name => 
      plans[name].visibleCharter === false
    );
    
    invisiblePlans.forEach(name => {
      expect(displayedPlanNames).not.toContain(name);
    });
  });

  test('updatePlanOptions を複数回呼び出しても同じ結果になる', () => {
    state.tripType = '乗合船';
    updatePlanOptions();
    const firstCallOptions = Array.from(planSelectEl.options).map(opt => opt.value);
    const firstCallPlan = state.plan;
    
    updatePlanOptions();
    const secondCallOptions = Array.from(planSelectEl.options).map(opt => opt.value);
    const secondCallPlan = state.plan;
    
    expect(secondCallOptions).toStrictEqual(firstCallOptions);
    expect(secondCallPlan).toBe(firstCallPlan);
  });

  // ========================================
  // エラーケーステスト
  // ========================================

  test('plans が空オブジェクトの場合、エラーを投げる', () => {
    global.window.plans = {};
    
    expect(() => updatePlanOptions()).toThrow('Plans data is empty');
  });

  test('plans が undefined の場合、エラーを投げる', () => {
    global.window.plans = undefined;
    
    expect(() => updatePlanOptions()).toThrow('Plans data is not available');
  });

  test('plans が null の場合、エラーを投げる', () => {
    global.window.plans = null;
    
    expect(() => updatePlanOptions()).toThrow('Plans data is not available');
  });

  test('plans がオブジェクト以外（配列、文字列、数値）の場合、エラーを投げる', () => {
    const invalidValues = [
      ['午前アジ', '午後アジ'],
      'invalid',
      123
    ];
    
    invalidValues.forEach(invalidValue => {
      global.window.plans = invalidValue;
      expect(() => updatePlanOptions()).toThrow('Plans data is not available');
    });
  });

  // ========================================
  // エッジケーステスト
  // ========================================

  test('プランが1つだけの場合でも正常に動作する', () => {
    global.window.plans = {
      "午前アジ": {
        "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
        "visibleShared": true,
        "visibleCharter": true
      }
    };
    
    state.tripType = '乗合船';
    updatePlanOptions();
    
    expect(planSelectEl.options.length).toBe(1);
    expect(planSelectEl.options[0].value).toBe('午前アジ');
    expect(state.plan).toBe('午前アジ');
  });

  test('プラン名に特殊文字が含まれていても正常に動作する', () => {
    global.window.plans = {
      "キス＆アナゴリレー": {
        "basePrice": { "men": 11000, "women": 9000, "student": 7500 },
        "visibleShared": true,
        "visibleCharter": true
      },
      "夜アジ＆カサゴリレー": {
        "basePrice": { "men": 8000, "women": 6000, "student": 5000 },
        "visibleShared": true,
        "visibleCharter": true
      }
    };
    
    state.tripType = '乗合船';
    updatePlanOptions();
    
    expect(planSelectEl.options.length).toBe(2);
    expect(Array.from(planSelectEl.options).map(opt => opt.value)).toStrictEqual([
      'キス＆アナゴリレー',
      '夜アジ＆カサゴリレー'
    ]);
  });

  test('プラン名が長い場合でも正常に表示される', () => {
    global.window.plans = {
      "非常に長いプラン名を持つプランのテストケース": {
        "basePrice": { "men": 10000, "women": 8000, "student": 6000 },
        "visibleShared": true,
        "visibleCharter": true
      }
    };
    
    state.tripType = '乗合船';
    updatePlanOptions();
    
    const option = planSelectEl.options[0];
    expect(option.value).toBe('非常に長いプラン名を持つプランのテストケース');
    expect(option.textContent).toBe('非常に長いプラン名を持つプランのテストケース');
  });

  test('visibleフラグがfalseのプランは表示されない', () => {
    global.window.plans = {
      "表示プラン": {
        "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
        "visibleShared": true,
        "visibleCharter": false
      },
      "非表示プラン": {
        "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
        "visibleShared": false,
        "visibleCharter": false
      }
    };
    
    state.tripType = '乗合船';
    updatePlanOptions();
    
    const optionValues = Array.from(planSelectEl.options).map(opt => opt.value);
    expect(optionValues).toContain('表示プラン');
    expect(optionValues).not.toContain('非表示プラン');
    expect(planSelectEl.options.length).toBe(1);
  });

  test('tripTypeを変更すると表示されるプランが変わる', () => {
    global.window.plans = {
      "乗合専用プラン": {
        "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
        "visibleShared": true,
        "visibleCharter": false
      },
      "仕立て専用プラン": {
        "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
        "visibleShared": false,
        "visibleCharter": true
      },
      "両方表示プラン": {
        "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
        "visibleShared": true,
        "visibleCharter": true
      }
    };
    
    // 乗合船の場合
    state.tripType = '乗合船';
    updatePlanOptions();
    let optionValues = Array.from(planSelectEl.options).map(opt => opt.value);
    expect(optionValues).toContain('乗合専用プラン');
    expect(optionValues).toContain('両方表示プラン');
    expect(optionValues).not.toContain('仕立て専用プラン');
    expect(planSelectEl.options.length).toBe(2);
    
    // 仕立て船の場合
    state.tripType = '仕立て船';
    updatePlanOptions();
    optionValues = Array.from(planSelectEl.options).map(opt => opt.value);
    expect(optionValues).toContain('仕立て専用プラン');
    expect(optionValues).toContain('両方表示プラン');
    expect(optionValues).not.toContain('乗合専用プラン');
    expect(planSelectEl.options.length).toBe(2);
  });
});
