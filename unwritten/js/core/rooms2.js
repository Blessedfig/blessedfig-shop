"use strict";
// =====================================================================
//  DOWNTOWN PEOPLE AND HOOKS (Nov 14): the generic staff who stand behind the counters (nobody real; plain looks and
//  stand-in lines for Christian to rewrite), and each place's own hook: its kind, its first line, its people, and what its
//  counter, shelves or machines do. Ideas Christian listed on Nov 13-14 are wired here as stand-ins; the full list, with
//  what is done and what waits, is in the project doc claude/downtown-plan.md.
// =====================================================================
Object.assign(FOLKS, {
  clerk: { skin: '#e2b48e', hair: '#5a3a24', shirt: '#3a6a8a', shirt2: '#2e5470', pants: '#3a3a44', shoes: '#2a2224' },
  server: { skin: '#d9a77c', hair: '#2a1e18', shirt: '#f0ece2', shirt2: '#f0ece2', pants: '#26262c', shoes: '#141416', apron: '#b8323a' },
  bartender: { skin: '#c99878', hair: '#1e1612', shirt: '#26262c', shirt2: '#3a3a42', pants: '#26262c', shoes: '#141416', apron: '#5a3a22' },
  teller: { skin: '#ecc19c', hair: '#8a5a2a', shirt: '#f0ece2', shirt2: '#f0ece2', pants: '#2a3a52', shoes: '#141416', vest: '#2a3a52' },
  librarian: { skin: '#d9a77c', hair: '#c8c4bc', shirt: '#6a4a7a', shirt2: '#5a3a6a', pants: '#3a3a44', shoes: '#2a2224', glasses: 1 },
  stylist: { skin: '#e8b898', hair: '#a8306a', shirt: '#26262c', shirt2: '#3a3a42', pants: '#26262c', shoes: '#141416', apron: '#26262c' },
  mechanic: { skin: '#c99878', hair: '#2e2018', shirt: '#3a4a6a', shirt2: '#2e3a54', pants: '#3a4a6a', shoes: '#2a2224', extra: 'cap' },
  groomer: { skin: '#e2b48e', hair: '#d8b060', shirt: '#4ab0a8', shirt2: '#3a9890', pants: '#3a3a44', shoes: '#e8e8ea', apron: '#4ab0a8' },
  baker: { skin: '#f0c8a0', hair: '#e8e4dc', shirt: '#f4f2ea', shirt2: '#f4f2ea', pants: '#e8e4dc', shoes: '#2a2224', apron: '#f4f2ea' },
  chiro: { skin: '#d9a77c', hair: '#3a2a20', shirt: '#f4f4f8', shirt2: '#e8e8f0', pants: '#3a4a6a', shoes: '#2a2224' },
  realtor: { skin: '#ecc19c', hair: '#2a1e18', shirt: '#2a2c34', shirt2: '#f0ece2', pants: '#2a2c34', shoes: '#141416', vest: '#2a2c34' },
});
{ const _df = drawFolk; drawFolk = function (who, cx, by, t) {   // extras for the staff: an apron, glasses
    _df(who, cx, by, t); const S = FOLKS[who]; if (!S) return; const bob = (t >> 5) % 2, R = (c, x, y, w, h) => F(c, Math.round(cx + x), Math.round(by + y), w, h);
    if (S.apron) { R(S.apron, -7, -18 + bob, 14, 9); R(shade(S.apron, -0.25), -7, -18 + bob, 14, 1); R(S.apron, -4, -23 + bob, 8, 5); }
    if (S.glasses) { R('#1a1418', -6, -31 + bob, 5, 1); R('#1a1418', 1, -31 + bob, 5, 1); R('#1a1418', -1, -31 + bob, 2, 1); }
  }; }
