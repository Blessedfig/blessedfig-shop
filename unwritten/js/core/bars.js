"use strict";
// =====================================================================
//  BARS, AND THE TWO KIDS IN A TRENCHCOAT (Nov 14). Christian: "oh yeah the bars!" and "Kids require talking to 2 kids in a
//  trenchcoat outside to get a costume to get loans or go into bars."
//  · Every bar in town is a bar inside: the back bar and stools, a pool table, a dartboard, a jukebox, the game on TV and the
//    specials board where the place lists specials. The bartender has the place's own menu, bar trivia and darts.
//    Kastawayz joined the bars on Nov 14 (Christian: "it is also a sit down wisconsin bar for drinking").
//  · A kid can't walk into a bar alone. That's Wisconsin law too: an underage person who isn't with a parent, guardian or spouse
//    of legal drinking age may not enter a bar (Wis. Stat. 125.07(3)(a), checked Nov 14, 2026). The two kids in a trenchcoat,
//    out front of the Hoffman House, lend a kid a disguise. In it a kid passes for a grown-up at a bar door and at a bank.
//    The bartender and the teller are fooled, never in on it, and a kid in the coat only ever gets soft drinks.
//  · Drinks with alcohol show on a bar menu only for a grown-up in the Mature story (the new-game screen lists drinking there).
//  · The Antigo Opera House is apartments today (Christian; the National Register record), so it no longer opens: homes stay
//    private. Its sign tells its history instead.
//  · People are generic and made up; lines are stand-ins for Christian to rewrite. No real bar is ever shown doing wrong.
// =====================================================================

// ---------- the Opera House: apartments now, so its door stays shut ----------
delete ROOM_HOOK['Antigo Opera House'];
{ const _re = roomEligible; roomEligible = function (b) { if (b && b.landmark === 'opera') return false; return _re(b); }; }
for (const b of BLD) if (b.landmark === 'opera') b.enter = 0;
LANDMARKS.opera.lines = ['THE ANTIGO OPERA HOUSE · 1016 Fifth Avenue.', 'Red brick with white trim, from 1904. It could seat 1,100 people, and it served as an armory in World War I.',
  'Today it is apartments. It is on the National Register of Historic Places.'];

// a saved game that ended inside the old Opera House room steps back out onto the sidewalk
{ const _lg = loadGame; loadGame = function () { const s = _lg(); const op = BLD.find(b => b.landmark === 'opera'); if (s && s.inside && op && s.inside.f === 'room' + op.id) s.inside = null; return s; }; }

// ---------- which buildings are bars ----------
// Hix's Hoffman House (1015 Fifth) and Animals Bar & Grill (909-911 Fifth) were bars already; bb Jack's Pizza & Sandwich Lounge
// (523 Superior St, on the county's and the Chamber's lists) opens now too. Others in older listings wait for Christian to confirm.
{ const bb = BLD.find(b => b.addr === '523 SUPERIOR ST' && b.name); if (bb) { bb.name = 'bb Jack\'s'; bb.enter = 1; } }

// ---------- the bar menu: the place's own food (shops.js), soft drinks, and drinks for grown-ups in the Mature story ----------
// A section can keep days (menu.__days: 0 = Sunday), so the Hoffman House serves supper Wednesday to Saturday and Kastawayz its
// special on weekdays, by the real calendar. The generic Friday fish fry is gone: none of these four places lists one (a place
// that does gets menu.__fishfry).
function barMenu(food) {
  const m = {}, day = new Date().getDay(), days = food.__days || {};
  for (const k of Object.keys(food)) if (!k.startsWith('__') && (!days[k] || days[k].includes(day))) m[k] = food[k];
  m['Soft drinks'] = [['bar_rootbeer', 'Root beer', 300], ['bar_pop', 'Pop', 250], ['bar_coffee', 'Coffee', 200], ['bar_kiddie', 'Kiddie cocktail', 300]];
  if (food.__fishfry && day === 5) m['Friday fish fry'] = food.__fishfry;
  if (G.mature && !isMinor()) m['Drinks'] = [['bar_tap', 'Tap beer', 450], ['bar_oldfash', 'Brandy Old Fashioned', 700]];
  return m;
}
function barTalk(place, food) {
  const kid = isMinor(), m = barMenu(food), kitchen = Object.keys(m).some(k => k !== 'Soft drinks' && k !== 'Drinks');
  const menu = () => menuOpen(place, m, food.__note || LISTED_NOTE);
  const order = () => (!kitchen && food.__closed ? say([['Bartender', food.__closed + ' Something to drink?']], go) : go());
  const go = () => kid ? say([['', '(In your deepest voice: "One root beer. For me. A grown-up.")']], menu) : menu();
  ask(kid ? 'Bartender: Evening, sir. What\'ll it be?' : 'Bartender: Hey there! What can I get you?', [
    { t: 'See the menu', f: order },
    { t: 'Bar trivia', f: () => runQuiz(BAR_TRIVIA, 'Bartender', 'trivia') },
    { t: 'Throw darts', f: () => dartsStart() },
    { t: 'Just looking' }]);
}
ROOM_HOOK["Hix's Hoffman House"] = { kind: 'bar', board: MENUS.hoffman.__board,
  line: 'The Hoffman House. It was built as a hotel in the 1880s, the Lake Shore House. Low light, an old wooden bar, and somebody in the back booth who stops talking when you walk in.',
  layout: (F, c) => { F.dim = 0.32; hookNpc(F, 'stranger', c.fx1 - 1, c.fy0 + 6, () => strangerTalk(), 'Stranger'); hookTalk(F, 'bartender', () => barTalk('The Hoffman House', MENUS.hoffman)); } };
