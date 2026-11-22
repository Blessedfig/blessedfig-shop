"use strict";
// =====================================================================
//  THE McKENZIE PALACE THEATRE, 823 Fifth Ave (Nov 13). Antigo's two-screen movie house; a Palace has shown pictures on
//  Fifth since 1907, in this building since Christmas Day 1913 (library newspaper archive, Nov 17; earlier sources said 1916). The county parcel data files the building under 827: its outline
//  is 17 m wide on Fifth and 53 m deep, so the inside is 17 x 53 tiles at the interiors' 1 m tile.
//  Laid out from Christian's photos and notes: in the door, the snack counter on the left; ahead, the two theaters' doors
//  with the drink area between them; the stairs up on the right. Red patterned carpet, mounted deer heads, ferns along the
//  stair rail. The theaters: red seats, a center aisle with a runner, red curtains, a white screen, white walls with red
//  panels in gold frames. The photos are visual reference only: nothing is traced, and no person, mascot or logo in them
//  is drawn. Now showing (cinema/player.html): Theater 1, A Trip to the Moon (1902); Theater 2, The Great Train Robbery (1903).
//  Top of the screen = the screens at the back of the building; the doors on Fifth are the bottom row.
// =====================================================================
const PALACE = BLD.find(b => b.name === 'McKenzie Palace Theatre') || null;
const PAL_W = 17;
const PAL_ROWS = (() => {
  const R = ['WZZZZZZZWZZZZZZZW'];                                             //  0 the stage aprons under the two screens
  for (let i = 1; i <= 3; i++) R.push('WfffffffWfffffffW');                   //  1-3
  for (let i = 4; i <= 32; i++) R.push('WsssasssWsssasssW');                  //  4-32 seats, an aisle down the middle of each house
  for (let i = 33; i <= 35; i++) R.push('WfffffffWfffffffW');                 // 33-35 the cross aisle at the back
  R.push('WWWWWWDWWWDWWWWWW');                                                // 36 the doors: Theater 1 (left), Theater 2 (right)
  for (let i = 37; i <= 51; i++) R.push('WcccccccccccccccW');                 // 37-51 the lobby
  R.push('WOOOOOOeeeOOOOOOW');                                                // 52 the front windows and doors on Fifth
  const put = (x, y, s) => { R[y] = R[y].slice(0, x) + s + R[y].slice(x + s.length); };
  put(7, 37, 'BBB');                                    // the drink area, between the doors
  put(5, 38, 'I'); put(11, 38, 'I');                    // two pillars
  put(3, 39, 'n'); put(13, 39, 'n');                    // NOW SHOWING stands
  put(2, 40, 'd'); put(15, 40, 'k');                    // a director's chair; the ticket kiosk
  put(0, 42, 'WWWWWW');                                 // the wall behind the snack counter (the menu board)
  put(1, 43, 'puqyC'); put(13, 43, 'WWW');              // popcorn, slushies, a water cooler, candy; the top of the stairs
  put(1, 44, 'xxAxC'); put(12, 44, 'hSSS');             // behind the counter, the attendant; the stair rail and the stairs
  put(1, 45, 'CCCRC'); put(12, 45, 'hSSS');             // the counter and its register
  for (let y = 46; y <= 50; y++) put(12, y, 'hSSS');
  return R;
})();
// . W wall  Z stage  f floor  s seats  a aisle  D doorway  c lobby carpet  B drinks  I pillar  n poster stand  d director's
// chair  k kiosk  p popcorn  u slushies  q water cooler  y candy shelf  C counter  R register  x behind the counter
// A the attendant  h stair rail with ferns  S stairs  O front window  e front door
const PAL_WALK = new Set(['f', 'a', 'D', 'c', 'e']);
const PAL_ATT = { x: 3, y: 44 };
const PAL_FILMS = { 1: { id: 'trip', title: 'A Trip to the Moon', year: 1902, by: 'Georges Méliès' }, 2: { id: 'gtr', title: 'The Great Train Robbery', year: 1903, by: 'Edwin S. Porter' } };
const PAL_STILL = {}; for (const k of ['trip', 'gtr']) { PAL_STILL[k] = new Image(); PAL_STILL[k].src = 'cinema/stills_' + k + '.png'; }
const PAL_STILL_N = 8, PAL_STILL_W = 100, PAL_STILL_H = 75;   // frames per strip, each 100 x 75
FOLKS.usher = { skin: '#c99878', hair: '#2e2018', shirt: '#f0ece2', shirt2: '#f0ece2', pants: '#26262c', shoes: '#141416', vest: '#8e1620' };
{ const _df = drawFolk; drawFolk = function (who, cx, by, t) {   // a vest and a bow tie over the plain shirt
    _df(who, cx, by, t); const S = FOLKS[who]; if (!S || !S.vest) return; const bob = (t >> 5) % 2, R = (c, x, y, w, h) => F(c, Math.round(cx + x), Math.round(by + y), w, h);
    R(S.vest, -8, -23 + bob, 5, 12); R(S.vest, 3, -23 + bob, 5, 12); R(shade(S.vest, -0.3), -3, -16 + bob, 1, 5); R(shade(S.vest, -0.3), 2, -16 + bob, 1, 5);
    R('#141416', -3, -23 + bob, 6, 2); R('#141416', -1, -22 + bob, 2, 1); R('#d8b45a', -1, -14 + bob, 1, 1); R('#d8b45a', -1, -11 + bob, 1, 1); }; }

let PX = 0, PY = 0;                                       // the floor's top-left on screen, this frame
function pp(c, x, y, w, h) { F(c, PX + x, PY + y, w, h); }
function palT(x, y) { const r = PAL_ROWS[y]; return r && x >= 0 && x < PAL_W ? r[x] : ' '; }
function palWallAt(x, y) { return palT(x, y) === 'W'; }
function palHouse(x) { return x < 8 ? 1 : 2; }

