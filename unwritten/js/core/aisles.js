"use strict";
// =====================================================================
//  CAR PARK AISLES AS CAR PARK (Nov 28). Christian, at Field Street and Fifth Avenue by Lakeside Market: "This is wrong"
//  (the road shape). OpenStreetMap draws a car park's drive aisles as service lines, and the town drew every service
//  line as a curbed street, so the lot south of Fifth Avenue showed as a fan of diagonal streets with grass between
//  them, and two short aisles beside Field Street made a lump at the corner. The 2025 photo shows one paved lot there.
//  Here every service line that OpenStreetMap marks as a parking aisle or drive-through (js/data/aisles.js) is drawn as
//  lot pavement with no curb. An aisle that is not already inside a mapped lot gets its parking stalls too: 5.5 m of
//  pavement each side (no painted lines: the town's own stall painting is drawn later), so neighbouring aisles join into one lot as the photo shows.
//  Aisles the west sweep already folded into a lot (ixwAisle) are left to it. The lines stay 'service' for every other
//  use (parked cars, people, the sweeps). ?noaisle shows the town without it. Counts in window.AISLE.
// =====================================================================
const AISLE = { matched: 0, stalls: 0, ms: 0 };
(function aisles() {
  if (/[?&]noaisle\b/.test(location.search) || typeof AISLES === 'undefined') return;
  const t0 = performance.now(), G = 25, grid = new Map();
  const segD = (x, y, a, b, c, d) => { const dx = c - a, dy = d - b, L = dx * dx + dy * dy || 1; let t = ((x - a) * dx + (y - b) * dy) / L; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - a - t * dx, y - b - t * dy); };
  AISLES.forEach((A, i) => { for (let j = 0; j < A.length; j += 2) { const k = Math.floor(A[j] / G) * 10000 + Math.floor(A[j + 1] / G); if (!grid.has(k)) grid.set(k, new Set()); grid.get(k).add(i); } });
  const near = (x, y) => { const s = new Set(); const gx = Math.floor(x / G), gy = Math.floor(y / G);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const i of grid.get((gx + a) * 10000 + gy + b) || []) s.add(i); return s; };
  const dist = (x, y, A) => { let m = 1e9; for (let i = 0; i + 3 < A.length; i += 2) m = Math.min(m, segD(x, y, A[i], A[i + 1], A[i + 2], A[i + 3])); return m; };
  const inPoly = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  for (const o of VEC) {
    if (o.cl !== 'service' || o.P.length < 2 || o.ixwAisle) continue;
    const pts = o.P.map(p => [p[0] * 4, p[1] * 4]);   // metres
    let ok = false;
    for (const i of near(pts[0][0], pts[0][1])) { const A = AISLES[i], d = pts.map(p => dist(p[0], p[1], A));   // the sweeps may carry an end up to a street's centre line
      if (d.every(v => v < 12) && d.filter(v => v < 3.5).length >= Math.max(2, d.length * 0.8)) { ok = true; break; } }
    if (!ok) continue;
    o.aisle = true; AISLE.matched++;
    // stalls only where no mapped lot already paves around the aisle (sample the line every 2 m)
    let n = 0, inn = 0;
    for (let i = 1; i < o.P.length; i++) { const [ax, ay] = o.P[i - 1], [bx, by] = o.P[i], L = Math.hypot(bx - ax, by - ay) * 4, k = Math.max(1, Math.round(L / 2));
      for (let s = 0; s < k; s++) { const x = ax + (bx - ax) * s / k, y = ay + (by - ay) * s / k; n++;
        if (PARKS.some(K => x >= K.x0 && x <= K.x1 && y >= K.y0 && y <= K.y1 && inPoly(K.P, x, y))) inn++; } }
    if (n && inn / n < 0.6) { o.stalls = true; AISLE.stalls++; }
  }
  AISLE.ms = Math.round(performance.now() - t0);
})();

if (AISLE.matched) {
  const _ds = drawStreets, AIS = VEC.filter(o => o.aisle), STALL = 5.5;
  drawStreets = function () {
    const vis = AIS.filter(o => onScreen(o, 8)), st = vis.filter(o => o.stalls);
    if (!vis.length) return _ds();
    const fill = typeof ART !== 'undefined' && ART.ground ? artPattern('asph', 1) : '#62626a';
    // mapped lots and stall bands together: every edge first, then every surface, so a band running into a lot
    // joins it with no line across the asphalt (the lots are drawn here, and left out of the drawing below)
    const ixw = typeof IXW_OFF !== 'undefined' && !IXW_OFF, lots = PARKS.filter(k => onScreen(k, 2) && !(ixw && k.ixw));
    const lotPath = k => { ctx.beginPath(); k.P.forEach((p, i) => { const X = (p[0] - camX) * T, Y = (p[1] - camY) * T; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); };
    ctx.lineJoin = 'round'; ctx.lineCap = 'butt'; ctx.setLineDash([]);
    ctx.strokeStyle = '#9a968e'; ctx.lineWidth = 3; for (const k of lots) { lotPath(k); ctx.stroke(); }
    for (const o of st) strokeLine(o, (o.w + 2 * STALL / 4) * T + 6, '#9a968e');
    ctx.fillStyle = fill; for (const k of lots) { lotPath(k); ctx.fill(); }
    for (const o of st) strokeLine(o, (o.w + 2 * STALL / 4) * T, fill);
    ctx.lineCap = 'round';
    for (const o of vis) strokeLine(o, o.w * T, fill);   // the aisle itself: pavement, no curb
    const all = PARKS.slice(); PARKS.length = 0; for (const k of all) if (!lots.includes(k)) PARKS.push(k);
    for (const o of AIS) o.cl = 'aisle';
    try { _ds(); } finally { PARKS.length = 0; PARKS.push(...all); for (const o of AIS) o.cl = 'service'; }
  };
}
window.AISLE = AISLE;
