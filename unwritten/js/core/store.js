"use strict";
// =====================================================================
//  THE BOOKSTORE: a second way to play (Nov 14).
//  Christian: "Bookstore simulator. Where you have a limited amount of money to buy inventory and deal with customers."
//  And at 08:00: "a menu with my bookstore picture at the checkout and the rooms as near photo representative with the
//  options around the window." So the screen is a picture of the store in the middle, the choices around it, and the
//  customers come up to the counter in the picture. The pictures are painted stand-ins until his photos come; a room with a
//  photo in STORE_PHOTOS draws assets/store/<room>.png instead (scripts/store/photo_to_pixel.py makes them).
//  How shop games do it, and the real bookstore numbers behind the defaults: notes/bookstore-sim.md.
//  The store has its own save, apart from the adventure.
// =====================================================================
const STORE_KEY = SAVE_KEY + '_store';
// every number is a placeholder for Christian to set, except where a source is named (all in notes/bookstore-sim.md)
const STORE = {
  startCash: 150000,              // $1,500 to start: enough for a few orders and a few weeks' rent, not everything
  rent: 30000, utilities: 6000, other: 4000,   // each Monday morning: rent, heat and power, and insurance, phone and internet
  cardFee: 0.03,                  // what the card processor keeps from each sale
  cap: 1000,                      // books the shelves can hold
  tax: 0.055,                     // 5% state + 0.5% Langlade County (Wisconsin DOR rate chart); books are taxable here
  newCost: 0.60,                  // through a wholesaler, a bookstore's usual discount is 40% off the cover price
  usedPct: [0.4, 0.5, 0.6],       // used books mostly sell around half the cover price
  cashOffer: 0.25, creditOffer: 0.5,   // trade-ins: a quarter of your selling price in cash, half in store credit
  arrive: 2,                      // days for an order to come in
  returnBack: 0.9,                // unsold new books go back for 90% of what they cost
  // customers a day by weekday (Sun..Sat) and by month: November and December carry about a quarter of a year's sales
  dayBase: [4, 6, 6, 7, 7, 9, 11],
  monthMul: [0.7, 0.75, 0.85, 0.9, 1.0, 1.1, 1.15, 1.1, 0.95, 1.0, 1.25, 1.65],
  hours: [10, 18],                // open 10 to 6
  trust: 4,                       // good matches before a regular asks about the real world
};
const ST_ROOMS = { checkout: 'THE CHECKOUT', front: 'THE FRONT WINDOWS', back: 'THE BACK OF THE STORE', up: 'UPSTAIRS', base: 'THE BASEMENT' };
const STORE_PHOTOS = [];          // rooms that have Christian's photo as a pixel picture in assets/store/
const ST_PIC = {}; for (const k of STORE_PHOTOS) { ST_PIC[k] = new Image(); ST_PIC[k].src = 'assets/store/' + k + '.png'; }
const WD3 = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], MO3 = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WDN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
let S = null;                     // the store game

// ---------- small helpers ----------
function srng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function stSec(k) { return STORE_SECS.find(s => s.k === k); }
function stDate(d) { const t = new Date(S.start); t.setDate(t.getDate() + (d == null ? S.day : d)); return t; }
function stDay(d) { const t = stDate(d); return WD3[t.getDay()] + ' ' + MO3[t.getMonth()] + ' ' + t.getDate(); }
function stRnd(salt) { return srng(S.seed * 31 + S.day * 7919 + (salt || 0) * 104729); }
const pickOf = (r, a) => a[Math.floor(r() * a.length)];
function usedPrice(k) { return Math.round(stSec(k).list * STORE.usedPct[S.usedPct] / 25) * 25; }
function newPrice(k) { return stSec(k).list; }
function shelfCount(k) { const s = S.stock[k]; return s.u + s.n; }
function stockAll() { return STORE_SECS.reduce((a, s) => a + shelfCount(s.k), 0); }
function addUsed(St, k, n, costEach) { const s = St.stock[k]; if (n <= 0) return; s.uc = Math.round((s.uc * s.u + costEach * n) / (s.u + n)); s.u += n; }
function addNew(St, k, n) { const s = St.stock[k], c = Math.round(stSec(k).list * STORE.newCost); if (n <= 0) return; s.nc = Math.round((s.nc * s.n + c * n) / (s.n + n)); s.n += n; }

// ---------- a new store, saving and loading ----------
function storeNew(name, g) {
  const t = new Date(); t.setHours(12, 0, 0, 0);
  const st = {}; for (const s of STORE_SECS) st[s.k] = { u: 0, uc: 0, n: 0, nc: 0 };
  const S0 = { v: 1, name, g, seed: (Math.random() * 1e9) | 0, start: t.getTime(), day: 0, cash: STORE.startCash, tax: 0, credit: 0, rep: 50, stock: st,
    usedPct: 1, window: null, events: [], orders: [], specials: [], finds: [], listed: [], regs: STORE_REGS.map(r => ({ id: r.id, trust: 0, real: false })),
    reality: 0, seen: {}, later: [], rentOwed: 0, loan: null, today: null, hist: [], week: { sales: 0, cogs: 0, books: 0 }, room: 'checkout', phase: 'morning', weekly: {} };
  // the shelves you start with: mostly used books (bought for about 15% of the cover price), a few new ones
  const start = { fantasy: [25, 3], mystery: [35, 4], romance: [30, 4], scifi: [20, 3], horror: [20, 3], classics: [30, 4], kids: [30, 4], nonfiction: [30, 3] };
  for (const k in start) { addUsed({ stock: st }, k, start[k][0], Math.round(stSec(k).list * 0.15)); addNew({ stock: st }, k, start[k][1]); }
  return S0;
}
function storeSave() { if (!S) return; try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {} }
function storeLoad() { try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); return s && s.v >= 1 ? s : null; } catch (e) { return null; } }

