// Contract (short):
// - Inputs: tripType, plan, date, men/women/student counts, rental selections
// - Output: realtime total amount (number), formatted summary string, mailto link
// - Error modes: missing date => still calculate; negative numbers prevented by input min=0

// Plans and rental data are provided by `plans-data.js` and exposed on window.
// This keeps data separate and makes it easy to replace with an external JSON later.
const plans = window.plans || {};
const commonRental = window.commonRental || {};

// --- Helper / state ---
const state = {
  tripType: '乗合船',
  plan: null,
  date: null,
  men: 0,
  women: 0,
  student: 0,
  rentals: {}, // {name: qty}
  shikake: {}, // {name: qty}
  // Personal information
  visitorName: '',
  visitorKana: '',
  visitorPhone: '',
  visitorEmail: ''
};

// DOM refs
const tripTypeEl = document.getElementById('tripType');
const planSelectEl = document.getElementById('planSelect');
const dateEl = document.getElementById('date');
const menEl = document.getElementById('menCount');
const womenEl = document.getElementById('womenCount');
const studentEl = document.getElementById('studentCount');
const rentalListEl = document.getElementById('rentalList');
const shikakeListEl = document.getElementById('shikakeList');
const breakdownEl = document.getElementById('breakdown');
const fixedTotalAmountEl = document.getElementById('fixedTotalAmount');
const mailtoBtn = document.getElementById('mailtoBtn');
const resetBtn = document.getElementById('resetBtn');
const priceMenEl = document.getElementById('priceMen');
const priceWomenEl = document.getElementById('priceWomen');
const priceStudentEl = document.getElementById('priceStudent');
const planTimesEl = document.getElementById('planTimes');

// Modal refs
const personalInfoModal = document.getElementById('personalInfoModal');
const personalInfoForm = document.getElementById('personalInfoForm');
const visitorNameEl = document.getElementById('visitorName');
const visitorKanaEl = document.getElementById('visitorKana');
const visitorPhoneEl = document.getElementById('visitorPhone');
const visitorEmailEl = document.getElementById('visitorEmail');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalSubmitBtn = document.getElementById('modalSubmitBtn');

// Init date to today
(function setToday() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  dateEl.value = yyyy + '-' + mm + '-' + dd;
  state.date = dateEl.value;
  // update weekday display next to date input if present
  updateDateWeekdayDisplay();
})();

// (person-count inputs are handled by direct event listeners later in the file)

// Populate 0..100 options for person-count selects
function populateCountSelects() {
  const max = 100;
  const opts = [];
  for (let i = 0; i <= max; i++) {
    opts.push(`<option value="${i}">${i}</option>`);
  }
  const html = opts.join('\n');
  if (menEl) menEl.innerHTML = html;
  if (womenEl) womenEl.innerHTML = html;
  if (studentEl) studentEl.innerHTML = html;
  // ensure state reflects initial selection
  state.men = Number(menEl && menEl.value) || 0;
  state.women = Number(womenEl && womenEl.value) || 0;
  state.student = Number(studentEl && studentEl.value) || 0;
}

// Populate plan select based on tripType
function updatePlanOptions() {
  const type = state.tripType;
  planSelectEl.innerHTML = '';
  // If 仕立て船 is selected, allow choosing any plan from 乗合船 as well
  let optionNames = [];
  if (type === '仕立て船') {
    const charterPlans = Object.keys((plans['仕立て船']) || {});
    const regularPlans = Object.keys((plans['乗合船']) || {});
    // merge and dedupe, keep charterPlans first
    optionNames = Array.from(new Set([...charterPlans, ...regularPlans]));
  } else {
    optionNames = Object.keys((plans[type]) || {});
  }

  for (const p of optionNames) {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    planSelectEl.appendChild(opt);
  }
  // set state.plan to first option
  state.plan = planSelectEl.value || null;
  updateUnitPrices();
  renderShikakeOptions();
  renderRentalOptions();
  calculateAndRender();
}

