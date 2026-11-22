"use strict";
// =====================================================================
//  OUTDOOR SWEEP (Nov 21). Christian, playing: "the cars piling up, the errors around the lake with block walls going
//  into the water ... the parking lot outside the apartment is wrong, the streets and cemetery markers are in roads."
//  Runs last, after every data file and every core file has placed its things, and checks the whole town against the
//  streets as they are DRAWN (the road vectors, not the 4 m tiles: a ROAD tile is often the sidewalk):
//   1. parked cars: none on the travelled road unless parallel-parked tight to the curb, clear of corners; none on a
//      sidewalk; never two cars overlapping;
//   2. props (mailboxes, posts, signs, benches, lamps, bins ...): off the asphalt, nudged to the nearest roadside spot
//      or left out; cemetery headstones are not drawn on cemetery lanes or streets;
//   3. fieldstone walls and yard fences: none standing in the drawn lake or pond water;
//   4. (townfolk.js) people name the North / South part of a street they actually stand on;
//   5. parking lots: lot polygons that run out over a street are trimmed back to the curb (see pkSweep below).
//  Counts end up in window.SWEEP.
// =====================================================================
const SWEEP_OFF = /[?&]nosweep\b/.test(location.search);   // ?nosweep shows the town as it was, for before/after checks
const SWEEP = { carsRoad: 0, carsWalk: 0, carsOverlap: 0, carsKept: 0, propsMoved: 0, propsDropped: 0, stonesHidden: 0, wallsDropped: 0, lots: 0, at: { cars: [], props: [], walls: [] } };
const SW_G = 8, SW_SEG = new Map();   // road segments bucketed by 8-cell square: [ax, ay, bx, by, o]
(function swIndex() {
  for (const o of VEC) {
    if (o.cl !== 'road' && o.cl !== 'major' && o.cl !== 'service' && o.cl !== 'path') continue;
    for (let i = 1; i < o.P.length; i++) {
      const [ax, ay] = o.P[i - 1], [bx, by] = o.P[i], r = o.w / 2 + 1;
      const x0 = Math.floor((Math.min(ax, bx) - r) / SW_G), x1 = Math.floor((Math.max(ax, bx) + r) / SW_G), y0 = Math.floor((Math.min(ay, by) - r) / SW_G), y1 = Math.floor((Math.max(ay, by) + r) / SW_G);
      for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) { const k = gx * 100000 + gy; if (!SW_SEG.has(k)) SW_SEG.set(k, []); SW_SEG.get(k).push([ax, ay, bx, by, o]); }
    }
  }
})();
function swSegDist(x, y, s) {
  const dx = s[2] - s[0], dy = s[3] - s[1], L2 = dx * dx + dy * dy || 1e-9; let t = ((x - s[0]) * dx + (y - s[1]) * dy) / L2; t = Math.max(0, Math.min(1, t));
  const fx = s[0] + dx * t, fy = s[1] + dy * t, L = Math.sqrt(L2), nx = -dy / L, ny = dx / L;
  return { d: Math.hypot(x - fx, y - fy), side: Math.sign((x - fx) * nx + (y - fy) * ny) || 1, fx, fy, nx, ny, ang: Math.atan2(dy, dx), o: s[4] };
}
// the drawn street (road or major) under a point, or null; cls limits which kinds count
function swRoadAt(x, y, pad, cls) {
  let best = null;
  for (const s of SW_SEG.get(Math.floor(x / SW_G) * 100000 + Math.floor(y / SW_G)) || []) {
    const o = s[4]; if (cls ? !cls.includes(o.cl) : (o.cl !== 'road' && o.cl !== 'major')) continue;
    const r = swSegDist(x, y, s); if (r.d < o.w / 2 + (pad || 0) && (!best || r.d - o.w / 2 < best.d - best.o.w / 2)) best = r;
  }
  return best;
}
function swNearestRoad(x, y) { let best = null; for (const s of SW_SEG.get(Math.floor(x / SW_G) * 100000 + Math.floor(y / SW_G)) || []) { const o = s[4]; if (o.cl !== 'road' && o.cl !== 'major') continue; const r = swSegDist(x, y, s); if (!best || r.d < best.d) best = r; } return best; }
function swInWater(x, y) {
  for (const w of WATERS) { if (x < w.x0 || x > w.x1 || y < w.y0 || y > w.y1) continue; let c = false; for (const P of w.R) if (inPoly(P, x, y)) c = !c; if (c) return true; }
  return false;
}

