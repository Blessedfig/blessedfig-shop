"use strict";
// =====================================================================
//  INSIDE THE BLESSED FIG TREE: main floor, upstairs and basement.
//  Each floor is the store's own footprint in the game data: 8 m wide on Fifth Avenue, 27 m deep
//  (8 x 27 tiles at the FF6 interior scale, one IT = 24 px tile = 1 m). The door is the cut corner at Fifth and Clermont
//  (front right). The layouts are placeholders for Christian to correct: only the outside (his photo) is known.
//  Christian stands behind the counter (his own v0.36 sprite, unaltered).
// =====================================================================
const FIG_W = 8, FIG_H = 27, IT = 24;   // IT: px per 1 m interior tile (24 since Nov 10, so sprites draw at their own size)
// . floor  e door out  K bookshelf  H apothecary shelf  S snacks  T table  c counter  k register  P plant  F fig tree
// R book rack  O window  D back-room door  U stairs up  V stairs down  u/d stairs (other floors)  a armchair
// Z stone wall  B boxes  Y furnace  G the stone goose  X where Christian stands
const FIG_FLOORS = {
  main: { name: 'MAIN FLOOR', rows: [
    'KKKDDKKK', 'KV....UK', 'K.TTTT.K', 'K.TTTT.K', 'K......K', 'K......K', 'K..KK..K', 'K..KK..K', 'K..KK..H', 'K..KK..H',
    'K......H', 'K......H', 'K.P..P.H', 'K......H', 'K..TT..S', 'K..TT..S', 'K......S', 'K....X..', 'K...cckc', 'K......O',
    'K......O', 'K.R..R.O', 'K......O', 'K.......', 'F.......', 'O.R..R..', 'OOOOOO.e'] },
  up: { name: 'UPSTAIRS', rows: [
    'KKKKKKKK', 'K.....dK', 'K......K', 'K.a..a.K', 'K.TTTT.K', 'K.a..a.K', 'K......K', 'K......O', 'KK....KO', 'K......O',
    'K..PP..K', 'K......K', 'K.aTTa.K', 'K......K', 'K......K', 'KKK..KKK', 'K......K', 'K.a..a.K', 'K..TT..K', 'K......O',
    'K......O', 'K.P..P.O', 'K......K', 'K......K', 'K.a..a.K', 'K......K', 'OOOOOOOO'] },
  base: { name: 'BASEMENT', rows: [
    'ZZZZZZZZ', 'Zu....YZ', 'Z.....YZ', 'Z......Z', 'ZBB..BBZ', 'Z......Z', 'ZKK..KKZ', 'Z......Z', 'ZBB..BBZ', 'Z......Z',
    'Z..BB..Z', 'Z......Z', 'ZKK..KKZ', 'Z......Z', 'Z......Z', 'ZB....BZ', 'Z......Z', 'Z......Z', 'ZBB..BBZ', 'Z......Z',
    'Z......Z', 'Z..B...Z', 'Z...G..Z', 'Z......Z', 'ZB....BZ', 'ZBB..BBZ', 'ZZZZZZZZ'] },
};
// UNIFIED MARTIAL ARTS (832 5th Ave): the building's footprint in the game data is 10 m wide on Fifth and 31 m deep, so each floor
// is 10 x 31 tiles. Christian (Nov 10): one floor and a basement. You walk in on the MMA mats; the weight room is downstairs.
// Both rooms follow his photos. Danny is at the front desk; the Big Ego Champ works a heavy bag.
// p wall pad  C cage fence  M mats  9 heavy bag  6 cubbies  7 front desk  X where Danny stands  V stairs down  w water cooler
FIG_FLOORS.uma1 = { name: 'MATS', place: 'UNIFIED MARTIAL ARTS', bld: 'uma', style: 'rubber', sign: true, links: { V: ['uma2', 2, 1, 'Down the stairs to the weight room.'] }, rows: [
  'pppppppppp', 'pV.......p', 'pMCCCCCCMp', 'pMCMMMMCMp', 'pMCMMMMCMp', 'pMCMMMMCMp', 'p9CMMMMC9p', 'pMCCMMCCMp', 'pMMMMMMMMp', 'pMMMMMMMMp',
  'p9MMMMMM9p', 'pMMMMMMMMp', 'pMMMMMMMMp', 'pMMMMMMMMp', 'p9MMMMMM9p', 'pMMMMMMMMp', 'pMMMMMMMMp', 'pMMMMMMMMp', 'pMMMMMMMMp', 'pMMMMMMMMp',
  'pMMMMMMMMp', 'pMMMMMMMMp', 'pMMMMMMMMp', 'p........p', 'p6.......p', 'p....X...p', 'p...7777.p', 'p........p', 'p.w......p', 'p6.......p',
  'OOOOOOOeOO'] };
