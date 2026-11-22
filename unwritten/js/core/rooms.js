"use strict";
// =====================================================================
//  INSIDE DOWNTOWN (Nov 13-14, Christian: "a space the shape and size of the building in each of the downtown businesses";
//  "I want them all enterable. Same with the bank, CoVantage, the library, etc"). Every building on Fifth Avenue from the
//  500 to the 1000 block, and the town's banks, credit union, library, post office, museum and courthouse, can be walked into.
//  Each inside is the building's real outline (county / Microsoft footprints) at the interiors' 1 m tile, turned so its front
//  door is at the bottom of the screen, with a stand-in layout for its kind of place. Christian is sending real layouts;
//  ROOM_HOOK (rooms2.js) is where each place's own inside, people and game hooks go. Apartments (the housing authority's
//  buildings) stay private. Nobody real is drawn: staff and customers are generic townsfolk with plain stand-in lines.
// =====================================================================
const ROOM_NAMES = new Set(['CoVantage Credit Union', 'Antigo Public Library', 'BMO Harris Bank', 'Chase', 'Associated Bank', 'United States Post Office',
  'Langlade County Courthouse', 'Langlade County Historical Museum', 'Senior Center', 'Woken Bear Coffee', 'Chamber & Visitors Center', 'Banner Bank']);
const ROOM_HOOK = {};      // by building name or address: { kind, line, npcs:[...], look(x, y, t), layout(R, ctx), title }
function roomSkip(b) { return b === BLD[TOWN.fig] || (typeof UMA !== 'undefined' && b === UMA) || b === RESPAWN || b === PALACE; }
function roomEligible(b) {
  if (!b || roomSkip(b)) return false;
  if (b.landmark) return ['court', 'po', 'museum', 'opera'].includes(b.landmark);
  if (['garage', 'shed', 'barn'].includes(b.type)) return false;
  if (b.type === 'house' && b.name !== 'Langlade County Historical Museum') return false;
  if (/HOUSING AUTHORITY/.test(b.owner || '')) return false;
  const m = /^(\d+) 5TH AVE$/.exec(b.addr || '');
  if (m && +m[1] >= 500 && +m[1] < 1100 && ['store', 'civic', 'church', 'apartments'].includes(b.type)) return true;
  return ROOM_NAMES.has(b.name || '') && ['store', 'civic', 'house'].includes(b.type);
}
function roomHook(b) { return ROOM_HOOK[b.name] || ROOM_HOOK[b.addr] || {}; }
function roomKind(b) {
  const h = roomHook(b); if (h.kind) return h.kind;
  if (b.landmark) return { court: 'court', po: 'post', museum: 'museum', opera: 'museum' }[b.landmark];
  const n = (b.name || '').toLowerCase();
  if (/bank|credit union|^chase/.test(n)) return 'bank';
  if (/library/.test(n)) return 'library';
  if (/post office/.test(n)) return 'post';
  if (/museum/.test(n)) return 'museum';
  if (/courthouse/.test(n)) return 'court';
  if (/bar & grill|tavern|hoffman/.test(n)) return 'bar';
  if (/restaurant|diner|lunch|coffee|bun|cafe|café|creamery|kastawayz|nutrition/.test(n)) return 'cafe';
  if (/bakery/.test(n)) return 'bakery';
  if (/salon|barber|man cave|groom/.test(n)) return 'salon';
  if (/laundry/.test(n)) return 'laundry';
  if (/auto|towing|bearings/.test(n)) return 'garage';
  if (/flowers/.test(n)) return 'florist';
  if (/pharmacy/.test(n)) return 'pharmacy';
  if (/vintage|resale|primitive|antique|interiors|interchange/.test(n)) return 'vintage';
  if (/winter, winter|law|realty|insurance|chamber|senior center|chiropractic/.test(n)) return 'office';
  if (b.type === 'civic') return 'civic';
  return 'shop';
}
const KIND_ZONE = { shop: 'SHOP', cafe: 'DINING ROOM', bar: 'BAR', bakery: 'BAKERY', salon: 'SALON', office: 'OFFICE', bank: 'LOBBY', library: 'LIBRARY',
  post: 'LOBBY', museum: 'GALLERY', court: 'LOBBY', civic: 'OFFICE', laundry: 'LAUNDROMAT', garage: 'SHOP FLOOR', florist: 'FLOWER SHOP', pharmacy: 'STORE', vintage: 'SHOWROOM' };
function roomTitle(b) { const h = roomHook(b); if (h.title) return h.title; if (b.name) return b.name.toUpperCase(); return (b.addr || 'A BUILDING').replace(/\b(\d+) 5TH AVE\b/, '$1 FIFTH AVE'); }

// ---------- the floor plan: the outline at 1 m, turned so the door is at the bottom ----------
const ROOM_WALK = new Set(['.', 'e', 'g', 'D2']);
function roomBuild(b) {
  const P = b.poly.map(p => [p[0] * 4, p[1] * 4]);
  const X0 = Math.floor(Math.min(...P.map(p => p[0]))), X1 = Math.ceil(Math.max(...P.map(p => p[0])));
  const Y0 = Math.floor(Math.min(...P.map(p => p[1]))), Y1 = Math.ceil(Math.max(...P.map(p => p[1])));
  const f = b.face || 'S', side = f === 'E' || f === 'W';
  const W = side ? Y1 - Y0 : X1 - X0, H = side ? X1 - X0 : Y1 - Y0;
  const toW = (u, v) => f === 'S' ? [X0 + u, Y0 + v] : f === 'N' ? [X1 - 1 - u, Y1 - 1 - v] : f === 'E' ? [X0 + v, Y1 - 1 - u] : [X1 - 1 - v, Y0 + u];
  const M = []; for (let v = 0; v < H; v++) { M.push([]); for (let u = 0; u < W; u++) { const [wx, wy] = toW(u, v); M[v].push(inPoly(P, wx + 0.5, wy + 0.5)); } }
  const inM = (u, v) => v >= 0 && v < H && u >= 0 && u < W && M[v][u];
  const R = []; for (let v = 0; v < H; v++) { R.push([]); for (let u = 0; u < W; u++) {
    if (!M[v][u]) { R[v].push(' '); continue; }
    let edge = false; for (let dv = -1; dv <= 1; dv++) for (let du = -1; du <= 1; du++) if (!inM(u + du, v + dv)) edge = true;
    R[v].push(edge ? 'W' : '.'); } }
  // the door: where the building's door is on its front, on the bottom edge of the plan
  let ud = W >> 1;
  if (b.door) { const [dx, dy] = doorM(b), mx = Math.floor(dx * 4), my = Math.floor(dy * 4);
    ud = f === 'S' ? mx - X0 : f === 'N' ? X1 - 1 - mx : f === 'E' ? Y1 - 1 - my : my - Y0; }
  const col = u => { for (let v = H - 1; v > 0; v--) if (M[v][u]) return R[v - 1] && R[v - 1][u] === '.' ? v : -1; return -1; };
  let best = -1, bd = 1e9; for (let u = 1; u < W - 1; u++) { const v = col(u); if (v > 0 && Math.abs(u - ud) < bd) { bd = Math.abs(u - ud); best = u; } }
  if (best < 0) return null;
  ud = best; const vd = col(ud);
  const hk = roomHook(b);
  if (hk.lobby) {   // a big plant or hall: only a front room behind the door is open to visitors (hook lobby: [width, depth] in metres),
    const [lw, ld] = hk.lobby;   // a plain box behind the door, whatever shape the outline has (a lobby needn't follow every wing)
    for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) M[v][u] = Math.abs(u - ud) <= lw >> 1 && v >= vd - ld && v <= vd && u > 0 && u < W - 1;
    for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) { if (!M[v][u]) { R[v][u] = ' '; continue; }
      let edge = false; for (let dv = -1; dv <= 1; dv++) for (let du = -1; du <= 1; du++) if (!inM(u + du, v + dv)) edge = true; R[v][u] = edge ? 'W' : '.'; }
  }
  // the front wall: windows along it, the door in it
  for (let u = 0; u < W; u++) for (let v = Math.max(0, vd - 3); v < H; v++) if (R[v][u] === 'W' && !inM(u, v + 1) && u > 0 && u < W - 1 && inM(u - 1, v) && inM(u + 1, v) && R[v - 1] && R[v - 1][u] === '.') R[v][u] = 'O';
  R[vd][ud] = 'e';
  if (hk.lobby) {   // crop the plan to the lobby that's left
    let u0 = W, u1 = -1, v0 = H, v1 = -1;
    for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) if (R[v][u] !== ' ') { u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
    return { b, W: u1 - u0 + 1, H: v1 - v0 + 1, R: R.slice(v0, v1 + 1).map(r => r.slice(u0, u1 + 1)), ud: ud - u0, vd: vd - v0, ex: ud - u0, ey: vd - v0 - 1, kind: roomKind(b), seed: b.id };
  }
  return { b, W, H, R, ud, vd, ex: ud, ey: vd - 1, kind: roomKind(b), seed: b.id };
}

