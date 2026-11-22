"use strict";
// ============================================================================
// The Springbrook Trail's boardwalk (Christian, Nov 18: "you have the wetlands and boardwalk as just more trail"). OpenStreetMap
// tags these stretches bridge=boardwalk / wooden bridge; they are drawn as a plank deck with rails over the marsh and water,
// walkable, and the trail line under them is no longer drawn as concrete. Marsh and the brook's open water come from
// js/data/lotfix.js (WiscLand 2 + the May 2025 photo).
// ============================================================================
(function () {
  const BW = [{"P":[[4249.9,3378.4],[4251.2,3371.5],[4258.9,3349.2],[4263.6,3329.5],[4265.9,3311.2],[4265.7,3257.1],[4261.1,3232.1],[4250.4,3205.3],[4235.8,3182.9],[4218.0,3166.7],[4201.8,3155.4],[4182.6,3149.1],[4166.8,3148.2],[4152.1,3152.3],[4137.5,3156.8],[4120.2,3158.0],[4099.3,3153.6],[4070.8,3142.1],[4061.8,3135.0],[4058.4,3124.3],[4041.1,3050.4],[4032.3,3034.0],[4011.5,3007.0],[3995.2,2993.2],[3979.7,2985.8]],"kind":"boardwalk","name":"Springbrook Trail"},{"P":[[4084.6,2855.3],[4085.2,2819.3],[4088.1,2774.8]],"kind":"bridge","name":"Springbrook Trail"}].map(b => Object.assign(b, { P: b.P.map(([x, y]) => [x / 4, y / 4]) }));
  const W = 2.6;   // deck width, metres
  for (const b of BW) { const xs = b.P.map(p => p[0]), ys = b.P.map(p => p[1]); Object.assign(b, { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) });
    for (let i = 1; i < b.P.length; i++) { const [ax, ay] = b.P[i - 1], [bx, by] = b.P[i], L = Math.hypot(bx - ax, by - ay);
      for (let t = 0; t <= L; t += 0.25) { const x = Math.floor(ax + (bx - ax) * t / (L || 1)), y = Math.floor(ay + (by - ay) * t / (L || 1)); const k = y * TW + x; if (TT[k] === TL.WATER || TT[k] === TL.WOODS || TT[k] === TL.MARSH) TT[k] = TL.PATH; } } }
  // drop the concrete trail lines that run along the boardwalk
  const near = (x, y) => BW.some(b => x > b.x0 - 1 && x < b.x1 + 1 && y > b.y0 - 1 && y < b.y1 + 1 && b.P.some((p, i) => { if (!i) return false; const a = b.P[i - 1], dx = p[0] - a[0], dy = p[1] - a[1], L2 = dx * dx + dy * dy || 1e-9;
    let t = ((x - a[0]) * dx + (y - a[1]) * dy) / L2; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t) < 0.8; }));
  for (const o of VEC) if (o.cl === 'path' && o.P.length > 1) { const on = o.P.filter(p => near(p[0], p[1])).length; if (on / o.P.length > 0.6) o.cl = 'boardwalk_hidden'; }
  const _ds = drawStreets;
  drawStreets = function () { _ds();
    for (const b of BW) { if (b.x1 < camX - 2 || b.x0 > camX + SW / T + 2 || b.y1 < camY - 2 || b.y0 > camY + SH / T + 2) continue;
      const pts = b.P.map(([x, y]) => [(x - camX) * T, (y - camY) * T]), w = W * PM;
      const path = () => { ctx.beginPath(); pts.forEach(([X, Y], i) => i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y)); };
      ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
      ctx.save(); ctx.translate(4, 5); path(); ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = w; ctx.stroke(); ctx.restore();
      path(); ctx.strokeStyle = '#4a3626'; ctx.lineWidth = w + 4; ctx.stroke();   // rails
      path(); ctx.strokeStyle = '#9a7650'; ctx.lineWidth = w; ctx.stroke();
      ctx.setLineDash([1, 3]); path(); ctx.strokeStyle = '#6e5238'; ctx.lineWidth = w - 2; ctx.stroke(); ctx.setLineDash([]);   // plank joints
      for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / (L || 1), ny = (bx - ax) / (L || 1);
        for (let t = 0; t < L; t += PM * 2.4) { const X = ax + (bx - ax) * t / L, Y = ay + (by - ay) * t / L; for (const s of [-1, 1]) F('#3a2a1c', Math.round(X + nx * s * (w / 2 + 1)) - 1, Math.round(Y + ny * s * (w / 2 + 1)) - 4, 3, 5); } }
      ctx.lineCap = 'round'; }
  };
})();

