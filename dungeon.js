/* Personality Stars - dungeon.js : ダンジョン(迷宮)の生成  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const C = PS.col;
  const THEMES = {
    wind: { floor: '#8f9c8c', floor2: '#7d8a7a', wall: '#aab6a2', trim: '#5ff0c8', light: [0.5, 1.0, 0.85], fog: ['#0e2a2a', '#1a3a3a'], amb: [0.32, 0.4, 0.42] },
    forest: { floor: '#5d6c4c', floor2: '#4e5c40', wall: '#6c7a5a', trim: '#b8ff7a', light: [0.75, 1.0, 0.5], fog: ['#0e1a0e', '#1a2a16'], amb: [0.3, 0.38, 0.28] },
    sand: { floor: '#c8a274', floor2: '#b08a5e', wall: '#bc905e', trim: '#ffd27a', light: [1.0, 0.75, 0.42], fog: ['#2a1a0e', '#3a2814'], amb: [0.42, 0.34, 0.26] },
    ice: { floor: '#a8c2d4', floor2: '#94b0c4', wall: '#c8dcea', trim: '#9fe6ff', light: [0.6, 0.9, 1.0], fog: ['#0e1a2a', '#1a2a3e'], amb: [0.34, 0.4, 0.5] },
    lava: { floor: '#3e3434', floor2: '#2e2626', wall: '#4c3c38', trim: '#ff6a2a', light: [1.0, 0.5, 0.2], fog: ['#1a0806', '#2e100a'], amb: [0.36, 0.24, 0.2] },
    // ---- 第二章：星界の遺跡 ----
    sky: { floor: '#e2e8f2', floor2: '#cfd8e6', wall: '#eef2f8', trim: '#7fd8ff', light: [0.75, 0.95, 1.0], fog: ['#4a6a98', '#86acd6'], amb: [0.52, 0.58, 0.68], pit: '#7f9cc8' },
    mirage: { floor: '#c8905a', floor2: '#b07a48', wall: '#a86a40', trim: '#d8a0ff', light: [1.0, 0.72, 0.45], fog: ['#2a1424', '#4a2a2a'], amb: [0.44, 0.34, 0.3], pit: '#6a3a2a' },
    aurora: { floor: '#a8b8d8', floor2: '#94a4c8', wall: '#c0cce8', trim: '#7fffd0', light: [0.6, 1.0, 0.9], fog: ['#0a1028', '#1a2048'], amb: [0.34, 0.38, 0.52], pit: '#4a5a8a' },
    inferno: { floor: '#3a302e', floor2: '#2a2422', wall: '#3e322e', trim: '#ff4a1a', light: [1.0, 0.45, 0.2], fog: ['#1a0604', '#300c06'], amb: [0.4, 0.24, 0.2], pit: '#ff5a1a' },
    starcave: { floor: '#2e3460', floor2: '#262c50', wall: '#3a4272', trim: '#ffe8a0', light: [0.82, 0.78, 1.0], fog: ['#070a1a', '#121838'], amb: [0.32, 0.32, 0.48], pit: '#1a1e40' },
    roots: { floor: '#4e3e2c', floor2: '#423424', wall: '#5e4c36', trim: '#c86aff', light: [0.82, 0.62, 1.0], fog: ['#0c0a10', '#1a1420'], amb: [0.32, 0.28, 0.34], pit: '#2a2018' },
    // ---- 第四章：世界の果てのギミックダンジョン ----
    glacier4: { floor: '#b4cee2', floor2: '#a0bcd4', wall: '#d4e8f6', trim: '#7fe8ff', light: [0.6, 0.95, 1.0], fog: ['#0c1a36', '#24426a'], amb: [0.38, 0.44, 0.56], pit: '#4a6a98' },
    hell4: { floor: '#3c2824', floor2: '#2e1e1a', wall: '#4c2c26', trim: '#ff8a3a', light: [1.0, 0.5, 0.22], fog: ['#1e0604', '#3a0e08'], amb: [0.42, 0.25, 0.2], pit: '#ff4a1a' },
    dune4: { floor: '#d4ac78', floor2: '#c09662', wall: '#c4925a', trim: '#ffe08a', light: [1.0, 0.82, 0.5], fog: ['#38220e', '#5a3a1a'], amb: [0.46, 0.38, 0.28], pit: '#7a4e24' },
    storm4: { floor: '#4c4c6e', floor2: '#40405e', wall: '#5c5c84', trim: '#c9a0ff', light: [0.82, 0.72, 1.0], fog: ['#0c0a24', '#1e1a44'], amb: [0.36, 0.34, 0.5], pit: '#262050' },
    // ---- 天への階段 ----
    heaven: { floor: '#f2eee4', floor2: '#e4dccb', wall: '#fffaf0', trim: '#ffd27a', light: [1.0, 0.95, 0.8], fog: ['#7fb0f0', '#fff2e0'], amb: [0.62, 0.62, 0.68], pit: '#c8d8f0' }
  };
  const PD = -22, PH = 6.5; // 谷の深さ / 足場の高さ
  PS.DTHEMES = THEMES;
  PS.Dungeon = {
    PD, PH,
    build(def, seed) {
      if (def.ch2) return this.buildLong(def, seed);
      const r = PS.rng(seed), th = THEMES[def.theme], GW = def.size[0], GH = def.size[1], SP = 48, WALL_H = 9, CW = 7;
      const cells = [];
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) cells.push({ i, j, links: [], w: 22 + Math.floor(r() * 4) * 2, d: 22 + Math.floor(r() * 4) * 2 });
      const at = (i, j) => (i >= 0 && j >= 0 && i < GW && j < GH) ? cells[j * GW + i] : null;
      const start = at(0, GH - 1), seen = new Set([start]), stack = [start];
      const link = (a, b) => { a.links.push(b); b.links.push(a); };
      while (stack.length) {
        const c = stack[stack.length - 1];
        const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(d => at(c.i + d[0], c.j + d[1])).filter(n => n && !seen.has(n));
        if (!nb.length) { stack.pop(); continue; }
        const n = nb[Math.floor(r() * nb.length)]; link(c, n); seen.add(n); stack.push(n);
      }
      for (const c of cells) for (const d of [[1, 0], [0, 1]]) { const n = at(c.i + d[0], c.j + d[1]); if (n && !c.links.includes(n) && r() < 0.18) link(c, n); }
      // BFSで最遠 = ボス部屋
      const dist = new Map([[start, 0]]), q = [start]; let far = start;
      while (q.length) { const c = q.shift(); for (const n of c.links) if (!dist.has(n)) { dist.set(n, dist.get(c) + 1); q.push(n); if (dist.get(n) > dist.get(far)) far = n; } }
      far.w = far.d = 42; far.boss = true;
      start.w = start.d = 24; start.start = true;
      const mb = new PS.MeshBuilder(), grid = new Map(), torches = [], deco = [];
      const fc = C(th.floor), fc2 = C(th.floor2), wc = C(th.wall), wc2 = PS.shade(C(th.wall), 0.82), tc = C(th.trim, 0.9);
      const cx = (c) => c.i * SP, cz = (c) => c.j * SP;
      const wall = (x, z, sx, sz) => { mb.box(x, WALL_H / 2 - 0.5, z, sx, WALL_H + 1, sz, wc); mb.box(x, WALL_H + 0.2, z, sx + 0.4, 0.6, sz + 0.4, wc2); mb.box(x, 0.4, z, sx + 0.3, 0.8, sz + 0.3, wc2); PS.World.addBox(x, z, sx / 2, sz / 2, 0, 1e9, grid); };
      const floor = (x0, z0, x1, z1) => {
        const T = 4;
        for (let x = x0; x < x1 - 0.01; x += T) for (let z = z0; z < z1 - 0.01; z += T) {
          const w = Math.min(T, x1 - x), d = Math.min(T, z1 - z), alt = ((Math.round(x / T) + Math.round(z / T)) & 1);
          const sh = 0.92 + PS.hash2(Math.round(x), Math.round(z)) * 0.16;
          mb.box(x + w / 2, -0.5, z + d / 2, w - 0.08, 1, d - 0.08, PS.shade(alt ? fc : fc2, sh));
        }
        mb.box((x0 + x1) / 2, -0.62, (z0 + z1) / 2, x1 - x0, 1, z1 - z0, PS.shade(fc2, 0.6));
      };
      const rooms = [];
      for (const c of cells) {
        const x = cx(c), z = cz(c), hw = c.w / 2, hd = c.d / 2;
        floor(x - hw, z - hd, x + hw, z + hd);
        const sides = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const doors = [];
        for (const [dx, dz] of sides) {
          const n = at(c.i + dx, c.j + dz), has = n && c.links.includes(n);
          if (dx) { const wx = x + dx * (hw + 0.75); if (has) { const seg = (c.d - CW) / 2; wall(wx, z - hd + seg / 2 - 0.75, 1.5, seg + 1.5); wall(wx, z + hd - seg / 2 + 0.75, 1.5, seg + 1.5); doors.push({ x: wx, z, ax: 'x', n }); } else wall(wx, z, 1.5, c.d + 3); }
          else { const wz = z + dz * (hd + 0.75); if (has) { const seg = (c.w - CW) / 2; wall(x - hw + seg / 2 - 0.75, wz, seg + 1.5, 1.5); wall(x + hw - seg / 2 + 0.75, wz, seg + 1.5, 1.5); doors.push({ x, z: wz, ax: 'z', n }); } else wall(x, wz, c.w + 3, 1.5); }
        }
        // 柱 / たいまつ
        if (c.w >= 26 || c.boss) {
          const off = c.boss ? 13 : c.w / 4.2;
          for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { deco.push({ t: 'pillar', x: x + px * off, z: z + pz * off }); PS.World.addBox(x + px * off, z + pz * off, 1.0, 1.0, 0, 1e9, grid); }
          if (c.boss) for (const [px, pz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { deco.push({ t: 'pillar', x: x + px * 17, z: z + pz * 17 }); PS.World.addBox(x + px * 17, z + pz * 17, 1.0, 1.0, 0, 1e9, grid); }
        }
        for (const [dx, dz] of sides) {
          const n = at(c.i + dx, c.j + dz), has = n && c.links.includes(n);
          for (const o of has ? [-1, 1] : [0]) {
            const ox = dx ? x + dx * (hw - 0.1) : x + o * (c.w / 4 + (has ? 1 : 0)), oz = dz ? z + dz * (hd - 0.1) : z + o * (c.d / 4 + (has ? 1 : 0));
            const ry = Math.atan2(-dx, -dz);
            torches.push({ x: ox, y: 3.6, z: oz, ry });
          }
        }
        const room = { c, x, z, w: c.w, d: c.d, doors, boss: !!c.boss, start: !!c.start, cleared: !!c.start, active: false, depth: dist.get(c) };
        room.chest = !room.boss && !room.start && (c.links.length === 1 || r() < 0.2);
        rooms.push(room);
        if (r() < 0.6 && !c.boss) deco.push({ t: 'crystal', x: x + (r() - 0.5) * (c.w - 6), z: z + (r() - 0.5) * (c.d - 6) });
      }
      // 通路
      const done = new Set();
      for (const c of cells) for (const n of c.links) {
        const key = Math.min(c.i + c.j * 99, n.i + n.j * 99) + ':' + Math.max(c.i + c.j * 99, n.i + n.j * 99); if (done.has(key)) continue; done.add(key);
        if (n.i !== c.i) {
          const a = c.i < n.i ? c : n, b = a === c ? n : c, x0 = cx(a) + a.w / 2, x1 = cx(b) - b.w / 2, z = cz(a);
          floor(x0, z - CW / 2, x1, z + CW / 2); wall((x0 + x1) / 2, z - CW / 2 - 0.75, x1 - x0, 1.5); wall((x0 + x1) / 2, z + CW / 2 + 0.75, x1 - x0, 1.5);
          mb.box((x0 + x1) / 2, 0.02, z, x1 - x0, 0.05, 0.6, tc);
        } else {
          const a = c.j < n.j ? c : n, b = a === c ? n : c, z0 = cz(a) + a.d / 2, z1 = cz(b) - b.d / 2, x = cx(a);
          floor(x - CW / 2, z0, x + CW / 2, z1); wall(x - CW / 2 - 0.75, (z0 + z1) / 2, 1.5, z1 - z0); wall(x + CW / 2 + 0.75, (z0 + z1) / 2, 1.5, z1 - z0);
          mb.box(x, 0.02, (z0 + z1) / 2, 0.6, 0.05, z1 - z0, tc);
        }
      }
      // ボス部屋の紋様
      const br = rooms.find(q => q.boss);
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; mb.box(br.x + Math.cos(a) * 14, 0.02, br.z + Math.sin(a) * 14, 1.6, 0.05, 0.4, tc, 0, -a, 0); }
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mb.box(br.x + Math.cos(a) * 7, 0.02, br.z + Math.sin(a) * 7, 0.4, 0.05, 2.4, tc, 0, -a, 0); }
      const st = rooms.find(q => q.start);
      const gl = PS.R.gl;
      const pillar = PS.GLH.makeMesh(gl, PS.Props.pillar(th.wall, th.trim).pack());
      const crystal = PS.GLH.makeMesh(gl, PS.Props.crystal(3, th.trim).pack());
      // 地図
      const minX = -SP / 2 - 10, minZ = -SP / 2 - 10, maxX = (GW - 1) * SP + SP / 2 + 10, maxZ = (GH - 1) * SP + SP / 2 + 10;
      return {
        def, theme: th, mesh: PS.GLH.makeMesh(gl, mb.pack()), grid, rooms, torches, deco, pillar, crystal,
        start: { x: st.x, z: st.z + 6 }, exit: { x: st.x, z: st.z - 8 }, boss: br, bounds: [minX, minZ, maxX, maxZ], CW, ground: () => 0, abil: {}
      };
    },
    // ================= 第二章：長編の遺跡（一本道・谷と高台のギミック） =================
    buildLong(def, seed) {
      const r = PS.rng(seed), th = THEMES[def.theme], GW = def.size[0], GH = def.size[1], SP = 54, WALL_H = 10, CW = 7;
      const cells = [], at = (i, j) => (i >= 0 && j >= 0 && i < GW && j < GH) ? cells[j * GW + i] : null;
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) cells.push({ i, j, links: [], w: 28, d: 28 });
      // 蛇行する一本道
      const path = [];
      for (let jj = 0; jj < GH; jj++) { const j = GH - 1 - jj; for (let ii = 0; ii < GW; ii++) path.push(at(jj % 2 ? GW - 1 - ii : ii, j)); }
      for (let k = 0; k < path.length - 1; k++) { path[k].links.push(path[k + 1]); path[k + 1].links.push(path[k]); }
      const n = path.length, abil = def.abil || [];
      const altarAt = [3, abil.length > 1 ? Math.floor(n / 2) + 1 : -1], restAt = Math.floor(n * 0.66);
      path.forEach((c, k) => {
        c.k = k;
        if (k === 0) { c.kind = 'start'; c.w = c.d = 24; }
        else if (k === n - 1) { c.kind = 'boss'; c.w = c.d = 44; }
        else if (k === altarAt[0]) { c.kind = 'altar'; c.altar = abil[0]; c.w = c.d = 30; }
        else if (k === altarAt[1]) { c.kind = 'altar'; c.altar = abil[1]; c.w = c.d = 30; }
        else if (k === restAt) { c.kind = 'rest'; c.w = c.d = 24; }
        else {
          const have = abil.filter((a, i) => altarAt[i] >= 0 && k > altarAt[i]);
          if (have.length && (def.ch4 ? k % 3 === 0 : (k % 2 === 0 || r() < 0.25))) { const a = have.length > 1 ? have[(k >> 1) % 2] : have[0]; c.kind = a === 'wing' ? 'pit' : 'ledge'; c.w = c.d = 34; }
          else { c.kind = 'normal'; c.w = c.d = 26 + Math.floor(r() * 3) * 2; }
        }
      });
      // 第四章：スイッチの水晶の部屋と、仕掛け（罠）の部屋
      if (def.ch4) { let nn = 0; for (const c of path) if (c.kind === 'normal') { if (nn++ % 2 === 0) { c.kind = 'switch'; c.w = c.d = 34; } else { c.trap = true; c.w = c.d = 30; } } }
      const jumpAt = abil.indexOf('jump') >= 0 ? altarAt[abil.indexOf('jump')] : 1e9;
      const mb = new PS.MeshBuilder(), grid = new Map(), torches = [], deco = [], items = [];
      const fc = C(th.floor), fc2 = C(th.floor2), wc = C(th.wall), wc2 = PS.shade(C(th.wall), 0.82), tc = C(th.trim, 0.9), pc = C(th.pit || th.floor2, def.theme === 'inferno' ? 0.6 : 0.05);
      const cx = (c) => c.i * SP, cz = (c) => c.j * SP;
      const wall = (x, z, sx, sz) => { mb.box(x, WALL_H / 2 - 0.5, z, sx, WALL_H + 1, sz, wc); mb.box(x, WALL_H + 0.2, z, sx + 0.4, 0.6, sz + 0.4, wc2); mb.box(x, 0.4, z, sx + 0.3, 0.8, sz + 0.3, wc2); PS.World.addBox(x, z, sx / 2, sz / 2, 0, 1e9, grid); };
      const floor = (x0, z0, x1, z1, y, cA, cB) => {
        const T = 4; y = y || 0;
        for (let x = x0; x < x1 - 0.01; x += T) for (let z = z0; z < z1 - 0.01; z += T) {
          const w = Math.min(T, x1 - x), d = Math.min(T, z1 - z), alt = ((Math.round(x / T) + Math.round(z / T)) & 1);
          mb.box(x + w / 2, y - 0.5, z + d / 2, w - 0.08, 1, d - 0.08, PS.shade(alt ? (cA || fc) : (cB || fc2), 0.92 + PS.hash2(Math.round(x), Math.round(z)) * 0.16));
        }
        mb.box((x0 + x1) / 2, y - 0.62, (z0 + z1) / 2, x1 - x0, 1, z1 - z0, PS.shade(cB || fc2, 0.6));
      };
      const rooms = [], byCell = new Map();
      for (const c of path) {
        const x = cx(c), z = cz(c), hw = c.w / 2, hd = c.d / 2, L = 4.5;
        const room = { c, x, z, w: c.w, d: c.d, doors: [], kind: c.kind, boss: c.kind === 'boss', start: c.kind === 'start', cleared: c.kind === 'start' || c.kind === 'rest', active: false, depth: c.k, altar: c.altar || null, plats: [], pit: null };
        if (c.kind === 'pit') {
          room.pit = { x0: x - hw + L, z0: z - hd + L, x1: x + hw - L, z1: z + hd - L, y: PD };
          floor(x - hw, z - hd, x + hw, z - hd + L); floor(x - hw, z + hd - L, x + hw, z + hd);
          floor(x - hw, z - hd + L, x - hw + L, z + hd - L); floor(x + hw - L, z - hd + L, x + hw, z + hd - L);
          floor(room.pit.x0, room.pit.z0, room.pit.x1, room.pit.z1, PD, pc, PS.shade(pc, 0.85));
          const P = room.pit, pw = P.x1 - P.x0, ph = P.z1 - P.z0;
          mb.box(x, PD / 2, P.z0 + 0.3, pw, -PD, 0.6, wc2); mb.box(x, PD / 2, P.z1 - 0.3, pw, -PD, 0.6, wc2);
          mb.box(P.x0 + 0.3, PD / 2, z, 0.6, -PD, ph, wc2); mb.box(P.x1 - 0.3, PD / 2, z, 0.6, -PD, ph, wc2);
          for (const [bx, bz, sx, sz] of [[x, P.z0, pw, 0.15], [x, P.z1, pw, 0.15], [P.x0, z, 0.15, ph], [P.x1, z, 0.15, ph]]) mb.box(bx, 0.03, bz, sx + 0.3, 0.06, sz + 0.3, tc);
          for (let k = 0; k < 6; k++) mb.box(x, PD * (0.2 + k * 0.14), P.z0 + 0.62, pw - 1, 0.12, 0.05, C(th.trim, 0.5));
          PS.World.addBox(x, P.z0, pw / 2, 0.35, 0, -0.3, grid); PS.World.addBox(x, P.z1, pw / 2, 0.35, 0, -0.3, grid);
          PS.World.addBox(P.x0, z, 0.35, ph / 2, 0, -0.3, grid); PS.World.addBox(P.x1, z, 0.35, ph / 2, 0, -0.3, grid);
          room.updraft = { x, z, r: 3.2 };
          for (let k = 0; k < 4; k++) deco.push({ t: 'crystal', x: P.x0 + 2 + (k % 2) * (pw - 4), z: P.z0 + 2 + (k >> 1) * (ph - 4), y: PD });
        } else {
          floor(x - hw, z - hd, x + hw, z + hd);
          if (c.kind === 'ledge') {
            for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
              const px = x + sx * 9.5, pz = z + sz * 9.5;
              mb.box(px, PH / 2, pz, 6, PH, 6, wc); mb.box(px, PH + 0.02, pz, 6.3, 0.12, 6.3, wc2); mb.box(px, PH + 0.1, pz, 5.9, 0.06, 5.9, fc); for (const [ex, ez, sx, sz] of [[0, -3.02, 6.1, 0.14], [0, 3.02, 6.1, 0.14], [-3.02, 0, 0.14, 6.1], [3.02, 0, 0.14, 6.1]]) mb.box(px + ex, PH + 0.15, pz + ez, sx, 0.05, sz, tc); mb.box(px, PH - 0.4, pz, 6.2, 0.5, 6.2, wc2);
              for (let k = 1; k < 4; k++) mb.box(px, k * PH / 4, pz + sz * 3.02, 5.4, 0.1, 0.04, C(th.trim, 0.5));
              room.plats.push({ x: px, z: pz, hw: 3, hd: 3, top: PH }); PS.World.addBox(px, pz, 3, 3, 0, PH - 0.25, grid);
            }
            // 中央のジャンプ台の目印
            for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; mb.box(x + Math.cos(a) * 3, 0.02, z + Math.sin(a) * 3, 0.9, 0.05, 0.3, tc, 0, -a, 0); }
          }
          if (c.kind === 'switch') {
            // 四隅の台座にスイッチの水晶（跳躍の靴を手に入れた後は、高い台座にも置かれる）
            room.orbs = []; room.trap = null;
            const high = c.k > jumpAt;
            [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz], q) => {
              const px = x + sx * 10.5, pz = z + sz * 10.5, top = high && q % 2 === 0 ? PH : 1.5;
              mb.box(px, top / 2, pz, 3.4, top, 3.4, wc); mb.box(px, top + 0.03, pz, 3.7, 0.12, 3.7, wc2); mb.box(px, top + 0.1, pz, 3.2, 0.06, 3.2, tc);
              for (let kk = 1; kk < 4; kk++) mb.box(px, kk * top / 4, pz + sz * 1.72, 3.0, 0.08, 0.04, C(th.trim, 0.5));
              room.plats.push({ x: px, z: pz, hw: 1.7, hd: 1.7, top }); PS.World.addBox(px, pz, 1.7, 1.7, 0, top - 0.25, grid);
              room.orbs.push({ x: px, z: pz, y: top });
            });
            for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; mb.box(x + Math.cos(a) * 5, 0.02, z + Math.sin(a) * 5, 1.2, 0.05, 0.3, tc, 0, -a, 0); }
            for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + 0.785; mb.box(x + Math.cos(a) * 7.4, 0.025, z + Math.sin(a) * 7.4, 0.35, 0.05, 6, tc, 0, -a + Math.PI / 2, 0); }
          }
          if (c.trap) { room.trap = def.gim || 'ice'; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; mb.box(x + Math.cos(a) * (c.w / 2 - 2.2), 0.03, z + Math.sin(a) * (c.d / 2 - 2.2), 1.6, 0.06, 1.6, C(th.trim, 0.55), 0, -a, 0); } }
          if (c.kind === 'altar') { items.push({ t: 'altar', x, z, abil: c.altar, room }); PS.World.addCircle(x, z, 2.1, 1.8, grid); }
          if (c.kind === 'rest') { items.push({ t: 'spring', x, z, room }); PS.World.addCircle(x, z, 2.4, 3, grid); }
        }
        // 壁と扉
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nb = at(c.i + dx, c.j + dz), has = nb && c.links.includes(nb);
          if (dx) { const wx = x + dx * (hw + 0.75); if (has) { const seg = (c.d - CW) / 2; wall(wx, z - hd + seg / 2 - 0.75, 1.5, seg + 1.5); wall(wx, z + hd - seg / 2 + 0.75, 1.5, seg + 1.5); room.doors.push({ x: wx, z, ax: 'x', n: nb }); } else wall(wx, z, 1.5, c.d + 3); }
          else { const wz = z + dz * (hd + 0.75); if (has) { const seg = (c.w - CW) / 2; wall(x - hw + seg / 2 - 0.75, wz, seg + 1.5, 1.5); wall(x + hw - seg / 2 + 0.75, wz, seg + 1.5, 1.5); room.doors.push({ x, z: wz, ax: 'z', n: nb }); } else wall(x, wz, c.w + 3, 1.5); }
          for (const o of has ? [-1, 1] : [0]) {
            const ox = dx ? x + dx * (hw - 0.1) : x + o * (c.w / 4 + (has ? 1 : 0)), oz = dz ? z + dz * (hd - 0.1) : z + o * (c.d / 4 + (has ? 1 : 0));
            torches.push({ x: ox, y: 3.6, z: oz, ry: Math.atan2(-dx, -dz) });
          }
        }
        if (c.kind === 'boss') {
          for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { deco.push({ t: 'pillar', x: x + px * 13, z: z + pz * 13 }); PS.World.addBox(x + px * 13, z + pz * 13, 1.0, 1.0, 0, 1e9, grid); }
          for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; mb.box(x + Math.cos(a) * 14, 0.02, z + Math.sin(a) * 14, 1.6, 0.05, 0.4, tc, 0, -a, 0); }
          for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mb.box(x + Math.cos(a) * 7, 0.02, z + Math.sin(a) * 7, 0.4, 0.05, 2.4, tc, 0, -a, 0); }
        } else if (c.kind === 'normal' && r() < 0.7) deco.push({ t: 'crystal', x: x + (r() - 0.5) * (c.w - 8), z: z + (r() - 0.5) * (c.d - 8) });
        room.chest = c.kind === 'normal' ? r() < 0.3 : c.kind === 'pit' || c.kind === 'ledge' ? r() < 0.4 : c.kind === 'switch' || c.kind === 'rest';
        rooms.push(room); byCell.set(c.i + ',' + c.j, room);
      }
      // 通路
      for (let k = 0; k < n - 1; k++) {
        const a0 = path[k], b0 = path[k + 1];
        if (b0.i !== a0.i) {
          const a = a0.i < b0.i ? a0 : b0, b = a === a0 ? b0 : a0, x0 = cx(a) + a.w / 2, x1 = cx(b) - b.w / 2, z = cz(a);
          floor(x0, z - CW / 2, x1, z + CW / 2); wall((x0 + x1) / 2, z - CW / 2 - 0.75, x1 - x0, 1.5); wall((x0 + x1) / 2, z + CW / 2 + 0.75, x1 - x0, 1.5);
          mb.box((x0 + x1) / 2, 0.02, z, x1 - x0, 0.05, 0.6, tc);
        } else {
          const a = a0.j < b0.j ? a0 : b0, b = a === a0 ? b0 : a0, z0 = cz(a) + a.d / 2, z1 = cz(b) - b.d / 2, x = cx(a);
          floor(x - CW / 2, z0, x + CW / 2, z1); wall(x - CW / 2 - 0.75, (z0 + z1) / 2, 1.5, z1 - z0); wall(x + CW / 2 + 0.75, (z0 + z1) / 2, 1.5, z1 - z0);
          mb.box(x, 0.02, (z0 + z1) / 2, 0.6, 0.05, z1 - z0, tc);
        }
      }
      const gl = PS.R.gl, st = rooms[0], br = rooms[n - 1];
      const pillar = PS.GLH.makeMesh(gl, PS.Props.pillar(th.wall, th.trim).pack());
      const crystal = PS.GLH.makeMesh(gl, PS.Props.crystal(3, th.trim).pack());
      // 床の高さ（谷・高台）。y を渡すと、その高さから乗れる足場も考慮する
      const ground = (x, z, y) => {
        const rm = byCell.get(Math.round(x / SP) + ',' + Math.round(z / SP)); if (!rm) return 0;
        let g = 0; const P = rm.pit;
        if (P && x > P.x0 && x < P.x1 && z > P.z0 && z < P.z1) g = PD;
        if (y != null) for (const q of rm.plats) if (Math.abs(x - q.x) < q.hw && Math.abs(z - q.z) < q.hd && y >= q.top - 0.75) g = Math.max(g, q.top);
        return g;
      };
      const minX = -SP / 2 - 10, minZ = -SP / 2 - 10, maxX = (GW - 1) * SP + SP / 2 + 10, maxZ = (GH - 1) * SP + SP / 2 + 10;
      return {
        def, theme: th, mesh: PS.GLH.makeMesh(gl, mb.pack()), grid, rooms, torches, deco, pillar, crystal, items, long: true, SP,
        start: { x: st.x, z: st.z + 6 }, exit: { x: st.x, z: st.z - 8 }, boss: br, bounds: [minX, minZ, maxX, maxZ], CW, ground, abil: {}
      };
    },
    // ================= 第四章：天への階段（雲の上に浮かぶ島々をつなぐ階段と、頂の決戦場） =================
    buildSky(def, seed) {
      const r = PS.rng(seed), th = THEMES.heaven, mb = new PS.MeshBuilder(), grid = new Map(), deco = [], items = [];
      const acc = C(def.color || th.trim, 0.7), stone = C('#d4cdbd'), stone2 = C('#b4aa96'), gold = C('#d8b25a', 0.1), rock = C('#857d6f'), rock2 = C('#615a4c'), cloud = C('#f4f7ff', 0.1), cloud2 = C('#e2ebfa', 0.08);
      const R0 = 58, LR = 8, AR = 24, AY = 62, N = 6, FW = 5;
      const lands = [];
      for (let k = 0; k < N; k++) { const a = Math.PI / 2 + k * Math.PI * 2 / N; lands.push({ x: Math.cos(a) * R0, z: Math.sin(a) * R0, y: k * 10, a, k, conn: [] }); }
      const arena = { x: 0, z: 0, y: AY, conn: [] };
      // 階段（直線の段）
      const flights = [];
      const mkFlight = (A, rA, B, rB) => {
        let ux = B.x - A.x, uz = B.z - A.z; const Dd = Math.hypot(ux, uz); ux /= Dd; uz /= Dd;
        const yA = A.y, yB = B.y, L = Dd - rA - rB, dy = yB - yA, n = Math.max(4, Math.ceil(dy / 0.55)), sl = L / n;
        const f = { sx: A.x + ux * rA, sz: A.z + uz * rA, ux, uz, L, n, sl, yA, yB, dy, w: FW };
        A.conn.push(Math.atan2(uz, ux)); B.conn.push(Math.atan2(-uz, -ux)); flights.push(f); return f;
      };
      for (let k = 0; k < N - 1; k++) mkFlight(lands[k], LR - 0.6, lands[k + 1], LR - 0.6);
      mkFlight(lands[N - 1], LR - 0.6, arena, AR - 0.6);
      const angNear = (a, list, lim) => list.some(b => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) < lim);
      // 手すり（円周）
      const ring = (cx, cz, y, rad, seg, conn, lim, h) => {
        for (let j = 0; j < seg; j++) {
          const a = (j + 0.5) / seg * Math.PI * 2; if (angNear(a, conn, lim)) continue;
          const px = cx + Math.cos(a) * (rad + 0.15), pz = cz + Math.sin(a) * (rad + 0.15), ch = 2 * (rad + 0.15) * Math.sin(Math.PI / seg) + 0.05;
          mb.box(px, y + h / 2, pz, 0.38, h, ch, stone2, 0, -a, 0); mb.box(px, y + h + 0.06, pz, 0.5, 0.12, ch + 0.04, gold, 0, -a, 0);
          if (j % 2 === 0) mb.sphere(px, y + h + 0.2, pz, 0.12, 0.12, 0.12, acc, 6, 4);
          PS.World.addBox(px, pz, 0.3, ch / 2, -a, y + 3, grid);
        }
      };
      // 浮島（足場）
      const isle = (x, z, y, rad, depth) => {
        mb.cyl(x, y - 0.7, z, x, y, z, rad, rad, stone2, Math.max(16, Math.round(rad * 2.2)), true, stone);
        mb.cyl(x, y - 0.05, z, x, y + 0.04, z, rad + 0.12, rad + 0.12, gold, Math.max(16, Math.round(rad * 2.2)), false);
        mb.cyl(x, y - 0.7, z, x, y - depth, z, rad * 0.96, rad * 0.12, rock, Math.max(10, Math.round(rad * 1.4)), true, rock2);
        for (let k = 0; k < Math.round(rad * 0.7); k++) { const a = r() * 6.283, rr = rad * (0.3 + r() * 0.55), s = 0.6 + r() * rad * 0.12; mb.sphere(x + Math.cos(a) * rr, y - 0.9 - s * 2.2 - r() * depth * 0.35, z + Math.sin(a) * rr, s * 1.4, s * 2.2, s * 1.4, rock, 6, 4); }
        for (let k = 0; k < 3; k++) { const a = r() * 6.283; mb.cyl(x + Math.cos(a) * rad * 0.4, y - depth * 0.6, z + Math.sin(a) * rad * 0.4, x + Math.cos(a) * rad * 0.3, y - depth * 0.6 - 4 - r() * 4, z + Math.sin(a) * rad * 0.3, 0.12, 0.02, C('#9fe0a0', 0.2), 4, false); }
      };
      for (const L of lands) {
        isle(L.x, L.z, L.y, LR, 9 + (L.k % 3) * 2);
        for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; mb.box(L.x + Math.cos(a) * 5.2, L.y + 0.02, L.z + Math.sin(a) * 5.2, 1.0, 0.05, 0.22, acc, 0, -a, 0); }
        mb.cyl(L.x, L.y + 0.01, L.z, L.x, L.y + 0.035, L.z, 1.6, 1.6, acc, 16);
        ring(L.x, L.z, L.y, LR, 16, L.conn, 0.52, 1.0);
      }
      // 頂の決戦場
      isle(0, 0, AY, AR, 26);
      for (let i = 0; i < 32; i++) { const a = i / 32 * 6.283; mb.box(Math.cos(a) * 18, AY + 0.02, Math.sin(a) * 18, 2.2, 0.05, 0.4, gold, 0, -a, 0); }
      for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283; mb.box(Math.cos(a) * 9, AY + 0.025, Math.sin(a) * 9, 0.35, 0.05, 3.2, acc, 0, -a, 0); }
      for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 - Math.PI / 2, b = (i + 2) / 5 * 6.283 - Math.PI / 2; const mx = (Math.cos(a) + Math.cos(b)) * 6.5, mz = (Math.sin(a) + Math.sin(b)) * 6.5, ln = Math.hypot(Math.cos(a) - Math.cos(b), Math.sin(a) - Math.sin(b)) * 13; mb.box(mx, AY + 0.03, mz, ln, 0.05, 0.3, C('#fff2b0', 0.9), 0, -Math.atan2(Math.sin(b) - Math.sin(a), Math.cos(b) - Math.cos(a)), 0); }
      ring(0, 0, AY, AR, 40, arena.conn, 0.22, 1.2);
      for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + 0.2; if (angNear(a, arena.conn, 0.3)) continue; deco.push({ t: 'pillar', x: Math.cos(a) * 21, z: Math.sin(a) * 21, y: AY }); PS.World.addBox(Math.cos(a) * 21, Math.sin(a) * 21, 1.0, 1.0, 0, AY + 12, grid); }
      // 決戦場の上の光輪
      for (let i = 0; i < 48; i++) { const a = i / 48 * 6.283; mb.sphere(Math.cos(a) * 30, AY + 30 + Math.sin(i * 0.5) * 0.4, Math.sin(a) * 30, 0.9, 0.9, 0.9, C('#fff2b0', 1), 6, 4); }
      // 段
      for (const f of flights) {
        const ry = -Math.atan2(f.uz, f.ux), px = -f.uz, pz = f.ux;
        for (let i = 0; i < f.n; i++) {
          const u = (i + 0.5) * f.sl, cx = f.sx + f.ux * u, cz = f.sz + f.uz * u, top = f.yA + (i + 1) * f.dy / f.n;
          mb.box(cx, top - 0.45, cz, f.sl + 0.02, 0.9, f.w, i % 2 ? stone : PS.shade(stone, 0.95), 0, ry, 0);
          mb.box(cx, top - 1.2, cz, f.sl * 0.9, 0.6, f.w * 0.8, stone2, 0, ry, 0);
          for (const s of [-1, 1]) {
            mb.box(cx + px * s * (f.w / 2 + 0.19), top + 0.5, cz + pz * s * (f.w / 2 + 0.19), f.sl + 0.02, 1.0, 0.38, stone2, 0, ry, 0);
            mb.box(cx + px * s * (f.w / 2 + 0.19), top + 1.06, cz + pz * s * (f.w / 2 + 0.19), f.sl + 0.04, 0.12, 0.5, gold, 0, ry, 0);
            mb.box(cx + px * s * (f.w / 2 - 0.12), top + 0.03, cz + pz * s * (f.w / 2 - 0.12), f.sl, 0.05, 0.14, acc, 0, ry, 0);
          }
          if (i % 4 === 2) for (const s of [-1, 1]) mb.sphere(cx + px * s * (f.w / 2 + 0.19), top + 1.3, cz + pz * s * (f.w / 2 + 0.19), 0.16, 0.16, 0.16, acc, 6, 4);
        }
        const mx = f.sx + f.ux * f.L / 2, mz = f.sz + f.uz * f.L / 2, rot = Math.atan2(-f.uz, f.ux);
        for (const s of [-1, 1]) PS.World.addBox(mx + px * s * (f.w / 2 + 0.25), mz + pz * s * (f.w / 2 + 0.25), f.L / 2, 0.28, rot, f.yB + 3, grid);
      }
      // 雲海と遠くの浮島
      for (let i = 0; i < 70; i++) { const a = r() * 6.283, rr = 20 + r() * 230, s = 10 + r() * 22; mb.sphere(Math.cos(a) * rr, -22 - r() * 16, Math.sin(a) * rr, s * 1.6, s * 0.38, s * 1.3, r() < 0.5 ? cloud : cloud2, 10, 5); }
      for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + r() * 0.4, rr = 150 + r() * 90, y = -5 + r() * 90, s = 6 + r() * 10; isle(Math.cos(a) * rr, Math.sin(a) * rr, y, s, s * 1.4); }
      // 休憩所（星の泉）と天界の果実
      const rooms = [];
      lands.forEach((L, k) => rooms.push({ x: L.x, z: L.z, y: L.y, w: LR * 2, d: LR * 2, doors: [], kind: k === 0 ? 'start' : k === 3 ? 'rest' : 'sky', start: k === 0, boss: false, cleared: k === 0 || k === 3, active: false, depth: k, plats: [], pit: null, altar: null }));
      const bossRoom = { x: 0, z: 0, y: AY, w: AR * 2, d: AR * 2, doors: [], kind: 'boss', boss: true, start: false, cleared: false, active: false, depth: N, plats: [], pit: null, altar: null };
      rooms.push(bossRoom);
      items.push({ t: 'spring', x: lands[3].x, z: lands[3].z, y: lands[3].y, room: rooms[3] }); PS.World.addBox(lands[3].x, lands[3].z, 1.3, 1.3, 0, lands[3].y + 3, grid);
      for (const k of [1, 2, 4, 5]) { const L = lands[k], a = L.a + Math.PI * 0.75; items.push({ t: 'fruit', x: L.x + Math.cos(a) * 4.2, z: L.z + Math.sin(a) * 4.2, y: L.y, room: rooms[k] }); }
      const ground = (x, z, y) => {
        let best = -1e4; const lim = y == null ? 1e9 : y + 0.75;
        for (const L of lands) { const dx = x - L.x, dz = z - L.z; if (dx * dx + dz * dz < LR * LR && L.y <= lim && L.y > best) best = L.y; }
        if (x * x + z * z < AR * AR && AY <= lim && AY > best) best = AY;
        for (const f of flights) {
          const dx = x - f.sx, dz = z - f.sz, u = dx * f.ux + dz * f.uz; if (u < 0 || u > f.L) continue;
          if (Math.abs(-dx * f.uz + dz * f.ux) > f.w / 2) continue;
          const top = f.yA + (Math.min(f.n - 1, Math.floor(u / f.sl)) + 1) * f.dy / f.n; if (top <= lim && top > best) best = top;
        }
        return best;
      };
      const gl = PS.R.gl, L0 = lands[0];
      return {
        def, theme: th, mesh: PS.GLH.makeMesh(gl, mb.pack()), grid, rooms, torches: [], deco, items, sky: true, long: false, SP: 48, lands, flights, arena: { x: 0, z: 0, y: AY, r: AR },
        pillar: PS.GLH.makeMesh(gl, PS.Props.pillar('#fffaf0', def.color || th.trim).pack()), crystal: PS.GLH.makeMesh(gl, PS.Props.crystal(3, def.color || th.trim).pack()),
        start: { x: L0.x, z: L0.z - 1.5, y: 0 }, exit: { x: L0.x, z: L0.z + 5, y: 0 }, boss: bossRoom, bounds: [-90, -90, 90, 90], CW: 7, ground, abil: {}
      };
    }
  };
})(window.PS);