// ---------- stand-in layouts by kind of place ----------
function roomLayout(F) {
  const { R, W, H, ud, kind } = F, h0 = F.seed;
  const fl = (u, v) => v >= 0 && v < H && u >= 0 && u < W && R[v][u] === '.';
  let fx0 = W, fx1 = -1, fy0 = H, fy1 = -1;
  for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) if (R[v][u] === '.') { fx0 = Math.min(fx0, u); fx1 = Math.max(fx1, u); fy0 = Math.min(fy0, v); fy1 = Math.max(fy1, v); }
  if (fx1 < 0) return;
  const w = fx1 - fx0 + 1, d = fy1 - fy0 + 1, xs = ud, keep = new Set();
  for (let v = fy0; v <= fy1; v++) keep.add(xs + ',' + v);                       // the aisle from the door to the back stays clear
  for (let u = fx0; u <= fx1; u++) keep.add(u + ',' + fy1);                       // and the row inside the door
  const put = (u, v, c, force) => { if (!fl(u, v) || (!force && keep.has(u + ',' + v))) return false; R[v][u] = c; return true; };
  const rowOf = (v, c, u0, u1, force) => { for (let u = u0; u <= u1; u++) put(u, v, c, force); };
  const far = xs > (fx0 + fx1) / 2 ? -1 : 1;                                      // the side of the room away from the door
  const sideX0 = far < 0 ? fx0 : xs + 2, sideX1 = far < 0 ? xs - 2 : fx1;
  const partition = (v, doorAt) => { for (let u = fx0; u <= fx1; u++) if (R[v][u] === '.') R[v][u] = u === doorAt ? 'D' : 'W'; };
  F.npcs = [];
  switch (kind) {
    case 'shop': case 'pharmacy': case 'florist': {
      for (let v = fy0; v <= fy1 - 3; v++) { put(fx0, v, 'K'); put(fx1, v, 'K'); }
      rowOf(fy0, 'K', fx0, fx1);
      for (let u = fx0 + 2; u <= fx1 - 2; u += 2) { if (Math.abs(u - xs) < 1) continue; for (let v = fy0 + 2; v <= fy1 - 5; v++) if (!(d > 14 && v === ((fy0 + fy1) >> 1))) put(u, v, kind === 'florist' ? 'v' : 'G'); }
      const cu = far < 0 ? fx0 + 1 : fx1 - 3; put(cu, fy1 - 3, 'c'); put(cu + 1, fy1 - 3, 'c'); put(cu + 2, fy1 - 3, 'k');
      F.npcs.push({ x: cu + 1, y: fy1 - 4, folk: 'clerk' }); put(cu + 1, fy1 - 4, 'N');
      if (kind === 'pharmacy') { rowOf(fy0 + 1, 'c', fx0 + 2, fx1 - 2, true); }
      if (kind === 'florist') { put(fx0, fy1 - 1, 'f'); put(fx0, fy1 - 2, 'f'); }
      put(fx0, fy1, 'P'); put(fx1, fy1, 'P');
      break; }
    case 'cafe': case 'bar': case 'bakery': {
      let top = fy0;
      if (d >= 12) { const kv = fy0 + 3; partition(kv, fx1 - 1 > xs ? fx1 - 1 : fx0 + 1);
        rowOf(fy0, kind === 'bar' ? 'K' : 'S', fx0, fx1, true); put(fx0, fy0 + 1, 'f', true); put(fx1, fy0 + 1, 'B', true); top = kv + 1; }
      // the counter: a staff row behind it, stools (or a bakery case) in front
      const cv = top + 1, c0 = kind === 'bakery' ? fx0 : (far < 0 ? fx0 : Math.max(fx0, xs + 1)), c1 = kind === 'bakery' ? fx1 : (far < 0 ? Math.min(fx1, xs - 1) : fx1);
      rowOf(top, 'x', c0, c1, true); rowOf(cv, kind === 'bakery' ? 'E' : 'c', c0, c1, true); put(far < 0 ? c1 : c0, cv, 'k', true) || (R[cv][far < 0 ? c1 : c0] = 'k');
      if (kind === 'bakery') { rowOf(top, 'x', fx0, fx1, true); for (let u = fx0; u <= fx1; u++) if (R[cv][u] === '.') R[cv][u] = 'E'; }
      F.npcs.push({ x: (c0 + c1) >> 1, y: top, folk: kind === 'bar' ? 'bartender' : 'server' });
      if (kind !== 'bakery') for (let u = c0; u <= c1; u++) if (u !== xs && (u - c0) % 2 === 0) put(u, cv + 1, 's');
      // tables for two, with an aisle around each; booths down the far wall
      for (let v = cv + 3; v <= fy1 - 3; v += 3) for (let u = fx0 + 1; u + 2 <= fx1 - 1; u += 4) {
        if (Math.abs(u + 1 - xs) <= 1) continue; put(u, v, 'h'); put(u + 1, v, 'T'); put(u + 2, v, 'h'); }
      if (kind === 'bakery') { put(fx0, fy1 - 1, 'K'); put(fx1, fy1 - 1, 'K'); }
      break; }
    case 'salon': {
      for (let v = fy0 + 1; v <= fy1 - 4; v += 2) { put(fx0, v, 'y'); put(fx0 + 1, v, 'Y'); }
      for (let u = Math.max(fx0 + 3, fx1 - 3); u <= fx1; u++) put(u, fy0, 'n');
      put(fx1, fy1 - 3, 'k'); put(fx1 - 1, fy1 - 3, 'c'); for (let v = fy0 + 2; v <= fy1 - 5; v += 2) put(fx1, v, 'K');
      put(fx0, fy1 - 1, 'h'); put(fx0 + 1, fy1 - 1, 'h'); put(fx0, fy1, 'P');
      F.npcs.push({ x: fx0 + 2, y: fy0 + 1, folk: 'stylist' }); put(fx0 + 2, fy0 + 1, 'N');
      break; }
    case 'office': case 'civic': {
      const rv = fy1 - 3; put(far < 0 ? fx0 + 1 : fx1 - 1, rv, 'k'); put(far < 0 ? fx0 + 2 : fx1 - 2, rv, 'c');
      F.npcs.push({ x: far < 0 ? fx0 + 1 : fx1 - 1, y: rv - 1, folk: 'clerk' }); put(far < 0 ? fx0 + 1 : fx1 - 1, rv - 1, 'N');
      for (let v = fy0 + 1; v <= rv - 3; v += 3) for (let u = fx0 + 1; u <= fx1 - 1; u += 3) { if (Math.abs(u - xs) < 1) continue; put(u, v, 'd'); put(u, v + 1, 'h'); }
      for (let v = fy0; v <= rv - 2; v += 1) if (v % 3 === 0) put(fx1, v, 'F');
      put(sideX0 === fx0 ? fx0 : fx1, fy1 - 1, 'h'); put(sideX0 === fx0 ? fx0 : fx1, fy1, 'P');
      break; }
    case 'bank': {
      const tv = fy0 + Math.max(3, Math.floor(d * 0.32));
      rowOf(tv, 'U', fx0, fx1, true);
      for (let v = fy0; v < tv; v++) for (let u = fx0; u <= fx1; u++) if (R[v][u] === '.') R[v][u] = 'x';
      put(xs, fy0, 'V', true) || (R[fy0][xs] = 'V'); if (R[fy0][xs] !== 'V' && fy0 > 0) R[fy0][xs] = 'V';
      for (let u = fx0 + 1; u <= fx1 - 1; u += 3) if (R[fy0 + 1] && R[fy0 + 1][u] === 'x' && u !== xs) R[fy0 + 1][u] = 'd';
      { const spots = []; for (let u = fx0 + 1; u <= fx1 - 1; u += 3) if (u !== xs) spots.push(u); spots.sort((a, c) => Math.abs(a - xs) - Math.abs(c - xs)).slice(0, 3).forEach(u => F.npcs.push({ x: u, y: tv - 1, folk: 'teller' })); }
      for (let v = tv + 2; v <= tv + 4; v++) { put(xs - 1, v, 'r'); put(xs + 1, v, 'r'); }
      for (let v = tv + 3; v <= fy1 - 3; v += 3) { put(fx1, v, 'd'); put(fx1 - 1, v, 'h'); put(fx0, v, 'd'); put(fx0 + 1, v, 'h'); }
      put(far < 0 ? fx0 + 2 : fx1 - 2, fy1 - 2, 'w'); put(fx0, fy1, 'P'); put(fx1, fy1, 'P');
      break; }
    case 'library': {
      for (let v = fy0; v <= fy1 - 2; v++) { put(fx0, v, 'K'); put(fx1, v, 'K'); }
      const mid = fy0 + Math.floor(d * 0.55);
      for (let v = fy0 + 1; v <= mid; v += 2) for (let u = fx0 + 2; u <= fx1 - 2; u++) { if (Math.abs(u - xs) <= 1 || (u - fx0) % 8 === 0) continue; put(u, v, 'K'); }
      for (let v = mid + 2; v <= fy1 - 4; v += 3) for (let u = fx0 + 2; u + 1 <= fx1 - 2; u += 5) { if (Math.abs(u - xs) <= 2) continue; put(u, v, 'T'); put(u + 1, v, 'T'); put(u, v - 1, 'h'); put(u + 1, v + 1, 'h'); }
      for (let v = mid + 2; v <= fy1 - 3; v += 2) put(fx0 + 1, v, 'M');
      const cu = far < 0 ? fx0 + 2 : fx1 - 4; put(cu, fy1 - 3, 'c'); put(cu + 1, fy1 - 3, 'c'); put(cu + 2, fy1 - 3, 'k');
      F.npcs.push({ x: cu + 1, y: fy1 - 4, folk: 'librarian' }); put(cu + 1, fy1 - 4, 'N');
      break; }
    case 'post': {
      const tv = fy0 + Math.max(3, Math.floor(d * 0.3)); rowOf(tv, 'U', fx0, fx1, true);
      for (let v = fy0; v < tv; v++) for (let u = fx0; u <= fx1; u++) if (R[v][u] === '.') R[v][u] = (u + v) % 3 ? 'x' : 'B';
      F.npcs.push({ x: xs + (xs + 2 <= fx1 ? 2 : -2), y: tv - 1, folk: 'clerk' });
      for (let v = tv + 2; v <= fy1 - 2; v++) put(fx0, v, 'X');
      put(xs + 2, tv + 3, 'T'); put(fx1, fy1 - 1, 'P');
      break; }
    case 'museum': {
      for (let v = fy0 + 2; v <= fy1 - 4; v += 3) for (let u = fx0 + 1; u + 1 <= fx1 - 1; u += 4) { if (Math.abs(u - xs) <= 1 || Math.abs(u + 1 - xs) <= 1) continue; put(u, v, 'E'); put(u + 1, v, 'E'); }
      for (let v = fy0; v <= fy1 - 3; v += 2) { put(fx0, v, 'A'); put(fx1, v, 'A'); }
      put(far < 0 ? fx0 + 1 : fx1 - 1, fy1 - 2, 'k'); F.npcs.push({ x: far < 0 ? fx0 + 1 : fx1 - 1, y: fy1 - 3, folk: 'clerk' }); put(far < 0 ? fx0 + 1 : fx1 - 1, fy1 - 3, 'N');
      break; }
    case 'court': {
      const jv = fy0 + 1; rowOf(jv, 'j', Math.max(fx0, xs - 2), Math.min(fx1, xs + 2), true);
      for (let v = jv + 4; v <= fy0 + Math.floor(d * 0.6); v += 2) for (let u = fx0 + 1; u <= fx1 - 1; u++) if (Math.abs(u - xs) > 0) put(u, v, 'p');
      put(fx0, fy1 - 1, 'H'); put(fx1, fy1 - 1, 'H'); put(fx1, fy1 - 3, 'A');
      break; }
    case 'laundry': {
      for (let v = fy0; v <= fy1 - 3; v++) { put(fx0, v, 'X'); put(fx1, v, 'Z'); }
      for (let v = fy0 + 2; v <= fy1 - 5; v += 4) { put(xs - 2, v, 'T'); put(xs + 2, v, 'T'); }
      put(fx0 + 1, fy1 - 1, 'h'); put(fx0 + 2, fy1 - 1, 'h'); put(fx1 - 1, fy1 - 1, 'h');
      break; }
    case 'garage': {
      if (w >= 6 && d >= 9) { const cu = Math.max(fx0 + 1, Math.min(fx1 - 3, xs - 1)); for (let v = fy0 + 1; v <= fy0 + 4; v++) for (let u = cu; u <= cu + 2; u++) put(u, v, 'Q', true); }
      for (let v = fy0; v <= fy1 - 3; v += 2) { put(fx0, v, 'q'); put(fx1, v, 'G'); }
      const cu = far < 0 ? fx0 + 1 : fx1 - 2; put(cu, fy1 - 3, 'c'); put(cu + 1, fy1 - 3, 'k');
      F.npcs.push({ x: cu + 1, y: fy1 - 4, folk: 'mechanic' }); put(cu + 1, fy1 - 4, 'N');
      break; }
    case 'vintage': {
      for (let v = fy0; v <= fy1 - 3; v++) { put(fx0, v, 'K'); put(fx1, v, 'K'); }
      for (let v = fy0 + 2; v <= fy1 - 4; v += 2) for (let u = fx0 + 2; u <= fx1 - 2; u += 2) { if (Math.abs(u - xs) < 1) continue; put(u, v, hash(u + h0, v) % 3 ? 'A' : 'T'); }
      const cu = far < 0 ? fx0 + 1 : fx1 - 2; put(cu, fy1 - 3, 'c'); put(cu + 1, fy1 - 3, 'k');
      F.npcs.push({ x: cu, y: fy1 - 4, folk: 'clerk' }); put(cu, fy1 - 4, 'N');
      break; }
  }
  const hk = roomHook(F.b); if (hk.layout) hk.layout(F, { fx0, fx1, fy0, fy1, xs, put, rowOf, partition, far });
  F.box = { fx0, fx1, fy0, fy1 };
}
// a room is reachable from its door: anything the player must reach (counters, tellers, desks) sits beside a walkable tile
function roomCheck(F) {
  const seen = new Set([F.ex + ',' + F.ey]), q = [[F.ex, F.ey]];
  while (q.length) { const [u, v] = q.shift(); for (const [du, dv] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = u + du, c = v + dv, k = a + ',' + c;
      if (seen.has(k) || !F.R[c] || !ROOM_WALK.has(F.R[c][a])) continue; seen.add(k); q.push([a, c]); } }
  F.reach = seen;
}
const ROOMS = {};          // built lazily: FIG_FLOORS['room<id>']
function roomFloor(b) {
  const id = 'room' + b.id; if (FIG_FLOORS[id]) return id;
  const F = roomBuild(b); if (!F) return null;
  roomLayout(F); roomCheck(F); if (F.reach.size < 6) return null;
  F.rows = F.R.map(r => r.join(''));
  F.npcs = (F.npcs || []).concat(roomHook(b).npcs || []);
  ROOMS[id] = F;
  FIG_FLOORS[id] = { name: KIND_ZONE[F.kind] || 'INSIDE', place: roomTitle(b), bld: 'room', rows: F.rows, room: F,
    paint: (ox, oy, kx, ky) => roomPaint(F, ox, oy, kx, ky), look: (x, y, t) => roomLook(F, x, y, t), free: (x, y) => roomFree(F, x, y),
    leave: () => roomLeave(F), zone: (x, y) => roomZone(F, x, y) };
  return id;
}

