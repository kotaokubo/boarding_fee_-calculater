// GA4 (Google Analytics 4) event tracking utilities

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

/**
 * Track form start event when user clicks "予約へ進む" button
 * @param {Object} state - Current application state
 * @param {Object} calculation - Calculation result from calculateTotal()
 */
export function trackFormStart(state, calculation) {
  if (typeof gtag === 'undefined') {
    return;
  }
  
  const totalPeople = state.men + state.women + state.student;
  
  gtag('event', 'form_start', {
    form_id: 'personal_info_form',
    form_name: 'reservation_inquiry',
    trip_type: state.tripType,
    plan_name: state.plan || '未選択',
    reservation_date: state.date || '未選択',
    total_people: totalPeople,
    value: calculation.total,
    currency: 'JPY'
  });
}

/**
 * Track form submit event when user completes reservation
 * @param {Object} state - Current application state
 * @param {Object} calculation - Calculation result from calculateTotal()
 */
export async function trackFormSubmit(state, calculation) {
  if (typeof gtag === 'undefined') {
    return;
  }
  
  const totalPeople = state.men + state.women + state.student;
  const rentalCount = Object.values(state.rentals).filter(qty => qty > 0).length;
  
  // Hash personal information for privacy
  const [nameHash, kanaHash, phoneHash] = await Promise.all([
    hashString(state.visitorName),
    hashString(state.visitorKana),
    hashString(state.visitorPhone)
  ]);
  
  gtag('event', 'form_submit', {
    form_id: 'personal_info_form',
    form_name: 'reservation_inquiry',
    trip_type: state.tripType,
    plan_name: state.plan || '未選択',
    reservation_date: state.date || '未選択',
    men_count: state.men,
    women_count: state.women,
    student_count: state.student,
    total_people: totalPeople,
    rental_count: rentalCount,
    value: calculation.total,
    currency: 'JPY',
    visitor_name_hash: nameHash,
    visitor_kana_hash: kanaHash,
    visitor_phone_hash: phoneHash
  });
}
