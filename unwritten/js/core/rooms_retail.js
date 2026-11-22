"use strict";
// =====================================================================
//  THE BIG STORES (Nov 20, Christian: "make indoor buildings the same size for all the fast food and chain places, like
//  Walmart, etc? All of them. And populate them as they would be set up"). Every chain store and supermarket in town can be
//  walked into. Each inside is the building's real outline at the interiors' 1 m tile (rooms.js turns it so the door is at
//  the bottom), laid out the way that kind of store usually is: checkouts across the front, departments in aisles, coolers
//  and service counters along the walls, signs hanging over the departments. Staff and shoppers are generic townsfolk with
//  plain stand-in lines; no real employees. Stock lists are placeholder items and prices made up for the game.
//  Tile tokens here all start with 'r_' (rooms_food.js uses 'f_').
// =====================================================================
const RR_KEYS = { 'Walmart Supercenter': 'walmart', 'Menards': 'menards', 'Fleet Farm': 'fleet', "Pick 'n Save": 'pns', 'Sentry': 'sentry',
  "Dunham's Sports": 'plaza', 'Goodwill': 'goodwill', 'Dollar Tree': 'dtree', 'Dollar General': 'dg', 'Walgreens': 'walgreens',
  "O'Reilly Auto Parts": 'oreilly', 'Auto Value Auto Parts': 'autovalue', 'Cellcom': 'cellcom', 'Fastenal': 'fastenal',
  'Aldi': 'aldi', 'ALDI': 'aldi', 'Family Dollar': 'dtree', 'Tractor Supply': 'fleet', 'Tractor Supply Co.': 'fleet' };
const RR_IDS = new Set();
{ const best = {}; const area = b => (Math.max(...b.poly.map(p => p[0])) - Math.min(...b.poly.map(p => p[0]))) * (Math.max(...b.poly.map(p => p[1])) - Math.min(...b.poly.map(p => p[1])));
  for (const b of BLD) { const k = b.name && RR_KEYS[b.name]; if (!k || b.type !== 'store' || !b.poly) continue;
    if (!best[b.name] || area(b) > area(best[b.name])) best[b.name] = b; }   // Fleet Farm: the main store, not the little building by the gas
  for (const n in best) { RR_IDS.add(best[n].id); best[n].enter = best[n].enter || 1; } }
{ const _re = roomEligible; roomEligible = function (b) { return _re(b) || !!(b && RR_IDS.has(b.id)); }; }
if (typeof ROOM_DOOR !== 'undefined') ROOM_DOOR = null;   // rebuilt with these doors the first time it's asked
const rrKey = b => RR_IDS.has(b.id) ? RR_KEYS[b.name] : null;
ROOM_WALK.add('r_m');

// ---------- looks: floor and walls in each chain's colors ----------
const RR_TRIM = { walmart: '#0071ce', menards: '#00703c', fleet: '#d71920', pns: '#d2232a', sentry: '#c8202a', plaza: '#1b2f5c', goodwill: '#0053a0',
  dtree: '#00843d', dg: '#f2c500', walgreens: '#e31837', oreilly: '#00843d', autovalue: '#1e2a1e', cellcom: '#2a6ab8', fastenal: '#1a4a8a', aldi: '#1a3a8a' };
for (const k in RR_TRIM) {
  const fl = { menards: ['concrete', '#b4b4b0', '#a4a4a0'], fleet: ['concrete', '#b8b6ae', '#a8a69e'], fastenal: ['concrete', '#b0b0ac', '#a0a09c'],
    cellcom: ['carpet', '#4a4e58', '#42464f'], goodwill: ['lino', '#dcd8ce', '#ccc8be'] }[k] || ['lino', '#e8e8e4', '#d6d6d0'];
  ROOM_STYLE['r_' + k] = [fl, ['#eceee8', RR_TRIM[k]]];
  KIND_ZONE['r_' + k] = 'SALES FLOOR';
}
Object.assign(FOLKS, {   // work shirts in each store's color; shoppers in everyday clothes
  r_blue: { skin: '#e2b48e', hair: '#5a3a24', shirt: '#2a62b8', shirt2: '#3a7ad8', pants: '#c8b890', shoes: '#2a2224', vest: '#3a7ad8' },
  r_blue2: { skin: '#c99878', hair: '#1e1612', shirt: '#e8e4dc', shirt2: '#e8e4dc', pants: '#2a2a30', shoes: '#141416', vest: '#2a62b8', glasses: 1 },
  r_red: { skin: '#ecc19c', hair: '#8a5a2a', shirt: '#c8202a', shirt2: '#a81a22', pants: '#2a2a30', shoes: '#141416' },
  r_red2: { skin: '#d9a77c', hair: '#2a1e18', shirt: '#c8202a', shirt2: '#a81a22', pants: '#3a4a6a', shoes: '#2a2224', extra: 'cap' },
  r_grn: { skin: '#e2b48e', hair: '#c8a060', shirt: '#2a7a3a', shirt2: '#1e6a2e', pants: '#3a3a44', shoes: '#2a2224' },
  r_grn2: { skin: '#c99878', hair: '#2e2018', shirt: '#e8e4dc', shirt2: '#e8e4dc', pants: '#3a3a44', shoes: '#2a2224', vest: '#2a7a3a' },
  r_blk: { skin: '#ecc19c', hair: '#2a1e18', shirt: '#26262c', shirt2: '#3a3a42', pants: '#26262c', shoes: '#141416' },
  r_yel: { skin: '#d9a77c', hair: '#5a3a24', shirt: '#26262c', shirt2: '#f2c500', pants: '#3a3a44', shoes: '#141416' },
  r_navy: { skin: '#e2b48e', hair: '#3a2a20', shirt: '#1b2f5c', shirt2: '#2a4070', pants: '#3a3a44', shoes: '#2a2224' },
  r_coat: { skin: '#ecc19c', hair: '#5a3a24', shirt: '#f4f4f8', shirt2: '#e8e8f0', pants: '#3a4a6a', shoes: '#2a2224', glasses: 1 },
  r_sh1: { skin: '#e8b898', hair: '#8a5a2a', shirt: '#7a3a3a', shirt2: '#6a2e2e', pants: '#3a4a6a', shoes: '#5a3a24' },
  r_sh2: { skin: '#c99878', hair: '#1e1612', shirt: '#4a6a4a', shirt2: '#3a5a3a', pants: '#2a2a30', shoes: '#141416', extra: 'cap' },
  r_sh3: { skin: '#ecc19c', hair: '#d8d4cc', shirt: '#8a6a9a', shirt2: '#7a5a8a', pants: '#5a5a62', shoes: '#e8e8ea', glasses: 1 },
  r_sh4: { skin: '#d9a77c', hair: '#3a2a20', shirt: '#e07a20', shirt2: '#c86a18', pants: '#3a4a6a', shoes: '#2a2224', extra: 'beanie', hat: '#e07a20' },
  r_sh5: { skin: '#e2b48e', hair: '#c87a3a', shirt: '#3a6ab8', shirt2: '#2e5a9a', pants: '#8a7a58', shoes: '#5a3a24' },
  r_sh6: { skin: '#b8907a', hair: '#141214', shirt: '#a8322a', shirt2: '#1e1a1a', pants: '#2a3a52', shoes: '#2a2224' },
});
const RR_SHOPPERS = ['r_sh1', 'r_sh2', 'r_sh3', 'r_sh4', 'r_sh5', 'r_sh6'];
const RR_NOTE = 'Placeholder items and prices, made up for the game. Not the store\'s own.';

