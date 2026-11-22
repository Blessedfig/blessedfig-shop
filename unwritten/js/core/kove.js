"use strict";
// The Kove, the coffee shop that shares 610 Century Ave with Gina's Pizzeria (Christian, Nov 21: "we have to do something special with
// the Kove ... a story or quest hub"). This file sets the place up as a hub: a warm café, a barista and a corkboard on the back wall.
// What happens here is Christian's story to write; KOVE_STORY is the hook for it:
//   KOVE_STORY.onEnter = (Fm) => { ... }     runs each time the player walks in (return true to skip the usual welcome)
//   KOVE_STORY.board.push('A note ...')       adds a note to the corkboard
//   KOVE_STORY.barista = () => { ... }        replaces the barista's usual talk
var KOVE_STORY = window.KOVE_STORY || { onEnter: null, board: [], barista: null };
// the menu boards over the counter read DRINKS (coffee, tea and alternatives, refreshers, smoothies, hot chocolate, local favorites),
// FOOD (breakfast, bagels, local favorites, sides) and BAKERY (scones, cookies, muffins, brownies, donuts, cinnamon rolls) — Christian's
// photos, Nov 21. Item names are generic and prices are placeholders, as everywhere else in town.
MENUS.kove = { 'Drinks': [['kv_drip', 'Brewed coffee', 300], ['kv_latte', 'Latte', 500], ['kv_capp', 'Cappuccino', 475], ['kv_mocha', 'Mocha', 525], ['kv_cold', 'Cold brew', 450], ['kv_chai', 'Chai latte', 500], ['kv_refr', 'Refresher', 475], ['kv_smoo', 'Smoothie', 600], ['kv_hotc', 'Hot chocolate', 400]],
  'Food': [['kv_bfast', 'Breakfast sandwich', 700], ['kv_bagel', 'Bagel with cream cheese', 400]],
  'Bakery': [['kv_scone', 'Scone', 350], ['kv_cookie', 'Cookie', 250], ['kv_muffin', 'Muffin', 325], ['kv_brownie', 'Brownie', 325], ['kv_donut', 'Donut', 250], ['kv_cinn', 'Cinnamon roll', 425]] };
