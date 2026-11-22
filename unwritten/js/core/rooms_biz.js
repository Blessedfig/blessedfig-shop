"use strict";
// =====================================================================
//  EVERY BUSINESS, INSIDE (Nov 21, Christian: "Now make every business walk into able based on their building size ...
//  Populate them with furniture and tvs and rooms"). Every remaining business building in town (stores, plants and
//  warehouses, offices, clinics, the hospital buildings, motels, garages, the city and county shops) opens onto an inside
//  that is its real outline at the interiors' 1 m tile (rooms.js turns it so the door is at the bottom). Each kind of place
//  gets a layout that fits whatever size it is: front rooms and offices, halls of rooms off a corridor, plant floors with
//  forklift aisles and dock doors, service bays with lifts. Staff and customers are generic townsfolk with plain stand-in
//  lines; nobody real is named, names are only the ones on the signs. Schools, churches, homes and apartments stay shut.
//  Tile tokens here all start with 'b_' (rooms_food.js uses 'f_', rooms_retail.js 'r_', the homes 'h_').
// =====================================================================
const bzNight = () => typeof SKY !== 'undefined' && SKY.elev != null && SKY.elev < -4;
const bzDay = () => !bzNight();
const BZ = new Map();   // building id -> { k: kind, v: variant }

// ---------- what kind of place each building is: its sign first, then the county roll's owner (only to guess; never shown) ----------
const BZ_NAME = [
  [/salt dome|school ?house|cdl training|administration offices/i, null],
  [/funeral/i, 'b_fun'], [/super 8|\binn\b|hotel|motel/i, 'b_motel'], [/health & rehab|health care|nursing/i, 'b_hosp'],
  [/dental|orthodont/i, 'b_clinic', 'dental'], [/eye clinic|optom/i, 'b_clinic', 'eye'], [/chiropract/i, 'b_clinic', 'chiro'],
  [/health in motion|therapy/i, 'b_clinic', 'pt'], [/medical|clinic|d\.p\.m|cancer/i, 'b_clinic', 'med'],
  [/fitness|\bgym\b/i, 'b_gym'], [/dance/i, 'b_gym', 'dance'], [/head start|child care|daycare/i, 'b_day'], [/lanes|bowling/i, 'b_bowl'],
  [/98\.7|radio/i, 'b_radio'], [/printing/i, 'b_print'], [/self storage|mini warehouse|edison storage/i, 'b_stor'],
  [/car wash|shammy/i, 'b_auto', 'wash'], [/tire|pomp's/i, 'b_auto', 'tire'], [/lube/i, 'b_auto', 'lube'],
  [/auto sales|auto 'n sales/i, 'b_show', 'cars'], [/auto|transmission|service center|garage$|certified service/i, 'b_auto'],
  [/bus co/i, 'b_auto', 'bus'], [/public works|maintenance|department garage|trucking/i, 'b_auto', 'fleet'],
  [/waterworks|water department|treatment plant/i, 'b_fact', 'water'], [/plumbing|electric motor|oil$|amerigas/i, 'b_ware', 'trade'],
  [/kubota|equipment/i, 'b_show', 'equip'], [/mobility/i, 'b_show', 'mobility'], [/kitchen & bath/i, 'b_show', 'kitchen'], [/appliance/i, 'b_show', 'tv'],
  [/realty|realtors|\blaw\b|insurance|usda|kerberrose|cropping|potato exchange|forestry department office|kemmer|public safety|images/i, 'b_office'],
  [/national guard/i, 'b_hall', 'guard'], [/legion/i, 'b_hall', 'legion'], [/exposition|multi-purpose/i, 'b_hall', 'expo'],
  [/farmers market/i, 'b_hall', 'market'], [/escape/i, 'b_hall', 'escape'], [/retirees/i, 'b_hall', 'club'],
  [/sportswear/i, 'b_fact', 'apparel'], [/sartori/i, 'b_fact', 'cheese'], [/slidemaster/i, 'b_fact', 'metal'],
  [/schumitsch|warehousing|storage company|insight fs/i, 'b_ware'],
  [/bakery/i, 'bakery'], [/taphouse|off-sides|jack's|not bob|truck's place/i, 'bar'],
  [/restaurant|pizzeria|tequila|mi tierra|food stand|green hen|herbalife|coffee/i, 'cafe'], [/salon|hair|lash|polished|sams|barber/i, 'salon'],
  [/bank|credit union/i, 'bank'],
];
const BZ_OWN = [
  [/STORAGE/, 'b_stor'], [/TRUCKING|ASPHALT|CONSTRUCTION|CONTAINERS|RUSCH|LAND CORP|B&B LAND/, 'b_auto', 'fleet'],
  [/AUTO|TIRE|LUBE/, 'b_auto'], [/HAIR/, 'salon'], [/DANCE/, 'b_gym', 'dance'], [/CPA|INSURANCE|TELEPHONE|RESOURCE CENTER/, 'b_office'],
  [/DENTAL|HOSP|HEALTH|DOCTOR/, 'b_clinic', 'med'], [/BANK|CREDIT UNION/, 'bank'], [/MEATS|SFC-|RENDERING/, 'b_fact', 'food'],
  [/WOOD/, 'b_fact', 'wood'], [/COIL|PUBLIC SERVICE/, 'b_fact', 'coil'], [/NEON/, 'b_fact', 'signs'], [/BLOCK CO/, 'b_fact', 'block'],
  [/PLASPACK/, 'b_fact', 'plastic'], [/VOLM/, 'b_fact', 'bags'], [/BEARINGS|AMTEC|ACE EQUIPMENT|KEMMER/, 'b_fact', 'metal'],
  [/GROWMARK|SEED|SALVAGE|IRON|SHELDON|KARL'S|WAREHOUS/, 'b_ware'], [/FAIRGROUNDS/, 'b_hall', 'expo'], [/BOW CLUB/, 'b_hall', 'archery'],
  [/ANTIGO CITY|CITY OF ANTIGO|LANGLADE COUN|COUNTY SHOP|COUNTY HWY/, 'city'],
];
function bzDims(b) { const P = b.poly || []; if (!P.length) return [0, 0]; const xs = P.map(p => p[0] * 4), ys = P.map(p => p[1] * 4);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys); return b.face === 'E' || b.face === 'W' ? [h, w] : [w, h]; }
function bzClassify(b) {
  if (!b || !b.poly || roomSkip(b) || b.landmark) return null;
  if (!['store', 'factory', 'civic', 'hospital'].includes(b.type)) return null;
  const own = (b.owner || '').toUpperCase(), n = b.name || '', ok = b.okind || '';
  if (/APART|APTS|TERRACE|HOUSING AUTH|SCHOOL|CHURCH|HISTORICAL/.test(own) || ok === 'church' || ok === 'depot') return null;
  if (!n && ['apartments', 'house'].includes(ok)) return null;
  if ((n && ROOM_HOOK[n]) || ROOM_HOOK[b.addr]) return null;   // a place with its own hook (the chains' side buildings, the opera house) keeps it
  const [w, h] = bzDims(b); if (Math.min(w, h) < 5 || w * h < 40) return null;
  if (n) { for (const [re, k, v] of BZ_NAME) if (re.test(n)) return k ? { k, v: v || '' } : null;
    if (b.type === 'hospital') return { k: 'b_hosp', v: '' }; }
  if (b.type === 'hospital') return { k: 'b_hosp', v: '' };
  for (const [re, k, v] of BZ_OWN) if (re.test(own)) {
    if (k === 'city') return w * h > 500 ? { k: 'b_auto', v: 'fleet' } : { k: 'b_office', v: '' };
    if (k === 'b_ware' && b.type === 'store' && w * h < 160) return { k: 'b_office', v: '' };
    return { k, v: v || '' }; }
  if (b.type === 'factory') return { k: 'b_fact', v: 'gen' };
  if (b.type === 'civic') return { k: 'b_office', v: '' };
  if (n) return { k: 'shop', v: '' };
  if (w * h > 1400) return { k: 'b_ware', v: '' };
  return hash(b.id, 7) % 2 ? { k: 'shop', v: '' } : { k: 'b_office', v: '' };
}
for (const b of BLD) { if (roomEligible(b)) continue; const c = bzClassify(b); if (c) { BZ.set(b.id, c); if (b.name) b.enter = b.enter || 1; } }
// a place that gets its own hook in a later file (the plants and the college in industry.js, the bars) keeps that hook
const bzOwn = b => !!(b && BZ.has(b.id) && !ROOM_HOOK[b.name] && !ROOM_HOOK[b.addr]);
{ const _re = roomEligible; roomEligible = function (b) { return _re(b) || bzOwn(b); }; }
{ const _rh = roomHook; roomHook = function (b) { return bzOwn(b) ? bzHook(b, BZ.get(b.id)) : _rh(b); }; }
ROOM_DOOR = null;   // rebuilt with these doors the first time it's asked
['b_dr', 'b_mat', 'b_rug'].forEach(t => ROOM_WALK.add(t));

// ---------- looks: floors and walls by kind ----------
Object.assign(ROOM_STYLE, {
  b_office: [['carpet', '#5a6a7a', '#52626f'], ['#e8e6e0', '#6a7a8a']], b_clinic: [['lino', '#e4e8e6', '#d2d8d6'], ['#eef4f2', '#4a8aa0']],
  b_hosp: [['lino', '#e2e6ea', '#d0d6dc'], ['#eef2f4', '#5a9ab0']], b_motel: [['carpet', '#7a3a3a', '#6e3434'], ['#efe6d6', '#8a6a4a']],
  b_fact: [['concrete', '#9a9c9a', '#8c8e8c'], ['#d8dadc', '#3a6a9a']], b_ware: [['concrete', '#a0a09c', '#92928e'], ['#dcdcd8', '#c8a030']],
  b_auto: [['concrete', '#8a8c8e', '#7c7e80'], ['#c8ccd0', '#c83a2a']], b_show: [['lino', '#e8e8e4', '#d6d6d0'], ['#f0f0ec', '#3a6a3a']],
  b_gym: [['carpet', '#2e3034', '#3a3c40'], ['#e8e8ec', '#c83a3a']], b_day: [['check', '#f0e8d0', '#e0d8c0'], ['#f4f0e0', '#e8a040']],
  b_fun: [['carpet', '#4e5a4e', '#465246'], ['#ece6d8', '#6a5a4a']], b_bowl: [['carpet', '#2a2a48', '#3a3a5a'], ['#2a2a40', '#c83a8a']],
  b_radio: [['carpet', '#3a3a4a', '#34343f'], ['#e0e0e8', '#3a3a6a']], b_print: [['concrete', '#9a9c9a', '#8c8e8c'], ['#e4e4e0', '#2a6a8a']],
  b_stor: [['concrete', '#a8a8a4', '#9a9a96'], ['#e8e8e4', '#e07a20']], b_hall: [['wood', '#a87a4a', '#986c40'], ['#e8e0cc', '#5a3a2a']],
});
Object.assign(KIND_ZONE, { b_office: 'OFFICE', b_clinic: 'CLINIC', b_hosp: 'HOSPITAL', b_motel: 'HOTEL', b_fact: 'PLANT', b_ware: 'WAREHOUSE',
  b_auto: 'SHOP', b_show: 'SHOWROOM', b_gym: 'GYM', b_day: 'CHILD CARE', b_fun: 'FOYER', b_bowl: 'BOWLING ALLEY', b_radio: 'RADIO STATION',
  b_print: 'PRINT SHOP', b_stor: 'STORAGE', b_hall: 'HALL' });
Object.assign(FOLKS, {
  b_hiv: { skin: '#e2b48e', hair: '#5a3a24', shirt: '#5a6a7a', shirt2: '#4a5a6a', pants: '#3a4a6a', shoes: '#5a3a24', vest: '#d8e040', extra: 'cap' },
  b_hiv2: { skin: '#c99878', hair: '#1e1612', shirt: '#3a3a44', shirt2: '#2e2e38', pants: '#2a3a52', shoes: '#2a2224', vest: '#f08a30', glasses: 1 },
  b_off: { skin: '#ecc19c', hair: '#8a5a2a', shirt: '#7a9ac8', shirt2: '#6a8ab8', pants: '#3a3a44', shoes: '#2a2224' },
  b_off2: { skin: '#d9a77c', hair: '#2a1e18', shirt: '#c86a8a', shirt2: '#b85a7a', pants: '#2a2c34', shoes: '#141416', glasses: 1 },
  b_scrub: { skin: '#e8b898', hair: '#c87a3a', shirt: '#7a5aa8', shirt2: '#6a4a98', pants: '#7a5aa8', shoes: '#f4f4f8' },
  b_coach: { skin: '#c99878', hair: '#2e2018', shirt: '#c83a3a', shirt2: '#a82e2e', pants: '#26262c', shoes: '#f4f4f8' },
  b_teach: { skin: '#ecc19c', hair: '#c8a060', shirt: '#e8a040', shirt2: '#d89030', pants: '#3a4a6a', shoes: '#5a3a24' },
  b_house: { skin: '#d9a77c', hair: '#3a2a20', shirt: '#6a8a9a', shirt2: '#5a7a8a', pants: '#2a2c34', shoes: '#141416', apron: '#e8e4dc' },
});
const BZ_FOLK = ['r_sh1', 'r_sh2', 'r_sh3', 'r_sh4', 'r_sh5', 'r_sh6'];

// ---------- the plan helpers ----------
function bzK(F, c) {
  const { R, W, H } = F, S = F.bz = { lk: new Map(), zn: [], fs: new Uint8Array(W * H), v: F.bzv || '' };
  const keep = new Set([F.ey * W + F.ex, (F.ey - 1) * W + F.ex]), np = new Set(), iw = new Set();
  const fl = (u, v) => v >= 0 && v < H && u >= 0 && u < W && R[v][u] === '.';
  const K = { F, R, W, H, S, keep, np, fl, xs: F.ud, yb: F.vd - 1, x0: c.fx0, x1: c.fx1, y0: c.fy0, y1: c.fy1,
    set(u, v, t, l) { if (!fl(u, v) || keep.has(v * W + u) || np.has(v * W + u)) return false; R[v][u] = t; if (l) S.lk.set(v * W + u, l); return true; },
    wall(u, v) { if (fl(u, v) && !keep.has(v * W + u)) { R[v][u] = 'W'; iw.add(v * W + u); } },
    door(u, v) { if (R[v] && (fl(u, v) || iw.has(v * W + u))) { R[v][u] = 'b_dr'; iw.delete(v * W + u); for (const [a, b] of [[u, v - 1], [u, v + 1], [u - 1, v], [u + 1, v]]) if (fl(a, b)) keep.add(b * W + a); } },
    hwall(v, u0, u1, doors) { for (let u = u0; u <= u1; u++) if (doors && doors.includes(u)) K.door(u, v); else K.wall(u, v); },
    vwall(u, v0, v1, doors) { for (let v = v0; v <= v1; v++) if (doors && doors.includes(v)) K.door(u, v); else K.wall(u, v); },
    zone(x0, x1, y0, y1, n) { S.zn.push({ x0, x1, y0, y1, n, a: (x1 - x0 + 1) * (y1 - y0 + 1) }); },
    floor(x0, x1, y0, y1, s) { for (let v = Math.max(0, y0); v <= Math.min(H - 1, y1); v++) for (let u = Math.max(0, x0); u <= Math.min(W - 1, x1); u++) S.fs[v * W + u] = s; },
    near(u, v, r, loose) { for (let d = 0; d <= r; d++) for (let dv = -d; dv <= d; dv++) for (let du = -d; du <= d; du++) { if (Math.max(Math.abs(du), Math.abs(dv)) !== d) continue;
        const a = u + du, b = v + dv; if (fl(a, b) && !keep.has(b * W + a) && !np.has(b * W + a) && (loose || (fl(a - 1, b) && fl(a + 1, b)) || (fl(a, b - 1) && fl(a, b + 1)))) return [a, b]; }
      return null; },
    npc(folk, u, v, name, lines, o) { o = o || {}; const q = o.exact && fl(u, v) && !np.has(v * W + u) ? [u, v] : K.near(u, v, o.r || 3, o.loose); if (!q) return null;
      np.add(q[1] * W + q[0]); const L = Array.isArray(lines) ? lines : [lines];
      const n = { x: q[0], y: q[1], folk, name, bz: o.behind ? 0 : 1, talk: o.talk || (() => say([[name, L[(q[0] + q[1]) % L.length]]])) }; if (o.day) n.when = bzDay; F.npcs.push(n); return n; },
  };
  return K;
}
const bzPick = (a, i) => a[((i % a.length) + a.length) % a.length];
// the front room: a desk on the roomier side of the door, seats along the windows on the other, a TV facing them
function bzLobby(K, xa, xb, y0, y1, o) {
  const { xs } = K, d = xs - xa >= xb - xs ? -1 : 1, dv = Math.max(y0 + 1, Math.min(y1 - 2, y0 + 1));
  if (o.desk !== false) { for (let i = 2; i <= 4; i++) K.set(xs + d * i, dv, i === 4 ? 'k' : 'c', o.deskText);
    if (o.shelf) for (let i = 2; i <= 4; i++) if (dv - 2 >= y0) K.set(xs + d * i, dv - 2, o.shelf, o.shelfText);
    K.npc(o.folk || 'receptionist', xs + d * 3, dv - 1, o.who || 'Front desk', o.hello || 'Welcome in! Have a seat.', { exact: 1, loose: 1, talk: o.talk, day: o.day, behind: 1 }); }
  for (let i = 2; i <= 6; i++) if (xs - d * i >= xa && xs - d * i <= xb) K.set(xs - d * i, y1, o.seat || 'h', o.seatText || 'A chair in the waiting area.');
  if (y1 - y0 >= 3 && o.tv !== false) { K.set(xs - d * 4, y0, 'b_tv', o.tvText); K.set(xs - d * 3, y0, o.side || 'P'); if (xs - d * 6 >= xa && xs - d * 6 <= xb) K.set(xs - d * 6, y0, o.side2 || 'b_sofa'); }
  if (xb - xa >= 12) { K.set(xs - d * 8, y1, 'h'); K.set(xs - d * 9, y1, 'h'); K.set(xs - d * 8, y1 - 2, 'T'); }
  K.set(xa, y1, 'P'); K.set(xb, y1, 'P'); if (o.extra) o.extra(d, dv);
  K.zone(xa, xb, y0, K.y1, o.zone || 'LOBBY');
  return d;
}
// rooms off halls: a spine up from the door, halls across it, a row of rooms on each side of each hall
function bzGrid(K, y0, y1, cw, cd, fill) {
  const { xs, x0, x1 } = K, sp0 = xs - 1, sp1 = xs + 1, T = y1 - y0 + 1, U = 2 * cd + 5, n = Math.floor((T + 1) / U), bands = [];
  if (n < 1) { if (T < cd + 3) return null; bands.push({ c0: y1 - 1, c1: y1, hi: [y0, y1 - 3], whi: y1 - 2 }); }
  for (let k = 0; k < n; k++) { const base = y1 - k * U, wlo = base - cd, c0 = wlo - 2, whi = c0 - 1;
    bands.push({ lo: [base - cd + 1, base], wlo, c0, c1: wlo - 1, whi, hi: [k === n - 1 ? y0 : whi - cd, whi - 1], sep: k < n - 1 ? whi - cd - 1 : null }); }
  const spine = u => u >= sp0 && u <= sp1, cells = [];
  const hw = v => { for (let u = x0; u <= x1; u++) if (!spine(u)) K.wall(u, v); };
  for (const B of bands) {
    if (B.lo) hw(B.wlo); hw(B.whi); if (B.sep != null) hw(B.sep);
    K.zone(x0, x1, B.c0, B.c1, 'HALLWAY');
    for (const [r, drow, up] of [[B.lo, B.wlo, true], [B.hi, B.whi, false]]) { if (!r || r[1] < r[0]) continue;
      for (const dir of [-1, 1]) { let wu = dir < 0 ? sp0 - 1 : sp1 + 1;
        while (dir < 0 ? wu > x0 : wu < x1) {
          for (let v = r[0]; v <= r[1]; v++) K.wall(wu, v);
          const a = dir < 0 ? Math.max(x0, wu - cw) : wu + 1, b = dir < 0 ? wu - 1 : Math.min(x1, wu + cw);
          let ca = a, cb = b; if (dir < 0 && a - x0 < 3) ca = x0; if (dir > 0 && x1 - b < 3) cb = x1;
          if (cb - ca < 1) break;
          const du = (ca + cb) >> 1; K.door(du, drow);
          cells.push({ x0: ca, x1: cb, y0: r[0], y1: r[1], du, dv: drow, up });
          wu = dir < 0 ? ca - 1 : cb + 1; } } }
  }
  K.zone(sp0, sp1, y0, y1, 'HALLWAY');
  cells.sort((a, b) => (b.y1 - a.y1) || (Math.abs(a.du - xs) - Math.abs(b.du - xs)));
  cells.forEach((c, i) => fill(c, i));
  return cells;
}
// rooms side by side behind the front room, each with its own door to it
function bzRooms(K, p, y0, list) {
  const { x0, x1, xs } = K, tw = list.reduce((a, r) => a + r.w, 0), span = x1 - x0 + 1; let acc = 0; const out = [];
  K.hwall(p, x0, x1, []);
  list.forEach((r, i) => { const a = x0 + Math.round(acc / tw * span); acc += r.w; const b = x0 + Math.round(acc / tw * span) - 1;
    const ra = i ? a + 1 : a; if (i) K.vwall(a, y0, p - 1, []);
    const du = xs >= ra && xs <= b ? xs : Math.max(ra, Math.min(b, (ra + b) >> 1)); K.door(du, p); if (b - ra >= 4) K.door(du + (du + 1 <= b ? 1 : -1), p);
    out.push({ x0: ra, x1: b, y0, y1: p - 1, du }); });
  list.forEach((r, i) => { const c = out[i]; if (r.zone) K.zone(c.x0, c.x1, c.y0, c.y1, r.zone); if (r.fill) r.fill(c); });
  return out;
}
// the front of a plant or a shop: a lobby at the door, offices to one side, a break room to the other
function bzFront(K, D, o) {
  const { xs, x0, x1, yb } = K, p = yb - D, y0 = p + 1, la = Math.max(x0, xs - 4), lb = Math.min(x1, xs + 4), pass = yb - 1;
  K.hwall(p, x0, x1, [xs - 1, xs, xs + 1]);
  K.floor(x0, x1, y0, K.y1, o.carpet || 2);
  const fillR = (t, a, b) => {
    const m = (a + b) >> 1, lastRow = pass - 2;
    if (t === 'office') { for (let u = a + 1; u <= b - 1; u += 3) for (let v = y0; v + 1 <= lastRow; v += 3) { K.set(u, v, 'd'); K.set(u, v + 1, 'h'); }
      K.set(b, yb, 'F'); K.set(a, yb, 'b_cop'); K.set(m, yb, 'F'); K.npc(bzPick(['b_off', 'b_off2'], a), m, Math.min(lastRow, y0 + 2), 'Office', BZ_TALK.office, { day: 1, loose: 1 }); K.zone(a, b, y0, K.y1, 'OFFICE'); }
    else if (t === 'break') { K.set(a, y0, 'b_frg'); K.set(a + 1, y0, 'b_mw'); K.set(a + 2, y0, 'b_mw'); K.set(b, y0, 'b_vend'); K.set(m, yb, 'b_tv', 'The break room TV. The local news is on, the sound low.');
      if (b - a >= 6) K.set(b - 1, y0, 'b_vend');
      const tv = y0 + 2; if (tv + 1 <= lastRow + 1) for (let u = a + 1; u <= b - 1; u += 4) { K.set(u, tv, 'T'); K.set(u + 1, tv, 'T'); K.set(u, tv - 1, 'h'); K.set(u + 1, tv + 1, 'h'); }
      K.set(a, yb, 'b_lock'); K.set(b, yb, 'b_lock'); K.npc(bzPick(BZ_FOLK, a), m, y0 + 1, 'On break', BZ_TALK.brk, { day: 1, loose: 1 }); K.zone(a, b, y0, K.y1, 'BREAK ROOM'); }
    else if (t === 'wc') { for (let u = a; u <= b; u += 2) K.set(u, y0, 'b_wc'); K.zone(a, b, y0, K.y1, 'RESTROOMS'); }
    else if (t === 'parts') { for (let u = a; u <= b; u++) { K.set(u, y0, 'G', 'Shelves of parts in labeled boxes.'); } K.set(m, y0 + 2, 'c'); K.set(m + 1, y0 + 2, 'k'); K.zone(a, b, y0, K.y1, 'PARTS'); }
    else if (t === 'control') { for (let u = a + 1; u <= b - 1; u += 2) K.set(u, y0, 'M', 'Screens showing the pumps, the tanks and the pressure in the mains.'); K.set(m, y0 + 2, 'T'); K.set(m - 1, y0 + 2, 'h');
      K.npc('b_hiv2', m + 1, y0 + 1, 'Operator', BZ_TALK.water, { day: 1, loose: 1 }); K.zone(a, b, y0, K.y1, 'CONTROL ROOM'); }
  };
  const rooms = o.rooms || ['office', 'break', 'wc', 'office'];
  if (la - x0 >= 4) K.vwall(la - 1, y0, K.y1, [pass]); if (x1 - lb >= 4) K.vwall(lb + 1, y0, K.y1, [pass]);
  let ti = 0;
  for (const dir of [1, -1]) { let u = dir < 0 ? la - 2 : lb + 2;
    while (dir < 0 ? u - x0 >= 2 : x1 - u >= 2) {
      let a = dir < 0 ? Math.max(x0, u - 8) : u, b = dir < 0 ? u : Math.min(x1, u + 8);
      if (dir < 0 && a - x0 < 5) a = x0; if (dir > 0 && x1 - b < 5) b = x1;
      fillR(rooms[ti++ % rooms.length], a, b);
      const wu = dir < 0 ? a - 1 : b + 1; if (dir < 0 ? wu <= x0 : wu >= x1) break;
      K.vwall(wu, y0, K.y1, [pass]); u = dir < 0 ? wu - 1 : wu + 1; } }
  bzLobby(K, la, lb, y0, yb, o.lobby || {});
  return p;
}
// a plant floor: forklift aisles up the middle and across, dock doors on the back wall, racks on the side walls, machines between
function bzProd(K, y0, y1, o) {
  const { R, W, xs, x0, x1 } = K, v = o.v || 'gen', A = new Set();
  K.floor(x0, x1, y0, y1, o.ware ? 1 : 9);
  const markA = (u, w) => { if (!K.fl(u, w)) return; A.add(w * W + u); K.keep.add(w * W + u); K.S.fs[w * W + u] = 8; };
  for (let w = y0; w <= y1; w++) for (let u = xs - 1; u <= xs + 1; u++) markA(u, w);
  const cross = []; for (let w = y1 - 1; w >= y0 + 4; w -= 12) { cross.push(w); for (let u = x0; u <= x1; u++) { markA(u, w); markA(u, w + 1); } }
  // dock doors on the back wall, an apron in front of each
  let docks = 0;
  for (let u = x0 + 3; u <= x1 - 2; u += 8) { let t = -1; for (let w = 0; w < K.H; w++) if (R[w][u] !== ' ' && R[w][u] !== 'W') { t = w; break; }
    if (t < 1 || t > y0 + 2 || R[t - 1][u] !== 'W' || (t >= 2 && R[t - 2][u] !== ' ')) continue;
    R[t - 1][u] = o.door || 'b_dock'; docks++; markA(u, t); markA(u, t + 1); K.set(u - 2, t, 'B', 'Pallets of boxes, wrapped and labeled for shipping.'); K.set(u + 2, t, 'B', 'Pallets waiting at the dock door.'); }
  if (docks) K.zone(x0, x1, y0, y0 + 3, o.ware ? 'SHIPPING & RECEIVING' : 'LOADING DOCK');
  // racks along the side walls
  for (let w = y0; w <= y1; w++) { let l = -1, r = -1; for (let u = x0; u <= x1; u++) if (K.fl(u, w) || A.has(w * W + u)) { if (l < 0) l = u; r = u; }
    if (l < 0 || A.has(w * W + l)) continue; K.set(l, w, 'r_H', 'Pallet racking, stocked to the top.'); if (!A.has(w * W + r)) K.set(r, w, 'r_H', 'Pallet racking, stocked to the top.'); }
  // the regions between the aisles
  const cuts = [y0 + 3].concat(cross.slice().reverse().map(c => c + 2)), regs = [];
  for (let i = 0; i < cuts.length; i++) { const a = cuts[i], b = (i + 1 < cuts.length ? cross[cross.length - 1 - i] : y1 + 1) - 1; if (b - a >= 1) regs.push([a, b]); }
  const M = BZ_MACH[v] || BZ_MACH.gen, blocks = []; let ri = 0;
  for (const [a, b] of regs) for (const [L, Rr] of [[x0 + 2, xs - 3], [xs + 3, x1 - 2]]) { if (Rr - L < 1) continue; ri++;
    if (o.ware) { for (let u = L; u + 1 <= Rr; u += 5) for (let w = a; w <= b; w++) { K.set(u, w, 'r_H', 'Pallet racks, two deep, stocked to the top.'); K.set(u + 1, w, 'r_H', 'Pallet racks, two deep, stocked to the top.'); } continue; }
    const [bw, bh, gx, gy, conv] = M;
    for (let w = a; w + bh - 1 <= b; w += bh + gy) { let prev = null;
      for (let u = L; u + bw - 1 <= Rr; u += bw + gx) { let ok = true; for (let j = 0; j < bh && ok; j++) for (let i = 0; i < bw; i++) if (!K.fl(u + i, w + j) || K.keep.has((w + j) * W + u + i)) { ok = false; break; }
        if (!ok) { prev = null; continue; }
        for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) K.set(u + i, w + j, 'b_mc');
        blocks.push([u, w, bw, bh]);
        if (conv && prev && (ri + w) % 3 !== 0) for (let q = prev + 1; q < u; q++) K.set(q, w + (bh >> 1), 'b_cv');
        prev = u + bw - 1; } } }
  // forklifts parked along the aisles, people at the machines (on shift during the day)
  cross.forEach((c, i) => { const u = i % 2 ? xs - 4 - (i * 3) % 6 : xs + 4 + (i * 5) % 6; if (K.fl(u, c)) R[c][u] = 'b_fork'; });
  if (!cross.length && K.fl(xs + 2, y1)) R[y1][xs + 2] = 'b_fork';
  const nW = Math.min(36, Math.max(2, Math.round(blocks.length / 3)));
  for (let i = 0; i < nW && i < blocks.length; i++) { const [u, w, bw, bh] = blocks[(i * 7) % blocks.length];
    K.npc(i % 3 ? 'b_hiv' : 'b_hiv2', u + bw, w + (bh >> 1), o.ware ? 'Warehouse' : 'Operator', o.ware ? BZ_TALK.ware : BZ_TALK.fact, { day: 1, r: 2 }); }
  if (o.ware) for (let i = 0; i < 3; i++) K.npc('b_hiv', xs + (i - 1) * 6, Math.round(y0 + (y1 - y0) * (i + 1) / 4), 'Warehouse', BZ_TALK.ware, { day: 1, r: 4 });
  K.zone(x0, x1, y0, y1, o.zone || (o.ware ? 'WAREHOUSE' : 'PRODUCTION FLOOR'));
}
// variants: [block width, block depth, gap across, gap down, conveyors between]
const BZ_MACH = { gen: [2, 2, 2, 2, 1], metal: [2, 2, 2, 2, 0], plastic: [3, 2, 2, 2, 0], wood: [3, 2, 2, 2, 1], bags: [2, 2, 2, 2, 1], food: [3, 3, 2, 2, 1], cheese: [3, 3, 2, 2, 1],
  coil: [2, 2, 2, 2, 0], signs: [3, 2, 2, 2, 0], block: [3, 2, 2, 2, 1], water: [2, 2, 2, 2, 0], apparel: [1, 1, 1, 1, 0], print: [3, 2, 2, 2, 0] };
// service bays: lifts with cars up on them (or trucks parked in the city shops), bay doors in the back wall
function bzBays(K, y0, y1, v) {
  const { R, W, x0, x1, xs } = K, truck = v === 'fleet' || v === 'bus', wash = v === 'wash', L = truck ? 7 : 4;
  K.floor(x0, x1, y0, y1, 1);
  for (let u = x0; u <= x1; u++) for (const w of [y1 - 1, y1]) if (K.fl(u, w)) { K.keep.add(w * W + u); K.S.fs[w * W + u] = 8; }
  const rows = []; for (let r = y0 + 1; r + L - 1 <= y1 - 3; r += L + 3) rows.push(r);
  let nb = 0;
  for (const r0 of rows) for (let u = x0 + 2; u + 3 <= x1 - 1; u += 5) {
    const bu = wash ? u + 1 : u, bw = wash ? 2 : 3; let ok = true;
    for (let j = 0; j < L && ok; j++) for (let i = 0; i < bw; i++) if (!K.fl(bu + i, r0 + j)) { ok = false; break; }
    if (!ok) continue;
    for (let j = 0; j < L; j++) for (let i = 0; i < bw; i++) K.set(bu + i, r0 + j, truck ? 'b_trk' : wash ? 'b_car' : 'Q');
    if (wash) { K.set(u, r0 + 1, 'b_brush'); K.set(u + 3, r0 + 2, 'b_brush'); } else K.set(u + 3, r0, 'q');
    if (r0 === rows[0]) for (let i = 0; i < 3; i++) { const c = u + i, t = r0 - 1; if (R[t] && R[t][c] === '.' && R[t - 1] && R[t - 1][c] === 'W' && (!R[t - 2] || R[t - 2][c] === ' ')) R[t - 1][c] = 'b_bay'; else if (R[t] && R[t][c] === 'W' && (!R[t - 1] || R[t - 1][c] === ' ')) R[t][c] = 'b_bay'; }
    if (nb++ % 2 === 0) K.npc(truck ? 'b_hiv' : 'mechanic', u + 4, r0 + 2, truck ? 'Shop crew' : 'Mechanic', truck ? BZ_TALK.fleet : wash ? BZ_TALK.wash : BZ_TALK.auto, { r: 2, day: truck }); }
  for (let w = y0; w <= y1 - 3; w++) { let l = -1, r = -1; for (let u = x0; u <= x1; u++) if (K.fl(u, w)) { if (l < 0) l = u; r = u; } if (l < 0) continue;
    if (!wash) K.set(l, w, v === 'tire' || w % 3 ? 'b_tire' : 'G', v === 'tire' ? 'Tires on the racks, sorted by size.' : undefined);
    if (r - l > 6) K.set(r, w, w % 2 ? 'b_bench' : 'q'); }
  if (!nb) { K.set(xs + 2, y0 + 1, 'b_bench'); K.set(xs - 2, y0 + 1, 'q'); K.npc(truck ? 'b_hiv' : 'mechanic', xs + 1, y0 + 3, 'Mechanic', BZ_TALK.auto, { r: 3, loose: 1 }); }
  K.zone(x0, x1, y0, y1, wash ? 'WASH BAY' : truck ? 'GARAGE' : 'SERVICE BAYS');
}

// ---------- the layouts ----------
const BZ_TALK = {
  office: ['Busy day. The coffee in the break room helps.', 'Just catching up on email.', 'Meeting in ten minutes. Then another one.', 'If you need anything, the front desk can help.'],
  brk: ['Fifteen minutes. Just enough for a cup of coffee.', 'Somebody brought donuts. Help yourself.', 'Lunch is leftovers from last night. Still good.'],
  fact: ['Keep to the yellow lines. Forklifts have the right of way.', 'Safety glasses and earplugs out on the floor.', 'This line runs all day. Break\'s in twenty minutes.', 'Watch your step, the floor gets slick by the machines.'],
  ware: ['Everything has a spot on the racks, and a number for that spot.', 'Trucks in the morning, trucks in the afternoon.', 'Watch for the forklifts. They beep when they back up.'],
  water: ['We test the water all day long. It\'s good water.', 'The pumps keep the pressure up in every pipe in town.'],
  auto: ['We\'ll have it up on the lift in a few minutes.', 'Oil change and a tire rotation. Should be about an hour.', 'Sounds like a belt. We\'ll take a look.'],
  fleet: ['Plow season is coming. We\'re getting the trucks ready.', 'Every truck gets checked over before it goes out.'],
  wash: ['Pull it in slow. The brushes do the rest.'],
};
function bzOffice(K, F) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1, wid = x1 - x0 + 1, safety = /public safety/i.test(F.b.name || '');
  const lob = { folk: 'receptionist', who: safety ? 'Window' : 'Front desk', hello: safety ? 'Hello. How can I help you today?' : (F.b.name ? 'Welcome to ' + F.b.name + '! Have a seat, someone will be right with you.' : 'Welcome in. Have a seat, someone will be right with you.') };
  K.floor(x0, x1, y0, K.y1, 2);
  if (depth < 11 || wid < 9) { bzLobby(K, x0, x1, Math.max(y0, yb - 4), yb, lob);
    for (let v = y0; v <= yb - 6; v += 3) for (let u = x0 + 1; u <= x1 - 1; u += 3) { if (Math.abs(u - xs) < 2) continue; K.set(u, v, 'd'); K.set(u, v + 1, 'h'); }
    for (let v = y0; v <= yb - 5; v += 2) K.set(x1, v, 'F'); K.npc('b_off', xs + 2, y0 + 2, 'Office', BZ_TALK.office, { loose: 1 }); K.zone(x0, x1, y0, yb - 5, 'OFFICE'); return; }
  const D = Math.max(4, Math.min(7, Math.round(depth * 0.25))), p = yb - D;
  K.hwall(p, x0, x1, [xs - 1, xs, xs + 1]); bzLobby(K, x0, x1, p + 1, yb, Object.assign(lob, { zone: 'RECEPTION' }));
  bzGrid(K, y0, p - 1, 4, 4, (c, i) => bzCell(K, c, i === 0 ? 'conf' : i === 1 ? 'break' : i === 2 && c.x1 - c.x0 >= 2 ? 'copy' : 'office', i));
}
// one room off a hall, furnished for what it is
function bzCell(K, c, t, i) {
  const { x0, x1, y0, y1, du, up } = c, far = up ? y1 : y0, nearR = up ? y0 : y1, step = up ? -1 : 1, side = du - x0 >= x1 - du ? x0 : x1, other = side === x0 ? x1 : x0, m = (x0 + x1) >> 1;
  const z = n => K.zone(x0, x1, y0, y1, n);
  switch (t) {
    case 'office': K.set(m, far + step, 'd'); K.set(m, far, 'h'); K.set(m, far + 2 * step, 'h'); K.set(side, far, 'F'); K.set(other, nearR, 'P'); K.set(other, far, 'K', 'Shelves of binders and books.');
      if (i % 3 === 0) K.npc(i % 2 ? 'b_off' : 'b_off2', m + (m + 1 <= x1 ? 1 : -1), far, 'Office', BZ_TALK.office, { exact: 1, loose: 1, day: 1 }); z('OFFICE'); break;
    case 'conf': for (let u = x0 + 1; u <= x1 - 1; u++) { K.set(u, far + step * 2, 'T'); K.set(u, far + step, 'h'); K.set(u, far + step * 3, 'h'); }
      K.set(m, far, 'b_tv', 'A big screen on the wall for meetings. It says: No signal.'); K.set(x0, far, 'P'); z('CONFERENCE ROOM'); break;
    case 'break': K.set(x0, far, 'b_frg'); K.set(x0 + 1, far, 'b_mw'); K.set(x1, far, 'b_vend'); K.set(m + 1 <= x1 - 1 ? m + 1 : m, far, 'b_tv', 'The break room TV. The local news is on, the sound low.');
      K.set(m, far + step * 2, 'T'); K.set(m, far + step * 3, 'h'); K.set(m - 1, far + step * 2, 'h'); z('BREAK ROOM'); break;
    case 'copy': K.set(x0, far, 'b_cop'); K.set(x1, far, 'F'); K.set(x0, far + step, 'F'); K.set(x1, far + step, 'b_wcool'); z('COPY ROOM'); break;
    case 'motel': { const bx = side === x0 ? x0 : x1 - 1, hr = up ? y1 - 1 : y0, sp = ['#c8a050', '#5a7a9a', '#8a5a6a', '#6a8a5a'][(i + K.F.seed) % 4];
      for (const bu of [bx, bx + 1]) { K.set(bu, hr, 'b_bed', 'Room ' + (101 + i) + '. The bed is made, with a stack of pillows.'); K.set(bu, hr + 1, 'b_bedf', 'Room ' + (101 + i) + '. The bed is made, with a stack of pillows.'); }
      K.set(side === x0 ? bx + 2 : bx - 1, hr, 'b_ns'); K.set(other, up ? y1 : y0, 'b_tvd', 'A dresser with a TV on top. The remote is in a little basket.');
      K.set(other, up ? y0 + (y1 - y0 > 3 ? 1 : 0) : y1 - 1, 'b_wc', 'The bathroom: towels folded on the rack, little soaps by the sink.'); K.set(other, up ? y1 - 2 : y0 + 2, 'h');
      K.floor(x0, x1, y0, y1, 7); z('ROOM ' + (101 + i)); break; }
    case 'patient': { const bx = side, hr = up ? y1 - 1 : y0;
      K.set(bx, hr, 'b_hb'); K.set(bx, hr + 1, 'b_hbf'); K.set(bx === x0 ? bx + 1 : bx - 1, hr, 'h'); K.set(other, up ? y1 : y0, 'b_tv', 'A TV on a swing arm, turned off.');
      K.set(other, up ? y0 + 1 : y1 - 1, 'b_snk'); K.set(bx === x0 ? bx + 1 : bx - 1, hr + (up ? -1 : 2), 'b_cur');
      K.floor(x0, x1, y0, y1, 3); z('PATIENT ROOM'); break; }
    case 'nurse': { for (let u = x0; u <= x1; u++) K.set(u, nearR - step, u === x1 ? 'k' : 'c');
      for (let u = x0; u <= x1; u += 2) K.set(u, far, 'M', 'A computer with charts on it.'); K.set(x1, far - step, 'F');
      K.npc('nurse', m, far + step, 'Nurse', ['Visiting someone? Rooms are down this hall. Check in at the front desk first.', 'It\'s a calm shift so far. That\'s how we like it.'], { exact: 1, loose: 1, behind: 1 });
      K.floor(x0, x1, y0, y1, 3); z('NURSES\' STATION'); break; }
    case 'exam': { const v = K.S.v;
      K.set(m, far + step, v === 'dental' || v === 'eye' ? 'b_dch' : 'b_ex', v === 'dental' ? 'A dentist\'s chair, a light swung over it.' : v === 'eye' ? 'An exam chair, the lens machine swung beside it.' : v === 'pt' ? 'A treatment table.' : 'An exam table with a fresh sheet of paper on it.');
      K.set(side, far, 'b_snk'); K.set(other, far, v === 'eye' ? 'b_chart' : 'F'); K.set(other, nearR, 'h'); if (v === 'pt') K.set(side, nearR, 'b_bk');
      K.floor(x0, x1, y0, y1, 3); z(v === 'dental' ? 'OPERATORY' : 'EXAM ROOM'); break; }
  }
}
function bzClinic(K, F) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1, v = K.S.v, title = v === 'dental' ? 'Dental assistant' : 'Assistant';
  const lob = { folk: 'receptionist', who: 'Front desk', hello: (F.b.name ? 'Welcome to ' + F.b.name + '! ' : 'Hi there! ') + 'Checking in? Have a seat, they\'ll call your name.', zone: 'WAITING ROOM',
    tvText: 'A TV in the waiting room, playing a cooking show with the sound low.', extra: (d) => { K.set(xs - d * 7, yb - 2, 'b_toy', 'A little shelf of toys and picture books for kids who are waiting.'); K.set(xs - d * 2, yb - 3, 'b_wcool'); } };
  K.floor(x0, x1, y0, K.y1, 3);
  if (depth < 12) { const p = yb - Math.max(4, depth >> 1); if (p - y0 >= 2) { K.hwall(p, x0, x1, [xs]); for (let u = x0 + 1; u <= x1 - 1; u += 4) if (Math.abs(u - xs) > 1) bzCell(K, { x0: u - 1, x1: Math.min(x1, u + 1), y0, y1: p - 1, du: xs, up: false }, 'exam', u); }
    bzLobby(K, x0, x1, p + 1, yb, lob); K.npc(v === 'dental' ? 'b_scrub' : 'nurse', xs + 1, y0 + 1, title, 'We\'ll be right with you.', { loose: 1 }); return; }
  const p = yb - Math.max(5, Math.min(8, Math.round(depth * 0.3)));
  K.hwall(p, x0, x1, [xs - 1, xs, xs + 1]); bzLobby(K, x0, x1, p + 1, yb, lob);
  bzGrid(K, y0, p - 1, 4, 4, (c, i) => bzCell(K, c, i === 1 ? 'office' : i === 2 ? 'break' : 'exam', i));
  K.npc(v === 'dental' ? 'b_scrub' : 'nurse', xs, p - 2, title, ['The exam rooms are down the hall. We\'ll come get you.', 'Right this way when it\'s your turn.'], { r: 4 });
}
function bzHosp(K, F) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1;
  const lob = { folk: 'receptionist', who: 'Front desk', hello: ['Welcome! Here to visit someone? I can point you the right way.'], zone: 'LOBBY',
    tvText: 'A TV in the lobby, with the weather on.', extra: d => { K.set(xs - d * 2, yb - 3, 'b_vend'); K.set(xs - d * 3, yb - 3, 'b_vend'); } };
  K.floor(x0, x1, y0, K.y1, 3);
  const p = yb - Math.max(5, Math.min(8, Math.round(depth * 0.22)));
  if (p - y0 < 7) { bzLobby(K, x0, x1, y0, yb, lob); return; }
  K.hwall(p, x0, x1, [xs - 1, xs, xs + 1]); bzLobby(K, x0, x1, p + 1, yb, lob);
  bzGrid(K, y0, p - 1, 4, 5, (c, i) => bzCell(K, c, i === 0 ? 'nurse' : i === 3 ? 'break' : 'patient', i));
  K.npc('volunteer', xs + 2, yb - 2, 'Volunteer', 'Hi there! I help folks find their way around. We\'re glad you\'re here.', { r: 3 });
  K.npc('nurse', xs, (y0 + p) >> 1, 'Nurse', ['Visiting hours are posted at the front desk.', 'If you need anything, just ask at the nurses\' station.'], { r: 5 });
}
function bzMotel(K, F) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1, nm = F.b.name || 'the hotel';
  const lob = { folk: 'receptionist', who: 'Front desk', hello: ['Welcome to ' + nm + '! Checking in? Breakfast is out in the morning, right over there.'], zone: 'LOBBY', side2: 'b_sofa',
    tvText: 'A TV in the lobby, with the weather on.', extra: (d) => { for (let i = 2; i <= 4; i++) K.set(xs - d * i, K.yb - 3, i === 2 ? 'b_mw' : 'b_mw', 'The breakfast counter: coffee, juice, cereal and a waffle maker.'); for (let i = 7; i <= 10; i += 3) { K.set(xs - d * i, K.yb - 3, 'T'); K.set(xs - d * i, K.yb - 2, 'h'); } } };
  K.floor(x0, x1, y0, K.y1, 7);
  const p = yb - Math.max(5, Math.min(8, Math.round(depth * 0.25)));
  if (p - y0 < 7) { bzLobby(K, x0, x1, y0, yb, lob); return; }
  K.hwall(p, x0, x1, [xs - 1, xs, xs + 1]); bzLobby(K, x0, x1, p + 1, yb, lob);
  bzGrid(K, y0, p - 1, 4, 5, (c, i) => bzCell(K, c, 'motel', i));
  K.npc('b_house', xs, (y0 + p) >> 1, 'Housekeeping', 'Fresh towels on the cart if you need them.', { r: 5, day: 1 });
  K.npc('r_sh5', xs - 1, p - 2, 'Guest', ['Passing through on the way up north.', 'The waffle maker is the best part of the trip.'], { r: 6 });
}
function bzPlant(K, F, ware) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1, wid = x1 - x0 + 1, v = K.S.v;
  if (depth < 16 || wid < 14) { K.floor(x0, x1, y0, K.y1, 1);
    K.set(xs + 2, yb - 1, 'd', 'A desk by the door, covered in work orders.'); K.set(xs + 3, yb - 1, 'h'); K.set(xs - 2, yb, 'b_tv', 'A little TV on a shelf by the door.'); K.set(xs - 3, yb, 'b_mw');
    bzProd(K, y0, yb - 3, { v, ware, zone: v === 'water' ? 'PUMP ROOM' : undefined }); return; }
  const D = depth > 40 ? 7 : depth > 24 ? 6 : 5;
  const p = bzFront(K, D, { rooms: v === 'water' ? ['control', 'office', 'wc'] : ['office', 'break', 'wc', 'office', 'office'], lobby: { folk: 'receptionist', who: 'Front desk',
    hello: (F.b.name ? 'Welcome to ' + F.b.name + '. ' : 'Hi there. ') + 'Visitors sign in here, and safety glasses go on before the floor.', tvText: 'A TV in the lobby, playing a video about safety on the floor.', day: 1 } });
  bzProd(K, y0, p - 1, { v, ware, zone: v === 'water' ? 'PUMP ROOM' : undefined });
}
function bzAuto(K, F) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1, wid = x1 - x0 + 1, v = K.S.v, truck = v === 'fleet' || v === 'bus';
  const lob = { folk: truck ? 'b_hiv2' : 'mechanic', who: truck ? 'Shop office' : 'Service desk', day: truck,
    hello: truck ? ['This is the shop. Trucks come in here to get worked on.'] : [(F.b.name ? 'Welcome to ' + F.b.name + '! ' : '') + 'Dropping off? Leave the keys and we\'ll call when it\'s ready.'],
    shelf: 'G', shelfText: 'Parts on the shelves behind the counter.', tvText: 'A TV in the waiting area, a game show on.', extra: d => K.set(xs - d * 2, K.yb - 3, 'b_mw', 'Free coffee for folks waiting on their car.') };
  if (depth < 13 || wid < 9) { K.floor(x0, x1, y0, K.y1, 1); bzLobby(K, x0, x1, Math.max(y0, yb - 4), yb, lob); bzBays(K, y0, yb - 6, v); return; }
  const D = depth > 30 ? 7 : 6, p = yb - D;
  if (wid >= 22) bzFront(K, D, { carpet: 5, rooms: truck ? ['office', 'break', 'wc'] : ['parts', 'office', 'wc'], lobby: Object.assign(lob, { zone: truck ? 'SHOP OFFICE' : 'CUSTOMER LOUNGE' }) });
  else { K.hwall(p, x0, x1, [xs - 1, xs, xs + 1]); K.floor(x0, x1, p, K.y1, 5); bzLobby(K, x0, x1, p + 1, yb, Object.assign(lob, { zone: truck ? 'SHOP OFFICE' : 'CUSTOMER LOUNGE' })); }
  bzBays(K, y0, p - 1, v);
}
function bzShow(K, F) {
  const { x0, x1, y0, yb, xs } = K, v = K.S.v;
  K.floor(x0, x1, y0, K.y1, v === 'equip' ? 1 : 5);
  const d = bzLobby(K, x0, x1, Math.max(y0, yb - 4), yb, { folk: 'realtor', who: 'Sales', hello: [(F.b.name ? 'Welcome to ' + F.b.name + '! ' : '') + 'Take your time and look around. Holler if you have questions.'], deskText: 'The sales counter.', zone: 'SHOWROOM', tv: v !== 'tv' });
  const top = y0 + 1, bot = yb - 6;
  const put = (bw, bh, gx, gy, tok, txt) => { for (let w = top; w + bh - 1 <= bot; w += bh + gy) for (let u = x0 + 1; u + bw - 1 <= x1 - 1; u += bw + gx) {
    if (u <= xs + 1 && u + bw - 1 >= xs - 1) continue; let ok = true; for (let j = 0; j < bh && ok; j++) for (let i = 0; i < bw; i++) if (!K.fl(u + i, w + j)) { ok = false; break; } if (!ok) continue;
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) K.set(u + i, w + j, typeof tok === 'function' ? tok(u, w, i, j) : tok, txt); } };
  if (v === 'cars') put(2, 4, 2, 2, 'b_car', 'A car for sale, washed and shined, the price on the windshield.');
  else if (v === 'equip') { put(3, 4, 2, 2, 'b_trac', 'A tractor on display. The tires are taller than you are.'); for (let u = x0; u <= x1; u++) K.set(u, y0, 'G', 'Shelves of parts and filters.'); }
  else if (v === 'mobility') { put(1, 1, 1, 1, 'b_whl', 'A mobility scooter on display, the key in it.'); for (let u = x0; u <= x1; u += 2) K.set(u, y0, 'G', 'Shelves of canes, walkers and cushions.'); }
  else if (v === 'kitchen') { put(3, 1, 2, 2, 'r_Cb', 'A cabinet display, the doors in a new finish.'); for (let u = x0; u <= x1; u++) K.set(u, y0, 'r_Cb', 'A wall of sample cabinet doors.'); }
  else { for (let u = x0; u <= x1; u++) K.set(u, y0, 'r_V', 'A wall of TVs, all showing the same nature show.'); put(1, 1, 1, 1, (u, w) => 'r_Ap' + ((u + w) % 3), 'An appliance on display, the tag on the door.'); }
  K.npc(BZ_FOLK[K.F.seed % 6], xs + 3 * d, (y0 + yb) >> 1, 'Customer', ['Just looking today. Maybe.', 'I keep coming back to look at this one.'], { r: 5 });
}
function bzHall(K, F) {
  const { x0, x1, y0, yb, xs } = K, v = K.S.v, nm = F.b.name;
  K.floor(x0, x1, y0, K.y1, v === 'expo' || v === 'market' || v === 'guard' ? 1 : 4);
  if (v === 'guard') { const depth = yb - y0 + 1; if (depth >= 16 && x1 - x0 >= 14) { const p = bzFront(K, 6, { rooms: ['office', 'break', 'wc'], lobby: { folk: 'receptionist', who: 'Front desk', hello: 'Welcome. The office is up front if you need help with anything.' } });
      for (let w = y0 + 1; w <= p - 2; w += 2) { K.set(x0, w, 'b_lock'); K.set(x1, w, 'b_lock'); } for (let u = x0 + 3; u <= x1 - 3; u += 4) { K.set(u, y0 + 1, 'T'); K.set(u + 1, y0 + 1, 'T'); }
      K.zone(x0, x1, y0, p - 1, 'DRILL HALL'); return; } }
  if (v === 'escape') { const p = yb - 5; if (p - y0 >= 5) { const rm = (c, i) => { const m = (c.x0 + c.x1) >> 1;
        K.set(c.x0, c.y0, 'K', ['A bookshelf. One book is upside down. Interesting.', 'Shelves of old books, and a globe.'][i % 2]); K.set(c.x1, c.y0, 'A', 'An old trunk with a three-digit lock. The code must be in this room.');
        K.set(m, c.y0 + 2, 'T', 'A table with a map, a magnifying glass and a riddle on a card.'); K.set(c.x0, c.y1, 'P'); };
      bzRooms(K, p, y0, [{ w: 1, zone: 'ROOM ONE', fill: c => rm(c, 0) }, { w: 1, zone: 'ROOM TWO', fill: c => rm(c, 1) }, { w: 1, zone: 'ROOM THREE', fill: c => rm(c, 2) }]); }
    bzLobby(K, x0, x1, p + 1, yb, { folk: 'b_coach', who: 'Game host', hello: ['Welcome! You get one hour to find your way out. The clues are all in the room.'], zone: 'LOBBY' }); return; }
  bzLobby(K, x0, x1, Math.max(y0, yb - 4), yb, { desk: v === 'legion' || v === 'club' ? false : v !== 'market', folk: 'b_off2', who: 'Front desk',
    hello: v === 'archery' ? 'Welcome! Stay behind the line while folks are shooting.' : 'Welcome in! There\'s always something going on in here.', tv: v === 'legion' || v === 'club', zone: 'ENTRY' });
  const top = y0 + 1, bot = yb - 6;
  if (v === 'archery') { for (let u = x0 + 2; u <= x1 - 2; u += 3) K.set(u, y0 + 1, 'b_tgt'); for (let u = x0 + 1; u <= x1 - 1; u++) if (Math.abs(u - xs) > 1) K.set(u, bot, 'p', 'A bench behind the shooting line.');
    K.npc('b_coach', xs + 3, bot - 2, 'Archer', 'Nock, draw, breathe, let go. That\'s all there is to it. And a lot of practice.', { r: 3 }); K.zone(x0, x1, y0, bot, 'RANGE'); return; }
  if (v === 'legion' || v === 'club') { for (let u = x0; u <= x1; u++) { K.set(u, y0, 'K', 'Shelves of cups, coffee and supplies behind the counter.'); if (u % 2) K.set(u, y0 + 1, 'c'); }
    for (let u = x0; u <= x1; u += 2) K.set(u, y0 + 3, 's'); if (v === 'legion') { K.set(x0 + 1, yb - 1, 'b_flag'); K.set(x1 - 1, yb - 1, 'b_flag'); }
    for (let w = y0 + 6; w <= bot; w += 3) for (let u = x0 + 1; u + 1 <= x1 - 1; u += 4) { if (Math.abs(u - xs) <= 1 || Math.abs(u + 1 - xs) <= 1) continue; K.set(u, w, 'T'); K.set(u + 1, w, 'T'); K.set(u, w - 1, 'h'); K.set(u + 1, w + 1, 'h'); }
    K.npc('b_off', xs + 2, y0 + 4, 'Member', ['Coffee\'s on. Have a seat, there\'s always room.', 'Cards on Tuesdays, a potluck on Fridays.'], { r: 3 }); K.zone(x0, x1, y0, bot, 'HALL'); return; }
  for (let w = top + 1; w <= bot; w += 4) for (let u = x0 + 2; u + 2 <= x1 - 2; u += 5) { if (u <= xs + 1 && u + 2 >= xs - 1) continue;
    for (let i = 0; i < 3; i++) K.set(u + i, w, v === 'market' ? 'r_P' : 'T', v === 'market' ? 'A market stand: whatever is in season.' : 'A long table set up for the next show or sale.'); if (v !== 'market') K.set(u + 1, w + 1, 'h'); }
  K.npc(v === 'market' ? 'vendor' : 'b_off', xs + 3, (top + bot) >> 1, v === 'market' ? 'Vendor' : 'Volunteer', v === 'market' ? 'Fresh from the farm this morning.' : 'Shows, sales, dinners. This hall stays busy all year.', { r: 4, day: 1 });
  K.zone(x0, x1, y0, bot, v === 'market' ? 'MARKET' : 'EXHIBIT HALL');
}
function bzGym(K, F) {
  const { x0, x1, y0, yb, xs } = K, dance = K.S.v === 'dance', depth = yb - y0 + 1;
  K.floor(x0, x1, y0, K.y1, dance ? 4 : 6);
  bzLobby(K, x0, x1, Math.max(y0, yb - 4), yb, { folk: 'b_coach', who: dance ? 'Instructor' : 'Trainer', hello: dance ? 'Welcome! Shoes off at the door, and find a spot at the mirror.' : (F.b.name ? 'Welcome to ' + F.b.name + '! ' : '') + 'Wipe the machines down when you\'re done.', zone: 'FRONT DESK', tv: !dance });
  let top = y0;
  if (!dance && depth >= 20) { const p = y0 + 4; K.hwall(p, x0, x1, [x0 + 2, x1 - 2]); for (let u = x0; u <= x1; u++) K.set(u, y0, u % 3 === 0 ? 'b_wc' : 'b_lock'); for (let u = x0 + 2; u <= x1 - 2; u += 3) K.set(u, y0 + 2, 'p', 'A bench in the locker room.'); K.zone(x0, x1, y0, p, 'LOCKER ROOM'); top = p + 1; }
  for (let u = x0; u <= x1; u++) K.set(u, top, 'b_mir');
  if (dance) { for (let w = top + 1; w <= yb - 6; w++) K.set(x0, w, 'p', 'A bench along the wall for bags and shoes.'); K.npc('b_coach', xs + 2, top + 3, 'Instructor', 'Five, six, seven, eight! Watch the mirror, not your feet.', { r: 3 }); K.zone(x0, x1, top, yb - 5, 'STUDIO'); return; }
  for (let u = x0 + 1; u <= x1 - 1; u += 2) K.set(u, top + 1, 'b_wr');
  for (let w = top + 4; w <= yb - 9; w += 3) for (let u = x0 + 2; u <= x1 - 2; u += 4) if (Math.abs(u - xs) > 1) K.set(u, w, 'b_bn');
  const cr = yb - 7; for (let u = x0 + 1; u <= x1 - 1; u++) if (Math.abs(u - xs) > 1) K.set(u, cr, u % 2 ? 'b_tm' : 'b_bk');
  for (let u = x0 + 2; u <= x1 - 2; u += 6) if (Math.abs(u - xs) > 1) K.set(u, cr - 2, 'b_tv', 'A TV over the treadmills, the news on with captions.');
  K.npc('r_sh2', xs + 3, cr + 1, 'Member', ['Leg day. Don\'t ask me about the stairs.', 'Thirty minutes on the treadmill and I\'m done.'], { r: 3 });
  K.zone(x0, x1, top, yb - 5, 'GYM FLOOR');
}
function bzDayCare(K, F) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1, p = yb - 5;
  K.floor(x0, x1, y0, K.y1, 11);
  const room = (c, i) => { const m = (c.x0 + c.x1) >> 1, mv = (c.y0 + c.y1) >> 1;
    for (let u = c.x0; u <= c.x1; u++) K.set(u, c.y0, u % 3 === 1 ? 'K' : 'b_toy', u % 3 === 1 ? 'A shelf of picture books.' : undefined);
    for (let w = mv - 1; w <= mv + 1; w++) for (let u = m - 2; u <= m + 2; u++) K.set(u, w, 'b_rug', null);
    for (let u = c.x0 + 1; u <= c.x1 - 1; u += 4) { K.set(u, c.y1 - 1, 'T', 'A low table with crayons and paper.'); K.set(u, c.y1, 'h', 'A little chair, just the right size for a little kid.'); }
    K.npc('b_teach', m + 3, mv, 'Teacher', ['Shh, we just finished snack time. Story time is next.', 'We painted with our fingers today. Mostly on the paper.'], { r: 3, loose: 1 }); };
  if (depth >= 13) { const n = Math.max(1, Math.min(3, Math.round((x1 - x0) / 12))); bzRooms(K, p, y0, Array.from({ length: n }, (_, i) => ({ w: 1, zone: ['TODDLER ROOM', 'PRESCHOOL ROOM', 'PLAY ROOM'][i], fill: c => room(c, i) }))); }
  else room({ x0, x1, y0, y1: yb - 6 }, 0);
  bzLobby(K, x0, x1, depth >= 13 ? p + 1 : yb - 4, yb, { folk: 'b_teach', who: 'Front desk', hello: 'Hi! Pickup is right here. Sign out on the clipboard, please.', tv: false, seat: 'b_cub', seatText: 'Cubbies with name tags, full of coats and backpacks.', zone: 'CHECK-IN' });
}
function bzFuneral(K, F) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1, p = yb - 6;
  K.floor(x0, x1, y0, K.y1, 10);
  const chapel = c => { const m = xs >= c.x0 && xs <= c.x1 ? xs : (c.x0 + c.x1) >> 1;
    K.set(m, c.y0 + 1, 'b_lec'); K.set(m - 2, c.y0 + 1, 'b_fs'); K.set(m + 2, c.y0 + 1, 'b_fs'); K.set(c.x0, c.y0, 'P'); K.set(c.x1, c.y0, 'P');
    for (let w = c.y0 + 4; w <= c.y1 - 1; w += 2) for (let u = c.x0 + 1; u <= c.x1 - 1; u++) if (Math.abs(u - m) > 0) K.set(u, w, 'h', 'Rows of quiet, padded chairs.'); };
  if (depth >= 14 && x1 - x0 >= 12) bzRooms(K, p, y0, [{ w: 3, zone: 'CHAPEL', fill: chapel },
    { w: 1, zone: 'OFFICE', fill: c => { const m = (c.x0 + c.x1) >> 1; K.set(m, c.y0 + 1, 'd'); K.set(m, c.y0, 'h'); K.set(m, c.y0 + 2, 'h'); K.set(c.x1, c.y0, 'F'); K.set(c.x0, c.y0, 'P'); } },
    { w: 1, zone: 'LOUNGE', fill: c => { K.set(c.x0, c.y0, 'b_sofa'); K.set(c.x0 + 1, c.y0, 'b_sofa'); K.set(c.x1, c.y0, 'b_mw', 'A coffee pot, cups and a plate of cookies.'); K.set(c.x0 + 1, c.y0 + 2, 'T'); } }]);
  else chapel({ x0, x1, y0, y1: yb - 7 });
  bzLobby(K, x0, x1, depth >= 14 ? p + 1 : yb - 5, yb, { folk: 'realtor', who: 'Staff', hello: ['Welcome. Please make yourself comfortable. Let me know if you need anything.'], tv: false, side: 'b_fs', side2: 'b_sofa', zone: 'FOYER',
    extra: d => K.set(xs + d * 2, yb - 1, 'w', 'A guest book on a stand, and a pen.') });
}
function bzBowl(K, F) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1, Ld = Math.max(6, Math.min(18, depth - 14)), fl = y0 + 1 + Ld;
  K.floor(x0, x1, y0, K.y1, 12); K.floor(x0, x1, fl + 1, fl + 3, 4);
  for (let u = x0; u <= x1; u++) { const lane = (u - x0) % 3 !== 2;
    K.set(u, y0, lane ? 'b_pin' : 'b_lnd'); for (let w = y0 + 1; w <= fl; w++) K.set(u, w, lane ? 'b_lane' : 'b_lnd');
    if (!lane) K.set(u, fl + 4, 'b_ret'); else if (Math.abs(u - xs) > 1) K.set(u, fl + 5, 'h', 'Seats for the bowlers, by the ball return.'); }
  for (let u = x0 + 1; u <= x1 - 1; u += 6) K.set(u, fl + 7, 'b_tv', 'A scoring screen: names, frames, and a little animated pin.');
  const cr = yb - 3, d = xs - x0 >= x1 - xs ? -1 : 1;
  if (cr - 2 > fl + 8) { for (let i = 2; i <= 7; i++) { K.set(xs + d * i, cr, i === 7 ? 'k' : 'c', 'The front counter.'); K.set(xs + d * i, cr - 2, 'b_shoe'); }
    K.npc('b_coach', xs + d * 4, cr - 1, 'Front counter', 'Lane\'s open! Shoes are by size, the balls are on the racks.', { exact: 1, loose: 1 });
    for (let i = 3; i <= 9; i += 3) { K.set(xs - d * i, cr - 1, 'T'); K.set(xs - d * i, cr, 'h'); K.set(xs - d * i, cr - 2, 'h'); } }
  K.npc('r_sh4', xs + 4, fl + 2, 'Bowler', ['Two strikes in a row. Don\'t jinx it.', 'I always pick the ball that\'s too heavy.'], { r: 3, loose: 1 });
  K.zone(x0, x1, y0, fl, 'LANES'); K.zone(x0, x1, fl + 1, yb, 'CONCOURSE');
}
function bzRadio(K, F) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1, p = yb - 5;
  K.floor(x0, x1, y0, K.y1, 12);
  const studio = (c, prod) => { const m = (c.x0 + c.x1) >> 1; for (let u = m - 1; u <= m + 1; u++) K.set(u, c.y0 + 1, 'b_brd'); K.set(m - 1, c.y0 + 2, 'b_mic'); K.set(m + 1, c.y0 + 2, 'b_mic');
    K.set(c.x0, c.y0, 'K', 'Shelves of CDs and old records.'); K.set(c.x1, c.y0, 'M', 'A screen with the log of what plays next.');
    if (!prod) K.npc('b_off', m, c.y0, 'On the air', ['Shh, we\'re on the air in thirty seconds. Wave to the listeners!', 'Up next: the weather, then the farm report.'], { exact: 1, loose: 1 }); };
  if (depth >= 11 && x1 - x0 >= 10) bzRooms(K, p, y0, [{ w: 2, zone: 'ON-AIR STUDIO', fill: c => studio(c, false) }, { w: 1, zone: 'PRODUCTION ROOM', fill: c => studio(c, true) },
    { w: 1, zone: 'OFFICE', fill: c => { K.set((c.x0 + c.x1) >> 1, c.y0 + 1, 'd'); K.set((c.x0 + c.x1) >> 1, c.y0 + 2, 'h'); K.set(c.x1, c.y0, 'F'); } }]);
  else studio({ x0, x1, y0, y1: yb - 5 }, false);
  bzLobby(K, x0, x1, depth >= 11 ? p + 1 : yb - 4, yb, { folk: 'receptionist', who: 'Front desk', hello: 'Welcome! The station is on the speaker, so keep it down when the light is red.', tvText: 'A speaker on the shelf playing the station, and a TV with the weather radar.', zone: 'LOBBY' });
}
function bzPrintShop(K, F) {
  const { x0, x1, y0, yb, xs } = K, depth = yb - y0 + 1;
  const lob = { folk: 'clerk', who: 'Counter', hello: [(F.b.name ? 'Welcome to ' + F.b.name + '! ' : '') + 'Business cards, flyers, posters. Bring us a file and we\'ll print it.'], deskText: 'The counter, with samples of cards and letterhead.', zone: 'FRONT COUNTER' };
  if (depth < 16) { K.floor(x0, x1, y0, K.y1, 1); bzLobby(K, x0, x1, yb - 4, yb, lob); bzProd(K, y0, yb - 6, { v: 'print' }); }
  else { const p = bzFront(K, 6, { rooms: ['office', 'break', 'wc'], lobby: lob }); bzProd(K, y0, p - 1, { v: 'print', zone: 'PRESSROOM' }); }
  for (let w = y0 + 2; w <= yb - 8; w += 4) K.set(K.xs + 3, w, 'b_cut');
}
function bzStorage(K, F) {
  const { R, W, x0, x1, y0, yb, xs } = K, cor = new Set(), mk = (u, w) => { if (K.fl(u, w)) cor.add(w * W + u); };
  K.floor(x0, x1, y0, K.y1, 1);
  for (let w = y0; w <= K.y1; w++) for (let u = xs - 1; u <= xs + 1; u++) mk(u, w);
  for (let w = yb - 1; w >= y0; w -= 8) for (let u = x0; u <= x1; u++) { mk(u, w); mk(u, w + 1); }
  for (let w = y0; w <= K.y1; w++) for (let u = x0; u <= x1; u++) { if (!K.fl(u, w) || cor.has(w * W + u) || K.keep.has(w * W + u)) continue;
    const adj = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => cor.has((w + b) * W + u + a)); R[w][u] = adj ? 'b_unit' : 'W'; }
  K.npc('r_sh3', xs, (y0 + yb) >> 1, 'Renter', 'Cleaning out my unit. How did I fit all this in here?', { r: 5 });
  K.zone(x0, x1, y0, K.y1, 'STORAGE UNITS');
}
// the stores and diners that use the town's stand-in layouts (rooms.js) get a TV, a customer, a hello
function bzExtras(K, F) {
  const { x0, x1, y0, yb, xs } = K, k = F.kind, nm = F.b.name;
  const wallSpot = () => { for (let w = yb - 2; w >= y0; w--) for (const u of [x1, x0]) if (K.fl(u, w) && !K.fl(u + (u === x1 ? 1 : -1), w)) return [u, w]; return null; };
  if (k === 'bar' || (k === 'cafe' && x1 - x0 >= 12)) { const s = wallSpot(); if (s) K.set(s[0], s[1], 'b_tv', k === 'bar' ? 'A TV over the bar, a ballgame on.' : 'A TV in the corner, the news on with the sound off.'); }
  const who = k === 'bar' ? ['The game\'s on. Pull up a stool.', 'Best fish fry in the county on Fridays, if you ask me.'] : k === 'cafe' || k === 'bakery' ? ['Get the soup. Trust me.', 'I come here every morning. Same seat.'] : k === 'salon' ? ['Just a trim today.'] : k === 'bank' ? ['Just making a deposit.'] : ['Just browsing.', 'Found what I came for.'];
  K.npc(BZ_FOLK[(F.seed >> 1) % 6], xs + 2, (y0 + yb) >> 1, k === 'bar' || k === 'cafe' ? 'Regular' : 'Customer', who, { r: 4 });
  if (nm) for (const n of F.npcs) if (!n.bz && !n.talk && (n.folk === 'clerk' || n.folk === 'server')) n.talk = () => say([[n.folk === 'server' ? 'Server' : 'Clerk', n.folk === 'server' ? 'Welcome to ' + nm + '! Sit anywhere, I\'ll be right with you.' : 'Welcome to ' + nm + '! Let me know if you need help finding anything.']]);
}
const BZ_LAYOUT = { b_office: bzOffice, b_clinic: bzClinic, b_hosp: bzHosp, b_motel: bzMotel, b_fact: (K, F) => bzPlant(K, F, false), b_ware: (K, F) => bzPlant(K, F, true),
  b_auto: bzAuto, b_show: bzShow, b_hall: bzHall, b_gym: bzGym, b_day: bzDayCare, b_fun: bzFuneral, b_bowl: bzBowl, b_radio: bzRadio, b_print: bzPrintShop, b_stor: bzStorage };