// ---------- the floor plan helpers ----------
function rrK(Fm) {
  const { R, W, H } = Fm, S = Fm.rr = { lk: new Map(), zn: [], sg: [], fz: [], exits: [] };
  const fl = (u, v) => v >= 0 && v < H && u >= 0 && u < W && R[v][u] === '.';
  const soft = (u, v) => R[v] && R[v][u] != null && !' WOe'.includes(R[v][u]) && R[v][u] !== 'N';
  const top = [], bot = [], left = [], right = [];
  for (let u = 0; u < W; u++) { top[u] = -1; bot[u] = -1; for (let v = 0; v < H; v++) if (R[v][u] === '.') { if (top[u] < 0) top[u] = v; bot[u] = v; } }
  for (let v = 0; v < H; v++) { left[v] = -1; right[v] = -1; for (let u = 0; u < W; u++) if (R[v][u] === '.') { if (left[v] < 0) left[v] = u; right[v] = u; } }
  const K = { Fm, R, W, H, S, fl, soft, top, bot, left, right,
    set(u, v, t, l) { if (!fl(u, v)) return false; R[v][u] = t; if (l) S.lk.set(v * W + u, l); return true; },
    put(u, v, t, l) { if (!soft(u, v)) return false; R[v][u] = t; if (l) S.lk.set(v * W + u, l); else S.lk.delete(v * W + u); return true; },
    clr(u0, u1, v0, v1) { for (let v = v0; v <= v1; v++) for (let u = u0; u <= u1; u++) if (soft(u, v)) { R[v][u] = '.'; S.lk.delete(v * W + u); } },
    wall(u, v) { if (soft(u, v)) { R[v][u] = 'W'; S.lk.delete(v * W + u); } },
    zone(x0, x1, y0, y1, n) { S.zn.push({ x0, x1, y0, y1, n }); },
    sign(x, y, t) { const w = q => q.length * 5.2 + 12;   // no two signs on one row overlap: the later one is left out
      if (S.sg.some(q => Math.abs(q.y - y) <= 1 && Math.abs(q.x - x) * 24 < (w(q.t) + w(t)) / 2 + 4)) return; S.sg.push({ x, y, t }); },
    floor(x0, x1, y0, y1, s) { S.fz.push({ x0, x1, y0, y1, s }); },
    npc(folk, u, v, name, talk) { if (!(R[v] && (R[v][u] === '.' || R[v][u] === 'x'))) { const q = K.near(u, v, 3); if (!q) return; [u, v] = q; } R[v][u] = 'N'; Fm.npcs.push({ x: u, y: v, folk, name, talk }); },
    near(u, v, r) {   // a floor tile near (u, v) with floor on two sides, so a person standing there never blocks an aisle shut
      for (let d = 0; d <= r; d++) for (let dv = -d; dv <= d; dv++) for (let du = -d; du <= d; du++) { if (Math.max(Math.abs(du), Math.abs(dv)) !== d) continue;
        const a = u + du, c = v + dv; if (fl(a, c) && ((fl(a - 1, c) && fl(a + 1, c)) || (fl(a, c - 1) && fl(a, c + 1)))) return [a, c]; }
      return null; },
  };
  return K;
}
const rrPick = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];
const rrSay = (who, line) => () => say([[who, line]]);
function rrShop(title, key, line, who) {
  return () => ask((who || 'Cashier') + ': ' + line, [{ t: 'Buy something', f: () => menuOpen(title, RR_STOCK[key], RR_NOTE) }, { t: 'Just looking' }]);
}
// a counter at the back wall: staff behind it, the counter (or cases) in front
function rrBackCounter(K, u0, u1, opt) {
  let t = 0; for (let u = u0; u <= u1; u++) if (K.top[u] >= 0) t = Math.max(t, K.top[u]);
  K.clr(u0 - 1, u1 + 1, t, t + 5);
  for (let u = u0; u <= u1; u++) { if (opt.shelf) K.put(u, t, opt.shelf, opt.shelfText); else K.put(u, t, 'x'); K.put(u, t + 1, 'x');
    K.put(u, t + 2, u === u0 || u === u1 ? 'r_k' : (Array.isArray(opt.tok) ? rrPick(opt.tok, u) : opt.tok || 'r_c'), opt.text); }
  const m = (u0 + u1) >> 1; if (opt.folk) K.npc(opt.folk, m, t + 1, opt.name, opt.talk);
  if (opt.folk2 && u1 - u0 >= 6) K.npc(opt.folk2, m + 3, t + 1, opt.name2 || opt.name, opt.talk2 || opt.talk);
  if (opt.sign) K.sign(m, t + 3, opt.sign);
  if (opt.zone) K.zone(u0 - 1, u1 + 1, t, t + 4, opt.zone);
  return t + 2;
}
// a counter near the front: the clerk stands between it and the front wall, facing the store
function rrFrontCounter(K, u0, u1, vc, folk, name, talk, sign) {
  for (let u = u0; u <= u1; u++) { K.put(u, vc, u === u0 ? 'r_k' : 'r_c'); for (let v = vc + 1; v <= vc + 2; v++) if (K.R[v] && K.R[v][u] === '.' && K.R[v + 1] && K.R[v + 1][u] === '.' && v === vc + 1) K.put(u, v, 'x'); }
  K.npc(folk, (u0 + u1 + 1) >> 1, vc + 1, name, talk); if (sign) K.sign((u0 + u1) >> 1, vc - 1, sign);
}
// departments side by side across [x0, x1]: fixtures from the back wall to row yb, wall fixtures along the back, signs, zones
function rrDepts(K, depts, x0, x1, yb, opt) {
  const o = opt || {}, tw = depts.reduce((a, d) => a + d.w, 0), span = x1 - x0 + 1; let acc = 0;
  for (const d of depts) { d.a = x0 + Math.round(acc / tw * span); acc += d.w; d.b = x0 + Math.round(acc / tw * span) - 1; }
  let y0 = 1e9; for (let u = x0; u <= x1; u++) if (K.top[u] >= 0) y0 = Math.min(y0, K.top[u] + 3);
  const skip = new Set(), total = yb - y0, n = total > 34 ? Math.round(total / 28) - 1 : 0, mids = [];
  for (let k = 1; k <= n; k++) { const m = y0 + Math.round(k * total / (n + 1)); mids.push(m); for (let v = m - 1; v <= m + 1; v++) skip.add(v); }
  const dist = o.doorsEvery || 0;
  for (let i = 0; i < depts.length; i++) {
    const d = depts[i], ua = i === 0 ? (o.ua != null ? o.ua : x0) : d.a, ub = i === depts.length - 1 ? (o.ub != null ? o.ub : x1) : d.b;
    // the back wall
    for (let u = ua; u <= ub; u++) { const t = K.top[u]; if (t < 0 || t > yb - 4) continue;
      if (dist && u % dist === 0 && K.top[u + 1] === t) { K.set(u, t, 'r_SD'); K.set(u + 1, t, 'r_SD'); u++; continue; }
      K.set(u, t, d.back || o.back || 'r_W0', d.backText || o.backText); }
    if (d.backSign) { const m = (d.a + d.b) >> 1; if (K.top[m] >= 0) K.sign(m, K.top[m] + 1, d.backSign); }
    // the floor
    const st = d.st || 'aisle', per = d.per || (st === 'aisle' ? 3 : st === 'rack' ? 3 : 4); let idx = 0;
    const tok = j => Array.isArray(d.tok) ? rrPick(d.tok, j) : d.tok;
    if (st === 'aisle') for (let u = d.a + 1; u <= d.b - 1; u += per, idx++) { const t = K.top[u]; if (t < 0) continue;
      const txt = rrPick(d.items, idx); for (let v = t + 3; v <= yb; v++) if (!skip.has(v)) K.set(u, v, tok(idx), txt);
    }
    else if (st === 'rack' || st === 'island') {
      const iw = st === 'island' ? (d.iw || 2) : 1, ih = st === 'island' ? (d.ih || 2) : 1, pv = st === 'island' ? (d.pv || 4) : 3;
      for (let u = d.a + 1; u + iw - 1 <= d.b - 1; u += per) for (let v = y0 + 1, j = 0; v + ih - 1 <= yb; v += pv, j++) {
        if ([...Array(ih).keys()].some(k => skip.has(v + k))) continue;
        const txt = rrPick(d.items, idx++ + j); for (let a = 0; a < iw; a++) for (let c = 0; c < ih; c++) K.set(u + a, v + c, tok(idx + j), txt); } }
    if (d.fn) d.fn(K, d, y0, yb);
    // the signs over the department, and where it is
    const m = (d.a + d.b) >> 1; K.sign(m, yb + 2, d.n); for (const r of mids) K.sign(m, r, d.n);
    K.zone(ua, ub, 0, yb + (o.zoneBelow != null ? o.zoneBelow : 2), d.n);
  }
  return { y0, mids, skip };
}
// side walls: shelving along the left and right walls from the back to row yb
function rrSides(K, v0, v1, lt, ltext, rt, rtext) {
  for (let v = v0; v <= v1; v++) { if (lt && K.left[v] >= 0) K.set(K.left[v], v, lt, ltext); if (rt && K.right[v] >= 0) K.set(K.right[v], v, rt, rtext); }
}
// another way in: a door in the front wall below column u (leaving by it puts you outside that door)
function rrDoor(K, u) {
  const v = K.bot[u] + 1; if (K.bot[u] < 0 || !K.R[v] || !'WO'.includes(K.R[v][u])) return null;
  K.R[v][u] = 'e'; K.S.exits.push([u, v]); return v;
}
function rrMats(K, u, v) { for (let a = u - 1; a <= u + 1; a++) for (let c = v - 2; c <= v - 1; c++) K.set(a, c, 'r_m'); }
// the front end of a big store: entrances, carts, checkout lanes, self-checkout, the service desk
function rrFront(K, Fm, o) {
  const vd = Fm.vd, doors = [Fm.ud].concat(o.doors2 || []), near = u => doors.some(e => Math.abs(u - e) <= 4);
  for (const e of doors) { const v = e === Fm.ud ? vd : K.bot[e] + 1; rrMats(K, e, v); for (const s of [-3, 3]) for (const c of [1, 2]) K.set(e + s, v - c, 'r_A', 'Shopping carts, nested in a row by the doors.'); }
  if (o.greeter) K.npc(o.staff, Fm.ud + 2, vd - 3, 'Greeter', rrSay('Greeter', o.greeter));
  let lane = 0;
  for (const [l0, l1] of o.lanes || []) for (let u = l0; u <= l1; u += 3) { if (near(u) || near(u + 1)) continue;
    const fr = Math.min(K.bot[u] >= 0 ? K.bot[u] : vd - 1, vd - 1); let ok = true; for (let v = fr - 5; v <= fr - 3; v++) if (!K.fl(u, v)) ok = false; if (!ok) continue;
    for (let v = fr - 5; v <= fr - 3; v++) K.set(u, v, 'r_K'); lane++;
    if (lane % 2 === 1) K.npc(o.staff, u + 1, fr - 4, 'Cashier', o.cashier); }
  if (o.self) { const [s0, s1] = o.self; for (let u = s0; u <= s1; u += 2) { K.set(u, vd - 6, 'r_S'); K.set(u, vd - 3, 'r_S'); }
    K.npc(o.staff, (s0 + s1) >> 1, vd - 5, 'Self-checkout helper', rrSay('Self-checkout helper', 'Scan it, bag it, pay at the screen. Wave if it beeps at you.')); K.sign((s0 + s1) >> 1, vd - 7, 'SELF CHECKOUT'); }
  if (o.desk) { const [d0, d1, name, line] = o.desk; for (let u = d0; u <= d1; u++) { K.put(u, vd - 4, u === d0 ? 'r_k' : 'r_c'); K.put(u, vd - 5, 'x'); K.put(u, vd - 6, 'r_W1', 'Shelves behind the service desk.'); }
    K.npc(o.staff, (d0 + d1) >> 1, vd - 5, name, rrSay(name, line)); K.sign((d0 + d1) >> 1, vd - 7, name.toUpperCase()); }
  if (o.wc != null) { const u = o.wc; for (let a = u; a <= u + 3; a++) for (let c = vd - 8; c <= vd - 6; c++) K.wall(a, c); K.put(u + 1, vd - 5, 'r_WC'); K.put(u + 2, vd - 5, 'r_WC'); K.sign(u + 2, vd - 6, 'RESTROOMS'); }
  K.zone(0, K.W, vd - 6, K.H, o.frontName || 'CHECKOUTS');
}
// shoppers and stockers, spread through the departments
function rrPeople(K, depts, yb, n, lines, staff, stockLines) {
  for (let i = 0; i < n; i++) { const d = depts[(i * 3 + 1) % depts.length], u = d.a + 2 + ((i * 5) % Math.max(1, d.b - d.a - 3));
    const v = Math.round((K.top[u] > 0 ? K.top[u] : 0) + 4 + ((i * 7) % 10) / 10 * Math.max(1, yb - K.top[u] - 6));
    const q = K.near(u, v, 4); if (q) K.npc(RR_SHOPPERS[i % 6], q[0], q[1], 'Shopper', rrSay('Shopper', rrPick(lines, i))); }
  if (staff) for (let i = 0; i < Math.max(1, depts.length >> 2); i++) { const d = depts[(i * 4 + 2) % depts.length], u = d.a + 2, v = Math.round(((K.top[u] > 0 ? K.top[u] : 0) + yb) / 2);
    const q = K.near(u, v, 4); if (q) K.npc(staff, q[0], q[1], 'Stocker', rrSay('Stocker', rrPick(stockLines || RR_STOCKER, i) + ' This is ' + d.n.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) + '.')); }
}
const RR_STOCKER = ['Looking for something? The signs over the aisles say what\'s in each one.', 'Just filling the shelves. Let me know if you can\'t find it.', 'Watch the cart, I\'ve got boxes everywhere.'];

// ---------- what's on the shelves (each aisle gets one line) ----------
const RR_I = {
  groc: ['Cereal and oatmeal.', 'Coffee, tea and hot cocoa.', 'Pasta, rice and pasta sauce.', 'Canned soup and vegetables.', 'Baking: flour, sugar and cake mix.', 'Chips, pretzels and popcorn.', 'Cookies and crackers.', 'Pop and bottled water, by the case.', 'Peanut butter, jelly and honey.', 'Spices, ketchup and mustard.', 'Baby food and diapers.', 'Candy, by the bag.'],
  frozen: ['Frozen pizza. A lot of frozen pizza.', 'Ice cream and frozen treats.', 'Frozen vegetables and fries.', 'Frozen dinners and breakfast sandwiches.', 'Frozen fish sticks and chicken nuggets.'],
  produce: ['Apples, red and green.', 'Bananas, in bunches.', 'Potatoes in five- and ten-pound bags.', 'Lettuce, greens and herbs.', 'Oranges, lemons and limes.', 'Onions, carrots and peppers.', 'Berries and grapes.', 'Squash, sweet corn and tomatoes.'],
  bakery: ['Loaves of bread, buns and bagels.', 'Cookies and muffins in clear boxes.', 'Donuts and coffee cakes.', 'Dinner rolls by the dozen.'],
  hba: ['Shampoo and conditioner.', 'Toothpaste and toothbrushes.', 'Makeup and nail polish.', 'Vitamins.', 'First aid: bandages and ointment.', 'Cold medicine and pain relievers.', 'Razors and shaving cream.', 'Deodorant and body wash.'],
  house: ['Paper towels and toilet paper, stacked to the ceiling.', 'Laundry detergent and dryer sheets.', 'Cleaning sprays, sponges and mops.', 'Trash bags and food storage bags.', 'Dog food in big bags, and cat litter.', 'Pet treats and toys.'],
  home: ['Pots, pans and kitchen gadgets.', 'Dishes, mugs and glasses.', 'Bath towels and shower curtains.', 'Storage bins and hangers.', 'Picture frames and candles.', 'Light bulbs and batteries.'],
  elec: ['Phone cases and chargers.', 'Headphones and speakers.', 'Video games and controllers.', 'Printer ink and cables.', 'Movies on disc.'],
  toys: ['Action figures.', 'Dolls and dollhouses.', 'Building blocks.', 'Board games and puzzles.', 'Toy cars and trucks.', 'Balls, bubbles and sidewalk chalk.'],
  sport: ['Fishing line, lures and tackle.', 'Camping gear: tents, stoves and lanterns.', 'Dumbbells and yoga mats.', 'Balls for every sport.', 'Blaze orange hats and gloves.'],
  auto: ['Motor oil, in quarts and jugs.', 'Wiper blades and washer fluid.', 'Car wax and air fresheners.', 'Car batteries and jumper cables.', 'Oil filters and air filters.'],
  cloth: ['A round rack of jeans.', 'T-shirts in every color.', 'Hoodies and sweatshirts.', 'Winter coats.', 'Kids\' clothes.', 'Pajamas.', 'Socks and underwear, on hooks nearby.'],
  shoes: ['Sneakers, sorted by size.', 'Boots.', 'Sandals and slippers.', 'Kids\' shoes.'],
};