// ============================================================================
// Springbrook boardwalk, take two (Christian, Nov 19: "parts of Spring Brook aren't walkable, exaggerate the boardwalk and do it
// more artistically, with those square overlooks it has"). The marsh is no longer walkable; only the boardwalk, its overlooks and the
// trails cross it. The deck is drawn wider than life (3.6 m) with cross planks, rails and posts. The overlook at 4213,3170 gm is the one
// the May 2025 photo shows; the others are placed at open-water bends and are an artistic addition.
// ============================================================================
(function () {
  const BW2 = [[[4249.9,3378.4],[4251.2,3371.5],[4258.9,3349.2],[4263.6,3329.5],[4265.9,3311.2],[4265.7,3257.1],[4261.1,3232.1],[4250.4,3205.3],[4235.8,3182.9],[4218.0,3166.7],[4201.8,3155.4],[4182.6,3149.1],[4166.8,3148.2],[4152.1,3152.3],[4137.5,3156.8],[4120.2,3158.0],[4099.3,3153.6],[4070.8,3142.1],[4061.8,3135.0],[4058.4,3124.3],[4041.1,3050.4],[4032.3,3034.0],[4011.5,3007.0],[3995.2,2993.2],[3979.7,2985.8]],
    [[4084.6,2855.3],[4085.2,2819.3],[4088.1,2774.8]]].map(P => P.map(([x, y]) => [x / 4, y / 4]));
  const W = 3.6, OV = [[4213, 3170, 1], [4264, 3292, 0], [4072, 3146, 0], [4046, 3070, 0]];   // [gm x, gm y, seen in the photo]
  const OK = new Set(), carve = (x, y) => { const k = y * TW + x; OK.add(k); if (TT[k] === TL.WATER || TT[k] === TL.WOODS || TT[k] === TL.MARSH) TT[k] = TL.PATH; };
  const line4 = (ax, ay, bx, by, f) => { const L = Math.hypot(bx - ax, by - ay); let px = Math.floor(ax), py = Math.floor(ay); f(px, py);
    for (let t = 0; t <= L; t += 0.2) { const x = Math.floor(ax + (bx - ax) * t / (L || 1)), y = Math.floor(ay + (by - ay) * t / (L || 1)); if (x !== px && y !== py) f(x, py); f(x, y); px = x; py = y; } };
  for (const P of BW2) for (let i = 1; i < P.length; i++) line4(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], carve);
  // overlooks: a square deck on the water side of the nearest boardwalk segment
  const S = 7;
  const OVS = OV.map(([gx, gy, real]) => { const x = gx / 4, y = gy / 4; let best = null;
    for (const P of BW2) for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1e-9;
      const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)), qx = a[0] + dx * t, qy = a[1] + dy * t, d = Math.hypot(x - qx, y - qy);
      if (!best || d < best.d) best = { d, qx, qy, ang: Math.atan2(dy, dx) }; }
    const nx = -Math.sin(best.ang), ny = Math.cos(best.ang), off = (W / 2 + S / 2 - 0.4) / 4;
    const wet = s => { let n = 0; for (let r = 1.5; r < 9; r += 0.5) { const t = tAt(Math.floor(best.qx + nx * s * r), Math.floor(best.qy + ny * s * r)); if (t === TL.WATER) n += 2; else if (t === TL.MARSH) n++; } return n; };
    const s = wet(1) >= wet(-1) ? 1 : -1, cx = best.qx + nx * s * off, cy = best.qy + ny * s * off;
    for (let u = -S / 2; u <= S / 2; u += 1) for (let v = -S / 2; v <= S / 2; v += 1) carve(Math.floor(cx + (Math.cos(best.ang) * u - Math.sin(best.ang) * v) / 4), Math.floor(cy + (Math.sin(best.ang) * u + Math.cos(best.ang) * v) / 4));
    return { cx, cy, ang: best.ang + (s < 0 ? Math.PI : 0), real }; });
  // trails and paths that cross the marsh stay walkable
  for (const o of VEC) if (o.cl === 'path' || o.cl === 'footway' || o.cl === 'boardwalk_hidden') for (let i = 1; i < o.P.length; i++) line4(o.P[i - 1][0], o.P[i - 1][1], o.P[i][0], o.P[i][1], (x, y) => OK.add(y * TW + x));
  const _sm = solidM;
  solidM = function (mx, my) { const x = Math.floor(mx / CPD), y = Math.floor(my / CPD); if (tAt(x, y) === TL.MARSH && !OK.has(y * TW + x)) return true; return _sm(mx, my); };
  window.MARSH_OK = OK;
  window.clearTreesAt = function (cells) { for (const k of cells) { const t = TREE_CELL.get(k); if (!t) continue; TREE_CELL.delete(k); const R = TREE_ROWS[Math.floor(t.y)]; if (R) { const i = R.indexOf(t); if (i >= 0) R.splice(i, 1); } } };
  { const deck = new Set(); for (const P of BW2) for (let i = 1; i < P.length; i++) line4(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], (x, y) => { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) deck.add((y + b) * TW + x + a); });
    for (const o of OVS) for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) deck.add((Math.floor(o.cy) + b) * TW + Math.floor(o.cx) + a); clearTreesAt(deck); }
  // hide the first-pass deck and draw this one
  const _ds = drawStreets, PL = ['#a8845a', '#9a7650', '#a07c54', '#946f4a'];
  drawStreets = function () { const saveW = ctx.lineWidth; _ds(); const X = x => (x - camX) * T, Y = y => (y - camY) * T, w = W * PM;
    for (const P of BW2) { const xs = P.map(p => p[0]), ys = P.map(p => p[1]); if (Math.max(...xs) < camX - 3 || Math.min(...xs) > camX + SW / T + 3 || Math.max(...ys) < camY - 3 || Math.min(...ys) > camY + SH / T + 3) continue;
      const pts = P.map(([x, y]) => [X(x), Y(y)]), path = () => { ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); };
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.save(); ctx.translate(5, 7); path(); ctx.strokeStyle = 'rgba(0,0,0,.30)'; ctx.lineWidth = w + 4; ctx.stroke(); ctx.restore();
      path(); ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = w + 8; ctx.stroke();
      path(); ctx.strokeStyle = '#6a4c32'; ctx.lineWidth = w + 4; ctx.stroke();
      path(); ctx.strokeStyle = '#9a7650'; ctx.lineWidth = w; ctx.stroke();
      for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay); if (L < 1) continue;
        ctx.save(); ctx.translate(ax, ay); ctx.rotate(Math.atan2(by - ay, bx - ax));
        for (let t = 0, n = 0; t < L; t += 4, n++) { ctx.fillStyle = PL[hash(n, i) % 4]; ctx.fillRect(t, -w / 2, 3, w); }
        ctx.fillStyle = 'rgba(255,240,210,.18)'; ctx.fillRect(0, -w / 2, L, 2);
        for (let t = 0; t < L; t += PM * 2.4) for (const s of [-1, 1]) { ctx.fillStyle = '#2a1e14'; ctx.fillRect(t - 2, s * (w / 2 + 2) - 2, 4, 4); ctx.fillStyle = '#7a5a3c'; ctx.fillRect(t - 1, s * (w / 2 + 2) - 2, 2, 1); }
        ctx.restore(); } }
    for (const o of OVS) { const sx = X(o.cx), sy = Y(o.cy); if (sx < -80 || sy < -80 || sx > SW + 80 || sy > SH + 80) continue; const s = S * PM, h = s / 2;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(o.ang);
      ctx.fillStyle = 'rgba(0,0,0,.30)'; ctx.fillRect(-h + 5, -h + 7, s, s);
      ctx.fillStyle = '#3a2a1c'; ctx.fillRect(-h - 2, -h - 2, s + 4, s + 4);
      for (let t = 0, n = 0; t < s; t += 4, n++) { ctx.fillStyle = PL[hash(n, 7) % 4]; ctx.fillRect(-h + t, -h, 3, s); }
      ctx.fillStyle = 'rgba(255,240,210,.18)'; ctx.fillRect(-h, -h, s, 2);
      ctx.fillStyle = '#5a3e28'; ctx.fillRect(-h, h - 2, s, 2); ctx.fillRect(-h, -h, 2, s); ctx.fillRect(h - 2, -h, 2, s);   // rails on the three outer sides
      for (let t = 0; t <= s; t += s / 3) for (const [px, py] of [[-h + t, h], [-h, -h + t], [h, -h + t]]) { ctx.fillStyle = '#2a1e14'; ctx.fillRect(px - 2, py - 2, 5, 5); ctx.fillStyle = '#9a7650'; ctx.fillRect(px - 1, py - 2, 3, 1); }
      ctx.fillStyle = '#2a1e14'; ctx.fillRect(-s / 4, h - 11, s / 2, 5); ctx.fillStyle = '#8a6040'; ctx.fillRect(-s / 4 + 1, h - 11, s / 2 - 2, 2); ctx.fillStyle = '#2a1e14'; ctx.fillRect(-s / 4 + 2, h - 6, 2, 3); ctx.fillRect(s / 4 - 4, h - 6, 2, 3);   // a bench facing the water
      ctx.restore(); }
    ctx.lineCap = 'round'; ctx.lineWidth = saveW; };
  // the first pass's narrow deck is drawn by the earlier wrapper; cover it by drawing ours after (wider), nothing else needed
})();