// Update per-person unit prices shown next to inputs
function updateUnitPrices(){
  const plan = state.plan;
  let fareObj = null;
  // First try to find fare on the selected trip type
  if (plans[state.tripType] && plans[state.tripType][plan] && plans[state.tripType][plan].fare) {
    fareObj = plans[state.tripType][plan].fare;
  }
  // If not found (e.g., charter selecting a regular plan), try乗合船
  if (!fareObj && plans['乗合船'] && plans['乗合船'][plan] && plans['乗合船'][plan].fare) {
    fareObj = plans['乗合船'][plan].fare;
  }

  if (fareObj) {
    priceMenEl.textContent = '男性：' + fareObj.men.toLocaleString() + '円';
    priceWomenEl.textContent = '女性：' + fareObj.women.toLocaleString() + '円';
    priceStudentEl.textContent = '子供（高校生以下）：' + fareObj.student.toLocaleString() + '円';
  } else {
    priceMenEl.textContent = '—';
    priceWomenEl.textContent = '—';
    priceStudentEl.textContent = '—';
  }
  // update plan difficulty supplement when unit prices change (i.e., plan changed)
  updatePlanSupplement();
  updatePlanTimes();
}

function updatePlanTimes(){
  if (!planTimesEl) return;
  const times = getTimesForPlan(state.plan);
  if (times && times.meet && times.depart) {
    planTimesEl.textContent = `集合 ${times.meet} / 出船 ${times.depart}`;
  } else {
    planTimesEl.textContent = '';
  }
}

// Show a one-line supplement about plan difficulty after a plan is selected.
function updatePlanSupplement(){
  const el = document.getElementById('planSupplement');
  if (!el) return;
  const plan = state.plan || '';
  // User-specified classification lists
  const advancedKeywords = ['イカ'];
  const intermediateKeywords = ['マダイ'];
  const beginnerKeywords = ['午前アジ','午前アミ五目'];

  // Determine difficulty with precedence: 上級者 -> 中級者 -> 初心者
  // Only show difficulty if the plan matches one of the specified keywords
  let difficulty = null;
  
  for (const kw of advancedKeywords) {
    if (plan.indexOf(kw) !== -1) { 
      difficulty = '上級者'; 
      break; 
    }
  }
  
  if (difficulty === null) {
    for (const kw of intermediateKeywords) {
      if (plan.indexOf(kw) !== -1) { 
        difficulty = '中級者'; 
        break; 
      }
    }
  }
  
  if (difficulty === null) {
    for (const kw of beginnerKeywords) {
      if (plan.indexOf(kw) !== -1) { 
        difficulty = '初心者'; 
        break; 
      }
    }
  }

  const texts = {
    '初心者': '初心者向け：釣り初心者の方でも安心して楽しんでいただけます',
    '中級者': '中級者向け：船釣りの経験がある方がおすすめです',
    '上級者': '上級者向け：熟練の方におすすめの釣り物です'
  };

  // Color mapping: 初心者=緑, 中級者=黄色, 上級者=オレンジ
  const styleMap = {
    '初心者': { bg: '#e6f7e6', color: '#2ca02c' },
    '中級者': { bg: '#fff7d6', color: '#b8860b' },
    '上級者': { bg: '#fff2e6', color: '#ff8c00' }
  };

  // Only show the supplement if a difficulty was determined (i.e., if the plan matches specified keywords)
  const txt = difficulty ? (texts[difficulty] || '') : '';
  el.textContent = txt;
  if (!txt) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  el.style.padding = '6px 8px';
  el.style.borderRadius = '4px';
  el.style.marginTop = '6px';
  const s = styleMap[difficulty] || { bg: '', color: '' };
  el.style.backgroundColor = s.bg;
  el.style.color = s.color;
}

// Return meeting and departure times based on plan name.
// If plan contains '午後' -> 12:30集合 / 13:00出船, otherwise -> 6:30集合 / 7:00出船
function getTimesForPlan(planName) {
  if (!planName) return { meet: '', depart: '' };
  if (planName.indexOf('午後') !== -1) {
    return { meet: '12:30', depart: '13:00' };
  }
  return { meet: '06:30', depart: '07:00' };
}