// ---------- the morning: weather, deliveries, bills, the classifieds ----------
function stWeather(d) {
  const t = stDate(d), m = t.getMonth(), r = srng(S.seed + d * 2654435761)();
  const snow = [0.4, 0.35, 0.25, 0.1, 0, 0, 0, 0, 0, 0.03, 0.2, 0.4][m], rain = [0, 0.02, 0.08, 0.2, 0.25, 0.22, 0.2, 0.2, 0.2, 0.18, 0.1, 0.02][m];
  return r < snow ? 'snow' : r < snow + rain ? 'rain' : r < snow + rain + 0.3 ? 'cloudy' : 'clear';
}
const WX_LINE = { snow: 'Snow is coming down on Fifth Avenue.', rain: 'Rain on the windows. The sidewalk shines.', cloudy: 'A grey sky over Fifth Avenue.', clear: 'Clear skies over Fifth Avenue.' };
function storeMorning() {
  S.phase = 'morning'; S.room = 'checkout'; S.rep += (50 - S.rep) * 0.08;
  const t = stDate(), lines = [stDay() + '. ' + WX_LINE[stWeather(S.day)]];
  S.today = { day: S.day, weather: stWeather(S.day), queue: [], i: 0, sales: 0, tax: 0, cogs: 0, books: 0, custs: 0, buyers: 0, credit: 0, cur: null, ring: null, clock: STORE.hours[0], ev: null, lots: null };
  // deliveries
  const came = S.orders.filter(o => o.due <= S.day); S.orders = S.orders.filter(o => o.due > S.day);
  for (const o of came) addNew(S, o.sec, o.n);
  if (came.length) lines.push('The delivery came: ' + came.map(o => o.n + ' new ' + stSec(o.sec).name).join(', ') + '.');
  const later = S.later.filter(o => o.due <= S.day); S.later = S.later.filter(o => o.due > S.day);
  for (const o of later) { addUsed(S, o.sec, o.n, 0); lines.push('Nobody came back for the box from the step, so it goes on the shelves.'); }
  // a find listed online sells after three days
  for (const f of S.listed.filter(f => f.due <= S.day)) { S.cash += f.value; lines.push('Your listing sold: ' + f.name + ', for ' + money(f.value) + '.'); }
  S.listed = S.listed.filter(f => f.due > S.day);
  // Monday: rent and utilities (and the loan payment)
  if (t.getDay() === 1) {
    const due = STORE.rent + STORE.utilities + STORE.other + S.rentOwed;
    if (S.cash >= due) { S.cash -= due; lines.push('Monday: rent, utilities and insurance' + (S.rentOwed ? ', with what was owed' : '') + ', ' + money(due) + ', paid.'); S.rentOwed = 0; S.late = 0; }
    else { S.rentOwed = due; S.late = (S.late || 0) + 1; lines.push('Monday: the bills come to ' + money(due) + ', and there isn\'t enough cash. ' + (S.late >= 2 ? 'That\'s two Mondays. The landlord needs it by closing tonight.' : 'It carries to next Monday.')); }
    S.week = { sales: 0, cogs: 0, books: 0 }; S.weekly = {};
  }
  // the first of the month: the sales tax collected last month goes to the state
  if (t.getDate() === 1 && S.tax > 0) {
    const pay = Math.min(S.tax, Math.max(0, S.cash));
    S.cash -= pay; S.tax -= pay;
    lines.push(pay ? 'The first of the month: ' + money(pay) + ' in sales tax goes to the state.' : 'The first of the month: sales tax is due, and there\'s no cash for it.');
    if (S.tax > 0) { S.tax = Math.round(S.tax * 1.05); lines.push('What you couldn\'t pay picks up a late charge: ' + money(S.tax) + ' still owed.'); }
  }
  // the classifieds: boxes of used books for sale around town
  S.today.lots = stLots();
  if (S.today.lots.length) lines.push('The classifieds list ' + S.today.lots.length + (S.today.lots.length > 1 ? ' boxes' : ' box') + ' of used books for sale. (USED)');
  const ev = S.events.find(e => e.day === S.day); if (ev) lines.push('Today: ' + STEV[ev.kind].name.toLowerCase() + (ev.kind === 'club' ? ', reading ' + stBook(ev.book)[1] + '.' : '.'));
  const pick = S.specials.filter(o => o.due === S.day).length; if (pick) lines.push(pick + ' special order' + (pick > 1 ? 's' : '') + ' should be picked up today.');
  if (S.rentOwed && t.getDay() !== 1) lines.push('You still owe ' + money(S.rentOwed) + ' in rent. It\'s due Monday.');
  // a morning event, if one comes up today
  const mev = stEventToday('morning');
  const go = () => mev ? stRunEvent(mev) : null;
  say(stPages(lines), go);
  storeSave();
}
function stLots() {
  const r = stRnd(3), n = r() < 0.25 ? 0 : r() < 0.7 ? 1 : 2, out = [];
  const kinds = [['Estate sale', 1.0], ['Moving sale', 0.9], ['Garage sale', 0.7], ['Church rummage sale', 0.6], ['Library sale leftovers', 0.8]];
  const where = ['Graham Ave', 'Edison St', 'Hwy 45', 'east side', 'Superior St', 'by the lake', 'Clermont St'];
  for (let i = 0; i < n; i++) {
    const [kind, q] = pickOf(r, kinds), books = 15 + Math.floor(r() * 40), mix = {};
    const main = pickOf(r, STORE_SECS).k; for (let b = 0; b < books; b++) { const k = r() < 0.45 ? main : pickOf(r, STORE_SECS).k; mix[k] = (mix[k] || 0) + 1; }
    const value = Object.keys(mix).reduce((a, k) => a + mix[k] * usedPrice(k), 0), price = Math.max(500, Math.round(value * q * (0.1 + r() * 0.1) / 100) * 100);
    out.push({ desc: kind + ', ' + pickOf(r, where), n: books, mix, price, worn: r() < 0.3 });
  }
  return out;
}

function stSay(lines, then) { if (lines.length) say(lines, then); else if (then) then(); }   // a say that can be empty
function stPages(lines) {   // sentences packed into dialog pages of five lines or fewer
  const out = []; let cur = '';
  for (const l of lines) { const t = cur ? cur + ' ' + l : l; if (cur && wrap(t, SW - 16 - 12).length > 5) { out.push(['', cur]); cur = l; } else cur = t; }
  if (cur) out.push(['', cur]); return out;
}
// ---------- the store's events (Christian's experiences go in STORE_EVENTS) ----------
function stEventToday(when) {
  const r = stRnd(when === 'morning' ? 11 : 12);
  for (const e of STORE_EVENTS) { if (e.when !== when || (e.once && S.seen[e.id])) continue; if (r() < e.chance) return e; }
  return null;
}
function stRunEvent(e) {
  S.seen[e.id] = (S.seen[e.id] || 0) + 1;
  stSay(e.lines.slice(0, -1).map(l => ['', l]), () => ask(e.lines[e.lines.length - 1], e.choices.map(c => ({ t: c.t, f: () => {
    const fx = c.fx || {};
    if (fx.rep) S.rep = Math.max(0, Math.min(100, S.rep + fx.rep));
    if (fx.cash) S.cash += fx.cash;
    if (fx.used) for (let i = 0; i < Math.min(fx.used, stRoomLeft()); i++) addUsed(S, pickOf(Math.random, STORE_SECS).k, 1, 0);
    if (fx.usedLater) S.later.push({ due: S.day + 7, sec: pickOf(Math.random, STORE_SECS).k, n: fx.usedLater });
    if (fx.sale) { const k = pickOf(Math.random, STORE_SECS.filter(s => shelfCount(s.k))).k; stSell(k, 1); }
    stSay((c.lines || []).map(l => ['', l]));
  } }))));
}

// ---------- the day: customers, one at a time, at the counter ----------
const CUST_LOOKS = ['c_parka', 'c_orange', 'c_student', 'c_grandma', 'c_flannel', 'c_suit', 'c_mom', 'c_dad', 'c_beanie'];
const CUST_DESC = { c_parka: 'A woman in a long parka', c_orange: 'A hunter in blaze orange', c_student: 'A college student', c_grandma: 'A grandmother with a canvas bag',
  c_flannel: 'A man in a flannel jacket', c_suit: 'Someone on a lunch break', c_mom: 'A mom with a stroller', c_dad: 'A dad with a toddler on his shoulders', c_beanie: 'Someone in a knit hat' };
