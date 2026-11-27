"use strict";
// =====================================================================
//  BUILDINGS AT FF6 SCALE (16 px ≈ 1 m), in 3/4 view like a SNES town.
//  Each real outline becomes walls of a real height (metres) and a roof that follows the footprint.
//  Drawn straight to the screen each frame in world pixels (textures are patterns anchored to the world,
//  so nothing swims as the camera moves). Collision is the outline itself (play.js).
// =====================================================================
for (const b of BLD) {
  const P = b.polyQ || []; b.poly = [];
  for (let i = 0; i < P.length; i += 2) b.poly.push([P[i] / 4, P[i + 1] / 4]);          // in 4 m data cells
  if (b.poly.length < 3) b.poly = [[b.x0, b.y0], [b.x1 + 1, b.y0], [b.x1 + 1, b.y1 + 1], [b.x0, b.y1 + 1]];
  const xs = b.poly.map(p => p[0]), ys = b.poly.map(p => p[1]);
  b.pxMin = Math.min(...xs); b.pxMax = Math.max(...xs); b.pyMin = Math.min(...ys); b.pyMax = Math.max(...ys);
}
// the Fig Tree's door is on its cut corner (Fifth Ave and Clermont)
{ const f = BLD[TOWN.fig]; if (f && f.door) for (let x = f.x1; x > f.x0; x--) if (bAt(x, f.door[1]) === f) { f.door = [x, f.door[1]]; break; } }

// ---------- materials and real heights (metres) by kind ----------
const SIDING = ['#e6e0d0', '#d8ccb0', '#c8d0d4', '#b8c4b0', '#e0d4a8', '#c4b8a8', '#d0c0b8', '#a8b8c8', '#e8e4dc', '#b8a890'];
const SHINGLE = ['#5a5a60', '#4a4448', '#6a5a4a', '#5a4a3e', '#3e4a4e', '#6e6460', '#4e3e36', '#5e6a5a'];
const BRICK = ['#9a4a36', '#a85a40', '#8a3e30', '#b06a4a', '#7a4a3a', '#c4a070'];
function rnd(b, k) { return hash(b.id * 7 + k, b.id * 13 + k * 31); }
function roofTone(hex) {   // the photo's roof colour, nudged toward pixel-art clarity: a little more contrast, snapped to steps of 8
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255], avg = (c[0] + c[1] + c[2]) / 3;
  return '#' + c.map(v => Math.max(16, Math.min(232, Math.round((avg + (v - avg) * 1.25 - 128) * 1.08 + 122) >> 3 << 3))).map(v => v.toString(16).padStart(2, '0')).join('');
}
function bstyle(b) {
  if (b.style) return b.style;
  const k = b.type, big = b.area > 600, r = i => rnd(b, i);
  let s;
  switch (k) {
    case 'store': s = { m: big ? 6.5 : 7.5, floors: big ? 1 : 2, roof: 'flat', roofCol: ['#6a6a70', '#5e5a58', '#74706a'][r(1) % 3], wall: BRICK[r(2) % BRICK.length], mat: 'brick', win: 'store', parapet: 1 }; break;
    case 'fig': s = { m: 7.5, floors: 2, roof: 'flat', roofCol: '#6e6a64', wall: '#4e5650', mat: 'siding', win: 'none', parapet: 1, fig: 1 }; break;
    case 'civic': s = { m: 8, roof: big ? 'flat' : 'hip', roofCol: '#4e5a6a', wall: BRICK[(r(2) % 3) + 3], mat: 'brick', win: 'tall', parapet: big ? 1 : 0 }; break;
    case 'school': s = { m: 7.5, roof: 'flat', roofCol: '#6a6862', wall: '#b06a4a', mat: 'brick', win: 'band', parapet: 1 }; break;
    case 'hospital': s = { m: 10, roof: 'flat', roofCol: '#8a8e94', wall: '#d8dce0', mat: 'panel', win: 'band', parapet: 1 }; break;
    case 'apartments': s = { m: big ? 9.5 : 7, floors: big ? 3 : 2, roof: big ? 'flat' : 'gable', roofCol: SHINGLE[r(1) % SHINGLE.length], wall: SIDING[r(2) % SIDING.length], mat: 'siding', win: 'house', parapet: big ? 1 : 0 }; break;
    case 'church': s = { m: 8.5, roof: 'gable', roofCol: ['#5a5868', '#4e5a64', '#6a5a50'][r(1) % 3], wall: r(2) % 2 ? '#c8bca8' : '#9a4a36', mat: r(2) % 2 ? 'stone' : 'brick', win: 'arch', steeple: 1 }; break;
    case 'factory': s = { m: 7, roof: 'flat', roofCol: '#9aa0a6', wall: ['#a8acb0', '#8e9296', '#b0a898'][r(2) % 3], mat: 'ribbed', win: 'high' }; break;
    case 'barn': s = { m: 5.5, roof: 'gambrel', roofCol: r(1) % 2 ? '#5a5e64' : '#8a2a22', wall: '#a83a2e', mat: 'board', win: 'barn' }; break;
    case 'garage': s = { m: 2.7, roof: 'gable', roofCol: SHINGLE[r(1) % SHINGLE.length], wall: SIDING[r(2) % SIDING.length], mat: 'siding', win: 'garage' }; break;
    case 'shed': s = { m: 2.3, roof: 'gable', roofCol: SHINGLE[r(1) % SHINGLE.length], wall: ['#a08a6a', '#8a7a5a', '#c8c0b0'][r(2) % 3], mat: 'board', win: 'none' }; break;
    default: { const two = b.area > 170; s = { m: two ? 5.8 : 3.2, floors: two ? 2 : 1, roof: r(3) % 4 === 0 ? 'hip' : 'gable', roofCol: SHINGLE[r(1) % SHINGLE.length], wall: SIDING[r(2) % SIDING.length], mat: 'siding', win: 'house', chimney: r(4) % 3 === 0 }; }
  }
  if (k === 'store') s.awning = ['#8a2a2a', '#2a4a7a', '#2a6a3a', '#7a5a2a', '#5a3a6a', null][r(5) % 6];
  // the real building (Nov 12): its measured height and roof shape from the 2017 county lidar, its roof colour from the 2025
  // photo. A pitched roof's peak sits above the walls, so walls take about 80% of the measured height.
  if (b.lh) {
    const flat = !!b.lflat, wallM = Math.max(2.2, Math.min(30, flat ? b.lh : b.lh * 0.8));
    s.m = wallM; s.floors = Math.max(1, Math.min(8, Math.round(wallM / 3.3)));
    if (flat && s.roof !== 'flat') { s.roof = 'flat'; s.parapet = k === 'store' || k === 'civic' ? 1 : 0; }
    if (!flat && s.roof === 'flat' && b.area < 400) s.roof = r(3) % 3 === 0 ? 'hip' : 'gable';
  }
  if (b.rc) s.roofCol = roofTone(b.rc);
  s.h = Math.round(s.m * PM);
  return (b.style = s);
}

// ---------- textures as world-anchored patterns ----------
const PAT = new Map();
function pat(kind, col) {
  const key = kind + col; let p = PAT.get(key); if (p) return p;
  const c = document.createElement('canvas'), g = c.getContext('2d'), F = (cc, x, y, w, h) => { g.fillStyle = cc; g.fillRect(x, y, w, h); };
  const dk = shade(col, -0.2), lt = shade(col, 0.12);
  if (kind === 'brick') { c.width = 16; c.height = 8; F(col, 0, 0, 16, 8); F(dk, 0, 3, 16, 1); F(dk, 0, 7, 16, 1); F(dk, 0, 0, 1, 3); F(dk, 8, 4, 1, 3); F(lt, 2, 1, 3, 1); F(lt, 11, 5, 2, 1); }
  else if (kind === 'siding') { c.width = 16; c.height = 4; F(col, 0, 0, 16, 4); F(dk, 0, 3, 16, 1); F(lt, 0, 0, 16, 1); }
  else if (kind === 'board') { c.width = 6; c.height = 16; F(col, 0, 0, 6, 16); F(dk, 5, 0, 1, 16); F(lt, 0, 0, 1, 16); }
  else if (kind === 'ribbed') { c.width = 6; c.height = 16; F(col, 0, 0, 6, 16); F(dk, 0, 0, 1, 16); F(lt, 3, 0, 1, 16); }
  else if (kind === 'stone') { c.width = 16; c.height = 12; F(col, 0, 0, 16, 12); F(dk, 0, 5, 16, 1); F(dk, 0, 11, 16, 1); F(dk, 6, 0, 1, 5); F(dk, 12, 6, 1, 5); F(lt, 1, 1, 4, 1); }
  else if (kind === 'panel') { c.width = 32; c.height = 16; F(col, 0, 0, 32, 16); F(dk, 0, 15, 32, 1); F(dk, 31, 0, 1, 16); }
  else if (kind === 'gravel') { c.width = c.height = 32; F(col, 0, 0, 32, 32); for (let i = 0; i < 60; i++) { const q = hash(i, col.length + i * 3); F(i % 2 ? dk : lt, q % 32, (q >> 5) % 32, 1, 1); } }
  else if (kind === 'shingle') { c.width = 16; c.height = 8; F(col, 0, 0, 16, 8); F(dk, 0, 3, 16, 1); F(dk, 0, 7, 16, 1); F(dk, 4, 0, 1, 3); F(dk, 12, 4, 1, 3); F(lt, 0, 0, 16, 1); }
  else if (kind === 'stucco') { c.width = c.height = 8; F(col, 0, 0, 8, 8); F(lt, 1, 2, 1, 1); F(dk, 5, 1, 1, 1); F(lt, 6, 5, 1, 1); F(dk, 2, 6, 1, 1); }   // Street View survey (Nov 17): smooth or dashed render
  else if (kind === 'log') { c.width = 16; c.height = 6; F(col, 0, 0, 16, 6); F(dk, 0, 5, 16, 1); F(lt, 0, 1, 16, 1); F(dk, 9, 0, 1, 5); }
  else { c.width = c.height = 4; F(col, 0, 0, 4, 4); }
  p = ctx.createPattern(c, 'repeat'); PAT.set(key, p); return p;
}

// ---------- geometry helpers (world pixels) ----------
function clipHalf(P, nx, ny, c) {   // keep points with nx*x+ny*y >= c
  const out = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], da = nx * a[0] + ny * a[1] - c, db = nx * b[0] + ny * b[1] - c;
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
  }
  return out;
}
function mainAxis(P) { let best = 0, ax = 1, ay = 0;
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); if (L > best) { best = L; ax = dx / L; ay = dy / L; } }
  return [ax, ay]; }