Object.assign(FOLKS, {
  creamery: { skin: '#f0c8a0', hair: '#c87a3a', shirt: '#f0a0b0', shirt2: '#e890a0', pants: '#3a3a44', shoes: '#e8e8ea', apron: '#f4f2ea' },
  vendor: { skin: '#d9a77c', hair: '#5a3a24', shirt: '#7a9a4a', shirt2: '#6a8a3a', pants: '#3a4a6a', shoes: '#5a3a24', apron: '#c8a070' },
  petkeeper: { skin: '#c99878', hair: '#1e1612', shirt: '#2a8a6a', shirt2: '#1e7a5a', pants: '#5a4a3a', shoes: '#2a2224' },
  stranger: { skin: '#b8907a', hair: '#141214', shirt: '#2a2830', shirt2: '#1e1c24', pants: '#1e1c24', shoes: '#141416', extra: 'beanie', hat: '#2a2830' },
  robe: { skin: '#ecc19c', hair: '#c8c4bc', shirt: '#e890b0', shirt2: '#d880a0', pants: '#e890b0', shoes: '#f4f0f0', curlers: 1 },
  snorkel: { skin: '#e2b48e', hair: '#5a3a24', shirt: '#f0d040', shirt2: '#3a7ad8', pants: '#3a7ad8', shoes: '#2a8a6a', mask: 1 },
  tux: { skin: '#c99878', hair: '#2e2018', shirt: '#16161a', shirt2: '#f4f2ea', pants: '#16161a', shoes: '#141416', vest: '#16161a' },
});
{ const _df = drawFolk; drawFolk = function (who, cx, by, t) {   // the laundromat regulars' outfits
    _df(who, cx, by, t); const S = FOLKS[who]; if (!S) return; const bob = (t >> 5) % 2, R = (c, x, y, w, h) => F(c, Math.round(cx + x), Math.round(by + y), w, h);
    if (S.curlers) for (let i = 0; i < 4; i++) { R('#f0f0f4', -7 + i * 4, -41 + bob, 3, 3); R('#3a7ad8', -6 + i * 4, -40 + bob, 1, 1); }
    if (S.mask) { R('#1a1418', -8, -33 + bob, 16, 6); R('#9ad0f0', -7, -32 + bob, 14, 4); R('#f08a30', 6, -44 + bob, 2, 12); }
  }; }
function hookTalk(F, folk, fn) { for (const n of F.npcs) if (n.folk === folk) n.talk = fn; }
function hookNpc(F, folk, x, y, talk, name) { if (!F.R[y] || F.R[y][x] !== '.') { const near = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0]].find(([a, c]) => F.R[y + c] && F.R[y + c][x + a] === '.'); if (!near) return; x += near[0]; y += near[1]; }
  F.R[y][x] = 'N'; F.npcs.push({ x, y, folk, talk, name }); }
const STANDIN_NOTE = 'Stand-in items and prices until this place\'s own list is added.';
// ---------- restaurants and food ----------
ROOM_HOOK['Dixie Lunch'] = { line: 'Dixie Lunch. Coffee, the hiss of the grill, pie in the case. People have eaten here for about eighty years.',
  layout: F => hookTalk(F, 'server', () => ask('Server: Welcome to the Dixie! Hungry?', [{ t: 'See the menu', f: () => menuOpen('Dixie Lunch', MENUS.dixie, MENUS.dixieNote) }, { t: 'Just looking' }])) };
ROOM_HOOK['Banquet On A Bun'] = { line: 'Banquet On A Bun. Hot dogs, burgers, Italian beef and steak sandwiches, to eat here or carry out.',
  layout: F => hookTalk(F, 'server', () => ask('Server: What\'ll it be?', [{ t: 'See the menu', f: () => menuOpen('Banquet On A Bun', MENUS.banquet, LISTED_NOTE) }, { t: 'Just looking' }])) };
ROOM_HOOK["Pavek's Antigo Bakery"] = { kind: 'bakery', line: 'Pavek\'s Antigo Bakery. Warm bread, pies and cakes, and the butter cookies everybody talks about.',
  layout: F => { for (const n of F.npcs) n.folk = 'baker'; hookTalk(F, 'baker', () => ask('Baker: Good morning! The butter cookies just came out.', [{ t: 'See what\'s in the case', f: () => menuOpen('Pavek\'s Bakery', MENUS.pavek, LISTED_NOTE) }, { t: 'Just smelling' }])); } };
ROOM_HOOK['Woken Bear Coffee'] = { line: 'Woken Bear Coffee. It smells like roasting coffee: they roast their own beans right here.',
  layout: F => hookTalk(F, 'server', () => ask('Barista: Morning! Everything\'s roasted right here.', [{ t: 'See the menu', f: () => menuOpen('Woken Bear Coffee', MENUS.wokenbear, LISTED_NOTE) }, { t: 'Just looking' }])) };
