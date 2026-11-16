// Release v1.0.0：ミラクルガチャ・プラスパス・ログインボーナス・ヨミガエクリスタル・人格の新衣装・縦画面／多重起動の対策
(function (PS) {
  'use strict';
  const G = PS.G, D = PS.DATA, W = PS.World, UI = PS.UI, ST = PS.Story;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const fmt = (n) => Math.round(n).toLocaleString('ja-JP');
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
  const DAY = 86400000;
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const stars = (n) => '★'.repeat(n);
  const STAR_COL = ['#c8ccd8', '#9fd0a0', '#7fc8ff', '#c38cff', '#ffd27a'];

  // =====================================================================
  //  プラスパス（30日・ゲーム内のスターコインで購入）
  // =====================================================================
  G.passOn = () => { const s = G.save; return !!(s && s.pass && Date.now() < s.pass.end); };
  G.passLeft = () => { const s = G.save; return s && s.pass ? Math.max(0, s.pass.end - Date.now()) : 0; };
  Object.defineProperty(D, 'MAX_LV', { get: () => (G.passOn && G.passOn() ? D.PASS.maxLv : 100), set: () => { }, configurable: true });
  G.buyPass = function () {
    const s = G.save, P = D.PASS;
    if (s.coins < P.price) { PS.UI.notify('スターコインが足りません（' + fmt(P.price) + ' 必要）', 'warn'); PS.Audio.sfxPlay('deny'); return false; }
    s.coins -= P.price;
    const base = Math.max(Date.now(), s.pass && s.pass.end || 0);
    s.pass = Object.assign({ weekly: 0 }, s.pass || {}, { end: base + P.days * DAY });
    PS.Audio.sfxPlay('levelup'); PS.UI.banner('プラスパス', '購入しました！ 30日間、特典が使えます', '#ffd27a');
    G.passWeekly(); G.recalc(); PS.UI.refreshAll && PS.UI.refreshAll(); G.writeSave(true);
    return true;
  };
  G.passWeekly = function () {
    const s = G.save; if (!G.passOn()) return;
    if (Date.now() - (s.pass.weekly || 0) >= 7 * DAY) { s.pass.weekly = Date.now(); G.giveItem('yomigae', 1); setTimeout(() => PS.UI.banner('プラスパス 週間特典', 'ヨミガエクリスタルを1つ受け取った', '#ffd27a'), 400); }
  };
  G.giveItem = function (id, n) { const s = G.save; s.inv[id] = (s.inv[id] || 0) + n; const it = D.ITEMS[id]; PS.UI.toast(it.icon, it.name, n, it.rar); G.questEvent('collect', id); };

  // =====================================================================
  //  ヨミガエクリスタル（宝箱・敵からごくまれに。HPが0になると全回復で復活）
  // =====================================================================
  const yomigaeDrop = (x, y, z) => {
    if (Math.random() >= D.YOMIGAE_RATE) return;
    G.giveItem('yomigae', 1); PS.Audio.sfxPlay('levelup');
    PS.UI.banner('ヨミガエクリスタル！', 'とても珍しい再生の結晶を手に入れた', '#ff9ef0');
    if (x != null) { G.pillarFX(x, y, z, 1.4, 22, [1, 0.6, 0.95], 2); G.emit(40, { x, y: y + 1, z, color: '#ff9ef0', vs: 4, vy: 4, size: 0.4, life: 1.4, kind: 1 }); }
  };
  const _ke = G.killEnemy;
  G.killEnemy = function (e) { const was = e.dead; _ke(e); if (!was && e.dead && !e.summoned && !e.passive && e.key !== 'ice_pylon' && e.key !== 'pylon' && e.key !== 'sw_orb' && e.key !== 'halo_pylon' && G.save) yomigaeDrop(e.x, e.y, e.z); };
  const _oc = G.openChest;
  G.openChest = function (c, transient) { _oc(c, transient); yomigaeDrop(c.x, c.y, c.z); };
  const _pd = G.playerDie;
  G.playerDie = function () {
    const s = G.save, p = G.player;
    if (s && p && (s.inv.yomigae || 0) > 0) {
      s.inv.yomigae--; if (!s.inv.yomigae) delete s.inv.yomigae;
      G.recalc(); p.dead = false; p.hp = G.pstat.hp; p.iframe = 3; p.status = { freeze: 0, burn: 0, slow: 0, poison: 0 }; G.state = 'play';
      const P0 = p.pos;
      G.pillarFX(P0.x, P0.y, P0.z, 2.2, 40, [1, 0.6, 0.95], 2.5); G.ring(P0.x, P0.y + 0.1, P0.z, 7, [1, 0.75, 0.95], 0.9); G.ring(P0.x, P0.y + 0.1, P0.z, 4, [1, 1, 1], 0.6);
      G.emit(80, { x: P0.x, y: P0.y + 1, z: P0.z, color: '#ff9ef0', vs: 6, vy: 5, size: 0.4, life: 1.6, kind: 1, spread: 1.5 });
      PS.Audio.sfxPlay('awaken'); PS.Audio.sfxPlay('heal'); G.shake(0.6); G.hitstop = 0.25;
      PS.UI.banner('再生の力', 'ヨミガエクリスタルが砕け、HPが全回復して生き返った！（のこり ' + (s.inv.yomigae || 0) + '個）', '#ff9ef0');
      if (PS.R.fx) PS.R.fx.lowHP = 0;
      G.writeSave(true);
      return;
    }
    return _pd();
  };

  // =====================================================================
  //  人格の新衣装
  // =====================================================================
  G.costumeOf = (pers) => { const s = G.save, id = s && s.costume && s.costume[pers]; return id && s.costumes.includes(id) && D.COSTUMES[id] ? D.COSTUMES[id] : null; };
  const _bpm = G.buildPlayerModel;
  G.buildPlayerModel = function () {
    const s = G.save; if (!s || G.curComp() || (G.plusOn && G.plusOn())) return _bpm();
    const cs = G.costumeOf(s.pers); if (!cs) return _bpm();
    const P = D.PERS[s.pers], w = D.W[s.weapon];
    return PS.makeModel('player:' + s.pers + ':' + s.gender + ':' + s.weapon + ':cos:' + cs.id, () => {
      const look = Object.assign({ gender: s.gender, hair: s.gender === 'f' ? '#f2d58a' : '#3d3040', skin: '#ffe2cf' }, P.look, cs.look, { weapon: Object.assign({ type: w.type }, w.look) });
      for (const k in look) if (look[k] === null) delete look[k];
      return { mb: PS.buildHumanoid(look), bones: PS.HB, anim: PS.animHuman, height: 1.7, radius: 0.4 };
    });
  };
  G.setCostume = function (id) {
    const s = G.save, pers = s.pers; s.costume = s.costume || {};
    if (id) s.costume[pers] = id; else delete s.costume[pers];
    if (G.player) G.player.setModel();
    PS.Audio.sfxPlay('ui'); G.writeSave(true);
  };

  // =====================================================================
  //  ミラクルガチャ
  // =====================================================================
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const wpick = (o) => { let t = 0; for (const k in o) t += o[k]; let x = Math.random() * t; for (const k in o) { x -= o[k]; if (x <= 0) return k; } return Object.keys(o)[0]; };
  G.gachaRollStar = function () { const r = D.GACHA.rates; let x = Math.random(); for (let i = r.length - 1; i >= 0; i--) { x -= r[i]; if (x < 0) return i + 1; } return 1; };
  G.gachaPrize = function (star) {
    const s = G.save, GA = D.GACHA, ps = G.partySave();
    const cat = wpick(star <= 2 ? { food: 1, mat: 1 } : star === 3 ? { food: 0.38, mat: 0.38, weapon: 0.24 } : star === 4 ? { food: 0.25, mat: 0.25, weapon: 0.25, costume: 0.25 } : { food: 0.1, mat: 0.1, weapon: 0.2, costume: 0.2, char: 0.4 });
    const o = { star, cat };
    if (cat === 'food' || cat === 'mat') {
      const id = pick((cat === 'food' ? GA.food : GA.mat)[star - 1].filter(k => D.ITEMS[k])), it = D.ITEMS[id], n = star <= 2 ? 2 + Math.floor(Math.random() * 2) : star === 3 ? 2 : 1;
      Object.assign(o, { id, n, name: it.name, icon: it.icon, tag: cat === 'food' ? '食料' : '素材' });
      s.inv[id] = (s.inv[id] || 0) + n;
    } else if (cat === 'weapon') {
      const types = D.PERS[s.pers].weapons, tier = pick(GA.weaponTier[star - 1]), id = D.TIER_WEAPON[tier][pick(types)], w = D.W[id];
      Object.assign(o, { id, n: 1, name: w.name, icon: UI.wIcon ? UI.wIcon(w.type) : '⚔', tag: '武器', sub: '攻撃力 +' + fmt(w.atk) });
      if (s.weapons.includes(id)) { const c = [0, 0, 5000, 15000, 40000][star - 1]; s.coins += c; o.dup = '所持済み → 🪙' + fmt(c); } else { s.weapons.push(id); o.isNew = true; }
    } else if (cat === 'costume') {
      const all = Object.keys(D.COSTUMES), mine = all.filter(k => D.COSTUMES[k].pers === s.pers), id = Math.random() < 0.55 && mine.length ? pick(mine) : pick(all), cs = D.COSTUMES[id];
      Object.assign(o, { id, n: 1, name: cs.name, icon: '👗', tag: '人格の新衣装', sub: D.PERS[cs.pers].name + '用' });
      if (s.costumes.includes(id)) { s.coins += 20000; o.dup = '所持済み → 🪙' + fmt(20000); } else { s.costumes.push(id); o.isNew = true; }
    } else {
      const id = pick(D.GACHA_CHARS), c = D.COMPANIONS[id];
      Object.assign(o, { id, n: 1, name: c.name, icon: c.icon, tag: 'キャラ', sub: c.title, color: c.color });
      if (ps.list.includes(id)) { s.coins += 30000; s.inv.pluscrystal = (s.inv.pluscrystal || 0) + 3; o.dup = '仲間にいる → 🪙30,000＋💎3'; }
      else {
        ps.list.push(id); ps.keys = ps.keys || {}; o.isNew = true;
        let k = 0; for (let n = 1; n <= D.SWITCH_KEYS; n++) if (!ps.keys[n]) { k = n; break; }
        if (k) ps.keys[k] = id; o.key = k;
      }
    }
    return o;
  };
  G.gachaPull = function (n, mode) {
    const s = G.save, GA = D.GACHA;
    if (mode === 'coin') { const cost = n === 10 ? GA.price10 : GA.price1 * n; if (s.coins < cost) { PS.UI.notify('スターコインが足りません', 'warn'); PS.Audio.sfxPlay('deny'); return null; } s.coins -= cost; }
    else if (mode === 'ticket') { if ((s.inv.gachaticket || 0) < n) { PS.UI.notify('ミラクルチケットが足りません', 'warn'); PS.Audio.sfxPlay('deny'); return null; } s.inv.gachaticket -= n; if (!s.inv.gachaticket) delete s.inv.gachaticket; }
    else if (mode === 'free') { if (!G.passOn() || s.pass.free === today()) { PS.Audio.sfxPlay('deny'); return null; } s.pass.free = today(); n = 1; }
    const list = [];
    for (let i = 0; i < n; i++) { s.gacha.pity = (s.gacha.pity || 0) + 1; let st = G.gachaRollStar(); if (s.gacha.pity >= GA.pity) st = 5; if (st === 5) s.gacha.pity = 0; list.push(st); }
    if (n === 10 && list.every(st => st < 3)) list[9] = 3; // 10連は星3以上が1つ確定
    s.gacha.total = (s.gacha.total || 0) + n;
    const res = list.map(st => G.gachaPrize(st));
    if (res.some(r => r.cat === 'char' && r.isNew)) { G.buildParty && G.buildParty(); PS.UI.refreshParty && PS.UI.refreshParty(); }
    G.writeSave(true);
    return res;
  };

  // ---- ガチャ画面 ----
  UI.gachaMenu = function () {
    if (UI.stack.some(q => q.el.classList.contains('gacha'))) return;
    const el = UI.panel('gacha', '<div class="ga-wrap"></div>');
    const render = () => {
      const s = G.save, GA = D.GACHA, tk = s.inv.gachaticket || 0, free = G.passOn() && s.pass.free !== today();
      const chars = D.GACHA_CHARS.map(id => { const c = D.COMPANIONS[id], got = G.partySave().list.includes(id); return `<span class="ga-ch ${got ? 'got' : ''}" style="--cc:${c.color}" title="${c.title} ${c.name}">${c.icon}<small>${c.name}</small></span>`; }).join('');
      el.querySelector('.ga-wrap').innerHTML = `
        <div class="ga-hero"><div class="ga-glow"></div><div class="ga-k">MIRACLE GACHA</div><div class="ga-t">ミラクルガチャ</div><div class="ga-s">★5 キャラクター 15人・人格の新衣装 登場中！</div><div class="ga-chars"><div class="ga-track">${chars}${chars}</div></div></div>
        <div class="ga-info"><div><span>所持スターコイン</span><b>🪙 ${fmt(s.coins)}</b></div><div><span>ミラクルチケット</span><b>🎫 ${tk}</b></div><div><span>★5確定まで</span><b>あと ${GA.pity - (s.gacha.pity || 0)} 回</b></div><div><span>これまでに引いた回数</span><b>${fmt(s.gacha.total || 0)} 回</b></div></div>
        <div class="ga-btns">
          ${G.passOn() ? `<button class="ga-b free" ${free ? '' : 'disabled'}><b>${free ? '無料で1回引く' : '本日の無料分は受け取り済み'}</b><small>✚ プラスパス特典（一日一回）</small></button>` : ''}
          <button class="ga-b one" ${s.coins < GA.price1 ? 'disabled' : ''}><b>1回引く</b><small>🪙 ${fmt(GA.price1)}</small></button>
          <button class="ga-b ten" ${s.coins < GA.price10 ? 'disabled' : ''}><b>10回引く</b><small>🪙 ${fmt(GA.price10)}　<em>★3以上 1つ確定</em></small></button>
          ${tk ? `<button class="ga-b tk1"><b>チケットで1回</b><small>🎫 ×1</small></button>${tk >= 10 ? '<button class="ga-b tk10"><b>チケットで10回</b><small>🎫 ×10　<em>★3以上 1つ確定</em></small></button>' : ''}` : ''}
        </div>
        <details class="ga-rates"><summary>提供割合・内容</summary><table>${GA.rates.map((r, i) => `<tr><td style="color:${STAR_COL[i]}">${stars(i + 1)}</td><td>${(r * 100).toFixed(1)}%</td><td>${['食料・素材', '食料・素材', '食料・素材・武器', '食料・素材・武器・人格の新衣装', '食料・素材・武器・人格の新衣装・キャラクター（15人）'][i]}</td></tr>`).join('')}</table><p>${GA.pity}回引くまでに★5が出なかった場合、${GA.pity}回目は★5が確定します。10回引くと★3以上が必ず1つ以上出ます。すでに持っている武器・衣装・キャラクターは、スターコインなどに変換されます。ガチャはゲーム内通貨（スターコイン）だけで遊べます。</p></details>`;
      const go = (n, mode) => { const res = G.gachaPull(n, mode); if (!res) return render(); UI.gachaShow(res, () => render(), () => go(n, mode === 'free' ? 'coin' : mode)); };
      const b = (c, f) => { const q = el.querySelector('.ga-b.' + c); if (q) q.onclick = f; };
      b('free', () => go(1, 'free')); b('one', () => go(1, 'coin')); b('ten', () => go(10, 'coin')); b('tk1', () => go(1, 'ticket')); b('tk10', () => go(10, 'ticket'));
    };
    render(); PS.Audio.play('gacha');
    const top = UI.stack[UI.stack.length - 1]; const oc = top.onClose; top.onClose = () => { oc && oc(); if (G.state === 'play') G.pickBGM(); };
  };
  // ---- 豪華な演出 ----
  UI.gachaShow = function (res, onClose, again) {
    const best = Math.max(...res.map(r => r.star)), many = res.length > 1;
    const el = h(`<div class="gacha-fx r${best}"><canvas class="gx-c"></canvas><div class="gx-rays"></div><div class="gx-circle"><i></i><i></i><i></i><b>✦</b></div><div class="gx-orb"></div><div class="gx-flash"></div><div class="gx-title"></div><div class="gx-cards ${many ? 'ten' : 'one'}"></div><button class="gx-skip">スキップ ▶▶</button><div class="gx-foot hidden"><button class="btn ghost close">閉じる</button>${again ? `<button class="btn yes again">もう一度引く</button>` : ''}</div></div>`);
    $('#ui').appendChild(el);
    const cv = el.querySelector('.gx-c'), x = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => { cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr; }; resize();
    const parts = [], st = [];
    for (let i = 0; i < 160; i++) st.push({ x: Math.random(), y: Math.random(), z: Math.random(), t: Math.random() * 6 });
    const COLS = best >= 5 ? ['#ff9ef0', '#ffd27a', '#7fe8ff', '#7fff8a', '#c38cff'] : best === 4 ? ['#c38cff', '#e8c8ff', '#ff9ef0'] : best === 3 ? ['#7fc8ff', '#ffffff', '#bff6ff'] : ['#ffffff', '#c8ccd8'];
    const burst = (n, sp) => { const W0 = cv.width / 2, H0 = cv.height / 2; for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = (2 + Math.random() * 9) * dpr * (sp || 1); parts.push({ x: W0, y: H0, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c: pick(COLS), s: (1 + Math.random() * 3) * dpr }); } };
    let alive = true, t0 = performance.now(), lastT = t0;
    const loop = (now) => {
      if (!alive) return; requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - lastT) / 1000), t = (now - t0) / 1000; lastT = now;
      if (cv.width !== Math.round(cv.clientWidth * dpr)) resize();
      x.clearRect(0, 0, cv.width, cv.height);
      for (const q of st) { const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + q.t)); q.y += dt * 0.02 * (0.3 + q.z); if (q.y > 1) q.y -= 1; x.fillStyle = `rgba(255,255,255,${tw * 0.7 * q.z})`; x.fillRect(q.x * cv.width, q.y * cv.height, (1 + q.z * 1.5) * dpr, (1 + q.z * 1.5) * dpr); }
      x.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.04 * dpr; p.l -= dt * 0.7; if (p.l <= 0) { parts.splice(i, 1); continue; } x.fillStyle = p.c; x.globalAlpha = p.l; x.beginPath(); x.arc(p.x, p.y, p.s, 0, 6.283); x.fill(); }
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    };
    requestAnimationFrame(loop);
    const timers = [], at = (ms, f) => timers.push(setTimeout(f, ms));
    const cards = el.querySelector('.gx-cards');
    cards.innerHTML = res.map((r, i) => `<div class="gx-card s${r.star} c-${r.cat}" style="--d:${i * (many ? 0.06 : 0)}s;--cc:${r.color || STAR_COL[r.star - 1]}"><div class="gx-in"><div class="gx-back"><span>✦</span></div><div class="gx-front"><div class="gx-st">${stars(r.star)}</div><div class="gx-ic">${r.icon}</div><div class="gx-nm">${r.name}${r.n > 1 ? ' ×' + r.n : ''}</div><div class="gx-tag">${r.tag}${r.sub ? '・' + r.sub : ''}</div>${r.isNew ? '<em class="gx-new">NEW</em>' : ''}${r.dup ? `<small class="gx-dup">${r.dup}</small>` : ''}${r.cat === 'char' && r.isNew ? `<small class="gx-dup">${r.key ? 'キー ' + r.key + ' で人格切り替え' : '仲間画面でキーを割り当てよう'}</small>` : ''}</div></div></div>`).join('');
    const finish = () => {
      timers.forEach(clearTimeout); el.classList.add('done'); $$('.gx-card', el).forEach(c => c.classList.add('flip'));
      el.querySelector('.gx-foot').classList.remove('hidden'); el.querySelector('.gx-skip').classList.add('hidden');
      const tt = el.querySelector('.gx-title'); tt.innerHTML = best >= 5 ? '<b>MIRACLE!!</b><small>★5 が出た！</small>' : best === 4 ? '<b>SUPER RARE</b>' : '<b>RESULT</b>'; tt.classList.add('on');
    };
    PS.Audio.sfxPlay('waypoint', 0.8);
    at(150, () => el.classList.add('p1'));
    at(900, () => { el.classList.add('p2'); PS.Audio.sfxPlay('magic', 0.8); });
    at(1900, () => { el.classList.add('p3'); burst(best >= 5 ? 260 : best === 4 ? 160 : 90, best >= 5 ? 1.4 : 1); PS.Audio.sfxPlay(best >= 4 ? 'boss' : 'chest', best >= 4 ? 0.6 : 0.9); if (best >= 5) PS.Audio.sfxPlay('awaken', 0.8); });
    at(2500, () => el.classList.add('p4'));
    const step = many ? 230 : 0, base = 2900;
    res.forEach((r, i) => at(base + i * step + (r.star >= 5 ? 500 : 0), () => {
      const c = el.querySelectorAll('.gx-card')[i]; c.classList.add('flip'); PS.Audio.sfxPlay(r.star >= 4 ? 'levelup' : 'pickup', r.star >= 4 ? 0.7 : 0.6);
      if (r.star >= 4) { const rc = c.getBoundingClientRect(), cr = cv.getBoundingClientRect(); const cx = (rc.left + rc.width / 2 - cr.left) * dpr, cy = (rc.top + rc.height / 2 - cr.top) * dpr; for (let k = 0; k < (r.star >= 5 ? 90 : 40); k++) { const a = Math.random() * 6.283, v = (1 + Math.random() * 5) * dpr; parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c: pick(r.star >= 5 ? ['#ff9ef0', '#ffd27a', '#7fe8ff', '#7fff8a'] : ['#c38cff', '#ffffff']), s: (1 + Math.random() * 2.5) * dpr }); } }
      if (r.star >= 5) { el.classList.add('ss'); setTimeout(() => el.classList.remove('ss'), 900); }
    }));
    at(base + res.length * step + (res.some(r => r.star >= 5) ? 900 : 400), finish);
    const close = () => { alive = false; timers.forEach(clearTimeout); el.classList.add('out'); setTimeout(() => el.remove(), 400); onClose && onClose(); };
    el.querySelector('.gx-skip').onclick = (e) => { e.stopPropagation(); finish(); };
    el.querySelector('.close').onclick = (e) => { e.stopPropagation(); close(); };
    const ag = el.querySelector('.again'); if (ag) ag.onclick = (e) => { e.stopPropagation(); close(); setTimeout(() => again(), 120); };
    el.addEventListener('mousedown', e => e.stopPropagation());
  };

  // =====================================================================
  //  プラスパスの画面
  // =====================================================================
  UI.passMenu = function (fromGate) {
    if (UI.stack.some(q => q.el.classList.contains('pass'))) return;
    const el = UI.panel('pass', '<div class="ps-wrap"></div>');
    const render = () => {
      const s = G.save, on = G.passOn(), left = G.passLeft(), P = D.PASS;
      const perks = [['⬆', '最大レベル 100 → 120', 'レベル上限が120まで上がります（プラス進化の条件は変わりません）'], ['🎰', 'ミラクルガチャ 一日一回無料', '毎日1回、ミラクルガチャを無料で引けます'], ['🎁', 'ログインボーナスプラス', 'ログインボーナスでもらえる量が2倍になります'], ['🔮', '週に一回 ヨミガエクリスタル', '7日ごとにヨミガエクリスタルを1つ受け取れます'], ['🏙', '新地「プラスタウン」', '少し近代化した街。新しい仲間や豪華な取引商品があります']];
      el.querySelector('.ps-wrap').innerHTML = `<div class="ps-hero"><div class="ps-k">PLUS PASS</div><div class="ps-t">✚ プラスパス</div><div class="ps-s">一ヶ月（30日）のパス ・ ゲーム内通貨（スターコイン）で購入</div></div>
        <div class="ps-state ${on ? 'on' : ''}">${on ? `<b>有効</b>のこり ${Math.floor(left / DAY)}日 ${Math.floor(left % DAY / 3600000)}時間` : '<b>未加入</b>購入すると、すぐに特典が使えます'}</div>
        <div class="ps-perks">${perks.map(p => `<div class="ps-pk"><span>${p[0]}</span><div><b>${p[1]}</b><small>${p[2]}</small></div></div>`).join('')}</div>
        <div class="ps-btns"><button class="btn yes big buy" ${s.coins < P.price ? 'disabled' : ''}>${on ? '30日延長する' : '購入する'}　🪙 ${fmt(P.price)}</button>${on && G.scene === 'world' && G.state === 'play' ? '<button class="btn go">プラスタウンへ行く</button>' : ''}</div>
        <div class="ps-note">所持スターコイン 🪙 ${fmt(s.coins)}　／　プラスパスは端末の時計で30日間有効です。期限が切れるとレベル上限は100に戻ります（上がったレベルはそのまま）。${fromGate && !on ? '<br>プラスゲートの先の「プラスタウン」は、プラスパスを持っている人だけが行けます。' : ''}</div>`;
      el.querySelector('.buy').onclick = () => UI.confirm('プラスパス（30日）を 🪙' + fmt(P.price) + ' で' + (on ? '延長' : '購入') + 'しますか？', () => { if (G.buyPass()) render(); });
      const go = el.querySelector('.go'); if (go) go.onclick = () => { UI.closeAll(); const pg = G.ch5.pgate; if (pg && Math.hypot(pg.x - G.player.pos.x, pg.z - G.player.pos.z) < 40) G.enterHub('ptown'); else G.enterHub('ptown'); };
    };
    render();
  };

  // =====================================================================
  //  ログインボーナス（7日で一周・プラスパスで2倍）
  // =====================================================================
  G.checkLogin = function () {
    const s = G.save; if (!s) return false;
    G.passWeekly();
    const t = today(); if (s.login.last === t) return false;
    s.login.last = t; s.login.day = (s.login.day % 7) + 1;
    const plus = G.passOn(), mul = plus ? 2 : 1, R0 = D.LOGIN[s.login.day - 1];
    if (R0.coins) s.coins += R0.coins * mul;
    if (R0.item) s.inv[R0.item[0]] = (s.inv[R0.item[0]] || 0) + R0.item[1] * mul;
    G.writeSave(true);
    UI.loginModal(s.login.day, plus);
    return true;
  };
  UI.loginModal = function (day, plus) {
    const mul = plus ? 2 : 1;
    const cell = (R0, i) => { const it = R0.item && D.ITEMS[R0.item[0]]; const lines = []; if (R0.coins) lines.push(`<b>🪙</b><small>${fmt(R0.coins * mul)}</small>`); if (it) lines.push(`<b>${it.icon}</b><small>${it.name} ×${R0.item[1] * mul}</small>`); return `<div class="lb-c ${i + 1 < day ? 'past' : i + 1 === day ? 'now' : ''}"><div class="lb-d">${i + 1}日目</div>${lines.join('')}${i + 1 <= day ? '<i class="lb-ok">受取済</i>' : ''}</div>`; };
    const el = UI.panel('login', `<div class="lb-wrap ${plus ? 'plus' : ''}"><div class="lb-k">${plus ? 'LOGIN BONUS PLUS' : 'LOGIN BONUS'}</div><h2 class="lb-t">${plus ? 'ログインボーナスプラス' : 'ログインボーナス'}</h2><div class="lb-s">${plus ? '✚ プラスパス特典：もらえる量が2倍！' : '毎日ログインすると報酬がもらえます（7日で一周）'}</div><div class="lb-grid">${D.LOGIN.map(cell).join('')}</div><button class="btn yes big lb-go">受け取る</button></div>`);
    PS.Audio.sfxPlay('quest');
    el.querySelector('.lb-go').onclick = () => { UI.closeTop(); PS.Audio.sfxPlay('coin'); PS.UI.notify('ログインボーナスを受け取った（' + day + '日目）', 'buff'); };
  };

  // =====================================================================
  //  衣装の画面
  // =====================================================================
  UI.wardrobe = function () {
    const el = UI.panel('wardrobe', '<div class="wd-wrap"></div>');
    const render = () => {
      const s = G.save, P = D.PERS[s.pers], cur = G.costumeOf(s.pers), mine = s.costumes.filter(id => D.COSTUMES[id] && D.COSTUMES[id].pers === s.pers), all = Object.values(D.COSTUMES).filter(c => c.pers === s.pers);
      el.querySelector('.wd-wrap').innerHTML = `<h2 class="pn-h">衣装（${P.name}）</h2><p class="wd-s">ミラクルガチャ（★4・★5）で手に入る「人格の新衣装」に着替えられます。所持 ${s.costumes.length} / ${Object.keys(D.COSTUMES).length}</p>
        <div class="wd-list"><button class="wd-it ${cur ? '' : 'on'}" data-id=""><span>🙂</span><b>いつもの服</b><small>${P.name}の標準の衣装</small></button>${all.map(c => { const got = mine.includes(c.id); return `<button class="wd-it ${cur && cur.id === c.id ? 'on' : ''} ${got ? '' : 'ng'}" data-id="${c.id}" ${got ? '' : 'disabled'}><span style="background:${c.look.main || '#888'};box-shadow:inset 0 -10px 0 ${c.look.sub || '#ccc'}">👗</span><b>${got ? c.name : '？？？'}</b><small>${got ? (cur && cur.id === c.id ? '着用中' : 'クリックで着替える') : 'ミラクルガチャで手に入る'}</small></button>`; }).join('')}</div>
        ${G.curComp() ? '<p class="wd-s warn">いまは仲間に人格を切り替え中です。主人公に戻ると衣装が見えます。</p>' : ''}${G.plusOn && G.plusOn() ? '<p class="wd-s warn">プラス進化中は、進化の姿が優先されます。</p>' : ''}`;
      $$('.wd-it', el).forEach(b => b.onclick = () => { if (b.disabled) return; G.setCostume(b.dataset.id || null); render(); });
    };
    render();
  };

  // =====================================================================
  //  メニュー・ヘルプの追加
  // =====================================================================
  const _pm = UI.pauseMenu;
  UI.pauseMenu = function () {
    _pm();
    const el = UI.stack[UI.stack.length - 1].el, s = G.save, list = el.querySelector('.pm-list'), news = list.querySelector('[data-k="news"]');
    const add = [['gacha', 'ミラクルガチャ', '🎰'], ['pass', 'プラスパス', '✚'], ['wardrobe', '衣装', '👗'], ['login', 'ログインボーナス', '🎁']];
    for (const [k, t, ic] of add) {
      const b = h(`<button class="pm-it ex" data-k="${k}"><span class="pm-ic em">${ic}</span><span class="pm-l">${t}</span>${k === 'pass' && G.passOn() ? '<em class="pm-new pass">有効</em>' : ''}${k === 'gacha' && G.passOn() && s.pass.free !== today() ? '<em class="pm-new">無料</em>' : ''}</button>`);
      list.insertBefore(b, news);
      b.onclick = (e) => { e.stopImmediatePropagation(); PS.Audio.sfxPlay('ui'); if (k === 'gacha') UI.gachaMenu(); else if (k === 'pass') UI.passMenu(); else if (k === 'wardrobe') UI.wardrobe(); else UI.loginModal(s.login.day || 1, G.passOn()); };
    }
    const chap = el.querySelector('.pm-chap');
    if (chap && (s.chapter || 1) >= 5) chap.textContent = G.scene === 'dungeon' && G.dun && (G.dun.hub === 'night' || G.dun.def.nightDun) ? '夜島　月影の章' : s.final5 ? '第五章クリア　平和になりかけた島' : '第五章　氷の住む街とタイプドラゴン';
    const rows = el.querySelector('.pm-rows');
    if (rows) {
      if ((s.chapter || 1) >= 5) rows.insertAdjacentHTML('beforeend', `<div><span>氷晶</span><b>💠 ${s.ice5.filter(x => x).length} / 5</b></div>`);
      if (s.final5) rows.insertAdjacentHTML('beforeend', `<div><span>夜島</span><b>🌙 ${s.night.ch.filter(x => x).length} / 4 章</b></div>`);
      rows.insertAdjacentHTML('beforeend', `<div><span>ヨミガエクリスタル</span><b>🔮 ${s.inv.yomigae || 0}</b></div>`);
      if (G.passOn()) rows.insertAdjacentHTML('beforeend', `<div><span>プラスパス</span><b style="color:#ffd27a">✚ のこり ${Math.ceil(G.passLeft() / DAY)}日</b></div>`);
    }
  };
  const _hm = UI.helpMenu;
  UI.helpMenu = function () {
    _hm();
    const el = UI.stack[UI.stack.length - 1].el;
    $$('td kbd', el).forEach(k => { if (k.textContent === '1 〜 9') k.textContent = '1 〜 4'; });
    const cols = el.querySelector('.help-cols > div:last-child');
    if (cols) cols.insertAdjacentHTML('beforeend', `<h3>第五章・夜島</h3><p>五つの氷晶の祠で番人を倒して氷晶を集め、北西の「氷の城塞」でタイプドラゴンと戦います。タイプドラゴンはタイプ（属性）が変わるたびに弱点も変わります。第五章のあとは各地に応用ダンジョンが現れ、スターリーフ村の東の「月の門」から夜島へ渡れます。夜島では重力が少し軽くなります。</p><h3>ヨミガエクリスタル</h3><p>持っているとHPが0になったときに自動で使われ、HPが全回復した状態で生き返ります（自分では使えません）。</p>`);
  };

  // =====================================================================
  //  ゲーム開始時：ログインボーナス・セーブの整合性チェック
  // =====================================================================
  const fixNum = (v, def) => (typeof v === 'number' && isFinite(v) ? v : def);
  G.sanitizeSave = function (s) {
    if (!s) return;
    s.level = Math.max(1, Math.min(D.PASS.maxLv, Math.floor(fixNum(s.level, 1))));
    s.exp = Math.max(0, fixNum(s.exp, 0)); s.coins = Math.max(0, Math.floor(fixNum(s.coins, 0)));
    s.gains = s.gains || {}; for (const k of ['hp', 'atk', 'def']) s.gains[k] = Math.max(0, fixNum(s.gains[k], 0));
    s.hp = fixNum(s.hp, 1); s.play = Math.max(0, fixNum(s.play, 0));
    if (s.inv) for (const k in s.inv) { if (!D.ITEMS[k] || !(s.inv[k] > 0)) delete s.inv[k]; else s.inv[k] = Math.floor(fixNum(s.inv[k], 0)); }
    if (Array.isArray(s.weapons)) s.weapons = s.weapons.filter(id => D.W[id]); if (!s.weapons || !s.weapons.length) s.weapons = ['s_start'];
    if (!D.W[s.weapon]) s.weapon = s.weapons[0];
    if (s.pass && !(s.pass.end > 0)) s.pass = null;
    if (s.pass && s.pass.end - Date.now() > 400 * DAY) s.pass.end = Date.now() + D.PASS.days * DAY; // 端末の時計がずれていた場合の上限
    if (!Array.isArray(s.pos) || s.pos.some(v => !isFinite(v))) s.pos = null;
    if (!isFinite(s.yaw)) s.yaw = Math.PI;
  };
  const _mig = G.migrateSave;
  G.migrateSave = function (s) { G.sanitizeSave(s); _mig(s); G.ch5Save(s); };
  const _sg = G.startGame;
  G.startGame = function (save, fromStory) {
    _sg(save, fromStory);
    G._loginAt = G.time + 3.5;
  };
  const _upd = G.update;
  G.update = function (dt, I) {
    if (G.portraitBlocked()) return;
    _upd(dt, I);
    const s = G.save;
    if (s && G._loginAt != null && G.time > G._loginAt && G.state === 'play' && !G.uiOpen && !UI.dlg && !$('.chap-card') && (s.tutorial == null || s.tutorial >= 99)) {
      const c = s.chapter || 1, intro = c >= 5 ? !s.ch5intro : c === 4 ? !s.ch4intro : c === 3 ? !s.ch3intro : c === 2 ? !s.ch2intro : false;
      if (!intro) { G._loginAt = G.time + 60; G.checkLogin(); }
    }
  };
  // 多重起動（別のタブ）でセーブが壊れないように
  const _ws = G.writeSave;
  G.writeSave = function (quiet) { if (window.PS_TAB_LOST) return; return _ws(quiet); };

  // =====================================================================
  //  スマホの縦画面ではプレイできないようにする
  // =====================================================================
  const mqP = window.matchMedia ? window.matchMedia('(orientation: portrait)') : null;
  const touchDev = () => (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || PS.isMobile;
  G.portraitBlocked = () => !!(mqP && mqP.matches && touchDev() && window.innerWidth < 1100);
  const rotUpd = () => { document.body.classList.toggle('portrait-block', G.portraitBlocked()); };
  window.addEventListener('resize', rotUpd); window.addEventListener('orientationchange', () => setTimeout(rotUpd, 150)); document.addEventListener('DOMContentLoaded', rotUpd);

  // =====================================================================
  //  タイトル画面：右下「スマホやタブレットでプレイしている場合について」・正式版の表記
  // =====================================================================
  UI.mobileGuide = function () {
    const host = $('#ui');
    const el = h(`<div class="mg-modal"><div class="mg-box"><button class="mg-x" title="閉じる">×</button><h2>スマホやタブレットでプレイしている場合について</h2><div class="mg-body">
      <p>この度はパーソナリティースターズ（人格と星）をプレイしていただき誠にありがとうございます。この度は新ゲーム パーソナリティースターズの楽しくプレイできる遊び方をお伝えしたいと思います。</p>
      <h3>①スマホ・タブレットなどの端末でプレイしている方</h3>
      <p>Google社のChromeやMicrosoft社のEdge（ios系列ならApple社のSafari）を使用して遊ぶことを推奨します。そしてアプリのブラウザの共有ボタンを押し、【ホーム画面に追加】を押し、追加をするといつでも開きたいときに開き、フル画面でプレイが可能です。また自分の端末のスペックを確認したうえで設定で画質などの設定をしていただくと更に快適にできる可能性があります。</p>
      <h3>➁ パソコン環境でプレイしている方</h3>
      <p>Google社のChromeやMicrosoftのEdgeそしてMozilla Foundation社のFireFoxなどを使用して遊ぶことを推奨します。またこの環境で遊んでいただいている方はブックマークに追加して全画面表示でプレイすることをおすすめします、</p>
      <p>全画面表示はWindows環境の方はF11キー（例外パターンあり）、Mac環境ではControl＋Command＋Fのキーを同時押しにすることでできます。</p>
      <h3>③最後に</h3>
      <p>このゲームではプレイしていただいている皆さんが楽しんでいただいていけるために作られました。利用規約そしてライセンスを確認して遊んでいただきたいです。またこのゲームは段階的ではありますが、ストアでのアプリとしての公開、パソコンではソフトとしての展開を予定しております。まだ段階的ですが、一人ひとりプレイしていただいている人々のためにも精一杯開発を頑張りますのでこれからもよろしくお願いします</p>
      <p class="mg-sign">YUKIGROUP 開発者一同</p></div></div></div>`);
    host.appendChild(el); PS.Audio.sfxPlay('uiOpen');
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 250); PS.Audio.sfxPlay('uiClose'); };
    el.querySelector('.mg-x').onclick = (e) => { e.stopPropagation(); close(); };
    el.addEventListener('click', (e) => { e.stopPropagation(); if (e.target === el) close(); });
  };
  // =====================================================================
  //  言語設定（設定 → その他／タイトル画面の右上）
  // =====================================================================
  if (PS.I18N) {
    UI.SETS.etc.unshift(['lang', '言語 / Language', 'seg', PS.I18N.LANGS]);
    if (!PS.Settings.lang) PS.Settings.lang = PS.I18N.lang;
    const _as = UI.afterSetting;
    UI.afterSetting = function (k) { if (k === 'lang') { PS.I18N.set(PS.Settings.lang); return; } return _as(k); };
  }
  const _mg = UI.mobileGuide;
  UI.mobileGuide = function () {
    _mg();
    const L = PS.I18N && PS.I18N.lang, g = L && PS.I18N.guide[L]; if (!g) return;
    const el = $('.mg-modal:last-child') || $$('.mg-modal').pop(); if (!el) return;
    el.querySelector('h2').textContent = g[0]; el.querySelector('.mg-body').innerHTML = g[1];
  };
  const _ts = ST.titleShow;
  ST.titleShow = function () {
    _ts();
    const el = ST.title; if (!el) return;
    const tb = el.querySelector('.tt-beta'); if (tb) tb.innerHTML = `<b>${D.VERSION_LABEL}</b>正式リリース版`;
    $$('.tt-foot span', el).forEach(sp => { sp.textContent = sp.textContent.replace('（非公開ベータ版）', '（正式版）'); });
    const btn = h(`<button class="tt-mob"><span>📱</span>スマホやタブレットでプレイしている場合について</button>`);
    if (PS.I18N) {
      const lg = h(`<div class="tt-lang">${PS.I18N.LANGS.map(([k, t]) => `<button data-l="${k}" class="${PS.I18N.lang === k ? 'on' : ''}">${t}</button>`).join('')}</div>`);
      el.appendChild(lg);
      $$('button', lg).forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); PS.Audio.init(); PS.Audio.sfxPlay('ui'); PS.I18N.set(b.dataset.l); $$('button', lg).forEach(q => q.classList.toggle('on', q === b)); }));
    }
    el.appendChild(btn);
    btn.addEventListener('click', (e) => { e.stopPropagation(); PS.Audio.init(); UI.mobileGuide(); });
    const save = G.hasSave() && G.loadSave();
    if (save && save.pers) {
      const fix = () => { const sm = el.querySelector('.tt-menu .cont small'); if (!sm) return; const lab = save.final5 ? '　第五章クリア' : save.chapter >= 5 || save.final4 ? '　第五章' : null; if (lab) sm.textContent = sm.textContent.replace(/　第[一二三四]章$/, '') + lab; };
      el.addEventListener('click', () => setTimeout(fix, 0));
    }
  };
})(window.PS);
