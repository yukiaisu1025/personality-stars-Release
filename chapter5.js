// Release v1.0.0：第五章「氷の住む街とタイプドラゴン」・応用ダンジョン・夜島・プラスタウン
(function (PS) {
  'use strict';
  const G = PS.G, D = PS.DATA, W = PS.World, R = PS.R, M4 = PS.M4, UI = PS.UI, ST = PS.Story;
  const tmpM = M4.create();
  const $ = (s, r) => (r || document).querySelector(s);
  const fmt = (n) => Math.round(n).toLocaleString('ja-JP');
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
  const C = PS.col, rgb = (c) => PS.hexRGB(c), MB = PS.MeshBuilder;
  const mk = (mb) => PS.GLH.makeMesh(R.gl, mb.pack());

  // =====================================================================
  //  セーブ
  // =====================================================================
  G.ch5Save = function (s) {
    s = s || G.save; if (!s) return;
    while (s.dungeons.length < 23) s.dungeons.push(false);
    s.ice5 = s.ice5 || [false, false, false, false, false];
    s.night = s.night || { ch: [false, false, false, false], intro: false };
    s.costumes = s.costumes || []; s.costume = s.costume || {};
    s.gacha = s.gacha || { pity: 0, total: 0 };
    s.login = s.login || { last: '', day: 0 };
  };
  const _mig = G.migrateSave;
  G.migrateSave = function (s) {
    _mig(s); G.ch5Save(s);
    if (s.final4 && (s.chapter || 1) === 4) { s.chapter = 5; s.ch5intro = false; }
    if (s.chapter >= 5 && !s.quests.mq13 && s.ch5intro) G.startQuest('mq13', true);
  };
  G.ch5Done = () => !!(G.save && G.save.ice5 && G.save.ice5.every(x => x));
  G.ch5 = { ready: false, adv: [], gate: null, pgate: null };
  const ALV = [100, 102, 104, 106, 108];

  // =====================================================================
  //  第五章の開始（第四章クリア → 外洋が凍って島が広がる：再起動）
  // =====================================================================
  G.toChapter5 = function () {
    const s = G.save; s.chapter = 5; s.ch5intro = false; G.ch5Save(s);
    const v = W.VILLAGES[0]; s.pos = [v.x + 6, v.y, v.z + 18]; s.yaw = Math.PI;
    try { localStorage.setItem('ps_save_v1', JSON.stringify(s)); } catch (e) { }
    G.state = 'ending'; G.reloadWith('ch5');
  };
  // 第四章のエンディングから第五章へ
  const _e4 = G.ending4;
  G.ending4 = function () {
    _e4();
    const b = $('.screen.ending .ed-btn'); if (!b) return;
    b.textContent = '第五章へ ▶';
    b.onclick = () => { const el = $('.screen.ending'); el.classList.add('out'); setTimeout(() => G.toChapter5(), 900); };
  };
  G.chapter5Intro = function () {
    const s = G.save; if (!s || s.ch5intro) return;
    const card = h(`<div class="chap-card full c5"><div class="cc-k">FINAL CHAPTER</div><div class="cc-t">第五章　氷の住む街とタイプドラゴン</div><div class="cc-s">― 凍りついた外洋と、真の邪悪 ―</div></div>`);
    $('#ui').appendChild(card); setTimeout(() => card.classList.add('on'), 50); PS.Audio.sfxPlay('waypoint');
    setTimeout(() => { card.classList.add('end'); setTimeout(() => card.remove(), 1200); }, 3800);
    setTimeout(() => {
      PS.UI.dialog('ステラの声', D.CH5_INTRO.map(l => l.replace(/\{name\}/g, s.name)), () => {
        s.ch5intro = true; G.startQuest('mq13'); G.writeSave(true);
        setTimeout(() => PS.UI.notify('島のまわりの海が凍り、氷の道ができた。地図で確認しよう', 'quest'), 1500);
      });
    }, 4400);
  };

  // =====================================================================
  //  氷晶の祠（五つの番人）
  // =====================================================================
  G.altar5 = null;
  const spawnIcePylons = (F, n, r) => {
    const a0 = F.a, off = Math.random() * 6.28;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + off, x = a0.x + Math.cos(a) * r, z = a0.z + Math.sin(a) * r;
      const py = new G.Enemy('ice_pylon', F.lv - 4, x, z, { aggro: false }); py.ax = x; py.az = z;
      G.enemies.push(py); F.pylons.push(py); G.pillarFX(x, py.y, z, 1.2, 14, rgb(a0.color), 0.8);
    }
  };
  G.updateAltars5 = function (dt) {
    const s = G.save; if (!W.ch5 || (s.chapter || 1) < 5 || G.scene !== 'world') return;
    const F = G.altar5, p = G.player.pos;
    if (F) {
      const b = F.boss;
      if (!G.enemies.includes(b)) { for (const py of F.pylons) py.dead = true; G.altar5 = null; return; }
      if (b.dead) return;
      const d = Math.hypot(p.x - F.a.x, p.z - F.a.z);
      if (d > 24) { const k = 24 / d; p.x = F.a.x + (p.x - F.a.x) * k; p.z = F.a.z + (p.z - F.a.z) * k; }
      let alive = 0;
      for (const py of F.pylons) {
        if (py.dead || !G.enemies.includes(py)) continue; alive++;
        py.x = py.ax; py.z = py.az; py.kx = 0; py.kz = 0;
        if (Math.random() < dt * 30) { const t = Math.random(); G.emit(1, { x: PS.lerp(py.x, b.x, t), y: PS.lerp(py.y + 2, b.y + b.height * 0.5, t), z: PS.lerp(py.z, b.z, t), color: F.a.color, vs: 0.2, size: 0.35, life: 0.35, kind: 1, add: true }); }
      }
      b.shield = alive > 0; b.shieldTip = '氷晶柱がシールドを張っている！ 先に氷晶柱を砕こう';
      if (F.shieldWas && !b.shield) { PS.UI.banner('シールド解除！', '今がチャンスだ！', F.a.color); PS.Audio.sfxPlay('boss', 0.5); G.shake(0.6); b.st.stun = Math.max(b.st.stun || 0, 3.5); G.ring(b.x, b.y + 0.3, b.z, 9, [0.8, 0.95, 1], 0.6); }
      F.shieldWas = b.shield;
      if (!F.phase && b.hp < b.maxHp * 0.5) { F.phase = 1; spawnIcePylons(F, 3, 12); b.atk = Math.round(b.atk * 1.15); b.enraged = true; PS.UI.banner('番人の怒り', '氷晶柱が再び現れた！', '#7fd8ff'); PS.Audio.sfxPlay('boss'); G.shake(0.8); G.supportSay('boss', true); }
      F.t -= dt;
      if (F.t <= 0) {
        F.t = F.phase ? 5 : 7;
        for (let i = 0; i < (F.phase ? 5 : 3); i++) { const a = Math.random() * 6.28, r = i === 0 ? 0 : 4 + Math.random() * 7; G.hazard({ owner: 'e', shape: 'circle', x: p.x + Math.cos(a) * r, z: p.z + Math.sin(a) * r, ty: p.y, r: 3, delay: 1.35 + i * 0.12, mult: 0.85, atk: b.atk, lv: b.lv, el: 'ice', look: 'icespike', status: 'slow', src: b }); }
      }
      return;
    }
    if (G.bossActive || G.shrine) return;
    for (const a of W.ALTARS5) {
      if (s.ice5[a.id]) continue;
      if (Math.hypot(p.x - a.x, p.z - a.z) < 19 && Math.abs(p.y - a.y) < 14) { G.startAltar5(a); break; }
    }
  };
  G.startAltar5 = function (a) {
    const lv = ALV[a.id], key = D.GUARD5[a.id];
    const b = new G.Enemy(key, lv, a.x, a.z - 10, { aggro: true, state: 'chase', onDeath: () => G.altar5Win(a) });
    G.enemies.push(b); G.bossActive = b; b.shield = true;
    const F = G.altar5 = { a, lv, boss: b, pylons: [], phase: 0, t: 6, shieldWas: true };
    spawnIcePylons(F, 4, 15);
    PS.UI.banner(D.ENEMIES[key].name, '氷晶の番人 ― 氷晶柱を砕いてシールドを解除せよ', a.color);
    PS.Audio.play('boss'); PS.Audio.sfxPlay('boss'); G.shake(0.8); G.supportSay('boss', true);
  };
  G.altar5Win = function (a) {
    const s = G.save, first = !s.ice5[a.id]; s.ice5[a.id] = true;
    if (G.altar5) for (const py of G.altar5.pylons) if (!py.dead) { py.dead = true; py.deadT = 0; }
    G.altar5 = null; G.bossActive = null; PS.UI.bossBar(null);
    if (first) {
      G.addItem('icecrystal', 1); G.addCoins(Math.round(120000 * G.rewardMul())); G.addItem('iceshard', 3);
      if (s.ice5.filter(x => x).length === 1) G.addWeapon(D.TIER_WEAPON[13][D.PERS[s.pers].weapons[0]]);
      G.questEvent('crystal5', a.id);
    }
    G.pillarFX(a.x, a.y, a.z, 2.5, 60, rgb(a.color), 3);
    setTimeout(() => { PS.UI.banner('氷晶を手に入れた！', a.name + '（' + s.ice5.filter(x => x).length + '/5）', a.color); PS.Audio.sfxPlay('quest'); }, 1500);
    if (G.ch5Done()) setTimeout(() => PS.UI.notify('五つの氷晶が共鳴している……北西の「氷の城塞」への道が開いた！', 'quest'), 5000);
    G.writeSave(true); G.pickBGM();
  };
  const _us = G.updateShrines;
  G.updateShrines = function (dt) { _us(dt); G.updateAltars5(dt); };

  // =====================================================================
  //  真の邪悪ボス：タイプドラゴン（氷の城塞）
  // =====================================================================
  G._td = null;
  const typeOf = (i) => { const T = D.TYPES[i % D.TYPES.length]; return { el: T[0], weak: T[1] }; };
  G.setDragonType = function (F, i, quiet) {
    const b = F.b, t = typeOf(i); F.i = i;
    b.def0 = Object.assign({}, D.ENEMIES.typedragon, { el: t.el, weak: t.weak });
    F.col = D.ELEM[t.el].c;
    if (quiet) return;
    const c = rgb(F.col);
    G.pillarFX(b.x, b.y, b.z, 3.2, 40, c, 1.4); G.ring(b.x, b.y + 0.3, b.z, 14, c, 0.7);
    G.emit(60, { x: b.x, y: b.y + b.height * 0.5, z: b.z, color: F.col, vs: 8, vy: 4, size: 0.5, life: 1.2, kind: 1, spread: 3 });
    PS.UI.banner('タイプチェンジ：' + D.ELEM[t.el].name, '弱点は「' + D.ELEM[t.weak].name + '」属性！', F.col);
    PS.Audio.sfxPlay('awaken', 0.6); G.shake(0.5);
  };
  const tdBurst = (F) => {
    const b = F.b, p = G.player.pos, el = b.def0.el, n = F.phase ? 6 : 4;
    const look = { fire: 'meteor', ice: 'icespike', wind: 'tornado', earth: 'meteor', water: null, thunder: null, dark: 'meteor' }[el];
    if (el === 'water' || el === 'earth') {
      for (let k = 0; k < (F.phase ? 5 : 3); k++) G.hazard({ owner: 'e', shape: 'rect', x: b.x, z: b.z, ty: b.y, yaw: Math.atan2(p.x - b.x, p.z - b.z) + (k - (F.phase ? 2 : 1)) * 0.38, len: 34, w: 3.2, delay: 1.2, mult: 0.9, atk: b.atk, lv: b.lv, el, src: b, status: el === 'water' ? 'slow' : null });
      return;
    }
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, r = i === 0 ? 0 : 4 + Math.random() * 9; G.hazard({ owner: 'e', shape: 'circle', x: p.x + Math.cos(a) * r, z: p.z + Math.sin(a) * r, ty: p.y, r: el === 'thunder' ? 2.4 : 3.3, delay: (el === 'thunder' ? 0.9 : 1.35) + i * 0.12, ticks: el === 'wind' ? 4 : 1, interval: 0.4, mult: el === 'wind' ? 0.3 : 0.9, atk: b.atk, lv: b.lv, el, look, status: el === 'ice' ? 'freeze' : el === 'fire' ? 'burn' : el === 'dark' ? 'poison' : el === 'wind' ? 'slow' : null, src: b }); }
  };
  const _uf = G.updateFinal;
  G.updateFinal = function () {
    _uf();
    const s = G.save; if (!W.ch5 || (s.chapter || 1) < 5) return;
    const S = W.SUMMIT5, p = G.player.pos, d = Math.hypot(p.x - S.x, p.z - S.z), dt = G._dt || 0.016;
    const F = G._td;
    if (F) {
      const b = F.b;
      if (!G.enemies.includes(b) || b.dead) { if (!b.dead) { G._td = null; PS.UI.typeHUD(null); } return; }
      if (d > 46 && d < 90) { const k = 46 / d; p.x = S.x + (p.x - S.x) * k; p.z = S.z + (p.z - S.z) * k; }
      F.t -= dt; F.bt -= dt;
      if (!F.phase && b.hp < b.maxHp * 0.5) { F.phase = 1; b.atk = Math.round(b.atk * 1.15); b.enraged = true; PS.UI.banner('タイプドラゴン・真の姿', 'すべてのタイプが荒れ狂う！', '#ff9ef0'); PS.Audio.sfxPlay('boss'); G.shake(1); G.supportSay('boss', true); }
      if (F.t <= 0) { F.t = F.phase ? 8 : 12; G.setDragonType(F, F.i + 1 + (F.phase && Math.random() < 0.4 ? 1 : 0)); }
      if (F.bt <= 0) { F.bt = F.phase ? 5.2 : 7; tdBurst(F); }
      if (Math.random() < dt * 14) G.emit(1, { x: b.x + (Math.random() - 0.5) * 6, y: b.y + Math.random() * b.height, z: b.z + (Math.random() - 0.5) * 6, color: F.col, vs: 0.6, vy: 2, size: 0.45, life: 0.8, kind: 1, add: true });
      PS.UI.typeHUD(F);
      return;
    }
    if (d < 62 && p.y > S.y - 30) {
      if (!G.ch5Done()) {
        if (d < 58) { const k = 58 / Math.max(0.01, d); p.x = S.x + (p.x - S.x) * k; p.z = S.z + (p.z - S.z) * k; if (!G._finalMsg || G.time - G._finalMsg > 4) { G._finalMsg = G.time; PS.UI.notify('氷の結界に阻まれた…（氷晶 ' + s.ice5.filter(x => x).length + '/5）', 'warn'); } }
      } else if (!G.bossActive && d < 40) G.startTypeDragon();
    }
  };
  G.startTypeDragon = function () {
    const S = W.SUMMIT5, rematch = !!G.save.final5;
    const b = new G.Enemy('typedragon', S.lv, S.x, S.z - 14, { aggro: true, state: 'chase', onDeath: () => G.typeDragonWin(rematch) });
    G.enemies.push(b); G.bossActive = b;
    const F = G._td = { b, i: 0, t: 12, bt: 6, phase: 0, col: '#ff7a3a' };
    G.setDragonType(F, 0, true);
    PS.UI.banner('タイプドラゴン', '真の邪悪 ― タイプが変わるたびに弱点も変わる！', '#ff9ef0');
    PS.Audio.play('typedragon'); PS.Audio.sfxPlay('boss'); G.shake(1); G.supportSay('boss', true);
    setTimeout(() => PS.UI.notify('画面上の「タイプ」を見て、弱点の属性で攻めよう（武器や仲間を切り替えると属性も変わる）', 'info'), 3000);
  };
  G.typeDragonWin = function (rematch) {
    const s = G.save; G._td = null; G.bossActive = null; PS.UI.bossBar(null); PS.UI.typeHUD(null);
    const S = W.SUMMIT5; G.pillarFX(S.x, S.y, S.z, 4, 120, [1, 0.7, 0.95], 4);
    if (rematch || s.final5) { G.addItem('typescale', 1); G.addCoins(Math.round(300000 * G.rewardMul())); setTimeout(() => PS.UI.banner('タイプドラゴンを退けた', 'タイプドラゴンの逆鱗を手に入れた', '#ff9ef0'), 1200); G.writeSave(true); G.pickBGM(); return; }
    s.final5 = true; G.questEvent('boss', 'typedragon');
    G.addItem('typescale', 2); G.addWeapon(D.TIER_WEAPON[14][D.PERS[s.pers].weapons[0]]);
    G.writeSave(true);
    setTimeout(() => G.ending5(), 2600);
  };
  G.ending5 = function () {
    G.state = 'ending'; ST.mode = 'ending'; PS.UI.hudShow(false); PS.UI.closeAll(); if (PS.Input.locked) document.exitPointerLock();
    PS.Audio.play('ending');
    const s = G.save, ps = s.party || { list: [], supports: [] };
    const el = h(`<div class="screen ending e5"><div class="ed-roll">
      <p class="big">五つの氷晶の光が、タイプドラゴンを包みこんだ。</p>
      <p>炎にも氷にも雷にも姿を変えた真の邪悪は、静かに凍った海の底へと消えていった。</p>
      <p>……けれど、島じゅうに棲む魔物たちの生まれる場所までは、ステラにも突き止めることはできなかった。</p>
      <p>それでも、もう島の人々はおびえてはいない。スターリーフ村も、フロスティアも、街のみんなが力を合わせ、魔物を退けられるようになったのだから。</p>
      <p class="big">平和は、もうすぐそこにある。</p>
      <p>ただ、世界の迷宮はいまも口を開けている。凍った海の向こうには、さらに深い「応用ダンジョン」が現れた――</p>
      <p class="nm">― ${s.name} ―</p>
      <p>【${D.PERS[s.pers].name}】の人格と、${ps.list.length ? ps.list.slice(0, 8).map(id => D.COMPANIONS[id].name).join('・') + (ps.list.length > 8 ? 'ほか' : '') + 'たち仲間' : 'ひとりきりの勇気'}${(ps.supports || []).length ? '、そして' + ps.supports.map(id => D.SUPPORT[id].name).join('と') : ''}とともに。</p>
      <div class="ed-logo"><div class="tt-en">PERSONALITY STARS</div><div class="tt-jp"><span>パーソナリティー</span><span>スターズ</span></div></div>
      <h4>第五章　氷の住む街とタイプドラゴン</h4><p>${D.VERSION_LABEL}</p><h4>制作</h4><p>YUKI GROUP 開発者一同</p><h4>スペシャルサンクス</h4><p>フレイ　シロネ　ボルグ　リア<br>そして、ステラの島を旅してくれたすべての転生者のみなさん</p>
      <p class="big">ステラの島編　完</p><p>スターリーフ村の東に、夜の島へつながる「月の門」が現れた……</p><p class="sm">© 2026 YUKI GROUP. All Rights Reserved.</p></div>
      <button class="btn big yes ed-btn">冒険を続ける</button></div>`);
    $('#ui').appendChild(el);
    el.querySelector('.ed-btn').onclick = () => {
      el.classList.add('out'); setTimeout(() => el.remove(), 900); ST.mode = 'none'; G.state = 'play'; PS.UI.hudShow(true); G.pickBGM(); G.gateSetup(); G.ch5Setup(); G.writeSave(true);
      setTimeout(() => PS.UI.banner('応用ダンジョンが出現！', '島の各地に、さらに深いダンジョンが口を開けた', '#ff9ef0'), 1200);
      setTimeout(() => PS.UI.banner('月の門が開いた', 'スターリーフ村の東から「夜島」へ渡れるようになった', '#b07aff'), 5600);
      setTimeout(() => { if (!s.quests.sq_adv) PS.UI.notify('フロスティアの街長グラースが、応用ダンジョンについて話があるようだ', 'quest'); }, 9800);
    };
  };

  // =====================================================================
  //  ワールドの施設：応用ダンジョン・月の門・プラスゲート
  // =====================================================================
  const flatNear = (x0, z0, rMax, minY, avoid) => {
    for (let r = 0; r <= rMax; r += 8) {
      const n = Math.max(1, Math.round(r / 5));
      for (let k = 0; k < n; k++) {
        const a = k / n * 6.283 + r * 0.01, x = x0 + Math.cos(a) * r, z = z0 + Math.sin(a) * r;
        if (Math.abs(x) > W.HALF - 60 || Math.abs(z) > W.HALF - 60) continue;
        const y = W.heightRaw(x, z); if (y < minY) continue;
        let ok = true; for (const [ox, oz] of [[7, 0], [-7, 0], [0, 7], [0, -7], [5, 5], [-5, -5], [5, -5], [-5, 5]]) { const yy = W.heightRaw(x + ox, z + oz); if (Math.abs(yy - y) > 2.2 || yy < minY - 0.5) { ok = false; break; } }
        if (!ok || W.roadAt(x, z) > 0.25) continue;
        if (avoid.some(q => Math.hypot(q.x - x, q.z - z) < q.r)) continue;
        return { x, z, y };
      }
    }
    return null;
  };
  const avoidList = () => [].concat(W.VILLAGES.map(v => ({ x: v.x, z: v.z, r: 70 })), W.DUNGEONS.filter(d => d && !d.adv).map(d => ({ x: d.x, z: d.z, r: 50 })), W.WAYPOINTS.map(w => ({ x: w.x, z: w.z, r: 12 })), (W.SHRINES || []).map(q => ({ x: q.x, z: q.z, r: 50 })), (W.ALTARS5 || []).map(q => ({ x: q.x, z: q.z, r: 40 })), (G.ch4.stairs || []).map(q => ({ x: q.x, z: q.z, r: 30 })));
  // 夜島・応用ダンジョン用の見た目
  const TH = PS.DTHEMES;
  Object.assign(TH, {
    nightwood: { floor: '#2e3450', floor2: '#272c46', wall: '#3a4266', trim: '#b07aff', light: [0.72, 0.62, 1.0], fog: ['#05061a', '#151838'], amb: [0.3, 0.3, 0.46], pit: '#0a0c22' },
    mirrorlake: { floor: '#2c4462', floor2: '#243a56', wall: '#3c5a80', trim: '#7fd8ff', light: [0.55, 0.85, 1.0], fog: ['#04101e', '#102a44'], amb: [0.28, 0.36, 0.48], pit: '#081a30' },
    startower: { floor: '#3a3452', floor2: '#302a46', wall: '#4a4268', trim: '#fff2b0', light: [1.0, 0.92, 0.7], fog: ['#08061a', '#1c1636'], amb: [0.34, 0.32, 0.44], pit: '#120e26' },
    nightcastle: { floor: '#261e32', floor2: '#1e1828', wall: '#342a42', trim: '#ff9ef0', light: [1.0, 0.6, 0.9], fog: ['#08040e', '#1a0e22'], amb: [0.32, 0.26, 0.36], pit: '#10081a' }
  });
  for (const k of ['wind', 'forest', 'sand', 'ice', 'lava', 'sky', 'aurora', 'starcave']) {
    const b = TH[k]; if (!b) continue;
    TH['adv_' + k] = Object.assign({}, b, { trim: '#ff9ef0', light: b.light.map((v, i) => v * [1, 0.85, 1][i]), amb: b.amb.map(v => v * 0.85), fog: b.fog.slice() });
    D.DUNGEON_MOBS['adv_' + k] = D.DUNGEON_MOBS.adv.concat((D.DUNGEON_MOBS[k] || []).slice(0, 2)).filter(m => D.ENEMIES[m]);
    D.DUNGEON_RANGED['adv_' + k] = D.DUNGEON_RANGED.adv.filter(m => D.ENEMIES[m]);
  }
  G.ch5Setup = function () {
    const s = G.save; if (!s || !W.ch5 || !s.final5) return;
    if (G.ch5.ready) return; G.ch5.ready = true;
    if (!G.ch4.ready) G.ch4Setup();
    const avoid = avoidList(); for (const g of [G.ch5.gate, G.ch5.pgate]) if (g) avoid.push({ x: g.x, z: g.z, r: 40 });
    D.ADV_DUNGEONS.forEach((def, i) => {
      const sp = flatNear(def.near[0], def.near[1], 420, 3, avoid) || flatNear(def.near[0], def.near[1], 900, 2, avoid); if (!sp) return;
      avoid.push({ x: sp.x, z: sp.z, r: 120 });
      const d = Object.assign({}, def, { x: sp.x, z: sp.z, y: sp.y, theme: 'adv_' + def.theme, ch2: true, ch4: true, adv: true, ctier: 13, abil: i % 2 ? ['jump', 'wing'] : ['wing', 'jump'], reg: 0, pm: W.portalMesh.length });
      d.ry = Math.atan2(-sp.x, -sp.z);
      W.portalMesh.push(mk(PS.Props.portal(def.stone || '#a8a8b8')));
      for (const sd of [-1, 1]) W.addCircle(d.x + Math.cos(d.ry) * 3.2 * sd, d.z - Math.sin(d.ry) * 3.2 * sd, 1.0);
      W.DUNGEONS[d.id] = d; G.ch5.adv[i] = d;
    });
  };
  G.gateSetup = function () {
    const s = G.save; if (!s) return;
    const v = W.VILLAGES[0], avoid = avoidList().filter(q => !(q.x === v.x && q.z === v.z)).concat([{ x: v.x, z: v.z, r: 46 }]);
    if (!G.ch5.pgate) {
      const sp = flatNear(v.x - 58, v.z + 6, 120, 2, avoid);
      if (sp) { G.ch5.pgate = Object.assign(sp, { ry: Math.atan2(v.x - sp.x, v.z - sp.z) }); W.addCircle(sp.x + Math.cos(G.ch5.pgate.ry) * 3.4, sp.z - Math.sin(G.ch5.pgate.ry) * 3.4, 0.9); W.addCircle(sp.x - Math.cos(G.ch5.pgate.ry) * 3.4, sp.z + Math.sin(G.ch5.pgate.ry) * 3.4, 0.9); avoid.push({ x: sp.x, z: sp.z, r: 40 }); }
    }
    if (!G.ch5.gate) {
      const sp = flatNear(v.x + 60, v.z - 4, 140, 2, avoid);
      if (sp) G.ch5.gate = Object.assign(sp, { ry: Math.atan2(v.x - sp.x, v.z - sp.z) });
    }
    const g = G.ch5.gate; if (g && s.final5 && !g.col) { g.col = true; for (const sd of [-1, 1]) W.addCircle(g.x + Math.cos(g.ry) * 3.6 * sd, g.z - Math.sin(g.ry) * 3.6 * sd, 1.1); }
  };
  // 応用ダンジョン
  const _ask = G.askDungeon;
  G.askDungeon = function (d) {
    if (!d.adv) return _ask(d);
    const s = G.save, honest = D.PERS[s.pers].honest;
    const lim = honest ? '<br><small style="color:#ffb08a">正直者の誓い：制限時間 ' + Math.round(G.dungeonLimit(d) / 60) + '分</small>' : '';
    PS.UI.confirm('「' + d.name + '」に入りますか？<br><small>推奨レベル：' + d.lv + (s.dungeons[d.id] ? '　（突破済み）' : '') + '</small><br><small>第五章のあとに現れた応用ダンジョン。強化された主と、スイッチ・罠の仕掛けが待っている。</small>' + lim, () => G.enterDungeon(d.id));
  };
  const _cr = G.customRoom;
  G.customRoom = function (d, rm) {
    const def = d.def;
    if ((def.adv || def.nightDun) && rm.boss) {
      const b = G.dunSpawn(def.boss, def.lv + 2, rm.x, rm.z - 6); b.maxHp = b.hp = Math.round(b.hp * (def.nightDun ? 1.5 : 1.8)); b.atk = Math.round(b.atk * 1.2);
      rm.list.push(b); G.bossActive = b; rm.trap = def.gim; rm.trapT = 6;
      PS.UI.banner(D.ENEMIES[def.boss].name + (def.adv ? '・応用' : ''), def.adv ? '応用ダンジョンの主 ― 罠にも気をつけろ！' : D.NIGHT.chapters[def.k].name, def.color); PS.Audio.play('boss'); PS.Audio.sfxPlay('boss'); G.shake(0.6); G.supportSay('boss', true);
      return true;
    }
    return _cr(d, rm);
  };
  const _bd = G.bossDefeated;
  G.bossDefeated = function (d) {
    const def = d.def;
    if (def.nightDun) return G.nightWin(d);
    if (!def.adv) return _bd(d);
    const id = def.id, s = G.save, first = !s.dungeons[id];
    PS.Audio.play('ruins'); G.bossActive = null; PS.UI.bossBar(null);
    PS.UI.banner('応用ダンジョン突破', def.name, def.color);
    const rm = d.boss; rm.chestOpen = false; d.portalOut = true; G.dunDeadline = 0;
    for (const r2 of d.rooms) r2.trap = null;
    if (first) {
      s.dungeons[id] = true; G.addItem('heavensteel', 3); G.addItem('pluscrystal', 3); G.addItem('iceshard', 4);
      G.addWeapon(D.TIER_WEAPON[id >= 20 ? 15 : 14][D.PERS[s.pers].weapons[Math.floor(Math.random() * D.PERS[s.pers].weapons.length)]]);
      G.addCoins(Math.round(250000 * G.rewardMul())); G.questEvent('advclear', id);
    } else { G.addItem('pluscrystal', 1); G.addCoins(Math.round(40000 * G.rewardMul())); }
    G.writeSave(true);
  };
  // 独自のクエスト目標（氷晶・応用ダンジョン）
  const _qe = G.questEvent;
  G.questEvent = function (type, what) {
    if (type !== 'crystal5' && type !== 'advclear') return _qe(type, what);
    const s = G.save; if (!s) return;
    for (const id in s.quests) {
      const st = s.quests[id]; if (st.st !== 'active') continue; const q = D.QUESTS[id];
      q.obj.forEach((o, i) => {
        if (o.type === 'crystal5' && type === 'crystal5' && o.id === what) st.prog[i] = 1;
        if (o.type === 'advclear' && type === 'advclear' && st.prog[i] < o.n) { st.prog[i]++; if (st.prog[i] >= o.n) PS.UI.notify('「' + q.title + '」：フロスティアの街長グラースに報告しよう', 'quest'); }
      });
      if (q.main && G.questComplete(id)) G.finishQuest(id);
    }
    PS.UI.refreshQuest();
  };
  const _sq = G.startQuest;
  G.startQuest = function (id, quiet) {
    _sq(id, quiet);
    const s = G.save, st = s && s.quests[id]; if (!st || st.st !== 'active') return;
    if (id === 'mq15') D.QUESTS.mq15.obj.forEach((o, i) => { if (s.ice5[o.id]) st.prog[i] = 1; });
    if (id === 'sq_adv') { let n = 0; for (let k = 15; k <= 22; k++) if (s.dungeons[k]) n++; st.prog[0] = Math.min(3, n); }
    if (G.questComplete(id) && D.QUESTS[id].main) G.finishQuest(id);
  };
  const _qt = G.questTarget;
  G.questTarget = function () {
    if (!G.player || !G.save) return null;
    const s = G.save, id = s.tracked;
    if (!id || !s.quests[id] || s.quests[id].st === 'done' || !/^(mq1[3-6]|nq\d|sq_adv)$/.test(id)) return _qt();
    const p = G.player.pos, q = D.QUESTS[id];
    if (id === 'mq13') { const n = G.npcs.find(n => n.def.id === 'marc'); return n ? { x: n.x, y: n.y + 2.4, z: n.z, label: q.obj[0].text } : null; }
    if (id === 'mq14' || (id === 'sq_adv' && G.questComplete(id))) { const n = G.npcs.find(n => n.def.id === 'glace'); return n ? { x: n.x, y: n.y + 2.4, z: n.z, label: id === 'mq14' ? q.obj[0].text : 'フロスティアの街長グラースに報告する' } : null; }
    if (id === 'mq15') { let best = null, bd = 1e9; for (const a of W.ALTARS5 || []) { if (s.ice5[a.id]) continue; const dd = Math.hypot(a.x - p.x, a.z - p.z) + ALV[a.id] * 20; if (dd < bd) { bd = dd; best = a; } } return best ? { x: best.x, y: best.y + 8, z: best.z, label: best.name + 'で氷晶の番人を倒す（推奨Lv.' + ALV[best.id] + '）' } : null; }
    if (id === 'mq16') return { x: W.SUMMIT5.x, y: W.SUMMIT5.y + 8, z: W.SUMMIT5.z, label: q.obj[0].text };
    if (id === 'sq_adv') { let best = null, bd = 1e9; for (const d of G.ch5.adv) { if (!d || s.dungeons[d.id]) continue; const dd = Math.hypot(d.x - p.x, d.z - p.z); if (dd < bd) { bd = dd; best = d; } } return best ? { x: best.x, y: best.y + 6, z: best.z, label: best.name + '（推奨Lv.' + best.lv + '）' } : null; }
    if (id[0] === 'n') { if (G.scene === 'dungeon') return null; const g = G.ch5.gate; return g ? { x: g.x, y: g.y + 7, z: g.z, label: '月の門から夜島へ渡る' } : null; }
    return null;
  };
  // マルク・グラース・セレーネ
  const _talk = G.talk;
  G.talk = function (npc) {
    const s = G.save, d = npc.def, U = PS.UI;
    if (d.role === 'chief' && s.chapter >= 5 && s.quests.mq1 && s.quests.mq1.st === 'done') {
      PS.Audio.sfxPlay('uiOpen');
      if (s.quests.mq13 && s.quests.mq13.st !== 'done') return U.dialog(d.name, D.MARC.ch5first, () => G.questEvent('talk', 'marc'));
      if (s.final5) return U.dialog(d.name, D.MARC.ch5end);
      return U.dialog(d.name, D.MARC.ch5mid);
    }
    if (d.id === 'glace') {
      PS.Audio.sfxPlay('uiOpen');
      if (s.quests.mq14 && s.quests.mq14.st !== 'done') return U.dialog(d.name, ['……旅のお方。ようこそ、氷の住む街フロスティアへ。わたしは街長のグラースです。', 'この海を凍らせたのは、北西の「氷の城塞」に棲みついたタイプドラゴンです。', '城塞は、五つの氷晶の封印で閉ざされています。氷晶は、凍った海の南・東・西、そして南東と南西の氷河にある祠で、番人たちが守っています。', 'どうか……五つの氷晶を集め、タイプドラゴンを討ってください。街の者たちも、できるかぎり力を貸します。'], () => G.questEvent('talk', 'glace'));
      if (s.final5) {
        const st = s.quests.sq_adv;
        if (!st) return U.dialog(d.name, ['タイプドラゴンを討ってくださったこと、街の皆が感謝しています。', '……ですが、島の各地に、さらに深い迷宮「応用ダンジョン」が口を開けました。', 'もしよろしければ、応用ダンジョンを三つ突破して、その様子を教えていただけませんか。'], null, [{ t: '引き受ける', f: () => G.startQuest('sq_adv') }, { t: '今は無理だ', f: null }]);
        if (st.st === 'done') return U.dialog(d.name, ['応用ダンジョンの調査、本当に助かりました。', '魔物はまだいますが、街の皆で力を合わせれば、きっと大丈夫です。']);
        if (G.questComplete('sq_adv')) return U.dialog(d.name, ['三つも突破してくださったのですね！ これは街からのお礼です。'], () => G.finishQuest('sq_adv'));
        return U.dialog(d.name, ['応用ダンジョンの調査、よろしくお願いします。（' + st.prog[0] + '/3）']);
      }
      return U.dialog(d.name, ['氷晶の祠は、凍った海の南・東・西と、南東・南西の氷河にあります。（氷晶 ' + s.ice5.filter(x => x).length + '/5）', '番人は氷晶柱でシールドを張ります。先に柱を砕いてください。']);
    }
    if (d.id === 'selene') return G.talkSelene();
    return _talk(npc);
  };

  // =====================================================================
  //  ハブ（夜島・プラスタウン）の地形
  // =====================================================================
  const discGround = (discs, extra) => (x, z, y) => {
    let best = -1e4; const lim = y == null ? 1e9 : y + 0.75;
    for (const L of discs) { const dx = x - L.x, dz = z - L.z; if (dx * dx + dz * dz < L.r * L.r && L.y <= lim && L.y > best) best = L.y; }
    if (extra) { const e = extra(x, z, lim); if (e > best) best = e; }
    return best;
  };
  const isleMesh = (mb, r, x, z, y, rad, depth, top, top2, rock, rock2, edge) => {
    const seg = Math.max(18, Math.round(rad * 2.2));
    mb.cyl(x, y - 0.8, z, x, y, z, rad, rad, top2, seg, true, top);
    if (edge) mb.cyl(x, y - 0.06, z, x, y + 0.035, z, rad + 0.12, rad + 0.12, edge, seg, false);
    mb.cyl(x, y - 0.8, z, x, y - depth, z, rad * 0.96, rad * 0.12, rock, Math.max(10, Math.round(rad * 1.4)), true, rock2);
    for (let k = 0; k < Math.round(rad * 0.7); k++) { const a = r() * 6.283, rr = rad * (0.3 + r() * 0.55), s = 0.6 + r() * rad * 0.12; mb.sphere(x + Math.cos(a) * rr, y - 0.9 - s * 2.2 - r() * depth * 0.35, z + Math.sin(a) * rr, s * 1.4, s * 2.2, s * 1.4, rock, 6, 4); }
  };
  // ---- 夜島 ----
  const NIGHT_ISLES = [0, 1, 2, 3].map(k => { const a = -Math.PI / 2 + k * Math.PI / 2; return { k, x: Math.cos(a) * 88, z: Math.sin(a) * 88, y: 3 + k * 4.5, r: 12 }; });
  const NIGHT_MOB = [{ x: Math.cos(Math.PI / 4) * 64, z: Math.sin(Math.PI / 4) * 64, y: 2, r: 13 }, { x: Math.cos(Math.PI * 1.25) * 64, z: Math.sin(Math.PI * 1.25) * 64, y: 2.5, r: 13 }];
  G.buildNightHub = function () {
    const r = PS.rng(51507), mb = new MB(), grid = new Map(), discs = [];
    const top = C('#2a3256'), top2 = C('#232a48'), rock = C('#1c2036'), rock2 = C('#12142a'), glow = C('#b07aff', 0.9), gold = C('#fff2b0', 1), pale = C('#e8e4ff', 0.7), stone = C('#565e86'), stone2 = C('#3e4466');
    const isle = (x, z, y, rad, depth) => { isleMesh(mb, r, x, z, y, rad, depth, top, top2, rock, rock2, glow); discs.push({ x, z, y, r: rad }); for (let i = 0; i < Math.round(rad * 0.9); i++) { const a = r() * 6.283, rr = rad * (0.2 + r() * 0.7); mb.sphere(x + Math.cos(a) * rr, y + 0.08, z + Math.sin(a) * rr, 0.16, 0.12, 0.16, r() < 0.5 ? gold : C('#9fe6ff', 0.9), 5, 3); } };
    isle(0, 0, 0, 32, 30);
    // 月の祭壇
    mb.cyl(0, 0, 0, 0, 0.5, 0, 7, 7.4, stone2, 28, true, stone); mb.cyl(0, 0.5, 0, 0, 0.56, 0, 7.2, 7.2, glow, 28, false);
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; mb.box(Math.cos(a) * 9.5, 2.4, Math.sin(a) * 9.5, 0.9, 4.8, 0.9, stone, 0, -a, 0); mb.sphere(Math.cos(a) * 9.5, 5.2, Math.sin(a) * 9.5, 0.45, 0.45, 0.45, gold, 8, 6); PS.World.addBox(Math.cos(a) * 9.5, Math.sin(a) * 9.5, 0.5, 0.5, -a, 6, grid); }
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283, a2 = a + 0.6; mb.sphere(Math.cos(a) * 3 + Math.cos(a2) * 0.0, 7.5 + Math.sin(a * 3) * 0.2, Math.sin(a) * 3, 0.22, 0.22, 0.22, pale, 5, 4); }
    for (let i = 0; i < 10; i++) { const a = -0.9 + i / 9 * 1.8; mb.sphere(Math.sin(a) * 2.2, 8.2 + Math.cos(a) * 2.2, 0, 0.5 - Math.abs(a) * 0.18, 0.5 - Math.abs(a) * 0.18, 0.4, gold, 8, 6); }
    // 章の浮島
    NIGHT_ISLES.forEach((L) => {
      isle(L.x, L.z, L.y, L.r, 14 + L.k * 2);
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; mb.box(L.x + Math.cos(a) * 7.6, L.y + 0.02, L.z + Math.sin(a) * 7.6, 1.1, 0.05, 0.24, C(D.NIGHT.chapters[L.k].color, 0.9), 0, -a, 0); }
      // 飛び石（月の重力でふわっと跳ぶ）
      const ax = L.x, az = L.z, len = Math.hypot(ax, az), ux = ax / len, uz = az / len, n = 5;
      for (let i = 1; i <= n; i++) { const t = i / (n + 1), d0 = 32 + (len - L.r - 32) * t, x = ux * d0, z = uz * d0, y = PS.lerp(0, L.y, t), rad = 2.7; isleMesh(mb, r, x, z, y, rad, 4 + r() * 3, top, top2, rock, rock2, glow); discs.push({ x, z, y, r: rad }); }
    });
    NIGHT_MOB.forEach(M => {
      isle(M.x, M.z, M.y, M.r, 16);
      const len = Math.hypot(M.x, M.z), ux = M.x / len, uz = M.z / len;
      for (let i = 1; i <= 3; i++) { const t = i / 4, d0 = 32 + (len - M.r - 32) * t; isleMesh(mb, r, ux * d0, uz * d0, PS.lerp(0, M.y, t), 2.6, 5, top, top2, rock, rock2, glow); discs.push({ x: ux * d0, z: uz * d0, y: PS.lerp(0, M.y, t), r: 2.6 }); }
      for (let i = 0; i < 5; i++) { const a = r() * 6.283, rr = M.r * 0.6 * r(); mb.cyl(M.x + Math.cos(a) * rr, M.y, M.z + Math.sin(a) * rr, M.x + Math.cos(a) * rr, M.y + 2 + r() * 2.5, M.z + Math.sin(a) * rr, 0.5, 0.05, C('#9fe6ff', 0.7), 6, false); }
    });
    // 月と星
    const moon = C('#f4f0ff', 1.1); mb.sphere(-260, 240, -620, 70, 70, 70, moon, 24, 16);
    for (let i = 0; i < 14; i++) mb.sphere(-260 + (r() - 0.5) * 90, 240 + (r() - 0.5) * 90, -616 + r() * 10, 6 + r() * 8, 6 + r() * 8, 3, C('#d8d0f0', 0.7), 8, 6);
    for (let i = 0; i < 420; i++) { const a = r() * 6.283, el = -0.35 + r() * 1.35, rr = 700; const s = 0.8 + r() * 1.8; mb.sphere(Math.cos(a) * Math.cos(el) * rr, Math.sin(el) * rr, Math.sin(a) * Math.cos(el) * rr, s, s, s, C(r() < 0.2 ? '#fff2b0' : r() < 0.3 ? '#bfe0ff' : '#ffffff', 1.4), 4, 3); }
    for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 + r() * 0.4, rr = 170 + r() * 110, y = -20 + r() * 70, s = 6 + r() * 12; isleMesh(mb, r, Math.cos(a) * rr, Math.sin(a) * rr, y, s, s * 1.4, top, top2, rock, rock2, glow); }
    const pm = W.portalMesh.length; W.portalMesh.push(mk(PS.Props.portal('#3a2a6a')));
    const portalM = D.NIGHT.chapters.map(c => mk(PS.Props.portal(c.color)));
    const rest = { x: 12, z: 7, y: 0 };
    PS.World.addBox(rest.x, rest.z, 1.3, 1.3, 0, 3, grid);
    const def = { id: 'nightHub', name: '夜島', theme: 'nightwood', lv: 104, pm, lowg: true, hub: 'night', reg: 0 };
    return {
      def, theme: TH.nightwood, mesh: mk(mb), grid, rooms: [], torches: [], deco: [], items: [{ t: 'spring', x: rest.x, z: rest.z, y: 0, room: rest }], hub: 'night', long: false, SP: 48, discs,
      portals: NIGHT_ISLES.map(L => ({ k: L.k, x: L.x, z: L.z, y: L.y, mesh: portalM[L.k] })), zones: NIGHT_MOB.map((M, i) => ({ i, x: M.x, z: M.z, y: M.y, r: M.r - 1, done: false, list: null })),
      start: { x: 0, z: 22, y: 0 }, exit: { x: 0, z: 27, y: 0 }, boss: { x: 0, z: 0, y: 0 }, bounds: [-130, -130, 130, 130], CW: 7, ground: discGround(discs), abil: {}
    };
  };
  // ---- プラスタウン ----
  G.buildPlusTown = function () {
    const r = PS.rng(77001), mb = new MB(), grid = new Map(), discs = [];
    const tile = C('#cdd2da'), tile2 = C('#b8bfca'), asph = C('#3a3f4a'), line = C('#f4f4f0', 0.2), curb = C('#b8c0cc'), gold = C('#ffd27a', 0.9), glass = C('#6fc8e8', 0.32), glass2 = C('#a888e0', 0.28), white = C('#e2e4ea'), metal = C('#8a92a0'), green = C('#5aa86a'), dark = C('#2a2e38');
    const RAD = 74;
    mb.cyl(0, -3, 0, 0, 0, 0, RAD, RAD, curb, 64, true, tile); discs.push({ x: 0, z: 0, y: 0, r: RAD });
    mb.cyl(0, -3, 0, 0, -26, 0, RAD * 0.96, RAD * 0.3, C('#8a8478'), 40, true, C('#6a6458'));
    // 歩道のタイル模様・道路のリング
    for (let i = 0; i < 48; i++) { const a = i / 48 * 6.283; mb.box(Math.cos(a) * 26, 0.012, Math.sin(a) * 26, 0.3, 0.02, 9, tile2, 0, -a, 0); }
    mb.cyl(0, 0.01, 0, 0, 0.03, 0, 50, 50, asph, 64, false); mb.cyl(0, 0.02, 0, 0, 0.04, 0, 40, 40, tile, 64, false);
    for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; mb.box(Math.cos(a) * 45, 0.05, Math.sin(a) * 45, 0.22, 0.02, 2.4, line, 0, -a, 0); }
    // 中央の噴水と「✚」のモニュメント
    mb.cyl(0, 0, 0, 0, 0.8, 0, 9, 9.4, white, 36, true, C('#7fd8ff', 0.5)); mb.cyl(0, 0.8, 0, 0, 1.0, 0, 9.4, 9.4, gold, 36, false);
    mb.cyl(0, 0.8, 0, 0, 3.2, 0, 1.4, 1.0, white, 16); mb.cyl(0, 3.2, 0, 0, 3.4, 0, 3.4, 3.4, white, 24, true, C('#7fd8ff', 0.6));
    mb.box(0, 8.4, 0, 1.2, 6.2, 1.2, gold); mb.box(0, 8.4, 0, 6.2, 1.2, 1.2, gold); mb.box(0, 8.4, 0, 1.2, 1.2, 6.2, gold);
    for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + 0.785; PS.World.addBox(Math.cos(a) * 6.5, Math.sin(a) * 6.5, 2.6, 2.6, -a, 0.9, grid); }
    PS.World.addBox(0, 0, 1.6, 1.6, 0, 12, grid);
    // ビル（少し近代化した街）
    const pal = ['#d6d2ca', '#c2cad8', '#dcc8b8', '#bfd2c6', '#cdc2dc', '#b4bac6'], neon = ['#ff4fd8', '#4ff0ff', '#ffd27a', '#7fff8a', '#ff8a4a', '#c38cff'];
    const NB = 11;
    for (let i = 0; i < NB; i++) {
      const a = (i + 0.5) / NB * 6.283; if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.3) continue; // 出口の前はあける
      const w = 13 + r() * 5, dd = 10 + r() * 3, hh = 14 + r() * 22, rr = 62, x = Math.cos(a) * rr, z = Math.sin(a) * rr, ry = -a + Math.PI / 2, wc = C(pal[i % pal.length]);
      const fx = -Math.cos(a), fz = -Math.sin(a); // 中央を向く面
      mb.box(x, hh / 2, z, w, hh, dd, wc, 0, ry, 0);
      mb.box(x, hh + 0.4, z, w + 0.6, 0.8, dd + 0.6, metal, 0, ry, 0);
      const px = -Math.sin(-ry) * 0, rows = Math.floor(hh / 3.2), cols = Math.floor(w / 2.6);
      for (let j = 1; j < rows; j++) for (let k = 0; k < cols; k++) {
        const u = (k - (cols - 1) / 2) * 2.6, y = j * 3.2 + 0.6, ox = Math.cos(ry) * u, oz = -Math.sin(ry) * u;
        mb.box(x + ox + fx * (dd / 2 + 0.03), y, z + oz + fz * (dd / 2 + 0.03), 1.7, 1.9, 0.1, (j + k + i) % 3 ? glass : glass2, 0, ry, 0);
      }
      // 1階の店先（ガラス張り＋ひさし）
      mb.box(x + fx * (dd / 2 + 0.05), 1.6, z + fz * (dd / 2 + 0.05), w * 0.8, 2.6, 0.12, C('#8fd0e8', 0.22), 0, ry, 0);
      mb.box(x + fx * (dd / 2 + 1.1), 3.3, z + fz * (dd / 2 + 1.1), w * 0.86, 0.18, 2.2, C(neon[i % neon.length], 0.4), 0, ry, 0);
      // 屋上のネオン看板
      mb.box(x, hh + 2.6, z, w * 0.62, 2.8, 0.4, dark, 0, ry, 0);
      mb.box(x + fx * 0.25, hh + 2.6, z + fz * 0.25, w * 0.56, 2.2, 0.1, C(neon[(i + 2) % neon.length], 1.3), 0, ry, 0);
      PS.World.addBox(x, z, w / 2 + 0.2, dd / 2 + 0.2, ry, hh + 3, grid);
    }
    // 街灯と植え込み
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * 6.283 + 0.1, x = Math.cos(a) * 53, z = Math.sin(a) * 53;
      mb.cyl(x, 0, z, x, 5.6, z, 0.12, 0.1, metal, 6); mb.box(x - Math.cos(a) * 0.6, 5.6, z - Math.sin(a) * 0.6, 1.4, 0.16, 0.3, metal, 0, -a, 0); mb.sphere(x - Math.cos(a) * 1.2, 5.45, z - Math.sin(a) * 1.2, 0.3, 0.2, 0.3, C('#fff6d8', 1.4), 8, 5);
      PS.World.addBox(x, z, 0.25, 0.25, 0, 6, grid);
      if (i % 2 === 0) { const b = a + 0.2, px2 = Math.cos(b) * 34, pz2 = Math.sin(b) * 34; mb.cyl(px2, 0, pz2, px2, 0.7, pz2, 1.6, 1.6, white, 14, true, C('#5a4a3a')); mb.sphere(px2, 2.1, pz2, 1.6, 1.8, 1.6, green, 10, 7); mb.cyl(px2, 0.7, pz2, px2, 1.4, pz2, 0.16, 0.16, C('#6a4a32'), 6); PS.World.addBox(px2, pz2, 1.5, 1.5, 0, 1.2, grid); }
    }
    // ミラクルガチャの機械
    const gx = 15, gz = -12;
    mb.box(gx, 1.3, gz, 3.2, 2.6, 2.6, C('#e8404a', 0.1)); mb.box(gx, 2.7, gz, 3.4, 0.2, 2.8, gold);
    mb.sphere(gx, 4.2, gz, 1.6, 1.5, 1.4, C('#dff6ff', 0.35), 18, 12);
    for (let i = 0; i < 9; i++) mb.sphere(gx + (r() - 0.5) * 1.8, 3.4 + r() * 1.2, gz + (r() - 0.5) * 1.4, 0.36, 0.36, 0.36, C(neon[i % neon.length], 0.6), 8, 6);
    mb.cyl(gx, 1.4, gz + 1.32, gx, 1.4, gz + 1.5, 0.5, 0.5, gold, 14, true, gold); mb.box(gx, 0.6, gz + 1.32, 1.2, 0.6, 0.1, dark);
    mb.box(gx, 6.2, gz, 3.6, 0.9, 0.2, C('#ffd27a', 1.4));
    PS.World.addBox(gx, gz, 1.7, 1.4, 0, 6, grid);
    // 空に浮かぶ飛行船（近代化した街の象徴）
    for (const [sx, sz, sy, ry] of [[-90, -40, 60, 0.4], [110, 70, 72, -0.8]]) { mb.sphere(sx, sy, sz, 14, 5, 5, C('#f2f2f6'), 16, 10); mb.box(sx, sy - 5.6, sz, 6, 1.6, 2.4, C('#3a4250'), 0, ry, 0); mb.box(sx + 9, sy, sz, 3, 0.4, 7, C('#ff4fd8', 0.6), 0, ry, 0); }
    const pm = W.portalMesh.length; W.portalMesh.push(mk(PS.Props.portal('#d8b25a')));
    const def = { id: 'plusTown', name: 'プラスタウン', theme: 'heaven', lv: 1, pm, hub: 'ptown', reg: 0 };
    return {
      def, theme: TH.heaven, mesh: mk(mb), grid, rooms: [], torches: [], deco: [], items: [], hub: 'ptown', long: false, SP: 48, discs, gacha: { x: gx, z: gz + 2.6 },
      start: { x: 0, z: 38, y: 0 }, exit: { x: 0, z: 44, y: 0 }, boss: { x: 0, z: 0, y: 0 }, bounds: [-90, -90, 90, 90], CW: 7, ground: discGround(discs), abil: {}
    };
  };
  const PT_NPCS = [
    { id: 'pt_shop', name: 'プラスマート店長 リッチ', role: 'shop', shop: ['plusburger', 'starparfait', 'frostfish', 'elixir', 'hipotion', 'gachaticket', 'pluscrystal', 's_frost', 'a_frost', 't_frost'], x: -18, z: -30, look: { gender: 'm', main: '#2a2e38', sub: '#ffd27a', hair: '#3a2a22', accent: '#ffd27a', scarf: '#ffd27a' } },
    { id: 'pt_guide', name: '案内係 プラスくん', role: 'talk', x: 6, z: 30, look: { gender: 'm', main: '#ffd27a', sub: '#ffffff', hair: '#ff9a5a', accent: '#ff4fd8', helmet: '#ffd27a' }, emote: 'wave', lines: ['ようこそ、プラスタウンへ！ ここはプラスパスを持っている人だけが来られる、ちょっと未来の街だよ。', '噴水の右にあるのがミラクルガチャの機械。プラスパスなら一日一回、無料で引けるんだ！', 'プラスマートには、ここでしか買えない豪華な品物がそろってるよ。', '街のどこかに、新しい仲間がいるみたい。話しかけてみて！'] },
    { id: 'pt_kid', name: '街の子ども', role: 'talk', x: -30, z: 14, look: { gender: 'f', main: '#4ff0ff', sub: '#ffffff', hair: '#ff9ec4', accent: '#ffd27a' }, emote: 'wave', lines: ['見て見て、あの飛行船！ 夜になるとネオンがきれいなんだよ。', 'ステラさまの島も、いつかこんな街になるのかなあ。'] }
  ];
  const PT_RECRUIT = { neon: [24, 18], max: [-26, -12], ai: [8, -28] };

  // =====================================================================
  //  ハブへの出入り
  // =====================================================================
  const placeIn = (p, x, z, y, yaw) => { p.pos.x = x; p.pos.z = z; p.pos.y = y; p.mode = 'ground'; p.vel.x = p.vel.y = p.vel.z = 0; p.yaw = yaw; G.cam.yaw = yaw; G.cam.pitch = 0.2; p.lastSafe = { x, y, z }; G.cam.tx = x; G.cam.ty = y + 1.5; G.cam.tz = z; };
  const hubNPCs = (d, defs) => { d.npcs = defs.map(df => new G.NPC(df, df.x, df.z)); };
  G.enterHub = function (kind, at) {
    G.fade(1.4); PS.Audio.sfxPlay('waypoint');
    setTimeout(() => {
      const p = G.player;
      if (G.scene === 'world') G.hubReturn = [p.pos.x, p.pos.y, p.pos.z];
      G.dunReturn = (G.hubReturn || [W.VILLAGES[0].x, W.VILLAGES[0].y, W.VILLAGES[0].z]).slice();
      if (G.scene === 'dungeon') G.leaveDungeonState();
      G.dun = kind === 'night' ? G.buildNightHub() : G.buildPlusTown();
      G.scene = 'dungeon'; G.clearWorldEnemies(); G.fx = []; G.parts = [];
      const d = G.dun;
      if (kind === 'night') hubNPCs(d, [{ id: 'selene', name: '月の巫女 セレーネ', role: 'talkn', x: 0, z: -11, look: { gender: 'f', gown: true, main: '#2a2a5a', sub: '#e8e4ff', hair: '#e8f0ff', eye: '#fff2b0', accent: '#b07aff', crown: '#fff2b0', cape: '#3a2a6a', capeLong: true, wings: '#c8c0ff', wingTip: '#fff2b0', wingE: 0.5, weapon: { type: 'staff', glow: '#fff2b0' } } }]);
      else { hubNPCs(d, PT_NPCS); const ps = G.partySave(); for (const id of D.PTOWN_CHARS) if (!ps.list.includes(id)) { const c = D.COMPANIONS[id], q = PT_RECRUIT[id]; d.npcs.push(new G.NPC({ id: 'c_' + id, name: c.title + ' ' + c.name, role: 'recruit', comp: id, look: c.look }, q[0], q[1])); } }
      for (const rm of d.rooms) { rm.cleared = true; rm.active = false; }
      d.checkpoint = null; d.abil = {}; G.dunDeadline = 0;
      if (at != null && kind === 'night') { const L = NIGHT_ISLES[at]; placeIn(p, L.x * 0.86, L.z * 0.86, L.y, Math.atan2(-L.x, -L.z)); }
      else placeIn(p, d.start.x, d.start.z, 0, Math.PI);
      PS.Audio.play(kind === 'night' ? 'nightisle' : 'plustown');
      if (at == null) PS.UI.regionTitle(kind === 'night' ? '夜島' : 'プラスタウン', kind === 'night' ? 'NIGHT ISLAND　重力が少し変……' : 'PLUS TOWN　プラスパス会員の街');
      G.partyArrive(); PS.UI.refreshAll();
      if (kind === 'night' && !G.save.night.intro) setTimeout(() => PS.UI.notify('月の祭壇の前にいる、月の巫女セレーネに話しかけよう', 'quest'), 2400);
      if (kind === 'night' && at == null) setTimeout(() => PS.UI.notify('夜島では体がふわっと軽くなる。高く遠くへ跳べるぞ！', 'info'), 4200);
    }, 500);
  };
  G.enterNightDungeon = function (k) {
    const C0 = D.NIGHT.chapters[k];
    const def = { id: 'night' + k, k, nightDun: true, lowg: true, name: C0.dun, theme: C0.theme, lv: C0.lv, boss: C0.boss, size: k >= 2 ? [4, 5] : [4, 4], abil: k % 2 ? ['jump', 'wing'] : ['wing', 'jump'], gim: ['ice', 'thunder', 'thunder', 'fire'][k], ch2: true, ch4: true, color: C0.color, stone: '#3a3452', ctier: k >= 3 ? 15 : 14, reg: 0, pm: null };
    def.pm = W.portalMesh.length; W.portalMesh.push(mk(PS.Props.portal(C0.color)));
    G.fade(1.4); PS.Audio.sfxPlay('waypoint');
    setTimeout(() => {
      const p = G.player;
      G.leaveDungeonState(); G.dunReturn = (G.hubReturn || [W.VILLAGES[0].x, W.VILLAGES[0].y, W.VILLAGES[0].z]).slice();
      G.dun = PS.Dungeon.build(def, 880000 + k * 977);
      G.scene = 'dungeon'; G.clearWorldEnemies(); G.fx = []; G.parts = [];
      for (const rm of G.dun.rooms) { rm.cleared = rm.start || rm.kind === 'rest'; rm.active = false; rm.chestOpen = rm.kind === 'rest' && rm.chest ? false : undefined; }
      G.dun.checkpoint = null; G.dun.abil = {}; G.dunDeadline = D.PERS[G.save.pers].honest ? G.save.play + G.dungeonLimit(def) : 0;
      placeIn(p, G.dun.start.x, G.dun.start.z, 0, Math.PI);
      PS.Audio.play('nightisle'); PS.UI.regionTitle(def.name, C0.name + '　推奨レベル ' + def.lv);
      G.partyArrive(); G.supportSay('dungeon'); PS.UI.refreshAll();
    }, 500);
  };
  const _ex = G.exitDungeon;
  G.exitDungeon = function () {
    const d = G.dun;
    if (d && d.def.nightDun) return G.enterHub('night', d.def.k);
    if (d && d.hub) {
      G.fade(1.2);
      setTimeout(() => { const p = G.player, r = G.hubReturn || G.dunReturn; G.leaveDungeonState(); p.pos.x = r[0]; p.pos.z = r[2]; p.pos.y = W.height(r[0], r[2]); p.mode = 'ground'; p.vel.x = p.vel.y = p.vel.z = 0; G.cam.tx = p.pos.x; G.cam.ty = p.pos.y + 1.5; G.cam.tz = p.pos.z; G.lastRegion = -1; G.partyArrive(); G.pickBGM(); G.writeSave(true); }, 450);
      return;
    }
    return _ex();
  };
  G.gravMul = () => (G.scene === 'dungeon' && G.dun && G.dun.def && G.dun.def.lowg ? D.NIGHT.gravity : 1);
  const _jv = G.jumpV;
  G.jumpV = () => _jv() * (G.gravMul() < 1 ? 1.12 : 1);
  // 夜島の物語
  G.talkSelene = function () {
    const s = G.save, N = s.night, U = PS.UI; PS.Audio.sfxPlay('uiOpen');
    if (!N.intro) return U.dialog('月の巫女 セレーネ', D.NIGHT_INTRO.concat(D.NIGHT.chapters[0].intro), () => { N.intro = true; G.startQuest('nq1'); G.writeSave(true); PS.UI.notify('北の浮島の門から「' + D.NIGHT.chapters[0].dun + '」へ', 'quest'); });
    const k = N.ch.findIndex(x => !x);
    if (k < 0) return U.dialog('月の巫女 セレーネ', ['夜の王ノクスは眠りにつき、夜島にも静かな夜が戻りました。', 'あなたのおかげです、' + s.name + 'さん。……夜島の迷宮は、いつでも挑めますよ。']);
    return U.dialog('月の巫女 セレーネ', D.NIGHT.chapters[k].intro);
  };
  G.nightWin = function (d) {
    const def = d.def, k = def.k, s = G.save, first = !s.night.ch[k];
    PS.Audio.play('nightisle'); G.bossActive = null; PS.UI.bossBar(null);
    PS.UI.banner('夜島 第' + '一二三四'[k] + '章 クリア', def.name, def.color);
    const rm = d.boss; rm.chestOpen = false; d.portalOut = true; G.dunDeadline = 0;
    for (const r2 of d.rooms) r2.trap = null;
    if (first) {
      s.night.ch[k] = true; G.addItem('moonstone', 3 + k); G.addItem('pluscrystal', 2);
      if (k === 3) G.addWeapon(D.TIER_WEAPON[15][D.PERS[s.pers].weapons[0]]); else G.addWeapon(D.TIER_WEAPON[14][D.PERS[s.pers].weapons[k % D.PERS[s.pers].weapons.length]]);
      G.addCoins(Math.round([200000, 300000, 400000, 800000][k] * G.rewardMul())); G.questEvent('boss', def.boss);
      if (k < 3) setTimeout(() => { PS.UI.banner('次の章が開いた', D.NIGHT.chapters[k + 1].name, D.NIGHT.chapters[k + 1].color); }, 4200);
      else setTimeout(() => { PS.UI.banner('夜島編　完', '夜の王ノクスは眠りにつき、夜島に静かな夜が戻った', '#ff9ef0'); }, 4200);
    } else { G.addItem('moonstone', 1); G.addCoins(Math.round(50000 * G.rewardMul())); }
    G.writeSave(true);
  };
  // 仲間になったらハブのNPCも消す
  const _rc = G.recruitComp;
  G.recruitComp = function (id) { _rc(id); if (G.dun && G.dun.npcs) G.dun.npcs = G.dun.npcs.filter(n => n.def.comp !== id); };

  // =====================================================================
  //  調べる
  // =====================================================================
  const _int = G.interactables;
  G.interactables = function () {
    const out = _int(), s = G.save, p = G.player.pos, near = (x, z, r) => Math.hypot(x - p.x, z - p.z) < r;
    if (G.scene === 'world') {
      const g = G.ch5.gate, pg = G.ch5.pgate;
      if (g && s.final5 && near(g.x, g.z, 6)) out.unshift({ icon: '🌙', text: '夜島へ渡る（月の門）', f: () => PS.UI.confirm('月の門をくぐって「夜島」へ渡りますか？<br><small>夜島では重力が少し変わります。夜島 第一章〜第四章のダンジョンに挑めます（推奨Lv.102〜118）</small>', () => G.enterHub('night')) });
      if (pg && near(pg.x, pg.z, 6)) out.unshift({ icon: '✚', text: G.passOn() ? 'プラスタウンへ行く' : 'プラスゲート（プラスパス専用）', f: () => G.passOn() ? G.enterHub('ptown') : PS.UI.passMenu(true) });
      for (const o of out) if (o.text.indexOf('ダンジョンに入る：') === 0 || o.text.indexOf('遺跡に入る：') === 0) { const dd = G.ch5.adv.find(q => q && o.text.endsWith(q.name)); if (dd) o.text = '応用ダンジョンに入る：' + dd.name; }
      return out;
    }
    const d = G.dun; if (!d) return out;
    for (const o of out) if (o.text === '迷宮から出る' || o.text === 'ダンジョンから出る' || o.text === '外へ戻る') o.text = d.def.nightDun ? '夜島へ戻る' : d.hub === 'night' ? 'スターリーフ村へ戻る（月の門）' : d.hub === 'ptown' ? 'スターリーフ村へ戻る' : o.text;
    if (d.npcs) for (const n of d.npcs) if (near(n.x, n.z, 3) && Math.abs(p.y - n.y) < 3) out.unshift({ icon: '💬', text: n.def.name, f: () => G.talk(n) });
    if (d.hub === 'night') for (const P of d.portals) {
      if (!near(P.x, P.z, 4.5) || Math.abs(p.y - P.y) > 3) continue;
      const C0 = D.NIGHT.chapters[P.k], open = s.night.intro && (P.k === 0 || s.night.ch[P.k - 1]);
      out.unshift(open ? { icon: '🌀', text: '挑む：' + C0.name, f: () => PS.UI.confirm('「' + C0.dun + '」に入りますか？<br><small>' + C0.name + '　推奨レベル ' + C0.lv + (s.night.ch[P.k] ? '　（クリア済み）' : '') + '</small><br><small>夜島のダンジョンでは重力が少し変わります。</small>', () => G.enterNightDungeon(P.k)) }
        : { icon: '🔒', text: C0.name + '（封印中）', f: () => PS.UI.dialog(C0.name, [s.night.intro ? '門は、まだ固く閉ざされている……前の章をクリアすると開くようだ。' : '門は閉ざされている……月の巫女セレーネに話を聞こう。']) });
    }
    if (d.hub === 'ptown' && near(d.gacha.x, d.gacha.z, 3.4)) out.unshift({ icon: '🎰', text: 'ミラクルガチャを引く', f: () => PS.UI.gachaMenu() });
    return out;
  };

  // =====================================================================
  //  毎フレーム
  // =====================================================================
  const _upd = G.update;
  G.update = function (dt, I) {
    G._dt = dt;
    _upd(dt, I);
    if (!G.save || !G.player) return;
    const d = G.dun; if (G.scene !== 'dungeon' || !d) return;
    if (d.npcs) for (const n of d.npcs) n.update(dt);
    const p = G.player.pos;
    if (d.hub === 'night' || d.def.nightDun) {
      if (Math.random() < dt * 6) { const a = Math.random() * 6.28, r = 6 + Math.random() * 40; G.emit(1, { x: p.x + Math.cos(a) * r, y: p.y - 4 + Math.random() * 14, z: p.z + Math.sin(a) * r, color: Math.random() < 0.5 ? '#fff2b0' : '#b07aff', vs: 0.2, vy: 0.5, size: 0.22, life: 3, kind: 1, alpha: 0.7 }); }
    }
    if (d.hub === 'night' && G.state === 'play') {
      for (const Z of d.zones) {
        if (!Z.list && !Z.done && Math.hypot(p.x - Z.x, p.z - Z.z) < Z.r && Math.abs(p.y - Z.y) < 4) {
          Z.list = []; const mobs = D.NIGHT.mobs, n = 4 + Z.i;
          for (let i = 0; i < n; i++) { const a = i / n * 6.283, e = G.dunSpawn(mobs[(i + Z.i * 2) % mobs.length], 101 + i % 3 + Z.i * 2, Z.x + Math.cos(a) * 6, Z.z + Math.sin(a) * 6, { y0: Z.y }); Z.list.push(e); G.ring(e.x, e.y + 0.1, e.z, 2, [0.75, 0.6, 1], 0.6); }
          PS.Audio.play('battle'); PS.UI.notify('夜の魔物があらわれた！', 'warn');
        }
        if (Z.list && !Z.done && Z.list.some(e => !e.dead && !G.enemies.includes(e))) Z.list = null; // 倒れて戻ったときはやり直し
        if (Z.list && !Z.done && Z.list.every(e => e.dead)) { Z.done = true; PS.Audio.play('nightisle'); PS.UI.notify('夜の魔物を退けた！ 月長石を手に入れた', 'buff'); G.addItem('moonstone', 1); if (Math.random() < 0.5) G.addItem('nightbloom', 1); }
      }
      for (const e of G.enemies) if (!e.dead && e.y < -30) G.killEnemy(e);
    }
  };
  const _hz = G.hazard;
  G.hazard = function (o) { if (o.ty == null && G.scene === 'dungeon' && G.dun && G.dun.hub && G.player) o.ty = G.player.pos.y + 1.2; return _hz(o); };
  const _denv = G.dungeonEnv;
  G.dungeonEnv = function () {
    const d = G.dun;
    if (d && d.hub === 'night') {
      const e = G.computeEnv(0.6, [0, 0, 0, 1, 0]);
      e.skyTop = PS.hexRGB('#05061c'); e.skyHor = PS.hexRGB('#2a2058'); e.fogDen = 0.0008; e.fogStart = 120; e.far = 1600; e.exposure = 1.18;
      e.lightCol = [0.42, 0.42, 0.66]; e.ambTop = [0.36, 0.36, 0.56]; e.ambBot = [0.16, 0.14, 0.26];
      return e;
    }
    if (d && d.hub === 'ptown') {
      const e = G.computeEnv(15.5, [1, 0, 0, 0, 0]);
      e.fogDen = 0.0016; e.fogStart = 140; e.far = 1400; e.exposure = 0.8;
      return e;
    }
    return _denv();
  };
  const _dbgm = G.dunBGM;
  G.dunBGM = () => { const d = G.dun; if (d && (d.hub === 'night' || d.def.nightDun)) return 'nightisle'; if (d && d.hub === 'ptown') return 'plustown'; if (d && d.def.adv) return 'ruins'; return _dbgm(); };
  const _gpb = G.pickBGM;
  G.pickBGM = function () { if (G.scene === 'world' && G._td) return PS.Audio.play('typedragon'); return _gpb(); };

  // =====================================================================
  //  描画
  // =====================================================================
  let M5 = null;
  const meshes5 = () => {
    if (M5) return M5;
    // 氷の城塞
    const ct = new MB(), ice = C('#cfe6f6'), ice2 = C('#a8cce6'), iceG = C('#bff6ff', 0.8), deep = C('#6a9ac0');
    const RW = 52, NS = 36;
    for (let i = 0; i < NS; i++) {
      const a = (i + 0.5) / NS * 6.283; if (i % 9 === 4) continue; // 四方の入口
      const x = Math.cos(a) * RW, z = Math.sin(a) * RW, ch = 2 * RW * Math.sin(Math.PI / NS) + 0.4;
      ct.box(x, 4, z, 2.4, 8, ch, i % 2 ? ice : ice2, 0, -a, 0);
      ct.box(Math.cos(a) * (RW + 0.6), 8.6, Math.sin(a) * (RW + 0.6), 1.2, 1.2, ch * 0.45, ice, 0, -a, 0);
      ct.box(Math.cos(a) * (RW - 1.3), 0.6, Math.sin(a) * (RW - 1.3), 0.2, 0.3, ch, iceG, 0, -a, 0);
    }
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * 6.283 + 0.05, x = Math.cos(a) * (RW + 1), z = Math.sin(a) * (RW + 1);
      ct.cyl(x, 0, z, x, 20, z, 3.6, 3.0, ice2, 14, true, ice); ct.cyl(x, 20, z, x, 31, z, 3.4, 0, ice, 14, false); ct.sphere(x, 31.6, z, 0.8, 0.8, 0.8, iceG, 8, 6);
      for (let j = 0; j < 4; j++) ct.box(x + Math.cos(a + j * 1.57) * 3.2, 14, z + Math.sin(a + j * 1.57) * 3.2, 0.2, 2.2, 0.9, C('#7fe8ff', 0.9), 0, -(a + j * 1.57), 0);
    }
    ct.cyl(0, 0, 0, 0, 1.2, 0, 12, 13, ice2, 36, true, ice); ct.cyl(0, 1.2, 0, 0, 1.3, 0, 12.2, 12.2, iceG, 36, false);
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; ct.cyl(Math.cos(a) * 10, 1.2, Math.sin(a) * 10, Math.cos(a) * 9.4, 13 + (i % 2) * 4, Math.sin(a) * 9.4, 1.0, 0, deep, 7, false); }
    for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283 + Math.sin(i) * 0.1, rr = 20 + (i * 7 % 23); ct.cyl(Math.cos(a) * rr, -0.5, Math.sin(a) * rr, Math.cos(a) * rr * 1.02, 2 + (i * 13 % 7), Math.sin(a) * rr * 1.02, 0.6 + (i % 3) * 0.3, 0, i % 3 ? ice : iceG, 6, false); }
    // 月の門
    const mg = new MB(), ms = C('#3a3452'), ms2 = C('#2a2440'), mo = C('#fff2b0', 1.2), pu = C('#b07aff', 0.9);
    mg.cyl(0, -1, 0, 0, 0.4, 0, 6.5, 6.5, ms2, 24, true, ms);
    for (const sd of [-1, 1]) { mg.box(sd * 3.6, 4.2, 0, 1.3, 8.4, 1.3, ms); mg.sphere(sd * 3.6, 8.8, 0, 0.6, 0.6, 0.6, pu, 8, 6); }
    for (let i = 0; i <= 16; i++) { const a = Math.PI * i / 16; mg.box(Math.cos(a) * 3.6, 8.4 + Math.sin(a) * 3.2, 0, 1.1, 1.0, 1.1, ms, 0, 0, a); }
    for (let i = 0; i < 12; i++) { const a = -1.1 + i / 11 * 2.2; mg.sphere(Math.sin(a) * 1.8, 12.6 + Math.cos(a) * 1.8, 0, 0.5 - Math.abs(a) * 0.15, 0.5 - Math.abs(a) * 0.15, 0.35, mo, 8, 6); }
    mg.box(0, 4.6, 0, 5.8, 8.2, 0.12, C('#6a4ab0', 0.9));
    // プラスゲート
    const pg = new MB(), wt = C('#f4f4f6'), gd = C('#ffd27a', 0.9);
    pg.cyl(0, -1, 0, 0, 0.4, 0, 6, 6, C('#c8ccd6'), 24, true, wt);
    for (const sd of [-1, 1]) { pg.box(sd * 3.4, 4, 0, 1.0, 8, 1.0, wt); pg.box(sd * 3.4, 4, 0.52, 0.2, 7.6, 0.05, C('#4ff0ff', 1.2)); }
    pg.box(0, 8.4, 0, 8.2, 0.9, 1.1, wt); pg.box(0, 8.4, 0.56, 7.8, 0.3, 0.05, C('#ff4fd8', 1.2));
    pg.box(0, 10.4, 0, 0.7, 2.8, 0.5, gd); pg.box(0, 10.4, 0, 2.8, 0.7, 0.5, gd);
    pg.box(0, 4, 0, 5.8, 7.8, 0.1, C('#e8c070', 0.3));
    M5 = { citadel: mk(ct), moonGate: mk(mg), plusGate: mk(pg), shrine: (W.ALTARS5 || []).map(a => mk(PS.Props.crystalShrine(a.color))), crystal: (W.ALTARS5 || []).map(a => mk(PS.Props.voidCrystal(a.color))), tcrys: mk(PS.Props.voidCrystal('#ff9ef0')) };
    return M5;
  };
  let citadelCol = false;
  const citadelCollide = () => {
    if (citadelCol || !W.ch5) return; citadelCol = true;
    const S = W.SUMMIT5, RW = 52, NS = 36;
    for (let i = 0; i < NS; i++) { const a = (i + 0.5) / NS * 6.283; if (i % 9 === 4) continue; W.addBox(S.x + Math.cos(a) * RW, S.z + Math.sin(a) * RW, 1.3, RW * Math.sin(Math.PI / NS) + 0.2, -a, S.y + 9); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.05; W.addCircle(S.x + Math.cos(a) * (RW + 1), S.z + Math.sin(a) * (RW + 1), 3.6, S.y + 31); }
  };
  const _ds = G.drawShrines;
  G.drawShrines = function (pass) {
    _ds(pass);
    const s = G.save; if (!s) return;
    const m = meshes5();
    if (W.ch5) {
      citadelCollide();
      for (const a of W.ALTARS5) {
        if (!R.visible(a.x, a.y + 4, a.z, 34)) continue;
        M4.compose(tmpM, a.x, a.y - 0.1, a.z, 0, 0, 0, 1); R.drawMesh(m.shrine[a.id], tmpM);
        if (!(s.ice5 && s.ice5[a.id])) { M4.compose(tmpM, a.x, a.y + 7 + Math.sin(G.time * 1.3 + a.id) * 0.5, a.z, 0, G.time * 0.6, 0, 1.6); R.drawMesh(m.crystal[a.id], tmpM, null, 1); }
      }
      const S = W.SUMMIT5;
      if (R.visible(S.x, S.y + 10, S.z, 70)) {
        M4.compose(tmpM, S.x, S.y - 0.2, S.z, 0, 0, 0, 1); R.drawMesh(m.citadel, tmpM);
        if (!s.final5) { M4.compose(tmpM, S.x, S.y + 20 + Math.sin(G.time) * 0.8, S.z, 0, G.time * 0.4, 0, 2.6); R.drawMesh(m.tcrys, tmpM, null, 1); }
      }
    }
  };
  // 月の門・プラスゲート（第一章〜第五章のどのワールドでも描く）
  G.drawGates = function (pass) {
    const s = G.save; if (!s || G.scene !== 'world') return;
    const m = meshes5(), g = G.ch5.gate, pg = G.ch5.pgate;
    if (g && s.final5 && R.visible(g.x, g.y + 6, g.z, 14)) { M4.compose(tmpM, g.x, g.y, g.z, 0, g.ry, 0, 1); R.drawMesh(m.moonGate, tmpM); }
    if (pg && R.visible(pg.x, pg.y + 6, pg.z, 14)) { M4.compose(tmpM, pg.x, pg.y, pg.z, 0, pg.ry, 0, 1); R.drawMesh(m.plusGate, tmpM); }
  };
  const _sfx = G.shrineFX;
  G.shrineFX = function () {
    _sfx();
    const s = G.save; if (!s) return;
    if (W.ch5 && (s.chapter || 1) >= 5) {
      for (const a of W.ALTARS5) { if (s.ice5[a.id]) continue; const c = rgb(a.color); G.fx.push({ mode: 2, x: a.x, y: a.y + 8, z: a.z, size: [1.3, 320, 1.3], color: [c[0], c[1], c[2], 0.32], t: 0.5, dur: 1, add: true, once: true }); }
      const F = G.altar5;
      if (F) { const c = rgb(F.a.color); G.fx.push({ mode: 2, x: F.a.x, y: F.a.y, z: F.a.z, size: [25, 14, 25], color: [c[0], c[1], c[2], 0.08], t: 0.5, dur: 1, add: true, once: true }); const b = F.boss; if (b.shield && !b.dead) G.fx.push({ mode: 2, x: b.x, y: b.y - 0.5, z: b.z, size: [b.radius * b.scale + 1.6, b.height + 2, b.radius * b.scale + 1.6], color: [0.75, 0.92, 1, 0.16], t: 0.5, dur: 1, add: true, once: true }); }
      const S = W.SUMMIT5;
      if (!G.ch5Done()) G.fx.push({ mode: 2, x: S.x, y: S.y - 6, z: S.z, size: [58, 40, 58], color: [0.6, 0.85, 1, 0.1], t: 0.5, dur: 1, add: true, once: true });
      else if (!s.final5) G.fx.push({ mode: 2, x: S.x, y: S.y, z: S.z, size: [1.8, 460, 1.8], color: [1, 0.6, 0.95, 0.36], t: 0.5, dur: 1, add: true, once: true });
      if (G._td) { const c = rgb(G._td.col); G.fx.push({ mode: 2, x: S.x, y: S.y, z: S.z, size: [46, 18, 46], color: [c[0], c[1], c[2], 0.07], t: 0.5, dur: 1, add: true, once: true }); }
    }
  };
  G.gateFX = function () {
    const s = G.save; if (!s) return;
    const g = G.ch5.gate, pg = G.ch5.pgate;
    if (g && s.final5) G.fx.push({ mode: 2, x: g.x, y: g.y, z: g.z, size: [1.4, 300, 1.4], color: [0.7, 0.5, 1, 0.3], t: 0.5, dur: 1, add: true, once: true });
    if (pg && G.passOn()) G.fx.push({ mode: 2, x: pg.x, y: pg.y, z: pg.z, size: [1.2, 160, 1.2], color: [1, 0.85, 0.45, 0.26], t: 0.5, dur: 1, add: true, once: true });
  };
  const _dd = G.drawDungeon;
  G.drawDungeon = function (pass) {
    _dd(pass);
    const d = G.dun; if (!d) return;
    if (d.npcs) for (const n of d.npcs) if (R.visible(n.x, n.y + 1, n.z, 1.5)) R.drawSkinned(n.model.mesh, n.rig.world, n.mat);
    if (d.portals) for (const P of d.portals) { M4.compose(tmpM, P.x, P.y, P.z, 0, Math.atan2(-P.x, -P.z), 0, 0.85); R.drawMesh(P.mesh, tmpM); }
  };
  const _tfx = G.ch4TransFX;
  G.ch4TransFX = function () {
    _tfx();
    const d = G.dun; if (G.scene !== 'dungeon' || !d || !d.portals) return;
    const s = G.save;
    for (const P of d.portals) { const open = s.night.intro && (P.k === 0 || s.night.ch[P.k - 1]), c = rgb(D.NIGHT.chapters[P.k].color); G.fx.push({ mode: 2, x: P.x, y: P.y, z: P.z, size: [1.2, open ? 120 : 10, 1.2], color: [c[0], c[1], c[2], open ? (s.night.ch[P.k] ? 0.18 : 0.42) : 0.12], t: 0.5, dur: 1, add: true, once: true }); }
  };
  // 夜島・プラスタウンの小地図
  const _dc = UI.dunCanvas;
  UI.dunCanvas = function () {
    const d = G.dun; if (!d || !d.hub) return _dc();
    if (UI._dunFor === d) return UI._dunC;
    const c = document.createElement('canvas'), [x0, z0, x1, z1] = d.bounds, sc = 2; c.width = (x1 - x0) * sc; c.height = (z1 - z0) * sc; const x = c.getContext('2d');
    x.fillStyle = d.hub === 'night' ? '#0a0c24' : '#6a8ab8'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = d.hub === 'night' ? '#4a5288' : '#e4e8ee';
    for (const L of d.discs) { x.beginPath(); x.arc((L.x - x0) * sc, (L.z - z0) * sc, L.r * sc, 0, 6.283); x.fill(); }
    if (d.portals) for (const P of d.portals) { x.fillStyle = D.NIGHT.chapters[P.k].color; x.beginPath(); x.arc((P.x - x0) * sc, (P.z - z0) * sc, 6, 0, 6.283); x.fill(); }
    UI._dunC = c; UI._dunFor = d; return c;
  };
  // 地図の印
  const _me = UI.mapExtra;
  UI.mapExtra = function (x, toS, st, dpr) {
    _me(x, toS, st, dpr);
    const s = G.save; if (!s) return;
    const mark = (wx, wz, ch, col, label) => {
      const p = toS(wx, wz);
      x.font = `${20 * dpr}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 3 * dpr; x.strokeStyle = 'rgba(0,0,0,.6)'; x.fillStyle = col; x.strokeText(ch, p[0], p[1]); x.fillText(ch, p[0], p[1]);
      if (label && st.z > 0.4) { x.font = `600 ${11 * dpr}px "Zen Kaku Gothic New",sans-serif`; x.fillStyle = '#fff6dc'; x.strokeText(label, p[0], p[1] + 19 * dpr); x.fillText(label, p[0], p[1] + 19 * dpr); }
    };
    if (W.ch5 && (s.chapter || 1) >= 5) {
      for (const a of W.ALTARS5) mark(a.x, a.z, '❄', s.ice5[a.id] ? '#ffd36a' : a.color, a.name + '（Lv.' + ALV[a.id] + '）');
      mark(W.SUMMIT5.x, W.SUMMIT5.z, '🐉', G.ch5Done() ? '#ff9ef0' : '#8a92a6', '氷の城塞' + (G.ch5Done() ? '' : '（封印中）'));
    }
    if (G.ch5.gate && s.final5) mark(G.ch5.gate.x, G.ch5.gate.z, '🌙', '#c8a0ff', '月の門（夜島）');
    if (G.ch5.pgate) mark(G.ch5.pgate.x, G.ch5.pgate.z, '✚', G.passOn() ? '#ffd27a' : '#8a92a6', 'プラスゲート');
  };
  const _mm = UI.mmExtra;
  UI.mmExtra = function (x, mkr, dpr) {
    _mm(x, mkr, dpr);
    const s = G.save; if (!s) return;
    const dot = (wx, wz, ch, col) => mkr(wx, wz, (a, b) => { x.font = `${12 * dpr}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = col; x.fillText(ch, a, b); });
    if (W.ch5 && (s.chapter || 1) >= 5) { for (const a of W.ALTARS5) if (!s.ice5[a.id]) dot(a.x, a.z, '❄', a.color); dot(W.SUMMIT5.x, W.SUMMIT5.z, '🐉', G.ch5Done() ? '#ff9ef0' : '#8a92a6'); }
    if (G.ch5.gate && s.final5) dot(G.ch5.gate.x, G.ch5.gate.z, '🌙', '#c8a0ff');
    if (G.ch5.pgate) dot(G.ch5.pgate.x, G.ch5.pgate.z, '✚', '#ffd27a');
  };
  // タイプ表示（タイプドラゴン戦）
  UI.typeHUD = function (F) {
    let el = $('.c5type');
    if (!F) { if (el) el.classList.add('hidden'); return; }
    if (!el) { $('#hud').insertAdjacentHTML('beforeend', '<div class="c5type hidden"></div>'); el = $('.c5type'); }
    const t = typeOf(F.i), key = F.i + ':' + Math.ceil(F.t);
    if (el._k === key) return; el._k = key;
    el.style.setProperty('--tc', D.ELEM[t.el].c); el.classList.remove('hidden');
    el.innerHTML = `<span class="ty-l">タイプ</span><b>${D.ELEM[t.el].name}</b><span class="ty-w">弱点 <em style="color:${D.ELEM[t.weak].c}">${D.ELEM[t.weak].name}</em></span><span class="ty-t">次のタイプまで ${Math.max(0, Math.ceil(F.t))}秒</span>`;
  };
  // 仲間：出会える場所
  const _cw = UI.compWhere;
  UI.compWhere = function (c) { if (c.gacha) return 'ミラクルガチャ（星5）'; if (c.ptown) return 'プラスタウン'; return _cw(c); };

  // =====================================================================
  //  ゲーム開始
  // =====================================================================
  const _sg = G.startGame;
  G.startGame = function (save, fromStory) {
    G._td = null; G.altar5 = null;
    _sg(save, fromStory);
    G.ch5Save(G.save);
    G.gateSetup();
    if (G.save.final5) G.ch5Setup();
    if ((G.save.chapter || 1) >= 5 && !G.save.ch5intro) setTimeout(() => G.chapter5Intro(), 900);
  };
})(window.PS);
