"use strict";
// =====================================================================
//  THE STORY MILL (Nov 26). Christian: "The factories can be the dungeons?" and "Make the framework and balance the bosses by
//  levels of the storyline and I will add more to the story and content as we go."
//  The main story's dungeons. The kid's family came to Antigo for a factory job; the town's real mills and plants stay what they
//  are (honest work, never villains). The Story Mill is their inward mirror: Daimon's factory, where real life is pulped into
//  stories that only say yes. It opens behind a door in the Fig Tree basement that wasn't there before.
//  Each CHAPTER is one floor of the Mill: an intake hall, doorways each held by a trope (visible: walk into it to fight), a
//  reading lamp to rest and save at, and a press-room gate with the chapter's archetype behind it. Freed doorways stay open
//  if you walk out and come back. Freeing the archetype ends the chapter and opens the next.
//  BALANCE BY STORYLINE: every chapter has a level (the foes in its doorways); its archetype is two levels above. The chapters
//  climb two levels at a time (3, 5, 7 ... 17), so a party that frees each floor plus a little of the town between chapters
//  (captured houses, shelves, school) arrives near the next floor's level. tests/qmill.py checks every chapter at its level.
//  TO ADD STORY: edit MILL_CHAPTERS below. Every line marked (stand-in) is Christian's to rewrite. A chapter can name any foe
//  in data_foes.js as its archetype; add new foes there and point a chapter at them. The last chapter is left unwritten.
// =====================================================================
const MILL_CHAPTERS = [
  { id: 'judge', title: 'THE GAVEL', lv: 3, up: 1, boss: 'gavel', bg: 'civic',   // the first archetype stands only one level up: a gentler start
    rooms: [['doubt', 'echo'], ['herring', 'suspicion']],
    open: ['The first floor of the Mill. Ledgers stacked to the rafters, every name in them sorted into good and bad.', '(Stand-in: Christian writes Chapter 1.)'],
    gate: 'A courtroom hush behind the door. Something with a very loud voice is waiting to decide what you are.',
    end: ['The gavel comes down on nothing. It was only ever a voice that wanted things simple.', '(Stand-in: Christian writes how Chapter 1 ends.)'] },
  { id: 'shadow', title: 'THE UNCLAIMED DOUBLE', lv: 5, boss: 'double', bg: 'void',
    rooms: [['wisp', 'echo'], ['doubt', 'waiting'], ['suspicion', 'echo', 'wisp']],
    open: ['The second floor. Mirrors on the machines, and in every one a kid who looks like you, a little behind.', '(Stand-in: Christian writes Chapter 2.)'],
    gate: 'Footsteps behind the gate match yours exactly, a half step late.',
    end: ['The double steps into your shadow and stays there. It was always yours to carry.', '(Stand-in.)'] },
  { id: 'mind', title: 'THE MIND THAT CAN\'T STOP SOLVING', lv: 7, boss: 'b_detective', bg: 'street',
    rooms: [['herring', 'narrator'], ['suspicion', 'herring'], ['narrator', 'suspicion', 'herring']],
    open: ['The third floor. String pinned between the machines, photographs, a map of a town that isn\'t this one.', '(Stand-in: Christian writes Chapter 3.)'],
    gate: 'A desk lamp behind the gate. Somebody in there hasn\'t slept in a very long time.',
    end: ['The case closes itself. Not every question was yours to answer tonight.', '(Stand-in.)'] },
  { id: 'mirror', title: 'THE LOVE THAT ONLY REFLECTS YOU', lv: 9, boss: 'b_suitor', bg: 'park',
    rooms: [['gesture', 'sweet'], ['triangle', 'waiting'], ['possessive', 'gesture', 'triangle']],
    open: ['The fourth floor. Roses come off the line by the thousand, every one of them perfect, none of them real.', '(Stand-in: Christian writes Chapter 4.)'],
    gate: 'Behind the gate, someone says your name the way you have always wanted to hear it.',
    end: ['The perfect face goes plain and kind and human. Real people ask something of you. That is how you know.', '(Stand-in.)'] },
  { id: 'wild', title: 'DANGER MISTAKEN FOR PASSION', lv: 11, boss: 'b_wild', bg: 'void',
    rooms: [['possessive', 'door'], ['jump', 'triangle'], ['possessive', 'sweet', 'door']],
    open: ['The fifth floor. The machines run too hot here, and the alarms have been switched off.', '(Stand-in: Christian writes Chapter 5.)'],
    gate: 'Something on the other side of the gate laughs, low, and dares you to come in.',
    end: ['The fire goes back to a hearth. Warm is better than burning.', '(Stand-in.)'] },
  { id: 'chosen', title: 'THE DESTINY THAT ISN\'T YOURS', lv: 13, boss: 'b_chosen', bg: 'library',
    rooms: [['prophecy', 'lordling'], ['upgrade', 'edgemap'], ['lordling', 'prophecy', 'upgrade']],
    open: ['The sixth floor. A press stamps the same prophecy onto a million pages, and every one has your name in it.', '(Stand-in: Christian writes Chapter 6.)'],
    gate: 'Trumpets behind the gate. A crown on a cushion, your size exactly.',
    end: ['The crown is only tin. Ordinary days are the ones you actually get to live.', '(Stand-in.)'] },
  { id: 'time', title: 'THE END THAT IS ALWAYS NEAR', lv: 15, boss: 'b_countdown', bg: 'grid',
    rooms: [['cliff', 'hook', 'drone'], ['drone', 'tghost'], ['hook', 'upgrade', 'drone'], ['tghost', 'cliff', 'drone']],
    open: ['The seventh floor. Every machine has a clock on it, and every clock is counting down.', '(Stand-in: Christian writes Chapter 7.)'],
    gate: 'A ticking behind the gate, loud enough to feel in your teeth.',
    end: ['The clock runs out and nothing ends. There is time. There was always more time than it said.', '(Stand-in.)'] },
  { id: 'dark', title: 'THE FEAR THAT GROWS UNSEEN', lv: 17, boss: 'b_dark', bg: 'void',
    rooms: [['dread', 'jump'], ['bridge', 'suspicion'], ['dread', 'door', 'jump'], ['bridge', 'dread', 'tghost']],
    open: ['The eighth floor. The lights go out one row at a time as you walk in.', '(Stand-in: Christian writes Chapter 8.)'],
    gate: 'No sound at all behind the gate. Only dark, and something breathing in it.',
    end: ['A porch light comes on. The dark is just the night, and the night is fine.', '(Stand-in.)'] },
  { id: 'daimon', title: 'DAIMON', lv: 20, boss: null, bg: 'page', unwritten: true,
    rooms: [],
    open: ['The top floor. The presses are still. One book lies open on a lectern, and its pages are blank.', '(This chapter is unwritten. Christian writes it, and its archetype.)'],
    gate: '', end: [] },
];
const MILL_BOSS_UP = 2;   // the archetype stands this many levels above its floor (a chapter's own `up` overrides it)
// ---------- progress ----------
function millState() { partyEnsure(); if (!G.mill) G.mill = { done: {}, clr: {}, at: 0 }; return G.mill; }
function millOpen(i) { const S = millState(); return i === 0 || !!S.done[MILL_CHAPTERS[i - 1].id]; }
function millNext() { const S = millState(); const i = MILL_CHAPTERS.findIndex(c => !S.done[c.id]); return i < 0 ? MILL_CHAPTERS.length - 1 : i; }
function millCh() { return MILL_CHAPTERS[millState().at] || MILL_CHAPTERS[0]; }
// the level a chapter is balanced for (what the doorways are, and so the party's level the floor expects)
function millLv(c) { return c.lv; }
function millBossLv(c) { return c.lv + (c.up != null ? c.up : MILL_BOSS_UP); }
// ---------- the floor plan, built from the chapter: bottom (the way in) to top (the press room) ----------
// # wall  . floor  c conveyor (walkable)  m press  s paper roll  p stacked pages  1-6 a doorway held by a trope
// L reading lamp (rest)  a armchair  G the press-room gate  X where the archetype waits  e the way out
const MILL_W = 13;
let MILL_ROWS = null, MILL_FOR = -1;
function millRows() {
  const S = millState();
  if (MILL_ROWS && MILL_FOR === S.at) return MILL_ROWS;
  const c = millCh(), out = [], hall = k => k % 2 ? ['#...........#', '#.m.ccccc.s.#', '#...........#'] : ['#...........#', '#.s.ccccc.m.#', '#.p.......p.#'];
  out.push('#############', '#.....X.....#', '#.m.......m.#', '######G######');   // the press room (seen through the gate)
  out.push('#...........#', '#....aLa....#', '#...........#');                   // the reading lamp
  for (let i = c.rooms.length; i >= 1; i--) { out.push('######' + i + '######'); out.push(...hall(i)); }
  out.push('#...........#', '######e######');
  MILL_ROWS = out; MILL_FOR = S.at; return out;
}
const millStart = () => { const r = millRows(); return [6, r.length - 2]; };
function millCleared(i) { const S = millState(), c = millCh(); return !!(S.clr[c.id] && S.clr[c.id][i]); }
function millTileFree(x, y) {
  const r = millRows()[y]; if (!r || x < 0 || x >= r.length) return false; const t = r[x];
  if ('.ce'.includes(t)) return true;
  if (/[1-6]/.test(t)) return millCleared(+t);
  return false;
}
// ---------- fights ----------
let MILL_LV = 0, MILL_UP = MILL_BOSS_UP;
{ const _uf = unitFromFoe; unitFromFoe = function (fid, slot, n) {
  if (!MILL_LV || !FOES[fid]) return _uf.apply(this, arguments);
  const f0 = FOES[fid]; FOES[fid] = Object.assign({}, f0, { lv: MILL_LV + (f0.boss ? MILL_UP : 0) });
  try { return _uf.apply(this, arguments); } finally { FOES[fid] = f0; }
}; }
function millLost() {   // back to the store, rested (battleExit already restored the party): progress on the floor is kept
  G.inside = { f: 'base', x: 6, y: 13 }; G.dir = 'left'; P.t = 0; P.mx = P.my = 0; saveGame();
  say([['', 'The machines roar, the pages close over you...'], ['', '...and you come to on the cool stone of the Fig Tree basement. The doorways you opened are still open.']]);
}
function millFight(i) {
  const c = millCh(), S = millState();
  MILL_LV = millLv(c);
  try {
    battleStart({ foes: c.rooms[i - 1], bg: c.bg }, { ret: 'inside', onLose: millLost,
      onWin: () => { S.clr[c.id] = S.clr[c.id] || {}; S.clr[c.id][i] = 1; saveGame(); say([['', 'The doorway is clear. The trope that held it is gone, and the line behind it runs a little slower.']]); } });
  } finally { MILL_LV = 0; }
}
function millBoss() {
  const c = millCh(), S = millState();
  if (c.unwritten || !c.boss) return say([['', c.open[0]], ['', c.open[1]]]);
  if (c.rooms.some((r, i) => !millCleared(i + 1))) return say([['', 'The gate is shut. The line is still running somewhere behind you.']]);
  ask(c.gate + ' (The archetype of this floor. There is no running from it.)', [
    { t: 'Go in', f: () => { MILL_LV = millLv(c); MILL_UP = millBossLv(c) - millLv(c); try {
      battleStart({ foes: [c.boss], bg: c.bg, boss: 1, noEscape: 1 }, { ret: 'inside', noSkip: 1, onLose: millLost, onWin: () => millDone(c) });
    } finally { MILL_LV = 0; } } },
    { t: 'Not yet' }]);
}
function millDone(c) {
  const S = millState(), first = !S.done[c.id];
  S.done[c.id] = 1; S.clr[c.id] = {};
  const money = first ? 2000 + c.lv * 400 : 0;   // cents: a chapter pays several captured houses (500 + lv x 150)
  if (money) earn(money);
  G.story = Math.max(G.story || 1, MILL_CHAPTERS.indexOf(c) + 2);
  G.inside = { f: 'base', x: 6, y: 13 }; G.dir = 'left'; P.t = 0; P.mx = P.my = 0; saveGame();
  say(c.end.map(l => ['', l]).concat([['', 'The Mill goes quiet, floor by floor, and lets you out where you came in.'],
    ...(money ? [['', 'Folded inside your coat: ' + (typeof money_ === 'function' ? money_(money) : '$' + money / 100) + '. (Stand-in reward.)']] : []),
    ['', 'CHAPTER ' + (MILL_CHAPTERS.indexOf(c) + 1) + ' · ' + c.title + ' · FREED']]));
}
// ---------- the door in the basement ----------
FIG_FLOORS.base.rows[13] = 'Z......W';
const millDoorShown = () => typeof isRPG === 'function' && isRPG() && G && G.party && partyHas('christian');
function millDoor() {
  if (!millDoorShown()) return say([['', 'Old stone foundation, cool to the touch.']]);
  const S = millState(), opts = [];
  MILL_CHAPTERS.forEach((c, i) => { if (!millOpen(i)) return;
    opts.push({ t: 'CH ' + (i + 1) + ' ' + c.title + (S.done[c.id] ? ' (freed)' : c.unwritten ? ' (unwritten)' : ' · LV ' + millLv(c)), f: () => millEnter(i) }); });
  opts.push({ t: 'Not now' });
  ask('A door in the foundation that wasn\'t there before. Behind it, machines: the rhythm of a mill running all night. (THE STORY MILL)', opts);
}
function millEnter(i) {
  const S = millState(), c = MILL_CHAPTERS[i];
  if (S.done[c.id]) return say([['', 'This floor is quiet now. Nothing left running on it.'], ['', '(The Battle Lab, in the menu, replays any fight.)']]);
  S.at = i; MILL_ROWS = null; const [x, y] = millStart();
  G.inside = { f: 'mill', x, y }; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; saveGame();
  say(c.open.map(l => ['', l]).concat([['', 'CHAPTER ' + (i + 1) + ' · ' + c.title + (c.unwritten ? '' : ' · suggested level ' + millLv(c))]]));
}
{ const _fl = figLook; figLook = function (x, y) {
  if (G.inside && G.inside.f === 'base' && figTile(x, y) === 'W') return millDoor();
  return _fl(x, y);
}; }
{ const _dt = drawFigTile; drawFigTile = function (t, sx, sy, x, y, base, up, st) {
  if (t !== 'W') return _dt.apply(this, arguments);
  _dt('Z', sx, sy, x, y, base, up, st);
  if (!millDoorShown()) return;
  const k = IT / 16, pulse = 0.5 + 0.5 * Math.sin(frame / 18);
  F('#2a1a10', sx + 2 * k, sy - 6 * k, 12 * k, 22 * k); F('#4a3020', sx + 3 * k, sy - 5 * k, 10 * k, 20 * k);
  F('#6a4a2a', sx + 3 * k, sy + 2 * k, 10 * k, 1 * k); F('#e8c060', sx + 4 * k, sy + 5 * k, 2 * k, 2 * k);
  F('rgba(240,200,120,' + (0.25 + 0.35 * pulse).toFixed(2) + ')', sx + 2 * k, sy + 15 * k, 12 * k, 1 * k);   // light under the door
}; }
// ---------- the floor ----------
const MILL_LOOK = { m: 'A press, thumping in time. Every stroke stamps the same sentence onto a fresh page.', s: 'A roll of blank paper as tall as you are.',
  p: 'Stacks of finished pages, bound with wire, waiting to go out into the world.', c: 'A conveyor belt carrying pages up toward the press room.',
  '#': 'Brick, sweating a little. The whole building hums.', a: 'An armchair under the lamp, worn soft.' };