// Define shikake prices based on plan type (tackle is now rental only)
function getShikakePrices(planName) {
  if (!planName) return {};
  
  // マダイ船の判定
  if (planName.indexOf('マダイ') !== -1) {
    return {
      '仕掛け': { price: 550, note: '500〜600円' }
    };
  }
  
  // ヤリスルメイカ船の判定
  if (planName.indexOf('ヤリスルメイカ') !== -1 || planName.indexOf('ヤリイカ') !== -1) {
    return {
      'オモリ（150号）': { price: 600, note: '600円' },
      '仕掛け': { price: 1250, note: '1000〜1500円' }
    };
  }
  
  // タチアジ船の判定
  if (planName.indexOf('タチアジ') !== -1) {
    return {
      '仕掛け': { price: 375, note: '250〜500円' }
    };
  }
  
  // カワハギ船の判定
  if (planName.indexOf('カワハギ') !== -1) {
    return {
      '仕掛け': { price: 500, note: '400〜600円' }
    };
  }
  
  // マゴチ船の判定
  if (planName.indexOf('マゴチ') !== -1) {
    return {
      '仕掛け': { price: 450, note: '450円程度' }
    };
  }
  
  // 午前・午後船（その他）の判定
  if (planName.indexOf('午前') !== -1 || planName.indexOf('午後') !== -1 || 
      planName.indexOf('アジ') !== -1 || planName.indexOf('アミ五目') !== -1 || 
      planName.indexOf('キス') !== -1 || planName.indexOf('メバル') !== -1 || 
      planName.indexOf('カサゴ') !== -1 || planName.indexOf('タチウオ') !== -1) {
    return {
      '仕掛け': { price: 375, note: '250〜500円' }
    };
  }
  return {};
}

// Render shikake (tackle) options based on selected plan
function renderShikakeOptions() {
  shikakeListEl.innerHTML = '';
  state.shikake = {};
  
  const shikakePrices = getShikakePrices(state.plan);
  
  if (Object.keys(shikakePrices).length === 0) {
    // プランに対応する仕掛けがない場合
    shikakeListEl.innerHTML = '<div class="no-shikake">このプランには対応する仕掛けはありません</div>';
    return;
  }
  
  // テキスト表示のみ（個数選択なし、計算なし）
  for (const [name, priceInfo] of Object.entries(shikakePrices)) {
    const noteText = priceInfo.note || '';
    const displayText = noteText ? `${name}：${noteText}` : `${name}`;
    const div = document.createElement('div');
    div.className = 'shikake-info';
    div.style.padding = '8px 0';
    div.style.color = '#666';
    div.textContent = displayText;
    shikakeListEl.appendChild(div);
  }
}



// Render rental options merging plan-specific and common rentals
function renderRentalOptions() {
  rentalListEl.innerHTML = '';
  state.rentals = {};
  // plan-specific rentals (if any). For 仕立て船, the selected plan may be from 乗合船.
  let planSpecific = null;
  if (plans[state.tripType] && plans[state.tripType][state.plan]) {
    planSpecific = plans[state.tripType][state.plan];
  } else if (plans['乗合船'] && plans['乗合船'][state.plan]) {
    planSpecific = plans['乗合船'][state.plan];
  }
  // Track which rental names we've already added to avoid duplicates
  const addedRentals = new Set();
  if (planSpecific && planSpecific.rental) {
    for (const name of Object.keys(planSpecific.rental)) {
      // pass the whole rental object (may contain price and refund)
      addRentalRow(name, planSpecific.rental[name]);
      addedRentals.add(name);
    }
  }

  // If this is a 仕立て船 selection, also include rentals defined on the corresponding 乗合船 plan
  // (e.g., ビシセット) so charters can rent the same items. Avoid duplicates by checking addedRentals.
  if (state.tripType === '仕立て船' && plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].rental) {
    const sharedRentals = plans['乗合船'][state.plan].rental;
    for (const name of Object.keys(sharedRentals)) {
      if (addedRentals.has(name)) continue;
      addRentalRow(name, sharedRentals[name]);
      addedRentals.add(name);
    }
  }

  // common rentals
  for (const name of Object.keys(commonRental)) {
    // Treat '仕掛け' as a備考 (note) only — do not show as a rental option or include in calculations.
    if (name === '仕掛け') continue;
    
    // 専用竿が定義されているプランでは、共通の竿（竿,リール）を非表示
    if (name === '竿（竿,リール）' && state.plan && planSpecific && planSpecific.rental) {
      // プラン固有の竿が定義されているかチェック
      const hasSpecificTackle = planSpecific.rental['竿（手巻き）'] || 
                               planSpecific.rental['竿（電動リール）'] || 
                               planSpecific.rental['竿（専用竿）'];
      if (hasSpecificTackle) {
        continue; // 専用竿があるので共通竿は表示しない
      }
    }
    
    const info = (typeof commonRental[name] === 'object') ? commonRental[name] : { price: commonRental[name] };
    addRentalRow(name, info);
  }
}

