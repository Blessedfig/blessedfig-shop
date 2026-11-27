"use strict";
// =====================================================================
//  BIRDS AND ANIMALS FROM SHEETS (Nov 27). Drawn by ChatGPT in the people sheets' style and pixel size, checked by
//  /home/claude/artpipe/sheet.py (16 frames, outline, palette, each animal within 35% of its target size), then fitted so one
//  art pixel is 4 file px. Side view facing right; left is mirrored. Where a sheet is missing the old shapes still draw.
//  birds1.png rows: robin, sparrow, crow, Canada goose; columns: stand, peck, wings up, wings down.
// =====================================================================
const ANIM_K = 1.33 / 4;   // screen px per file px (the kid's art pixel size)
const ANIM = {};
function animLoad(id, rows) { const im = new Image(); im.onload = () => { ANIM[id] = { im, rows, cw: im.width / 4, ch: im.height / 4 }; }; im.src = 'assets/animals/' + id + '.png'; }
animLoad('birds1', ['robin', 'sparrow', 'crow', 'goose']);
function animRow(kind) { for (const id in ANIM) { const r = ANIM[id].rows.indexOf(kind); if (r >= 0) return [ANIM[id], r]; } return null; }
// draws one frame with the feet at (x, y)
function animDraw(S, row, col, x, y, left, alpha) {
  const w = S.cw * ANIM_K, h = S.ch * ANIM_K;
  ctx.save(); if (alpha != null) ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.translate(Math.round(x), Math.round(y)); if (left) ctx.scale(-1, 1);
  ctx.drawImage(S.im, col * S.cw, row * S.ch, S.cw, S.ch, -w / 2, -h + 2 * ANIM_K, w, h);
  ctx.restore();
}
{ const _db = drawBird; drawBird = function (b, sx, sy) {
  const A = animRow(b.K.k); if (!A) return _db(b, sx, sy);
  const [S, row] = A, left = b.face < 0;
  if (b.fly) {
    const flap = ((frame >> 2) + Math.round(b.x)) % 2, y = sy - b.z * PM * 0.5;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(Math.round(sx) - 4, Math.round(sy + b.z * PM * 0.5) + 1, 8, 2);
    return animDraw(S, row, flap ? 2 : 3, sx, y, left);
  }
  const peck = ((frame >> 4) + Math.round(b.x * 3)) % 7 === 0;
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(Math.round(sx), Math.round(sy), b.K.k === 'goose' ? 6 : 3.5, 1.4, 0, 0, 6.29); ctx.fill();
  animDraw(S, row, peck ? 1 : 0, sx, sy, left);
}; }
