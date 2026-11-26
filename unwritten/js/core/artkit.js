"use strict";
// =====================================================================
//  ART KIT (Nov 26, 2026). Christian: custom art for the whole town, "very little copying", all in one style so nothing clashes.
//  Every texture here was drawn by ChatGPT against one style guide (reference/style/townsfolk_style_guide.png) and cut to
//  exact pixels by /home/claude/uxaudit/town (scripts in BUILD_NOTES). One sprite pixel = one world pixel, like the people.
//  The town's data stays as it is (OSM streets, building outlines, the Street View survey facts); only the drawing changes.
//  ?oldart shows the old procedural textures, for before/after checks.
//   - ground_tiles.png: 9 rows x 4 variants of 32 x 32 (one tile per 4 m cell): grass, lawn, walk, asph, sand, water, woods, marsh, farm
//   - materials.png (when present): grey walls and roofs, recoloured to each building's surveyed colour by tone
// =====================================================================
const ART = { on: /[?&]newart\b/.test(location.search),   /* Nov 26: off on the live site until Christian approves the new town art; ?newart previews it */ ground: null, mats: null, pats: new Map() };
const ART_ROWS = { grass: 0, yard: 0, lawn: 1, pitch: 1, walk: 2, asph: 3, sand: 4, water: 5, woods: 6, marsh: 7, farm: 8 };
function artLoad(src, cb) { const im = new Image(); im.onload = () => cb(im); im.src = src; }
if (ART.on) artLoad('assets/ui/ground_tiles.png', im => { ART.ground = im; for (const k in GTEX) delete GTEX[k]; if (typeof WPAT !== 'undefined') for (const k in WPAT) delete WPAT[k]; });

// ---------- ground: one 32 x 32 tile per cell ----------
const ART_TILE = {};
function artTile(kind, v) {
  const key = kind + v; if (ART_TILE[key]) return ART_TILE[key];
  const c = document.createElement('canvas'); c.width = c.height = 32;
  c.getContext('2d').drawImage(ART.ground, (v % 4) * 32, ART_ROWS[kind] * 32, 32, 32, 0, 0, 32, 32);
  return (ART_TILE[key] = c);
}
{ const _g = gtex; gtex = function (kind, v) { if (ART.ground && kind in ART_ROWS) return artTile(kind, v % 4); return _g(kind, v); }; }
{ const _d = drawTownTile; drawTownTile = function (x, y, sx, sy) {
  if (!ART.ground) return _d(x, y, sx, sy);
  const t = tAt(x, y); let kind = TKIND[t];
  if (kind === 'water' && WATERS.length) kind = 'grass';
  if (t === TL.BLDG) { const b = bAt(x, y); kind = b && PAVED_UNDER.has(b.type) ? 'walk' : 'yard'; }
  else if (ROAD_GROUND[y * TW + x]) kind = TKIND[ROAD_GROUND[y * TW + x] - 1];
  if (PHOTO_LAWN_SET.has(y * TW + x)) kind = 'lawn'; else if (PHOTO_ASPH_SET.has(y * TW + x)) kind = 'asph';
  if (kind === 'yard') kind = 'grass';
  if (!kind || !(kind in ART_ROWS)) return _d(x, y, sx, sy);
  const v = kind === 'water' ? ((frame >> 5) + x + y) % 4 : hash(x, y) % 4;
  let tex = gtex(kind, v); if (tex.width !== 32) tex = artTile(kind, v);   // through sky.js, so the seasons still recolour it
  ctx.drawImage(tex, 0, 0, 32, 32, sx, sy, T, T);
  if ((t === TL.PAVED || t === TL.PARKING) && !PHOTO_LAWN_SET.has(y * TW + x)) {
    const g = t2 => t2 === TL.GRASS || t2 === TL.YARD || t2 === TL.LAWN, E = '#8e8478';
    if (g(tAt(x, y - 1))) R(sx, sy, T, 2, E); if (g(tAt(x, y + 1))) R(sx, sy + T - 2, T, 2, E);
    if (g(tAt(x - 1, y))) R(sx, sy, 2, T, E); if (g(tAt(x + 1, y))) R(sx + T - 2, sy, 2, T, E);
  }
}; }

// ---------- streets, lots and sidewalks: the same tiles as world-anchored patterns ----------
function artPattern(kind, v) {
  const key = 'g' + kind + v; let p = ART.pats.get(key);
  if (!p) { p = ctx.createPattern(artTile(kind, v), 'repeat'); ART.pats.set(key, p); }
  p.setTransform(new DOMMatrix().translate(Math.round(-camX * T), Math.round(-camY * T)));   // anchored to the world, so it never swims
  return p;
}
const ART_STROKE = { '#5c5c62': 'asph', '#545458': 'asph', '#6a6a70': 'asph', '#cac4b6': 'walk' };
{ const _s = strokeLine; strokeLine = function (o, width, color, dash) {
  if (ART.ground && !dash && ART_STROKE[color]) return _s(o, width, artPattern(ART_STROKE[color], 0), dash);
  return _s(o, width, color, dash);
}; }

// ---------- walls and roofs: grey materials recoloured to each building's own (surveyed) colour ----------
const ART_MAT = { brick: 0, siding: 1, board: 2, ribbed: 3, stone: 4, stucco: 5, log: 6, panel: 7, shingle: 8, gravel: 9, seam: 10, tile: 11 };
const ART_STEP = { '-3': -0.5, '-2': -0.36, '-1': -0.2, '0': 0, '1': 0.16, '2': 0.3, '3': 0.42 };
if (ART.on) artLoad('assets/ui/materials.png', im => {
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data, n = c.width / 32; ART.mats = [];
  for (let k = 0; k < n; k++) {   // each tile: its tones 0-3 and the tone most of it is (that one gets the building's own colour)
    const t = new Uint8Array(32 * 32), cnt = [0, 0, 0, 0];
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const v = Math.round(d[(y * c.width + k * 32 + x) * 4] / 85); t[y * 32 + x] = v; cnt[v]++; }
    ART.mats.push({ t, main: cnt.indexOf(Math.max(...cnt)) });
  }
  PAT.clear();
});
{ const _p = pat; pat = function (kind, col) {
  if (!ART.mats || !(kind in ART_MAT) || !/^#[0-9a-f]{6}$/i.test(col || '')) return _p(kind, col);
  const key = 'A' + kind + col; let p = PAT.get(key); if (p) return p;
  const M = ART.mats[ART_MAT[kind]], c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'), img = g.createImageData(32, 32);
  const ramp = [0, 1, 2, 3].map(v => { const h = shade(col, ART_STEP[String(Math.max(-3, Math.min(3, v - M.main)))]), n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; });
  for (let i = 0; i < 1024; i++) { const r = ramp[M.t[i]]; img.data[i * 4] = r[0]; img.data[i * 4 + 1] = r[1]; img.data[i * 4 + 2] = r[2]; img.data[i * 4 + 3] = 255; }
  g.putImageData(img, 0, 0); p = ctx.createPattern(c, 'repeat'); PAT.set(key, p); return p;
}; }
