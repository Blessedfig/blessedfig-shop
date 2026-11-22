"use strict";
// =====================================================================
//  INTERSECTION SWEEP, WEST HALF (Nov 21). Christian: "there's multiple intersections that aren't right" (a tangle at
//  the high school's west lot: aisles with curbs criss-crossing one lot, a sidewalk running diagonally across the
//  asphalt, lot outlines stepping past each other with grass slivers between them).
//  Runs after sweep.js, on the part of town west of game metre x = 3200 (cell 800); sweep_ix_e.js does the east half.
//   1. street ends that stop part-way into a cross street are carried to its centre line, so the round junction patch
//      sits inside the asphalt instead of bulging out past the curb;
//   2. lots are mended as clusters on a 1 m grid: thin wedges of lot sticking out into grass (under 3 m) go, grass
//      slivers and notches under 3 m wide shut in by lot and street become lot, and service aisles that run inside a
//      lot are drawn as part of the lot (no curbs across the middle of a car park, as the 2025 photo shows);
//   3. a sidewalk that dead-ends inside a lot is cut back to the lot's edge; one that crosses a lot at a slant is
//      painted as a crosswalk across the asphalt instead of a concrete strip;
//   4. grass slivers under 3 m wide left between streets at a junction are paved in the street's own asphalt.
//  ?noixw shows the town without it. Counts in window.IXW.
// =====================================================================
const IXW_OFF = /[?&]noixw\b/.test(location.search);
const IXW = { snapped: 0, clusters: 0, lotsIn: 0, lotsOut: 0, filled: 0, trimmed: 0, aisles: 0, walkCut: 0, zebras: 0, patches: 0, at: [] };
const IXW_XMAX = 800, IXW_S = 0.25;   // west of cell 800; 1 m samples
const IXW_LOTS = [], IXW_ZEBRA = [], IXW_PATCH = [];
(function ixw() {
  if (IXW_OFF) return; const t0 = performance.now();
  const S = IXW_S, isRd = o => o.cl === 'road' || o.cl === 'major', isAs = o => o.cl === 'road' || o.cl === 'major' || o.cl === 'service';
  const segD = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1e-9; let t = ((x - a[0]) * dx + (y - a[1]) * dy) / L2; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t); };
  const proj = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1e-9; let t = ((x - a[0]) * dx + (y - a[1]) * dy) / L2; t = Math.max(0, Math.min(1, t)); return [a[0] + dx * t, a[1] + dy * t, t]; };
  const bbox = o => { const xs = o.P.map(p => p[0]), ys = o.P.map(p => p[1]); o.x0 = Math.min(...xs); o.x1 = Math.max(...xs); o.y0 = Math.min(...ys); o.y1 = Math.max(...ys); };
  const near = (L, x0, y0, x1, y1) => L.filter(o => o.x1 >= x0 && o.x0 <= x1 && o.y1 >= y0 && o.y0 <= y1);
  const RDS = VEC.filter(isRd);

  // ---------- 1. street ends carried to the cross street's centre line ----------
  // first a hook: a last leg under 10 m that bends more than 45 degrees onto a cross street of another name (Superior Street
  // at 6th and 10th Avenue, where the line jogs 5 m west to meet the avenue's vertex; the photo shows the street straight)
  for (const o of RDS) for (const end of [0, 1]) { const P = o.P; if (P.length < 3) continue;
    const e = end ? P[P.length - 1] : P[0], f = end ? P[P.length - 2] : P[1], g = end ? P[P.length - 3] : P[2]; if (e[0] >= IXW_XMAX) continue;
    let a = Math.abs(Math.atan2(f[1] - e[1], f[0] - e[0]) - Math.atan2(g[1] - f[1], g[0] - f[0])) % (2 * Math.PI); a = Math.min(a, 2 * Math.PI - a);
    if (Math.hypot(f[0] - e[0], f[1] - e[1]) >= 2.5 || a <= 0.8) continue;
    if (!RDS.some(q => q !== o && q.name !== o.name && q.P.some((p, i) => i && segD(e[0], e[1], q.P[i - 1], p) < 0.3))) continue;
    if (end) P.pop(); else P.shift(); bbox(o); IXW.hooks = (IXW.hooks || 0) + 1; }
  for (const o of RDS) for (const end of [0, 1]) {
    const P = o.P; if (P.length < 2) continue; const e = end ? P[P.length - 1] : P[0], f = end ? P[P.length - 2] : P[1]; if (e[0] >= IXW_XMAX) continue;
    const ux0 = e[0] - f[0], uy0 = e[1] - f[1], L0 = Math.hypot(ux0, uy0) || 1, ux = ux0 / L0, uy = uy0 / L0; let to = null, tb = 1e9;
    for (const q of near(RDS, e[0] - 3, e[1] - 3, e[0] + 3, e[1] + 3)) { if (q === o || q.w < o.w * 0.6) continue;
      for (let i = 1; i < q.P.length; i++) { const a = q.P[i - 1], b = q.P[i], d = segD(e[0], e[1], a, b); if (d >= q.w / 2 || d <= 0.25) continue;
        let ang = Math.abs(Math.atan2(uy, ux) - Math.atan2(b[1] - a[1], b[0] - a[0])) % Math.PI; ang = Math.min(ang, Math.PI - ang); if (ang < 0.5) continue;
        const dx = b[0] - a[0], dy = b[1] - a[1], den = ux * dy - uy * dx; if (Math.abs(den) < 1e-6) continue;
        const t = ((a[0] - e[0]) * dy - (a[1] - e[1]) * dx) / den, s2 = ((a[0] - e[0]) * uy - (a[1] - e[1]) * ux) / den;
        if (t > 0 && t < 3 && s2 >= -0.02 && s2 <= 1.02 && t < tb) { tb = t; to = [e[0] + ux * t, e[1] + uy * t]; } } }
    if (!to) continue;
    if (end) P.push(to); else P.unshift(to); bbox(o); IXW.snapped++;
  }

  // ---------- rasters ----------
  const tileAsph = (cx, cy) => { const i = cy * TW + cx, t = TT[i]; return !PHOTO_LAWN_SET.has(i) && (t === TL.PARKING || t === TL.PAVED || PHOTO_ASPH_SET.has(i)); };
  function Grid(x0, y0, x1, y1) {
    const W = Math.ceil((x1 - x0) / S), H = Math.ceil((y1 - y0) / S), g = { x0, y0, W, H, n: W * H };
    g.cx = i => x0 + (i + 0.5) * S; g.cy = j => y0 + (j + 0.5) * S; return g; }
  function rasterPoly(g, P, out, v) {   // scanline fill of ring P (cells) into out with value v
    const jy0 = Math.max(0, Math.floor((Math.min(...P.map(p => p[1])) - g.y0) / S)), jy1 = Math.min(g.H - 1, Math.ceil((Math.max(...P.map(p => p[1])) - g.y0) / S));
    for (let j = jy0; j <= jy1; j++) { const y = g.cy(j), xs = [];
      for (let i = 0, k = P.length - 1; i < P.length; k = i++) { const [xa, ya] = P[i], [xb, yb] = P[k]; if ((ya > y) !== (yb > y)) xs.push(xa + (y - ya) * (xb - xa) / (yb - ya)); }
      xs.sort((a, b) => a - b);
      for (let q = 0; q + 1 < xs.length; q += 2) for (let i = Math.max(0, Math.ceil((xs[q] - g.x0) / S - 0.5)); i < g.W && g.cx(i) < xs[q + 1]; i++) out[j * g.W + i] = v; } }
  function rasterVec(g, o, out, v, pad) {
    const r = o.w / 2 + pad;
    for (let k = 1; k < o.P.length; k++) { const a = o.P[k - 1], b = o.P[k];
      const i0 = Math.max(0, Math.floor((Math.min(a[0], b[0]) - r - g.x0) / S)), i1 = Math.min(g.W - 1, Math.ceil((Math.max(a[0], b[0]) + r - g.x0) / S));
      const j0 = Math.max(0, Math.floor((Math.min(a[1], b[1]) - r - g.y0) / S)), j1 = Math.min(g.H - 1, Math.ceil((Math.max(a[1], b[1]) + r - g.y0) / S));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (segD(g.cx(i), g.cy(j), a, b) < r) out[j * g.W + i] = v; } }
  function morph(g, a, r, dil) { const { W, H } = g, t = new Uint8Array(W * H), o = new Uint8Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { let v = dil ? 0 : 1; for (let d = -r; d <= r; d++) { const x = i + d, b = x < 0 || x >= W ? 0 : a[j * W + x]; if (dil ? b : !b) { v = dil ? 1 : 0; break; } } t[j * W + i] = v; }
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { let v = dil ? 0 : 1; for (let d = -r; d <= r; d++) { const y = j + d, b = y < 0 || y >= H ? 0 : t[y * W + i]; if (dil ? b : !b) { v = dil ? 1 : 0; break; } } o[j * W + i] = v; }
    return o; }
  function dist(g, m) {   // city-block distance (samples) from each set sample to the nearest unset one
    const { W, H } = g, D = new Float32Array(W * H); for (let k = 0; k < W * H; k++) D[k] = m[k] ? 1e6 : 0;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i; if (D[k]) D[k] = Math.min(D[k], (i ? D[k - 1] : 0) + 1, (j ? D[k - W] : 0) + 1); }
    for (let j = H - 1; j >= 0; j--) for (let i = W - 1; i >= 0; i--) { const k = j * W + i; if (D[k]) D[k] = Math.min(D[k], (i < W - 1 ? D[k + 1] : 0) + 1, (j < H - 1 ? D[k + W] : 0) + 1); }
    return D; }
  // small, thin, shut-in components of m: [cells], boundary fractions by neighbour class
  function comps(g, m, cls, fn) {
    const { W, H } = g, seen = new Uint8Array(W * H), D = dist(g, m);
    for (let k0 = 0; k0 < W * H; k0++) { if (!m[k0] || seen[k0]) continue; const q = [k0]; seen[k0] = 1; let edge = false, md = 0; const nb = {};
      for (let h = 0; h < q.length; h++) { const k = q[h], i = k % W, j = (k - i) / W; md = Math.max(md, D[k]); if (!i || !j || i === W - 1 || j === H - 1) edge = true;
        for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= W || jj >= H) continue; const kk = jj * W + ii;
          if (m[kk]) { if (!seen[kk]) { seen[kk] = 1; q.push(kk); } } else { const c = cls[kk]; nb[c] = (nb[c] || 0) + 1; } } }
      if (!edge) fn(q, md, nb); } }
  // the outline rings of a mask, simplified: [{ ring:[[x,y] cells], a: signed area in samples }]
  function rings(g, m) {
    const { W, H } = g, on = (i, j) => i >= 0 && j >= 0 && i < W && j < H && m[j * W + i] === 1, nxt = new Map(), add = (k, v) => { if (!nxt.has(k)) nxt.set(k, []); nxt.get(k).push(v); };
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (on(i, j)) {
      if (!on(i, j - 1)) add(i + ',' + j, [i + 1, j]); if (!on(i + 1, j)) add((i + 1) + ',' + j, [i + 1, j + 1]);
      if (!on(i, j + 1)) add((i + 1) + ',' + (j + 1), [i, j + 1]); if (!on(i - 1, j)) add(i + ',' + (j + 1), [i, j]); }
    const out = [];
    for (const [k0, L0] of nxt) while (L0.length) { const ring = []; let k = k0, n = 0;
      while (n++ < 200000) { const L = nxt.get(k); if (!L || !L.length) break; const q = L.shift(); ring.push(k.split(',').map(Number)); k = q[0] + ',' + q[1]; if (k === k0) break; }
      if (ring.length < 4) continue;
      let a = 0; for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; a += p[0] * q[1] - q[0] * p[1]; }
      const dp = (pts, eps) => { if (pts.length < 3) return pts; const s = pts[0], e = pts[pts.length - 1]; let md = 0, mi = 0; const dx = e[0] - s[0], dy = e[1] - s[1], LL = Math.hypot(dx, dy) || 1e-9;
        for (let i = 1; i < pts.length - 1; i++) { const d = Math.abs((pts[i][0] - s[0]) * dy - (pts[i][1] - s[1]) * dx) / LL; if (d > md) { md = d; mi = i; } }
        return md > eps ? dp(pts.slice(0, mi + 1), eps).slice(0, -1).concat(dp(pts.slice(mi), eps)) : [s, e]; };
      let far = 0; for (let i = 1; i < ring.length; i++) if (Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]) > Math.hypot(ring[far][0] - ring[0][0], ring[far][1] - ring[0][1])) far = i;
      const r2 = dp(ring.slice(0, far + 1), 1.1).slice(0, -1).concat(dp(ring.slice(far).concat([ring[0]]), 1.1).slice(0, -1));
      out.push({ ring: r2.map(([i, j]) => [g.x0 + i * S, g.y0 + j * S]), a: a / 2 }); }
    return out; }

  IXW.t1 = Math.round(performance.now() - t0);
  // ---------- 2. lots mended as clusters ----------
  const AS = VEC.filter(isAs), SVC = VEC.filter(o => o.cl === 'service');
  const west = PARKS.filter(k => (k.x0 + k.x1) / 2 < IXW_XMAX);
  const par = west.map((_, i) => i), find = i => par[i] === i ? i : (par[i] = find(par[i]));
  for (let a = 0; a < west.length; a++) for (let b = a + 1; b < west.length; b++) { const A = west[a], B = west[b];
    if (A.x1 + 1 >= B.x0 && B.x1 + 1 >= A.x0 && A.y1 + 1 >= B.y0 && B.y1 + 1 >= A.y0) par[find(a)] = find(b); }
  const groups = new Map(); west.forEach((k, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(k); });
  const gone = new Set(), aisles = new Set();
  for (const lots of groups.values()) {
    const x0 = Math.min(...lots.map(k => k.x0)) - 2, y0 = Math.min(...lots.map(k => k.y0)) - 2, x1 = Math.max(...lots.map(k => k.x1)) + 2, y1 = Math.max(...lots.map(k => k.y1)) + 2;
    if ((x1 - x0) * (y1 - y0) > 160000) continue;
    const g = Grid(x0, y0, x1, y1), N = g.n, L = new Uint8Array(N), A = new Uint8Array(N), cls = new Uint8Array(N);   // cls: 0 grass 1 lot 2 street 3 tile asphalt 4 building/water
    for (const k of lots) rasterPoly(g, k.P, L, 1);
    const area0 = L.reduce((s, v) => s + v, 0);
    const myAisles = [];
    for (const o of near(SVC, x0, y0, x1, y1)) {   // an aisle mostly inside the lot becomes part of it
      let n = 0, inn = 0; for (let k = 1; k < o.P.length; k++) { const a = o.P[k - 1], b = o.P[k], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        for (let t = 0; t <= len; t += S) { const x = a[0] + (b[0] - a[0]) * t / (len || 1), y = a[1] + (b[1] - a[1]) * t / (len || 1), i = Math.floor((x - x0) / S), j = Math.floor((y - y0) / S); n++;
          if (i >= 1 && j >= 1 && i < g.W - 1 && j < g.H - 1 && (L[j * g.W + i] || L[j * g.W + i + 1] || L[j * g.W + i - 1] || L[(j + 1) * g.W + i] || L[(j - 1) * g.W + i])) inn++; } }
      if (n && inn / n >= 0.6) myAisles.push(o); }
    for (const o of near(AS, x0, y0, x1, y1)) if (!myAisles.includes(o)) rasterVec(g, o, A, 1, 0.04);
    for (const o of myAisles) rasterVec(g, o, L, 1, 0);
    for (let j = 0; j < g.H; j++) for (let i = 0; i < g.W; i++) { const k = j * g.W + i, cx = Math.floor(g.cx(i)), cy = Math.floor(g.cy(j)), t = TT[cy * TW + cx];
      cls[k] = A[k] ? 2 : L[k] ? 1 : (t === TL.BLDG || TB[cy * TW + cx] || t === TL.WATER) ? 4 : tileAsph(cx, cy) ? 3 : 0; }
    // trim: lot wedges under 3 m wide poking out into grass (the street and pavement tiles count as solid beside them)
    const U = new Uint8Array(N); for (let k = 0; k < N; k++) U[k] = L[k] || A[k] || cls[k] === 3 ? 1 : 0;
    const O = morph(g, morph(g, U, 1, false), 1, true); let trimmed = 0;
    for (let k = 0; k < N; k++) if (L[k] && !O[k] && !A[k]) { L[k] = 0; trimmed++; if (cls[k] === 1) cls[k] = 0; }
    // fill: grass under 3 m wide (or a scrap under 12 m2) shut in by lot, street and pavement, touching the lot
    const G = new Uint8Array(N); for (let k = 0; k < N; k++) G[k] = !L[k] && !A[k] && cls[k] !== 3 && cls[k] !== 4 ? 1 : 0;
    for (let k = 0; k < N; k++) cls[k] = A[k] ? 2 : L[k] ? 1 : cls[k];
    let filled = 0;
    comps(g, G, cls, (q, md, nb) => { const tot = (nb[0] || 0) + (nb[1] || 0) + (nb[2] || 0) + (nb[3] || 0) + (nb[4] || 0), hard = (nb[1] || 0) + (nb[2] || 0) + (nb[3] || 0), m2 = q.length * S * S * 16;
      if (!(nb[1] > 0) || hard < tot * 0.75) return;
      if ((md <= 1.5 && m2 <= 80) || m2 <= 12 || (md <= 1 && m2 <= 200)) { for (const k of q) L[k] = 1; filled += m2; } });
    if (filled < 4 && trimmed * S * S * 16 < 15 && !myAisles.length) continue;   // nothing worth redrawing a clean outline for
    // the new outlines
    const R = rings(g, L), outer = R.filter(r => r.a > 0 && r.a * S * S * 16 >= 30), holes = R.filter(r => r.a < 0 && -r.a * S * S * 16 >= 6);
    if (!outer.length) continue;
    for (const k of lots) gone.add(k); for (const o of myAisles) aisles.add(o);
    for (const r of outer) { const H = holes.filter(h => inPoly(r.ring, h.ring[0][0] + 0.01, h.ring[0][1] + 0.01)).map(h => h.ring); const xs = r.ring.map(p => p[0]), ys = r.ring.map(p => p[1]);
      IXW_LOTS.push({ P: r.ring, H, ixw: 1, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }); }
    IXW.clusters++; IXW.lotsIn += lots.length; IXW.lotsOut += outer.length; IXW.filled += Math.round(filled); IXW.trimmed += Math.round(trimmed * S * S * 16); IXW.aisles += myAisles.length;
    IXW.at.push([Math.round((x0 + x1) * 2), Math.round((y0 + y1) * 2), Math.round(filled), Math.round(trimmed * S * S * 16), myAisles.length]);
  }
  if (gone.size) { const keep = PARKS.filter(k => !gone.has(k)); PARKS.length = 0; PARKS.push(...keep, ...IXW_LOTS); }
  for (const o of aisles) o.ixwAisle = true;
  // ---------- 2b. Antigo High School grounds (Nov 22): the lots hand-traced from the 2025 photo in js/data/fixes/hs.js ----------
  // (gm in the file; drawn here as mended lots with straight curbs, their aisles as lot, cars snapped into the new stalls)
  const HS = typeof FIXQ !== 'undefined' && FIXQ.find(f => f.area === 'hs' && f.lots);
  if (HS) { const c = p => [p[0] / 4, p[1] / 4], hsLots = [];
    for (const L of HS.lots) { const P = L.P.map(c), H = (L.H || []).map(h => h.map(c)), xs = P.map(p => p[0]), ys = P.map(p => p[1]);
      const k = { P, H, ixw: 1, hs: 1, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; IXW_LOTS.push(k); PARKS.push(k); hsLots.push(k); }
    for (const [x1, y1, x2, y2] of HS.hideVec || []) for (const o of VEC) if (o.cl === 'service' && o.P.length > 1) {   // a drive the photo does not show as drawn: hidden, the lot paves the true one
      const A = o.P[0], B = o.P[o.P.length - 1]; if (Math.hypot(A[0] * 4 - x1, A[1] * 4 - y1) < 1.5 && Math.hypot(B[0] * 4 - x2, B[1] * 4 - y2) < 1.5) o.cl = 'boardwalk_hidden'; }
    for (const o of SVC) if (HS.aisles.some(([x, y]) => Math.hypot(o.P[0][0] * 4 - x, o.P[0][1] * 4 - y) < 1.5)) o.ixwAisle = true;
    for (const [x1, y1, x2, y2, w] of HS.zebra) { const z = { P: [[x1 / 4, y1 / 4], [x2 / 4, y2 / 4]], w: w / 4 }; bbox(z); IXW_ZEBRA.push(z); }
    for (const i of HS.photoAsphOff) PHOTO_ASPH_SET.delete(i);
    for (const [fx, fy, tx, ty] of HS.lamps) { const p = PROPS.find(q => q.k === 'lamp' && Math.hypot(q.x - fx / 4, q.y - fy / 4) < 0.3); if (p) { p.x = tx / 4; p.y = ty / 4; } }
    const inHs = (x, y) => hsLots.some(k => inPoly(k.P, x, y) && !k.H.some(h => inPoly(h, x, y)));
    if (typeof PARKED !== 'undefined') { const used = new Set(), keep = [];
      for (const car of PARKED) { const x = car[0] / 40, y = car[1] / 40;
        if (x < 280 || x > 376 || y < 1126 || y > 1177) { keep.push(car); continue; }   // off the campus (back drive included)
        if (!inHs(x, y)) { IXW.hsCarsOff = (IXW.hsCarsOff || 0) + 1; continue; }   // on grass
        let bi = -1, bd = 2; HS.slots.forEach((s, i) => { const d = Math.hypot(s[0] / 4 - x, s[1] / 4 - y); if (!used.has(i) && d < bd) { bd = d; bi = i; } });
        if (bi < 0) { IXW.hsCarsOff = (IXW.hsCarsOff || 0) + 1; continue; }
        used.add(bi); const s = HS.slots[bi], a0 = car[2] / 1000; let a = s[2]; if (Math.cos(a - a0) < 0) a += Math.PI;
        keep.push([Math.round(s[0] * 10), Math.round(s[1] * 10), Math.round(a * 1000), car[3]]); IXW.hsCarsSnap = (IXW.hsCarsSnap || 0) + 1; }
      PARKED.length = 0; PARKED.push(...keep); }
  }

  IXW.t2 = Math.round(performance.now() - t0);
  // ---------- 3. sidewalks across lots ----------
  const inLotAt = (LP, x, y) => LP.some(k => x >= k.x0 && x <= k.x1 && y >= k.y0 && y <= k.y1 && inPoly(k.P, x, y) && !(k.H && k.H.some(h => inPoly(h, x, y))));
  const onVec = (L, x, y, pad) => L.some(o => x >= o.x0 - 3 && x <= o.x1 + 3 && y >= o.y0 - 3 && y <= o.y1 + 3 && o.P.some((p, i) => i && segD(x, y, o.P[i - 1], p) < o.w / 2 + pad));
  const RDV = VEC.filter(isRd), SVV = VEC.filter(o => o.cl === 'service' && !o.ixwAisle), AIS = [...aisles];
  const cut = (P, d0, d1) => { const out = []; let acc = 0;
    for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (!L) continue;
      const s0 = Math.max(d0, acc), s1 = Math.min(d1, acc + L);
      if (s1 > s0) { const pa = [a[0] + (b[0] - a[0]) * (s0 - acc) / L, a[1] + (b[1] - a[1]) * (s0 - acc) / L], pb = [a[0] + (b[0] - a[0]) * (s1 - acc) / L, a[1] + (b[1] - a[1]) * (s1 - acc) / L]; if (!out.length) out.push(pa); out.push(pb); }
      acc += L; }
    return out; };
  const addW = [];
  for (const o of VEC) { if (o.cl !== 'path' || o.surf === 'gravel' || o.x0 >= IXW_XMAX || o.P.length < 2) continue;
    if (!near(PARKS, o.x0 - 1, o.y0 - 1, o.x1 + 1, o.y1 + 1).length && !near(AIS, o.x0 - 1, o.y0 - 1, o.x1 + 1, o.y1 + 1).length) continue;
    const LR = near(RDV, o.x0 - 4, o.y0 - 4, o.x1 + 4, o.y1 + 4), LS = near(SVV, o.x0 - 4, o.y0 - 4, o.x1 + 4, o.y1 + 4), LP = near(PARKS, o.x0 - 1, o.y0 - 1, o.x1 + 1, o.y1 + 1), LA = near(AIS, o.x0 - 4, o.y0 - 4, o.x1 + 4, o.y1 + 4);
    const cum = [0]; for (let i = 1; i < o.P.length; i++) cum.push(cum[i - 1] + Math.hypot(o.P[i][0] - o.P[i - 1][0], o.P[i][1] - o.P[i - 1][1]));
    const tot = cum[cum.length - 1]; if (tot < 0.5) continue;
    const st = [], ds = [];   // per sample: 0 ground, 1 lot asphalt, 2 street (neutral: the walk runs under it)
    for (let d = 0; d <= tot + 1e-6; d += S) { let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const a = o.P[i - 1], b = o.P[i], f = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1), x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f;
      ds.push(d); st.push(onVec(LR, x, y, 0) || onVec(LS, x, y, 0) ? 2 : (inLotAt(LP, x, y) || onVec(LA, x, y, 0)) ? 1 : 0); }
    for (let i = 0; i < st.length; i++) if (st[i] === 2) { let j = i; while (j < st.length && st[j] === 2) j++; const l = i ? st[i - 1] : -1, r = j < st.length ? st[j] : -1; if (l === 1 || r === 1) for (let k = i; k < j; k++) st[k] = (l === 1 || l === -1) && (r === 1 || r === -1) ? 1 : st[k]; i = j; }
    const runs = []; for (let i = 0; i < st.length; i++) { if (st[i] !== 1) continue; let j = i; while (j < st.length && st[j] === 1) j++; runs.push([i, j - 1]); i = j; }
    if (!runs.length) continue;
    const inLen = runs.reduce((s, [a, b]) => s + (b - a + 1), 0) * S; if (inLen > tot * 0.85) continue;   // a walk drawn wholly in a lot: left for the photo check
    const keep = [], zeb = [];
    for (const [a, b] of runs) { const d0 = Math.max(0, ds[a] - S / 2), d1 = Math.min(tot, ds[b] + S / 2), len = d1 - d0;
      if (a === 0 || b === st.length - 1) { const pc = cut(o.P, d0, d1); if (pc.length && pc[0][0] < IXW_XMAX) keep.push([d0, d1, 'cut']); continue; }   // dead end inside the lot: cut back to the edge
      if (len <= 2) continue;   // across a driveway: the concrete runs on, as it does
      // a sidewalk running along a street past a lot entrance stays concrete; one crossing the lot is painted
      const p0 = cut(o.P, d0, d1); const ang = Math.atan2(p0[p0.length - 1][1] - p0[0][1], p0[p0.length - 1][0] - p0[0][0]);
      let sq = false; for (const q of near(RDV, o.x0 - 4, o.y0 - 4, o.x1 + 4, o.y1 + 4)) for (let k = 1; k < q.P.length; k++) {
        let d = Math.abs(ang - Math.atan2(q.P[k][1] - q.P[k - 1][1], q.P[k][0] - q.P[k - 1][0])) % (Math.PI / 2); d = Math.min(d, Math.PI / 2 - d); if (d < 0.2 && segD((p0[0][0] + p0[p0.length - 1][0]) / 2, (p0[0][1] + p0[p0.length - 1][1]) / 2, q.P[k - 1], q.P[k]) < 6) sq = true; }
      const mx = (p0[0][0] + p0[p0.length - 1][0]) / 2; if (len <= 10 && !sq && mx < IXW_XMAX) keep.push([d0, d1, 'zebra']); }
    if (!keep.length) continue;
    // rebuild: the walk's pieces off the asphalt stay walks; the crossings are painted
    const pieces = []; let at = 0;
    for (const [d0, d1, kind] of keep.sort((a, b) => a[0] - b[0])) { if (d0 > at + 0.05) pieces.push([at, d0]); if (kind === 'zebra') { const P = cut(o.P, d0, d1); if (P.length >= 2) { const z = { P, w: o.w }; bbox(z); IXW_ZEBRA.push(z); IXW.zebras++; } } else IXW.walkCut++; at = d1; }
    if (at < tot - 0.05) pieces.push([at, tot]);
    const full = o.P, cap = o.cap || [0, 0];
    if (!pieces.length) { o.P = [full[0], full[0]]; bbox(o); continue; }
    pieces.forEach(([d0, d1], n) => { const P = cut(full, d0, d1); const c = [d0 < 0.05 ? cap[0] : 2, d1 > tot - 0.05 ? cap[1] : 2];
      if (n === 0) { o.P = P.length >= 2 ? P : [full[0], full[0]]; o.cap = c; bbox(o); } else if (P.length >= 2) { const w = Object.assign({}, o, { P, cap: c }); bbox(w); addW.push(w); } });
    IXW.at.push(['walk', Math.round(o.x0 * 4), Math.round(o.y0 * 4)]);
  }
  VEC.push(...addW);

  IXW.t3 = Math.round(performance.now() - t0);
  // ---------- 4. grass slivers between streets at junctions ----------
  const J = [];
  for (const o of RDS) for (const e of o.P) { if (e[0] >= IXW_XMAX) continue;
    if (near(RDS, e[0] - 1, e[1] - 1, e[0] + 1, e[1] + 1).some(q => q !== o && q.P.some((p, i) => i && segD(e[0], e[1], q.P[i - 1], p) < Math.min(0.5, q.w / 2)))) { if (!J.some(c => Math.hypot(c[0] - e[0], c[1] - e[1]) < 4)) J.push(e); } }
  const ASV = VEC.filter(o => isAs(o) && !o.ixwAisle), WKS = VEC.filter(o => o.cl === 'path');
  for (const [jx, jy] of J) {
    const g = Grid(jx - 6, jy - 6, jx + 6, jy + 6), N = g.n, A = new Uint8Array(N), Wk = new Uint8Array(N), Lt = new Uint8Array(N), cls = new Uint8Array(N), col = new Uint8Array(N);
    const AV = near(ASV, jx - 8, jy - 8, jx + 8, jy + 8); AV.forEach((o, n) => rasterVec(g, o, A, n + 1, 0.04));
    for (const o of near(ASV, jx - 10, jy - 10, jx + 10, jy + 10)) { const c = o.cl === 'major' ? 1 : o.cl === 'road' ? 2 : 3; const tmp = new Uint8Array(N); rasterVec(g, o, tmp, 1, 0.3); for (let k = 0; k < N; k++) if (tmp[k] && (!col[k] || c < col[k])) col[k] = c; }
    for (const o of near(WKS, jx - 10, jy - 10, jx + 10, jy + 10)) rasterVec(g, o, Wk, 1, 0);
    for (const k of near(PARKS, jx - 8, jy - 8, jx + 8, jy + 8)) { rasterPoly(g, k.P, Lt, 1); if (k.H) for (const h of k.H) rasterPoly(g, h, Lt, 0); }
    const G = new Uint8Array(N);
    for (let j = 0; j < g.H; j++) for (let i = 0; i < g.W; i++) { const k = j * g.W + i, cx = Math.floor(g.cx(i)), cy = Math.floor(g.cy(j)), t = TT[cy * TW + cx];
      cls[k] = A[k] ? 2 : Lt[k] ? 1 : (t === TL.BLDG || TB[cy * TW + cx] || t === TL.WATER) ? 4 : tileAsph(cx, cy) ? 3 : Wk[k] ? 5 : 0; G[k] = cls[k] === 0 || cls[k] === 5 ? 1 : 0; }
    comps(g, G, cls, (q, md, nb) => { const tot = Object.values(nb).reduce((s, v) => s + v, 0), m2 = q.length * S * S * 16;
      if (!(nb[2] > 0) || (nb[2] || 0) + (nb[1] || 0) + (nb[3] || 0) < tot * 0.8) return;
      if (!((md <= 1.5 && m2 <= 60) || m2 <= 10)) return;
      // a corner sliver between two different streets (or a street and a lot), short: not a strip of median along one road
      const names = new Set(); let qx0 = 1e9, qx1 = -1e9, qy0 = 1e9, qy1 = -1e9;
      for (const k of q) { const i = k % g.W, j = (k - i) / g.W; qx0 = Math.min(qx0, i); qx1 = Math.max(qx1, i); qy0 = Math.min(qy0, j); qy1 = Math.max(qy1, j);
        for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const kk = (j + b) * g.W + i + a; if (A[kk]) names.add(AV[A[kk] - 1].name || AV[A[kk] - 1].cl + (A[kk] - 1)); } }
      if (Math.hypot(qx1 - qx0, qy1 - qy0) * S * 4 > 10) return;
      if (names.size < 2 && !(nb[1] > 0)) return;
      if (q.some(k => cls[k] === 5) && q.filter(k => cls[k] === 5).length > q.length * 0.5) return;   // mostly a sidewalk: leave it
      const cnt = [0, 0, 0, 0]; for (const k of q) { const i = k % g.W, j = (k - i) / g.W; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const kk = (j + b) * g.W + i + a; if (A[kk]) cnt[col[kk] || 2]++; } }
      const c = nb[2] >= (nb[1] || 0) + (nb[3] || 0) ? (cnt[1] >= cnt[2] && cnt[1] >= cnt[3] ? '#545458' : cnt[3] > cnt[2] ? '#6a6a70' : '#5c5c62') : '#62626a';
      const rects = []; const set = new Set(q.filter(k => cls[k] !== 5));
      for (const k of set) { const i = k % g.W, j = (k - i) / g.W; if (set.has(k - 1) && i > 0) continue; let n = 1; while (set.has(k + n) && (i + n) < g.W) n++; rects.push([g.x0 + i * S - 0.06, g.y0 + j * S - 0.06, n * S + 0.12, S + 0.12]); }
      const xs = rects.map(r => r[0]), ys = rects.map(r => r[1]);
      IXW_PATCH.push({ c, rects, x0: Math.min(...xs), x1: Math.max(...xs) + 2, y0: Math.min(...ys), y1: Math.max(...ys) + 1 }); IXW.patches++;
      IXW.at.push(['patch', Math.round(g.cx(q[0] % g.W) * 4), Math.round(g.cy(Math.floor(q[0] / g.W)) * 4), Math.round(m2)]); });
  }
  IXW.ms = Math.round(performance.now() - t0);
})();

