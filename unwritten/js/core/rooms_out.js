"use strict";
// =====================================================================
//  APARTMENT BUILDINGS, GARAGES, SHEDS AND BARNS, INSIDE (Nov 21, Christian: "open schools, churches and legion memorial,
//  apartment buildings, garages sheds and barns"). Every apartment building (the housing authority's too, treated exactly
//  like the rest), garage, shed and barn in town opens through the room system (rooms.js): the inside is the building's
//  own traced outline at 1 m a tile, door at the bottom, with a plan fitted to whatever size that outline is.
//  PRIVATE PLACES STAY PRIVATE: every inside here is invented and generic, made up from the building's id so it always
//  looks the same; no addresses, no owners' or residents' names, nothing that claims to be the real inside of a real
//  place. Titles only say AN APARTMENT BUILDING, AN APARTMENT, A GARAGE, A SHED, A BARN. Apartment units reuse the
//  homes' furniture ('h_' props, rooms_homes.js). Nothing is built until its door is used; outlines too small to stand
//  in stay locked. Tile tokens added here all start with 'o_'.
// =====================================================================
const OUT_KIND = { apartments: 'o_apt', garage: 'o_gar', shed: 'o_shed', barn: 'o_barn' };
const OUT_TITLE = { o_apt: 'AN APARTMENT BUILDING', o_gar: 'A GARAGE', o_shed: 'A SHED', o_barn: 'A BARN' };
Object.assign(ROOM_STYLE, {
  o_apt: [['carpet', '#6a5a4a', '#5e5042'], ['#e8e2d4', '#7a5a3a']], o_gar: [['concrete', '#8e8e8a', '#82827e'], ['#d4c8a8', '#6a6a66']],
  o_shed: [['wood', '#8a6a48', '#7a5c3c'], ['#9a7a52', '#5a3e24']], o_barn: [['concrete', '#8a7050', '#7a6244'], ['#7a5434', '#4a3220']],
});
Object.assign(KIND_ZONE, { o_apt: 'HALL', o_gar: 'INSIDE', o_shed: 'INSIDE', o_barn: 'INSIDE' });
ROOM_WALK.add('o_gate');
const OUT_C = new Map();
const _outRe = roomEligible;
function outOwn(b) {
  if (!b || !OUT_KIND[b.type]) return false;
  let v = OUT_C.get(b.id); if (v !== undefined) return v;
  OUT_C.set(b.id, false);
  v = !!(b.poly && b.poly.length >= 3) && !b.landmark && !roomSkip(b) && !(b.name && ROOM_HOOK[b.name]) && !(b.addr && ROOM_HOOK[b.addr]) && !_outRe(b);
  OUT_C.set(b.id, v); return v;
}
roomEligible = function (b) { return _outRe(b) || outOwn(b); };
{ const _rh = roomHook; roomHook = function (b) { return outOwn(b) ? outHook(b) : _rh(b); }; }
// an outline under about 2.5 m on a side is too small to stand in: its door stays locked
{ const _rf = roomFloor; roomFloor = function (b) { if (outOwn(b) && !FIG_FLOORS['room' + b.id]) { const [w, h] = bzDims(b); if (Math.min(w, h) < 2.5) return null; } return _rf(b); }; }
ROOM_DOOR = null;   // the door table is rebuilt with these doors, while the page is idle
if (typeof requestIdleCallback === 'function') requestIdleCallback(() => { if (!ROOM_DOOR) roomDoors(); }, { timeout: 5000 });
const OUT_IN = {
  o_apt: ['An apartment building. Somebody\'s cooking onions down the hall.', 'An apartment building. A radio plays quietly behind one of the doors.', 'An apartment building. Boots on mats outside a few of the doors.', 'An apartment building. The hallway smells like floor wax.'],
  o_gar: ['A garage. It smells like oil and cut grass.', 'A garage. Cold concrete, and the tick of a cooling engine.', 'A garage. Everything a household doesn\'t keep in the house.'],
  o_shed: ['A shed. It smells like gasoline and dry dirt.', 'A shed. Dust hangs in the light from the door.', 'A shed. Cobwebs in the corners, tools on the walls.'],
  o_barn: ['A barn. Hay dust hangs in the light.', 'A barn. It smells like hay and animals.', 'A barn. Something shifts and snorts in the stalls.'],
};
const OUT_HOOKS = new Map();
function outHook(b) {
  let h = OUT_HOOKS.get(b.id); if (h) return h;
  const k = OUT_KIND[b.type], named = k !== 'o_apt' && b.name && b.type !== 'garage' && b.type !== 'shed';
  h = { kind: k, title: named ? b.name.toUpperCase() : OUT_TITLE[k], line: OUT_IN[k][hash(b.id, 31) % OUT_IN[k].length],
    layout: (F, c) => (k === 'o_apt' ? aptLayout : outLayout)(F, c), zone: (F, x, y) => outZone(F, x, y), look: (F, x, y, t, n) => outLook(F, x, y, t, n) };
  OUT_HOOKS.set(b.id, h); return h;
}
for (const b of BLD) if (b.name && OUT_KIND[b.type] && b.type === 'barn' && outOwn(b)) b.enter = b.enter || 1;

// ---------- placing things so every open floor tile stays reachable ----------
function outPlacer(Fm, M) {
  const R = Fm.R, W = Fm.W, H = Fm.H, Z = Fm.hh ? Fm.hh.Z : null;
  const isF = (u, v) => v >= 0 && v < H && u >= 0 && u < W && R[v][u] === '.';
  const flood = A => {
    const x0 = A.x0, y0 = A.y0, x1 = A.x1, y1 = A.y1, rw = x1 - x0 + 1, seen = new Uint8Array(rw * (y1 - y0 + 1)), st = [];
    const ok = (u, v) => u >= x0 && u <= x1 && v >= y0 && v <= y1 && ROOM_WALK.has(R[v][u]);
    if (!ok(A.sx, A.sy)) return 0; let n = 0; seen[(A.sy - y0) * rw + A.sx - x0] = 1; st.push(A.sx, A.sy);
    while (st.length) { const v = st.pop(), u = st.pop(); n++;
      for (let k = 0; k < 4; k++) { const a = u + (k === 0 ? 1 : k === 1 ? -1 : 0), e = v + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (!ok(a, e)) continue; const i = (e - y0) * rw + a - x0; if (seen[i]) continue; seen[i] = 1; st.push(a, e); } }
    return n; };
  const put = (r, u, v, tok, meta, pw = 1, ph = 1) => {
    const A = r.A, cells = [];
    for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) { const a = u + i, e = v + j;
      if (a < r.x0 || a > r.x1 || e < r.y0 || e > r.y1 || !isF(a, e) || A.keep.has(e * W + a)) return false;
      if (Z && r.i != null && Z[e * W + a] !== r.i) return false; cells.push(a, e); }
    if (A.n == null) A.n = flood(A);
    for (let k = 0; k < cells.length; k += 2) R[cells[k + 1]][cells[k]] = tok;
    const n = flood(A);
    if (n !== A.n - cells.length / 2 || n < (A.min || 0)) { for (let k = 0; k < cells.length; k += 2) R[cells[k + 1]][cells[k]] = '.'; return false; }
    A.n = n; const m = Object.assign({ t: tok, ax: u, ay: v, w: pw, h: ph, r: r.i }, meta || {});
    for (let k = 0; k < cells.length; k += 2) M.set(cells[k] + ',' + cells[k + 1], m); return true; };
  const wallAbove = (u, v) => !!R[v - 1] && (R[v - 1][u] === 'W' || R[v - 1][u] === 'O');
  const inZ = (r, u, v) => !Z || r.i == null || (v >= 0 && v < H && u >= 0 && u < W && Z[v * W + u] === r.i);
  const top = r => { const a = []; for (let u = r.x0; u <= r.x1; u++) for (let v = r.y0; v <= r.y1; v++) if (isF(u, v) && inZ(r, u, v)) { if (wallAbove(u, v)) a.push([u, v]); break; } return a; };
  const side = (r, u) => { const a = []; for (let v = r.y0 + 1; v <= r.y1; v++) a.push([u, v]); return a; };
  const tryAt = (r, list, tok, meta, pw, ph) => { for (const [u, v] of list) if (put(r, u, v, tok, meta, pw, ph)) return [u, v]; return null; };
  // floor cells along the walls, the back wall first
  const along = r => { const a = top(r), s = new Set(a.map(p => p[0] + ',' + p[1]));
    for (let v = r.y0; v <= r.y1; v++) for (let u = r.x0; u <= r.x1; u++) { if (!isF(u, v) || !inZ(r, u, v) || s.has(u + ',' + v)) continue;
      if (!isF(u - 1, v) && R[v][u - 1] !== undefined && 'WO '.includes(R[v][u - 1]) || !isF(u + 1, v) && 'WO '.includes(R[v][u + 1] || ' ')) a.push([u, v]); }
    return a; };
  return { isF, flood, put, top, side, tryAt, along, wallAbove };
}

// =====================================================================
//  APARTMENT BUILDINGS: a lobby inside the door, a hallway, units off it, a laundry room
// =====================================================================
const APT_HELLO = ['Oh — hi. Are you looking for somebody? I think you\'ve got the wrong door.', 'Hi. The laundry room\'s down the hall, if that\'s what you\'re after.',
  'Oh! I thought you were the pizza.', 'Hey. Mind the boxes. Still unpacking.', 'Hello. It\'s quiet here, mostly. I like it that way.', 'Oh, hi. The heat\'s finally working again, so that\'s nice.'];
