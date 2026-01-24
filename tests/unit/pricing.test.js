// tests/unit/pricing.test.js
import { describe, it, expect } from 'vitest';
import { getShikakePrices, getTimesForPlan } from '../../main.js';

describe('getShikakePrices', () => {
  it('マダイ五目の仕掛け価格を返す', () => {
    const result = getShikakePrices('マダイ五目');
    expect(result).toStrictEqual({
      '仕掛け': { note: '500〜600円' }
    });
  });

  it('ヤリスルメイカの仕掛け価格を返す', () => {
    const result = getShikakePrices('ヤリ・スルメイカ');
    expect(result).toStrictEqual({
      'オモリ（150号）': { note: '600円' },
      '仕掛け': { note: '1000〜1500円' }
    });
  });

  it('ヤリイカ（別名）の仕掛け価格を返す', () => {
    const result = getShikakePrices('ヤリイカ');
    expect(result).toStrictEqual({
      'オモリ（150号）': { note: '600円' },
      '仕掛け': { note: '1000〜1500円' }
    });
  });

  it('タチアジリレーの仕掛け価格を返す', () => {
    const result = getShikakePrices('タチアジリレー');
    expect(result).toStrictEqual({
      '仕掛け': { note: '250〜500円' }
    });
  });

  it('カワハギの仕掛け価格を返す', () => {
    const result = getShikakePrices('カワハギ');
    expect(result).toStrictEqual({
      '仕掛け': { note: '400〜600円' }
    });
  });

  it('マゴチの仕掛け価格を返す', () => {
    const result = getShikakePrices('マゴチ');
    expect(result).toStrictEqual({
      '仕掛け': { note: '450円程度' }
    });
  });

  it('午前アジの標準価格を返す', () => {
    const result = getShikakePrices('午前アジ');
    expect(result).toStrictEqual({
      '仕掛け': { note: '250〜500円' }
    });
  });

  it('午後アジの標準価格を返す', () => {
    const result = getShikakePrices('午後アジ');
    expect(result).toStrictEqual({
      '仕掛け': { note: '250〜500円' }
    });
  });

  it('アミ五目の標準価格を返す', () => {
    const result = getShikakePrices('午前アミ五目');
    expect(result).toStrictEqual({
      '仕掛け': { note: '250〜500円' }
    });
  });

  it('キスの標準価格を返す', () => {
    const result = getShikakePrices('キス');
    expect(result).toStrictEqual({
      '仕掛け': { note: '250〜500円' }
    });
  });

  it('メバルの標準価格を返す', () => {
    const result = getShikakePrices('メバル');
    expect(result).toStrictEqual({
      '仕掛け': { note: '250〜500円' }
    });
  });

  it('カサゴの標準価格を返す', () => {
    const result = getShikakePrices('カサゴ');
    expect(result).toStrictEqual({
      '仕掛け': { note: '250〜500円' }
    });
  });

  it('タチウオの標準価格を返す', () => {
    const result = getShikakePrices('タチウオ');
    expect(result).toStrictEqual({
      '仕掛け': { note: '250〜500円' }
    });
  });

  it('不明なプランの場合空オブジェクトを返す', () => {
    const result = getShikakePrices('UnknownPlan');
    expect(result).toStrictEqual({});
  });

  it('nullの場合空オブジェクトを返す', () => {
    const result = getShikakePrices(null);
    expect(result).toStrictEqual({});
  });

  it('空文字列の場合空オブジェクトを返す', () => {
    const result = getShikakePrices('');
    expect(result).toStrictEqual({});
  });
});

describe('getTimesForPlan', () => {
  it('午後アジの午後時刻を返す', () => {
    const result = getTimesForPlan('午後アジ');
    expect(result).toStrictEqual({ meet: '12:00', depart: '12:30' });
  });

  it('午後プレフィックス付きプランの午後時刻を返す', () => {
    const result = getTimesForPlan('午後マダイ');
    expect(result).toStrictEqual({ meet: '12:00', depart: '12:30' });
  });

  it('午前アジの午前時刻を返す', () => {
    const result = getTimesForPlan('午前アジ');
    expect(result).toStrictEqual({ meet: '06:30', depart: '07:00' });
  });

  it('午前アミ五目の午前時刻を返す', () => {
    const result = getTimesForPlan('午前アミ五目');
    expect(result).toStrictEqual({ meet: '06:30', depart: '07:00' });
  });

  it('マダイ五目（午前/午後なし）の午前時刻を返す', () => {
    const result = getTimesForPlan('マダイ五目');
    expect(result).toStrictEqual({ meet: '06:30', depart: '07:00' });
  });

  it('カワハギの午前時刻を返す', () => {
    const result = getTimesForPlan('カワハギ');
    expect(result).toStrictEqual({ meet: '06:30', depart: '07:00' });
  });

  it('マゴチの午前時刻を返す', () => {
    const result = getTimesForPlan('マゴチ');
    expect(result).toStrictEqual({ meet: '06:30', depart: '07:00' });
  });

  it('nullの場合空時刻を返す', () => {
    const result = getTimesForPlan(null);
    expect(result).toStrictEqual({ meet: '', depart: '' });
  });

  it('空文字列の場合空時刻を返す', () => {
    const result = getTimesForPlan('');
    expect(result).toStrictEqual({ meet: '', depart: '' });
  });

  it('不明なプランの場合午前時刻を返す', () => {
    const result = getTimesForPlan('UnknownPlan');
    expect(result).toStrictEqual({ meet: '06:30', depart: '07:00' });
  });
});
