// tests/setup.js
import { expect, beforeEach, vi } from 'vitest';
import crypto from 'crypto';

// Mock window.location to simulate production environment for GA4 tests
if (!global.window) {
  global.window = {};
}
// Simulate production hostname for tests (not localhost)
global.window.location = {
  hostname: 'ichinosemaru.com', // Production-like hostname
  href: 'https://ichinosemaru.com/'
};

// Import real data from plans-data.js
const plansDataModule = await import('../plans-data.js');
const { plans, commonRental, holidays } = plansDataModule;

// Make real data available globally for tests
global.plans = plans;
global.commonRental = commonRental;
global.holidays = holidays;

// Mock Web Crypto API for Node.js environment using real SHA-256
if (!global.crypto) {
  global.crypto = {
    subtle: {
      digest: async (algorithm, data) => {
        // Use Node.js crypto to generate actual SHA-256 hash
        const hash = crypto.createHash('sha256');
        hash.update(Buffer.from(data));
        return hash.digest().buffer;
      }
    }
  };
}

// Mock gtag function for GA4 tracking tests
global.gtag = vi.fn();

// Mock gtag function for GA4 tracking tests
global.gtag = vi.fn();

// Reset DOM and state before each test
beforeEach(() => {
  document.body.innerHTML = '';
  
  // Clear gtag mock calls before each test
  if (global.gtag) {
    global.gtag.mockClear();
  }
  
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