function bzReach(F) {
  const { R, W } = F, seen = new Set([F.ey * W + F.ex]), q = [[F.ex, F.ey]];
  while (q.length) { const [u, v] = q.pop(); for (const [a, b] of [[u + 1, v], [u - 1, v], [u, v + 1], [u, v - 1]]) { const k = b * W + a; if (seen.has(k) || !R[b] || !ROOM_WALK.has(R[b][a])) continue; seen.add(k); q.push([a, b]); } }
  return seen;
}
function bzLayout(F, c, info) {
  F.bzv = info.v; const save = F.R.map(r => r.slice()), npc0 = F.npcs.length;
  let K = bzK(F, c); const fn = BZ_LAYOUT[info.k];
  try { if (fn) fn(K, F); else bzExtras(K, F); } catch (e) { console.warn('rooms_biz', F.b.id, e); }
  let reach = bzReach(F), tot = 0; for (const r of F.R) for (const t of r) if (ROOM_WALK.has(t)) tot++;
  if (fn && reach.size < Math.max(8, tot * 0.4)) {   // the outline fought the plan: fall back to one open room with a desk and seats
    for (let v = 0; v < F.H; v++) F.R[v] = save[v].slice(); F.npcs.length = npc0; K = bzK(F, c);
    K.floor(c.fx0, c.fx1, c.fy0, c.fy1, info.k === 'b_fact' || info.k === 'b_ware' || info.k === 'b_auto' ? 1 : 2);
    bzLobby(K, c.fx0, c.fx1, Math.max(c.fy0, K.yb - 4), K.yb, { folk: 'receptionist', who: 'Front desk', hello: 'Welcome in!' });
    for (let v = c.fy0; v <= K.yb - 6; v += 3) for (let u = c.fx0 + 1; u <= c.fx1 - 1; u += 3) if (Math.abs(u - K.xs) > 1) K.set(u, v, info.k === 'b_fact' || info.k === 'b_ware' ? 'B' : 'd');
    reach = bzReach(F); }
  F.npcs = F.npcs.filter(n => !n.bz || reach.has(n.y * F.W + n.x));
}

