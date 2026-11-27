"use strict";
// =====================================================================
//  THE TOWN: real Antigo at 4 m per tile, from js/data/town.js (scripts/town/make_tiles.py).
//  Building outlines: OpenStreetMap + Microsoft US Building Footprints; lots: 2025 parcels.
// =====================================================================
const TL = { GRASS: 0, FARM: 1, WOODS: 2, WATER: 3, ROAD: 4, MAJOR: 5, PATH: 6, PARKING: 7, RAIL: 8, LAWN: 9, PITCH: 10, SAND: 11, BLDG: 12, YARD: 13, PAVED: 14, MARSH: 15 };   // MARSH (Nov 18): wet meadow and cattail marsh, from the photo and WiscLand 2
const SOLID = new Set([TL.WOODS, TL.WATER]);   // buildings block by their real outline (play.js), not by 4 m cell
const TW = TOWN.w, TH = TOWN.h;
let TT = null, TB = null;   // tile codes and building ids (0 = none)
(function decode() {
  const A = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_', ix = c => A.indexOf(c);
  TT = new Uint8Array(TW * TH); TB = new Uint16Array(TW * TH);
  TOWN.tiles.forEach((r, y) => { let x = 0; for (let i = 0; i < r.length; i += 3) { const v = ix(r[i]), n = ix(r[i + 1]) * 64 + ix(r[i + 2]); TT.fill(v, y * TW + x, y * TW + x + n); x += n; } });
  TOWN.bid.forEach((r, y) => { let x = 0; for (let i = 0; i < r.length; i += 5) { const v = ix(r[i]) * 4096 + ix(r[i + 1]) * 64 + ix(r[i + 2]), n = ix(r[i + 3]) * 64 + ix(r[i + 4]); TB.fill(v, y * TW + x, y * TW + x + n); x += n; } });
  TOWN.tiles = TOWN.bid = null;   // free the strings
})();
// a building: {type, face, door:[x,y]|null, name, addr, owner, okind, area, street}
const BLD = TOWN.B.map(([type, face, door, name, addr, owner, okind, area, street, polyQ, pclass, lh, lflat, rc, lid], i) => ({ id: i + 1, type, face, door, name: name.replace(/'S\b/g, "'s").replace(/\bBmo\b/g, 'BMO'), addr, owner, okind, area, street, polyQ, pclass, lh, lflat, rc, lid }));   // lh/lflat: 2017 lidar height and flat roof; rc: roof colour in the 2025 photo
// Buildings the WROC May 2025 photo shows are gone (Nov 18 check): the footprint is plain lawn, checked one by one on a photo
// sheet. 35 in all: houses, garages and sheds, none named in the game. Their ground goes back to the lawn around them.
(function goneBuildings() {
  const GONE = new Set([43, 981, 1311, 1388, 1719, 2008, 2068, 2125, 2401, 2557, 2926, 3107, 3118, 3174, 3331, 3365, 3590, 3676, 3789, 3933, 3957,
    3982, 4108, 4163, 4474, 4497, 4627, 4665, 4763, 5015, 5016, 5020, 5022, 5198, 5247]);   // indices into TOWN.B
  const cells = [];
  if (typeof FIX_GONE_BLD !== 'undefined') for (const b of FIX_GONE_BLD) GONE.add(b);   // hand corrections, js/data/fixes/
  for (let i = 0; i < TW * TH; i++) { const v = TB[i]; if (v && GONE.has(v - 1)) { TB[i] = 0; cells.push(i); } }
  for (const i of cells) { const x = i % TW, y = (i / TW) | 0, cnt = {};
    for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) { const t = tAt(x + k, y + j); if (t === TL.GRASS || t === TL.LAWN || t === TL.YARD) cnt[t] = (cnt[t] || 0) + 1; }
    const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; TT[i] = best ? +best[0] : TL.YARD; }
  for (const bi of GONE) if (BLD[bi]) { BLD[bi].gone = 1; BLD[bi].door = null; }
})();
// Buildings the May 2025 photo shows that the game lacked (Nov 18, js/data/newbldgs.js): 52 found by a roof search and checked
// one by one on photo sheets, and the new seven-building apartment complex measured off the photo. Unnamed and private.
(function newBuildings() {
  if (typeof NEWBLD === 'undefined') return;
  const inside = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const roads = (TOWN.V || []).filter(v => v[0] === 'road' || v[0] === 'major');
  for (const nb of NEWBLD) {
    const Q = nb.poly, P = []; for (let i = 0; i < Q.length; i += 2) P.push([Q[i], Q[i + 1]]);
    const cx = P.reduce((s, p) => s + p[0], 0) / P.length, cy = P.reduce((s, p) => s + p[1], 0) / P.length;
    let area = 0; for (let i = 0, j = P.length - 1; i < P.length; j = i++) area += (P[j][0] + P[i][0]) * (P[j][1] - P[i][1]); area = Math.abs(area / 2);
    let best = null;   // the front faces the nearest street
    for (const v of roads) { const R = v[2]; for (let i = 2; i < R.length; i += 2) { const ax = R[i - 2], ay = R[i - 1], dx = R[i] - ax, dy = R[i + 1] - ay, L2 = dx * dx + dy * dy || 1e-9;
      let t = ((cx - ax) * dx + (cy - ay) * dy) / L2; t = Math.max(0, Math.min(1, t)); const fx = ax + dx * t - cx, fy = ay + dy * t - cy, d = fx * fx + fy * fy; if (!best || d < best[0]) best = [d, fx, fy]; } }
    const face = !best ? 'S' : Math.abs(best[2]) >= Math.abs(best[1]) ? (best[2] > 0 ? 'S' : 'N') : (best[1] > 0 ? 'E' : 'W');
    const id = BLD.length + 1;
    BLD.push({ id, type: nb.type, face, door: null, name: nb.name || '', addr: nb.addr || '', owner: '', okind: nb.name ? 'business' : 'private', area: Math.round(area), street: '', polyQ: Q, pclass: '', lh: nb.h, lflat: nb.flat, rc: nb.rc, lid: 0, photoNew: 1 });
    const xs = P.map(p => p[0] / 4), ys = P.map(p => p[1] / 4); let n = 0;
    for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.max(...xs); x++) {
      if (x < 0 || y < 0 || x >= TW || y >= TH) continue; const i = y * TW + x, t = TT[i];
      if (TB[i] || t === TL.ROAD || t === TL.MAJOR || t === TL.WATER || !inside(P, (x + 0.5) * 4, (y + 0.5) * 4)) continue;
      TB[i] = id; TT[i] = TL.BLDG; n++; }
    if (!n) { const x = Math.floor(cx / 4), y = Math.floor(cy / 4), i = y * TW + x; if (!TB[i] && TT[i] !== TL.ROAD && TT[i] !== TL.MAJOR && TT[i] !== TL.WATER) { TB[i] = id; TT[i] = TL.BLDG; } }
  }
  if (typeof NEWSTREETS !== 'undefined') for (const S of NEWSTREETS) TOWN.V.push(['road', 7.0, S.flat(), '', 0, 0, '']);
  // the complex's grounds were farmland in the older crop data; the photo shows lawn between the buildings
  for (let y = Math.floor(2715 / 4); y <= 2895 / 4; y++) for (let x = Math.floor(1785 / 4); x <= 1962 / 4; x++) { const i = y * TW + x; if (TT[i] === TL.FARM || TT[i] === TL.WOODS) TT[i] = TL.LAWN; }
})();
(function bbox() {
  for (const b of BLD) { b.x0 = 1e9; b.y0 = 1e9; b.x1 = -1; b.y1 = -1; }
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) { const i = TB[y * TW + x]; if (!i) continue; const b = BLD[i - 1];
    if (x < b.x0) b.x0 = x; if (y < b.y0) b.y0 = y; if (x > b.x1) b.x1 = x; if (y > b.y1) b.y1 = y; }
})();
const DOORS = new Map(); for (const b of BLD) if (b.door) DOORS.set(b.door[1] * TW + b.door[0], b);
function tAt(x, y) { return x < 0 || y < 0 || x >= TW || y >= TH ? -1 : TT[y * TW + x]; }
function bAt(x, y) { const i = x < 0 || y < 0 || x >= TW || y >= TH ? 0 : TB[y * TW + x]; return i ? BLD[i - 1] : null; }
function townSolid(x, y) { const t = tAt(x, y); return t < 0 || SOLID.has(t); }
function walkNear(x, y) {   // nearest walkable tile (spiral)
  for (let r = 0; r < 30; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++)
    if (Math.max(Math.abs(dx), Math.abs(dy)) === r && !townSolid(x + dx, y + dy)) return [x + dx, y + dy];
  return [x, y];
}
const FDIR = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
function outsideDoor(b) { const [dx, dy] = FDIR[b.face] || [0, 1]; return walkNear(b.door[0] + dx, b.door[1] + dy); }

// ---------- the ground: each 4 m data cell is drawn as 16 px texture tiles (T / 16 a side) ----------
// small 16x16 textures, four variants each, painted once
const GTEX = {};
function gtex(kind, v) {
  const key = kind + v; if (GTEX[key]) return GTEX[key];
  const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d');
  const F = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); }, hh = i => hash(i * 7 + v * 131, i * 13 + kind.length * 17);
  const grassy = (base, dark, light) => { F(base, 0, 0, 16, 16);
    for (let i = 0; i < 9; i++) { const q = hh(i); F(dark, q % 15, (q >> 4) % 14, 1, 2); }
    for (let i = 0; i < 6; i++) { const q = hh(i + 40); F(light, q % 15, (q >> 5) % 15, 1, 1); }
    if (v === 3) { F('#f0e8a0', 4, 6, 1, 1); F('#e8a0b8', 11, 3, 1, 1); F('#f8f8f0', 8, 12, 1, 1); } };
  switch (kind) {
    case 'grass': grassy('#4f8a42', '#3e7234', '#6aa858'); break;
    case 'yard': grassy('#56924a', '#447a3a', '#74b062'); break;
    case 'lawn': grassy('#5c9a4c', '#4a823e', '#7aba66'); break;
    case 'farm': F('#a89a5a', 0, 0, 16, 16); for (let y = 1; y < 16; y += 4) { F('#8a7c44', 0, y, 16, 1); F('#bcae6c', 0, y + 2, 16, 1); } if (v % 2) F('#7a9a44', hh(1) % 14, 5, 2, 1); break;
    case 'woods': F('#2a542c', 0, 0, 16, 16); for (let i = 0; i < 5; i++) { const q = hh(i); g.fillStyle = i % 2 ? '#376a36' : '#30603a'; g.beginPath(); g.arc(q % 16, (q >> 4) % 16, 4 + q % 3, 0, 6.29); g.fill(); }
      F('rgba(255,255,255,.08)', hh(9) % 12, hh(8) % 12, 3, 2); break;
    case 'water': F('#3a6aa8', 0, 0, 16, 16); F('#4678b4', 0, (v * 4) % 16, 16, 1); F('rgba(255,255,255,.3)', hh(2) % 10, (v * 4 + 6) % 16, 5, 1); break;
    case 'walk': F('#bab4a8', 0, 0, 16, 16); F('#a69f92', 0, 15, 16, 1); F('#a69f92', 15, 0, 1, 16); F('#c8c2b6', 0, 0, 15, 1);
      if (v === 2) F('#aaa396', hh(3) % 12, hh(4) % 12, 3, 1); break;
    case 'asph': F('#66666c', 0, 0, 16, 16); for (let i = 0; i < 7; i++) { const q = hh(i); F(i % 2 ? '#5c5c62' : '#727278', q % 16, (q >> 4) % 16, 1, 1); } break;
    case 'sand': F('#c8b48a', 0, 0, 16, 16); for (let i = 0; i < 6; i++) { const q = hh(i); F('#b49e74', q % 15, (q >> 4) % 15, 2, 1); } break;
    case 'marsh': F('#9a8a5c', 0, 0, 16, 16); for (let i = 0; i < 9; i++) { const q = hh(i); F(i % 3 ? '#86774a' : '#b09e6a', q % 15, (q >> 4) % 13, 1, 3); }
      if (v % 2) { F('#5a4a2a', hh(7) % 14, hh(6) % 10, 1, 4); F('#6a4a28', hh(7) % 14, hh(6) % 10, 1, 1); } if (v === 3) F('rgba(60,90,110,.35)', hh(5) % 10, 12, 6, 2); break;   // cattails, a glint of water
    case 'pitch': F(v % 2 ? '#5ea446' : '#66ae4e', 0, 0, 16, 16); break;
    default: F('#000', 0, 0, 16, 16);
  }
  return (GTEX[key] = c);
}
const TKIND = { [TL.GRASS]: 'grass', [TL.YARD]: 'yard', [TL.LAWN]: 'lawn', [TL.FARM]: 'farm', [TL.WOODS]: 'woods', [TL.WATER]: 'water', [TL.ROAD]: 'walk', [TL.MAJOR]: 'walk',
  [TL.PARKING]: 'asph', [TL.PAVED]: 'asph', [TL.PATH]: 'grass', [TL.RAIL]: 'grass', [TL.SAND]: 'sand', [TL.PITCH]: 'lawn', [TL.MARSH]: 'marsh' };   // field tiles are plain mown lawn; the mowing stripes are drawn on the real field shapes (sports.js), not as 4 m steps
