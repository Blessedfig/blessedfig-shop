"use strict";
// =====================================================================
//  INSIDE THE FAST FOOD PLACES AND THE GAS STATION STORES (Nov 20, Christian: "make indoor buildings the same size for all
//  the fast food and chain places ... All of them. And populate them as they would be set up"). Each one opens through the
//  room system (rooms.js): the inside is the building's own traced outline at 1 m a tile, door at the bottom, and the layout
//  below is fitted to whatever width and depth that outline gives. The setups follow how these chains generally lay out a
//  store: a front counter with menu boards over it, the kitchen line behind it (staff only), a drink and condiment station,
//  booths and tables, restrooms, the drive-thru window on the side the lane runs; a gas station's checkout by the door with
//  the cigarette and lottery wall behind it, the coffee and fountain bar, hot food, cooler doors along the back, snack and
//  grocery aisles. Nothing here is a real floor plan of these exact stores. Staff and customers are generic stand-ins; menu
//  items are generic names and every price is a placeholder. Tile tokens added here all start with 'f_'.
// =====================================================================
const FOOD_NOTE = 'Generic stand-in items. Prices are placeholders, not this place\'s real prices.';
// ---------- the places: which building, what kind of store, its colors ----------
// find: picks the building from BLD (names as on the signs; two stores are unnamed outlines beside their sign and canopy)
const FOOD_PLACES = [
  { key: 'mcd', type: 'ff', find: b => b.name === "McDonald's" && b.addr === '2115 NEVA RD', cook: 'burger', kiosks: 3, dt: 1, c1: '#da291c', c2: '#ffc72c', seat: '#c8a040',
    line: 'McDonald\'s. Ordering kiosks, the front counter under the menu boards, and the fryers beeping away in back.' },
  { key: 'culvers', type: 'ff', find: b => b.name === "Culver's", cook: 'burger', custard: 1, dt: 1, c1: '#0f4d92', c2: '#ffffff', seat: '#2a5a9a',
    line: 'Culver\'s. Order at the counter, take your number, and they bring it out to the table. The custard machine is churning.' },
  { key: 'bk', type: 'ff', find: b => b.name === 'Burger King', cook: 'broil', dt: 1, c1: '#d62300', c2: '#f5ebdc', seat: '#8a4a2a',
    line: 'Burger King. It smells like the flame broiler.' },
  { key: 'arbys', type: 'ff', find: b => b.name === "Arby's", cook: 'roast', dt: 1, c1: '#d71920', c2: '#f4e8d0', seat: '#6a3a22',
    line: 'Arby\'s. Roast beef ovens and a slicer behind the counter.' },
  { key: 'kfctb', type: 'ff', find: b => b.name === 'KFC / Taco Bell', cook: 'chicken', dt: 1, c1: '#a3080c', c2: '#6a2a8a', seat: '#7a3a8a',
    line: 'KFC and Taco Bell under one roof: fried chicken on one side of the menu board, tacos on the other.' },
  { key: 'tj', type: 'ff', find: b => b.name === "Taco John's", cook: 'taco', dt: 1, c1: '#4b2580', c2: '#ffc72c', seat: '#5a3a8a',
    line: 'Taco John\'s. A steam table of fillings, and the fryer going for the potato rounds.' },
  { key: 'dq', type: 'ff', find: b => b.name === 'Dairy Queen', cook: 'burger', dq: 1, dt: 1, c1: '#ee3124', c2: '#1f4fa0', seat: '#c8323a',
    line: 'Dairy Queen. The grill on one side, the soft-serve machines humming on the other.' },
  { key: 'ph', type: 'pizza', find: b => b.name === 'Pizza Hut', cook: 'pizza', c1: '#c8102e', c2: '#2a2a2e', seat: '#8a2a2a',
    line: 'Pizza Hut. A carry-out counter, and behind it the make line and the pizza ovens.' },
  { key: 'lc', type: 'pizza', find: b => b.name === 'Little Caesars', cook: 'pizza', hnr: 1, c1: '#f47b20', c2: '#1a1a1a', seat: '#c86a20',
    line: 'Little Caesars. Pizzas in the warmer, ready to go, and the ovens going behind them.' },
  { key: 'subway', type: 'sub', find: b => b.name === 'Subway' && b.addr === '465 HWY 64', cook: 'sub', c1: '#008938', c2: '#ffc600', seat: '#2a6a3a',
    line: 'Subway. Bread in the oven, the sandwich line behind the glass, and chips by the register.' },
  // gas stations and their stores
  { key: 'kwik', type: 'gas', kt: 1, find: b => b.name === 'Kwik Trip' && b.type === 'store' && b.addr === '455 HWY 64' && (b.pxMax - b.pxMin) * (b.pyMax - b.pyMin) * 16 > 400,
    title: 'KWIK TRIP', c1: '#c8202a', c2: '#f2c81a', line: 'Kwik Trip. The bakery case of donuts, the hot food case, the coffee bar, and a wall of coolers in back with the milk and eggs.' },
  { key: 'bp1', type: 'gas', find: b => !b.name && b.type === 'store' && b.addr === '2120 NEVA RD', title: 'BP', c1: '#0a7a3a', c2: '#ffe600', line: 'The BP station store. Coffee, coolers, snacks, and the counter by the door.' },
  { key: 'bp2', type: 'gas', find: b => b.name === 'BP' && b.type === 'store', title: 'BP', c1: '#0a7a3a', c2: '#ffe600', line: 'The BP station store out on Highway 45. Coffee, coolers, snacks, and the counter by the door.' },
  { key: 'shell1', type: 'gas', find: b => b.name === 'Shell' && b.type === 'store' && b.addr === '709 S SUPERIOR ST', title: 'SHELL', c1: '#d81e05', c2: '#f5c400', line: 'The Shell station store. Coffee, a roller grill, coolers along the back.' },
  { key: 'shell2', type: 'gas', find: b => b.name === 'Shell' && b.type === 'store' && b.addr === '738 SUPERIOR ST', title: 'SHELL', c1: '#d81e05', c2: '#f5c400', line: 'The Shell station store. Coffee, a roller grill, coolers along the back.' },
  { key: 'vpf', type: 'gas', find: b => b.name === 'VP Fuels' && b.type === 'store', title: 'VP FUELS', c1: '#1e4fb0', c2: '#ffffff', line: 'The VP Fuels store. Coffee, snacks, and cold drinks in the coolers.' },
  { key: 'vpr', type: 'gas', find: b => !b.name && b.type === 'store' && b.addr === '107 SUPERIOR ST', title: 'VP RACING FUELS', c1: '#c8202a', c2: '#1a1a1a', line: 'The VP Racing Fuels store. Coffee, snacks, and cold drinks in the coolers.' },
  { key: 'gng', type: 'gas', find: b => b.name === 'Gas-n-Go' && b.type === 'store', title: 'GAS-N-GO', c1: '#1f8a3a', c2: '#ffffff', line: 'Gas-N-Go. A counter by the door, coffee, snacks and coolers.' },
  { key: 'krist', type: 'gas', find: b => b.name === 'Krist' && b.type === 'store', title: 'KRIST', c1: '#1e4fb0', c2: '#e8e8e8', line: 'The Krist station store. Coffee, hot food, snacks, coolers along the back.' },
  { key: 'fast', type: 'gas', find: b => b.name === 'Fast Stop' && b.type === 'store', title: 'FAST STOP', c1: '#c8202a', c2: '#ffffff', line: 'Fast Stop. Coffee, snacks, coolers, and the counter by the door.' },
  { key: 'ffgas', type: 'gas', find: b => b.name === 'Fleet Farm Gas' && b.type === 'store', title: 'FLEET FARM GAS', c1: '#d2492a', c2: '#ffffff', line: 'The Fleet Farm gas station store. Coffee, jerky, snacks and coolers.' },
];
const FOOD_BY_ID = new Map();
for (const p of FOOD_PLACES) { const b = BLD.find(b => b.poly && p.find(b)); if (b) { p.b = b; FOOD_BY_ID.set(b.id, p); } }
// ---------- what each place sells: generic item names, placeholder prices (cents) ----------
{ const m = (k, sec, items) => { MENUS['f_' + k] = Object.assign(MENUS['f_' + k] || {}, { [sec]: items.map(([n, c], i) => ['f' + k + '_' + i + '_' + sec.length, n, c]) }); };
  m('mcd', 'Menu', [['Cheeseburger', 300], ['Double cheeseburger', 450], ['Chicken nuggets, 10 piece', 600], ['Fries, medium', 400], ['Soft drink, medium', 250], ['Coffee', 200], ['Soft-serve cone', 200]]);
  m('culvers', 'Menu', [['Cheeseburger on a buttered bun', 550], ['Cheese curds', 500], ['Fries, regular', 350], ['Fish sandwich', 650], ['Root beer', 300]]);
  m('culvers', 'Frozen custard', [['Frozen custard, single scoop', 400], ['Custard sundae', 550], ['Flavor of the day, a cup', 400]]);
  m('bk', 'Menu', [['Flame-grilled burger', 650], ['Double cheeseburger', 450], ['Chicken sandwich', 600], ['Onion rings', 400], ['Fries, medium', 400], ['Soft drink, medium', 250]]);
  m('arbys', 'Menu', [['Roast beef sandwich', 600], ['Beef and cheddar sandwich', 650], ['Turkey sandwich', 650], ['Curly fries', 400], ['Potato cakes', 300], ['Shake', 450]]);
  m('kfctb', 'Chicken', [['Fried chicken, 2 piece', 700], ['Chicken sandwich', 650], ['Mashed potatoes and gravy', 350], ['Biscuit', 150]]);
  m('kfctb', 'Tacos', [['Crunchy taco', 200], ['Bean burrito', 250], ['Nachos', 350], ['Soft drink', 250]]);
  m('tj', 'Menu', [['Crunchy taco', 200], ['Soft-shell taco', 250], ['Burrito', 450], ['Seasoned potato rounds', 350], ['Nachos', 400], ['Soft drink', 250]]);
  m('dq', 'Grill', [['Cheeseburger', 550], ['Chicken strip basket', 900], ['Hot dog', 350], ['Fries', 350]]);
  m('dq', 'Treats', [['Soft-serve cone', 300], ['Dipped cone', 350], ['Blended ice cream treat', 550], ['Sundae', 450]]);
  m('ph', 'Menu', [['Medium pizza, one topping', 1200], ['Large pizza, one topping', 1500], ['Pan pizza', 1400], ['Breadsticks', 600], ['Wings, 8 piece', 1100], ['Two-liter soft drink', 350]]);
  m('lc', 'Menu', [['Large pepperoni pizza', 900], ['Large cheese pizza', 850], ['Deep dish pizza', 1100], ['Breadsticks', 400], ['Wings, 8 piece', 800], ['Two-liter soft drink', 350]]);
  m('subway', 'Menu', [['6-inch sub', 650], ['Footlong sub', 1000], ['Toasted footlong', 1050], ['Cookie', 100], ['Chips', 150], ['Fountain drink', 250]]);
  m('kwik', 'Store', [['Glazed donut', 150], ['Bananas, a bunch', 200], ['Gallon of milk', 400], ['Dozen eggs', 350], ['Coffee, 16 oz', 150], ['Slice of pizza', 300], ['Fountain drink', 150], ['Bag of ice', 250]]);
  const gas = [['Bag of chips', 300], ['Candy bar', 200], ['Bottle of water', 200], ['Soft drink, 20 oz', 250], ['Coffee, 16 oz', 200], ['Hot dog off the roller', 250], ['Bag of ice', 300]];
  for (const k of ['bp1', 'bp2', 'shell1', 'shell2', 'vpf', 'vpr', 'gng', 'krist', 'fast']) m(k, 'Store', gas);
  m('ffgas', 'Store', gas.concat([['Beef jerky', 700]])); }
