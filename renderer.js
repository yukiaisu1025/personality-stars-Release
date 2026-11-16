/* Personality Stars - renderer.js : 描画パイプライン / 画質設定  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const M4 = PS.M4;
  // ---------------- 画質設定 ----------------
  const PRESETS = {
    low: { renderScale: 0.7, renderDist: 6, shadows: 0, softShadow: false, clouds: 1, grass: 1, trees: 0.55, particles: 0, aa: 'off', bloom: false, outline: false, fancy: false },
    medium: { renderScale: 0.85, renderDist: 8, shadows: 1, softShadow: false, clouds: 1, grass: 2, trees: 0.8, particles: 1, aa: 'fxaa', bloom: true, outline: true, fancy: false },
    high: { renderScale: 1.0, renderDist: 11, shadows: 3, softShadow: true, clouds: 2, grass: 3, trees: 1.0, particles: 2, aa: 'fxaa', bloom: true, outline: true, fancy: true },
    ultra: { renderScale: 1.0, renderDist: 16, shadows: 4, softShadow: true, clouds: 2, grass: 4, trees: 1.0, particles: 2, aa: 'msaa', bloom: true, outline: true, fancy: true }
  };
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
  PS.isMobile = isMobile;
  const DEF = Object.assign({ preset: isMobile ? 'medium' : 'high', pixelRatio: isMobile ? 1.5 : 2, fov: 70, brightness: 1.0, maxFps: 0, shake: true, dmgNumbers: true, showFps: false, sens: 1.0, invertY: false, volMaster: 0.8, volBgm: 0.6, volSfx: 0.8, uiScale: 1.0 }, PRESETS[isMobile ? 'medium' : 'high']);
  PS.PRESETS = PRESETS;
  PS.Settings = Object.assign({}, DEF);
  try { const s = JSON.parse(localStorage.getItem('ps_settings_v1') || 'null'); if (s) Object.assign(PS.Settings, s); } catch (e) { }
  PS.saveSettings = () => { try { localStorage.setItem('ps_settings_v1', JSON.stringify(PS.Settings)); } catch (e) { } };
  PS.resetSettings = () => { PS.Settings = Object.assign({}, DEF); PS.saveSettings(); };
  PS.applyPreset = (name) => { Object.assign(PS.Settings, PRESETS[name]); PS.Settings.preset = name; };

  const SHADOW = [null, { size: 1024, dist: 55 }, { size: 2048, dist: 80 }, { size: 2048, dist: 110 }, { size: 4096, dist: 150 }];
  const GRASS = [null, { grid: 110, sp: 0.55 }, { grid: 160, sp: 0.5 }, { grid: 215, sp: 0.46 }, { grid: 290, sp: 0.42 }];

  const R = PS.R = {
    view: M4.create(), proj: M4.create(), vp: M4.create(), ivp: M4.create(), lightVP: M4.create(),
    eye: [0, 10, 0], target: [0, 0, 0], fov: 70, near: 0.15, far: 3000, planes: new Float32Array(24),
    pass: 'main', cur: null, stats: { draws: 0, tris: 0 },
    env: null, pointLights: [], fx: { lowHP: 0, fade: 0, fadeCol: [0, 0, 0], under: 0, awaken: 0 }
  };

  R.init = function (canvas) {
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: true, stencil: false, powerPreference: 'high-performance', premultipliedAlpha: false });
    if (!gl) return false;
    R.gl = gl; R.canvas = canvas;
    R.hdr = !!gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');
    R.maxSamples = gl.getParameter(gl.MAX_SAMPLES) || 0;
    R.P = {};
    for (const k in PS.SHADERS) {
      const s = PS.SHADERS[k];
      if (s.length === 3) R.P[k] = PS.GLH.compile(gl, s[1].replace('\n', '\n#define DEPTH\n'), s[2], k);
      else R.P[k] = PS.GLH.compile(gl, s[0], s[1], k);
    }
    R.litProgs = ['terrain', 'mesh', 'skin', 'water', 'grass', 'part', 'vfx', 'sky'].map(k => R.P[k]);
    for (const k in R.P) { const p = R.P[k]; p.use(); p.i('uShadowMap', 7).i('uHeight', 0).i('uSplat', 1).i('uTex', 0).i('uScene', 0).i('uBloom', 1); }
    R.emptyVAO = gl.createVertexArray();
    R._buildPrims();
    R.resize();
    return true;
  };

  R._buildPrims = function () {
    const gl = R.gl, G = PS.GLH;
    // 水面 (放射状メッシュ)
    let mb = new PS.MeshBuilder(); const RINGS = 70, SEG = 96;
    for (let i = 0; i <= RINGS; i++) { const r = i === 0 ? 0 : 3 * (Math.pow(1.13, i) - 1); for (let s = 0; s <= SEG; s++) { const a = s / SEG * Math.PI * 2; mb.vert(Math.cos(a) * r, 0, Math.sin(a) * r, 0, 1, 0); } }
    for (let i = 0; i < RINGS; i++) for (let s = 0; s < SEG; s++) { const a = i * (SEG + 1) + s, b = a + SEG + 1; mb.I.push(a, a + 1, b, a + 1, b + 1, b); }
    R.waterMesh = G.makeMesh(gl, mb.pack());
    // 草 (3枚の葉の束)
    mb = new PS.MeshBuilder();
    for (let k = 0; k < 3; k++) {
      const ang = k / 3 * Math.PI + 0.3, ox = Math.cos(ang * 2.1) * 0.12, oz = Math.sin(ang * 1.7) * 0.12;
      const dx = Math.cos(ang), dz = Math.sin(ang), lean = 0.12 + k * 0.05; const b = mb.vcount;
      const L = [0, 0.35, 0.7];
      for (const t of L) { const w = 0.09 * (1 - t * 0.85); mb.vert(ox - dx * w + lean * t * t * dz, t, oz - dz * w - lean * t * t * dx, 0, 1, 0); mb.vert(ox + dx * w + lean * t * t * dz, t, oz + dz * w - lean * t * t * dx, 0, 1, 0); }
      mb.vert(ox + lean * dz, 1, oz - lean * dx, 0, 1, 0);
      mb.quad(b, b + 1, b + 3, b + 2); mb.quad(b + 2, b + 3, b + 5, b + 4); mb.tri(b + 4, b + 5, b + 6);
    }
    R.grassMesh = G.makeMesh(gl, mb.pack());
    // VFX: 弧
    mb = new PS.MeshBuilder();
    for (let u = 0; u <= 28; u++) for (let v = 0; v <= 2; v++) mb.vert(u / 28, v / 2, 0, 0, 1, 0);
    for (let u = 0; u < 28; u++) for (let v = 0; v < 2; v++) { const a = u * 3 + v; mb.quad(a, a + 3, a + 4, a + 1); }
    R.arcMesh = G.makeMesh(gl, mb.pack());
    mb = new PS.MeshBuilder(); mb.vert(-1, 0, -1, 0, 1, 0); mb.vert(1, 0, -1, 0, 1, 0); mb.vert(1, 0, 1, 0, 1, 0); mb.vert(-1, 0, 1, 0, 1, 0); mb.quad(0, 3, 2, 1);
    R.quadMesh = G.makeMesh(gl, mb.pack());
    mb = new PS.MeshBuilder(); for (let s = 0; s <= 20; s++) { const a = s / 20 * Math.PI * 2; mb.vert(Math.cos(a), 0, Math.sin(a), Math.cos(a), 0, Math.sin(a)); mb.vert(Math.cos(a), 1, Math.sin(a), Math.cos(a), 0, Math.sin(a)); }
    for (let s = 0; s < 20; s++) { const a = s * 2; mb.quad(a, a + 1, a + 3, a + 2); }
    R.pillarMesh = G.makeMesh(gl, mb.pack());
    // パーティクル
    R.partMax = 6000; R.partData = new Float32Array(R.partMax * 9);
    R.partVAO = gl.createVertexArray(); gl.bindVertexArray(R.partVAO);
    R.partVBO = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, R.partVBO); gl.bufferData(gl.ARRAY_BUFFER, R.partData.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 36, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 36, 16);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 36, 32);
    gl.bindVertexArray(null);
  };

  // ---------------- 解像度/RT ----------------
  R.resize = function () {
    const gl = R.gl, S = PS.Settings, c = R.canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, S.pixelRatio || 2);
    const w = Math.max(2, Math.floor(c.clientWidth * dpr)), h = Math.max(2, Math.floor(c.clientHeight * dpr));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const sw = Math.max(2, Math.floor(w * S.renderScale)), sh = Math.max(2, Math.floor(h * S.renderScale));
    const key = sw + 'x' + sh + S.aa + S.bloom;
    if (R._rtKey === key) return;
    R._rtKey = key; R._freeRT();
    R.W = sw; R.H = sh;
    const ifmt = R.hdr ? gl.RGBA16F : gl.RGBA8, type = R.hdr ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
    R.sceneTex = PS.GLH.tex(gl, sw, sh, ifmt, gl.RGBA, type, null, gl.LINEAR);
    R.sceneFB = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, R.sceneFB);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, R.sceneTex, 0);
    R.sceneDepth = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, R.sceneDepth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, sw, sh);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, R.sceneDepth);
    R.msaaFB = null;
    if (S.aa === 'msaa' && R.maxSamples >= 2) {
      const smp = Math.min(4, R.maxSamples);
      R.msaaFB = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, R.msaaFB);
      R.msaaCol = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, R.msaaCol);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, smp, ifmt, sw, sh);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, R.msaaCol);
      R.msaaDep = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, R.msaaDep);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, smp, gl.DEPTH_COMPONENT24, sw, sh);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, R.msaaDep);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { R.msaaFB = null; }
    }
    const bw = Math.max(2, sw >> 2), bh = Math.max(2, sh >> 2);
    R.bw = bw; R.bh = bh; R.bloomTex = []; R.bloomFB = [];
    for (let i = 0; i < 2; i++) {
      const t = PS.GLH.tex(gl, bw, bh, ifmt, gl.RGBA, type, null, gl.LINEAR); const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      R.bloomTex.push(t); R.bloomFB.push(f);
    }
    R.blackTex = R.blackTex || PS.GLH.tex(gl, 1, 1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };
  R._freeRT = function () {
    const gl = R.gl;
    for (const k of ['sceneTex']) if (R[k]) gl.deleteTexture(R[k]);
    if (R.sceneFB) gl.deleteFramebuffer(R.sceneFB); if (R.sceneDepth) gl.deleteRenderbuffer(R.sceneDepth);
    if (R.msaaFB) { gl.deleteFramebuffer(R.msaaFB); gl.deleteRenderbuffer(R.msaaCol); gl.deleteRenderbuffer(R.msaaDep); }
    if (R.bloomTex) { R.bloomTex.forEach(t => gl.deleteTexture(t)); R.bloomFB.forEach(f => gl.deleteFramebuffer(f)); }
  };
  R.ensureShadow = function () {
    const gl = R.gl, cfg = SHADOW[PS.Settings.shadows];
    if (!cfg) return null;
    if (R.shadowSize !== cfg.size) {
      if (R.shadowTex) { gl.deleteTexture(R.shadowTex); gl.deleteFramebuffer(R.shadowFB); }
      R.shadowSize = cfg.size;
      R.shadowTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, R.shadowTex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, cfg.size, cfg.size);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
      R.shadowFB = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, R.shadowFB);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, R.shadowTex, 0);
      gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    return cfg;
  };

  // ---------------- カメラ / 視錐台 ----------------
  R.setCamera = function (eye, target, fov, far) {
    R.eye = eye; R.target = target; R.fov = fov; R.far = far || 3000;
    M4.lookAt(R.view, eye[0], eye[1], eye[2], target[0], target[1], target[2], 0, 1, 0);
    M4.perspective(R.proj, fov * Math.PI / 180, R.W / R.H, R.near, R.far);
    M4.mul(R.vp, R.proj, R.view); M4.invert(R.ivp, R.vp);
    const m = R.vp, P = R.planes;
    const set = (i, a, b, c, d) => { const l = Math.hypot(a, b, c); P[i * 4] = a / l; P[i * 4 + 1] = b / l; P[i * 4 + 2] = c / l; P[i * 4 + 3] = d / l; };
    set(0, m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]); set(1, m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]);
    set(2, m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]); set(3, m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]);
    set(4, m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]); set(5, m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]);
  };
  R.visible = function (x, y, z, r) {
    if (R.pass === 'shadow') { const dx = x - R.shC[0], dz = z - R.shC[2]; return Math.abs(dx) < R.shS + r + 30 && Math.abs(dz) < R.shS + r + 30; }
    const P = R.planes; for (let i = 0; i < 6; i++) if (P[i * 4] * x + P[i * 4 + 1] * y + P[i * 4 + 2] * z + P[i * 4 + 3] < -r) return false; return true;
  };
  R.toScreen = function (x, y, z, out) {
    const m = R.vp; const cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15];
    out = out || {}; out.vis = cw > 0.1; out.x = (cx / cw * 0.5 + 0.5) * R.canvas.clientWidth; out.y = (1 - (cy / cw * 0.5 + 0.5)) * R.canvas.clientHeight; out.w = cw; return out;
  };

  // ---------------- 共通ユニフォーム ----------------
  function setFrame(p) {
    const E = R.env;
    p.use();
    p.m4('uViewProj', R.vp).v3('uCamPos', R.eye).f('uTime', R.time)
      .v3('uLightDir', E.lightDir).v3('uLightCol', E.lightCol).v3('uSunDir', E.sunDir).v3('uSunCol', E.sunCol)
      .v3('uAmbTop', E.ambTop).v3('uAmbBot', E.ambBot).v3('uSkyTop', E.skyTop).v3('uSkyHor', E.skyHor).f('uNight', E.night)
      .f('uFogDen', E.fogDen).f('uFogStart', E.fogStart).f('uIndoor', E.indoor ? 1 : 0)
      .m4('uShadowMat', R.lightVP).f('uShadowOn', R.shadowOn ? 1 : 0).f('uShadowTexel', 1 / (R.shadowSize || 1024)).f('uShadowSoft', PS.Settings.softShadow ? 1 : 0).f('uShadowNO', R.shNO || 0.1);
    p.i('uShadowMap', 7);
    const pl = R.pointLights, n = Math.min(8, pl.length);
    if (n) { const a = new Float32Array(32), b = new Float32Array(32); for (let i = 0; i < n; i++) { a.set(pl[i].p, i * 4); a[i * 4 + 3] = pl[i].r; b.set(pl[i].c, i * 4); } p.v4v('uPLPos', a).v4v('uPLCol', b); }
    p.i('uPLN', n);
  }
  R.use = function (p) { if (R.cur !== p) { R.gl.useProgram(p.p); R.cur = p; } return p; };

  // ---------------- 描画ヘルパー ----------------
  R.drawTerrain = function (mesh) {
    const gl = R.gl, p = R.use(R.pass === 'shadow' ? R.P.terrainD : R.P.terrain);
    gl.bindVertexArray(mesh.vao); gl.drawElements(gl.TRIANGLES, mesh.count, mesh.itype, 0); R.stats.draws++;
  };
  R.drawMesh = function (mesh, model, tint, glow) {
    const gl = R.gl, p = R.use(R.pass === 'shadow' ? R.P.meshD : R.P.mesh);
    p.m4('uModel', model || R.I4);
    if (R.pass !== 'shadow') p.v3('uTint', tint || R.ONE3).f('uNightGlow', glow || 0);
    gl.bindVertexArray(mesh.vao);
    if (!mesh.inst) { gl.vertexAttrib4f(4, 0, 0, 0, 0); gl.vertexAttrib4f(5, 1, 0.5, 0, 0); }
    gl.drawElements(gl.TRIANGLES, mesh.count, mesh.itype, 0); R.stats.draws++;
  };
  R.drawInstanced = function (mesh, count, glow) {
    if (count <= 0) return;
    const gl = R.gl, p = R.use(R.pass === 'shadow' ? R.P.meshD : R.P.mesh);
    p.m4('uModel', R.I4); if (R.pass !== 'shadow') p.v3('uTint', R.ONE3).f('uNightGlow', glow || 0);
    gl.bindVertexArray(mesh.vao); gl.drawElementsInstanced(gl.TRIANGLES, mesh.count, mesh.itype, 0, count); R.stats.draws++;
  };
  R.drawSkinned = function (mesh, bones, model, o) {
    const gl = R.gl;
    if (R.pass === 'shadow') {
      const p = R.use(R.P.skinD); p.m4v('uBones', bones).m4('uModel', model);
      gl.bindVertexArray(mesh.vao); gl.drawElements(gl.TRIANGLES, mesh.count, mesh.itype, 0); return;
    }
    const p = R.use(R.P.skin); o = o || {};
    p.m4v('uBones', bones).m4('uModel', model).v4('uFlash', o.flash || R.ZERO4).f('uDissolve', o.dissolve || 0).v3('uEmis', o.emis || R.ONE3).f('uAlpha', 1);
    gl.bindVertexArray(mesh.vao);
    if (o.outline !== false && PS.Settings.outline) {
      gl.cullFace(gl.FRONT); p.f('uOutline', o.outlineW || 0.012).f('uOutlinePass', 1).v3('uOutlineCol', o.outlineCol || R.OUT3);
      gl.drawElements(gl.TRIANGLES, mesh.count, mesh.itype, 0); gl.cullFace(gl.BACK);
    }
    p.f('uOutline', 0).f('uOutlinePass', 0);
    gl.drawElements(gl.TRIANGLES, mesh.count, mesh.itype, 0); R.stats.draws += 2;
  };
  R.drawWater = function (level, origin, heightTex, info) {
    const gl = R.gl, p = R.use(R.P.water);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, heightTex);
    p.i('uHeight', 0).v3('uOrigin', origin).f('uLevel', level).f('uLava', 0).f('uHalf', info.half).f('uCell', info.cell).f('uRes', info.res).f('uFancy', PS.Settings.fancy ? 1 : 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.bindVertexArray(R.waterMesh.vao); gl.drawElements(gl.TRIANGLES, R.waterMesh.count, R.waterMesh.itype, 0);
    gl.depthMask(true); gl.disable(gl.BLEND); R.stats.draws++;
  };
  R.drawLava = function (mesh, level, origin, heightTex) {
    const gl = R.gl, p = R.use(R.P.water);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, heightTex);
    p.v3('uOrigin', origin).f('uLevel', level).f('uLava', 1);
    gl.bindVertexArray(mesh.vao); gl.drawElements(gl.TRIANGLES, mesh.count, mesh.itype, 0);
  };
  R.drawGrass = function (heightTex, splatTex, info, player) {
    const cfg = GRASS[PS.Settings.grass]; if (!cfg) return;
    const gl = R.gl, p = R.use(R.P.grass);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, heightTex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, splatTex);
    p.i('uHeight', 0).i('uSplat', 1).f('uHalf', info.half).f('uCell', info.cell).f('uRes', info.res)
      .i('uGrid', cfg.grid).f('uSpacing', cfg.sp).v3('uCenter', R.eye).v3('uPlayer', player).f('uRadius', cfg.grid * cfg.sp * 0.5);
    gl.disable(gl.CULL_FACE);
    gl.bindVertexArray(R.grassMesh.vao); gl.drawElementsInstanced(gl.TRIANGLES, R.grassMesh.count, R.grassMesh.itype, 0, cfg.grid * cfg.grid);
    gl.activeTexture(gl.TEXTURE0);
    gl.enable(gl.CULL_FACE); R.stats.draws++;
  };
  // パーティクル: list of {x,y,z,size,r,g,b,a,kind,add}
  R.drawParticles = function (parts) {
    if (!parts.length) return;
    const gl = R.gl, p = R.use(R.P.part), D = R.partData;
    p.f('uScale', R.H * R.proj[5] * 0.5);
    gl.enable(gl.BLEND); gl.depthMask(false); gl.bindVertexArray(R.partVAO); gl.bindBuffer(gl.ARRAY_BUFFER, R.partVBO);
    for (const add of [false, true]) {
      let n = 0;
      for (const q of parts) { if (!!q.add !== add || n >= R.partMax) continue; const o = n * 9; D[o] = q.x; D[o + 1] = q.y; D[o + 2] = q.z; D[o + 3] = q.size; D[o + 4] = q.r; D[o + 5] = q.g; D[o + 6] = q.b; D[o + 7] = q.a; D[o + 8] = q.kind || 0; n++; }
      if (!n) continue;
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, D, 0, n * 9);
      if (add) gl.blendFunc(gl.SRC_ALPHA, gl.ONE); else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.POINTS, 0, n); R.stats.draws++;
    }
    gl.depthMask(true); gl.disable(gl.BLEND);
  };
  // VFX: {mode, model, color[4], prog, arc[4], size[3], shape[4], add}
  R.drawVFX = function (list) {
    if (!list.length) return;
    const gl = R.gl, p = R.use(R.P.vfx);
    gl.enable(gl.BLEND); gl.depthMask(false); gl.disable(gl.CULL_FACE);
    for (const v of list) {
      if (v.add) gl.blendFunc(gl.SRC_ALPHA, gl.ONE); else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      p.i('uMode', v.mode).m4('uModel', v.model).v4('uColor', v.color).f('uProg', v.prog || 0)
        .v4('uArc', v.arc || R.ZERO4).v3('uSize', v.size || R.ONE3).v4('uShape', v.shape || R.ZERO4);
      const mesh = v.mode === 0 ? R.arcMesh : v.mode === 2 ? R.pillarMesh : R.quadMesh;
      if (v.noDepth) gl.disable(gl.DEPTH_TEST);
      gl.bindVertexArray(mesh.vao); gl.drawElements(gl.TRIANGLES, mesh.count, mesh.itype, 0); R.stats.draws++;
      if (v.noDepth) gl.enable(gl.DEPTH_TEST);
    }
    gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE);
  };
  R.I4 = M4.create(); R.ONE3 = [1, 1, 1]; R.ZERO4 = [0, 0, 0, 0]; R.OUT3 = [0.16, 0.12, 0.14];

  // ---------------- フレーム ----------------
  // scene: { env, shadowCenter, draw(pass), drawTrans(), cloud }
  R.frame = function (scene, time) {
    const gl = R.gl, S = PS.Settings;
    R.time = time; R.env = scene.env; R.stats.draws = 0; R.cur = null;
    R.resize();
    // 影
    const cfg = S.shadows > 0 && !scene.noShadow ? R.ensureShadow() : null;
    R.shadowOn = !!cfg;
    if (cfg) {
      const E = scene.env, L = E.lightDir, c = scene.shadowCenter, Sz = cfg.dist;
      R.shS = Sz; R.shC = c;
      const lv = M4.create(), lp = M4.create();
      M4.lookAt(lv, c[0] + L[0] * 600, c[1] + L[1] * 600, c[2] + L[2] * 600, c[0], c[1], c[2], 0, 1, 0);
      // テクセルスナップ
      const tc = M4.xform(lv, c[0], c[1], c[2]); const tw = Sz * 2 / cfg.size;
      const sx = Math.round(tc[0] / tw) * tw - tc[0], sy = Math.round(tc[1] / tw) * tw - tc[1];
      M4.ortho(lp, -Sz + sx, Sz + sx, -Sz + sy, Sz + sy, 100, 1400);
      M4.mul(R.lightVP, lp, lv); R.shNO = tw * 1.6;
      for (let u = 0; u < 8; u++) { gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, null); }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, R.shadowFB); gl.viewport(0, 0, cfg.size, cfg.size);
      gl.clear(gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1.5, 3.0);
      R.pass = 'shadow';
      for (const k of ['terrainD', 'meshD', 'skinD']) { const p = R.use(R.P[k]); p.m4('uLightVP', R.lightVP).f('uTime', time); }
      scene.draw('shadow');
      gl.disable(gl.POLYGON_OFFSET_FILL);
    }
    // メイン
    const fb = R.msaaFB || R.sceneFB;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, R.W, R.H);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    R.ensureDummyShadow();
    gl.activeTexture(gl.TEXTURE7); gl.bindTexture(gl.TEXTURE_2D, R.shadowTex || R.dummyShadow);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, null);
    R.cur = null;
    for (const p of R.litProgs) setFrame(p);
    R.pass = 'main';
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    // 空
    const sp = R.use(R.P.sky); sp.m4('uInvVP', R.ivp).f('uCloudQ', scene.env.indoor ? 0 : S.clouds).v3('uMoonDir', scene.env.moonDir || [0, -1, 0]);
    gl.depthMask(false); gl.bindVertexArray(R.emptyVAO); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.depthMask(true);
    scene.draw('main');
    R.pass = 'trans';
    scene.draw('trans');
    // 解決
    if (R.msaaFB) {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, R.msaaFB); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, R.sceneFB);
      gl.blitFramebuffer(0, 0, R.W, R.H, 0, 0, R.W, R.H, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    }
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.bindVertexArray(R.emptyVAO);
    // ブルーム
    let bloomTex = R.blackTex;
    if (S.bloom) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, R.bloomFB[0]); gl.viewport(0, 0, R.bw, R.bh);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, null); gl.activeTexture(gl.TEXTURE0);
      let p = R.use(R.P.bright); gl.bindTexture(gl.TEXTURE_2D, R.sceneTex); p.i('uTex', 0).f('uThresh', R.hdr ? 1.35 : 0.88).v2('uTexel', 1 / R.W * 1.5, 1 / R.H * 1.5);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      p = R.use(R.P.blur); p.i('uTex', 0);
      for (let i = 0; i < 2; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, R.bloomFB[1]); gl.bindTexture(gl.TEXTURE_2D, R.bloomTex[0]); p.v2('uDir', (1 + i) / R.bw, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, R.bloomFB[0]); gl.bindTexture(gl.TEXTURE_2D, R.bloomTex[1]); p.v2('uDir', 0, (1 + i) / R.bh); gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      bloomTex = R.bloomTex[0];
    }
    // 合成
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, R.canvas.width, R.canvas.height);
    const p = R.use(R.P.comp);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, R.sceneTex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bloomTex);
    const fx = R.fx;
    p.i('uScene', 0).i('uBloom', 1).f('uBloomStr', S.bloom ? 0.55 : 0).f('uFXAA', S.aa === 'fxaa' ? 1 : 0).v2('uTexel', 1 / R.W, 1 / R.H)
      .f('uExposure', (scene.env.exposure || 1) * S.brightness).f('uSat', scene.env.sat || 1.12).f('uContrast', 1.04).f('uVig', 0.55)
      .f('uLowHP', fx.lowHP).f('uTime', time).f('uFade', fx.fade).v3('uFadeCol', fx.fadeCol).f('uUnder', fx.under).f('uAwaken', fx.awaken);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);
  };
  R.ensureDummyShadow = function () {
    if (R.dummyShadow) return; const gl = R.gl;
    R.dummyShadow = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, R.dummyShadow);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, 1, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  };
})(window.PS);