// ---------- the stores ----------
const RR_STORES = {};
RR_STORES.walmart = Fm => {   // Walmart Supercenter: grocery on one side, general merchandise on the other, pharmacy at the back
  const K = rrK(Fm), vd = Fm.vd, { W } = K, yb = vd - 10, st = 'r_blue';
  const depts = [
    { n: 'BAKERY & DELI', w: 12, st: 'island', tok: 'r_T2', items: RR_I.bakery, back: 'r_W0', fn: (K, d) => rrBackCounter(K, d.a + 1, d.b - 1, { tok: ['r_E0', 'r_E1'], text: 'The deli and bakery cases: sliced meat and cheese, fried chicken under the warmer, cakes and pies.', folk: 'r_blue2', name: 'Deli', talk: rrShop('Walmart Deli', 'deli', 'What can I get you from the deli?', 'Deli'), sign: 'DELI · BAKERY', zone: 'DELI & BAKERY' }) },
    { n: 'PRODUCE', w: 16, st: 'island', tok: 'r_P', iw: 3, per: 5, items: RR_I.produce, back: 'r_M1', backText: 'An open cooler of bagged salads, cut fruit and fresh herbs.' },
    { n: 'FROZEN', w: 14, tok: 'r_F1', items: RR_I.frozen, back: 'r_M0', backText: 'The meat case: ground beef, chicken, pork chops and brats.', backSign: 'MEAT' },
    { n: 'GROCERY', w: 32, tok: 'r_G0', items: RR_I.groc, back: 'r_F0', backText: 'Dairy coolers: milk, eggs, butter and yogurt, and a lot of Wisconsin cheese.', backSign: 'DAIRY' },
    { n: 'HEALTH & BEAUTY', w: 14, tok: 'r_G2', items: RR_I.hba, back: 'r_W2', fn: (K, d) => rrBackCounter(K, d.a + 1, d.b - 1, { shelf: 'r_W2', shelfText: 'Shelves of medicine bottles behind the pharmacy counter.', folk: 'r_coat', name: 'Pharmacist', folk2: 'r_blue2', name2: 'Pharmacy tech', talk: () => say([['Pharmacist', 'Pickup is at this window, drop-off at the other end. Questions about a medicine? Ask us or your doctor.'], ['', '(Prescriptions aren\'t part of the game.)']]), sign: 'PHARMACY', zone: 'PHARMACY' }) },
    { n: 'HOUSEHOLD & PETS', w: 14, tok: 'r_G1', items: RR_I.house, back: 'r_W1', backText: 'Paper towels and toilet paper, stacked to the ceiling.' },
    { n: 'HOME', w: 14, tok: 'r_G7', items: RR_I.home, back: 'r_W7', backText: 'Bedding and towels, folded in stacks.' },
    { n: 'ELECTRONICS', w: 10, tok: 'r_G6', items: RR_I.elec, back: 'r_V', backText: 'A wall of TVs, all showing the same nature show.' },
    { n: 'TOYS', w: 10, tok: 'r_G5', items: RR_I.toys, back: 'r_W5', backText: 'Big boxed toys on the top shelves.' },
    { n: 'SPORTS & OUTDOORS', w: 9, tok: 'r_G8', items: RR_I.sport, back: 'r_Bk', backText: 'Bikes, hung in a row.' },
    { n: 'AUTOMOTIVE', w: 8, tok: 'r_G9', items: RR_I.auto, back: 'r_Tr', backText: 'Tires stacked on racks.' },
    { n: 'SHOES', w: 6, tok: 'r_Bt', items: RR_I.shoes, back: 'r_Bt' },
    { n: 'APPAREL', w: 22, st: 'rack', tok: 'r_C', items: RR_I.cloth, back: 'r_Q', backText: 'Jeans and jackets on the wall racks.', fn: (K, d, y0) => {
        for (let u = d.b - 6; u <= d.b - 2; u += 2) { K.clr(u, u, y0, y0 + 1); K.put(u, y0, 'r_Fit', 'A fitting room. The sign says six items at a time.'); } K.sign(d.b - 4, y0 + 1, 'FITTING ROOMS'); } },
  ];
  const D = rrDepts(K, depts, 4, W - 5, yb, { doorsEvery: 29 });
  rrSides(K, D.y0 - 2, yb, 'r_F0', 'Coolers: juice, eggs and more milk.', 'r_Q', 'Coats and boots along the wall.');
  // the garden center, fenced off at the front corner of the general merchandise side
  const gb = vd - 1, gx1 = K.right[gb], gx0 = gx1 - 17, gy0 = vd - 30;
  if (gx1 > 60) { K.clr(gx0, W - 1, gy0, gb); K.S.sg = K.S.sg.filter(q => !(q.x >= gx0 && q.y >= gy0)); K.clr(gx0 - 3, gx0 - 1, gy0 + 6, gy0 + 12);
    for (let v = gy0; v <= gb; v++) if (v < gy0 + 7 || v > gy0 + 11) K.wall(gx0, v);
    for (let u = gx0; u < W; u++) K.wall(u, gy0);
    for (let u = gx0 + 3; u <= gx1 - 3; u += 4) for (let v = gy0 + 3; v <= gb - 6; v += 4) { K.set(u, v, 'r_Y'); K.set(u + 1, v, 'r_Y'); }
    for (let v = gy0 + 2; v <= gb - 3; v++) K.set(K.right[v], v, 'r_B0', 'Bags of potting soil, mulch and stone, on pallets.');
    rrFrontCounter(K, gx0 + 2, gx0 + 5, gb - 3, st, 'Garden cashier', rrShop('Walmart Garden Center', 'garden', 'Ring it up out here? Saves the trip to the front.', 'Garden cashier'));
    K.floor(gx0, W - 1, gy0, gb, 'concrete'); K.S.zn.unshift({ x0: gx0, x1: W - 1, y0: gy0, y1: gb, n: 'GARDEN CENTER' }); K.sign(gx0 - 1, gy0 + 9, 'GARDEN CENTER'); }
  // the front: the grocery doors (the main door), the general merchandise doors, lanes between, the vision center by the far wall
  const ue = Fm.ud + Math.round(W * 0.22), e2 = rrDoor(K, ue);
  const shop = rrShop('Walmart', 'walmart', 'Hi! Find everything okay?');
  rrFront(K, Fm, { staff: st, doors2: e2 ? [ue] : [], cashier: shop, greeter: 'Hi, welcome to Walmart! Carts are right there.',
    lanes: [[20, Fm.ud - 5], [Fm.ud + 19, ue - 6]], self: [Fm.ud + 5, Fm.ud + 15],
    desk: [ue + 4, ue + 10, 'Customer Service', 'Returns and exchanges, right here. The restrooms are just past the desk.'], wc: ue + 12 });
  const v0 = K.left[vd - 3] >= 0 ? K.left[vd - 3] + 1 : 6;
  for (let u = v0; u <= v0 + 6; u++) K.set(u, vd - 7, 'r_eye', 'Eyeglass frames on display. Try them on in the mirror.');
  rrFrontCounter(K, v0 + 1, v0 + 4, vd - 4, 'r_blue2', 'Vision center', rrSay('Vision center', 'Eye exams are by appointment. Feel free to try on frames.'), 'VISION CENTER');
  K.S.zn.unshift({ x0: v0 - 1, x1: v0 + 8, y0: vd - 8, y1: vd, n: 'VISION CENTER' });
  rrPeople(K, depts, yb, 12, ['I came in for one thing. Look at this cart.', 'Have you seen the frozen pizza aisle? It just keeps going.', 'My kid is somewhere in the toys.', 'Every time I come in, I walk ten thousand steps.', 'Do they still have the blaze orange hats in?', 'I\'m getting stuff for a cookout.'], st);
};
RR_STORES.menards = Fm => {   // Menards: the yard out back, building materials, hardware, paint, a little grocery by the front
  const K = rrK(Fm), vd = Fm.vd, { W } = K, yb = vd - 10, st = 'r_grn2';
  const depts = [
    { n: 'GROCERY & PETS', w: 10, tok: 'r_G0', items: ['Pop and bottled water.', 'Chips, jerky and candy.', 'Cleaning supplies.', 'Dog food and bird seed.', 'Paper towels and toilet paper.'], back: 'r_F2', backText: 'Coolers of pop, milk and eggs.' },
    { n: 'HARDWARE', w: 14, tok: 'r_G3', items: ['Bins of screws, nuts and bolts.', 'Nails by the pound.', 'Hinges, hooks and door hardware.', 'Chain and rope, by the foot.', 'Glue, tape and caulk.', 'Key blanks; keys are cut at the end of the aisle.'], back: 'r_W3', backText: 'Tool chests and cabinets.' },
    { n: 'TOOLS', w: 10, tok: 'r_G3', items: ['Hammers, wrenches and screwdrivers.', 'Power drills and saws.', 'Ladders, standing in a row.', 'Shop vacs and air compressors.'], back: 'r_W3' },
    { n: 'PAINT', w: 10, tok: 'r_G7', items: ['Gallons of paint.', 'Brushes, rollers and trays.', 'Stain and varnish.', 'Spray paint.', 'Drop cloths and painter\'s tape.'], back: 'r_W7',
      fn: (K, d) => rrBackCounter(K, d.a + 1, d.b - 1, { tok: 'r_c', text: 'The paint counter. A shaker rattles a gallon at the end.', folk: st, name: 'Paint desk', talk: rrSay('Paint desk', 'Bring a chip of the color you want and we\'ll match it. The shaker mixes a gallon in about a minute.'), sign: 'PAINT DESK', zone: 'PAINT DESK' }) },
    { n: 'ELECTRICAL', w: 10, tok: 'r_G3', items: ['Wire on big spools, sold by the foot.', 'Outlets, switches and boxes.', 'Extension cords.', 'Light bulbs.', 'Breakers and panels.'], back: 'r_W6', backText: 'Ceiling lights and fans, lit up on display.', backSign: 'LIGHTING' },
    { n: 'PLUMBING', w: 10, tok: 'r_G7', items: ['Pipe and fittings.', 'Faucets.', 'Water heaters, boxed.', 'Sump pumps and hoses.', 'Toilet parts.'], back: 'r_B2', backText: 'Water softener salt on pallets.' },
    { n: 'KITCHEN & BATH', w: 12, st: 'island', tok: 'r_Cb', iw: 3, per: 5, pv: 5, items: ['A kitchen display: cabinets and a countertop.', 'A bathroom vanity display.', 'Sample cabinet doors in a dozen finishes.'], back: 'r_Cb' },
    { n: 'FLOORING', w: 10, tok: 'r_H', per: 4, items: ['Boxes of laminate and vinyl plank flooring.', 'Rolls of carpet, standing on end.', 'Ceramic tile, boxed.'], back: 'r_H' },
    { n: 'APPLIANCES', w: 10, st: 'island', tok: ['r_Ap0', 'r_Ap1', 'r_Ap2'], iw: 1, ih: 1, per: 3, pv: 3, items: ['A refrigerator, door open a crack.', 'A washer and dryer.', 'A kitchen range.'], back: 'r_Ap0' },
    { n: 'BUILDING MATERIALS', w: 16, tok: 'r_L', per: 4, items: ['Drywall sheets on a cart rack.', 'Insulation rolls, stacked high.', 'Plywood and OSB.', '2x4s, the indoor stack.', 'Concrete mix and mortar, by the bag.'], back: 'r_LY',
      backText: 'Big doors out to the lumber yard. Pay at the front, load up in the yard, and show the receipt at the gate on the way out.', backSign: 'LUMBER YARD' },
    { n: 'MILLWORK', w: 10, tok: 'r_Dr', items: ['Interior doors, standing on edge.', 'Exterior doors.', 'Windows, boxed.', 'Trim and molding.'], back: 'r_Dr' },
    { n: 'SEASONAL', w: 8, st: 'island', tok: 'r_Y', items: ['Plants and flowers.', 'Bird feeders and patio things.', 'Snow shovels and ice melt, in the cold months.'], back: 'r_B0', backText: 'Mulch and soil bags on pallets.' },
  ];
  rrDepts(K, depts, 4, W - 5, yb, { doorsEvery: 31 });
  rrSides(K, 3, yb, 'r_W3', 'Shelving along the wall.', 'r_H', 'Tall racks along the wall.');
  rrFront(K, Fm, { staff: st, cashier: rrShop('Menards', 'menards', 'Find everything you needed?'), lanes: [[Fm.ud + 6, W - 26]],
    desk: [Math.max(4, Fm.ud - 16), Fm.ud - 8, 'Guest Services', 'Returns, special orders and rebate forms, right here. The yard is through the doors at the back.'], wc: Fm.ud - 22 > 3 ? Fm.ud - 22 : null });
  rrFrontCounter(K, W - 18, W - 9, vd - 5, st, 'Contractor desk', rrSay('Contractor desk', 'Building something big? We can figure out the whole list and have it waiting in the yard.'), 'PRO DESK');
  rrPeople(K, depts, yb, 10, ['I need one hinge. I\'ve been here an hour.', 'My wife sent me for paint. I\'m comparing grays.', 'This place has everything. I even got lunch stuff.', 'Building a deer stand this weekend.', 'You need a cart for this place, trust me.'], st);
};
RR_STORES.fleet = Fm => {   // Fleet Farm: farm and ranch, hunting and fishing, clothes and boots, toys, auto, hardware
  const K = rrK(Fm), vd = Fm.vd, { W } = K, yb = vd - 10, st = 'r_red';
  const depts = [
    { n: 'FARM & RANCH', w: 20, tok: 'r_B1', per: 4, items: ['Pallets of livestock feed.', 'Mineral blocks and salt licks.', 'Fencing: wire, posts and insulators.', 'Water tanks and heated buckets.', 'Horse tack and grooming brushes.', 'Chicken feeders and waterers.'], back: 'r_H', backText: 'Rolls of fencing wire, up on the racks.' },
    { n: 'PET', w: 10, tok: 'r_B2', per: 4, items: ['Dog food in forty-pound bags.', 'Cat food and litter.', 'Bird seed and suet.', 'Dog beds and leashes.'], back: 'r_W4' },
    { n: 'LAWN & GARDEN', w: 12, st: 'island', tok: 'r_Mw', iw: 2, ih: 1, items: ['A riding mower.', 'Push mowers in a row.', 'A snowblower.', 'Wheelbarrows.'], back: 'r_W3', backText: 'Rakes, shovels and grass seed.' },
    { n: 'AUTOMOTIVE', w: 12, tok: 'r_G9', items: ['Motor oil and filters.', 'Hitches, straps and truck accessories.', 'Car batteries.', 'Antifreeze and washer fluid.'], back: 'r_Tr', backText: 'Tires on the racks.' },
    { n: 'HARDWARE', w: 14, tok: 'r_G3', items: ['Bolts by the pound.', 'Hand tools.', 'Power tools.', 'Chain and rope by the foot.', 'Work gloves.'], back: 'r_W3' },
    { n: 'HOUSEWARES', w: 12, tok: 'r_G7', items: ['Canning jars and lids.', 'Pots, pans and roasters.', 'Cleaning supplies.', 'Paper towels.'], back: 'r_W1' },
    { n: 'TOYS', w: 12, tok: 'r_G5', items: ['Farm toys: tractors, wagons and barns.', 'Board games and puzzles.', 'Ride-on toys.', 'Dolls and action figures.'], back: 'r_W5' },
    { n: 'CLOTHING & BOOTS', w: 24, st: 'rack', tok: 'r_C', items: ['Work jackets.', 'Flannel shirts.', 'Jeans and work pants.', 'Hooded sweatshirts.', 'Wool socks.', 'Kids\' snow pants.'], back: 'r_Bt', backText: 'A wall of boots: work boots, rubber boots, winter boots.', backSign: 'BOOTS' },
    { n: 'CAMPING', w: 10, tok: 'r_G8', items: ['Tents and sleeping bags.', 'Coolers.', 'Camp stoves and lanterns.', 'Ice fishing shelters.'], back: 'r_W8' },
    { n: 'FISHING', w: 12, tok: 'r_Rod', items: ['Fishing rods, rows of them.', 'Reels.', 'Tackle: lures, jigs and bobbers.', 'Ice fishing rods and tip-ups.'], back: 'r_W8', backText: 'Fishing line and nets.' },
    { n: 'HUNTING', w: 14, tok: 'r_G8', items: ['Blaze orange coats and hats.', 'Tree stands and blinds.', 'Game calls and scents.', 'Trail cameras.', 'Archery targets and arrows.'], back: 'r_W8',
      fn: (K, d) => rrBackCounter(K, d.a + 1, d.b - 1, { tok: 'r_c', shelf: 'r_W8', shelfText: 'Optics and gear behind the counter.', folk: st, name: 'Sporting goods', talk: rrSay('Sporting goods', 'Hunting and fishing licenses are sold right here. Need help finding gear for the season?'), sign: 'SPORTING GOODS', zone: 'SPORTING GOODS' }) },
  ];
  rrDepts(K, depts, 4, W - 5, yb, { doorsEvery: 33 });
  rrSides(K, 3, yb, 'r_H', 'Tall racks along the wall.', 'r_W8', 'Shelving along the wall.');
  rrFront(K, Fm, { staff: st, cashier: rrShop('Fleet Farm', 'fleet', 'Find everything? We\'ve got candy and popcorn right here too.'), lanes: [[8, Fm.ud - 24], [Fm.ud + 6, W - 30]],
    desk: [Fm.ud - 15, Fm.ud - 8, 'Service Desk', 'Returns and special orders here. The tire and lube shop is around the side.'], wc: Fm.ud - 20 });
  for (let u = W - 26; u <= W - 12; u += 3) for (let v = vd - 6; v <= vd - 4; v++) K.set(u, v, 'r_G0', 'Bulk candy, nuts and popcorn, by the checkouts.');
  K.sign(W - 19, vd - 7, 'CANDY & SNACKS');
  rrPeople(K, depts, yb, 10, ['Deer season\'s coming. I need blaze orange.', 'Came for chicken feed, leaving with a cooler and a hat.', 'They have every kind of boot here.', 'My kids are on the toy tractors again.', 'I\'m looking for a part for the snowblower.'], st);
};
const RR_GROCERY = (key, title, st, depts, extra) => Fm => {   // a supermarket: produce by the door, fresh around the walls, aisles in the middle
  const K = rrK(Fm), vd = Fm.vd, { W } = K, yb = vd - 10;
  rrDepts(K, depts, 3, W - 4, yb, { doorsEvery: W > 80 ? 35 : 0 });
  rrSides(K, 3, yb, 'r_M0', 'The meat case along the wall.', 'r_F0', 'Coolers: milk, eggs, juice and yogurt.');
  const shop = rrShop(title, key === 'aldi' ? 'pns' : key, 'Hi! Did you find everything okay?');
  const lanesR = W > 70 ? [[10, Fm.ud - 5]] : [[4, Fm.ud - 5]], self = W > 70 ? [Fm.ud + 5, Fm.ud + 15] : null;
  rrFront(K, Fm, { staff: st, cashier: shop, lanes: lanesR, self, desk: W > 70 ? [Fm.ud + 18, Fm.ud + 24, 'Service Desk', 'Stamps, returns, and the lottery are right here.'] : null });
  if (extra) extra(K, Fm);
  rrPeople(K, depts, yb, W > 70 ? 8 : 4, ['I\'m making hotdish tonight.', 'Do you know where they keep the cream of mushroom?', 'These potatoes are local. Langlade County potatoes.', 'I just need milk. And bread. And... okay, a cart.'], st);
};
const RR_GROC_DEPTS = big => [
  { n: 'FROZEN', w: 12, tok: 'r_F1', items: RR_I.frozen, back: 'r_M0', backText: 'The meat case: steaks, chicken, brats and ground beef.', backSign: 'MEAT' },
  { n: 'GROCERY', w: big ? 30 : 16, tok: 'r_G0', items: RR_I.groc, back: 'r_F0', backText: 'Dairy coolers: milk, eggs, butter and cheese curds.', backSign: 'DAIRY' },
  ...(big ? [{ n: 'DELI & BAKERY', w: 12, st: 'island', tok: 'r_T2', items: RR_I.bakery, fn: (K, d) => rrBackCounter(K, d.a + 1, d.b - 1, { tok: ['r_E0', 'r_E1'], text: 'The deli and bakery cases.', folk: 'r_red2', name: 'Deli', talk: rrShop('Deli', 'deli', 'What can I get you? Sliced fresh.', 'Deli'), sign: 'DELI · BAKERY', zone: 'DELI & BAKERY' }) }] : []),
  { n: 'PRODUCE', w: big ? 18 : 10, st: 'island', tok: 'r_P', iw: 3, per: 5, items: RR_I.produce, back: 'r_M1', backText: 'Bagged salads and cut fruit in an open cooler.' },
  ...(big ? [{ n: 'SNACKS & DRINKS', w: 12, tok: 'r_G0', items: ['Chips.', 'Pop and water.', 'Cookies and crackers.', 'Candy.'], back: 'r_F2', backText: 'Coolers of pop and juice.' },
    { n: 'HEALTH & BEAUTY', w: 10, tok: 'r_G2', items: RR_I.hba, back: 'r_W2' }] : []),
  { n: 'HOUSEHOLD', w: big ? 10 : 6, tok: 'r_G1', items: RR_I.house, back: 'r_W1', backText: 'Paper towels and toilet paper, stacked to the ceiling.' },
];
RR_STORES.pns = RR_GROCERY('pns', "Pick 'n Save", 'r_red', RR_GROC_DEPTS(true), (K, Fm) => {
  // the pharmacy: in the front corner that sticks out past the doors (or at the back, if the outline has none)
  const wing = []; for (let u = 0; u < K.W; u++) if (K.bot[u] > Fm.vd + 3) wing.push(u);
  const talk = () => say([['Pharmacist', 'Pharmacy pickup is right here. Questions about a medicine? Ask us or your doctor.'], ['', '(Prescriptions aren\'t part of the game.)']]);
  if (wing.length >= 8) { const u1 = wing[wing.length - 1] - 1, u0 = Math.max(wing[0] + 1, u1 - 10), vb = Math.min(...wing.slice(-8).map(u => K.bot[u]));
    K.clr(u0 - 1, u1 + 1, vb - 6, vb); for (let u = u0; u <= u1; u++) { K.put(u, vb, 'r_W2', 'Shelves of medicine bottles.'); K.put(u, vb - 1, 'x'); K.put(u, vb - 2, u === u0 ? 'r_k' : 'r_c'); }
    K.npc('r_coat', (u0 + u1) >> 1, vb - 1, 'Pharmacist', talk); K.sign((u0 + u1) >> 1, vb - 3, 'PHARMACY'); K.S.zn.unshift({ x0: u0 - 1, x1: u1 + 1, y0: vb - 5, y1: vb, n: 'PHARMACY' }); }
  for (let u = Fm.ud - 4; u <= Fm.ud - 2; u++) K.set(u, Fm.vd - 8, 'r_Y', 'Fresh flowers by the door.');
});
RR_STORES.sentry = RR_GROCERY('sentry', 'Sentry', 'r_red', RR_GROC_DEPTS(false));
RR_STORES.aldi = RR_GROCERY('aldi', 'ALDI', 'r_navy', RR_GROC_DEPTS(false));
// small stores: aisles front to back, the register by the door
function rrSmall(Fm, o) {
  const K = rrK(Fm), vd = Fm.vd, { W } = K, yb = vd - (o.front || 7);
  const D = rrDepts(K, o.depts, 2, W - 3, yb, { zoneBelow: 1 });
  rrSides(K, D.y0 - 2, yb + 1, o.left, o.leftText, o.right, o.rightText);
  const side = Fm.ud > W / 2 ? -1 : 1, r0 = side > 0 ? Fm.ud + 3 : Fm.ud - 3 - (o.regW || 5), r1 = r0 + (o.regW || 5);
  rrFrontCounter(K, Math.max(2, r0), Math.min(W - 3, r1), vd - 4, o.staff, 'Cashier', o.cashier, o.regSign);
  rrMats(K, Fm.ud, vd);
  K.zone(0, W, yb + 2, vd, o.frontName || 'REGISTERS');
  if (o.extra) o.extra(K, Fm, D, yb);
  rrPeople(K, o.depts, yb, o.shoppers || 3, o.lines, o.stocker ? o.staff : null);
  return K;
}
RR_STORES.dtree = Fm => rrSmall(Fm, { staff: 'r_grn', cashier: rrShop('Dollar Tree', 'dollar', 'Hi there! Did you find everything?'), left: 'r_W5', leftText: 'Party supplies: balloons, plates and streamers.',
  right: 'r_F1', rightText: 'Freezers and coolers: ice cream, frozen dinners, pop.', lines: ['I came for a birthday card and got the whole party.', 'They have the good balloons.', 'Teachers love this place.'],
  depts: [{ n: 'PARTY', w: 3, tok: 'r_G5', items: ['Gift bags and tissue paper.', 'Party plates and cups.'] }, { n: 'SNACKS & CANDY', w: 3, tok: 'r_G0', items: ['Candy and snacks.', 'Chips and cookies.'] },
    { n: 'HOUSEHOLD', w: 3, tok: 'r_G1', items: ['Cleaning supplies and sponges.', 'Kitchen gadgets and food storage.'] }, { n: 'HEALTH & BEAUTY', w: 3, tok: 'r_G2', items: ['Shampoo, toothpaste and soap.'] },
    { n: 'CRAFTS & SCHOOL', w: 3, tok: 'r_G7', items: ['Notebooks, pens and crafts.', 'Greeting cards.'] }] });