// ============================================================================
// The Hudson Street Bridge over Antigo Lake (Christian, Nov 19: "the sidewalk doesn't join on the bridge, and the bridge is a historic
// and cool looking part of town, it's just a road here"). A New Deal (FERA) bridge, the grandest of the town's 1930s Spring Brook
// projects. The May 2025 photo shows one sidewalk on the west side, parapet walls on both sides, flared wingwalls at all four corners
// and light poles along the east wall; the Street View survey noted stonework and black globe lamps. The west walk now runs straight
// along the curb from the north approach across the deck to the south approach.
// ============================================================================
(function () {
  const WX = 908.35;   // the west walk, along the curb (cells)
  for (const vi of [840, 841, 1137]) { const o = VEC[vi]; if (!o) continue; o.P = o.P.map(([x, y]) => (x > 907 && x < 908.2 && y >= 846) ? [WX, y] : [x, y]);
    o.x0 = Math.min(...o.P.map(p => p[0])); o.x1 = Math.max(...o.P.map(p => p[0])); }
  for (let y = 929; y <= 936; y++) if (TT[y * TW + 907] === TL.PATH) TT[y * TW + 907] = TL.WATER;   // the old walk beside the deck, over the water
  for (let i = PROPS.length - 1; i >= 0; i--) { const p = PROPS[i]; if (p.x > 906 && p.x < 912.5 && p.y > 927.5 && p.y < 938.5 && (p.k === 'lamp' || p.k === 'pl_globelamp' || p.k === 'streetlight')) PROPS.splice(i, 1); }
  const y0 = 3714 / 4, y1 = 3750 / 4, xw = [3630.6 / 4, 3632.3 / 4], xe = [3643.6 / 4, 3645.3 / 4];
  for (const [x, y] of [[xw[0] + 0.2, y0 + 0.3], [xw[0] + 0.2, y1 + 0.1], [xw[0] + 0.2, (y0 + y1) / 2 + 0.2], [xe[1] - 0.2, y0 + 0.3], [xe[1] - 0.2, y1 + 0.1], [xe[1] - 0.2, (y0 + y1) / 2 + 0.2]])
    PROPS.push({ x, y, k: 'pl_globelamp' });
  PROPS.sort((a, b) => a.y - b.y);
  { const c = []; for (let y = 926; y <= 940; y++) for (let x = 905; x <= 913; x++) c.push(y * TW + x); clearTreesAt(c); }
  const ST = ['#a49c8c', '#948a7a', '#b0a898', '#8a8070'];
  const _ds = drawStreets;
  drawStreets = function () { _ds(); if (camX > 920 || camX + SW / T < 900 || camY > 942 || camY + SH / T < 924) return;
    const X = x => (x - camX) * T, Y = y => (y - camY) * T;
    const wall = (ax, ay, bx, by, th) => {   // a stone parapet from a to b (cells), th metres thick, seen from above
      const sx = X(ax), sy = Y(ay), L = Math.hypot(X(bx) - sx, Y(by) - sy), t = th * PM; ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.atan2(Y(by) - sy, X(bx) - sx));
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(2, -t / 2 + 5, L, t);
      ctx.fillStyle = '#3a342c'; ctx.fillRect(-1, -t / 2 - 1, L + 2, t + 2);
      for (let u = 0, n = 0; u < L; u += 9, n++) for (let r = 0; r < 2; r++) { ctx.fillStyle = ST[hash(n * 3 + r, Math.round(ax * 7)) % 4]; ctx.fillRect(u + (r ? 4 : 0), -t / 2 + r * t / 2, 8, t / 2 - 1); }
      ctx.fillStyle = 'rgba(255,250,235,.35)'; ctx.fillRect(0, -t / 2, L, 2);
      if (typeof SKY !== 'undefined' && SKY.phase === 'snow') { ctx.fillStyle = '#eef2f6'; ctx.fillRect(0, -t / 2, L, t / 2); }
      ctx.restore(); };
    const pier = (x, y) => { const s = 2.4 * PM, sx = X(x) - s / 2, sy = Y(y) - s / 2; F('rgba(0,0,0,.3)', sx + 4, sy + 6, s, s); F('#3a342c', sx - 1, sy - 1, s + 2, s + 2); F('#a8a090', sx, sy, s, s); F('#c4bcac', sx + 2, sy + 2, s - 4, 3); F('#8a8272', sx, sy + s - 3, s, 3); };
    // the deck's edge over the water, outside the walls
    F('#5a5248', X(xw[0]) - 5, Y(y0), 5, Y(y1) - Y(y0)); F('#5a5248', X(xe[1]), Y(y0), 5, Y(y1) - Y(y0));
    F('#c8c2b8', X(xw[1]), Y(y0), X(WX - 0.25) - X(xw[1]) + 1, Y(y1) - Y(y0));   // concrete between the wall and the walk
    F('#8a8a8e', X(xe[0]) - 2, Y(y0), X(xe[0]) - X(2.26 + 909.75 - 1.125) + 2, Y(y1) - Y(y0));   // east curb strip
    const xm = (xw[0] + xw[1]) / 2, xn = (xe[0] + xe[1]) / 2, f = 1.0;
    wall(xm, y0, xm, y1, 1.7); wall(xn, y0, xn, y1, 1.7);
    wall(xm, y0, xm - f, y0 - f * 0.9, 1.5); wall(xm, y1, xm - f, y1 + f * 0.9, 1.5); wall(xn, y0, xn + f, y0 - f * 0.9, 1.5); wall(xn, y1, xn + f, y1 + f * 0.9, 1.5);
    for (const [x, y] of [[xm, y0], [xm, y1], [xn, y0], [xn, y1], [xm - f, y0 - f * 0.9], [xm - f, y1 + f * 0.9], [xn + f, y0 - f * 0.9], [xn + f, y1 + f * 0.9], [xm, (y0 + y1) / 2], [xn, (y0 + y1) / 2]]) pier(x, y);
  };
})();

