// FIELDS AND WOODS (Nov 13): what grows on each farm and woods cell, from the USDA Cropland Data Layer 2025
// (js/data/crops.js, scripts/town/crops.py). Fields are drawn as they look in midsummer: potato rows in flower,
// tall corn, oats and wheat turning gold, beans, alfalfa and clover. Rows run the way the May 2025 aerial photo shows.
// Woods split into hardwoods, pines and spruce, mixed, swamp woods, brush and marsh.
let CROP = null;
(async () => {
  if (typeof CROPS === 'undefined' || typeof DecompressionStream === 'undefined') return;
  try {
    const raw = Uint8Array.from(atob(CROPS.S), c => c.charCodeAt(0));
    const buf = await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer();
    if (buf.byteLength === TW * TH) CROP = new Uint8Array(buf);
  } catch (e) { CROP = null; }
})();
function cropAt(x, y) { return CROP && x >= 0 && y >= 0 && x < TW && y < TH ? CROP[y * TW + x] : 0; }
const CROP_ROWS = new Set([1, 2, 3, 4, 5, 6, 11, 12, 14, 15, 16]);
const CTEX = {};
function ctex(c, v, vert) {   // a 16 px (2 m) texture for crop class c, variant v; rows run down the tile when vert
  const key = c + ':' + v + ':' + (vert ? 1 : 0); if (CTEX[key]) return CTEX[key];
  const cv = document.createElement('canvas'); cv.width = cv.height = 16; const g = cv.getContext('2d');
  const hh = i => hash(i * 7 + v * 131 + c * 977, i * 13 + c * 31);
  // draw in "row space": u runs across the rows, w along them; swapped for north-south rows
  const F = (col, u, w, du, dw) => { g.fillStyle = col; vert ? g.fillRect(u, w, du, dw) : g.fillRect(w, u, dw, du); };
  const P = (col, x, y, wd, ht) => { g.fillStyle = col; g.fillRect(x, y, wd, ht); };
  const dots = (col, n, s0) => { for (let i = 0; i < n; i++) { const q = hh(i + s0); P(col, q % 16, (q >> 4) % 16, 1, 1); } };
  const rows = (soil, soilDk, plant, plantDk, plantLt, pw) => {   // two rows per tile, 1 m apart
    F(soil, 0, 0, 16, 16);
    for (const r0 of [0, 8]) {
      F(soilDk, r0 + pw, 0, 1, 16);
      F(plant, r0, 0, pw, 16);
      for (let w = 0; w < 16; w += 2) { const q = hh(r0 * 16 + w); if (q % 3) F(plantLt, r0 + (q >> 3) % pw, w, 1, 1); if (q % 5 === 0) F(plantDk, r0 + (q >> 5) % pw, w + 1, 1, 1); }
      F(plantDk, r0 + pw - 1, 0, 1, 16);
    }
  };
  const grain = (base, line, head, dk) => {   // drilled small grain: fine rows you can just make out
    F(base, 0, 0, 16, 16);
    for (let u = 1; u < 16; u += 4) F(line, u, 0, 1, 16);
    for (let i = 0; i < 18; i++) { const q = hh(i); F(i % 3 ? head : dk, q % 16, (q >> 4) % 16, 1, 1); }
  };
  const meadow = (base, dk, lt, flower, flower2) => {
    P(base, 0, 0, 16, 16);
    for (let i = 0; i < 10; i++) { const q = hh(i); P(dk, q % 15, (q >> 4) % 14, 1, 2); }
    for (let i = 0; i < 7; i++) { const q = hh(i + 30); P(lt, q % 15, (q >> 5) % 15, 2, 1); }
    if (flower) dots(flower, 3 + (v & 1), 60); if (flower2 && v > 1) dots(flower2, 2, 80);
  };
  const crowns = (base, cols, n, rmin, rr, hi) => {   // treetops seen from above
    P(base, 0, 0, 16, 16);
    for (let i = 0; i < n; i++) { const q = hh(i); g.fillStyle = cols[i % cols.length]; g.beginPath(); g.arc(q % 16, (q >> 4) % 16, rmin + q % rr, 0, 6.29); g.fill(); }
    if (hi) { const q = hh(9); P(hi, q % 12, (q >> 4) % 12, 3, 2); }
  };
  const spires = (base, dk, lt, n) => {   // pointed conifer tops
    P(base, 0, 0, 16, 16);
    for (let i = 0; i < n; i++) { const q = hh(i), x = q % 16, y = (q >> 4) % 16, r = 3 + q % 2;
      g.fillStyle = dk; g.beginPath(); g.moveTo(x, y - r - 1); g.lineTo(x + r, y + r); g.lineTo(x - r, y + r); g.closePath(); g.fill();
      g.fillStyle = lt; g.fillRect(x - 1, y - 1, 1, 2); }
  };
  switch (c) {
    case 1: rows('#6a5034', '#54402a', '#336e2e', '#24521f', '#4c8a3c', 6);   // potatoes, hilled rows
      if (v & 1) { for (const r0 of [0, 8]) { const q = hh(r0 + 99); F(v === 3 ? '#c8b4e4' : '#f2eef6', r0 + 1 + q % 4, (q >> 4) % 15, 1, 1); } } break;
    case 2: rows('#2e5a24', '#22461c', '#4e9636', '#3a7a2a', '#7ac04e', 7);   // corn, over your head: leaves arch across the gaps
      for (let i = 0; i < 6; i++) { const q = hh(i + 120), r0 = (i & 1) * 8, w = (q >> 3) % 15; F('#5ea43e', r0 + 5, w, 4, 1); F('#3a7a2a', r0 + 6, w + 1, 3, 1); }
      if (v === 2) { const q = hh(77); F('#d8c47a', 3, q % 15, 1, 1); F('#d8c47a', 11, (q >> 4) % 15, 1, 1); } break;
    case 3: grain('#b8b462', '#a4a050', '#d4d08a', '#8e8a44'); break;   // oats
    case 4: grain('#d2b25a', '#bc9a46', '#ead07c', '#a8883c'); break;   // wheat
    case 14: grain('#bca85a', '#a89048', '#d8c47c', '#948040'); break;  // triticale
    case 15: grain('#d0c272', '#bcac5c', '#e6da94', '#a89a50'); break;  // barley
    case 16: grain('#b0a866', '#9c9454', '#ccc488', '#888048'); break;  // rye
    case 5: rows('#7a5c3c', '#644a30', '#4a8a34', '#386e28', '#6aa848', 4); break;   // dry beans
    case 6: rows('#6a5236', '#56422c', '#5a9a3a', '#447e2c', '#78b452', 6); break;   // soybeans
    case 7: meadow('#5a9a5a', '#467e46', '#74b270', '#9a7ad0', '#b49ae0'); break;   // alfalfa
    case 8: meadow('#5e9e4a', '#4a823a', '#7ab664', '#eaa4c4', '#f4f0f0'); break;   // clover
    case 9: meadow('#7aa850', '#64903e', '#96bc66', null, null); break;            // hay
    case 10: meadow('#6a9a48', '#567e38', '#84b05c', '#f0e8a0', null); break;      // pasture
    case 11: P('#5e8e46', 0, 0, 16, 16); for (const [x, y] of (vert ? [[4, 3], [12, 11]] : [[3, 4], [11, 12]])) {   // Christmas trees in rows
      g.fillStyle = '#1e4a2a'; g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + 4, y + 3); g.lineTo(x - 4, y + 3); g.closePath(); g.fill(); P('#2e6a3a', x - 1, y - 2, 1, 3); } break;
    case 12: rows('#6a5034', '#54402a', '#3e8a3e', '#2e6e2e', '#8ac45a', 5); break;   // vegetables
    case 13: meadow('#8a7454', '#74603e', '#9a8a5e', '#6a8a3a', null); break;          // fallow
    case 20: crowns('#2a5a2a', ['#3c7a34', '#468a3c', '#36702e'], 6, 3, 3, 'rgba(255,255,255,.1)'); break;   // hardwoods
    case 21: spires('#173a22', '#24563a', '#3a7048', 5); break;                                             // pines and spruce
    case 22: crowns('#224a28', ['#3a7434', '#24563a'], 5, 3, 3, null); spires('rgba(0,0,0,0)', '#1e4c30', '#3a7048', 2); break;   // mixed
    case 23: crowns('#2e4a3a', ['#34603a', '#3e6a3e', '#2a5034'], 5, 2, 3, null);   // swamp woods: dark water between the crowns
      { const q = hh(50); P('#3a5a68', q % 13, (q >> 4) % 14, 3, 1); if (v & 1) P('#6a8a4a', (q >> 8) % 14, (q >> 12) % 14, 2, 2); } break;
    case 24: meadow('#5a8a44', '#46703a', '#70a052', null, null); for (let i = 0; i < 3; i++) { const q = hh(i + 20); g.fillStyle = '#3e6e34'; g.beginPath(); g.arc(q % 16, (q >> 4) % 16, 2 + q % 2, 0, 6.29); g.fill(); } break;   // brush
    case 25: P('#6a8a50', 0, 0, 16, 16); for (let i = 0; i < 2 + (v & 1); i++) { const q = hh(i + 3); P('#4a6a80', q % 13, (q >> 4) % 15, 2 + q % 3, 1); }   // marsh: sedge, cattails, open water
      for (let i = 0; i < 9; i++) { const q = hh(i + 10); P('#4a6a3a', q % 16, (q >> 4) % 14, 1, 3); if (i % 3 === 0) P('#6a4a2c', q % 16, (q >> 4) % 14, 1, 1); } break;
    default: P('#a89a5a', 0, 0, 16, 16);
  }
  return (CTEX[key] = cv);
}
{ const _dt = drawTownTile;
  drawTownTile = function (x, y, sx, sy) {
    const t = tAt(x, y);
    if ((t !== TL.FARM && t !== TL.WOODS) || !CROP) return _dt(x, y, sx, sy);
    const cc = CROP[y * TW + x], c = cc & 127; if (!c) return _dt(x, y, sx, sy);
    const vert = (cc & 128) > 0 && CROP_ROWS.has(c), n = Math.ceil(T / 16);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const v = hash(x * n + i, y * n + j) % 4, w = Math.min(16, T - i * 16), h = Math.min(16, T - j * 16);
      ctx.drawImage(ctex(c, v, vert), 0, 0, w, h, sx + i * 16, sy + j * 16, w, h);
    }
    if (t !== TL.FARM) return;
    // field edges: a grass margin where the field meets anything that isn't field, a furrow between two crops
    const edge = (x2, y2) => { const t2 = tAt(x2, y2); if (t2 !== TL.FARM) return 2; return (cropAt(x2, y2) & 127) !== c ? 1 : 0; };
    const e = [edge(x, y - 1), edge(x, y + 1), edge(x - 1, y), edge(x + 1, y)];
    const col = k => k === 2 ? (typeof EDGE_GRASS !== 'undefined' ? EDGE_GRASS : '#5f9448') : '#4e3c26', wd = k => k === 2 ? 3 : 1;
    if (e[0]) R(sx, sy, T, wd(e[0]), col(e[0])); if (e[1]) R(sx, sy + T - wd(e[1]), T, wd(e[1]), col(e[1]));
    if (e[2]) R(sx, sy, wd(e[2]), T, col(e[2])); if (e[3]) R(sx + T - wd(e[3]), sy, wd(e[3]), T, col(e[3]));
  };
}
const CROP_SAY = {
  1: ['A potato field, the rows hilled and in flower.', 'Antigo silt loam, the soil under this town, is Wisconsin\'s state soil.'],
  2: ['A cornfield, taller than you by midsummer.'], 3: ['A field of oats.'], 4: ['A wheat field.'], 14: ['A field of triticale, a cross of wheat and rye.'],
  15: ['A barley field.'], 16: ['A field of rye.'], 5: ['A field of dry beans.'], 6: ['A soybean field.'],
  7: ['An alfalfa field, grown for hay.'], 8: ['A clover field.'], 9: ['A hayfield.'],
  10: ['Pasture.'], 11: ['A Christmas tree farm, the trees in rows.'], 12: ['A vegetable field.'], 13: ['A field resting this year.'],
  20: ['A stand of hardwoods.'], 21: ['Pines and spruce.'], 22: ['Mixed woods, hardwoods and conifers together.'],
  23: ['Swamp woods, where the ground under the trees is often wet.'], 24: ['Brush and young trees.'], 25: ['Marsh: wet ground grown up in sedges and grass.']
};
{ const _look = lookAt;
  lookAt = function (x, y) {
    _look(x, y); if (DLG || mode !== 'walk' || !CROP) return;
    const cx = Math.floor((x + 0.5) / CPD), cy = Math.floor((y + 0.5) / CPD), t = tAt(cx, cy);
    if (t !== TL.FARM && t !== TL.WOODS) return;
    const c = cropAt(cx, cy) & 127, L = CROP_SAY[c]; if (!L) return;
    say(L.map(s => ['', s]).concat([['', c < 20 ? 'USDA crop map, 2025.' : 'USDA land cover, 2025.']]));
  };
}
// the town map shows each field in its crop's colour, and the woods by kind
{ const CMAP = { 1: [96, 128, 64], 2: [128, 160, 72], 3: [184, 176, 100], 4: [200, 170, 96], 14: [184, 160, 92], 15: [196, 184, 112], 16: [172, 160, 100],
    5: [150, 140, 84], 6: [140, 156, 80], 7: [110, 150, 100], 8: [130, 150, 96], 9: [150, 170, 100], 10: [130, 160, 92], 11: [60, 100, 64], 12: [110, 140, 70],
    13: [150, 130, 100], 20: [52, 100, 52], 21: [32, 72, 44], 22: [42, 86, 48], 23: [40, 76, 60], 24: [90, 120, 70], 25: [90, 130, 110] };
  const _mi = mapImage;
  mapImage = function () {
    if (MAPIMG) return MAPIMG;
    const c = _mi(); if (!CROP) { MAPIMG = null; return c; }   // fields not unpacked yet: draw plain, try again next time
    const g = c.getContext('2d'), im = g.getImageData(0, 0, TW, TH), d = im.data;
    for (let i = 0; i < TW * TH; i++) { const t = TT[i]; if (t !== TL.FARM && t !== TL.WOODS) continue; const k = CMAP[CROP[i] & 127]; if (!k) continue; d[i * 4] = k[0]; d[i * 4 + 1] = k[1]; d[i * 4 + 2] = k[2]; }
    g.putImageData(im, 0, 0); return c;
  };
}