// The room, from Christian's three photos (Nov 21): cream floor tile under a drop ceiling; a sage-green shiplap counter with a stone top
// across the back, the espresso machine and brewer behind it, three brown menu boards above and the shop's sign beside them, the bakery
// case at the counter's end and a black mat in front; walnut tables (square and three-cornered) with grey-cushioned chairs; olive
// armchairs, a globe floor lamp and big plants in the window corner; a wooden bar ledge along the front window beside the glass door;
// a corkboard, two restroom doors and a drinks cooler along the side wall.
FOLKS.kove_reg = { skin: '#e2b48e', hair: '#6a4a2a', shirt: '#c8b090', shirt2: '#a89070', pants: '#3a4a6a', shoes: '#e8e4dc' };
FOLKS.kove_reg2 = { skin: '#c99878', hair: '#2a1e18', shirt: '#4e5a34', shirt2: '#3e4a28', pants: '#26262c', shoes: '#5a3a24', hat: '#e8e4dc' };
ROOM_STYLE.kove = [['tile', '#ece6da', '#ded6c6'], ['#ddd6ca', '#7f8f74']];
KIND_ZONE.kove = 'CAFÉ';
const KV_SOLID = ['kv_ctr', 'kv_case', 'kv_esp', 'kv_urn', 'kv_cups', 'kv_bk', 'kv_menu', 'kv_sign', 'kv_tab', 'kv_tri', 'kv_ch', 'kv_arm', 'kv_lamp', 'kv_plant', 'kv_high', 'kv_ledge', 'kv_rr', 'kv_cool', 'kv_board', 'kv_hoop'];
ROOM_WALK.add('kv_mat');
ROOM_HOOK['The Kove'] = { kind: 'kove', title: 'THE KOVE',
  line: 'The Kove. Fresh coffee, the bakery case, and sun through the big front windows.',
  layout: (F, c) => {
    const R = F.R, { fx0, fx1, fy0, fy1 } = c, Wd = fx1 - fx0 + 1;
    const ok = (u, v) => R[v] && R[v][u] !== undefined && R[v][u] !== 'W' && R[v][u] !== ' ' && R[v][u] !== 'e' && !/^D/.test(R[v][u]);
    for (let v = fy0; v <= fy1; v++) for (let u = fx0; u <= fx1; u++) if (ok(u, v)) R[v][u] = '.';
    F.npcs.length = 0;
    const put = (u, v, t) => { if (ok(u, v)) R[v][u] = t; };
    // behind the counter (staff side): back bar along the wall, the counter two rows out
    const ctrV = fy0 + 2; F.backFrom = ctrV;
    for (let u = fx0; u <= fx1; u++) { put(u, fy0, 'kv_bk'); put(u, fy0 + 1, 'kv_bk'); }
    const mid = (fx0 + fx1) >> 1;
    put(fx0 + 1, fy0, 'kv_esp'); put(fx0 + 2, fy0, 'kv_urn'); put(fx0 + 3, fy0, 'kv_cups');
    for (const [i, u] of [[0, mid - 3], [1, mid - 1], [2, mid + 1]]) put(u, fy0, 'kv_menu');
    put(mid + 3, fy0, 'kv_sign');
    for (let u = fx0; u <= fx1 - 1; u++) put(u, ctrV, u >= fx1 - 3 ? 'kv_case' : 'kv_ctr');
    F.npcs.push({ x: mid, y: fy0 + 1, folk: 'server', name: 'Barista' }); R[fy0 + 1][mid] = 'N';
    for (let u = mid - 2; u <= mid + 2; u++) put(u, ctrV + 1, 'kv_mat');
    // the side wall (east): corkboard, two restroom doors, the drinks cooler
    const sv = ctrV + 3; put(fx1, sv, 'kv_cool'); put(fx1, sv + 2, 'kv_rr'); put(fx1, sv + 4, 'kv_rr'); put(fx1, sv + 6, 'kv_board'); put(fx1, sv + 7, 'kv_board');
    // the window corner (west): olive armchairs, the globe lamp, plants, a high-top; pressed-flower hoops on the wall
    const wv = ctrV + 3; put(fx0, wv, 'kv_plant'); put(fx0, wv + 1, 'kv_arm'); put(fx0, wv + 2, 'kv_lamp'); put(fx0, wv + 3, 'kv_arm'); put(fx0 + 1, wv + 5, 'kv_high'); put(fx0, wv + 5, 'kv_plant'); put(fx0, wv + 4, 'kv_hoop');
    // tables: three groups of walnut tables with chairs, and a three-cornered table near the door
    const T4 = (u, v) => { put(u, v, 'kv_tab'); put(u + 1, v, 'kv_tab'); put(u - 1, v, 'kv_ch'); put(u + 2, v, 'kv_ch'); put(u, v - 1, 'kv_ch'); put(u + 1, v + 1, 'kv_ch'); };
    T4(fx0 + 4, ctrV + 4); T4(fx0 + Math.max(8, Wd - 5), ctrV + 4); T4(fx0 + 4, ctrV + 8);
    { const u = fx0 + Math.max(9, Wd - 5), v = ctrV + 8; put(u, v, 'kv_tri'); put(u - 1, v, 'kv_ch'); put(u + 1, v, 'kv_ch'); }
    // the bar ledge along the front window, left of the door
    { const door = R[fy1 + 1] ? R[fy1 + 1].findIndex(t => t === 'e' || /^D/.test(t)) : -1, stop = door > 0 ? door - 2 : mid - 2; for (let u = fx0 + 1; u <= stop; u++) put(u, fy1, 'kv_ledge'); }
    // a couple of regulars
    for (const [u, v] of [[fx0 + 3, ctrV + 4], [fx0 + 1, wv + 2]]) if (R[v] && R[v][u] === '.') { R[v][u] = 'N'; F.npcs.push({ x: u, y: v, folk: (u + v) % 2 ? 'kove_reg' : 'kove_reg2', name: 'Regular', talk: () => say([['Regular', ['Best cinnamon rolls in town. Don\'t tell anyone.', 'I come here to read. It\'s quiet before nine.', 'Sit anywhere. The chairs by the window get the sun.'][(u + v) % 3]]]) }); }
    hookTalk(F, 'server', () => { if (KOVE_STORY.barista) return KOVE_STORY.barista();
      ask('Barista: Welcome to the Kove! What can I get started for you?', [{ t: 'See the menu', f: () => menuOpen('The Kove', MENUS.kove, LISTED_NOTE) }, { t: 'Just looking' }]); });
  },
  look: (Fm, x, y, t) => {
    const L = { kv_board: null, kv_menu: 'Three brown menu boards: DRINKS, FOOD, BAKERY.', kv_sign: 'THE KOVE, with a steaming cup.', kv_case: 'The bakery case: scones, muffins, cinnamon rolls.',
      kv_esp: 'The espresso machine, warm and ticking.', kv_urn: 'A big brewer of house coffee.', kv_cups: 'Stacks of cups and lids.', kv_ctr: 'A sage-green counter with a stone top.',
      kv_tab: 'A walnut table.', kv_tri: 'A three-cornered walnut table.', kv_ch: 'A wooden chair with a grey cushion.', kv_arm: 'An olive armchair. Very sit-in-able.',
      kv_lamp: 'A floor lamp with glass globes.', kv_plant: 'A big leafy plant.', kv_high: 'A tall table for standing with your coffee.', kv_ledge: 'A wooden bar along the front window.',
      kv_rr: 'Restroom.', kv_cool: 'A cooler of bottled drinks.', kv_hoop: 'Pressed flowers in a round frame.', kv_bk: 'Behind the counter.' };
    if (t === 'kv_board') { say(['Flyers, a lost mitten, a guitar for sale.'].concat(KOVE_STORY.board).map(s => ['', s])); return true; }
    if (L[t]) { say([['', L[t]]]); return true; }
    return false; } };
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) { if (typeof t !== 'string' || t.slice(0, 3) !== 'kv_') return _rp(Fm, t, x, y);
    const X = x * 24, Y = y * 24, h = hash(x * 7, y * 3), sh = () => qp('rgba(0,0,0,.18)', X + 2, Y + 19, 20, 4);
    switch (t) {
      case 'kv_bk': qp('#cfc8ba', X, Y, 24, 24); qp('#bdb5a6', X, Y + 23, 24, 1); break;
      case 'kv_ctr': qp('#6f7f66', X, Y + 6, 24, 18); for (let i = 0; i < 3; i++) qp('#5f6f58', X, Y + 10 + i * 5, 24, 1); qp('#7c7a72', X, Y + 2, 24, 5); qp('#8e8c84', X, Y + 2, 24, 1); break;
      case 'kv_case': qp('#6f7f66', X, Y + 14, 24, 10); qp('#9aa0a0', X, Y - 6, 24, 20); qp('#cfe2e6', X + 2, Y - 4, 20, 16); for (let i = 0; i < 4; i++) qp(['#c8945a', '#e0c08a', '#a8643a', '#d8b070'][(h + i) % 4], X + 3 + i * 5, Y + 4 - (i % 2) * 6, 4, 3); break;
      case 'kv_esp': sh(); qp('#3a3a3e', X + 2, Y - 4, 20, 22); qp('#b8bcc0', X + 3, Y - 3, 18, 6); qp('#2a2a2e', X + 6, Y + 6, 3, 6); qp('#2a2a2e', X + 15, Y + 6, 3, 6); qp('#c03030', X + 4, Y - 2, 3, 2); break;
      case 'kv_urn': sh(); qp('#2a2a2e', X + 6, Y + 8, 12, 10); qp('#a8acb0', X + 5, Y - 6, 14, 14); qp('#d0d4d8', X + 6, Y - 5, 4, 12); break;
      case 'kv_cups': for (let i = 0; i < 3; i++) { qp('#f2ece0', X + 3 + i * 7, Y + 2, 5, 14); qp(i === 1 ? '#a8845a' : '#e0d8c8', X + 3 + i * 7, Y + 2, 5, 3); } break;
      case 'kv_menu': qp('#2a2420', X - 1, Y - 18, 26, 24); qp('#6a5244', X, Y - 17, 24, 22); qp('#e8dccc', X + 4, Y - 14, 16, 2); for (let i = 0; i < 5; i++) qp('#cbb9a6', X + 3, Y - 9 + i * 3, 12 + (h >> i) % 6, 1); break;
      case 'kv_sign': qp('#5a4a3e', X + 1, Y - 20, 22, 26); qp('#ece0cc', X + 3, Y - 18, 18, 22); qp('#5a4a3e', X + 8, Y - 6, 8, 5); qp('#5a4a3e', X + 15, Y - 5, 2, 3); qp('#8a7a6a', X + 10, Y - 12, 1, 4); qp('#8a7a6a', X + 13, Y - 13, 1, 5); qp('#5a4a3e', X + 5, Y - 16, 14, 2); break;
      case 'kv_tab': case 'kv_tri': sh(); qp('#3a2414', X + 2, Y + 4, 20, 14); qp('#6a4024', X + 2, Y + 3, 20, 12); qp('#80502e', X + 4, Y + 4, 16, 3); if (t === 'kv_tri') { qp('#ece6da', X + 2, Y + 3, 4, 4); qp('#ece6da', X + 18, Y + 3, 4, 4); } else if (h % 3 === 0) { qp('#f2f0ea', X + 9, Y + 1, 5, 6); qp('#6a9a5a', X + 8, Y - 3, 7, 5); } break;
      case 'kv_ch': sh(); qp('#4a2c18', X + 5, Y + 2, 14, 4); qp('#9a9a98', X + 5, Y + 7, 14, 8); qp('#4a2c18', X + 5, Y + 15, 2, 5); qp('#4a2c18', X + 17, Y + 15, 2, 5); break;
      case 'kv_arm': sh(); qp('#4e5a34', X + 2, Y + 2, 20, 18); qp('#6a7848', X + 5, Y + 6, 14, 10); qp('#5a6840', X + 2, Y + 2, 20, 4); break;
      case 'kv_lamp': sh(); qp('#b89a50', X + 11, Y - 10, 2, 28); for (const [a, b2] of [[5, -12], [15, -6], [6, -1]]) { qp('#f8f6ee', X + a, Y + b2, 6, 6); qp('#ffffff', X + a + 1, Y + b2 + 1, 2, 2); } break;
      case 'kv_plant': sh(); qp('#8a7458', X + 7, Y + 10, 10, 9); for (let i = 0; i < 6; i++) qp(i % 2 ? '#3e7a3a' : '#5a9a4a', X + 2 + ((h >> i) % 16), Y - 8 + i * 3, 8, 6); break;
      case 'kv_high': sh(); qp('#3a2414', X + 11, Y + 2, 2, 18); qp('#6a4024', X + 3, Y - 2, 18, 6); break;
      case 'kv_ledge': qp('#3a2414', X, Y + 10, 24, 3); qp('#8a5a32', X, Y + 6, 24, 5); qp('#9a6a3e', X, Y + 6, 24, 1); qp('#6a6e72', X + 10, Y + 13, 2, 9); break;
      case 'kv_rr': qp('#4a2e1a', X + 2, Y - 9, 20, 30); qp('#6a4428', X + 4, Y - 7, 16, 27); qp('#e8e4dc', X + 9, Y - 2, 6, 6); qp('#5a6a7a', X + 11, Y - 1, 2, 4); break;
      case 'kv_cool': sh(); qp('#1c1c22', X + 1, Y - 12, 22, 32); qp('#cfe2ea', X + 3, Y - 10, 18, 24); for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) qp(['#e05a40', '#f0c040', '#7ac060', '#e8e0d0'][(i + j + h) % 4], X + 4 + j * 3, Y - 8 + i * 6, 2, 4); qp('#e8b8c0', X + 3, Y - 12, 18, 2); break;
      case 'kv_board': { qp('#5a3a22', X, Y - 6, 24, 18); qp('#b08a5a', X + 2, Y - 4, 20, 14); const C = ['#f2e8c8', '#e8c8c8', '#c8dce8', '#d8e8c0']; for (let i = 0; i < 3; i++) { const px = X + 3 + ((h >> (i * 3)) % 12), py = Y - 3 + ((h >> (i * 2 + 5)) % 7); qp(C[(h + i) % 4], px, py, 6, 5); qp('#c03030', px + 2, py, 2, 1); } break; }
      case 'kv_hoop': qp('#c8a860', X + 6, Y - 4, 12, 12); qp('#f2f0e8', X + 7, Y - 3, 10, 10); qp('#8aa070', X + 10, Y - 1, 1, 6); qp('#c890a0', X + 9, Y - 2, 3, 2); break;
      case 'kv_mat': qp('#22252a', X, Y + 1, 24, 22); break;
    } }; }
{ const _er = enterRoom; enterRoom = function (b, ...rest) { const r = _er(b, ...rest);
    if (b && b.name === 'The Kove' && typeof KOVE_STORY.onEnter === 'function') { try { KOVE_STORY.onEnter(G.inside && ROOMS[G.inside.f]); } catch (e) { console.warn('Kove story', e); } }
    return r; }; }

// removed buildings (js/data/fixes goneBld) are never enterable: their old door would sit on top of whatever replaced them
{ const _re = roomEligible; roomEligible = function (b) { if (b && b.name === 'The Kove' && !b.gone) return true; return !!b && !b.gone && _re(b); }; }
if (typeof BRANDSIGNS !== 'undefined') { BRANDSIGNS.push({ x: 3279, y: 1421, text: 'THE KOVE', bg: '#2e5a7a', fg: '#f2ead8', style: 'monument' }); }