function addRentalRow(name, priceInfo) {
  const wrap = document.createElement('div');
  // render rentals as simple list items (not cards)
  wrap.className = 'rental-item';
  // Simplified UI: no checkbox — show name, price and always-enabled qty input.
  const label = document.createElement('div');
  label.style.flex = '1';
  // priceInfo may be an object {price, refund} or a number
  const price = (priceInfo && typeof priceInfo === 'object') ? priceInfo.price : priceInfo;
  const refund = (priceInfo && typeof priceInfo === 'object' && priceInfo.refund) ? priceInfo.refund : null;
  label.textContent = name + '：' + (price ? price.toLocaleString() : '0') + '円';
  if (refund) {
    const refundLabel = document.createElement('div');
    refundLabel.style.fontSize = '12px';
    refundLabel.style.color = '#336';
    refundLabel.textContent = '（返却時返金：' + refund.toLocaleString() + '円）';
    label.appendChild(refundLabel);
  }

  // create a select 0..100 for qty so users can pick up to 100
  const qty = document.createElement('select');
  qty.className = 'count-select';
  // build options
  for (let i = 0; i <= 100; i++) {
    const o = document.createElement('option');
    o.value = String(i);
    o.textContent = String(i);
    qty.appendChild(o);
  }
  // initialize rental qty in state
  state.rentals[name] = 0;

  qty.addEventListener('change', () => {
    const v = Math.max(0, Math.min(100, Number(qty.value) || 0));
    // keep select value normalized
    qty.value = String(v);
    state.rentals[name] = v;
    calculateAndRender();
  });

  wrap.appendChild(label);
  wrap.appendChild(qty);
  rentalListEl.appendChild(wrap);
}

// --- 祝日（連休）を考慮した rateType 判定ユーティリティ ---
// Returns one of: 'weekday' | 'saturday' | 'sunday'
// Rules implemented:
// - 単独祝日（前後が祝日でない）は 'sunday'
// - 連休の中日（start < d < end）は 'saturday'
// - 連休の最終日（d == end && start != end）は 'sunday'
// - 連休の先頭・中日は 'saturday'（start treated as weekend-ish）
// - 日曜で翌日が祝日の場合は連休中日扱い（'saturday'）

function parseISODate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function offsetISO(isoStr, days) {
  const d = parseISODate(isoStr);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

// Build holiday set from window.holidays (if present)
const holidaySet = new Set((window.holidays || []).map(s => s));
function isHolidayISO(iso) {
  return holidaySet.has(iso);
}

function getRateType(dateStr) {
  if (!dateStr) return 'weekday';
  const iso = dateStr;
  const d = parseISODate(iso);
  if (!d || isNaN(d)) return 'weekday';
  const dow = d.getDay(); // 0=Sun,6=Sat

  const isHol = isHolidayISO(iso);
  const prevISO = offsetISO(iso, -1);
  const nextISO = offsetISO(iso, +1);
  const prevHol = isHolidayISO(prevISO);
  const nextHol = isHolidayISO(nextISO);

  // Non-holiday branch
  if (!isHol) {
    if (dow === 6) return 'saturday';
    if (dow === 0) {
      // Sunday: if next day is holiday -> treat as 連休中日 (saturday)
      if (nextHol) return 'saturday';
      return 'sunday';
    }
    return 'weekday';
  }

  // Holiday branch: find contiguous holiday block
  let start = iso, end = iso;
  while (isHolidayISO(offsetISO(start, -1))) start = offsetISO(start, -1);
  while (isHolidayISO(offsetISO(end, +1))) end = offsetISO(end, +1);

  if (start === end) {
    // single isolated holiday -> normally 'sunday',
    // but if the holiday itself falls on Friday, treat it as 'saturday'
    // (so 金曜祝日は金/土が土曜料金、日曜は日曜料金になります)
    if (dow === 5) return 'saturday';
    return 'sunday';
  }

  // multi-day block
  if (iso !== start && iso !== end) {
    // strictly middle -> 'saturday'
    return 'saturday';
  }
  if (iso === end) {
    // final day -> 'sunday'
    return 'sunday';
  }
  if (iso === start) {
    // start day -> treat as 'saturday'
    return 'saturday';
  }

  return 'weekday';
}

// Return weekday name for a given YYYY-MM-DD date string (Japanese short names)
function getWeekdayName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return '';
  const names = ['日','月','火','水','木','金','土'];
  return names[d.getDay()];
}