function stQueue() {
  const r = stRnd(5), t = stDate(), dow = t.getDay(), mon = t.getMonth(), D = S.today, ev = S.events.find(e => e.day === S.day);
  let n = STORE.dayBase[dow] * STORE.monthMul[mon] * (0.75 + S.rep / 100 * 0.5) * { snow: 0.7, rain: 0.85, cloudy: 1, clear: 1.08 }[D.weather];
  if (ev && ev.kind === 'sale') n *= 1.3;
  n = Math.max(2, Math.min(30, Math.round(n + (r() - 0.5) * 3)));
  const q = [];
  const types = [['browse', 0.4], ['ask', 0.17], ['seek', 0.12], ['sell', 0.1], ['gift', 0.1], ['haggle', 0.07], ['kid', 0.04]];
  for (let i = 0; i < n; i++) { let x = r(), ty = 'browse'; for (const [k, w] of types) { if (x < w) { ty = k; break; } x -= w; }
    const look = pickOf(r, CUST_LOOKS.filter(l => l !== 'c_orange' || mon === 10)); q.push({ type: ty, look, desc: CUST_DESC[look], sec: stWantSec(r), r: r() }); }
  // the regulars drop in, more often as the store's name gets around
  for (const g of S.regs) if (r() < 0.08 + S.rep / 1000) q.splice(Math.floor(r() * (q.length + 1)), 0, { type: 'reg', reg: g.id, look: stReg(g.id).look, r: r() });
  for (const o of S.specials.filter(o => o.due === S.day)) q.splice(Math.floor(r() * (q.length + 1)), 0, { type: 'pickup', order: o, look: o.look, desc: o.desc, r: r() });
  if (S.credit > 0 && r() < 0.6) q.splice(Math.floor(r() * (q.length + 1)), 0, { type: 'credit', look: pickOf(r, CUST_LOOKS), sec: stWantSec(r), r: r() });
  if (ev && ev.kind === 'story') q.splice(Math.min(1, q.length), 0, { type: 'story', look: 'c_mom', r: r() });
  if (ev && ev.kind === 'club') q.push({ type: 'club', ev, look: 'c_cardigan', r: r() });
  const dev = stEventToday('day'); if (dev) q.splice(Math.floor(r() * q.length), 0, { type: 'event', ev: dev });
  return q;
}
function stWantSec(r) {   // which section a walk-in heads for: what the town reads, nudged by the window display
  const t = stDate(), m = t.getMonth(), w = { fantasy: 1, mystery: 1.4, romance: 1.2, scifi: 0.8, horror: m === 9 ? 1.6 : 0.8, classics: 1, kids: m === 11 ? 1.6 : 1, nonfiction: 1.1 };
  if (S.window) w[S.window] *= 1.5;
  let x = r() * Object.values(w).reduce((a, b) => a + b, 0); for (const k in w) { if (x < w[k]) return k; x -= w[k]; } return 'mystery';
}
function stReg(id) { return STORE_REGS.find(g => g.id === id); }
function storeOpenUp() {
  if (S.phase !== 'morning') return;
  S.phase = 'open'; S.room = 'checkout'; S.today.queue = stQueue(); S.today.i = 0;
  say([['', 'You flip the sign to OPEN. ' + (S.today.weather === 'snow' ? 'Snow drifts past the window.' : 'The bell over the door is quiet, for now.')]]);
}
function storeNext() {   // called when the counter is free: the next customer, or closing time
  const D = S.today;
  if (D.i >= D.queue.length) return storeClose();
  const c = D.queue[D.i++]; D.cur = c.type === 'event' ? null : c; D.custs += c.type === 'event' ? 0 : 1;
  D.clock = STORE.hours[0] + (STORE.hours[1] - STORE.hours[0]) * D.i / (D.queue.length + 1);
  ENC[c.type](c);
}
// a sale: takes books from a section (used or new), rings it up with the tax, and counts it
function stSell(k, n, opt) {
  const s = S.stock[k], o = opt || {}; let total = 0, cost = 0, sold = 0;
  for (let i = 0; i < n && s.u + s.n > 0; i++) {
    const used = o.kind ? o.kind === 'used' && s.u > 0 || s.n === 0 : (s.u > 0 && (s.n === 0 || Math.random() < s.u / (s.u + s.n)));
    if (used) { s.u--; total += o.price != null ? o.price : usedPrice(k); cost += s.uc; } else { s.n--; total += o.price != null ? o.price : newPrice(k); cost += s.nc; }
    sold++;
  }
  if (!sold) return 0;
  const tax = Math.round(total * STORE.tax), D = S.today, cr = o.credit ? Math.min(o.credit, total) : 0;
  const fee = Math.round((total + tax - cr) * STORE.cardFee * 0.8);   // most people pay by card
  S.cash += total + tax - cr - fee; S.tax += tax; S.credit -= cr; D.fees = (D.fees || 0) + fee;
  D.sales += total; D.tax += tax; D.cogs += cost; D.books += sold; D.buyers++; D.credit += cr;
  S.week.fees = (S.week.fees || 0) + fee; S.week.sales += total; S.week.cogs += cost; S.week.books += sold; S.weekly[k] = (S.weekly[k] || 0) + sold;
  D.ring = { amt: total + tax, t: frame };
  return total + tax;
}
const stRep = d => { S.rep = Math.max(0, Math.min(100, S.rep + d)); };
function stRoomLeft() { return STORE.cap - stockAll() - S.orders.reduce((a, o) => a + o.n, 0); }
const stWho = c => c.desc || 'A customer';
function askAs(sp, prompt, opts) { ask(prompt, opts); DLG.lines[0][0] = sp; }
function stBook(id) { return STORE_BOOKS.find(b => b[0] === id); }
function stBlurb(b) { return b[1] + ', ' + b[2] + (b[3] > 1000 ? ', ' + b[3] : '') + '. ' + b[6]; }
// hand-selling: three books from the section, pick one, read the back, recommend it
function stHandsell(c, sec, tags, line, after) {
  if (!shelfCount(sec)) return say([[stWho(c), line], ['', 'You check the ' + stSec(sec).name + ' shelf. It\'s empty.'], [stWho(c), 'Oh well. Maybe next time.']], () => { stRep(-0.5); after && after(0); });
  const pool = STORE_BOOKS.filter(b => b[4] === sec), r = srng((c.r * 1e9) | 0), picks = [];
  while (picks.length < Math.min(3, pool.length)) { const b = pickOf(r, pool); if (!picks.includes(b)) picks.push(b); }
  // make sure one of the three fits, most of the time, so it's a choice and not a guess
  if (!picks.some(b => tags.some(t => b[5].includes(t)))) { const fit = pool.filter(b => tags.some(t => b[5].includes(t))); if (fit.length && r() < 0.85) picks[Math.floor(r() * picks.length)] = pickOf(r, fit); }
  const choose = () => askAs(stWho(c), line, picks.map(b => ({ t: b[1], f: () => look(b) })).concat([{ t: 'Let them browse', f: () => { say([['', stWho(c) + ' wanders the shelves and leaves with nothing.']]); after && after(0); } }]));
  const look = b => ask(stBlurb(b), [{ t: 'Recommend it', f: () => rec(b) }, { t: 'Look at another', f: choose }]);
  const rec = b => {
    const hit = tags.filter(t => b[5].includes(t)).length, k = b[4];
    if (hit >= tags.length) { const amt = stSell(k, 1); const more = r() < 0.4 && shelfCount(k) ? stSell(k, 1) : 0; stRep(0.4);
      say([[stWho(c), pickOf(r, ['That\'s exactly it.', 'Oh, I\'ve always meant to read that.', 'Perfect. You know your stuff.'])], ['', 'Sold' + (more ? ', and they grab one more off the same shelf' : '') + '. ' + money(amt + more) + ' with tax.']], () => after && after(2)); }
    else if (hit) { const amt = stSell(k, 1); stRep(0.2); say([[stWho(c), 'Hm. Close enough. I\'ll try it.'], ['', 'Sold. ' + money(amt) + ' with tax.']], () => after && after(1)); }
    else say([[stWho(c), 'That\'s not really what I had in mind. Thanks, though.']], () => { stRep(-0.2); after && after(0); });
  };
  choose();
}
const ENC = {
  browse(c) {
    const k = c.sec, n = shelfCount(k);
    if (!n) { stRep(-0.5); return say([['', stWho(c) + ' heads for the ' + stSec(k).name + ' shelf and finds it empty.']]); }
    const pf = [1.15, 1, 0.8][S.usedPct], ch = (0.2 + 0.55 * Math.min(1, n / 50)) * pf + (S.window === k ? 0.08 : 0);
    if (c.r < ch) { const two = c.r < ch * 0.3 && n > 1, amt = stSell(k, two ? 2 : 1); say([['', stWho(c) + ' buys ' + (two ? 'two ' : 'a ') + stSec(k).name.toLowerCase() + (two ? ' books. ' : ' book. ') + money(amt) + ' with tax.']]); }
    else say([['', stWho(c) + ' looks through ' + stSec(k).name + ' for a while, then heads out.']]);
  },
  ask(c) { const a = pickOf(srng((c.r * 1e9) | 0), STORE_ASKS.filter(q => q[0] === c.sec)); stHandsell(c, c.sec, a[1], a[2]); },
  gift(c) {
    const r = srng((c.r * 1e9) | 0), a = pickOf(r, STORE_ASKS.filter(q => q[0] === c.sec)), whom = pickOf(r, ['my dad', 'my sister', 'my grandson', 'my boss', 'my neighbor', 'my wife', 'my husband', 'my best friend']);
    stHandsell(c, c.sec, a[1], 'It\'s a gift for ' + whom + ', who ' + a[3] + '.');
  },
  seek(c) {
    const r = srng((c.r * 1e9) | 0), b = pickOf(r, STORE_BOOKS.filter(x => x[4] === c.sec)), n = shelfCount(c.sec), have = r() < n / (n + 25);
    if (have) { const amt = stSell(c.sec, 1); return say([[stWho(c), 'Do you have ' + b[1] + '?'], ['', 'You do. It\'s right where it should be. ' + money(amt) + ' with tax.']], () => stRep(0.2)); }
    const cost = Math.round(newPrice(c.sec) * STORE.newCost);
    askAs(stWho(c), 'Do you have ' + b[1] + '? I can\'t find it.', [
      { t: 'Order it for them (' + money(cost) + ', here in ' + STORE.arrive + ' days)', f: () => {
        if (S.cash < cost) return say([['', 'Not enough cash to order it today.'], [stWho(c), 'That\'s all right. I\'ll check online.']]);
        S.cash -= cost; S.specials.push({ due: S.day + STORE.arrive, sec: c.sec, title: b[1], look: c.look, desc: c.desc, cost });
        stRep(0.3); say([[stWho(c), 'You can do that? Great. I\'ll come back for it.'], ['', 'Special order: ' + b[1] + ', due ' + stDay(S.day + STORE.arrive) + '.']]); } },
      { t: 'Suggest something like it', f: () => stHandsell(c, c.sec, b[5].slice(0, 2), 'If you don\'t have it, what\'s close?') },
      { t: 'Sorry, we don\'t have it', f: () => say([[stWho(c), 'Okay. Thanks anyway.']]) }]);
  },
  pickup(c) {
    const o = c.order; S.specials = S.specials.filter(x => x !== o);
    if (c.r < 0.1) { addNew(S, o.sec, 1); return say([['', 'The special order of ' + o.title + ' sits on the shelf by the register. Nobody comes for it today, so it goes on the shelf.']]); }
    addNew(S, o.sec, 1);
    const amt = stSell(o.sec, 1, { kind: 'new' }); stRep(0.2); say([[stWho(c), 'I\'m here for ' + o.title + '?'], ['', 'You hand it over. ' + money(amt) + ' with tax.']]);
  },
  credit(c) {
    const k = shelfCount(c.sec) ? c.sec : (STORE_SECS.find(s => shelfCount(s.k)) || {}).k; if (!k) return say([['', 'Someone with store credit finds the shelves bare.']]);
    const amt = stSell(k, 1, { credit: S.credit }); say([['', stWho(c) + ' pays for a ' + stSec(k).name.toLowerCase() + ' book with store credit from a trade-in. ' + (amt ? 'Only the tax is cash.' : '')]]);
  },
  sell(c) {
    const r = srng((c.r * 1e9) | 0), n = 6 + Math.floor(r() * 14), mix = {};
    for (let i = 0; i < n; i++) { const k = r() < 0.5 ? c.sec : pickOf(r, STORE_SECS).k; mix[k] = (mix[k] || 0) + 1; }
    const worn = r() < 0.3, value = Object.keys(mix).reduce((a, k) => a + mix[k] * usedPrice(k), 0) * (worn ? 0.5 : 1);
    const cashO = Math.round(value * STORE.cashOffer / 25) * 25, credO = Math.round(value * STORE.creditOffer / 25) * 25, wantsCredit = r() < 0.45;
    const main = Object.keys(mix).sort((a, b) => mix[b] - mix[a])[0]; let looked = false;
    if (n > stRoomLeft()) return say([[stWho(c), 'I\'ve got a box of books to sell. Interested?'], ['', 'The shelves are packed. You have to say no for now.']]);
    const take = (paid, credit) => { for (const k in mix) addUsed(S, k, mix[k], Math.round(paid / n)); stRep(0.2); };
    const offer = () => ask(stWho(c) + ' sets a box on the counter: ' + n + ' books, mostly ' + stSec(main).name.toLowerCase() + (looked ? (worn ? ', pretty worn.' : ', in good shape.') : '.') + ' What will you offer?', [
      { t: 'Cash: ' + money(cashO), f: () => {
        if (S.cash < cashO) return say([['', 'There isn\'t enough in the till for that.']], offer);
        if (r() < (wantsCredit ? 0.5 : 0.85)) { S.cash -= cashO; take(cashO); say([[stWho(c), 'Deal. Beats hauling them home.'], ['', 'The box goes to the shelves: ' + n + ' used books.']]); }
        else say([[stWho(c), 'Hm. I think I\'ll hang on to them.']]); } },
      { t: 'Store credit: ' + money(credO), f: () => {
        if (r() < (wantsCredit ? 0.92 : 0.55)) { S.credit += credO; take(0); say([[stWho(c), 'Credit\'s great. I\'ll be back to spend it.'], ['', 'The box goes to the shelves. They have ' + money(credO) + ' in store credit.']]); }
        else say([[stWho(c), 'I was hoping for cash, honestly. Never mind.']]); } },
      ...(looked ? [] : [{ t: 'Look through the box first', f: () => { looked = true;
        if (r() < 0.15) { const f = pickOf(r, [['a signed first printing', 6000], ['a 1950s cookbook in its dust jacket', 2500], ['a hardcover with an old bookplate', 3000], ['a first edition of a local history', 8000]]);
          S.finds.push({ name: f[0], value: f[1] }); say([['', 'At the bottom of the box: ' + f[0] + '. You keep a straight face. (It\'s in the basement now.)']], offer); }
        else say([['', 'You flip through. ' + (worn ? 'Cracked spines and water stains.' : 'Clean copies, no marks.')]], offer); } }]),
      { t: 'Pass on it', f: () => say([[stWho(c), 'No problem. Garage sale it is.']]) }]);
    offer();
  },
  haggle(c) {
    const k = STORE_SECS.find(s => S.stock[s.k].u > 2 && s.k === c.sec) ? c.sec : (STORE_SECS.find(s => S.stock[s.k].u > 2) || {}).k;
    if (!k) return ENC.browse(c);
    const full = usedPrice(k) * 3, low = Math.round(full * 0.75 / 25) * 25, mid = Math.round(full * 0.875 / 25) * 25;
    askAs(stWho(c), '(Three used ' + stSec(k).name.toLowerCase() + ' books, ' + money(full) + '.) Would you take ' + money(low) + ' for these?', [
      { t: 'Sure, ' + money(low), f: () => { const a = stSell(k, 3, { kind: 'used', price: Math.round(low / 3) }); stRep(0.2); say([[stWho(c), 'Thank you! I\'ll be back.'], ['', money(a) + ' with tax.']]); } },
      { t: 'Meet me in the middle: ' + money(mid), f: () => { if (c.r < 0.7) { const a = stSell(k, 3, { kind: 'used', price: Math.round(mid / 3) }); say([[stWho(c), 'Fair enough.'], ['', money(a) + ' with tax.']]); } else say([[stWho(c), 'Nah, I\'ll think about it.']]); } },
      { t: 'Sorry, the prices are firm', f: () => { if (c.r < 0.4) { const a = stSell(k, 3, { kind: 'used' }); say([[stWho(c), 'Worth a try. Okay.'], ['', money(a) + ' with tax.']]); } else say([[stWho(c), 'Okay. Maybe another time.']]); } }]);
  },
  kid(c) {
    c.desc = 'A kid with a crumpled five'; const k = 'kids', p = usedPrice(k);
    if (!S.stock.kids.u) return say([['A kid', 'Do you have any kids\' books for five dollars?'], ['', 'The used kids\' shelf is empty. The kid looks crushed.']], () => stRep(-0.5));
    if (p * (1 + STORE.tax) <= 500) { const a = stSell(k, 1, { kind: 'used' }); return say([['A kid', 'Do you have anything for five dollars?'], ['', 'You do. ' + money(a) + ' with tax, and change back.']], () => stRep(0.2)); }
    askAs('A kid', 'Do you have anything for five dollars? It\'s all I have.', [
      { t: 'Let them have one for five dollars', f: () => { const a = stSell(k, 1, { kind: 'used', price: Math.round(500 / (1 + STORE.tax)) }); stRep(0.5); say([['A kid', 'YES. Thank you!'], ['', 'They run out holding it over their head.']]); } },
      { t: 'Sorry, they cost more than that', f: () => say([['A kid', 'Oh. Okay.']]) }]);
  },
  reg(c) {
    const g = stReg(c.reg), me = S.regs.find(x => x.id === c.reg), nm = g.name[0].toUpperCase() + g.name.slice(1); c.desc = nm;
    if (me.trust >= STORE.trust && !me.real) return stHandsell(c, 'nonfiction', g.ask, g.q, hit => {
      if (hit >= 1) { me.real = true; S.reality++; stRep(2); say([['', nm + ' reads the first page right there at the counter.'], ['', 'A reader came back to the real world. (' + S.reality + ' so far)']]); } });
    const sec = me.real ? 'nonfiction' : g.sec, a = pickOf(srng((c.r * 1e9) | 0), STORE_ASKS.filter(q => q[0] === sec));
    stHandsell(c, sec, a[1], (me.real ? 'Me again. More true stuff? ' : me.trust ? 'Back again! ' : 'Hi. ') + a[2], hit => { if (hit && !me.real) me.trust++; });
  },
  story(c) {
    const kids = 3 + Math.floor(c.r * 5); let sold = 0;
    for (let i = 0; i < kids; i++) if (shelfCount('kids') && Math.random() < 0.6) { stSell('kids', 1); sold++; }
    stRep(1); say([['', 'Story hour. ' + kids + ' kids sit on the rug for the read-aloud, and parents browse.'], ['', sold + ' kids\' book' + (sold === 1 ? '' : 's') + ' go home with them.']]);
  },
  club(c) {
    const b = stBook(c.ev.book), members = 4 + Math.floor(S.rep / 25); let sold = 0;
    for (let i = 0; i < members; i++) if (S.stock[b[4]].n > 0 && Math.random() < 0.8) { stSell(b[4], 1, { kind: 'new' }); sold++; }
    stRep(1.5); say([['', 'Book club night. ' + members + ' people pull the chairs into a circle to talk about ' + b[1] + '.'],
      ['', sold ? sold + ' of them buy their copy here.' : 'Nobody could buy a copy here: there were no new ' + stSec(b[4]).name.toLowerCase() + ' books on the shelf.']]);
  },
  event(c) { stRunEvent(c.ev); },
};
function storeClose() {
  const D = S.today, gp = D.sales - D.cogs; S.phase = 'closed'; D.cur = null;
  S.hist.push({ day: S.day, sales: D.sales, cogs: D.cogs, books: D.books, custs: D.custs }); if (S.hist.length > 28) S.hist.shift();
  const lines = [['', '6:00. You flip the sign to CLOSED.'],
    ['', 'Customers: ' + D.custs + '. Books sold: ' + D.books + '. Sales: ' + money(D.sales) + ', plus ' + money(D.tax) + ' sales tax collected.'],
    ['', 'Those books cost you ' + money(D.cogs) + ', and card fees took ' + money(D.fees || 0) + '. The day made ' + money(gp - (D.fees || 0)) + '.' +
      ' Cash: ' + money(S.cash) + ', and ' + money(S.tax) + ' of it is the state\'s.']];
  if (S.rentOwed && S.late >= 2 && S.cash < S.rentOwed) return stShutDown(lines);
  say(lines, () => { S.day++; storeMorning(); });
}
function stShutDown(lines) {
  S.phase = 'over'; storeSave();
  say(lines.concat([['', 'Rent has gone unpaid two Mondays running. The Fig Tree has to close its doors for now.'],
    ['', 'You kept it open ' + (S.day + 1) + ' days. ' + S.reality + ' reader' + (S.reality === 1 ? '' : 's') + ' came back to the real world.'], ['', 'Choose STORE on the title screen to start again.']]),
    () => { localStorage.removeItem(STORE_KEY); S = null; setMode('title'); });
}