// ---------- floors ----------
function palFloor(t, x, y) {
  const X = x * 24, Y = y * 24, h = hash(x * 17 + 3, y * 31 + 7);
  if (t === 'W' || t === ' ') return;
  if (y <= 35) {   // the theaters: dark carpet; the runner and its step lights down the aisle
    pp('#26121a', X, Y, 24, 24); if (h % 3 === 0) pp('#30171f', X + h % 21, Y + (h >> 5) % 21, 2, 1);
    if (t === 'Z') { pp('#3a2416', X, Y, 24, 24); pp('#5a3a22', X, Y, 24, 3); for (let i = 5; i < 24; i += 6) pp('#2e1c10', X, Y + i, 24, 1); pp('#1a0e08', X, Y + 21, 24, 3); }
    if (t === 'a' || (t === 'f' && (x === 4 || x === 12))) {
      pp('#6a1620', X + 3, Y, 18, 24); pp('#4a0e16', X + 3, Y, 1, 24); pp('#4a0e16', X + 20, Y, 1, 24);
      for (const [dx, dy] of [[12, 4], [12, 16]]) { pp('#c89a48', X + dx - 1, Y + dy - 2, 2, 1); pp('#c89a48', X + dx - 2, Y + dy - 1, 4, 1); pp('#c89a48', X + dx - 1, Y + dy, 2, 1); }
      pp('#8a2a32', X + 6, Y + 10, 1, 1); pp('#8a2a32', X + 17, Y + 22, 1, 1);
      if (t === 'a') { pp('#ffcf6a', X + 1, Y + 19, 2, 2); pp('#ffcf6a', X + 21, Y + 19, 2, 2); }   // step lights
    }
    return;
  }
  if (t === 'x' || t === 'A') { pp((x + y) % 2 ? '#d8d0c0' : '#bdb4a2', X, Y, 24, 24); pp('rgba(0,0,0,.08)', X, Y + 23, 24, 1); return; }   // behind the counter
  // the lobby's red patterned carpet: a gold medallion in a navy lattice
  pp('#8a1a24', X, Y, 24, 24);
  pp('#6c121b', X, Y, 24, 1); pp('#6c121b', X, Y, 1, 24);
  pp('#2c2048', X + 11, Y, 2, 3); pp('#2c2048', X + 11, Y + 21, 2, 3); pp('#2c2048', X, Y + 11, 3, 2); pp('#2c2048', X + 21, Y + 11, 3, 2);
  pp('#c89a48', X + 11, Y + 8, 2, 8); pp('#c89a48', X + 8, Y + 11, 8, 2); pp('#e0b860', X + 11, Y + 11, 2, 2);
  pp('#a8323c', X + 4, Y + 4, 2, 2); pp('#a8323c', X + 18, Y + 18, 2, 2); pp('#a8323c', X + 18, Y + 4, 2, 2); pp('#a8323c', X + 4, Y + 18, 2, 2);
  if (t === 'e') { pp('#2a2226', X + 1, Y + 3, 22, 14); pp('#3a3036', X + 2, Y + 4, 20, 12); }   // the mat inside the doors
}

