/* Personality Stars - entities.js : プレイヤー・敵・戦闘・パーティクル・エフェクト  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const G = PS.G = PS.G || {}, M4 = PS.M4, D = PS.DATA;
  const rgb = (h) => PS.hexRGB(h);
  G.parts = []; G.fx = []; G.projs = []; G.hz = []; G.enemies = []; G.npcs = [];

  // ================= パーティクル =================
  G.partCap = () => [500, 1800, 4500][PS.Settings.particles];
  G.emit = function (n, o) {
    const cap = G.partCap(); if (PS.Settings.particles === 0) n = Math.ceil(n * 0.35); else if (PS.Settings.particles === 1) n = Math.ceil(n * 0.65);
    const c = o.color ? (Array.isArray(o.color) ? o.color : rgb(o.color)) : [1, 1, 1];
    for (let i = 0; i < n && G.parts.length < cap; i++) {
      const sp = o.spread || 0, vs = o.vs == null ? 2 : o.vs, a = Math.random() * 6.283, u = Math.random() * 2 - 1, s = Math.sqrt(1 - u * u);
      const dir = [s * Math.cos(a), u, s * Math.sin(a)];
      G.parts.push({
        x: o.x + (Math.random() - 0.5) * sp, y: o.y + (Math.random() - 0.5) * sp * (o.flat ? 0.2 : 1), z: o.z + (Math.random() - 0.5) * sp,
        vx: (o.vx || 0) + dir[0] * vs * Math.random(), vy: (o.vy || 0) + dir[1] * vs * Math.random() * (o.flat ? 0.2 : 1), vz: (o.vz || 0) + dir[2] * vs * Math.random(),
        life: (o.life || 0.8) * (0.6 + Math.random() * 0.6), max: 0, size: (o.size || 0.3) * (0.6 + Math.random() * 0.8), r: c[0], g: c[1], b: c[2], a: o.alpha == null ? 1 : o.alpha,
        kind: o.kind || 0, add: o.add !== false, grav: o.grav || 0, drag: o.drag == null ? 1.5 : o.drag, grow: o.grow || 0, a0: o.alpha == null ? 1 : o.alpha
      });
      G.parts[G.parts.length - 1].max = G.parts[G.parts.length - 1].life;
    }
  };
  G.updateParts = function (dt) {
    const P = G.parts; let j = 0;
    for (let i = 0; i < P.length; i++) {
      const p = P[i]; p.life -= dt; if (p.life <= 0) continue;
      const d = Math.exp(-p.drag * dt); p.vx *= d; p.vy *= d; p.vz *= d; p.vy -= p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.size += p.grow * dt;
      const t = p.life / p.max; p.a = p.a0 * Math.min(1, t * 2.5) * (p.fadeIn ? Math.min(1, (1 - t) * 4) : 1);
      P[j++] = p;
    }
    P.length = j;
  };
  // 環境パーティクル (雪・砂・火の粉・木の葉・蛍・光の粒)
  G.ambient = function (dt) {
    if (PS.Settings.particles === 0) return;
    const p = G.player; if (!p) return;
    const rate = PS.Settings.particles === 2 ? 1 : 0.5;
    G._amb = (G._amb || 0) + dt * rate;
    const emitA = (o) => G.emit(1, Object.assign({ x: p.pos.x + (Math.random() - 0.5) * 40, z: p.pos.z + (Math.random() - 0.5) * 40, vs: 0.3, drag: 0.2 }, o));
    while (G._amb > 0.05) {
      G._amb -= 0.05;
      if (G.scene === 'dungeon') { const c = G.dun.theme.light; emitA({ y: p.pos.y + Math.random() * 6, color: c, size: 0.08, life: 4, vy: 0.2, add: true, kind: 0 }); continue; }
      const reg = G.baseRegion ?? G.curRegion, night = G.env.night, gy = PS.World.height(p.pos.x, p.pos.z);
      if (reg === 3) { for (let k = 0; k < 3; k++) emitA({ y: p.pos.y + 4 + Math.random() * 10, color: [0.95, 0.97, 1], size: 0.09, life: 5, vy: -1.4, vx: 0.6, add: false, kind: 0, drag: 0 }); }
      else if (reg === 2) { emitA({ y: gy + 0.5 + Math.random() * 3, color: [0.95, 0.82, 0.6], size: 0.12, life: 2.5, vx: 4, vy: 0.2, add: false, alpha: 0.5, drag: 0 }); }
      else if (reg === 4) { emitA({ y: gy + Math.random() * 4, color: [1, 0.45, 0.15], size: 0.08, life: 3, vy: 1.6, add: true, drag: 0.1, kind: 0 }); if (Math.random() < 0.4) emitA({ y: p.pos.y + 6 + Math.random() * 6, color: [0.3, 0.28, 0.28], size: 0.12, life: 5, vy: -0.6, add: false, alpha: 0.7, drag: 0 }); }
      else if (reg === 1 && Math.random() < 0.5) { emitA({ y: p.pos.y + 6 + Math.random() * 8, color: [0.45, 0.7, 0.25], size: 0.12, life: 6, vy: -0.8, vx: 0.4, add: false, drag: 0.1 }); }
      if (night > 0.5 && (reg === 0 || reg === 1) && Math.random() < 0.6) { const q = { y: gy + 0.5 + Math.random() * 2.5, color: [0.75, 1, 0.4], size: 0.11, life: 4, vy: 0.1, add: true, kind: 0 }; emitA(q); G.parts[G.parts.length - 1] && (G.parts[G.parts.length - 1].fadeIn = true); }
      if (night < 0.3 && reg === 0 && Math.random() < 0.25) emitA({ y: gy + 1 + Math.random() * 3, color: [1, 1, 0.8], size: 0.06, life: 3, vy: 0.3, add: true });
    }
  };

  // ================= VFX =================
  G.slash = function (x, y, z, yaw, o) {
    const c = o.color ? (Array.isArray(o.color) ? o.color : rgb(o.color)) : [1, 1, 1];
    G.fx.push({ mode: 0, x, y, z, yaw, tilt: o.tilt || 0, pitch: o.pitch || 0, arc: [o.a0 == null ? -1.5 : o.a0, o.a1 == null ? 1.5 : o.a1, o.r0 || 0.8, o.r1 || 2.6], color: [c[0], c[1], c[2], 1], t: 0, dur: o.dur || 0.28, add: true });
  };
  G.ring = function (x, y, z, r, color, dur, o) { const c = Array.isArray(color) ? color : rgb(color); G.fx.push({ mode: 3, x, y, z, yaw: 0, size: [r, 1, r], color: [c[0], c[1], c[2], (o && o.a) || 1], t: 0, dur: dur || 0.5, add: true }); };
  G.pillarFX = function (x, y, z, r, h, color, dur) { const c = Array.isArray(color) ? color : rgb(color); G.fx.push({ mode: 2, x, y, z, yaw: 0, size: [r, h, r], color: [c[0], c[1], c[2], 1], t: 0, dur: dur || 0.6, add: true, fade: true }); };
  G.circleFX = function (x, y, z, r, color, dur, spin) { const c = Array.isArray(color) ? color : rgb(color); G.fx.push({ mode: 4, x, y, z, yaw: 0, size: [r, 1, r], color: [c[0], c[1], c[2], 1], t: 0, dur: dur || 1, add: true, shape: [spin || 1, 0, 0, 0], grow: true }); };
  G.updateFX = function (dt) { let j = 0; for (const f of G.fx) { f.t += dt; if (f.t < f.dur || f.persist) G.fx[j++] = f; } G.fx.length = j; };
  G.fxList = function () {
    const out = [];
    for (const f of G.fx) {
      const p = f.t / f.dur, m = M4.compose(new Float32Array(16), f.x, f.y, f.z, f.pitch || 0, f.yaw || 0, f.tilt || 0, 1);
      let prog = p, col = f.color;
      if (f.mode === 2) col = [f.color[0], f.color[1], f.color[2], (f.color[3] == null ? 1 : f.color[3]) * Math.sin(Math.min(1, p) * Math.PI) * 0.9];
      if (f.mode === 4) { prog = Math.min(1, p * 4) * Math.min(1, (1 - p) * 3); }
      out.push({ mode: f.mode, model: m, color: col, prog, arc: f.arc, size: f.size, shape: f.shape, add: f.add });
    }
    // 予兆
    for (const h of G.hz) {
      if (h.owner !== 'e' || h.t >= h.delay || h.noTele) continue;
      const p = h.t / h.delay, m = M4.compose(new Float32Array(16), h.x, h.y + 0.08, h.z, 0, h.yaw || 0, 0, 1);
      let shape, size;
      if (h.shape === 'circle') { shape = [0, 0, 0, 0]; size = [h.r, 1, h.r]; }
      else if (h.shape === 'sector') { shape = [1, h.ang / 2, 0, 0]; size = [h.r, 1, h.r]; }
      else if (h.shape === 'rect') { shape = [2, 0, 0, 0]; size = [h.w / 2, 1, h.len]; }
      else continue;
      out.push({ mode: 1, model: m, color: [1.0, 0.28, 0.18, 0.95], prog: p, size, shape, add: false });
    }
    return out;
  };

  // ================= 戦闘 =================
  const ELC = (el) => (D.ELEM[el] || D.ELEM.phys).c;
  G.inArc = (px, pz, cx, cz, yaw, r, ang, pad) => { const dx = px - cx, dz = pz - cz, d = Math.hypot(dx, dz); if (d > r + pad) return false; if (d < pad + 0.6) return true; return Math.abs(PS.angDiff(yaw, Math.atan2(dx, dz))) <= ang / 2 + Math.atan(pad / d); };
  G.inRect = (px, pz, x0, z0, yaw, len, w, pad) => { const dx = px - x0, dz = pz - z0, fx = Math.sin(yaw), fz = Math.cos(yaw), al = dx * fx + dz * fz, sd = Math.abs(dx * fz - dz * fx); return al > -pad && al < len + pad && sd < w / 2 + pad; };
  G.autoTarget = function (range, front) {
    const p = G.player; let best = null, bs = 1e9;
    for (const e of G.enemies) {
      if (e.dead || e.hidden) continue; const dx = e.x - p.pos.x, dz = e.z - p.pos.z, d = Math.hypot(dx, dz); if (d > range) continue;
      const da = Math.abs(PS.angDiff(G.cam.yaw, Math.atan2(dx, dz)));
      const score = d + da * (front ? 6 : 2);
      if (score < bs) { bs = score; best = e; }
    }
    return best;
  };
  G.critRoll = () => Math.random() < (G.pstat.crit || 0.05);
  G.damageEnemy = function (e, mult, el, o) {
    if (e.dead) return 0; o = o || {};
    const S = G.pstat, lv = G.save.level;
    const red = PS.clamp(e.def / (e.def + 500 + 250 * lv), 0, 0.8);
    let dmg = (o.atk || S.atk) * mult * (1 - red) * (0.95 + Math.random() * 0.1);
    if (o.src) e.threat = o.src;
    let tag = '';
    if (el && el === e.def0.weak) { dmg *= 1.5; tag = 'weak'; }
    else if (el && el !== 'phys' && el === e.def0.el) dmg *= 0.6;
    const crit = G.critRoll(); if (crit) dmg *= 1 + (S.critDmg || 0.5);
    dmg = Math.max(1, Math.round(dmg));
    e.hp -= dmg; e.flash = 0.12; e.aggro = true; e.lastHitT = G.time;
    if (!e.boss && !e.elite && !o.noStagger) { e.hurt = 0.25; if (e.state === 'windup' && Math.random() < 0.35) { e.state = 'chase'; if (e.tele) e.tele.t = 1e9; e.tele = null; } }
    if (o.knock && !e.boss) { const dx = e.x - (o.kx != null ? o.kx : G.player.pos.x), dz = e.z - (o.kz != null ? o.kz : G.player.pos.z), d = Math.hypot(dx, dz) || 1; const k = o.knock * (e.elite ? 0.3 : 1); e.kx += dx / d * k; e.kz += dz / d * k; }
    if (o.status === 'burn' || (el === 'fire' && Math.random() < 0.3)) e.st.burn = 3;
    if (o.status === 'slow' || (el === 'ice' && Math.random() < 0.4)) e.st.slow = 3;
    if (o.stun && !e.boss) e.st.stun = Math.max(e.st.stun, o.stun * (e.elite ? 0.4 : 1));
    if (o.pull) { const P0 = o.src ? o.src.pos : G.player.pos, dx = P0.x - e.x, dz = P0.z - e.z, d = Math.hypot(dx, dz); if (d > 1.5 && !e.boss) { e.kx += dx / d * 3; e.kz += dz / d * 3; } }
    const y = e.y + e.height * 0.7;
    if (PS.Settings.dmgNumbers) PS.UI.dmg(e.x, y, e.z, dmg, ELC(el), crit, tag);
    G.emit(crit ? 14 : 8, { x: e.x, y: y - 0.3, z: e.z, color: ELC(el === 'phys' ? null : el) || '#fff', vs: 7, size: 0.18, life: 0.35, kind: 1, drag: 4 });
    PS.Audio.sfxPlay(crit ? 'crit' : 'hit', 0.8);
    if (crit || mult > 2) { G.hitstop = Math.max(G.hitstop, 0.045); G.shake(0.12); }
    if (e.hp <= 0) G.killEnemy(e);
    return dmg;
  };
  G.hitShape = function (shape, mult, el, o) {
    o = o || {}; let n = 0;
    for (const e of G.enemies) {
      if (e.dead || e.hidden) continue; if (o.hitSet && o.hitSet.has(e)) continue;
      let hit = false; const pad = e.radius * e.scale;
      if (Math.abs(e.y - (shape.y != null ? shape.y : e.y)) > (shape.h || 4) + e.height) continue;
      if (shape.t === 'arc') hit = G.inArc(e.x, e.z, shape.x, shape.z, shape.yaw, shape.r, shape.ang, pad);
      else if (shape.t === 'circle') hit = Math.hypot(e.x - shape.x, e.z - shape.z) < shape.r + pad;
      else if (shape.t === 'rect') hit = G.inRect(e.x, e.z, shape.x, shape.z, shape.yaw, shape.len, shape.w, pad);
      if (hit) { G.damageEnemy(e, mult, el, Object.assign({ kx: shape.x, kz: shape.z }, o)); if (o.hitSet) o.hitSet.add(e); n++; }
    }
    return n;
  };
  // 味方（主人公＋同行中の仲間）。敵の攻撃はすべての味方に当たる
  G.playerAlly = { isPlayer: true, get pos() { return G.player.pos; }, get dead() { return !G.player || G.player.dead; }, radius: 0.4, hit(raw, lv, el, st) { G.damagePlayer(raw, lv, el, st); } };
  G.allies = function () { const a = [G.playerAlly]; if (G.party) for (const c of G.party) if (!c.down && c.present) a.push(c); return a; };
  G.hitAllies = function (test, raw, lv, el, status) { for (const a of G.allies()) if (test(a.pos, a)) a.hit(raw, lv, el, status); };
  G.damagePlayer = function (raw, lv, el, status, src) {
    const p = G.player; if (!p || p.dead || G.state !== 'play') return;
    if (p.iframe > 0) { if (p.perfect !== G.time) { p.perfect = G.time; PS.UI.dmg(p.pos.x, p.pos.y + 1.8, p.pos.z, '回避', '#bff6ff', false, 'miss'); } return; }
    const S = G.pstat, red = PS.clamp(S.def / (S.def + 500 + 250 * lv), 0, 0.8);
    let dmg = Math.max(1, Math.round(raw * (1 - red) * (0.95 + Math.random() * 0.1)));
    p.hp -= dmg; p.sinceHit = 0; p.hurt = 0.3;
    PS.UI.dmg(p.pos.x, p.pos.y + 1.9, p.pos.z, dmg, '#ff4a4a', false, 'player');
    PS.Audio.sfxPlay('hurt', 0.8); G.shake(0.25); PS.UI.hurtFlash();
    if (status === 'freeze' && p.status.freeze <= 0) { p.status.freeze = 2.0; PS.Audio.sfxPlay('freeze'); PS.UI.notify('凍結！ 移動キーを連打して脱出しよう', 'warn'); }
    else if (status && status !== 'freeze') p.status[status] = 4;
    if (p.hp <= 0) { p.hp = 0; G.playerDie(); }
  };
  G.killEnemy = function (e) {
    if (e.dead) return; e.dead = true; e.deadT = 0; e.hp = 0; e.state = 'dead';
    PS.Audio.sfxPlay('die', 0.7);
    G.emit(20, { x: e.x, y: e.y + e.height * 0.5, z: e.z, color: e.def0.el && e.def0.el !== 'phys' ? ELC(e.def0.el) : '#ffffff', vs: 5, size: 0.25, life: 0.9, kind: 0 });
    if (e.summoned) return;
    const exp = Math.round(D.expGain(e.lv) * (e.def0.exp || 1) * G.rewardMul());
    G.addExp(exp);
    const coins = Math.round((10 + e.lv * 12) * (e.def0.exp || 1) * (0.8 + Math.random() * 0.4) * G.rewardMul());
    G.addCoins(coins, true);
    for (const [it, ch] of e.def0.drops) if (Math.random() < ch) G.addItem(it, 1);
    G.questEvent('kill', e.key);
    if (e.spawn) e.spawn.alive--;
    if (e.onDeath) e.onDeath(e);
  };

  // ================= 弾 =================
  G.proj = function (o) { G.projs.push(Object.assign({ t: 0, hit: new Set(), r: 0.6, life: 2, y0: o.y }, o)); };
  G.updateProjs = function (dt) {
    let j = 0; const p = G.player;
    for (const q of G.projs) {
      q.t += dt; let alive = q.t < q.life;
      if (q.homing && q.owner === 'p') { if (!q.tgt || q.tgt.dead) q.tgt = G.autoTarget(25, false); if (q.tgt && q.t > 0.12) { const dx = q.tgt.x - q.x, dz = q.tgt.z - q.z, dy = q.tgt.y + q.tgt.height * 0.5 - q.y, d = Math.hypot(dx, dy, dz) || 1, sp = Math.hypot(q.vx, q.vy, q.vz), k = Math.min(1, dt * 6); q.vx += (dx / d * sp - q.vx) * k; q.vy += (dy / d * sp - q.vy) * k; q.vz += (dz / d * sp - q.vz) * k; } }
      if (q.homing && q.owner === 'e' && q.t < 1.2) { const dx = p.pos.x - q.x, dz = p.pos.z - q.z, dy = p.pos.y + 1 - q.y, d = Math.hypot(dx, dy, dz) || 1, sp = Math.hypot(q.vx, q.vy, q.vz), k = Math.min(1, dt * 1.8); q.vx += (dx / d * sp - q.vx) * k; q.vy += (dy / d * sp - q.vy) * k; q.vz += (dz / d * sp - q.vz) * k; }
      if (q.ret && q.t > q.life * 0.5) { const dx = p.pos.x - q.x, dz = p.pos.z - q.z, dy = p.pos.y + 1.2 - q.y, d = Math.hypot(dx, dy, dz) || 1, sp = Math.hypot(q.vx, q.vy, q.vz); q.vx = dx / d * sp; q.vy = dy / d * sp; q.vz = dz / d * sp; if (!q.back) { q.back = true; q.hit.clear(); } if (d < 1.2) { alive = false; if (q.onReturn) q.onReturn(); } alive = alive && q.t < q.life * 1.8; }
      q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
      if (q.grav) q.vy -= q.grav * dt;
      const gy = G.groundAt(q.x, q.z, q.y);
      if (q.y < gy && !q.ret) { alive = false; if (q.explode) G.projBoom(q); }
      if (G.scene === 'dungeon' && G.collide({ x: q.x, z: q.z }, 0.05, q.y)) { alive = false; if (q.explode) G.projBoom(q); }
      if (alive && q.owner === 'p') {
        for (const e of G.enemies) {
          if (e.dead || q.hit.has(e)) continue;
          const dx = e.x - q.x, dz = e.z - q.z, dy = (e.y + e.height * 0.5) - q.y;
          if (Math.hypot(dx, dz) < q.r + e.radius * e.scale && Math.abs(dy) < e.height * 0.6 + q.r) {
            q.hit.add(e); if (q.explode) { G.projBoom(q); alive = false; break; }
            G.damageEnemy(e, q.mult, q.el, { status: q.status, knock: q.knock || 1.5, kx: q.x - q.vx, kz: q.z - q.vz, atk: q.patk, src: q.src });
            if (!q.pierce) { alive = false; break; }
          }
        }
      } else if (alive && q.owner === 'e') {
        for (const A of G.allies()) {
          const dx = A.pos.x - q.x, dz = A.pos.z - q.z, dy = A.pos.y + 0.9 - q.y;
          if (Math.hypot(dx, dz) < q.r + 0.4 && Math.abs(dy) < 1.1 + q.r) { A.hit(q.atk * q.mult, q.lv, q.el, q.status); alive = false; if (q.explode) G.projBoom(q); break; }
        }
      }
      // 見た目
      const c = q.color || [1, 1, 1];
      if (q.look === 'arrow' || q.look === 'icearrow') G.emit(1, { x: q.x, y: q.y, z: q.z, color: c, vs: 0.1, size: 0.14, life: 0.2, kind: 0 });
      else G.emit(q.trail || 2, { x: q.x, y: q.y, z: q.z, color: c, vs: 0.6, size: q.size || 0.5, life: 0.28, kind: q.look === 'feather' ? 1 : 0, spread: 0.2 });
      if (alive) G.projs[j++] = q;
    }
    G.projs.length = j;
  };
  G.projBoom = function (q) {
    const r = q.explode;
    if (q.owner === 'p') G.hitShape({ t: 'circle', x: q.x, z: q.z, r, y: q.y }, q.mult, q.el, { status: q.status, knock: 4, atk: q.patk, src: q.src });
    else G.hitAllies((P) => Math.hypot(P.x - q.x, P.z - q.z) < r + 0.4 && Math.abs(P.y - q.y) < r + 2, q.atk * q.mult, q.lv, q.el, q.status);
    G.ring(q.x, q.y + 0.1, q.z, r * 1.3, q.color || [1, 0.6, 0.3], 0.4);
    G.emit(24, { x: q.x, y: q.y, z: q.z, color: q.color, vs: 8, size: 0.5, life: 0.6, kind: 0 });
    PS.Audio.sfxPlay('boom', 0.5);
  };

  // ================= ハザード (予兆付き攻撃 / 範囲スキル) =================
  G.hazard = function (o) { G.hz.push(Object.assign({ t: 0, ticks: 1, interval: 0.3, fired: 0 }, o, { y: G.groundAt(o.x, o.z, o.ty != null ? o.ty + 0.7 : undefined) })); };
  G.updateHazards = function (dt) {
    let j = 0; const p = G.player;
    for (const h of G.hz) {
      h.t += dt;
      if (h.owner === 'e' && h.src && h.src.dead && h.t < h.delay) continue;
      if (h.shape === 'ring') {
        const rr = PS.clamp((h.t - h.delay) / h.dur, 0, 1) * h.r;
        if (h.t >= h.delay && !h.hitDone) {
          h.hitSet = h.hitSet || new Set();
          for (const A of G.allies()) { if (h.hitSet.has(A)) continue; const d = Math.hypot(A.pos.x - h.x, A.pos.z - h.z), air = A.pos.y - G.groundAt(A.pos.x, A.pos.z, A.pos.y + 0.7); if (Math.abs(d - rr) < 0.9 && air < 0.7 && Math.abs(A.pos.y - h.y) < 4) { A.hit(h.atk * h.mult, h.lv, h.el, h.status); h.hitSet.add(A); } }
          if (Math.random() < 0.8) for (let k = 0; k < 3; k++) { const a = Math.random() * 6.28; G.emit(1, { x: h.x + Math.cos(a) * rr, y: h.y + 0.3, z: h.z + Math.sin(a) * rr, color: h.color || [1, 0.4, 0.3], vs: 1, size: 0.5, life: 0.4 }); }
        }
        if (h.t < h.delay + h.dur) G.hz[j++] = h; continue;
      }
      if (h.t >= h.delay + h.fired * h.interval && h.fired < h.ticks) {
        h.fired++;
        if (h.owner === 'p') {
          G.hitShape({ t: 'circle', x: h.x, z: h.z, r: h.r, y: h.y, h: 8 }, h.mult, h.el, { status: h.status, knock: 2, stun: h.stun, atk: h.patk, src: h.src2 });
          const c = rgb(ELC(h.el));
          if (h.look === 'meteor') { G.ring(h.x, h.y + 0.1, h.z, h.r * 1.4, c, 0.6); G.emit(40, { x: h.x, y: h.y + 1, z: h.z, color: c, vs: 12, size: 0.8, life: 0.9 }); G.shake(0.35); PS.Audio.sfxPlay('boom'); }
          else { G.pillarFX(h.x, h.y, h.z, h.r * 0.45, 8, c, 0.5); G.ring(h.x, h.y + 0.1, h.z, h.r, c, 0.4); G.emit(12, { x: h.x, y: h.y + 1, z: h.z, color: c, vs: 6, size: 0.4, life: 0.6, spread: h.r }); PS.Audio.sfxPlay(h.el === 'thunder' ? 'thunder' : h.el === 'fire' ? 'fire' : h.el === 'ice' ? 'ice' : 'boom', 0.5); }
        } else {
          if (!h.noDamage) G.hitAllies((P) => {
            if (Math.abs(P.y - h.y) > 4.5) return false;
            if (h.shape === 'circle') return Math.hypot(P.x - h.x, P.z - h.z) < h.r + 0.3;
            if (h.shape === 'sector') return G.inArc(P.x, P.z, h.x, h.z, h.yaw, h.r, h.ang, 0.3);
            if (h.shape === 'rect') return G.inRect(P.x, P.z, h.x, h.z, h.yaw, h.len, h.w, 0.3);
            return false;
          }, h.atk * h.mult, h.lv, h.el, h.status);
          const c = h.color || rgb(ELC(h.el === 'phys' ? 'fire' : h.el));
          if (h.shape === 'circle') { G.ring(h.x, h.y + 0.1, h.z, h.r, c, 0.4); G.emit(16, { x: h.x, y: h.y + 0.5, z: h.z, color: c, vs: 6, size: 0.45, life: 0.6, spread: h.r }); if (h.look === 'meteor' || h.look === 'icespike' || h.look === 'tornado') G.pillarFX(h.x, h.y, h.z, h.r * 0.5, h.look === 'tornado' ? 7 : 4, c, 0.5); }
          else if (h.shape === 'rect') { for (let k = 0; k < h.len; k += 1.5) G.emit(2, { x: h.x + Math.sin(h.yaw) * k, y: h.y + 0.4, z: h.z + Math.cos(h.yaw) * k, color: c, vs: 4, size: 0.45, life: 0.5 }); }
          else if (h.shape === 'sector') { for (let k = 0; k < 10; k++) { const a = h.yaw + (Math.random() - 0.5) * h.ang, rr = Math.random() * h.r; G.emit(2, { x: h.x + Math.sin(a) * rr, y: h.y + 1, z: h.z + Math.cos(a) * rr, color: c, vs: 3, size: 0.7, life: 0.5 }); } }
          if (h.fired === 1) PS.Audio.sfxPlay(h.look === 'meteor' ? 'boom' : 'heavy', 0.5);
        }
      }
      if (h.fired < h.ticks || h.t < h.delay + 0.05) G.hz[j++] = h;
    }
    G.hz.length = j;
  };

  // ================= プレイヤー =================
  class Player {
    constructor() {
      this.pos = { x: 0, y: 0, z: 0 }; this.vel = { x: 0, y: 0, z: 0 }; this.yaw = 0; this.mode = 'ground';
      this.stam = 240; this.stamMax = 240; this.stamWait = 0; this.combo = null; this.queued = false; this.atkCd = 0;
      this.dashT = 0; this.iframe = 0; this.sprint = false; this.fly = { t: 3, on: false }; this.awk = { on: false, t: 0, cd: 0 };
      this.cd = {}; this.buffs = []; this.hot = null; this.status = { freeze: 0, burn: 0, slow: 0, poison: 0 }; this.sinceHit = 99;
      this.phase = 0; this.t = 0; this.hurt = 0; this.dead = false; this.cast = 0; this.axeOut = false; this.plunge = false; this.act = null;
      this.lastSafe = { x: 0, y: 0, z: 0 }; this.stepT = 0; this.wingOpen = 0; this.regenAcc = 0;
    }
    setModel() { this.model = G.buildPlayerModel(); this.rig = new PS.Rig(this.model.bones); this.mat = M4.create(); }
    get maxHp() { return G.pstat.hp; }
    update(dt) {
      const I = PS.Input, S = G.pstat, p = this.pos, v = this.vel, inputOK = G.state === 'play' && !G.uiOpen && !this.dead;
      this.t += dt; this.hurt = Math.max(0, this.hurt - dt * 3); this.iframe -= dt; this.atkCd -= dt; this.sinceHit += dt;
      for (const k in this.cd) this.cd[k] = Math.max(0, this.cd[k] - dt);
      // 状態異常
      const st = this.status;
      if (st.burn > 0) { st.burn -= dt; this._dot = (this._dot || 0) + dt; if (this._dot > 1) { this._dot = 0; this.hp = Math.max(1, this.hp - Math.round(this.maxHp * 0.02)); G.emit(4, { x: p.x, y: p.y + 1, z: p.z, color: '#ff7a3a', vs: 1, vy: 2, size: 0.3, life: 0.5 }); } }
      if (st.poison > 0) { st.poison -= dt; this._dotp = (this._dotp || 0) + dt; if (this._dotp > 1) { this._dotp = 0; this.hp = Math.max(1, this.hp - Math.round(this.maxHp * 0.015)); G.emit(3, { x: p.x, y: p.y + 1, z: p.z, color: '#9cf04a', vs: 1, vy: 1, size: 0.25, life: 0.6, add: false }); } }
      if (st.slow > 0) st.slow -= dt;
      const frozen = st.freeze > 0;
      if (frozen) { st.freeze -= dt; if (I.was('up') || I.was('down') || I.was('left') || I.was('right') || I.was('jump') || I.was('attack')) st.freeze -= 0.22; if (Math.random() < 0.3) G.emit(1, { x: p.x, y: p.y + Math.random() * 1.8, z: p.z, color: '#bff6ff', vs: 0.5, size: 0.2, life: 0.6, spread: 0.8 }); }
      // バフ
      this.buffs = this.buffs.filter(b => (b.t -= dt) > 0);
      if (this.hot) { this.hot.t -= dt; this.heal(this.maxHp * this.hot.rate * dt, true); if (this.hot.t <= 0) this.hot = null; }
      // 回復者: 被弾3秒後から毎秒回復
      if (G.pk() === 'healer' && this.sinceHit > 3 && this.hp < this.maxHp) { this.regenAcc += dt * (G.plusSideOn('healer') ? 0.5 : 1); if (this.regenAcc >= 1) { this.regenAcc -= 1; this.heal(Math.max(10, this.maxHp * 0.005), true); } } else this.regenAcc = 0;
      // 覚醒
      const A = this.awk;
      if (A.on) { A.t -= dt; if (Math.random() < 0.5) G.emit(1, { x: p.x, y: p.y + Math.random() * 1.8, z: p.z, color: '#ff3a5a', vs: 1.5, vy: 2, size: 0.3, life: 0.5, spread: 0.6 }); if (A.t <= 0) { const r = this.hp / this.maxHp; A.on = false; A.cd = 40; G.recalc(); this.hp = Math.max(1, Math.round(this.maxHp * r)); PS.UI.notify('覚醒が解けた', 'info'); } }
      else if (A.cd > 0) A.cd -= dt;
      // 入力
      const mv = inputOK && !frozen ? I.move() : { x: 0, y: 0, mag: 0 };
      const cy = G.cam.yaw, fx = Math.sin(cy), fz = Math.cos(cy), rx = -Math.cos(cy), rz = Math.sin(cy);
      let wx = fx * mv.y + rx * mv.x, wz = fz * mv.y + rz * mv.x; const wl = Math.hypot(wx, wz); if (wl > 0.001) { wx /= wl; wz /= wl; }
      const gy = G.groundAt(p.x, p.z, p.y + 0.7), water = G.waterAt(p.x, p.z);
      const nrm = G.scene === 'world' ? PS.World.normal(p.x, p.z) : [0, 1, 0];
      const spdMul = S.spd * (st.slow > 0 ? 0.6 : 1) * (this.act && this.act.slowMove ? 0.2 : 1);
      // ---- アクション(スキル移動) ----
      if (this.act) this.updateAct(dt);
      // ---- ダッシュ / スプリント ----
      if (inputOK && !frozen && I.was('dash') && this.mode === 'ground' && !this.act && this.stam >= 18) {
        this.stam -= 18; this.stamWait = 1; this.dashT = 0.26; this.iframe = 0.32; this.combo = null;
        const dyaw = wl > 0.001 ? Math.atan2(wx, wz) : this.yaw; this.yaw = dyaw; this.dashDir = [Math.sin(dyaw), Math.cos(dyaw)];
        PS.Audio.sfxPlay('dash'); G.emit(10, { x: p.x, y: p.y + 0.6, z: p.z, color: '#ffffff', vs: 3, size: 0.4, life: 0.35, add: false, alpha: 0.5 });
      }
      this.sprint = inputOK && (I.isDown('dash') || I.joy.sprint) && wl > 0.001 && this.mode === 'ground' && this.stam > 0 && this.dashT <= 0 && !this.combo && !this.act;
      if (this.sprint) { this.stam -= 16 * dt; this.stamWait = 1; }
      // ---- モード別移動 ----
      const steep = nrm[1] < 0.64 && G.scene === 'world';
      if (this.mode === 'fly') {
        this.fly.t -= dt; this.wingOpen = Math.min(1, this.wingOpen + dt * 4);
        const sp = 9.5 * spdMul;
        v.x = PS.damp(v.x, wx * sp, 4, dt); v.z = PS.damp(v.z, wz * sp, 4, dt);
        let vy = 0.3; if (I.isDown('jump')) vy = 5; if (I.isDown('descend')) vy = -5;
        v.y = PS.damp(v.y, vy, 4, dt);
        if (wl > 0.001) this.yaw = PS.dampAng(this.yaw, Math.atan2(wx, wz), 8, dt);
        if (Math.random() < 0.6) G.emit(1, { x: p.x, y: p.y + 1.2, z: p.z, color: '#bff0ff', vs: 0.5, size: 0.2, life: 0.5, spread: 0.6 });
        if (inputOK && I.was('attack') && p.y - gy > 2.2) { this.mode = 'air'; this.plunge = true; this.plungeY = p.y; v.y = -26; PS.Audio.sfxPlay('dash'); }
        else if (this.fly.t <= 0 || (inputOK && I.was('special'))) { this.mode = 'air'; PS.UI.notify('飛行終了', 'info'); }
      } else if (this.mode === 'swim') {
        const sp = (I.isDown('dash') && this.stam > 0 ? 5 : 3.2) * spdMul;
        v.x = PS.damp(v.x, wx * sp, 5, dt); v.z = PS.damp(v.z, wz * sp, 5, dt); v.y = 0;
        this.stam -= (I.isDown('dash') ? 16 : wl > 0 ? 6 : 3) * dt; this.stamWait = 1;
        if (wl > 0.001) this.yaw = PS.dampAng(this.yaw, Math.atan2(wx, wz), 8, dt);
        if (Math.random() < 0.3 && wl > 0) G.emit(1, { x: p.x, y: 0.05, z: p.z, color: '#e8fbff', vs: 1, size: 0.3, life: 0.6, add: false, alpha: 0.7 });
        if (this.stam <= 0) { this.drown(); return; }
      } else if (this.mode === 'climb') {
        const sp = 2.6 * (S.spd > 1.1 ? 1.15 : 1);
        if (wl > 0.001 && this.stam > 0) { v.x = wx * sp; v.z = wz * sp; this.stam -= 11 * dt; this.phase += dt * 7; }
        else { v.x = 0; v.z = 0; this.stam -= 3 * dt; }
        this.stamWait = 1;
        this.yaw = PS.dampAng(this.yaw, Math.atan2(-nrm[0], -nrm[2]), 10, dt);
        if (inputOK && I.was('jump') && this.stam > 20) { this.stam -= 20; p.x += -nrm[0] * 0.2; v.x = -nrm[0] * 2 + wx * 2; v.z = -nrm[2] * 2 + wz * 2; v.y = 8; this.mode = 'air'; PS.Audio.sfxPlay('jump'); }
        if (this.stam <= 0) { this.mode = 'air'; v.x = nrm[0] * 4; v.z = nrm[2] * 4; v.y = 0; PS.UI.notify('スタミナ切れ！', 'warn'); }
        if (!steep) this.mode = 'ground';
      } else {
        // 地上 / 空中
        let sp = 5.6 * spdMul * (this.sprint ? 1.45 : 1);
        if (this.combo || this.cast > 0) sp *= 0.15;
        const ctl = this.mode === 'ground' ? 12 : 3;
        let tx = wx * sp * mv.mag, tz = wz * sp * mv.mag;
        if (this.dashT > 0) { this.dashT -= dt; tx = this.dashDir[0] * 15 * spdMul; tz = this.dashDir[1] * 15 * spdMul; if (Math.random() < 0.5) G.emit(1, { x: p.x, y: p.y + 0.8, z: p.z, color: G.pcolor, vs: 0.3, size: 0.6, life: 0.3, alpha: 0.4 }); }
        if (!this.act || !this.act.move) { v.x = PS.damp(v.x, tx, this.dashT > 0 ? 30 : ctl, dt); v.z = PS.damp(v.z, tz, this.dashT > 0 ? 30 : ctl, dt); }
        if (wl > 0.001 && !this.combo && this.dashT <= 0 && !this.act) this.yaw = PS.dampAng(this.yaw, Math.atan2(wx, wz), 12, dt);
        if (this.mode === 'ground') {
          this.phase += dt * Math.hypot(v.x, v.z) * 1.55;
          if (inputOK && !frozen && I.was('jump') && !this.act) { v.y = G.jumpV(); this.mode = 'air'; PS.Audio.sfxPlay('jump'); this.combo = null; if (v.y > 12) { G.ring(p.x, p.y + 0.1, p.z, 2.2, [1, 0.85, 0.4], 0.4); G.emit(14, { x: p.x, y: p.y + 0.2, z: p.z, color: '#ffd27a', vs: 3, vy: 2, size: 0.3, life: 0.5, kind: 1 }); } }
          if (steep && wl > 0.001 && this.stam > 0 && (wx * nrm[0] + wz * nrm[2]) < -0.2) { this.mode = 'climb'; this.combo = null; }
          else if (steep && (this.stam <= 0 || wl < 0.001) && nrm[1] < 0.5) { v.x += nrm[0] * 30 * dt; v.z += nrm[2] * 30 * dt; }
        } else if (this.mode === 'air') {
          v.y -= 26 * (G.gravMul ? G.gravMul() : 1) * dt * (this.plunge ? 2 : 1);
          if (inputOK && !frozen && I.was('jump') && G.canFly() && this.fly.t > 0.3) { this.mode = 'fly'; v.y = 2; PS.Audio.sfxPlay('wind'); G.questEvent('fly'); }
          if (inputOK && I.was('attack') && p.y - gy > 2.2 && !this.plunge && !this.combo) { this.plunge = true; this.plungeY = p.y; v.y = -24; }
          if (steep && wl > 0.001 && this.stam > 0 && p.y - gy < 0.6 && v.y < 0) this.mode = 'climb';
        }
      }
      if (this.mode !== 'fly') this.wingOpen = Math.max(0, this.wingOpen - dt * 2);
      // 位置更新
      if (frozen) { v.x = 0; v.z = 0; }
      p.x += v.x * dt; p.z += v.z * dt;
      if (this.mode === 'air' || this.mode === 'fly') p.y += v.y * dt;
      // 衝突
      G.collide(p, 0.4, p.y);
      if (G.scene === 'world') { const lim = PS.World.HALF - 36; p.x = PS.clamp(p.x, -lim, lim); p.z = PS.clamp(p.z, -lim, lim); }
      // 地面・水
      const g2 = G.groundAt(p.x, p.z, p.y + 0.7), wdepth = G.waterAt(p.x, p.z);
      if (this.mode === 'swim') { p.y = -1.25; if (wdepth < 1.2) { this.mode = 'ground'; } }
      else if (this.mode === 'ground' || this.mode === 'climb') {
        if (p.y - g2 > 0.9 && this.mode === 'ground') { this.mode = 'air'; v.y = 0; }
        else p.y = g2;
        if (wdepth > 1.3) { this.mode = 'swim'; this.combo = null; G.emit(10, { x: p.x, y: 0, z: p.z, color: '#e8fbff', vs: 3, vy: 2, size: 0.3, life: 0.6, add: false }); PS.Audio.sfxPlay('water', 0.5); }
      } else {
        if (p.y < -1.25 && wdepth > 1.3) { this.mode = 'swim'; v.y = 0; G.emit(16, { x: p.x, y: 0, z: p.z, color: '#e8fbff', vs: 4, vy: 3, size: 0.4, life: 0.7, add: false }); PS.Audio.sfxPlay('water'); this.plunge = false; this.fly.on = false; }
        else if (p.y <= g2) {
          const impact = -v.y; p.y = g2;
          if (this.plunge) {
            // 落下攻撃：高いところから落ちるほど強力
            const fall = Math.max(0, (this.plungeY || p.y) - p.y), mult = 2.2 + PS.clamp(fall / 4.5, 0, 5.3), rad = 3.4 + PS.clamp(fall * 0.09, 0, 2.6);
            this.plunge = false; G.hitShape({ t: 'circle', x: p.x, z: p.z, r: rad, y: p.y }, mult, G.wpnEl(), { knock: 5 + fall * 0.1, stun: fall > 8 ? 1.2 : 0 });
            G.ring(p.x, p.y + 0.1, p.z, rad * 1.2, G.pcolor, 0.45); G.emit(20 + Math.round(fall), { x: p.x, y: p.y + 0.3, z: p.z, color: '#ffffff', vs: 6 + fall * 0.2, size: 0.4, life: 0.5, add: false, alpha: 0.6 });
            if (fall > 8) { G.pillarFX(p.x, p.y, p.z, rad * 0.4, 7, PS.hexRGB(G.pcolor), 0.5); PS.UI.dmgText && PS.UI.dmgText(p.x, p.y + 2.4, p.z, '急降下！', '#ffd27a'); }
            G.shake(0.3 + Math.min(0.4, fall * 0.02)); PS.Audio.sfxPlay('boom', 0.6);
          }
          else if (impact > G.fallSafe() && this.mode !== 'fly') { const dmg = Math.round((impact - 23) * this.maxHp * 0.025); if (dmg > 0) { this.hp = Math.max(1, this.hp - dmg); PS.UI.dmg(p.x, p.y + 1.8, p.z, dmg, '#ff4a4a', false, 'player'); PS.Audio.sfxPlay('hurt'); } }
          else if (impact > 6) PS.Audio.sfxPlay('land', 0.6);
          this.mode = steep ? 'climb' : 'ground'; v.y = 0;
          if (G.canFly()) this.fly.t = G.flightMax();
        }
      }
      if (this.mode === 'ground' && wdepth <= 0.2 && !steep) { this.lastSafe.x = p.x; this.lastSafe.y = p.y; this.lastSafe.z = p.z; }
      if (G.scene === 'dungeon' && p.y < (G.dun && G.dun.long ? -34 : -20)) { p.x = this.lastSafe.x; p.y = this.lastSafe.y; p.z = this.lastSafe.z; }
      // スタミナ回復
      if (this.stamWait > 0) this.stamWait -= dt; else if (this.mode === 'ground' || this.mode === 'air') this.stam = Math.min(this.stamMax, this.stam + 32 * dt);
      if (G.canFly() && this.mode === 'ground') this.fly.t = Math.min(G.flightMax(), this.fly.t + dt * 2);
      // 足音
      if (this.mode === 'ground' && Math.hypot(v.x, v.z) > 1) { this.stepT -= dt * Math.hypot(v.x, v.z) * 0.32; if (this.stepT < 0) { this.stepT = 1; PS.Audio.sfxPlay('step', 0.5); if (G.scene === 'world' && G.baseRegion === 2) G.emit(2, { x: p.x, y: p.y + 0.1, z: p.z, color: '#e8d0a0', vs: 1, size: 0.25, life: 0.5, add: false, alpha: 0.6 }); if (G.scene === 'world' && G.baseRegion === 3) G.emit(2, { x: p.x, y: p.y + 0.1, z: p.z, color: '#ffffff', vs: 1, size: 0.2, life: 0.5, add: false }); } }
      // 攻撃・スキル
      if (inputOK && !frozen) this.handleCombat(dt);
      this.updateCombo(dt);
      this.cast = Math.max(0, this.cast - dt * 2.5);
      this.animate(dt);
    }
    heal(n, silent) { const before = this.hp; this.hp = Math.min(this.maxHp, this.hp + n); if (!silent && this.hp > before) PS.UI.dmg(this.pos.x, this.pos.y + 1.9, this.pos.z, '+' + Math.round(this.hp - before), '#7aff9a', false, 'heal'); }
    drown() {
      const p = this.pos, d = Math.round(this.maxHp * 0.15);
      this.hp = Math.max(1, this.hp - d); p.x = this.lastSafe.x; p.y = this.lastSafe.y; p.z = this.lastSafe.z; this.mode = 'ground'; this.vel.x = this.vel.y = this.vel.z = 0; this.stam = this.stamMax;
      PS.UI.notify('力尽きて岸に流れ着いた…', 'warn'); G.fade(0.6);
    }
    handleCombat(dt) {
      const I = PS.Input, s = G.save;
      if (this.mode === 'climb' || this.mode === 'swim') return;
      if (I.was('attack') && this.mode !== 'fly' && !this.plunge && !this.act) {
        if (this.combo && this.combo.t > this.combo.dur * 0.45) this.queued = true;
        else if (!this.combo && this.atkCd <= 0) this.startCombo(0);
        else if (this.combo) this.queued = true;
      }
      if (I.was('skill1')) G.castSkill(0);
      if (I.was('skill2')) G.castSkill(1);
      if (I.was('special')) {
        if (G.pk() === 'awakener') G.awaken();
        else if (G.canFly() && this.mode === 'air' && this.fly.t > 0.3) { this.mode = 'fly'; this.vel.y = 2; }
      }
      if (I.was('support')) G.supportSkill();
    }
    startCombo(i) {
      const w = G.wpnType(), N = D.NORMAL[w];
      if (w === 'axe' && i === 2 && this.axeOut) i = 0;
      if (i >= N.mult.length) i = 0;
      const tg = G.autoTarget(w === 'staff' ? 24 : 7, true);
      if (tg) this.yaw = Math.atan2(tg.x - this.pos.x, tg.z - this.pos.z);
      const sp = G.pstat.aspd || 1;
      this.combo = { i, t: 0, dur: N.dur[i] / sp, hit: false, w, tg }; this.queued = false;
      PS.Audio.sfxPlay(w === 'axe' ? 'heavy' : w === 'staff' ? 'magic' : 'swing', 0.6);
    }
    updateCombo(dt) {
      const c = this.combo; if (!c) return;
      c.t += dt; const N = D.NORMAL[c.w], p = this.pos, f = c.t / c.dur;
      if (c.w !== 'staff' && f < 0.4) { const st = N.step * dt / (c.dur * 0.4) * 1.2; p.x += Math.sin(this.yaw) * st; p.z += Math.cos(this.yaw) * st; }
      if (!c.hit && f >= N.hit) {
        c.hit = true; const mult = N.mult[c.i] * (G.pk() === 'mage' ? 0.9 : 1), el = G.wpnEl() || 'phys', col = G.wpnColor();
        if (c.w === 'staff') {
          const hp = this.rig.point(PS.HI.handR, 0, 0.1, 0.2), m = this.mat; const wp = M4.xform(m, hp[0], hp[1] + 1.0, hp[2] + 0.3);
          let dx = Math.sin(this.yaw), dz = Math.cos(this.yaw), dy = 0;
          if (c.tg && !c.tg.dead) { const tx = c.tg.x - wp[0], tz = c.tg.z - wp[2], ty = c.tg.y + c.tg.height * 0.5 - wp[1], l = Math.hypot(tx, ty, tz); dx = tx / l; dy = ty / l; dz = tz / l; }
          G.proj({ owner: 'p', x: wp[0], y: wp[1], z: wp[2], vx: dx * N.speed, vy: dy * N.speed, vz: dz * N.speed, life: N.range / N.speed, mult, el, color: rgb(col), size: c.i === 2 ? 0.7 : 0.45, r: 0.6, homing: true, explode: c.i === 2 ? 1.6 : 0, trail: 2 });
          G.emit(6, { x: wp[0], y: wp[1], z: wp[2], color: col, vs: 2, size: 0.3, life: 0.3, kind: 1 });
        } else if (c.w === 'axe' && c.i === 2 && !G.curComp()) {
          this.axeOut = true; const sp = 22 * G.axeSpd(), dy = 0;
          const self = this;
          G.proj({ owner: 'p', x: this.pos.x, y: this.pos.y + 1.2, z: this.pos.z, vx: Math.sin(this.yaw) * sp, vy: dy, vz: Math.cos(this.yaw) * sp, life: 0.75 / G.axeSpd(), mult, el, color: [1, 0.9, 0.7], size: 0.5, r: 1.2, pierce: true, ret: true, look: 'axe', spin: true, onReturn: () => { self.axeOut = false; self.atkCd = 0.2; } });
          setTimeout(() => { if (self.axeOut) self.axeOut = false; }, 2500);
          this.atkCd = D.NORMAL.axe.throwCd;
        } else {
          const r = N.r, ang = N.ang;
          G.hitShape({ t: 'arc', x: p.x, z: p.z, yaw: this.yaw, r, ang, y: p.y }, mult, el, { knock: c.i === 3 || c.w === 'axe' ? 4 : 1.2 });
          const ks = [[-1.6, 1.6, 0.25], [1.6, -1.6, -0.3], [-0.2, 0.2, 1.4], [-3.0, 3.0, 0.0]], k = ks[c.i % 4];
          const sc = c.w === 'axe' ? 1.25 : 1;
          if (c.i === 2 && c.w === 'sword') G.slash(p.x, p.y + 1.1, p.z, this.yaw, { a0: -1.2, a1: 1.2, r0: 0.6 * sc, r1: 2.8 * sc, tilt: 1.45, color: col, dur: 0.25 });
          else G.slash(p.x, p.y + 1.0, p.z, this.yaw, { a0: k[0], a1: k[1], r0: 0.7 * sc, r1: 2.8 * sc, tilt: k[2], color: col, dur: 0.26 });
        }
      }
      if (c.t >= c.dur) {
        if (this.queued) { const n = c.i + 1; this.startCombo(n >= N.mult.length ? 0 : n); }
        else { this.combo = null; this.atkCd = Math.max(this.atkCd, 0.12); }
      }
    }
    updateAct(dt) {
      const a = this.act, p = this.pos; a.t += dt;
      if (a.type === 'dash') {
        const f = Math.min(1, a.t / a.dur), nx = PS.lerp(a.fx, a.tx, f), nz = PS.lerp(a.fz, a.tz, f);
        const ox = p.x, oz = p.z; p.x = nx; p.z = nz; this.iframe = 0.1;
        G.hitShape({ t: 'rect', x: ox, z: oz, yaw: a.yaw, len: Math.hypot(nx - ox, nz - oz) + 1, w: a.w, y: p.y }, a.mult, a.el, { hitSet: a.hit, knock: 2 });
        G.emit(3, { x: p.x, y: p.y + 1, z: p.z, color: a.color, vs: 1, size: 0.6, life: 0.35 });
        if (f >= 1) { this.act = null; if (a.next) a.next(); }
      } else if (a.type === 'spin') {
        this.combo = null;
        if (a.t >= a.nextTick) { a.nextTick += a.dur / a.ticks; G.hitShape({ t: 'circle', x: p.x, z: p.z, r: a.r, y: p.y }, a.mult, a.el, { pull: a.pull, noStagger: false, knock: a.pull ? 0 : 1 }); G.slash(p.x, p.y + 1, p.z, this.yaw + a.t * 12, { a0: -2.6, a1: 2.6, r0: a.r * 0.4, r1: a.r, tilt: 0.1, color: a.color, dur: 0.2 }); }
        for (let k = 0; k < 2; k++) { const an = Math.random() * 6.28; G.emit(1, { x: p.x + Math.cos(an) * a.r * 0.8, y: p.y + 0.5 + Math.random(), z: p.z + Math.sin(an) * a.r * 0.8, color: a.color, vs: 1, size: 0.4, life: 0.4, vx: -Math.sin(an) * 6, vz: Math.cos(an) * 6 }); }
        if (a.t >= a.dur) this.act = null;
      } else if (a.type === 'leap') {
        const f = Math.min(1, a.t / a.dur); this.iframe = 0.1;
        p.x = PS.lerp(a.fx, a.tx, f); p.z = PS.lerp(a.fz, a.tz, f);
        const gy = PS.lerp(a.fy, G.groundAt(a.tx, a.tz, a.fy + 0.7), f); p.y = gy + Math.sin(f * Math.PI) * a.h; this.vel.y = 0;
        if (f >= 1) {
          this.act = null; p.y = G.groundAt(p.x, p.z, a.fy + 0.7); this.mode = 'ground';
          G.hitShape({ t: 'circle', x: p.x, z: p.z, r: a.r, y: p.y }, a.mult, a.el, { status: a.status, knock: 5 });
          G.ring(p.x, p.y + 0.1, p.z, a.r * 1.2, a.color, 0.5); G.pillarFX(p.x, p.y, p.z, a.r * 0.5, 6, a.color, 0.5);
          G.emit(30, { x: p.x, y: p.y + 0.5, z: p.z, color: a.color, vs: 10, size: 0.6, life: 0.7 }); G.shake(0.4); PS.Audio.sfxPlay('boom');
        }
      } else if (a.type === 'cast') { if (a.t >= a.dur) this.act = null; }
    }
    animate(dt) {
      const s = { t: this.t, move: Math.min(1, Math.hypot(this.vel.x, this.vel.z) / 6), sprint: this.sprint, air: this.mode === 'air' && !(this.act && this.act.type === 'leap'), vy: this.vel.y, climb: this.mode === 'climb', swim: this.mode === 'swim', fly: this.mode === 'fly', phase: this.phase, hurt: this.hurt, wingOpen: Math.max(this.wingOpen, G.plusOn && G.plusOn() ? 0.6 + Math.sin(this.t * 2.2) * 0.08 : 0) };
      if (this.mode === 'climb') s.move = 0;
      if (this.combo) s.atk = { w: this.combo.w === 'staff' ? 'staff' : 'sword', i: this.combo.w === 'axe' ? [0, 2, 1][this.combo.i] : this.combo.i, p: this.combo.t / this.combo.dur };
      if (this.act) { if (this.act.type === 'spin') s.atk = { w: 'spin', i: 0, p: this.act.t / this.act.dur }; else if (this.act.type === 'dash') s.atk = { w: 'sword', i: 3, p: 0.3 }; else if (this.act.type === 'leap') s.atk = { w: 'slam', i: 0, p: this.act.t / this.act.dur }; }
      if (this.cast > 0) s.cast = Math.min(1, this.cast);
      if (this.plunge) s.atk = { w: 'slam', i: 0, p: 0.4 };
      if (this.status.freeze > 0) { s.move = 0; s.t = 0; }
      PS.animHuman(this.rig, s);
      if (this.axeOut) { this.rig.scl[PS.HI.handR] = [0.001, 0.001, 0.001]; this.rig.update(); }
      M4.compose(this.mat, this.pos.x, this.pos.y + (this.mode === 'swim' ? 0.05 : 0), this.pos.z, 0, this.yaw, 0, G.pScale ? G.pScale() : 1);
    }
  }
  G.Player = Player;

  // ================= スキル =================
  G.castSkill = function (slot) {
    const p = G.player, s = G.save, id = s.skills[slot];
    if (s.pers === 'awakener') { if (slot === 1 || slot === 0) G.awaken(); return; }
    if (!id) { PS.UI.notify(G.nextSkillText(), 'info'); PS.Audio.sfxPlay('deny'); return; }
    const sk = G.skillById(id); if (!sk) return;
    if (p.cd[id] > 0) { PS.Audio.sfxPlay('deny'); return; }
    if (p.mode === 'climb' || p.mode === 'swim' || p.act || p.status.freeze > 0) return;
    const cdMul = s.pers === 'mage' ? 0.85 : 1;
    p.cd[id] = sk.cd * cdMul; p.combo = null;
    G.execSkill(sk, sk);
    G.questEvent('skill');
  };
  G.execSkill = function (sk, base) {
    const p = G.player, pos = p.pos, el = sk.el || base.el || 'phys', col = rgb(D.ELEM[el].c), mult = sk.mult || 1;
    const tg = G.autoTarget(sk.range || 12, true);
    if (tg && sk.type !== 'buff' && sk.type !== 'heal') p.yaw = Math.atan2(tg.x - pos.x, tg.z - pos.z);
    const yaw = p.yaw, fx = Math.sin(yaw), fz = Math.cos(yaw);
    PS.Audio.sfxPlay(el === 'fire' ? 'fire' : el === 'water' ? 'water' : el === 'wind' ? 'wind' : el === 'ice' ? 'ice' : el === 'thunder' ? 'thunder' : 'magic');
    switch (sk.type) {
      case 'arc':
        G.hitShape({ t: 'arc', x: pos.x, z: pos.z, yaw, r: sk.r, ang: sk.ang, y: pos.y }, mult, el, { status: sk.status, knock: 4 });
        G.slash(pos.x, pos.y + 1, pos.z, yaw, { a0: -sk.ang / 2, a1: sk.ang / 2, r0: 1, r1: sk.r, tilt: 0.15, color: col, dur: 0.32 });
        G.slash(pos.x, pos.y + 0.8, pos.z, yaw, { a0: -sk.ang / 2, a1: sk.ang / 2, r0: 0.6, r1: sk.r * 0.8, tilt: -0.1, color: [1, 1, 1], dur: 0.25 });
        G.emit(30, { x: pos.x + fx * sk.r * 0.5, y: pos.y + 1, z: pos.z + fz * sk.r * 0.5, color: col, vs: 8, size: 0.5, life: 0.6, spread: sk.r * 0.6 });
        p.combo = { i: 0, t: 0, dur: 0.4, hit: true, w: 'sword' }; break;
      case 'dash': {
        const dist = sk.dist, tx = pos.x + fx * dist, tz = pos.z + fz * dist;
        p.act = { type: 'dash', t: 0, dur: 0.22, fx: pos.x, fz: pos.z, tx, tz, yaw, w: sk.w, mult, el, color: col, hit: new Set(), next: base._next };
        G.slash(pos.x + fx * dist * 0.5, pos.y + 1, pos.z + fz * dist * 0.5, yaw + Math.PI / 2, { a0: -0.3, a1: 0.3, r0: dist * 0.2, r1: dist * 0.9, tilt: 0, color: col, dur: 0.3 });
        PS.Audio.sfxPlay('dash'); break;
      }
      case 'spin': p.act = { type: 'spin', t: 0, dur: sk.dur, ticks: sk.ticks, nextTick: 0, r: sk.r, mult, el, color: col, pull: sk.pull }; break;
      case 'nova':
        G.hitShape({ t: 'circle', x: pos.x, z: pos.z, r: sk.r, y: pos.y }, mult, el, { status: sk.status, knock: sk.knock || 4, stun: sk.stun });
        G.ring(pos.x, pos.y + 0.15, pos.z, sk.r * 1.15, col, 0.55); G.ring(pos.x, pos.y + 0.3, pos.z, sk.r * 0.7, [1, 1, 1], 0.4);
        G.circleFX(pos.x, pos.y + 0.05, pos.z, sk.r, col, 0.8); G.pillarFX(pos.x, pos.y, pos.z, sk.r * 0.3, 6, col, 0.5);
        G.emit(40, { x: pos.x, y: pos.y + 0.6, z: pos.z, color: col, vs: sk.r * 2, size: 0.55, life: 0.7, flat: true });
        G.shake(0.3); p.cast = 1;
        if (sk.heal) p.heal(p.maxHp * sk.heal);
        break;
      case 'proj': {
        const n = sk.n, full = sk.spread >= 6;
        for (let i = 0; i < n; i++) {
          const off = full ? i / n * Math.PI * 2 : n > 1 ? (i / (n - 1) - 0.5) * (sk.spread || 0) : 0, a = yaw + off;
          const sx = pos.x + Math.sin(a) * 0.6, sz = pos.z + Math.cos(a) * 0.6;
          G.proj({ owner: 'p', x: sx, y: pos.y + 1.2, z: sz, vx: Math.sin(a) * sk.speed, vy: 0, vz: Math.cos(a) * sk.speed, life: (sk.range || 25) / sk.speed * (sk.ret ? 1 : 1), mult, el, color: col, size: (sk.size || 1) * 0.8, r: (sk.size || 1) * 0.7, pierce: sk.pierce, explode: sk.explode, homing: sk.homing, status: sk.status, look: sk.look, ret: sk.ret, trail: sk.look === 'wave' ? 6 : 2 });
        }
        p.cast = 1; break;
      }
      case 'rain': {
        const c = tg ? { x: tg.x, z: tg.z } : { x: pos.x + fx * 8, z: pos.z + fz * 8 };
        for (let i = 0; i < sk.spots; i++) {
          let x = c.x, z = c.z;
          if (sk.line) { x = pos.x + fx * (3 + i * sk.spread); z = pos.z + fz * (3 + i * sk.spread); }
          else if (sk.spots > 1) { const a = i / sk.spots * Math.PI * 2 + Math.random(), r = sk.spread * (0.4 + Math.random() * 0.6); x = (tg ? c.x : pos.x) + Math.cos(a) * r; z = (tg ? c.z : pos.z) + Math.sin(a) * r; }
          const delay = sk.delay + (sk.line ? i * 0.12 : Math.random() * 0.3);
          G.hazard({ owner: 'p', shape: 'circle', x, z, r: sk.r, delay, ticks: sk.ticks, interval: sk.interval || 0.3, mult, el, status: sk.status, look: sk.meteor ? 'meteor' : null });
          G.circleFX(x, G.groundAt(x, z) + 0.05, z, sk.r, col, delay + (sk.ticks - 1) * (sk.interval || 0.3) + 0.4, 1.5);
          if (sk.meteor) G.meteorFX(x, z, delay, col);
        }
        p.cast = 1; break;
      }
      case 'leap': {
        const t = tg || { x: pos.x + fx * sk.range * 0.5, z: pos.z + fz * sk.range * 0.5 };
        const dx = t.x - pos.x, dz = t.z - pos.z, d = Math.hypot(dx, dz), k = d > 1.5 ? (d - 1.2) / d : 0;
        p.act = { type: 'leap', t: 0, dur: 0.55, fx: pos.x, fz: pos.z, fy: pos.y, tx: pos.x + dx * k, tz: pos.z + dz * k, h: 4 + d * 0.25, r: sk.r, mult, el, color: col, status: sk.status };
        PS.Audio.sfxPlay('jump'); break;
      }
      case 'buff':
        p.buffs.push({ stat: sk.stat, val: sk.val, t: sk.dur, name: sk.name });
        if (sk.extraStat) for (const k in sk.extraStat) p.buffs.push({ stat: k, val: sk.extraStat[k], t: sk.dur });
        if (sk.refill) p.fly.t = G.flightMax();
        if (sk.heal) p.heal(p.maxHp * sk.heal);
        G.pillarFX(pos.x, pos.y, pos.z, 1.2, 4, col, 0.8); G.circleFX(pos.x, pos.y + 0.05, pos.z, 2.5, col, 1.0);
        G.emit(30, { x: pos.x, y: pos.y + 1, z: pos.z, color: col, vs: 3, vy: 3, size: 0.4, life: 1, kind: 1, spread: 1 });
        PS.UI.notify(sk.name + '：能力上昇！', 'buff'); G.recalc(); p.cast = 1; break;
      case 'heal':
        if (sk.pct) p.heal(p.maxHp * sk.pct);
        if (sk.hot) p.hot = { rate: sk.hot / sk.hotDur, t: sk.hotDur };
        G.pillarFX(pos.x, pos.y, pos.z, 1.4, 5, [0.5, 1, 0.6], 0.9); G.emit(30, { x: pos.x, y: pos.y + 0.5, z: pos.z, color: '#9cffb0', vs: 2, vy: 4, size: 0.35, life: 1.2, kind: 1, spread: 1.5 });
        PS.Audio.sfxPlay('heal'); p.cast = 1; break;
      case 'multi': {
        let left = sk.count;
        const step = () => { if (left-- <= 0) return; const t2 = G.autoTarget(12, false); if (t2) p.yaw = Math.atan2(t2.x - p.pos.x, t2.z - p.pos.z); G.execSkill(Object.assign({ el }, sk.sub, { _next: step }), Object.assign({}, sk, { _next: step })); };
        step(); break;
      }
    }
    if (sk.extra) G.execSkill(Object.assign({ el: sk.extra.el }, sk.extra), sk.extra);
  };
  G.meteorFX = function (x, z, delay, col) {
    const gy = G.groundAt(x, z), fall = { t: 0 };
    const fxObj = { mode: 2, x, y: gy, z, size: [0.6, 30, 0.6], color: [col[0], col[1], col[2], 1], t: 0, dur: delay, add: true };
    G.fx.push(fxObj);
    const n = Math.max(2, Math.floor(delay * 25));
    for (let i = 0; i < n; i++) setTimeout(() => G.emit(3, { x: x + 6 * (1 - i / n), y: gy + 30 * (1 - i / n), z, color: col, vs: 1, size: 1.4, life: 0.4 }), i * delay * 1000 / n);
  };
  G.awaken = function () {
    const p = G.player, A = p.awk;
    if (G.save.pers !== 'awakener') return;
    if (A.on) { PS.UI.notify('覚醒中！ 残り' + Math.ceil(A.t) + '秒', 'info'); return; }
    if (A.cd > 0) { PS.UI.notify('覚醒まであと' + Math.ceil(A.cd) + '秒', 'info'); PS.Audio.sfxPlay('deny'); return; }
    const r = p.hp / p.maxHp; A.on = true; A.t = G.awakenDur(); G.recalc(); p.hp = Math.round(p.maxHp * Math.min(1, r + 0.15));
    PS.Audio.sfxPlay('awaken'); G.shake(0.5); G.pillarFX(p.pos.x, p.pos.y, p.pos.z, 2, 12, [1, 0.2, 0.3], 1.2); G.ring(p.pos.x, p.pos.y + 0.1, p.pos.z, 9, [1, 0.25, 0.35], 0.7);
    G.emit(60, { x: p.pos.x, y: p.pos.y + 1, z: p.pos.z, color: '#ff3a5a', vs: 10, size: 0.5, life: 1 });
    G.hitShape({ t: 'circle', x: p.pos.x, z: p.pos.z, r: 6, y: p.pos.y }, 1.5, 'dark', { knock: 8 });
    PS.UI.banner('覚 醒', '全ステータス x2.5 ／ ' + Math.round(A.t) + '秒', '#ff3a5a');
    G.questEvent('awaken');
  };

  // ================= 敵 =================
  class Enemy {
    constructor(key, lv, x, z, o) {
      o = o || {}; const d = D.ENEMIES[key];
      this.key = key; this.def0 = d; this.lv = lv; const st = D.enemyStats(key, lv);
      this.maxHp = this.hp = st.hp; this.atk = st.atk; this.def = st.def;
      this.x = x; this.z = z; this.gy = G.groundAt(x, z, o.y0 != null ? o.y0 + 0.7 : undefined); this.y = this.gy; this.vy = 0; this.home = { x, z }; this.yaw = Math.random() * 6.28;
      this.tgt = G.playerAlly; this.tgtT = 0;
      this.kx = 0; this.kz = 0; this.state = 'idle'; this.timer = Math.random() * 3; this.cds = d.atk.map(() => Math.random() * 1.5);
      this.st = { burn: 0, slow: 0, stun: 0 }; this.flash = 0; this.hurt = 0; this.t = Math.random() * 10; this.phase = 0;
      this.boss = !!d.boss; this.elite = !!d.elite; this.aggro = false; this.dead = false; this.deadT = 0;
      const m = d.model; this.scale = (m[2] || 1) * (o.scale || 1); this.radius = d.radius || 0.5;
      this.model = G.enemyModel(key); this.rig = new PS.Rig(this.model.bones); this.height = this.model.height * this.scale;
      this.mat = M4.create(); this.anim = {}; this.fly = !!d.fly; this.float = !!d.float;
      Object.assign(this, o);
    }
    update(dt) {
      const d = this.def0; this.t += dt; this.flash = Math.max(0, this.flash - dt); this.hurt = Math.max(0, this.hurt - dt * 3);
      if (this.dead) { this.deadT += dt; this.animate(dt); return this.deadT < 1.3; }
      // 状態異常
      if (this.st.burn > 0) { this.st.burn -= dt; this._b = (this._b || 0) + dt; if (this._b > 0.8) { this._b = 0; const dm = Math.max(1, Math.round(G.pstat.atk * 0.25 * (1 - this.def / (this.def + 500 + 250 * G.save.level)))); this.hp -= dm; if (PS.Settings.dmgNumbers) PS.UI.dmg(this.x, this.y + this.height, this.z, dm, '#ff7a3a', false, 'dot'); if (this.hp <= 0) { G.killEnemy(this); return true; } } if (Math.random() < 0.4) G.emit(1, { x: this.x, y: this.y + this.height * 0.6, z: this.z, color: '#ff7a3a', vs: 1, vy: 2, size: 0.35, life: 0.5, spread: this.radius }); }
      if (this.st.slow > 0) this.st.slow -= dt;
      const stun = this.st.stun > 0; if (stun) { this.st.stun -= dt; if (Math.random() < 0.2) G.emit(1, { x: this.x, y: this.y + this.height + 0.3, z: this.z, color: '#ffe680', vs: 1, size: 0.2, life: 0.4, kind: 1 }); }
      for (let i = 0; i < this.cds.length; i++) this.cds[i] -= dt;
      const p = this.pickTarget(dt);
      const dx = p.pos.x - this.x, dz = p.pos.z - this.z, dist = Math.hypot(dx, dz);
      const spd = d.speed * (this.st.slow > 0 ? 0.55 : 1) * (this.phase2 ? 1.15 : 1);
      let mvx = 0, mvz = 0;
      if (G.player.dead) { this.aggro = false; if (this.state !== 'idle') this.state = 'return'; }
      if (!this.aggro && !d.passive && dist < d.aggro * (this.boss ? 2 : 1) && !p.dead && Math.abs(p.pos.y - this.y) < 12) { this.aggro = true; this.state = 'chase'; if (!this.boss) PS.UI.alert(this); }
      if (this.boss && !this.phase2 && this.hp < this.maxHp * 0.5) { this.phase2 = true; PS.UI.banner(d.name, '本気を出してきた！', '#ff5a5a'); G.shake(0.6); PS.Audio.sfxPlay('boss'); G.ring(this.x, this.y + 0.2, this.z, 12, [1, 0.3, 0.3], 0.8); this.state = 'chase'; this.timer = 0.5; }
      if (stun) { /* 何もしない */ }
      else if (this.state === 'idle' || this.state === 'return') {
        const hx = this.home.x - this.x, hz = this.home.z - this.z, hd = Math.hypot(hx, hz);
        if (this.state === 'return') { if (hd > 2) { mvx = hx / hd * spd; mvz = hz / hd * spd; } else { this.state = 'idle'; this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.5); } this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.2 * dt); }
        else { this.timer -= dt; if (this.timer < 0) { this.timer = 2 + Math.random() * 4; const a = Math.random() * 6.28, r = Math.random() * 7; this.wander = { x: this.home.x + Math.cos(a) * r, z: this.home.z + Math.sin(a) * r }; } if (this.wander) { const wx = this.wander.x - this.x, wz = this.wander.z - this.z, wd = Math.hypot(wx, wz); if (wd > 0.8) { mvx = wx / wd * spd * 0.4; mvz = wz / wd * spd * 0.4; } } }
      } else if (this.state === 'chase') {
        const leash = this.boss ? 1e9 : 45;
        if (Math.hypot(this.x - this.home.x, this.z - this.home.z) > leash && dist > 18) { this.state = 'return'; this.aggro = false; }
        else {
          this.timer -= dt;
          let pick = -1;
          const optsF = (slack) => { const opts = []; d.atk.forEach((a, i) => { if (this.cds[i] > slack) return; if (a.phase2 && !this.phase2) return; const rng = a.range || (a.r ? a.r * 0.85 : 3); if (dist <= rng + (a.kind === 'proj' || a.kind === 'aoe' ? 0 : this.radius * this.scale)) opts.push(i); }); return opts; };
          // 予言者：数秒後の攻撃を先に決めておき、画面に見せる
          const fsT = this.aggro && d.atk.length && G.foresight ? G.foresight() : 0;
          if (fsT && this.fore == null && this.timer <= fsT) { const o2 = optsF(Math.max(0, this.timer)); if (o2.length) { this.fore = o2[Math.floor(Math.random() * o2.length)]; this.foreAt = G.time + Math.max(0, this.timer) + d.atk[this.fore].windup; } }
          if (this.timer <= 0) {
            const opts = optsF(0);
            if (opts.length) pick = this.fore != null && opts.includes(this.fore) ? this.fore : opts[Math.floor(Math.random() * opts.length)];
          }
          if (pick >= 0) this.beginAttack(pick);
          else {
            const keep = d.keep || 0, want = keep > 0 ? keep : (this.radius * this.scale + 1.4);
            if (dist > want + 0.5) { mvx = dx / dist * spd; mvz = dz / dist * spd; }
            else if (keep && dist < keep - 2) { mvx = -dx / dist * spd * 0.7; mvz = -dz / dist * spd * 0.7; }
            else if (keep) { mvx = dz / dist * spd * 0.4 * (this._side || 1); mvz = -dx / dist * spd * 0.4 * (this._side || 1); if (Math.random() < dt * 0.3) this._side = -(this._side || 1); }
            this.yaw = PS.dampAng(this.yaw, Math.atan2(dx, dz), 8, dt);
          }
        }
      } else if (this.state === 'windup') {
        const a = d.atk[this.atkI]; this.atkT += dt;
        if (this.atkT < a.windup * 0.7 && a.kind !== 'charge') { this.yaw = PS.dampAng(this.yaw, Math.atan2(dx, dz), 10, dt); if (this.tele) { this.tele.x = this.x; this.tele.z = this.z; this.tele.yaw = this.yaw; this.tele.y = this.y; } }
        if (a.kind === 'jump' && this.tele) { this.tele.x = this.jt.x; this.tele.z = this.jt.z; }
        if (this.atkT >= a.windup) this.execAttack(a);
      } else if (this.state === 'act') {
        this.atkT += dt; const A = this.actd;
        if (A.kind === 'charge') {
          const sp = 19 * (this.st.slow > 0 ? 0.6 : 1); mvx = Math.sin(this.yaw) * sp; mvz = Math.cos(this.yaw) * sp;
          A.hitSet = A.hitSet || new Set();
          for (const al of G.allies()) if (!A.hitSet.has(al) && Math.hypot(al.pos.x - this.x, al.pos.z - this.z) < this.radius * this.scale + 0.9 && Math.abs(al.pos.y - this.y) < 2) { A.hitSet.add(al); al.hit(this.atk * A.mult, this.lv, d.el, A.status); }
          if (Math.random() < 0.6) G.emit(1, { x: this.x, y: this.y + 0.3, z: this.z, color: '#d8c8a8', vs: 1, size: 0.6, life: 0.4, add: false, alpha: 0.5 });
          if (this.atkT > A.dist / sp) { this.state = 'recover'; this.atkT = 0; }
        } else if (A.kind === 'jump') {
          const f = Math.min(1, this.atkT / 0.45); this.x = PS.lerp(A.fx, A.tx, f); this.z = PS.lerp(A.fz, A.tz, f); this.jumpH = Math.sin(f * Math.PI) * (2 + this.scale);
          if (f >= 1) { this.jumpH = 0; this.circleHit(A); this.state = 'recover'; this.atkT = 0; }
        } else if (A.kind === 'cone') {
          if (this.atkT > A.next) { A.next += A.dur / A.ticks; G.hitAllies((P) => G.inArc(P.x, P.z, this.x, this.z, this.yaw, A.r, A.ang, 0.3) && Math.abs(P.y - this.y) < 4, this.atk * A.mult, this.lv, d.el, A.status); }
          for (let k = 0; k < 4; k++) { const an = this.yaw + (Math.random() - 0.5) * A.ang, sp = 14 + Math.random() * 6, hp = this.headPos(); G.emit(1, { x: hp[0], y: hp[1], z: hp[2], vx: Math.sin(an) * sp, vy: -1, vz: Math.cos(an) * sp, color: Math.random() < 0.5 ? '#ffb03a' : '#ff5a1a', vs: 1, size: 1.2, life: A.r / sp, drag: 0.3, grow: 2 }); }
          if (this.atkT > A.dur) { this.state = 'recover'; this.atkT = 0; }
        } else { this.state = 'recover'; this.atkT = 0; }
      } else if (this.state === 'recover') {
        this.atkT += dt; if (this.atkT > (this.boss ? 0.55 : 0.7)) { this.state = 'chase'; this.timer = this.boss ? 0.35 : 0.5 + Math.random() * 0.8; }
      }
      // 受動的 (イノシシ): 攻撃されたら反撃
      if (d.passive && this.aggro && this.state === 'idle') this.state = 'chase';
      // 移動適用
      this.kx *= Math.exp(-6 * dt); this.kz *= Math.exp(-6 * dt);
      const nx = this.x + (mvx + this.kx) * dt, nz = this.z + (mvz + this.kz) * dt;
      if (G.scene === 'world' && G.waterAt(nx, nz) > 1.0 && !this.fly) { this.kx = 0; this.kz = 0; if (this.state === 'act' && this.actd.kind === 'charge') { this.state = 'recover'; this.atkT = 0; } }
      else if (!this.anchor || this.state === 'act') { this.x = nx; this.z = nz; }
      if (mvx || mvz) { this.phase += dt * Math.hypot(mvx, mvz) * 1.6; if (this.state !== 'act') this.yaw = PS.dampAng(this.yaw, Math.atan2(mvx, mvz), 8, dt); }
      const pp = { x: this.x, z: this.z }; G.collide(pp, this.radius * this.scale * 0.8, this.gy + 0.5); this.x = pp.x; this.z = pp.z;
      const ng = G.groundAt(this.x, this.z, this.gy + 0.7);
      if (ng < this.gy - 0.6) { this.vy -= 26 * (G.gravMul ? G.gravMul() : 1) * dt; this.gy = Math.max(ng, this.gy + this.vy * dt); } else { this.gy = ng; this.vy = 0; }
      this.y = this.gy + (this.jumpH || 0) + (this.fly ? 0.4 : 0);
      this.moveAmt = Math.hypot(mvx, mvz) / Math.max(1, spd);
      this.animate(dt);
      return true;
    }
    pickTarget(dt) {
      this.tgtT -= dt; const cur = this.tgt;
      if (this.tgtT <= 0 || !cur || cur.dead || (!cur.isPlayer && (cur.down || !cur.present))) {
        this.tgtT = 1.2 + Math.random(); let best = G.playerAlly, bd = 1e9;
        for (const a of G.allies()) {
          let dd = Math.hypot(a.pos.x - this.x, a.pos.z - this.z) + Math.abs(a.pos.y - this.y) * 0.5;
          if (a.isPlayer) dd -= 2.5; if (a.taunt > 0) dd -= 40; if (this.threat === a) dd -= 4;
          if (dd < bd) { bd = dd; best = a; }
        }
        this.tgt = best;
      }
      return this.tgt;
    }
    headPos() { const hb = this.model.bones.length > 2 && this.model.anim === PS.animQuad ? 2 : 0; const lp = this.rig.point(hb, 0, 0, 0.5); return M4.xform(this.mat, lp[0], lp[1], lp[2]); }
    beginAttack(i) {
      this.fore = i; this.foreAt = G.time + this.def0.atk[i].windup;
      const a = this.def0.atk[i], p = this.tgt || G.playerAlly; this.atkI = i; this.atkT = 0; this.state = 'windup'; this.cds[i] = a.cd; this.tele = null;
      this.yaw = Math.atan2(p.pos.x - this.x, p.pos.z - this.z);
      if (a.kind === 'jump') { this.jt = { x: p.pos.x, z: p.pos.z }; }
      if (a.tele) {
        const base = { owner: 'e', x: this.x, z: this.z, y: this.y, yaw: this.yaw, delay: a.windup, mult: 0, atk: 0, lv: this.lv, src: this, noDamage: true, ticks: 0 };
        let h = null;
        if (a.kind === 'melee') h = Object.assign(base, { shape: 'sector', r: a.r, ang: a.ang });
        else if (a.kind === 'circle') h = Object.assign(base, { shape: 'circle', r: a.r });
        else if (a.kind === 'jump') h = Object.assign(base, { shape: 'circle', r: a.r, x: this.jt.x, z: this.jt.z });
        else if (a.kind === 'line' || a.kind === 'charge') h = Object.assign(base, { shape: 'rect', len: a.len || a.dist, w: a.w || 2 });
        else if (a.kind === 'cone') h = Object.assign(base, { shape: 'sector', r: a.r, ang: a.ang });
        if (h) { Object.assign(h, { t: 0, fired: 0, interval: 1 }); G.hz.push(h); this.tele = h; }
      }
      if (this.boss || this.elite) G.emit(10, { x: this.x, y: this.y + this.height * 0.6, z: this.z, color: '#ffffff', vs: 2, size: 0.4, life: 0.4, kind: 1, spread: this.radius });
    }
    circleHit(a) {
      G.hitAllies((P) => Math.hypot(P.x - this.x, P.z - this.z) < a.r + 0.4 && Math.abs(P.y - this.gy) < 2.5, this.atk * a.mult, this.lv, this.def0.el, a.status);
      G.ring(this.x, this.y + 0.15, this.z, a.r, this.def0.el !== 'phys' ? rgb(ELC(this.def0.el)) : [1, 0.85, 0.6], 0.45);
      G.emit(18, { x: this.x, y: this.y + 0.3, z: this.z, color: '#d8c8a8', vs: 6, size: 0.6, life: 0.6, add: false, alpha: 0.6, flat: true });
      if (this.scale > 1.4) G.shake(0.3); PS.Audio.sfxPlay('heavy', 0.6);
    }
    execAttack(a) {
      this.fore = null;
      const p = this.tgt || G.playerAlly, d = this.def0, el = d.el; this.tele = null; this.atkT = 0;
      const dx = p.pos.x - this.x, dz = p.pos.z - this.z;
      switch (a.kind) {
        case 'melee': {
          G.hitAllies((P) => G.inArc(P.x, P.z, this.x, this.z, this.yaw, a.r + 0.2, a.ang, 0.3) && Math.abs(P.y - this.y) < 2.5, this.atk * a.mult, this.lv, el, a.status);
          if (this.scale > 1.3 || this.boss) G.slash(this.x, this.y + this.height * 0.45, this.z, this.yaw, { a0: -a.ang / 2, a1: a.ang / 2, r0: a.r * 0.3, r1: a.r, tilt: 0.1, color: el !== 'phys' ? ELC(el) : '#ffd0a0', dur: 0.3 });
          PS.Audio.sfxPlay('swing', 0.5); this.state = 'recover'; break;
        }
        case 'circle': this.circleHit(a); this.state = 'recover'; break;
        case 'jump': { const tx = this.jt.x, tz = this.jt.z, ddx = tx - this.x, ddz = tz - this.z, dd = Math.hypot(ddx, ddz), k = dd > 1 ? Math.max(0, dd - 0.8) / dd : 0; this.actd = { kind: 'jump', fx: this.x, fz: this.z, tx: this.x + ddx * k, tz: this.z + ddz * k, r: a.r, mult: a.mult, status: a.status }; this.state = 'act'; break; }
        case 'charge': this.actd = { kind: 'charge', dist: a.dist, mult: a.mult, status: a.status }; this.state = 'act'; PS.Audio.sfxPlay('dash', 0.5); break;
        case 'proj': {
          const n = a.count || 1, hp = [this.x, this.y + this.height * 0.65, this.z];
          for (let i = 0; i < n; i++) {
            const off = n > 1 ? (a.spread >= 6 ? i / n * 6.283 : (i / (n - 1) - 0.5) * a.spread) : 0, base = Math.atan2(dx, dz) + off;
            const dist = Math.hypot(dx, dz), dy = (p.pos.y + 1 - hp[1]) / Math.max(1, dist);
            const looks = { arrow: [1, 0.95, 0.8], icearrow: [0.6, 0.95, 1], fireball: [1, 0.5, 0.15], sand: [0.95, 0.8, 0.45], dark: [0.75, 0.35, 1], seed: [0.6, 1, 0.3], lance: [0.7, 0.95, 1], blade: [0.4, 1, 0.85] };
            G.proj({ owner: 'e', x: hp[0], y: hp[1], z: hp[2], vx: Math.sin(base) * a.speed, vy: dy * a.speed, vz: Math.cos(base) * a.speed, life: (a.range + 6) / a.speed, mult: a.mult, atk: this.atk, lv: this.lv, el, status: a.status, look: a.look, color: looks[a.look] || [1, 0.6, 0.4], size: a.look === 'arrow' || a.look === 'icearrow' ? 0.25 : 0.6, r: 0.45, homing: a.homing, trail: 2 });
          }
          PS.Audio.sfxPlay(a.look === 'arrow' || a.look === 'icearrow' ? 'swing' : 'magic', 0.4); this.state = 'recover'; break;
        }
        case 'aoe': {
          const n = a.count || 1;
          for (let i = 0; i < n; i++) {
            let x = p.pos.x, z = p.pos.z; if (i > 0) { const an = Math.random() * 6.28, r = 3 + Math.random() * 6; x += Math.cos(an) * r; z += Math.sin(an) * r; }
            G.hazard({ owner: 'e', shape: 'circle', x, z, ty: p.pos.y, r: a.r, delay: 0.9 + i * 0.12, ticks: a.ticks || 1, interval: 0.5, mult: a.mult, atk: this.atk, lv: this.lv, el, status: a.status, look: a.look, src: this });
          }
          this.state = 'recover'; break;
        }
        case 'line': {
          const fans = a.fan ? [-0.5, 0, 0.5] : [0];
          for (const f of fans) G.hazard({ owner: 'e', shape: 'rect', x: this.x, z: this.z, ty: this.gy, yaw: this.yaw + f, len: a.len, w: a.w, delay: a.tele ? 0.02 : 0.5, mult: a.mult, atk: this.atk, lv: this.lv, el, status: a.status, src: this, noTele: !!a.tele, color: el === 'earth' ? [0.6, 0.45, 0.25] : null });
          this.state = 'recover'; break;
        }
        case 'ring': G.hazard({ owner: 'e', shape: 'ring', x: this.x, z: this.z, ty: this.gy, r: a.r, delay: 0.1, dur: 1.3, mult: a.mult, atk: this.atk, lv: this.lv, el, status: a.status, src: this, color: rgb(ELC(el === 'phys' ? 'fire' : el)) }); G.ring(this.x, this.y + 0.2, this.z, a.r, rgb(ELC(el === 'phys' ? 'fire' : el)), 1.4); PS.UI.notify('衝撃波！ ジャンプで回避！', 'warn'); this.state = 'recover'; break;
        case 'cone': this.actd = { kind: 'cone', r: a.r, ang: a.ang, mult: a.mult, ticks: a.ticks || 5, dur: 1.6, next: 0, status: a.status }; this.state = 'act'; PS.Audio.sfxPlay('fire'); break;
        case 'summon': {
          for (let i = 0; i < (a.n || 2); i++) { const an = Math.random() * 6.28; const m = new Enemy(a.what, Math.max(1, this.lv - 2), this.x + Math.cos(an) * 5, this.z + Math.sin(an) * 5, { summoned: true, aggro: true, state: 'chase' }); G.enemies.push(m); G.ring(m.x, m.y + 0.1, m.z, 2, [0.8, 0.5, 1], 0.5); }
          this.state = 'recover'; break;
        }
        default: this.state = 'recover';
      }
    }
    animate(dt) {
      const s = { t: this.t, move: this.moveAmt || 0, phase: this.phase, hurt: this.hurt, float: this.float };
      const a = this.state === 'windup' || this.state === 'act' ? this.def0.atk[this.atkI] : null;
      if (a) {
        const p = this.state === 'windup' ? Math.min(0.45, this.atkT / a.windup * 0.45) : 0.45 + Math.min(0.55, this.atkT * 2);
        const an = a.anim || 'atk';
        s.atk = { w: an === 'club' || an === 'atk' ? 'sword' : an === 'staff' || an === 'cast' ? 'staff' : an === 'bow' ? 'bow' : an === 'spin' ? 'spin' : an === 'slam' ? 'slam' : 'sword', i: this.atkI, p, kind: an };
      }
      if (this.state === 'recover' && this.atkT < 0.3) s.atk = { w: 'sword', i: this.atkI || 0, p: 0.6 + this.atkT, kind: 'atk' };
      if (this.dead) s.move = 0;
      this.model.anim(this.rig, s);
      const dr = this.dead ? Math.min(1, this.deadT * 2) : 0;
      M4.compose(this.mat, this.x, this.y, this.z, this.fly || this.model.anim !== PS.animHuman ? 0 : -dr * 1.4, this.yaw, 0, this.scale * (this.dead && this.model.anim === PS.animSlime ? 1 + dr * 0.3 : 1));
    }
  }
  G.Enemy = Enemy;
  G.enemyModel = function (key) {
    const m = D.ENEMIES[key].model;
    return PS.makeModel('enemy:' + key, () => {
      switch (m[0]) {
        case 'human': return { mb: PS.buildHumanoid(Object.assign({ gender: 'm' }, m[1])), bones: PS.HB, anim: PS.animHuman, height: 1.75, radius: 0.4 };
        case 'quad': return PS.buildQuad(m[1]);
        case 'slime': return PS.buildSlime(m[1]);
        case 'scorp': return PS.buildScorpion(m[1]);
        case 'spirit': return PS.buildSpirit(m[1]);
        case 'mushroom': return PS.buildMushroom(m[1]);
        case 'golem': return PS.buildGolem(m[1]);
        case 'treant': return PS.buildTreant(m[1]);
      }
    });
  };

  // ================= NPC =================
  class NPC {
    constructor(def, x, z) {
      this.def = def; this.x = x; this.z = z; this.y = G.groundAt(x, z); this.yaw = Math.random() * 6.28; this.t = Math.random() * 10;
      this.model = PS.makeModel('npc:' + def.id, () => ({ mb: PS.buildHumanoid(Object.assign({ skin: '#ffe0cc' }, def.look)), bones: PS.HB, anim: PS.animHuman, height: 1.75 }));
      this.rig = new PS.Rig(PS.HB); this.mat = M4.create(); this.height = 1.8;
    }
    update(dt) {
      this.t += dt; const p = G.player, dx = p.pos.x - this.x, dz = p.pos.z - this.z, d = Math.hypot(dx, dz);
      if (d < 6) this.yaw = PS.dampAng(this.yaw, Math.atan2(dx, dz), 4, dt);
      PS.animHuman(this.rig, { t: this.t, move: 0, emote: d < 6 && this.def.emote === 'wave' ? 'wave' : (d > 6 ? this.def.emote : null) });
      M4.compose(this.mat, this.x, this.y, this.z, 0, this.yaw, 0, 1);
    }
  }
  G.NPC = NPC;
})(window.PS);