// ---------- the morning choices around the picture ----------
function storeOrder() {
  shopOpen('ORDER NEW BOOKS · ARRIVE IN ' + STORE.arrive + ' DAYS', STORE_SECS.map(s => ({ id: s.k, name: s.name + '  (' + S.stock[s.k].n + ' new on the shelf)', right: money(Math.round(s.list * STORE.newCost)) + ' each' })),
    { cashFn: () => S.cash, note: 'You pay 60% of the cover price (the usual 40% discount). Cover prices are placeholder averages.', hint: 'A: ORDER   B: DONE', doneLabel: 'Done ordering',
      onPick: (it) => { SHOP = null; const k = it.id, each = Math.round(stSec(k).list * STORE.newCost);
        ask('How many new ' + stSec(k).name.toLowerCase() + ' books? ' + money(each) + ' each, cover ' + money(stSec(k).list) + '.', [5, 10, 20].map(n => ({ t: n + ' books: ' + money(n * each), f: () => {
          if (S.cash < n * each) return say([['', 'Not enough cash for that order.']], storeOrder);
          if (n > stRoomLeft()) return say([['', 'The shelves can\'t hold that many. Room for ' + Math.max(0, stRoomLeft()) + ' more books.']], storeOrder);
          S.cash -= n * each; S.orders.push({ due: S.day + STORE.arrive, sec: k, n, cost: each }); storeSave();
          say([['', 'Ordered ' + n + ' new ' + stSec(k).name.toLowerCase() + ' books. They\'ll come ' + stDay(S.day + STORE.arrive) + '.']], storeOrder); } })).concat([{ t: 'Never mind', f: storeOrder }])); } });
}
function storeLots() {
  const L = S.today.lots || [];
  if (!L.length) return say([['', 'No boxes of books in today\'s classifieds. Check again tomorrow.']]);
  ask('Today\'s classifieds:', L.map((l, i) => ({ t: l.desc + ': ' + l.n + ' books, ' + money(l.price), f: () => {
    const mix = Object.keys(l.mix).sort((a, b) => l.mix[b] - l.mix[a]).map(k => l.mix[k] + ' ' + stSec(k).name.toLowerCase()).slice(0, 4).join(', ');
    ask(l.desc + '. About ' + l.n + ' books: ' + mix + '. ' + (l.worn ? 'Some are worn.' : 'They look cared for.') + ' Asking ' + money(l.price) + '.', [
      { t: 'Buy the lot', f: () => { if (S.cash < l.price) return say([['', 'Not enough cash.']]); if (l.n > stRoomLeft()) return say([['', 'No room on the shelves for that many. Sell some down first.']]);
        S.cash -= l.price; for (const k in l.mix) addUsed(S, k, Math.round(l.mix[k] * (l.worn ? 0.7 : 1)), Math.round(l.price / l.n));
        S.today.lots = L.filter(x => x !== l); storeSave(); say([['', 'You load the boxes into the van. ' + (l.worn ? 'A few are too far gone, but the rest go on the shelves.' : 'Everything goes on the shelves.')]]); } },
      { t: 'Pass' }]); } })).concat([{ t: 'Close the paper' }]));
}
function storeShelves() {
  const rows = STORE_SECS.map(s => ({ id: s.k, name: s.name + (s.cls ? ' (' + s.cls + ')' : ''), right: S.stock[s.k].u + ' used · ' + S.stock[s.k].n + ' new' }));
  rows.push({ id: '_price', name: 'Used prices: ' + Math.round(STORE.usedPct[S.usedPct] * 100) + '% of the cover', right: 'change' });
  shopOpen('THE SHELVES · ' + stockAll() + ' BOOKS', rows, { cashFn: () => S.cash, note: S.window ? 'In the front window: ' + stSec(S.window).name + '.' : 'Nothing special in the front window.', hint: 'A: CHOOSE   B: DONE', doneLabel: 'Done',
    onPick: it => { SHOP = null;
      if (it.id === '_price') return ask('What should used books cost, as a share of the cover price? Most used stores charge about half.', STORE.usedPct.map((p, i) => ({ t: Math.round(p * 100) + '%' + (i === 0 ? ': they move faster' : i === 2 ? ': more per book, fewer sold' : ''), f: () => { S.usedPct = i; storeSave(); storeShelves(); } })));
      const s = stSec(it.id), st = S.stock[it.id], opts = [];
      if (st.n) opts.push({ t: 'Send ' + st.n + ' new back to the distributor (' + money(Math.round(st.n * st.nc * STORE.returnBack)) + ')', f: () => { S.cash += Math.round(st.n * st.nc * STORE.returnBack); st.n = 0; storeSave(); say([['', 'Boxed up and sent back. The credit lands in your account.']], storeShelves); } });
      opts.push({ t: S.window === it.id ? 'Take it out of the front window' : 'Put it in the front window', f: () => { S.window = S.window === it.id ? null : it.id; storeSave(); storeShelves(); } }, { t: 'Back', f: storeShelves });
      ask(s.name + ': ' + st.u + ' used at ' + money(usedPrice(it.id)) + ', ' + st.n + ' new at ' + money(newPrice(it.id)) + '. Sold this week: ' + (S.weekly[it.id] || 0) + '.', opts); } });
}
const STEV = {
  club: { name: 'Book club night', help: 'Pick a book; the club buys new copies of it here. Order them in time.' },
  story: { name: 'Story hour', help: 'A read-aloud on the rug. Parents buy kids\' books.' },
  sale: { name: 'Used book sale day', help: 'More people come in. Used books are the draw.' },
};
function storeEvents() {
  const up = S.events.filter(e => e.day >= S.day);
  ask((up.length ? 'Coming up: ' + up.map(e => STEV[e.kind].name + ' ' + stDay(e.day)).join('; ') + '. ' : '') + 'Plan an event?',
    Object.keys(STEV).map(k => ({ t: STEV[k].name, f: () => stPlan(k) })).concat([{ t: 'Not now' }]));
}
function stPlan(k) {
  const days = []; for (let d = S.day + 2; d <= S.day + 8 && days.length < 5; d++) if (!S.events.some(e => e.day === d) && (k !== 'story' || stDate(d).getDay() === 6)) days.push(d);
  if (!days.length) return say([['', 'No open days for that this week.']]);
  const set = (d, book) => { S.events.push({ day: d, kind: k, book }); storeSave(); say([['', STEV[k].name + ' is on for ' + stDay(d) + '.' + (book ? ' Have new copies of ' + stBook(book)[1] + ' on the shelf (' + stSec(stBook(book)[4]).name + ').' : '')]]); };
  const when = book => ask(STEV[k].help + ' Which day?', days.map(d => ({ t: stDay(d), f: () => set(d, book) })).concat([{ t: 'Never mind' }]));
  if (k !== 'club') return when();
  const r = srng(S.seed + S.day), opts = []; while (opts.length < 4) { const b = pickOf(r, STORE_BOOKS); if (!opts.includes(b)) opts.push(b); }
  ask('What will the club read?', opts.map(b => ({ t: b[1], f: () => when(b[0]) })).concat([{ t: 'Never mind' }]));
}
function storeLedger() {
  const wk = S.week, gp = wk.sales - wk.cogs - (wk.fees || 0), last = S.hist[S.hist.length - 1];
  const rows = [['Cash in the till and the bank', S.cash], ['Sales tax you\'re holding for the state', S.tax], ['Store credit people still hold', S.credit],
    ['Last day\'s sales' + (last ? ' (' + stDay(last.day) + ')' : ''), last ? last.sales : 0], ['This week\'s sales', wk.sales], ['What those books cost you', wk.cogs], ['Gross profit this week', gp],
    ['Bills every Monday (rent, heat, insurance)', STORE.rent + STORE.utilities + STORE.other], ['Card fees this week', S.week.fees || 0], ['Rent you still owe', S.rentOwed], ['Orders on the way', S.orders.reduce((a, o) => a + o.n * o.cost, 0)]];
  const more = [['Books on the shelves', stockAll() + ' of ' + STORE.cap], ['Reputation', Math.round(S.rep) + ' / 100'], ['Readers back to the real world', S.reality + ''], ['Days open', S.day + '']];
  shopOpen('THE LEDGER · ' + stDay(), rows.map(([n, v]) => ({ id: n, name: n, right: money(v) })).concat(more.map(([n, v]) => ({ id: n, name: n, right: v }))),
    { cashFn: () => S.cash, note: 'Numbers are placeholders until Christian sets them. Sales tax: 5.5% here.', hint: 'B: CLOSE', doneLabel: 'Close the ledger', onPick: () => {} });
}
function storeRooms() {
  ask('Where to?', Object.keys(ST_ROOMS).map(k => ({ t: ST_ROOMS[k][0] + ST_ROOMS[k].slice(1).toLowerCase(), f: () => { S.room = k; stRoomHere(k); } })).concat([{ t: 'Stay here' }]));
}
function stRoomHere(k) {   // what you can do in each room
  const wk = Math.floor(S.day / 7);
  if (k === 'front') return ask('The front windows look out on Fifth Avenue. ' + (S.window ? stSec(S.window).name + ' books are in the display.' : 'The display is empty.'), [
    { t: 'Change the window display', f: () => ask('Feature which section? Walk-ins lean toward what\'s in the window.', STORE_SECS.map(s => ({ t: s.name, f: () => { S.window = s.k; storeSave(); say([['', 'You build a little tower of ' + s.name.toLowerCase() + ' books in the window.']]); } })).concat([{ t: 'Empty it', f: () => { S.window = null; storeSave(); } }])) }, { t: 'Back to work' }]);
  if (k === 'base') return ask('The basement: boxes, the furnace, and the stone goose.' + (S.finds.length ? ' Set aside: ' + S.finds.map(f => f.name).join(', ') + '.' : ''), [
    ...(S.finds.length ? [{ t: 'List a find online (sells in 3 days, 15% fees)', f: () => { const f = S.finds.shift(); S.listed.push({ name: f.name, value: Math.round(f.value * 0.85), due: S.day + 3 }); storeSave(); say([['', 'Listed: ' + f.name + '.']]); } }] : []),
    { t: 'Dig through the backstock', f: () => { if (S.dug === wk) return say([['', 'You already went through it this week.']]); S.dug = wk; const k2 = pickOf(Math.random, STORE_SECS).k, n = Math.min(3 + Math.floor(Math.random() * 6), Math.max(0, stRoomLeft())); addUsed(S, k2, n, 0); storeSave();
      say([['', 'Behind the furnace: a box you forgot. ' + n + ' ' + stSec(k2).name.toLowerCase() + ' books go upstairs to the shelves.']]); } }, { t: 'Back upstairs' }]);
  if (k === 'up') return ask('Upstairs: armchairs, reading lamps, the book club\'s table.', [
    { t: 'Straighten up the reading room', f: () => { if (S.tidy === wk) return say([['', 'It\'s still tidy from earlier this week.']]); S.tidy = wk; stRep(1); storeSave(); say([['', 'Cushions fluffed, mugs washed, a fresh stack on the table. It feels good up here.']]); } }, { t: 'Back down' }]);
  if (k === 'back') return say([['', 'The back of the store: tall shelves, the rug, the doorway to the back room.']]);
}
function storeQuit() { storeSave(); say([['', 'Saved. The Fig Tree will be here.']], () => { S = null; setMode('title'); }); }