ROOM_HOOK['Animals Bar & Grill'] = { kind: 'bar', line: 'Animals Bar & Grill. Burgers and sandwiches, the game on TV, and a dartboard with a lot of holes around it.',
  layout: F => hookTalk(F, 'bartender', () => barTalk('Animals Bar & Grill', MENUS.animals)) };
ROOM_HOOK['bb Jack\'s'] = { enter: true, kind: 'bar', title: 'BB JACK\'S', board: MENUS.bbjacks.__board, line: 'bb Jack\'s Pizza & Sandwich Lounge. Homemade pizza, sandwiches, soup, and the game on over the bar.',
  layout: F => hookTalk(F, 'bartender', () => barTalk('bb Jack\'s', MENUS.bbjacks)) };
// Kastawayz Bar & Grill (827 Fifth): a sit-down Wisconsin bar (Christian, Nov 14), so a bartender, stools, booths and the kid gate
ROOM_HOOK['Kastawayz'] = { kind: 'bar', title: 'KASTAWAYZ', board: MENUS.kastawayz.__board,
  line: 'Kastawayz Bar & Grill. Stools along the bar, booths by the wall, burgers and panini off the grill, and the game on.',
  layout: F => hookTalk(F, 'bartender', () => barTalk('Kastawayz', MENUS.kastawayz)) };

// ---------- bar trivia: every answer is a fact checked for the game (sources in the project docs) ----------
const BAR_TRIVIA = [
  ['When did the first train reach Antigo?', '1881', ['1848', '1905', '1920'], 'August 15, 1881, on the Milwaukee, Lake Shore and Western. The town grew up around the railroad.'],
  ['Wisconsin\'s state soil is named for which city?', 'Antigo', ['Merrill', 'Wausau', 'Rhinelander'], 'Antigo silt loam has been the state soil since 1983.'],
  ['How many people could the Antigo Opera House seat?', 'About 1,100', ['About 100', 'About 300', 'About 5,000'], 'It opened in 1904 and was an armory in World War I. Today it\'s apartments.'],
  ['The Hoffman House building started out in the 1880s as what?', 'A hotel', ['A train depot', 'A church', 'A school'], 'It was the Lake Shore House, and later the Hoffman Hotel.'],
  ['Langlade County grows more of what than any other county in Wisconsin?', 'Seed potatoes', ['Cranberries', 'Ginseng', 'Sweet corn'], 'Most of its potato fields grow seed for other farms.'],
  ['In 1928, Langlade County voters said yes to starting a...', 'County forest', ['County fair', 'Ski hill', 'Baseball team'], 'It grew from logged-off land. Today it covers about 130,000 acres.'],
  ['CoVantage Credit Union started in Antigo in 1952 as the...', 'Antigo Co-op Credit Union', ['First Bank of Antigo', 'Northwoods Savings', 'Potato Growers Bank'], 'It began in the basement of the Antigo Co-op Oil Association.'],
  ['How many cubic inches are in one board foot?', '144', ['12', '100', '1,728'], 'A board foot is 12 by 12 by 1 inch.'],
  ['Where does Wisconsin rank among potato-growing states?', 'Third', ['First', 'Fifth', 'Tenth'], 'In 2025 Idaho was first, Washington second and Wisconsin third.'],
  ['Antigo bars sponsor teams for darts, pool, volleyball and...', 'Softball', ['Curling', 'Polo', 'Rowing'], 'Tavern League play is a big deal around here: fall pool and dart leagues, summer softball.'],
  ['A Wisconsin Friday fish fry often comes with coleslaw, rye bread and...', 'Potato pancakes', ['Rice', 'Tortillas', 'Sushi'], 'Or fries. Cod, perch, walleye and bluegill are the usual fish.'],
  ['What is Wisconsin\'s official state beverage?', 'Milk', ['Root beer', 'Coffee', 'Apple cider'], 'Milk, since 1987. America\'s Dairyland.']];