// ---------- walls ----------
function palPanelWall(X, y0, h, dark) {   // the theaters' white walls with red panels in gold frames
  pp(dark ? '#b8b2a8' : '#e8e4dc', X, y0, 24, h);
  for (let y = y0 + 4; y < y0 + h - 6; y += 30) { pp('#c8a050', X + 4, y, 16, Math.min(24, y0 + h - 6 - y)); pp('#8e1620', X + 6, y + 2, 12, Math.min(20, y0 + h - 10 - y)); }
}
function palLobbyWall(X, y0, h) {   // cream plaster over a dark wood wainscot
  pp('#e6dac0', X, y0, 24, h); pp('#d4c6a6', X, y0 + 2, 24, 1);
  const wb = Math.min(h, 12); pp('#5a3a22', X, y0 + h - wb, 24, wb); pp('#7a5434', X, y0 + h - wb, 24, 2); for (let i = 3; i < 24; i += 8) pp('#4a2e1a', X + i, y0 + h - wb + 3, 1, wb - 4);
}
function palWall(x, y) {   // the face of a wall tile that has floor in front of it: from 9 px above its tile to its foot
  const X = x * 24, Y = y * 24, top = !palWallAt(x, y - 1) || y === 36 || y === 42 || y === 43;
  if (y === 36) {
    palLobbyWall(X, Y - 9, 33);
    const deco = { 1: 'trip', 2: 'deer', 4: 'deer', 5: 'one', 11: 'two', 12: 'deer', 14: 'deer', 15: 'gtr' }[x];
    if (deco === 'deer') palDeer(X, Y - 6);
    else if (deco === 'trip' || deco === 'gtr') palPoster(deco, X + 4, Y - 6, 16, 20);
    else if (deco === 'one' || deco === 'two') { pp('#1c1416', X + 6, Y - 4, 12, 11); pp('#c8a050', X + 7, Y - 3, 10, 9); pp('#1c1416', X + 8, Y - 2, 8, 7); palDigit(deco === 'one' ? 1 : 2, X + 10, Y - 1, '#f0d890'); }
    if (x >= 7 && x <= 9) palBalloons(X, Y, x);
  } else if (y === 42) {
    palLobbyWall(X, Y - 9, 33);
    if (x >= 1 && x <= 4) palMenu(X, Y - 7, x);
  } else if (y === 43) {
    palLobbyWall(X, Y - 9, 33);
    if (x === 14) { pp('#1a1012', X + 4, Y - 6, 16, 26); pp('#c8a050', X + 3, Y - 7, 18, 1); pp('#2a1a1c', X + 5, Y - 5, 14, 3); }   // the doorway at the top of the stairs
  } else if (y === 52 || y === 0) { }
  if (top) { pp('#3a2414', X, Y - 9, 24, 2); }
}
function palDigit(n, x, y, c) { const G = { 1: ['010', '110', '010', '010', '111'], 2: ['110', '001', '010', '100', '111'] }[n]; for (let r = 0; r < 5; r++) for (let i = 0; i < 3; i++) if (G[r][i] === '1') pp(c, x + i, y + r, 1, 1); }
function palDeer(X, Y) {   // a mounted deer head on an oval plaque
  pp('#5a3a22', X + 6, Y + 2, 12, 15); pp('#7a5434', X + 7, Y + 3, 10, 13);
  pp('#8a6040', X + 9, Y + 5, 6, 9); pp('#a87a50', X + 10, Y + 6, 4, 4); pp('#2a1a10', X + 10, Y + 12, 4, 3); pp('#141010', X + 10, Y + 7, 1, 1); pp('#141010', X + 13, Y + 7, 1, 1);
  pp('#8a6040', X + 7, Y + 4, 2, 2); pp('#8a6040', X + 15, Y + 4, 2, 2);                              // ears
  pp('#d8c8a0', X + 8, Y - 4, 1, 7); pp('#d8c8a0', X + 6, Y - 3, 2, 1); pp('#d8c8a0', X + 7, Y - 6, 1, 3);  // antlers
  pp('#d8c8a0', X + 15, Y - 4, 1, 7); pp('#d8c8a0', X + 16, Y - 3, 2, 1); pp('#d8c8a0', X + 16, Y - 6, 1, 3);
}
function palPoster(k, x, y, w, h) {   // a one-sheet for one of the two films, drawn for the game
  pp('#c8a050', x - 1, y - 1, w + 2, h + 2); pp('#1c1416', x, y, w, h);
  if (k === 'trip') {   // the Moon with the capsule in its eye
    pp('#0c1030', x + 1, y + 1, w - 2, h - 7); pp('#e8e4d4', x + 4, y + 3, 8, 8); pp('#c8c4b4', x + 5, y + 4, 2, 2); pp('#8a8678', x + 8, y + 8, 3, 1);
    pp('#9aa0a8', x + 9, y + 4, 4, 2); pp('#f0f0f0', x + 2, y + 2, 1, 1); pp('#f0f0f0', x + 13, y + 9, 1, 1);
    pp('#f0d890', x + 2, y + h - 5, w - 4, 1); pp('#f0d890', x + 4, y + h - 3, w - 8, 1);
  } else {   // a locomotive under a big sky
    pp('#d8a050', x + 1, y + 1, w - 2, h - 7); pp('#e8c070', x + 1, y + 1, w - 2, 3); pp('#2a1a10', x + 2, y + 9, 11, 4); pp('#2a1a10', x + 10, y + 6, 3, 3); pp('#2a1a10', x + 3, y + 7, 2, 2);
    pp('#e8e0d0', x + 2, y + 4, 3, 2); pp('#1a1010', x + 3, y + 13, 2, 1); pp('#1a1010', x + 7, y + 13, 2, 1); pp('#1a1010', x + 11, y + 13, 2, 1);
    pp('#f0d890', x + 2, y + h - 5, w - 4, 1); pp('#f0d890', x + 4, y + h - 3, w - 8, 1);
  }
}
function palMenu(X, Y, x) {   // the menu board: lines of words, no brands
  pp('#141214', X, Y, 24, 20); pp('#3a3436', X, Y, 24, 1); pp('#3a3436', X, Y + 19, 24, 1);
  if (x === 1) pp('#3a3436', X, Y, 1, 20); if (x === 4) pp('#3a3436', X + 23, Y, 1, 20);
  const C = ['#f0d060', '#f07a5a', '#7ad0f0', '#f0f0e8', '#a8e070'];
  for (let r = 0; r < 4; r++) { const q = hash(x * 3 + r, 9); pp(C[(x + r) % 5], X + 3, Y + 3 + r * 4, 8 + q % 9, 1); pp('#d8d4cc', X + 17, Y + 3 + r * 4, 4, 1); }
}
function palBalloons(X, Y, x) {   // a balloon arch over the drink area, every colour of the rainbow
  const C = ['#e04040', '#f08a30', '#f0d040', '#50b050', '#3a7ad8', '#8a4ac8'];
  for (let i = 0; i < 6; i++) { const gx = (x - 7) * 24 + i * 4, k = gx / 72, ay = Math.round(-Math.sin(k * Math.PI) * 14);
    pp(C[(gx >> 2) % 6], X + i * 4, Y + 4 + ay, 4, 4); pp('rgba(255,255,255,.4)', X + i * 4 + 1, Y + 5 + ay, 1, 1); }
}

// ---------- the screens on the back wall ----------
function palScreenWall(house, t) {
  const x0 = house === 1 ? 24 : 9 * 24, w = 7 * 24, top = -96;
  for (let i = 0; i < 7; i++) palPanelWall(x0 + i * 24, top, 96, true);
  pp('rgba(10,6,14,.42)', x0, top, w, 96);
  const sx = x0 + 24, sw = w - 48, sy = top + 16, sh = 70;            // the screen
  // the curtains, drawn back to the sides, and the gold-trimmed valance across the top
  for (const cx of [x0, x0 + w - 26]) { for (let i = 0; i < 26; i += 4) { pp(i % 8 ? '#7a121c' : '#9a1c26', cx + i, top + 6, 4, 90); pp('#5a0a12', cx + i + 3, top + 6, 1, 90); } }
  pp('#8e1620', x0, top, w, 12); for (let i = 0; i < w; i += 8) pp('#a82a32', x0 + i, top, 4, 12); pp('#c8a050', x0, top + 12, w, 2);
  for (let i = 4; i < w; i += 12) { pp('#8e1620', x0 + i, top + 14, 6, 3); pp('#c8a050', x0 + i + 2, top + 17, 2, 2); }
  pp('#0a0608', sx - 2, sy - 2, sw + 4, sh + 4); pp('#d8d6d0', sx, sy, sw, sh);
  // the film: a 4:3 still in the middle of the wider screen, with the projector's flicker; a new still every few seconds
  const F0 = PAL_FILMS[house], im = PAL_STILL[F0.id], fw = Math.round(sh * 4 / 3), fx = sx + Math.round((sw - fw) / 2);
  pp('#121012', sx, sy, sw, sh);
  if (im.complete && im.naturalWidth) {
    const k = Math.floor(t / 240 + house * 3) % PAL_STILL_N, fade = (t % 240) < 10 ? (t % 240) / 10 : 1;
    ctx.save(); ctx.globalAlpha = fade * (0.9 + 0.1 * ((hash(t >> 2, house) % 100) / 100)); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, k * PAL_STILL_W, 0, PAL_STILL_W, PAL_STILL_H, PX + fx, PY + sy, fw, sh); ctx.restore(); ctx.imageSmoothingEnabled = false;
  } else { pp('#3a3a3a', fx, sy, fw, sh); }
  pp('rgba(255,250,235,.05)', sx, sy, sw, sh);
}