// ---------- 1. parked cars ----------
(function swCars() {
  if (SWEEP_OFF) return;
  if (typeof PARKED === 'undefined') return;
  const HL = 4.6 / 8, HW = 1.9 / 8;   // half length / half width in cells
  const LOTPK = (TOWN.PK || []).map(Q => { const P = []; for (let i = 0; i < Q.length; i += 2) P.push([Q[i] / 4, Q[i + 1] / 4]); const xs = P.map(p => p[0]), ys = P.map(p => p[1]); return { P, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; });
  const SW_SOFT = new Set([TL.GRASS, TL.LAWN, TL.YARD, TL.WOODS, TL.FARM, TL.MARSH, TL.WATER]);
  const inParks = (x, y) => (typeof PARKS !== 'undefined') && PARKS.some(l => x >= l.x0 && x <= l.x1 && y >= l.y0 && y <= l.y1 && inPoly(l.P, x, y));
  const inLot = (x, y) => LOTPK.some(l => x >= l.x0 && x <= l.x1 && y >= l.y0 && y <= l.y1 && inPoly(l.P, x, y));
  const corners = (x, y, a, s) => { const ux = Math.cos(a), uy = Math.sin(a); return [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 0], [1, 0], [-1, 0]].map(([i, j]) => [x + (ux * i * HL - uy * j * HW) * s, y + (uy * i * HL + ux * j * HW) * s]); };
  const kept = [], grid = new Map(), gk = (x, y) => Math.floor(x / 4) * 100000 + Math.floor(y / 4);
  const obb = (A, B) => {   // separating-axis test of two car rectangles, shrunk 5 cm
    const ax = [Math.cos(A.a), Math.sin(A.a)], ay = [-ax[1], ax[0]], bx = [Math.cos(B.a), Math.sin(B.a)], by = [-bx[1], bx[0]], d = [B.x - A.x, B.y - A.y], hl = HL - 0.0125, hw = HW - 0.0125;
    for (const n of [ax, ay, bx, by]) { const ra = hl * Math.abs(ax[0] * n[0] + ax[1] * n[1]) + hw * Math.abs(ay[0] * n[0] + ay[1] * n[1]), rb = hl * Math.abs(bx[0] * n[0] + bx[1] * n[1]) + hw * Math.abs(by[0] * n[0] + by[1] * n[1]);
      if (Math.abs(d[0] * n[0] + d[1] * n[1]) > ra + rb) return false; }
    return true;
  };
  for (const car of PARKED) {
    const x = car[0] / 40, y = car[1] / 40, a = car[2] / 1000;
    const C = corners(x, y, a, 0.92), hits = C.map(([px, py]) => swRoadAt(px, py, -0.02)).filter(Boolean);
    if (hits.length) {   // touching the travelled street: only a car parallel-parked against the curb stays
      const r = swNearestRoad(x, y), half = r ? r.o.w / 2 : 0;
      let ok = r && Math.abs(Math.sin(a - r.ang)) < 0.12 && r.d > half - HW - 0.16 && r.d < half + 0.1 && half > 0.9 && r.o.mk !== 'turn';
      if (ok) for (const [px, py] of C) { const q = swRoadAt(px, py, 1.2); if (q && q.o !== r.o && q.o.name !== r.o.name) { ok = false; break; } }   // a corner: no parking within 5 m of the cross street
      if (!ok) { SWEEP.carsRoad++; SWEEP.at.cars.push([+x.toFixed(1), +y.toFixed(1), 'road']); continue; }
    } else {
      const t = tAt(Math.floor(x), Math.floor(y));
      if ((t === TL.ROAD || t === TL.MAJOR) && !inLot(x, y)) { SWEEP.carsWalk++; continue; }   // a ROAD tile beside the asphalt is the sidewalk
      // Nov 22 (Christian: "around and behind Amron there's a lot of cars in the grass and stacked"): a car whose body sits mostly on
      // grass, lawn, yard, woods, field or marsh — and not inside a drawn lot — is dropped
      const soft = C.filter(([px, py]) => { const q = tAt(Math.floor(px), Math.floor(py)); return SW_SOFT.has(q) && !inParks(px, py); }).length;
      if (soft >= 2) { SWEEP.carsGrass = (SWEEP.carsGrass || 0) + 1; SWEEP.at.cars.push([+x.toFixed(1), +y.toFixed(1), 'grass']); continue; }
    }
    const me = { x, y, a }; let clash = false;
    for (let i = -1; i <= 1 && !clash; i++) for (let j = -1; j <= 1 && !clash; j++) for (const o of grid.get(gk(x + i * 4, y + j * 4)) || []) if (Math.hypot(o.x - x, o.y - y) < 2 * HL && obb(me, o)) { clash = true; break; }
    if (clash) { SWEEP.carsOverlap++; SWEEP.at.cars.push([+x.toFixed(1), +y.toFixed(1), 'overlap']); continue; }
    const k = gk(x, y); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(me); kept.push(car);
  }
  SWEEP.carsKept = kept.length; PARKED.length = 0; PARKED.push(...kept);
  window.SW_PARKED_HIT = (x, y, r) => { for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const o of grid.get(gk(x + i * 4, y + j * 4)) || []) if (Math.hypot(o.x - x, o.y - y) < r) return true; return false; };
})();

