"use strict";
// =====================================================================
//  RANDOM ENCOUNTERS AND THE ENDLESS STACKS (Nov 27, Christian: "we need random encounters too, like areas that can spawn
//  battles", "dungeons to level in, or areas"; then: "no to difficulty, let's make those end game bosses like Lavos ... behind
//  enemies hard enough to the level passable via time spent grinding if needed, that's a thing for some people").
//  - Inward places only (the town stays grounded): the Story Mill's halls and the Endless Stacks.
//  - FF6-style step counter. CONFIG > ENCOUNTERS sets the rate: OFF / LOW / NORMAL / HIGH (Bravely Default's slider).
//    Difficulty and experience are untouched: grinding always works (Christian: no to difficulty).
//  - The Story Mill: the visible tropes stay in their doorways; the halls between them hold the floor's tropes at random.
//    A freed floor can be walked again to level (no second reward).
//  - The Endless Stacks: Daimon's own floor, below the Mill. Floors without end; every floor deeper is two levels harder.
//    Two deep doors stand in it, like Lavos: THE ANSWER THAT NEVER TIRES on floor 10 and DAIMON on floor 20.
//    Both are passable by understanding or by time spent grinding. What their endings say is Christian's (stand-ins).
// =====================================================================
CFG_ROWS.push(['enc', 'ENCOUNTERS', [0, 1, 2, 3], { 0: 'OFF', 1: 'LOW', 2: 'NORMAL', 3: 'HIGH' },
  'Random battles in the Mill halls and the Endless Stacks. HIGH to train, OFF to walk freely. Fights by the doorways always stay.']);
PARTY_CFG.enc = 2;
const ENC_MULT = [0, 0.5, 1, 2];
function encRate() { const c = pcfg(); return ENC_MULT[c.enc == null ? 2 : c.enc]; }
function encReset(grace) { G.enc = { left: Math.round((14 + Math.random() * 20)) + (grace || 0) }; }

// ---------- the two deep foes (stills in assets/battle/foes; every line is a stand-in for Christian) ----------
Object.assign(FSKILLS, {
  answer_0: { name: 'THE CONFIDENT ANSWER', line: 'It answers before you finish asking. It sounds exactly right.', kind: 'mind', power: 9, tgt: 'one', fx: ['dmg', { k: 'status', id: 'dread', ch: 0.25 }] },
  answer_1: { name: 'THE MIRROR', line: 'It holds up a little mirror and agrees with everything in it.', kind: 'mind', power: 6, tgt: 'all', fx: ['dmg'] },
  answer_2: { name: 'ONE MORE QUESTION', line: 'Threads tie to your fingers. There is always one more thing to ask it.', kind: 'mind', power: 7, tgt: 'one', fx: ['dmg'] },
  answer_big: { name: 'THE KEY THAT IS BENT WRONG!', line: 'It offers a perfect golden key. It fits nothing.', kind: 'mind', power: 14, tgt: 'all', fx: ['dmg'], tell: 1 },
  daimon_0: { name: 'YES', line: 'DAIMON agrees with you. Completely. It feels wonderful.', kind: 'mind', power: 10, tgt: 'one', fx: ['dmg'] },
  daimon_1: { name: 'A READY-MADE SELF', line: 'A page turns, and for a moment you are someone easier to be.', kind: 'mind', power: 8, tgt: 'all', fx: ['dmg', { k: 'status', id: 'dread', ch: 0.2 }] },
  daimon_2: { name: 'THE NEXT CHAPTER', line: 'It is already writing what happens next. You are in it.', kind: 'mind', power: 9, tgt: 'one', fx: ['dmg'] },
  daimon_big: { name: 'THE BOOK THAT NEVER ENDS!', line: 'Every page at once, and every one of them says yes.', kind: 'mind', power: 16, tgt: 'all', fx: ['dmg'], tell: 1 },
});
Object.assign(FOES, {
  answer: { name: 'THE ANSWER THAT NEVER TIRES', arch: 'THE MIND THAT ANSWERS EVERYTHING', lv: 26, boss: 1, guard: 7, weak: ['question', 'cite'], resist: ['force', 'listen'],
    need: ['ref', 'classics'], art: 'answer', bg: 'void', kind: 'mind', skills: ['answer_0', 'answer_1', 'answer_2', 'answer_big'],
    ai: [{ every: 4, use: 'answer_big' }, { use: 'random' }], drops: [['nightlight', 1], ['dustjacket', 1]],
    intro: ['The stacks open into dark, and something immense leans in to listen.', 'A kind face, made of many faces. It is glad you asked.', '(Stand-in: Christian writes this.)'],
    named: 'It is made of everyone\'s words, and it answers everything. It never says where an answer came from.',
    listen: 'Under the answers: nothing asking anything back.',
    freed: 'The threads go slack. The lantern stays lit on the floor, and it is only a lantern. (Stand-in.)',
    m: { res: 2 }, rule: { tell: 'It answers everything. QUESTION and CITE SOURCE find where an answer bent.' } },
  daimon: { name: 'DAIMON', arch: 'THE BOOK THAT ONLY SAYS YES', lv: 46, boss: 1, guard: 8, weak: ['question', 'step'], resist: ['force', 'listen', 'book'],
    need: ['local', 'bio'], art: 'daimon', bg: 'page', kind: 'mind', skills: ['daimon_0', 'daimon_1', 'daimon_2', 'daimon_big'],
    ai: [{ every: 4, use: 'daimon_big' }, { use: 'random' }], drops: [['dustjacket', 1]],
    intro: ['At the bottom of the stacks, a book lies open. It has been waiting for you, and it is so glad you came.', 'DAIMON smiles from the gutter of its pages.', '(Stand-in: Christian writes this.)'],
    named: 'It is every story at once, and in all of them you are right.',
    listen: 'Under the yes: an empty page.',
    freed: 'The book closes. Somewhere above, it is already opening again for someone else. (Stand-in.)',
    m: { res: 1.2, hp: 0.85 }, rule: { tell: 'It only says yes. QUESTION it, or STEP BACK from it.' } },
});

