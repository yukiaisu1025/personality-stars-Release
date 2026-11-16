/* Personality Stars - models.js : キャラクター/モンスター/ボスのリグとメッシュ  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const M4 = PS.M4, C = PS.col;
  const T = (x, y, z) => M4.compose(new Float32Array(16), x, y, z, 0, 0, 0, 1);
  const TR = (x, y, z, rx, ry, rz, sx, sy, sz) => M4.compose(new Float32Array(16), x, y, z, rx || 0, ry || 0, rz || 0, sx || 1, sy, sz);
  const mm = (a, b) => M4.mul(new Float32Array(16), a, b);

  // ---------------- リグ ----------------
  class Rig {
    constructor(bones) {
      this.bones = bones; this.n = bones.length;
      this.rel = bones.map(b => b[1] < 0 ? b[2].slice() : [b[2][0] - bones[b[1]][2][0], b[2][1] - bones[b[1]][2][1], b[2][2] - bones[b[1]][2][2]]);
      this.rot = bones.map(() => [0, 0, 0]); this.off = bones.map(() => [0, 0, 0]); this.scl = bones.map(() => [1, 1, 1]);
      this.world = new Float32Array(30 * 16); this.mats = [];
      for (let i = 0; i < 30; i++) { this.mats.push(this.world.subarray(i * 16, i * 16 + 16)); M4.identity(this.mats[i]); }
      this.local = M4.create();
    }
    reset() { for (let i = 0; i < this.n; i++) { const r = this.rot[i], o = this.off[i], s = this.scl[i]; r[0] = r[1] = r[2] = 0; o[0] = o[1] = o[2] = 0; s[0] = s[1] = s[2] = 1; } }
    update() {
      for (let i = 0; i < this.n; i++) {
        const r = this.rel[i], o = this.off[i], R = this.rot[i], S = this.scl[i];
        M4.compose(this.local, r[0] + o[0], r[1] + o[1], r[2] + o[2], R[0], R[1], R[2], S[0], S[1], S[2]);
        const p = this.bones[i][1];
        if (p < 0) this.mats[i].set(this.local); else M4.mul(this.mats[i], this.mats[p], this.local);
      }
    }
    point(i, x, y, z, out) { return M4.xform(this.mats[i], x, y, z, out); }
  }
  PS.Rig = Rig;

  const HB = [
    ['hips', -1, [0, 0.95, 0]], ['spine', 0, [0, 1.05, 0]], ['chest', 1, [0, 1.25, 0]], ['head', 2, [0, 1.49, 0]],
    ['uArmL', 2, [0.185, 1.42, 0]], ['lArmL', 4, [0.205, 1.17, 0]], ['uArmR', 2, [-0.185, 1.42, 0]], ['lArmR', 6, [-0.205, 1.17, 0]],
    ['handR', 7, [-0.215, 0.92, 0.015]], ['thighL', 0, [0.09, 0.93, 0]], ['shinL', 9, [0.092, 0.52, 0]], ['thighR', 0, [-0.09, 0.93, 0]], ['shinR', 11, [-0.092, 0.52, 0]],
    ['skirt', 0, [0, 1.02, 0]], ['hairB', 3, [0, 1.66, -0.07]], ['cape', 2, [0, 1.43, -0.11]], ['wingL', 2, [0.07, 1.36, -0.13]], ['wingR', 2, [-0.07, 1.36, -0.13]],
    ['handL', 5, [0.215, 0.92, 0.015]], ['hat', 3, [0, 1.74, 0]]
  ];
  PS.HB = HB;
  const HI = {}; HB.forEach((b, i) => HI[b[0]] = i);
  PS.HI = HI;

  function partFn(mb, bones) {
    return (bi, extra) => { const p = bones[bi][2]; mb.bone = bi; mb.xf = extra ? mm(T(-p[0], -p[1], -p[2]), extra) : T(-p[0], -p[1], -p[2]); };
  }

  // ---------------- 武器 ----------------
  PS.WEAPON_LOOK = {
    sword: (mb, w) => {
      const steel = C(w.blade || '#dfe6ee'), gold = C(w.guard || '#d8b45a'), grip = C('#4a3226'), glow = C(w.glow || '#9fe7ff', 0.9);
      const L = w.len || 0.8;
      mb.cyl(0, -0.08, 0, 0, 0.07, 0, 0.019, 0.019, grip, 6);
      mb.sphere(0, -0.095, 0, 0.027, 0.027, 0.027, gold, 6, 4);
      mb.box(0, 0.08, 0, w.guardW || 0.18, 0.032, 0.05, gold);
      mb.sphere(0, 0.08, 0.026, 0.018, 0.018, 0.01, glow, 6, 4);
      mb.box(0, 0.09 + L / 2, 0, w.bladeW || 0.065, L, 0.014, steel);
      mb.box(0, 0.09 + L * 0.45, 0.0075, 0.014, L * 0.75, 0.003, glow);
      mb.box(0, 0.09 + L * 0.45, -0.0075, 0.014, L * 0.75, 0.003, glow);
      mb.cyl(0, 0.09 + L, 0, 0, 0.09 + L + 0.11, 0, (w.bladeW || 0.065) * 0.5, 0.0, steel, 4, false);
    },
    axe: (mb, w) => {
      const steel = C(w.blade || '#c9d0d8'), wood = C('#6b4a32'), glow = C(w.glow || '#ffb36b', 0.8), band = C(w.guard || '#b88a4a');
      mb.cyl(0, -0.14, 0, 0, 0.66, 0, 0.026, 0.024, wood, 6);
      mb.cyl(0, 0.44, 0, 0, 0.47, 0, 0.032, 0.032, band, 6); mb.cyl(0, -0.1, 0, 0, -0.06, 0, 0.03, 0.03, band, 6);
      mb.extrude([[0.02, 0.4], [0.22, 0.32], [0.3, 0.52], [0.24, 0.7], [0.02, 0.64]], 0.038, steel);
      mb.extrude([[0.24, 0.33], [0.31, 0.52], [0.25, 0.69], [0.27, 0.52]], 0.042, glow);
      mb.extrude([[-0.02, 0.46], [-0.13, 0.52], [-0.02, 0.6]], 0.03, steel);
      mb.sphere(0, 0.69, 0, 0.035, 0.035, 0.035, band, 6, 4);
    },
    staff: (mb, w) => {
      const wood = C(w.blade || '#5a3a5e'), gold = C(w.guard || '#e0c06a'), orb = C(w.glow || '#c58cff', 1.0);
      mb.cyl(0, -0.62, 0, 0, 0.86, 0, 0.02, 0.022, wood, 6);
      mb.cyl(0, 0.84, 0, 0, 0.92, 0, 0.03, 0.05, gold, 6);
      for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; mb.cyl(Math.cos(a) * 0.04, 0.92, Math.sin(a) * 0.04, Math.cos(a) * 0.075, 1.08, Math.sin(a) * 0.075, 0.012, 0.004, gold, 4); }
      mb.sphere(0, 1.0, 0, 0.065, 0.065, 0.065, orb, 10, 8);
      mb.cyl(0, -0.62, 0, 0, -0.68, 0, 0.022, 0.0, gold, 6);
    },
    club: (mb, w) => {
      const wood = C('#6e4b2e'); mb.cyl(0, -0.1, 0, 0, 0.62, 0, 0.03, 0.075, wood, 7); mb.sphere(0, 0.62, 0, 0.08, 0.06, 0.08, wood, 7, 5);
      for (let i = 0; i < 4; i++) { const a = i * 1.57; mb.cyl(Math.cos(a) * 0.06, 0.45 + i * 0.04, Math.sin(a) * 0.06, Math.cos(a) * 0.12, 0.47 + i * 0.04, Math.sin(a) * 0.12, 0.012, 0, C('#cfc6b0'), 4, false); }
    },
    bow: (mb, w) => {
      const c = C(w.blade || '#7a5534', w.e || 0), str = C('#eeeeee');
      const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8 - 0.5; pts.push([Math.cos(t * 2.4) * 0.12 - 0.12, Math.sin(t * 2.4) * 0.55]); }
      for (let i = 0; i < 8; i++) mb.cyl(pts[i][0], pts[i][1], 0, pts[i + 1][0], pts[i + 1][1], 0, 0.016, 0.016, c, 5);
      mb.cyl(pts[0][0], pts[0][1], 0, pts[8][0], pts[8][1], 0, 0.004, 0.004, str, 3, false);
    },
    greatsword: (mb, w) => { PS.WEAPON_LOOK.sword(mb, Object.assign({ len: 1.25, bladeW: 0.13, guardW: 0.32 }, w)); },
    scythe: (mb, w) => {
      const pole = C('#2a1f33'), blade = C(w.blade || '#3b2b52'), glow = C(w.glow || '#b04dff', 1);
      mb.cyl(0, -0.7, 0, 0, 1.0, 0, 0.026, 0.026, pole, 6);
      mb.extrude([[0, 0.92], [-0.5, 1.02], [-0.85, 0.85], [-0.62, 0.92], [-0.3, 0.9], [0, 0.82]], 0.03, blade);
      mb.extrude([[-0.5, 1.0], [-0.84, 0.86], [-0.6, 0.94]], 0.035, glow);
      mb.sphere(0, 1.02, 0, 0.05, 0.05, 0.05, glow, 6, 5);
    },
    shield: (mb, w) => { mb.sphere(0, 0, 0, 0.2, 0.26, 0.04, C(w.blade || '#7d8794'), 10, 6); mb.sphere(0, 0, 0.03, 0.06, 0.06, 0.03, C(w.glow || '#7fd6ff', 0.6), 6, 4); }
  };

  // ---------------- ヒューマノイド ----------------
  // o: {gender, skin, hair, eye, main, sub, accent, pants, boots, cape, wings, hat, weapon:{type,...}, mask, bony, gown, armor, horns, halo, scarf, headband, crown, offhand}
  function buildHumanoid(o) {
    const mb = new PS.MeshBuilder(), part = partFn(mb, HB);
    const skin = C(o.skin || '#ffe0cc'), hair = C(o.hair || '#4a3a33'), main = C(o.main || '#3a5a9a'), sub = C(o.sub || '#f2efe8'),
      acc = C(o.accent || '#e0b84a', o.accentE || 0.15), pants = C(o.pants || '#2e2c3a'), boots = C(o.boots || '#5a3d2b'), eye = C(o.eye || '#4ab0ff', 0.35);
    const F = o.gender === 'f';
    const sk = o.bony ? C('#e8e2d0') : skin;
    // 頭
    part(HI.head);
    mb.sphere(0, 1.632, 0, 0.13, 0.145, 0.135, sk, 14, 10);
    mb.sphere(0, 1.57, 0.03, 0.085, 0.07, 0.09, sk, 10, 7);
    if (o.mask) {
      mb.sphere(0, 1.6, 0.085, 0.125, 0.15, 0.07, C(o.mask), 10, 7);
      mb.box(-0.045, 1.66, 0.15, 0.06, 0.012, 0.01, C('#b8322a')); mb.box(0.045, 1.66, 0.15, 0.06, 0.012, 0.01, C('#b8322a'));
      mb.sphere(-0.045, 1.615, 0.148, 0.022, 0.016, 0.01, C(o.eyeGlow || '#ffd23a', 1), 6, 4); mb.sphere(0.045, 1.615, 0.148, 0.022, 0.016, 0.01, C(o.eyeGlow || '#ffd23a', 1), 6, 4);
      mb.box(0, 1.555, 0.148, 0.09, 0.014, 0.01, C('#3a2a22'));
    } else if (o.bony) {
      mb.sphere(-0.045, 1.615, 0.118, 0.03, 0.035, 0.02, C('#1a1420'), 6, 4); mb.sphere(0.045, 1.615, 0.118, 0.03, 0.035, 0.02, C('#1a1420'), 6, 4);
      mb.sphere(-0.045, 1.615, 0.128, 0.012, 0.012, 0.01, C(o.eyeGlow || '#6fe0ff', 1), 5, 4); mb.sphere(0.045, 1.615, 0.128, 0.012, 0.012, 0.01, C(o.eyeGlow || '#6fe0ff', 1), 5, 4);
    } else {
      for (const s of [-1, 1]) {
        mb.sphere(s * 0.05, 1.613, 0.116, 0.031, 0.041, 0.016, C('#2b2340'), 8, 6);
        mb.sphere(s * 0.05, 1.608, 0.125, 0.023, 0.03, 0.01, eye, 8, 6);
        mb.sphere(s * 0.058, 1.628, 0.133, 0.009, 0.011, 0.005, C('#ffffff', 0.7), 5, 4);
        mb.box(s * 0.052, 1.664, 0.122, 0.046, 0.008, 0.01, hair, 0, 0, s * -0.12);
        mb.sphere(s * 0.13, 1.61, 0, 0.02, 0.035, 0.025, sk, 6, 4);
      }
      mb.sphere(0, 1.548, 0.117, 0.016, 0.0055, 0.006, C('#b5525a'), 6, 4);
    }
    // 髪
    if (!o.mask && !o.bony && !o.noHair) {
      mb.sphere(0, 1.675, -0.035, 0.15, 0.142, 0.152, hair, 14, 10);
      for (let i = 0; i < 5; i++) { const a = (i / 4 - 0.5) * 1.3; mb.sphere(Math.sin(a) * 0.105, 1.705 - Math.abs(a) * 0.03, Math.cos(a) * 0.098 - 0.005, 0.042, 0.072, 0.026, hair, 7, 5, -0.4, a * 0.6, -a * 0.45); }
      for (const s of [-1, 1]) mb.sphere(s * 0.122, 1.555, 0.035, 0.034, F ? 0.13 : 0.085, 0.034, hair, 7, 5, 0.1, 0, s * 0.08);
      part(HI.hairB);
      if (F) {
        mb.sphere(0, 1.42, -0.115, 0.155, 0.3, 0.075, hair, 12, 8);
        mb.sphere(0, 1.18, -0.125, 0.12, 0.13, 0.06, hair, 10, 6);
        mb.sphere(0, 1.06, -0.125, 0.07, 0.08, 0.04, hair, 8, 5);
      } else {
        mb.sphere(0, 1.585, -0.115, 0.12, 0.1, 0.065, hair, 10, 6);
        part(HI.head);
        const sp = [[0, 1, -0.5], [0.6, 0.6, -0.6], [-0.6, 0.6, -0.6], [0.3, 0.9, 0.2], [-0.35, 0.85, 0.1], [0, 0.4, -1], [0.75, 0.2, -0.5], [-0.75, 0.2, -0.5]];
        for (const d of sp) { const l = Math.hypot(...d); const x = d[0] / l, y = d[1] / l, z = d[2] / l; mb.cyl(x * 0.09, 1.68 + y * 0.09, -0.03 + z * 0.09, x * 0.21, 1.68 + y * 0.21, -0.03 + z * 0.22, 0.055, 0.0, hair, 6, false); }
      }
      if (o.hairAcc) { part(HI.head); mb.sphere(0.115, 1.72, 0.06, 0.028, 0.028, 0.02, C(o.hairAcc, 0.8), 6, 4); mb.cyl(0.115, 1.72, 0.06, 0.16, 1.77, 0.05, 0.018, 0, C(o.hairAcc, 0.8), 4, false); }
    }
    part(HI.head);
    mb.cyl(0, 1.46, 0, 0, 1.54, 0, 0.043, 0.04, sk, 8);
    if (o.horns) for (const s of [-1, 1]) mb.cyl(s * 0.08, 1.74, 0.0, s * 0.14, 1.88, -0.08, 0.035, 0.0, C(o.horns, 0.25), 6);
    if (o.crown) for (let i = 0; i < 7; i++) { const a = (i / 6 - 0.5) * 2.2; mb.cyl(Math.sin(a) * 0.12, 1.75, Math.cos(a) * 0.11, Math.sin(a) * 0.13, 1.88 + (i === 3 ? 0.08 : 0), Math.cos(a) * 0.12, 0.022, 0.0, C(o.crown, 0.9), 4, false); }
    if (o.halo) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mb.sphere(Math.cos(a) * 0.15, 1.9, Math.sin(a) * 0.15 - 0.03, 0.022, 0.022, 0.022, C(o.halo, 1), 5, 4); }
    if (o.headband) { mb.cyl(0, 1.67, -0.005, 0, 1.70, -0.005, 0.155, 0.153, C(o.headband, 0.2), 12, false); mb.box(0, 1.66, -0.17, 0.05, 0.03, 0.02, C(o.headband)); mb.box(0.03, 1.58, -0.19, 0.03, 0.14, 0.01, C(o.headband), 0.2, 0, 0.2); }
    if (o.helmet) {
      part(HI.hat); mb.sphere(0, 1.7, -0.01, 0.168, 0.13, 0.172, C(o.helmet), 12, 6); mb.cyl(0, 1.66, -0.01, 0, 1.672, -0.01, 0.2, 0.2, C(o.helmet), 14);
      mb.cyl(0, 1.73, 0.15, 0, 1.73, 0.2, 0.032, 0.028, C('#fffbe0', 1), 8);
    }
    if (o.hat === 'wizard') {
      part(HI.hat);
      mb.cyl(0, 1.735, 0, 0, 1.75, 0, 0.27, 0.27, main, 16); mb.cyl(0, 1.75, 0, 0, 1.79, 0, 0.143, 0.135, acc, 12);
      mb.cyl(0, 1.75, 0, 0, 2.0, -0.04, 0.14, 0.07, main, 10, false); mb.cyl(0, 2.0, -0.04, 0, 2.17, -0.18, 0.07, 0.0, main, 8, false);
      mb.sphere(0, 1.79, 0.14, 0.03, 0.03, 0.012, C('#fff2a8', 0.9), 6, 4);
    }
    if (o.hat === 'pirate') {
      // 三角帽（トリコーン）
      part(HI.hat); const hc = C('#1e1a22'), hb = C(o.accent || '#ffd27a', 0.3);
      mb.sphere(0, 1.76, 0, 0.17, 0.1, 0.17, hc, 12, 6);
      for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + Math.PI; mb.box(Math.sin(a) * 0.15, 1.77, Math.cos(a) * 0.15, 0.2, 0.09, 0.03, hc, 0.25, a, 0); mb.box(Math.sin(a) * 0.165, 1.815, Math.cos(a) * 0.165, 0.2, 0.012, 0.035, hb, 0.25, a, 0); }
      mb.sphere(0, 1.79, 0.15, 0.035, 0.035, 0.012, C('#ffffff', 0.5), 6, 4);
    }
    if (o.knightHelm) {
      part(HI.head); mb.sphere(0, 1.64, 0, 0.16, 0.17, 0.16, C(o.knightHelm), 12, 8); mb.box(0, 1.62, 0.14, 0.17, 0.025, 0.04, C('#101418'));
      mb.box(0, 1.618, 0.158, 0.14, 0.01, 0.01, C(o.eyeGlow || '#7fffe0', 1));
      part(HI.hat); mb.cyl(0, 1.8, -0.02, 0, 1.96, -0.22, 0.04, 0.01, C(o.plume || '#e04848'), 6);
    }
    // 胴体
    part(HI.chest);
    if (o.armor) {
      mb.box(0, 1.33, 0, 0.36, 0.3, 0.22, C(o.armor)); mb.box(0, 1.33, 0.11, 0.2, 0.2, 0.02, C(o.accent || '#7fffe0', 0.5));
      for (const s of [-1, 1]) mb.sphere(s * 0.2, 1.43, 0, 0.1, 0.08, 0.1, C(o.armor), 8, 5);
    } else {
      mb.sphere(0, 1.335, 0, 0.152, 0.165, 0.1, o.bony ? C('#d8d0bc') : main, 12, 8);
      if (F && !o.bony) for (const s of [-1, 1]) mb.sphere(s * 0.058, 1.33, 0.052, 0.058, 0.052, 0.048, main, 8, 6);
      for (const s of [-1, 1]) mb.sphere(s * 0.158, 1.42, 0, 0.056, 0.05, 0.056, o.bony ? sk : main, 8, 5);
      mb.cyl(0, 1.42, 0, 0, 1.47, 0, 0.078, 0.062, sub, 10);
      mb.box(0, 1.36, 0.098, 0.05, 0.05, 0.012, acc, 0, 0, 0.785);
    }
    if (o.scarf) { mb.cyl(0, 1.43, 0, 0, 1.5, 0, 0.088, 0.078, C(o.scarf), 10); }
    part(HI.spine);
    mb.sphere(0, 1.15, 0, 0.122, 0.105, 0.088, o.bony ? C('#bdb5a2') : sub, 10, 6);
    mb.cyl(0, 1.06, 0, 0, 1.1, 0, 0.13, 0.128, C(o.belt || '#3a2a20'), 12); mb.box(0, 1.08, 0.125, 0.04, 0.035, 0.012, acc);
    part(HI.hips);
    mb.sphere(0, 0.985, 0, 0.142, 0.095, 0.096, pants, 10, 6);
    // スカート / 裾
    if (F || o.gown) {
      part(HI.skirt, M4.compose(new Float32Array(16), 0, 0, 0, 0, 0, 0, 1, 1, 0.86));
      const bot = o.gown ? 0.08 : 0.73, r1 = o.gown ? 0.42 : 0.26;
      mb.cyl(0, 1.06, 0, 0, bot, 0, 0.14, r1, main, 16, false);
      mb.cyl(0, bot + 0.04, 0, 0, bot, 0, r1 - 0.005, r1 + 0.012, acc, 16, false);
      mb.cyl(0, 1.0, 0, 0, bot + 0.03, 0, 0.13, r1 * 0.93, sub, 14, false);
    } else if (!o.bony) {
      part(HI.skirt);
      for (const s of [-1, 1]) mb.box(s * 0.075, 0.8, -0.075, 0.12, 0.44, 0.022, main, 0.18, 0, s * 0.06);
    }
    // 腕
    const sleeve = o.bony ? sk : (o.armor ? C(o.armor) : main), glove = C(o.glove || o.sub || '#f2efe8');
    for (const s of [-1, 1]) {
      const L = s > 0;
      part(L ? HI.uArmL : HI.uArmR);
      mb.cyl(s * 0.185, 1.43, 0, s * 0.205, 1.17, 0, o.bony ? 0.025 : 0.048, o.bony ? 0.022 : 0.04, sleeve, 8);
      part(L ? HI.lArmL : HI.lArmR);
      mb.cyl(s * 0.205, 1.17, 0, s * 0.215, 0.95, 0.012, o.bony ? 0.022 : 0.04, o.bony ? 0.02 : 0.033, o.bony ? sk : (o.gloves ? glove : sk), 8);
      if (!o.bony) mb.cyl(s * 0.212, 0.99, 0.01, s * 0.214, 0.96, 0.012, 0.038, 0.038, acc, 8);
      part(L ? HI.handL : HI.handR);
      mb.sphere(s * 0.215, 0.905, 0.018, 0.034, 0.044, 0.04, o.gloves ? glove : sk, 7, 5);
    }
    // 脚
    for (const s of [-1, 1]) {
      const L = s > 0;
      part(L ? HI.thighL : HI.thighR);
      mb.cyl(s * 0.09, 0.96, 0, s * 0.092, 0.52, 0, o.bony ? 0.03 : 0.072, o.bony ? 0.026 : 0.053, o.bony ? sk : (F && !o.gown ? C(o.stock || '#2b2633') : pants), 9);
      part(L ? HI.shinL : HI.shinR);
      mb.cyl(s * 0.092, 0.52, 0, s * 0.095, 0.09, 0, o.bony ? 0.026 : 0.051, o.bony ? 0.022 : 0.042, o.bony ? sk : boots, 9);
      if (!o.bony) mb.cyl(s * 0.092, 0.40, 0, s * 0.093, 0.36, 0, 0.056, 0.056, acc, 9);
      mb.box(s * 0.095, 0.045, 0.045, 0.09, 0.09, 0.2, o.bony ? sk : boots);
    }
    // マント
    if (o.cape) { part(HI.cape); const lng = o.capeLong ? 0.95 : 0.55; mb.box(0, 1.43 - lng / 2, -0.15, 0.36, lng, 0.022, C(o.cape), 0.1); mb.box(0, 1.43 - lng + 0.02, -0.152, 0.37, 0.04, 0.026, acc, 0.1); }
    // 翼
    if (o.wings) {
      for (const s of [-1, 1]) {
        part(s > 0 ? HI.wingL : HI.wingR);
        const base = [s * 0.07, 1.36, -0.15];
        for (let i = 0; i < 6; i++) {
          const th = 1.05 - i * 0.3, len = 0.42 - i * 0.035;
          const dx = s * Math.cos(th), dy = Math.sin(th);
          const phi = Math.atan2(-dx, dy);
          const c = i < 2 ? C(o.wings) : PS.mixC(C(o.wings), C(o.wingTip || '#9fe0ff'), i / 6);
          c[3] = o.wingE || 0.2 + i * 0.05;
          mb.sphere(base[0] + dx * len * 0.55, base[1] + dy * len * 0.55, base[2] - 0.04 - i * 0.008, 0.055, len * 0.55, 0.012, c, 8, 6, 0.2, 0, phi);
        }
      }
    }
    // 武器
    if (o.weapon) {
      const w = o.weapon, hp = [-0.215, 0.905, 0.02];
      const tilt = w.type === 'staff' ? 0.3 : w.type === 'bow' ? 0 : w.type === 'scythe' ? 0.2 : 2.157;
      part(HI.handR, mm(T(hp[0], hp[1], hp[2]), TR(0, 0, 0, tilt, 0, 0)));
      if (w.type === 'bow') { part(HI.handL, mm(T(0.215, 0.905, 0.04), TR(0, 0, 0, 0, Math.PI / 2, 0))); }
      PS.WEAPON_LOOK[w.type](mb, w);
    }
    if (o.offhand) { part(HI.handL, mm(T(0.25, 0.92, 0.05), TR(0, 0, 0, 0, 1.4, 0))); PS.WEAPON_LOOK[o.offhand.type](mb, o.offhand); }
    return mb;
  }
  PS.buildHumanoid = buildHumanoid;

  // ---------------- 汎用ビルド ----------------
  const meshCache = new Map();
  PS.makeModel = function (key, builderFn) {
    let m = meshCache.get(key);
    if (!m) { const r = builderFn(); m = { mesh: PS.GLH.makeMesh(PS.R.gl, r.mb.pack()), bones: r.bones, anim: r.anim, height: r.height || 1.7, radius: r.radius || 0.4 }; meshCache.set(key, m); }
    return m;
  };
  PS.dropModel = function (key) { meshCache.delete(key); };

  // ---------------- アニメーション: 人型 ----------------
  const SWORD_KEYS = [
    [[0.0, -1.3, 0, -1.25, 0.55, -0.4], [0.35, -1.5, 0, 0.75, -0.65, -0.2], [1.0, -0.7, 0, -0.2, -0.2, -0.2]],
    [[0.0, -1.5, 0, 0.75, -0.6, -0.3], [0.35, -1.35, 0, -1.4, 0.65, -0.3], [1.0, -0.7, 0, -0.35, 0.15, -0.2]],
    [[0.0, -2.95, 0, -0.25, 0.1, -0.5], [0.35, -0.55, 0, -0.1, -0.1, -0.05], [1.0, -0.6, 0, -0.2, 0, -0.2]],
    [[0.0, -1.45, 0, -1.4, 0, 0.2], [0.6, -1.45, 0, -1.4, 0, 0.2], [1.0, -0.8, 0, -0.4, 0, -0.1]]
  ];
  function kf(keys, t, out) {
    let a = keys[0], b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0] && t <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
    let u = b[0] > a[0] ? (t - a[0]) / (b[0] - a[0]) : 1; u = u * u * (3 - 2 * u);
    for (let k = 1; k < a.length; k++) out[k - 1] = a[k] + (b[k] - a[k]) * u;
    return out;
  }
  const kbuf = [0, 0, 0, 0, 0];
  // s: {t, move, sprint, air, vy, climb, swim, fly, atk:{w, i, p}, cast, hurt, dead, wingOpen, emote}
  PS.animHuman = function (rig, s) {
    rig.reset();
    const R = rig.rot, O = rig.off, t = s.t;
    const mv = s.move || 0;
    const ph = s.phase || 0;
    // 呼吸
    R[HI.chest][0] = Math.sin(t * 2.1) * 0.025; R[HI.head][0] = Math.sin(t * 2.1 + 1) * 0.02;
    R[HI.uArmL][2] = 0.1 + Math.sin(t * 2.1) * 0.02; R[HI.uArmR][2] = -0.1 - Math.sin(t * 2.1) * 0.02;
    R[HI.lArmL][0] = -0.12; R[HI.lArmR][0] = -0.12;
    if (s.swim) {
      R[HI.hips][0] = 1.25; O[HI.hips][1] = -0.45;
      R[HI.uArmL][0] = -1.6 + Math.sin(ph) * 1.4; R[HI.uArmR][0] = -1.6 - Math.sin(ph) * 1.4; R[HI.uArmL][2] = 0.4; R[HI.uArmR][2] = -0.4;
      R[HI.thighL][0] = Math.sin(ph * 2) * 0.35; R[HI.thighR][0] = -Math.sin(ph * 2) * 0.35; R[HI.head][0] = -0.9;
      R[HI.cape][0] = -0.3; R[HI.hairB][0] = -0.6;
    } else if (s.climb) {
      R[HI.uArmL][0] = -2.5 + Math.sin(ph) * 0.45; R[HI.uArmR][0] = -2.5 - Math.sin(ph) * 0.45; R[HI.uArmL][2] = 0.25; R[HI.uArmR][2] = -0.25;
      R[HI.lArmL][0] = -0.6; R[HI.lArmR][0] = -0.6;
      R[HI.thighL][0] = -0.6 - Math.sin(ph) * 0.4; R[HI.thighR][0] = -0.6 + Math.sin(ph) * 0.4; R[HI.shinL][0] = 0.9; R[HI.shinR][0] = 0.9;
      R[HI.head][0] = -0.25; O[HI.hips][2] = -0.05;
    } else if (s.fly) {
      R[HI.hips][0] = 0.75; R[HI.uArmL][2] = 0.9; R[HI.uArmR][2] = -0.9; R[HI.uArmL][0] = 0.3; R[HI.uArmR][0] = 0.3;
      R[HI.thighL][0] = 0.15; R[HI.thighR][0] = 0.25; R[HI.shinL][0] = 0.3; R[HI.shinR][0] = 0.5; R[HI.head][0] = -0.6;
      R[HI.cape][0] = -0.9 + Math.sin(t * 9) * 0.1; R[HI.hairB][0] = -0.5; R[HI.skirt][0] = -0.4;
    } else if (s.air) {
      const up = PS.clamp(s.vy / 8, -1, 1);
      R[HI.thighL][0] = -0.7 + up * 0.2; R[HI.thighR][0] = -0.25; R[HI.shinL][0] = 0.9; R[HI.shinR][0] = 0.5;
      R[HI.uArmL][2] = 0.6 - up * 0.3; R[HI.uArmR][2] = -0.6 + up * 0.3; R[HI.uArmL][0] = -0.3; R[HI.uArmR][0] = -0.3;
      R[HI.cape][0] = -0.5 * (1 - up); R[HI.hairB][0] = -0.2 + up * 0.15; R[HI.skirt][0] = -0.15;
    } else if (mv > 0.02) {
      const A = 0.35 + mv * 0.55 + (s.sprint ? 0.15 : 0), sp = Math.sin(ph), cp = Math.cos(ph);
      R[HI.thighL][0] = -sp * A; R[HI.thighR][0] = sp * A;
      R[HI.shinL][0] = Math.max(0, cp) * A * 1.4 + 0.08; R[HI.shinR][0] = Math.max(0, -cp) * A * 1.4 + 0.08;
      R[HI.uArmL][0] = sp * A * 0.85; R[HI.uArmR][0] = -sp * A * 0.85;
      R[HI.lArmL][0] = -0.3 - mv * 0.6; R[HI.lArmR][0] = -0.3 - mv * 0.6;
      O[HI.hips][1] = Math.abs(cp) * 0.045 * mv - 0.02 * mv;
      R[HI.spine][0] = 0.06 + mv * 0.12 + (s.sprint ? 0.15 : 0); R[HI.hips][1] = sp * 0.12 * mv; R[HI.chest][1] = -sp * 0.18 * mv;
      R[HI.cape][0] = -0.25 - mv * 0.55 + Math.sin(ph * 2) * 0.06; R[HI.hairB][0] = -0.1 - mv * 0.25; R[HI.skirt][0] = -0.05 * mv + Math.sin(ph * 2) * 0.05;
    }
    // 翼
    if (rig.n > HI.wingR) {
      const op = s.wingOpen || 0, fl = s.fly ? Math.sin(t * 10) * 0.35 : 0;
      for (const [b, sg] of [[HI.wingL, 1], [HI.wingR, -1]]) { rig.scl[b][0] = rig.scl[b][1] = rig.scl[b][2] = 0.35 + op * 0.75; R[b][1] = sg * (0.9 - op * 0.75); R[b][2] = sg * (fl - 0.1 + op * 0.2); }
    }
    // 攻撃
    if (s.atk) {
      const a = s.atk, p = a.p;
      if (a.w === 'sword' || a.w === 'axe' || a.w === 'club' || a.w === 'greatsword' || a.w === 'scythe') {
        const keys = SWORD_KEYS[a.i % 4];
        kf(keys, p, kbuf);
        const blend = Math.min(1, p * 8) * Math.min(1, (1 - p) * 6 + 0.3);
        R[HI.uArmR][0] = PS.lerp(R[HI.uArmR][0], kbuf[0], blend); R[HI.uArmR][1] = kbuf[1] * blend; R[HI.uArmR][2] = PS.lerp(R[HI.uArmR][2], kbuf[2], blend);
        R[HI.chest][1] += kbuf[3] * blend; R[HI.lArmR][0] = kbuf[4] * blend - 0.2;
        R[HI.uArmL][0] = 0.4 * blend; R[HI.uArmL][2] = 0.5 * blend;
        R[HI.thighL][0] = -0.45 * blend; R[HI.thighR][0] = 0.3 * blend; R[HI.shinR][0] = 0.3 * blend;
        R[HI.spine][0] += 0.18 * blend; O[HI.hips][1] -= 0.06 * blend;
        if (a.i % 4 === 3) R[HI.hips][1] = p < 0.6 ? -p / 0.6 * Math.PI * 2 : 0;
      } else if (a.w === 'staff' || a.w === 'cast') {
        const b = Math.sin(Math.min(1, p) * Math.PI);
        R[HI.uArmR][0] = -1.3 * b - 0.2; R[HI.uArmR][2] = -0.25; R[HI.uArmL][0] = -1.1 * b; R[HI.uArmL][2] = 0.5 * b;
        R[HI.chest][1] = (a.i % 2 ? 0.3 : -0.3) * b; R[HI.thighL][0] = -0.3 * b; R[HI.spine][0] += 0.1 * b;
      } else if (a.w === 'bow') {
        const b = Math.min(1, p * 3);
        R[HI.uArmL][0] = -1.5 * b; R[HI.uArmL][2] = 0.1; R[HI.uArmR][0] = -1.5 * b; R[HI.uArmR][2] = 0.3 * b; R[HI.lArmR][0] = -1.6 * b; R[HI.chest][1] = 0.5 * b;
      } else if (a.w === 'slam') {
        const b = p < 0.5 ? p / 0.5 : 1 - (p - 0.5) / 0.5;
        R[HI.uArmL][0] = -2.8 * b; R[HI.uArmR][0] = -2.8 * b; R[HI.spine][0] = p < 0.5 ? -0.3 * b : 0.5 * b;
      } else if (a.w === 'spin') { R[HI.hips][1] = p * Math.PI * 4; R[HI.uArmL][2] = 1.4; R[HI.uArmR][2] = -1.4; }
    }
    if (s.cast) { const b = s.cast; R[HI.uArmL][0] = -1.6 * b; R[HI.uArmR][0] = -1.6 * b; R[HI.uArmL][2] = 0.5 * b; R[HI.uArmR][2] = -0.5 * b; R[HI.head][0] -= 0.3 * b; }
    if (s.hurt) { const h = s.hurt; R[HI.spine][0] -= 0.35 * h; R[HI.head][0] -= 0.3 * h; R[HI.uArmL][2] += 0.4 * h; R[HI.uArmR][2] -= 0.4 * h; }
    if (s.emote === 'wave') { R[HI.uArmR][2] = -2.6; R[HI.lArmR][2] = Math.sin(t * 7) * 0.5 - 0.2; }
    if (s.emote === 'think') { R[HI.uArmR][0] = -1.2; R[HI.lArmR][0] = -1.9; R[HI.head][2] = 0.15; }
    if (s.emote === 'pray') { R[HI.uArmL][0] = -1.0; R[HI.uArmR][0] = -1.0; R[HI.lArmL][0] = -1.0; R[HI.lArmR][0] = -1.0; R[HI.uArmL][2] = -0.25; R[HI.uArmR][2] = 0.25; R[HI.head][0] = 0.25; }
    if (s.float) { O[HI.hips][1] += Math.sin(t * 1.8) * 0.06; R[HI.thighL][0] = 0.15; R[HI.thighR][0] = 0.25; R[HI.shinL][0] = 0.4; R[HI.shinR][0] = 0.3; R[HI.skirt][0] = Math.sin(t * 1.3) * 0.08; }
    rig.update();
  };

  // ---------------- 四足 ----------------
  function quadBones(p) {
    const h = p.h, L = p.L, w = p.w;
    return [
      ['body', -1, [0, h, 0]], ['neck', 0, [0, h + p.neckY, L * 0.45]], ['head', 1, [0, h + p.neckY + p.neckRise, L * 0.45 + p.neckLen]], ['jaw', 2, [0, h + p.neckY + p.neckRise - 0.05, L * 0.45 + p.neckLen + 0.08]],
      ['legFL', 0, [w, h - 0.05, L * 0.32]], ['legFR', 0, [-w, h - 0.05, L * 0.32]], ['legBL', 0, [w, h - 0.05, -L * 0.32]], ['legBR', 0, [-w, h - 0.05, -L * 0.32]],
      ['tail1', 0, [0, h + 0.05, -L * 0.48]], ['tail2', 8, [0, h + 0.05 + p.tailRise, -L * 0.48 - p.tailLen]], ['tail3', 9, [0, h + 0.05 + p.tailRise * 2, -L * 0.48 - p.tailLen * 2]],
      ['wingL', 0, [w * 0.6, h + p.bodyR[1] * 0.8, L * 0.1]], ['wingR', 0, [-w * 0.6, h + p.bodyR[1] * 0.8, L * 0.1]]
    ];
  }
  PS.buildQuad = function (p) {
    const bones = quadBones(p), mb = new PS.MeshBuilder(), part = partFn(mb, bones);
    const body = C(p.color), dark = C(p.dark || p.color), belly = C(p.belly || p.color), eye = C(p.eye || '#ffdd55', 1), h = p.h, L = p.L;
    part(0);
    mb.sphere(0, h + 0.02, 0, p.bodyR[0], p.bodyR[1], p.bodyR[2], (nx, ny, nz) => ny > 0.35 ? dark : ny < -0.4 ? belly : body, 12, 8);
    if (p.spikes) for (let i = 0; i < 6; i++) { const z = L * 0.35 - i * L * 0.14; mb.cyl(0, h + p.bodyR[1] * 0.85, z, 0, h + p.bodyR[1] + 0.12 * p.spikeS, z - 0.08, 0.06 * p.spikeS, 0, C(p.spikes, p.spikeE || 0), 5); }
    part(1);
    const ny0 = h + p.neckY, nz0 = L * 0.45;
    mb.cyl(0, ny0 - 0.05, nz0 - 0.2, 0, ny0 + p.neckRise, nz0 + p.neckLen, p.neckR, p.neckR * 0.85, body, 9);
    part(2);
    const hy = ny0 + p.neckRise, hz = nz0 + p.neckLen;
    mb.sphere(0, hy, hz + 0.05, p.headR[0], p.headR[1], p.headR[2], body, 10, 7);
    mb.cyl(0, hy - 0.03, hz + 0.1, 0, hy - 0.05, hz + p.headR[2] + p.snout, p.headR[0] * 0.7, p.headR[0] * 0.5, dark, 8);
    for (const s of [-1, 1]) {
      mb.sphere(s * p.headR[0] * 0.62, hy + p.headR[1] * 0.3, hz + p.headR[2] * 0.6, 0.035 * p.eyeS, 0.03 * p.eyeS, 0.03 * p.eyeS, eye, 6, 4);
      if (p.ears) mb.cyl(s * p.headR[0] * 0.55, hy + p.headR[1] * 0.6, hz - 0.02, s * p.headR[0] * 0.85, hy + p.headR[1] + p.ears, hz - 0.08, 0.05 * p.eyeS * 1.5, 0, dark, 5);
      if (p.tusks) mb.cyl(s * p.headR[0] * 0.45, hy - 0.08, hz + p.headR[2] + p.snout * 0.6, s * p.headR[0] * 0.75, hy + 0.06, hz + p.headR[2] + p.snout * 0.9, 0.025, 0, C('#f2ead8'), 5);
      if (p.horns) mb.cyl(s * p.headR[0] * 0.5, hy + p.headR[1] * 0.5, hz - 0.05, s * p.headR[0] * 1.1, hy + p.headR[1] + p.horns, hz - 0.45, 0.07 * p.hornS, 0, C(p.hornC || '#2a2020'), 6);
    }
    part(3); mb.cyl(0, hy - p.headR[1] * 0.55, hz + 0.1, 0, hy - p.headR[1] * 0.6, hz + p.headR[2] + p.snout * 0.9, p.headR[0] * 0.55, p.headR[0] * 0.35, belly, 7);
    const legs = [[4, 1, 1], [5, -1, 1], [6, 1, -1], [7, -1, -1]];
    for (const [bi, sx, sz] of legs) {
      part(bi); const x = sx * p.w, z = sz * L * 0.32;
      mb.cyl(x, h - 0.02, z, x, 0.06, z + sz * 0.02, p.legR, p.legR * 0.7, body, 7);
      mb.sphere(x, 0.05, z + 0.03, p.legR * 0.9, 0.05, p.legR * 1.2, dark, 6, 4);
    }
    for (let k = 0; k < 3; k++) {
      part(8 + k); const z0 = -L * 0.48 - p.tailLen * k, y0 = h + 0.05 + p.tailRise * k;
      const r0 = p.tailR * (1 - k * 0.3), r1 = p.tailR * (1 - (k + 1) * 0.3);
      mb.cyl(0, y0, z0, 0, y0 + p.tailRise, z0 - p.tailLen, Math.max(r0, 0.01), Math.max(r1, 0.005), k === 2 && p.tailTip ? C(p.tailTip, 0.6) : body, 7);
    }
    if (p.wings) for (const s of [-1, 1]) {
      part(s > 0 ? 11 : 12); const bx = s * p.w * 0.6, by = h + p.bodyR[1] * 0.8, bz = L * 0.1, ws = p.wings;
      mb.cyl(bx, by, bz, bx + s * ws * 0.5, by + ws * 0.35, bz - 0.1, 0.06, 0.04, dark, 6);
      mb.cyl(bx + s * ws * 0.5, by + ws * 0.35, bz - 0.1, bx + s * ws, by + ws * 0.15, bz - ws * 0.4, 0.04, 0.02, dark, 6);
      const mem = C(p.wingC || p.color, 0.15);
      mb.setXform(null); const base = bones[s > 0 ? 11 : 12][2];
      mb.xf = T(-base[0], -base[1], -base[2]);
      const pts = [[bx, by, bz], [bx + s * ws * 0.5, by + ws * 0.35, bz - 0.1], [bx + s * ws, by + ws * 0.15, bz - ws * 0.4], [bx + s * ws * 0.6, by - 0.1, bz - ws * 0.65], [bx + s * ws * 0.25, by - 0.05, bz - ws * 0.5]];
      for (const side of [1, -1]) { const ids = pts.map(q => mb.vert(q[0], q[1] + side * 0.01, q[2], 0, side, 0, mem)); for (let i = 1; i < 4; i++) { if ((side > 0) === (s > 0)) mb.tri(ids[0], ids[i + 1], ids[i]); else mb.tri(ids[0], ids[i], ids[i + 1]); } }
    }
    return { mb, bones, anim: PS.animQuad, height: h + p.bodyR[1] + 0.2, radius: Math.max(p.bodyR[0], p.bodyR[2] * 0.7) };
  };
  PS.animQuad = function (rig, s) {
    rig.reset(); const R = rig.rot, O = rig.off, t = s.t, mv = s.move || 0, ph = s.phase || 0;
    O[0][1] = Math.sin(t * 2) * 0.01;
    if (mv > 0.02) {
      const A = 0.3 + mv * 0.5, sp = Math.sin(ph);
      R[4][0] = -sp * A; R[7][0] = -sp * A; R[5][0] = sp * A; R[6][0] = sp * A;
      O[0][1] += Math.abs(Math.cos(ph)) * 0.05 * mv; R[0][0] = Math.sin(ph * 2) * 0.03;
    }
    R[1][0] = Math.sin(t * 1.5) * 0.04; R[8][0] = -0.2 + Math.sin(t * 3 + ph) * 0.15; R[9][1] = Math.sin(t * 2.5) * 0.25; R[10][1] = Math.sin(t * 2.5 + 0.6) * 0.3;
    R[11][2] = 0.2 + Math.sin(t * 2) * 0.1; R[12][2] = -0.2 - Math.sin(t * 2) * 0.1;
    if (s.fly) { const f = Math.sin(t * 6) * 0.6; R[11][2] = f; R[12][2] = -f; }
    if (s.atk) {
      const p = s.atk.p, k = s.atk.kind, b = Math.sin(Math.min(1, p) * Math.PI);
      if (k === 'bite' || k === 'charge') { R[1][0] = 0.4 * b; R[2][0] = -0.3 * b; R[3][0] = 0.5 * b; O[0][2] = 0.15 * b; }
      else if (k === 'breath') { R[1][0] = -0.2; R[2][0] = 0.15; R[3][0] = 0.6; }
      else if (k === 'stomp') { R[0][0] = -0.5 * b; R[4][0] = -1.0 * b; R[5][0] = -1.0 * b; O[0][1] += 0.3 * b; }
      else if (k === 'tail') { R[0][1] = Math.sin(p * Math.PI * 2) * 0.8; R[8][1] = -Math.sin(p * Math.PI * 2) * 1.0; R[9][1] = -Math.sin(p * Math.PI * 2) * 0.8; }
      else if (k === 'roar') { R[1][0] = -0.5 * b; R[3][0] = 0.7 * b; R[11][2] = 0.9 * b; R[12][2] = -0.9 * b; }
    }
    if (s.hurt) { R[0][2] = 0.15 * s.hurt; }
    rig.update();
  };

  // ---------------- スライム ----------------
  PS.buildSlime = function (p) {
    const bones = [['body', -1, [0, 0, 0]], ['top', 0, [0, 0.95, 0]]], mb = new PS.MeshBuilder(), part = partFn(mb, bones);
    const c = C(p.color, p.e || 0.08), hi = C('#ffffff', 0.5);
    part(0);
    mb.sphere(0, 0.48, 0, 0.56, 0.48, 0.56, (nx, ny, nz) => ny > 0.55 ? PS.mixC(c, [1, 1, 1], 0.25).concat(c[3]) : c, 14, 10, 0, 0, 0, (x, y, z) => 1 + Math.sin(x * 9 + z * 7) * 0.02);
    mb.sphere(-0.2, 0.75, 0.33, 0.08, 0.05, 0.04, hi, 6, 4);
    for (const s of [-1, 1]) { mb.sphere(s * 0.16, 0.52, 0.5, 0.065, 0.085, 0.03, C('#1e1630'), 8, 6); mb.sphere(s * 0.14, 0.55, 0.525, 0.022, 0.026, 0.01, C('#ffffff', 0.8), 5, 4); }
    mb.sphere(0, 0.38, 0.53, 0.06, 0.025, 0.02, C('#1e1630'), 6, 4);
    part(1);
    const tc = C(p.top || '#7fd06a', p.topE || 0.2);
    if (p.kind === 'wind') { mb.cyl(0, 0.92, 0, 0, 1.08, 0, 0.02, 0.015, C('#4c8a3a'), 5); mb.sphere(0.07, 1.1, 0, 0.09, 0.03, 0.05, tc, 6, 4, 0, 0, 0.5); mb.sphere(-0.07, 1.1, 0, 0.09, 0.03, 0.05, tc, 6, 4, 0, 0, -0.5); }
    else if (p.kind === 'fire') { for (let i = 0; i < 3; i++) mb.cyl((i - 1) * 0.12, 0.9, 0, (i - 1) * 0.16, 1.25 - Math.abs(i - 1) * 0.1, -0.05, 0.1, 0.0, C('#ffb03a', 1), 6); }
    else if (p.kind === 'ice') { for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; mb.cyl(Math.cos(a) * 0.12, 0.88, Math.sin(a) * 0.12, Math.cos(a) * 0.22, 1.2, Math.sin(a) * 0.22, 0.06, 0.0, C('#c8f4ff', 0.6), 6); } }
    else if (p.kind === 'water') { mb.sphere(0, 1.05, 0, 0.09, 0.12, 0.09, tc, 8, 6); mb.cyl(0, 1.14, 0, 0, 1.25, 0, 0.06, 0, tc, 6); }
    else if (p.kind === 'thunder') { mb.extrude([[0, 1.3], [0.1, 1.1], [0.02, 1.1], [0.08, 0.9], [-0.1, 1.15], [-0.02, 1.15]], 0.04, C('#e6c8ff', 1)); }
    else if (p.kind === 'dark') { for (const s of [-1, 1]) mb.cyl(s * 0.2, 0.85, 0, s * 0.35, 1.15, -0.05, 0.07, 0, C('#2a1a3a'), 6); }
    return { mb, bones, anim: PS.animSlime, height: 1.0, radius: 0.55 };
  };
  PS.animSlime = function (rig, s) {
    rig.reset(); const t = s.t, S = rig.scl[0], O = rig.off[0];
    const hop = s.move > 0.05 ? Math.abs(Math.sin(s.phase * 0.5)) : 0;
    let sq = Math.sin(t * 3) * 0.04 + (s.move > 0.05 ? Math.cos(s.phase) * 0.12 : 0);
    O[1] = hop * 0.5;
    if (s.atk) { const p = s.atk.p; if (p < 0.4) sq = 0.25 * (p / 0.4); else if (p < 0.7) { sq = -0.25; O[1] = Math.sin((p - 0.4) / 0.3 * Math.PI) * 1.2; } else sq = 0.3 * (1 - (p - 0.7) / 0.3); }
    if (s.hurt) sq += s.hurt * 0.3;
    S[0] = 1 + sq; S[1] = 1 - sq; S[2] = 1 + sq;
    rig.rot[1][2] = Math.sin(t * 2.5) * 0.15;
    rig.update();
  };

  // ---------------- サソリ ----------------
  PS.buildScorpion = function (p) {
    const bones = [['body', -1, [0, 0.35, 0]], ['t1', 0, [0, 0.42, -0.45]], ['t2', 1, [0, 0.72, -0.62]], ['t3', 2, [0, 1.0, -0.58]], ['sting', 3, [0, 1.18, -0.38]], ['clawL', 0, [0.28, 0.35, 0.42]], ['clawR', 0, [-0.28, 0.35, 0.42]],
    ['l1', 0, [0.25, 0.32, 0.2]], ['l2', 0, [0.27, 0.32, 0]], ['l3', 0, [0.25, 0.32, -0.2]], ['r1', 0, [-0.25, 0.32, 0.2]], ['r2', 0, [-0.27, 0.32, 0]], ['r3', 0, [-0.25, 0.32, -0.2]]];
    const mb = new PS.MeshBuilder(), part = partFn(mb, bones), c = C(p.color), d = C(p.dark), g = C(p.glow, 1);
    part(0); mb.sphere(0, 0.35, 0, 0.32, 0.16, 0.5, (x, y) => y > 0.3 ? d : c, 12, 7);
    for (let i = 0; i < 4; i++) mb.cyl(-0.28, 0.42, 0.35 - i * 0.22, 0.28, 0.42, 0.35 - i * 0.22, 0.025, 0.025, d, 5);
    for (const s of [-1, 1]) mb.sphere(s * 0.08, 0.45, 0.42, 0.03, 0.03, 0.03, g, 5, 4);
    const segs = [[0.42, -0.45, 0.72, -0.62], [0.72, -0.62, 1.0, -0.58], [1.0, -0.58, 1.18, -0.38]];
    for (let i = 0; i < 3; i++) { part(1 + i); const q = segs[i]; mb.cyl(0, q[0], q[1], 0, q[2], q[3], 0.11 - i * 0.02, 0.09 - i * 0.02, c, 8); mb.sphere(0, q[2], q[3], 0.1 - i * 0.02, 0.1 - i * 0.02, 0.1 - i * 0.02, d, 7, 5); }
    part(4); mb.sphere(0, 1.18, -0.3, 0.08, 0.1, 0.1, c, 7, 5); mb.cyl(0, 1.15, -0.22, 0, 1.0, -0.1, 0.05, 0, g, 6);
    for (const s of [-1, 1]) {
      part(s > 0 ? 5 : 6); mb.cyl(s * 0.28, 0.35, 0.42, s * 0.36, 0.36, 0.7, 0.05, 0.05, c, 6);
      mb.sphere(s * 0.38, 0.36, 0.78, 0.1, 0.07, 0.12, d, 8, 5); mb.cyl(s * 0.42, 0.36, 0.85, s * 0.4, 0.36, 1.02, 0.045, 0, d, 5); mb.cyl(s * 0.33, 0.36, 0.86, s * 0.36, 0.36, 0.98, 0.035, 0, d, 5);
      for (let k = 0; k < 3; k++) { part((s > 0 ? 7 : 10) + k); const z = 0.2 - k * 0.2; mb.cyl(s * 0.25, 0.32, z, s * 0.5, 0.42, z + 0.03, 0.025, 0.02, c, 5); mb.cyl(s * 0.5, 0.42, z + 0.03, s * 0.62, 0.0, z + 0.06, 0.02, 0.01, c, 5); }
    }
    return { mb, bones, anim: PS.animScorp, height: 1.2, radius: 0.55 };
  };
  PS.animScorp = function (rig, s) {
    rig.reset(); const R = rig.rot, t = s.t, ph = s.phase || 0, mv = s.move || 0;
    for (let k = 0; k < 3; k++) { R[7 + k][2] = Math.sin(ph * 2 + k * 2) * 0.25 * mv; R[10 + k][2] = -Math.sin(ph * 2 + k * 2 + 1) * 0.25 * mv; }
    R[1][0] = Math.sin(t * 2) * 0.06; R[2][0] = Math.sin(t * 2 + 0.5) * 0.08;
    R[5][1] = Math.sin(t * 1.7) * 0.1; R[6][1] = -Math.sin(t * 1.7) * 0.1;
    if (s.atk) { const p = s.atk.p, b = Math.sin(Math.min(1, p) * Math.PI);
      if (s.atk.kind === 'sting') { R[1][0] = 0.5 * b; R[2][0] = 0.6 * b; R[3][0] = 0.6 * b; }
      else { R[5][1] = -0.6 * b; R[6][1] = 0.6 * b; rig.off[0][2] = 0.1 * b; } }
    rig.update();
  };

  // ---------------- 浮遊体 (精霊・亡霊) ----------------
  PS.buildSpirit = function (p) {
    const bones = [['core', -1, [0, 1.2, 0]], ['hL', 0, [0.45, 1.1, 0.1]], ['hR', 0, [-0.45, 1.1, 0.1]]], mb = new PS.MeshBuilder(), part = partFn(mb, bones);
    const g = C(p.glow, 1), sh = C(p.shell, p.shellE || 0.3);
    part(0); mb.sphere(0, 1.2, 0, 0.22, 0.22, 0.22, g, 10, 8);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mb.cyl(Math.cos(a) * 0.18, 1.1, Math.sin(a) * 0.18, Math.cos(a) * 0.32, 1.5 + (i % 2) * 0.12, Math.sin(a) * 0.32, 0.09, 0, sh, 5); }
    mb.sphere(0, 1.0, 0, 0.26, 0.18, 0.26, sh, 10, 6);
    for (const s of [-1, 1]) mb.sphere(s * 0.08, 1.24, 0.19, 0.04, 0.05, 0.02, C('#1a1020'), 5, 4);
    for (const s of [-1, 1]) { part(s > 0 ? 1 : 2); mb.sphere(s * 0.45, 1.1, 0.1, 0.09, 0.09, 0.09, sh, 7, 5); }
    return { mb, bones, anim: PS.animSpirit, height: 1.6, radius: 0.4 };
  };
  PS.animSpirit = function (rig, s) {
    rig.reset(); const t = s.t; rig.off[0][1] = Math.sin(t * 2) * 0.12 + 0.3; rig.rot[0][1] = t * 0.8;
    rig.off[1][1] = Math.sin(t * 3) * 0.08; rig.off[2][1] = Math.cos(t * 3) * 0.08;
    if (s.atk) { const b = Math.sin(Math.min(1, s.atk.p) * Math.PI); rig.off[1][2] = 0.3 * b; rig.off[2][2] = 0.3 * b; rig.scl[0][0] = rig.scl[0][1] = rig.scl[0][2] = 1 + 0.2 * b; }
    rig.update();
  };

  // ---------------- キノコ ----------------
  PS.buildMushroom = function (p) {
    const bones = [['stalk', -1, [0, 0, 0]], ['cap', 0, [0, 0.7, 0]]], mb = new PS.MeshBuilder(), part = partFn(mb, bones);
    part(0); mb.cyl(0, 0, 0, 0, 0.75, 0, 0.26, 0.2, C('#f0e2c4'), 10);
    for (const s of [-1, 1]) mb.sphere(s * 0.08, 0.45, 0.22, 0.03, 0.04, 0.02, C('#1e1630'), 5, 4);
    part(1); mb.sphere(0, 0.82, 0, 0.55, 0.3, 0.55, (x, y) => y < -0.2 ? C('#e8d6b0') : C(p.cap), 12, 7);
    for (let i = 0; i < 7; i++) { const a = i * 0.9, r = 0.3 + (i % 2) * 0.12; mb.sphere(Math.cos(a) * r, 0.82 + Math.sqrt(Math.max(0, 1 - r * r / 0.3)) * 0.27, Math.sin(a) * r, 0.06, 0.03, 0.06, C(p.dots || '#fff6e0', p.dotE || 0), 6, 3); }
    return { mb, bones, anim: (rig, s) => { rig.reset(); rig.rot[1][2] = Math.sin(s.t * 2) * 0.06; const sq = s.atk ? Math.sin(s.atk.p * Math.PI) * 0.25 : Math.sin(s.phase || 0) * 0.05 * (s.move || 0); rig.scl[0][1] = 1 - sq; rig.scl[0][0] = rig.scl[0][2] = 1 + sq; rig.update(); }, height: 1.2, radius: 0.5 };
  };

  // ---------------- 岩ゴーレム ----------------
  PS.buildGolem = function (p) {
    const mb = new PS.MeshBuilder(), part = partFn(mb, HB), r = C(p.rock), d = C(p.dark || p.rock), g = C(p.glow, 1);
    part(HI.hips); mb.box(0, 0.95, 0, 0.42, 0.22, 0.3, d);
    part(HI.spine); mb.box(0, 1.12, 0, 0.36, 0.16, 0.26, r);
    part(HI.chest); mb.box(0, 1.38, 0, 0.62, 0.42, 0.38, r, 0.05); mb.sphere(0, 1.36, 0.19, 0.08, 0.08, 0.04, g, 8, 5);
    for (const s of [-1, 1]) mb.box(s * 0.36, 1.55, 0, 0.26, 0.2, 0.3, d, 0, 0, s * 0.2);
    part(HI.head); mb.box(0, 1.66, 0.06, 0.24, 0.2, 0.22, d); mb.box(0, 1.67, 0.18, 0.16, 0.035, 0.02, g);
    for (const s of [-1, 1]) {
      part(s > 0 ? HI.uArmL : HI.uArmR); mb.box(s * 0.42, 1.28, 0, 0.2, 0.36, 0.22, r, 0, 0, s * 0.1);
      part(s > 0 ? HI.lArmL : HI.lArmR); mb.box(s * 0.46, 0.95, 0.03, 0.28, 0.4, 0.3, d); mb.box(s * 0.46, 0.95, 0.19, 0.06, 0.2, 0.02, g);
      part(s > 0 ? HI.thighL : HI.thighR); mb.box(s * 0.15, 0.72, 0, 0.2, 0.42, 0.22, r);
      part(s > 0 ? HI.shinL : HI.shinR); mb.box(s * 0.16, 0.28, 0.02, 0.24, 0.5, 0.28, d);
    }
    return { mb, bones: HB, anim: PS.animHuman, height: 1.9, radius: 0.5 };
  };

  // ---------------- 樹人 ----------------
  PS.buildTreant = function (p) {
    const mb = new PS.MeshBuilder(), part = partFn(mb, HB), bark = C(p.bark || '#6b4a30'), dk = C('#4a3220'), leaf = C(p.leaf || '#5c9a3a'), leaf2 = C(p.leaf2 || '#86c050'), g = C(p.glow || '#c8ff6a', 1);
    part(HI.hips); mb.cyl(0, 0.85, 0, 0, 1.08, 0, 0.2, 0.18, bark, 8);
    part(HI.spine); mb.cyl(0, 1.05, 0, 0, 1.25, 0, 0.18, 0.2, bark, 8);
    part(HI.chest); mb.cyl(0, 1.2, 0, 0, 1.5, 0, 0.22, 0.17, bark, 8);
    part(HI.head); mb.sphere(0, 1.62, 0.02, 0.17, 0.16, 0.15, bark, 8, 6);
    for (const s of [-1, 1]) mb.sphere(s * 0.06, 1.64, 0.15, 0.03, 0.02, 0.01, g, 5, 4);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mb.sphere(Math.cos(a) * 0.2, 1.85 + (i % 2) * 0.1, Math.sin(a) * 0.18, 0.2, 0.17, 0.2, i % 2 ? leaf : leaf2, 8, 6); }
    mb.sphere(0, 2.0, 0, 0.26, 0.2, 0.26, leaf2, 8, 6);
    if (p.flowers) for (let i = 0; i < 6; i++) { const a = i * 1.1; mb.sphere(Math.cos(a) * 0.3, 1.95 + Math.sin(i) * 0.08, Math.sin(a) * 0.28, 0.04, 0.04, 0.04, C(p.flowers, 0.6), 5, 4); }
    for (const s of [-1, 1]) {
      part(s > 0 ? HI.uArmL : HI.uArmR); mb.cyl(s * 0.19, 1.42, 0, s * 0.3, 1.15, 0, 0.07, 0.06, bark, 6);
      part(s > 0 ? HI.lArmL : HI.lArmR); mb.cyl(s * 0.3, 1.15, 0, s * 0.33, 0.8, 0.08, 0.06, 0.04, bark, 6);
      for (let k = 0; k < 3; k++) mb.cyl(s * 0.33, 0.82, 0.08, s * (0.3 + k * 0.05), 0.62, 0.1 + (k - 1) * 0.08, 0.03, 0.0, dk, 4);
      mb.sphere(s * 0.31, 1.2, 0.05, 0.12, 0.1, 0.12, leaf, 6, 5);
      part(s > 0 ? HI.thighL : HI.thighR); mb.cyl(s * 0.09, 0.95, 0, s * 0.12, 0.5, 0, 0.1, 0.08, bark, 7);
      part(s > 0 ? HI.shinL : HI.shinR); mb.cyl(s * 0.12, 0.52, 0, s * 0.14, 0.04, 0.02, 0.08, 0.12, dk, 7);
      for (let k = 0; k < 3; k++) mb.cyl(s * 0.14, 0.06, 0.02, s * (0.14 + Math.cos(k * 2) * 0.16), 0.0, 0.02 + Math.sin(k * 2) * 0.16, 0.04, 0.01, dk, 4);
    }
    return { mb, bones: HB, anim: PS.animHuman, height: 2.2, radius: 0.45 };
  };
})(window.PS);