// ---------- the people: crew in each brand's color, and a few customers ----------
{ const skins = [['#e2b48e', '#5a3a24'], ['#c99878', '#1e1612'], ['#ecc19c', '#c8a060'], ['#d9a77c', '#2a1e18']];
  for (const p of FOOD_PLACES) for (let i = 0; i < 2; i++) { const [skin, hair] = skins[(i * 2 + p.key.length) % 4];
    FOLKS['f_' + p.key + i] = { skin, hair, shirt: p.type === 'gas' || i ? p.c1 : '#2a2a30', shirt2: p.type === 'gas' || i ? shade(p.c1, -0.18) : '#3a3a42', pants: '#26262c', shoes: '#141416', fcap: p.type === 'gas' ? null : (i ? '#2a2a30' : p.c1), apron: p.type === 'pizza' || p.type === 'sub' ? '#2a2a30' : null }; }
  Object.assign(FOLKS, {
    f_cust0: { skin: '#e2b48e', hair: '#6a4a2a', shirt: '#4a7a5a', shirt2: '#3a6a4a', pants: '#3a4a6a', shoes: '#2a2224' },
    f_cust1: { skin: '#ecc19c', hair: '#3a2a20', shirt: '#d86a2a', shirt2: '#c85a1a', pants: '#5a5040', shoes: '#5a3a24', fcap: '#d86a2a' },
    f_cust2: { skin: '#c99878', hair: '#141214', shirt: '#7a3a5a', shirt2: '#6a2a4a', pants: '#2a3a5a', shoes: '#e8e8ea' },
    f_cust3: { skin: '#d9a77c', hair: '#c8c4bc', shirt: '#6a8ab0', shirt2: '#5a7aa0', pants: '#4a4a52', shoes: '#2a2224' },
  });
  const _df = drawFolk; drawFolk = function (who, cx, by, t) {   // a crew cap or a blaze-orange hunting cap
    _df(who, cx, by, t); const S = FOLKS[who]; if (!S || !S.fcap) return; const bob = (t >> 5) % 2, R = (c, x, y, w, h) => F(c, Math.round(cx + x), Math.round(by + y), w, h);
    R('#1a1418', -9, -41 + bob, 18, 6); R(S.fcap, -8, -40 + bob, 16, 5); R('#1a1418', -9, -36 + bob, 18, 2); R(shade(S.fcap, -0.3), -8, -36 + bob, 16, 1); }; }
// ---------- hooking into the room system ----------
for (const p of FOOD_PLACES) if (p.b) Object.assign(ROOM_STYLE, { ['f_' + p.key]: p.type === 'gas' ? [['lino', '#e6e4de', '#d4d2cc'], ['#eeede6', p.c1]]
  : [['tile', ...({ mcd: ['#d8d2c6', '#c4bdb0'], culvers: ['#d4cdc0', '#bfb7a8'], bk: ['#c8b8a0', '#b4a48c'], arbys: ['#b08a62', '#9a7652'], kfctb: ['#d6d0c8', '#c2bbb2'], tj: ['#d8c8a8', '#c4b494'], dq: ['#ece8e0', '#d4cfc6'], ph: ['#c8c0b4', '#b4aca0'], lc: ['#ddd6c8', '#c9c2b4'], subway: ['#d0c8b8', '#bcb4a4'] }[p.key])], ['#ece6da', p.c1]] });
for (const p of FOOD_PLACES) KIND_ZONE['f_' + p.key] = p.type === 'gas' ? 'STORE' : p.type === 'pizza' ? 'LOBBY' : 'DINING ROOM';
ROOM_WALK.add('f_mat');
{ const _re = roomEligible; roomEligible = function (b) { return (!!b && FOOD_BY_ID.has(b.id)) || _re(b); }; }
{ const _rh = roomHook; roomHook = function (b) { const p = b && FOOD_BY_ID.get(b.id); return p ? FOOD_HOOK(p) : _rh(b); }; }
// a room's rows as strings, one character a tile, for the code that reads them that way (a multi-letter token reads as '#')
{ const _rf = roomFloor; roomFloor = function (b) { const id = _rf(b); const Fm = id && ROOMS[id];
    if (Fm && Fm.R.some(r => r.some(t => t.length > 1))) { Fm.rows = Fm.R.map(r => r.map(t => t.length > 1 ? '#' : t).join('')); FIG_FLOORS[id].rows = Fm.rows; }
    return id; }; }
