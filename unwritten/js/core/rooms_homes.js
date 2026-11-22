"use strict";
// =====================================================================
//  INSIDE THE HOUSES (Nov 21, Christian: "Now make every business walk into able based on their building size, and the
//  houses in town. Populate them with furniture and tvs and rooms"). Every house and farmhouse in town opens through the
//  room system (rooms.js): the inside is the house's own traced outline at 1 m a tile, front door at the bottom, and the
//  floor plan below is fitted to whatever width and depth that outline gives: a living room inside the front door, a
//  kitchen, a hallway to the bedrooms and the bathroom, closets, a laundry, stairs. HOMES STAY PRIVATE: every inside here is
//  an invented, generic home, made up from the house's id so the same house always looks the same. No addresses, no
//  owners' names, no photographs of anyone, nothing that claims to be the real inside of a real home; the titles only say
//  A HOUSE or A FARMHOUSE. The housing authority's buildings and the other apartment buildings stay closed. Nothing is
//  built until its door is used. Tile tokens added here all start with 'h_'.
// =====================================================================
const HOME_KIND = 'h_home';
ROOM_STYLE[HOME_KIND] = [['wood', '#b08a5a', '#a07a4a'], ['#e8e0cc', '#8a6a4a']];
KIND_ZONE[HOME_KIND] = 'HOUSE';
function homeEligible(b) { return !!b && (b.type === 'house' || b.type === 'farmhouse') && !b.name && !b.landmark && !!b.poly && b.poly.length >= 3 && !/HOUSING AUTHORITY/.test(b.owner || '') && !roomSkip(b); }
{ const _re = roomEligible; roomEligible = function (b) { return _re(b) || homeEligible(b); }; }
const HOME_HOOKS = new Map();
{ const _rh = roomHook; roomHook = function (b) { const h = _rh(b); if ((h && h.kind) || !homeEligible(b)) return h; return homeHook(b); }; }
if (typeof ROOM_DOOR !== 'undefined') ROOM_DOOR = null;   // rebuilt with the house doors the first time it's asked
// the door table now holds every house: build it while the page is idle, so the first step outside doesn't stall on it
if (typeof requestIdleCallback === 'function') requestIdleCallback(() => { if (!ROOM_DOOR) roomDoors(); }, { timeout: 4000 });
const HOME_IN = ['You wipe your feet on the mat.', 'It\'s warm inside, and quiet.', 'It smells like coffee in here.', 'A clock ticks somewhere in the house.',
  'The furnace kicks on with a low hum.', 'It smells like supper cooking.', 'Boots and shoes in a row by the door.'];