RR_STORES.dg = Fm => rrSmall(Fm, { staff: 'r_yel', cashier: rrShop('Dollar General', 'dollar', 'Hi! Find everything you need?'), left: 'r_F2', leftText: 'Coolers: milk, eggs, pop and frozen food.', right: 'r_W1', rightText: 'Paper towels and toilet paper.',
  lines: ['Quick trip. Milk, eggs, done.', 'Handy that it\'s close by.', 'They\'ve got the cleaning stuff I like.'],
  depts: [{ n: 'FOOD', w: 4, tok: 'r_G0', items: ['Canned food, pasta and cereal.', 'Snacks and candy.'] }, { n: 'CLEANING', w: 3, tok: 'r_G1', items: ['Laundry and cleaning supplies.'] },
    { n: 'HEALTH & BEAUTY', w: 3, tok: 'r_G2', items: ['Medicine, vitamins and first aid.', 'Shampoo and soap.'] }, { n: 'HOME & SEASONAL', w: 3, tok: 'r_G7', items: ['Kitchen things and home decor.', 'Seasonal: whatever holiday is next.'] },
    { n: 'PETS & TOYS', w: 3, tok: 'r_G5', items: ['Pet food and toys.', 'Kids\' toys.'] }] });
RR_STORES.walgreens = Fm => {   // the pharmacy at the back with the drive-thru, beauty up front, coolers along the wall
  const talk = () => say([['Pharmacist', 'Pickup on the left, drop-off on the right. Questions about a medicine? Ask us or your doctor.'], ['', '(Prescriptions aren\'t part of the game.)']]);
  rrSmall(Fm, { staff: 'r_blk', cashier: rrShop('Walgreens', 'walgreens', 'Hi, welcome to Walgreens. Find everything?'), front: 10, left: 'r_F2', leftText: 'Coolers: milk, pop, energy drinks and ice cream.', right: 'r_W2', rightText: 'Beauty: makeup, nail polish and skin care.',
    lines: ['Just picking up a prescription.', 'I always end up in the candy aisle.', 'The photo kiosk prints in an hour, I think.'], stocker: true,
    depts: [{ n: 'HEALTH', w: 4, tok: 'r_G2', items: ['Pain relief and cold medicine.', 'Vitamins.', 'First aid.'] }, { n: 'PERSONAL CARE', w: 3, tok: 'r_G2', items: ['Hair care.', 'Toothpaste and razors.'] },
      { n: 'HOUSEHOLD', w: 3, tok: 'r_G1', items: ['Paper towels and detergent.', 'Baby care.'] }, { n: 'SNACKS', w: 3, tok: 'r_G0', items: ['Snacks and candy.', 'Pop and water.'] }, { n: 'CARDS & GIFTS', w: 3, tok: 'r_G7', items: ['Greeting cards and gift wrap.', 'Seasonal things.'] }],
    extra: (K, Fm) => { const u0 = 4, u1 = K.W - 5; rrBackCounter(K, u0, u1, { shelf: 'r_W2', shelfText: 'Shelves of medicine bottles behind the pharmacy counter.', folk: 'r_coat', name: 'Pharmacist', folk2: 'r_blk', name2: 'Pharmacy tech', talk, sign: 'PHARMACY', zone: 'PHARMACY' });
      const t = K.top[u1]; K.put(K.right[t + 1] >= 0 ? K.right[t + 1] : u1, t + 1, 'r_Dt', 'The drive-thru window. A drawer slides out to the cars outside.');
      const ph = Fm.ud > K.W / 2 ? 3 : K.W - 5; K.clr(ph, ph + 1, Fm.vd - 9, Fm.vd - 8); K.put(ph, Fm.vd - 8, 'r_Ph', 'A photo kiosk. Pictures print right here.'); K.sign(ph, Fm.vd - 9, 'PHOTO'); } });
};
RR_STORES.autoparts = (Fm, staff, title) => {   // the parts counter across the store, the parts behind it, oil and wipers up front
  const K = rrK(Fm), vd = Fm.vd, { W, H } = K; let t = 1e9; for (let u = 0; u < W; u++) if (K.top[u] >= 0) t = Math.min(t, K.top[u]);
  const cv = t + Math.max(6, Math.floor((vd - t) * 0.42));
  for (let v = t; v < cv - 1; v += 2) for (let u = 0; u < W; u++) if (u % 6 !== 1) K.set(u, v, 'r_H', 'Parts in boxes, shelved by number behind the counter.');
  for (let v = cv - 1; v >= t; v--) for (let u = 0; u < W; u++) if (K.fl(u, v)) K.put(u, v, 'x');
  for (let u = 0; u < W; u++) if (K.soft(u, cv)) K.put(u, cv, (u % 4 === 1) ? 'r_k' : 'r_c', 'The parts counter, with computers to look up the right part.');
  const talk = rrShop(title, 'auto', 'What are you working on? Year, make and model?', 'Parts counter');
  for (let u = 2; u < W - 2; u += 6) K.npc(staff, u, cv - 1, 'Parts counter', talk);
  K.sign(W >> 1, cv + 1, 'PARTS COUNTER'); K.zone(0, W, 0, cv, 'PARTS COUNTER');
  const depts = [{ n: 'OIL & FLUIDS', w: 3, tok: 'r_G9', items: ['Motor oil, in quarts and jugs.', 'Antifreeze and brake fluid.'] }, { n: 'WIPERS & ACCESSORIES', w: 3, tok: 'r_G9', items: ['Wiper blades, by size.', 'Floor mats and seat covers.', 'Air fresheners.'] },
    { n: 'CHEMICALS & TOOLS', w: 3, tok: 'r_G3', items: ['Car wax and cleaners.', 'Hand tools and jacks.'] }];
  const tw = 9, span = W - 6; let acc = 0; for (const d of depts) { d.a = 3 + Math.round(acc / tw * span); acc += d.w; d.b = 3 + Math.round(acc / tw * span) - 1;
    for (let u = d.a + 1, i = 0; u <= d.b - 1; u += 3, i++) for (let v = cv + 3; v <= vd - 5; v++) K.set(u, v, d.tok, rrPick(d.items, i)); K.zone(d.a, d.b, cv + 1, vd - 3, d.n); }
  for (let v = cv + 2; v <= vd - 4; v++) { K.set(K.right[v], v, 'r_Bat', 'Car batteries on a rack, tested and ready.'); K.set(K.left[v], v, 'r_W9', 'Shelves of filters and bulbs.'); }
  rrMats(K, Fm.ud, vd); K.npc('r_sh2', Fm.ud + 2, vd - 6, 'Customer', rrSay('Customer', 'I need wiper blades before the snow. Always the wrong size.'));
  void H;
};
RR_STORES.oreilly = Fm => RR_STORES.autoparts(Fm, 'r_grn', "O'Reilly Auto Parts");
RR_STORES.autovalue = Fm => RR_STORES.autoparts(Fm, 'r_navy', 'Auto Value');
RR_STORES.goodwill = Fm => rrSmall(Fm, { staff: 'r_navy', cashier: rrShop('Goodwill', 'goodwill', 'Hi! Today\'s tag color is on the sign by the door.'), left: 'r_Q', leftText: 'Shirts on the wall racks, sorted by size and color.', right: 'r_W7', rightText: 'Housewares: mugs, dishes and lamps.',
  lines: ['I found a cast iron pan for almost nothing.', 'Every week there\'s something new.', 'I\'m looking for a Halloween costume. Early.'], shoppers: 4,
  depts: [{ n: 'CLOTHING', w: 10, st: 'rack', tok: 'r_C', items: ['A rack of shirts, sorted by color.', 'Jeans and pants.', 'Coats and jackets.', 'Dresses and skirts.'], back: 'r_Q' },
    { n: 'HOUSEWARES', w: 4, tok: 'r_G7', items: ['Dishes, mugs and glasses.', 'Lamps and picture frames.', 'Toys and games.'], back: 'r_W3' },
    { n: 'BOOKS', w: 3, tok: 'r_W3', items: ['Used books, a whole shelf of paperbacks.', 'Movies and music.'], back: 'r_SD', backText: 'The donation door. Donations come in at the back of the store.' }],
  extra: (K, Fm, D) => { const v = D.y0 + 2, u = K.left[v] + 1; for (let k = 0; k < 3; k++) K.put(u + k, v, 'r_Fit', 'A fitting room.'); K.sign(u + 1, v + 1, 'FITTING ROOMS'); } });
