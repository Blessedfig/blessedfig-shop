"use strict";
// =====================================================================
//  ACCESSIBILITY (Nov 26, ported in spirit from v0.36's a11y.js): two CONFIG rows.
//  SCREEN MOTION  CALM stops the battle screen shaking and the white full-screen flashes (a weakness break, a hit
//                 on the party). Foes still blink before they act, because that blink is the warning.
//  WINDOWS        HIGH CONTRAST draws every window as white text on solid black with a thick white frame
//                 instead of the blue gradient.
// =====================================================================
Object.assign(PARTY_CFG, { motion: 'full', contrast: 0 });
const a11yCfg = () => (typeof G !== 'undefined' && G && G.party && G.party.cfg) || PARTY_CFG;
{ const _win = win; win = function (x, y, w, h) {
  if (!a11yCfg().contrast) return _win(x, y, w, h);
  R(x, y, w, h, '#ffffff'); R(x + 2, y + 2, w - 4, h - 4, '#000000');
}; }
{ const B = MODES.battle, up = B.update; B.update = function () {
  const r = up.apply(this, arguments);
  if (a11yCfg().motion === 'calm' && typeof BT !== 'undefined' && BT) {
    BT.shake = 0; BT.flash = 0;
    for (const u of BT.units || []) u.shake = 0;
  }
  return r;
}; }
CFG_ROWS.push(
  ['motion', 'SCREEN MOTION', ['full', 'calm'], { full: 'FULL', calm: 'CALM' }, 'CALM: no screen shake and no white flashes in battle. Foes still blink before they act.'],
  ['contrast', 'WINDOWS', [0, 1], { 0: 'CLASSIC BLUE', 1: 'HIGH CONTRAST' }, 'HIGH CONTRAST: white text on solid black with a thick white frame.']);
