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
// TEXT SIZE (Nov 26): LARGE draws dialogue at 10 px (from 8) in a taller box, and choices at 8 px (from 6).
// Only the dialogue box and its choices change, so menus keep their FF6 layout.
Object.assign(PARTY_CFG, { text: 'normal' });
const BIGFONT = '10px "Press Start 2P", monospace';
{ const _dd = dlgDraw; dlgDraw = function () {
  if (a11yCfg().text !== 'large') return _dd.apply(this, arguments);
  if (DLG.survey) drawSurvey(DLG.survey, Math.min(DLG.i, DLG.survey.pages.length - 1));
  else if (DLG.photos) drawPhotoCard(DLG.photos[Math.min(DLG.i, DLG.photos.length - 1)], DLG.credit);
  else if (DLG.card) drawFrontCard(DLG.card);
  const D = DLG, [who, s] = D.lines[Math.min(D.i, D.lines.length - 1)];
  const fim = D.face && FACE_IMG[D.face], fx = fim ? 58 : 12, Lw = wrap(s, SW - 16 - fx, BIGFONT).length;
  const lines = wrap(s.slice(0, D.ch), SW - 16 - fx, BIGFONT), h = Math.min(SH - 20, (who ? 24 : 12) + Math.max(4, Lw) * 13 + 8), y = SH - h - 4;
  win(4, y, SW - 8, h);
  if (fim && fim.complete && fim.naturalWidth) { const ph = 52, pw = Math.round(ph * fim.naturalWidth / fim.naturalHeight);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(fim, 9, y + 4, pw, ph); ctx.imageSmoothingEnabled = false; }
  if (who) txt(who, fx, y + 6, '#ffd860', 'left', BIGFONT);
  lines.forEach((l, i) => txt(l, fx, y + (who ? 22 : 8) + i * 13, '#fff', 'left', BIGFONT));
  if (D.opts && D.i === D.lines.length - 1) {
    ctx.font = FONT; const ow = Math.min(SW - 8, Math.max(180, 24 + Math.max(...D.opts.map(o => ctx.measureText('▶ ' + o.t).width))));
    const oh = D.opts.length * 14 + 10, oy = Math.max(2, y - oh - 4); win(SW - 4 - ow, oy, ow, oh);
    D.opts.forEach((o, i) => txt((i === D.sel ? '▶ ' : '  ') + o.t, SW - ow + 4, oy + 6 + i * 14, i === D.sel ? '#ffd860' : '#fff', 'left', FONT));
  }
}; }
CFG_ROWS.push(['text', 'TEXT SIZE', ['normal', 'large'], { normal: 'NORMAL', large: 'LARGE' }, 'LARGE: bigger letters in conversations and their choices.']);
