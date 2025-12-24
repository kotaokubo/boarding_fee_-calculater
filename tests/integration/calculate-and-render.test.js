import { describe, test, expect, beforeEach } from 'vitest';
import { plans, commonRental } from '../../plans-data.js';
import {
  state,
  calculateAndRender,
  setDOMElements
} from '../../main.js';

/**
 * calculateAndRender() の統合テスト
 * 
 * テスト対象:
 * - calculateTotal() を呼び出して料金計算
 * - 計算結果をDOMに表示（breakdown, fixedTotalAmount）
 * - 乗合船と仕立て船の表示分岐
 * - レンタル品の表示
 * - 返金情報の表示
 * 
 * カバレッジ目標: C0/C1 100%
 */

describe('calculateAndRender', () => {
  let breakdownEl;
  let fixedTotalAmountEl;

  beforeEach(() => {
    // DOM構築
    document.body.innerHTML = `
      <select id="tripType"></select>
      <select id="planSelect"></select>
      <input type="date" id="date" />
      <select id="menCount"></select>
      <select id="womenCount"></select>
      <select id="studentCount"></select>
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

    breakdownEl = document.getElementById('breakdown');
    fixedTotalAmountEl = document.getElementById('fixedTotalAmount');

    // グローバルに実データを設定
    global.window = global.window || {};
    global.window.plans = plans;
    global.window.commonRental = commonRental;

    // DOM要素を設定
    setDOMElements({
      tripTypeEl: document.getElementById('tripType'),
      planSelectEl: document.getElementById('planSelect'),
      dateEl: document.getElementById('date'),
      menEl: document.getElementById('menCount'),
      womenEl: document.getElementById('womenCount'),
      studentEl: document.getElementById('studentCount'),
      rentalListEl: document.getElementById('rentalList'),
      shikakeListEl: document.getElementById('shikakeList'),
      breakdownEl: breakdownEl,
      fixedTotalAmountEl: fixedTotalAmountEl,
      priceMenEl: document.getElementById('priceMen'),
      priceWomenEl: document.getElementById('priceWomen'),
      priceStudentEl: document.getElementById('priceStudent'),
      planTimesEl: document.getElementById('planTimes')
    });

    // state初期化
    state.tripType = '乗合船';
    state.plan = '午前アジ';
    state.date = '2026-01-15';
    state.men = 0;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
    state.shikake = {};
  });

  describe('乗合船の場合', () => {
    test('人数ゼロの場合、合計金額ゼロが表示される', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      
      const result = calculateAndRender();
      
      expect(result.total).toBe(0);
      expect(breakdownEl.innerHTML).toContain('合計金額：0円');
      expect(fixedTotalAmountEl.textContent).toBe('合計：0円');
    });

    test('男性2名の場合、正しい料金内訳が表示される', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.men = 2;
      
      const result = calculateAndRender();
      
      // 午前アジ: men=6800
      expect(result.total).toBe(13600);
      expect(breakdownEl.innerHTML).toContain('プラン：乗合船 午前アジ');
      expect(breakdownEl.innerHTML).toContain('日付：2026-01-15（木）');
      expect(breakdownEl.innerHTML).toContain('料金内訳：');
      expect(breakdownEl.innerHTML).toContain('男性 2名 × 6,800円 = 13,600円');
      expect(breakdownEl.innerHTML).toContain('レンタル：なし');
      expect(breakdownEl.innerHTML).toContain('合計金額：13,600円');
      expect(fixedTotalAmountEl.textContent).toBe('合計：13,600円');
    });

    test('男性・女性・学生の混合グループの場合、正しい内訳が表示される', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.men = 2;
      state.women = 1;
      state.student = 1;
      
      const result = calculateAndRender();
      
      // 午前アジ: men=6800, women=5500, student=3800
      // 2*6800 + 1*5500 + 1*3800 = 22900
      expect(result.total).toBe(22900);
      expect(breakdownEl.innerHTML).toContain('男性 2名 × 6,800円 = 13,600円');
      expect(breakdownEl.innerHTML).toContain('女性 1名 × 5,500円 = 5,500円');
      expect(breakdownEl.innerHTML).toContain('子供 1名 × 3,800円 = 3,800円');
      expect(breakdownEl.innerHTML).toContain('合計金額：22,900円');
      expect(fixedTotalAmountEl.textContent).toBe('合計：22,900円');
    });

    test('レンタル品がある場合、レンタル内訳が表示される', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.men = 2;
      state.rentals = {
        '竿（竿,リール）': 2,
        'カッパ長靴セット': 1
      };
      
      const result = calculateAndRender();
      
      // 午前アジ: men=6800
      // 竿: 600 × 2 = 1200
      // カッパ長靴: 600 × 1 = 600
      // total: 13600 + 1200 + 600 = 15400
      expect(result.total).toBe(15400);
      expect(breakdownEl.innerHTML).toContain('レンタル：');
      expect(breakdownEl.innerHTML).toContain('竿（竿,リール） × 2 = 1,200円');
      expect(breakdownEl.innerHTML).toContain('カッパ長靴セット × 1 = 600円');
      expect(breakdownEl.innerHTML).toContain('合計金額：15,400円');
      expect(fixedTotalAmountEl.textContent).toBe('合計：15,400円');
    });

    test('返金のあるレンタル品がある場合、返金情報が表示される', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.men = 2;
      state.rentals = {
        'ビシセット': 2  // refund: 2100
      };
      
      calculateAndRender();
      
      expect(breakdownEl.innerHTML).toContain('※返却時に返金のあるレンタル：');
      expect(breakdownEl.innerHTML).toContain('ビシセット：2,100円 × 2 = 4,200円');
    });
  });

  describe('仕立て船の場合', () => {
    test('最低人数未満の場合、最低料金が表示される', () => {
      state.tripType = '仕立て船';
      state.plan = '午前アジ';
      state.date = '2026-01-15'; // 平日
      state.men = 5;
      
      const result = calculateAndRender();
      
      // 平日: minPeople=8, minPrice=54400
      expect(result.total).toBe(54400);
      expect(breakdownEl.innerHTML).toContain('プラン：仕立て船 午前アジ');
      expect(breakdownEl.innerHTML).toContain('料金内訳：');
      expect(breakdownEl.innerHTML).toContain('最低料金（男性8名分）：54,400円');
      expect(breakdownEl.innerHTML).toContain('合計金額：54,400円');
      expect(fixedTotalAmountEl.textContent).toBe('合計：54,400円');
    });

    test('最低人数ちょうどの場合、最低料金が表示される', () => {
      state.tripType = '仕立て船';
      state.plan = '午前アジ';
      state.date = '2026-01-15'; // 平日
      state.men = 8;
      
      const result = calculateAndRender();
      
      // 平日: minPeople=8, minPrice=54400
      expect(result.total).toBe(54400);
      expect(breakdownEl.innerHTML).toContain('最低料金（男性8名分）：54,400円');
      expect(breakdownEl.innerHTML).not.toContain('追加人数');
    });

    test('最低人数を超えた場合、追加料金の内訳が表示される', () => {
      state.tripType = '仕立て船';
      state.plan = '午前アジ';
      state.date = '2026-01-15'; // 平日
      state.men = 10;
      
      const result = calculateAndRender();
      
      // 平日: minPeople=8, minPrice=54400
      // 追加: 男性2名 × 6800 = 13600
      // total: 54400 + 13600 = 68000
      expect(result.total).toBe(68000);
      expect(breakdownEl.innerHTML).toContain('最低料金（男性8名分）：54,400円');
      expect(breakdownEl.innerHTML).toContain('追加人数：2名');
      expect(breakdownEl.innerHTML).toContain('男性2名分 = 13,600円');
      expect(breakdownEl.innerHTML).toContain('（追加分合計 = 13,600円）');
      expect(breakdownEl.innerHTML).toContain('合計金額：68,000円');
    });

    test('追加人数が男性・女性・子供混合の場合、すべて表示される', () => {
      state.tripType = '仕立て船';
      state.plan = '午前アジ';
      state.date = '2026-01-15'; // 平日
      state.men = 7;
      state.women = 2;
      state.student = 2;
      // 合計11名: 最低8名 + 追加3名（子供2, 女性1）
      
      const result = calculateAndRender();
      
      // 平日: minPeople=8, minPrice=54400
      // 追加: 子供2名 × 3800 + 女性1名 × 5500 = 7600 + 5500 = 13100
      // total: 54400 + 13100 = 67500
      expect(result.total).toBe(67500);
      expect(breakdownEl.innerHTML).toContain('最低料金（男性8名分）：54,400円');
      expect(breakdownEl.innerHTML).toContain('追加人数：3名');
      expect(breakdownEl.innerHTML).toContain('女性1名分 = 5,500円');
      expect(breakdownEl.innerHTML).toContain('子供2名分 = 7,600円');
      expect(breakdownEl.innerHTML).toContain('（追加分合計 = 13,100円）');
    });

    test('土曜日の場合、土曜料金が適用される', () => {
      state.tripType = '仕立て船';
      state.plan = '午前アジ';
      state.date = '2026-01-17'; // 土曜日
      state.men = 8;
      
      const result = calculateAndRender();
      
      // 土曜（holiday扱い）: minPeople=15, minPrice=102000
      expect(result.total).toBe(102000);
      expect(breakdownEl.innerHTML).toContain('最低料金（男性15名分）：102,000円');
    });

    test('日曜日の場合、日曜料金が適用される', () => {
      state.tripType = '仕立て船';
      state.plan = '午前アジ';
      state.date = '2026-01-18'; // 日曜日
      state.men = 8;
      
      const result = calculateAndRender();
      
      // 日曜: minPeople=12, minPrice=81600
      expect(result.total).toBe(81600);
      expect(breakdownEl.innerHTML).toContain('最低料金（男性12名分）：81,600円');
    });
  });

  describe('date未設定の場合', () => {
    test('dateがnullの場合、「未選択」が表示される', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.date = null;
      state.men = 2;
      
      calculateAndRender();
      
      expect(breakdownEl.innerHTML).toContain('日付：未選択');
    });

    test('dateが空文字の場合、「未選択」が表示される', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.date = '';
      state.men = 2;
      
      calculateAndRender();
      
      expect(breakdownEl.innerHTML).toContain('日付：未選択');
    });
  });

  describe('planが未設定の場合', () => {
    test('planがnullの場合、プラン名なしで表示される', () => {
      state.tripType = '乗合船';
      state.plan = null;
      state.date = '2026-01-15';
      state.men = 0;
      
      calculateAndRender();
      
      expect(breakdownEl.innerHTML).toContain('プラン：乗合船');
      expect(breakdownEl.innerHTML).not.toContain('プラン：乗合船 ');
    });
  });

  describe('仕掛けはレンタルに含まれない', () => {
    test('仕掛けがstate.rentalsにあっても表示されない', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.men = 2;
      state.rentals = {
        '仕掛け': 3,  // これは表示されないはず
        '竿（竿,リール）': 1
      };
      
      const result = calculateAndRender();
      
      // 仕掛けは計算に含まれない
      // 竿のみ: 600 × 1 = 600
      // total: 13600 + 600 = 14200
      expect(result.total).toBe(14200);
      expect(breakdownEl.innerHTML).not.toContain('仕掛け');
      expect(breakdownEl.innerHTML).toContain('竿（竿,リール） × 1 = 600円');
    });
  });

  describe('レンタル数量がゼロの場合', () => {
    test('数量0のレンタルは表示されない', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.men = 2;
      state.rentals = {
        '竿（竿,リール）': 0,
        '氷': 0
      };
      
      calculateAndRender();
      
      expect(breakdownEl.innerHTML).toContain('レンタル：なし');
      expect(breakdownEl.innerHTML).not.toContain('竿（竿,リール）');
      expect(breakdownEl.innerHTML).not.toContain('氷');
    });

    test('一部が数量0、一部が数量ありの場合、数量ありのみ表示される', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.men = 2;
      state.rentals = {
        '竿（竿,リール）': 0,
        '長靴のみ': 1
      };
      
      calculateAndRender();
      
      expect(breakdownEl.innerHTML).toContain('レンタル：');
      expect(breakdownEl.innerHTML).not.toContain('竿（竿,リール）');
      expect(breakdownEl.innerHTML).toContain('長靴のみ × 1 = 200円');
    });
  });

  describe('fixedTotalAmountEl が存在しない場合', () => {
    test('fixedTotalAmountElがnullでもエラーにならない', () => {
      // fixedTotalAmountElをnullに設定
      setDOMElements({
        tripTypeEl: document.getElementById('tripType'),
        planSelectEl: document.getElementById('planSelect'),
        dateEl: document.getElementById('date'),
        menEl: document.getElementById('menCount'),
        womenEl: document.getElementById('womenCount'),
        studentEl: document.getElementById('studentCount'),
        rentalListEl: document.getElementById('rentalList'),
        shikakeListEl: document.getElementById('shikakeList'),
        breakdownEl: breakdownEl,
        fixedTotalAmountEl: null,  // nullに設定
        priceMenEl: document.getElementById('priceMen'),
        priceWomenEl: document.getElementById('priceWomen'),
        priceStudentEl: document.getElementById('priceStudent'),
        planTimesEl: document.getElementById('planTimes')
      });

      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.men = 2;
      
      // エラーにならないことを確認
      expect(() => calculateAndRender()).not.toThrow();
    });
  });

  describe('返却値の確認', () => {
    test('calculateTotal()の結果を返却する', () => {
      state.tripType = '乗合船';
      state.plan = '午前アジ';
      state.men = 2;
      state.rentals = {
        '竿（竿,リール）': 1
      };
      
      const result = calculateAndRender();
      
      // calculateTotal()の返却値と同じ構造
      expect(result).toStrictEqual({
        total: 14200,
        subtotal: 13600,
        rentalTotal: 600,
        breakdown: {
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
        }
      });
    });
  });
});
