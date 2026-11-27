"use strict";
// =====================================================================
//  CAPTURED AT HOME (Nov 26, Christian: "monsters in houses that are capturing people in different media fantasies").
//  Some houses around town have someone in them caught in a story: a show that plays the next episode by itself, a feed,
//  an online game, a romance, true crime in the dark, a mystery they have to solve tonight. The town stays grounded: from
//  the street you only see the light behind the curtains. Someone in the house answers the door and asks for help; you
//  sit down beside the captured one and go inward, where the story's tropes are the foes (two fights, then its boss).
//  Freed, they come back to the room and the family pays you and hands you something from the kitchen.
//  Rules kept: every home and person here is invented and generic (rooms_homes.js); no addresses or names on screen;
//  no brand names for the media; nobody is mocked, and nobody is told to quit: they come back to balance, not abstinence.
//  Foes come from the existing roster, at a level set by how far the house is from the Fig Tree (the farther out, the
//  harder, as in Dragon Quest). Lines are stand-ins until Christian writes them. Explore mode (G.explore) has none of this.
// =====================================================================
const CAP_MEDIA = {
  binge: { glow: '#8ab8ff', fights: [['cliff', 'hook'], ['hook', 'tghost', 'cliff']], boss: 'b_countdown', bg: 'void',
    tell: 'Blue light flickers behind the drawn curtains, the way a TV does at night.',
    plea: who => `Oh! You're the kid from the bookstore? Come in. ${who.cap} started a show on Friday and hasn't really gotten up since. It just keeps playing the next one.`,
    caught: 'The TV glows. The next episode starts on its own. "Mm. Just one more."',
    back: 'Huh. It\'s dark out. ... I like that show. I just didn\'t mean to give it the whole weekend.' },
  feed: { glow: '#d6e2ff', fights: [['wisp', 'echo'], ['doubt', 'echo', 'wisp']], boss: 'b_suitor', bg: 'grid',
    tell: 'A small cold light moves behind the curtains: a phone screen, held close.',
    plea: who => `Hi. Could you try talking to ${who.obj}? ${who.cap} has been scrolling since lunch. I say something and get a nod, but nobody's home.`,
    caught: 'A thumb keeps moving. Their face is lit blue. "Hang on. I\'m just catching up."',
    back: 'Wait, what time is it? ... Okay. The phone can charge in the kitchen for a while.' },
  game: { glow: '#70f0a0', fights: [['upgrade', 'drone'], ['tghost', 'upgrade', 'drone']], boss: 'b_chosen', bg: 'grid',
    tell: 'Green light pulses behind the blinds, and a controller clicks somewhere inside.',
    plea: who => `Thank goodness. ${who.cap} has been in that game since yesterday. Says the whole team needs ${who.obj}. Maybe ${who.sub}'ll listen to you.`,
    caught: 'A controller clicks. "Can\'t pause, it\'s online. Two more minutes." It has been two more minutes for a while.',
    back: 'Good match. ... I\'m going to eat something real. Then maybe play again. Tomorrow.' },
  romance: { glow: '#ffb8c8', fights: [['gesture', 'triangle'], ['waiting', 'triangle', 'gesture']], boss: 'b_wild', bg: 'park',
    tell: 'A warm reading lamp burns behind the curtains, long past when the rest of the street went dark.',
    plea: who => `Oh, hi. ${who.cap} is on the fourth book of a series this week. ${who.Sub} won't come to supper. Would you try?`,
    caught: 'A paperback held close, a tall stack by the chair. "Shh. They\'re finally about to... shh."',
    back: 'I\'ll finish it later. It\'s a good book. ... When did I last call anyone back?' },
  dark: { glow: '#f4f0d8', fights: [['dread', 'jump'], ['bridge', 'suspicion', 'dread']], boss: 'b_dark', bg: 'void',
    tell: 'Every light in the house is on, even in the middle of the day.',
    plea: who => `Come in, come in. ${who.cap} listens to those true-crime shows all day now. Every light in the house is on, and ${who.sub} keeps checking the locks.`,
    caught: 'Earbuds in, a lamp on in every corner. "Did you lock the door behind you? Check the door."',
    back: 'I don\'t know why I listen to those at night. ... I think I\'ll turn a few lights off.' },
  case: { glow: '#ffe0a0', fights: [['herring', 'narrator'], ['suspicion', 'narrator', 'herring']], boss: 'b_detective', bg: 'street',
    tell: 'A desk lamp burns behind the curtains, and papers are taped to the window.',
    plea: who => `Hi. ${who.cap} got into a mystery, a real old case online, and now it's printouts all over the table. ${who.Sub} hasn't slept much. Could you help?`,
    caught: 'Printouts and notes everywhere. "I almost have it. I know who did it. I just need one more clue."',
    back: 'I don\'t actually have to solve it tonight, do I. ... Is there coffee?' },
};
const CAP_WHO = [
  { cap: 'Dad', obj: 'him', sub: 'he', Sub: 'He' }, { cap: 'Mom', obj: 'her', sub: 'she', Sub: 'She' },
  { cap: 'My brother', obj: 'him', sub: 'he', Sub: 'He' }, { cap: 'My sister', obj: 'her', sub: 'she', Sub: 'She' },
  { cap: 'Grandpa', obj: 'him', sub: 'he', Sub: 'He' }, { cap: 'Grandma', obj: 'her', sub: 'she', Sub: 'She' },
  { cap: 'My roommate', obj: 'them', sub: 'they', Sub: 'They' }];
