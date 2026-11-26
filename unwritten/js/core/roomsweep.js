"use strict";
// =====================================================================
//  EVERY FLOOR CAN BE WALKED TO (Nov 21, Christian: "In Lakeside and Uma there are not walkable areas"). A last pass over every
//  inside that rooms.js and its layers (food, retail, biz, homes, civic, out) build, run once when the room is first built:
//   1. the spot you step in on is floor, and every door out is reachable;
//   2. any floor not joined to the door gets a gap: the cheapest way through, cutting the fewest shelves, tables or counter
//      tiles (a staff-only door or a thin inside wall becomes an open doorway). Outer walls, front doors, registers, staff
//      and one-of-a-kind things (the only fridge, the only bed) are never cut;
//   3. floor that can't be joined without breaking an outside wall (a scrap of outline only touching the rest at a corner)
//      is closed off, so nothing on screen looks like floor that isn't.
//  The stand-in shops (rooms.js 'shop'/'pharmacy'/'florist') also get cross aisles through long shelf runs, and the
//  drugstore counter becomes a real counter at the back instead of a fence along the whole back wall.
// =====================================================================
ROOM_WALK.add('Do');   // an open doorway made by the sweep
const RSW_KEEP = new Set(['e', 'k', 'N', 'U', 'V', 'j', 'O', 'W', ' ']);
const RSW_KEEP_RE = /dr$|door|gate|stair|elev|exit|reg|till/;
const RSW_STATS = { rooms: 0, fixed: 0, cut: 0, sealed: 0, ms: 0 };
function roomSweep(F) {
  const t0 = performance.now(), { R, W, H } = F, N = W * H;
  const npc = new Uint8Array(N); for (const n of F.npcs || []) if (!n.when && n.x >= 0 && n.x < W && n.y >= 0 && n.y < H) npc[n.y * W + n.x] = 1;
  // Nov 26: a gated door (the safety-gear doors at Volm and the Wood Technology Center, industry.js ppeDoor) counts as a way
  // through, so the sweep no longer opens a second doorway that walks around the safety gear
  const gated = (typeof roomHook === 'function' && F.b && roomHook(F.b).gateD) ? 1 : 0;
  const wk = new Uint8Array(N); for (let v = 0; v < H; v++) { const r = R[v]; for (let u = 0; u < W; u++) wk[v * W + u] = (ROOM_WALK.has(r[u]) || gated && r[u] === 'D') && !npc[v * W + u] ? 1 : 0; }
  const inner = (u, v) => u >= 0 && v >= 0 && u < W && v < H && !['W', 'O', ' '].includes(R[v][u]);
  // the step-in spot
  let s = F.ey * W + F.ex;
  if (!wk[s]) { const t = R[F.ey][F.ex];
    if (!npc[s] && t !== 'e' && t !== ' ' && t !== 'O') { R[F.ey][F.ex] = '.'; wk[s] = 1; }   // just inside the front door: even a wall there goes
    else { for (const [a, c] of [[F.ud, F.vd - 1], [F.ud - 1, F.vd], [F.ud + 1, F.vd]]) if (wk[c * W + a] && R[c][a] !== 'e') { F.ex = a; F.ey = c; s = c * W + a; break; } } }
  if (!wk[s]) return;
  // what's reachable now
  const seen = new Uint8Array(N), stk = new Int32Array(N);
  const flood = i0 => { let sp = 0; stk[sp++] = i0; seen[i0] = 1; while (sp) { const i = stk[--sp], u = i % W;
      if (u > 0 && wk[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; stk[sp++] = i - 1; } if (u < W - 1 && wk[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; stk[sp++] = i + 1; }
      if (i >= W && wk[i - W] && !seen[i - W]) { seen[i - W] = 1; stk[sp++] = i - W; } if (i + W < N && wk[i + W] && !seen[i + W]) { seen[i + W] = 1; stk[sp++] = i + W; } } };
  flood(s);
  let left = 0; for (let i = 0; i < N; i++) if (wk[i] && !seen[i]) left++;
  RSW_STATS.rooms++; if (!left) { RSW_STATS.ms += performance.now() - t0; return; }
  // the cost of each tile on a way through: floor 0, a staff door 2, behind a counter 3, furniture 6, a thin inside wall 20,
  // a one-of-a-kind thing 40; never: outer walls, windows, doors out, registers, staff
  const count = new Map(); for (const r of R) for (const t of r) count.set(t, (count.get(t) || 0) + 1);
  const cost = new Int16Array(N);
  for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) { const i = v * W + u, t = R[v][u];
    if (wk[i]) { cost[i] = 0; continue; }
    if (npc[i] || RSW_KEEP.has(t) && t !== 'W' || (t.length > 1 && RSW_KEEP_RE.test(t))) { cost[i] = -1; continue; }
    if (t === 'W') { cost[i] = (inner(u - 1, v) && inner(u + 1, v)) || (inner(u, v - 1) && inner(u, v + 1)) ? 20 : -1; continue; }
    cost[i] = t === 'D' ? 2 : t === 'x' ? 3 : count.get(t) === 1 ? 40 : 6; }
  // one pass of the cheapest way out from what's reached (a bucket queue: costs are small whole numbers). Each time it touches
  // floor not yet reached, the way there is cut, that piece joins what's reached at the current cost, and the search goes on.
  const dist = new Int32Array(N).fill(1e9), prev = new Int32Array(N).fill(-1), B = [[]];
  let cut = 0;
  for (let i = 0; i < N; i++) if (seen[i]) { dist[i] = 0; B[0].push(i); }
  for (let d = 0; d < B.length && left > 0; d++) { const q = B[d]; if (!q) continue;
    for (let k = 0; k < q.length && left > 0; k++) { const i = q[k]; if (dist[i] !== d) continue;
      const u = i % W;
      for (let n = 0; n < 4; n++) { const j = n === 0 ? (u > 0 ? i - 1 : -1) : n === 1 ? (u < W - 1 ? i + 1 : -1) : n === 2 ? i - W : i + W;
        if (j < 0 || j >= N || cost[j] < 0 || seen[j] && dist[j] <= d) continue;
        if (wk[j] && !seen[j]) {   // a piece not reached: cut the way to it, then take it in
          for (let a = i; a >= 0 && !seen[a]; a = prev[a]) { if (!wk[a]) { const au = a % W, av = (a / W) | 0, t = R[av][au]; R[av][au] = t === 'W' || t === 'D' ? 'Do' : '.'; wk[a] = 1; cost[a] = 0; cut++; } }
          for (let a = i; a >= 0 && !seen[a]; a = prev[a]) { seen[a] = 1; dist[a] = d; q.push(a); }
          let sp = 0; stk[sp++] = j; seen[j] = 1;
          while (sp) { const c = stk[--sp], cu = c % W; dist[c] = d; q.push(c); left--;
            if (cu > 0 && wk[c - 1] && !seen[c - 1]) { seen[c - 1] = 1; stk[sp++] = c - 1; } if (cu < W - 1 && wk[c + 1] && !seen[c + 1]) { seen[c + 1] = 1; stk[sp++] = c + 1; }
            if (c >= W && wk[c - W] && !seen[c - W]) { seen[c - W] = 1; stk[sp++] = c - W; } if (c + W < N && wk[c + W] && !seen[c + W]) { seen[c + W] = 1; stk[sp++] = c + W; } }
          continue; }
        if (seen[j]) continue;
        const nd = d + cost[j] + 1; if (nd < dist[j]) { dist[j] = nd; prev[j] = i; (B[nd] || (B[nd] = [])).push(j); } } } }
  // what still can't be reached is a scrap of outline beyond an outside wall: close it off (doors out are left alone)
  let sealed = 0;
  if (left) for (let j = 0; j < N; j++) if (wk[j] && !seen[j]) { const u = j % W, v = (j / W) | 0; if (R[v][u] === 'e') continue; R[v][u] = ' '; sealed++; }
  if (sealed) for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) if (R[v][u] !== ' ' && !wk[v * W + u]) {   // furniture left floating in a closed-off scrap
    let any = false; for (const [a, c] of [[u + 1, v], [u - 1, v], [u, v + 1], [u, v - 1]]) if (a >= 0 && c >= 0 && a < W && c < H && seen[c * W + a]) any = true;
    if (!any && R[v][u] !== 'W' && R[v][u] !== 'O' && R[v][u] !== 'e' && !npc[v * W + u]) { let inS = false; for (const [a, c] of [[u + 1, v], [u - 1, v], [u, v + 1], [u, v - 1]]) if (R[c] && R[c][a] === ' ') inS = true; if (inS) R[v][u] = ' '; } }
  if (sealed) {   // and the walls around a closed-off scrap, where they don't also bound the room that's kept
    const keepT = (u, v) => u >= 0 && v >= 0 && u < W && v < H && !['W', 'O', ' '].includes(R[v][u]);
    const drop = [];
    for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) { const t = R[v][u]; if (t !== 'W' && t !== 'O') continue;
      let nearS = false, nearK = false;
      for (let dv = -1; dv <= 1; dv++) for (let du = -1; du <= 1; du++) { const a = u + du, c = v + dv; if (a < 0 || c < 0 || a >= W || c >= H) continue;
        if (R[c][a] === ' ' && wk[c * W + a]) nearS = true; if (keepT(a, c)) nearK = true; }
      if (nearS && !nearK) drop.push([u, v]); }
    for (const [u, v] of drop) R[v][u] = ' '; }
  RSW_STATS.fixed++; const dt = performance.now() - t0; if (dt > (RSW_STATS.max || 0)) { RSW_STATS.max = dt; RSW_STATS.maxId = F.b && F.b.id; } RSW_STATS.cut += cut; RSW_STATS.sealed += sealed; RSW_STATS.ms += performance.now() - t0;
  F.swept = { cut, sealed };
}