FIG_FLOORS.mill = {
  name: 'THE STORY MILL', place: 'THE STORY MILL',
  get rows() { return millRows(); },
  zone: () => { const c = millCh(); return 'CH ' + (MILL_CHAPTERS.indexOf(c) + 1) + ' ' + c.title; },
  free: (x, y) => millTileFree(x, y),
  look: (x, y, t) => {
    const c = millCh();
    if (/[1-6]/.test(t)) return millCleared(+t) ? null : millFight(+t);
    if (t === 'L') return ask('A reading lamp, the only warm light in the building. Rest here?', [{ t: 'Rest (and save)', f: () => { partyRestore(); saveGame(); say([['', 'You sit a while in the lamplight. Everyone is rested. (Saved.)']]); } }, { t: 'Keep going' }]);
    if (t === 'G' || t === 'X') return millBoss();
    if (t === 'e') return;
    if (MILL_LOOK[t]) say([['', MILL_LOOK[t]]]);
  },
  leave: () => { G.inside = { f: 'base', x: 6, y: 13 }; G.dir = 'left'; P.t = 0; P.mx = P.my = 0; saveGame(); say([['', 'Back through the door. The Fig Tree basement smells like old paper and stone, and the machines sound far away.']]); },
  paint: (ox, oy, kx, ky) => {
    const rows = millRows(), W = rows[0].length, H = rows.length, c = millCh(), f = frame, S = millState();
    R(ox - 4, oy - 2 * IT - 2, W * IT + 8, H * IT + 2 * IT + 6, '#07070c');
    R(ox, oy - 2 * IT, W * IT, 2 * IT, '#2a1a1a'); for (let y = oy - 2 * IT + 3; y < oy; y += 6) R(ox, y, W * IT, 1, '#3a2420');
    const Q = (col, x, y, w, h) => R(Math.round(x), Math.round(y), Math.round(w), Math.round(h), col), k = IT / 16;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const sx = ox + x * IT, sy = oy + y * IT, t = rows[y][x]; if (sy < -IT * 2 || sy > SH + IT) continue;
      const h = hash(x * 5 + 9, y * 11);
      Q((x + y) % 2 ? '#2a2a30' : '#26262c', sx, sy, IT, IT); if (h % 4 === 0) Q('#323238', sx + (h % 12) * k, sy + ((h >> 4) % 12) * k, 3 * k, k);
      if (t === '#') { Q('#4a2a22', sx, sy - 4 * k, IT, IT + 4 * k); for (let r = 0; r < 4; r++) Q('#3a201a', sx, sy - 4 * k + r * 5 * k, IT, k); Q((y % 2) ? '#3a201a' : '#422620', sx + 7 * k, sy - 4 * k, k, IT + 4 * k); }
      else if (t === 'c') { Q('#16161a', sx, sy + 3 * k, IT, 10 * k); const o = (f >> 1) % 8; for (let i = -1; i < 3; i++) Q('#3a3a42', sx, sy + 3 * k + ((i * 8 + o) % 16 + 16) % 16 * k * 0.62, IT, k);
        if (hash(x, y) % 2) Q('#e8e0cc', sx + 4 * k, sy + 5 * k - ((f / 3 + x * 7) % 16) * 0, 8 * k, 6 * k); }
      else if (t === 'm') { const st = Math.abs(Math.sin(f / 12 + x)) * 4 * k; Q('#5a5c62', sx + k, sy - 10 * k, 14 * k, 26 * k); Q('#3a3c42', sx + 3 * k, sy - 8 * k + st, 10 * k, 8 * k); Q('#c84a2a', sx + 2 * k, sy + 10 * k, 12 * k, 2 * k); Q('#1c1c20', sx + k, sy + 15 * k, 14 * k, k); }
      else if (t === 's') { Q('#d8d0b8', sx + 2 * k, sy - 2 * k, 12 * k, 17 * k); Q('#b8b098', sx + 2 * k, sy - 2 * k, 12 * k, 3 * k); Q('#8a8470', sx + 7 * k, sy - 2 * k, 2 * k, 3 * k); }
      else if (t === 'p') { for (let i = 0; i < 3; i++) { Q('#e8e0cc', sx + 2 * k, sy + 10 * k - i * 4 * k, 12 * k, 4 * k); Q('#9a9070', sx + 2 * k, sy + 13 * k - i * 4 * k, 12 * k, k); } }
      else if (t === 'a') { Q('#6a2a2a', sx + 2 * k, sy + 2 * k, 12 * k, 12 * k); Q('#8a3a3a', sx + 4 * k, sy + 4 * k, 8 * k, 6 * k); }
      else if (t === 'L') { Q('#3a2a1a', sx + 7 * k, sy - 8 * k, 2 * k, 22 * k); Q('#c8a040', sx + 3 * k, sy - 12 * k, 10 * k, 6 * k); Q('#2a1a10', sx + 4 * k, sy + 13 * k, 8 * k, 2 * k); }
      else if (t === 'G') { const shut = c.rooms.some((r, i) => !millCleared(i + 1)) || c.unwritten;
        Q('#2a2a30', sx - IT, sy - 6 * k, 3 * IT, IT + 6 * k); for (let i = 0; i < 6; i++) Q(shut ? '#6a6c72' : '#8a6a3a', sx - IT + 2 * k + i * 8 * k, sy - 6 * k, 3 * k, IT + 6 * k); Q('#1c1c20', sx - IT, sy + 15 * k, 3 * IT, k); }
      else if (t === 'e') { Q('#4a3020', sx + 2 * k, sy, 12 * k, 16 * k); Q('rgba(240,210,150,.5)', sx + 2 * k, sy + 14 * k, 12 * k, 2 * k); }
    }
    // the reading lamp's warm pool
    const ly = rows.findIndex(r => r.includes('L')), lx = rows[ly].indexOf('L');
    const lg = ctx.createRadialGradient(ox + lx * IT + IT / 2, oy + ly * IT, 4, ox + lx * IT + IT / 2, oy + ly * IT, 3 * IT);
    lg.addColorStop(0, 'rgba(255,220,140,.35)'); lg.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = lg; ctx.fillRect(ox + (lx - 3) * IT, oy + (ly - 3) * IT, 6 * IT, 6 * IT);
    // the tropes in their doorways, and the archetype behind the gate
    const foeAt = (id, cx, by, big) => { const F0 = FOES[id], A = F0 && foeArt({ f: F0 });   // the battle's own stills (or the stand-in sheet), shrunk to the floor
      const bob = Math.round(Math.sin(f / 10 + cx) * 1.5), box = big ? 3.2 * IT : 1.7 * IT;
      R(cx - box * 0.3, by - 3, box * 0.6, 4, 'rgba(0,0,0,.35)');
      if (A) { const s = Math.min(box / A.sw, box / A.sh), w = A.sw * s, h = A.sh * s;
        ctx.imageSmoothingEnabled = true; ctx.drawImage(A.im, A.sx, A.sy, A.sw, A.sh, Math.round(cx - w / 2), Math.round(by - h + bob), Math.round(w), Math.round(h)); ctx.imageSmoothingEnabled = false; }
      else R(cx - 10, by - 24 + bob, 20, 22, '#6a4a8a'); };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const t = rows[y][x];
      if (/[1-6]/.test(t) && !millCleared(+t)) { const room = c.rooms[+t - 1]; foeAt(room[0], ox + x * IT + IT / 2, oy + y * IT + IT - 1, false); }
      if (t === 'X' && c.boss) { const a = S.done[c.id] ? 0 : 0.55 + 0.25 * Math.sin(f / 20); ctx.globalAlpha = a; foeAt(c.boss, ox + x * IT + IT / 2, oy + (y + 2) * IT - 2, true); ctx.globalAlpha = 1; } }
    // the gate's bars again, in front of the archetype: it waits behind them
    { const gy = rows.findIndex(r => r.includes('G')), gx = rows[gy].indexOf('G'), sx = ox + gx * IT, sy = oy + gy * IT, shut = c.unwritten || c.rooms.some((r, i) => !millCleared(i + 1));
      for (let i = 0; i < 6; i++) Q(shut ? '#6a6c72' : '#8a6a3a', sx - IT + 2 * k + i * 8 * k, sy - 6 * k, 3 * k, IT + 6 * k); }
    // the mill is dark: a pool of light around the kid
    const cx = ox + kx * IT + IT / 2, cy = oy + ky * IT + 4, g = ctx.createRadialGradient(cx, cy, 40, cx, cy, 220);
    g.addColorStop(0, 'rgba(8,6,12,0)'); g.addColorStop(1, 'rgba(8,6,12,.7)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
  },
};
// walking into a trope starts its fight (visible foes, as in Chrono Trigger: no random encounters in the Mill)
{ const M = MODES.inside, _u = M.update; M.update = function () {
  if (G && G.inside && G.inside.f === 'mill' && !DLG && !(P.t > 0)) {
    const d = dirHeld();
    if (d) { const [dx, dy] = DIRS[d], nx = G.inside.x + dx, ny = G.inside.y + dy, t = figTile(nx, ny);
      if (/[1-6]/.test(t) && !millCleared(+t)) { G.dir = d; return millFight(+t); }
      if (t === 'G') { G.dir = d; return millBoss(); } }
  }
  return _u.apply(this, arguments);
}; }
// music: the captured-house track suits the inward mill until rfab tracks arrive (music.js picks by floor)