RR_STORES.cellcom = Fm => rrSmall(Fm, { staff: 'r_blk', cashier: () => ask('Sales: Hi! Looking at a new phone, or need a hand with yours?', [{ t: 'Browse accessories', f: () => menuOpen('Cellcom', RR_STOCK.cellcom, RR_NOTE) }, { t: 'Just looking' }]),
  front: 5, left: 'r_W6', leftText: 'Cases and chargers on the wall.', right: 'r_W6', rightText: 'Headphones and speakers.', lines: ['My phone screen cracked. Again.'], shoppers: 1,
  depts: [{ n: 'PHONES', w: 1, st: 'island', tok: 'r_T1', iw: 2, ih: 1, per: 4, pv: 3, items: ['Phones on a display table, each on a little stand.'], back: 'r_W6', backText: 'Accessories on the back wall.' }] });
RR_STORES.fastenal = Fm => rrSmall(Fm, { staff: 'r_navy', cashier: rrShop('Fastenal', 'fastenal', 'What can I find for you?', 'Counter'), front: 5, left: 'r_H', leftText: 'Racks of boxed fasteners.', right: 'r_W3', rightText: 'Safety gear: gloves, glasses and vests.',
  lines: ['Picking up an order for the shop.'], shoppers: 1, depts: [{ n: 'FASTENERS', w: 1, tok: 'r_G3', items: ['Bins of bolts, nuts and washers, sorted by size.', 'Screws and anchors.'], back: 'r_H' }] });
// the old big store split in two: T.J.maxx on one side, Dunham's on the other, a shared entry between
RR_STORES.plaza = Fm => {
  const K = rrK(Fm), vd = Fm.vd, ud = Fm.ud, { W } = K;
  // which half is which: the T.J.maxx sign is on the east end of the building
  const f = Fm.b.face || 'S', tjLeft = f === 'N' || f === 'W';
  for (let v = 0; v < vd - 4; v++) K.wall(ud, v);
  for (let u = ud - 3; u <= ud + 3; u++) K.wall(u, vd - 4);
  for (const s of [-3, 3]) for (let v = vd - 3; v <= vd - 1; v++) if (v !== vd - 2) K.wall(ud + s, v);
  rrMats(K, ud, vd); K.zone(ud - 2, ud + 2, vd - 3, vd, 'ENTRY');
  const halves = [[2, ud - 4], [ud + 4, W - 3]], [tj, dun] = tjLeft ? halves : [halves[1], halves[0]];
  const recompute = () => { for (let u = 0; u < W; u++) { K.top[u] = -1; for (let v = 0; v < K.H; v++) if (K.R[v][u] === '.') { K.top[u] = v; break; } } };
  recompute();
  const yb = vd - 10;
  const tjD = [{ n: 'HOME', w: 10, tok: 'r_G7', items: ['Throw pillows and blankets.', 'Kitchen things and fancy olive oil.', 'Candles and frames.', 'Rugs, rolled up.'], back: 'r_W7', backText: 'Wall art and mirrors.' },
    { n: 'WOMEN', w: 14, st: 'rack', tok: 'r_C', items: ['Tops and sweaters.', 'Dresses.', 'Jeans.', 'Activewear.'], back: 'r_Q' },
    { n: 'SHOES', w: 6, tok: 'r_Bt', items: RR_I.shoes, back: 'r_Bt' },
    { n: 'MEN', w: 10, st: 'rack', tok: 'r_C', items: ['Button-downs and polos.', 'Jackets.', 'Jeans and chinos.'], back: 'r_Q' },
    { n: 'KIDS', w: 8, st: 'rack', tok: 'r_C', items: ['Kids\' clothes.', 'Baby clothes.'], back: 'r_W5', backText: 'Toys on the wall shelves.' }];
  const dunD = [{ n: 'FOOTWEAR', w: 10, tok: 'r_Bt', items: ['Running shoes, by size.', 'Cleats.', 'Hiking boots.'], back: 'r_Bt', backText: 'The shoe wall, one of every style.' },
    { n: 'APPAREL', w: 14, st: 'rack', tok: 'r_C', items: ['Athletic shirts.', 'Team jerseys.', 'Hoodies.', 'Shorts and joggers.'], back: 'r_Q' },
    { n: 'TEAM SPORTS', w: 10, tok: 'r_G8', items: ['Baseball gloves and bats.', 'Footballs and basketballs.', 'Hockey sticks and pucks.', 'Soccer balls and shin guards.'], back: 'r_Bk', backText: 'Bikes, hung in a row.' },
    { n: 'FITNESS', w: 8, st: 'island', tok: 'r_Tm', iw: 1, ih: 2, per: 3, items: ['A treadmill.', 'An exercise bike.', 'A weight bench.'], back: 'r_W3', backText: 'Dumbbells and kettlebells.' },
    { n: 'HUNTING & FISHING', w: 12, tok: ['r_Rod', 'r_G8'], items: ['Fishing rods.', 'Tackle and lures.', 'Blaze orange and camo.', 'Archery gear.'], back: 'r_W8' }];
  rrDepts(K, tjD, tj[0], tj[1], yb, { ua: tj[0] - 2, ub: tj[1] });
  rrDepts(K, dunD, dun[0], dun[1], yb, { ua: dun[0], ub: dun[1] + 2 });
  // T.J.maxx: one line to the registers, through the stanchions, past the impulse racks; the jewelry case by the registers
  const tjIn = tjLeft ? tj[1] : tj[0], dirIn = tjLeft ? -1 : 1, tjR = [tjIn + dirIn * 2, tjIn + dirIn * 12].sort((a, b) => a - b);
  K.clr(tjR[0] - 1, tjR[1] + 1, vd - 9, vd - 1);
  for (let u = tjR[0]; u <= tjR[1]; u++) { K.put(u, vd - 8, (u - tjR[0]) % 3 === 0 ? 'r_k' : 'r_c', 'The registers.'); K.put(u, vd - 9, 'x'); K.put(u, vd - 5, 'r_q'); }
  const tjShop = rrShop('T.J.maxx', 'tj', 'Next guest! Find everything?');
  for (let u = tjR[0] + 1; u <= tjR[1] - 1; u += 4) K.npc('r_blk', u, vd - 9, 'Cashier', tjShop);
  K.put(tjR[0] - 1, vd - 6, 'r_E2', 'The jewelry case: earrings, watches and bracelets.'); K.sign((tjR[0] + tjR[1]) >> 1, vd - 10, 'CHECKOUT');
  { const fu = tjLeft ? tj[0] : tj[1] - 3; for (let k = 0; k < 4; k++) K.put(fu + k, yb - 2, 'r_Fit', 'A fitting room.'); K.sign(fu + 1, yb - 1, 'FITTING ROOMS'); }
  // Dunham's: the registers by the entry
  const dIn = tjLeft ? dun[0] : dun[1], dDir = tjLeft ? 1 : -1, dR = [dIn + dDir * 2, dIn + dDir * 8].sort((a, b) => a - b);
  K.clr(dR[0] - 1, dR[1] + 1, vd - 9, vd - 1);
  rrFrontCounter(K, dR[0], dR[1], vd - 6, 'r_navy', 'Cashier', rrShop("Dunham's", 'dunhams', 'Hey! Find everything you were looking for?'), 'CHECKOUT');
  K.S.zn = K.S.zn.filter(z => z.n !== 'CHECKOUTS');
  const inTJ = x => tjLeft ? x < ud : x > ud;
  K.S.zn.push({ x0: 0, x1: W, y0: yb + 3, y1: vd, n: 'CHECKOUT' });
  Fm.rrSplit = x => inTJ(x) ? 'T.J.maxx' : "DUNHAM'S";
  rrPeople(K, tjD, yb, 4, ['I only came in for a candle.', 'Every time, something different on the racks.', 'Look at this pillow. I don\'t need it. I need it.'], null);
  rrPeople(K, dunD, yb, 4, ['My kid needs cleats by Saturday.', 'Looking at a new rod for the ice season.', 'They have the jerseys!'], 'r_navy');
};

