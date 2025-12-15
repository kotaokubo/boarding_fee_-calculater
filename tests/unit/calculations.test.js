// tests/unit/calculations.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateTotal, state } from '../../main.js';

describe('calculateTotal - 乗合船', () => {
  beforeEach(() => {
    state.tripType = '乗合船';
    state.plan = '午前アジ';
    state.date = '2026-01-15';
    state.men = 0;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
    state.shikake = {};
  });

  it('人数がゼロの場合、合計金額がゼロになる', () => {
    const result = calculateTotal();
    expect(result.total).toBe(0);
    expect(result.subtotal).toBe(0);
    expect(result.rentalTotal).toBe(0);
    expect(result.breakdown.totalPeople).toBe(0);
  });

  it('男性のみの料金を正しく計算する', () => {
    state.men = 3;
    const result = calculateTotal();
    // 午前アジ: men=6800
    expect(result.subtotal).toBe(20400);
    expect(result.total).toBe(20400);
    expect(result.breakdown.men).toBe(3);
    expect(result.breakdown.women).toBe(0);
    expect(result.breakdown.student).toBe(0);
    expect(result.breakdown.totalPeople).toBe(3);
  });

  it('男性・女性・学生の混合グループの料金を正しく計算する', () => {
    state.men = 2;
    state.women = 1;
    state.student = 1;
    const result = calculateTotal();
    // 午前アジ: men=6800, women=5500, student=3800
    // 2*6800 + 1*5500 + 1*3800 = 13600 + 5500 + 3800 = 22900
    expect(result.subtotal).toBe(22900);
    expect(result.total).toBe(22900);
    expect(result.breakdown.men).toBe(2);
    expect(result.breakdown.women).toBe(1);
    expect(result.breakdown.student).toBe(1);
    expect(result.breakdown.totalPeople).toBe(4);
  });

  it('レンタル費用を正しく追加する', () => {
    state.men = 1;
    state.rentals = { '竿（竿,リール）': 2 };
    const result = calculateTotal();
    // 午前アジ: men=6800, 竿（竿,リール）=600
    // subtotal: 1*6800 = 6800
    // rentalTotal: 2*600 = 1200
    expect(result.subtotal).toBe(6800);
    expect(result.rentalTotal).toBe(1200);
    expect(result.total).toBe(8000);
  });

  it('複数のレンタル品の費用を正しく追加する', () => {
    state.men = 1;
    state.rentals = { '竿（竿,リール）': 1, 'カッパ長靴セット': 1 };
    const result = calculateTotal();
    // 午前アジ: men=6800, 竿（竿,リール）=600, カッパ長靴セット=600
    // subtotal: 6800
    // rentalTotal: 600 + 600 = 1200
    expect(result.subtotal).toBe(6800);
    expect(result.rentalTotal).toBe(1200);
    expect(result.total).toBe(8000);
  });

  it('レンタル数量がゼロの場合を正しく処理する', () => {
    state.men = 1;
    state.rentals = { '竿（竿,リール）': 0 };
    const result = calculateTotal();
    expect(result.rentalTotal).toBe(0);
    expect(result.total).toBe(6800);
  });

  it('負のレンタル数量をゼロとして処理する', () => {
    state.men = 1;
    state.rentals = { '竿（竿,リール）': -1 };
    const result = calculateTotal();
    expect(result.rentalTotal).toBe(0);
    expect(result.total).toBe(6800);
  });

  it('異なるプラン（マダイ五目）で正しく計算する', () => {
    state.plan = 'マダイ五目';
    state.men = 1;
    const result = calculateTotal();
    // マダイ五目: men=11500
    expect(result.subtotal).toBe(11500);
    expect(result.total).toBe(11500);
  });

  it('複数の人数とレンタル品を含む計算を正しく行う', () => {
    state.men = 3;
    state.women = 2;
    state.student = 1;
    state.rentals = { '竿（竿,リール）': 3, 'カッパ長靴セット': 2 };
    const result = calculateTotal();
    // 午前アジ: men=6800, women=5500, student=3800
    // 竿（竿,リール）=600, カッパ長靴セット=600
    // subtotal: 3*6800 + 2*5500 + 1*3800 = 20400 + 11000 + 3800 = 35200
    // rentalTotal: 3*600 + 2*600 = 1800 + 1200 = 3000
    expect(result.subtotal).toBe(35200);
    expect(result.rentalTotal).toBe(3000);
    expect(result.total).toBe(38200);
    expect(result.breakdown.totalPeople).toBe(6);
  });
});