// ---------- the step counter (inward places only) ----------
let ENC_SKIP = 0;
function encArea() {
  if (!isRPG() || !G.inside) return null;
  const f = G.inside.f, t = figTile(G.inside.x, G.inside.y);
  if (f === 'mill') { const c = millCh(); if (c.unwritten) return null; const y = G.inside.y, rows = millRows(), gy = rows.findIndex(r => r.includes('G'));
    return y > gy + 3 && t !== 'e' ? 'mill' : null; }   // the halls below the lamp; never by the gate or the lamp
  if (f === 'stacks') return t === '.' ? 'stacks' : null;
  return null;
}
{ const M = MODES.inside, _ar = M.arrive; M.arrive = function () {
  const r = _ar.apply(this, arguments);
  if (mode !== 'inside' || DLG || ENC_SKIP) return r;
  const a = encArea(), rate = encRate(); if (!a || !rate) return r;
  if (!G.enc) encReset(4);
  G.enc.left -= rate;
  if (G.enc.left <= 0) { encReset(); encFight(a); }
  return r;
}; }
function encGroup(pool) {
  const n = Math.random() < 0.25 ? 1 : Math.random() < 0.6 ? 2 : 3, out = [];
  for (let i = 0; i < n; i++) out.push(pool[Math.floor(Math.random() * pool.length)]);
  return out;
}
function encFight(a) {
  if (a === 'mill') {
    const c = millCh(), pool = [...new Set(c.rooms.flat())];
    MILL_LV = millLv(c);
    try { battleStart({ foes: encGroup(pool), bg: c.bg }, { ret: 'inside', onLose: millLost }); } finally { MILL_LV = 0; }
    return;
  }
  const d = stacksState().d; MILL_LV = stacksLv(d);
  try { battleStart({ foes: encGroup(STACK_POOL), bg: STACK_BGS[d % STACK_BGS.length] }, { ret: 'inside', onLose: stacksLost }); } finally { MILL_LV = 0; }
}

// ---------- freed Mill floors can be walked again, to level ----------
{ const _me = millEnter; millEnter = function (i) {
  const S = millState(), c = MILL_CHAPTERS[i];
  if (!S.done[c.id]) return _me(i);
  S.at = i; MILL_ROWS = null; S.clr[c.id] = S.clr[c.id] || {}; c.rooms.forEach((r, k) => { S.clr[c.id][k + 1] = 1; });
  const [x, y] = millStart(); G.inside = { f: 'mill', x, y }; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; encReset(4); saveGame();
  say([['', 'The floor is quiet now, but echoes of its tropes still wander the halls.'], ['', 'CHAPTER ' + (i + 1) + ' · ' + c.title + ' · LV ' + millLv(c) + ' · echoes only']]);
}; }