// the basement weight room, after his photo: white-painted block walls, green carpet with black rubber mats under the iron,
// mirrors down the right wall, white power racks, dumbbells, benches, cable machines at the back, treadmills and ellipticals.
// b block wall  8 mirror  2 power rack  1 dumbbells  3 bench  q cable machine  n treadmill  l elliptical  u stairs up
FIG_FLOORS.uma2 = { name: 'WEIGHT ROOM', place: 'UNIFIED MARTIAL ARTS', bld: 'uma', style: 'carpet', dim: true, links: { u: ['uma1', 2, 1, 'Back up to the mats.'] }, rows: [
  'bbbbbbbbbb', 'bu...q.q.b', 'b........b', 'b2.2..11.8', 'b2.2.....8', 'b........8', 'b.3..3...8', 'b........8', 'b.3..3.1.8', 'b........b',
  'b3.......b', 'b3...l.l.8', 'b........8', 'b....l.l.8', 'b........8', 'b......n.8', 'b......n.8', 'b........b', 'b......n.b', 'b......n.b',
  'b........b', 'b......n.b', 'b......n.b', 'b........b', 'bw.......b', 'b........b', 'b3.3.....b', 'b........b', 'b........b', 'b........b',
  'bbbbbbbbbb'] };
const FIG_WALK = new Set(['.', 'e', 'U', 'V', 'u', 'd', 'M']);
// BIG EGO CHAMP (renamed Nov 11 at Christian's request; no name, no portrait): on the mats, working the heavy bag on the right wall.
// Frames cut by scripts/kid/cut_champ.py (crop + background clear, no resampling), drawn at his sheet's standing scale.
const CHAMP_IMG = new Image();   // sprite removed Nov 11 (file deleted)
const CHAMP_R = {"guard": [[0, 3, 65, 110], [67, 4, 56, 109], [125, 4, 58, 109], [185, 0, 65, 113]], "punch": [[0, 117, 61, 111], [63, 122, 70, 106], [135, 118, 100, 110], [237, 118, 79, 110]]}, CHAMP_K = 2.9, CHAMP = { x: 7, y: 10, bx: 8 };
function champHere() { return false; }   // Nov 11, 17:04: Christian had the champ's sprite removed; the bag hangs on its own
function champPose() {   // a combo on the bag, then a breath in his guard: [frame rect, bag sway in px]
  const t = frame % 150, sway = t >= 24 ? Math.round(4 * Math.sin((t - 24) / 3) * Math.exp(-(t - 24) / 18)) : 0;   // the jab lands at 24
  if (t < 48) return [CHAMP_R.punch[Math.min(3, Math.floor(t / 12))], sway];
  return [CHAMP_R.guard[Math.floor((t - 48) / 34) % 3], sway];
}

const FIG_SHELVES = ['PLANTS & GARDENING. Seed saving, soil, the northern growing season.', 'HISTORY. Wars, empires, and what actually happened.',
  'MEDICAL. Bodies, healing, the long slow science of staying alive.', 'CLASSICS. Marcus Aurelius, Plato, Boethius. Old voices, still awake.',
  'RELIGION & THEOLOGY. The oldest questions people ever wrote down.', 'PSYCHOLOGY. A whole shelf of Jung.',
  'MYCOLOGY. Field guides to the mushrooms of the Northwoods.', 'LOCAL HISTORY. Langlade County, the railroad, the old mills along Spring Brook.',
  'SCIENCE & NATURE. Rocks, rivers, stars and the creatures in between.', 'FICTION. Every genre the kid will meet later, waiting on the shelf.'];