const APT_ROOM = { living: 'LIVING ROOM', kitchen: 'KITCHEN', bed: 'BEDROOM', bath: 'BATHROOM', hall: 'HALL', lobby: 'LOBBY', laundry: 'LAUNDRY ROOM' };
function aptLayout(Fm, c) {
  const b = Fm.b, R = Fm.R, W = Fm.W, H = Fm.H, rnd = srng((b.id * 7919 + 4243) >>> 0), ri = n => Math.floor(rnd() * n), pick = a => a[ri(a.length)];
  const { fx0, fx1, fy0, fy1 } = c, xs = Fm.ex, w = fx1 - fx0 + 1, d = fy1 - fy0 + 1;
  const S0 = homeStyle({ type: 'house', area: 0 }, srng(b.id * 13 + 7)), wc = pick(['#e6e0d0', '#dcdcd4', '#e4dcc8', '#d8dcd8']);
  Object.assign(S0, { living: pick([['carpet', '#6a5a4a', '#5e5042'], ['carpet', '#4a5a6a', '#425262'], ['carpet', '#7a4a4a', '#6e4242'], ['carpet', '#5a6a5a', '#506050']]),
    bed: ['tile', '#d8d4cc', '#c4c0b8'], kitchen: ['tile', '#e4e4e0', '#ccccc8'], walls: [wc, wc, wc], trim: '#6a5a4a', cap: '#c8c0b0', panel: false });
  const hh = Fm.hh = { S: S0, rooms: [], Z: new Int16Array(W * H).fill(-1), M: new Map(), rugs: [], tvOn: rnd() < 0.35, last: 'LOBBY', lastU: -1 };
  const A0 = Fm.oa = { S0, US: [], dec: new Map() };
  const isF = (u, v) => v >= 0 && v < H && u >= 0 && u < W && R[v][u] === '.';
  const PW = [], gaps = [];
  const room = (type, x0, y0, x1, y1, unit, A) => { const i = hh.rooms.length, r = { type, x0, y0, x1, y1, i, unit, A }; hh.rooms.push(r);
    for (let v = y0; v <= y1; v++) for (let u = x0; u <= x1; u++) if (isF(u, v) && hh.Z[v * W + u] < 0) hh.Z[v * W + u] = i; return r; };
  const wall = (u, v) => { if (isF(u, v)) { R[v][u] = 'W'; PW.push([u, v]); } };
  const wallH = (v, u0, u1) => { for (let u = u0; u <= u1; u++) wall(u, v); };
  const wallV = (u, v0, v1) => { for (let v = v0; v <= v1; v++) wall(u, v); };
  const open = (u, v) => { if (R[v] && R[v][u] === 'W') { R[v][u] = '.'; gaps.push([u, v]); } };
  const split = (L, t) => { let k = Math.max(1, Math.round((L + 1) / (t + 1))); while (k > 1 && (L - (k - 1)) / k < 4) k--; const a = L - (k - 1), s = []; for (let i = 0; i < k; i++) s.push(Math.floor(a / k) + (i < a % k ? 1 : 0)); return s; };
  // ---------- the hallway and the strips of units along it ----------
  const strips = []; let cor;
  const vert = d >= w * 0.9 || d < 8;
  if (vert) {
    const cw = d < 8 ? 3 : w >= 16 ? 2 : 1; let cxa = Math.max(fx0, xs - ((cw - 1) >> 1)), cxb = Math.min(fx1, cxa + cw - 1);
    if (cxa - 1 - fx0 < 4) cxa = fx0; if (fx1 - cxb - 1 < 4) cxb = fx1;
    cor = [cxa, fy0, cxb, fy1];
    if (cxa > fx0) { wallV(cxa - 1, fy0, fy1); strips.push({ x0: fx0, y0: fy0, x1: cxa - 2, y1: fy1, s: 'E' }); }
    if (cxb < fx1) { wallV(cxb + 1, fy0, fy1); strips.push({ x0: cxb + 2, y0: fy0, x1: fx1, y1: fy1, s: 'W' }); }
  } else if (d >= 14) {
    const cw = d >= 18 ? 2 : 1, T = (d - cw - 2) >> 1, cya = fy0 + T + 1, cyb = cya + cw - 1;
    cor = [fx0, cya, fx1, cyb]; wallH(cya - 1, fx0, fx1); wallH(cyb + 1, fx0, fx1);
    strips.push({ x0: fx0, y0: fy0, x1: fx1, y1: cya - 2, s: 'S' }, { x0: fx0, y0: cyb + 2, x1: fx1, y1: fy1, s: 'N', lob: 1 });
  } else {
    const cw = d >= 11 ? 2 : 1, cya = fy1 - cw + 1;
    cor = [fx0, cya, fx1, fy1]; wallH(cya - 1, fx0, fx1); strips.push({ x0: fx0, y0: fy0, x1: fx1, y1: cya - 2, s: 'S', lob: 1 });
  }
  // the slots: each strip cut across into units; a lobby by the door where there's no room for one in the hallway
  const slots = [], halls = [cor];
  const mkRect = (st, a0, a1) => st.s === 'N' || st.s === 'S' ? [a0, st.y0, a1, st.y1] : [st.x0, a0, st.x1, a1];
  const addSlot = (st, a0, a1, o) => {   // a slot's real extent: shrink the back and the sides to the floor inside it (an odd outline)
    const rc = mkRect(st, a0, a1); let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let v = rc[1]; v <= rc[3]; v++) for (let u = rc[0]; u <= rc[2]; u++) if (isF(u, v)) { x0 = Math.min(x0, u); x1 = Math.max(x1, u); y0 = Math.min(y0, v); y1 = Math.max(y1, v); }
    if (x1 < 0) return; const f = st.s;
    if (f === 'S') rc.splice(0, 3, x0, y0, x1); else if (f === 'N') rc.splice(0, 4, x0, rc[1], x1, y1); else if (f === 'E') rc.splice(0, 4, x0, y0, rc[2], y1); else rc.splice(1, 3, y0, x1, y1);
    slots.push(Object.assign({ st, s: f, rc }, o || {})); };
  const slice = st => {
    const along = st.s === 'N' || st.s === 'S', a0 = along ? st.x0 : st.y0, a1 = along ? st.x1 : st.y1, segs = [];
    if (st.lob) { let l0 = Math.max(a0, xs - 2), l1 = Math.min(a1, xs + 2); if (l0 - a0 - 1 < 4) l0 = a0; if (a1 - l1 - 1 < 4) l1 = a1;
      if (l0 > a0) segs.push([a0, l0 - 2]); if (l1 < a1) segs.push([l1 + 2, a1]);
      addSlot(st, l0, l1, { lobby: 1 });
      if (l0 > a0) along ? wallV(l0 - 1, st.y0, st.y1) : wallH(l0 - 1, st.x0, st.x1); if (l1 < a1) along ? wallV(l1 + 1, st.y0, st.y1) : wallH(l1 + 1, st.x0, st.x1); }
    else segs.push([a0, a1]);
    for (const [s0, s1] of segs) { let p = s0; split(s1 - s0 + 1, along ? 7 : 6).forEach((n, j) => { if (j) along ? wallV(p - 1, st.y0, st.y1) : wallH(p - 1, st.x0, st.x1); addSlot(st, p, p + n - 1); p += n + 1; }); }
  };
  strips.forEach(slice);
  const rectOf = sl => sl.rc;
  const L2 = (sl, a, e) => { const [x0, y0, x1, y1] = sl.rc, s = sl.s; return s === 'S' ? [x0 + a, y0 + e] : s === 'N' ? [x1 - a, y1 - e] : s === 'E' ? [x0 + e, y0 + a] : [x1 - e, y0 + a]; };
  const dims = sl => { const [x0, y0, x1, y1] = sl.rc, ns = sl.s === 'N' || sl.s === 'S'; return ns ? [x1 - x0 + 1, y1 - y0 + 1] : [y1 - y0 + 1, x1 - x0 + 1]; };
  const lr = (sl, a0, e0, a1, e1) => { const [p, q] = [L2(sl, a0, e0), L2(sl, a1, e1)]; return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  // a deep wing: a hallway of its own down the middle (or along one side), opening off the main one, with units off it
  for (let i = 0; i < slots.length; i++) { const sl = slots[i]; if (sl.lobby) continue; const [B, D] = dims(sl); if (D < 14 || B < 5) continue;
    sl.wing = 1; const ac = B >= 9 ? B >> 1 : 0, wr = lr(sl, ac, 0, ac, D - 1); halls.push(wr);
    { const [u, v] = L2(sl, ac, D); open(u, v); }
    for (const [b0, b1, wa] of [[0, ac - 2, ac - 1], [ac + 2, B - 1, ac + 1]]) { if (b1 - b0 + 1 < 3) continue;
      for (let e = 0; e < D; e++) { const [u, v] = L2(sl, wa, e); wall(u, v); }
      const [x0, y0, x1, y1] = lr(sl, b0, 0, b1, D - 1), sd = x1 < wr[0] ? 'E' : x0 > wr[2] ? 'W' : y1 < wr[1] ? 'S' : 'N';
      slice({ x0, y0, x1, y1, s: sd }); } }
  let units = slots.filter(s => !s.lobby && !s.wing);
  if (!slots.some(s => s.lobby) && units.length >= 4) {   // a lobby: the slot at the front nearest the door
    const lb = units.slice().sort((p, q) => { const a = rectOf(p), e = rectOf(q); return (e[3] - a[3]) || Math.abs((a[0] + a[2]) / 2 - xs) - Math.abs((e[0] + e[2]) / 2 - xs); })[0]; lb.lobby = 1; }
  units = slots.filter(s => !s.lobby && !s.wing);
  if (units.length >= 4) units.slice().sort((p, q) => { const a = rectOf(p), e = rectOf(q); return (a[2] - a[0] + 1) * (a[3] - a[1] + 1) - (e[2] - e[0] + 1) * (e[3] - e[1] + 1); })[0].laundry = 1;
  const corR = room('hall', cor[0], cor[1], cor[2], cor[3], -1, null);
  for (const hr of halls.slice(1)) room('hall', hr[0], hr[1], hr[2], hr[3], -1, null);
  const lwall = (sl, a, e) => { const [u, v] = L2(sl, a, e); wall(u, v); };
  const areas = [];
  let un = 0;
  for (const sl of slots) { if (sl.wing) continue;
    const [B, D] = dims(sl), [x0, y0, x1, y1] = rectOf(sl);
    const A = { x0, y0, x1, y1, keep: new Set(), min: 3 };
    if (sl.lobby) {   // open to the hallway along its whole front
      for (let a = 0; a < B; a++) { const [u, v] = L2(sl, a, D); open(u, v); }
      const r = room('lobby', x0, y0, x1, y1, -1, A); const [sx, sy] = L2(sl, B >> 1, D - 1); Object.assign(A, { sx, sy }); for (let a = 0; a < B; a++) { const [u, v] = L2(sl, a, D - 1); A.keep.add(v * W + u); }
      sl.r = [r]; areas.push(A); continue; }
    const ad = sl.laundry ? B >> 1 : Math.max(1, Math.min(B - 2, (B >> 1) + (rnd() < 0.5 ? -1 : 1)));
    const [du, dv] = L2(sl, ad, D); open(du, dv); const [sx, sy] = L2(sl, ad, D - 1); Object.assign(A, { sx, sy, door: [du, dv] }); A.keep.add(sy * W + sx);
    { const [kx, ky] = L2(sl, ad, D - 2); A.keep.add(ky * W + kx); }
    areas.push(A);
    if (sl.laundry) { const r = room('laundry', x0, y0, x1, y1, -1, A); sl.r = [r]; continue; }
    const u = un++, S = homeStyle({ type: 'house', area: 0 }, srng((b.id * 101 + u * 7 + 1) >>> 0)); A0.US.push(S);
    const rs = sl.r = [];
    if (D < 7 || B < 6) {   // a studio: one room, a kitchenette, a bed, and a bathroom in the back corner if it fits
      if (B >= 5 && D >= 4) { const bl = ad >= B >> 1 ? 0 : B - 2, wa = bl === 0 ? 2 : B - 3, dr = bl === 0 ? 0 : B - 1;
        for (let e = 0; e <= 2; e++) lwall(sl, wa, e); for (let a = bl; a <= bl + 1; a++) if (a !== dr) lwall(sl, a, 2);
        for (const e of [2, 3]) { const [p, q] = L2(sl, dr, e); A.keep.add(q * W + p); }
        rs.push(room('bath', ...lr(sl, bl, 0, bl + 1, 1), u, A)); }
      const l = room('living', x0, y0, x1, y1, u, A); l.kitchenette = 1; l.studio = 1; rs.push(l);
    } else {
      const bd = Math.max(3, Math.min(D - 4, Math.round(D * 0.45))), bw = B >= 10 ? 3 : 2, bl = rnd() < 0.5 ? 0 : B - bw;
      for (let a = 0; a < B; a++) lwall(sl, a, bd);
      for (let e = 0; e < bd; e++) lwall(sl, bl === 0 ? bw : B - bw - 1, e);
      const bm = bl + (bw >> 1), em = bl === 0 ? bw + 1 + ((B - bw - 1) >> 1) : (B - bw - 1) >> 1;
      for (const a of [bm, em]) { const [p, q] = L2(sl, a, bd); open(p, q); A.keep.add(q * W + p); const [p2, q2] = L2(sl, a, bd + 1); A.keep.add(q2 * W + p2); const [p3, q3] = L2(sl, a, bd - 1); A.keep.add(q3 * W + p3); }
      rs.push(room('bath', ...lr(sl, bl, 0, bl + bw - 1, bd - 1), u, A));
      rs.push(room('bed', ...lr(sl, bl === 0 ? bw + 1 : 0, 0, bl === 0 ? B - 1 : B - bw - 2, bd - 1), u, A));
      if (B >= 8) { const kb = 3, kl = ad >= B >> 1 ? 0 : B - kb; rs.push(room('kitchen', ...lr(sl, kl, bd + 1, kl + kb - 1, D - 1), u, A)); rs.push(room('living', ...lr(sl, kl === 0 ? kb : 0, bd + 1, kl === 0 ? B - 1 : B - kb - 1, D - 1), u, A)); }
      else { const l = room('living', ...lr(sl, 0, bd + 1, B - 1, D - 1), u, A); l.kitchenette = 1; rs.push(l); }
    }
  }
  for (const A of areas) { A.keep.add(Fm.ey * W + Fm.ex); A.keep.add((Fm.ey - 1) * W + Fm.ex); }
  // every room reachable: where a partition cut a room off (an odd-shaped outline), open a doorway through it
  const WK = new Uint8Array(W * H), seen = new Uint8Array(W * H), stk = new Int32Array(W * H);
  const reach = () => { for (let v = 0; v < H; v++) { const row = R[v]; for (let u = 0; u < W; u++) WK[v * W + u] = ROOM_WALK.has(row[u]) ? 1 : 0; }
    seen.fill(0); let sp = 0; const s0 = Fm.ey * W + Fm.ex; seen[s0] = 1; stk[sp++] = s0;
    while (sp) { const i = stk[--sp], u = i % W;
      if (u > 0 && WK[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; stk[sp++] = i - 1; } if (u < W - 1 && WK[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; stk[sp++] = i + 1; }
      if (i >= W && WK[i - W] && !seen[i - W]) { seen[i - W] = 1; stk[sp++] = i - W; } if (i + W < W * H && WK[i + W] && !seen[i + W]) { seen[i + W] = 1; stk[sp++] = i + W; } } };
  for (let it = 0; it < 40; it++) { reach(); let op = null;
    for (const [u, v] of PW) { if (R[v][u] !== 'W') continue;
      for (const [p, q] of [[[u - 1, v], [u + 1, v]], [[u, v - 1], [u, v + 1]]]) if (isF(p[0], p[1]) && isF(q[0], q[1]) && !!seen[p[1] * W + p[0]] !== !!seen[q[1] * W + q[0]]) { op = [u, v]; break; }
      if (op) break; }
    if (!op) break; open(op[0], op[1]); }
  for (const [u, v] of gaps) if (hh.Z[v * W + u] < 0) for (const [du, dv] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const z = hh.Z[(v + dv) * W + u + du]; if (z >= 0 && isF(u + du, v + dv) && hh.rooms[z].type !== 'hall') { hh.Z[v * W + u] = z; break; } }
  for (const [u, v] of gaps) if (hh.Z[v * W + u] < 0) hh.Z[v * W + u] = corR.i;
  { let run = 0; for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) { if (R[v][u] !== 'O') { run = 0; continue; } if (!isF(u, v - 1) || run % 3 === 2) R[v][u] = 'W'; run++; } }
  // ---------- furniture ----------
  const P = outPlacer(Fm, hh.M);
  for (const sl of slots) for (const r of sl.r || []) aptFurnish(Fm, P, r, r.unit >= 0 ? A0.US[r.unit] : S0, rnd);
  // the hallway: mailboxes and the stairs on the wall at its end when there's no lobby; an extinguisher, a notice board
  const hasLobby = slots.some(s => s.lobby);
  for (let v = 1; v < H; v++) for (let u = 0; u < W; u++) if (R[v - 1][u] === 'W' && hh.Z[v * W + u] >= 0 && hh.rooms[hh.Z[v * W + u]].type === 'hall' && ROOM_WALK.has(R[v][u])) {
    const k = hash(u * 7 + b.id, v * 3) % 7; if (!hasLobby && !A0.mail) { A0.dec.set(u + ',' + (v - 1), 'mail'); A0.mail = 1; } else if (k === 0) A0.dec.set(u + ',' + (v - 1), 'ext'); else if (k === 1) A0.dec.set(u + ',' + (v - 1), 'board'); }
  // somebody's home in a few of the units: generic residents, nobody real
  for (const sl of slots) { const l = (sl.r || []).find(r => r.type === 'living'); if (!l || rnd() > 0.3) continue;
    const list = []; for (let v = l.y0; v <= l.y1; v++) for (let u = l.x0; u <= l.x1; u++) list.push([u, v]); list.sort(() => rnd() - 0.5);
    const at = P.tryAt(l, list, 'N', {}); if (at) { const line = pick(APT_HELLO); Fm.npcs.push({ x: at[0], y: at[1], folk: 'h_res' + ri(4), talk: () => say([['', line]]) }); } }
}
function aptFurnish(Fm, P, r, S, rnd) {
  const ri = n => Math.floor(rnd() * n), pick = a => a[ri(a.length)], rw = r.x1 - r.x0 + 1, rd = r.y1 - r.y0 + 1, put = (u, v, t, m, w, h) => P.put(r, u, v, t, m, w, h);
  const top = P.top(r), mid = (r.x0 + r.x1) / 2, byMid = top.slice().sort((p, q) => Math.abs(p[0] - mid) - Math.abs(q[0] - mid));
  const sides = P.side(r, r.x0).concat(P.side(r, r.x1)), corners = [[r.x0, r.y0], [r.x1, r.y0], [r.x0, r.y1], [r.x1, r.y1]], blanket = () => pick(S.blankets);
  const at = (list, t, m, w, h) => P.tryAt(r, list, t, m, w, h);
  const kitchenRun = list => { const seq = ['h_fridge', 'h_stove', 'h_sink', 'h_ctr', 'h_ctr']; let i = 0; for (const [u, v] of list) { if (i >= seq.length) break; if (put(u, v, seq[i], { c: seq[i] === 'h_fridge' || seq[i] === 'h_stove' ? S.appl : S.cab, k: (u * 3 + v) % 6 })) i++; } };
  switch (r.type) {
    case 'living': {
      if (r.kitchenette) kitchenRun((rnd() < 0.5 ? top : top.slice().reverse()).concat(P.side(r, r.x1), P.side(r, r.x0)));
      if (r.studio) { const bt = at(top.slice().reverse().concat(sides), 'h_bed', { c: blanket() }, 1, 2); if (bt) at([[bt[0] - 1, bt[1]], [bt[0] + 1, bt[1]]], 'h_ns', { c: S.wood }); }
      const tv = at(byMid, 'h_tv', { v: S.tv });
      if (tv && rd >= 3) { const cy = Math.min(r.y1, tv[1] + (rd >= 5 ? 2 : 1)); let L = rw >= 6 ? 3 : rw >= 4 ? 2 : 1, cx = null;
        for (const L2 of [L, L - 1, 1]) { if (L2 < 1) continue; for (const off of [0, -1, 1, -2, 2]) { const u = tv[0] - ((L2 - 1) >> 1) + off; if (put(u, cy, L2 > 1 ? 'h_sofa' : 'h_arm', { c: S.sofa, pat: S.pat }, L2, 1)) { cx = u; L = L2; break; } } if (cx != null) break; }
        if (cx != null) { if (cy - 1 > tv[1]) put(cx + ((L - 1) >> 1), cy - 1, 'h_ctab', { v: ri(3) });
          Fm.hh.rugs.push(Object.assign({ x0: Math.max(r.x0, cx - 1), y0: cy - 1 > tv[1] ? cy - 1 : cy, x1: Math.min(r.x1, cx + L), y1: cy }, S.rug));
          at([[cx + L, cy], [cx - 1, cy]], 'h_lamp', { c: pick(['#e8d8a8', '#f0e8d0', '#d8c8a0']) }); } }
      at(top.filter(([u]) => !tv || Math.abs(u - tv[0]) >= 2), 'h_bks', {});
      at(corners, 'h_plant', {});
      if (rw * rd >= 30) at(sides, 'h_arm', { c: shade(S.sofa, 0.12), pat: 'plain' });
      break; }
    case 'kitchen': {
      kitchenRun((rnd() < 0.5 ? top : top.slice().reverse()).concat(P.side(r, r.x0), P.side(r, r.x1)));
      if (rd >= 3) { const ty = Math.min(r.y1 - 1, r.y0 + 2); for (const [u] of byMid.length ? byMid : [[Math.round(mid), 0]]) if (put(u, ty, 'h_dtab', { c: S.wood })) { put(u, ty + 1, 'h_chair', { c: S.wood, o: 'u' }) || put(u - 1, ty, 'h_chair', { c: S.wood, o: 'r' }); put(u + 1, ty, 'h_chair', { c: S.wood, o: 'l' }); break; } }
      break; }
    case 'bed': {
      const dbl = rw >= 4; let bed = null;
      for (const [u, v] of byMid) { const uu = u - (dbl ? 1 : 0); if (put(uu, v, 'h_bed', { c: blanket(), q: rnd() < 0.4 }, dbl ? 2 : 1, 2)) { bed = uu; at([[uu - 1, v], [uu + (dbl ? 2 : 1), v]], 'h_ns', { c: S.wood }); break; } }
      if (bed == null) at(sides, 'h_bed', { c: blanket() }, 1, 2);
      at(top.filter(([u]) => P.isF(u + 1, r.y0)), 'h_drs', { c: S.wood }, 2, 1) || at(top.concat(sides), 'h_drs', { c: S.wood });
      at(top.concat(sides), 'h_clo', { c: S.st === 'modern' ? '#f4f4f2' : '#f0ece0' });
      if (rw * rd >= 16) at(sides, rnd() < 0.5 ? 'h_desk' : 'h_lamp', { c: rnd() < 0.5 ? S.wood : '#f0e8d0' });
      break; }
    case 'bath': {
      (rw >= 2 && at(top.filter(([u]) => P.isF(u + 1, r.y0)), 'h_tub', { c: pick(['#e8eef4', '#f0e0e8', '#e0ecd8', '#f4f0d8']) }, 2, 1)) || at(top.concat(corners), 'h_shw', {});
      at(top.concat(sides, corners), 'h_toil', {}); at(sides.concat(top, corners), 'h_bsink', { c: S.st === 'modern' ? '#f4f4f2' : S.cab });
      break; }
    case 'laundry': {
      const list = top.concat(P.along(r)); let n = 0; for (let i = 0; i < 4; i++) if (at(list, i % 2 ? 'h_dry' : 'h_wash', {})) n++;
      at(P.along(r), 'o_fold', {}, 2, 1) || at(P.along(r), 'o_fold', {}); at(corners, 'h_wh', {}); at(P.along(r), 'o_cans', {});
      break; }
    case 'lobby': {
      at(top.filter(([u]) => P.isF(u + 1, r.y0)), 'o_mbox', {}, 2, 1) || at(P.along(r), 'o_mbox', {});
      at(top.slice().reverse().concat(P.along(r)), 'h_stair', { up: 1 }, 1, 2);
      at(corners, 'h_plant', {}); if (rw * rd >= 16) at(P.along(r), 'o_bench2', {});
      break; }
  }
}

// =====================================================================
//  GARAGES, SHEDS, BARNS
// =====================================================================
const OUT_CARS = ['#a83232', '#2a4a7a', '#d8d8d4', '#2a2a2e', '#8a8e96', '#3a6a4a', '#c8b898', '#5a2a3a', '#e8e4dc', '#4a6a8a', '#7a5a3a'];
const OUT_TRACT = ['#3a7a3a', '#b8322a', '#d87a2a', '#2a5a9a'];
function outLayout(Fm, c) {
  const b = Fm.b, R = Fm.R, W = Fm.W, H = Fm.H, k = Fm.kind, rnd = srng((b.id * 6151 + 977) >>> 0), ri = n => Math.floor(rnd() * n), pick = a => a[ri(a.length)];
  const { fx0, fx1, fy0, fy1 } = c, xs = Fm.ex, w = fx1 - fx0 + 1, d = fy1 - fy0 + 1;
  const ob = Fm.ob = { M: new Map(), dec: new Map(), fs: new Uint8Array(W * H), ohd: new Set(), zn: [], fl: rnd() < 0.5 ? 'dirt' : 'conc' };
  const A = { x0: 0, y0: 0, x1: W - 1, y1: H - 1, sx: Fm.ex, sy: Fm.ey, keep: new Set([Fm.ey * W + Fm.ex]), min: 6 };
  const P = outPlacer(Fm, ob.M), all = { x0: fx0, y0: fy0, x1: fx1, y1: fy1, A };
  const at = (list, t, m, pw, ph, r) => P.tryAt(r || all, list, t, m, pw, ph);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = ri(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let benchAt = null;
  if (k === 'o_gar') {
    // the cars, nose to the overhead door; one stall's worth of walking room beside each
    if (d >= 5 && w >= 3) {   // stalls either side of the walk in from the door, nose to the overhead door
      const starts = []; for (let u = xs - 2; u >= fx0; u -= 3) starts.push(u); for (let u = xs + 1; u + 1 <= fx1; u += 3) starts.push(u);
      const n = starts.length;
      for (const u of starts) { if (n > 1 && rnd() < 0.2) continue; if (n === 1 && rnd() < 0.12) continue;
        if (P.put(all, u, fy1 - 4, 'o_car', { c: pick(OUT_CARS), tr: rnd() < 0.35 }, 2, 5)) for (const uu of [u, u + 1]) if (uu !== Fm.ud && R[Fm.vd] && R[Fm.vd][uu] === 'W') R[Fm.vd][uu] = 'O'; }
    }
    if (R[Fm.vd]) for (let u = 0; u < W; u++) if (R[Fm.vd][u] === 'O') ob.ohd.add(u + ',' + Fm.vd);
    const tp = P.top(all); benchAt = at(tp.filter(([u]) => P.isF(u + 1, fy0)).sort((p, q) => Math.abs(p[0] - xs) - Math.abs(q[0] - xs)), 'o_bench', {}, 2, 1) || at(P.along(all), 'o_bench', {});
    if (benchAt) for (let i = 0; i < 2; i++) ob.dec.set((benchAt[0] + i) + ',' + (benchAt[1] - 1), 'peg');
    const items = shuffle(['o_bins', 'o_bins', 'o_mow', 'o_bike', 'o_snow', 'o_cans', 'o_gas', 'o_bike', 'o_frz', 'o_bins', 'o_tires']);
    for (const t of items) at(P.along(all), t, {}, t === 'o_frz' ? 2 : 1, 1);
    if (rnd() < 0.12) { const s = P.along(all).filter(([u, v]) => P.isF(u, v)); const q = s[ri(s.length || 1)]; if (q && P.put(all, q[0], q[1], 'N', {})) Fm.npcs.push({ x: q[0], y: q[1], folk: 'h_res' + ri(4), talk: () => say([['', pick(['Just looking for the tire pump. It was right here.', 'Hand me that rag? Thanks.', 'Every spring I say I\'m going to clean this place out.'])]]) }); }
  } else if (k === 'o_shed') {
    const items = shuffle(['o_mow', 'o_wb', 'o_soil', 'o_wood', 'o_pots', 'o_gas', 'o_wood', 'o_soil', 'o_bins']);
    if (w * d >= 30) items.unshift('o_rmow');
    for (const t of items) at(P.along(all), t, {}, 1, t === 'o_rmow' ? 2 : 1);
  } else {   // a barn
    const kindB = /horse/i.test(b.name || '') ? 'horse' : /livestock/i.test(b.name || '') ? 'mixed' : pick(['dairy', 'horse', 'mixed', 'mixed', 'hay']);
    const pens = [];
    const pen = (x0, x1, y0, y1) => { pens.push({ x0, x1, y0, y1, A }); for (let v = y0; v <= y1; v++) for (let u = x0; u <= x1; u++) ob.fs[v * W + u] = 1; };
    const set = (u, v, t) => { if (P.isF(u, v) && !A.keep.has(v * W + u)) R[v][u] = t; };
    let ax0 = fx0, ax1 = fx1;
    if (w >= 8 && d >= 7) {
      const aw = w >= 13 ? 3 : 2; ax0 = Math.max(fx0, xs - (aw >> 1)); ax1 = Math.min(fx1, ax0 + aw - 1);
      if (ax0 - fx0 < 3) ax0 = fx0; if (fx1 - ax1 < 3) ax1 = fx1;
      const L = ax0 - fx0, Rr = fx1 - ax1, front = d >= 14 && Math.max(L, Rr) >= 4 ? 6 : 2, end = fy1 - front, ph = d >= 20 ? 3 : 2;
      A.keep.add((Fm.ey - 1) * W + Fm.ex);
      for (const [px0, px1, rx, on] of [[fx0, ax0 - 2, ax0 - 1, L], [ax1 + 2, fx1, ax1 + 1, Rr]]) { if (!on) continue;
        for (let v = fy0; v + 1 <= end; v += ph + 2) { const v1 = Math.min(end, v + ph);
          for (let y = v; y <= v1; y++) set(rx, y, y === ((v + v1) >> 1) ? 'o_gate' : 'o_rail');
          for (let x = Math.min(px0, rx); x <= Math.max(px1, rx); x++) set(x, v1 + 1, 'o_rail');
          pen(px0, px1, v, v1); } }
      ob.zn.push({ x0: ax0, x1: ax1, y0: fy0, y1: fy1, n: 'ALLEY' });
      // the loft ladder and hay at the back of the alley
      at([[ax0, fy0], [ax1, fy0]], 'o_lad', {}); for (let u = ax0; u <= ax1; u++) at([[u, fy0]], 'o_hay', { s: ri(3) });
      if (front > 2) { const big = Rr >= L ? [ax1 + 1, fx1] : [fx0, ax0 - 1], list = [];
        for (let v = fy1 - 4; v >= end + 1; v--) for (let u = big[0]; u <= big[1] - 2; u++) list.push([u, v]);
        if (w * d > 150 && kindB !== 'horse') at(list, 'o_tract', { c: pick(OUT_TRACT) }, 3, 4); ob.zn.push({ x0: fx0, x1: fx1, y0: end + 1, y1: fy1, n: 'DRIVE FLOOR' }); }
    } else {   // a small barn: a pen across the back, a gate in it
      const ph = Math.max(2, Math.floor(d / 2) - 1), rv = fy0 + ph;
      if (d >= 5) { for (let u = fx0; u <= fx1; u++) set(u, rv, u === Math.max(fx0, Math.min(fx1, xs)) ? 'o_gate' : 'o_rail'); pen(fx0, fx1, fy0, rv - 1); }
    }
    // the animals: cows, horses, a few sheep or chickens, or a pen of hay
    for (const p of pens) {
      const pk = kindB === 'mixed' ? pick(['cow', 'sheep', 'chick', 'chick', 'calf', 'hay']) : kindB === 'dairy' ? (rnd() < 0.85 ? 'cow' : 'calf') : kindB === 'horse' ? (rnd() < 0.85 ? 'horse' : 'hay') : (rnd() < 0.7 ? 'hay' : 'cow');
      const cells = []; for (let v = p.y0; v <= p.y1; v++) for (let u = p.x0; u <= p.x1; u++) cells.push([u, v]); shuffle(cells);
      const tp = P.top(p);
      if (pk === 'hay') { for (const [u, v] of cells.slice(0, Math.min(cells.length - 2, 6))) P.put(p, u, v, 'o_hay', { s: ri(3) }); continue; }
      if (pk === 'chick') { for (let i = 0; i < 3 + ri(3); i++) P.tryAt(p, cells, 'o_chick', { c: pick(['#f4f0e4', '#c8783a', '#8a4a2a', '#2a2a2e']), f: ri(2) }); P.tryAt(p, tp, 'o_nest', {}); continue; }
      if (pk === 'sheep') { for (let i = 0; i < 2 + ri(2); i++) P.tryAt(p, cells, 'o_sheep', { f: ri(2) }); }
      else P.tryAt(p, cells, pk === 'horse' ? 'o_horse' : 'o_cow', { f: ri(2), c: pk === 'horse' ? pick(['#7a4a2a', '#4a2e1a', '#a86a3a', '#2a2224', '#c8b898']) : pick(['#f4f2ea', '#f4f2ea', '#8a5a32', '#5a3a22']), calf: pk === 'calf' }, pk === 'calf' ? 1 : 2, 1);
      P.tryAt(p, tp.concat(cells), pk === 'horse' ? 'o_hay' : 'o_trough', { s: 0 });
    }
    // and around the barn: feed bins, the tack stand, a wheelbarrow, milk cans, more hay
    const items = shuffle(['o_feed', 'o_feed', 'o_wb', kindB === 'horse' ? 'o_tack' : 'o_milk', 'o_hay', 'o_hay', 'o_tack', 'o_feed']);
    const free = () => P.along(all).filter(([u, v]) => !ob.fs[v * W + u]);
    for (const t of items) at(free(), t, { s: ri(3) });
    if (pens.length) ob.zn.push(...pens.map(p => ({ x0: p.x0 - 1, x1: p.x1 + 1, y0: p.y0, y1: p.y1, n: 'STALLS' })));
    if (rnd() < 0.25) { const s = free(); const q = s[ri(s.length || 1)]; if (q && P.put(all, q[0], q[1], 'N', {})) Fm.npcs.push({ x: q[0], y: q[1], folk: 'h_res3', talk: () => say([['', pick(['Mind where you step.', 'Easy — she spooks if you come up fast.', 'Chores don\'t do themselves. Morning and night, every day.'])]]) }); }
  }
  // what hangs on the walls: the pegboard over the bench, rakes and shovels, tack and lanterns
  for (let v = 0; v < H - 1; v++) for (let u = 0; u < W; u++) { if (R[v][u] !== 'W' || 'WO '.includes(R[v + 1][u])) continue; const key = u + ',' + v; if (ob.dec.has(key)) continue;
    const q = hash(u * 7 + b.id, v * 13) % 8;
    if (k === 'o_gar') { if (q === 0) ob.dec.set(key, 'shelf'); else if (q === 1) ob.dec.set(key, 'hose'); else if (q === 2) ob.dec.set(key, 'peg'); }
    else if (k === 'o_shed') { if (q < 5) ob.dec.set(key, 'tools' + (q % 3)); else if (q === 5) ob.dec.set(key, 'hose'); }
    else { if (q === 0 || q === 1) ob.dec.set(key, 'tack'); else if (q === 2) ob.dec.set(key, 'shoe'); else if (q === 3) ob.dec.set(key, 'lamp'); else if (q === 4) ob.dec.set(key, 'fork'); }
  }
}

// ---------- where you are, what you see ----------
function outZone(Fm, x, y) {
  if (Fm.hh && Fm.oa) { const hh = Fm.hh, z = hh.Z[y * Fm.W + x]; if (z >= 0) { const r = hh.rooms[z]; hh.lastU = r.unit; hh.last = APT_ROOM[r.type] || 'HALL'; }
    const fl = FIG_FLOORS['room' + Fm.b.id]; if (fl) fl.place = hh.lastU >= 0 ? 'AN APARTMENT' : 'AN APARTMENT BUILDING'; return hh.last; }
  const ob = Fm.ob; if (!ob) return null; for (const z of ob.zn) if (x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1) return z.n; return 'INSIDE';
}
const OUT_DEC_LOOK = { peg: 'A pegboard of tools, each hung inside its own outline.', shelf: 'A shelf of paint cans and coffee cans full of screws.', hose: 'A coiled garden hose on a hook.',
  tools0: 'Rakes and shovels hung on nails.', tools1: 'A hoe, a spade and an edger on the wall.', tools2: 'Pruning shears, a saw and a leaf rake on the wall.',
  tack: 'Halters and lead ropes on pegs.', shoe: 'A horseshoe nailed up, open end up, for luck.', lamp: 'An old lantern on a nail.', fork: 'A pitchfork and a scoop shovel hung on the wall.',
  ext: 'A fire extinguisher. Inspected this year.', board: 'A notice board: a lost cat, a snow-removal schedule, a lease reminder. No names you\'d know.', mail: 'A row of mailboxes, numbered, locked.' };
function outLook(Fm, x, y, t, n) {
  if (n) { if (n.talk) n.talk(Fm, n); return true; }
  const ob = Fm.ob || Fm.oa, M = Fm.ob ? Fm.ob.M : Fm.hh.M, m = M.get(x + ',' + y);
  if (t === 'W' && ob && ob.dec.has(x + ',' + y)) { say([['', OUT_DEC_LOOK[ob.dec.get(x + ',' + y)] || 'A wall.']]); return true; }
  if (t === 'O') { say([['', Fm.ob && Fm.ob.ohd.has(x + ',' + y) ? 'The overhead door. It\'s down.' : Fm.kind === 'o_apt' ? 'The street, through the window.' : 'The yard, through a dusty window.']]); return true; }
  if (t === 'o_gate') { say([['', 'A stall gate, latched.']]); return true; }
  if (typeof t === 'string' && t.startsWith('o_')) {
    const L = { o_car: m && m.tr ? 'A pickup truck. A bag of road salt in the bed.' : 'A car, parked. The hood\'s still a little warm.', o_bench: 'A workbench with a vise, a coffee can of nails and a half-finished project.',
      o_bins: Fm.kind === 'o_shed' ? 'A shelf of flowerpots, twine and seed packets.' : 'Shelves of plastic bins: Christmas lights, camping gear, winter clothes.', o_mow: 'A lawn mower. Grass clippings dried on the deck.',
      o_rmow: 'A riding mower, parked for the season.', o_bike: 'A bicycle, tires a little soft.', o_snow: 'A snow blower. It\'ll be needed soon enough.', o_cans: 'Garbage and recycling bins.',
      o_gas: 'A red gas can.', o_frz: 'A chest freezer: venison, sweet corn, a few pies.', o_tires: 'A stack of snow tires.', o_wb: 'A wheelbarrow with a flat-ish tire.', o_soil: 'Bags of potting soil and mulch.',
      o_wood: 'Split firewood, stacked to dry.', o_pots: 'Clay pots stacked inside each other, a trowel, gloves.', o_hay: 'Hay bales. It smells like summer.', o_lad: 'A ladder up to the hay mow. You stay down here.',
      o_feed: 'Feed bins with tight lids, to keep the mice out.', o_trough: 'A water trough.', o_tack: 'A saddle on a rack, a bridle hung on the horn.', o_milk: 'Old milk cans.', o_rail: 'A stall rail.',
      o_tract: 'A tractor, mud on the tires.', o_cow: m && m.calf ? 'A calf. It stares at you, chewing.' : 'A cow. She looks at you and goes back to chewing.', o_horse: 'A horse. It flicks an ear at you.',
      o_sheep: 'A sheep. Baa.', o_chick: 'A chicken, pecking at the straw.', o_nest: 'A nesting box. Two brown eggs.', o_mbox: 'A bank of mailboxes, numbered, locked.', o_fold: 'A folding table. Somebody left a sock.',
      o_bench2: 'A bench by the door.' }[t];
    say([['', L || 'Something put away.']]); return true;
  }
  if (Fm.hh && Fm.oa) return homeLook(Fm, x, y, t, n);
  return false;
}

// ---------- drawing ----------
function outS(Fm, z) { const A = Fm.oa, r = z >= 0 ? Fm.hh.rooms[z] : null; Fm.hh.S = r && r.unit >= 0 ? A.US[r.unit] : A.S0; }
{ const _ft = roomFloorTile; roomFloorTile = function (Fm, t, x, y) {
    if (Fm.oa) { outS(Fm, Fm.hh.Z[(t === 'e' ? y - 1 : y) * Fm.W + x]); return _ft(Fm, t, x, y); }
    if (!Fm.ob) return _ft(Fm, t, x, y);
    const X = x * 24, Y = y * 24, h = hash(x * 11 + Fm.seed, y * 7 + 5), k = Fm.kind, s = Fm.ob.fs[y * Fm.W + x];
    if (s === 1) { qp('#c8a85a', X, Y, 24, 24); for (let i = 0; i < 9; i++) { const q = hash(h + i, 3); qp(i % 2 ? '#e0c878' : '#a8883a', X + q % 21, Y + (q >> 5) % 22, 3 + (q % 3), 1); } }
    else if (k === 'o_shed') { qp('#8a6a48', X, Y, 24, 24); for (let i = 0; i < 24; i += 8) qp('#6a4e32', X + i + 7, Y, 1, 24); qp('#7a5c3c', X, Y + ((x * 7 + y * 3) % 3) * 8, 24, 1); if (h % 5 === 0) qp('#5a4028', X + h % 20, Y + (h >> 4) % 20, 2, 2); }
    else if (k === 'o_barn' && Fm.ob.fl === 'dirt') { qp('#8a7050', X, Y, 24, 24); for (let i = 0; i < 5; i++) { const q = hash(h + i, 9); qp(i % 2 ? '#7a6244' : '#9a8060', X + q % 22, Y + (q >> 5) % 22, 2, 2); } if (h % 4 === 0) qp('#d8c070', X + h % 18, Y + (h >> 6) % 20, 4, 1); }
    else { qp(k === 'o_barn' ? '#9a968c' : '#8e8e8a', X, Y, 24, 24); if (h % 3 === 0) qp('#82827e', X + h % 18, Y + (h >> 4) % 18, 5, 3); if (h % 11 === 0) qp('#3a3a3c', X + (h >> 3) % 16, Y + (h >> 7) % 16, 6, 4); if ((y % 4) === 0) qp('#7a7a76', X, Y, 24, 1); }
    if (t === 'o_gate') { const vert = roomT(Fm, x, y - 1) === 'o_rail' || roomT(Fm, x, y + 1) === 'o_rail'; qp('#5a3a22', X, Y - 10, 3, 30); qp('#5a3a22', X + 21, Y - 10, 3, 30); qp('#8a6440', vert ? X + 3 : X + 3, Y - 6, 4, 22); qp('#8a6440', X + 3, Y - 6, 12, 2); qp('#8a6440', X + 3, Y + 6, 12, 2); }
    if (t === 'e') { qp('#3a3236', X + 2, Y + 3, 20, 14); qp('#4a4046', X + 3, Y + 4, 18, 12); }
  }; }
{ const _wf = roomWallFace; roomWallFace = function (Fm, x, y) {
    if (Fm.oa) { outS(Fm, Fm.hh.Z[(y + 1) * Fm.W + x]); _wf(Fm, x, y); const dk = Fm.oa.dec.get(x + ',' + y); if (dk) outDec(Fm, dk, x * 24, y * 24); return; }
    if (!Fm.ob) return _wf(Fm, x, y);
    const k = Fm.kind, X = x * 24, Y = y * 24, wall = k === 'o_gar' ? '#c8b48a' : k === 'o_shed' ? '#9a7a52' : '#7a5434';
    qp(wall, X, Y - 9, 24, 33); qp('#2a2224', X, Y - 9, 24, 1);
    if (k === 'o_gar') { qp('#b4a078', X + 11, Y - 8, 2, 32); for (let i = 0; i < 4; i++) qp('#d4c49a', X + (hash(x, y + i) % 20), Y - 4 + i * 6, 2, 1); qp('#8a8478', X, Y + 19, 24, 5); }
    else { for (let i = 0; i < 24; i += 6) qp(shade(wall, -0.18), X + i, Y - 8, 1, 32); qp(shade(wall, 0.1), X + 2, Y - 8, 1, 32); qp(shade(wall, -0.3), X, Y + 20, 24, 4); }
    const dk = Fm.ob.dec.get(x + ',' + y); if (dk) outDec(Fm, dk, X, Y);
  }; }
{ const _wn = roomWindow; roomWindow = function (Fm, x, y) {
    if (Fm.oa) outS(Fm, -1);
    if (Fm.ob && Fm.ob.ohd.has(x + ',' + y)) { const X = x * 24, Y = y * 24; qp('#d8d8d0', X, Y - 6, 24, 30); for (let i = 0; i < 5; i++) { qp('#b8b8b0', X, Y - 6 + i * 6, 24, 1); qp('#e8e8e0', X, Y - 5 + i * 6, 24, 1); } qp('#8a8a84', X + 10, Y + 18, 4, 2); return; }
    if (Fm.ob && Fm.kind !== 'o_gar') { const X = x * 24, Y = y * 24; qp('#5a3a22', X, Y, 24, 24); qp('#9ab0b8', X + 5, Y + 4, 14, 11); qp('#5a3a22', X + 11, Y + 4, 2, 11); qp('rgba(255,255,255,.2)', X + 6, Y + 5, 2, 9); return; }
    _wn(Fm, x, y); }; }
{ const _cp = roomCap; roomCap = function (Fm, x, y) { if (Fm.oa) outS(Fm, -1); return _cp(Fm, x, y); }; }
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) {
    if (typeof t === 'string' && t[0] === 'o' && t[1] === '_' && (Fm.ob || Fm.oa)) return outProp(Fm, t, x, y);
    if (Fm.oa && typeof t === 'string' && t[0] === 'h') { const m = Fm.hh.M.get(x + ',' + y); outS(Fm, m ? m.r : -1); }
    return _rp(Fm, t, x, y); }; }