// ---------- the bar's extras: a pool table, a dartboard, a jukebox, the TV, the specials board ----------
// '0' and '1' are the pool table's two tiles, '2' the dartboard, '3' the jukebox, '4' the TV, '5' the chalkboard
function barExtras(F) {
  const b = F.box; if (!b) return; const { fx0, fx1, fy0, fy1 } = b, xs = F.ud, R = F.R;
  const free = (u, v) => R[v] && R[v][u] === '.' && u !== xs && v !== fy1, solid = (u, v) => !R[v] || ['W', 'O', ' '].includes(R[v][u]);
  // the pool table: a clear patch of 4 x 3 on the far side of the aisle, low in the room (tables and chairs there move aside)
  const side = xs > (fx0 + fx1) / 2 ? -1 : 1;
  for (let v = fy1 - 3; v >= fy0 + 5; v--) {
    const u0 = side < 0 ? fx0 + 1 : xs + 2, u1 = u0 + 3; if (u1 > fx1 - 1 || (side < 0 && u1 >= xs - 1)) continue;
    let ok = true; for (let y = v - 1; y <= v + 1 && ok; y++) for (let u = u0; u <= u1; u++) if (!R[y] || !'.hTs'.includes(R[y][u]) || u === xs) { ok = false; break; }
    if (!ok) continue;
    for (let y = v - 1; y <= v + 1; y++) for (let u = u0; u <= u1; u++) R[y][u] = '.';
    for (let y = v - 1; y <= v + 1; y++) for (let u = u0 - 1; u <= u1 + 1; u++) if (R[y] && (R[y][u] === 'h' || R[y][u] === 'T')) { const l = R[y][u - 1], r = R[y][u + 1]; if (l !== 'T' && r !== 'T' && R[y][u] === 'h') R[y][u] = '.'; }
    R[v][u0 + 1] = '0'; R[v][u0 + 2] = '1'; break;
  }
  // things hung on a wall (the dartboard, the TV) go under a back wall, where its face shows; things that stand (the jukebox,
  // the specials easel) go along a side wall
  const back = [], sides = [];
  for (let v = fy0; v <= fy1 - 2; v++) for (let u = fx0; u <= fx1; u++) {
    if (!free(u, v) || Math.abs(u - xs) < 2) continue;
    if (solid(u, v - 1)) back.push([u, v]); else if ((u === fx0 && solid(u - 1, v)) || (u === fx1 && solid(u + 1, v))) sides.push([u, v]);
  }
  const take = (list, c, pick) => { const i = list.length ? pick(list) : -1; if (i < 0) return false; const [u, v] = list.splice(i, 1)[0]; R[v][u] = c; return true; };
  take(back, '4', s => 0) || take(sides, '4', s => 0);                                            // the TV, near the bar
  take(back, '2', s => s.length - 1) || take(sides, '2', s => s.findIndex(([u, v]) => v > (fy0 + fy1) / 2));   // the dartboard
  take(sides, '3', s => s.findIndex(([u, v]) => v > (fy0 + fy1) / 2));                              // the jukebox
  if (roomHook(F.b).board) take(sides, '5', s => s.length - 1);                                    // the specials board, near the door
}
{ const _rl = roomLayout; roomLayout = function (F) { _rl(F); if (F.kind === 'bar') barExtras(F); }; }
const BAR_PROP = {
  '0'(X, Y) {   // the pool table, drawn once across both tiles: green felt, wood rails, pockets, a few balls
    qp('rgba(0,0,0,.25)', X - 2, Y + 18, 52, 5); qp('#5a3418', X - 2, Y - 4, 52, 22); qp('#7a4a24', X - 2, Y - 4, 52, 2);
    qp('#2a7a4a', X + 2, Y, 44, 14); qp('#24693f', X + 2, Y + 12, 44, 2);
    for (const [a, c] of [[0, 0], [22, 0], [44, 0], [0, 12], [22, 12], [44, 12]]) qp('#141416', X + 1 + a, Y - 1 + c, 3, 3);
    for (const [a, c, col] of [[10, 5, '#f4f4f0'], [30, 4, '#f0d040'], [33, 8, '#d83a3a'], [36, 5, '#3a5ad8'], [34, 2, '#1a1a1e']]) qp(col, X + a, Y + c, 3, 3);
    qp('#4a2e16', X, Y + 14, 3, 6); qp('#4a2e16', X + 43, Y + 14, 3, 6); },
  '1'() {},
  '2'(X, Y) {   // a dartboard hung on the wall, a chalk scoreboard beside it
    qp('#1a1418', X + 4, Y - 18, 16, 16); qp('#e8dcc0', X + 6, Y - 16, 12, 12); qp('#c83a3a', X + 8, Y - 14, 8, 8); qp('#2a8a4a', X + 9, Y - 13, 6, 6); qp('#e8dcc0', X + 10, Y - 12, 4, 4); qp('#c83a3a', X + 11, Y - 11, 2, 2);
    qp('#3a2a20', X + 21, Y - 16, 3, 1); qp('#3a2a20', X + 21, Y - 13, 2, 1); },
  '3'(X, Y) {   // a jukebox with lights that cycle
    qp('rgba(0,0,0,.25)', X + 2, Y + 18, 20, 4); qp('#7a2a3a', X + 3, Y - 12, 18, 31); qp('#e8b040', X + 3, Y - 14, 18, 4);
    const c = ['#f04a6a', '#f0d040', '#4ad0f0', '#7af07a'][(frame >> 4) % 4]; qp(c, X + 5, Y - 9, 14, 2); qp('#cfe8f0', X + 6, Y - 5, 12, 8); qp('#2a2224', X + 7, Y + 6, 10, 6); qp(c, X + 5, Y + 14, 14, 2); },
  '4'(X, Y) {   // the game on a TV up on the wall: a green field and a scoreboard bar, no team named
    qp('#16161a', X + 1, Y - 22, 22, 15); qp('#2a8a3a', X + 2, Y - 21, 20, 13); qp('#f4f4f0', X + 11, Y - 21, 1, 13);
    qp('#141416', X + 2, Y - 21, 20, 3); qp('#f0d040', X + 3, Y - 20, 4, 1); qp('#f4f4f0', X + 15, Y - 20, 5, 1);
    if ((frame >> 5) % 2) qp('#f4f4f0', X + 6 + (frame >> 3) % 12, Y - 15, 2, 2); qp('#3a3c42', X + 10, Y - 7, 4, 3); },
  '5'(X, Y) {   // the specials chalkboard on an easel
    qp('rgba(0,0,0,.2)', X + 4, Y + 18, 16, 3); qp('#7a5a3a', X + 5, Y + 6, 2, 13); qp('#7a5a3a', X + 17, Y + 6, 2, 13);
    qp('#5a3a22', X + 3, Y - 12, 18, 20); qp('#2a3a32', X + 4, Y - 11, 16, 17);
    for (let r = 0; r < 4; r++) qp('#e8e4dc', X + 6, Y - 8 + r * 4, r ? 8 + (r * 3) % 5 : 12, 1); qp('#f0c040', X + 15, Y - 9, 3, 2); },
};
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) { if (Fm.kind === 'bar' && BAR_PROP[t]) return BAR_PROP[t](x * 24, y * 24); return _rp(Fm, t, x, y); }; }
const BAR_LOOK = {
  '0': ['A pool table. Somebody left the balls racked halfway.', 'Antigo bars field pool teams every fall, in Tavern League play.'],
  '1': ['A pool table. Somebody left the balls racked halfway.', 'Antigo bars field pool teams every fall, in Tavern League play.'],
  '2': ['A dartboard, and a chalk scoreboard beside it.', '(Ask the bartender for darts.)'],
  '3': ['A jukebox. It\'s playing a polka. Somebody always picks the polka.'],
  '4': ['The game is on. Everybody keeps glancing up at the score.'],
};
{ const _rlk = roomLook; roomLook = function (Fm, x, y, t) { if (Fm.kind === 'bar' && t === '5' && !roomNpcAt(Fm, x, y)) return say([['', roomHook(Fm.b).board || 'A chalkboard on an easel.']]);
    if (Fm.kind === 'bar' && BAR_LOOK[t] && !roomNpcAt(Fm, x, y)) return say(BAR_LOOK[t].map(s => ['', s])); return _rlk(Fm, x, y, t); }; }

