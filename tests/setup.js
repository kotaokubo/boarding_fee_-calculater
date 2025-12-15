// tests/setup.js
import { expect, beforeEach } from 'vitest';

// Import real data from plans-data.js
const plansDataModule = await import('../plans-data.js');
const { plans, commonRental, holidays } = plansDataModule;

// Make real data available globally for tests
global.plans = plans;
global.commonRental = commonRental;
global.holidays = holidays;

// Reset DOM and state before each test
beforeEach(() => {
  document.body.innerHTML = '';
  
  // Reset global state if main.js has been imported
  if (global.state) {
    global.state.tripType = '乗合船';
    global.state.selectedPlan = null;
    global.state.date = '';
    global.state.menCount = 0;
    global.state.womenCount = 0;
    global.state.childCount = 0;
    global.state.rentals = [];
  }
});
