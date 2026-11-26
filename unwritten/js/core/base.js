"use strict";
// =====================================================================
//  THE UNWRITTEN (rebuild, Nov 2026) · base: screen, drawing, text, input, loop.
//  Screen is 384x288 logical pixels, drawn at the device's full pixel density.
//  One global game state G (saved), one mode string, one update/draw per mode.
// =====================================================================
const SW = 384; let SH = 288;
// Nov 26 (UX pass, Fitts's Law): on a phone held upright the 384x288 picture filled only the top third of the screen.
// Use the room above the touch pad: a taller view (more of the town, dialogs nearer the thumbs). Set once at load.
(function () { const touch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (touch && innerHeight > innerWidth) { const s = innerWidth / SW, avail = (innerHeight - 230) / s; SH = Math.max(288, Math.min(480, Math.floor(avail / 16) * 16)); } })();   // Nov 10: up from 320x240 with the bigger tiles, so the view still holds 16 x 12 tiles like FF6
// FF6-style grid: the kid (16x24 px) steps one 16 px tile at a time. Christian asked for the map at a quarter of the
// first true-scale size (two halvings, Nov 10), so one 16 px tile is 4 m of real town (PM = 4 px per metre), which is
// exactly one cell of the town data (T = 16 px). The kid's walking grid is that same grid: CELL = 4 m, CPD = 1.
// Nov 10, Christian: 'increase the game size so the sprites don't have to be altered as much': PM 4 -> 6, so a tile is 24 px
// and his own sprite and the Robin draw at exactly their original pixels (k = 1), no scaling at all.
// Nov 10, later: 'make the map outside slightly bigger too': PM 6 -> 8 (T = 32 px per 4 m step); indoors stays 24 px per metre.
const PM = 8, T = 4 * PM, CELL = 4, CPD = 4 / CELL;
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
let DPR = 1;
function fit() {
  // on a phone held upright, leave the bottom of the screen for the touch pad (touch.js)
  const padH = typeof padPortrait === 'function' && padPortrait() ? PAD_H : 0;
  const s = Math.max(0.5, Math.min(innerWidth / SW, (innerHeight - padH) / SH));
  DPR = Math.max(1, Math.round(s * (window.devicePixelRatio || 1)));
  cv.width = SW * DPR; cv.height = SH * DPR;
  cv.style.width = Math.floor(SW * s) + 'px'; cv.style.height = Math.floor(SH * s) + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.imageSmoothingEnabled = false;
}
addEventListener('resize', fit); fit();

// ---------- drawing ----------
function R(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
const FONT = '8px "Press Start 2P", monospace', SMALL = '6px "Press Start 2P", monospace';
function txt(s, x, y, c = '#fff', al = 'left', f = FONT) {
  ctx.font = f; ctx.textAlign = al; ctx.textBaseline = 'top';
  ctx.fillStyle = '#000'; ctx.fillText(s, x + 1, y + 1); ctx.fillStyle = c; ctx.fillText(s, x, y);
}
function wrap(s, maxW, f = FONT) {
  ctx.font = f; const out = [];
  for (const para of String(s).split('\n')) {
    let cur = '';
    for (const w of para.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
    }
    out.push(cur);
  }
  return out;
}
function win(x, y, w, h) {   // the classic blue window
  R(x, y, w, h, '#f0f0f8'); R(x + 1, y + 1, w - 2, h - 2, '#1a1c4a');
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2c3a8c'); g.addColorStop(1, '#141850');
  ctx.fillStyle = g; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
}
// a small hash for stable per-tile variation
function hash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; }

// ---------- input: keys and a basic gamepad, as buttons pressed this frame ----------
const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Enter: 'a', KeyZ: 'a', Space: 'a', Escape: 'b', KeyX: 'b', Backspace: 'b', KeyM: 'map', Tab: 'map', KeyC: 'menu', KeyQ: 'menu' };
const held = {}, pressed = {};
addEventListener('keydown', e => { const k = KEYMAP[e.code]; if (!k) return; e.preventDefault(); if (!held[k]) pressed[k] = true; held[k] = true; });
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) held[k] = false; });
function pollPad() {
  const p = navigator.getGamepads ? [...navigator.getGamepads()].find(Boolean) : null; if (!p) return;
  const b = i => p.buttons[i] && p.buttons[i].pressed, ax = p.axes || [];
  const st = { a: b(0), b: b(1), menu: b(9) || b(3), map: b(8) || b(2), up: b(12) || ax[1] < -0.5, down: b(13) || ax[1] > 0.5, left: b(14) || ax[0] < -0.5, right: b(15) || ax[0] > 0.5 };
  for (const k in st) { if (st[k] && !pollPad.last[k]) pressed[k] = true; held[k] = st[k] || (held[k] && !pollPad.last[k] ? held[k] : st[k]); }
  pollPad.last = st;
}
pollPad.last = {};
function dirHeld() { return held.up ? 'up' : held.down ? 'down' : held.left ? 'left' : held.right ? 'right' : null; }

// ---------- modes and the loop ----------
const MODES = {};   // name -> {update(), draw()}
let mode = 'title', frame = 0;
function setMode(m) { mode = m; if (MODES[m] && MODES[m].enter) MODES[m].enter(); }
let last = 0, acc = 0;
function loop(t) {
  acc += Math.min(100, t - last); last = t;
  while (acc >= 1000 / 60) {
    pollPad(); frame++;
    const M = MODES[mode]; if (M && M.update) M.update();
    for (const k in pressed) delete pressed[k];
    acc -= 1000 / 60;
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.imageSmoothingEnabled = false;
  const M = MODES[mode]; if (M && M.draw) M.draw();
  requestAnimationFrame(loop);
}
