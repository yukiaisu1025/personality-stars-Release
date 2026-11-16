// Beta v1.1.0 大型アップデート：第四章・プラス進化・人格切り替え・旅の仲間4人
(function (PS) {
  'use strict';
  const D = PS.DATA;
  D.VERSION = '1.1.0';
  D.VERSION_LABEL = 'Beta v1.1.0';
  // コインが多すぎたので、手に入る量を減らす（敵・宝箱・迷宮・クエスト）
  D.COIN_MUL = 0.35;

  // ================= プラス進化 =================
  D.PLUS = {
    cost: 15, minLv: 81, dur: 900, sideDur: 180, lv: 20,
    side: {
      adventurer: { text: '覚醒の代償として、少量のダメージを受け続ける', short: '少量のダメージを受ける' },
      miner: { text: '斧を投げる速度が少し遅くなる', short: '斧投げが遅くなる' },
      flyer: { text: '飛べる秒数が減る', short: '飛べる時間が半分' },
      sprinter: { text: '酔ってしまい、視界がふらふら揺れる', short: '酔って視界が揺れる' },
      mage: { text: 'スキルによる攻撃力が下がる', short: 'スキルの威力ダウン' },
      healer: { text: '自動回復の速度が遅くなる', short: '自動回復が遅くなる' },
      honest: null,
      hearer: { text: '耳が聞こえづらくなり、方向マークが出なくなる', short: '耳が聞こえづらい' }
    },
    ng: { awakener: '覚醒者はすでに限界を超える力（覚醒）を持っているため、プラス進化できません。', prophet: '予言者は未来が見えすぎてしまうため、プラス進化できません。' }
  };

  // ================= アイテム =================
  Object.assign(D.ITEMS, {
    pluscrystal: { name: 'プラスクリスタル', cat: 'mat', rar: 4, icon: '💎', desc: '第二章の各地（浮上した四つの大地と星界の遺跡）で見つかる、限界を超える力を秘めた結晶。15個でプラス進化できる。', sell: 0 },
    heavenfruit: { name: '天界の果実', cat: 'food', heal: 0.5, rar: 4, icon: '🍑', desc: '天への階段の上にだけ実る黄金の果実。HPが50%回復する。（第四章限定）', sell: 200 },
    heavensteel: { name: '天鋼', cat: 'mat', rar: 4, icon: '🔩', desc: '世界の果てのギミックダンジョンで見つかる、天界の金属。（第四章限定）', sell: 1200 },
    seraphfeather: { name: '熾天使の羽根', cat: 'mat', rar: 5, icon: '🪶', desc: '天界の熾天使が落とした、光り輝く羽根。（第四章限定）', sell: 3000 },
    heavenshard: { name: '天界の欠片', cat: 'key', rar: 5, icon: '🌟', desc: '天への階段の頂で、熾天使が守っていた欠片。四つ集めると……。' }
  });
  // 第二章の敵がプラスクリスタルを落とす
  const ch2Keys = new Set();
  for (let k = 5; k < 9; k++) { for (const g of D.SPAWNS[k] || []) for (const e of g) ch2Keys.add(e); for (const e of D.CAMPS[k] || []) ch2Keys.add(e); if (D.ELITES[k]) ch2Keys.add(D.ELITES[k]); }
  for (const t of ['sky', 'mirage', 'aurora', 'inferno', 'starcave', 'roots']) for (const e of D.DUNGEON_MOBS[t] || []) ch2Keys.add(e);
  for (const k of ch2Keys) if (D.ENEMIES[k]) D.ENEMIES[k].drops = (D.ENEMIES[k].drops || []).concat([['pluscrystal', D.ENEMIES[k].elite ? 0.6 : 0.07]]);

  // ================= 第四章の武器 =================
  const Wp = (id, name, type, atk, rar, el, look, desc, price) => ({ id, name, type, atk, rar, el, look: look || {}, desc, price });
  D.WEAPONS.push(
    Wp('s_heaven', '天剣セラフィム', 'sword', 47000, 5, 'light', { blade: '#fffbe8', guard: '#ffd27a', glow: '#fff2b0' }, '熾天使の羽根で鍛えた、天界の聖剣。'),
    Wp('a_heaven', '天斧ケルビム', 'axe', 49000, 5, 'light', { blade: '#fff6e0', glow: '#ffe8a0', guard: '#c8a040' }, '天鋼を打ち上げた、光をまとう大斧。'),
    Wp('t_heaven', '天杖オファニム', 'staff', 45500, 5, 'light', { glow: '#fff2b0', blade: '#c8a040' }, '天界の光輪を戴いた神秘の杖。')
  );
  D.W = {}; D.WEAPONS.forEach(w => D.W[w.id] = w);
  D.TIER_WEAPON.push({ sword: 's_heaven', axe: 'a_heaven', staff: 't_heaven' }); // 12
  D.DUNGEON_TIER.push(11, 11, 11, 11); // 11〜14

  // ================= 第四章の敵 =================
  const E = (o) => Object.assign({ hpK: 1, atkK: 1, defK: 1, speed: 3, aggro: 14, keep: 0, el: 'phys', weak: null, exp: 1, drops: [], scale: 1, radius: 0.5 }, o);
  const HW = (o) => Object.assign({ gender: 'm', main: '#f2f0e8', sub: '#ffd27a', accent: '#ffd27a', accentE: 0.6, hair: '#fff2c8', skin: '#f0dcc8', eyeGlow: '#fff2b0', wings: '#fffbe8', wingTip: '#ffd27a', wingE: 0.5, halo: '#fff2b0' }, o);
  Object.assign(D.ENEMIES, {
    seraph_knight: E({ name: '天界の騎士', model: ['human', HW({ armor: '#e8e4d8', knightHelm: '#f2ead0', plume: '#ffd27a', weapon: { type: 'sword', blade: '#fffbe8', glow: '#ffd27a' } }), 1.05], hpK: 2.2, atkK: 1.5, defK: 1.8, speed: 3.6, el: 'light', weak: 'dark', exp: 1.6, drops: [['heavensteel', 0.08], ['core', 0.3]], radius: 0.6, atk: [{ kind: 'melee', windup: 0.55, r: 3, ang: 1.9, mult: 1.3, cd: 1.6, anim: 'atk' }, { kind: 'charge', windup: 0.7, dist: 14, w: 2.2, mult: 1.4, range: 16, cd: 5, anim: 'atk', tele: true }] }),
    seraph_archer: E({ name: '天界の射手', model: ['human', HW({ gender: 'f', main: '#f8f4ea', weapon: { type: 'bow', blade: '#ffd27a', e: 0.8 } }), 0.98], hpK: 1.4, atkK: 1.45, speed: 3.4, keep: 13, aggro: 26, el: 'light', weak: 'dark', exp: 1.3, drops: [['heavensteel', 0.06]], atk: [{ kind: 'proj', windup: 0.7, speed: 32, mult: 1.05, range: 28, cd: 2.0, anim: 'bow', look: 'lance', count: 3, spread: 0.3 }] }),
    halo_wisp: E({ name: '光輪の精', model: ['spirit', { glow: '#fff2b0', shell: '#ffd27a', shellE: 0.9 }], hpK: 1.3, atkK: 1.4, speed: 3.4, keep: 9, aggro: 22, el: 'light', weak: 'dark', fly: true, drops: [['heavensteel', 0.05]], atk: [{ kind: 'proj', windup: 0.7, speed: 24, mult: 1.0, range: 24, cd: 2.2, look: 'orb', count: 3, spread: 0.45, anim: 'cast' }] }),
    // ギミック：スイッチの水晶（叩くと点灯。6秒以内にすべて点灯させる）
    halo_pylon: E({ name: '光輪の柱', model: ['spirit', { glow: '#fff2b0', shell: '#ffd27a', shellE: 1.0 }, 1.8], hpK: 2.6, atkK: 0.1, defK: 1.4, speed: 0, aggro: 0, passive: true, static: true, el: 'light', weak: null, exp: 0.5, drops: [], radius: 0.9, atk: [] }),
    sw_orb: E({ name: 'スイッチの水晶', model: ['spirit', { glow: '#7fffd0', shell: '#3a8a8a', shellE: 0.3 }, 1.0], hpK: 0.02, atkK: 0.1, defK: 0.1, speed: 0, aggro: 0, passive: true, static: true, el: 'phys', exp: 0, drops: [], radius: 0.7, atk: [] }),
    // ---- 天への階段の超ツヨボス（熾天使） ----
    glaciel: E({ name: '天氷の熾天使 グラキエル', boss: true, seraph: 0, model: ['human', HW({ gender: 'f', gown: true, main: '#d8f0ff', sub: '#7fd8ff', accent: '#bff6ff', hair: '#e8fbff', crown: '#bff6ff', wingTip: '#7fd8ff', cape: '#a8d8f0', capeLong: true, weapon: { type: 'staff', glow: '#bff6ff', blade: '#7fd8ff' } }), 3.0], hpK: 50, atkK: 2.25, defK: 2.5, speed: 3.6, el: 'ice', weak: 'fire', exp: 200, radius: 1.6, keep: 8,
      atk: [{ kind: 'proj', windup: 0.7, speed: 26, mult: 1.1, range: 36, cd: 2.2, count: 9, spread: 1.2, look: 'lance', anim: 'cast', status: 'freeze' }, { kind: 'aoe', windup: 1.1, r: 4.5, mult: 1.7, range: 38, cd: 5, tele: true, count: 9, look: 'meteor', anim: 'cast', status: 'freeze' }, { kind: 'ring', windup: 0.9, r: 20, mult: 1.7, cd: 7, anim: 'cast' }, { kind: 'line', windup: 1.0, len: 30, w: 3, mult: 1.8, cd: 5, tele: true, fan: 6, anim: 'cast' }, { kind: 'circle', windup: 1.1, r: 9, mult: 2.0, cd: 6, tele: true, anim: 'cast', status: 'freeze' }, { kind: 'summon', windup: 1.0, cd: 18, what: 'seraph_archer', n: 2, phase2: true, anim: 'cast' }, { kind: 'proj', windup: 0.9, speed: 16, mult: 1.0, range: 40, cd: 6, count: 14, spread: 6.28, look: 'orb', homing: true, anim: 'cast', phase2: true }] }),
    igniel: E({ name: '天焔の熾天使 イグニエル', boss: true, seraph: 1, model: ['human', HW({ main: '#3a1e1a', sub: '#ffb03a', accent: '#ff6a2a', armor: '#f2d8b0', knightHelm: '#ffd27a', plume: '#ff6a2a', wingTip: '#ff6a2a', eyeGlow: '#ff9a3a', cape: '#8a1a1a', capeLong: true, weapon: { type: 'greatsword', blade: '#ffe8c0', glow: '#ff6a2a' } }), 3.1], hpK: 52, atkK: 2.35, defK: 2.45, speed: 4.4, el: 'fire', weak: 'water', exp: 200, radius: 1.7,
      atk: [{ kind: 'melee', windup: 0.7, r: 7.5, ang: 2.6, mult: 1.8, cd: 1.6, anim: 'atk', tele: true, status: 'burn' }, { kind: 'charge', windup: 0.8, dist: 28, w: 3.4, mult: 2.0, range: 30, cd: 5, anim: 'atk', tele: true }, { kind: 'cone', windup: 1.0, r: 18, ang: 0.9, mult: 0.8, ticks: 6, cd: 6, tele: true, status: 'burn', anim: 'cast' }, { kind: 'aoe', windup: 1.2, r: 5, mult: 1.8, range: 40, cd: 6, tele: true, count: 10, look: 'meteor', anim: 'cast', status: 'burn' }, { kind: 'jump', windup: 1.2, r: 10, mult: 2.4, range: 34, cd: 7, tele: true, anim: 'atk', phase2: true }, { kind: 'summon', windup: 1.0, cd: 18, what: 'seraph_knight', n: 2, phase2: true, anim: 'cast' }] }),
    arenael: E({ name: '天砂の熾天使 アレナエル', boss: true, seraph: 2, model: ['human', HW({ main: '#c8a06a', sub: '#fff2c8', accent: '#ffd27a', armor: '#e8d8b0', wingTip: '#c8a06a', crown: '#ffd27a', cape: '#a87a3a', capeLong: true, weapon: { type: 'axe', blade: '#fff2c8', glow: '#ffd27a' } }), 3.0], hpK: 54, atkK: 2.25, defK: 2.6, speed: 3.8, el: 'earth', weak: 'thunder', exp: 200, radius: 1.7,
      atk: [{ kind: 'melee', windup: 0.8, r: 7.5, ang: 2.4, mult: 1.9, cd: 1.8, anim: 'atk', tele: true }, { kind: 'aoe', windup: 1.2, r: 4.5, mult: 1.7, range: 38, cd: 5, tele: true, count: 8, look: 'tornado', anim: 'cast' }, { kind: 'line', windup: 1.1, len: 30, w: 3.4, mult: 1.9, cd: 5, tele: true, fan: 5, anim: 'atk' }, { kind: 'ring', windup: 1.0, r: 22, mult: 1.8, cd: 8, anim: 'atk' }, { kind: 'jump', windup: 1.2, r: 10, mult: 2.4, range: 34, cd: 7, tele: true, anim: 'atk' }, { kind: 'summon', windup: 1.0, cd: 18, what: 'halo_wisp', n: 3, phase2: true, anim: 'cast' }] }),
    fulgor: E({ name: '天雷の熾天使 フルゴル', boss: true, seraph: 3, model: ['human', HW({ main: '#2a2a5a', sub: '#e8e0ff', accent: '#c38cff', armor: '#e8e4ff', wingTip: '#c38cff', eyeGlow: '#e8d8ff', crown: '#c38cff', cape: '#3a2a7a', capeLong: true, weapon: { type: 'staff', glow: '#e8d8ff', blade: '#5a4aaa' } }), 3.0], hpK: 48, atkK: 2.4, defK: 2.45, speed: 4.0, el: 'thunder', weak: 'earth', exp: 200, radius: 1.6, keep: 9,
      atk: [{ kind: 'aoe', windup: 1.0, r: 4, mult: 1.8, range: 40, cd: 4, tele: true, count: 10, look: 'meteor', anim: 'cast' }, { kind: 'proj', windup: 0.7, speed: 30, mult: 1.1, range: 38, cd: 2.4, count: 7, spread: 1.0, look: 'orb', anim: 'cast' }, { kind: 'ring', windup: 0.9, r: 22, mult: 1.7, cd: 7, anim: 'cast' }, { kind: 'line', windup: 1.0, len: 32, w: 3, mult: 1.9, cd: 5, tele: true, fan: 8, anim: 'cast' }, { kind: 'charge', windup: 0.7, dist: 26, w: 3, mult: 1.8, range: 28, cd: 6, anim: 'atk', tele: true, phase2: true }, { kind: 'proj', windup: 0.9, speed: 18, mult: 1.0, range: 42, cd: 6, count: 16, spread: 6.28, look: 'orb', homing: true, anim: 'cast', phase2: true }] })
  });
  D.SERAPHS = ['glaciel', 'igniel', 'arenael', 'fulgor'];
  // ギミックダンジョンの敵
  Object.assign(D.DUNGEON_MOBS, {
    glacier4: ['seraph_knight', 'frost_lizard', 'cinder_yeti', 'aurora_wolf', 'yeti'],
    hell4: ['seraph_knight', 'magma_slime', 'salamander', 'flame_knight', 'obsidian_golem'],
    dune4: ['seraph_knight', 'dune_scorpion', 'sand_golem', 'sav_lion', 'mummy'],
    storm4: ['seraph_knight', 'storm_eagle', 'cloud_golem', 'sky_wisp', 'harpy']
  });
  Object.assign(D.DUNGEON_RANGED, { glacier4: ['seraph_archer', 'aurora_archer'], hell4: ['seraph_archer', 'halo_wisp'], dune4: ['seraph_archer', 'djinn'], storm4: ['seraph_archer', 'storm_eagle'] });
  for (const t of ['glacier4', 'hell4', 'dune4', 'storm4']) { D.DUNGEON_MOBS[t] = D.DUNGEON_MOBS[t].filter(k => D.ENEMIES[k]); D.DUNGEON_RANGED[t] = D.DUNGEON_RANGED[t].filter(k => D.ENEMIES[k]); }

  // 第四章：世界の果ての四つのギミックダンジョン（位置は地形から決める）
  D.CH4_DUNGEONS = [
    { id: 11, dir: [0, -1], reg: 7, ctier: 11, name: '極北の氷獄回廊', theme: 'glacier4', lv: 100, size: [4, 5], boss: 'fenrir', abil: ['wing', 'jump'], gim: 'ice', color: '#9fe6ff', stone: '#bcd2e4' },
    { id: 12, dir: [-1, 0], reg: 8, ctier: 11, name: '極西の煉獄神殿', theme: 'hell4', lv: 100, size: [4, 5], boss: 'volcanix', abil: ['jump', 'wing'], gim: 'fire', color: '#ff7a3a', stone: '#4c3632' },
    { id: 13, dir: [0, 1], reg: 6, ctier: 11, name: '極南の砂塵大迷宮', theme: 'dune4', lv: 100, size: [4, 5], boss: 'mirage', abil: ['wing', 'jump'], gim: 'sand', color: '#ffc84a', stone: '#c8a070' },
    { id: 14, dir: [1, 0], reg: 5, ctier: 11, name: '極東の雷鳴天廊', theme: 'storm4', lv: 100, size: [4, 5], boss: 'archangel', abil: ['jump', 'wing'], gim: 'thunder', color: '#c38cff', stone: '#5c5a84' }
  ];
  D.SKY_STAIRS = [
    { i: 0, name: '天への階段（極北）', boss: 'glaciel', color: '#bff6ff' },
    { i: 1, name: '天への階段（極西）', boss: 'igniel', color: '#ffb03a' },
    { i: 2, name: '天への階段（極南）', boss: 'arenael', color: '#ffe8a0' },
    { i: 3, name: '天への階段（極東）', boss: 'fulgor', color: '#c38cff' }
  ];

  // ================= 旅の仲間（4人追加） =================
  const CS = (o) => o;
  Object.assign(D.COMPANIONS, {
    aoi: {
      name: 'アオイ', title: '剣豪', en: 'SWORDMASTER', gender: 'f', icon: '⚔', color: '#7fa8ff', hp: 1750, atk: 520, def: 260, spd: 1.1, style: 'melee', interval: 0.95, reach: 2.8, ang: 1.8, mult: 1.0, el: 'wind', wtype: 'sword',
      quote: '一太刀で十分。……二太刀目は、あなたを守るために取っておく。',
      desc: '風のように速い剣さばきを持つ、無口な女剣豪。修行の旅の途中でモリノハ集落に立ち寄った。',
      merit: ['攻撃の手数がとても多い', '移動速度 x1.1'], demerit: ['防御力は低め'],
      v: 1, dx: -16, dz: -14, cond: { level: 25 }, condText: 'Lv.25以上でモリノハ集落にいる',
      look: { gender: 'f', main: '#2a3a6a', sub: '#f2f0ea', accent: '#7fa8ff', pants: '#1e2440', boots: '#2a2230', hair: '#1a1a2a', eye: '#7fa8ff', hairAcc: '#ff6a8a', scarf: '#c8402a', weapon: { type: 'sword', blade: '#e8f0ff', guard: '#c8402a' } },
      lines: { before: ['……修行中だ。話しかけるなら、もう少し強くなってからにしてくれ。'], join: ['……なるほど。あなたの剣、まだ荒いが筋がいい。', '一太刀で十分。……二太刀目は、あなたを守るために取っておく。', '連れていけ。退屈はさせない。'] },
      skills: [
        CS({ lv: 10, name: '疾風一閃', type: 'arc', el: 'wind', r: 4.2, ang: 2.4, mult: 2.6, cd: 6, desc: '風をまとった素早い横一閃。' }),
        CS({ lv: 20, name: '心眼', type: 'buff', stat: 'atk', val: 0.3, dur: 12, cd: 22, desc: '12秒間攻撃力が30%上がる。' }),
        CS({ lv: 30, name: '五月雨斬り', type: 'nova', el: 'wind', r: 5.5, mult: 3.4, cd: 10, desc: '周囲を雨のように斬り刻む。' }),
        CS({ lv: 40, name: '鎌鼬', type: 'volley', el: 'wind', n: 3, spread: 0.4, speed: 30, mult: 1.6, look: 'blade', cd: 8, desc: '真空の刃を三つ飛ばす。' }),
        CS({ lv: 50, name: '奥義・天翔', type: 'rain', el: 'wind', spots: 6, spread: 6, r: 4.5, mult: 3.8, delay: 0.5, cd: 18, desc: '天を翔ける無数の斬撃。' })
      ]
    },
    gaius: {
      name: 'ガイウス', title: '槍騎士', en: 'LANCER', gender: 'm', icon: '⚜', color: '#ffd27a', hp: 2300, atk: 450, def: 420, spd: 0.92, style: 'melee', interval: 1.4, reach: 3.6, ang: 1.2, mult: 1.35, el: 'phys', wtype: 'lance',
      quote: '我が槍は盾なり。背中は任せてもらおう、若き勇者よ。',
      desc: '浮上した大地を守るために旅をしている老練の槍騎士。重い鎧と長い槍で、どんな攻撃も受け止める。',
      merit: ['HPと防御力がとても高い', '攻撃のリーチが長い'], demerit: ['移動速度 x0.92'],
      v: 6, dx: 16, dz: 16, cond: {}, condText: '第二章の蜃気楼の都にいる',
      look: { gender: 'm', main: '#5a4a2a', sub: '#e8e0d0', accent: '#ffd27a', armor: '#c8c0b0', knightHelm: '#d8d0c0', plume: '#c8402a', pants: '#3a3020', boots: '#4a3a2a', hair: '#c8c0b0', eye: '#ffd27a', cape: '#7a1a1a', capeLong: true, weapon: { type: 'sword', blade: '#e8e0d0', guard: '#ffd27a' } },
      lines: { before: [], join: ['ほう、星喰竜の噂の転生者か。', '我が槍は盾なり。背中は任せてもらおう、若き勇者よ。', 'この老骨、まだまだ役に立つぞ。'] },
      skills: [
        CS({ lv: 10, name: '貫突', type: 'arc', el: 'phys', r: 5.2, ang: 1.0, mult: 3.0, cd: 7, desc: '長い槍で前方を一直線に貫く。' }),
        CS({ lv: 20, name: '鉄壁', type: 'buff', stat: 'def', val: 0.5, dur: 12, cd: 22, desc: '12秒間防御力が50%上がる。' }),
        CS({ lv: 30, name: '旋槍', type: 'nova', el: 'phys', r: 6.5, mult: 3.4, knock: 6, cd: 11, desc: '槍を振り回して周囲の敵を吹き飛ばす。' }),
        CS({ lv: 40, name: '不動の誓い', type: 'heal', pct: 0.2, cd: 18, desc: 'HPを20%回復する。' }),
        CS({ lv: 50, name: '天槍', type: 'rain', el: 'light', spots: 4, spread: 5, r: 5, mult: 4.4, delay: 0.7, cd: 18, desc: '天から光の槍を降らせる。' })
      ]
    },
    mimi: {
      name: 'ミミ', title: '人形使い', en: 'PUPPETEER', gender: 'f', icon: '🎎', color: '#ff9ec4', hp: 1600, atk: 500, def: 240, spd: 1.0, style: 'ranged', interval: 1.3, range: 22, speed: 26, mult: 1.1, el: 'dark', look: 'orb', wtype: 'orb',
      quote: 'この子たち、ミミのお友だち。あなたも、お友だちになってくれる？',
      desc: 'フロストヘイムの古い人形館に住む不思議な少女。たくさんの人形を魔法の糸で操って戦う。',
      merit: ['遠くから攻撃できる', '人形を使った多彩なスキル'], demerit: ['HP・防御力が低い'],
      v: 3, dx: -18, dz: 12, cond: { dungeon: 3 }, condText: '氷晶の洞窟を攻略するとフロストヘイムにいる',
      look: { gender: 'f', main: '#3a2a3a', sub: '#ffe8f0', accent: '#ff9ec4', pants: '#2a1e2a', boots: '#3a2a3a', hair: '#f2e8ff', eye: '#ff9ec4', hairAcc: '#ff9ec4', cape: '#5a2a4a', weapon: { type: 'staff', glow: '#ff9ec4', blade: '#3a2a3a' } },
      lines: { before: ['……おにいちゃん（おねえちゃん）、だれ？ もうすこし、強くなったら遊んであげる。'], join: ['わあ、氷の洞窟を越えてきたんだ！ すごいすごい！', 'この子たち、ミミのお友だち。あなたも、お友だちになってくれる？', 'いっしょに行く！ 人形たちもつれていくね。'] },
      skills: [
        CS({ lv: 10, name: '人形の行進', type: 'volley', el: 'dark', n: 4, spread: 0.6, speed: 24, mult: 1.1, look: 'orb', cd: 7, desc: '人形たちに一斉に攻撃させる。' }),
        CS({ lv: 20, name: 'お人形のおまじない', type: 'heal', pct: 0.18, cd: 16, desc: 'HPを18%回復する。' }),
        CS({ lv: 30, name: '糸の結界', type: 'nova', el: 'dark', r: 7, mult: 2.8, status: 'slow', cd: 12, desc: '魔法の糸で周囲の敵を縛り、動きを鈍らせる。' }),
        CS({ lv: 40, name: 'びっくり箱', type: 'rain', el: 'dark', spots: 5, spread: 6, r: 4.2, mult: 3.2, delay: 0.6, cd: 15, desc: 'びっくり箱を降らせて爆発させる。' }),
        CS({ lv: 50, name: '大人形劇場', type: 'nova', el: 'dark', r: 9, mult: 4.8, cd: 20, desc: '巨大な人形を呼び出し、すべてをなぎ倒す。' })
      ]
    },
    seraphi: {
      name: 'セラフィ', title: '天使', en: 'ANGEL', gender: 'f', icon: '😇', color: '#fff2b0', hp: 1900, atk: 540, def: 330, spd: 1.05, style: 'ranged', interval: 1.25, range: 24, speed: 30, mult: 1.15, el: 'light', look: 'orb', wtype: 'staff', ch: 4,
      quote: '天界の熾天使たちを、どうか止めてください。……わたしも、一緒に戦います。',
      desc: '天界から降りてきた見習いの天使。熾天使たちが天界の欠片を奪って暴走したことを知らせに来た。光の魔法が得意。',
      merit: ['攻撃力・防御力のバランスが良い', '光の魔法で遠くから攻撃'], demerit: ['とくになし（少しおっちょこちょい）'],
      v: 0, dx: 20, dz: -16, cond: {}, condText: '第四章でスターリーフ村にいる',
      look: { gender: 'f', gown: true, main: '#fff8e8', sub: '#ffd27a', accent: '#ffd27a', accentE: 0.6, hair: '#fff2c8', eye: '#ffd27a', crown: '#ffd27a', wings: '#fffbe8', wingTip: '#ffd27a', wingE: 0.6, weapon: { type: 'staff', glow: '#fff2b0', blade: '#c8a040' } },
      lines: { before: [], join: ['あなたが……三度この世界を救った転生者さまですね！', '天界の熾天使たちを、どうか止めてください。……わたしも、一緒に戦います。', '見習いですけど、光の魔法なら負けません！'] },
      skills: [
        CS({ lv: 10, name: '聖なる光弾', type: 'volley', el: 'light', n: 3, spread: 0.4, speed: 30, mult: 1.3, look: 'orb', cd: 6, desc: '光の弾を三つ放つ。' }),
        CS({ lv: 20, name: '天使の祝福', type: 'heal', pct: 0.25, cd: 16, desc: 'HPを25%回復する。' }),
        CS({ lv: 30, name: '光の輪', type: 'nova', el: 'light', r: 7, mult: 3.2, cd: 11, desc: '光の輪を広げて周囲の敵を攻撃する。' }),
        CS({ lv: 40, name: '天の守り', type: 'buff', stat: 'def', val: 0.45, dur: 12, cd: 22, desc: '12秒間防御力が45%上がる。' }),
        CS({ lv: 50, name: '天罰', type: 'rain', el: 'light', spots: 7, spread: 7, r: 5, mult: 4.0, delay: 0.7, cd: 20, desc: '天からの光で敵をまとめて裁く。' })
      ]
    }
  });
  D.COMP_ORDER.push('aoi', 'gaius', 'mimi', 'seraphi');
  D.NPCS.push(...['aoi', 'gaius', 'mimi', 'seraphi'].map(id => { const c = D.COMPANIONS[id]; return { id: 'c_' + id, v: c.v, name: c.title + ' ' + c.name, role: 'recruit', comp: id, dx: c.dx, dz: c.dz, look: c.look, ch: c.ch || (c.v >= 5 ? 2 : 1) }; }));
  // 人格切り替え：仲間は人数の上限なく仲間にでき、ついて来る代わりに数字キーで切り替えて自分で操作する
  D.SWITCH_KEYS = 9;
  D.PARTY_MAX = 0;

  // ================= 第四章のクエスト =================
  Object.assign(D.QUESTS, {
    mq10: { main: true, ch: 4, title: '天からの知らせ', desc: '虚晶の王を討ったあと、世界の果ての四方から、天へと続く光が見えるようになった。スターリーフ村の長老マルクに話を聞こう。', obj: [{ type: 'talk', npc: 'marc', text: 'スターリーフ村の長老マルクと話す' }], reward: { coins: 30000, exp: 0 }, next: 'mq11' },
    mq11: { main: true, ch: 4, title: '世界の果ての試練', desc: '極北・極西・極南・極東の世界の果てに、むずかしいギミックダンジョンが現れた。すべて突破して、天への階段を開こう。', obj: [
      { type: 'dungeon', id: 11, text: '極北の氷獄回廊を突破する（推奨Lv.100）' }, { type: 'dungeon', id: 12, text: '極西の煉獄神殿を突破する（推奨Lv.100）' },
      { type: 'dungeon', id: 13, text: '極南の砂塵大迷宮を突破する（推奨Lv.100）' }, { type: 'dungeon', id: 14, text: '極東の雷鳴天廊を突破する（推奨Lv.100）' }], reward: { coins: 200000, exp: 0 }, next: 'mq12' },
    mq12: { main: true, ch: 4, title: '天界の欠片', desc: 'ダンジョンを突破すると、その場所に「天への階段」が現れる。階段を登りきった先で、天界の欠片を持つ熾天使を倒そう。', obj: [
      { type: 'boss', id: 'glaciel', text: '天への階段（極北）で天氷の熾天使を倒す' }, { type: 'boss', id: 'igniel', text: '天への階段（極西）で天焔の熾天使を倒す' },
      { type: 'boss', id: 'arenael', text: '天への階段（極南）で天砂の熾天使を倒す' }, { type: 'boss', id: 'fulgor', text: '天への階段（極東）で天雷の熾天使を倒す' }], reward: { coins: 1000000, exp: 0, items: [['seraphfeather', 3], ['heavenfruit', 5]] }, next: null }
  });
  Object.assign(D.MARC, {
    ch4first: ['おお、来てくれたか。……空を見てごらん。世界の果ての四方に、天へ伸びる光が立っておる。', '言い伝えにある「天界」じゃ。熾天使たちが天界の欠片を奪い、暴走しておるらしい。', '極北・極西・極南・極東の世界の果てに、とてもむずかしい試練のダンジョンが現れた。', 'ダンジョンを突破すれば、その場所に「天への階段」が開かれる。登りきった先に、熾天使が待っておる。', '……とても強い相手じゃ。プラス進化の力も使うとよいじゃろう。'],
    ch4mid: ['世界の果ての試練は順調かのう。', 'ギミックダンジョンでは、スイッチの水晶を素早く全部点灯させねば扉が開かぬそうじゃ。', '天への階段の熾天使は、光輪の柱で身を守る。柱を砕くのを忘れるでないぞ。'],
    ch4end: ['四つの天界の欠片が……天へ還っていく。', 'あなたは四度、この世界を救ってくれた。本当に、本当にありがとう。']
  });
  D.CH4_INTRO = ['……{name}さん。ステラです。', '虚晶の王が倒れたあと……天界から、四つの光の柱が世界の果てに降りてきました。', '天界の熾天使たちが「天界の欠片」を奪い、天への階段の上で暴れているのです。', '極北・極西・極南・極東。四つの世界の果てにある試練を越え、階段を登ってください。', 'マップは広がりませんが……これまででいちばん、むずかしい旅になります。第四章の始まりです。'];

  // ================= お知らせ =================
  D.NEWS.unshift({
    ver: 'Beta v1.1.0', date: '2026.11.15', title: '第四章・プラス進化・人格切り替え', tag: '大型アップデート', items: [
      ['🌟', '第四章「天界の欠片」', '第三章をクリアすると開幕（マップは広がりません）。極北・極西・極南・極東の世界の果てに、むずかしいギミックダンジョンが登場。突破すると「天への階段」が現れ、登りきった先で天界の欠片を持つ超ツヨボス「熾天使」と戦えます。'],
      ['🧩', 'ギミックダンジョン', '6秒以内に全部点灯させないと扉が開かない「スイッチの水晶」や、つららの落下・炎の噴出・砂嵐・落雷などの仕掛けが待ち受けます。'],
      ['✚', 'プラス進化', 'プラスクリスタル15個・Lv.81以上で、15分間ステータスがLv.+20相当に上限突破し、姿も大きく変わります。人格によっては副作用あり（覚醒者・予言者は進化できません）。プラスクリスタルは第二章の各地で手に入ります。'],
      ['🔄', '人格切り替え', '旅の仲間は人数の上限なく仲間にできるようになりました。仲間はついて来るのではなく、数字キー（1〜9）でそのキャラに切り替えて自分で操作します。キーの割り当ては「仲間」画面で設定できます。'],
      ['🤝', '旅の仲間4人', '剣豪アオイ、槍騎士ガイウス、人形使いミミ、天使セラフィが登場。'],
      ['🍑', '第四章の限定アイテム', '天界の果実・天鋼・熾天使の羽根、そして天界の武器。'],
      ['🪙', 'コインの量を調整', '敵・宝箱・ダンジョン・クエストで手に入るスターコインを減らしました。']
    ]
  });
  D.TIPS = D.TIPS.filter(t => t.indexOf('最大2人まで') < 0);
  D.TIPS.push(
    '旅の仲間は人数の上限なく仲間にできます。数字キーで切り替えて、自分で操作しよう。',
    'プラス進化はプラスクリスタル15個とLv.81以上が必要です。V キーで進化できます。',
    '数字キー（1〜4）で、主人公と仲間（3人まで）を切り替えて操作できます。',
    'スイッチの水晶は、6秒以内にすべて叩いて点灯させよう。',
    'プラスクリスタルは、第二章の大地の敵や採集ポイントで手に入ります。'
  );
})(window.PS);
