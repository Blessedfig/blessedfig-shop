"use strict";
// =====================================================================
//  PHONE CONTROLS: an SNES-style pad on screen for touch devices.
//  A D-pad you can slide your thumb around on (bottom left), A and B (bottom right; hold B to run),
//  and two small buttons in the middle (MAP, and SAVE or MENU while walking; they relabel on other screens).
//  They feed the same held / pressed buttons the keyboard and gamepad do. In portrait the game sits at the top
//  and the pad gets the space below; in landscape the pad floats over the sides, half see-through.
// =====================================================================
const IS_TOUCH = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const PAD_H = 230;   // room the pad needs under the game in portrait
function padPortrait() { return IS_TOUCH && innerHeight > innerWidth; }
if (IS_TOUCH) {
  const css = document.createElement('style');
  css.textContent = `
  body.touch{align-items:flex-start;padding-top:env(safe-area-inset-top)}
  body.touch.land{align-items:center}
  .tp{position:fixed;z-index:5;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none;font:10px 'Press Start 2P',monospace;color:#e8e4dc}
  .tp *{touch-action:none}
  #tp-dpad{left:max(18px,env(safe-area-inset-left));bottom:calc(26px + env(safe-area-inset-bottom));width:150px;height:150px}
  #tp-dpad .arm{position:absolute;background:#2a2a3a;border:2px solid #0b0b14;box-shadow:inset 0 2px 0 #44445a}
  #tp-dpad .h{left:0;top:50px;width:146px;height:46px;border-radius:8px}
  #tp-dpad .v{left:50px;top:0;width:46px;height:146px;border-radius:8px}
  #tp-dpad .hub{position:absolute;left:58px;top:58px;width:30px;height:30px;border-radius:50%;background:#22222e}
  #tp-dpad .arr{position:absolute;width:0;height:0;border:9px solid transparent;opacity:.55}
  #tp-dpad .on{opacity:1}
  .tp-btn{position:absolute;border-radius:50%;width:66px;height:66px;display:flex;align-items:center;justify-content:center;font-size:16px;
    border:3px solid #0b0b14;box-shadow:inset 0 3px 0 rgba(255,255,255,.25),0 3px 0 #000}
  .tp-btn.down{transform:translateY(2px);filter:brightness(1.3)}
  #tp-ab{right:max(16px,env(safe-area-inset-right));bottom:calc(30px + env(safe-area-inset-bottom));width:160px;height:140px}
  #tp-a{right:0;top:12px;background:#8a2a3a}
  #tp-b{left:8px;bottom:0;background:#3a4a8a}
  #tp-mid{left:50%;transform:translateX(-50%);bottom:calc(196px + env(safe-area-inset-bottom));display:flex;gap:18px}
  .tp-pill{padding:9px 12px;border-radius:14px;background:#2a2a3a;border:2px solid #0b0b14;box-shadow:inset 0 2px 0 #44445a;font-size:8px}
  .tp-pill.down{filter:brightness(1.4)}
  body.land .tp{opacity:.55}
  body.land #tp-mid{bottom:auto;top:6px}`;
  document.head.appendChild(css);
  const el = (tag, id, cls, parent, html) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; if (html) e.innerHTML = html; (parent || document.body).appendChild(e); return e; };
  // the D-pad
  const dpad = el('div', 'tp-dpad', 'tp');
  el('div', null, 'arm h', dpad); el('div', null, 'arm v', dpad); el('div', null, 'hub', dpad);
  const arrows = {
    up: el('div', null, 'arr', dpad), down: el('div', null, 'arr', dpad), left: el('div', null, 'arr', dpad), right: el('div', null, 'arr', dpad) };
  Object.assign(arrows.up.style, { left: '64px', top: '8px', borderBottomColor: '#e8e4dc' });
  Object.assign(arrows.down.style, { left: '64px', top: '120px', borderTopColor: '#e8e4dc' });
  Object.assign(arrows.left.style, { left: '8px', top: '64px', borderRightColor: '#e8e4dc' });
  Object.assign(arrows.right.style, { left: '120px', top: '64px', borderLeftColor: '#e8e4dc' });
  let padId = null;
  const setDir = d => { for (const k of ['up', 'down', 'left', 'right']) { const on = k === d; if (on && !held[k]) pressed[k] = true; held[k] = on; arrows[k].classList.toggle('on', on); } };
  const dirFrom = e => { const r = dpad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < 12) return null; return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'); };
  dpad.addEventListener('pointerdown', e => { e.preventDefault(); padId = e.pointerId; dpad.setPointerCapture(e.pointerId); setDir(dirFrom(e)); });
  dpad.addEventListener('pointermove', e => { if (e.pointerId === padId) setDir(dirFrom(e)); });
  const padUp = e => { if (e.pointerId === padId) { padId = null; setDir(null); } };
  dpad.addEventListener('pointerup', padUp); dpad.addEventListener('pointercancel', padUp);
  // a held button that maps to one of the game's buttons
  const hold = (node, key) => {
    const down = e => { e.preventDefault(); node.setPointerCapture(e.pointerId); if (!held[key]) pressed[key] = true; held[key] = true; node.classList.add('down'); if (navigator.vibrate) navigator.vibrate(8); };
    const up = () => { held[key] = false; node.classList.remove('down'); };
    node.addEventListener('pointerdown', down); node.addEventListener('pointerup', up); node.addEventListener('pointercancel', up);
  };
  const ab = el('div', 'tp-ab', 'tp');
  hold(el('div', 'tp-a', 'tp-btn', ab, 'A'), 'a'); hold(el('div', 'tp-b', 'tp-btn', ab, 'B'), 'b');
  const mid = el('div', 'tp-mid', 'tp');
  const pMap = el('div', null, 'tp-pill', mid, 'MAP'), pMenu = el('div', null, 'tp-pill', mid, 'SAVE');
  hold(pMap, 'map'); hold(pMenu, 'menu');
  const pLay = el('div', null, 'tp-pill', mid, 'LAYER'); hold(pLay, 'layer');   // map layers, shown on the map only
  const pSky = el('div', null, 'tp-pill', mid, 'SKY'); hold(pSky, 'sky');   // day, night or real time (daynight.js)
  // a tap on the game itself is A (handy for paging through dialogue)
  cv.addEventListener('pointerdown', e => { e.preventDefault(); pressed.a = true; });
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());
  // Nov 22, Christian: "On my phone the game keeps zooming in." iPhones ignore user-scalable=no, so block the zoom gestures themselves:
  // pinches (two fingers, or Safari's gesture events) and double-taps anywhere on the page. Buttons still work: they act on pointerdown.
  ['gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault()));
  document.addEventListener('touchmove', e => { if (e.touches.length > 1 || (e.scale && e.scale !== 1)) e.preventDefault(); }, { passive: false });
  let lastEnd = 0;
  document.addEventListener('touchend', e => { const now = Date.now(); if (now - lastEnd < 350 && !e.target.closest('iframe')) e.preventDefault(); lastEnd = now; }, { passive: false });
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
  // if the page did get zoomed (an older phone, or before this loaded), snap it back to 1x
  if (window.visualViewport) { const vm = document.querySelector('meta[name=viewport]'), base = vm && vm.content;
    visualViewport.addEventListener('resize', () => { if (vm && visualViewport.scale > 1.01) { vm.content = base + ',initial-scale=1'; setTimeout(() => { vm.content = base; }, 60); } }); }
  // labels follow the screen you're on
  // Nov 24: the pills say what the button really does there. The second pill is the C key: it opens the field menu in THE STORY
  // (battle/hooks.js) and saves in Explore Town. Indoors the map button does nothing, so it is hidden there; screens that
  // read neither button show none.
  const cKey = () => typeof isRPG === 'function' && isRPG() ? 'MENU' : 'SAVE';
  const LABELS = { walk: () => ['MAP', cKey()], inside: () => ['', cKey()], map: () => MODES.map.list ? ['BACK', ''] : ['PLACES', 'ZOOM'],
    pmenu: () => ['', typeof PMN !== 'undefined' && PMN && PMN.view && PMN.view.kind === 'main' ? 'CLOSE' : ''], discgolf: () => [typeof DG !== 'undefined' && DG && DG.phase === 'aim' && dgDist() > 66 ? 'ANGLE' : '', ''], edutree: ['', 'REPORT'],
    battle: ['', ''], hoops: ['', ''], pickle: ['', ''], kayak: ['', ''], study: ['', ''],
    title: ['', ''], create: ['', ''], almanac: ['', ''], store: ['', ''] };
  setInterval(() => { const E = LABELS[mode], L = typeof E === 'function' ? E() : E || ['MAP', 'MENU']; pMap.textContent = L[0]; pMenu.textContent = L[1];
    pMap.style.visibility = L[0] ? 'visible' : 'hidden'; pMenu.style.visibility = L[1] ? 'visible' : 'hidden'; pLay.style.display = mode === 'map' && !MODES.map.list ? '' : 'none'; pSky.style.display = mode === 'walk' || mode === 'inside' ? '' : 'none'; }, 200);
  const orient = () => { document.body.classList.add('touch'); document.body.classList.toggle('land', !padPortrait()); fit(); };
  addEventListener('resize', orient); addEventListener('orientationchange', () => setTimeout(orient, 200)); orient();
}
