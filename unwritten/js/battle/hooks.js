"use strict";
// =====================================================================
//  WHERE THE BATTLE SYSTEM MEETS THE TOWN.
//  The Fig Tree is the base (Christian, Nov 16: "I want the store to be the base of the game"): Christian is the first to join;
//  whoever is not in the three waits there, and the party changes, rests and shops there. The others join where they live:
//  Danny at UMA, Cecil at Respawn, Daniel at the Palace, Vox in the library's audiobooks, the Robin out front of the high school.
//  Explore mode (G.explore) has none of this: just the town.
//  Every recruit's lines are stand-ins; Christian writes the story.
// =====================================================================
const isRPG = () => !!(G && !G.explore);
// ---------- the look of the new members in town (the folk palettes; stand-ins until their sheets come) ----------
FOLKS.daniel = { skin: '#dcae88', hair: '#4a3020', shirt: '#1e1e24', shirt2: '#8a2a2a', pants: '#2c2c34', shoes: '#1a1a1a' };
FOLKS.vox = { skin: '#9a6a48', hair: '#1a1210', shirt: '#4a3a6a', shirt2: '#2a2a3a', pants: '#3a3a4a', shoes: '#e8e0d0', extra: 'headset' };
// ---------- items: battle items and gear live in the town's bag and shops; the town's own food heals in a fight ----------
for (const [id, d] of Object.entries(BITEMS)) if (!ITEMS[id]) ITEMS[id] = { name: d.name, kind: 'battle', price: d.price, note: d.desc };
for (const [id, d] of Object.entries(GEAR)) if (!ITEMS[id]) ITEMS[id] = { name: d.name, kind: 'gear', price: d.price, note: d.desc };
const ALCOHOL = /\bbeer|\bale\b|lager|stout|\bipa\b|wine|cocktail|whiske?y|brandy|bourbon|old fashioned|\bshots?\b|seltzer|margarita|mimosa|bloody mary|vodka|\brum\b|\bgin\b|liquor|cider|sangria|martini|\bmule\b|spritz|on tap|pitcher|tavern|brewing/i;
function battleItemDef(id) {
  if (BITEMS[id]) return BITEMS[id];
  const d = ITEMS[id]; if (!d || (d.kind !== 'food' && d.kind !== 'drink') || d.alc || ALCOHOL.test(d.name)) return null;   // no drinking in a fight
  const dollars = (d.price || 300) / 100, from = d.from ? ' From ' + d.from + '.' : '';
  if (d.kind === 'drink' && /coffee|tea\b|latte|espresso|cocoa|chocolate|mocha|chai|cappuccino|americano|cold brew/i.test(d.name)) {
    const n = Math.max(4, Math.min(24, Math.round(dollars * 3)));
    return { name: d.name, tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'clarity', n }], desc: '+' + n + ' Clarity.' + from };
  }
  const hp = Math.max(15, Math.min(150, Math.round(dollars * 10)));
  return { name: d.name, tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'heal', flat: hp }], desc: '+' + hp + ' HP.' + from };
}
function fieldUsePick(d, itemId, back) {   // use an item from the bag on someone in the party
  partyEnsure();
  const done = ids => { const out = []; for (const id of ids) out.push(...fieldApply(d, id)); if (itemId) bagTake(itemId); saveGame(); say([['', out.join(' ') || 'Nothing changed.']], back); };
  if (d.tgt === 'allies') return done(partyIds());
  if (d.tgt === 'down') return say([['', 'Nobody is down. Keep it for a fight.']], back);
  ask('Who gets the ' + d.name + '?', partyIds().map(id => ({ t: memberName(id) + '  ' + hpOf(id) + '/' + memberStats(id).hpMax, f: () => done([id]) })).concat([{ t: 'Never mind', f: back }]));
}
{ const _bu = bagUse; bagUse = function (id) {
  if (!isRPG()) return _bu(id);
  const g = GEAR[id]; if (g) return say([['', g.name + '. ' + g.desc], ['', '(Wear it from the menu: C, then EQUIP.)']], bagOpen);
  const d = battleItemDef(id);
  if (d && BITEMS[id]) return ask(d.name + '. ' + d.desc, [{ t: d.field ? 'Use it' : 'Keep it for a fight', f: () => d.field ? fieldUsePick(d, id, bagOpen) : bagOpen() }, { t: 'Keep it', f: bagOpen }]);
  if (d) return ask(d.name + '. ' + d.desc, [{ t: 'Have it now', f: () => fieldUsePick(d, id, bagOpen) }, { t: 'Save it for a fight', f: bagOpen }]);
  return _bu(id);
}; }
// ---------- the MENU key opens the field menu; rests heal the party ----------
let REST_SEEN = null, REST_G = null;
function restWatch() {
  if (!G || !G.party) return; if (REST_G !== G) { REST_G = G; REST_SEEN = null; }
  const r = G.rested || 0, a = G.adjusted || 0;
  if (REST_SEEN) { if (r !== REST_SEEN[0]) partyRestore(); if (a !== REST_SEEN[1]) partyHealPct(0.5, true); }
  REST_SEEN = [r, a];
}
for (const m of ['walk', 'inside']) {
  const U = MODES[m].update;
  MODES[m].update = function () {
    if (isRPG() && !DLG && !SHOP && P.t === 0 && pressed.menu) { delete pressed.menu; return pmOpen(m); }
    restWatch(); return U.call(this);
  };
}
{ const _lg = loadGame; loadGame = function () { const g = _lg.apply(this, arguments); if (g && !g.explore && g.party === undefined && g.kid) { /* older saves get a party the first time it's needed */ } return g; }; }
// ---------- the base: Christian behind the counter ----------
const SNACK_STOCK = ['figcookie', 'cocoa', 'grilledchz', 'peppermint', 'thermos'], TEA_STOCK = ['chamomile', 'lavender', 'peppermint'];
const COUNTER_STOCK = ['brassclip', 'silkribbon', 'clover', 'tassel', 'librarycard', 'readinglamp', 'baggloves', 'megaphone', 'arcadestick', 'cibcopy', 'clapper', 'headphones', 'cardigan', 'woolcoat'];
function stockList(ids) { return ids.map(id => ({ id, name: (BITEMS[id] || GEAR[id]).name, price: (BITEMS[id] || GEAR[id]).price })); }
function christianBase() {
  partyEnsure(); const joined = partyHas('christian'), O = [];
  if (!joined) O.push({ t: 'Come along?', f: () => say([['Christian', 'Into the books? (Stand-in lines: Christian writes this scene.)'], ['Christian', 'Then this store is where we start, and where we come back. Let me get my coat.']], () => { partyJoin('christian'); say([['', 'CHRISTIAN joined the party.'], ['', '(C opens the menu: items, skills, equipment, the bestiary. The store is home base: change who comes along here.)'], ['', '(Where next: a FICTION shelf here opens the inward places. M opens the map.)'], ['', '(Others join where they live: Danny at UMA, Cecil at Respawn, Daniel at the Palace, Vox at the library, the Robin at the high school. Stand-in hints.)']]); }) });
  O.push({ t: 'Who comes along?', f: () => { pmOpen('inside'); pmOrder(); } });
  O.push({ t: 'Rest upstairs', f: () => { partyRestore(); saveGame(); say([['', 'The reading room upstairs. An armchair, a lamp, a quiet hour.'], ['', 'Everyone is rested. (Saved.)']]); } });
  O.push({ t: 'Bookmarks and gear', f: () => shopOpen('THE COUNTER · STAND-IN STOCK', stockList(COUNTER_STOCK)) });
  O.push({ t: 'Read the Almanac', f: () => { ALM_RETURN = 'inside'; setMode('almanac'); } });
  O.push({ t: 'Just browsing' });
  ask('Christian: Welcome in! ' + (joined ? 'Home base. What do you need?' : 'Books, herbs, snacks and workshops.'), O);
}
// the fiction shelf: a stand-in doorway into the inward places, one chapter at a time (freed stories don't come back)
const SHELF_NAMES = { mystery: 'MYSTERY', romance: 'ROMANCE', darkromance: 'DARK ROMANCE', fantasy: 'FANTASY', scifi: 'SCIENCE FICTION', horror: 'HORROR' };
function fictionDoor() {
  if (!isRPG()) return say([['', 'FICTION. Every genre, waiting on the shelf.']]);
  partyEnsure(); const prog = G.party.shelf || {};
  ask('FICTION. One of the spines is warm, as if somebody just put it back. Step into a book?', Object.keys(SHELF_NAMES).map(s => { const n = prog[s] || 0;
    return { t: SHELF_NAMES[s] + (n >= 4 ? ' (read)' : n === 3 ? ' (last chapter)' : n ? ' (chapter ' + (n + 1) + ')' : ''), f: () => shelfEnter(s) }; }).concat([{ t: 'Not now' }]));
}
function shelfEnter(s) {
  G.party.shelf = G.party.shelf || {}; const n = G.party.shelf[s] || 0;
  if (n >= 4) return say([['', 'You have read this one all the way through. (The Battle Lab, in the menu, replays any fight.)']]);
  say([['', n === 3 ? 'The last chapter. The page goes quiet, the way a room does before something speaks.' : 'The page turns, and the store goes soft at the edges...'], ['', '(A stand-in doorway into the inward places, until the story places them.)']],
    () => battleStart(SHELF_FORMS[s][n], { ret: 'inside', onWin: () => { G.party.shelf[s] = n + 1; saveGame(); say([['', '...and you are back between the shelves, the book closed in your hands.']]); } }));
}
{ const _fl = figLook; figLook = function (x, y) {
  const t = figTile(x, y), f = G.inside.f;
  if (isRPG() && f === 'main' && figChristianHere() && (t === 'X' || ((t === 'c' || t === 'k') && y === 18))) return christianBase();
  if (f === 'main' || f === 'up') {
    if (t === 'K' && /^FICTION/.test(FIG_SHELVES[(x * 7 + y * 3 + (f === 'up' ? 5 : 0)) % FIG_SHELVES.length])) return fictionDoor();
    if (isRPG() && t === 'S') return ask('SNACKS. Something sweet for the walk home. (Each one heals in a fight.)', [{ t: 'Buy', f: () => shopOpen('SNACKS', stockList(SNACK_STOCK)) }, { t: 'Just looking' }]);
    if (isRPG() && t === 'H') return ask('APOTHECARY. Jars of dried herbs and loose teas. (Teas clear the head in a fight.)', [{ t: 'Buy', f: () => shopOpen('APOTHECARY', stockList(TEA_STOCK)) }, { t: 'Just looking' }]);
  }
  if (isRPG() && FIG_FLOORS[f] && FIG_FLOORS[f].bld === 'uma' && t === '9') return ask('A black teardrop heavy bag, scuffed where a thousand hooks have landed. Work the bag? (A practice fight: learn the timed presses.)', [{ t: 'Work the bag', f: () => battleStart('f_heavybag', { practice: true, ret: 'inside' }) }, { t: 'Not now' }]);
  return _fl(x, y);
}; }
// ---------- the recruits (stand-in lines) ----------
function recruitLine(id, lines) { return () => sayFace(id === 'danny' ? 'danny' : null, lines.map(l => [CLASSES[id].name === 'VOX' ? 'Vox' : memberName(id).charAt(0) + memberName(id).slice(1).toLowerCase(), l]), () => { partyJoin(id); say([['', memberName(id) + ' joined the party. (' + CLASSES[id].title + ': ' + CLASSES[id].medium.toLowerCase() + '.)'], ['', (partyIds().includes(id) ? 'They fight with you now.' : 'They will wait at the Fig Tree. Change who comes along there.')]]); }); }
{ const _dt = dannyTalk; dannyTalk = function (back) {
  if (!isRPG() || partyHas('danny')) return _dt(back);
  return askFace('danny', 'Danny: Welcome to UMA. Mats up here, weights downstairs. Beginners are always welcome.', [
    { t: 'Train with us? (join)', f: recruitLine('danny', ['A fight where the body matters? (Stand-in lines.)', 'Then I\'m in. Breathe out on the effort. Let\'s go.']) },
    { t: 'Any tips?', f: () => sayFace('danny', [['Danny', 'Show up. Warm up. Learn to fall before you learn to throw.']], back) }, { t: 'See you around', f: back }]);
}; }
{ const _ct = cecilTalk; cecilTalk = function () {
  if (!isRPG() || partyHas('cecil')) return _ct();
  return ask('Cecil: Welcome to Respawn.', [
    { t: 'Team up? (join)', f: recruitLine('cecil', ['Player two? (Stand-in lines.)', 'I\'ll bring the real cartridges. Box, manual and all.']) },
    { t: 'Just playing', f: () => _ct() }]);
}; }
{ const _pa = palAttendant; palAttendant = function () {
  if (!isRPG() || partyHas('daniel')) return _pa();
  return ask('Attendant: Welcome to the Palace! Two old classics today, and both are free.', [
    { t: 'Is Daniel here?', f: () => say([['Attendant', 'Up in the booth. Hang on.']], recruitLine('daniel', ['You wanted the projectionist? (Stand-in lines: Christian writes Daniel.)', 'Pictures have moved on these walls since 1913. I know how they work. Count me in.'])) },
    { t: 'Just here for the show', f: () => _pa() }]);
}; }
// the library: Vox by the audiobook racks (a stand-in character for radio and audiobooks)
{ const H = ROOM_HOOK['Antigo Public Library']; if (H) { const _lay = H.layout, _look = H.look;
  H.layout = F => { if (_lay) _lay(F); if (!isRPG() || partyHas('vox')) return; const x = F.npcs.length ? Math.max(2, Math.min(F.W - 3, F.npcs[0].x - 4)) : 3, y = F.npcs.length ? Math.max(2, F.npcs[0].y - 2) : 3;
    hookNpc(F, 'vox', x, y, () => ask('Vox: Shh, I\'m in chapter nine. (Headphones down.) The audiobooks are back here, and the old radio dramas.', [
      { t: 'Come along? (join)', f: recruitLine('vox', ['A story you hear in the dark? I know a few. (Stand-in: Vox is a placeholder for radio and audiobooks.)', 'I\'ll bring the voice. You bring the questions.']) }, { t: 'Enjoy the chapter' }]), 'Vox'); };
  H.look = (F, x, y, t, n) => { if (t === 'K' && F.npcs.some(q => q.folk === 'vox' && Math.abs(q.x - x) <= 2 && Math.abs(q.y - y) <= 2)) { say([['', 'AUDIOBOOKS. Discs and players in cases, and a row of old radio dramas on cassette.']]); return true; } return _look ? _look(F, x, y, t, n) : false; }; } }
