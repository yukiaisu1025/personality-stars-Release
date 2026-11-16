/* Personality Stars - world.js : 広大な島の生成 (地形・バイオーム・村・道・植生・衝突)  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const W = PS.World = {};
  // 世界の大きさは章によって変わる（第一章: 3072m四方 / 第二章: 4608m四方）。旧エリアの地形・配置は完全に同一に保つ。
  const CELL = 3, CH = 32, VCELL = 256, NRW = 14, OLD_SIZE = 3072, OLD_HALF = 1536, S2 = 4608, E2 = 2304;
  let SIZE = 3072, HALF = 1536, N = 1024, VN = N + 1, NCH = N / CH, NVC = SIZE / VCELL;
  const C3 = (h) => PS.hexRGB(h);

  W.REG = [
    { key: 'plains', name: '星風平原', en: 'STARWIND PLAINS', c: [0, 140], lv: [1, 7], A: 60, bgm: 'plains', base: 0 },
    { key: 'forest', name: '翠樹の森', en: 'EMERALD FOREST', c: [830, 60], lv: [8, 17], A: 110, bgm: 'forest', base: 1 },
    { key: 'desert', name: '陽炎砂漠', en: 'MIRAGE DESERT', c: [40, 930], lv: [18, 27], A: 90, bgm: 'desert', base: 2 },
    { key: 'snow', name: '白銀氷原', en: 'SILVER TUNDRA', c: [-40, -870], lv: [28, 38], A: 300, bgm: 'snow', base: 3 },
    { key: 'volcano', name: '紅蓮火山', en: 'CRIMSON VOLCANO', c: [-860, 60], lv: [40, 50], A: 220, bgm: 'volcano', base: 4 },
    // ---- 第二章で浮上する新エリア ----
    { key: 'highland', name: '平原超山', en: 'SKYREACH HIGHLANDS', c: [1680, 60], R: 540, lv: [60, 68], bgm: 'highland', base: 0, ch2: true },
    { key: 'arid', name: '乾燥砂漠', en: 'ARID WASTES', c: [80, 1690], R: 520, lv: [66, 74], bgm: 'arid', base: 2, ch2: true },
    { key: 'aurora', name: '極光雪原', en: 'AURORA SNOWFIELD', c: [-120, -1690], R: 520, lv: [72, 80], bgm: 'aurora', base: 3, ch2: true },
    { key: 'lava', name: '溶岩火山', en: 'MOLTEN CALDERA', c: [-1690, -60], R: 540, lv: [78, 88], bgm: 'magma', base: 4, ch2: true },
    // ---- 第三章：異界の大地（島の四隅） ----
    { key: 'frostfire', name: '氷炎の境地', en: 'FROSTFIRE EXPANSE', c: [-1250, -1250], R: 560, lv: [90, 96], bgm: 'frostfire', base: 3, ch3: true },
    { key: 'jungle', name: '霧氷の密林', en: 'RIMEFROST JUNGLE', c: [1250, -1250], R: 560, lv: [88, 94], bgm: 'jungle', base: 1, ch3: true },
    { key: 'savanna', name: '黄昏サバンナ', en: 'TWILIGHT SAVANNA', c: [-1250, 1250], R: 560, lv: [86, 92], bgm: 'savanna', base: 2, ch3: true },
    { key: 'cloudsea', name: '雲海高原', en: 'CLOUDSEA PLATEAU', c: [1380, 1020], R: 430, lv: [92, 98], bgm: 'cloudsea', base: 0, ch3: true },
    { key: 'beach', name: '星砂の浜', en: 'STARSAND SHORE', c: [1060, 1440], R: 420, lv: [86, 92], bgm: 'beach', base: 0, ch3: true },
    // ---- 第五章：凍てついた外洋（氷の道がつなぐ世界） ----
    { key: 'icesea', name: '氷結の大海', en: 'FROZEN EXPANSE', c: [0, 0], R: 2600, lv: [98, 104], bgm: 'icesea', base: 3, ch5: true },
    { key: 'glacier', name: '蒼氷の氷河', en: 'AZURE GLACIERS', c: [0, 0], R: 2600, lv: [103, 108], bgm: 'aurora', base: 3, ch5: true },
    { key: 'icecity', name: '氷の住む街', en: 'CITY OF ICE', c: [2000, -2000], R: 300, lv: [100, 103], bgm: 'icecity', base: 3, ch5: true }
  ];
  // 第五章：氷河（南西・南東の氷河と、北西の氷の城塞）
  const GLAC = W.GLAC = [{ x: -2250, z: 2250, R: 330, A: 150 }, { x: 2250, z: 2250, R: 330, A: 150 }, { x: -2130, z: -2130, R: 520, A: 120, peak: true }];
  const ICECITY = W.ICECITY = { x: 2000, z: -2000 };
  W.baseReg = (k) => (W.REG[k] ? W.REG[k].base : 0);
  const VOLC = W.VOLC = [-880, 40], PEAK = W.PEAK = [560, -600], OASIS = W.OASIS = [300, 1010];
  const VOLC2 = W.VOLC2 = [-1800, -100], PEAK2 = W.PEAK2 = [1820, -60];
  const VOLC3 = W.VOLC3 = [-1360, -1180], PEAK3 = W.PEAK3 = [1460, 900];
  W.START = { x: -30, z: 395 };
  const ALL_VILLAGES = [
    { id: 0, name: 'スターリーフ村', reg: 0, x: 40, z: 255, style: 'plains' },
    { id: 1, name: 'モリノハ集落', reg: 1, x: 760, z: 245, style: 'forest' },
    { id: 2, name: 'オアシス都市サンドリア', reg: 2, x: 170, z: 945, style: 'desert' },
    { id: 3, name: '雪の里フロストヘイム', reg: 3, x: -130, z: -700, style: 'snow' },
    { id: 4, name: 'ボルカ前哨基地', reg: 4, x: -560, z: 250, style: 'volcano' },
    { id: 5, name: '天嶺の里 ハイランド', reg: 5, x: 1610, z: 330, style: 'plains', ch2: true },
    { id: 6, name: '岩窟都市 カラバン', reg: 6, x: -40, z: 1700, style: 'desert', ch2: true },
    { id: 7, name: '極光の村 ノルドリヒト', reg: 7, x: 70, z: -1700, style: 'snow', ch2: true },
    { id: 8, name: '溶岩の砦 マグマリア', reg: 8, x: -1590, z: 300, style: 'volcano', ch2: true },
    { id: 9, name: '氷炎の集落 フロストフレア', reg: 9, x: -1050, z: -1350, style: 'frost', ch3: true },
    { id: 10, name: '樹氷の里 ミストリーフ', reg: 10, x: 1100, z: -1160, style: 'jungle', ch3: true },
    { id: 11, name: 'サバンナの町 レオニア', reg: 11, x: -1120, z: 1130, style: 'savanna', ch3: true },
    { id: 12, name: '雲上の町 ニンバリア', reg: 12, x: 1230, z: 1060, style: 'cloud', ch3: true },
    { id: 13, name: '星砂の港 マリンベル', reg: 13, x: 980, z: 1420, style: 'beach', ch3: true },
    { id: 14, name: '氷上の宿場 アイスロード', reg: 14, x: 1960, z: 1960, style: 'snow', ch5: true },
    { id: 15, name: '氷河の野営地 グレイシア', reg: 15, x: -1960, z: 1960, style: 'frost', ch5: true },
    { id: 16, name: '氷の住む街 フロスティア', reg: 16, x: 2000, z: -2000, style: 'ice', ch5: true }
  ];
  // 第五章：氷晶の祠（氷晶の番人が守る）と、タイプドラゴンの棲む氷の城塞
  W.ALTARS5 = [
    { id: 0, x: -150, z: 2400, name: '南の氷晶の祠', color: '#7fd8ff' },
    { id: 1, x: 2400, z: 380, name: '東の氷晶の祠', color: '#9fe6ff' },
    { id: 2, x: -2400, z: -380, name: '西の氷晶の祠', color: '#bfefff' },
    { id: 3, x: 2290, z: 2290, name: '南東の氷河の祠', color: '#7fb8ff' },
    { id: 4, x: -2290, z: 2290, name: '南西の氷河の祠', color: '#a8c8ff' }
  ];
  W.SUMMIT5 = { x: -2130, z: -2130, lv: 110, name: '氷の城塞', boss: 'typedragon' };
  // 第三章：結晶の祭壇（強化ボス）と虚晶の玉座
  W.SHRINES = [
    { id: 0, reg: 9, x: -1520, z: -1470, boss: 'glacignis', lv: 95, name: '氷炎の祭壇', color: '#ff9a5a' },
    { id: 1, reg: 10, x: 1470, z: -1420, boss: 'yggdra', lv: 94, name: '霧氷樹の祭壇', color: '#bff6ff' },
    { id: 2, reg: 11, x: -1460, z: 1380, boss: 'regulus', lv: 93, name: '夕陽の祭壇', color: '#ffc84a' },
    { id: 3, reg: 12, x: 1640, z: 1160, boss: 'nimbus', lv: 97, name: '雲海の祭壇', color: '#c38cff' },
    { id: 4, reg: 13, x: 1240, z: 1640, boss: 'siren', lv: 96, name: '潮騒の祭壇', color: '#4fb4ff' }
  ];
  const ALL_DUNGEONS = [
    { id: 0, name: '風の古塔', reg: 0, x: -310, z: -40, lv: 8, boss: 'galeKnight', theme: 'wind', size: [4, 4] },
    { id: 1, name: '深緑の迷宮', reg: 1, x: 990, z: -130, lv: 18, boss: 'elderTreant', theme: 'forest', size: [5, 4] },
    { id: 2, name: '砂塵の地下墓所', reg: 2, x: -190, z: 1060, lv: 28, boss: 'scorpius', theme: 'sand', size: [5, 5] },
    { id: 3, name: '氷晶の神殿', reg: 3, x: 220, z: -1000, lv: 38, boss: 'glacies', theme: 'ice', size: [6, 5] },
    { id: 4, name: '灼熱の溶岩窟', reg: 4, x: -760, z: -270, lv: 50, boss: 'ignis', theme: 'lava', size: [6, 6] },
    // ---- 第二章：星界の遺跡（長編・高難易度） ----
    { id: 5, name: '天空回廊', reg: 5, x: 1990, z: 330, lv: 62, boss: 'archangel', theme: 'sky', size: [5, 4], ch2: true, abil: ['wing'] },
    { id: 6, name: '蜃気楼の大空洞', reg: 6, x: 300, z: 1900, lv: 70, boss: 'mirage', theme: 'mirage', size: [5, 4], ch2: true, abil: ['jump'] },
    { id: 7, name: '霧氷の地下洞', reg: 7, x: -360, z: -1890, lv: 78, boss: 'fenrir', theme: 'aurora', size: [5, 5], ch2: true, abil: ['wing'] },
    { id: 8, name: '獄炎の坑道', reg: 8, x: -1900, z: -420, lv: 84, boss: 'volcanix', theme: 'inferno', size: [6, 4], ch2: true, abil: ['jump', 'wing'] },
    { id: 9, name: '星見山の隠し洞窟', reg: 3, x: 790, z: -840, lv: 74, boss: 'stellagolem', theme: 'starcave', size: [5, 4], ch2: true, abil: ['jump'], hidden: true, cave: true },
    { id: 10, name: '翠樹の根の洞', reg: 1, x: 1000, z: 320, lv: 66, boss: 'dryad', theme: 'roots', size: [5, 4], ch2: true, abil: ['wing'], hidden: true, cave: true }
  ];
  W.SUMMIT = { x: 560, z: -600, lv: 58, name: '星見山の頂' };
  W.SUMMIT2 = { x: PEAK2[0], z: PEAK2[1], lv: 92, name: '天穹山の頂', boss: 'astral' };
  W.SUMMIT3 = { x: PEAK3[0], z: PEAK3[1], lv: 100, name: '虚晶の玉座', boss: 'crystalion' };
  const ALL_WP = [
    { id: 'w_start', name: '始まりの丘', x: -45, z: 405 },
    { id: 'w_v0', name: 'スターリーフ村', x: 64, z: 236 },
    { id: 'w_mill', name: '風車の丘', x: -170, z: 175 },
    { id: 'w_d0', name: '風の古塔 前', x: -296, z: -18 },
    { id: 'w_v1', name: 'モリノハ集落', x: 784, z: 228 },
    { id: 'w_lake', name: '森の湖畔', x: 610, z: -110 },
    { id: 'w_d1', name: '深緑の迷宮 前', x: 970, z: -110 },
    { id: 'w_v2', name: 'サンドリア', x: 196, z: 928 },
    { id: 'w_ruin', name: '砂の遺跡', x: 380, z: 700 },
    { id: 'w_d2', name: '砂塵の地下墓所 前', x: -170, z: 1040 },
    { id: 'w_v3', name: 'フロストヘイム', x: -104, z: -682 },
    { id: 'w_pass', name: '凍てつく峠', x: -380, z: -470 },
    { id: 'w_d3', name: '氷晶の神殿 前', x: 205, z: -980 },
    { id: 'w_v4', name: 'ボルカ前哨基地', x: -536, z: 268 },
    { id: 'w_rim', name: '火口の縁', x: -880, z: 210 },
    { id: 'w_d4', name: '灼熱の溶岩窟 前', x: -742, z: -250 },
    { id: 'w_peak', name: '星見山 登山口', x: 470, z: -420 },
    // ---- 第二章 ----
    { id: 'w_v5', name: 'ハイランド', x: 1634, z: 312, ch2: true },
    { id: 'w_d5', name: '天空回廊 前', x: 1976, z: 352, ch2: true },
    { id: 'w_peak2', name: '天穹山 中腹', x: 1760, z: 132, ch2: true },
    { id: 'w_v6', name: 'カラバン', x: -16, z: 1682, ch2: true },
    { id: 'w_d6', name: '蜃気楼の大空洞 前', x: 284, z: 1878, ch2: true },
    { id: 'w_mesa', name: '赤岩の台地', x: 250, z: 1560, ch2: true },
    { id: 'w_v7', name: 'ノルドリヒト', x: 94, z: -1682, ch2: true },
    { id: 'w_d7', name: '霧氷の地下洞 前', x: -342, z: -1868, ch2: true },
    { id: 'w_aur', name: '極光の丘', x: -270, z: -1560, ch2: true },
    { id: 'w_v8', name: 'マグマリア', x: -1566, z: 282, ch2: true },
    { id: 'w_d8', name: '獄炎の坑道 前', x: -1880, z: -398, ch2: true },
    { id: 'w_cal', name: '大火口の縁', x: -1660, z: -40, ch2: true },
    // ---- 第三章 ----
    { id: 'w_v9', name: 'フロストフレア', x: -1026, z: -1368, ch3: true },
    { id: 'w_s0', name: '氷炎の祭壇 前', x: -1480, z: -1440, ch3: true },
    { id: 'w_v10', name: 'ミストリーフ', x: 1124, z: -1178, ch3: true },
    { id: 'w_s1', name: '霧氷樹の祭壇 前', x: 1430, z: -1392, ch3: true },
    { id: 'w_v11', name: 'レオニア', x: -1096, z: 1112, ch3: true },
    { id: 'w_s2', name: '夕陽の祭壇 前', x: -1420, z: 1352, ch3: true },
    { id: 'w_v12', name: 'ニンバリア', x: 1254, z: 1042, ch3: true },
    { id: 'w_s3', name: '雲海の祭壇 前', x: 1600, z: 1132, ch3: true },
    { id: 'w_throne', name: '虚晶の玉座 中腹', x: 1560, z: 960, ch3: true },
    { id: 'w_v13', name: 'マリンベル', x: 1004, z: 1402, ch3: true },
    { id: 'w_s4', name: '潮騒の祭壇 前', x: 1210, z: 1610, ch3: true },
    // ---- 第五章 ----
    { id: 'w_v16', name: 'フロスティア', x: 2024, z: -1982, ch5: true },
    { id: 'w_v14', name: 'アイスロード', x: 1984, z: 1942, ch5: true },
    { id: 'w_v15', name: 'グレイシア', x: -1936, z: 1942, ch5: true },
    { id: 'w_a0', name: '南の氷晶の祠 前', x: -150, z: 2370, ch5: true },
    { id: 'w_a1', name: '東の氷晶の祠 前', x: 2370, z: 380, ch5: true },
    { id: 'w_a2', name: '西の氷晶の祠 前', x: -2370, z: -380, ch5: true },
    { id: 'w_cit', name: '氷の城塞 ふもと', x: -1820, z: -1820, ch5: true }
  ];
  W.ROADS = [
    [[-30, 395], [10, 330], [40, 255], [-60, 210], [-170, 175], [-260, 70], [-310, -40]],
    [[40, 255], [230, 240], [420, 210], [600, 250], [760, 245], [880, 60], [990, -130]],
    [[40, 255], [80, 420], [120, 620], [150, 800], [170, 945], [20, 1010], [-190, 1060]],
    [[40, 255], [-20, 60], [-60, -200], [-100, -470], [-130, -700], [30, -860], [220, -1000]],
    [[40, 255], [-150, 280], [-350, 270], [-560, 250], [-660, 30], [-760, -270]],
    [[760, 245], [680, -40], [610, -110], [530, -300], [470, -420]],
    [[-130, -700], [80, -560], [300, -460], [470, -420]],
    [[170, 945], [380, 700], [400, 470], [230, 240]]
  ];
  const ROADS2 = [
    [[1360, 250], [1610, 330], [1990, 330]], [[1610, 330], [1700, 220], [1760, 132]],
    [[60, 1430], [-40, 1700], [300, 1900]], [[-40, 1700], [250, 1560]],
    [[-60, -1430], [70, -1700], [-360, -1890]], [[70, -1700], [-270, -1560]],
    [[-1390, 280], [-1590, 300], [-1700, 20], [-1900, -420]]
  ];
  const ROADS3 = [
    [[-1050, -1350], [-1300, -1430], [-1520, -1470]], [[-1050, -1350], [-900, -1110]],
    [[1100, -1160], [1300, -1300], [1470, -1420]], [[1100, -1160], [930, -1000]],
    [[-1120, 1130], [-1300, 1270], [-1460, 1380]], [[-1120, 1130], [-950, 980]],
    [[1230, 1060], [1450, 1120], [1640, 1160]], [[1230, 1060], [1100, 1250], [980, 1420]], [[980, 1420], [1120, 1560], [1240, 1640]], [[1230, 1060], [1060, 900]]
  ];
  // 第五章：氷の道（凍った外洋をぐるりとつなぐ）
  const ROADS5 = [
    [[2000, -2000], [2400, -1300], [2400, -640], [2400, 380], [2300, 1300], [1960, 1960]],
    [[1960, 1960], [1300, 2380], [600, 2400], [-150, 2400], [-1000, 2400], [-1960, 1960]],
    [[-1960, 1960], [-2400, 1200], [-2400, 380], [-2400, -380], [-2380, -1100], [-1820, -1820]],
    [[-1820, -1820], [-1100, -2400], [-300, -2400], [600, -2400], [1300, -2400], [2000, -2000]]
  ];
  // level: 0 = 第一章 / 1 = 第二章（四方に拡大）/ 2 = 第三章（四隅も埋まり大陸に）/ 3 = 第五章（外洋が凍り、さらに外へ広がる）
  W.configure = function (level) {
    level = level === true ? 1 : (level | 0);
    const expanded = level >= 1, c3 = level >= 2, c5 = level >= 3;
    W.level = level; W.expanded = expanded; W.ch3 = c3; W.ch5 = c5;
    SIZE = c5 ? 5376 : expanded ? 4608 : 3072; HALF = SIZE / 2; N = SIZE / CELL; VN = N + 1; NCH = N / CH; NVC = SIZE / VCELL;
    Object.assign(W, { SIZE, HALF, CELL, VN, NCH, NVC, VCELL, NRW, SEA: 0 });
    const ok = (o) => (!o.ch2 || expanded) && (!o.ch3 || c3) && (!o.ch5 || c5);
    W.VILLAGES = ALL_VILLAGES.filter(ok);
    W.ALL_VILLAGES_RAW = ALL_VILLAGES;
    W.DUNGEONS = ALL_DUNGEONS.filter(ok);
    W.WAYPOINTS = ALL_WP.filter(ok);
    W.ROADS2 = expanded ? ROADS2 : [];
    W.ROADS3 = c3 ? ROADS3 : [];
    W.ROADS5 = c5 ? ROADS5 : [];
    W.ALL_REG = c5 ? 17 : c3 ? 14 : expanded ? 9 : 5;
  };
  W.configure(false);

  // ---------------- 生成 ----------------
  W.gen = function* (seed) {
    const EXP = W.expanded, EXP3 = W.ch3, EXP5 = W.ch5;
    const nz = PS.Noise(seed), nz2 = PS.Noise(seed + 11), nz3 = PS.Noise(seed + 23);
    W.nz = nz;
    const H = W.H = new Float32Array(VN * VN), RG = W.RG = new Uint8Array(VN * VN), RW = W.RW = new Uint8Array(VN * VN * NRW);
    const REG = W.REG, tw = new Float32Array(5), ds = new Float32Array(5);
    const crRad = 125, rimH = 400 * Math.pow(1 - crRad / 640, 1.8);
    const cr2 = 110, rim2 = 330 * Math.pow(1 - cr2 / 430, 1.7);
    // 第二章エリアの候補高さ（旧エリアの海だった場所にだけ適用する）
    const HN = EXP ? new Float32Array(VN * VN).fill(-999) : null, RN = EXP ? new Uint8Array(VN * VN) : null, TN = EXP ? new Uint8Array(VN * VN) : null;
    // 第三章：異界の大地の候補（マスク・主地域・隣の地域とその重み）
    const M3 = EXP3 ? new Float32Array(VN * VN) : null, RN3 = EXP3 ? new Uint8Array(VN * VN) : null, RB3 = EXP3 ? new Uint8Array(VN * VN) : null, WB3 = EXP3 ? new Uint8Array(VN * VN) : null;
    const cr3 = 115, rim3 = 300 * Math.pow(1 - cr3 / 400, 1.7);
    function regionH(k, x, z) {
      switch (k) {
        case 0: { let h = 12 + nz.fbm(x * 0.0022, z * 0.0022, 4) * 20; h += Math.max(0, nz.ridged(x * 0.003 + 11, z * 0.003, 3) - 0.6) * 70; h += PS.smooth(0.5, 0.58, nz3.n2(x * 0.0042, z * 0.0042)) * 18; return h; }
        case 1: return 22 + nz.fbm(x * 0.003 + 5, z * 0.003, 5) * 32 + nz.ridged(x * 0.006, z * 0.006, 3) * 16;
        case 2: { const a = nz3.n2(x * 0.0035, z * 0.0035) * 3; let h = 8 + nz.fbm(x * 0.002, z * 0.002, 3) * 8 + Math.pow(1 - Math.abs(Math.sin(x * 0.022 + z * 0.009 + a)), 2.4) * 15 * (0.6 + 0.4 * nz.n2(x * 0.002, z * 0.002)); h += PS.smooth(0.55, 0.6, nz3.n2(x * 0.004 + 77, z * 0.004 - 31)) * 34; return h; }
        case 3: { const r = nz.ridged(x * 0.0024 + 9, z * 0.0024, 6); return 42 + nz.fbm(x * 0.003, z * 0.003, 4) * 24 + Math.pow(r, 2.4) * 330; }
        case 4: return 30 + nz.fbm(x * 0.003 - 7, z * 0.003, 5) * 40 + nz.ridged(x * 0.005, z * 0.005, 4) * 28;
        case 5: { // 平原超山：高原の草地と、天を突く天穹山
          let h = 34 + nz.fbm(x * 0.0022 + 3, z * 0.0022, 4) * 22 + Math.max(0, nz.ridged(x * 0.003 - 5, z * 0.003, 3) - 0.55) * 90;
          const dp = Math.hypot(x - PEAK2[0], z - PEAK2[1]); if (dp < 430) { const t = 1 - dp / 430; h += 620 * Math.pow(t, 1.9) + nz2.ridged(x * 0.012, z * 0.012, 3) * 36 * t; }
          return h;
        }
        case 6: { // 乾燥砂漠：赤い台地（メサ）と涸れ谷
          let h = 10 + nz.fbm(x * 0.0025, z * 0.0025, 3) * 10; const m = nz3.n2(x * 0.0045 + 21, z * 0.0045 - 9);
          h += PS.smooth(0.16, 0.22, m) * 40 + PS.smooth(0.42, 0.46, m) * 26 + Math.pow(1 - Math.abs(Math.sin(x * 0.018 - z * 0.011)), 3) * 7;
          return h;
        }
        case 7: { const r = nz.ridged(x * 0.0028 - 13, z * 0.0028 + 7, 5); return 46 + nz.fbm(x * 0.003 + 9, z * 0.003, 4) * 26 + Math.pow(r, 2.6) * 240; } // 極光雪原
        case 9: { // 氷炎の境地：雪をかぶった火山と、溶岩の裂け目
          let h = 40 + nz.fbm(x * 0.003 + 17, z * 0.003, 5) * 34 + nz.ridged(x * 0.005 + 3, z * 0.005, 4) * 30;
          const dv = Math.hypot(x - VOLC3[0], z - VOLC3[1]); if (dv < 400) h += dv < cr3 ? PS.lerp(rim3 - 100, rim3, Math.pow(dv / cr3, 2)) : 300 * Math.pow(1 - dv / 400, 1.7);
          return h;
        }
        case 10: return 24 + nz.fbm(x * 0.0032 + 29, z * 0.0032, 5) * 36 + nz.ridged(x * 0.0065 - 11, z * 0.0065, 3) * 22; // 霧氷の密林
        case 11: { // 黄昏サバンナ：平らな草原と岩山
          let h = 9 + nz.fbm(x * 0.0022 - 31, z * 0.0022, 3) * 9; const k2 = nz3.n2(x * 0.006 + 41, z * 0.006 - 13);
          return h + PS.smooth(0.45, 0.62, k2) * 30 * (0.6 + 0.4 * nz.ridged(x * 0.03, z * 0.03, 2));
        }
        case 12: { // 雲海高原：高い台地と、虚晶の玉座の峰
          let h = 70 + nz.fbm(x * 0.0025 + 51, z * 0.0025, 4) * 22 + PS.smooth(0.3, 0.5, nz3.n2(x * 0.004 + 9, z * 0.004 + 9)) * 26;
          const dp = Math.hypot(x - PEAK3[0], z - PEAK3[1]); if (dp < 360) { const t = 1 - dp / 360; h += 300 * Math.pow(t, 1.8) + nz2.ridged(x * 0.012, z * 0.012, 3) * 24 * t; }
          return h;
        }
        case 13: { // 星砂の浜：低い砂丘と潟
          const h = 4.5 + nz.fbm(x * 0.004 + 61, z * 0.004, 3) * 4 + Math.pow(1 - Math.abs(Math.sin(x * 0.03 + z * 0.017)), 3) * 2.5;
          return h - PS.smooth(0.35, 0.55, nz3.n2(x * 0.005 - 23, z * 0.005 + 7)) * 9;
        }
        default: { // 溶岩火山：大火口
          let h = 34 + nz.fbm(x * 0.0032 + 11, z * 0.0032, 5) * 36 + nz.ridged(x * 0.006, z * 0.006, 4) * 30;
          const dv = Math.hypot(x - VOLC2[0], z - VOLC2[1]); if (dv < 430) h += dv < cr2 ? PS.lerp(rim2 - 110, rim2, Math.pow(dv / cr2, 2)) : 330 * Math.pow(1 - dv / 430, 1.7);
          return h;
        }
      }
    }
    for (let j = 0; j < VN; j++) {
      const z = j * CELL - HALF;
      for (let i = 0; i < VN; i++) {
        const x = i * CELL - HALF, idx = j * VN + i;
        const wx = x + nz.fbm(x * 0.0015, z * 0.0015, 3) * 170, wz = z + nz.fbm(x * 0.0015 + 40, z * 0.0015 - 17, 3) * 170;
        let d1 = 1e9, d2 = 1e9, r1 = 0, r2 = 0;
        for (let k = 0; k < 5; k++) { const d = Math.hypot(wx - REG[k].c[0], wz - REG[k].c[1]); ds[k] = d; if (d < d1) { d2 = d1; r2 = r1; d1 = d; r1 = k; } else if (d < d2) { d2 = d; r2 = k; } }
        let sw = 0; for (let k = 0; k < 5; k++) { tw[k] = Math.exp(-(ds[k] - d1) / 45); sw += tw[k]; }
        let h = 0; for (let k = 0; k < 5; k++) { tw[k] /= sw; if (tw[k] > 0.004) h += tw[k] * regionH(k, x, z); }
        const border = 1 - PS.smooth(0, 190, d2 - d1);
        if (border > 0.01) { const amp = (REG[r1].A + REG[r2].A) / 2, pass = PS.smooth(-0.35, 0.25, nz2.n2(x * 0.0028 + 3, z * 0.0028)); h += border * border * (0.35 + 0.65 * nz2.ridged(x * 0.004, z * 0.004, 4)) * amp * pass; }
        const dv = Math.hypot(x - VOLC[0], z - VOLC[1]);
        if (dv < 640) { let cone = dv < crRad ? PS.lerp(rimH - 125, rimH, Math.pow(dv / crRad, 2)) : 400 * Math.pow(1 - dv / 640, 1.8); h += cone * (1 + nz.n2(x * 0.02, z * 0.02) * 0.04); }
        const dp = Math.hypot(x - PEAK[0], z - PEAK[1]);
        if (dp < 560) { const t = 1 - dp / 560; h += 470 * Math.pow(t, 2.1) + nz2.ridged(x * 0.01, z * 0.01, 3) * 40 * t; }
        const dO = Math.hypot(x - OASIS[0], z - OASIS[1]); if (dO < 120) h = PS.lerp(h, -2.5, PS.smooth(120, 55, dO));
        const rw = (tw[0] + tw[1] + tw[3] * 0.5) * PS.smooth(-0.15, 0.2, nz3.n2(x * 0.0011 + 9, z * 0.0011 - 4));
        if (rw > 0.3) { const rv = Math.abs(nz2.n2(wx * 0.0017 + 50, wz * 0.0017)); if (rv < 0.05) { const a = PS.smooth(0.05, 0.015, rv) * PS.smooth(75, 35, h) * rw; h = PS.lerp(h, -3, a * 0.97); } }
        const dd = Math.hypot(x, z), ang = Math.atan2(z, x);
        const R = 1290 + nz3.fbm(Math.cos(ang) * 1.3 + 5, Math.sin(ang) * 1.3, 3) * 170 + nz3.n2(x * 0.004, z * 0.004) * 40;
        const sea = -30 + nz.n2(x * 0.01, z * 0.01) * 4;
        h = PS.lerp(sea, h, PS.smooth(R + 60, R - 170, dd));
        H[idx] = h; RG[idx] = r1;
        for (let k = 0; k < 5; k++) RW[idx * NRW + k] = Math.round(tw[k] * 255);
        // ---- 第二章：浮上する大地 ----
        if (EXP && dd > 880) {
          let best = -1, bm = 0;
          for (let k = 5; k < 9; k++) {
            const Rg = REG[k], ex = x - Rg.c[0], ez = z - Rg.c[1], dk = Math.hypot(ex, ez); if (dk > Rg.R + 640) continue;
            const a = Math.atan2(ez, ex), toward = Math.max(0, -(ex * Rg.c[0] + ez * Rg.c[1]) / ((dk || 1) * Math.hypot(Rg.c[0], Rg.c[1])));
            const lr = Rg.R + nz3.fbm(Math.cos(a) * 1.4 + k * 7.1, Math.sin(a) * 1.4 - k * 3.3, 3) * 90 + nz3.n2(x * 0.004 + k, z * 0.004) * 30 + 330 * Math.pow(toward, 1.5);
            const m = PS.smooth(lr + 60, lr - 170, dk); if (m > bm) { bm = m; best = k; }
          }
          if (best >= 0 && bm > 0.001) {
            const t = PS.smooth(R - 60, R + 260, dd), low = 1.8 + nz.n2(x * 0.02, z * 0.02) * 0.8;
            const edge = PS.smooth(E2 - 30, E2 - 240, Math.max(Math.abs(x), Math.abs(z)));
            HN[idx] = PS.lerp(sea, PS.lerp(low, regionH(best, x, z), t), bm * edge); RN[idx] = best; TN[idx] = Math.round(t * 255);
          }
        }
        // ---- 第三章：島の四隅に流れ着く異界の大地 ----
        if (EXP3 && dd > 1000) {
          let bm = 0, best = -1, sb = 1e9, b2 = -1, s2 = 1e9;
          for (let k = 9; k < 14; k++) {
            const Rg = REG[k], ex = x - Rg.c[0], ez = z - Rg.c[1], dk = Math.hypot(ex, ez); if (dk > Rg.R + 640) continue;
            const a = Math.atan2(ez, ex), toward = Math.max(0, -(ex * Rg.c[0] + ez * Rg.c[1]) / ((dk || 1) * Math.hypot(Rg.c[0], Rg.c[1])));
            const lr = Rg.R + nz3.fbm(Math.cos(a) * 1.4 + k * 5.3, Math.sin(a) * 1.4 - k * 2.9, 3) * 90 + nz3.n2(x * 0.004 - k, z * 0.004) * 30 + 300 * Math.pow(toward, 1.5);
            const m = PS.smooth(lr + 60, lr - 170, dk);
            if (m > bm) bm = m; const sc = dk / lr;
            if (sc < sb) { s2 = sb; b2 = best; sb = sc; best = k; } else if (sc < s2) { s2 = sc; b2 = k; }
          }
          // 大陸の外周（丸い形）までの海も、いちばん近い異界の地域で埋める
          const Rc = 1960 + nz3.fbm(Math.cos(ang) * 1.6 + 3, Math.sin(ang) * 1.6 - 7, 3) * 150 + nz3.n2(x * 0.004 + 50, z * 0.004) * 30;
          const mm = Math.max(bm, PS.smooth(Rc + 60, Rc - 160, dd));
          if (best >= 0 && mm > 0.001) {
            M3[idx] = mm * PS.smooth(E2 - 30, E2 - 240, Math.max(Math.abs(x), Math.abs(z))); RN3[idx] = best;
            if (b2 >= 0) { RB3[idx] = b2; WB3[idx] = Math.round(255 / (1 + Math.exp((s2 - sb) * 14))); }
          }
        }
      }
      if (j % 32 === 0) yield [0.04 + 0.34 * j / VN, EXP3 && j > VN * 0.5 ? '異界の大地を呼び寄せています' : EXP && j > VN * 0.5 ? '新たな大地を浮かび上がらせています' : '大地を形作っています'];
    }
    // 火口の溶岩面
    W.lavaLevel = W.heightRaw(VOLC[0], VOLC[1]) + 16;
    // 平坦化 (村・ダンジョン・ワープ)  guard: 第二章の地形変更で旧エリアを壊さない
    let GUARD = null;
    const flat = (x, z, r, t) => {
      const tgt = t != null ? t : Math.max(W.heightRaw(x, z), 4);
      const i0 = Math.max(0, Math.floor((x - r + HALF) / CELL)), i1 = Math.min(VN - 1, Math.ceil((x + r + HALF) / CELL));
      const j0 = Math.max(0, Math.floor((z - r + HALF) / CELL)), j1 = Math.min(VN - 1, Math.ceil((z + r + HALF) / CELL));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const q = j * VN + i; if (GUARD && GUARD[q]) continue; const d = Math.hypot(i * CELL - HALF - x, j * CELL - HALF - z); if (d < r) { const k = 1 - PS.smooth(r * 0.55, r, d); H[q] = PS.lerp(H[q], tgt, k); } }
      return tgt;
    };
    const oldV = W.VILLAGES.filter(v => !v.ch2 && !v.ch3 && !v.ch5), oldD = W.DUNGEONS.filter(d => !d.ch2), newV = W.VILLAGES.filter(v => v.ch2), newD = W.DUNGEONS.filter(d => d.ch2 && !d.cave);
    for (const v of oldV) v.y = flat(v.x, v.z, 85, Math.max(W.heightRaw(v.x, v.z), 6));
    for (const d of oldD) d.y = flat(d.x, d.z, 26);
    W.SUMMIT.y = flat(W.SUMMIT.x, W.SUMMIT.z, 48, W.heightRaw(W.SUMMIT.x, W.SUMMIT.z) - 6);
    W.START.y = flat(W.START.x, W.START.z, 14);
    yield [0.42, '村と道を整えています'];
    // 道 (ぼかした地形に沿わせる)
    const blur = () => {
      const B = new Float32Array(H), tmp = new Float32Array(VN * VN), RAD = 7;
      for (let pass = 0; pass < 2; pass++) {
        for (let j = 0; j < VN; j++) { let s = 0, c = 0; for (let i = -RAD; i <= RAD; i++) { if (i >= 0 && i < VN) { s += B[j * VN + i]; c++; } } for (let i = 0; i < VN; i++) { tmp[j * VN + i] = s / c; const a = i - RAD, b = i + RAD + 1; if (a >= 0) { s -= B[j * VN + a]; c--; } if (b < VN) { s += B[j * VN + b]; c++; } } }
        for (let i = 0; i < VN; i++) { let s = 0, c = 0; for (let j = -RAD; j <= RAD; j++) { if (j >= 0 && j < VN) { s += tmp[j * VN + i]; c++; } } for (let j = 0; j < VN; j++) { B[j * VN + i] = s / c; const a = j - RAD, b = j + RAD + 1; if (a >= 0) { s -= tmp[a * VN + i]; c--; } if (b < VN) { s += tmp[b * VN + i]; c++; } } }
      }
      return B;
    };
    const ROAD = W.ROAD = new Uint8Array(VN * VN);
    const paveRoads = (roads, B) => {
      for (const road of roads) for (let s = 0; s < road.length - 1; s++) {
        const [ax, az] = road[s], [bx, bz] = road[s + 1];
        const i0 = Math.max(0, Math.floor((Math.min(ax, bx) - 10 + HALF) / CELL)), i1 = Math.min(VN - 1, Math.ceil((Math.max(ax, bx) + 10 + HALF) / CELL));
        const j0 = Math.max(0, Math.floor((Math.min(az, bz) - 10 + HALF) / CELL)), j1 = Math.min(VN - 1, Math.ceil((Math.max(az, bz) + 10 + HALF) / CELL));
        const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const x = i * CELL - HALF, z = j * CELL - HALF, idx = j * VN + i;
          if (GUARD && GUARD[idx]) continue;
          const t = PS.clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1), d = Math.hypot(x - ax - dx * t, z - az - dz * t) + nz.n2(x * 0.08, z * 0.08) * 0.8;
          if (d < 9) { const k = 1 - PS.smooth(2.5, 9, d); H[idx] = PS.lerp(H[idx], Math.max(B[idx], 1.6), k * 0.88); ROAD[idx] = Math.max(ROAD[idx], Math.round(255 * (1 - PS.smooth(1.5, 3.4, d)))); }
        }
      }
    };
    paveRoads(W.ROADS, blur());
    // 村の広場は再度平坦に
    for (const v of oldV) flat(v.x, v.z, 46, v.y);
    for (const d of oldD) flat(d.x, d.z, 16, d.y);
    // ---- 第二章：旧エリアのスナップショットを取り、海だった場所に新たな大地を重ねる ----
    if (EXP) {
      yield [0.46, '新たな大地を浮かび上がらせています'];
      W.H0 = new Float32Array(H);
      const NEWM = W.NEWM = new Uint8Array(VN * VN);
      for (let q = 0; q < VN * VN; q++) {
        if (HN[q] < -900 || H[q] > 0.5 || HN[q] <= H[q]) continue;
        H[q] = HN[q]; RG[q] = RN[q]; NEWM[q] = 1;
        const t = TN[q] / 255; for (let k = 0; k < 5; k++) RW[q * NRW + k] = Math.round(RW[q * NRW + k] * (1 - t)); RW[q * NRW + RN[q]] = Math.round(255 * t);
      }
      GUARD = new Uint8Array(VN * VN); for (let q = 0; q < VN * VN; q++) GUARD[q] = NEWM[q] ? 0 : 1;
      W.lavaLevel2 = W.heightRaw(VOLC2[0], VOLC2[1]) + 14;
      for (const v of newV) v.y = flat(v.x, v.z, 85, Math.max(W.heightRaw(v.x, v.z), 6));
      for (const d of newD) d.y = flat(d.x, d.z, 26);
      for (const w of W.WAYPOINTS) if (w.ch2) flat(w.x, w.z, 9);
      W.SUMMIT2.y = flat(W.SUMMIT2.x, W.SUMMIT2.z, 46, W.heightRaw(W.SUMMIT2.x, W.SUMMIT2.z) - 8);
      paveRoads(W.ROADS2, blur());
      for (const v of newV) flat(v.x, v.z, 46, v.y);
      for (const d of newD) flat(d.x, d.z, 16, d.y);
      // 隠された遺跡（旧エリア）は地形を変えずに、ほどよい斜面を探して入口を置く
      for (const d of W.DUNGEONS) if (d.cave) {
        let best = null, bs = -1e9;
        for (let a = 0; a < 48; a++) for (let rr = 0; rr <= 70; rr += 10) {
          const x = d.x + Math.cos(a * 0.37) * rr, z = d.z + Math.sin(a * 0.37) * rr, hh = W.heightRaw(x, z); if (hh < 8) continue;
          const n = W.normal(x, z), sc = -Math.abs(n[1] - 0.84) * 10 - rr * 0.02; if (sc > bs) { bs = sc; best = [x, z, n]; }
        }
        if (best) { d.x = best[0]; d.z = best[1]; d.ry = Math.atan2(best[2][0], best[2][2]); }
        d.y = W.heightRaw(d.x, d.z);
      }
      GUARD = null;
    }
    // ---- 第三章：第二章までの地形を残したまま、海だった四隅に異界の大地を重ねる ----
    if (EXP3) {
      yield [0.47, '異界の大地を呼び寄せています'];
      W.H1 = new Float32Array(H);
      const NEWM = W.NEWM, DL = new Float32Array(VN * VN), D2 = CELL * Math.SQRT2;
      // 陸地からの距離（海岸から少しずつ高くして、崖にならないようにする）
      for (let q = 0; q < VN * VN; q++) DL[q] = H[q] > 0.5 ? 0 : 1e9;
      for (let j = 0; j < VN; j++) for (let i = 0; i < VN; i++) {
        const q = j * VN + i; let v = DL[q]; if (!v) continue;
        if (i > 0) v = Math.min(v, DL[q - 1] + CELL); if (j > 0) { v = Math.min(v, DL[q - VN] + CELL); if (i > 0) v = Math.min(v, DL[q - VN - 1] + D2); if (i < VN - 1) v = Math.min(v, DL[q - VN + 1] + D2); } DL[q] = v;
      }
      for (let j = VN - 1; j >= 0; j--) for (let i = VN - 1; i >= 0; i--) {
        const q = j * VN + i; let v = DL[q]; if (!v) continue;
        if (i < VN - 1) v = Math.min(v, DL[q + 1] + CELL); if (j < VN - 1) { v = Math.min(v, DL[q + VN] + CELL); if (i < VN - 1) v = Math.min(v, DL[q + VN + 1] + D2); if (i > 0) v = Math.min(v, DL[q + VN - 1] + D2); } DL[q] = v;
      }
      for (let q = 0; q < VN * VN; q++) {
        const m = M3[q]; if (m <= 0.001 || H[q] > 0.5) continue;
        const i = q % VN, j = (q - i) / VN, x = i * CELL - HALF, z = j * CELL - HALF, k = RN3[q], wb = WB3[q] / 255, kb = RB3[q];
        const tl = PS.smooth(0, 260, DL[q]), low = 1.8 + nz.n2(x * 0.02, z * 0.02) * 0.8, sea = -30 + nz.n2(x * 0.01, z * 0.01) * 4;
        const hf = wb > 0.004 ? regionH(k, x, z) * (1 - wb) + regionH(kb, x, z) * wb : regionH(k, x, z);
        const hc = PS.lerp(sea, PS.lerp(low, hf, tl), m); if (hc <= H[q]) continue;
        H[q] = hc; RG[q] = wb > 0.5 ? kb : k; NEWM[q] = 2;
        const tc = PS.smooth(0, 120, DL[q]), o = q * NRW;
        for (let c = 0; c < 9; c++) RW[o + c] = Math.round(RW[o + c] * (1 - tc));
        RW[o + k] = Math.round(255 * tc * (1 - wb)); if (wb > 0.004) RW[o + kb] = Math.round(255 * tc * wb);
      }
      GUARD = new Uint8Array(VN * VN); for (let q = 0; q < VN * VN; q++) GUARD[q] = NEWM[q] === 2 ? 0 : 1;
      W.lavaLevel3 = W.heightRaw(VOLC3[0], VOLC3[1]) + 14;
      const v3 = W.VILLAGES.filter(v => v.ch3);
      for (const v of v3) v.y = flat(v.x, v.z, 85, Math.max(W.heightRaw(v.x, v.z), 6));
      for (const sh of W.SHRINES) sh.y = flat(sh.x, sh.z, 44, Math.max(W.heightRaw(sh.x, sh.z), 5));
      for (const w of W.WAYPOINTS) if (w.ch3) flat(w.x, w.z, 9);
      W.SUMMIT3.y = flat(W.SUMMIT3.x, W.SUMMIT3.z, 46, W.heightRaw(W.SUMMIT3.x, W.SUMMIT3.z) - 8);
      paveRoads(W.ROADS3, blur());
      for (const v of v3) flat(v.x, v.z, 46, v.y);
      for (const sh of W.SHRINES) flat(sh.x, sh.z, 30, sh.y);
      GUARD = null;
    }
    // ---- 第五章：外洋が凍りつき、氷の道と氷河がさらに外へ広がる（それまでの地形はそのまま） ----
    if (EXP5) {
      yield [0.48, '外洋を凍らせています'];
      W.H2 = new Float32Array(H); W.RG2 = new Uint8Array(RG); W.ROAD2 = new Uint8Array(ROAD); W.NEWM2 = new Uint8Array(W.NEWM); // 旧エリア再現用（地域・道も第三章の状態で判定する）
      const NEWM = W.NEWM, FILL = new Uint8Array(VN * VN), Q = new Int32Array(VN * VN); let qh = 0, qt = 0;
      const okq = (q) => { const h = H[q]; if (h > 0.5) return false; const i = q % VN, j = (q - i) / VN, x = i * CELL - HALF, z = j * CELL - HALF; return !(h > -6 && Math.hypot(x, z) < 1500); };
      for (let i = 0; i < VN; i++) for (const q of [i, (VN - 1) * VN + i, i * VN, i * VN + VN - 1]) if (!FILL[q] && okq(q)) { FILL[q] = 1; Q[qt++] = q; }
      while (qh < qt) {
        const q = Q[qh++], i = q % VN, j = (q - i) / VN;
        if (i > 0 && !FILL[q - 1] && okq(q - 1)) { FILL[q - 1] = 1; Q[qt++] = q - 1; }
        if (i < VN - 1 && !FILL[q + 1] && okq(q + 1)) { FILL[q + 1] = 1; Q[qt++] = q + 1; }
        if (j > 0 && !FILL[q - VN] && okq(q - VN)) { FILL[q - VN] = 1; Q[qt++] = q - VN; }
        if (j < VN - 1 && !FILL[q + VN] && okq(q + VN)) { FILL[q + VN] = 1; Q[qt++] = q + VN; }
      }
      const iceH = (x, z) => {
        let h = 1.15 + nz.n2(x * 0.02 + 3, z * 0.02) * 0.2, reg = 14, gm = 0;
        h += Math.max(0, nz2.ridged(x * 0.004 + 13, z * 0.004 - 7, 3) - 0.8) * 70; // 流氷が押し合ってできた氷の丘
        for (const g of GLAC) {
          const dk = Math.hypot(x - g.x, z - g.z); if (dk > g.R + 140) continue;
          const a = Math.atan2(z - g.z, x - g.x), lr = g.R + nz3.fbm(Math.cos(a) * 1.5 + g.x * 0.001, Math.sin(a) * 1.5 + g.z * 0.001, 3) * 70, m = PS.smooth(lr + 40, lr - 160, dk);
          if (m <= 0.001) continue;
          let gh = 18 + nz.fbm(x * 0.004 + 7, z * 0.004, 4) * 14 + Math.pow(nz.ridged(x * 0.003 + 21, z * 0.003 - 5, 5), 2.2) * g.A;
          if (g.peak) { const t = Math.max(0, 1 - dk / (g.R * 0.8)); gh += 230 * Math.pow(t, 1.5); }
          const hh = PS.lerp(h, gh, m); if (hh > h) h = hh; if (m > gm) gm = m;
        }
        if (gm > 0.45) reg = 15;
        const dc = Math.hypot(x - ICECITY.x, z - ICECITY.z);
        if (dc < 320) { h = PS.lerp(h, 9 + nz.n2(x * 0.01, z * 0.01) * 1.2, PS.smooth(320, 150, dc)); if (dc < 280) reg = 16; }
        const e = PS.smooth(HALF - 20, HALF - 200, Math.max(Math.abs(x), Math.abs(z)));
        return [PS.lerp(-30 + nz.n2(x * 0.01, z * 0.01) * 4, h, e), reg];
      };
      for (let q = 0; q < VN * VN; q++) {
        if (!FILL[q]) continue;
        const i = q % VN, j = (q - i) / VN, x = i * CELL - HALF, z = j * CELL - HALF, [hc, rg] = iceH(x, z);
        if (hc <= H[q]) continue;
        H[q] = hc; RG[q] = rg; NEWM[q] = 3;
        const o = q * NRW; for (let c = 0; c < NRW; c++) RW[o + c] = 0; RW[o + 3] = 255;
      }
      GUARD = new Uint8Array(VN * VN); for (let q = 0; q < VN * VN; q++) GUARD[q] = NEWM[q] === 3 ? 0 : 1;
      const v5 = W.VILLAGES.filter(v => v.ch5);
      for (const v of v5) v.y = flat(v.x, v.z, v.id === 16 ? 120 : 85, Math.max(W.heightRaw(v.x, v.z), 6));
      for (const a of W.ALTARS5) a.y = flat(a.x, a.z, 40, Math.max(W.heightRaw(a.x, a.z), 4));
      for (const w of W.WAYPOINTS) if (w.ch5) flat(w.x, w.z, 9);
      W.SUMMIT5.y = flat(W.SUMMIT5.x, W.SUMMIT5.z, 56, W.heightRaw(W.SUMMIT5.x, W.SUMMIT5.z) - 10);
      paveRoads(W.ROADS5, blur());
      for (const v of v5) flat(v.x, v.z, v.id === 16 ? 70 : 46, v.y);
      for (const a of W.ALTARS5) flat(a.x, a.z, 26, a.y);
      GUARD = null;
    }
    yield [0.5, '光と影を計算しています'];
    // 法線
    const NR = W.NR = new Float32Array(VN * VN * 3);
    for (let j = 0; j < VN; j++) for (let i = 0; i < VN; i++) {
      const l = H[j * VN + Math.max(0, i - 1)], r = H[j * VN + Math.min(VN - 1, i + 1)], u = H[Math.max(0, j - 1) * VN + i], d = H[Math.min(VN - 1, j + 1) * VN + i];
      let nx = l - r, ny = 2 * CELL, nzz = u - d; const ln = Math.hypot(nx, ny, nzz); const o = (j * VN + i) * 3; NR[o] = nx / ln; NR[o + 1] = ny / ln; NR[o + 2] = nzz / ln;
    }
    yield [0.56, '大地を彩っています'];
    // 色 + 草
    const COL = W.COL = new Uint8Array(VN * VN * 4), SPL = W.SPL = new Uint8Array(VN * VN * 4);
    const PAL = [
      [C3('#78b848'), C3('#a3cd5a'), C3('#9b9283')], [C3('#4a8c3a'), C3('#6aa845'), C3('#7a7264')], [C3('#d4b47c'), C3('#e0c48e'), C3('#c08458')],
      [C3('#dbe4ee'), C3('#e8eef6'), C3('#7f8692')], [C3('#4e4545'), C3('#665a56'), C3('#3a3234')],
      [C3('#7cc04e'), C3('#b4d86a'), C3('#a09884')], [C3('#d49a62'), C3('#e8b47a'), C3('#b0684a')], [C3('#dde2f2'), C3('#eef0fa'), C3('#767c96')], [C3('#3c3232'), C3('#564848'), C3('#2a2426')],
      [C3('#d4dae4'), C3('#eef1f6'), C3('#3a3236')], [C3('#3a8458'), C3('#76b884'), C3('#6a7a72')], [C3('#c8a24a'), C3('#e0c272'), C3('#a07a4a')], [C3('#8ac85c'), C3('#c0e078'), C3('#a8a090')], [C3('#e8d6a0'), C3('#f4e6bc'), C3('#c8b490')]
    ];
    const ICE1 = C3('#9fc0dc'), ICE2 = C3('#c2dbee'), ICEK = C3('#6a96c0'), GSNOW = C3('#dfe8f2'), GROCK = C3('#7f98b2'), CITYI = C3('#d2dce8'), IROAD = C3('#8fe4ff');
    const SNOW = C3('#e6edf5'), SAND = C3('#dccb98'), BSAND = C3('#3c3636'), ROADC = C3('#a8875e'), USAND = C3('#c4b688'), ROCK2 = C3('#8a8478');
    const NK = EXP3 ? 14 : EXP ? 9 : 5;
    for (let j = 0; j < VN; j++) {
      for (let i = 0; i < VN; i++) {
        const idx = j * VN + i, x = i * CELL - HALF, z = j * CELL - HALF, h = H[idx], ny = NR[idx * 3 + 1], o9 = idx * NRW;
        const v = nz.n2(x * 0.018, z * 0.018) * 0.5 + 0.5, v2 = nz2.n2(x * 0.05, z * 0.05);
        let r = 0, g = 0, b = 0, rr = 0, rg = 0, rb = 0;
        for (let k = 0; k < NK; k++) { const w = RW[o9 + k] / 255; if (!w) continue; const p = PAL[k]; r += w * PS.lerp(p[0][0], p[1][0], v); g += w * PS.lerp(p[0][1], p[1][1], v); b += w * PS.lerp(p[0][2], p[1][2], v); rr += w * p[2][0]; rg += w * p[2][1]; rb += w * p[2][2]; }
        const wv = (RW[o9 + 4] + RW[o9 + 8]) / 255, wd = (RW[o9 + 2] + RW[o9 + 6]) / 255, ws = (RW[o9 + 3] + RW[o9 + 7]) / 255, wf = RW[o9 + 1] / 255, wp = (RW[o9] + RW[o9 + 5]) / 255;
        let c = [r, g, b];
        const snowT = PS.smooth(205, 265, h + v2 * 25) * (1 - wv) * (1 - wd * 0.7);
        c = PS.mixC(c, SNOW, snowT);
        const beachT = PS.smooth(3.4, 1.4, h) * (1 - ws);
        c = PS.mixC(c, wv > 0.5 ? BSAND : SAND, beachT);
        const rockT = PS.smooth(0.76, 0.58, ny + v2 * 0.03);
        c = PS.mixC(c, PS.mixC([rr, rg, rb], ROCK2, 0.2 * (1 - wd)), rockT * (1 - snowT * 0.6));
        if (h < 0) c = PS.mixC(c, USAND, PS.smooth(0, -2.5, h));
        const road = ROAD[idx] / 255;
        c = PS.mixC(c, ROADC, road * 0.85);
        let em = 0;
        if (wv > 0.4) {
          const cr = PS.smooth(0.94, 0.985, nz2.ridged(x * 0.012, z * 0.012, 2)) * wv * PS.smooth(0.8, 0.92, ny);
          const dv = Math.hypot(x - VOLC[0], z - VOLC[1]);
          if (dv < 135 && h < W.lavaLevel + 8) em = Math.max(em, 0.45 * PS.smooth(W.lavaLevel + 8, W.lavaLevel, h));
          if (EXP) { const dv2 = Math.hypot(x - VOLC2[0], z - VOLC2[1]); if (dv2 < 125 && h < W.lavaLevel2 + 8) em = Math.max(em, 0.45 * PS.smooth(W.lavaLevel2 + 8, W.lavaLevel2, h)); }
          em = Math.max(em, cr * 0.9); c = PS.mixC(c, [0.25, 0.08, 0.05], Math.min(1, cr));
        }
        if (EXP && RW[o9 + 7] > 120 && ny > 0.9) { const au = PS.smooth(0.55, 0.8, nz3.n2(x * 0.01 + 5, z * 0.01)); c = PS.mixC(c, [0.72, 0.86, 1.0], au * 0.25); }
        let w9 = 0, w10 = 0, w11 = 0, w12 = 0, w13 = 0;
        if (EXP3) {
          w9 = RW[o9 + 9] / 255; w10 = RW[o9 + 10] / 255; w11 = RW[o9 + 11] / 255; w12 = RW[o9 + 12] / 255; w13 = RW[o9 + 13] / 255;
          if (w9 > 0.3) { // 雪原に走る溶岩の裂け目と、火口の溶岩湖
            const cr = PS.smooth(0.93, 0.985, nz2.ridged(x * 0.011 + 7, z * 0.011, 2)) * w9 * PS.smooth(0.78, 0.92, ny);
            const dv = Math.hypot(x - VOLC3[0], z - VOLC3[1]); if (dv < 128 && h < W.lavaLevel3 + 8) em = Math.max(em, 0.45 * PS.smooth(W.lavaLevel3 + 8, W.lavaLevel3, h));
            const rk = PS.smooth(0.2, 0.55, nz3.n2(x * 0.008 - 3, z * 0.008)) * w9; c = PS.mixC(c, [0.18, 0.15, 0.16], rk * 0.75);
            em = Math.max(em, cr * 0.9); c = PS.mixC(c, [0.3, 0.08, 0.04], Math.min(1, cr));
          }
          if (w10 > 0.2) c = PS.mixC(c, [0.84, 0.93, 0.95], w10 * PS.smooth(0.45, 0.85, nz3.n2(x * 0.012 + 3, z * 0.012 - 5)) * 0.45);
          if (w13 > 0.2 && h > 0) c = PS.mixC(c, [0.98, 0.94, 0.8], w13 * PS.smooth(0.6, 0.9, nz2.n2(x * 0.08, z * 0.08)) * 0.25);
        }
        let ice = false;
        if (EXP5 && W.NEWM[idx] === 3) { // 第五章：凍った外洋・氷河・氷の道
          ice = true; em = 0;
          const ck = PS.smooth(0.9, 0.97, nz2.ridged(x * 0.021 + 5, z * 0.021, 2)), rgn = W.RG[idx];
          c = PS.mixC(ICE1, ICE2, v); c = PS.mixC(c, ICEK, ck * 0.55 * PS.smooth(6, 2, h));
          if (rgn === 15 || h > 12) { const sn = PS.smooth(8, 26, h); c = PS.mixC(c, PS.mixC(GSNOW, GROCK, PS.smooth(0.8, 0.6, ny)), sn); }
          if (rgn === 16) c = PS.mixC(c, CITYI, PS.smooth(300, 200, Math.hypot(x - ICECITY.x, z - ICECITY.z)) * 0.6);
          if (h < 0) c = PS.mixC(c, [0.1, 0.18, 0.28], PS.smooth(0, -3, h));
          const rd = ROAD[idx] / 255; if (rd > 0) { c = PS.mixC(c, IROAD, rd * 0.9); em = Math.max(em, rd * 0.28); }
        }
        const o = idx * 4;
        COL[o] = c[0] * 255; COL[o + 1] = c[1] * 255; COL[o + 2] = c[2] * 255; COL[o + 3] = em * 255;
        const dO = Math.hypot(x - OASIS[0], z - OASIS[1]);
        let dens = wp * 0.95 + wf * 0.82 + wv * 0.02 + (dO < 170 ? 0.75 * PS.smooth(170, 120, dO) : 0) + w10 * 0.88 + w11 * 0.8 + w12 * 0.92 + w13 * 0.12;
        dens *= (1 - rockT) * (1 - beachT) * (1 - road) * (1 - snowT) * PS.smooth(0.5, 1.2, h) * (0.55 + 0.45 * PS.clamp(nz3.n2(x * 0.03, z * 0.03) + 0.4, 0, 1));
        if (ice) dens = 0;
        SPL[o] = PS.clamp(dens, 0, 1) * 255; SPL[o + 1] = PS.clamp(wf + ws * 0.6 + wv + w11 * 0.75 + w9 + w13 * 0.5, 0, 1) * 255; SPL[o + 2] = PS.clamp(wp * 0.9 + wf * 0.6 + 0.2 + w10 * 0.9 + w12 * 0.8, 0, 1) * 255; SPL[o + 3] = 255;
      }
      if (j % 64 === 0) yield [0.56 + 0.1 * j / VN, '大地を彩っています'];
    }
    for (const v of W.VILLAGES) { const r = 48; W.forCells(v.x, v.z, r, (idx, d) => { SPL[idx * 4] *= PS.smooth(r * 0.5, r, d) * 0.7 + 0.3 * PS.smooth(14, 22, d); }); }
    yield [0.68, '世界地図を描いています'];
    W.buildMap();
    yield [0.72, '森を育てています'];
    yield* W.placeProps(seed);
    yield [0.84, '村を建てています'];
    W.buildVillages(seed);
    W.buildPOIs(seed);
    W.placeEntities(seed);
    if (EXP5 && !window.PS_KEEP_SNAP) { W.H0 = W.H1 = W.RG2 = W.ROAD2 = W.NEWM2 = null; } // H2 は第四章の施設（世界の果て）の位置を第三章と同じにするため残す // 生成にだけ使うスナップショットは解放してメモリを節約
    yield [0.9, '大地をGPUに送っています'];
  };

  W.forCells = function (x, z, r, fn) {
    const i0 = Math.max(0, Math.floor((x - r + HALF) / CELL)), i1 = Math.min(VN - 1, Math.ceil((x + r + HALF) / CELL));
    const j0 = Math.max(0, Math.floor((z - r + HALF) / CELL)), j1 = Math.min(VN - 1, Math.ceil((z + r + HALF) / CELL));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const d = Math.hypot(i * CELL - HALF - x, j * CELL - HALF - z); if (d < r) fn(j * VN + i, d); }
  };
  // ---------------- クエリ ----------------
  W.heightRaw = function (x, z) {
    const gx = PS.clamp((x + HALF) / CELL, 0, VN - 1.001), gz = PS.clamp((z + HALF) / CELL, 0, VN - 1.001);
    const i = Math.floor(gx), j = Math.floor(gz), fx = gx - i, fz = gz - j, H = W._Hq || W.H, o = j * VN + i;
    return (H[o] * (1 - fx) + H[o + 1] * fx) * (1 - fz) + (H[o + VN] * (1 - fx) + H[o + VN + 1] * fx) * fz;
  };
  W.height = function (x, z) { if (x < -HALF || z < -HALF || x > HALF || z > HALF) return -30; return W.heightRaw(x, z); };
  W.normal = function (x, z, out) {
    out = out || [0, 1, 0]; const e = 1.5;
    const nx = W.height(x - e, z) - W.height(x + e, z), nzz = W.height(x, z - e) - W.height(x, z + e), ny = 2 * e, l = Math.hypot(nx, ny, nzz);
    out[0] = nx / l; out[1] = ny / l; out[2] = nzz / l; return out;
  };
  W.region = function (x, z) { const i = PS.clamp(Math.round((x + HALF) / CELL), 0, VN - 1), j = PS.clamp(Math.round((z + HALF) / CELL), 0, VN - 1); return (W._Rq || W.RG)[j * VN + i]; };
  W.roadAt = function (x, z) { const i = PS.clamp(Math.round((x + HALF) / CELL), 0, VN - 1), j = PS.clamp(Math.round((z + HALF) / CELL), 0, VN - 1); return (W._Dq || W.ROAD)[j * VN + i] / 255; };

  // ---------------- 地図画像 ----------------
  W.buildMap = function () {
    const S = W.expanded ? 1536 : 1024, full = new ImageData(S, S), fog = new ImageData(S, S), reg = new Uint8Array(S * S);
    const H = W.H, NR = W.NR, COL = W.COL;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = Math.min(VN - 1, Math.round(x * (VN - 1) / (S - 1))), j = Math.min(VN - 1, Math.round(y * (VN - 1) / (S - 1))), idx = j * VN + i, o = (y * S + x) * 4;
      const h = H[idx]; let r, g, b;
      if (h < 0) { const t = PS.clamp(-h / 25, 0, 1); r = PS.lerp(110, 40, t); g = PS.lerp(200, 105, t); b = PS.lerp(215, 160, t); }
      else {
        const sh = PS.clamp(0.75 + (NR[idx * 3] * -0.7 + NR[idx * 3 + 2] * -0.7 + NR[idx * 3 + 1] * 0.4) * 0.9, 0.45, 1.25);
        r = COL[idx * 4] * sh; g = COL[idx * 4 + 1] * sh; b = COL[idx * 4 + 2] * sh;
        if (COL[idx * 4 + 3] > 80) { r = 255; g = 120; b = 40; }
        const ct = Math.abs((h / 40) % 1 - 0.5) < 0.03 ? 0.9 : 1; r *= ct; g *= ct; b *= ct;
      }
      full.data[o] = r; full.data[o + 1] = g; full.data[o + 2] = b; full.data[o + 3] = 255;
      const lum = (r * 0.3 + g * 0.59 + b * 0.11);
      fog.data[o] = lum * 0.35 + 150; fog.data[o + 1] = lum * 0.33 + 140; fog.data[o + 2] = lum * 0.28 + 118; fog.data[o + 3] = 255;
      reg[y * S + x] = h < 0 ? 255 : W.RG[idx];
    }
    W.map = { S, full, fog, reg };
  };

  // ---------------- 植生 ----------------
  W.PROPS = {};
  const PT = [
    ['tb0', () => PS.Props.treeBroad(0), 1, 0.55, 1], ['tb1', () => PS.Props.treeBroad(1, '#58a043', '#b4dc66'), 1, 0.55, 1], ['tb2', () => PS.Props.treeBroad(2, '#4a8f45', '#9cd060'), 1, 0.55, 1],
    ['tf0', () => PS.Props.treeBroad(1, '#2f6e35', '#6aa848'), 1, 0.55, 1], ['tf1', () => PS.Props.treeBroad(3, '#3a7a3a', '#86bc52'), 1, 0.55, 1], ['tbig', () => PS.Props.treeBroad(2, '#2f6a33', '#74b04c', true), 0.6, 1.1, 1],
    ['pine0', () => PS.Props.pine(0), 0.6, 0.5, 1], ['pine1', () => PS.Props.pine(1), 0.6, 0.5, 1], ['spine0', () => PS.Props.pine(0, true), 0.5, 0.5, 1], ['spine1', () => PS.Props.pine(1, true), 0.5, 0.5, 1],
    ['palm', () => PS.Props.palm(), 1.2, 0.35, 1], ['cactus0', () => PS.Props.cactus(0), 0, 0.4, 1], ['cactus1', () => PS.Props.cactus(1), 0, 0.4, 1], ['dead0', () => PS.Props.deadTree(0), 0.2, 0.4, 1], ['dead1', () => PS.Props.deadTree(1), 0.2, 0.4, 1],
    ['bush0', () => PS.Props.bush(0), 1.5, 0, 0], ['bush1', () => PS.Props.bush(1, '#3c7d36', '#74b24c'), 1.5, 0, 0], ['bush2', () => PS.Props.bush(2), 1.5, 0, 0], ['bushD', () => PS.Props.bush(3, '#8a8a4a', '#b8b070'), 1, 0, 0],
    ['rockP', () => PS.Props.rock(0, '#8f877a', '#a49c8e', '#7fae4c'), 0, 0.85, 1], ['rockPB', () => PS.Props.rock(1, '#8a8274', '#a09888', '#79aa48', true), 0, 2.8, 1],
    ['rockD', () => PS.Props.rock(2, '#b8865c', '#d4a274'), 0, 0.85, 1], ['rockDB', () => PS.Props.rock(3, '#b07a52', '#cc9a6c', null, true), 0, 2.8, 1],
    ['rockS', () => PS.Props.rock(4, '#7f8590', '#959ba6', '#f2f6fb'), 0, 0.85, 1], ['rockSB', () => PS.Props.rock(5, '#787e8a', '#8f95a0', '#f2f6fb', true), 0, 2.8, 1],
    ['rockV', () => PS.Props.rock(6, '#2e2829', '#403839', null, false, '#ff6a2a'), 0, 0.85, 1], ['rockVB', () => PS.Props.rock(7, '#2a2425', '#3c3435', null, true, '#ff5a1a'), 0, 2.8, 1],
    ['acacia', () => PS.Props.acacia(0), 0.4, 0.5, 1], ['acacia1', () => PS.Props.acacia(1), 0.4, 0.5, 1], ['jtree', () => PS.Props.jungleTree(0), 0.8, 0.7, 1], ['jtree1', () => PS.Props.jungleTree(1), 0.8, 0.7, 1],
    ['ftree', () => PS.Props.treeBroad(2, '#4a7a6a', '#e4f4f0'), 0.8, 0.55, 1], ['bushF', () => PS.Props.bush(5, '#4a7a6a', '#d8f0ec'), 1.2, 0, 0], ['bushS', () => PS.Props.bush(6, '#a8902a', '#e0c870'), 1.4, 0, 0],
    ['crystal', () => PS.Props.crystal(0), 0, 0.8, 1], ['flw0', () => PS.Props.flowers(0), 0, 0, 0], ['flw1', () => PS.Props.flowers(1), 0, 0, 0], ['flw2', () => PS.Props.flowers(2), 0, 0, 0], ['flw3', () => PS.Props.flowers(3), 0, 0, 0], ['fern', () => PS.Props.fern(), 1, 0, 0]
  ];
  W.PT = PT;
  const SMALL = new Set(['bush0', 'bush1', 'bush2', 'bushD', 'rockP', 'rockD', 'rockS', 'rockV', 'flw0', 'flw1', 'flw2', 'flw3', 'fern']);
  W.SMALL = SMALL;
  W.placeProps = function* (seed) {
    const nz = W.nz, inst = {}, EXP = W.expanded;
    const excl = [], excl2 = [], excl3 = [], excl5 = [], EXP3 = W.ch3, EXP5 = W.ch5;
    const exl = (o) => (o.ch5 ? excl5 : o.ch3 ? excl3 : o.ch2 ? excl2 : excl);
    for (const v of W.VILLAGES) exl(v).push([v.x, v.z, 62]);
    for (const d of W.DUNGEONS) exl(d).push([d.x, d.z, d.cave ? 14 : 20]);
    for (const w of W.WAYPOINTS) exl(w).push([w.x, w.z, 6]);
    excl.push([W.START.x, W.START.z, 12], [W.SUMMIT.x, W.SUMMIT.z, 45]);
    if (EXP) excl2.push([W.SUMMIT2.x, W.SUMMIT2.z, 45]);
    if (EXP3) { for (const sh of W.SHRINES) excl3.push([sh.x, sh.z, 46]); excl3.push([W.SUMMIT3.x, W.SUMMIT3.z, 48]); }
    if (EXP5) { for (const a of W.ALTARS5) excl5.push([a.x, a.z, 40]); excl5.push([W.SUMMIT5.x, W.SUMMIT5.z, 60], [ICECITY.x, ICECITY.z, 130]); }
    let lateEx = null; // 旧エリア再現パス：乱数は同じだけ消費し、第二章の施設と重なる物だけ置かない
    const add = (type, x, y, z, rot, s, tint) => {
      if (lateEx) for (const e of lateEx) if (Math.hypot(x - e[0], z - e[1]) < e[2]) return;
      const cx = PS.clamp(Math.floor((x + HALF) / VCELL), 0, NVC - 1), cz = PS.clamp(Math.floor((z + HALF) / VCELL), 0, NVC - 1);
      const key = type + ':' + (cz * NVC + cx); (inst[key] = inst[key] || []).push(x, y, z, rot, s, tint, 1, 0);
      const def = PT.find(p => p[0] === type); if (def[3] > 0) W.addCircle(x, z, def[3] * s, y + (type.startsWith('rock') ? s * 1.4 * (def[3] > 1 ? 2 : 1) : 30));
    };
    // 1地点ぶんの植生（reg は基本地域 0〜4）
    const placeAt = (r, x, z, h, reg, rv, rot, tint) => {
      const nrm = W.normal(x, z), ny = nrm[1];
      const fn = nz.n2(x * 0.006 + 31, z * 0.006) * 0.5 + 0.5, fn2 = nz.n2(x * 0.02, z * 0.02) * 0.5 + 0.5;
      const dO = Math.hypot(x - OASIS[0], z - OASIS[1]);
      if (ny < 0.72) { if (rv < 0.012) add(reg === 2 ? 'rockDB' : reg === 3 ? 'rockSB' : reg === 4 ? 'rockVB' : 'rockPB', x, h - 0.6, z, rot, 0.7 + r() * 0.6, tint); return; }
      if (h < 3.5 && reg !== 3 && reg !== 4) { if (rv < 0.035) add('palm', x, h - 0.2, z, rot, 0.85 + r() * 0.4, tint); return; }
      if (h > 175 && reg !== 3 && reg !== 4 && reg !== 2) { if (rv < 0.06 * fn) add(h > 230 ? 'spine0' : 'pine0', x, h - 0.3, z, rot, 0.7 + r() * 0.5, tint); else if (rv < 0.08) add('rockS', x, h - 0.2, z, rot, 0.7 + r() * 0.8, tint); return; }
      if (reg === 0) {
        const fp = PS.smooth(0.55, 0.8, fn);
        if (rv < 0.17 * fp) add(['tb0', 'tb1', 'tb2'][Math.floor(r() * 3)], x, h - 0.2, z, rot, 0.8 + r() * 0.5, tint);
        else if (rv < 0.17 * fp + 0.012) add(['tb0', 'tb1', 'tb2'][Math.floor(r() * 3)], x, h - 0.2, z, rot, 0.8 + r() * 0.5, tint);
        else if (rv < 0.25 * fp + 0.03) add(r() < 0.5 ? 'bush0' : 'bush2', x, h - 0.1, z, rot, 0.7 + r() * 0.5, tint);
        else if (rv < 0.25 * fp + 0.045) add('rockP', x, h - 0.2, z, rot, 0.6 + r() * 0.9, tint);
        else if (rv < 0.25 * fp + 0.05) add('rockPB', x, h - 0.6, z, rot, 0.5 + r() * 0.5, tint);
        else if (rv < 0.25 * fp + 0.15 * fn2) add('flw' + Math.floor(r() * 4), x, h - 0.02, z, rot, 0.8 + r() * 0.6, tint);
      } else if (reg === 1) {
        const fp = PS.smooth(0.3, 0.6, fn);
        if (rv < 0.05 * fp) add('tbig', x, h - 0.4, z, rot, 0.8 + r() * 0.5, tint);
        else if (rv < 0.33 * fp) add(r() < 0.6 ? 'tf0' : 'tf1', x, h - 0.2, z, rot, 0.9 + r() * 0.6, tint);
        else if (rv < 0.36 * fp + 0.02) add('pine1', x, h - 0.3, z, rot, 0.8 + r() * 0.4, tint);
        else if (rv < 0.42 * fp + 0.05) add('fern', x, h, z, rot, 0.8 + r() * 0.7, tint);
        else if (rv < 0.46 * fp + 0.07) add('bush1', x, h - 0.1, z, rot, 0.7 + r() * 0.6, tint);
        else if (rv < 0.46 * fp + 0.085) add('rockP', x, h - 0.2, z, rot, 0.6 + r() * 0.8, tint);
        else if (rv < 0.46 * fp + 0.11) add('flw' + (1 + Math.floor(r() * 2)), x, h - 0.02, z, rot, 0.8 + r() * 0.5, tint);
      } else if (reg === 2) {
        if (dO < 170) { if (rv < 0.12) add('palm', x, h - 0.2, z, rot, 0.8 + r() * 0.5, tint); else if (rv < 0.2) add('bush0', x, h - 0.1, z, rot, 0.7, tint); return; }
        if (rv < 0.012) add(r() < 0.5 ? 'cactus0' : 'cactus1', x, h - 0.2, z, rot, 0.8 + r() * 0.5, tint);
        else if (rv < 0.024) add('rockD', x, h - 0.2, z, rot, 0.6 + r() * 1.0, tint);
        else if (rv < 0.029) add('rockDB', x, h - 0.8, z, rot, 0.5 + r() * 0.6, tint);
        else if (rv < 0.036) add('bushD', x, h - 0.1, z, rot, 0.5 + r() * 0.4, tint);
        else if (rv < 0.039) add('dead1', x, h - 0.2, z, rot, 0.6, tint);
      } else if (reg === 3) {
        const fp = PS.smooth(0.45, 0.75, fn);
        if (rv < 0.2 * fp) add(r() < 0.5 ? 'spine0' : 'spine1', x, h - 0.3, z, rot, 0.7 + r() * 0.6, tint);
        else if (rv < 0.2 * fp + 0.025) add('rockS', x, h - 0.2, z, rot, 0.6 + r() * 1.0, tint);
        else if (rv < 0.2 * fp + 0.031) add('rockSB', x, h - 0.6, z, rot, 0.5 + r() * 0.5, tint);
        else if (rv < 0.2 * fp + 0.038) add('crystal', x, h - 0.1, z, rot, 0.6 + r() * 0.8, tint);
      } else {
        if (rv < 0.018) add(r() < 0.5 ? 'dead0' : 'dead1', x, h - 0.2, z, rot, 0.7 + r() * 0.5, tint);
        else if (rv < 0.06) add('rockV', x, h - 0.2, z, rot, 0.6 + r() * 1.1, tint);
        else if (rv < 0.07) add('rockVB', x, h - 0.6, z, rot, 0.5 + r() * 0.6, tint);
      }
    };
    // 第三章の地域の植生（rg は地域 9〜13）
    const placeAt3 = (r, x, z, h, rg, rv, rot, tint) => {
      const ny = W.normal(x, z)[1], fn = nz.n2(x * 0.006 - 17, z * 0.006) * 0.5 + 0.5, fn2 = nz.n2(x * 0.02 + 5, z * 0.02) * 0.5 + 0.5;
      if (ny < 0.72) { if (rv < 0.012) add(rg === 9 ? 'rockVB' : rg === 11 || rg === 13 ? 'rockDB' : 'rockPB', x, h - 0.6, z, rot, 0.7 + r() * 0.6, tint); return; }
      if (h < 3.5 && rg !== 9) { if (rv < (rg === 13 ? 0.06 : 0.03)) add('palm', x, h - 0.2, z, rot, 0.85 + r() * 0.45, tint); else if (rg === 13 && rv < 0.075) add('rockD', x, h - 0.2, z, rot, 0.4 + r() * 0.5, tint); return; }
      if (rg === 9) {
        if (rv < 0.05 * fn) add(r() < 0.5 ? 'spine0' : 'spine1', x, h - 0.3, z, rot, 0.6 + r() * 0.5, tint);
        else if (rv < 0.05 * fn + 0.012) add(r() < 0.5 ? 'dead0' : 'dead1', x, h - 0.2, z, rot, 0.7 + r() * 0.4, tint);
        else if (rv < 0.05 * fn + 0.04) add(r() < 0.5 ? 'rockV' : 'rockS', x, h - 0.2, z, rot, 0.6 + r() * 1.0, tint);
        else if (rv < 0.05 * fn + 0.048) add('rockVB', x, h - 0.6, z, rot, 0.5 + r() * 0.5, tint);
        else if (rv < 0.05 * fn + 0.054) add('crystal', x, h - 0.1, z, rot, 0.6 + r() * 0.7, tint);
      } else if (rg === 10) {
        const fp = PS.smooth(0.25, 0.55, fn);
        if (rv < 0.06 * fp) add(r() < 0.5 ? 'jtree' : 'jtree1', x, h - 0.4, z, rot, 0.85 + r() * 0.5, tint);
        else if (rv < 0.24 * fp) add(r() < 0.55 ? 'ftree' : 'tf0', x, h - 0.2, z, rot, 0.9 + r() * 0.6, tint);
        else if (rv < 0.3 * fp + 0.03) add('fern', x, h, z, rot, 0.9 + r() * 0.8, tint);
        else if (rv < 0.34 * fp + 0.05) add('bushF', x, h - 0.1, z, rot, 0.7 + r() * 0.6, tint);
        else if (rv < 0.34 * fp + 0.06) add('rockS', x, h - 0.2, z, rot, 0.6 + r() * 0.8, tint);
        else if (rv < 0.34 * fp + 0.07) add('palm', x, h - 0.2, z, rot, 0.8 + r() * 0.4, tint);
      } else if (rg === 11) {
        if (rv < 0.012 * (0.4 + fn)) add(r() < 0.6 ? 'acacia' : 'acacia1', x, h - 0.2, z, rot, 0.8 + r() * 0.5, tint);
        else if (rv < 0.03) add('bushS', x, h - 0.1, z, rot, 0.6 + r() * 0.5, tint);
        else if (rv < 0.038) add('rockD', x, h - 0.2, z, rot, 0.6 + r() * 1.0, tint);
        else if (rv < 0.041) add('rockDB', x, h - 0.7, z, rot, 0.5 + r() * 0.6, tint);
        else if (rv < 0.043) add('dead1', x, h - 0.2, z, rot, 0.6, tint);
      } else if (rg === 12) {
        const fp = PS.smooth(0.6, 0.85, fn);
        if (rv < 0.1 * fp) add(['tb1', 'tb2'][Math.floor(r() * 2)], x, h - 0.2, z, rot, 0.8 + r() * 0.4, tint);
        else if (rv < 0.1 * fp + 0.012) add('pine0', x, h - 0.3, z, rot, 0.7 + r() * 0.4, tint);
        else if (rv < 0.1 * fp + 0.03) add('rockP', x, h - 0.2, z, rot, 0.6 + r() * 0.9, tint);
        else if (rv < 0.1 * fp + 0.034) add('rockPB', x, h - 0.6, z, rot, 0.5 + r() * 0.5, tint);
        else if (rv < 0.1 * fp + 0.13 * fn2) add('flw' + Math.floor(r() * 4), x, h - 0.02, z, rot, 0.8 + r() * 0.6, tint);
      } else {
        if (rv < 0.02 * (0.5 + fn)) add('palm', x, h - 0.2, z, rot, 0.85 + r() * 0.45, tint);
        else if (rv < 0.03) add('bush0', x, h - 0.1, z, rot, 0.6 + r() * 0.4, tint);
        else if (rv < 0.038) add('rockD', x, h - 0.2, z, rot, 0.4 + r() * 0.6, tint);
      }
    };
    // ---- パス1：旧エリア（第一章と完全に同じ乱数列・同じ地形で配置） ----
    const rOld = PS.rng(seed + 99);
    if (EXP5) { W._Rq = W.RG2; W._Dq = W.ROAD2; } // 第五章：パス1〜3は第三章までの地域・道で判定（氷の海で乱数列がずれないように）
    {
      const r = rOld, STEP = 6.5, n = Math.floor(OLD_SIZE / STEP);
      if (EXP) { W._Hq = W.H0; lateEx = excl2; }
      for (let gj = 0; gj < n; gj++) {
        for (let gi = 0; gi < n; gi++) {
          const x = gi * STEP - OLD_HALF + r() * STEP, z = gj * STEP - OLD_HALF + r() * STEP;
          const h = W.heightRaw(x, z); if (h < 0.6) continue;
          let bad = false; for (const e of excl) if (Math.abs(x - e[0]) < e[2] && Math.abs(z - e[1]) < e[2] && Math.hypot(x - e[0], z - e[1]) < e[2]) { bad = true; break; }
          if (bad || W.roadAt(x, z) > 0.05) continue;
          const reg = W.region(x, z), rv = r(), rot = r() * 6.283, tint = r();
          placeAt(r, x, z, h, reg, rv, rot, tint);
        }
        if (gj % 40 === 0) yield [0.72 + (EXP ? 0.07 : 0.11) * gj / n, '森を育てています'];
      }
      W._Hq = null; lateEx = null;
    }
    // ---- パス2：第二章で浮上した大地 ----
    if (EXP) {
      const r = PS.rng(seed + 199), STEP = 6.5, n = Math.floor(S2 / STEP), NEWM = EXP5 ? W.NEWM2 : W.NEWM;
      if (EXP3) W._Hq = W.H1;
      for (let gj = 0; gj < n; gj++) {
        const zz = gj * STEP - E2;
        for (let gi = 0; gi < n; gi++) {
          const x = gi * STEP - E2 + r() * STEP, z = zz + r() * STEP;
          if (Math.hypot(x, z) < 880) continue;
          const ci = PS.clamp(Math.round((x + HALF) / CELL), 0, VN - 1), cj = PS.clamp(Math.round((z + HALF) / CELL), 0, VN - 1);
          if (NEWM[cj * VN + ci] !== 1) continue;
          const h = W.heightRaw(x, z); if (h < 0.6) continue;
          let bad = false; for (const e of excl2) if (Math.abs(x - e[0]) < e[2] && Math.abs(z - e[1]) < e[2] && Math.hypot(x - e[0], z - e[1]) < e[2]) { bad = true; break; }
          if (bad || W.roadAt(x, z) > 0.05) continue;
          const rg = W.region(x, z), rv = r(), rot = r() * 6.283, tint = r();
          placeAt(r, x, z, h, W.baseReg(rg), rg === 7 ? rv * 0.8 : rv, rot, tint);
        }
        if (gj % 40 === 0) yield [0.79 + (EXP3 ? 0.02 : 0.04) * gj / n, '浮上した大地に緑を芽吹かせています'];
      }
      W._Hq = null;
    }
    // ---- パス3：第三章・異界の大地 ----
    if (EXP3) {
      const r = PS.rng(seed + 311), STEP = 6.5, n = Math.floor(S2 / STEP), NEWM = EXP5 ? W.NEWM2 : W.NEWM;
      if (EXP5) W._Hq = W.H2;
      for (let gj = 0; gj < n; gj++) {
        const zz = gj * STEP - E2;
        for (let gi = 0; gi < n; gi++) {
          const x = gi * STEP - E2 + r() * STEP, z = zz + r() * STEP;
          if (Math.hypot(x, z) < 1000) continue;
          const ci = PS.clamp(Math.round((x + HALF) / CELL), 0, VN - 1), cj = PS.clamp(Math.round((z + HALF) / CELL), 0, VN - 1);
          if (NEWM[cj * VN + ci] !== 2) continue;
          const h = W.heightRaw(x, z); if (h < 0.6) continue;
          let bad = false; for (const e of excl3) if (Math.abs(x - e[0]) < e[2] && Math.abs(z - e[1]) < e[2] && Math.hypot(x - e[0], z - e[1]) < e[2]) { bad = true; break; }
          if (bad || W.roadAt(x, z) > 0.05) continue;
          const rg = W.region(x, z), rv = r(), rot = r() * 6.283, tint = r();
          if (rg >= 9) placeAt3(r, x, z, h, rg, rv, rot, tint);
        }
        if (gj % 40 === 0) yield [0.81 + 0.03 * gj / n, '異界の大地に命を吹き込んでいます'];
      }
      W._Hq = null;
    }
    W._Rq = W._Dq = null;
    // ---- パス4：第五章・凍った外洋と氷河 ----
    if (EXP5) {
      const r = PS.rng(seed + 411), STEP = 7.5, n = Math.floor(SIZE / STEP), NEWM = W.NEWM;
      for (let gj = 0; gj < n; gj++) {
        const zz = gj * STEP - HALF;
        for (let gi = 0; gi < n; gi++) {
          const x = gi * STEP - HALF + r() * STEP, z = zz + r() * STEP;
          if (Math.hypot(x, z) < 1300) continue;
          const ci = PS.clamp(Math.round((x + HALF) / CELL), 0, VN - 1), cj = PS.clamp(Math.round((z + HALF) / CELL), 0, VN - 1), q = cj * VN + ci;
          if (NEWM[q] !== 3) continue;
          const h = W.heightRaw(x, z); if (h < 0.6) continue;
          let bad = false; for (const e of excl5) if (Math.abs(x - e[0]) < e[2] && Math.abs(z - e[1]) < e[2] && Math.hypot(x - e[0], z - e[1]) < e[2]) { bad = true; break; }
          if (bad || W.roadAt(x, z) > 0.05) continue;
          const rv = r(), rot = r() * 6.283, tint = r(), ny = W.normal(x, z)[1], rg = W.RG[q];
          if (rg === 15 || h > 14) {
            if (ny < 0.72) { if (rv < 0.02) add('rockSB', x, h - 0.6, z, rot, 0.7 + r() * 0.7, tint); }
            else if (rv < 0.035) add(r() < 0.5 ? 'spine0' : 'spine1', x, h - 0.3, z, rot, 0.7 + r() * 0.5, tint);
            else if (rv < 0.05) add('crystal', x, h - 0.2, z, rot, 0.8 + r() * 1.2, tint);
            else if (rv < 0.065) add('rockS', x, h - 0.2, z, rot, 0.6 + r() * 0.8, tint);
          } else if (rg === 16) {
            if (rv < 0.012) add('spine1', x, h - 0.3, z, rot, 0.6 + r() * 0.4, tint);
            else if (rv < 0.02) add('crystal', x, h - 0.2, z, rot, 0.6 + r() * 0.6, tint);
          } else {
            if (rv < 0.006) add('rockSB', x, h - 1.2, z, rot, 0.6 + r() * 0.9, tint);
            else if (rv < 0.016) add('crystal', x, h - 0.3, z, rot, 0.5 + r() * 1.3, tint);
            else if (rv < 0.02) add('rockS', x, h - 0.2, z, rot, 0.5 + r() * 0.6, tint);
          }
        }
        if (gj % 40 === 0) yield [0.84 + 0.02 * gj / n, '氷河に命を吹き込んでいます'];
      }
    }
    // 吹き抜け: GPUへ
    const gl = PS.R.gl, rr = rOld;
    for (const [name, fn, sway] of PT) W.PROPS[name] = { packed: fn().pack(), sway, cells: [] };
    for (const key in inst) {
      const [type, ci] = key.split(':'), arr = inst[key], cnt = arr.length / 8;
      for (let i = cnt - 1; i > 0; i--) { const j = Math.floor(rr() * (i + 1)); for (let k = 0; k < 8; k++) { const t = arr[i * 8 + k]; arr[i * 8 + k] = arr[j * 8 + k]; arr[j * 8 + k] = t; } }
      for (let i = 0; i < cnt; i++) arr[i * 8 + 6] = W.PROPS[type].sway;
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
      const P = W.PROPS[type];
      if (!P.vbo) { const m = PS.GLH.makeMesh(gl, P.packed); P.vbo = m.vbo; P.ibo = m.ibo; P.itype = m.itype; P.count = m.count; }
      const mesh = PS.GLH.makeMesh(gl, { vbo: P.vbo, ibo: P.ibo, itype: P.itype, count: P.count }, buf);
      const ic = +ci, cx = (ic % NVC) * VCELL - HALF + VCELL / 2, cz = Math.floor(ic / NVC) * VCELL - HALF + VCELL / 2;
      P.cells.push({ mesh, count: cnt, cx, cz });
    }
  };

  // ---------------- 衝突 ----------------
  const COLC = 16, colGrid = new Map();
  W.colGrid = colGrid;
  const ckey = (i, j) => i * 4096 + j;
  W.addCircle = function (x, z, r, top) { const c = { t: 0, x, z, r, top: top == null ? 1e9 : top }; const i = Math.floor(x / COLC), j = Math.floor(z / COLC); const k = ckey(i, j); if (!colGrid.has(k)) colGrid.set(k, []); colGrid.get(k).push(c); return c; };
  W.addBox = function (x, z, hw, hd, rot, top, grid) {
    const c = { t: 1, x, z, hw, hd, c: Math.cos(rot), s: Math.sin(rot), top: top == null ? 1e9 : top }; const R = Math.hypot(hw, hd), g = grid || colGrid;
    for (let i = Math.floor((x - R) / COLC); i <= Math.floor((x + R) / COLC); i++) for (let j = Math.floor((z - R) / COLC); j <= Math.floor((z + R) / COLC); j++) { const k = ckey(i, j); if (!g.has(k)) g.set(k, []); g.get(k).push(c); }
    return c;
  };
  // 円 (x,z,r) を押し出す。y=足元高さ
  W.collide = function (p, r, y, grid) {
    const g = grid || colGrid, i0 = Math.floor((p.x - 4) / COLC), i1 = Math.floor((p.x + 4) / COLC), j0 = Math.floor((p.z - 4) / COLC), j1 = Math.floor((p.z + 4) / COLC);
    let hit = false;
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const arr = g.get(ckey(i, j)); if (!arr) continue;
      for (const c of arr) {
        if (y > c.top) continue;
        if (c.t === 0) { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = r + c.r; if (d < m && d > 1e-5) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; hit = true; } }
        else {
          const dx = p.x - c.x, dz = p.z - c.z, lx = dx * c.c - dz * c.s, lz = dx * c.s + dz * c.c;
          const qx = PS.clamp(lx, -c.hw, c.hw), qz = PS.clamp(lz, -c.hd, c.hd); let ex = lx - qx, ez = lz - qz, d = Math.hypot(ex, ez);
          if (d < r) {
            let nlx, nlz;
            if (d > 1e-5) { nlx = qx + ex / d * r; nlz = qz + ez / d * r; }
            else { const px = c.hw - Math.abs(lx), pz = c.hd - Math.abs(lz); if (px < pz) { nlx = Math.sign(lx || 1) * (c.hw + r); nlz = lz; } else { nlx = lx; nlz = Math.sign(lz || 1) * (c.hd + r); } }
            p.x = c.x + nlx * c.c + nlz * c.s; p.z = c.z - nlx * c.s + nlz * c.c; hit = true;
          }
        }
      }
    }
    return hit;
  };

  // ---------------- 村 ----------------
  const STYLES = {
    plains: { wall: '#e4d8bc', wood: '#6a4a32', roofs: ['#c2553f', '#4f7fbf', '#d0874a'], timber: true, stone: '#9e968a' },
    forest: { wall: '#d9c8a6', wood: '#5a3e2a', roofs: ['#5f8a3e', '#8a5a3a', '#4f7a5a'], timber: true, stone: '#7f786c' },
    desert: { wall: '#dcc496', wood: '#8a6a48', roofs: ['#dcc08e', '#e4c898'], roofType: 'flat', domes: ['#3f8fbf', '#d8a03a', null], stone: '#c9a77a' },
    snow: { wall: '#a8865f', wood: '#5a3e2a', roofs: ['#4f5f72', '#6a4a52'], timber: true, snow: true, stone: '#8a8a90' },
    volcano: { wall: '#5e5650', wood: '#3a2a22', roofs: ['#8a3a2a', '#6a3030'], timber: false, stone: '#3a3332' },
    frost: { wall: '#4a4246', wood: '#2a2224', roofs: ['#e8eef6', '#c8402a'], timber: true, snow: true, stone: '#3a3436' },
    jungle: { wall: '#c8b890', wood: '#4a3a2a', roofs: ['#3a6a4a', '#8a6a3a', '#5a8a6a'], timber: true, stone: '#7a8a7a' },
    savanna: { wall: '#d8a868', wood: '#6a4a2a', roofs: ['#c8a050', '#b88a40'], timber: false, stone: '#b8885a' },
    cloud: { wall: '#f2f4fa', wood: '#7a6a8a', roofs: ['#7a8ac8', '#a8b8f0', '#c890ff'], timber: true, stone: '#c8cce0' },
    beach: { wall: '#f6f2ea', wood: '#7a5a3a', roofs: ['#3a8ad8', '#4fb4ff', '#e85a4a'], roofType: 'flat', domes: ['#3a8ad8', null, '#4fb4ff'], stone: '#e8dcc0' },
    ice: { wall: '#e2eef8', wood: '#5a6a8a', roofs: ['#6fb8f0', '#a8dcff', '#4f86d0'], timber: false, snow: true, domes: ['#9fe6ff', null, '#7fc8ff'], stone: '#b8cfe2' }
  };
  W.buildVillages = function (seed) {
    const gl = PS.R.gl;
    W.villageMeshes = []; W.windmills = []; W.lights = [];
    for (const v of W.VILLAGES) {
      const r = PS.rng(seed + 500 + v.id), st = STYLES[v.style], mb = new PS.MeshBuilder(), y = v.y;
      const put = (x, z, ry, fn) => { PS.with_(mb, PS.TRS(x, W.heightRaw(x, z), z, ry), fn); };
      const nH = v.id === 0 ? 10 : v.id === 16 ? 14 : 8;
      v.houses = [];
      for (let i = 0; i < nH; i++) {
        const a = i / nH * Math.PI * 2 + r() * 0.25 + 0.2, rad = (v.id === 16 ? 46 : 30) + r() * 12, hx = v.x + Math.cos(a) * rad, hz = v.z + Math.sin(a) * rad;
        if (W.roadAt(hx, hz) > 0.2) continue;
        const ry = Math.atan2(v.x - hx, v.z - hz), w = 6 + r() * 2.5, d = 5 + r() * 2, h = 3.3 + r() * 1.2;
        const style = Object.assign({}, st, { roof: st.roofs[i % st.roofs.length], dome: st.domes ? st.domes[i % 3] : null });
        PS.with_(mb, PS.TRS(hx, y, hz, ry), () => PS.Props.house(mb, style, w, d, h));
        W.addBox(hx, hz, w / 2 + 0.2, d / 2 + 0.2, ry, y + h + 4);
        v.houses.push({ x: hx, z: hz, ry, w, d });
        W.lights.push({ p: [hx + Math.sin(ry) * (d / 2 + 0.6), y + 2.2, hz + Math.cos(ry) * (d / 2 + 0.6)], c: [1.0, 0.75, 0.4], r: 9, night: true });
      }
      // 広場
      put(v.x + 12, v.z + 7, 0.3, () => PS.Props.well(mb)); W.addCircle(v.x + 12, v.z + 7, 1.2);
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.5, lx = v.x + Math.cos(a) * 19, lz = v.z + Math.sin(a) * 19; put(lx, lz, 0, () => PS.Props.lantern(mb)); W.addCircle(lx, lz, 0.25); W.lights.push({ p: [lx, W.heightRaw(lx, lz) + 3.1, lz], c: [1.0, 0.78, 0.45], r: 12, night: true }); }
      v.stall = { x: v.x - 13, z: v.z + 9 }; put(v.stall.x, v.stall.z, 0.6, () => PS.Props.stall(mb, v.style === 'desert' ? '#3f8fbf' : '#d8505a')); W.addBox(v.stall.x, v.stall.z, 1.5, 1.0, 0.6, y + 3);
      put(v.x - 16, v.z - 10, 0.2, () => PS.Props.crates(mb)); W.addCircle(v.x - 16, v.z - 10, 1.2);
      put(v.x + 8, v.z - 16, 1.2, () => PS.Props.crates(mb)); W.addCircle(v.x + 8, v.z - 16, 1.2);
      for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 1.0, fx = v.x + Math.cos(a) * 52, fz = v.z + Math.sin(a) * 52; if (W.roadAt(fx, fz) < 0.1) put(fx, fz, -a, () => PS.Props.fence(mb, 8)); }
      put(v.x + 22, v.z + 22, 0.8, () => PS.Props.banner(mb, ['#3a6ad8', '#3a9a5a', '#d8a03a', '#7fb0d8', '#c8402a', '#7fd8ff', '#a06ad8', '#7fffd0', '#ff6a2a', '#ff9a5a', '#7fe0c0', '#ffc84a', '#c38cff', '#4fb4ff', '#7fd8ff', '#a8c8ff', '#bff6ff'][v.id]));
      put(v.x - 24, v.z + 16, 0, () => PS.Props.signpost(mb));
      if (v.style === 'plains') { const mx = v.x - 48, mz = v.z - 30; put(mx, mz, 0.6, () => PS.Props.windmill(mb, { wall: '#efe4cc', roof: '#b24a38' })); W.addCircle(mx, mz, 2.8); W.windmills.push({ x: mx, y: W.heightRaw(mx, mz) + 8.2, z: mz, ry: 0.6 }); }
      if (v.style === 'desert') for (let i = 0; i < 5; i++) { const a = i * 1.3, px = v.x + Math.cos(a) * 25, pz = v.z + Math.sin(a) * 25; }
      const packed = mb.pack();
      W.villageMeshes.push({ mesh: PS.GLH.makeMesh(gl, packed), cx: v.x, cz: v.z, r: 70 });
    }
    W.bladeMesh = PS.GLH.makeMesh(gl, PS.Props.windmillBlades().pack());
  };

  // ---------------- POI: ワープ / 像 / ダンジョン門 / 頂上 ----------------
  W.buildPOIs = function (seed) {
    const gl = PS.R.gl, mk = (mb) => PS.GLH.makeMesh(gl, mb.pack());
    W.M = {
      wpBase: mk(PS.Props.waypointBase()), wpOn: mk(PS.Props.waypointCrystal(true)), wpOff: mk(PS.Props.waypointCrystal(false)), statue: mk(PS.Props.statue()),
      chest0: mk(PS.Props.chest(0)), chest1: mk(PS.Props.chest(1)), chest2: mk(PS.Props.chest(2)), circle: mk(PS.Props.stoneCircle()), torch: mk(PS.Props.torch()),
      tent: mk((() => { const m = new PS.MeshBuilder(); PS.Props.tent(m, '#8a6a4a'); return m; })()),
      fire: mk((() => { const m = new PS.MeshBuilder(); PS.Props.campfire(m); return m; })()),
      totem: mk((() => { const m = new PS.MeshBuilder(); PS.Props.totem(m, '#c8402a'); return m; })())
    };
    const PCOL = ['#a8b4a0', '#7a8a6a', '#c8a274', '#b8ccd8', '#4a4040', '#e8eef6', '#c88a5a', '#c8c0f0', '#3a2a2a'];
    W.portalMesh = PCOL.map(c => mk(PS.Props.portal(c)));
    W.caveMesh = mk(PS.Props.caveMouth());
    W.altarMesh = mk(PS.Props.starAltar());
    for (const w of W.WAYPOINTS) { w.y = W.heightRaw(w.x, w.z); W.addCircle(w.x, w.z, 1.4, w.y + 3); }
    for (const v of W.VILLAGES) { W.addCircle(v.x, v.z, 2.2, v.y + 6); }
    for (const d of W.DUNGEONS) {
      if (d.cave) { for (const s of [-1, 1]) W.addCircle(d.x + Math.cos(d.ry) * 3.6 * s - Math.sin(d.ry) * 0.6, d.z - Math.sin(d.ry) * 3.6 * s - Math.cos(d.ry) * 0.6, 1.6, d.y + 6); continue; }
      d.ry = Math.atan2(W.VILLAGES[d.reg].x - d.x, W.VILLAGES[d.reg].z - d.z); for (const s of [-1, 1]) W.addCircle(d.x + Math.cos(d.ry) * 3.2 * s, d.z - Math.sin(d.ry) * 3.2 * s, 1.0);
    }
    if (W.expanded) W.addCircle(W.SUMMIT2.x, W.SUMMIT2.z, 0.1, -1e9);
    // 第三章：結晶の祭壇（外周の柱）
    if (W.ch3) for (const sh of W.SHRINES) { sh.y = W.heightRaw(sh.x, sh.z); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.2; W.addCircle(sh.x + Math.cos(a) * 26, sh.z + Math.sin(a) * 26, 1.3, sh.y + 9); } }
    // 溶岩
    const mb = new PS.MeshBuilder(); const RR = 16, SS = 40;
    for (let i = 0; i <= RR; i++) { const r = i / RR * 132; for (let s = 0; s <= SS; s++) { const a = s / SS * Math.PI * 2; mb.vert(Math.cos(a) * r, 0, Math.sin(a) * r, 0, 1, 0); } }
    for (let i = 0; i < RR; i++) for (let s = 0; s < SS; s++) { const a = i * (SS + 1) + s, b = a + SS + 1; mb.I.push(a, a + 1, b, a + 1, b + 1, b); }
    W.lavaMesh = mk(mb);
  };

  // ---------------- 敵の配置 / 採集物 / 宝箱 ----------------
  W.placeEntities = function (seed) {
    const EXP = W.expanded;
    W.spawns = []; W.gathers = []; W.chests = []; W.camps = [];
    const GT = { 0: ['sweetflower', 'sweetflower', 'mint'], 1: ['mushroom', 'berry', 'mint'], 2: ['cactusfruit', 'cactusfruit', 'sweetflower'], 3: ['snowflower', 'snowflower', 'ore'], 4: ['firefruit', 'firefruit', 'ore'], 5: ['skyberry', 'skyberry', 'sweetflower'], 6: ['datefruit', 'datefruit', 'ore'], 7: ['aurorapeach', 'snowflower', 'ore'], 8: ['magmapepper', 'firefruit', 'ore'],
      9: ['frostember', 'frostember', 'ore'], 10: ['frostmango', 'frostmango', 'mint'], 11: ['baobab', 'baobab', 'sweetflower'], 12: ['cloudherb', 'cloudherb', 'skyberry'], 13: ['coconut', 'coconut', 'ore'], 14: ['icelily', 'icelily', 'iceshard'], 15: ['snowpear', 'iceshard', 'ore'], 16: ['icelily', 'snowpear', 'iceshard'] };
    const TBL = PS.DATA.SPAWNS;
    const placeRegion = (r, k, vlist, bound, span, counts) => {
      const reg = W.REG[k], cx = reg.R ? reg.c[0] : 0, cz = reg.R ? reg.c[1] : 0;
      const far = (x, z, d) => { for (const v of vlist) if (Math.hypot(x - v.x, z - v.z) < d) return false; if (Math.hypot(x - W.START.x, z - W.START.z) < d * 0.7) return false; return true; };
      const okSpot = (x, z) => { const h = W.heightRaw(x, z); return h > 2 && W.normal(x, z)[1] > 0.82 && Math.abs(x) < bound - 40 && Math.abs(z) < bound - 40; };
      const rx = () => cx + (r() - 0.5) * span, rz = () => cz + (r() - 0.5) * span;
      let made = 0, tries = 0;
      while (made < counts[0] && tries < 3000) {
        tries++;
        const x = rx(), z = rz();
        if (W.region(x, z) !== k || !okSpot(x, z) || !far(x, z, 75)) continue;
        if (W.spawns.some(s => Math.hypot(s.x - x, s.z - z) < 55)) continue;
        const vv = W.VILLAGES.find(v => v.id === k), dc = Math.hypot(x - vv.x, z - vv.z);
        const lv = Math.round(PS.lerp(reg.lv[0], reg.lv[1], PS.clamp(dc / (reg.R ? 500 : 650), 0, 1)) + (r() - 0.5) * 2);
        const grp = TBL[k][Math.floor(r() * TBL[k].length)];
        W.spawns.push({ x, z, reg: k, lv: PS.clamp(lv, reg.lv[0], reg.lv[1]), types: grp, id: W.spawns.length });
        made++;
      }
      // キャンプ
      let camps = 0; tries = 0;
      while (camps < 3 && tries < 2000) {
        tries++; const x = rx(), z = rz();
        if (W.region(x, z) !== k || !okSpot(x, z) || !far(x, z, 120)) continue;
        if (W.camps.some(s => Math.hypot(s.x - x, s.z - z) < 200)) continue;
        const y = W.heightRaw(x, z);
        W.camps.push({ x, z, y, reg: k });
        W.addCircle(x + 5, z, 1.8, y + 3); W.addCircle(x - 4, z + 3, 1.8, y + 3);
        W.spawns.push({ x, z, reg: k, lv: Math.min(reg.lv[1], reg.lv[0] + 3 + camps * 2), types: PS.DATA.CAMPS[k], camp: true, id: W.spawns.length });
        camps++;
      }
      // 精鋭
      let el = 0; tries = 0;
      while (el < 2 && tries < 2000) {
        tries++; const x = rx(), z = rz();
        if (W.region(x, z) !== k || !okSpot(x, z) || !far(x, z, 150)) continue;
        W.spawns.push({ x, z, reg: k, lv: reg.lv[1], types: [PS.DATA.ELITES[k]], elite: true, id: W.spawns.length }); el++;
      }
      // 採集
      tries = 0; let g = 0;
      while (g < counts[1] && tries < 6000) {
        tries++; const x = cx + (r() - 0.5) * (span + 100), z = cz + (r() - 0.5) * (span + 100);
        if (W.region(x, z) !== k || !okSpot(x, z) || W.roadAt(x, z) > 0.2) continue;
        W.gathers.push({ kind: GT[k][Math.floor(r() * 3)], x, y: W.heightRaw(x, z), z, ry: r() * 6.28, taken: 0, id: W.gathers.length }); g++;
      }
      // 宝箱
      tries = 0; let c = 0;
      while (c < 9 && tries < 4000) {
        tries++; const x = rx(), z = rz();
        if (W.region(x, z) !== k || !okSpot(x, z) || !far(x, z, 60)) continue;
        const kind = r() < 0.15 ? 2 : r() < 0.45 ? 1 : 0;
        W.chests.push({ x, y: W.heightRaw(x, z), z, ry: r() * 6.28, kind, reg: k, id: 'c' + W.chests.length, lv: reg.lv[0] + Math.floor(r() * (reg.lv[1] - reg.lv[0])) });
        W.addCircle(x, z, 0.6, W.heightRaw(x, z) + 0.9); c++;
      }
    };
    // 旧エリア：第一章と同じ乱数・同じ地形（ID も同じになる）
    if (W.ch5) { W._Rq = W.RG2; W._Dq = W.ROAD2; }
    {
      const r = PS.rng(seed + 777), oldV = W.VILLAGES.filter(v => !v.ch2 && !v.ch3 && !v.ch5);
      if (EXP) W._Hq = W.H0;
      for (let k = 0; k < 5; k++) placeRegion(r, k, oldV, OLD_HALF, 2600, [34, 150]);
      W._Hq = null;
    }
    // チュートリアル用の花
    for (let i = 0; i < 4; i++) { const a = i * 1.6 + 0.4, x = W.START.x + 6 + Math.cos(a) * 5, z = W.START.z - 12 + Math.sin(a) * 5; W.gathers.push({ kind: 'sweetflower', x, y: W.heightRaw(x, z), z, ry: a, taken: 0, id: W.gathers.length, tut: true }); }
    // 第二章：浮上した大地
    if (EXP) {
      const r = PS.rng(seed + 977), v2 = W.VILLAGES.filter(v => !v.ch3 && !v.ch5);
      if (W.ch3) W._Hq = W.H1;
      for (let k = 5; k < 9; k++) placeRegion(r, k, v2, E2, 2 * (W.REG[k].R + 120), [30, 120]);
      W._Hq = null;
    }
    // 第三章：異界の大地
    if (W.ch3) { const r = PS.rng(seed + 1977); if (W.ch5) W._Hq = W.H2; const v3 = W.VILLAGES.filter(v => !v.ch5); for (let k = 9; k < 14; k++) placeRegion(r, k, v3, E2, 2 * (W.REG[k].R + 120), [30, 120]); W._Hq = null; }
    W._Rq = W._Dq = null;
    // 第五章：凍った外洋・氷河・氷の街
    if (W.ch5) { const r = PS.rng(seed + 2977); placeRegion(r, 14, W.VILLAGES, HALF, 2 * HALF, [44, 90]); placeRegion(r, 15, W.VILLAGES, HALF, 2 * HALF, [26, 60]); placeRegion(r, 16, W.VILLAGES, HALF, 700, [6, 30]); }
  };

  // ---------------- 地形チャンク ----------------
  W.chunks = []; W.lodIdx = [];
  W.buildChunkIndex = function () {
    const gl = PS.R.gl;
    for (let l = 0; l < 4; l++) {
      const s = 1 << l, n = CH / s + 1, I = [];
      for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) { const a = j * n + i, b = a + 1, c = a + n, d = c + 1; I.push(a, c, b, b, c, d); }
      const per = []; for (let i = 0; i < n - 1; i++) per.push(i); for (let j = 0; j < n - 1; j++) per.push(j * n + n - 1); for (let i = n - 1; i > 0; i--) per.push((n - 1) * n + i); for (let j = n - 1; j > 0; j--) per.push(j * n);
      const P = per.length;
      for (let k = 0; k < P; k++) { const t0 = per[k], t1 = per[(k + 1) % P], s0 = n * n + k, s1 = n * n + (k + 1) % P; I.push(t0, t1, s0, t1, s1, s0); }
      const ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(I), gl.STATIC_DRAW);
      W.lodIdx.push({ ibo, count: I.length, n, per });
    }
    for (let cz = 0; cz < NCH; cz++) for (let cx = 0; cx < NCH; cx++) {
      let mn = 1e9, mx = -1e9;
      for (let j = 0; j <= CH; j += 4) for (let i = 0; i <= CH; i += 4) { const h = W.H[(cz * CH + j) * VN + cx * CH + i]; if (h < mn) mn = h; if (h > mx) mx = h; }
      W.chunks.push({ cx, cz, x: cx * CH * CELL - HALF + CH * CELL / 2, z: cz * CH * CELL - HALF + CH * CELL / 2, y: (mn + mx) / 2, r: Math.hypot(CH * CELL * 0.71, (mx - mn) / 2 + 6), mn, mx, lod: [null, null, null, null] });
    }
  };
  W.buildChunk = function (ch, l) {
    const gl = PS.R.gl, L = W.lodIdx[l], n = L.n, s = 1 << l, total = n * n + L.per.length;
    const buf = new ArrayBuffer(total * 24), f = new Float32Array(buf), i8 = new Int8Array(buf), u8 = new Uint8Array(buf);
    const H = W.H, NR = W.NR, COL = W.COL;
    let v = 0;
    const put = (gi, gj, yo) => {
      const idx = gj * VN + gi, o = v * 6, b = v * 24;
      f[o] = gi * CELL - HALF; f[o + 1] = H[idx] + yo; f[o + 2] = gj * CELL - HALF; f[o + 5] = 0;
      i8[b + 12] = NR[idx * 3] * 127; i8[b + 13] = NR[idx * 3 + 1] * 127; i8[b + 14] = NR[idx * 3 + 2] * 127;
      u8[b + 16] = COL[idx * 4]; u8[b + 17] = COL[idx * 4 + 1]; u8[b + 18] = COL[idx * 4 + 2]; u8[b + 19] = COL[idx * 4 + 3]; v++;
    };
    const bx = ch.cx * CH, bz = ch.cz * CH;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) put(bx + i * s, bz + j * s, 0);
    for (const p of L.per) put(bx + (p % n) * s, bz + Math.floor(p / n) * s, -8);
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.BYTE, true, 24, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.UNSIGNED_BYTE, true, 24, 16);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, L.ibo); gl.bindVertexArray(null);
    ch.lod[l] = { vao, count: L.count, itype: gl.UNSIGNED_SHORT };
  };
  W.uploadTextures = function () {
    const gl = PS.R.gl;
    W.heightTex = PS.GLH.tex(gl, VN, VN, gl.R32F, gl.RED, gl.FLOAT, W.H, gl.NEAREST);
    W.splatTex = PS.GLH.tex(gl, VN, VN, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, W.SPL, gl.LINEAR);
    W.texInfo = { half: HALF, cell: CELL, res: VN };
  };
})(window.PS);
