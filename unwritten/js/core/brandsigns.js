"use strict";
// Brand signs (Nov 19, Christian: "do it for all the major retailers and fast food places and gas stations too"). Each sign in
// BRANDSIGNS (filled by js/data/fixes/retail.js, food.js, gas.js) stands where the 2025 photo shows its pole or base. Business names
// appear as signs only. Styles: 'pole' (a panel on one pole), 'pylon' (a tall two-leg sign with a second line), 'monument' (a low
// base sign by the drive).
(function () {
  if (typeof BRANDSIGNS === 'undefined' || !BRANDSIGNS.length) return;
  for (const s of BRANDSIGNS) PROPS.push({ k: 'brandsign', x: s.x / 4, y: s.y / 4, reach: 3, s });
  PROPS.sort((a, b) => a.y - b.y);
  const _dp = drawProp;
  drawProp = function (p) {
    if (p.k !== 'brandsign') return _dp(p);
    const s = p.s, X = Math.round(p.x * T), Y = Math.round(p.y * T), m = v => Math.round(v * PM), style = s.style || 'pole';
    ctx.save(); ctx.font = SMALL; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = String(s.text).split('\n'), tw = Math.max(...lines.map(l => Math.ceil(ctx.measureText(l).width))), w = Math.max(tw + 10, 24), lh = 12, h = lines.length * lh + 4;
    const bg = s.bg || '#c02020', fg = s.fg || '#ffffff', edge = '#1c1618';
    if (style === 'monument') {
      const bh = m(1.0);
      F('rgba(0,0,0,.22)', X - w / 2, Y - 2, w + 6, 5); F('#5a5048', X - w / 2 - 2, Y - bh, w + 4, bh); F('#7a7064', X - w / 2 - 2, Y - bh, w + 4, 2);
      F(edge, X - w / 2 - 1, Y - bh - h - 1, w + 2, h + 2); F(bg, X - w / 2, Y - bh - h, w, h); F('rgba(255,255,255,.18)', X - w / 2, Y - bh - h, w, 2);
      lines.forEach((l, i) => { ctx.fillStyle = fg; ctx.fillText(l, X, Y - bh - h + 2 + lh * i + lh / 2); });
    } else {
      const ph = m(s.h || (style === 'pylon' ? 9 : 6.5)), two = style === 'pylon';
      F('rgba(0,0,0,.22)', X - (two ? w / 3 : 2) - 2, Y - 2, two ? w * 2 / 3 + 8 : 8, 4);
      for (const dx of two ? [-w / 3, w / 3 - 4] : [-2]) { F('#6a6e74', X + dx, Y - ph, 4, ph); F('#4a4e54', X + dx + 3, Y - ph, 1, ph); }
      F(edge, X - w / 2 - 1, Y - ph - h - 1, w + 2, h + 2); F(bg, X - w / 2, Y - ph - h, w, h); F('rgba(255,255,255,.18)', X - w / 2, Y - ph - h, w, 2);
      lines.forEach((l, i) => { ctx.fillStyle = fg; ctx.fillText(l, X, Y - ph - h + 2 + lh * i + lh / 2); });
    }
    ctx.restore();
  };
  const _look = lookAt;
  lookAt = function (x, y) {
    const cx = (x + 0.5) / CPD, cy = (y + 0.5) / CPD, p = PROPS.find(p => p.k === 'brandsign' && Math.hypot(p.x - cx, p.y - cy) < 1.2);
    if (p) return say([['', 'The sign reads ' + p.s.text.replace(/\n/g, ' ') + '.']]);
    return _look(x, y);
  };
})();