// ---------- the door: kids need the trenchcoat (and a grown-up in it gets in with a squint) ----------
{ const _er = enterRoom; enterRoom = function (b) {
    if (b && isMinor() && roomKind(b) === 'bar') {
      if (!G.disguise) return say([['Bartender', 'Whoa, hold on there, kiddo. No kids in the bar by themselves.'], ['Bartender', 'Wisconsin law lets kids come in with a parent or a guardian. Not alone. Sorry!']]
        .concat(G.trenchMet ? [] : [['', '(Somebody out on Fifth Avenue might know a way in. Somebody... very tall.)']]));
      return say([['', 'You tug the hat down low and turn up the collar.'], ['Bartender', '...Evening, sir. Tall fella, aren\'t you?']], () => _er(b));
    }
    return _er(b); }; }

// ---------- the two kids in a trenchcoat, out front of the Hoffman House ----------
itemDef('trenchcoat', { name: 'Trenchcoat disguise', kind: 'wear', note: 'A long tan coat, a hat and a fake mustache.' });
{ const _ns = npcSetup; npcSetup = function () {
    _ns(); if (NPCS.some(n => n.id === 'trench')) return;
    const h = BLD.find(b => b.name === 'Hix\'s Hoffman House'); if (h && !h.door && typeof roomDoors === 'function') roomDoors(); if (!h || !h.door) return;
    const [dx, dy] = outsideDoorM(h), f = FDIR[h.face] || [0, 1], side = [-f[1], f[0]];
    let x = dx + side[0] * 3, y = dy + side[1] * 3; if (solidM(x, y)) [x, y] = freeNearM(x, y);
    NPCS.push({ id: 'trench', g: 'trench', x, y, dir: 'down', face0: 'down', hx: x, hy: y, r: 0, t: 0, mx: 0, my: 0, wait: 9999 });
  }; }