for (const p of FOOD_PLACES) if (p.b && p.b.name) p.b.enter = p.b.enter || 1;
ROOM_DOOR = null;   // the door list is rebuilt with these doors in it
const FOOD_HOOKS = {};
function FOOD_HOOK(p) {
  if (FOOD_HOOKS[p.key]) return FOOD_HOOKS[p.key];
  return FOOD_HOOKS[p.key] = { kind: 'f_' + p.key, title: p.title || p.b.name.toUpperCase(), line: p.line,
    layout: (F, c) => { F.fp = p; F.fFood = 1; (p.type === 'gas' ? foodGasLayout : foodFFLayout)(F, c, p); },
    zone: (F, x, y) => F.fKitchen && F.fKitchen(x, y) ? 'KITCHEN' : null,
    look: (F, x, y, t, n) => foodLook(F, x, y, n) };
}
// which side of the building the drive-thru lane runs along: the side with pavement right against the wall
function foodDtSide(b) {
  const f = b.face || 'S', x0 = Math.floor(b.pxMin), x1 = Math.floor(b.pxMax), y0 = Math.floor(b.pyMin), y1 = Math.floor(b.pyMax);
  const paved = t => t === TL.ROAD || t === TL.MAJOR || t === TL.PARKING || t === TL.PAVED || t === TL.PATH;
  const score = s => { let n = 0, k = 0;
    if (s === 'W' || s === 'E') { for (const x of s === 'W' ? [x0 - 1, x0 - 2] : [x1 + 1, x1 + 2]) for (let y = y0; y <= y1; y++) { k++; if (paved(tAt(x, y))) n++; } }
    else for (const y of s === 'N' ? [y0 - 1, y0 - 2] : [y1 + 1, y1 + 2]) for (let x = x0; x <= x1; x++) { k++; if (paved(tAt(x, y))) n++; }
    return n / Math.max(1, k); };
  const L = { S: 'W', N: 'E', E: 'S', W: 'N' }[f], Rt = { S: 'E', N: 'W', E: 'N', W: 'S' }[f];
  return score(L) > score(Rt) ? -1 : 1;   // -1: the left of the plan, +1: the right
}
function foodTools(F, c) {
  const R = F.R, keep = new Set();
  const fl = (u, v) => !!R[v] && R[v][u] === '.' && !keep.has(u + ',' + v);
  const set = (u, v, t) => { if (!fl(u, v)) return false; R[v][u] = t; return true; };
  return { R, keep, fl, set, protect: (u, v) => keep.add(u + ',' + v) };
}
// ---------- fast food, pizza and subs ----------
const FOOD_LINES = {
  burger: ['f_fr', 'f_fr', 'f_fr', 'x', 'f_gr', 'f_gr', 'f_prep', 'f_prep', 'f_hold', 'f_hold'],
  broil: ['f_fr', 'f_fr', 'x', 'f_bro', 'f_bro', 'f_prep', 'f_prep', 'f_hold', 'f_hold'],
  roast: ['f_ov', 'f_ov', 'f_sl', 'x', 'f_fr', 'f_fr', 'f_prep', 'f_prep', 'f_hold'],
  chicken: ['f_pfr', 'f_pfr', 'f_brd', 'f_brd', 'f_hold', 'x', 'f_stm', 'f_stm', 'f_prep', 'f_fr'],
  taco: ['f_fr', 'f_fr', 'x', 'f_stm', 'f_stm', 'f_stm', 'f_prep', 'f_prep'],
  pizza: ['f_dm', 'x', 'f_mk', 'f_mk', 'f_mk', 'f_pov', 'f_pov', 'f_prep', 'f_prep'],
  sub: ['f_rack', 'f_prep', 'f_prep', 'x', 'f_rack'],
};
function foodFFLayout(F, c, p) {
  const { fx0, fx1, fy0, fy1, xs } = c, T = foodTools(F, c), { R, fl, set, protect } = T;
  const w = fx1 - fx0 + 1, d = fy1 - fy0 + 1, carry = p.type === 'pizza', sub = p.type === 'sub';
  const dt = p.dt ? foodDtSide(F.b) : 0, dts = dt || (xs > (fx0 + fx1) / 2 ? -1 : 1);
  let kd = Math.max(3, Math.min(carry ? 11 : 9, Math.round(d * (carry ? 0.6 : sub ? 0.36 : 0.45))));
  if (d - kd < (carry ? 4 : 6)) kd = Math.max(3, d - (carry ? 4 : 6));
  const cv = fy0 + kd;
  // a long, shallow building: the kitchen takes the drive-thru end, the dining room the other end at full depth
  let kx0 = fx0, kx1 = fx1, wallCol = null;
  if (!carry && w >= 2 * d && w >= 20) { const kw = Math.round(w * 0.55); if (dts > 0) { kx0 = fx1 - kw + 1; wallCol = kx0; kx0++; } else { kx1 = fx0 + kw - 1; wallCol = kx1; kx1--; } }
  for (let v = fy0; v < cv; v++) for (let u = kx0; u <= kx1; u++) if (R[v][u] === '.') R[v][u] = 'x';
  if (wallCol != null) for (let v = fy0; v <= cv; v++) if (R[v][wallCol] === '.') R[v][wallCol] = 'W';
  F.fKitchen = (x, y) => y < cv && x >= kx0 && x <= kx1; F.fcv = cv;
  // the counter, centred on the way in from the door; walls either side of it close off the kitchen
  const kw = kx1 - kx0 + 1, L = Math.max(4, Math.min(sub ? 9 : 10, Math.round(kw * (sub ? 0.55 : 0.42))));
  let s0 = Math.round(xs - L / 2); s0 = Math.max(kx0 + 1, Math.min(kx1 - L, s0)); if (wallCol != null) s0 = dts > 0 ? kx0 + 1 : kx1 - L;
  const s1 = s0 + L - 1, regs = sub ? [s1 === xs ? s1 - 1 : s1] : L >= 7 ? [s0 + 1, s1 - 1] : [s0 + 1];
  F.menuAt = new Set();
  for (let u = kx0; u <= kx1; u++) { if (R[cv][u] !== '.') continue;
    if (u >= s0 && u <= s1) { R[cv][u] = regs.includes(u) ? 'f_reg' : sub ? 'f_sg' : 'f_ctr'; }
    else { R[cv][u] = 'W'; if (Math.abs(u - s0) <= 3 || Math.abs(u - s1) <= 3) F.menuAt.add(u + ',' + cv); } }
  F.fMenuRow = sub ? null : cv; F.fCounter = [s0, s1, cv];
  // the kitchen: back-of-house along the back wall, the cooking line facing the counter, an aisle for the cooks, the staff row
  const eRows = []; for (let v = fy0; v <= cv - 3; v++) eRows.push(v);
  const lineRow = eRows.length ? eRows[eRows.length - 1] : null, backRow = eRows.length >= 2 ? fy0 : null;
  const kset = (u, v, t) => { if (R[v] && R[v][u] === 'x') { R[v][u] = t; return true; } return false; };
  const dtEdge = dts > 0 ? kx1 : kx0, farEdge = dts > 0 ? kx0 : kx1, step = -dts;   // walking away from the drive-thru side
  if (backRow != null) { const seq = ['f_wic', 'f_wic', 'x', 'f_dish', 'f_dish', 'x', 'f_rack', 'f_rack', 'x'];
    for (let i = 0, u = farEdge; u >= kx0 && u <= kx1; i++, u += -step) { const t = i < 6 ? seq[i] : ((i - 6) % 4 === 3 ? 'x' : 'f_rack'); if (t !== 'x') kset(u, backRow, t); } }
  if (lineRow != null) { const seq = FOOD_LINES[p.cook] || FOOD_LINES.burger, mid = (s0 + s1) >> 1, a = Math.max(kx0, Math.min(kx1 - seq.length + 1, mid - (seq.length >> 1)));
    const lseq = dts > 0 ? seq.slice().reverse() : seq;   // the fryers sit toward the drive-thru window
    for (let u = kx0; u <= kx1; u++) { const i = u - a; const t = i >= 0 && i < lseq.length ? lseq[i] : ((u - kx0) % 5 === 2 ? 'f_prep' : (u - kx0) % 5 === 4 ? 'f_rack' : 'x'); if (t !== 'x') kset(u, lineRow, t); }
    if (backRow == null) kset(farEdge, lineRow, 'f_wic'); }
  for (let v = fy0 + 2; v < cv - 3; v += 3) for (let u = kx0 + 2, i = 0; u <= kx1 - 2; u += 6, i++) { const t = (i + v) % 3 === 2 ? 'f_rack' : 'f_prep'; kset(u, v, t); kset(u + 1, v, t); }
  // the staff row behind the counter: drinks, and the ice cream machines where there are some
  const sr = cv - 1, extra = [];
  if (!sub) extra.push(['f_bev', dts > 0 ? s1 + 1 : s0 - 1], ['f_bev', dts > 0 ? s1 : s0]);
  if (p.dq) extra.push(['f_ss', dts > 0 ? s0 : s1], ['f_bz', dts > 0 ? s0 - 1 : s1 + 1], ['f_ss', dts > 0 ? s0 - 2 : s1 + 2]);
  if (p.custard) extra.push(['f_cus', dts > 0 ? s0 : s1], ['f_cusd', dts > 0 ? s0 - 1 : s1 + 1], ['f_cusd', dts > 0 ? s0 - 2 : s1 + 2]);
  if (p.hnr) extra.push(['f_hnr', s0 + 2], ['f_hnr', s0 + 3]);
  if (sub) extra.push(['f_bo', s0 - 1 >= kx0 ? s0 - 1 : s0], ['f_to', s1 - 2], ['f_to', s1 - 3]);
  for (const [t, u] of extra) if (!regs.includes(u)) kset(u, sr, t);
  // the drive-thru window: on the side wall the lane runs past, with its register and headset
  const npc = (x, y, folk, name, talk) => { if (!R[y] || (R[y][x] !== 'x' && R[y][x] !== '.') || F.npcs.some(n => n.x === x && n.y === y)) return false; if (R[y][x] === '.') R[y][x] = 'N'; F.npcs.push({ x, y, folk, name, talk }); return true; };
  const crew = 'f_' + p.key + '0', crew2 = 'f_' + p.key + '1', place = p.title ? p.title.replace(/\b\w+/g, s => s[0] + s.slice(1).toLowerCase()) : p.b.name;
  const menu = () => menuOpen(place, MENUS['f_' + p.key], FOOD_NOTE);
  F.fOrder = () => ask(sub ? 'Sandwich artist: Hi! What kind of bread today?' : carry ? 'Counter: Hi! Picking up, or ordering?' : 'Cashier: Welcome to ' + place + '! What can I get for you?', [{ t: 'See the menu', f: menu }, { t: 'Just looking' }]);
  let wv = -1, wu = -1;
  if (p.dt) for (let v = cv - 2; v >= fy0 && wv < 0; v--) for (let u = dt > 0 ? kx1 : kx0; u >= kx0 && u <= kx1; u -= dt) { const t = R[v][u];
    if (t === 'x' || /^f_/.test(t)) { if (R[v][u + dt] === 'W' && R[v][u - dt] === 'x' && !F.npcs.some(n => n.y === v)) { wv = v; wu = u; } break; } }
  if (wv >= 0) { {
      R[wv][wu] = 'f_dt'; F.fDt = [wu, wv]; npc(wu - dt, wv, crew2, 'Drive-thru', () => say([['Drive-thru', '(into the headset) Welcome! Order when you\'re ready.'], ['Drive-thru', 'Sorry, one second, I\'ve got a car at the window.']])); } }
  for (const u of regs) npc(u, sr, crew, sub ? 'Sandwich artist' : 'Cashier', () => F.fOrder());
  if (lineRow != null) { const cu = Math.max(kx0, Math.min(kx1, ((s0 + s1) >> 1) + 1)); npc(cu, cv - 2, crew2, 'Cook', () => say([['Cook', ['Order up!', 'Two more on the grill.', 'Behind you! Hot tray.'][(cu + cv) % 3]]])); }
  // the dining room (or the pick-up lobby)
  for (let u = s0 - 1; u <= s1 + 1; u++) for (let v = cv + 1; v <= cv + 2; v++) protect(u, v);
  const fr = F.ey;   // the row just inside the door (the outline's bottom row, unless the door is in a wing)
  for (let v = cv + 1; v <= fy1; v++) protect(xs, v);
  for (let u = fx0; u <= fx1; u++) { protect(u, fy1); protect(u, fr); }
  // restrooms: two doors in a wall that faces the dining room, away from the counter
  { const cand = [];
    for (let v = fy0 - 1; v <= cv; v++) for (let u = fx0; u <= fx1; u++) if (R[v] && R[v][u] === 'W' && R[v + 1] && R[v + 1][u] === '.' && R[v][u - 1] === 'W' && R[v][u + 1] === 'W' && (u < s0 - 3 || u > s1 + 3 || v < cv)) cand.push([u, v]);
    cand.sort((a, b) => Math.abs(b[0] - xs) - Math.abs(a[0] - xs));
    const a = cand[0], b = a && cand.find(q => q[1] === a[1] && Math.abs(q[0] - a[0]) === 2);
    if (a && b) { R[a[1]][a[0]] = 'f_rm'; R[b[1]][b[0]] = 'f_rw'; protect(a[0], a[1] + 1); protect(b[0], b[1] + 1); protect((a[0] + b[0]) >> 1, a[1] + 1); } }
  // the drink and condiment station beside the counter, the kiosks on the other side of the line
  const sideD = wallCol != null ? -dts : (s0 - fx0 > fx1 - s1 ? -1 : 1);   // the side with more dining room
  if (!carry) { const u0 = sideD > 0 ? s1 + 2 : s0 - 2; const st = sub ? ['f_dc', 'f_chip', 'f_soda'] : ['f_soda', 'f_soda', 'f_cond'];
    st.forEach((t, i) => { const u = u0 + i * sideD; if (set(u, cv + 1, t)) protect(u, cv + 2); }); }
  if (p.kiosks) for (let i = 0; i < p.kiosks; i++) { const u = (sideD > 0 ? s0 - 2 : s1 + 2) - i * sideD; set(u, cv + 2, 'f_kio') && protect(u, cv + 3); }
  set(xs - 2, fr - 1, 'f_tr'); set(xs + 2, fr - 1, 'f_tr');
  for (let u = xs - 1; u <= xs + 1; u++) if (R[fr][u] === '.') R[fr][u] = 'f_mat';
  // booths down the side walls, tables in the middle; a pick-up lobby gets a bench and a table or two
  if (carry) { for (let u = fx0; u <= fx1; u++) if (Math.abs(u - xs) > 2 && (u - fx0) % 6 < 3) set(u, fy1 - 1, 'f_bench');
    for (let v = cv + 3; v <= fy1 - 3; v += 3) for (let u = fx0 + 1; u + 2 <= fx1; u += 5) if (Math.abs(u + 1 - xs) > 1 && fl(u, v) && fl(u + 1, v) && fl(u + 2, v)) { set(u, v, 'f_ch'); set(u + 1, v, 'f_tb'); set(u + 2, v, 'f_ch'); }
  } else {
    const booth = (u, v) => { for (let a = 0; a < 2; a++) for (let b = 0; b < 3; b++) if (!fl(u + a, v + b)) return false;
      for (let a = 0; a < 2; a++) { R[v][u + a] = 'f_bn'; R[v + 1][u + a] = 'f_tb'; R[v + 2][u + a] = 'f_bs'; } return true; };
    const top = wallCol != null ? fy0 : cv + 1;
    for (const [u, side] of [[fx0, -1], [fx1 - 1, 1]]) for (let v = top; v + 2 <= fy1 - 2; v++) if (booth(u, v)) v += 3;
    if (wallCol != null) { const a = dts > 0 ? fx0 : wallCol + 1, b = dts > 0 ? wallCol - 1 : fx1;   // booths along the back wall of the dining end
      for (let u = a + 3; u + 1 <= b - 3; u += 3) booth(u, fy0); }
    for (let v = cv + 3; v <= fy1 - 2; v += 3) for (let u = fx0 + 3; u + 2 <= fx1 - 3;) {
      if (fl(u, v) && fl(u + 1, v) && fl(u + 2, v) && fl(u + 1, v - 1) && fl(u + 1, v + 1)) { R[v][u] = 'f_ch'; R[v][u + 1] = 'f_tb'; R[v][u + 2] = 'f_ch'; u += 4; } else u++; }
    if (wallCol != null) for (let v = fy0 + 4; v < cv + 4; v += 3) { const a = dts > 0 ? fx0 + 3 : wallCol + 2, b = dts > 0 ? wallCol - 2 : fx1 - 3;
      for (let u = a; u + 2 <= b; u += 4) if (fl(u, v) && fl(u + 1, v) && fl(u + 2, v) && fl(u + 1, v - 1) && fl(u + 1, v + 1)) { R[v][u] = 'f_ch'; R[v][u + 1] = 'f_tb'; R[v][u + 2] = 'f_ch'; } }
  }
  // a customer in line, one at the drink station
  const qu = regs[0]; if (R[cv + 2] && R[cv + 2][qu] === '.') { R[cv + 2][qu] = 'N'; F.npcs.push({ x: qu, y: cv + 2, folk: 'f_cust' + (F.b.id % 4), name: 'Customer', talk: () => say([['Customer', ['Hmm. I always get the same thing anyway.', 'I\'m just picking up an order.', 'The usual, I think.'][F.b.id % 3]]]) }); }
  if (!carry) { const u = (sideD > 0 ? s1 + 3 : s0 - 3), v = cv + 2; if (R[v] && R[v][u] === '.') { R[v][u] = 'N'; F.npcs.push({ x: u, y: v, folk: 'f_cust' + ((F.b.id + 1) % 4), name: 'Customer', talk: () => say([['Customer', 'Free refills. Best part of the day.']]) }); } }
}
// ---------- gas station stores ----------
function foodGasLayout(F, c, p) {
  const { fx0, fx1, fy0, fy1, xs } = c, T = foodTools(F, c), { R, fl, set, protect } = T;
  const w = fx1 - fx0 + 1, d = fy1 - fy0 + 1;
  for (let u = fx0; u <= fx1; u++) { protect(u, fy1); protect(u, F.ey); }
  for (let v = fy0; v <= fy1; v++) protect(xs, v);
  // the back: a walk-in or stock room behind the cooler doors (a kitchen too at Kwik Trip), the restrooms at one end
  const back = d >= 16 ? 2 : d >= 10 ? 1 : 0, coolV = fy0 + back;
  for (let v = fy0; v < coolV; v++) for (let u = fx0; u <= fx1; u++) if (R[v][u] === '.') R[v][u] = 'x';
  const left = (xs - fx0 >= 5 && xs - fx0 <= fx1 - xs) || fx1 - xs < 5;   // the checkout goes on the door's nearer side
  const ckSide = left ? -1 : 1, rrEnd = left ? fx1 : fx0;   // restrooms in the back corner away from the checkout
  const rr = [rrEnd, rrEnd + ckSide, rrEnd + 2 * ckSide];   // women's, men's, and a staff door (Kwik Trip: the kitchen)
  for (let u = fx0; u <= fx1; u++) { if (R[coolV][u] !== '.') continue;
    const i = rr.indexOf(u); if (i === 2 && !p.kt && back) { R[coolV][u] = 'D'; continue; }
    R[coolV][u] = i === 0 ? 'f_rw' : i === 1 ? 'f_rm' : i === 2 ? 'D' : (p.kt && Math.abs(u - (left ? fx0 + 4 : fx1 - 4)) <= 2) || (!p.kt && Math.abs(u - xs) <= 1) ? 'f_coolm' : 'f_cool';
    if (i >= 0) { for (let v = fy0; v < coolV; v++) if (i < 2 && R[v][u] === 'x') R[v][u] = 'W'; protect(u, coolV + 1); } }
  F.fKitchen = (x, y) => y < coolV;
  for (let v = fy0; v < coolV; v++) for (let u = fx0; u <= fx1; u++) if (R[v][u] === 'x' && (u + v) % 3 === 0) R[v][u] = p.kt && Math.abs(u - rr[2]) <= 4 ? (u % 2 ? 'f_prep' : 'f_ov') : 'B';
  // the checkout counter, by the door, with the clerk between it and the cigarette and lottery wall
  const wallU = left ? fx0 : fx1, clerkU = wallU - ckSide, ctrU = wallU - 2 * ckSide;
  const rb = F.ey - 2, n = Math.max(3, Math.min(6, Math.round(d * 0.32))), ra = Math.max(coolV + 2, rb - n + 1);
  for (let v = ra; v <= rb; v++) { set(wallU, v, 'f_cig'); if (R[v][clerkU] === '.') R[v][clerkU] = 'x'; set(ctrU, v, v === ra + 1 || (n >= 5 && v === rb - 1) ? 'f_reg' : v === rb ? 'f_lot' : 'f_ck'); }
  set(clerkU, rb + 1, 'f_ck'); set(wallU, rb + 1, 'f_ck');
  set(clerkU, ra - 1, 'f_ck'); set(ctrU, ra - 1, 'f_ck'); set(wallU, ra - 1, 'f_cig');
  for (let v = ra - 1; v <= rb + 1; v++) protect(ctrU - ckSide, v);
  F.fCheckout = [clerkU, ra, rb];
  { const cv0 = [ra + 1, ra, ra + 2].find(v => R[v] && R[v][clerkU] === 'x'); if (cv0 != null) F.npcs.push({ x: clerkU, y: cv0, folk: 'f_' + p.key + '0', name: 'Cashier', talk: () => F.fOrder() }); }
  const place = p.title.replace(/\b\w+/g, s => s[0] + s.slice(1).toLowerCase()).replace('Bp', 'BP').replace('Vp', 'VP').replace('-N-', '-n-');
  F.fOrder = () => ask('Cashier: Hi there! Find everything okay?', [{ t: 'Buy something', f: () => menuOpen(place, MENUS['f_' + p.key], FOOD_NOTE) }, { t: 'Just looking' }]);
  // the coffee and fountain bar, hot food and the bakery case down the other wall
  const barU = left ? fx1 : fx0, run = p.kt ? ['f_foun', 'f_foun', 'f_cap', 'f_cof', 'f_cof', 'f_cof', 'f_hot', 'f_hot', 'f_glz', 'f_glz'] : ['f_foun', 'f_foun', 'f_cap', 'f_cof', 'f_cof', 'f_rg', 'f_hot'];
  { let i = 0; for (let v = coolV + 2; v <= fy1 - 2 && i < run.length; v++) if (set(barU, v, run[i])) i++; }
  for (let v = coolV + 1; v <= fy1; v++) protect(barU + ckSide, v);
  // aisles: shelves run front to back with room to walk between them
  const g0 = left ? ctrU + 3 : barU + 3, g1 = left ? barU - 3 : ctrU - 3, gv0 = coolV + 3, gv1 = fy1 - 4, kinds = p.kt ? ['f_gro', 'f_gon', 'f_gro', 'f_gon', 'f_cnd', 'f_auto'] : ['f_gon', 'f_gro', 'f_cnd', 'f_gon', 'f_auto'];
  const cols = []; for (let u = g0; u <= g1; u += 3) if (Math.abs(u - xs) >= 1) cols.push(u);
  const midV = gv1 - gv0 >= 9 ? (gv0 + gv1) >> 1 : -1;
  for (let u = g1 + 3; ckSide > 0 ? u <= wallU - 2 : false; u += 3) cols.push(u);   // above the checkout, the shelves carry on to the wall
  for (let u = g0 - 3; ckSide < 0 ? u >= wallU + 2 : false; u -= 3) cols.unshift(u);
  cols.forEach((u, i) => { const band = ckSide < 0 ? u <= ctrU + 2 : u >= ctrU - 2, end = band ? ra - 3 : gv1;
    for (let v = gv0; v <= end; v++) if (v !== midV) set(u, v, kinds[i % kinds.length]); });
  // up front: bananas and fruit (Kwik Trip), the ice chest, an ATM
  if (p.kt) { set(ctrU - 3 * ckSide, fy1 - 2, 'f_ban'); set(ctrU - 4 * ckSide, fy1 - 2, 'f_ban'); }
  const fr = F.ey; set(xs - 2 * ckSide, fr - 1, 'f_ice') || set(xs - 3 * ckSide, fr - 1, 'f_ice');
  set(xs - 4 * ckSide, fr - 1, 'f_atm') || set(xs + 3 * ckSide, fr - 1, 'f_atm');
  if (R[fr][xs] === '.') R[fr][xs] = 'f_mat';
  // customers: one getting coffee, one in an aisle
  const cofV = (() => { for (let v = coolV + 2; v <= fy1 - 2; v++) if (R[v][barU] === 'f_cof') return v; return coolV + 3; })();
  const cu = barU + ckSide; if (R[cofV] && R[cofV][cu] === '.') { R[cofV][cu] = 'N'; F.npcs.push({ x: cu, y: cofV, folk: 'f_cust' + (F.b.id % 4), name: 'Customer', talk: () => say([['Customer', ['Coffee first. Then I can talk.', 'Long drive ahead. Gotta fill the mug.', 'Morning!'][F.b.id % 3]]]) }); }
  if (cols.length) { const u = cols[0] + 1, v = gv0 + 1; if (R[v] && R[v][u] === '.' && R[v][u + 1] === '.') { R[v][u] = 'N'; F.npcs.push({ x: u, y: v, folk: 'f_cust' + ((F.b.id + 2) % 4), name: 'Customer', talk: () => say([['Customer', 'They moved the chips again. Every time.']]) }); } }
  if (p.kt && cols.length > 2) { const u = cols[2] + 1, v = gv1 - 1; if (R[v] && R[v][u] === '.' && R[v][u + 1] === '.') { R[v][u] = 'N'; F.npcs.push({ x: u, y: v, folk: 'f_' + p.key + '1', name: 'Stocker', talk: () => say([['Stocker', 'Fresh donuts in the case this morning. Milk and eggs are in the coolers in back.']]) }); } }
}
// ---------- looking at things ----------
const FOOD_LOOK = {
  f_ctr: 'The front counter.', f_reg: 'The register.', f_kio: 'An ordering kiosk. The screen says TOUCH TO ORDER.', f_soda: 'The soda fountain. Help yourself to refills.',
  f_cond: 'Napkins, straws, lids, and the ketchup pump.', f_tr: 'A trash bin, with a spot on top to stack your tray.', f_bn: 'A booth.', f_bs: 'A booth.', f_tb: 'A table.', f_ch: 'A chair.',
  f_rm: 'The men\'s room.', f_rw: 'The women\'s room.', f_dt: 'The drive-thru window, with its headset and register.', f_gr: 'The grill. Patties sizzle on the flat top.',
  f_bro: 'The broiler. Patties ride a chain through the flames.', f_fr: 'The fryers hiss.', f_pfr: 'Pressure fryers. The lids lock down while the chicken cooks.', f_brd: 'The breading table: a tub of seasoned flour.',
  f_prep: 'A steel prep table.', f_hold: 'A warming cabinet, holding food until it goes out.', f_wic: 'The walk-in cooler.', f_dish: 'The dish sinks: wash, rinse, sanitize.',
  f_rack: 'Wire shelves of boxes, cups and buns.', f_bev: 'The drink tower behind the counter.', f_ov: 'An oven.', f_sl: 'A meat slicer.', f_stm: 'The steam table: meat, beans, cheese, lettuce and tomatoes.',
  f_cus: 'The frozen custard machine, turning out a fresh batch.', f_cusd: 'The dipping cabinet of custard flavors.', f_ss: 'A soft-serve machine.', f_bz: 'A spindle mixer for blended treats.',
  f_mk: 'The make line: sauce, cheese and the toppings, kept cold.', f_pov: 'The conveyor oven. Pizzas ride in raw and come out bubbling.', f_dm: 'A big dough mixer.', f_hnr: 'The warmer, stacked with pizzas ready to go.',
  f_sg: 'The sandwich line behind the glass: meats, cheeses and the vegetables.', f_bo: 'The bread oven. It smells great.', f_to: 'A toaster oven for the toasted subs.', f_chip: 'A rack of chips.', f_dc: 'A cooler of bottled drinks.',
  f_bench: 'A bench to wait on.', f_ck: 'The checkout counter.', f_lot: 'The lottery ticket case on the counter.', f_cig: 'The wall behind the counter: cigarettes and lottery tickets.',
  f_cool: 'Cooler doors: pop, water, energy drinks, juice.', f_coolm: 'Cooler doors: milk, eggs, butter and cheese.', f_cof: 'The coffee bar. A row of brewers and every size of cup.',
  f_foun: 'The fountain drinks. Ice, then pop.', f_cap: 'The cappuccino and slush machines, swirling.', f_rg: 'The roller grill. Hot dogs turning slowly.', f_hot: 'The hot food case: pizza slices, chicken and breakfast sandwiches.',
  f_glz: 'The bakery case: glazed donuts and long johns.', f_ban: 'Bananas and some fruit.', f_gon: 'Shelves of chips, crackers and snacks.', f_gro: 'Grocery shelves: bread, cereal, soup and canned goods.',
  f_cnd: 'Candy, gum and mints.', f_auto: 'Motor oil, washer fluid, and a few car things.', f_atm: 'An ATM.', f_ice: 'The ice chest.', f_mat: 'A floor mat.',
};
function foodLook(F, x, y, n) {
  if (n) return false;
  const t = roomT(F, x, y);
  if (t === 'f_ctr' || t === 'f_reg' || t === 'f_sg' || t === 'f_kio' || t === 'f_ck' || t === 'f_lot') {
    if (t === 'f_kio') { ask(FOOD_LOOK.f_kio, [{ t: 'Order here', f: () => menuOpen(F.fp.title || F.fp.b.name, MENUS['f_' + F.fp.key], FOOD_NOTE) }, { t: 'Not now' }]); return true; }
    if (F.fOrder) { F.fOrder(); return true; } }
  if (t === 'D') { say([['', F.fp.type === 'gas' ? (F.fp.kt ? 'The door to the kitchen and stockroom. Staff only.' : 'The door to the stockroom. Staff only.') : 'A door to the back. Staff only.']]); return true; }
  if (FOOD_LOOK[t]) { say([['', FOOD_LOOK[t]]]); return true; }
  if (t === 'x' && F.fKitchen && F.fKitchen(x, y)) { say([['', F.fp.type === 'gas' ? 'The back room. Staff only.' : 'The kitchen. Staff only.']]); return true; }
  return false;
}
// ---------- drawing ----------
{ const _ft = roomFloorTile; roomFloorTile = function (Fm, t, x, y) {
    if (Fm.fFood && Fm.fKitchen && Fm.fKitchen(x, y) && t !== '.' && t !== 'e') { qp((x + y) % 2 ? '#c4beb4' : '#b4aea4', x * 24, y * 24, 24, 24); qp('#a49e94', x * 24, y * 24 + 23, 24, 1); return; }   // quarry tile in the back
    _ft(Fm, t, x, y);
    if (t === 'f_mat') { const X = x * 24, Y = y * 24; qp('#2a2a30', X, Y + 2, 24, 20); qp('#3a3a42', X, Y + 4, 24, 1); qp('#3a3a42', X, Y + 18, 24, 1); }
  }; }
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) { if (t.length > 2 && t[0] === 'f' && t[1] === '_' && Fm.fp) return foodProp(Fm, t, x, y); return _rp(Fm, t, x, y); }; }
const FOOD_PICS = ['#c87a3a', '#e8c040', '#7aa040', '#d84a3a', '#f0e0b0', '#8a5a30'];
function foodProp(Fm, t, x, y) {
  const X = x * 24, Y = y * 24, p = Fm.fp, c1 = p.c1, c2 = p.c2, h = hash(x * 5 + Fm.seed, y * 9 + 2), fr = frame, sh = () => qp('rgba(0,0,0,.22)', X + 1, Y + 19, 22, 4);
  const same = (dx, dy) => roomT(Fm, x + dx, y + dy) === t, steel = '#a8acb4', steelD = '#7a7e86', steelL = '#d0d4da';
  const hood = () => { const l = same(-1, 0), r = same(1, 0); qp('#b8bcc4', X - (l ? 0 : 1), Y - 30, 24 + (l ? 0 : 1) + (r ? 0 : 1), 9); qp('#8a8e96', X, Y - 22, 24, 2); };
  const cab = (top, body) => { sh(); qp(body || steel, X + 1, Y + 2, 22, 18); qp(shade(body || steel, -0.25), X + 1, Y + 18, 22, 2); qp(top || steelL, X + 1, Y - 2, 22, 5); };
  switch (t) {
    case 'f_ctr': case 'f_reg': case 'f_ck': case 'f_lot': {
      const gas = p.type === 'gas', front = gas ? '#8a7a6a' : c1, top = gas ? '#d8d0c0' : '#d8d4cc';
      sh(); qp(front, X, Y + 2, 24, 18); qp(shade(front, -0.25), X, Y + 18, 24, 2); qp(top, X, Y - 2, 24, 5); qp(shade(top, 0.12), X, Y - 2, 24, 1);
      if (gas) qp(c1, X, Y + 6, 24, 3); else qp(c2 === '#ffffff' || c2 === '#f5ebdc' || c2 === '#f4e8d0' ? shade(c1, -0.2) : c2, X, Y + 8, 24, 2);
      if (t === 'f_reg') { qp('#2a2c34', X + 6, Y - 11, 12, 10); qp('#5ac08a', X + 8, Y - 10, 8, 5); qp('#5a5e68', X + 7, Y - 3, 10, 2); qp('#2a2c34', X + 18, Y - 4, 4, 3); }
      if (t === 'f_lot') { qp('#2a2c34', X + 3, Y - 12, 18, 11); for (let i = 0; i < 4; i++) qp(['#e84a6a', '#4ab0e8', '#f0c040', '#6ad06a'][(i + h) % 4], X + 4 + i * 4, Y - 11, 3, 9); qp('rgba(255,255,255,.3)', X + 4, Y - 11, 16, 1); }
      if (t === 'f_ck' && gas && h % 3 === 0) { for (let i = 0; i < 3; i++) qp(['#e04a3a', '#f0c040', '#3a7ad8'][i], X + 4 + i * 6, Y - 6, 4, 4); }
      if (Fm.fMenuRow === y && t !== 'f_ck' && t !== 'f_lot') {   // the menu boards hang above the counter
        if (!same(-1, 0) && roomT(Fm, x - 1, y) !== 'f_reg' && roomT(Fm, x - 1, y) !== 'f_ctr') qp('#3a3a3e', X + 3, Y - 74, 1, 12);
        qp('#1a1a1e', X, Y - 62, 24, 17); qp(c1, X, Y - 62, 24, 2);
        qp(FOOD_PICS[h % 6], X + 2, Y - 57, 8, 6); qp(FOOD_PICS[(h >> 3) % 6], X + 3, Y - 56, 3, 2);
        qp('#f0f0e8', X + 12, Y - 57, 9, 1); qp('#f0d060', X + 12, Y - 54, 6, 1); qp('#f0f0e8', X + 12, Y - 51, 8, 1); qp('#8a8e96', X, Y - 46, 24, 1); }
      break; }
    case 'f_kio': { qp('rgba(0,0,0,.22)', X + 5, Y + 18, 14, 4); qp('#2a2c34', X + 10, Y + 4, 4, 15); qp('#3a3c44', X + 7, Y + 17, 10, 3);
      qp('#2a2c34', X + 5, Y - 20, 14, 26); qp(c1, X + 6, Y - 19, 12, 4); qp('#f4f4f0', X + 6, Y - 14, 12, 16);
      for (let i = 0; i < 4; i++) qp(FOOD_PICS[(i + h) % 6], X + 7 + (i % 2) * 5, Y - 13 + (i >> 1) * 6, 4, 4); qp('#5a5e68', X + 8, Y + 3, 8, 2); break; }
    case 'f_soda': case 'f_foun': { cab('#c8ccd2', '#5a5e66'); qp('#c8ccd2', X + 2, Y - 16, 20, 15); qp('#9aa0a8', X + 2, Y - 3, 20, 2);
      for (let i = 0; i < 4; i++) { qp(['#c83a2a', '#2a2a30', '#3a9a4a', '#e8a030', '#3a6ad8', '#d8d0c0'][(i + x) % 6], X + 3 + i * 5, Y - 14, 4, 6); qp('#5a5e66', X + 4 + i * 5, Y - 7, 2, 3); }
      if (t === 'f_foun') qp(c1, X + 2, Y - 18, 20, 3); break; }
    case 'f_cond': { cab('#d8d4cc', '#7a5a3a'); qp('#f4f4f0', X + 3, Y - 7, 6, 6); qp('#c83a2a', X + 11, Y - 9, 4, 8); qp('#e8c040', X + 16, Y - 8, 4, 7); qp('#e8e8e0', X + 3, Y - 12, 1, 6); qp('#e8e8e0', X + 5, Y - 12, 1, 6); break; }
    case 'f_tr': { sh(); qp('#6a4a30', X + 3, Y - 6, 18, 25); qp('#5a3a22', X + 3, Y - 6, 18, 2); qp('#2a2224', X + 6, Y, 12, 6); qp('#e8e0c8', X + 8, Y + 2, 8, 1); qp('#c8b898', X + 5, Y - 9, 14, 3); qp('#8a5a30', X + 6, Y - 10, 12, 1); break; }
    case 'f_bn': case 'f_bs': { const s = p.seat || c1, up = t === 'f_bn';
      qp('rgba(0,0,0,.2)', X, Y + 19, 24, 3);
      if (up) { qp(shade(s, -0.2), X, Y - 8, 24, 12); qp(s, X, Y - 6, 24, 8); qp(shade(s, 0.15), X, Y + 4, 24, 8); qp(shade(s, -0.35), X, Y + 12, 24, 4); }
      else { qp(shade(s, 0.15), X, Y + 2, 24, 7); qp(s, X, Y + 9, 24, 10); qp(shade(s, -0.3), X, Y + 19, 24, 2); }
      if (!same(-1, 0)) qp(shade(s, -0.4), X, Y - (up ? 8 : -2), 2, up ? 24 : 19); if (!same(1, 0)) qp(shade(s, -0.4), X + 22, Y - (up ? 8 : -2), 2, up ? 24 : 19); break; }
    case 'f_tb': { const l = same(-1, 0), r = same(1, 0), col = p.key === 'arbys' || p.key === 'culvers' ? '#9a6a42' : '#e8e0d0';
      qp('rgba(0,0,0,.2)', X + 2, Y + 17, 20, 4); qp(col, X + (l ? 0 : 3), Y + 2, 24 - (l ? 0 : 3) - (r ? 0 : 3), 12); qp(shade(col, -0.25), X + (l ? 0 : 3), Y + 12, 24 - (l ? 0 : 3) - (r ? 0 : 3), 2);
      if (!l && !r) qp(shade(col, -0.35), X + 11, Y + 14, 2, 6);
      if (h % 3 === 0) { qp(shade(c1, -0.1), X + 6, Y + 4, 12, 8); qp('#f0d060', X + 8, Y + 5, 3, 5); qp('#c87a3a', X + 12, Y + 6, 4, 3); qp('#f4f4f0', X + 16, Y + 2, 3, 6); }
      break; }
    case 'f_ch': { qp('rgba(0,0,0,.2)', X + 6, Y + 18, 12, 3); const s = p.seat || '#7a4a2a'; qp(s, X + 7, Y + 1, 10, 5); qp(s, X + 7, Y + 7, 10, 6); qp(shade(s, -0.3), X + 7, Y + 13, 2, 6); qp(shade(s, -0.3), X + 15, Y + 13, 2, 6); break; }
    case 'f_bench': { qp('rgba(0,0,0,.2)', X, Y + 17, 24, 4); qp(p.seat || '#6a4428', X, Y + 2, 24, 6); qp(shade(p.seat || '#6a4428', 0.15), X, Y + 8, 24, 6); qp('#2a2a30', X + 2, Y + 14, 2, 5); qp('#2a2a30', X + 20, Y + 14, 2, 5); break; }
    case 'f_rm': case 'f_rw': { qp('#5a5e66', X, Y - 9, 24, 33); qp('#8a8e96', X + 3, Y - 6, 18, 30); qp('#c8ccd2', X + 17, Y + 6, 2, 2);
      qp('#2a5aa8', X + 7, Y - 3, 10, 10); qp('#f4f4f0', X + 11, Y - 2, 2, 2); qp('#f4f4f0', t === 'f_rw' ? X + 9 : X + 10, Y + 1, t === 'f_rw' ? 6 : 4, t === 'f_rw' ? 4 : 5); break; }
    case 'f_dt': { qp('#2a2226', X, Y - 16, 24, 22); qp('#9ab8d0', X + 2, Y - 14, 20, 16); qp('rgba(255,255,255,.35)', X + 4, Y - 13, 3, 14); qp('#5a5e66', X + 11, Y - 14, 2, 16);
      cab('#c8ccd2', '#5a5e66'); qp('#2a2c34', X + 6, Y - 9, 10, 8); qp('#5ac08a', X + 8, Y - 8, 6, 4); qp('#1a1a1e', X + 17, Y - 6, 4, 4); break; }
    case 'f_gr': { hood(); cab('#2a2a2e'); for (let i = 0; i < 3; i++) { qp('#6a3a22', X + 3 + i * 7, Y - 1, 5, 3); if ((fr >> 2) % 3 === i) qp('rgba(255,255,255,.4)', X + 4 + i * 7, Y - 4, 2, 2); } break; }
    case 'f_bro': { hood(); sh(); qp('#5a5e66', X + 1, Y - 6, 22, 26); qp('#3a3c42', X + 3, Y - 2, 18, 8); qp((fr >> 2) % 2 ? '#f08a30' : '#e05a20', X + 4, Y + 2, 16, 3); qp('#6a3a22', X + 6, Y, 4, 2); qp('#6a3a22', X + 13, Y, 4, 2); break; }
    case 'f_fr': { hood(); cab(); qp('#3a3a3e', X + 3, Y - 2, 18, 5); qp('#d8a838', X + 4, Y - 1, 7, 3); qp('#d8a838', X + 13, Y - 1, 7, 3);
      if ((fr >> 3) % 2) { qp('#f0d070', X + 5 + (h % 4), Y - 1, 1, 1); qp('#f0d070', X + 15 + (h % 3), Y, 1, 1); } qp('#5a5e66', X + 6, Y - 6, 2, 5); qp('#5a5e66', X + 16, Y - 6, 2, 5); break; }
    case 'f_pfr': { hood(); cab(); qp('#8a8e96', X + 4, Y - 8, 16, 8); qp('#6a6e76', X + 4, Y - 8, 16, 2); qp('#f4f4f0', X + 10, Y - 5, 4, 3); qp('#c83a2a', X + 11, Y - 4, 1, 1); break; }
    case 'f_brd': { cab(); qp('#f0ece0', X + 3, Y - 2, 18, 4); qp('#c8a070', X + 6, Y - 1, 4, 2); qp('#c8a070', X + 13, Y - 2, 4, 2); break; }
    case 'f_prep': { cab(); if (h % 3 === 0) { qp('#d8a058', X + 4, Y - 2, 5, 3); qp('#d8a058', X + 10, Y - 2, 5, 3); } else if (h % 3 === 1) { qp('#5aa040', X + 4, Y - 2, 6, 3); qp('#d84a3a', X + 12, Y - 2, 5, 3); } else qp('#f4f4f0', X + 6, Y - 2, 12, 3); break; }
    case 'f_hold': { sh(); qp('#5a5e66', X + 1, Y - 10, 22, 30); for (let r = 0; r < 3; r++) { qp('#2a2a2e', X + 3, Y - 7 + r * 7, 18, 5); qp('#e8a030', X + 4, Y - 5 + r * 7, 2, 1); qp('#c87a3a', X + 8, Y - 6 + r * 7, 10, 3); } break; }
    case 'f_wic': { const l = same(-1, 0); qp('#c8ccd2', X, Y - 16, 24, 36); qp('#a8acb4', X, Y - 16, 24, 2); if (!l) { qp('#9aa0a8', X + 4, Y - 12, 18, 30); qp('#5a5e66', X + 18, Y, 2, 6); qp('#2a2c34', X + 6, Y - 10, 6, 4); qp('#5ac0e8', X + 7, Y - 9, 4, 2); } else qp('#b8bcc4', X + 2, Y - 12, 20, 2); break; }
    case 'f_dish': { cab(); qp('#5a5e66', X + 3, Y - 2, 8, 4); qp('#5a5e66', X + 13, Y - 2, 8, 4); qp('#7ab0d8', X + 4, Y - 1, 6, 2); qp('#7ab0d8', X + 14, Y - 1, 6, 2); qp('#8a8e96', X + 11, Y - 10, 2, 8); qp('#8a8e96', X + 11, Y - 10, 5, 2); break; }
    case 'f_rack': { sh(); qp('#8a8e96', X + 1, Y - 14, 2, 34); qp('#8a8e96', X + 21, Y - 14, 2, 34); for (let r = 0; r < 4; r++) { qp('#a8acb4', X + 1, Y - 10 + r * 8, 22, 1); qp(['#a07a4a', '#c09a6a', '#f4f4f0', '#d84a3a'][(h + r) % 4], X + 3 + (r * 3) % 6, Y - 16 + r * 8, 12, 6); } break; }
    case 'f_bev': { cab('#c8ccd2', '#5a5e66'); qp('#c8ccd2', X + 3, Y - 14, 18, 12); for (let i = 0; i < 3; i++) qp(['#c83a2a', '#2a2a30', '#e8a030'][i], X + 5 + i * 5, Y - 12, 3, 5); qp('#f4f4f0', X + 18, Y - 20, 4, 10); qp(c1, X + 18, Y - 14, 4, 2); break; }
    case 'f_ov': { sh(); qp('#2a2a30', X + 1, Y - 14, 22, 34); qp('#3a3a42', X + 1, Y - 14, 22, 3); qp('#5a3a22', X + 4, Y - 8, 16, 10); qp((fr >> 4) % 2 ? '#e8a040' : '#d88a30', X + 5, Y - 7, 14, 8); qp('#8a5a30', X + 7, Y - 4, 10, 4); qp('#8a8e96', X + 4, Y + 6, 16, 2); break; }
    case 'f_sl': { cab(); qp('#c8ccd2', X + 6, Y - 10, 12, 12); qp('#e8ecf0', X + 8, Y - 8, 8, 8); qp('#9a5a4a', X + 14, Y - 3, 6, 4); break; }
    case 'f_stm': { cab(); const C = ['#6a3a22', '#8a5a3a', '#f0c040', '#5aa040', '#d84a3a', '#f4f0e4']; for (let i = 0; i < 3; i++) qp(C[(i + x * 3) % 6], X + 2 + i * 7, Y - 1, 6, 3); qp('rgba(255,255,255,.25)', X + 2, Y - 6, 20, 2); break; }
    case 'f_cus': { sh(); qp(steel, X + 2, Y - 18, 20, 38); qp(steelL, X + 2, Y - 18, 20, 3); qp('#2a2c34', X + 6, Y - 12, 12, 10); qp('#f0e0b0', X + 8, Y - 10 + ((fr >> 4) % 2), 8, 6); qp(c1, X + 4, Y + 4, 16, 3); qp(steelD, X + 9, Y - 2, 6, 4); break; }
    case 'f_cusd': { cab('#cfe0e8', '#7a7e86'); for (let i = 0; i < 3; i++) qp(['#f0e0b0', '#5a3a22', '#e890a0', '#7a5aa0', '#f0d060'][(i + x + h) % 5], X + 3 + i * 7, Y - 1, 5, 3); qp('rgba(255,255,255,.4)', X + 2, Y - 2, 20, 1); break; }
    case 'f_ss': { sh(); qp(steel, X + 3, Y - 16, 18, 36); qp(steelL, X + 3, Y - 16, 18, 3); qp('#2a2c34', X + 5, Y - 6, 3, 6); qp('#2a2c34', X + 16, Y - 6, 3, 6); qp('#5a5e66', X + 9, Y - 4, 6, 4); qp('#f4f0e4', X + 10, Y - 1, 4, 3); qp('#c8904a', X + 11, Y + 2, 2, 3); qp('#ee3124', X + 3, Y - 12, 18, 2); break; }
    case 'f_bz': { cab(); qp('#5a5e66', X + 9, Y - 20, 6, 8); qp('#c8ccd2', X + 11, Y - 12, 2, 8); qp('#f4f4f0', X + 9, Y - 5, 6, 6); qp('#ee3124', X + 9, Y - 3, 6, 1); break; }
    case 'f_mk': { cab('#c8ccd2', steel); for (let i = 0; i < 4; i++) qp(['#c83a2a', '#f0e0a0', '#a02a1e', '#3a7a3a', '#5a3a2a', '#e8c040'][(i + x * 2) % 6], X + 2 + i * 5, Y - 1, 4, 3);
      if (h % 2) { qp('#e8c070', X + 6, Y + 4, 12, 4); qp('#c83a2a', X + 8, Y + 5, 2, 2); qp('#c83a2a', X + 13, Y + 5, 2, 2); } break; }
    case 'f_pov': { sh(); qp(steel, X, Y - 12, 24, 32); qp(steelD, X, Y - 2, 24, 3); for (const oy of [-9, 4]) { qp('#2a2a2e', X + 2, Y + oy, 20, 4); qp((fr >> 3) % 2 ? '#f08a30' : '#e86a20', X + 3, Y + oy + 1, 18, 2); }
      if (!same(1, 0)) { qp('#e8c070', X + 16, Y - 6, 8, 4); qp('#c83a2a', X + 18, Y - 5, 2, 1); } break; }
    case 'f_dm': { sh(); qp('#5a6a7a', X + 4, Y - 14, 16, 8); qp(steel, X + 3, Y - 6, 18, 14); qp('#f0e8d0', X + 5, Y - 4, 14, 6); qp('#5a6a7a', X + 6, Y + 8, 12, 12); break; }
    case 'f_hnr': { sh(); qp('#3a3a3e', X + 1, Y - 18, 22, 38); qp('#f0a050', X + 3, Y - 16, 18, 30); for (let r = 0; r < 4; r++) { qp('#f47b20', X + 4, Y - 14 + r * 7, 16, 5); qp('#1a1a1a', X + 8, Y - 13 + r * 7, 8, 1); } qp('rgba(255,255,255,.3)', X + 3, Y - 16, 2, 30); break; }
    case 'f_sg': { sh(); qp('#6a4a30', X, Y + 2, 24, 18); qp('#5a3a22', X, Y + 18, 24, 2); qp(c1, X, Y + 6, 24, 2); qp(steelL, X, Y - 3, 24, 6);
      const C = ['#e8b0a0', '#f0d060', '#5aa040', '#d84a3a', '#f4f0e4', '#3a2a1e', '#8a5a4a']; for (let i = 0; i < 3; i++) qp(C[(i + x * 3) % 7], X + 1 + i * 8, Y - 2, 6, 3);
      qp('rgba(200,230,240,.45)', X, Y - 16, 24, 10); qp('#c8ccd2', X, Y - 17, 24, 1); qp('#8a8e96', X, Y - 7, 24, 1); break; }
    case 'f_bo': { sh(); qp(steel, X + 1, Y - 18, 22, 38); qp(steelL, X + 1, Y - 18, 22, 3); for (const oy of [-14, -2]) { qp('#2a2a2e', X + 4, Y + oy, 16, 10); qp('#e8a040', X + 5, Y + oy + 1, 14, 8); qp('#c88a40', X + 6, Y + oy + 3, 12, 3); } break; }
    case 'f_to': { cab(); qp('#2a2a30', X + 4, Y - 10, 16, 10); qp('#3a3a42', X + 6, Y - 8, 9, 6); qp((fr >> 4) % 2 ? '#e86a30' : '#c84a20', X + 7, Y - 7, 7, 1); qp('#5ac08a', X + 16, Y - 8, 2, 2); break; }
    case 'f_chip': { sh(); qp('#8a8e96', X + 3, Y - 16, 2, 36); qp('#8a8e96', X + 19, Y - 16, 2, 36); for (let r = 0; r < 4; r++) for (let i = 0; i < 2; i++) qp(['#e8c040', '#d84a3a', '#3a7ad8', '#3a9a4a', '#e88a30', '#8a3aa8'][(r * 2 + i + x) % 6], X + 5 + i * 7, Y - 14 + r * 8, 6, 7); break; }
    case 'f_dc': case 'f_cool': case 'f_coolm': { const milk = t === 'f_coolm';
      qp('#c8ccd2', X, Y - 20, 24, 40); qp('#3a4a5a', X + 2, Y - 17, 20, 34); qp('#e8ecf0', X, Y - 20, 24, 2);
      for (let r = 0; r < 4; r++) { qp('#8a8e96', X + 2, Y - 10 + r * 8, 20, 1); for (let i = 0; i < 5; i++) {
        const q = hash(x * 7 + i, y * 3 + r + Fm.seed); if (milk) { if (r < 2) qp(i % 2 ? '#f4f4f0' : '#e8e8e0', X + 3 + i * 4, Y - 16 + r * 8, 3, 6); else { qp('#d8c8a8', X + 3 + i * 4, Y - 14 + r * 8, 3, 3); if (i % 2) qp('#f4f0e4', X + 3 + i * 4, Y - 15 + r * 8, 3, 1); } }
        else qp(['#c83a2a', '#3a7ad8', '#3ab04a', '#f0c040', '#e86a30', '#2a2a30', '#d8d0c0', '#8a3aa8'][q % 8], X + 3 + i * 4, Y - 16 + r * 8, 3, 6); } }
      qp('rgba(255,255,255,.22)', X + 3, Y - 17, 3, 34); qp('#e8ecf0', X + 20, Y - 6, 2, 10); if (!same(1, 0)) qp('#9aa0a8', X + 22, Y - 20, 2, 40); break; }
    case 'f_cig': { sh(); qp('#4a3a30', X, Y - 20, 24, 40); qp(c1, X, Y - 20, 24, 4);
      for (let r = 0; r < 5; r++) for (let i = 0; i < 5; i++) qp(['#f4f4f0', '#c83a2a', '#3a6ab8', '#e8c040', '#2a2a30', '#5aa040'][hash(x + i, y * 5 + r) % 6], X + 1 + i * 4 + (r % 2), Y - 15 + r * 5, 3, 4);
      qp('#2a2224', X, Y + 10, 24, 10); for (let i = 0; i < 3; i++) qp(['#e84a6a', '#4ab0e8', '#f0c040'][i], X + 2 + i * 7, Y + 12, 6, 6); break; }
    case 'f_cof': { cab('#d8d0c0', '#6a4a30'); for (let i = 0; i < 2; i++) { const bx = X + 2 + i * 11; qp('#2a2a2e', bx, Y - 20, 9, 18); qp('#5a5e66', bx + 1, Y - 18, 7, 3); qp('#3a2214', bx + 2, Y - 8, 5, 5); qp('#c8ccd2', bx + 2, Y - 9, 5, 1); qp(i ? '#e86a30' : '#5ac08a', bx + 6, Y - 14, 2, 1); }
      if (h % 2) { qp('#f4f4f0', X + 20, Y - 6, 3, 4); qp('#f4f4f0', X + 20, Y - 10, 3, 4); } if ((fr >> 4) % 4 === (h % 4)) qp('rgba(255,255,255,.4)', X + 5, Y - 24, 2, 3); break; }
    case 'f_cap': { cab('#c8ccd2', '#5a5e66'); for (let i = 0; i < 3; i++) { const cc = ['#c83a2a', '#3a7ad8', '#8a5a3a'][i]; qp('#e8ecf0', X + 2 + i * 7, Y - 16, 6, 13); qp(cc, X + 3 + i * 7, Y - 12 + ((fr >> 3) + i) % 3, 4, 8); } break; }
    case 'f_rg': { cab('#c8ccd2'); for (let i = 0; i < 6; i++) { qp('#8a8e96', X + 2, Y - 2 + i, 20, 1); } for (let i = 0; i < 4; i++) qp('#b85a3a', X + 3 + i * 5, Y - 2 + ((fr >> 4) + i) % 2, 3, 5); qp('rgba(255,255,255,.25)', X + 2, Y - 10, 20, 6); break; }
    case 'f_hot': case 'f_glz': { sh(); const glz = t === 'f_glz'; qp(glz ? '#8a5a30' : '#5a5e66', X, Y + 6, 24, 14); qp(glz ? '#cfe0e8' : '#f0c890', X + 1, Y - 12, 22, 19); qp('rgba(255,255,255,.35)', X + 2, Y - 11, 20, 1);
      for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) { const q = (r * 3 + i + x + y) % 4; if (glz) { qp(['#d89a5a', '#c8783a', '#f0d8a0', '#8a4a2a'][q], X + 3 + i * 7, Y - 9 + r * 8, 5, 4); qp('#f8f0e0', X + 4 + i * 7, Y - 9 + r * 8, 3, 1); } else qp(['#e8b040', '#c87a3a', '#d84a3a', '#f0d070'][q], X + 3 + i * 7, Y - 9 + r * 8, 5, 4); }
      if (!glz) qp('rgba(255,180,80,.18)', X + 1, Y - 12, 22, 19); break; }
    case 'f_ban': { sh(); qp('#8a5a30', X + 3, Y + 4, 18, 15); qp('#a07a4a', X + 2, Y - 2, 20, 7); for (let i = 0; i < 3; i++) { qp('#f0d040', X + 3 + i * 6, Y - 6, 5, 6); qp('#5a4a1a', X + 5 + i * 6, Y - 7, 1, 2); } qp('#c83a2a', X + 6, Y + 6, 4, 4); qp('#c83a2a', X + 13, Y + 7, 4, 4); qp('#e88a30', X + 9, Y + 10, 4, 4); break; }
    case 'f_gon': case 'f_gro': case 'f_cnd': case 'f_auto': {
      const top = !same(0, -1); qp('rgba(0,0,0,.18)', X + 1, Y + 19, 22, 3); qp('#8a8e96', X + 2, Y - 8, 20, 28); qp('#6a6e76', X + 11, Y - 8, 2, 28); if (top) qp(c1, X + 2, Y - 10, 20, 3);
      for (let r = 0; r < 3; r++) { qp('#5a5e66', X + 2, Y - 2 + r * 8, 20, 1); for (let i = 0; i < 4; i++) { const q = hash(x * 3 + i, y * 5 + r + Fm.seed);
        const col = t === 'f_gon' ? ['#e8c040', '#d84a3a', '#3a7ad8', '#3a9a4a', '#e88a30', '#8a3aa8'][q % 6] : t === 'f_gro' ? ['#c83a2a', '#d8c8a0', '#3a6ab8', '#f0d060', '#5a8a3a', '#a07a4a'][q % 6] : t === 'f_cnd' ? ['#5a2a1e', '#e84a6a', '#f0c040', '#3ab0e8', '#2a2a30'][q % 5] : ['#2a2a30', '#3a7ad8', '#f0c040', '#c83a2a'][q % 4];
        const ix = X + 3 + i * 5 + (i > 1 ? 1 : 0); if (t === 'f_gro' && q % 3 === 0) qp(col, ix, Y - 6 + r * 8, 4, 4); else qp(col, ix, Y - 7 + r * 8, 4, 5); } }
      break; }
    case 'f_atm': { sh(); qp('#3a3c44', X + 3, Y - 16, 18, 36); qp('#5a5e66', X + 3, Y - 16, 18, 3); qp('#5ab0e8', X + 6, Y - 11, 12, 8); qp('#c8ccd2', X + 6, Y, 12, 4); qp('#1a1a1e', X + 8, Y + 6, 8, 1); break; }
    case 'f_ice': { sh(); qp('#f0f2f4', X + 1, Y - 6, 22, 26); qp('#c8ccd2', X + 1, Y - 6, 22, 3); qp('#3a7ad8', X + 4, Y + 2, 16, 6); qp('#f4f4f0', X + 6, Y + 4, 2, 2); qp('#f4f4f0', X + 10, Y + 4, 2, 2); qp('#f4f4f0', X + 14, Y + 4, 3, 2); break; }
  }
}
