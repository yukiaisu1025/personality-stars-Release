// Beta v1.1.0：第四章（天界の欠片）・プラス進化・人格切り替え（旅の仲間を自分で操作する）
(function (PS) {
  'use strict';
  const G = PS.G, D = PS.DATA, W = PS.World, R = PS.R, M4 = PS.M4, UI = PS.UI, ST = PS.Story;
  const tmpM = M4.create();
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const fmt = (n) => Math.round(n).toLocaleString('ja-JP');
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
  const C = PS.col, rgb = (c) => PS.hexRGB(c);
  const mmss = (sec) => { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); };
  const SW_T = 6; // スイッチの水晶：すべて点灯させるまでの猶予（秒）

  // =====================================================================
  //  セーブ
  // =====================================================================
  G.ch4Save = function (s) {
    s = s || G.save; if (!s) return;
    while (s.dungeons.length < 15) s.dungeons.push(false);
    s.heaven = s.heaven || [false, false, false, false];
    const ps = G.partySave();
    if (!ps.keys) { ps.keys = { 1: 'hero' }; let k = 2; for (const id of ps.list) { if (k > (D.SWITCH_KEYS || 9)) break; ps.keys[k++] = id; } }
    for (const k in ps.keys) if (+k > (D.SWITCH_KEYS || 9)) delete ps.keys[k]; // 人格切り替えは主人公＋仲間3人まで（キー 1〜4）
    for (const k in ps.keys) if (ps.keys[k] !== 'hero' && !ps.list.includes(ps.keys[k])) delete ps.keys[k];
    if (!Object.values(ps.keys).includes('hero')) { let k = 1; while (k <= (D.SWITCH_KEYS || 9) && ps.keys[k]) k++; ps.keys[k <= (D.SWITCH_KEYS || 9) ? k : 1] = 'hero'; }
    ps.cskills = ps.cskills || {};
    if (!ps.cur || (ps.cur !== 'hero' && !ps.list.includes(ps.cur))) ps.cur = 'hero';
    ps.active = [];
  };
  const _mig = G.migrateSave;
  G.migrateSave = function (s) {
    _mig(s);
    if (s.final3 && (s.chapter || 1) === 3) { s.chapter = 4; s.ch4intro = false; }
    G.ch4Save(s);
    if (s.chapter >= 4 && !s.quests.mq10 && s.ch4intro) G.startQuest('mq10', true);
    if (s.plus && s.play >= s.plus.end) s.plus = null;
  };

  // =====================================================================
  //  人格切り替え（旅の仲間を自分で操作する）
  // =====================================================================
  G.curComp = () => { const s = G.save, c = s && s.party && s.party.cur; return c && c !== 'hero' && D.COMPANIONS[c] ? c : null; };
  G.curId = () => G.curComp() || 'hero';
  G.pk = () => (G.curComp() ? '_comp' : (G.save ? G.save.pers : 'adventurer'));
  G.charName = (id) => (id === 'hero' ? G.save.name : D.COMPANIONS[id].name);
  G.charSub = (id) => (id === 'hero' ? D.PERS[G.save.pers].name : D.COMPANIONS[id].title);
  G.charIcon = (id) => (id === 'hero' ? D.PERS[G.save.pers].icon : D.COMPANIONS[id].icon);
  G.charColor = (id) => (id === 'hero' ? D.PERS[G.save.pers].color : D.COMPANIONS[id].color);
  G.charHp = {};
  G.charKey = (id) => { const ks = G.partySave().keys || {}; for (const k in ks) if (ks[k] === id) return +k; return 0; };

  // ---- レベル・ステータス ----
  G.plusOn = () => { const s = G.save; return !!(s && s.plus && s.play < s.plus.end); };
  G.plusSideOn = (k) => { const s = G.save; return !!(s && s.plus && s.plus.sideEnd && s.play < s.plus.sideEnd && !G.curComp() && s.pers === k); };
  G.effLevel = () => G.save.level + (G.plusOn() ? D.PLUS.lv : 0);
  G.heroWpn = () => D.W[G.save.weapon];
  G.compStats = function (id, lv) {
    const c = D.COMPANIONS[id], L = D.LVUP, g = D.COMP_GROW; lv = lv || G.effLevel(); const n = lv - 1;
    const wb = G.heroWpn() ? G.heroWpn().atk * 0.8 : 0;
    let atk = c.atk + n * L.atk[0] * g + wb; if (c.atkPer2) atk += Math.floor(lv / 2) * c.atkPer2;
    return { hp: Math.round(c.hp + n * L.hp[0] * g), atk: Math.round(atk), def: Math.round(c.def + n * L.def[0] * g), spd: c.spd };
  };
  G.calcStats = function (cid) {
    const s = G.save, p = G.player, sm = G.supMods(), plus = G.plusOn();
    let hp, atk, def, spd, aspd = 1;
    if (cid) {
      const st = G.compStats(cid), c = D.COMPANIONS[cid];
      hp = st.hp * sm.hp; atk = st.atk; def = st.def; spd = st.spd * sm.spd; aspd = PS.clamp(1.15 / (c.interval || 1.2), 0.8, 1.25);
    } else {
      const P = D.PERS[s.pers], w = G.heroWpn(), bm = G.baseMul(), pl = plus ? D.PLUS.lv : 0, L = D.LVUP;
      hp = P.hp * bm * sm.hp + s.gains.hp + pl * L.hp[0]; atk = P.atk * bm + s.gains.atk + pl * L.atk[0] + (w ? w.atk : 0); def = P.def * bm + s.gains.def + pl * L.def[0];
      spd = (s.pers === 'sprinter' ? 1 + (P.spd - 1) * sm.pers : P.spd) * sm.spd;
    }
    const b = { atk: 0, def: 0, spd: 0 };
    if (p && cid === G.curComp()) for (const x of p.buffs) b[x.stat] = (b[x.stat] || 0) + x.val;
    atk *= 1 + b.atk; def *= 1 + b.def; spd *= 1 + b.spd;
    if (p && p.awk.on && !cid && cid === G.curComp()) { hp *= 2.5; atk *= 2.5; def *= 2.5; spd *= 1.2; aspd = 1.25; }
    if (plus) spd *= 1.05;
    return { hp: Math.round(hp), atk: Math.round(atk), def: Math.round(def), spd, aspd, crit: plus ? 0.1 : 0.05, critDmg: plus ? 0.65 : 0.5, buffs: b };
  };
  G.recalc = function () {
    G.pstat = G.calcStats(G.curComp());
    const p = G.player; if (p && p.hp > G.pstat.hp) p.hp = G.pstat.hp;
  };
  G.flightMax = () => (G.pk() === 'flyer' ? Math.max(((D.PERS.flyer.flight || 3) + Math.floor(G.effLevel() / 5)) * G.supMods().pers * (G.plusSideOn('flyer') ? 0.5 : 1), G.dunAbil('wing') ? 8 : 0) : 8);
  G.canFly = () => G.pk() === 'flyer' || !!G.dunAbil('wing');
  G.foresight = () => (G.save && G.pk() === 'prophet' ? D.FORESIGHT * G.supMods().pers : 0);
  G.axeSpd = () => (G.plusSideOn('miner') ? 0.6 : 1);
  G.pScale = () => (G.plusOn() ? 1.1 : 1);
  G.playerLook = function () {
    const p = G.player; if (!p) return {};
    if (p.awk.on) return { emis: [2.5, 0.6, 0.8], outlineCol: [0.5, 0.05, 0.1] };
    if (G.plusOn()) { const k = 0.75 + Math.sin(G.time * 3) * 0.15; return { emis: [1.0 * k, 0.85 * k, 0.4 * k], outlineCol: [0.55, 0.42, 0.08] }; }
    return {};
  };

  // ---- 武器の種類（仲間の武器を、剣／斧／杖の攻撃に対応させる） ----
  const WMAP = { sword: 'sword', lance: 'sword', club: 'sword', axe: 'axe', scythe: 'axe', hammer: 'axe', staff: 'staff', orb: 'staff', bow: 'staff', lute: 'staff' };
  const _wt = G.wpnType, _we = G.wpnEl, _wc = G.wpnColor;
  G.wpnType = () => { const c = G.curComp(); return c ? (WMAP[D.COMPANIONS[c].wtype] || 'sword') : _wt(); };
  G.wpnEl = () => { const c = G.curComp(); return c ? (D.COMPANIONS[c].el || 'phys') : _we(); };
  G.wpnColor = () => { const c = G.curComp(); if (!c) return _wc(); const cc = D.COMPANIONS[c]; return cc.el && cc.el !== 'phys' ? D.ELEM[cc.el].c : '#ffffff'; };

  // ---- 見た目（プラス進化で大きく変わる） ----
  const plusLook = (look) => Object.assign({}, look, {
    main: '#f6f1e4', sub: '#ffd27a', accent: '#ffe08a', accentE: 0.85, pants: '#e6dcc4', boots: '#c8a050', eyeGlow: '#fff2b0',
    wings: '#fffbe8', wingTip: '#ffd27a', wingE: 0.8, halo: '#fff2b0', cape: '#f2e2b0', capeLong: true,
    crown: look.helmet || look.knightHelm || look.hat ? look.crown : (look.crown || '#ffd27a'),
    weapon: look.weapon ? Object.assign({}, look.weapon, { glow: '#fff2b0' }) : look.weapon
  });
  const _bpm = G.buildPlayerModel;
  G.buildPlayerModel = function () {
    const cid = G.curComp(), plus = G.plusOn();
    if (cid) {
      const c = D.COMPANIONS[cid];
      return PS.makeModel('pc:' + cid + (plus ? ':plus' : ''), () => ({ mb: PS.buildHumanoid(Object.assign({ skin: '#ffe0cc' }, plus ? plusLook(c.look) : c.look)), bones: PS.HB, anim: PS.animHuman, height: 1.75, radius: 0.4 }));
    }
    if (!plus) return _bpm();
    const s = G.save, P = D.PERS[s.pers], w = D.W[s.weapon];
    return PS.makeModel('player:' + s.pers + ':' + s.gender + ':' + s.weapon + ':plus', () => {
      const look = Object.assign({ gender: s.gender, hair: s.gender === 'f' ? '#f2d58a' : '#3d3040', skin: '#ffe2cf' }, P.look, { weapon: Object.assign({ type: w.type }, w.look) });
      return { mb: PS.buildHumanoid(plusLook(look)), bones: PS.HB, anim: PS.animHuman, height: 1.7, radius: 0.4 };
    });
  };
  G.curColor = () => G.charColor(G.curId());

  // ---- 切り替え ----
  G.switchChar = function (id, quiet) {
    const s = G.save, ps = G.partySave(), p = G.player; if (!p || !s) return false;
    if (id !== 'hero' && !ps.list.includes(id)) return false;
    const cur = G.curId();
    if (id === cur) { if (!quiet) PS.UI.notify(G.charName(id) + 'を操作しています', 'info'); return false; }
    if (p.dead || G.state !== 'play') return false;
    if (G.time < (G._swT || 0)) { PS.Audio.sfxPlay('deny', 0.5); return false; }
    if (p.act || p.mode === 'climb' || p.mode === 'swim') { PS.UI.notify('今は人格を切り替えられません', 'info'); PS.Audio.sfxPlay('deny', 0.5); return false; }
    G._swT = G.time + 0.9;
    G.charHp[cur] = PS.clamp(p.hp / Math.max(1, G.pstat.hp), 0.01, 1);
    if (p.awk.on) { p.awk.on = false; p.awk.cd = 40; }
    ps.cur = id;
    G.recalc();
    const r = G.charHp[id] != null ? G.charHp[id] : 1;
    p.setModel(); p.hp = Math.max(1, Math.round(G.pstat.hp * r));
    p.combo = null; p.queued = false; p.cast = 0; p.axeOut = false; p.plunge = false;
    if (p.mode === 'fly' && !G.canFly()) p.mode = 'air';
    p.fly.t = Math.min(p.fly.t, G.flightMax());
    G.pcolor = G.curColor();
    const P0 = p.pos, col = rgb(G.pcolor);
    G.pillarFX(P0.x, P0.y, P0.z, 1.1, 7, col, 0.7); G.ring(P0.x, P0.y + 0.1, P0.z, 3.2, col, 0.5);
    G.emit(36, { x: P0.x, y: P0.y + 1, z: P0.z, color: G.pcolor, vs: 4, vy: 2, size: 0.3, life: 0.8, kind: 1, spread: 1 });
    PS.Audio.sfxPlay('awaken', 0.35);
    if (!quiet) PS.UI.notify('人格切り替え：' + G.charSub(id) + ' ' + G.charName(id), 'buff');
    if (id !== 'hero') { const c = D.COMPANIONS[id]; setTimeout(() => PS.UI.bubble(G.player, c.quote.length > 26 ? c.quote.slice(0, 26) + '…' : c.quote, 2.4, 'skill'), 150); }
    PS.UI.refreshSkills(); PS.UI.refreshParty();
    return true;
  };
  G.keySwitch = function (n) {
    const ps = G.partySave(), id = (ps.keys || {})[n];
    if (!id) { PS.UI.notify('キー ' + n + ' には誰も割り当てられていません（仲間画面 または 設定 →「人格切り替え」）', 'info'); PS.Audio.sfxPlay('deny', 0.5); return; }
    G.switchChar(id);
  };
  G.assignKey = function (id, n) {
    const ps = G.partySave(); ps.keys = ps.keys || {};
    if (!n) { if (id === 'hero') { PS.UI.notify('主人公はどこかのキーに割り当てておく必要があります', 'warn'); return false; } for (const k in ps.keys) if (ps.keys[k] === id) delete ps.keys[k]; return true; }
    const prev = ps.keys[n], old = G.charKey(id);
    if (prev === 'hero' && id !== 'hero' && !old) { PS.UI.notify('主人公のキーを上書きすることはできません', 'warn'); return false; }
    if (old) delete ps.keys[old];
    if (prev && prev !== id && old) ps.keys[old] = prev; // 入れ替え
    ps.keys[n] = id; return true;
  };

  // ---- スキル（仲間のスキルを E／Q で使う） ----
  const SKC = {};
  G.compPlayerSkill = function (sk) {
    if (SKC[sk.id]) return SKC[sk.id];
    let o = Object.assign({}, sk);
    if (sk.type === 'volley') Object.assign(o, { type: 'proj', n: sk.n || 1, spread: sk.spread || 0, speed: sk.speed || 26, range: 30, homing: true, size: 1.1 });
    else if (sk.type === 'taunt') Object.assign(o, { type: 'buff', stat: 'def', val: sk.def || 0.3, dur: sk.dur || 8 });
    else if (sk.type === 'bomb') Object.assign(o, { type: 'rain', spots: 1, spread: 0, delay: 0.6, ticks: 1, r: sk.r || 4 });
    else if (sk.type === 'charge') Object.assign(o, { type: 'dash', dist: 12, w: sk.w || 2.6 });
    else if (sk.type === 'rain') Object.assign(o, { spots: sk.spots || 1, spread: sk.spread || 4, delay: sk.delay || 0.5, ticks: sk.ticks || 1 });
    else if (sk.type === 'heal') Object.assign(o, { pct: sk.pct || 0.15 });
    return (SKC[sk.id] = o);
  };
  // E／Q に入れるスキル（スロット番号で保存。Lv.60以降の「極」にも自動で切り替わる）
  G.compSkillSel = function (id) {
    const ps = G.partySave(), learned = G.compLearned(id), sel = ps.cskills[id];
    if (sel) return sel.map(sl => learned.find(k => k.slot === sl) || null);
    const by = learned.slice().sort((a, b) => b.lv - a.lv);
    return [by[1] || by[0] || null, by[1] ? by[0] : null];
  };
  G.slotSkills = function () {
    const cid = G.curComp();
    if (cid) return G.compSkillSel(cid).map(k => (k ? G.compPlayerSkill(k) : null));
    const s = G.save; return [0, 1].map(i => (s.skills[i] ? G.skillById(s.skills[i]) || null : null));
  };
  G.castSkill = function (slot) {
    const p = G.player, pk = G.pk(), cid = G.curComp();
    if (pk === 'awakener') { if (slot <= 1) G.awaken(); return; }
    const sk = G.slotSkills()[slot];
    if (!sk) { PS.UI.notify(cid ? D.COMPANIONS[cid].name + 'はまだスキルを覚えていません（Lv.10で習得）' : G.nextSkillText(), 'info'); PS.Audio.sfxPlay('deny'); return; }
    if (p.cd[sk.id] > 0) { PS.Audio.sfxPlay('deny'); return; }
    if (p.mode === 'climb' || p.mode === 'swim' || p.act || p.status.freeze > 0) return;
    p.cd[sk.id] = sk.cd * (pk === 'mage' ? 0.85 : 1); p.combo = null;
    if (cid) PS.UI.skillCall(G.player, sk.name);
    G.execSkill(sk, sk);
    G.questEvent('skill');
  };
  // 魔術者の副作用：スキルの攻撃力ダウン
  const _ex = G.execSkill;
  G.execSkill = function (sk, base) {
    if (G.plusSideOn('mage') && sk.mult) { sk = Object.assign({}, sk, { mult: sk.mult * 0.75 }); if (sk.sub && sk.sub.mult) sk.sub = Object.assign({}, sk.sub, { mult: sk.sub.mult * 0.75 }); }
    return _ex(sk, base);
  };
  const _aw = G.awaken;
  G.awaken = function () { if (G.curComp()) return; return _aw(); };

  // =====================================================================
  //  プラス進化
  // =====================================================================
  G.plusCheck = function () {
    const s = G.save, have = s.inv.pluscrystal || 0, why = [];
    if (D.PLUS.ng[s.pers]) why.push(D.PLUS.ng[s.pers]);
    if (G.plusOn()) why.push('すでにプラス進化しています（残り ' + mmss(s.plus.end - s.play) + '）');
    if (have < D.PLUS.cost) why.push('プラスクリスタルが足りません（' + have + ' / ' + D.PLUS.cost + '）');
    if (s.level < D.PLUS.minLv) why.push('レベルが足りません（Lv.' + s.level + ' ／ Lv.' + D.PLUS.minLv + '以上が必要）');
    return { ok: !why.length, why, have };
  };
  G.plusEvolve = function () {
    const s = G.save, c = G.plusCheck();
    if (!c.ok) { PS.UI.notify(c.why[0], D.PLUS.ng[s.pers] ? 'warn' : 'info'); PS.Audio.sfxPlay('deny'); return false; }
    const side = D.PLUS.side[s.pers];
    PS.UI.confirm(`<b style="color:#ffe08a;font-size:1.15em">✚ プラス進化しますか？</b><br><small>プラスクリスタル ${D.PLUS.cost}個を使い、15分間ステータスが Lv.+${D.PLUS.lv} 相当に上限突破します（Lv.${s.level} → Lv.${s.level + D.PLUS.lv}）。<br>旅の仲間も一緒に進化します。</small>${side ? `<br><small style="color:#ffb08a">副作用（${D.PERS[s.pers].name}・約${Math.round(D.PLUS.sideDur / 60)}分間）：${side.text}<br>※仲間は副作用を受けません</small>` : '<br><small style="color:#7ff0b0">副作用：なし</small>'}`, () => G.doPlus(), null, 'プラス進化する', 'やめる');
    return true;
  };
  G.doPlus = function () {
    const s = G.save, p = G.player, c = G.plusCheck(); if (!c.ok) return;
    s.inv.pluscrystal -= D.PLUS.cost; if (!s.inv.pluscrystal) delete s.inv.pluscrystal;
    const side = D.PLUS.side[s.pers];
    s.plus = { end: s.play + D.PLUS.dur, sideEnd: side ? s.play + D.PLUS.sideDur : 0, pers: s.pers };
    const r = p.hp / G.pstat.hp; G.recalc(); p.setModel(); p.hp = Math.round(G.pstat.hp * Math.min(1, r + 0.25));
    G.charHp = {}; G._plusWas = true; G._sideWas = !!side;
    const P0 = p.pos;
    PS.Audio.sfxPlay('awaken'); PS.Audio.sfxPlay('levelup', 0.6); G.shake(0.7);
    G.pillarFX(P0.x, P0.y, P0.z, 2.4, 22, [1, 0.88, 0.45], 1.6); G.ring(P0.x, P0.y + 0.1, P0.z, 10, [1, 0.9, 0.5], 0.8); G.ring(P0.x, P0.y + 0.2, P0.z, 5, [1, 1, 1], 0.6);
    G.emit(90, { x: P0.x, y: P0.y + 1, z: P0.z, color: '#ffe08a', vs: 9, vy: 5, size: 0.4, life: 1.4, kind: 1, spread: 1.4 });
    PS.UI.banner('✚ プラス進化', 'ステータスが Lv.' + (s.level + D.PLUS.lv) + ' 相当に上限突破！（15:00）', '#ffe08a');
    if (side) setTimeout(() => PS.UI.notify('副作用：' + side.text + '（約' + Math.round(D.PLUS.sideDur / 60) + '分間）', 'warn'), 2400);
    setTimeout(() => PS.UI.notify('旅の仲間も一緒にプラス進化した！（仲間は副作用を受けません）', 'buff'), side ? 5200 : 2400);
    G.applyMuffle(); PS.UI.refreshSkills(); G.writeSave(true);
  };
  G.plusTick = function (dt) {
    const s = G.save, p = G.player; if (!s || !p) return;
    const on = G.plusOn();
    if (G._plusWas == null) G._plusWas = on;
    if (G._plusWas && !on) {
      s.plus = null; G._plusWas = false; G.recalc(); const hp = p.hp; p.setModel(); p.hp = Math.min(hp, G.pstat.hp);
      PS.UI.banner('プラス進化が解けた', 'もとの姿にもどった', '#cfd8ea'); PS.Audio.sfxPlay('deny', 0.6); G.applyMuffle(); PS.UI.refreshSkills();
      G.pillarFX(p.pos.x, p.pos.y, p.pos.z, 1.2, 8, [0.8, 0.8, 0.9], 0.8);
    }
    G._plusWas = on;
    const sideOn = !!(s.plus && s.plus.sideEnd && s.play < s.plus.sideEnd);
    if (G._sideWas && !sideOn) { G._sideWas = false; if (s.plus) PS.UI.notify('プラス進化の副作用がおさまった', 'buff'); G.applyMuffle(); }
    G._sideWas = sideOn;
    if (!on) return;
    // 金色のオーラ
    if (Math.random() < dt * 14) { const a = Math.random() * 6.28; G.emit(1, { x: p.pos.x + Math.cos(a) * 0.6, y: p.pos.y + 0.2 + Math.random() * 1.6, z: p.pos.z + Math.sin(a) * 0.6, color: Math.random() < 0.5 ? '#ffe08a' : '#ffffff', vs: 0.4, vy: 1.8, size: 0.16, life: 0.9, kind: 1 }); }
    // 冒険者の副作用：覚醒の代償として少量のダメージ
    if (G.plusSideOn('adventurer') && G.state === 'play') {
      G._advT = (G._advT || 0) + dt;
      if (G._advT > 6) { G._advT = 0; const dmg = Math.round(G.pstat.hp * 0.015); if (p.hp > dmg + 1) { p.hp -= dmg; PS.UI.dmg(p.pos.x, p.pos.y + 1.9, p.pos.z, dmg, '#ff8a8a', false, 'player'); G.emit(8, { x: p.pos.x, y: p.pos.y + 1, z: p.pos.z, color: '#ff6a7a', vs: 2, size: 0.25, life: 0.5, kind: 1 }); } }
    }
  };
  // 超聴者の副作用：耳が聞こえづらくなる（音がこもる）
  G.applyMuffle = function () {
    const A = PS.Audio; if (!A.ctx || !A.comp || !A.master) return;
    if (!A.lpf) { try { A.lpf = A.ctx.createBiquadFilter(); A.lpf.type = 'lowpass'; A.lpf.frequency.value = 20000; A.comp.disconnect(); A.comp.connect(A.lpf); A.lpf.connect(A.master); } catch (e) { A.lpf = null; return; } }
    const on = G.plusSideOn('hearer');
    A.lpf.frequency.setTargetAtTime(on ? 650 : 20000, A.ctx.currentTime, 0.3); A.muffle = on; A.applyVol();
  };
  const _av = PS.Audio.applyVol;
  PS.Audio.applyVol = function () { _av(); const A = PS.Audio; if (A.ctx && A.muffle) A.master.gain.value = PS.Settings.volMaster * 0.45; };
  // 俊足者の副作用：酔う（視界が揺れて、まっすぐ歩けない）
  const _uc = G.updateCamera;
  G.updateCamera = function (dt, I) {
    _uc(dt, I);
    if (G.plusSideOn('sprinter') && G.state === 'play') {
      const c = G.cam, t = G.time;
      c.ex += Math.sin(t * 1.13) * 0.55; c.ey += Math.sin(t * 1.71) * 0.28; c.ez += Math.cos(t * 0.93) * 0.55;
      c.tx += Math.sin(t * 0.81 + 1) * 0.35; c.ty += Math.sin(t * 1.37) * 0.12; c.tz += Math.cos(t * 0.77) * 0.35;
    }
  };
  const _mv = PS.Input.move;
  PS.Input.move = function () {
    const m = _mv.call(this);
    if (G.plusSideOn && G.plusSideOn('sprinter') && m.mag > 0) { const a = Math.sin(G.time * 0.7) * 0.42, c = Math.cos(a), s = Math.sin(a); return { x: m.x * c - m.y * s, y: m.x * s + m.y * c, mag: m.mag }; }
    return m;
  };

  // =====================================================================
  //  第四章：世界の果てのギミックダンジョンと天への階段
  // =====================================================================
  G.ch4 = { ready: false, dungeons: [], stairs: [] };
  G.ch4Done = () => !!(G.save && G.save.heaven && G.save.heaven.every(x => x));
  G.ch4DungeonsDone = () => [11, 12, 13, 14].every(i => G.save.dungeons[i]);
  const farSpot = function (dir, avoid, relax) {
    const [dx, dz] = dir, px = -dz, pz = dx, H = (W.ch5 ? 2304 : W.HALF) - 70; let best = null, bs = -1e9; // 第五章でも第三章までの「世界の果て」に置く
    const minY = relax ? 1.5 : 4, flatT = relax ? 4.5 : 2.6;
    for (let t = H; t > H - 1000; t -= 16) for (let l = -380; l <= 380; l += 20) {
      const x = dx * t + px * l, z = dz * t + pz * l; if (Math.abs(x) > H || Math.abs(z) > H) continue;
      const y = W.heightRaw(x, z); if (y < minY) continue;
      let ok = true; for (const [ox, oz] of [[8, 0], [-8, 0], [0, 8], [0, -8], [6, 6], [-6, -6], [6, -6], [-6, 6]]) { const yy = W.heightRaw(x + ox, z + oz); if (Math.abs(yy - y) > flatT || yy < minY - 1) { ok = false; break; } }
      if (!ok) continue;
      const sx = x - dx * 38, sz = z - dz * 38, sy = W.heightRaw(sx, sz); if (sy < minY) continue;
      for (const [ox, oz] of [[8, 0], [-8, 0], [0, 8], [0, -8]]) { const yy = W.heightRaw(sx + ox, sz + oz); if (Math.abs(yy - sy) > flatT + 0.6 || yy < minY - 1) { ok = false; break; } }
      if (!ok) continue;
      if (avoid.some(a => Math.hypot(a.x - x, a.z - z) < a.r || Math.hypot(a.x - sx, a.z - sz) < a.r)) continue;
      const sc = t - Math.abs(l) * 0.35; if (sc > bs) { bs = sc; best = { x, z, y, sx, sz, sy }; }
    }
    return best;
  };
  const stairMeshes = (col) => {
    const base = new PS.MeshBuilder(), steps = new PS.MeshBuilder(), c1 = C(col, 0.9), st = C('#f2ede0'), st2 = C('#d4cbb8'), gold = C('#e8c26a', 0.3);
    base.cyl(0, -4, 0, 0, 0.35, 0, 8.6, 8.6, st2, 30, true, st);
    base.cyl(0, 0.3, 0, 0, 0.42, 0, 8.8, 8.8, gold, 30, false);
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; base.box(Math.cos(a) * 6.4, 0.38, Math.sin(a) * 6.4, 1.4, 0.05, 0.3, c1, 0, -a, 0); }
    for (const s of [-1, 1]) { base.box(s * 3.4, 3.4, 7.2, 0.9, 6.4, 0.9, st); base.box(s * 3.4, 6.75, 7.2, 1.25, 0.4, 1.25, gold); base.sphere(s * 3.4, 7.3, 7.2, 0.38, 0.38, 0.38, c1, 8, 6); }
    base.box(0, 7.05, 7.2, 8.2, 0.5, 0.8, st); base.box(0, 7.4, 7.2, 3, 0.4, 0.5, gold); base.sphere(0, 7.75, 7.2, 0.5, 0.5, 0.5, c1, 10, 6);
    base.cyl(0, 0.3, 0, 0, 3.4, 0, 1.4, 1.0, st, 14); base.sphere(0, 4.1, 0, 0.85, 0.85, 0.85, c1, 12, 8);
    const n = 150;
    for (let i = 0; i < n; i++) {
      const a = i * 0.3, y = 3.2 + i * 1.12, rr = 5.6;
      steps.box(Math.cos(a) * rr, y, Math.sin(a) * rr, 3.4, 0.32, 1.7, i % 2 ? st : st2, 0, -a, 0);
      steps.box(Math.cos(a) * (rr + 1.75), y + 0.12, Math.sin(a) * (rr + 1.75), 0.14, 0.12, 1.7, c1, 0, -a, 0);
      if (i % 3 === 0) steps.sphere(Math.cos(a) * (rr + 1.8), y + 0.55, Math.sin(a) * (rr + 1.8), 0.2, 0.2, 0.2, c1, 6, 4);
    }
    steps.cyl(0, 3, 0, 0, 3.2 + n * 1.12, 0, 0.5, 0.35, C('#fff8e0', 0.7), 10, false);
    for (let i = 0; i < 36; i++) { const a = i / 36 * 6.283; steps.sphere(Math.cos(a) * 11, 3.2 + n * 1.12 + 6, Math.sin(a) * 11, 0.7, 0.7, 0.7, C('#fff2b0', 1), 6, 4); }
    const mk = (mb) => PS.GLH.makeMesh(R.gl, mb.pack());
    return { base: mk(base), steps: mk(steps) };
  };
  G.ch4Setup = function () {
    const s = G.save; if (G.ch4.ready || !W.ch3 || !s || (s.chapter || 1) < 4) return;
    G.ch4.ready = true; if (W.ch5 && W.H2) W._Hq = W.H2;
    const avoid = [].concat(W.VILLAGES.filter(v => !v.ch5).map(v => ({ x: v.x, z: v.z, r: 150 })), W.DUNGEONS.filter(d => d && !d.ch4 && !d.adv).map(d => ({ x: d.x, z: d.z, r: 90 })), W.WAYPOINTS.filter(w => !w.ch5).map(w => ({ x: w.x, z: w.z, r: 36 })), (W.SHRINES || []).map(q => ({ x: q.x, z: q.z, r: 90 })), [W.SUMMIT, W.SUMMIT2, W.SUMMIT3].filter(Boolean).map(q => ({ x: q.x, z: q.z, r: 130 })), (W.camps || []).filter(q => q.reg < 14).map(q => ({ x: q.x, z: q.z, r: 30 })));
    D.CH4_DUNGEONS.forEach((def, i) => {
      const sp = farSpot(def.dir, avoid) || farSpot(def.dir, avoid, true) || { x: def.dir[0] * 1900, z: def.dir[1] * 1900, y: 5, sx: def.dir[0] * 1860, sz: def.dir[1] * 1860, sy: 5 };
      avoid.push({ x: sp.x, z: sp.z, r: 200 });
      const d = Object.assign({}, def, { x: sp.x, z: sp.z, y: W.heightRaw(sp.x, sp.z), ch2: true, ch4: true, pm: W.portalMesh.length });
      d.ry = Math.atan2(sp.sx - sp.x, sp.sz - sp.z);
      W.portalMesh.push(PS.GLH.makeMesh(R.gl, PS.Props.portal(def.stone || '#a8a8b8').pack()));
      for (const sd of [-1, 1]) W.addCircle(d.x + Math.cos(d.ry) * 3.2 * sd, d.z - Math.sin(d.ry) * 3.2 * sd, 1.0);
      W.DUNGEONS[d.id] = d; G.ch4.dungeons[i] = d;
      const sy = W.heightRaw(sp.sx, sp.sz), ry = Math.atan2(sp.x - sp.sx, sp.z - sp.sz);
      const st = { i, x: sp.sx, z: sp.sz, y: sy, ry, ex: sp.sx + Math.sin(ry) * 9.5, ez: sp.sz + Math.cos(ry) * 9.5, def: D.SKY_STAIRS[i], dun: d, mesh: stairMeshes(D.SKY_STAIRS[i].color) };
      st.ey = W.heightRaw(st.ex, st.ez);
      W.addCircle(st.x, st.z, 1.7, sy + 5);
      for (const sd of [-1, 1]) W.addCircle(st.x + Math.cos(ry) * 3.4 * sd + Math.sin(ry) * 7.2, st.z - Math.sin(ry) * 3.4 * sd + Math.cos(ry) * 7.2, 0.8, sy + 8);
      G.ch4.stairs[i] = st;
    });
    W._Hq = null;
  };
  // プラスクリスタルの採集ポイント（第二章の四つの大地）
  const _pg = PS.Props.gather;
  PS.Props.gather = function (kind) {
    if (kind === 'pluscrystal') {
      const mb = new PS.MeshBuilder();
      mb.append(PS.Props.rock(4, '#5a5a6e', '#7a7a90'));
      const cs = [[0, 0.9, 0, 0.16], [0.28, 0.65, 0.12, 0.11], [-0.25, 0.6, -0.1, 0.1], [0.1, 0.55, -0.3, 0.09], [-0.12, 0.55, 0.28, 0.09]];
      for (const [x, hgt, z, r] of cs) mb.cyl(x * 0.7, 0.2, z * 0.7, x, 0.2 + hgt, z, r, 0, C('#ffe8a0', 0.95), 6);
      mb.box(0, 1.35, 0, 0.36, 0.08, 0.08, C('#ffffff', 1)); mb.box(0, 1.35, 0, 0.08, 0.36, 0.08, C('#ffffff', 1));
      return mb;
    }
    if (kind === 'heavenfruit') {
      const mb = new PS.MeshBuilder();
      mb.cyl(0, 0, 0, 0, 0.5, 0, 0.05, 0.03, C('#c8a060'), 5);
      for (let k = 0; k < 3; k++) { const a = k * 2.1; mb.sphere(Math.cos(a) * 0.16, 0.62, Math.sin(a) * 0.16, 0.14, 0.13, 0.14, C('#ffd27a', 0.7), 8, 6); }
      mb.sphere(0, 0.82, 0, 0.22, 0.05, 0.12, C('#fffbe8', 0.6), 6, 3);
      return mb;
    }
    return _pg(kind);
  };
  G.addPlusGathers = function () {
    if (G._plusG || !W.expanded) return; G._plusG = true;
    const r = PS.rng(777041);
    for (let k = 5; k <= 8; k++) {
      const Rg = W.REG[k]; let got = 0, tries = 0;
      while (got < 12 && tries++ < 900) {
        const a = r() * 6.283, rr = Math.sqrt(r()) * Rg.R * 0.95, x = Rg.c[0] + Math.cos(a) * rr, z = Rg.c[1] + Math.sin(a) * rr;
        if (W.region(x, z) !== k) continue; const y = W.heightRaw(x, z); if (y < 2) continue;
        const nrm = W.normal(x, z); if (nrm[1] < 0.8) continue;
        if (W.VILLAGES.some(v => Math.hypot(v.x - x, v.z - z) < 60)) continue;
        W.gathers.push({ kind: 'pluscrystal', x, y, z, ry: r() * 6.28, taken: 0, id: W.gathers.length, plus: true }); got++;
      }
    }
    if (!G.gatherMesh.pluscrystal) G.gatherMesh.pluscrystal = PS.GLH.makeMesh(R.gl, PS.Props.gather('pluscrystal').pack());
  };
  G.ch4World = function () {
    G.addPlusGathers();
    if (!G.gatherMesh.heavenfruit) G.gatherMesh.heavenfruit = PS.GLH.makeMesh(R.gl, PS.Props.gather('heavenfruit').pack());
    G.ch4Setup();
  };
  // 第二章の大地の宝箱には、プラスクリスタルが入っていることがある
  const _oc = G.openChest;
  G.openChest = function (c, transient) {
    _oc(c, transient);
    const reg = c.reg || 0;
    if (reg >= 5 && reg <= 8 && (c.kind >= 1 || Math.random() < 0.5)) G.addItem('pluscrystal', c.kind === 2 ? 2 : 1);
    if (c.ch4) G.addItem('heavensteel', c.kind === 2 ? 2 : 1);
  };

  // ---- ゲーム開始 ----
  const _sg = G.startGame;
  G.startGame = function (save, fromStory) {
    G.charHp = {}; G._plusWas = null; G._sideWas = null; G.skyFight = null;
    _sg(save, fromStory);
    G.ch4World();
    G.pcolor = G.curColor(); G.applyMuffle();
    PS.UI.refreshSkills(); PS.UI.refreshParty();
    if (save.chapter >= 4 && !save.ch4intro) setTimeout(() => G.chapter4Intro(), 900);
  };
  // 第三章クリア → 第四章（マップは広がらないので再起動しない）
  G.toChapter4 = function () {
    const s = G.save; s.chapter = 4; s.ch4intro = false; G.ch4Save(s);
    G.ch4World(); G.spawnNPCs();
    G.fade(1.2); PS.Audio.sfxPlay('waypoint');
    setTimeout(() => { const v = W.VILLAGES[0], p = G.player; p.pos.x = v.x + 6; p.pos.z = v.z + 18; p.pos.y = W.height(p.pos.x, p.pos.z); p.mode = 'ground'; p.vel.x = p.vel.y = p.vel.z = 0; p.yaw = Math.PI; G.cam.yaw = Math.PI; G.cam.pitch = 0.2; G.cam.tx = p.pos.x; G.cam.ty = p.pos.y + 1.5; G.cam.tz = p.pos.z; G.clearWorldEnemies(); G.partyArrive(); G.lastRegion = -1; }, 250);
    G.writeSave(true);
    setTimeout(() => G.chapter4Intro(), 1400);
  };
  G.chapter4Intro = function () {
    const s = G.save; if (!s || s.ch4intro) return;
    const card = h(`<div class="chap-card full"><div class="cc-k">CHAPTER 4</div><div class="cc-t">第四章　天界の欠片</div><div class="cc-s">― 天へと続く階段 ―</div></div>`);
    $('#ui').appendChild(card); setTimeout(() => card.classList.add('on'), 50); PS.Audio.sfxPlay('waypoint');
    setTimeout(() => { card.classList.add('end'); setTimeout(() => card.remove(), 1200); }, 3800);
    setTimeout(() => {
      PS.UI.dialog('ステラの声', D.CH4_INTRO.map(l => l.replace(/\{name\}/g, s.name)), () => {
        s.ch4intro = true; G.startQuest('mq10'); G.writeSave(true);
        setTimeout(() => PS.UI.notify('世界の果ての四方に、天へと続く光が見える……地図で確認しよう', 'quest'), 1500);
        setTimeout(() => PS.UI.notify('数字キー（1〜' + (D.SWITCH_KEYS || 9) + '）で仲間に人格を切り替えられます。キーの割り当ては仲間画面（P）で', 'info'), 5200);
      });
    }, 4400);
  };
  G.finalWin4 = function () {
    const s = G.save; if (s.final4) return; s.final4 = true; G.writeSave(true);
    setTimeout(() => G.ending4(), 1200);
  };
  G.ending4 = function () {
    G.state = 'ending'; ST.mode = 'ending'; PS.UI.hudShow(false); PS.UI.closeAll(); if (PS.Input.locked) document.exitPointerLock();
    PS.Audio.play('ending');
    const s = G.save, ps = s.party || { list: [], supports: [] };
    const el = h(`<div class="screen ending"><div class="ed-roll">
      <p class="big">四つの天界の欠片は、光の階段をのぼって天へと還った。</p><p>暴走していた熾天使たちは静かに目を覚まし、世界の果ての試練もまた、穏やかな光に包まれた。</p><p class="nm">― ${s.name} ―</p>
      <p>【${D.PERS[s.pers].name}】の人格と、${ps.list.length ? ps.list.slice(0, 8).map(id => D.COMPANIONS[id].name).join('・') + (ps.list.length > 8 ? 'ほか' : '') + 'たち仲間' : 'ひとりきりの勇気'}${(ps.supports || []).length ? '、そして' + ps.supports.map(id => D.SUPPORT[id].name).join('と') : ''}とともに。</p>
      <div class="ed-logo"><div class="tt-en">PERSONALITY STARS</div><div class="tt-jp"><span>パーソナリティー</span><span>スターズ</span></div></div>
      <h4>第四章　天界の欠片</h4><p>${D.VERSION_LABEL}</p><h4>制作</h4><p>YUKI GROUP</p><h4>スペシャルサンクス</h4><p>アオイ　ガイウス　ミミ　セラフィ<br>そして、遊んでくれたすべての転生者のみなさん</p>
      <p class="big">第四章　完</p><p>物語は、まだ続く――</p><p class="sm">© 2026 YUKI GROUP. All Rights Reserved.</p></div>
      <button class="btn big yes ed-btn">冒険を続ける</button></div>`);
    $('#ui').appendChild(el);
    el.querySelector('.ed-btn').onclick = () => { el.classList.add('out'); setTimeout(() => el.remove(), 900); ST.mode = 'none'; G.state = 'play'; PS.UI.hudShow(true); G.pickBGM(); G.writeSave(true); };
  };

  // ---- マルク・クエスト ----
  const _talk = G.talk;
  G.talk = function (npc) {
    const s = G.save, d = npc.def;
    if (d.role === 'chief' && s.chapter >= 4 && s.quests.mq1 && s.quests.mq1.st === 'done') {
      PS.Audio.sfxPlay('uiOpen');
      if (s.quests.mq10 && s.quests.mq10.st !== 'done') return PS.UI.dialog(d.name, D.MARC.ch4first, () => G.questEvent('talk', 'marc'));
      if (s.final4) return PS.UI.dialog(d.name, D.MARC.ch4end);
      return PS.UI.dialog(d.name, D.MARC.ch4mid);
    }
    return _talk(npc);
  };
  const _sq = G.startQuest;
  G.startQuest = function (id, quiet) {
    _sq(id, quiet);
    const s = G.save, st = s.quests[id]; if (!st || st.st !== 'active') return;
    if (id === 'mq11') D.QUESTS.mq11.obj.forEach((o, i) => { if (s.dungeons[o.id]) st.prog[i] = 1; });
    if (id === 'mq12') D.QUESTS.mq12.obj.forEach((o, i) => { if (s.heaven && s.heaven[i]) st.prog[i] = 1; });
    if ((id === 'mq11' || id === 'mq12') && G.questComplete(id)) setTimeout(() => G.finishQuest(id), 1200);
  };
  const _qt = G.questTarget;
  G.questTarget = function () {
    if (!G.player || !G.save) return null;
    const s = G.save, id = s.tracked;
    if (!id || !s.quests[id] || s.quests[id].st === 'done' || !['mq10', 'mq11', 'mq12'].includes(id)) return _qt();
    const p = G.player.pos, q = D.QUESTS[id];
    if (id === 'mq10') { const n = G.npcs.find(n => n.def.id === 'marc'); return n ? { x: n.x, y: n.y + 2.4, z: n.z, label: q.obj[0].text } : null; }
    if (!G.ch4.ready) return null;
    let best = null, bd = 1e9, label = '';
    const consider = (o, lab) => { const dd = Math.hypot(o.x - p.x, o.z - p.z); if (dd < bd) { bd = dd; best = o; label = lab; } };
    if (id === 'mq11') G.ch4.dungeons.forEach(d => { if (!s.dungeons[d.id]) consider(d, d.name + 'を突破する（推奨Lv.' + d.lv + '）'); });
    if (id === 'mq12') {
      G.ch4.stairs.forEach(st => { if (s.dungeons[st.dun.id] && !s.heaven[st.i]) consider({ x: st.x, y: st.y, z: st.z }, st.def.name + 'を登り、' + D.ENEMIES[st.def.boss].name + 'を倒す'); });
      if (!best) G.ch4.dungeons.forEach(d => { if (!s.dungeons[d.id]) consider(d, d.name + 'を突破して、天への階段を開く'); });
    }
    return best ? { x: best.x, y: (best.y || 0) + 8, z: best.z, label } : null;
  };
  // クエスト報酬のコインは減らした量で表示・付与（main.js 側で倍率をかける）
  G.coinGain = (n) => Math.max(1, Math.round(n * (D.COIN_MUL || 1)));

  // ---- ダンジョン（入場の確認・ボス撃破） ----
  const _ask = G.askDungeon;
  G.askDungeon = function (d) {
    if (!d.ch4) return _ask(d);
    const s = G.save, honest = D.PERS[s.pers].honest;
    const lim = honest ? '<br><small style="color:#ffb08a">正直者の誓い：制限時間 ' + Math.round(G.dungeonLimit(d) / 60) + '分</small>' : '';
    PS.UI.confirm('「' + d.name + '」に入りますか？<br><small>推奨レベル：' + d.lv + (s.dungeons[d.id] ? '　（突破済み）' : '') + '</small><br><small>世界の果てのギミックダンジョン（最高難易度）。スイッチの水晶や罠の仕掛けを突破しよう。</small>' + lim, () => G.enterDungeon(d.id));
  };
  const _bd = G.bossDefeated;
  G.bossDefeated = function (d) {
    if (d.def.sky) return G.skyWin(d);
    if (!d.def.ch4) return _bd(d);
    const id = d.def.id, s = G.save, first = !s.dungeons[id];
    PS.Audio.play('ruins'); G.bossActive = null; PS.UI.bossBar(null);
    PS.UI.banner('試練突破', d.def.name, d.def.color);
    const rm = d.boss; rm.chestOpen = false; d.portalOut = true; G.dunDeadline = 0;
    for (const r2 of d.rooms) r2.trap = null;
    if (first) {
      s.dungeons[id] = true; G.addItem('heavensteel', 3); G.addItem('pluscrystal', 2);
      G.addWeapon(D.TIER_WEAPON[D.DUNGEON_TIER[id]][D.PERS[s.pers].weapons[0]]);
      G.addCoins(Math.round(90000 * G.rewardMul())); G.questEvent('dungeon', id);
      const st = G.ch4.stairs.find(q => q.dun.id === id);
      if (st) setTimeout(() => { PS.UI.banner('天への階段が解放された！', st.def.name + ' ― ダンジョンの外に現れた', st.def.color); PS.Audio.sfxPlay('quest'); }, 4000);
    }
    G.writeSave(true);
  };

  // ---- ダンジョンの部屋（ギミック） ----
  G.customRoom = function (d, rm) {
    const def = d.def, lv = def.lv;
    if (def.sky) {
      if (rm.boss) { G.startSkyBoss(d, rm); return true; }
      const kinds = ['seraph_knight', 'seraph_archer', 'halo_wisp'], n = 3 + Math.min(3, rm.depth >> 1);
      for (let i = 0; i < n; i++) {
        const a = i / n * 6.283 + 0.3, k = kinds[(i + rm.depth) % 3];
        const e = G.dunSpawn(k, lv - 2 + (i % 3), rm.x + Math.cos(a) * 4.5, rm.z + Math.sin(a) * 4.5, { y0: rm.y }); rm.list.push(e);
        G.ring(e.x, e.y + 0.1, e.z, 2, [1, 0.9, 0.6], 0.6);
      }
      PS.Audio.play('battle'); PS.UI.notify('天界の番兵たちが立ちはだかる！', 'warn');
      return true;
    }
    if (!def.ch4) return false;
    const mobs = D.DUNGEON_MOBS[def.theme], pick = () => mobs[Math.floor(Math.random() * mobs.length)];
    if (rm.boss) {
      const b = G.dunSpawn(def.boss, 100, rm.x, rm.z - 6); b.maxHp = b.hp = Math.round(b.hp * 1.6); b.atk = Math.round(b.atk * 1.2);
      rm.list.push(b); G.bossActive = b; rm.trap = def.gim; rm.trapT = 6;
      PS.UI.banner(D.ENEMIES[def.boss].name + '・極', '世界の果ての番人 ― 罠にも気をつけろ！', def.color); PS.Audio.play('boss'); PS.Audio.sfxPlay('boss'); G.shake(0.6); G.supportSay('boss', true);
      return true;
    }
    if (rm.kind === 'switch' && rm.orbs) {
      const sw = rm.sw = { orbs: [], done: false };
      for (const o of rm.orbs) { const e = G.dunSpawn('sw_orb', lv, o.x, o.z, { y0: o.y, aggro: false, state: 'idle', orb: true, litAt: -99, anchor: true, swRoom: rm }); sw.orbs.push(e); rm.list.push(e); G.pillarFX(o.x, o.y, o.z, 0.8, 6, [0.5, 1, 0.85], 0.6); }
      for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283 + 0.5, e = G.dunSpawn(pick(), lv - 2 + (i % 3), rm.x + Math.cos(a) * 5, rm.z + Math.sin(a) * 5); rm.list.push(e); }
      PS.Audio.play('battle'); PS.UI.banner('スイッチの水晶', SW_T + '秒以内に、' + sw.orbs.length + 'つすべてを叩いて点灯させよう！', '#7fffd0');
      if (rm.orbs.some(o => o.y > 3)) setTimeout(() => PS.UI.notify('高い台座の水晶は、跳躍の靴で跳び乗って叩こう（遠距離攻撃でも届く）', 'info'), 2600);
      return true;
    }
    if (rm.kind === 'normal') {
      const n = Math.min(8, 4 + Math.floor(rm.depth / 3));
      for (let i = 0; i < n; i++) { const a = i / n * 6.28, e = G.dunSpawn(pick(), lv - 2 + Math.floor(Math.random() * 3), rm.x + Math.cos(a) * 6, rm.z + Math.sin(a) * 6); rm.list.push(e); G.ring(e.x, 0.1, e.z, 2, [0.8, 0.5, 1], 0.6); }
      if (rm.trap) { rm.trapT = 2.5; PS.UI.notify({ ice: 'つららが降ってくる部屋だ！ 足元の予兆に注意！', fire: '炎が噴き出す部屋だ！ 床の予兆を避けろ！', sand: '砂嵐が巻き起こる部屋だ！', thunder: '落雷の部屋だ！ 足元の予兆を避けろ！' }[rm.trap] || '罠の部屋だ！', 'warn'); }
      PS.Audio.play('battle');
      return true;
    }
    return false;
  };
  const _dmg = G.damageEnemy;
  G.damageEnemy = function (e, mult, el, o) {
    if (e && e.orb && !e.dead) { G.lightOrb(e); return 0; }
    return _dmg.call(this, e, mult, el, o);
  };
  G.lightOrb = function (e) {
    const fresh = G.time - e.litAt > SW_T; e.litAt = G.time; e._out = false; e.flash = 0.25;
    if (!fresh) return;
    const sw = e.swRoom && e.swRoom.sw, n = sw ? sw.orbs.filter(o => G.time - o.litAt <= SW_T).length : 1, tot = sw ? sw.orbs.length : 1;
    PS.Audio.sfxPlay('waypoint', 0.55); G.pillarFX(e.x, e.y, e.z, 0.9, 10, [0.5, 1, 0.85], 0.7); G.ring(e.x, e.y + 0.2, e.z, 2.2, [0.5, 1, 0.85], 0.5);
    PS.UI.dmgText(e.x, e.y + e.height + 0.8, e.z, '点灯 ' + n + '/' + tot, '#7fffd0');
  };
  G.trapHazard = function (d, rm) {
    const p = G.player.pos, def = d.def, lv = def.lv, atk = D.enemyStats('seraph_knight', lv).atk, g = rm.trap;
    if (g === 'fire') {
      const hw = rm.w / 2 - 1.2, off = (Math.random() - 0.5) * 3;
      if (Math.random() < 0.5) G.hazard({ owner: 'e', shape: 'rect', x: rm.x - hw, z: p.z + off, ty: p.y, yaw: Math.PI / 2, len: hw * 2, w: 2.8, delay: 1.25, mult: 0.75, atk, lv, el: 'fire', status: 'burn' });
      else G.hazard({ owner: 'e', shape: 'rect', x: p.x + off, z: rm.z - hw, ty: p.y, yaw: 0, len: hw * 2, w: 2.8, delay: 1.25, mult: 0.75, atk, lv, el: 'fire', status: 'burn' });
    } else if (g === 'sand') {
      for (let i = 0; i < 2; i++) { const a = Math.random() * 6.28, r = i ? 4 + Math.random() * 4 : 0; G.hazard({ owner: 'e', shape: 'circle', x: p.x + Math.cos(a) * r, z: p.z + Math.sin(a) * r, ty: p.y, r: 3.3, delay: 1.2, ticks: 4, interval: 0.45, mult: 0.28, atk, lv, el: 'earth', look: 'tornado', status: 'slow' }); }
    } else if (g === 'thunder') {
      for (let i = 0; i < 4; i++) { const a = Math.random() * 6.28, r = i ? 3 + Math.random() * 6 : 0; G.hazard({ owner: 'e', shape: 'circle', x: p.x + Math.cos(a) * r, z: p.z + Math.sin(a) * r, ty: p.y, r: 2.5, delay: 0.95 + i * 0.18, mult: 0.62, atk, lv, el: 'thunder' }); }
    } else {
      for (let i = 0; i < 3; i++) { const a = Math.random() * 6.28, r = i ? 3 + Math.random() * 5 : 0; G.hazard({ owner: 'e', shape: 'circle', x: p.x + Math.cos(a) * r, z: p.z + Math.sin(a) * r, ty: p.y, r: 2.6, delay: 1.15 + i * 0.15, mult: 0.68, atk, lv, el: 'ice', look: 'icespike', status: 'slow' }); }
    }
  };

  // ---- 天への階段 ----
  G.skyFight = null;
  const spawnHalo = (F, n, r) => {
    const off = Math.random() * 6.28, y = F.rm.y;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + off, x = F.rm.x + Math.cos(a) * r, z = F.rm.z + Math.sin(a) * r;
      const py = new G.Enemy('halo_pylon', 98, x, z, { y0: y, aggro: false }); py.ax = x; py.az = z;
      G.enemies.push(py); F.pylons.push(py);
      G.pillarFX(x, py.y, z, 1.2, 14, rgb(F.color), 0.8);
    }
  };
  G.startSkyBoss = function (d, rm) {
    const def = d.def, b = G.dunSpawn(def.boss, 100, rm.x, rm.z - 9, { y0: rm.y }); rm.list.push(b); G.bossActive = b;
    b.shield = true; b.shieldTip = '光輪の柱がシールドを張っている！ 先に柱を砕こう';
    const F = G.skyFight = { d, rm, boss: b, pylons: [], phase: 0, t: 7, shieldWas: true, color: def.color || '#fff2b0' };
    spawnHalo(F, 4, 15);
    PS.UI.banner(D.ENEMIES[def.boss].name, '天界の欠片を持つ熾天使 ― 光輪の柱を砕いてシールドを解除せよ', F.color);
    PS.Audio.play('boss'); PS.Audio.sfxPlay('boss'); G.shake(0.9); G.supportSay('boss', true);
  };
  G.updateSkyFight = function (dt) {
    const F = G.skyFight; if (!F) return;
    const b = F.boss, p = G.player.pos;
    if (!G.enemies.includes(b) || b.dead) { for (const py of F.pylons) if (!py.dead) { py.dead = true; py.deadT = 0; } G.skyFight = null; return; }
    let alive = 0;
    for (const py of F.pylons) {
      if (py.dead || !G.enemies.includes(py)) continue; alive++;
      py.x = py.ax; py.z = py.az; py.kx = py.kz = 0;
      if (Math.random() < dt * 30) { const t = Math.random(); G.emit(1, { x: PS.lerp(py.x, b.x, t), y: PS.lerp(py.y + 2, b.y + b.height * 0.5, t), z: PS.lerp(py.z, b.z, t), color: F.color, vs: 0.2, size: 0.35, life: 0.35, kind: 1, add: true }); }
    }
    b.shield = alive > 0;
    if (F.shieldWas && !b.shield) { PS.UI.banner('シールド解除！', '今がチャンスだ！', F.color); PS.Audio.sfxPlay('boss', 0.5); G.shake(0.6); b.st.stun = Math.max(b.st.stun || 0, 4); G.ring(b.x, b.y + 0.3, b.z, 9, [1, 0.95, 0.7], 0.6); }
    F.shieldWas = b.shield;
    if (F.phase === 0 && b.hp < b.maxHp * 0.66) { F.phase = 1; spawnHalo(F, 3, 13); b.atk = Math.round(b.atk * 1.1); PS.UI.banner('熾天使の怒り', '光輪の柱が再び現れた！', '#ff8aa8'); PS.Audio.sfxPlay('boss'); G.shake(0.8); }
    if (F.phase === 1 && b.hp < b.maxHp * 0.33) { F.phase = 2; spawnHalo(F, 4, 17); b.atk = Math.round(b.atk * 1.12); b.enraged = true; PS.UI.banner('天の裁き', '熾天使が最後の力を解き放った！', '#ff6a8a'); PS.Audio.sfxPlay('boss'); G.shake(1); G.supportSay('boss', true); }
    // 天罰：光の柱が降ってくる
    F.t -= dt;
    if (F.t <= 0) {
      F.t = [7, 5.4, 4.2][F.phase]; const n = 3 + F.phase;
      for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, r = i === 0 ? 0 : 4 + Math.random() * 7; G.hazard({ owner: 'e', shape: 'circle', x: p.x + Math.cos(a) * r, z: p.z + Math.sin(a) * r, ty: p.y, r: 3.2, delay: 1.4 + i * 0.15, mult: 0.85, atk: b.atk, lv: b.lv, el: b.def0.el, look: 'meteor', src: b }); }
    }
  };
  G.skyWin = function (d) {
    const s = G.save, i = d.def.i, first = !s.heaven[i], key = d.def.boss;
    if (G.skyFight) for (const py of G.skyFight.pylons) if (!py.dead) { py.dead = true; py.deadT = 0; }
    G.skyFight = null; G.bossActive = null; PS.UI.bossBar(null); PS.Audio.play('heaven');
    const rm = d.boss; rm.chestOpen = false; d.portalOut = true;
    G.pillarFX(rm.x, rm.y, rm.z, 3, 80, rgb(d.def.color || '#fff2b0'), 3);
    if (first) {
      s.heaven[i] = true; G.addItem('heavenshard', 1); G.addItem('seraphfeather', 2);
      G.addWeapon(D.TIER_WEAPON[12][D.PERS[s.pers].weapons[0]]);
      G.addCoins(Math.round(200000 * G.rewardMul())); G.questEvent('boss', key);
      setTimeout(() => { PS.UI.banner('天界の欠片を手に入れた！', d.def.name + '（' + s.heaven.filter(x => x).length + '/4）', d.def.color); PS.Audio.sfxPlay('quest'); }, 1500);
      if (G.ch4Done()) setTimeout(() => G.finalWin4(), 6000);
    } else { G.addItem('seraphfeather', 1); setTimeout(() => PS.UI.banner('熾天使を鎮めた', '熾天使の羽根を手に入れた', d.def.color), 1200); }
    G.writeSave(true);
  };
  G.enterSky = function (i) {
    const st = G.ch4.stairs[i], S = st.def;
    const def = { id: 'sky' + i, i, sky: true, name: S.name, theme: 'heaven', lv: 100, boss: S.boss, reg: st.dun.reg, color: S.color, pm: st.dun.pm, ctier: 12 };
    G.fade(1.4); PS.Audio.sfxPlay('waypoint');
    setTimeout(() => {
      const p = G.player;
      G.dunReturn = [st.ex, st.ey, st.ez];
      G.dun = PS.Dungeon.buildSky(def, 9100 + i * 131);
      G.scene = 'dungeon'; G.clearWorldEnemies(); G.fx = []; G.parts = []; G.skyFight = null;
      p.pos.x = G.dun.start.x; p.pos.z = G.dun.start.z; p.pos.y = 0; p.mode = 'ground'; p.vel.x = p.vel.y = p.vel.z = 0; p.yaw = Math.PI; G.cam.yaw = Math.PI; G.cam.pitch = 0.18;
      p.lastSafe = { x: p.pos.x, y: 0, z: p.pos.z };
      G.cam.tx = p.pos.x; G.cam.ty = 1.5; G.cam.tz = p.pos.z;
      for (const rm of G.dun.rooms) { rm.cleared = rm.start || rm.kind === 'rest'; rm.active = false; rm.chestOpen = undefined; }
      G.dun.checkpoint = null; G.dun.abil = {}; G.dunDeadline = 0;
      PS.Audio.play('heaven'); PS.UI.regionTitle(S.name, '天界へと続く階段　推奨レベル 100');
      G.partyArrive(); G.supportSay('dungeon'); PS.UI.refreshAll();
      if (G.save.heaven[i]) setTimeout(() => PS.UI.notify('この階段の熾天使はすでに鎮めた。頂では何度でも戦える', 'info'), 1800);
      else setTimeout(() => PS.UI.notify('浮島をつなぐ階段を登り、頂の決戦場を目指そう', 'quest'), 1800);
    }, 500);
  };
  const _lds = G.leaveDungeonState;
  G.leaveDungeonState = function () { G.skyFight = null; return _lds(); };
  const _denv = G.dungeonEnv;
  G.dungeonEnv = function () {
    if (!G.dun || !G.dun.sky) return _denv();
    const e = G.computeEnv(11.2, [1, 0, 0, 0, 0]);
    e.skyTop = PS.hexRGB('#356fcf'); e.skyHor = PS.hexRGB('#cfe0f6'); e.fogDen = 0.0026; e.fogStart = 90; e.far = 1500; e.exposure = 0.86;
    e.lightCol = e.lightCol.map(v => v * 0.85); e.ambTop = e.ambTop.map(v => v * 0.8); e.ambBot = e.ambBot.map(v => v * 0.8);
    return e;
  };
  G.dunBGM = () => (G.dun && G.dun.sky ? 'heaven' : G.dun && G.dun.def.ch2 ? 'ruins' : 'dungeon');
  const _hz = G.hazard;
  G.hazard = function (o) { if (o.ty == null && G.scene === 'dungeon' && G.dun && G.dun.sky && G.player) o.ty = G.player.pos.y + 1.2; return _hz(o); };

  // ---- 仲間になる（人数の上限なし。空いている数字キーに自動で割り当て） ----
  G.recruitComp = function (id) {
    const ps = G.partySave(); if (ps.list.includes(id)) return;
    ps.list.push(id); const c = D.COMPANIONS[id]; ps.keys = ps.keys || {};
    let k = 0; for (let n = 1; n <= (D.SWITCH_KEYS || 9); n++) if (!ps.keys[n]) { k = n; break; }
    if (k) ps.keys[k] = id;
    PS.UI.banner('NEW COMPANION', c.title + ' ' + c.name + ' が仲間になった！', c.color); PS.Audio.sfxPlay('quest');
    G.npcs = G.npcs.filter(n => n.def.comp !== id);
    G.buildParty(); G.writeSave(true); PS.UI.refreshParty();
    setTimeout(() => PS.UI.notify(k ? 'キー ' + k + ' を押すと、' + c.name + 'に人格を切り替えて操作できます（仲間画面で変更可）' : c.name + 'を操作するには、仲間画面（P）で数字キーを割り当てよう', 'info'), 2600);
  };
  // ---- 回復・復活で全員のHPを戻す ----
  const _pray = G.pray; G.pray = function (v) { G.charHp = {}; return _pray(v); };
  const _rs = G.restSpring; G.restSpring = function (it) { G.charHp = {}; return _rs(it); };
  const _rv = G.revive; G.revive = function () { G.charHp = {}; G.skyFight = null; return _rv(); };

  // ---- 調べる ----
  const _int = G.interactables;
  G.interactables = function () {
    const out = _int(), s = G.save, p = G.player.pos, near = (x, z, r) => Math.hypot(x - p.x, z - p.z) < r;
    if (G.scene === 'world' && G.ch4.ready) for (const st of G.ch4.stairs) {
      if (!near(st.ex, st.ez, 5.5)) continue;
      if (s.dungeons[st.dun.id]) out.unshift({ icon: '🌟', text: '登る：' + st.def.name, f: () => PS.UI.confirm('「' + st.def.name + '」を登りますか？<br><small>頂では天界の欠片を持つ熾天使「' + D.ENEMIES[st.def.boss].name + '」が待っている（推奨Lv.100）</small>' + (s.heaven[st.i] ? '<br><small>（この熾天使はすでに鎮めた。再び戦うと熾天使の羽根が手に入る）</small>' : ''), () => G.enterSky(st.i)) });
      else out.unshift({ icon: '🔒', text: '天への階段（封印中）', f: () => PS.UI.dialog('天への階段', ['光の階段は、まだ封印されている……', '近くの「' + st.dun.name + '」を突破すれば、封印が解けるようだ。']) });
    }
    // 表示名：ギミックダンジョン／天への階段
    if (G.scene === 'world' && G.ch4.ready) for (const o of out) if (o.text.indexOf('遺跡に入る：') === 0 && G.ch4.dungeons.some(d => o.text.endsWith(d.name))) o.text = o.text.replace('遺跡に入る：', 'ダンジョンに入る：');
    if (G.scene === 'dungeon' && G.dun && (G.dun.sky || G.dun.def.ch4)) for (const o of out) if (o.text === '迷宮から出る' || o.text === '外へ戻る') o.text = G.dun.sky ? '地上へ戻る' : 'ダンジョンから出る';
    if (G.scene === 'dungeon' && G.dun && G.dun.sky) for (const it of G.dun.items) {
      if (it.t === 'fruit' && !it.taken && it.room.cleared && Math.abs(p.y - it.y) < 3 && near(it.x, it.z, 2.4)) out.push({ icon: '🍑', text: '拾う：天界の果実', f: () => { it.taken = true; G.addItem('heavenfruit', 1); PS.Audio.sfxPlay('pickup'); G.emit(12, { x: it.x, y: it.y + 0.7, z: it.z, color: '#fff2b0', vs: 2, size: 0.25, life: 0.7, kind: 1 }); } });
    }
    return out;
  };

  // ---- 毎フレーム ----
  const _upd = G.update;
  G.update = function (dt, I) {
    _upd(dt, I);
    if (!G.save || !G.player) return;
    G.plusTick(dt);
    // 控えのキャラはゆっくり回復する
    for (const k in G.charHp) if (k !== G.curId() && G.charHp[k] < 1) G.charHp[k] = Math.min(1, G.charHp[k] + dt * 0.012);
    const p = G.player.pos;
    if (G.scene === 'world') {
      // プラスクリスタルのきらめき
      if (W.expanded && Math.random() < dt * 8) for (const g of W.gathers) if (g.plus && !g.taken && Math.abs(g.x - p.x) < 70 && Math.abs(g.z - p.z) < 70 && Math.random() < 0.3) G.emit(1, { x: g.x + (Math.random() - 0.5), y: g.y + 0.6 + Math.random() * 0.8, z: g.z + (Math.random() - 0.5), color: '#ffe8a0', vs: 0.2, vy: 1.2, size: 0.18, life: 0.9, kind: 1 });
      return;
    }
    const d = G.dun; if (!d) return;
    if (d.def.ch4) {
      for (const rm of d.rooms) {
        if (rm.active && rm.sw && !rm.sw.done) {
          const orbs = rm.sw.orbs, lit = orbs.filter(o => G.time - o.litAt <= SW_T);
          for (const o of orbs) {
            const on = G.time - o.litAt <= SW_T;
            if (on && Math.random() < dt * 20) G.emit(1, { x: o.x + (Math.random() - 0.5) * 0.8, y: o.y + 1 + Math.random() * 0.8, z: o.z + (Math.random() - 0.5) * 0.8, color: '#7fffd0', vs: 0.3, vy: 2, size: 0.22, life: 0.6, kind: 1 });
            if (o.litAt > 0 && !on && !o._out) { o._out = true; if (!lit.length) { PS.UI.notify('水晶の光が消えてしまった……もう一度！', 'warn'); PS.Audio.sfxPlay('deny', 0.5); } }
          }
          if (lit.length === orbs.length) {
            rm.sw.done = true;
            for (const o of orbs) { o.dead = true; o.deadT = 0; G.pillarFX(o.x, o.y, o.z, 1.2, 18, [0.5, 1, 0.85], 1.2); }
            PS.UI.banner('スイッチ解除！', rm.list.some(e => !e.dead && !e.orb) ? '残りの敵を倒そう' : '封印が解かれていく……', '#7fffd0'); PS.Audio.sfxPlay('quest', 0.7); G.shake(0.4);
          }
        }
        if (rm.active && rm.trap && G.state === 'play') { rm.trapT = (rm.trapT || 2) - dt; if (rm.trapT <= 0) { rm.trapT = rm.boss ? 3.8 : 2.3; G.trapHazard(d, rm); } }
      }
    }
    if (d.sky) {
      G.updateSkyFight(dt);
      for (const e of G.enemies) if (!e.dead && e.y < -30) { if (e.boss || e.key === 'halo_pylon') { e.x = d.arena.x; e.z = d.arena.z - 6; e.gy = d.arena.y; e.vy = 0; } else G.killEnemy(e); }
      if (Math.random() < dt * 3) { const a = Math.random() * 6.28, r = 20 + Math.random() * 60; G.emit(1, { x: p.x + Math.cos(a) * r, y: p.y - 5 + Math.random() * 30, z: p.z + Math.sin(a) * r, color: '#fff6d8', vs: 0.3, vy: 0.6, size: 0.25, life: 3, kind: 1, alpha: 0.6 }); }
    }
  };
  const _huk = G.handleUIKeys;
  G.handleUIKeys = function (I) {
    for (let n = 1; n <= 9; n++) if (I.was('char' + n)) { if (n > (D.SWITCH_KEYS || 9)) { PS.UI.notify('人格切り替えに使えるキーは 1〜' + (D.SWITCH_KEYS || 9) + ' です（主人公＋仲間' + ((D.SWITCH_KEYS || 9) - 1) + '人まで）', 'info'); return; } G.keySwitch(n); return; }
    if (I.was('plus')) { G.plusEvolve(); return; }
    _huk(I);
  };

  // ---- 描画 ----
  const _ds = G.drawShrines;
  G.drawShrines = function (pass) {
    _ds(pass);
    if (!G.ch4.ready) return;
    const s = G.save;
    for (const st of G.ch4.stairs) {
      if (!R.visible(st.x, st.y + 80, st.z, 100)) continue;
      M4.compose(tmpM, st.x, st.y, st.z, 0, st.ry, 0, 1); R.drawMesh(st.mesh.base, tmpM);
      if (s.dungeons[st.dun.id]) R.drawMesh(st.mesh.steps, tmpM, null, 0.4);
    }
  };
  const _sfx = G.shrineFX;
  G.shrineFX = function () {
    _sfx();
    const s = G.save; if (!G.ch4.ready || !s) return;
    for (const st of G.ch4.stairs) {
      const c = rgb(st.def.color);
      if (s.dungeons[st.dun.id] && !s.heaven[st.i]) G.fx.push({ mode: 2, x: st.x, y: st.y + 3, z: st.z, size: [1.6, 460, 1.6], color: [c[0], c[1], c[2], 0.38], t: 0.5, dur: 1, add: true, once: true });
      else if (!s.dungeons[st.dun.id]) { const dc = rgb(st.dun.color); G.fx.push({ mode: 2, x: st.dun.x, y: st.dun.y, z: st.dun.z, size: [1.2, 260, 1.2], color: [dc[0], dc[1], dc[2], 0.22], t: 0.5, dur: 1, add: true, once: true }); }
      if (s.dungeons[st.dun.id]) G.fx.push({ mode: 4, x: st.ex, y: st.ey + 0.08, z: st.ez, size: [2.2, 1, 2.2], color: [c[0], c[1], c[2], 0.9], t: 0.5, dur: 1, add: true, once: true, shape: [1, 0, 0, 0] });
    }
  };
  const _dd = G.drawDungeon;
  G.drawDungeon = function (pass) {
    _dd(pass);
    const d = G.dun; if (!d) return;
    if (d.sky) for (const it of d.items) if (it.t === 'fruit' && !it.taken) { M4.compose(tmpM, it.x, it.y, it.z, 0, G.time * 0.5, 0, 1.6); R.drawMesh(G.gatherMesh.heavenfruit, tmpM); }
  };
  // 光の柱（スイッチの水晶・熾天使のシールド）
  G.ch4TransFX = function () {
    const d = G.dun; if (G.scene !== 'dungeon' || !d) return;
    if (d.def.ch4) for (const rm of d.rooms) if (rm.active && rm.sw && !rm.sw.done) for (const o of rm.sw.orbs) {
      const left = SW_T - (G.time - o.litAt), on = left > 0;
      G.fx.push({ mode: 2, x: o.x, y: o.y, z: o.z, size: [0.7, on ? 14 : 4, 0.7], color: on ? [0.5, 1, 0.85, 0.3 + 0.4 * left / SW_T] : [0.5, 0.7, 0.8, 0.12], t: 0.5, dur: 1, add: true, once: true });
    }
    const F = G.skyFight;
    if (F && F.boss.shield && !F.boss.dead) { const b = F.boss; G.fx.push({ mode: 2, x: b.x, y: b.y - 0.5, z: b.z, size: [b.radius * b.scale + 1.6, b.height + 2, b.radius * b.scale + 1.6], color: [1, 0.95, 0.7, 0.16], t: 0.5, dur: 1, add: true, once: true }); }
    if (d.sky && d.items) for (const it of d.items) if (it.t === 'fruit' && !it.taken && it.room.cleared) G.fx.push({ mode: 2, x: it.x, y: it.y, z: it.z, size: [0.5, 5, 0.5], color: [1, 0.9, 0.5, 0.35], t: 0.5, dur: 1, add: true, once: true });
  };

  // =====================================================================
  //  UI
  // =====================================================================
  const _uiInit = UI.init;
  UI.init = function () {
    _uiInit();
    const pf = $('.pframe .pf-body'); if (pf && !$('.pbuffs')) pf.insertAdjacentHTML('beforeend', '<div class="pbuffs"></div>');
    if (!$('.c4info')) $('#hud').insertAdjacentHTML('beforeend', '<div class="c4info hidden"></div>');
  };
  // 主人公／操作中のキャラの表示
  UI.refreshSkills = function () {
    const s = G.save; if (!s) return; const id = G.curId(), P = D.PERS[s.pers];
    $('.pname').textContent = G.charName(id); $('.pf-emb span').textContent = G.charIcon(id); $('.pf-emb').style.setProperty('--pc', G.charColor(id));
    $('.pf-pers').textContent = id === 'hero' ? P.name : D.COMPANIONS[id].title;
    $('.sk-q').classList.toggle('awk', G.pk() === 'awakener');
    UI._bf2 = null;
  };
  UI.updateSkillCD = function (p, s) {
    const set = (el, ic, cd, max, label, locked) => {
      el.querySelector('.sk-ic').textContent = ic; const c = el.querySelector('.sk-cd'), t = el.querySelector('.sk-t');
      el.classList.toggle('locked', !!locked);
      if (cd > 0) { c.style.background = `conic-gradient(rgba(6,10,24,.78) ${cd / max * 360}deg, transparent 0)`; t.textContent = cd >= 10 ? Math.ceil(cd) : cd.toFixed(1); } else { c.style.background = 'none'; t.textContent = label || ''; }
      el.classList.toggle('ready', !(cd > 0) && !locked);
    };
    const e = $('.sk-e'), q = $('.sk-q'), pk = G.pk();
    if (pk === 'awakener') {
      const A = p.awk; q.classList.add('awk');
      set(q, '☄', A.on ? 0 : A.cd, 40, A.on ? Math.ceil(A.t) + 's' : '', false); q.classList.toggle('active', A.on);
      e.classList.add('hidden');
    } else {
      e.classList.remove('hidden'); q.classList.remove('awk', 'active');
      const sk2 = G.slotSkills();
      [e, q].forEach((el, i) => { const sk = sk2[i]; if (!sk) set(el, '·', 0, 1, '', true); else set(el, UI.skillGlyph(sk), p.cd[sk.id] || 0, sk.cd * (pk === 'mage' ? 0.85 : 1), '', false); if (sk) el.style.setProperty('--sc', D.ELEM[sk.el || 'phys'].c); });
    }
  };
  // 人格切り替えのリスト（HUD左）
  UI.refreshParty = function () {
    const el = $('.party-strip'); if (!el || !G.save) return;
    const ps = G.partySave(), cur = G.curId(), keys = ps.keys || {};
    let html = '';
    for (let n = 1; n <= (D.SWITCH_KEYS || 9); n++) {
      const id = keys[n]; if (!id) continue;
      html += `<div class="pt-c sw ${id === cur ? 'cur' : ''}" data-id="${id}" data-k="${n}" style="--cc:${G.charColor(id)}"><kbd class="pt-k">${n}</kbd><div class="pt-ic">${G.charIcon(id)}</div><div class="pt-b"><div class="pt-n">${G.charName(id)}<small>${G.charSub(id)}</small></div><div class="pt-hp"><i></i></div></div></div>`;
    }
    for (const f of G.fairies || []) { const S = D.SUPPORT[f.id], cp = D.COMPAT[D.compatOf(f.id, G.save.pers)]; html += `<div class="pt-f" style="--cc:${S.color}"><span>${S.icon}</span>${S.name}<small>${f.id === 'lumi' ? 'R：回復' : `<b style="color:${cp.c}">${cp.name}</b> ${D.supEffect(f.id, G.save.pers)}`}</small></div>`; }
    el.innerHTML = html; UI._ptEls = $$('.pt-c', el); UI._ptKey = cur + '|' + JSON.stringify(keys) + '|' + (G.fairies || []).map(f => f.id).join();
    for (const b of UI._ptEls) {
      const go = (e) => { e.preventDefault(); e.stopPropagation(); G.switchChar(b.dataset.id); };
      b.addEventListener('touchstart', go, { passive: false });
    }
    const sup = $('.qsup'), fz = G.fairies || [], main = fz.find(f => f.id === 'lumi') || fz[0];
    if (sup) { sup.classList.toggle('hidden', !main); if (main) { sup.querySelector('.qs-ic').textContent = D.SUPPORT[main.id].icon; sup.classList.toggle('passive', main.id !== 'lumi'); sup.style.setProperty('--sc', D.SUPPORT[main.id].color); } }
  };
  UI.updateParty = function () {
    const ps = G.partySave(), cur = G.curId(), key = cur + '|' + JSON.stringify(ps.keys || {}) + '|' + (G.fairies || []).map(f => f.id).join();
    if (key !== UI._ptKey) { UI.refreshParty(); return; }
    for (const e of UI._ptEls || []) {
      const id = e.dataset.id, r = id === cur ? G.player.hp / G.pstat.hp : (G.charHp[id] != null ? G.charHp[id] : 1);
      e.querySelector('.pt-hp i').style.width = (PS.clamp(r, 0, 1) * 100) + '%'; e.classList.toggle('low', r < 0.3);
    }
    const sup = $('.qsup');
    const lumiOn = (G.fairies || []).some(f => f.id === 'lumi');
    if (sup && lumiOn) {
      const cd = G.supportCd, c = sup.querySelector('.sk-cd'), n = sup.querySelector('.qs-n');
      if (cd > 0) { c.style.background = `conic-gradient(rgba(6,10,24,.78) ${cd / 10 * 360}deg, transparent 0)`; n.textContent = Math.ceil(cd); } else { c.style.background = 'none'; n.textContent = ''; }
      sup.classList.toggle('ready', !(cd > 0) && G.player.hp < G.pstat.hp);
    } else if (sup && (G.fairies || []).length) { const f0 = G.fairies[0]; sup.querySelector('.qs-n').textContent = f0.id === 'fuwarin' ? 'x' + G.baseMul() : ''; }
  };
  // プラス進化のボタン・残り時間・副作用・ギミックの案内
  const _frame = UI.frame;
  UI.frame = function (dt) {
    _frame(dt);
    if (G.state !== 'play' && G.state !== 'dead') return;
    const s = G.save, p = G.player; if (!s || !p) return;
    const plus = G.plusOn();
    $('.lv').textContent = plus ? 'Lv.' + s.level + '+' + D.PLUS.lv : 'Lv.' + s.level; $('.lv').classList.toggle('plus', plus);
    const fl = $('.flight'); if (fl) { const on = G.pk() === 'flyer'; fl.classList.toggle('hidden', !on); if (on) { fl.querySelector('i').style.width = (p.fly.t / G.flightMax() * 100) + '%'; fl.classList.toggle('on', p.mode === 'fly'); } }
    const pb = $('.pbuffs');
    if (pb) {
      let t = '';
      if (plus) t += `<span class="bf plus">✚ プラス進化 ${mmss(s.plus.end - s.play)}</span>`;
      if (s.plus && s.plus.sideEnd && s.play < s.plus.sideEnd) { const sd = D.PLUS.side[s.pers]; if (sd) t += `<span class="bf deb ${G.curComp() ? 'off' : ''}">副作用：${sd.short} ${mmss(s.plus.sideEnd - s.play)}${G.curComp() ? '（仲間は無効）' : ''}</span>`; }
      if (G.curComp()) t += `<span class="bf sw">${D.COMPANIONS[G.curComp()].title}を操作中</span>`;
      if (t !== UI._bf2) { pb.innerHTML = t; UI._bf2 = t; }
    }
    const qp = $('.qplus');
    if (qp) {
      const have = s.inv.pluscrystal || 0, ng = !!D.PLUS.ng[s.pers], show = !ng && (plus || have > 0 || s.level >= D.PLUS.minLv) && (s.chapter >= 2 || W.expanded);
      qp.classList.toggle('hidden', !show);
      if (show) {
        const ok = !plus && have >= D.PLUS.cost && s.level >= D.PLUS.minLv;
        qp.classList.toggle('ready', ok); qp.classList.toggle('active', plus);
        const txt = plus ? mmss(s.plus.end - s.play) : Math.min(have, 99) + '/' + D.PLUS.cost; if (qp._t !== txt) { qp._t = txt; qp.querySelector('.qp-n').textContent = txt; }
      }
    }
    // 左上の表示が伸びても、人格切り替えのリストと重ならないように
    UI._lay = (UI._lay || 0) + dt;
    if (UI._lay > 0.25) {
      UI._lay = 0; const pf = $('.pframe'), st = $('.party-strip'), dk = $('.dock');
      if (pf && st && UI.hud) {
        const r = pf.getBoundingClientRect(), hr = UI.hud.getBoundingClientRect();
        if (r.height > 0) {
          let top = r.bottom - hr.top + 8;
          if (PS.isMobile && dk) { dk.style.top = Math.round(r.bottom - hr.top + 6) + 'px'; const dr = dk.getBoundingClientRect(); top = dr.bottom - hr.top + 10; } else if (dk) dk.style.top = '';
          st.style.top = Math.round(top) + 'px';
        }
      }
    }
    // スイッチの水晶・熾天使の案内
    const ci = $('.c4info');
    if (ci) {
      let t = '';
      const d = G.dun;
      if (G.scene === 'dungeon' && d && d.def.ch4) { const rm = d.rooms.find(r => r.active && r.sw && !r.sw.done); if (rm) { const lit = rm.sw.orbs.filter(o => G.time - o.litAt <= SW_T); const left = lit.length ? Math.min(...lit.map(o => SW_T - (G.time - o.litAt))) : SW_T; t = `<b>スイッチの水晶</b> ${lit.length} / ${rm.sw.orbs.length} 点灯${lit.length ? `　<em>のこり ${left.toFixed(1)}秒</em>` : `　<small>${SW_T}秒以内にすべて叩こう</small>`}`; } }
      const F = G.skyFight; if (F && !F.boss.dead) { const n = F.pylons.filter(q => !q.dead).length; t = n ? `<b>光輪の柱</b> のこり ${n}本　<small>柱を砕くとシールドが消える</small>` : '<b>シールド解除中</b>　<em>今がチャンス！</em>'; }
      if (t !== ci._t) { ci._t = t; ci.innerHTML = t; ci.classList.toggle('hidden', !t); }
    }
  };
  // 仲間メニュー：旅の仲間（人格切り替え）
  const _rp = UI.renderParty;
  UI.renderParty = function (el, tab, sel) {
    if (tab === 'sup') return _rp(el, tab, sel);
    const s = G.save, ps = G.partySave(), cur = G.curId();
    const tabs = [['comp', '旅の仲間'], ['sup', 'サポートキャラ']];
    const ids = ['hero'].concat(D.COMP_ORDER);
    sel = sel && (sel === 'hero' || D.COMPANIONS[sel]) ? sel : cur;
    const lockOf = (c) => (c.ch || (c.v >= 5 ? 2 : 1)) > (s.chapter || 1) && !ps.list.includes(c.id);
    const list = ids.map(id => {
      if (id === 'hero') return `<button class="pa-it ${sel === 'hero' ? 'on' : ''}" data-id="hero" style="--cc:${G.charColor('hero')}"><span class="pa-ic">${G.charIcon('hero')}</span><span class="pa-nm">${s.name}<small>主人公・${D.PERS[s.pers].name}</small></span>${cur === 'hero' ? '<em>操作中</em>' : ''}${G.charKey('hero') ? `<kbd>${G.charKey('hero')}</kbd>` : ''}</button>`;
      const c = D.COMPANIONS[id], got = ps.list.includes(id), lock = lockOf(Object.assign({ id }, c)), k = G.charKey(id);
      return `<button class="pa-it ${id === sel ? 'on' : ''} ${got ? '' : 'ng'} ${lock ? 'lock' : ''}" data-id="${id}" style="--cc:${c.color}"><span class="pa-ic">${lock ? '？' : c.icon}</span><span class="pa-nm">${lock ? '？？？' : c.name}<small>${lock ? '第' + (c.ch || 2) + '章で出会える' : c.title}</small></span>${cur === id ? '<em>操作中</em>' : got || lock ? '' : '<em class="ng">未加入</em>'}${got && k ? `<kbd>${k}</kbd>` : ''}</button>`;
    }).join('');
    const keyRow = (id) => `<div class="pa-keys"><span>キー割り当て</span>${D.keyList().map(n => { const o = (ps.keys || {})[n]; return `<button class="kk ${o === id ? 'on' : ''} ${o && o !== id ? 'used' : ''}" data-k="${n}" title="${o && o !== id ? G.charName(o) + 'が割り当て中' : ''}">${n}</button>`; }).join('')}${id !== 'hero' ? `<button class="kk none ${G.charKey(id) ? '' : 'on'}" data-k="0">なし</button>` : ''}</div>`;
    let det = '';
    if (sel === 'hero') {
      const P = D.PERS[s.pers], st = G.calcStats(null);
      det = `<div class="pa-hero" style="--cc:${P.color}"><div class="pa-emb">${P.icon}</div><div><div class="pa-en">HERO</div><div class="pa-name">${s.name}<small>${P.name}</small></div><div class="pa-q">転生した主人公。人格は「${P.name}」。</div></div></div>
        <div class="pa-stats"><div><span>HP</span><b>${fmt(st.hp)}</b></div><div><span>攻撃力</span><b>${fmt(st.atk)}</b></div><div><span>防御力</span><b>${fmt(st.def)}</b></div><div><span>移動速度</span><b>x${st.spd.toFixed(2)}</b></div></div>
        ${keyRow('hero')}
        <div class="pa-btns">${cur === 'hero' ? '<button class="btn" disabled>操作中</button>' : '<button class="btn on swgo">主人公に切り替える</button>'}</div>
        <div class="ch-note">人格切り替え：数字キー（1〜4）を押すと、割り当てたキャラに切り替えて自分で操作できます。切り替えられるのは主人公＋旅の仲間3人までです。ほかの仲間を使いたいときは、ここでキーを付け替えてください。</div>`;
    } else {
      const c = D.COMPANIONS[sel], got = ps.list.includes(sel), lock = lockOf(Object.assign({ id: sel }, c));
      if (lock) det = `<div class="pa-lock"><div class="big">？</div><b>まだ見ぬ仲間</b><p>第${c.ch || 2}章で、どこかで出会えるかもしれない……</p></div>`;
      else {
        const st = G.compStats(sel), sk = D.compSkills(sel), sl = G.compSkillSel(sel), live = cur === sel, r = live ? G.player.hp / G.pstat.hp : (G.charHp[sel] != null ? G.charHp[sel] : 1);
        const wt = { scythe: '大鎌', axe: '斧', sword: '剣', staff: '杖', bow: '弓', hammer: 'ハンマー', club: '棍棒', lute: '竪琴', orb: '宝珠', lance: '槍' }[c.wtype] || c.wtype;
        const learned = G.compLearned(sel);
        det = `<div class="pa-hero" style="--cc:${c.color}"><div class="pa-emb">${c.icon}</div><div><div class="pa-en">${c.en}</div><div class="pa-name">${c.title}　${c.name}<small>${c.gender === 'f' ? '♀' : '♂'}</small></div><div class="pa-q">「${c.quote}」</div></div></div>
          <p class="pa-desc">${c.desc}</p>
          ${got ? `<div class="pa-stats"><div><span>HP</span><b>${fmt(st.hp)}</b></div><div><span>攻撃力</span><b>${fmt(st.atk)}</b></div><div><span>防御力</span><b>${fmt(st.def)}</b></div><div><span>移動速度</span><b>x${st.spd}</b></div><div><span>武器</span><b>${wt}</b></div><div><span>戦い方</span><b>${({ sword: '剣', axe: '斧', staff: '魔法・遠距離' })[WMAP[c.wtype] || 'sword']}・${D.ELEM[c.el || 'phys'].name}</b></div></div>
          <div class="pa-live"><span>HP</span><div class="pt-hp"><i style="width:${PS.clamp(r, 0, 1) * 100}%"></i></div><b>${Math.round(PS.clamp(r, 0, 1) * 100)}%</b></div>
          ${keyRow(sel)}
          <div class="pa-btns">${live ? '<button class="btn" disabled>操作中</button>' : '<button class="btn on swgo">このキャラに切り替える</button>'}</div>
          ${c.atkPer2 ? `<div class="ch-note">Lv.2アップごとに攻撃力 +${c.atkPer2}（現在 +${fmt(Math.floor(G.effLevel() / 2) * c.atkPer2)}）</div>` : ''}` : `<div class="pa-cond"><b>出会える場所：${UI.compWhere(c)}</b><span>${c.condText}</span></div>`}
          <div class="pe-md"><div><h4>得意</h4><ul>${c.merit.map(m => '<li>' + m + '</li>').join('')}</ul></div><div><h4>苦手</h4><ul>${c.demerit.map(m => '<li>' + m + '</li>').join('')}</ul></div></div>
          <h4 class="pa-h">スキル <small>Lv.10ごとに習得。習得したスキルを E／Q にセットできます</small></h4>
          ${got ? `<div class="sk-slots"><div class="slot">E：<b>${sl[0] ? sl[0].name : '未装備'}</b></div><div class="slot">Q：<b>${sl[1] ? sl[1].name : '未装備'}</b></div></div>` : ''}
          <div class="pa-sk">${sk.sort((a, b) => a.lv - b.lv).map(k => { const ok = got && learned.some(q => q.id === k.id); return `<div class="pa-sr ${got && k.lv <= s.level ? '' : 'lock'}" style="--sc:${D.ELEM[k.el || c.el || 'phys'].c}"><span class="pa-lv">Lv.${k.lv}</span><b>${k.name}</b><small>${k.desc}</small>${ok ? `<span class="pa-eq"><button class="btn sm" data-sl="${k.slot}" data-to="0">E</button><button class="btn sm" data-sl="${k.slot}" data-to="1">Q</button></span>` : ''}</div>`; }).join('')}</div>`;
      }
    }
    el.querySelector('.pa-wrap').innerHTML = `<div class="pa-list"><h2 class="pn-h">仲間</h2><div class="pa-tabs tabs">${tabs.map(t => `<button class="${t[0] === tab ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div><div class="pa-items">${list}</div>
      <div class="pa-foot">旅の仲間 ${ps.list.length}人（上限なし）／ 操作中：${G.charName(cur)}</div></div><div class="pa-det">${det}</div>`;
    $$('.pa-tabs button', el).forEach(b => b.onclick = () => { PS.Audio.sfxPlay('ui'); UI.renderParty(el, b.dataset.t); });
    $$('.pa-it', el).forEach(b => b.onclick = () => { PS.Audio.sfxPlay('ui'); UI.renderParty(el, tab, b.dataset.id); });
    $$('.pa-keys .kk', el).forEach(b => b.onclick = () => { if (G.assignKey(sel, +b.dataset.k)) { PS.Audio.sfxPlay('ui'); G.writeSave(true); UI.refreshParty(); } UI.renderParty(el, tab, sel); });
    $$('[data-sl]', el).forEach(b => b.onclick = () => {
      const cs = ps.cskills[sel] || G.compSkillSel(sel).map(k => (k ? k.slot : -1)), sl2 = +b.dataset.sl, to = +b.dataset.to, o = cs.indexOf(sl2);
      if (o >= 0) cs[o] = cs[to]; cs[to] = sl2; ps.cskills[sel] = cs; PS.Audio.sfxPlay('ui'); G.writeSave(true); UI.renderParty(el, tab, sel);
    });
    const go = el.querySelector('.swgo'); if (go) go.onclick = () => { UI.closeAll(); setTimeout(() => G.switchChar(sel), 60); };
  };
  // 設定：人格切り替え（キーの割り当て）
  UI.switchSettingsHTML = function () {
    if (!G.save || !G.player) return '<div class="set-note">ゲームを始めると、ここで人格切り替えのキーを設定できます。</div>';
    const ps = G.partySave(), opts = ['hero'].concat(ps.list);
    return `<div class="set-note">数字キー 1〜4 に、切り替えたいキャラを割り当てます（主人公＋旅の仲間3人まで。4人目以降の仲間は、ここでキーを付け替えて使います）。ゲーム中にそのキーを押すと、割り当てたキャラに切り替わり、自分で操作できます（スマホは左上のリストをタップ）。主人公はどこかのキーに必ず割り当ててください。</div>
      ${D.keyList().map(n => { const cur = (ps.keys || {})[n] || ''; return `<div class="set-row"><div class="set-l">キー ${n}</div><select class="sw-sel" data-k="${n}"><option value="">（なし）</option>${opts.map(id => `<option value="${id}" ${id === cur ? 'selected' : ''}>${G.charIcon(id)} ${G.charName(id)}（${id === 'hero' ? '主人公・' + D.PERS[G.save.pers].name : D.COMPANIONS[id].title}）</option>`).join('')}</select></div>`; }).join('')}
      <div class="set-note">旅の仲間は、各地で出会うと人数の上限なく仲間にできます。仲間画面（P）からもキーを設定できます。</div>`;
  };
  UI.bindSwitchSettings = function (el) {
    $$('.sw-sel', el).forEach(sel => sel.onchange = () => {
      const n = +sel.dataset.k, id = sel.value, ps = G.partySave();
      if (!id) { if (ps.keys[n] === 'hero') { PS.UI.notify('主人公はどこかのキーに割り当てておく必要があります', 'warn'); } else delete ps.keys[n]; }
      else G.assignKey(id, n);
      PS.Audio.sfxPlay('ui'); G.writeSave(true); UI.refreshParty(); UI.renderSettings(el, 'sw');
    });
  };
  // 地図：ギミックダンジョンと天への階段
  UI.mapExtra = function (x, toS, st, dpr) {
    if (!G.ch4.ready) return; const s = G.save;
    for (const q of G.ch4.stairs) {
      const p = toS(q.x, q.z), open = s.dungeons[q.dun.id], done = s.heaven[q.i];
      x.font = `${22 * dpr}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 3 * dpr; x.strokeStyle = 'rgba(0,0,0,.6)';
      x.fillStyle = done ? '#ffd36a' : open ? q.def.color : '#8a92a6'; x.strokeText(open ? '✚' : '✕', p[0], p[1]); x.fillText(open ? '✚' : '✕', p[0], p[1]);
      if (st.z > 0.4) { x.font = `600 ${11 * dpr}px "Zen Kaku Gothic New",sans-serif`; x.fillStyle = '#fff6dc'; const t = q.def.name + (open ? '' : '（封印中）'); x.strokeText(t, p[0], p[1] + 20 * dpr); x.fillText(t, p[0], p[1] + 20 * dpr); }
    }
  };
  UI.mmExtra = function (x, mk, dpr) {
    if (!G.ch4.ready) return; const s = G.save;
    for (const q of G.ch4.stairs) mk(q.x, q.z, (a, b) => { x.font = `${13 * dpr}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = s.heaven[q.i] ? '#ffd27a' : s.dungeons[q.dun.id] ? q.def.color : '#8a92a6'; x.fillText(s.dungeons[q.dun.id] ? '✚' : '✕', a, b); });
  };
  // ステータス画面：プラス進化
  UI.plusPanel = function () {
    const s = G.save, c = G.plusCheck(), side = D.PLUS.side[s.pers], ng = D.PLUS.ng[s.pers], on = G.plusOn(), have = s.inv.pluscrystal || 0;
    return `<div class="plus-box ${on ? 'on' : ''}"><div class="pb-h"><b>✚ プラス進化</b><small>15分間、ステータスが Lv.+${D.PLUS.lv} 相当に上限突破（旅の仲間も一緒に進化）</small></div>
      ${ng ? `<p class="pb-ng">${ng}</p>` : `<div class="pb-rows"><span class="${have >= D.PLUS.cost ? 'ok' : ''}">💎 プラスクリスタル ${have} / ${D.PLUS.cost}</span><span class="${s.level >= D.PLUS.minLv ? 'ok' : ''}">Lv.${D.PLUS.minLv}以上（現在 Lv.${s.level}）</span></div>
      <p class="pb-side">${side ? '副作用（約' + Math.round(D.PLUS.sideDur / 60) + '分間・仲間は受けない）：' + side.text : '副作用：なし'}</p>
      ${on ? `<div class="pb-on">プラス進化中　のこり ${mmss(s.plus.end - s.play)}</div>` : `<button class="btn plus-go" ${c.ok ? '' : 'disabled'}>プラス進化する（V）</button>${c.ok ? '' : `<small class="pb-why">${c.why[0]}</small>`}`}
      <p class="pb-where">プラスクリスタルは第二章の大地（天嶺・岩窟・極光・溶岩の地方）の敵・宝箱・採集ポイントで手に入ります。</p>`}</div>`;
  };
  // 天への階段の中の小地図
  const _dc = UI.dunCanvas;
  UI.dunCanvas = function () {
    const d = G.dun; if (!d || !d.sky) return _dc();
    if (UI._dunFor === d) return UI._dunC;
    const c = document.createElement('canvas'), [x0, z0, x1, z1] = d.bounds, sc = 2; c.width = (x1 - x0) * sc; c.height = (z1 - z0) * sc; const x = c.getContext('2d');
    x.fillStyle = '#5a86c8'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#f2eee4';
    for (const L of d.lands) { x.beginPath(); x.arc((L.x - x0) * sc, (L.z - z0) * sc, 8 * sc, 0, 6.283); x.fill(); }
    x.beginPath(); x.arc((0 - x0) * sc, (0 - z0) * sc, d.arena.r * sc, 0, 6.283); x.fill();
    x.strokeStyle = '#ffe8b0'; x.lineWidth = 5 * sc; x.lineCap = 'round';
    for (const f of d.flights) { x.beginPath(); x.moveTo((f.sx - x0) * sc, (f.sz - z0) * sc); x.lineTo((f.sx + f.ux * f.L - x0) * sc, (f.sz + f.uz * f.L - z0) * sc); x.stroke(); }
    UI._dunC = c; UI._dunFor = d; return c;
  };
})(window.PS);