describe('calculateTotal - 仕立て船', () => {
  beforeEach(() => {
    state.tripType = '仕立て船';
    state.plan = '午前アジ';
    state.date = '2026-01-15';
    state.men = 0;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
    state.shikake = {};
  });

  it('8名以下の場合、最低料金を請求する（8名ちょうど）', () => {
    state.men = 8;
    const result = calculateTotal();
    // 午前アジ 乗合船: men=6800
    // 仕立て船 minimum: 8 * 6800 = 54400
    expect(result.subtotal).toBe(54400);
    expect(result.total).toBe(54400);
    expect(result.breakdown.minPeopleUsed).toBe(8);
    expect(result.breakdown.minPriceUsed).toBe(54400);
    expect(result.breakdown.shortageCount).toBe(0);
    expect(result.breakdown.extraCount).toBe(0);
  });

  it('8名以下の場合、最低料金を請求する（5名）', () => {
    state.men = 5;
    const result = calculateTotal();
    expect(result.subtotal).toBe(54400);
    expect(result.total).toBe(54400);
    expect(result.breakdown.shortageCount).toBe(3);
    expect(result.breakdown.extraCount).toBe(0);
  });

  it('8名以下の場合、最低料金を請求する（1名）', () => {
    state.men = 1;
    const result = calculateTotal();
    expect(result.subtotal).toBe(54400);
    expect(result.total).toBe(54400);
    expect(result.breakdown.shortageCount).toBe(7);
    expect(result.breakdown.extraCount).toBe(0);
  });

  it('8名を超える場合、追加料金を請求する（10名：学生優先）', () => {
    state.men = 5;
    state.women = 3;
    state.student = 2;
    const result = calculateTotal();
    // Total people: 10, extra: 2
    // Priority: student (2) -> all 2 students are extra
    // Extra charge: 2 * 3800 = 7600
    // Total: 54400 + 7600 = 62000
    expect(result.subtotal).toBe(62000);
    expect(result.total).toBe(62000);
    expect(result.breakdown.extraCount).toBe(2);
    expect(result.breakdown.extraChargeAmount).toBe(7600);
    expect(result.breakdown.extraBreakdown.student).toBe(2);
    expect(result.breakdown.extraBreakdown.women).toBe(0);
    expect(result.breakdown.extraBreakdown.men).toBe(0);
    expect(result.breakdown.shortageCount).toBe(0);
  });

  it('8名を超える場合、追加料金を請求する（11名：学生優先、次に女性）', () => {
    state.men = 6;
    state.women = 3;
    state.student = 2;
    const result = calculateTotal();
    // Total people: 11, extra: 3
    // Priority: student (2) + women (1)
    // Extra charge: 2*3800 + 1*5500 = 7600 + 5500 = 13100
    // Total: 54400 + 13100 = 67500
    expect(result.subtotal).toBe(67500);
    expect(result.total).toBe(67500);
    expect(result.breakdown.extraCount).toBe(3);
    expect(result.breakdown.extraChargeAmount).toBe(13100);
    expect(result.breakdown.extraBreakdown.student).toBe(2);
    expect(result.breakdown.extraBreakdown.women).toBe(1);
    expect(result.breakdown.extraBreakdown.men).toBe(0);
  });

  it('8名を超える場合、追加料金を請求する（15名：全ての優先タイプ）', () => {
    state.men = 8;
    state.women = 4;
    state.student = 3;
    const result = calculateTotal();
    // Total people: 15, extra: 7
    // Priority: student (3) + women (4)
    // Extra charge: 3*3800 + 4*5500 = 11400 + 22000 = 33400
    // Total: 54400 + 33400 = 87800
    expect(result.subtotal).toBe(87800);
    expect(result.total).toBe(87800);
    expect(result.breakdown.extraCount).toBe(7);
    expect(result.breakdown.extraChargeAmount).toBe(33400);
    expect(result.breakdown.extraBreakdown.student).toBe(3);
    expect(result.breakdown.extraBreakdown.women).toBe(4);
    expect(result.breakdown.extraBreakdown.men).toBe(0);
  });

  it('8名を超える場合、追加料金を請求する（20名：全カテゴリーで追加）', () => {
    state.men = 10;
    state.women = 6;
    state.student = 4;
    const result = calculateTotal();
    // Total people: 20, extra: 12
    // Priority: student (4) + women (6) + men (2)
    // Extra charge: 4*3800 + 6*5500 + 2*6800 = 15200 + 33000 + 13600 = 61800
    // Total: 54400 + 61800 = 116200
    expect(result.subtotal).toBe(116200);
    expect(result.total).toBe(116200);
    expect(result.breakdown.extraCount).toBe(12);
    expect(result.breakdown.extraChargeAmount).toBe(61800);
    expect(result.breakdown.extraBreakdown.student).toBe(4);
    expect(result.breakdown.extraBreakdown.women).toBe(6);
    expect(result.breakdown.extraBreakdown.men).toBe(2);
  });

  it('最低料金にレンタル費用を追加する（5名でレンタルあり）', () => {
    state.men = 5;
    state.rentals = { '竿（竿,リール）': 3 };
    const result = calculateTotal();
    // Minimum: 54400
    // Rentals: 3*600 = 1800
    expect(result.subtotal).toBe(54400);
    expect(result.rentalTotal).toBe(1800);
    expect(result.total).toBe(56200);
  });

  it('追加料金にレンタル費用を追加する（10名でレンタルあり）', () => {
    state.men = 6;
    state.women = 2;
    state.student = 2;
    state.rentals = { '竿（竿,リール）': 2, 'カッパ長靴セット': 1 };
    const result = calculateTotal();
    // Minimum: 54400
    // Extra: 2 students -> 2*3800 = 7600
    // Subtotal: 62000
    // Rentals: 2*600 + 1*600 = 1200 + 600 = 1800
    expect(result.subtotal).toBe(62000);
    expect(result.rentalTotal).toBe(1800);
    expect(result.total).toBe(63800);
  });
});
