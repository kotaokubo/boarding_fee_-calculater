import { describe, test, expect, beforeEach } from 'vitest';
import { plans } from '../../plans-data.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * all_plans.html の統合テスト
 *
 * plans-data.js の全プランが正しくレンダリングされることを検証する。
 * index.html と同じデータソース (plans-data.js) を使っているが、
 * レンダリングロジックが別なので、表示内容の整合性をテストで担保する。
 */

// all_plans.html のインラインスクリプトと同等のレンダリングロジックを実行
function renderAllPlansToDOM() {
  document.body.innerHTML = '<div id="all-plans-list"></div>';
  const container = document.getElementById('all-plans-list');

  const entries = Object.entries(plans);
  const active = entries.filter(([, p]) => p.visibleShared || p.visibleCharter);
  const inactive = entries.filter(([, p]) => !p.visibleShared && !p.visibleCharter);

  [...active, ...inactive].forEach(([planName, plan]) => {
    const card = document.createElement('div');
    card.className = 'plan-card';

    const sharedBadge = plan.visibleShared ? '乗船受付中' : '乗船受付停止中';
    const charterBadge = plan.visibleCharter ? '乗船受付中' : '乗船受付停止中';

    let html = `
      <div class="plan-card-header">${planName}</div>
      <div class="plan-card-section">
        <div class="plan-card-row" data-field="men">¥${plan.basePrice.men.toLocaleString()}</div>
        <div class="plan-card-row" data-field="women">¥${plan.basePrice.women.toLocaleString()}</div>
        <div class="plan-card-row" data-field="student">¥${plan.basePrice.student.toLocaleString()}</div>
        <div class="plan-card-row" data-field="shared">${sharedBadge}</div>
        <div class="plan-card-row" data-field="charter-status">${charterBadge}</div>
      </div>`;

    if (plan.charter) {
      html += `
      <div class="plan-card-section" data-section="charter">
        <div data-field="weekday">${plan.charter.weekday.minPeople}名 ¥${plan.charter.weekday.minPrice.toLocaleString()}</div>
        <div data-field="holiday">${plan.charter.holiday.minPeople}名 ¥${plan.charter.holiday.minPrice.toLocaleString()}</div>
        <div data-field="sunday">${plan.charter.sunday.minPeople}名 ¥${plan.charter.sunday.minPrice.toLocaleString()}</div>
      </div>`;
    }

    if (plan.rental) {
      let rentalHtml = '';
      Object.entries(plan.rental).forEach(([itemName, item]) => {
        const price = typeof item === 'number' ? item : item.price;
        rentalHtml += `<div data-field="rental-item">${itemName} ¥${price.toLocaleString()}</div>`;
      });
      html += `<div class="plan-card-section" data-section="rental">${rentalHtml}</div>`;
    }

    if (plan.note) {
      html += `<div data-section="note">${plan.note}</div>`;
    }

    card.innerHTML = html;
    container.appendChild(card);
  });
}

describe('all_plans ページの表示内容が plans-data.js と一致する', () => {
  beforeEach(() => {
    renderAllPlansToDOM();
  });

  test('全プランがカードとして表示される', () => {
    const cards = document.querySelectorAll('.plan-card');
    expect(cards.length).toBe(Object.keys(plans).length);
  });

  test('全プラン名が表示される', () => {
    const headers = document.querySelectorAll('.plan-card-header');
    const displayedNames = Array.from(headers).map(h => h.textContent);
    const planNames = Object.keys(plans);
    planNames.forEach(name => {
      expect(displayedNames).toContain(name);
    });
  });

  test('乗船受付中のプランが先に表示される', () => {
    const headers = document.querySelectorAll('.plan-card-header');
    const displayedNames = Array.from(headers).map(h => h.textContent);

    const activeNames = Object.entries(plans)
      .filter(([, p]) => p.visibleShared || p.visibleCharter)
      .map(([name]) => name);
    const inactiveNames = Object.entries(plans)
      .filter(([, p]) => !p.visibleShared && !p.visibleCharter)
      .map(([name]) => name);

    if (activeNames.length > 0 && inactiveNames.length > 0) {
      const lastActiveIndex = displayedNames.indexOf(activeNames[activeNames.length - 1]);
      const firstInactiveIndex = displayedNames.indexOf(inactiveNames[0]);
      expect(lastActiveIndex).toBeLessThan(firstInactiveIndex);
    }
  });

  test('各プランの基本料金が正しく表示される', () => {
    Object.entries(plans).forEach(([planName, plan]) => {
      const card = findCardByName(planName);
      expect(card).not.toBeNull();

      const menRow = card.querySelector('[data-field="men"]');
      expect(menRow.textContent).toContain(`¥${plan.basePrice.men.toLocaleString()}`);

      const womenRow = card.querySelector('[data-field="women"]');
      expect(womenRow.textContent).toContain(`¥${plan.basePrice.women.toLocaleString()}`);

      const studentRow = card.querySelector('[data-field="student"]');
      expect(studentRow.textContent).toContain(`¥${plan.basePrice.student.toLocaleString()}`);
    });
  });

  test('仕立て料金があるプランは仕立てセクションが表示される', () => {
    Object.entries(plans).forEach(([planName, plan]) => {
      const card = findCardByName(planName);
      const charterSection = card.querySelector('[data-section="charter"]');

      if (plan.charter) {
        expect(charterSection).not.toBeNull();
        expect(charterSection.textContent).toContain(`¥${plan.charter.weekday.minPrice.toLocaleString()}`);
        expect(charterSection.textContent).toContain(`¥${plan.charter.holiday.minPrice.toLocaleString()}`);
        expect(charterSection.textContent).toContain(`¥${plan.charter.sunday.minPrice.toLocaleString()}`);
      } else {
        expect(charterSection).toBeNull();
      }
    });
  });

  test('レンタル品があるプランはレンタルセクションが表示される', () => {
    Object.entries(plans).forEach(([planName, plan]) => {
      const card = findCardByName(planName);
      const rentalSection = card.querySelector('[data-section="rental"]');

      if (plan.rental) {
        expect(rentalSection).not.toBeNull();
        Object.entries(plan.rental).forEach(([itemName, item]) => {
          const price = typeof item === 'number' ? item : item.price;
          expect(rentalSection.textContent).toContain(itemName);
          expect(rentalSection.textContent).toContain(`¥${price.toLocaleString()}`);
        });
      } else {
        expect(rentalSection).toBeNull();
      }
    });
  });

  test('備考があるプランは備考が表示される', () => {
    Object.entries(plans).forEach(([planName, plan]) => {
      const card = findCardByName(planName);
      const noteSection = card.querySelector('[data-section="note"]');

      if (plan.note) {
        expect(noteSection).not.toBeNull();
        expect(noteSection.textContent).toContain(plan.note);
      } else {
        expect(noteSection).toBeNull();
      }
    });
  });

  test('受付状態が正しく表示される', () => {
    Object.entries(plans).forEach(([planName, plan]) => {
      const card = findCardByName(planName);

      const sharedRow = card.querySelector('[data-field="shared"]');
      expect(sharedRow.textContent).toBe(plan.visibleShared ? '乗船受付中' : '乗船受付停止中');

      const charterRow = card.querySelector('[data-field="charter-status"]');
      expect(charterRow.textContent).toBe(plan.visibleCharter ? '乗船受付中' : '乗船受付停止中');
    });
  });
});

function findCardByName(planName) {
  const headers = document.querySelectorAll('.plan-card-header');
  for (const header of headers) {
    if (header.textContent === planName) {
      return header.closest('.plan-card');
    }
  }
  return null;
}