// ---------- everything standing up ----------
function palProp(t, x, y, w, h) {
  const X = x * 24, Y = y * 24;
  switch (t) {
    case 's': {   // two seats to a tile: back, cushion, the arms between
      pp('rgba(0,0,0,.35)', X, Y + 19, 24, 4);
      for (let i = 0; i < 2; i++) { const sx = X + i * 12; pp('#2a0c10', sx, Y + 2, 12, 17); pp('#7e141c', sx + 1, Y + 3, 10, 8); pp('#a62a34', sx + 2, Y + 3, 8, 2); pp('#5e0e14', sx + 1, Y + 12, 10, 6); pp('#741620', sx + 2, Y + 12, 8, 2); }
      pp('#140608', X + 11, Y + 9, 2, 10);
      break; }
    case 'B': {   // the drink counter: a fountain with six taps, cups, a bin of ice; no brands
      pp('rgba(0,0,0,.25)', X, Y + 20, 72, 4);
      pp('#3a2a2a', X + 1, Y + 4, 70, 18); pp('#5a4040', X + 1, Y + 4, 70, 3); pp('#9aa0a8', X, Y + 2, 72, 3);
      pp('#c8ccd2', X + 18, Y - 14, 36, 18); pp('#e8ecf0', X + 18, Y - 14, 36, 3); pp('#7a8088', X + 18, Y + 2, 36, 2);
      const TC = ['#e04040', '#f0a030', '#50b050', '#3a7ad8', '#8a4ac8', '#e8e0d0'];
      for (let i = 0; i < 6; i++) { pp(TC[i], X + 21 + i * 5, Y - 10, 4, 5); pp('#5a6068', X + 22 + i * 5, Y - 4, 2, 4); }
      for (let i = 0; i < 3; i++) pp('#f0ece4', X + 4 + i * 4, Y - 6 + i, 3, 10 - i);     // stacked cups
      pp('#dfe8f0', X + 58, Y - 2, 10, 6); pp('#ffffff', X + 60, Y - 1, 3, 2);           // ice
      break; }
    case 'I': {   // a round pillar with a gold capital and base
      pp('rgba(0,0,0,.25)', X + 4, Y + 18, 18, 5);
      pp('#d8ccb0', X + 6, Y - 30, 12, 50); pp('#efe6d0', X + 8, Y - 30, 3, 50); pp('#b8ac90', X + 15, Y - 30, 3, 50);
      pp('#c8a050', X + 4, Y - 34, 16, 5); pp('#c8a050', X + 4, Y + 17, 16, 4); pp('#a07a30', X + 4, Y - 30, 16, 1);
      break; }
    case 'n': {   // a NOW SHOWING stand: a black easel and a framed poster
      const k = x < 8 ? 'trip' : 'gtr';
      pp('rgba(0,0,0,.25)', X + 4, Y + 19, 16, 4); pp('#1a1416', X + 6, Y + 4, 2, 17); pp('#1a1416', X + 16, Y + 4, 2, 17);
      palPoster(k, X + 4, Y - 16, 16, 22); pp('#c8a050', X + 3, Y - 22, 18, 5); pp('#1a1416', X + 4, Y - 21, 16, 3);
      for (let i = 0; i < 4; i++) pp('#f0d890', X + 5 + i * 4, Y - 20, 2, 1);
      break; }
    case 'k': {   // the ticket kiosk
      pp('rgba(0,0,0,.25)', X + 4, Y + 19, 16, 4); pp('#2a2c34', X + 8, Y + 2, 8, 18); pp('#3a3e48', X + 5, Y - 14, 14, 18); pp('#1a1c22', X + 6, Y - 13, 12, 12);
      pp((frame >> 5) % 2 ? '#3a8ad8' : '#4a9ae8', X + 7, Y - 12, 10, 10); pp('#f0f0f0', X + 8, Y - 10, 6, 1); pp('#f0f0f0', X + 8, Y - 7, 8, 1); pp('#c83a3a', X + 8, Y - 4, 5, 2);
      break; }
    case 'd': {   // a director's chair, red canvas on a wood frame
      pp('rgba(0,0,0,.25)', X + 3, Y + 19, 18, 4); pp('#8a6040', X + 5, Y + 2, 2, 18); pp('#8a6040', X + 17, Y + 2, 2, 18); pp('#8a6040', X + 5, Y + 12, 14, 2);
      pp('#a82a32', X + 5, Y - 2, 14, 6); pp('#a82a32', X + 7, Y + 9, 10, 4); pp('#6a4428', X + 4, Y + 7, 16, 2);
      break; }
    case 'p': {   // the popcorn machine: a red-capped glass case full of popcorn, lit inside
      pp('rgba(0,0,0,.3)', X + 1, Y + 19, 22, 4); pp('#a01c24', X + 2, Y + 6, 20, 14); pp('#c02a32', X + 2, Y + 6, 20, 2);
      pp('#a01c24', X + 3, Y - 20, 18, 4); pp('#c02a32', X + 3, Y - 20, 18, 1);
      pp('#cfe0e8', X + 3, Y - 16, 18, 22); pp('#f2e2a0', X + 4, Y - 6, 16, 12); for (let i = 0; i < 9; i++) { const q = hash(i, frame >> 4); pp('#fff4c8', X + 4 + q % 15, Y - 6 + (q >> 5) % 11, 2, 2); }
      pp('#7a7e86', X + 9, Y - 15, 6, 3); pp('rgba(255,250,220,.35)', X + 4, Y - 15, 3, 18);
      break; }
    case 'u': {   // the slushie machine: two clear bowls of red and blue slush turning slowly (no sign on it)
      pp('rgba(0,0,0,.3)', X + 1, Y + 19, 22, 4); pp('#e8e8ec', X + 2, Y + 4, 20, 16); pp('#c8c8d0', X + 2, Y + 16, 20, 4);
      for (let i = 0; i < 2; i++) { const bx = X + 3 + i * 10, col = i ? '#3a7ad8' : '#d83a4a'; pp('#cfe0e8', bx, Y - 16, 8, 20); pp(col, bx + 1, Y - 10, 6, 13);
        const s = (frame >> 3) % 6; for (let k = 0; k < 13; k += 6) pp(shade(col, 0.3), bx + 1, Y - 10 + ((k + s) % 13), 6, 1); pp('#5a6068', bx + 3, Y + 5, 2, 3); }
      break; }
    case 'q': {   // a glass-door cooler of bottled water
      pp('rgba(0,0,0,.3)', X + 1, Y + 19, 22, 4); pp('#e8ecf0', X + 2, Y - 18, 20, 38); pp('#9ab8c8', X + 4, Y - 15, 16, 30);
      for (let r = 0; r < 4; r++) for (let i = 0; i < 5; i++) { pp('#d8ecf8', X + 5 + i * 3, Y - 13 + r * 7, 2, 5); pp('#3a7ad8', X + 5 + i * 3, Y - 14 + r * 7, 2, 1); }
      pp('rgba(255,255,255,.35)', X + 5, Y - 15, 2, 28); pp('#7a8088', X + 18, Y - 4, 1, 6);
      break; }
    case 'y': {   // a back shelf of candy boxes
      pp('rgba(0,0,0,.3)', X + 1, Y + 19, 22, 4); pp('#5a3a22', X + 1, Y - 14, 22, 34);
      const C = ['#e04040', '#f0c030', '#3a7ad8', '#50b050', '#f08a30', '#8a4ac8', '#e8e0d0'];
      for (let r = 0; r < 4; r++) { pp('#3a2414', X + 1, Y - 4 + r * 7, 22, 1); for (let i = 0; i < 5; i++) pp(C[(i + r * 2 + x) % 7], X + 2 + i * 4, Y - 10 + r * 7, 3, 6); }
      break; }
    case 'C': case 'R': {   // the counter: red front, a glass candy case, a steel top
      pp('rgba(0,0,0,.25)', X, Y + 20, 24, 4); pp('#a01c24', X, Y + 2, 24, 18); pp('#7a121a', X, Y + 18, 24, 2); pp('#c8ccd2', X, Y - 2, 24, 5); pp('#e8ecf0', X, Y - 2, 24, 1);
      if (y === 45 && x <= 3) { pp('#2a2a30', X + 2, Y + 5, 20, 10); const C = ['#e04040', '#f0c030', '#3a7ad8', '#50b050', '#f08a30', '#8a4ac8']; for (let i = 0; i < 5; i++) pp(C[(i + x) % 6], X + 3 + i * 4, Y + 8, 3, 6); pp('rgba(255,255,255,.25)', X + 3, Y + 6, 18, 1); }
      if (t === 'R') { pp('#2a2c34', X + 6, Y - 10, 12, 9); pp('#3a8a6a', X + 8, Y - 9, 8, 3); pp('#5a5e68', X + 7, Y - 4, 10, 2); pp('#1a1c22', X + 15, Y - 6, 4, 4); }
      break; }
    case 'h': {   // the half wall along the stairs: wood cap, cream face, potted ferns on top
      pp('#e6dac0', X + 6, Y - 6, 12, 28); pp('#5a3a22', X + 6, Y + 10, 12, 12); pp('#7a5434', X + 5, Y - 8, 14, 3);
      if (y % 2 === 0) { pp('#8a5a3a', X + 8, Y - 13, 8, 6); pp('#2e6a2a', X + 4, Y - 22, 16, 10); pp('#3e8a3a', X + 6, Y - 24, 5, 4); pp('#3e8a3a', X + 13, Y - 23, 5, 4); pp('#4e9a48', X + 2, Y - 17, 5, 2); pp('#4e9a48', X + 17, Y - 17, 5, 2); }
      break; }
    case 'S': {   // stairs climbing toward the back: red carpet, brass nosings
      for (let i = 0; i < 3; i++) { const sy = Y + i * 8; pp(shade('#8a1a24', 0.08 * (2 - i) - (y - 44) * 0.03), X, sy, 24, 8); pp('#c8a050', X, sy, 24, 1); pp('#4a0c12', X, sy + 7, 24, 1); }
      if (x === 15) pp('#3a2414', X + 21, Y, 3, 24);
      break; }
    case 'O': {   // the front windows: glass in dark frames, Fifth Avenue's light coming in
      pp('#2a2226', X, Y, 24, 24); pp('#9ab8d0', X + 2, Y + 3, 20, 14); pp('rgba(255,255,255,.35)', X + 4, Y + 4, 3, 12); pp('#3a3036', X, Y + 18, 24, 6);
      break; }
    case 'e': { pp('#1a1416', X, Y + 18, 24, 6); pp('#c8a050', X + 11, Y + 19, 2, 4); break; }   // the glass doors' sills and brass handles
    case 'D': {   // a theater's doorway: dark wood posts and lintel, the dim house beyond
      pp('rgba(10,4,8,.6)', X + 3, Y - 5, 18, 29); pp('#2a1a10', X, Y - 9, 3, 33); pp('#2a1a10', X + 21, Y - 9, 3, 33); pp('#3a2414', X, Y - 9, 24, 4); pp('#c8a050', X + 3, Y - 6, 18, 1);
      break; }
  }
}
function palCaps(x, y) {   // the tops of walls that face away from us: the theaters' panelled walls, the lobby's side walls
  const X = x * 24, Y = y * 24;
  if (y <= 35) { pp('#1c1214', X, Y, 24, 24); pp('#e8e4dc', X + 3, Y, 18, 24); if ((y + (x === 8 ? 1 : 0)) % 3 === 0) { pp('#c8a050', X + 5, Y + 3, 14, 18); pp('#8e1620', X + 7, Y + 5, 10, 14); } return; }
  pp('#1c1214', X, Y, 24, 24); pp('#e6dac0', X + 4, Y, 16, 24); pp('#5a3a22', X + 4, Y + 20, 16, 4);
}