const GOOSE_IMG = new Image(); GOOSE_IMG.src = 'assets/goose/dungeon.png';
const CHRIS_IDLE = [[0, 1, 72, 110], [74, 1, 71, 110], [147, 0, 72, 111], [221, 3, 69, 108]], CHRIS_IDLE_K = 2.9;   // his original sheet's idle frames (field.png), drawn at his walking height
function figTile(x, y) { const r = FIG_FLOORS[G.inside.f].rows[y]; return r && x >= 0 && x < r.length ? r[x] : 'Z'; }
function dannyHere() { return G.inside.f === 'uma1' && G.kid.g !== 'danny'; }
function figChristianHere() { return G.inside.f === 'main' && G.kid.g !== 'christian'; }
function figFree(x, y) { const fl0 = FIG_FLOORS[G.inside.f]; if (fl0.free) return fl0.free(x, y); if (champHere() && x === CHAMP.x && y === CHAMP.y) return false; if (typeof tannerHere === 'function' && tannerHere() && x === TANNER.x && y === TANNER.y) return false; const t = figTile(x, y); return FIG_WALK.has(t) || (t === 'X' && !(G.inside.f === 'uma1' ? dannyHere() : figChristianHere())); }
function enterFig() {
  G.inside = { f: 'main', x: 6, y: 25 }; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('inside');
  say([['', 'The bell over the corner door rings.']]);
}
function enterUma() {
  G.inside = { f: 'uma1', x: 7, y: 29 }; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('inside');
  say([['', 'The thump of people hitting the mats. Somebody is counting rounds out loud. From the stairs at the back comes the clank of iron.']]);
}
function leaveFig() { const fl = FIG_FLOORS[G.inside.f], [x, y] = outsideDoorM(fl.bld === 'uma' ? UMA : BLD[TOWN.fig]); G.inside = null; G.x = x; G.y = y; G.dir = 'down'; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('walk'); }
function figGo(f, x, y, line) { G.inside = { f, x, y }; G.dir = 'down'; P.t = 0; P.mx = P.my = 0; saveGame(); say([['', line]]); }
function umaLook(x, y, t) {
  if (champHere() && ((x === CHAMP.x && y === CHAMP.y) || (x === CHAMP.bx && y === CHAMP.y)))   // Nov 11: renamed, no portrait
    return say([['Big Ego Champ', 'If you ever use my likeness in a video game, you better have the decency to ask me.']]);
  if (dannyHere() && (t === 'X' || (t === '7' && y === 26))) return dannyTalk(() => {});
  const L = {
    '0': 'A plain painted wall.', p: 'Black wall pads. Gym posters are taped up between them.', C: 'The cage. Chain-link over black padding. Sparring rounds happen in here.', M: 'Green mats, wiped down and smelling of disinfectant.', '8': 'Floor-to-ceiling mirrors. Check your form.', '1': 'Dumbbells racked from light to heavy.',
    '2': 'A power rack with a loaded bar. Collars on.', '3': 'A flat bench, the pad worn shiny.', '4': 'Kettlebells in a row, smallest to biggest.',
    '5': 'An air bike. Nobody ever looks happy on it.', '6': 'Cubbies full of gym bags, gloves and shin guards.',
    '7': G.kid.g === 'danny' ? 'Your front desk.' : 'The front desk. A sign-in sheet and a jar of pens.', '9': 'A black teardrop heavy bag, scuffed where a thousand hooks have landed.',
    w: 'A water cooler. Drink up.', O: 'Fifth Avenue, through the front windows.', V: 'Stairs down to the weight room.', u: 'Stairs up to the mats.',
    b: 'Painted block wall. A speaker on a shelf is playing something with a lot of bass.', q: 'A cable machine, weight stack pinned halfway down.',
    n: 'A treadmill. The console blinks: SELECT WORKOUT.', l: 'An elliptical, quietly gathering dust.',
  }[t];
  if (L) say([['', L]]);
}
function figLook(x, y) {
  if (typeof tannerHere === 'function' && tannerHere() && x === TANNER.x && y === TANNER.y) return tannerTalk();   // Tanner, by the front window (kayak.js)
  const t = figTile(x, y), f = G.inside.f;
  if (FIG_FLOORS[f].look) return FIG_FLOORS[f].look(x, y, t);
  if (FIG_FLOORS[f].bld === 'uma') return umaLook(x, y, t);
  // behind the counter: Christian
  if (figChristianHere() && (t === 'X' || ((t === 'c' || t === 'k') && y === 18)))
    return ask('Christian: Welcome in! Books, herbs, snacks and workshops. Look around as long as you like.', [
      { t: 'READ THE ALMANAC', f: () => { ALM_RETURN = 'inside'; setMode('almanac'); } },
      { t: 'JUST BROWSING', f: () => say([['Christian', 'Take your time. The story starts here, when you are ready.']]) }]);
  const L = {
    K: f === 'base' ? 'Spare stock, boxed and labeled.' : FIG_SHELVES[(x * 7 + y * 3 + (f === 'up' ? 5 : 0)) % FIG_SHELVES.length],
    H: 'APOTHECARY. Jars of dried herbs and loose teas, labeled by hand.', S: 'SNACKS. Something sweet for the walk home, and something cold to drink.',
    T: f === 'main' && y < 5 ? 'WORKSHOPS. The long table where classes meet.' : f === 'up' ? 'A reading table, a lamp, a stack someone left half-finished.' : 'NEW ARRIVALS, face out.',
    c: G.kid.g === 'christian' ? 'Your counter.' : 'The counter. Nobody behind it right now.', k: 'The register.',
    P: 'PLANTS. A few of them are for sale.', F: 'A fig tree in a pot by the front window. The store is named for it.',
    R: 'Paperbacks on a spinner rack.', O: f === 'main' && x === 7 ? 'Clermont Street, through the side window.' : f === 'up' ? 'Fifth Avenue from above.' : 'Fifth Avenue, through the front window.',
    D: 'The back room. Staff only.', a: 'An armchair, worn soft in the right places.', Z: 'Old stone foundation, cool to the touch.',
    B: 'Boxes of books waiting for shelf space.', Y: 'The furnace, ticking as it warms.',
    G: 'A goose made of stone, in a studded harness. It is very, very still.',
  }[t];
  if (L) say([['', L]]);
}
MODES.inside = {
  update() {
    if (DLG) return dlgUpdate();
    if (P.t > 0) { P.t -= 1 / (held.b ? RUN_FRAMES : WALK_FRAMES); if (P.t <= 0) { P.t = 0; P.mx = P.my = 0; this.arrive(); } return; }
    if (pressed.a) { const [dx, dy] = DIRS[G.dir]; figLook(G.inside.x + dx, G.inside.y + dy); return; }
    if (pressed.menu) { saveGame(); say(['Saved.']); return; }
    const d = dirHeld();
    if (d) { G.dir = d; const [dx, dy] = DIRS[d], nx = G.inside.x + dx, ny = G.inside.y + dy;
      if (figFree(nx, ny)) { G.inside.x = nx; G.inside.y = ny; P.mx = -dx; P.my = -dy; P.t = 1; G.steps++; } }
  },
  arrive() {
    const t = figTile(G.inside.x, G.inside.y), lk = FIG_FLOORS[G.inside.f].links;
    if (t === 'e') return (FIG_FLOORS[G.inside.f].leave || leaveFig)();
    if (lk && lk[t]) return figGo(...lk[t]);
    if (t === 'U') return figGo('up', 6, 2, 'Up the stairs.');
    if (t === 'V') return figGo('base', 1, 2, 'Down to the basement. It smells like old paper and stone.');
    if (t === 'd') return figGo('main', 6, 2, 'Back down to the store.');
    if (t === 'u') return figGo('main', 1, 2, 'Back up to the store.');
  },
  draw() {
    const fl = FIG_FLOORS[G.inside.f], base = G.inside.f === 'base', up = G.inside.f === 'up', st = fl.style || null, FW = fl.rows[0].length, FH = fl.rows.length;
    R(0, 0, SW, SH, '#0b0b14');
    const kx = G.inside.x + P.mx * P.t, ky = G.inside.y + P.my * P.t;
    const ox = Math.round((SW - FW * IT) / 2), oy = Math.round(Math.max(SH - IT - FH * IT, Math.min(2 * IT + 26, SH / 2 - ky * IT - IT / 2)));
    if (fl.paint) fl.paint(ox, oy, kx, ky); else {
    // the back wall, two tiles tall, with the floor's own finish
    const wallCol = st === 'carpet' ? '#e4e0d6' : st ? '#d8d8d2' : base ? '#5a5650' : up ? '#c8b896' : '#d6c6a4';
    F(wallCol, ox, oy - 2 * IT, FW * IT, 2 * IT); for (let y = oy - 2 * IT + 2; y < oy; y += 4) F(base ? '#4a4640' : '#bfae8a', ox, y, FW * IT, 1);
    F('#1c1618', ox - 4, oy - 2 * IT - 2, FW * IT + 8, 3); F('#1c1618', ox - 4, oy - 2 * IT - 2, 4, FH * IT + 2 * IT + 2); F('#1c1618', ox + FW * IT, oy - 2 * IT - 2, 4, FH * IT + 2 * IT + 2);
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      const sx = ox + x * IT, sy = oy + y * IT; if (sy < -40 || sy > SH + IT) continue;
      drawFigTile(champHere() && x === CHAMP.bx && y === CHAMP.y ? 'M' : fl.rows[y][x], sx, sy, x, y, base, up, st);
    }
    F('#1c1618', ox - 4, oy + FH * IT, FW * IT + 8, 4);
    if (st) F('#a02828', ox, oy - 6, FW * IT, 3);   // the gym's red trim along the back wall
    if (fl.sign) {   // as in the photo: the gym's name painted big on a dark wall, each word in its flag's colours; the logo on the wall pads
      F('#3a3a40', ox, oy - 2 * IT, FW * IT, 2 * IT - 8); F('#a02828', ox, oy - 8, FW * IT, 2);
      const words = [['UNIFIED', '#e04040', '#f0f0f0'], ['MARTIAL', '#3aa04a', '#f0d040'], ['ARTS', '#3a5ac8', '#f0f0f0']];
      ctx.font = FONT; let tw = 0; words.forEach(w => tw += ctx.measureText(w[0] + ' ').width); let tx = ox + FW * IT / 2 - tw / 2 + 2;
      for (const [w, c1, c2] of words) { txt(w, tx + 1, oy - IT - 6, '#0e0e12', 'left'); txt(w, tx, oy - IT - 7, c1, 'left'); F(c2, tx, oy - IT + 2, ctx.measureText(w).width, 1); tx += ctx.measureText(w + ' ').width; }
      if (typeof UMA_SIGN !== 'undefined' && UMA_SIGN.complete && UMA_SIGN.naturalWidth) for (const [px, py] of [[0, 12], [9, 19]]) {
        const s = IT - 6, x = ox + px * IT + 3, y = oy + py * IT - 4; if (y < -IT || y > SH) continue;
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(UMA_SIGN, x, y, s, s); ctx.imageSmoothingEnabled = false; }
      // the white lines on the mats: a big circle and a border line
      ctx.save(); ctx.beginPath(); ctx.rect(ox + IT, oy + 8 * IT, FW * IT - 2 * IT, 15 * IT); ctx.clip();
      ctx.strokeStyle = 'rgba(235,235,230,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ox + FW * IT / 2, oy + 15.5 * IT, 3.6 * IT, 0, 6.29); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox + IT + 4, oy + 22.8 * IT); ctx.lineTo(ox + FW * IT - IT - 4, oy + 22.8 * IT); ctx.stroke(); ctx.restore(); }
    // Christian behind the counter, his own idle frames
    const chars = [];
    if (figChristianHere()) chars.push({ y: 17, draw: () => { const im = KID_IMG.christian, r = CHRIS_IDLE[(frame >> 4) % 4], w = r[2] / CHRIS_IDLE_K, h = r[3] / CHRIS_IDLE_K, sx = ox + 5 * IT + IT / 2, sy = oy + 17 * IT + IT - 1;
      if (im.complete && im.naturalWidth) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, r[0], r[1], r[2], r[3], Math.round(sx - w / 2), Math.round(sy - h), w, h); ctx.imageSmoothingEnabled = false; } } });
    if (base) chars.push({ y: 22, draw: () => { const sx = ox + 4 * IT + IT / 2, sy = oy + 22 * IT + IT - 1, w = 55 / 2, h = 103 / 2;
      if (GOOSE_IMG.complete && GOOSE_IMG.naturalWidth) { ctx.imageSmoothingEnabled = true; ctx.filter = 'grayscale(0.85) brightness(0.9)'; ctx.drawImage(GOOSE_IMG, 0, 1, 55, 103, Math.round(sx - w / 2), Math.round(sy - h), w, h); ctx.filter = 'none'; ctx.imageSmoothingEnabled = false; } } });
    if (dannyHere()) chars.push({ y: 25, draw: () => { const sx = ox + 5 * IT + IT / 2, sy = oy + 25 * IT + IT - 1; F('rgba(0,0,0,.25)', sx - 7, sy - 3, 14, 4); kidFrame('danny', 'down', 0, sx, sy); } });
    if (G.inside.f === 'uma1') chars.push({ y: 26, draw: () => { for (let x = 0; x < FW; x++) if (fl.rows[26][x] === '7') drawFigTile('7', ox + x * IT, oy + 26 * IT, x, 26, false, false, st); } });
    if (champHere()) { const [r, sway] = champPose();
      chars.push({ y: CHAMP.y + 0.1, draw: () => drawFigTile('9', ox + CHAMP.bx * IT + sway, oy + CHAMP.y * IT, CHAMP.bx, CHAMP.y, false, false, 'none') });
      chars.push({ y: CHAMP.y, draw: () => { const sx = ox + CHAMP.x * IT + IT / 2 + 4, sy = oy + CHAMP.y * IT + IT - 1, w = r[2] / CHAMP_K, h = r[3] / CHAMP_K;
        F('rgba(0,0,0,.25)', sx - 7, sy - 3, 14, 4);
        if (CHAMP_IMG.complete && CHAMP_IMG.naturalWidth) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(CHAMP_IMG, r[0], r[1], r[2], r[3], Math.round(sx - w / 2), Math.round(sy - h), w, h); ctx.imageSmoothingEnabled = false; } } }); }
    if (typeof tannerHere === 'function' && tannerHere()) chars.push({ y: TANNER.y, draw: () => drawFolk('tanner', Math.round(ox + TANNER.x * IT + IT / 2), Math.round(oy + TANNER.y * IT + IT - 1), frame) });
    chars.push({ y: ky, draw: () => drawKid(G.kid, Math.round(ox + kx * IT), Math.round(oy + ky * IT), G.dir, P.t > 0, IT) });
    // the counter is in front of whoever stands behind it: redraw its row in depth order so it hides legs instead of feet poking over it
    if (G.inside.f === 'main') chars.push({ y: 18, draw: () => { for (let x = 0; x < FW; x++) { const t = fl.rows[18][x]; if (t === 'c' || t === 'k') drawFigTile(t, ox + x * IT, oy + 18 * IT, x, 18, false, false); } } });
    chars.sort((a, b) => a.y - b.y).forEach(c => c.draw());
    // the basement is dark: a pool of light around the kid
    if (fl.dim) { ctx.fillStyle = 'rgba(40,24,6,.16)'; ctx.fillRect(0, 0, SW, SH); }   // warm, low basement light
    if (base) { const cx = ox + kx * IT + IT / 2, cy = oy + ky * IT + 4, g = ctx.createRadialGradient(cx, cy, 30, cx, cy, 180);
      g.addColorStop(0, 'rgba(10,8,14,0)'); g.addColorStop(1, 'rgba(10,8,14,.78)'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH); }
    }
    const hd = (fl.place || 'THE BLESSED FIG TREE') + ' · ' + (fl.zone ? fl.zone(G.inside.x, G.inside.y) : fl.name);
    ctx.font = SMALL; win(4, 4, Math.max(236, Math.ceil(ctx.measureText(hd).width) + 12), 14); txt(hd, 9, 8, '#fff', 'left', SMALL);
    if (DLG) dlgDraw();
  }
};
function drawFigTile(t, sx, sy, x, y, base, up, st) {
  // the tile art is written on a 16-unit grid; Q draws it at IT px per tile, each edge rounded to a whole pixel so it stays crisp
  const Q = (c, X, Y, w, h) => { const k = IT / 16, dx = X - sx, dy = Y - sy, x0 = Math.round(dx * k), y0 = Math.round(dy * k); F(c, sx + x0, sy + y0, Math.round((dx + w) * k) - x0, Math.round((dy + h) * k) - y0); };
  const h = hash(x * 5 + (base ? 3 : up ? 7 : 1), y * 11);
  // floor under everything
  if (st === 'none') { }   // a prop drawn over the floor already there
  else if (st === 'carpet') { const eq = '1235qnl'.includes(t); Q(eq ? '#1e1e22' : ((x * 3 + y) % 5 ? '#2c4a42' : '#2a463e'), sx, sy, 16, 16); if (!eq && h % 3 === 0) Q('#34544a', sx + h % 13, sy + (h >> 4) % 13, 1, 1); if (eq) Q('#2a2a30', sx, sy + 15, 16, 1); }
  else if (st === 'rubber') { Q('#3c3c42', sx, sy, 16, 16); if (h % 2) Q('#4a4a52', sx + h % 13, sy + (h >> 4) % 13, 2, 1); if (h % 3 === 0) Q('#55555e', sx + (h >> 3) % 13, sy + (h >> 6) % 13, 1, 1); Q('#34343a', sx, sy + 15, 16, 1); }
  else if (base) { Q('#7a756c', sx, sy, 16, 16); if (h % 3 === 0) Q('#6a655c', sx + h % 11, sy + (h >> 4) % 13, 4, 1); }
  else if (up) { Q((x + y) % 2 ? '#8a5a48' : '#82543f', sx, sy, 16, 16); if (x > 0 && x < 7 && y > 1 && y < 25) { Q('rgba(120,40,40,.35)', sx, sy, 16, 16); } }
  else { Q((x + y) % 2 ? '#a87848' : '#9c6c40', sx, sy, 16, 16); Q('#8a5a30', sx, sy + 7, 16, 1); Q('#8a5a30', sx + ((y * 5) % 16), sy, 1, 7); }
  const spines = ['#a03030', '#3050a0', '#30804a', '#c0a040', '#704090', '#d07030', '#305a5a', '#e8e0d0'];
  switch (t) {
    case 'K': Q('#3a2414', sx, sy - 4, 16, 20); Q('#5a3a22', sx, sy - 4, 16, 2);
      for (let r = 0; r < 3; r++) { for (let i = 0; i < 7; i++) Q(base ? ['#c8b490', '#a89470'][(i + r) % 2] : spines[(hash(x * 7 + i, y + r) >> 2) % spines.length], sx + 1 + i * 2, sy - 1 + r * 6, 2, 5 - (hash(i, r + x) % 2)); Q('#2a1a10', sx, sy + 4 + r * 6, 16, 1); }
      Q('#1c1618', sx, sy + 15, 16, 1); break;
    case 'H': Q('#3a2414', sx, sy - 4, 16, 20); for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) { Q('#d8e4d8', sx + 1 + i * 5, sy - 2 + r * 6, 4, 5); Q(['#8aa040', '#c0a060', '#a06080', '#d0c060', '#60a060'][(i + r + y) % 5], sx + 2 + i * 5, sy + r * 6, 2, 3); Q('#2a1a10', sx, sy + 3 + r * 6, 16, 1); } break;
    case 'S': Q('#c8ccd0', sx + 1, sy - 6, 14, 22); Q('#8ac0e0', sx + 3, sy - 4, 10, 8); Q('#3a3c42', sx + 1, sy + 15, 14, 1);
      for (let i = 0; i < 4; i++) Q(['#e05040', '#e0c040', '#40a060', '#e08040'][i], sx + 3 + i * 3, sy + 6, 2, 6); break;
    case 'T': Q('#6a3e1e', sx, sy + 2, 16, 12); Q('#8a5a30', sx, sy + 2, 16, 3); Q('#4a2a14', sx, sy + 13, 16, 2);
      if (h % 2) { Q(spines[h % 8], sx + 3, sy + 5, 5, 4); Q(spines[(h >> 3) % 8], sx + 9, sy + 6, 4, 5); } break;
    case 'c': Q('#5a3018', sx, sy - 2, 16, 18); Q('#8a5a30', sx, sy - 2, 16, 4); Q('#3a1e0e', sx, sy + 15, 16, 1); break;
    case 'k': Q('#5a3018', sx, sy - 2, 16, 18); Q('#8a5a30', sx, sy - 2, 16, 4); Q('#3a3c42', sx + 3, sy - 6, 10, 7); Q('#8ac0a0', sx + 4, sy - 5, 8, 3); Q('#e8dcb4', sx + 1, sy + 1, 6, 4); break;   // register and the almanac
    case 'P': Q('#a0502a', sx + 4, sy + 9, 8, 6); Q('#2e7a38', sx + 2, sy, 12, 10); Q('#4e9a58', sx + 4, sy + 2, 4, 3); Q('#1c1618', sx + 4, sy + 15, 8, 1); break;
    case 'F': Q('#a0502a', sx + 4, sy + 10, 8, 6); Q('#5a3a1a', sx + 7, sy + 2, 2, 8); Q('#2e6a2a', sx, sy - 8, 16, 12); Q('#3e8a3a', sx + 2, sy - 10, 6, 5); Q('#3e8a3a', sx + 9, sy - 9, 6, 6); Q('#7a2a6a', sx + 4, sy - 3, 2, 2); Q('#7a2a6a', sx + 11, sy - 1, 2, 2); break;
    case 'R': Q('#2a2a2e', sx + 7, sy - 8, 2, 23); for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) Q(spines[(i + r * 3 + x) % 8], sx + 3 + i * 3, sy - 8 + r * 5, 2, 4); break;
    case 'O': Q(base ? '#5a5650' : '#d6c6a4', sx, sy, 16, 16); Q('#f2f0e8', sx + 1, sy + 1, 14, 12); Q(up ? '#9ac0e0' : '#8ab8d8', sx + 2, sy + 2, 12, 10); Q('rgba(255,255,255,.4)', sx + 3, sy + 3, 3, 8); break;
    case 'D': Q('#3a2414', sx, sy - 4, 16, 20); Q('#6a4428', sx + 1, sy - 3, 14, 18); Q('#e8c060', sx + 11, sy + 6, 2, 2); break;
    case 'U': case 'u': for (let i = 0; i < 4; i++) Q(i % 2 ? '#8a5a30' : '#a87040', sx, sy + i * 4, 16, 4); Q('#1c1618', sx, sy, 1, 16); Q('#1c1618', sx + 15, sy, 1, 16); Q('#ffd860', sx + 6, sy + 1, 4, 2); break;   // stairs going up
    case 'V': case 'd': for (let i = 0; i < 4; i++) Q(shade('#6a4428', -i * 0.15), sx, sy + i * 4, 16, 4); Q('#1c1618', sx, sy, 1, 16); Q('#1c1618', sx + 15, sy, 1, 16); Q('#ffd860', sx + 6, sy + 13, 4, 2); break;   // stairs going down
    case 'a': Q('#7a2a2a', sx + 2, sy + 2, 12, 12); Q('#9a3a3a', sx + 4, sy + 4, 8, 6); Q('#5a1a1a', sx + 2, sy + 2, 12, 3); Q('#1c1618', sx + 2, sy + 14, 12, 1); break;
    case 'Z': Q('#4a4640', sx, sy, 16, 16); Q('#5a5650', sx + 1, sy + 1, 7, 6); Q('#5a5650', sx + 8, sy + 8, 7, 6); Q('#3a3630', sx, sy + 7, 16, 1); break;
    case 'B': Q('#a07a4a', sx + 1, sy + 2, 14, 13); Q('#c09a6a', sx + 1, sy + 2, 14, 3); Q('#7a5a3a', sx + 7, sy + 2, 2, 13); Q('#1c1618', sx + 1, sy + 15, 14, 1); break;
    case 'Y': Q('#5a5c62', sx + 1, sy - 6, 14, 22); Q('#3a3c42', sx + 4, sy + 2, 8, 6); Q((frame >> 3) % 2 ? '#e08030' : '#c06020', sx + 5, sy + 4, 6, 3); break;
    // ---- the weight room ----
    case 'b': Q('#e4e0d6', sx, sy - 6, 16, 22); for (let r = 0; r < 4; r++) Q('#cfcabd', sx, sy - 6 + r * 5 + 4, 16, 1); Q((y + 0) % 2 ? '#cfcabd' : '#d6d1c4', sx + 7, sy - 6, 1, 22); Q('#1c1618', sx, sy + 15, 16, 1); break;
    case 'q': Q('#1e1e22', sx, sy, 16, 16); Q('#16161a', sx + 2, sy - 12, 2, 27); Q('#16161a', sx + 12, sy - 12, 2, 27); Q('#16161a', sx + 2, sy - 12, 12, 2); Q('#4a4a52', sx + 6, sy - 6, 4, 12); Q('#9a9ca4', sx + 7, sy - 10, 1, 4); break;
    case 'n': Q('#1e1e22', sx, sy, 16, 16); Q('#5a5c62', sx + 2, sy + 1, 12, 15); Q('#26262c', sx + 4, sy + 2, 8, 13); if (y % 3 === 0) { Q('#7a7c84', sx + 1, sy - 6, 2, 8); Q('#7a7c84', sx + 13, sy - 6, 2, 8); Q('#3a3c42', sx + 3, sy - 8, 10, 4); Q('#e0407a', sx + 5, sy - 7, 6, 2); } break;
    case 'l': Q('#1e1e22', sx, sy, 16, 16); Q('#3a3c42', sx + 4, sy + 6, 9, 8); Q('#16161a', sx + 7, sy - 6, 2, 13); Q('#16161a', sx + 4, sy - 7, 8, 2); Q('#5a5c62', sx + 3, sy + 12, 12, 2); break;
    // ---- the gym ----
    case 'M': Q((x + y) % 2 ? '#1f4a3c' : '#22503f', sx, sy, 16, 16); Q('#183c30', sx, sy + 15, 16, 1); if (x % 3 === 0) Q('#183c30', sx + 15, sy, 1, 16); if (h % 4 === 0) Q('#2c5c4a', sx + h % 12, sy + (h >> 4) % 12, 3, 1); break;
    case 'p': Q('#1a1a1e', sx, sy - 6, 16, 22); Q('#26262c', sx + 1, sy - 5, 14, 1); Q('#0e0e12', sx + 7, sy - 6, 1, 22); Q('#3a3a40', sx, sy + 15, 16, 1); break;
    case 'C': Q((x + y) % 2 ? '#1f4a3c' : '#22503f', sx, sy, 16, 16);   // chain-link with black posts, mats inside
      for (let i = -14; i < 16; i += 4) { Q('rgba(170,174,182,.55)', sx + Math.max(0, i), sy - 14 + Math.max(0, -i), 1, 1); }
      Q('rgba(150,154,162,.35)', sx, sy - 12, 16, 1); Q('rgba(150,154,162,.35)', sx, sy - 4, 16, 1); Q('rgba(150,154,162,.35)', sx, sy + 4, 16, 1);
      Q('#111114', sx, sy - 16, 2, 31); Q('#111114', sx, sy - 16, 16, 2); Q('#2a2a30', sx, sy + 13, 16, 2); break;
    case '0': Q('#d8d8d2', sx, sy - 6, 16, 22); Q('#c4c4bc', sx, sy + 12, 16, 4); Q('#1c1618', sx, sy + 15, 16, 1); break;
    case '8': Q('#d8d8d2', sx, sy - 6, 16, 22); Q('#b8d4e4', sx + 1, sy - 4, 14, 18); Q('#e8f4fa', sx + 3, sy - 2, 2, 12); Q('#8aa4b4', sx + 1, sy + 13, 14, 1); break;
    case '1': Q('#2a2a30', sx + 1, sy, 14, 15); for (let r = 0; r < 3; r++) { Q('#6a6a72', sx + 2, sy + 2 + r * 5, 12, 1); Q('#16161a', sx + 2, sy + r * 5, 3, 3); Q('#16161a', sx + 11, sy + r * 5, 3, 3); } break;
    case '2': { const rc = st === 'carpet' ? '#ecebe6' : '#9a9ca4'; Q(rc, sx + 1, sy - 8, 2, 23); Q(rc, sx + 13, sy - 8, 2, 23); Q(rc, sx + 1, sy - 8, 14, 2); } Q('#c4c6cc', sx - 2, sy + 1, 20, 1); Q('#16161a', sx - 2, sy - 2, 3, 7); Q('#16161a', sx + 15, sy - 2, 3, 7); break;
    case '3': Q('#5a5c62', sx + 3, sy + 9, 2, 6); Q('#5a5c62', sx + 11, sy + 9, 2, 6); Q('#16161a', sx + 1, sy + 5, 14, 5); Q('#3a3a42', sx + 2, sy + 5, 12, 1); break;
    case '4': for (let i = 0; i < 3; i++) { Q('#16161a', sx + 1 + i * 5, sy + 8, 4, 5); Q('#16161a', sx + 2 + i * 5, sy + 6, 2, 1); Q('#16161a', sx + 1 + i * 5, sy + 6, 1, 2); Q('#16161a', sx + 4 + i * 5, sy + 6, 1, 2); } break;
    case '5': Q('#2a2a30', sx + 3, sy + 12, 10, 3); Q('#5a5c62', sx + 7, sy + 2, 2, 11); Q('#16161a', sx + 2, sy + 4, 6, 6); Q('#c84040', sx + 4, sy + 6, 2, 2); Q('#16161a', sx + 9, sy, 5, 2); break;
    case '6': Q('#8a5a30', sx, sy - 6, 16, 22); for (let r = 0; r < 3; r++) { Q('#5a3a1e', sx + 1, sy - 4 + r * 7, 14, 5); Q(['#c84040', '#2e4fa0', '#16161a', '#e0c040'][(r + y) % 4], sx + 3, sy - 3 + r * 7, 6, 4); } break;
    case '7': Q('#2a2a30', sx, sy - 2, 16, 18); Q('#4a4a52', sx, sy - 2, 16, 4); Q('#a02828', sx, sy + 6, 16, 2); Q('#1c1618', sx, sy + 15, 16, 1); if (x === 5) { Q('#e8e4dc', sx + 3, sy - 1, 7, 2); } break;
    case '9': Q('#5a5c62', sx + 7, sy - 12, 2, 4); Q('#16161a', sx + 4, sy - 8, 8, 4); Q('#1c1c22', sx + 3, sy - 4, 10, 10); Q('#1c1c22', sx + 4, sy + 6, 8, 3); Q('#1c1c22', sx + 6, sy + 9, 4, 2);   // a black teardrop bag
      Q('#3a3a42', sx + 5, sy - 3, 2, 9); Q('rgba(0,0,0,.3)', sx + 4, sy + 14, 8, 2); break;
    case 'w': Q('#e8e8ec', sx + 4, sy - 2, 8, 17); Q('#8ac0e0', sx + 4, sy - 8, 8, 7); Q('#5a5c62', sx + 6, sy + 4, 4, 2); break;
    case 'e': Q('#3a3632', sx + 2, sy + 4, 12, 10); Q('#5a524a', sx + 3, sy + 5, 10, 8); break;   // the mat at the corner door
  }
}