function formatDateWithWeekday(dateStr) {
  if (!dateStr) return '未選択';
  const wk = getWeekdayName(dateStr);
  return dateStr + (wk ? ('（' + wk + '）') : '');
}

function updateDateWeekdayDisplay(){
  const el = document.getElementById('dateWeekday');
  if (!el) return;
  el.textContent = state.date ? ('（' + getWeekdayName(state.date) + '）') : '';
}

// Main calculation logic
function calculateTotal() {
  const men = Number(state.men) || 0;
  const women = Number(state.women) || 0;
  const student = Number(state.student) || 0;
  const totalPeople = men + women + student;

  let subtotal = 0;
  let rentalTotal = 0;
  let minPeopleUsed = 0;
  let minPriceUsed = 0;
  let extraCount = 0;
  let extraChargeAmount = 0;
  let extraBreakdown = { men: 0, women: 0, student: 0 };
  let shortageCount = 0;

  // rental cost
  for (const [name, qty] of Object.entries(state.rentals || {})) {
    // skip 仕掛け if it somehow exists in rentals state
    if (name === '仕掛け') continue;
    if (!qty || qty <= 0) continue;
    
    // find rental info: check plan-specific (current tripType), then corresponding 乗合船 plan, then commonRental
    let rInfo = null;
    if (plans[state.tripType] && plans[state.tripType][state.plan] && plans[state.tripType][state.plan].rental && plans[state.tripType][state.plan].rental[name]) {
      rInfo = plans[state.tripType][state.plan].rental[name];
    } else if (plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].rental && plans['乗合船'][state.plan].rental[name]) {
      rInfo = plans['乗合船'][state.plan].rental[name];
    } else if (commonRental[name] !== undefined) {
      rInfo = (typeof commonRental[name] === 'object') ? commonRental[name] : { price: commonRental[name] };
    }
    
    let price = 0;
    if (rInfo) {
      if (typeof rInfo === 'object' && rInfo.price !== undefined) {
        price = rInfo.price;
      } else if (typeof rInfo === 'number') {
        price = rInfo;
      }
    }
    
    if (price > 0) {
      rentalTotal += price * qty;
    }
  }

  if (state.tripType === '乗合船') {
    // per-person fare
    const fareObj = (plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].fare) || {men:0,women:0,student:0};
    subtotal += men * fareObj.men + women * fareObj.women + student * fareObj.student;
  } else if (state.tripType === '仕立て船') {
    // 乗合船の料金を取得
    const refFare = (plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].fare) || {men:0,women:0,student:0};
    
    // プランごとの最低料金（男性料金8名分）
    const minPrice = refFare.men * 8;
    
    // 8名までは最低料金、8名を超える分だけ各属性の単価で加算
    minPeopleUsed = 8;
    minPriceUsed = minPrice;
    if (totalPeople <= 8) {
      subtotal = minPrice;
      shortageCount = 8 - totalPeople; // 8名に満たない不足人数
    } else {
      // 8名を超えた分の人数を、子供→女性→男性 の順で加算対象に充てる
      let extras = totalPeople - 8;
      let extraStudent = Math.min(student, extras);
      extras -= extraStudent;
      let extraWomen = Math.min(women, extras);
      extras -= extraWomen;
      let extraMen = Math.min(men, extras);
      const extraCharge = (extraMen * refFare.men) + (extraWomen * refFare.women) + (extraStudent * refFare.student);
      subtotal = minPrice + extraCharge;
      extraCount = (totalPeople - 8);
      extraChargeAmount = extraCharge;
      extraBreakdown = { men: extraMen, women: extraWomen, student: extraStudent };
      shortageCount = 0;
    }
  }

  const total = subtotal + rentalTotal;

  return { total, subtotal, rentalTotal, breakdown: {men,women,student,totalPeople, minPeopleUsed, minPriceUsed, extraCount, extraChargeAmount, shortageCount, extraBreakdown} };
}