let PAL_T = 0;
function palPaint(ox, oy, kx, ky) {
  PAL_T++;
  const FH = PAL_ROWS.length;
  // this floor is wider than the view and has tall screens at the back: the camera follows the kid both ways
  ox = Math.round(Math.max(SW - PAL_W * IT, Math.min(0, SW / 2 - kx * IT - IT / 2)));
  oy = Math.round(Math.max(SH - IT - FH * IT, Math.min(4 * IT + 8, SH / 2 - ky * IT - IT / 2)));
  PX = ox; PY = oy;
  const ya = Math.max(0, Math.floor(-oy / 24) - 1), yb = Math.min(FH - 1, Math.ceil((SH - oy) / 24) + 1);
  for (let y = ya; y <= yb; y++) for (let x = 0; x < PAL_W; x++) palFloor(palT(x, y), x, y);
  const L = [];
  for (let y = Math.max(0, ya - 2); y <= yb; y++) for (let x = 0; x < PAL_W; x++) {
    const t = palT(x, y);
    if (t === 'W') {
      const below = palT(x, y + 1);
      if (below !== 'W' && below !== ' ' && y >= 36) L.push({ y: y + 0.001, draw: () => palWall(x, y) });
      else L.push({ y: y - 0.5, draw: () => palCaps(x, y) });
      continue; }
    if (t === 'D') { L.push({ y: y + 0.001, draw: () => palProp('D', x, y, 1, 1) }); continue; }
    if (PAL_WALK.has(t) && t !== 'e') continue;
    if (t === 'x' || t === 'A' || t === 'Z') continue;
    if (t === 'B') { if (palT(x - 1, y) === 'B') continue; L.push({ y: y + 0.002, draw: () => palProp('B', x, y, 3, 1) }); continue; }
    L.push({ y: y + 0.002, draw: () => palProp(t, x, y, 1, 1) });
  }
  if (PAL_ATT.y >= ya - 1 && PAL_ATT.y <= yb + 1) L.push({ y: PAL_ATT.y + 0.0015, draw: () => drawFolk('usher', PX + PAL_ATT.x * 24 + 12, PY + PAL_ATT.y * 24 + 23, frame) });
  L.push({ y: ky + 0.005, draw: () => drawKid(G.kid, Math.round(PX + kx * IT), Math.round(PY + ky * IT), G.dir, P.t > 0, IT) });
  L.sort((a, b) => a.y - b.y).forEach(e => e.draw());
  // the theaters are dark but for the screens; the projector's beam crosses the room from the booth
  if (ya <= 36) {
    const yEnd = Math.min(36 * 24 - 9, (yb + 1) * 24);
    pp('rgba(8,4,14,.46)', 0, Math.max(-96, ya * 24 - 24), PAL_W * 24, yEnd - Math.max(-96, ya * 24 - 24));
    for (const house of [1, 2]) {
      const cx = house === 1 ? 4.5 * 24 : 12.5 * 24, sx0 = cx - 60, sx1 = cx + 60, by = 35.7 * 24;
      ctx.fillStyle = 'rgba(255,248,226,.045)'; ctx.beginPath(); ctx.moveTo(PX + cx - 3, PY + by); ctx.lineTo(PX + sx0, PY - 80); ctx.lineTo(PX + sx1, PY - 80); ctx.lineTo(PX + cx + 3, PY + by); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 10; i++) { const q = hash(i * 7 + house, PAL_T >> 3), k = ((q % 1000) / 1000 + PAL_T / 900 * (1 + i % 3)) % 1, yy = by + (-80 - by) * k, half = 3 + (60 - 3) * k;
        pp('rgba(255,250,230,.35)', cx - half + (q >> 10) % Math.max(1, Math.round(half * 2)), yy, 1, 1); }
      for (let y = Math.max(4, ya); y <= Math.min(32, yb); y++) { pp('#ffcf6a', (house === 1 ? 4 : 12) * 24 + 1, y * 24 + 19, 2, 2); pp('#ffcf6a', (house === 1 ? 4 : 12) * 24 + 21, y * 24 + 19, 2, 2); }   // step lights stay bright
    }
    if (oy > -96) { palScreenWall(1, PAL_T); palScreenWall(2, PAL_T); pp('#1c1214', 0, -96, 24, 96); pp('#1c1214', 8 * 24, -96, 24, 96); pp('#1c1214', 16 * 24, -96, 24, 96); }
  }
  F('#0b0b14', 0, 0, Math.max(0, PX), SH); F('#0b0b14', PX + PAL_W * IT, 0, Math.max(0, SW - PX - PAL_W * IT), SH);
}