// ---------- placeholder stock ----------
const RR_STOCK = {
  walmart: { 'Groceries': [['rr_bread', 'Loaf of Bread', 300, 'food'], ['rr_milk', 'Gallon of Milk', 350, 'drink'], ['rr_cheddar', 'Block of Cheddar', 450, 'food'], ['rr_chips', 'Bag of Chips', 400, 'food'], ['rr_pop', 'Bottle of Pop', 200, 'drink']],
    'Household': [['rr_towels', 'Paper Towels', 900], ['rr_dish', 'Dish Soap', 300], ['rr_batt', 'Pack of Batteries', 800]],
    'Toys & games': [['rr_ball', 'Rubber Ball', 300], ['rr_puzzle', 'Jigsaw Puzzle', 1000], ['rr_cards', 'Deck of Cards', 300]],
    'Outdoors': [['rr_orange', 'Blaze Orange Hat', 800], ['rr_line', 'Fishing Line', 600], ['rr_flash', 'Flashlight', 1200]], __kind: 'goods' },
  deli: { 'Deli & bakery': [['rr_chicken', 'Fried Chicken, Two Pieces', 500, 'food'], ['rr_sub', 'Deli Sandwich', 600, 'food'], ['rr_cookie', 'Bakery Cookie', 150, 'food'], ['rr_donut', 'Donut', 150, 'food']], __kind: 'food' },
  garden: { 'Garden': [['rr_flowers', 'Flat of Flowers', 1500], ['rr_soil', 'Bag of Potting Soil', 600], ['rr_seeds', 'Packet of Seeds', 250]], __kind: 'goods' },
  pns: { 'Produce': [['rr_apples', 'Bag of Apples', 500, 'food'], ['rr_bananas', 'Bunch of Bananas', 200, 'food'], ['rr_potatoes', 'Bag of Potatoes', 450, 'food']],
    'Dairy': [['rr_milk', 'Gallon of Milk', 350, 'drink'], ['rr_curds', 'Cheese Curds', 500, 'food'], ['rr_yogurt', 'Yogurt', 120, 'food']],
    'Pantry': [['rr_bread', 'Loaf of Bread', 300, 'food'], ['rr_cereal', 'Box of Cereal', 450, 'food'], ['rr_soup', 'Can of Soup', 200, 'food'], ['rr_pop', 'Bottle of Pop', 200, 'drink']], __kind: 'food' },
  fleet: { 'Farm & home': [['rr_feed', 'Bag of Chicken Feed', 1800], ['rr_jars', 'Box of Canning Jars', 1200], ['rr_rope', 'Coil of Rope', 900]],
    'Clothing': [['rr_socks', 'Wool Socks', 1200], ['rr_gloves', 'Work Gloves', 1000], ['rr_flannel', 'Flannel Shirt', 2500], ['rr_orange', 'Blaze Orange Hat', 800]],
    'Fishing': [['rr_lure', 'Fishing Lure', 500], ['rr_bobber', 'Pack of Bobbers', 300]],
    'Candy & snacks': [['rr_candy', 'Bag of Candy', 400, 'food'], ['rr_nuts', 'Mixed Nuts', 600, 'food'], ['rr_popcorn', 'Bag of Popcorn', 300, 'food']], __kind: 'goods' },
  menards: { 'Hardware': [['rr_screws', 'Box of Screws', 600], ['rr_tape', 'Roll of Duct Tape', 700], ['rr_hammer', 'Hammer', 1500], ['rr_measure', 'Tape Measure', 1000]],
    'Paint': [['rr_paint', 'Quart of Paint', 1400], ['rr_brush', 'Paint Brush', 600]],
    'Grocery': [['rr_chips', 'Bag of Chips', 400, 'food'], ['rr_pop', 'Bottle of Pop', 200, 'drink'], ['rr_seed', 'Bag of Bird Seed', 900]], __kind: 'goods' },
  dollar: { 'A little of everything': [['rr_balloon', 'Party Balloons', 125], ['rr_card', 'Greeting Card', 125], ['rr_candy', 'Bag of Candy', 125, 'food'], ['rr_notebook', 'Notebook', 125], ['rr_dish', 'Dish Soap', 125], ['rr_water', 'Bottle of Water', 125, 'drink']], __kind: 'goods' },
  walgreens: { 'Store': [['rr_cough', 'Cough Drops', 300], ['rr_sun', 'Sunscreen', 900], ['rr_water', 'Bottle of Water', 150, 'drink'], ['rr_candybar', 'Candy Bar', 150, 'food'], ['rr_card', 'Greeting Card', 400], ['rr_photo', 'Photo Prints', 300]], __kind: 'goods' },
  auto: { 'Parts & supplies': [['rr_oil', 'Quart of Motor Oil', 800], ['rr_wipers', 'Wiper Blades', 2000], ['rr_fresh', 'Air Freshener', 300], ['rr_washer', 'Washer Fluid', 400], ['rr_gauge', 'Tire Pressure Gauge', 700]], __kind: 'goods' },
  goodwill: { 'Today\'s finds': [['rr_book', 'Used Paperback', 150], ['rr_mug', 'Coffee Mug', 150], ['rr_flannel2', 'Used Flannel Shirt', 500], ['rr_frame', 'Picture Frame', 250], ['rr_game', 'Board Game', 400]], __kind: 'goods' },
  tj: { 'Home & more': [['rr_pillow', 'Throw Pillow', 1500], ['rr_candle', 'Scented Candle', 1000], ['rr_scarf', 'Scarf', 1200], ['rr_shades', 'Sunglasses', 1000], ['rr_frame2', 'Picture Frame', 800]], __kind: 'goods' },
  dunhams: { 'Sporting goods': [['rr_baseball', 'Baseball', 500], ['rr_basketball', 'Basketball', 2000], ['rr_bottle', 'Water Bottle', 1000], ['rr_lure', 'Fishing Lure', 500], ['rr_socks2', 'Athletic Socks', 1000]], __kind: 'goods' },
  cellcom: { 'Accessories': [['rr_case', 'Phone Case', 2500], ['rr_cable', 'Charging Cable', 1500], ['rr_screen', 'Screen Protector', 2000], ['rr_buds', 'Earbuds', 3000]], __kind: 'goods' },
  fastenal: { 'Counter': [['rr_bolts', 'Box of Bolts', 900], ['rr_gloves', 'Work Gloves', 1000], ['rr_safety', 'Safety Glasses', 600], ['rr_zip', 'Bag of Zip Ties', 500]], __kind: 'goods' },
};
RR_STOCK.sentry = RR_STOCK.pns;

// ---------- the hooks ----------
const RR_LINE = { walmart: 'Walmart. The doors slide open on a lot of store: groceries to one side, everything else to the other.',
  menards: 'Menards. Long aisles, tall racks, and the lumber yard out back.', fleet: 'Fleet Farm. Feed and fencing, boots and blaze orange, fishing rods and toy tractors.',
  pns: 'Pick \'n Save. Produce by the door, the deli and bakery close by, and long aisles of groceries.', sentry: 'Sentry. A neighborhood grocery store.',
  plaza: 'A shared entry. T.J.maxx is through one side, Dunham\'s through the other.', goodwill: 'Goodwill. Racks of clothes, shelves of housewares, and something new every day.',
  dtree: 'Dollar Tree. Tight aisles of party supplies, snacks and everything else.', dg: 'Dollar General. Groceries, cleaning supplies, and a wall of coolers.',
  walgreens: 'Walgreens. The pharmacy at the back, beauty up front, and coolers along the wall.', oreilly: 'O\'Reilly Auto Parts. A long parts counter, and the smell of new tires.',
  autovalue: 'Auto Value Auto Parts. A parts counter with shelves of parts behind it.', cellcom: 'Cellcom. Phones on display tables and accessories on the walls.',
  fastenal: 'Fastenal. A counter and racks of fasteners and safety gear.', aldi: 'ALDI. Groceries, plain and simple.' };
for (const id of RR_IDS) { const b = BLD[id - 1] && BLD[id - 1].id === id ? BLD[id - 1] : BLD.find(q => q.id === id), key = rrKey(b); if (!key || ROOM_HOOK[b.name]) continue;
  ROOM_HOOK[b.name] = { kind: 'r_' + key, title: key === 'plaza' ? 'DUNHAM\'S · T.J.maxx' : undefined, line: RR_LINE[key],
    layout: Fm => { const fn = RR_STORES[key]; if (fn) fn(Fm); },
    look: (Fm, x, y, t, n) => rrLook(Fm, x, y, t, n),
    zone: (Fm, x, y) => rrZone(Fm, x, y) }; }

// ---------- looking at things, and where you are ----------
const RR_LOOK = { r_G: 'Shelves of goods, stocked on both sides.', r_W: 'Shelves along the wall.', r_H: 'Tall pallet racks, stocked to the top.', r_F: 'Glass-door coolers, humming.',
  r_M: 'An open cooler case, cold air spilling out.', r_I: 'A freezer case.', r_P: 'A produce stand.', r_E: 'A glass case.', r_K: 'A checkout lane: a belt, a scanner, and a rack of candy and gum.',
  r_S: 'A self-checkout: scan, bag, pay.', r_A: 'Shopping carts, nested in a row.', r_C: 'A round rack of clothes.', r_Q: 'Clothes hanging on a wall rack.', r_T: 'A display table.',
  r_V: 'A wall of TVs, all showing the same nature show.', r_L: 'Boards stacked on a rack.', r_Y: 'A bench of potted plants and flowers.', r_B: 'A pallet of bags, stacked high.',
  r_Ap: 'An appliance on display.', r_Rod: 'Fishing rods, standing in a row.', r_Bk: 'Bikes, lined up.', r_Bt: 'Shoe boxes, stacked by size.', r_SD: 'Swinging doors to the stockroom. Employees only.',
  r_WC: 'The restrooms.', r_Tr: 'Tires on a rack.', r_Mw: 'A mower on display.', r_Fit: 'A fitting room.', r_q: 'Stanchions with a belt between them, for the checkout line.',
  r_c: 'The counter.', r_k: 'The counter, and the register on it.', r_Dt: 'The drive-thru window.', r_Ph: 'A photo kiosk.', r_Bat: 'Car batteries on a rack.',
  r_Tm: 'Fitness equipment on display.', r_LY: 'Big doors out to the lumber yard.', r_Dr: 'Doors, standing on edge.', r_Cb: 'A kitchen cabinet display.', r_eye: 'Eyeglass frames on a wall.' };
const rrBase = t => t.replace(/\d+$/, '');
function rrLook(Fm, x, y, t, n) {
  if (n || !Fm.rr || typeof t !== 'string') return false;
  const b = rrBase(t);
  if (b === 'r_c' || b === 'r_k' || b === 'r_K' || b === 'r_S' || b === 'r_E') {
    let s = null, sd = 9; for (const q of Fm.npcs) { const d = Math.abs(q.x - x) + Math.abs(q.y - y); if (d <= 4 && d < sd && q.talk && !roomNpcGone(q)) { s = q; sd = d; } }
    if (s) { s.talk(Fm, s); return true; } }
  const l = Fm.rr.lk.get(y * Fm.W + x); if (l) { say([['', l]]); return true; }
  if (RR_LOOK[b]) { say([['', RR_LOOK[b]]]); return true; }
  return false;
}
function rrZone(Fm, x, y) {
  const S = Fm.rr; if (!S) return null;
  for (const z of S.zn) if (x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1) return z.n;
  return null;
}
// the room keeps its plan as rows of tokens (some tokens are longer than one letter), and a second door lets you out where it is
{ const _rf = roomFloor; roomFloor = function (b) { const fresh = !FIG_FLOORS['room' + b.id], id = _rf(b);
    if (id && fresh && RR_IDS.has(b.id)) { const Fm = ROOMS[id], fl = FIG_FLOORS[id]; Fm.rows = Fm.R; fl.rows = Fm.R;
      if (Fm.rrSplit) { const both = fl.place; Object.defineProperty(fl, 'place', { get: () => G.inside && G.inside.f === id && G.inside.y < Fm.vd - 4 ? Fm.rrSplit(G.inside.x) : both }); } }
    return id; }; }