// ---------- how each kind of place looks: floor, walls ----------
const ROOM_STYLE = {
  shop: [['wood', '#b88a58', '#a87a4a'], ['#e8e0cc', '#c8b898']], pharmacy: [['lino', '#e6e4dc', '#d4d2ca'], ['#f0f0ea', '#9ab0c0']],
  florist: [['tile', '#c88a62', '#b07452'], ['#eef0e2', '#7a9a6a']], cafe: [['check', '#e8e4dc', '#2a2a30'], ['#f2ece0', '#b8323a']],
  bar: [['wood', '#6a4a30', '#5a3e26'], ['#4a3a30', '#8a6a3a']], bakery: [['check', '#f0e8d8', '#c87a5a'], ['#f6efe0', '#c8925a']],
  salon: [['check', '#e8e8ec', '#c8c8d0'], ['#f0e8ec', '#a86a8a']], office: [['carpet', '#5a6a7a', '#52626f'], ['#e8e6e0', '#6a7a8a']],
  civic: [['lino', '#d8d4c8', '#c8c4b8'], ['#ece8dc', '#7a8a6a']], bank: [['terrazzo', '#d8d2c4', '#c4bca8'], ['#ece6d6', '#2a4a6a']],
  library: [['carpet', '#4a6a52', '#425f49'], ['#efe8d8', '#7a5a3a']], post: [['terrazzo', '#cfcac0', '#bdb7aa'], ['#e8e6de', '#2a4a8a']],
  museum: [['wood', '#7a5434', '#6a4628'], ['#e6dcc8', '#5a3a22']], court: [['terrazzo', '#d4ccbc', '#c0b6a2'], ['#e8e0cc', '#6a4a2a']],
  laundry: [['tile', '#dfe6ea', '#cbd4da'], ['#e8f0f4', '#5a9ac8']], garage: [['concrete', '#8a8c8e', '#7c7e80'], ['#c8ccd0', '#c83a2a']],
  vintage: [['wood', '#9a6a40', '#8a5c36'], ['#e6d8c0', '#7a4a3a']],
};
let QX = 0, QY = 0;
function qp(c, x, y, w, h) { F(c, QX + x, QY + y, w, h); }
function roomT(Fm, x, y) { const r = Fm.R[y]; return r && x >= 0 && x < Fm.W ? r[x] : ' '; }
function roomFloorTile(Fm, t, x, y) {
  const st = ROOM_STYLE[Fm.kind] || ROOM_STYLE.shop, [kind, c1, c2] = st[0], X = x * 24, Y = y * 24, h = hash(x * 11 + Fm.seed, y * 7 + 5);
  if (t === 'x' && Fm.kind !== 'bank' && Fm.kind !== 'post') { qp((x + y) % 2 ? '#c8c2b4' : '#b8b2a4', X, Y, 24, 24); return; }
  if (Fm.backFrom != null && y < Fm.backFrom && (Fm.kind === 'cafe' || Fm.kind === 'bar' || Fm.kind === 'bakery')) { qp((x + y) % 2 ? '#d8d6d0' : '#c4c2bc', X, Y, 24, 24); return; }   // the kitchen's quarry tile
  switch (kind) {
    case 'wood': qp(c1, X, Y, 24, 24); for (let i = 0; i < 24; i += 6) qp(c2, X, Y + i + 5, 24, 1); qp(c2, X + ((y * 7 + x * 3) % 4) * 6, Y, 1, 24); if (h % 4 === 0) qp(shade(c1, 0.08), X + h % 20, Y + (h >> 5) % 20, 3, 1); break;
    case 'check': qp(c1, X, Y, 24, 24); qp(c2, X, Y, 12, 12); qp(c2, X + 12, Y + 12, 12, 12); break;
    case 'carpet': qp(c1, X, Y, 24, 24); if (h % 2) qp(c2, X + h % 22, Y + (h >> 5) % 22, 2, 1); if (h % 5 === 0) qp(shade(c1, 0.12), X + (h >> 3) % 22, Y + (h >> 8) % 22, 1, 1); break;
    case 'terrazzo': qp(c1, X, Y, 24, 24); for (let i = 0; i < 6; i++) { const q = hash(h + i, i); qp(i % 2 ? c2 : shade(c1, 0.1), X + q % 23, Y + (q >> 5) % 23, 1, 1); } qp(shade(c1, -0.06), X, Y + 23, 24, 1); break;
    case 'concrete': qp(c1, X, Y, 24, 24); if (h % 3 === 0) qp(c2, X + h % 18, Y + (h >> 4) % 18, 5, 3); if (h % 7 === 0) qp(shade(c1, -0.2), X + (h >> 2) % 20, Y + (h >> 6) % 22, 4, 1); break;
    case 'tile': qp(c1, X, Y, 24, 24); qp(c2, X, Y + 11, 24, 1); qp(c2, X + 11, Y, 1, 24); qp(c2, X, Y + 23, 24, 1); qp(c2, X + 23, Y, 1, 24); break;
    default: qp(c1, X, Y, 24, 24); qp(c2, X, Y + 23, 24, 1); qp(c2, X + 23, Y, 1, 24);
  }
  if (t === 'e') { qp('#3a3236', X + 2, Y + 3, 20, 14); qp('#4a4046', X + 3, Y + 4, 18, 12); }
  if (t === 'g') { qp('#b84a3a', X, Y, 24, 24); qp('#e0b040', X + 2, Y + 2, 20, 20); qp('#3a7ad8', X + 5, Y + 5, 14, 14); }
}
function roomWallFace(Fm, x, y) {   // a wall with floor in front of it: 9 px above its tile down to its foot
  const st = ROOM_STYLE[Fm.kind] || ROOM_STYLE.shop, wall = st[1][0], trim = st[1][1], X = x * 24, Y = y * 24;
  qp(wall, X, Y - 9, 24, 33); qp(shade(wall, -0.06), X, Y - 9, 24, 2); qp('#2a2224', X, Y - 9, 24, 1);
  qp(trim, X, Y + 18, 24, 6); qp(shade(trim, -0.3), X, Y + 23, 24, 1);
  // a few things on the walls: a clock, framed pictures; the menu board over a diner counter
  const k = hash(x * 13 + Fm.seed, y * 3 + 1) % 9;
  if (Fm.menuAt && Fm.menuAt.has(x + ',' + y)) { qp('#1a1a1e', X + 1, Y - 6, 22, 16); for (let r = 0; r < 3; r++) qp(['#f0d060', '#f0f0e8', '#7ad0f0'][r], X + 3, Y - 3 + r * 4, 10 + (x * 3 + r) % 8, 1); }
  else if (k === 0) { qp('#2a2224', X + 8, Y - 4, 9, 9); qp('#f4f2ea', X + 9, Y - 3, 7, 7); qp('#2a2224', X + 12, Y - 2, 1, 3); qp('#2a2224', X + 12, Y, 2, 1); }
  else if (k === 1 || k === 2) { qp('#5a3a22', X + 5, Y - 5, 14, 12); qp(['#7aa0c8', '#c8a060', '#8ab070'][k], X + 6, Y - 4, 12, 10); qp('rgba(255,255,255,.25)', X + 7, Y - 3, 3, 2); }
}
function roomCap(Fm, x, y) { const st = ROOM_STYLE[Fm.kind] || ROOM_STYLE.shop, X = x * 24, Y = y * 24; qp('#1c1618', X, Y, 24, 24); qp(st[1][0], X + 4, Y, 16, 24); qp(shade(st[1][0], -0.15), X + 4, Y + 20, 16, 4); }
function roomWindow(Fm, x, y) { const X = x * 24, Y = y * 24; qp('#2a2226', X, Y, 24, 24); qp('#9ab8d0', X + 2, Y + 3, 20, 14); qp('rgba(255,255,255,.35)', X + 4, Y + 4, 3, 12); qp('#3a3036', X, Y + 18, 24, 6); }
const ROOM_SPINE = ['#c84a3a', '#3a6ab8', '#e8c048', '#4a9a5a', '#d8d0c0', '#7a3a7a', '#e08a3a', '#2a8a8a'];
function roomProp(Fm, t, x, y) {
  const X = x * 24, Y = y * 24, k = Fm.kind, h = hash(x * 5 + Fm.seed, y * 9 + 2), sh = () => qp('rgba(0,0,0,.22)', X + 1, Y + 19, 22, 4);
  switch (t) {
    case 'K': {   // tall shelving: books in the library, the law office and the vintage stores; bottles behind a bar; goods elsewhere
      sh(); qp('#4a2e1a', X, Y - 14, 24, 34); qp('#6a4428', X, Y - 14, 24, 2);
      for (let r = 0; r < 4; r++) { const sy = Y - 11 + r * 8; qp('#2e1c10', X + 1, sy + 6, 22, 1);
        for (let i = 0; i < 7; i++) { const q = hash(x * 7 + i + Fm.seed, y * 5 + r);
          if (k === 'bar') { if (i % 2 === 0) { qp(['#3a6a3a', '#8a5a2a', '#c8c0a0', '#5a2a1a'][q % 4], X + 2 + i * 3, sy + 1, 2, 5); qp('#d8d0b0', X + 2 + i * 3, sy, 2, 1); } }
          else if (k === 'library' || k === 'office' || k === 'vintage' || k === 'museum') qp(ROOM_SPINE[q % 8], X + 1 + i * 3, sy + 1 + (q % 2), 2, 5 - (q % 2));
          else if (k === 'bakery') { if (i % 3 === 0) qp('#c8904a', X + 2 + i * 3, sy + 2, 6, 4); }
          else qp(ROOM_SPINE[q % 8], X + 1 + i * 3, sy + 2, 3, 4); } }
      break; }
    case 'G': { sh(); qp('#6a6e76', X + 2, Y - 2, 20, 22); qp('#8a8e96', X + 2, Y - 2, 20, 2); for (let r = 0; r < 3; r++) { qp('#4a4e56', X + 2, Y + 4 + r * 6, 20, 1); for (let i = 0; i < 4; i++) qp(ROOM_SPINE[hash(x + i, y * 3 + r + Fm.seed) % 8], X + 3 + i * 5, Y + r * 6, 4, 4); } break; }
    case 'v': { sh(); for (let i = 0; i < 3; i++) { qp('#5a6068', X + 2 + i * 7, Y + 8, 6, 10); for (let j = 0; j < 3; j++) qp(['#e04a6a', '#f0d040', '#f08a40', '#c86ae0', '#f4f0f0'][(i + j + h) % 5], X + 1 + i * 7 + j * 2, Y + 1 + (j % 2) * 2, 3, 3); qp('#3a7a3a', X + 4 + i * 7, Y + 5, 1, 4); } break; }
    case 'c': case 'k': {   // a counter (and a register on it)
      sh(); const top = k === 'cafe' || k === 'bar' ? '#c8ccd2' : '#8a5a30', front = k === 'cafe' ? '#b8323a' : k === 'bar' ? '#5a3a22' : k === 'bank' ? '#2a4a6a' : '#6a4428';
      qp(front, X, Y + 2, 24, 18); qp(shade(front, -0.25), X, Y + 18, 24, 2); qp(top, X, Y - 2, 24, 5); qp(shade(top, 0.15), X, Y - 2, 24, 1);
      if (t === 'k') { qp('#2a2c34', X + 6, Y - 10, 12, 9); qp('#3a8a6a', X + 8, Y - 9, 8, 3); qp('#5a5e68', X + 7, Y - 4, 10, 2); }
      break; }
    case 'E': {   // a glass case: pastries in a bakery, artifacts in the museum
      sh(); qp('#5a3a22', X, Y + 8, 24, 12); qp('#cfe0e8', X + 1, Y - 6, 22, 15); qp('rgba(255,255,255,.4)', X + 2, Y - 5, 20, 1);
      if (k === 'bakery') for (let i = 0; i < 4; i++) { qp(['#d89a5a', '#f0d8a0', '#c87a4a', '#f4e8d0'][(i + h) % 4], X + 3 + i * 5, Y + 1, 4, 3); qp('#e8a0b0', X + 4 + i * 5, Y + 1, 2, 1); }
      else { qp(['#8a6a4a', '#c8b898', '#5a5a62'][h % 3], X + 6, Y - 1, 12, 5); qp('#e8e0c8', X + 15, Y + 2, 4, 2); }
      break; }
    case 'S': { qp('#3a3c42', X, Y - 6, 24, 26); qp('#5a5e66', X, Y - 6, 24, 3); qp('#1a1c22', X + 3, Y - 1, 8, 6); qp('#1a1c22', X + 13, Y - 1, 8, 6); qp((frame >> 3) % 2 ? '#e86a30' : '#c84a20', X + 5, Y + 3, 4, 1); qp('#8a8e96', X + 2, Y + 10, 20, 2); break; }
    case 'f': { sh(); qp('#e8ecf0', X + 2, Y - 18, 20, 38); qp('#9ab8c8', X + 4, Y - 15, 16, 30); for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) qp(['#e04040', '#f0a030', '#3a7ad8', '#50b050'][(r + i + h) % 4], X + 5 + i * 4, Y - 13 + r * 7, 2, 5); qp('rgba(255,255,255,.3)', X + 5, Y - 15, 2, 28); break; }
    case 'B': { sh(); qp('#a07a4a', X + 2, Y + 2, 20, 17); qp('#c09a6a', X + 2, Y + 2, 20, 3); qp('#7a5a3a', X + 11, Y + 2, 2, 17); if (h % 2) { qp('#a07a4a', X + 5, Y - 9, 14, 12); qp('#c09a6a', X + 5, Y - 9, 14, 2); } break; }
    case 'T': { const r = roomT(Fm, x - 1, y) === 'T', l = roomT(Fm, x + 1, y) === 'T'; qp('rgba(0,0,0,.2)', X + 2, Y + 17, 20, 4);
      const c = k === 'cafe' || k === 'bakery' ? '#e8e0d0' : k === 'laundry' ? '#d8dce0' : '#8a5a30';
      qp(c, X + (r ? 0 : 3), Y + 3, 24 - (r ? 0 : 3) - (l ? 0 : 3), 11); qp(shade(c, -0.25), X + (r ? 0 : 3), Y + 12, 24 - (r ? 0 : 3) - (l ? 0 : 3), 2);
      if (!r) qp(shade(c, -0.35), X + 4, Y + 14, 2, 6); if (!l) qp(shade(c, -0.35), X + 18, Y + 14, 2, 6);
      if (k === 'cafe' && h % 3 === 0) { qp('#f4f4f0', X + 8, Y + 5, 6, 5); qp('#8a5a30', X + 10, Y + 6, 2, 2); }
      if (k === 'library' && h % 2) { qp(ROOM_SPINE[h % 8], X + 6, Y + 5, 7, 5); qp('#f4f0e4', X + 7, Y + 6, 5, 3); }
      break; }
    case 'h': { qp('rgba(0,0,0,.2)', X + 6, Y + 18, 12, 3); const c = k === 'cafe' ? '#b8323a' : k === 'office' || k === 'bank' ? '#2a2c34' : '#7a4a2a';
      qp(c, X + 7, Y + 2, 10, 4); qp(c, X + 7, Y + 7, 10, 6); qp(shade(c, -0.3), X + 7, Y + 13, 2, 6); qp(shade(c, -0.3), X + 15, Y + 13, 2, 6); break; }
    case 's': { qp('rgba(0,0,0,.2)', X + 7, Y + 18, 10, 3); qp('#5a5e66', X + 11, Y + 8, 2, 11); qp('#b8323a', X + 6, Y + 4, 12, 5); qp('#d84a52', X + 7, Y + 4, 10, 1); break; }
    case 'd': { sh(); qp('#6a4428', X + 1, Y + 2, 22, 16); qp('#8a5a30', X + 1, Y + 2, 22, 3); qp('#2a2c34', X + 7, Y - 8, 10, 8); qp('#5a9ad8', X + 8, Y - 7, 8, 5); qp('#3a3c42', X + 11, Y, 2, 3); if (h % 2) qp('#f4f0e4', X + 3, Y + 5, 4, 3); break; }
    case 'M': { sh(); qp('#d8d4cc', X + 1, Y + 2, 22, 16); qp('#2a2c34', X + 6, Y - 8, 12, 9); qp('#3a7ad8', X + 7, Y - 7, 10, 6); qp('#3a3c42', X + 11, Y + 1, 2, 2); qp('#2a2c34', X + 7, Y + 6, 10, 2); break; }
    case 'F': { sh(); qp('#7a7e86', X + 4, Y - 10, 16, 30); for (let r = 0; r < 4; r++) { qp('#5a5e66', X + 4, Y - 3 + r * 7, 16, 1); qp('#c8ccd2', X + 10, Y - 7 + r * 7, 4, 1); } break; }
    case 'P': { qp('#a0502a', X + 7, Y + 11, 10, 8); qp('#2e7a38', X + 4, Y - 4, 16, 15); qp('#4e9a58', X + 7, Y - 2, 5, 4); qp('#3e8a48', X + 13, Y + 1, 4, 3); break; }
    case 'Y': { qp('rgba(0,0,0,.25)', X + 4, Y + 18, 16, 4); qp('#5a5e66', X + 11, Y + 12, 2, 7); qp('#2a2a30', X + 5, Y + 1, 14, 12); qp('#3a3a42', X + 6, Y + 2, 12, 4); qp('#16161a', X + 3, Y + 7, 3, 5); qp('#16161a', X + 18, Y + 7, 3, 5); break; }
    case 'y': { qp('#e8e4dc', X, Y - 12, 24, 32); qp('#b8d4e4', X + 3, Y - 10, 18, 16); qp('rgba(255,255,255,.5)', X + 5, Y - 8, 2, 12); qp('#8a8e96', X + 2, Y + 8, 20, 3); qp('#c83a3a', X + 5, Y + 6, 2, 2); qp('#3a3a42', X + 14, Y + 5, 4, 3); break; }
    case 'n': { qp('#e8e4dc', X + 1, Y - 2, 22, 20); qp('#9aa0a8', X + 4, Y + 1, 16, 8); qp('#5a6068', X + 11, Y - 4, 2, 4); qp('#2a2a30', X + 6, Y + 12, 12, 8); break; }
    case 'U': {   // a teller window: counter, glass above, a little opening
      qp('rgba(0,0,0,.2)', X, Y + 19, 24, 4); const front = k === 'post' ? '#2a4a8a' : '#2a3a52'; qp(front, X, Y + 2, 24, 18); qp('#c8ccd2', X, Y - 2, 24, 5);
      qp('rgba(200,225,240,.5)', X + 1, Y - 22, 22, 20); qp('#8a8e96', X, Y - 23, 24, 2); qp('#8a8e96', X, Y - 22, 1, 20); qp('#c8ccd2', X + 8, Y - 3, 8, 2); break; }
    case 'V': { qp('#5a5e66', X - 4, Y - 9, 32, 30); qp('#9aa0a8', X - 2, Y - 7, 28, 26); qp('#6a6e76', X + 4, Y - 1, 16, 16); qp('#c8ccd2', X + 11, Y + 6, 2, 2); for (let a = 0; a < 6; a++) qp('#3a3c42', X + 12 + Math.round(Math.cos(a) * 6), Y + 7 + Math.round(Math.sin(a) * 6), 2, 2); break; }
    case 'r': { qp('rgba(0,0,0,.2)', X + 8, Y + 18, 8, 3); qp('#c8a050', X + 11, Y + 2, 2, 17); qp('#e0c070', X + 10, Y + 1, 4, 2); qp('#a01c24', X, Y + 6, 24, 2); break; }
    case 'w': { sh(); qp('#6a4428', X + 4, Y + 2, 16, 4); qp('#5a3a22', X + 11, Y + 6, 2, 13); qp('#f4f0e4', X + 6, Y + 1, 5, 3); qp('#f4f0e4', X + 13, Y + 1, 5, 3); qp('#2a2a30', X + 9, Y + 2, 1, 4); break; }
    case 'A': {   // a framed picture in the museum, an antique in the vintage stores
      if (k === 'museum') { qp('#5a3a22', X + 3, Y - 8, 18, 16); qp('#c8b898', X + 5, Y - 6, 14, 12); qp('#8a7a5a', X + 7, Y - 2, 10, 4); qp('#5a4a3a', X + 10, Y - 5, 3, 3); break; }
      sh(); const v = h % 5;
      if (v === 0) { qp('#7a4a2a', X + 3, Y - 4, 18, 22); for (let r = 0; r < 3; r++) { qp('#5a3418', X + 4, Y + r * 6, 16, 1); qp('#d8b060', X + 11, Y - 2 + r * 6, 2, 1); } }   // a dresser
      else if (v === 1) { qp('#6a4428', X + 6, Y - 6, 12, 10); qp('#8a5a30', X + 6, Y + 4, 12, 3); qp('#6a4428', X + 6, Y + 7, 2, 12); qp('#6a4428', X + 16, Y + 7, 2, 12); }   // a chair
      else if (v === 2) { qp('#c8a050', X + 11, Y - 6, 2, 24); qp('#e8d8a8', X + 5, Y - 14, 14, 9); qp('#8a6a3a', X + 7, Y + 16, 10, 3); }   // a lamp
      else if (v === 3) { qp('#5a3a22', X + 2, Y + 4, 20, 14); qp('#8a5a30', X + 2, Y + 4, 20, 3); qp('#c8a050', X + 10, Y + 9, 4, 3); }   // a trunk
      else { qp('#5a3a22', X + 7, Y - 14, 10, 32); qp('#f0e8d0', X + 8, Y - 12, 8, 8); qp('#2a2224', X + 11, Y - 10, 1, 3); qp('#c8a050', X + 10, Y + 2, 4, 8); }   // a tall clock
      break; }
    case 'X': if (k === 'post') { qp('#9a8a5a', X, Y - 14, 24, 34); for (let r = 0; r < 5; r++) for (let i = 0; i < 4; i++) { qp('#c8b880', X + 1 + i * 6, Y - 13 + r * 7, 5, 6); qp('#5a4a2a', X + 4 + i * 6, Y - 10 + r * 7, 1, 1); } break; }
      // a washer, round door, a load going round
      sh(); qp('#f0f2f4', X + 2, Y - 6, 20, 26); qp('#c8ccd2', X + 2, Y - 6, 20, 4); qp('#3a4a5a', X + 6, Y + 1, 12, 12); qp('#6a8ab0', X + 8, Y + 3, 8, 8);
      qp(['#e04a4a', '#3a7ad8', '#f0d040'][(frame >> 3) % 3], X + 9 + ((frame >> 2) % 3), Y + 6, 3, 3); break;
    case 'Z': { sh(); qp('#e8eaec', X + 2, Y - 18, 20, 38); qp('#c8ccd2', X + 2, Y - 18, 20, 3); for (const oy of [-12, 3]) { qp('#2a2c34', X + 7, Y + oy, 10, 10); qp('#5a6a7a', X + 8, Y + oy + 1, 8, 8); } qp('#e05a3a', X + 18, Y - 14, 2, 2); break; }
    case 'Q': {   // a car up on a lift: drawn once from its top-left tile
      if (roomT(Fm, x - 1, y) === 'Q' || roomT(Fm, x, y - 1) === 'Q') break;
      qp('rgba(0,0,0,.25)', X + 2, Y + 4, 68, 92); qp('#c8a020', X - 2, Y + 8, 4, 80); qp('#c8a020', X + 70, Y + 8, 4, 80);
      qp('#3a5a8a', X + 6, Y + 2, 60, 86); qp('#4a6a9a', X + 8, Y + 4, 56, 10); qp('#9ab8d0', X + 12, Y + 16, 48, 14); qp('#9ab8d0', X + 12, Y + 60, 48, 10); qp('#2a3a5a', X + 6, Y + 34, 60, 2);
      for (const [ax, ay] of [[2, 14], [62, 14], [2, 66], [62, 66]]) qp('#16161a', X + ax, Y + ay, 8, 14);
      break; }
    case 'q': { sh(); qp('#c83a2a', X + 3, Y - 8, 18, 28); for (let r = 0; r < 4; r++) { qp('#8a2a1e', X + 3, Y - 2 + r * 6, 18, 1); qp('#c8ccd2', X + 9, Y - 5 + r * 6, 6, 1); } qp('#16161a', X + 4, Y + 18, 3, 3); qp('#16161a', X + 17, Y + 18, 3, 3); break; }
    case 'j': { qp('#5a3a22', X, Y - 8, 24, 28); qp('#7a5434', X, Y - 8, 24, 3); if (roomT(Fm, x - 1, y) !== 'j') qp('#3a2414', X, Y - 8, 2, 28); if (roomT(Fm, x + 1, y) !== 'j') qp('#3a2414', X + 22, Y - 8, 2, 28); break; }
    case 'p': case 'H': { qp('rgba(0,0,0,.2)', X, Y + 17, 24, 4); qp('#6a4428', X, Y + 2, 24, 6); qp('#8a5a30', X, Y + 8, 24, 6); qp('#4a2e1a', X + 2, Y + 14, 2, 5); qp('#4a2e1a', X + 20, Y + 14, 2, 5); break; }
    case 'D': { qp('#4a2e1a', X, Y - 9, 24, 33); qp('#6a4428', X + 3, Y - 6, 18, 30); qp('#e8c060', X + 17, Y + 6, 2, 2); qp('#f4f0e4', X + 7, Y - 2, 10, 4); break; }
    case 'I': { sh(); qp('#e8e4dc', X, Y + 2, 24, 18); qp('#cfe0e8', X + 1, Y - 6, 22, 9); for (let i = 0; i < 4; i++) qp(['#f4e8c8', '#8a5a30', '#f0a0b0', '#a8d090', '#f4f0f0', '#c86a8a'][(i + x) % 6], X + 2 + i * 5, Y - 4, 4, 5); break; }
    case 'o': { sh(); qp('#e8e4dc', X + 1, Y + 2, 22, 18); qp('#2a2c34', X + 4, Y - 12, 16, 14); qp('#f0d8a0', X + 6, Y - 9, 4, 8); qp('#c8a0d8', X + 12, Y - 9, 4, 8); for (let i = 0; i < 3; i++) qp('#2a2224', X + 6 + i * 4, Y - 2, 1, 1); break; }
    case 't': { sh(); qp('#c8ccd2', X + 1, Y - 2, 22, 20); qp('#e8ecf0', X + 3, Y, 18, 12); qp('#9ac8e8', X + 4, Y + 2, 16, 8); qp('#5a6068', X + 11, Y - 8, 2, 7); qp('#5a6068', X + 11, Y - 8, 6, 2); break; }
    case 'O': roomWindow(Fm, x, y); break;
  }
}

