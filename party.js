/* Personality Stars - party.js : 旅の仲間・サポートモンスター（フワリン／ルミ）  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const G = PS.G, D = PS.DATA, M4 = PS.M4, R = PS.R;
  const C = PS.col, rgb = (h) => PS.hexRGB(h), rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const tmpM = M4.create(), tmpM2 = M4.create();

  // ================= セーブ上のパーティ =================
  G.partySave = function () {
    const s = G.save; if (!s.party) s.party = { list: [], active: [], support: null, sups: [], supports: [] };
    const ps = s.party; if (!ps.supports) ps.supports = ps.support ? [ps.support] : [];
    ps.supports = ps.supports.filter((id, i, a) => ps.sups.includes(id) && a.indexOf(id) === i && D.SUPPORT[id]).slice(0, D.SUPPORT_MAX || 2);
    ps.support = ps.supports[0] || null; return ps;
  };
  G.activeSups = () => (G.save && G.save.party ? G.partySave().supports : []);
  G.hasComp = (id) => G.partySave().list.includes(id);
  G.hasSupport = (id) => G.partySave().sups.includes(id);
  // フワリンの相性による「最初のステータス」倍率
  G.baseMul = function () { if (!G.activeSups().includes('fuwarin')) return 1; return D.COMPAT[D.compatOf('fuwarin', G.save.pers)].mul; };

  // ================= 仲間のステータス =================
  G.compStats = function (id) {
    const c = D.COMPANIONS[id], L = D.LVUP, g = D.COMP_GROW, lv = G.save.level, n = lv - 1;
    const wb = G.wpn() ? G.wpn().atk * 0.5 : 0;
    let atk = c.atk + n * L.atk[0] * g + wb; if (c.atkPer2) atk += Math.floor(lv / 2) * c.atkPer2;
    return { hp: Math.round(c.hp + n * L.hp[0] * g), atk: Math.round(atk), def: Math.round(c.def + n * L.def[0] * g), spd: c.spd };
  };
  // スロットごとに、習得済みのいちばん新しいスキル
  G.compLearned = function (id) {
    const lv = G.save.level, best = [];
    for (const sk of D.compSkills(id)) if (sk.lv <= lv) best[sk.slot] = sk;
    return best.filter(Boolean);
  };

  // ================= 仲間 =================
  class Companion {
    constructor(id, slot) {
      this.id = id; this.def = D.COMPANIONS[id]; this.slot = slot;
      this.pos = { x: 0, y: 0, z: 0 }; this.vel = { x: 0, y: 0, z: 0 }; this.yaw = 0; this.t = Math.random() * 10; this.phase = 0;
      this.model = PS.makeModel('comp:' + id, () => ({ mb: PS.buildHumanoid(Object.assign({ skin: '#ffe0cc' }, this.def.look)), bones: PS.HB, anim: PS.animHuman, height: 1.75 }));
      this.rig = new PS.Rig(PS.HB); this.mat = M4.create(); this.height = 1.8;
      this.recalc(); this.hp = this.maxHp; this.down = false; this.downT = 0; this.atkT = 1 + Math.random(); this.cd = {}; this.skillT = 2;
      this.taunt = 0; this.tauntDef = 0; this.present = true; this.radius = 0.4; this.swing = null; this.target = null; this.retT = 0; this.hurt = 0; this.air = false; this.stuckT = 0; this.cast = 0;
    }
    recalc() { const st = G.compStats(this.id); const r = this.maxHp ? this.hp / this.maxHp : 1; this.maxHp = st.hp; this.atk = st.atk; this.defv = st.def; this.spd = st.spd; if (this.hp != null) this.hp = Math.min(this.maxHp, Math.round(this.maxHp * r)); }
    hit(raw, lv, el, status) {
      if (this.down) return;
      const def = this.defv * (1 + this.tauntDef), red = PS.clamp(def / (def + 500 + 250 * lv), 0, 0.82);
      const dmg = Math.max(1, Math.round(raw * (1 - red) * (0.95 + Math.random() * 0.1)));
      this.hp -= dmg; this.hurt = 0.3;
      if (PS.Settings.dmgNumbers) PS.UI.dmg(this.pos.x, this.pos.y + 1.9, this.pos.z, dmg, '#ffb0a0', false, 'player');
      if (this.hp <= 0) {
        this.hp = 0; this.down = true; this.downT = 25; this.target = null; this.taunt = 0;
        PS.UI.notify(this.def.name + 'が戦闘不能になった…（25秒後に復帰）', 'warn'); PS.Audio.sfxPlay('die', 0.5);
      } else if (this.hp < this.maxHp * 0.25 && !this._lowSaid) { this._lowSaid = true; PS.UI.bubble(this, rnd(['くっ……まだ、やれる！', 'すこし、きついかも……']), 2.2); }
    }
    heal(n) { if (this.down) return; const b = this.hp; this.hp = Math.min(this.maxHp, this.hp + n); if (this.hp > b && PS.Settings.dmgNumbers) PS.UI.dmg(this.pos.x, this.pos.y + 1.9, this.pos.z, '+' + Math.round(this.hp - b), '#7aff9a', false, 'heal'); if (this.hp > this.maxHp * 0.5) this._lowSaid = false; }
    revive(pct) { this.down = false; this.hp = Math.round(this.maxHp * pct); this.downT = 0; PS.UI.bubble(this, '……お待たせしました。まだ戦えます！', 2.4); G.pillarFX(this.pos.x, this.pos.y, this.pos.z, 0.8, 4, [0.6, 1, 0.7], 0.8); }
    placeNear(force) {
      const P = G.player.pos, a = G.player.yaw + Math.PI + (this.slot ? 0.7 : -0.7), r = 2.6;
      let x = P.x + Math.sin(a) * r, z = P.z + Math.cos(a) * r;
      if (G.scene === 'world' && G.waterAt(x, z) > 1) { x = P.x; z = P.z; }
      this.pos.x = x; this.pos.z = z; this.pos.y = G.groundAt(x, z, P.y + 0.7); this.vel.x = this.vel.y = this.vel.z = 0; this.air = false;
      if (force) G.emit(10, { x, y: this.pos.y + 1, z, color: this.def.color, vs: 2, vy: 2, size: 0.25, life: 0.6, kind: 1 });
    }
    pickTarget() {
      const P = G.player.pos, me = this.pos; let best = null, bs = 1e9;
      for (const e of G.enemies) {
        if (e.dead || e.hidden || e.summoned && e.hp <= 0) continue;
        const dp = Math.hypot(e.x - P.x, e.z - P.z), dm = Math.hypot(e.x - me.x, e.z - me.z);
        if (dp > 24 || dm > 32 || (!e.aggro && dp > 9)) continue;
        if (Math.abs(e.y - me.y) > (this.def.style === 'ranged' ? 14 : 3.5) && Math.abs(e.y - P.y) > 3.5) continue;
        const sc = dm + (e.tgt === G.playerAlly ? -3 : 0) + (e.boss ? -2 : 0);
        if (sc < bs) { bs = sc; best = e; }
      }
      return best;
    }
    update(dt) {
      const p = G.player, P = p.pos, me = this.pos, d = this.def;
      this.t += dt; this.hurt = Math.max(0, this.hurt - dt * 3); this.cast = Math.max(0, this.cast - dt * 2.5);
      for (const k in this.cd) this.cd[k] = Math.max(0, this.cd[k] - dt);
      this.skillT -= dt; if (this.taunt > 0) { this.taunt -= dt; if (this.taunt <= 0) this.tauntDef = 0; }
      if (this.down) {
        this.downT -= dt; if (this.downT <= 0) this.revive(0.35);
        this.animate(dt, 0); return;
      }
      // 遠すぎる・高さが大きく違う → 主人公のそばへ
      const dP = Math.hypot(me.x - P.x, me.z - P.z), dy = Math.abs(me.y - P.y);
      if (dP > 46 || (dy > 9 && p.mode === 'ground' && dP < 30 ? (this.stuckT += dt) > 3.5 : (this.stuckT = 0, false))) { this.placeNear(true); this.stuckT = 0; }
      // 標的
      this.retT -= dt;
      if (this.retT <= 0 || (this.target && this.target.dead)) { this.retT = 0.5; this.target = this.pickTarget(); }
      const e = this.target;
      let tx = me.x, tz = me.z, run = false, faceYaw = null;
      if (e) {
        const de = Math.hypot(e.x - me.x, e.z - me.z), er = e.radius * e.scale;
        faceYaw = Math.atan2(e.x - me.x, e.z - me.z);
        if (d.style === 'melee') {
          const want = d.reach * 0.75 + er;
          if (de > want) { tx = e.x - Math.sin(faceYaw) * want * 0.9; tz = e.z - Math.cos(faceYaw) * want * 0.9; run = de > 8; }
          this.atkT -= dt;
          if (this.atkT <= 0 && de < want + 0.9 && !this.swing && Math.abs(e.y - me.y) < 3.5) { this.atkT = d.interval * (0.9 + Math.random() * 0.2); this.swing = { t: 0, e, dur: Math.min(0.6, d.interval * 0.5), hit: false }; }
        } else {
          const lo = 7, hi = d.range * 0.8;
          if (de > hi) { tx = e.x - Math.sin(faceYaw) * hi * 0.85; tz = e.z - Math.cos(faceYaw) * hi * 0.85; run = de > 14; }
          else if (de < lo) { tx = me.x - Math.sin(faceYaw) * 3; tz = me.z - Math.cos(faceYaw) * 3; }
          else { const side = this.slot ? 1 : -1; tx = me.x + Math.cos(faceYaw) * side * 1.2; tz = me.z - Math.sin(faceYaw) * side * 1.2; }
          this.atkT -= dt;
          if (this.atkT <= 0 && de < d.range) { this.atkT = d.interval * (0.9 + Math.random() * 0.2); this.shoot(e); }
        }
        if (this.skillT <= 0) this.thinkSkill(e);
      } else {
        // 主人公について歩く
        const a = p.yaw + Math.PI + (this.slot ? 0.65 : -0.65), r = 2.8;
        const fx = P.x + Math.sin(a) * r, fz = P.z + Math.cos(a) * r;
        if (Math.hypot(fx - me.x, fz - me.z) > 1.1) { tx = fx; tz = fz; run = dP > 7 || p.sprint; }
        if (this.skillT <= 0) this.thinkSkill(null);
      }
      // 近接攻撃
      if (this.swing) {
        const sw = this.swing; sw.t += dt;
        if (!sw.hit && sw.t > sw.dur * 0.45) {
          sw.hit = true; const col = rgb(D.ELEM[d.el || 'phys'].c);
          G.hitShape({ t: 'arc', x: me.x, z: me.z, yaw: this.yaw, r: d.reach, ang: d.ang, y: me.y }, d.mult, d.el, { knock: d.wtype === 'axe' || d.wtype === 'scythe' ? 3 : 1.2, atk: this.atk, src: this });
          G.slash(me.x, me.y + 1.0, me.z, this.yaw, { a0: -d.ang / 2, a1: d.ang / 2, r0: 0.7, r1: d.reach, tilt: d.wtype === 'scythe' ? 0.05 : 0.2, color: d.el !== 'phys' ? col : [1, 1, 1], dur: 0.26 });
          PS.Audio.sfxPlay(d.wtype === 'axe' || d.wtype === 'scythe' || d.wtype === 'club' ? 'heavy' : 'swing', 0.35);
        }
        if (sw.t >= sw.dur) this.swing = null;
      }
      // 移動
      let mx = tx - me.x, mz = tz - me.z; const ml = Math.hypot(mx, mz);
      const sp = 5.6 * this.spd * (run ? 1.45 : 1) * (this.swing ? 0.2 : 1);
      const vx = ml > 0.3 ? mx / ml * sp : 0, vz = ml > 0.3 ? mz / ml * sp : 0;
      this.vel.x = PS.damp(this.vel.x, vx, 10, dt); this.vel.z = PS.damp(this.vel.z, vz, 10, dt);
      me.x += this.vel.x * dt; me.z += this.vel.z * dt;
      G.collide(me, 0.4, me.y);
      const gy = G.groundAt(me.x, me.z, me.y + 0.7), water = G.scene === 'world' ? G.waterAt(me.x, me.z) : 0;
      if (water > 1.3) { me.y = PS.damp(me.y, -1.25, 8, dt); this.vel.y = 0; this.swim = true; this.air = false; }
      else {
        this.swim = false;
        if (me.y > gy + 0.6) { this.air = true; this.vel.y -= 26 * dt; me.y += this.vel.y * dt; if (me.y <= gy) { me.y = gy; this.vel.y = 0; this.air = false; } }
        else { me.y = gy; this.vel.y = 0; this.air = false; }
      }
      const spd2 = Math.hypot(this.vel.x, this.vel.z);
      if (faceYaw != null && (spd2 < 2 || this.swing)) this.yaw = PS.dampAng(this.yaw, faceYaw, 10, dt);
      else if (spd2 > 0.5) this.yaw = PS.dampAng(this.yaw, Math.atan2(this.vel.x, this.vel.z), 9, dt);
      this.phase += dt * spd2 * 1.55;
      this.animate(dt, spd2);
    }
    shoot(e) {
      const d = this.def, me = this.pos, hy = me.y + 1.3, ty = e.y + e.height * 0.5;
      const dx = e.x - me.x, dz = e.z - me.z, dy = ty - hy, L = Math.hypot(dx, dy, dz) || 1, col = rgb(d.wtype === 'bow' ? '#fff4d8' : D.ELEM[d.el].c);
      this.yaw = Math.atan2(dx, dz); this.cast = 1;
      G.proj({ owner: 'p', x: me.x + dx / L * 0.6, y: hy, z: me.z + dz / L * 0.6, vx: dx / L * d.speed, vy: dy / L * d.speed, vz: dz / L * d.speed, life: (d.range + 4) / d.speed, mult: d.mult, el: d.el, color: col, size: d.look === 'arrow' ? 0.25 : 0.45, r: 0.6, look: d.look, trail: 2, patk: this.atk, src: this, homing: d.wtype !== 'bow' });
      PS.Audio.sfxPlay(d.wtype === 'bow' ? 'swing' : 'magic', 0.3);
    }
    thinkSkill(e) {
      const list = G.compLearned(this.id); if (!list.length) { this.skillT = 2; return; }
      const p = G.player, near = G.enemies.filter(q => !q.dead && Math.hypot(q.x - this.pos.x, q.z - this.pos.z) < 9).length;
      const lowest = Math.min(p.hp / G.pstat.hp, ...((G.party || []).filter(c => !c.down).map(c => c.hp / c.maxHp)));
      for (const sk of list.slice().sort(() => Math.random() - 0.5)) {
        if (this.cd[sk.id] > 0) continue;
        let ok = false;
        if (sk.type === 'heal') ok = lowest < 0.6;
        else if (sk.type === 'buff') ok = !!e && !p.buffs.some(b => b.stat === sk.stat);
        else if (sk.type === 'taunt') ok = !!e && (near >= 2 || this.hp / this.maxHp > 0.6);
        else if (sk.type === 'nova' || sk.type === 'arc') ok = !!e && Math.hypot(e.x - this.pos.x, e.z - this.pos.z) < (sk.r || 4) + e.radius * e.scale;
        else ok = !!e;
        if (!ok) continue;
        this.useSkill(sk, e); this.cd[sk.id] = sk.cd; this.skillT = 1.6; return;
      }
      this.skillT = 0.6;
    }
    useSkill(sk, e) {
      const me = this.pos, el = sk.el || this.def.el || 'phys', col = rgb(D.ELEM[el].c), o = { atk: this.atk, src: this };
      if (e) this.yaw = Math.atan2(e.x - me.x, e.z - me.z);
      PS.UI.skillCall(this, sk.name);
      this.cast = 1;
      switch (sk.type) {
        case 'arc':
          G.hitShape({ t: 'arc', x: me.x, z: me.z, yaw: this.yaw, r: sk.r, ang: sk.ang, y: me.y }, sk.mult, el, Object.assign({ knock: 4 }, o));
          G.slash(me.x, me.y + 1, me.z, this.yaw, { a0: -sk.ang / 2, a1: sk.ang / 2, r0: 1, r1: sk.r, tilt: 0.15, color: col, dur: 0.34 });
          G.slash(me.x, me.y + 0.8, me.z, this.yaw + Math.PI / 2, { a0: -sk.ang / 2, a1: sk.ang / 2, r0: 0.8, r1: sk.r * 0.9, tilt: -0.1, color: [1, 1, 1], dur: 0.28 });
          this.swing = { t: 0, dur: 0.4, hit: true }; PS.Audio.sfxPlay('heavy', 0.5); break;
        case 'nova':
          G.hitShape({ t: 'circle', x: me.x, z: me.z, r: sk.r, y: me.y }, sk.mult, el, Object.assign({ knock: sk.knock || 4, stun: sk.stun, status: sk.status }, o));
          G.ring(me.x, me.y + 0.15, me.z, sk.r * 1.15, col, 0.55); G.circleFX(me.x, me.y + 0.05, me.z, sk.r, col, 0.7); G.pillarFX(me.x, me.y, me.z, sk.r * 0.3, 5, col, 0.5);
          G.emit(30, { x: me.x, y: me.y + 0.6, z: me.z, color: col, vs: sk.r * 2, size: 0.5, life: 0.6, flat: true }); PS.Audio.sfxPlay('boom', 0.4); break;
        case 'volley': {
          const n = sk.n || 1, hy = me.y + 1.3, ty = e ? e.y + e.height * 0.5 : hy, base = this.yaw;
          for (let i = 0; i < n; i++) {
            const a = base + (n > 1 ? (i / (n - 1) - 0.5) * (sk.spread || 0) : 0), dist = e ? Math.hypot(e.x - me.x, e.z - me.z) : 10, vy = (ty - hy) / Math.max(1, dist) * sk.speed;
            G.proj({ owner: 'p', x: me.x + Math.sin(a) * 0.6, y: hy, z: me.z + Math.cos(a) * 0.6, vx: Math.sin(a) * sk.speed, vy, vz: Math.cos(a) * sk.speed, life: 30 / sk.speed, mult: sk.mult, el, color: col, size: 0.5, r: 0.6, pierce: sk.pierce, explode: sk.explode, homing: sk.homing, status: sk.status, look: sk.look, trail: 2, patk: this.atk, src: this });
          }
          PS.Audio.sfxPlay(this.def.wtype === 'bow' ? 'swing' : 'magic', 0.5); break;
        }
        case 'rain': {
          const c = e ? { x: e.x, z: e.z, y: e.y } : { x: me.x + Math.sin(this.yaw) * 6, z: me.z + Math.cos(this.yaw) * 6, y: me.y };
          for (let i = 0; i < (sk.spots || 1); i++) {
            let x = c.x, z = c.z; if ((sk.spots || 1) > 1) { const a = i / sk.spots * 6.283 + Math.random(), rr = (sk.spread || 4) * (0.3 + Math.random() * 0.7); x += Math.cos(a) * rr; z += Math.sin(a) * rr; }
            const delay = (sk.delay || 0.5) + Math.random() * 0.25;
            G.hazard({ owner: 'p', shape: 'circle', x, z, ty: c.y, r: sk.r, delay, ticks: sk.ticks || 1, interval: sk.interval || 0.3, mult: sk.mult, el, status: sk.status, look: sk.meteor ? 'meteor' : null, patk: this.atk, src2: this });
            G.circleFX(x, G.groundAt(x, z, c.y + 0.7) + 0.05, z, sk.r, col, delay + ((sk.ticks || 1) - 1) * (sk.interval || 0.3) + 0.4, 1.5);
            if (sk.meteor) G.meteorFX(x, z, delay, col);
          }
          PS.Audio.sfxPlay('magic', 0.5); break;
        }
        case 'bomb': {
          if (!e) break; const hy = me.y + 1.4, dx = e.x - me.x, dz = e.z - me.z, dist = Math.hypot(dx, dz) || 1, T = PS.clamp(dist / 16, 0.45, 1.1), g = 18;
          G.proj({ owner: 'p', x: me.x, y: hy, z: me.z, vx: dx / T, vy: (e.y - hy) / T + g * T / 2, vz: dz / T, grav: g, life: T + 0.3, mult: sk.mult, el, color: col, size: sk.r > 5 ? 1.2 : 0.7, r: 0.8, explode: sk.r, trail: 3, patk: this.atk, src: this });
          PS.Audio.sfxPlay('dash', 0.4); break;
        }
        case 'heal': {
          const p = G.player; p.heal(G.pstat.hp * sk.pct);
          for (const c of G.party || []) if (!c.down) c.heal(c.maxHp * sk.pct);
          G.pillarFX(p.pos.x, p.pos.y, p.pos.z, 1.3, 5, [0.5, 1, 0.6], 0.9); G.pillarFX(me.x, me.y, me.z, 1, 4, [0.5, 1, 0.6], 0.8);
          G.emit(26, { x: p.pos.x, y: p.pos.y + 0.6, z: p.pos.z, color: '#9cffb0', vs: 2, vy: 4, size: 0.32, life: 1.1, kind: 1, spread: 1.4 }); PS.Audio.sfxPlay('heal'); break;
        }
        case 'buff': {
          const p = G.player; p.buffs.push({ stat: sk.stat, val: sk.val, t: sk.dur, name: sk.name }); G.recalc();
          G.pillarFX(p.pos.x, p.pos.y, p.pos.z, 1.2, 4, col, 0.8); G.circleFX(p.pos.x, p.pos.y + 0.05, p.pos.z, 2.5, col, 1.0);
          PS.UI.notify(this.def.name + '「' + sk.name + '」：' + ({ atk: '攻撃力', def: '防御力', spd: '移動速度' }[sk.stat]) + 'アップ！', 'buff'); break;
        }
        case 'taunt': {
          this.taunt = sk.dur; this.tauntDef = sk.def || 0; if (sk.heal) this.heal(this.maxHp * sk.heal);
          for (const q of G.enemies) if (!q.dead && !q.boss && Math.hypot(q.x - me.x, q.z - me.z) < sk.r) { q.tgt = this; q.tgtT = sk.dur; q.aggro = true; if (q.state === 'idle') q.state = 'chase'; }
          G.ring(me.x, me.y + 0.2, me.z, sk.r, [1, 0.8, 0.4], 0.7); G.pillarFX(me.x, me.y, me.z, 1.3, 5, [0.6, 0.75, 1], 0.9); PS.Audio.sfxPlay('boss', 0.25); break;
        }
        case 'charge': {
          if (!e) break; const a = Math.atan2(e.x - me.x, e.z - me.z), dist = Math.min(14, Math.hypot(e.x - me.x, e.z - me.z) + 2);
          G.hitShape({ t: 'rect', x: me.x, z: me.z, yaw: a, len: dist, w: sk.w || 2.4, y: me.y }, sk.mult, el, Object.assign({ knock: 5, stun: 0.8 }, o));
          const ox = me.x, oz = me.z; me.x += Math.sin(a) * (dist - 1.5); me.z += Math.cos(a) * (dist - 1.5); G.collide(me, 0.4, me.y);
          for (let k = 0; k < 8; k++) G.emit(2, { x: PS.lerp(ox, me.x, k / 8), y: me.y + 1, z: PS.lerp(oz, me.z, k / 8), color: this.def.color, vs: 1, size: 0.6, life: 0.35 });
          PS.Audio.sfxPlay('dash'); break;
        }
      }
    }
    animate(dt, spd) {
      const s = { t: this.t, move: this.down ? 0 : Math.min(1, spd / 6), sprint: spd > 7, air: this.air, vy: this.vel.y, swim: this.swim, phase: this.phase, hurt: this.hurt };
      if (this.swing) s.atk = { w: this.def.wtype === 'staff' ? 'staff' : this.def.wtype === 'bow' ? 'bow' : 'sword', i: Math.floor(this.t * 3) % 3, p: this.swing.t / this.swing.dur };
      else if (this.cast > 0) s.atk = { w: this.def.wtype === 'bow' ? 'bow' : 'staff', i: 0, p: 0.5 + (1 - this.cast) * 0.4 };
      PS.animHuman(this.rig, s);
      M4.compose(this.mat, this.pos.x, this.pos.y + (this.swim ? 0.05 : 0) - (this.down ? 0.6 : 0), this.pos.z, this.down ? -1.45 : 0, this.yaw, 0, 1);
    }
  }
  G.Companion = Companion;

  // ================= サポートモンスター（妖精） =================
  const FAIRY_MESH = {};
  G.fairyMesh = function (id) {
    if (FAIRY_MESH[id]) return FAIRY_MESH[id];
    const gl = R.gl, mk = (mb) => PS.GLH.makeMesh(gl, mb.pack()), body = new PS.MeshBuilder(), wl = new PS.MeshBuilder(), wr = new PS.MeshBuilder();
    if (id === 'fuwarin') {
      // 雲の妖精：ふわふわの雲のかたまり＋まんまるの目＋ほっぺ
      const w = C('#ffffff', 0.22), w2 = C('#eef6ff', 0.18), sh = C('#cfe2f8', 0.12);
      body.sphere(0, 0, 0, 0.34, 0.3, 0.32, (nx, ny) => ny < -0.4 ? sh : w, 14, 10);
      const puffs = [[0.26, 0.08, 0.05, 0.17], [-0.26, 0.08, 0.05, 0.17], [0.16, 0.24, -0.02, 0.16], [-0.16, 0.24, -0.02, 0.16], [0, 0.3, -0.04, 0.15], [0.3, -0.12, -0.04, 0.14], [-0.3, -0.12, -0.04, 0.14], [0.12, -0.24, 0.02, 0.15], [-0.12, -0.24, 0.02, 0.15], [0, 0.1, -0.24, 0.2]];
      for (const [x, y, z, r] of puffs) body.sphere(x, y, z, r, r * 0.9, r, w2, 10, 7);
      body.sphere(0.02, 0.44, -0.02, 0.08, 0.1, 0.08, w, 8, 6); body.sphere(-0.06, 0.48, -0.02, 0.05, 0.06, 0.05, w, 6, 5);
      for (const s of [-1, 1]) {
        body.sphere(s * 0.11, 0.04, 0.29, 0.055, 0.075, 0.03, C('#2a2e48', 0.0), 8, 6); body.sphere(s * 0.11 + 0.02, 0.08, 0.31, 0.018, 0.024, 0.01, C('#ffffff', 1), 6, 4);
        body.sphere(s * 0.2, -0.05, 0.27, 0.06, 0.035, 0.02, C('#ffb0c8', 0.35), 8, 5);
        body.sphere(s * 0.36, -0.06, 0.12, 0.08, 0.07, 0.08, w2, 8, 6);
      }
      body.box(0, -0.06, 0.315, 0.06, 0.012, 0.01, C('#5a4a6a'), 0, 0, 0);
      for (const [mb, s] of [[wl, -1], [wr, 1]]) { mb.sphere(s * 0.18, 0.06, 0, 0.2, 0.05, 0.13, C('#e8f4ff', 0.3), 10, 6); mb.sphere(s * 0.3, 0.12, -0.03, 0.12, 0.04, 0.09, C('#ffffff', 0.35), 8, 5); }
    } else if (id === 'arulu') {
      // アルル：夕焼け色のふわふわの体＋とがった耳＋ちょっと得意げな目＋トンボの羽
      const o1 = C('#ff9a5a', 0.3), o2 = C('#ffd0a0', 0.25), dk = C('#c85a2a', 0.2);
      body.sphere(0, 0, 0, 0.27, 0.28, 0.26, (nx, ny, nz) => nz > 0.45 && ny < 0.3 ? o2 : o1, 14, 10);
      for (const s of [-1, 1]) {
        body.cyl(s * 0.13, 0.18, -0.02, s * 0.24, 0.52, -0.04, 0.09, 0.0, o1, 6); body.cyl(s * 0.135, 0.2, 0.0, s * 0.22, 0.45, -0.02, 0.05, 0.0, o2, 5);
        body.sphere(s * 0.1, 0.05, 0.23, 0.05, 0.035, 0.02, C('#3a1e2a'), 8, 5); body.box(s * 0.1, 0.085, 0.245, 0.11, 0.018, 0.01, dk, 0, 0, s * -0.25);
        body.sphere(s * 0.1 + 0.02, 0.06, 0.25, 0.012, 0.014, 0.008, C('#ffffff', 1), 5, 4); body.sphere(s * 0.18, -0.04, 0.2, 0.045, 0.025, 0.015, C('#ff7a9a', 0.35), 6, 4);
      }
      body.sphere(0, -0.06, 0.255, 0.03, 0.012, 0.01, C('#5a2a2a'), 6, 4);
      body.sphere(0.0, -0.18, -0.24, 0.13, 0.13, 0.18, o2, 8, 6); body.sphere(0.06, -0.08, -0.36, 0.08, 0.08, 0.1, C('#ffffff', 0.3), 6, 5);
      for (const [mb, s] of [[wl, -1], [wr, 1]]) { mb.sphere(s * 0.2, 0.12, -0.06, 0.22, 0.05, 0.012, C('#ffe0b0', 0.7), 10, 5); mb.sphere(s * 0.17, -0.04, -0.06, 0.16, 0.04, 0.01, C('#ffb07a', 0.7), 8, 5); }
    } else if (id === 'star') {
      // スター：五つの角の星の体＋まっすぐな目＋小さなマント
      const y1 = C('#ffd84a', 0.75), y2 = C('#fff2a8', 0.9), cp = C('#e0405a', 0.15);
      body.sphere(0, 0, 0, 0.2, 0.2, 0.13, y1, 12, 8);
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + Math.PI / 2; body.cyl(Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0, Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0, 0.11, 0.0, y1, 5); }
      for (const s of [-1, 1]) { body.sphere(s * 0.065, 0.03, 0.12, 0.032, 0.05, 0.02, C('#2a1e2a'), 8, 5); body.sphere(s * 0.065 + 0.012, 0.055, 0.135, 0.01, 0.014, 0.006, C('#ffffff', 1), 5, 4); body.box(s * 0.07, 0.1, 0.125, 0.07, 0.015, 0.01, C('#a8582a'), 0, 0, s * 0.35); }
      body.box(0, -0.05, 0.13, 0.05, 0.01, 0.01, C('#a83a3a'));
      body.cyl(0, 0.0, -0.1, 0, -0.32, -0.16, 0.16, 0.24, cp, 8); body.sphere(0, 0.42, 0, 0.05, 0.05, 0.05, y2, 6, 5);
      for (const [mb, s] of [[wl, -1], [wr, 1]]) { mb.sphere(s * 0.16, 0.06, -0.08, 0.13, 0.08, 0.012, C('#fff2a8', 0.85), 8, 5); }
    } else if (id === 'marun') {
      // マルン：まんまるの水色の体＋頭のお花＋まるいメガネ＋ちょうちょの羽
      const b1 = C('#8ad0ff', 0.2), b2 = C('#d8f0ff', 0.2), fl = C('#ff9ec4', 0.35), gl3 = C('#3a3a5a');
      body.sphere(0, 0, 0, 0.27, 0.25, 0.25, (nx, ny) => ny < -0.5 ? b2 : b1, 14, 10);
      for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; body.sphere(Math.cos(a) * 0.07, 0.31, Math.sin(a) * 0.07 - 0.02, 0.06, 0.03, 0.06, fl, 6, 4); }
      body.sphere(0, 0.32, -0.02, 0.035, 0.035, 0.035, C('#ffe86a', 0.6), 6, 4);
      for (const s of [-1, 1]) {
        body.sphere(s * 0.09, 0.03, 0.22, 0.04, 0.05, 0.02, C('#2a2e48'), 8, 5); body.sphere(s * 0.09 + 0.015, 0.05, 0.235, 0.012, 0.014, 0.008, C('#ffffff', 1), 5, 4);
        body.cyl(s * 0.09, 0.03, 0.235, s * 0.09, 0.03, 0.25, 0.075, 0.075, gl3, 12, false); body.sphere(s * 0.17, -0.06, 0.19, 0.045, 0.025, 0.015, C('#ffb0c8', 0.35), 6, 4);
      }
      body.box(0, 0.035, 0.25, 0.04, 0.012, 0.01, gl3);
      body.box(0.2, -0.12, 0.12, 0.12, 0.15, 0.03, C('#7a5ad8', 0.1), 0, -0.4, 0.2);
      for (const [mb, s] of [[wl, -1], [wr, 1]]) { mb.sphere(s * 0.2, 0.14, -0.05, 0.2, 0.15, 0.012, C('#c8b0ff', 0.6), 10, 6); mb.sphere(s * 0.16, -0.06, -0.05, 0.13, 0.1, 0.01, C('#8ad0ff', 0.6), 8, 5); }
    } else {
      // 光の妖精：光る星の髪飾り＋ふんわりドレス＋4枚の羽
      const sk = C('#fff1e6', 0.3), hair = C('#ffe58a', 0.55), dr = C('#fff8d0', 0.5), gl2 = C('#ffd84a', 1);
      body.sphere(0, 0.18, 0, 0.17, 0.17, 0.16, sk, 12, 9);
      body.sphere(0, 0.25, -0.02, 0.19, 0.16, 0.18, hair, 12, 8); body.sphere(0, 0.12, -0.1, 0.16, 0.2, 0.1, hair, 10, 7);
      for (const s of [-1, 1]) { body.sphere(s * 0.065, 0.17, 0.145, 0.032, 0.045, 0.02, C('#3a5ab0'), 8, 6); body.sphere(s * 0.06 + 0.012, 0.19, 0.16, 0.012, 0.014, 0.008, C('#ffffff', 1), 5, 4); body.sphere(s * 0.11, 0.12, 0.13, 0.035, 0.02, 0.012, C('#ffb0c0', 0.4), 6, 4); }
      body.cyl(0, -0.02, 0, 0, -0.3, 0, 0.07, 0.16, dr, 10);
      body.sphere(0, -0.3, 0, 0.16, 0.04, 0.16, C('#ffe58a', 0.7), 10, 4);
      for (const s of [-1, 1]) body.cyl(s * 0.07, -0.02, 0, s * 0.14, -0.14, 0.04, 0.025, 0.02, sk, 5);
      for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 - Math.PI / 2; body.cyl(0, 0.44, 0, Math.cos(a) * 0.1, 0.44 + Math.sin(a) * 0.1, 0, 0.04, 0, gl2, 4); }
      body.sphere(0, 0.44, 0, 0.045, 0.045, 0.045, gl2, 6, 5);
      for (const [mb, s] of [[wl, -1], [wr, 1]]) { mb.sphere(s * 0.17, 0.1, -0.05, 0.17, 0.11, 0.015, C('#bff6ff', 0.75), 10, 6); mb.sphere(s * 0.13, -0.08, -0.05, 0.11, 0.08, 0.012, C('#ffe8ff', 0.7), 8, 5); }
    }
    return (FAIRY_MESH[id] = { body: mk(body), wl: mk(wl), wr: mk(wr) });
  };
  class Fairy {
    constructor(id, home) {
      this.id = id; this.def = D.SUPPORT[id]; this.home = home || null; this.pos = { x: 0, y: 0, z: 0 }; this.t = Math.random() * 10; this.yaw = 0; this.height = 0.6;
      this.lineT = 20 + Math.random() * 25; this.mat = M4.create(); this.present = true; this.spin = 0;
      if (home) { this.pos.x = home.x; this.pos.z = home.z; this.pos.y = G.groundAt(home.x, home.z) + 1.6; }
    }
    snap() { const P = G.player.pos; this.pos.x = P.x + 1; this.pos.y = P.y + 2.1; this.pos.z = P.z; }
    update(dt) {
      this.t += dt; const t = this.t;
      if (this.home) {
        const h = this.home, gy = G.groundAt(h.x, h.z);
        this.pos.x = h.x + Math.sin(t * 0.6) * 1.2; this.pos.z = h.z + Math.cos(t * 0.45) * 1.0; this.pos.y = gy + 1.5 + Math.sin(t * 2) * 0.2;
        const P = G.player.pos; this.yaw = PS.dampAng(this.yaw, Math.atan2(P.x - this.pos.x, P.z - this.pos.z), 4, dt); return;
      }
      const p = G.player, P = p.pos;
      // ふわふわと主人公の肩のあたりを飛ぶ。ときどきくるっと一回転
      if (this.spin <= 0 && Math.random() < dt * 0.04) this.spin = 1;
      const loop = this.spin > 0 ? (1 - this.spin) * Math.PI * 2 : 0; if (this.spin > 0) this.spin -= dt * 0.55;
      const side = this.slot === 1 ? -1 : 1, a = p.yaw + side * (1.8 + Math.sin(t * 0.37) * 0.3) + loop, r = 1.45 + Math.sin(t * 0.7) * 0.18;
      const tx = P.x + Math.sin(a) * r, tz = P.z + Math.cos(a) * r, ty = P.y + (p.mode === 'swim' ? 1.3 : 1.85) + Math.sin(t * 2.3) * 0.16 + (p.mode === 'fly' ? 0.4 : 0);
      if (Math.hypot(tx - this.pos.x, tz - this.pos.z) > 20 || Math.abs(ty - this.pos.y) > 14) { this.pos.x = tx; this.pos.y = ty; this.pos.z = tz; }
      const ox = this.pos.x, oz = this.pos.z;
      this.pos.x = PS.damp(this.pos.x, tx, 4.2, dt); this.pos.z = PS.damp(this.pos.z, tz, 4.2, dt); this.pos.y = PS.damp(this.pos.y, ty, 3.4, dt);
      const vx = (this.pos.x - ox) / dt, vz = (this.pos.z - oz) / dt;
      this.yaw = PS.dampAng(this.yaw, Math.hypot(vx, vz) > 1.5 ? Math.atan2(vx, vz) : p.yaw, 5, dt);
      const glow = this.id === 'lumi' || this.id === 'star';
      if (Math.random() < dt * (glow ? 6 : 2.5)) G.emit(1, { x: this.pos.x, y: this.pos.y - 0.1, z: this.pos.z, color: this.id === 'fuwarin' ? '#ffffff' : this.def.color, vs: 0.3, vy: -0.3, size: glow ? 0.12 : 0.16, life: 0.9, kind: 1, alpha: 0.7, add: glow });
      // ひとりごと
      if (G.state === 'play' && !G.uiOpen) { this.lineT -= dt; if (this.lineT <= 0) { this.lineT = 45 + Math.random() * 45; G.supportSay('idle', false, this); } }
    }
    draw(pass) {
      const m = G.fairyMesh(this.id), t = this.t, sq = 1 + Math.sin(t * 3.1) * 0.04;
      M4.compose(this.mat, this.pos.x, this.pos.y, this.pos.z, Math.sin(t * 1.3) * 0.08, this.yaw, Math.sin(t * 1.1) * 0.06, 1, sq, 1 / sq);
      R.drawMesh(m.body, this.mat);
      if (pass === 'shadow') return;
      const fast = this.id === 'lumi' || this.id === 'arulu' || this.id === 'marun', flap = fast ? Math.sin(t * (this.id === 'marun' ? 12 : 22)) * 0.55 : Math.sin(t * 7) * 0.4;
      for (const [w, s] of [[m.wl, -1], [m.wr, 1]]) {
        M4.compose(tmpM2, 0, this.id === 'fuwarin' ? 0.02 : 0.05, -0.08, 0, 0, s * flap, 1);
        M4.mul(tmpM, this.mat, tmpM2); R.drawMesh(w, tmpM);
      }
    }
  }
  G.Fairy = Fairy;

  // ================= パーティ管理 =================
  G.party = []; G.fairy = null; G.fairies = []; G.fairyHomes = [];
  G.buildParty = function () {
    const ps = G.partySave();
    const keep = new Map((G.party || []).map(c => [c.id, c]));
    G.party = ps.active.filter(id => ps.list.includes(id)).slice(0, D.PARTY_MAX).map((id, i) => { const c = keep.get(id) || new Companion(id, i); c.slot = i; if (!keep.has(id)) c.placeNear(); return c; });
    const fk = new Map((G.fairies || []).map(f => [f.id, f]));
    G.fairies = ps.supports.map((id, i) => { const f = fk.get(id) || new Fairy(id); f.slot = i; if (!f._placed) { f.snap(); f._placed = true; } return f; });
    G.fairy = G.fairies[0] || null;
    G.recalc(); if (G.player) G.player.hp = Math.min(G.player.hp, G.pstat.hp);
    PS.UI.refreshParty && PS.UI.refreshParty();
  };
  // 加入していない妖精は、出会いの場所でふわふわ浮かんでいる
  G.spawnFairyHomes = function () {
    G.fairyHomes = [];
    if (G.scene !== 'world' || !G.save) return;
    for (const id of D.SUPPORT_ORDER) {
      if (G.hasSupport(id)) continue; const S = D.SUPPORT[id];
      if (S.v != null && !PS.World.VILLAGES[S.v]) continue;
      let x = S.x, z = S.z; if (S.v != null) { const v = PS.World.VILLAGES[S.v]; x = v.x + S.dx; z = v.z + S.dz; }
      G.fairyHomes.push(new Fairy(id, { x, z }));
    }
  };
  G.recruitComp = function (id) {
    const ps = G.partySave(); if (ps.list.includes(id)) return;
    ps.list.push(id); const c = D.COMPANIONS[id];
    if (ps.active.length < D.PARTY_MAX) ps.active.push(id);
    PS.UI.banner('NEW COMPANION', c.title + ' ' + c.name + ' が仲間になった！', c.color); PS.Audio.sfxPlay('quest');
    G.npcs = G.npcs.filter(n => n.def.comp !== id);
    G.buildParty(); G.writeSave(true);
    if (!ps.active.includes(id)) PS.UI.notify('同行メンバーがいっぱいです。P キーの「仲間」で入れ替えられます', 'info');
  };
  G.recruitSupport = function (id) {
    const ps = G.partySave(); if (ps.sups.includes(id)) return;
    ps.sups.push(id); const full = ps.supports.length >= (D.SUPPORT_MAX || 2); if (!full) ps.supports.push(id);
    const S = D.SUPPORT[id]; PS.UI.banner('SUPPORT', S.name + ' が旅のお供になった！', S.color); PS.Audio.sfxPlay('quest');
    G.fairyHomes = G.fairyHomes.filter(f => f.id !== id);
    G.buildParty(); G.writeSave(true);
    if (full) PS.UI.notify('サポートキャラは2体まで連れて行けます。P キーの「仲間」で入れ替えられます', 'info');
  };
  G.setActive = function (id, on) {
    const ps = G.partySave(); ps.active = ps.active.filter(x => x !== id);
    if (on) { if (ps.active.length >= D.PARTY_MAX) return false; ps.active.push(id); }
    G.buildParty(); return true;
  };
  // おともの切り替え（2体まで）
  G.setSupport = function (id, on) {
    const ps = G.partySave(), has = ps.supports.includes(id); if (on == null) on = !has;
    if (on && !has) { if (ps.supports.length >= (D.SUPPORT_MAX || 2)) return false; ps.supports.push(id); }
    if (!on) ps.supports = ps.supports.filter(x => x !== id);
    ps.support = ps.supports[0] || null; G.buildParty(); return true;
  };
  // ルミ：ダメージを受けている時に回復（10%・クールダウン10秒）
  G.supportCd = 0;
  G.supportSkill = function () {
    const p = G.player, sups = G.activeSups(), lumi = G.fairies.find(f => f.id === 'lumi');
    if (!lumi) { if (sups.length) PS.UI.notify(sups.map(id => D.SUPPORT[id].name + '：' + D.supEffect(id, G.save.pers)).join('　／　'), 'info'); return; }
    if (G.supportCd > 0) { PS.Audio.sfxPlay('deny'); PS.UI.notify('ルミの回復まであと' + Math.ceil(G.supportCd) + '秒', 'info'); return; }
    if (p.hp >= G.pstat.hp) { PS.UI.notify('HPは満タンです', 'info'); return; }
    p.heal(G.pstat.hp * 0.1); G.supportCd = 10;
    const f = lumi.pos; PS.Audio.sfxPlay('heal');
    G.pillarFX(p.pos.x, p.pos.y, p.pos.z, 1.1, 4, [1, 0.92, 0.5], 0.8); G.ring(p.pos.x, p.pos.y + 0.1, p.pos.z, 2.2, [1, 0.9, 0.5], 0.5);
    for (let i = 0; i < 12; i++) G.emit(1, { x: f.x, y: f.y, z: f.z, vx: (p.pos.x - f.x) * 2 + (Math.random() - 0.5) * 2, vy: (p.pos.y + 1 - f.y) * 2, vz: (p.pos.z - f.z) * 2 + (Math.random() - 0.5) * 2, color: '#ffe58a', vs: 0.2, size: 0.2, life: 0.5, kind: 1 });
    G.supportSay('heal', true, lumi);
  };
  // 妖精のセリフ
  G.supportSay = function (kind, force, who) {
    const fs = G.fairies || []; if (!fs.length || !G.save) return;
    const f = who || fs[Math.floor(Math.random() * fs.length)];
    if (!force && G.time - (G._sayT || -99) < 6) return; G._sayT = G.time;
    const L = (D.SUP_LINES && D.SUP_LINES[f.id]) || D.LUMI_LINES, arr = L[kind] || L.idle; if (!arr) return;
    PS.UI.bubble(f, rnd(arr).replace(/\{name\}/g, G.save.name), kind === 'idle' ? 3.6 : 3.0);
  };

  // ================= 毎フレーム =================
  G.updateParty = function (dt) {
    if (G.supportCd > 0) G.supportCd -= dt;
    for (const c of G.party) c.update(dt);
    // 仲間どうし・敵との押し合い（軽く）
    for (const c of G.party) for (const e of G.enemies) { if (e.dead) continue; const dx = c.pos.x - e.x, dz = c.pos.z - e.z, d = Math.hypot(dx, dz), m = 0.4 + e.radius * e.scale; if (d < m && d > 0.001 && Math.abs(c.pos.y - e.y) < 2) { const k = (m - d) / d; c.pos.x += dx * k; c.pos.z += dz * k; } }
    for (const f of G.fairies) f.update(dt);
    for (const f of G.fairyHomes) if (Math.hypot(f.home.x - G.player.pos.x, f.home.z - G.player.pos.z) < 120) f.update(dt);
    if (G.player && !G._lowWarn && G.player.hp < G.pstat.hp * 0.28 && G.state === 'play') { G._lowWarn = true; G.supportSay('lowhp', true); }
    if (G.player && G.player.hp > G.pstat.hp * 0.6) G._lowWarn = false;
  };
  G.drawParty = function (pass) {
    const ex = R.eye[0], ez = R.eye[2];
    for (const c of G.party) {
      if (Math.hypot(c.pos.x - ex, c.pos.z - ez) > 140 || !R.visible(c.pos.x, c.pos.y + 1, c.pos.z, 1.5)) continue;
      R.drawSkinned(c.model.mesh, c.rig.world, c.mat, { flash: c.hurt > 0.15 ? [1, 0.3, 0.3, c.hurt * 0.5] : c.taunt > 0 ? [0.6, 0.75, 1, 0.18] : null, dissolve: c.down ? 0.35 : 0 });
    }
    for (const f of G.fairies) if (R.visible(f.pos.x, f.pos.y, f.pos.z, 1)) f.draw(pass);
    for (const f of G.fairyHomes) if (Math.hypot(f.pos.x - ex, f.pos.z - ez) < 100 && R.visible(f.pos.x, f.pos.y, f.pos.z, 1)) f.draw(pass);
  };
  // 仲間はシーンが変わったら主人公のそばに出現
  G.partyArrive = function () { for (const c of G.party) { c.placeNear(); c.target = null; c.swing = null; } for (const f of G.fairies) f.snap(); G.spawnFairyHomes(); };
})(window.PS);