// ---------- the hooks ----------
const BZ_LINE = { b_office: 'An office: a front desk, and desks and doors down the hall.', b_clinic: 'A clinic: a quiet waiting room and exam rooms down the hall.',
  b_hosp: 'Bright halls, a nurses\' station, and rooms down each corridor.', b_motel: 'A front desk, a breakfast nook, and halls of guest rooms.',
  b_fact: 'A plant: the front offices, and through the door, the floor, loud and busy.', b_ware: 'Racks up to the ceiling, dock doors along the back.',
  b_auto: 'A waiting room with coffee, and the service bays through the door.', b_show: 'A showroom, everything shined up and priced.', b_hall: 'A big hall.',
  b_gym: 'Mirrors, machines, and music.', b_day: 'Cubbies, crayons, and little chairs.', b_fun: 'Quiet, soft carpet, and flowers by the door.',
  b_bowl: 'The crash of pins, the rumble of balls down the lanes.', b_radio: 'A radio station. The ON AIR light is lit.', b_print: 'The smell of ink and paper, and the hum of the presses.',
  b_stor: 'Long halls of roll-up doors.', shop: 'A shop.', cafe: 'Tables, a counter, and something good on the grill.', bar: 'A bar: stools, a back bar, a TV.', bakery: 'Warm bread in the air.',
  salon: 'Chairs and mirrors.', bank: 'A bank lobby.' };