function rrWorld(b, u, v) {
  const P = b.poly.map(p => [p[0] * 4, p[1] * 4]), X0 = Math.floor(Math.min(...P.map(p => p[0]))), X1 = Math.ceil(Math.max(...P.map(p => p[0])));
  const Y0 = Math.floor(Math.min(...P.map(p => p[1]))), Y1 = Math.ceil(Math.max(...P.map(p => p[1]))), f = b.face || 'S';
  return f === 'S' ? [X0 + u, Y0 + v] : f === 'N' ? [X1 - 1 - u, Y1 - 1 - v] : f === 'E' ? [X0 + v, Y1 - 1 - u] : [X1 - 1 - v, Y0 + u];
}
{ const _rl = roomLeave; roomLeave = function (Fm) {
    const ex = Fm.rr && G.inside && Fm.rr.exits.find(([u, v]) => u === G.inside.x && v === G.inside.y);
    _rl(Fm);
    if (ex) { const [dx, dy] = FDIR[Fm.b.face || 'S'] || [0, 1]; const [wx, wy] = rrWorld(Fm.b, ex[0], ex[1]); let mx = Math.floor(wx / 4 * CPD), my = Math.floor(wy / 4 * CPD);
      for (let i = 0; i < 8 && solidM(mx, my); i++) { mx += dx; my += dy; } [G.x, G.y] = solidM(mx, my) ? freeNearM(mx, my) : [mx, my]; saveGame(); } }; }