// ---------- 2. props off the asphalt ----------
(function swProps() {
  if (SWEEP_OFF) return;
  const KEEP = new Set(['signal', 'cam', 'ercanopy', 'tower', 'radio', 'tank', 'qpile', 'memorial', 'hs_encl', 'dgbasket']);   // belong where they are, or are big site pieces
  const hard = (x, y) => { const t = tAt(Math.floor(x), Math.floor(y)); return t === TL.WATER || t === TL.BLDG || bAt(Math.floor(x), Math.floor(y)); };
  const out = [];
  for (const p of PROPS) {
    if (KEEP.has(p.k) || p.box || typeof p.x !== 'number') { out.push(p); continue; }
    const r = swRoadAt(p.x, p.y, 0.05);
    if (!r) { out.push(p); continue; }
    let moved = null;
    for (const side of [r.side, -r.side]) {   // straight out to the nearer edge first, 1.2 m past the curb
      for (const extra of [0.3, 0.5, 0.8]) {
        const off = r.o.w / 2 + extra, nx = r.fx + r.nx * side * off, ny = r.fy + r.ny * side * off;
        if (!swRoadAt(nx, ny, 0.05) && !hard(nx, ny)) { moved = [nx, ny]; break; }
      }
      if (moved) break;
    }
    if (!moved) { SWEEP.propsDropped++; continue; }
    SWEEP.at.props.push([p.k, +p.x.toFixed(1), +p.y.toFixed(1)]); p.x = moved[0]; p.y = moved[1]; SWEEP.propsMoved++; out.push(p);
  }
  PROPS.length = 0; PROPS.push(...out); PROPS.sort((a, b) => a.y - b.y);
})();
// headstones: not on the lanes and streets that run through a cemetery
if (!SWEEP_OFF) { const SW_NOSTONE = new Set();
  for (const c of CEMS) for (let j = Math.floor(c.y0 * 4 / 3.2); j * 3.2 <= c.y1 * 4 + 3.2; j++) for (let i = Math.floor(c.x0 * 4 / 1.6); i * 1.6 <= c.x1 * 4 + 1.6; i++) {
    const cx = i * 1.6 / 4, cy = j * 3.2 / 4;
    if (swRoadAt(cx, cy, 0.3, ['road', 'major', 'service', 'path']) || swRoadAt(cx, cy - 0.3, 0.2, ['road', 'major', 'service', 'path'])) { SW_NOSTONE.add(i + ',' + j); if (inPoly(c.P, cx, cy)) SWEEP.stonesHidden++; }
  }
  drawCemeteries = function () {   // groundplus.js's drawing, with the lanes kept clear
    const vx0 = camX * 4 - 2, vx1 = (camX + SW / T) * 4 + 2, vy0 = camY * 4 - 2, vy1 = (camY + SH / T) * 4 + 4;
    for (const c of CEMS) {
      if (!onScreen(c, 2)) continue;
      const mx0 = Math.max(c.x0 * 4, vx0), mx1 = Math.min(c.x1 * 4, vx1), my0 = Math.max(c.y0 * 4, vy0), my1 = Math.min(c.y1 * 4, vy1);
      for (let j = Math.ceil(my0 / 3.2); j * 3.2 <= my1; j++) for (let i = Math.ceil(mx0 / 1.6); i * 1.6 <= mx1; i++) {
        const h = hash(i * 7 + 3, j * 13 + 1); if (h % 10 < 3) continue;
        if (SW_NOSTONE.has(i + ',' + j)) continue;
        const mx = i * 1.6, my = j * 3.2, cx = mx / 4, cy = my / 4;
        if (NOSTONE.has(tAt(Math.floor(cx), Math.floor(cy)))) continue;
        if (MEMS.some(q => Math.hypot(q.x - cx, q.y - cy) < (q.kind === 'gar' ? 1.6 : 0.9))) continue;
        if (!inPoly(c.P, cx, cy) || !inPoly(c.P, cx - 0.4, cy) || !inPoly(c.P, cx + 0.4, cy) || !inPoly(c.P, cx, cy - 0.4) || !inPoly(c.P, cx, cy + 0.4)) continue;
        const x = Math.round((cx - camX) * T), y = Math.round((cy - camY) * T), tall = (h >> 6) % 3 === 0 ? 2 : 0;
        F('rgba(0,0,0,.22)', x + 1, y - 1, 6, 2);
        F('#34343a', x - 3, y - 7 - tall, 6, 7 + tall); F(STONE_COL[(h >> 4) & 3], x - 2, y - 6 - tall, 4, 6 + tall);
        F('rgba(255,255,255,.35)', x - 2, y - 6 - tall, 1, 5 + tall); F('#34343a', x - 3, y - 7 - tall, 1, 1); F('#34343a', x + 2, y - 7 - tall, 1, 1);
      }
    }
  };
}