function homeHook(b) {
  let h = HOME_HOOKS.get(b.id); if (h) return h;
  const farm = b.type === 'farmhouse';
  h = { kind: HOME_KIND, title: farm ? 'A FARMHOUSE' : 'A HOUSE',
    line: (farm ? 'A farmhouse. ' : 'A house. ') + HOME_IN[hash(b.id, 77) % HOME_IN.length],
    layout: (Fm, c) => homeLayout(Fm, c), zone: (Fm, x, y) => homeZone(Fm, x, y), look: (Fm, x, y, t, n) => homeLook(Fm, x, y, t, n) };
  HOME_HOOKS.set(b.id, h); return h;
}
// ---------- décor: four broad styles of house, everything picked from the house's id ----------
function homeStyle(b, rnd) {
  const pick = a => a[Math.floor(rnd() * a.length)];
  const st = b.type === 'farmhouse' ? (rnd() < 0.8 ? 'farm' : 'bung') : pick(['bung', 'bung', 'ranch', 'ranch', 'modern', 'farm']);
  const S = { st };
  if (st === 'farm') Object.assign(S, { walls: ['#efe6cf', '#e6dcc0', '#dde4cf', '#f0e0cc', '#e4e8e0'], trim: '#f4f0e6', cap: '#d8ccb0',
    living: pick([['wood', '#b8844e', '#a4743e'], ['wood', '#a06a3a', '#8c5a2e']]), kitchen: pick([['check', '#e8e0cc', '#b8423a'], ['wood', '#b8844e', '#a4743e'], ['check', '#ece6d6', '#3a5a7a']]),
    bath: ['hex', '#f0f0ec', '#d4d4d0'], bed: pick([['wood', '#b8844e', '#a4743e'], ['carpet', '#b8a88a', '#a8987a']]),
    cab: pick(['#f0ece2', '#e8dcc0', '#c8d4c4']), top: pick(['#d8cfc0', '#c8945a']), appl: '#f2f2ee', wood: '#8a5a32',
    sofa: pick(['#a83a32', '#3a6a4a', '#8a6a4a', '#c8907a']), pat: pick(['plaid', 'plaid', 'floral', 'afghan']), tv: 'crt', fire: rnd() < 0.5 ? 'stone' : null,
    rug: pick([{ c1: '#a84a3a', c2: '#3a6a8a', pat: 'braid' }, { c1: '#6a8a4a', c2: '#d8b060', pat: 'braid' }]), quilt: 1 });
  else if (st === 'bung') Object.assign(S, { walls: ['#cfd6bc', '#e8dcc4', '#c8d4dc', '#e8d0c8', '#ddd4c0'], trim: '#6a4428', cap: '#c8bca0',
    living: ['wood', '#8a5a32', '#7a4e2a'], kitchen: pick([['check', '#f0e8c8', '#c8b060'], ['check', '#ece8e0', '#2a2a30'], ['check', '#e8e4d8', '#7a9a6a']]),
    bath: pick([['tile', '#e8c8cc', '#c8a0a8'], ['tile', '#cfe0d0', '#a8c4ac'], ['hex', '#f0f0ec', '#d4d4d0']]), bed: pick([['carpet', '#b8a890', '#a89880'], ['wood', '#8a5a32', '#7a4e2a']]),
    cab: pick(['#e8e0c8', '#f0ece2', '#9a6a3a']), top: pick(['#d8d0c0', '#c8c4b8']), appl: pick(['#e8e0c8', '#f2f2ee']), wood: '#6a4428',
    sofa: pick(['#c8907a', '#7a5a3a', '#5a6a4a', '#8a3a3a']), pat: pick(['floral', 'plaid', 'plain', 'afghan']), tv: 'crt', fire: rnd() < 0.45 ? 'brick' : null,
    rug: pick([{ c1: '#8a2a2a', c2: '#d8b060', pat: 'orient' }, { c1: '#2a3a5a', c2: '#c8b080', pat: 'orient' }]) });
  else if (st === 'ranch') Object.assign(S, { walls: ['#e8d8a8', '#d8c8a8', '#c8d0b0', '#e0d0b8'], trim: '#5a3a22', cap: '#b8a888', panel: rnd() < 0.6,
    living: pick([['shag', '#c8702a', '#b4602a'], ['shag', '#8a8a3a', '#7a7a30'], ['shag', '#7a5a3a', '#6a4a30'], ['carpet', '#b8a080', '#a89070']]),
    kitchen: pick([['brick', '#c8a868', '#a88848'], ['brick', '#b8b8a0', '#98987e'], ['check', '#e8d890', '#c8a040']]),
    bath: pick([['tile', '#e8d890', '#c8b870'], ['tile', '#c8d4a0', '#a8b878'], ['tile', '#a8c0d8', '#88a0b8']]), bed: pick([['carpet', '#b8a080', '#a89070'], ['carpet', '#8a9ab0', '#7a8aa0'], ['shag', '#c8a0a8', '#b89098']]),
    cab: '#6a4428', top: pick(['#d8c890', '#e8e0d0', '#c8a868']), appl: pick(['#8a9a4a', '#c8a040', '#f2f2ee', '#b8783a']), wood: '#5a3a22',
    sofa: pick(['#8a5a32', '#c8702a', '#6a7a3a', '#a8883a']), pat: pick(['cord', 'cord', 'plain', 'floral']), tv: 'console', fire: rnd() < 0.3 ? 'brick' : null,
    rug: pick([{ c1: '#c8902a', c2: '#7a4a2a', pat: 'plain' }, { c1: '#6a7a3a', c2: '#c8b060', pat: 'plain' }]) });
  else Object.assign(S, { walls: ['#ecebe6', '#dcdcd6', '#e6e0d6', '#d8dce0', '#e8e4dc'], trim: '#f4f4f2', cap: '#c8c8c4',
    living: pick([['wood', '#c8b498', '#b8a488'], ['wood', '#9a8470', '#8a7460'], ['carpet', '#b8b4ac', '#aca8a0']]), kitchen: pick([['tile', '#d8d8d4', '#c4c4c0'], ['wood', '#c8b498', '#b8a488']]),
    bath: ['tile', '#e4e4e0', '#ccccc8'], bed: pick([['carpet', '#c8c0b4', '#bab2a6'], ['wood', '#c8b498', '#b8a488']]),
    cab: pick(['#f4f4f2', '#6a7078', '#3a4a5a']), top: pick(['#ecece8', '#3a3a40']), appl: '#b8bcc4', wood: '#3a3a40',
    sofa: pick(['#7a7e86', '#3a4a6a', '#a89a88', '#4a6a5a']), pat: 'plain', tv: 'flat', fire: rnd() < 0.2 ? 'modern' : null,
    rug: pick([{ c1: '#d8d4cc', c2: '#7a7e86', pat: 'plain' }, { c1: '#5a6a7a', c2: '#d8d4cc', pat: 'plain' }]) });
  S.blankets = ['#3a6ab8', '#a83a4a', '#5a8a5a', '#c8a050', '#8a6aa8', '#e8e4dc', '#3a4a6a', '#c86a4a'];
  S.piano = (st === 'farm' || st === 'bung') && rnd() < 0.25;
  S.two = b.area > 170 || b.type === 'farmhouse';
  return S;
}
// ---------- the floor plan ----------
function homeLayout(Fm, c) {
  const b = Fm.b, R = Fm.R, W = Fm.W, H = Fm.H, rnd = srng((b.id * 7919 + 101) >>> 0);
  const ri = n => Math.floor(rnd() * n), pick = a => a[ri(a.length)];
  const S = homeStyle(b, rnd);
  const hh = Fm.hh = { S, rooms: [], Z: new Int16Array(W * H).fill(-1), M: new Map(), rugs: [], tvOn: false, last: 'LIVING ROOM' };
  const { fx0, fx1, fy0, fy1 } = c, xs = Fm.ex, w = fx1 - fx0 + 1, d = fy1 - fy0 + 1;
  const isF = (u, v) => v >= 0 && v < H && u >= 0 && u < W && R[v][u] === '.';
  const PW = [], gaps = [];
  const room = (type, x0, y0, x1, y1) => { const i = hh.rooms.length, r = { type, x0, y0, x1, y1, i }; hh.rooms.push(r);
    for (let v = y0; v <= y1; v++) for (let u = x0; u <= x1; u++) if (isF(u, v)) hh.Z[v * W + u] = i; return r; };
  const wallH = (v, u0, u1, doors) => { for (let u = u0; u <= u1; u++) if (isF(u, v)) { if (doors.includes(u)) gaps.push([u, v]); else { R[v][u] = 'W'; PW.push([u, v]); } } };
  const wallV = (u, v0, v1, doors) => { for (let v = v0; v <= v1; v++) if (isF(u, v)) { if (doors.includes(v)) gaps.push([u, v]); else { R[v][u] = 'W'; PW.push([u, v]); } } };
  // a run of L cells into k rooms with a wall between each (every room at least 3)
  const split = (L, k) => { while (k > 1 && (L - (k - 1)) / k < 3) k--; const a = L - (k - 1), s = []; for (let i = 0; i < k; i++) s.push(Math.floor(a / k) + (i < a % k ? 1 : 0)); return s; };
  const slotK = L => Math.max(1, Math.round((L + 1) / 5));
  const slotsFor = L => { const k = slotK(L); if (k === 1 && L >= 5) return L >= 7 ? split(L, 2) : L === 6 ? [3, 2] : [2, 2]; return split(L, k); };
  // which slot gets which room: the smallest a bathroom, the rest bedrooms (the biggest the main one), a den past four
  const assign = slots => {
    const bySize = slots.slice().sort((p, q) => p.n - q.n);
    if (bySize.length >= 2) bySize[0].type = 'bath';
    if (bySize.length >= 5) bySize[1].type = bySize[1].n <= 12 ? 'laundry' : 'bath';
    let beds = 0; for (const s of bySize.slice().reverse()) if (!s.type) s.type = beds++ < 4 ? 'bed' : 'den';
    const B = slots.filter(s => s.type === 'bed').sort((p, q) => q.n - p.n);
    if (B.length) B[0].type = 'master';
    if (B.length >= 2 && rnd() < 0.6) B[B.length - 1].type = 'kids';
    if (B.length >= 4 && rnd() < 0.5) B[B.length - 2].type = 'den';
  };
  // the living room, with the kitchen open to it on the side away from the door when there's width for one
  const openPlan = (x0, y0, x1, y1) => { const rw = x1 - x0 + 1;
    if (rw < 7) { const l = room('living', x0, y0, x1, y1); l.kitchenette = 1; return l; }
    const kw = rw >= 10 ? 4 : 3, left = Fm.ex > (x0 + x1) / 2;
    room('kitchen', left ? x0 : x1 - kw + 1, y0, left ? x0 + kw - 1 : x1, y1);
    return room('living', left ? x0 + kw : x0, y0, left ? x1 : x1 - kw, y1); };
  let living = null;
  if (w < 4 || d < 4) { living = room('living', fx0, fy0, fx1, fy1); living.kitchenette = 1; }
  else if (d < 6 || (w >= d * 1.5 && d <= 11 && w >= 12)) {   // a long, shallow house: rooms side by side
    const Lw = Math.max(4, Math.min(8, Math.round(w * 0.32)));
    let best = null;   // where the living room goes: around the door, leaving the most room on its sides for the rest
    for (let a = xs - Lw + 1; a <= xs; a++) { let lx0 = Math.max(fx0, a), lx1 = Math.min(fx1, lx0 + Lw - 1);
      if (lx0 - fx0 - 1 < 3) lx0 = fx0; if (fx1 - lx1 - 1 < 3) lx1 = fx1;
      const sc = (lx0 > fx0 ? lx0 - fx0 - 1 : 0) + (lx1 < fx1 ? fx1 - lx1 - 1 : 0) - Math.abs((lx1 - lx0 + 1) - Lw) * 0.5;
      if (!best || sc > best[2]) best = [lx0, lx1, sc]; }
    const [lx0, lx1] = best;
    const L = lx0 > fx0 ? [fx0, lx0 - 2, lx0 - 1, -1] : null, Rt = lx1 < fx1 ? [lx1 + 2, fx1, lx1 + 1, 1] : null;
    const sides = [L, Rt].filter(Boolean), wd = sd => sd[1] - sd[0] + 1;
    let kS = null;   // the kitchen behind its own wall on the smaller side, if the other side still has room for a bedroom and a bath
    if (sides.length === 2) { const [a, z] = wd(sides[0]) <= wd(sides[1]) ? sides : [sides[1], sides[0]]; if (wd(a) >= 4 && slotsFor(wd(z)).length >= 2) kS = a; }
    let ly0 = fy0;
    if (d >= 9) { const bd = d - 6, m = (lx0 + lx1) >> 1; wallH(fy0 + bd, lx0, lx1, [m, m + 1]); room(rnd() < 0.7 ? 'dining' : 'den', lx0, fy0, lx1, fy0 + bd - 1); ly0 = fy0 + bd + 1; }
    if (kS) {
      living = room('living', lx0, ly0, lx1, fy1);
      const kw = wd(kS), open = d >= 5 ? [fy0 + 1, fy0 + 2] : [fy0 + 1];
      wallV(kS[2], fy0, fy1, open);
      if (kw >= 8) { const inner = 5, sx = kS[3] < 0 ? kS[1] - inner : kS[0] + inner; const ko = kS[3] < 0 ? [sx + 1, kS[1]] : [kS[0], sx - 1], oo = kS[3] < 0 ? [kS[0], sx - 1] : [sx + 1, kS[1]];
        room('kitchen', ko[0], fy0, ko[1], fy1); wallV(sx, fy0, fy1, [fy1 - 1]); room(oo[1] - oo[0] + 1 <= 3 ? 'laundry' : 'den', oo[0], fy0, oo[1], fy1); }
      else room('kitchen', kS[0], fy0, kS[1], fy1);
    } else living = openPlan(lx0, ly0, lx1, fy1);
    const hall = d >= 5, all = [], wings = sides.filter(sd => sd !== kS).map(wing => {
      const dir = wing[3], slots = []; let u = dir > 0 ? wing[0] : wing[1];
      for (const s of slotsFor(wd(wing))) { const u0 = dir > 0 ? u : u - s + 1, u1 = u0 + s - 1; slots.push({ u0, u1, n: s * (hall ? d - 2 : d) }); u = dir > 0 ? u1 + 2 : u0 - 2; }
      all.push(...slots); return { wing, dir, slots }; });
    assign(all);
    for (const { wing, dir, slots } of wings) {
      if (hall) {   // a hall along the front of the wing, rooms behind it
        wallV(wing[2], fy0, fy1, [fy1]); room('hall', wing[0], fy1, wing[1], fy1);
        slots.forEach((s, j) => { if (j) wallV(dir > 0 ? s.u0 - 1 : s.u1 + 1, fy0, fy1 - 2, []); });
        wallH(fy1 - 1, wing[0], wing[1], slots.map(s => (s.u0 + s.u1) >> 1));
        for (const s of slots) room(s.type, s.u0, fy0, s.u1, fy1 - 2);
      } else {   // too shallow for a hall: one room opens into the next
        wallV(wing[2], fy0, fy1, [fy0 + (d >> 1)]);
        slots.forEach((s, j) => { if (j) wallV(dir > 0 ? s.u0 - 1 : s.u1 + 1, fy0, fy1, [j % 2 ? fy1 - 1 : fy0 + 1]); room(s.type, s.u0, fy0, s.u1, fy1); });
      }
    }
  } else {   // the usual house: living room (and kitchen) across the front, the bedrooms and bath behind
    let Lv = Math.max(4, Math.min(7, Math.round(d * 0.38))); if (d - Lv - 1 < 3) Lv = Math.max(3, d - 4);
    const wy = fy1 - Lv, Lb = wy - fy0;
    let hx = null;
    if (Lb >= 7) { if (w >= 9) hx = Math.max(fx0 + 4, Math.min(fx1 - 4, xs)); else if (w >= 6) hx = xs > (fx0 + fx1) / 2 ? fx1 : fx0; }
    let kFront = null;   // a wide house: the kitchen up front beside the living room, behind its own wall
    if (w >= 12) { const kw = Math.max(4, Math.min(7, Math.round(w * 0.42))), left = xs > (fx0 + fx1) / 2;
      const k0 = left ? fx0 : fx1 - kw + 1, k1 = k0 + kw - 1, kwall = left ? k1 + 1 : k0 - 1;
      if (hx != null && hx >= k0 - 1 && hx <= k1 + 1) { const nh = left ? k1 + 2 : k0 - 2; if (nh >= fx0 + 4 && nh <= fx1 - 4) hx = nh; }
      if (hx == null || !(hx >= k0 - 1 && hx <= k1 + 1)) kFront = { k0, k1, kwall, left }; }
    if (kFront) { living = room('living', kFront.left ? kFront.kwall + 1 : fx0, wy + 1, kFront.left ? fx1 : kFront.kwall - 1, fy1);
      room('kitchen', kFront.k0, wy + 1, kFront.k1, fy1); wallV(kFront.kwall, wy + 1, fy1, Lv >= 5 ? [wy + 1, wy + 2] : [wy + 1]); }
    else living = openPlan(fx0, wy + 1, fx1, fy1);
    const slots = [];
    if (hx != null) {
      const sides = w >= 9 ? [[fx0, hx - 2, hx - 1], [hx + 2, fx1, hx + 1]] : [hx === fx1 ? [fx0, fx1 - 2, fx1 - 1] : [fx0 + 2, fx1, fx0 + 1]];
      for (const sd of sides) { const sz = slotsFor(Lb); let v = wy - 1;
        for (const s of sz) { slots.push({ u0: sd[0], u1: sd[1], v0: v - s + 1, v1: v, wu: sd[2], n: s * (sd[1] - sd[0] + 1) }); v -= s + 1; } }
      assign(slots);
      wallH(wy, fx0, fx1, [hx]); room('hall', hx, fy0, hx, wy - 1);
      for (const sd of sides) { const mine = slots.filter(s => s.wu === sd[2]);
        wallV(sd[2], fy0, wy - 1, mine.map(s => s.v1 - ((s.v1 - s.v0) >> 1)));
        for (const s of mine) { if (s.v0 > fy0) wallH(s.v0 - 1, sd[0], sd[1], []); room(s.type, s.u0, s.v0, s.u1, s.v1); } }
    } else if (Lb >= 7) {   // a narrow, deep house: each room opens into the next
      const sz = slotsFor(Lb); let v = wy - 1; for (const s of sz) { slots.push({ u0: fx0, u1: fx1, v0: v - s + 1, v1: v, n: s * w }); v -= s + 1; }
      assign(slots); wallH(wy, fx0, fx1, [Math.max(fx0, Math.min(fx1, xs))]);
      slots.forEach((s, j) => { if (s.v0 > fy0) wallH(s.v0 - 1, fx0, fx1, [j % 2 ? fx0 + 1 : fx1 - 1]); room(s.type, s.u0, s.v0, s.u1, s.v1); });
    } else {   // the back rooms side by side, each with its door off the living room
      const sz = slotsFor(w); let u = fx0; for (const s of sz) { slots.push({ u0: u, u1: u + s - 1, n: s * Lb }); u += s + 1; }
      assign(slots);
      slots.forEach((s, j) => { if (j) wallV(s.u0 - 1, fy0, wy - 1, []); });
      wallH(wy, fx0, fx1, slots.map(s => s.type === 'bath' ? s.u0 + ((s.u1 - s.u0) >> 1) : Math.max(s.u0, Math.min(s.u1, s.u1 - s.u0 >= 3 ? s.u0 + 1 : s.u0))));
      for (const s of slots) room(s.type, s.u0, fy0, s.u1, wy - 1);
    }
  }
  // every room reachable: where a partition cut a room off (an odd-shaped outline), open a doorway through it
  const WK = new Uint8Array(W * H), seenA = new Uint8Array(W * H), stk = new Int32Array(W * H);   // flood fill from the door, on flat arrays
  const reach = () => { for (let v = 0; v < H; v++) { const row = R[v]; for (let u = 0; u < W; u++) WK[v * W + u] = ROOM_WALK.has(row[u]) ? 1 : 0; }
    seenA.fill(0); let sp = 0, n = 1; const s0 = Fm.ey * W + Fm.ex; seenA[s0] = 1; stk[sp++] = s0;
    while (sp) { const i = stk[--sp], u = i % W;
      if (u > 0 && WK[i - 1] && !seenA[i - 1]) { seenA[i - 1] = 1; stk[sp++] = i - 1; n++; }
      if (u < W - 1 && WK[i + 1] && !seenA[i + 1]) { seenA[i + 1] = 1; stk[sp++] = i + 1; n++; }
      if (i >= W && WK[i - W] && !seenA[i - W]) { seenA[i - W] = 1; stk[sp++] = i - W; n++; }
      if (i + W < W * H && WK[i + W] && !seenA[i + W]) { seenA[i + W] = 1; stk[sp++] = i + W; n++; } }
    return n; };
  for (let it = 0; it < 16; it++) { reach(); const seen = { has: k => { const [a, e] = k.split(',').map(Number); return !!seenA[e * W + a]; } }; let op = null;
    for (const [u, v] of PW) { if (R[v][u] !== 'W') continue;
      for (const [p, q] of [[[u - 1, v], [u + 1, v]], [[u, v - 1], [u, v + 1]]]) if (isF(p[0], p[1]) && isF(q[0], q[1]) && seen.has(p.join(',')) !== seen.has(q.join(','))) { op = [u, v]; break; }
      if (op) break; }
    if (!op) break; R[op[1]][op[0]] = '.'; gaps.push(op); }
  for (const [u, v] of gaps) if (hh.Z[v * W + u] < 0) for (const [du, dv] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { const z = hh.Z[(v + dv) * W + u + du]; if (z >= 0 && isF(u + du, v + dv)) { hh.Z[v * W + u] = z; break; } }
  // the front windows: in pairs, never where a wall inside meets the front
  { let run = 0; for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) { if (R[v][u] !== 'O') { run = 0; continue; }
      if (!isF(u, v - 1) || run % 3 === 2) R[v][u] = 'W'; run++; } }
  // ---------- furniture ----------
  const keep = new Set(), K = (u, v) => keep.add(u + ',' + v);
  K(Fm.ex, Fm.ey); K(Fm.ex, Fm.ey - 1);
  for (const [u, v] of gaps) { K(u, v); K(u - 1, v); K(u + 1, v); K(u, v - 1); K(u, v + 1); }
  let nWalk = reach();
  const cnt = reach;
  const inR = (r, u, v) => isF(u, v) && hh.Z[v * W + u] === r.i && !keep.has(u + ',' + v);
  const put = (r, u, v, tok, meta, pw = 1, ph = 1) => {
    const cells = []; for (let j = 0; j < ph; j++) for (let i = 0; i < pw; i++) { if (!inR(r, u + i, v + j)) return false; cells.push([u + i, v + j]); }
    for (const [a, e] of cells) R[e][a] = tok; const n = cnt();
    if (n !== nWalk - cells.length) { for (const [a, e] of cells) R[e][a] = '.'; return false; }
    nWalk = n; const m = Object.assign({ t: tok, ax: u, ay: v, w: pw, h: ph, r: r.i }, meta || {}); for (const [a, e] of cells) hh.M.set(a + ',' + e, m); return true; };
  const wallAbove = (u, v) => !!R[v - 1] && (R[v - 1][u] === 'W' || R[v - 1][u] === 'O');
  const byMid = r => { const m = (r.x0 + r.x1) / 2, a = []; for (let u = r.x0; u <= r.x1; u++) a.push(u); return a.sort((p, q) => Math.abs(p - m) - Math.abs(q - m)); };
  const tryAt = (r, list, tok, meta, pw, ph) => { for (const [u, v] of list) if (put(r, u, v, tok, meta, pw, ph)) return [u, v]; return null; };
  const topRow = r => { const a = []; for (let u = r.x0; u <= r.x1; u++) if (isF(u, r.y0) && wallAbove(u, r.y0)) a.push([u, r.y0]); return a; };
  const corners = r => [[r.x0, r.y0], [r.x1, r.y0], [r.x0, r.y1], [r.x1, r.y1]];
  const sideCol = (r, u) => { const a = []; for (let v = r.y0 + 1; v <= r.y1; v++) a.push([u, v]); return a; };
  let stairs = false, laundry = hh.rooms.some(r => r.type === 'laundry');
  const blanket = () => pick(S.blankets);
  const furnish = {
    living(r) {
      const rw = r.x1 - r.x0 + 1, rd = r.y1 - r.y0 + 1;
      if (r.kitchenette) { const cu = Math.abs(Fm.ex - r.x0) < Math.abs(Fm.ex - r.x1) ? r.x1 : r.x0, s = [[cu, r.y0]].concat(sideCol(r, cu)); const seq = ['h_fridge', 'h_stove', 'h_sink', 'h_ctr']; let i = 0;
        for (const [u, v] of s) { if (i >= seq.length) break; if (put(r, u, v, seq[i], { c: seq[i] === 'h_fridge' || seq[i] === 'h_stove' ? S.appl : S.cab })) i++; } }
      let tc = null; for (const u of byMid(r)) if (wallAbove(u, r.y0) && put(r, u, r.y0, 'h_tv', { v: S.tv })) { tc = u; break; }
      if (tc != null && rd >= 3) {
        const cy = r.y0 + (rd >= 6 ? 3 : rd >= 4 ? 2 : 1), ty = cy - 1; let L = rw >= 7 ? 3 : rw >= 4 ? 2 : 1, cx = null;
        for (const L2 of [L, L - 1]) { if (L2 < 1) continue; for (const off of [0, -1, 1, -2, 2]) { const u = tc - ((L2 - 1) >> 1) + off; if (put(r, u, cy, L2 > 1 ? 'h_sofa' : 'h_arm', { c: S.sofa, pat: S.pat }, L2, 1)) { cx = u; L = L2; break; } } if (cx != null) break; }
        if (cx != null) {
          if (ty > r.y0) { const tw = L >= 3 ? 2 : 1; put(r, cx + ((L - tw) >> 1), ty, 'h_ctab', { v: hash(b.id, 3) % 3 }, tw, 1); }
          hh.rugs.push(Object.assign({ x0: Math.max(r.x0, cx - 1), y0: ty > r.y0 ? ty : cy, x1: Math.min(r.x1, cx + L), y1: cy }, S.rug));
          tryAt(r, [[cx + L, ty], [cx - 1, ty], [cx + L, cy], [cx - 1, cy]], 'h_arm', { c: shade(S.sofa, 0.12), pat: 'plain' });
          tryAt(r, [[cx - 1, cy], [cx + L, cy], [cx - 1, cy + 1], [cx + L, cy + 1]], 'h_lamp', { c: pick(['#e8d8a8', '#f0e8d0', '#d8c8a0']) });
        }
      }
      if (S.fire && rw >= 6) { const ts = topRow(r).filter(([u]) => tc == null || Math.abs(u - tc) >= 3).sort((p, q) => Math.abs(q[0] - (tc || 0)) - Math.abs(p[0] - (tc || 0))); tryAt(r, ts, 'h_fire', { v: S.fire }, 2, 1); }
      if (S.piano && rw >= 8) tryAt(r, topRow(r).reverse(), 'h_piano', {}, 2, 1);
      tryAt(r, [[r.x0, r.y0], [r.x1, r.y0]].filter(([u, v]) => wallAbove(u, v)), 'h_bks', {});
      tryAt(r, corners(r), 'h_plant', {});
      tryAt(r, [[Fm.ex - 1, Fm.ey], [Fm.ex + 1, Fm.ey], [Fm.ex - 2, Fm.ey], [Fm.ex + 2, Fm.ey]], 'h_coat', { c: blanket() });
      if (rw >= 10 && rd >= 6) { tryAt(r, [[r.x1, r.y1 - 1], [r.x0, r.y1 - 1]], 'h_plant', {}); tryAt(r, [[r.x0, r.y0 + 2], [r.x1, r.y0 + 2]], 'h_arm', { c: shade(S.sofa, -0.1), pat: 'plain' }); }
    },
    kitchen(r) {
      const rw = r.x1 - r.x0 + 1, rd = r.y1 - r.y0 + 1, top = topRow(r), seq = [];
      const left = rnd() < 0.5; if (!left) top.reverse();
      const run = top.length >= 4 ? top : top.concat(sideCol(r, left ? r.x0 : r.x1).slice(0, Math.max(0, 4 - top.length)));
      const n = run.length, st = Math.min(n - 1, Math.max(1, Math.round(n * 0.35))), sk = Math.min(n - 1, Math.max(st + 1, Math.round(n * 0.7)));
      run.forEach(([u, v], i) => { const tok = i === 0 ? 'h_fridge' : i === st ? 'h_stove' : i === sk ? 'h_sink' : 'h_ctr';
        if (!put(r, u, v, tok, { c: tok === 'h_fridge' || tok === 'h_stove' ? S.appl : S.cab, k: hash(u + b.id, v) % 6 }) && tok !== 'h_ctr') seq.push(tok); });
      for (const tok of seq) tryAt(r, sideCol(r, left ? r.x1 : r.x0), tok, { c: tok === 'h_ctr' || tok === 'h_sink' ? S.cab : S.appl });
      let ty0 = r.y0 + 2;
      if (rw >= 7 && rd >= 7) { const iw = rw >= 9 ? 3 : 2; if (put(r, ((r.x0 + r.x1) >> 1) - (iw >> 1), r.y0 + 2, 'h_isl', { c: S.cab }, iw, 1)) ty0 = r.y0 + 4; }
      if (rd >= 4 && rw >= 3) { const tw = rw >= 5 ? 2 : 1, th = rd >= 7 && rw >= 5 ? 2 : 1, ty = Math.min(r.y1 - th, Math.max(ty0, ((ty0 + r.y1) >> 1) - (th >> 1)));
        for (const u of byMid(r)) { const tx = u - (tw >> 1); if (put(r, tx, ty, 'h_dtab', { c: S.wood }, tw, th)) {
          for (let j = 0; j < th; j++) { put(r, tx - 1, ty + j, 'h_chair', { c: S.wood, o: 'r' }); put(r, tx + tw, ty + j, 'h_chair', { c: S.wood, o: 'l' }); }
          for (let i = 0; i < tw; i++) put(r, tx + i, ty + th, 'h_chair', { c: S.wood, o: 'u' });
          break; } } }
      if (!laundry && rw * rd >= 30) { const a = tryAt(r, corners(r).slice(2), 'h_wash', {}); if (a) { laundry = true; tryAt(r, [[a[0] + 1, a[1]], [a[0] - 1, a[1]], [a[0], a[1] - 1]], 'h_dry', {}); } }
    },
    bedroom(r, kind) {
      const rw = r.x1 - r.x0 + 1, dbl = (kind === 'master' && rw >= 4) || (kind === 'bed' && rw >= 5 && rnd() < 0.5), bw = dbl ? 2 : 1;
      let bed = null; for (const u of byMid(r)) { const uu = u - (bw >> 1); if (wallAbove(uu, r.y0) && put(r, uu, r.y0, 'h_bed', { c: blanket(), q: S.quilt && rnd() < 0.6, kid: kind === 'kids' }, bw, 2)) { bed = uu; break; } }
      if (bed == null) bed = (tryAt(r, sideCol(r, r.x0).concat(sideCol(r, r.x1)), 'h_bed', { c: blanket(), kid: kind === 'kids' }, 1, 2) || [null])[0];
      if (bed != null) tryAt(r, [[bed - 1, r.y0], [bed + bw, r.y0]], 'h_ns', { c: S.wood });
      const tops = topRow(r).filter(([u]) => bed == null || u < bed - 1 || u > bed + bw);
      if (!tryAt(r, tops.filter(([u]) => isF(u + 1, r.y0)), 'h_clo', { c: S.st === 'modern' ? '#f4f4f2' : S.st === 'ranch' ? '#8a5a32' : '#f0ece0' }, 2, 1)) tryAt(r, tops, 'h_clo', { c: '#f0ece0' });
      if (!tryAt(r, topRow(r), 'h_drs', { c: S.wood }, 2, 1)) tryAt(r, topRow(r).concat(sideCol(r, r.x0), sideCol(r, r.x1)), 'h_drs', { c: S.wood });
      if (kind === 'kids') { tryAt(r, sideCol(r, r.x1).concat(sideCol(r, r.x0)), 'h_toy', { k: ri(3) }); tryAt(r, sideCol(r, r.x0).concat(sideCol(r, r.x1)), 'h_desk', { c: '#c8a070' });
        const ru = Math.max(r.x0, ((r.x0 + r.x1) >> 1) - 1); hh.rugs.push({ x0: ru, y0: Math.min(r.y1, r.y0 + 2), x1: Math.min(r.x1, ru + 2), y1: Math.min(r.y1, r.y0 + 3), c1: pick(['#e87a7a', '#7ac87a', '#e8c050', '#b88ad8']), c2: '#f4f0e4', pat: 'braid' }); }
      else if (kind === 'master') { tryAt(r, corners(r).slice(2), 'h_plant', {}); if (rnd() < 0.5) tryAt(r, sideCol(r, r.x1), 'h_arm', { c: blanket(), pat: 'plain' }); }
      else if (rnd() < 0.4) tryAt(r, sideCol(r, r.x0).concat(sideCol(r, r.x1)), 'h_desk', { c: S.wood });
      if ((r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1) >= 24) { tryAt(r, sideCol(r, r.x1).reverse(), 'h_lamp', { c: '#f0e8d0' }); tryAt(r, sideCol(r, r.x0).reverse(), 'h_bks', {});
        if (kind === 'master' && bed != null) hh.rugs.push({ x0: Math.max(r.x0, bed - 1), y0: r.y0 + 2, x1: Math.min(r.x1, bed + bw), y1: Math.min(r.y1, r.y0 + 3), c1: S.rug.c1, c2: S.rug.c2, pat: S.rug.pat }); }
    },
    dining(r) {
      const rw = r.x1 - r.x0 + 1, rd = r.y1 - r.y0 + 1;
      tryAt(r, topRow(r).filter(([u]) => isF(u + 1, r.y0)).sort((p, q) => Math.abs(q[0] - (r.x0 + r.x1) / 2) - Math.abs(p[0] - (r.x0 + r.x1) / 2)), 'h_hutch', { c: S.wood }, 2, 1);
      const tw = rw >= 5 ? 2 : 1, th = rd >= 5 && rw >= 5 ? 2 : 1, ty = Math.max(r.y0 + 1, ((r.y0 + r.y1) >> 1) - (th >> 1));
      for (const u of byMid(r)) { const tx = u - (tw >> 1); if (put(r, tx, ty, 'h_dtab', { c: S.wood }, tw, th)) {
        for (let j = 0; j < th; j++) { put(r, tx - 1, ty + j, 'h_chair', { c: S.wood, o: 'r' }); put(r, tx + tw, ty + j, 'h_chair', { c: S.wood, o: 'l' }); }
        for (let i = 0; i < tw; i++) put(r, tx + i, ty + th, 'h_chair', { c: S.wood, o: 'u' }); break; } }
      tryAt(r, corners(r), 'h_plant', {});
    },
    bath(r) {
      const rw = r.x1 - r.x0 + 1, top = topRow(r);
      if (!(rw >= 3 && tryAt(r, top.filter(([u]) => isF(u + 1, r.y0)), 'h_tub', { c: pick(['#e8eef4', '#f0e0e8', '#e0ecd8', '#f4f0d8']) }, 2, 1))) tryAt(r, top.concat(corners(r)), 'h_shw', {});
      tryAt(r, topRow(r).concat(sideCol(r, r.x0), sideCol(r, r.x1)), 'h_toil', {});
      tryAt(r, sideCol(r, r.x1).concat(sideCol(r, r.x0), topRow(r)), 'h_bsink', { c: S.st === 'modern' ? '#f4f4f2' : S.cab });
      if (!laundry && (r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1) >= 12) { const a = tryAt(r, sideCol(r, r.x0).concat(sideCol(r, r.x1)), 'h_wash', {}); if (a) { laundry = true; tryAt(r, [[a[0], a[1] + 1], [a[0], a[1] - 1]], 'h_dry', {}); } }
    },
    laundry(r) { const a = tryAt(r, topRow(r), 'h_wash', {}); if (a) { laundry = true; tryAt(r, [[a[0] + 1, a[1]], [a[0] - 1, a[1]]], 'h_dry', {}); }
      tryAt(r, topRow(r).concat(corners(r)), 'h_wh', {}); if (!stairs) stairs = !!tryAt(r, topRow(r), 'h_stair', { up: S.two }, 1, 2); },
    den(r) { tryAt(r, topRow(r), 'h_desk', { c: S.wood }); tryAt(r, topRow(r).concat(sideCol(r, r.x0)), 'h_bks', {}); tryAt(r, topRow(r), 'h_bks', {});
      tryAt(r, sideCol(r, r.x1).concat(sideCol(r, r.x0)), 'h_arm', { c: shade(S.sofa, 0.1), pat: 'plain' }); tryAt(r, corners(r), 'h_plant', {}); },
    hall(r) {
      const vert = r.x0 === r.x1;
      if (vert) { if (!(stairs = !!put(r, r.x0, r.y0, 'h_stair', { up: S.two }, 1, 2))) put(r, r.x0, r.y0, 'h_clo', { c: S.st === 'ranch' ? '#8a5a32' : '#f0ece0' }); }
      else tryAt(r, [[r.x0, r.y0], [r.x1, r.y0]], 'h_plant', {});
    },
  };
  // living room and kitchen first (they need the room), then the rest from the biggest
  const order = hh.rooms.slice().sort((p, q) => { const pr = t => ({ living: 0, kitchen: 1, hall: 2, dining: 3 })[t] ?? 4; return pr(p.type) - pr(q.type) || (q.x1 - q.x0 + 1) * (q.y1 - q.y0 + 1) - (p.x1 - p.x0 + 1) * (p.y1 - p.y0 + 1); });
  for (const r of order) { const f = furnish[r.type] || (r.type === 'master' || r.type === 'bed' || r.type === 'kids' ? furnish.bedroom : null); if (f) f.call(furnish, r, r.type); }
  if (!stairs) for (const r of order) if ((r.type === 'living' || r.type === 'den' || r.type === 'dining' || r.type === 'kitchen') && tryAt(r, topRow(r).reverse(), 'h_stair', { up: S.two }, 1, 2)) break;
  // sometimes somebody's home: a generic resident, nobody real
  if (living && rnd() < 0.4) {
    const so = [...hh.M.values()].find(m => m.t === 'h_sofa' || m.t === 'h_arm'), list = [];
    if (so) list.push([so.ax - 1, so.ay], [so.ax + so.w, so.ay], [so.ax, so.ay + 1], [so.ax - 1, so.ay + 1]);
    for (let v = living.y0 + 1; v < living.y1; v++) for (let u = living.x0; u <= living.x1; u++) list.push([u, v]);
    const at = tryAt(living, list, 'N', {});
    if (at) { const folk = 'h_res' + ri(4), line = HOME_HELLO[ri(HOME_HELLO.length)]; hh.tvOn = line === HOME_HELLO[0] || rnd() < 0.5;
      Fm.npcs.push({ x: at[0], y: at[1], folk, talk: () => say([['', line]]) }); }
  }
}
const HOME_HELLO = ['Oh — hello. Just watching the game.', 'Oh! Hi. Shut the door behind you, would you? The heat\'s on.', 'Hello there. Don\'t mind the mess.',
  'Oh, hi. Coffee\'s on, if you want a cup.', 'Hi. If you\'re selling something, we\'re all set, thanks.', 'Oh — hi. I was just about to start supper.'];