// ---------- drawing ----------
const RR_PAL = [
  ['#c84a3a', '#e8c048', '#3a6ab8', '#4a9a5a', '#e08a3a', '#f0ece0', '#8a3a2a'],   // 0 groceries
  ['#f4f4f0', '#dfe8f0', '#3a7ad8', '#e8e4dc', '#9ac8e8'],                          // 1 paper and household
  ['#e86a9a', '#f0d8e0', '#7a3a7a', '#3aa8c8', '#f4f0f0', '#c8a0d8'],               // 2 health and beauty
  ['#8a8e96', '#e07a20', '#c8c8c8', '#3a5a8a', '#d8b060'],                          // 3 hardware
  ['#a87a4a', '#c8a070', '#8a5a30', '#d8c8a0'],                                     // 4 boxes
  ['#e04040', '#f0d040', '#3a7ad8', '#50b050', '#f08ac0', '#a050d0'],               // 5 toys and party
  ['#2a2c34', '#4a4e56', '#3a7ad8', '#f4f4f8', '#5a5e66'],                          // 6 electronics
  ['#e8e0cc', '#c8a070', '#7aa0c8', '#d88a6a', '#f0ece0', '#8ab070'],               // 7 home
  ['#3a6a3a', '#e07a20', '#2a4a6a', '#c8c040', '#5a4a3a'],                          // 8 outdoors
  ['#2a2c34', '#e0b030', '#c83a2a', '#3a6ab8', '#f4f4f0'],                          // 9 automotive
];
const RR_CL = ['#2a3a6a', '#c84a4a', '#e8e4dc', '#4a6a4a', '#8a6a9a', '#2a2a30', '#d8b080', '#5a8ac8'];
const RR_PR = ['#d83a2a', '#f08a20', '#f0d040', '#5ab040', '#3a8a2a', '#8a3a8a', '#c8a070'];
function rrProp(Fm, t, x, y) {
  const X = x * 24, Y = y * 24, h = hash(x * 5 + Fm.seed, y * 9 + 2), b = rrBase(t), p = +(t.slice(b.length) || 0), pal = RR_PAL[p % 10];
  const same = (dx, dy) => { const q = roomT(Fm, x + dx, y + dy); return typeof q === 'string' && rrBase(q) === b; };
  const sh = () => qp('rgba(0,0,0,.22)', X + 1, Y + 19, 22, 4), trim = RR_TRIM[(Fm.kind || '').slice(2)] || '#3a6ab8';
  const goods = (x0, y0, w, rows, rh, P, seed) => { for (let r = 0; r < rows; r++) { qp('#5a5e66', X + x0, Y + y0 + r * rh + rh - 1, w, 1);
    for (let i = 0; i * 4 < w; i++) { const q = hash(x * 7 + i + seed, y * 5 + r); qp(P[q % P.length], X + x0 + i * 4, Y + y0 + r * rh + 1 + (q >> 4) % 2, 3, rh - 2 - (q >> 4) % 2); } } };
  switch (b) {
    case 'r_G': case 'r_Bt': {   // a gondola run, front to back: goods on both sides; the end nearest you shows its end cap
      const up = same(0, -1), dn = same(0, 1), P = b === 'r_Bt' ? ['#e07a20', '#c8a070', '#f4f4f0', '#2a2c34', '#3a6ab8'] : pal;
      if (!dn) sh();
      qp('#9a9ea6', X + 2, Y - (up ? 0 : 6), 20, dn ? 24 + (up ? 0 : 6) : 14 + (up ? 0 : 6));
      for (let r = 0; r < 3; r++) { const yy = Y - (up ? 0 : 4) + r * 8; if (!dn && yy > Y + 4) break;
        qp(P[hash(x, y * 3 + r) % P.length], X + 3, yy, 8, 6); qp(P[hash(x + 9, y * 3 + r) % P.length], X + 13, yy, 8, 6); }
      qp('#5a5e66', X + 11, Y - (up ? 0 : 6), 2, dn ? 24 + (up ? 0 : 6) : 14);
      if (!dn) { qp('#7a7e86', X + 1, Y + 6, 22, 14); goods(2, 6, 20, 2, 7, P, 3); qp('#4a4e56', X + 1, Y + 19, 22, 1); }
      if (!up) qp(trim, X + 2, Y - 8, 20, 2);
      break; }
    case 'r_W': {   // shelving against a wall, facing out
      sh(); qp('#7a7e86', X, Y - 16, 24, 36); qp('#8a8e96', X, Y - 16, 24, 2); goods(1, -13, 22, 4, 8, pal, p); break; }
    case 'r_H': {   // pallet racking: orange uprights, blue beams, boxes on every level
      sh(); for (const lv of [-26, -10, 6]) { qp('#2a5aa8', X, Y + lv + 12, 24, 2); qp(rrPick(RR_PAL[4], h + lv), X + 2, Y + lv, 9, 12); qp(rrPick(RR_PAL[4], h + lv + 3), X + 12, Y + lv + 2, 10, 10); qp('#8a5a30', X + 5, Y + lv + 4, 3, 2); }
      qp('#e07a20', X, Y - 30, 2, 50); qp('#e07a20', X + 22, Y - 30, 2, 50); break; }
    case 'r_F': {   // a reach-in cooler: glass doors, goods inside, a light along the top
      sh(); qp('#d8dce0', X, Y - 18, 24, 38); qp('#2a3a4a', X + 2, Y - 15, 20, 31); goods(3, -14, 18, 4, 8, p === 0 ? ['#f4f4f8', '#3a7ad8', '#e8d070', '#f4f4f8', '#c83a3a'] : p === 2 ? ['#c83a2a', '#3a8a3a', '#f0d040', '#3a6ab8', '#e8e4dc'] : RR_PAL[5], 7);
      qp('rgba(200,230,250,.35)', X + 2, Y - 15, 20, 31); qp('#f4f8ff', X + 2, Y - 17, 20, 2); qp('#8a8e96', X + (x % 2 ? 3 : 19), Y - 6, 1, 10); qp('#a0a4aa', X + 11, Y - 15, 1, 31); break; }
    case 'r_M': {   // an open case: meat in trays, or salads and cut fruit
      sh(); qp('#3a3e46', X, Y - 14, 24, 34); qp('#f8f4e0', X + 1, Y - 13, 22, 2);
      goods(2, -10, 20, 3, 7, p === 0 ? ['#c83a4a', '#e88a8a', '#a83040', '#f0c0b0'] : ['#5ab040', '#3a8a2a', '#f08a20', '#d83a2a', '#e8e4dc'], 11);
      qp('#c8ccd2', X, Y + 11, 24, 3); qp('#e8ecf0', X, Y + 14, 24, 6); break; }
    case 'r_P': {   // a produce stand: a pile of one thing on each half
      qp('rgba(0,0,0,.2)', X + 1, Y + 18, 22, 4); qp('#7a5434', X + 1, Y + 6, 22, 14); qp('#8a6440', X + 1, Y + 4, 22, 3);
      for (let hf = 0; hf < 2; hf++) { const c = RR_PR[hash(x * 3 + hf, y) % RR_PR.length]; for (let i = 0; i < 6; i++) qp(i % 2 ? shade(c, -0.15) : c, X + 2 + hf * 11 + (i % 3) * 3, Y + (i < 3 ? 1 : -2) + (i % 2), 4, 4); }
      break; }
    case 'r_E': {   // a glass case: the deli, the bakery, the jewelry case
      sh(); qp(p === 2 ? '#2a2a30' : '#e8e4dc', X, Y + 8, 24, 12); qp('#cfe0e8', X + 1, Y - 6, 22, 15); qp('rgba(255,255,255,.4)', X + 2, Y - 5, 20, 1);
      for (let i = 0; i < 4; i++) qp(p === 0 ? ['#e88a8a', '#f0d070', '#c85a4a', '#e8c890'][(i + h) % 4] : p === 1 ? ['#d89a5a', '#f0d8a0', '#c87a4a', '#f4e8d0'][(i + h) % 4] : ['#f0d060', '#e8e8f0', '#c8a0d8', '#60c0e0'][(i + h) % 4], X + 3 + i * 5, Y + 1, 4, p === 2 ? 2 : 4);
      break; }
    case 'r_K': {   // a checkout lane, front to back: the belt, and the register and its lane light at the near end
      const up = same(0, -1), dn = same(0, 1); if (!dn) sh();
      qp('#c8ccd2', X + 3, Y - (up ? 0 : 2), 18, dn ? 24 : 20); qp('#2a2a30', X + 6, Y + (up ? 0 : 2), 12, dn ? 24 : 12);
      if (!up) { qp('#5a5e66', X + 4, Y - 26, 2, 24); qp(trim, X + 1, Y - 32, 9, 7); qp('#f4f4f0', X + 3, Y - 30, 5, 3); }
      if (!dn) { qp('#2a2c34', X + 13, Y + 4, 8, 7); qp('#5ab0e8', X + 14, Y + 5, 6, 3); qp('#8a8e96', X + 3, Y + 14, 18, 6); for (let i = 0; i < 4; i++) qp(RR_PAL[5][(i + x) % 6], X + 4 + i * 4, Y + 15, 3, 4); }
      break; }
    case 'r_S': { sh(); qp('#d8dce0', X + 4, Y + 2, 14, 18); qp('#2a2c34', X + 5, Y - 9, 12, 11); qp('#5ab0e8', X + 6, Y - 8, 10, 7); qp('#8a8e96', X + 17, Y + 3, 6, 14); qp('#f4f4f0', X + 18, Y - 2, 5, 7); qp(trim, X + 4, Y + 2, 14, 2); break; }
    case 'r_A': { qp('rgba(0,0,0,.2)', X + 1, Y + 18, 22, 4); for (let i = 0; i < 3; i++) { qp('#8a8e96', X + 2, Y - 1 + i * 6, 20, 5); qp('#b8bcc4', X + 3, Y + i * 6, 18, 1); qp(trim, X + 2, Y - 2 + i * 6, 20, 1); } qp('#16161a', X + 3, Y + 17, 3, 3); qp('#16161a', X + 18, Y + 17, 3, 3); break; }
    case 'r_C': {   // a round rack: a ring of hanging clothes
      qp('rgba(0,0,0,.22)', X + 2, Y + 18, 20, 4); qp('#8a8e96', X + 11, Y + 6, 2, 13);
      for (let i = 0; i < 5; i++) qp(RR_CL[(h + i) % 8], X + 2 + i * 4, Y - 6, 4, 12); qp('#c8ccd2', X + 2, Y - 7, 20, 1);
      for (let i = 0; i < 4; i++) qp(shade(RR_CL[(h + i + 3) % 8], -0.1), X + 4 + i * 4, Y + 1, 4, 11); break; }
    case 'r_Q': { sh(); qp('#e8e4dc', X, Y - 16, 24, 36); qp('#5a5e66', X, Y - 12, 24, 2); for (let i = 0; i < 6; i++) qp(RR_CL[(h + i) % 8], X + 1 + i * 4, Y - 10, 3, 18); goods(1, 10, 22, 1, 8, RR_CL, 4); break; }
    case 'r_T': {   // a display table: bread, folded clothes, phones
      qp('rgba(0,0,0,.2)', X + 1, Y + 17, 22, 4); qp(p === 1 ? '#e8ecf0' : '#c8a070', X + 1, Y + 3, 22, 11); qp(shade(p === 1 ? '#e8ecf0' : '#c8a070', -0.25), X + 1, Y + 12, 22, 2); qp('#5a3a22', X + 3, Y + 14, 2, 5); qp('#5a3a22', X + 19, Y + 14, 2, 5);
      if (p === 1) for (let i = 0; i < 3; i++) { qp('#2a2c34', X + 3 + i * 7, Y + 2, 5, 8); qp('#5ab0e8', X + 4 + i * 7, Y + 3, 3, 5); }
      else for (let i = 0; i < 3; i++) qp(p === 2 ? ['#d89a5a', '#f0d8a0', '#c87a4a'][(i + h) % 3] : RR_CL[(h + i) % 8], X + 3 + i * 7, Y + 3, 6, 5);
      break; }
    case 'r_V': { qp('#2a2c34', X, Y - 16, 24, 36); for (const oy of [-14, 2]) { qp('#16161a', X + 1, Y + oy, 22, 13); qp(['#3a8a5a', '#3a6ab8', '#c8a040'][((frame >> 6) + x + (oy > 0 ? 1 : 0)) % 3], X + 2, Y + oy + 1, 20, 11); qp('#f4f4f0', X + 8, Y + oy + 4, 5, 3); } break; }
    case 'r_L': { sh(); qp('#5a5e66', X, Y - 12, 2, 32); qp('#5a5e66', X + 22, Y - 12, 2, 32); for (let i = 0; i < 6; i++) { qp(i % 2 ? '#d8b880' : '#c8a870', X + 2, Y - 10 + i * 5, 20, 4); qp('#a88850', X + 2, Y - 7 + i * 5, 20, 1); } break; }
    case 'r_Y': { qp('#6a6e76', X + 1, Y + 9, 22, 4); qp('#4a4e56', X + 3, Y + 13, 2, 6); qp('#4a4e56', X + 19, Y + 13, 2, 6);
      for (let i = 0; i < 3; i++) { qp('#a0502a', X + 2 + i * 7, Y + 3, 6, 6); qp('#3e8a48', X + 1 + i * 7, Y - 4, 8, 8); qp(['#e04a6a', '#f0d040', '#f4f0f0', '#c86ae0'][(h + i) % 4], X + 3 + i * 7, Y - 3, 3, 3); } break; }
    case 'r_B': { qp('rgba(0,0,0,.2)', X + 1, Y + 18, 22, 4); qp('#a87a4a', X + 1, Y + 15, 22, 4);
      const c = p === 0 ? ['#5a3a22', '#3a6a3a'] : p === 1 ? ['#e8e0c8', '#3a7a3a'] : ['#e8ecf0', '#3a6ab8'];
      for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++) { qp(c[0], X + 2 + i * 11, Y - 6 + r * 7, 10, 7); qp(c[1], X + 4 + i * 11, Y - 4 + r * 7, 6, 2); } break; }
    case 'r_Ap': { sh(); if (p === 0) { qp('#e8eaec', X + 3, Y - 18, 18, 38); qp('#c8ccd2', X + 3, Y - 4, 18, 1); qp('#8a8e96', X + 17, Y - 14, 1, 8); qp('#8a8e96', X + 17, Y - 1, 1, 8); }
      else if (p === 1) { qp('#e8eaec', X + 3, Y - 2, 18, 22); qp('#3a4a5a', X + 7, Y + 3, 10, 10); qp('#8ab0d0', X + 9, Y + 5, 6, 6); }
      else { qp('#e8eaec', X + 3, Y - 2, 18, 22); qp('#2a2a30', X + 3, Y - 2, 18, 6); qp('#16161a', X + 7, Y + 6, 10, 8); } break; }
    case 'r_Rod': { qp('rgba(0,0,0,.2)', X + 1, Y + 18, 22, 4); qp('#5a3a22', X + 1, Y + 14, 22, 6); for (let i = 0; i < 7; i++) { qp('#2a2224', X + 2 + i * 3, Y - 26 + (i % 2) * 3, 1, 40); qp('#c8ccd2', X + 1 + i * 3, Y + 2, 3, 2); } break; }
    case 'r_Bk': { sh(); for (const ox of [0, 12]) { qp('#2a2a30', X + ox + 1, Y - 2, 10, 1); qp('#2a2a30', X + ox + 1, Y + 8, 10, 1); qp('#2a2a30', X + ox + 1, Y - 2, 1, 10); qp('#2a2a30', X + ox + 10, Y - 2, 1, 10); qp(RR_PAL[5][(h + ox) % 6], X + ox + 3, Y - 6, 6, 8); } break; }
    case 'r_SD': { qp('#8a8e96', X, Y - 9, 24, 29); qp('#6a6e76', X + 11, Y - 9, 2, 29); qp('#9ac8e8', X + 4, Y - 4, 5, 5); qp('#9ac8e8', X + 15, Y - 4, 5, 5); qp('#4a4e56', X, Y + 17, 24, 3); break; }
    case 'r_WC': { qp('#4a2e1a', X, Y - 9, 24, 33); qp('#5a6a7a', X + 3, Y - 6, 18, 26); qp('#f4f4f0', X + 9, Y - 3, 6, 6); qp('#f4f4f0', X + 11, Y + 3, 2, 6); break; }
    case 'r_Tr': { sh(); for (let i = 0; i < 4; i++) { qp('#1a1a1e', X + 3, Y - 12 + i * 7, 18, 6); qp('#3a3a42', X + 5, Y - 11 + i * 7, 14, 1); } break; }
    case 'r_Mw': { qp('rgba(0,0,0,.25)', X + 1, Y + 17, 22, 4); qp(h % 2 ? '#3a7a3a' : '#c83a2a', X + 3, Y + 2, 18, 12); qp('#f0d040', X + 3, Y + 2, 18, 2); qp('#16161a', X + 8, Y - 4, 8, 6); qp('#16161a', X + 2, Y + 12, 5, 7); qp('#16161a', X + 17, Y + 12, 5, 7); break; }
    case 'r_Fit': { qp('#4a2e1a', X, Y - 9, 24, 33); qp('#c8ccd2', X + 2, Y - 8, 20, 2); qp(RR_CL[(x + y) % 8], X + 3, Y - 6, 18, 26); for (let i = 0; i < 4; i++) qp('rgba(0,0,0,.15)', X + 5 + i * 4, Y - 6, 1, 26); break; }
    case 'r_q': { qp('rgba(0,0,0,.2)', X + 9, Y + 18, 6, 3); qp('#c8ccd2', X + 11, Y + 2, 2, 17); qp('#e8ecf0', X + 10, Y + 1, 4, 2); qp('#16161a', same(-1, 0) ? X : X + 12, Y + 5, same(-1, 0) && same(1, 0) ? 24 : 12, 2); break; }
    case 'r_c': case 'r_k': { sh(); qp(trim, X, Y + 2, 24, 18); qp(shade(trim, -0.25), X, Y + 18, 24, 2); qp('#e8e8e4', X, Y - 2, 24, 5); qp('#ffffff', X, Y - 2, 24, 1);
      if (b === 'r_k') { qp('#2a2c34', X + 6, Y - 10, 12, 9); qp('#5ab0e8', X + 8, Y - 9, 8, 4); qp('#5a5e68', X + 7, Y - 4, 10, 2); } break; }
    case 'r_Dt': { qp('#2a2226', X, Y - 9, 24, 29); qp('#9ab8d0', X + 3, Y - 6, 18, 12); qp('#c8ccd2', X + 6, Y + 7, 12, 4); qp('#e31837', X + 3, Y - 9, 18, 2); break; }
    case 'r_Ph': { sh(); qp('#e8ecf0', X + 3, Y + 2, 18, 18); qp('#2a2c34', X + 5, Y - 8, 14, 11); qp('#f0a040', X + 6, Y - 7, 12, 8); qp('#3a6ab8', X + 9, Y - 5, 5, 4); break; }
    case 'r_Bat': { sh(); qp('#7a7e86', X, Y - 12, 24, 32); for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) { qp('#16161a', X + 1 + i * 8, Y - 10 + r * 10, 7, 8); qp('#c83a2a', X + 2 + i * 8, Y - 11 + r * 10, 2, 1); qp('#e8e8e4', X + 5 + i * 8, Y - 11 + r * 10, 2, 1); } break; }
    case 'r_Tm': { qp('rgba(0,0,0,.25)', X + 2, Y + 17, 20, 4); qp('#3a3a42', X + 4, Y + 4, 16, 15); qp('#16161a', X + 6, Y + 5, 12, 13); if (!same(0, -1)) { qp('#5a5e66', X + 5, Y - 12, 2, 16); qp('#5a5e66', X + 17, Y - 12, 2, 16); qp('#2a2c34', X + 6, Y - 14, 12, 5); qp('#5ab0e8', X + 8, Y - 13, 8, 2); } break; }
    case 'r_LY': { qp('#c8ccd2', X, Y - 12, 24, 32); for (let i = 0; i < 8; i++) qp('#a8acb2', X, Y - 11 + i * 4, 24, 1); qp('#f0d040', X, Y + 16, 24, 4); for (let i = 0; i < 6; i++) qp('#16161a', X + i * 4, Y + 16, 2, 4); break; }
    case 'r_Dr': { sh(); qp('#f0ece0', X + 2, Y - 18, 9, 36); qp('#c8a070', X + 13, Y - 18, 9, 36); qp('#d8d4c8', X + 4, Y - 14, 5, 12); qp('#a88050', X + 15, Y - 14, 5, 12); qp('#c8a050', X + 9, Y, 1, 2); qp('#8a8e96', X + 20, Y, 1, 2); break; }
    case 'r_Cb': { sh(); qp('#8a5a30', X, Y - 14, 24, 10); qp('#8a5a30', X, Y + 2, 24, 18); qp('#d8d4cc', X, Y - 1, 24, 4); qp('#6a4428', X + 11, Y + 3, 2, 16); qp('#6a4428', X + 11, Y - 13, 2, 8); qp('#c8a050', X + 8, Y + 8, 1, 3); qp('#c8a050', X + 15, Y + 8, 1, 3); break; }
    case 'r_eye': { sh(); qp('#e8e4dc', X, Y - 14, 24, 34); for (let r = 0; r < 4; r++) for (let i = 0; i < 2; i++) { const c = ['#2a2224', '#8a5a30', '#c83a3a', '#3a6ab8'][(r + i + x) % 4]; qp(c, X + 2 + i * 11, Y - 11 + r * 7, 4, 3); qp(c, X + 7 + i * 11, Y - 11 + r * 7, 4, 3); qp(c, X + 6 + i * 11, Y - 10 + r * 7, 1, 1); } break; }
  }
}
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) { if (typeof t === 'string' && t.length > 2 && t[0] === 'r' && t[1] === '_') return rrProp(Fm, t, x, y); return _rp(Fm, t, x, y); }; }
{ const _ft = roomFloorTile; roomFloorTile = function (Fm, t, x, y) {
    const S = Fm.rr; let z = null; if (S && S.fz.length) for (const r of S.fz) if (x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1) { z = r; break; }
    if (z) { const X = x * 24, Y = y * 24, hh = hash(x * 11, y * 7); qp('#a8a8a4', X, Y, 24, 24); if (hh % 3 === 0) qp('#9a9a96', X + hh % 18, Y + (hh >> 4) % 18, 5, 3); qp('#989894', X, Y + 23, 24, 1); }
    else _ft(Fm, t, x, y);
    if (t === 'r_m') { const X = x * 24, Y = y * 24; qp('#3a3a40', X, Y, 24, 24); qp('#4a4a52', X + 1, Y + 1, 22, 22); for (let i = 3; i < 24; i += 4) qp('#34343a', X + 1, Y + i, 22, 1); }
  }; }
// the department signs, hanging over the aisles (drawn last, over everything, only the ones on screen)
{ const _paint = roomPaint; roomPaint = function (Fm, ox, oy, kx, ky) {
    _paint(Fm, ox, oy, kx, ky);
    const S = Fm.rr; if (!S || !S.sg.length) return;
    const trim = RR_TRIM[(Fm.kind || '').slice(2)] || '#3a6ab8'; ctx.font = SMALL;
    for (const s of S.sg) { const sx = QX + s.x * 24 + 12, sy = QY + s.y * 24 - 30; if (sx < -120 || sx > SW + 120 || sy < -20 || sy > SH + 10) continue;
      const w = Math.ceil(ctx.measureText(s.t).width) + 10, x0 = Math.round(sx - w / 2);
      F('#4a4e56', x0 + 3, sy - 10, 1, 10); F('#4a4e56', x0 + w - 4, sy - 10, 1, 10);
      F('#1a1c22', x0 - 1, sy - 1, w + 2, 14); F(trim, x0, sy, w, 12); F(shade(trim, 0.2), x0, sy, w, 1);
      txt(s.t, sx, sy + 2, trim === '#f2c500' ? '#1a1a1a' : '#ffffff', 'center', SMALL); }
  }; }
