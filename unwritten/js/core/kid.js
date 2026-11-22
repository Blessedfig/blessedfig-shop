"use strict";
// =====================================================================
//  THE KID at FF6 field size (about 16x24 art pixels; one 16 px tile ≈ 1 m, so the kid is about 1.5 m tall).
//  The boy is Christian's sheet kept exactly as he drew it (scripts/kid/keep_sheet.py only crops each frame and clears the
//  pink background; his art is 8x, so it is drawn at 1/8 size, at the screen's full pixel density). Right = his left, mirrored.
//  The girl is still the earlier soft sheet, shrunk (scripts/kid/cut_kid.py: 5 frames) until her true-pixel sheet comes.
//  Rows: down, up, left, right. Poses for story and battle are in assets/kid/<kid>_poses.png.
//  The town stays grounded: no fairy out here. Curiosity's sheet waits for the inward places.
// =====================================================================
//  Tiles are 24 px now (PM 6): Christian and the Robin draw at k = 1, their exact pixels; the boy at 3/16 of his 8x art;
//  the girl's placeholder at 1.5x until her true sheet comes.
//  Sizes (Nov 10, "keep the sizes consistent"): the sheets draw different rows at different scales, so each row's k is set from
//  its median opaque area against the character's standing row (Christian walk 2.3, Danny 2.38, Robin 2.58, Christian idle 2.9).
//  For now (Christian, Nov 10) two more choices: Christian himself and the Antigo Red Robin, from their v0.36 sheets,
//  used exactly as they were (the same files, their own walk frames; only drawn smaller to stand at kid height).
const KID_META = { girl: { cw: 20, ch: 26, n: 5, k: 2 / 3 }, boy: { cw: 125, ch: 211, n: 4, k: 16 / 3 },   // k: source pixels per game pixel
  christian: { n: 4, k: 2.3, rects: {"down": [[0, 130, 55, 94], [57, 130, 55, 94], [114, 129, 56, 95], [172, 129, 55, 95]], "up": [[0, 463, 54, 100], [56, 462, 54, 101], [112, 462, 54, 101], [168, 466, 54, 97]], "left": [[0, 243, 52, 94], [54, 243, 49, 94], [105, 243, 50, 94], [157, 243, 49, 94]], "right": [[0, 356, 52, 94], [54, 356, 51, 94], [107, 357, 51, 93], [160, 357, 52, 93]]} },
  robin: { n: 4, k: 2.58, rects: {"down": [[0, 1, 75, 107], [77, 1, 74, 107], [153, 0, 76, 108], [231, 4, 74, 104]], "up": [[0, 110, 74, 108], [76, 112, 72, 106], [150, 112, 72, 106], [224, 111, 73, 107]], "left": [[0, 229, 74, 99], [76, 228, 75, 100], [153, 228, 76, 100], [231, 228, 75, 100]], "right": [[0, 337, 81, 101], [83, 338, 77, 100], [162, 338, 77, 100], [241, 338, 76, 100]]} },
  danny: { n: 4, k: 2.38, rects: {"down": [[0, 0, 51, 88], [53, 1, 53, 87], [108, 2, 48, 86], [158, 1, 51, 87]], "right": [[0, 93, 40, 85], [42, 93, 47, 85], [91, 93, 45, 85], [138, 92, 52, 86]], "up": [[0, 182, 54, 86], [56, 184, 54, 84], [112, 182, 50, 86], [164, 182, 52, 86]], "left": [[0, 274, 55, 84], [57, 274, 49, 84], [108, 273, 53, 85], [163, 274, 47, 84]]} } };
const KID_IMG = { girl: new Image(), boy: new Image(), christian: new Image(), robin: new Image(), danny: new Image() };
KID_IMG.girl.src = 'assets/kid/girl.png'; KID_IMG.boy.src = 'assets/kid/boy.png';
KID_IMG.christian.src = 'assets/christian/field.png';   // Nov 10: cut straight from his original sheet (scripts/kid/cut_from_source.py), no holes, no resampling
KID_IMG.robin.src = 'assets/robin/field.png'; KID_IMG.danny.src = 'assets/danny/field.png';   // both cut from the original sheets (scripts/kid/cut_party_field.py)
// Nov 10, Christian: "When I start a new game, I want to be able to select me, Danny, the Robin, for now" (girl and boy kept for old saves)
const KID_CHOICES = ['christian', 'danny', 'robin'], KID_LABEL = { girl: 'GIRL', boy: 'BOY', christian: 'CHRISTIAN', danny: 'DANNY', robin: 'ROBIN' };
const KID_ROW = { down: 0, up: 1, left: 2, right: 3 };
// draws one frame with its feet at (cx, by): centre x, bottom y
function kidFrame(g, dir, f, cx, by, scale) {
  const im = KID_IMG[g] || KID_IMG.girl, M = KID_META[g] || KID_META.girl, s = scale || 1;
  if (!im.complete || !im.naturalWidth) { R(cx - 5 * s, by - 22 * s, 10 * s, 22 * s, '#c84a3a'); return; }
  let sx, sy, sw, sh;
  if (M.rects) [sx, sy, sw, sh] = M.rects[dir][f % M.n]; else { sx = (f % M.n) * M.cw; sy = KID_ROW[dir] * M.ch; sw = M.cw; sh = M.ch; }
  const w = sw / M.k * s, h = sh / M.k * s;
  if (M.k > 1) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; }   // k = 1: drawn pixel for pixel
  ctx.drawImage(im, sx, sy, sw, sh, Math.round(cx - w / 2), Math.round(by - h), w, h);
  ctx.imageSmoothingEnabled = false;
}
// px, py: the top-left of the tile the kid stands on; feet land on its lower middle
function drawKid(kid, px, py, dir, moving, ts, noShadow) {   // ts: the tile size underfoot (T outside, IT in the store)
  const M = KID_META[kid.g] || KID_META.girl, f = moving ? (frame >> (held.b ? 2 : 3)) % M.n : 0, s = ts || T;
  if (!noShadow) R(px + s / 2 - 7, py + s - 4, 14, 4, 'rgba(0,0,0,.28)');
  kidFrame(kid.g, dir, f, px + s / 2, py + s - 1);
}
