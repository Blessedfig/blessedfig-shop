"use strict";
// ---------- Time and season (Nov 13): the town keeps Antigo's real clock and calendar.
// Day and night follow the sun's real height over Antigo (NOAA's approximation, to about a degree). After dark the
// street lamps, porch lights, windows and headlights come on. The season follows the real date by the calendar, not
// the day's weather: fall colour, bare hardwoods, harvested fields, snow from December to mid-March, ice on the lakes.
// For a preview, ?season=snow|spring|leafout|early|summer|late|color|bare and ?sun=<degrees> override both. ----------
const SKY = { lat: 45.140, lon: -89.152, d: 0, warm: 0, elev: 90, lit: [], next: 0 };
(function () {
  const q = new URLSearchParams(location.search);
  let doy;
  try {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
    const g = k => +p.find(x => x.type === k).value;
    doy = Math.round((Date.UTC(g('year'), g('month') - 1, g('day')) - Date.UTC(g('year'), 0, 0)) / 864e5);
  } catch (e) { const n = new Date(); doy = Math.round((n - new Date(n.getFullYear(), 0, 0)) / 864e5); }
  const ph = d => d >= 335 || d < 80 ? 'snow' : d < 135 ? 'spring' : d < 152 ? 'leafout' : d < 182 ? 'early' : d < 244 ? 'summer' : d < 269 ? 'late' : d < 294 ? 'color' : 'bare';
  SKY.doy = doy; SKY.phase = q.get('season') || ph(doy);
  SKY.frozen = q.get('season') ? SKY.phase === 'snow' : (doy >= 344 || doy < 100);   // ice from about Dec 10 to Apr 9
  SKY.sunFix = q.has('sun') ? +q.get('sun') : null;
})();
function sunElevation(date) {
  const n = date.getTime() / 864e5 + 2440587.5 - 2451545.0, rad = Math.PI / 180;
  const L = (280.46 + 0.9856474 * n) % 360, g = ((357.528 + 0.9856003 * n) % 360) * rad;
  const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad, eps = (23.439 - 4e-7 * n) * rad;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam)), ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
  const gmst = ((18.697374558 + 24.06570982441908 * n) % 24 + 24) % 24, ha = (gmst * 15 + SKY.lon) * rad - ra, lat = SKY.lat * rad;
  return Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha)) / rad;
}
function skyUpdate() {
  if (performance.now() < SKY.next) return; SKY.next = performance.now() + 20000;
  const e = SKY.elev = SKY.sunFix !== null ? SKY.sunFix : sunElevation(new Date());
  SKY.d = e >= 4 ? 0 : e <= -12 ? 1 : (4 - e) / 16;                    // 0 day ... 1 night
  SKY.warm = e > 12 || e < -6 ? 0 : e > 4 ? (12 - e) / 8 : (e + 6) / 10;   // the low sun's orange
  const h = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', hour12: false }).format(new Date());
  SKY.late = +h >= 23 || +h < 5;
}
skyUpdate();
// ---- colour helpers ----
function recolor(src, fn) {
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const im = g.getImageData(0, 0, c.width, c.height), d = im.data, W = c.width;
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const o = fn(d[i], d[i + 1], d[i + 2], (i >> 2) % W, (i >> 2) / W | 0, d); if (o) { d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; } }
  g.putImageData(im, 0, 0); return c;
}
const isGreen = (r, g, b) => g > r + 4 && g >= b;
const dormantFn = k => (r, g, b) => isGreen(r, g, b) ? [r + (Math.min(255, g * 0.86 + 26) - r) * k, g + (g * 0.76 + 10 - g) * k, b + (b * 0.5 - b) * k] : null;
const snowFn = (r, g, b) => { const l = (r + g + b) / 3; return [Math.min(255, 200 + l * 0.22), Math.min(255, 208 + l * 0.2), Math.min(255, 220 + l * 0.15)]; };
const FALL = [['#6e1c12', '#a42c1a', '#d0522a', '#ec8a40'], ['#6e3410', '#ac5a18', '#d8862a', '#f2b048'], ['#5e5014', '#9c801c', '#ceb030', '#ecd45c'], ['#4a3820', '#72552e', '#9a7840', '#bc9858']];
const hex3 = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const fallFn = pal => { const P = pal.map(hex3); return (r, g, b) => { if (!isGreen(r, g, b)) return null; const l = (r + g + b) / 3; return P[Math.min(3, Math.max(0, Math.floor((l - 20) / 38)))]; }; };
function mixHex(a, b, k) { const A = hex3(a), B = hex3(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); }
// ---- the ground ----
const EDGE_GRASS = SKY.phase === 'snow' ? '#dfe6ec' : /^(bare|spring)$/.test(SKY.phase) ? '#8c8a52' : SKY.phase === 'color' ? '#77904a' : '#5f9448';   // field margins
const PH = SKY.phase, SNOW = PH === 'snow';
{ const _gt = gtex, SG = {};
  const DORM = { spring: 0.55, bare: 0.7, color: 0.3 }[PH] || 0;
  gtex = function (kind, v) {
    const key = kind + v; if (SG[key]) return SG[key];
    const base = _gt(kind, v);
    if (kind === 'water' && SKY.frozen) return (SG[key] = recolor(base, (r, g, b, x, y) => { const q = hash(x + v * 3, y * 7 + 1) % 23; return q === 0 ? [168, 188, 204] : q < 3 ? [236, 242, 248] : [204, 220, 232]; }));
    const veg = kind === 'grass' || kind === 'lawn' || kind === 'yard' || kind === 'pitch' || kind === 'farm' || kind === 'woods';
    if (!veg) return (SG[key] = base);
    if (SNOW) return (SG[key] = recolor(base, (r, g, b, x, y) => hash(x + v * 5, y + 11) % 41 === 0 ? [138, 150, 120] : snowFn(r, g, b)));
    return (SG[key] = DORM ? recolor(base, dormantFn(DORM)) : base);
  };
}
// ---- fields and woods ----
if (typeof ctex === 'function') {
  const _ct = ctex, SC = {};
  const tex = (draw) => { const c = document.createElement('canvas'); c.width = c.height = 16; draw(c.getContext('2d')); return c; };
  const rowsOf = (g, vert, base, line, gap) => { g.fillStyle = base; g.fillRect(0, 0, 16, 16); g.fillStyle = line; for (let u = 0; u < 16; u += gap) vert ? g.fillRect(u, 0, 1, 16) : g.fillRect(0, u, 16, 1); };
  const speck = (g, col, n, s) => { g.fillStyle = col; for (let i = 0; i < n; i++) { const q = hash(i * 7 + s, i * 13 + s * 3); g.fillRect(q % 16, (q >> 4) % 16, 1, 1); } };
  const tilled = (v, vert) => tex(g => { rowsOf(g, vert, '#6a5034', '#54402a', 4); speck(g, '#7e6244', 10, v + 1); });
  const planted = (v, vert) => tex(g => { rowsOf(g, vert, '#6a5034', '#54402a', 8); g.fillStyle = '#5a9a3a'; for (let u = 2; u < 16; u += 8) for (let w = 1; w < 16; w += 3) vert ? g.fillRect(u, w, 2, 1) : g.fillRect(w, u, 1, 2); });
  const stubble = (v, vert, base, line) => tex(g => { rowsOf(g, vert, base, line, 4); speck(g, '#e0d0a0', 8, v + 3); speck(g, '#7a6a48', 6, v + 9); });
  const snowRows = (v, vert, rowsd) => tex(g => { g.fillStyle = '#e6ecf2'; g.fillRect(0, 0, 16, 16); if (rowsd) { g.fillStyle = '#c8d0d8'; for (let u = 0; u < 16; u += 4) vert ? g.fillRect(u, 0, 1, 16) : g.fillRect(0, u, 16, 1); } speck(g, '#a89a78', rowsd ? 6 : 2, v + 5); speck(g, '#ffffff', 8, v + 7); });
  const bareCanopy = (v, snow) => tex(g => {   // leafless crowns from above: grey-brown twigs over the ground
    g.fillStyle = snow ? '#dfe6ec' : '#5e5444'; g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 5; i++) { const q = hash(i + v * 9, 77); g.fillStyle = snow ? 'rgba(90,80,70,.45)' : 'rgba(70,60,50,.55)'; g.beginPath(); g.arc(q % 16, (q >> 4) % 16, 3 + q % 3, 0, 6.29); g.fill(); }
    g.strokeStyle = snow ? '#6a5e50' : '#3e352a'; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) { const q = hash(i * 3 + v, 31), x = q % 16, y = (q >> 4) % 16; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (q % 5) - 2, y - 3); g.stroke(); }
  });
  const conSnow = src => recolor(src, (r, g, b, x, y, d) => { const up = y > 0 ? d[((y - 1) * 16 + x) * 4 + 1] : 0; return (y + x * 3) % 5 === 0 || up > g + 12 ? [236, 242, 246] : null; });
  const ANN = new Set([1, 2, 5, 6, 12]), SPR = new Set([3, 15]), WIN = new Set([4, 14, 16]), PER = new Set([7, 8, 9, 10, 13]);
  ctex = function (c, v, vert) {
    const key = c + ':' + v + ':' + (vert ? 1 : 0); if (SC[key]) return SC[key];
    const o = _ct(c, v, vert); let r = o;
    const rowed = ANN.has(c) || SPR.has(c) || WIN.has(c);
    if (SNOW) r = c === 21 || c === 11 ? conSnow(o) : c === 20 || c === 23 ? bareCanopy(v, true) : c === 22 ? conSnow(bareCanopy(v, true)) : c >= 20 ? snowRows(v, false, false) : snowRows(v, vert, rowed);
    else if (PH === 'spring') r = ANN.has(c) || SPR.has(c) ? tilled(v, vert) : WIN.has(c) ? planted(v, vert) : PER.has(c) || c === 24 || c === 25 ? recolor(o, dormantFn(0.6)) : c === 20 || c === 23 ? bareCanopy(v, false) : o;
    else if (PH === 'leafout') r = ANN.has(c) || SPR.has(c) ? planted(v, vert) : WIN.has(c) ? recolor(o, (rr, g, b) => [rr * 0.5 + 30, g * 0.7 + 60, b * 0.6]) : c === 20 ? recolor(o, (rr, g, b) => isGreen(rr, g, b) ? [rr * 0.9 + 34, Math.min(255, g * 1.05 + 24), b * 0.7] : null) : o;
    else if (PH === 'early') r = ANN.has(c) ? planted(v, vert) : o;
    else if (PH === 'late') r = c === 2 ? recolor(o, (rr, g, b) => isGreen(rr, g, b) ? [g * 0.95 + 30, g * 0.85 + 14, b * 0.5] : null) : c === 1 || c === 5 || c === 6 ? recolor(o, dormantFn(0.55)) : SPR.has(c) || WIN.has(c) ? stubble(v, vert, '#c8b478', '#a8945c') : o;
    else if (PH === 'color') r = c === 1 || c === 12 ? tilled(v, vert) : c === 2 ? recolor(o, (rr, g, b) => isGreen(rr, g, b) ? [g * 0.9 + 52, g * 0.78 + 30, b * 0.45 + 10] : null) : c === 5 || c === 6 ? stubble(v, vert, '#b49a6a', '#94784c') : SPR.has(c) || WIN.has(c) ? stubble(v, vert, '#c8b478', '#a8945c') : PER.has(c) ? recolor(o, dormantFn(0.35)) : c === 20 ? recolor(o, fallFn(FALL[v % 3])) : c === 22 || c === 23 ? recolor(o, (rr, g, b, x, y) => (x * 7 + y * 3 + v) % 3 ? null : fallFn(FALL[2])(rr, g, b)) : c === 24 ? recolor(o, fallFn(FALL[0])) : c === 25 ? recolor(o, dormantFn(0.8)) : o;
    else if (PH === 'bare') r = c === 2 ? stubble(v, vert, '#b8a476', '#8e7a50') : c === 1 || c === 5 || c === 6 || c === 12 ? tilled(v, vert) : SPR.has(c) ? stubble(v, vert, '#b8a476', '#968258') : WIN.has(c) ? planted(v, vert) : PER.has(c) || c === 24 || c === 25 ? recolor(o, dormantFn(0.75)) : c === 20 || c === 23 ? bareCanopy(v, false) : c === 22 ? recolor(bareCanopy(v, false), (rr, g, b, x, y) => (x * 5 + y * 3 + v) % 4 ? null : [30, 70, 44]) : o;
    return (SC[key] = r);
  };
}
// ---- trees: colour in fall, bare from late October to mid-May, snow on the evergreens ----
{ const _ts = treeImgSized, ST = {};
  const BARE = PH === 'bare' || PH === 'snow' || PH === 'spring';
  const bareTree = (src, v, rb, snow) => {
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d');
    const r = (c.width - 8) / 2, cx = c.width / 2, cy = r + 4, tw = Math.max(4, Math.round(r * 0.16));
    g.fillStyle = '#3a2618'; g.fillRect(cx - tw / 2, cy + r * 0.3, tw, c.height - cy - r * 0.3 - 2); g.fillStyle = '#5a3c26'; g.fillRect(cx - tw / 2 + 1, cy + r * 0.3, 2, c.height - cy - r * 0.3 - 3);
    g.fillStyle = snow ? 'rgba(74,62,50,.1)' : 'rgba(74,62,50,.16)'; g.beginPath(); g.ellipse(cx, cy, r * 0.9, r * 0.8, 0, 0, 6.29); g.fill();   // the haze of fine twigs
    const br = (x, y, a, len, w, depth) => {
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      g.strokeStyle = '#3e3226'; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      if (snow && w > 1.5) { g.strokeStyle = 'rgba(240,244,248,.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - w / 2); g.lineTo(x2, y2 - w / 2); g.stroke(); }
      if (depth > 0) { const q = hash(Math.round(x2 * 7 + v), Math.round(y2 * 3 + rb)); br(x2, y2, a - 0.45 - (q % 20) / 100, len * 0.68, Math.max(1, w * 0.62), depth - 1); br(x2, y2, a + 0.42 + (q % 17) / 100, len * 0.66, Math.max(1, w * 0.6), depth - 1); }
    };
    br(cx, cy + r * 0.35, -Math.PI / 2, r * 0.55, Math.max(2, tw * 0.7), 4);
    return c;
  };
  treeImgSized = function (ev, v, rm, hm) {
    const src = _ts(ev, v, rm, hm), key = (ev ? 'E' : 'D') + v + '_' + rm + '_' + hm; if (ST[key]) return ST[key];
    let out = src;
    if (ev) { if (SNOW) out = recolor(src, (r, g, b, x, y, d) => { const W = src.width, a = y > 1 ? d[((y - 2) * W + x) * 4 + 3] : 0; return !a || (x + y) % 7 === 0 ? [236, 242, 246] : null; }); }
    else if (BARE) out = bareTree(src, v, rm, SNOW);
    else if (PH === 'color') out = recolor(src, hash(v, Math.round(rm * 10)) % 6 === 0 ? (() => null) : fallFn(FALL[hash(v * 3, Math.round(rm * 7)) % 4]));
    else if (PH === 'late') out = hash(v, Math.round(rm * 10)) % 5 === 0 ? recolor(src, fallFn(FALL[2])) : src;
    else if (PH === 'leafout') out = recolor(src, (r, g, b) => isGreen(r, g, b) ? [r * 0.9 + 34, Math.min(255, g * 1.05 + 26), b * 0.7] : null);
    return (ST[key] = out);
  };
  treeImgSized.summer = _ts;   // for places set in summer (Tanner's lake trip)
}
// ---- snow on the roofs ----
if (SNOW) { const _db = drawBuilding; drawBuilding = function (b) { const s = b.style; if (s && s.roofCol && !s._snow) { s.roofCol = mixHex(s.roofCol, '#e8eef4', 0.78); s._snow = 1; } _db(b); }; }
// ---- after dark: windows remember where they were drawn, then light up over the dark ----
const GLASS = new Set(['#2a3a52', '#2e3a46']);
{ const _F = F;
  F = function (c, x, y, w, h) {
    _F(c, x, y, w, h);
    if (SKY.d > 0.15 && GLASS.has(c) && w > 2 && h > 2) { const t = ctx.getTransform(); SKY.lit.push([t.a * x + t.e, t.d * y + t.f, t.a * w, t.d * h]); }
  };
}
const GLOW = {};
function glowImg(r, col) {
  const key = r + col; if (GLOW[key]) return GLOW[key];
  const c = document.createElement('canvas'); c.width = c.height = r * 2; const g = c.getContext('2d'), gr = g.createRadialGradient(r, r, 0, r, r, r);
  gr.addColorStop(0, col.replace('A', '0.85')); gr.addColorStop(0.35, col.replace('A', '0.35')); gr.addColorStop(1, col.replace('A', '0')); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2);
  return (GLOW[key] = c);
}
function drawNight() {
  skyUpdate();
  const d = SKY.d, w = SKY.warm;
  if (d <= 0.01 && w <= 0.01) { SKY.lit.length = 0; return; }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sc = ctx.canvas.width / SW; ctx.scale(sc, sc);
  ctx.globalCompositeOperation = 'multiply';
  const n = [52, 62, 112], wc = [255, 214, 176], col = [0, 1, 2].map(i => Math.round(255 + (n[i] - 255) * d + (wc[i] - 255) * w * (1 - d) * 0.6));
  ctx.fillStyle = `rgb(${col})`; ctx.fillRect(0, 0, SW, SH);
  if (d > 0.15) {
    ctx.globalCompositeOperation = 'lighter';
    const a = Math.min(1, (d - 0.15) / 0.4);
    ctx.globalAlpha = a;
    for (const [x, y, ww, hh] of SKY.lit) { const q = hash(Math.round(x / sc + camX * T), Math.round(y / sc + camY * T)) % 100; if (q < (SKY.late ? 18 : 62)) { ctx.fillStyle = q % 3 ? 'rgba(255,196,110,.85)' : 'rgba(255,226,160,.8)'; ctx.fillRect(x / sc, y / sc, ww / sc, hh / sc); } }
    for (const p of PROPS) {
      if (p.k !== 'lamp') continue; const sx = (p.x - camX) * T, sy = (p.y - camY) * T; if (sx < -80 || sx > SW + 80 || sy < -80 || sy > SH + 120) continue;
      ctx.drawImage(glowImg(56, 'rgba(255,200,120,A)'), sx + 2 - 56, sy - 12 - 56); ctx.drawImage(glowImg(18, 'rgba(255,236,190,A)'), sx + 2 - 18, sy - 34 - 18);   // the pool of light, the lamp head
    }
    if (typeof LIFE !== 'undefined') for (const c of LIFE.cars) {
      const sx = (c.x / 4 - camX) * T, sy = (c.y / 4 - camY) * T; if (sx < -60 || sx > SW + 60 || sy < -60 || sy > SH + 60) continue;
      const ux = Math.cos(c.h), uy = Math.sin(c.h);
      ctx.drawImage(glowImg(30, 'rgba(255,240,200,A)'), sx + ux * 34 - 30, sy + uy * 34 - 30);
      ctx.drawImage(glowImg(6, 'rgba(255,40,30,A)'), sx - ux * 19 - 6, sy - uy * 19 - 6);
    }
    if (typeof G !== 'undefined' && G) { const px = (G.x + 0.5 - camX) * T, py = (G.y + 0.5 - camY) * T; ctx.drawImage(glowImg(44, 'rgba(150,170,220,A)'), px - 44, py - 54); }   // enough light to see your own way
  }
  ctx.restore(); SKY.lit.length = 0;
}
{ const _dl = drawTownLabels; drawTownLabels = function (cx, cy) { if (mode === 'walk') drawNight(); _dl(cx, cy); }; }
