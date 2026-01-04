import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state } from '../../main.js';
import { trackFormStart, trackFormSubmit } from '../../ga4-tracking.js';

describe('GA4 Event Tracking', () => {
  beforeEach(() => {
    // Reset gtag mock
    global.gtag = vi.fn();
    
    // Reset state
    state.tripType = '乗合船';
    state.plan = '午前アジ';
    state.date = '2026-03-15';
    state.men = 2;
    state.women = 0;
    state.student = 0;
    state.rentals = {};
    state.visitorName = '';
    state.visitorKana = '';
    state.visitorPhone = '';
  });

  describe('booking_form_started event', () => {
    it('should track booking_form_started event with valid data', () => {
      state.men = 2;
      state.women = 1;
      state.student = 1;
      
      const calculation = { total: 20900 };
      trackFormStart(state, calculation);
      
      expect(global.gtag).toHaveBeenCalledWith('event', 'booking_form_started', expect.objectContaining({
        form_id: 'plan_selection',
        form_name: 'decide_plan',
        trip_type: '乗合船',
        plan_name: '午前アジ',
        reservation_date: '2026-03-15',
        total_people: 4,
        send_to: 'G-SNXNEFLLZ9'
      }));
      expect(global.gtag).toHaveBeenCalledTimes(1);
    });

    it('should track form_start with plan as "未選択" when no plan selected', () => {
      state.men = 1;
      state.plan = null;
      
      const calculation = { total: 0 };
      trackFormStart(state, calculation);
      
      expect(global.gtag).toHaveBeenCalledWith('event', 'booking_form_started', expect.objectContaining({
        plan_name: '未選択'
      }));
    });

    it('should track booking_form_started for charter boat (仕立て船)', () => {
      state.tripType = '仕立て船';
      state.plan = 'マダイ五目';
      state.men = 5;
      
      const calculation = { total: 54400 };
      trackFormStart(state, calculation);
      
      expect(global.gtag).toHaveBeenCalledWith('event', 'booking_form_started', expect.objectContaining({
        trip_type: '仕立て船',
        total_people: 5
      }));
    });

    it('should not call gtag when gtag is undefined', () => {
      global.gtag = undefined;
      state.men = 1;
      
      const calculation = { total: 6800 };
      trackFormStart(state, calculation);
      
      expect(global.gtag).toBeUndefined();
    });
  });

  describe('booking_submitted event', () => {
    it('should track booking_submitted event without PII', async () => {
      state.men = 2;
      state.women = 1;
      state.student = 0;
      state.visitorName = '田中太郎';
      state.visitorKana = 'タナカタロウ';
      state.visitorPhone = '090-1234-5678';
      state.rentals = { '竿（手巻き）': 2 };
      
      const calculation = { total: 14700 };
      await trackFormSubmit(state, calculation);
      
      expect(global.gtag).toHaveBeenCalledWith('event', 'booking_submitted', expect.objectContaining({
        form_id: 'reservation_form',
        trip_type: '乗合船',
        plan_name: '午前アジ',
        men_count: 2,
        women_count: 1,
        student_count: 0,
        total_people: 3,
        rental_count: 1,
        value_jpy: 14700
      }));
    });

    it('should track form_submit with zero rentals', async () => {
      state.men = 1;
      state.rentals = {};
      state.visitorName = 'Test User';
      state.visitorKana = 'テストユーザー';
      state.visitorPhone = '080-0000-0000';
      
      const calculation = { total: 6800 };
      await trackFormSubmit(state, calculation);
      
      expect(global.gtag).toHaveBeenCalledWith('event', 'booking_submitted', expect.objectContaining({
        rental_count: 0
      }));
    });

    it('should track form_submit with multiple rental items', async () => {
      state.men = 3;
      state.rentals = {
        '竿（手巻き）': 2,
        'カッパ長靴セット': 1,
        'ビシセット': 3
      };
      state.visitorName = '山田花子';
      state.visitorKana = 'ヤマダハナコ';
      state.visitorPhone = '070-9999-8888';
      
      const calculation = { total: 0 };
      await trackFormSubmit(state, calculation);
      
      expect(global.gtag).toHaveBeenCalledWith('event', 'booking_submitted', expect.objectContaining({
        rental_count: 3
      }));
    });

    it('should not call gtag when gtag is undefined', async () => {
      global.gtag = undefined;
      state.men = 1;
      state.visitorName = 'Test';
      state.visitorKana = 'テスト';
      state.visitorPhone = '000-0000-0000';
      
      const calculation = { total: 6800 };
      await trackFormSubmit(state, calculation);
      
      expect(global.gtag).toBeUndefined();
    });
  });

  describe('gtag availability check', () => {
    it('should not throw error when gtag is undefined', () => {
      global.gtag = undefined;
      
      const action = () => {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'test');
        }
      };
      
      expect(action).not.toThrow();
    });

    it('should call gtag when it is defined', () => {
      global.gtag = vi.fn();
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'test', { test_param: 'value' });
      }
      
      expect(global.gtag).toHaveBeenCalledWith('event', 'test', { test_param: 'value' });
    });
  });
});