// ---------- 3. walls and fences out of the drawn water ----------
(function swWalls() {
  if (SWEEP_OFF) return;
  const WALLISH = k => k === 'pl_stonewall' || k === 'chainlink' || /^yd_(fence|hedge)/.test(k);
  const out = [];
  for (const p of PROPS) {
    if (!WALLISH(p.k)) { out.push(p); continue; }
    let wet;
    if (p.k === 'pl_stonewall') {   // the land cell it edges, and the wall itself: either in the lake as drawn and it goes
      const cx = Math.floor(p.x) + 0.5, cy = Math.floor(p.y) + 0.5;
      const S = p.run === 'h' ? [[p.x - 0.4, p.y - 0.08], [p.x, p.y - 0.08], [p.x + 0.4, p.y - 0.08]] : [[p.x, p.y - 0.95], [p.x, p.y - 0.5], [p.x, p.y - 0.05]];
      wet = swInWater(cx, cy) || S.filter(([x, y]) => swInWater(x, y)).length >= 2;
      // the walls line Spring Brook's channel, not the open lake: facing more than 24 m of open water, it is lake shore
      const fx = Math.floor(p.x), fy = Math.floor(p.y), dx = p.run === 'v' ? (p.x - fx > 0.5 ? 1 : -1) : 0, dy = p.run === 'h' ? (p.y - fy > 0.5 ? 1 : -1) : 0;
      let run = 0; while (run < 7 && tAt(fx + dx * (run + 1), fy + dy * (run + 1)) === TL.WATER) run++;
      if (run >= 7) wet = true;
    } else wet = swInWater(p.x, p.y) || tAt(Math.floor(p.x), Math.floor(p.y)) === TL.WATER;
    if (wet) { SWEEP.wallsDropped++; SWEEP.at.walls.push([p.k, +p.x.toFixed(1), +p.y.toFixed(1)]); continue; }
    out.push(p);
  }
  PROPS.length = 0; PROPS.push(...out);
})();
window.SWEEP = SWEEP;

// ---------- 4. North / South: the street banner, the map's street readout and the corner signs follow the same rule the
// townsfolk use (tfStreetNS in townfolk.js): north of 10th Avenue a "South X" street is North X, and the other way round ----------
if (!SWEEP_OFF && typeof tfStreetNS === 'function') {
  const _sa = streetAt; streetAt = function (px, py) { const n = _sa(px, py); return n ? tfStreetNS(n, px, py) : n; };
  SWEEP.npcLines = 0;
  if (typeof TF !== 'undefined' && typeof TF_DATA !== 'undefined') for (const n of TF) for (const k of ['s1', 's2']) if (n[k] >= 0 && tfStreetNS(TF_DATA.st[n[k]], n.hx, n.hy) !== TF_DATA.st[n[k]]) SWEEP.npcLines++;
  SWEEP.signs = 0;
  for (const p of PROPS) if (p.k === 'sign') for (const k of ['a', 'b']) if (typeof p[k] === 'string') { const v = tfStreetNS(p[k], p.x, p.y); if (v !== p[k]) { p[k] = v; SWEEP.signs++; } }
}