// Recalculate and update UI
function calculateAndRender() {
  const res = calculateTotal();
  // Render breakdown with clearer formatting and charter notes
  const parts = [];
  parts.push('');
  parts.push('プラン：' + state.tripType + (state.plan ? (' ' + state.plan) : ''));
  parts.push('');
  parts.push('日付：' + formatDateWithWeekday(state.date));
  // 人数表示は予約内容から除外（画面が冗長になるため）

  // For 仕立て船, show applied minPeople/minPrice and shortages/extras
  if (state.tripType === '仕立て船') {
    const bp = res.breakdown;
    parts.push('');
    parts.push('料金内訳：');
    
    if (bp.minPriceUsed > 0) {
      // 最低料金が適用された場合
      parts.push(`  ・最低料金（男性8名分）：${bp.minPriceUsed.toLocaleString()}円`);
      if (bp.extraCount && bp.extraCount > 0) {
        const eb = bp.extraBreakdown || { men: 0, women: 0, student: 0 };
        // 合計と内訳行を表示
        parts.push(`  ・追加人数：${bp.extraCount}名`);
        const fareObj = (plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].fare) || {men:0,women:0,student:0};
        if (eb.men) {
          const amt = eb.men * fareObj.men;
          parts.push(`    男性${eb.men}名分 = ${amt.toLocaleString()}円`);
        }
        if (eb.women) {
          const amt = eb.women * fareObj.women;
          parts.push(`    女性${eb.women}名分 = ${amt.toLocaleString()}円`);
        }
        if (eb.student) {
          const amt = eb.student * fareObj.student;
          parts.push(`    子供${eb.student}名分 = ${amt.toLocaleString()}円`);
        }
        parts.push(`    （追加分合計 = ${bp.extraChargeAmount.toLocaleString()}円）`);
      }
      // 不足人数の表示は不要
    } else {
      // 通常の料金計算が適用された場合
      if (res.breakdown.men) parts.push(` ・男性 ${res.breakdown.men}名 × ${(plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].fare ? plans['乗合船'][state.plan].fare.men : 0).toLocaleString()}円 = ${(res.breakdown.men * (plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].fare ? plans['乗合船'][state.plan].fare.men : 0)).toLocaleString()}円`);
      if (res.breakdown.women) parts.push(` ・女性 ${res.breakdown.women}名 × ${(plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].fare ? plans['乗合船'][state.plan].fare.women : 0).toLocaleString()}円 = ${(res.breakdown.women * (plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].fare ? plans['乗合船'][state.plan].fare.women : 0)).toLocaleString()}円`);
      if (res.breakdown.student) parts.push(` ・子供 ${res.breakdown.student}名 × ${(plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].fare ? plans['乗合船'][state.plan].fare.student : 0).toLocaleString()}円 = ${(res.breakdown.student * (plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].fare ? plans['乗合船'][state.plan].fare.student : 0)).toLocaleString()}円`);
    }
  } else {
    // Non-charter: show per-person breakdown
    const fareObj = (plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].fare) || null;
    if (fareObj) {
      parts.push('');
      parts.push('料金内訳：');
      if (res.breakdown.men) parts.push(` ・男性 ${res.breakdown.men}名 × ${fareObj.men.toLocaleString()}円 = ${(res.breakdown.men * fareObj.men).toLocaleString()}円`);
      if (res.breakdown.women) parts.push(` ・女性 ${res.breakdown.women}名 × ${fareObj.women.toLocaleString()}円 = ${(res.breakdown.women * fareObj.women).toLocaleString()}円`);
      if (res.breakdown.student) parts.push(` ・子供 ${res.breakdown.student}名 × ${fareObj.student.toLocaleString()}円 = ${(res.breakdown.student * fareObj.student).toLocaleString()}円`);
    }
  }

  // rental description
  const rentParts = [];
  const refundParts = [];
  for (const [name, qty] of Object.entries(state.rentals || {})) {
    // Do not include 仕掛け in rental breakdown (it's a備考 and not charged via this form)
    if (name === '仕掛け') continue;
    if (!qty || qty <= 0) continue;
    // find price and refund (plan-specific rental preferred)
    let rInfo = null;
    if (plans[state.tripType] && plans[state.tripType][state.plan] && plans[state.tripType][state.plan].rental && plans[state.tripType][state.plan].rental[name]) {
      rInfo = plans[state.tripType][state.plan].rental[name];
    } else if (plans['乗合船'] && plans['乗合船'][state.plan] && plans['乗合船'][state.plan].rental && plans['乗合船'][state.plan].rental[name]) {
      rInfo = plans['乗合船'][state.plan].rental[name];
    } else if (commonRental[name] !== undefined) {
      rInfo = (typeof commonRental[name] === 'object') ? commonRental[name] : { price: commonRental[name] };
    }
    let rprice = 0;
    if (rInfo) {
      if (typeof rInfo === 'object' && rInfo.price !== undefined) {
        rprice = rInfo.price;
      } else if (typeof rInfo === 'number') {
        rprice = rInfo;
      }
    }
    rentParts.push(`${name} × ${qty} = ${(rprice * qty).toLocaleString()}円`);
    if (rInfo && rInfo.refund) {
      const perRefund = Number(rInfo.refund) || 0;
      const totalRefund = perRefund * qty;
      refundParts.push(`${name}：${perRefund.toLocaleString()}円 × ${qty} = ${totalRefund.toLocaleString()}円`);
    }
  }
  parts.push('');