ROOM_HOOK['Be U Nutrition'] = { line: 'Be U Nutrition, the smoothie and juice bar downtown.',
  layout: F => hookTalk(F, 'server', () => ask('Hi! Smoothie or juice today?', [{ t: 'See the menu', f: () => menuOpen('Be U Nutrition', MENUS.beu, LISTED_NOTE) }, { t: 'Just looking' }])) };
// Harper's Mercantile, with the creamery's ice cream and boba in the back (Christian, Nov 13)
ROOM_HOOK["Harper's Mercantile"] = { line: 'Harper\'s Mercantile. Shelves of local goods up front, and in the back, an ice cream case and a boba counter.',
  layout: (F, c) => { const v = c.fy0 + 2; for (let u = c.fx0; u <= c.fx1; u++) { if (F.R[v][u] !== 'W') F.R[v][u] = u % 3 === 0 ? 'o' : 'I'; if (F.R[v - 1][u] !== 'W') F.R[v - 1][u] = 'x'; if (F.R[v + 1] && F.R[v + 1][u] !== 'W' && F.R[v + 1][u] !== 'N') F.R[v + 1][u] = '.'; }
    for (let u = c.fx0; u <= c.fx1; u++) if (F.R[c.fy0][u] !== 'W') F.R[c.fy0][u] = 'f';
    F.npcs.push({ x: (c.fx0 + c.fx1) >> 1, y: v - 1, folk: 'creamery', talk: () => ask('Ice cream or boba? Both are in the back of the Mercantile.', [{ t: 'See the menu', f: () => menuOpen('Spud City Creamery', MENUS.creamery, LISTED_NOTE) }, { t: 'Just looking' }]) });
    for (let w = v + 2; w <= v + 3; w++) for (let u = c.fx0 + 1; u <= c.fx1 - 1; u++) if (F.R[w] && F.R[w][u] === 'G') F.R[w][u] = '.';
    hookTalk(F, 'clerk', () => ask('Clerk: Welcome to Harper\'s! Local goods, gifts, a little of everything.', [{ t: 'Browse the shelves', f: () => shopOpen('HARPER\'S MERCANTILE', SHOPS.harpers.map(stockItem), { note: STANDIN_NOTE }) }, { t: 'Just looking' }])); },
  zone: (F, x, y) => y <= F.box.fy0 + 3 ? 'CREAMERY' : null };
// ---------- shops ----------
ROOM_HOOK['Lakeside Market'] = { kind: 'pharmacy', line: 'Lakeside. Groceries in the aisles and a drugstore counter at the back.',
  layout: F => hookTalk(F, 'clerk', () => ask('Clerk: Find everything okay?', [{ t: 'Groceries', f: () => shopOpen('LAKESIDE · GROCERIES', SHOPS.lakeGroc.map(stockItem), { note: STANDIN_NOTE }) },
    { t: 'Drugstore', f: () => shopOpen('LAKESIDE · DRUGSTORE', SHOPS.lakeDrug.map(stockItem), { note: 'Bandages heal in a fight, or from the bag. ' + STANDIN_NOTE }) }, { t: 'Just looking' }])) };
ROOM_HOOK['Salon 731'] = { line: 'Salon 731. Chairs and mirrors, and a shelf of cute things by the door.',
  layout: F => hookTalk(F, 'stylist', () => ask('Stylist: Hi there! Have a look at the cute stuff by the door.', [{ t: 'Browse', f: () => shopOpen('SALON 731', SHOPS.salon731.map(stockItem), { note: STANDIN_NOTE }) }, { t: 'Just looking' }])) };
ROOM_HOOK['Flowers From The Heart'] = { line: 'Flowers From The Heart. Cool air from the flower cooler and a room full of color.',
  layout: F => hookTalk(F, 'clerk', () => ask('Florist: Every flower here has a meaning. Want to play the matching game?', [{ t: 'Play the flower match', f: () => flowerMatch() }, { t: 'Buy a flower', f: () => shopOpen('FLOWERS FROM THE HEART', SHOPS.flowers.map(stockItem), { note: STANDIN_NOTE }) }, { t: 'Not now' }])) };