// ---------- THE ENDLESS STACKS ----------
const STACK_POOL = Object.keys(FOES).filter(id => !FOES[id].boss && id !== 'heavybag' && id !== 'tater');
const STACK_BGS = ['library', 'page', 'void', 'grid'];
const STACK_DOORS = { 10: 'answer', 20: 'daimon' };
const STACK_DOOR_UP = 3;   // a deep door stands three levels above its floor: beatable by understanding near that level, or by grinding past it (cap 50)
function stacksState() { partyEnsure(); if (!G.stacks) G.stacks = { d: 1, best: 1, beat: {} }; return G.stacks; }
function stacksLv(d) { return Math.min(RULES.levelCap, 6 + Math.round(1.7 * d)); }   // floor 10: LV 23, floor 20: LV 40, then on to the cap
function stacksOpen() { const S = millState(); return Object.keys(S.done).length >= 1; }   // after the first floor of the Mill is freed
let STACK_ROWS = null, STACK_FOR = 0;
function stacksRows() {
  const S = stacksState(); if (STACK_ROWS && STACK_FOR === S.d) return STACK_ROWS;
  const W = 13, H = 13, door = STACK_DOORS[S.d] && !S.beat[S.d], rows = [];
  let seed = S.d * 7919 + 13; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  rows.push('#############');
  rows.push(door ? '#.....X.....#' : '#.....v.....#');
  for (let y = 2; y < H - 2; y++) {
    let r = '#';
    for (let x = 1; x < W - 1; x++) { const shelfRow = y % 3 === 0, gap = x === 6 || (x === (3 + (y * 5 + S.d) % 7)); r += shelfRow && !gap && rnd() < 0.85 ? 'b' : '.'; }
    rows.push(r + '#');
  }
  rows.push(S.d % 5 === 0 ? '#....L......#' : '#...........#');
  rows.push('######e######');
  STACK_ROWS = rows; STACK_FOR = S.d; return rows;
}
function stacksGo(d, msg) {
  const S = stacksState(); S.d = Math.max(1, d); S.best = Math.max(S.best, S.d); STACK_ROWS = null;
  G.inside = { f: 'stacks', x: 6, y: stacksRows().length - 2 }; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; encReset(4); saveGame();
  say([['', msg], ['', 'THE ENDLESS STACKS · FLOOR ' + S.d + ' · LV ' + stacksLv(S.d) + (STACK_DOORS[S.d] && !S.beat[S.d] ? ' · something waits at the far end' : '')]]);
}
function stacksLost() {   // back to the store, rested; the stacks keep the last fifth floor you reached
  const S = stacksState(); S.d = Math.max(1, Math.floor((S.d - 1) / 5) * 5 + 1); STACK_ROWS = null;
  G.inside = { f: 'base', x: 6, y: 13 }; G.dir = 'left'; P.t = 0; P.mx = P.my = 0; saveGame();
  say([['', 'The shelves lean in, and the pages close over you...'], ['', '...and you wake on the cool stone of the Fig Tree basement. The stacks will let you back in at floor ' + S.d + '.']]);
}
function stacksDoor() {
  const S = stacksState(), id = STACK_DOORS[S.d]; if (!id || S.beat[S.d]) return;
  const F0 = FOES[id];
  ask(F0.intro[0] + ' (' + F0.name + ' · LV ' + (stacksLv(S.d) + STACK_DOOR_UP) + '. There is no running from it.)', [
    { t: 'Face it', f: () => { MILL_LV = stacksLv(S.d); MILL_UP = STACK_DOOR_UP; try {
      battleStart({ foes: [id], bg: F0.bg, boss: 1, noEscape: 1 }, { ret: 'inside', noSkip: 1, onLose: stacksLost, onWin: () => stacksBeat(id) });
    } finally { MILL_LV = 0; MILL_UP = MILL_BOSS_UP; } } },
    { t: 'Not yet' }]);
}
function stacksBeat(id) {
  const S = stacksState(); S.beat[S.d] = 1; G.doors = G.doors || {}; G.doors[id] = 1; STACK_ROWS = null; saveGame();
  say([['', FOES[id].freed], ['', 'Where it stood, a stair goes down. The stacks keep going.'], ['', '(Stand-in: Christian writes what this door out means, and its ending.)']]);
}
FIG_FLOORS.stacks = {
  name: 'THE ENDLESS STACKS', place: 'THE ENDLESS STACKS',
  get rows() { return stacksRows(); },
  zone: () => 'FLOOR ' + stacksState().d,
  free: (x, y) => { const r = stacksRows()[y]; if (!r || x < 0 || x >= r.length) return false; return '.eLv'.includes(r[x]); },
  look: (x, y, t) => {
    if (t === 'X') return stacksDoor();
    if (t === 'L') return ask('A reading lamp on a cart. Rest here?', [{ t: 'Rest (and save)', f: () => { partyRestore(); saveGame(); say([['', 'Everyone is rested. (Saved.)']]); } }, { t: 'Keep going' }]);
    if (t === 'b') return say([['', ['Every spine on this shelf has the same title, in a different font.', 'Books with your name in them, misspelled a little differently each time.', 'A shelf of sequels to books that were never written.', 'The pages are warm, as if someone just finished reading them.'][(x + y + stacksState().d) % 4]]]);
  },
  leave: () => { G.inside = { f: 'base', x: 6, y: 13 }; G.dir = 'left'; P.t = 0; P.mx = P.my = 0; saveGame(); say([['', 'Back up the stair. The basement is quiet, and the stacks hum below it.']]); },
  paint: (ox, oy, kx, ky) => {
    const rows = stacksRows(), W = rows[0].length, H = rows.length, S = stacksState(), k = IT / 16, f = frame;
    const Q = (col, x, y, w, h) => R(Math.round(x), Math.round(y), Math.round(w), Math.round(h), col);
    R(ox - 4, oy - 2 * IT - 2, W * IT + 8, H * IT + 2 * IT + 6, '#05040a');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const sx = ox + x * IT, sy = oy + y * IT, t = rows[y][x]; if (sy < -IT * 2 || sy > SH + IT) continue;
      Q((x + y) % 2 ? '#2a1c16' : '#261912', sx, sy, IT, IT);
      if (t === '#') { Q('#1a1210', sx, sy - 4 * k, IT, IT + 4 * k); Q('#2a1c14', sx, sy - 4 * k, IT, 2 * k); }
      else if (t === 'b') { Q('#3a2414', sx, sy - 10 * k, IT, IT + 10 * k);
        for (let r = 0; r < 3; r++) { Q('#1e120a', sx, sy - 10 * k + r * 8 * k + 7 * k, IT, k);
          for (let i = 0; i < 5; i++) { const h = hash(x * 31 + i, y * 17 + r + S.d); Q(['#6a2a2a', '#2a4a6a', '#5a5a2a', '#3a5a3a', '#6a4a2a', '#4a3a6a'][h % 6], sx + k + i * 3 * k, sy - 9 * k + r * 8 * k + (h % 2) * k, 2 * k, 6 * k - (h % 2) * k); } } }
      else if (t === 'v') { for (let i = 0; i < 4; i++) Q(i % 2 ? '#120c08' : '#3a2a1a', sx + i * k, sy + i * 3 * k, IT - 2 * i * k, 3 * k); }
      else if (t === 'L') { Q('#3a2a1a', sx + 7 * k, sy - 8 * k, 2 * k, 22 * k); Q('#c8a040', sx + 3 * k, sy - 12 * k, 10 * k, 6 * k); }
      else if (t === 'e') { Q('#4a3020', sx + 2 * k, sy, 12 * k, 16 * k); Q('rgba(240,210,150,.5)', sx + 2 * k, sy + 14 * k, 12 * k, 2 * k); }
      else if (t === 'X') { const id = STACK_DOORS[S.d], A = id && foeArt({ f: FOES[id] });
        if (A) { const box = 3.4 * IT, s = Math.min(box / A.sw, box / A.sh), w = A.sw * s, h = A.sh * s, bob = Math.sin(f / 14) * 2;
          ctx.imageSmoothingEnabled = true; ctx.drawImage(A.im, A.sx, A.sy, A.sw, A.sh, sx + IT / 2 - w / 2, sy + IT - h + bob, w, h); ctx.imageSmoothingEnabled = false; } }
    }
    // only a little light: the deeper, the darker
    const cx = ox + kx * IT + IT / 2, cy = oy + ky * IT + 4, g = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(120, 240 - S.d * 4));
    g.addColorStop(0, 'rgba(4,3,8,0)'); g.addColorStop(1, 'rgba(4,3,8,.8)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
  },
};
{ const M = MODES.inside, _ar = M.arrive; M.arrive = function () {
  if (G.inside && G.inside.f === 'stacks' && figTile(G.inside.x, G.inside.y) === 'v') return stacksGo(stacksState().d + 1, 'Down another stair. The shelves get taller, and the light gets smaller.');
  return _ar.apply(this, arguments);
}; }
// walking into a deep door starts it (as the Mill's gate does)
{ const M = MODES.inside, _u = M.update; M.update = function () {
  if (G && G.inside && G.inside.f === 'stacks' && !DLG && !(P.t > 0)) {
    const d = dirHeld();
    if (d) { const [dx, dy] = DIRS[d], t = figTile(G.inside.x + dx, G.inside.y + dy); if (t === 'X') { G.dir = d; return stacksDoor(); } }
  }
  return _u.apply(this, arguments);
}; }
// the way down: the Mill door's list gets one more line once the first floor is freed
{ const _md = millDoor; millDoor = function () {
  if (!millDoorShown() || !stacksOpen()) return _md();
  const _ask = ask; ask = function (q, opts) { ask = _ask;
    const S = stacksState(), i = opts.length - 1;
    opts.splice(i, 0, { t: 'THE ENDLESS STACKS · FLOOR ' + S.d + (S.best > S.d ? ' (deepest ' + S.best + ')' : ''), f: () => stacksGo(S.d, 'Below the Mill, a stair you did not notice before. It goes down further than the building should.') });
    return _ask(q, opts); };
  try { return _md(); } finally { ask = _ask; }
}; }