const BZ_HOOKS = {};
function bzHook(b, c) {
  if (BZ_HOOKS[b.id]) return BZ_HOOKS[b.id];
  const nm = b.name, ln = (nm ? nm + '. ' : '') + (c.k === 'b_hall' ? { expo: 'A big exhibit hall.', market: 'Market stands under one roof.', legion: 'A hall with a coffee counter and flags by the door.', club: 'A hall with tables and a coffee counter.', guard: 'A front office and a big drill hall.', escape: 'Escape rooms: a lobby, and rooms full of riddles.', archery: 'An indoor archery range.' }[c.v] || 'A big hall.' : BZ_LINE[c.k] || 'Inside.');
  const h = { kind: c.k, line: ln, layout: (F, ctx) => bzLayout(F, ctx, c), look: (F, x, y, t, n) => bzLook(F, x, y, t, n), zone: (F, x, y) => bzZone(F, x, y) };
  if (nm && /public safety/i.test(nm)) h.lobby = [26, 14];
  return BZ_HOOKS[b.id] = h;
}
{ const _rf = roomFloor; roomFloor = function (b) { const fresh = !FIG_FLOORS['room' + b.id], id = _rf(b);
    if (id && fresh && bzOwn(b)) { const Fm = ROOMS[id]; Fm.rows = Fm.R; FIG_FLOORS[id].rows = Fm.R; }
    return id; }; }

