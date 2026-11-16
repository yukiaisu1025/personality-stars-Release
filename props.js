/* Personality Stars - props.js : 木・岩・花・建物・ワープポイント等のメッシュ  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const M4 = PS.M4, C = PS.col, MB = PS.MeshBuilder;
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] || 0];
  const with_ = (mb, m, fn) => { const p = mb.xf; mb.xf = p ? M4.mul(new Float32Array(16), p, m) : m; fn(); mb.xf = p; };
  const TRS = (x, y, z, ry, s) => M4.compose(new Float32Array(16), x, y, z, 0, ry || 0, 0, s || 1);
  PS.with_ = with_; PS.TRS = TRS;

  const P = PS.Props = {};
  // ---------------- 木 ----------------
  P.treeBroad = function (v, leafA, leafB, big) {
    const mb = new MB(), r = PS.rng(100 + v * 7 + (big ? 50 : 0));
    const trunk = C('#7a5236'), dk = C('#5b3c28'), la = C(leafA || '#4f9440'), lb = C(leafB || '#a8d45e');
    const H = (big ? 5.5 : 2.3) + v * 0.45, s = big ? 1.9 : 1;
    mb.cyl(0, -0.4, 0, 0.12 * s, H, 0.05, 0.34 * s, 0.2 * s, trunk, 8);
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + r() * 0.5; mb.cyl(0, 0.35 * s, 0, Math.cos(a) * 0.65 * s, -0.25, Math.sin(a) * 0.65 * s, 0.15 * s, 0.04 * s, dk, 5); }
    for (let i = 0; i < 3; i++) { const a = i * 2.1 + r(); mb.cyl(0, H * 0.72, 0, Math.cos(a) * 0.95 * s, H + 0.5 * s, Math.sin(a) * 0.95 * s, 0.11 * s, 0.05 * s, trunk, 5); }
    const n = big ? 8 : 6;
    const col = (nx, ny) => { const t = PS.smooth(-0.15, 0.75, ny); return t > 0.55 ? mix(la, lb, 0.6 + (t - 0.55)) : mix(PS.shade(la, 0.72), la, t / 0.55); };
    const blobs = [[0, 1.35, 0, 1.65]];
    for (let i = 0; i < n - 1; i++) { const a = i / (n - 1) * Math.PI * 2 + r() * 0.6, d = 0.8 + r() * 0.4; blobs.push([Math.cos(a) * d, 0.7 + r() * 0.6, Math.sin(a) * d, 1.05 + r() * 0.35]); }
    blobs.push([0.1, 2.15, -0.1, 1.05]);
    const ph = r() * 10;
    for (const b of blobs) mb.sphere(b[0] * s, H + b[1] * s, b[2] * s, b[3] * s, b[3] * 0.82 * s, b[3] * s, col, 10, 7, 0, 0, 0, (x, y, z) => 1 + Math.sin(x * 4.2 + ph) * Math.cos(z * 3.7 + ph) * 0.09 + Math.sin(y * 6 + x * 3) * 0.04);
    return mb;
  };
  P.pine = function (v, snow) {
    const mb = new MB(), trunk = C('#6a4630'), g1 = C('#2f6b45'), g2 = C('#4e9a5c'), w = C('#f4f8fc');
    const H = 7 + v * 1.5;
    mb.cyl(0, -0.3, 0, 0, H * 0.4, 0, 0.3, 0.2, trunk, 7);
    const L = 5;
    for (let i = 0; i < L; i++) {
      const t = i / L, y0 = 1.4 + t * (H - 2.2), r0 = (1 - t) * 2.3 + 0.5, h = 2.3 - t * 0.6;
      mb.cyl(0, y0, 0, 0, y0 + h, 0, r0, 0.05, snow ? mix(g1, g2, t) : g1, 9, true, snow ? w : g2);
    }
    mb.cyl(0, H - 0.4, 0, 0, H + 0.8, 0, 0.4, 0, snow ? w : g2, 7, false);
    return mb;
  };
  P.palm = function () {
    const mb = new MB(), tr = C('#a07a4e'), tr2 = C('#7a5a38'), lf = C('#5aa23f'), lf2 = C('#8fd05a'), nut = C('#6b4a2a');
    let x = 0, y = 0, z = 0;
    for (let i = 0; i < 7; i++) { const nx = x + 0.12 * i * 0.25, ny = y + 1.0, nz = z; mb.cyl(x, y, z, nx, ny, nz, 0.22 - i * 0.015, 0.2 - i * 0.015, i % 2 ? tr : tr2, 7); x = nx; y = ny; z = nz; }
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; with_(mb, M4.compose(new Float32Array(16), x, y + 0.1, z, 0.55, a, 0, 1), () => mb.sphere(0, -0.15, 1.3, 0.32, 0.05, 1.45, (nx, ny) => ny > 0 ? lf2 : lf, 8, 5, 0, 0, 0, (px, py, pz) => 1)); }
    for (let i = 0; i < 3; i++) { const a = i * 2.1; mb.sphere(x + Math.cos(a) * 0.2, y - 0.15, z + Math.sin(a) * 0.2, 0.13, 0.15, 0.13, nut, 6, 4); }
    return mb;
  };
  P.cactus = function (v) {
    const mb = new MB(), g = C('#5f9a4a'), g2 = C('#7fb85e'), fl = C('#ff7fa8', 0.2);
    const col = (nx, ny, nz) => (Math.abs(Math.sin(Math.atan2(nx, nz) * 4)) > 0.5 ? g2 : g);
    mb.cyl(0, 0, 0, 0, 3.2 + v * 0.6, 0, 0.32, 0.3, g, 10); mb.sphere(0, 3.2 + v * 0.6, 0, 0.3, 0.3, 0.3, col, 10, 6);
    for (const s of [-1, 1]) { const y = 1.4 + (s > 0 ? 0.3 : 0.7); mb.cyl(0, y, 0, s * 0.75, y, 0, 0.18, 0.18, g, 8); mb.cyl(s * 0.75, y - 0.1, 0, s * 0.75, y + 1.1, 0, 0.19, 0.18, g, 8); mb.sphere(s * 0.75, y + 1.1, 0, 0.18, 0.18, 0.18, g2, 8, 5); }
    mb.sphere(0.1, 3.55 + v * 0.6, 0.1, 0.1, 0.08, 0.1, fl, 6, 4);
    return mb;
  };
  P.deadTree = function (v) {
    const mb = new MB(), c = C('#3b3030'), c2 = C('#2a2222'), r = PS.rng(300 + v);
    mb.cyl(0, -0.3, 0, 0.2, 4.5, 0, 0.32, 0.12, c, 7);
    const br = (x, y, z, dx, dy, dz, l, rad, d) => { const ex = x + dx * l, ey = y + dy * l, ez = z + dz * l; mb.cyl(x, y, z, ex, ey, ez, rad, rad * 0.6, d ? c2 : c, 5); if (d < 2) for (let k = 0; k < 2; k++) { const a = r() * 6.28; br(ex, ey, ez, dx * 0.5 + Math.cos(a) * 0.6, 0.6, dz * 0.5 + Math.sin(a) * 0.6, l * 0.6, rad * 0.6, d + 1); } };
    for (let i = 0; i < 3; i++) { const a = i * 2.1 + r(); br(0.15, 3 + i * 0.5, 0, Math.cos(a), 0.5, Math.sin(a), 1.6, 0.12, 0); }
    return mb;
  };
  P.bush = function (v, c1, c2) {
    const mb = new MB(), a = C(c1 || '#4d8f3a'), b = C(c2 || '#8cc456'), r = PS.rng(400 + v);
    for (let i = 0; i < 4; i++) { const x = (r() - 0.5) * 1.2, z = (r() - 0.5) * 1.2, s = 0.55 + r() * 0.35; mb.sphere(x, s * 0.6, z, s, s * 0.8, s, (nx, ny) => mix(a, b, PS.smooth(-0.2, 0.9, ny)), 8, 6, 0, 0, 0, (x2, y2, z2) => 1 + Math.sin(x2 * 7 + i) * 0.06); }
    if (v === 2) for (let i = 0; i < 8; i++) { const an = i * 0.8; mb.sphere(Math.cos(an) * 0.7, 0.6 + (i % 3) * 0.2, Math.sin(an) * 0.7, 0.07, 0.07, 0.07, C('#d8305a', 0.25), 5, 4); }
    return mb;
  };
  P.rock = function (v, c1, c2, topC, big, glow) {
    const mb = new MB(), r = PS.rng(500 + v * 13 + (big ? 7 : 0)), a = C(c1), b = C(c2 || c1), t = topC ? C(topC) : null;
    const n = big ? 3 : 1;
    for (let i = 0; i < n; i++) {
      const s = big ? 2.4 + r() * 1.6 : 0.7 + r() * 0.5, x = i ? (r() - 0.5) * 3.5 : 0, z = i ? (r() - 0.5) * 3.5 : 0, ph = r() * 9;
      mb.sphere(x, s * 0.35, z, s, s * (0.62 + r() * 0.3), s * (0.8 + r() * 0.3), (nx, ny) => t && ny > 0.55 ? t : (ny > 0.1 ? b : a), 8, 6, 0, r() * 3, 0, (px, py, pz) => 1 + PS.clamp(Math.sin(px * 3.1 + ph) * Math.cos(pz * 2.7 + ph) * 0.18 + Math.sin(py * 5 + px * 2) * 0.08, -0.3, 0.3));
    }
    if (glow) for (let i = 0; i < 3; i++) { const a2 = r() * 6.28; mb.cyl(Math.cos(a2) * 0.6, 0.3, Math.sin(a2) * 0.6, Math.cos(a2) * 1.4 * (big ? 2 : 1), 0.35, Math.sin(a2) * 1.4 * (big ? 2 : 1), 0.06, 0.03, C(glow, 1), 4); }
    return mb;
  };
  P.crystal = function (v, col) {
    const mb = new MB(), r = PS.rng(600 + v), c = C(col || '#9fe6ff', 0.45), c2 = C('#e8fbff', 0.6);
    for (let i = 0; i < 5; i++) {
      const a = r() * 6.28, tl = (r() - 0.5) * 0.7, h = 1.2 + r() * 1.8, rad = 0.18 + r() * 0.15, x = Math.cos(a) * r() * 0.6, z = Math.sin(a) * r() * 0.6;
      const tx = x + Math.sin(tl) * h, tz = z + Math.cos(a) * Math.sin(tl) * h;
      mb.cyl(x, -0.2, z, tx, h, tz, rad, rad * 0.9, c, 6, false, c2); mb.cyl(tx, h, tz, tx + (tx - x) * 0.15, h + rad * 2.2, tz + (tz - z) * 0.15, rad * 0.9, 0, c2, 6, false);
    }
    return mb;
  };
  P.flowers = function (v) {
    const mb = new MB(), r = PS.rng(700 + v);
    const pal = [['#fff3a0', '#ffffff'], ['#ff9ec4', '#ffd6e6'], ['#a7b8ff', '#e2c9ff'], ['#ffb35a', '#ffe08a']][v % 4];
    for (let i = 0; i < 9; i++) {
      const x = (r() - 0.5) * 1.6, z = (r() - 0.5) * 1.6, h = 0.25 + r() * 0.25;
      mb.cyl(x, 0, z, x, h, z, 0.012, 0.01, C('#4f8a35'), 3, false);
      const pc = C(pal[i % 2], 0.12);
      for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; mb.sphere(x + Math.cos(a) * 0.045, h, z + Math.sin(a) * 0.045, 0.04, 0.012, 0.04, pc, 5, 3); }
      mb.sphere(x, h + 0.01, z, 0.025, 0.02, 0.025, C('#ffcf3a', 0.2), 5, 3);
    }
    return mb;
  };
  P.fern = function () {
    const mb = new MB(), a = C('#3f7d34'), b = C('#79b852');
    for (let i = 0; i < 7; i++) { const an = i / 7 * 6.28; with_(mb, M4.compose(new Float32Array(16), 0, 0.1, 0, -0.55, an, 0, 1), () => mb.sphere(0, 0.2, 0.55, 0.14, 0.03, 0.6, (nx, ny) => ny > 0 ? b : a, 6, 4)); }
    return mb;
  };
  // ---------------- 採集物 ----------------
  P.gather = function (kind) {
    const mb = new MB();
    if (kind === 'sweetflower') { mb.cyl(0, 0, 0, 0, 0.45, 0, 0.02, 0.015, C('#4f8a35'), 4); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; mb.sphere(Math.cos(a) * 0.09, 0.47, Math.sin(a) * 0.09, 0.08, 0.025, 0.08, C('#fff6d8', 0.35), 6, 3); } mb.sphere(0, 0.49, 0, 0.05, 0.04, 0.05, C('#ffd23a', 0.6), 6, 4); mb.sphere(0.08, 0.15, 0, 0.1, 0.02, 0.05, C('#5fa040'), 5, 3); }
    else if (kind === 'mint') { for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; with_(mb, M4.compose(new Float32Array(16), 0, 0.05, 0, -0.7, a, 0, 1), () => mb.sphere(0, 0.12, 0.12, 0.08, 0.02, 0.14, C('#6fd06a', 0.25), 6, 3)); } mb.sphere(0, 0.25, 0, 0.06, 0.08, 0.06, C('#9cf08a', 0.3), 6, 4); }
    else if (kind === 'mushroom') { mb.cyl(0, 0, 0, 0, 0.25, 0, 0.05, 0.04, C('#f0e0c0'), 6); mb.sphere(0, 0.27, 0, 0.16, 0.09, 0.16, C('#e04a3a', 0.15), 8, 5); for (let k = 0; k < 4; k++) mb.sphere(Math.cos(k * 1.6) * 0.09, 0.33, Math.sin(k * 1.6) * 0.09, 0.025, 0.012, 0.025, C('#ffffff'), 4, 3); }
    else if (kind === 'berry') { mb.append(P.bush(2, '#3f7a34', '#6fae4c')); }
    else if (kind === 'cactusfruit') { mb.sphere(0, 0.3, 0, 0.18, 0.3, 0.08, C('#6fa850'), 8, 5); mb.sphere(0, 0.62, 0, 0.09, 0.11, 0.09, C('#ff5f8a', 0.4), 7, 5); }
    else if (kind === 'snowflower') { mb.cyl(0, 0, 0, 0, 0.35, 0, 0.02, 0.015, C('#7ab0c0'), 4); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; mb.cyl(0, 0.36, 0, Math.cos(a) * 0.14, 0.44, Math.sin(a) * 0.14, 0.05, 0.0, C('#b8f0ff', 0.8), 4); } mb.sphere(0, 0.38, 0, 0.04, 0.04, 0.04, C('#ffffff', 1), 5, 4); }
    else if (kind === 'firefruit') { mb.cyl(0, 0, 0, 0, 0.3, 0, 0.03, 0.02, C('#3a2a22'), 4); mb.sphere(0, 0.38, 0, 0.12, 0.14, 0.12, C('#ff6a2a', 0.9), 8, 6); mb.cyl(0, 0.48, 0, 0.03, 0.58, 0, 0.04, 0, C('#ffc04a', 1), 4); }
    else if (kind === 'skyberry') { mb.append(P.bush(4, '#4a8a5a', '#7ac06a')); for (let k = 0; k < 7; k++) { const a = k * 0.9; mb.sphere(Math.cos(a) * 0.32, 0.5 + (k % 3) * 0.12, Math.sin(a) * 0.32, 0.08, 0.08, 0.08, C('#7fb8ff', 0.5), 6, 4); } }
    else if (kind === 'datefruit') { mb.cyl(0, 0, 0, 0, 0.5, 0, 0.03, 0.02, C('#6a4a2a'), 4); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; mb.sphere(Math.cos(a) * 0.09, 0.42 - (k % 2) * 0.06, Math.sin(a) * 0.09, 0.06, 0.09, 0.06, C('#a8582a', 0.15), 6, 4); } mb.sphere(0, 0.55, 0, 0.2, 0.05, 0.2, C('#6a9a3a'), 6, 3); }
    else if (kind === 'aurorapeach') { mb.cyl(0, 0, 0, 0, 0.32, 0, 0.025, 0.02, C('#5a4a6a'), 4); mb.sphere(0, 0.42, 0, 0.15, 0.14, 0.15, (nx, ny) => ny > 0.2 ? C('#ff9ef0', 0.6) : C('#7fffd0', 0.6), 8, 6); mb.sphere(0.08, 0.6, 0, 0.09, 0.02, 0.05, C('#7ac06a'), 5, 3); }
    else if (kind === 'magmapepper') { mb.cyl(0, 0, 0, 0, 0.2, 0, 0.03, 0.02, C('#3a2a22'), 4); mb.cyl(0, 0.18, 0, 0.08, 0.6, 0.02, 0.09, 0.0, C('#ff3a1a', 0.85), 6); mb.sphere(0, 0.2, 0, 0.07, 0.05, 0.07, C('#4a8a3a'), 6, 4); }
    else if (kind === 'frostember') { mb.cyl(0, 0, 0, 0, 0.3, 0, 0.03, 0.02, C('#3a3036'), 4); mb.sphere(0, 0.4, 0, 0.14, 0.15, 0.14, (nx, ny) => ny > 0 ? C('#9fe6ff', 0.6) : C('#ff6a2a', 0.9), 8, 6); mb.cyl(0, 0.52, 0, 0.02, 0.64, 0, 0.04, 0, C('#bff6ff', 1), 4); }
    else if (kind === 'frostmango') { mb.append(P.bush(7, '#2f6a4a', '#d8f0ec')); for (let k = 0; k < 4; k++) { const a = k * 1.6; mb.sphere(Math.cos(a) * 0.3, 0.45, Math.sin(a) * 0.3, 0.1, 0.13, 0.09, C('#ffb03a', 0.35), 7, 5); } }
    else if (kind === 'baobab') { mb.cyl(0, 0, 0, 0, 0.25, 0, 0.05, 0.04, C('#6a4a30'), 5); mb.sphere(0, 0.36, 0, 0.12, 0.2, 0.12, C('#b8a070'), 8, 6); }
    else if (kind === 'cloudherb') { for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28; mb.cyl(0, 0, 0, Math.cos(a) * 0.12, 0.35, Math.sin(a) * 0.12, 0.025, 0.01, C('#7ac06a'), 4); mb.sphere(Math.cos(a) * 0.13, 0.38, Math.sin(a) * 0.13, 0.06, 0.05, 0.06, C('#ffffff', 0.4), 6, 4); } }
    else if (kind === 'coconut') { for (let k = 0; k < 3; k++) { const a = k * 2.1; mb.sphere(Math.cos(a) * 0.14, 0.13, Math.sin(a) * 0.14, 0.14, 0.13, 0.14, C('#6b4a2a'), 8, 5); } }
    else if (kind === 'icelily') { mb.cyl(0, 0, 0, 0, 0.32, 0, 0.02, 0.015, C('#8ab8d0'), 4); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; mb.cyl(0, 0.33, 0, Math.cos(a) * 0.16, 0.5, Math.sin(a) * 0.16, 0.06, 0.0, C('#dff6ff', 0.85), 4); } mb.sphere(0, 0.36, 0, 0.06, 0.06, 0.06, C('#7fe8ff', 1), 6, 4); for (let k = 0; k < 3; k++) { const a = k * 2.1 + 0.5; mb.sphere(Math.cos(a) * 0.12, 0.05, Math.sin(a) * 0.12, 0.1, 0.02, 0.05, C('#9fd0e0'), 5, 3); } }
    else if (kind === 'snowpear') { mb.cyl(0, 0, 0, 0, 0.25, 0, 0.04, 0.03, C('#6a5a4a'), 5); mb.sphere(0, 0.36, 0, 0.13, 0.12, 0.13, C('#f0f4e0', 0.25), 8, 6); mb.sphere(0, 0.5, 0, 0.08, 0.1, 0.08, C('#f0f4e0', 0.25), 7, 5); mb.cyl(0, 0.58, 0, 0.01, 0.66, 0, 0.015, 0.01, C('#5a4a3a'), 4); mb.sphere(0.06, 0.62, 0, 0.07, 0.015, 0.04, C('#9ad0a0'), 5, 3); }
    else if (kind === 'iceshard') { for (let k = 0; k < 5; k++) { const a = k * 1.3, rr = k ? 0.16 : 0; mb.cyl(Math.cos(a) * rr * 0.6, 0, Math.sin(a) * rr * 0.6, Math.cos(a) * rr, (k ? 0.45 : 0.75), Math.sin(a) * rr, k ? 0.08 : 0.12, 0, C('#bff6ff', 0.75), 6); } }
    else if (kind === 'nightbloom') { mb.cyl(0, 0, 0, 0, 0.4, 0, 0.02, 0.015, C('#3a4a6a'), 4); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; mb.sphere(Math.cos(a) * 0.1, 0.42, Math.sin(a) * 0.1, 0.09, 0.025, 0.09, C('#fff2b0', 0.9), 6, 3); } mb.sphere(0, 0.44, 0, 0.05, 0.05, 0.05, C('#b07aff', 1), 6, 4); }
    else if (kind === 'moonstone') { mb.append(P.rock(11, '#3a3a5a', '#4a4a6a')); for (let k = 0; k < 3; k++) mb.sphere(Math.cos(k * 2.1) * 0.35, 0.55, Math.sin(k * 2.1) * 0.35, 0.16, 0.14, 0.16, C('#fff2b0', 0.85), 7, 5); }
    else if (kind === 'ore') { mb.append(P.rock(9, '#7a7570', '#8f8a84')); for (let k = 0; k < 4; k++) mb.cyl(Math.cos(k * 1.7) * 0.4, 0.3, Math.sin(k * 1.7) * 0.4, Math.cos(k * 1.7) * 0.55, 0.75, Math.sin(k * 1.7) * 0.55, 0.1, 0, C('#8fd8ff', 0.7), 5); }
    return mb;
  };

  // ---------------- 建物 ----------------
  // style: {wall, wood, roof, roofType, snow, stone}
  P.house = function (mb, s, w, d, h) {
    const wall = C(s.wall), wood = C(s.wood || '#6a4a32'), roof = C(s.roof), stone = C(s.stone || '#9a9288'), win = C('#ffe7a0', 0.35), door = C('#5a3a26');
    mb.box(0, -0.6, 0, w + 0.3, 1.4, d + 0.3, stone);
    mb.box(0, h / 2 + 0.1, 0, w, h, d, wall);
    if (s.timber) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) mb.box(sx * w / 2, h / 2 + 0.1, sz * d / 2, 0.22, h, 0.22, wood);
      mb.box(0, h * 0.55, d / 2 + 0.02, w, 0.16, 0.08, wood); mb.box(0, h * 0.55, -d / 2 - 0.02, w, 0.16, 0.08, wood);
      mb.box(w / 2 + 0.02, h * 0.55, 0, 0.08, 0.16, d, wood); mb.box(-w / 2 - 0.02, h * 0.55, 0, 0.08, 0.16, d, wood);
    }
    mb.box(0, 1.1, d / 2 + 0.05, 1.0, 2.0, 0.12, door); mb.box(0, 2.2, d / 2 + 0.08, 1.3, 0.15, 0.2, wood);
    for (const sx of [-1, 1]) { mb.box(sx * w * 0.3, h * 0.6, d / 2 + 0.05, 0.75, 0.8, 0.1, win); mb.box(sx * w * 0.3, h * 0.6 - 0.45, d / 2 + 0.1, 0.9, 0.1, 0.2, wood); }
    mb.box(w / 2 + 0.05, h * 0.6, 0, 0.1, 0.8, 0.75, win); mb.box(-w / 2 - 0.05, h * 0.6, 0, 0.1, 0.8, 0.75, win);
    const top = h + 0.1;
    if (s.roofType === 'flat') {
      mb.box(0, top + 0.15, 0, w + 0.4, 0.3, d + 0.4, roof);
      for (const sx of [-1, 1]) mb.box(sx * (w / 2 + 0.1), top + 0.5, 0, 0.2, 0.5, d + 0.4, roof);
      for (const sz of [-1, 1]) mb.box(0, top + 0.5, sz * (d / 2 + 0.1), w + 0.4, 0.5, 0.2, roof);
      if (s.dome) mb.sphere(w * 0.15, top + 0.3, -d * 0.1, w * 0.28, w * 0.28, w * 0.28, C(s.dome), 12, 6);
    } else {
      const rh = w * 0.55, ov = 0.5;
      PS.with_(mb, M4.compose(new Float32Array(16), 0, top, 0, 0, 0, 0, 1), () => {
        mb.extrude([[-w / 2 - ov, -0.1], [w / 2 + ov, -0.1], [0, rh]], d + ov * 2, roof);
        mb.extrude([[-w / 2, 0], [w / 2, 0], [0, rh - 0.4]], d - 0.05, wall);
        if (s.snow) mb.extrude([[-w / 2 - ov + 0.1, 0.1], [-0.05, rh + 0.08], [0.05, rh + 0.08], [w / 2 + ov - 0.1, 0.1], [w / 2 + ov - 0.3, 0.3], [0, rh + 0.25], [-w / 2 - ov + 0.3, 0.3]], d + ov * 2 - 0.1, C('#f4f8fc'));
      });
      mb.box(w * 0.25, top + rh * 0.7, -d * 0.2, 0.6, rh * 0.9 + 0.6, 0.6, stone);
      mb.box(0, top + rh * 0.5, d / 2 + ov + 0.02, 0.6, 0.6, 0.05, C('#ffe7a0', 0.3));
    }
  };
  P.windmill = function (mb, s) {
    const wall = C(s.wall), roof = C(s.roof), stone = C('#a39b8f');
    mb.cyl(0, -0.5, 0, 0, 9, 0, 2.6, 1.8, wall, 12); mb.cyl(0, -0.5, 0, 0, 1.2, 0, 2.8, 2.7, stone, 12);
    mb.cyl(0, 9, 0, 0, 12, 0, 2.3, 0, roof, 12, true);
    mb.box(0, 1.1, 2.55, 1.1, 2.1, 0.3, C('#5a3a26'));
    mb.box(0, 5, 2.3, 0.8, 0.9, 0.3, C('#ffe7a0', 0.3));
  };
  P.windmillBlades = function () {
    const mb = new MB(), wood = C('#7a5a3a'), cloth = C('#f2ece0');
    mb.cyl(0, 0, -0.2, 0, 0, 0.6, 0.35, 0.3, wood, 8);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; PS.with_(mb, M4.compose(new Float32Array(16), 0, 0, 0.5, 0, 0, a, 1), () => { mb.box(0, 3.3, 0, 0.18, 6.4, 0.12, wood); mb.box(0.55, 3.6, 0, 0.9, 5.0, 0.04, cloth); }); }
    return mb;
  };
  P.well = function (mb) { mb.cyl(0, -0.3, 0, 0, 0.9, 0, 1.0, 1.0, C('#9a9288'), 12); mb.cyl(0, 0.85, 0, 0, 0.9, 0, 0.85, 0.85, C('#2a5a7a', 0.15), 12); for (const s of [-1, 1]) mb.box(s * 0.9, 1.6, 0, 0.15, 1.6, 0.15, C('#6a4a32')); mb.extrude([[-1.3, 2.3], [1.3, 2.3], [0, 3.0]], 1.6, C('#b0503a')); };
  P.lantern = function (mb) { mb.cyl(0, 0, 0, 0, 3, 0, 0.07, 0.06, C('#3a3330'), 6); mb.box(0, 3.1, 0, 0.32, 0.4, 0.32, C('#ffdc8a', 0.85)); mb.cyl(0, 3.3, 0, 0, 3.55, 0, 0.26, 0.0, C('#3a3330'), 4); };
  P.fence = function (mb, len) { const w = C('#8a6a48'); for (let i = 0; i <= len; i += 2) mb.box(i - len / 2, 0.5, 0, 0.15, 1.2, 0.15, w); mb.box(0, 0.75, 0, len, 0.1, 0.08, w); mb.box(0, 0.4, 0, len, 0.1, 0.08, w); };
  P.stall = function (mb, c) { const w = C('#7a5a3a'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) mb.box(sx * 1.3, 1.2, sz * 0.8, 0.12, 2.4, 0.12, w); mb.box(0, 0.8, 0.4, 2.7, 0.15, 1.0, w); mb.extrude([[-1.6, 0], [1.6, 0], [0, 0.7]], 2.0, C(c)); mb.setXform; mb.box(-0.5, 1.0, 0.4, 0.4, 0.25, 0.4, C('#e24a3a')); mb.box(0.4, 1.0, 0.5, 0.4, 0.25, 0.4, C('#f2c94a')); };
  P.crates = function (mb) { const c = C('#9a7448'); mb.box(0, 0.45, 0, 0.9, 0.9, 0.9, c); mb.box(0.95, 0.4, 0.2, 0.8, 0.8, 0.8, c, 0, 0.4, 0); mb.box(0.3, 1.25, 0.1, 0.7, 0.7, 0.7, c, 0, 0.2, 0); mb.cyl(-0.9, 0, 0.4, -0.9, 1.0, 0.4, 0.38, 0.38, C('#7a5234'), 10); };
  P.tent = function (mb, c) { mb.extrude([[-1.8, 0], [1.8, 0], [0, 2.4]], 3.2, C(c)); mb.box(0, 1.2, 1.62, 0.1, 2.4, 0.1, C('#5a3a26')); mb.extrude([[-0.6, 0], [0.6, 0], [0, 1.4]], 0.05, C('#2a1a12')); };
  P.campfire = function (mb) { for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; mb.sphere(Math.cos(a) * 0.6, 0.12, Math.sin(a) * 0.6, 0.2, 0.15, 0.2, C('#7a7570'), 6, 4); } for (let i = 0; i < 3; i++) { const a = i * 2.1; mb.cyl(Math.cos(a) * 0.4, 0.05, Math.sin(a) * 0.4, -Math.cos(a) * 0.1, 0.5, -Math.sin(a) * 0.1, 0.07, 0.05, C('#5a3a26'), 5); } mb.sphere(0, 0.25, 0, 0.25, 0.2, 0.25, C('#ff8a2a', 1), 6, 4); };
  P.totem = function (mb, c) { mb.cyl(0, 0, 0, 0, 3.5, 0, 0.18, 0.15, C('#6a4a32'), 6); mb.sphere(0, 3.5, 0, 0.35, 0.4, 0.3, C('#e8dcc0'), 8, 6); mb.box(0, 3.55, 0.28, 0.3, 0.06, 0.04, C(c)); mb.box(0, 2.6, 0, 0.9, 0.08, 0.08, C('#6a4a32')); for (const s of [-1, 1]) mb.box(s * 0.4, 2.3, 0, 0.25, 0.6, 0.03, C(c)); };
  P.banner = function (mb, c) { mb.cyl(0, 0, 0, 0, 4.5, 0, 0.06, 0.05, C('#4a3a30'), 6); mb.box(0.45, 3.8, 0, 0.9, 1.2, 0.04, C(c)); mb.sphere(0, 4.55, 0, 0.1, 0.1, 0.1, C('#e0c06a', 0.5), 6, 4); };
  P.signpost = function (mb) { mb.cyl(0, 0, 0, 0, 2.2, 0, 0.07, 0.07, C('#6a4a32'), 6); mb.box(0.35, 1.9, 0, 0.8, 0.25, 0.06, C('#9a7a52'), 0, 0, 0.08); mb.box(-0.3, 1.5, 0, 0.7, 0.22, 0.06, C('#9a7a52'), 0, 0, -0.06); };

  // ---------------- ワープポイント / 星の像 / 門 / 宝箱 ----------------
  P.waypointBase = function () {
    const mb = new MB(), st = C('#cfc6b4'), dk = C('#8f8676'), gd = C('#d8b45a');
    mb.cyl(0, -0.5, 0, 0, 0.35, 0, 1.6, 1.5, st, 10); mb.cyl(0, 0.35, 0, 0, 0.5, 0, 1.25, 1.2, dk, 10);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; mb.box(Math.cos(a) * 0.9, 1.4, Math.sin(a) * 0.9, 0.22, 1.9, 0.22, st, 0, -a, 0); mb.box(Math.cos(a) * 0.85, 2.45, Math.sin(a) * 0.85, 0.3, 0.18, 0.3, gd, 0, -a, 0); }
    mb.cyl(0, 0.5, 0, 0, 1.1, 0, 0.35, 0.2, dk, 8);
    return mb;
  };
  P.waypointCrystal = function (active) {
    const mb = new MB(), c = active ? C('#7fe8ff', 1) : C('#7a8a94', 0.05);
    mb.cyl(0, 0, 0, 0, 0.6, 0, 0, 0.32, c, 6, false); mb.cyl(0, 0.6, 0, 0, 1.3, 0, 0.32, 0, c, 6, false);
    return mb;
  };
  P.statue = function () {
    const mb = new MB(), st = C('#e6dfcf'), dk = C('#b8ae9a'), gd = C('#e0c06a');
    mb.cyl(0, -0.4, 0, 0, 0.6, 0, 2.6, 2.4, dk, 12); mb.cyl(0, 0.6, 0, 0, 1.0, 0, 1.9, 1.8, st, 12);
    mb.cyl(0, 1.0, 0, 0, 4.0, 0, 1.0, 0.5, st, 12, false); mb.cyl(0, 4.0, 0, 0, 5.2, 0, 0.5, 0.42, st, 10);
    mb.sphere(0, 5.6, 0, 0.42, 0.48, 0.42, st, 10, 8); mb.sphere(0, 5.72, -0.08, 0.46, 0.4, 0.46, dk, 10, 6);
    for (const s of [-1, 1]) { mb.cyl(s * 0.45, 5.0, 0, s * 0.55, 5.6, 0.75, 0.13, 0.11, st, 6); mb.cyl(s * 0.9, 4.9, -0.2, s * 2.2, 6.4, -0.6, 0.22, 0.02, st, 6); }
    mb.sphere(0, 6.0, 0.95, 0.38, 0.38, 0.38, C('#fff2a0', 1), 10, 8);
    for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28 - Math.PI / 2; mb.cyl(0, 6.0, 0.95, Math.cos(a) * 0.75, 6.0 + Math.sin(a) * 0.75, 0.95, 0.13, 0, C('#ffe680', 1), 4); }
    mb.cyl(0, 0.95, 0, 0, 1.05, 0, 1.92, 1.92, gd, 12);
    return mb;
  };
  P.portal = function (col) {
    const mb = new MB(), st = C(col || '#8e8a80'), dk = PS.shade(C(col || '#8e8a80'), 0.75), rune = C('#a8f0ff', 0.9);
    for (const s of [-1, 1]) { mb.box(s * 3.2, 3, 0, 1.4, 7, 1.4, st); mb.box(s * 3.2, 0.2, 0, 1.9, 0.6, 1.9, dk); for (let k = 0; k < 3; k++) mb.box(s * 3.2, 1.5 + k * 1.8, 0.72, 0.5, 0.18, 0.05, rune); }
    mb.box(0, 7.0, 0, 8.6, 1.4, 1.7, st); mb.box(0, 7.9, 0, 6.0, 0.6, 1.4, dk); mb.cyl(0, 7.0, 0.85, 0, 7.0, 0.95, 0.55, 0.55, rune, 6);
    mb.box(0, -0.2, 2.5, 8, 0.5, 4, dk); mb.box(0, -0.2, -0.5, 8.5, 0.6, 3, dk);
    return mb;
  };
  // 隠された遺跡の入口（岩のアーチ）
  P.caveMouth = function () {
    const mb = new MB(), rk = C('#6a6470'), rk2 = C('#4e4a56'), dark = C('#07070c'), rune = C('#ffe8a0', 1);
    for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 10, x = Math.cos(a) * 4.2, y = Math.sin(a) * 5.4; mb.sphere(x, y, 0.2, 1.3 + (i % 3) * 0.25, 1.2, 1.4, i % 2 ? rk : rk2, 8, 6); }
    mb.sphere(0, 0.6, -0.6, 3.6, 4.6, 1.2, dark, 12, 8);
    mb.sphere(0, -0.6, 0.4, 5.6, 1.2, 2.6, rk2, 10, 6);
    for (let i = 0; i < 5; i++) { const a = Math.PI * (0.2 + i * 0.15), x = Math.cos(a) * 4.0, y = Math.sin(a) * 5.2; mb.box(x, y, 1.45, 0.35, 0.35, 0.08, rune, 0, 0, a); }
    for (const s of [-1, 1]) mb.cyl(s * 2.4, 0, 1.8, s * 2.6, 1.8, 1.8, 0.12, 0.08, C('#3a3330'), 5), mb.sphere(s * 2.6, 1.95, 1.8, 0.2, 0.25, 0.2, C('#9fe6ff', 1), 6, 4);
    return mb;
  };
  // 遺跡の祭壇（力を授ける台座）
  P.starAltar = function () {
    const mb = new MB(), st = C('#d8d2c4'), dk = C('#8a8478'), gd = C('#e0c06a'), gl = C('#bff6ff', 1);
    mb.cyl(0, 0, 0, 0, 0.4, 0, 2.2, 2.0, dk, 10); mb.cyl(0, 0.4, 0, 0, 0.7, 0, 1.6, 1.5, st, 10);
    mb.cyl(0, 0.7, 0, 0, 1.6, 0, 0.6, 0.45, st, 8); mb.cyl(0, 1.6, 0, 0, 1.8, 0, 0.9, 0.9, gd, 10);
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; mb.box(Math.cos(a) * 1.8, 0.42, Math.sin(a) * 1.8, 0.5, 0.06, 0.2, gl, 0, -a, 0); }
    return mb;
  };
  // ---------------- 第三章 ----------------
  // アカシア（サバンナの平らな傘の木）
  P.acacia = function (v) {
    const mb = new MB(), r = PS.rng(700 + v * 13), tr = C('#6a4a30'), tr2 = C('#4a3220'), la = C(v ? '#6a8a3a' : '#7a9a40'), lb = C(v ? '#a8b850' : '#b8c860');
    const H = 4.6 + v * 0.8;
    mb.cyl(0, -0.3, 0, 0.3, H * 0.6, 0.1, 0.32, 0.2, tr, 8);
    const tops = [];
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + r() * 0.6, d = 1.4 + r() * 1.2, tx = Math.cos(a) * d, tz = Math.sin(a) * d, ty = H + r() * 0.6; mb.cyl(0.3, H * 0.6, 0.1, tx, ty, tz, 0.16, 0.08, i % 2 ? tr : tr2, 6); tops.push([tx, ty, tz]); }
    const col = (nx, ny) => (ny > 0.3 ? lb : la);
    for (const [x, y, z] of tops) mb.sphere(x, y + 0.25, z, 1.9 + r() * 0.5, 0.42, 1.9 + r() * 0.5, col, 12, 5);
    mb.sphere(0, H + 0.55, 0, 2.6, 0.5, 2.6, col, 14, 5);
    return mb;
  };
  // 霧氷の密林の大樹（板根＋霜をまとった大きな葉）
  P.jungleTree = function (v) {
    const mb = new MB(), r = PS.rng(800 + v * 17), tr = C('#7a6a5a'), dk = C('#4a3e34'), la = C(v ? '#2f6a4a' : '#3a7a52'), fr = C('#e8f6f4', 0.08);
    const H = 9 + v * 2;
    mb.cyl(0, -0.4, 0, 0.1, H, 0.05, 0.62, 0.32, tr, 10);
    for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 + r() * 0.4; mb.box(Math.cos(a) * 0.7, 0.7, Math.sin(a) * 0.7, 0.12, 1.8, 1.1, dk, 0, -a, 0); }
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + r(), y = H * (0.55 + i * 0.1); mb.cyl(0.05, y, 0.03, Math.cos(a) * 2.6, y + 1.2, Math.sin(a) * 2.6, 0.16, 0.07, tr, 6); mb.sphere(Math.cos(a) * 2.8, y + 1.5, Math.sin(a) * 2.8, 1.8, 0.9, 1.8, (nx, ny) => (ny > 0.45 ? fr : la), 10, 6); }
    mb.sphere(0, H + 0.6, 0, 3.2, 1.4, 3.2, (nx, ny) => (ny > 0.5 ? fr : la), 14, 7);
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + r(); mb.cyl(Math.cos(a) * 2.2, H + 0.2, Math.sin(a) * 2.2, Math.cos(a) * 2.4, H - 2.2 - r() * 2, Math.sin(a) * 2.4, 0.04, 0.02, C('#5a8a5a'), 4); }
    return mb;
  };
  // 結晶の祭壇（守護者の決戦場）
  P.crystalShrine = function (col) {
    const mb = new MB(), st = C('#8a90a4'), dk = C('#4a4e62'), gl = C(col || '#bff6ff', 1), gl2 = C(col || '#bff6ff', 0.6);
    mb.cyl(0, -0.6, 0, 0, 0.3, 0, 30, 29.5, dk, 40); mb.cyl(0, 0.3, 0, 0, 0.42, 0, 29, 29, st, 40);
    for (let i = 0; i < 40; i++) { const a = i / 40 * 6.283; mb.box(Math.cos(a) * 27.6, 0.45, Math.sin(a) * 27.6, 0.25, 0.04, 2.6, gl, 0, -a, 0); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.2; mb.cyl(Math.cos(a) * 26, 0.3, Math.sin(a) * 26, Math.cos(a) * 26, 7.5, Math.sin(a) * 26, 1.0, 0.8, st, 8); mb.cyl(Math.cos(a) * 26, 7.5, Math.sin(a) * 26, Math.cos(a) * 26, 9.2, Math.sin(a) * 26, 0.5, 0, gl2, 6); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; mb.box(Math.cos(a) * 9, 0.44, Math.sin(a) * 9, 0.35, 0.03, 8, gl2, 0, -a, 0); }
    return mb;
  };
  // 祭壇の中央に浮かぶ異界の結晶
  P.voidCrystal = function (col) {
    const mb = new MB(), c = C(col || '#bff6ff', 0.9), c2 = C('#ffffff', 1);
    mb.cyl(0, -1.4, 0, 0, 0, 0, 0, 0.9, c, 6); mb.cyl(0, 0, 0, 0, 1.8, 0, 0.9, 0, c, 6); mb.cyl(0, -0.6, 0, 0, 0.9, 0, 0.12, 0.12, c2, 6);
    return mb;
  };
  // 虚晶の玉座
  P.voidThrone = function () {
    const mb = new MB(), st = C('#2a2440'), st2 = C('#4a3e6a'), gl = C('#ff9ef0', 1), cr = C('#bff6ff', 0.8);
    mb.cyl(0, -0.6, 0, 0, 0.4, 0, 32, 31, st, 44); mb.cyl(0, 0.4, 0, 0, 0.55, 0, 30, 30, st2, 44);
    for (let i = 0; i < 44; i++) { const a = i / 44 * 6.283; mb.box(Math.cos(a) * 28.5, 0.58, Math.sin(a) * 28.5, 0.3, 0.04, 2.8, gl, 0, -a, 0); }
    for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283, h = 6 + (i % 3) * 3; mb.cyl(Math.cos(a) * 27, 0.4, Math.sin(a) * 27, Math.cos(a) * 28.5, h, Math.sin(a) * 28.5, 1.3, 0, cr, 6); }
    mb.box(0, 2.2, -18, 6, 4.4, 2, st2); mb.box(0, 6, -18.6, 4, 7, 0.8, st2); mb.cyl(0, 9.5, -18.6, 0, 13, -18.6, 1.2, 0, gl, 6);
    return mb;
  };
  P.featherItem = function () {
    const mb = new MB(), w = C('#ffffff', 0.6), t = C('#7fd8ff', 1);
    mb.cyl(0, -0.55, 0, 0, 0.6, 0, 0.025, 0.01, C('#e8c46a', 0.6), 4);
    for (let i = 0; i < 9; i++) { const y = -0.4 + i * 0.12, l = 0.28 * Math.sin((i + 1) / 10 * Math.PI); mb.box(-l / 2, y, 0, l, 0.05, 0.02, i > 6 ? t : w, 0, 0, -0.5); mb.box(l / 2, y, 0, l, 0.05, 0.02, i > 6 ? t : w, 0, 0, 0.5); }
    return mb;
  };
  P.bootsItem = function () {
    const mb = new MB(), lc = C('#c8902a', 0.2), gd = C('#ffd27a', 0.9), wg = C('#ffffff', 0.7);
    for (const s of [-1, 1]) { mb.box(s * 0.22, 0, 0, 0.2, 0.45, 0.22, lc); mb.box(s * 0.22, -0.2, 0.1, 0.2, 0.12, 0.42, lc); mb.box(s * 0.22, 0.2, 0, 0.23, 0.06, 0.25, gd); mb.box(s * 0.36, 0.08, -0.05, 0.02, 0.18, 0.3, wg, 0.4, 0, 0); }
    return mb;
  };
  P.chest = function (kind) {
    const mb = new MB(), wood = C(kind === 2 ? '#3a2a4a' : '#8a5a34'), trim = C(kind ? '#f0c85a' : '#9aa4ad', kind === 2 ? 0.4 : 0.1);
    mb.box(0, 0.32, 0, 1.0, 0.6, 0.66, wood); mb.box(0, 0.32, 0, 1.04, 0.1, 0.7, trim);
    for (const s of [-1, 1]) mb.box(s * 0.45, 0.32, 0, 0.08, 0.64, 0.7, trim);
    mb.cyl(-0.5, 0.62, 0, 0.5, 0.62, 0, 0.33, 0.33, wood, 10); mb.box(0, 0.45, 0.34, 0.16, 0.2, 0.05, trim);
    return mb;
  };
  P.stoneCircle = function () { const mb = new MB(); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; mb.box(Math.cos(a) * 9, 1.6, Math.sin(a) * 9, 1.1, 3.6 + (i % 3) * 0.8, 0.8, C('#8e8a80'), 0, -a, 0); } return mb; };
  P.pillar = function (col, glow) { const mb = new MB(), c = C(col), g = C(glow || '#9fe6ff', 0.9); mb.box(0, 0.3, 0, 2.0, 0.6, 2.0, PS.shade(c, 0.8)); mb.cyl(0, 0.6, 0, 0, 8, 0, 0.7, 0.6, c, 8); mb.box(0, 8.2, 0, 1.8, 0.5, 1.8, PS.shade(c, 0.8)); mb.box(0, 4.5, 0.62, 0.3, 1.2, 0.04, g); return mb; };
  P.torch = function () { const mb = new MB(); mb.cyl(0, 0, 0, 0, 0.9, 0.25, 0.06, 0.08, C('#3a3330'), 5); mb.cyl(0, 0.9, 0.25, 0, 1.1, 0.25, 0.14, 0.18, C('#5a4a40'), 6); mb.sphere(0, 1.15, 0.25, 0.12, 0.16, 0.12, C('#ffb04a', 1), 6, 4); return mb; };
})(window.PS);
