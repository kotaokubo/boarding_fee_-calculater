import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { state, renderShikakeOptions, setDOMElements } from '../../main.js';

// renderShikakeOptions() の統合テスト
// 役割: プラン名に応じて仕掛けの備考をDOMに表示する

describe('renderShikakeOptions', () => {
  let shikakeListEl;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="shikakeList"></div>
    `;

    shikakeListEl = document.getElementById('shikakeList');
    setDOMElements({ shikakeListEl });

    state.shikake = {};
  });

  afterEach(() => {
    document.body.innerHTML = '';
    state.plan = null;
    state.shikake = {};
  });

  test('既知プランの仕掛け備考を表示する（マダイ五目）', () => {
    state.plan = 'マダイ五目';

    renderShikakeOptions();

    const texts = Array.from(shikakeListEl.querySelectorAll('.shikake-info')).map(el => el.textContent);
    expect(texts).toStrictEqual(['仕掛け：500〜600円']);
  });

  test('未知プランでもデフォルトの仕掛け備考を表示する', () => {
    state.plan = 'UnknownPlan';

    renderShikakeOptions();

    const texts = Array.from(shikakeListEl.querySelectorAll('.shikake-info')).map(el => el.textContent);
    expect(texts).toStrictEqual(['仕掛け：500円程度 (時価)']);
  });

  test('再レンダー時に前回の表示をクリアして上書きする', () => {
    state.plan = 'ヤリ・スルメイカ';
    renderShikakeOptions();
    const first = Array.from(shikakeListEl.querySelectorAll('.shikake-info')).map(el => el.textContent);
    expect(first).toStrictEqual(['オモリ（150号）：600円', '仕掛け：1000〜1500円']);

    state.plan = 'タチアジリレー';
    renderShikakeOptions();
    const second = Array.from(shikakeListEl.querySelectorAll('.shikake-info')).map(el => el.textContent);
    expect(second).toStrictEqual(['仕掛け：250〜500円']);
  });
});
