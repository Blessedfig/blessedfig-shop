"use strict";
// ---------- Map layers (Nov 13): on the town map, L (or the LAYER button) switches between the town, soils, glacial
// deposits, elevation and people per square mile. Same sources as the Survey page: NRCS soil survey (SSURGO), WGNHS
// glacial geology (IC52), the 2017 county lidar, and 2020 Census block groups (js/data/maplayers.js). ----------
KEYMAP.KeyL = 'layer';
const MLAY = { names: ['Town', 'Soils', 'Glacial deposits', 'Elevation', 'People per sq mi'], keys: [null, 'soil', 'geo', 'elev', 'people'],
  src: ['', 'NRCS soil survey', 'WGNHS glacial geology', '2017 county lidar', 'Census 2020'], data: {}, img: {}, busy: {} };
async function mlUnpack(k) {
  if (MLAY.data[k] || MLAY.busy[k] || typeof MAPL === 'undefined') return; MLAY.busy[k] = 1;
  try { const raw = Uint8Array.from(atob(MAPL[k].S), c => c.charCodeAt(0));
    MLAY.data[k] = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer()); } catch (e) { }
}
const ML_SOIL = ['#8aa060', '#5a4a3a', '#a8b46a', '#98aa5c', '#c8b47a', '#7a8a4a', '#b0a070', '#6e7a50', '#c0a888', '#90a878', '#a89058', '#6a5a44', '#b8c080', '#d0b890', '#7e9068', '#a0885a', '#887050', '#c8c098'];
const ML_PEOPLE = [[100, '#f2ead6'], [500, '#f0c890'], [1500, '#e08a50'], [3000, '#c0503a'], [1e9, '#8a2a2a']];
function mlColor(k, v) {
  if (!v) return null;
  if (k === 'soil') { const n = MAPL.soil.K[v - 1]; return /Lupton|Cathro|Seelyeville|Markey|muck/i.test(n[0]) ? '#4e4032' : ML_SOIL[(v - 1) % ML_SOIL.length]; }
  if (k === 'geo') { const l = MAPL.geo.K[v - 1];
    return l.startsWith('Water') ? '#4a7ab0' : l.startsWith('Peat') ? '#5a4a3a' : l.startsWith('Stream') ? '#9ab0c8' : l.startsWith('Glacial till') ? (l.includes('moraine') ? '#b8905a' : '#c8a46a') : l.startsWith('Meltwater') ? (l.includes('pitted') && !l.includes('unpitted') ? '#d8c890' : '#e8dcaa') : l.startsWith('Lake') ? '#a8b8a0' : '#b0a890'; }
  if (k === 'elev') { const t = Math.min(1, (v - 1) * MAPL.elev.step / Math.max(1, MAPL.elev.hi - MAPL.elev.lo)), A = [70, 138, 90], B = [196, 160, 100], c = A.map((a, i) => Math.round(a + (B[i] - a) * t) - (v % 2 ? 0 : 10)); return `rgb(${c})`; }
  if (k === 'people') { const d = MAPL.people.K[v - 1][2]; return ML_PEOPLE.find(([lim]) => d < lim)[1]; }
  return null;
}
function mlImage(k) {
  if (MLAY.img[k]) return MLAY.img[k];
  const D = MLAY.data[k]; if (!D) { mlUnpack(k); return null; }
  const W = MAPL.w, H = MAPL.h, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H), px = im.data, memo = {};
  for (let i = 0; i < W * H; i++) { const v = D[i]; if (!v) continue; let rgb = memo[v];
    if (!rgb) { g.fillStyle = mlColor(k, v) || '#000'; const s = g.fillStyle; rgb = memo[v] = s.startsWith('#') ? [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)] : s.match(/\d+/g).map(Number); }
    px[i * 4] = rgb[0]; px[i * 4 + 1] = rgb[1]; px[i * 4 + 2] = rgb[2]; px[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0);
  const base = mapImage.base(), out = document.createElement('canvas'); out.width = base.width; out.height = base.height; const o = out.getContext('2d');
  o.drawImage(base, 0, 0); o.globalAlpha = 0.8; o.imageSmoothingEnabled = false; o.drawImage(c, 0, 0, W * MAPL.s, H * MAPL.s);
  o.globalAlpha = 1; const bd = base.getContext('2d').getImageData(0, 0, base.width, base.height).data, od = o.getImageData(0, 0, out.width, out.height);   // streets and buildings stay on top
  for (let i = 0; i < TW * TH; i++) { const t = TT[i]; if (t === TL.ROAD || t === TL.MAJOR || t === TL.BLDG) { od.data[i * 4] = bd[i * 4]; od.data[i * 4 + 1] = bd[i * 4 + 1]; od.data[i * 4 + 2] = bd[i * 4 + 2]; } }
  o.putImageData(od, 0, 0);
  return (MLAY.img[k] = out);
}
{ const _mi = mapImage;
  mapImage = function () { const L = (MODES.map && MODES.map.layer) | 0, k = MLAY.keys[L]; if (!k) return _mi(); return mlImage(k) || _mi(); };
  mapImage.base = _mi;
}
function mlHere(k, cx, cy) {
  const D = MLAY.data[k]; if (!D) return 'Loading…';
  const v = D[Math.floor(cy / MAPL.s) * MAPL.w + Math.floor(cx / MAPL.s)]; if (!v) return 'No data here';
  if (k === 'soil') { const [n, f] = MAPL.soil.K[v - 1]; return n + (f ? ' — ' + f.toLowerCase() : ''); }
  if (k === 'geo') { const [m, lf] = MAPL.geo.K[v - 1].split('|'); return m + (lf ? ', ' + lf : ''); }
  if (k === 'elev') return 'About ' + (MAPL.elev.lo + (v - 1) * MAPL.elev.step).toLocaleString('en-US') + ' ft above sea level';
  if (k === 'people') { const [, p, d] = MAPL.people.K[v - 1]; return p.toLocaleString('en-US') + ' people in this block group · ' + d.toLocaleString('en-US') + ' per sq mi'; }
  return '';
}
{ const M = MODES.map, _u = M.update, _d = M.draw;
  M.update = function () { if (!this.list && pressed.layer) { this.layer = ((this.layer | 0) + 1) % MLAY.names.length; const k = MLAY.keys[this.layer]; if (k) mlUnpack(k); } return _u.call(this); };
  M.draw = function () {
    _d.call(this); const L = this.layer | 0; if (!L || this.list) return;
    const k = MLAY.keys[L], w = Math.min(SW - 8, 300), y = SH - 20 - 46;
    win(4, y, w, 42); txt(MLAY.names[L], 12, y + 6, '#ffd860');
    txt(MLAY.src[L], 4 + w - 8, y + 7, '#c8d0ff', 'right', SMALL);
    let s = mlHere(k, this.cx, this.cy); ctx.font = SMALL; while (s.length > 8 && ctx.measureText(s).width > w - 20) s = s.slice(0, -2) + '…';
    txt(s, 12, y + 24, '#ffffff', 'left', SMALL);
  };
}