const PAVED_UNDER = new Set(['store', 'fig', 'civic', 'school', 'hospital', 'factory', 'apartments', 'church']);
// TERRAIN (Nov 12): the 2017 county lidar, one byte per 4 m cell: hillshade tone 0-6 (3 = flat) + 8 if the ground is steep.
// Shipped deflated (js/data/terrain.js) and unpacked once in the browser.
let TERR = null;
(async () => {
  if (typeof TERRAIN === 'undefined' || typeof DecompressionStream === 'undefined') return;
  try {
    const raw = Uint8Array.from(atob(TERRAIN.S), c => c.charCodeAt(0));
    const buf = await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer();
    if (buf.byteLength === TW * TH) TERR = new Uint8Array(buf);
  } catch (e) { TERR = null; }
})();
const NATURAL = new Set(['grass', 'woods', 'farm', 'lawn', 'yard', 'sand', 'marsh']);
// the hillshade is drawn as one smooth layer: a pixel per cell on a small canvas, scaled up with smoothing, so slopes read as
// soft light and shadow instead of 4 m squares. Steep banks get bare earth plus little ledges (per cell, pixel-art style).
let TCV = null, TCX = null;
function drawTerrainLayer(x0, y0, ox, oy) {
  if (!TERR) return;
  const cols = Math.ceil(SW / T) + 3, rows = Math.ceil(SH / T) + 3;
  if (!TCV || TCV.width !== cols || TCV.height !== rows) { TCV = document.createElement('canvas'); TCV.width = cols; TCV.height = rows; TCX = TCV.getContext('2d'); }
  const img = TCX.createImageData(cols, rows), d = img.data;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = x0 - 1 + i, y = y0 - 1 + j, o = (j * cols + i) * 4;
    if (x < 0 || y < 0 || x >= TW || y >= TH) continue;
    const kind = TKIND[tAt(x, y)]; if (kind === 'water') continue;
    const s = TERR[y * TW + x], tone = s & 7;
    if (s & 8 && NATURAL.has(kind)) { d[o] = 112; d[o + 1] = 88; d[o + 2] = 56; d[o + 3] = 105; continue; }
    if (tone < 3) { d[o] = 18; d[o + 1] = 28; d[o + 2] = 56; d[o + 3] = Math.round((3 - tone) * 0.075 * 255); }
    else if (tone > 3) { d[o] = 255; d[o + 1] = 246; d[o + 2] = 214; d[o + 3] = Math.round((tone - 3) * 0.06 * 255); }
  }
  TCX.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(TCV, Math.round(ox - T), Math.round(oy - T), cols * T, rows * T);
  ctx.imageSmoothingEnabled = false;
  for (let j = 1; j < rows - 1; j++) for (let i = 1; i < cols - 1; i++) {   // ledges on the steep banks
    const x = x0 - 1 + i, y = y0 - 1 + j; if (x < 0 || y < 0 || x >= TW || y >= TH) continue;
    if (!(TERR[y * TW + x] & 8) || !NATURAL.has(TKIND[tAt(x, y)])) continue;
    const sx = Math.round(ox + (i - 1) * T), sy = Math.round(oy + (j - 1) * T);
    for (let k = 0; k < 3; k++) R(sx + 2 + (hash(x, y + k) % 8), sy + 5 + k * 10, T - 12, 2, 'rgba(70,52,30,.45)');
  }
}
function drawTownTile(x, y, sx, sy) {
  const t = tAt(x, y); let kind = TKIND[t];
  if (kind === 'water' && WATERS.length) kind = 'grass';
  if (t === TL.BLDG) { const b = bAt(x, y); kind = b && PAVED_UNDER.has(b.type) ? 'walk' : 'yard'; }
  else if (ROAD_GROUND[y * TW + x]) kind = TKIND[ROAD_GROUND[y * TW + x] - 1];
  if (PHOTO_LAWN_SET.has(y * TW + x)) kind = 'lawn';   // the 2025 photo shows lawn here (js/data/lotfix.js)
  else if (PHOTO_ASPH_SET.has(y * TW + x)) kind = 'asph';   // or an asphalt drive
  if (kind === 'lawn' || kind === 'yard') kind = 'grass';   // one grass texture; mown lawn is a soft wash on top (drawGreenWash)
  if (!kind) { R(sx, sy, T, T, '#000'); return; }
  const n = Math.ceil(T / 16);   // 16 px textures; at T = 24 the last one in each row is cut to fit
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const v = kind === 'water' ? ((frame >> 5) + i + j * 3) % 4 : kind === 'pitch' ? (x * n + i) % 2 : hash(x * n + i, y * n + j) % 4;
    const w = Math.min(16, T - i * 16), h = Math.min(16, T - j * 16);
    ctx.drawImage(gtex(kind, v), 0, 0, w, h, sx + i * 16, sy + j * 16, w, h);
  }
  if ((t === TL.PAVED || t === TL.PARKING) && !PHOTO_LAWN_SET.has(y * TW + x)) {   // a concrete edge where a lot meets grass
    const g = t2 => t2 === TL.GRASS || t2 === TL.YARD || t2 === TL.LAWN, E = '#9a968e';
    if (g(tAt(x, y - 1))) R(sx, sy, T, 2, E); if (g(tAt(x, y + 1))) R(sx, sy + T - 2, T, 2, E);
    if (g(tAt(x - 1, y))) R(sx, sy, 2, T, E); if (g(tAt(x + 1, y))) R(sx + T - 2, sy, 2, T, E);
  }
}
function shade(hex, k) {   // lighten (k>0) or darken (k<0) a #rrggbb colour
  const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(c + k * (k > 0 ? 255 - c : c))));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('');
}
// labels for named places, drawn over the map near the camera
function drawTownLabels(cx, cy) {
  const seen = new Set(), placed = [];
  const list = [];
  for (let y = cy - 1; y < cy + SH / T + 3; y++) for (let x = cx - 1; x < cx + SW / T + 1; x++) {
    const b = bAt(x, y); if (!b || !b.name || seen.has(b.id) || !b.door) continue; seen.add(b.id); list.push(b);
  }
  list.sort((a, b) => (b.type === 'fig') - (a.type === 'fig') || (b.enter | 0) - (a.enter | 0) || b.area - a.area);   // the bookstore, then places you can go into, then big places
  ctx.font = SMALL;
  for (const b of list) {
    const h = bstyle(b).h, w = ctx.measureText(b.name).width + 6;
    let sx = (b.door[0] + 0.5 - camX) * T, sy = b.face === 'N' ? (b.pyMin - camY) * T - h - 12 : b.face === 'S' ? (b.pyMax - camY) * T - h - 12 : (b.door[1] - camY) * T - h - 4;
    sx = Math.max(w / 2 + 2, Math.min(SW - w / 2 - 2, sx)); sy = Math.max(2, Math.min(SH - 22, sy));   // Nov 27 (UX pass): a label never runs off the screen edge
    const r = [sx - w / 2, sy - 1, w, 10];
    if (placed.some(q => r[0] < q[0] + q[2] && q[0] < r[0] + r[2] && r[1] < q[1] + q[3] && q[1] < r[1] + r[3])) continue;
    placed.push(r); R(r[0], r[1], w, 9, 'rgba(10,12,30,.72)'); txt(b.name, sx, sy, b.type === 'fig' ? '#9fe0a0' : '#f0e8c8', 'center', SMALL);
  }
}
// ---------- streets, sidewalks, rail, streams and parking lots as smooth shapes (from OpenStreetMap centre lines) ----------
const VEC = (TOWN.V || []).map(([cl, w, Q, name, lanes, oneway, mk], vi) => { const P = [];
  if (cl === 'path' && typeof WALKFIX !== 'undefined' && WALKFIX[vi]) Q = WALKFIX[vi].P;   // moved onto the sidewalk the 2025 photo shows
  for (let i = 0; i < Q.length; i += 2) P.push([Q[i] / 4, Q[i + 1] / 4]);
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]); return { cl, w: w / 4, P, name, lanes: lanes || 0, oneway: !!oneway, mk: mk || '', x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; });
// Park trails the photo shows are gravel or dirt are cut out of their walk lines and drawn that colour (Nov 18).
(function gravelTrails() {
  if (typeof WALKFIX === 'undefined') return;
  const cut = (P, d0, d1) => { const out = []; let acc = 0;
    for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (!L) continue;
      const s0 = Math.max(d0, acc), s1 = Math.min(d1, acc + L);
      if (s1 > s0) { const pa = [a[0] + (b[0] - a[0]) * (s0 - acc) / L, a[1] + (b[1] - a[1]) * (s0 - acc) / L], pb = [a[0] + (b[0] - a[0]) * (s1 - acc) / L, a[1] + (b[1] - a[1]) * (s1 - acc) / L];
        if (!out.length) out.push(pa); out.push(pb); }
      acc += L; }
    return out; };
  const add = [];
  for (let vi = 0; vi < VEC.length; vi++) { const f = WALKFIX[vi], o = VEC[vi]; if (!f || !f.gravel || !f.gravel.length || o.cl !== 'path') continue;
    const total = o.P.reduce((s, p, i) => i ? s + Math.hypot(p[0] - o.P[i - 1][0], p[1] - o.P[i - 1][1]) : 0, 0), R = f.gravel.map(([a, b]) => [a / 4, b / 4]).sort((a, b) => a[0] - b[0]);
    let at = 0; const parts = [];
    for (const [a, b] of R) { if (a > at + 0.05) parts.push([at, a, '']); parts.push([a, Math.min(b, total), 'gravel']); at = Math.min(b, total); }
    if (at < total - 0.05) parts.push([at, total, '']);
    const full = o.P, first = parts.shift(); o.P = cut(full, first[0], first[1]); o.surf = first[2];
    for (const [a, b, sf] of parts) { const P = cut(full, a, b); if (P.length < 2) continue; add.push(Object.assign({}, o, { P, surf: sf })); }
  }
  for (const o of [...VEC.filter(o => o.surf !== undefined), ...add]) { const xs = o.P.map(p => p[0]), ys = o.P.map(p => p[1]); Object.assign(o, { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }); }
  VEC.push(...add);
})();
// Sidewalks linked up (Christian, Nov 18). The map's walks often stop a step short: at a driveway, at the walk they meet,
// or a metre shy of the curb. A loose end is carried on only straight ahead, the way a sidewalk runs: if another walk or a
// street lies dead ahead within 1.5 cells (6 m), the walk runs on to it; otherwise it stops square. (A first version joined
// ends sideways to whatever was nearest, which bent walks into V's that looked like tapering triangles, Christian, Nov 18.)
// Sharp V turns that came with the map data, a leg under 6 m folding back past 45 degrees, are clipped too.
(function linkWalks() {
  const W = VEC.filter(o => o.cl === 'path'), S = VEC.filter(o => o.cl === 'road' || o.cl === 'major' || o.cl === 'service');
  for (const o of W) { let P = o.P, again = true;   // clip folds: a vertex where the line turns back on itself
    while (again && P.length > 2) { again = false;
      for (let i = 1; i < P.length - 1; i++) { const a = P[i - 1], b = P[i], c = P[i + 1], ux = a[0] - b[0], uy = a[1] - b[1], vx = c[0] - b[0], vy = c[1] - b[1], lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
        if (!lu || !lv) { P.splice(i, 1); again = true; break; }
        const cos = (ux * vx + uy * vy) / (lu * lv); if (cos > 0.707 && Math.min(lu, lv) < 1.5) { P.splice(lu < lv ? i - (i > 1 ? 1 : 0) || i : i, 1); again = true; break; } } }
    o.P = P; }
  const rayHit = (e, ux, uy, P, reach) => {   // first crossing of the ray e + t*u (0 < t <= reach) with the polyline P
    let best = null; for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], dx = b[0] - a[0], dy = b[1] - a[1], den = ux * dy - uy * dx; if (Math.abs(den) < 1e-6) continue;
      const t = ((a[0] - e[0]) * dy - (a[1] - e[1]) * dx) / den, s2 = ((a[0] - e[0]) * uy - (a[1] - e[1]) * ux) / den;
      if (t > -0.05 && t <= reach && s2 >= -0.02 && s2 <= 1.02 && (!best || t < best)) best = Math.max(0, t); }
    return best; };
  for (const o of W) { o.cap = [0, 0]; for (const end of [0, 1]) {
    const P = o.P; if (P.length < 2) continue;
    const e = end ? P[P.length - 1] : P[0]; let k = end ? P.length - 2 : 1, f = P[k];
    while (Math.hypot(f[0] - e[0], f[1] - e[1]) < 0.5 && k > 0 && k < P.length - 1) { k += end ? -1 : 1; f = P[k]; }
    const L = Math.hypot(e[0] - f[0], e[1] - f[1]); if (!L) continue; const ux = (e[0] - f[0]) / L, uy = (e[1] - f[1]) / L;
    let to = null, kind = 0, tBest = 1e9;
    for (const q of W) { if (e[0] < q.x0 - 2 || e[0] > q.x1 + 2 || e[1] < q.y0 - 2 || e[1] > q.y1 + 2) continue;
      const QP = q === o ? (end ? q.P.slice(0, -2) : q.P.slice(2)) : q.P; if (QP.length < 2) continue;
      const t = rayHit(e, ux, uy, QP, 1.5); if (t !== null && t < tBest) { tBest = t; kind = 1; }
      if (q !== o) for (const p of [q.P[0], q.P[q.P.length - 1]]) {   // a walk that carries on in line, offset by less than a walk's width
        const along = (p[0] - e[0]) * ux + (p[1] - e[1]) * uy, side = Math.abs((p[0] - e[0]) * -uy + (p[1] - e[1]) * ux);
        if (along > 0 && along < 1.5 && side < o.w * 0.6 && along + o.w / 2 < tBest) { tBest = along + o.w / 2; kind = 1; } } }
    for (const q of S) { if (e[0] < q.x0 - 3 || e[0] > q.x1 + 3 || e[1] < q.y0 - 3 || e[1] > q.y1 + 3) continue;
      const t = rayHit(e, ux, uy, q.P, q.w / 2 + 1.5); if (t !== null && t < tBest) { tBest = t; kind = 2; } }
    if (kind) { to = [e[0] + ux * tBest, e[1] + uy * tBest];
      for (let t = 0.1; t <= 1; t += 0.1) { const cx = Math.floor(e[0] + (to[0] - e[0]) * t), cy = Math.floor(e[1] + (to[1] - e[1]) * t);
        if (cx >= 0 && cy >= 0 && cx < TW && cy < TH && TB[cy * TW + cx]) { to = null; kind = 0; break; } } }   // never lay a link through a building
    if (to && tBest > 0.02) { if (end) P.push(to); else P.unshift(to); o.linked = (o.linked || 0) + 1; }
    o.cap[end] = kind;   // 1: meets a walk (rounded), 2: runs under a street, 0: stops on its own (square)
  } const xs = o.P.map(p => p[0]), ys = o.P.map(p => p[1]); o.x0 = Math.min(...xs); o.x1 = Math.max(...xs); o.y0 = Math.min(...ys); o.y1 = Math.max(...ys); }
  for (const o of W) for (const end of [0, 1]) { const e = end ? o.P[o.P.length - 1] : o.P[0]; if (W.some(q => q !== o && (Math.hypot(q.P[0][0] - e[0], q.P[0][1] - e[1]) < 0.05 || Math.hypot(q.P[q.P.length - 1][0] - e[0], q.P[q.P.length - 1][1] - e[1]) < 0.05))) o.cap[end] = 1; }
})();
// Lots checked against the 2025 photo (Christian, Nov 18: "that grey asphalt area is all uneven, is that accurate?").
// These 48 traced "lots" are thin strips along streets that the photo shows are grass terraces, sidewalks, road shoulders
// or the edge of a street whose map line sits a few metres off; they are left out, and the pavement tiles under them
// go back to the ground around them. Every lot that stays has its outline cleaned of the tracer's jitter and spikes.
const PK_FALSE2 = new Set(typeof LOTFIX_GONE !== 'undefined' ? LOTFIX_GONE : []);   // Nov 18 second check: woods, marsh, quarry (js/data/lotfix.js)
const PK_FALSE = new Set([76, 132, 190, 213, 228, 237, 244, 342, 364, 386, 390, 552, 560, 570, 571, 575, 590, 592, 595, 605, 620, 621, 661, 666, 682, 686, 688,
  693, 698, 702, 704, 705, 706, 725, 728, 744, 748, 752, 754, 762, 779, 780, 806, 810, 813, 815, 820, 824]);