// ---------- the screen: the picture in the middle, the choices around it ----------
const SB = [
  ['ORDER', 'Order new books from the distributor. They come in two days.', storeOrder],
  ['USED', 'Today\'s classifieds: boxes of used books for sale around town.', storeLots],
  ['SHELVES', 'What\'s on the shelves. Set used prices and the front window.', storeShelves],
  ['EVENTS', 'Plan a book club, a story hour or a used book sale day.', storeEvents],
  ['OPEN UP', 'Flip the sign and open for the day. Customers come to the counter.', storeOpenUp],
  ['LEDGER', 'Cash, sales, bills, and the sales tax you\'re holding.', storeLedger],
  ['ROOMS', 'Walk to another part of the store.', storeRooms],
  ['SAVE', 'Save the store and go back to the title screen.', storeQuit],
];
const SPX = 80, SPY = 22, SPW = 224, SPH = 144;
function sbRect(i) { const col = i < 4 ? 0 : 1, row = i % 4; return [col ? 312 : 4, 22 + row * 37, 68, 32]; }
MODES.store = {
  enter() { this.sel = 4; if (!S) S = storeLoad(); if (S && !S.today) storeMorning(); else if (S && S.phase === 'open') { S.phase = 'morning'; S.today.i = 0; S.today.queue = []; say([['', 'You\'re back at the counter. (A day in progress starts over in the morning.)']]); } },
  update() {
    if (!S) { setMode('title'); return; }
    if (DLG) {   // during the day, B picks the last choice (the polite no), so a customer is never left hanging
      if (S.phase === 'open' && DLG.opts && DLG.i >= DLG.lines.length - 1 && pressed.b) { delete pressed.b; DLG.sel = DLG.opts.length - 1; pressed.a = true; }
      return dlgUpdate();
    }
    if (SHOP) return shopUpdate();
    if (S.phase === 'open') return storeNext();
    if (S.phase === 'closed') { S.day++; return storeMorning(); }
    if (pressed.up) this.sel = (this.sel % 4 === 0 ? this.sel + 3 : this.sel - 1);
    if (pressed.down) this.sel = (this.sel % 4 === 3 ? this.sel - 3 : this.sel + 1);
    if (pressed.left || pressed.right) this.sel = (this.sel + 4) % 8;
    if (pressed.a) SB[this.sel][2]();
  },
  draw() {
    R(0, 0, SW, SH, '#0b0b1c');
    const D = S && S.today; if (!S || !D) return;
    // the header: the day, the weather, the time, the cash
    const hh = Math.floor(D.clock), mm = Math.round((D.clock - hh) * 60 / 15) * 15 % 60, clock = (hh > 12 ? hh - 12 : hh) + ':' + String(mm).padStart(2, '0') + (hh >= 12 ? ' PM' : ' AM');
    txt(stDay() + ' · ' + { snow: 'SNOW', rain: 'RAIN', cloudy: 'CLOUDY', clear: 'CLEAR' }[D.weather] + ' · ' + (S.phase === 'open' ? clock : S.phase === 'morning' ? 'BEFORE OPENING' : 'CLOSED'), 6, 6, '#c8d0f0', 'left', SMALL);
    txt('CASH ' + money(S.cash), SW - 6, 6, S.cash < 0 ? '#f08080' : '#ffd860', 'right', SMALL);
    // the picture
    win(SPX - 4, SPY - 4, SPW + 8, SPH + 8);
    ctx.save(); ctx.beginPath(); ctx.rect(SPX, SPY, SPW, SPH); ctx.clip();
    const room = S.phase === 'open' ? 'checkout' : S.room, img = ST_PIC[room];
    if (img && img.complete && img.naturalWidth) { ctx.drawImage(img, SPX, SPY, SPW, SPH); if (room === 'checkout') stCustomer(D); }
    else stPaint(room, D);
    ctx.restore();
    txt(ST_ROOMS[room], SPX + SPW / 2, SPY + SPH + 6, '#ffd860', 'center', SMALL);
    txt('SHELVES ' + stockAll() + '/' + STORE.cap + ' · REPUTATION ' + Math.round(S.rep) + ' · READERS BACK TO REALITY ' + S.reality, SW / 2, 196, '#8890b0', 'center', SMALL);
    if (S.rentOwed) txt('RENT OWED ' + money(S.rentOwed), SW / 2, 208, '#f08080', 'center', SMALL);
    // the choices around the picture
    const idle = S.phase === 'morning' && !DLG && !SHOP;
    SB.forEach((b, i) => { const [x, y, w, h] = sbRect(i), on = idle && i === MODES.store.sel;
      win(x, y, w, h); if (on) { R(x, y, w, 1, '#ffd860'); R(x, y + h - 1, w, 1, '#ffd860'); R(x, y, 1, h, '#ffd860'); R(x + w - 1, y, 1, h, '#ffd860'); }
      txt(b[0], x + w / 2, y + 12, !idle ? '#6a6e90' : on ? '#ffd860' : '#fff', 'center', SMALL); });
    // under the picture: what the selected choice does, or who's at the counter
    if (!DLG) { win(4, 224, SW - 8, 60);
      const help = S.phase === 'morning' ? SB[MODES.store.sel][1] : S.phase === 'open' ? 'The bell over the door rings.' : '';
      txt(S.phase === 'morning' ? SB[MODES.store.sel][0] : 'THE BLESSED FIG TREE', 12, 232, '#ffd860', 'left', SMALL);
      wrap(help, SW - 32, SMALL).slice(0, 3).forEach((l, i) => txt(l, 12, 246 + i * 10, '#fff', 'left', SMALL));
      txt('TODAY ' + D.custs + ' CUSTOMERS · ' + D.books + ' BOOKS · ' + money(D.sales), SW - 12, 272, '#8890b0', 'right', SMALL); }
    else dlgDraw();
    if (SHOP) shopDraw();
  }
};

