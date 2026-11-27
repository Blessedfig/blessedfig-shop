"use strict";
// =====================================================================
//  POSTCARDS (Nov 27). A quality touch outside the story: P (or CONFIG > SEND A POSTCARD) turns the view you are standing in
//  into a postcard, the way people mail one from a trip: a cream card border, "GREETINGS FROM ANTIGO", the place you are
//  at, the season and the date, and a small line with the bookstore's address. It saves as a PNG on this device (nothing
//  is uploaded). Good for sharing a favourite corner of town; the game never asks you to.
// =====================================================================
KEYMAP.KeyP = 'postcard';
function pcPlace() {
  try {
    if (G && G.inside && typeof FIG_FLOORS !== 'undefined' && FIG_FLOORS[G.inside.f]) return FIG_FLOORS[G.inside.f].name || 'The Blessed Fig Tree';
    if (G && G.inside && G.inside.b && G.inside.b.name) return G.inside.b.name;
    let best = null; const [px, py] = [G.x, G.y];
    for (const p of PLACES) { const d = Math.hypot(p[2] - px, p[3] - py); if (!best || d < best[0]) best = [d, p[0]]; }
    if (best && best[0] < 40) return best[1];
  } catch (e) {}
  return 'Antigo, Wisconsin';
}
const PC_SEASON = { snow: 'Winter', bare: 'Early spring', spring: 'Spring', leaf: 'Summer', color: 'Fall' };
// a clean frame: the world only, no labels, banners, hints or dialog (redrawn once, then the game carries on)
function pcCleanFrame() {
  const keep = { dl: drawTownLabels, ban: typeof BANNER !== 'undefined' ? BANNER : null, dlg: DLG, txt: txt };
  try {
    drawTownLabels = function () { if (mode === 'walk' && typeof drawNight === 'function') drawNight(); };
    if (typeof BANNER !== 'undefined') BANNER = null; DLG = null; txt = function () {};
    ctx.save(); MODES[mode].draw(); ctx.restore();
  } catch (e) {} finally { drawTownLabels = keep.dl; if (typeof BANNER !== 'undefined') BANNER = keep.ban; DLG = keep.dlg; txt = keep.txt; }
  const c = document.createElement('canvas'); c.width = ctx.canvas.width; c.height = ctx.canvas.height; c.getContext('2d').drawImage(ctx.canvas, 0, 0); return c;
}
function makePostcard() {
  const src = pcCleanFrame(), W = 1200, H = 1000, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#f2e8d2'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#e4d6b8'; for (let i = 0; i < 2600; i++) g.fillRect((i * 7919) % W, (i * 104729) % H, 2, 2);   // card stock
  const iw = 960, ih = Math.round(iw * src.height / src.width), M = (W - iw) / 2, top = 112;
  g.fillStyle = '#3a2a20'; g.fillRect(M - 6, top - 6, iw + 12, ih + 12);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(src, M, top, iw, ih);
  g.fillStyle = '#2a4a30'; g.font = '34px "Press Start 2P", monospace'; g.textAlign = 'center'; g.textBaseline = 'top';
  g.fillText('GREETINGS FROM ANTIGO', W / 2 - 40, 40);
  const place = pcPlace(), d = new Date(), se = (typeof SKY !== 'undefined' && PC_SEASON[SKY.phase]) || '';
  g.fillStyle = '#5a3a24'; g.font = '18px "Press Start 2P", monospace';
  const by = top + ih + 26; g.fillText(place.toUpperCase(), W / 2, by);
  g.fillStyle = '#7a6a58'; g.font = '12px "Press Start 2P", monospace';
  g.fillText((se ? se + ' · ' : '') + d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }), W / 2, by + 34);
  g.font = '10px "Press Start 2P", monospace'; g.fillText('The Blessed Fig Tree · 800 Fifth Ave, Antigo, Wisconsin · theblessedfigtree.com', W / 2, H - 34);
  // a stamp in the corner: a little fig
  g.fillStyle = '#fffaf0'; g.fillRect(W - 118, 18, 76, 86); g.strokeStyle = '#b8a888'; g.setLineDash([4, 3]); g.strokeRect(W - 114, 22, 68, 78); g.setLineDash([]);
  g.fillStyle = '#6a3a6a'; g.beginPath(); g.ellipse(W - 80, 66, 18, 22, 0, 0, 6.29); g.fill(); g.fillStyle = '#4a7a3a'; g.fillRect(W - 82, 36, 5, 12);
  return c;
}
function postcardSave() {
  try {
    const c = makePostcard(), a = document.createElement('a'), n = pcPlace().replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    a.download = 'antigo-postcard-' + (n || 'antigo') + '.png'; a.href = c.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
    if (typeof SKY !== 'undefined') SKY.toast = { t: 'POSTCARD SAVED', until: performance.now() + 1800 };
    if (typeof SND !== 'undefined') SND.play('ok');
  } catch (e) { if (typeof SKY !== 'undefined') SKY.toast = { t: 'COULD NOT SAVE THE POSTCARD', until: performance.now() + 2200 }; }
}
for (const k of ['walk', 'inside']) {
  const M = MODES[k]; if (!M) continue; const _u = M.update;
  M.update = function () { if (pressed.postcard && !DLG) { pressed.postcard = false; setTimeout(postcardSave, 0); } return _u.call(this); };
}
// the same from the menu (phones have no P key): CONFIG > SEND A POSTCARD, after HOW TO PLAY
if (typeof pmConfig === 'function') { const _pc = pmConfig; pmConfig = function () { _pc(); if (PMN && PMN.view && PMN.view.kind === 'list') PMN.view.rows.splice(1, 0, { t: 'SEND A POSTCARD', right: '', desc: 'Save the view where you stand as a postcard from Antigo (P on a keyboard).', f: () => { if (typeof pmClose === 'function') pmClose(); setTimeout(postcardSave, 50); } }); }; }
