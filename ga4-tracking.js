// GA4 (Google Analytics 4) event tracking utilities

/**
 * Check if we're in production environment
 * @returns {boolean} true if production, false if development
 */
function isProduction() {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname !== 'localhost' && !hostname.match(/127\.0\.0\.1/);
}

/**
 * Hash a string using SHA-256 for privacy-safe GA4 tracking
 * @param {string} str - The string to hash
 * @returns {Promise<string>} - Hex-encoded hash, or empty string if hashing fails
 */
export async function hashString(str) {
  if (!str || str.length === 0) {
    return '';
  }
  
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      /* istanbul ignore next */
      // Web Crypto API not available (very old browsers)
      return '';
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    let hashHex = '';
    for (let i = 0; i < hashArray.length; i++) {
      hashHex += byteToHex(hashArray[i]);
    }
    return hashHex;
  } catch (error) {
    // Error during hashing - return empty string
    return '';
  }
}

/**
 * Convert a byte to a two-character hex string
 * @param {number} b - Byte value (0-255)
 * @returns {string} - Two-character hex string
 */
function byteToHex(b) {
  const hex = b.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toText(value, fallback = '未選択') {
  return value === null || value === undefined ? fallback : String(value);
}

/**
 * Track form start event when user clicks "予約へ進む" button
 * @param {Object} state - Current application state
 * @param {Object} calculation - Calculation result from calculateTotal()
 */
export function trackFormStart(state, calculation) {
  if (typeof gtag === 'undefined') {
    return;
  }
  
  const totalPeople = toNumber(state.men) + toNumber(state.women) + toNumber(state.student);
  if (!Number.isFinite(totalPeople)) {
    console.warn('GA4 total_people is invalid, skip send', { state });
    return;
  }
  
  const params = {
    // form_id: 'plan_selection',
    // form_name: 'decide_plan',
    // trip_type: toText(state.tripType),
    // plan_name: toText(state.plan),
    // reservation_date: toText(state.date),
    // total_people: totalPeople
  };
  
  /* istanbul ignore next */
  // Log in development mode instead of sending to GA4
  if (!isProduction()) {
    console.log('📊 [GA4 Dev] booking_form_started:', params);
    return;
  }
  
  // gtag('event', 'booking_form_started', params);
  gtag('event', 'booking_form_started');
}

/**
 * Track form submit event when user completes reservation (PII not included)
 * @param {Object} state - Current application state
 * @param {Object} calculation - Calculation result from calculateTotal()
 */
export async function trackFormSubmit(state, calculation) {
  if (typeof gtag === 'undefined') {
    return;
  }
  
  const totalPeople = toNumber(state.men) + toNumber(state.women) + toNumber(state.student);
  if (!Number.isFinite(totalPeople)) {
    console.warn('GA4 total_people is invalid, skip send', { state });
    return;
  }
  
  const rentalCount = toNumber(Object.values(state.rentals || {}).filter(qty => qty > 0).length);
  const valueJpy = toNumber(calculation && calculation.total);

  const params = {
    send_to: 'G-SNXNEFLLZ9',
    form_id: 'reservation_form',
    form_name: 'send_reservation_email',
    trip_type: toText(state.tripType),
    plan_name: toText(state.plan),
    reservation_date: toText(state.date),
    men_count: toNumber(state.men),
    women_count: toNumber(state.women),
    student_count: toNumber(state.student),
    total_people: totalPeople,
    rental_count: rentalCount,
    value_jpy: valueJpy
  };
  
  /* istanbul ignore next */
  // Log in development mode instead of sending to GA4
  if (!isProduction()) {
    console.log('📊 [GA4 Dev] booking_submitted:', params);
    return;
  }
  
  gtag('event', 'booking_submitted', params);
}
