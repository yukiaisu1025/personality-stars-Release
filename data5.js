// Release v1.0.0：第五章「氷の住む街とタイプドラゴン」・夜島・ミラクルガチャ・プラスパス・ログインボーナス・ヨミガエクリスタル
(function (PS) {
  'use strict';
  const D = PS.DATA;
  D.VERSION = '1.0.0';
  D.VERSION_LABEL = 'Release v1.0.0';
  D.RELEASE = true;
  D.SWITCH_KEYS = 4;            // 人格切り替え：主人公＋旅の仲間 最大3人（キー 1〜4）
  D.SWITCH_COMP_MAX = 3;
  D.keyList = () => Array.from({ length: D.SWITCH_KEYS }, (_, i) => i + 1);
  D.YOMIGAE_RATE = 0.0001;      // ヨミガエクリスタル：宝箱・敵から 0.01%

  // ================= アイテム =================
  Object.assign(D.ITEMS, {
    icelily: { name: '氷華', cat: 'food', heal: 0.3, rar: 3, icon: '❄', desc: '凍った海に咲く氷の花。HPが30%回復する。', price: 900, sell: 80 },
    snowpear: { name: '雪梨', cat: 'food', heal: 0.45, rar: 3, icon: '🍐', desc: '氷河のふもとで育つ、しゃりしゃりの梨。HPが45%回復する。', price: 1600, sell: 140 },
    frostfish: { name: '氷魚の塩焼き', cat: 'food', heal: 0.6, rar: 4, icon: '🐟', desc: '氷の住む街の名物料理。HPが60%回復する。', price: 3600, sell: 300 },
    iceshard: { name: '氷のかけら', cat: 'mat', rar: 3, icon: '🧊', desc: '溶けない不思議な氷。氷の街で高く売れる。', sell: 420 },
    icecrystal: { name: '氷晶', cat: 'key', rar: 5, sell: 0, icon: '💠', desc: '氷晶の番人が守っていた、凍った世界の結晶。五つ集めると、氷の城塞への道が開く。' },
    typescale: { name: 'タイプドラゴンの逆鱗', cat: 'mat', rar: 5, icon: '🐉', desc: 'タイプドラゴンが落とした、属性を移ろわせる鱗。', sell: 20000 },
    yomigae: { name: 'ヨミガエクリスタル', cat: 'key', rar: 5, sell: 0, icon: '🔮', desc: 'めったに見つからない再生の結晶。自分では使えないが、持っている状態でHPが0になると、再生の力でHPが最大の状態で生き返る（1回で1つ消費）。' },
    gachaticket: { name: 'ミラクルチケット', cat: 'key', rar: 4, sell: 0, price: 2800, icon: '🎫', desc: 'ミラクルガチャを1回引けるチケット。' },
    nightbloom: { name: '夜光花', cat: 'food', heal: 0.4, rar: 3, icon: '🌙', desc: '夜島にだけ咲く、光る花。HPが40%回復する。', price: 1400, sell: 120 },
    moonstone: { name: '月長石', cat: 'mat', rar: 4, icon: '🌕', desc: '夜島で見つかる、重さの変わる石。', sell: 1800 },
    plusburger: { name: 'プラスバーガー', cat: 'food', heal: 0.75, rar: 4, icon: '🍔', desc: 'プラスタウン名物の特大バーガー。HPが75%回復する。', price: 6000, sell: 500 },
    starparfait: { name: 'スターパフェ', cat: 'food', heal: 1.0, rar: 5, icon: '🍨', desc: 'プラスタウンの高級パフェ。HPが全回復する。', price: 12000, sell: 1200 }
  });
  D.REGION_FOOD.push('icelily', 'snowpear', 'frostfish');
  D.ITEMS.pluscrystal.price = 40000; // プラスマート（プラスタウン）で買える
  D.REGION_TIER.push(11, 11, 11);

  // ================= 武器 =================
  const Wp = (id, name, type, atk, rar, el, look, desc, price) => ({ id, name, type, atk, rar, el, look: look || {}, desc, price: price || 0 });
  D.WEAPONS.push(
    Wp('s_frost', '氷剣フロストブリンガー', 'sword', 52000, 5, 'ice', { blade: '#dff6ff', guard: '#7fd8ff', glow: '#bff6ff' }, '凍った世界の氷晶で鍛えた剣。', 900000),
    Wp('a_frost', '氷斧アイスバーグ', 'axe', 54000, 5, 'ice', { blade: '#cfefff', glow: '#9fe6ff', guard: '#5a8ab0' }, '氷山を削り出したような大斧。', 900000),
    Wp('t_frost', '氷杖ブリザード', 'staff', 50500, 5, 'ice', { glow: '#bff6ff', blade: '#5a8ab0' }, '吹雪を呼ぶ氷の杖。', 900000),
    Wp('s_type', '竜剣タイプレクス', 'sword', 58000, 5, 'fire', { blade: '#fff0e0', guard: '#c8402a', glow: '#ff9a5a' }, 'タイプドラゴンの逆鱗を打ち込んだ、属性が揺らめく剣。'),
    Wp('a_type', '竜斧タイプクラッシャー', 'axe', 60000, 5, 'thunder', { blade: '#f0e8ff', glow: '#c38cff', guard: '#3a2a6a' }, 'タイプドラゴンの爪をそのまま刃にした大斧。'),
    Wp('t_type', '竜杖タイプオーブ', 'staff', 56500, 5, 'water', { glow: '#7fd8ff', blade: '#2a4a8a' }, 'タイプドラゴンの瞳を宿した杖。'),
    Wp('s_night', '夜剣ノクターン', 'sword', 61000, 5, 'dark', { blade: '#c8c0ff', guard: '#2a2a5a', glow: '#b07aff' }, '夜島の王が振るっていた漆黒の剣。'),
    Wp('a_night', '夜斧クレセント', 'axe', 63000, 5, 'dark', { blade: '#e0d8ff', glow: '#9a7aff', guard: '#1a1a3a' }, '三日月の形をした夜の大斧。'),
    Wp('t_night', '夜杖スターダスト', 'staff', 59500, 5, 'light', { glow: '#fff2b0', blade: '#2a2a5a' }, '星くずを散りばめた夜の杖。')
  );
  D.W = {}; D.WEAPONS.forEach(w => D.W[w.id] = w);
  D.TIER_WEAPON.push({ sword: 's_frost', axe: 'a_frost', staff: 't_frost' }, { sword: 's_type', axe: 'a_type', staff: 't_type' }, { sword: 's_night', axe: 'a_night', staff: 't_night' }); // 13, 14, 15

  // ================= 敵 =================
  const E = (o) => Object.assign({ hpK: 1, atkK: 1, defK: 1, speed: 3, aggro: 14, keep: 0, el: 'phys', weak: null, exp: 1, drops: [], scale: 1, radius: 0.5 }, o);
  const tint = (key, look, scale) => { const m = D.ENEMIES[key].model; return [m[0], Object.assign({}, m[1], look), scale != null ? scale : m[2]]; };
  const ICEHUM = (o) => Object.assign({ gender: 'm', main: '#3a5a8a', sub: '#dff2ff', accent: '#7fd8ff', accentE: 0.5, pants: '#2a3a5a', boots: '#e8f4ff', hair: '#e8f4ff', eye: '#7fe8ff', skin: '#e8eef8' }, o);
  Object.assign(D.ENEMIES, {
    // ---- 第五章：凍った外洋 ----
    rime_knight: E({ name: '霜の騎士', model: ['human', ICEHUM({ armor: '#dbe8f4', knightHelm: '#e8f2fc', plume: '#7fd8ff', weapon: { type: 'sword', blade: '#dff6ff', glow: '#7fd8ff' } }), 1.05], hpK: 2.3, atkK: 1.55, defK: 1.9, speed: 3.5, el: 'ice', weak: 'fire', exp: 1.6, drops: [['iceshard', 0.2], ['core', 0.3]], radius: 0.6, atk: [{ kind: 'melee', windup: 0.55, r: 3, ang: 1.9, mult: 1.35, cd: 1.6, anim: 'atk', status: 'slow' }, { kind: 'charge', windup: 0.7, dist: 14, w: 2.2, mult: 1.4, range: 16, cd: 5, anim: 'atk', tele: true }] }),
    snow_witch: E({ name: '雪の魔女', model: ['human', ICEHUM({ gender: 'f', gown: true, main: '#dff2ff', sub: '#7fb8e8', hair: '#f4f8ff', crown: '#bff6ff', weapon: { type: 'staff', glow: '#bff6ff', blade: '#5a8ab0' } }), 0.98], hpK: 1.4, atkK: 1.5, speed: 3.2, keep: 12, aggro: 24, el: 'ice', weak: 'fire', exp: 1.3, drops: [['icelily', 0.15], ['iceshard', 0.12]], atk: [{ kind: 'proj', windup: 0.7, speed: 26, mult: 1.0, range: 26, cd: 2.0, anim: 'cast', look: 'lance', count: 3, spread: 0.35, status: 'slow' }, { kind: 'aoe', windup: 1.1, r: 3.6, mult: 1.3, range: 24, cd: 6, tele: true, count: 3, look: 'icespike', anim: 'cast', status: 'freeze' }] }),
    glacier_wolf: E({ name: '氷河狼', model: tint('aurora_wolf', { color: '#dfeefa', dark: '#8aa8c8', belly: '#ffffff', eye: '#7fd8ff', tailTip: '#7fd8ff', spikes: '#bff6ff' }, 1.25), hpK: 1.6, atkK: 1.45, speed: 5.8, el: 'ice', weak: 'fire', exp: 1.2, drops: [['meat', 0.4], ['iceshard', 0.08]], radius: 0.7, atk: [{ kind: 'melee', windup: 0.45, r: 2.6, ang: 1.4, mult: 1.2, cd: 1.3, anim: 'bite', status: 'slow' }, { kind: 'charge', windup: 0.5, dist: 12, w: 1.8, mult: 1.3, range: 14, cd: 4.5, anim: 'charge', tele: true }] }),
    frost_golem: E({ name: '氷晶ゴーレム', model: ['golem', { rock: '#bfe0f4', dark: '#6a8aa8', glow: '#7fe8ff' }, 1.6], hpK: 3.4, atkK: 1.6, defK: 2.2, speed: 2.3, el: 'ice', weak: 'fire', exp: 2, drops: [['iceshard', 0.35], ['core', 0.4]], radius: 1.0, atk: [{ kind: 'melee', windup: 0.8, r: 3.8, ang: 2, mult: 1.6, cd: 2.4, anim: 'slam', tele: true, status: 'freeze' }, { kind: 'jump', windup: 0.9, r: 4.5, mult: 1.8, range: 12, cd: 6, anim: 'slam', tele: true }] }),
    ice_slime2: E({ name: '氷河スライム', model: ['slime', { color: '#bfe8ff', kind: 'ice', top: '#ffffff', e: 0.15 }, 1.3], hpK: 1.2, atkK: 1.3, speed: 3.2, el: 'ice', weak: 'fire', exp: 1, drops: [['icelily', 0.12]], atk: [{ kind: 'melee', windup: 0.5, r: 2.4, ang: 2.4, mult: 1.1, cd: 1.6, anim: 'atk', status: 'slow' }] }),
    crystal_wisp: E({ name: '氷晶の精', model: ['spirit', { glow: '#bff6ff', shell: '#7fb8e8', shellE: 0.8 }], hpK: 1.3, atkK: 1.45, speed: 3.4, keep: 9, aggro: 22, el: 'ice', weak: 'thunder', fly: true, exp: 1.2, drops: [['iceshard', 0.15]], atk: [{ kind: 'proj', windup: 0.7, speed: 24, mult: 1.0, range: 24, cd: 2.2, look: 'orb', count: 3, spread: 0.45, anim: 'cast' }] }),
    polar_bear: E({ name: '大白熊', model: tint('fenrir', { color: '#f4f6fa', dark: '#c8ccd8', belly: '#ffffff', eye: '#3a3a4a', tailTip: '#e8ecf4', spikes: '#e8ecf4', spikeS: 0.2, ears: 0.18 }, 1.5), hpK: 2.8, atkK: 1.6, defK: 1.6, speed: 3.6, el: 'phys', weak: 'fire', exp: 1.8, drops: [['meat', 0.7], ['core', 0.3]], radius: 1.1, atk: [{ kind: 'melee', windup: 0.6, r: 3.6, ang: 1.8, mult: 1.5, cd: 1.8, anim: 'bite', tele: true }, { kind: 'charge', windup: 0.8, dist: 16, w: 2.6, mult: 1.6, range: 18, cd: 5, anim: 'charge', tele: true }] }),
    type_whelp: E({ name: 'タイプの竜仔', model: tint('astral', { color: '#3a2a5a', dark: '#1a1430', belly: '#ff9a5a', eye: '#ffe8a0', tailTip: '#7fd8ff', spikes: '#c38cff', wings: 2.2, wingC: '#4a3a7a' }, 1.1), hpK: 2.0, atkK: 1.6, speed: 4, el: 'fire', exp: 1.6, drops: [['core', 0.4]], radius: 1.0, atk: [{ kind: 'melee', windup: 0.6, r: 3.4, ang: 1.8, mult: 1.4, cd: 1.6, anim: 'bite' }, { kind: 'cone', windup: 0.9, r: 10, ang: 0.8, mult: 0.6, ticks: 4, cd: 6, tele: true, anim: 'breath', status: 'burn' }] }),
    // 精鋭
    frost_titan: E({ name: '氷の巨人フリムスルス', elite: true, model: ['golem', { rock: '#dfeefa', dark: '#5a7a9a', glow: '#bff6ff' }, 2.6], hpK: 9, atkK: 1.9, defK: 2.4, speed: 2.6, el: 'ice', weak: 'fire', exp: 6, drops: [['iceshard', 1], ['pluscrystal', 0.6], ['snowpear', 0.6]], radius: 1.6, atk: [{ kind: 'melee', windup: 0.9, r: 5.5, ang: 2.2, mult: 1.8, cd: 2.4, anim: 'slam', tele: true, status: 'freeze' }, { kind: 'jump', windup: 1.0, r: 7, mult: 2.0, range: 16, cd: 6, anim: 'slam', tele: true }, { kind: 'ring', windup: 1.0, r: 14, mult: 1.5, cd: 9, anim: 'slam' }] }),
    ice_queen: E({ name: '氷の女王イザヴェル', elite: true, model: ['human', ICEHUM({ gender: 'f', gown: true, main: '#e8f6ff', sub: '#4f86d0', hair: '#ffffff', crown: '#9fe6ff', cape: '#bfe0f4', capeLong: true, weapon: { type: 'staff', glow: '#bff6ff', blade: '#4f86d0' } }), 1.35], hpK: 7, atkK: 1.9, defK: 2, speed: 3.4, keep: 10, el: 'ice', weak: 'fire', exp: 6, drops: [['iceshard', 1], ['pluscrystal', 0.6], ['frostfish', 0.5]], radius: 0.8, atk: [{ kind: 'proj', windup: 0.7, speed: 26, mult: 1.1, range: 28, cd: 2.0, count: 5, spread: 0.7, look: 'lance', anim: 'cast', status: 'slow' }, { kind: 'aoe', windup: 1.1, r: 4, mult: 1.5, range: 28, cd: 5, tele: true, count: 6, look: 'icespike', anim: 'cast', status: 'freeze' }, { kind: 'summon', windup: 1.0, cd: 16, what: 'crystal_wisp', n: 2, anim: 'cast' }] }),
    ice_pylon: E({ name: '氷晶柱', model: ['spirit', { glow: '#bff6ff', shell: '#7fb8e8', shellE: 1.0 }, 1.8], hpK: 2.6, atkK: 0.1, defK: 1.4, speed: 0, aggro: 0, passive: true, static: true, el: 'ice', weak: 'fire', exp: 0.5, drops: [], radius: 0.9, atk: [] })
  });
  // 氷晶の番人（祠の主）
  const GUARD5 = [
    ['g5_knight', '氷晶の番人 ヴァルグレイ', ['human', ICEHUM({ armor: '#e8f2fc', knightHelm: '#dff6ff', plume: '#4f86d0', cape: '#4f86d0', capeLong: true, weapon: { type: 'greatsword', blade: '#dff6ff', glow: '#7fd8ff' } }), 2.6], 'ice', 'fire'],
    ['g5_wolf', '氷晶の番人 スコルハティ', tint('fenrir', { color: '#cfe6fa', dark: '#6a8ab0', belly: '#ffffff', eye: '#bff6ff', spikes: '#9fe6ff' }, 2.6), 'ice', 'fire'],
    ['g5_golem', '氷晶の番人 グラキオン', ['golem', { rock: '#cfe6fa', dark: '#4f6a8a', glow: '#bff6ff' }, 3.4], 'ice', 'thunder'],
    ['g5_queen', '氷晶の番人 スノウリリィ', ['human', ICEHUM({ gender: 'f', gown: true, main: '#f4faff', sub: '#7fb8e8', hair: '#ffffff', crown: '#bff6ff', wings: '#dff6ff', wingTip: '#7fd8ff', wingE: 0.5, weapon: { type: 'staff', glow: '#bff6ff' } }), 2.6], 'ice', 'fire'],
    ['g5_treant', '氷晶の番人 ユミルウッド', ['treant', { leaf: '#3a5a7a', leaf2: '#e8f6ff', glow: '#bff6ff', flowers: '#ffffff' }, 3.8], 'ice', 'fire']
  ];
  D.GUARD5 = GUARD5.map(g => g[0]);
  for (const [k, name, model, el, weak] of GUARD5) D.ENEMIES[k] = E({
    name, boss: true, model, hpK: 34, atkK: 2.1, defK: 2.2, speed: 3.8, el, weak, exp: 60, radius: 1.6, keep: 6,
    atk: [{ kind: 'melee', windup: 0.7, r: 6.5, ang: 2.4, mult: 1.7, cd: 1.7, anim: model[0] === 'quad' ? 'bite' : 'atk', tele: true, status: 'slow' }, { kind: 'aoe', windup: 1.1, r: 4.2, mult: 1.6, range: 34, cd: 5, tele: true, count: 7, look: 'icespike', anim: model[0] === 'quad' ? 'roar' : 'cast', status: 'freeze' }, { kind: 'ring', windup: 1.0, r: 18, mult: 1.6, cd: 8, anim: model[0] === 'quad' ? 'roar' : 'cast' }, { kind: 'line', windup: 1.0, len: 26, w: 3, mult: 1.7, cd: 5, tele: true, fan: 5, anim: model[0] === 'quad' ? 'breath' : 'cast' }, { kind: 'summon', windup: 1.0, cd: 18, what: 'crystal_wisp', n: 2, phase2: true, anim: model[0] === 'quad' ? 'roar' : 'cast' }]
  });
  // 真の邪悪ボス：タイプドラゴン（属性＝タイプが次々に変わる）
  D.ENEMIES.typedragon = E({
    name: 'タイプドラゴン', boss: true, model: tint('astral', { color: '#2a1a3a', dark: '#0e0818', belly: '#ff6a2a', eye: '#ffe8a0', tailTip: '#7fd8ff', spikes: '#ff9ef0', horns: 1.0, hornC: '#ffe8a0', wings: 4.2, wingC: '#3a1a4a' }, 4.4),
    hpK: 58, atkK: 2.5, defK: 2.6, speed: 4.2, el: 'fire', weak: 'water', exp: 400, radius: 3.2, keep: 8,
    atk: [{ kind: 'melee', windup: 0.7, r: 9, ang: 2.4, mult: 1.9, cd: 1.7, anim: 'bite', tele: true }, { kind: 'cone', windup: 1.0, r: 22, ang: 0.9, mult: 0.85, ticks: 6, cd: 6, tele: true, anim: 'breath' }, { kind: 'aoe', windup: 1.2, r: 5, mult: 1.8, range: 44, cd: 5.5, tele: true, count: 10, look: 'meteor', anim: 'roar' }, { kind: 'charge', windup: 0.9, dist: 32, w: 4.4, mult: 2.0, range: 34, cd: 6, anim: 'charge', tele: true }, { kind: 'ring', windup: 1.0, r: 24, mult: 1.8, cd: 8, anim: 'roar' }, { kind: 'line', windup: 1.1, len: 36, w: 3.4, mult: 1.9, cd: 6, tele: true, fan: 7, anim: 'breath' }, { kind: 'summon', windup: 1.0, cd: 18, what: 'type_whelp', n: 2, phase2: true, anim: 'roar' }]
  });
  // タイプ（属性）の順番と、弱点
  D.TYPES = [['fire', 'water', '炎'], ['ice', 'fire', '氷'], ['thunder', 'earth', '雷'], ['earth', 'wind', '大地'], ['water', 'thunder', '水'], ['wind', 'ice', '風'], ['dark', 'light', '闇']];
  D.SPAWNS[14] = [['glacier_wolf', 'glacier_wolf'], ['ice_slime2', 'ice_slime2', 'ice_slime2'], ['rime_knight', 'snow_witch'], ['polar_bear'], ['crystal_wisp', 'crystal_wisp'], ['glacier_wolf', 'rime_knight']];
  D.SPAWNS[15] = [['frost_golem'], ['rime_knight', 'rime_knight', 'snow_witch'], ['polar_bear', 'glacier_wolf'], ['crystal_wisp', 'snow_witch'], ['type_whelp']];
  D.SPAWNS[16] = [['ice_slime2', 'ice_slime2'], ['glacier_wolf']];
  D.CAMPS[14] = ['rime_knight', 'snow_witch', 'rime_knight', 'glacier_wolf']; D.CAMPS[15] = ['rime_knight', 'frost_golem', 'snow_witch', 'rime_knight']; D.CAMPS[16] = ['ice_slime2', 'glacier_wolf', 'ice_slime2'];
  D.ELITES[14] = 'ice_queen'; D.ELITES[15] = 'frost_titan'; D.ELITES[16] = 'frost_titan';

  // ================= 夜島 =================
  const NIGHTHUM = (o) => Object.assign({ gender: 'm', main: '#1a1a3a', sub: '#6a5aaa', accent: '#b07aff', accentE: 0.7, pants: '#12122a', boots: '#2a2a4a', hair: '#c8c0ff', eye: '#ffe8a0', skin: '#c8c4e0' }, o);
  Object.assign(D.ENEMIES, {
    moon_wolf: E({ name: '月影狼', model: tint('aurora_wolf', { color: '#1a1a3a', dark: '#0a0a1a', belly: '#6a5aaa', eye: '#ffe8a0', tailTip: '#fff2b0', spikes: '#b07aff' }, 1.25), hpK: 1.7, atkK: 1.55, speed: 6, el: 'dark', weak: 'light', exp: 1.3, drops: [['nightbloom', 0.12], ['moonstone', 0.05]], radius: 0.7, atk: [{ kind: 'melee', windup: 0.45, r: 2.6, ang: 1.4, mult: 1.25, cd: 1.3, anim: 'bite' }, { kind: 'charge', windup: 0.5, dist: 14, w: 1.8, mult: 1.35, range: 16, cd: 4.5, anim: 'charge', tele: true }] }),
    night_wisp: E({ name: '夜光の精', model: ['spirit', { glow: '#fff2b0', shell: '#3a2a6a', shellE: 0.6 }], hpK: 1.4, atkK: 1.55, speed: 3.6, keep: 9, aggro: 22, el: 'light', weak: 'dark', fly: true, exp: 1.2, drops: [['moonstone', 0.06]], atk: [{ kind: 'proj', windup: 0.7, speed: 22, mult: 1.0, range: 24, cd: 2.0, look: 'orb', count: 4, spread: 0.6, homing: true, anim: 'cast' }] }),
    shadow_knight: E({ name: '影の騎士', model: ['human', NIGHTHUM({ armor: '#2a2a4a', knightHelm: '#1a1a3a', plume: '#b07aff', cape: '#1a1a3a', weapon: { type: 'sword', blade: '#c8c0ff', glow: '#b07aff' } }), 1.08], hpK: 2.5, atkK: 1.65, defK: 2, speed: 3.6, el: 'dark', weak: 'light', exp: 1.7, drops: [['moonstone', 0.08], ['core', 0.3]], radius: 0.6, atk: [{ kind: 'melee', windup: 0.5, r: 3.2, ang: 1.9, mult: 1.4, cd: 1.5, anim: 'atk' }, { kind: 'charge', windup: 0.6, dist: 16, w: 2.2, mult: 1.5, range: 18, cd: 4.5, anim: 'atk', tele: true }] }),
    moon_golem: E({ name: '月石ゴーレム', model: ['golem', { rock: '#3a3a5a', dark: '#1a1a2a', glow: '#fff2b0' }, 1.7], hpK: 3.6, atkK: 1.7, defK: 2.4, speed: 2.4, el: 'earth', weak: 'thunder', exp: 2, drops: [['moonstone', 0.2], ['core', 0.4]], radius: 1.0, atk: [{ kind: 'melee', windup: 0.8, r: 4, ang: 2, mult: 1.7, cd: 2.4, anim: 'slam', tele: true }, { kind: 'jump', windup: 0.9, r: 5, mult: 1.9, range: 14, cd: 6, anim: 'slam', tele: true }] }),
    star_eater: E({ name: '星喰いの蝕', model: ['mushroom', { cap: '#3a2a6a', dots: '#fff2b0' }, 1.4], hpK: 1.6, atkK: 1.5, speed: 3, el: 'dark', weak: 'light', exp: 1.2, drops: [['nightbloom', 0.2]], atk: [{ kind: 'aoe', windup: 1.0, r: 3.4, mult: 1.3, range: 18, cd: 4, tele: true, count: 2, look: 'meteor', anim: 'atk', status: 'slow' }] }),
    night_slime: E({ name: '星くずスライム', model: ['slime', { color: '#2a2a5a', kind: 'thunder', top: '#fff2b0', e: 0.25 }, 1.2], hpK: 1.2, atkK: 1.35, speed: 3.4, el: 'thunder', weak: 'earth', exp: 1, drops: [['nightbloom', 0.12]], atk: [{ kind: 'melee', windup: 0.5, r: 2.4, ang: 2.4, mult: 1.1, cd: 1.5, anim: 'atk' }] })
  });
  const NBOSS = [
    ['nb_treant', '月影の森の主 ルナウッド', ['treant', { leaf: '#2a2a5a', leaf2: '#8a7aff', glow: '#fff2b0', flowers: '#fff2b0' }, 4.2], 'dark', 'light', 104],
    ['nb_witch', '逆さ湖の魔女 ミラージュ', ['human', NIGHTHUM({ gender: 'f', gown: true, main: '#2a2a5a', sub: '#7fd8ff', hair: '#e8f4ff', crown: '#7fd8ff', cape: '#1a1a3a', capeLong: true, weapon: { type: 'staff', glow: '#7fd8ff' } }), 2.6], 'water', 'thunder', 108],
    ['nb_eater', '星喰いの塔の主 アステロファージ', tint('astral', { color: '#0e0a1e', dark: '#05030c', belly: '#fff2b0', eye: '#ff6a8a', spikes: '#fff2b0', wingC: '#1a1030' }, 3.6), 'dark', 'light', 112],
    ['nb_nox', '夜の王 ノクス', ['human', NIGHTHUM({ armor: '#1a1a3a', knightHelm: '#0e0e22', plume: '#fff2b0', cape: '#0e0e22', capeLong: true, crown: '#fff2b0', wings: '#1a1a3a', wingTip: '#b07aff', wingE: 0.6, weapon: { type: 'greatsword', blade: '#c8c0ff', glow: '#b07aff' } }), 3.2], 'dark', 'light', 118]
  ];
  for (const [k, name, model, el, weak] of NBOSS) D.ENEMIES[k] = E({
    name, boss: true, model, hpK: k === 'nb_nox' ? 62 : 40, atkK: 2.3, defK: 2.4, speed: 4, el, weak, exp: 120, radius: 1.8, keep: 7,
    atk: [{ kind: 'melee', windup: 0.7, r: 7, ang: 2.4, mult: 1.8, cd: 1.7, anim: model[0] === 'quad' ? 'bite' : 'atk', tele: true }, { kind: 'proj', windup: 0.8, speed: 18, mult: 1.0, range: 40, cd: 5, count: 12, spread: 6.28, look: 'orb', homing: true, anim: model[0] === 'quad' ? 'roar' : 'cast' }, { kind: 'aoe', windup: 1.1, r: 4.5, mult: 1.7, range: 36, cd: 5, tele: true, count: 8, look: 'meteor', anim: model[0] === 'quad' ? 'roar' : 'cast' }, { kind: 'ring', windup: 1.0, r: 20, mult: 1.7, cd: 8, anim: model[0] === 'quad' ? 'roar' : 'cast' }, { kind: 'line', windup: 1.0, len: 30, w: 3, mult: 1.8, cd: 5, tele: true, fan: 6, anim: model[0] === 'quad' ? 'breath' : 'cast' }, { kind: 'summon', windup: 1.0, cd: 18, what: 'shadow_knight', n: 2, phase2: true, anim: model[0] === 'quad' ? 'roar' : 'cast' }]
  });
  D.NIGHT = {
    gravity: 0.58,
    mobs: ['moon_wolf', 'night_wisp', 'shadow_knight', 'moon_golem', 'star_eater', 'night_slime'],
    chapters: [
      { id: 0, name: '夜島 第一章「月影の森」', dun: '月影の森の迷宮', theme: 'nightwood', lv: 102, boss: 'nb_treant', color: '#b07aff', intro: ['ここは夜島。太陽がのぼらない、星と月だけの島です。', '島の森の奥で、月の光を食べてしまう大樹が暴れています。', '月影の森の迷宮へ向かい、森の主を鎮めてください。'] },
      { id: 1, name: '夜島 第二章「逆さ湖」', dun: '逆さ湖の神殿', theme: 'mirrorlake', lv: 106, boss: 'nb_witch', color: '#7fd8ff', intro: ['森が静かになりました。ありがとうございます。', 'でも……湖に映る空が、上と下で入れ替わってしまったのです。', '逆さ湖の神殿にいる魔女が、夜島の重さをねじ曲げているようです。'] },
      { id: 2, name: '夜島 第三章「星喰いの塔」', dun: '星喰いの塔', theme: 'startower', lv: 110, boss: 'nb_eater', color: '#fff2b0', intro: ['夜空から、星が一つずつ消えていきます。', '星喰いの塔の主が、星の光を食べているのです。', '塔の頂で、星喰いを止めてください。'] },
      { id: 3, name: '夜島 第四章「夜の王」', dun: '夜の王城', theme: 'nightcastle', lv: 116, boss: 'nb_nox', color: '#ff9ef0', intro: ['……すべての異変は、夜の王ノクスのしわざでした。', 'ノクスは、夜島を永遠の夜にとじこめようとしています。', '夜の王城へ。これが、夜島の最後の戦いです。'] }
    ]
  };
  Object.assign(D.DUNGEON_MOBS, {
    nightwood: ['moon_wolf', 'star_eater', 'night_slime', 'shadow_knight'], mirrorlake: ['night_wisp', 'night_slime', 'shadow_knight', 'moon_wolf'],
    startower: ['night_wisp', 'moon_golem', 'shadow_knight', 'star_eater'], nightcastle: ['shadow_knight', 'moon_golem', 'moon_wolf', 'night_wisp'],
    icecave5: ['rime_knight', 'frost_golem', 'glacier_wolf', 'snow_witch'], adv: ['rime_knight', 'shadow_knight', 'frost_golem', 'moon_wolf', 'seraph_knight']
  });
  Object.assign(D.DUNGEON_RANGED, { nightwood: ['night_wisp'], mirrorlake: ['night_wisp'], startower: ['night_wisp'], nightcastle: ['night_wisp'], icecave5: ['snow_witch', 'crystal_wisp'], adv: ['snow_witch', 'night_wisp', 'seraph_archer'] });
  for (const t of ['nightwood', 'mirrorlake', 'startower', 'nightcastle', 'icecave5', 'adv']) { D.DUNGEON_MOBS[t] = D.DUNGEON_MOBS[t].filter(k => D.ENEMIES[k]); D.DUNGEON_RANGED[t] = D.DUNGEON_RANGED[t].filter(k => D.ENEMIES[k]); }

  // ================= 応用ダンジョン（第五章クリア後、各地にたくさん出現） =================
  D.ADV_DUNGEONS = [
    { id: 15, name: '応用ダンジョン・始まりの深淵', near: [-300, 300], lv: 104, boss: 'galeKnight', theme: 'wind', size: [4, 4], gim: 'thunder', color: '#7fe8c8', stone: '#8a9aa0' },
    { id: 16, name: '応用ダンジョン・翠樹の深淵', near: [900, 0], lv: 106, boss: 'elderTreant', theme: 'forest', size: [4, 4], gim: 'sand', color: '#8ad06a', stone: '#5a7a4a' },
    { id: 17, name: '応用ダンジョン・砂王の深淵', near: [0, 1100], lv: 108, boss: 'scorpius', theme: 'sand', size: [4, 5], gim: 'sand', color: '#ffc84a', stone: '#b89060' },
    { id: 18, name: '応用ダンジョン・氷晶の深淵', near: [100, -1100], lv: 110, boss: 'glacies', theme: 'ice', size: [4, 5], gim: 'ice', color: '#9fe6ff', stone: '#a8c8dc' },
    { id: 19, name: '応用ダンジョン・溶岩の深淵', near: [-900, -200], lv: 112, boss: 'ignis', theme: 'lava', size: [5, 4], gim: 'fire', color: '#ff7a3a', stone: '#4a3632' },
    { id: 20, name: '応用ダンジョン・天空の深淵', near: [1700, 600], lv: 114, boss: 'archangel', theme: 'sky', size: [5, 4], gim: 'thunder', color: '#fff2b0', stone: '#c8c0b0' },
    { id: 21, name: '応用ダンジョン・極光の深淵', near: [-300, -1700], lv: 116, boss: 'fenrir', theme: 'aurora', size: [5, 5], gim: 'ice', color: '#7fffd0', stone: '#8aa0b0' },
    { id: 22, name: '応用ダンジョン・虚晶の深淵', near: [1300, 1100], lv: 120, boss: 'crystalion', theme: 'starcave', size: [5, 5], gim: 'thunder', color: '#ff9ef0', stone: '#5a4a7a' }
  ];
  D.DUNGEON_TIER.push(11, 11, 11, 11, 11, 11, 11, 11); // 15〜22（ボス撃破時は個別に強い報酬）

  // ================= 旅の仲間（第五章の4人＋ミラクルガチャの15人＋プラスタウンの3人） =================
  const ROLE = {
    blade: { hp: 1700, atk: 560, def: 260, spd: 1.08, style: 'melee', interval: 1.0, reach: 2.9, ang: 1.8, mult: 1.0, wtype: 'sword', wl: 'sword', sk: [['arc', 4.4, 2.4, 2.6, 6], ['buff', 'atk', 0.3, 12, 22], ['nova', 5.5, 3.4, 10], ['volley', 3, 0.4, 30, 1.6, 8, 'blade'], ['rain', 6, 6, 4.5, 3.8, 18]] },
    heavy: { hp: 2200, atk: 610, def: 330, spd: 0.95, style: 'melee', interval: 1.5, reach: 3.4, ang: 2.2, mult: 1.5, wtype: 'hammer', wl: 'axe', sk: [['arc', 5.2, 2.6, 3.0, 7], ['nova', 6.5, 3.6, 11], ['buff', 'def', 0.45, 12, 22], ['charge', 14, 2.8, 2.6, 9], ['rain', 4, 5, 5.2, 4.4, 18]] },
    lancer: { hp: 2300, atk: 480, def: 420, spd: 0.95, style: 'melee', interval: 1.35, reach: 3.6, ang: 1.2, mult: 1.35, wtype: 'lance', wl: 'sword', sk: [['arc', 5.4, 1.0, 3.0, 7], ['buff', 'def', 0.5, 12, 22], ['nova', 6.5, 3.4, 11], ['heal', 0.2, 18], ['rain', 4, 5, 5, 4.4, 18]] },
    ranger: { hp: 1600, atk: 530, def: 240, spd: 1.05, style: 'ranged', interval: 1.15, range: 26, speed: 34, mult: 1.1, wtype: 'bow', wl: 'bow', look: 'arrow', sk: [['volley', 3, 0.35, 34, 1.4, 6, 'arrow'], ['buff', 'spd', 0.25, 10, 20], ['rain', 5, 6, 4.2, 3.2, 14], ['volley', 7, 1.2, 34, 1.2, 12, 'arrow'], ['rain', 8, 8, 4.5, 3.8, 20]] },
    mage: { hp: 1550, atk: 590, def: 230, spd: 1.0, style: 'ranged', interval: 1.3, range: 24, speed: 26, mult: 1.15, wtype: 'staff', wl: 'staff', look: 'orb', sk: [['volley', 3, 0.45, 26, 1.4, 6, 'orb'], ['nova', 7, 3.0, 11], ['rain', 5, 6, 4.4, 3.4, 15], ['buff', 'atk', 0.35, 12, 22], ['rain', 7, 7, 5, 4.2, 20]] },
    healer: { hp: 1800, atk: 450, def: 300, spd: 1.0, style: 'ranged', interval: 1.3, range: 22, speed: 26, mult: 1.0, wtype: 'staff', wl: 'staff', look: 'orb', sk: [['volley', 3, 0.4, 26, 1.3, 6, 'orb'], ['heal', 0.25, 16], ['nova', 7, 3.0, 11], ['buff', 'def', 0.45, 12, 22], ['heal', 0.45, 24]] }
  };
  const SKD = { arc: '前方を大きく攻撃する。', nova: '周囲の敵をまとめて攻撃する。', volley: (n) => n + 'つの弾を放つ。', rain: '敵のいる場所に攻撃を降らせる。', charge: '前方へ突進して攻撃する。', heal: (p) => 'HPを' + Math.round(p * 100) + '%回復する。', buff: (st, v, d) => d + '秒間' + ({ atk: '攻撃力', def: '防御力', spd: '移動速度' })[st] + 'が' + Math.round(v * 100) + '%上がる。' };
  const mkSkills = (id, role, el, names) => ROLE[role].sk.map((t, i) => {
    const o = { lv: 10 + i * 10, name: names[i], el };
    if (t[0] === 'arc') Object.assign(o, { type: 'arc', r: t[1], ang: t[2], mult: t[3], cd: t[4], desc: SKD.arc });
    if (t[0] === 'nova') Object.assign(o, { type: 'nova', r: t[1], mult: t[2], cd: t[3], desc: SKD.nova });
    if (t[0] === 'volley') Object.assign(o, { type: 'volley', n: t[1], spread: t[2], speed: t[3], mult: t[4], cd: t[5], look: t[6], desc: SKD.volley(t[1]) });
    if (t[0] === 'rain') Object.assign(o, { type: 'rain', spots: t[1], spread: t[2], r: t[3], mult: t[4], delay: 0.6, cd: t[5], desc: SKD.rain });
    if (t[0] === 'charge') Object.assign(o, { type: 'charge', dist: t[1], w: t[2], mult: t[3], cd: t[4], desc: SKD.charge });
    if (t[0] === 'heal') Object.assign(o, { type: 'heal', pct: t[1], cd: t[2], desc: SKD.heal(t[1]) });
    if (t[0] === 'buff') Object.assign(o, { type: 'buff', stat: t[1], val: t[2], dur: t[3], cd: t[4], desc: SKD.buff(t[1], t[2], t[3]) });
    return o;
  });
  const MERIT = { blade: [['攻撃の手数が多い', '移動速度 x1.08'], ['防御力は低め']], heavy: [['一撃がとても重い', 'HPが高い'], ['攻撃速度が遅い']], lancer: [['HPと防御力がとても高い', '攻撃のリーチが長い'], ['移動速度 x0.95']], ranger: [['遠くから攻撃できる', '連射が速い'], ['HP・防御力が低い']], mage: [['魔法の威力が高い', '広い範囲を攻撃できる'], ['HP・防御力が低い']], healer: [['回復スキルが得意', '守りの補助ができる'], ['攻撃力は低め']] };
  const WLOOK = { sword: { type: 'sword' }, axe: { type: 'axe' }, staff: { type: 'staff' }, bow: { type: 'bow' } };
  const mkComp = (id, o) => {
    const R = ROLE[o.role], el = o.el;
    const c = Object.assign({
      name: o.name, title: o.title, en: o.en, gender: o.g, icon: o.icon, color: o.color, hp: R.hp, atk: R.atk, def: R.def, spd: R.spd, style: R.style, interval: R.interval, mult: R.mult, el, wtype: o.wtype || R.wtype,
      quote: o.quote, desc: o.desc, merit: MERIT[o.role][0], demerit: MERIT[o.role][1], look: Object.assign({ gender: o.g, weapon: Object.assign({}, WLOOK[R.wl], o.wpn || {}) }, o.look),
      cond: {}, lines: { before: o.before || [], join: o.join || [o.quote] }, skills: mkSkills(id, o.role, el, o.sk)
    }, R.style === 'melee' ? { reach: R.reach, ang: R.ang } : { range: R.range, speed: R.speed, look: R.look }, o.extra || {});
    D.COMPANIONS[id] = c; D.COMP_ORDER.push(id); return c;
  };
  // ---- 第五章：氷の世界で出会う旅人（4人） ----
  const T5 = [
    ['frey', { name: 'フレイ', title: '氷槍の騎士', en: 'FROST LANCER', g: 'm', icon: '❄', color: '#7fd8ff', role: 'lancer', el: 'ice', quote: '凍てついた槍でも、心までは凍らせない。', desc: '氷の住む街フロスティアを守る騎士団長。タイプドラゴンに奪われた故郷を取り戻すため、旅人を待っていた。', look: { main: '#2a4a7a', sub: '#e8f4ff', accent: '#7fd8ff', armor: '#cfe2f4', knightHelm: '#e8f2fc', plume: '#7fd8ff', pants: '#1e2a40', boots: '#e8f4ff', hair: '#e8f4ff', eye: '#7fd8ff', cape: '#2a4a7a', capeLong: true }, wpn: { blade: '#dff6ff', glow: '#7fd8ff' }, sk: ['氷槍・穿突', '氷壁の誓い', '氷輪旋', '凍てつく祈り', '氷槍雨'] }, 16, 18, 14],
    ['shirone', { name: 'シロネ', title: '雪狐の巫女', en: 'SNOW FOX SHRINE MAIDEN', g: 'f', icon: '🦊', color: '#ffe8f4', role: 'healer', el: 'ice', quote: 'こん。……あなたの旅、雪狐さまが見守っています。', desc: '氷上の宿場アイスロードの小さな社に仕える巫女。雪狐の耳と尻尾のような髪飾りが自慢。', look: { main: '#f4f4fa', sub: '#d8405a', accent: '#ffb8d8', pants: '#d8405a', boots: '#f4f4fa', hair: '#ffffff', eye: '#ff9ec4', hairAcc: '#ff9ec4', gown: true }, wpn: { glow: '#ffd8ec' }, sk: ['狐火の舞', '雪狐の加護', '吹雪の結界', '白銀の守り', '大祓え'] }, 14, -16, 14],
    ['borg', { name: 'ボルグ', title: '氷河の鍛冶師', en: 'GLACIER SMITH', g: 'm', icon: '🔨', color: '#ffb86a', role: 'heavy', el: 'earth', quote: 'がっはっは！ 氷河の鉄は、叩けば叩くほど強くなる！', desc: '氷河の野営地グレイシアで、溶けない氷を鍛えて武器を作る豪快な鍛冶師。', look: { main: '#6a4a3a', sub: '#e8d8c8', accent: '#ffb86a', pants: '#3a2a22', boots: '#4a3a2a', hair: '#c86a3a', eye: '#ffb86a', scarf: '#c8402a' }, wpn: { blade: '#cfe6fa' }, sk: ['氷河割り', '大地鳴らし', '鍛冶師の意地', '猛進', '天打ち'] }, 15, 18, -14],
    ['ria', { name: 'リア', title: '吹雪の旅芸人', en: 'BLIZZARD PERFORMER', g: 'f', icon: '🎪', color: '#c38cff', role: 'ranger', el: 'wind', quote: 'さあさあ、ご覧あれ！ 吹雪の中の一番星、リアの曲芸だよ！', desc: '凍った海を渡り歩く旅芸人。弓の曲撃ちで、お客さんも魔物もびっくりさせる。', look: { main: '#3a2a6a', sub: '#ffe8a0', accent: '#c38cff', pants: '#2a1e4a', boots: '#3a2a6a', hair: '#ff9ef0', eye: '#c38cff', hairAcc: '#ffe8a0', scarf: '#ff9ef0' }, wpn: { blade: '#c38cff' }, sk: ['曲撃ち', '軽業', '吹雪の舞台', '七連の矢', '星降るフィナーレ'] }, 16, -20, -12]
  ];
  for (const [id, o, v, dx, dz] of T5) { const c = mkComp(id, o); Object.assign(c, { v, dx, dz, ch: 5, cond: {}, condText: '第五章で' + ({ 14: 'アイスロード', 15: 'グレイシア', 16: 'フロスティア' })[v] + 'にいる' }); D.NPCS.push({ id: 'c_' + id, v, name: c.title + ' ' + c.name, role: 'recruit', comp: id, dx, dz, look: c.look, ch: 5 }); }
  // ---- ミラクルガチャの星5キャラ（15人） ----
  const GC = [
    ['astrea', 'アストレア', '星詠みの姫', 'STAR PRINCESS', 'f', '⭐', '#ffe08a', 'mage', 'light', '星はいつも、あなたの行く道を照らしているわ。', { main: '#f4f0ff', sub: '#ffd27a', accent: '#ffe08a', hair: '#fff2c8', eye: '#ffd27a', crown: '#ffd27a', gown: true, cape: '#3a3a7a', capeLong: true }, ['星屑の矢', '流星の輪', '星降る夜', '星詠みの祝福', 'スターフォール']],
    ['kaguya', 'カグヤ', '月の姫', 'MOON PRINCESS', 'f', '🌙', '#c8c0ff', 'mage', 'dark', '月へ帰るのは、もう少しだけ先にしようかしら。', { main: '#2a2a5a', sub: '#f4f0ff', accent: '#c8c0ff', hair: '#1a1a2a', eye: '#c8c0ff', hairAcc: '#ffe8a0', gown: true, cape: '#c8402a' }, ['月光弾', '朧月', '月下の雨', '竹取の加護', '満月の審判']],
    ['rex', 'レックス', '竜騎士', 'DRAGOON', 'm', '🐲', '#ff7a3a', 'lancer', 'fire', '竜の背に乗るように、空まで駆けてやる！', { main: '#8a2a1a', sub: '#ffd27a', accent: '#ff7a3a', armor: '#c84a2a', knightHelm: '#a83a2a', plume: '#ffd27a', hair: '#ff9a5a', eye: '#ffd27a', cape: '#5a1a1a', capeLong: true }, ['竜牙突', '竜鱗の守り', '炎竜旋', '竜の息吹', 'ドラゴンダイブ']],
    ['nyx', 'ニクス', '夜の暗殺者', 'NIGHT ASSASSIN', 'f', '🗡', '#b07aff', 'blade', 'dark', '……音もなく、影の中から。', { main: '#1a1a2a', sub: '#6a5aaa', accent: '#b07aff', pants: '#12121e', boots: '#1a1a2a', hair: '#e8e0ff', eye: '#b07aff', scarf: '#6a5aaa', mask: '#2a2a3a' }, ['影縫い', '闇の構え', '夜嵐', '影手裏剣', '終幕・月蝕']],
    ['sol', 'ソル', '太陽の剣士', 'SUN SWORDSMAN', 'm', '☀', '#ffb03a', 'blade', 'fire', '太陽は沈んでも、また昇る。俺の剣もな！', { main: '#ffb03a', sub: '#fff2d0', accent: '#ff6a2a', pants: '#8a4a1a', boots: '#6a3a1a', hair: '#ffd27a', eye: '#ff6a2a', scarf: '#ff6a2a' }, ['日輪斬', '真昼の闘志', '灼光旋', '陽炎刃', 'サンライズ']],
    ['luna', 'ルーナ', '月光の弓使い', 'MOONLIGHT ARCHER', 'f', '🏹', '#bfefff', 'ranger', 'light', '月の光は、どんな闇も射抜くのよ。', { main: '#2a3a6a', sub: '#e8f4ff', accent: '#bfefff', pants: '#1a2440', boots: '#e8f4ff', hair: '#bfefff', eye: '#fff2b0', hairAcc: '#fff2b0', cape: '#2a3a6a' }, ['月光三連', '月の足どり', '月光雨', '七星の矢', 'ルナティックレイン']],
    ['gaia', 'ガイア', '大地の巨人', 'EARTH GIANT', 'm', '⛰', '#a8783a', 'heavy', 'earth', 'ふむ……大地は、急がぬ。だが、止まらぬ。', { main: '#6a5a3a', sub: '#c8b890', accent: '#8ad06a', pants: '#4a3a2a', boots: '#3a2a1a', hair: '#4a6a2a', eye: '#8ad06a', armor: '#8a7a5a' }, ['大地割り', '地鳴り', '岩盤の守り', '山崩し', 'ガイアクエイク']],
    ['mizuha', 'ミズハ', '水の舞姫', 'WATER DANCER', 'f', '💧', '#4fb4ff', 'healer', 'water', 'ひとさし舞えば、傷もきれいに流れていくわ。', { main: '#4fb4ff', sub: '#f4faff', accent: '#bff6ff', hair: '#2a6ad8', eye: '#bff6ff', hairAcc: '#ffffff', gown: true }, ['水玉の舞', '清流の癒し', '渦潮の輪', '水鏡の守り', '慈雨']],
    ['raiden', 'ライデン', '雷神', 'THUNDER GOD', 'm', '⚡', '#c38cff', 'heavy', 'thunder', '鳴り響け、雷鼓！ 天の怒りを見せてやろう！', { main: '#2a2a5a', sub: '#ffe08a', accent: '#c38cff', pants: '#1a1a3a', boots: '#2a2a4a', hair: '#ffffff', eye: '#ffe08a', cape: '#3a2a6a', capeLong: true }, ['雷槌', '轟雷', '雷鼓の守り', '迅雷', '天雷招来']],
    ['fuuka', 'フウカ', '風の忍', 'WIND NINJA', 'f', '🍃', '#7fe8c8', 'blade', 'wind', 'ニンッ！ 風より速く、忍びより静かに！', { main: '#2a4a3a', sub: '#e8f4ec', accent: '#7fe8c8', pants: '#1a2a22', boots: '#2a3a2a', hair: '#3a2a2a', eye: '#7fe8c8', scarf: '#c8402a', mask: '#2a4a3a' }, ['疾風刃', '隠れ身', '旋風の術', '風魔手裏剣', '奥義・神風']],
    ['freesia', 'フリージア', '氷結の魔導士', 'FROST SORCERESS', 'f', '❄', '#9fe6ff', 'mage', 'ice', 'ふふ、凍らせてあげる。……寒いのは苦手？', { main: '#dff2ff', sub: '#4f86d0', accent: '#9fe6ff', hair: '#bfefff', eye: '#4f86d0', crown: '#9fe6ff', gown: true, cape: '#4f86d0', capeLong: true }, ['氷結弾', '絶対零度', '氷柱の雨', '氷の鎧', 'ブリザードノヴァ']],
    ['tsubaki', 'ツバキ', '花の侍', 'BLOSSOM SAMURAI', 'f', '🌸', '#ff7a9a', 'blade', 'wind', '散る花のように、潔く斬る。それが私の剣。', { main: '#c8405a', sub: '#f4e8ec', accent: '#ffd27a', pants: '#2a1a22', boots: '#3a2a2a', hair: '#1a1a1a', eye: '#ff7a9a', hairAcc: '#ff9ec4' }, ['花吹雪', '凛の構え', '桜花乱舞', '飛花', '奥義・千本桜']],
    ['orion', 'オリオン', '星の狩人', 'STAR HUNTER', 'm', '🌠', '#7fa8ff', 'ranger', 'thunder', '星座の狩人は、獲物を逃さない。', { main: '#1e2a5a', sub: '#e8eeff', accent: '#7fa8ff', pants: '#141c3a', boots: '#2a2a4a', hair: '#e8e0c8', eye: '#7fa8ff', cape: '#1e2a5a' }, ['三ツ星', '狩人の目', '流星群', '雷光の矢', 'オリオンストライク']],
    ['noel', 'ノエル', '聖夜の天使', 'HOLY NIGHT ANGEL', 'f', '🔔', '#ffffff', 'healer', 'light', 'メリー……あっ、まだ早かったかな？ えへへ。', { main: '#f4f4fa', sub: '#c8402a', accent: '#ffd27a', hair: '#fff2c8', eye: '#c8402a', wings: '#ffffff', wingTip: '#ffd27a', wingE: 0.4, halo: '#fff2b0', gown: true }, ['聖鈴', '聖夜の癒し', '光の輪', '天使の守り', 'ホーリーナイト']],
    ['zeal', 'ジール', '炎の魔剣士', 'FLAME SPELLSWORD', 'm', '🔥', '#ff4a2a', 'blade', 'fire', '魔剣よ、燃えろ！ この炎で道を切り開く！', { main: '#2a1a1a', sub: '#ff6a2a', accent: '#ffb03a', pants: '#1a1212', boots: '#2a1a1a', hair: '#ff4a2a', eye: '#ffb03a', cape: '#5a1a1a', capeLong: true }, ['魔炎斬', '烈火の構え', '業火旋', '炎刃', '魔剣・紅蓮']]
  ];
  D.GACHA_CHARS = [];
  for (const [id, name, title, en, g, icon, color, role, el, quote, look, sk] of GC) {
    const c = mkComp(id, { name, title, en, g, icon, color, role, el, quote, look, sk, desc: 'ミラクルガチャで出会える星5のキャラクター。「' + title + '」として、その力を人格切り替えで振るう。' });
    Object.assign(c, { gacha: true, star: 5, condText: 'ミラクルガチャ（星5）で出会える' }); D.GACHA_CHARS.push(id);
  }
  // ---- プラスタウンの新仲間（3人） ----
  const PT = [
    ['neon', { name: 'ネオン', title: 'ストリートの射手', en: 'STREET SHOOTER', g: 'f', icon: '🎧', color: '#4ff0ff', role: 'ranger', el: 'thunder', quote: 'このビート、止められる？', desc: 'プラスタウンの広場でいつも音楽を流している射手。電気をまとった矢を撃つ。', look: { main: '#1a1a2a', sub: '#4ff0ff', accent: '#ff4fd8', pants: '#2a2a3a', boots: '#4ff0ff', hair: '#ff4fd8', eye: '#4ff0ff', hairAcc: '#4ff0ff' }, wpn: { blade: '#4ff0ff' }, sk: ['ビートショット', 'リズムステップ', 'ネオンレイン', 'サウンドバースト', 'ラストトラック'] }],
    ['max', { name: 'マックス', title: 'メカニック', en: 'MECHANIC', g: 'm', icon: '🔧', color: '#ffb03a', role: 'heavy', el: 'thunder', quote: '壊れたものは直す。邪魔なものは……ぶっ壊す！', desc: 'プラスタウンの工房で何でも直してしまうメカニック。巨大レンチで戦う。', look: { main: '#3a4a5a', sub: '#ffb03a', accent: '#ffd27a', pants: '#2a3a4a', boots: '#2a2a2a', hair: '#3a2a1a', eye: '#ffb03a', scarf: '#ffb03a' }, wpn: { blade: '#c8ccd8' }, sk: ['レンチスイング', 'オーバードライブ', '装甲モード', 'ターボ突進', 'メガプレス'] }],
    ['ai', { name: 'アイ', title: 'アイドル歌姫', en: 'IDOL DIVA', g: 'f', icon: '🎤', color: '#ff9ec4', role: 'healer', el: 'light', quote: 'みんなー！ 今日もいっしょに、がんばろーっ！', desc: 'プラスタウンのステージで歌うアイドル。歌声には傷をいやす不思議な力がある。', look: { main: '#ff9ec4', sub: '#ffffff', accent: '#ffe08a', hair: '#ffe08a', eye: '#ff6a9a', hairAcc: '#ff6a9a', gown: true }, wpn: { glow: '#ff9ec4' }, sk: ['ハートビーム', 'エールソング', 'ステージライト', 'アンコール', 'センターステージ'] }]
  ];
  D.PTOWN_CHARS = [];
  for (const [id, o] of PT) { const c = mkComp(id, o); Object.assign(c, { ptown: true, condText: 'プラスタウン（プラスパス）で出会える' }); D.PTOWN_CHARS.push(id); }

  // ================= 人格の新衣装（ミラクルガチャ星4〜5） =================
  D.COSTUMES = {};
  const CS = [
    ['adventurer', 'star', '星騎士の装い', { main: '#1e2a5a', sub: '#ffe08a', accent: '#ffd27a', cape: '#3a2a7a', scarf: '#ffd27a', armor: '#c8d0e8' }], ['adventurer', 'yukata', '夏祭りの浴衣', { main: '#2a4a8a', sub: '#f4f0e8', accent: '#ff9ec4', pants: '#2a4a8a', scarf: '#ff9ec4', cape: null }],
    ['miner', 'gold', '黄金の採掘服', { main: '#c8a040', sub: '#fff2c8', accent: '#ffe08a', pants: '#6a4a1a' }], ['miner', 'snow', '雪山の防寒着', { main: '#e8eef8', sub: '#4f86d0', accent: '#7fd8ff', pants: '#3a4a6a', scarf: '#c8402a' }],
    ['flyer', 'angel', '天使の衣', { main: '#ffffff', sub: '#ffd27a', accent: '#fff2b0', halo: '#fff2b0' }], ['flyer', 'crow', '黒翼の衣', { main: '#1a1a2a', sub: '#6a5aaa', accent: '#b07aff', wings: '#1a1a2a', wingTip: '#6a5aaa' }],
    ['sprinter', 'track', 'スプリンターウェア', { main: '#ff4a2a', sub: '#ffffff', accent: '#ffe08a', pants: '#1a1a2a' }], ['sprinter', 'ninja', '疾風の忍装束', { main: '#2a2a3a', sub: '#c8402a', accent: '#7fe8c8', mask: '#2a2a3a' }],
    ['awakener', 'demon', '覚醒の魔装', { main: '#2a0a1a', sub: '#ff4a6a', accent: '#ff9ef0', cape: '#4a0a1a', capeLong: true }], ['awakener', 'holy', '聖光の鎧', { main: '#f4f0e8', sub: '#ffd27a', accent: '#fff2b0', armor: '#e8e0c8' }],
    ['mage', 'witch', '星の魔女', { main: '#2a1a4a', sub: '#ffe08a', accent: '#c38cff', hat: '#2a1a4a' }], ['mage', 'sage', '大賢者のローブ', { main: '#f4f0e8', sub: '#4f86d0', accent: '#ffd27a', cape: '#4f86d0', capeLong: true }],
    ['healer', 'nurse', '白衣の天使', { main: '#ffffff', sub: '#ff9ec4', accent: '#ff6a9a' }], ['healer', 'flower', '花の巫女', { main: '#ff9ec4', sub: '#ffffff', accent: '#8ad06a', hairAcc: '#ffffff' }],
    ['honest', 'judge', '真実の法衣', { main: '#2a2a3a', sub: '#ffffff', accent: '#ffd27a', cape: '#2a2a3a', capeLong: true }], ['honest', 'knight', '誓いの騎士', { main: '#3a5a8a', sub: '#e8eef8', accent: '#ffd27a', armor: '#c8d0e0' }],
    ['hearer', 'dj', 'ヘッドホンDJ', { main: '#1a1a2a', sub: '#4ff0ff', accent: '#ff4fd8' }], ['hearer', 'forest', '森の聞き耳', { main: '#3a6a3a', sub: '#e8f0d8', accent: '#c8ff7a' }],
    ['prophet', 'oracle', '神託の衣', { main: '#f4f0ff', sub: '#c38cff', accent: '#ffe08a', crown: '#ffe08a' }], ['prophet', 'clock', '時計塔の預言者', { main: '#3a2a1a', sub: '#ffd27a', accent: '#c8a040', hat: '#3a2a1a' }]
  ];
  for (const [pers, k, name, look] of CS) D.COSTUMES[pers + '_' + k] = { id: pers + '_' + k, pers, name, look };

  // ================= ミラクルガチャ =================
  D.GACHA = {
    price1: 3000, price10: 30000, pity: 80,
    rates: [0.354, 0.33, 0.22, 0.08, 0.016], // 星1〜星5
    food: [['sweetflower', 'mint', 'berry', 'mushroom', 'snowflower'], ['roast', 'potion', 'skyberry', 'icelily', 'nightbloom'], ['hipotion', 'snowpear', 'frostfish'], ['elixir', 'plusburger', 'heavenfruit'], ['starparfait', 'elixir']],
    mat: [['ore', 'core'], ['ore', 'core', 'iceshard'], ['iceshard', 'moonstone', 'pluscrystal'], ['pluscrystal', 'heavensteel', 'moonstone'], ['pluscrystal', 'seraphfeather']],
    weaponTier: [null, null, [5, 6, 7, 8], [9, 10, 11], [12, 13]]
  };
  // ================= ログインボーナス（7日で一周） =================
  D.LOGIN = [
    { coins: 5000 }, { item: ['roast', 3] }, { item: ['pluscrystal', 1] }, { coins: 12000 }, { item: ['potion', 3] }, { item: ['gachaticket', 1] }, { coins: 30000, item: ['pluscrystal', 3] }
  ];
  // ================= プラスパス（ゲーム内通貨のスターコインで購入・30日間） =================
  D.PASS = { price: 500000, days: 30, maxLv: 120 };

  // ================= クエスト =================
  Object.assign(D.QUESTS, {
    mq13: { main: true, ch: 5, title: '凍りついた外洋', desc: '天界の欠片が天へ還ったあと、島のまわりの海がすべて凍りついた。スターリーフ村の長老マルクに話を聞こう。', obj: [{ type: 'talk', npc: 'marc', text: 'スターリーフ村の長老マルクと話す' }], reward: { coins: 40000, exp: 0 }, next: 'mq14' },
    mq14: { main: true, ch: 5, title: '氷の住む街', desc: '凍った海の向こう、北東の果てに「氷の住む街 フロスティア」があるという。氷の道をたどって街を訪ね、街の長に会おう。', obj: [{ type: 'talk', npc: 'glace', text: 'フロスティアの街長グラースと話す' }], reward: { coins: 60000, exp: 0 }, next: 'mq15' },
    mq15: { main: true, ch: 5, title: '五つの氷晶', desc: 'タイプドラゴンの棲む「氷の城塞」は、五つの氷晶の封印で閉ざされている。氷晶の祠を守る番人を倒し、氷晶を集めよう。', obj: [0, 1, 2, 3, 4].map(i => ({ type: 'crystal5', id: i, text: ['南', '東', '西', '南東の氷河', '南西の氷河'][i] + 'の祠で氷晶を手に入れる' })), reward: { coins: 300000, exp: 0 }, next: 'mq16' },
    mq16: { main: true, ch: 5, title: '真の邪悪 タイプドラゴン', desc: '五つの氷晶がそろい、北西の「氷の城塞」への道が開いた。頂にいるタイプドラゴンを討伐しよう。タイプ（属性）が変わるたびに、弱点も変わる。', obj: [{ type: 'boss', id: 'typedragon', text: '氷の城塞の頂でタイプドラゴンを倒す' }], reward: { coins: 1500000, exp: 0 }, next: null },
    nq1: { main: true, ch: 6, title: '夜島 第一章「月影の森」', desc: '夜島の森の奥で、月の光を食べる大樹が暴れている。月影の森の迷宮で、森の主を鎮めよう。', obj: [{ type: 'boss', id: 'nb_treant', text: '月影の森の主を倒す' }], reward: { coins: 200000, exp: 0 }, next: 'nq2' },
    nq2: { main: true, ch: 6, title: '夜島 第二章「逆さ湖」', desc: '湖に映る空が上と下で入れ替わってしまった。逆さ湖の神殿の魔女を止めよう。', obj: [{ type: 'boss', id: 'nb_witch', text: '逆さ湖の魔女を倒す' }], reward: { coins: 300000, exp: 0 }, next: 'nq3' },
    nq3: { main: true, ch: 6, title: '夜島 第三章「星喰いの塔」', desc: '夜空の星が一つずつ消えていく。星喰いの塔の頂で、星喰いを止めよう。', obj: [{ type: 'boss', id: 'nb_eater', text: '星喰いの塔の主を倒す' }], reward: { coins: 400000, exp: 0 }, next: 'nq4' },
    nq4: { main: true, ch: 6, title: '夜島 第四章「夜の王」', desc: 'すべての異変は夜の王ノクスのしわざだった。夜の王城で、ノクスを倒そう。', obj: [{ type: 'boss', id: 'nb_nox', text: '夜の王ノクスを倒す' }], reward: { coins: 800000, exp: 0 }, next: null },
    sq_adv: { title: '応用ダンジョンに挑め', desc: '第五章のあと、島の各地に「応用ダンジョン」が現れた。三つ突破して、フロスティアの街長に報告しよう。', giver: 'glace', obj: [{ type: 'advclear', n: 3, text: '応用ダンジョンを3つ突破する' }], reward: { coins: 250000, exp: 0, items: [['pluscrystal', 5]] } }
  });
  Object.assign(D.MARC, {
    ch5first: ['……来てくれたか。見ての通り、島のまわりの海が、すべて凍りついてしまった。', 'これは「タイプドラゴン」という古い竜のしわざじゃ。炎にも氷にも雷にも姿を変える、真の邪悪と呼ばれる竜じゃよ。', '凍った海には「氷の道」ができて、遠くの氷の大地まで歩いて行けるようになった。', '北東の果てに「氷の住む街 フロスティア」があるそうじゃ。まずはそこを訪ねてみるのじゃ。'],
    ch5mid: ['氷の道は、凍った海をぐるりと一周しておる。', '五つの氷晶をそろえれば、北西の氷の城塞へ行けるそうじゃ。', 'タイプドラゴンはタイプが変わるたびに弱点も変わる。武器や仲間を切り替えて戦うのじゃぞ。'],
    ch5end: ['……タイプドラゴンは消えた。じゃが、島の魔物たちはまだ生きておる。', 'それでも今は、街のみんなが力を合わせて魔物と戦えるようになった。平和は……もうすぐそこじゃ。', 'そうそう、スターリーフ村の東に「月の門」が現れたぞ。夜の島へつながっておるらしい。']
  });
  D.NPCS.push(
    { id: 'glace', v: 16, name: '街長グラース', role: 'talk5', dx: -6, dz: 8, look: { gender: 'm', main: '#2a4a7a', sub: '#e8f4ff', hair: '#e8f4ff', accent: '#7fd8ff', cape: '#4f86d0', capeLong: true, crown: '#bff6ff' }, emote: 'think', ch: 5, lines: ['ようこそ、氷の住む街フロスティアへ。', '街の外は、タイプドラゴンの冷気で凍りついてしまいました。'] },
    { id: 'shop16', v: 16, name: '氷屋フローズ', role: 'shop', ch: 5, shop: ['icelily', 'snowpear', 'frostfish', 'hipotion', 'elixir', 's_frost', 'a_frost', 't_frost'], look: { gender: 'f', main: '#7fb8e8', sub: '#f4faff', hair: '#bfefff', accent: '#4f86d0' } },
    { id: 'shop14', v: 14, name: '宿場の商人', role: 'shop', ch: 5, shop: ['icelily', 'snowpear', 'roast', 'potion', 'hipotion'], look: { gender: 'm', main: '#8a6a4a', sub: '#e8e0d0', hair: '#4a3a2a', accent: '#c8a040' } },
    { id: 'shop15', v: 15, name: '野営地の補給係', role: 'shop', ch: 5, shop: ['snowpear', 'frostfish', 'potion', 'hipotion', 'elixir'], look: { gender: 'f', main: '#4a5a6a', sub: '#e8eef4', hair: '#c86a3a', accent: '#ffb86a' } },
    { id: 'icek', v: 16, name: '氷の衛兵', role: 'talk', dx: 24, dz: -14, ch: 5, look: { gender: 'm', main: '#3a5a8a', sub: '#e8f4ff', hair: '#c8d8e8', accent: '#7fd8ff', helmet: '#cfe2f4' }, lines: ['氷晶の祠は、凍った海の南・東・西と、南東・南西の氷河にある。', '番人は手ごわい。氷晶柱を先に砕かないと、攻撃が通らないぞ。'] },
    { id: 'icechild', v: 14, name: '宿場の子ども', role: 'talk', dx: -18, dz: 12, ch: 5, look: { gender: 'f', main: '#ff9ec4', sub: '#ffffff', hair: '#c87a3a', accent: '#ffd27a' }, lines: ['海が凍ってから、お父さんが歩いて漁に行けるようになったんだって！', 'でも、氷の上の魔物はすっごく強いの。気をつけてね。'] }
  );
  D.CH5_INTRO = ['……{name}さん。ステラです。', '天界の欠片が天へ還ったとき……島のまわりの海が、一晩ですべて凍りつきました。', 'これは、古い竜「タイプドラゴン」が目覚めたしるしです。炎、氷、雷……あらゆるタイプに姿を変える、真の邪悪。', '凍った海には「氷の道」ができ、島はさらに外へと広がりました。', 'これが、わたしたちの島の最後の章――第五章の始まりです。'];
  D.NIGHT_INTRO = ['……ようこそ、夜島へ。わたしは月の巫女セレーネ。', 'ここは、ステラさまの島とは違う、もう一つの島。太陽がのぼらない、夜だけの島です。', '夜島では重さが少しおかしいの。体がふわっと軽くなって、高く跳べるでしょう？', 'この島にも、四つの異変が起きています。どうか、力を貸してください。'];

  // ================= お知らせ =================
  D.NEWS.unshift({
    ver: 'Release v1.0.0', date: '2026.11.16', title: '正式リリース！ 第五章・夜島・ミラクルガチャ', tag: '正式リリース', items: [
      ['🐉', '第五章「氷の住む街とタイプドラゴン」', '最終章。島のまわりの海が凍り、マップがさらに外へ広がりました。氷の道をたどって氷の住む街へ。五つの氷晶を集め、真の邪悪ボス・タイプドラゴンを討伐しよう。クリア後は各地に「応用ダンジョン」が出現します。'],
      ['🌙', 'v1限定「夜島」', '第五章クリアで解放。重力が少し変わった夜だけの島で、夜島 第一章〜第四章の物語とダンジョンに挑もう。'],
      ['🎰', 'ミラクルガチャ', '星1〜星5の食料・素材・武器・人格の新衣装・キャラクター（星5は15人）が手に入ります。10連は星3以上が1つ確定。スターコインで引けます。'],
      ['✚', 'プラスパス（30日）', 'スターコインで購入。最大レベルが120に、ミラクルガチャが毎日1回無料、ログインボーナスが2倍、毎週ヨミガエクリスタル、そして新地「プラスタウン」へ行けるようになります。'],
      ['🔮', 'ヨミガエクリスタル', '宝箱や敵から、ごくまれ（0.01%）に見つかる再生の結晶。持っているとHPが0になったときに1度だけ全回復で生き返ります。'],
      ['🎁', 'ログインボーナス', '毎日ログインすると報酬がもらえます（7日で一周）。'],
      ['🌐', '言語設定', '日本語・English・한국어・中文・Español を選べるようになりました。'],
      ['🤝', '旅の仲間', '第五章の旅人4人・ガチャの星5キャラ15人・プラスタウンの3人が登場。人格切り替えで同時に使えるのは仲間3人まで（キー 2〜4 に設定）。'],
      ['📱', 'そのほか', 'スマホの縦画面ではプレイできないように（横向きにしてください）。他のサイトへの埋め込みではプレイできないようにしました。タイトル画面に「スマホやタブレットでプレイしている場合について」を追加しました。']
    ]
  });
  D.TIPS = D.TIPS.filter(t => t.indexOf('数字キー（1〜9）') < 0);
  D.TIPS.push('人格切り替えは主人公＋仲間3人まで。キー 2〜4 に使いたい仲間を設定しよう。', 'タイプドラゴンはタイプ（属性）が変わると弱点も変わる。画面のタイプ表示を見て戦おう。', 'ヨミガエクリスタルを持っていれば、HPが0になっても1度だけ生き返れる。');
})(window.PS);
