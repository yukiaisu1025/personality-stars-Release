// Release v1.0.0：プレイ環境のチェック
//  ・他のサイトへの埋め込み（iframe）や、アプリ内ブラウザでは起動しない
//  ・公式の公開場所（GitHub Pages）／手元のファイル以外のサイトでは起動しない
//  ・同じ端末の別のタブ・ウィンドウで同時に起動して、セーブが食い違わないようにする
(function () {
  'use strict';
  // 独自ドメインで公開するときは、ここにホスト名を追加してください（例：'game.example.com'）
  var EXTRA_HOSTS = [];
  var reason = null;
  try { if (window.top !== window.self) reason = 'embed'; } catch (e) { reason = 'embed'; }
  var host = (location.hostname || '').toLowerCase(), proto = location.protocol;
  var hostOK = proto === 'file:' || host === '' || host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || /\.github\.io$/.test(host) ||
    /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) || EXTRA_HOSTS.indexOf(host) >= 0;
  if (!reason && !hostOK) reason = 'host';
  var ua = navigator.userAgent || '';
  if (!reason && /FBAN|FBAV|FB_IAB|Instagram|\bLine\/|MicroMessenger|KAKAOTALK|BytedanceWebview|musical_ly|TikTok|Snapchat|Pinterest|Twitter for/i.test(ua)) reason = 'inapp';
  window.PS_BLOCKED = reason;

  var MSG = {
    embed: ['このページでは遊べません', 'パーソナリティースターズは、他のサイトに埋め込まれた状態ではプレイできません（ステータスやセーブが正しく保存されないため）。', '公式ページを開く'],
    host: ['このサイトでは遊べません', 'パーソナリティースターズは、公式の公開ページ（GitHub Pages）でプレイしてください。他のサイトに転載されたものではプレイできません。', null],
    inapp: ['ブラウザで開いてください', 'アプリ内のブラウザではプレイできません（ステータスやセーブが正しく保存されないため）。右上のメニューなどから「ブラウザで開く」を選び、Chrome・Edge・Safari・Firefox で開いてください。', 'URLをコピー'],
    tab: ['別のタブで起動中です', 'パーソナリティースターズが、この端末の別のタブ・ウィンドウですでに起動しています。同時にプレイするとセーブが食い違うため、どちらか一方でプレイしてください。', 'こちらでプレイする'],
    lost: ['別のタブでプレイが始まりました', '別のタブ・ウィンドウでパーソナリティースターズが起動したため、このタブは停止しました（セーブは別のタブで続きます）。', 'このタブで再開する']
  };
  var shown = null;
  function show(kind) {
    var go = function () {
      if (shown) shown.remove();
      var m = MSG[kind], d = document.createElement('div');
      d.id = 'ps-guard';
      d.setAttribute('style', 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(ellipse at center,#141a3a,#05060f);color:#eef2ff;font-family:"Zen Kaku Gothic New","Hiragino Sans","Noto Sans JP",sans-serif;text-align:center');
      d.innerHTML = '<div style="max-width:560px"><div style="font-size:44px;margin-bottom:8px">✦</div><div style="font-size:13px;letter-spacing:.3em;color:#ffd27a">PERSONALITY STARS</div><h1 style="font-size:24px;margin:14px 0 12px">' + m[0] + '</h1><p style="font-size:15px;line-height:1.9;opacity:.9;margin:0 0 22px">' + m[1] + '</p>' +
        (m[2] ? '<button id="ps-guard-b" style="font:inherit;font-size:15px;font-weight:700;padding:12px 26px;border-radius:999px;border:0;background:linear-gradient(180deg,#ffe08a,#e8b04a);color:#2a1e08;cursor:pointer">' + m[2] + '</button>' : '') +
        '<p style="font-size:11px;opacity:.55;margin-top:26px">© 2026 YUKI GROUP</p></div>';
      document.body.appendChild(d); shown = d;
      var b = document.getElementById('ps-guard-b');
      if (b) b.onclick = function () {
        if (kind === 'embed') { try { window.open(location.href, '_blank', 'noopener'); } catch (e) { } }
        else if (kind === 'inapp') { try { navigator.clipboard.writeText(location.href); b.textContent = 'コピーしました'; } catch (e) { } }
        else if (kind === 'tab') { takeOver(); }
        else if (kind === 'lost') { location.reload(); }
      };
    };
    if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  }
  if (reason) { show(reason); return; }

  // ---- 多重起動のチェック ----
  var KEY = 'ps_tab_lock', ID = Math.random().toString(36).slice(2) + Date.now().toString(36), beat = null, lastW = 0;
  var read = function () { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  var write = function () { try { lastW = Date.now(); localStorage.setItem(KEY, JSON.stringify({ id: ID, t: lastW })); } catch (e) { } };
  var lose = function () { if (window.PS_TAB_LOST) return; window.PS_TAB_LOST = true; clearInterval(beat); try { if (window.PS && PS.G) { PS.G.state = 'blocked'; if (document.pointerLockElement) document.exitPointerLock(); } } catch (e) { } show('lost'); };
  var tick = function () { var L = read(); if (L && L.id !== ID && L.t > lastW - 500) { lose(); return; } write(); };
  var startBeat = function () { write(); beat = setInterval(tick, 2000); };
  var takeOver = function () { window.PS_BLOCKED = null; if (shown) { shown.remove(); shown = null; } startBeat(); if (window.PS && PS.boot) PS.boot(); };
  window.addEventListener('storage', function (e) { if (e.key === KEY && !window.PS_BLOCKED && beat) { var L = read(); if (L && L.id !== ID) lose(); } });
  window.addEventListener('pagehide', function () { var L = read(); if (L && L.id === ID) try { localStorage.removeItem(KEY); } catch (e) { } });
  var L0 = read();
  if (L0 && L0.id !== ID && Date.now() - L0.t < 7000) { window.PS_BLOCKED = 'tab'; show('tab'); }
  else startBeat();
})();