Object.assign(FOLKS, {   // the people at home: generic, everyday clothes
  h_res0: { skin: '#e2b48e', hair: '#6a4a2a', shirt: '#7a8a9a', shirt2: '#6a7a8a', pants: '#3a4a6a', shoes: '#2a2224' },
  h_res1: { skin: '#ecc19c', hair: '#c8c4bc', shirt: '#a85a5a', shirt2: '#984a4a', pants: '#4a4a52', shoes: '#5a3a24', glasses: 1 },
  h_res2: { skin: '#c99878', hair: '#1e1612', shirt: '#4a7a5a', shirt2: '#3a6a4a', pants: '#3a3a44', shoes: '#e8e8ea' },
  h_res3: { skin: '#d9a77c', hair: '#8a5a2a', shirt: '#c8a050', shirt2: '#b89040', pants: '#2a3a5a', shoes: '#2a2224', extra: 'cap' },
});
const HOME_ROOM = { living: 'LIVING ROOM', dining: 'DINING ROOM', kitchen: 'KITCHEN', hall: 'HALLWAY', bath: 'BATHROOM', laundry: 'LAUNDRY', den: 'DEN', master: 'BEDROOM', bed: 'BEDROOM', kids: 'KIDS\' ROOM' };
function homeZone(Fm, x, y) {
  const hh = Fm.hh; if (!hh) return null; const z = hh.Z[y * Fm.W + x];
  if (z >= 0) hh.last = HOME_ROOM[hh.rooms[z].type] || 'HOUSE'; return hh.last;
}
// ---------- looking ----------
function homeLook(Fm, x, y, t, n) {
  const hh = Fm.hh; if (!hh) return false;
  if (n) { if (n.talk) n.talk(Fm, n); return true; }
  const m = hh.M.get(x + ',' + y), S = hh.S;
  if (t === 'O') { say([['', 'The front yard, through the window.']]); return true; }
  if (!m || t[0] !== 'h') return false;
  const sofa = { plaid: 'A worn plaid couch.', floral: 'A flowered couch.', afghan: 'A couch with a crocheted afghan folded over the back.', cord: 'A brown corduroy couch.', plain: S.st === 'modern' ? 'A grey couch with throw pillows.' : 'A comfortable old couch.' };
  const L = {
    h_sofa: sofa[m.pat] || sofa.plain, h_arm: 'An armchair.', h_ctab: ['A coffee table. A remote and a coaster.', 'A coffee table with a stack of magazines.', 'A coffee table. A bowl of mints.'][m.v || 0],
    h_tv: hh.tvOn ? 'The TV is on, with the sound turned low.' : m.v === 'console' ? 'A big wooden console TV. It\'s off.' : 'The TV is off.',
    h_fire: m.v === 'stone' ? 'A fieldstone fireplace. The embers are low.' : m.v === 'modern' ? 'A gas fireplace behind glass.' : 'A brick fireplace. The embers are low.',
    h_piano: 'An upright piano. A hymnal and a book of scales on the stand.', h_bks: 'A bookshelf: paperbacks, a dictionary, a road atlas.', h_lamp: 'A floor lamp.', h_plant: 'A potted plant.',
    h_coat: 'Coats on hooks, boots on the mat.', h_ctr: 'The kitchen counter.', h_sink: 'The kitchen sink. A dish towel hangs from the faucet.', h_stove: 'The stove. Something smells good.',
    h_fridge: 'The fridge hums.', h_dtab: hh.rooms[m.r] && hh.rooms[m.r].type === 'dining' ? 'The dining table, set for supper.' : 'The kitchen table.', h_chair: 'A kitchen chair.', h_isl: 'A kitchen island.',
    h_bed: m.kid ? 'A kid\'s bed, made, more or less.' : m.q ? 'A bed with a patchwork quilt.' : m.w > 1 ? 'A made bed.' : 'A single bed.',
    h_ns: 'A nightstand with a lamp and an alarm clock.', h_drs: 'A dresser.', h_clo: 'A closet. You leave it closed.', h_toy: 'A toy box, overflowing.', h_desk: 'A desk.',
    h_tub: 'A bathtub with a shower curtain.', h_shw: 'A shower stall.', h_toil: 'The toilet.', h_bsink: 'The bathroom sink and a mirror.', h_wash: 'The washing machine.', h_dry: 'The dryer.',
    h_wh: 'The water heater.', h_hutch: 'A china hutch: the good dishes, behind glass.', h_stair: m.up ? 'Stairs up to the second floor. You stay downstairs.' : 'Stairs down to the basement. You stay up here.',
  }[t];
  if (L) { say([['', L]]); return true; }
  return false;
}
// ---------- drawing: floors, walls, furniture ----------
function homeFloorKind(k, c1, c2, X, Y, h) {
  switch (k) {
    case 'wood': qp(c1, X, Y, 24, 24); for (let i = 0; i < 24; i += 6) qp(c2, X, Y + i + 5, 24, 1); qp(c2, X + ((Y / 24 * 7 + X / 24 * 3) % 4) * 6, Y, 1, 24); if (h % 4 === 0) qp(shade(c1, 0.08), X + h % 20, Y + (h >> 5) % 20, 3, 1); break;
    case 'carpet': qp(c1, X, Y, 24, 24); if (h % 2) qp(c2, X + h % 22, Y + (h >> 5) % 22, 2, 1); if (h % 5 === 0) qp(shade(c1, 0.1), X + (h >> 3) % 22, Y + (h >> 8) % 22, 1, 1); break;
    case 'shag': qp(c1, X, Y, 24, 24); for (let i = 0; i < 7; i++) { const q = hash(h + i, 7); qp(i % 2 ? c2 : shade(c1, 0.12), X + q % 23, Y + (q >> 5) % 22, 1, 2); } break;
    case 'check': qp(c1, X, Y, 24, 24); qp(c2, X, Y, 12, 12); qp(c2, X + 12, Y + 12, 12, 12); break;
    case 'hex': qp(c1, X, Y, 24, 24); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) qp(c2, X + i * 6 + (j % 2) * 3, Y + j * 6, 1, 1); qp(c2, X, Y + 23, 24, 1); break;
    case 'brick': qp(c1, X, Y, 24, 24); for (let j = 0; j < 3; j++) { qp(c2, X, Y + j * 8 + 7, 24, 1); qp(c2, X + (j % 2) * 8 + 4, Y + j * 8, 1, 7); qp(c2, X + (j % 2) * 8 + 16, Y + j * 8, 1, 7); } break;
    default: qp(c1, X, Y, 24, 24); qp(c2, X, Y + 11, 24, 1); qp(c2, X + 11, Y, 1, 24); qp(c2, X, Y + 23, 24, 1); qp(c2, X + 23, Y, 1, 24);
  }
}
function homeRoomFloor(hh, z) { const S = hh.S, t = z >= 0 ? hh.rooms[z].type : 'living';
  return t === 'kitchen' || t === 'laundry' ? S.kitchen : t === 'bath' ? S.bath : t === 'living' || t === 'hall' || t === 'den' || t === 'dining' ? S.living : S.bed; }