function drawTrench(p) {   // Nov 22: drawn by the people generator's pipeline (sprites.js), outlined to match the town's people
  SPR.trench(Math.round(p.x * T), Math.round(p.y * T) - 1, frame);
}
{ const _dn = drawNpc; drawNpc = function (p) { if (p.n.g === 'trench') return drawTrench(p); return _dn(p); }; }
{ const _nt = npcTalk; npcTalk = function (n) {
    if (n.id !== 'trench') return _nt(n);
    n.talking = true; const back = () => { n.talking = false; };
    const first = !G.trenchMet; G.trenchMet = true; saveGame();
    const intro = first ? [['Trenchcoat', 'Psst. Hey. You there.'], ['Trenchcoat', 'We are one (1) normal grown-up. Just standing here. Doing grown-up stuff. Taxes.'],
      ['', 'A smaller voice from somewhere around the belt: "My arms are getting tired."'], ['Trenchcoat', 'Ignore that. That was my stomach.']] : [];
    const has = !!(G.bag && G.bag.trenchcoat);
    if (!isMinor()) return say(intro.concat([['Trenchcoat', 'Oh. You\'re an actual grown-up. Cool cool cool. So are we.'],
      ['Trenchcoat', 'We help kids look tall enough for grown-up places. Banks. Bars. You\'re already tall. Respect.']]), back);
    if (has) return say(intro.concat([['Trenchcoat', G.disguise ? 'Looking sharp. Very... forty.' : 'Put the coat on, kid. A grown-up without a coat is just a kid.'],
      ['Trenchcoat', 'Remember the rules. Root beer only. Never sneeze.']]), back);
    say(intro, () => ask('Trenchcoat: You look like a kid who wants into grown-up places. Banks. Bars. The good stuff.', [
      { t: 'How?', f: () => { bagAdd('trenchcoat'); G.disguise = true; saveGame();
        say([['Trenchcoat', 'We had a spare. A coat, a hat and a mustache. Wear it, and you\'re a grown-up. Basically.'],
          ['Trenchcoat', 'Rule one: only order root beer. Rule two: never sneeze. Rule three: if anybody asks, you\'re forty.'],
          ['', 'You got the trenchcoat disguise, and you put it on. (Open your bag with I to take it off.)']], back); } },
      { t: 'No thanks', f: () => say([['Trenchcoat', 'Suit yourself. We\'ll be right here. Being tall.']], back) }]));
  }; }
{ const _bu = bagUse; bagUse = function (id) {
    const d = ITEMS[id]; if (!d || d.kind !== 'wear') return _bu(id);
    ask(d.name + '. ' + d.note + (G.disguise ? ' You have it on.' : ''), [
      G.disguise ? { t: 'Take it off', f: () => { G.disguise = false; saveGame(); say([['', 'You fold the coat over your arm. Kid again.']], bagOpen); } }
        : { t: 'Put it on', f: () => { G.disguise = true; saveGame(); say([['', 'Coat on, hat low, mustache straight. You look about forty.']], bagOpen); } },
      { t: 'Keep it', f: bagOpen }]); }; }