// ---------- drawing a room ----------
function roomPaint(Fm, ox, oy, kx, ky) {
  const W = Fm.W, H = Fm.H;
  ox = W * IT <= SW ? Math.round((SW - W * IT) / 2) : Math.round(Math.max(SW - W * IT, Math.min(0, SW / 2 - kx * IT - IT / 2)));
  oy = Math.round(Math.max(SH - IT - H * IT, Math.min(2 * IT + 26, SH / 2 - ky * IT - IT / 2)));
  QX = ox; QY = oy;
  const ya = Math.max(0, Math.floor(-oy / 24) - 1), yb = Math.min(H - 1, Math.ceil((SH - oy) / 24) + 1), xa = Math.max(0, Math.floor(-ox / 24) - 1), xb = Math.min(W - 1, Math.ceil((SW - ox) / 24) + 1);
  for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) { const t = roomT(Fm, x, y); if (t !== ' ' && t !== 'W' && t !== 'O') roomFloorTile(Fm, t, x, y); }
  const L = [], solid = t => t === 'W' || t === 'O' || t === ' ';
  for (let y = Math.max(0, ya - 2); y <= yb; y++) for (let x = xa; x <= xb; x++) {
    const t = roomT(Fm, x, y); if (t === ' ' || ROOM_WALK.has(t) && t !== 'e' || t === 'x' || t === 'N') continue;
    if (t === 'W') { const below = roomT(Fm, x, y + 1); if (!solid(below)) L.push({ y: y + 0.001, draw: () => roomWallFace(Fm, x, y) }); else L.push({ y: y - 0.5, draw: () => roomCap(Fm, x, y) }); continue; }
    if (t === 'e') continue;
    if (t === 'D' || t === 'V') { L.push({ y: y + 0.0012, draw: () => roomProp(Fm, t, x, y) }); continue; }
    L.push({ y: y + 0.002, draw: () => roomProp(Fm, t, x, y) });
  }
  for (const n of Fm.npcs) if (n.y >= ya - 1 && n.y <= yb + 1 && !roomNpcGone(n)) L.push({ y: n.y + 0.0015, draw: () => drawFolk(n.folk, QX + n.x * 24 + 12, QY + n.y * 24 + 23, frame + n.x * 7) });
  L.push({ y: ky + 0.005, draw: () => drawKid(G.kid, Math.round(QX + kx * IT), Math.round(QY + ky * IT), G.dir, P.t > 0, IT) });
  L.sort((a, b) => a.y - b.y).forEach(e => e.draw());
  if (Fm.dim) { ctx.fillStyle = 'rgba(16,10,20,' + Fm.dim + ')'; ctx.fillRect(0, 0, SW, SH); }
  if (ox > 0) { F('#0b0b14', 0, 0, ox, SH); F('#0b0b14', ox + W * IT, 0, SW - ox - W * IT, SH); }
}
function roomNpcGone(n) { return n.when && !n.when(); }