const CRAFT_BOOTHS = [   // stand-in booths, generic makers (no real vendors named) until Christian fills in who rents them
  { who: 'Knitter', title: 'BOOTH · YARN & QUILTS', pitch: 'Wool from up north, and quilts my mother taught me.', stock: [['cb_mitts', 'Wool Mittens', 1800], ['cb_hat', 'Knit Stocking Cap', 1600], ['cb_quilt', 'Lap Quilt', 6500], ['cr_yarn', 'Skein of Yarn', 600]] },
  { who: 'Woodworker', title: 'BOOTH · WOODWORK', pitch: 'Basswood and birch, all of it from Langlade County.', stock: [['cr_wood', 'Carved Wooden Loon', 2500], ['cb_spoon', 'Birch Spoon', 900], ['cb_board', 'Cutting Board', 3200], ['cb_bird', 'Birdhouse', 2800]] },
  { who: 'Candle maker', title: 'BOOTH · CANDLES & SOAP', pitch: 'Smell this one. That\'s balsam fir.', stock: [['cb_balsam', 'Balsam Fir Candle', 1400], ['cr_soap', 'Goat Milk Soap', 700], ['cb_wax', 'Beeswax Tea Lights', 800]] },
  { who: 'Beader', title: 'BOOTH · JEWELRY', pitch: 'Every bead strung by hand. Earrings are two for one today.', stock: [['cb_earring', 'Beaded Earrings', 1200], ['cb_brace', 'Glass Bead Bracelet', 1500], ['cr_beads', 'Jar of Beads', 500]] },
  { who: 'Beekeeper', title: 'BOOTH · HONEY & MAPLE', pitch: 'Honey from the clover fields and syrup from the sugarbush.', stock: [['cb_honey', 'Jar of Clover Honey', 900, 'food'], ['cb_syrup', 'Maple Syrup', 1400, 'food'], ['cb_candy', 'Maple Sugar Candy', 400, 'food']] },
  { who: 'Painter', title: 'BOOTH · PRINTS & CARDS', pitch: 'Little paintings of the town. That one is Fifth Avenue in the snow.', stock: [['cb_card', 'Painted Note Card', 500], ['cb_print', 'Small Town Print', 2400], ['cr_paint', 'Set of Paints', 1200]] },
];
ROOM_HOOK["Colleen's Craft Shed"] = { line: 'Colleen\'s Craft Shed. Craft supplies up front, booths of other vendors down the floor like a market, and in the back, a room of exotic pets.',
  layout: (F, c) => { const kv = c.fy0 + Math.max(4, Math.floor((c.fy1 - c.fy0) * 0.28)); c.partition(kv, c.xs);
    for (let v = c.fy0; v < kv; v++) for (let u = c.fx0; u <= c.fx1; u++) if (F.R[v][u] !== 'W' && F.R[v][u] !== 'D') F.R[v][u] = (u === c.fx0 || u === c.fx1 || v === c.fy0) ? 'f' : (u - c.fx0) % 4 === 2 && v > c.fy0 + 1 ? 'f' : '.';
    F.R[kv][c.xs] = '.'; F.backFrom = null; F.petRow = kv;
    hookNpc(F, 'petkeeper', c.xs + 1, kv - 1, () => say([['Pet keeper', 'Welcome to the back room! Lizards, frogs, snakes and fish. Look, but tap gently on the glass.'], ['', 'The pet shop\'s animals and lines are stand-ins for Christian to fill in.']]));
    // the vendor booths (Christian, Nov 18: "it's that and booths of other vendors"): the middle of the floor is a market,
    // each booth its own maker with a back shelf, the vendor, and a table out front; craft-supply shelves stay up by the door
    const m0 = kv + 1, rows = c.fy1 - kv > 24 ? 2 : 1, cols = c.fx1 - c.fx0 >= 20 ? [c.fx0 + 2, ((c.fx0 + c.fx1) >> 1) - 1, c.fx1 - 4] : [c.fx0 + 2, c.fx1 - 4];
    for (let v = m0; v <= m0 + rows * 6; v++) for (let u = c.fx0 + 1; u < c.fx1; u++) if (F.R[v] && F.R[v][u] === 'G') F.R[v][u] = '.';
    let bi = 0; for (let r = 0; r < rows; r++) { const v = m0 + 3 + r * 6; for (const u of cols) { const bo = CRAFT_BOOTHS[bi++ % CRAFT_BOOTHS.length];
      for (let k = 0; k < 3; k++) { if (F.R[v - 2][u + k] === '.') F.R[v - 2][u + k] = 'G'; if (F.R[v][u + k] === '.') F.R[v][u + k] = 'T'; }
      hookNpc(F, 'vendor', u + 1, v - 1, () => ask(bo.who + ': ' + bo.pitch, [{ t: 'Browse the booth', f: () => shopOpen(bo.title, bo.stock.map(stockItem), { note: STANDIN_NOTE }) }, { t: 'Just looking' }]), bo.who); } }
    hookTalk(F, 'clerk', () => ask('Clerk: Craft supplies up front, vendors in the middle, the pet room in back.', [{ t: 'Browse supplies', f: () => shopOpen('COLLEEN\'S CRAFT SHED', SHOPS.crafts.map(stockItem), { note: STANDIN_NOTE }) }, { t: 'Just looking' }])); },
  zone: (F, x, y) => y < F.petRow ? 'PET ROOM' : null,
  look: (F, x, y, t) => { if (t === 'f' && y < F.petRow) { say([['', ['A terrarium. A bearded dragon basks under the heat lamp.', 'A tank of tiny tree frogs, bright green.', 'A ball python, curled up and very still.', 'A tank of fish, flickering blue and orange.', 'A tortoise, working on a lettuce leaf.'][(x * 3 + y) % 5]]]); return true; } } };