// ---------- darts: aim across, then up and down; three darts ----------
function dartsStart() { MINI = { k: 'darts', phase: 0, t: 0, ax: 0, ay: 0, left: 3, score: 0, hits: [] }; }
function dartsUpdate(M) {
  M.t++;
  if (M.done) { if (pressed.a || pressed.b) { MINI = null; G.darts = Math.max(G.darts || 0, M.score); saveGame(); say([['Bartender', M.score >= 100 ? 'Nice arm! You should join a league.' : 'Not bad. The board\'s been here longer than both of us.'], ['', 'Score: ' + M.score + '. Your best: ' + G.darts + '.']]); } return; }
  if (pressed.b) { MINI = null; return; }
  const swing = k => Math.sin(M.t / k) * 58;
  if (M.phase === 0) M.ax = swing(14); else if (M.phase === 1) M.ay = swing(11);
  if (pressed.a) {
    if (M.phase === 0) { M.phase = 1; M.t = 0; return; }
    if (M.phase === 1) {
      const wob = () => (Math.random() - 0.5) * 6, hx = M.ax + wob(), hy = M.ay + wob(), r = Math.hypot(hx, hy);
      const pts = r < 5 ? 50 : r < 11 ? 25 : r < 30 ? 15 : r < 46 ? 10 : r < 60 ? 5 : 0;
      M.hits.push([hx, hy, pts]); M.score += pts; M.left--; M.phase = 0; M.t = 0; M.last = pts;
      if (!M.left) M.done = true;
    }
  }
}
function dartsDraw(M) {
  const x = 40, y = 16, w = SW - 80, h = SH - 40; win(x, y, w, h);
  txt('DARTS · ' + M.left + ' LEFT', x + 10, y + 8, '#ffd860', 'left', SMALL); txt('SCORE ' + M.score, x + w - 10, y + 8, '#fff', 'right', SMALL);
  const cx = x + w / 2, cy = y + h / 2 + 4;
  ctx.save(); const ring = (r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.fill(); };
  ring(66, '#1a1418'); ring(60, '#e8dcc0');
  for (let i = 0; i < 20; i++) { ctx.fillStyle = i % 2 ? '#1a1418' : '#e8dcc0'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 58, i * 0.31416 - 0.157, (i + 1) * 0.31416 - 0.157); ctx.fill(); }
  ring(46, '#c83a3a'); ring(42, '#e8dcc0'); ring(30, '#2a8a4a'); ring(26, '#1a1418'); ring(11, '#2a8a4a'); ring(5, '#c83a3a'); ctx.restore();
  for (const [hx, hy] of M.hits) { F('#f0d040', Math.round(cx + hx) - 1, Math.round(cy + hy) - 1, 3, 3); F('#5a5e66', Math.round(cx + hx) + 1, Math.round(cy + hy) - 5, 1, 4); }
  if (!M.done) { const ax = Math.round(cx + M.ax), ay = Math.round(cy + M.ay);
    if (M.phase === 0) F('rgba(255,216,96,.8)', ax, cy - 64, 1, 128); else { F('rgba(255,216,96,.5)', ax, cy - 64, 1, 128); F('rgba(255,216,96,.9)', cx - 64, ay, 128, 1); } }
  txt(M.done ? 'SCORE ' + M.score + ' · A: DONE' : M.phase === 0 ? 'A: STOP THE LINE ACROSS' : 'A: THROW', cx, y + h - 14, M.done ? '#a8f0a8' : '#c8d0f0', 'center', SMALL);
  if (M.last != null && !M.done && M.t < 40) txt(M.last ? '+' + M.last : 'MISS', cx, y + 24, M.last ? '#a8f0a8' : '#f0a8a8', 'center', SMALL);
}
MINIS.darts = [dartsUpdate, dartsDraw];
