"use strict";
// =====================================================================
//  A friendlier map and town (Nov 13). Christian: 'polish the map and make it player friendly, based on the RPG books,
//  but stick to Antigo GIS data as the base.' The conventions come from the uploaded JRPG guides and the Nov 10 design
//  report: an overhead map with names, a quick way to get somewhere (the 'warp home' the guides praise), area names
//  as you arrive, clear doors, and a gazetteer of real places to find. Everything placed comes from the real data:
//  street names from OpenStreetMap, places from js/data/places.js (county reference layers + OSM).
// =====================================================================
const PCAT = { fig: ['#9fe0a0', 'The Fig Tree'], gym: ['#f0a868', 'Gym'], games: ['#d890f0', 'Games'], movies: ['#f07a7a', 'Movies'], historic: ['#e8c860', 'Historic'], civic: ['#80b0f0', 'Public'],
  hospital: ['#f4f4f8', 'Hospital'], work: ['#d8a868', 'Work'], park: ['#78d070', 'Park'], lake: ['#70b0f0', 'Lake'], school: ['#f0d050', 'School'], church: ['#c8a0e8', 'Church'], cemetery: ['#b4b8a8', 'Cemetery'], airport: ['#c8c8d0', 'Airport'] };
const PL = (typeof PLACES !== 'undefined' ? PLACES : []).filter(p => p[2] >= 0 && p[3] >= 0 && p[2] < TW && p[3] < TH)
  .map(([name, cat, x, y, note], i) => ({ id: i, name, cat, x, y, note }));
for (const p of PL) {   // how close counts as 'here': the building's own size, a park's or a lake's reach
  const b = bAt(Math.floor(p.x), Math.floor(p.y)); p.b = b && !(b.style && b.style.canopyOnly) ? b : null;
  p.r = p.b ? Math.hypot(p.b.pxMax - p.b.pxMin, p.b.pyMax - p.b.pyMin) / 2 + 5 : p.cat === 'lake' ? 16 : p.cat === 'park' ? 12 : 8;
}
const MAJOR_PLACE = new Set(['fig', 'hospital', 'lake', 'airport']);
const isMajorPlace = p => MAJOR_PLACE.has(p.cat) || /Courthouse|Fairgrounds|High School|Lake Park/.test(p.name);

// ---------- streets by name (OpenStreetMap centre lines), split into straight runs for labels ----------
const STREETS = new Map();
for (const o of VEC) if ((o.cl === 'road' || o.cl === 'major') && o.name) { if (!STREETS.has(o.name)) STREETS.set(o.name, []); STREETS.get(o.name).push(o); }
function streetRuns(o) {   // consecutive stretches that keep within 12 degrees of one heading
  if (o.runs) return o.runs; const R = []; let cur = [o.P[0]], hd = null;
  for (let i = 1; i < o.P.length; i++) { const a = o.P[i - 1], b = o.P[i], h = Math.atan2(b[1] - a[1], b[0] - a[0]);
    if (hd !== null && Math.abs(((h - hd + 3 * Math.PI) % (2 * Math.PI)) - Math.PI) > 0.21) { R.push(cur); cur = [a]; }
    cur.push(b); hd = h; }
  R.push(cur); return (o.runs = R);
}
function streetAt(px, py) {   // the named street you're on or beside (within about 14 m of its centre line)
  let best = null, bd = 3.6;
  for (const o of VEC) {
    if (!o.name || (o.cl !== 'road' && o.cl !== 'major') || px < o.x0 - 4 || px > o.x1 + 4 || py < o.y0 - 4 || py > o.y1 + 4) continue;
    for (let i = 1; i < o.P.length; i++) { const [ax, ay] = o.P[i - 1], [bx, by] = o.P[i], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)), d = Math.hypot(ax + t * dx - px, ay + t * dy - py);
      if (d < bd) { bd = d; best = o.name; } }
  }
  return best;
}

