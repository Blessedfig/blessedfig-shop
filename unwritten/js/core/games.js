"use strict";
// =====================================================================
//  TWO SMALL GAMES IN TOWN (Nov 14, stand-ins for Christian to tune):
//  Pampered Paws: wash a dog by following the groomer's calls (left/right scrub, up rinses, down towels); pays by the dog.
//  Flowers From The Heart: a memory match of six flowers, each with the meaning the old "language of flowers" gave it.
// =====================================================================
let MINI = null;
const ARROW = { left: '←', right: '→', up: '↑', down: '↓' }, CALL = { left: 'SCRUB', right: 'SCRUB', up: 'RINSE', down: 'TOWEL' };
function dogWash() { MINI = { k: 'dog', seq: Array.from({ length: 8 }, () => ['left', 'right', 'up', 'down'][Math.random() * 4 | 0]), i: 0, t: 0, ok: 0, miss: 0, fx: 0, coat: ['#c8904a', '#2a2224', '#e8e0d0', '#8a5a30'][Math.random() * 4 | 0] }; }
function dogUpdate(M) {
  M.t++; if (M.fx > 0) M.fx--;
  if (M.done) { if (pressed.a || pressed.b) { MINI = null; say([['Groomer', M.miss < 2 ? 'Look at that shine! Come back any time.' : 'Damp, but clean. Thanks for the help!']]); } return; }
  if (pressed.b) { MINI = null; return; }
  const d = ['left', 'right', 'up', 'down'].find(k => pressed[k]);
  if (d || M.t > 100) {
    const want = M.seq[M.i]; if (d && (d === want || (CALL[d] === 'SCRUB' && CALL[want] === 'SCRUB'))) { M.ok++; M.last = 'good'; } else { M.miss++; M.last = 'shake'; }
    M.fx = 18; M.i++; M.t = 0;
    if (M.i >= M.seq.length) { M.pay = Math.max(1, 6 - M.miss) * 100; earn(M.pay); G.dogs = (G.dogs || 0) + 1; saveGame(); M.done = true; }
  }
}
function dogDraw(M) {
  const x = 32, y = 26, w = SW - 64, h = SH - 100; win(x, y, w, h);
  txt('PAMPERED PAWS · WASH THE DOG', x + 10, y + 8, '#ffd860', 'left', SMALL); txt('CASH ' + money(cash()), x + w - 10, y + 8, '#fff', 'right', SMALL);
  const cx = x + w / 2, ty = y + h - 60, shake = M.last === 'shake' && M.fx ? Math.round(Math.sin(M.fx) * 3) : 0;
  F('#c8ccd2', cx - 70, ty, 140, 34); F('#e8ecf0', cx - 66, ty + 4, 132, 26); F('#9ac8e8', cx - 64, ty + 10, 128, 18);
  const d = cx + shake; F(M.coat, d - 30, ty - 18, 56, 30); F(M.coat, d + 18, ty - 34, 24, 24); F(shade(M.coat, -0.3), d + 20, ty - 38, 7, 12); F(shade(M.coat, -0.3), d + 35, ty - 38, 7, 12);
  F('#1a1418', d + 34, ty - 26, 3, 3); F('#1a1418', d + 40, ty - 18, 4, 3); F(M.coat, d - 38, ty - 22, 10, 5);
  const suds = Math.min(10, M.ok); for (let i = 0; i < suds; i++) { const q = hash(i, 7); F('#ffffff', d - 28 + q % 52, ty - 24 + (q >> 6) % 14, 6, 5); F('#cfe8f8', d - 27 + q % 52, ty - 23 + (q >> 6) % 14, 2, 2); }
  if (M.last === 'good' && M.fx && CALL[M.seq[M.i - 1]] === 'RINSE') for (let i = 0; i < 8; i++) F('#9ad0f0', d - 30 + i * 8, ty - 50 + ((M.fx * 3 + i * 7) % 24), 2, 5);
  if (M.done) { txt('ALL CLEAN!', cx, y + 40, '#a8f0a8', 'center'); txt('PAID ' + money(M.pay) + ' · A: DONE', cx, y + 56, '#fff', 'center', SMALL); return; }
  const want = M.seq[M.i]; txt(CALL[want] + ' ' + ARROW[want], cx, y + 36, '#fff', 'center');
  F('#3a3a6a', cx - 60, y + 56, 120, 5); F('#ffd860', cx - 60, y + 56, Math.max(0, 120 - M.t * 1.2), 5);
  txt('DOG ' + (M.i + 1) + ' OF ' + M.seq.length + ' STEPS · MISSES ' + M.miss + ' · B: STOP', cx, y + h - 16, '#c8d0f0', 'center', SMALL);
}
// ---------- the flower match ----------
const FLOWER_MEANING = [['Red rose', '#d8283a', 'love'], ['Daisy', '#f4f4f0', 'innocence'], ['Sunflower', '#f0c020', 'adoration'], ['White lily', '#f0ece0', 'purity'], ['Violet', '#7a4ac8', 'modesty'], ['Forget-me-not', '#5aa0e8', 'true love and remembrance']];
function flowerMatch() {
  const deck = shuffle([0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5]); MINI = { k: 'flower', deck, up: deck.map(() => false), done: deck.map(() => false), cur: 0, pick: [], wait: 0, moves: 0 };
}
function flowerUpdate(M) {
  if (M.win) { if (pressed.a || pressed.b) { MINI = null; say([['Florist', 'Lovely! In the old language of flowers, every one of those carried a message.'], ...FLOWER_MEANING.map(q => ['Florist', q[0] + ': ' + q[2] + '.'])]); } return; }
  if (pressed.b) { MINI = null; return; }
  if (M.wait > 0) { if (--M.wait === 0) { const [a, b] = M.pick; if (M.deck[a] === M.deck[b]) { M.done[a] = M.done[b] = true; } else { M.up[a] = M.up[b] = false; } M.pick = []; if (M.done.every(Boolean)) { M.win = true; earn(200); saveGame(); } } return; }
  const c = M.cur; if (pressed.left) M.cur = (c + 11) % 12; if (pressed.right) M.cur = (c + 1) % 12; if (pressed.up) M.cur = (c + 8) % 12; if (pressed.down) M.cur = (c + 4) % 12;
  if (pressed.a && !M.up[M.cur] && !M.done[M.cur]) { M.up[M.cur] = true; M.pick.push(M.cur); if (M.pick.length === 2) { M.wait = 40; M.moves++; } }
}
function flowerDraw(M) {
  const x = 24, y = 12, w = SW - 48, h = SH - 30; win(x, y, w, h); txt('FLOWERS FROM THE HEART · MATCH THE PAIRS', x + 10, y + 8, '#ffd860', 'left', SMALL);
  const cw = 64, ch = 54, gx = x + (w - 4 * cw - 24) / 2, gy = y + 24;
  for (let i = 0; i < 12; i++) {
    const px = gx + (i % 4) * (cw + 8), py = gy + Math.floor(i / 4) * (ch + 8), on = i === M.cur;
    F(on ? '#ffd860' : '#1a1418', px - 2, py - 2, cw + 4, ch + 4);
    if (M.up[i] || M.done[i]) { const f = FLOWER_MEANING[M.deck[i]]; F('#f4f0e4', px, py, cw, ch); F('#3a8a3a', px + cw / 2 - 1, py + 26, 3, 22); F('#4a9a48', px + cw / 2 + 2, py + 34, 8, 4);
      for (let a = 0; a < 8; a++) F(f[1], px + cw / 2 - 5 + Math.round(Math.cos(a * 0.785) * 10), py + 18 + Math.round(Math.sin(a * 0.785) * 10), 9, 9);
      F(M.deck[i] === 2 ? '#5a3a1a' : '#f0c020', px + cw / 2 - 4, py + 18, 9, 9); txt(f[0].toUpperCase(), px + cw / 2, py + ch - 8, '#3a2a20', 'center', SMALL); }
    else { F('#2a6a4a', px, py, cw, ch); for (let k = 4; k < cw; k += 10) F('#3a8a5a', px + k, py + 4, 4, ch - 8); F('#f0e0a0', px + cw / 2 - 6, py + ch / 2 - 6, 12, 12); }
  }
  txt(M.win ? 'ALL MATCHED IN ' + M.moves + ' TRIES! +' + money(200) + ' · A: DONE' : 'ARROWS: MOVE · A: FLIP · B: STOP', x + w / 2, y + h - 14, M.win ? '#a8f0a8' : '#c8d0f0', 'center', SMALL);
}
// every small game registers here: MINI.k picks its update and draw (later files add darts, the moisture meter...)
const MINIS = { dog: [dogUpdate, dogDraw], flower: [flowerUpdate, flowerDraw] };
for (const m of ['inside', 'walk']) {
  const U = MODES[m].update, D = MODES[m].draw;
  MODES[m].update = function () { if (MINI && MINIS[MINI.k]) return MINIS[MINI.k][0](MINI); if (MINI) MINI = null; return U.call(this); };
  MODES[m].draw = function () { D.call(this); if (MINI && MINIS[MINI.k]) MINIS[MINI.k][1](MINI); };
}
