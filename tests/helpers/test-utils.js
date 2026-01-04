// tests/helpers/test-utils.js
import { beforeEach } from 'vitest';

/**
 * Set up a minimal DOM structure for testing
 * DOM構造はmain.jsの実際のDOM要素IDに合わせる
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
    <div id="planMemo"></div>
    <button id="mailtoBtn">予約へ進む</button>
    <button id="resetBtn">リセット</button>
    
    <!-- Modal elements -->
    <div id="personalInfoModal" style="display:none;">
      <form id="personalInfoForm">
        <input type="text" id="visitorName" required />
        <input type="text" id="visitorKana" required />
        <input type="tel" id="visitorPhone" required />
        <button type="button" id="modalCloseBtn">閉じる</button>
        <button type="button" id="modalCancelBtn">キャンセル</button>
        <button type="submit" id="modalSubmitBtn">送信</button>
      </form>
    </div>
    
    <div id="alertModal" style="display:none;">
      <div id="alertMessage"></div>
      <button id="alertOkBtn">OK</button>
    </div>
  `;
}

/**
 * Clean up DOM after tests
 */
export function cleanupDOM() {
  document.body.innerHTML = '';
}

/**
 * Set form values for testing
 * main.jsのイベントをトリガーするためにchangeイベントを発火
 */
export function setFormValues({ tripType, plan, date, men, women, student }) {
  if (tripType !== undefined) {
    const el = document.getElementById('tripType');
    if (el) {
      el.value = tripType;
      el.dispatchEvent(new Event('change'));
    }
  }
  if (plan !== undefined) {
    const el = document.getElementById('planSelect');
    if (el) {
      el.value = plan;
      el.dispatchEvent(new Event('change'));
    }
  }
  if (date !== undefined) {
    const el = document.getElementById('date');
    if (el) {
      el.value = date;
      el.dispatchEvent(new Event('change'));
    }
  }
  if (men !== undefined) {
    const el = document.getElementById('menCount');
    if (el) {
      el.value = men;
      el.dispatchEvent(new Event('change'));
    }
  }
  if (women !== undefined) {
    const el = document.getElementById('womenCount');
    if (el) {
      el.value = women;
      el.dispatchEvent(new Event('change'));
    }
  }
  if (student !== undefined) {
    const el = document.getElementById('studentCount');
    if (el) {
      el.value = student;
      el.dispatchEvent(new Event('change'));
    }
  }
}

/**
 * Reset state object to initial values
 * main.jsのstateオブジェクトに合わせる
 */
export function resetState(state) {
  state.tripType = '乗合船';
  state.plan = '';
  state.date = '';
  state.men = 0;
  state.women = 0;
  state.student = 0;
  state.rentals = {};
}