function path(P) { ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }
function signedArea(P) { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
function F(c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
let VIEW = [0, 0, 0, 0];   // visible world-pixel box, for culling details

// ---------- details on a wall facing the viewer: windows, doors, awnings (all sizes in metres) ----------
function backStyle(s) {   // the rear wall as surveyed: its own brick or siding, plain windows (or none, bricked up), back doors
  const k = s.back; return Object.assign({}, s, { isBack: 1, wall: k.wall || s.wall, mat: k.mat || s.mat, win: k.winN && k.winN.some(v => v > 0) ? 'house' : 'none', winN: k.winN || null,
    awning: null, shop: null, signBox: null, porch: 0, gd: 0, shutters: null, winAwn: null, trim: k.trim || '#d8d4cc', bk: k }); }
function backExtras(s, xl, xr, by, h) {
  const k = s.bk, m = v => v * PM, W = xr - xl;
  if (k.door) { const dx = xl + W * (k.doorAt || 0.3), dw = m(1.0), dh = m(2.1); F('#1c1618', dx - dw / 2 - 1, by - dh - 1, dw + 2, dh + 1); F(k.door, dx - dw / 2, by - dh, dw, dh); F('#c8c8cc', dx + dw / 2 - 3, by - dh / 2, 2, 2); }
  if (k.stairs) { const sx = xr - m(2.6); if (h > m(4)) { F('#1a1a1e', sx, by - m(3.2), m(2.2), 2); for (let i = 0; i < 8; i++) F('#2a2a2e', sx + i * m(0.27), by - i * m(0.4), m(0.3), 2); F('#1a1a1e', sx + m(2.1), by - m(4.2), 2, m(4.2)); F('#1a1a1e', sx, by - m(4.2), m(2.2), 2); } }
  if (k.ghost && W > m(5) && h > m(5)) { const gw = Math.min(W - m(1), m(6)), gx = xl + (W - gw) / 2, gy = by - h + m(0.6);
    F('rgba(232,224,200,.28)', gx, gy, gw, m(1.6)); F('rgba(232,224,200,.22)', gx + m(0.4), gy + m(0.5), gw - m(0.8), 2); F('rgba(232,224,200,.22)', gx + m(0.4), gy + m(1.0), gw * 0.6, 2); }
  if (k.utility) { F('#7a7e84', xl + m(0.6), by - m(1.6), m(0.8), m(0.5)); F('#5a5e64', xl + m(0.6), by - m(1.1), 2, m(1.1)); }
}
function wallDetails(b, s, xl, xr, by, doorOverride) {
  const h = s.h, W = xr - xl, m = v => v * PM, inView = x => x > VIEW[0] - 64 && x < VIEW[2] + 64;
  const doorX = doorOverride !== undefined ? doorOverride : b.door && b.face === 'S' ? (s.shop === 'wdw' ? (xl + xr) / 2 : (b.door[0] + 0.5) * T) : null, nearDoor = x => doorX != null && Math.abs(x - doorX) < m(1.6);
  const win = (cx, y0, w, hh, frame, glass) => { if (!inView(cx)) return; F(frame || '#e8e4dc', cx - w / 2 - 2, by - y0 - hh - 2, w + 4, hh + 4); F(glass || '#2a3a52', cx - w / 2, by - y0 - hh, w, hh);
    F('#6c8cb0', cx - w / 2, by - y0 - hh, w, 2); F('rgba(255,255,255,.18)', cx - w / 2 + 2, by - y0 - hh + 3, 2, hh - 6); };
  const along = (step, f) => { const n = Math.max(1, Math.floor(W / m(step))); for (let i = 0; i < n; i++) f(xl + (i + 0.5) * W / n); };
  switch (s.win) {
    case 'house': {
      const floors = s.floors || 1;
      const one = (x, f) => { const y0 = m(0.9 + f * 2.7), hh = m(1.3); win(x, y0, m(1.0), hh, s.winN ? s.trim : undefined); F(shade(s.wall, -0.3), x - m(0.6), by - y0 - 1, m(1.2), 2);
        if (s.shutters && b.face === 'S' && inView(x)) { F(s.shutters, x - m(0.95), by - y0 - hh, m(0.35), hh); F(s.shutters, x + m(0.6), by - y0 - hh, m(0.35), hh); }
        if (s.winAwn && b.face !== 'N' && f === 0 && inView(x)) { F(s.winAwn, x - m(0.75), by - m(2.45), m(1.5), m(0.35)); for (let k = 0; k < m(1.5); k += 4) F('rgba(255,255,255,.3)', x - m(0.75) + k, by - m(2.45), 2, m(0.35)); } };
      // Street View survey (Nov 17): the real count of front windows on each floor, on walls that face the camera
      if (s.winN && (b.face === 'S' || s.isBack)) { for (let f = 0; f < floors; f++) { const n = s.winN[Math.min(f, s.winN.length - 1)] | 0; for (let i = 0; i < n; i++) { const x = xl + (i + 0.5) * W / n; if (f === 0 && nearDoor(x)) continue; one(x, f); } } }
      else along(3.6, x => { if (nearDoor(x)) return; for (let f = 0; f < floors; f++) one(x, f); });
      houseExtras(b, s, xl, xr, by, W, m, inView);
      break; }
    case 'store': {
      // ground floor: display windows on a low base, pilasters between; sign band; upper windows; cornice
      if (s.baseCol) { ctx.fillStyle = pat(s.baseMat || 'brick', s.baseCol); ctx.fillRect(xl, by - m(s.baseH || 3.6), W, m(s.baseH || 3.6)); }
      F(shade(s.baseCol || s.wall, -0.25), xl, by - m(0.5), W, m(0.5));
      if (s.shop === 'wdw') { const ww = W * 0.36; for (const x of [xl + W * 0.21, xr - W * 0.21]) { win(x, m(0.5), ww, m(2.2), '#c8c0b0', '#1e2a3e'); F('#d8c070', x - ww / 2 + 2, by - m(0.7), m(0.3), 1); } }
      else along(3.2, x => { if (nearDoor(x)) return; win(x, m(0.5), m(2.5), m(2.2), '#c8c0b0', '#1e2a3e'); F('#d8c070', x - m(1.1), by - m(0.7), m(0.3), 1); });
      F(shade(s.baseCol || s.wall, -0.35), xl, by - m(3.4), W, m(0.6));                                                     // sign band
      if (s.floors > 1) { if (s.upWin) { for (let i = 0; i < s.upWin; i++) win(xl + W * (0.5 + i - s.upWin / 2) / (s.upWin + 0.6) + W / 2, m(4.2), m(1.0), m(1.6), s.trim); } else along(2.4, x => win(x, m(4.2), m(1.0), m(1.6), s.trim)); }
      storeExtras(b, s, xl, xr, by, W, m, inView);
      F(shade(s.wall, 0.15), xl, by - h, W, m(0.35)); F(shade(s.wall, -0.3), xl, by - h + m(0.35), W, 2);     // cornice
      if (s.awning) { const y0 = by - m(3.1); ctx.fillStyle = s.awning; ctx.beginPath(); ctx.moveTo(xl, y0 - m(0.5)); ctx.lineTo(xr, y0 - m(0.5)); ctx.lineTo(xr + 4, y0 + m(0.3)); ctx.lineTo(xl - 4, y0 + m(0.3)); ctx.fill();
        for (let x = xl; x < xr; x += m(0.6)) if (inView(x)) F(s.awnStripe || 'rgba(255,255,255,.28)', x, y0 - m(0.5), m(0.3), m(0.8)); F('rgba(0,0,0,.25)', xl - 4, y0 + m(0.3), W + 8, 2); }
      break; }
    case 'tall': along(3, x => { if (nearDoor(x)) return; win(x, m(1.0), m(1.2), m(2.4)); if (h > m(6)) win(x, m(4.4), m(1.2), m(2.4)); }); break;
    case 'band': for (const y0 of [1.0, 4.2, 7.4]) { if (m(y0 + 1.6) > h - 4) break; F('#e8e4dc', xl + 6, by - m(y0) - m(1.4) - 2, W - 12, m(1.4) + 4); F('#2a3a52', xl + 8, by - m(y0) - m(1.4), W - 16, m(1.4));
        for (let x = xl + 8; x < xr - 8; x += m(1.2)) if (inView(x)) F('#e8e4dc', x, by - m(y0) - m(1.4), 2, m(1.4)); } break;
    case 'arch': along(3.5, x => { if (nearDoor(x) || !inView(x)) return; F('#e8e0d0', x - m(0.65), by - m(5.2), m(1.3), m(4.2)); ctx.fillStyle = '#3a2a4a';
        ctx.beginPath(); ctx.moveTo(x - m(0.5), by - m(1.2)); ctx.lineTo(x - m(0.5), by - m(4.4)); ctx.arc(x, by - m(4.4), m(0.5), Math.PI, 0); ctx.lineTo(x + m(0.5), by - m(1.2)); ctx.fill();
        F('#c8a0e0', x - m(0.3), by - m(4.2), m(0.25), m(1.2)); F('#e8c070', x + m(0.05), by - m(3.4), m(0.25), m(1.0)); }); break;
    case 'high': along(3, x => win(x, h - m(1.6), m(2), m(0.7), '#c8ccd0', '#4a5a6a')); if (inView(xl + m(4))) { F('#6a6e74', xl + m(2), by - m(4), m(3.5), m(4)); for (let y = 4; y < m(4); y += 6) F('#585c62', xl + m(2), by - m(4) + y, m(3.5), 1); } break;
    case 'garage': { const n = Math.max(1, Math.round(W / m(3.2))); for (let i = 0; i < n; i++) { const x = xl + (i + 0.5) * W / n; F('#d8d8dc', x - m(1.25), by - m(2.1), m(2.5), m(2.1)); for (let y = 4; y < m(2.1); y += 5) F('#b0b0b6', x - m(1.25), by - m(2.1) + y, m(2.5), 1); } break; }
    case 'barn': { const x = (xl + xr) / 2; F('#7a2a22', x - m(1.6), by - m(3.4), m(3.2), m(3.4)); ctx.strokeStyle = '#e8e0d0'; ctx.lineWidth = 2; ctx.strokeRect(x - m(1.6), by - m(3.4), m(3.2), m(3.4));
      ctx.beginPath(); ctx.moveTo(x - m(1.6), by - m(3.4)); ctx.lineTo(x + m(1.6), by); ctx.moveTo(x + m(1.6), by - m(3.4)); ctx.lineTo(x - m(1.6), by); ctx.stroke(); break; }
  }
  if (s.glass && W > m(20) && inView(xl + W * 0.2)) {   // a green-glass curtain wall with a stone pier carrying the sign
    const gw = Math.min(W * 0.25, m(26)), gx = xl + W * 0.1, gh = Math.min(h - m(1.2), m(7));
    F('#1c1618', gx - 1, by - gh - 1, gw + 2, gh + 1); F('#3e6a62', gx, by - gh, gw, gh);
    for (let x = gx; x < gx + gw; x += m(1.5)) F('#c8ccc8', x, by - gh, 1, gh);
    for (const y of [0.33, 0.66]) F('#c8ccc8', gx, by - gh * y, gw, 1); F('rgba(255,255,255,.18)', gx + 3, by - gh + 2, gw * 0.4, 2);
    const px = gx - m(2.4), ph = Math.min(h + m(1.0), m(9)); ctx.fillStyle = pat('stone', s.pier || '#b09878'); ctx.fillRect(px, by - ph, m(2.2), ph);
    F('#1c1618', px - 1, by - ph - 1, m(2.2) + 2, 2); F('#f2f1ea', px + m(0.3), by - ph + m(1.2), m(1.6), m(1.4)); F('#3a8a3a', px + m(0.9), by - ph + m(1.4), m(0.4), m(0.9));
  }
  // the door
  if (doorX != null && doorX >= xl - 2 && doorX <= xr + 2 && !s.fig) {
    const dw = Math.max(6, s.win === 'store' || s.win === 'tall' ? m(1.2) : m(1.0)), dh = Math.min(h - 3, Math.max(10, m(2.2))), dc = s.doorCol || (b.type === 'church' ? '#5a2a1a' : '#4a2e1a');
    F(shade(s.wall, -0.4), doorX - dw / 2 - 2, by - dh - 2, dw + 4, dh + 2); F(dc, doorX - dw / 2, by - dh, dw, dh);
    if (s.win === 'store') F('#2a3a52', doorX - dw / 2 + 3, by - dh + 3, dw - 6, dh * 0.55);
    F('#e8c060', doorX + dw / 2 - 4, by - dh * 0.48, 2, 2); F('#b4b0a6', doorX - dw / 2 - 3, by, dw + 6, 3);
  }
}

// ---------- extras from street photos (Nov 12): porches, stone bases, garage doors, piers, panels ----------
function houseExtras(b, s, xl, xr, by, W, m, inView) {
  if (b.face === 'N') s = Object.assign({}, s, { porch: 0, gd: 0 });   // a north-facing house shows us its back wall: its porch and garage doors are on the far side
  if (s.stone) { ctx.fillStyle = pat('stone', s.stone); ctx.fillRect(xl, by - m(s.stoneH || 0.7), W, m(s.stoneH || 0.7)); }
  if (s.gd) { const n = s.gd, gw = m(2.5), at = s.gdAt || 'L', span = n * (gw + m(0.4)), x0 = at === 'R' ? xr - span - m(0.3) : at === 'C' ? (xl + xr - span) / 2 : xl + m(0.3);
    for (let i = 0; i < n; i++) { const x = x0 + i * (gw + m(0.4)); if (!inView(x)) continue; F('#1c1618', x - 1, by - m(2.2) - 1, gw + 2, m(2.2) + 1); F(s.gdCol || '#ecebe6', x, by - m(2.2), gw, m(2.2));
      for (let y = 5; y < m(2.2); y += 6) F(shade(s.gdCol || '#ecebe6', -0.15), x, by - m(2.2) + y, gw, 1); } }
  if (s.turret) {   // a round corner tower with a conical roof
    const tw = m(2.6), tx = s.turretAt === 'L' ? xl + m(0.3) : xr - tw - m(0.3);
    if (inView(tx)) {
    const top = by - s.h - m(1.4);
    ctx.fillStyle = pat(s.mat, s.wall); ctx.fillRect(tx, top, tw, by - top); F('rgba(0,0,0,.18)', tx + tw * 0.6, top, tw * 0.4, by - top);
    for (const y0 of [1.0, 3.8]) { F('#e8e4dc', tx + tw / 2 - m(0.45) - 2, by - m(y0) - m(1.4) - 2, m(0.9) + 4, m(1.4) + 4); F('#2a3a52', tx + tw / 2 - m(0.45), by - m(y0) - m(1.4), m(0.9), m(1.4)); }
    ctx.fillStyle = s.roofCol || '#6a6460'; ctx.beginPath(); ctx.moveTo(tx - 3, top); ctx.lineTo(tx + tw / 2, top - m(3.2)); ctx.lineTo(tx + tw + 3, top); ctx.fill();
    ctx.strokeStyle = '#1c1618'; ctx.lineWidth = 2; ctx.stroke(); F('#3a3438', tx + tw / 2 - 1, top - m(3.2) - 6, 2, 6);
  } }
  if (b.face === 'S') {   // Street View survey notes (Nov 17): bay windows, balconies, porch flags, dishes
    if (s.bay && W > m(6)) { const bw = m(2.6), bx = s.porch === 'L' ? xr - bw - m(1.2) : xl + m(1.2), bt = by - m(2.6);
      if (inView(bx)) { ctx.fillStyle = pat(s.mat, shade(s.wall, 0.06)); ctx.fillRect(bx, bt, bw, m(2.6)); F('#1c1618', bx - 1, bt - 1, bw + 2, 1);
        for (const k of [0.17, 0.5, 0.83]) { const wx = bx + bw * k; F(s.trim || '#e8e4dc', wx - m(0.32) - 1, bt + m(0.6) - 1, m(0.64) + 2, m(1.3) + 2); F('#2a3a52', wx - m(0.32), bt + m(0.6), m(0.64), m(1.3)); }
        ctx.fillStyle = s.roofCol || '#6a6460'; ctx.beginPath(); ctx.moveTo(bx - 3, bt + 1); ctx.lineTo(bx + bw + 3, bt + 1); ctx.lineTo(bx + bw, bt - m(0.5)); ctx.lineTo(bx, bt - m(0.5)); ctx.fill(); } }
    if (s.balcony && (s.floors || 1) >= 2) { const y = by - m(3.6); F(s.trim || '#f4f2ec', xl + W * 0.25, y, W * 0.5, 2); for (let x = xl + W * 0.25; x < xl + W * 0.75; x += 4) F(s.trim || '#f4f2ec', x, y, 1, m(0.8)); F(s.trim || '#f4f2ec', xl + W * 0.25, y + m(0.8), W * 0.5, 2); }
    if (s.porchFlag) { const fx = (s.porch === 'R' ? xr - m(0.6) : xl + m(0.6)), fy = by - m(2.6); if (inView(fx)) { ctx.strokeStyle = '#d8d4cc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + m(1.0), fy - m(0.7)); ctx.stroke();
      for (let i = 0; i < 5; i++) F(i % 2 ? '#f2f1ea' : '#b8323a', fx + m(0.5), fy - m(0.9) + i * m(0.12), m(0.8), m(0.12) + 1); F('#2a3a7a', fx + m(0.5), fy - m(0.9), m(0.35), m(0.3)); } }
    if (s.dish) { const dx = xr - m(1.2), dy = by - s.h + m(0.6); if (inView(dx)) { F('#5a5e64', dx, dy, 2, m(0.5)); F('#d8dce0', dx - m(0.35), dy - m(0.4), m(0.7), m(0.45)); } }
    // second pass (Nov 18): front steps, a deck, a ramp, a carport, from the surveyors' notes
    const dX = b.door ? Math.max(xl + m(1), Math.min(xr - m(1), (b.door[0] + 0.5) * T)) : (xl + xr) / 2, wood = '#8a6a48';
    if (s.stoop && !s.porch && inView(dX)) { const c = s.stoop; F(shade(c, -0.3), dX - m(0.9), by - m(0.5), m(1.8), m(0.5)); F(c, dX - m(0.8), by - m(0.5), m(1.6), m(0.22)); F(shade(c, 0.1), dX - m(0.7), by - m(0.28), m(1.4), m(0.28));
      F('#2a2a2e', dX - m(0.85), by - m(1.3), 1, m(0.8)); F('#2a2a2e', dX + m(0.85), by - m(1.3), 1, m(0.8)); }
    if (s.deck && W > m(5)) { const dw = Math.min(W * 0.4, m(4)), dxL = (dX > (xl + xr) / 2) ? xl + m(0.3) : xr - dw - m(0.3);
      if (inView(dxL)) { F(shade(wood, -0.3), dxL, by - m(0.7), dw, m(0.7)); for (let x = dxL; x < dxL + dw; x += 3) F(shade(wood, -0.15), x, by - m(0.7), 1, m(0.7));
        F(wood, dxL, by - m(1.6), dw, 2); for (let x = dxL; x <= dxL + dw; x += m(0.3)) F(wood, x, by - m(1.6), 1, m(0.9)); F(shade(wood, 0.15), dxL, by - m(0.72), dw, 2); } }
    if (s.ramp && inView(dX)) { const rl = Math.min(m(4.5), (dX > (xl + xr) / 2 ? dX - xl : xr - dX) - m(0.8)), dir = dX > (xl + xr) / 2 ? -1 : 1;
      if (rl > m(1.5)) { ctx.strokeStyle = '#c8ccd0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dX + dir * m(0.7), by - m(1.5)); ctx.lineTo(dX + dir * (m(0.7) + rl), by - m(0.9)); ctx.stroke();
        ctx.fillStyle = '#a8acb2'; ctx.beginPath(); ctx.moveTo(dX + dir * m(0.7), by - m(0.6)); ctx.lineTo(dX + dir * (m(0.7) + rl), by - 1); ctx.lineTo(dX + dir * m(0.7), by - 1); ctx.fill(); } }
    if (s.carport && W > m(7)) { const cw = m(3.2), cx0 = s.carport === 'R' ? xr - cw : xl, top = by - m(2.6);
      if (inView(cx0)) { F('rgba(10,10,14,.55)', cx0, top, cw, m(2.6)); F(s.roofCol || '#6a6460', cx0 - 2, top - m(0.35), cw + 4, m(0.35)); F('#1c1618', cx0 - 2, top, cw + 4, 2);
        for (const ox of [0.08, 0.92]) F('#e8e6e0', cx0 + cw * ox - 1, top, 3, m(2.6)); } }
  }
  if (s.antenna) {   // a TV antenna on a mast above the roof: seen from any side
    const ax = xl + Math.min(W * 0.3, m(2.4)), top = by - s.h - (s.roofH || m(2.2)) - m(1.8);
    if (inView(ax)) { F('#6a6e74', ax, top, 2, m(3.2)); for (const [w, y0] of [[1.6, 0], [1.2, 0.35], [0.8, 0.7]]) F('#6a6e74', ax - m(w) / 2, top + m(y0), m(w), 1); }
  }
  if (s.porch) {   // a porch across part of the front: roof, posts, railing, lattice skirt
    const f = s.porch === 'full' ? 1 : 0.5, pw = W * f - m(0.4), px = s.porch === 'R' ? xr - pw - m(0.2) : s.porch === 'C' ? (xl + xr - pw) / 2 : xl + m(0.2), pc = s.porchCol || '#f4f2ec', top = by - m(2.9);
    if (!inView(px) && !inView(px + pw)) return;
    ctx.fillStyle = s.roofCol || '#6a6460'; ctx.beginPath(); ctx.moveTo(px - 3, top + m(0.5)); ctx.lineTo(px + pw + 3, top + m(0.5)); ctx.lineTo(px + pw, top - m(0.3)); ctx.lineTo(px, top - m(0.3)); ctx.fill();
    F('#1c1618', px - 3, top + m(0.5), pw + 6, 2); F(pc, px - 2, top + m(0.5) + 2, pw + 4, 3);
    const n = Math.max(2, Math.round(pw / m(2)) + 1); for (let i = 0; i < n; i++) { const x = px + i * (pw - 3) / (n - 1); F(pc, x, top + m(0.5), 3, by - top - m(0.5)); F('rgba(0,0,0,.25)', x + 3, top + m(0.5), 1, by - top - m(0.5)); }
    F(pc, px, by - m(1.25), pw, 2); for (let x = px + 3; x < px + pw - 2; x += 4) F(pc, x, by - m(1.25), 1, m(0.7));
    F('rgba(0,0,0,.35)', px, by - m(0.55), pw, m(0.55)); for (let x = px; x < px + pw; x += 4) F(shade(pc, -0.2), x, by - m(0.55), 1, m(0.55));
  }
}
function storeExtras(b, s, xl, xr, by, W, m, inView) {
  if (s.piers) for (const x of [xl, xr - m(0.6)]) { ctx.fillStyle = pat('brick', s.piers); ctx.fillRect(x, by - s.h, m(0.6), s.h); }
  if (s.panels) { const n = Math.max(2, Math.round(W / m(3))); for (let i = 0; i < n; i++) { const x = xl + m(0.4) + i * (W - m(0.8)) / n; F(shade(s.wall, -0.22), x + 2, by - s.h + m(1.0), (W - m(0.8)) / n - 4, m(1.1)); F(shade(s.wall, 0.12), x + 3, by - s.h + m(1.0) + m(1.1) - 2, (W - m(0.8)) / n - 6, 1); } }
  if (s.accents) { const y = by - s.h + m(0.7); for (let x = xl + m(0.6); x < xr - m(0.6); x += m(1.6)) if (inView(x)) { F(s.accents, x, y, m(0.5), m(0.35)); F(shade(s.accents, -0.2), x, y + m(0.35), m(0.5), 1); } }
  if (s.plaque) { const cx = (xl + xr) / 2, top = by - s.h, w = W * 0.4; ctx.fillStyle = s.wall; ctx.beginPath(); ctx.moveTo(cx - w / 2, top + 1); ctx.lineTo(cx - w / 2, top - m(0.6)); ctx.quadraticCurveTo(cx, top - m(1.6), cx + w / 2, top - m(0.6)); ctx.lineTo(cx + w / 2, top + 1); ctx.fill();
    F('#e4dcc8', cx - m(1.1), top - m(0.7), m(2.2), m(0.5)); F(shade(s.wall, 0.2), cx - w / 2, top + m(0.3), w, 2); }
  if (s.porch) houseExtras(b, Object.assign({}, s, { stone: null, gd: 0 }), xl, xr, by, W, m, inView);
  if (s.temple) {   // a classical bank front: entablature, pediment, four columns
    const top = by - s.h, cx = (xl + xr) / 2, pw = W * 0.7, lt = shade(s.wall, 0.12), dk = shade(s.wall, -0.22);
    F(dk, xl, top + m(1.2), W, 2); F(lt, xl, top + m(0.5), W, m(0.7));
    ctx.fillStyle = lt; ctx.beginPath(); ctx.moveTo(cx - pw / 2, top + 1); ctx.lineTo(cx, top - m(2.2)); ctx.lineTo(cx + pw / 2, top + 1); ctx.fill();
    ctx.strokeStyle = dk; ctx.lineWidth = 2; ctx.stroke();
    for (let i = 0; i < 4; i++) { const x = cx - pw * 0.36 + i * pw * 0.24; F(lt, x - m(0.4), top + m(1.3), m(0.8), s.h - m(1.9)); F(dk, x + m(0.2), top + m(1.3), 2, s.h - m(1.9)); F(dk, x - m(0.55), top + m(1.3), m(1.1), 3); F(dk, x - m(0.55), by - m(0.6), m(1.1), 3); }
  }
  if (s.mural) {   // a big flag mural painted high on the wall (seen above the neighbour's roof)
    const w = Math.min(W * 0.5, m(7)), h = m(3.6), x = xr - w - m(0.4), y = by - s.h + m(0.8);
    for (let i = 0; i < 7; i++) F(i % 2 ? '#f2f1ea' : '#b8323a', x, y + i * h / 7, w, h / 7 + 1);
    F('#2a3a7a', x, y, w * 0.42, h * 4 / 7); for (let i = 0; i < 12; i++) F('#f2f1ea', x + 3 + (i % 4) * w * 0.1, y + 3 + Math.floor(i / 4) * h * 0.17, 2, 2);
    F('rgba(0,0,0,.25)', x - 1, y - 1, w + 2, 1); F('rgba(0,0,0,.25)', x - 1, y + h, w + 2, 1);
  }
  if (s.stack) { const x = s.stack === 'W' ? xl + m(0.6) : xr - m(1.8); ctx.fillStyle = pat('brick', s.wall); ctx.fillRect(x, by - s.h - m(2.4), m(1.2), m(2.4) + 2); F(shade(s.wall, -0.4), x - 1, by - s.h - m(2.4) - 2, m(1.2) + 2, 3); }
}

// ---------- The Blessed Fig Tree, 800 Fifth Ave, from the owner's photo (sizes in metres) ----------
function paintFigFront(xl, xr, by, h) {
  const m = v => v * PM, W = xr - xl, dx = xr - m(1.6);
  // upper storey: tan lap siding, the old brick pilaster and arch, a double-hung window
  ctx.fillStyle = pat('siding', '#d6c6a4'); ctx.fillRect(xl, by - h, W, h - m(4.2));
  ctx.fillStyle = pat('brick', '#6e4e38'); ctx.fillRect(xl, by - h, m(0.7), h - m(4.2)); F('#5a3e2c', xl + m(0.7), by - h, 2, h - m(4.2));
  ctx.strokeStyle = '#7a5a40'; ctx.lineWidth = m(0.3); ctx.beginPath(); ctx.arc(xl + m(0.7) + W * 0.27, by - m(4.5), W * 0.24, Math.PI, 0); ctx.stroke();
  F('#f2f0e8', xr - m(2.6), by - h + m(0.6), m(1.0), m(1.4)); F('#4e6276', xr - m(2.6) + 2, by - h + m(0.6) + 2, m(1.0) - 4, m(0.6)); F('#4e6276', xr - m(2.6) + 2, by - h + m(1.3), m(1.0) - 4, m(0.6));
  F('#4a524c', xl, by - m(4.4), W, m(0.25));                                                                 // dark band
  // storefront: dark green-gray lap siding
  ctx.fillStyle = pat('siding', '#4e5650'); ctx.fillRect(xl, by - m(4.2), W, m(4.2));
  const win = (x, w) => { F('#f2f0e8', x, by - m(2.7), w, m(1.8)); F('#2e3a46', x + 3, by - m(2.7) + 3, w - 6, m(1.8) - 6); F('#7c96b0', x + 3, by - m(2.7) + 3, w - 6, 2);
    F('rgba(255,255,255,.12)', x + w * 0.6, by - m(2.7) + 5, 3, m(1.8) - 10); };
  const mid = xl + (dx - xl) / 2;
  win(xl + m(0.5), mid - xl - m(0.8)); win(mid + m(0.3), dx - mid - m(0.8));
  ctx.fillStyle = '#1a1416'; ctx.beginPath(); ctx.ellipse(xl + m(1.4), by - m(2.35), m(0.45), m(0.22), 0, 0, 6.29); ctx.fill();   // the OPEN sign
  F('#ff6a3a', xl + m(1.1), by - m(2.4), m(0.6), 2); F('#4a8aff', xl + m(1.0), by - m(1.7), m(0.7), 2); F('#ff6a3a', xl + m(1.1), by - m(1.55), m(0.5), 1);   // BOOK store neon
  for (const x of [xl, dx - m(0.35)]) F('#d8c49a', x, by - m(4.2), m(0.3), m(4.2));                        // tan posts
  ctx.fillStyle = pat('siding', '#b47a46'); ctx.fillRect(xl + m(0.3), by - m(0.9), dx - xl - m(0.65), m(0.9));  // cedar knee wall
  // the cut corner with the open door, shelves inside, the 800 plaque
  F('#d8c49a', dx - 2, by - m(2.9), m(1.6) + 2, m(0.2)); F('#241c16', dx, by - m(2.7), m(1.5), m(2.7));
  for (let r = 0; r < 4; r++) { F('#5a3a22', dx + 3, by - m(2.4) + r * m(0.55), m(1.5) - 6, 2); for (let k = 0; k < 6; k++) F(['#c84a3a', '#3a6ab8', '#e8c048', '#4a9a5a', '#d8d0c0', '#7a3a7a'][(k + r) % 6], dx + 4 + k * 3, by - m(2.4) + r * m(0.55) - 6, 2, 6); }
  F('#f4f4f0', dx - m(0.3), by - m(2.3), m(0.25), m(0.6)); for (let i = 0; i < 3; i++) F('#222', dx - m(0.25), by - m(2.25) + i * 3 + 1, 2, 2);
  F('#3a3632', dx, by, m(1.5), 3);
  // canopy: copper pent roof over a white ribbed soffit, wrapping past the corner and sloping toward us
  ctx.fillStyle = '#b8744a'; ctx.beginPath(); ctx.moveTo(xl - 4, by - m(4.3)); ctx.lineTo(xr + m(0.6), by - m(4.3)); ctx.lineTo(xr + m(0.9), by - m(3.6)); ctx.lineTo(xl - 6, by - m(3.6)); ctx.fill();
  for (let x = xl; x < xr + m(0.6); x += m(0.4)) F('#d0905e', x, by - m(4.3), 1, m(0.7));
  F('#eeeae0', xl - 6, by - m(3.6), W + m(0.9) + 6, m(0.55)); for (let x = xl - 4; x < xr + m(0.9); x += m(0.3)) F('#d4d0c6', x, by - m(3.6), 1, m(0.55));
  F('#b8b4a8', xl - 6, by - m(3.05), W + m(0.9) + 6, 2);
  // deck along Fifth with book racks and a shelf, and the corner book cart
  F('#8a5e3c', xl, by, dx - xl - m(0.4), m(0.7)); for (let x = xl; x < dx - m(0.4); x += m(0.25)) F('#6e4a2e', x, by, 1, m(0.7));
  const spines = ['#c84a3a', '#3a6ab8', '#e8c048', '#4a9a5a', '#d8d0c0', '#7a3a7a'];
  const rack = x => { F('#2a2a2e', x + m(0.2), by - m(1.6), 2, m(1.9)); for (let r = 0; r < 5; r++) for (let k = 0; k < 4; k++) F(spines[(k + r * 2) % 6], x + k * 3, by - m(1.6) + r * m(0.3), 2, m(0.25)); };
  rack(xl + m(0.6)); rack(mid + m(0.9));
  F('#7a4e2e', xl + m(1.6), by - m(1.3), m(1.3), m(1.5)); for (let r = 0; r < 3; r++) { F('#5a3a22', xl + m(1.6), by - m(1.3) + r * m(0.5), m(1.3), 2); for (let k = 0; k < 6; k++) F(spines[(k + r) % 6], xl + m(1.6) + 2 + k * 3, by - m(1.3) + r * m(0.5) + 2, 2, m(0.42)); }
  F('#c8b48a', dx - m(0.9), by - m(0.9), m(0.6), m(1.0)); F('#e8e4d8', dx - m(0.9), by - m(1.0), m(0.6), 2);
  // the hanging sign: an open book, the fig tree in the middle
  const sx = xr - m(0.4), sy = by - m(6.1);
  F('#e8e4dc', sx + m(1.0), sy + m(1.4), 2, m(0.6));
  F('#5a4a30', sx, sy, m(2.2), m(1.45)); F('#e8dcb4', sx + 3, sy + 3, m(2.2) - 6, m(1.45) - 6);
  for (let i = 0; i < 3; i++) { F('#8a7a50', sx + 6, sy + 7 + i * 4, m(0.5), 1); F('#8a7a50', sx + m(1.6), sy + 7 + i * 4, m(0.45), 1); }
  ctx.fillStyle = '#2e5a5a'; ctx.beginPath(); ctx.ellipse(sx + m(1.1), sy + m(0.72), m(0.42), m(0.55), 0, 0, 6.29); ctx.fill();
  ctx.fillStyle = '#6aa04a'; ctx.beginPath(); ctx.arc(sx + m(1.1), sy + m(0.6), m(0.28), 0, 6.29); ctx.fill(); F('#7a5a3a', sx + m(1.1) - 1, sy + m(0.75), 3, m(0.35));
}

// ---------- draw one building in world pixels ----------
function drawBuilding(b) {
  const s = bstyle(b), h = s.h;
  const L = b.poly.map(p => [p[0] * T, p[1] * T]), ccw = signedArea(L) > 0;
  const walls = [];
  for (let i = 0; i < L.length; i++) {
    const a = L[i], q = L[(i + 1) % L.length], ex = q[0] - a[0], ey = q[1] - a[1], len = Math.hypot(ex, ey); if (len < 1) continue;
    const nx = (ccw ? ey : -ey) / len, ny = (ccw ? -ex : ex) / len;
    if (ny > 0.05) walls.push({ a, q, nx, ny, len });
  }
  walls.sort((u, v) => Math.min(u.a[1], u.q[1]) - Math.min(v.a[1], v.q[1]));
  const sw = b.face === 'N' && s.back ? backStyle(s) : s;   // a north-facing building shows us its back wall (Street View backs survey)
  for (const w of walls) {
    const lit = w.nx > 0.3 ? -0.14 : w.nx < -0.3 ? 0.06 : 0;
    ctx.beginPath(); ctx.moveTo(w.a[0], w.a[1]); ctx.lineTo(w.q[0], w.q[1]); ctx.lineTo(w.q[0], w.q[1] - h); ctx.lineTo(w.a[0], w.a[1] - h); ctx.closePath();
    ctx.fillStyle = pat(sw.mat, sw.wall); ctx.fill();
    if (lit) { ctx.fillStyle = lit < 0 ? 'rgba(0,0,0,' + (-lit) + ')' : 'rgba(255,255,255,' + lit + ')'; ctx.fill(); }
    if (Math.abs(w.ny) > 0.7) {
      const xl = Math.min(w.a[0], w.q[0]), xr = Math.max(w.a[0], w.q[0]), by = Math.max(w.a[1], w.q[1]);
      if (s.fig && sw === s) paintFigFront(xl, xr, by, h); else { wallDetails(b, sw, xl, xr, by); if (sw.isBack) backExtras(sw, xl, xr, by, h); }
    }
    // FF6 finish: a shadow under the eaves, a dark base line, dark outlines on the wall's ends
    ctx.beginPath(); ctx.moveTo(w.a[0], w.a[1] - h); ctx.lineTo(w.q[0], w.q[1] - h); ctx.lineTo(w.q[0], w.q[1] - h + Math.max(2, PM * 0.75)); ctx.lineTo(w.a[0], w.a[1] - h + Math.max(2, PM * 0.75)); ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(Math.min(w.a[0], w.q[0]), Math.max(w.a[1], w.q[1]) - 2, Math.abs(w.q[0] - w.a[0]) || 1, 3);
    ctx.strokeStyle = '#1c1618'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w.a[0], w.a[1]); ctx.lineTo(w.a[0], w.a[1] - h); ctx.moveTo(w.q[0], w.q[1]); ctx.lineTo(w.q[0], w.q[1] - h); ctx.stroke();
  }
  // the roof: the outline lifted by the wall height
  const RP = L.map(p => [p[0], p[1] - h]);
  if (s.roof === 'flat') {
    path(RP); ctx.fillStyle = s.roofCol; ctx.fill(); ctx.fillStyle = pat('gravel', s.roofCol); ctx.fill();
    ctx.strokeStyle = '#1c1618'; ctx.lineWidth = (s.parapet ? 5 : 3) * Math.min(1, PM / 8) + 1; ctx.stroke();
    ctx.strokeStyle = shade(s.roofCol, s.parapet ? 0.35 : 0.15); ctx.lineWidth = s.parapet ? 2 : 1; ctx.stroke();
    const xs = RP.map(p => p[0]), ys = RP.map(p => p[1]), bx0 = Math.min(...xs), by0 = Math.min(...ys), bw = Math.max(...xs) - bx0, bh = Math.max(...ys) - by0;
    const units = Math.min(6, Math.floor(b.area / 160));
    ctx.save(); path(RP); ctx.clip();
    for (let i = 0; i < units; i++) { const q = hash(b.id, i + 9), ux = bx0 + 12 + q % Math.max(1, bw - 56), uy = by0 + 12 + (q >> 7) % Math.max(1, bh - 40);
      const uw = Math.max(6, 2 * PM), uh = Math.max(5, 1.4 * PM); F('#1c1618', ux - 1, uy - 1, uw + 2, uh + 4); F('#8a8c92', ux, uy + 2, uw, uh); F('#b4b6bc', ux, uy, uw, Math.max(2, uh / 3)); ctx.fillStyle = '#5a5c62'; ctx.beginPath(); ctx.arc(ux + uw / 2, uy + uh / 2 + 2, Math.max(2, PM * 0.45), 0, 6.29); ctx.fill(); }
    if (s.mat === 'ribbed') for (let x = bx0; x < bx0 + bw; x += 6) F('rgba(255,255,255,.12)', x, by0, 1, bh);
    ctx.restore();
  } else {
    const [ax, ay] = mainAxis(RP), nx = -ay, ny = ax, cx = RP.reduce((t, p) => t + p[0], 0) / RP.length, cy = RP.reduce((t, p) => t + p[1], 0) / RP.length;
    const c0 = nx * cx + ny * cy, A = clipHalf(RP, nx, ny, c0), B2 = clipHalf(RP, -nx, -ny, -c0), aDown = ny > 0;
    path(A); ctx.fillStyle = shade(s.roofCol, aDown ? 0.12 : -0.18); ctx.fill(); ctx.fillStyle = pat('shingle', shade(s.roofCol, aDown ? 0.12 : -0.18)); ctx.fill();
    path(B2); ctx.fillStyle = shade(s.roofCol, aDown ? -0.18 : 0.12); ctx.fill(); ctx.fillStyle = pat('shingle', shade(s.roofCol, aDown ? -0.18 : 0.12)); ctx.fill();
    ctx.save(); path(RP); ctx.clip();
    if (s.roof === 'gambrel') { ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2; for (const d of [-PM * 2, PM * 2]) { ctx.beginPath(); ctx.moveTo(cx + nx * d - ax * 4000, cy + ny * d - ay * 4000); ctx.lineTo(cx + nx * d + ax * 4000, cy + ny * d + ay * 4000); ctx.stroke(); } }
    ctx.strokeStyle = shade(s.roofCol, 0.35); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - ax * 4000, cy - ay * 4000); ctx.lineTo(cx + ax * 4000, cy + ay * 4000); ctx.stroke();   // ridge cap
    ctx.restore();
    path(RP); ctx.strokeStyle = '#1c1618'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = shade(s.roofCol, 0.25); ctx.lineWidth = 1; ctx.stroke();
    if (s.dormer && b.face === 'S' && Math.abs(ny) > 0.7) {   // Street View survey (Nov 17): a story-and-a-half's dormers on the slope that faces us
      const S = aDown ? A : B2; if (S.length > 2) { const xs = S.map(p => p[0]), ys = S.map(p => p[1]), sx0 = Math.min(...xs), sx1 = Math.max(...xs), yb = Math.min(...ys) + (Math.max(...ys) - Math.min(...ys)) * 0.78;
        const n = Math.min(3, s.dormer | 0 || 1), dw = PM * 1.6, dh = PM * 1.1;
        for (let i = 0; i < n; i++) { const cx2 = sx0 + (sx1 - sx0) * (0.2 + 0.6 * (i + 0.5) / n); if (cx2 < VIEW[0] - 64 || cx2 > VIEW[2] + 64) continue;
          F('#1c1618', cx2 - dw / 2 - 1, yb - dh - 1, dw + 2, dh + 2); ctx.fillStyle = pat(s.mat, s.wall); ctx.fillRect(cx2 - dw / 2, yb - dh, dw, dh);
          F(s.trim || '#e8e4dc', cx2 - PM * 0.45 - 2, yb - dh + PM * 0.2 - 2, PM * 0.9 + 4, PM * 0.7 + 4); F('#2a3a52', cx2 - PM * 0.45, yb - dh + PM * 0.2, PM * 0.9, PM * 0.7);
          ctx.fillStyle = s.roofCol; ctx.beginPath(); ctx.moveTo(cx2 - dw / 2 - 3, yb - dh + 1); ctx.lineTo(cx2, yb - dh - PM * 0.8); ctx.lineTo(cx2 + dw / 2 + 3, yb - dh + 1); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#1c1618'; ctx.lineWidth = 2; ctx.stroke(); } } }
    if (s.chimney) { const p = RP[rnd(b, 7) % RP.length], qx = (p[0] * 2 + cx) / 3, qy = (p[1] * 2 + cy) / 3; const cw = Math.max(5, Math.round(PM * 1.0)), ch = Math.max(8, Math.round(PM * 1.6)); ctx.fillStyle = pat('brick', '#8a4a3a'); ctx.fillRect(qx - cw / 2, qy - ch, cw, ch + 2); F('#4a2a22', qx - cw / 2 - 1, qy - ch - 1, cw + 2, 2); }
    if (s.steeple) {   // a square tower at the street end of the ridge, with a spire
      const fy = b.face === 'N' ? -1 : 1; let best = RP[0], bs = -1e9; for (const p of RP) { const sc = p[1] * fy; if (sc > bs) { bs = sc; best = p; } }
      const tx = (best[0] * 2 + cx) / 3, ty = (best[1] * 2 + cy) / 3, tw = 3 * PM, th = 7 * PM;
      ctx.fillStyle = pat(s.mat, shade(s.wall, -0.05)); ctx.fillRect(tx - tw / 2, ty - th, tw, th);
      F('#2a2430', tx - 6, ty - th + 14, 12, 22); ctx.fillStyle = '#2a2430'; ctx.beginPath(); ctx.arc(tx, ty - th + 14, 6, Math.PI, 0); ctx.fill();
      ctx.fillStyle = s.roofCol; ctx.beginPath(); ctx.moveTo(tx - tw / 2 - 3, ty - th); ctx.lineTo(tx + tw / 2 + 3, ty - th); ctx.lineTo(tx, ty - th - 10 * PM); ctx.closePath(); ctx.fill();
      ctx.fillStyle = shade(s.roofCol, 0.2); ctx.beginPath(); ctx.moveTo(tx - tw / 2 - 3, ty - th); ctx.lineTo(tx, ty - th); ctx.lineTo(tx, ty - th - 10 * PM); ctx.closePath(); ctx.fill();
      F('#d8c070', tx - 1, ty - th - 10 * PM - 22, 3, 22); F('#d8c070', tx - 6, ty - th - 10 * PM - 16, 13, 3);
    }
  }
  // north-facing storefronts (south side of a street): from above you see their awning reaching over the sidewalk,
  // the sign standing on the parapet, and the shop light on the pavement
  if (b.face === 'N' && (b.type === 'store' || b.type === 'fig' || b.type === 'civic')) {
    const topY = Math.min(...RP.map(p => p[1])), xs2 = RP.filter(p => p[1] < topY + 3).map(p => p[0]), x0 = Math.min(...xs2), x1 = Math.max(...xs2);
    const gy = b.pyMin * T;   // the real front wall's foot, on the sidewalk
    F('rgba(255,230,160,.10)', x0 + 4, gy, x1 - x0 - 8, PM * 1.2);                                  // window light on the sidewalk
    if (s.awning) { F('#1c1618', x0 + 2, topY - PM * 1.3 - 2, x1 - x0 - 4, PM * 1.3 + 4); F(s.awning, x0 + 3, topY - PM * 1.3, x1 - x0 - 6, PM * 1.3);
      for (let x = x0 + 3; x < x1 - 3; x += 12) F('rgba(255,255,255,.28)', x, topY - PM * 1.3, 6, PM * 1.3);
      for (let x = x0 + 3; x < x1 - 3; x += 8) { ctx.fillStyle = s.awning; ctx.beginPath(); ctx.arc(x + 4, topY - PM * 1.3, 4, Math.PI, 0); ctx.fill(); } }
    if (b.name) {   // the sign board on the parapet (the name itself is the label above, so it stays readable)
      const tw = Math.min(x1 - x0 - 8, Math.max(24, (x1 - x0) * 0.6)), sxm = (x0 + x1) / 2;
      F('#1c1618', sxm - tw / 2 - 1, topY - 7, tw + 2, 7); F(shade(s.wall, -0.3), sxm - tw / 2, topY - 6, tw, 5); F('rgba(240,224,176,.55)', sxm - tw / 2 + 3, topY - 4, tw - 6, 1);
    }
  }
}
// on north-facing buildings the door is in the hidden wall: show the front step at the roof's far edge
function drawDoorStep(b) {
  if (!b.door || b.face !== 'N' || b.type === 'house' || b.type === 'garage' || b.type === 'shed') return;
  const x = (b.door[0] + 0.5) * T, y = b.pyMin * T - bstyle(b).h;
  F('#b8b4aa', x - PM * 0.8, y - 8, PM * 1.6, 6); F('#4a2e1a', x - PM * 0.5, y - 4, PM, 2);
}

// ---------- what is on screen, in depth order ----------
function visibleBuildings() {
  const out = [], seen = new Set(), x0 = Math.floor(camX) - 2, y0 = Math.floor(camY) - 1, x1 = Math.ceil(camX + SW / T) + 2, y1 = Math.ceil(camY + SH / T) + 7;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const b = bAt(x, y); if (b && !seen.has(b.id)) { seen.add(b.id); out.push(b); } }
  return out;
}
function drawShadows(list) {
  ctx.fillStyle = 'rgba(10,20,10,.26)';
  for (const b of list) {
    const off = Math.min(3 * PM, bstyle(b).h * 0.4);
    ctx.beginPath(); b.poly.forEach((p, i) => { const X = p[0] * T + off, Y = p[1] * T + off * 0.35; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fill();
  }
}

// ---------- downtown streetscape (from the owner's photo of Fifth Ave): lamp posts, a red curb band,
// the hydrant, a bench and a trash can by the Fig Tree corner. Positions in data cells; sizes in metres. ----------
const FIGB = BLD[TOWN.fig];
const DT = FIGB ? { x0: FIGB.x0 - 75, x1: FIGB.x1 + 55, name: '5th Avenue' } : null;
const PROPS = [];
if (DT) {
  for (const o of VEC) if (o.name === DT.name && (o.cl === 'road' || o.cl === 'major') && o.y1 - o.y0 < 1 && o.x1 > DT.x0 && o.x0 < DT.x1) {
    const y = (o.y0 + o.y1) / 2, off = o.w / 2 + 0.1;   // lamps stand just inside the curb
    const clear = (lx, ly) => [-1, 0, 1].every(d => ![TL.ROAD, TL.MAJOR].includes(tAt(Math.floor(lx + d), Math.floor(ly))));
    // Street View survey (Nov 17): black lamp posts carrying US flags and hanging flower baskets, black metal benches and
    // trash cans, and wooden barrel planters along both sidewalks
    let n = 0;
    for (let x = Math.max(o.x0, DT.x0) + 3; x < Math.min(o.x1, DT.x1) - 1; x += 6, n++) {
      if (clear(x, y - off - 0.5)) PROPS.push({ x, y: y - off, k: 'lamp', deco: n % 2 ? 'basket' : 'flag' });
      if (clear(x + 3, y + off + 0.6)) PROPS.push({ x: x + 3, y: y + off + 0.05, k: 'lamp', deco: n % 2 ? 'flag' : 'basket' });
      if (n % 3 === 1 && clear(x + 1.6, y - off - 0.5) && clear(x + 2.4, y - off - 0.5)) PROPS.push({ x: x + 1.6, y: y - off - 0.02, k: 'bench' }, { x: x + 2.5, y: y - off - 0.02, k: 'trash' });
      if (n % 3 === 2 && clear(x + 4.6, y + off + 0.6)) PROPS.push({ x: x + 4.6, y: y + off + 0.05, k: 'bench' });
      if (n % 4 === 3 && clear(x + 1.5, y + off + 0.6)) PROPS.push({ x: x + 1.5, y: y + off + 0.05, k: 'planter' });
    }
    DT.y = y; DT.off = off;
  }
  if (DT.y != null) { const y = DT.y - DT.off - 0.05, x = FIGB.x0 + 0.4;
    PROPS.push({ x, y, k: 'hydrant' }, { x: x - 0.9, y, k: 'bench' }, { x: x - 3, y, k: 'trash' }); }
  PROPS.sort((a, b) => a.y - b.y);
}
// ---------- trees, where the 2025 aerial shows them (make_tiles step 4c): one crown per 4 m cell, nudged off-centre ----------
const TRE = new Uint8Array(TW * TH);
(function () { const A = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_', ix = c => A.indexOf(c);
  (TOWN.TR || []).forEach((r, y) => { let x = 0; for (let i = 0; i < r.length; i += 3) { const v = ix(r[i]), n = ix(r[i + 1]) * 64 + ix(r[i + 2]); if (v) TRE.fill(v, y * TW + x, y * TW + x + n); x += n; } });
  TOWN.TR = null; })();
// real trees (js/data/trees.js, Nov 13): one per tree from the 2017 lidar canopy, checked on the 2025 aerial, each with
// its own crown radius and height. Without that file, the older one-per-cell trees from the photo grid are used.
const TREE_ROWS = [], TREE_CELL = new Map();
if (TOWN.TP) { const P = TOWN.TP;
  for (let i = 0; i < P.length; i += 5) { const t = { x: P[i] / 8, y: P[i + 1] / 8, r: P[i + 2] / 2, h: P[i + 3], ev: !!P[i + 4], k: 'tree', v: hash(P[i], P[i + 1]) % 4 };
    const ry = Math.floor(t.y); (TREE_ROWS[ry] || (TREE_ROWS[ry] = [])).push(t); TREE_CELL.set(ry * TW + Math.floor(t.x), t); }
  TOWN.TP = null; }
function treeAt(x, y) {
  if (TREE_ROWS.length) return x < 0 || y < 0 || x >= TW || y >= TH ? null : TREE_CELL.get(y * TW + x) || null;
  const k = x < 0 || y < 0 || x >= TW || y >= TH ? 0 : TRE[y * TW + x]; if (!k) return null;
  const h = hash(x * 3 + 11, y * 5 + 7); return { x: x + 0.25 + (h % 50) / 100, y: y + 0.3 + ((h >> 7) % 50) / 100, k: 'tree', ev: k === 2, v: h % 4 }; }
// FF6-style tree sprites: round crowns built from overlapping clumps with a dark outline, light from the upper left
const TREE_IMG = {};
function treeImg(ev, v, rm, hm) {
  if (rm) return treeImgSized(ev, v, rm, hm);
  const key = (ev ? 'e' : 'd') + v; if (TREE_IMG[key]) return TREE_IMG[key];
  const c = document.createElement('canvas'), g = c.getContext('2d');
  if (!ev) {
    const k = PM / 16, r = Math.round((30 + v * 5) * k); c.width = r * 2 + 8; c.height = r * 2 + Math.round(34 * k); const cx = c.width / 2, cy = r + 4;
    const blobs = []; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + v, d = r * 0.55; blobs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.85, r * 0.5]); } blobs.push([cx, cy, r * 0.62]);
    g.fillStyle = '#3a2618'; g.fillRect(cx - 3, cy + r * 0.5, 6, c.height - cy - r * 0.5 - 2); g.fillStyle = '#5a3c26'; g.fillRect(cx - 2, cy + r * 0.5, 2, c.height - cy - r * 0.5 - 3);
    const disc = (col, grow, dx, dy) => { g.fillStyle = col; for (const [x, y, rr] of blobs) { g.beginPath(); g.arc(x + dx, y + dy, rr + grow, 0, 6.29); g.fill(); } };
    disc('#16241a', 2, 0, 0); disc('#2c5a2e', 0, 0, 0); disc('#3c7a38', -3 * k, -2 * k, -3 * k); disc('#58984a', -8 * k, -5 * k, -7 * k);
    g.fillStyle = 'rgba(160,220,120,.35)'; for (let i = 0; i < 14; i++) { const q = hash(i, v + 3); g.fillRect(cx - r + q % (r * 2), 6 + (q >> 6) % r, 2, 2); }
  } else {
    const k = PM / 16, w = Math.round((40 + v * 4) * k), h = Math.round((84 + v * 8) * k); c.width = w + 6; c.height = h + 14; const cx = c.width / 2;
    g.fillStyle = '#3a2618'; g.fillRect(cx - 3, h - 6, 6, 14);
    for (let t = 0; t < 4; t++) { const y0 = 4 + t * (h / 5), y1 = y0 + h / 2.6, hw = (w / 2) * (0.45 + t * 0.18);
      const tri = (col, gr, dx) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx + dx, y0 - gr); g.lineTo(cx + hw + gr + dx, y1 + gr); g.lineTo(cx - hw - gr + dx, y1 + gr); g.closePath(); g.fill(); };
      tri('#101c14', 2, 0); tri('#1e4428', 0, 0); tri('#2e6036', -2, -1); }
  }
  return (TREE_IMG[key] = c);
}
function treeImgSized(ev, v, rm, hm) {   // a crown of the tree's own size: radius rm, height hm (metres)
  const rb = Math.max(1.5, Math.round(rm * 2) / 2), hb = Math.max(4, Math.round(Math.min(hm, 30) / 2) * 2), key = (ev ? 'E' : 'D') + v + '_' + rb + '_' + hb;
  if (TREE_IMG[key]) return TREE_IMG[key];
  const c = document.createElement('canvas'), g = c.getContext('2d'), k = PM / 16;
  if (!ev) {
    const r = Math.round(rb * PM * 0.92), trunk = Math.max(PM * 1.2, (hb - 2 * rb) * PM * 0.75);
    c.width = r * 2 + 8; c.height = Math.round(r * 2 + trunk + 6); const cx = c.width / 2, cy = r + 4;
    const blobs = []; const nb = 7 + Math.min(6, Math.round(rb)); for (let i = 0; i < nb; i++) { const a = i / nb * 6.283 + v, d = r * 0.55; blobs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.85, r * 0.5]); } blobs.push([cx, cy, r * 0.62]);
    const tw = Math.max(4, Math.round(r * 0.16)); g.fillStyle = '#3a2618'; g.fillRect(cx - tw / 2, cy + r * 0.5, tw, c.height - cy - r * 0.5 - 2); g.fillStyle = '#5a3c26'; g.fillRect(cx - tw / 2 + 1, cy + r * 0.5, Math.max(1, tw / 3), c.height - cy - r * 0.5 - 3);
    const disc = (col, grow, dx, dy) => { g.fillStyle = col; for (const [x, y, rr] of blobs) { g.beginPath(); g.arc(x + dx, y + dy, Math.max(2, rr + grow), 0, 6.29); g.fill(); } };
    const sh = r / 30; disc('#16241a', 2, 0, 0); disc('#2c5a2e', 0, 0, 0); disc('#3c7a38', -3 * sh, -2 * sh, -3 * sh); disc('#58984a', -8 * sh, -5 * sh, -7 * sh);
    g.fillStyle = 'rgba(160,220,120,.35)'; for (let i = 0; i < 6 + r / 3; i++) { const q = hash(i, v + 3 + rb * 7); g.fillRect(cx - r + q % (r * 2), 6 + (q >> 6) % r, 2, 2); }
  } else {
    const w = Math.round(Math.max(1.6, rb) * 2 * PM * 0.9), h = Math.round(Math.max(hb * 0.85, rb * 2.4) * PM * 0.8); c.width = w + 6; c.height = h + 14; const cx = c.width / 2;
    g.fillStyle = '#3a2618'; g.fillRect(cx - 3, h - 6, 6, 14);
    const tiers = Math.max(3, Math.min(7, Math.round(hb / 4)));
    for (let t = 0; t < tiers; t++) { const y0 = 4 + t * (h / (tiers + 1)), y1 = y0 + h / 2.4, hw = (w / 2) * (0.35 + t * 0.65 / (tiers - 1));
      const tri = (col, gr, dx) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx + dx, y0 - gr); g.lineTo(cx + hw + gr + dx, y1 + gr); g.lineTo(cx - hw - gr + dx, y1 + gr); g.closePath(); g.fill(); };
      tri('#101c14', 2, 0); tri('#1e4428', 0, 0); tri('#2e6036', -2, -1); }
  }
  return (TREE_IMG[key] = c);
}
function visibleTrees() {
  if (TREE_ROWS.length) { const out = [], x0 = camX - 3, x1 = camX + SW / T + 3, y0 = Math.floor(camY), y1 = Math.ceil(camY + SH / T) + 8;
    for (let y = y0; y < y1; y++) { const R = TREE_ROWS[y]; if (R) for (const t of R) if (t.x > x0 && t.x < x1) out.push(t); } return out; } const out = [], x0 = Math.floor(camX) - 1, x1 = Math.ceil(camX + SW / T) + 1, y0 = Math.floor(camY), y1 = Math.ceil(camY + SH / T) + 2;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const t = treeAt(x, y); if (t) out.push(t); } return out; }
