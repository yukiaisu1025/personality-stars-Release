/* =========================================================
   Personality Stars - core.js
   数学 / ノイズ / 乱数 / WebGL2 ヘルパー / メッシュビルダー
   (c) 2026 YUKI GROUP
   ========================================================= */
'use strict';
window.PS = window.PS || {};
(function (PS) {
  // ---------------- 数学 ----------------
  const M4 = PS.M4 = {
    create() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
    identity(o) { o.fill(0); o[0] = o[5] = o[10] = o[15] = 1; return o; },
    mul(o, a, b) {
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
      for (let i = 0; i < 4; i++) {
        const b0 = b[i * 4], b1 = b[i * 4 + 1], b2 = b[i * 4 + 2], b3 = b[i * 4 + 3];
        o[i * 4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        o[i * 4 + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        o[i * 4 + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        o[i * 4 + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      }
      return o;
    },
    perspective(o, fovy, aspect, near, far) {
      const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
      o.fill(0); o[0] = f / aspect; o[5] = f; o[10] = (far + near) * nf; o[11] = -1; o[14] = 2 * far * near * nf; return o;
    },
    ortho(o, l, r, b, t, n, f) {
      const lr = 1 / (l - r), bt = 1 / (b - t), nf = 1 / (n - f);
      o.fill(0); o[0] = -2 * lr; o[5] = -2 * bt; o[10] = 2 * nf; o[12] = (l + r) * lr; o[13] = (t + b) * bt; o[14] = (f + n) * nf; o[15] = 1; return o;
    },
    lookAt(o, ex, ey, ez, cx, cy, cz, ux, uy, uz) {
      let z0 = ex - cx, z1 = ey - cy, z2 = ez - cz;
      let l = 1 / (Math.hypot(z0, z1, z2) || 1); z0 *= l; z1 *= l; z2 *= l;
      let x0 = uy * z2 - uz * z1, x1 = uz * z0 - ux * z2, x2 = ux * z1 - uy * z0;
      l = Math.hypot(x0, x1, x2); if (l < 1e-6) { x0 = 1; x1 = 0; x2 = 0; } else { l = 1 / l; x0 *= l; x1 *= l; x2 *= l; }
      const y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
      o[0] = x0; o[1] = y0; o[2] = z0; o[3] = 0; o[4] = x1; o[5] = y1; o[6] = z1; o[7] = 0;
      o[8] = x2; o[9] = y2; o[10] = z2; o[11] = 0;
      o[12] = -(x0 * ex + x1 * ey + x2 * ez); o[13] = -(y0 * ex + y1 * ey + y2 * ez); o[14] = -(z0 * ex + z1 * ey + z2 * ez); o[15] = 1;
      return o;
    },
    invert(o, a) {
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
      const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
      let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det) return null; det = 1 / det;
      o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return o;
    },
    // T * Ry * Rx * Rz * S
    compose(o, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
      const cx = Math.cos(rx), sxn = Math.sin(rx), cy = Math.cos(ry), syn = Math.sin(ry), cz = Math.cos(rz), szn = Math.sin(rz);
      if (sy === undefined) { sy = sx; sz = sx; }
      o[0] = (cy * cz + syn * sxn * szn) * sx; o[1] = (cx * szn) * sx; o[2] = (-syn * cz + cy * sxn * szn) * sx; o[3] = 0;
      o[4] = (-cy * szn + syn * sxn * cz) * sy; o[5] = (cx * cz) * sy; o[6] = (syn * szn + cy * sxn * cz) * sy; o[7] = 0;
      o[8] = (syn * cx) * sz; o[9] = (-sxn) * sz; o[10] = (cy * cx) * sz; o[11] = 0;
      o[12] = tx; o[13] = ty; o[14] = tz; o[15] = 1;
      return o;
    },
    xform(m, x, y, z, out) {
      out = out || [0, 0, 0];
      const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
      out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
      out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
      out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
      return out;
    },
    project(m, x, y, z, out) { // returns clip -> ndc with w
      const cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13],
        cw = m[3] * x + m[7] * y + m[11] * z + m[15];
      out[0] = cx / cw; out[1] = cy / cw; out[2] = cw; return out;
    }
  };

  PS.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  PS.lerp = (a, b, t) => a + (b - a) * t;
  PS.smooth = (a, b, v) => { const t = PS.clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  PS.angDiff = (a, b) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };
  PS.damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  PS.dampAng = (a, b, k, dt) => a + PS.angDiff(a, b) * (1 - Math.exp(-k * dt));
  PS.hexRGB = (hex) => { const v = parseInt(hex.replace('#', ''), 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; };
  PS.mixC = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  // ---------------- 乱数 ----------------
  PS.rng = function (seed) {
    let s = seed >>> 0;
    const f = function () { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    f.range = (a, b) => a + (b - a) * f();
    f.int = (a, b) => Math.floor(a + (b - a + 1) * f());
    f.pick = (arr) => arr[Math.floor(f() * arr.length)];
    return f;
  };
  PS.hash2 = (x, y) => { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  // ---------------- シンプレックスノイズ ----------------
  PS.Noise = function (seed) {
    const r = PS.rng(seed), p = new Uint8Array(512), perm = [];
    for (let i = 0; i < 256; i++) perm[i] = i;
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
    const G = [1, 1, -1, 1, 1, -1, -1, -1, 1, 0, -1, 0, 0, 1, 0, -1];
    const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
    function n2(xin, yin) {
      const s = (xin + yin) * F2, i = Math.floor(xin + s), j = Math.floor(yin + s), t = (i + j) * G2;
      const x0 = xin - (i - t), y0 = yin - (j - t);
      const i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1;
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255;
      let n = 0, tt, g;
      tt = 0.5 - x0 * x0 - y0 * y0; if (tt > 0) { g = (p[ii + p[jj]] & 7) * 2; tt *= tt; n += tt * tt * (G[g] * x0 + G[g + 1] * y0); }
      tt = 0.5 - x1 * x1 - y1 * y1; if (tt > 0) { g = (p[ii + i1 + p[jj + j1]] & 7) * 2; tt *= tt; n += tt * tt * (G[g] * x1 + G[g + 1] * y1); }
      tt = 0.5 - x2 * x2 - y2 * y2; if (tt > 0) { g = (p[ii + 1 + p[jj + 1]] & 7) * 2; tt *= tt; n += tt * tt * (G[g] * x2 + G[g + 1] * y2); }
      return 70 * n;
    }
    return {
      n2,
      fbm(x, y, oct, lac = 2, gain = 0.5) { let a = 1, f = 1, s = 0, t = 0; for (let i = 0; i < oct; i++) { s += a * n2(x * f, y * f); t += a; a *= gain; f *= lac; } return s / t; },
      ridged(x, y, oct, lac = 2.1, gain = 0.5) { let a = 1, f = 1, s = 0, t = 0, w = 1; for (let i = 0; i < oct; i++) { let v = 1 - Math.abs(n2(x * f, y * f)); v *= v; v *= w; w = PS.clamp(v * 1.6, 0, 1); s += a * v; t += a; a *= gain; f *= lac; } return s / t; }
    };
  };

  // ---------------- WebGL ヘルパー ----------------
  const ATTR = { aPos: 0, aNrm: 1, aCol: 2, aBone: 3, aI0: 4, aI1: 5, aUV: 6 };
  PS.ATTR = ATTR;
  class Prog {
    constructor(gl, p, name) { this.gl = gl; this.p = p; this.name = name; this.loc = new Map(); }
    use() { this.gl.useProgram(this.p); return this; }
    L(n) { let l = this.loc.get(n); if (l === undefined) { l = this.gl.getUniformLocation(this.p, n); this.loc.set(n, l); } return l; }
    f(n, v) { const l = this.L(n); if (l) this.gl.uniform1f(l, v); return this; }
    i(n, v) { const l = this.L(n); if (l) this.gl.uniform1i(l, v); return this; }
    v2(n, a, b) { const l = this.L(n); if (l) this.gl.uniform2f(l, a, b); return this; }
    v3(n, a, b, c) { const l = this.L(n); if (l) { if (b === undefined) this.gl.uniform3f(l, a[0], a[1], a[2]); else this.gl.uniform3f(l, a, b, c); } return this; }
    v4(n, a, b, c, d) { const l = this.L(n); if (l) { if (b === undefined) this.gl.uniform4f(l, a[0], a[1], a[2], a[3]); else this.gl.uniform4f(l, a, b, c, d); } return this; }
    v4v(n, arr) { const l = this.L(n); if (l) this.gl.uniform4fv(l, arr); return this; }
    m4(n, m) { const l = this.L(n); if (l) this.gl.uniformMatrix4fv(l, false, m); return this; }
    m4v(n, m) { const l = this.L(n); if (l) this.gl.uniformMatrix4fv(l, false, m); return this; }
  }
  const GLH = PS.GLH = {
    compile(gl, vs, fs, name) {
      const mk = (type, src) => {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          const log = gl.getShaderInfoLog(s);
          const lines = src.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n');
          console.error('[shader ' + name + ']', log, '\n', lines);
          throw new Error('Shader compile error: ' + name + ' ' + log);
        }
        return s;
      };
      const p = gl.createProgram();
      gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
      for (const k in ATTR) gl.bindAttribLocation(p, ATTR[k], k);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error('[link ' + name + ']', gl.getProgramInfoLog(p)); throw new Error('Link error ' + name); }
      return new Prog(gl, p, name);
    },
    tex(gl, w, h, ifmt, fmt, type, data, filter, wrap) {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, data || null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter || gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter || gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap || gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap || gl.CLAMP_TO_EDGE);
      return t;
    },
    // 統一頂点フォーマット: pos f32x3 | nrm i8x4 | col u8x4 | bone f32 = 24 bytes
    makeMesh(gl, packed, instBuf) {
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      const vbo = packed.vbo || gl.createBuffer();
      if (!packed.vbo) { gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, packed.data, gl.STATIC_DRAW); }
      else gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.BYTE, true, 24, 12);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.UNSIGNED_BYTE, true, 24, 16);
      gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 24, 20);
      if (instBuf) {
        gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
        gl.enableVertexAttribArray(4); gl.vertexAttribPointer(4, 4, gl.FLOAT, false, 32, 0); gl.vertexAttribDivisor(4, 1);
        gl.enableVertexAttribArray(5); gl.vertexAttribPointer(5, 4, gl.FLOAT, false, 32, 16); gl.vertexAttribDivisor(5, 1);
      }
      let ibo = packed.ibo, itype = packed.itype;
      if (!ibo) {
        ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, packed.index, gl.STATIC_DRAW);
        itype = packed.index instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
      } else gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bindVertexArray(null);
      return { vao, vbo, ibo, itype, count: packed.count != null ? packed.count : packed.index.length, inst: !!instBuf, radius: packed.radius || 1, center: packed.center || [0, 0, 0] };
    }
  };

  // ---------------- メッシュビルダー ----------------
  class MeshBuilder {
    constructor() { this.P = []; this.N = []; this.C = []; this.B = []; this.I = []; this.bone = 0; this.color = [1, 1, 1, 0]; this.xf = null; }
    get vcount() { return this.P.length / 3; }
    setXform(m) { this.xf = m; return this; }
    vert(x, y, z, nx, ny, nz, c) {
      if (this.xf) {
        const m = this.xf;
        const X = m[0] * x + m[4] * y + m[8] * z + m[12], Y = m[1] * x + m[5] * y + m[9] * z + m[13], Z = m[2] * x + m[6] * y + m[10] * z + m[14];
        let NX = m[0] * nx + m[4] * ny + m[8] * nz, NY = m[1] * nx + m[5] * ny + m[9] * nz, NZ = m[2] * nx + m[6] * ny + m[10] * nz;
        const l = Math.hypot(NX, NY, NZ) || 1; x = X; y = Y; z = Z; nx = NX / l; ny = NY / l; nz = NZ / l;
      }
      this.P.push(x, y, z); this.N.push(nx, ny, nz);
      c = c || this.color; this.C.push(c[0], c[1], c[2], c[3] || 0); this.B.push(this.bone);
      return this.P.length / 3 - 1;
    }
    tri(a, b, c) { this.I.push(a, b, c); }
    quad(a, b, c, d) { this.I.push(a, b, c, a, c, d); }
    // 変換付きプリミティブ
    _m(tx, ty, tz, rx, ry, rz, sx, sy, sz) { return M4.compose(new Float32Array(16), tx, ty, tz, rx || 0, ry || 0, rz || 0, sx, sy, sz); }
    box(cx, cy, cz, sx, sy, sz, col, rx, ry, rz) {
      const prev = this.xf, m = this._m(cx, cy, cz, rx, ry, rz, sx / 2, sy / 2, sz / 2);
      this.xf = prev ? M4.mul(new Float32Array(16), prev, m) : m;
      const F = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]];
      for (const n of F) {
        const u = n[1] !== 0 ? [1, 0, 0] : [0, 1, 0];
        const v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
        const p = (a, b) => this.vert(n[0] + u[0] * a + v[0] * b, n[1] + u[1] * a + v[1] * b, n[2] + u[2] * a + v[2] * b, n[0], n[1], n[2], col);
        const a = p(-1, -1), b = p(1, -1), c = p(1, 1), d = p(-1, 1);
        this.quad(a, b, c, d);
      }
      this.xf = prev; return this;
    }
    sphere(cx, cy, cz, rx, ry, rz, col, seg = 10, rings = 7, rotX, rotY, rotZ, warp) {
      const prev = this.xf, m = this._m(cx, cy, cz, rotX, rotY, rotZ, 1, 1, 1);
      this.xf = prev ? M4.mul(new Float32Array(16), prev, m) : m;
      const base = this.vcount;
      for (let r = 0; r <= rings; r++) {
        const th = r / rings * Math.PI, st = Math.sin(th), ct = Math.cos(th);
        for (let s = 0; s <= seg; s++) {
          const ph = s / seg * Math.PI * 2;
          let nx = st * Math.sin(ph), ny = ct, nz = st * Math.cos(ph);
          let k = 1; if (warp) k = warp(nx, ny, nz);
          const c = typeof col === 'function' ? col(nx, ny, nz) : col;
          this.vert(nx * rx * k, ny * ry * k, nz * rz * k, nx / rx, ny / ry, nz / rz, c);
        }
      }
      for (let r = 0; r < rings; r++) for (let s = 0; s < seg; s++) {
        const a = base + r * (seg + 1) + s, b = a + seg + 1;
        this.I.push(a, b, a + 1, a + 1, b, b + 1);
      }
      this.xf = prev; return this;
    }
    // 軸 a->b の円柱 / 円錐台
    cyl(ax, ay, az, bx, by, bz, r0, r1, col, seg = 8, caps = true, col1) {
      let dx = bx - ax, dy = by - ay, dz = bz - az; const len = Math.hypot(dx, dy, dz) || 1e-4; dx /= len; dy /= len; dz /= len;
      let ux = 0, uy = 1, uz = 0; if (Math.abs(dy) > 0.9) { ux = 1; uy = 0; }
      let px = uy * dz - uz * dy, py = uz * dx - ux * dz, pz = ux * dy - uy * dx; let pl = Math.hypot(px, py, pz); px /= pl; py /= pl; pz /= pl;
      const qx = dy * pz - dz * py, qy = dz * px - dx * pz, qz = dx * py - dy * px;
      const base = this.vcount, slope = (r0 - r1) / len;
      for (let i = 0; i <= seg; i++) {
        const a = i / seg * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
        const nx = px * c + qx * s, ny = py * c + qy * s, nz = pz * c + qz * s;
        const nnx = nx + dx * slope, nny = ny + dy * slope, nnz = nz + dz * slope;
        this.vert(ax + nx * r0, ay + ny * r0, az + nz * r0, nnx, nny, nnz, col);
        this.vert(bx + nx * r1, by + ny * r1, bz + nz * r1, nnx, nny, nnz, col1 || col);
      }
      for (let i = 0; i < seg; i++) { const a = base + i * 2; this.I.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      if (caps) {
        const cap = (cx, cy, cz, r, sgn, c) => {
          if (r <= 0.0001) return;
          const ctr = this.vert(cx, cy, cz, dx * sgn, dy * sgn, dz * sgn, c), b2 = this.vcount;
          for (let i = 0; i <= seg; i++) { const a = i / seg * Math.PI * 2, cc = Math.cos(a), s = Math.sin(a); this.vert(cx + (px * cc + qx * s) * r, cy + (py * cc + qy * s) * r, cz + (pz * cc + qz * s) * r, dx * sgn, dy * sgn, dz * sgn, c); }
          for (let i = 0; i < seg; i++) { if (sgn > 0) this.I.push(ctr, b2 + i, b2 + i + 1); else this.I.push(ctr, b2 + i + 1, b2 + i); }
        };
        cap(ax, ay, az, r0, -1, col); cap(bx, by, bz, r1, 1, col1 || col);
      }
      return this;
    }
    // 平たい多角形を押し出し (xy平面の点列, z方向に厚み)
    extrude(pts, depth, col, xf) {
      const prev = this.xf; if (xf) this.xf = prev ? M4.mul(new Float32Array(16), prev, xf) : xf;
      const n = pts.length, h = depth / 2;
      for (const side of [1, -1]) {
        const b = this.vcount;
        for (const p of pts) this.vert(p[0], p[1], h * side, 0, 0, side, col);
        for (let i = 1; i < n - 1; i++) { if (side > 0) this.tri(b, b + i, b + i + 1); else this.tri(b, b + i + 1, b + i); }
      }
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        let ex = q[0] - p[0], ey = q[1] - p[1]; const l = Math.hypot(ex, ey) || 1; const nx = ey / l, ny = -ex / l;
        const a = this.vert(p[0], p[1], h, nx, ny, 0, col), b = this.vert(q[0], q[1], h, nx, ny, 0, col),
          c = this.vert(q[0], q[1], -h, nx, ny, 0, col), d = this.vert(p[0], p[1], -h, nx, ny, 0, col);
        this.quad(a, d, c, b);
      }
      this.xf = prev; return this;
    }
    append(other) { const off = this.vcount; for (let i = 0; i < other.P.length; i++) this.P.push(other.P[i]); this.N.push(...other.N); this.C.push(...other.C); this.B.push(...other.B); for (const i of other.I) this.I.push(i + off); return this; }
    pack() {
      const n = this.vcount, buf = new ArrayBuffer(n * 24), f = new Float32Array(buf), i8 = new Int8Array(buf), u8 = new Uint8Array(buf);
      let minX = 1e9, minY = 1e9, minZ = 1e9, maxX = -1e9, maxY = -1e9, maxZ = -1e9;
      for (let v = 0; v < n; v++) {
        const x = this.P[v * 3], y = this.P[v * 3 + 1], z = this.P[v * 3 + 2];
        f[v * 6] = x; f[v * 6 + 1] = y; f[v * 6 + 2] = z; f[v * 6 + 5] = this.B[v];
        if (x < minX) minX = x; if (y < minY) minY = y; if (z < minZ) minZ = z; if (x > maxX) maxX = x; if (y > maxY) maxY = y; if (z > maxZ) maxZ = z;
        let nx = this.N[v * 3], ny = this.N[v * 3 + 1], nz = this.N[v * 3 + 2]; const l = Math.hypot(nx, ny, nz) || 1;
        i8[v * 24 + 12] = Math.round(nx / l * 127); i8[v * 24 + 13] = Math.round(ny / l * 127); i8[v * 24 + 14] = Math.round(nz / l * 127);
        u8[v * 24 + 16] = Math.round(PS.clamp(this.C[v * 4], 0, 1) * 255); u8[v * 24 + 17] = Math.round(PS.clamp(this.C[v * 4 + 1], 0, 1) * 255);
        u8[v * 24 + 18] = Math.round(PS.clamp(this.C[v * 4 + 2], 0, 1) * 255); u8[v * 24 + 19] = Math.round(PS.clamp(this.C[v * 4 + 3], 0, 1) * 255);
      }
      const index = n > 65535 ? new Uint32Array(this.I) : new Uint16Array(this.I);
      const center = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];
      const radius = Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) / 2;
      return { data: buf, index, count: index.length, center, radius, min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
    }
  }
  PS.MeshBuilder = MeshBuilder;
  PS.col = (hex, e) => { const c = PS.hexRGB(hex); c.push(e || 0); return c; };
  PS.shade = (c, k) => [c[0] * k, c[1] * k, c[2] * k, c[3] || 0];
})(window.PS);