const CAP_RATE = 2;   // percent of houses: about 60 in town
const CAP_ITEMS = ['cocoa', 'grilledchz', 'chamomile', 'peppermint', 'cocoa', 'grilledchz'];
// ---------- which houses ----------
let CAP_LIST = null, CAP_FOR = null;
function capSeed() { if (!G) return 1; if (!G.capSeed) G.capSeed = 1 + (G.started || Date.now()) % 99991; return G.capSeed; }
function capBuild() {
  if (CAP_LIST && CAP_FOR === capSeed()) return CAP_LIST;
  CAP_FOR = capSeed(); CAP_LIST = new Map();
  const fig = BLD[TOWN.fig], fx = (fig.pxMin + fig.pxMax) / 2, fy = (fig.pyMin + fig.pyMax) / 2, keys = Object.keys(CAP_MEDIA);
  for (const b of BLD) {
    if (!b.door || typeof homeEligible !== 'function' || !homeEligible(b)) continue;
    const h = hash(b.id * 7 + 3, CAP_FOR); if (h % 100 >= CAP_RATE) continue;
    const km = Math.hypot((b.pxMin + b.pxMax) / 2 - fx, (b.pyMin + b.pyMax) / 2 - fy) * 4 / 1000;
    const lv = Math.max(2, Math.min(22, Math.round(2 + km * 4.5)));   // about 3 near downtown, 10 across town, 20 at the edge
    CAP_LIST.set(b.id, { b, med: keys[(h >>> 8) % keys.length], who: CAP_WHO[(h >>> 12) % CAP_WHO.length], lv, item: CAP_ITEMS[(h >>> 16) % CAP_ITEMS.length] });
  }
  return CAP_LIST;
}
const capOn = () => typeof isRPG === 'function' && isRPG() && G && G.party;
function capOf(b) { if (!b || !capOn()) return null; const c = capBuild().get(b.id); return c && !(G.caps && G.caps[b.id]) && capRoomOk(c) ? c : null; }
// a house too small or odd for an inside (rooms.js gives no floor) can't hold a capture: checked once, the first time it matters
function capRoomOk(c) { if (c.ok == null) { try { c.ok = !!roomFloor(c.b); } catch (e) { c.ok = false; } } return c.ok; }
function capFreed(b) { return !!(b && G && G.caps && G.caps[b.id]); }
// ---------- foes at the house's level (the roster's own foes, stats from the level) ----------
let CAP_LV = 0;
{ const _uf = unitFromFoe; unitFromFoe = function (fid, slot, n) {
  if (!CAP_LV || !FOES[fid]) return _uf.apply(this, arguments);
  const f0 = FOES[fid]; FOES[fid] = Object.assign({}, f0, { lv: CAP_LV + (f0.boss ? 2 : 0) });
  try { return _uf.apply(this, arguments); } finally { FOES[fid] = f0; }
}; }
function capFight(c, i) {
  const M = CAP_MEDIA[c.med], last = i === M.fights.length;
  const F = last ? { foes: [M.boss], bg: M.bg, boss: 1, noEscape: 1 } : { foes: M.fights[i], bg: M.bg };
  CAP_LV = c.lv;
  try {
    battleStart(F, { ret: 'inside', noSkip: last ? 1 : 0,
      onWin: () => last ? capWon(c) : say([['', i === 0 ? 'It doesn\'t let go yet. Deeper in, the story keeps going.' : 'Something bigger is holding the rest of it together.']], () => capFight(c, i + 1)),
      onLose: () => say([['', 'The glow folds over you, and you come to on the couch beside them. They haven\'t noticed.'], ['', '(Rest, then try again.)']]) });
  } finally { CAP_LV = 0; }
}
function capWon(c) {
  G.caps = G.caps || {}; G.caps[c.b.id] = 1;
  const M = CAP_MEDIA[c.med], money = 500 + c.lv * 150, item = BITEMS[c.item] ? c.item : 'cocoa';
  earn(money); if ((G.bag[item] || 0) < RULES.itemCap) bagAdd(item);
  saveGame();
  say([['', CAP_END[c.med] || 'The story lets go, and the room is just a room again.'], ['', '"' + M.back + '"'],
    ['', 'Thank you. Really. Here, for your trouble, and something from the kitchen for the road.'],
    ['', 'You got ' + money_(money) + ' and a ' + BITEMS[item].name + '.']]);
}
const CAP_END = { binge: 'The light shrinks back into the screen, and the room is just a room again.', feed: 'The glow shrinks to a phone face-down on the cushion, and the room is just a room again.',
  game: 'The match ends, the screen goes to its menu, and the room is just a room again.', romance: 'The page settles, a bookmark slides in, and the room is just a room again.',
  dark: 'The voice in the earbuds goes quiet, and the house is just a house again.', case: 'The papers are only papers again, and the room is just a room again.' };
