"use strict";
// =====================================================================
//  TOWNSFOLK SHEETS (Nov 27). Christian: "keep making new art, for civilians and animals and birds with chat gtp to our
//  specific requirements, firmly, and check to make sure it follows through" and "Use the UX standards, we must have
//  consistency". The procedural people (sprites.js) were a different style and far smaller than the kid; these sheets are
//  drawn by ChatGPT on the kid's own sheet as the template and must pass the checks in /home/claude/artpipe/sheet.py
//  (16 frames, one pixel size, adults about 1.1-1.2 x the kid's height, feet on one baseline, dark outline, one 32-colour
//  palette, left and right rows mirrored) before they go in. Like the kid's own sheet, the drawing is kept as drawn (not
//  re-pixelated), only resampled so one art pixel is 4 file px; 4 x 4 cells (rows down, up, left, right; columns stand, step,
//  stand, step), feet 2 px above each cell's bottom.
//  Drawn at the kid's exact pixel size (1.33 screen px per art pixel, smoothed the same way), so everybody on the street
//  shares one scale and one look. A sheet can be recoloured (hue turns on its clothes, never skin, hair or outline) so a
//  few sheets make a varied crowd. Where no sheet fits yet, the procedural person still draws.
// =====================================================================
const TFS_K = 1.33, TFS_HI = 4;   // screen px per art pixel (the kid's: boy.png measures 7.08 src px per art pixel, drawn at 5.333 src px per screen px); file px per art pixel
const TFS = [];       // filled from TFS_LIST below once each image loads
// id, file, cell w/h, the townsfolk flavours (n.fl) and roles it can stand for, the seasons it dresses for, its age
const TFS_LIST = [
  { id: 'hiker', fl: [10], roles: ['Hiker', 'Outdoors Guide', 'Visitor', 'Forager', 'Campground Host'], seasons: ['warm', 'cool'], age: 'adult' },
  { id: 'elder_w', fl: [1, 3, 4, 6, 8, 10], roles: ['Elder', 'Book Club Member', 'Librarian', 'Storyteller'], seasons: ['warm', 'cool'], age: 'elder' },
  { id: 'elder_m', fl: [1, 3, 4, 6, 8, 10], roles: ['Elder', 'Historian', 'Antique Dealer', 'Veteran', 'Storyteller'], seasons: ['warm', 'cool'], age: 'elder' },
  { id: 'student_g', fl: [0, 7], roles: ['Student', 'College Visitor'], seasons: ['warm', 'cool'], age: 'teen' },
  { id: 'gamer', fl: [7], roles: ['Gamer', 'Tech Helper'], seasons: ['warm', 'cool'], age: 'adult' },
  { id: 'runner', fl: [2], roles: [], seasons: ['warm'], age: 'adult' },
  { id: 'townwoman', fl: [3, 8], roles: ['Artist', 'Craftsperson', 'Teacher', 'Musician', 'Bookseller', 'Antique Dealer'], seasons: ['warm', 'cool'], age: 'adult' },
  { id: 'townsman', fl: [3, 8], roles: ['Teacher', 'Grocery Manager', 'Tech Helper', 'Visitor'], seasons: ['warm', 'cool'], age: 'adult' },
  { id: 'child_b', fl: [0], roles: ['Student', 'Gamer'], seasons: ['warm', 'cool'], age: 'child' },
  { id: 'winter_m', fl: [], any: 1, roles: [], seasons: ['winter'], age: 'adult' },
  { id: 'winter_w', fl: [], any: 1, roles: [], seasons: ['winter'], age: 'adult' },
  { id: 'winter_c', fl: [0], any: 1, roles: [], seasons: ['winter'], age: 'child' },
  { id: 'cyclist', fl: [9], roles: [], seasons: ['warm', 'cool'], age: 'adult' },
  { id: 'fisher', fl: [4], roles: ['Fisherman', 'Trapper', 'Outdoors Guide'], seasons: ['warm', 'cool'], age: 'adult' },
  { id: 'courier', fl: [5, 8], roles: ['Delivery Driver', 'Parcel Carrier'], seasons: ['warm'], age: 'adult' },
  { id: 'worker', fl: [5], roles: ['Handyman', 'Mechanic', 'Forester', 'ATV Rider', 'Hardware Clerk'], seasons: ['warm', 'cool'], age: 'adult' },
  { id: 'winter_ew', fl: [], any: 1, roles: [], seasons: ['winter'], age: 'elder' },
  { id: 'winter_em', fl: [], any: 1, roles: [], seasons: ['winter'], age: 'elder' },
  { id: 'runner_cool', fl: [2], roles: [], seasons: ['cool'], age: 'adult' },
  { id: 'farmer', fl: [6], roles: ['Farmer', 'Dairy Farmer', 'Maple Syrup Maker'], seasons: ['warm', 'cool'], age: 'adult' },
];
function tfsLoad() {
  for (const d of TFS_LIST) {
    const im = new Image(); im.onload = () => { d.im = im; d.cw = d.cw || im.width / 4; d.ch = d.ch || im.height / 4; d.var = {}; TFS.push(d); };
    im.src = 'assets/townfolk/' + d.id + '.png';
  }
}
tfsLoad();
// clothes recolour: turn the hue of saturated colours outside the skin/hair/leather band
function tfsVariant(d, v) {
  v = ((v | 0) % 4 + 4) % 4;   // Nov 27: a negative name hash gave v = -3, no hue turn, and a crash that froze the game (the librarian)
  if (!v) return d.im; if (d.var[v]) return d.var[v];
  const c = document.createElement('canvas'); c.width = d.im.width; c.height = d.im.height; const g = c.getContext('2d'); g.drawImage(d.im, 0, 0);
  const D = g.getImageData(0, 0, c.width, c.height), p = D.data, turn = [0, 110, 200, 290][v % 4] / 360;
  for (let i = 0; i < p.length; i += 4) {
    if (!p[i + 3]) continue; const r = p[i] / 255, gg = p[i + 1] / 255, b = p[i + 2] / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), l = (mx + mn) / 2, dd = mx - mn;
    if (dd < 0.12 || l < 0.12) continue;   // greys, whites and the outline stay
    const s = dd / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((gg - b) / dd) % 6 : mx === gg ? (b - r) / dd + 2 : (r - gg) / dd + 4; h = (h / 6 + 1) % 1;
    if (h < 0.15 || h > 0.95 || s < 0.25) continue;   // skin, hair (red to blond), leather, khaki and reds stay; dull colours stay
    const h2 = (h + turn) % 1, C = (1 - Math.abs(2 * l - 1)) * s, X = C * (1 - Math.abs((h2 * 6) % 2 - 1)), m = l - C / 2, k = Math.min(5, Math.floor(h2 * 6));   // Nov 27: h2 just under 1 rounds to k = 6 and froze the game (the library's librarian)
    const [rr, g2, bb] = [[C, X, 0], [X, C, 0], [0, C, X], [0, X, C], [X, 0, C], [C, 0, X]][k];
    p[i] = (rr + m) * 255; p[i + 1] = (g2 + m) * 255; p[i + 2] = (bb + m) * 255;
  }
  g.putImageData(D, 0, 0); return (d.var[v] = c);
}
function tfsSeason() { const ph = typeof TF_SEASON === 'function' ? TF_SEASON() : 'leaf'; return ph === 'snow' ? 'winter' : /^(spring|bare|color)$/.test(ph) ? 'cool' : 'warm'; }
// which sheet a townsperson wears (null: none fits yet, so the procedural look draws)
function tfsPick(n) {
  if (!TFS.length) return null; const se = tfsSeason();
  if (n._tfs && n._tfsSe === se && n._tfsN === TFS.length) return n._tfs;
  // the person's age (from the procedural look) must match the sheet's: kids get child sheets, never an adult's
  const age = tfLook(n).age, fits = d => age === 'kid' ? d.age === 'child' : age === 'teen' ? d.age === 'teen' || d.age === 'adult' : age === 'elder' ? d.age === 'elder' : d.age === 'adult';
  const ok = TFS.filter(d => d.seasons.includes(se) && fits(d));
  let c = ok.filter(d => d.roles.includes(n.spr) && d.fl.includes(n.fl));
  if (!c.length) c = ok.filter(d => d.fl.includes(n.fl));
  if (!c.length && se === 'winter') c = ok.filter(d => d.any);   // in winter everyone in town wears a coat
  const d = c.length ? c[n.seed % c.length] : null;
  n._tfs = d ? { d, v: (n.seed >> 3) % 4 } : null; n._tfsSe = se; n._tfsN = TFS.length; return n._tfs;
}
const TFS_ROW = { down: 0, up: 1, left: 2, right: 3 }, TFS_COL = [0, 1, 3, 2];   // fr: stand, step, step, breath
function tfsDraw(pick, x, y, dir, fr) {
  const d = pick.d, im = tfsVariant(d, pick.v), k = TFS_K / TFS_HI, w = d.cw * k, h = d.ch * k;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(im, TFS_COL[fr % 4] * d.cw, TFS_ROW[dir] * d.ch, d.cw, d.ch, Math.round(x - w / 2), Math.round(y - h + 2 * k), w, h);
  ctx.imageSmoothingEnabled = false;
}
// townsfolk: the sheet when one fits, else the procedural person
{ const _dt = drawTf; drawTf = function (p) {
  const n = p.n, pick = tfsPick(n); if (!pick) return _dt(p);
  const _sd = SPR.draw; SPR.draw = (L, sc, x, y, dir, fr) => tfsDraw(pick, x, y, dir, fr);
  try { return _dt(p); } finally { SPR.draw = _sd; }
}; }
// ---- people indoors (clerks, servers, family at home, Cecil, Tanner ...): the same sheets, so inside matches the street ----
// Picked from the person's own record: children, elders (grey hair), hard hats, headsets, Tanner's flannel; everyone else one
// of the townsman/townswoman sheets, recoloured by name so two clerks in one shop don't match. Named friends keep one look.
const TFS_IN = { tanner: 'hiker', cecil: 'gamer' };
function tfsFolkPick(who) {
  const S = typeof FOLKS !== 'undefined' && FOLKS[who]; if (!S || !TFS.length) return null;
  const by = id => TFS.find(d => d.id === id), h = SPR.strHash(who);
  let id = TFS_IN[who];
  if (!id) {
    const grey = /^#(?:[c-f][0-9a-f]){3}$/i.test(S.hair || '') || /^#(9|a|b)[0-9a-f](9|a|b)[0-9a-f](9|a|b)/i.test(S.hair || '');
    const has = k => S.extra === k || (Array.isArray(S.extra) && S.extra.includes(k));
    if (S.sc && S.sc < 0.85) id = 'child_b';
    else if (S.hardhat) id = 'worker';
    else if (has('headset') || has('handheld')) id = 'gamer';
    else if (grey) id = h & 1 ? 'elder_w' : 'elder_m';
    else id = h & 2 ? 'townwoman' : 'townsman';
  }
  const d = by(id); return d ? { d, v: TFS_IN[who] ? 0 : (h >>> 2) % 4 } : null;
}
{ const _f = SPR.folk; SPR.folk = function (who, cx, by, t, dir, moving) {
  const pick = tfsFolkPick(who); if (!pick) return _f.apply(this, arguments);
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(cx, by - 1, pick.d.age === 'child' ? 6 : 8, 2.5, 0, 0, 6.29); ctx.fill();
  const fr = moving ? SPR.walkFrame(t) : SPR.idleFrame(t, SPR.strHash(who) & 63);
  tfsDraw(pick, cx, by, dir || 'down', fr);
}; }
