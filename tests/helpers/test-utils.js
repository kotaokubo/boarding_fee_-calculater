// tests/helpers/test-utils.js
import { beforeEach } from 'vitest';

/**
 * Set up a minimal DOM structure for testing
 */
export function setupDOM() {
  document.body.innerHTML = `
    <div id="tripTypeGroup">
      <input type="radio" id="shared" name="tripType" value="乗合船" checked>
      <input type="radio" id="chartered" name="tripType" value="仕立て船">
    </div>
    <select id="planSelect"></select>
    <input type="date" id="tripDate">
    <input type="number" id="menCount" value="0">
    <input type="number" id="womenCount" value="0">
    <input type="number" id="childCount" value="0">
    <div id="rentalItemsContainer"></div>
    <div id="totalAmount"></div>
    <button id="submitBtn">申し込む</button>
    <div id="personalInfoModal" style="display: none;"></div>
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
 */
export function setFormValues({ tripType, plan, date, men, women, children }) {
  if (tripType) {
    const radio = document.querySelector(`input[name="tripType"][value="${tripType}"]`);
    if (radio) radio.checked = true;
  }
  if (plan) {
    const select = document.getElementById('planSelect');
    if (select) select.value = plan;
  }
  if (date !== undefined) {
    const dateInput = document.getElementById('tripDate');
    if (dateInput) dateInput.value = date;
  }
  if (men !== undefined) {
    const menInput = document.getElementById('menCount');
    if (menInput) menInput.value = men;
  }
  if (women !== undefined) {
    const womenInput = document.getElementById('womenCount');
    if (womenInput) womenInput.value = women;
  }
  if (children !== undefined) {
    const childInput = document.getElementById('childCount');
    if (childInput) childInput.value = children;
  }
}

/**
 * Reset state object to initial values
 */
export function resetState(state) {
  state.tripType = '乗合船';
  state.selectedPlan = null;
  state.date = '';
  state.menCount = 0;
  state.womenCount = 0;
  state.childCount = 0;
  state.rentals = [];
}