// the Robin: out front of the high school (the town's collective character)
{ const _la = lookAt; lookAt = function (x, y) {
  const b = typeof bldgAtM === 'function' ? bldgAtM(x, y) : null;
  if (isRPG() && b && /HIGH SCHOOL/i.test(b.name || '') && !partyHas('robin')) return ask('The Antigo Red Robin is out front of the school, as if the whole town sent it. It tilts its head at you.', [
    { t: 'Come with us?', f: recruitLine('robin', ['(Stand-in: the Robin is the town\'s collective character. Christian writes how it speaks.)', 'It ruffles its feathers. Everybody you have ever passed on Fifth Avenue is in there somewhere.']) }, { t: 'Wave and go' }]);
  return _la(x, y);
}; }
// ---------- the field menu's ORDER: rows and order anywhere; who is in the three only at the base ----------
{ const _po = pmOrder; pmOrder = function () {
  const P = partyEnsure(), base = atBase() || (PMN && PMN.ret === 'inside' && G.inside && /^(main|up|base)$/.test(G.inside.f));
  const rows = P.order.map((id, i) => ({ t: (i < 3 ? 'IN  ' : '    ') + memberName(id), right: (P.m[id].row || CLASSES[id].row).toUpperCase(), desc: CLASSES[id].title + ': ' + CLASSES[id].medium + '. A: ' + (base ? 'pick, then pick another to swap.' : 'move up one.') + ' LEFT/RIGHT: row.',
    f: () => { if (PMN.swap == null) { PMN.swap = i; PMN.view.note = 'Swap ' + memberName(id) + ' with...'; return; } const j = PMN.swap; PMN.swap = null;
      if (!base && (i >= 3 || j >= 3)) { pmBack(); pmOrder(); return pmMsg('The others wait at the Fig Tree. Change who comes along there.'); }
      [P.order[i], P.order[j]] = [P.order[j], P.order[i]]; saveGame(); pmBack(); pmOrder(); PMN.view.sel = i; } }));
  const teams = teamBonuses(partyIds());
  pmList(base ? 'WHO COMES ALONG (THE FIRST THREE)' : 'ORDER AND ROWS', rows, { note: teams.length ? 'Together: ' + teams.map(t => t.name + ' (' + t.desc + ')').join(' ') : 'Team bonuses come from who fights together.',
    onLR: k => { const id = P.order[k], M = P.m[id]; M.row = (M.row || CLASSES[id].row) === 'front' ? 'back' : 'front'; saveGame(); pmBack(); pmOrder(); PMN.view.sel = k; } });
  PMN.swap = null;
}; }