ROOM_HOOK['Rainbow Coin Laundry'] = { line: 'Rainbow Coin Laundry. Washers churning, dryers thumping, and a few regulars in very creative outfits.',
  layout: (F, c) => { const spots = [[c.xs - 1, c.fy1 - 4], [c.xs + 1, c.fy0 + 4], [c.xs - 1, (c.fy0 + c.fy1) >> 1]];
    ['robe', 'snorkel', 'tux'].forEach((f, i) => { const [x, y] = spots[i]; hookNpc(F, f, x, y, () => laundryJoke(f), { robe: 'Regular in a robe', snorkel: 'Regular in a snorkel', tux: 'Regular in a tux shirt' }[f]); }); } };
ROOM_HOOK['Pampered Paws Pet Grooming'] = { line: 'Pampered Paws. A tub, a dryer, and a dog who knows exactly what is about to happen.',
  layout: (F, c) => { for (const n of F.npcs) n.folk = 'groomer'; F.R[c.fy0][c.fx0 + 1] = 't'; hookTalk(F, 'groomer', () => ask('Groomer: I could use a hand. Want to wash a dog? I pay by the dog.', [{ t: 'Wash a dog', f: () => dogWash() }, { t: 'Not now' }])); } };
ROOM_HOOK['The Man Cave'] = { line: 'The Man Cave. Barber chairs, hot towels, and talk about fishing.',
  layout: F => hookTalk(F, 'stylist', () => ask('Barber: Sit down, I\'ll spruce you up.', [{ t: 'Get spruced up', f: () => { G.spruced = Date.now(); saveGame(); say([['', 'A trim, a hot towel, a splash of something that smells like pine. You look sharp.'], ['', '(This will be a temporary buff once buffs exist.)']]); } }, { t: 'Not now' }])) };
ROOM_HOOK['Antigo Family Chiropractic Center'] = { line: 'The chiropractor\'s office. A front desk, a treatment table, a chart of the spine on the wall.',
  layout: F => hookTalk(F, 'clerk', () => ask('Front desk: Come on back. A quick adjustment?', [{ t: 'Get an adjustment', f: () => { G.adjusted = Date.now(); saveGame(); say([['', 'A few careful pops. You stand up straighter.'], ['', '(Half the party\'s HP and Clarity come back. The chiropractor is the town\'s healer.)']]); } }, { t: 'Not now' }])) };
ROOM_HOOK['CR Realty'] = { line: 'CR Realty. Listing sheets on the wall, a map of the county, two desks.',
  layout: F => { for (const n of F.npcs) n.folk = 'realtor'; hookTalk(F, 'realtor', () => say([['Realtor', 'Looking to buy? Save up, and once you have enough, I can show you what\'s for sale around town.'], ['', '(Buying property comes later. You have ' + money(cash()) + '.)']])); } };