// ---------- the stand-in shops: cross aisles through long shelf runs, and the drugstore counter at the back ----------
function roomSweepShop(F) {
  if (!F.box || !['shop', 'pharmacy', 'florist'].includes(F.kind)) return;
  const { R, W } = F, { fx0, fx1, fy0, fy1 } = F.box, w = fx1 - fx0 + 1, d = fy1 - fy0 + 1, xs = F.ud;
  const shelf = F.kind === 'florist' ? 'v' : 'G';
  // the runs down the first shelf column, then a cross aisle at least every 8 tiles, the same rows all the way across
  let col = -1; for (let u = fx0 + 2; u <= fx1 - 2 && col < 0; u++) for (let v = fy0; v <= fy1; v++) if (R[v][u] === shelf) { col = u; break; }
  if (col >= 0) { const runs = []; let a = -1;
    for (let v = fy0; v <= fy1 + 1; v++) { const on = R[v] && R[v][col] === shelf; if (on && a < 0) a = v; if (!on && a >= 0) { runs.push([a, v - 1]); a = -1; } }
    for (const [s, e] of runs) { const L = e - s + 1; if (L <= 9) continue; const nb = Math.ceil(L / 9) - 1;
      for (let k = 1; k <= nb; k++) { const v = s + Math.round(k * L / (nb + 1)); for (let u = fx0 + 1; u <= fx1 - 1; u++) if (R[v][u] === shelf) R[v][u] = '.'; } } }
  // the drugstore: rooms.js runs a counter along the whole back, in front of the back shelves, with nobody behind it.
  // Make it a counter on the far side with the pharmacist behind it, and leave the rest of that row as the back aisle.
  if (F.kind === 'pharmacy' && d >= 12 && w >= 10) { const cv = fy0 + 1;
    let n = 0; for (let u = fx0 + 2; u <= fx1 - 2; u++) if (R[cv][u] === 'c') { R[cv][u] = '.'; n++; }
    if (n >= 6) { const far = xs > (fx0 + fx1) / 2 ? -1 : 1, len = Math.max(5, Math.min(10, Math.round(w / 3)));
      const a = far < 0 ? fx0 + 1 : fx1 - len, b = a + len - 1, inner = far < 0 ? b : a;
      for (let u = a; u <= b; u++) { if (R[cv][u] === '.' || R[cv][u] === 'K') R[cv][u] = 'x'; if (R[cv + 1][u] !== 'W') R[cv + 1][u] = u === inner ? 'k' : 'c'; }
      if (R[fy0][xs] === '.') R[fy0][xs] = xs >= a && xs <= b ? 'x' : 'K';   // the door aisle's tile in the back shelf row
      const clerk = (F.npcs || []).find(q => q.folk === 'clerk');
      F.npcs.push({ x: (a + b) >> 1, y: cv, folk: 'clerk', name: 'Pharmacist', talk: clerk && clerk.talk }); } }
}
{ const _rl = roomLayout; roomLayout = function (F) { _rl(F); if (window.RSW_OFF) return; try { roomSweepShop(F); } catch (e) { console.warn('roomSweepShop', e); } }; }