// ---------- walking, looking, the door ----------
function palFree(x, y) { return PAL_WALK.has(palT(x, y)); }
function palZone(x, y) {
  if (y <= 35) return x < 8 ? 'THEATER 1' : 'THEATER 2';
  if (x <= 6 && y >= 43) return 'SNACK BAR';
  if (x >= 12 && y >= 42) return 'STAIRS';
  return 'LOBBY';
}
function palWatch(house) {
  const f = PAL_FILMS[house];
  ask('Theater ' + house + '. Now showing: ' + f.title + ' (' + f.year + '), by ' + f.by + '. Take a seat?', [
    { t: 'Watch the film', f: () => say([['', 'You find a seat. The lights dim, the projector starts to clatter, and the screen comes alive.']], () => cinemaOpen(f.id)) },
    { t: 'Not now' }]);
}
function cinemaOpen(id) {
  const f = PAL_FILMS[id === 'gtr' ? 2 : 1];
  pageShow('cinema/player.html?f=' + id, f.title + ' (' + f.year + ') · McKenzie Palace Theatre', null);
}
function palAttendant() {
  ask('Attendant: Welcome to the Palace! Two old classics today, and both are free.', [
    { t: 'What\'s showing?', f: () => say([['Attendant', 'Theater 1, on the left: A Trip to the Moon, from 1902. A professor fires a capsule at the Moon and hits it right in the eye.'],
      ['Attendant', 'Theater 2, on the right: The Great Train Robbery, from 1903. Bandits, a train, a posse. It\'s one of the first westerns.'],
      ['Attendant', 'They\'re silent films, and they\'re old enough now that anybody can show them.']]) },
    { t: 'Popcorn, please', f: () => say([['', 'The attendant scoops a bag of popcorn, warm and buttery.'], ['Attendant', 'Enjoy the show!']]) },
    { t: 'About the Palace', f: () => say([['Attendant', 'There\'s been a Palace showing pictures on Fifth Avenue since 1907. This building opened on Christmas Day, 1913.'], ['Attendant', 'Back then it was one big hall of 700 seats. Now there are two screens.']]) },
    { t: 'Bye' }]);
}
function palLook(x, y) {
  const t = y < 0 ? '^' : palT(x, y);
  if ((x === PAL_ATT.x && y === PAL_ATT.y) || (y === 45 && x >= 1 && x <= 5) || t === 'A') return palAttendant();
  if (t === 's' || t === 'Z' || t === '^') return palWatch(palHouse(x));
  if (t === 'n') { const f = PAL_FILMS[x < 8 ? 1 : 2]; return say([['', 'NOW SHOWING, THEATER ' + (x < 8 ? 1 : 2) + ': ' + f.title.toUpperCase() + ' (' + f.year + ').']]); }
  if (t === 'W' && y === 36) {
    const L = { 1: 'A poster for A Trip to the Moon: the Man in the Moon with a capsule in his eye.', 15: 'A poster for The Great Train Robbery: a locomotive under a wide gold sky.',
      2: 'A mounted deer head keeps an eye on the lobby.', 4: 'A mounted deer head. Somebody has hung a ticket stub on one antler.', 12: 'A mounted deer head, ten points.', 14: 'A mounted deer head, gazing at the popcorn.',
      5: 'A brass plate: 1. Theater 1 is through this door.', 11: 'A brass plate: 2. Theater 2 is through this door.' }[x];
    return say([['', L || 'Cream plaster over dark wood.']]); }
  if (t === 'W' && y === 42) return say([['', 'The menu board: POPCORN, CANDY, SODA, SLUSHIES, WATER.']]);
  if (t === 'W' && y === 43) return say([['', 'The top of the stairs, and a dark doorway to the upper floor.']]);
  const L = {
    W: y <= 35 ? 'White walls with red panels in gold frames.' : 'Cream plaster over dark wood.',
    B: 'The drink fountain, between the two theater doors. Cups, ice, six flavors, and a rainbow arch of balloons overhead.',
    I: 'A round pillar with a gold top and base.', k: 'The ticket kiosk. Its screen just says: ENJOY THE SHOW.', d: 'A canvas director\'s chair. A good spot for a picture.',
    p: 'The popcorn machine. The kettle tips and a fresh batch spills out.', u: 'The slushie machine: one bowl of red, one of blue, both turning slowly.',
    q: 'A cooler of bottled water.', y: 'Candy, boxed and stacked by color.', x: 'Behind the counter.', h: 'Ferns in pots along the stair rail.',
    S: 'The stairs climb to the second floor.', O: 'Fifth Avenue, through the front windows.', f: '', a: '', c: '',
  }[t];
  if (L) say([['', L]]);
}
function enterPalace() {
  G.inside = { f: 'palace', x: 8, y: 51 }; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('inside');
  say([['', 'McKenzie Palace Theatre. The smell of popcorn, a red carpet, and two doors at the far end of the lobby.']]);
}
let PAL_HOLD = false;
function palLeave() {
  const [x, y] = outsideDoorM(PALACE); G.inside = null; G.x = x; G.y = y; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; PAL_HOLD = true; saveGame(); setMode('walk');
}
FIG_FLOORS.palace = { name: 'LOBBY', place: 'McKENZIE PALACE THEATRE', bld: 'palace', rows: PAL_ROWS, paint: palPaint, look: palLook, free: palFree, leave: palLeave, zone: palZone };
// outside: the doors face north onto Fifth, so you walk down into them (or face them and press A)
function palDoorAt(x, y) { if (!PALACE || !PALACE.door) return false; const [dx, dy] = doorM(PALACE); return Math.abs(x + 0.5 - dx) <= 1.01 && y + 0.5 >= dy - 0.01 && y + 0.5 <= dy + 1.01; }
{ const _de = doorEnter; doorEnter = function (x, y) { return _de(x, y) || (palDoorAt(x, y) ? enterPalace : null); }; }
{ const _wu = MODES.walk.update; MODES.walk.update = function () {
    if (PAL_HOLD && !held.down) PAL_HOLD = false;
    if (!PAL_HOLD && !DLG && P.t === 0 && !pressed.a && dirHeld() === 'down' && palDoorAt(G.x, G.y + 1)) { G.dir = 'down'; return enterPalace(); }
    return _wu.call(this); }; }