// ---------- walking, looking, the door ----------
function roomNpcAt(Fm, x, y) { return Fm.npcs.find(n => n.x === x && n.y === y && !roomNpcGone(n)) || null; }
function roomFree(Fm, x, y) { return ROOM_WALK.has(roomT(Fm, x, y)) && !roomNpcAt(Fm, x, y); }
function roomZone(Fm, x, y) {
  const hk = roomHook(Fm.b); if (hk.zone) { const z = hk.zone(Fm, x, y); if (z) return z; }
  if (Fm.backFrom != null && y < Fm.backFrom) return Fm.kind === 'cafe' || Fm.kind === 'bar' || Fm.kind === 'bakery' ? 'KITCHEN' : 'BACK ROOM';
  return KIND_ZONE[Fm.kind] || 'INSIDE';
}
const ROOM_STAFF_LINE = { clerk: 'Let me know if you need help finding anything.', server: 'Sit anywhere you like. I\'ll be right with you.', bartender: 'What can I get you? We\'ve got pop, juice and coffee for you.',
  teller: 'How can I help you today?', librarian: 'Welcome in. Nonfiction is shelved by subject, the way Melvil Dewey numbered it. Ask if you need anything.', stylist: 'Have a seat. I\'ll be with you in a minute.',
  mechanic: 'Bring it around back and we\'ll take a look.' };
