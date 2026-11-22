"use strict";
// =====================================================================
//  NEIGHBORS OUTSIDE (Nov 10). Jeremy asked Christian, in public, whether his house was in the game "to walk by and talk",
//  so he stands out front of his own house on Clermont Street and chats about the weather. His two girls play in the yard.
//  First name only for him; the girls are not named. The street address is never shown on screen.
//  Danny (first name only, consented) stands outside UMA Martial Arts on Fifth Avenue.
//  Sprites: Christian's family sheet, cut by scripts/kid/cut_family.py (crop + edge background cleared, no resampling).
// =====================================================================
const NPC_RECTS = {"dad": {"down": [[0, 0, 107, 153], [109, 16, 86, 137], [0, 0, 107, 153], [197, 17, 86, 136]], "up": [[285, 0, 107, 153], [394, 17, 86, 136], [285, 0, 107, 153], [482, 18, 87, 135]], "left": [[571, 0, 74, 153], [647, 22, 71, 131], [571, 0, 74, 153], [720, 22, 72, 131]], "right": [[794, 1, 75, 152], [871, 22, 70, 131], [794, 1, 75, 152], [943, 20, 71, 133]]}, "big": {"down": [[0, 0, 80, 129], [82, 3, 76, 126], [0, 0, 80, 129], [160, 4, 78, 125]], "up": [[240, 1, 76, 128], [318, 4, 71, 125], [240, 1, 76, 128], [391, 4, 73, 125]], "left": [[466, 1, 71, 128], [539, 8, 70, 121], [466, 1, 71, 128], [611, 8, 68, 121]], "right": [[681, 0, 73, 129], [756, 6, 69, 123], [681, 0, 73, 129], [827, 6, 69, 123]]}, "small": {"down": [[0, 0, 66, 122], [68, 3, 65, 119], [0, 0, 66, 122], [135, 3, 65, 119]], "up": [[202, 0, 65, 122], [269, 3, 60, 119], [202, 0, 65, 122], [331, 3, 61, 119]], "left": [[394, 0, 69, 122], [465, 4, 68, 118], [394, 0, 69, 122], [535, 5, 69, 117]], "right": [[606, 1, 69, 121], [677, 4, 69, 118], [606, 1, 69, 121], [748, 4, 68, 118]]}};
const NPC_IMG = {}; for (const k of ['dad', 'big', 'small']) { NPC_IMG[k] = new Image(); NPC_IMG[k].src = 'assets/npc/' + k + '.png'; }
const NPC_K = 153 / 44;   // source px per game px: the father stands about 44 px, a little taller than the kid; the girls keep their size on the sheet
const NPCS = [];
// UMA Martial Arts: the OSM gym footprint (way 1177704288, about 10 m x 29 m, front on Fifth) lands on the county's 832 5th Ave
// storefront. The county data has no business name for it, so it gets its sign here.
const UMA = BLD.find(b => b.addr === '832 5TH AVE');
if (UMA && !UMA.name) UMA.name = 'Unified Martial Arts';
// the gym's own sign (the logo file Christian sent, used as given), hung on the front wall above the storefront
const UMA_SIGN = new Image(); UMA_SIGN.src = 'assets/signs/uma.jpg';
{ const _db = drawBuilding; drawBuilding = function (b) { _db(b); if (b === UMA) drawUmaSign(b); }; }
function drawUmaSign(b) {
  if (!UMA_SIGN.complete || !UMA_SIGN.naturalWidth) return;
  const h = bstyle(b).h, cx = Math.round((b.pxMin + b.pxMax) / 2 * T), front = Math.round(b.pyMax * T), s = Math.min(Math.round(h * 0.5), Math.round((b.pxMax - b.pxMin) * T * 0.45));
  const x = cx - s / 2, y = Math.round(front - h + (h * 0.48 - s) / 2) + 2;
  F('#1c1618', x - 2, y - 2, s + 4, s + 4); F('#8a8c92', x - 1, y - 1, s + 2, s + 2);   // a thin frame, like a mounted panel
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(UMA_SIGN, x, y, s, s); ctx.imageSmoothingEnabled = false;
}
function npcSetup() {
  if (NPCS.length) return;
  const h = BLD.find(b => b.addr === '202 CLERMONT ST' && b.type === 'house');
  if (!h || !h.door) return;
  const [dx, dy] = outsideDoorM(h), f = FDIR[h.face] || [1, 0], side = [-f[1], f[0]];
  const spot = (a, b) => { const x = dx + f[0] * a + side[0] * b, y = dy + f[1] * a + side[1] * b; return solidM(x, y) ? freeNearM(x, y) : [x, y]; };
  const [jx, jy] = spot(0, 1), [ax, ay] = spot(1, -1), [bx, by] = spot(2, -2);
  NPCS.push({ id: 'jeremy', g: 'dad', x: jx, y: jy, dir: h.face === 'E' ? 'left' : 'down', hx: jx, hy: jy, r: 0, t: 0, mx: 0, my: 0, wait: 0 });
  NPCS.push({ id: 'girl1', g: 'big', x: ax, y: ay, dir: 'down', hx: ax, hy: ay, r: 2, t: 0, mx: 0, my: 0, wait: 40 });
  NPCS.push({ id: 'girl2', g: 'small', x: bx, y: by, dir: 'down', hx: bx, hy: by, r: 2, t: 0, mx: 0, my: 0, wait: 70 });
  // (Danny was on the sidewalk out front until the gym's inside opened; he is at the front desk now: inside.js)
  NPCS.forEach(n => { n.face0 = n.dir; });
}
function npcHere(n) { return !(n.id === 'danny' && G && G.kid && G.kid.g === 'danny'); }
function npcAt(x, y) { return NPCS.find(n => npcHere(n) && n.x === x && n.y === y) || null; }
function npcUpdate() {
  npcSetup();
  for (const n of NPCS) {
    if (n.t > 0) { n.t -= 1 / 12; if (n.t <= 0) { n.t = 0; n.mx = n.my = 0; } continue; }
    if (n.talking) continue;
    if (!n.r) { if (n.wait-- <= 0) { n.dir = n.face0; n.wait = 9999; } continue; }
    if (n.wait-- > 0) continue;
    n.wait = 20 + (hash(frame, n.x * 7 + n.y) % 60);   // the girls play: a few quick steps, a pause, a turn
    const ds = ['up', 'down', 'left', 'right'], d = ds[hash(frame + n.x, n.y * 3) % 4], [ax, ay] = DIRS[d], nx = n.x + ax, ny = n.y + ay;
    n.dir = d;
    if (Math.abs(nx - n.hx) > n.r || Math.abs(ny - n.hy) > n.r || solidM(nx, ny) || npcAt(nx, ny) || (nx === G.x && ny === G.y)) continue;
    n.x = nx; n.y = ny; n.mx = -ax; n.my = -ay; n.t = 1;
  }
}
function npcProps() {   // drawn in depth order with the trees and lamps (buildings.js visibleProps)
  return NPCS.filter(npcHere).map(n => ({ k: 'npc', n, x: (n.x + n.mx * n.t + 0.5) / CPD, y: (n.y + n.my * n.t + 1) / CPD }));
}
function drawNpc(p) {
  if (KID_META[p.n.g] && p.n.g !== 'dad') {   // a party member standing in town: his own field frames
    const n = p.n, x = Math.round(p.x * T), y = Math.round(p.y * T) - 1;
    F('rgba(0,0,0,.25)', x - 7, y - 3, 14, 4); kidFrame(n.g, n.dir, n.t > 0 ? (frame >> 3) % 4 : 0, x, y); return;
  }
  const n = p.n, im = NPC_IMG[n.g], R = NPC_RECTS[n.g][n.dir], f = n.t > 0 ? 1 + ((frame >> 3) % 2) * 2 : (n.r ? 0 : 0);
  const r = R[Math.min(f, R.length - 1)], x = Math.round(p.x * T), y = Math.round(p.y * T) - 1, w = r[2] / NPC_K, h = r[3] / NPC_K;
  F('rgba(0,0,0,.25)', x - 7, y - 3, 14, 4);
  if (!im.complete || !im.naturalWidth) return;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(im, r[0], r[1], r[2], r[3], Math.round(x - w / 2), Math.round(y - h), w, h); ctx.imageSmoothingEnabled = false;
}
// Danny, with his portrait in the box
function dannyTalk(back) {
  const hi = G.kid.g === 'christian' ? 'Christian! Good to see you.' : G.kid.g === 'robin' ? 'Hey, Robin! Go Robins!' : 'Hey there!';
  return askFace('danny', 'Danny: ' + hi + ' Welcome to UMA. Mats up here, weights downstairs. Beginners are always welcome.', [
    { t: 'ANY TIPS?', f: () => sayFace('danny', [['Danny', 'Show up. Warm up. Learn to fall before you learn to throw.'], ['Danny', 'Getting good is mostly just coming back.']], back) },
    { t: 'SEE YOU AROUND', f: () => sayFace('danny', [['Danny', 'Door\'s open. Come train sometime.']], back) }]);
}
// Jeremy on the weather: what the season is usually like up here, by the player's own calendar and clock
function jeremyWeather() {
  const d = new Date(), m = d.getMonth(), hr = d.getHours();
  const hi = hr < 12 ? 'Morning!' : hr < 17 ? 'Afternoon!' : 'Evening!';
  const by = [
    ["Cold enough to freeze the hair in your nose, huh?", "Driveway's shoveled though. Small victories."],
    ["Middle of winter up here. The snowbanks just keep getting taller.", "Bundle up if you're walking far."],
    ["Feels like it wants to thaw. Then it snows again. Classic March.", "Watch the ice on the sidewalks in the morning."],
    ["Mud season! Everything's brown and wet, but the robins are back.", "Couple more weeks and the grass wakes up."],
    ["Finally green out here. Smell that?", "Somebody's mowing already. Mosquitoes won't be far behind."],
    ["Long days now. Light out till almost ten.", "Perfect weather to sit on the porch and do nothing."],
    ["Hot one! The girls have been in and out of the sprinkler all day.", "Storm might roll through later. They come in fast up here."],
    ["Still warm, but the evenings are getting cooler.", "Summer goes quick in the Northwoods."],
    ["You can feel fall coming. Cool mornings, warm afternoons.", "Leaves'll start turning any day now."],
    ["Leaves everywhere! I just raked and look at it.", "Prettiest time of year around here, though."],
    ["Gray and cold today. Feels like snow's coming.", "Deer season's close. Half the town's in blaze orange."],
    ["First real snow makes everything quiet, doesn't it?", "Downtown looks nice with the lights up."]][m];
  return [hi + ' ' + by[0], by[1]];
}
function npcTalk(n) {
  n.talking = true; const back = () => { n.talking = false; n.wait = 90; };
  // turn to face the kid
  const dx = G.x - n.x, dy = G.y - n.y; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  if (n.id === 'danny') return dannyTalk(back);
  if (n.id === 'jeremy') {
    const w = jeremyWeather(), who = G.kid.g === 'christian' ? "Hey, Christian!" : G.kid.g === 'danny' ? 'Hey, Danny!' : G.kid.g === 'robin' ? 'Hey, Robin! Go Robins!' : 'Hey there, kiddo!';
    return say([['Jeremy', who + ' ' + w[0]], ['Jeremy', w[1]], ['Jeremy', G.kid.g === 'christian' ? 'Tell everybody at the store I said hi.' : "Say hi to Christian down at the bookstore for me."]], back);
  }
  return say([['', n.id === 'girl1' ? 'She is in the middle of a game of tag and waves you off. "Not now, I\'m it!"' : 'She giggles and runs off to hide behind her big sister.']], back);
}
// hook into the depth-sorted props
{ const _vp = visibleProps; visibleProps = function () { const v = _vp(); npcSetup(); return v.concat(npcProps().filter(p => p.x > camX - 1 && p.x < camX + SW / T + 1 && p.y > camY - 0.5 && p.y < camY + SH / T + 2)).sort((a, b) => a.y - b.y); }; }
{ const _dp = drawProp; drawProp = function (p) { if (p.k === 'npc') return drawNpc(p); return _dp(p); }; }