function outDec(Fm, dk, X, Y) {
  const q = (c, a, e, w, h) => qp(c, X + a, Y + e, w, h);
  switch (dk) {
    case 'peg': q('#c8a070', 1, -6, 22, 20); for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) q('#9a7a50', 3 + i * 4, -4 + j * 5, 1, 1);
      q('#3a3a3e', 4, -4, 2, 10); q('#c83a2a', 3, 5, 4, 3); q('#8a8e96', 10, -3, 6, 2); q('#8a8e96', 12, -3, 2, 9); q('#c8a050', 17, -4, 3, 12); q('#5a5e66', 16, -4, 5, 2); break;
    case 'shelf': q('#6a4428', 1, 2, 22, 2); q('#c8ccd2', 3, -5, 5, 7); q('#3a6ab8', 3, -3, 5, 2); q('#c8ccd2', 10, -4, 4, 6); q('#8a5a30', 16, -6, 6, 8); q('#c8a050', 17, -5, 4, 1); break;
    case 'hose': for (let i = 0; i < 3; i++) { q('#2e7a38', 6 - i, -3 + i * 2, 12 + i * 2, 2); q('#2e7a38', 6 - i, 5 - i, 12 + i * 2, 2); } q('#5a5e66', 11, -6, 2, 3); break;
    case 'tools0': case 'tools1': case 'tools2': { const v = +dk[5];
      q('#a07a4a', 4, -8, 2, 26); q('#8a8e96', 1, 16, 8, 1); for (let i = 0; i < 4; i++) q('#8a8e96', 1 + i * 2, 17, 1, 3);   // a rake, tines down
      q('#a07a4a', 11, -8, 2, 20); q('#8a8e96', 9, 11, 6, 8); q('#6a6e76', 10, 18, 4, 1);   // a shovel
      if (v !== 1) { q('#a07a4a', 18, -8, 2, 24); q('#8a8e96', 16, 15, 6, 3); } else { q('#c83a2a', 16, -2, 6, 3); q('#8a8e96', 17, 1, 4, 7); }
      if (v === 2) q('#e8c040', 15, -6, 5, 4); break; }
    case 'tack': q('#5a3a22', 2, -6, 20, 2); q('#3a2414', 5, -4, 2, 14); q('#3a2414', 3, 8, 6, 6); q('#8a3a2a', 13, -4, 2, 10); q('#8a3a2a', 11, 4, 8, 2); q('#8a3a2a', 11, 4, 2, 8); q('#c8a050', 16, 10, 3, 3); break;
    case 'shoe': q('#6a6e76', 8, -4, 2, 10); q('#6a6e76', 14, -4, 2, 10); q('#6a6e76', 9, 5, 6, 2); q('#3a3a3e', 9, -2, 1, 1); q('#3a3a3e', 14, -2, 1, 1); break;
    case 'lamp': q('#3a3a3e', 11, -7, 2, 3); q('#3a3a3e', 8, -4, 8, 2); q('#f0d890', 9, -2, 6, 8); q('#3a3a3e', 8, 6, 8, 2); q('rgba(255,230,150,.15)', 3, -6, 18, 18); break;
    case 'fork': q('#a07a4a', 6, -8, 2, 22); q('#8a8e96', 3, 14, 8, 1); for (let i = 0; i < 4; i++) q('#8a8e96', 3 + i * 2, 15, 1, 5); q('#a07a4a', 15, -8, 2, 18); q('#6a6e76', 12, 10, 8, 8); break;
    case 'ext': q('#c8ccd2', 9, -6, 6, 1); q('#c82a2a', 9, -5, 6, 14); q('#e84a4a', 10, -5, 1, 14); q('#2a2a2e', 13, -8, 4, 3); q('#f4f0e4', 10, 0, 4, 3); break;
    case 'board': q('#6a4428', 2, -7, 20, 16); q('#c8a070', 3, -6, 18, 14); q('#f4f0e4', 4, -5, 6, 5); q('#f0e070', 12, -4, 6, 4); q('#f4f0e4', 6, 2, 8, 4); q('#c83a2a', 6, -5, 1, 1); q('#3a6ab8', 14, -4, 1, 1); break;
    case 'mail': q('#8a7a4a', 0, -7, 24, 18); for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) { q('#c8b070', 1 + i * 6, -6 + j * 6, 5, 5); q('#4a3a1a', 3 + i * 6, -4 + j * 6, 1, 1); } break;
  }
}
function outProp(Fm, t, x, y) {
  const X = x * 24, Y = y * 24, q = (c, a, e, w, h) => qp(c, X + a, Y + e, w, h), h = hash(x * 5 + Fm.seed, y * 9 + 2), sh = (w = 24) => q('rgba(0,0,0,.22)', 1, 19, w - 2, 4);
  if (t === 'o_rail') { const L = roomT(Fm, x - 1, y), Rt = roomT(Fm, x + 1, y), U = roomT(Fm, x, y - 1), D = roomT(Fm, x, y + 1), on = s => s === 'o_rail' || s === 'o_gate';
    q('rgba(0,0,0,.2)', 2, 19, 20, 3); q('#5a3a22', 10, -8, 4, 28); q('#6a4428', 10, -8, 4, 2);
    if (on(L) || !on(U) && !on(D)) { q('#8a6440', 0, -4, 12, 3); q('#8a6440', 0, 6, 12, 3); } if (on(Rt) || !on(U) && !on(D)) { q('#8a6440', 12, -4, 12, 3); q('#8a6440', 12, 6, 12, 3); }
    if (on(U)) q('#7a5434', 11, -24, 2, 18); if (on(D)) q('#7a5434', 11, 18, 2, 6); return; }
  const M = Fm.ob ? Fm.ob.M : Fm.hh.M, m = M.get(x + ',' + y); if (!m || m.ax !== x || m.ay !== y) return;
  switch (t) {
    case 'o_car': { const c = m.c, dk = shade(c, -0.25), lt = shade(c, 0.18); q('rgba(0,0,0,.28)', 4, 6, 44, 114);
      for (const [a, e] of [[1, 16], [41, 16], [1, 86], [41, 86]]) { q('#16161a', a, e, 6, 18); q('#3a3a3e', a + 1, e + 2, 4, 1); }
      q(c, 4, 4, 40, 112); q(lt, 6, 4, 36, 2); q(dk, 4, 112, 40, 4); q(dk, 4, 4, 2, 112); q(dk, 42, 4, 2, 112);
      if (!m.tr) { q(dk, 8, 24, 32, 1); q('#20262e', 8, 26, 32, 12); q(lt, 8, 38, 32, 32); q(shade(c, 0.08), 10, 40, 28, 28); q('#2a3440', 7, 70, 34, 14); q('rgba(255,255,255,.2)', 10, 72, 8, 3); q(dk, 23, 88, 2, 22); }
      else { q(dk, 7, 6, 34, 44); for (let i = 0; i < 5; i++) q(shade(c, -0.4), 9, 10 + i * 8, 30, 1); q('#c8b898', 12, 20, 14, 10); q(dk, 4, 50, 40, 3); q('#20262e', 8, 54, 32, 4); q(lt, 8, 58, 32, 18); q('#2a3440', 7, 76, 34, 12); q('rgba(255,255,255,.2)', 10, 78, 8, 3); q(dk, 23, 92, 2, 18); }
      q(c, 0, 72, 4, 5); q(c, 44, 72, 4, 5); q('#f4f0d8', 7, 112, 9, 3); q('#f4f0d8', 32, 112, 9, 3); q('#c02020', 6, 4, 8, 3); q('#c02020', 34, 4, 8, 3); q('#c8ccd2', 16, 115, 16, 2); break; }
    case 'o_tract': { const c = m.c, dk = shade(c, -0.25); q('rgba(0,0,0,.25)', 4, 6, 68, 90);
      for (const a of [0, 56]) { q('#1a1a1c', a, 4, 16, 38); for (let i = 0; i < 7; i++) q('#2e2e32', a + 1, 6 + i * 5, 14, 2); q('#c8a020', a + 4, 18, 8, 10); }
      q(c, 16, 8, 40, 30); q(dk, 16, 36, 40, 3); q('#2a2a2e', 26, 14, 20, 12); q('#3a3a3e', 30, 26, 12, 3); q('#2a2a2e', 34, 30, 4, 6); q('#16161a', 30, 36, 12, 2);
      q(c, 26, 38, 20, 50); q(shade(c, 0.15), 28, 40, 4, 46); q(dk, 26, 86, 20, 4); q('#5a5e66', 31, 34, 3, 8); q('#16161a', 32, 30, 2, 5);
      for (const a of [14, 48]) { q('#1a1a1c', a, 66, 10, 22); for (let i = 0; i < 4; i++) q('#2e2e32', a + 1, 68 + i * 5, 8, 2); }
      q('#f4f0d8', 29, 90, 4, 3); q('#f4f0d8', 39, 90, 4, 3); break; }
    case 'o_bench': { sh(48); q('#8a5a30', 0, 0, 48, 6); q('#a87040', 0, 0, 48, 1); q('#6a4428', 2, 6, 3, 14); q('#6a4428', 43, 6, 3, 14); q('#6a4428', 2, 13, 44, 2);
      q('#5a5e66', 2, -6, 8, 6); q('#3a3a3e', 4, -8, 4, 2); q('#c83a2a', 16, -3, 10, 3); q('#c8a050', 30, -4, 6, 4); q('#8a8e96', 38, -2, 8, 2); q('#c8ccd2', 12, 9, 6, 4); q('#3a6ab8', 26, 9, 8, 4); break; }
    case 'o_bins': { sh(); q('#8a8e96', 1, -14, 2, 34); q('#8a8e96', 21, -14, 2, 34); for (let r = 0; r < 4; r++) { q('#6a6e76', 1, -6 + r * 8, 22, 1);
        const sh2 = Fm.kind === 'o_shed'; for (let i = 0; i < 2; i++) { const z = hash(x * 3 + i + Fm.seed, y + r); q(sh2 ? ['#a0502a', '#c8a050', '#5a7a3a'][z % 3] : ['#3a6ab8', '#e8e4dc', '#c83a2a', '#2a2a2e', '#5ab05a'][z % 5], 3 + i * 10, -12 + r * 8, 8, 6); } } break; }
    case 'o_frz': { sh(48); q('#f0f2f4', 1, -2, 46, 21); q('#dcdfe2', 1, -2, 46, 4); q('#c8ccd2', 1, 5, 46, 1); q('#8a8e96', 20, 6, 8, 2); q('#5ab05a', 40, 8, 3, 2); break; }
    case 'o_mow': { sh(); q('#c83a2a', 3, 6, 18, 12); q('#e84a3a', 3, 6, 18, 2); q('#3a3a3e', 8, 3, 8, 5); q('#16161a', 2, 15, 4, 5); q('#16161a', 18, 15, 4, 5); q('#5a5e66', 5, -10, 2, 16); q('#5a5e66', 17, -10, 2, 16); q('#2a2a2e', 5, -11, 14, 2); break; }
    case 'o_rmow': { q('rgba(0,0,0,.22)', 2, 40, 20, 4); q('#3a7a3a', 3, 4, 18, 34); q('#4a9a4a', 3, 4, 18, 2); q('#e8c040', 5, 30, 14, 6); q('#2a2a2e', 6, 8, 12, 8); q('#3a3a3e', 9, 16, 6, 3);
      for (const [a, e] of [[0, 4], [19, 4], [1, 32], [19, 32]]) q('#16161a', a, e, 5, e < 10 ? 10 : 8); break; }
    case 'o_bike': { const c = ['#3a6ab8', '#c83a2a', '#2a2a2e', '#5ab05a'][h % 4]; q('#16161a', 2, 4, 9, 9); q('#9aa0a8', 4, 6, 5, 5); q('#16161a', 13, 4, 9, 9); q('#9aa0a8', 15, 6, 5, 5);
      q(c, 6, 3, 12, 2); q(c, 6, 3, 2, 6); q(c, 10, 3, 2, 6); q('#2a2a2e', 5, 0, 5, 2); q('#2a2a2e', 15, -1, 2, 5); q('#2a2a2e', 13, -2, 6, 1); break; }
    case 'o_snow': { sh(); q('#e87a20', 3, 2, 18, 14); q('#f09040', 3, 2, 18, 2); q('#2a2a2e', 3, 10, 18, 6); q('#e87a20', 14, -6, 4, 8); q('#e87a20', 14, -7, 7, 3); q('#16161a', 4, 16, 5, 4); q('#16161a', 15, 16, 5, 4); q('#5a5e66', 6, -10, 2, 13); q('#5a5e66', 6, -10, 8, 2); break; }
    case 'o_cans': { sh(); q('#2a3a2e', 1, -2, 10, 21); q('#3a4a3e', 0, -4, 12, 3); q('#2a5a9a', 13, -2, 10, 21); q('#3a6ab8', 12, -4, 12, 3); q('#f4f0e4', 16, 4, 4, 4); break; }
    case 'o_gas': { q('rgba(0,0,0,.2)', 6, 18, 12, 3); q('#c82a2a', 6, 6, 12, 13); q('#e84a4a', 6, 6, 12, 2); q('#c82a2a', 8, 2, 8, 4); q('#2a2a2e', 15, 1, 4, 3); q('#e8c040', 9, 11, 6, 3); break; }
    case 'o_tires': { sh(); for (let i = 0; i < 4; i++) { q('#16161a', 2, 12 - i * 6, 20, 6); q('#2e2e32', 4, 13 - i * 6, 16, 1); q('#5a5e66', 9, 13 - i * 6, 6, 3); } break; }
    case 'o_wb': { sh(); q('#3a7a3a', 2, 2, 16, 12); q('#4a9a4a', 2, 2, 16, 2); q('#2a5a2a', 4, 6, 12, 6); q('#16161a', 16, 10, 7, 7); q('#5a5e66', 18, 12, 3, 3); q('#a07a4a', 0, 12, 10, 2); q('#5a5e66', 6, 14, 2, 6); break; }
    case 'o_soil': { sh(); for (let i = 0; i < 3; i++) { const c = ['#5a3a22', '#3a5a2a', '#6a4a2a'][(i + h) % 3]; q(c, 2 + (i % 2) * 2, 8 - i * 6, 20, 8); q(shade(c, 0.2), 2 + (i % 2) * 2, 8 - i * 6, 20, 1); q('#e8c040', 9 + (i % 2) * 2, 10 - i * 6, 6, 3); } break; }
    case 'o_wood': { sh(); q('#5a3a22', 1, -10, 2, 30); q('#5a3a22', 21, -10, 2, 30); for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) { const ox = 3 + i * 5 - (j % 2) * 2; if (ox < 2 || ox > 18) continue; q('#c8985a', ox, -8 + j * 5, 5, 5); q('#a07040', ox + 1, -7 + j * 5, 3, 3); q('#e8c890', ox + 2, -6 + j * 5, 1, 1); } break; }
    case 'o_pots': { sh(); for (let i = 0; i < 3; i++) { q('#b05a2a', 2 + i * 7, 8 - (i % 2) * 4, 7, 10); q('#c86a3a', 1 + i * 7, 6 - (i % 2) * 4, 9, 3); } q('#8a8e96', 17, -2, 2, 8); q('#5a3a22', 17, 6, 2, 3); q('#e8c040', 2, -2, 6, 5); break; }
    case 'o_hay': { const n = 1 + (m.s || 0) % 2; q('rgba(0,0,0,.2)', 1, 19, 22, 4);
      for (let i = 0; i < n; i++) { const yy = 4 - i * 11; q('#d8b850', 1, yy, 22, 15); q('#e8cc70', 1, yy, 22, 3); q('#b8983a', 1, yy + 13, 22, 2); q('#8a6a3a', 7, yy, 1, 15); q('#8a6a3a', 16, yy, 1, 15); for (let k = 0; k < 4; k++) q('#f0dc8a', 3 + ((h + k * 5) % 18), yy + 5 + k * 2, 3, 1); } break; }
    case 'o_lad': { q('#2a2016', 2, -34, 20, 8); q('#8a6440', 4, -34, 3, 54); q('#8a6440', 17, -34, 3, 54); for (let i = 0; i < 9; i++) q('#a07a4a', 6, -30 + i * 6, 12, 2); break; }
    case 'o_feed': { sh(); if (h % 2) { q('#8a8e96', 3, -2, 18, 21); q('#a8acb4', 3, -2, 18, 3); q('#6a6e76', 3, 6, 18, 1); q('#6a6e76', 3, 13, 18, 1); q('#5a5e66', 10, -4, 4, 2); }
      else { q('#e8e0c8', 2, 2, 9, 17); q('#c8b898', 2, 2, 9, 2); q('#3a6a3a', 4, 8, 5, 4); q('#e8e0c8', 12, 4, 10, 15); q('#c8b898', 12, 4, 10, 2); q('#c83a2a', 14, 10, 6, 3); } break; }
    case 'o_trough': { q('rgba(0,0,0,.2)', 1, 18, 22, 4); q('#8a8e96', 1, 4, 22, 15); q('#a8acb4', 1, 4, 22, 2); q('#5a8ab8', 3, 7, 18, 6); q('rgba(255,255,255,.3)', 5, 8, 6, 1); break; }
    case 'o_tack': { sh(); q('#6a4428', 10, 6, 4, 14); q('#4a2e1a', 5, 18, 14, 2); q('#7a4020', 2, -4, 20, 12); q('#8a5030', 4, -6, 16, 4); q('#5a3018', 9, -8, 6, 3); q('#c8a050', 5, 6, 2, 6); q('#3a2414', 17, 2, 2, 10); break; }
    case 'o_milk': { sh(); for (let i = 0; i < 2; i++) { q('#b8bcc4', 2 + i * 11, 0, 9, 19); q('#d8dce0', 2 + i * 11, 0, 9, 2); q('#b8bcc4', 4 + i * 11, -5, 5, 6); q('#9aa0a8', 3 + i * 11, -6, 7, 2); } break; }
    case 'o_cow': case 'o_horse': case 'o_sheep': case 'o_chick': outAnimal(Fm, t, m, X, Y, h); break;
    case 'o_nest': { sh(); q('#8a6440', 2, 2, 20, 17); q('#6a4428', 2, 2, 20, 2); q('#d8b850', 5, 5, 14, 8); q('#c8905a', 8, 6, 4, 4); q('#e8c8a0', 13, 7, 4, 4); break; }
    case 'o_mbox': { sh(48); q('#8a7a4a', 0, -16, 48, 36); q('#6a5a3a', 0, -16, 48, 2); for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) { q('#c8b070', 2 + i * 8, -13 + j * 8, 6, 6); q('#e0cc90', 2 + i * 8, -13 + j * 8, 6, 1); q('#4a3a1a', 6 + i * 8, -10 + j * 8, 1, 1); } q('#5a4a2a', 4, 18, 40, 2); break; }
    case 'o_fold': { const Wd = m.w * 24; q('rgba(0,0,0,.2)', 2, 17, Wd - 4, 4); q('#ecece8', 1, 3, Wd - 2, 10); q('#c8c8c4', 1, 12, Wd - 2, 2); q('#8a8e96', 3, 14, 2, 6); q('#8a8e96', Wd - 5, 14, 2, 6);
      q(['#3a6ab8', '#e8e4dc', '#c86a8a'][h % 3], 5, 2, 10, 6); q('#f4f0e4', 6, 0, 8, 3); if (m.w > 1) { q('#c8a070', 28, -2, 14, 10); q('#a88050', 28, -2, 14, 2); q('#e8e4dc', 30, -4, 10, 3); } break; }
  }
  if (t === 'o_bench2') { sh(); q('#8a5a30', 1, 6, 22, 6); q('#6a4428', 3, 12, 2, 7); q('#6a4428', 19, 12, 2, 7); }
}
function outAnimal(Fm, t, m, X, Y, h) {
  const q = (c, a, e, w, hh) => qp(c, X + a, Y + e, w, hh), f = m.f ? 1 : -1, fx = (a, w) => f > 0 ? a : (m.w * 24) - a - w, Q = (c, a, e, w, hh) => q(c, fx(a, w), e, w, hh);
  const tk = (frame + h) >> 4;
  if (t === 'o_chick') { const peck = tk % 5 === 0 ? 3 : 0, c = m.c; q('rgba(0,0,0,.2)', 7, 17, 11, 3);
    Q(c, 6, 6, 11, 9); Q(shade(c, -0.15), 6, 10, 6, 4); Q(c, 15, 2 + peck, 5, 6); Q('#d83a2a', 16, 0 + peck, 3, 2); Q('#e8a030', 20, 5 + peck, 2, 2); Q('#16161a', 17, 4 + peck, 1, 1); Q('#e8a030', 9, 15, 1, 4); Q('#e8a030', 13, 15, 1, 4); Q(shade(c, -0.2), 4, 4, 3, 5); return; }
  if (t === 'o_sheep') { q('rgba(0,0,0,.2)', 3, 17, 18, 4); Q('#2a2224', 5, 12, 2, 7); Q('#2a2224', 15, 12, 2, 7); Q('#f0ece0', 2, 1, 17, 13); Q('#e0dccc', 3, 10, 15, 3); for (let i = 0; i < 4; i++) Q('#fffcf0', 3 + i * 4, 2, 3, 2);
    Q('#2a2224', 16, 0 + (tk % 6 === 0 ? 2 : 0), 7, 7); Q('#16161a', 20, 2, 1, 1); return; }
  const W2 = m.w * 24, c = m.c;
  if (t === 'o_cow') {
    if (m.calf) { q('rgba(0,0,0,.2)', 2, 17, 20, 4); Q(c, 2, 2, 14, 10); Q('#2a2224', 4, 12, 2, 7); Q('#2a2224', 12, 12, 2, 7); Q(c, 15, -2, 7, 8); Q('#e8b0a8', 19, 3, 4, 3); Q('#16161a', 18, 0, 1, 1); if (c === '#f4f2ea') { Q('#2a2224', 5, 3, 5, 4); Q('#2a2224', 16, -2, 3, 3); } return; }
    q('rgba(0,0,0,.22)', 4, 18, W2 - 8, 4); Q(c, 6, -2, 32, 16); Q(shade(c, -0.1), 6, 10, 32, 4);
    if (c === '#f4f2ea') { Q('#2a2224', 10, -1, 9, 7); Q('#2a2224', 24, 3, 8, 6); Q('#2a2224', 30, -2, 5, 4); } else Q(shade(c, 0.15), 8, -2, 28, 2);
    for (const a of [8, 13, 28, 33]) Q('#3a2a20', a, 14, 3, 6); Q('#e8b0a8', 18, 12, 6, 3);
    const nod = tk % 7 === 0 ? 3 : 0; Q(c, 37, -4 + nod, 9, 11); Q('#e8b0a8', 42, 3 + nod, 5, 5); Q('#16161a', 41, -1 + nod, 1, 2); Q('#d8d0c0', 36, -7 + nod, 2, 3); Q('#d8d0c0', 44, -7 + nod, 2, 3);
    Q('#2a2224', 2, -1, 4, 2); Q('#2a2224', tk % 3 ? 2 : 3, 0, 2, 12); return; }
  // a horse
  q('rgba(0,0,0,.22)', 4, 18, W2 - 8, 4); Q(c, 8, -6, 28, 14); Q(shade(c, -0.15), 8, 5, 28, 3);
  for (const a of [10, 15, 29, 33]) { Q(shade(c, -0.1), a, 8, 3, 10); Q('#2a2224', a, 17, 3, 2); }
  const nod = tk % 6 === 0 ? 2 : 0; Q(c, 34, -14 + nod, 6, 12); Q(c, 36, -16 + nod, 10, 7); Q(shade(c, -0.25), 43, -12 + nod, 4, 3); Q('#16161a', 40, -14 + nod, 1, 1); Q('#2a2224', 32, -15 + nod, 3, 12); Q('#2a2224', 37, -18 + nod, 2, 3);
  Q('#2a2224', 3, -5, 5, 3); Q('#2a2224', tk % 3 ? 3 : 4, -3, 3, 14);
}
