import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { state, validateBooking, setDOMElements } from '../../main.js';

function toISO(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isoFromToday(offsetDays) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return toISO(d);
}

/**
 * validateBooking() のユニットテスト
 * 
 * テスト対象:
 * - 日付検証（2日後以降のみ）
 * - 人数検証（1名以上）
 * - エラーメッセージ表示
 * 
 * カバレッジ目標: C0/C1 100%
 * 
 * テスト方針（TESTING_PLAN.mdに準拠）:
 * - モック・スタブは禁止（showAlertModal の副作用検証は除く）
 * - すべての分岐を網羅
 * - 完全な値検証（曖昧なmatcherは使用しない）
 * - 複数データパターンでテスト
 * 
 */

describe('validateBooking', () => {
  let alertModal;
  let alertMessage;

  beforeEach(() => {
    // Minimal DOM for alert modal
    document.body.innerHTML = `
      <div id="alertModal" style="display:none;">
        <p id="alertMessage"></p>
      </div>
    `;

    alertModal = document.getElementById('alertModal');
    alertMessage = document.getElementById('alertMessage');

    // Set DOM elements in main.js
    setDOMElements({
      tripTypeEl: document.createElement('select'),
      planSelectEl: document.createElement('select'),
      dateEl: document.createElement('input'),
      menEl: document.createElement('select'),
      womenEl: document.createElement('select'),
      studentEl: document.createElement('select'),
      rentalListEl: document.createElement('div'),
      shikakeListEl: document.createElement('div'),
      breakdownEl: document.createElement('div'),
      fixedTotalAmountEl: document.createElement('div'),
      priceMenEl: document.createElement('div'),
      priceWomenEl: document.createElement('div'),
      priceStudentEl: document.createElement('div'),
      planTimesEl: document.createElement('div'),
      planSupplementEl: document.createElement('div'),
      alertModalEl: alertModal,
      alertMessageEl: alertMessage,
      personalInfoModalEl: document.createElement('div'),
      visitorNameEl: document.createElement('input'),
      visitorKanaEl: document.createElement('input'),
    });

    // Reset state
    state.tripType = '乗合船';
    state.plan = '午前アジ';
    state.date = isoFromToday(2); // Valid future date (>=2 days later)
    state.men = 0;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('日付検証: 2日後以降のみ受付', () => {
    test('今日を選択するとエラーを表示してfalseを返す', () => {
      state.date = isoFromToday(0);
      state.men = 1; // 人数は有効

      const result = validateBooking();

      expect(result).toBe(false);
      expect(alertModal.style.display).toBe('flex');
      expect(alertMessage.textContent).toBe('ご予約は2日後以降の日付を選択してください');
    });

    test('明日を選択するとエラーを表示してfalseを返す', () => {
      state.date = isoFromToday(1);
      state.men = 1;

      const result = validateBooking();

      expect(result).toBe(false);
      expect(alertModal.style.display).toBe('flex');
      expect(alertMessage.textContent).toBe('ご予約は2日後以降の日付を選択してください');
    });

    test('2日後なら通過してtrueを返す', () => {
      state.date = isoFromToday(2);
      state.men = 1;

      const result = validateBooking();

      expect(result).toBe(true);
      expect(alertModal.style.display).toBe('none');
    });
  });

  describe('人数検証: 1名以上必須', () => {
    test('人数0名（men=0, women=0, student=0） → エラーメッセージを表示してfalseを返す（分岐: totalPeople === 0）', () => {
      state.men = 0;
      state.women = 0;
      state.student = 0;
      
      const result = validateBooking();
      
      // 完全な値検証
      expect(result).toBe(false);
      expect(alertModal.style.display).toBe('flex');
      expect(alertMessage.textContent).toBe('人数を1名以上選択してください');
    });

    test('人数1名（men=1） → 人数検証をパスしてtrueを返す（分岐: totalPeople > 0）', () => {
      state.men = 1;
      state.women = 0;
      state.student = 0;
      
      const result = validateBooking();
      
      // 完全な値検証
      expect(result).toBe(true);
      expect(alertModal.style.display).toBe('none');
    });

    test('人数1名（women=1） → 人数検証をパスしてtrueを返す', () => {
      state.men = 0;
      state.women = 1;
      state.student = 0;
      
      const result = validateBooking();
      
      // 完全な値検証
      expect(result).toBe(true);
      expect(alertModal.style.display).toBe('none');
    });

    test('人数1名（student=1） → 人数検証をパスしてtrueを返す', () => {
      state.men = 0;
      state.women = 0;
      state.student = 1;
      
      const result = validateBooking();
      
      // 完全な値検証
      expect(result).toBe(true);
      expect(alertModal.style.display).toBe('none');
    });
  });

  describe('複数データパターン: 様々な組み合わせでテスト', () => {
    test('女性2名+学生1名 → 成功（複数データでテスト）', () => {
      state.men = 0;
      state.women = 2;
      state.student = 1;
      
      const result = validateBooking();
      
      // 完全な値検証
      expect(result).toBe(true);
      expect(alertModal.style.display).toBe('none');
    });

    test('男性3名+女性2名+学生1名 → 成功（複数データでテスト）', () => {
      state.men = 3;
      state.women = 2;
      state.student = 1;
      
      const result = validateBooking();
      
      // 完全な値検証
      expect(result).toBe(true);
      expect(alertModal.style.display).toBe('none');
    });

    test('男性5名 → 成功（複数データでテスト）', () => {
      state.men = 5;
      state.women = 0;
      state.student = 0;
      
      const result = validateBooking();
      
      // 完全な値検証
      expect(result).toBe(true);
      expect(alertModal.style.display).toBe('none');
    });

    test('学生10名 → 成功（複数データでテスト）', () => {
      state.men = 0;
      state.women = 0;
      state.student = 10;
      
      const result = validateBooking();
      
      // 完全な値検証
      expect(result).toBe(true);
      expect(alertModal.style.display).toBe('none');
    });

    test('女性100名 → 成功（エッジケース）', () => {
      state.men = 0;
      state.women = 100;
      state.student = 0;
      
      const result = validateBooking();
      
      // 完全な値検証
      expect(result).toBe(true);
      expect(alertModal.style.display).toBe('none');
    });
  });
});
