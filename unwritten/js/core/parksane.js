"use strict";
// ============================================================================
// Parked cars kept sane (Christian, Nov 18: "make sure cars are parked sanely"). The cars come from the May 2025 aerial
// (js/data/parked.js); some were caught mid-lane, crooked across stalls, on lawns by buildings or on top of each other.
// At load each one is checked against the game's own map:
//   - on a street: moved to the curb, turned to run with the street, and dropped near intersections, on narrow lanes
//     and on Superior Street's four lanes (no parking there);
//   - in a lot: turned to line up with the nearest painted stall line;
//   - inside a building, in water or woods: dropped; in a driveway or yard: kept as the photo shows;
//   - never two in one space: 2 m apart in lots, a car length apart along a curb.
// ============================================================================
(function () {
  if (typeof PARKED === 'undefined') return;
  const G = 8, key = (x, y) => Math.floor(x / G) * 100000 + Math.floor(y / G);
  const segs = new Map(), juncs = new Map(), stalls = new Map();
  const put = (m, x, y, v) => { const k = key(x, y); if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
  const near = (m, x, y) => { const r = []; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const a = m.get(key(x + i * G, y + j * G)); if (a) r.push(...a); } return r; };
  for (const o of VEC) if (o.cl === 'road' || o.cl === 'major' || o.cl === 'service') {
    for (let i = 1; i < o.P.length; i++) { const a = o.P[i - 1], b = o.P[i]; put(segs, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, [a, b, o]); }
    if (o.cl !== 'service') for (const e of [o.P[0], o.P[o.P.length - 1]]) put(juncs, e[0], e[1], [e, o]);
  }
  for (const s of (typeof STL !== 'undefined' ? STL : [])) put(stalls, (s.x1 + s.x2) / 2, (s.y1 + s.y2) / 2, s);
  const segDist = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1e-9; let t = ((x - a[0]) * dx + (y - a[1]) * dy) / L2; t = Math.max(0, Math.min(1, t));
    const fx = a[0] + dx * t, fy = a[1] + dy * t, L = Math.sqrt(L2), nx = -dy / L, ny = dx / L; return { d: Math.hypot(x - fx, y - fy), side: Math.sign((x - fx) * nx + (y - fy) * ny) || 1, fx, fy, nx, ny, ang: Math.atan2(dy, dx) }; };
  const closeAngle = (want, a) => { let best = want, bd = 9; for (const c of [want, want + Math.PI]) { const d = Math.abs(Math.atan2(Math.sin(c - a), Math.cos(c - a))); if (d < bd) { bd = d; best = c; } } return best; };
  // the nearest street's direction (Antigo's grid is nearly square, so this keeps lot rows parallel to the block)
  const roadAngle = (x, y) => { let best = null; for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) for (const [p, q] of (segs.get(key(x + i * G, y + j * G)) || [])) { const r = segDist(x, y, p, q); if (!best || r.d < best.d) best = r; } return best ? best.ang : 0; };
  const squareTo = (base, a) => { let best = base, bd = 9; for (let k = 0; k < 4; k++) { const c = base + k * Math.PI / 2, d = Math.abs(Math.atan2(Math.sin(c - a), Math.cos(c - a))); if (d < bd) { bd = d; best = c; } } return best; };
  const out = [], street = [], stat = { kept: 0, curb: 0, stall: 0, square: 0, row: 0, drop: 0 };
  for (const car of PARKED) {
    let x = car[0] / 40, y = car[1] / 40, a = car[2] / 1000; const fx = Math.floor(x), fy = Math.floor(y), t = tAt(fx, fy);
    if (t === TL.BLDG || t === TL.WATER || t === TL.WOODS || bAt(fx, fy)) { stat.drop++; continue; }
    if (t === TL.LAWN || t === TL.GRASS || t === TL.PITCH || t === TL.SAND || t === TL.FARM) {
      // a car on grass is usually a car on a driveway or lot edge the map drew a cell short; move it onto the hard
      // surface beside it, or leave it out (no cars parked on park lawns or ball fields)
      let mv = null; for (let r = 1; r <= 2 && !mv; r++) for (let i = -r; i <= r && !mv; i++) for (let j = -r; j <= r && !mv; j++) {
        const u = tAt(fx + i, fy + j); if ((u === TL.PAVED || u === TL.PARKING || u === TL.YARD) && !bAt(fx + i, fy + j)) mv = [i, j]; }
      if (!mv) { stat.drop++; continue; }
      x += mv[0]; y += mv[1];
    }
    let onStreet = false;
    if (t === TL.ROAD || t === TL.MAJOR) {
      let best = null; for (const [p, q, o] of near(segs, x, y)) { const r = segDist(x, y, p, q); if (!best || r.d < best.d) best = Object.assign(r, { o }); }
      if (!best || best.o.cl === 'service') { stat.drop++; continue; }
      const half = best.o.w / 2, off = half - 1.15 / 4;   // the car's centre sits 1.15 m in from the curb
      if (off < 0.55 || best.o.mk === 'turn') { stat.drop++; continue; }
      if (near(juncs, x, y).some(([e, o]) => o !== best.o && Math.hypot(e[0] - x, e[1] - y) < half + o.w / 2 + 1.5)) { stat.drop++; continue; }
      x = best.fx + best.nx * best.side * off; y = best.fy + best.ny * best.side * off; a = closeAngle(best.ang, a); onStreet = true; stat.curb++;
    } else if (t === TL.PARKING || t === TL.PAVED) {
      let best = null; for (const s of near(stalls, x, y)) { const r = segDist(x, y, [s.x1, s.y1], [s.x2, s.y2]); if (r.d < 0.9 && (!best || r.d < best.d)) best = r; }
      let aisle = null; for (const [p, q, o] of near(segs, x, y)) if (o.cl === 'service') { const r = segDist(x, y, p, q); if (r.d < o.w / 2 + 1.6 && (!aisle || r.d < aisle.d)) aisle = Object.assign(r, { o }); }
      if (best) { a = closeAngle(best.ang, a); stat.stall++; }
      else if (aisle) {   // beside a lot aisle: nosed in, the car's front at the aisle's edge, a row like the real lot
        const off = aisle.o.w / 2 + 0.6; x = aisle.fx + aisle.nx * aisle.side * off; y = aisle.fy + aisle.ny * aisle.side * off;
        a = closeAngle(aisle.ang + Math.PI / 2, a); stat.row++;
        if (bAt(Math.floor(x), Math.floor(y)) || tAt(Math.floor(x), Math.floor(y)) === TL.WATER) { stat.drop++; continue; }
      } else {   // no lines and no aisle mapped: square to the street and settle onto a stall grid (2.7 m wide, 5.6 m nose to tail)
        a = squareTo(roadAngle(x, y), a); stat.square++;
        const ux = Math.cos(a), uy = Math.sin(a), along = x * ux + y * uy, across = -x * uy + y * ux;
        const A = Math.round(along / 1.4) * 1.4, C = Math.round(across / 0.675) * 0.675; x = A * ux - C * uy; y = A * uy + C * ux;
      }
    }
    // the whole car, not just its middle, has to be clear of buildings and water: nudge it out a little, or leave it out
    const body = (x, y) => { const ux = Math.cos(a) * 0.55, uy = Math.sin(a) * 0.55, vx = -Math.sin(a) * 0.22, vy = Math.cos(a) * 0.22;
      return [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].every(([i, j]) => { const px = Math.floor(x + ux * i + vx * j), py = Math.floor(y + uy * i + vy * j), u = tAt(px, py); return !bAt(px, py) && u !== TL.BLDG && u !== TL.WATER && u !== TL.WOODS; }); };
    if (!body(x, y)) { let ok = null; if (!onStreet) for (const d of [0.25, 0.5]) for (const [i, j] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!ok && body(x + i * d, y + j * d)) ok = [x + i * d, y + j * d];
      if (!ok) { stat.drop++; continue; } x = ok[0]; y = ok[1]; }
    if (out.some(c => Math.hypot(c[0] / 40 - x, c[1] / 40 - y) < 0.6) || (onStreet && street.some(c => Math.hypot(c[0] - x, c[1] - y) < 1.35))) { stat.drop++; continue; }
    out.push([Math.round(x * 40), Math.round(y * 40), Math.round(a * 1000), car[3]]); if (onStreet) street.push([x, y]); stat.kept++;
  }
  PARKED.length = 0; PARKED.push(...out); window.PARKSANE = stat;
})();