if (rentParts.length) {
  parts.push('レンタル：');
  for (const r of rentParts) parts.push(' ・' + r);
} else {
  parts.push('レンタル：なし');
}
  if (refundParts.length) {
    parts.push('');
    parts.push('※返却時に返金のあるレンタル：');
    for (const f of refundParts) parts.push(' ・' + f);
  }
  // 備考：仕掛けはレンタル扱いではありません（250〜500円／釣り物により変動）。
  parts.push('');

  parts.push('<strong>合計金額：' + res.total.toLocaleString() + '円</strong>');

  // Use div with line breaks preserved
  breakdownEl.innerHTML = parts.join('<br>');
  if (fixedTotalAmountEl) fixedTotalAmountEl.textContent = '合計：' + res.total.toLocaleString() + '円';

  return res;
}

// Mailto creation
function createMailTo() {
  const res = calculateTotal();
  const men = Number(state.men)||0, women = Number(state.women)||0, student = Number(state.student)||0;
  
  // レンタル
  const rentParts = [];
  for (const [name, qty] of Object.entries(state.rentals || {})) {
    if (qty && qty>0) rentParts.push(`${name}：${qty}`);
  }
  const rentalText = rentParts.length ? rentParts.join('、') : 'なし';

  // Build body per spec
  const bodyLines = [];
  bodyLines.push('【予約内容】');
  
  // 個人情報
  bodyLines.push('【お客様情報】');
  if (state.visitorName) bodyLines.push('お名前：' + state.visitorName);
  if (state.visitorKana) bodyLines.push('フリガナ：' + state.visitorKana);
  if (state.visitorPhone) bodyLines.push('電話番号：' + state.visitorPhone);
  if (state.visitorEmail) bodyLines.push('メールアドレス：' + state.visitorEmail);
  bodyLines.push('');
  
  bodyLines.push('【ご予約詳細】');
  bodyLines.push('プラン：' + state.tripType + (state.plan ? (' ' + state.plan) : ''));
  bodyLines.push('');
  bodyLines.push('日付：' + formatDateWithWeekday(state.date));
  const times = getTimesForPlan(state.plan);
  if (times.meet && times.depart) {
    bodyLines.push('集合時間：' + times.meet + '、出船時間：' + times.depart);
  }
  bodyLines.push('');
  bodyLines.push('人数：');
  if (men > 0) bodyLines.push('  ・男性：' + men + '名');
  if (women > 0) bodyLines.push('  ・女性：' + women + '名');
  if (student > 0) bodyLines.push('  ・中学生以下：' + student + '名');
  const totalPeople = men + women + student;
  if (totalPeople > 0) {
    bodyLines.push('  合計：' + totalPeople + '名');
  }
  bodyLines.push('');
  bodyLines.push('レンタル：');
  if (rentParts.length) {
    for (const r of rentParts) bodyLines.push('  ・' + r);
  } else {
    bodyLines.push('  なし');
  }

  const body = bodyLines.join('\n');

  const to = 'ichinosemaru1@docomo.ne.jp';
  const subject = '釣り船予約依頼';
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // open default mailer
  window.location.href = mailto;
}