// ---------- looking at things, and where you are ----------
const BZ_LOOK = { b_tv: 'A TV, the sound turned low.', b_sofa: 'A couch.', b_frg: 'A refrigerator. A sign on it says: please label your lunch.', b_mw: 'A counter with a microwave and a coffee maker.',
  b_vend: 'A vending machine: chips, candy and pop.', b_wc: 'The restrooms.', b_cop: 'A copier, warm and humming.', b_wcool: 'A water cooler and a sleeve of paper cups.',
  b_bed: 'A made bed with a stack of pillows.', b_bedf: 'A made bed.', b_hb: 'A hospital bed, made up with clean sheets.', b_hbf: 'A hospital bed, made up with clean sheets.', b_ns: 'A nightstand with a lamp.',
  b_tvd: 'A dresser with a TV on top.', b_cur: 'A privacy curtain on a ceiling track.', b_snk: 'A counter with a sink, and a box of gloves.', b_ex: 'An exam table with a fresh sheet of paper on it.',
  b_dch: 'An exam chair with a light over it.', b_chart: 'An eye chart. The big E at the top is easy.', b_cv: 'A conveyor belt, rolling along.', b_fork: 'A forklift, parked with its forks down.',
  b_dock: 'A loading dock door. A truck backs up to it outside.', b_bay: 'A big overhead garage door.', b_tire: 'A rack of tires.', b_bench: 'A workbench with a vise, and tools hung on a pegboard.',
  b_car: 'A car, washed and shined.', b_trac: 'A tractor on display.', b_whl: 'A mobility scooter on display.', b_tm: 'A treadmill.', b_bk: 'An exercise bike.', b_wr: 'A rack of dumbbells, lightest to heaviest.',
  b_bn: 'A weight bench and a bar on the rack.', b_mir: 'A wall of mirrors.', b_lock: 'A row of lockers.', b_cub: 'Cubbies with name tags, full of coats and backpacks.', b_toy: 'A shelf of toys: blocks, puzzles and stuffed animals.',
  b_lec: 'A lectern, with a small lamp on it.', b_fs: 'A tall stand of white flowers.', b_pin: 'The pins at the end of the lane, waiting.', b_lane: 'A bowling lane, oiled and shiny.', b_lnd: 'The capping between the lanes.',
  b_ret: 'A ball return, a few balls waiting in it.', b_shoe: 'Rental shoes in cubbies, sorted by size.', b_brd: 'The on-air board: rows of sliders, buttons, and a red ON AIR light.', b_mic: 'A microphone on a boom arm.',
  b_cut: 'A paper cutter with a long blade and a safety guard.', b_unit: 'A roll-up door to a storage unit, padlocked.', b_tgt: 'An archery target: rings painted on a straw bale.', b_flag: 'A flag on a stand.',
  b_brush: 'The big spinning brushes of the car wash.' };