// ---------- 5. parking lots: the automated check of every lot polygon against the drawn streets ----------
// For each lot: its area, how much of it lies under street asphalt, and how thin it is (4 pi A / perimeter^2; mean width
// 2A / perimeter). Two kinds look wrong and go: slivers (a strip under 5 m wide hugging a street, drawn as a second,
// paler edge beside the curb, with notches where the old 4 m mask stepped) and lots whose part off the street is a
// strip under 30 cells (480 m2) beside it. Lots with painted stalls are left alone. The full table is in SWEEP.lotTable.
(function swLots() {
  if (SWEEP_OFF || typeof PARKS === 'undefined') return;
  const stallIn = k => (typeof STL !== 'undefined' ? STL : []).some(s => { const x = (s.x1 + s.x2) / 2, y = (s.y1 + s.y2) / 2; return x >= k.x0 && x <= k.x1 && y >= k.y0 && y <= k.y1 && inPoly(k.P, x, y); });
  const table = [], keep = [];
  PARKS.forEach((k, idx) => {
    const P = k.P; let A = 0, per = 0;
    for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; A += p[0] * q[1] - q[0] * p[1]; per += Math.hypot(q[0] - p[0], q[1] - p[1]); }
    A = Math.abs(A) / 2;
    let n = 0, onR = 0, nearR = 0;
    for (let y = Math.floor(k.y0) + 0.25; y < k.y1; y += 0.5) for (let x = Math.floor(k.x0) + 0.25; x < k.x1; x += 0.5) {
      if (!inPoly(P, x, y)) continue; n++; if (swRoadAt(x, y, 0)) onR++; else if (swRoadAt(x, y, 1.5)) nearR++; }
    const fr = onR / Math.max(1, n), thin = 4 * Math.PI * A / (per * per || 1), width = 2 * A / (per || 1), rest = A * (1 - fr);
    const sliver = width < 1.25 && thin < 0.1 && (onR + nearR) / Math.max(1, n) > 0.5, strip = fr >= 0.4 && rest < 30;
    const why = sliver ? 'sliver' : strip ? 'street strip' : '';
    if (why && !stallIn(k)) { table.push([idx, +k.x0.toFixed(1), +k.y0.toFixed(1), +A.toFixed(1), +fr.toFixed(2), +width.toFixed(2), why]); SWEEP.lots++; return; }
    keep.push(k);
  });
  PARKS.length = 0; PARKS.push(...keep); SWEEP.lotTable = table;
})();