// ============================================================================
// Walk ends that stop just short of another walk (Nov 19 sweep, from the Hudson Street case): a walk end with no walk at it,
// and another walk's edge within 6 m ahead of it (or within 3 m any way), gets a short straight piece to meet it.
// ============================================================================
(function () {
  const W = VEC.filter(o => o.cl === 'path' && o.P.length > 1 && !o.gravel), add = [];
  const nearest = (o, x, y) => { let best = null; for (let i = 1; i < o.P.length; i++) { const a = o.P[i - 1], b = o.P[i], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1e-9;
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)), q = [a[0] + dx * t, a[1] + dy * t], d = Math.hypot(x - q[0], y - q[1]); if (!best || d < best.d) best = { d, q }; } return best; };
  for (const o of W) for (const end of [0, 1]) { const e = end ? o.P[o.P.length - 1] : o.P[0], p = end ? o.P[o.P.length - 2] : o.P[1];
    let free = true, cand = null;
    for (const q of W) { if (q === o || q.x1 < e[0] - 2 || q.x0 > e[0] + 2 || q.y1 < e[1] - 2 || q.y0 > e[1] + 2) continue; const n = nearest(q, e[0], e[1]);
      if (n.d < 0.3) { free = false; break; } if (n.d < 1.5 && (!cand || n.d < cand.d)) cand = n; }
    if (!free || !cand) continue;
    const dx = e[0] - p[0], dy = e[1] - p[1], L = Math.hypot(dx, dy) || 1, ahead = ((cand.q[0] - e[0]) * dx + (cand.q[1] - e[1]) * dy) / (L * cand.d || 1);
    if (!(ahead > 0.4 || cand.d < 0.75)) continue;
    const mid = [(e[0] + cand.q[0]) / 2, (e[1] + cand.q[1]) / 2], t = tAt(Math.floor(mid[0]), Math.floor(mid[1]));
    if (t === TL.WATER || t === TL.BLDG || t === TL.ROAD || t === TL.MAJOR) continue;
    add.push({ cl: 'path', w: o.w, P: [[e[0], e[1]], [cand.q[0], cand.q[1]]], name: '', lanes: 0, oneway: false, mk: '', x0: Math.min(e[0], cand.q[0]), x1: Math.max(e[0], cand.q[0]), y0: Math.min(e[1], cand.q[1]), y1: Math.max(e[1], cand.q[1]), cap: [1, 1], linked: 1 }); }
  for (const a of add) VEC.push(a); window.WALK_JOINS = add.length;
})();