// roomFloor (rooms.js) lays the room out, then checks it can be walked into (roomCheck) before keeping it: sweep just before
// that check, so a room whose layout boxed in its own door is opened up instead of turned away as locked
{ const _rc = roomCheck; roomCheck = function (F) {
    if (!window.RSW_OFF) { const hn = (roomHook(F.b).npcs || []).filter(n => !(F.npcs || []).includes(n)), keep = F.npcs;
      if (hn.length) F.npcs = (keep || []).concat(hn);
      try { roomSweep(F); } catch (e) { console.warn('roomSweep', F.b && F.b.id, e); }
      if (hn.length) F.npcs = keep; }
    return _rc(F); }; }
// an opened doorway: the floor, with a threshold and the door standing open against the jamb
{ const _ft = roomFloorTile; roomFloorTile = function (Fm, t, x, y) {
    if (t !== 'Do') return _ft(Fm, t, x, y);
    _ft(Fm, '.', x, y); const X = x * 24, Y = y * 24, side = roomT(Fm, x - 1, y) === 'W' || roomT(Fm, x + 1, y) === 'W';
    if (side) { qp('#8a6a48', X, Y + 10, 24, 4); qp('#6a4e34', X, Y + 13, 24, 1); } else { qp('#8a6a48', X + 10, Y, 4, 24); qp('#6a4e34', X + 13, Y, 1, 24); } }; }
{ const _lk = roomLook; roomLook = function (Fm, x, y, t) { if (t === 'Do' && !roomNpcAt(Fm, x, y)) return say([['', 'An open doorway.']]); return _lk(Fm, x, y, t); }; }