function pkSmooth(P) {
  // 1. spikes: a vertex whose two edges fold back on each other (a sliver under 1.2 m wide) goes
  let Q = P.slice(), changed = true;
  while (changed && Q.length > 4) { changed = false;
    for (let i = 0; i < Q.length && Q.length > 4; i++) { const a = Q[(i - 1 + Q.length) % Q.length], b = Q[i], c = Q[(i + 1) % Q.length];
      const ux = a[0] - b[0], uy = a[1] - b[1], vx = c[0] - b[0], vy = c[1] - b[1], la = Math.hypot(ux, uy), lc = Math.hypot(vx, vy);
      const cos = (ux * vx + uy * vy) / ((la * lc) || 1), area2 = Math.abs(ux * vy - uy * vx);
      if ((cos > 0.5 && area2 / Math.max(la, lc) < 0.3) || la < 0.08) { Q.splice(i, 1); changed = true; i--; } } }
  // 2. jitter: Douglas-Peucker at 0.6 cells (2.4 m: the tracer stepped in 4 m blocks), on the closed ring
  const dp = (pts, eps) => { if (pts.length < 3) return pts; const [a, b] = [pts[0], pts[pts.length - 1]]; let md = 0, mi = 0;
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-9;
    for (let i = 1; i < pts.length - 1; i++) { const d = Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / L; if (d > md) { md = d; mi = i; } }
    return md > eps ? dp(pts.slice(0, mi + 1), eps).slice(0, -1).concat(dp(pts.slice(mi), eps)) : [a, b]; };
  let far = 0; for (let i = 1; i < Q.length; i++) if (Math.hypot(Q[i][0] - Q[0][0], Q[i][1] - Q[0][1]) > Math.hypot(Q[far][0] - Q[0][0], Q[far][1] - Q[0][1])) far = i;
  const R1 = dp(Q.slice(0, far + 1), 0.6), R2 = dp(Q.slice(far).concat([Q[0]]), 0.6), out = R1.slice(0, -1).concat(R2.slice(0, -1));
  return out.length >= 3 ? out : P;
}
// Clean, finished lot outlines (Christian, Nov 19: "these are the kind of inconsistencies you need to automate ... make them look clean
// and finished"). Each lot is redrawn on a 1 m grid turned to the lot's own main direction: notches and wedges narrower than 7 m
// are filled where the 2025 photo shows pavement (or the tiles are pavement), spikes and slivers under 2.5 m go, and the outline is
// traced back as straight runs, so lots read as clean rectangles and L-shapes instead of zig-zags.
const PK_ASPH = new Set(typeof PHOTO_ASPH !== 'undefined' ? PHOTO_ASPH : []);
function pkClean(P) {
  if (P.length < 4) return P;
  let sx = 0, sy = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), q = Math.atan2(b[1] - a[1], b[0] - a[0]) * 4; sx += L * Math.cos(q); sy += L * Math.sin(q); }
  const th = Math.atan2(sy, sx) / 4, c = Math.cos(th), s = Math.sin(th);
  const rot = ([x, y]) => [(x * c + y * s) * 4, (-x * s + y * c) * 4], unrot = ([u, v]) => [(u * c - v * s) / 4, (u * s + v * c) / 4];   // cells <-> metres in the lot's frame
  const R = P.map(rot), us = R.map(p => p[0]), vs = R.map(p => p[1]), pad = 6, u0 = Math.floor(Math.min(...us)) - pad, v0 = Math.floor(Math.min(...vs)) - pad;
  const W = Math.ceil(Math.max(...us)) - u0 + pad, H = Math.ceil(Math.max(...vs)) - v0 + pad; if (W * H > 90000 || W < 8 || H < 8) return P;
  const g = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) { const v = v0 + j + 0.5, xs = []; for (let i = 0, k = R.length - 1; i < R.length; k = i++) { const [ua, va] = R[i], [ub, vb] = R[k]; if ((va > v) !== (vb > v)) xs.push(ua + (v - va) * (ub - ua) / (vb - va)); }
    xs.sort((a, b) => a - b); for (let q = 0; q + 1 < xs.length; q += 2) for (let i = Math.max(0, Math.ceil(xs[q] - u0 - 0.5)); i < W && u0 + i + 0.5 < xs[q + 1]; i++) g[j * W + i] = 1; }
  let area0 = 0; for (let i = 0; i < g.length; i++) area0 += g[i]; if (area0 < 60) return P;
  const morph = (a, r, dil) => { const t = new Uint8Array(W * H), o = new Uint8Array(W * H);   // square structuring element, separable
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { let v = dil ? 0 : 1; for (let d = -r; d <= r; d++) { const x = i + d, b = x < 0 || x >= W ? 0 : a[j * W + x]; if (dil ? b : !b) { v = dil ? 1 : 0; break; } } t[j * W + i] = v; }
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { let v = dil ? 0 : 1; for (let d = -r; d <= r; d++) { const y = j + d, b = y < 0 || y >= H ? 0 : t[y * W + i]; if (dil ? b : !b) { v = dil ? 1 : 0; break; } } o[j * W + i] = v; } return o; };
  { const near = morph(g, 5, true); for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i; if (!near[k] || g[k]) continue;   // asphalt tiles right at the lot's edge join it
      const [x, y] = unrot([u0 + i + 0.5, v0 + j + 0.5]), cx = Math.floor(x), cy = Math.floor(y), t = TT[cy * TW + cx]; if (t === TL.PARKING || (t === TL.PAVED && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => TT[(cy + b) * TW + cx + a] === TL.BLDG))) g[k] = 1; } }
  const cl = morph(morph(g, 4, true), 4, false);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i; if (cl[k] && !g[k]) { const [x, y] = unrot([u0 + i + 0.5, v0 + j + 0.5]), cx = Math.floor(x), cy = Math.floor(y), t = TT[cy * TW + cx];
    if (!(PK_ASPH.has(cy * TW + cx) || t === TL.PAVED || t === TL.PARKING)) cl[k] = 0; } }
  const op = morph(morph(cl, 1, false), 1, true);
  let area1 = 0; for (let i = 0; i < op.length; i++) area1 += op[i]; if (area1 < area0 * 0.6) return P;
  // outer boundary of the cells, as a ring of grid corners (clockwise), then straight runs
  const on = (i, j) => i >= 0 && j >= 0 && i < W && j < H && op[j * W + i] === 1, nxt = new Map();
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (on(i, j)) {
    if (!on(i, j - 1)) nxt.set(i + ',' + j, [i + 1, j]); if (!on(i + 1, j)) nxt.set((i + 1) + ',' + j, [i + 1, j + 1]);
    if (!on(i, j + 1)) nxt.set((i + 1) + ',' + (j + 1), [i, j + 1]); if (!on(i - 1, j)) nxt.set(i + ',' + (j + 1), [i, j]); }
  let best = null; const seen = new Set();
  for (const k0 of nxt.keys()) { if (seen.has(k0)) continue; const ring = []; let k = k0, n = 0;
    while (!seen.has(k) && n++ < 40000) { seen.add(k); const [i, j] = k.split(',').map(Number); ring.push([i, j]); const q = nxt.get(k); if (!q) break; k = q[0] + ',' + q[1]; }
    let a = 0; for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; a += p[0] * q[1] - q[0] * p[1]; }
    if (!best || Math.abs(a) > best.a) best = { ring, a: Math.abs(a) }; }
  if (!best || best.ring.length < 4) return P;
  let ring = best.ring.filter((p, i, A) => { const a = A[(i - 1 + A.length) % A.length], b = A[(i + 1) % A.length]; return (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]) !== 0; });
  // steps of 1-2 m along a slanted edge become one straight slant; runs of 3 m or more stay square
  const dp = (pts, eps) => { if (pts.length < 3) return pts; const a = pts[0], b = pts[pts.length - 1]; let md = 0, mi = 0; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-9;
    for (let i = 1; i < pts.length - 1; i++) { const d = Math.abs((pts[i][0] - a[0]) * dy - (pts[i][1] - a[1]) * dx) / L; if (d > md) { md = d; mi = i; } }
    return md > eps ? dp(pts.slice(0, mi + 1), eps).slice(0, -1).concat(dp(pts.slice(mi), eps)) : [a, b]; };
  let far = 0; for (let i = 1; i < ring.length; i++) if (Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]) > Math.hypot(ring[far][0] - ring[0][0], ring[far][1] - ring[0][1])) far = i;
  const out = dp(ring.slice(0, far + 1), 1.6).slice(0, -1).concat(dp(ring.slice(far).concat([ring[0]]), 1.6).slice(0, -1));
  // a slanted run becomes two square runs: the corner goes outward where the photo shows pavement there, inward otherwise
  const inRing = (A, x, y) => { let c = false; for (let i = 0, k = A.length - 1; i < A.length; k = i++) { const [xi, yi] = A[i], [xk, yk] = A[k]; if ((yi > y) !== (yk > y) && x < (xk - xi) * (y - yi) / (yk - yi) + xi) c = !c; } return c; };
  const paved = (i, j) => { const [x, y] = unrot([u0 + i, v0 + j]), cx = Math.floor(x), cy = Math.floor(y), t = TT[cy * TW + cx]; return PK_ASPH.has(cy * TW + cx) || t === TL.PAVED || t === TL.PARKING; };
  const sq = []; for (let k = 0; k < out.length; k++) { const a = out[k], b = out[(k + 1) % out.length], du = b[0] - a[0], dv = b[1] - a[1]; sq.push(a);
    if (Math.abs(du) > 1.5 && Math.abs(dv) > 1.5) { const c1 = [a[0], b[1]], c2 = [b[0], a[1]], t1 = [(a[0] + b[0] + c1[0]) / 3, (a[1] + b[1] + c1[1]) / 3];
      const c1out = !inRing(out, t1[0], t1[1]), outC = c1out ? c1 : c2, inC = c1out ? c2 : c1, to = [(a[0] + b[0] + outC[0]) / 3, (a[1] + b[1] + outC[1]) / 3];
      sq.push(paved(to[0], to[1]) ? outC : inC); } }
  let sa = 0; for (let i = 0; i < sq.length; i++) { const p = sq[i], q = sq[(i + 1) % sq.length]; sa += p[0] * q[1] - q[0] * p[1]; }
  const fin = Math.abs(sa) / 2 > area1 * 0.6 ? sq : out;
  return fin.length >= 3 ? fin.map(([i, j]) => unrot([u0 + i, v0 + j])) : P;
}
window.PK_CLEAN = { n: 0 };
const PARKS = [];
(TOWN.PK || []).forEach((Q, idx) => { let P = []; for (let i = 0; i < Q.length; i += 2) P.push([Q[i] / 4, Q[i + 1] / 4]);
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]), bb = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  if (PK_FALSE2.has(idx)) {   // each tile set to what the photo shows there
    for (let y = Math.floor(bb.y0); y <= bb.y1; y++) for (let x = Math.floor(bb.x0); x <= bb.x1; x++) { const i = y * TW + x, t = TT[i], v = LOTFIX_TILES[i];
      if (v !== undefined && t !== TL.BLDG && t !== TL.ROAD && t !== TL.MAJOR && t !== TL.WATER && t !== TL.PATH) TT[i] = v; }
    return; }
  if (PK_FALSE.has(idx)) {   // back to the ground around it: the commonest non-pavement tile on the strip's edge
    const inside = (x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
    const cnt = {}; for (let y = Math.floor(bb.y0) - 1; y <= bb.y1 + 1; y++) for (let x = Math.floor(bb.x0) - 1; x <= bb.x1 + 1; x++) { const t = tAt(x, y); if (t === TL.GRASS || t === TL.LAWN || t === TL.YARD) cnt[t] = (cnt[t] || 0) + 1; }
    const fill = +(Object.entries(cnt).sort((a, b) => b[1] - a[1])[0] || [TL.GRASS])[0];
    for (let y = Math.floor(bb.y0); y <= bb.y1; y++) for (let x = Math.floor(bb.x0); x <= bb.x1; x++) { const t = tAt(x, y); if ((t === TL.PAVED || t === TL.PARKING) && inside(x + 0.5, y + 0.5)) TT[y * TW + x] = fill; }
    return; }
  P = pkSmooth(P); try { const Q = pkClean(P); if (Q !== P) { P = Q; PK_CLEAN.n++; const xs = P.map(p => p[0]), ys = P.map(p => p[1]); Object.assign(bb, { x0: Math.min(bb.x0, ...xs), x1: Math.max(bb.x1, ...xs), y0: Math.min(bb.y0, ...ys), y1: Math.max(bb.y1, ...ys) }); } } catch (e) {} PARKS.push(Object.assign({ P }, bb)); });