// Hiragana to Katakana converter
function hiraganaToKatakana(str) {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
}

// Event wiring
tripTypeEl.addEventListener('change', (e) => {
  state.tripType = e.target.value;
  updatePlanOptions();
});

planSelectEl.addEventListener('change', (e) => {
  state.plan = e.target.value;
  renderShikakeOptions();
  renderRentalOptions();
  updateUnitPrices();
  calculateAndRender();
});

dateEl.addEventListener('change', (e) => {
  state.date = e.target.value;
  updateDateWeekdayDisplay();
  calculateAndRender();
});

menEl.addEventListener('input', (e) => { state.men = Number(e.target.value)||0; calculateAndRender(); });
womenEl.addEventListener('input', (e) => { state.women = Number(e.target.value)||0; calculateAndRender(); });
studentEl.addEventListener('input', (e) => { state.student = Number(e.target.value)||0; calculateAndRender(); });
// also handle change events for select elements on mobile/browsers that fire change rather than input
menEl.addEventListener('change', (e) => { state.men = Number(e.target.value)||0; calculateAndRender(); });
womenEl.addEventListener('change', (e) => { state.women = Number(e.target.value)||0; calculateAndRender(); });
studentEl.addEventListener('change', (e) => { state.student = Number(e.target.value)||0; calculateAndRender(); });

// Modal event handlers
function showPersonalInfoModal() {
  personalInfoModal.style.display = 'flex';
  // Focus on first input
  visitorNameEl.focus();
}

function closePersonalInfoModal() {
  personalInfoModal.style.display = 'none';
}

mailtoBtn.addEventListener('click', (e) => {
  e.preventDefault();
  showPersonalInfoModal();
});

modalCloseBtn.addEventListener('click', closePersonalInfoModal);
modalCancelBtn.addEventListener('click', closePersonalInfoModal);

// Auto-convert name to katakana for kana field (only for hiragana)
visitorNameEl.addEventListener('input', (e) => {
  const nameValue = e.target.value;
  // Check if input contains only hiragana (and no kanji or other characters)
  const hiraganaOnly = /^[\u3041-\u3096]*$/.test(nameValue);
  if (hiraganaOnly && nameValue.length > 0) {
    // Convert only if purely hiragana
    const katakanaValue = hiraganaToKatakana(nameValue);
    visitorKanaEl.value = katakanaValue;
  } else if (nameValue.length === 0) {
    // Clear kana field if name is empty
    visitorKanaEl.value = '';
  }
  // If contains kanji or mixed characters, do not auto-convert (user must enter manually)
});

// Close modal when clicking outside the modal content
personalInfoModal.addEventListener('click', (e) => {
  if (e.target === personalInfoModal) {
    closePersonalInfoModal();
  }
});

modalSubmitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  
  // Validate form
  if (!personalInfoForm.checkValidity()) {
    personalInfoForm.reportValidity();
    return;
  }
  
  // Save personal info to state
  state.visitorName = visitorNameEl.value.trim();
  state.visitorKana = visitorKanaEl.value.trim();
  state.visitorPhone = visitorPhoneEl.value.trim();
  state.visitorEmail = visitorEmailEl.value.trim();
  
  // Close modal
  closePersonalInfoModal();
  
  // Create and open mailto
  createMailTo();
  
  // Clear form for next use
  personalInfoForm.reset();
});

resetBtn.addEventListener('click', () => {
  tripTypeEl.value = '乗合船';
  state.tripType = '乗合船';
  state.men = state.women = state.student = 0;
  state.shikake = {};
  state.visitorName = '';
  state.visitorKana = '';
  state.visitorPhone = '';
  state.visitorEmail = '';
  menEl.value = womenEl.value = studentEl.value = 0;
  dateEl.valueAsDate = new Date();
  state.date = dateEl.value;
  updatePlanOptions();
  calculateAndRender();
});


// Initialize
(function init(){
  populateCountSelects();
  updatePlanOptions();
  calculateAndRender();
})();
