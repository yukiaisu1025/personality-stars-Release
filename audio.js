/* Personality Stars - audio.js : WebAudioによる生成BGMと効果音  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const A = PS.Audio = { ctx: null, cur: null, step: 0, nextT: 0 };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const THEMES = {
    title: { bpm: 70, root: 62, scale: [0, 2, 4, 5, 7, 9, 11], prog: [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]], mel: 0.55, arp: 1, bell: 0.4, drums: 0 },
    heaven: { bpm: 60, root: 64, scale: [0, 2, 4, 7, 9], prog: [[0, 4, 7, 11], [5, 9, 12, 16], [9, 12, 16, 19], [7, 11, 14, 18]], mel: 0.35, arp: 1, bell: 0.7, drums: 0 },
    plains: { bpm: 92, root: 67, scale: [0, 2, 4, 5, 7, 9, 11], prog: [[0, 4, 7], [5, 9, 12], [9, 12, 16], [7, 11, 14]], mel: 0.6, arp: 1, bell: 0.2, drums: 0 },
    forest: { bpm: 80, root: 62, scale: [0, 2, 3, 5, 7, 9, 10], prog: [[0, 3, 7, 10], [5, 9, 12], [3, 7, 10, 14], [10, 14, 17]], mel: 0.45, arp: 1, bell: 0.5, drums: 0 },
    desert: { bpm: 88, root: 62, scale: [0, 1, 4, 5, 7, 8, 10], prog: [[0, 4, 7], [1, 5, 8], [0, 4, 7], [10, 13, 17]], mel: 0.6, arp: 1, bell: 0.1, drums: 0.4 },
    snow: { bpm: 66, root: 69, scale: [0, 2, 3, 5, 7, 8, 10], prog: [[0, 3, 7, 10], [8, 12, 15], [5, 8, 12], [7, 10, 14]], mel: 0.35, arp: 0.6, bell: 0.9, drums: 0 },
    volcano: { bpm: 84, root: 57, scale: [0, 1, 3, 5, 7, 8, 10], prog: [[0, 3, 7], [1, 5, 8], [0, 3, 7], [8, 12, 15]], mel: 0.4, arp: 1, bell: 0, drums: 0.5 },
    dungeon: { bpm: 74, root: 57, scale: [0, 2, 3, 5, 7, 8, 11], prog: [[0, 3, 7], [8, 12, 15], [5, 8, 12], [7, 11, 14]], mel: 0.3, arp: 0.7, bell: 0.3, drums: 0.2 },
    highland: { bpm: 96, root: 65, scale: [0, 2, 4, 6, 7, 9, 11], prog: [[0, 4, 7, 11], [2, 6, 9, 14], [9, 12, 16], [7, 11, 14, 18]], mel: 0.65, arp: 1, bell: 0.4, drums: 0.15 },
    arid: { bpm: 82, root: 60, scale: [0, 1, 4, 5, 7, 8, 11], prog: [[0, 4, 7], [1, 4, 8], [5, 8, 12], [7, 11, 14]], mel: 0.55, arp: 0.8, bell: 0.15, drums: 0.55 },
    aurora: { bpm: 60, root: 71, scale: [0, 2, 4, 7, 9, 11], prog: [[0, 4, 7, 11], [9, 12, 16, 19], [4, 7, 11, 14], [7, 11, 14, 18]], mel: 0.3, arp: 0.5, bell: 1.1, drums: 0 },
    magma: { bpm: 100, root: 55, scale: [0, 1, 3, 5, 6, 8, 10], prog: [[0, 3, 7], [1, 5, 8], [6, 10, 13], [5, 8, 12]], mel: 0.45, arp: 1, bell: 0, drums: 0.8 },
    ruins: { bpm: 70, root: 61, scale: [0, 2, 3, 6, 7, 8, 11], prog: [[0, 3, 7, 11], [8, 12, 15], [6, 10, 13], [7, 11, 14]], mel: 0.35, arp: 0.9, bell: 0.6, drums: 0.3 },
    frostfire: { bpm: 92, root: 57, scale: [0, 2, 3, 5, 7, 8, 11], prog: [[0, 3, 7], [8, 12, 15], [5, 8, 12], [7, 11, 14]], mel: 0.5, arp: 1, bell: 0.5, drums: 0.55 },
    jungle: { bpm: 104, root: 62, scale: [0, 2, 4, 7, 9], prog: [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]], mel: 0.6, arp: 0.9, bell: 0.45, drums: 0.6 },
    savanna: { bpm: 96, root: 60, scale: [0, 2, 4, 7, 9], prog: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 9]], mel: 0.65, arp: 0.6, bell: 0.2, drums: 0.7 },
    cloudsea: { bpm: 72, root: 67, scale: [0, 2, 4, 6, 7, 9, 11], prog: [[0, 4, 7, 11], [2, 6, 9, 14], [4, 7, 11, 14], [7, 11, 14, 18]], mel: 0.4, arp: 0.7, bell: 1.0, drums: 0.1 },
    beach: { bpm: 100, root: 65, scale: [0, 2, 4, 5, 7, 9, 11], prog: [[0, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 12], [7, 11, 14, 17]], mel: 0.7, arp: 0.8, bell: 0.35, drums: 0.45 },
    battle: { bpm: 132, root: 62, scale: [0, 2, 3, 5, 7, 8, 10], prog: [[0, 3, 7], [8, 12, 15], [10, 14, 17], [7, 11, 14]], mel: 0.7, arp: 1, bell: 0, drums: 1 },
    boss: { bpm: 146, root: 59, scale: [0, 1, 3, 5, 7, 8, 11], prog: [[0, 3, 7], [1, 5, 8], [8, 12, 15], [7, 11, 14]], mel: 0.75, arp: 1, bell: 0, drums: 1.2 },
    night: { bpm: 64, root: 64, scale: [0, 2, 4, 7, 9], prog: [[0, 4, 7, 11], [9, 12, 16], [5, 9, 12], [7, 11, 14]], mel: 0.3, arp: 0.6, bell: 0.6, drums: 0 },
    icesea: { bpm: 70, root: 66, scale: [0, 2, 3, 5, 7, 9, 10], prog: [[0, 3, 7, 10], [5, 9, 12], [3, 7, 10, 14], [7, 10, 14]], mel: 0.4, arp: 0.7, bell: 1.0, drums: 0.08 },
    icecity: { bpm: 86, root: 69, scale: [0, 2, 4, 7, 9, 11], prog: [[0, 4, 7, 11], [9, 12, 16], [5, 9, 12, 16], [7, 11, 14]], mel: 0.55, arp: 0.9, bell: 0.85, drums: 0.25 },
    typedragon: { bpm: 156, root: 57, scale: [0, 1, 3, 5, 6, 8, 10], prog: [[0, 3, 7], [6, 10, 13], [1, 5, 8], [8, 12, 15]], mel: 0.8, arp: 1, bell: 0.2, drums: 1.35 },
    nightisle: { bpm: 58, root: 62, scale: [0, 2, 3, 7, 9], prog: [[0, 3, 7, 10], [9, 12, 15], [5, 8, 12], [7, 10, 14]], mel: 0.32, arp: 0.6, bell: 1.0, drums: 0 },
    plustown: { bpm: 112, root: 65, scale: [0, 2, 4, 5, 7, 9, 11], prog: [[0, 4, 7, 11], [9, 12, 16, 19], [2, 5, 9, 12], [7, 11, 14, 17]], mel: 0.7, arp: 1, bell: 0.4, drums: 0.75 },
    gacha: { bpm: 120, root: 67, scale: [0, 2, 4, 7, 9], prog: [[0, 4, 7, 11], [5, 9, 12, 16], [9, 12, 16, 19], [7, 11, 14, 18]], mel: 0.6, arp: 1, bell: 1.0, drums: 0.5 },
    ending: { bpm: 68, root: 62, scale: [0, 2, 4, 5, 7, 9, 11], prog: [[0, 4, 7, 11], [5, 9, 12, 16], [9, 12, 16, 19], [7, 11, 14, 17]], mel: 0.6, arp: 1, bell: 0.5, drums: 0 }
  };
  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    try { A.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const c = A.ctx;
    A.master = c.createGain(); A.master.connect(c.destination);
    A.comp = c.createDynamicsCompressor(); A.comp.connect(A.master);
    A.bgm = c.createGain(); A.sfx = c.createGain(); A.bgm.connect(A.comp); A.sfx.connect(A.comp);
    // リバーブ
    const len = c.sampleRate * 2.4, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    A.rev = c.createConvolver(); A.rev.buffer = ir; A.revG = c.createGain(); A.revG.gain.value = 0.32; A.rev.connect(A.revG); A.revG.connect(A.comp);
    A.bgmRev = c.createGain(); A.bgmRev.gain.value = 0.55; A.bgmRev.connect(A.rev);
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; A.noise = nb;
    A.applyVol();
    setInterval(A.tick, 40);
  };
  A.applyVol = function () { if (!A.ctx) return; const S = PS.Settings; A.master.gain.value = S.volMaster; A.bgm.gain.value = S.volBgm * 0.55; A.sfx.gain.value = S.volSfx; };
  function env(g, t, a, peak, d, sus, rel, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.linearRampToValueAtTime(peak * sus, t + a + d); g.gain.setValueAtTime(peak * sus, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + rel); }
  function tone(type, f, t, dur, vol, out, o) {
    const c = A.ctx, osc = c.createOscillator(), g = c.createGain(); o = o || {};
    osc.type = type; osc.frequency.setValueAtTime(f, t); if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t + dur);
    if (o.det) osc.detune.value = o.det;
    let node = osc;
    if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; fl.Q.value = o.q || 0.7; osc.connect(fl); node = fl; }
    node.connect(g); g.connect(out); if (o.rev) g.connect(A.bgmRev);
    env(g, t, o.a || 0.01, vol, o.d || 0.1, o.s == null ? 0.6 : o.s, o.r || 0.2, dur);
    osc.start(t); osc.stop(t + dur + (o.r || 0.2) + 0.05);
  }
  function noise(t, dur, vol, out, o) {
    const c = A.ctx, s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter(); o = o || {};
    s.buffer = A.noise; f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 1200, t); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur); f.Q.value = o.q || 1;
    s.connect(f); f.connect(g); g.connect(out); if (o.rev) g.connect(A.rev);
    env(g, t, o.a || 0.005, vol, 0.05, o.s == null ? 0.4 : o.s, o.r || 0.1, dur);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + (o.r || 0.1) + 0.05);
  }
  // ---------------- BGM ----------------
  A.play = function (name) {
    if (!A.ctx) { A.pending = name; return; }
    if (A.curName === name) return;
    A.curName = name; A.cur = THEMES[name] || null; A.step = 0; A.nextT = A.ctx.currentTime + 0.3; A.bar = 0;
    A.bgm.gain.cancelScheduledValues(A.ctx.currentTime); A.bgm.gain.setValueAtTime(0.0001, A.ctx.currentTime); A.bgm.gain.linearRampToValueAtTime(PS.Settings.volBgm * 0.55, A.ctx.currentTime + 1.5);
  };
  A.stop = function () { A.cur = null; A.curName = null; };
  A.tick = function () {
    if (!A.ctx || !A.cur) return;
    const th = A.cur, spb = 60 / th.bpm / 2;
    while (A.nextT < A.ctx.currentTime + 0.25) { scheduleStep(th, A.step, A.nextT, spb); A.step++; A.nextT += spb; }
  };
  let melNote = 7;
  function scheduleStep(th, step, t, spb) {
    const out = A.bgm, s8 = step % 16, bar = Math.floor(step / 16), chord = th.prog[bar % th.prog.length], root = th.root;
    if (s8 === 0) {
      for (const n of chord) { tone('triangle', mtof(root - 12 + n), t, spb * 15, 0.035, out, { a: 0.6, d: 0.4, s: 0.8, r: 1.4, lp: 1400, rev: true, det: -6 }); tone('sawtooth', mtof(root - 12 + n), t, spb * 15, 0.012, out, { a: 0.8, s: 0.8, r: 1.4, lp: 900, rev: true, det: 7 }); }
      tone('sine', mtof(root - 24 + chord[0]), t, spb * 7, 0.11, out, { a: 0.02, d: 0.3, s: 0.7, r: 0.4 });
    }
    if (s8 === 8) tone('sine', mtof(root - 24 + chord[0] + (th.drums > 0.8 ? 0 : 7)), t, spb * 7, 0.09, out, { a: 0.02, d: 0.3, s: 0.7, r: 0.4 });
    if (th.arp && (th.drums > 0.8 || s8 % 2 === 0) && Math.random() < th.arp) {
      const n = chord[(step >> (th.drums > 0.8 ? 0 : 1)) % chord.length];
      tone('triangle', mtof(root + n + (s8 >= 8 ? 12 : 0)), t, spb * 0.9, 0.035, out, { a: 0.005, d: 0.15, s: 0.2, r: 0.3, lp: 3200, rev: true });
    }
    if (th.mel && s8 % 2 === 0 && Math.random() < th.mel * (s8 % 4 === 0 ? 1 : 0.5)) {
      melNote = PS.clamp(melNote + Math.floor(Math.random() * 5) - 2, 0, th.scale.length * 2 - 1);
      if (Math.random() < 0.3) melNote = th.scale.length + Math.floor(Math.random() * 3);
      const oct = Math.floor(melNote / th.scale.length), deg = th.scale[melNote % th.scale.length];
      tone(th.drums > 0.8 ? 'square' : 'sine', mtof(root + 12 + oct * 12 + deg), t, spb * (s8 % 4 === 0 ? 1.8 : 0.9), th.drums > 0.8 ? 0.02 : 0.05, out, { a: 0.02, d: 0.2, s: 0.6, r: 0.5, lp: 2600, rev: true });
    }
    if (th.bell && s8 % 4 === 2 && Math.random() < th.bell * 0.5) { const n = chord[Math.floor(Math.random() * chord.length)]; tone('sine', mtof(root + 24 + n), t, 0.05, 0.03, out, { a: 0.002, d: 0.6, s: 0.0, r: 1.2, rev: true }); tone('sine', mtof(root + 24 + n) * 2.76, t, 0.05, 0.01, out, { a: 0.002, d: 0.3, s: 0, r: 0.6, rev: true }); }
    if (th.drums) {
      if (s8 % 8 === 0 || (th.drums > 0.8 && s8 % 8 === 6)) { tone('sine', 120, t, 0.12, 0.25 * Math.min(1, th.drums), out, { glide: 40, a: 0.002, d: 0.1, s: 0.3, r: 0.1 }); }
      if (th.drums > 0.8 && s8 % 8 === 4) noise(t, 0.08, 0.12, out, { f: 1800, q: 0.8, r: 0.12 });
      if (s8 % 2 === 1 && Math.random() < th.drums * 0.8) noise(t, 0.02, 0.03, out, { f: 8000, type: 'highpass', r: 0.04 });
    }
  }
  // ---------------- 効果音 ----------------
  A.sfxPlay = function (name, vol) {
    if (!A.ctx) return; const c = A.ctx, t = c.currentTime, o = A.sfx; vol = vol == null ? 1 : vol;
    switch (name) {
      case 'swing': noise(t, 0.12, 0.25 * vol, o, { f: 900, f2: 3500, q: 1.2, r: 0.08 }); break;
      case 'heavy': noise(t, 0.2, 0.35 * vol, o, { f: 500, f2: 1800, q: 1, r: 0.12 }); break;
      case 'hit': tone('sine', 180, t, 0.08, 0.3 * vol, o, { glide: 70, a: 0.002, r: 0.08 }); noise(t, 0.05, 0.25 * vol, o, { f: 2400, q: 0.8, r: 0.05 }); break;
      case 'crit': tone('square', 420, t, 0.06, 0.12 * vol, o, { glide: 160, a: 0.002, r: 0.1, lp: 3000 }); noise(t, 0.08, 0.3 * vol, o, { f: 3000, q: 0.8, r: 0.08 }); break;
      case 'hurt': tone('sawtooth', 220, t, 0.15, 0.15 * vol, o, { glide: 90, lp: 1200, r: 0.1 }); noise(t, 0.1, 0.2 * vol, o, { f: 600, r: 0.1 }); break;
      case 'jump': noise(t, 0.08, 0.12 * vol, o, { f: 600, f2: 1500, r: 0.06 }); break;
      case 'land': noise(t, 0.06, 0.15 * vol, o, { f: 300, type: 'lowpass', r: 0.06 }); break;
      case 'dash': noise(t, 0.2, 0.22 * vol, o, { f: 400, f2: 2500, q: 0.7, r: 0.12 }); break;
      case 'pickup': tone('sine', 880, t, 0.06, 0.12 * vol, o, { r: 0.2 }); tone('sine', 1320, t + 0.07, 0.08, 0.12 * vol, o, { r: 0.3 }); break;
      case 'coin': tone('square', 1568, t, 0.04, 0.05 * vol, o, { lp: 5000, r: 0.08 }); tone('square', 2093, t + 0.05, 0.08, 0.05 * vol, o, { lp: 5000, r: 0.2 }); break;
      case 'levelup': [0, 4, 7, 12, 16].forEach((n, i) => tone('triangle', mtof(72 + n), t + i * 0.08, 0.25, 0.12 * vol, o, { r: 0.6, rev: true })); break;
      case 'ui': tone('sine', 1200, t, 0.03, 0.08 * vol, o, { r: 0.05 }); break;
      case 'uiOpen': tone('sine', 700, t, 0.05, 0.08 * vol, o, { glide: 1100, r: 0.1 }); break;
      case 'uiClose': tone('sine', 1000, t, 0.05, 0.07 * vol, o, { glide: 600, r: 0.1 }); break;
      case 'magic': tone('sine', 600, t, 0.25, 0.1 * vol, o, { glide: 1400, r: 0.3, rev: true }); noise(t, 0.3, 0.08 * vol, o, { f: 5000, type: 'highpass', r: 0.3 }); break;
      case 'fire': noise(t, 0.4, 0.3 * vol, o, { f: 300, f2: 900, q: 0.6, r: 0.3 }); tone('sawtooth', 90, t, 0.3, 0.1 * vol, o, { lp: 400, r: 0.2 }); break;
      case 'ice': tone('sine', 2400, t, 0.15, 0.06 * vol, o, { glide: 3200, r: 0.3, rev: true }); noise(t, 0.2, 0.12 * vol, o, { f: 6000, q: 2, r: 0.2 }); break;
      case 'thunder': noise(t, 0.35, 0.45 * vol, o, { f: 200, type: 'lowpass', r: 0.6 }); noise(t, 0.05, 0.3 * vol, o, { f: 4000, r: 0.1 }); break;
      case 'water': noise(t, 0.3, 0.25 * vol, o, { f: 800, f2: 300, q: 1.2, r: 0.2 }); break;
      case 'wind': noise(t, 0.45, 0.25 * vol, o, { f: 700, f2: 2400, q: 2, r: 0.3 }); break;
      case 'boom': tone('sine', 90, t, 0.4, 0.4 * vol, o, { glide: 30, r: 0.4 }); noise(t, 0.3, 0.35 * vol, o, { f: 400, type: 'lowpass', r: 0.5, rev: true }); break;
      case 'heal': [0, 5, 9, 12].forEach((n, i) => tone('sine', mtof(76 + n), t + i * 0.06, 0.2, 0.07 * vol, o, { r: 0.5, rev: true })); break;
      case 'chest': [0, 4, 7, 11, 14, 19].forEach((n, i) => tone('triangle', mtof(67 + n), t + i * 0.07, 0.2, 0.1 * vol, o, { r: 0.6, rev: true })); break;
      case 'waypoint': [0, 7, 12, 19].forEach((n, i) => tone('sine', mtof(64 + n), t + i * 0.12, 0.4, 0.1 * vol, o, { r: 1.0, rev: true })); break;
      case 'die': tone('sine', 300, t, 0.3, 0.12 * vol, o, { glide: 80, r: 0.3 }); noise(t, 0.3, 0.12 * vol, o, { f: 1200, f2: 300, r: 0.3 }); break;
      case 'boss': tone('sawtooth', 55, t, 1.5, 0.2 * vol, o, { lp: 300, a: 0.2, r: 1.0, rev: true }); tone('sawtooth', 82, t, 1.5, 0.12 * vol, o, { lp: 400, a: 0.2, r: 1.0 }); break;
      case 'awaken': tone('sawtooth', 110, t, 0.8, 0.18 * vol, o, { glide: 440, lp: 1500, r: 0.6, rev: true }); noise(t, 0.6, 0.25 * vol, o, { f: 300, f2: 3000, r: 0.4 }); break;
      case 'step': noise(t, 0.03, 0.04 * vol, o, { f: 500, type: 'lowpass', r: 0.03 }); break;
      case 'freeze': tone('sine', 3000, t, 0.3, 0.06 * vol, o, { glide: 1200, r: 0.3 }); noise(t, 0.2, 0.15 * vol, o, { f: 7000, q: 3, r: 0.2 }); break;
      case 'quest': [0, 4, 7, 12].forEach((n, i) => tone('triangle', mtof(69 + n), t + i * 0.1, 0.3, 0.1 * vol, o, { r: 0.8, rev: true })); break;
      case 'deny': tone('square', 200, t, 0.1, 0.06 * vol, o, { lp: 800, r: 0.1 }); break;
    }
  };
})(window.PS);