// ---------- the pictures: painted stand-ins after the one photo from inside (mint walls, pale wood shelves, honey floor) ----------
const P_ = (c, x, y, w, h) => F(c, SPX + x, SPY + y, w, h);
const SPINE = ['#c83a3a', '#3a5aa8', '#e8c040', '#2a8a5a', '#f0ece0', '#8a3a8a', '#e87a2a', '#1a1a22', '#6ab0d0', '#a85a3a', '#d8d0b0', '#4a4a5a'];
function stShelf(x, y, w, h, rows, seed, wood) {   // a pale-wood bookcase with spines
  wood = wood || '#d9b27c'; P_('#a8834e', x - 1, y - 1, w + 2, h + 2); P_(wood, x, y, w, h);
  const rh = Math.floor((h - 2) / rows);
  for (let r = 0; r < rows; r++) { const yy = y + 2 + r * rh; P_('#5a4630', x + 2, yy, w - 4, rh - 3);
    let xx = x + 3, i = 0; while (xx < x + w - 4) { const hs = hash(seed + i, r), bw = 2 + hs % 3, bh = rh - 4 - (hs >> 4) % 4; if (xx + bw > x + w - 3) break;
      P_(SPINE[(hs >> 8) % SPINE.length], xx, yy + rh - 3 - bh, bw, bh); xx += bw + ((hs >> 12) % 5 === 0 ? 1 : 0); i++; }
    P_(wood, x, yy + rh - 3, w, 3); P_('#b8925e', x, yy + rh - 1, w, 1); }
}
function stArt(x, y, w, h, seed) { P_('#1a1418', x, y, w, h); P_('#f0ece0', x + 1, y + 1, w - 2, h - 2); const c = SPINE[hash(seed, 7) % SPINE.length]; P_(c, x + 2, y + 2, w - 4, h - 4); P_(SPINE[hash(seed, 9) % SPINE.length], x + 3, y + 3 + (h - 6) / 2, w - 6, (h - 6) / 2); }
function stWindow(x, y, w, h, D) {   // a front window on Fifth Avenue: sky by the hour and weather, the buildings across
  const late = S.phase === 'closed', sky = late ? '#1a2448' : { snow: '#c8d0dc', rain: '#8a96a8', cloudy: '#aab4c4', clear: '#8ac0f0' }[D.weather];
  P_('#3a2a1e', x - 2, y - 2, w + 4, h + 4); P_(sky, x, y, w, h);
  P_(late ? '#2a2a3a' : '#a8705a', x, y + h * 0.45, w * 0.55, h * 0.55); P_(late ? '#24243a' : '#c8b48a', x + w * 0.55, y + h * 0.35, w * 0.45, h * 0.65);
  for (let i = 0; i < 4; i++) P_(late ? '#f0d070' : '#e8eef4', x + 3 + i * (w * 0.13), y + h * 0.55, 3, 4);
  P_('#5a5c60', x, y + h - 4, w, 4);
  if (D.weather === 'snow') for (let i = 0; i < 14; i++) { const fx = (hash(i, 3) + frame * (1 + i % 2) / 3) % w, fy = (hash(i, 5) + frame * (1 + i % 3) / 2) % h; P_('#fff', x + fx, y + fy, 1, 1); }
  if (D.weather === 'rain' && !late) for (let i = 0; i < 10; i++) { const fx = hash(i, 4) % w, fy = (hash(i, 6) + frame * 3) % h; P_('#d8e4f0', x + fx, y + fy, 1, 3); }
  P_('#3a2a1e', x + w / 2 - 1, y, 2, h); P_('rgba(255,255,255,.18)', x + 2, y + 2, 3, h - 6);
}
function stFig(x, y) {   // the store's own fig tree in its pot, by the window
  P_('#8a4a2a', x - 7, y - 10, 14, 10); P_('#a85a34', x - 8, y - 11, 16, 2); P_('#5a3a22', x - 1, y - 30, 2, 20);
  for (const [a, b, s] of [[-8, -34, 7], [2, -40, 8], [-3, -46, 6], [5, -30, 6], [-10, -26, 5]]) { P_('#2e6a32', x + a, y + b, s + 3, s); P_('#3e8a40', x + a + 1, y + b + 1, s, s - 2); }
}
function stPaint(room, D) {
  if (room === 'checkout') {
    P_('#e9e6dc', 0, 0, SPW, 12); for (const lx of [40, 112, 184]) { P_('#fffbe8', lx - 4, 4, 8, 3); P_('rgba(255,250,220,.12)', lx - 14, 7, 28, 30); }
    P_('#a9c9b4', 0, 12, SPW, 76); P_('#97b9a3', 0, 84, SPW, 4);
    stArt(8, 16, 12, 14, 1); stArt(26, 18, 10, 12, 2); stArt(42, 16, 12, 14, 3);
    stShelf(4, 34, 52, 52, 4, 11); stShelf(58, 30, 44, 56, 5, 23);
    stWindow(118, 22, 44, 58, D); stWindow(170, 22, 44, 58, D);
    P_('#c8955a', 0, 88, SPW, 30); for (let y = 92; y < 118; y += 5) P_('#b9844c', 0, y, SPW, 1); for (let i = 0; i < 12; i++) P_('#b07a42', (hash(i, 2) % SPW), 88 + (i % 5) * 5, 1, 5);
    P_('#7a5a3a', 6, 92, 50, 3); P_('#6a4a2e', 8, 95, 3, 14); P_('#6a4a2e', 51, 95, 3, 14); for (let i = 0; i < 8; i++) P_(SPINE[i * 3 % SPINE.length], 9 + i * 5, 86, 4, 6);   // a display table
    stFig(204, 110);
    stCustomer(D);
    // the counter, in front of you
    P_('#5c3820', 0, 116, SPW, 28); P_('#7a4a28', 0, 112, SPW, 6); P_('#8a5a33', 0, 112, SPW, 1);
    for (let x = 8; x < SPW; x += 36) P_('#4e2f1a', x, 120, 1, 22);
    P_('#26262c', 150, 94, 40, 18); P_('#3a3a44', 152, 96, 36, 9);   // the register
    const ring = D.ring && frame - D.ring.t < 120; P_(ring ? '#9ad07a' : '#4a6a4a', 154, 98, 32, 5);
    if (ring) txt(money(D.ring.amt), SPX + 170, SPY + 98, '#1a2a1a', 'center', SMALL);
    P_('#c8c4bc', 154, 106, 32, 3);
    for (let i = 0; i < 4; i++) P_(SPINE[(i * 5) % SPINE.length], 22, 104 - i * 3, 22 - i, 3);   // a stack of holds
    P_('#c8a040', 64, 108, 6, 4); P_('#e8c060', 66, 106, 2, 2);   // the bell
    return;
  }
  if (room === 'front') {
    P_('#a9c9b4', 0, 0, SPW, 100); stWindow(8, 10, 64, 80, D); stWindow(80, 10, 64, 80, D); stWindow(152, 10, 64, 80, D);
    P_('#c8955a', 0, 100, SPW, 44); for (let y = 104; y < SPH; y += 6) P_('#b9844c', 0, y, SPW, 1);
    stFig(40, 128);
    if (S.window) { const c = stSec(S.window).color; for (let i = 0; i < 6; i++) P_(c, 92 + (i % 3) * 10, 84 - Math.floor(i / 3) * 8, 9, 7); }
    for (const sx of [150, 190]) { P_('#2a2a30', sx, 98, 3, 34); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) P_(SPINE[(i + j * 4) % SPINE.length], sx - 10 + j * 8, 70 + i * 7, 7, 6); }   // the spinner racks
    return;
  }
  if (room === 'back') {
    P_('#e9e6dc', 0, 0, SPW, 10); P_('#a9c9b4', 0, 10, SPW, 92);
    for (let i = 0; i < 5; i++) stArt(8 + i * 16, 14 + (i % 2) * 3, 12, 14, 30 + i);
    stShelf(4, 34, 60, 66, 5, 41); stShelf(160, 34, 60, 66, 5, 53);
    P_('#5a3a22', 92, 30, 40, 72); P_('#8a5a33', 95, 33, 34, 69); P_('#c8955a', 98, 36, 28, 66);   // the doorway to the back room
    P_('#c83a3a', 100, 22, 24, 7); txt('EXIT', SPX + 112, SPY + 23, '#fff', 'center', SMALL);
    P_('#c8955a', 0, 102, SPW, 42); for (let y = 106; y < SPH; y += 6) P_('#b9844c', 0, y, SPW, 1);
    P_('#3a3e5a', 70, 112, 84, 24); P_('#2e3248', 74, 116, 76, 16);   // the rug
    return;
  }
  if (room === 'up') {
    P_('#e9e6dc', 0, 0, SPW, 12); P_('#b8c8b0', 0, 12, SPW, 88);
    stWindow(150, 20, 56, 60, D); stShelf(8, 26, 70, 74, 5, 61);
    P_('#7a6a5a', 0, 100, SPW, 44);
    for (const [ax, c] of [[92, '#8a3a3a'], [180, '#3a5a8a']]) { P_(c, ax - 14, 104, 28, 24); P_(c, ax - 16, 96, 6, 32); P_(c, ax + 10, 96, 6, 32); P_('rgba(0,0,0,.2)', ax - 12, 108, 24, 6); }   // armchairs
    P_('#5a3a22', 120, 112, 36, 4); P_('#5a3a22', 124, 116, 3, 16); P_('#5a3a22', 150, 116, 3, 16); P_('#e8e4dc', 128, 108, 8, 4);   // a table and a mug
    P_('#c8a040', 100, 60, 2, 40); P_('#f0e0a0', 94, 52, 14, 9);   // a floor lamp
    return;
  }
  // the basement
  P_('#6a6862', 0, 0, SPW, 108); for (let y = 0; y < 108; y += 9) for (let x = (y / 9) % 2 ? -10 : 0; x < SPW; x += 20) { P_('#7a7870', x + 1, y + 1, 18, 7); }
  P_('#f0e8b0', 110, 4, 4, 5); P_('rgba(255,240,180,.08)', 70, 9, 84, 60);   // a bare bulb
  P_('#4a4844', 0, 108, SPW, 36);
  P_('#3a3a3e', 168, 40, 44, 68); P_('#2a2a2e', 172, 44, 36, 30); P_(frame % 40 < 20 ? '#e86a2a' : '#c84a1a', 182, 92, 16, 4);   // the furnace
  for (const [bx, by] of [[10, 86], [34, 86], [22, 66], [60, 90], [84, 90], [72, 72], [120, 96]]) { P_('#a8885a', bx, by, 22, 20); P_('#c8a878', bx, by, 22, 3); P_('#8a6a42', bx + 10, by, 2, 20); }   // boxes of books
  P_('rgba(0,0,0,.25)', 136, 128, 28, 3); P_('#e8e6e0', 138, 114, 22, 14); P_('#d4d2cc', 140, 124, 18, 4); P_('#e8e6e0', 152, 100, 7, 16); P_('#e8e6e0', 153, 96, 8, 6); P_('#e88a2a', 161, 98, 5, 2); P_('#1a1418', 156, 98, 1, 1); P_('#e88a2a', 144, 128, 3, 2); P_('#e88a2a', 152, 128, 3, 2);   // the stone goose
}
function stCustomer(D) {   // whoever is at the counter, waist up behind it
  const c = D && D.cur; if (!c || !c.look) return;
  ctx.save(); ctx.translate(SPX + 104, SPY + 134); ctx.scale(1.6, 1.6); drawFolk(c.look, 0, 0, frame); ctx.restore();
}
// the customers: made-up townsfolk drawn in code
Object.assign(FOLKS, {
  c_parka: { skin: '#e8c0a0', hair: '#6a4a2a', shirt: '#4a6a8a', shirt2: '#3a5a7a', pants: '#2a2a34', shoes: '#3a2a20' },
  c_orange: { skin: '#e2b48e', hair: '#5a4030', shirt: '#f06a10', shirt2: '#d85a08', pants: '#4a4a3a', shoes: '#3a2a1a', hat: '#f06a10', extra: 'beanie' },
  c_student: { skin: '#c99878', hair: '#1e1814', shirt: '#7a2a3a', shirt2: '#5a1a2a', pants: '#3a4a6a', shoes: '#e8e8ea', extra: 'headset' },
  c_grandma: { skin: '#f0d0b8', hair: '#d8d8dc', shirt: '#8a6aa8', shirt2: '#e8e0f0', pants: '#4a4a5a', shoes: '#2a2a2e' },
  c_flannel: { skin: '#e2b48e', hair: '#8a5a2a', shirt: '#a82a2a', shirt2: '#1e1a1a', pants: '#3a4a6a', shoes: '#5a3a24', extra: 'cap' },
  c_suit: { skin: '#a87458', hair: '#1a1418', shirt: '#3a3e4a', shirt2: '#e8e8f0', pants: '#2a2c34', shoes: '#141416' },
  c_mom: { skin: '#e8c4a4', hair: '#a8683a', shirt: '#4a8a7a', shirt2: '#e8e0d0', pants: '#2a3a5a', shoes: '#e8e8ea' },
  c_dad: { skin: '#d9a77c', hair: '#3a2a20', shirt: '#5a6a3a', shirt2: '#4a5a2e', pants: '#4a4a52', shoes: '#3a2a1a', extra: 'cap' },
  c_beanie: { skin: '#ecc19c', hair: '#3a2a20', shirt: '#2a4a3a', shirt2: '#1e3a2e', pants: '#2a2a34', shoes: '#5a3a24', hat: '#c83a3a', extra: 'beanie' },
  c_cardigan: { skin: '#f0d0b8', hair: '#b8b8c0', shirt: '#8a6a3a', shirt2: '#e8e0c8', pants: '#5a4a3a', shoes: '#3a2a1a' },
  c_mechanic: { skin: '#e2b48e', hair: '#2a2018', shirt: '#2a3a5a', shirt2: '#1e2a44', pants: '#2a2a30', shoes: '#141416', extra: 'cap' },
  c_scrubs: { skin: '#c48a6a', hair: '#1e1814', shirt: '#4aa8a8', shirt2: '#3a9898', pants: '#4aa8a8', shoes: '#e8e8ea' },
  c_hoodie: { skin: '#e8c0a0', hair: '#1a1a1e', shirt: '#2a2a30', shirt2: '#3a3a44', pants: '#2a3a5a', shoes: '#e8e8ea', extra: 'headset' },
  c_trucker: { skin: '#d8a880', hair: '#6a5a4a', shirt: '#5a3a2a', shirt2: '#e8d8b0', pants: '#3a4a6a', shoes: '#3a2a1a', extra: 'cap' },
});

