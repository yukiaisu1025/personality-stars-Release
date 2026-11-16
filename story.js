/* Personality Stars - story.js : ロゴ・ロード画面・タイトル・あらすじ映像・人格選択・チュートリアル・エンディング  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const G = PS.G, D = PS.DATA, W = PS.World;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
  const ST = PS.Story = { mode: 'none' };
  ST.bgMode = () => ST.mode;
  const LOGO_SVG = `<svg viewBox="0 0 200 200" class="yg-emblem"><defs><linearGradient id="yg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f6ff"/><stop offset="1" stop-color="#7fc8ff"/></linearGradient></defs>
    <g fill="none" stroke="url(#yg1)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    ${[0, 60, 120, 180, 240, 300].map(a => `<g transform="rotate(${a} 100 100)"><path class="yg-p" d="M100 100 L100 22"/><path class="yg-p" d="M100 52 L84 38 M100 52 L116 38 M100 74 L88 64 M100 74 L112 64"/></g>`).join('')}
    <circle class="yg-p" cx="100" cy="100" r="14"/><path class="yg-p" d="M100 6 L106 22 L100 30 L94 22 Z"/></g></svg>`;

  // ================= ロゴ =================
  ST.logo = function (done) {
    const el = h(`<div class="screen logo"><div class="yg">${LOGO_SVG}<div class="yg-t">YUKI GROUP</div><div class="yg-s">PRESENTS</div></div><div class="skip-hint">クリックでスキップ</div></div>`);
    $('#ui').appendChild(el);
    let fin = false; const end = () => { if (fin) return; fin = true; el.classList.add('out'); setTimeout(() => { el.remove(); done(); }, 700); };
    el.addEventListener('click', () => { PS.Audio.init(); end(); });
    setTimeout(end, 4200);
  };

  // ================= ロード画面 =================
  ST.loadingShow = function (boot) {
    // 60%：いつものロード画面 ／ 40%：最新バージョンのアップデート情報
    const chap = boot === 'ch2' ? ['CHAPTER 2', '第二章　浮上せし大地', '島が、新たな大地とともに目を覚ます。'] : boot === 'ch3' ? ['CHAPTER 3', '第三章　異界の結晶', '世界の果てに、異界の大地が流れ着く。'] : boot === 'ch5' ? ['FINAL CHAPTER', '第五章　氷の住む街とタイプドラゴン', '島をとりまく海が、一夜にして凍りついた。'] : null;
    ST.ldUpdate = !!chap || Math.random() < 0.4;
    const N = D.NEWS[0];
    const upd = ST.ldUpdate ? `<div class="ld-upd"><div class="lu-tag">${chap ? chap[0] : 'UPDATE INFORMATION'}</div><div class="lu-ver">${chap ? chap[1] : N.ver}</div><div class="lu-ttl">${chap ? chap[2] : N.title}</div>
      <div class="lu-list">${N.items.slice(0, 5).map(it => `<div class="lu-it"><span class="lu-ic">${it[0]}</span><div><b>${it[1]}</b><small>${it[2].length > 54 ? it[2].slice(0, 54) + '…' : it[2]}</small></div></div>`).join('')}</div></div>` : '';
    const el = h(`<div class="screen loading${ST.ldUpdate ? ' upd' : ''}"><canvas class="ld-c"></canvas>
      <div class="ld-logo"><span class="ld-star">✦</span><div><b>パーソナリティースターズ</b><small>PERSONALITY STARS</small></div></div>
      <div class="ld-info">本作品はフィクションです。実在の人物・団体・事件とは関係ありません。<br>${D.VERSION_LABEL}（正式版）　© 2026 YUKI GROUP</div>${upd}
      <div class="ld-bottom"><div class="ld-msg"><span class="ld-m">世界を構築しています</span><span class="ld-dots"></span>　<span class="ld-pct">0%</span></div>
      <div class="ld-bar"><i class="ld-cap l"></i><div class="ld-track"><div class="ld-fill"></div><div class="ld-glint"></div></div><i class="ld-cap r"></i></div>
      <label class="ld-agree"><input type="checkbox" checked><span class="ck"></span>ライセンスおよび利用規約に同意します（<a href="#" class="ld-lic">ライセンス</a>）</label>
      <div class="ld-tip"></div></div></div>`);
    $('#ui').appendChild(el); ST.ld = el; ST.ldT = 0; ST.tipI = Math.floor(Math.random() * D.TIPS.length);
    el.querySelector('.ld-tip').textContent = 'ヒント：' + D.TIPS[ST.tipI];
    el.querySelector('.ld-lic').addEventListener('click', (e) => { e.preventDefault(); ST.licModal(); });
    el.addEventListener('click', () => PS.Audio.init());
    ST.ldCanvas = el.querySelector('.ld-c'); ST.ldArt = ST.makeArt(); ST.ldBoot = boot;
  };
  ST.agreed = () => !ST.ld || ST.ld.querySelector('.ld-agree input').checked;
  ST.loadingUpdate = function (p, msg) {
    if (!ST.ld) return; const el = ST.ld;
    el.querySelector('.ld-fill').style.width = (p * 100).toFixed(1) + '%'; el.querySelector('.ld-glint').style.left = (p * 100).toFixed(1) + '%';
    el.querySelector('.ld-pct').textContent = Math.floor(p * 100) + '%'; el.querySelector('.ld-m').textContent = msg;
    if (p >= 0.999 && !ST.agreed()) el.querySelector('.ld-m').textContent = '利用規約に同意してください';
  };
  ST.loadingHide = function () { const el = ST.ld; ST.ld = null; el.classList.add('out'); setTimeout(() => el.remove(), 900); };
  ST.loadingFrame = function (dt) {
    if (!ST.ld) return; ST.ldT += dt;
    const dots = '・'.repeat(1 + Math.floor(ST.ldT * 2) % 3); ST.ld.querySelector('.ld-dots').textContent = dots;
    if (Math.floor(ST.ldT / 4.5) !== ST._lastTip) { ST._lastTip = Math.floor(ST.ldT / 4.5); ST.tipI = (ST.tipI + 1) % D.TIPS.length; ST.ld.querySelector('.ld-tip').textContent = 'ヒント：' + D.TIPS[ST.tipI]; }
    if (ST.ldUpdate) ST.drawUpdateArt(ST.ldCanvas, ST.ldT, ST.ldArt); else ST.drawArt(ST.ldCanvas, ST.ldT, ST.ldArt);
  };
  // ---- アップデート告知のキーアート（浮上する大地とフワリン・ルミ） ----
  ST.drawUpdateArt = function (cv, t, art) {
    const dpr = Math.min(2, window.devicePixelRatio || 1), Wd = cv.clientWidth * dpr, Hd = cv.clientHeight * dpr;
    if (cv.width !== Wd || cv.height !== Hd) { cv.width = Wd; cv.height = Hd; }
    const x = cv.getContext('2d'), S = Math.min(Hd / 900, Wd / 1500), cx = Wd * 0.36, cy = Hd * 0.56;
    let g = x.createLinearGradient(0, 0, 0, Hd); g.addColorStop(0, '#070b24'); g.addColorStop(0.45, '#1c1f56'); g.addColorStop(0.8, '#3a2a6a'); g.addColorStop(1, '#5a3a6a'); x.fillStyle = g; x.fillRect(0, 0, Wd, Hd);
    // 星
    for (const p of art.parts) { const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.5 + p.p * 3)); x.fillStyle = `rgba(255,250,230,${a})`; x.fillRect(p.x * Wd, p.y * Hd * 0.7, p.s * dpr * 0.8, p.s * dpr * 0.8); }
    // オーロラ
    x.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) {
      x.beginPath(); const yb = Hd * (0.16 + k * 0.07);
      for (let i = 0; i <= 40; i++) { const u = i / 40, xx = u * Wd, yy = yb + Math.sin(u * 7 + t * 0.6 + k) * 30 * S + Math.sin(u * 17 - t * 0.4) * 10 * S; i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); }
      for (let i = 40; i >= 0; i--) { const u = i / 40, xx = u * Wd, yy = yb + 120 * S + Math.sin(u * 5 + t * 0.5 + k * 2) * 40 * S; x.lineTo(xx, yy); }
      const ag = x.createLinearGradient(0, yb, 0, yb + 160 * S); ag.addColorStop(0, k === 1 ? 'rgba(180,120,255,0.18)' : 'rgba(110,255,200,0.16)'); ag.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = ag; x.fill();
    }
    x.globalCompositeOperation = 'source-over';
    // 浮かぶ島（中央の旧大陸と、四方の新大地）
    const bob = Math.sin(t * 0.8) * 6 * S;
    const isle = (ox, oy, w, top, base, glow) => {
      x.save(); x.translate(ox, oy + bob);
      x.fillStyle = base; x.beginPath(); x.moveTo(-w, 0); x.quadraticCurveTo(-w * 0.6, w * 0.9, 0, w * 1.15); x.quadraticCurveTo(w * 0.6, w * 0.9, w, 0); x.closePath(); x.fill();
      x.fillStyle = top; x.beginPath(); x.ellipse(0, 0, w, w * 0.22, 0, 0, 6.283); x.fill();
      if (glow) { x.globalCompositeOperation = 'lighter'; const gg = x.createRadialGradient(0, w * 0.6, 0, 0, w * 0.6, w * 1.2); gg.addColorStop(0, glow); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(-w * 1.3, -w * 0.4, w * 2.6, w * 2.2); x.globalCompositeOperation = 'source-over'; }
      x.restore();
    };
    isle(cx, cy, 190 * S, '#6fb84a', '#4a3a4a', 'rgba(255,220,140,0.25)');
    // 中央の山と村
    x.fillStyle = '#e8eef8'; x.beginPath(); x.moveTo(cx - 60 * S, cy - 20 * S + bob); x.lineTo(cx + 10 * S, cy - 150 * S + bob); x.lineTo(cx + 80 * S, cy - 20 * S + bob); x.fill();
    x.fillStyle = '#7a8aa0'; x.beginPath(); x.moveTo(cx + 10 * S, cy - 150 * S + bob); x.lineTo(cx + 80 * S, cy - 20 * S + bob); x.lineTo(cx + 30 * S, cy - 20 * S + bob); x.fill();
    const lands = [[-330, -60, 92, '#e8f0ff', '#6a7aa0', 'snow'], [330, -40, 100, '#8fd060', '#5a4a3a', 'mount'], [-300, 150, 96, '#3a3232', '#2a1e1e', 'lava'], [300, 170, 92, '#e0a868', '#8a5a3a', 'mesa']];
    lands.forEach(([dx, dy, w, top, base, kind], i) => {
      const rise = Math.sin(t * 0.7 + i * 1.7) * 10 * S, ox = cx + dx * S, oy = cy + dy * S + rise;
      isle(ox, oy, w * S, top, base, kind === 'lava' ? 'rgba(255,100,40,0.35)' : 'rgba(160,220,255,0.18)');
      x.save(); x.translate(ox, oy + bob);
      if (kind === 'snow') { x.fillStyle = '#ffffff'; for (const s2 of [-1, 0, 1]) { x.beginPath(); x.moveTo(s2 * 34 * S - 16 * S, 0); x.lineTo(s2 * 34 * S, -(46 + (s2 ? 0 : 22)) * S); x.lineTo(s2 * 34 * S + 16 * S, 0); x.fill(); } }
      if (kind === 'mount') { x.fillStyle = '#9aa8b8'; x.beginPath(); x.moveTo(-50 * S, 0); x.lineTo(5 * S, -120 * S); x.lineTo(60 * S, 0); x.fill(); x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(-14 * S, -84 * S); x.lineTo(5 * S, -120 * S); x.lineTo(24 * S, -84 * S); x.fill(); }
      if (kind === 'lava') { x.fillStyle = '#2a2222'; x.beginPath(); x.moveTo(-60 * S, 0); x.lineTo(-18 * S, -70 * S); x.lineTo(18 * S, -70 * S); x.lineTo(60 * S, 0); x.fill(); x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(255,120,40,0.9)'; x.beginPath(); x.ellipse(0, -70 * S, 18 * S, 5 * S, 0, 0, 6.283); x.fill(); for (let k = 0; k < 6; k++) { x.fillStyle = `rgba(255,${120 + k * 20},60,${0.5 - k * 0.07})`; x.beginPath(); x.arc(Math.sin(t * 2 + k) * 6 * S, -80 * S - k * 14 * S - (t * 20 % 14) * S, (6 - k * 0.6) * S, 0, 6.283); x.fill(); } x.globalCompositeOperation = 'source-over'; }
      if (kind === 'mesa') { x.fillStyle = '#c87a48'; x.fillRect(-46 * S, -40 * S, 40 * S, 40 * S); x.fillRect(10 * S, -26 * S, 34 * S, 26 * S); x.fillStyle = '#e8b47a'; x.fillRect(-46 * S, -44 * S, 40 * S, 6 * S); x.fillRect(10 * S, -30 * S, 34 * S, 6 * S); }
      x.restore();
    });
    // 光の粒
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const u = (i * 0.618 + t * 0.03) % 1, px = cx + Math.sin(i * 2.3) * 420 * S, py = cy + 260 * S - u * 520 * S; x.fillStyle = `rgba(255,236,170,${(1 - u) * 0.6})`; x.beginPath(); x.arc(px, py, (1.5 + (i % 3)) * S * 2, 0, 6.283); x.fill(); }
    x.globalCompositeOperation = 'source-over';
    // フワリン
    const fx = cx - 120 * S, fy = cy + 270 * S + Math.sin(t * 2) * 10 * S, fr = 54 * S;
    x.fillStyle = '#ffffff'; x.shadowColor = 'rgba(190,225,255,0.9)'; x.shadowBlur = 30 * S;
    for (const [ox, oy, rr] of [[0, 0, 1], [-0.8, 0.2, 0.55], [0.8, 0.2, 0.55], [-0.5, -0.65, 0.5], [0.5, -0.65, 0.5], [0, -0.85, 0.45], [-0.45, 0.65, 0.5], [0.45, 0.65, 0.5]]) { x.beginPath(); x.arc(fx + ox * fr, fy + oy * fr, rr * fr, 0, 6.283); x.fill(); }
    x.shadowBlur = 0; x.fillStyle = '#2a2e48'; for (const s2 of [-1, 1]) { x.beginPath(); x.ellipse(fx + s2 * 0.32 * fr, fy - 0.05 * fr, 0.12 * fr, 0.17 * fr, 0, 0, 6.283); x.fill(); }
    x.fillStyle = '#ffffff'; for (const s2 of [-1, 1]) { x.beginPath(); x.arc(fx + s2 * 0.32 * fr + 0.04 * fr, fy - 0.12 * fr, 0.05 * fr, 0, 6.283); x.fill(); }
    x.fillStyle = 'rgba(255,160,190,0.7)'; for (const s2 of [-1, 1]) { x.beginPath(); x.ellipse(fx + s2 * 0.55 * fr, fy + 0.18 * fr, 0.14 * fr, 0.08 * fr, 0, 0, 6.283); x.fill(); }
    x.strokeStyle = '#5a4a6a'; x.lineWidth = 2.5 * S; x.beginPath(); x.arc(fx, fy + 0.12 * fr, 0.1 * fr, 0.2, Math.PI - 0.2); x.stroke();
    // ルミ
    const lx = cx + 130 * S, ly = cy + 240 * S + Math.sin(t * 2.6 + 1) * 12 * S, lr = 30 * S;
    x.globalCompositeOperation = 'lighter'; const lg = x.createRadialGradient(lx, ly, 0, lx, ly, lr * 4); lg.addColorStop(0, 'rgba(255,230,140,0.8)'); lg.addColorStop(1, 'rgba(255,200,100,0)'); x.fillStyle = lg; x.fillRect(lx - lr * 4, ly - lr * 4, lr * 8, lr * 8);
    const flap = Math.sin(t * 18) * 0.35;
    for (const s2 of [-1, 1]) { x.save(); x.translate(lx + s2 * lr * 0.4, ly + lr * 0.2); x.rotate(s2 * (0.5 + flap)); x.fillStyle = 'rgba(190,246,255,0.55)'; x.beginPath(); x.ellipse(s2 * lr * 0.9, -lr * 0.3, lr * 0.95, lr * 0.5, 0, 0, 6.283); x.fill(); x.restore(); }
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = '#fff8d0'; x.beginPath(); x.moveTo(lx - lr * 0.5, ly + lr * 1.6); x.lineTo(lx + lr * 0.5, ly + lr * 1.6); x.lineTo(lx + lr * 0.2, ly + lr * 0.5); x.lineTo(lx - lr * 0.2, ly + lr * 0.5); x.fill();
    x.fillStyle = '#ffe58a'; x.beginPath(); x.arc(lx, ly - lr * 0.05, lr * 0.62, 0, 6.283); x.fill();
    x.fillStyle = '#fff1e6'; x.beginPath(); x.arc(lx, ly + lr * 0.1, lr * 0.5, 0, 6.283); x.fill();
    x.fillStyle = '#3a5ab0'; for (const s2 of [-1, 1]) { x.beginPath(); x.ellipse(lx + s2 * lr * 0.2, ly + lr * 0.12, lr * 0.08, lr * 0.12, 0, 0, 6.283); x.fill(); }
    x.save(); x.translate(lx, ly - lr * 0.8); x.rotate(t * 0.8); x.fillStyle = '#ffd84a'; x.shadowColor = '#ffd84a'; x.shadowBlur = 16 * S; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? lr * 0.16 : lr * 0.4; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); x.restore();
    // ビネット
    g = x.createRadialGradient(Wd / 2, Hd / 2, Hd * 0.3, Wd / 2, Hd / 2, Math.max(Wd, Hd) * 0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)'); x.fillStyle = g; x.fillRect(0, 0, Wd, Hd);
  };
  // ---- 手描き風キーアート (天界の導き手) ----
  ST.makeArt = function () {
    const r = PS.rng(7), shards = [], parts = [];
    for (let i = 0; i < 7; i++) shards.push({ a: i / 7 * 6.28 + r() * 0.4, d: 0.28 + r() * 0.12, y: (r() - 0.5) * 0.35, s: 0.06 + r() * 0.05, rot: r() * 6.28, sp: (r() - 0.5) * 0.4, sides: 5 + Math.floor(r() * 2) });
    for (let i = 0; i < 90; i++) parts.push({ x: r(), y: r(), s: 0.5 + r() * 2.5, v: 0.01 + r() * 0.03, p: r() * 6.28 });
    return { shards, parts };
  };
  ST.drawArt = function (cv, t, art, opt) {
    opt = opt || {};
    const dpr = Math.min(2, window.devicePixelRatio || 1), Wd = cv.clientWidth * dpr, Hd = cv.clientHeight * dpr;
    if (cv.width !== Wd || cv.height !== Hd) { cv.width = Wd; cv.height = Hd; }
    const x = cv.getContext('2d'), cx = Wd / 2, cy = Hd * (opt.cy || 0.47), S = Math.min(Hd / 900, Wd / 1100);
    // 背景
    let g = x.createRadialGradient(cx, cy - 120 * S, 10, cx, cy, Math.max(Wd, Hd) * 0.75);
    g.addColorStop(0, opt.c0 || '#fff6d8'); g.addColorStop(0.18, opt.c1 || '#f2c46a'); g.addColorStop(0.45, opt.c2 || '#8a5aa8'); g.addColorStop(0.8, opt.c3 || '#2a1f4e'); g.addColorStop(1, opt.c4 || '#120e26');
    x.fillStyle = g; x.fillRect(0, 0, Wd, Hd);
    x.globalCompositeOperation = 'lighter';
    // 光線
    for (let i = 0; i < 22; i++) {
      const a = i / 22 * 6.283 + t * 0.03, w = 0.05 + (i % 3) * 0.025;
      x.fillStyle = `rgba(255,230,170,${0.05 + (i % 2) * 0.03})`; x.beginPath(); x.moveTo(cx, cy - 130 * S);
      x.lineTo(cx + Math.cos(a - w) * Wd * 1.2, cy - 130 * S + Math.sin(a - w) * Wd * 1.2); x.lineTo(cx + Math.cos(a + w) * Wd * 1.2, cy - 130 * S + Math.sin(a + w) * Wd * 1.2); x.fill();
    }
    // 光輪リング
    x.strokeStyle = 'rgba(255,220,150,0.35)'; x.lineWidth = 2 * S;
    for (let k = 0; k < 3; k++) { x.beginPath(); x.ellipse(cx, cy + 40 * S + k * 30 * S, (300 + k * 120) * S, (60 + k * 22) * S, 0, 0, 6.283); x.stroke(); }
    // 星の紋章
    x.save(); x.translate(cx, cy - 130 * S); x.rotate(t * 0.05);
    for (let k = 0; k < 2; k++) { x.beginPath(); for (let i = 0; i < 12; i++) { const rr = i % 2 ? 90 * S : 260 * S, a = i / 12 * 6.283 + k * 0.26; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fillStyle = `rgba(255,240,200,${0.08 - k * 0.03})`; x.fill(); }
    x.restore();
    // 粒子
    for (const p of art.parts) { const yy = ((p.y - t * p.v) % 1 + 1) % 1, a = 0.3 + 0.5 * Math.sin(t * 2 + p.p); x.fillStyle = `rgba(255,236,190,${a})`; x.beginPath(); x.arc(p.x * Wd + Math.sin(t + p.p) * 10, yy * Hd, p.s * dpr, 0, 6.283); x.fill(); }
    x.globalCompositeOperation = 'source-over';
    // 翼
    const fy = cy - 150 * S, flap = Math.sin(t * 1.4) * 0.05;
    x.save(); x.globalCompositeOperation = 'lighter';
    for (const sd of [-1, 1]) for (let i = 0; i < 9; i++) {
      const th = -0.35 + i * 0.2 + flap * (1 + i * 0.2), L = (330 - i * 22) * S, bx = cx + sd * 26 * S, by = fy + 10 * S;
      const ex = bx + sd * Math.cos(th) * L, ey = by - Math.sin(th) * L;
      const gg = x.createLinearGradient(bx, by, ex, ey); gg.addColorStop(0, 'rgba(255,255,255,0.55)'); gg.addColorStop(0.6, 'rgba(200,240,255,0.25)'); gg.addColorStop(1, 'rgba(140,220,255,0)');
      x.fillStyle = gg; x.beginPath(); x.moveTo(bx, by);
      const nx = -(ey - by) / L * 30 * S * sd, ny = (ex - bx) / L * 30 * S * sd;
      x.quadraticCurveTo((bx + ex) / 2 + nx, (by + ey) / 2 + ny, ex, ey); x.quadraticCurveTo((bx + ex) / 2 - nx * 0.3, (by + ey) / 2 - ny * 0.3, bx, by); x.fill();
    }
    x.restore();
    // 髪 (背面)
    const sway = Math.sin(t * 0.9) * 8 * S, hx = cx, hy = cy - 222 * S;
    x.fillStyle = (() => { const q = x.createLinearGradient(hx, hy - 40 * S, hx, hy + 260 * S); q.addColorStop(0, '#fff2c0'); q.addColorStop(0.5, '#f2cf7a'); q.addColorStop(1, 'rgba(240,200,110,0)'); return q; })();
    x.beginPath(); x.moveTo(hx - 30 * S, hy - 10 * S); x.bezierCurveTo(hx - 80 * S + sway, hy + 80 * S, hx - 70 * S + sway * 2, hy + 180 * S, hx - 110 * S + sway * 3, hy + 260 * S);
    x.lineTo(hx + 110 * S + sway * 3, hy + 260 * S); x.bezierCurveTo(hx + 70 * S + sway * 2, hy + 180 * S, hx + 80 * S + sway, hy + 80 * S, hx + 30 * S, hy - 10 * S); x.closePath(); x.fill();
    // ドレス
    const dg = x.createLinearGradient(cx, cy - 180 * S, cx, cy + 260 * S); dg.addColorStop(0, '#ffffff'); dg.addColorStop(0.35, '#fff3d6'); dg.addColorStop(0.7, 'rgba(255,226,160,0.85)'); dg.addColorStop(1, 'rgba(255,210,140,0)');
    x.save(); x.shadowColor = 'rgba(255,230,160,0.9)'; x.shadowBlur = 40 * S; x.fillStyle = dg; x.beginPath();
    x.moveTo(cx - 10 * S, cy - 190 * S); x.lineTo(cx - 40 * S, cy - 168 * S); x.quadraticCurveTo(cx - 30 * S, cy - 110 * S, cx - 22 * S, cy - 70 * S);
    x.bezierCurveTo(cx - 60 * S, cy + 20 * S, cx - 120 * S, cy + 140 * S, cx - 150 * S, cy + 250 * S);
    for (let i = 0; i <= 8; i++) { const u = i / 8, wx = cx - 150 * S + u * 300 * S, wy = cy + 250 * S + Math.sin(u * 12 + t * 2) * 10 * S; x.lineTo(wx, wy); }
    x.bezierCurveTo(cx + 120 * S, cy + 140 * S, cx + 60 * S, cy + 20 * S, cx + 22 * S, cy - 70 * S); x.quadraticCurveTo(cx + 30 * S, cy - 110 * S, cx + 40 * S, cy - 168 * S); x.lineTo(cx + 10 * S, cy - 190 * S); x.closePath(); x.fill(); x.restore();
    // 腕
    x.strokeStyle = '#fff6ea'; x.lineCap = 'round'; x.lineWidth = 11 * S;
    for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(cx + sd * 36 * S, cy - 160 * S); x.quadraticCurveTo(cx + sd * 80 * S, cy - 90 * S, cx + sd * 120 * S, cy - 50 * S + Math.sin(t + sd) * 4 * S); x.stroke(); }
    // 金の装飾
    x.strokeStyle = '#e8b84a'; x.lineWidth = 3 * S; x.beginPath(); x.moveTo(cx - 22 * S, cy - 72 * S); x.quadraticCurveTo(cx, cy - 60 * S, cx + 22 * S, cy - 72 * S); x.stroke();
    x.fillStyle = '#7fe8ff'; x.beginPath(); x.moveTo(cx, cy - 120 * S); x.lineTo(cx + 9 * S, cy - 106 * S); x.lineTo(cx, cy - 92 * S); x.lineTo(cx - 9 * S, cy - 106 * S); x.closePath(); x.fill();
    // 頭
    x.fillStyle = '#fff1e6'; x.beginPath(); x.ellipse(hx, hy, 25 * S, 29 * S, 0, 0, 6.283); x.fill();
    x.fillStyle = '#f6d58a'; x.beginPath(); x.ellipse(hx, hy - 9 * S, 28 * S, 25 * S, 0, Math.PI * 1.02, Math.PI * 1.98); x.fill();
    x.beginPath(); x.moveTo(hx - 28 * S, hy - 8 * S); x.quadraticCurveTo(hx - 10 * S, hy + 2 * S, hx - 2 * S, hy - 14 * S); x.quadraticCurveTo(hx + 12 * S, hy + 4 * S, hx + 28 * S, hy - 8 * S); x.lineTo(hx + 28 * S, hy - 18 * S); x.lineTo(hx - 28 * S, hy - 18 * S); x.fill();
    x.fillStyle = '#5ab8e8'; for (const sd of [-1, 1]) { x.beginPath(); x.ellipse(hx + sd * 9 * S, hy + 4 * S, 3.6 * S, 5 * S, 0, 0, 6.283); x.fill(); }
    // 光輪
    x.save(); x.shadowColor = '#ffe08a'; x.shadowBlur = 25 * S; x.strokeStyle = '#ffe8a8'; x.lineWidth = 4 * S; x.beginPath(); x.ellipse(hx, hy - 48 * S + Math.sin(t * 1.5) * 3 * S, 40 * S, 10 * S, 0, 0, 6.283); x.stroke(); x.restore();
    // 浮遊する結晶
    for (const sh of art.shards) {
      const a = sh.a + t * 0.12, px = cx + Math.cos(a) * sh.d * Wd * 0.9, py = cy - 60 * S + sh.y * Hd + Math.sin(t * 0.8 + sh.a) * 12 * S, sz = sh.s * Hd, rot = sh.rot + t * sh.sp;
      const front = Math.sin(a) > -0.2; if (!front && opt.noBack) continue;
      x.save(); x.translate(px, py); x.rotate(rot); x.globalAlpha = front ? 1 : 0.55;
      x.shadowColor = 'rgba(160,240,255,0.9)'; x.shadowBlur = 20 * S;
      const pts = []; for (let i = 0; i < sh.sides; i++) { const an = i / sh.sides * 6.283, rr = sz * (i % 2 ? 0.55 : 1) * (i === 0 ? 1.6 : 1); pts.push([Math.cos(an) * rr * 0.6, Math.sin(an) * rr]); }
      for (let i = 0; i < pts.length; i++) { const p0 = pts[i], p1 = pts[(i + 1) % pts.length]; const gg = x.createLinearGradient(0, 0, p0[0], p0[1]); gg.addColorStop(0, i % 2 ? '#fff6d0' : '#f2c84a'); gg.addColorStop(1, i % 2 ? '#7fe0d8' : '#c8963a'); x.fillStyle = gg; x.beginPath(); x.moveTo(0, 0); x.lineTo(p0[0], p0[1]); x.lineTo(p1[0], p1[1]); x.closePath(); x.fill(); }
      x.restore();
    }
    x.globalAlpha = 1;
    // ビネット
    g = x.createRadialGradient(cx, Hd / 2, Hd * 0.3, cx, Hd / 2, Math.max(Wd, Hd) * 0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)'); x.fillStyle = g; x.fillRect(0, 0, Wd, Hd);
  };
  ST.licModal = function () {
    const el = h(`<div class="modal"><div class="modal-box">${PS.UI.LICENSE_HTML}<button class="btn yes">閉じる</button></div></div>`);
    $('#ui').appendChild(el); el.querySelector('button').onclick = () => el.remove();
  };

  // ================= タイトル =================
  ST.titleShow = function () {
    ST.mode = 'title';
    const save = G.hasSave() && G.loadSave();
    const el = h(`<div class="screen title"><div class="tt-logo">
      <div class="tt-en">PERSONALITY STARS</div><div class="tt-jp"><span>パーソナリティー</span><span>スターズ</span></div><div class="tt-orn"><i></i><b>✦</b><i></i></div><div class="tt-sub">― 転生者と七つの人格 ―</div></div>
      <div class="tt-start">${PS.isMobile ? 'タップしてスタート' : 'クリックしてスタート'}</div>
      <div class="tt-menu hidden"></div>
      <div class="tt-left"><button class="tt-ic" data-a="news" title="お知らせ">📰${PS.UI.newsUnread() ? '<em class="tt-new">NEW</em>' : ''}</button><button class="tt-ic" data-a="settings" title="設定">⚙</button><button class="tt-ic" data-a="lic" title="ライセンス">📜</button>${save ? '<button class="tt-ic" data-a="wipe" title="データ削除">🗑</button>' : ''}</div>
      <div class="tt-beta"><b>${D.VERSION_LABEL}</b>正式リリース版</div>
      <div class="tt-foot"><span>© 2026 YUKI GROUP. All Rights Reserved.</span><span>本作品はフィクションです。実在の人物・団体・事件とは関係ありません。</span><span>${D.VERSION_LABEL}（正式版）</span><a href="#" class="tt-licl">ライセンス表示</a></div></div>`);
    $('#ui').appendChild(el); ST.title = el;
    const startClick = (e) => {
      if (e.target.closest('.tt-left,.tt-menu,.tt-foot,.tt-mob,.tt-lang,.mg-modal')) return;
      PS.Audio.init(); PS.Audio.play('title'); PS.Audio.sfxPlay('uiOpen');
      if (save && save.pers) {
        el.querySelector('.tt-start').classList.add('hidden'); const m = el.querySelector('.tt-menu'); m.classList.remove('hidden');
        m.innerHTML = `<button class="btn big cont">つづきから<small>${save.name}　Lv.${save.level}　${D.PERS[save.pers].name}${save.chapter >= 4 || save.final3 ? '　第四章' : save.chapter >= 3 || save.final2 ? '　第三章' : (save.chapter >= 2 || save.final) ? '　第二章' : ''}</small></button><button class="btn big ghost newg">はじめから</button>`;
        m.querySelector('.cont').onclick = (ev) => { ev.stopPropagation(); ST.leaveTitle(() => G.startGame(save, false)); };
        m.querySelector('.newg').onclick = (ev) => { ev.stopPropagation(); ST.modalConfirm('はじめから遊びますか？<br><small>現在のセーブデータは上書きされます</small>', () => { if (PS.World.expanded) { G.deleteSave(); G.reloadWith('newgame'); return; } ST.leaveTitle(() => ST.storyStart()); }); };
      } else ST.leaveTitle(() => ST.storyStart());
      el.removeEventListener('click', startClick);
    };
    el.addEventListener('click', startClick);
    $$('.tt-ic', el).forEach(b => b.onclick = (e) => {
      e.stopPropagation(); const a = b.dataset.a; PS.Audio.init();
      if (a === 'lic') ST.licModal();
      if (a === 'news') { PS.UI.newsModal(); const nb = b.querySelector('.tt-new'); if (nb) nb.remove(); }
      if (a === 'settings') ST.titleSettings();
      if (a === 'wipe') ST.modalConfirm('セーブデータを削除しますか？', () => { G.deleteSave(); location.reload(); });
    });
    el.querySelector('.tt-licl').onclick = (e) => { e.preventDefault(); e.stopPropagation(); ST.licModal(); };
  };
  ST.titleSettings = function () { PS.UI.settingsMenu(); };
  ST.modalConfirm = function (msg, yes) {
    const el = h(`<div class="modal"><div class="modal-box sm"><div class="cf-msg">${msg}</div><div class="cf-btns"><button class="btn ghost no">キャンセル</button><button class="btn yes">確認</button></div></div></div>`);
    $('#ui').appendChild(el); el.querySelector('.no').onclick = (e) => { e.stopPropagation(); el.remove(); }; el.querySelector('.yes').onclick = (e) => { e.stopPropagation(); el.remove(); yes(); };
  };
  ST.leaveTitle = function (cb) { const el = ST.title; el.classList.add('out'); const fb = $('.fadeblack'); fb.style.transition = 'opacity .9s'; fb.style.opacity = 1; setTimeout(() => { el.remove(); ST.mode = 'none'; cb(); setTimeout(() => { fb.style.opacity = 0; }, 100); }, 950); };

  // ================= あらすじ映像 =================
  ST.storyStart = function () {
    G.state = 'story'; ST.mode = 'none'; PS.Audio.stop();
    const el = h(`<div class="screen story"><canvas class="sc"></canvas><div class="lb top"></div><div class="lb bot"></div><div class="cap"></div><button class="sk-btn">スキップ ▶▶</button>
      <div class="dialog st-dlg hidden"><div class="dg-name"></div><div class="dg-text"></div><div class="dg-next">▼</div><div class="dg-choices"></div></div></div>`);
    $('#ui').appendChild(el); ST.st = el; ST.sc = el.querySelector('.sc'); ST.scene = 'city'; ST.sT = 0; ST.flash = 0; ST.data = { name: '', gender: 'f' };
    ST.rain = []; for (let i = 0; i < 260; i++) ST.rain.push({ x: Math.random(), y: Math.random(), v: 0.8 + Math.random() * 0.8 });
    ST.clouds = []; for (let i = 0; i < 26; i++) ST.clouds.push({ x: Math.random(), y: 0.55 + Math.random() * 0.45, s: 0.08 + Math.random() * 0.14, v: 0.003 + Math.random() * 0.01 });
    ST.art = ST.makeArt();
    el.querySelector('.sk-btn').onclick = (e) => { e.stopPropagation(); ST.skipStory(); };
    el.addEventListener('click', () => { if (ST.waitClick) { const f = ST.waitClick; ST.waitClick = null; f(); } else if (ST.dlg) ST.dlgNext(); });
    ST.loopStory();
    ST.run();
  };
  ST.loopStory = function () {
    if (!ST.st) return; requestAnimationFrame(ST.loopStory);
    const now = performance.now(); const dt = Math.min(0.05, (now - (ST._lt || now)) / 1000); ST._lt = now; ST.sT += dt;
    ST.drawStory(dt);
  };
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  ST.caption = async function (text, ms) {
    const c = ST.st.querySelector('.cap'); c.innerHTML = `<span>${text}</span>`; c.classList.remove('out'); c.classList.add('in');
    await wait(ms || 3200); c.classList.add('out'); await wait(700); c.classList.remove('in');
  };
  ST.say = function (name, lines) { return new Promise(res => { ST.dlg = { name, lines, i: 0, res }; ST.st.querySelector('.st-dlg').classList.remove('hidden'); ST.dlgShow(); }); };
  ST.choose = function (name, line, choices) { return new Promise(res => { ST.dlg = { name, lines: [line], i: 0, choices, res }; ST.st.querySelector('.st-dlg').classList.remove('hidden'); ST.dlgShow(); }); };
  ST.dlgShow = function () {
    const d = ST.dlg, el = ST.st.querySelector('.st-dlg'), tx = el.querySelector('.dg-text'), line = d.lines[d.i].replace(/\{name\}/g, ST.data.name).replace(/\{pers\}/g, ST.data.persName || '');
    el.querySelector('.dg-name').textContent = d.name; el.querySelector('.dg-choices').innerHTML = ''; tx.textContent = ''; clearInterval(ST._ti); let k = 0; d.typing = true;
    ST._ti = setInterval(() => { k += 1; tx.textContent = line.slice(0, k); if (k % 3 === 0) PS.Audio.sfxPlay('ui', 0.15); if (k >= line.length) { clearInterval(ST._ti); d.typing = false; if (d.choices) ST.dlgChoices(); } }, 34);
    d.full = line;
  };
  ST.dlgChoices = function () {
    const d = ST.dlg, c = ST.st.querySelector('.dg-choices'); d.cs = true;
    c.innerHTML = d.choices.map((t, i) => `<button class="dgc" data-i="${i}"><i>💬</i>${t}</button>`).join('');
    $$('.dgc', c).forEach(b => b.onclick = (e) => { e.stopPropagation(); PS.Audio.sfxPlay('ui'); const r = d.res; ST.dlg = null; ST.st.querySelector('.st-dlg').classList.add('hidden'); r(+b.dataset.i); });
  };
  ST.dlgNext = function () {
    const d = ST.dlg; if (!d) return;
    if (d.typing) { clearInterval(ST._ti); ST.st.querySelector('.dg-text').textContent = d.full; d.typing = false; if (d.choices) ST.dlgChoices(); return; }
    if (d.cs) return;
    if (d.i < d.lines.length - 1) { d.i++; ST.dlgShow(); } else { const r = d.res; ST.dlg = null; ST.st.querySelector('.st-dlg').classList.add('hidden'); r(); }
  };
  ST.run = async function () {
    const tok = ST.tok = {};
    const alive = () => ST.tok === tok;
    PS.Audio.play('night');
    await wait(800); if (!alive()) return;
    await ST.caption('――それは、いつもと変わらない雨の帰り道だった。', 3400); if (!alive()) return;
    await ST.caption('信号が青に変わり、一歩を踏み出した、その瞬間――', 3000); if (!alive()) return;
    ST.scene = 'lights'; ST.sT = 0; PS.Audio.sfxPlay('boom', 0.3);
    await wait(1600); if (!alive()) return;
    ST.flash = 1; ST.scene = 'white'; PS.Audio.stop(); PS.Audio.sfxPlay('boom', 0.8);
    await wait(1400); if (!alive()) return;
    await ST.caption('まばゆい光と、遠のいていく音。', 2800); if (!alive()) return;
    await ST.caption('……そして、静寂。', 2400); if (!alive()) return;
    ST.scene = 'heaven'; ST.sT = 0; PS.Audio.play('heaven');
    await wait(2600); if (!alive()) return;
    await ST.say('？？？', ['……目が覚めましたか？', 'ここは天界。命を終えた魂が、次の行き先を選ぶ場所です。', '私はステラ。迷える魂を導く者。', 'あなたのお名前を、教えていただけますか？']); if (!alive()) return;
    ST.data.name = await ST.askName(); if (!alive()) return;
    await ST.say('ステラ', ['{name}さん……素敵なお名前ですね。']); if (!alive()) return;
    const g = await ST.choose('ステラ', 'あなたの魂のかたちは――', ['男性', '女性']); ST.data.gender = g === 0 ? 'm' : 'f'; ST.data.genderSet = true; if (!alive()) return;
    await ST.say('ステラ', ['{name}さん。あなたには、異世界へ転生する資格があります。', '異世界〈ステラリア〉。そこは今、五つの迷宮からあふれ出す魔物によって、平和を失いかけています。', 'どうか、あなたの力で、あの世界を救ってはくれませんか？']); if (!alive()) return;
    const c = await ST.choose('ステラ', '転生を、望みますか？', ['転生する', '……少し考えさせて']); if (!alive()) return;
    if (c === 1) { await ST.say('ステラ', ['迷うのも無理はありません。突然のことですものね。', 'でも……あなたならきっと大丈夫。私には、わかるのです。']); if (!alive()) return; }
    await ST.say('ステラ', ['ありがとうございます。ただし――転生には、ひとつだけ【条件】があります。', 'あなたの魂に【人格】をひとつ、刻むこと。', '人格はあなたに力を与えますが、同時に枷にもなります。そして、一度刻んだ人格は、二度と変えることはできません。', 'さあ、あなたの人格を選んでください。']); if (!alive()) return;
    const pers = await ST.selectPersonality(); if (!alive()) return;
    ST.data.pers = pers; ST.data.persName = D.PERS[pers].name;
    ST.data.sups = await ST.selectSupports(pers); if (!alive()) return;
    ST.scene = 'heaven';
    await ST.say('ステラ', ['【{pers}】の人格……あなたらしい選択ですね。', 'それでは、いってらっしゃい、{name}さん。', 'あなたの旅路に、星の導きがあらんことを――']); if (!alive()) return;
    ST.scene = 'warp'; ST.sT = 0; PS.Audio.sfxPlay('waypoint');
    await wait(2600); if (!alive()) return;
    ST.finishStory();
  };
  ST.skipStory = function () {
    if (ST.data.pers) return ST.finishStory();
    ST.tok = null; clearInterval(ST._ti); ST.dlg = null;
    ST.st.querySelector('.st-dlg').classList.add('hidden'); ST.st.querySelector('.cap').classList.remove('in');
    ST.scene = 'heaven';
    (async () => {
      const tok = ST.tok = {};
      if (!ST.data.name) ST.data.name = await ST.askName();
      if (ST.tok !== tok) return;
      if (!ST.data.genderSet) { const g = await ST.choose('ステラ', 'あなたの魂のかたちは――', ['男性', '女性']); ST.data.gender = g === 0 ? 'm' : 'f'; }
      const pers = await ST.selectPersonality(); ST.data.pers = pers; ST.data.persName = D.PERS[pers].name;
      ST.data.sups = await ST.selectSupports(pers);
      ST.finishStory();
    })();
  };
  ST.askName = function () {
    return new Promise(res => {
      const el = h(`<div class="modal namebox"><div class="modal-box sm"><div class="nb-t">あなたの名前</div><input class="nb-in" maxlength="10" placeholder="旅人" autocomplete="off"><div class="nb-n">10文字まで</div><div class="cf-btns"><button class="btn yes">決定</button></div></div></div>`);
      ST.st.appendChild(el); const inp = el.querySelector('input'); setTimeout(() => inp.focus(), 50);
      const ok = (e) => { e && e.stopPropagation(); const v = (inp.value || '').trim().slice(0, 10) || '旅人'; el.remove(); PS.Audio.sfxPlay('ui'); res(v); };
      el.querySelector('.yes').onclick = ok; inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) ok(e); e.stopPropagation(); });
      el.addEventListener('click', e => e.stopPropagation());
    });
  };
  ST.drawStory = function (dt) {
    const cv = ST.sc, dpr = Math.min(2, window.devicePixelRatio || 1), Wd = cv.clientWidth * dpr, Hd = cv.clientHeight * dpr;
    if (!cv.clientWidth) return;
    if (cv.width !== Wd || cv.height !== Hd) { cv.width = Wd; cv.height = Hd; }
    const x = cv.getContext('2d'), t = ST.sT;
    if (ST.scene === 'city' || ST.scene === 'lights') {
      let g = x.createLinearGradient(0, 0, 0, Hd); g.addColorStop(0, '#0a0f22'); g.addColorStop(0.6, '#1a2240'); g.addColorStop(1, '#0c0e18'); x.fillStyle = g; x.fillRect(0, 0, Wd, Hd);
      const r = PS.rng(3);
      for (let layer = 0; layer < 3; layer++) { x.fillStyle = ['#141a32', '#10152a', '#0b0e1c'][layer]; for (let i = 0; i < 14; i++) { const bw = Wd * (0.06 + r() * 0.08), bh = Hd * (0.25 + r() * 0.4) * (1 - layer * 0.15), bx = (i / 14) * Wd * 1.1 - Wd * 0.05 + layer * 30; x.fillRect(bx, Hd * 0.72 - bh, bw, bh); x.fillStyle = 'rgba(255,214,140,0.5)'; for (let k = 0; k < 18; k++) if (r() < 0.45) x.fillRect(bx + 6 + r() * (bw - 14), Hd * 0.72 - bh + 8 + r() * (bh - 20), 5 * dpr, 7 * dpr); x.fillStyle = ['#141a32', '#10152a', '#0b0e1c'][layer]; } }
      x.fillStyle = '#0a0b12'; x.fillRect(0, Hd * 0.72, Wd, Hd * 0.28);
      for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(255,255,255,0.55)'; x.fillRect(Wd * 0.3 + i * Wd * 0.05, Hd * 0.75, Wd * 0.03, Hd * 0.01); }
      g = x.createRadialGradient(Wd * 0.75, Hd * 0.5, 0, Wd * 0.75, Hd * 0.5, Hd * 0.3); g.addColorStop(0, 'rgba(120,255,160,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, Wd, Hd);
      x.fillStyle = '#6aff9a'; x.beginPath(); x.arc(Wd * 0.75, Hd * 0.5, 9 * dpr, 0, 6.28); x.fill();
      x.strokeStyle = 'rgba(180,200,255,0.35)'; x.lineWidth = 1.2 * dpr;
      for (const d of ST.rain) { d.y += d.v * dt * 1.4; if (d.y > 1) { d.y -= 1; d.x = Math.random(); } x.beginPath(); x.moveTo(d.x * Wd, d.y * Hd); x.lineTo(d.x * Wd - 4 * dpr, d.y * Hd + 18 * dpr); x.stroke(); }
      if (ST.scene === 'lights') { const k = Math.min(1, t / 1.6); g = x.createRadialGradient(Wd * (1.1 - k * 0.25), Hd * 0.78, 0, Wd * (1.1 - k * 0.25), Hd * 0.78, Hd * (0.2 + k * 1.2)); g.addColorStop(0, `rgba(255,255,240,${0.4 + k * 0.6})`); g.addColorStop(1, 'rgba(255,255,200,0)'); x.fillStyle = g; x.fillRect(0, 0, Wd, Hd); }
    } else if (ST.scene === 'white') {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, Wd, Hd);
    } else if (ST.scene === 'heaven' || ST.scene === 'warp') {
      const k = ST.scene === 'warp' ? Math.min(1, t / 2.2) : 0;
      ST.drawArt(cv, ST.sT + 10, ST.art, { c0: '#ffffff', c1: '#fff0c8', c2: '#f2c8d8', c3: '#9ab8e8', c4: '#6a88c8', cy: 0.5 });
      for (const c of ST.clouds) { c.x = (c.x + c.v * dt) % 1.2; const cx = (c.x - 0.1) * Wd, cy = c.y * Hd, s = c.s * Wd; x.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(cx + (i - 2) * s * 0.4, cy - Math.sin(i * 1.3) * s * 0.18, s * (0.35 + (i % 2) * 0.15), 0, 6.28); x.fill(); } }
      const fi = Math.min(1, t / 2.0); if (fi < 1 && ST.scene === 'heaven') { x.fillStyle = `rgba(255,255,255,${1 - fi})`; x.fillRect(0, 0, Wd, Hd); }
      if (k > 0) {
        x.fillStyle = `rgba(10,12,40,${k * 0.9})`; x.fillRect(0, 0, Wd, Hd);
        x.save(); x.translate(Wd / 2, Hd / 2); x.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 160; i++) { const a = i * 2.39996, d0 = ((i * 0.618 + t * (0.6 + k * 2)) % 1), r0 = d0 * d0 * Math.max(Wd, Hd) * 0.8, r1 = r0 * (1 + 0.15 * k); x.strokeStyle = `rgba(${200 + (i % 3) * 20},${220 + (i % 2) * 30},255,${d0 * k})`; x.lineWidth = (1 + d0 * 3) * dpr; x.beginPath(); x.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); x.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); x.stroke(); }
        x.restore();
        if (t > 1.8) { x.fillStyle = `rgba(255,255,255,${Math.min(1, (t - 1.8) / 0.7)})`; x.fillRect(0, 0, Wd, Hd); }
      }
    }
    if (ST.flash > 0) { x.fillStyle = `rgba(255,255,255,${ST.flash})`; x.fillRect(0, 0, Wd, Hd); ST.flash = Math.max(0, ST.flash - dt * 0.4); }
  };

  // ================= 人格選択 =================
  ST.selectPersonality = function () {
    return new Promise(res => {
      G.state = 'select'; ST.mode = 'preview'; ST.st.classList.add('see3d'); PS.Audio.play('heaven');
      const el = h(`<div class="psel"><div class="ps-head"><span>✦</span>人格を選択してください<small>選んだ人格は二度と変えられません</small></div>
        <div class="ps-list">${D.PERS_ORDER.map(k => { const P = D.PERS[k]; return `<button class="ps-it" data-k="${k}" style="--pc:${P.color}"><span class="ps-ic">${P.icon}</span><span class="ps-n">${P.name}<small>${P.en}</small></span></button>`; }).join('')}</div>
        <div class="ps-det"></div><div class="ps-go"><button class="btn big yes">この人格で転生する</button></div><div class="ps-drag">ドラッグでキャラクターを回転</div></div>`);
      ST.st.appendChild(el);
      let cur = null;
      const show = (k) => {
        cur = k; const P = D.PERS[k], w = D.W[P.start];
        $$('.ps-it', el).forEach(b => b.classList.toggle('on', b.dataset.k === k)); PS.Audio.sfxPlay('ui');
        const bar = (v, mx) => `<div class="pbar"><i style="width:${Math.min(100, v / mx * 100)}%"></i></div>`;
        el.querySelector('.ps-det').innerHTML = `<div class="pd-n" style="color:${P.color}">${P.icon} ${P.name}<small>${P.en}</small></div><p class="pd-d">${P.desc}</p>
          <div class="pd-st"><div><span>HP</span>${bar(P.hp, 2100)}<b>${P.hp}</b></div><div><span>攻撃力</span>${bar(P.atk, 600)}<b>${P.atk}</b></div><div><span>防御力</span>${bar(P.def, 480)}<b>${P.def}</b></div><div><span>移動速度</span>${bar(P.spd, 1.3)}<b>x${P.spd}</b></div></div>
          <div class="pd-md"><div class="m"><h4>メリット</h4><ul>${P.merit.map(m => '<li>' + m + '</li>').join('')}</ul></div><div class="dm"><h4>デメリット</h4><ul>${P.demerit.map(m => '<li>' + m + '</li>').join('')}</ul></div></div>
          <div class="pd-w">初期武器：<b>${w.name}</b>　装備可能：${P.weapons.map(t => ({ sword: '剣', axe: '斧', staff: '杖' }[t])).join('・')}</div>
          <div class="pd-w">${k === 'awakener' ? 'スキル：なし（覚醒で戦う）' : 'スキル習得：Lv.' + P.every + 'ごと'}</div>`;
        const look = Object.assign({ gender: ST.data.gender, hair: ST.data.gender === 'f' ? '#f2d58a' : '#3d3040', skin: '#ffe2cf' }, P.look, { weapon: Object.assign({ type: w.type }, w.look) });
        const model = PS.makeModel('preview:' + k + ':' + ST.data.gender, () => ({ mb: PS.buildHumanoid(look), bones: PS.HB, anim: PS.animHuman }));
        const yaw = ST.previewModel ? ST.previewModel.yaw : 0.3;
        ST.previewModel = { model, rig: new PS.Rig(PS.HB), mat: PS.M4.create(), yaw, wing: k === 'flyer', emis: k === 'awakener' ? [2, 0.6, 0.8] : null };
        G.fx = []; G.pillarFX(0, 2000, 0, 1.1, 5, PS.hexRGB(P.color).map(v => v * 0.5), 1.2); G.emit(30, { x: 0, y: 2001, z: 0, color: P.color, vs: 3, vy: 2, size: 0.15, life: 1.2, kind: 1 });
      };
      $$('.ps-it', el).forEach(b => b.onclick = (e) => { e.stopPropagation(); show(b.dataset.k); });
      show('adventurer');
      let drag = null;
      const gl = document.getElementById('gl');
      const dn = (e) => { drag = e.clientX; }, mv = (e) => { if (drag != null && ST.previewModel) { ST.previewModel.yaw += (e.clientX - drag) * 0.01; drag = e.clientX; } }, up = () => { drag = null; };
      el.addEventListener('pointerdown', (e) => { if (!e.target.closest('button,.ps-det')) dn(e); }); window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      const spin = setInterval(() => { if (drag == null && ST.previewModel) ST.previewModel.yaw += 0.004; }, 16);
      el.querySelector('.ps-go .btn').onclick = (e) => {
        e.stopPropagation();
        ST.modalConfirmIn(ST.st, `【${D.PERS[cur].name}】で転生しますか？<br><small>人格は二度と変えることはできません</small>`, () => {
          clearInterval(spin); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
          el.remove(); ST.st.classList.remove('see3d'); ST.mode = 'none'; G.state = 'story'; ST.previewModel = null; res(cur);
        });
      };
    });
  };
  // ================= サポートキャラ選択（人格を選んだ直後） =================
  ST.selectSupports = function (pers) {
    return new Promise(res => {
      const pick = [];
      const el = h(`<div class="ssel"><div class="ss-box"><div class="ss-head"><span>✦</span>旅のお供を選んでください<small>サポートキャラは2体まで連れて行けます（あとから「仲間」画面で変更できます）</small></div>
        <div class="ss-pers" style="--pc:${D.PERS[pers].color}"><span class="ps-ic">${D.PERS[pers].icon}</span>あなたの人格：<b>${D.PERS[pers].name}</b></div>
        <div class="ss-list">${D.SUPPORT_ORDER.map(id => { const S = D.SUPPORT[id], c = D.compatOf(id, pers), C2 = D.COMPAT[c]; return `<button class="ss-it" data-id="${id}" style="--sc:${S.color}"><span class="ss-ic">${S.icon}</span><span class="ss-nm">${S.name}<small>${S.en}</small></span><span class="ss-cp" style="color:${C2.c}">${C2.name}</span><span class="ss-ef">${D.supEffect(id, pers)}</span><i class="ss-ck">✓</i></button>`; }).join('')}</div>
        <div class="ss-desc"></div>
        <div class="ss-btns"><button class="btn ghost skip">選ばずに進む</button><button class="btn yes go">この2体で旅立つ</button></div></div></div>`);
      ST.st.appendChild(el); el.addEventListener('click', e => e.stopPropagation());
      const refresh = (focus) => {
        $$('.ss-it', el).forEach(b => b.classList.toggle('on', pick.includes(b.dataset.id)));
        const go = el.querySelector('.go'); go.textContent = pick.length ? (pick.length === 2 ? 'この2体で旅立つ' : 'この1体で旅立つ') : 'お供を選んでください'; go.disabled = !pick.length;
        if (focus) { const S = D.SUPPORT[focus]; el.querySelector('.ss-desc').innerHTML = `<b style="color:${S.color}">${S.icon} ${S.name}</b>　${S.desc}<div class="ss-eff">${S.effect}</div>`; }
      };
      $$('.ss-it', el).forEach(b => b.onclick = () => {
        const id = b.dataset.id; PS.Audio.sfxPlay('ui');
        if (pick.includes(id)) pick.splice(pick.indexOf(id), 1); else { if (pick.length >= D.SUPPORT_MAX) pick.shift(); pick.push(id); }
        refresh(id);
      });
      refresh(D.SUPPORT_ORDER[0]);
      const done = (v) => { el.classList.add('out'); setTimeout(() => el.remove(), 400); PS.Audio.sfxPlay('waypoint'); res(v); };
      el.querySelector('.go').onclick = () => { if (pick.length) done(pick.slice()); };
      el.querySelector('.skip').onclick = () => done([]);
    });
  };
  ST.modalConfirmIn = function (host, msg, yes) {
    const el = h(`<div class="modal"><div class="modal-box sm"><div class="cf-msg">${msg}</div><div class="cf-btns"><button class="btn ghost no">やめる</button><button class="btn yes">転生する</button></div></div></div>`);
    host.appendChild(el); el.addEventListener('click', e => e.stopPropagation());
    el.querySelector('.no').onclick = () => el.remove(); el.querySelector('.yes').onclick = () => { el.remove(); PS.Audio.sfxPlay('waypoint'); yes(); };
  };
  ST.finishStory = function () {
    ST.tok = null; const d = ST.data;
    const save = G.newSave(d.name || '旅人', d.gender || 'f', d.pers || 'adventurer');
    if (d.sups && d.sups.length) { const ids = d.sups.slice(0, D.SUPPORT_MAX); save.party = { list: [], active: [], sups: ids.slice(), supports: ids.slice(), support: ids[0] }; }
    G.deleteSave();
    const el = ST.st; ST.st = null; el.classList.add('out'); setTimeout(() => el.remove(), 900);
    ST.mode = 'none';
    G.startGame(save, true); PS.Audio.play('plains');
    PS.UI.regionTitle('異世界ステラリア', '星風平原');
    G.writeSave(true);
  };

  // ================= チュートリアル =================
  const TUT = [
    { t: '移動', pc: 'W・A・S・D キーで移動しよう', mb: '画面の左側をドラッグして移動しよう', ok: (s) => s.moved > 10 },
    { t: '視点', pc: 'マウスを動かして視点を回そう（画面をクリックするとマウスが固定されます。Esc でメニュー）', mb: '画面の右側をドラッグして視点を回そう', ok: (s) => s.look > 1.5 },
    { t: 'ダッシュ', pc: 'Shift（または右クリック）でダッシュ！ 長押しで走り続けられます', mb: '右下の ➤ ボタンでダッシュ！ 長押しで走り続けられます', ok: (s) => s.dash },
    { t: 'ジャンプ', pc: 'Space でジャンプしよう', mb: '右下の ▲ ボタンでジャンプしよう', ok: (s) => s.jump },
    { t: '戦闘', pc: '目の前に現れたスライムを倒そう！ 左クリックで通常攻撃（連打でコンボ）', mb: '目の前に現れたスライムを倒そう！ 剣のボタンで攻撃', ok: (s) => s.kills >= 3, start: () => ST.tutSlimes() },
    { t: '人格の力', special: true },
    { t: '採集', pc: '近くに咲いている「スイートフラワー」に近づき、F キーで拾おう', mb: '近くの「スイートフラワー」に近づき、右側の表示をタップして拾おう', ok: (s) => s.picked },
    { t: '回復', pc: 'G キーで食べ物を食べるとHPが回復します（HPが減っているときに使えます）', mb: '右下の食べ物ボタンでHPを回復できます', ok: (s) => s.time > 6 },
    { t: 'ワープポイント', pc: '近くの青い結晶「ワープポイント」に近づき、F キーで解放しよう', mb: '近くの青い結晶「ワープポイント」に近づいて解放しよう', ok: (s) => s.wp },
    { t: '地図', pc: 'M キーで地図を開いてみよう（解放したワープポイントへワープできます）', mb: '右上の羅針盤アイコンで地図を開こう', ok: (s) => s.map },
    { t: '村へ向かおう', pc: '星のマーカー（✦）を目指して、スターリーフ村の長老マルクに会いに行こう！', mb: '星のマーカー（✦）を目指して、スターリーフ村の長老マルクに会いに行こう！', ok: () => G.save.quests.mq1 && G.save.quests.mq1.st === 'done' }
  ];
  ST.tutorialStart = function () { G.save.tutorial = 0; ST.tutBegin(0); };
  ST.tutBegin = function (i) {
    const s = G.save; s.tutorial = i;
    if (i >= TUT.length) { s.tutorial = 99; $('.tut').classList.add('hidden'); PS.UI.banner('チュートリアル完了', '自由に冒険しよう！', '#9fd0ff'); return; }
    const T = TUT[i]; ST.tst = { moved: 0, look: 0, kills: 0, time: 0, px: G.player.pos.x, pz: G.player.pos.z, yaw: G.cam.yaw };
    let body = PS.isMobile ? T.mb : T.pc;
    if (T.special) {
      const p = s.pers;
      if (p === 'flyer') { body = PS.isMobile ? 'ジャンプ中にもう一度ジャンプボタンを押すと、空を飛べます！' : 'ジャンプ中にもう一度 Space を押すと、空を飛べます！（上昇 Space／下降 Ctrl）'; T.ok = (st) => st.fly; }
      else if (p === 'awakener') { body = PS.isMobile ? '☄ボタンで覚醒しよう！ 覚醒中は全ステータスが2.5倍になります' : 'Z キー（または Q）で覚醒しよう！ 覚醒中は全ステータスが2.5倍になります'; T.ok = (st) => st.awaken; }
      else if (p === 'mage') { body = '魔術者はLv.7で最初の魔法「ファイアボール」を習得します。それまでは通常攻撃の魔法弾で戦おう！'; T.ok = (st) => st.time > 7; }
      else if (p === 'adventurer') { body = '冒険者はLv.5ごとに炎・水・風の剣術を習得します。習得したスキルは E・Q キーで使えます！'; T.ok = (st) => st.time > 7; }
      else if (p === 'healer') { body = '回復者はダメージを受けて3秒後から、HPが自動で回復していきます。Lv.10でスキルを習得！'; T.ok = (st) => st.time > 7; }
      else if (p === 'miner') { body = '採掘者の斧は強力！ 3段目の攻撃で斧を投げます（戻ってくるまで攻撃できません）。Lv.10でスキルを習得！'; T.ok = (st) => st.time > 7; }
      else if (p === 'hearer') { body = '超聴者は耳がとても良い！ 敵の攻撃や飛び道具が迫ると、その方向が画面の縁にマークで表示されます。近くの宝箱の音も聞こえるよ。'; T.ok = (st) => st.time > 8; }
      else if (p === 'prophet') { body = '予言者には数秒後の未来が見える！ 敵の頭上に「次の攻撃」と「命中までの秒数」が表示されます。よく見てかわそう。'; T.ok = (st) => st.time > 8; }
      else if (p === 'honest') { body = '正直者は最初から強く、足も速い！ ただしダンジョンとミッションには制限時間があり、報酬と経験値は少し少なめ。Lv.10でスキルを習得！'; T.ok = (st) => st.time > 8; }
      else { body = '俊足者は誰よりも速く走れます！ 地形を駆け抜けよう。Lv.10でスキルを習得！'; T.ok = (st) => st.time > 7; }
    }
    const el = $('.tut'); el.classList.remove('hidden'); el.querySelector('.tut-h').textContent = T.t; el.querySelector('.tut-b').textContent = body;
    el.querySelector('.tut-p').innerHTML = TUT.map((_, k) => `<i class="${k < i ? 'd' : k === i ? 'c' : ''}"></i>`).join('');
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    if (T.start) T.start();
    if (i === 6 && !W.gathers.some(g => g.tut && !g.taken)) ST.tst.picked = true;
    if (i === 8) { const w = W.WAYPOINTS[0]; if (G.save.waypoints.includes(w.id)) ST.tst.wp = true; }
  };
  ST.tutorialUpdate = function (dt) {
    const s = G.save; if (!s || s.tutorial >= 99 || s.tutorial < 0 || !ST.tst || G.state !== 'play') return;
    const st = ST.tst, p = G.player;
    st.time += dt; st.moved += Math.hypot(p.pos.x - st.px, p.pos.z - st.pz); st.px = p.pos.x; st.pz = p.pos.z;
    st.look += Math.abs(PS.angDiff(st.yaw, G.cam.yaw)); st.yaw = G.cam.yaw;
    if (p.dashT > 0 || p.sprint) st.dash = true; if (p.mode === 'air') st.jump = true;
    if (G.uiOpen === 'map') st.map = true;
    if (TUT[s.tutorial].ok(st)) { PS.Audio.sfxPlay('quest', 0.6); const el = $('.tut'); el.classList.add('done'); const i = s.tutorial; s.tutorial = -1; setTimeout(() => { el.classList.remove('done'); ST.tutBegin(i + 1); }, 900); }
  };
  ST.tutorialEvent = function (type, what) {
    const st = ST.tst; if (!st) return;
    if (type === 'kill') st.kills++;
    if (type === 'collect' && what === 'sweetflower') st.picked = true;
    if (type === 'waypoint') st.wp = true;
    if (type === 'fly') st.fly = true;
    if (type === 'awaken') st.awaken = true;
  };
  ST.tutorialSkip = function () { G.save.tutorial = 99; ST.tst = null; $('.tut').classList.add('hidden'); PS.UI.notify('チュートリアルをスキップしました', 'info'); };
  ST.tutSlimes = function () {
    const p = G.player.pos, f = [Math.sin(G.cam.yaw), Math.cos(G.cam.yaw)];
    for (let i = 0; i < 3; i++) {
      const x = p.x + f[0] * 8 + (i - 1) * 3, z = p.z + f[1] * 8 + (i - 1) * -1.5;
      const e = new G.Enemy('slime_wind', 1, x, z, { summoned: false, aggro: false });
      e.maxHp = e.hp = 520; e.atk = 60; G.enemies.push(e); G.ring(x, e.y + 0.1, z, 2, [0.6, 1, 0.9], 0.6);
    }
  };

  // ================= エンディング =================
  ST.ending = function () {
    G.state = 'ending'; ST.mode = 'ending'; PS.UI.hudShow(false); PS.UI.closeAll(); if (PS.Input.locked) document.exitPointerLock();
    PS.Audio.play('ending');
    const s = G.save;
    const el = h(`<div class="screen ending"><div class="ed-roll">
      <p class="big">異世界ステラリアに、平和が戻った。</p><p>五つの迷宮は静まり、星見山の頂には再び星の光が降り注ぐ。</p><p>人々は、ひとりの転生者の名を語り継ぐだろう。</p><p class="nm">― ${s.name} ―</p><p>【${D.PERS[s.pers].name}】の人格を胸に、世界を救った英雄として。</p>
      <div class="ed-logo"><div class="tt-en">PERSONALITY STARS</div><div class="tt-jp"><span>パーソナリティー</span><span>スターズ</span></div></div>
      <h4>制作</h4><p>YUKI GROUP</p><h4>企画・原案</h4><p>YUKI GROUP</p><h4>エンジン・グラフィック・サウンド</h4><p>Personality Stars Engine (WebGL2 / Web Audio)</p><h4>スペシャルサンクス</h4><p>遊んでくれたすべての転生者のみなさん</p>
      <p class="big">Thank you for playing!</p><p class="sm">© 2026 YUKI GROUP. All Rights Reserved.</p></div>
      <button class="btn big yes ed-btn">第二章へ ▶</button></div>`);
    $('#ui').appendChild(el);
    el.querySelector('.ed-btn').onclick = () => { el.querySelector('.ed-btn').disabled = true; ST.chapterCard(el, '第一章　完', 'そして――眠っていた大地が、目を覚ます。', () => G.toChapter2()); };
  };
  // 章の区切りの演出
  ST.chapterCard = function (host, title, sub, done) {
    const c = h(`<div class="chap-card toblack"><div class="cc-t">${title}</div><div class="cc-s">${sub}</div></div>`);
    (host || $('#ui')).appendChild(c); PS.Audio.sfxPlay('boss', 0.4); G.shake && G.shake(0.6);
    setTimeout(() => c.classList.add('on'), 50); setTimeout(() => { c.classList.add('end'); }, 4200); setTimeout(() => done && done(), 5200);
  };
  // 第二章の幕開け（再起動後）
  ST.chapter2Intro = function () {
    const s = G.save; if (!s || s.ch2intro) return;
    const card = h(`<div class="chap-card full"><div class="cc-k">CHAPTER 2</div><div class="cc-t">第二章　浮上せし大地</div><div class="cc-s">― 天穹の彼方へ ―</div></div>`);
    $('#ui').appendChild(card); setTimeout(() => card.classList.add('on'), 50); PS.Audio.sfxPlay('waypoint');
    setTimeout(() => { card.classList.add('end'); setTimeout(() => card.remove(), 1200); }, 3800);
    setTimeout(() => {
      PS.UI.dialog('ステラの声', D.CH2_INTRO, () => {
        s.ch2intro = true; G.startQuest('mq4'); G.writeSave(true);
        setTimeout(() => PS.UI.notify('島の四方に新たな大地が現れた！ 地図で確認しよう', 'quest'), 1500);
        if (!G.hasSupport('lumi') && !G.hasSupport('fuwarin')) setTimeout(() => PS.UI.notify('スターリーフ村や風車の丘で、小さな妖精が待っているようだ……', 'info'), 4500);
      });
    }, 4400);
  };
  // 第二章のエンディング
  ST.ending2 = function () {
    G.state = 'ending'; ST.mode = 'ending'; PS.UI.hudShow(false); PS.UI.closeAll(); if (PS.Input.locked) document.exitPointerLock();
    PS.Audio.play('ending');
    const s = G.save;
    const el = h(`<div class="screen ending"><div class="ed-roll">
      <p class="big">星喰竜は砕け、天穹の頂に星が還った。</p><p>浮上した四つの大地と、旧き島。そのすべてに、ふたたび穏やかな風が吹く。</p><p class="nm">― ${s.name} ―</p><p>【${D.PERS[s.pers].name}】の人格と、${(s.party && s.party.list.length) ? s.party.list.map(id => D.COMPANIONS[id].name).join('・') + 'たち仲間' : 'ひとりきりの勇気'}とともに。</p>
      <div class="ed-logo"><div class="tt-en">PERSONALITY STARS</div><div class="tt-jp"><span>パーソナリティー</span><span>スターズ</span></div></div>
      <h4>第二章　浮上せし大地</h4><p>${D.VERSION_LABEL}</p><h4>制作</h4><p>YUKI GROUP</p><h4>スペシャルサンクス</h4><p>フワリン　ルミ<br>そして、遊んでくれたすべての転生者のみなさん</p>
      <p class="big">第二章　完</p><p>物語は、まだ続く――</p><p class="sm">© 2026 YUKI GROUP. All Rights Reserved.</p></div>
      <button class="btn big yes ed-btn">第三章へ ▶</button></div>`);
    $('#ui').appendChild(el);
    el.querySelector('.ed-btn').onclick = () => { el.querySelector('.ed-btn').disabled = true; ST.chapterCard(el, '第二章　完', 'そして――世界の果てに、異界の大地が流れ着く。', () => G.toChapter3()); };
  };
  // 第三章の幕開け（再起動後）
  ST.chapter3Intro = function () {
    const s = G.save; if (!s || s.ch3intro) return;
    const card = h(`<div class="chap-card full"><div class="cc-k">CHAPTER 3</div><div class="cc-t">第三章　異界の結晶</div><div class="cc-s">― 世界の果て、流れ着く大地 ―</div></div>`);
    $('#ui').appendChild(card); setTimeout(() => card.classList.add('on'), 50); PS.Audio.sfxPlay('waypoint');
    setTimeout(() => { card.classList.add('end'); setTimeout(() => card.remove(), 1200); }, 3800);
    setTimeout(() => {
      PS.UI.dialog('ステラの声', D.CH3_INTRO, () => {
        s.ch3intro = true; G.startQuest('mq7'); G.writeSave(true);
        setTimeout(() => PS.UI.notify('島の四隅に異界の大地が現れ、島は大きな大陸になった！ 地図で確認しよう', 'quest'), 1500);
      });
    }, 4400);
  };
  // 第三章のエンディング
  ST.ending3 = function () {
    G.state = 'ending'; ST.mode = 'ending'; PS.UI.hudShow(false); PS.UI.closeAll(); if (PS.Input.locked) document.exitPointerLock();
    PS.Audio.play('ending');
    const s = G.save, ps = s.party || { list: [], supports: [] };
    const el = h(`<div class="screen ending"><div class="ed-roll">
      <p class="big">虚晶の王は砕け、異界の結晶は静かに光をおさめた。</p><p>旧き島、浮上した四つの大地、そして世界の果ての異界の大地。そのすべてが、ひとつの大陸になった。</p><p class="nm">― ${s.name} ―</p>
      <p>【${D.PERS[s.pers].name}】の人格と、${ps.list.length ? ps.list.map(id => D.COMPANIONS[id].name).join('・') + 'たち仲間' : 'ひとりきりの勇気'}${(ps.supports || []).length ? '、そして' + ps.supports.map(id => D.SUPPORT[id].name).join('と') : ''}とともに。</p>
      <div class="ed-logo"><div class="tt-en">PERSONALITY STARS</div><div class="tt-jp"><span>パーソナリティー</span><span>スターズ</span></div></div>
      <h4>第三章　異界の結晶</h4><p>${D.VERSION_LABEL}</p><h4>制作</h4><p>YUKI GROUP</p><h4>スペシャルサンクス</h4><p>フワリン　ルミ　アルル　スター　マルン<br>そして、遊んでくれたすべての転生者のみなさん</p>
      <p class="big">第三章　完</p><p>物語は、まだ続く――</p><p class="sm">© 2026 YUKI GROUP. All Rights Reserved.</p></div>
      <button class="btn big yes ed-btn">第四章へ ▶</button></div>`);
    $('#ui').appendChild(el);
    el.querySelector('.ed-btn').onclick = () => {
      el.querySelector('.ed-btn').disabled = true;
      ST.chapterCard(el, '第三章　完', 'そして――天から、四つの光が降りてくる。', () => { el.classList.add('out'); setTimeout(() => el.remove(), 900); ST.mode = 'none'; G.state = 'play'; PS.UI.hudShow(true); G.pickBGM(); if (G.toChapter4) G.toChapter4(); else G.writeSave(true); });
    };
  };
})(window.PS);