const money_ = c => typeof money === 'function' ? money(c) : '$' + (c / 100).toFixed(2);
// ---------- inside: the one who answers, and the one who is caught ----------
{ const _hl = homeLayout; homeLayout = function (Fm, c) {
  const r = _hl.apply(this, arguments);
  const C = capOn() && capBuild().get(Fm.b && Fm.b.id); if (!C) return r;
  const hh = Fm.hh, living = hh && hh.rooms.find(q => q.type === 'living') || hh && hh.rooms[0];
  let res = Fm.npcs.find(n => /^h_res/.test(n.folk));
  if (!res && living) {
    const tv = [...hh.M.values()].find(m => m.t === 'h_tv' || m.t === 'h_sofa');
    const x = tv ? tv.ax : Math.round((living.x0 + living.x1) / 2), y = tv ? Math.min(living.y1, tv.ay + 2) : Math.round((living.y0 + living.y1) / 2);
    const n0 = Fm.npcs.length; hookNpc(Fm, 'h_res' + (C.b.id % 4), x, y, null); if (Fm.npcs.length > n0) res = Fm.npcs[Fm.npcs.length - 1];
  }
  if (res) res.talk = () => capTalk(C);
  if (C.med === 'binge' || C.med === 'game') hh.tvOn = true;
  const n1 = Fm.npcs.length; const famFolk = 'h_res' + ((+(res && res.folk.slice(5)) || 0) + 1 + (C.b.id % 3)) % 4; hookNpc(Fm, famFolk, Math.min(Fm.W - 2, Fm.ex + 1), Math.max(1, Fm.ey - 1), null);
  if (Fm.npcs.length > n1) Fm.npcs[Fm.npcs.length - 1].talk = () => capFamily(C);
  return r;
}; }
function capTalk(C) {
  const M = CAP_MEDIA[C.med];
  if (capFreed(C.b)) return say([['', '"' + M.back + '"']]);
  ask(M.caught, [{ t: 'Sit down beside them', f: () => say([['', 'You sit down beside them. The glow gets bigger, and the living room goes soft at the edges...']], () => capFight(C, 0)) }, { t: 'Not yet' }]);
}
function capFamily(C) {
  if (capFreed(C.b)) return say([['', 'It\'s quieter in here now. The good kind of quiet.']]);
  say([['', CAP_MEDIA[C.med].plea(C.who)]]);
}
// walking in: whoever is home answers the door
{ const _er = enterRoom; enterRoom = function (b) {
  const r = _er.apply(this, arguments), C = capOf(b);
  if (C && DLG && mode === 'inside') DLG.lines.push(['', CAP_MEDIA[C.med].plea(C.who)]);
  return r;
}; }
// from the street: the light behind the curtains
// (a caught house never shows its street address: the story is invented, the house is real, and the two stay apart)
{ const _la = lookAt; lookAt = function (x, y) {
  const b = typeof bldgAtM === 'function' ? bldgAtM(x, y) : null, C = capOf(b), r = _la(x, y);
  if (C && mode === 'walk' && !(DLG && DLG.opts && DLG.opts.length && /Sit down/.test(DLG.opts[0].t))) say([['', b.type === 'farmhouse' ? 'A FARMHOUSE' : 'A HOUSE'], ['', CAP_MEDIA[C.med].tell], ['', 'Someone in there might need a hand.']]);
  return r;
}; }
// the glow, drawn at the front of each caught house near you: a window lit the medium's color, flickering
function capDraw() {
  if (!capOn() || DLG) return;
  const now = frame; let built = 0;
  for (const C of capBuild().values()) {
    if (G.caps && G.caps[C.b.id]) continue;
    if (C.ok == null && built++ > 0) continue; if (!capRoomOk(C)) continue;   // at most one new inside built per frame
    const b = C.b, wx = b.face === 'S' || b.face === 'N' ? doorM(b)[0] / CPD : b.pxMin + (b.pxMax - b.pxMin) * 0.35, wy = b.pyMax;   // the street-facing (south) wall you can see
    if (Math.abs(wx - G.x / CPD) > 14 || Math.abs(wy - G.y / CPD) > 11) continue;
    const sx = Math.round((wx - camX) * T + (b.face === 'S' || b.face === 'N' ? 1.4 * PM : 0)), sy = Math.round((wy - camY) * T - 2.3 * PM);
    const fl = C.med === 'binge' || C.med === 'game' ? 0.55 + 0.45 * Math.abs(Math.sin(now / 7 + b.id) * Math.sin(now / 13)) : 0.75 + 0.25 * Math.sin(now / 40 + b.id);
    const g = ctx.createRadialGradient(sx, sy, 1, sx, sy, 18); g.addColorStop(0, CAP_MEDIA[C.med].glow); g.addColorStop(0.35, CAP_MEDIA[C.med].glow + '88'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.85 * fl; ctx.fillStyle = g; ctx.fillRect(sx - 18, sy - 18, 36, 36); ctx.globalAlpha = 1;
  }
}
{ const W = MODES.walk, d = W.draw; W.draw = function () { d.call(this); if (mode !== 'walk') return; try { capDraw();
  // the name box at the top left: a caught house shows only "A HOUSE", never its address
  const b = !DLG && bldgAtM(...facing()), C = capOf(b);
  if (C) { ctx.font = SMALL; const w = ctx.measureText(b.addr || '').width + 10, n = b.type === 'farmhouse' ? 'A FARMHOUSE' : 'A HOUSE'; R(3, 3, w + 2, 16, '#000'); win(4, 4, Math.max(ctx.measureText(n).width + 10, w), 14); txt(n, 9, 8, '#fff', 'left', SMALL); }
} catch (e) {} }; }