// Lone pavement tiles at the street's edge: one or two 4 m pavement cells touching a street, outside any lot and not part of
// a driveway, are where the old 4 m road mask overshot the street's drawn line. They showed as grey squares on curb
// corners (Anderson Drive, Nov 18), so they become the ground beside them. Driveway aprons run on into a driveway and stay.
(function looseTiles() {
  const pave = t => t === TL.PAVED || t === TL.PARKING, road = t => t === TL.ROAD || t === TL.MAJOR;
  const inLot = (x, y) => PARKS.some(k => x >= k.x0 - 0.5 && x <= k.x1 + 0.5 && y >= k.y0 - 0.5 && y <= k.y1 + 0.5);
  const seen = new Uint8Array(TW * TH); let n = 0;
  for (let y = 1; y < TH - 1; y++) for (let x = 1; x < TW - 1; x++) {
    const i = y * TW + x; if (seen[i] || !pave(TT[i])) continue;
    const cl = [[x, y]]; seen[i] = 1;
    for (let q = 0; q < cl.length && cl.length <= 3; q++) { const [cx, cy] = cl[q]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (cy + dy) * TW + cx + dx; if (!seen[j] && pave(TT[j])) { seen[j] = 1; cl.push([cx + dx, cy + dy]); } } }
    // grow on to 6 tiles: a scrap of pavement that small, off by itself (no street, no building beside it), is a tracing leftover
    for (let q = 0; q < cl.length && cl.length <= 6; q++) { const [cx, cy] = cl[q]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (cy + dy) * TW + cx + dx; if (!seen[j] && pave(TT[j])) { seen[j] = 1; cl.push([cx + dx, cy + dy]); } } }
    if (cl.length > 6) continue;
    const touchRoad = cl.some(([cx, cy]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => road(tAt(cx + dx, cy + dy))));
    const touchBld = cl.some(([cx, cy]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => bAt(cx + dx, cy + dy)));
    if (cl.length > 2 && (touchRoad || touchBld)) continue;
    if (cl.length <= 2 && !touchRoad && touchBld) continue;
    if (cl.some(([cx, cy]) => inLot(cx + 0.5, cy + 0.5)) || cl.some(([cx, cy]) => bAt(cx, cy))) continue;
    for (const [cx, cy] of cl) { const cnt = {}; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const t = tAt(cx + dx, cy + dy); if (t === TL.GRASS || t === TL.LAWN || t === TL.YARD || t === TL.WOODS || t === TL.MARSH) cnt[t] = (cnt[t] || 0) + 1; }
      const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; if (best) { TT[cy * TW + cx] = +best[0]; n++; } }
  }
  window.LOOSE_TILES = n;
})();
// Road-grid squares that no street covers (Christian, Nov 18: "some of the sidewalks are triangle shapes that get narrower
// until the grass takes over, that's not how sidewalks work"). The old 4 m road grid runs wider than the drawn streets, and
// its leftover squares were painted as concrete slabs; along slanted and curving streets they stepped into sawtooth wedges.
// Real sidewalks come from the mapped walk lines. So a road square outside every street's width becomes the ground beside
// it, except in front of shops, offices, churches and schools, where the wide walk from curb to door is real.
const PHOTO_LAWN_SET = new Set(typeof PHOTO_LAWN !== 'undefined' ? PHOTO_LAWN : []), PHOTO_ASPH_SET = new Set(typeof PHOTO_ASPH !== 'undefined' ? PHOTO_ASPH : []);
const ROAD_GROUND = new Uint8Array(TW * TH);   // road squares drawn as the ground beside them (tile + 1; 0 = drawn as before)
(function roadFringe() {
  const under = new Uint8Array(TW * TH);
  for (const o of VEC) { if (o.cl !== 'road' && o.cl !== 'major' && o.cl !== 'service' && o.cl !== 'path') continue; const r = o.w / 2 + (o.cl === 'path' ? 0.25 : 0.4);
    for (let i = 1; i < o.P.length; i++) { const a = o.P[i - 1], b = o.P[i], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1e-9;
      for (let y = Math.floor(Math.min(a[1], b[1]) - r); y <= Math.max(a[1], b[1]) + r; y++) for (let x = Math.floor(Math.min(a[0], b[0]) - r); x <= Math.max(a[0], b[0]) + r; x++) {
        if (x < 0 || y < 0 || x >= TW || y >= TH) continue; const cx = x + 0.5, cy = y + 0.5; let t = ((cx - a[0]) * dx + (cy - a[1]) * dy) / L2; t = Math.max(0, Math.min(1, t));
        if (Math.hypot(cx - a[0] - dx * t, cy - a[1] - dy * t) < r) under[y * TW + x] = 1; } } }
  const shopNear = (x, y) => { for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const b = bAt(x + i, y + j); if (b && PAVED_UNDER.has(b.type)) return true; } return false; };
  let n = 0;
  for (let y = 1; y < TH - 1; y++) for (let x = 1; x < TW - 1; x++) { const i = y * TW + x, t = TT[i];
    if ((t !== TL.ROAD && t !== TL.MAJOR) || under[i] || shopNear(x, y)) continue;
    const cnt = {}; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1], [2, 0], [-2, 0], [0, 2], [0, -2]]) { const u = tAt(x + dx, y + dy); if (u === TL.GRASS || u === TL.LAWN || u === TL.YARD || u === TL.FARM) cnt[u] = (cnt[u] || 0) + 1; }
    const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; TT[i] = best ? +best[0] : TL.GRASS; n++; }
  window.ROAD_FRINGE = n;
  // and the road squares a street only partly covers: what shows past the curb is the ground, not a strip of slabs
  for (let y = 1; y < TH - 1; y++) for (let x = 1; x < TW - 1; x++) { const i = y * TW + x, t = TT[i]; if ((t !== TL.ROAD && t !== TL.MAJOR) || shopNear(x, y)) continue;
    const cnt = {}; for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) { const u = tAt(x + k, y + j); if (u === TL.GRASS || u === TL.LAWN || u === TL.YARD || u === TL.FARM) cnt[u] = (cnt[u] || 0) + 1; }
    const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; ROAD_GROUND[i] = best ? +best[0] + 1 : TL.GRASS + 1; }
})();
// lakes, ponds and the wide stretches of Spring Brook as smooth outlines (OpenStreetMap), drawn over the tiles
// Water checked against the WROC May 2025 photo (Nov 18): two "ponds" by the parking lots at the south-east edge are dry
// grassy stormwater swales, so they are left out and their cells go back to grass; one pond's outline was about three times
// the open water the photo shows (the rest is dry marsh), so its shore is traced from the photo.
// Spring Brook's open water along the trail, traced off the 2025 photo (Christian, Nov 18: "you have the wetlands and
// boardwalk as just more trail and parking lots"); the map had only a 5 m stream line through 20-30 m of water.
if (typeof SPRINGWATER !== 'undefined') for (const P of SPRINGWATER) TOWN.WA.push([P.flat()]);
const WA_DRY = new Set([21, 22]), WA_SHORE = { 6: [1715.3, 2069.7, 1713.2, 2068.8, 1711.0, 2069.1, 1708.6, 2067.5, 1707.4, 2065.4, 1703.7, 2063.6, 1702.5, 2061.8, 1700.8, 2061.3, 1700.8, 2056.7, 1701.7, 2055.2, 1701.7, 2051.9, 1701.1, 2050.9, 1702.0, 2049.4, 1702.0, 2044.8, 1703.6, 2039.4, 1706.3, 2035.7, 1706.9, 2032.6, 1706.3, 2031.4, 1709.8, 2025.5, 1713.5, 2024.0, 1716.5, 2024.6, 1718.3, 2024.0, 1720.2, 2024.9, 1721.1, 2024.3, 1722.9, 2024.6, 1724.4, 2023.7, 1727.2, 2025.5, 1728.1, 2024.9, 1730.2, 2025.5, 1731.0, 2027.5, 1735.0, 2030.5, 1736.5, 2035.1, 1735.9, 2036.3, 1736.5, 2037.5, 1736.2, 2040.0, 1733.1, 2046.1, 1732.2, 2051.5, 1729.8, 2055.2, 1727.0, 2057.6, 1726.4, 2059.5, 1724.3, 2060.7, 1724.6, 2063.1, 1724.0, 2064.3, 1720.5, 2067.2, 1715.3, 2069.7] };
(function fixWater() {
  const inside = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const ring = Q => { const P = []; for (let i = 0; i < Q.length; i += 2) P.push([Q[i] / 4, Q[i + 1] / 4]); return P; };
  for (const [wi, keep] of [...[...WA_DRY].map(i => [i, null]), ...Object.entries(WA_SHORE).map(([i, Q]) => [+i, ring(Q)])]) {
    const old = ring(TOWN.WA[wi][0]), xs = old.map(p => p[0]), ys = old.map(p => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.max(...xs); x++)
      if (tAt(x, y) === TL.WATER && inside(old, x + 0.5, y + 0.5) && !(keep && inside(keep, x + 0.5, y + 0.5))) TT[y * TW + x] = TL.GRASS;
    if (keep) for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.max(...xs); x++)
      if (inside(keep, x + 0.5, y + 0.5)) TT[y * TW + x] = TL.WATER;
  }
})();
(function springTiles() {   // water tiles under the traced brook, and the town-wide marsh and stray-pavement fixes (js/data/lotfix.js)
  const inside = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  if (typeof LOTFIX_EXTRA !== 'undefined') for (const k in LOTFIX_EXTRA) { const i = +k, t = TT[i]; if (t !== TL.BLDG && t !== TL.ROAD && t !== TL.MAJOR && t !== TL.WATER && t !== TL.PATH && !TB[i]) TT[i] = LOTFIX_EXTRA[k]; }
  if (typeof SPRINGWATER !== 'undefined') for (const Pm of SPRINGWATER) { const P = Pm.map(([x, y]) => [x / 4, y / 4]), xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.max(...xs); x++) { const i = y * TW + x; if (TT[i] !== TL.ROAD && TT[i] !== TL.MAJOR && !TB[i] && inside(P, x + 0.5, y + 0.5)) TT[i] = TL.WATER; } }
})();
const WATERS = (TOWN.WA || []).map((rings, wi) => WA_DRY.has(wi) ? null : WA_SHORE[wi] ? [WA_SHORE[wi]] : rings).filter(Boolean).map(rings => { const R = rings.map(Q => { const P = []; for (let i = 0; i < Q.length; i += 2) P.push([Q[i] / 4, Q[i + 1] / 4]); return P; });
  const xs = R[0].map(p => p[0]), ys = R[0].map(p => p[1]); return { R, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; });
let WPAT = [];
function waterPattern(v) {   // the 16 px water texture as a repeating fill, anchored to the world so it does not slide with the camera
  if (!WPAT[v]) WPAT[v] = ctx.createPattern(gtex('water', v), 'repeat');
  const p = WPAT[v]; p.setTransform(new DOMMatrix().translateSelf(-Math.round(camX * T) % 16, -Math.round(camY * T) % 16)); return p;
}
function drawWaters() {
  const shapes = WATERS.filter(w => onScreen(w, 2)); if (!shapes.length) return;
  const path = () => { ctx.beginPath(); for (const w of shapes) for (const P of w.R) { P.forEach((p, i) => { const X = (p[0] - camX) * T, Y = (p[1] - camY) * T; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); } };
  ctx.lineJoin = 'round';
  path(); ctx.strokeStyle = '#7a6a48'; ctx.lineWidth = 7; ctx.stroke();          // a muddy bank
  ctx.strokeStyle = '#b8a878'; ctx.lineWidth = 4; ctx.stroke();                  // sand at the waterline
  ctx.fillStyle = waterPattern((frame >> 5) % 4); ctx.fill('evenodd');
  ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1; ctx.stroke();
}
function onScreen(o, m) { return o.x1 >= camX - m && o.x0 <= camX + SW / T + m && o.y1 >= camY - m && o.y0 <= camY + SH / T + m; }
// a line drawn d metres to the side of a street's centre line (positive = right of the direction it was drawn)
function strokeOffset(o, d, color, width, dash) {
  const P = o.P, n = P.length, off = d / 4, Q = [];
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    Q.push([P[i][0] - dy / L * off, P[i][1] + dx / L * off]);
  }
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.beginPath();
  Q.forEach((p, i) => { const X = Math.round((p[0] - camX) * T) + 0.5, Y = Math.round((p[1] - camY) * T) + 0.5; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
  ctx.stroke(); ctx.setLineDash([]);
}
function strokeLine(o, width, color, dash) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []); ctx.beginPath();
  o.P.forEach((p, i) => { const X = (p[0] - camX) * T, Y = (p[1] - camY) * T; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke();
}
function drawStreets() {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const k of PARKS) if (onScreen(k, 2)) {
    ctx.fillStyle = typeof ART !== 'undefined' && ART.ground ? artPattern('asph', 1) : '#62626a'; ctx.beginPath(); k.P.forEach((p, i) => { const X = (p[0] - camX) * T, Y = (p[1] - camY) * T; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#9a968e'; ctx.lineWidth = 3; ctx.stroke();
  }
  const vis = VEC.filter(o => onScreen(o, 4));
  for (const o of vis) if (o.cl === 'stream') { strokeLine(o, o.w * T + 5, '#7a6a48'); strokeLine(o, o.w * T + 2, '#b8a878'); }
  drawWaters();
  for (const o of vis) if (o.cl === 'stream') { ctx.strokeStyle = waterPattern((frame >> 5) % 4); ctx.lineWidth = o.w * T; ctx.beginPath(); o.P.forEach((p, i) => { const X = (p[0] - camX) * T, Y = (p[1] - camY) * T; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); }
  // sidewalks and paths: every edge first, then every surface, so where two walks meet they join into one
  // (drawing each walk's edge and surface in turn left an edge line and a round end cap over the walk beside it)
  ctx.lineCap = 'butt';
  const walkEnds = (o, r, c) => { ctx.fillStyle = c; for (const end of [0, 1]) if (o.cap[end] === 1) { const e = end ? o.P[o.P.length - 1] : o.P[0]; ctx.beginPath(); ctx.arc((e[0] - camX) * T, (e[1] - camY) * T, r, 0, 7); ctx.fill(); } };
  const walks = vis.filter(o => o.cl === 'path');
  const WEDGE = o => o.surf === 'gravel' ? '#a08a68' : '#a8a294', WFILL = o => o.surf === 'gravel' ? '#c4ad8a' : '#cac4b6';   // gravel and dirt trails tan
  for (const o of walks) { strokeLine(o, o.w * T + 4, WEDGE(o)); walkEnds(o, o.w * T / 2 + 2, WEDGE(o)); }
  for (const o of walks) { strokeLine(o, o.w * T, WFILL(o)); walkEnds(o, o.w * T / 2, WFILL(o)); }
  // a square end gets its edge line across the slab too
  ctx.strokeStyle = '#a8a294'; ctx.lineWidth = 2;
  for (const o of walks) for (const end of [0, 1]) if (!o.cap[end] && o.P.length > 1) { const P = o.P, e = end ? P[P.length - 1] : P[0], f = end ? P[P.length - 2] : P[1];
    const dx = e[0] - f[0], dy = e[1] - f[1], L = Math.hypot(dx, dy) || 1, h = o.w / 2, nx = -dy / L * h, ny = dx / L * h, X = (e[0] - camX) * T, Y = (e[1] - camY) * T;
    ctx.beginPath(); ctx.moveTo(X + nx * T, Y + ny * T); ctx.lineTo(X - nx * T, Y - ny * T); ctx.stroke(); }
  ctx.lineCap = 'round';
  // rail: ballast 3 m, ties 2.6 m every 0.6 m, two rails 1.435 m apart
  for (const o of vis) if (o.cl === 'rail') { strokeLine(o, 3 * PM, '#7a6e62'); strokeLine(o, 2.6 * PM, '#6a4a32', [4, 6]); strokeLine(o, 1.6 * PM, '#b4b4bc'); strokeLine(o, 1.3 * PM, '#7a6e62'); }
  // downtown Fifth Ave: a red concrete band along the curb (drawn under the curb line, clipped to downtown)
  if (typeof DT !== 'undefined' && DT) { ctx.save(); ctx.beginPath(); ctx.rect((DT.x0 - camX) * T, 0, (DT.x1 - DT.x0) * T, SH * 2); ctx.clip();
    for (const o of vis) if (o.name === DT.name && (o.cl === 'road' || o.cl === 'major')) { strokeLine(o, o.w * T + 2 * PM, '#a85a48'); strokeLine(o, o.w * T + 2 * PM, '#7e3e30', [1, Math.max(3, PM * 0.3)]); }   // red brick pavers (Street View survey, Nov 17)
    ctx.restore(); }
  // curbs first, then asphalt, so crossings join cleanly
  for (const o of vis) if (o.cl === 'road' || o.cl === 'major' || o.cl === 'service') strokeLine(o, o.w * T + 5, '#8e8a82');   // curb, 0.15 m
  for (const o of vis) if (o.cl === 'service') strokeLine(o, o.w * T, '#6a6a70');
  for (const o of vis) if (o.cl === 'road') strokeLine(o, o.w * T, '#5c5c62');
  for (const o of vis) if (o.cl === 'major') strokeLine(o, o.w * T, '#545458');
  // pavement markings, as the 2025 aerial shows them
  for (const o of vis) {
    if (o.mk === 'turn') {   // Superior Street: two lanes each way around a centre turn lane
      for (const sd of [-1, 1]) {
        strokeOffset(o, sd * 2.0, '#e0c040', 1);                      // turn lane edge: solid yellow
        strokeOffset(o, sd * 1.5, '#e0c040', 1, [3 * PM, 3 * PM]);     // and its dashed inner line
        strokeOffset(o, sd * 5.6, '#e8e8e0', 1, [3 * PM, 9 * PM]);     // white lane line between the two travel lanes
      }
    } else if (o.cl === 'major' && !o.oneway) strokeLine(o, 2, '#d8b848', [3 * PM, 9 * PM]);   // 3 m dashes, 9 m gaps
  }
  ctx.setLineDash([]);
  // markings stop at intersections: wherever a street's end meets another street, clear the box with plain asphalt
  const R2 = vis.filter(o => o.cl === 'road' || o.cl === 'major');
  for (const o of R2) for (const e of [o.P[0], o.P[o.P.length - 1]]) {
    let wmax = 0, cl = o.cl;
    for (const q of R2) { if (q === o) continue; if (q.P.some(p => Math.abs(p[0] - e[0]) < 0.6 && Math.abs(p[1] - e[1]) < 0.6)) { if (q.w >= wmax) { wmax = Math.max(q.w, o.w); cl = q.w >= o.w ? q.cl : o.cl; } } }
    if (!wmax) continue;
    // a round patch in the street's own asphalt colour (a square in another grey showed as a dark box and stuck out past
    // the curb on bends, Christian, Nov 18)
    const hw = wmax * T / 2 - 1, X = (e[0] - camX) * T, Y = (e[1] - camY) * T;
    ctx.fillStyle = cl === 'major' ? '#545458' : '#5c5c62'; ctx.beginPath(); ctx.arc(X, Y, hw, 0, 7); ctx.fill();
  }
}
let camX = 0, camY = 0;   // camera, in 4 m data cells
function drawTown() {
  const x0 = Math.floor(camX), y0 = Math.floor(camY), ox = -(camX - x0) * T, oy = -(camY - y0) * T;
  for (let y = 0; y <= Math.ceil(SH / T); y++) for (let x = 0; x <= Math.ceil(SW / T); x++) drawTownTile(x0 + x, y0 + y, Math.round(ox + x * T), Math.round(oy + y * T));
  drawGreenWash(x0, y0, ox, oy);
  drawTerrainLayer(x0, y0, ox, oy);
  drawStreets();
}
// Mown lawns and yards are lighter than rough grass. Drawn tile by tile that made 4 m stair steps wherever they met
// (Christian, Nov 18); now each tile's tint is one pixel of a small canvas scaled up smoothly, so lawn fades into grass.
const GW = document.createElement('canvas'), GWX = GW.getContext('2d');
function drawGreenWash(x0, y0, ox, oy) {
  const cols = Math.ceil(SW / T) + 3, rows = Math.ceil(SH / T) + 3;
  if (GW.width !== cols || GW.height !== rows) { GW.width = cols; GW.height = rows; GW.key = ''; }
  const key = x0 + ',' + y0 + ',' + (typeof G !== 'undefined' && G && G.inside ? 1 : 0);
  if (GW.key !== key) { GW.key = key;
  const img = GWX.createImageData(cols, rows), d = img.data;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = x0 - 1 + i, y = y0 - 1 + j; let t = tAt(x, y);
    if (PHOTO_LAWN_SET.has(y * TW + x)) t = TL.LAWN; else if (PHOTO_ASPH_SET.has(y * TW + x)) t = -1;
    else if (t === TL.BLDG) { const b = bAt(x, y); t = b && PAVED_UNDER.has(b.type) ? -1 : TL.YARD; }
    else if (ROAD_GROUND[y * TW + x]) t = ROAD_GROUND[y * TW + x] - 1;
    const a = t === TL.LAWN || t === TL.PITCH ? 34 : t === TL.YARD ? 18 : 0, k = (j * cols + i) * 4;
    d[k] = 196; d[k + 1] = 236; d[k + 2] = 150; d[k + 3] = a; }
  GWX.putImageData(img, 0, 0); }
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low';   // bilinear is plenty for a tint, and cheaper
  ctx.drawImage(GW, Math.round(ox - T * 1.5), Math.round(oy - T * 1.5), cols * T, rows * T);   // pixel centres on tile centres
  ctx.imageSmoothingEnabled = false;
}