if (PALACE) PALACE.enter = 1;

// ---------- outside: the marquee over the sidewalk and the PALACE sign over the roof (north-facing, so drawn at the
// roof's front edge like the other south-side shops' awnings). At night the bulbs glow. ----------
const PAL_GLOW = [];
const PAL_GLYPH = { A: ['010', '101', '111', '101', '101'], B: ['110', '101', '110', '101', '110'], C: ['011', '100', '100', '100', '011'], E: ['111', '100', '110', '100', '111'],
  G: ['011', '100', '101', '101', '011'], H: ['101', '101', '111', '101', '101'], I: ['111', '010', '010', '010', '111'], L: ['100', '100', '100', '100', '111'],
  M: ['10001', '11011', '10101', '10001', '10001'], N: ['1001', '1101', '1011', '1001', '1001'], O: ['010', '101', '101', '101', '010'], P: ['110', '101', '110', '100', '100'],
  R: ['110', '101', '110', '101', '101'], T: ['111', '010', '010', '010', '010'], Y: ['101', '101', '010', '010', '010'], '&': ['010', '101', '010', '101', '011'], ' ': ['00', '00', '00', '00', '00'] };
function palWord(s, cx, y, c, k) {   // tiny capitals, k px per pixel, centred on cx (world pixels)
  k = k || 1; let w = -1; for (const ch of s) w += ((PAL_GLYPH[ch] || PAL_GLYPH[' '])[0].length + 1); let x = cx - Math.round(w * k / 2);
  for (const ch of s) { const g = PAL_GLYPH[ch] || PAL_GLYPH[' ']; for (let r = 0; r < 5; r++) for (let i = 0; i < g[r].length; i++) if (g[r][i] === '1') F(c, x + i * k, y + r * k, k, k); x += (g[0].length + 1) * k; }
}
{ const _db = drawBuilding; drawBuilding = function (b) {
    _db(b);
    if (b !== PALACE) return;
    const s = bstyle(b), topY = b.pyMin * T - s.h, cx = (b.pxMin + b.pxMax) / 2 * T, mw = 12 * PM, mh = 3.1 * PM, mx = cx - mw / 2, my = topY - mh - 2;
    // the marquee: a lit letter board in a bulb-studded frame
    F('#1c1618', mx - 3, my - 3, mw + 6, mh + 6); F('#8e1620', mx - 2, my - 2, mw + 4, mh + 4); F('#f2efe4', mx + 2, my + 2, mw - 4, mh - 4);
    const on = (frame >> 3) % 3;
    for (let i = 0; i < mw; i += 4) { F(((i >> 2) % 3) === on ? '#fff2a8' : '#c8a050', mx + i, my - 2, 2, 2); F(((i >> 2) % 3) === (on + 1) % 3 ? '#fff2a8' : '#c8a050', mx + i, my + mh, 2, 2); }
    palWord('A TRIP TO THE MOON', cx, my + 4, '#1c1618', 1); palWord('THE GREAT TRAIN ROBBERY', cx, my + 13, '#8e1620', 1);
    // the PALACE sign, standing over the roof: cream letters on red, ringed with bulbs
    const vx = cx + 3.4 * PM, vw = 2.2 * PM, vh = 9.5 * PM, vy = topY - vh - mh;
    F('#1c1618', vx - 2, vy - 2, vw + 4, vh + 4); F('#a01c24', vx, vy, vw, vh); F('#c8a050', vx + 1, vy + 1, vw - 2, 1); F('#c8a050', vx + 1, vy + vh - 2, vw - 2, 1);
    'PALACE'.split('').forEach((ch, i) => palWord(ch, vx + vw / 2, vy + 5 + i * 12, '#f8efd8', 2));
    for (let j = 3; j < vh - 2; j += 5) { F(((j / 5 | 0) % 2) === (frame >> 4) % 2 ? '#fff2a8' : '#c8a050', vx - 1, vy + j, 1, 2); F(((j / 5 | 0) % 2) !== (frame >> 4) % 2 ? '#fff2a8' : '#c8a050', vx + vw, vy + j, 1, 2); }
    if (SKY.d > 0.15) { const t = ctx.getTransform(); PAL_GLOW.push([t.a * (mx - 4) + t.e, t.d * (my - 4) + t.f, t.a * (mw + 8), t.d * (mh + 8)], [t.a * (vx - 3) + t.e, t.d * (vy - 3) + t.f, t.a * (vw + 6), t.d * (vh + 6)]); }
  }; }
{ const _dn = drawNight; drawNight = function () {
    _dn();
    if (SKY.d > 0.15 && PAL_GLOW.length) {   // the marquee and the sign light the night
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, (SKY.d - 0.15) / 0.4);
      for (const [x, y, w, h] of PAL_GLOW) { ctx.fillStyle = 'rgba(255,214,140,.22)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255,190,110,.10)'; ctx.fillRect(x - 6, y - 6, w + 12, h + 12); }
      ctx.restore(); }
    PAL_GLOW.length = 0; }; }