// ---------- the mouse and the touch screen: tap a choice ----------
cv.addEventListener('pointerdown', e => {
  if (mode !== 'store' || !S) return;
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * SW, y = (e.clientY - r.top) / r.height * SH;
  if (SHOP) { const i = Math.floor((y - 8 - 22 + 3) / 14); if (x > 8 && x < SW - 8 && i >= 0 && i < 9 && SHOP.top + i < SHOP.items.length) { SHOP.sel = SHOP.top + i; pressed.a = true; } return; }
  if (DLG) { const D = DLG;
    if (D.opts && D.i >= D.lines.length - 1) { ctx.font = SMALL; const ow = Math.min(SW - 8, Math.max(164, 20 + Math.max(...D.opts.map(o => ctx.measureText('▶ ' + o.t).width)))), h = D.opts.length * 12 + 10, oy = SH - 64 - h - 4;
      const i = Math.floor((y - oy - 4) / 12); if (x > SW - 4 - ow && i >= 0 && i < D.opts.length) { D.sel = i; pressed.a = true; } else delete pressed.a; }
    else pressed.a = true;
    return; }
  for (let i = 0; i < 8; i++) { const [bx, by, bw, bh] = sbRect(i); if (x >= bx && x < bx + bw && y >= by && y < by + bh) { MODES.store.sel = i; pressed.a = true; return; } }
  delete pressed.a;
});