const BZ_MLOOK = { gen: 'A machine, running steady.', metal: 'A machining center behind sliding windows, coolant spraying on the part.', plastic: 'A film line: plastic comes out warm and winds up on a big roll.',
  wood: 'A saw line. Sawdust collects underneath.', bags: 'A bag machine, stitching mesh bags.', food: 'A stainless steel tank with a lid, polished.', cheese: 'A stainless steel vat with paddles turning slowly.',
  coil: 'A winding machine, wrapping copper wire into coils.', signs: 'A big worktable with sign letters in progress.', block: 'A block machine, pressing wet concrete into blocks.',
  water: 'A pump with big pipes, painted blue. It hums.', apparel: 'A sewing machine on a table.', print: 'A printing press, sheets flying through it.' };
function bzLook(Fm, x, y, t, n) {
  if (n || !Fm.bz || typeof t !== 'string') return false;
  if (t === 'c' || t === 'k') { let s = null, sd = 9; for (const q of Fm.npcs) { const d = Math.abs(q.x - x) + Math.abs(q.y - y); if (d <= 3 && d < sd && q.talk && !roomNpcGone(q)) { s = q; sd = d; } } if (s) { s.talk(Fm, s); return true; } }
  const l = Fm.bz.lk.get(y * Fm.W + x); if (l) { say([['', l]]); return true; }
  if (t === 'b_mc') { say([['', BZ_MLOOK[Fm.bz.v] || BZ_MLOOK.gen]]); return true; }
  if (t === 'b_trk') { say([['', Fm.bz.v === 'bus' ? 'A school bus, parked in the bay.' : 'A truck parked in the bay, its plow mount on the front.']]); return true; }
  if (t === 'b_tv' && Fm.kind === 'b_motel') { say([['', 'A TV on the wall. The weather channel is on.']]); return true; }
  if (BZ_LOOK[t]) { say([['', BZ_LOOK[t]]]); return true; }
  if (t[0] === 'r' && t[1] === '_') { const b = rrBase(t); if (RR_LOOK[b]) { say([['', RR_LOOK[b]]]); return true; } }
  return false;
}
function bzZone(Fm, x, y) { const S = Fm.bz; if (!S) return null; let best = null; for (const z of S.zn) if (x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1 && (!best || z.a < best.a)) best = z; return best ? best.n : null; }

// ---------- drawing: floors ----------
function bzFloorTile(Fm, s, x, y) {
  const X = x * 24, Y = y * 24, h = hash(x * 11 + Fm.seed, y * 7 + 5);
  switch (s) {
    case 1: qp('#9c9e9c', X, Y, 24, 24); if (h % 3 === 0) qp('#929492', X + h % 18, Y + (h >> 4) % 18, 5, 3); if (h % 11 === 0) qp('#8a8c8a', X + (h >> 2) % 20, Y + (h >> 6) % 22, 4, 1); break;
    case 2: qp('#5a6a7a', X, Y, 24, 24); if (h % 2) qp('#52626f', X + h % 22, Y + (h >> 5) % 22, 2, 1); break;
    case 3: qp('#e4e8e6', X, Y, 24, 24); qp('#d2d8d6', X, Y + 23, 24, 1); qp('#d2d8d6', X + 23, Y, 1, 24); if (h % 7 === 0) qp('#dadfdd', X + h % 18, Y + (h >> 4) % 18, 4, 4); break;
    case 4: qp('#b88a58', X, Y, 24, 24); for (let i = 0; i < 24; i += 6) qp('#a87a4a', X, Y + i + 5, 24, 1); qp('#a87a4a', X + ((y * 7 + x * 3) % 4) * 6, Y, 1, 24); break;
    case 5: qp('#d8dce0', X, Y, 24, 24); qp('#c4c8cc', X, Y + 11, 24, 1); qp('#c4c8cc', X + 11, Y, 1, 24); qp('#c4c8cc', X, Y + 23, 24, 1); qp('#c4c8cc', X + 23, Y, 1, 24); break;
    case 6: qp('#2e3034', X, Y, 24, 24); if (h % 2) qp('#3e4044', X + h % 22, Y + (h >> 5) % 22, 2, 2); qp('#26282c', X, Y + 23, 24, 1); qp('#26282c', X + 23, Y, 1, 24); break;
    case 7: qp('#7a3a3a', X, Y, 24, 24); qp('#8a4a3a', X + 10, Y + 2, 4, 4); qp('#8a4a3a', X + 10, Y + 18, 4, 4); qp('#8a4a3a', X + 2, Y + 10, 4, 4); qp('#8a4a3a', X + 18, Y + 10, 4, 4); qp('#c8a050', X + 11, Y + 11, 2, 2); break;
    case 8: { qp('#a8aaa6', X, Y, 24, 24); const S = Fm.bz.fs, W = Fm.W, k = y * W + x;
      if (x > 0 && S[k - 1] !== 8) qp('#e8c020', X + 1, Y, 3, 24); if (x < W - 1 && S[k + 1] !== 8) qp('#e8c020', X + 20, Y, 3, 24);
      if (y > 0 && S[k - W] !== 8) qp('#e8c020', X, Y + 1, 24, 3); if (y < Fm.H - 1 && S[k + W] !== 8) qp('#e8c020', X, Y + 20, 24, 3); break; }
    case 9: qp('#8a9a92', X, Y, 24, 24); if (h % 4 === 0) qp('#809088', X + h % 18, Y + (h >> 4) % 18, 5, 3); qp('#82928a', X, Y + 23, 24, 1); break;
    case 10: qp('#4e5a4e', X, Y, 24, 24); if (h % 2) qp('#465246', X + h % 22, Y + (h >> 5) % 22, 2, 1); break;
    case 11: qp('#a8c8e0', X, Y, 24, 24); if (h % 2) qp('#98b8d0', X + h % 22, Y + (h >> 5) % 22, 2, 2); break;
    case 12: qp('#2a2a48', X, Y, 24, 24); if (h % 7 === 0) qp(['#6a3a6a', '#3a6a7a', '#6a5a3a'][(h >> 3) % 3], X + h % 20, Y + (h >> 5) % 20, 2, 2); break;
  }
}
{ const _ft = roomFloorTile; roomFloorTile = function (Fm, t, x, y) {
    const S = Fm.bz; if (!S) return _ft(Fm, t, x, y);
    const s = S.fs[y * Fm.W + x]; if (s) bzFloorTile(Fm, s, x, y); else _ft(Fm, t, x, y);
    const X = x * 24, Y = y * 24;
    if (s && t === 'e') { qp('#3a3236', X + 2, Y + 3, 20, 14); qp('#4a4046', X + 3, Y + 4, 18, 12); }
    else if (t === 'b_dr') { qp('#8a7a6a', X, Y + 10, 24, 4); qp('#a89a8a', X, Y + 10, 24, 1); }
    else if (t === 'b_mat') { qp('#1a4a7a', X + 1, Y + 1, 22, 22); qp('#2a5a8a', X + 2, Y + 2, 20, 1); }
    else if (t === 'b_rug') { qp(['#e04a4a', '#f0c040', '#3a8ad8', '#50b050'][(x + y) % 4], X, Y, 24, 24); qp('rgba(255,255,255,.25)', X + 8, Y + 8, 8, 8); }
  }; }