// the front card (step up to the theater on Fifth): the brick front, the marquee, the sign, the doors and poster cases
{ const _fc = drawFrontCard; drawFrontCard = function (b) {
    if (b !== PALACE) return _fc(b);
    const bx = 10, by = 10, bw = SW - 20, bh = 150; win(bx, by, bw, bh);
    ctx.save(); ctx.beginPath(); ctx.rect(bx + 4, by + 4, bw - 8, bh - 8); ctx.clip();
    const night = SKY.d > 0.5, g = ctx.createLinearGradient(0, by, 0, by + bh); g.addColorStop(0, night ? '#141a36' : '#6a9ad8'); g.addColorStop(1, night ? '#2a2a4a' : '#c8dcf0'); ctx.fillStyle = g; ctx.fillRect(bx + 4, by + 4, bw - 8, bh - 8);
    const ground = by + bh - 18, W = 17 * 7, x0 = Math.round(SW / 2 - W / 2), h = 96;
    F('#8e8a82', bx + 4, ground, bw - 8, 3); F('#bab4a8', bx + 4, ground + 3, bw - 8, 15);
    ctx.fillStyle = pat('brick', '#9a4a36'); ctx.fillRect(x0, ground - h, W, h); F('#7a3a2a', x0, ground - h, W, 4); F('#c8b48a', x0, ground - h + 4, W, 2);
    for (const wx of [x0 + 10, x0 + W - 30]) { F('#e8e4dc', wx - 2, ground - h + 14, 24, 22); F('#2a3a52', wx, ground - h + 16, 20, 18); F('#6c8cb0', wx, ground - h + 16, 20, 2); }
    // the doors under the marquee, with a poster case on each side
    F('#3a2a22', x0 + W / 2 - 22, ground - 30, 44, 30); for (let i = 0; i < 3; i++) { F('#9ab8d0', x0 + W / 2 - 20 + i * 14, ground - 28, 12, 26); F('#c8a050', x0 + W / 2 - 12 + i * 14, ground - 16, 2, 3); }
    for (const [px, k] of [[x0 + 8, 'trip'], [x0 + W - 26, 'gtr']]) { F('#c8a050', px - 1, ground - 33, 20, 28); PX = 0; PY = 0; palPoster(k, px + 1, ground - 31, 16, 24); }
    // the marquee and the sign, with the two titles
    const mx = x0 - 6, my = ground - 52, mw = W + 12, mh = 18, on = (frame >> 3) % 3;
    F('#1c1618', mx - 2, my - 2, mw + 4, mh + 4); F('#8e1620', mx, my, mw, mh); F('#f2efe4', mx + 3, my + 3, mw - 6, mh - 6);
    for (let i = 0; i < mw; i += 4) { F(((i >> 2) % 3) === on ? '#fff2a8' : '#c8a050', mx + i, my, 2, 2); F(((i >> 2) % 3) === (on + 1) % 3 ? '#fff2a8' : '#c8a050', mx + i, my + mh - 2, 2, 2); }
    palWord('A TRIP TO THE MOON', SW / 2, my + 3, '#1c1618', 1); palWord('THE GREAT TRAIN ROBBERY', SW / 2, my + 10, '#8e1620', 1);
    const vx = x0 + W - 34, vy = ground - h - 26, vw = 18, vh = 74;
    F('#1c1618', vx - 2, vy - 2, vw + 4, vh + 4); F('#a01c24', vx, vy, vw, vh); 'PALACE'.split('').forEach((ch, i) => palWord(ch, vx + vw / 2, vy + 4 + i * 12, '#f8efd8', 2));
    for (let j = 2; j < vh; j += 6) { F('#fff2a8', vx - 1, vy + j, 1, 2); F('#fff2a8', vx + vw, vy + j, 1, 2); }
    ctx.restore();
    txt('McKENZIE PALACE THEATRE', SW / 2, by + 8, '#f0e0b0', 'center', SMALL);
  }; }
