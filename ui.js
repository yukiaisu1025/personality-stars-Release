/* Personality Stars - ui.js : HUD・メニュー・地図・設定（星図デザイン）  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const G = PS.G, D = PS.DATA, W = PS.World;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
  const fmt = (n) => Math.round(n).toLocaleString('ja-JP');
  const STAR = (n) => '★'.repeat(n);
  const RAR = ['#8a8a8a', '#8a8a8a', '#5a9a6a', '#4a8ac0', '#9a6ac8', '#c8963a'];
  const ICON = {
    quest: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v6M12 16.5v.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    map: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 4l2.6 8L12 20l-2.6-8z" fill="currentColor"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 8V6a3 3 0 016 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 13h6" stroke="currentColor" stroke-width="1.8"/></svg>',
    char: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2l2.6 6.6L21.5 9l-5.3 4.6 1.7 7L12 17l-5.9 3.6 1.7-7L2.5 9l6.9-.4z" fill="currentColor"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 4v5h7V4M8 20v-6h8v6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.5 9.5a2.5 2.5 0 115 .3c-.4 1.2-2.5 1.6-2.5 3.2M12 16.5v.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h11M4 17h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 13.5l1.1 2.3 2.4.3-1.8 1.6.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.6 2.4-.3z" fill="currentColor"/></svg>',
    exit: '<svg viewBox="0 0 24 24"><path d="M14 4H5v16h9M10 12h11M17 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    sword: '<svg viewBox="0 0 24 24"><path d="M19 3l2 2-11 11-3-3z" fill="currentColor"/><path d="M5 14l5 5M3 21l3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    jump: '<svg viewBox="0 0 24 24"><path d="M12 3l6 7h-4v8h-4v-8H6z" fill="currentColor"/></svg>',
    dash: '<svg viewBox="0 0 24 24"><path d="M3 12h9M5 8h7M5 16h7M13 5l8 7-8 7z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    party: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="16.5" cy="9.5" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 20c.6-4 3.4-6 6-6s5.4 2 6 6M14.5 14.6c2.6-.4 5.6.9 6.5 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    news: '<svg viewBox="0 0 24 24"><path d="M4 5h13v14H6a2 2 0 01-2-2z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M17 9h3v8a2 2 0 01-2 2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 9h7M7 12.5h7M7 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };
  const UI = PS.UI = { dmgPool: [], ebarPool: [], stack: [] };

  // ================= 初期化 =================
  UI.init = function () {
    const root = $('#ui');
    root.insertAdjacentHTML('beforeend', `
<div id="hud" class="hidden">
  <div class="pframe">
    <div class="pf-emb"><span></span></div>
    <div class="pf-body">
      <div class="pf-top"><span class="pname"></span><span class="lv">Lv.1</span><span class="pf-pers"></span></div>
      <div class="hpbar"><i class="hplag"></i><i class="hpfill"></i><span class="hptext"></span></div>
      <div class="stbar"><i></i></div>
      <div class="expbar"><i></i></div>
      <div class="flight hidden"><span>飛翔</span><div><i></i></div></div>
      <div class="buffs"></div>
    </div>
  </div>
  <div class="party-strip"></div>
  <canvas class="compass"></canvas>
  <div class="htimer hidden"><i>⏳</i><div><small></small><b></b></div></div>
  <div class="abil-row hidden"></div>
  <div class="hud-tr">
    <div class="minimap"><canvas id="mm"></canvas><svg class="mm-frame" viewBox="0 0 100 100"><polygon points="98.5,50 74.25,92 25.75,92 1.5,50 25.75,8 74.25,8"/><polygon class="in" points="94,50 72,88.1 28,88.1 6,50 28,11.9 72,11.9"/></svg><div class="mm-n">N</div></div>
    <div class="mm-info"><span class="mm-reg"></span><span class="mm-clock"></span></div>
    <div class="qtrack hidden"><i class="qstar">✦</i><div><div class="qt-type"></div><div class="qt-title"></div><div class="qt-obj"></div></div></div>
  </div>
  <div class="dock">
    <button class="hud-btn" data-open="map" title="地図">${ICON.map}<kbd>M</kbd></button>
    <button class="hud-btn" data-open="quest" title="クエスト">${ICON.quest}<kbd>J</kbd><em class="dot hidden"></em></button>
    <button class="hud-btn" data-open="bag" title="バッグ">${ICON.bag}<kbd>B</kbd></button>
    <button class="hud-btn" data-open="char" title="ステータス">${ICON.char}<kbd>C</kbd></button>
    <button class="hud-btn" data-open="party" title="仲間">${ICON.party}<kbd>P</kbd></button>
    <button class="hud-btn" data-open="pause" title="メニュー">${ICON.menu}<kbd>Esc</kbd></button>
  </div>
  <div class="abar">
    <div class="slot qfood" title="食べ物 (G)"><div class="sl-in"><span class="qf-ic"></span><span class="qf-n"></span></div><kbd>G</kbd></div>
    <div class="slot qsup hidden tbtn" data-act="support" title="サポート (R)"><div class="sl-in"><span class="qs-ic"></span><div class="sk-cd"></div><span class="qs-n"></span></div><kbd>R</kbd></div>
    <div class="slot qplus hidden tbtn" data-act="plus" title="プラス進化 (V)"><div class="sl-in"><span class="qp-ic">✚</span><span class="qp-n"></span></div><kbd>V</kbd></div>
    <div class="sk sk-e tbtn" data-act="skill1"><div class="sk-in"><span class="sk-ic"></span><div class="sk-cd"></div><span class="sk-t"></span></div><kbd>E</kbd></div>
    <div class="sk sk-q tbtn" data-act="skill2"><div class="sk-in"><span class="sk-ic"></span><div class="sk-cd"></div><span class="sk-t"></span></div><kbd>Q</kbd></div>
  </div>
  <div class="mob">
    <div class="tbtn mb-atk" data-act="attack">${ICON.sword}<em>攻撃</em></div>
    <div class="tbtn mb-jump" data-act="jump">${ICON.jump}<em>ジャンプ</em></div>
    <div class="tbtn mb-dash" data-act="dash">${ICON.dash}<em>ダッシュ</em></div>
    <div class="tbtn mb-down hidden" data-act="descend">▼<em>降下</em></div>
    <div class="joy-ghost"><i></i><em>移動</em></div>
    <div class="cam-hint">ドラッグで視点移動</div>
  </div>
  <div class="prompts"></div>
  <div class="toasts"></div>
  <div class="notify"></div>
  <div class="dmg-layer"></div>
  <div class="bubbles"></div>
  <div class="sense"></div>
  <div class="fore"></div>
  <div class="ebars"></div>
  <div class="bossbar hidden"><div class="bb-top"><span class="bb-lv"></span><span class="bb-name"></span></div><div class="bb-bar"><i class="bb-lag"></i><i class="bb-fill"></i></div></div>
  <div class="qmarker hidden"><i>✦</i><span></span></div>
  <div class="ping hidden"><span id="fps">60 FPS</span></div>
  <div class="joy hidden"><div class="joy-k"></div></div>
  <div class="tut hidden"><div class="tut-tag">GUIDE</div><div class="tut-h"></div><div class="tut-b"></div><div class="tut-p"></div><button class="tut-skip">スキップ</button></div>
</div>
<div class="banner hidden"><div class="bn-t"></div><div class="bn-s"></div></div>
<div class="region hidden"><div class="rg-line"></div><div class="rg-t"></div><div class="rg-s"></div></div>
<div class="lvup hidden"></div>
<div class="hurt"></div>
<div class="dialog hidden"><div class="dg-name"></div><div class="dg-text"></div><div class="dg-next">▶</div><div class="dg-choices"></div></div>
<div id="panels"></div>
<div class="fadeblack"></div>`);
    UI.hud = $('#hud'); UI.mm = $('#mm'); UI.mmc = UI.mm.getContext('2d'); UI.cp = $('.compass');
    $$('.hud-btn[data-open]').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); const k = b.dataset.open; if (k === 'map') UI.openMap(); else UI.openMenu(k); }));
    $$('.tbtn').forEach(b => {
      const act = b.dataset.act; if (!act) return;
      const on = (e) => { e.preventDefault(); e.stopPropagation(); PS.Input.virtual(act, true); b.classList.add('down'); };
      const off = (e) => { e.preventDefault(); PS.Input.virtual(act, false); b.classList.remove('down'); };
      b.addEventListener('touchstart', on, { passive: false }); b.addEventListener('touchend', off); b.addEventListener('touchcancel', off);
      b.addEventListener('mousedown', (e) => { if (PS.Input.locked) return; on(e); }); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off);
    });
    $('.qfood').addEventListener('click', (e) => { e.stopPropagation(); G.quickFood(); });
    $('.qfood').addEventListener('touchstart', (e) => { e.preventDefault(); G.quickFood(); }, { passive: false });
    $('.tut-skip').addEventListener('click', (e) => { e.stopPropagation(); PS.Story.tutorialSkip(); });
    $('.dialog').addEventListener('click', (e) => { e.stopPropagation(); UI.dialogNext(); });
    $('.prompts').addEventListener('click', (e) => { const r = e.target.closest('.pr'); if (r) { const it = G.interactables()[+r.dataset.i]; if (it) it.f(); } });
    window.addEventListener('keydown', (e) => { if (UI.dlg && (e.code === 'KeyF' || e.code === 'Space' || e.code === 'Enter')) { if (!UI.dlg.choicesShown) UI.dialogNext(); } });
    for (let i = 0; i < 40; i++) { const el = h('<span class="dmg"></span>'); $('.dmg-layer').appendChild(el); UI.dmgPool.push({ el, t: 99 }); }
    if (PS.isMobile) document.body.classList.add('mobile');
    UI.applyUIScale();
  };
  UI.applyUIScale = function () { document.documentElement.style.setProperty('--ui', (PS.Settings.uiScale || 1) * (PS.isMobile ? 0.82 : 1)); };
  UI.hudShow = function (on) { UI.hud.classList.toggle('hidden', !on); };
  UI.refreshAll = function () {
    UI.refreshQuest(); UI.refreshSkills(); UI.refreshParty();
    if (!UI._newsTold && UI.newsUnread()) { UI._newsTold = true; setTimeout(() => G.state === 'play' && UI.notify('📰 お知らせが更新されました（メニュー →「お知らせ」）', 'info'), 7000); }
  };

  // ================= 毎フレーム =================
  UI.frame = function (dt) {
    if (G.state !== 'play' && G.state !== 'dead') return;
    const p = G.player, S = G.pstat, s = G.save;
    const hpR = PS.clamp(p.hp / S.hp, 0, 1);
    $('.hpfill').style.width = (hpR * 100) + '%'; UI._lag = PS.damp(UI._lag == null ? hpR : UI._lag, hpR, UI._lag > hpR ? 2.5 : 30, dt); $('.hplag').style.width = (UI._lag * 100) + '%';
    $('.hpbar').classList.toggle('low', hpR < 0.3); $('.hptext').textContent = fmt(p.hp) + ' / ' + fmt(S.hp);
    $('.lv').textContent = 'Lv.' + s.level; $('.expbar i').style.width = (s.level >= D.MAX_LV ? 100 : s.exp / D.expNeed(s.level) * 100) + '%';
    const sr = p.stam / p.stamMax, sb = $('.stbar'); sb.querySelector('i').style.width = (sr * 100) + '%';
    sb.classList.toggle('low', sr < 0.25); sb.classList.toggle('use', sr < 0.999 || p.mode === 'climb' || p.mode === 'swim');
    const fl = $('.flight'); if (s.pers === 'flyer') { fl.classList.remove('hidden'); fl.querySelector('i').style.width = (p.fly.t / G.flightMax() * 100) + '%'; fl.classList.toggle('on', p.mode === 'fly'); } else fl.classList.add('hidden');
    $('.mb-down').classList.toggle('hidden', p.mode !== 'fly');
    UI.updateSkillCD(p, s);
    const fid = s.inv[s.foodSel] > 0 ? s.foodSel : Object.keys(s.inv).find(k => D.ITEMS[k] && D.ITEMS[k].cat === 'food');
    $('.qf-ic').textContent = fid ? D.ITEMS[fid].icon : '🍽'; $('.qf-n').textContent = fid ? s.inv[fid] : 0;
    const bf = p.buffs.map(b => '<span class="bf">' + ({ atk: '攻↑', def: '防↑', spd: '速↑' }[b.stat]) + Math.ceil(b.t) + '</span>').join('') + (p.awk.on ? '<span class="bf awk">覚醒 ' + Math.ceil(p.awk.t) + '</span>' : '') + (p.status.freeze > 0 ? '<span class="bf deb">凍結</span>' : '') + (p.status.burn > 0 ? '<span class="bf deb">燃焼</span>' : '') + (p.status.poison > 0 ? '<span class="bf deb">毒</span>' : '') + (p.status.slow > 0 ? '<span class="bf deb">鈍足</span>' : '') + (p.hot ? '<span class="bf">再生</span>' : '');
    if (bf !== UI._bf) { $('.buffs').innerHTML = bf; UI._bf = bf; }
    UI._ft = (UI._ft || 0) + dt;
    if (UI._ft > 0.5) {
      UI._ft = 0; $('#fps').textContent = Math.round(G.fps) + ' FPS'; $('.ping').classList.toggle('hidden', !PS.Settings.showFps);
      const hh = Math.floor(G.tod), mm = Math.floor((G.tod - hh) * 60);
      $('.mm-clock').textContent = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
      $('.mm-reg').textContent = G.scene === 'dungeon' ? G.dun.def.name : W.REG[G.curRegion].name;
      UI.updateAbil();
    }
    PS.Story.tutorialUpdate(dt);
    UI.drawMinimap();
    UI.drawCompass();
    UI.updatePrompts();
    UI.updateMarker();
    UI.updateDmg(dt);
    UI.updateEBars();
    UI.updateParty(dt);
    UI.updateBubbles(dt);
    UI.updateTimer();
    UI.updateSense();
    UI.updateFore();
    if (G.bossActive) UI.bossBar(G.bossActive);
    $('.fadeblack').style.opacity = 0;
  };
  UI.updateSkillCD = function (p, s) {
    const set = (el, ic, cd, max, label, locked) => {
      el.querySelector('.sk-ic').textContent = ic; const c = el.querySelector('.sk-cd'), t = el.querySelector('.sk-t');
      el.classList.toggle('locked', !!locked);
      if (cd > 0) { c.style.background = `conic-gradient(rgba(6,10,24,.78) ${cd / max * 360}deg, transparent 0)`; t.textContent = cd >= 10 ? Math.ceil(cd) : cd.toFixed(1); } else { c.style.background = 'none'; t.textContent = label || ''; }
      el.classList.toggle('ready', !(cd > 0) && !locked);
    };
    const e = $('.sk-e'), q = $('.sk-q');
    if (s.pers === 'awakener') {
      const A = p.awk; q.classList.add('awk');
      set(q, '☄', A.on ? 0 : A.cd, 40, A.on ? Math.ceil(A.t) + 's' : '', false); q.classList.toggle('active', A.on);
      e.classList.add('hidden');
    } else {
      e.classList.remove('hidden');
      [e, q].forEach((el, i) => { const id = s.skills[i], sk = id && G.skillById(id); if (!sk) set(el, '·', 0, 1, '', true); else set(el, UI.skillGlyph(sk), p.cd[id] || 0, sk.cd * (s.pers === 'mage' ? 0.85 : 1), '', false); if (sk) el.style.setProperty('--sc', D.ELEM[sk.el || 'phys'].c); });
    }
  };
  UI.skillGlyph = (sk) => ({ arc: '⟋', dash: '➶', spin: '✺', nova: '✹', proj: '➹', rain: '☄', leap: '⤒', buff: '⬆', heal: '✚', multi: '⚡' }[sk.type] || '✦');
  UI.refreshSkills = function () {
    const s = G.save; if (!s) return; const P = D.PERS[s.pers];
    $('.pname').textContent = s.name; $('.pf-emb span').textContent = P.icon; $('.pf-emb').style.setProperty('--pc', P.color); $('.pf-pers').textContent = P.name;
    $('.sk-q').classList.toggle('awk', s.pers === 'awakener');
  };
  // 方位バー
  UI.drawCompass = function () {
    const cv = UI.cp, dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(cv.clientWidth * dpr), hh = Math.round(cv.clientHeight * dpr);
    if (w < 40) return; if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; }
    const x = cv.getContext('2d'); x.clearRect(0, 0, w, hh);
    const head = Math.atan2(Math.sin(G.cam.yaw), -Math.cos(G.cam.yaw)), span = Math.PI * 0.55;
    const toX = (b) => { let r = b - head; r = Math.atan2(Math.sin(r), Math.cos(r)); return Math.abs(r) > span ? null : w / 2 + r / span * w / 2; };
    const fade = (px) => 1 - Math.pow(Math.abs(px - w / 2) / (w / 2), 2);
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(127,216,255,0)'); g.addColorStop(0.5, 'rgba(127,216,255,.7)'); g.addColorStop(1, 'rgba(127,216,255,0)');
    x.fillStyle = g; x.fillRect(0, hh * 0.58, w, 1.2 * dpr);
    const L = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']; x.textAlign = 'center';
    for (let i = 0; i < 24; i++) {
      const px = toX(i / 24 * Math.PI * 2); if (px == null) continue; x.globalAlpha = fade(px);
      if (i % 3 === 0) { const lb = L[i / 3]; x.fillStyle = lb === 'N' ? '#ffd27a' : '#e8f0ff'; x.font = `700 ${(lb.length > 1 ? 11 : 15) * dpr}px Rajdhani,"Zen Kaku Gothic New",sans-serif`; x.fillText(lb, px, hh * 0.46); }
      else { x.fillStyle = 'rgba(232,240,255,.8)'; x.fillRect(px - 0.5 * dpr, hh * 0.58 - 4 * dpr, 1 * dpr, 4 * dpr); }
    }
    const p = G.player.pos;
    const mark = (wx, wz, col, glyph, sz) => { const px = toX(Math.atan2(wx - p.x, -(wz - p.z))); if (px == null) return; x.globalAlpha = 0.4 + 0.6 * fade(px); x.fillStyle = col; x.font = `${sz * dpr}px sans-serif`; x.fillText(glyph, px, hh * 0.97); };
    if (G.scene === 'world') {
      if (W.ch3) for (const sh of W.SHRINES) if (!(G.save.guardians || [])[sh.id] && Math.hypot(sh.x - p.x, sh.z - p.z) < 900) mark(sh.x, sh.z, sh.color, '◆', 12);
      for (const d of W.DUNGEONS) if (UI.dunVis(d) && Math.hypot(d.x - p.x, d.z - p.z) < 650) mark(d.x, d.z, G.save.dungeons[d.id] ? '#ffd27a' : d.ch2 ? '#7fe0ff' : '#c89cff', '⬢', 11);
      for (const v of W.VILLAGES) if (Math.hypot(v.x - p.x, v.z - p.z) < 550) mark(v.x, v.z, '#9cf0c8', '⌂', 13);
      const tg = G.questTarget(); if (tg && tg.x != null) mark(tg.x, tg.z, '#ffd27a', '✦', 16);
    }
    x.globalAlpha = 1; x.fillStyle = '#7fd8ff'; x.beginPath(); x.moveTo(w / 2, hh * 0.62); x.lineTo(w / 2 - 4 * dpr, hh * 0.62 + 6 * dpr); x.lineTo(w / 2 + 4 * dpr, hh * 0.62 + 6 * dpr); x.closePath(); x.fill();
  };

  // ================= ミニマップ =================
  UI.mapCanvas = function () {
    if (!UI._mapC || UI._mapVisited !== (G.save ? G.save.visited.join(',') : '')) {
      const M = W.map, c = UI._mapC || document.createElement('canvas'); c.width = c.height = M.S; const x = c.getContext('2d');
      const img = new ImageData(M.S, M.S), vis = new Set(G.save ? G.save.visited : []);
      for (let i = 0; i < M.S * M.S; i++) { const r = M.reg[i], src = (r === 255 || vis.has(r)) ? M.full : M.fog; img.data[i * 4] = src.data[i * 4]; img.data[i * 4 + 1] = src.data[i * 4 + 1]; img.data[i * 4 + 2] = src.data[i * 4 + 2]; img.data[i * 4 + 3] = 255; }
      x.putImageData(img, 0, 0);
      x.strokeStyle = 'rgba(255,240,210,0.55)'; x.lineWidth = 1.2; x.setLineDash([2, 4]);
      for (const road of W.ROADS.concat(W.ROADS2 || [], W.ROADS3 || [])) { x.beginPath(); road.forEach((pt, i) => { const px = (pt[0] + W.HALF) / W.SIZE * M.S, py = (pt[1] + W.HALF) / W.SIZE * M.S; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); }
      UI._mapC = c; UI._mapVisited = G.save ? G.save.visited.join(',') : '';
    }
    return UI._mapC;
  };
  UI.dunCanvas = function () {
    const d = G.dun; if (UI._dunFor === d) return UI._dunC;
    const c = document.createElement('canvas'), [x0, z0, x1, z1] = d.bounds, sc = 2; c.width = (x1 - x0) * sc; c.height = (z1 - z0) * sc; const x = c.getContext('2d');
    x.fillStyle = '#0c1226'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = d.theme.floor; const SP = d.SP || 48;
    for (const rm of d.rooms) { x.fillRect((rm.x - rm.w / 2 - x0) * sc, (rm.z - rm.d / 2 - z0) * sc, rm.w * sc, rm.d * sc); for (const dr of rm.doors) { const n = dr.n, nx = n.i * SP, nz = n.j * SP; if (dr.ax === 'x') x.fillRect((Math.min(rm.x, nx) - x0) * sc, (rm.z - 3.5 - z0) * sc, Math.abs(nx - rm.x) * sc, 7 * sc); else x.fillRect((rm.x - 3.5 - x0) * sc, (Math.min(rm.z, nz) - z0) * sc, 7 * sc, Math.abs(nz - rm.z) * sc); } }
    for (const rm of d.rooms) {
      if (rm.pit) { const P = rm.pit; x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect((P.x0 - x0) * sc, (P.z0 - z0) * sc, (P.x1 - P.x0) * sc, (P.z1 - P.z0) * sc); x.strokeStyle = 'rgba(255,120,90,.6)'; x.lineWidth = 2; x.strokeRect((P.x0 - x0) * sc, (P.z0 - z0) * sc, (P.x1 - P.x0) * sc, (P.z1 - P.z0) * sc); }
      for (const pl of rm.plats || []) { x.fillStyle = 'rgba(255,230,170,.55)'; x.fillRect((pl.x - pl.hw - x0) * sc, (pl.z - pl.hd - z0) * sc, pl.hw * 2 * sc, pl.hd * 2 * sc); }
      if (rm.altar) { x.fillStyle = '#7fe0ff'; x.beginPath(); x.arc((rm.x - x0) * sc, (rm.z - z0) * sc, 5, 0, 6.283); x.fill(); }
      if (rm.kind === 'rest') { x.fillStyle = '#7aff9a'; x.beginPath(); x.arc((rm.x - x0) * sc, (rm.z - z0) * sc, 5, 0, 6.283); x.fill(); }
    }
    UI._dunC = c; UI._dunFor = d; return c;
  };
  const hexPath = (x, cx, cy, r) => { x.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; i ? x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : x.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); };
  const starPath = (x, cx, cy, R, r, n) => { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r : R; i ? x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q) : x.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.closePath(); };
  UI.drawMinimap = function () {
    const cv = UI.mm, dpr = Math.min(2, window.devicePixelRatio || 1), size = cv.clientWidth * dpr;
    if (size < 20) return;
    if (cv.width !== size) { cv.width = cv.height = size; }
    const x = UI.mmc, p = G.player.pos, Rr = size / 2;
    x.clearRect(0, 0, size, size); x.save(); hexPath(x, Rr, Rr, Rr - 1); x.clip();
    x.fillStyle = '#16304e'; x.fillRect(0, 0, size, size);
    let toPx;
    if (G.scene === 'dungeon') {
      const c = UI.dunCanvas(), [x0, z0] = G.dun.bounds, sc = 2, view = 70 * sc;
      const cx = (p.x - x0) * sc, cz = (p.z - z0) * sc; x.drawImage(c, cx - view, cz - view, view * 2, view * 2, 0, 0, size, size);
      toPx = (wx, wz) => [Rr + ((wx - x0) * sc - cx) / view * Rr, Rr + ((wz - z0) * sc - cz) / view * Rr];
      for (const rm of G.dun.rooms) if (rm.boss) { const q = toPx(rm.x, rm.z); x.fillStyle = '#ff6a7a'; hexPath(x, q[0], q[1], 7 * dpr); x.fill(); }
    } else {
      const c = UI.mapCanvas(), M = W.map.S, view = 150 / W.SIZE * M;
      const cx = (p.x + W.HALF) / W.SIZE * M, cz = (p.z + W.HALF) / W.SIZE * M;
      x.drawImage(c, cx - view, cz - view, view * 2, view * 2, 0, 0, size, size);
      x.fillStyle = 'rgba(10,20,50,0.18)'; x.fillRect(0, 0, size, size);
      toPx = (wx, wz) => [Rr + ((wx + W.HALF) / W.SIZE * M - cx) / view * Rr, Rr + ((wz + W.HALF) / W.SIZE * M - cz) / view * Rr];
      const mk = (wx, wz, draw) => { const q = toPx(wx, wz); if (Math.hypot(q[0] - Rr, q[1] - Rr) < Rr * 0.78) draw(q[0], q[1]); };
      for (const w of W.WAYPOINTS) mk(w.x, w.z, (a, b) => UI.icWaypoint(x, a, b, 7 * dpr, G.save.waypoints.includes(w.id)));
      for (const d of W.DUNGEONS) if (UI.dunVis(d)) mk(d.x, d.z, (a, b) => UI.icDungeon(x, a, b, 8 * dpr, G.save.dungeons[d.id], d.ch4 ? 'ch4' : d.ch2));
      if (UI.mmExtra) UI.mmExtra(x, mk, dpr);
      if (W.ch3) for (const sh of W.SHRINES) mk(sh.x, sh.z, (a, b) => { x.font = `${13 * dpr}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = (G.save.guardians || [])[sh.id] ? '#ffd27a' : sh.color; x.fillText('◆', a, b); });
      for (const f of G.fairyHomes || []) mk(f.pos.x, f.pos.z, (a, b) => { x.font = `${12 * dpr}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = D.SUPPORT[f.id].color; x.fillText(D.SUPPORT[f.id].icon, a, b); });
      for (const c of G.party || []) mk(c.pos.x, c.pos.z, (a, b) => { x.fillStyle = c.down ? '#777' : c.def.color; x.strokeStyle = '#0b1530'; x.lineWidth = 1.2 * dpr; x.beginPath(); x.arc(a, b, 3.2 * dpr, 0, 6.283); x.fill(); x.stroke(); });
      for (const v of W.VILLAGES) mk(v.x, v.z, (a, b) => UI.icStatue(x, a, b, 8 * dpr));
      for (const e of G.enemies) if (e.aggro && !e.dead) mk(e.x, e.z, (a, b) => { x.fillStyle = e.boss ? '#ff3a5a' : '#ff6a6a'; x.fillRect(a - 2.5 * dpr, b - 2.5 * dpr, 5 * dpr, 5 * dpr); });
    }
    const tg = G.questTarget();
    if (tg && tg.x != null && G.scene !== 'dungeon') { let q = toPx(tg.x, tg.z); const dx = q[0] - Rr, dy = q[1] - Rr, d = Math.hypot(dx, dy), lim = Rr * 0.74; if (d > lim) q = [Rr + dx / d * lim, Rr + dy / d * lim]; UI.icQuest(x, q[0], q[1], 8 * dpr); }
    // 視界
    x.save(); x.translate(Rr, Rr); x.rotate(Math.PI - G.cam.yaw);
    const gr = x.createLinearGradient(0, 0, 0, -Rr * 0.8); gr.addColorStop(0, 'rgba(127,216,255,0.38)'); gr.addColorStop(1, 'rgba(127,216,255,0)');
    x.fillStyle = gr; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, Rr * 0.8, -Math.PI / 2 - 0.5, -Math.PI / 2 + 0.5); x.closePath(); x.fill(); x.restore();
    x.restore();
    // プレイヤー
    x.save(); x.translate(Rr, Rr); x.rotate(Math.PI - G.player.yaw);
    x.fillStyle = '#ffd27a'; x.strokeStyle = '#0b1530'; x.lineWidth = 1.5 * dpr; x.beginPath(); x.moveTo(0, -9 * dpr); x.lineTo(6.5 * dpr, 7 * dpr); x.lineTo(0, 3 * dpr); x.lineTo(-6.5 * dpr, 7 * dpr); x.closePath(); x.fill(); x.stroke(); x.restore();
  };
  UI.icWaypoint = (x, a, b, r, on) => { x.save(); starPath(x, a, b, r * 1.15, r * 0.38, 4); x.fillStyle = on ? '#7fd8ff' : '#8a92a6'; x.strokeStyle = '#0b1530'; x.lineWidth = r * 0.22; x.fill(); x.stroke(); x.restore(); };
  UI.icDungeon = (x, a, b, r, done, ch2) => { x.save(); hexPath(x, a, b, r); x.fillStyle = done ? '#ffd27a' : ch2 === 'ch4' ? '#ff7ad8' : ch2 ? '#3aa8e0' : '#9a6ad8'; x.strokeStyle = '#0b1530'; x.lineWidth = r * 0.22; x.fill(); x.stroke(); hexPath(x, a, b, r * 0.45); x.fillStyle = '#0b1530'; x.fill(); x.restore(); };
  UI.icStatue = (x, a, b, r) => { x.save(); x.beginPath(); x.arc(a, b, r, 0, 6.283); x.fillStyle = '#1f6a5a'; x.strokeStyle = '#e8f0ff'; x.lineWidth = r * 0.18; x.fill(); x.stroke(); starPath(x, a, b, r * 0.62, r * 0.26, 5); x.fillStyle = '#ffd27a'; x.fill(); x.restore(); };
  UI.icQuest = (x, a, b, r) => { x.save(); x.shadowColor = '#ffd27a'; x.shadowBlur = r; starPath(x, a, b, r * 1.1, r * 0.45, 5); x.fillStyle = '#ffd27a'; x.strokeStyle = '#3a2a08'; x.lineWidth = r * 0.2; x.fill(); x.stroke(); x.restore(); };

  // ================= プロンプト・マーカー =================
  UI.updatePrompts = function () {
    const list = G.state === 'play' && !G.uiOpen ? G.interactables().slice(0, 4) : [];
    const key = list.map(i => i.text).join('|');
    if (key !== UI._pk) { UI._pk = key; $('.prompts').innerHTML = list.map((it, i) => `<div class="pr${i ? '' : ' first'}" data-i="${i}">${i ? '' : '<kbd>F</kbd>'}<span class="pr-ic">${it.icon}</span><span>${it.text}</span></div>`).join(''); }
  };
  UI.updateMarker = function () {
    const m = $('.qmarker'), tg = G.state === 'play' && G.questTarget();
    if (!tg || tg.x == null || G.scene === 'dungeon') { m.classList.add('hidden'); return; }
    const p = G.player.pos, d = Math.hypot(tg.x - p.x, tg.z - p.z);
    const s = PS.R.toScreen(tg.x, tg.y, tg.z, UI._ms || (UI._ms = {}));
    const Wd = window.innerWidth, Hd = window.innerHeight;
    let x = s.x, y = s.y; if (!s.vis) { x = Wd - x; y = Hd - 40; }
    x = PS.clamp(x, 40, Wd - 40); y = PS.clamp(y, 70, Hd - 150);
    m.classList.remove('hidden'); m.style.transform = `translate(${x}px,${y}px)`; m.querySelector('span').textContent = d < 1000 ? Math.round(d) + 'm' : (d / 1000).toFixed(1) + 'km';
  };
  UI.refreshQuest = function () {
    const qt = $('.qtrack'); if (!G.save) return;
    const id = G.save.tracked, st = id && G.save.quests[id];
    if (!id || !st || st.st === 'done') { qt.classList.add('hidden'); return; }
    const q = D.QUESTS[id]; qt.classList.remove('hidden'); qt.classList.toggle('side', !q.main);
    qt.querySelector('.qt-type').textContent = q.main ? 'MAIN QUEST' : 'SUB QUEST';
    qt.querySelector('.qt-title').textContent = q.title;
    const tg = G.questTarget(); let obj = tg ? tg.label : '';
    if (id === 'mq2') obj += '（' + st.prog.filter(x => x).length + '/5）';
    if (id === 'mq5') obj += '（' + st.prog.filter(x => x).length + '/6）';
    qt.querySelector('.qt-obj').textContent = obj;
    $('.dock .dot').classList.toggle('hidden', !Object.values(G.save.quests).some(s => s.st === 'active'));
  };

  // ================= ダメージ数字 =================
  UI.dmg = function (x, y, z, val, color, crit, tag) {
    let slot = UI.dmgPool.find(d => d.t > 1.1) || UI.dmgPool.reduce((a, b) => a.t > b.t ? a : b);
    slot.t = 0; slot.x = x + (Math.random() - 0.5) * 0.6; slot.y = y; slot.z = z + (Math.random() - 0.5) * 0.6; slot.vx = (Math.random() - 0.5) * 30;
    const el = slot.el; el.textContent = typeof val === 'number' ? fmt(val) : val; el.style.color = color; el.className = 'dmg' + (crit ? ' crit' : '') + (tag ? ' ' + tag : '');
  };
  UI.updateDmg = function (dt) {
    const o = UI._ds || (UI._ds = {});
    for (const d of UI.dmgPool) {
      if (d.t > 1.1) { if (d.vis) { d.el.style.opacity = 0; d.vis = false; } continue; }
      d.t += dt; const s = PS.R.toScreen(d.x, d.y + d.t * 0.9, d.z, o);
      if (!s.vis) { d.el.style.opacity = 0; continue; }
      const k = d.t < 0.12 ? 1.5 - d.t * 4 : 1; d.vis = true;
      d.el.style.opacity = PS.clamp((1.1 - d.t) * 3, 0, 1); d.el.style.transform = `translate(${s.x + d.vx * d.t}px,${s.y}px) translate(-50%,-50%) scale(${k})`;
    }
  };
  UI.updateEBars = function () {
    const lay = $('.ebars'), p = G.player.pos, list = G.enemies.filter(e => !e.dead && !e.boss && (e.aggro || e.hp < e.maxHp) && Math.hypot(e.x - p.x, e.z - p.z) < 32).slice(0, 12);
    while (UI.ebarPool.length < list.length) { const el = h('<div class="eb"><div class="eb-n"></div><div class="eb-b"><i></i></div></div>'); lay.appendChild(el); UI.ebarPool.push(el); }
    const o = UI._es || (UI._es = {});
    UI.ebarPool.forEach((el, i) => {
      const e = list[i]; if (!e) { el.style.display = 'none'; return; }
      const s = PS.R.toScreen(e.x, e.y + e.height + 0.35, e.z, o); if (!s.vis) { el.style.display = 'none'; return; }
      el.style.display = ''; el.style.transform = `translate(${s.x}px,${s.y}px)`;
      const nm = 'Lv.' + e.lv + ' ' + e.def0.name; if (el._n !== nm) { el._n = nm; el.firstChild.textContent = nm; }
      el.classList.toggle('elite', e.elite); el.querySelector('i').style.width = (e.hp / e.maxHp * 100) + '%';
    });
  };
  UI.alert = function (e) { e.alertT = G.time; G.emit(1, { x: e.x, y: e.y + e.height + 0.6, z: e.z, color: '#ffcf3a', vs: 0, size: 0.5, life: 0.8, kind: 1 }); };
  UI.bossBar = function (e) {
    const b = $('.bossbar'); if (!e || e.dead) { b.classList.add('hidden'); return; }
    b.classList.remove('hidden'); b.querySelector('.bb-name').textContent = e.def0.name; b.querySelector('.bb-lv').textContent = 'Lv.' + e.lv;
    const r = e.hp / e.maxHp; b.querySelector('.bb-fill').style.width = (r * 100) + '%';
    UI._bl = UI._bl == null || UI._bl < r ? r : PS.damp(UI._bl, r, 2, 0.016); b.querySelector('.bb-lag').style.width = (UI._bl * 100) + '%';
  };

  // ================= 通知 =================
  UI.notify = function (text, type) {
    const n = $('.notify'), el = h(`<div class="nt ${type || ''}">${text}</div>`); n.appendChild(el);
    while (n.children.length > 3) n.firstChild.remove();
    setTimeout(() => el.classList.add('out'), 2600); setTimeout(() => el.remove(), 3200);
  };
  UI.toast = function (icon, name, n, rar) {
    const t = $('.toasts'), el = h(`<div class="ts" style="--rc:${RAR[rar || 1]}"><span class="ts-ic">${icon}</span><span class="ts-n">${name}</span><span class="ts-c">×${fmt(n)}</span></div>`);
    t.appendChild(el); while (t.children.length > 6) t.firstChild.remove();
    setTimeout(() => el.classList.add('out'), 2800); setTimeout(() => el.remove(), 3400); PS.Audio.sfxPlay('pickup', 0.4);
  };
  UI.coinTick = function (n) { UI._coinAcc = (UI._coinAcc || 0) + n; clearTimeout(UI._ct); UI._ct = setTimeout(() => { UI.toast('🪙', 'スターコイン', UI._coinAcc, 2); UI._coinAcc = 0; }, 400); };
  UI.expGain = function (n) { };
  UI.banner = function (t, s, color) {
    const b = $('.banner'); UI._bq = UI._bq || [];
    UI._bq.push([t, s, color]); if (UI._bq.length > 1) return;
    const show = () => {
      const [a, c, col] = UI._bq[0]; b.querySelector('.bn-t').textContent = a; b.querySelector('.bn-s').textContent = c; b.style.setProperty('--bc', col || '#ffd36a');
      b.classList.remove('hidden', 'out'); void b.offsetWidth; b.classList.add('in');
      setTimeout(() => { b.classList.add('out'); }, 2300);
      setTimeout(() => { b.classList.add('hidden'); b.classList.remove('in', 'out'); UI._bq.shift(); if (UI._bq.length) show(); }, 2800);
    };
    show();
  };
  UI.regionTitle = function (t, s) {
    const r = $('.region'); r.querySelector('.rg-t').textContent = t; r.querySelector('.rg-s').textContent = s || '';
    r.classList.remove('hidden', 'show'); void r.offsetWidth; r.classList.add('show'); clearTimeout(UI._rt); UI._rt = setTimeout(() => r.classList.add('hidden'), 4200);
  };
  UI.levelUp = function (lv, g, luck) {
    const el = $('.lvup');
    el.innerHTML = `<div class="lu-t">レベルアップ</div><div class="lu-lv">Lv.${lv - 1} <span>→</span> Lv.${lv}</div><div class="lu-g"><span class="${luck.includes('hp') ? 'luck' : ''}">HP +${fmt(g.hp)}</span><span class="${luck.includes('atk') ? 'luck' : ''}">攻撃力 +${fmt(g.atk)}</span><span class="${luck.includes('def') ? 'luck' : ''}">防御力 +${fmt(g.def)}</span></div>${luck.length ? '<div class="lu-luck">✦ 幸運ボーナス発生！ ✦</div>' : ''}`;
    el.classList.remove('hidden', 'show'); void el.offsetWidth; el.classList.add('show'); clearTimeout(UI._lt); UI._lt = setTimeout(() => el.classList.add('hidden'), 3600);
  };
  UI.hurtFlash = function () { const e = $('.hurt'); e.classList.remove('on'); void e.offsetWidth; e.classList.add('on'); };
  UI.joyShow = function (x, y, dx, dy) { const g = $('.joy-ghost'); if (g) g.classList.add('off'); const j = $('.joy'); j.classList.remove('hidden'); j.style.left = x + 'px'; j.style.top = y + 'px'; j.firstChild.style.transform = `translate(${dx * 40}px,${dy * 40}px)`; };
  UI.joyHide = function () { $('.joy').classList.add('hidden'); const g = $('.joy-ghost'); if (g) g.classList.remove('off'); };

  // ================= 会話 =================
  UI.dialog = function (name, lines, onDone, choices) {
    UI.dlg = { name, lines: lines.map(l => l.replace(/\{name\}/g, G.save ? G.save.name : '')), i: 0, onDone, choices, choicesShown: false };
    G.uiOpen = 'dialog'; if (PS.Input.locked) document.exitPointerLock();
    $('.dialog').classList.remove('hidden'); UI.hudShow(false); UI.dialogShow();
  };
  UI.dialogShow = function () {
    const d = UI.dlg, el = $('.dialog');
    el.querySelector('.dg-name').textContent = d.name; const tx = el.querySelector('.dg-text'), line = d.lines[d.i];
    tx.textContent = ''; clearInterval(UI._ti); let k = 0; d.typing = true;
    UI._ti = setInterval(() => { k += 2; tx.textContent = line.slice(0, k); if (k >= line.length) { clearInterval(UI._ti); d.typing = false; if (d.i === d.lines.length - 1 && d.choices) UI.dialogChoices(); } }, 28);
    el.querySelector('.dg-choices').innerHTML = '';
  };
  UI.dialogChoices = function () {
    const d = UI.dlg; if (!d) return; d.choicesShown = true; const c = $('.dg-choices');
    c.innerHTML = d.choices.map((ch, i) => `<button class="dgc" data-i="${i}"><i>💬</i>${ch.t}</button>`).join('');
    $$('.dgc', c).forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); const ch = d.choices[+b.dataset.i]; UI.dialogClose(); PS.Audio.sfxPlay('ui'); if (ch.f) ch.f(); }));
  };
  UI.dialogNext = function () {
    const d = UI.dlg; if (!d) return;
    if (d.typing) { clearInterval(UI._ti); $('.dg-text').textContent = d.lines[d.i]; d.typing = false; if (d.i === d.lines.length - 1 && d.choices) UI.dialogChoices(); return; }
    if (d.choicesShown) return;
    PS.Audio.sfxPlay('ui', 0.5);
    if (d.i < d.lines.length - 1) { d.i++; UI.dialogShow(); } else { const cb = d.onDone; UI.dialogClose(); if (cb) cb(); }
  };
  UI.dialogClose = function () { clearInterval(UI._ti); $('.dialog').classList.add('hidden'); UI.dlg = null; if (G.uiOpen === 'dialog') G.uiOpen = null; if (G.state === 'play') UI.hudShow(true); };

  // ================= パネル共通 =================
  UI.panel = function (cls, html, onClose) {
    const host = $('#panels');
    const el = h(`<div class="panel ${cls}"><div class="pn-bg"></div><div class="pn-box">${html}</div><button class="pn-x" title="閉じる"><kbd>Esc</kbd>閉じる</button></div>`);
    host.appendChild(el); UI.stack.push({ el, onClose });
    G.uiOpen = cls; if (PS.Input.locked) document.exitPointerLock();
    UI.hudShow(false); PS.Audio.sfxPlay('uiOpen');
    el.querySelector('.pn-x').addEventListener('click', () => UI.closeTop());
    el.addEventListener('mousedown', e => e.stopPropagation());
    return el;
  };
  UI.closeTop = function () {
    if (UI.dlg) return;
    const top = UI.stack.pop(); if (!top) return;
    top.el.classList.add('closing'); setTimeout(() => top.el.remove(), 160); PS.Audio.sfxPlay('uiClose');
    if (top.onClose) top.onClose();
    if (!UI.stack.length) { G.uiOpen = null; if (G.state === 'play') UI.hudShow(true); }
    else G.uiOpen = UI.stack[UI.stack.length - 1].el.classList[1];
  };
  UI.closeAll = function () { while (UI.stack.length) UI.closeTop(); };
  UI.openMenu = function (k) {
    if (G.state !== 'play' || UI.dlg) return;
    if (UI.stack.some(s => s.el.classList.contains(k))) return;
    if (k === 'pause') return UI.pauseMenu();
    if (k === 'char') return UI.charMenu();
    if (k === 'bag') return UI.bagMenu();
    if (k === 'quest') return UI.questMenu();
    if (k === 'settings') return UI.settingsMenu();
    if (k === 'map') return UI.openMap();
    if (k === 'party') return UI.partyMenu();
    if (k === 'news') return UI.newsModal();
  };
  UI.confirm = function (msg, yes, no, yesT, noT) {
    const el = UI.panel('confirm', `<div class="cf-msg">${msg}</div><div class="cf-btns"><button class="btn ghost no">${noT || 'キャンセル'}</button><button class="btn yes">${yesT || '確認'}</button></div>`);
    el.querySelector('.yes').onclick = () => { UI.closeTop(); yes && yes(); };
    el.querySelector('.no').onclick = () => { UI.closeTop(); no && no(); };
  };

  // ================= メニュー =================
  UI.pauseMenu = function () {
    const s = G.save, P = D.PERS[s.pers];
    const items = [['char', 'ステータス', ICON.char, 'C'], ['party', '仲間', ICON.party, 'P'], ['bag', 'バッグ', ICON.bag, 'B'], ['quest', 'クエスト', ICON.quest, 'J'], ['map', '地図', ICON.map, 'M'], ['news', 'お知らせ', ICON.news, ''], ['settings', '設定', ICON.gear, ''], ['save', 'セーブ', ICON.save, ''], ['help', '操作説明', ICON.help, ''], ['title', 'タイトルへ戻る', ICON.exit, '']];
    const ch2 = s.chapter >= 2 || s.final, shards = s.dungeons.slice(0, 5).filter(x => x).length, relics = s.dungeons.slice(5, 11).filter(x => x).length, ps = G.partySave();
    const el = UI.panel('pause', `<div class="pm-wrap"><div class="pm-list"><h2 class="pn-h">メニュー</h2>${items.map(i => `<button class="pm-it" data-k="${i[0]}"><span class="pm-ic">${i[2]}</span><span class="pm-l">${i[1]}</span>${i[0] === 'news' && UI.newsUnread() ? '<em class="pm-new">NEW</em>' : ''}${i[3] ? `<kbd>${i[3]}</kbd>` : ''}</button>`).join('')}</div>
      <div class="pm-card" style="--pc:${P.color}"><div class="pm-top"><div class="pm-face">${P.icon}</div><div><div class="pm-nm">${s.name}</div><div class="pm-sub">${P.name}　Lv.${s.level}</div></div></div>
        <div class="pm-chap">${s.chapter >= 4 ? '第四章　天界の欠片' : s.chapter >= 3 ? '第三章　異界の結晶' : ch2 ? '第二章　浮上せし大地' : '第一章　星の欠片'}</div>
        <div class="pm-rows"><div><span>スターコイン</span><b>🪙 ${fmt(s.coins)}</b></div><div><span>星の欠片</span><b>⭐ ${shards} / 5</b></div>${ch2 ? `<div><span>天星石（星界の遺跡）</span><b>💠 ${relics} / 6</b></div>` : ''}${s.chapter >= 3 ? `<div><span>異界の結晶</span><b>🔷 ${(s.guardians || []).filter(x => x).length} / 5</b></div>` : ''}${s.chapter >= 4 ? `<div><span>天界の欠片</span><b>🌟 ${(s.heaven || []).filter(x => x).length} / 4</b></div>` : ''}${s.plus && G.plusOn && G.plusOn() ? `<div><span>プラス進化</span><b style="color:#ffe08a">✚ のこり ${UI.mmss(s.plus.end - s.play)}</b></div>` : ''}<div><span>旅の仲間</span><b>${ps.list.length} / ${D.COMP_ORDER.length}</b></div><div><span>討伐数</span><b>${fmt(s.kills)}</b></div><div><span>プレイ時間</span><b>${Math.floor(s.play / 3600)}時間${Math.floor(s.play / 60) % 60}分</b></div></div>
        <div class="pm-uid">冒険者ID ${s.uid}</div></div></div>`);
    $$('.pm-it', el).forEach(b => b.onclick = () => {
      const k = b.dataset.k; PS.Audio.sfxPlay('ui');
      if (k === 'save') { G.writeSave(); return; }
      if (k === 'help') return UI.helpMenu();
      if (k === 'news') { b.querySelector('.pm-new') && b.querySelector('.pm-new').remove(); return UI.newsModal(); }
      if (k === 'title') return UI.confirm('セーブしてタイトル画面に戻りますか？', () => { G.writeSave(true); location.reload(); });
      if (k === 'map') return UI.openMap();
      UI.openMenu(k);
    });
  };
  UI.helpMenu = function () {
    UI.panel('help', `<h2 class="pn-h">操作説明</h2><div class="help-cols">
      <div><h3>パソコン</h3><table>
      ${[['移動', 'W A S D'], ['視点', 'マウス（画面クリックでロック）'], ['通常攻撃', '左クリック'], ['ダッシュ／スプリント', 'Shift / 右クリック（長押しで走る）'], ['ジャンプ', 'Space'], ['スキル', 'E ・ Q'], ['覚醒（覚醒者）', 'Z'], ['飛行（飛翔者）', '空中で Space（上昇 Space／下降 Ctrl・X）'], ['調べる・話す・拾う', 'F'], ['食べ物', 'G'], ['サポート（ルミの回復・効果の確認）', 'R'], ['人格切り替え（割り当てたキャラに切り替え）', '1 〜 4'], ['プラス進化', 'V'], ['仲間', 'P'], ['地図', 'M'], ['バッグ', 'B'], ['ステータス', 'C'], ['クエスト', 'J'], ['メニュー', 'Esc'], ['カーソルを表示', 'Alt'], ['ズーム', 'マウスホイール']].map(r => `<tr><td>${r[0]}</td><td><kbd>${r[1]}</kbd></td></tr>`).join('')}</table></div>
      <div><h3>スマートフォン</h3><p>画面左側をドラッグで移動、右側をドラッグで視点操作。右下のボタンで攻撃・ジャンプ・ダッシュ・スキル。</p><h3>ゲームパッド</h3><p>左スティック移動／右スティック視点／□攻撃／×ジャンプ／○ダッシュ／R1・R2スキル／L1覚醒／△調べる／十字キー上 食べ物／十字キー下 サポート／十字キー左 仲間。</p><h3>タッチ操作とキーボード操作</h3><p>指で画面に触れるとタッチ操作のUIに、マウスをクリックするとキーボード操作のUIに自動で切り替わります。タッチ操作では、画面左側をドラッグで移動、右側をドラッグで視点移動。右下の大きなボタンが攻撃です。</p><h3>第二章の遺跡</h3><p>「風切りの羽」を手に入れた遺跡では、空中でジャンプすると飛べます（飛翔中に攻撃で急降下）。「跳躍の靴」を手に入れた遺跡では、ジャンプ力が大きく上がります。どちらもその遺跡の中だけで使えます。</p>
      <h3>人格切り替え・プラス進化</h3><p>数字キー（1〜4）で、主人公と旅の仲間（3人まで）を切り替えて自分で操作できます（スマホは左上のリストをタップ）。キーの割り当ては仲間画面（P）または設定の「人格切り替え」で。プラスクリスタル15個・Lv.81以上で V キー（スマホは✚ボタン）を押すとプラス進化します。</p><h3>ヒント</h3><ul>${D.TIPS.slice(0, 7).map(t => '<li>' + t + '</li>').join('')}</ul></div></div>`);
  };

  // ================= キャラクター =================
  UI.charMenu = function (tab) {
    tab = tab || 'stat';
    const el = UI.panel('char', '<div class="ch-wrap"></div>');
    UI.renderChar(el, tab);
  };
  UI.renderChar = function (el, tab) {
    const s = G.save, P = D.PERS[s.pers], S = G.calcStats ? G.calcStats(null) : G.pstat, w = G.wpn();
    const tabs = [['stat', 'ステータス'], ['weapon', '武器'], ['skill', 'スキル'], ['pers', '人格']];
    let body = '';
    if (tab === 'stat') {
      const need = D.expNeed(s.level);
      body = `<div class="ch-stat"><div class="ch-lv">Lv.<b>${s.level}</b><span>/${D.MAX_LV}</span>${G.plusOn && G.plusOn() ? `<em class="ch-plus">✚ Lv.${s.level + D.PLUS.lv} 相当</em>` : ''}</div><div class="ch-exp"><i style="width:${s.level >= D.MAX_LV ? 100 : s.exp / need * 100}%"></i></div><div class="ch-expt">経験値 ${fmt(s.exp)} / ${fmt(need)}</div>
      <table class="st-t">${[['HP上限', fmt(S.hp)], ['攻撃力', fmt(S.atk)], ['防御力', fmt(S.def)], ['移動速度', 'x' + S.spd.toFixed(2)], ['会心率', (S.crit * 100).toFixed(1) + '%'], ['会心ダメージ', (S.critDmg * 100).toFixed(1) + '%'], ['スタミナ', '240']].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
      <div class="ch-note">レベルアップごとに HP+1500・攻撃力+500・防御力+250（1%の確率で HP+1750・攻撃力+550・防御力+320）</div>
      ${s.pers === 'flyer' ? `<div class="ch-note">飛行時間：${G.flightMax()}秒（Lv.5ごとに+1秒）</div>` : ''}${s.pers === 'awakener' ? `<div class="ch-note">覚醒時間：${G.awakenDur()}秒（Lv.5ごとに+10秒）・覚醒倍率 x2.5</div>` : ''}${s.pers === 'healer' ? `<div class="ch-note">自動回復：被弾3秒後から毎秒 HP${Math.max(10, Math.round(S.hp * 0.005))} 回復</div>` : ''}${P.honest ? `<div class="ch-note warn">正直者の誓い：報酬・獲得経験値 -25%／迷宮とミッションに制限時間あり</div>` : ''}${G.activeSups().map(id => { const c = D.COMPAT[D.compatOf(id, s.pers)], S = D.SUPPORT[id]; return `<div class="ch-note fuwa" style="box-shadow:inset 2px 0 0 ${S.color}">${S.icon} ${S.name}（<b style="color:${c.c}">${c.name}</b>）：${D.supEffect(id, s.pers)}</div>`; }).join('')}${P.hearer ? '<div class="ch-note">超聴者：攻撃・飛び道具・接近する敵の方向が画面の縁に表示される／近くの宝箱の音が聞こえる</div>' : ''}${P.prophet ? `<div class="ch-note">予言者：${(D.FORESIGHT * G.supMods().pers).toFixed(1)}秒先までの敵の攻撃が見える</div>` : ''}${UI.plusPanel ? UI.plusPanel() : ''}${G.curComp && G.curComp() ? `<div class="ch-note">いまは「${D.COMPANIONS[G.curComp()].name}」を操作中です。ここには主人公のステータスを表示しています（仲間のステータスは仲間画面へ）。</div>` : ''}</div>`;
    } else if (tab === 'weapon') {
      const list = s.weapons.map(id => D.W[id]).sort((a, b) => b.atk - a.atk);
      body = `<div class="wp-cur"><div class="wp-big rar${w.rar}">${UI.wIcon(w.type)}</div><div><div class="wp-nm">${w.name}</div><div class="stars">${STAR(w.rar)}</div><div>攻撃力 +${fmt(w.atk)} ${w.el ? '／ ' + D.ELEM[w.el].name + '属性' : ''}</div><div class="wp-ds">${w.desc}</div></div></div>
      <div class="wp-list">${list.map(x => { const ok = P.weapons.includes(x.type); return `<button class="wp-it rar${x.rar} ${x.id === s.weapon ? 'eq' : ''} ${ok ? '' : 'ng'}" data-id="${x.id}"><div class="wi-ic">${UI.wIcon(x.type)}</div><div class="wi-nm">${x.name}</div><div class="wi-a">+${fmt(x.atk)}</div>${x.id === s.weapon ? '<div class="wi-eq">装備中</div>' : ''}${ok ? '' : '<div class="wi-ng">装備不可</div>'}</button>`; }).join('')}</div>
      <div class="ch-note">${P.name}が装備できる武器：${P.weapons.map(t => ({ sword: '剣', axe: '斧', staff: '杖' }[t])).join('・')}</div>`;
    } else if (tab === 'skill') {
      const all = D.SKILLS[s.pers] || [];
      if (s.pers === 'awakener') body = `<div class="sk-none"><div class="big">☄</div><b>覚醒者はスキルを覚えられません</b><p>代わりに Z キー（スマホは☄ボタン）で覚醒モードに入れます。覚醒中は全ステータスが x2.5 になります。<br>覚醒時間：${G.awakenDur()}秒 ／ クールタイム：40秒</p></div>`;
      else body = `<div class="sk-slots"><div class="slot">E：<b>${s.skills[0] ? G.skillById(s.skills[0]).name : '未装備'}</b></div><div class="slot">Q：<b>${s.skills[1] ? G.skillById(s.skills[1]).name : '未装備'}</b></div></div>
        <div class="sk-list">${all.map(k => { const ok = k.lv <= s.level; return `<div class="sk-row ${ok ? '' : 'lock'}" style="--sc:${D.ELEM[k.el || 'phys'].c}"><div class="sr-ic">${UI.skillGlyph(k)}</div><div class="sr-b"><div class="sr-n">${k.name} <small>Lv.${k.lv}　CT ${(k.cd * (s.pers === 'mage' ? 0.85 : 1)).toFixed(1)}秒　${D.ELEM[k.el || 'phys'].name}</small></div><div class="sr-d">${k.desc}</div></div>${ok ? `<div class="sr-btn"><button class="btn sm" data-sk="${k.id}" data-slot="0">Eに装備</button><button class="btn sm" data-sk="${k.id}" data-slot="1">Qに装備</button></div>` : `<div class="sr-lock">Lv.${k.lv}で習得</div>`}</div>`; }).join('')}</div>`;
    } else {
      body = `<div class="pe-card" style="--pc:${P.color}"><div class="pe-ic">${P.icon}</div><div class="pe-n">${P.name}<small>${P.en}</small></div><p>${P.desc}</p><div class="pe-md"><div><h4>メリット</h4><ul>${P.merit.map(m => '<li>' + m + '</li>').join('')}</ul></div><div><h4>デメリット</h4><ul>${P.demerit.map(m => '<li>' + m + '</li>').join('')}</ul></div></div><div class="ch-note">人格は転生時に魂へ刻まれたもの。二度と変えることはできない。</div></div>`;
    }
    el.querySelector('.ch-wrap').innerHTML = `<div class="ch-head"><div class="ch-emb" style="--pc:${P.color}">${P.icon}</div><div><div class="ch-name">${s.name}</div><div class="ch-pers">${P.name}　Lv.${s.level}</div></div><div class="ch-tabs tabs">${tabs.map(t => `<button class="${t[0] === tab ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div></div><div class="ch-main">${body}</div>`;
    $$('.ch-tabs button', el).forEach(b => b.onclick = () => { PS.Audio.sfxPlay('ui'); UI.renderChar(el, b.dataset.t); });
    $$('.wp-it', el).forEach(b => b.onclick = () => { if (G.equipWeapon(b.dataset.id)) UI.renderChar(el, 'weapon'); });
    const pg = el.querySelector('.plus-go'); if (pg) pg.onclick = () => { UI.closeAll(); setTimeout(() => G.plusEvolve(), 80); };
    $$('[data-sk]', el).forEach(b => b.onclick = () => { const sl = +b.dataset.slot, id = b.dataset.sk, o = s.skills.indexOf(id); if (o >= 0) s.skills[o] = s.skills[sl]; s.skills[sl] = id; PS.Audio.sfxPlay('ui'); UI.renderChar(el, 'skill'); });
  };
  UI.wIcon = (t) => ({ sword: '🗡', axe: '🪓', staff: '🪄' }[t] || '⚔');

  // ================= バッグ =================
  UI.bagMenu = function (tab) {
    const el = UI.panel('bag', '<div class="bag-wrap"></div>'); UI.renderBag(el, tab || 'food');
  };
  UI.renderBag = function (el, tab, sel) {
    const s = G.save;
    const tabs = [['food', '食べ物'], ['mat', '素材'], ['weapon', '武器'], ['key', '大切なもの']];
    let items = [];
    if (tab === 'weapon') items = s.weapons.map(id => ({ id, w: D.W[id], n: 1, rar: D.W[id].rar, icon: UI.wIcon(D.W[id].type), name: D.W[id].name }));
    else items = Object.keys(s.inv).filter(k => D.ITEMS[k] && D.ITEMS[k].cat === tab && s.inv[k] > 0).map(id => ({ id, it: D.ITEMS[id], n: s.inv[id], rar: D.ITEMS[id].rar, icon: D.ITEMS[id].icon, name: D.ITEMS[id].name }));
    sel = sel || (items[0] && items[0].id);
    const cur = items.find(i => i.id === sel);
    let det = '<div class="bd-empty">アイテムがありません</div>';
    if (cur) {
      const it = cur.it, w = cur.w;
      det = `<div class="bd-top rar${cur.rar}"><div class="bd-n">${cur.name}</div><div class="bd-c">${w ? ({ sword: '片手剣', axe: '斧', staff: '杖' }[w.type]) : ({ food: '料理・食材', mat: '素材', key: '大切なもの' }[it.cat])}</div><div class="stars">${STAR(cur.rar)}</div><div class="bd-ic">${cur.icon}</div></div>
      <div class="bd-body">${w ? `<div class="bd-a">攻撃力 +${fmt(w.atk)}</div>` : ''}${it && it.heal ? `<div class="bd-a">HP ${Math.round(it.heal * 100)}% 回復</div>` : ''}<p>${w ? w.desc : it.desc}</p>${it ? `<div class="bd-own">所持数：${cur.n}</div>` : ''}</div>
      <div class="bd-btns">${cur.id === 'pluscrystal' && G.plusCheck ? `<button class="btn plus-go bplus" ${G.plusCheck().ok ? '' : 'disabled'}>プラス進化する（${D.PLUS.cost}個）</button>` : ''}${it && it.cat === 'food' ? `<button class="btn ghost qs">${s.foodSel === cur.id ? '★ クイック設定中' : 'クイック設定 (G)'}</button><button class="btn use">使う</button>` : ''}${w ? (s.weapon === cur.id ? '<button class="btn" disabled>装備中</button>' : '<button class="btn eq">装備する</button>') : ''}</div>`;
    }
    el.querySelector('.bag-wrap').innerHTML = `<div class="bag-top"><div class="bag-tabs">${tabs.map(t => `<button class="${t[0] === tab ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div><div class="bag-coin">🪙 ${fmt(s.coins)}</div></div>
      <div class="bag-body"><div class="bag-grid">${items.map(i => `<button class="card rar${i.rar} ${i.id === sel ? 'sel' : ''}" data-id="${i.id}"><div class="cd-ic">${i.icon}</div><div class="cd-n">${tab === 'weapon' ? 'Lv.1' : fmt(i.n)}</div>${tab === 'weapon' && s.weapon === i.id ? '<i class="cd-eq">✓</i>' : ''}</button>`).join('') || '<div class="bd-empty">空っぽです</div>'}</div><div class="bag-det">${det}</div></div>`;
    $$('.bag-tabs button', el).forEach(b => b.onclick = () => { PS.Audio.sfxPlay('ui'); UI.renderBag(el, b.dataset.t); });
    $$('.card', el).forEach(b => b.onclick = () => { PS.Audio.sfxPlay('ui'); UI.renderBag(el, tab, b.dataset.id); });
    const use = el.querySelector('.use'); if (use) use.onclick = () => { G.eat(sel); UI.renderBag(el, tab, s.inv[sel] ? sel : null); };
    const qs = el.querySelector('.qs'); if (qs) qs.onclick = () => { s.foodSel = sel; PS.Audio.sfxPlay('ui'); UI.renderBag(el, tab, sel); };
    const eq = el.querySelector('.eq'); if (eq) eq.onclick = () => { if (G.equipWeapon(sel)) UI.renderBag(el, tab, sel); };
    const bp = el.querySelector('.bplus'); if (bp) bp.onclick = () => { UI.closeAll(); setTimeout(() => G.plusEvolve(), 80); };
  };

  // ================= クエスト =================
  UI.questMenu = function () { const el = UI.panel('quest', '<div class="qm-wrap"></div>'); UI.renderQuest(el); };
  UI.renderQuest = function (el, sel) {
    const s = G.save, ids = Object.keys(s.quests).sort((a, b) => (D.QUESTS[b].main ? 1 : 0) - (D.QUESTS[a].main ? 1 : 0) || (s.quests[a].st === 'done') - (s.quests[b].st === 'done'));
    sel = sel || s.tracked || ids[0];
    const q = sel && D.QUESTS[sel], st = sel && s.quests[sel];
    el.querySelector('.qm-wrap').innerHTML = `<div class="qm-list"><h2 class="pn-h">クエスト</h2>${ids.map(id => { const Q = D.QUESTS[id], S2 = s.quests[id]; return `<button class="qm-it ${id === sel ? 'on' : ''} ${Q.main ? 'main' : ''} ${S2.st === 'done' ? 'done' : ''}" data-id="${id}"><i class="qstar ${Q.main ? '' : 'side'}">✦</i><span>${Q.title}</span>${S2.st === 'done' ? '<em>完了</em>' : id === s.tracked ? '<em class="tr">追跡中</em>' : ''}</button>`; }).join('')}</div>
      <div class="qm-det">${q ? `<div class="qm-type">${q.main ? 'MAIN QUEST ／ メインクエスト' : 'SUB QUEST ／ サブクエスト'}</div><h3>${q.title}</h3><p>${q.desc}</p><div class="qm-objs">${q.obj.map((o, i) => { const n = o.type === 'collect' ? Math.min(s.inv[o.what] || 0, o.n) : st.prog[i]; const done = st.st === 'done' || n >= (o.n || 1); const hid = o.type === 'dungeon' && o.hidden && !done && W.DUNGEONS[o.id] && W.DUNGEONS[o.id].hidden && !(s.found || {})[o.id]; return `<div class="qo ${done ? 'ok' : ''} ${hid ? 'hid' : ''}"><i>${done ? '✓' : hid ? '?' : '◇'}</i>${hid ? '？？？　<small>' + o.hidden + '</small>' : o.text}${o.n ? ` <b>${n}/${o.n}</b>` : ''}</div>`; }).join('')}</div>${st.deadline && st.st !== 'done' ? `<div class="qm-lim">⏳ 正直者の誓い：残り ${UI.mmss(st.deadline - s.play)}</div>` : ''}
        <div class="qm-rw">報酬：🪙 ${fmt(G.coinGain && (q.reward || {}).coins ? G.coinGain(q.reward.coins * G.rewardMul()) : ((q.reward || {}).coins || 0))}　${(q.reward || {}).exp ? '経験値 ' + fmt(q.reward.exp) : ''} ${((q.reward || {}).items || []).map(([k, n]) => D.ITEMS[k].icon + D.ITEMS[k].name + '×' + n).join(' ')}</div>
        ${st.st !== 'done' ? `<button class="btn trk">${s.tracked === sel ? '追跡中' : '追跡する'}</button>` : ''}` : '<p>クエストはありません</p>'}</div>`;
    $$('.qm-it', el).forEach(b => b.onclick = () => { PS.Audio.sfxPlay('ui'); UI.renderQuest(el, b.dataset.id); });
    const t = el.querySelector('.trk'); if (t) t.onclick = () => { s.tracked = sel; UI.refreshQuest(); PS.Audio.sfxPlay('ui'); UI.renderQuest(el, sel); };
  };

  // ================= 地図 =================
  UI.openMap = function () {
    if (G.state !== 'play' || UI.dlg) return;
    if (UI.stack.some(s => s.el.classList.contains('map'))) return;
    if (G.scene === 'dungeon') { UI.notify('迷宮の中では地図を開けません', 'info'); return; }
    const el = UI.panel('map', `<canvas class="mp-c"></canvas><div class="mp-legend"><span><i class="lg wp"></i>ワープポイント</span><span><i class="lg dn"></i>迷宮</span>${W.expanded ? '<span><i class="lg dn2"></i>星界の遺跡</span>' : ''}${W.ch3 ? '<span><i class="lg sh3">◆</i>結晶の祭壇</span>' : ''}${G.ch4 && G.ch4.ready ? '<span><i class="lg dn4"></i>ギミックダンジョン</span><span><i class="lg sk4">✚</i>天への階段</span>' : ''}<span><i class="lg st"></i>星の像（村）</span><span><i class="lg qs"></i>クエスト</span></div><div class="mp-side hidden"></div><div class="mp-zoom"><button data-z="1">＋</button><button data-z="-1">－</button></div><div class="mp-hint">ドラッグで移動・ホイールで拡大縮小・ワープポイントを選択してワープ</div>`);
    const cv = el.querySelector('.mp-c'), x = cv.getContext('2d'), p = G.player.pos;
    const st = { cx: p.x, cz: p.z, z: 0.55, drag: null, sel: null };
    const resize = () => { const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; st.dpr = dpr; };
    resize();
    const toS = (wx, wz) => [cv.width / 2 + (wx - st.cx) * st.z * st.dpr, cv.height / 2 + (wz - st.cz) * st.z * st.dpr];
    const toW = (sx, sy) => [st.cx + (sx * st.dpr - cv.width / 2) / (st.z * st.dpr), st.cz + (sy * st.dpr - cv.height / 2) / (st.z * st.dpr)];
    const draw = () => {
      if (!el.isConnected) return;
      const mc = UI.mapCanvas(), dpr = st.dpr;
      x.fillStyle = '#0d2238'; x.fillRect(0, 0, cv.width, cv.height);
      const a = toS(-W.HALF, -W.HALF), b = toS(W.HALF, W.HALF);
      x.imageSmoothingEnabled = true; x.drawImage(mc, a[0], a[1], b[0] - a[0], b[1] - a[1]);
      // 地域名
      x.textAlign = 'center'; x.textBaseline = 'middle';
      for (let k = 0; k < (W.ALL_REG || 5); k++) { const R = W.REG[k], q = toS(R.c[0], R.c[1]); x.font = `700 ${Math.round(18 * dpr * Math.min(1.4, Math.max(0.7, st.z * 1.6)))}px "Zen Kaku Gothic New",sans-serif`; x.lineWidth = 4 * dpr; x.strokeStyle = 'rgba(8,14,34,.7)'; x.strokeText(R.name, q[0], q[1] - 40 * dpr); x.fillStyle = G.save.visited.includes(k) ? '#ffffff' : '#c8d0e0'; x.fillText(R.name, q[0], q[1] - 40 * dpr); }
      const s2 = 9 * dpr;
      for (const v of W.VILLAGES) { const q = toS(v.x, v.z); UI.icStatue(x, q[0], q[1], s2); if (st.z > 0.4) { x.font = `600 ${11 * dpr}px "Zen Kaku Gothic New",sans-serif`; x.fillStyle = '#fff'; x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 3 * dpr; x.strokeText(v.name, q[0], q[1] + 18 * dpr); x.fillText(v.name, q[0], q[1] + 18 * dpr); } }
      for (const d of W.DUNGEONS) { if (!UI.dunVis(d)) continue; const q = toS(d.x, d.z); UI.icDungeon(x, q[0], q[1], s2 * 1.1, G.save.dungeons[d.id], d.ch4 ? 'ch4' : d.ch2); if (st.z > 0.4) { x.font = `600 ${11 * dpr}px "Zen Kaku Gothic New",sans-serif`; x.fillStyle = '#ffe6c0'; x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 3 * dpr; const t = d.name + ' Lv.' + d.lv; x.strokeText(t, q[0], q[1] + 20 * dpr); x.fillText(t, q[0], q[1] + 20 * dpr); } }
      { const q = toS(W.SUMMIT.x, W.SUMMIT.z); x.font = `${20 * dpr}px sans-serif`; x.fillStyle = G.save.final ? '#ffd36a' : '#c890ff'; x.fillText('✧', q[0], q[1]); }
      if (W.expanded) { const q = toS(W.SUMMIT2.x, W.SUMMIT2.z); x.font = `${24 * dpr}px sans-serif`; x.fillStyle = G.save.final2 ? '#ffd36a' : '#7fe0ff'; x.fillText('✦', q[0], q[1]); if (st.z > 0.4) { x.font = `600 ${11 * dpr}px "Zen Kaku Gothic New",sans-serif`; x.fillStyle = '#d8f4ff'; x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 3 * dpr; x.strokeText(W.SUMMIT2.name, q[0], q[1] + 20 * dpr); x.fillText(W.SUMMIT2.name, q[0], q[1] + 20 * dpr); } }
      if (W.ch3) {
        for (const sh of W.SHRINES) { const q = toS(sh.x, sh.z), done = (G.save.guardians || [])[sh.id]; x.font = `${20 * dpr}px sans-serif`; x.fillStyle = done ? '#ffd27a' : sh.color; x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 3 * dpr; x.strokeText('◆', q[0], q[1]); x.fillText('◆', q[0], q[1]); if (st.z > 0.4) { x.font = `600 ${11 * dpr}px "Zen Kaku Gothic New",sans-serif`; x.fillStyle = '#ffe8f8'; x.strokeText(sh.name, q[0], q[1] + 18 * dpr); x.fillText(sh.name, q[0], q[1] + 18 * dpr); } }
        const q = toS(W.SUMMIT3.x, W.SUMMIT3.z); x.font = `${26 * dpr}px sans-serif`; x.fillStyle = G.save.final3 ? '#ffd36a' : '#ff9ef0'; x.fillText('♛', q[0], q[1]); if (st.z > 0.4) { x.font = `600 ${11 * dpr}px "Zen Kaku Gothic New",sans-serif`; x.fillStyle = '#ffe8f8'; x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 3 * dpr; x.strokeText(W.SUMMIT3.name, q[0], q[1] + 22 * dpr); x.fillText(W.SUMMIT3.name, q[0], q[1] + 22 * dpr); }
      }
      if (UI.mapExtra) UI.mapExtra(x, toS, st, dpr);
      for (const f of G.fairyHomes || []) { const q = toS(f.home.x, f.home.z); x.font = `${16 * dpr}px sans-serif`; x.fillStyle = D.SUPPORT[f.id].color; x.fillText(D.SUPPORT[f.id].icon, q[0], q[1]); }
      for (const w of W.WAYPOINTS) { const q = toS(w.x, w.z), on = G.save.waypoints.includes(w.id); UI.icWaypoint(x, q[0], q[1], s2 * (st.sel === w ? 1.5 : 1), on); }
      const tg = G.questTarget(); if (tg && tg.x != null) { const q = toS(tg.x, tg.z); UI.icQuest(x, q[0], q[1] - 16 * dpr, 8 * dpr); }
      const pp = toS(p.x, p.z); x.save(); x.translate(pp[0], pp[1]); x.rotate(Math.PI - G.player.yaw); x.fillStyle = '#ffd27a'; x.strokeStyle = '#0b1530'; x.lineWidth = 2 * dpr; x.beginPath(); x.moveTo(0, -12 * dpr); x.lineTo(8 * dpr, 9 * dpr); x.lineTo(0, 4 * dpr); x.lineTo(-8 * dpr, 9 * dpr); x.closePath(); x.fill(); x.stroke(); x.restore();
      requestAnimationFrame(draw);
    };
    draw();
    const side = el.querySelector('.mp-side');
    const select = (w) => {
      st.sel = w; if (!w) { side.classList.add('hidden'); return; }
      const on = G.save.waypoints.includes(w.id) || w.id === 'w_start';
      side.classList.remove('hidden');
      side.innerHTML = `<div class="ms-t">WARP POINT</div><h3>${w.name}</h3><p>${on ? '旅人が転送できる場所。星の力を宿している。' : 'まだ解放されていない。近づいて解放しよう。'}</p>${on ? '<button class="btn go">ワープ</button>' : '<button class="btn" disabled>未解放</button>'}`;
      const go = side.querySelector('.go'); if (go) go.onclick = () => { UI.closeAll(); G.teleport(w.id); };
    };
    cv.addEventListener('pointerdown', (e) => { st.drag = { x: e.clientX, y: e.clientY, cx: st.cx, cz: st.cz, moved: false }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', (e) => { if (!st.drag) return; const dx = e.clientX - st.drag.x, dy = e.clientY - st.drag.y; if (Math.hypot(dx, dy) > 4) st.drag.moved = true; st.cx = st.drag.cx - dx / st.z; st.cz = st.drag.cz - dy / st.z; });
    cv.addEventListener('pointerup', (e) => {
      const d = st.drag; st.drag = null; if (!d || d.moved) return;
      const r = cv.getBoundingClientRect(), [wx, wz] = toW(e.clientX - r.left, e.clientY - r.top);
      let best = null, bd = 18 / st.z; for (const w of W.WAYPOINTS) { const dd = Math.hypot(w.x - wx, w.z - wz); if (dd < bd) { bd = dd; best = w; } }
      select(best);
    });
    cv.addEventListener('wheel', (e) => { e.preventDefault(); st.z = PS.clamp(st.z * (e.deltaY > 0 ? 0.85 : 1.18), 0.18, 3); }, { passive: false });
    $$('.mp-zoom button', el).forEach(b => b.onclick = () => { st.z = PS.clamp(st.z * (+b.dataset.z > 0 ? 1.3 : 0.77), 0.18, 3); });
    window.addEventListener('resize', resize);
  };

  // ================= ショップ =================
  UI.openShop = function (npc) {
    const el = UI.panel('shop', '<div class="sh-wrap"></div>');
    const render = () => {
      const s = G.save;
      el.querySelector('.sh-wrap').innerHTML = `<h2 class="pn-h">${npc.name}の店</h2><div class="bag-coin">🪙 ${fmt(s.coins)}</div><div class="sh-list">${npc.shop.map(id => { const w = D.W[id], it = D.ITEMS[id], price = w ? w.price : (it.price || (it.sell || 10) * 4), owned = w && s.weapons.includes(id), ng = w && !D.PERS[s.pers].weapons.includes(w.type); return `<div class="sh-it rar${w ? w.rar : it.rar}"><span class="sh-ic">${w ? UI.wIcon(w.type) : it.icon}</span><div class="sh-b"><b>${w ? w.name : it.name}</b><small>${w ? '攻撃力 +' + fmt(w.atk) + (ng ? '（' + D.PERS[s.pers].name + 'は装備不可）' : '') : it.desc}</small></div><button class="btn sm" data-id="${id}" ${owned || s.coins < price ? 'disabled' : ''}>${owned ? '所持済み' : '🪙 ' + fmt(price)}</button></div>`; }).join('')}</div>`;
      $$('.sh-it button', el).forEach(b => b.onclick = () => { const id = b.dataset.id, w = D.W[id], it = D.ITEMS[id], price = w ? w.price : (it.price || (it.sell || 10) * 4); if (s.coins < price) return; s.coins -= price; if (w) G.addWeapon(id); else G.addItem(id, 1); PS.Audio.sfxPlay('coin'); render(); });
    };
    render();
  };
  UI.openSell = function (npc) {
    const el = UI.panel('shop', '<div class="sh-wrap"></div>');
    const render = () => {
      const s = G.save, ids = Object.keys(s.inv).filter(k => D.ITEMS[k].cat !== 'key' && D.ITEMS[k].sell !== 0 && s.inv[k] > 0);
      el.querySelector('.sh-wrap').innerHTML = `<h2 class="pn-h">素材を売る</h2><div class="bag-coin">🪙 ${fmt(s.coins)}</div><div class="sh-list">${ids.map(id => { const it = D.ITEMS[id]; return `<div class="sh-it rar${it.rar}"><span class="sh-ic">${it.icon}</span><div class="sh-b"><b>${it.name} ×${s.inv[id]}</b><small>1個 🪙${it.sell}</small></div><button class="btn sm" data-id="${id}">1個売る</button><button class="btn sm ghost" data-all="${id}">全部</button></div>`; }).join('') || '<p>売れるものがありません</p>'}</div>`;
      $$('[data-id]', el).forEach(b => b.onclick = () => { const id = b.dataset.id; s.inv[id]--; s.coins += D.ITEMS[id].sell; if (!s.inv[id]) delete s.inv[id]; PS.Audio.sfxPlay('coin'); render(); });
      $$('[data-all]', el).forEach(b => b.onclick = () => { const id = b.dataset.all; s.coins += D.ITEMS[id].sell * s.inv[id]; delete s.inv[id]; PS.Audio.sfxPlay('coin'); render(); });
    };
    render();
  };

  // ================= 設定 =================
  UI.settingsMenu = function (tab) { const el = UI.panel('settings', '<div class="set-wrap"></div>', () => { PS.saveSettings(); }); UI.renderSettings(el, tab || 'gfx'); };
  UI.SETS = {
    gfx: [
      ['preset', '画質プリセット', 'seg', [['low', '低'], ['medium', '中'], ['high', '高'], ['ultra', '最高'], ['custom', 'カスタム']]],
      ['renderDist', '描画距離', 'range', [4, 16, 1], v => v + ' チャンク（約' + v * 96 + 'm）'],
      ['shadows', '影の品質', 'seg', [[0, 'オフ'], [1, '低'], [2, '中'], [3, '高'], [4, '最高']]],
      ['softShadow', 'ソフトシャドウ', 'toggle'],
      ['clouds', '雲', 'seg', [[0, 'オフ'], [1, '高速'], [2, '綺麗']]],
      ['fancy', 'グラフィックス', 'seg', [[false, '処理優先'], [true, '描画優先']]],
      ['grass', '草の密度', 'seg', [[0, 'オフ'], [1, '低'], [2, '中'], [3, '高'], [4, 'ウルトラ']]],
      ['trees', '木々の密度', 'range', [0.3, 1, 0.05], v => Math.round(v * 100) + '%'],
      ['particles', 'パーティクル', 'seg', [[0, '最小'], [1, '減少'], [2, 'すべて']]],
      ['aa', 'アンチエイリアス', 'seg', [['off', 'オフ'], ['fxaa', 'FXAA'], ['msaa', 'MSAA x4']]],
      ['bloom', 'ブルーム（光のにじみ）', 'toggle'],
      ['outline', 'キャラクターの輪郭線', 'toggle'],
      ['renderScale', 'レンダリング解像度', 'range', [0.4, 1, 0.05], v => Math.round(v * 100) + '%'],
      ['pixelRatio', '最大ピクセル密度', 'seg', [[1, '1x'], [1.5, '1.5x'], [2, '2x']]],
      ['maxFps', '最大フレームレート', 'seg', [[30, '30'], [60, '60'], [0, '無制限']]],
      ['fov', '視野角 (FOV)', 'range', [50, 100, 1], v => v + '°'],
      ['brightness', '明るさ', 'range', [0.6, 1.6, 0.05], v => Math.round(v * 100) + '%']
    ],
    ctl: [['sens', 'マウス感度', 'range', [0.2, 3, 0.05], v => v.toFixed(2)], ['invertY', '上下反転', 'toggle'], ['shake', '画面の揺れ', 'toggle'], ['uiScale', 'UIの大きさ', 'range', [0.7, 1.3, 0.05], v => Math.round(v * 100) + '%']],
    snd: [['volMaster', '全体の音量', 'range', [0, 1, 0.05], v => Math.round(v * 100)], ['volBgm', 'BGM', 'range', [0, 1, 0.05], v => Math.round(v * 100)], ['volSfx', '効果音', 'range', [0, 1, 0.05], v => Math.round(v * 100)]],
    etc: [['dmgNumbers', 'ダメージ数値を表示', 'toggle'], ['showFps', 'FPSを表示', 'toggle']]
  };
  UI.renderSettings = function (el, tab) {
    const S = PS.Settings, tabs = [['gfx', 'グラフィック'], ['ctl', '操作'], ['sw', '人格切り替え'], ['snd', 'サウンド'], ['etc', 'その他']];
    const row = (o) => {
      const [k, label, type, opt, f] = o, v = S[k];
      let ctl = '';
      if (type === 'seg') ctl = `<div class="seg">${opt.map(([val, t]) => `<button class="${String(v) === String(val) ? 'on' : ''}" data-k="${k}" data-v='${JSON.stringify(val)}'>${t}</button>`).join('')}</div>`;
      else if (type === 'toggle') ctl = `<div class="seg">${[[false, 'オフ'], [true, 'オン']].map(([val, t]) => `<button class="${!!v === val ? 'on' : ''}" data-k="${k}" data-v='${val}'>${t}</button>`).join('')}</div>`;
      else ctl = `<div class="rng"><input type="range" min="${opt[0]}" max="${opt[1]}" step="${opt[2]}" value="${v}" data-k="${k}"><span>${f(v)}</span></div>`;
      return `<div class="set-row"><div class="set-l">${label}</div>${ctl}</div>`;
    };
    el.querySelector('.set-wrap').innerHTML = `<div class="set-tabs"><h2 class="pn-h">設定</h2>${tabs.map(t => `<button class="${t[0] === tab ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div><div class="set-body">${tab === 'sw' ? (UI.switchSettingsHTML ? UI.switchSettingsHTML() : '') : UI.SETS[tab].map(row).join('')}${tab === 'etc' ? `<div class="set-row"><div class="set-l">データ</div><div class="seg"><button class="danger" data-act="reset">設定を初期化</button><button class="danger" data-act="wipe">セーブデータを削除</button></div></div><div class="set-row"><div class="set-l">ライセンス</div><div class="seg"><button data-act="lic">ライセンス表示</button></div></div>` : ''}${tab === 'gfx' ? '<div class="set-note">低スペックの端末では「低」または「中」がおすすめです。描画距離・影・草の密度は特に負荷に影響します。</div>' : ''}</div>`;
    $$('.set-tabs button', el).forEach(b => b.onclick = () => { PS.Audio.sfxPlay('ui'); UI.renderSettings(el, b.dataset.t); });
    if (tab === 'sw' && UI.bindSwitchSettings) UI.bindSwitchSettings(el);
    $$('.seg button[data-k]', el).forEach(b => b.onclick = () => {
      const k = b.dataset.k, v = JSON.parse(b.dataset.v); PS.Audio.sfxPlay('ui');
      if (k === 'preset') { if (v !== 'custom') PS.applyPreset(v); else S.preset = 'custom'; }
      else { S[k] = v; if (tab === 'gfx') S.preset = 'custom'; }
      UI.afterSetting(k); UI.renderSettings(el, tab);
    });
    $$('input[type=range]', el).forEach(r => { r.oninput = () => { const k = r.dataset.k, v = parseFloat(r.value); S[k] = v; if (tab === 'gfx') S.preset = 'custom'; r.nextElementSibling.textContent = UI.SETS[tab].find(o => o[0] === k)[4](v); UI.afterSetting(k); }; r.onchange = () => { if (tab === 'gfx') { const seg = el.querySelector('[data-k=preset].on'); if (seg) { seg.classList.remove('on'); el.querySelector('[data-k=preset][data-v=\'"custom"\']').classList.add('on'); } } }; });
    $$('[data-act]', el).forEach(b => b.onclick = () => {
      const a = b.dataset.act;
      if (a === 'reset') UI.confirm('設定を初期化しますか？', () => { PS.resetSettings(); UI.afterSetting('all'); UI.renderSettings(el, tab); });
      if (a === 'wipe') UI.confirm('セーブデータを削除しますか？<br><small>この操作は取り消せません</small>', () => { G.deleteSave(); G.save = null; location.reload(); });
      if (a === 'lic') UI.license();
    });
  };
  UI.afterSetting = function (k) { PS.saveSettings(); PS.Audio.applyVol(); UI.applyUIScale(); PS.R._rtKey = null; PS.R.resize(); };

  // ================= ライセンス =================
  UI.LICENSE_HTML = `<h2 class="pn-h">ライセンス・権利表記</h2><div class="lic">
    <h3>パーソナリティースターズ（Personality Stars）</h3><p>© 2026 YUKI GROUP. All Rights Reserved.<br>本ゲームのプログラム・グラフィック・音楽・シナリオの著作権は YUKI GROUP に帰属します。無断での複製・再配布・改変を禁じます。</p>
    <p>本作品はフィクションです。実在の人物・団体・事件等とは一切関係ありません。</p>
    <h3>バージョンについて</h3><p>本作は正式リリース版（${D.VERSION_LABEL}）です。GitHub Pages で公開しています。今後、段階的にストアでのアプリ版・パソコン用ソフト版の展開を予定しています。内容は予告なくアップデートされる場合があります。</p><h3>利用規約</h3><p>本作は個人で楽しむ目的に限り、無料でプレイできます。ゲームの改変・再配布・他のサイトへの転載や埋め込み・営利目的での利用は禁止します。プレイ中の不具合やセーブデータの消失について、YUKI GROUP は責任を負いかねます。セーブデータはお使いのブラウザ（端末）の中にだけ保存されます。</p>
    <h3>使用技術</h3><p>描画エンジン・モデル・効果音・BGMはすべて本作のために自作したものです（WebGL2 / Web Audio API）。外部のゲームエンジン・画像・音声素材は使用していません。</p>
    <h3>フォント</h3><p>Zen Kaku Gothic New / Rajdhani / Shippori Mincho / Cinzel — SIL Open Font License 1.1（Google Fonts 経由で配信）</p>
    <h3>動作環境</h3><p>WebGL2 対応ブラウザ（Chrome / Edge / Firefox / Safari の最新版を推奨）</p></div>`;
  UI.license = function () { const el = UI.panel('license', UI.LICENSE_HTML); return el; };

  // ================= v1.0.5：仲間・妖精・制限時間・お知らせ =================
  UI.dunVis = (d) => !d.hidden || !!(G.save && ((G.save.found || {})[d.id] || G.save.dungeons[d.id]));
  UI.mmss = (sec) => { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); };
  // HUD：仲間のHPと妖精
  UI.refreshParty = function () {
    const el = $('.party-strip'); if (!el || !G.save) return;
    const ps = G.partySave();
    let html = (G.party || []).map((c, i) => `<div class="pt-c" data-i="${i}" style="--cc:${c.def.color}"><div class="pt-ic">${c.def.icon}</div><div class="pt-b"><div class="pt-n">${c.def.name}<small>${c.def.title}</small></div><div class="pt-hp"><i></i></div></div><span class="pt-dn"></span></div>`).join('');
    for (const f of G.fairies || []) { const S = D.SUPPORT[f.id], cp = D.COMPAT[D.compatOf(f.id, G.save.pers)]; html += `<div class="pt-f" style="--cc:${S.color}"><span>${S.icon}</span>${S.name}<small>${f.id === 'lumi' ? 'R：回復' : `<b style="color:${cp.c}">${cp.name}</b> ${D.supEffect(f.id, G.save.pers)}`}</small></div>`; }
    el.innerHTML = html; UI._ptEls = $$('.pt-c', el);
    const sup = $('.qsup'), fz = G.fairies || [], main = fz.find(f => f.id === 'lumi') || fz[0];
    if (sup) { sup.classList.toggle('hidden', !main); if (main) { sup.querySelector('.qs-ic').textContent = D.SUPPORT[main.id].icon; sup.classList.toggle('passive', main.id !== 'lumi'); sup.style.setProperty('--sc', D.SUPPORT[main.id].color); } }
  };
  UI.updateParty = function () {
    const els = UI._ptEls || [];
    if (els.length !== (G.party || []).length) { UI.refreshParty(); return; }
    G.party.forEach((c, i) => {
      const e = els[i]; e.querySelector('.pt-hp i').style.width = (c.hp / c.maxHp * 100) + '%';
      e.classList.toggle('down', c.down); e.classList.toggle('low', !c.down && c.hp < c.maxHp * 0.3); e.querySelector('.pt-dn').textContent = c.down ? Math.ceil(c.downT) + 's' : '';
    });
    const sup = $('.qsup');
    const lumiOn = (G.fairies || []).some(f => f.id === 'lumi');
    if (sup && lumiOn) {
      const cd = G.supportCd, c = sup.querySelector('.sk-cd'), n = sup.querySelector('.qs-n');
      if (cd > 0) { c.style.background = `conic-gradient(rgba(6,10,24,.78) ${cd / 10 * 360}deg, transparent 0)`; n.textContent = Math.ceil(cd); } else { c.style.background = 'none'; n.textContent = ''; }
      sup.classList.toggle('ready', !(cd > 0) && G.player.hp < G.pstat.hp);
    } else if (sup && (G.fairies || []).length) { const f0 = G.fairies[0]; sup.querySelector('.qs-n').textContent = f0.id === 'fuwarin' ? 'x' + G.baseMul() : ''; }
  };
  // 吹き出し（仲間・妖精のセリフ）
  UI._bubs = [];
  UI.bubble = function (obj, text, dur, cls) {
    if (!obj || !text) return; const lay = $('.bubbles'); if (!lay) return;
    const old = UI._bubs.find(b => b.obj === obj && b.cls === (cls || '')); if (old) { old.el.remove(); UI._bubs.splice(UI._bubs.indexOf(old), 1); }
    const nm = obj.def ? obj.def.name : '';
    const el = h(`<div class="bub ${cls || ''}" style="--bc:${(obj.def && obj.def.color) || '#fff'}">${cls ? '' : `<b>${nm}</b>`}<span></span></div>`); el.querySelector('span').textContent = text;
    lay.appendChild(el); UI._bubs.push({ obj, el, t: 0, dur: dur || 3, cls: cls || '' });
    while (UI._bubs.length > 5) { const b = UI._bubs.shift(); b.el.remove(); }
  };
  UI.skillCall = function (comp, name) { UI.bubble(comp, '「' + name + '」', 1.6, 'skill'); };
  UI.dmgText = function (x, y, z, text, color) { UI.dmg(x, y, z, text, color || '#ffd27a', true, 'txt'); };
  UI.updateBubbles = function (dt) {
    const o = UI._bo || (UI._bo = {});
    for (let i = UI._bubs.length - 1; i >= 0; i--) {
      const b = UI._bubs[i]; b.t += dt;
      if (b.t > b.dur || (b.obj.present === false)) { b.el.classList.add('out'); if (b.t > b.dur + 0.3 || b.obj.present === false) { b.el.remove(); UI._bubs.splice(i, 1); } continue; }
      const P = b.obj.pos, s2 = PS.R.toScreen(P.x, P.y + (b.obj.height || 1.8) + (b.cls ? 0.2 : 0.55), P.z, o);
      if (!s2.vis) { b.el.style.opacity = 0; continue; }
      b.el.style.opacity = ''; b.el.style.transform = `translate(${s2.x}px,${s2.y}px) translate(-50%,-100%) translateY(${b.cls ? -b.t * 14 : 0}px)`;
    }
  };
  // 正直者の制限時間
  UI.updateTimer = function () {
    const el = $('.htimer'), s = G.save; if (!el || !s) return;
    let left = null, label = '';
    if (G.scene === 'dungeon' && G.dunDeadline) { left = G.dunDeadline - s.play; label = G.dun.def.name; }
    else if (D.PERS[s.pers].honest) {
      for (const id in s.quests) { const st = s.quests[id]; if (st.st !== 'active' || !st.deadline) continue; const l = st.deadline - s.play; if (left == null || id === s.tracked || l < left) { left = l; label = D.QUESTS[id].title; if (id === s.tracked) break; } }
    }
    UI.hud.classList.toggle('has-timer', left != null);
    if (left == null) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden'); el.classList.toggle('warn', left < 60);
    const t = UI.mmss(left); if (el._t !== t) { el._t = t; el.querySelector('b').textContent = t; el.querySelector('small').textContent = '制限時間　' + label; }
  };
  // 遺跡の中だけの能力
  UI.updateAbil = function () {
    const el = $('.abil-row'); if (!el) return;
    const ab = G.scene === 'dungeon' && G.dun && G.dun.abil || {}, list = [];
    if (ab.wing) list.push('<span class="ab"><i>🪶</i>風切りの羽<small>空中でジャンプ → 飛行</small></span>');
    if (ab.jump) list.push('<span class="ab"><i>👢</i>跳躍の靴<small>ジャンプ力アップ</small></span>');
    const html = list.join(''); if (html !== el._h) { el._h = html; el.innerHTML = html; } el.classList.toggle('hidden', !list.length);
  };

  // ================= 仲間メニュー =================
  UI.partyMenu = function (tab, sel) { const el = UI.panel('party', '<div class="pa-wrap"></div>'); UI.renderParty(el, tab || 'comp', sel); };
  UI.compWhere = function (c) { const v = (W.ALL_VILLAGES_RAW || W.VILLAGES)[c.v]; return v ? v.name : '？？？'; };
  UI.renderParty = function (el, tab, sel) {
    const s = G.save, ps = G.partySave(), ch2 = W.expanded;
    const tabs = [['comp', '旅の仲間'], ['sup', 'サポートキャラ']];
    let list = '', det = '';
    if (tab === 'comp') {
      sel = sel || ps.list[0] || D.COMP_ORDER[0];
      list = D.COMP_ORDER.map(id => {
        const c = D.COMPANIONS[id], got = ps.list.includes(id), lock = c.v >= 5 && !ch2, act = ps.active.includes(id);
        return `<button class="pa-it ${id === sel ? 'on' : ''} ${got ? '' : 'ng'} ${lock ? 'lock' : ''}" data-id="${id}" style="--cc:${c.color}"><span class="pa-ic">${lock ? '？' : c.icon}</span><span class="pa-nm">${lock ? '？？？' : c.name}<small>${lock ? '第二章で出会える' : c.title}</small></span>${act ? '<em>同行中</em>' : got || lock ? '' : '<em class="ng">未加入</em>'}</button>`;
      }).join('');
      const c = D.COMPANIONS[sel], got = ps.list.includes(sel), lock = c.v >= 5 && !ch2, act = ps.active.includes(sel);
      if (lock) det = `<div class="pa-lock"><div class="big">？</div><b>まだ見ぬ仲間</b><p>第二章で、新たな大地のどこかで出会えるかもしれない……</p></div>`;
      else {
        const st = G.compStats(sel), sk = D.compSkills(sel), live = (G.party || []).find(q => q.id === sel);
        const wt = { scythe: '大鎌', axe: '斧', sword: '剣', staff: '杖', bow: '弓', hammer: 'ハンマー', club: '棍棒', lute: '竪琴', orb: '星詠みの宝珠' }[c.wtype] || c.wtype;
        det = `<div class="pa-hero" style="--cc:${c.color}"><div class="pa-emb">${c.icon}</div><div><div class="pa-en">${c.en}</div><div class="pa-name">${c.title}　${c.name}<small>${c.gender === 'f' ? '♀' : '♂'}</small></div><div class="pa-q">「${c.quote}」</div></div></div>
          <p class="pa-desc">${c.desc}</p>
          ${got ? `<div class="pa-stats"><div><span>HP</span><b>${fmt(st.hp)}</b></div><div><span>攻撃力</span><b>${fmt(st.atk)}</b></div><div><span>防御力</span><b>${fmt(st.def)}</b></div><div><span>移動速度</span><b>x${st.spd}</b></div><div><span>武器</span><b>${wt}</b></div><div><span>戦い方</span><b>${c.style === 'melee' ? '近接' : '遠距離'}・${D.ELEM[c.el || 'phys'].name}</b></div></div>
          ${live ? `<div class="pa-live"><span>現在のHP</span><div class="pt-hp"><i style="width:${live.hp / live.maxHp * 100}%"></i></div><b>${live.down ? '戦闘不能（' + Math.ceil(live.downT) + '秒）' : fmt(live.hp) + ' / ' + fmt(live.maxHp)}</b></div>` : ''}
          ${c.atkPer2 ? `<div class="ch-note">Lv.2アップごとに攻撃力 +${c.atkPer2}（現在 +${fmt(Math.floor(s.level / 2) * c.atkPer2)}）</div>` : ''}` : `<div class="pa-cond"><b>出会える場所：${UI.compWhere(c)}</b><span>${c.condText}</span></div>`}
          <div class="pe-md"><div><h4>得意</h4><ul>${c.merit.map(m => '<li>' + m + '</li>').join('')}</ul></div><div><h4>苦手</h4><ul>${c.demerit.map(m => '<li>' + m + '</li>').join('')}</ul></div></div>
          <h4 class="pa-h">スキル <small>Lv.10ごとに習得</small></h4><div class="pa-sk">${sk.sort((a, b) => a.lv - b.lv).map(k => `<div class="pa-sr ${got && k.lv <= s.level ? '' : 'lock'}" style="--sc:${D.ELEM[k.el || c.el || 'phys'].c}"><span class="pa-lv">Lv.${k.lv}</span><b>${k.name}</b><small>${k.desc}</small></div>`).join('')}</div>
          <div class="pa-btns">${got ? (act ? '<button class="btn ghost off">同行をやめる</button>' : `<button class="btn on" ${ps.active.length >= D.PARTY_MAX ? 'disabled' : ''}>同行させる</button>${ps.active.length >= D.PARTY_MAX ? '<small>同行できるのは2人までです</small>' : ''}`) : '<button class="btn" disabled>まだ仲間になっていない</button>'}</div>`;
      }
    } else {
      sel = sel && D.SUPPORT[sel] ? sel : (ps.supports[0] || D.SUPPORT_ORDER[0]);
      list = D.SUPPORT_ORDER.map(id => { const S = D.SUPPORT[id], got = ps.sups.includes(id); return `<button class="pa-it ${id === sel ? 'on' : ''} ${got ? '' : 'ng'}" data-id="${id}" style="--cc:${S.color}"><span class="pa-ic">${S.icon}</span><span class="pa-nm">${S.name}<small>${S.en}</small></span>${ps.supports.includes(id) ? '<em>おとも中</em>' : got ? '' : '<em class="ng">未加入</em>'}</button>`; }).join('');
      const S = D.SUPPORT[sel], got = ps.sups.includes(sel), cp = D.compatOf(sel, s.pers), C2 = D.COMPAT[cp];
      const P = (k) => D.PERS[k] ? D.PERS[k].name : k;
      const grp = { good: [], normal: [], bad: [] }; for (const k of D.PERS_ORDER) grp[D.compatOf(sel, k)].push(k);
      const comp = `<div class="pa-compat"><div class="cp-me">あなた（${D.PERS[s.pers].name}）との相性：<b style="color:${C2.c}">${C2.name}</b>　${D.supEffect(sel, s.pers)}</div>
          ${['good', 'normal', 'bad'].filter(g => grp[g].length).map(g => `<div class="cp-row"><span class="${g === 'good' ? 'g' : g === 'bad' ? 'b' : ''}">${D.COMPAT[g].name}<small>${(S.eff && S.eff[g]) || ''}</small></span>${grp[g].length === D.PERS_ORDER.length ? '<i>すべての人格</i>' : grp[g].map(k => `<i class="${k === s.pers ? 'me' : ''}">${P(k)}</i>`).join('')}</div>`).join('')}</div>`;
      const SL = D.SUP_LINES[sel] || D.LUMI_LINES, sample = (cp === 'bad' && SL.bad ? SL.bad : cp === 'normal' && SL.normal ? SL.normal : SL.good || SL.idle || SL.meet)[0];
      det = `<div class="pa-hero fairy" style="--cc:${S.color}"><div class="pa-emb">${S.icon}</div><div><div class="pa-en">SUPPORT</div><div class="pa-name">${S.name}</div><div class="pa-q">${sample.replace(/\{name\}/g, s.name)}</div></div></div>
        <p class="pa-desc">${S.desc}</p><div class="pa-eff"><b>効果</b>${S.effect}</div>${comp}
        ${got ? '' : `<div class="pa-cond"><b>出会える場所：${S.where}</b><span>近くでふわふわ浮かんでいる妖精に話しかけよう</span></div>`}
        <div class="pa-btns">${got ? (ps.supports.includes(sel) ? '<button class="btn ghost soff">おともをやめる</button>' : `<button class="btn son" ${ps.supports.length >= D.SUPPORT_MAX ? 'disabled' : ''}>おともにする</button><small>${ps.supports.length >= D.SUPPORT_MAX ? 'おともは2体までです。どちらかを外してください' : 'サポートキャラは2体まで連れて行けます'}</small>`) : '<button class="btn" disabled>まだ出会っていない</button>'}</div>`;
    }
    el.querySelector('.pa-wrap').innerHTML = `<div class="pa-list"><h2 class="pn-h">仲間</h2><div class="pa-tabs tabs">${tabs.map(t => `<button class="${t[0] === tab ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div><div class="pa-items">${list}</div>
      <div class="pa-foot">${tab === 'comp' ? `同行中 ${ps.active.length} / ${D.PARTY_MAX}` : `おとも ${ps.supports.length ? ps.supports.map(id => D.SUPPORT[id].name).join('・') : 'なし'}（${ps.supports.length}/${D.SUPPORT_MAX}）`}</div></div><div class="pa-det">${det}</div>`;
    $$('.pa-tabs button', el).forEach(b => b.onclick = () => { PS.Audio.sfxPlay('ui'); UI.renderParty(el, b.dataset.t); });
    $$('.pa-it', el).forEach(b => b.onclick = () => { PS.Audio.sfxPlay('ui'); UI.renderParty(el, tab, b.dataset.id); });
    const on = el.querySelector('.pa-btns .on'), off = el.querySelector('.pa-btns .off'), son = el.querySelector('.son'), soff = el.querySelector('.soff');
    if (on) on.onclick = () => { if (G.setActive(sel, true)) { PS.Audio.sfxPlay('quest', 0.5); const c = G.party.find(q => q.id === sel); if (c) setTimeout(() => UI.bubble(c, rndLine(D.COMPANIONS[sel]), 2.6), 200); } G.writeSave(true); UI.renderParty(el, tab, sel); };
    if (off) off.onclick = () => { G.setActive(sel, false); PS.Audio.sfxPlay('ui'); G.writeSave(true); UI.renderParty(el, tab, sel); };
    if (son) son.onclick = () => { if (G.setSupport(sel, true)) { PS.Audio.sfxPlay('quest', 0.5); G.writeSave(true); const f = G.fairies.find(q => q.id === sel); setTimeout(() => G.supportSay('region', true, f), 300); } UI.renderParty(el, tab, sel); };
    if (soff) soff.onclick = () => { G.setSupport(sel, false); PS.Audio.sfxPlay('ui'); G.writeSave(true); UI.renderParty(el, tab, sel); };
  };
  const rndLine = (c) => c.quote;

  // ================= お知らせ =================
  UI.NEWS_KEY = 'ps_news_seen';
  UI.newsUnread = function () { try { return localStorage.getItem(UI.NEWS_KEY) !== D.NEWS[0].ver; } catch (e) { return false; } };
  UI.newsHTML = function () {
    return `<div class="nw-head"><h2 class="pn-h">お知らせ</h2><div class="nw-beta"><b>${D.VERSION_LABEL}</b>正式リリース版</div></div><div class="nw-list">${D.NEWS.map((n, i) => `<article class="nw-art ${i ? '' : 'latest'}"><div class="nw-top"><span class="nw-tag">${n.tag}</span><span class="nw-ver">${n.ver}</span><span class="nw-date">${n.date}</span></div><h3>${n.title}</h3><div class="nw-items">${n.items.map(it => `<div class="nw-it"><span class="nw-ic">${it[0]}</span><div><b>${it[1]}</b><p>${it[2]}</p></div></div>`).join('')}</div></article>`).join('')}</div><div class="nw-foot">バージョンが上がるたびに、ここでお知らせします。</div>`;
  };
  UI.newsModal = function () {
    try { localStorage.setItem(UI.NEWS_KEY, D.NEWS[0].ver); } catch (e) { }
    if (G.state === 'play') return UI.panel('news', UI.newsHTML());
    const el = h(`<div class="modal news-modal"><div class="modal-box news">${UI.newsHTML()}<button class="btn yes">閉じる</button></div></div>`);
    $('#ui').appendChild(el); el.querySelector('.btn').onclick = () => el.remove(); el.addEventListener('click', (e) => { if (e.target === el) el.remove(); });
    return el;
  };

  // ================= v1.0.10：超聴者・予言者 =================
  // 超聴者：攻撃・飛び道具・接近の方向を画面の縁に表示（宝箱の「音」も）
  UI._sensePool = [];
  UI.updateSense = function () {
    const lay = $('.sense'); if (!lay) return;
    const s = G.save, on = s && (G.pk ? G.pk() === 'hearer' && !G.plusSideOn('hearer') : D.PERS[s.pers].hearer) && G.state === 'play' && !G.uiOpen;
    const marks = [];
    if (on) {
      const P = G.player.pos;
      for (const e of G.enemies) {
        if (e.dead || e.def0.static) continue; const d = Math.hypot(e.x - P.x, e.z - P.z); if (d > 46) continue;
        if (e.state === 'windup' || (e.state === 'act' && e.actd && e.actd.kind === 'charge')) marks.push({ x: e.x, z: e.z, k: 'atk', d });
        else if (e.aggro && d < 24) marks.push({ x: e.x, z: e.z, k: 'near', d });
      }
      for (const pr of G.projs) { if (pr.owner !== 'e') continue; const d = Math.hypot(pr.x - P.x, pr.z - P.z); if (d < 36 && d > 1.2) marks.push({ x: pr.x, z: pr.z, k: 'proj', d }); }
      for (const hz of G.hz) { if (hz.owner !== 'e' || hz.t > (hz.delay || 0)) continue; const d = Math.hypot(hz.x - P.x, hz.z - P.z); if (d < 34 && d > (hz.r || 3) + 0.5) marks.push({ x: hz.x, z: hz.z, k: 'atk', d }); }
      if (G.scene === 'world') {
        for (const c of W.chests) { if (s.chests[c.id]) continue; const d = Math.hypot(c.x - P.x, c.z - P.z); if (d < 70 && d > 6) marks.push({ x: c.x, z: c.z, k: 'snd', d }); }
        for (const d0 of W.DUNGEONS) if (d0.hidden && !(s.found || {})[d0.id]) { const d = Math.hypot(d0.x - P.x, d0.z - P.z); if (d < 160) marks.push({ x: d0.x, z: d0.z, k: 'hid', d }); }
      }
    }
    marks.sort((a, b) => (a.k === 'atk' || a.k === 'proj' ? 0 : 1) - (b.k === 'atk' || b.k === 'proj' ? 0 : 1) || a.d - b.d); marks.length = Math.min(marks.length, 10);
    while (UI._sensePool.length < marks.length) { const el = h('<div class="sn"><i></i><b></b></div>'); lay.appendChild(el); UI._sensePool.push(el); }
    if (!marks.length) { for (const el of UI._sensePool) el.style.display = 'none'; return; }
    const P = G.player.pos, o1 = UI._sp1 || (UI._sp1 = {}), o2 = UI._sp2 || (UI._sp2 = {}), Wd = window.innerWidth, Hd = window.innerHeight, cx = Wd / 2, cy = Hd / 2, m = PS.isMobile ? 64 : 48;
    const ps = PS.R.toScreen(P.x, P.y + 1, P.z, o1); const bx = ps.x, by = ps.y;
    UI._sensePool.forEach((el, i) => {
      const mk = marks[i]; if (!mk) { el.style.display = 'none'; return; }
      const dx = mk.x - P.x, dz = mk.z - P.z, L = Math.hypot(dx, dz) || 1, q = PS.R.toScreen(P.x + dx / L * 1.5, P.y + 1, P.z + dz / L * 1.5, o2);
      let vx = q.x - bx, vy = q.y - by; const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
      const t = Math.min((cx - m) / Math.max(0.001, Math.abs(vx)), (cy - m) / Math.max(0.001, Math.abs(vy)));
      el.style.display = ''; el.className = 'sn ' + mk.k;
      el.style.transform = `translate(${cx + vx * t}px,${cy + vy * t}px) translate(-50%,-50%)`;
      el.firstChild.style.transform = `rotate(${Math.atan2(vy, vx)}rad)`;
      el.lastChild.textContent = { atk: '!', proj: '➶', near: '●', snd: '♪', hid: '?' }[mk.k];
      el.style.opacity = mk.k === 'snd' || mk.k === 'hid' ? 0.55 + 0.45 * Math.max(0, 1 - mk.d / 160) : 1;
    });
  };
  // 予言者：敵の頭上に「次の攻撃」と命中までの秒数
  UI._forePool = [];
  const KIND_JP = { melee: '近接攻撃', charge: '突進', jump: '跳びかかり', proj: '射撃', aoe: '範囲攻撃', circle: '周囲攻撃', ring: '衝撃波', line: '直線攻撃', cone: 'ブレス', summon: '召喚' };
  UI.updateFore = function () {
    const lay = $('.fore'); if (!lay) return;
    const s = G.save, on = s && (G.pk ? G.pk() === 'prophet' : D.PERS[s.pers].prophet) && G.state === 'play' && !G.uiOpen, list = [];
    if (on) { const P = G.player.pos; for (const e of G.enemies) { if (e.dead || e.fore == null || e.def0.static) continue; if (G.time > e.foreAt + 0.25) { if (e.state !== 'windup') e.fore = null; continue; } if (Math.hypot(e.x - P.x, e.z - P.z) < 50) list.push(e); } }
    list.length = Math.min(list.length, 10);
    while (UI._forePool.length < list.length) { const el = h('<div class="fo"><span class="fo-i">◉</span><b></b><small></small></div>'); lay.appendChild(el); UI._forePool.push(el); }
    const o = UI._fo || (UI._fo = {});
    UI._forePool.forEach((el, i) => {
      const e = list[i]; if (!e) { el.style.display = 'none'; return; }
      const sc = PS.R.toScreen(e.x, e.y + e.height + (e.boss ? 1.6 : 0.9), e.z, o); if (!sc.vis) { el.style.display = 'none'; return; }
      const left = Math.max(0, e.foreAt - G.time), a = e.def0.atk[e.fore];
      el.style.display = ''; el.classList.toggle('now', left < 0.45); el.classList.toggle('boss', !!e.boss);
      el.style.transform = `translate(${sc.x}px,${sc.y}px) translate(-50%,-100%)`;
      el.children[1].textContent = 'あと' + left.toFixed(1) + '秒'; el.children[2].textContent = KIND_JP[a && a.kind] || '攻撃';
    });
  };

  // ================= v1.0.10：タッチ操作 ⇔ キーボード操作の自動切り替え =================
  UI.onModeChange = function (touch) {
    UI.applyUIScale();
    if (G.state === 'play') UI.notify(touch ? '👆 タッチ操作に切り替えました' : '⌨ キーボード・マウス操作に切り替えました', 'info');
  };

  // ================= 死亡 =================
  UI.death = function () {
    UI.hudShow(false); if (PS.Input.locked) document.exitPointerLock();
    const el = h(`<div class="death"><div class="dt-t">力尽きた…</div><div class="dt-s">星の導きが、あなたを再び立ち上がらせる</div><button class="btn yes">${G.scene === 'dungeon' ? '迷宮の入口で復活' : '近くのワープポイントで復活'}</button></div>`);
    $('#panels').appendChild(el);
    el.querySelector('button').onclick = () => { el.remove(); G.revive(); UI.hudShow(true); };
  };
})(window.PS);
