/* Personality Stars - main.js : ゲーム進行 / ループ / カメラ / 環境 / セーブ  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const G = PS.G, W = PS.World, D = PS.DATA, M4 = PS.M4, R = PS.R;
  const SEED = 20261112, SAVE_KEY = 'ps_save_v1';
  Object.assign(G, { state: 'boot', scene: 'world', time: 0, hitstop: 0, uiOpen: null, curRegion: 0, regionW: [1, 0, 0, 0, 0], ready: false });
  G.cam = { yaw: Math.PI, pitch: 0.28, dist: 6, tdist: 6, tx: 0, ty: 0, tz: 0, ex: 0, ey: 0, ez: 0, shake: 0 };
  G.pstat = { hp: 1, atk: 1, def: 1, spd: 1, aspd: 1, crit: 0.05, critDmg: 0.5 };

  // ================= 起動 =================
  PS.boot = function () {
    if (window.PS_BLOCKED || PS._booted) return; PS._booted = true; // 埋め込み・別タブ起動中などは起動しない（guard.js）
    const canvas = document.getElementById('gl');
    if (!R.init(canvas)) { document.getElementById('nogl').style.display = 'flex'; return; }
    PS.Input.bind(canvas); PS.UI.init();
    window.addEventListener('resize', () => R.resize());
    G.last = performance.now(); requestAnimationFrame(G.loop);
    G.setState('logo');
  };
  G.setState = function (s) {
    G.state = s;
    if (s === 'logo') PS.Story.logo(() => G.setState('loading'));
    else if (s === 'loading') {
      // 第一章をクリアしたセーブがあるときだけ、島を広げて生成する
      const sv = G.loadSave(), boot = G.bootFlag();
      W.configure(boot === 'newgame' || !sv ? 0 : (sv.chapter >= 5 || sv.final4) ? 3 : (sv.chapter >= 3 || sv.final2) ? 2 : (sv.chapter >= 2 || sv.final) ? 1 : 0);
      PS.Story.loadingShow(boot); G.gen = W.gen(SEED); G.genStart = performance.now(); G.genDone = false; G.loadP = 0;
    }
    else if (s === 'title') { PS.Story.titleShow(); PS.Audio.play('title'); }
  };

  // 再読み込みをまたぐ起動フラグ（第二章への移行・はじめから）
  G.bootFlag = function () { if (G._bootFlag !== undefined) return G._bootFlag; try { G._bootFlag = sessionStorage.getItem('ps_boot') || null; sessionStorage.removeItem('ps_boot'); } catch (e) { G._bootFlag = null; } return G._bootFlag; };
  G.reloadWith = function (flag) { try { sessionStorage.setItem('ps_boot', flag); } catch (e) { } location.reload(); };

  // ================= ロード =================
  G.stepLoading = function () {
    const t0 = performance.now();
    if (!G.genDone) {
      while (performance.now() - t0 < 28) {
        const r = G.gen.next();
        if (r.done) { G.finishWorld(); G.genDone = true; break; }
        G.realP = r.value[0]; G.loadMsg = r.value[1];
      }
    }
    const minT = 6.5, el = (performance.now() - G.genStart) / 1000, real = G.genDone ? 1 : (G.realP || 0);
    G.loadP = Math.min(real, PS.lerp(G.loadP, Math.min(real, el / minT), 0.08) + 0.002);
    if (G.genDone) G.loadP = Math.min(1, Math.max(G.loadP, Math.min(1, el / minT)));
    PS.Story.loadingUpdate(G.loadP, G.genDone && G.loadP > 0.999 ? '準備が整いました' : (G.loadMsg || '世界を構築しています'));
    if (G.genDone && G.loadP >= 0.999 && el >= minT && PS.Story.agreed()) {
      PS.Story.loadingHide();
      const boot = G.bootFlag(), sv = G.loadSave();
      if ((boot === 'ch2' || boot === 'ch3' || boot === 'ch5') && sv) { PS.Story.mode = 'none'; G.state = 'title'; PS.Audio.play('plains'); G.startGame(sv, false); }
      else if (boot === 'newgame') { G.state = 'title'; PS.Story.storyStart(); }
      else G.setState('title');
    }
  };
  G.finishWorld = function () {
    W.buildChunkIndex(); W.uploadTextures();
    for (const ch of W.chunks) { G.buildLOD(ch, 3); G.buildLOD(ch, 2); }
    G.gatherMesh = {}; for (const k of ['sweetflower', 'mint', 'mushroom', 'berry', 'cactusfruit', 'snowflower', 'firefruit', 'ore', 'skyberry', 'datefruit', 'aurorapeach', 'magmapepper', 'frostember', 'frostmango', 'baobab', 'cloudherb', 'coconut', 'icelily', 'snowpear', 'iceshard', 'nightbloom', 'moonstone']) G.gatherMesh[k] = PS.GLH.makeMesh(R.gl, PS.Props.gather(k).pack());
    G.itemMesh = { wing: PS.GLH.makeMesh(R.gl, PS.Props.featherItem().pack()), jump: PS.GLH.makeMesh(R.gl, PS.Props.bootsItem().pack()) };
    G.platform = PS.GLH.makeMesh(R.gl, (() => { const m = new PS.MeshBuilder(); m.sphere(0, -0.6, 0, 3.2, 0.7, 3.2, (nx, ny) => ny > 0.3 ? PS.col('#ffffff', 0.25) : PS.col('#dfe8ff', 0.1), 16, 8); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; m.sphere(Math.cos(a) * 3, -0.7, Math.sin(a) * 3, 1.1, 0.6, 1.1, PS.col('#f4f8ff', 0.2), 10, 6); } return m.pack(); })());
    G.ready = true;
  };
  G.buildLOD = function (ch, l) { if (!ch.lod[l]) W.buildChunk(ch, l); return ch.lod[l]; };

  // ================= セーブ =================
  G.hasSave = () => { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } };
  G.newSave = function (name, gender, pers) {
    const P = D.PERS[pers];
    return {
      v: 1, name, gender, pers, level: 1, exp: 0, gains: { hp: 0, atk: 0, def: 0 }, hp: P.hp, coins: 300,
      pos: [W.START.x, W.START.y || W.height(W.START.x, W.START.z), W.START.z], yaw: Math.PI, inv: { sweetflower: 3 }, weapons: [P.start], weapon: P.start, skills: [null, null],
      quests: {}, tracked: 'mq1', waypoints: [], dungeons: [false, false, false, false, false, false, false, false, false, false, false], final: false, chests: {}, visited: [], tod: 8.5, play: 0, tutorial: 0, foodSel: 'sweetflower', kills: 0, uid: String(800000000 + Math.floor(Math.random() * 99999999)),
      chapter: 1, party: { list: [], active: [], support: null, sups: [] }, found: {}, ver: D.VERSION
    };
  };
  G.writeSave = function (quiet) {
    if (!G.save || G.state === 'ending') return;
    const p = G.player, s = G.save;
    if (p && G.scene === 'world') { s.pos = [p.pos.x, p.pos.y, p.pos.z]; s.yaw = p.yaw; }
    else if (p && G.scene === 'dungeon') { s.pos = G.dunReturn.slice(); }
    if (p) s.hp = Math.min(p.hp, G.pstat.hp / (p.awk.on ? 2.5 : 1));
    s.tod = G.tod;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); if (!quiet) PS.UI.notify('セーブしました', 'info'); } catch (e) { PS.UI.notify('セーブに失敗しました', 'warn'); }
  };
  G.loadSave = function () { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } };
  G.deleteSave = function () { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } };

  // ================= ゲーム開始 =================
  // 古いバージョンのセーブを最新の形にそろえる
  G.migrateSave = function (s) {
    while (s.dungeons.length < 11) s.dungeons.push(false);
    if (!s.chapter) s.chapter = s.final ? 2 : 1;
    if (s.final2 && s.chapter < 3 && W.ch3) { s.chapter = 3; s.ch3intro = false; }
    if (s.chapter >= 3) s.ch2intro = true;
    if (s.chapter >= 3 && !W.ch3) s.chapter = 2;
    s.guardians = s.guardians || [false, false, false, false, false];
    G.partySave(); s.found = s.found || {}; s.quests = s.quests || {};
    if (s.chapter === 2 && !s.quests.mq4 && s.ch2intro) G.startQuest('mq4', true);
    if (s.chapter >= 3 && !s.quests.mq7 && s.ch3intro) G.startQuest('mq7', true);
  };
  G.startGame = function (save, fromStory) {
    G.save = save; G.migrateSave(save);
    G.tod = save.tod; G.scene = 'world'; G.dun = null;
    G.enemies = []; G.projs = []; G.hz = []; G.fx = []; G.parts = [];
    for (const sp of W.spawns) { sp.active = false; sp.alive = 0; sp.respawnAt = 0; }
    G.player = new G.Player(); G.player.setModel();
    const p = G.player; p.pos.x = save.pos[0]; p.pos.z = save.pos[2]; p.pos.y = W.height(p.pos.x, p.pos.z); p.yaw = save.yaw; G.cam.yaw = p.yaw;
    p.lastSafe = { x: p.pos.x, y: p.pos.y, z: p.pos.z };
    G.recalc(); p.hp = Math.min(save.hp || G.pstat.hp, G.pstat.hp); if (p.hp <= 0) p.hp = G.pstat.hp;
    p.fly.t = G.flightMax(); G.pcolor = D.PERS[save.pers].color;
    G.spawnNPCs();
    G.checkSkills(true);
    if (!save.quests.mq1) G.startQuest('mq1', true);
    G.cam.tx = p.pos.x; G.cam.ty = p.pos.y + 1.5; G.cam.tz = p.pos.z;
    G.state = 'play'; G.lastRegion = -1; G.autosave = 0;
    G.party = []; G.fairy = null; G.fairies = []; G.buildParty(); G.partyArrive();
    PS.UI.hudShow(true); PS.UI.refreshAll();
    if (fromStory && save.tutorial === 0) PS.Story.tutorialStart();
    G.fade(1.2);
    // 第二章の幕開け
    if (save.chapter === 2 && !save.ch2intro) setTimeout(() => PS.Story.chapter2Intro(), 900);
    if (save.chapter >= 3 && !save.ch3intro) setTimeout(() => PS.Story.chapter3Intro(), 900);
  };
  G.spawnNPCs = function () {
    G.npcs = [];
    for (const def of D.NPCS) {
      const v = W.VILLAGES.find(q => q.id === def.v); if (!v) continue;
      if ((def.ch || 1) > (G.save.chapter || 1)) continue;
      if (def.role === 'recruit' && G.hasComp(def.comp)) continue;
      let x = v.x + (def.dx || 0), z = v.z + (def.dz || 0);
      if (def.role === 'shop') { x = v.stall.x + 1.5; z = v.stall.z + 2.2; }
      G.npcs.push(new G.NPC(def, x, z));
    }
  };

  // ================= ステータス =================
  G.buildPlayerModel = function () {
    const s = G.save, P = D.PERS[s.pers], w = D.W[s.weapon];
    return PS.makeModel('player:' + s.pers + ':' + s.gender + ':' + s.weapon, () => {
      const look = Object.assign({ gender: s.gender, hair: s.gender === 'f' ? '#f2d58a' : '#3d3040', skin: '#ffe2cf' }, P.look, { weapon: Object.assign({ type: w.type }, w.look) });
      return { mb: PS.buildHumanoid(look), bones: PS.HB, anim: PS.animHuman, height: 1.7, radius: 0.4 };
    });
  };
  G.wpn = () => D.W[G.save.weapon];
  G.wpnType = () => G.wpn().type;
  G.wpnEl = () => G.wpn().el || 'phys';
  G.wpnColor = () => G.wpn().el ? D.ELEM[G.wpn().el].c : (G.wpn().type === 'staff' ? '#d8b0ff' : '#ffffff');
  G.flightMax = () => G.save.pers === 'flyer' ? Math.max(((D.PERS.flyer.flight || 3) + Math.floor(G.save.level / 5)) * G.supMods().pers, G.dunAbil('wing') ? 8 : 0) : 8;
  G.awakenDur = () => Math.round((30 + Math.floor(G.save.level / 5) * 10) * G.supMods().awk);
  G.recalc = function () {
    const s = G.save, P = D.PERS[s.pers], w = G.wpn(), p = G.player;
    const bm = G.baseMul(), sm = G.supMods();
    let hp = P.hp * bm * sm.hp + s.gains.hp, atk = P.atk * bm + s.gains.atk + (w ? w.atk : 0), def = P.def * bm + s.gains.def, spd = (s.pers === 'sprinter' ? 1 + (P.spd - 1) * sm.pers : P.spd) * sm.spd, aspd = 1;
    const b = { atk: 0, def: 0, spd: 0 }; if (p) for (const x of p.buffs) b[x.stat] = (b[x.stat] || 0) + x.val;
    atk *= 1 + b.atk; def *= 1 + b.def; spd *= 1 + b.spd;
    if (p && p.awk.on) { hp *= 2.5; atk *= 2.5; def *= 2.5; spd *= 1.2; aspd = 1.25; }
    G.pstat = { hp: Math.round(hp), atk: Math.round(atk), def: Math.round(def), spd, aspd, crit: 0.05, critDmg: 0.5, buffs: b };
    if (p && p.hp > G.pstat.hp) p.hp = G.pstat.hp;
  };
  // 報酬倍率（正直者は25%減少）
  G.rewardMul = () => (G.save && D.PERS[G.save.pers].honest ? 0.75 : 1);
  // 飛行・跳躍（遺跡の中だけの力も含む）
  G.dunAbil = (k) => G.scene === 'dungeon' && G.dun && G.dun.abil && G.dun.abil[k];
  G.canFly = () => G.save.pers === 'flyer' || !!G.dunAbil('wing');
  G.jumpV = () => (G.dunAbil('jump') ? 19.5 : 9.4);
  G.fallSafe = () => (G.dunAbil('jump') || G.dunAbil('wing') ? 30 : 23);
  G.skillById = (id) => (D.SKILLS[G.save.pers] || []).find(s => s.id === id);
  G.learned = () => (D.SKILLS[G.save.pers] || []).filter(s => s.lv <= G.save.level);
  G.nextSkillText = function () {
    const s = G.save; if (s.pers === 'awakener') return '覚醒者はスキルを覚えられません（Zで覚醒）';
    const n = (D.SKILLS[s.pers] || []).find(k => k.lv > s.level);
    return n ? 'スキル未装備：次のスキル「' + n.name + '」はLv.' + n.lv + 'で習得' : 'キャラクター画面でスキルを装備しよう';
  };
  G.checkSkills = function (silent) {
    const s = G.save;
    for (const sk of G.learned()) {
      if (s.skills.includes(sk.id)) continue;
      const known = s.knownSkills || (s.knownSkills = []);
      if (!known.includes(sk.id)) { known.push(sk.id); if (!silent) PS.UI.banner('新スキル習得', '「' + sk.name + '」', '#ffd36a'); }
      const slot = s.skills.indexOf(null); if (slot >= 0) s.skills[slot] = sk.id;
    }
  };
  G.addExp = function (n) {
    const s = G.save; if (s.level >= D.MAX_LV) return;
    s.exp += n; PS.UI.expGain(n);
    while (s.level < D.MAX_LV && s.exp >= D.expNeed(s.level)) {
      s.exp -= D.expNeed(s.level); s.level++;
      const L = D.LVUP, luck = [];
      const roll = (k) => { const lucky = Math.random() < 0.01; if (lucky) luck.push(k); return L[k][lucky ? 1 : 0]; };
      const g = { hp: roll('hp'), atk: roll('atk'), def: roll('def') };
      s.gains.hp += g.hp; s.gains.atk += g.atk; s.gains.def += g.def;
      G.recalc(); G.player.hp = G.pstat.hp;
      PS.UI.levelUp(s.level, g, luck);
      PS.Audio.sfxPlay('levelup');
      const p = G.player.pos; G.pillarFX(p.x, p.y, p.z, 1.2, 8, [0.6, 0.48, 0.2], 1.5); G.ring(p.x, p.y + 0.1, p.z, 5, [1, 0.85, 0.4], 0.8);
      G.emit(50, { x: p.x, y: p.y + 1, z: p.z, color: '#ffe080', vs: 4, vy: 4, size: 0.35, life: 1.4, kind: 1, spread: 1.4 });
      if (s.pers === 'flyer' && s.level % 5 === 0) PS.UI.notify('飛行時間が' + G.flightMax() + '秒に伸びた！', 'buff');
      if (s.pers === 'awakener' && s.level % 5 === 0) PS.UI.notify('覚醒時間が' + G.awakenDur() + '秒に伸びた！', 'buff');
      G.checkSkills(false);
      for (const c of G.party || []) { c.recalc(); c.hp = c.maxHp; if (s.level % 10 === 0) { const sk = G.compLearned(c.id).find(k => k.lv === s.level); if (sk) PS.UI.notify(c.def.name + 'が新スキル「' + sk.name + '」を習得した！', 'buff'); } }
      G.supportSay('levelup');
    }
    if (s.level >= D.MAX_LV) s.exp = 0;
  };
  G.addCoins = function (n, quiet) { n = G.coinGain ? G.coinGain(n) : n; G.save.coins += n; if (!quiet) PS.UI.toast('🪙', 'スターコイン', n); else PS.UI.coinTick(n); };
  G.addItem = function (id, n) { const s = G.save; s.inv[id] = (s.inv[id] || 0) + n; const it = D.ITEMS[id]; PS.UI.toast(it.icon, it.name, n, it.rar); G.questEvent('collect', id); };
  G.addWeapon = function (id) {
    const s = G.save, w = D.W[id];
    if (s.weapons.includes(id)) { G.addCoins(500 * w.rar); return; }
    s.weapons.push(id); PS.UI.toast('⚔', w.name, 1, w.rar);
    if (D.PERS[s.pers].weapons.includes(w.type) && w.atk > G.wpn().atk) PS.UI.notify('より強い武器を手に入れた！キャラクター画面で装備できます', 'buff');
  };
  G.equipWeapon = function (id) {
    const s = G.save, w = D.W[id];
    if (!D.PERS[s.pers].weapons.includes(w.type)) { PS.UI.notify(D.PERS[s.pers].name + 'は' + ({ sword: '剣', axe: '斧', staff: '杖' }[w.type]) + 'を装備できません', 'warn'); PS.Audio.sfxPlay('deny'); return false; }
    s.weapon = id; G.recalc(); const hp = G.player.hp; G.player.setModel(); G.player.hp = hp; G.player.combo = null; PS.Audio.sfxPlay('ui');
    return true;
  };
  G.eat = function (id) {
    const s = G.save, it = D.ITEMS[id], p = G.player;
    if (!it || it.cat !== 'food' || !(s.inv[id] > 0)) return false;
    if (p.hp >= G.pstat.hp) { PS.UI.notify('HPは満タンです', 'info'); return false; }
    if (G.eatCd > G.time) return false;
    G.eatCd = G.time + 0.6;
    s.inv[id]--; if (!s.inv[id]) delete s.inv[id];
    p.heal(G.pstat.hp * it.heal); PS.Audio.sfxPlay('heal');
    G.emit(14, { x: p.pos.x, y: p.pos.y + 1, z: p.pos.z, color: '#9cffb0', vs: 2, vy: 2, size: 0.3, life: 0.9, kind: 1, spread: 1 });
    return true;
  };
  G.quickFood = function () {
    const s = G.save; let id = s.foodSel;
    if (!(s.inv[id] > 0)) { id = Object.keys(s.inv).filter(k => D.ITEMS[k] && D.ITEMS[k].cat === 'food').sort((a, b) => D.ITEMS[a].heal - D.ITEMS[b].heal)[0]; if (id) s.foodSel = id; }
    if (!id) { PS.UI.notify('食べ物を持っていません', 'info'); return; }
    G.eat(id);
  };

  // ================= クエスト =================
  G.startQuest = function (id, quiet) {
    const q = D.QUESTS[id]; if (!q || G.save.quests[id]) return;
    G.save.quests[id] = { st: 'active', prog: q.obj.map(() => 0) };
    // 正直者：ミッション（サブクエスト）には制限時間がある
    if (!q.main && D.PERS[G.save.pers].honest) { G.save.quests[id].deadline = G.save.play + D.HONEST.questLimit; if (!quiet) setTimeout(() => PS.UI.notify('正直者の誓い：このミッションの制限時間は' + Math.round(D.HONEST.questLimit / 60) + '分', 'warn'), 1200); }
    if (q.main || !G.save.tracked || !G.save.quests[G.save.tracked] || G.save.quests[G.save.tracked].st === 'done') G.save.tracked = id;
    if (!quiet) { PS.UI.banner(q.main ? 'MAIN QUEST' : 'SUB QUEST', q.title, q.main ? '#ffd27a' : '#7fd8ff'); PS.Audio.sfxPlay('quest'); }
    if (id === 'mq2') for (let i = 0; i < 5; i++) if (G.save.dungeons[i]) G.save.quests.mq2.prog[i] = 1;
    if (id === 'mq5') q.obj.forEach((o, i) => { if (G.save.dungeons[o.id]) G.save.quests.mq5.prog[i] = 1; });
    PS.UI.refreshQuest();
  };
  G.questComplete = (id) => { const q = D.QUESTS[id], st = G.save.quests[id]; return q.obj.every((o, i) => st.prog[i] >= (o.n || 1)); };
  G.questEvent = function (type, what) {
    if (!G.save) return;
    if (type === 'kill') G.save.kills++;
    PS.Story && PS.Story.tutorialEvent(type, what);
    for (const id in G.save.quests) {
      const st = G.save.quests[id]; if (st.st !== 'active') continue; const q = D.QUESTS[id];
      q.obj.forEach((o, i) => {
        if (o.type === 'kill' && type === 'kill' && o.what === what && st.prog[i] < o.n) { st.prog[i]++; if (st.prog[i] >= o.n) PS.UI.notify('「' + q.title + '」：' + D.NPCS.find(n => n.id === q.giver).name + 'に報告しよう', 'quest'); }
        if (o.type === 'dungeon' && type === 'dungeon' && o.id === what) st.prog[i] = 1;
        if (o.type === 'boss' && type === 'boss' && o.id === what) st.prog[i] = 1;
        if (o.type === 'talk' && type === 'talk' && o.npc === what) st.prog[i] = 1;
      });
      if (q.main && G.questComplete(id)) G.finishQuest(id);
    }
    PS.UI.refreshQuest();
  };
  G.finishQuest = function (id) {
    const q = D.QUESTS[id], st = G.save.quests[id]; if (st.st === 'done') return;
    st.st = 'done'; const r = q.reward || {}, rm = G.rewardMul();
    if (r.coins) G.save.coins += G.coinGain ? G.coinGain(r.coins * rm) : Math.round(r.coins * rm);
    if (r.items) for (const [it, n] of r.items) G.addItem(it, Math.max(1, Math.round(n * rm)));
    const tw = /^tier(\d+)$/.exec(r.weapon || ''); if (tw && D.TIER_WEAPON[+tw[1]]) G.addWeapon(D.TIER_WEAPON[+tw[1]][D.PERS[G.save.pers].weapons[0]]);
    PS.UI.banner('QUEST CLEAR', q.title, '#ffd27a'); PS.Audio.sfxPlay('quest');
    if (r.exp) G.addExp(Math.round(r.exp * rm));
    if (q.next) setTimeout(() => G.startQuest(q.next), 2500);
    if (G.save.tracked === id) { G.save.tracked = q.next || Object.keys(G.save.quests).find(k => G.save.quests[k].st === 'active') || null; }
    PS.UI.refreshQuest(); G.writeSave(true);
  };
  G.questTarget = function () {
    const s = G.save, id = s.tracked; if (!id || !s.quests[id] || s.quests[id].st === 'done') return null;
    const q = D.QUESTS[id], st = s.quests[id];
    if (id === 'mq8') {
      let best = null, bd = 1e9; const p = G.player.pos;
      for (const sh of W.SHRINES || []) { if (s.guardians && s.guardians[sh.id]) continue; const dd = Math.hypot(sh.x - p.x, sh.z - p.z) + sh.lv * 30; if (dd < bd) { bd = dd; best = sh; } }
      return best ? { x: best.x, y: best.y + 8, z: best.z, label: best.name + 'で結晶の守護者を倒す（推奨Lv.' + best.lv + '）' } : null;
    }
    if (id === 'mq9') return { x: W.SUMMIT3.x, y: W.SUMMIT3.y + 6, z: W.SUMMIT3.z, label: q.obj[0].text };
    if (id === 'mq1' || id === 'mq4' || id === 'mq7') { const n = G.npcs.find(n => n.def.id === 'marc'); return n ? { x: n.x, y: n.y + 2.4, z: n.z, label: q.obj[0].text } : null; }
    if (id === 'mq5') {
      let best = null, bd = 1e9, hint = null; const p = G.player.pos;
      q.obj.forEach((o, i) => { if (st.prog[i]) return; const d = W.DUNGEONS[o.id]; if (!d) return; if (d.hidden && !s.found[d.id]) { hint = hint || o.hidden; return; } const dd = Math.hypot(d.x - p.x, d.z - p.z) + d.lv * 40; if (dd < bd) { bd = dd; best = d; } });
      return best ? { x: best.x, y: best.y + 8, z: best.z, label: best.name + 'を攻略する（推奨Lv.' + best.lv + '）' } : (hint ? { label: hint } : null);
    }
    if (id === 'mq6') return { x: W.SUMMIT2.x, y: W.SUMMIT2.y + 6, z: W.SUMMIT2.z, label: q.obj[0].text };
    if (id === 'mq2') {
      let best = null, bd = 1e9; const p = G.player.pos;
      W.DUNGEONS.forEach((d, i) => { if (st.prog[i]) return; const dd = Math.hypot(d.x - p.x, d.z - p.z) + d.lv * 40; if (dd < bd) { bd = dd; best = d; } });
      return best ? { x: best.x, y: best.y + 8, z: best.z, label: best.name + 'を攻略する（推奨Lv.' + best.lv + '）' } : null;
    }
    if (id === 'mq3') return { x: W.SUMMIT.x, y: W.SUMMIT.y + 6, z: W.SUMMIT.z, label: q.obj[0].text };
    if (q.giver) {
      const npc = G.npcs.find(n => n.def.id === q.giver);
      const done = q.obj.every((o, i) => o.type === 'collect' ? (s.inv[o.what] || 0) >= o.n : st.prog[i] >= (o.n || 1));
      if (done && npc) return { x: npc.x, y: npc.y + 2.4, z: npc.z, label: npc.def.name + 'に報告する' };
      const o = q.obj[0]; return { label: o.text + ' ' + (o.type === 'collect' ? Math.min(s.inv[o.what] || 0, o.n) : st.prog[0]) + '/' + o.n };
    }
    return null;
  };

  // ================= 会話・インタラクト =================
  G.talk = function (npc) {
    const d = npc.def, s = G.save, U = PS.UI;
    PS.Audio.sfxPlay('uiOpen');
    if (d.role === 'chief') {
      if (!s.quests.mq1 || s.quests.mq1.st !== 'done') { U.dialog(d.name, D.MARC.first, () => { G.questEvent('talk', 'marc'); }); return; }
      if (s.chapter >= 3) {
        if (s.quests.mq7 && s.quests.mq7.st !== 'done') return U.dialog(d.name, D.MARC.ch3first, () => G.questEvent('talk', 'marc'));
        if (s.final3) return U.dialog(d.name, D.MARC.ch3end);
        if (G.ch3Done()) return U.dialog(d.name, D.MARC.ch3ready);
        if (s.quests.mq8) return U.dialog(d.name, D.MARC.ch3mid);
      }
      if (s.chapter >= 2) {
        if (s.quests.mq4 && s.quests.mq4.st !== 'done') return U.dialog(d.name, D.MARC.ch2first, () => G.questEvent('talk', 'marc'));
        if (s.final2) return U.dialog(d.name, D.MARC.ch2end);
        if (G.ch2Done()) return U.dialog(d.name, D.MARC.ch2ready);
        if (s.quests.mq5) return U.dialog(d.name, D.MARC.ch2mid);
      }
      if (s.final) return U.dialog(d.name, D.MARC.end);
      if (s.dungeons.every(x => x)) return U.dialog(d.name, D.MARC.ready);
      return U.dialog(d.name, D.MARC.mid);
    }
    if (d.role === 'shop') return U.dialog(d.name, ['いらっしゃい！何かお探しかな？'], null, [{ t: '買い物をする', f: () => U.openShop(d) }, { t: '素材を売る', f: () => U.openSell(d) }, { t: 'さようなら', f: null }]);
    if (d.role === 'recruit') {
      const c = D.COMPANIONS[d.comp], L = c.lines, ok = G.compCondOK(d.comp);
      if (!ok) return U.dialog(d.name, L.before.length ? L.before : ['……']);
      return U.dialog(d.name, L.join, null, [{ t: '仲間になってもらう', f: () => G.recruitComp(d.comp) }, { t: 'また今度', f: null }]);
    }
    if (d.role === 'quest') {
      const qid = d.quest, q = D.QUESTS[qid], st = s.quests[qid], T = D.QUEST_TALK[qid];
      if (!st) return U.dialog(d.name, T.offer, null, [{ t: '引き受ける', f: () => G.startQuest(qid) }, { t: '今は無理だ', f: null }]);
      if (st.st === 'done') return U.dialog(d.name, ['この前は本当にありがとう！']);
      const o = q.obj[0];
      if (o.type === 'collect') { if ((s.inv[o.what] || 0) >= o.n) { s.inv[o.what] -= o.n; if (!s.inv[o.what]) delete s.inv[o.what]; st.prog[0] = o.n; return U.dialog(d.name, T.done, () => G.finishQuest(qid)); } return U.dialog(d.name, [D.ITEMS[o.what].name + 'はまだかな？（' + (s.inv[o.what] || 0) + '/' + o.n + '）']); }
      if (st.prog[0] >= o.n) return U.dialog(d.name, T.done, () => G.finishQuest(qid));
      return U.dialog(d.name, ['よろしく頼むよ。（' + st.prog[0] + '/' + o.n + '）']);
    }
    U.dialog(d.name, d.lines || ['……']);
  };
  G.interactables = function () {
    const p = G.player.pos, out = [], near = (x, z, r) => Math.hypot(x - p.x, z - p.z) < r;
    if (G.scene === 'world') {
      for (const n of G.npcs) if (near(n.x, n.z, 3)) out.push({ icon: '💬', text: n.def.name, f: () => G.talk(n) });
      for (const g of W.gathers) if (!g.taken && near(g.x, g.z, 2.2)) out.push({ icon: D.ITEMS[g.kind === 'ore' ? 'ore' : g.kind].icon, text: '拾う：' + D.ITEMS[g.kind].name, f: () => G.gather(g) });
      for (const c of W.chests) if (!G.save.chests[c.id] && near(c.x, c.z, 2.5)) out.push({ icon: '🎁', text: '宝箱を開ける', f: () => G.openChest(c) });
      for (const w of W.WAYPOINTS) if (near(w.x, w.z, 3.5)) out.push(G.save.waypoints.includes(w.id) ? { icon: '✦', text: 'ワープポイント：' + w.name, f: () => PS.UI.openMap() } : { icon: '✦', text: 'ワープポイントを解放する', f: () => G.unlockWP(w) });
      for (const v of W.VILLAGES) if (near(v.x, v.z, 4.2)) out.push({ icon: '⭐', text: '星の像に祈る', f: () => G.pray(v) });
      for (const f of G.fairyHomes) if (near(f.pos.x, f.pos.z, 3.4)) out.push({ icon: D.SUPPORT[f.id].icon, text: '話しかける：' + D.SUPPORT[f.id].name, f: () => G.meetFairy(f.id) });
      for (const d of W.DUNGEONS) if (near(d.x + Math.sin(d.ry) * 3, d.z + Math.cos(d.ry) * 3, 5)) out.push({ icon: '🌀', text: (d.ch2 ? '遺跡に入る：' : '迷宮に入る：') + d.name, f: () => G.askDungeon(d) });
      for (const cp of W.camps) if (cp.chest && !cp.opened && near(cp.x, cp.z + 2, 2.5)) out.push({ icon: '🎁', text: '宝箱を開ける', f: () => { cp.opened = true; G.openChest({ id: 'camp', kind: 1, lv: W.REG[cp.reg].lv[1], x: cp.x, y: cp.y, z: cp.z + 2, reg: cp.reg }, true); } });
    } else if (G.dun) {
      const d = G.dun;
      if (near(d.exit.x, d.exit.z, 3)) out.push({ icon: '🚪', text: '迷宮から出る', f: () => G.exitDungeon() });
      for (const it of d.items || []) {
        if (it.t === 'altar' && it.room.cleared && !d.abil[it.abil] && near(it.x, it.z, 3.2)) out.push({ icon: it.abil === 'wing' ? '🪶' : '👢', text: '手に取る：' + (it.abil === 'wing' ? '風切りの羽' : '跳躍の靴'), f: () => G.takeAbility(it) });
        if (it.t === 'spring' && near(it.x, it.z, 3.6)) out.push({ icon: '⛲', text: '星の泉で休む', f: () => G.restSpring(it) });
      }
      for (const rm of d.rooms) if (rm.chestOpen === false && near(rm.x, rm.z, 2.5) && (rm.y == null || Math.abs(p.y - rm.y) < 4)) out.push({ icon: '🎁', text: '宝箱を開ける', f: () => { rm.chestOpen = true; G.openChest({ id: 'dun', kind: rm.boss ? 2 : 1, lv: d.def.lv, x: rm.x, y: rm.y || 0, z: rm.z, reg: d.def.reg, tier: d.def.ctier, ch4: d.def.ch4 || d.def.sky }, true); } });
      if (d.portalOut && near(d.boss.x, d.boss.z - 6, 3) && (d.boss.y == null || Math.abs(p.y - d.boss.y) < 4)) out.push({ icon: '🌀', text: '外へ戻る', f: () => G.exitDungeon() });
    }
    return out;
  };
  // サポートモンスターとの出会い
  G.meetFairy = function (id) {
    const s = G.save, S = D.SUPPORT[id], U = PS.UI;
    if (id === 'lumi') {
      if (!s.quests.mq1 || s.quests.mq1.st !== 'done') return U.dialog('？？？', ['（光の粒がふわふわ浮かんでいる。こちらを見て、にこっと笑った気がする）', '……長老さんとのお話が終わったら、また来てね！']);
      return U.dialog(S.name, D.LUMI_LINES.meet.concat(D.LUMI_LINES.join), null, [{ t: 'いっしょに行こう', f: () => G.recruitSupport('lumi') }, { t: 'またね', f: null }]);
    }
    const cp = D.compatOf(id, s.pers), L = D.SUP_LINES[id] || D.FUWA_LINES;
    const say = L.meet.concat(cp === 'bad' ? (L.bad || []) : cp === 'normal' && L.normal ? L.normal : (L.good || []), ['（' + D.PERS[s.pers].name + 'との相性：' + D.COMPAT[cp].name + '　' + D.supEffect(id, s.pers) + '）']);
    return U.dialog(S.name, say, null, [{ t: 'いっしょに行こう', f: () => G.recruitSupport(id) }, { t: '今はいいや', f: null }]);
  };
  G.gather = function (g) { g.taken = G.time + 600; G.addItem(g.kind, g.kind === 'berry' ? 2 : 1); PS.Audio.sfxPlay('pickup'); G.emit(10, { x: g.x, y: g.y + 0.5, z: g.z, color: '#fff6c0', vs: 2, size: 0.25, life: 0.7, kind: 1 }); };
  G.openChest = function (c, transient) {
    if (!transient) G.save.chests[c.id] = true;
    PS.Audio.sfxPlay('chest');
    G.emit(40, { x: c.x, y: c.y + 0.8, z: c.z, color: c.kind === 2 ? '#d8a0ff' : '#ffe080', vs: 5, vy: 4, size: 0.35, life: 1.2, kind: 1 });
    G.pillarFX(c.x, c.y, c.z, 0.8, 5, c.kind === 2 ? [0.85, 0.6, 1] : [1, 0.9, 0.5], 1.0);
    const lv = c.lv || G.save.level, coins = Math.round((150 + lv * 90) * (1 + c.kind * 1.5) * (0.8 + Math.random() * 0.4) * G.rewardMul());
    G.addCoins(coins);
    G.addExp(Math.round(D.expGain(lv) * (1 + c.kind) * G.rewardMul()));
    G.supportSay('chest');
    const foods = D.REGION_FOOD; G.addItem(foods[c.reg || 0], 1 + c.kind);
    if (c.kind >= 1 && Math.random() < 0.5) G.addItem('potion', 1);
    if (c.kind === 2 || (c.kind === 1 && Math.random() < 0.35)) {
      const tier = (c.reg || 0) >= 5 || c.tier ? (c.tier || D.REGION_TIER[c.reg]) : PS.clamp(Math.floor((c.reg || 0) + (c.kind === 2 ? 0.5 : 0)), 0, 4), types = D.PERS[G.save.pers].weapons;
      G.addWeapon(D.TIER_WEAPON[tier][types[Math.floor(Math.random() * types.length)]]);
    }
    if (c.kind >= 1) G.addItem('ore', 1);
  };
  G.unlockWP = function (w) { G.save.waypoints.push(w.id); PS.Audio.sfxPlay('waypoint'); PS.UI.banner('ワープポイント解放', w.name, '#7fe8ff'); G.pillarFX(w.x, w.y, w.z, 1.2, 30, [0.5, 0.9, 1], 2.0); G.emit(40, { x: w.x, y: w.y + 1.5, z: w.z, color: '#9fe6ff', vs: 4, vy: 3, size: 0.35, life: 1.5, kind: 1 }); G.questEvent('waypoint'); G.writeSave(true); };
  G.pray = function (v) { const p = G.player; p.hp = G.pstat.hp; p.status.burn = p.status.poison = 0; for (const c of G.party) { if (c.down) c.revive(1); c.hp = c.maxHp; } PS.Audio.sfxPlay('heal'); PS.UI.notify('星の像の加護で、HPが全回復した', 'buff'); G.pillarFX(p.pos.x, p.pos.y, p.pos.z, 1.2, 6, [1, 0.95, 0.6], 1.2); if (!G.save.waypoints.includes('w_v' + v.id)) { const w = W.WAYPOINTS.find(q => q.id === 'w_v' + v.id); if (w) G.unlockWP(w); } };
  G.teleport = function (wid) {
    const w = W.WAYPOINTS.find(q => q.id === wid); if (!w) return;
    if (G.scene === 'dungeon') G.leaveDungeonState();
    G.fade(1.0); PS.Audio.sfxPlay('waypoint');
    setTimeout(() => { const p = G.player; p.pos.x = w.x + 2.5; p.pos.z = w.z + 2.5; p.pos.y = W.height(p.pos.x, p.pos.z); p.vel.x = p.vel.y = p.vel.z = 0; p.mode = 'ground'; G.cam.tx = p.pos.x; G.cam.ty = p.pos.y + 1.5; G.cam.tz = p.pos.z; G.clearWorldEnemies(); G.partyArrive(); }, 250);
  };
  G.clearWorldEnemies = function () { G.enemies = []; G.projs = []; G.hz = []; for (const sp of W.spawns) { sp.active = false; sp.alive = 0; } G.bossActive = null; };

  // ================= スポーン =================
  G.updateSpawns = function () {
    const p = G.player.pos;
    for (const sp of W.spawns) {
      const d = Math.hypot(sp.x - p.x, sp.z - p.z);
      if (!sp.active && d < 115 && G.time >= (sp.respawnAt || 0)) {
        sp.active = true; sp.list = [];
        sp.types.forEach((k, i) => {
          const a = i / sp.types.length * 6.28 + sp.id, r = sp.types.length > 1 ? 3 + (i % 2) * 2.5 : 0;
          const e = new G.Enemy(k, PS.clamp(sp.lv + (i % 3) - 1, 1, 60), sp.x + Math.cos(a) * r, sp.z + Math.sin(a) * r, { spawn: sp });
          G.enemies.push(e); sp.list.push(e);
        });
        sp.alive = sp.list.length;
        if (sp.camp && !sp.chestMade) { sp.chestMade = true; const c = W.camps.find(c => Math.hypot(c.x - sp.x, c.z - sp.z) < 1); if (c) c.chest = true; }
      } else if (sp.active) {
        if (sp.alive <= 0) { sp.active = false; sp.respawnAt = G.time + 300; sp.list = []; }
        else if (d > 165 && !sp.list.some(e => e.aggro && !e.dead)) { sp.active = false; G.enemies = G.enemies.filter(e => e.spawn !== sp); sp.list = []; }
      }
    }
  };

  // ================= ダンジョン =================
  G.ch1Done = () => [0, 1, 2, 3, 4].every(i => G.save.dungeons[i]);
  G.ch2Done = () => [5, 6, 7, 8, 9, 10].every(i => G.save.dungeons[i]);
  G.ch3Done = () => !!(G.save.guardians && G.save.guardians.every(x => x));
  G.compCondOK = function (id) {
    const c = D.COMPANIONS[id].cond || {}, s = G.save;
    if (c.dungeon != null && !s.dungeons[c.dungeon]) return false;
    if (c.level && s.level < c.level) return false;
    return true;
  };
  G.askDungeon = function (d) {
    const s = G.save, honest = D.PERS[s.pers].honest;
    const lim = honest ? '<br><small style="color:#ffb08a">正直者の誓い：制限時間 ' + Math.round(G.dungeonLimit(d) / 60) + '分</small>' : '';
    const info = d.ch2 ? '<br><small>星界の遺跡（長編・高難易度）。遺跡の中だけで使える力を見つけよう。</small>' : '';
    PS.UI.confirm('「' + d.name + '」に入りますか？<br><small>推奨レベル：' + d.lv + (s.dungeons[d.id] ? '　（攻略済み）' : '') + '</small>' + info + lim, () => G.enterDungeon(d.id));
  };
  G.dungeonLimit = (d) => D.HONEST.dungeonBase + D.HONEST.roomTime * (d.ch2 ? d.size[0] * d.size[1] : Math.round((d.size[0] + d.size[1]) * 1.6));
  G.enterDungeon = function (id) {
    const def = W.DUNGEONS[id];
    G.fade(1.4); PS.Audio.sfxPlay('waypoint');
    setTimeout(() => {
      const p = G.player;
      G.dunReturn = [def.x + Math.sin(def.ry) * 9, def.y, def.z + Math.cos(def.ry) * 9];
      if (def.cave) G.dunReturn[1] = W.height(G.dunReturn[0], G.dunReturn[2]);
      G.dun = PS.Dungeon.build(def, SEED + id * 97);
      G.scene = 'dungeon'; G.clearWorldEnemies(); G.fx = []; G.parts = [];
      p.pos.x = G.dun.start.x; p.pos.z = G.dun.start.z; p.pos.y = 0; p.mode = 'ground'; p.vel.x = p.vel.y = p.vel.z = 0; p.yaw = Math.PI; G.cam.yaw = Math.PI;
      p.lastSafe = { x: p.pos.x, y: 0, z: p.pos.z };
      G.cam.tx = p.pos.x; G.cam.ty = 1.5; G.cam.tz = p.pos.z;
      for (const rm of G.dun.rooms) { rm.cleared = rm.start || rm.kind === 'rest'; rm.active = false; rm.chestOpen = rm.kind === 'rest' && rm.chest ? false : undefined; }
      G.dun.checkpoint = null; G.dun.abil = {};
      G.dunDeadline = D.PERS[G.save.pers].honest ? G.save.play + G.dungeonLimit(def) : 0;
      PS.Audio.play(def.ch2 ? 'ruins' : 'dungeon'); PS.UI.regionTitle(def.name, '推奨レベル ' + def.lv + (def.ch4 ? '　世界の果ての試練' : def.ch2 ? '　星界の遺跡' : ''));
      if (G.dunDeadline) PS.UI.notify('正直者の誓い：制限時間は' + Math.round(G.dungeonLimit(def) / 60) + '分。時間内に攻略しよう！', 'warn');
      G.partyArrive(); G.supportSay('dungeon');
      PS.UI.refreshAll();
    }, 500);
  };
  G.leaveDungeonState = function () {
    G.scene = 'world'; G.dun = null; G.enemies = []; G.projs = []; G.hz = []; G.bossActive = null; G.barriers = []; PS.UI.bossBar(null); G.dunDeadline = 0;
  };
  G.exitDungeon = function () {
    G.fade(1.2);
    setTimeout(() => { const p = G.player, r = G.dunReturn; G.leaveDungeonState(); p.pos.x = r[0]; p.pos.z = r[2]; p.pos.y = W.height(r[0], r[2]); p.mode = 'ground'; G.cam.tx = p.pos.x; G.cam.ty = p.pos.y + 1.5; G.cam.tz = p.pos.z; G.lastRegion = -1; G.partyArrive(); G.writeSave(true); }, 450);
  };
  // 遺跡の祭壇：遺跡の中だけで使える力
  G.takeAbility = function (it) {
    const d = G.dun; d.abil[it.abil] = true; d.checkpoint = it.room; PS.Audio.sfxPlay('chest');
    G.pillarFX(it.x, 0, it.z, 1.4, 12, it.abil === 'wing' ? [0.6, 0.95, 1] : [1, 0.85, 0.4], 1.5); G.emit(50, { x: it.x, y: 2, z: it.z, color: it.abil === 'wing' ? '#bff6ff' : '#ffd27a', vs: 5, vy: 3, size: 0.35, life: 1.2, kind: 1 });
    if (it.abil === 'wing') { PS.UI.banner('風切りの羽を手に入れた！', 'この遺跡の中だけ、空中でもう一度ジャンプすると飛べる', '#9fe6ff'); setTimeout(() => PS.UI.notify('飛行中に攻撃すると、真下へ急降下攻撃！ 高いほど強力', 'buff'), 2600); }
    else { PS.UI.banner('跳躍の靴を手に入れた！', 'この遺跡の中だけ、とても高くジャンプできる', '#ffd27a'); setTimeout(() => PS.UI.notify('高い足場に跳び乗り、上から落下攻撃をしよう！', 'buff'), 2600); }
    G.player.fly.t = G.flightMax();
  };
  G.restSpring = function (it) {
    const p = G.player; p.hp = G.pstat.hp; p.status.burn = p.status.poison = 0; for (const c of G.party) { if (c.down) c.revive(1); c.hp = c.maxHp; }
    G.dun.checkpoint = it.room; PS.Audio.sfxPlay('heal'); G.pillarFX(p.pos.x, p.pos.y, p.pos.z, 1.2, 6, [0.6, 1, 0.9], 1.2);
    PS.UI.notify('星の泉で体を休めた。ここから再開できます', 'buff');
  };
  G.barriers = [];
  G.dunSpawn = function (key, lv, x, z, o) { const e = new G.Enemy(key, PS.clamp(lv, 1, 130), x, z, Object.assign({ aggro: true, state: 'chase' }, o)); G.enemies.push(e); return e; };
  G.updateDungeon = function (dt) {
    const d = G.dun, p = G.player.pos;
    for (const rm of d.rooms) {
      const inside = Math.abs(p.x - rm.x) < rm.w / 2 - 2 && Math.abs(p.z - rm.z) < rm.d / 2 - 2 && (rm.y == null || Math.abs(p.y - rm.y) < 6);
      if (!rm.cleared && !rm.active && inside) {
        rm.active = true; rm.list = [];
        const mobs = D.DUNGEON_MOBS[d.def.theme], lv = d.def.lv;
        if (G.customRoom && G.customRoom(d, rm)) { /* 第四章のギミック部屋・天への階段 */ }
        else if (rm.boss) {
          const b = G.dunSpawn(d.def.boss, lv + 2, rm.x, rm.z - 6); rm.list.push(b); G.bossActive = b;
          PS.UI.banner(D.ENEMIES[d.def.boss].name, d.def.ch2 ? '星界の遺跡の主' : '迷宮の主', '#ff6a6a'); PS.Audio.play('boss'); PS.Audio.sfxPlay('boss'); G.shake(0.5); G.supportSay('boss', true);
        } else if (rm.kind === 'pit') {
          // 谷の底の敵：風切りの羽で降りて倒す
          const P = rm.pit, n = 4 + Math.floor(rm.depth / 6) + (Math.random() < 0.5 ? 1 : 0);
          for (let i = 0; i < n; i++) { const e = G.dunSpawn(mobs[Math.floor(Math.random() * mobs.length)], lv - 2 + Math.floor(Math.random() * 3), PS.lerp(P.x0 + 3, P.x1 - 3, Math.random()), PS.lerp(P.z0 + 3, P.z1 - 3, Math.random())); rm.list.push(e); G.ring(e.x, e.y + 0.1, e.z, 2, [0.8, 0.5, 1], 0.6); }
          PS.UI.notify(d.abil.wing ? '谷の底に敵がいる！ 羽で飛んで、上から急降下攻撃！' : '谷の底に敵がいる！ 飛び降りると大ダメージを受けそうだ…', 'warn');
        } else if (rm.kind === 'ledge') {
          // 高台の上に遠距離の敵、床にも敵
          const ranged = D.DUNGEON_RANGED[d.def.theme] || mobs;
          for (const q of rm.plats) { const e = G.dunSpawn(ranged[Math.floor(Math.random() * ranged.length)], lv - 1 + Math.floor(Math.random() * 2), q.x, q.z, { y0: q.top, anchor: true, home: { x: q.x, z: q.z } }); rm.list.push(e); G.ring(e.x, e.y + 0.1, e.z, 2, [1, 0.8, 0.4], 0.6); }
          for (let i = 0; i < 2 + Math.floor(rm.depth / 8); i++) { const a = i * 2.4 + 0.5, e = G.dunSpawn(mobs[Math.floor(Math.random() * mobs.length)], lv - 2 + Math.floor(Math.random() * 3), rm.x + Math.cos(a) * 4, rm.z + Math.sin(a) * 4); rm.list.push(e); }
          PS.UI.notify(d.abil.jump ? '高台に敵がいる！ 跳躍の靴で跳び乗ろう！' : '高台に敵がいる！', 'warn');
        } else {
          const n = Math.min(d.def.ch2 ? 7 : 6, 2 + Math.floor(rm.depth / (d.def.ch2 ? 4 : 2)) + (Math.random() < 0.4 ? 1 : 0) + (d.def.ch2 ? 1 : 0));
          for (let i = 0; i < n; i++) { const a = i / n * 6.28, e = G.dunSpawn(mobs[Math.floor(Math.random() * mobs.length)], lv - 2 + Math.floor(Math.random() * 3), rm.x + Math.cos(a) * 6, rm.z + Math.sin(a) * 6); rm.list.push(e); G.ring(e.x, 0.1, e.z, 2, [0.8, 0.5, 1], 0.6); }
          if (rm.kind === 'altar') PS.UI.notify('祭壇を守る魔物たちだ！', 'warn');
        }
        if (!rm.boss && !(d.def.ch4 || d.def.sky)) PS.Audio.play('battle');
        for (const dr of rm.doors) { const c = PS.World.addBox(dr.x, dr.z, dr.ax === 'x' ? 0.8 : d.CW / 2 + 0.5, dr.ax === 'x' ? d.CW / 2 + 0.5 : 0.8, 0, 1e9, d.grid); G.barriers.push({ c, x: dr.x, z: dr.z, ax: dr.ax, rm }); }
        if (rm.doors.length) PS.UI.notify('封印が発動した！ すべての敵を倒そう', 'warn');
      }
      if (rm.active && rm.list.every(e => e.dead)) {
        rm.active = false; rm.cleared = true;
        G.barriers = G.barriers.filter(b => { if (b.rm === rm) { b.c.top = -1e9; return false; } return true; });
        if (rm.boss) G.bossDefeated(d);
        else {
          PS.UI.notify(rm.kind === 'pit' ? '封印が解かれた。谷の中央の上昇気流で上へ戻れる' : d.sky ? '番兵たちを退けた！ 階段の先へ進もう' : '封印が解かれた', 'buff'); PS.Audio.play(G.dunBGM ? G.dunBGM() : (d.def.ch2 ? 'ruins' : 'dungeon'));
          if (rm.chest) { rm.chestOpen = false; PS.Audio.sfxPlay('chest', 0.5); }
          if (rm.kind === 'altar') { PS.UI.notify('祭壇が輝いている……', 'quest'); d.checkpoint = rm; }
        }
      }
      // 谷の上昇気流
      if (rm.pit && rm.cleared && inside) {
        const P = rm.pit, pl = G.player;
        if (p.x > P.x0 && p.x < P.x1 && p.z > P.z0 && p.z < P.z1 && p.y < -1 && Math.hypot(p.x - rm.updraft.x, p.z - rm.updraft.z) < rm.updraft.r && pl.mode !== 'fly') { pl.vel.y = 21; pl.mode = 'air'; pl.plunge = false; if (!G._udT || G.time - G._udT > 0.6) { G._udT = G.time; PS.Audio.sfxPlay('wind', 0.6); } }
      }
    }
    // 正直者の制限時間
    if (G.dunDeadline && G.save.play > G.dunDeadline && G.state === 'play') { G.dunDeadline = 0; PS.UI.banner('TIME UP', '制限時間を過ぎてしまった…', '#ff8a6a'); PS.Audio.sfxPlay('deny'); setTimeout(() => G.exitDungeon(), 1600); }
  };
  G.bossDefeated = function (d) {
    const id = d.def.id, s = G.save, first = !s.dungeons[id];
    PS.Audio.play(d.def.ch2 ? 'ruins' : 'dungeon'); G.bossActive = null; PS.UI.bossBar(null);
    PS.UI.banner(d.def.ch2 ? '遺跡攻略' : '迷宮攻略', d.def.name, '#ffd36a');
    const rm = d.boss; rm.chestOpen = false; d.portalOut = true; G.dunDeadline = 0;
    if (first) {
      s.dungeons[id] = true; G.addItem(d.def.ch2 ? 'starstone' : 'shard', 1);
      const types = D.PERS[s.pers].weapons; G.addWeapon(D.TIER_WEAPON[D.DUNGEON_TIER[id]][types[0]]);
      G.addCoins(Math.round((d.def.ch2 ? 40000 * (id - 3) : 3000 * (id + 1)) * G.rewardMul())); G.questEvent('dungeon', id);
      if (!d.def.ch2 && G.ch1Done() && !s.final) setTimeout(() => PS.UI.banner('星の欠片が共鳴している…', '星見山の頂への道が開かれた', '#fff0a0'), 4000);
      if (d.def.ch2 && G.ch2Done()) setTimeout(() => PS.UI.banner('六つの天星石が輝いている…', '天穹山の頂へ光の道が開かれた', '#bfe8ff'), 4000);
    }
    G.writeSave(true);
  };
  // 隠された遺跡の発見
  G.updateDiscovery = function () {
    const s = G.save, p = G.player.pos;
    for (const d of W.DUNGEONS) if (d.hidden && !s.found[d.id] && Math.hypot(d.x - p.x, d.z - p.z) < 55 && Math.abs(d.y - p.y) < 30) {
      s.found[d.id] = true; PS.UI.banner('隠された遺跡を発見した！', d.name, '#ffd27a'); PS.Audio.sfxPlay('chest'); G.pillarFX(d.x, d.y, d.z, 2, 30, [1, 0.9, 0.5], 2.5); PS.UI.refreshQuest(); G.writeSave(true);
    }
  };
  // 最終決戦（第一章：星見山／第二章：天穹山）
  G.updateFinal = function () {
    const s = G.save, p = G.player.pos;
    const arena = (S, open, opened, msg, start) => {
      const d = Math.hypot(p.x - S.x, p.z - S.z);
      if (d < 46 && p.y > S.y - 20) {
        if (!open) { if (d < 42) { const k = 42 / Math.max(0.01, d); p.x = S.x + (p.x - S.x) * k; p.z = S.z + (p.z - S.z) * k; if (!G._finalMsg || G.time - G._finalMsg > 4) { G._finalMsg = G.time; PS.UI.notify(msg, 'warn'); } } }
        else if (!opened && !G.bossActive && d < 34) start();
      }
    };
    if (!s.final) arena(W.SUMMIT, G.ch1Done(), s.final, '不思議な力に阻まれた…（星の欠片 ' + [0, 1, 2, 3, 4].filter(i => s.dungeons[i]).length + '/5）', () => {
      const b = new G.Enemy('nemesis', W.SUMMIT.lv, W.SUMMIT.x, W.SUMMIT.z - 8, { aggro: true, state: 'chase', onDeath: () => G.finalWin() });
      G.enemies.push(b); G.bossActive = b; PS.UI.banner(D.ENEMIES.nemesis.name, '全ての元凶', '#c06aff'); PS.Audio.play('boss'); PS.Audio.sfxPlay('boss'); G.shake(0.8); G.supportSay('boss', true);
    });
    if (W.expanded && s.chapter >= 2 && !s.final2) arena(W.SUMMIT2, G.ch2Done(), s.final2, '光の壁に阻まれた…（天星石 ' + [5, 6, 7, 8, 9, 10].filter(i => s.dungeons[i]).length + '/6）', () => {
      const S = W.SUMMIT2, b = new G.Enemy('astral', S.lv, S.x, S.z - 10, { aggro: true, state: 'chase', onDeath: () => G.finalWin2() });
      G.enemies.push(b); G.bossActive = b; PS.UI.banner(D.ENEMIES.astral.name, '星を喰らう竜', '#bfe8ff'); PS.Audio.play('boss'); PS.Audio.sfxPlay('boss'); G.shake(0.9); G.supportSay('boss', true);
    });
  };
  G.finalWin = function () {
    const s = G.save; s.final = true; G.questEvent('boss', 'nemesis'); G.bossActive = null; PS.UI.bossBar(null); G.writeSave(true);
    setTimeout(() => PS.Story.ending(), 2500);
  };
  G.finalWin2 = function () {
    const s = G.save; s.final2 = true; G.questEvent('boss', 'astral'); G.bossActive = null; PS.UI.bossBar(null); G.writeSave(true);
    setTimeout(() => PS.Story.ending2(), 2500);
  };
  // 第一章クリア → 島を広げて再起動
  G.toChapter2 = function () {
    const s = G.save; s.chapter = 2; s.ch2intro = false;
    const v = W.VILLAGES[0]; s.pos = [v.x + 6, v.y, v.z + 18]; s.yaw = Math.PI;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { }
    G.state = 'ending'; G.reloadWith('ch2');
  };

  // ================= 死亡 =================
  G.playerDie = function () {
    const p = G.player; p.dead = true; G.state = 'dead'; PS.Audio.sfxPlay('die'); PS.UI.death();
  };
  G.revive = function () {
    const p = G.player; p.dead = false; p.hp = G.pstat.hp; p.status = { freeze: 0, burn: 0, slow: 0, poison: 0 }; p.awk.on = false; G.recalc(); p.hp = G.pstat.hp;
    if (G.scene === 'dungeon') {
      const d = G.dun; G.enemies = []; G.projs = []; G.hz = []; G.bossActive = null; PS.UI.bossBar(null);
      G.barriers.forEach(b => b.c.top = -1e9); G.barriers = [];
      for (const rm of d.rooms) if (rm.active) rm.active = false;
      const cp = d.checkpoint; p.pos.x = cp ? cp.x : d.start.x; p.pos.z = cp ? cp.z + 5 : d.start.z; p.pos.y = cp && cp.y != null ? cp.y : (d.start.y || 0);
    } else {
      let best = null, bd = 1e9; for (const w of W.WAYPOINTS) { if (!G.save.waypoints.includes(w.id) && w.id !== 'w_start') continue; const dd = Math.hypot(w.x - p.pos.x, w.z - p.pos.z); if (dd < bd) { bd = dd; best = w; } }
      p.pos.x = best.x + 2; p.pos.z = best.z + 2; p.pos.y = W.height(p.pos.x, p.pos.z); G.clearWorldEnemies();
    }
    p.mode = 'ground'; p.vel.x = p.vel.y = p.vel.z = 0; G.cam.tx = p.pos.x; G.cam.ty = p.pos.y + 1.5; G.cam.tz = p.pos.z;
    for (const c of G.party) { c.down = false; c.hp = c.maxHp; } G.partyArrive();
    G.state = 'play'; G.fade(1.0); if (G.scene === 'dungeon') PS.Audio.play(G.dunBGM ? G.dunBGM() : (G.dun.def.ch2 ? 'ruins' : 'dungeon')); else G.pickBGM();
  };

  // ================= 演出 =================
  G.shake = (a) => { if (PS.Settings.shake) G.cam.shake = Math.max(G.cam.shake, a); };
  G.fade = (t) => { G.fadeT = t; G.fadeMax = t; };
  G.wantsLock = () => G.state === 'play' && !G.uiOpen && !PS.Input.altFree;
  G.onUnlock = () => { if (G.state === 'play' && !G.uiOpen && !PS.Input.altFree && !PS.isMobile) PS.UI.openMenu('pause'); };
  window.addEventListener('beforeunload', () => { if (G.state === 'play') G.writeSave(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'play') G.writeSave(true); });

  // ================= 環境 (昼夜・地域) =================
  const KEYS = [
    [0, '#0a1028', '#1b2546', '#8aa0d8', 0.32, '#1e2a4e', '#10141e'], [4.6, '#0a1028', '#1b2546', '#8aa0d8', 0.3, '#1e2a4e', '#10141e'],
    [5.7, '#2a3a70', '#d8889a', '#ffb080', 0.5, '#4a5078', '#2a2a3a'], [7.0, '#4f8fd8', '#f6d0a8', '#ffd8a8', 0.85, '#718bb6', '#544f4a'],
    [10, '#3a86e6', '#bfe2f8', '#fff4e2', 0.92, '#7f9ac6', '#5e5c52'], [14.5, '#3a86e6', '#bfe2f8', '#fff4e2', 0.92, '#7f9ac6', '#5e5c52'],
    [16.8, '#4a8adb', '#f2dcb6', '#ffe0b4', 0.9, '#7a8ab2', '#62584e'], [18.2, '#4a5aa0', '#ff9a6a', '#ff9a5a', 0.75, '#6a6290', '#4a3a3a'],
    [19.4, '#1a2050', '#4a3a6a', '#8aa0d8', 0.3, '#2a3058', '#141824'], [24, '#0a1028', '#1b2546', '#8aa0d8', 0.32, '#1e2a4e', '#10141e']
  ].map(k => [k[0], PS.hexRGB(k[1]), PS.hexRGB(k[2]), PS.hexRGB(k[3]), k[4], PS.hexRGB(k[5]), PS.hexRGB(k[6])]);
  const RT = [null, { hor: PS.hexRGB('#d8f0c8'), amb: PS.hexRGB('#a8d8a0'), fog: 1.15, k: 0.25 }, { hor: PS.hexRGB('#f6dcae'), top: PS.hexRGB('#5aa0e8'), fog: 1.25, k: 0.45 }, { hor: PS.hexRGB('#e8f2fc'), amb: PS.hexRGB('#c8d8f0'), fog: 1.2, k: 0.4 }, { hor: PS.hexRGB('#c88a6a'), top: PS.hexRGB('#6a5a6a'), fog: 1.7, k: 0.6, light: PS.hexRGB('#ffc890') }];
  G.computeEnv = function (tod, rw) {
    let a = KEYS[0], b = KEYS[1];
    for (let i = 0; i < KEYS.length - 1; i++) if (tod >= KEYS[i][0] && tod < KEYS[i + 1][0]) { a = KEYS[i]; b = KEYS[i + 1]; break; }
    const f = PS.smooth(0, 1, (tod - a[0]) / (b[0] - a[0]));
    let top = PS.mixC(a[1], b[1], f), hor = PS.mixC(a[2], b[2], f), lc = PS.mixC(a[3], b[3], f), li = PS.lerp(a[4], b[4], f), at = PS.mixC(a[5], b[5], f), ab = PS.mixC(a[6], b[6], f);
    const th = (tod - 6) / 12 * Math.PI, sun = [Math.cos(th) * 0.85, Math.sin(th), 0.45]; const sl = Math.hypot(...sun); sun[0] /= sl; sun[1] /= sl; sun[2] /= sl;
    const moon = [-sun[0], -sun[1], -sun[2]];
    const night = 1 - PS.smooth(-0.12, 0.1, sun[1]);
    let ld = sun[1] > 0 ? sun.slice() : moon.slice(); if (ld[1] < 0.2) { ld[1] = 0.2; const l = Math.hypot(...ld); ld = ld.map(v => v / l); }
    const lscale = PS.smooth(0.0, 0.14, Math.abs(sun[1]));
    let fogMul = 1;
    if (rw) for (let k = 1; k < 5; k++) {
      const w = rw[k] * RT[k].k; if (w < 0.01) continue;
      if (RT[k].hor) hor = PS.mixC(hor, PS.mixC(RT[k].hor, hor, night * 0.8), w);
      if (RT[k].top) top = PS.mixC(top, PS.mixC(RT[k].top, top, night * 0.8), w * 0.7);
      if (RT[k].amb) at = PS.mixC(at, PS.mixC(RT[k].amb, at, night), w * 0.5);
      if (RT[k].light) lc = PS.mixC(lc, RT[k].light, w * 0.6);
      fogMul = PS.lerp(fogMul, RT[k].fog, w / RT[k].k);
    }
    const maxD = PS.Settings.renderDist * 96;
    return {
      sunDir: sun, moonDir: moon, lightDir: ld, lightCol: lc.map(v => v * li * lscale), sunCol: PS.mixC([1, 0.75, 0.45], [1, 0.95, 0.85], PS.smooth(0.05, 0.5, sun[1])),
      ambTop: at.map(v => v * 0.95), ambBot: ab, skyTop: top, skyHor: hor, night, fogDen: 1.7 / maxD * fogMul, fogStart: 60, indoor: false, exposure: 0.96, sat: 1.15, far: maxD + 250
    };
  };
  G.dungeonEnv = function () {
    const th = G.dun.theme;
    return { sunDir: [0.3, 0.9, 0.3], moonDir: [0, -1, 0], lightDir: [0.25, 0.92, 0.3], lightCol: th.light.map(v => v * 0.35), sunCol: [0, 0, 0], ambTop: th.amb, ambBot: th.amb.map(v => v * 0.5), skyTop: PS.hexRGB(th.fog[0]), skyHor: PS.hexRGB(th.fog[1]), night: 0, fogDen: 0.016, fogStart: 15, indoor: true, exposure: 1.1, sat: 1.1, far: 400 };
  };

  // ================= カメラ =================
  G.updateCamera = function (dt, I) {
    const c = G.cam, p = G.player, S = PS.Settings;
    if (G.state === 'play' && !G.uiOpen) {
      const k = 0.0028 * S.sens;
      c.yaw -= I.lookX * k; c.pitch = PS.clamp(c.pitch + I.lookY * k * (S.invertY ? -1 : 1), -0.75, 1.25);
      if (I.wheel) c.tdist = PS.clamp(c.tdist + I.wheel * 0.8, 2.2, 12);
    }
    const tgt = [p.pos.x, p.pos.y + (p.mode === 'swim' ? 0.4 : 1.45), p.pos.z];
    c.tx = PS.damp(c.tx, tgt[0], 14, dt); c.ty = PS.damp(c.ty, tgt[1], 9, dt); c.tz = PS.damp(c.tz, tgt[2], 14, dt);
    const fx = Math.sin(c.yaw) * Math.cos(c.pitch), fy = -Math.sin(c.pitch), fz = Math.cos(c.yaw) * Math.cos(c.pitch);
    let dist = c.tdist * (G.bossActive ? 1.25 : 1);
    for (let s = 0.4; s <= dist; s += 0.35) {
      const x = c.tx - fx * s, y = c.ty - fy * s, z = c.tz - fz * s;
      if (y < G.groundAt(x, z, y) + 0.35 || (G.scene === 'dungeon' && G.collide({ x, z }, 0.25, y))) { dist = Math.max(0.6, s - 0.35); break; }
    }
    c.dist = dist < c.dist ? dist : PS.damp(c.dist, dist, 4, dt);
    let ex = c.tx - fx * c.dist, ey = c.ty - fy * c.dist, ez = c.tz - fz * c.dist;
    if (c.shake > 0) { const s = c.shake * 0.35; ex += (Math.random() - 0.5) * s; ey += (Math.random() - 0.5) * s; ez += (Math.random() - 0.5) * s; c.shake = Math.max(0, c.shake - dt * 2.2); }
    c.ex = ex; c.ey = ey; c.ez = ez;
  };

  // ================= ループ =================
  G.loop = function (now) {
    requestAnimationFrame(G.loop);
    const S = PS.Settings;
    if (S.maxFps && now - G.last < 1000 / S.maxFps - 1.5) return;
    const rdt = Math.max(0.001, (now - G.last) / 1000); let dt = Math.min(0.05, rdt); G.last = now;
    G.fps = G.fps ? G.fps * 0.92 + (1 / rdt) * 0.08 : 60;
    const I = PS.Input; I.pollPad();
    if (G.state === 'loading') { G.stepLoading(); PS.Story.loadingFrame(dt); I.endFrame(); return; }
    if (G.state === 'logo' || G.state === 'boot') { I.endFrame(); return; }
    if (!G.ready) { I.endFrame(); return; }
    G.time += dt;
    if (G.state === 'title' || G.state === 'story' || G.state === 'select' || G.state === 'ending') { G.renderCinematic(dt); PS.Story.frame && PS.Story.frame(dt); I.endFrame(); return; }
    // ---- プレイ ----
    let gdt = dt;
    if (G.hitstop > 0) { G.hitstop -= dt; gdt = dt * 0.08; }
    if (G.uiOpen && G.uiOpen !== 'dialog') gdt = 0;
    if (G.state === 'play' || G.state === 'dead') {
      if (gdt > 0) G.update(gdt, I);
      G.updateCamera(dt, I);
      if (G.state === 'play' && !G.uiOpen) G.handleUIKeys(I);
      else if (G.uiOpen && I.was('menu')) PS.UI.closeTop();
    }
    G.render();
    PS.UI.frame(dt);
    I.endFrame();
  };
  G.handleUIKeys = function (I) {
    const U = PS.UI;
    if (I.was('menu')) U.openMenu('pause');
    else if (I.was('map')) U.openMap();
    else if (I.was('bag')) U.openMenu('bag');
    else if (I.was('char')) U.openMenu('char');
    else if (I.was('quest')) U.openMenu('quest');
    else if (I.was('food')) G.quickFood();
    else if (I.was('party')) U.openMenu('party');
    else if (I.was('interact')) { const it = G.interactables(); if (it.length) it[0].f(); }
  };
  G.update = function (dt, I) {
    const p = G.player;
    if (G.state === 'play') {
      G.tod = (G.tod + dt / 50) % 24; G.save.play += dt;
    }
    G.recalc();
    p.update(dt);
    G.updateParty(dt);
    // 地域（新エリアは基本地域の空気感をまとう）
    if (G.scene === 'world') {
      const r = W.region(p.pos.x, p.pos.z), i = PS.clamp(Math.round((p.pos.x + W.HALF) / W.CELL), 0, W.VN - 1), j = PS.clamp(Math.round((p.pos.z + W.HALF) / W.CELL), 0, W.VN - 1), o = (j * W.VN + i) * W.NRW;
      const rw = G._rw || (G._rw = [0, 0, 0, 0, 0]); rw.fill(0);
      for (let k = 0; k < Math.min(W.ALL_REG, W.NRW); k++) rw[W.REG[k].base] += W.RW[o + k];
      for (let k = 0; k < 5; k++) G.regionW[k] = PS.lerp(G.regionW[k], Math.min(255, rw[k]) / 255, 0.02);
      G.curRegion = r; G.baseRegion = W.baseReg(r);
      if (r !== G.lastRegion && W.height(p.pos.x, p.pos.z) > 0) {
        G.lastRegion = r; const reg = W.REG[r];
        if (!G.save.visited.includes(r)) { G.save.visited.push(r); PS.UI.regionTitle(reg.name, (reg.en ? reg.en + '　' : '') + '推奨レベル ' + reg.lv[0] + '〜' + reg.lv[1]); if (G.time > 5) G.supportSay('region'); }
        else PS.UI.regionTitle(reg.name, reg.en);
        if (!G.bossActive) G.pickBGM();
      }
      G.updateSpawns(); G.updateFinal(); if (W.expanded) G.updateDiscovery(); if (W.ch3) G.updateShrines(dt);
      for (const n of G.npcs) if (Math.hypot(n.x - p.pos.x, n.z - p.pos.z) < 90) n.update(dt);
    } else G.updateDungeon(dt);
    // 正直者：ミッションの制限時間
    if (D.PERS[G.save.pers].honest && G.state === 'play') for (const id in G.save.quests) {
      const st = G.save.quests[id]; if (st.st !== 'active' || !st.deadline || G.save.play <= st.deadline) continue;
      if (G.questComplete(id) || (D.QUESTS[id].obj[0].type === 'collect' && (G.save.inv[D.QUESTS[id].obj[0].what] || 0) >= D.QUESTS[id].obj[0].n)) { st.deadline = 0; continue; }
      delete G.save.quests[id]; if (G.save.tracked === id) G.save.tracked = Object.keys(G.save.quests).find(k => G.save.quests[k].st === 'active') || null;
      PS.UI.banner('MISSION FAILED', '「' + D.QUESTS[id].title + '」の制限時間が過ぎた', '#ff8a6a'); PS.Audio.sfxPlay('deny'); PS.UI.notify('依頼主にもう一度話しかけると、再挑戦できます', 'info'); PS.UI.refreshQuest();
    }
    // 戦闘BGM
    const fighting = G.enemies.some(e => e.aggro && !e.dead && Math.hypot(e.x - p.pos.x, e.z - p.pos.z) < 30);
    if (!G.bossActive && G.scene === 'world') { if (fighting && PS.Audio.curName !== 'battle') { G.battleT = 6; PS.Audio.play('battle'); } else if (fighting) G.battleT = 6; else if (PS.Audio.curName === 'battle' && (G.battleT -= dt) < 0) G.pickBGM(); }
    let j = 0; for (const e of G.enemies) if (e.update(dt)) G.enemies[j++] = e; G.enemies.length = j;
    // 敵同士の押し合い
    const E = G.enemies; for (let a = 0; a < E.length; a++) for (let b = a + 1; b < E.length; b++) { const A = E[a], B = E[b]; if (A.dead || B.dead) continue; const dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz), m = A.radius * A.scale + B.radius * B.scale; if (d < m && d > 0.001) { const k = (m - d) / d * 0.5; A.x -= dx * k; A.z -= dz * k; B.x += dx * k; B.z += dz * k; } }
    G.updateProjs(dt); G.updateHazards(dt); G.updateFX(dt); G.updateParts(dt); G.ambient(dt);
    if (G.fadeT > 0) G.fadeT -= dt;
    G.autosave += dt; if (G.autosave > 45 && G.state === 'play') { G.autosave = 0; G.writeSave(true); }
    for (const g of W.gathers) if (g.taken && G.time > g.taken) g.taken = 0;
  };
  G.pickBGM = function () { if (G.scene === 'dungeon') return PS.Audio.play(G.dunBGM ? G.dunBGM() : (G.dun && G.dun.def.ch2 ? 'ruins' : 'dungeon')); PS.Audio.play(G.env && G.env.night > 0.6 && (G.curRegion <= 1 || G.curRegion === 5) ? 'night' : W.REG[G.curRegion].bgm); };
  G.groundAt = (x, z, y) => G.scene === 'dungeon' ? (G.dun ? G.dun.ground(x, z, y) : 0) : W.height(x, z);
  G.waterAt = (x, z) => G.scene === 'dungeon' ? 0 : -W.height(x, z);
  G.collide = (p, r, y) => W.collide(p, r, y, G.scene === 'dungeon' ? G.dun.grid : undefined);

  // ================= 描画 =================
  const LODD = [120, 280, 620];
  const tmpM = M4.create();
  G.drawWorld = function (pass) {
    const S = PS.Settings, ex = R.eye[0], ez = R.eye[2], maxD = S.renderDist * 96 + 60, sc = Math.max(0.7, S.renderDist / 11);
    // 地形
    let built = 0;
    for (const ch of W.chunks) {
      if (ch.mx < -14) continue;
      const d = Math.hypot(ch.x - ex, ch.z - ez) - ch.r * 0.7;
      if (pass === 'shadow') { if (!R.visible(ch.x, ch.y, ch.z, ch.r)) continue; } else { if (d > maxD || !R.visible(ch.x, ch.y, ch.z, ch.r)) continue; }
      let l = d < LODD[0] * sc ? 0 : d < LODD[1] * sc ? 1 : d < LODD[2] * sc ? 2 : 3;
      if (pass === 'shadow') l = Math.max(l, 1);
      if (!ch.lod[l]) { if (built < 3) { W.buildChunk(ch, l); built++; } else while (!ch.lod[l] && l < 3) l++; }
      R.drawTerrain(ch.lod[l]);
    }
    if (pass === 'main') { R.drawLava(W.lavaMesh, W.lavaLevel, [W.VOLC[0], 0, W.VOLC[1]], W.heightTex); if (W.expanded) R.drawLava(W.lavaMesh, W.lavaLevel2, [W.VOLC2[0], 0, W.VOLC2[1]], W.heightTex); if (W.ch3) R.drawLava(W.lavaMesh, W.lavaLevel3, [W.VOLC3[0], 0, W.VOLC3[1]], W.heightTex); }
    // 植生
    for (const name in W.PROPS) {
      const P = W.PROPS[name], small = W.SMALL.has(name);
      if (pass === 'shadow' && small) continue;
      for (const c of P.cells) {
        const d = Math.hypot(c.cx - ex, c.cz - ez) - 180;
        if (!R.visible(c.cx, 60, c.cz, 230)) continue;
        if (pass !== 'shadow' && d > maxD) continue;
        let frac = S.trees * (d < 100 ? 1 : Math.max(0.15, 1 - (d - 100) / (maxD * 0.9)));
        if (small) { if (d > 160) continue; frac = d < 40 ? 1 : 0.55; }
        if (pass === 'shadow') frac = Math.min(frac, 0.6);
        R.drawInstanced(c.mesh, Math.ceil(c.count * frac), 0);
      }
    }
    const night = G.env.night;
    for (const v of W.villageMeshes) if (R.visible(v.cx, 20, v.cz, v.r) && Math.hypot(v.cx - ex, v.cz - ez) < maxD) R.drawMesh(v.mesh, null, null, night);
    for (const wm of W.windmills) { M4.compose(tmpM, wm.x + Math.sin(wm.ry) * 2.3, wm.y, wm.z + Math.cos(wm.ry) * 2.3, 0, wm.ry, G.time * 0.7, 1); R.drawMesh(W.bladeMesh, tmpM); }
    // POI
    const M = W.M;
    for (const v of W.VILLAGES) { if (!R.visible(v.x, v.y, v.z, 8)) continue; M4.compose(tmpM, v.x, v.y, v.z, 0, 0, 0, 1); R.drawMesh(M.statue, tmpM, null, 1); }
    for (const w of W.WAYPOINTS) {
      if (Math.hypot(w.x - ex, w.z - ez) > 500 || !R.visible(w.x, w.y, w.z, 4)) continue;
      M4.compose(tmpM, w.x, w.y, w.z, 0, 0, 0, 1); R.drawMesh(M.wpBase, tmpM);
      const on = G.save && G.save.waypoints.includes(w.id);
      M4.compose(tmpM, w.x, w.y + 2.2 + Math.sin(G.time * 1.5) * 0.15, w.z, 0, G.time * 0.8, 0, 1); R.drawMesh(on ? M.wpOn : M.wpOff, tmpM);
    }
    for (const d of W.DUNGEONS) { if (!R.visible(d.x, d.y + 4, d.z, 10)) continue; M4.compose(tmpM, d.x, d.y - (d.cave ? 0.8 : 0), d.z, 0, d.ry, 0, 1); R.drawMesh(d.cave ? W.caveMesh : W.portalMesh[d.pm != null ? d.pm : d.reg], tmpM, null, d.cave ? 0.6 : 0); }
    if (W.ch3) G.drawShrines(pass);
    if (G.drawGates) G.drawGates(pass);
    for (const c of W.chests) { if (G.save && G.save.chests[c.id]) continue; if (Math.hypot(c.x - ex, c.z - ez) > 140 || !R.visible(c.x, c.y, c.z, 1.5)) continue; M4.compose(tmpM, c.x, c.y - 0.05, c.z, 0, c.ry, 0, 1); R.drawMesh(M['chest' + c.kind], tmpM); }
    for (const cp of W.camps) {
      if (Math.hypot(cp.x - ex, cp.z - ez) > 260 || !R.visible(cp.x, cp.y, cp.z, 12)) continue;
      M4.compose(tmpM, cp.x + 5, W.height(cp.x + 5, cp.z), cp.z, 0, -1.2, 0, 1); R.drawMesh(M.tent, tmpM);
      M4.compose(tmpM, cp.x - 4, W.height(cp.x - 4, cp.z + 3), cp.z + 3, 0, 0.9, 0, 1); R.drawMesh(M.tent, tmpM);
      M4.compose(tmpM, cp.x, cp.y, cp.z, 0, 0, 0, 1); R.drawMesh(M.fire, tmpM);
      M4.compose(tmpM, cp.x + 1, W.height(cp.x + 1, cp.z - 6), cp.z - 6, 0, 0, 0, 1); R.drawMesh(M.totem, tmpM);
      if (cp.chest && !cp.opened) { M4.compose(tmpM, cp.x, W.height(cp.x, cp.z + 2), cp.z + 2, 0, 0, 0, 1); R.drawMesh(M.chest1, tmpM); }
      if (pass === 'main' && Math.random() < 0.5) G.emit(1, { x: cp.x, y: cp.y + 0.5, z: cp.z, color: Math.random() < 0.5 ? '#ffb03a' : '#ff6a1a', vs: 0.6, vy: 2.5, size: 0.5, life: 0.7, spread: 0.4 });
    }
    if (pass !== 'shadow') for (const g of W.gathers) {
      if (g.taken || Math.abs(g.x - ex) > 90 || Math.abs(g.z - ez) > 90 || !R.visible(g.x, g.y, g.z, 1)) continue;
      M4.compose(tmpM, g.x, g.y, g.z, 0, g.ry + G.time * 0.3, 0, 1.4); R.drawMesh(G.gatherMesh[g.kind], tmpM);
    }
    for (const n of G.npcs) if (Math.hypot(n.x - ex, n.z - ez) < 90 && R.visible(n.x, n.y + 1, n.z, 1.5)) R.drawSkinned(n.model.mesh, n.rig.world, n.mat);
  };
  G.drawDungeon = function (pass) {
    const d = G.dun; R.drawMesh(d.mesh, null);
    for (const o of d.deco) { M4.compose(tmpM, o.x, o.y || 0, o.z, 0, 0, 0, 1); R.drawMesh(o.t === 'pillar' ? d.pillar : d.crystal, tmpM); }
    for (const it of d.items || []) {
      if (it.t === 'altar') {
        M4.compose(tmpM, it.x, it.y || 0, it.z, 0, 0, 0, 1); R.drawMesh(W.altarMesh, tmpM);
        if (!d.abil[it.abil]) { M4.compose(tmpM, it.x, 2.6 + Math.sin(G.time * 2) * 0.15, it.z, 0, G.time * 1.2, 0, 1.4); R.drawMesh(G.itemMesh[it.abil], tmpM, null, 1); }
      } else if (it.t === 'spring') { M4.compose(tmpM, it.x, it.y || 0, it.z, 0, 0, 0, 0.55); R.drawMesh(W.M.statue, tmpM, null, 1); }
    }
    if (pass !== 'shadow') for (const t of d.torches) { M4.compose(tmpM, t.x, 2.6, t.z, -0.35, t.ry, 0, 1); R.drawMesh(G.wmTorch || (G.wmTorch = W.M.torch), tmpM); }
    for (const rm of d.rooms) if (rm.chestOpen === false) { M4.compose(tmpM, rm.x, rm.y || 0, rm.z, 0, 0, 0, 1.2); R.drawMesh(W.M[rm.boss ? 'chest2' : 'chest1'], tmpM); }
    M4.compose(tmpM, d.exit.x, d.exit.y || 0, d.exit.z, 0, 0, 0, 0.7); R.drawMesh(W.portalMesh[d.def.pm != null ? d.def.pm : d.def.reg], tmpM);
  };
  G.drawActors = function (pass) {
    const p = G.player, ex = R.eye[0], ez = R.eye[2];
    if (G.state === 'play' || G.state === 'dead') G.drawParty(pass);
    if (p && !(pass === 'main' && G.cam.dist < 0.9)) { const lk = G.playerLook ? G.playerLook() : {}; R.drawSkinned(p.model.mesh, p.rig.world, p.mat, { flash: p.hurt > 0.15 ? [1, 0.3, 0.3, p.hurt * 0.5] : p.status.freeze > 0 ? [0.6, 0.9, 1, 0.45] : null, emis: lk.emis || (p.awk.on ? [2.5, 0.6, 0.8] : null), outlineCol: lk.outlineCol || (p.awk.on ? [0.5, 0.05, 0.1] : null) }); }
    for (const e of G.enemies) {
      if (Math.hypot(e.x - ex, e.z - ez) > 160 || !R.visible(e.x, e.y + e.height / 2, e.z, e.height)) continue;
      R.drawSkinned(e.model.mesh, e.rig.world, e.mat, { flash: e.flash > 0 ? [1, 1, 1, 0.6] : e.st.slow > 0 ? [0.5, 0.8, 1, 0.25] : null, dissolve: e.dead ? Math.min(1, e.deadT / 1.2) : 0, outlineW: 0.012 / Math.max(1, e.scale * 0.6) });
    }
  };
  G.scene3D = {
    env: null, shadowCenter: [0, 0, 0],
    draw(pass) {
      const gl = R.gl;
      if (pass === 'trans') {
        if (G.scene === 'world') {
          R.drawWater(0, [Math.round(R.eye[0] / 4) * 4, 0, Math.round(R.eye[2] / 4) * 4], W.heightTex, W.texInfo);
          // クエスト目標の光柱
          const tg = G.state === 'play' && G.save && G.questTarget();
          if (tg && tg.x != null && Math.hypot(tg.x - R.eye[0], tg.z - R.eye[2]) > 25) G.fx.push({ mode: 2, x: tg.x, y: G.groundAt(tg.x, tg.z), z: tg.z, size: [1.2, 70, 1.2], color: [1, 0.85, 0.4, 0.5], t: 0.5, dur: 1, add: true, once: true });
          if (G.save && !G.ch1Done()) G.fx.push({ mode: 2, x: W.SUMMIT.x, y: W.SUMMIT.y - 6, z: W.SUMMIT.z, size: [42, 30, 42], color: [0.75, 0.6, 1, 0.12], t: 0.5, dur: 1, add: true, once: true });
          if (G.save && W.expanded && !G.ch2Done()) G.fx.push({ mode: 2, x: W.SUMMIT2.x, y: W.SUMMIT2.y - 6, z: W.SUMMIT2.z, size: [42, 34, 42], color: [0.55, 0.85, 1, 0.12], t: 0.5, dur: 1, add: true, once: true });
          if (G.save && W.ch3) G.shrineFX();
          if (G.save && G.gateFX) G.gateFX();
          if (G.save && W.expanded && G.ch2Done() && !G.save.final2) G.fx.push({ mode: 2, x: W.SUMMIT2.x, y: W.SUMMIT2.y, z: W.SUMMIT2.z, size: [1.5, 400, 1.5], color: [0.7, 0.9, 1, 0.35], t: 0.5, dur: 1, add: true, once: true });
        } else {
          for (const b of G.barriers) G.fx.push({ mode: 2, x: b.x, y: 0, z: b.z, size: b.ax === 'x' ? [0.4, 8, G.dun.CW / 2 + 0.5] : [G.dun.CW / 2 + 0.5, 8, 0.4], color: [0.8, 0.5, 1, 0.6], t: 0.5, dur: 1, add: true, once: true });
          for (const rm of G.dun.rooms) if (rm.chestOpen === false) G.fx.push({ mode: 2, x: rm.x, y: rm.y || 0, z: rm.z, size: [0.8, 6, 0.8], color: [1, 0.9, 0.5, 0.5], t: 0.5, dur: 1, add: true, once: true });
          for (const rm of G.dun.rooms) if (rm.pit && rm.cleared) G.fx.push({ mode: 2, x: rm.updraft.x, y: rm.pit.y, z: rm.updraft.z, size: [rm.updraft.r, 26, rm.updraft.r], color: [0.7, 0.95, 1, 0.22], t: 0.5, dur: 1, add: true, once: true });
          for (const it of G.dun.items || []) if (it.t === 'altar' && it.room.cleared && !G.dun.abil[it.abil]) G.fx.push({ mode: 2, x: it.x, y: 1.8, z: it.z, size: [1.1, 9, 1.1], color: it.abil === 'wing' ? [0.6, 0.95, 1, 0.45] : [1, 0.85, 0.4, 0.45], t: 0.5, dur: 1, add: true, once: true });
          if (G.ch4TransFX) G.ch4TransFX();
          G.fx.push({ mode: 4, x: G.dun.exit.x, y: (G.dun.exit.y || 0) + 0.05, z: G.dun.exit.z, size: [3, 1, 3], color: [0.6, 0.9, 1, 1], t: 0.5, dur: 1, add: true, once: true, shape: [1, 0, 0, 0] });
          if (G.dun.portalOut) G.fx.push({ mode: 4, x: G.dun.boss.x, y: (G.dun.boss.y || 0) + 0.05, z: G.dun.boss.z - 6, size: [3, 1, 3], color: [1, 0.9, 0.5, 1], t: 0.5, dur: 1, add: true, once: true, shape: [1, 0, 0, 0] });
        }
        // 地域のワープ光
        if (G.scene === 'world') for (const w of W.WAYPOINTS) if (G.save && G.save.waypoints.includes(w.id) && Math.hypot(w.x - R.eye[0], w.z - R.eye[2]) < 300) G.fx.push({ mode: 4, x: w.x, y: w.y + 0.52, z: w.z, size: [1.25, 1, 1.25], color: [0.5, 0.9, 1, 0.8], t: 0.5, dur: 1, add: true, once: true, shape: [1, 0, 0, 0] });
        R.drawVFX(G.fxList());
        G.fx = G.fx.filter(f => !f.once);
        R.drawParticles(G.parts);
        return;
      }
      if (G.scene === 'world') G.drawWorld(pass); else G.drawDungeon(pass);
      G.drawActors(pass);
      if (pass === 'main' && G.scene === 'world') R.drawGrass(W.heightTex, W.splatTex, W.texInfo, G.player && G.state !== 'title' ? [G.player.pos.x, G.player.pos.y, G.player.pos.z] : [0, -1000, 0]);
      if (pass === 'main' && G.state !== 'play' && G.state !== 'dead' && G.platformOn) { M4.compose(tmpM, 0, 2000, 0, 0, G.time * 0.1, 0, 1); R.drawMesh(G.platform, tmpM, null, 0); }
    }
  };
  G.render = function () {
    const c = G.cam, S = PS.Settings;
    const env = G.scene === 'dungeon' ? G.dungeonEnv() : G.computeEnv(G.tod, G.regionW);
    G.env = env;
    R.setCamera([c.ex, c.ey, c.ez], [c.tx, c.ty, c.tz], S.fov, env.far);
    // 点光源
    const pl = [], px = c.tx, pz = c.tz;
    if (G.scene === 'dungeon') { const ts = G.dun.torches.map(t => ({ t, d: Math.hypot(t.x - px, t.z - pz) })).sort((a, b) => a.d - b.d).slice(0, 7); const fl = 0.85 + Math.sin(G.time * 13) * 0.08; for (const { t } of ts) pl.push({ p: [t.x, 3.3, t.z], c: G.dun.theme.light.map(v => v * 1.6 * fl), r: 14 }); }
    else {
      if (env.night > 0.3) { const ls = W.lights.map(l => ({ l, d: Math.hypot(l.p[0] - px, l.p[2] - pz) })).filter(o => o.d < 80).sort((a, b) => a.d - b.d).slice(0, 6); for (const { l } of ls) pl.push({ p: l.p, c: l.c.map(v => v * env.night * 1.4), r: l.r }); }
      for (const cp of W.camps) if (Math.hypot(cp.x - px, cp.z - pz) < 60 && pl.length < 8) pl.push({ p: [cp.x, cp.y + 1, cp.z], c: [1.4, 0.7, 0.3].map(v => v * (0.5 + env.night)), r: 12 });
    }
    if (G.player && G.player.awk.on && pl.length < 8) pl.push({ p: [G.player.pos.x, G.player.pos.y + 1, G.player.pos.z], c: [1.2, 0.2, 0.3], r: 6 });
    const lumiF = (G.fairies || []).find(f => f.id === 'lumi' || f.id === 'star');
    if (lumiF && pl.length < 8 && (G.scene === 'dungeon' || env.night > 0.25)) pl.unshift({ p: [lumiF.pos.x, lumiF.pos.y, lumiF.pos.z], c: [1.3, 1.1, 0.55], r: 9 });
    if (pl.length > 8) pl.length = 8;
    R.pointLights = pl;
    const p = G.player;
    R.fx.lowHP = p && G.state === 'play' ? PS.smooth(0.3, 0.12, p.hp / G.pstat.hp) : 0;
    R.fx.awaken = p && p.awk.on ? 1 : 0;
    R.fx.fade = G.fadeT > 0 ? Math.min(1, G.fadeT / G.fadeMax * 1.6) : 0; R.fx.fadeCol = [0, 0, 0];
    R.fx.under = 0;
    G.scene3D.env = env; G.scene3D.shadowCenter = p ? [p.pos.x, p.pos.y, p.pos.z] : [c.tx, c.ty, c.tz];
    G.scene3D.noShadow = false;
    R.frame(G.scene3D, G.time);
  };
  // タイトル / ストーリー中の背景描画
  G.renderCinematic = function (dt) {
    const c = G.cam, mode = PS.Story.bgMode ? PS.Story.bgMode() : 'title';
    if (mode === 'none') return;
    G.updateFX(dt); G.updateParts(dt);
    if (mode === 'preview' && PS.Story.previewModel) {
      // 天界プレビュー: 高空に浮かぶ雲の台座
      G.scene = 'world'; const t = G.time;
      c.tx = 0; c.ty = 2001.1; c.tz = 0; c.ex = Math.sin(0.25) * 4.4; c.ey = 2001.6; c.ez = Math.cos(0.25) * 4.4;
      const env = G.computeEnv(11, [1, 0, 0, 0, 0]); env.skyTop = PS.hexRGB('#8ab8f0'); env.skyHor = PS.hexRGB('#fff0f6'); env.fogDen = 0.0004; env.fogStart = 40; env.ambTop = [0.52, 0.52, 0.6]; env.ambBot = [0.42, 0.38, 0.45]; env.lightDir = [0.45, 0.75, 0.5]; env.lightCol = [0.82, 0.78, 0.72]; env.exposure = 0.92;
      G.env = env; R.setCamera([c.ex, c.ey, c.ez], [c.tx, c.ty, c.tz], 40, 5000);
      R.pointLights = []; R.fx.lowHP = 0; R.fx.awaken = 0; R.fx.fade = 0;
      const pm = PS.Story.previewModel;
      PS.animHuman(pm.rig, { t, move: 0, emote: null, wingOpen: pm.wing ? 0.4 : 0 });
      M4.compose(pm.mat, 0, 2000, 0, 0, pm.yaw, 0, 1);
      G.platformOn = true;
      const scene = { env, shadowCenter: [0, 2000, 0], noShadow: false, draw(pass) { if (pass === 'main') { M4.compose(tmpM, 0, 2000, 0, 0, t * 0.1, 0, 1); R.drawMesh(G.platform, tmpM); } if (pass !== 'trans') R.drawSkinned(pm.model.mesh, pm.rig.world, pm.mat, { emis: pm.emis }); else { R.drawVFX(G.fxList()); R.drawParticles(G.parts); } } };
      if (Math.random() < 0.3) G.emit(1, { x: (Math.random() - 0.5) * 8, y: 1999 + Math.random() * 4, z: (Math.random() - 0.5) * 8, color: '#fff6c0', vs: 0.2, vy: 0.4, size: 0.08, life: 3, kind: 1 });
      R.frame(scene, G.time);
      return;
    }
    // タイトル: 村の上空をゆっくり旋回
    const v = W.VILLAGES[0], t = G.time * 0.035;
    c.tx = v.x + 30; c.ty = v.y + 10; c.tz = v.z - 20;
    c.ex = c.tx + Math.sin(t) * 120; c.ez = c.tz + Math.cos(t) * 120; c.ey = Math.max(W.height(c.ex, c.ez) + 20, v.y + 38);
    G.tod = mode === 'ending' ? 6.6 + G.time * 0.02 % 2 : 16.9; G.scene = 'world';
    const env = G.computeEnv(G.tod, [1, 0, 0, 0, 0]); G.env = env;
    R.setCamera([c.ex, c.ey, c.ez], [c.tx, c.ty, c.tz], 55, env.far);
    R.pointLights = []; R.fx.lowHP = 0; R.fx.awaken = 0; R.fx.fade = mode === 'dark' ? 1 : 0; R.fx.fadeCol = [0, 0, 0];
    G.scene3D.env = env; G.scene3D.shadowCenter = [c.tx, c.ty, c.tz];
    const keepP = G.player; G.player = keepP;
    R.frame(G.scene3D, G.time);
  };
  window.addEventListener('DOMContentLoaded', () => PS.boot());
})(window.PS);