// Flock license-plate cameras, where OpenStreetMap contributors have mapped them (TOWN.CAM: x, y in quarter cells, facing)
const CAMS = (TOWN.CAM || []).map(([x, y, dir, mf]) => ({ x: x / 4, y: y / 4, dir, mf, k: 'cam' }));
PROPS.push(...CAMS); PROPS.sort((a, b) => a.y - b.y);
function camNear(x, y, r) { return CAMS.find(c => Math.abs(c.x - x) < r && Math.abs(c.y - y) < r) || null; }
function visibleProps() { return PROPS.filter(p => p.x > camX - (p.reach ? 3 : 1) && p.x < camX + SW / T + (p.reach ? 3 : 1) && p.y > camY - 0.5 && p.y < camY + SH / T + (p.reach || 2)).concat(visibleTrees()).sort((a, b) => a.y - b.y); }
function drawProp(p) {   // world pixels
  const x = Math.round(p.x * T), y = Math.round(p.y * T), m = v => Math.round(v * PM);
  if (p.k === 'cam') {   // a slim pole, a small solar panel, the camera box turned the way it faces
    const ph = Math.max(14, m(3.5)), right = Math.sin(p.dir * Math.PI / 180) >= 0;
    F('rgba(0,0,0,.25)', x - 1, y - 1, 5, 2); F('#3a3c42', x - 1, y - ph, 2, ph);
    F('#1c2a4a', x - 4, y - ph - 4, 8, 3); F('#4a6aa8', x - 3, y - ph - 4, 6, 1);
    F('#1a1a1e', right ? x + 1 : x - 5, y - ph + 2, 4, 3); F('#c84040', right ? x + 4 : x - 5, y - ph + 3, 1, 1);
    return; }
  if (p.k !== 'tree' && typeof drawStreetProp === 'function' && drawStreetProp(p, x, y, m)) return;   // street life from the survey (streetlife.js)
  if (p.k === 'tree') { const im = treeImg(p.ev, p.v, p.r, p.h); ctx.fillStyle = !p.ev && typeof SKY !== 'undefined' && /^(bare|snow|spring)$/.test(SKY.phase) ? 'rgba(10,20,10,.09)' : 'rgba(10,20,10,.25)';   // bare branches cast a thin shadow
    ctx.beginPath(); ctx.ellipse(x + 5, y + 2, im.width * 0.42, im.width * 0.16, 0, 0, 6.29); ctx.fill();
    const hide = PLAYER_BOX && p.after && PLAYER_BOX[0] + PLAYER_BOX[2] > x - im.width / 2 + VIEW_OX && PLAYER_BOX[0] < x + im.width / 2 + VIEW_OX && PLAYER_BOX[1] + PLAYER_BOX[3] > y - im.height + VIEW_OY && PLAYER_BOX[1] < y + VIEW_OY;
    if (hide) ctx.globalAlpha = 0.45; ctx.drawImage(im, Math.round(x - im.width / 2), y - im.height + 6); ctx.globalAlpha = 1; return; }
  if (p.k === 'lamp') { F('rgba(0,0,0,.22)', x - 2, y - 1, m(1.2), 4); F('#1a1a1e', x - 3, y - 4, 7, 5); F('#1a1a1e', x - 1, y - m(4.2), 3, m(4.2)); F('#1a1a1e', x - 1, y - m(4.2), m(0.7), 2);
    F('#22222a', x + m(0.4), y - m(4.1), m(0.5), m(0.3)); F('#2e2e36', x + m(0.35), y - m(3.8), m(0.6), 2); F('#f0e0a0', x + m(0.55), y - m(3.75), 3, 2);
    if (p.deco === 'flag') { const fx = x - 1 - m(0.9), fy = y - m(3.3), fw = m(0.85), fh = m(0.5);   // a US flag on a bracket
      F('#1a1a1e', fx, fy - 1, m(0.9), 1); for (let i = 0; i < 5; i++) F(i % 2 ? '#f2f1ea' : '#b8323a', fx, fy + i * fh / 5, fw, fh / 5 + 1); F('#2a3a7a', fx, fy, fw * 0.42, fh * 0.6); }
    else if (p.deco === 'basket' && typeof SKY !== 'undefined' && !/^(snow|bare)$/.test(SKY.phase)) { const bx = x + m(0.55), by = y - m(3.2);   // a hanging flower basket
      F('#1a1a1e', bx, by - m(0.5), 1, m(0.5)); F('#2e4a2a', bx - m(0.4), by, m(0.8) + 1, m(0.35)); F('#3e6a32', bx - m(0.45), by - 2, m(0.9) + 1, 3);
      for (let i = 0; i < 5; i++) F(['#e04a6a', '#f0a0c0', '#c8323a', '#f2f1ea', '#e04a6a'][i], bx - m(0.4) + i * m(0.18), by - 3 + (i % 2) * 2, 2, 2); } }
  else if (p.k === 'planter') { const evergreen = typeof SKY !== 'undefined' && /^(snow|bare)$/.test(SKY.phase);   // a wooden half-barrel planter
    F('rgba(0,0,0,.22)', x - m(0.4), y - 1, m(0.9), 3); F('#6a4a2e', x - m(0.4), y - m(0.6), m(0.8), m(0.6)); F('#3a3a3e', x - m(0.4), y - m(0.5), m(0.8), 1); F('#3a3a3e', x - m(0.4), y - m(0.2), m(0.8), 1);
    F(evergreen ? '#2e4a32' : '#3e6a32', x - m(0.45), y - m(0.85), m(0.9), m(0.3));
    if (!evergreen) for (let i = 0; i < 4; i++) F(['#e8c040', '#e04a6a', '#f2f1ea', '#c8323a'][i], x - m(0.35) + i * m(0.2), y - m(0.9) + (i % 2) * 2, 2, 2); }
  else if (p.k === 'hydrant') { F('rgba(0,0,0,.25)', x - 3, y - 1, 10, 3); F('#c42a24', x - 3, y - m(0.8), 7, m(0.8)); F('#e04a3a', x - 3, y - m(0.8) - 2, 7, 3); F('#a42020', x - 5, y - m(0.55), 11, 3); F('#e86a5a', x - 2, y - m(0.75), 1, m(0.6)); }
  else if (p.k === 'bench') { F('rgba(0,0,0,.22)', x - m(0.9), y - 1, m(1.8), 3); F('#2a2a30', x - m(0.9), y - m(0.55), m(1.8), 4); F('#3e3e46', x - m(0.9), y - m(0.55), m(1.8), 1); F('#2a2a30', x - m(0.7), y - m(0.5), 2, m(0.5)); F('#2a2a30', x + m(0.6), y - m(0.5), 2, m(0.5)); }
  else if (p.k === 'trash') { F('rgba(0,0,0,.22)', x - 3, y - 1, m(0.7), 3); F('#26282c', x - 4, y - m(1.0), m(0.6), m(1.0)); F('#3a3c42', x - 4, y - m(1.0), m(0.6), 2); F('#1a1c20', x - 2, y - m(0.8), m(0.35), 2); }
}