// ---------- walking: the name of where you are, and doors you can use ----------
let BANNER = null, LAST_STREET = '', LAST_PLACE = '', MP_TICK = 0;
const placesFound = () => PL.filter(p => G.visited && G.visited[p.name]).length;
function mapplusTick() {
  if (!G.visited) G.visited = {};
  if (BANNER) BANNER.f++;
  if (++MP_TICK % 10) return;
  const px = (G.x + 0.5) / CPD, py = (G.y + 0.5) / CPD;
  let near = null, nd = 1e9;
  for (const p of PL) { const d = Math.hypot(p.x - px, p.y - py) - p.r; if (d < 0 && d < nd) { nd = d; near = p; } }
  if (near && near.name !== LAST_PLACE) {
    LAST_PLACE = near.name; const first = !G.visited[near.name]; G.visited[near.name] = 1;
    BANNER = { t: near.name, sub: first ? 'NEW PLACE · a real spot in Antigo' : '', col: PCAT[near.cat] ? PCAT[near.cat][0] : '#fff', f: 0, big: 1 };
    return;
  }
  if (!near) LAST_PLACE = '';
  const s = streetAt(px, py);
  if (s && s !== LAST_STREET) { LAST_STREET = s; if (!BANNER || !BANNER.big || BANNER.f > 90) BANNER = { t: s, f: 0 }; }
}
function mapplusDraw() {
  if (DLG) return;
  // doors you can go into: a small bobbing arrow when you're near
  for (const b of [BLD[TOWN.fig], typeof UMA !== 'undefined' ? UMA : null]) {
    if (!b || !b.door) continue; const [dx, dy] = doorM(b), wx = dx / CPD, wy = dy / CPD;
    if (Math.hypot(wx - (G.x + 0.5) / CPD, wy - (G.y + 0.5) / CPD) > 7) continue;
    const sx = Math.round((wx - camX) * T), sy = Math.round((wy - camY) * T - 3.4 * PM - 6 + Math.sin(frame / 9) * 2);
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(sx - 6, sy - 1); ctx.lineTo(sx + 6, sy - 1); ctx.lineTo(sx, sy + 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd860'; ctx.beginPath(); ctx.moveTo(sx - 4, sy); ctx.lineTo(sx + 4, sy); ctx.lineTo(sx, sy + 5); ctx.closePath(); ctx.fill();
  }
  // the area / street name, FF-style, fading out
  if (BANNER && BANNER.f < 170) {
    const a = BANNER.f < 150 ? 1 : (170 - BANNER.f) / 20; ctx.globalAlpha = a;
    if (BANNER.big) { ctx.font = FONT; const w = Math.max(ctx.measureText(BANNER.t).width, BANNER.sub ? (ctx.font = SMALL, ctx.measureText(BANNER.sub).width) : 0) + 20, h = BANNER.sub ? 30 : 20;
      win(Math.round((SW - w) / 2), 22, w, h); txt(BANNER.t, SW / 2, 28, BANNER.col, 'center'); if (BANNER.sub) txt(BANNER.sub, SW / 2, 40, '#fff', 'center', SMALL); }
    else { ctx.font = SMALL; const w = ctx.measureText(BANNER.t).width + 14; R(Math.round((SW - w) / 2), 22, w, 12, 'rgba(10,12,30,.72)'); R(Math.round((SW - w) / 2), 33, w, 1, '#2f8a3c');
      txt(BANNER.t, SW / 2, 25, '#e8f0e0', 'center', SMALL); }
    ctx.globalAlpha = 1;
  }
}
{ const W = MODES.walk, u = W.update, d = W.draw;
  W.update = function () { u.call(this); if (mode === 'walk' && !DLG) mapplusTick(); };
  W.draw = function () { d.call(this); if (mode === 'walk') mapplusDraw(); };
}

// ---------- riding over to a place ----------
function roadNear(px, py, maxD) {   // the nearest point on a named street
  let best = null, bd = maxD;
  for (const o of VEC) { if ((o.cl !== 'road' && o.cl !== 'major') || px < o.x0 - maxD || px > o.x1 + maxD || py < o.y0 - maxD || py > o.y1 + maxD) continue;
    for (let i = 1; i < o.P.length; i++) { const [ax, ay] = o.P[i - 1], [bx, by] = o.P[i], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)), qx = ax + t * dx, qy = ay + t * dy, d = Math.hypot(qx - px, qy - py);
      if (d < bd) { bd = d; best = { x: qx, y: qy, d, w: o.w }; } } }
  return best;
}
function rideTo(p) {
  let tx = p.x, ty = p.y;
  if (!(p.b && p.b.door)) { const r = roadNear(p.x, p.y, 45); if (r && r.d > 3) { const k = Math.min(1, (r.w / 2 + 2.5) / r.d); tx = r.x + (p.x - r.x) * k; ty = r.y + (p.y - r.y) * k; } }
  const [x, y] = p.b && p.b.door ? outsideDoorM(p.b) : freeNearM(Math.round(tx * CPD), Math.round(ty * CPD));
  G.x = x; G.y = y; G.dir = 'down'; P.t = 0; P.mx = P.my = 0; setMode('walk');
  if (!G.visited) G.visited = {}; const first = !G.visited[p.name]; G.visited[p.name] = 1; LAST_PLACE = p.name; LAST_STREET = streetAt((x + 0.5) / CPD, (y + 0.5) / CPD) || '';
  say([['', 'You ride over to ' + p.name + '.' + (p.note && p.note !== 'OpenStreetMap' ? ' ' + p.note + '.' : '')]].concat(first ? [['', 'New place: ' + placesFound() + ' of ' + PL.length + ' found.']] : []));
}

