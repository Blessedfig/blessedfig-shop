"use strict";
// =====================================================================
//  MONEY, THE BAG AND SHOP COUNTERS (Nov 14). Stand-ins for Christian to tune: everyone starts with $25.00 of pocket money;
//  cash is kept in cents. What you buy goes in the bag (I opens it). Food can be eaten; each item has a buff slot that is
//  empty until Christian designs the temporary buffs. Shop lists scroll FF6-style: up/down choose, A buys, B leaves.
//  Menus that copy a real place's own menu say where the prices came from and when.
// =====================================================================
const START_CASH = 2500;   // placeholder pocket money, in cents
KEYMAP.KeyI = 'bag';
const ITEMS = {};          // id -> { name, price (cents), kind: 'food'|'curio'|'goods'|'drink', from, buff: null, note }
function itemDef(id, d) { ITEMS[id] = Object.assign({ buff: null, kind: 'food' }, d); return id; }
function cash() { if (!G) return 0; if (G.cash == null) G.cash = START_CASH; return G.cash; }
function money(c) { const neg = c < 0; c = Math.abs(Math.round(c)); return (neg ? '-$' : '$') + Math.floor(c / 100) + '.' + String(c % 100).padStart(2, '0'); }
function bagAdd(id, n) { G.bag = G.bag || {}; G.bag[id] = (G.bag[id] || 0) + (n || 1); }
function bagTake(id, n) { if (!G.bag || !G.bag[id]) return false; G.bag[id] -= (n || 1); if (G.bag[id] <= 0) delete G.bag[id]; return true; }
function pay(c) { if (cash() < c) return false; G.cash -= c; return true; }
function earn(c) { cash(); G.cash += c; }

// ---------- the shop list ----------
let SHOP = null;   // { title, note, items:[{id, name, price}], sel, top, onBuy, after }
function shopOpen(title, items, opts) {
  const o = opts || {};   // every list ends in a row that closes it, so nobody has to know that B leaves (Christian, Nov 14)
  if (!o.noDone) items = items.concat([{ id: null, name: o.doneLabel || 'Done shopping', done: true }]);
  SHOP = Object.assign({ title, sel: 0, top: 0, note: '' }, o, { items }); cash(); }