// ---------- everything above the ground, depth sorted with the kid ----------
let PLAYER_BOX = null, VIEW_OX = 0, VIEW_OY = 0;   // the kid's screen box [x, y, w, h], for see-through
function drawBuildingsWith(playerDraw, playerY, box) {
  PLAYER_BOX = box || null;
  const list = visibleBuildings(), ox = -Math.round(camX * T), oy = -Math.round(camY * T);
  VIEW = [-ox, -oy, -ox + SW, -oy + SH]; VIEW_OX = ox; VIEW_OY = oy;
  ctx.save(); ctx.translate(ox, oy);
  drawShadows(list);
  list.sort((a, b) => (a.pyMax - b.pyMax) || (a.id - b.id));
  const props = visibleProps(); let pi = 0, drewPlayer = false, covered = false;
  const overKid = p => { if (!PLAYER_BOX || p.k === 'tf') return false;   // Nov 27: a person standing in front of the kid stays in front (only trees, lamps and the like force her back on top)
    const x = p.x * T + ox, y = p.y * T + oy, B = PLAYER_BOX;   // a tree, lamp or camera in front of the kid
    return x + 40 > B[0] && x - 40 < B[0] + B[2] && y > B[1] && y - 120 < B[1] + B[3]; };
  const kid = () => { ctx.restore(); playerDraw(); ctx.save(); ctx.translate(ox, oy); drewPlayer = true; };
  for (const b of list) {
    while (pi < props.length && props[pi].y < b.pyMax) { if (!drewPlayer && props[pi].y >= playerY) kid(); props[pi].after = drewPlayer; if (drewPlayer && overKid(props[pi])) covered = true; drawProp(props[pi++]); }
    if (!drewPlayer && b.pyMax >= playerY) kid();
    // a building drawn after the kid that would hide her turns see-through
    let hide = false;
    if (drewPlayer && PLAYER_BOX) { const sx0 = b.pxMin * T + ox, sx1 = b.pxMax * T + ox, sy0 = b.pyMin * T - bstyle(b).h + oy, sy1 = b.pyMax * T + oy;
      hide = PLAYER_BOX[0] + PLAYER_BOX[2] > sx0 && PLAYER_BOX[0] < sx1 && PLAYER_BOX[1] + PLAYER_BOX[3] > sy0 && PLAYER_BOX[1] < sy1; }
    if (hide) { ctx.globalAlpha = 0.45; covered = true; }
    drawBuilding(b); ctx.globalAlpha = 1;
    drawDoorStep(b);
  }
  while (pi < props.length) { if (!drewPlayer && props[pi].y >= playerY) kid(); props[pi].after = drewPlayer; if (drewPlayer && overKid(props[pi])) covered = true; drawProp(props[pi++]); }
  ctx.restore();
  if (!drewPlayer) playerDraw();
  // Nov 10, Christian: nothing may show through the kid's body. Whatever was drawn in front of her stays see-through
  // around her, and then she is drawn again on top, solid, so no roof, wall or tree crosses the sprite.
  else if (covered) playerDraw(true);
}