ROOM_HOOK["Gene's Bearings"] = { line: 'Gene\'s Bearings. Shelves of small boxes, each holding a part that keeps something turning.',
  layout: F => hookTalk(F, 'mechanic', () => ask('Counter: Need a bearing? Tell me what it goes in.', [{ t: 'What is a bearing?', f: () => say(BEARINGS_TALK) }, { t: 'Why a bearing shop here?', f: () => say(BEARINGS_WHY) }, { t: 'Thanks' }])) };
ROOM_HOOK["Kegler's Auto & Towing"] = { line: 'Kegler\'s Auto & Towing. A car up on the lift, a tow truck out back, and a mechanic who can name a noise from across the room.',
  layout: F => hookTalk(F, 'mechanic', () => ask('Mechanic: Car making a noise? Describe it and I\'ll tell you what it is.', [{ t: 'Play "What\'s that noise?"', f: () => noiseQuiz() }, { t: 'Thanks' }])) };
for (const n of ['Simply Vintage And Primitive', 'Vintage Addiction Interiors', "Christian's Upscale Resale", 'Mr. Interchange'])
  ROOM_HOOK[n] = { layout: F => hookTalk(F, 'clerk', () => vintageTalk(n)), look: (F, x, y, t) => { if (t === 'A' || t === 'T') { vintageLook(n, x, y); return true; } } };
// ---------- shady on purpose: the old opera house, and a made-up stranger (the Hoffman House, a bar, is in bars.js) ----------
ROOM_HOOK['Antigo Opera House'] = { kind: 'museum', line: 'The Antigo Opera House, built in 1904 and 1905. The old lobby is dim and dusty. Floorboards creak somewhere overhead.',
  layout: (F, c) => { F.dim = 0.4; hookNpc(F, 'stranger', c.xs + 2, c.fy0 + 3, () => strangerTalk(true), 'Stranger'); F.npcs = F.npcs.filter(n => n.folk !== 'clerk'); for (let v = 0; v < F.H; v++) for (let u = 0; u < F.W; u++) if (F.R[v][u] === 'k' || F.R[v][u] === 'N') F.R[v][u] = '.'; },
  look: (F, x, y, t) => { if (t === 'E') { say([['', ['Old playbills under glass, the paper gone brown.', 'A row of folded seats from the old hall, stacked and dusty.', 'A box of costume jewelry. Who left this here?'][(x + y) % 3]]]); return true; } if (t === 'A') { say([['', 'A photograph of a full house, from when this was the opera house.']]); return true; } } };
// ---------- the library, the post office, the museum, the courthouse ----------
ROOM_HOOK['Antigo Public Library'] = { line: 'The Antigo Public Library. Quiet, bright, and full of true things.',
  look: (F, x, y, t) => { if (t === 'K') { const D = DEWEY[(Math.floor(y / 2) + Math.floor(x / 8)) % 10]; say([['', 'Shelf ' + D[0] + ': ' + D[1] + '.'], ['', D[2]]]); return true; } },
  layout: F => hookTalk(F, 'librarian', () => ask('Librarian: Welcome in. Nonfiction is shelved by subject, numbered 000 to 999. Want the tour?', [{ t: 'The ten main classes', f: () => say(DEWEY.map(d => ['Librarian', d[0] + ': ' + d[1] + '. ' + d[2]])) }, { t: 'Thanks' }])) };
ROOM_HOOK['Antigo Post Office'] = { line: 'The post office, built in 1915. Brass boxes, a high ceiling, and the smell of paper.', layout: F => hookTalk(F, 'clerk', () => say([['Clerk', 'Mailing something? Stamps are at the window.'], ['', '(Letters and packages come later.)']])) };
// the museum has its own three floors, the cabin and the train now (museum.js)
ROOM_HOOK['Langlade County Courthouse'] = { line: 'The Langlade County Courthouse, built in 1905. Marble floors, a directory board, and a courtroom upstairs and down.' };
ROOM_HOOK['Winter, Winter & Behrens'] = { line: 'Winter, Winter & Behrens. A quiet office, and a wall of law books.',
  layout: (F, c) => { for (let v = c.fy0; v <= c.fy1 - 4; v++) { if (F.R[v][c.fx0] === '.' || F.R[v][c.fx0] === 'F' || F.R[v][c.fx0] === 'd') F.R[v][c.fx0] = 'K'; } for (let u = c.fx0; u <= c.fx1; u++) if (F.R[c.fy0][u] === '.') F.R[c.fy0][u] = 'K';
    hookTalk(F, 'clerk', () => say([['Receptionist', 'The law books are on the left wall. The library there is open to look through.'], ['', 'The plain-English notes in it were written for this game. They are general information, not legal advice, and not from this firm.']])); },
  look: (F, x, y, t) => { if (t === 'K') { ask('A wall of law books: the Wisconsin Statutes, the Antigo city code, the Langlade County ordinances.', [{ t: 'Open the law library', f: () => pageShow('law/index.html', 'Law library · Wisconsin, Langlade County and Antigo', null) }, { t: 'Not now' }]); return true; } } };