// ---------- drawing: mended lots (with their grass islands) before the streets; aisles as lot; crosswalks and patches after ----------
if (!IXW_OFF && (IXW_LOTS.length || IXW_ZEBRA.length || IXW_PATCH.length || IXW.aisles)) {
  const _ds = drawStreets, AISLES = VEC.filter(o => o.ixwAisle);
  drawStreets = function () {
    const vis = IXW_LOTS.filter(k => onScreen(k, 2));
    if (vis.length) {
      ctx.beginPath();
      for (const k of vis) for (const R of [k.P, ...k.H]) { R.forEach((p, i) => { const X = (p[0] - camX) * T, Y = (p[1] - camY) * T; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); }
      ctx.fillStyle = '#62626a'; ctx.fill('evenodd'); ctx.strokeStyle = '#9a968e'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
    }
    const all = PARKS.slice(); PARKS.length = 0; for (const k of all) if (!k.ixw) PARKS.push(k);
    for (const o of AISLES) o.cl = 'ixw_aisle';
    try { _ds(); } finally { PARKS.length = 0; PARKS.push(...all); for (const o of AISLES) o.cl = 'service'; }
    for (const p of IXW_PATCH) if (onScreen(p, 1)) { ctx.fillStyle = p.c; for (const r of p.rects) ctx.fillRect(Math.floor((r[0] - camX) * T), Math.floor((r[1] - camY) * T), Math.ceil(r[2] * T) + 1, Math.ceil(r[3] * T) + 1); }
    ctx.lineCap = 'butt';
    for (const z of IXW_ZEBRA) if (onScreen(z, 2)) strokeLine(z, z.w * T, 'rgba(232,230,220,.9)', [Math.max(3, PM * 0.5), Math.max(3, PM * 0.5)]);
    ctx.setLineDash([]); ctx.lineCap = 'round';
  };
}
window.IXW = IXW;