function shopUpdate() {
  const S = SHOP, n = S.items.length, rows = 9;
  if (S.msg) { if (pressed.a || pressed.b) S.msg = null; return; }
  if (pressed.up) S.sel = (S.sel + n - 1) % n;
  if (pressed.down) S.sel = (S.sel + 1) % n;
  if (S.sel < S.top) S.top = S.sel; if (S.sel >= S.top + rows) S.top = S.sel - rows + 1;
  if (pressed.b) { const a = S.after; SHOP = null; saveGame(); if (a) a(); return; }
  if (pressed.a) {
    const it = S.items[S.sel];
    if (it.done) { const a = S.after; SHOP = null; saveGame(); if (a) a(); return; }
    if (S.onPick) { S.onPick(it, S); return; }
    if (!pay(it.price)) { S.msg = 'Not enough cash. You have ' + money(cash()) + '.'; return; }
    bagAdd(it.id); S.msg = 'Bought: ' + it.name + ' (' + money(it.price) + '). It\'s in your bag.'; saveGame();
  }
}
function shopDraw() {
  const S = SHOP, rows = 9, x = 8, y = 8, w = SW - 16, h = 26 + rows * 14 + 31;
  win(x, y, w, h); txt(S.title, x + 8, y + 6, '#ffd860', 'left', SMALL); txt('CASH ' + money(S.cashFn ? S.cashFn() : cash()), x + w - 8, y + 6, '#fff', 'right', SMALL);
  for (let i = 0; i < rows && S.top + i < S.items.length; i++) {
    const it = S.items[S.top + i], yy = y + 22 + i * 14, on = S.top + i === S.sel;
    txt((on ? '▶ ' : '  ') + it.name, x + 8, yy, on ? '#ffd860' : '#fff', 'left', SMALL);
    if (it.right != null || it.price != null) txt(it.right != null ? it.right : money(it.price), x + w - 8, yy, on ? '#ffd860' : '#c8d0f0', 'right', SMALL);
  }
  if (S.items.length > rows) { const k = S.top / Math.max(1, S.items.length - rows); F('#c8d0f0', x + w - 4, y + 22 + Math.round(k * (rows * 14 - 16)), 2, 16); }
  // the footer: a message after buying, or the place's note and then the buttons
  ctx.font = SMALL; const hint = S.hint || 'A: BUY   B: DONE';
  const lines = S.msg ? wrap(S.msg, w - 16).slice(0, 3) : (S.note ? wrap(S.note, w - 16).slice(0, 2) : []).concat([hint]);
  lines.forEach((l, i) => txt(l, x + 8, y + h - 9 * lines.length - 2 + i * 9, S.msg ? '#a8f0a8' : !S.msg && i === lines.length - 1 ? '#8890b0' : '#c8d0f0', 'left', SMALL));
}
// a menu by sections: pick a section, then the list
function menuOpen(place, menu, note) {
  const secs = Object.keys(menu);
  const go = s => shopOpen(place.toUpperCase() + ' · ' + s.toUpperCase(), menu[s].map(([id, name, c, k, note]) => (itemDef(id, { name, price: c, kind: k || (/drink|shake|tea|coffee|boba|smoothie|juice/i.test(s) ? 'drink' : (menu.__kind || 'food')), from: place, note }), { id, name, price: c })),
    { note, doneLabel: list.length > 1 ? 'Back to the menu' : 'Done ordering', after: list.length > 1 ? () => menuOpen(place, menu, note) : null });
  const list = secs.filter(s => !s.startsWith('__'));
  if (list.length === 1) return go(list[0]);
  // a long menu: sections in pages of seven
  const page = p => { const sl = list.slice(p * 7, p * 7 + 7), o = sl.map(s => ({ t: s, f: () => go(s) }));
    if (list.length > 7) o.push({ t: p * 7 + 7 < list.length ? 'More...' : 'Back to the top', f: () => page(p * 7 + 7 < list.length ? p + 1 : 0) });
    o.push({ t: 'Done' }); ask(place + ': what would you like? You have ' + money(cash()) + '.', o); };
  page(0);
}
// ---------- the bag ----------
let BAG = null;
function bagOpen() {
  const ids = Object.keys(G.bag || {}).filter(id => ITEMS[id] || G.bagNames && G.bagNames[id]);
  if (!ids.length) return say([['', 'Your bag is empty. Cash: ' + money(cash()) + '.']]);
  shopOpen('YOUR BAG', ids.map(id => ({ id, name: (ITEMS[id] ? ITEMS[id].name : G.bagNames[id]), right: 'x' + G.bag[id] })),
    { hint: 'A: USE OR LOOK   B: CLOSE', doneLabel: 'Close the bag', onPick: (it, S) => { SHOP = null; bagUse(it.id); } });
}
function bagUse(id) {
  const d = ITEMS[id] || { name: id, kind: 'goods' };
  if (d.kind === 'food' || d.kind === 'drink') return ask(d.name + (d.from ? ', from ' + d.from : '') + '.', [
    { t: d.kind === 'drink' ? 'Drink it' : 'Eat it', f: () => { bagTake(id); G.ate = (G.ate || 0) + 1; saveGame();
      say([['', (d.kind === 'drink' ? 'You drink the ' : 'You eat the ') + d.name.toLowerCase() + '. It hits the spot.'], ['', '(In the story, food heals: use it from the bag on someone in the party.)']], bagOpen); } },
    { t: 'Keep it', f: bagOpen }]);
  say([['', d.name + (d.note ? '. ' + d.note : '.')]], bagOpen);
}
// shop and bag input and drawing ride on the inside and walk modes
for (const m of ['inside', 'walk']) {
  const U = MODES[m].update, D = MODES[m].draw;
  MODES[m].update = function () { if (SHOP) return shopUpdate(); if (!DLG && pressed.bag && P.t === 0) return bagOpen(); return U.call(this); };
  MODES[m].draw = function () { D.call(this); if (SHOP) shopDraw(); };
}