// ---------- the map screen: real streets and places, labelled; M opens the list of places ----------
const MAPZ = [0.5, 1, 3];
Object.assign(MODES.map, {
  enter() { this.z = 1; this.cx = G.x / CPD; this.cy = G.y / CPD; this.list = null; },
  update() {
    const L = this.list;
    if (L) {   // the Places list
      if (pressed.b || pressed.map) { this.list = null; return; }
      if (pressed.up) L.sel = (L.sel + PL.length - 1) % PL.length;
      if (pressed.down) L.sel = (L.sel + 1) % PL.length;
      if (pressed.left) L.sel = Math.max(0, L.sel - 12); if (pressed.right) L.sel = Math.min(PL.length - 1, L.sel + 12);
      const p = PL[L.sel]; this.cx += (p.x - this.cx) * 0.25; this.cy += (p.y - this.cy) * 0.25;
      if (pressed.a) { rideTo(p); }
      return;
    }
    if (pressed.b) { setMode('walk'); return; }
    if (pressed.map) { const here = [(G.x + 0.5) / CPD, (G.y + 0.5) / CPD]; let s = 0, bd = 1e9;   // open on the nearest place
      PL.forEach((p, i) => { const d = Math.hypot(p.x - here[0], p.y - here[1]); if (d < bd) { bd = d; s = i; } }); this.list = { sel: s }; return; }
    if (pressed.menu) this.z = MAPZ[(MAPZ.indexOf(this.z) + 1) % MAPZ.length];
    const sp = 2.5 / this.z * (held.b ? 3 : 1);
    if (held.left) this.cx -= sp; if (held.right) this.cx += sp; if (held.up) this.cy -= sp; if (held.down) this.cy += sp;
    this.cx = Math.max(0, Math.min(TW - 1, this.cx)); this.cy = Math.max(0, Math.min(TH - 1, this.cy));
    if (pressed.a) {
      const zs = this.z * (SH - 20) / 400, hit = PL.find(p => Math.hypot(p.x - this.cx, p.y - this.cy) * zs < 6);
      if (hit) return rideTo(hit);
      const [x, y] = freeNearM(Math.round(this.cx * CPD), Math.round(this.cy * CPD)); G.x = x; G.y = y; G.dir = 'down';
      P.t = 0; P.mx = P.my = 0; setMode('walk');
      const b = bAt(Math.floor(x / CPD), Math.floor(y / CPD)), st = streetAt((x + 0.5) / CPD, (y + 0.5) / CPD);
      LAST_STREET = st || '';
      say([['', 'You ride over' + (b && b.name ? ', by ' + b.name : st ? ', on ' + st : '') + '.']]);
    }
  },
  draw() {
    R(0, 0, SW, SH, '#0b0b1c');
    const img = mapImage(), zs = this.z * (SH - 20) / 400, vw = SW / zs, vh = (SH - 20) / zs;
    const x0 = Math.max(0, Math.min(TW - vw, this.cx - vw / 2)), y0 = Math.max(0, Math.min(TH - vh, this.cy - vh / 2));
    ctx.imageSmoothingEnabled = zs < 1; ctx.drawImage(img, x0, y0, vw, vh, 0, 0, SW, SH - 20); ctx.imageSmoothingEnabled = false;
    const S = (x, y) => [(x - x0) * zs, (y - y0) * zs], placed = [];
    const free = r => !placed.some(q => r[0] < q[0] + q[2] && q[0] < r[0] + r[2] && r[1] < q[1] + q[3] && q[1] < r[1] + r[3]);
    const halo = (s, x, y, col, al, f) => { ctx.font = f; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(8,10,24,.9)';
      for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) ctx.fillText(s, x + a, y + b); ctx.fillStyle = col; ctx.fillText(s, x, y); };
    // places first (they matter most), the Fig Tree before everything
    placed.push([SW - 330, 0, 330, 12]);   // the credit line at the top right
    const order = PL.slice().sort((a, b) => (b.cat === 'fig') - (a.cat === 'fig') || isMajorPlace(b) - isMajorPlace(a));
    const showName = p => zs >= 1.5 || (zs >= 0.6 && p.cat !== 'church') || isMajorPlace(p);
    const hovered = this.list ? PL[this.list.sel] : PL.find(p => Math.hypot(p.x - this.cx, p.y - this.cy) * zs < 6);
    const vis = order.filter(p => { const [X, Y] = S(p.x, p.y); return X > -40 && X < SW + 40 && Y > -10 && Y < SH - 20; });
    for (const p of vis) { const [X, Y] = S(p.x, p.y), col = PCAT[p.cat] ? PCAT[p.cat][0] : '#fff', seen = G.visited && G.visited[p.name];
      if (p.cat === 'fig') { ctx.fillStyle = '#000'; star(X, Y, 7); ctx.fillStyle = '#9fe0a0'; star(X, Y, 5); }
      else { R(X - 3, Y - 3, 7, 7, '#000'); R(X - 2, Y - 2, 5, 5, col); if (!seen) R(X - 1, Y - 1, 3, 3, '#1a1c4a'); }
      placed.push([X - 4, Y - 4, 9, 9]); }
    for (const p of vis) {
      if (!showName(p) || p === hovered) continue;
      const [X, Y] = S(p.x, p.y); ctx.font = SMALL; const w = ctx.measureText(p.name).width, r = [X + 6, Y - 5, w + 2, 10];
      if (r[0] + r[2] > SW) r[0] = X - 6 - w - 2;
      const own = placed.findIndex(q => q[0] === X - 4 && q[1] === Y - 4); const others = placed.filter((q, i) => i !== own);
      if (others.some(q => r[0] < q[0] + q[2] && q[0] < r[0] + r[2] && r[1] < q[1] + q[3] && q[1] < r[1] + r[3]) && p.cat !== 'fig') continue; placed.push(r);
      halo(p.name, r[0] + 1, Y, p.cat === 'fig' ? '#b8f0b0' : '#fff', 'left', SMALL);
    }
    // street names along the longest straight stretch on screen
    if (zs >= 0.45) for (const [name, list] of STREETS) {
      if (zs < 0.6 && !list.some(o => o.cl === 'major')) continue;
      let best = null, bl = 0;
      for (const o of list) { if (o.x1 < x0 || o.x0 > x0 + vw || o.y1 < y0 || o.y0 > y0 + vh) continue;
        for (const run of streetRuns(o)) { const a = S(...run[0]), b = S(...run[run.length - 1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          if (m[0] < 20 || m[0] > SW - 20 || m[1] < 12 || m[1] > SH - 34) continue; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > bl) { bl = l; best = [a, b]; } } }
      if (!best) continue; ctx.font = SMALL; const w = ctx.measureText(name).width; if (bl < w + 14) continue;
      const [a, b] = best; let ang = Math.atan2(b[1] - a[1], b[0] - a[0]); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang)), bw = w * c + 8 * s + 2, bh = w * s + 8 * c + 2, r = [mx - bw / 2, my - bh / 2, bw, bh];
      if (!free(r)) continue; placed.push(r);
      ctx.save(); ctx.translate(Math.round(mx), Math.round(my)); ctx.rotate(ang); halo(name, 0, 0, '#ffe9a8', 'center', SMALL); ctx.restore();
    }
    // bus stops and water towers (OpenStreetMap; tower heights from the county lidar)
    for (const q of PROPS) { if (q.k !== 'bus' && q.k !== 'tower') continue; const [X, Y] = S(q.x, q.y); if (X < -4 || X > SW + 4 || Y < -4 || Y > SH - 20) continue;
      if (q.k === 'bus') { R(X - 2, Y - 2, 5, 5, '#000'); R(X - 1, Y - 1, 3, 3, '#4a8af0'); }
      else { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(X, Y - 3, 4, 0, 6.29); ctx.fill(); ctx.fillStyle = '#f2f2ee'; ctx.beginPath(); ctx.arc(X, Y - 3, 3, 0, 6.29); ctx.fill(); R(X, Y - 1, 1, 4, '#000'); } }
    // license-plate cameras (OpenStreetMap)
    for (const c of CAMS) { const [X, Y] = S(c.x, c.y); if (X < -4 || X > SW + 4 || Y < -4 || Y > SH - 20) continue; R(X - 2, Y - 2, 5, 5, '#000'); R(X - 1, Y - 1, 3, 3, '#e04848'); }
    // you
    const [px, py] = S(G.x / CPD, G.y / CPD);
    R(px - 3, py - 3, 7, 7, '#000'); if ((frame >> 3) % 2) R(px - 2, py - 2, 5, 5, '#ffd860'); else R(px - 1, py - 1, 3, 3, '#ffd860');
    // the cursor, and what's under it
    const [cx, cy] = S(this.cx, this.cy);
    if (!this.list) { R(cx - 6, cy, 4, 1, '#fff'); R(cx + 3, cy, 4, 1, '#fff'); R(cx, cy - 6, 1, 4, '#fff'); R(cx, cy + 3, 1, 4, '#fff'); }
    const hit = PL.find(p => Math.hypot(p.x - this.cx, p.y - this.cy) * zs < 6), cn = !hit && camNear(this.cx, this.cy, 3 / zs + 0.5);
    const b = hit || cn ? null : bAt(Math.round(this.cx), Math.round(this.cy)), st = !hit && !cn && !(b && b.name) ? streetAt(this.cx, this.cy) : null;
    const bus = !hit && PROPS.find(q => (q.k === 'bus' || q.k === 'tower') && Math.hypot(q.x - this.cx, q.y - this.cy) * zs < 5);
    const tip = bus ? (bus.k === 'bus' ? 'Bus stop: ' + bus.name : 'Water tower, ' + Math.round(bus.h * 3.28084) + ' ft') : hit ? hit.name + (hit.note && hit.note !== 'OpenStreetMap' ? ' · ' + hit.note : '') : cn ? 'License-plate camera (OpenStreetMap)' : b && b.name ? b.name : st;
    if (tip && !this.list) { ctx.font = SMALL; const w = Math.min(SW - 8, ctx.measureText(tip).width + 8), tx = Math.max(2, Math.min(SW - w - 2, cx + 6)); win(tx, cy - 18, w, 12); txt(tip, tx + 4, cy - 15, '#fff', 'left', SMALL); }
    // legend and the count of places found
    win(4, SH - 46, 272, 24);
    let lx = 10; ctx.fillStyle = '#9fe0a0'; star(lx + 2, SH - 39, 4); txt('Fig Tree', lx + 8, SH - 42, '#fff', 'left', SMALL); lx += 60;
    for (const k of ['park', 'school', 'historic', 'church']) { R(lx, SH - 41, 5, 5, PCAT[k][0]); txt(PCAT[k][1], lx + 7, SH - 42, '#fff', 'left', SMALL); ctx.font = SMALL; lx += ctx.measureText(PCAT[k][1]).width + 14; }
    R(10, SH - 32, 5, 5, '#e04848'); txt('Plate cameras', 17, SH - 33, '#fff', 'left', SMALL);
    R(100, SH - 32, 5, 5, '#000'); R(101, SH - 31, 3, 3, '#1a1c4a'); txt('not found yet', 108, SH - 33, '#b8bcd8', 'left', SMALL);
    // Nov 26 UX pass: no 'Found n/56' counter (no collect-them-all pull)
    txt('© OSM · Microsoft · Langlade Co. · WROC 2025 · USGS · USDA', SW - 4, 4, 'rgba(255,255,255,.6)', 'right', SMALL);
    // the Places list
    if (this.list) drawPlaces(this.list);
    win(0, SH - 20, SW, 20);
    txt(this.list ? 'UP/DOWN CHOOSE · A RIDE THERE · B BACK TO MAP' : 'ARROWS MOVE · A GO · C ZOOM · M PLACES · L LAYER · B BACK', 6, SH - 14, '#fff', 'left', SMALL);
  }
});
function star(x, y, r) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
function drawPlaces(L) {
  const w = 206, x = SW - w - 4, y = 16, rows = 17, h = rows * 11 + 58, top = Math.max(0, Math.min(PL.length - rows, L.sel - 9)), here = [(G.x + 0.5) / CPD, (G.y + 0.5) / CPD];
  win(x, y, w, h); txt('PLACES', x + 8, y + 6, '#ffd860'); 
  for (let i = 0; i < rows && top + i < PL.length; i++) {
    const p = PL[top + i], yy = y + 20 + i * 11, sel = top + i === L.sel, seen = G.visited && G.visited[p.name];
    if (sel) R(x + 4, yy - 1, w - 8, 10, 'rgba(255,216,96,.18)');
    R(x + 8, yy + 1, 6, 6, '#000'); R(x + 9, yy + 2, 4, 4, PCAT[p.cat] ? PCAT[p.cat][0] : '#fff'); if (!seen) R(x + 10, yy + 3, 2, 2, '#1a1c4a');
    ctx.font = SMALL; let n = p.name; while (ctx.measureText(n).width > w - 64 && n.length > 4) n = n.slice(0, -2); if (n !== p.name) n = n.slice(0, -1) + '…';
    txt(n, x + 18, yy + 1, sel ? '#ffd860' : seen ? '#fff' : '#b8bcd8', 'left', SMALL);
    const d = Math.hypot(p.x - here[0], p.y - here[1]) * 4; txt(d < 1000 ? Math.round(d / 10) * 10 + 'm' : (d / 1000).toFixed(1) + 'km', x + w - 8, yy + 1, '#9aa0c8', 'right', SMALL);
  }
  const p = PL[L.sel]; R(x + 6, y + h - 37, w - 12, 1, 'rgba(255,255,255,.25)');
  if (p) { const t = (PCAT[p.cat] ? PCAT[p.cat][1] : '') + (p.note && p.note !== 'OpenStreetMap' ? ' · ' + p.note : ''); wrap(t, w - 16, SMALL).slice(0, 3).forEach((l, i) => txt(l, x + 8, y + h - 32 + i * 9, '#c8d0ff', 'left', SMALL)); }
}
