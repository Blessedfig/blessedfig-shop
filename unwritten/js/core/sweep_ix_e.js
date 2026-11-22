"use strict";
// =====================================================================
//  INTERSECTION SWEEP, EAST HALF (game x >= 3200 m, cell x >= 800). Nov 21.
//  Christian: "there's multiple intersections that aren't right" -- roads meeting at odd angles, a sidewalk running
//  diagonally across the asphalt, lot shapes lying over the streets with grass slivers and steps between them, and an
//  apartment lot with notches and a stray grey square. Runs after sweep.js and sweep_ix_w.js, on the town as drawn:
//   1. street ends that stop a step short of (or just off the centre of) the street they meet are joined to it;
//   2. service lanes that run along inside a street are trimmed (their paler edge showed beside the curb);
//   3. lot shapes are cut back to the curb of every street they run over (both sides kept if a lot straddles a street),
//      and the thin strips left over (under 3 m) go;
//   4. lot corners stopping a metre or two short of the curb or of the next lot, with no sidewalk between, are carried to it;
//   5. walks cutting diagonally across a parking lot are cut out (a walk runs along the street, or straight across);
//   6. pavement squares half under a lot's smooth edge go back to the ground, so the edge is the lot's, not 4 m steps;
//   7. around apartment buildings: concrete squares outside the walls, and one-square notches and spurs in their lots;
//   8. grass squares notched into paved yards and lanes become the pavement around them.
//  ?nosweep shows the town as it was. Counts in window.IXE.
// =====================================================================
const IXE = { ends: 0, extend: 0, svc: 0, clip: 0, split: 0, snap: 0, join: 0, grass: 0, hand: 0, drop: 0, walk: 0, tiles: 0, bld: 0, notch: 0, spur: 0, at: [] };
(function ixEast() {
  if (SWEEP_OFF) return;
  const XMIN = 800, ST = ['road', 'major'], ALL = ['road', 'major', 'service'];
  const reIndex = () => { SW_SEG.clear();
    for (const o of VEC) { if (o.cl !== 'road' && o.cl !== 'major' && o.cl !== 'service' && o.cl !== 'path') continue;
      for (let i = 1; i < o.P.length; i++) { const [ax, ay] = o.P[i - 1], [bx, by] = o.P[i], r = o.w / 2 + 1;
        const x0 = Math.floor((Math.min(ax, bx) - r) / SW_G), x1 = Math.floor((Math.max(ax, bx) + r) / SW_G), y0 = Math.floor((Math.min(ay, by) - r) / SW_G), y1 = Math.floor((Math.max(ay, by) + r) / SW_G);
        for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) { const k = gx * 100000 + gy; if (!SW_SEG.has(k)) SW_SEG.set(k, []); SW_SEG.get(k).push([ax, ay, bx, by, o]); } } } };
  const bbox = o => { const xs = o.P.map(p => p[0]), ys = o.P.map(p => p[1]); o.x0 = Math.min(...xs); o.x1 = Math.max(...xs); o.y0 = Math.min(...ys); o.y1 = Math.max(...ys); return o; };
  const segsNear = (x, y) => SW_SEG.get(Math.floor(x / SW_G) * 100000 + Math.floor(y / SW_G)) || [];

  // ---------- 1. street ends ----------
  const roads = VEC.filter(o => ALL.includes(o.cl) && o.P.length > 1);
  for (const o of roads) for (const end of [0, 1]) {
    const P = o.P, e = end ? P[P.length - 1] : P[0], f = end ? P[P.length - 2] : P[1]; if (e[0] < XMIN) continue;
    let best = null;   // a vertex of another street within 2.4 m: the end goes onto it (so the junction patch and curbs line up)
    for (const s of segsNear(e[0], e[1])) { const q = s[4]; if (q === o || !ALL.includes(q.cl)) continue;
      for (const v of [[s[0], s[1]], [s[2], s[3]]]) { const d = Math.hypot(v[0] - e[0], v[1] - e[1]); if (d > 0.02 && d < 0.6 && (!best || d < best.d)) best = { d, v }; }
      const r = swSegDist(e[0], e[1], s); if (r.d < 0.02) best = { d: 0, v: null }; }
    if (best && best.v && Math.hypot(best.v[0] - f[0], best.v[1] - f[1]) > 0.5) { IXE.at.push(['end', +e[0].toFixed(1), +e[1].toFixed(1)]); e[0] = best.v[0]; e[1] = best.v[1]; IXE.ends++; continue; }
    if (best) continue;
    if (swRoadAt(e[0], e[1], 0, ALL.filter(c => true)) && segsNear(e[0], e[1]).some(s => s[4] !== o && ALL.includes(s[4].cl) && swSegDist(e[0], e[1], s).d < s[4].w / 2)) continue;   // already ends inside the street it meets
    const L = Math.hypot(e[0] - f[0], e[1] - f[1]); if (!L) continue; const ux = (e[0] - f[0]) / L, uy = (e[1] - f[1]) / L;
    let hit = null;   // a street dead ahead, its centre line within its half width + 1.5 cells: the end runs on to it
    for (let t = 0.25; t <= 3; t += 0.25) { const x = e[0] + ux * t, y = e[1] + uy * t;
      for (const s of segsNear(x, y)) { const q = s[4]; if (q === o || !ALL.includes(q.cl) || q.name === o.name && q.name) continue; const r = swSegDist(x, y, s);
        if (r.d < 0.15 && t <= q.w / 2 + 1.5) { hit = [r.fx, r.fy]; break; } }
      if (hit) break; }
    if (hit) { IXE.at.push(['ext', +e[0].toFixed(1), +e[1].toFixed(1)]); e[0] = hit[0]; e[1] = hit[1]; IXE.extend++; }
  }
  for (const o of roads) bbox(o);
  reIndex();

  // ---------- 2. service lanes buried along a street ----------
  const add = [];
  for (const o of VEC) { if (o.cl !== 'service' || o.x1 < XMIN) continue;
    const bur = o.P.map((p, i) => { if (p[0] < XMIN) return false; const a = o.P[Math.max(0, i - 1)], b = o.P[Math.min(o.P.length - 1, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      return segsNear(p[0], p[1]).some(s => ST.includes(s[4].cl) && (() => { const r = swSegDist(p[0], p[1], s); return r.d < s[4].w / 2 - o.w / 4 && Math.abs(Math.sin(ang - r.ang)) < 0.3; })()); });
    if (!bur.some(Boolean)) continue;
    const runs = []; let cur = [o.P[0]];
    for (let i = 1; i < o.P.length; i++) { if (bur[i - 1] && bur[i]) { if (cur.length > 1) runs.push(cur); cur = [o.P[i]]; } else cur.push(o.P[i]); }
    if (cur.length > 1) runs.push(cur);
    const len = R => R.reduce((s, p, i) => i ? s + Math.hypot(p[0] - R[i - 1][0], p[1] - R[i - 1][1]) : 0, 0), keep = runs.filter(R => len(R) > 1);
    if (keep.length === 1 && keep[0].length === o.P.length) continue;
    IXE.svc++; IXE.at.push(['svc', +o.P[0][0].toFixed(1), +o.P[0][1].toFixed(1)]);
    if (!keep.length) { o.P = [o.P[0], o.P[0]]; o.cl = 'service_gone'; bbox(o); continue; }
    o.P = keep[0]; bbox(o); for (const R of keep.slice(1)) add.push(bbox(Object.assign({}, o, { P: R })));
  }
  VEC.push(...add); reIndex();

  // ---------- 3. lots cut back to the curb ----------
  if (typeof PARKS === 'undefined') return;
  const area = P => { let A = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; A += p[0] * q[1] - q[0] * p[1]; } return Math.abs(A) / 2; };
  const perim = P => P.reduce((s, p, i) => s + Math.hypot(P[(i + 1) % P.length][0] - p[0], P[(i + 1) % P.length][1] - p[1]), 0);
  const halfClip = (P, ax, ay, nx, ny, h) => {   // keep the part where (p - a) . n >= h
    const f = p => (p[0] - ax) * nx + (p[1] - ay) * ny - h, out = [];
    for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length], fp = f(p), fq = f(q);
      if (fp >= 0) out.push(p);
      if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); } }
    return out.length >= 3 ? out : null; };
  const stallIn = k => (typeof STL !== 'undefined' ? STL : []).some(s => { const x = (s.x1 + s.x2) / 2, y = (s.y1 + s.y2) / 2; return x >= k.x0 && x <= k.x1 && y >= k.y0 && y <= k.y1 && inPoly(k.P, x, y); });
  const mk = P => { const xs = P.map(p => p[0]), ys = P.map(p => p[1]); return { P, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; };
  const underAny = (x, y) => !!swRoadAt(x, y, 0.02, ALL);
  let work = [];
  for (const k of PARKS) {
    const cx = (k.x0 + k.x1) / 2; if (cx < XMIN) { work.push(k); continue; }
    let pieces = [k];
    for (let pass = 0; pass < 3; pass++) {   // a lot may run over several streets: cut each in turn
      let changed = false; const next = [];
      for (const p of pieces) {
        let done = null;
        const seen = new Set();
        for (let y = p.y0; y <= p.y1 + 0.01 && !done; y += 0.5) for (let x = p.x0; x <= p.x1 + 0.01 && !done; x += 0.5) {
          if (!inPoly(p.P, x, y)) continue;
          for (const s of segsNear(x, y)) { const o = s[4]; if (!ST.includes(o.cl) || seen.has(s)) continue; const r = swSegDist(x, y, s); if (r.d > o.w / 2 - 0.1) continue; seen.add(s);
            const L = Math.hypot(s[2] - s[0], s[3] - s[1]); if (L < 0.5) continue;
            const nx = -(s[3] - s[1]) / L, ny = (s[2] - s[0]) / L, h = o.w / 2 - 0.02;
            const A = halfClip(p.P, s[0], s[1], nx, ny, h), B = halfClip(p.P, s[0], s[1], -nx, -ny, h);
            const kept = [A, B].filter(Q => Q && area(Q) > 0.5);
            const a0 = area(p.P), a1 = kept.reduce((t, Q) => t + area(Q), 0); if (a0 - a1 < 0.3) continue;
            // what is cut away must lie under a street or within a cell of this stretch of it
            let n = 0, bad = 0;
            for (let yy = p.y0 + 0.125; yy < p.y1; yy += 0.25) for (let xx = p.x0 + 0.125; xx < p.x1; xx += 0.25) {
              if (!inPoly(p.P, xx, yy) || kept.some(Q => inPoly(Q, xx, yy))) continue; n++;
              if (underAny(xx, yy)) continue; const rr = swSegDist(xx, yy, s); if (rr.d < o.w / 2 + 1) continue; bad++; }
            if (n && bad / n < 0.04) { done = kept; break; }
          }
        }
        if (done) { changed = true; IXE.clip++; if (done.length > 1) IXE.split++; IXE.at.push(['clip', +p.x0.toFixed(1), +p.y0.toFixed(1)]); for (const Q of done) next.push(Object.assign(mk(Q), { ixe: 1 })); }
        else next.push(p);
      }
      pieces = next; if (!changed) break;
    }
    for (const p of pieces) {
      if (p === k) { work.push(k); continue; }
      const A = area(p.P), wid = 2 * A / (perim(p.P) || 1);
      if ((wid < 0.75 || A < 3) && !stallIn(p)) { IXE.drop++; IXE.at.push(['drop', +p.x0.toFixed(1), +p.y0.toFixed(1)]); continue; }
      work.push(p);
    }
  }

  // ---------- 4. lot corners carried to the curb (or to the edge of a service lane, within 3 m) ----------
  const WG = new Map(); work.forEach(k => { for (let gx = Math.floor(k.x0 / 8); gx <= Math.floor(k.x1 / 8); gx++) for (let gy = Math.floor(k.y0 / 8); gy <= Math.floor(k.y1 / 8); gy++) { const key = gx * 100000 + gy; if (!WG.has(key)) WG.set(key, []); WG.get(key).push(k); } });
  const clear = (v, to) => { for (let t = 0.1; t <= 1; t += 0.15) { const x = v[0] + (to[0] - v[0]) * t, y = v[1] + (to[1] - v[1]) * t; if (swRoadAt(x, y, 0.1, ['path']) || bAt(Math.floor(x), Math.floor(y))) return false; } return true; };
  const toLot = (k, v) => {   // the nearest edge of another lot within 3 m: lots a grass strip apart (the lanes between them are asphalt in the photo)
    let best = null; for (const q of WG.get(Math.floor(v[0] / 8) * 100000 + Math.floor(v[1] / 8)) || []) { if (q === k || v[0] < q.x0 - 0.8 || v[0] > q.x1 + 0.8 || v[1] < q.y0 - 0.8 || v[1] > q.y1 + 0.8) continue;
      if (inPoly(q.P, v[0], v[1])) return null;
      for (let i = 0; i < q.P.length; i++) { const a = q.P[i], b = q.P[(i + 1) % q.P.length], r = swSegDist(v[0], v[1], [a[0], a[1], b[0], b[1], null]); if (r.d > 0.02 && r.d <= 0.75 && (!best || r.d < best.d)) best = { d: r.d, p: [r.fx + (r.fx - v[0]) / r.d * 0.03, r.fy + (r.fy - v[1]) / r.d * 0.03] }; } }
    return best && clear(v, best.p) ? best.p : null; };
  for (const k of work) { if ((k.x0 + k.x1) / 2 < XMIN) continue; let moved = 0;
    for (const v of k.P) {
      const lp = toLot(k, v); if (lp) { const rr = swRoadAt(v[0], v[1], 0.75, ALL); if (!rr) { v[0] = lp[0]; v[1] = lp[1]; moved++; IXE.join++; continue; } }
      let r = null; for (const s of segsNear(v[0], v[1])) { if (!ALL.includes(s[4].cl)) continue; const q = swSegDist(v[0], v[1], s); if (!r || q.d - q.o.w / 2 < r.d - r.o.w / 2) r = q; }
      if (!r) continue; const gap = r.d - r.o.w / 2; if (gap <= 0.02 || gap > (r.o.cl === 'service' ? 0.75 : 0.6)) continue;
      let walk = false; for (let t = 0.1; t <= 1; t += 0.15) { const x = v[0] + (r.fx + r.nx * r.side * r.o.w / 2 - v[0]) * t, y = v[1] + (r.fy + r.ny * r.side * r.o.w / 2 - v[1]) * t; if (swRoadAt(x, y, 0.1, ['path'])) { walk = true; break; } if (bAt(Math.floor(x), Math.floor(y))) { walk = true; break; } }
      if (walk) continue;
      v[0] = r.fx + r.nx * r.side * (r.o.w / 2 - 0.02); v[1] = r.fy + r.ny * r.side * (r.o.w / 2 - 0.02); moved++; }
    if (moved) { IXE.snap += moved; Object.assign(k, mk(k.P), { P: k.P }); }
  }
  PARKS.length = 0; PARKS.push(...work);

  // ---------- 4b. by hand, from the 2025 photo: the city lot behind 5th Avenue and Superior Street by Spring Brook
  // (gm 3285-3347, 3851-3955). Five traced pieces overlapped with notched edges and grass slivers between the aisles
  // (Christian's screenshot of the tangle); the photo shows one lot north of the planted islands, with the drive out to
  // Superior Street, and one long lot of stalls south of them. Values in game metres. ----------
  const HAND = [
    { box: [3280, 3845, 3350, 3958], lots: [
      [3303, 3851, 3325, 3851, 3334, 3874, 3337, 3877, 3343, 3870, 3347, 3874, 3324, 3889, 3302, 3893, 3286, 3893, 3286, 3874, 3303, 3873],
      [3291, 3896, 3323, 3896, 3334, 3955, 3290, 3955, 3286, 3912]] },
  ];
  for (const h of HAND) { const [bx0, by0, bx1, by1] = h.box.map(v => v / 4);
    const keep = PARKS.filter(k => { const ox = Math.min(k.x1, bx1) - Math.max(k.x0, bx0), oy = Math.min(k.y1, by1) - Math.max(k.y0, by0); return !(ox > 0 && oy > 0 && ox * oy > 0.3 * (k.x1 - k.x0) * (k.y1 - k.y0)); });   // every lot mostly inside the box
    IXE.hand += PARKS.length - keep.length; PARKS.length = 0; PARKS.push(...keep);
    for (const Q of h.lots) { const P = []; for (let i = 0; i < Q.length; i += 2) P.push([Q[i] / 4, Q[i + 1] / 4]); PARKS.push(Object.assign(mk(P), { ixe: 2 })); }
    for (let y = Math.floor(by0); y <= by1; y++) for (let x = Math.floor(bx0); x <= bx1; x++) { const i = y * TW + x;   // pavement squares outside the new outline go back to the ground
      if ((TT[i] === TL.PAVED || TT[i] === TL.PARKING) && !TB[i] && !PARKS.some(k => inPoly(k.P, x + 0.5, y + 0.5)) && !swRoadAt(x + 0.5, y + 0.5, 0.3, ALL)) { TT[i] = TL.GRASS; IXE.tiles++; } }
  }

  // ---------- 5. walks cutting diagonally across a lot ----------
  const LG = new Map(); PARKS.forEach(k => { for (let gx = Math.floor(k.x0 / 8); gx <= Math.floor(k.x1 / 8); gx++) for (let gy = Math.floor(k.y0 / 8); gy <= Math.floor(k.y1 / 8); gy++) { const key = gx * 100000 + gy; if (!LG.has(key)) LG.set(key, []); LG.get(key).push(k); } });
  const lotAt = (x, y) => (LG.get(Math.floor(x / 8) * 100000 + Math.floor(y / 8)) || []).find(k => x >= k.x0 && x <= k.x1 && y >= k.y0 && y <= k.y1 && inPoly(k.P, x, y)) || null;
  const wadd = [];
  for (const o of VEC) { if (o.cl !== 'path' || o.x1 < XMIN || o.surf === 'gravel') continue;
    // resample at 0.25 cells, flag samples inside a lot, off the streets, at a slant to the street beside them
    const S = []; for (let i = 1; i < o.P.length; i++) { const a = o.P[i - 1], b = o.P[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      for (let t = 0; t < L; t += 0.25) { const x = a[0] + (b[0] - a[0]) * t / L, y = a[1] + (b[1] - a[1]) * t / L; let bad = false;
        if (x >= XMIN && lotAt(x, y) && !swRoadAt(x, y, 0, ALL)) { const r = swNearestRoad(x, y); const sn = r && r.d < 6 ? Math.abs(Math.sin(ang - r.ang)) : 0.7; bad = sn > 0.34 && sn < 0.94; }
        S.push({ x, y, bad, i }); } }
    const last = o.P[o.P.length - 1]; S.push({ x: last[0], y: last[1], bad: false, i: o.P.length - 1 });
    // runs of bad samples 1.5 cells and longer go
    const cut = new Uint8Array(S.length); let any = false;
    for (let i = 0; i < S.length;) { if (!S[i].bad) { i++; continue; } let j = i; while (j < S.length && S[j].bad) j++; if ((j - i) * 0.25 >= 1.5) { for (let q = i; q < j; q++) cut[q] = 1; any = true; } i = j; }
    if (!any) continue;
    const parts = []; let cur = [];
    S.forEach((s, i) => { if (cut[i]) { if (cur.length > 1) parts.push(cur); cur = []; } else cur.push([s.x, s.y]); });
    if (cur.length > 1) parts.push(cur);
    // keep the vertices (resampled lines are long): thin each part back to its corners
    const thin = R => R.filter((p, i) => i === 0 || i === R.length - 1 || (() => { const a = R[i - 1], b = R[i + 1]; return Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0])) > 0.002; })());
    const len = R => R.reduce((s, p, i) => i ? s + Math.hypot(p[0] - R[i - 1][0], p[1] - R[i - 1][1]) : 0, 0);
    const keep = parts.filter(R => len(R) >= 1).map(thin);
    IXE.walk++; IXE.at.push(['walk', +o.P[0][0].toFixed(1), +o.P[0][1].toFixed(1)]);
    const cap = o.cap || [0, 0];
    if (!keep.length) { o.P = [o.P[0], o.P[0]]; o.cl = 'path_gone'; bbox(o); continue; }
    const startKept = !cut[0], endKept = !cut[S.length - 1];
    keep.forEach((R, n) => { const c = [n === 0 && startKept ? cap[0] : 0, n === keep.length - 1 && endKept ? cap[1] : 0];
      if (n === 0) { o.P = R; o.cap = c; bbox(o); } else wadd.push(bbox(Object.assign({}, o, { P: R, cap: c }))); });
  }
  VEC.push(...wadd); reIndex();

  // ---------- 6. pavement squares under a lot's edge ----------
  const pave = t => t === TL.PAVED || t === TL.PARKING;
  const ground = (x, y) => { const cnt = {}; for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const u = tAt(x + i, y + j); if (u === TL.GRASS || u === TL.LAWN || u === TL.YARD) cnt[u] = (cnt[u] || 0) + 1; } const b = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; return b ? +b[0] : TL.GRASS; };
  const pts9 = (x, y) => [[0.05, 0.05], [0.5, 0.05], [0.95, 0.05], [0.05, 0.5], [0.5, 0.5], [0.95, 0.5], [0.05, 0.95], [0.5, 0.95], [0.95, 0.95]].map(([a, b]) => [x + a, y + b]);
  const free = (x, y) => !lotAt(x, y) && !swRoadAt(x, y, 0, ALL);
  const set = [];
  for (const k of PARKS) { if ((k.x0 + k.x1) / 2 < XMIN) continue;
    for (let y = Math.floor(k.y0) - 1; y <= k.y1 + 1; y++) for (let x = Math.floor(k.x0) - 1; x <= k.x1 + 1; x++) {
      const i = y * TW + x; if (!pave(TT[i]) || PHOTO_ASPH_SET.has(i) || TB[i]) continue;
      const S = pts9(x, y), inL = S.filter(([a, b]) => lotAt(a, b)).length, out = S.filter(([a, b]) => free(a, b)).length; if (!inL || out < 3 || (!free(x + 0.5, y + 0.5) && out < 5)) continue;
      // pavement that carries on past the lot as squares (a drive, an apron) stays
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => pave(tAt(x + dx, y + dy)) && pts9(x + dx, y + dy).every(([a, b]) => free(a, b)))) continue;
      set.push([i, x, y]); } }
  for (const [i, x, y] of set) { TT[i] = ground(x, y); IXE.tiles++; }

  // ---------- 7. apartment buildings: concrete squares outside the walls, notches and spurs in their lots ----------
  const nb4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (const b of BLD) { if (b.type !== 'apartments' || b.x1 < XMIN || !b.poly) continue;
    for (let y = Math.floor(b.y0); y <= b.y1; y++) for (let x = Math.floor(b.x0); x <= b.x1; x++) { const i = y * TW + x; if (TT[i] !== TL.BLDG || bAt(x, y) !== b) continue;
      if (pts9(x, y).filter(([a, c]) => inPoly(b.poly, a, c)).length >= 2) continue;
      TT[i] = ground(x, y); IXE.bld++; }
    for (let pass = 0; pass < 2; pass++) for (let y = Math.floor(b.y0) - 10; y <= b.y1 + 10; y++) for (let x = Math.floor(b.x0) - 10; x <= b.x1 + 10; x++) { const i = y * TW + x, t = tAt(x, y); if (TB[i]) continue;
      const pv = nb4.filter(([dx, dy]) => pave(tAt(x + dx, y + dy))).length;
      if ((t === TL.GRASS || t === TL.LAWN || t === TL.YARD) && !ROAD_GROUND[i] && pv >= 3 && !lotAt(x + 0.5, y + 0.5)) { TT[i] = TL.PARKING; IXE.notch++; continue; }
      if (pave(t) && !PHOTO_ASPH_SET.has(i) && pv <= 1 && !lotAt(x + 0.5, y + 0.5) && !nb4.some(([dx, dy]) => { const u = tAt(x + dx, y + dy); return u === TL.ROAD || u === TL.MAJOR || TB[(y + dy) * TW + x + dx]; })) { TT[i] = ground(x, y); IXE.spur++; } }
  }

  // ---------- 8. grass notches in paved yards: a 4 m square of grass with pavement (or a lane) on three sides, or a strip
  // of grass mostly under a lane with pavement either side, is the same pavement in the photo (the shopping-centre lots
  // along Neva Road showed a chequer of green squares between the aisles) ----------
  const grassT = t => t === TL.GRASS || t === TL.LAWN || t === TL.YARD;
  const paved = (x, y) => { const t = tAt(x, y); return pave(t) || (t >= 0 && !grassT(t) && t !== TL.ROAD && t !== TL.MAJOR && t !== TL.BLDG && t !== TL.WATER && t !== TL.PATH && false) || !!lotAt(x + 0.5, y + 0.5) || !!swRoadAt(x + 0.5, y + 0.5, 0, ['service']); };
  for (let pass = 0; pass < 2; pass++) { const fill = [];
    for (let y = 1; y < TH - 1; y++) for (let x = XMIN; x < TW - 1; x++) { const i = y * TW + x; if (!grassT(TT[i]) || ROAD_GROUND[i] || PHOTO_LAWN_SET.has(i) || TB[i]) continue;
      if (!pave(TT[i - 1]) && !pave(TT[i + 1]) && !pave(TT[i - TW]) && !pave(TT[i + TW])) continue;   // quick reject: no paved square beside it
      if (swRoadAt(x + 0.5, y + 0.5, 0.1, ['path'])) continue;
      const pn = nb4.filter(([dx, dy]) => paved(x + dx, y + dy)).length; if (pn < 2) continue;
      const cov = pts9(x, y).filter(([a, c]) => lotAt(a, c) || swRoadAt(a, c, 0, ALL)).length;
      if (pn >= 3 || cov >= 4) fill.push(i); }
    for (const i of fill) { TT[i] = TL.PARKING; IXE.grass++; } }
})();
window.IXE = IXE;
