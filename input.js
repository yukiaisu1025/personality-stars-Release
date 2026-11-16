/* Personality Stars - input.js : キーボード / マウス(ポインタロック) / タッチ / ゲームパッド  (c) 2026 YUKI GROUP */
'use strict';
(function (PS) {
  const KEYMAP = {
    KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
    Space: 'jump', ShiftLeft: 'dash', ShiftRight: 'dash', KeyE: 'skill1', KeyQ: 'skill2', KeyZ: 'special', KeyF: 'interact', KeyG: 'food',
    KeyM: 'map', KeyB: 'bag', KeyC: 'char', KeyJ: 'quest', Escape: 'menu', ControlLeft: 'descend', KeyX: 'descend', KeyR: 'support', KeyP: 'party', Enter: 'confirm', Tab: 'tab'
  };
  const I = PS.Input = {
    held: new Set(), pressed: new Set(), lookX: 0, lookY: 0, wheel: 0, mx: 0, my: 0, locked: false, enabled: true,
    joy: { x: 0, y: 0, active: false, id: null, ox: 0, oy: 0 }, camTouch: null, padPrev: [], lastDevice: PS.isMobile ? 'touch' : 'kb',
    press(a) { this.pressed.add(a); }, isDown(a) { return this.held.has(a); }, was(a) { return this.pressed.has(a); },
    endFrame() { this.pressed.clear(); this.lookX = 0; this.lookY = 0; this.wheel = 0; },
    move() {
      let x = 0, y = 0;
      if (this.held.has('up')) y += 1; if (this.held.has('down')) y -= 1; if (this.held.has('left')) x -= 1; if (this.held.has('right')) x += 1;
      if (this.joy.active) { x += this.joy.x; y += this.joy.y; }
      if (this.pad) { x += this.pad.x; y += this.pad.y; }
      const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
      return { x, y, mag: Math.min(1, l) };
    },
    bind(canvas) {
      this.canvas = canvas;
      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
        const a = KEYMAP[e.code]; this.lastDevice = 'kb';
        if (a) { if (!this.held.has(a)) this.press(a); this.held.add(a); if (a === 'jump' || a === 'tab' || e.code.startsWith('Arrow')) e.preventDefault(); }
        if (e.code === 'AltLeft' || e.code === 'AltRight') { e.preventDefault(); if (this.locked) document.exitPointerLock(); this.altFree = true; }
        // 人格切り替え（1〜9）／プラス進化（V）
        const dg = /^(?:Digit|Numpad)([1-9])$/.exec(e.code); if (dg && !e.repeat) this.press('char' + dg[1]);
        if (e.code === 'KeyV' && !e.repeat) this.press('plus');
      });
      window.addEventListener('keyup', (e) => { const a = KEYMAP[e.code]; if (a) this.held.delete(a); if (e.code === 'AltLeft' || e.code === 'AltRight') this.altFree = false; });
      window.addEventListener('blur', () => { this.held.clear(); });
      canvas.addEventListener('mousedown', (e) => {
        this.lastDevice = 'kb';
        if (PS.G && PS.G.wantsLock() && !this.locked && !PS.isMobile) { this.requestLock(); return; }
        if (e.button === 0) { this.press('attack'); this.held.add('attack'); }
        if (e.button === 2) { this.press('dash'); this.held.add('dash'); }
      });
      window.addEventListener('mouseup', (e) => { if (e.button === 0) this.held.delete('attack'); if (e.button === 2) this.held.delete('dash'); });
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
      // 保険：画面を覆う表示（吹き出し・マーク等）の上をクリックしても、ボタン類でなければマウス固定する
      const UI_SEL = 'button,a,input,select,textarea,label,.panel,.modal,.dialog,.tbtn,.hud-btn,.slot,.sk,.pr,.tut,.qtrack,.minimap,.screen,.banner,.chap-card,#panels *';
      window.addEventListener('mousedown', (e) => {
        if (e.target === canvas || PS.isMobile || e.button !== 0) return;
        if (e.target.closest && e.target.closest(UI_SEL)) return;
        if (PS.G && PS.G.wantsLock() && !this.locked) this.requestLock();
      });
      window.addEventListener('mousemove', (e) => {
        this.mx = e.clientX; this.my = e.clientY;
        if (this.locked) { this.lookX += e.movementX; this.lookY += e.movementY; }
      });
      canvas.addEventListener('wheel', (e) => { this.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
      document.addEventListener('pointerlockchange', () => {
        const was = this.locked; this.locked = document.pointerLockElement === canvas;
        if (was && !this.locked && PS.G && PS.G.onUnlock) PS.G.onUnlock();
      });
      // タッチ操作 ⇔ キーボード操作：指が触れたらタッチUI、マウスが押されたらキーボードUI
      const setMode = (touch) => {
        if (!!PS.isMobile === touch) return;
        PS.isMobile = touch; document.body.classList.toggle('mobile', touch);
        if (touch && this.locked) document.exitPointerLock();
        if (!touch) { this.joy.active = false; this.joy.x = this.joy.y = 0; this.camTouch = null; }
        PS.UI && PS.UI.onModeChange && PS.UI.onModeChange(touch);
      };
      this.setTouchMode = setMode;
      window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' || e.pointerType === 'pen') setMode(true); else if (e.pointerType === 'mouse') setMode(false); }, true);
      window.addEventListener('touchstart', () => setMode(true), { capture: true, passive: true });
      // タッチ
      const tstart = (e) => {
        this.lastDevice = 'touch';
        for (const t of e.changedTouches) {
          if (t.target.closest && t.target.closest('.tbtn,.hud-btn,.panel,button')) continue;
          if (t.clientX < window.innerWidth * 0.42 && !this.joy.active) { Object.assign(this.joy, { active: true, id: t.identifier, ox: t.clientX, oy: t.clientY, x: 0, y: 0 }); PS.UI && PS.UI.joyShow(t.clientX, t.clientY, 0, 0); }
          else if (!this.camTouch) this.camTouch = { id: t.identifier, x: t.clientX, y: t.clientY };
        }
      };
      const tmove = (e) => {
        for (const t of e.changedTouches) {
          if (this.joy.active && t.identifier === this.joy.id) { let dx = (t.clientX - this.joy.ox) / 55, dy = (t.clientY - this.joy.oy) / 55; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } this.joy.x = dx; this.joy.y = -dy; this.joy.sprint = l > 1.6; PS.UI && PS.UI.joyShow(this.joy.ox, this.joy.oy, dx, dy); }
          else if (this.camTouch && t.identifier === this.camTouch.id) { this.lookX += (t.clientX - this.camTouch.x) * 1.6; this.lookY += (t.clientY - this.camTouch.y) * 1.6; this.camTouch.x = t.clientX; this.camTouch.y = t.clientY; }
        }
        if (e.cancelable) e.preventDefault();
      };
      const tend = (e) => {
        for (const t of e.changedTouches) {
          if (this.joy.active && t.identifier === this.joy.id) { this.joy.active = false; this.joy.x = this.joy.y = 0; PS.UI && PS.UI.joyHide(); }
          if (this.camTouch && t.identifier === this.camTouch.id) this.camTouch = null;
        }
      };
      canvas.addEventListener('touchstart', tstart, { passive: true }); window.addEventListener('touchmove', tmove, { passive: false });
      window.addEventListener('touchend', tend); window.addEventListener('touchcancel', tend);
    },
    requestLock() { try { const p = this.canvas.requestPointerLock({ unadjustedMovement: true }); if (p && p.catch) p.catch(() => { try { this.canvas.requestPointerLock(); } catch (e) { } }); } catch (e) { try { this.canvas.requestPointerLock(); } catch (e2) { } } },
    virtual(act, down) { if (down) { if (!this.held.has(act)) this.press(act); this.held.add(act); } else this.held.delete(act); },
    pollPad() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : []; const g = pads && pads[0];
      if (!g) { this.pad = null; return; }
      const dz = (v) => Math.abs(v) < 0.15 ? 0 : v;
      this.pad = { x: dz(g.axes[0]), y: -dz(g.axes[1]) };
      const lx = dz(g.axes[2] || 0), ly = dz(g.axes[3] || 0); if (lx || ly) { this.lookX += lx * 14; this.lookY += ly * 10; this.lastDevice = 'pad'; }
      const map = { 0: 'jump', 2: 'attack', 1: 'dash', 5: 'skill1', 7: 'skill2', 4: 'special', 3: 'interact', 9: 'menu', 8: 'map', 12: 'food', 6: 'descend', 13: 'support', 14: 'party' };
      g.buttons.forEach((b, i) => { const a = map[i]; if (!a) return; const p = b.pressed || b.value > 0.5; if (p && !this.padPrev[i]) { this.press(a); this.lastDevice = 'pad'; } if (p) this.held.add(a); else if (this.padPrev[i]) this.held.delete(a); this.padPrev[i] = p; });
    }
  };
})(window.PS);