// ---------- the front view: stepping up to a public place or a shop shows its face, painted like an FF6 scene card.
// North-facing fronts (hidden from the top-down camera) are shown here as you'd see them from the sidewalk. ----------
function drawFrontCard(b) {
  const s = bstyle(b), f = b.face || 'S', alongX = f === 'N' || f === 'S';
  const Wm = Math.max(4, (alongX ? b.pxMax - b.pxMin : b.pyMax - b.pyMin) * 4), Wp = Wm * PM, h = s.h;
  const bx = 10, by = 10, bw = SW - 20, bh = 150, sc = Math.min((bw - 24) / (Wp + 2 * PM), (bh - 30) / (h + 12 * PM), 1.5);
  win(bx, by, bw, bh);
  ctx.save(); ctx.beginPath(); ctx.rect(bx + 4, by + 4, bw - 8, bh - 8); ctx.clip();
  const g = ctx.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, '#6a9ad8'); g.addColorStop(1, '#c8dcf0'); ctx.fillStyle = g; ctx.fillRect(bx + 4, by + 4, bw - 8, bh - 8);
  const ground = by + bh - 18; F('#8e8a82', bx + 4, ground, bw - 8, 3); F('#bab4a8', bx + 4, ground + 3, bw - 8, 15);
  ctx.translate(SW / 2 - Wp * sc / 2, ground); ctx.scale(sc, sc);
  const oldView = VIEW; VIEW = [-1e9, -1e9, 1e9, 1e9];
  ctx.fillStyle = pat(s.mat, s.wall); ctx.fillRect(0, -h, Wp, h);
  // the door along the front, measured from the left as you face the building
  let door = null;
  if (b.door) { const d = alongX ? b.door[0] + 0.5 : b.door[1] + 0.5, lo = alongX ? b.pxMin : b.pyMin, hi = alongX ? b.pxMax : b.pyMax;
    door = (f === 'S' || f === 'W' ? d - lo : hi - d) * T; }
  if (s.fig) paintFigFront(0, Wp, 0, h); else { wallDetails(b, s, 0, Wp, 0, door); }
  F(shade(s.roofCol, -0.2), -6, -h - 6, Wp + 12, 8); F('#1c1618', -6, -h - 7, Wp + 12, 2);   // the roofline
  if (s.steeple) { const tw = 3 * PM; ctx.fillStyle = pat(s.mat, shade(s.wall, -0.05)); ctx.fillRect(Wp / 2 - tw / 2, -h - 7 * PM, tw, 7 * PM);
    ctx.fillStyle = s.roofCol; ctx.beginPath(); ctx.moveTo(Wp / 2 - tw / 2 - 3, -h - 7 * PM); ctx.lineTo(Wp / 2 + tw / 2 + 3, -h - 7 * PM); ctx.lineTo(Wp / 2, -h - 17 * PM); ctx.fill(); }
  if (b.name && !s.fig) { ctx.font = FONT; const tw = Math.min(Wp - 8, ctx.measureText(b.name.toUpperCase()).width / sc + 16);
    F('#1c1618', Wp / 2 - tw / 2 - 2, -3.5 * PM - 2, tw + 4, 0.75 * PM + 4); F(shade(s.wall, -0.45), Wp / 2 - tw / 2, -3.5 * PM, tw, 0.75 * PM); }
  VIEW = oldView; ctx.restore();
  if (b.name && !s.fig) txt(b.name.toUpperCase(), SW / 2, ground - (3.5 * PM - 1) * sc, '#f0e0b0', 'center', SMALL);
}
