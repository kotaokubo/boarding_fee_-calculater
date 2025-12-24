// Plans data separated for easier maintenance and potential future replacement with external JSON.
// New structure: Each plan contains basePrice (per-person pricing), charter (minimum pricing), rental, and note.
window.plans = {
  "午前アジ": {
    "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 54400 },
      "holiday": { "minPeople": 15, "minPrice": 102000 },
      "sunday": { "minPeople": 12, "minPrice": 81600 }
    },
    "rental": { "ビシセット": { "price": 2200, "refund": 2100 } },
    "note": "コマセ・イカ短・アオイソ・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "午後アジ": {
    "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 54400 },
      "holiday": { "minPeople": 15, "minPrice": 102000 },
      "sunday": { "minPeople": 12, "minPrice": 81600 }
    },
    "rental": { "ビシセット": { "price": 2200, "refund": 2100 } },
    "note": "コマセ・イカ短・アオイソ・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "午前アミ五目": {
    "basePrice": { "men": 7000, "women": 5800, "student": 4300 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 56000 },
      "holiday": { "minPeople": 15, "minPrice": 105000 },
      "sunday": { "minPeople": 12, "minPrice": 84000 }
    },
    "rental": { "ビシセット": { "price": 1800, "refund": 1700 } },
    "note": "アミコマセ・イカ短・付け餌・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "午後アミ五目": {
    "basePrice": { "men": 7000, "women": 5800, "student": 4300 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 56000 },
      "holiday": { "minPeople": 15, "minPrice": 105000 },
      "sunday": { "minPeople": 12, "minPrice": 84000 }
    },
    "rental": { "ビシセット": { "price": 1800, "refund": 1700 } },
    "note": "アミコマセ・イカ短・付け餌・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "マダイ五目": {
    "basePrice": { "men": 11500, "women": 9500, "student": 7500 },
    "charter": {
      "weekday": { "minPeople": 10, "minPrice": 115000 },
      "holiday": { "minPeople": 15, "minPrice": 172500 },
      "sunday": { "minPeople": 12, "minPrice": 138000 }
    },
    "rental": { 
      "竿（手巻き）": 1200,
      "竿（電動リール）": 2200
    },
    "note": "オキアミ規定量・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "ＬＴイサキ五目": {
    "basePrice": { "men": 11500, "women": 9000, "student": 8000 },
    "note": "アミコマセ・イカ短・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "ヤリ・スルメイカ": {
    "basePrice": { "men": 12000, "women": 10000, "student": 8000 },
    "charter": {
      "weekday": { "minPeople": 10, "minPrice": 120000 },
      "holiday": { "minPeople": 15, "minPrice": 180000 },
      "sunday": { "minPeople": 12, "minPrice": 144000 }
    },
    "rental": { 
      "竿（電動リール）": 2200
    },
    "note": "氷付き、投入機あり",
    "visibleShared": true,
    "visibleCharter": true
  },
  "ワラサ": {
    "basePrice": { "men": 12000, "women": 10000, "student": 9500 },
    "note": "オキアミ規定量・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "タチアジリレー": {
    "basePrice": { "men": 11000, "women": 9000, "student": 7000 },
    "charter": {
      "weekday": { "minPeople": 10, "minPrice": 110000 },
      "holiday": { "minPeople": 15, "minPrice": 165000 },
      "sunday": { "minPeople": 12, "minPrice": 132000 }
    },
    "rental": { 
      "竿（手巻き）": 1200,
      "竿（電動リール）": 2200
    },
    "note": "餌・ミンチ・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "遠征ウィリー五目": {
    "basePrice": { "men": 11500, "women": 8500, "student": 8000 },
    "note": "アミコマセ・付け餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "カワハギ": {
    "basePrice": { "men": 11000, "women": 9000, "student": 7000 },
    "charter": {
      "weekday": { "minPeople": 10, "minPrice": 110000 },
      "holiday": { "minPeople": 15, "minPrice": 165000 },
      "sunday": { "minPeople": 12, "minPrice": 132000 }
    },
    "rental": { 
      "竿（専用竿）": 1500
    },
    "note": "付け餌・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "マゴチ": {
    "basePrice": { "men": 10700, "women": 8700, "student": 6500 },
    "charter": {
      "weekday": { "minPeople": 10, "minPrice": 107000 },
      "holiday": { "minPeople": 15, "minPrice": 160500 },
      "sunday": { "minPeople": 12, "minPrice": 128400 }
    },
    "rental": { 
      "竿（専用竿）": 1500
    },
    "note": "サイマキ餌5匹付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "スミイカ": {
    "basePrice": { "men": 10500, "women": 8500, "student": 6500 },
    "note": "シャコ餌付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "テンヤタチウオ": {
    "basePrice": { "men": 9500, "women": 7700, "student": 6500 },
    "charter": {
      "weekday": { "minPeople": 10, "minPrice": 95000 },
      "holiday": { "minPeople": 15, "minPrice": 142500 },
      "sunday": { "minPeople": 12, "minPrice": 114000 }
    },
    "rental": { 
      "竿（専用竿）": 1500
    },
    "note": "氷付き、イワシ餌10匹650円で別途販売",
    "visibleShared": true,
    "visibleCharter": true
  },
  "マダコ": {
    "basePrice": { "men": 10000, "women": 8000, "student": 6500 },
    "note": "カニ餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "ショートメバル": {
    "basePrice": { "men": 7500, "women": 6000, "student": 4300 },
    "note": "活きモエビ・アオイソメ・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "鬼カサゴ": {
    "basePrice": { "men": 11500, "women": 8500, "student": 8000 },
    "note": "サバ餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "午前クロメバル": {
    "basePrice": { "men": 6700, "women": 4500, "student": 3700 },
    "note": "活きモエビ・アオイソメ・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "午後カサゴ": {
    "basePrice": { "men": 6700, "women": 4500, "student": 3500 },
    "note": "サバ餌・アオイソ・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "深場五目": {
    "basePrice": { "men": 12500, "women": 10500, "student": 8500 },
    "note": "サバ餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "午前キス": {
    "basePrice": { "men": 6800, "women": 5000, "student": 3600 },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "午後キス": {
    "basePrice": { "men": 6800, "women": 5000, "student": 3600 },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "キス＆アナゴリレー": {
    "basePrice": { "men": 11000, "women": 9000, "student": 7500 },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "夜アナゴ": {
    "basePrice": { "men": 8000, "women": 6000, "student": 5000 },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "夜アジ＆カサゴリレー": {
    "basePrice": { "men": 8000, "women": 6000, "student": 5000 },
    "note": "コマセ・餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "夜カサゴ＆メバル": {
    "basePrice": { "men": 7000, "women": 5500, "student": 4500 },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  }
};

window.commonRental = {
  "竿（竿,リール）": 600,
  "カッパ長靴セット": 600,
  "長靴のみ": 200
};

// 祝日リスト（YYYY-MM-DD）
// テスト用に 2026 年の祝日をここに入れてあります（必要に応じて追加・更新してください）
//
// 【料金タイプの判定ルール】
// - 平日（weekday）: 月〜金曜で祝日でない日
// - 土曜・連休中日（saturday）: 
//   * 土曜日
//   * 日曜日で翌日が祝日の場合（連休中日）
//   * 祝日で前後いずれかが休日の場合（連休中日）
// - 日曜・連休最終日（sunday）:
//   * 日曜日で翌日が祝日でない場合（孤立した日曜）
//   * 祝日で前後とも休日でない場合（孤立した祝日）
//   * 祝日で翌日が休日でない場合（連休最終日）
//
// 【単独休日と連続休日の例】
// 単独休日（sunday扱い）:
//   - 2026-01-01（元日、木曜）: 前後が平日 → 孤立した祝日
//   - 2026-01-18（日曜）: 翌日が平日 → 孤立した日曜
//   - 2026-02-11（建国記念の日、水曜）: 前後が平日 → 孤立した祝日
//
// 連続休日（saturday扱い）:
//   - 2026-01-10（土曜）: 通常の土曜
//   - 2026-01-11（日曜）: 翌日が祝日（01-12） → 連休中日
//
// 連続休日最終日（sunday扱い）:
//   - 2026-01-12（成人の日、月曜）: 前日が日曜、翌日が平日 → 連休最終日
//   - 2026-05-03（憲法記念日、日曜）: 翌日が祝日 → 連休初日
//   - 2026-05-04（みどりの日、月曜）: 前後が休日 → 連休中日
//   - 2026-05-05（こどもの日、火曜）: 前日が休日、翌日も休日 → 連休中日
//
// 連続休日最終日（sunday扱い）:
//   - 2026-05-06（振替休日、水曜）: 前日が休日、翌日が平日 → 連休最終日
//   - 2026-09-23（秋分の日、水曜）: 前日が休日、翌日が平日 → 連休最終日
window.holidays = [
  '2026-01-01', // 元日（木曜、単独休日）
  '2026-01-12', // 成人の日（月曜、連休最終日：前日1/11が日曜）
  '2026-02-11', // 建国記念の日（水曜、単独休日）
  '2026-02-23', // 天皇誕生日（月曜、単独休日）
  '2026-03-20', // 春分の日（金曜、単独休日）
  '2026-04-29', // 昭和の日（水曜、単独休日）
  '2026-05-04', // みどりの日（月曜、GW連休中日）
  '2026-05-05', // こどもの日（火曜、GW連休中日）
  '2026-05-06', // 振替休日（水曜、GW連休最終日）
  '2026-07-20', // 海の日（月曜、単独休日）
  '2026-08-11', // 山の日（火曜、単独休日）
  '2026-09-21', // 敬老の日（月曜、シルバーウィーク連休初日）
  '2026-09-22', // 国民の休日（火曜、シルバーウィーク連休中日）
  '2026-09-23', // 秋分の日（水曜、シルバーウィーク連休最終日）
  '2026-10-12', // スポーツの日（月曜、単独休日）
  '2026-11-03', // 文化の日（火曜、単独休日）
  '2026-11-23'  // 勤労感謝の日（月曜、単独休日）
];

// Export for testing (ES modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { plans: window.plans, commonRental: window.commonRental, holidays: window.holidays };
}