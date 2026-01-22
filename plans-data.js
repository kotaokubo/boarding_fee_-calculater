// Plans data separated for easier maintenance and potential future replacement with external JSON.
// New structure: Each plan contains basePrice (per-person pricing), charter (minimum pricing), rental, and note.
const plans = {
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
      "holiday": { "minPeople": 12, "minPrice": 81600 },
      "sunday": { "minPeople":  10, "minPrice": 68000 }
    },
    "rental": { "ビシセット": { "price": 2200, "refund": 2100 } },
    "note": "コマセ・イカ短・アオイソ・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
   "午前キス・カサゴ": {
    "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 54400 },
      "holiday": { "minPeople": 15, "minPrice": 102000 },
      "sunday": { "minPeople": 12, "minPrice": 81600 }
    },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "午後キス・カサゴ": {
    "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 54400 },
      "holiday": { "minPeople": 12, "minPrice": 81600 },
      "sunday": { "minPeople": 10, "minPrice": 68000 }
    },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "午前マダコ": {
    "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 54400 },
      "holiday": { "minPeople": 15, "minPrice": 102000 },
      "sunday": { "minPeople": 12, "minPrice": 81600 }
    },
    "note": "氷付き",
    "visibleShared": false,
    "visibleCharter": false
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
      "holiday": { "minPeople": 12, "minPrice": 84000 },
      "sunday": { "minPeople": 10, "minPrice": 70000 }
    },
    "rental": { "ビシセット": { "price": 1800, "refund": 1700 } },
    "note": "アミコマセ・イカ短・付け餌・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "午前マゴチ": {
    "basePrice": { "men": 7000, "women": 5800, "student": 4300 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 56000 },
      "holiday": { "minPeople": 15, "minPrice": 105000 },
      "sunday": { "minPeople": 12, "minPrice": 84000 }
    },
    "note": "サイマキ５匹・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "午後マゴチ": {
    "basePrice": { "men": 7000, "women": 5800, "student": 4300 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 56000 },
      "holiday": { "minPeople": 12, "minPrice": 84000 },
      "sunday": { "minPeople":  10, "minPrice": 70000 }
    },
    "note": "サイマキ５匹・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "午前タチウオ": {
    "basePrice": { "men": 7000, "women": 5800, "student": 4300 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 56000 },
      "holiday": { "minPeople": 15, "minPrice": 105000 },
      "sunday": { "minPeople": 12, "minPrice": 84000 }
    },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  }, 
  "午前メバル": {
    "basePrice": { "men": 7000, "women": 5800, "student": 4300 },
    "note": "活きモエビ・アオイソメ・氷付き",
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 56000 },
      "holiday": { "minPeople": 15, "minPrice": 105000 },
      "sunday": { "minPeople": 12, "minPrice": 84000 }
    },
    "visibleShared": false,
    "visibleCharter": true
  },
  "午後エギイカ": {
    "basePrice": { "men": 6800, "women": 5500, "student": 3800 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 54400 },
      "holiday": { "minPeople": 12, "minPrice": 81600 },
      "sunday": { "minPeople": 10, "minPrice": 68000 }
    },
    "note": "氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "マダイ五目": {
    "basePrice": { "men": 11700, "women": 9700, "student": 7500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 93600 },
      "holiday": { "minPeople": 10, "minPrice": 117000 },
      "sunday": { "minPeople": 10, "minPrice": 117000 }
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
    "basePrice": { "men": 11700, "women": 9700, "student": 8000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice":  93600 },
      "holiday": { "minPeople": 12, "minPrice": 144000 },
      "sunday": { "minPeople": 12, "minPrice": 144000 }
    },
    "note": "アミコマセ・イカ短・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "ヤリ・スルメイカ": {
    "basePrice": { "men": 12000, "women": 10000, "student": 8000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 96000 },
      "holiday": { "minPeople": 12, "minPrice": 144000 },
      "sunday": { "minPeople": 12, "minPrice": 144000 }
    },
    "note": "氷付き、投入機あり",
    "visibleShared": false,
    "visibleCharter": true
  },
  "ヤリイカ": {
    "basePrice": { "men": 12000, "women": 10000, "student": 8000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 96000 },
      "holiday": { "minPeople": 12, "minPrice": 144000 },
      "sunday": { "minPeople": 12, "minPrice": 144000 }
    },
    "note": "氷付き、投入機あり",
    "visibleShared": true,
    "visibleCharter": true
  },
  "スルメイカ": {
    "basePrice": { "men": 12000, "women": 10000, "student": 8000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 96000 },
      "holiday": { "minPeople": 12, "minPrice": 144000 },
      "sunday": { "minPeople": 12, "minPrice": 144000 }
    },
    "note": "氷付き、投入機あり",
    "visibleShared": false,
    "visibleCharter": true
  },
  "ワラサ": {
    "basePrice": { "men": 12000, "women": 10000, "student": 9500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 96000 },
      "holiday": { "minPeople": 10, "minPrice": 120000 },
      "sunday": { "minPeople": 10, "minPrice": 120000 }
    },
    "rental": { 
      "竿（手巻き）": 1200,
      "竿（電動リール）": 2200
    },
    "note": "オキアミ規定量・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "タチアジリレー": {
    "basePrice": { "men": 11000, "women": 9000, "student": 7000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 88000 },
      "holiday": { "minPeople": 10, "minPrice": 110000 },
      "sunday": { "minPeople": 10, "minPrice": 110000 }
    },
    "rental": { 
      "竿（手巻き）": 1200,
      "竿（電動リール）": 2200
    },
    "note": "餌・ミンチ・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "タチウオのみ": {
    "basePrice": { "men": 10300, "women": 8300, "student": 6500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 82400 },
      "holiday": { "minPeople": 10, "minPrice": 103000 },
      "sunday": { "minPeople": 10, "minPrice": 103000 }
    },
    "rental": { 
      "竿（手巻き）": 1200,
      "竿（電動リール）": 2200
    },
    "note": "餌・ミンチ・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "遠征ウィリー五目": {
    "basePrice": { "men": 12000, "women": 10000, "student": 8000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 96000 },
      "holiday": { "minPeople": 12, "minPrice": 144000 },
      "sunday": { "minPeople": 12, "minPrice": 144000 }
    },
    "note": "アミコマセ・付け餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "カワハギ": {
    "basePrice": { "men": 11000, "women": 9000, "student": 7000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 88000 },
      "holiday": { "minPeople": 10, "minPrice": 110000 },
      "sunday": { "minPeople": 10, "minPrice": 110000 }
    },
    "rental": { 
      "竿（専用竿）": 1500
    },
    "note": "アサリ餌・氷付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "マゴチ": {
    "basePrice": { "men": 10700, "women": 8700, "student": 6500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 85600 },
      "holiday": { "minPeople": 10, "minPrice": 107000 },
      "sunday": { "minPeople": 10, "minPrice": 107000 }
    },
    "rental": { 
      "竿（専用竿）": 1500
    },
    "note": "サイマキ餌5匹付き",
    "visibleShared": true,
    "visibleCharter": true
  },
  "スミイカ": {
    "basePrice": { "men": 11000, "women": 9000, "student": 6500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 88000 },
      "holiday": { "minPeople": 10, "minPrice": 110000 },
      "sunday": { "minPeople": 10, "minPrice": 110000 }
    },
    "note": "シャコ餌付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "テンヤタチウオ": {
    "basePrice": { "men": 9700, "women": 7700, "student": 6500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 77600 },
      "holiday": { "minPeople": 10, "minPrice": 97000 },
      "sunday": { "minPeople": 10, "minPrice": 97000 }
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
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 80000 },
      "holiday": { "minPeople": 10, "minPrice": 100000 },
      "sunday": { "minPeople": 10, "minPrice": 100000 }
    },
    "note": "カニ餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "ショートメバル": {
    "basePrice": { "men": 7500, "women": 6000, "student": 4300 },
    "note": "活きモエビ・アオイソメ・氷付き",
    "charter": {
      "weekday": { "minPeople": 7, "minPrice": 52500 },
      "holiday": { "minPeople": 10, "minPrice": 75000 },
      "sunday": { "minPeople": 10, "minPrice": 75000 }
    },
    "visibleShared": false,
    "visibleCharter": true
  },
  "鬼カサゴ": {
    "basePrice": { "men": 11500, "women": 8500, "student": 8000 },
    "note": "サバ餌・氷付き",
    "visibleShared": false,
    "visibleCharter": false
  },
  "深場五目": {
    "basePrice": { "men": 12500, "women": 10500, "student": 8500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 96000 },
      "holiday": { "minPeople": 10, "minPrice": 125000 },
      "sunday": { "minPeople": 10, "minPrice": 125000 }
    },
    "note": "サバ餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "キス＆アナゴリレー": {
    "basePrice": { "men": 11000, "women": 9000, "student": 7500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 88000 },
      "holiday": { "minPeople": 10, "minPrice": 110000 },
      "sunday": { "minPeople": 10, "minPrice": 110000 }
    },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "夜アナゴ": {
    "basePrice": { "men": 8000, "women": 6000, "student": 5000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 64000 },
      "holiday": { "minPeople": 10, "minPrice": 80000 },
      "sunday": { "minPeople": 10, "minPrice": 80000 }
    },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "夜アジ＆カサゴリレー": {
    "basePrice": { "men": 8000, "women": 6000, "student": 5000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 64000 },
      "holiday": { "minPeople": 10, "minPrice": 80000 },
      "sunday": { "minPeople": 10, "minPrice": 80000 }
    },
    "note": "コマセ・餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "夜カサゴ＆メバル": {
    "basePrice": { "men": 7000, "women": 5500, "student": 4500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 56000 },
      "holiday": { "minPeople": 10, "minPrice": 70000 },
      "sunday": { "minPeople": 10, "minPrice": 70000 }
    },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "一日アミ五目": {
    "basePrice": { "men": 11500, "women": 9500, "student": 7000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 92000 },
      "holiday": { "minPeople": 10, "minPrice": 115000 },
      "sunday": { "minPeople": 10, "minPrice": 115000 }
    },
    "note": "アミコマセ２ブロック・オキアミ・氷付・追加１ブロック５００円",
    "visibleShared": false,
    "visibleCharter": true
  },
  "タチアミ五目": {
    "basePrice": { "men": 11500, "women": 9500, "student": 7500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 92000 },
      "holiday": { "minPeople": 10, "minPrice": 115000 },
      "sunday": { "minPeople": 10, "minPrice": 115000 }
    },
    "note": "餌・ミンチ・アミコマセ・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "一日ＬＴアジ": {
    "basePrice": { "men": 9500, "women": 7500, "student": 6500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 76000 },
      "holiday": { "minPeople": 10, "minPrice": 98000 },
      "sunday": { "minPeople": 10, "minPrice": 98000 }
    },
    "note": "コマセ・イカ短・アオイソ・氷付き（ビシアジ＋500円）",
    "visibleShared": false,
    "visibleCharter": true
  },
  "キス・カサゴなど": {
    "basePrice": { "men": 9000, "women": 7000, "student": 6000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 72000 },
      "holiday": { "minPeople": 10, "minPrice": 93000 },
      "sunday": { "minPeople": 10, "minPrice": 93000 }
    },
    "note": "アオイソ・餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "LTアジ（からリレー）キス・イシモチ・カサゴ・タコ": {
    "basePrice": { "men": 10500, "women": 8000, "student": 6500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 84000 },
      "holiday": { "minPeople": 10, "minPrice": 105000 },
      "sunday": { "minPeople": 10, "minPrice": 105000 }
    },
    "note": "コマセ・イカ短・アオイソ・氷付き（ビシアジ＋500円）\n LTアジ後にキス・イシモチ・カサゴ・タコのどれかを楽しめます。",
    "visibleShared": false,
    "visibleCharter": true
  },
  "カワハギ～アミ五目": {
    "basePrice": { "men": 12000, "women": 9500, "student": 7500 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 92000 },
      "holiday": { "minPeople": 10, "minPrice": 120000 },
      "sunday": { "minPeople": 10, "minPrice": 120000 }
    },
    "note": "アミコマセ・付け餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
  "トラフグ": {
    "basePrice": { "men": 11500, "women": 9500, "student": 8000 },
    "charter": {
      "weekday": { "minPeople": 8, "minPrice": 92000 },
      "holiday": { "minPeople": 12, "minPrice": 138000 },
      "sunday": { "minPeople": 12, "minPrice": 138000 }
    },
    "note": "餌・氷付き",
    "visibleShared": false,
    "visibleCharter": true
  },
};

const commonRental = {
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
const holidays = [
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

// Export as ES modules
export { plans, commonRental, holidays };

// Also set on window for backward compatibility (browser)
if (typeof window !== 'undefined') {
  window.plans = plans;
  window.commonRental = commonRental;
  window.holidays = holidays;
}

// CommonJS export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { plans, commonRental, holidays };
}