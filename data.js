/* Personality Stars - data.js : 人格・スキル・武器・アイテム・敵・クエスト  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const D = PS.DATA = {};
  D.VERSION = '1.0.5';
  D.VERSION_LABEL = 'Beta v1.0.5';
  D.MAX_LV = 100;
  D.ELEM = {
    fire: { name: '炎', c: '#ff7a3a' }, water: { name: '水', c: '#4fb4ff' }, wind: { name: '風', c: '#5ff0c8' }, ice: { name: '氷', c: '#9fe6ff' },
    thunder: { name: '雷', c: '#c38cff' }, earth: { name: '岩', c: '#e0b050' }, light: { name: '光', c: '#fff0a0' }, dark: { name: '闇', c: '#b05cff' }, arcane: { name: '魔', c: '#d08cff' }, phys: { name: '物理', c: '#ffffff' }
  };
  // ---------------- 人格 ----------------
  D.PERS = {
    adventurer: {
      name: '冒険者', en: 'ADVENTURER', icon: '⚔', color: '#4f86e8', hp: 1750, atk: 350, def: 200, spd: 1.0, weapons: ['sword', 'axe'], start: 's_start', every: 5,
      desc: '剣を初期装備。一般的に使える能力はないが、炎技・水技・風技を使った剣術を覚えることができる。',
      merit: ['Lv.5ごとに炎・水・風の剣術スキルを習得', '剣と斧の両方を装備できる'], demerit: ['固有の特殊能力を持たない'],
      look: { main: '#2f4f8f', sub: '#f2efe8', accent: '#e0b84a', pants: '#2b3346', boots: '#5a3d2b', cape: '#22385f', scarf: '#c8402a', eye: '#4ab0ff' }
    },
    miner: {
      name: '採掘者', en: 'MINER', icon: '⛏', color: '#e08a3a', hp: 1800, atk: 560, def: 90, spd: 0.95, weapons: ['axe'], start: 'a_start', every: 10,
      desc: '斧を初期装備。攻撃力が高く、モンスターに高ダメージを与えられる。ただし防御力が低く、斧を投げる速度（クールタイム）が遅い。',
      merit: ['攻撃力が非常に高い', '斧で大ダメージを与えられる'], demerit: ['防御力が低い', '移動速度 x0.95', '斧投げのクールタイムが長い'],
      look: { main: '#8a5a34', sub: '#e8a04a', accent: '#f2c94a', pants: '#4a3a2e', boots: '#3a2a20', helmet: '#f2c23a', eye: '#ffae3a' }
    },
    flyer: {
      name: '飛翔者', en: 'FLYER', icon: '🪽', color: '#7fd4ff', hp: 1920, atk: 290, def: 450, spd: 1.0, weapons: ['sword'], start: 's_start', every: 10, flight: 3,
      desc: '剣を初期装備。空を数秒間飛ぶことができ、防御力も高い。ただし攻撃力が低く、長期戦になりやすい。',
      merit: ['空中でジャンプすると3秒間飛べる（Lv.5ごとに+1秒）', '防御力が高い'], demerit: ['攻撃力が低い', '長期戦になりやすい'],
      look: { main: '#eaf4ff', sub: '#7fb8e8', accent: '#9fe0ff', pants: '#3a4a66', boots: '#e8eef6', wings: '#ffffff', wingTip: '#9fe0ff', eye: '#7fd4ff', hairAcc: '#ffffff' }
    },
    sprinter: {
      name: '俊足者', en: 'SPRINTER', icon: '⚡', color: '#7ad04a', hp: 1600, atk: 390, def: 210, spd: 1.25, weapons: ['sword'], start: 's_start', every: 10,
      desc: '剣を初期装備。歩く速度・走る速度が速くなり、攻撃力も少しだけ増える。ただしHPが少なく、大ダメージに耐えにくい。',
      merit: ['移動速度 x1.25', '攻撃力が少し高い'], demerit: ['HPが少ない'],
      look: { main: '#3f8a3a', sub: '#f2e64a', accent: '#f2e64a', pants: '#2a3a2a', boots: '#e8e8e8', headband: '#f2e64a', eye: '#9cf04a' }
    },
    awakener: {
      name: '覚醒者', en: 'AWAKENER', icon: '☄', color: '#e0405a', hp: 1620, atk: 250, def: 175, spd: 0.95, weapons: ['sword', 'axe'], start: 's_start', awaken: 30,
      desc: '剣を初期装備。覚醒モードに入ると全ステータスが大幅に上昇する（初期x2.5）。ただし覚醒は30秒しか続かず、通常時のステータスは低い。覚醒しないと勝てない。',
      merit: ['覚醒中は全ステータス x2.5', 'Lv.5ごとに覚醒時間+10秒'], demerit: ['スキルを覚えられない', '通常時のステータスが低い', '移動速度 x0.95'],
      look: { main: '#1e1a24', sub: '#c8203a', accent: '#ff3a4a', accentE: 0.6, pants: '#151219', boots: '#2a1a1e', horns: '#c8203a', scarf: '#8a1028', eye: '#ff3a4a' }
    },
    mage: {
      name: '魔術者', en: 'MAGE', icon: '✦', color: '#b46cff', hp: 1760, atk: 310, def: 200, spd: 1.05, weapons: ['staff'], start: 't_start', every: 7,
      desc: '杖を初期装備。通常魔法は少しだけ弱いが、スキル魔法は格段に強く、クールダウンも短い。ただし魔法を覚えるまでの序盤は少しきつい。',
      merit: ['スキル魔法が非常に強力', 'スキルのクールダウンが短い', 'Lv.7ごとに魔法を習得', '移動速度 x1.05'], demerit: ['通常魔法が少し弱い', '序盤がきつい'],
      look: { main: '#4a2a7a', sub: '#e8d8ff', accent: '#e0c06a', pants: '#2a1e3a', boots: '#3a2a4a', hat: 'wizard', eye: '#c58cff', cape: '#3a1e5e', capeLong: true }
    },
    healer: {
      name: '回復者', en: 'HEALER', icon: '✚', color: '#5fe0a0', hp: 2000, atk: 290, def: 200, spd: 1.0, weapons: ['sword', 'staff'], start: 's_start', every: 10, regen: true,
      desc: '剣を初期装備。ダメージを受けても自動回復する（初期: 被弾3秒後から毎秒HP10回復）。HPも多い。ただし攻撃力が低く長期戦になりやすい。',
      merit: ['被弾3秒後から自動回復', 'HPが多い', '剣と杖を装備できる'], demerit: ['攻撃力が低い', '長期戦になりやすい'],
      look: { main: '#f4f6f2', sub: '#5fc08a', accent: '#e0c06a', pants: '#e8ece6', boots: '#7a9a7a', halo: '#ffe680', eye: '#5fe0a0', cape: '#5fc08a' }
    },
    honest: {
      name: '正直者', en: 'HONEST', icon: '⚖', color: '#5ab0ff', hp: 1920, atk: 410, def: 290, spd: 1.1, weapons: ['sword'], start: 's_start', every: 10, honest: true,
      desc: '剣を初期装備。最初からステータスが高く、足も速い。ただしダンジョンやミッションの攻略には制限時間があり、報酬量・レベルアップに必要な経験値の獲得量も少し少ない。',
      merit: ['最初からステータスが高い', '移動速度 x1.1', 'Lv.10ごとにスキルを習得'], demerit: ['ダンジョン・ミッションに制限時間がある', '報酬・獲得経験値が25%減少'],
      look: { main: '#2f3f6a', sub: '#f2f0ea', accent: '#e8c46a', pants: '#2a2f3e', boots: '#4a3426', scarf: '#3a7ad8', eye: '#5ab0ff', cape: '#24345a' }
    }
  };
  D.PERS_ORDER = ['adventurer', 'miner', 'flyer', 'sprinter', 'awakener', 'mage', 'healer', 'honest'];
  D.LVUP = { hp: [1500, 1750], atk: [500, 550], def: [250, 320] };
  D.expNeed = (lv) => Math.round(60 + 40 * Math.pow(lv, 1.45));
  D.expGain = (lv) => Math.round(20 + 12 * Math.pow(lv, 1.25));

  // ---------------- 通常攻撃 ----------------
  D.NORMAL = {
    sword: { mult: [0.9, 0.95, 1.15, 1.5], dur: [0.36, 0.36, 0.42, 0.58], hit: 0.35, r: 2.9, ang: 2.3, step: 0.7 },
    axe: { mult: [1.35, 1.6, 2.2], dur: [0.62, 0.66, 0.5], hit: 0.45, r: 3.2, ang: 2.4, step: 0.5, throwCd: 1.6 },
    staff: { mult: [0.72, 0.78, 1.0], dur: [0.4, 0.4, 0.55], hit: 0.4, range: 24, speed: 30 }
  };
  // ---------------- スキル ----------------
  const S = (o) => o;
  D.SKILLS = {
    adventurer: [
      S({ id: 'ad1', lv: 5, name: '炎剣・紅蓮斬', type: 'arc', el: 'fire', r: 4.6, ang: 2.6, mult: 2.4, cd: 6, status: 'burn', desc: '炎をまとった剣で前方を大きく薙ぎ払う。' }),
      S({ id: 'ad2', lv: 10, name: '水剣・流水突', type: 'dash', el: 'water', dist: 9, w: 2.2, mult: 2.6, cd: 7, desc: '水流のように前方へ突進し、触れた敵を斬る。' }),
      S({ id: 'ad3', lv: 15, name: '風剣・旋風陣', type: 'spin', el: 'wind', r: 3.9, dur: 2.4, ticks: 8, mult: 0.7, cd: 10, pull: true, desc: '旋風を巻き起こし、周囲の敵を引き寄せながら斬り刻む。' }),
      S({ id: 'ad4', lv: 20, name: '炎剣・爆炎陣', type: 'nova', el: 'fire', r: 6.5, mult: 3.8, cd: 11, status: 'burn', desc: '剣を地に突き立て、周囲を爆炎で吹き飛ばす。' }),
      S({ id: 'ad5', lv: 25, name: '水剣・蒼波斬', type: 'proj', el: 'water', n: 1, speed: 22, size: 2.8, pierce: true, range: 26, mult: 3.4, cd: 8, look: 'wave', desc: '巨大な水の斬撃を飛ばし、直線上の敵を貫く。' }),
      S({ id: 'ad6', lv: 30, name: '風剣・疾風連斬', type: 'multi', el: 'wind', count: 3, sub: { type: 'dash', dist: 6, w: 2.4, mult: 1.7 }, cd: 12, desc: '疾風の如く三度駆け抜け、敵を斬り裂く。' }),
      S({ id: 'ad7', lv: 35, name: '炎剣・鳳凰天翔', type: 'leap', el: 'fire', r: 7, mult: 5.0, range: 14, cd: 14, status: 'burn', desc: '炎の鳳凰となって敵の頭上から急襲する。' }),
      S({ id: 'ad8', lv: 40, name: '水剣・大海嘯', type: 'nova', el: 'water', r: 9, mult: 5.5, cd: 16, knock: 6, desc: '大波を呼び起こし、周囲の敵をまとめて押し流す。' }),
      S({ id: 'ad9', lv: 45, name: '風剣・天空裂破', type: 'proj', el: 'wind', n: 5, spread: 0.55, speed: 30, size: 1.4, pierce: true, range: 28, mult: 2.3, cd: 12, look: 'blade', desc: '扇状に五つの風刃を放つ。' }),
      S({ id: 'ad10', lv: 50, name: '炎剣・終焉の業火', type: 'rain', el: 'fire', spots: 5, spread: 6, r: 5, ticks: 3, interval: 0.35, delay: 0.6, mult: 3.0, cd: 18, status: 'burn', desc: '周囲に業火の柱を立て、敵を焼き尽くす。' }),
      S({ id: 'ad11', lv: 55, name: '水剣・深淵の渦', type: 'spin', el: 'water', r: 7, dur: 4, ticks: 14, mult: 1.0, cd: 18, pull: true, desc: '深淵の大渦で敵を飲み込み続ける。' }),
      S({ id: 'ad12', lv: 60, name: '三界剣・星詠み', type: 'nova', el: 'light', r: 11, mult: 12, cd: 30, desc: '炎・水・風を束ねた星の一閃。冒険者の到達点。' })
    ],
    miner: [
      S({ id: 'mi1', lv: 10, name: '大地割り', type: 'nova', el: 'earth', r: 5.5, mult: 3.4, cd: 9, stun: 1.2, desc: '斧を地面に叩きつけ、周囲の大地を割る。' }),
      S({ id: 'mi2', lv: 20, name: '回転大斧', type: 'spin', el: 'phys', r: 4.2, dur: 2.5, ticks: 7, mult: 1.15, cd: 12, desc: '斧を振り回して回転し、周囲を薙ぎ払う。' }),
      S({ id: 'mi3', lv: 30, name: '岩砕きの大投擲', type: 'proj', el: 'earth', n: 1, speed: 20, size: 2.4, pierce: true, range: 22, mult: 5.0, cd: 10, look: 'axe', ret: true, desc: '巨大化させた斧を投げ、往復で敵を砕く。' }),
      S({ id: 'mi4', lv: 40, name: '鉱脈爆破', type: 'rain', el: 'earth', spots: 6, line: true, spread: 3.2, r: 4, ticks: 1, delay: 0.25, mult: 3.6, cd: 15, desc: '前方の地中の鉱脈を連鎖爆破させる。' }),
      S({ id: 'mi5', lv: 50, name: '剛力解放', type: 'buff', stat: 'atk', val: 0.5, dur: 15, cd: 30, desc: '15秒間、攻撃力が50%上昇する。' }),
      S({ id: 'mi6', lv: 60, name: '天地崩壊', type: 'nova', el: 'earth', r: 12, mult: 14, cd: 30, stun: 2, desc: '天と地を揺るがす一撃。採掘者の極み。' })
    ],
    flyer: [
      S({ id: 'fl1', lv: 10, name: '天翔斬', type: 'leap', el: 'wind', r: 4.5, mult: 2.9, range: 10, cd: 8, desc: '空高く跳び上がり、敵へ斬り下ろす。' }),
      S({ id: 'fl2', lv: 20, name: '風の盾', type: 'buff', stat: 'def', val: 0.6, dur: 12, cd: 18, extra: { type: 'nova', el: 'wind', r: 4.5, mult: 1.2, knock: 5 }, desc: '風の盾をまとい防御力60%上昇。周囲の敵を吹き飛ばす。' }),
      S({ id: 'fl3', lv: 30, name: '急降下', type: 'leap', el: 'wind', r: 6.5, mult: 4.6, range: 18, cd: 12, desc: '遥か上空から敵めがけて急降下する。' }),
      S({ id: 'fl4', lv: 40, name: '羽根の嵐', type: 'proj', el: 'wind', n: 12, spread: 6.28, speed: 24, size: 0.8, homing: true, range: 30, mult: 1.0, cd: 12, look: 'feather', desc: '無数の羽根を放ち、敵を追尾して切り裂く。' }),
      S({ id: 'fl5', lv: 50, name: '蒼穹の加護', type: 'buff', stat: 'atk', val: 0.35, dur: 15, cd: 30, refill: true, desc: '15秒間攻撃力35%上昇し、飛行時間を全回復する。' }),
      S({ id: 'fl6', lv: 60, name: '天空の審判', type: 'rain', el: 'light', spots: 8, spread: 8, r: 5, ticks: 1, delay: 0.8, mult: 5.0, cd: 25, desc: '天から光の柱を降らせ、大地を裁く。' })
    ],
    sprinter: [
      S({ id: 'sp1', lv: 10, name: '疾風突き', type: 'dash', el: 'wind', dist: 10, w: 2, mult: 2.6, cd: 5, desc: '目にも止まらぬ速さで突進する。' }),
      S({ id: 'sp2', lv: 20, name: '残像連撃', type: 'multi', el: 'phys', count: 4, sub: { type: 'dash', dist: 5, w: 2.2, mult: 1.4 }, cd: 10, desc: '残像を残しながら四連続で斬りかかる。' }),
      S({ id: 'sp3', lv: 30, name: '加速', type: 'buff', stat: 'spd', val: 0.4, dur: 12, cd: 25, extraStat: { atk: 0.2 }, desc: '12秒間、移動速度40%・攻撃力20%上昇。' }),
      S({ id: 'sp4', lv: 40, name: '雷光一閃', type: 'dash', el: 'thunder', dist: 18, w: 2.6, mult: 6.0, cd: 12, desc: '稲妻となって一直線に駆け抜ける。' }),
      S({ id: 'sp5', lv: 50, name: '千の刃', type: 'spin', el: 'phys', r: 4.2, dur: 3, ticks: 20, mult: 0.75, cd: 15, desc: '目にも止まらぬ連撃で周囲を斬り刻む。' }),
      S({ id: 'sp6', lv: 60, name: '神速・刹那', type: 'multi', el: 'thunder', count: 8, sub: { type: 'dash', dist: 6, w: 2.5, mult: 2.5 }, cd: 25, desc: '神の速さで八度斬り抜ける奥義。' })
    ],
    awakener: [],
    mage: [
      S({ id: 'ma1', lv: 7, name: 'ファイアボール', type: 'proj', el: 'fire', n: 1, speed: 26, size: 1.0, explode: 3, range: 30, mult: 2.8, cd: 2.5, look: 'orb', status: 'burn', desc: '爆発する火球を放つ。' }),
      S({ id: 'ma2', lv: 14, name: 'アイスランス', type: 'proj', el: 'ice', n: 3, spread: 0.25, speed: 34, size: 0.8, pierce: true, range: 32, mult: 1.9, cd: 3, look: 'lance', status: 'slow', desc: '貫通する氷の槍を三本放ち、敵を鈍らせる。' }),
      S({ id: 'ma3', lv: 21, name: 'サンダーストーム', type: 'rain', el: 'thunder', spots: 1, spread: 0, r: 5.5, ticks: 6, interval: 0.4, delay: 0.3, mult: 1.3, cd: 6, desc: '敵の頭上に雷雲を呼び、落雷を浴びせる。' }),
      S({ id: 'ma4', lv: 28, name: '魔力増幅', type: 'buff', stat: 'atk', val: 0.45, dur: 15, cd: 25, desc: '15秒間、攻撃力が45%上昇する。' }),
      S({ id: 'ma5', lv: 35, name: 'メテオ', type: 'rain', el: 'fire', spots: 1, spread: 0, r: 7, ticks: 1, delay: 1.1, mult: 8.5, cd: 9, status: 'burn', meteor: true, desc: '巨大な隕石を落とす。' }),
      S({ id: 'ma6', lv: 42, name: 'アーケインバラージ', type: 'proj', el: 'arcane', n: 10, spread: 1.4, speed: 26, size: 0.7, homing: true, range: 34, mult: 1.15, cd: 7, look: 'orb', desc: '追尾する魔力弾を十発放つ。' }),
      S({ id: 'ma7', lv: 49, name: 'ブリザード', type: 'rain', el: 'ice', spots: 1, spread: 0, r: 9, ticks: 10, interval: 0.35, delay: 0.2, mult: 1.05, cd: 12, status: 'slow', desc: '広範囲に猛吹雪を巻き起こす。' }),
      S({ id: 'ma8', lv: 56, name: '星滅の魔導', type: 'rain', el: 'arcane', spots: 6, spread: 7, r: 6, ticks: 1, delay: 1.0, mult: 6.5, cd: 20, meteor: true, desc: '星々を降らせる禁断の大魔法。' })
    ],
    healer: [
      S({ id: 'he1', lv: 10, name: '癒しの光', type: 'heal', pct: 0.25, cd: 10, extra: { type: 'nova', el: 'light', r: 4, mult: 1.3 }, desc: 'HPを25%回復し、周囲の敵に光のダメージを与える。' }),
      S({ id: 'he2', lv: 20, name: '聖なる刃', type: 'arc', el: 'light', r: 5, ang: 2.8, mult: 3.1, cd: 7, desc: '光の刃で前方を大きく斬り払う。' }),
      S({ id: 'he3', lv: 30, name: '再生の祈り', type: 'heal', pct: 0, hot: 0.45, hotDur: 10, cd: 20, desc: '10秒かけてHPを45%回復する。' }),
      S({ id: 'he4', lv: 40, name: '光輪', type: 'nova', el: 'light', r: 7, mult: 4.2, cd: 14, heal: 0.15, desc: '光の輪を広げて敵を攻撃し、HPを15%回復する。' }),
      S({ id: 'he5', lv: 50, name: '守護の結界', type: 'buff', stat: 'def', val: 0.8, dur: 12, cd: 28, heal: 0.2, desc: '12秒間防御力80%上昇し、HPを20%回復する。' }),
      S({ id: 'he6', lv: 60, name: '聖天の祝福', type: 'heal', pct: 1.0, cd: 40, extra: { type: 'nova', el: 'light', r: 10, mult: 8 }, desc: 'HPを全回復し、聖なる光で周囲を浄化する。' })
    ],
    honest: [
      S({ id: 'ho1', lv: 10, name: '誠実の一閃', type: 'arc', el: 'light', r: 4.8, ang: 2.2, mult: 2.6, cd: 6, desc: 'まっすぐな心で放つ一閃。前方を大きく斬り払う。' }),
      S({ id: 'ho2', lv: 20, name: 'まっすぐ突進', type: 'dash', el: 'phys', dist: 11, w: 2.4, mult: 2.9, cd: 7, desc: '迷わず一直線に駆け抜け、触れた敵を斬る。' }),
      S({ id: 'ho3', lv: 30, name: '真実の盾', type: 'buff', stat: 'def', val: 0.6, dur: 14, cd: 22, heal: 0.15, desc: '14秒間防御力が60%上昇し、HPを15%回復する。' }),
      S({ id: 'ho4', lv: 40, name: '正義の剣舞', type: 'spin', el: 'light', r: 4.4, dur: 2.6, ticks: 9, mult: 0.9, cd: 11, desc: '光をまとった剣舞で周囲の敵を斬り刻む。' }),
      S({ id: 'ho5', lv: 50, name: '裁きの光柱', type: 'rain', el: 'light', spots: 4, spread: 5, r: 4.5, ticks: 2, interval: 0.4, delay: 0.5, mult: 3.2, cd: 13, desc: '敵の周囲に光の柱を立てて裁く。' }),
      S({ id: 'ho6', lv: 60, name: '誓いの剛剣', type: 'nova', el: 'phys', r: 8, mult: 7.5, cd: 16, stun: 1.5, desc: '剣を大地に突き立て、誓いの衝撃で周囲を吹き飛ばす。' }),
      S({ id: 'ho7', lv: 70, name: '揺るがぬ信念', type: 'buff', stat: 'atk', val: 0.6, dur: 15, cd: 30, extraStat: { spd: 0.15 }, desc: '15秒間、攻撃力60%・移動速度15%上昇。' }),
      S({ id: 'ho8', lv: 80, name: '真実一路', type: 'multi', el: 'light', count: 5, sub: { type: 'dash', dist: 7, w: 2.6, mult: 2.8 }, cd: 16, desc: '光の軌跡を描き、五度まっすぐ斬り抜ける。' }),
      S({ id: 'ho9', lv: 90, name: '天秤の審判', type: 'rain', el: 'light', spots: 9, spread: 9, r: 5.5, ticks: 1, delay: 0.9, mult: 7.5, cd: 24, meteor: true, desc: '天秤の光を降らせ、周囲の悪を裁く。' }),
      S({ id: 'ho10', lv: 100, name: '正直者の極光剣', type: 'nova', el: 'light', r: 13, mult: 22, cd: 35, desc: '嘘偽りのない心が放つ極光の一撃。正直者の到達点。' })
    ]
  };
  // ---------------- 武器 ----------------
  const Wp = (id, name, type, atk, rar, el, look, desc, price) => ({ id, name, type, atk, rar, el, look: look || {}, desc, price: price || 0 });
  D.WEAPONS = [
    Wp('s_start', '旅人の剣', 'sword', 0, 1, null, {}, '転生と同時に手にしていた、ごく普通の剣。'),
    Wp('s_iron', '鉄の剣', 'sword', 250, 2, null, { blade: '#c8d0d8' }, 'スターリーフ村の鍛冶屋が打った丈夫な剣。', 1500),
    Wp('s_wind', '翠風の剣', 'sword', 700, 3, 'wind', { glow: '#5ff0c8', guard: '#4fc0a0' }, '風の古塔に眠っていた剣。風の加護を宿す。'),
    Wp('s_forest', '森守りの剣', 'sword', 1400, 3, null, { blade: '#d8e8c8', guard: '#6a9a4a', glow: '#b8ff7a' }, '森の民が守り続けてきた剣。', 9000),
    Wp('s_sand', '砂塵の曲刀', 'sword', 2600, 4, 'earth', { blade: '#f0d8a0', guard: '#c08a3a', glow: '#ffd27a' }, '砂漠の王墓から出土した黄金の曲刀。', 24000),
    Wp('s_ice', '氷晶の剣', 'sword', 4200, 4, 'ice', { blade: '#c8f0ff', guard: '#7fb8e8', glow: '#9fe6ff' }, '永久氷晶を削り出した剣。斬った敵を鈍らせる。'),
    Wp('s_flame', '紅蓮の剣', 'sword', 6500, 5, 'fire', { blade: '#ffb08a', guard: '#c8402a', glow: '#ff7a3a' }, '溶岩の中で鍛えられた剣。斬った敵を燃やす。'),
    Wp('s_star', '星剣ステラリア', 'sword', 9500, 5, 'light', { blade: '#fffbe8', guard: '#f0d070', glow: '#fff0a0' }, '世界を救った者にのみ応える星の剣。'),
    Wp('a_start', '木こりの斧', 'axe', 0, 1, null, {}, '使い込まれた重い斧。採掘者の相棒。'),
    Wp('a_steel', '鋼の斧', 'axe', 300, 2, null, { blade: '#d8dde4' }, '鋼で作られた頑丈な斧。', 1600),
    Wp('a_wind', '風断ちの斧', 'axe', 800, 3, 'wind', { glow: '#5ff0c8' }, '風を断ち切ると言われる斧。'),
    Wp('a_great', '大樹割りの斧', 'axe', 1600, 3, null, { blade: '#e0e8d0', glow: '#b8ff7a' }, '大樹をも一撃で割る大斧。', 9500),
    Wp('a_sand', '砂岩の戦斧', 'axe', 2900, 4, 'earth', { blade: '#e8c890', glow: '#ffd27a', guard: '#c08a3a' }, '砂の戦士が振るった戦斧。', 25000),
    Wp('a_ice', '凍てつく大斧', 'axe', 4600, 4, 'ice', { blade: '#c8f0ff', glow: '#9fe6ff' }, '触れたものを凍てつかせる大斧。'),
    Wp('a_lava', '溶岩の斧', 'axe', 7000, 5, 'fire', { blade: '#ffb08a', glow: '#ff6a2a', guard: '#5a2a1a' }, '刃から溶岩が滴る斧。'),
    Wp('a_star', '星砕きの斧', 'axe', 10000, 5, 'light', { blade: '#fffbe8', glow: '#fff0a0', guard: '#f0d070' }, '星をも砕くと伝えられる伝説の斧。'),
    Wp('t_start', '見習いの杖', 'staff', 0, 1, null, {}, '魔術を学ぶ者が最初に持つ杖。'),
    Wp('t_oak', '樫の杖', 'staff', 220, 2, null, { glow: '#a8d8ff' }, '樫の木から作られた杖。魔力の通りが良い。', 1400),
    Wp('t_wind', '精霊の杖', 'staff', 650, 3, 'wind', { glow: '#5ff0c8', blade: '#3a6a5a' }, '風の精霊が宿る杖。'),
    Wp('t_forest', '翠玉の杖', 'staff', 1300, 3, null, { glow: '#7aff9a', blade: '#3a5a3a' }, '大きな翠玉をはめ込んだ杖。', 8800),
    Wp('t_sun', '太陽の杖', 'staff', 2400, 4, 'fire', { glow: '#ffd27a', blade: '#8a6a3a' }, '砂漠の太陽を封じた杖。', 23000),
    Wp('t_ice', '氷霊の杖', 'staff', 3900, 4, 'ice', { glow: '#9fe6ff', blade: '#3a5a7a' }, '氷の霊が宿る杖。'),
    Wp('t_flame', '炎帝の杖', 'staff', 6000, 5, 'fire', { glow: '#ff6a2a', blade: '#5a2a1a' }, '炎の帝王が用いた杖。'),
    Wp('t_star', '星詠みの杖', 'staff', 9000, 5, 'light', { glow: '#fff0a0', blade: '#e0d0a0' }, '星々の声を聴く杖。')
  ];
  D.W = {}; D.WEAPONS.forEach(w => D.W[w.id] = w);
  D.TIER_WEAPON = [{ sword: 's_wind', axe: 'a_wind', staff: 't_wind' }, { sword: 's_forest', axe: 'a_great', staff: 't_forest' }, { sword: 's_sand', axe: 'a_sand', staff: 't_sun' }, { sword: 's_ice', axe: 'a_ice', staff: 't_ice' }, { sword: 's_flame', axe: 'a_lava', staff: 't_flame' }, { sword: 's_star', axe: 'a_star', staff: 't_star' }];
  // ---------------- アイテム ----------------
  D.ITEMS = {
    sweetflower: { name: 'スイートフラワー', cat: 'food', heal: 0.12, rar: 1, icon: '🌼', desc: '甘い蜜を持つ花。食べるとHPが12%回復する。', sell: 10 },
    mint: { name: 'ミントの葉', cat: 'food', heal: 0.08, rar: 1, icon: '🌿', desc: '爽やかな香りの葉。HPが8%回復する。', sell: 8 },
    mushroom: { name: '森キノコ', cat: 'food', heal: 0.1, rar: 1, icon: '🍄', desc: '森で採れるキノコ。HPが10%回復する。', sell: 10 },
    berry: { name: '森ベリー', cat: 'food', heal: 0.1, rar: 1, icon: '🫐', desc: '甘酸っぱい木の実。HPが10%回復する。', sell: 10 },
    meat: { name: '獣肉', cat: 'food', heal: 0.14, rar: 1, icon: '🍖', desc: 'イノシシから得た肉。HPが14%回復する。', sell: 15 },
    cactusfruit: { name: 'サボテンの実', cat: 'food', heal: 0.15, rar: 2, icon: '🌵', desc: '水分たっぷりの実。HPが15%回復する。', sell: 20 },
    snowflower: { name: '雪晶花', cat: 'food', heal: 0.15, rar: 2, icon: '❄', desc: '氷原に咲く結晶の花。HPが15%回復する。', sell: 20 },
    firefruit: { name: '炎の実', cat: 'food', heal: 0.2, rar: 2, icon: '🔥', desc: '火山に実る熱い果実。HPが20%回復する。', sell: 25 },
    roast: { name: 'ハニーロースト', cat: 'food', heal: 0.35, rar: 3, icon: '🍗', desc: '蜂蜜で焼き上げた料理。HPが35%回復する。', price: 300, sell: 60 },
    potion: { name: 'HPポーション', cat: 'food', heal: 0.5, rar: 3, icon: '🧪', desc: '魔法の回復薬。HPが50%回復する。', price: 800, sell: 150 },
    elixir: { name: 'エリクサー', cat: 'food', heal: 1.0, rar: 4, icon: '⚗', desc: '伝説の霊薬。HPが全回復する。', price: 5000, sell: 800 },
    ore: { name: '星鉄鉱', cat: 'mat', rar: 2, icon: '💎', desc: '星の力を宿した鉱石。高値で売れる。', sell: 120 },
    slime: { name: 'スライムの液', cat: 'mat', rar: 1, icon: '💧', desc: 'スライムから採れるぷるぷるの液。', sell: 12 },
    fang: { name: '獣の牙', cat: 'mat', rar: 1, icon: '🦷', desc: '鋭い獣の牙。', sell: 18 },
    mask: { name: '仮面の欠片', cat: 'mat', rar: 1, icon: '🎭', desc: 'ボガード族の仮面の欠片。', sell: 20 },
    shell: { name: '硬い甲殻', cat: 'mat', rar: 2, icon: '🐚', desc: 'サソリの甲殻。', sell: 40 },
    core: { name: '魔力の核', cat: 'mat', rar: 3, icon: '🔮', desc: '魔物の体内にある魔力の結晶。', sell: 150 },
    shard: { name: '星の欠片', cat: 'key', rar: 5, icon: '⭐', desc: '迷宮の主が守っていた星の欠片。五つ集めると星見山の頂への道が開く。' }
  };
  D.REGION_FOOD = ['sweetflower', 'mushroom', 'cactusfruit', 'snowflower', 'firefruit'];
  // ---------------- 敵 ----------------
  const E = (o) => Object.assign({ hpK: 1, atkK: 1, defK: 1, speed: 3, aggro: 14, keep: 0, el: 'phys', weak: null, exp: 1, drops: [], scale: 1, radius: 0.5 }, o);
  D.ENEMIES = {
    slime_wind: E({ name: '風スライム', model: ['slime', { color: '#7fe8c8', kind: 'wind', top: '#7fd06a' }], hpK: 0.8, atkK: 0.85, speed: 2.6, el: 'wind', weak: 'fire', drops: [['slime', 0.6]], atk: [{ kind: 'jump', windup: 0.55, r: 2.2, mult: 1.0, range: 3.2, cd: 2.4 }] }),
    slime_water: E({ name: '水スライム', model: ['slime', { color: '#5fb4ff', kind: 'water', top: '#a8e0ff' }], hpK: 0.85, atkK: 0.85, speed: 2.4, el: 'water', weak: 'thunder', drops: [['slime', 0.6]], atk: [{ kind: 'jump', windup: 0.55, r: 2.2, mult: 1.0, range: 3.2, cd: 2.4 }] }),
    slime_fire: E({ name: '炎スライム', model: ['slime', { color: '#ff8a4a', kind: 'fire', e: 0.25 }], hpK: 0.85, atkK: 0.95, speed: 2.6, el: 'fire', weak: 'water', drops: [['slime', 0.6]], atk: [{ kind: 'jump', windup: 0.55, r: 2.4, mult: 1.0, range: 3.2, cd: 2.4, status: 'burn' }] }),
    slime_ice: E({ name: '氷スライム', model: ['slime', { color: '#a8e8ff', kind: 'ice', e: 0.1 }], hpK: 0.9, atkK: 0.9, speed: 2.4, el: 'ice', weak: 'fire', drops: [['slime', 0.6]], atk: [{ kind: 'jump', windup: 0.55, r: 2.4, mult: 1.0, range: 3.2, cd: 2.4, status: 'slow' }] }),
    slime_thunder: E({ name: '雷スライム', model: ['slime', { color: '#b88cff', kind: 'thunder', e: 0.15 }], hpK: 0.85, atkK: 1.0, speed: 2.8, el: 'thunder', weak: 'earth', drops: [['slime', 0.6]], atk: [{ kind: 'jump', windup: 0.5, r: 2.4, mult: 1.0, range: 3.2, cd: 2.2 }] }),
    boar: E({ name: 'イノシシ', model: ['quad', { h: 0.55, L: 1.1, w: 0.22, bodyR: [0.38, 0.36, 0.62], headR: [0.24, 0.24, 0.28], neckY: 0.05, neckRise: 0.02, neckLen: 0.15, neckR: 0.22, snout: 0.12, legR: 0.08, tailLen: 0.12, tailRise: 0.02, tailR: 0.04, eyeS: 0.8, ears: 0.1, tusks: true, color: '#7a5236', dark: '#4e3322', belly: '#a07a5a', eye: '#1a1010' }], hpK: 1.1, atkK: 1.0, speed: 4.2, passive: true, drops: [['meat', 1], ['fang', 0.4]], radius: 0.6, atk: [{ kind: 'charge', windup: 0.6, dist: 10, w: 1.4, mult: 1.3, range: 12, cd: 4, anim: 'charge' }] }),
    wolf: E({ name: '森オオカミ', model: ['quad', { h: 0.62, L: 1.0, w: 0.18, bodyR: [0.26, 0.28, 0.58], headR: [0.17, 0.17, 0.2], neckY: 0.12, neckRise: 0.12, neckLen: 0.2, neckR: 0.13, snout: 0.16, legR: 0.06, tailLen: 0.22, tailRise: 0.05, tailR: 0.08, eyeS: 0.8, ears: 0.14, color: '#6f7480', dark: '#4a4e58', belly: '#c8ccd2', eye: '#ffd23a' }], speed: 5.4, atkK: 0.95, aggro: 18, drops: [['fang', 0.7]], radius: 0.5, atk: [{ kind: 'melee', windup: 0.38, r: 2.2, ang: 1.4, mult: 0.95, cd: 1.5, anim: 'bite' }, { kind: 'charge', windup: 0.5, dist: 8, w: 1.2, mult: 1.15, range: 9, cd: 5, anim: 'charge' }] }),
    goblin: E({ name: 'ボガード', model: ['human', { mask: '#e8dcc0', skin: '#7a5a48', main: '#6a4a32', sub: '#8a6a48', pants: '#4a3a2a', boots: '#3a2a20', accent: '#c8402a', noHair: true, weapon: { type: 'club' }, eyeGlow: '#ffd23a' }, 0.9], hpK: 1.0, speed: 3.2, drops: [['mask', 0.6]], atk: [{ kind: 'melee', windup: 0.5, r: 2.5, ang: 1.6, mult: 1.0, cd: 1.8, anim: 'club' }, { kind: 'jump', windup: 0.7, r: 2.6, mult: 1.4, range: 7, cd: 6, anim: 'slam' }] }),
    goblin_archer: E({ name: 'ボガード射手', model: ['human', { mask: '#e8dcc0', skin: '#7a5a48', main: '#5a6a3a', sub: '#8a6a48', pants: '#4a3a2a', boots: '#3a2a20', accent: '#3a8a4a', noHair: true, weapon: { type: 'bow' }, eyeGlow: '#7aff7a' }, 0.88], hpK: 0.75, speed: 3.0, keep: 11, aggro: 20, drops: [['mask', 0.5]], atk: [{ kind: 'proj', windup: 0.8, speed: 24, mult: 0.9, range: 22, cd: 2.6, anim: 'bow', look: 'arrow' }] }),
    goblin_chief: E({ name: 'ボガード族長', elite: true, model: ['human', { mask: '#f0e0b0', skin: '#6a4a38', main: '#8a2a2a', sub: '#c8a060', pants: '#3a2a2a', boots: '#2a1a14', accent: '#f0c040', noHair: true, horns: '#e8e0d0', weapon: { type: 'club' }, eyeGlow: '#ff5a3a', cape: '#6a1a1a' }, 1.6], hpK: 5, atkK: 1.4, defK: 1.3, speed: 3.0, exp: 6, drops: [['core', 1], ['mask', 1]], radius: 0.9, atk: [{ kind: 'melee', windup: 0.7, r: 3.8, ang: 2.0, mult: 1.4, cd: 2.0, anim: 'club', tele: true }, { kind: 'jump', windup: 0.9, r: 5, mult: 2.0, range: 12, cd: 6, anim: 'slam', tele: true }, { kind: 'circle', windup: 1.0, r: 5, mult: 1.6, cd: 7, anim: 'spin', tele: true }] }),
    mushroom: E({ name: '毒キノコ', model: ['mushroom', { cap: '#c83a5a', dots: '#fff0e0' }], hpK: 0.9, speed: 2.0, el: 'earth', weak: 'fire', drops: [['mushroom', 0.5]], atk: [{ kind: 'circle', windup: 0.9, r: 3.6, mult: 0.9, cd: 4, status: 'poison', tele: true, anim: 'atk' }] }),
    treant: E({ name: '樹人', model: ['treant', {}, 1.5], hpK: 2.2, atkK: 1.3, defK: 1.3, speed: 1.9, el: 'earth', weak: 'fire', exp: 2, drops: [['core', 0.3]], radius: 0.8, atk: [{ kind: 'melee', windup: 0.9, r: 3.4, ang: 2.0, mult: 1.6, cd: 2.8, anim: 'slam', tele: true }, { kind: 'line', windup: 1.0, len: 13, w: 1.6, mult: 1.5, range: 12, cd: 7, tele: true, anim: 'slam' }] }),
    treant_elder: E({ name: '古き樹人', elite: true, model: ['treant', { flowers: '#ff9ec4', leaf: '#3f7a3a' }, 2.4], hpK: 6, atkK: 1.4, defK: 1.4, speed: 1.8, el: 'earth', weak: 'fire', exp: 6, drops: [['core', 1]], radius: 1.2, atk: [{ kind: 'melee', windup: 0.9, r: 5, ang: 2.2, mult: 1.6, cd: 2.6, anim: 'slam', tele: true }, { kind: 'line', windup: 1.0, len: 16, w: 2, mult: 1.6, range: 15, cd: 6, tele: true, anim: 'slam', fan: 3 }] }),
    scorpion: E({ name: 'サバクサソリ', model: ['scorp', { color: '#c89a5a', dark: '#8a6a3a', glow: '#b05cff' }], hpK: 1.2, defK: 1.4, speed: 4.0, el: 'earth', weak: 'water', drops: [['shell', 0.6]], radius: 0.7, atk: [{ kind: 'melee', windup: 0.5, r: 2.6, ang: 1.6, mult: 1.0, cd: 1.8, anim: 'claw' }, { kind: 'melee', windup: 0.8, r: 3.2, ang: 0.9, mult: 1.5, cd: 4, status: 'poison', anim: 'sting', tele: true }] }),
    giant_scorpion: E({ name: '大砂蠍', elite: true, model: ['scorp', { color: '#a87a4a', dark: '#5a3a22', glow: '#ff5ac8' }, 2.0], hpK: 6, atkK: 1.4, defK: 1.6, speed: 3.6, exp: 6, drops: [['shell', 1], ['core', 1]], radius: 1.3, atk: [{ kind: 'melee', windup: 0.6, r: 4.5, ang: 1.8, mult: 1.3, cd: 2, anim: 'claw', tele: true }, { kind: 'line', windup: 0.9, len: 9, w: 2, mult: 2, cd: 5, status: 'poison', anim: 'sting', tele: true }, { kind: 'charge', windup: 0.8, dist: 14, w: 2.6, mult: 1.6, range: 15, cd: 7, anim: 'claw', tele: true }] }),
    sand_mage: E({ name: '砂の魔導士', model: ['human', { mask: '#e8c890', skin: '#8a6a48', main: '#c89a5a', sub: '#e8d8b0', pants: '#6a4a2a', boots: '#4a3a20', accent: '#3a8fbf', noHair: true, weapon: { type: 'staff', glow: '#ffd27a' }, eyeGlow: '#7fd0ff', hat: 'wizard' }, 0.95], hpK: 0.8, speed: 2.8, keep: 10, aggro: 20, el: 'earth', weak: 'water', drops: [['core', 0.25]], atk: [{ kind: 'proj', windup: 0.7, speed: 18, mult: 1.0, range: 20, cd: 2.4, anim: 'staff', look: 'sand' }, { kind: 'aoe', windup: 1.2, r: 3.5, mult: 1.4, range: 18, cd: 6, tele: true, anim: 'staff' }] }),
    ice_wolf: E({ name: '氷狼', model: ['quad', { h: 0.65, L: 1.05, w: 0.18, bodyR: [0.27, 0.29, 0.6], headR: [0.17, 0.17, 0.2], neckY: 0.12, neckRise: 0.12, neckLen: 0.2, neckR: 0.13, snout: 0.16, legR: 0.06, tailLen: 0.22, tailRise: 0.05, tailR: 0.08, eyeS: 0.8, ears: 0.14, color: '#e8f0f8', dark: '#a8c8e0', belly: '#ffffff', eye: '#7fe8ff', tailTip: '#9fe6ff', spikes: '#bff0ff', spikeS: 0.8, spikeE: 0.5 }], speed: 5.6, el: 'ice', weak: 'fire', aggro: 18, drops: [['fang', 0.7]], radius: 0.5, atk: [{ kind: 'melee', windup: 0.38, r: 2.2, ang: 1.4, mult: 1.0, cd: 1.5, anim: 'bite', status: 'slow' }, { kind: 'charge', windup: 0.5, dist: 8, w: 1.2, mult: 1.1, range: 9, cd: 5, anim: 'charge' }] }),
    frost_archer: E({ name: '氷原の弓兵', model: ['human', { mask: '#dce8f0', skin: '#8a9aaa', main: '#e8f0f8', sub: '#7fb8e8', pants: '#3a4a5a', boots: '#e8eef4', accent: '#9fe6ff', accentE: 0.5, noHair: true, cape: '#c8dceb', weapon: { type: 'bow', blade: '#9fe6ff', e: 0.7 }, eyeGlow: '#7fe8ff' }, 0.95], hpK: 0.8, speed: 3.0, keep: 13, aggro: 24, el: 'ice', weak: 'fire', drops: [['core', 0.2]], atk: [{ kind: 'proj', windup: 0.85, speed: 26, mult: 1.0, range: 26, cd: 2.8, anim: 'bow', look: 'icearrow', status: 'freeze' }] }),
    ice_golem: E({ name: '氷のゴーレム', model: ['golem', { rock: '#a8c8dc', dark: '#7a9ab0', glow: '#9fe6ff' }, 1.35], hpK: 2.5, atkK: 1.3, defK: 1.6, speed: 1.9, el: 'ice', weak: 'fire', exp: 2, drops: [['core', 0.4], ['ore', 0.4]], radius: 0.9, atk: [{ kind: 'melee', windup: 0.9, r: 3.6, ang: 2.0, mult: 1.6, cd: 2.6, anim: 'slam', tele: true, status: 'slow' }, { kind: 'circle', windup: 1.1, r: 5.5, mult: 1.4, cd: 7, tele: true, anim: 'slam', status: 'freeze' }] }),
    ice_golem_elite: E({ name: '永久氷の巨兵', elite: true, model: ['golem', { rock: '#c8e8f8', dark: '#8ab0c8', glow: '#bff6ff' }, 2.3], hpK: 6.5, atkK: 1.5, defK: 1.8, speed: 1.8, el: 'ice', weak: 'fire', exp: 6, drops: [['core', 1], ['ore', 1]], radius: 1.4, atk: [{ kind: 'melee', windup: 0.9, r: 5, ang: 2.0, mult: 1.6, cd: 2.4, anim: 'slam', tele: true, status: 'slow' }, { kind: 'circle', windup: 1.1, r: 8, mult: 1.6, cd: 6, tele: true, anim: 'slam', status: 'freeze' }, { kind: 'aoe', windup: 1.2, r: 3.5, mult: 1.5, range: 20, cd: 5, tele: true, count: 3, anim: 'slam' }] }),
    fire_spirit: E({ name: '炎の精霊', model: ['spirit', { glow: '#ffd27a', shell: '#ff6a2a', shellE: 0.8 }], hpK: 0.9, speed: 3.2, keep: 8, aggro: 20, el: 'fire', weak: 'water', fly: true, drops: [['core', 0.3]], atk: [{ kind: 'proj', windup: 0.7, speed: 18, mult: 1.0, range: 20, cd: 2.2, look: 'fireball', status: 'burn', count: 2, spread: 0.25 }] }),
    lava_golem: E({ name: '溶岩ゴーレム', model: ['golem', { rock: '#4a3a36', dark: '#2a2220', glow: '#ff6a2a' }, 1.35], hpK: 2.6, atkK: 1.35, defK: 1.6, speed: 1.9, el: 'fire', weak: 'water', exp: 2, drops: [['core', 0.4], ['ore', 0.4]], radius: 0.9, atk: [{ kind: 'melee', windup: 0.9, r: 3.6, ang: 2.0, mult: 1.6, cd: 2.6, anim: 'slam', tele: true, status: 'burn' }, { kind: 'aoe', windup: 1.2, r: 4, mult: 1.5, range: 16, cd: 6, tele: true, anim: 'slam', status: 'burn' }] }),
    lava_golem_elite: E({ name: '灼熱の巨兵', elite: true, model: ['golem', { rock: '#3a2e2a', dark: '#1e1816', glow: '#ff4a1a' }, 2.3], hpK: 7, atkK: 1.5, defK: 1.8, speed: 1.8, el: 'fire', weak: 'water', exp: 6, drops: [['core', 1], ['ore', 1]], radius: 1.4, atk: [{ kind: 'melee', windup: 0.9, r: 5, ang: 2.0, mult: 1.7, cd: 2.4, anim: 'slam', tele: true, status: 'burn' }, { kind: 'aoe', windup: 1.2, r: 4, mult: 1.6, range: 22, cd: 4.5, tele: true, count: 4, anim: 'slam', status: 'burn' }, { kind: 'ring', windup: 1.0, r: 14, mult: 1.6, cd: 8, anim: 'slam' }] }),
    fire_wolf: E({ name: '炎狼', model: ['quad', { h: 0.65, L: 1.05, w: 0.18, bodyR: [0.27, 0.29, 0.6], headR: [0.17, 0.17, 0.2], neckY: 0.12, neckRise: 0.12, neckLen: 0.2, neckR: 0.13, snout: 0.16, legR: 0.06, tailLen: 0.22, tailRise: 0.05, tailR: 0.08, eyeS: 0.8, ears: 0.14, color: '#3a2a2a', dark: '#2a1a1a', belly: '#5a3a2a', eye: '#ffb03a', tailTip: '#ff7a2a', spikes: '#ff7a2a', spikeS: 0.8, spikeE: 1 }], speed: 5.8, el: 'fire', weak: 'water', aggro: 18, drops: [['fang', 0.7]], radius: 0.5, atk: [{ kind: 'melee', windup: 0.36, r: 2.3, ang: 1.4, mult: 1.0, cd: 1.4, anim: 'bite', status: 'burn' }, { kind: 'charge', windup: 0.5, dist: 9, w: 1.2, mult: 1.2, range: 10, cd: 5, anim: 'charge' }] }),
    skeleton: E({ name: 'スケルトン騎士', model: ['human', { bony: true, main: '#d8d0bc', knightHelm: '#6a6e78', plume: '#4a4a5a', weapon: { type: 'sword', blade: '#a8aeb8', glow: '#6fe0ff' }, offhand: { type: 'shield' }, eyeGlow: '#6fe0ff', noHair: true }, 1.0], hpK: 1.2, defK: 1.4, speed: 3.0, el: 'dark', weak: 'light', drops: [['core', 0.25]], atk: [{ kind: 'melee', windup: 0.55, r: 2.6, ang: 1.6, mult: 1.1, cd: 1.8, anim: 'atk' }, { kind: 'charge', windup: 0.7, dist: 7, w: 1.4, mult: 1.3, range: 8, cd: 5, anim: 'atk' }] }),
    wraith: E({ name: '亡霊', model: ['spirit', { glow: '#d8b0ff', shell: '#6a3a9a', shellE: 0.5 }], hpK: 0.9, speed: 3.4, keep: 7, aggro: 22, el: 'dark', weak: 'light', fly: true, drops: [['core', 0.3]], atk: [{ kind: 'proj', windup: 0.7, speed: 16, mult: 1.0, range: 18, cd: 2.4, look: 'dark', count: 3, spread: 0.3 }, { kind: 'aoe', windup: 1.1, r: 3.2, mult: 1.3, range: 16, cd: 6, tele: true }] }),
    // ---------------- ボス ----------------
    galeKnight: E({ name: '暴風の守護者 ゲイルナイト', boss: true, model: ['human', { gender: 'm', armor: '#5a8a8a', accent: '#5ff0c8', accentE: 0.8, knightHelm: '#4a7a7a', plume: '#5ff0c8', main: '#3a5a5a', sub: '#c8d8d8', pants: '#2a3a3a', boots: '#3a4a4a', cape: '#2a6a6a', capeLong: true, weapon: { type: 'greatsword', glow: '#5ff0c8', blade: '#d8f0f0' }, eyeGlow: '#7fffe0' }, 2.2], hpK: 14, atkK: 1.5, defK: 1.5, speed: 4.2, el: 'wind', weak: 'fire', exp: 30, radius: 1.0,
      atk: [{ kind: 'melee', windup: 0.75, r: 5, ang: 2.4, mult: 1.4, cd: 1.8, anim: 'atk', tele: true }, { kind: 'charge', windup: 0.9, dist: 18, w: 2.6, mult: 1.8, range: 20, cd: 5, anim: 'atk', tele: true }, { kind: 'aoe', windup: 1.2, r: 4, mult: 1.5, range: 30, cd: 7, tele: true, count: 3, look: 'tornado', anim: 'cast' }, { kind: 'circle', windup: 1.1, r: 6.5, mult: 2.0, cd: 8, tele: true, anim: 'spin' }, { kind: 'proj', windup: 0.8, speed: 20, mult: 1.0, range: 30, cd: 6, count: 5, spread: 0.9, look: 'blade', phase2: true, anim: 'atk' }] }),
    elderTreant: E({ name: '大樹の主 エルダートレント', boss: true, model: ['treant', { flowers: '#ffd23a', leaf: '#2f6a33', leaf2: '#7ab84c', glow: '#ffef7a' }, 3.4], hpK: 15, atkK: 1.5, defK: 1.6, speed: 1.6, el: 'earth', weak: 'fire', exp: 30, radius: 1.8,
      atk: [{ kind: 'melee', windup: 1.0, r: 7, ang: 2.4, mult: 1.6, cd: 2.4, anim: 'slam', tele: true }, { kind: 'line', windup: 1.1, len: 22, w: 2.4, mult: 1.6, cd: 5, tele: true, fan: 3, anim: 'slam' }, { kind: 'proj', windup: 0.9, speed: 16, mult: 1.0, range: 30, cd: 6, count: 10, spread: 6.28, look: 'seed', anim: 'cast' }, { kind: 'summon', windup: 1.0, cd: 15, what: 'mushroom', n: 2, anim: 'cast' }, { kind: 'aoe', windup: 1.3, r: 3.5, mult: 1.5, range: 30, cd: 7, tele: true, count: 5, phase2: true, anim: 'slam', status: 'poison' }] }),
    scorpius: E({ name: '砂王スコルピオス', boss: true, model: ['scorp', { color: '#d8a84a', dark: '#6a4a1a', glow: '#ff3ac8' }, 3.2], hpK: 15, atkK: 1.5, defK: 1.7, speed: 3.8, el: 'earth', weak: 'water', exp: 30, radius: 2.0,
      atk: [{ kind: 'melee', windup: 0.7, r: 6.5, ang: 1.9, mult: 1.4, cd: 1.8, anim: 'claw', tele: true }, { kind: 'line', windup: 0.9, len: 12, w: 2.6, mult: 2.1, cd: 4.5, status: 'poison', anim: 'sting', tele: true }, { kind: 'charge', windup: 0.9, dist: 22, w: 3.6, mult: 1.8, range: 24, cd: 6, anim: 'claw', tele: true }, { kind: 'ring', windup: 1.0, r: 16, mult: 1.6, cd: 8, anim: 'sting' }, { kind: 'aoe', windup: 1.2, r: 4, mult: 1.5, range: 30, cd: 6, tele: true, count: 6, phase2: true, look: 'sand', anim: 'sting' }] }),
    glacies: E({ name: '氷姫グラキエス', boss: true, model: ['human', { gender: 'f', gown: true, main: '#bfe6ff', sub: '#ffffff', accent: '#9fe6ff', accentE: 0.8, hair: '#e8f4ff', eye: '#7fe8ff', skin: '#f4f8ff', crown: '#bff6ff', weapon: { type: 'staff', glow: '#bff6ff', blade: '#7fb8e8' }, cape: '#9fd0f0', capeLong: true }, 1.9], hpK: 14, atkK: 1.5, defK: 1.5, speed: 3.6, keep: 9, el: 'ice', weak: 'fire', exp: 30, radius: 0.9, float: true,
      atk: [{ kind: 'proj', windup: 0.7, speed: 30, mult: 1.1, range: 34, cd: 2.2, count: 3, spread: 0.3, look: 'lance', status: 'slow', anim: 'cast' }, { kind: 'aoe', windup: 1.2, r: 3.5, mult: 1.5, range: 34, cd: 5, tele: true, count: 5, look: 'icespike', anim: 'cast' }, { kind: 'circle', windup: 1.3, r: 8, mult: 1.6, cd: 9, tele: true, status: 'freeze', anim: 'cast' }, { kind: 'summon', windup: 1.0, cd: 16, what: 'slime_ice', n: 3, anim: 'cast' }, { kind: 'aoe', windup: 1.5, r: 9, mult: 1.2, range: 30, cd: 10, tele: true, count: 1, ticks: 4, phase2: true, status: 'slow', anim: 'cast' }] }),
    ignis: E({ name: '炎竜イグニス', boss: true, model: ['quad', { h: 1.3, L: 2.2, w: 0.42, bodyR: [0.62, 0.62, 1.2], headR: [0.36, 0.32, 0.46], neckY: 0.3, neckRise: 0.65, neckLen: 0.6, neckR: 0.26, snout: 0.35, legR: 0.18, tailLen: 0.8, tailRise: -0.05, tailR: 0.3, eyeS: 1.6, horns: 0.5, hornS: 1.6, hornC: '#2a1a1a', color: '#8a2a1e', dark: '#4a1410', belly: '#ff8a3a', eye: '#ffe03a', tailTip: '#ff6a2a', spikes: '#2a1a1a', spikeS: 2.4, wings: 2.6, wingC: '#a8382a' }, 2.6], hpK: 16, atkK: 1.55, defK: 1.7, speed: 3.6, el: 'fire', weak: 'water', exp: 30, radius: 2.4,
      atk: [{ kind: 'melee', windup: 0.8, r: 7, ang: 1.6, mult: 1.5, cd: 2.0, anim: 'bite', tele: true }, { kind: 'cone', windup: 1.0, r: 15, ang: 0.8, mult: 0.7, ticks: 6, cd: 7, tele: true, status: 'burn', anim: 'breath' }, { kind: 'circle', windup: 1.0, r: 8, mult: 1.7, cd: 6, tele: true, anim: 'tail' }, { kind: 'aoe', windup: 1.3, r: 4.5, mult: 1.6, range: 35, cd: 8, tele: true, count: 7, look: 'meteor', status: 'burn', anim: 'roar' }, { kind: 'jump', windup: 1.4, r: 8, mult: 2.2, range: 30, cd: 9, tele: true, anim: 'roar', phase2: true }] }),
    nemesis: E({ name: '虚無の魔王 ネメシス', boss: true, model: ['human', { gender: 'm', armor: '#2a2236', accent: '#b04dff', accentE: 0.9, knightHelm: '#1e1828', plume: '#b04dff', main: '#1e1828', sub: '#4a3a5a', pants: '#14101c', boots: '#2a2236', horns: '#b04dff', wings: '#3a2a52', wingTip: '#b04dff', wingE: 0.4, cape: '#2a1a3a', capeLong: true, weapon: { type: 'scythe' }, eyeGlow: '#ff4ad8' }, 2.6], hpK: 20, atkK: 1.6, defK: 1.8, speed: 4.4, el: 'dark', weak: 'light', exp: 50, radius: 1.2,
      atk: [{ kind: 'melee', windup: 0.8, r: 7, ang: 3.0, mult: 1.6, cd: 1.8, anim: 'atk', tele: true }, { kind: 'proj', windup: 0.8, speed: 15, mult: 1.0, range: 40, cd: 4, count: 6, spread: 1.6, look: 'dark', homing: true, anim: 'cast' }, { kind: 'jump', windup: 1.0, r: 6, mult: 2.0, range: 40, cd: 6, tele: true, anim: 'slam' }, { kind: 'ring', windup: 1.0, r: 18, mult: 1.6, cd: 8, anim: 'cast' }, { kind: 'aoe', windup: 1.3, r: 4.5, mult: 1.6, range: 40, cd: 6, tele: true, count: 8, look: 'meteor', phase2: true, anim: 'cast' }, { kind: 'summon', windup: 1.0, cd: 18, what: 'wraith', n: 3, phase2: true, anim: 'cast' }] })
  };
  D.SPAWNS = [
    [['slime_wind', 'slime_wind', 'slime_water'], ['slime_water', 'slime_water'], ['boar', 'boar', 'boar'], ['goblin', 'goblin'], ['goblin', 'goblin_archer'], ['slime_wind', 'slime_fire'], ['boar', 'boar']],
    [['mushroom', 'mushroom', 'slime_thunder'], ['wolf', 'wolf', 'wolf'], ['treant'], ['goblin', 'goblin', 'goblin_archer'], ['boar', 'boar'], ['slime_thunder', 'slime_water']],
    [['scorpion', 'scorpion'], ['sand_mage', 'goblin', 'goblin'], ['slime_fire', 'slime_fire'], ['scorpion', 'sand_mage']],
    [['ice_wolf', 'ice_wolf', 'ice_wolf'], ['frost_archer', 'frost_archer'], ['slime_ice', 'slime_ice', 'frost_archer'], ['ice_golem']],
    [['fire_spirit', 'fire_spirit'], ['lava_golem'], ['fire_wolf', 'fire_wolf'], ['slime_fire', 'fire_spirit', 'slime_fire']]
  ];
  D.CAMPS = [['goblin', 'goblin', 'goblin_archer', 'goblin'], ['goblin', 'goblin_archer', 'wolf', 'goblin'], ['sand_mage', 'goblin', 'goblin', 'sand_mage'], ['frost_archer', 'frost_archer', 'ice_wolf', 'goblin'], ['fire_spirit', 'goblin', 'lava_golem', 'goblin']];
  D.ELITES = ['goblin_chief', 'treant_elder', 'giant_scorpion', 'ice_golem_elite', 'lava_golem_elite'];
  D.DUNGEON_MOBS = {
    wind: ['slime_wind', 'goblin', 'goblin_archer', 'skeleton', 'slime_water'], forest: ['mushroom', 'treant', 'wolf', 'skeleton', 'slime_thunder'],
    sand: ['scorpion', 'sand_mage', 'skeleton', 'wraith'], ice: ['frost_archer', 'ice_wolf', 'slime_ice', 'ice_golem', 'wraith'], lava: ['fire_spirit', 'lava_golem', 'fire_wolf', 'wraith', 'skeleton']
  };
  D.enemyStats = (key, lv) => {
    const e = D.ENEMIES[key];
    return { hp: Math.round(e.hpK * (1400 + 2000 * (lv - 1))), atk: Math.round(e.atkK * (180 + 150 * (lv - 1))), def: Math.round(e.defK * (150 + 200 * (lv - 1))) };
  };
  // ---------------- NPC / クエスト ----------------
  D.NPCS = [
    { id: 'marc', v: 0, name: '長老マルク', role: 'chief', dx: -4, dz: 6, look: { gender: 'm', main: '#6a5a8a', sub: '#e8e0d0', hair: '#d8d8d8', accent: '#e0c06a', cape: '#4a3a6a', capeLong: true }, emote: 'think' },
    { id: 'lina', v: 0, name: '商人リナ', role: 'shop', shop: ['sweetflower', 'roast', 'potion', 's_iron', 'a_steel', 't_oak'], look: { gender: 'f', main: '#d8505a', sub: '#f2e8d8', hair: '#c87a3a', accent: '#f2c94a' } },
    { id: 'tom', v: 0, name: '狩人トム', role: 'quest', quest: 'sq_boar', dx: 20, dz: -8, look: { gender: 'm', main: '#5a7a3a', sub: '#c8b890', hair: '#6a4a2a', accent: '#a07a4a' } },
    { id: 'mia', v: 0, name: '少女ミア', role: 'quest', quest: 'sq_flower', dx: -14, dz: -14, look: { gender: 'f', main: '#ff9ec4', sub: '#ffffff', hair: '#f2c94a', accent: '#ff6a9a' }, emote: 'wave' },
    { id: 'gord', v: 0, name: '衛兵ゴルド', role: 'talk', dx: 26, dz: 12, look: { gender: 'm', main: '#5a6a8a', sub: '#c8ccd8', hair: '#3a2a22', accent: '#d8b45a', helmet: '#8a8e98' }, lines: ['西の「風の古塔」から魔物があふれ出してきている。', '迷宮の奥には主がいて、星の欠片を守っているらしい。気をつけてな。'] },
    { id: 'elm', v: 1, name: '森の長エルム', role: 'talk', dx: -4, dz: 6, look: { gender: 'f', main: '#3a6a3a', sub: '#e8f0d8', hair: '#8ad06a', accent: '#c8ff7a', cape: '#2a5a2a' }, lines: ['ようこそ、モリノハ集落へ。森は今、ざわめいています。', '東にある「深緑の迷宮」……大樹の主が目覚めてしまったのです。'] },
    { id: 'shop1', v: 1, name: '道具屋フォレン', role: 'shop', shop: ['mushroom', 'roast', 'potion', 's_forest', 'a_great', 't_forest'], look: { gender: 'm', main: '#7a5a3a', sub: '#d8c8a8', hair: '#4a3a2a', accent: '#8ad06a' } },
    { id: 'q1', v: 1, name: '狩人アルバ', role: 'quest', quest: 'sq_wolf', dx: 18, dz: -10, look: { gender: 'f', main: '#4a5a3a', sub: '#a8b890', hair: '#2a2a2a', accent: '#a0c070' } },
    { id: 'saha', v: 2, name: '太守サハラ', role: 'talk', dx: -4, dz: 6, look: { gender: 'f', main: '#e8d8b0', sub: '#3f8fbf', hair: '#2a1a12', accent: '#f2c94a', skin: '#c89a74' }, lines: ['オアシス都市サンドリアへようこそ。', '西の「砂塵の地下墓所」では砂王が暴れていると聞きます。'] },
    { id: 'shop2', v: 2, name: '交易商ジャミル', role: 'shop', shop: ['cactusfruit', 'roast', 'potion', 'elixir', 's_sand', 'a_sand', 't_sun'], look: { gender: 'm', main: '#3f8fbf', sub: '#f2e8d0', hair: '#1a1a1a', accent: '#f2c94a', skin: '#b88a64' } },
    { id: 'q2', v: 2, name: '警備兵カシム', role: 'quest', quest: 'sq_scorp', dx: 18, dz: -10, look: { gender: 'm', main: '#c89a5a', sub: '#e8d8b0', hair: '#1a1a1a', accent: '#8a6a3a', skin: '#b88a64' } },
    { id: 'yuki', v: 3, name: '里長ユキノ', role: 'talk', dx: -4, dz: 6, look: { gender: 'f', main: '#e8f0f8', sub: '#7fb8e8', hair: '#f4f8ff', accent: '#9fe6ff', cape: '#c8dceb' }, lines: ['寒かったでしょう。ここは雪の里フロストヘイムです。', '北の「氷晶の神殿」……氷姫グラキエスの吹雪が、里を凍えさせているのです。'] },
    { id: 'shop3', v: 3, name: '毛皮商ボリス', role: 'shop', shop: ['snowflower', 'roast', 'potion', 'elixir'], look: { gender: 'm', main: '#8a6a4a', sub: '#e8e0d0', hair: '#c8a87a', accent: '#c8dceb' } },
    { id: 'q3', v: 3, name: '弓職人ニーナ', role: 'quest', quest: 'sq_frost', dx: 18, dz: -10, look: { gender: 'f', main: '#7fb8e8', sub: '#ffffff', hair: '#6a4a3a', accent: '#9fe6ff' } },
    { id: 'gar', v: 4, name: '隊長ガルド', role: 'talk', dx: -4, dz: 6, look: { gender: 'm', main: '#5a4a44', sub: '#c8402a', hair: '#2a1a14', accent: '#ff7a3a', helmet: '#4a4040' }, lines: ['ここは火山の前線基地だ。並の者では生き残れんぞ。', '火山の北にある「灼熱の溶岩窟」に炎竜イグニスが棲みついた。'] },
    { id: 'shop4', v: 4, name: '鍛冶師ヴァルカ', role: 'shop', shop: ['firefruit', 'potion', 'elixir'], look: { gender: 'f', main: '#3a2a2a', sub: '#ff7a3a', hair: '#c8402a', accent: '#ffb03a' } },
    { id: 'q4', v: 4, name: '観測員ルカ', role: 'quest', quest: 'sq_spirit', dx: 18, dz: -10, look: { gender: 'm', main: '#5a5a6a', sub: '#e8e0d0', hair: '#3a3a4a', accent: '#ffb03a' } }
  ];
  D.QUESTS = {
    mq1: { main: true, title: '異世界への到着', desc: '天界の導き手に送り出され、異世界ステラリアに降り立った。近くのスターリーフ村を訪ね、長老に話を聞こう。', obj: [{ type: 'talk', npc: 'marc', text: 'スターリーフ村の長老マルクと話す' }], reward: { coins: 500, exp: 100 }, next: 'mq2' },
    mq2: { main: true, title: '五つの迷宮', desc: '島の五つの地方には迷宮があり、その奥で迷宮の主が「星の欠片」を守っている。迷宮を攻略し、星の欠片を五つ集めよう。', obj: [{ type: 'dungeon', id: 0, text: '風の古塔を攻略する（推奨Lv.8）' }, { type: 'dungeon', id: 1, text: '深緑の迷宮を攻略する（推奨Lv.18）' }, { type: 'dungeon', id: 2, text: '砂塵の地下墓所を攻略する（推奨Lv.28）' }, { type: 'dungeon', id: 3, text: '氷晶の神殿を攻略する（推奨Lv.38）' }, { type: 'dungeon', id: 4, text: '灼熱の溶岩窟を攻略する（推奨Lv.50）' }], reward: { coins: 20000, exp: 5000 }, next: 'mq3' },
    mq3: { main: true, title: '星見山の頂へ', desc: '五つの星の欠片が共鳴している。島の北東にそびえる星見山の頂へ向かい、すべての元凶を討とう。', obj: [{ type: 'boss', id: 'nemesis', text: '星見山の頂で虚無の魔王を倒す（推奨Lv.58）' }], reward: { coins: 100000, exp: 0, weapon: 'tier5' }, next: null },
    sq_boar: { title: 'イノシシ狩り', giver: 'tom', desc: '畑を荒らすイノシシを狩ってほしいと頼まれた。', obj: [{ type: 'kill', what: 'boar', n: 5, text: 'イノシシを倒す' }], reward: { coins: 800, exp: 150, items: [['roast', 2]] } },
    sq_flower: { title: 'お母さんへの花束', giver: 'mia', desc: 'ミアはお母さんにスイートフラワーの花束を贈りたいらしい。', obj: [{ type: 'collect', what: 'sweetflower', n: 5, text: 'スイートフラワーを渡す' }], reward: { coins: 500, exp: 120, items: [['potion', 1]] } },
    sq_wolf: { title: '森オオカミの脅威', giver: 'q1', desc: '集落を狙う森オオカミを退治してほしい。', obj: [{ type: 'kill', what: 'wolf', n: 6, text: '森オオカミを倒す' }], reward: { coins: 3000, exp: 1200, items: [['potion', 2]] } },
    sq_scorp: { title: 'サソリ駆除', giver: 'q2', desc: '交易路に現れるサバクサソリを駆除してほしい。', obj: [{ type: 'kill', what: 'scorpion', n: 6, text: 'サバクサソリを倒す' }], reward: { coins: 8000, exp: 3500, items: [['potion', 3]] } },
    sq_frost: { title: '氷原の弓兵', giver: 'q3', desc: '人を凍らせる矢を放つ弓兵を倒してほしい。', obj: [{ type: 'kill', what: 'frost_archer', n: 5, text: '氷原の弓兵を倒す' }], reward: { coins: 15000, exp: 7000, items: [['elixir', 1]] } },
    sq_spirit: { title: '炎の精霊を鎮めよ', giver: 'q4', desc: '暴走する炎の精霊を鎮めてほしい。', obj: [{ type: 'kill', what: 'fire_spirit', n: 6, text: '炎の精霊を倒す' }], reward: { coins: 30000, exp: 15000, items: [['elixir', 2]] } }
  };
  D.QUEST_TALK = {
    sq_boar: { offer: ['旅の人、腕に覚えはあるかい？', '最近イノシシが畑を荒らして困ってるんだ。5頭ほど狩ってきてくれないか？'], done: ['おお、助かったよ！これで畑も安心だ。お礼に受け取ってくれ。'] },
    sq_flower: { offer: ['ねえねえ、お兄ちゃん／お姉ちゃん！', 'お母さんにスイートフラワーの花束をあげたいの。5本集めてきてくれる？'], done: ['わあ、きれい！ありがとう！これ、お礼だよ！'] },
    sq_wolf: { offer: ['森オオカミが群れで集落に近づいてきている。', '6頭ほど仕留めてくれれば、しばらくは安全だろう。'], done: ['見事な腕前だ。森の民として礼を言う。'] },
    sq_scorp: { offer: ['交易路にサソリが出て、商隊が困っている。', '6匹ほど駆除してくれないか？'], done: ['これで商隊も安心して通れる。感謝する！'] },
    sq_frost: { offer: ['氷原の弓兵の矢を受けると、体が凍りついてしまうの。', '5人ほど倒してくれれば、矢の研究ができるわ。'], done: ['ありがとう！この矢があれば、凍結を防ぐ方法が見つかるかも。'] },
    sq_spirit: { offer: ['炎の精霊が暴走して、観測ができないんだ。', '6体ほど鎮めてくれないか？'], done: ['ふう、これで観測を再開できる。ありがとう！'] }
  };
  D.MARC = {
    first: ['おお……！その身にまとう星の光……あなたが、星の導きで現れたという転生者か。', 'わしはこのスターリーフ村の長老、マルクじゃ。', 'この島・ステラリアは今、五つの迷宮からあふれ出す魔物に脅かされておる。', '迷宮の奥には「迷宮の主」が棲み、それぞれが「星の欠片」を守っておるのじゃ。', '五つの欠片を集めれば、星見山の頂への道が開かれると伝わっておる……。', 'どうか、この島に平和を取り戻してはくれんか。まずは西の「風の古塔」を目指すとよい。'],
    mid: ['迷宮の攻略は順調かのう。', '強敵に挑むなら、レベルを上げ、良い武器を手に入れることじゃ。', '村の「星の像」に祈れば、傷を癒やしてくれるぞ。'],
    ready: ['五つの星の欠片が……共鳴しておる！', '星見山の頂への道が開かれたようじゃ。北東の大きな山を目指しなさい。'],
    end: ['あなたのおかげで、ステラリアに平和が戻った……！', 'この島の者は皆、あなたの名を語り継ぐじゃろう。本当にありがとう。']
  };
  D.TIPS = [
    '人格は一度選ぶと二度と変えられません。それぞれの長所と短所をよく考えましょう。',
    '敵の足元に赤い予兆が出たら、ダッシュ（Shift / 右クリック）で回避しましょう。',
    '村の「星の像」に祈ると、HPが全回復します。',
    'ワープポイントを解放すると、地図からいつでもワープできます。',
    '食べ物は G キーで素早く食べられます。バッグから選ぶこともできます。',
    '急な崖は、スタミナを使ってよじ登ることができます。',
    '覚醒者は Z キーで覚醒！覚醒中は全ステータスが大幅に上昇します。',
    '飛翔者は空中でもう一度ジャンプすると空を飛べます。',
    '魔術者はLv.7で最初の魔法を習得します。序盤は通常魔法で耐えましょう。',
    '敵には弱点属性があります。弱点を突くとダメージが1.5倍になります。',
    '設定から画質・影・描画距離・草の密度などを細かく変更できます。',
    '夜になると蛍が舞い、村の灯りがともります。',
    '宝箱からは貴重な武器やスターコインが手に入ります。'
  ];

  // =====================================================================
  //  Beta v1.0.5 追加データ（第二章・新エリア・仲間・サポートモンスター）
  // =====================================================================
  // ---------------- 新しい武器（第二章） ----------------
  D.WEAPONS.push(
    Wp('s_sky', '天翔の剣', 'sword', 12000, 5, 'wind', { blade: '#f0fbff', guard: '#7fd8ff', glow: '#bff6ff' }, '天空回廊で見つかった、風をまとう細身の剣。', 160000),
    Wp('a_sky', '天嶺の大斧', 'axe', 13000, 5, 'wind', { blade: '#eef8ff', glow: '#bff6ff', guard: '#5a8ac0' }, '天嶺の岩を切り出したような巨大な斧。', 170000),
    Wp('t_sky', '蒼穹の杖', 'staff', 11500, 5, 'wind', { glow: '#bff6ff', blade: '#5a8ac0' }, '空の青を閉じ込めた宝玉の杖。', 150000),
    Wp('s_mirage', '蜃気楼の宝剣', 'sword', 15500, 5, 'earth', { blade: '#ffe8b0', guard: '#a06ad8', glow: '#ffd27a' }, '揺らめく刃が敵の目を惑わす宝剣。', 260000),
    Wp('a_mirage', '砂王の断罪斧', 'axe', 16500, 5, 'earth', { blade: '#f0d8a0', glow: '#ffd27a', guard: '#7a4ab0' }, '古代の砂王が罪人を裁いた大斧。', 270000),
    Wp('t_mirage', '幻影の杖', 'staff', 15000, 5, 'arcane', { glow: '#d8a0ff', blade: '#8a6a3a' }, '幻を現実に変えるといわれる杖。', 250000),
    Wp('s_aurora', '極光剣オーロラ', 'sword', 20000, 5, 'ice', { blade: '#e8fff8', guard: '#b07aff', glow: '#7fffd0' }, '極光をそのまま刃にした剣。斬った敵を鈍らせる。'),
    Wp('a_magma', '獄炎斧ヴォルカ', 'axe', 21500, 5, 'fire', { blade: '#ffb08a', glow: '#ff4a1a', guard: '#2a1a1a' }, '獄炎竜の牙から打ち出された斧。'),
    Wp('t_aurora', '極光の杖', 'staff', 19500, 5, 'ice', { glow: '#7fffd0', blade: '#5a4a8a' }, '極光の精霊が宿る杖。'),
    Wp('s_astral', '星天剣アストラリア', 'sword', 26000, 5, 'light', { blade: '#ffffff', guard: '#ffd27a', glow: '#bfe8ff' }, '星喰竜を討った者に応える、星天の剣。'),
    Wp('a_astral', '天穹砕きの斧', 'axe', 27500, 5, 'light', { blade: '#fffbe8', glow: '#bfe8ff', guard: '#ffd27a' }, '天穹すら砕くと伝わる伝説の大斧。'),
    Wp('t_astral', '星界の杖', 'staff', 25000, 5, 'light', { glow: '#bfe8ff', blade: '#f0e0b0' }, '星界の扉を開くといわれる杖。')
  );
  D.W = {}; D.WEAPONS.forEach(w => D.W[w.id] = w);
  D.TIER_WEAPON.push(
    { sword: 's_sky', axe: 'a_sky', staff: 't_sky' }, { sword: 's_mirage', axe: 'a_mirage', staff: 't_mirage' },
    { sword: 's_aurora', axe: 'a_magma', staff: 't_aurora' }, { sword: 's_astral', axe: 'a_astral', staff: 't_astral' }
  ); // index 6〜9
  D.DUNGEON_TIER = [0, 1, 2, 3, 4, 6, 7, 8, 7, 8, 6]; // ダンジョンID → 報酬武器ティア
  D.REGION_TIER = [0, 1, 2, 3, 4, 6, 6, 7, 8];       // 地域 → 宝箱武器ティア

  // ---------------- 新しいアイテム ----------------
  Object.assign(D.ITEMS, {
    skyberry: { name: '天空ベリー', cat: 'food', heal: 0.22, rar: 2, icon: '🍇', desc: '平原超山の高原に実る、空色の甘いベリー。HPが22%回復する。', sell: 40 },
    datefruit: { name: '砂漠ナツメ', cat: 'food', heal: 0.25, rar: 2, icon: '🌰', desc: '乾いた大地でも育つ栄養たっぷりの実。HPが25%回復する。', sell: 45 },
    aurorapeach: { name: '極光の桃', cat: 'food', heal: 0.28, rar: 3, icon: '🍑', desc: '極光を浴びて七色に輝く桃。HPが28%回復する。', sell: 55 },
    magmapepper: { name: 'マグマペッパー', cat: 'food', heal: 0.3, rar: 3, icon: '🌶', desc: '食べると体の芯から燃え上がる唐辛子。HPが30%回復する。', sell: 60 },
    hipotion: { name: 'HPポーションL', cat: 'food', heal: 0.7, rar: 4, icon: '🧴', desc: '高濃度の回復薬。HPが70%回復する。', price: 4000, sell: 600 },
    feather: { name: '風切り羽', cat: 'mat', rar: 2, icon: '🪶', desc: '風の鳥人の美しい羽根。', sell: 260 },
    cloth: { name: '古代の包帯', cat: 'mat', rar: 2, icon: '🧻', desc: '砂漠のミイラが巻いていた古い布。', sell: 280 },
    auroracrystal: { name: '極光結晶', cat: 'mat', rar: 3, icon: '💠', desc: '極光の力が結晶になったもの。', sell: 420 },
    obsidian: { name: '黒曜石', cat: 'mat', rar: 3, icon: '🪨', desc: '溶岩が冷えて固まった黒い宝石。', sell: 450 },
    starstone: { name: '天星石', cat: 'key', rar: 5, icon: '🌟', desc: '星界の遺跡の主が守っていた石。六つ集めると天穹山の頂への光の道が開く。' }
  });
  D.REGION_FOOD.push('skyberry', 'datefruit', 'aurorapeach', 'magmapepper');

  // ---------------- 第二章の敵 ----------------
  const QD = (o) => Object.assign({ h: 0.62, L: 1.0, w: 0.18, bodyR: [0.26, 0.28, 0.58], headR: [0.17, 0.17, 0.2], neckY: 0.12, neckRise: 0.12, neckLen: 0.2, neckR: 0.13, snout: 0.16, legR: 0.06, tailLen: 0.22, tailRise: 0.05, tailR: 0.08, eyeS: 0.8, ears: 0.14 }, o);
  Object.assign(D.ENEMIES, {
    // 平原超山
    cloud_slime: E({ name: '雲スライム', model: ['slime', { color: '#f2f8ff', kind: 'wind', top: '#bfe4ff', e: 0.1 }], hpK: 1.1, atkK: 1.1, speed: 2.8, el: 'wind', weak: 'thunder', drops: [['slime', 0.6]], atk: [{ kind: 'jump', windup: 0.5, r: 2.6, mult: 1.1, range: 4, cd: 2.2 }] }),
    rock_bison: E({ name: '岩角バイソン', model: ['quad', QD({ h: 0.95, L: 1.5, w: 0.3, bodyR: [0.52, 0.55, 0.85], headR: [0.32, 0.3, 0.34], neckY: 0.05, neckRise: 0.02, neckLen: 0.18, neckR: 0.3, snout: 0.12, legR: 0.12, tailLen: 0.2, tailRise: 0, tailR: 0.05, ears: 0.1, horns: 0.42, hornS: 1.3, hornC: '#d8d0c0', color: '#6a5444', dark: '#3a2e26', belly: '#8a7462', eye: '#1a1010' })], hpK: 1.8, atkK: 1.25, defK: 1.3, speed: 4.2, passive: true, exp: 1.4, drops: [['meat', 1], ['fang', 0.5]], radius: 0.9, atk: [{ kind: 'charge', windup: 0.7, dist: 14, w: 2.0, mult: 1.6, range: 15, cd: 4.5, anim: 'charge', tele: true }, { kind: 'circle', windup: 0.8, r: 3.6, mult: 1.3, cd: 5, tele: true }] }),
    harpy: E({ name: '風の鳥人', model: ['human', { gender: 'f', main: '#5a8ac0', sub: '#e8f4ff', accent: '#7fd8ff', hair: '#e8f4ff', skin: '#e8d8c8', wings: '#e8f4ff', wingTip: '#7fd8ff', wingE: 0.2, eyeGlow: '#7fffe0', weapon: { type: 'bow', blade: '#bff6ff', e: 0.6 } }, 0.95], hpK: 1.0, atkK: 1.15, speed: 3.6, keep: 12, aggro: 24, el: 'wind', weak: 'ice', fly: true, drops: [['feather', 0.5]], atk: [{ kind: 'proj', windup: 0.75, speed: 28, mult: 1.0, range: 26, cd: 2.4, anim: 'bow', look: 'blade', count: 3, spread: 0.3 }] }),
    sentinel: E({ name: '苔むした番兵', model: ['golem', { rock: '#7a8a6a', dark: '#4a5a3a', glow: '#b8ff7a' }, 1.5], hpK: 3.0, atkK: 1.35, defK: 1.8, speed: 1.9, el: 'earth', weak: 'fire', exp: 2, drops: [['core', 0.5], ['ore', 0.4]], radius: 1.0, atk: [{ kind: 'melee', windup: 0.9, r: 4, ang: 2.0, mult: 1.6, cd: 2.6, anim: 'slam', tele: true }, { kind: 'line', windup: 1.0, len: 14, w: 2.2, mult: 1.5, range: 13, cd: 6, tele: true, anim: 'slam' }] }),
    titan: E({ name: '古の巨像タイタン', elite: true, model: ['golem', { rock: '#a8a090', dark: '#6a6458', glow: '#7fd8ff' }, 2.6], hpK: 8, atkK: 1.6, defK: 2.0, speed: 1.8, exp: 7, drops: [['core', 1], ['ore', 1]], radius: 1.6, atk: [{ kind: 'melee', windup: 0.9, r: 5.5, ang: 2.2, mult: 1.7, cd: 2.4, anim: 'slam', tele: true }, { kind: 'jump', windup: 1.0, r: 6, mult: 2.0, range: 14, cd: 6, anim: 'slam', tele: true }, { kind: 'ring', windup: 1.0, r: 14, mult: 1.6, cd: 8, anim: 'slam' }] }),
    // 乾燥砂漠
    dune_scorpion: E({ name: '毒砂サソリ', model: ['scorp', { color: '#9a6ac0', dark: '#5a3a7a', glow: '#7aff9a' }], hpK: 1.5, atkK: 1.2, defK: 1.5, speed: 4.2, el: 'earth', weak: 'water', drops: [['shell', 0.6]], radius: 0.7, atk: [{ kind: 'melee', windup: 0.45, r: 2.8, ang: 1.6, mult: 1.1, cd: 1.6, anim: 'claw' }, { kind: 'melee', windup: 0.75, r: 3.4, ang: 0.9, mult: 1.6, cd: 3.5, status: 'poison', anim: 'sting', tele: true }] }),
    mummy: E({ name: '砂漠のミイラ', model: ['human', { bony: true, main: '#d8c8a0', sub: '#b8a478', accent: '#ffd27a', noHair: true, eyeGlow: '#ffd27a', weapon: { type: 'club', blade: '#8a6a3a' } }, 1.0], hpK: 1.6, atkK: 1.2, defK: 1.3, speed: 2.6, el: 'dark', weak: 'fire', drops: [['cloth', 0.5]], atk: [{ kind: 'melee', windup: 0.6, r: 2.8, ang: 1.8, mult: 1.2, cd: 1.9, anim: 'club', status: 'slow' }, { kind: 'aoe', windup: 1.1, r: 3.2, mult: 1.3, range: 14, cd: 6, tele: true, look: 'sand', anim: 'cast' }] }),
    djinn: E({ name: '砂塵のジン', model: ['spirit', { glow: '#ffe8a0', shell: '#c8902a', shellE: 0.7 }], hpK: 1.1, atkK: 1.2, speed: 3.4, keep: 9, aggro: 22, el: 'earth', weak: 'water', fly: true, drops: [['core', 0.35]], atk: [{ kind: 'proj', windup: 0.7, speed: 20, mult: 1.0, range: 22, cd: 2.2, look: 'sand', count: 3, spread: 0.35 }, { kind: 'aoe', windup: 1.2, r: 3.5, mult: 1.4, range: 20, cd: 6, tele: true, count: 2, look: 'tornado' }] }),
    sand_golem: E({ name: '砂岩ゴーレム', model: ['golem', { rock: '#d0a874', dark: '#9a7448', glow: '#ffd27a' }, 1.45], hpK: 3.0, atkK: 1.35, defK: 1.8, speed: 1.9, el: 'earth', weak: 'water', exp: 2, drops: [['core', 0.45], ['ore', 0.4]], radius: 0.95, atk: [{ kind: 'melee', windup: 0.9, r: 3.8, ang: 2.0, mult: 1.6, cd: 2.6, anim: 'slam', tele: true }, { kind: 'circle', windup: 1.0, r: 5, mult: 1.4, cd: 6, tele: true, anim: 'slam' }] }),
    pharaoh: E({ name: '王墓の守護王', elite: true, model: ['human', { gender: 'm', armor: '#d8a83a', accent: '#3a8fbf', accentE: 0.6, knightHelm: '#c8982a', plume: '#3a8fbf', main: '#1e2a4a', sub: '#e8d8b0', pants: '#2a2a3a', boots: '#8a6a2a', cape: '#3a2a6a', capeLong: true, weapon: { type: 'greatsword', glow: '#ffd27a', blade: '#f0e0b0' }, eyeGlow: '#7fe8ff' }, 1.7], hpK: 8, atkK: 1.6, defK: 1.9, speed: 3.4, exp: 7, drops: [['core', 1], ['cloth', 1]], radius: 0.9, atk: [{ kind: 'melee', windup: 0.7, r: 4.5, ang: 2.4, mult: 1.6, cd: 1.9, anim: 'atk', tele: true }, { kind: 'charge', windup: 0.8, dist: 15, w: 2.4, mult: 1.7, range: 16, cd: 6, anim: 'atk', tele: true }, { kind: 'aoe', windup: 1.2, r: 4, mult: 1.5, range: 24, cd: 7, tele: true, count: 4, look: 'sand', anim: 'cast' }] }),
    // 極光雪原
    aurora_wolf: E({ name: '極光狼', model: ['quad', QD({ h: 0.7, L: 1.1, color: '#2a3048', dark: '#1a1e30', belly: '#c8d0f0', eye: '#7fffd0', tailTip: '#b07aff', spikes: '#7fffd0', spikeS: 0.9, spikeE: 1 })], speed: 6.0, hpK: 1.3, atkK: 1.2, el: 'ice', weak: 'fire', aggro: 20, drops: [['fang', 0.7]], radius: 0.55, atk: [{ kind: 'melee', windup: 0.35, r: 2.4, ang: 1.4, mult: 1.1, cd: 1.4, anim: 'bite', status: 'slow' }, { kind: 'charge', windup: 0.5, dist: 10, w: 1.4, mult: 1.3, range: 11, cd: 4.5, anim: 'charge' }] }),
    yeti: E({ name: '雪男イエティ', model: ['golem', { rock: '#eef2f8', dark: '#b8c4d4', glow: '#7fd8ff' }, 1.55], hpK: 3.2, atkK: 1.4, defK: 1.6, speed: 2.4, el: 'ice', weak: 'fire', exp: 2, drops: [['core', 0.45], ['meat', 0.6]], radius: 1.0, atk: [{ kind: 'melee', windup: 0.8, r: 3.8, ang: 2.0, mult: 1.6, cd: 2.4, anim: 'slam', tele: true, status: 'slow' }, { kind: 'jump', windup: 0.9, r: 4.5, mult: 1.8, range: 12, cd: 6, anim: 'slam', tele: true, status: 'freeze' }] }),
    crystal_spirit: E({ name: '晶霊', model: ['spirit', { glow: '#bff6ff', shell: '#7a5ad8', shellE: 0.7 }], hpK: 1.1, atkK: 1.2, speed: 3.4, keep: 9, aggro: 22, el: 'ice', weak: 'fire', fly: true, drops: [['auroracrystal', 0.35]], atk: [{ kind: 'proj', windup: 0.7, speed: 26, mult: 1.0, range: 24, cd: 2.2, look: 'lance', count: 3, spread: 0.3, status: 'slow' }] }),
    aurora_archer: E({ name: '極光の射手', model: ['human', { mask: '#e8e0ff', skin: '#9a9ab8', main: '#3a2a6a', sub: '#7fffd0', pants: '#2a2448', boots: '#e8eef4', accent: '#b07aff', accentE: 0.6, noHair: true, cape: '#5a3a9a', weapon: { type: 'bow', blade: '#7fffd0', e: 0.7 }, eyeGlow: '#7fffd0' }, 0.98], hpK: 1.0, atkK: 1.2, speed: 3.0, keep: 13, aggro: 26, el: 'ice', weak: 'fire', drops: [['auroracrystal', 0.25]], atk: [{ kind: 'proj', windup: 0.8, speed: 30, mult: 1.1, range: 28, cd: 2.5, anim: 'bow', look: 'icearrow', status: 'freeze' }] }),
    frost_giant: E({ name: '氷巨人ヨトゥン', elite: true, model: ['golem', { rock: '#bfe8ff', dark: '#6a9ac8', glow: '#b07aff' }, 2.7], hpK: 9, atkK: 1.6, defK: 2.0, speed: 1.9, el: 'ice', weak: 'fire', exp: 7, drops: [['core', 1], ['auroracrystal', 1]], radius: 1.6, atk: [{ kind: 'melee', windup: 0.9, r: 5.5, ang: 2.2, mult: 1.7, cd: 2.3, anim: 'slam', tele: true, status: 'slow' }, { kind: 'circle', windup: 1.1, r: 9, mult: 1.6, cd: 6, tele: true, anim: 'slam', status: 'freeze' }, { kind: 'aoe', windup: 1.2, r: 3.6, mult: 1.5, range: 24, cd: 5, tele: true, count: 4, look: 'icespike', anim: 'slam' }] }),
    // 溶岩火山
    magma_slime: E({ name: '溶岩スライム', model: ['slime', { color: '#ff5a1a', kind: 'fire', e: 0.45 }], hpK: 1.2, atkK: 1.2, speed: 2.7, el: 'fire', weak: 'water', drops: [['slime', 0.6]], atk: [{ kind: 'jump', windup: 0.5, r: 2.8, mult: 1.2, range: 4, cd: 2.2, status: 'burn' }] }),
    salamander: E({ name: 'サラマンダー', model: ['quad', QD({ h: 0.45, L: 1.4, w: 0.22, bodyR: [0.3, 0.24, 0.75], headR: [0.2, 0.15, 0.26], neckY: 0.02, neckRise: 0.02, neckLen: 0.12, neckR: 0.16, snout: 0.2, legR: 0.07, tailLen: 0.7, tailRise: -0.02, tailR: 0.14, ears: 0.0, color: '#c8401a', dark: '#5a1a0a', belly: '#ffb03a', eye: '#ffe03a', tailTip: '#ff8a2a', spikes: '#ffb03a', spikeS: 0.8, spikeE: 1 })], hpK: 1.5, atkK: 1.25, speed: 4.6, el: 'fire', weak: 'water', drops: [['fang', 0.5], ['obsidian', 0.2]], radius: 0.6, atk: [{ kind: 'melee', windup: 0.4, r: 2.6, ang: 1.5, mult: 1.1, cd: 1.6, anim: 'bite', status: 'burn' }, { kind: 'cone', windup: 0.9, r: 9, ang: 0.7, mult: 0.5, ticks: 5, cd: 6, tele: true, status: 'burn', anim: 'breath' }] }),
    obsidian_golem: E({ name: '黒曜ゴーレム', model: ['golem', { rock: '#1e1a22', dark: '#0e0c12', glow: '#ff7a2a' }, 1.5], hpK: 3.3, atkK: 1.4, defK: 2.0, speed: 1.9, el: 'fire', weak: 'water', exp: 2, drops: [['obsidian', 0.5], ['core', 0.4]], radius: 1.0, atk: [{ kind: 'melee', windup: 0.9, r: 3.8, ang: 2.0, mult: 1.7, cd: 2.6, anim: 'slam', tele: true, status: 'burn' }, { kind: 'aoe', windup: 1.2, r: 4, mult: 1.5, range: 16, cd: 6, tele: true, count: 2, anim: 'slam', status: 'burn' }] }),
    flame_knight: E({ name: '業火の騎士', model: ['human', { gender: 'm', armor: '#3a2a2a', accent: '#ff6a2a', accentE: 0.8, knightHelm: '#2a1e1e', plume: '#ff6a2a', main: '#2a1a1a', sub: '#5a3a2a', pants: '#1a1212', boots: '#2a1a1a', cape: '#6a1a0a', weapon: { type: 'sword', blade: '#ffb08a', glow: '#ff6a2a' }, offhand: { type: 'shield' }, eyeGlow: '#ff8a3a' }, 1.05], hpK: 1.9, atkK: 1.3, defK: 1.6, speed: 3.2, el: 'fire', weak: 'water', drops: [['core', 0.35]], atk: [{ kind: 'melee', windup: 0.55, r: 2.8, ang: 1.7, mult: 1.2, cd: 1.7, anim: 'atk', status: 'burn' }, { kind: 'charge', windup: 0.7, dist: 9, w: 1.6, mult: 1.4, range: 10, cd: 5, anim: 'atk', tele: true }] }),
    magma_drake: E({ name: '溶岩竜', elite: true, model: ['quad', { h: 1.0, L: 1.7, w: 0.34, bodyR: [0.5, 0.5, 0.95], headR: [0.3, 0.26, 0.38], neckY: 0.25, neckRise: 0.5, neckLen: 0.45, neckR: 0.2, snout: 0.28, legR: 0.14, tailLen: 0.7, tailRise: -0.05, tailR: 0.24, eyeS: 1.2, horns: 0.4, hornS: 1.3, hornC: '#1a1010', color: '#3a2420', dark: '#1a0e0c', belly: '#ff6a2a', eye: '#ffe03a', tailTip: '#ff4a1a', spikes: '#ff6a2a', spikeS: 1.6, spikeE: 1, wings: 1.8, wingC: '#5a2a1a' }, 2.0], hpK: 9, atkK: 1.6, defK: 1.9, speed: 3.4, el: 'fire', weak: 'water', exp: 7, drops: [['core', 1], ['obsidian', 1]], radius: 1.7, atk: [{ kind: 'melee', windup: 0.7, r: 5, ang: 1.6, mult: 1.5, cd: 2.0, anim: 'bite', tele: true }, { kind: 'cone', windup: 1.0, r: 12, ang: 0.8, mult: 0.6, ticks: 6, cd: 7, tele: true, status: 'burn', anim: 'breath' }, { kind: 'circle', windup: 1.0, r: 6.5, mult: 1.6, cd: 6, tele: true, anim: 'tail' }] }),
    // 遺跡専用
    star_knight: E({ name: '星界の騎士', model: ['human', { gender: 'm', armor: '#2a3a6a', accent: '#ffd27a', accentE: 0.7, knightHelm: '#1e2a4a', plume: '#ffd27a', main: '#1a2240', sub: '#c8d0f0', pants: '#141a30', boots: '#1e2a4a', cape: '#1e2a5a', weapon: { type: 'greatsword', blade: '#e8f0ff', glow: '#ffd27a' }, eyeGlow: '#ffe8a0' }, 1.05], hpK: 1.8, atkK: 1.3, defK: 1.6, speed: 3.2, el: 'light', weak: 'dark', drops: [['core', 0.35]], atk: [{ kind: 'melee', windup: 0.6, r: 3.2, ang: 2.0, mult: 1.3, cd: 1.8, anim: 'atk', tele: true }, { kind: 'jump', windup: 0.8, r: 3.5, mult: 1.5, range: 9, cd: 5, anim: 'slam', tele: true }] }),
    root_treant: E({ name: '根喰らいの樹人', model: ['treant', { leaf: '#2a4a2a', leaf2: '#5a7a3a', glow: '#b8ff7a', flowers: '#c86aff' }, 1.6], hpK: 3.0, atkK: 1.35, defK: 1.5, speed: 2.0, el: 'earth', weak: 'fire', exp: 2, drops: [['core', 0.4]], radius: 0.9, atk: [{ kind: 'melee', windup: 0.9, r: 3.8, ang: 2.0, mult: 1.6, cd: 2.6, anim: 'slam', tele: true }, { kind: 'line', windup: 1.0, len: 14, w: 1.8, mult: 1.5, range: 13, cd: 6, tele: true, anim: 'slam', fan: 3, status: 'poison' }] }),
    spore_shroom: E({ name: '胞子キノコ', model: ['mushroom', { cap: '#8a4ad8', dots: '#c8ff7a' }], hpK: 1.2, atkK: 1.2, speed: 2.2, el: 'earth', weak: 'fire', drops: [['mushroom', 0.5]], atk: [{ kind: 'circle', windup: 0.9, r: 4.2, mult: 1.0, cd: 3.6, status: 'poison', tele: true, anim: 'atk' }] }),
    shadow_wolf: E({ name: '影狼', model: ['quad', QD({ color: '#1e1a2a', dark: '#0e0c16', belly: '#4a3a6a', eye: '#c86aff', tailTip: '#8a4ad8', spikes: '#8a4ad8', spikeS: 0.7, spikeE: 0.8 })], speed: 6.0, hpK: 1.2, atkK: 1.2, el: 'dark', weak: 'light', aggro: 20, drops: [['fang', 0.7]], radius: 0.5, atk: [{ kind: 'melee', windup: 0.35, r: 2.3, ang: 1.4, mult: 1.1, cd: 1.4, anim: 'bite' }, { kind: 'charge', windup: 0.5, dist: 10, w: 1.3, mult: 1.3, range: 11, cd: 4.5, anim: 'charge' }] }),
    // ---------------- 第二章のボス ----------------
    archangel: E({ name: '天空の騎士 セラフィム', boss: true, model: ['human', { gender: 'm', armor: '#f0f4fa', accent: '#ffd27a', accentE: 0.8, knightHelm: '#e8eef6', plume: '#7fd8ff', main: '#d8e4f0', sub: '#ffffff', pants: '#a8b8cc', boots: '#e8eef6', wings: '#ffffff', wingTip: '#ffd27a', wingE: 0.5, cape: '#7fb8e8', capeLong: true, weapon: { type: 'greatsword', glow: '#bff6ff', blade: '#ffffff' }, eyeGlow: '#bff6ff' }, 2.3], hpK: 20, atkK: 1.6, defK: 1.8, speed: 4.6, el: 'wind', weak: 'thunder', exp: 45, radius: 1.0, float: true,
      atk: [{ kind: 'melee', windup: 0.7, r: 5.5, ang: 2.6, mult: 1.5, cd: 1.7, anim: 'atk', tele: true }, { kind: 'charge', windup: 0.8, dist: 22, w: 2.8, mult: 1.8, range: 24, cd: 5, anim: 'atk', tele: true }, { kind: 'proj', windup: 0.8, speed: 24, mult: 1.0, range: 34, cd: 5, count: 7, spread: 1.2, look: 'blade', anim: 'cast' }, { kind: 'jump', windup: 1.0, r: 7, mult: 2.0, range: 30, cd: 7, tele: true, anim: 'slam' }, { kind: 'aoe', windup: 1.2, r: 4.2, mult: 1.6, range: 34, cd: 7, tele: true, count: 6, look: 'tornado', phase2: true, anim: 'cast' }, { kind: 'summon', windup: 1.0, cd: 18, what: 'harpy', n: 2, phase2: true, anim: 'cast' }] }),
    mirage: E({ name: '蜃気楼の魔人 ミラージュ', boss: true, model: ['human', { gender: 'f', gown: true, main: '#7a4ab0', sub: '#ffe8b0', accent: '#ffd27a', accentE: 0.8, hair: '#ffd27a', eye: '#ff9ef0', skin: '#e8c8a8', crown: '#ffd27a', weapon: { type: 'staff', glow: '#ffd27a', blade: '#7a4ab0' }, cape: '#c8902a', capeLong: true }, 2.0], hpK: 20, atkK: 1.6, defK: 1.8, speed: 3.8, keep: 10, el: 'earth', weak: 'water', exp: 45, radius: 0.9, float: true,
      atk: [{ kind: 'proj', windup: 0.7, speed: 22, mult: 1.1, range: 34, cd: 2.4, count: 5, spread: 0.8, look: 'sand', anim: 'cast' }, { kind: 'aoe', windup: 1.2, r: 4, mult: 1.6, range: 34, cd: 5, tele: true, count: 6, look: 'tornado', anim: 'cast' }, { kind: 'ring', windup: 1.0, r: 18, mult: 1.6, cd: 8, anim: 'cast' }, { kind: 'summon', windup: 1.0, cd: 16, what: 'djinn', n: 3, anim: 'cast' }, { kind: 'circle', windup: 1.2, r: 9, mult: 1.7, cd: 9, tele: true, anim: 'cast', phase2: true }] }),
    fenrir: E({ name: '極光の魔狼 フェンリル', boss: true, model: ['quad', QD({ h: 1.3, L: 2.2, w: 0.42, bodyR: [0.6, 0.62, 1.2], headR: [0.4, 0.38, 0.46], neckY: 0.2, neckRise: 0.25, neckLen: 0.4, neckR: 0.32, snout: 0.36, legR: 0.18, tailLen: 0.9, tailRise: 0.1, tailR: 0.32, eyeS: 1.6, ears: 0.3, color: '#e8eef8', dark: '#9aa8c8', belly: '#ffffff', eye: '#7fffd0', tailTip: '#b07aff', spikes: '#7fffd0', spikeS: 2.2, spikeE: 1 }), 2.4], hpK: 21, atkK: 1.65, defK: 1.8, speed: 5.2, el: 'ice', weak: 'fire', exp: 45, radius: 2.0,
      atk: [{ kind: 'melee', windup: 0.6, r: 6, ang: 1.8, mult: 1.5, cd: 1.6, anim: 'bite', tele: true, status: 'slow' }, { kind: 'charge', windup: 0.7, dist: 24, w: 3.2, mult: 1.8, range: 26, cd: 4.5, anim: 'charge', tele: true }, { kind: 'cone', windup: 1.0, r: 15, ang: 0.9, mult: 0.7, ticks: 6, cd: 7, tele: true, status: 'freeze', anim: 'breath' }, { kind: 'aoe', windup: 1.2, r: 4, mult: 1.6, range: 34, cd: 6, tele: true, count: 7, look: 'icespike', anim: 'roar' }, { kind: 'summon', windup: 1.0, cd: 16, what: 'aurora_wolf', n: 3, phase2: true, anim: 'roar' }, { kind: 'ring', windup: 1.0, r: 18, mult: 1.6, cd: 8, phase2: true, anim: 'roar' }] }),
    volcanix: E({ name: '獄炎竜 ヴォルカニクス', boss: true, model: ['quad', { h: 1.35, L: 2.3, w: 0.44, bodyR: [0.66, 0.64, 1.25], headR: [0.38, 0.34, 0.48], neckY: 0.3, neckRise: 0.7, neckLen: 0.62, neckR: 0.28, snout: 0.36, legR: 0.19, tailLen: 0.9, tailRise: -0.05, tailR: 0.32, eyeS: 1.6, horns: 0.6, hornS: 1.8, hornC: '#ff8a3a', color: '#1e1616', dark: '#0e0a0a', belly: '#ff4a1a', eye: '#ffe03a', tailTip: '#ff4a1a', spikes: '#ff6a2a', spikeS: 2.6, spikeE: 1, wings: 2.8, wingC: '#3a1a12' }, 2.7], hpK: 23, atkK: 1.7, defK: 1.9, speed: 3.8, el: 'fire', weak: 'water', exp: 50, radius: 2.4,
      atk: [{ kind: 'melee', windup: 0.8, r: 7, ang: 1.6, mult: 1.6, cd: 2.0, anim: 'bite', tele: true }, { kind: 'cone', windup: 1.0, r: 16, ang: 0.85, mult: 0.75, ticks: 6, cd: 6, tele: true, status: 'burn', anim: 'breath' }, { kind: 'circle', windup: 1.0, r: 8, mult: 1.8, cd: 6, tele: true, anim: 'tail' }, { kind: 'aoe', windup: 1.3, r: 4.6, mult: 1.7, range: 36, cd: 7, tele: true, count: 8, look: 'meteor', status: 'burn', anim: 'roar' }, { kind: 'ring', windup: 1.0, r: 20, mult: 1.6, cd: 9, anim: 'roar', phase2: true }, { kind: 'jump', windup: 1.4, r: 9, mult: 2.3, range: 32, cd: 9, tele: true, anim: 'roar', phase2: true }] }),
    stellagolem: E({ name: '星屑の巨像 ステラゴーレム', boss: true, model: ['golem', { rock: '#2a3058', dark: '#141838', glow: '#ffe8a0' }, 3.4], hpK: 24, atkK: 1.65, defK: 2.2, speed: 2.2, el: 'light', weak: 'dark', exp: 50, radius: 2.2,
      atk: [{ kind: 'melee', windup: 1.0, r: 7, ang: 2.4, mult: 1.7, cd: 2.4, anim: 'slam', tele: true }, { kind: 'jump', windup: 1.2, r: 8, mult: 2.2, range: 30, cd: 7, tele: true, anim: 'slam' }, { kind: 'aoe', windup: 1.3, r: 4.5, mult: 1.6, range: 36, cd: 6, tele: true, count: 7, look: 'meteor', anim: 'slam' }, { kind: 'ring', windup: 1.0, r: 20, mult: 1.6, cd: 8, anim: 'slam' }, { kind: 'line', windup: 1.1, len: 26, w: 3, mult: 1.8, cd: 6, tele: true, fan: 3, anim: 'slam', phase2: true }, { kind: 'summon', windup: 1.0, cd: 18, what: 'star_knight', n: 2, phase2: true, anim: 'slam' }] }),
    dryad: E({ name: '根源の女王 ドリアード', boss: true, model: ['treant', { flowers: '#ff9ef0', leaf: '#3a2a5a', leaf2: '#8a5ad8', glow: '#ff9ef0' }, 3.6], hpK: 22, atkK: 1.6, defK: 1.9, speed: 1.8, el: 'earth', weak: 'fire', exp: 48, radius: 2.0,
      atk: [{ kind: 'melee', windup: 1.0, r: 7.5, ang: 2.4, mult: 1.7, cd: 2.4, anim: 'slam', tele: true }, { kind: 'line', windup: 1.1, len: 24, w: 2.6, mult: 1.7, cd: 5, tele: true, fan: 3, anim: 'slam', status: 'poison' }, { kind: 'proj', windup: 0.9, speed: 18, mult: 1.0, range: 34, cd: 6, count: 14, spread: 6.28, look: 'seed', anim: 'cast' }, { kind: 'summon', windup: 1.0, cd: 15, what: 'spore_shroom', n: 3, anim: 'cast' }, { kind: 'aoe', windup: 1.3, r: 4, mult: 1.6, range: 34, cd: 6, tele: true, count: 7, phase2: true, anim: 'slam', status: 'poison' }] }),
    astral: E({ name: '星喰竜 アストラ', boss: true, model: ['quad', { h: 1.5, L: 2.6, w: 0.5, bodyR: [0.74, 0.72, 1.4], headR: [0.42, 0.38, 0.54], neckY: 0.35, neckRise: 0.8, neckLen: 0.72, neckR: 0.32, snout: 0.4, legR: 0.21, tailLen: 1.1, tailRise: 0.05, tailR: 0.36, eyeS: 1.8, horns: 0.7, hornS: 2.0, hornC: '#ffe8a0', color: '#1a1e40', dark: '#0a0c20', belly: '#b07aff', eye: '#ffe8a0', tailTip: '#7fd8ff', spikes: '#bfe8ff', spikeS: 2.8, spikeE: 1, wings: 3.2, wingC: '#2a2a6a' }, 3.0], hpK: 30, atkK: 1.75, defK: 2.1, speed: 4.2, el: 'dark', weak: 'light', exp: 80, radius: 2.8,
      atk: [{ kind: 'melee', windup: 0.8, r: 8, ang: 1.8, mult: 1.6, cd: 1.9, anim: 'bite', tele: true }, { kind: 'cone', windup: 1.0, r: 18, ang: 0.9, mult: 0.75, ticks: 6, cd: 6, tele: true, anim: 'breath' }, { kind: 'proj', windup: 0.9, speed: 16, mult: 1.0, range: 40, cd: 5, count: 8, spread: 1.8, look: 'dark', homing: true, anim: 'roar' }, { kind: 'aoe', windup: 1.3, r: 5, mult: 1.7, range: 40, cd: 6, tele: true, count: 9, look: 'meteor', anim: 'roar' }, { kind: 'ring', windup: 1.0, r: 22, mult: 1.7, cd: 8, anim: 'roar' }, { kind: 'jump', windup: 1.4, r: 10, mult: 2.4, range: 40, cd: 8, tele: true, anim: 'roar', phase2: true }, { kind: 'summon', windup: 1.0, cd: 18, what: 'crystal_spirit', n: 3, phase2: true, anim: 'roar' }] })
  });
  D.SPAWNS.push(
    [['cloud_slime', 'cloud_slime', 'cloud_slime'], ['rock_bison', 'rock_bison'], ['harpy', 'harpy'], ['sentinel'], ['cloud_slime', 'harpy', 'cloud_slime'], ['rock_bison', 'cloud_slime']],
    [['dune_scorpion', 'dune_scorpion'], ['mummy', 'mummy', 'mummy'], ['djinn', 'djinn'], ['sand_golem'], ['mummy', 'djinn', 'dune_scorpion']],
    [['aurora_wolf', 'aurora_wolf', 'aurora_wolf'], ['yeti'], ['crystal_spirit', 'crystal_spirit'], ['aurora_archer', 'aurora_archer'], ['aurora_wolf', 'aurora_archer', 'crystal_spirit']],
    [['magma_slime', 'magma_slime', 'magma_slime'], ['salamander', 'salamander'], ['obsidian_golem'], ['flame_knight', 'flame_knight'], ['salamander', 'magma_slime', 'flame_knight']]
  );
  D.CAMPS.push(['harpy', 'cloud_slime', 'sentinel', 'harpy'], ['mummy', 'djinn', 'mummy', 'sand_golem'], ['aurora_archer', 'aurora_wolf', 'yeti', 'aurora_archer'], ['flame_knight', 'magma_slime', 'obsidian_golem', 'flame_knight']);
  D.ELITES.push('titan', 'pharaoh', 'frost_giant', 'magma_drake');
  Object.assign(D.DUNGEON_MOBS, {
    sky: ['cloud_slime', 'harpy', 'sentinel', 'star_knight', 'cloud_slime'], mirage: ['mummy', 'djinn', 'dune_scorpion', 'sand_golem', 'mummy'],
    aurora: ['aurora_wolf', 'crystal_spirit', 'aurora_archer', 'yeti', 'aurora_wolf'], inferno: ['magma_slime', 'salamander', 'obsidian_golem', 'flame_knight', 'magma_slime'],
    starcave: ['star_knight', 'crystal_spirit', 'sentinel', 'wraith', 'star_knight'], roots: ['root_treant', 'spore_shroom', 'shadow_wolf', 'wraith', 'spore_shroom']
  });
  // 高台(足場)に配置する遠距離の敵
  D.DUNGEON_RANGED = { sky: ['harpy'], mirage: ['djinn'], aurora: ['aurora_archer', 'crystal_spirit'], inferno: ['flame_knight', 'magma_slime'], starcave: ['crystal_spirit'], roots: ['spore_shroom', 'wraith'] };

  // ---------------- 旅の仲間 ----------------
  // style: melee（近接）/ ranged（遠距離）  interval: 攻撃間隔(秒)
  const CS = (o) => o;
  D.COMPANIONS = {
    serena: {
      name: 'セレナ', title: '聖職者', en: 'CLERIC', gender: 'f', icon: '✝', color: '#e8e0ff', hp: 1800, atk: 490, def: 390, spd: 0.85, style: 'melee', interval: 1.75, reach: 3.0, ang: 2.4, mult: 1.45, el: 'light', wtype: 'scythe',
      quote: '私は教会そしてあなた様に命を捧げるためにここへ来ました',
      desc: '教会に仕える聖職者。命を捧げると言い切るその姿は、とてもたくましく正直だ。すべてから守ろうとする大鎌を振るう。服装も鎌も重いため移動速度は遅く、攻撃速度も斧より遅いが、攻撃範囲は標準。',
      merit: ['防御力が高い', '仲間全体を回復する祈りを使える'], demerit: ['移動速度 x0.85', '攻撃速度が遅い'],
      v: 0, dx: 4, dz: -24, cond: { dungeon: 0 }, condText: '風の古塔を攻略すると仲間になる',
      look: { gender: 'f', main: '#24222e', sub: '#f4f2ee', accent: '#e8c46a', pants: '#1a1822', boots: '#2a2630', hair: '#e8e0f0', eye: '#9fd0ff', gown: true, cape: '#1a1a24', capeLong: true, hairAcc: '#ffffff', weapon: { type: 'scythe', blade: '#eef2f8', glow: '#fff0a0' } },
      lines: { before: ['……祈りを捧げております。西の「風の古塔」に、魔を祓う勇者が現れることを。', 'もしあなた様が古塔を鎮めたのなら……その時は、もう一度お話しさせてください。'], join: ['あなた様が風の古塔を……！ やはり、あなた様こそ星に選ばれたお方。', '私は教会そしてあなた様に命を捧げるためにここへ来ました。', 'この大鎌で、あなた様をすべてから守ります。どうか、お供させてください。'] },
      skills: [
        CS({ lv: 10, name: '聖鎌・十字斬', type: 'arc', el: 'light', r: 4.6, ang: 3.0, mult: 2.6, cd: 8, desc: '大鎌を十字に振るい、前方を大きく斬る。' }),
        CS({ lv: 20, name: '癒しの祈り', type: 'heal', pct: 0.2, cd: 16, desc: '祈りを捧げ、主人公と仲間のHPを20%回復する。' }),
        CS({ lv: 30, name: '断罪の大鎌', type: 'nova', el: 'light', r: 6, mult: 3.6, stun: 1, cd: 12, desc: '大鎌を一回転させ、周囲の敵を断罪する。' }),
        CS({ lv: 40, name: '守護の聖域', type: 'buff', stat: 'def', val: 0.4, dur: 12, cd: 24, desc: '聖域を張り、主人公の防御力を12秒間40%上げる。' }),
        CS({ lv: 50, name: '天の裁き', type: 'rain', el: 'light', spots: 5, spread: 6, r: 4.5, mult: 3.0, delay: 0.6, cd: 16, desc: '天から光の槍を降らせる。' })
      ]
    },
    roland: {
      name: 'ロラン', title: '著名者', en: 'NOVELIST', gender: 'm', icon: '✒', color: '#e8b07a', hp: 1800, atk: 390, def: 290, spd: 1.0, style: 'melee', interval: 1.2, reach: 3.2, ang: 2.4, mult: 1.5, el: 'phys', wtype: 'axe', atkPer2: 100,
      quote: '自分が作家した本は世界一です。',
      desc: '世界的に有名な小説家。小説の中で憧れていた杖を大事に持ち歩いている。主人公のことをたくさん書きたいらしく、仕方なく自分の身を守るために斧を装備している。',
      merit: ['Lv.2ごとに攻撃力 +100（付属効果）', '小説の魔法で炎や星を降らせる'], demerit: ['防御力がやや低い'],
      v: 1, dx: -18, dz: 14, cond: { level: 12 }, condText: 'Lv.12以上で話しかけると仲間になる',
      look: { gender: 'm', main: '#6a3a2a', sub: '#f2e8d0', accent: '#d8b45a', pants: '#3a2a22', boots: '#2a1e18', hair: '#2a2a3a', eye: '#6a4a2a', scarf: '#8a2a3a', cape: '#4a2a20', weapon: { type: 'axe' }, offhand: { type: 'staff', glow: '#ffd27a' } },
      lines: { before: ['ふむ……君、まだ物語の主人公としては少々物足りないな。', 'もう少し腕を上げたら（Lv.12）、また来たまえ。'], join: ['おお、君か！ 噂は聞いているよ。異世界から来た転生者……なんと書きがいのある題材だ！', '自分が作家した本は世界一です。だが次の本は、君の冒険譚で世界一を更新する！', 'というわけで同行させてもらう。斧？ 仕方ないだろう、取材中に死んでは元も子もない。'] },
      skills: [
        CS({ lv: 10, name: '筆圧の一撃', type: 'arc', el: 'phys', r: 3.8, ang: 2.0, mult: 2.8, cd: 7, desc: '渾身の力で斧を振り下ろす。' }),
        CS({ lv: 20, name: '第一章・炎の挿絵', type: 'volley', el: 'fire', n: 3, spread: 0.4, speed: 24, mult: 1.6, explode: 2.5, look: 'orb', cd: 9, desc: '憧れの杖から、小説に描いた炎を放つ。' }),
        CS({ lv: 30, name: '取材メモ', type: 'buff', stat: 'atk', val: 0.25, dur: 15, cd: 25, desc: '主人公の活躍を書き留め、攻撃力を15秒間25%上げる。' }),
        CS({ lv: 40, name: '大斧旋風', type: 'nova', el: 'phys', r: 5.5, mult: 3.4, cd: 12, desc: '斧を振り回し、周囲を薙ぎ払う。' }),
        CS({ lv: 50, name: '最終章・星降る夜', type: 'rain', el: 'arcane', spots: 6, spread: 7, r: 5, mult: 3.2, delay: 0.9, meteor: true, cd: 18, desc: '小説の最終章さながらに、星を降らせる。' })
      ]
    },
    gareth: {
      name: 'ガレス', title: '守護者', en: 'GUARDIAN', gender: 'm', icon: '🛡', color: '#9ab8e8', hp: 2400, atk: 330, def: 520, spd: 0.9, style: 'melee', interval: 1.0, reach: 2.8, ang: 2.0, mult: 1.1, el: 'phys', wtype: 'sword',
      quote: 'この盾がある限り、あなたには傷ひとつ付けさせない。',
      desc: '元・サンドリアの近衛騎士。大盾で敵を引きつけ、仲間を守ることに誇りを持つ。',
      merit: ['HP・防御力が非常に高い', '敵の注意を引きつける'], demerit: ['攻撃力が低い', '移動速度 x0.9'],
      v: 2, dx: -18, dz: 14, cond: { dungeon: 2 }, condText: '砂塵の地下墓所を攻略すると仲間になる',
      look: { gender: 'm', main: '#3a4a6a', sub: '#d8dce4', accent: '#d8b45a', pants: '#2a3040', boots: '#3a3e4a', hair: '#8a5a3a', armor: '#9aa2b0', knightHelm: '#8a8e98', plume: '#3a6ad8', cape: '#2a3a6a', weapon: { type: 'sword', blade: '#d8dde4' }, offhand: { type: 'shield' } },
      lines: { before: ['地下墓所の砂王が暴れるせいで、近衛の任を解かれてしまった……。', '砂王を討つほどの者がいるなら、この盾を捧げたいものだ。'], join: ['砂王スコルピオスを討ったのか……！ 見事だ。', 'この盾がある限り、あなたには傷ひとつ付けさせない。', '近衛騎士ガレス、今日からあなたの盾となろう。'] },
      skills: [
        CS({ lv: 10, name: '挑発の雄叫び', type: 'taunt', r: 12, dur: 6, def: 0.3, cd: 14, desc: '雄叫びで周囲の敵を引きつけ、自身の防御力を上げる。' }),
        CS({ lv: 20, name: '盾打ち', type: 'nova', el: 'phys', r: 3.6, mult: 2.4, stun: 1.5, cd: 8, desc: '盾で殴りつけ、周囲の敵をひるませる。' }),
        CS({ lv: 30, name: '鉄壁の陣', type: 'buff', stat: 'def', val: 0.5, dur: 12, cd: 24, desc: '主人公の防御力を12秒間50%上げる。' }),
        CS({ lv: 40, name: '突撃', type: 'charge', el: 'phys', w: 2.4, mult: 3.0, cd: 10, desc: '盾を構えて敵へ突進する。' }),
        CS({ lv: 50, name: '不落の城壁', type: 'taunt', r: 16, dur: 9, def: 0.7, heal: 0.3, cd: 26, desc: '敵をまとめて引きつけ、自身のHPを30%回復する。' })
      ]
    },
    rine: {
      name: 'リーネ', title: '狩猟者', en: 'HUNTRESS', gender: 'f', icon: '🏹', color: '#9cd08a', hp: 1500, atk: 520, def: 220, spd: 1.1, style: 'ranged', interval: 1.1, range: 22, speed: 34, mult: 1.1, el: 'phys', look: 'arrow', wtype: 'bow',
      quote: '獲物は逃さない。……あなたの背中は、わたしが守る。',
      desc: '雪の里フロストヘイムの狩人。遠くの獲物も一矢で仕留める弓の名手。口数は少ないが情に厚い。',
      merit: ['攻撃力が高い', '遠くから攻撃できる', '移動速度 x1.1'], demerit: ['HP・防御力が低い'],
      v: 3, dx: -18, dz: 14, cond: { level: 32 }, condText: 'Lv.32以上で話しかけると仲間になる',
      look: { gender: 'f', main: '#3a5a3a', sub: '#c8b890', accent: '#a0c070', pants: '#2a3a2a', boots: '#4a3a2a', hair: '#c8783a', eye: '#7ac06a', cape: '#2a4a2a', headband: '#a0c070', weapon: { type: 'bow' } },
      lines: { before: ['……氷原の獣は手強い。半端な腕じゃ、背中は預けられない。', '（Lv.32になったら、もう一度話しかけよう）'], join: ['……いい目をしてる。', '獲物は逃さない。……あなたの背中は、わたしが守る。'] },
      skills: [
        CS({ lv: 10, name: '三連矢', type: 'volley', el: 'phys', n: 3, spread: 0.25, speed: 36, mult: 1.4, look: 'arrow', cd: 6, desc: '三本の矢を同時に放つ。' }),
        CS({ lv: 20, name: '氷結の矢', type: 'volley', el: 'ice', n: 1, speed: 38, mult: 2.8, pierce: true, status: 'slow', look: 'icearrow', cd: 8, desc: '敵を貫き鈍らせる氷の矢。' }),
        CS({ lv: 30, name: '矢の雨', type: 'rain', el: 'phys', spots: 1, r: 5, ticks: 5, interval: 0.35, mult: 1.1, delay: 0.4, cd: 11, desc: '敵の頭上に矢の雨を降らせる。' }),
        CS({ lv: 40, name: '狩人の集中', type: 'buff', stat: 'atk', val: 0.2, dur: 12, cd: 22, desc: '主人公の攻撃力を12秒間20%上げる。' }),
        CS({ lv: 50, name: '流星射ち', type: 'volley', el: 'light', n: 7, spread: 0.9, speed: 30, mult: 1.8, homing: true, look: 'arrow', cd: 14, desc: '追尾する光の矢を七本放つ。' })
      ]
    },
    piko: {
      name: 'ピコ', title: '発明者', en: 'INVENTOR', gender: 'f', icon: '🔧', color: '#ffb84a', hp: 1650, atk: 450, def: 260, spd: 1.0, style: 'melee', interval: 1.1, reach: 2.6, ang: 1.8, mult: 1.25, el: 'phys', wtype: 'club',
      quote: 'ピコの発明品で、冒険をもっと楽しくしちゃうよ！',
      desc: 'ボルカ前哨基地に住み込む天才発明家。巨大なレンチを振り回し、手作りの爆弾やドローンで戦う。',
      merit: ['爆弾で広い範囲を攻撃できる', '回復ドローンを飛ばせる'], demerit: ['ときどき発明が暴走する（気がする）'],
      v: 4, dx: -18, dz: 14, cond: {}, condText: '話しかけると仲間になる',
      look: { gender: 'f', main: '#d8902a', sub: '#3a3a4a', accent: '#4ad8ff', pants: '#3a3a4a', boots: '#5a3a2a', hair: '#ff8ab0', eye: '#4ad8ff', hairAcc: '#4ad8ff', belt: '#5a3a2a', weapon: { type: 'club', blade: '#9aa2b0' } },
      lines: { before: [], join: ['あっ！ キミが噂の転生者でしょ？ ピコ、ずーっと会いたかったんだ！', 'ピコの発明品で、冒険をもっと楽しくしちゃうよ！', 'え、危ない？ だいじょぶだいじょぶ、たぶん爆発しないから！'] },
      skills: [
        CS({ lv: 10, name: 'ポケット爆弾', type: 'bomb', el: 'fire', r: 3.6, mult: 2.6, cd: 7, desc: '敵に向かって手作り爆弾を投げる。' }),
        CS({ lv: 20, name: '回復ドローン', type: 'heal', pct: 0.15, cd: 15, desc: 'ドローンを飛ばし、主人公と仲間のHPを15%回復する。' }),
        CS({ lv: 30, name: '電撃トラップ', type: 'rain', el: 'thunder', spots: 1, r: 5, ticks: 4, interval: 0.4, mult: 1.1, delay: 0.3, cd: 12, desc: '敵の足元に電撃の罠を仕掛ける。' }),
        CS({ lv: 40, name: 'ジェットハンマー', type: 'nova', el: 'phys', r: 4.6, mult: 3.2, cd: 10, desc: 'ジェット噴射の勢いでハンマーを叩きつける。' }),
        CS({ lv: 50, name: '超大型ロケット', type: 'bomb', el: 'fire', r: 7, mult: 6, cd: 20, desc: '超大型ロケットで敵をまとめて吹き飛ばす。' })
      ]
    },
    aria: {
      name: 'アリア', title: '演奏者', en: 'BARD', gender: 'f', icon: '♪', color: '#ff9ec4', hp: 1700, atk: 360, def: 300, spd: 1.0, style: 'ranged', interval: 1.3, range: 18, speed: 26, mult: 0.95, el: 'arcane', look: 'orb', wtype: 'staff', ch: 2,
      quote: 'わたしの歌で、あなたの旅にメロディーを。',
      desc: '天嶺の里で歌う吟遊詩人。歌声で仲間を癒やし、勇気づける。指揮杖から音の弾を放って戦う。',
      merit: ['回復と強化が得意', '遠くから攻撃できる'], demerit: ['攻撃力が低い'],
      v: 5, dx: -18, dz: 14, cond: {}, condText: '第二章で話しかけると仲間になる',
      look: { gender: 'f', main: '#e86a9a', sub: '#fff0f6', accent: '#ffd27a', pants: '#c84a7a', boots: '#fff0f6', hair: '#7fd8ff', eye: '#ff9ec4', cape: '#c84a7a', weapon: { type: 'staff', glow: '#ff9ec4' } },
      lines: { before: [], join: ['あら、新しい大地を旅する冒険者さん？', 'あなたの旅、とても素敵な歌になりそう。わたしも一緒に行っていい？', 'わたしの歌で、あなたの旅にメロディーを。'] },
      skills: [
        CS({ lv: 10, name: '癒しのアリア', type: 'heal', pct: 0.18, cd: 12, desc: '癒やしの歌で、主人公と仲間のHPを18%回復する。' }),
        CS({ lv: 20, name: '勇気の行進曲', type: 'buff', stat: 'atk', val: 0.3, dur: 15, cd: 24, desc: '主人公の攻撃力を15秒間30%上げる。' }),
        CS({ lv: 30, name: '音の衝撃波', type: 'nova', el: 'arcane', r: 6, mult: 2.8, knock: 6, cd: 10, desc: '高音の衝撃波で周囲の敵を吹き飛ばす。' }),
        CS({ lv: 40, name: '安らぎの子守唄', type: 'nova', el: 'arcane', r: 8, mult: 1.5, status: 'slow', cd: 14, desc: '子守唄で周囲の敵の動きを鈍らせる。' }),
        CS({ lv: 50, name: 'フィナーレ', type: 'rain', el: 'light', spots: 6, spread: 6, r: 4.5, mult: 3.0, delay: 0.7, cd: 18, desc: '光の音符を降らせる大フィナーレ。' })
      ]
    },
    nox: {
      name: 'ノクス', title: '星詠者', en: 'ASTROLOGER', gender: 'm', icon: '☾', color: '#b0b8ff', hp: 1600, atk: 560, def: 240, spd: 0.95, style: 'ranged', interval: 1.4, range: 24, speed: 28, mult: 1.2, el: 'arcane', look: 'orb', wtype: 'staff', ch: 2,
      quote: '星の配置が告げている。君と共に行け、と。',
      desc: '極光の村に住む星詠みの魔導士。星の巡りを読み、星そのものを降らせる強力な魔法を操る。',
      merit: ['攻撃力が非常に高い', '星の魔法で広範囲を攻撃'], demerit: ['HP・防御力が低い', '移動速度 x0.95'],
      v: 7, dx: -18, dz: 14, cond: {}, condText: '第二章で話しかけると仲間になる',
      look: { gender: 'm', main: '#1e2448', sub: '#c8d0f0', accent: '#ffd27a', pants: '#141a30', boots: '#1e2448', hair: '#e8f0ff', eye: '#ffe8a0', hat: 'wizard', cape: '#141838', capeLong: true, weapon: { type: 'staff', glow: '#ffe8a0' } },
      lines: { before: [], join: ['……来たか。待っていたよ、星に選ばれし者。', '星の配置が告げている。君と共に行け、と。', '安心したまえ。私の星読みは外れたことがない……多分ね。'] },
      skills: [
        CS({ lv: 10, name: '星屑の弾', type: 'volley', el: 'arcane', n: 5, spread: 0.7, speed: 26, mult: 0.95, homing: true, look: 'orb', cd: 6, desc: '追尾する星屑の弾を五発放つ。' }),
        CS({ lv: 20, name: '流星', type: 'rain', el: 'arcane', spots: 1, r: 6, mult: 4.2, delay: 1.0, meteor: true, cd: 10, desc: '敵の頭上に流星を落とす。' }),
        CS({ lv: 30, name: '星の加護', type: 'buff', stat: 'def', val: 0.35, dur: 12, cd: 22, desc: '主人公の防御力を12秒間35%上げる。' }),
        CS({ lv: 40, name: '星座結界', type: 'nova', el: 'arcane', r: 7, mult: 3.5, cd: 12, desc: '星座の結界で周囲の敵を打ち据える。' }),
        CS({ lv: 50, name: '星降る夜', type: 'rain', el: 'arcane', spots: 8, spread: 8, r: 5, mult: 3.6, delay: 1.0, meteor: true, cd: 20, desc: '無数の星を降らせる大魔法。' })
      ]
    }
  };
  D.COMP_ORDER = ['serena', 'roland', 'gareth', 'rine', 'piko', 'aria', 'nox'];
  D.PARTY_MAX = 2;
  D.COMP_GROW = 0.9; // レベルアップ時の上昇量（主人公比）
  // Lv.10ごとにスキル習得（Lv.60以降は強化版「極」を習得）
  D.compSkills = function (id) {
    const base = D.COMPANIONS[id].skills, out = base.map((s, i) => Object.assign({ id: id + i, slot: i }, s));
    for (let i = 0; i < 5; i++) { const b = base[i]; out.push(Object.assign({}, b, { id: id + (i + 5), slot: i, lv: 60 + i * 10, name: b.name + '・極', mult: b.mult ? b.mult * 1.9 : b.mult, pct: b.pct ? Math.min(0.4, b.pct * 1.5) : b.pct, val: b.val ? b.val * 1.4 : b.val, cd: b.cd * 0.85, desc: b.desc + '（強化版）' })); }
    return out;
  };

  // ---------------- サポートモンスター ----------------
  D.SUPPORT = {
    fuwarin: {
      name: 'フワリン', icon: '☁', color: '#cfe8ff', en: 'FUWARIN',
      desc: '雲の集まりから生まれた妖精。とにかく本当にめちゃくちゃかわいい。相手が努力を積み上げて美しく成長していくのが大好きで、最初から強い力を持たない人にとっても憧れ、手伝ってくれる。最初から特殊なチカラを持っている俊足者・飛翔者のことは、嫌いではないけれど自分には合わないと思っている。',
      effect: '相性によって主人公の最初のステータスが変わる（相性良：x1.2 ／ 相性普通：変化なし ／ 相性悪：x0.9）',
      compat: { adventurer: 'good', miner: 'good', mage: 'good', awakener: 'good', honest: 'good', sprinter: 'bad', flyer: 'bad', healer: 'bad' },
      where: '星風平原「風車の丘」', x: -158, z: 190
    },
    lumi: {
      name: 'ルミ', icon: '✧', color: '#ffe58a', en: 'LUMI',
      desc: '人々を応援するのが大好きな光の妖精。だれとでも相性に関係なく仲良くなれる。人間の言葉を習得しているので、話し相手としても最適。',
      effect: 'ダメージを受けている時に R キー（スマホは✧ボタン）を押すと、HPを10%回復（クールタイム10秒）',
      compat: {}, where: 'スターリーフ村の広場', v: 0, dx: 14, dz: -3
    }
  };
  D.SUPPORT_ORDER = ['fuwarin', 'lumi'];
  D.COMPAT = { good: { mul: 1.2, name: '相性良', c: '#7ff0b0' }, normal: { mul: 1.0, name: '相性普通', c: '#cfd8ea' }, bad: { mul: 0.9, name: '相性悪', c: '#ff9a8a' } };
  D.compatOf = (sup, pers) => (sup === 'fuwarin' ? (D.SUPPORT.fuwarin.compat[pers] || 'normal') : 'good');
  // フワリンの話し方：肯定「ふわぁ...（）」疑問「ふわぁ..?（）」否定「わぁ..のーのー（）」
  D.FUWA_LINES = {
    meet: ['ふわぁ..?（だれ？ あたらしい おともだち？）'],
    good: ['ふわぁ...（あなた、すごく がんばりやさんの においがする）', 'ふわぁ...（いっしょに いっても いい？ ずっと おうえんするね）'],
    bad: ['わぁ..のーのー（あなた、さいしょから とくべつな ちから もってる……）', 'ふわぁ..?（きらいじゃ ないよ。でも フワリンとは あわないかも……それでも いい？）'],
    idle: ['ふわぁ...（きょうも いい てんき）', 'ふわぁ..?（あっちに なにか あるのかな？）', 'ふわぁ...（くもの うえって ふかふかなんだよ）', 'ふわぁ..?（おなか すいてない？）', 'ふわぁ...（いっしょだと たのしいね）'],
    levelup: ['ふわぁ...（すごい！ またひとつ つよくなったね）', 'ふわぁ...（がんばった ぶんだけ きれいに なってる）'],
    lowhp: ['わぁ..のーのー（むりは しないで！）', 'わぁ..のーのー（にげて！ いまは あぶないよ）'],
    boss: ['ふわぁ..?（あれ……すごく おおきい……）', 'わぁ..のーのー（こわい……でも フワリン、そばに いるよ）'],
    dungeon: ['ふわぁ..?（くらいところ……だいじょうぶ？）'],
    chest: ['ふわぁ...（きらきら！ いいもの はいってた？）'],
    region: ['ふわぁ...（あたらしい ばしょだ！）']
  };
  D.LUMI_LINES = {
    meet: ['あっ、こんにちは！ わたしはルミ。光の妖精だよ！'],
    join: ['みんなを応援するのが、わたしの一番好きなこと！', 'あなたの冒険、そばで応援させて！ 困ったら R キーを押してね、すぐ元気にしてあげる！'],
    idle: ['ねえねえ、次はどこへ行く？', 'あなたと一緒だと、毎日がキラキラだね！', '疲れたら休んでもいいんだよ？', 'ふふっ、今日もがんばってるね！', 'この島って、どこも本当にきれい！'],
    levelup: ['レベルアップおめでとう！ すごいすごい！', 'また強くなったね！ さすが！'],
    lowhp: ['危ないよ！ R キーで回復して！', 'がんばって！ まだ負けないで！'],
    heal: ['はい、元気になーれ！', 'がんばって！ あなたならできる！', 'ナイスファイト！ 回復するね！'],
    boss: ['すっごく強そう……でも、あなたなら勝てる！'],
    dungeon: ['暗いところでも、わたしが照らしてあげる！'],
    chest: ['やったね！ 何が入ってたの？'],
    region: ['わあ、はじめて来る場所だ！']
  };

  // ---------------- 第二章の村・NPC ----------------
  D.NPCS.push(
    // 仲間（勧誘）
    ...D.COMP_ORDER.map(id => { const c = D.COMPANIONS[id]; return { id: 'c_' + id, v: c.v, name: c.title + ' ' + c.name, role: 'recruit', comp: id, dx: c.dx, dz: c.dz, look: c.look, ch: c.ch || 1 }; }),
    // 天嶺の里 ハイランド（平原超山）
    { id: 'hal', v: 5, ch: 2, name: '里長ハルト', role: 'talk', dx: -4, dz: 6, look: { gender: 'm', main: '#4a7a3a', sub: '#e8f0d8', hair: '#d8d8d8', accent: '#7fd8ff', cape: '#3a5a2a', capeLong: true }, lines: ['ようこそ、天嶺の里ハイランドへ。この大地は長いあいだ雲の下に眠っていたのです。', '東にそびえる天穹山……その頂には、星を喰らう竜が封じられているという言い伝えがあります。', '里の北東、「天空回廊」には星界の騎士が目覚めたとか。どうかお気をつけて。'] },
    { id: 'shop5', v: 5, ch: 2, name: '行商人テオ', role: 'shop', shop: ['skyberry', 'potion', 'hipotion', 'elixir', 's_sky', 'a_sky', 't_sky'], look: { gender: 'm', main: '#5a8ac0', sub: '#f2e8d8', hair: '#c8a87a', accent: '#f2c94a' } },
    { id: 'q5', v: 5, ch: 2, name: '羊飼いメル', role: 'quest', quest: 'sq_bison', dx: 18, dz: -10, look: { gender: 'f', main: '#e8e0c8', sub: '#7a9a5a', hair: '#e8c87a', accent: '#ff9ec4' } },
    // 岩窟都市 カラバン（乾燥砂漠）
    { id: 'kar', v: 6, ch: 2, name: '首長ザイード', role: 'talk', dx: -4, dz: 6, look: { gender: 'm', main: '#7a4ab0', sub: '#e8d8b0', hair: '#1a1a1a', accent: '#ffd27a', skin: '#b88a64', cape: '#5a3a8a' }, lines: ['岩窟都市カラバンへようこそ、旅の方。', '南の「蜃気楼の大空洞」では、砂の魔人が幻を操っているという。', 'あの空洞は高い岩棚だらけ……跳ぶ力がなければ、奥へは進めんだろうな。'] },
    { id: 'shop6', v: 6, ch: 2, name: '宝石商ラシード', role: 'shop', shop: ['datefruit', 'potion', 'hipotion', 'elixir', 's_mirage', 'a_mirage', 't_mirage'], look: { gender: 'm', main: '#c8902a', sub: '#f2e8d0', hair: '#1a1a1a', accent: '#a06ad8', skin: '#b88a64' } },
    { id: 'q6', v: 6, ch: 2, name: '墓守ナディア', role: 'quest', quest: 'sq_mummy', dx: 18, dz: -10, look: { gender: 'f', main: '#3a2a4a', sub: '#e8d8b0', hair: '#2a1a12', accent: '#ffd27a', skin: '#c89a74' } },
    // 極光の村 ノルドリヒト（極光雪原）
    { id: 'nor', v: 7, ch: 2, name: '巫女オーロラ', role: 'talk', dx: -4, dz: 6, look: { gender: 'f', main: '#e8f0ff', sub: '#b07aff', hair: '#7fffd0', accent: '#7fffd0', cape: '#c8b0ff', capeLong: true }, lines: ['極光の村ノルドリヒトへ、よくぞ。空の光が、あなたの来訪を告げていました。', '北の「霧氷の地下洞」……極光の魔狼が、目覚めの時を待っています。', 'あの洞窟は深い谷ばかり。翼を持たぬ者には、底へ降りることすら叶わぬでしょう。'] },
    { id: 'shop7', v: 7, ch: 2, name: '毛皮商イヴァン', role: 'shop', shop: ['aurorapeach', 'potion', 'hipotion', 'elixir'], look: { gender: 'm', main: '#5a4a6a', sub: '#e8e0d0', hair: '#c8a87a', accent: '#c8dceb' } },
    { id: 'q7', v: 7, ch: 2, name: '研究者ヘルガ', role: 'quest', quest: 'sq_crystal', dx: 18, dz: -10, look: { gender: 'f', main: '#7fb8e8', sub: '#ffffff', hair: '#3a2a4a', accent: '#b07aff' } },
    // 溶岩の砦 マグマリア（溶岩火山）
    { id: 'mag', v: 8, ch: 2, name: '砦長バルド', role: 'talk', dx: -4, dz: 6, look: { gender: 'm', main: '#4a3a3a', sub: '#ff7a3a', hair: '#e8e0d0', accent: '#ffb03a', helmet: '#3a3030' }, lines: ['マグマリアの砦へようこそ。ここは世界でいちばん熱い場所だ。', '北の「獄炎の坑道」に獄炎竜ヴォルカニクスが巣くっている。', '坑道は谷と岩棚の迷路だ。跳ぶ力と飛ぶ力、両方が要るって話だぜ。'] },
    { id: 'shop8', v: 8, ch: 2, name: '鍛冶師グレン', role: 'shop', shop: ['magmapepper', 'potion', 'hipotion', 'elixir'], look: { gender: 'm', main: '#3a2a2a', sub: '#ff7a3a', hair: '#c8402a', accent: '#ffb03a' } },
    { id: 'q8', v: 8, ch: 2, name: '坑夫ドルフ', role: 'quest', quest: 'sq_salamander', dx: 18, dz: -10, look: { gender: 'm', main: '#6a5a4a', sub: '#e8e0d0', hair: '#3a3a4a', accent: '#ffb03a', helmet: '#f2c23a' } }
  );

  // ---------------- 第二章のクエスト ----------------
  Object.assign(D.QUESTS, {
    mq4: { main: true, ch: 2, title: '浮上せし大地', desc: '星見山での戦いのあと、島の四方の海から新たな大地が浮かび上がった。スターリーフ村の長老マルクに話を聞こう。', obj: [{ type: 'talk', npc: 'marc', text: 'スターリーフ村の長老マルクと話す' }], reward: { coins: 5000, exp: 3000 }, next: 'mq5' },
    mq5: { main: true, ch: 2, title: '六つの隠された遺跡', desc: '新たな大地と旧き大地に、星界の遺跡が目覚めた。遺跡の主が守る「天星石」を六つ集めよう。遺跡のなかには、見つけにくい場所に隠されたものもあるという。', obj: [{ type: 'dungeon', id: 5, text: '天空回廊を攻略する（推奨Lv.62）' }, { type: 'dungeon', id: 10, text: '翠樹の根の洞を攻略する（推奨Lv.66）', hidden: '？？？ 翠樹の森の大樹の根元に、何かがあるらしい' }, { type: 'dungeon', id: 6, text: '蜃気楼の大空洞を攻略する（推奨Lv.70）' }, { type: 'dungeon', id: 9, text: '星見山の隠し洞窟を攻略する（推奨Lv.74）', hidden: '？？？ 星見山の中腹のどこかに、洞窟があるらしい' }, { type: 'dungeon', id: 7, text: '霧氷の地下洞を攻略する（推奨Lv.78）' }, { type: 'dungeon', id: 8, text: '獄炎の坑道を攻略する（推奨Lv.84）' }], reward: { coins: 200000, exp: 60000 }, next: 'mq6' },
    mq6: { main: true, ch: 2, title: '天穹の頂へ', desc: '六つの天星石が光の道を示している。平原超山にそびえる天穹山の頂へ向かい、星を喰らう竜を討て。', obj: [{ type: 'boss', id: 'astral', text: '天穹山の頂で星喰竜アストラを倒す（推奨Lv.92）' }], reward: { coins: 500000, exp: 0, weapon: 'tier9' }, next: null },
    sq_bison: { title: '暴れバイソン', giver: 'q5', ch: 2, desc: '羊たちを追い回す岩角バイソンを鎮めてほしいと頼まれた。', obj: [{ type: 'kill', what: 'rock_bison', n: 6, text: '岩角バイソンを倒す' }], reward: { coins: 60000, exp: 30000, items: [['hipotion', 2]] } },
    sq_mummy: { title: '眠れぬ王墓', giver: 'q6', ch: 2, desc: '墓所からさまよい出たミイラたちを眠らせてほしい。', obj: [{ type: 'kill', what: 'mummy', n: 8, text: '砂漠のミイラを倒す' }], reward: { coins: 80000, exp: 40000, items: [['hipotion', 2]] } },
    sq_crystal: { title: '晶霊の研究', giver: 'q7', ch: 2, desc: '極光の力を宿す晶霊を調べるため、6体ほど倒してきてほしい。', obj: [{ type: 'kill', what: 'crystal_spirit', n: 6, text: '晶霊を倒す' }], reward: { coins: 100000, exp: 52000, items: [['elixir', 2]] } },
    sq_salamander: { title: '坑道のサラマンダー', giver: 'q8', ch: 2, desc: '採掘場に住みついたサラマンダーを追い払ってほしい。', obj: [{ type: 'kill', what: 'salamander', n: 6, text: 'サラマンダーを倒す' }], reward: { coins: 120000, exp: 64000, items: [['elixir', 2]] } }
  });
  Object.assign(D.QUEST_TALK, {
    sq_bison: { offer: ['こんにちは、旅の人！ 岩角バイソンが群れで暴れて、羊たちが怯えているの。', '6頭ほど落ち着かせて……いえ、倒してきてくれない？'], done: ['ありがとう！ これで羊たちもぐっすり眠れるわ。'] },
    sq_mummy: { offer: ['王墓の眠りが破られ、ミイラたちが砂漠をさまよっています。', '8体ほど、もう一度眠らせてあげてください。'], done: ['王たちも、これで安らかに眠れるでしょう。感謝します。'] },
    sq_crystal: { offer: ['晶霊は極光の力が形になった存在なの。とても興味深いわ！', '研究のために6体ほど倒して、結晶を確かめさせて。'], done: ['素晴らしいサンプル！ 極光の謎にまた一歩近づけたわ。'] },
    sq_salamander: { offer: ['坑道にサラマンダーが住みついちまって、仕事にならねえんだ。', '6匹ほど追い払ってくれねえか？'], done: ['助かったぜ！ これで採掘を再開できる。'] }
  });
  Object.assign(D.MARC, {
    ch2first: ['おお……無事であったか！ 見たか、島の四方の海から大地がせり上がるのを。', 'あれは古い言い伝えにある「星界の大地」……星の欠片の力で、長い眠りから目覚めたのじゃろう。', '新たな大地と、この旧き島の奥深くに、星界の遺跡が六つ目覚めたと伝わっておる。', '遺跡の主が守る「天星石」を六つ集めれば、平原超山の天穹山の頂へ光の道が開かれる……。', '頂には、星そのものを喰らう竜が封じられておるそうじゃ。どうか、もう一度この島を救ってはくれんか。'],
    ch2mid: ['遺跡の攻略は順調かのう。遺跡のなかには、隠された場所にあるものもあるそうじゃ。', '旧き島の大樹の根元や、星見山の中腹……よく探してみるとよい。', '遺跡は長く険しい。仲間と力を合わせるのじゃぞ。'],
    ch2ready: ['六つの天星石が……光の道を示しておる！', '平原超山の天穹山へ向かいなさい。頂で、星喰竜が待っておる。'],
    ch2end: ['星喰竜を討ったか……！ あなたは二度もこの島を救ってくれた。', 'ステラリアの空に、また星が瞬いておる。本当に、本当にありがとう。']
  });
  D.CH2_INTRO = ['……{name}さん、聞こえますか？ ステラです。', '虚無の魔王を討ち、星の欠片が五つそろったことで……島に封じられていた大地が目を覚ましました。', '島の四方の海に、新たな大地が浮かび上がっています。', 'そして新旧の大地の奥深くで、星界の遺跡が六つ……。その奥には、とても強い力が眠っています。', 'まずはスターリーフ村の長老マルクを訪ねてください。あなたの旅は、まだ終わっていません――。'];

  // ---------------- 正直者の制限時間 ----------------
  D.HONEST = { questLimit: 600, roomTime: 80, dungeonBase: 240 };

  // ---------------- お知らせ ----------------
  D.NEWS = [
    {
      ver: 'Beta v1.0.5', date: '2026.11.13', title: 'たくさんアップデート', tag: '大型アップデート', items: [
        ['🗺', '新エリア4つ', '「平原超山」「乾燥砂漠」「極光雪原」「溶岩火山」を追加。第一章をクリアすると島が広がり、新エリアが解放されます（第一章をクリアするまでは解放されず、島も広がりません）。'],
        ['📖', '第二章', '第一章クリア後に第二章が開幕。新旧のエリアに眠る6つの遺跡は高難易度の長編ダンジョン。遺跡の中だけで使える「風切りの羽」で飛んで下の敵を倒したり、「跳躍の靴」で高い足場に跳び乗って攻撃しよう。山の中腹など、見つけにくい場所に隠された遺跡もあります。'],
        ['⚖', '新人格「正直者」', '初期装備は剣。最初からステータスが高く足も速い（HP1920／攻撃力410／防御力290／移動速度x1.1）。ただしダンジョンとミッションに制限時間があり、報酬・獲得経験値は25%減少。Lv.10ごとにスキルを習得。'],
        ['🤝', '旅の仲間', '聖職者セレナ、著名者ロランをはじめ、7人の仲間が各地に登場。最大2人まで連れて行けます（P キー／メニュー「仲間」）。仲間はLv.10ごとにスキルを習得します。'],
        ['☁', 'サポートモンスター', '雲の妖精「フワリン」と光の妖精「ルミ」が登場。主人公のまわりをふわふわ飛んでついてきます。フワリンは人格との相性で初期ステータスが変化、ルミは R キーでHPを10%回復してくれます。'],
        ['✦', 'その他', '最大レベルを100に拡張／お知らせ欄を追加／ロード画面にアップデート情報を表示／新しい武器・食べ物・敵・ボスを多数追加']
      ]
    },
    {
      ver: 'Beta v1.0.0', date: '2026.11.12', title: 'ベータ版 初回ビルド', tag: '初回', items: [
        ['🌟', 'ゲーム本編', '7つの人格・5つの地方・5つの迷宮と最終ボスを収録した第一章。'],
        ['🎨', 'UI', 'オリジナルUI「星図（アストラル）」デザイン。']
      ]
    }
  ];
  D.TIPS.push(
    '旅の仲間は最大2人まで連れて行けます。P キーで仲間の画面を開けます。',
    'フワリンは人格との相性で、主人公の初期ステータスを変えてくれます。',
    'ルミを連れているときは、ダメージを受けたら R キーでHPを10%回復できます。',
    '第二章の遺跡では、空中でジャンプすると「風切りの羽」で飛べます（羽を手に入れた後）。',
    '「跳躍の靴」を履くと、高い足場に跳び乗れます。上から攻撃すると大ダメージ！',
    '高いところから落下攻撃をすると、高さに応じてダメージが大きくなります。',
    '正直者はダンジョンとミッションに制限時間があります。時間に注意しよう！'
  );
})(window.PS);