// ---------- drawing: things ----------
const BZ_MCOL = { gen: '#6a8a5a', metal: '#5a7a9a', plastic: '#4a8a6a', wood: '#c87a2a', bags: '#3a6aa8', food: '#c8ccd2', cheese: '#c8ccd2', coil: '#8a6a4a', signs: '#7a7e86',
  block: '#8a8a6a', water: '#3a6ab8', apparel: '#e8e4dc', print: '#3a4a5a' };
const BZ_TOY = ['#e04040', '#f0d040', '#3a7ad8', '#50b050', '#f08ac0', '#a050d0'];
function bzProp(Fm, t, x, y) {
  const X = x * 24, Y = y * 24, h = hash(x * 5 + Fm.seed, y * 9 + 2), v = Fm.bz ? Fm.bz.v : '', k = Fm.kind, fr = frame;
  const sh = () => qp('rgba(0,0,0,.22)', X + 1, Y + 19, 22, 4), S = (dx, dy) => roomT(Fm, x + dx, y + dy) === t;
  switch (t) {
    case 'b_tv': { sh(); qp('#3a2a1e', X + 2, Y + 6, 20, 13); qp('#5a3e2a', X + 2, Y + 6, 20, 2); qp('#16161a', X + 1, Y - 12, 22, 16);
      qp(['#3a7ac8', '#4a9a5a', '#c8a040', '#c85a4a'][((fr >> 7) + x) % 4], X + 2, Y - 11, 20, 13); qp('rgba(255,255,255,.3)', X + 4, Y - 9, 6, 2); qp('#f4f4f0', X + 12, Y - 4, 6, 2); break; }
    case 'b_sofa': { const c = k === 'b_fun' ? '#6a5a4a' : k === 'b_motel' ? '#7a4a3a' : '#5a6a8a'; sh(); qp(shade(c, -0.15), X, Y - 4, 24, 8); qp(c, X, Y + 2, 24, 16); qp(shade(c, 0.12), X + 2, Y + 4, 9, 8); qp(shade(c, 0.12), X + 13, Y + 4, 9, 8); break; }
    case 'b_frg': sh(); qp('#e8eaec', X + 3, Y - 16, 18, 36); qp('#c8ccd2', X + 3, Y - 2, 18, 1); qp('#8a8e96', X + 17, Y - 12, 1, 8); qp('#8a8e96', X + 17, Y + 2, 1, 8); qp(h % 2 ? '#f0d040' : '#e86a6a', X + 6, Y - 10, 4, 4); break;
    case 'b_mw': sh(); qp('#8a6a4a', X, Y + 2, 24, 18); qp('#d8d4cc', X, Y - 2, 24, 5); qp('#2a2c34', X + 2, Y - 10, 12, 9); qp('#3a4a5a', X + 3, Y - 9, 7, 7); qp('#5ab0e8', X + 11, Y - 8, 2, 1); qp('#1a1a1e', X + 16, Y - 10, 6, 9); qp('#6a3a1a', X + 17, Y - 5, 4, 3); break;
    case 'b_vend': sh(); qp('#c83a2a', X + 2, Y - 18, 20, 38); qp('#2a3a4a', X + 4, Y - 15, 12, 24); for (let r = 0; r < 4; r++) for (let i = 0; i < 3; i++) qp(BZ_TOY[(r + i + h) % 6], X + 5 + i * 4, Y - 13 + r * 6, 3, 4); qp('#c8ccd2', X + 17, Y - 12, 3, 8); break;
    case 'b_wc': qp('#4a2e1a', X, Y - 9, 24, 33); qp('#5a6a7a', X + 3, Y - 6, 18, 26); qp('#f4f4f0', X + 9, Y - 3, 6, 6); qp('#f4f4f0', X + 11, Y + 3, 2, 6); break;
    case 'b_cop': sh(); qp('#d8dce0', X + 2, Y - 4, 20, 24); qp('#b8bcc4', X + 2, Y - 4, 20, 4); qp('#2a2c34', X + 4, Y + 2, 8, 3); qp('#5ab0e8', X + 14, Y + 2, 5, 3); qp('#f4f4f0', X + 5, Y - 7, 14, 3); break;
    case 'b_wcool': sh(); qp('#e8eaec', X + 7, Y - 2, 10, 22); qp('#9ac8f0', X + 7, Y - 14, 10, 12); qp('rgba(255,255,255,.4)', X + 8, Y - 13, 2, 10); qp('#3a7ad8', X + 9, Y + 2, 2, 2); break;
    case 'b_bed': case 'b_bedf': { const top = !S(0, -1) && t === 'b_bed', xl = roomT(Fm, x - 1, y) === t ? x - 1 : x, yh = t === 'b_bed' ? y : y - 1, sp = ['#c8a050', '#5a7a9a', '#8a5a6a', '#6a8a5a'][hash(Fm.seed + xl, yh) % 4];
      if (t === 'b_bed') { qp('rgba(0,0,0,.2)', X + 1, Y + 2, 22, 22); if (top) { qp('#6a4428', X + 1, Y - 10, 22, 12); qp('#8a5a30', X + 1, Y - 10, 22, 2); } qp('#f4f2ea', X + 2, Y - 2, 20, 26); qp('#e8e4dc', X + 4, Y, 16, 6); qp(sp, X + 2, Y + 9, 20, 15); }
      else { qp(sp, X + 2, Y, 20, 18); qp(shade(sp, -0.25), X + 2, Y + 16, 20, 3); qp('#5a3418', X + 2, Y + 19, 20, 3); } break; }
    case 'b_hb': qp('rgba(0,0,0,.2)', X + 1, Y + 2, 22, 22); qp('#c8ccd2', X + 2, Y - 8, 20, 8); qp('#f4f6f8', X + 2, Y, 20, 24); qp('#ffffff', X + 5, Y + 1, 14, 6); qp('#a8c8d8', X + 2, Y + 10, 20, 14); break;
    case 'b_hbf': qp('#a8c8d8', X + 2, Y, 20, 16); qp('#c8ccd2', X + 2, Y + 15, 20, 4); qp('#5a5e66', X + 3, Y + 19, 2, 3); qp('#5a5e66', X + 19, Y + 19, 2, 3); break;
    case 'b_ns': sh(); qp('#6a4428', X + 5, Y + 4, 14, 15); qp('#8a5a30', X + 5, Y + 4, 14, 2); qp('#c8a050', X + 11, Y - 4, 2, 8); qp('#f0e0b0', X + 8, Y - 9, 8, 6); break;
    case 'b_tvd': sh(); qp('#6a4428', X + 1, Y + 2, 22, 17); qp('#8a5a30', X + 1, Y + 2, 22, 2); qp('#5a3418', X + 2, Y + 9, 20, 1); qp('#16161a', X + 4, Y - 10, 16, 12); qp(['#3a7ac8', '#4a9a5a'][((fr >> 7) + x) % 2], X + 5, Y - 9, 14, 9); break;
    case 'b_cur': qp('#c8ccd2', X, Y - 20, 24, 2); for (let i = 0; i < 6; i++) qp(i % 2 ? '#8ab8c8' : '#9ac8d8', X + i * 4, Y - 18, 4, 36); break;
    case 'b_snk': sh(); qp('#d8d4cc', X, Y + 2, 24, 18); qp('#e8e8e4', X, Y - 2, 24, 5); qp('#a8b0b8', X + 7, Y - 1, 10, 3); qp('#8a8e96', X + 11, Y - 6, 2, 5); qp('#3a7ad8', X + 18, Y - 6, 4, 4); break;
    case 'b_ex': sh(); qp('#5a5e66', X + 4, Y + 10, 2, 9); qp('#5a5e66', X + 18, Y + 10, 2, 9); qp('#4a7a9a', X + 1, Y + 1, 22, 10); qp('#f4f4f0', X + 4, Y, 16, 10); qp('#5a8aaa', X + 1, Y - 4, 8, 6); break;
    case 'b_dch': sh(); qp('#5a5e66', X + 10, Y + 8, 4, 11); qp('#3a8aa0', X + 3, Y - 2, 18, 10); qp('#3a8aa0', X + 5, Y - 10, 12, 9); qp('#2a6a80', X + 3, Y + 6, 18, 3); qp('#8a8e96', X + 19, Y - 16, 2, 10); qp('#f4f4e0', X + 16, Y - 18, 8, 4); break;
    case 'b_chart': sh(); qp('#5a5e66', X + 11, Y + 2, 2, 17); qp('#f4f4f0', X + 4, Y - 16, 16, 20); for (let r = 0; r < 5; r++) qp('#16161a', X + 12 - (5 - r), Y - 14 + r * 4, (5 - r) * 2, 2); break;
    case 'b_mc': {   // a machine block: drawn tile by tile, a top, a front face along the bottom row, a panel at the top-left
      const up = S(0, -1), dn = S(0, 1), lf = S(-1, 0), rt = S(1, 0), c = BZ_MCOL[v] || BZ_MCOL.gen;
      if (!dn) qp('rgba(0,0,0,.25)', X, Y + 18, 24, 5);
      qp(c, X + (lf ? 0 : 1), Y - (up ? 0 : 10), 24 - (lf ? 0 : 1) - (rt ? 0 : 1), (dn ? 24 : 18) + (up ? 0 : 10));
      if (!up) qp(shade(c, 0.18), X, Y - 10, 24, 2); if (!dn) qp(shade(c, -0.3), X + (lf ? 0 : 1), Y + 8, 24 - (lf ? 0 : 1) - (rt ? 0 : 1), 10);
      if (!lf) qp(shade(c, -0.15), X + 1, Y - (up ? 0 : 10), 2, dn ? 24 : 18);
      if (v === 'wood' && !up) { qp('#c8ccd2', X + 6, Y - 8, 12, 12); qp('#8a8e96', X + 11, Y - 3, 2, 2); }
      else if ((v === 'plastic' || v === 'bags' || v === 'coil') && !up) { qp(v === 'coil' ? '#c87a3a' : v === 'bags' ? '#d8c8a0' : '#e8f0f4', X + 3, Y - 7, 18, 9); qp('rgba(0,0,0,.15)', X + 3, Y - 2, 18, 1); }
      else if ((v === 'food' || v === 'cheese') && !up) { qp('#e8ecf0', X + 4, Y - 8, 16, 8); qp('#a8acb2', X + 11, Y - 6, 2, 4); }
      else if (v === 'metal' && !up) { qp('#9ac8e8', X + 4, Y - 7, 16, 8); qp('rgba(255,255,255,.4)', X + 5, Y - 6, 3, 6); }
      else if (v === 'print' && !up) { for (let i = 0; i < 3; i++) qp('#1a1a22', X + 3 + i * 7, Y - 8, 4, 10); qp('#f4f4f0', X + 2, Y + 2, 20, 3); }
      else if (v === 'water' && !up) { qp('#8a8e96', X + 9, Y - 8, 6, 16); qp('#2a4a8a', X + 4, Y - 4, 16, 6); }
      else if (v === 'apparel') { qp('#e8e4dc', X + 1, Y - 2, 22, 8); qp('#5a5e66', X + 6, Y - 12, 10, 8); qp('#5a5e66', X + 14, Y - 12, 3, 12); qp(BZ_TOY[h % 6], X + 3, Y, 8, 4); }
      if (!up && !lf) { qp('#2a2c34', X + 2, Y - 8, 6, 5); qp((fr >> 4) % 2 ? '#60f080' : '#40c060', X + 3, Y - 7, 2, 2); qp('#e04040', X + 5, Y - 7, 2, 2); }
      break; }
    case 'b_cv': { qp('rgba(0,0,0,.2)', X, Y + 16, 24, 4); qp('#5a5e66', X, Y + 2, 24, 14); qp('#2a2a30', X, Y + 4, 24, 10); for (let i = 0; i < 3; i++) qp('#4a4a52', X + ((i * 8 + (fr >> 1)) % 24), Y + 4, 2, 10);
      qp('#5a5e66', X + 3, Y + 14, 2, 5); qp('#5a5e66', X + 19, Y + 14, 2, 5); if (h % 2) qp(v === 'food' || v === 'cheese' ? '#e8d070' : v === 'wood' ? '#d8b070' : '#c8a070', X + ((fr >> 1) + h) % 18, Y + 5, 6, 7); break; }
    case 'b_fork': sh(); qp('#e0b020', X + 4, Y - 2, 16, 18); qp('#c89a18', X + 4, Y + 12, 16, 4); qp('#2a2a30', X + 5, Y - 12, 14, 2); qp('#2a2a30', X + 5, Y - 12, 2, 12); qp('#2a2a30', X + 17, Y - 12, 2, 12);
      qp('#5a5e66', X + 7, Y + 16, 2, 6); qp('#5a5e66', X + 15, Y + 16, 2, 6); for (const [a, b] of [[2, 1], [19, 1], [2, 11], [19, 11]]) qp('#16161a', X + a, Y + b, 3, 6); qp('#3a3a42', X + 9, Y + 2, 6, 5); break;
    case 'b_dock': qp('#5a5e66', X, Y - 9, 24, 33); qp('#9a9ea6', X + 2, Y - 7, 20, 27); for (let i = 0; i < 6; i++) qp('#7a7e86', X + 2, Y - 6 + i * 5, 20, 1); qp('#f0d040', X, Y + 20, 24, 4); for (let i = 0; i < 6; i++) qp('#16161a', X + i * 4, Y + 20, 2, 4); break;
    case 'b_bay': qp('#c8ccd0', X, Y - 9, 24, 33); qp('#f0f0ec', X + 1, Y - 7, 22, 27); for (let i = 0; i < 5; i++) qp('#d0d0cc', X + 1, Y - 5 + i * 5, 22, 1); qp('#9ac8e8', X + 3, Y - 4, 7, 3); qp('#9ac8e8', X + 14, Y - 4, 7, 3); break;
    case 'b_tire': sh(); qp('#5a5e66', X + 1, Y - 14, 2, 34); qp('#5a5e66', X + 21, Y - 14, 2, 34); for (let i = 0; i < 4; i++) { qp('#1a1a1e', X + 3, Y - 12 + i * 8, 18, 7); qp('#3a3a42', X + 5, Y - 11 + i * 8, 14, 1); } break;
    case 'b_bench': sh(); qp('#7a5a3a', X, Y + 2, 24, 16); qp('#9a7a5a', X, Y, 24, 4); qp('#c8b890', X, Y - 16, 24, 14); for (let i = 0; i < 5; i++) qp('#5a5e66', X + 2 + i * 5, Y - 13 + (i % 2) * 3, 2, 7); qp('#3a3a42', X + 16, Y - 3, 6, 4); break;
    case 'b_trk': case 'b_car': case 'b_trac': {   // a vehicle, nose to the back wall, drawn tile by tile
      const up = S(0, -1), dn = S(0, 1), lf = S(-1, 0), rt = S(1, 0); let j = 0; while (j < 9 && roomT(Fm, x, y - j - 1) === t) j++; let i = 0; while (i < 4 && roomT(Fm, x - i - 1, y) === t) i++;
      const c = t === 'b_trk' ? (v === 'bus' ? '#f0b020' : v === 'trade' ? '#e8e8e8' : '#e07a20') : t === 'b_trac' ? (hash(x - i, y - j) % 2 ? '#3a7a3a' : '#e07a20') : ['#c83a3a', '#3a5a8a', '#e8e8e8', '#2a2a30', '#8a8e96', '#3a7a5a'][hash(x - i, y - j) % 6];
      if (!dn) qp('rgba(0,0,0,.25)', X, Y + 18, 24, 5);
      const ox = lf ? 0 : 3, ow = 24 - ox - (rt ? 0 : 3);
      if (t === 'b_trac' && j < 2 && i !== 1) { if (j === 1) qp('#16161a', X + (i === 0 ? 8 : 0), Y + 4, 16, 14); break; }
      qp(c, X + ox, Y - (up ? 0 : 4), ow, 24 + (up ? 0 : 4));
      if (t === 'b_trk' && j === 1 || t === 'b_car' && j === 1) qp('#9ab8d0', X + ox + 1, Y + 2, ow - 2, 10);
      if (t === 'b_car' && j === 3) qp('#9ab8d0', X + ox + 1, Y + 2, ow - 2, 6);
      if (t === 'b_trk' && j === 2) qp(shade(c, -0.3), X, Y, 24, 2);
      if ((t === 'b_trk' && (j === 1 || j === 5)) || (t === 'b_car' && (j === 0 || j === 3))) { if (!lf) qp('#16161a', X, Y + 4, 4, 12); if (!rt) qp('#16161a', X + 20, Y + 4, 4, 12); }
      if (t === 'b_trac' && j >= 2) { if (i === 0) qp('#16161a', X, Y - 2, 9, 24); if (i === 2) qp('#16161a', X + 15, Y - 2, 9, 24); if (i === 1 && j === 2) { qp('#2a2a30', X + 4, Y - 14, 16, 3); qp('#9ab8d0', X + 5, Y - 11, 14, 8); } }
      break; }
    case 'b_whl': sh(); qp('#c83a2a', X + 6, Y - 2, 12, 14); qp('#2a2a30', X + 7, Y - 10, 10, 8); qp('#16161a', X + 4, Y + 12, 4, 6); qp('#16161a', X + 16, Y + 12, 4, 6); qp('#5a5e66', X + 10, Y - 14, 2, 6); qp('#5a5e66', X + 7, Y - 15, 8, 2); break;
    case 'b_tm': sh(); qp('#2a2a30', X + 3, Y - 2, 18, 22); qp('#3a3a42', X + 5, Y, 14, 18); for (let i = 0; i < 3; i++) qp('#2a2a30', X + 5, Y + ((i * 6 + (fr >> 2)) % 18), 14, 1); qp('#5a5e66', X + 3, Y - 12, 2, 12); qp('#5a5e66', X + 19, Y - 12, 2, 12); qp('#2a2c34', X + 4, Y - 16, 16, 6); qp('#5ab0e8', X + 6, Y - 15, 12, 3); break;
    case 'b_bk': sh(); qp('#5a5e66', X + 10, Y, 4, 18); qp('#2a2a30', X + 6, Y + 12, 12, 4); qp('#2a2a30', X + 8, Y - 4, 8, 4); qp('#c83a3a', X + 7, Y - 10, 10, 8); qp('#2a2c34', X + 9, Y - 16, 6, 4); break;
    case 'b_wr': sh(); qp('#3a3a42', X, Y + 4, 24, 15); qp('#5a5e66', X, Y + 2, 24, 2); for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) qp('#16161a', X + 1 + i * 6, Y - 4 + r * 8, 5, 4); break;
    case 'b_bn': sh(); qp('#5a5e66', X + 11, Y + 6, 2, 13); qp('#2a2a30', X + 7, Y - 2, 10, 20); qp('#c8ccd2', X, Y - 10, 24, 2); qp('#16161a', X, Y - 14, 4, 10); qp('#16161a', X + 20, Y - 14, 4, 10); break;
    case 'b_mir': qp('#c8ccd2', X, Y - 16, 24, 36); qp('#b8d4e4', X + 1, Y - 14, 22, 30); qp('rgba(255,255,255,.5)', X + 4 + (x % 3) * 5, Y - 12, 2, 24); break;
    case 'b_lock': sh(); qp('#4a6a8a', X + 1, Y - 16, 22, 36); qp('#3a5a7a', X + 12, Y - 16, 1, 36); for (let i = 0; i < 2; i++) { qp('#2a3a4a', X + 3 + i * 11, Y - 13, 7, 1); qp('#2a3a4a', X + 3 + i * 11, Y - 11, 7, 1); qp('#c8ccd2', X + 8 + i * 11, Y - 2, 1, 3); } break;
    case 'b_cub': sh(); qp('#c8a070', X, Y - 14, 24, 34); for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++) { qp('#8a6a4a', X + 2 + i * 11, Y - 12 + r * 10, 9, 8); qp(BZ_TOY[(r + i + h) % 6], X + 3 + i * 11, Y - 9 + r * 10, 6, 5); } break;
    case 'b_toy': sh(); qp('#e8e0cc', X, Y - 10, 24, 30); for (let r = 0; r < 3; r++) { qp('#c8b898', X, Y - 2 + r * 9, 24, 1); for (let i = 0; i < 3; i++) qp(BZ_TOY[(r + i + h) % 6], X + 2 + i * 7, Y - 8 + r * 9, 6, 6); } break;
    case 'b_lec': sh(); qp('#5a3a22', X + 7, Y + 2, 10, 17); qp('#7a5434', X + 4, Y - 4, 16, 7); qp('#6a4428', X + 4, Y + 2, 16, 2); qp('#f0e0b0', X + 15, Y - 8, 3, 4); break;
    case 'b_fs': qp('rgba(0,0,0,.2)', X + 5, Y + 18, 14, 3); qp('#5a3a22', X + 11, Y, 2, 19); qp('#8a5a30', X + 6, Y + 16, 12, 2); qp('#3a6a3a', X + 4, Y - 10, 16, 10);
      for (let i = 0; i < 8; i++) qp(['#f4f0f0', '#f0d8e0', '#e8e0f0', '#f4f0f0'][(i + h) % 4], X + 4 + (i % 4) * 4, Y - 12 + (i >> 2) * 5, 4, 4); break;
    case 'b_pin': qp('#1a1a22', X, Y - 10, 24, 34); qp('#d8b070', X + (S(-1, 0) ? 0 : 3), Y + 2, 24 - (S(-1, 0) ? 0 : 3) - (S(1, 0) ? 0 : 3), 22);
      for (let r = 0; r < 3; r++) for (let i = 0; i <= r; i++) { const px = X + (S(-1, 0) ? -2 : 10) - r * 3 + i * 6; if (px < X || px > X + 21) continue; qp('#f8f8f4', px, Y + 4 + r * 5, 3, 4); qp('#c83a3a', px, Y + 5 + r * 5, 3, 1); } break;
    case 'b_lane': qp('#dcb878', X, Y, 24, 24); qp('#c8a060', X + 12, Y, 1, 24); if (!S(-1, 0)) qp('#4a4e56', X, Y, 4, 24); if (!S(1, 0)) qp('#4a4e56', X + 20, Y, 4, 24);
      if (y % 7 === 3 && S(-1, 0)) { qp('#3a5a9a', X - 1, Y + 6, 2, 6); } qp('rgba(255,255,255,.12)', X + 5, Y, 2, 24); break;
    case 'b_lnd': qp('#3a2a20', X, Y - 2, 24, 26); qp('#4a3a2a', X + 2, Y - 2, 20, 2); break;
    case 'b_ret': sh(); qp('#3a3a52', X + 3, Y - 2, 18, 20); qp('#5a5a72', X + 3, Y - 2, 18, 3); for (let i = 0; i < 3; i++) qp(['#3a6ab8', '#c83a8a', '#2a2a30', '#e0a020'][(i + h) % 4], X + 4 + i * 6, Y - 7, 5, 5); break;
    case 'b_shoe': sh(); qp('#5a3a22', X, Y - 14, 24, 34); for (let r = 0; r < 4; r++) for (let i = 0; i < 2; i++) { qp('#2a1a12', X + 2 + i * 11, Y - 12 + r * 8, 9, 6); qp(['#c83a3a', '#3a6ab8', '#e8e4dc'][(r + i + h) % 3], X + 3 + i * 11, Y - 9 + r * 8, 7, 3); } break;
    case 'b_brd': sh(); qp('#3a3a42', X, Y + 2, 24, 17); qp('#2a2a30', X, Y - 4, 24, 7); for (let i = 0; i < 6; i++) { qp('#8a8e96', X + 2 + i * 4, Y - 3, 1, 5); qp('#e8e8e4', X + 1 + i * 4, Y - 2 + ((h + i + (fr >> 5)) % 3), 3, 2); }
      if (!S(-1, 0)) qp((fr >> 5) % 2 ? '#f03a3a' : '#a02a2a', X + 1, Y - 14, 6, 4); if (!S(1, 0) || !S(-1, 0)) { qp('#2a2c34', X + 8, Y - 16, 12, 10); qp('#5ab0e8', X + 9, Y - 15, 10, 7); } break;
    case 'b_mic': qp('rgba(0,0,0,.2)', X + 8, Y + 18, 8, 3); qp('#5a5e66', X + 11, Y - 2, 2, 21); qp('#5a5e66', X + 11, Y - 4, 8, 2); qp('#2a2a30', X + 16, Y - 10, 5, 8); break;
    case 'b_cut': sh(); qp('#5a5e66', X + 2, Y + 2, 20, 17); qp('#e8e8e4', X + 2, Y - 2, 20, 5); qp('#c83a2a', X + 4, Y - 8, 16, 3); qp('#f4f4f0', X + 6, Y - 4, 12, 3); break;
    case 'b_unit': qp('#5a5e66', X, Y - 9, 24, 33); qp(['#e07a20', '#c84a3a', '#3a6ab8'][Fm.seed % 3], X + 2, Y - 7, 20, 27); for (let i = 0; i < 6; i++) qp('rgba(0,0,0,.18)', X + 2, Y - 5 + i * 5, 20, 1); qp('#c8ccd2', X + 10, Y + 16, 4, 2); qp('#e8e4dc', X + 8, Y - 5, 8, 3); break;
    case 'b_tgt': qp('rgba(0,0,0,.2)', X + 2, Y + 18, 20, 3); qp('#c8a860', X + 2, Y - 12, 20, 30); qp('#f4f4f0', X + 5, Y - 8, 14, 14); qp('#2a2a30', X + 7, Y - 6, 10, 10); qp('#3a7ad8', X + 8, Y - 5, 8, 8); qp('#c83a3a', X + 9, Y - 4, 6, 6); qp('#f0d040', X + 10, Y - 3, 4, 4); break;
    case 'b_flag': qp('rgba(0,0,0,.2)', X + 8, Y + 18, 8, 3); qp('#c8a050', X + 11, Y - 22, 2, 41); qp('#c83a3a', X + 13, Y - 20, 10, 10); for (let i = 0; i < 3; i++) qp('#f4f4f0', X + 13, Y - 18 + i * 3, 10, 1); qp('#2a3a7a', X + 13, Y - 20, 4, 5); break;
    case 'b_brush': qp('rgba(0,0,0,.2)', X + 4, Y + 18, 16, 3); qp('#5a5e66', X + 11, Y - 18, 2, 36); for (let i = 0; i < 6; i++) qp(i % 2 ? '#3a7ad8' : '#e04a8a', X + 4 + ((fr >> 3) + i) % 2, Y - 16 + i * 6, 16, 5); break;
  }
}
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) { if (typeof t === 'string' && t.length > 2 && t[0] === 'b' && t[1] === '_') return bzProp(Fm, t, x, y); return _rp(Fm, t, x, y); }; }