// banks: the teller window and the tellers (banks.js)
for (const n of ['CoVantage Credit Union', 'BMO Harris Bank', 'BMO Bank', 'Chase', 'Chase Bank', 'Associated Bank', 'Banner Bank'])
  ROOM_HOOK[n] = { layout: F => hookTalk(F, 'teller', () => bankTalk(F.b)), look: (F, x, y, t) => { if (t === 'U') { bankTalk(F.b); return true; } } };
// ---------- the hospital (Christian, Nov 14: "The Hospital is going to have some nice staff") ----------
// Aspirus Langlade Hospital, 112 E Fifth Ave. Health care may be named. Only the main lobby opens; the people in it are kind
// stand-ins, nobody real, and nobody gives medical advice: in an emergency the game says call 911.
Object.assign(ROOM_STYLE, { clinic: [['lino', '#e4e8e6', '#d2d8d6'], ['#eef4f2', '#4a8aa0']] });
Object.assign(KIND_ZONE, { clinic: 'MAIN LOBBY' });
Object.assign(FOLKS, {
  nurse: { skin: '#d9a77c', hair: '#3a2a20', shirt: '#5ab0b8', shirt2: '#4aa0a8', pants: '#5ab0b8', shoes: '#f4f4f8' },
  volunteer: { skin: '#ecc19c', hair: '#d8d4cc', shirt: '#f0ece2', shirt2: '#f0ece2', pants: '#3a3a44', shoes: '#2a2224', vest: '#c83a5a' },
});
ROOM_HOOK['Aspirus Langlade Hospital'] = { enter: true, kind: 'clinic', lobby: [20, 12], title: 'ASPIRUS LANGLADE HOSPITAL',
  line: 'Aspirus Langlade Hospital. A bright main lobby, a front desk, and chairs by the windows.',
  layout: (F, c) => {
    const { fx0, fx1, fy0, fy1, xs, put } = c;
    const dx = Math.min(fx1 - 3, xs + 3); put(dx, fy0 + 3, 'c'); put(dx + 1, fy0 + 3, 'c'); put(dx + 2, fy0 + 3, 'k');
    for (let u = fx0 + 1; u <= Math.min(fx0 + 6, xs - 2); u++) { put(u, fy1 - 1, 'h'); put(u, fy1 - 3, 'h'); }
    put(fx0, fy0, 'P'); put(fx1, fy0, 'P'); put(fx0 + 2, fy0 + 1, 'T');
    hookNpc(F, 'receptionist', dx + 1, fy0 + 2, () => say([['Front desk', 'Welcome! Here to visit someone? I can point you the right way.'], ['Front desk', 'And if anything ever feels like an emergency, call 911. That\'s what it\'s for.']]), 'Front desk');
    hookNpc(F, 'nurse', Math.max(fx0 + 2, xs - 3), fy0 + 4, () => ask('Nurse: Long day? You can sit a minute. There\'s water by the chairs.', [
      { t: 'Rest a minute', f: () => { G.rested = Date.now(); saveGame(); say([['', 'You sit by the window and catch your breath. The nurse checks back with a smile.'], ['', '(A rest. Everyone in the party is back to full.)']]); } },
      { t: 'I\'m okay, thanks' }]), 'Nurse');
    hookNpc(F, 'volunteer', Math.min(fx1 - 1, xs + 2), fy1 - 2, () => say([['Volunteer', 'Hi there! I help folks find their way around. We\'re glad you\'re here.'], ['', '(Stand-in staff. Christian will write who they are.)']]), 'Volunteer');
  } };