function roomLook(Fm, x, y, t) {
  const hk = roomHook(Fm.b), n = roomNpcAt(Fm, x, y);
  if (hk.look && hk.look(Fm, x, y, t, n)) return;
  if (n) { if (n.talk) return n.talk(Fm, n); return say([[n.name || ROOM_ROLE[n.folk] || '', ROOM_STAFF_LINE[n.folk] || 'Hello there.']]); }
  // a counter or teller window: whoever stands behind it answers
  if ('ckUE'.includes(t)) { const s = Fm.npcs.find(q => Math.abs(q.x - x) <= 2 && Math.abs(q.y - y) <= 1 && !roomNpcGone(q)); if (s) { if (s.talk) return s.talk(Fm, s); return say([[s.name || ROOM_ROLE[s.folk] || '', ROOM_STAFF_LINE[s.folk] || 'Hello there.']]); } }
  const k = Fm.kind, street = /5TH AVE/.test(Fm.b.addr || '') ? 'Fifth Avenue' : 'The street';
  const L = {
    K: k === 'library' ? 'Shelves of books.' : k === 'bar' ? 'Bottles on the back bar.' : k === 'bakery' ? 'Racks of bread and buns.' : k === 'vintage' ? 'Shelves of old things, each with a handwritten price tag.' : k === 'office' ? 'Shelves of binders and books.' : 'Shelves of goods.',
    G: 'A shelf of goods, stocked on both sides.', v: 'Buckets of fresh flowers.', c: 'The counter.', k: 'The counter, and the register on it.', T: 'A table.', h: 'A chair.', s: 'A stool at the counter.',
    S: 'The kitchen: a grill and a fryer.', f: 'A glass-door cooler.', B: 'Boxes of stock.', U: 'A window at the counter.', V: 'The vault door. Closed, of course.', r: 'Brass posts and a velvet rope for the line.',
    w: 'A stand with pens on chains and blank slips.', d: 'A desk with a computer on it.', M: 'A computer for anyone to use.', F: 'A filing cabinet.', P: 'A potted plant.', Y: 'A styling chair.',
    y: 'A mirror and a counter of combs, scissors and clippers.', n: 'A shampoo sink.', E: k === 'bakery' ? 'The bakery case.' : 'A glass case.', A: k === 'museum' ? 'A framed photograph from the town\'s past.' : 'An antique, with a price tag tied on with string.',
    X: k === 'post' ? 'Rows of post office boxes.' : 'A washer.', Z: 'A stack of dryers. One of them is tumbling.', Q: 'A car up on the lift.', q: 'A rolling tool chest.',
    j: 'The judge\'s bench.', p: 'A wooden bench.', H: 'A bench to wait on.', D: 'A door to the back. Staff only.', x: 'Behind the counter.', I: 'An ice cream case.', o: 'A tea station: tapioca pearls and syrups.',
    t: 'A tub for washing dogs.', O: street + ', through the front window.', W: 'A wall.', g: 'A bright rug.',
  }[t];
  if (L) say([['', L]]);
}
const ROOM_ROLE = { clerk: 'Clerk', server: 'Server', bartender: 'Bartender', teller: 'Teller', librarian: 'Librarian', stylist: 'Stylist', mechanic: 'Mechanic' };
let ROOM_HOLD = null;   // after leaving: the way back in, ignored until that key is let go
const ROOM_IN = { S: 'up', N: 'down', E: 'left', W: 'right' }, ROOM_OUT = { S: 'down', N: 'up', E: 'right', W: 'left' };
function enterRoom(b) {
  const id = roomFloor(b); if (!id) return say([['', 'The door is locked.']]);
  const Fm = ROOMS[id], hk = roomHook(b);
  G.inside = { f: id, x: Fm.ex, y: Fm.ey }; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('inside');
  const line = hk.line || (b.name ? b.name + '.' : 'Inside ' + (b.addr || 'the building').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).replace(/ Ave\b/, ' Avenue') + '.') + (b.name ? '' : ' The layout here is a stand-in for now.');
  say([['', line]]);
}
function roomLeave(Fm) {
  const b = Fm.b, [x, y] = outsideDoorM(b); G.inside = null; G.x = x; G.y = y; G.dir = ROOM_OUT[b.face] || 'down'; P.t = 0; P.mx = P.my = 0; ROOM_HOLD = ROOM_IN[b.face] || null; saveGame(); setMode('walk');
}
// the doors: each building's door cells, by walking cell
let ROOM_DOOR = null;
function roomDoors() {
  ROOM_DOOR = new Map();
  for (const b of BLD) {
    if (!roomEligible(b)) continue;
    if (!b.door) { const f = b.face || 'S'; b.door = f === 'S' || f === 'N' ? [Math.floor((b.pxMin + b.pxMax) / 2), Math.floor(f === 'S' ? b.pyMax - 0.01 : b.pyMin)] : [Math.floor(f === 'E' ? b.pxMax - 0.01 : b.pxMin), Math.floor((b.pyMin + b.pyMax) / 2)]; }
    const f = b.face || 'S', [dx, dy] = doorM(b), cx = Math.floor(dx), cy = Math.floor(dy), cells = [];
    for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 2; x <= cx + 2; x++) {
      const ok = f === 'S' ? Math.abs(x + 0.5 - dx) <= 1.01 && y + 0.5 <= dy + 0.01 && y + 0.5 >= dy - 1.01
        : f === 'N' ? Math.abs(x + 0.5 - dx) <= 1.01 && y + 0.5 >= dy - 0.01 && y + 0.5 <= dy + 1.01
        : f === 'E' ? Math.abs(y + 0.5 - dy) <= 1.01 && x + 0.5 <= dx + 0.01 && x + 0.5 >= dx - 1.01
        : Math.abs(y + 0.5 - dy) <= 1.01 && x + 0.5 >= dx - 0.01 && x + 0.5 <= dx + 1.01;
      if (ok && bldgAtM(x, y) === b) cells.push([x, y]); }
    if (!cells.length) cells.push([b.door[0], b.door[1]]);
    for (const [x, y] of cells) { const k = y * TW * CPD + x; if (!ROOM_DOOR.has(k)) ROOM_DOOR.set(k, { b, dir: ROOM_IN[f] || 'up' }); }
  }
}
function roomDoorAt(x, y) { if (!ROOM_DOOR) roomDoors(); return ROOM_DOOR.get(y * TW * CPD + x) || null; }
const ROOM_BASE_DOOR = doorEnter;
{ const _de = doorEnter; doorEnter = function (x, y) { const r = _de(x, y); if (r) return r; const e = roomDoorAt(x, y); return e ? () => enterRoom(e.b) : null; }; }
{ const _wu = MODES.walk.update; MODES.walk.update = function () {
    if (ROOM_HOLD && !held[ROOM_HOLD]) ROOM_HOLD = null;
    if (!DLG && P.t === 0 && !pressed.a) { const d = dirHeld();
      if (d && d !== 'up' && d !== ROOM_HOLD) { const [dx, dy] = DIRS[d], tx = G.x + dx, ty = G.y + dy, e = roomDoorAt(tx, ty);
        if (e && e.dir === d && !ROOM_BASE_DOOR(tx, ty)) { G.dir = d; return enterRoom(e.b); } } }
    return _wu.call(this); }; }
// a saved game that ends inside one of these rooms rebuilds it on load
{ const _lg = loadGame; loadGame = function () { const s = _lg(); if (s && s.inside && /^room\d+$/.test(s.inside.f) && !FIG_FLOORS[s.inside.f]) {
      const b = BLD[+s.inside.f.slice(4) - 1]; if (!b || !roomFloor(b)) { s.inside = null; } } return s; }; }
for (const b of BLD) if (roomEligible(b) && b.name) b.enter = b.enter || 1;
