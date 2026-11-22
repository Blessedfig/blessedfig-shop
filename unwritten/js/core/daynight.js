"use strict";
// ---------- Day and night by choice (Christian, Nov 13): N, or the SKY button on a phone, steps the sky through
// real time (the sun over Antigo right now), always day, and always night. The choice is kept on this device. ----------
KEYMAP.KeyN = 'sky';
const SKY_MODES = [['auto', 'REAL TIME', null], ['day', 'DAY', 40], ['night', 'NIGHT', -20]];
SKY.urlSun = SKY.sunFix;   // a ?sun= preview link still decides the sky while it's on real time
function skySet(m, show) {
  const e = SKY_MODES.find(q => q[0] === m) || SKY_MODES[0];
  SKY.mode = e[0]; SKY.sunFix = e[2] !== null ? e[2] : SKY.urlSun; SKY.next = 0; skyUpdate();
  try { localStorage.setItem('unwritten2_sky', e[0]); } catch (er) { }
  if (show) SKY.toast = { t: 'SKY: ' + e[1], until: performance.now() + 1800 };
}
function skyCycle() { const i = SKY_MODES.findIndex(q => q[0] === SKY.mode); skySet(SKY_MODES[(i + 1) % SKY_MODES.length][0], true); }
function skyToast() {
  const s = SKY.toast; if (!s) return; const left = s.until - performance.now(); if (left <= 0) { SKY.toast = null; return; }
  ctx.font = SMALL; const w = Math.ceil(ctx.measureText(s.t).width) + 14;
  ctx.globalAlpha = Math.min(1, left / 300); win(SW - w - 4, 4, w, 14); txt(s.t, SW - w + 3, 8, '#fff', 'left', SMALL); ctx.globalAlpha = 1;
}
{ let m = 'auto'; try { m = localStorage.getItem('unwritten2_sky') || 'auto'; } catch (er) { } skySet(m, false); }
for (const k of ['walk', 'inside']) {
  const M = MODES[k], _u = M.update, _d = M.draw;
  M.update = function () { if (pressed.sky && !DLG) skyCycle(); return _u.call(this); };
  M.draw = function () { _d.call(this); skyToast(); };
}