// ---------- Cars into stalls (Nov 22, Christian: "around and behind Amron there's a lot of cars in the grass and stacked") ----------
// Every pair of neighbouring parallel stall lines (STALLS, decimetres) makes a parking space. A parked car within 4 m of a free space
// is moved into it, nose along the lines; a car that sits among stall lines but has no free space near it is removed. Cars in lots
// without painted lines are left as they are.
(function swStallSnap() {
  if (SWEEP_OFF || typeof PARKED === 'undefined' || typeof STALLS === 'undefined') return;
  const seg = (x1, y1, x2, y2) => ({ x1, y1, x2, y2, mx: (x1 + x2) / 2, my: (y1 + y2) / 2, len: Math.hypot(x2 - x1, y2 - y1), a: Math.atan2(y2 - y1, x2 - x1) });
  const L = [];   // a line 8–13 m long divides two rows of spaces nose to nose: count it as two
  const SRC = (typeof STL !== 'undefined' ? STL.map(q => [q.x1 * 40, q.y1 * 40, q.x2 * 40, q.y2 * 40]) : STALLS);   // the lines as drawn (later passes trim STL, not STALLS)
  for (const s of SRC) { const x1 = s[0] / 10, y1 = s[1] / 10, x2 = s[2] / 10, y2 = s[3] / 10, len = Math.hypot(x2 - x1, y2 - y1), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    if (len > 3 && len < 8) L.push(seg(x1, y1, x2, y2)); else if (len >= 8 && len < 13) { L.push(seg(x1, y1, mx, my)); L.push(seg(mx, my, x2, y2)); } }
  const G = new Map(), gk = (x, y) => Math.floor(x / 8) * 100000 + Math.floor(y / 8);
  for (const l of L) { const k = gk(l.mx, l.my); if (!G.has(k)) G.set(k, []); G.get(k).push(l); }
  const near = (x, y, f) => { for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const o of G.get(gk(x + i * 8, y + j * 8)) || []) f(o); };
  const slots = [], SG = new Map();
  for (const l of L) near(l.mx, l.my, o => {   // o is the next line over: parallel, 2.3–3.4 m away across, ends lined up
    if (o === l) return; let da = Math.abs(((o.a - l.a) % Math.PI + Math.PI) % Math.PI); da = Math.min(da, Math.PI - da); if (da > 0.14) return;
    const ux = Math.cos(l.a), uy = Math.sin(l.a), dx = o.mx - l.mx, dy = o.my - l.my, along = dx * ux + dy * uy, across = -dx * uy + dy * ux;
    if (across < 2.3 || across > 3.4 || Math.abs(along) > 1.2) return;   // count each pair once (positive side only)
    const s = { x: (l.mx + o.mx) / 2, y: (l.my + o.my) / 2, a: l.a, used: false }; slots.push(s); const k = gk(s.x, s.y); if (!SG.has(k)) SG.set(k, []); SG.get(k).push(s); });
  const out = []; let moved = 0, dropped = 0;
  for (const car of PARKED) {
    const x = car[0] / 10, y = car[1] / 10;   // metres
    let best = null, bd = 6, lines = 0;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const s of SG.get(gk(x + i * 8, y + j * 8)) || []) { const d = Math.hypot(s.x - x, s.y - y); if (d < 10) lines++; if (!s.used && d < bd) { bd = d; best = s; } }
    if (best) { best.used = true; const flip = Math.cos((car[2] / 1000) - best.a) < 0 ? Math.PI : 0;
      if (bd > 0.3) moved++; out.push([Math.round(best.x * 10), Math.round(best.y * 10), Math.round((best.a + flip) * 1000), car[3]]); continue; }
    if (lines >= 2) { dropped++; continue; }   // among painted spaces but none free nearby: it was stacked on another car
    out.push(car);
  }
  PARKED.length = 0; PARKED.push(...out);
  SWEEP.stallSlots = slots.length; SWEEP.carsSnapped = moved; SWEEP.carsNoSlot = dropped;
})();
// any parked car that still has a painted line running through its body is removed (it sits across the spaces, not in one)
(function swCarsOnLines() {
  if (SWEEP_OFF || typeof PARKED === 'undefined' || typeof STALLS === 'undefined') return;
  const G = new Map(), gk = (x, y) => Math.floor(x / 8) * 100000 + Math.floor(y / 8);
  const SRC = (typeof STL !== 'undefined' ? STL.map(q => [q.x1 * 40, q.y1 * 40, q.x2 * 40, q.y2 * 40]) : STALLS);
  for (const s of SRC) { const x1 = s[0] / 10, y1 = s[1] / 10, x2 = s[2] / 10, y2 = s[3] / 10, n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4));
    for (let i = 0; i <= n; i++) { const k = gk(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n); if (!G.has(k)) G.set(k, new Set()); G.get(k).add(s); } }
  const HL = 2.1, HW = 0.8;   // metres, a little inside the car's outline
  const hit = (cx, cy, a, s) => {   // does segment s cross the car rectangle? test in the car's own frame
    const c = Math.cos(-a), sn = Math.sin(-a), P = [[s[0] / 10, s[1] / 10], [s[2] / 10, s[3] / 10]].map(([x, y]) => [(x - cx) * c - (y - cy) * sn, (x - cx) * sn + (y - cy) * c]);
    let [[x1, y1], [x2, y2]] = P, t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1;
    for (const [p, q] of [[-dx, x1 + HL], [dx, HL - x1], [-dy, y1 + HW], [dy, HW - y1]]) { if (p === 0) { if (q < 0) return false; continue; } const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } }
    return t0 <= t1; };
  const out = []; let n = 0;
  for (const car of PARKED) { const x = car[0] / 10, y = car[1] / 10, a = car[2] / 1000; let bad = false;
    for (let i = -1; i <= 1 && !bad; i++) for (let j = -1; j <= 1 && !bad; j++) for (const s of G.get(gk(x + i * 8, y + j * 8)) || []) if (hit(x, y, a, s)) { bad = true; break; }
    if (bad) n++; else out.push(car); }
  PARKED.length = 0; PARKED.push(...out); SWEEP.carsOnLines = n;
})();