function homeWallCol(hh, z) { const S = hh.S; if (z < 0) return S.walls[0]; const r = hh.rooms[z];
  return r.type === 'kitchen' ? S.walls[1] : r.type === 'bath' ? S.walls[(z + 2) % S.walls.length] : r.type === 'living' || r.type === 'hall' ? S.walls[0] : S.walls[(z * 3 + 1) % S.walls.length]; }
{ const _ft = roomFloorTile; roomFloorTile = function (Fm, t, x, y) {
    const hh = Fm.hh; if (!hh) return _ft(Fm, t, x, y);
    const X = x * 24, Y = y * 24, z = hh.Z[y * Fm.W + x], h = hash(x * 11 + Fm.seed, y * 7 + 5), [k, c1, c2] = homeRoomFloor(hh, t === 'e' ? hh.Z[(y - 1) * Fm.W + x] : z);
    homeFloorKind(k, c1, c2, X, Y, h);
    for (const g of hh.rugs) if (x >= g.x0 && x <= g.x1 && y >= g.y0 && y <= g.y1) {
      const l = x === g.x0, r = x === g.x1, tp = y === g.y0, bt = y === g.y1, x0 = X + (l ? 3 : 0), y0 = Y + (tp ? 3 : 0), ww = 24 - (l ? 3 : 0) - (r ? 3 : 0), hh2 = 24 - (tp ? 3 : 0) - (bt ? 3 : 0);
      qp(g.c1, x0, y0, ww, hh2);
      if (g.pat === 'braid') { for (let i = 2; i < hh2; i += 4) qp((i + y) % 8 < 4 ? g.c2 : shade(g.c1, 0.2), x0, y0 + i, ww, 1); }
      else { if (tp) qp(g.c2, x0, y0 + 2, ww, 2); if (bt) qp(g.c2, x0, y0 + hh2 - 4, ww, 2); if (l) qp(g.c2, x0 + 2, y0, 2, hh2); if (r) qp(g.c2, x0 + ww - 4, y0, 2, hh2);
        if (g.pat === 'orient' && (x + y) % 2) { qp(g.c2, X + 10, Y + 10, 4, 4); qp(shade(g.c1, 0.2), X + 11, Y + 11, 2, 2); } }
      break; }
    if (x === Fm.ex && y === Fm.ey) { qp('#5a4a3a', X + 3, Y + 6, 18, 14); qp('#6a5a48', X + 4, Y + 7, 16, 12); }
    if (t === 'e') { qp('#3a2a1e', X + 2, Y + 3, 20, 14); qp('#5a4030', X + 3, Y + 4, 18, 12); }
  }; }
{ const _wf = roomWallFace; roomWallFace = function (Fm, x, y) {
    const hh = Fm.hh; if (!hh) return _wf(Fm, x, y);
    const S = hh.S, X = x * 24, Y = y * 24, z = hh.Z[(y + 1) * Fm.W + x], wall = homeWallCol(hh, z), r = z >= 0 ? hh.rooms[z] : null;
    qp(wall, X, Y - 9, 24, 33); qp(shade(wall, -0.06), X, Y - 9, 24, 2); qp('#2a2224', X, Y - 9, 24, 1);
    if (S.panel && r && (r.type === 'living' || r.type === 'den')) { qp('#8a5a32', X, Y - 7, 24, 31); for (let i = 3; i < 24; i += 6) qp('#6a4428', X + i, Y - 7, 1, 31); }
    if (r && r.type === 'bath') { qp(S.bath[1], X, Y + 4, 24, 14); for (let i = 0; i < 24; i += 6) qp(shade(S.bath[1], -0.12), X + i, Y + 4, 1, 14); qp(shade(S.bath[1], -0.2), X, Y + 4, 24, 1); }
    qp(S.trim, X, Y + 19, 24, 5); qp(shade(S.trim, -0.3), X, Y + 23, 24, 1);
    const outside = !Fm.R[y - 1] || Fm.R[y - 1][x] === ' ' || Fm.R[y - 1][x] === undefined, k = hash(x * 13 + Fm.seed, y * 3 + 1) % 10;
    if (outside && (x + (Fm.seed & 1)) % 4 === 1) {   // a window in the back wall, curtains drawn back
      qp('#f4f0e6', X + 3, Y - 6, 18, 18); qp('#9ab8d0', X + 5, Y - 4, 14, 13); qp('#f4f0e6', X + 11, Y - 4, 2, 13); qp('rgba(255,255,255,.35)', X + 6, Y - 3, 3, 6);
      const cc = S.blankets[(Fm.seed + x) % S.blankets.length]; qp(cc, X + 2, Y - 7, 4, 18); qp(cc, X + 18, Y - 7, 4, 18); qp(shade(cc, -0.3), X + 2, Y - 8, 20, 2); return; }
    if (!r) return;
    if (r.type === 'kitchen' && k === 0) { qp('#2a2224', X + 8, Y - 4, 9, 9); qp('#f4f2ea', X + 9, Y - 3, 7, 7); qp('#2a2224', X + 12, Y - 2, 1, 3); qp('#2a2224', X + 12, Y, 2, 1); }
    else if (r.type === 'bath' && k < 3) { qp('#c8ccd2', X + 4, Y - 2, 16, 1); qp(S.blankets[k + 2], X + 6, Y - 1, 12, 9); }
    else if (k === 1 || k === 2) {   // a painting: a lake, pines, a red barn; nobody's portrait
      qp('#5a3a22', X + 5, Y - 5, 14, 12); qp('#9ac0e0', X + 6, Y - 4, 12, 5); qp(k === 1 ? '#3a6a8a' : '#6a9a4a', X + 6, Y + 1, 12, 5);
      if (k === 1) { qp('#2e5a3a', X + 7, Y - 2, 2, 4); qp('#2e5a3a', X + 14, Y - 3, 2, 5); } else { qp('#a83a2a', X + 9, Y - 2, 5, 4); qp('#f4f0e4', X + 11, Y, 1, 2); } }
    else if (k === 3 && r.type !== 'hall') { qp('#3a3a3e', X + 10, Y - 4, 4, 1); qp(['#e8c870', '#c8a060', '#7aa0c8'][x % 3], X + 6, Y - 3, 12, 9); qp('#f4f0e4', X + 8, Y - 1, 8, 5); }   // a sampler
  }; }
{ const _cp = roomCap; roomCap = function (Fm, x, y) { const hh = Fm.hh; if (!hh) return _cp(Fm, x, y);
    const X = x * 24, Y = y * 24; qp('#1c1618', X, Y, 24, 24); qp(hh.S.cap, X + 4, Y, 16, 24); qp(shade(hh.S.cap, -0.15), X + 4, Y + 20, 16, 4); }; }
{ const _wn = roomWindow; roomWindow = function (Fm, x, y) { _wn(Fm, x, y); const hh = Fm.hh; if (!hh) return;
    const X = x * 24, Y = y * 24, cc = hh.S.blankets[(Fm.seed + 3) % hh.S.blankets.length]; qp(cc, X + 1, Y + 2, 4, 15); qp(cc, X + 19, Y + 2, 4, 15); qp(shade(cc, -0.3), X + 1, Y + 1, 22, 2); }; }
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) { if (Fm.hh && typeof t === 'string' && t[0] === 'h' && t[1] === '_') return homeProp(Fm, t, x, y); return _rp(Fm, t, x, y); }; }
function homeProp(Fm, t, x, y) {
  const m = Fm.hh.M.get(x + ',' + y); if (!m || m.ax !== x || m.ay !== y) return;
  const S = Fm.hh.S, X = x * 24, Y = y * 24, Wd = m.w * 24, q = (c, a, e, w, h) => qp(c, X + a, Y + e, w, h), h = hash(x * 5 + Fm.seed, y * 9 + 2);
  const sh = (w = Wd, hh2 = 0) => q('rgba(0,0,0,.22)', 1, 19 + hh2, w - 2, 4);
  switch (t) {
    case 'h_sofa': case 'h_arm': {   // seen from behind, facing the TV
      const c = m.c, dk = shade(c, -0.25), lt = shade(c, 0.15); sh();
      q(lt, 4, -2, Wd - 8, 8); for (let i = 1; i < m.w; i++) q(dk, i * 24, -2, 1, 7);
      q(c, 2, 4, Wd - 4, 15); q(lt, 2, 4, Wd - 4, 2); q(dk, 2, 17, Wd - 4, 2);
      q(c, 0, -1, 5, 20); q(c, Wd - 5, -1, 5, 20); q(lt, 0, -1, 5, 2); q(lt, Wd - 5, -1, 5, 2);
      if (m.pat === 'plaid') { for (let i = 4; i < Wd - 4; i += 6) q(shade(c, -0.35), i, 4, 1, 14); q(shade(c, 0.3), 2, 9, Wd - 4, 1); q(shade(c, 0.3), 2, 14, Wd - 4, 1); }
      else if (m.pat === 'floral') for (let i = 6; i < Wd - 6; i += 7) { q('#f0d8c8', i, 8 + (i % 3) * 2, 3, 3); q('#6a8a4a', i + 3, 10 + (i % 3) * 2, 2, 1); }
      else if (m.pat === 'cord') for (let i = 4; i < Wd - 4; i += 2) q(dk, i, 5, 1, 12);
      else if (m.pat === 'afghan' && t === 'h_sofa') { for (let i = 0; i < Wd - 16; i += 4) q(['#d8a040', '#a83a32', '#3a6a4a', '#f4f0e4'][(i >> 2) % 4], 8 + i, 3, 4, 7); }
      q('#3a2a1a', 3, 19, 2, 2); q('#3a2a1a', Wd - 5, 19, 2, 2); break; }
    case 'h_ctab': { sh(); const wd = S.wood; q(wd, 2, 5, Wd - 4, 8); q(shade(wd, 0.15), 2, 5, Wd - 4, 1); q(shade(wd, -0.3), 2, 12, Wd - 4, 3); q(shade(wd, -0.35), 3, 15, 2, 4); q(shade(wd, -0.35), Wd - 5, 15, 2, 4);
      if (m.v === 0) { q('#2a2a2e', 8, 7, 5, 2); q('#c8b898', Wd - 10, 7, 4, 3); } else if (m.v === 1) { q('#c84a3a', 6, 6, 8, 5); q('#3a6ab8', 7, 7, 7, 4); } else { q('#e8e4dc', Wd / 2 - 3, 6, 6, 4); q('#d84a4a', Wd / 2 - 1, 6, 2, 2); } break; }
    case 'h_tv': {
      const on = Fm.hh.tvOn, scr = on ? ['#3a6ab0', '#4a7ac0', '#3a8a5a', '#5a8ad0'][(frame >> 4) % 4] : '#1e2a2a';
      if (m.v === 'flat') { sh(); q('#3a3a40', 1, 9, 22, 10); q('#4a4a52', 1, 9, 22, 1); q('#16161a', 0, -14, 24, 17); q(scr, 1, -13, 22, 14); q('#2a2a30', 10, 3, 4, 6); if (!on) q('rgba(255,255,255,.08)', 2, -12, 6, 12); }
      else if (m.v === 'console') { sh(); q('#6a4428', 0, -8, 24, 27); q('#8a5a30', 0, -8, 24, 2); q('#2a2a2e', 3, -5, 14, 12); q(scr, 4, -4, 12, 10); for (let i = 0; i < 4; i++) q('#4a2e1a', 19, -4 + i * 3, 3, 1); q('#3a2a1a', 2, 10, 20, 6); q('#4a2e1a', 2, 19, 3, 2); q('#4a2e1a', 19, 19, 3, 2); }
      else { sh(); q('#5a3a22', 1, 6, 22, 14); q('#6a4428', 1, 6, 22, 2); q('#3a2414', 3, 10, 18, 1); q('#2a2a2e', 3, -11, 18, 17); q(scr, 5, -9, 14, 12); q('rgba(255,255,255,.12)', 6, -8, 3, 10);
        if (S.st === 'farm' || S.st === 'bung') { q('#8a8e96', 8, -17, 1, 6); q('#8a8e96', 15, -17, 1, 6); q('#8a8e96', 7, -18, 1, 1); q('#8a8e96', 16, -18, 1, 1); } }
      if (on) q('rgba(120,170,255,.08)', -6, 18, 36, 20);
      break; }
    case 'h_fire': {
      if (m.v === 'modern') { q('#3a3a40', 0, -6, 48, 26); q('#16161a', 6, 2, 36, 12); q((frame >> 3) % 2 ? '#e8823a' : '#f0a040', 10, 10, 28, 3); q('#ecece8', -1, -8, 50, 3); break; }
      const st = m.v === 'stone'; q(st ? '#8a8680' : '#8a3a2a', 0, -18, 48, 38);
      for (let j = 0; j < 7; j++) for (let i = 0; i < 6; i++) q(st ? (hash(i + x, j) % 2 ? '#9a968e' : '#7a766e') : (j % 2 ? '#7a2e22' : '#9a4a36'), i * 8 + (j % 2) * 4 + 1, -17 + j * 5, st ? 6 : 7, 4);
      q('#5a3a22', -2, -20, 52, 4); q('#6a4428', -2, -20, 52, 1); q('#1a1214', 14, 0, 20, 18); q('#2a1e1a', 15, 1, 18, 3);
      q((frame >> 3) % 2 ? '#e86a20' : '#c84a18', 18, 13, 12, 4); q('#f0a030', 21 + ((frame >> 4) % 3), 12, 3, 2); q('#5a3a22', 17, 16, 14, 2);
      q('#6a6a66', 4, 18, 40, 3); q('#c8a050', 6, -24, 4, 4); q('#3a6a8a', 38, -25, 5, 5); break; }
    case 'h_piano': { sh(); q('#3a2418', 0, -14, 48, 33); q('#4a3020', 0, -14, 48, 2); q('#f4f0e4', 3, 4, 42, 4); for (let i = 0; i < 12; i++) if (i % 7 !== 2 && i % 7 !== 6) q('#16161a', 5 + i * 3.4, 4, 2, 2); q('#2a1810', 3, 8, 42, 2);
      q('#f4f0e4', 18, -10, 12, 8); q('#c8a050', 20, -8, 8, 1); q('#3a2418', 3, 17, 2, 3); q('#3a2418', 43, 17, 2, 3); break; }
    case 'h_bks': { sh(); q('#5a3a22', 0, -14, 24, 34); q('#6a4428', 0, -14, 24, 2);
      for (let r = 0; r < 4; r++) { const sy = Y - 11 + r * 8; qp('#2e1c10', X + 1, sy + 6, 22, 1); for (let i = 0; i < 7; i++) { const z = hash(x * 7 + i + Fm.seed, y * 5 + r); if (z % 9 === 0) continue; qp(ROOM_SPINE[z % 8], X + 1 + i * 3, sy + 1 + (z % 2), 2, 5 - (z % 2)); } } break; }
    case 'h_lamp': { q('rgba(0,0,0,.2)', 7, 18, 10, 3); q('#3a3a3e', 11, -2, 2, 20); q('#2a2a2e', 8, 18, 8, 2); q(m.c, 5, -12, 14, 10); q(shade(m.c, -0.15), 5, -4, 14, 2); q('rgba(255,240,190,.18)', 2, -2, 20, 6); break; }
    case 'h_plant': { q('#a0502a', 8, 11, 8, 8); q('#8a4422', 8, 11, 8, 2); q('#2e7a38', 4, -6, 16, 17); q('#4e9a58', 6, -4, 5, 4); q('#3e8a48', 13, 0, 4, 4); q('#256a30', 9, -9, 6, 4); break; }
    case 'h_coat': { q('rgba(0,0,0,.2)', 4, 19, 16, 3); q('#5a3a22', 11, -14, 2, 33); q('#5a3a22', 6, -14, 12, 2); q(m.c, 5, -12, 6, 15); q(shade(m.c, -0.2), 5, -12, 6, 2); q('#5a6a7a', 13, -11, 6, 13); q('#c83a2a', 8, -16, 5, 3);
      q('#2a2224', 3, 16, 6, 4); q('#3a2a1e', 15, 16, 6, 4); break; }
    case 'h_ctr': case 'h_sink': {
      const cab = m.c, top = S.top; sh(); q(cab, 0, 2, 24, 18); q(shade(cab, -0.25), 0, 18, 24, 2); q(shade(cab, -0.18), 11, 4, 1, 13); q('#c8ccd2', 8, 6, 2, 1); q('#c8ccd2', 14, 6, 2, 1);
      q(top, 0, -2, 24, 5); q(shade(top, 0.12), 0, -2, 24, 1);
      if (t === 'h_sink') { q('#9aa0a8', 4, -1, 16, 3); q('#c8ccd2', 5, -1, 14, 2); q('#9aa0a8', 11, -7, 2, 6); q('#9aa0a8', 11, -7, 5, 1); q('#f4f0e4', 18, 2, 4, 7); q('#c84a3a', 18, 4, 4, 1);
        q('#f4f0e6', 3, -26, 18, 16); q('#9ab8d0', 5, -24, 14, 12); q('#f4f0e6', 11, -24, 2, 12); q(S.blankets[(Fm.seed + 1) % 8], 2, -27, 20, 4); }
      else { q(cab, 0, -26, 24, 14); q(shade(cab, -0.18), 11, -25, 1, 12); q(shade(cab, 0.08), 0, -26, 24, 1); q('rgba(0,0,0,.18)', 0, -12, 24, 2); q('#c8ccd2', 9, -16, 1, 2); q('#c8ccd2', 14, -16, 1, 2);
        if (m.k === 1) { q('#c8ccd2', 4, -8, 9, 6); q('#3a3a3e', 6, -9, 2, 1); } else if (m.k === 2) { q('#2a2a2e', 6, -10, 7, 8); q('#5a3a22', 8, -6, 3, 3); } else if (m.k === 3) { q('#e8d8b8', 3, -6, 14, 4); q('#e8c040', 5, -9, 4, 4); q('#c84a3a', 10, -8, 4, 3); }
        else if (m.k === 4) { for (let i = 0; i < 3; i++) q('#e8e4dc', 3 + i * 6, -8 - i, 5, 6 + i); } }
      break; }
    case 'h_stove': { const c = m.c; sh(); q(c, 1, -2, 22, 22); q(shade(c, 0.1), 1, -2, 22, 1); for (const [a, e] of [[3, -1], [14, -1], [3, 2], [14, 2]]) { q('#2a2a2e', a, e, 7, 2); }
      q('#2a2a2e', 1, 5, 22, 2); for (let i = 0; i < 4; i++) q('#c8ccd2', 4 + i * 5, 5, 2, 2);
      q(shade(c, -0.12), 3, 8, 18, 10); q('#2a2a2e', 6, 10, 12, 5); q('#c8ccd2', 5, 8, 14, 1); q(S.cab === '#6a4428' ? '#6a4428' : '#b8bcc4', 0, -26, 24, 9); q('rgba(0,0,0,.2)', 1, -17, 22, 2); break; }
    case 'h_fridge': { const c = m.c; q('rgba(0,0,0,.22)', 1, 19, 22, 4); q(c, 1, -20, 22, 40); q(shade(c, 0.1), 1, -20, 22, 1); q(shade(c, -0.2), 1, -6, 22, 1); q(shade(c, -0.2), 1, 18, 22, 2);
      q('#8a8e96', 18, -16, 2, 8); q('#8a8e96', 18, -2, 2, 10); for (let i = 0; i < 3; i++) q(['#e84a4a', '#3a7ad8', '#f0c040', '#5ab05a'][(h + i) % 4], 4 + i * 4, -14 + (i % 2) * 4, 3, 3);
      if (h % 2) { q('#f4f0e4', 5, -1, 8, 9); q('#3a3a3e', 6, 1, 6, 1); q('#3a3a3e', 6, 3, 5, 1); } break; }
    case 'h_isl': { sh(); q(m.c, 0, 2, Wd, 18); q(shade(m.c, -0.25), 0, 18, Wd, 2); q(S.top, -1, -3, Wd + 2, 6); q(shade(S.top, 0.12), -1, -3, Wd + 2, 1); for (let i = 1; i < m.w * 2; i++) q(shade(m.c, -0.18), i * 12, 4, 1, 13);
      q('#c8a050', 6, -6, 8, 4); q('#e84a3a', 7, -7, 3, 2); q('#5ab05a', 10, -7, 3, 2); break; }
    case 'h_dtab': { const Hd = m.h * 24, wd = m.c === '#3a3a40' ? '#c8b498' : shade(m.c, 0.35); q('rgba(0,0,0,.2)', 3, Hd - 5, Wd - 6, 4); q(wd, 2, 2, Wd - 4, Hd - 8); q(shade(wd, 0.12), 2, 2, Wd - 4, 1); q(shade(wd, -0.3), 2, Hd - 7, Wd - 4, 3);
      q(shade(wd, -0.4), 4, Hd - 4, 2, 4); q(shade(wd, -0.4), Wd - 6, Hd - 4, 2, 4);
      for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) { q('#f4f2ea', 6 + i * 24, 5 + j * 24, 8, 6); q('#d8d4c8', 8 + i * 24, 7 + j * 24, 4, 2); }
      q('#c8a050', Wd / 2 - 3, Hd / 2 - 6, 6, 4); q('#e84a3a', Wd / 2 - 2, Hd / 2 - 7, 2, 2); break; }
    case 'h_chair': { const c = shade(m.c, 0.2); q('rgba(0,0,0,.2)', 6, 18, 12, 3);
      if (m.o === 'u') { q(c, 6, 4, 12, 6); q(shade(c, -0.3), 6, 10, 12, 2); for (let i = 0; i < 4; i++) q(c, 7 + i * 3, 2, 1, 12); q(shade(c, -0.2), 6, 13, 12, 3); q(shade(c, -0.4), 7, 16, 2, 3); q(shade(c, -0.4), 15, 16, 2, 3); }
      else { const bx = m.o === 'r' ? 6 : 15; q(c, 7, 6, 10, 6); q(shade(c, -0.3), 7, 12, 10, 2); q(shade(c, -0.15), bx, -4, 3, 16); q(shade(c, -0.4), 8, 14, 2, 5); q(shade(c, -0.4), 14, 14, 2, 5); }
      break; }
    case 'h_bed': {
      const Hd = 48, wd = S.wood, c = m.c; q('rgba(0,0,0,.22)', 1, Hd - 6, Wd - 2, 4);
      q(wd, 0, -10, Wd, 14); q(shade(wd, 0.15), 0, -10, Wd, 2); q(shade(wd, -0.2), 2, -6, Wd - 4, 1);
      q('#f4f2ea', 2, 2, Wd - 4, Hd - 8); const pw = m.w > 1 ? 18 : 16; for (let i = 0; i < m.w; i++) { q('#ffffff', 4 + i * 22 + (m.w > 1 ? 1 : 0), 3, pw, 7); q('#d8d8d4', 4 + i * 22 + (m.w > 1 ? 1 : 0), 9, pw, 1); }
      q(c, 1, 13, Wd - 2, Hd - 19); q(shade(c, 0.2), 1, 13, Wd - 2, 3); q(shade(c, -0.25), 1, Hd - 8, Wd - 2, 2);
      if (m.q) for (let j = 0; j < 4; j++) for (let i = 0; i < m.w * 3; i++) if ((i + j) % 2) q(S.blankets[(i * 3 + j + h) % 8], 2 + i * 7, 17 + j * 6, 7, 6);
      if (m.kid) { q('#f0d040', 4, 22, 5, 5); q('#e84a4a', Wd - 10, 28, 5, 4); }
      q(wd, 0, Hd - 8, Wd, 4); q(shade(wd, -0.3), 1, Hd - 4, 2, 3); q(shade(wd, -0.3), Wd - 3, Hd - 4, 2, 3); break; }
    case 'h_ns': { sh(); const wd = shade(m.c, 0.1); q(wd, 3, 2, 18, 17); q(shade(wd, 0.15), 3, 2, 18, 2); q(shade(wd, -0.25), 4, 9, 16, 1); q('#c8a050', 11, 6, 2, 1);
      q('#8a6a4a', 7, -3, 4, 5); q('#e8d8a8', 5, -10, 8, 7); q('#2a2a2e', 14, -1, 6, 3); q('#e84a3a', 15, 0, 3, 1); break; }
    case 'h_drs': { sh(); const wd = shade(m.c, 0.1); q(wd, 1, -6, Wd - 2, 26); q(shade(wd, 0.15), 1, -6, Wd - 2, 2);
      for (let r = 0; r < 3; r++) { q(shade(wd, -0.25), 2, -1 + r * 7, Wd - 4, 1); for (let i = 0; i < m.w; i++) q('#c8a050', 10 + i * 24, 2 + r * 7, 3, 1); }
      if (m.w > 1) { q('#9aa0a8', 12, -24, 24, 17); q('#cfe0e8', 14, -22, 20, 13); q('rgba(255,255,255,.35)', 16, -21, 3, 10); } else { q('#8a5a6a', 5, -10, 8, 4); q('#f4f0e4', 15, -11, 4, 5); } break; }
    case 'h_clo': { const c = m.c, w = Wd; q(shade(c, -0.25), 0, -16, w, 36); q(c, 2, -14, w - 4, 34);
      for (let i = 0; i < m.w * 2; i++) { q(shade(c, -0.15), 2 + i * 11, -14, 1, 34); q(shade(c, -0.1), 4 + i * 11, -11, 6, 12); q(shade(c, -0.1), 4 + i * 11, 4, 6, 12); }
      q('#c8a050', w / 2 - 3, 2, 2, 3); q('#c8a050', w / 2 + 1, 2, 2, 3); break; }
    case 'h_hutch': { sh(); const wd = shade(m.c, 0.1); q(wd, 1, -22, 46, 42); q(shade(wd, 0.15), 0, -24, 48, 3); q(shade(wd, -0.25), 1, 4, 46, 2);
      for (let i = 0; i < 2; i++) { q('#cfe0e8', 4 + i * 22, -19, 18, 20); q(shade(wd, -0.2), 13 + i * 22, -19, 1, 20); for (let r = 0; r < 2; r++) { q('#8a6a4a', 4 + i * 22, -10 + r * 9, 18, 1); for (let k = 0; k < 3; k++) q(['#f4f2ea', '#7aa0c8', '#e8d8b8'][(k + r + i) % 3], 5 + i * 22 + k * 6, -17 + r * 9, 5, 6); } }
      for (let i = 0; i < 4; i++) q(shade(wd, -0.2), 2 + i * 11, 7, 10, 1); q('#c8a050', 12, 11, 3, 1); q('#c8a050', 34, 11, 3, 1); break; }
    case 'h_toy': { sh(); const c = ['#c84a3a', '#3a7ad8', '#e8a030'][m.k || 0]; q(c, 3, 4, 18, 15); q(shade(c, 0.2), 3, 4, 18, 2); q(shade(c, -0.3), 3, 17, 18, 2);
      q('#3a7ad8', 5, -2, 7, 7); q('#f4f0e4', 7, 0, 2, 2); q('#f0d040', 13, -1, 5, 5); q('#5ab05a', 15, 1, 5, 4); q('#e84a4a', 18, 14, 5, 5); break; }
    case 'h_desk': { sh(); const wd = shade(m.c, 0.1); q(wd, 1, 2, 22, 5); q(shade(wd, 0.15), 1, 2, 22, 1); q(shade(wd, -0.2), 2, 7, 6, 12); q(shade(wd, -0.2), 18, 7, 4, 12); q(shade(wd, -0.35), 3, 10, 4, 1);
      if (h % 2) { q('#2a2c34', 8, -8, 10, 9); q('#5a9ad8', 9, -7, 8, 6); } else { q('#3a7a3a', 4, -6, 2, 8); q('#e8d8a8', 2, -9, 7, 4); q('#f4f0e4', 12, -1, 8, 3); q('#c84a3a', 13, -2, 6, 1); } break; }
    case 'h_tub': { q('rgba(0,0,0,.18)', 1, 18, 46, 4); q('#f4f4f2', 1, -2, 46, 21); q('#e0e0dc', 1, 16, 46, 3); q('#cfe0e8', 5, 1, 38, 12); q('#bcd2dc', 5, 1, 38, 2); q('#c8ccd2', 7, -1, 3, 3);
      q('#c8ccd2', 1, -26, 46, 1); q(m.c, 30, -25, 16, 40); for (let i = 0; i < 4; i++) q(shade(m.c, -0.15), 32 + i * 4, -25, 1, 40); break; }
    case 'h_shw': { q('#e8ecf0', 1, -18, 22, 38); q('#d8dce0', 1, 16, 22, 4); q('rgba(190,215,235,.75)', 3, -15, 18, 30); q('rgba(255,255,255,.4)', 5, -13, 2, 24); q('#9aa0a8', 10, -16, 4, 2); break; }
    case 'h_toil': { q('rgba(0,0,0,.18)', 6, 18, 12, 3); q('#f4f4f2', 6, -9, 12, 9); q('#d8d8d4', 6, -1, 12, 1); q('#c8ccd2', 15, -7, 2, 1); q('#f4f4f2', 7, 1, 10, 12); q('#e4e4e0', 7, 1, 10, 2); q('#cfe0e8', 9, 4, 6, 6); q('#e8e8e4', 9, 13, 6, 6); break; }
    case 'h_bsink': { sh(); const c = m.c; q(c, 1, 2, 22, 18); q(shade(c, -0.25), 1, 18, 22, 2); q(shade(c, -0.18), 11, 4, 1, 13); q('#e8e4dc', 0, -2, 24, 5); q('#f4f4f2', 6, -1, 12, 3); q('#9aa0a8', 11, -5, 2, 4);
      q('#9aa0a8', 4, -26, 16, 16); q('#cfe0e8', 5, -25, 14, 14); q('rgba(255,255,255,.4)', 6, -24, 3, 10); break; }
    case 'h_wash': case 'h_dry': { sh(); q('#f0f2f4', 2, -6, 20, 26); q('#dcdfe2', 2, -6, 20, 5); q('#8a8e96', 4, -5, 10, 2); q('#3a3a3e', 17, -5, 3, 2);
      if (t === 'h_wash') { q('#c8ccd2', 4, 0, 16, 1); q('#e4e6e8', 4, 3, 16, 14); } else { q('#5a6a7a', 6, 2, 12, 12); q('#8a9ab0', 8, 4, 8, 8); } break; }
    case 'h_wh': { q('rgba(0,0,0,.2)', 4, 18, 16, 3); q('#c8ccd2', 5, -10, 14, 30); q('#dcdfe2', 5, -10, 14, 3); q('#8a8e96', 11, -14, 2, 4); q('#e8c040', 8, 2, 8, 5); q('#2a2a2e', 9, 14, 6, 2); break; }
    case 'h_stair': {   // a stairwell, two tiles deep, with a railing
      const wd = S.st === 'modern' ? '#a89070' : '#8a5a32';
      for (let i = 0; i < 8; i++) { const sy = 1 + i * 6; q(m.up ? shade(wd, 0.1 - i * 0.04) : shade(wd, -0.08 - i * 0.07), 3, sy, 18, 6); q(m.up ? shade(wd, 0.25 - i * 0.04) : shade(wd, 0.05 - i * 0.07), 3, sy, 18, 1); }
      if (!m.up) q('rgba(0,0,0,.35)', 3, 1, 18, 14);
      q('#4a2e1a', 0, -2, 3, 50); q('#4a2e1a', 21, -2, 3, 50); for (let i = 0; i < 5; i++) q('#6a4428', 22, 2 + i * 9, 1, 7); q('#6a4428', 21, -4, 3, 3); break; }
  }
}
