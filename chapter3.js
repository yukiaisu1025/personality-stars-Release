// Beta v1.0.10：第三章（異界の結晶）・結晶の守護者のギミック・サポートキャラの効果
(function (PS) {
  'use strict';
  const G = PS.G, D = PS.DATA, W = PS.World, R = PS.R, M4 = PS.M4;
  const tmpM = M4.create();

  // ================= サポートキャラの効果 =================
  G.supMods = function () {
    const s = G.save, out = { hp: 1, spd: 1, pers: 1, awk: 1 };
    if (!s || !s.party) return out;
    for (const id of G.activeSups()) {
      const c = D.compatOf(id, s.pers);
      if (id === 'arulu') { if (c === 'good') out.pers = 2; else out.spd *= 0.95; }
      else if (id === 'star' && c === 'good') out.awk *= 1 + 0.05 + 0.02 * Math.floor(s.level / 10);
      else if (id === 'marun') out.hp *= c === 'good' ? 1.05 : 1.03;
    }
    return out;
  };
  // 予言者：未来が見える秒数（アルルの相性良で2倍）
  G.foresight = () => (G.save && D.PERS[G.save.pers].prophet ? D.FORESIGHT * G.supMods().pers : 0);

  // ================= 結晶の守護者：シールド =================
  const _dmg = G.damageEnemy;
  G.damageEnemy = function (e, mult, el, o) {
    if (e && e.shield && !e.dead) {
      if (G.time - (e._shT || 0) > 0.3) {
        e._shT = G.time; PS.UI.dmgText(e.x, e.y + e.height * 0.6, e.z, 'シールド', '#bff6ff'); PS.Audio.sfxPlay('deny', 0.5);
        G.ring(e.x, e.y + e.height * 0.45, e.z, e.radius * e.scale + 1.4, [0.7, 0.9, 1], 0.25);
        if (!G._shTip || G.time - G._shTip > 8) { G._shTip = G.time; PS.UI.notify(e.shieldTip || '結晶柱がシールドを張っている！ 先に結晶柱を砕こう', 'warn'); }
      }
      return 0;
    }
    return _dmg.call(this, e, mult, el, o);
  };

  G.shrine = null; // 戦闘中の祭壇 { sh, boss, pylons, phase, t, shieldWas }
  const spawnPylons = (F, n, r) => {
    const sh = F.sh, off = Math.random() * 6.28;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + off, x = sh.x + Math.cos(a) * r, z = sh.z + Math.sin(a) * r;
      const py = new G.Enemy('pylon', Math.max(1, sh.lv - 4), x, z, { aggro: false }); py.ax = x; py.az = z;
      G.enemies.push(py); F.pylons.push(py);
      G.pillarFX(x, py.y, z, 1.2, 14, PS.hexRGB(sh.color || '#bff6ff'), 0.8);
    }
  };
  G.updateShrines = function (dt) {
    const s = G.save, p = G.player.pos; if (!s || s.chapter < 3 || G.scene !== 'world') return;
    const F = G.shrine;
    if (F) {
      const b = F.boss;
      if (!G.enemies.includes(b)) { for (const py of F.pylons) py.dead = true; G.shrine = null; return; } // 倒れて村に戻ったなど
      if (b.dead) return;
      // 決戦場から出られない
      const d = Math.hypot(p.x - F.sh.x, p.z - F.sh.z);
      if (d > 27.5) { const k = 27.5 / d; p.x = F.sh.x + (p.x - F.sh.x) * k; p.z = F.sh.z + (p.z - F.sh.z) * k; }
      // 結晶柱は動かない。ボスへ光の糸が伸びる
      let alive = 0;
      for (const py of F.pylons) {
        if (py.dead || !G.enemies.includes(py)) continue; alive++;
        py.x = py.ax; py.z = py.az; py.kx = 0; py.kz = 0;
        if (Math.random() < dt * 30) { const t = Math.random(); G.emit(1, { x: PS.lerp(py.x, b.x, t), y: PS.lerp(py.y + 2, b.y + b.height * 0.5, t), z: PS.lerp(py.z, b.z, t), color: F.sh.color || '#bff6ff', vs: 0.2, size: 0.35, life: 0.35, kind: 1, add: true }); }
      }
      b.shield = alive > 0;
      if (F.shieldWas && !b.shield) {
        PS.UI.banner('シールド解除！', '今がチャンスだ！', F.sh.color || '#bff6ff'); PS.Audio.sfxPlay('boss', 0.5); G.shake(0.6);
        b.st.stun = Math.max(b.st.stun || 0, 3.5); G.ring(b.x, b.y + 0.3, b.z, 9, [0.8, 0.95, 1], 0.6);
      }
      F.shieldWas = b.shield;
      // 追い詰めると柱を呼び戻して怒る
      if (!F.phase && b.hp < b.maxHp * 0.5) {
        F.phase = 1; spawnPylons(F, 3, 13); b.atk = Math.round(b.atk * 1.15); b.enraged = true;
        PS.UI.banner('守護者の怒り', '結晶柱が再び現れた！', '#ff6a8a'); PS.Audio.sfxPlay('boss'); G.shake(0.8); G.supportSay('boss', true);
      }
      // ギミック：異界の結晶が降ってくる
      F.t -= dt;
      if (F.t <= 0) {
        F.t = F.phase ? 5.5 : 7.5;
        const n = F.phase ? 4 : 3;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.28, r = i === 0 ? 0 : 4 + Math.random() * 7;
          G.hazard({ owner: 'e', shape: 'circle', x: p.x + Math.cos(a) * r, z: p.z + Math.sin(a) * r, ty: p.y, r: 3.2, delay: 1.4 + i * 0.15, mult: 0.9, atk: b.atk, lv: b.lv, el: 'arcane', look: 'meteor', src: b });
        }
      }
      return;
    }
    if (G.bossActive) return;
    for (const sh of W.SHRINES) {
      if (s.guardians[sh.id]) continue;
      const d = Math.hypot(p.x - sh.x, p.z - sh.z);
      if (d < 21 && Math.abs(p.y - sh.y) < 16) { G.startShrine(sh); break; }
    }
  };
  G.startShrine = function (sh) {
    const b = new G.Enemy(sh.boss, sh.lv, sh.x, sh.z - 11, { aggro: true, state: 'chase', onDeath: () => G.guardianWin(sh) });
    G.enemies.push(b); G.bossActive = b; b.shield = true;
    const F = G.shrine = { sh, boss: b, pylons: [], phase: 0, t: 6, shieldWas: true };
    spawnPylons(F, 4, 16);
    PS.UI.banner(D.ENEMIES[sh.boss].name, '結晶の守護者 ― 結晶柱を砕いてシールドを解除せよ', sh.color);
    PS.Audio.play('boss'); PS.Audio.sfxPlay('boss'); G.shake(0.8); G.supportSay('boss', true);
  };
  G.guardianWin = function (sh) {
    const s = G.save; s.guardians[sh.id] = true;
    if (G.shrine) for (const py of G.shrine.pylons) if (!py.dead) { py.dead = true; py.deadT = 0; }
    G.shrine = null; G.bossActive = null; PS.UI.bossBar(null);
    G.addItem('crystal3', 1); G.questEvent('boss', sh.boss);
    G.pillarFX(sh.x, sh.y, sh.z, 2.5, 60, PS.hexRGB(sh.color), 3);
    setTimeout(() => { PS.UI.banner('異界の結晶を手に入れた！', sh.name + '（' + s.guardians.filter(x => x).length + '/5）', sh.color); PS.Audio.sfxPlay('quest'); }, 1500);
    if (G.ch3Done()) setTimeout(() => PS.UI.notify('五つの結晶が共鳴している……雲海高原の「虚晶の玉座」への道が開いた！', 'quest'), 5000);
    G.writeSave(true); G.pickBGM();
  };

  // ================= 第三章の最終決戦（虚晶の玉座） =================
  const _uf = G.updateFinal;
  G.updateFinal = function () {
    _uf();
    const s = G.save, p = G.player.pos; if (!W.ch3 || s.chapter < 3 || s.final3) return;
    const S = W.SUMMIT3, d = Math.hypot(p.x - S.x, p.z - S.z);
    if (d < 48 && p.y > S.y - 20) {
      if (!G.ch3Done()) {
        if (d < 44) { const k = 44 / Math.max(0.01, d); p.x = S.x + (p.x - S.x) * k; p.z = S.z + (p.z - S.z) * k; if (!G._finalMsg || G.time - G._finalMsg > 4) { G._finalMsg = G.time; PS.UI.notify('異界の結界に阻まれた…（異界の結晶 ' + s.guardians.filter(x => x).length + '/5）', 'warn'); } }
      } else if (!G.bossActive && d < 34) {
        const b = new G.Enemy('crystalion', S.lv, S.x, S.z - 10, { aggro: true, state: 'chase', onDeath: () => G.finalWin3() });
        G.enemies.push(b); G.bossActive = b; G._final3 = b;
        PS.UI.banner(D.ENEMIES.crystalion.name, '異界の王', '#ff9ef0'); PS.Audio.play('boss'); PS.Audio.sfxPlay('boss'); G.shake(0.9); G.supportSay('boss', true);
      }
    }
    // 最終ボスが呼んだ結晶柱もシールドを張る
    const b = G._final3;
    if (b && !b.dead && G.enemies.includes(b)) {
      const py = G.enemies.filter(e => e.key === 'pylon' && !e.dead);
      for (const q of py) { if (q.ax == null) { q.ax = q.x; q.az = q.z; } q.x = q.ax; q.z = q.az; q.kx = q.kz = 0; }
      const was = b.shield; b.shield = py.length > 0;
      if (was && !b.shield) { PS.UI.banner('シールド解除！', '今がチャンスだ！', '#ff9ef0'); b.st.stun = Math.max(b.st.stun || 0, 2.5); }
      if (d > 30 && d < 60) { const k = 30 / d; p.x = S.x + (p.x - S.x) * k; p.z = S.z + (p.z - S.z) * k; }
    } else G._final3 = null;
  };
  G.finalWin3 = function () {
    const s = G.save; s.final3 = true; G.questEvent('boss', 'crystalion'); G.bossActive = null; G._final3 = null; PS.UI.bossBar(null);
    for (const e of G.enemies) if (e.key === 'pylon' && !e.dead) e.dead = true;
    G.writeSave(true);
    setTimeout(() => PS.Story.ending3(), 2500);
  };
  // 第二章クリア → 島の四隅に異界の大地が現れる（再起動）
  G.toChapter3 = function () {
    const s = G.save; s.chapter = 3; s.ch3intro = false; s.guardians = s.guardians || [false, false, false, false, false];
    const v = W.VILLAGES[0]; s.pos = [v.x + 6, v.y, v.z + 18]; s.yaw = Math.PI;
    try { localStorage.setItem('ps_save_v1', JSON.stringify(s)); } catch (e) { }
    G.state = 'ending'; G.reloadWith('ch3');
  };

  // ================= 描画 =================
  let SM = null;
  const meshes = () => {
    if (SM) return SM;
    const mk = (mb) => PS.GLH.makeMesh(R.gl, mb.pack());
    SM = { base: W.SHRINES.map(sh => mk(PS.Props.crystalShrine(sh.color))), crystal: W.SHRINES.map(sh => mk(PS.Props.voidCrystal(sh.color))), throne: mk(PS.Props.voidThrone()), tcrystal: mk(PS.Props.voidCrystal('#ff9ef0')) };
    return SM;
  };
  G.drawShrines = function (pass) {
    const m = meshes(), s = G.save;
    for (const sh of W.SHRINES) {
      if (!R.visible(sh.x, sh.y + 4, sh.z, 34)) continue;
      M4.compose(tmpM, sh.x, sh.y - 0.1, sh.z, 0, 0, 0, 1); R.drawMesh(m.base[sh.id], tmpM);
      if (!(s && s.guardians && s.guardians[sh.id])) { M4.compose(tmpM, sh.x, sh.y + 7 + Math.sin(G.time * 1.3) * 0.5, sh.z, 0, G.time * 0.6, 0, 1.6); R.drawMesh(m.crystal[sh.id], tmpM, null, 1); }
    }
    const S = W.SUMMIT3;
    if (R.visible(S.x, S.y + 4, S.z, 36)) {
      M4.compose(tmpM, S.x, S.y - 0.1, S.z, 0, 0, 0, 1); R.drawMesh(m.throne, tmpM);
      if (!(s && s.final3)) { M4.compose(tmpM, S.x, S.y + 14 + Math.sin(G.time) * 0.6, S.z - 18.6, 0, G.time * 0.5, 0, 2.2); R.drawMesh(m.tcrystal, tmpM, null, 1); }
    }
  };
  G.shrineFX = function () {
    const s = G.save; if (!s || s.chapter < 3) return;
    for (const sh of W.SHRINES) {
      if (s.guardians[sh.id]) continue;
      const c = PS.hexRGB(sh.color);
      G.fx.push({ mode: 2, x: sh.x, y: sh.y + 8, z: sh.z, size: [1.3, 320, 1.3], color: [c[0], c[1], c[2], 0.32], t: 0.5, dur: 1, add: true, once: true });
    }
    const F = G.shrine;
    if (F) {
      const c = PS.hexRGB(F.sh.color);
      G.fx.push({ mode: 2, x: F.sh.x, y: F.sh.y, z: F.sh.z, size: [28, 16, 28], color: [c[0], c[1], c[2], 0.08], t: 0.5, dur: 1, add: true, once: true });
      const b = F.boss; if (b.shield && !b.dead) G.fx.push({ mode: 2, x: b.x, y: b.y - 0.5, z: b.z, size: [b.radius * b.scale + 1.6, b.height + 2, b.radius * b.scale + 1.6], color: [0.75, 0.92, 1, 0.16], t: 0.5, dur: 1, add: true, once: true });
    }
    const b3 = G._final3; if (b3 && b3.shield && !b3.dead) G.fx.push({ mode: 2, x: b3.x, y: b3.y - 0.5, z: b3.z, size: [b3.radius * b3.scale + 1.6, b3.height + 2, b3.radius * b3.scale + 1.6], color: [1, 0.7, 0.95, 0.16], t: 0.5, dur: 1, add: true, once: true });
    const S = W.SUMMIT3;
    if (!G.ch3Done()) G.fx.push({ mode: 2, x: S.x, y: S.y - 6, z: S.z, size: [44, 36, 44], color: [1, 0.6, 0.95, 0.1], t: 0.5, dur: 1, add: true, once: true });
    else if (!s.final3) G.fx.push({ mode: 2, x: S.x, y: S.y, z: S.z, size: [1.6, 420, 1.6], color: [1, 0.7, 0.95, 0.35], t: 0.5, dur: 1, add: true, once: true });
  };
})(window.PS);
