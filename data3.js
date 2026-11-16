// Beta v1.0.10 大型アップデート：第三章・新人格・新サポートキャラ・旅の仲間
(function (PS) {
  'use strict';
  const D = PS.DATA;
  D.VERSION = '1.0.10';
  D.VERSION_LABEL = 'Beta v1.0.10';

  // ================= 新人格 =================
  Object.assign(D.PERS, {
    hearer: {
      name: '超聴者', en: 'HEARER', icon: '♪', color: '#3ad0c0', hp: 1800, atk: 390, def: 280, spd: 0.9, weapons: ['sword'], start: 's_start', every: 10, hearer: true,
      desc: '剣を初期装備。耳がとても良く、かなり小さな音まで聞き分けられる。敵の攻撃や飛び道具が迫ると、その方向が画面の縁にマークで表示される。ただし歩く速度が少し遅い。',
      merit: ['攻撃・飛び道具・接近してくる敵の方向が画面の縁に表示される', '近くの宝箱や隠された遺跡の「音」も聞こえる', 'Lv.10ごとにスキルを習得'], demerit: ['移動速度 x0.9'],
      look: { main: '#1e4a52', sub: '#e8f4f0', accent: '#3ad0c0', pants: '#22303a', boots: '#3a2a22', scarf: '#3ad0c0', eye: '#7fffe8', hairAcc: '#3ad0c0', cape: '#16363c' }
    },
    prophet: {
      name: '予言者', en: 'PROPHET', icon: '◉', color: '#c890ff', hp: 1550, atk: 390, def: 160, spd: 0.9, weapons: ['axe'], start: 'a_start', every: 10, prophet: true,
      desc: '斧を初期装備。その目には数秒後の未来が見え、敵がこれから繰り出す攻撃と、命中までの時間がわかる。ただしステータスは全体的に低い。……斧を持っているぶん、まぁ、良い方なのかもしれない。',
      merit: ['敵の次の攻撃と、命中までの秒数が見える', '斧を初期装備（一撃が重い）', 'Lv.10ごとにスキルを習得'], demerit: ['ステータスが全体的に低い', '移動速度 x0.9'],
      look: { main: '#2e2448', sub: '#e8e0f8', accent: '#c890ff', pants: '#1e1a30', boots: '#2a2240', eye: '#ff9ef0', hairAcc: '#c890ff', cape: '#3a2a5a', capeLong: true }
    }
  });
  D.PERS_ORDER.push('hearer', 'prophet');
  const S = (o) => o;
  D.SKILLS.hearer = [
    S({ id: 'hr1', lv: 10, name: '音速斬り', type: 'dash', el: 'wind', dist: 10, w: 2.3, mult: 2.6, cd: 6, desc: '音の速さで踏み込み、触れた敵を斬る。' }),
    S({ id: 'hr2', lv: 20, name: '共鳴の波紋', type: 'nova', el: 'wind', r: 6, mult: 3.0, knock: 5, cd: 9, desc: '剣を鳴らして衝撃の波紋を広げ、周囲の敵を吹き飛ばす。' }),
    S({ id: 'hr3', lv: 30, name: '聴音の構え', type: 'buff', stat: 'def', val: 0.5, dur: 14, cd: 22, heal: 0.1, desc: '14秒間防御力が50%上昇し、HPを10%回復する。' }),
    S({ id: 'hr4', lv: 40, name: '残響剣', type: 'proj', el: 'wind', n: 3, spread: 0.35, speed: 28, size: 1.6, pierce: true, range: 26, mult: 2.4, cd: 9, look: 'blade', desc: '残響する三つの斬撃を飛ばす。' }),
    S({ id: 'hr5', lv: 50, name: '音叉の旋舞', type: 'spin', el: 'wind', r: 4.4, dur: 2.4, ticks: 8, mult: 0.95, cd: 11, desc: '音叉のように剣を震わせて回転し、周囲を斬り刻む。' }),
    S({ id: 'hr6', lv: 60, name: '鼓動の加速', type: 'buff', stat: 'atk', val: 0.55, dur: 15, cd: 28, extraStat: { spd: 0.2 }, desc: '15秒間、攻撃力55%・移動速度20%上昇。' }),
    S({ id: 'hr7', lv: 70, name: '轟音の連斬', type: 'multi', el: 'wind', count: 4, sub: { type: 'dash', dist: 7, w: 2.6, mult: 2.8 }, cd: 15, desc: '轟音とともに四度、敵を斬り抜ける。' }),
    S({ id: 'hr8', lv: 80, name: '超音波の雨', type: 'rain', el: 'wind', spots: 7, spread: 7, r: 5, ticks: 1, delay: 0.6, mult: 5.2, cd: 18, desc: '超音波の柱を降らせ、敵をまとめて打ち砕く。' }),
    S({ id: 'hr9', lv: 90, name: '無音の一撃', type: 'leap', el: 'wind', r: 7, mult: 7.2, range: 14, cd: 16, desc: '一切の音を消して跳び、敵の頭上から斬り下ろす。' }),
    S({ id: 'hr10', lv: 100, name: '天籟の終止符', type: 'nova', el: 'wind', r: 13, mult: 22, cd: 35, desc: '天の音色を一点に集め、すべてを鳴り止ませる。超聴者の到達点。' })
  ];
  D.SKILLS.prophet = [
    S({ id: 'pp1', lv: 10, name: '予見の一撃', type: 'arc', el: 'arcane', r: 4.6, ang: 2.6, mult: 2.8, cd: 7, desc: '見えた未来の通りに斧を振るい、前方を薙ぎ払う。' }),
    S({ id: 'pp2', lv: 20, name: '未来視の守り', type: 'buff', stat: 'def', val: 0.6, dur: 12, cd: 20, heal: 0.15, desc: '12秒間防御力が60%上昇し、HPを15%回復する。' }),
    S({ id: 'pp3', lv: 30, name: '運命の投斧', type: 'proj', el: 'arcane', n: 1, speed: 22, size: 2.4, pierce: true, range: 22, mult: 4.4, cd: 9, look: 'axe', ret: true, desc: '運命をなぞるように斧を投げ、往復で敵を断つ。' }),
    S({ id: 'pp4', lv: 40, name: '確定未来', type: 'buff', stat: 'atk', val: 0.5, dur: 15, cd: 26, desc: '勝利の未来を確定させ、15秒間攻撃力が50%上昇する。' }),
    S({ id: 'pp5', lv: 50, name: '星詠みの落斧', type: 'leap', el: 'arcane', r: 6.5, mult: 5.6, range: 14, cd: 13, desc: '星の導きで跳び上がり、敵の頭上に斧を落とす。' }),
    S({ id: 'pp6', lv: 60, name: '予言の雨', type: 'rain', el: 'arcane', spots: 6, spread: 6, r: 4.5, ticks: 2, interval: 0.4, delay: 0.5, mult: 3.2, cd: 14, desc: '予言どおりの場所に魔力の雨を降らせる。' }),
    S({ id: 'pp7', lv: 70, name: '時読みの大旋回', type: 'spin', el: 'arcane', r: 5, dur: 2.8, ticks: 10, mult: 1.05, cd: 12, desc: '時の流れを読み、斧を大きく振り回し続ける。' }),
    S({ id: 'pp8', lv: 80, name: '因果断ち', type: 'multi', el: 'arcane', count: 4, sub: { type: 'dash', dist: 7, w: 2.6, mult: 3.0 }, cd: 16, desc: '敵の因果を断つように、四度斬り抜ける。' }),
    S({ id: 'pp9', lv: 90, name: '終末の予兆', type: 'rain', el: 'arcane', spots: 8, spread: 9, r: 5.5, ticks: 1, delay: 1.0, mult: 7.6, cd: 24, meteor: true, desc: '予言された終末の星を降らせる。' }),
    S({ id: 'pp10', lv: 100, name: '未来改変', type: 'nova', el: 'arcane', r: 13, mult: 22, cd: 35, desc: '見えた未来そのものを書き換える一撃。予言者の到達点。' })
  ];
  // 予言者：未来が見える時間（秒）
  D.FORESIGHT = 1.6;

  // ================= サポートキャラ（2体まで） =================
  D.SUPPORT_MAX = 2;
  D.SUPPORT.fuwarin.compat.hearer = 'good';
  D.SUPPORT.fuwarin.compat.prophet = 'bad';
  D.SUPPORT.fuwarin.def = 'normal';
  D.SUPPORT.lumi.def = 'good';
  D.SUPPORT.fuwarin.eff = { good: '初期ステータス x1.2', normal: 'ステータスに変化なし', bad: '初期ステータス x0.9' };
  D.SUPPORT.lumi.eff = { good: 'R キーでHP10%回復（10秒ごと）' };
  Object.assign(D.SUPPORT, {
    arulu: {
      name: 'アルル', icon: '✺', color: '#ff9a5a', en: 'ARURU',
      desc: '相手がすでに持っている「チカラ」にとても強く影響する妖精。俊足者・飛翔者・予言者のように、生まれつき特別な力を持つ人にはその力を貸して何倍にも高めてくれる。逆に、最初から力を持っていない人には力を貸す意味がないと思っていて、少し意地悪をしてしまう。人間の言葉はかなり上達している。',
      effect: '相性良：主人公が持っている人格の効果を2倍にする（俊足者の速さ・飛翔者の飛行時間・予言者の未来視）。レベルアップ時の効果はなし。／相性悪：主人公の移動速度が5%低下',
      compat: { sprinter: 'good', flyer: 'good', prophet: 'good' }, def: 'bad',
      eff: { good: '人格の効果 x2', bad: '移動速度 -5%' },
      where: 'モリノハ集落のはずれ', v: 1, dx: -18, dz: 16
    },
    star: {
      name: 'スター', icon: '★', color: '#ffd84a', en: 'STAR',
      desc: '昔、消えかけていたところを覚醒者に助けられた星の妖精。そのことにとても感謝していて、覚醒者の力がこれからも消えないように受け継ごうと、自分自身も一生けんめい頑張っている。負けず嫌いで、とても勇気がある。人間の言葉はまだあまり上達していない。',
      effect: '相性良（覚醒者）：覚醒時間を5%延長（Lv.10アップごとに延長が+2%）。／相性悪：効果なし',
      compat: { awakener: 'good' }, def: 'bad',
      eff: { good: '覚醒時間 +5%（Lv.10ごとに+2%）', bad: '効果なし' },
      where: 'ボルカ前哨基地', v: 4, dx: 18, dz: 14
    },
    marun: {
      name: 'マルン', icon: '❀', color: '#8ad0ff', en: 'MARUN',
      desc: '遠距離の武器や重い武器と、そのサポートの仕方を学ぶために旅をしている妖精。勉強も兼ねて、主人公にHP増強の魔法をかけてくれる。中立派なので、どんな武器の人にも優しく接してくれる。人間の言葉はいちおう話せる。',
      effect: '相性良（魔術者・予言者・採掘者）：HP +5%。／相性普通：HP +3%。（レベルアップ時の効果はなし）',
      compat: { mage: 'good', prophet: 'good', miner: 'good' }, def: 'normal',
      eff: { good: 'HP +5%', normal: 'HP +3%' },
      where: 'オアシス都市サンドリア', v: 2, dx: -20, dz: -12
    }
  });
  D.SUPPORT_ORDER.push('arulu', 'star', 'marun');
  D.COMPAT.normal.name = '相性普通';
  D.compatOf = (sup, pers) => { const S2 = D.SUPPORT[sup]; return (S2.compat && S2.compat[pers]) || S2.def || 'normal'; };
  D.supEffect = (sup, pers) => { const S2 = D.SUPPORT[sup], c = D.compatOf(sup, pers); return (S2.eff && (S2.eff[c] || S2.eff.good)) || ''; };
  D.ARULU_LINES = {
    meet: ['あら、旅のお方。わたしはアルル。あなたの「チカラ」……ちょっと見せてくださる？'],
    good: ['まあ！ あなた、生まれつきのチカラを持っているのね。素敵だわ。', 'わたしがそのチカラを、もっともっと大きくしてあげる。'],
    bad: ['……ふうん。あなたには、わたしが貸せるようなチカラがないみたい。', 'それでも一緒に来たいなら、止めはしないけれど……少し足が重くなっても知らないわよ？'],
    idle: ['チカラはね、使えば使うほど輝くものなのよ。', '退屈ね……何か面白いもの、見つけてくださる？', 'あなたの歩き方、少しずつ様になってきたわね。'],
    levelup: ['あら、また強くなったのね。悪くないわ。'], lowhp: ['ちょっと！ 無理はしないで！'], boss: ['大きいわね……でも、あなたのチカラなら負けないわ。'],
    dungeon: ['暗いところは苦手なのだけれど……仕方ないわね。'], chest: ['ふふ、いいものは入っていた？'], region: ['見たことのない景色……わくわくするわね。']
  };
  D.STAR_LINES = {
    meet: ['ひーひー！（だれ？ キミ、つよい？）'],
    good: ['ひーひー！！（かくせいしゃ！ ボク、かくせいしゃに たすけてもらった！）', 'ひーひー！（こんどは ボクが たすける！ まけないぞ！）'],
    bad: ['ひー……（かくせいしゃ じゃ ない……）', 'ひーひー！（でも いっしょに いく！ まけずぎらい だから！）'],
    idle: ['ひーひー！（ボク まけないぞ！）', 'ひー？（あれ なに？）', 'ひーひー！（きょうも がんばる！）'],
    levelup: ['ひーひー！！（すごい すごい！）'], lowhp: ['ひー！！（あぶない！ にげて！）'], boss: ['ひーひー！（こわくない！ ボク ゆうき ある！）'],
    dungeon: ['ひー……（くらい……でも へいき！）'], chest: ['ひーひー！（キラキラ！）'], region: ['ひーひー！（あたらしい ばしょ！）']
  };
  D.MARUN_LINES = {
    meet: ['こんにちは。マルンといいます。武器と、そのサポートのことを勉強しているの。'],
    good: ['あなたの武器、とっても勉強になりそう！ 魔法、強めにかけておくね。', 'HPを増やす魔法、いちおう得意なんだ。'],
    normal: ['あなたの武器は専門外だけど……大丈夫、ちゃんと魔法はかけるよ。', 'いっしょに行ってもいい？ いろいろ教えてほしいな。'],
    idle: ['重い武器って、振り方にコツがあるんだね……メモメモ。', '遠くから戦うのも、近くで戦うのも、どっちも大事。', 'えっと、HP増強の魔法は……うん、ちゃんとかかってる。'],
    levelup: ['レベルアップおめでとう！ ノートに書いておくね。'], lowhp: ['HPが危ないよ！ 下がって！'], boss: ['あれは……教科書にも載ってない魔物だ……！'],
    dungeon: ['暗いところでは、足もとに気をつけてね。'], chest: ['なにが入ってた？ 見せて見せて！'], region: ['新しい場所！ 記録しなくちゃ。']
  };
  D.SUP_LINES = { fuwarin: D.FUWA_LINES, lumi: D.LUMI_LINES, arulu: D.ARULU_LINES, star: D.STAR_LINES, marun: D.MARUN_LINES };

  // ================= 第三章のアイテム =================
  Object.assign(D.ITEMS, {
    frostember: { name: '氷炎の実', cat: 'food', heal: 0.32, rar: 3, icon: '🔥', desc: '氷炎の境地にだけ実る、冷たくて熱い不思議な果実。HPが32%回復する。（限定）', sell: 80 },
    frostmango: { name: '霧氷マンゴー', cat: 'food', heal: 0.34, rar: 3, icon: '🥭', desc: '霧氷の密林にだけ実る、霜をまとった甘いマンゴー。HPが34%回復する。（限定）', sell: 85 },
    baobab: { name: 'バオバブの実', cat: 'food', heal: 0.3, rar: 3, icon: '🥥', desc: '黄昏サバンナの巨木から採れる栄養たっぷりの実。HPが30%回復する。（限定）', sell: 75 },
    cloudherb: { name: '雲海ハーブ', cat: 'food', heal: 0.36, rar: 3, icon: '🌱', desc: '雲海高原の雲の上でしか育たないハーブ。HPが36%回復する。（限定）', sell: 90 },
    coconut: { name: 'ヤシの実', cat: 'food', heal: 0.3, rar: 3, icon: '🥥', desc: '星砂の浜のヤシから採れる実。甘いジュースがたっぷり。HPが30%回復する。（限定）', sell: 70 },
    megapotion: { name: 'HPポーションXL', cat: 'food', heal: 0.85, rar: 4, icon: '🍶', desc: '異界の素材で作った回復薬。HPが85%回復する。', price: 12000, sell: 1500 },
    emberice: { name: '氷炎石', cat: 'mat', rar: 3, icon: '🧊', desc: '氷と炎が同時に宿った石。氷炎の境地の限定素材。', sell: 900 },
    mistleaf: { name: '霧氷の葉', cat: 'mat', rar: 3, icon: '🍃', desc: '霜に覆われた密林の大葉。霧氷の密林の限定素材。', sell: 860 },
    lionmane: { name: '獅子のたてがみ', cat: 'mat', rar: 3, icon: '🦁', desc: '黄昏サバンナの獅子のたてがみ。夕陽色に輝く。限定素材。', sell: 880 },
    cloudwool: { name: '雲羊の毛', cat: 'mat', rar: 3, icon: '🐑', desc: '雲のようにふわふわの羊毛。雲海高原の限定素材。', sell: 920 },
    pearl: { name: '星砂の真珠', cat: 'mat', rar: 4, icon: '🦪', desc: '星砂の浜の貝が育てた、星のように光る真珠。限定素材。', sell: 1400 },
    crystal3: { name: '異界の結晶', cat: 'key', rar: 5, icon: '🔷', desc: '異界から流れ着いた結晶。結晶の守護者が抱いていた。五つ集めると虚晶の玉座への道が開く。' }
  });
  D.REGION_FOOD.push('frostember', 'frostmango', 'baobab', 'cloudherb', 'coconut');

  // ================= 第三章の武器 =================
  const Wp = (id, name, type, atk, rar, el, look, desc, price) => ({ id, name, type, atk, rar, el, look: look || {}, desc, price });
  D.WEAPONS.push(
    Wp('s_prism', '虹晶剣プリズマ', 'sword', 31000, 5, 'light', { blade: '#f0fbff', guard: '#ff9ef0', glow: '#bff6ff' }, '異界の結晶を鍛えた、七色に光る剣。', 420000),
    Wp('a_prism', '晶砕きの大斧', 'axe', 32500, 5, 'earth', { blade: '#e8f8ff', glow: '#7fd8ff', guard: '#c890ff' }, '結晶ごと大地を砕く、透き通った大斧。', 430000),
    Wp('t_prism', '虹晶の杖', 'staff', 30000, 5, 'arcane', { glow: '#ff9ef0', blade: '#e8f0ff' }, '先端の結晶が七色の光を放つ杖。', 410000),
    Wp('s_void', '虚晶剣クリスタリオン', 'sword', 40000, 5, 'light', { blade: '#ffffff', guard: '#7a5aff', glow: '#c8b0ff' }, '虚晶の王を討った者に応える、異界の剣。'),
    Wp('a_void', '虚晶の大斧', 'axe', 42000, 5, 'dark', { blade: '#f0e8ff', glow: '#9a7aff', guard: '#2a1e4a' }, '虚無と結晶の力を宿す伝説の大斧。'),
    Wp('t_void', '虚晶王の杖', 'staff', 38500, 5, 'arcane', { glow: '#c8b0ff', blade: '#2a1e4a' }, '虚晶の王の力を秘めた杖。')
  );
  D.W = {}; D.WEAPONS.forEach(w => D.W[w.id] = w);
  D.TIER_WEAPON.push({ sword: 's_prism', axe: 'a_prism', staff: 't_prism' }, { sword: 's_void', axe: 'a_void', staff: 't_void' }); // 10, 11
  D.REGION_TIER.push(10, 10, 10, 10, 10);

  // ================= 第三章の敵 =================
  const E = (o) => Object.assign({ hpK: 1, atkK: 1, defK: 1, speed: 3, aggro: 14, keep: 0, el: 'phys', weak: null, exp: 1, drops: [], scale: 1, radius: 0.5 }, o);
  const QD = (o) => Object.assign({ h: 0.62, L: 1.0, w: 0.18, bodyR: [0.26, 0.28, 0.58], headR: [0.17, 0.17, 0.2], neckY: 0.12, neckRise: 0.12, neckLen: 0.2, neckR: 0.13, snout: 0.16, legR: 0.06, tailLen: 0.22, tailRise: 0.05, tailR: 0.08, eyeS: 0.8, ears: 0.14 }, o);
  const MELEE = (o) => Object.assign({ kind: 'melee', windup: 0.6, r: 3, ang: 1.6, mult: 1.15, cd: 1.8, anim: 'bite' }, o);
  const SLAM = (o) => Object.assign({ kind: 'melee', windup: 0.9, r: 3.8, ang: 2.0, mult: 1.65, cd: 2.5, anim: 'slam', tele: true }, o);
  Object.assign(D.ENEMIES, {
    // 氷炎の境地
    ember_slime: E({ name: '氷炎スライム', model: ['slime', { color: '#9fe6ff', kind: 'fire', top: '#ff7a3a', e: 0.35 }], hpK: 1.3, atkK: 1.25, speed: 2.8, el: 'fire', weak: 'water', drops: [['slime', 0.5], ['emberice', 0.15]], atk: [{ kind: 'jump', windup: 0.5, r: 3, mult: 1.25, range: 4, cd: 2.2, status: 'burn' }] }),
    frost_lizard: E({ name: '霜炎トカゲ', model: ['quad', QD({ h: 0.45, L: 1.4, w: 0.22, bodyR: [0.3, 0.24, 0.75], headR: [0.2, 0.15, 0.26], neckY: 0.02, neckRise: 0.02, neckLen: 0.12, neckR: 0.16, snout: 0.2, legR: 0.07, tailLen: 0.7, tailRise: -0.02, tailR: 0.14, ears: 0, color: '#d8eef8', dark: '#3a4a5a', belly: '#ff9a5a', eye: '#ff6a2a', tailTip: '#ff6a2a', spikes: '#9fe6ff', spikeS: 0.8, spikeE: 0.8 })], hpK: 1.5, atkK: 1.3, speed: 4.4, el: 'ice', weak: 'fire', drops: [['emberice', 0.3]], radius: 0.6, atk: [MELEE({}), { kind: 'cone', windup: 0.9, r: 9, ang: 0.8, mult: 0.6, ticks: 5, cd: 6, tele: true, status: 'freeze', anim: 'breath' }] }),
    cinder_yeti: E({ name: '灰雪の巨人', model: ['golem', { rock: '#c8ccd4', dark: '#3a3234', glow: '#ff7a3a' }, 1.6], hpK: 3.4, atkK: 1.45, defK: 1.8, speed: 2.3, el: 'ice', weak: 'fire', exp: 2, drops: [['core', 0.4], ['emberice', 0.4]], radius: 1.0, atk: [SLAM({}), { kind: 'circle', windup: 1.0, r: 5, mult: 1.5, cd: 5, tele: true, anim: 'slam', status: 'burn' }] }),
    blaze_wisp: E({ name: '凍て火の精', model: ['spirit', { glow: '#9fe6ff', shell: '#ff6a2a', shellE: 0.8 }], hpK: 1.2, atkK: 1.3, speed: 3.4, keep: 9, aggro: 22, el: 'fire', weak: 'water', fly: true, drops: [['emberice', 0.3]], atk: [{ kind: 'proj', windup: 0.7, speed: 24, mult: 1.0, range: 24, cd: 2.2, look: 'lance', count: 3, spread: 0.4, anim: 'cast' }] }),
    icefire_drake: E({ name: '氷炎竜の幼体', elite: true, model: ['quad', { h: 1.0, L: 1.7, w: 0.34, bodyR: [0.5, 0.5, 0.95], headR: [0.3, 0.26, 0.38], neckY: 0.25, neckRise: 0.5, neckLen: 0.45, neckR: 0.2, snout: 0.28, legR: 0.14, tailLen: 0.7, tailRise: -0.05, tailR: 0.24, eyeS: 1.2, horns: 0.4, hornS: 1.3, hornC: '#e8f4ff', color: '#e8f0f8', dark: '#3a3036', belly: '#ff7a3a', eye: '#ff6a2a', tailTip: '#ff6a2a', spikes: '#9fe6ff', spikeS: 1.4, spikeE: 1, wings: 1.8, wingC: '#c8dcf0' }, 1.6], hpK: 9, atkK: 1.6, defK: 1.9, speed: 3.4, el: 'ice', weak: 'fire', exp: 7, drops: [['core', 1], ['emberice', 1]], radius: 1.4, atk: [MELEE({ r: 4.5, mult: 1.5, tele: true }), { kind: 'cone', windup: 1.0, r: 13, ang: 0.85, mult: 0.7, ticks: 6, cd: 6, tele: true, status: 'burn', anim: 'breath' }] }),
    // 霧氷の密林
    frost_ape: E({ name: '霧氷の大猿', model: ['golem', { rock: '#5a7a6a', dark: '#2a3a32', glow: '#bff6ff' }, 1.4], hpK: 3.0, atkK: 1.4, defK: 1.5, speed: 3.2, el: 'ice', weak: 'fire', exp: 2, drops: [['mistleaf', 0.4], ['meat', 0.5]], radius: 0.95, atk: [SLAM({ windup: 0.7 }), { kind: 'jump', windup: 0.9, r: 4, mult: 1.6, range: 14, cd: 6, tele: true, anim: 'slam' }] }),
    vine_serpent: E({ name: '樹氷の大蛇', model: ['quad', QD({ h: 0.3, L: 2.0, w: 0.15, bodyR: [0.26, 0.24, 1.0], headR: [0.22, 0.16, 0.3], neckY: 0.05, neckRise: 0.3, neckLen: 0.3, neckR: 0.18, snout: 0.22, legR: 0.02, tailLen: 1.1, tailRise: 0, tailR: 0.18, ears: 0, color: '#3a7a5a', dark: '#1e3a2a', belly: '#d8f0e8', eye: '#ffe86a', tailTip: '#bff6ff' })], hpK: 1.5, atkK: 1.3, speed: 4.8, el: 'earth', weak: 'fire', drops: [['mistleaf', 0.3]], radius: 0.6, atk: [MELEE({ status: 'poison' })] }),
    mist_shroom: E({ name: '霧吹きキノコ', model: ['mushroom', { cap: '#7fd8c8', dots: '#ffffff' }], hpK: 1.3, atkK: 1.25, speed: 2.2, el: 'ice', weak: 'fire', drops: [['mistleaf', 0.3]], atk: [{ kind: 'circle', windup: 0.9, r: 4.5, mult: 1.05, cd: 3.6, status: 'slow', tele: true, anim: 'atk' }] }),
    jungle_hunter: E({ name: '密林の狩人', model: ['human', { gender: 'f', main: '#2a5a3a', sub: '#e8f4ec', accent: '#bff6ff', hair: '#e8f4ff', skin: '#c89a74', mask: '#e8f4ec', cape: '#1e3a2a', weapon: { type: 'bow', blade: '#bff6ff', e: 0.5 } }, 0.98], hpK: 1.1, atkK: 1.25, speed: 3.6, keep: 12, aggro: 24, el: 'ice', weak: 'fire', drops: [['mistleaf', 0.3]], atk: [{ kind: 'proj', windup: 0.75, speed: 30, mult: 1.0, range: 26, cd: 2.2, anim: 'bow', look: 'lance', count: 3, spread: 0.25, status: 'slow' }] }),
    frost_treant: E({ name: '霧氷の古樹', elite: true, model: ['treant', { leaf: '#3a6a5a', leaf2: '#d8f4f0', glow: '#bff6ff', flowers: '#ffffff' }, 2.4], hpK: 9, atkK: 1.55, defK: 1.9, speed: 1.9, el: 'ice', weak: 'fire', exp: 7, drops: [['core', 1], ['mistleaf', 1]], radius: 1.5, atk: [SLAM({ r: 5.5, ang: 2.2 }), { kind: 'line', windup: 1.1, len: 20, w: 2.4, mult: 1.6, cd: 5, tele: true, fan: 3, anim: 'slam', status: 'slow' }] }),
    // 黄昏サバンナ
    sav_lion: E({ name: '黄昏ライオン', model: ['quad', QD({ h: 0.85, L: 1.3, w: 0.26, bodyR: [0.4, 0.42, 0.75], headR: [0.3, 0.3, 0.3], neckY: 0.12, neckRise: 0.1, neckLen: 0.2, neckR: 0.32, snout: 0.14, legR: 0.1, tailLen: 0.6, tailRise: 0.1, tailR: 0.06, ears: 0.12, color: '#e0a848', dark: '#8a4a1a', belly: '#f4dcac', eye: '#ffd27a', tailTip: '#6a3a10', spikes: '#9a4a1a', spikeS: 0.6, spikeE: 0 })], hpK: 1.6, atkK: 1.35, speed: 6.0, el: 'phys', weak: 'water', aggro: 20, drops: [['lionmane', 0.35], ['meat', 0.5]], radius: 0.7, atk: [MELEE({ r: 3.4, mult: 1.3 }), { kind: 'charge', windup: 0.7, dist: 16, w: 2.4, mult: 1.5, range: 18, cd: 5, anim: 'charge', tele: true }] }),
    hyena: E({ name: '夕闇ハイエナ', model: ['quad', QD({ h: 0.6, L: 1.0, color: '#b89a6a', dark: '#4a3a2a', belly: '#e8d8b8', eye: '#ff9a3a', tailTip: '#3a2a1a', spikes: '#3a2a1a', spikeS: 0.5, spikeE: 0 })], hpK: 1.2, atkK: 1.25, speed: 6.2, el: 'phys', weak: 'fire', aggro: 22, drops: [['fang', 0.6]], radius: 0.5, atk: [MELEE({})] }),
    savanna_rhino: E({ name: '大角サイ', model: ['quad', QD({ h: 0.95, L: 1.6, w: 0.32, bodyR: [0.56, 0.55, 0.9], headR: [0.32, 0.3, 0.4], neckY: 0.02, neckRise: 0.0, neckLen: 0.14, neckR: 0.32, snout: 0.2, legR: 0.13, tailLen: 0.2, tailRise: 0, tailR: 0.04, ears: 0.08, horns: 0.5, hornS: 1.2, hornC: '#f2ead8', color: '#8a8478', dark: '#4a463e', belly: '#a8a296', eye: '#ffd27a' })], hpK: 3.2, atkK: 1.45, defK: 2.0, speed: 2.6, el: 'earth', weak: 'thunder', exp: 2, drops: [['core', 0.4], ['meat', 0.6]], radius: 1.0, atk: [MELEE({ r: 3.6, mult: 1.5, anim: 'bite', tele: true }), { kind: 'charge', windup: 0.9, dist: 22, w: 2.8, mult: 1.8, range: 24, cd: 5, anim: 'charge', tele: true }] }),
    sav_shaman: E({ name: '夕陽の呪術師', model: ['human', { gender: 'm', main: '#c8642a', sub: '#f2e0b8', accent: '#ffd27a', accentE: 0.5, hair: '#1a1a1a', skin: '#8a5a3a', mask: '#e8c070', cape: '#8a3a1a', weapon: { type: 'staff', glow: '#ffb03a', blade: '#8a5a2a' } }, 1.0], hpK: 1.2, atkK: 1.3, speed: 3.0, keep: 11, aggro: 22, el: 'fire', weak: 'water', drops: [['lionmane', 0.2], ['core', 0.2]], atk: [{ kind: 'aoe', windup: 1.1, r: 3.5, mult: 1.3, range: 26, cd: 4, tele: true, count: 3, look: 'meteor', anim: 'cast' }] }),
    sav_elephant: E({ name: 'サバンナの巨象', elite: true, model: ['quad', QD({ h: 1.6, L: 2.0, w: 0.4, bodyR: [0.75, 0.78, 1.1], headR: [0.5, 0.48, 0.45], neckY: 0.15, neckRise: 0.0, neckLen: 0.12, neckR: 0.45, snout: 0.5, legR: 0.22, tailLen: 0.3, tailRise: 0, tailR: 0.05, ears: 0.45, horns: 0.6, hornS: 1.5, hornC: '#f2ead8', color: '#8a8a90', dark: '#5a5a62', belly: '#a0a0a8', eye: '#ffd27a' }), 1.4], hpK: 10, atkK: 1.55, defK: 2.0, speed: 2.2, el: 'earth', weak: 'thunder', exp: 7, drops: [['core', 1], ['lionmane', 1]], radius: 1.8, atk: [MELEE({ r: 5, ang: 2.0, mult: 1.6, tele: true }), { kind: 'circle', windup: 1.1, r: 8, mult: 1.8, cd: 6, tele: true, anim: 'roar' }, { kind: 'charge', windup: 1.0, dist: 24, w: 3.4, mult: 1.9, range: 26, cd: 7, anim: 'charge', tele: true }] }),
    // 雲海高原
    cloud_sheep: E({ name: '雲羊', model: ['quad', QD({ h: 0.7, L: 1.0, w: 0.22, bodyR: [0.42, 0.42, 0.55], headR: [0.18, 0.2, 0.22], ears: 0.12, horns: 0.25, hornS: 1.0, hornC: '#c8b080', color: '#f8fbff', dark: '#5a5a6a', belly: '#e8eef8', eye: '#3a3a4a' })], hpK: 1.4, atkK: 1.2, speed: 3.6, el: 'wind', weak: 'fire', drops: [['cloudwool', 0.4], ['meat', 0.4]], radius: 0.6, atk: [{ kind: 'charge', windup: 0.7, dist: 12, w: 2.2, mult: 1.3, range: 14, cd: 4, anim: 'charge', tele: true }] }),
    storm_eagle: E({ name: '嵐の鳥人', model: ['human', { gender: 'm', main: '#3a4a7a', sub: '#e8f0ff', accent: '#c38cff', hair: '#e8f0ff', skin: '#e8d8c8', wings: '#e8f0ff', wingTip: '#c38cff', wingE: 0.3, eyeGlow: '#c38cff', weapon: { type: 'bow', blade: '#c38cff', e: 0.7 } }, 0.98], hpK: 1.1, atkK: 1.3, speed: 3.8, keep: 12, aggro: 24, el: 'thunder', weak: 'earth', fly: true, drops: [['feather', 0.4], ['cloudwool', 0.15]], atk: [{ kind: 'proj', windup: 0.7, speed: 32, mult: 1.0, range: 28, cd: 2.2, anim: 'bow', look: 'lance', count: 3, spread: 0.3 }] }),
    cloud_golem: E({ name: '雲海の番人', model: ['golem', { rock: '#e8eef8', dark: '#a8b8d0', glow: '#c38cff' }, 1.55], hpK: 3.4, atkK: 1.45, defK: 1.9, speed: 2.0, el: 'thunder', weak: 'earth', exp: 2, drops: [['core', 0.45], ['cloudwool', 0.3]], radius: 1.0, atk: [SLAM({}), { kind: 'aoe', windup: 1.2, r: 3.5, mult: 1.4, range: 24, cd: 5, tele: true, count: 3, look: 'meteor', anim: 'slam' }] }),
    sky_wisp: E({ name: '雷雲の精', model: ['spirit', { glow: '#e8d8ff', shell: '#7a5ad8', shellE: 0.9 }], hpK: 1.2, atkK: 1.3, speed: 3.4, keep: 9, aggro: 22, el: 'thunder', weak: 'earth', fly: true, drops: [['core', 0.3]], atk: [{ kind: 'proj', windup: 0.7, speed: 26, mult: 1.05, range: 24, cd: 2.2, look: 'orb', count: 2, spread: 0.3, anim: 'cast' }] }),
    storm_titan: E({ name: '雷雲の巨神兵', elite: true, model: ['golem', { rock: '#c8d0e8', dark: '#6a6a9a', glow: '#c38cff' }, 2.6], hpK: 9.5, atkK: 1.6, defK: 2.0, speed: 1.9, el: 'thunder', weak: 'earth', exp: 7, drops: [['core', 1], ['cloudwool', 1]], radius: 1.6, atk: [SLAM({ r: 5.5, ang: 2.2 }), { kind: 'ring', windup: 1.0, r: 14, mult: 1.5, cd: 8, anim: 'slam' }] }),
    // 星砂の浜
    beach_crab: E({ name: '星砂ガニ', model: ['scorp', { color: '#ff7a5a', dark: '#a8402a', glow: '#ffe8a0' }], hpK: 1.8, atkK: 1.25, defK: 2.0, speed: 3.6, el: 'water', weak: 'thunder', drops: [['shell', 0.6], ['pearl', 0.06]], radius: 0.7, atk: [{ kind: 'melee', windup: 0.5, r: 2.8, ang: 1.6, mult: 1.2, cd: 1.7, anim: 'claw' }] }),
    sea_slime: E({ name: '潮だまりスライム', model: ['slime', { color: '#4fb4ff', kind: 'water', top: '#bff6ff', e: 0.15 }], hpK: 1.3, atkK: 1.2, speed: 2.8, el: 'water', weak: 'thunder', drops: [['slime', 0.6]], atk: [{ kind: 'jump', windup: 0.5, r: 2.8, mult: 1.2, range: 4, cd: 2.2, status: 'slow' }] }),
    sea_pirate: E({ name: '星砂の海賊', model: ['human', { gender: 'm', main: '#2a3a5a', sub: '#f2ece0', accent: '#ffd27a', hair: '#3a2a1a', skin: '#c89a74', hat: 'pirate', cape: '#8a1a1a', weapon: { type: 'sword', blade: '#e8eef4' } }, 1.0], hpK: 1.5, atkK: 1.35, speed: 3.6, el: 'phys', weak: 'thunder', drops: [['pearl', 0.1], ['core', 0.2]], atk: [{ kind: 'melee', windup: 0.5, r: 2.8, ang: 1.8, mult: 1.25, cd: 1.6, anim: 'atk' }, { kind: 'charge', windup: 0.7, dist: 12, w: 2, mult: 1.3, range: 14, cd: 5, anim: 'atk', tele: true }] }),
    sea_gunner: E({ name: '海賊の砲手', model: ['human', { gender: 'f', main: '#5a2a3a', sub: '#f2ece0', accent: '#ffd27a', hair: '#c8402a', skin: '#e8c8a8', hat: 'pirate', weapon: { type: 'bow', blade: '#ffd27a', e: 0.4 } }, 0.96], hpK: 1.1, atkK: 1.3, speed: 3.4, keep: 12, aggro: 24, el: 'fire', weak: 'water', drops: [['pearl', 0.08]], atk: [{ kind: 'aoe', windup: 1.0, r: 3, mult: 1.3, range: 26, cd: 3.6, tele: true, count: 2, look: 'meteor', anim: 'bow' }] }),
    pirate_captain: E({ name: '星砂の海賊船長', elite: true, model: ['human', { gender: 'm', main: '#1e2a4a', sub: '#f2ece0', accent: '#ffd27a', accentE: 0.5, hair: '#1a1a1a', skin: '#c89a74', hat: 'pirate', cape: '#8a1a1a', capeLong: true, weapon: { type: 'greatsword', blade: '#e8eef4', glow: '#ffd27a' } }, 1.45], hpK: 9, atkK: 1.6, defK: 1.8, speed: 3.6, el: 'water', weak: 'thunder', exp: 7, drops: [['core', 1], ['pearl', 0.6]], radius: 1.0, atk: [{ kind: 'melee', windup: 0.6, r: 4.2, ang: 2.4, mult: 1.5, cd: 1.8, anim: 'atk', tele: true }, { kind: 'charge', windup: 0.8, dist: 18, w: 2.6, mult: 1.6, range: 20, cd: 5, anim: 'atk', tele: true }, { kind: 'aoe', windup: 1.1, r: 3.5, mult: 1.4, range: 28, cd: 7, tele: true, count: 4, look: 'meteor', anim: 'atk' }] }),
    // ---- 結晶の柱（ギミック：守護者のシールドを張る） ----
    pylon: E({ name: '異界の結晶柱', model: ['spirit', { glow: '#ff9ef0', shell: '#7fd8ff', shellE: 1.0 }, 1.7], hpK: 2.2, atkK: 0.1, defK: 1.2, speed: 0, aggro: 0, passive: true, static: true, el: 'arcane', weak: null, exp: 0.5, drops: [], radius: 0.9, atk: [] }),
    // ---- 結晶の守護者（強化ボス） ----
    glacignis: E({ name: '氷炎竜 グラシエル・イグニス', boss: true, guardian: 0, model: ['quad', { h: 1.35, L: 2.3, w: 0.44, bodyR: [0.66, 0.64, 1.25], headR: [0.38, 0.34, 0.48], neckY: 0.3, neckRise: 0.7, neckLen: 0.62, neckR: 0.28, snout: 0.36, legR: 0.19, tailLen: 0.9, tailRise: -0.05, tailR: 0.32, eyeS: 1.6, horns: 0.6, hornS: 1.8, hornC: '#bff6ff', color: '#e8f0fa', dark: '#2a2228', belly: '#ff6a2a', eye: '#ff6a2a', tailTip: '#ff6a2a', spikes: '#9fe6ff', spikeS: 2.4, spikeE: 1, wings: 2.8, wingC: '#c8dcf0' }, 2.8], hpK: 34, atkK: 1.8, defK: 2.2, speed: 4.0, el: 'ice', weak: 'fire', exp: 90, radius: 2.6,
      atk: [{ kind: 'melee', windup: 0.8, r: 7, ang: 1.8, mult: 1.6, cd: 1.9, anim: 'bite', tele: true }, { kind: 'cone', windup: 1.0, r: 17, ang: 0.85, mult: 0.75, ticks: 6, cd: 6, tele: true, status: 'freeze', anim: 'breath' }, { kind: 'aoe', windup: 1.2, r: 4.5, mult: 1.6, range: 38, cd: 6, tele: true, count: 8, look: 'meteor', anim: 'roar', status: 'burn' }, { kind: 'ring', windup: 1.0, r: 20, mult: 1.6, cd: 8, anim: 'roar' }, { kind: 'charge', windup: 0.8, dist: 26, w: 3.4, mult: 1.8, range: 28, cd: 6, anim: 'charge', tele: true, phase2: true }, { kind: 'summon', windup: 1.0, cd: 20, what: 'blaze_wisp', n: 2, phase2: true, anim: 'roar' }] }),
    yggdra: E({ name: '霧氷の樹王 ユグドラ', boss: true, guardian: 1, model: ['treant', { leaf: '#2a5a4a', leaf2: '#e8f8f4', glow: '#bff6ff', flowers: '#ffffff' }, 4.0], hpK: 32, atkK: 1.75, defK: 2.2, speed: 1.9, el: 'ice', weak: 'fire', exp: 88, radius: 2.4,
      atk: [{ kind: 'melee', windup: 1.0, r: 8, ang: 2.4, mult: 1.7, cd: 2.4, anim: 'slam', tele: true }, { kind: 'line', windup: 1.1, len: 26, w: 2.8, mult: 1.7, cd: 5, tele: true, fan: 5, anim: 'slam', status: 'slow' }, { kind: 'proj', windup: 0.9, speed: 18, mult: 1.0, range: 34, cd: 6, count: 14, spread: 6.28, look: 'seed', anim: 'slam' }, { kind: 'circle', windup: 1.2, r: 10, mult: 1.8, cd: 7, tele: true, anim: 'slam', status: 'freeze' }, { kind: 'summon', windup: 1.0, cd: 18, what: 'frost_ape', n: 2, phase2: true, anim: 'slam' }, { kind: 'aoe', windup: 1.3, r: 4.5, mult: 1.6, range: 36, cd: 6, tele: true, count: 8, look: 'meteor', anim: 'slam', phase2: true }] }),
    regulus: E({ name: '黄昏の獅子王 レグルス', boss: true, guardian: 2, model: ['quad', QD({ h: 1.3, L: 2.1, w: 0.42, bodyR: [0.62, 0.64, 1.15], headR: [0.5, 0.5, 0.5], neckY: 0.15, neckRise: 0.2, neckLen: 0.3, neckR: 0.55, snout: 0.22, legR: 0.18, tailLen: 0.9, tailRise: 0.12, tailR: 0.1, eyeS: 1.5, ears: 0.2, color: '#f0b04a', dark: '#8a3a10', belly: '#ffe8b8', eye: '#ffd27a', tailTip: '#5a2a08', spikes: '#c85a1a', spikeS: 1.6, spikeE: 0.4 }), 2.6], hpK: 31, atkK: 1.85, defK: 2.0, speed: 5.4, el: 'fire', weak: 'water', exp: 86, radius: 2.4,
      atk: [{ kind: 'melee', windup: 0.6, r: 6.5, ang: 1.9, mult: 1.6, cd: 1.5, anim: 'bite', tele: true }, { kind: 'charge', windup: 0.7, dist: 28, w: 3.4, mult: 1.9, range: 30, cd: 4, anim: 'charge', tele: true }, { kind: 'jump', windup: 1.0, r: 8, mult: 2.0, range: 30, cd: 6, tele: true, anim: 'roar' }, { kind: 'ring', windup: 0.9, r: 18, mult: 1.5, cd: 8, anim: 'roar' }, { kind: 'summon', windup: 1.0, cd: 18, what: 'hyena', n: 3, phase2: true, anim: 'roar' }, { kind: 'cone', windup: 1.0, r: 16, ang: 0.9, mult: 0.75, ticks: 6, cd: 7, tele: true, status: 'burn', anim: 'breath', phase2: true }] }),
    nimbus: E({ name: '雲海の巨神 ニンバス', boss: true, guardian: 3, model: ['golem', { rock: '#f2f6ff', dark: '#8a98c0', glow: '#c38cff' }, 3.6], hpK: 36, atkK: 1.8, defK: 2.4, speed: 2.2, el: 'thunder', weak: 'earth', exp: 92, radius: 2.4,
      atk: [{ kind: 'melee', windup: 1.0, r: 7, ang: 2.4, mult: 1.7, cd: 2.4, anim: 'slam', tele: true }, { kind: 'jump', windup: 1.2, r: 9, mult: 2.2, range: 32, cd: 7, tele: true, anim: 'slam' }, { kind: 'aoe', windup: 1.2, r: 4.5, mult: 1.6, range: 38, cd: 5, tele: true, count: 9, look: 'meteor', anim: 'slam' }, { kind: 'ring', windup: 1.0, r: 22, mult: 1.6, cd: 8, anim: 'slam' }, { kind: 'line', windup: 1.1, len: 28, w: 3, mult: 1.8, cd: 6, tele: true, fan: 4, anim: 'slam', phase2: true }, { kind: 'summon', windup: 1.0, cd: 18, what: 'sky_wisp', n: 3, phase2: true, anim: 'slam' }] }),
    siren: E({ name: '深海の歌姫 セイレーン', boss: true, guardian: 4, model: ['human', { gender: 'f', gown: true, main: '#1e5a8a', sub: '#bff6ff', accent: '#ffd27a', accentE: 0.8, hair: '#7fd8ff', eye: '#ffe8a0', skin: '#d8e8f0', crown: '#ffd27a', weapon: { type: 'staff', glow: '#7fd8ff', blade: '#1e5a8a' }, cape: '#2a7ab0', capeLong: true, wings: '#bff6ff', wingTip: '#4fb4ff', wingE: 0.5 }, 2.6], hpK: 30, atkK: 1.85, defK: 2.0, speed: 3.4, el: 'water', weak: 'thunder', exp: 90, radius: 1.6, keep: 10,
      atk: [{ kind: 'proj', windup: 0.7, speed: 22, mult: 1.1, range: 34, cd: 2.2, count: 7, spread: 1.0, look: 'orb', anim: 'cast' }, { kind: 'aoe', windup: 1.2, r: 4, mult: 1.6, range: 34, cd: 5, tele: true, count: 7, look: 'tornado', anim: 'cast' }, { kind: 'ring', windup: 1.0, r: 18, mult: 1.6, cd: 7, anim: 'cast', status: 'slow' }, { kind: 'line', windup: 1.0, len: 26, w: 2.6, mult: 1.6, cd: 5, tele: true, fan: 5, anim: 'cast' }, { kind: 'summon', windup: 1.0, cd: 18, what: 'sea_slime', n: 3, phase2: true, anim: 'cast' }, { kind: 'proj', windup: 0.9, speed: 16, mult: 1.0, range: 40, cd: 6, count: 10, spread: 6.28, look: 'orb', homing: true, anim: 'cast', phase2: true }] }),
    // ---- 第三章の最終ボス ----
    crystalion: E({ name: '虚晶の王 クリスタリオン', boss: true, model: ['human', { gender: 'm', armor: '#e8f0ff', accent: '#ff9ef0', accentE: 0.9, knightHelm: '#c8d8ff', plume: '#7fd8ff', main: '#2a1e4a', sub: '#bff6ff', pants: '#1e1838', boots: '#c8d8ff', wings: '#bff6ff', wingTip: '#ff9ef0', wingE: 0.7, cape: '#3a2a6a', capeLong: true, crown: '#ff9ef0', eyeGlow: '#ff9ef0', weapon: { type: 'greatsword', blade: '#f0fbff', glow: '#ff9ef0' } }, 3.2], hpK: 44, atkK: 1.95, defK: 2.4, speed: 4.4, el: 'arcane', weak: 'light', exp: 140, radius: 1.8,
      atk: [{ kind: 'melee', windup: 0.7, r: 7, ang: 2.6, mult: 1.6, cd: 1.6, anim: 'atk', tele: true }, { kind: 'charge', windup: 0.8, dist: 26, w: 3, mult: 1.8, range: 28, cd: 5, anim: 'atk', tele: true }, { kind: 'proj', windup: 0.8, speed: 24, mult: 1.0, range: 36, cd: 5, count: 9, spread: 1.4, look: 'blade', anim: 'cast' }, { kind: 'aoe', windup: 1.3, r: 5, mult: 1.7, range: 40, cd: 6, tele: true, count: 10, look: 'meteor', anim: 'cast' }, { kind: 'ring', windup: 1.0, r: 24, mult: 1.7, cd: 8, anim: 'cast' }, { kind: 'line', windup: 1.0, len: 30, w: 3, mult: 1.8, cd: 6, tele: true, fan: 6, anim: 'cast', phase2: true }, { kind: 'summon', windup: 1.0, cd: 20, what: 'pylon', n: 2, phase2: true, anim: 'cast' }, { kind: 'jump', windup: 1.3, r: 10, mult: 2.4, range: 40, cd: 8, tele: true, anim: 'atk', phase2: true }] })
  });
  D.SPAWNS.push(
    [['ember_slime', 'ember_slime', 'ember_slime'], ['frost_lizard', 'frost_lizard'], ['cinder_yeti'], ['blaze_wisp', 'blaze_wisp'], ['frost_lizard', 'blaze_wisp', 'ember_slime']],
    [['frost_ape'], ['vine_serpent', 'vine_serpent'], ['mist_shroom', 'mist_shroom', 'mist_shroom'], ['jungle_hunter', 'jungle_hunter'], ['vine_serpent', 'jungle_hunter', 'mist_shroom']],
    [['sav_lion', 'sav_lion'], ['hyena', 'hyena', 'hyena'], ['savanna_rhino'], ['sav_shaman', 'hyena', 'hyena'], ['sav_lion', 'sav_shaman']],
    [['cloud_sheep', 'cloud_sheep', 'cloud_sheep'], ['storm_eagle', 'storm_eagle'], ['cloud_golem'], ['sky_wisp', 'sky_wisp'], ['cloud_sheep', 'storm_eagle', 'sky_wisp']],
    [['beach_crab', 'beach_crab'], ['sea_slime', 'sea_slime', 'sea_slime'], ['sea_pirate', 'sea_pirate'], ['sea_gunner', 'sea_pirate'], ['beach_crab', 'sea_slime', 'sea_gunner']]
  );
  D.CAMPS.push(['blaze_wisp', 'frost_lizard', 'cinder_yeti', 'ember_slime'], ['jungle_hunter', 'vine_serpent', 'frost_ape', 'jungle_hunter'], ['sav_shaman', 'sav_lion', 'savanna_rhino', 'hyena'], ['storm_eagle', 'cloud_sheep', 'cloud_golem', 'storm_eagle'], ['sea_pirate', 'sea_gunner', 'sea_pirate', 'beach_crab']);
  D.ELITES.push('icefire_drake', 'frost_treant', 'sav_elephant', 'storm_titan', 'pirate_captain');

  // ================= 結晶の守護者（第三章） =================
  D.GUARDIANS = ['glacignis', 'yggdra', 'regulus', 'nimbus', 'siren'];

  // ================= 旅の仲間（第三章） =================
  const CS = (o) => o;
  Object.assign(D.COMPANIONS, {
    volk: {
      name: 'ヴォルク', title: '鍛冶師', en: 'BLACKSMITH', gender: 'm', icon: '⚒', color: '#ff9a5a', hp: 2200, atk: 470, def: 380, spd: 0.9, style: 'melee', interval: 1.6, reach: 3.0, ang: 2.0, mult: 1.5, el: 'fire', wtype: 'hammer', ch: 3,
      quote: '氷と炎、どっちも打てて一人前の鍛冶師よ。お前さんの剣も打ち直してやらあ。',
      desc: '氷炎の境地で鍛冶場を営む豪快な職人。氷と炎を同時に操る特殊な炉で、自分の大槌も鍛え上げた。タフで頼れる兄貴分。',
      merit: ['HPと防御力がとても高い', '炎の大槌で敵を気絶させる'], demerit: ['移動速度 x0.9', '攻撃の間隔がやや長い'],
      v: 9, dx: 16, dz: 14, cond: {}, condText: '第三章で氷炎の集落フロストフレアにいる',
      look: { gender: 'm', main: '#5a3a2a', sub: '#e8dcc8', accent: '#ff7a3a', pants: '#2a2220', boots: '#3a2a22', hair: '#e8e0d0', eye: '#ffb03a', skin: '#c8906a', cape: '#3a2a22', weapon: { type: 'axe', blade: '#5a5a62', glow: '#ff7a3a' } },
      lines: { before: [], join: ['おう、お前さんが噂の転生者か。いい目をしてやがる。', '氷と炎、どっちも打てて一人前の鍛冶師よ。お前さんの剣も打ち直してやらあ。', 'ついでに、異界の結晶ってやつも一度叩いてみてえ。連れてけ！'] },
      skills: [
        CS({ lv: 10, name: '焔打ち', type: 'arc', el: 'fire', r: 4.4, ang: 2.4, mult: 2.8, cd: 8, desc: '炎をまとった大槌で前方を打ち据える。' }),
        CS({ lv: 20, name: '鋼の意地', type: 'buff', stat: 'def', val: 0.4, dur: 12, cd: 22, desc: '主人公の防御力を12秒間40%上げる。' }),
        CS({ lv: 30, name: '大地割り', type: 'nova', el: 'earth', r: 6.5, mult: 3.6, stun: 1.2, cd: 12, desc: '大槌を地面に叩きつけ、周囲の敵を気絶させる。' }),
        CS({ lv: 40, name: '氷炎の火花', type: 'rain', el: 'fire', spots: 5, spread: 6, r: 4.2, mult: 3.0, delay: 0.6, cd: 16, desc: '鍛冶場の火花を降らせる。' }),
        CS({ lv: 50, name: '渾身の一打', type: 'nova', el: 'fire', r: 8, mult: 5.0, stun: 1.5, cd: 18, desc: '全身の力を込めた最強の一撃。' })
      ]
    },
    linfa: {
      name: 'リンファ', title: '薬師', en: 'APOTHECARY', gender: 'f', icon: '⚕', color: '#7fe0c0', hp: 1650, atk: 420, def: 260, spd: 1.0, style: 'ranged', interval: 1.5, range: 20, speed: 24, mult: 1.0, el: 'ice', look: 'orb', wtype: 'staff', ch: 3,
      quote: '薬も毒も、使い方しだい。あなたの旅、わたしの薬で支えてあげる。',
      desc: '霧氷の密林で薬草を研究する若き薬師。霜をまとった薬草から作る薬で、仲間を癒やしたり、敵を凍えさせたりする。',
      merit: ['回復スキルが豊富', '敵を凍えさせて足止めする'], demerit: ['攻撃力はやや低い'],
      v: 10, dx: 16, dz: 14, cond: {}, condText: '第三章で樹氷の里ミストリーフにいる',
      look: { gender: 'f', main: '#2a6a5a', sub: '#f2f8f4', accent: '#7fe0c0', pants: '#1e3a32', boots: '#3a2a22', hair: '#2a2a3a', eye: '#7fe0c0', hairAcc: '#ffffff', cape: '#1e4a40', weapon: { type: 'staff', glow: '#bff6ff' } },
      lines: { before: [], join: ['あら、密林の霜を越えてきたの？ 無茶するのね。', '薬も毒も、使い方しだい。あなたの旅、わたしの薬で支えてあげる。', '珍しい薬草が採れそうな場所、ぜんぶ連れていってね？'] },
      skills: [
        CS({ lv: 10, name: '霜の薬瓶', type: 'volley', el: 'ice', n: 3, spread: 0.5, speed: 22, mult: 1.1, look: 'orb', cd: 6, desc: '凍える薬瓶を三つ投げる。' }),
        CS({ lv: 20, name: '癒やしの調合', type: 'heal', pct: 0.22, cd: 15, desc: '薬を調合し、主人公と仲間のHPを22%回復する。' }),
        CS({ lv: 30, name: '凍結の霧', type: 'nova', el: 'ice', r: 7, mult: 2.4, status: 'slow', cd: 12, desc: '凍える霧で周囲の敵の動きを鈍らせる。' }),
        CS({ lv: 40, name: '活力の秘薬', type: 'buff', stat: 'atk', val: 0.3, dur: 12, cd: 22, desc: '主人公の攻撃力を12秒間30%上げる。' }),
        CS({ lv: 50, name: '霧氷の大調合', type: 'heal', pct: 0.35, cd: 24, desc: 'とっておきの秘薬で、主人公と仲間のHPを35%回復する。' })
      ]
    },
    kai: {
      name: 'カイ', title: '獣使い', en: 'BEASTMASTER', gender: 'm', icon: '🐾', color: '#ffc84a', hp: 1900, atk: 500, def: 280, spd: 1.15, style: 'melee', interval: 1.0, reach: 2.6, ang: 1.8, mult: 1.0, el: 'phys', wtype: 'sword', ch: 3,
      quote: 'サバンナの獣たちは、みんなおれの友だちさ。お前も今日から友だちだ！',
      desc: '黄昏サバンナで獣たちと暮らす陽気な青年。素早い身のこなしで敵を翻弄し、獣たちの力を借りて戦う。',
      merit: ['移動速度 x1.15', '攻撃の手数が多い'], demerit: ['防御力はふつう'],
      v: 11, dx: 16, dz: 14, cond: {}, condText: '第三章でサバンナの町レオニアにいる',
      look: { gender: 'm', main: '#c8742a', sub: '#f2e0b8', accent: '#ffd27a', pants: '#5a3a1a', boots: '#3a2a1a', hair: '#1a1a1a', eye: '#ffd27a', skin: '#a0704a', headband: '#ff6a2a', weapon: { type: 'sword', blade: '#f2ead8' } },
      lines: { before: [], join: ['おっ、すげえ！ 獅子王の縄張りを抜けてきたのか！', 'サバンナの獣たちは、みんなおれの友だちさ。お前も今日から友だちだ！', 'よし、決めた。おれも一緒に行くぜ！'] },
      skills: [
        CS({ lv: 10, name: '獣牙連斬', type: 'arc', el: 'phys', r: 3.6, ang: 2.2, mult: 2.4, cd: 6, desc: '獣の牙のような素早い連続斬り。' }),
        CS({ lv: 20, name: '咆哮', type: 'taunt', dur: 6, cd: 18, desc: '獣の咆哮で敵を引きつける。' }),
        CS({ lv: 30, name: '群れの突撃', type: 'rain', el: 'phys', spots: 5, spread: 6, r: 4, mult: 3.0, delay: 0.5, cd: 14, desc: 'サバンナの獣たちを呼び、敵に突撃させる。' }),
        CS({ lv: 40, name: '野生の勘', type: 'buff', stat: 'spd', val: 0.25, dur: 12, cd: 22, desc: '主人公の移動速度を12秒間25%上げる。' }),
        CS({ lv: 50, name: '百獣の王', type: 'nova', el: 'phys', r: 8, mult: 4.6, knock: 6, cd: 18, desc: '百獣の王の気迫で周囲の敵を吹き飛ばす。' })
      ]
    },
    sora: {
      name: 'ソラ', title: '気象術師', en: 'WEATHERMANCER', gender: 'f', icon: '☂', color: '#a8c8ff', hp: 1550, atk: 560, def: 220, spd: 1.0, style: 'ranged', interval: 1.4, range: 24, speed: 30, mult: 1.15, el: 'thunder', look: 'orb', wtype: 'staff', ch: 3,
      quote: '明日の天気？ わたしが決めるの。今日は……雷のち、あなたの勝ち！',
      desc: '雲海高原の観測所で空を読む気象術師。雲と雷を自在に操り、遠くの敵に雷を落とす。少し気まぐれ。',
      merit: ['攻撃力が非常に高い', '雷で遠くの敵を攻撃'], demerit: ['HP・防御力が低い'],
      v: 12, dx: 16, dz: 14, cond: {}, condText: '第三章で雲上の町ニンバリアにいる',
      look: { gender: 'f', main: '#3a4a8a', sub: '#e8f0ff', accent: '#c38cff', pants: '#22285a', boots: '#e8eef6', hair: '#e8f0ff', eye: '#c38cff', hat: 'wizard', cape: '#2a3a7a', capeLong: true, weapon: { type: 'staff', glow: '#c38cff' } },
      lines: { before: [], join: ['ふうん、雲の上まで来るなんて。物好きね。', '明日の天気？ わたしが決めるの。今日は……雷のち、あなたの勝ち！', '雲海の巨神を止めたいなら、わたしの雷が必要でしょ？'] },
      skills: [
        CS({ lv: 10, name: '落雷', type: 'rain', el: 'thunder', spots: 1, r: 4.5, mult: 3.6, delay: 0.6, cd: 7, desc: '敵の頭上に雷を落とす。' }),
        CS({ lv: 20, name: '晴れ間の祝福', type: 'heal', pct: 0.15, cd: 16, desc: '雲を晴らし、主人公と仲間のHPを15%回復する。' }),
        CS({ lv: 30, name: '雷雲の弾', type: 'volley', el: 'thunder', n: 5, spread: 0.8, speed: 30, mult: 1.0, homing: true, look: 'orb', cd: 8, desc: '追尾する雷の弾を五発放つ。' }),
        CS({ lv: 40, name: '突風', type: 'nova', el: 'wind', r: 7, mult: 2.8, knock: 7, cd: 12, desc: '突風で周囲の敵を吹き飛ばす。' }),
        CS({ lv: 50, name: '大嵐', type: 'rain', el: 'thunder', spots: 8, spread: 8, r: 5, mult: 3.6, delay: 0.8, cd: 20, desc: '大嵐を呼び、無数の雷を落とす。' })
      ]
    },
    marina: {
      name: 'マリナ', title: '船長', en: 'CAPTAIN', gender: 'f', icon: '⚓', color: '#4fb4ff', hp: 2000, atk: 480, def: 320, spd: 1.05, style: 'melee', interval: 1.15, reach: 2.8, ang: 2.0, mult: 1.1, el: 'water', wtype: 'sword', ch: 3,
      quote: '海賊？ ちがうちがう、わたしは正義の船長！ 星砂の海はわたしが守る！',
      desc: '星砂の港を拠点にする女船長。海賊を取り締まる正義の味方で、潮の力をまとった剣さばきは嵐のように激しい。',
      merit: ['攻守のバランスが良い', '水の剣で敵を押し流す'], demerit: ['とくになし（強いて言えば声が大きい）'],
      v: 13, dx: 16, dz: 14, cond: {}, condText: '第三章で星砂の港マリンベルにいる',
      look: { gender: 'f', main: '#1e3a6a', sub: '#f2ece0', accent: '#ffd27a', pants: '#f2ece0', boots: '#3a2a1a', hair: '#c8402a', eye: '#4fb4ff', skin: '#e8c8a8', hat: 'pirate', cape: '#1e2a4a', capeLong: true, weapon: { type: 'sword', blade: '#bff6ff', glow: '#4fb4ff' } },
      lines: { before: [], join: ['あんたが噂の転生者？ へえ、いい面構えしてるじゃない！', '海賊？ ちがうちがう、わたしは正義の船長！ 星砂の海はわたしが守る！', '歌姫セイレーンの歌で、船が何隻も沈められたの。一緒にぶっ飛ばしに行くわよ！'] },
      skills: [
        CS({ lv: 10, name: '潮流斬り', type: 'arc', el: 'water', r: 4.2, ang: 2.6, mult: 2.5, cd: 7, desc: '潮の流れのような横薙ぎの一閃。' }),
        CS({ lv: 20, name: '錨落とし', type: 'rain', el: 'water', spots: 1, r: 5, mult: 4.0, delay: 0.7, cd: 10, desc: '巨大な錨を敵の頭上に落とす。' }),
        CS({ lv: 30, name: '船長命令', type: 'buff', stat: 'atk', val: 0.3, dur: 12, cd: 22, desc: '主人公の攻撃力を12秒間30%上げる。' }),
        CS({ lv: 40, name: '大渦', type: 'nova', el: 'water', r: 7, mult: 3.4, cd: 12, desc: '大渦を起こして周囲の敵を巻き込む。' }),
        CS({ lv: 50, name: '一斉砲撃', type: 'rain', el: 'fire', spots: 7, spread: 8, r: 4.5, mult: 3.4, delay: 0.8, cd: 20, desc: '船の大砲で一斉砲撃を浴びせる。' })
      ]
    }
  });
  D.COMP_ORDER.push('volk', 'linfa', 'kai', 'sora', 'marina');

  // ================= 第三章の村・NPC =================
  D.NPCS.push(
    ...['volk', 'linfa', 'kai', 'sora', 'marina'].map(id => { const c = D.COMPANIONS[id]; return { id: 'c_' + id, v: c.v, name: c.title + ' ' + c.name, role: 'recruit', comp: id, dx: c.dx, dz: c.dz, look: c.look, ch: 3 }; }),
    { id: 'ff_chief', v: 9, ch: 3, name: '長老イグナ', role: 'talk', dx: -4, dz: 6, look: { gender: 'f', main: '#e8eef6', sub: '#ff7a3a', hair: '#e8e0d0', accent: '#9fe6ff', cape: '#3a2a2a', capeLong: true }, lines: ['氷炎の集落フロストフレアへようこそ。雪と溶岩が同居する、不思議な土地さ。', '北の「氷炎の祭壇」には、異界の結晶を抱いた竜が棲みついてしまった。', '祭壇の結晶柱が竜を守っている……まず柱を砕くんだよ。'] },
    { id: 'shop9', v: 9, ch: 3, name: '道具屋カイロ', role: 'shop', shop: ['frostember', 'hipotion', 'megapotion', 'elixir', 's_prism', 'a_prism', 't_prism'], look: { gender: 'm', main: '#5a3a3a', sub: '#e8e0d0', hair: '#3a2a22', accent: '#ff7a3a' } },
    { id: 'q9', v: 9, ch: 3, name: '見張りのフィン', role: 'quest', quest: 'sq_lizard', dx: 18, dz: -10, look: { gender: 'm', main: '#7fb8e8', sub: '#ffffff', hair: '#c8402a', accent: '#ff7a3a' } },
    { id: 'ml_chief', v: 10, ch: 3, name: '樹守シルヴァ', role: 'talk', dx: -4, dz: 6, look: { gender: 'f', main: '#2a5a4a', sub: '#e8f8f4', hair: '#d8f4f0', accent: '#bff6ff', cape: '#1e4a3a', capeLong: true }, lines: ['樹氷の里ミストリーフへ。霧の中を、よく迷わずに来られましたね。', '密林の奥の大樹が、異界の結晶に取り込まれてしまったのです。', '結晶柱が樹王を守っています。柱をすべて砕けば、樹王の守りは消えるでしょう。'] },
    { id: 'shop10', v: 10, ch: 3, name: '薬草売りモモ', role: 'shop', shop: ['frostmango', 'hipotion', 'megapotion', 'elixir'], look: { gender: 'f', main: '#7fe0c0', sub: '#ffffff', hair: '#6a4a3a', accent: '#ff9ec4' } },
    { id: 'q10', v: 10, ch: 3, name: '採集家ネロ', role: 'quest', quest: 'sq_ape', dx: 18, dz: -10, look: { gender: 'm', main: '#3a5a3a', sub: '#e8f0d8', hair: '#2a2a2a', accent: '#bff6ff' } },
    { id: 'le_chief', v: 11, ch: 3, name: '族長ンガラ', role: 'talk', dx: -4, dz: 6, look: { gender: 'm', main: '#c8642a', sub: '#f2e0b8', hair: '#1a1a1a', accent: '#ffd27a', skin: '#7a4a2a', cape: '#8a3a1a', capeLong: true }, lines: ['サバンナの町レオニアへようこそ、旅の者。', '夕陽の祭壇には獅子王レグルスがいる。異界の結晶の力で、正気を失ってしまった。', '獅子王はとても速い。突進の前の構えをよく見るのだ。'] },
    { id: 'shop11', v: 11, ch: 3, name: '交易人ザラ', role: 'shop', shop: ['baobab', 'hipotion', 'megapotion', 'elixir'], look: { gender: 'f', main: '#e0a848', sub: '#f2e0b8', hair: '#1a1a1a', accent: '#c8402a', skin: '#8a5a3a' } },
    { id: 'q11', v: 11, ch: 3, name: '見習い狩人トト', role: 'quest', quest: 'sq_hyena', dx: 18, dz: -10, look: { gender: 'm', main: '#a8743a', sub: '#f2e0b8', hair: '#1a1a1a', accent: '#ffd27a', skin: '#8a5a3a' } },
    { id: 'nb_chief', v: 12, ch: 3, name: '観測所長エア', role: 'talk', dx: -4, dz: 6, look: { gender: 'f', main: '#e8eef8', sub: '#3a4a8a', hair: '#a8c8ff', accent: '#c38cff', cape: '#c8d0f0', capeLong: true }, lines: ['雲上の町ニンバリアへようこそ。ここは雲より高い場所にあるの。', '高原の頂に「虚晶の玉座」が現れたわ。五つの結晶がそろわない限り、近づけない。', '雲海の祭壇の巨神は、雷を落とすわ。上空にも気をつけて。'] },
    { id: 'shop12', v: 12, ch: 3, name: '気球商人バルーノ', role: 'shop', shop: ['cloudherb', 'hipotion', 'megapotion', 'elixir', 's_prism', 'a_prism', 't_prism'], look: { gender: 'm', main: '#5a8ac0', sub: '#f2e8d8', hair: '#c8a87a', accent: '#f2c94a' } },
    { id: 'q12', v: 12, ch: 3, name: '羊飼いユン', role: 'quest', quest: 'sq_sheep', dx: 18, dz: -10, look: { gender: 'f', main: '#f2f6ff', sub: '#7a9a5a', hair: '#e8c87a', accent: '#a8c8ff' } },
    { id: 'mb_chief', v: 13, ch: 3, name: '港長アクア', role: 'talk', dx: -4, dz: 6, look: { gender: 'm', main: '#1e5a8a', sub: '#f2ece0', hair: '#e8e0d0', accent: '#ffd27a', cape: '#1e3a5a', capeLong: true }, lines: ['星砂の港マリンベルへようこそ。夜になると砂浜が星みたいに光るんだ。', '沖の「潮騒の祭壇」で、歌姫セイレーンが船を沈めている。', 'あの歌姫は遠くから攻撃してくる。結晶柱を砕いて、一気に近づくんだ。'] },
    { id: 'shop13', v: 13, ch: 3, name: '魚屋のサンゴ', role: 'shop', shop: ['coconut', 'hipotion', 'megapotion', 'elixir'], look: { gender: 'f', main: '#4fb4ff', sub: '#ffffff', hair: '#ff9ec4', accent: '#ffd27a' } },
    { id: 'q13', v: 13, ch: 3, name: '漁師ドン', role: 'quest', quest: 'sq_pirate', dx: 18, dz: -10, look: { gender: 'm', main: '#3a5a7a', sub: '#e8e0d0', hair: '#3a3a4a', accent: '#ffd27a', skin: '#c89a74' } }
  );

  // ================= 第三章のクエスト =================
  Object.assign(D.QUESTS, {
    mq7: { main: true, ch: 3, title: '異界の扉', desc: '星喰竜を討ったあと、島のさらに外側の海から、異界の大地が現れた。スターリーフ村の長老マルクに話を聞こう。', obj: [{ type: 'talk', npc: 'marc', text: 'スターリーフ村の長老マルクと話す' }], reward: { coins: 20000, exp: 10000 }, next: 'mq8' },
    mq8: { main: true, ch: 3, title: '五つの異界の結晶', desc: '異界の大地の五つの祭壇で、強化された「結晶の守護者」が異界の結晶を抱いている。祭壇の結晶柱を砕いて守りを解き、守護者を倒して結晶を五つ集めよう。', obj: [
      { type: 'boss', id: 'glacignis', text: '氷炎の祭壇で氷炎竜を倒す（推奨Lv.95）' }, { type: 'boss', id: 'yggdra', text: '霧氷樹の祭壇で樹王を倒す（推奨Lv.94）' }, { type: 'boss', id: 'regulus', text: '夕陽の祭壇で獅子王を倒す（推奨Lv.93）' },
      { type: 'boss', id: 'nimbus', text: '雲海の祭壇で巨神を倒す（推奨Lv.97）' }, { type: 'boss', id: 'siren', text: '潮騒の祭壇で歌姫を倒す（推奨Lv.96）' }], reward: { coins: 300000, exp: 0, weapon: 'tier10' }, next: 'mq9' },
    mq9: { main: true, ch: 3, title: '虚晶の玉座', desc: '五つの異界の結晶が共鳴し、雲海高原の頂にある「虚晶の玉座」への道が開いた。異界の王を討ち、すべてを終わらせよう。', obj: [{ type: 'boss', id: 'crystalion', text: '虚晶の玉座で虚晶の王を倒す（推奨Lv.100）' }], reward: { coins: 1000000, exp: 0, weapon: 'tier11' }, next: null },
    sq_lizard: { title: '霜炎トカゲの群れ', giver: 'q9', ch: 3, desc: '集落の見張り台に霜炎トカゲが群がっている。追い払ってほしい。', obj: [{ type: 'kill', what: 'frost_lizard', n: 6, text: '霜炎トカゲを倒す' }], reward: { coins: 150000, exp: 80000, items: [['megapotion', 2]] } },
    sq_ape: { title: '霧の中の大猿', giver: 'q10', ch: 3, desc: '薬草の採集場で暴れる霧氷の大猿を退治してほしい。', obj: [{ type: 'kill', what: 'frost_ape', n: 5, text: '霧氷の大猿を倒す' }], reward: { coins: 150000, exp: 80000, items: [['megapotion', 2]] } },
    sq_hyena: { title: '夕闇の群れ', giver: 'q11', ch: 3, desc: '家畜を狙う夕闇ハイエナの群れを追い払ってほしい。', obj: [{ type: 'kill', what: 'hyena', n: 8, text: '夕闇ハイエナを倒す' }], reward: { coins: 140000, exp: 76000, items: [['megapotion', 2]] } },
    sq_sheep: { title: '迷子の雲羊', giver: 'q12', ch: 3, desc: '異界の結晶の影響で凶暴になった雲羊たちを落ち着かせてほしい。', obj: [{ type: 'kill', what: 'cloud_sheep', n: 6, text: '雲羊を倒す' }], reward: { coins: 160000, exp: 86000, items: [['elixir', 2]] } },
    sq_pirate: { title: '星砂の海賊退治', giver: 'q13', ch: 3, desc: '港を荒らす星砂の海賊をこらしめてほしい。', obj: [{ type: 'kill', what: 'sea_pirate', n: 6, text: '星砂の海賊を倒す' }], reward: { coins: 160000, exp: 86000, items: [['elixir', 2]] } }
  });
  Object.assign(D.QUEST_TALK, {
    sq_lizard: { offer: ['見張り台に霜炎トカゲが群がって、見張りどころじゃないんだ。', '6匹ほど追い払ってくれないか？'], done: ['助かった！ これでまた見張りができる。'] },
    sq_ape: { offer: ['薬草の採集場に、霧氷の大猿が居座っているんです。', '5頭ほど退治してもらえませんか？'], done: ['ありがとうございます！ これで薬草が採れます。'] },
    sq_hyena: { offer: ['ハイエナの群れが家畜を狙ってるんだ。おれ一人じゃ無理だよ……', '8頭ほど追い払ってくれる？'], done: ['すげえ！ おれもいつか、あんたみたいな狩人になる！'] },
    sq_sheep: { offer: ['うちの雲羊たちが、結晶の光を浴びてから暴れだしちゃったの。', '6頭ほど、落ち着かせてあげて。'], done: ['ありがとう！ みんな、ふわふわに戻ったわ。'] },
    sq_pirate: { offer: ['星砂の海賊どもが港の魚を根こそぎ持っていきやがる。', '6人ほどこらしめてくれ！'], done: ['ざまあみろだ！ 今夜は魚料理をごちそうするぜ。'] }
  });
  Object.assign(D.MARC, {
    ch3first: ['おお……！ 星喰竜を討ったあなたなら、もう気づいておるじゃろう。', '島のさらに外側の海に、見たこともない大地が現れた。言い伝えにすらない……「異界」の大地じゃ。', '異界の大地の五つの祭壇には、異界から流れ着いた結晶を抱いた「結晶の守護者」がおる。', '守護者は結晶柱に守られておる。柱を砕かねば、刃は届かぬじゃろう。', '五つの結晶を集めれば、雲海高原の「虚晶の玉座」への道が開くはずじゃ。'],
    ch3mid: ['結晶集めは順調かのう。', '祭壇の結晶柱は、守護者の守りの源じゃ。まず柱を砕くのじゃぞ。', '守護者は追い詰められると、柱をもう一度呼び出すらしい。気を抜くでないぞ。'],
    ch3ready: ['五つの異界の結晶が……共鳴しておる！', '雲海高原の頂、虚晶の玉座へ向かいなさい。異界の王が待っておる。'],
    ch3end: ['異界の王を討ったか……！ あなたは三度、この世界を救ってくれた。', '異界の大地にも、これからは穏やかな風が吹くじゃろう。本当に、ありがとう。']
  });
  D.CH3_INTRO = ['……{name}さん、聞こえますか？ ステラです。', '星喰竜が砕けたとき……その力に引き寄せられるように、「異界」の大地がこの世界に流れ着きました。', '島のさらに外側、四つの方角の海に……雪と炎の地、霧氷の密林、黄昏のサバンナ、そして雲海の高原と星砂の浜が現れています。', '異界の大地には、異界の結晶を抱いた強大な守護者たちがいます。結晶柱に守られ、普通の攻撃は届きません。', 'どうか、スターリーフ村のマルク長老を訪ねてください。第三章の始まりです。'];

  // ================= お知らせ =================
  D.NEWS.unshift({
    ver: 'Beta v1.0.10', date: '2026.11.14', title: '大型アップデート', tag: '大型アップデート', items: [
      ['🌏', '第三章「異界の結晶」', '第二章をクリアすると第三章が開幕。島の外側の四隅に異界の大地が現れ、「＋」の形だった島が大きな丸い大陸になります（第二章をクリアするまでは解放されません）。'],
      ['🗺', '新エリア5つ', '左上「氷炎の境地」（雪原×地獄火山）、右上「霧氷の密林」（雪原×ジャングル）、左下「黄昏サバンナ」、右下「雲海高原」と「星砂の浜」。各地にその地域でしか手に入らない限定アイテムがあります。'],
      ['🔷', '結晶の守護者', '異界の結晶を抱いた強化ボスが5体。結晶柱を砕いてシールドを解除するギミック付き。追い詰めると柱を呼び直して怒り状態になります。'],
      ['♪', '新人格「超聴者」', '剣を初期装備。攻撃・飛び道具・接近する敵の方向が画面の縁にマークで表示されます（HP1800／攻撃力390／防御力280／移動速度x0.9）。フワリンとの相性：良'],
      ['◉', '新人格「予言者」', '斧を初期装備。敵の次の攻撃と、命中までの秒数が見えます。ステータスは低め（HP1550／攻撃力390／防御力160／移動速度x0.9）。フワリンとの相性：悪'],
      ['✺', '新サポートキャラ', '人格の効果を2倍にする「アルル」、覚醒時間を延ばす「スター」、HPを増やす「マルン」が登場。サポートキャラは2体まで連れて行けるようになり、人格を選んだ直後にも選べます。'],
      ['🤝', '旅の仲間5人', '鍛冶師ヴォルク、薬師リンファ、獣使いカイ、気象術師ソラ、船長マリナが第三章の村に登場。'],
      ['👆', 'タッチ操作の見直し', 'タッチ操作のUIを作り直しました。指で画面に触れるとタッチ操作のUIに、マウスをクリックするとキーボード操作のUIに自動で切り替わります。']
    ]
  });
  D.TIPS.push(
    '結晶の守護者は結晶柱に守られています。まず柱を砕いてシールドを解除しよう。',
    '超聴者は、画面の縁のマークで攻撃が来る方向がわかります。',
    '予言者は、敵の頭上に次の攻撃と命中までの秒数が見えます。',
    'サポートキャラは2体まで連れて行けます。相性を確かめて組み合わせよう。',
    'アルルは俊足者・飛翔者・予言者の力を2倍にしてくれます。',
    '各地方の限定アイテムは、その地方でしか手に入りません。'
  );
})(window.PS);
