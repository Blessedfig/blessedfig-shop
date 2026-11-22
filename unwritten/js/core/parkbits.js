"use strict";
// ---------- Park and lake details (Nov 13): OpenStreetMap's flagpoles, the M60A3 tank on display, the historic-locomotive
// spot, open shelters without a building outline, and the radio and phone towers at their lidar heights; the walkway
// out to Remington Lake from the 2025 aerial (js/data/parkbits.js, scripts/town/parkbits.py). OSM maps no benches or
// picnic tables in Antigo, so none are drawn. ----------
const PB = typeof PARKBITS !== 'undefined' ? PARKBITS : { flag: [], show: [], shelter: [], tower: [], dock: [] };
for (const [x, y] of PB.flag) PROPS.push({ x, y, k: 'flagpole', reach: 4 });
for (const [x, y, kind, name] of PB.show) if (kind === 'tank') PROPS.push({ x, y, k: 'tank', name, reach: 2 });
for (const [x, y, h, name] of PB.tower) PROPS.push({ x, y, k: 'radio', h, name, reach: Math.ceil(h / 4) + 2 });
for (const P of PB.shelter) { const ys = P.map(p => p[1]), xs = P.map(p => p[0]); PROPS.push({ x: (Math.min(...xs) + Math.max(...xs)) / 2, y: Math.max(...ys), k: 'pshelter', P, reach: 3 }); }
PROPS.sort((a, b) => a.y - b.y);
{ const _dp = drawProp;
  drawProp = function (p) {
    const x = Math.round(p.x * T), y = Math.round(p.y * T), m = v => Math.round(v * PM);
    if (p.k === 'flagpole') {   // a 9 m pole and the flag
      F('rgba(0,0,0,.2)', x - 1, y - 1, 6, 3); F('#9a9ca2', x - 1, y - m(9), 2, m(9)); F('#e8e8ec', x - 1, y - m(9), 1, m(9)); F('#d8b040', x - 2, y - m(9) - 3, 4, 3);
      const fx = x + 1, fy = y - m(9) + 1;
      for (let i = 0; i < 20; i++) { const wv = Math.round(Math.sin(frame / 9 + i * 0.5) * (i / 20) * 1.6);
        for (let r = 0; r < 13; r++) { const blue = i < 8 && r < 7; F(blue ? ((r + i) % 3 === 0 && r % 2 === 0 ? '#ffffff' : '#3c3b6e') : r % 2 ? '#f4f4f4' : '#b22234', fx + i, fy + r + wv, 1, 1); } }
      return;
    }
    if (p.k === 'tank') {   // hull north-south, the gun toward the road
      const w = m(3.6), L = m(6.9), h = m(2.2), x0 = x - (w >> 1), top = y - h - L;
      F('rgba(0,0,0,.25)', x0 + 4, y - L + 2, w, L);
      F('#24261e', x0 - 1, top - 1, w + 2, L + h + 2); F('#2e3026', x0, top, 5, L + h); F('#2e3026', x0 + w - 5, top, 5, L + h);   // tracks
      F('#5a6040', x0 + 5, top, w - 10, L); F('#4a5034', x0 + 5, top + L, w - 10, h);                                              // deck, front plate
      ctx.fillStyle = '#24261e'; ctx.beginPath(); ctx.ellipse(x, top + L * 0.42, w * 0.36, w * 0.3, 0, 0, 6.29); ctx.fill();
      ctx.fillStyle = '#6a7048'; ctx.beginPath(); ctx.ellipse(x, top + L * 0.42 - 1, w * 0.32, w * 0.26, 0, 0, 6.29); ctx.fill();
      F('#24261e', x - 2, top + L * 0.42, 4, m(4.6)); F('#4a5034', x - 1, top + L * 0.42, 2, m(4.6) - 1);                       // the gun
      return;
    }
    if (p.k === 'radio') {   // a lattice tower at its measured height, red lights on top
      const H = m(p.h), b = m(1.6);
      F('rgba(0,0,0,.2)', x - b, y - 1, b * 2 + 4, 3);
      ctx.strokeStyle = '#7a7e86'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - b, y); ctx.lineTo(x - 1, y - H); ctx.moveTo(x + b, y); ctx.lineTo(x + 1, y - H);
      for (let k = 0, s = 10; k * s < H; k++) { const t0 = k * s / H, t1 = Math.min(1, (k + 1) * s / H), w0 = b - (b - 1) * t0, w1 = b - (b - 1) * t1;
        ctx.moveTo(x - w0, y - k * s); ctx.lineTo(x + w1, y - (k + 1) * s); ctx.moveTo(x + w0, y - k * s); ctx.lineTo(x - w1, y - (k + 1) * s); }
      ctx.stroke();
      const on = typeof SKY === 'undefined' || SKY.d < 0.2 || (frame >> 5) % 2;
      F('#3a0a08', x - 2, y - H - 2, 4, 3); if (on) F('#ff3020', x - 1, y - H - 2, 2, 2);
      if (on) F('#ff3020', x - 1, y - (H >> 1), 2, 2);
      return;
    }
    if (p.k === 'pshelter') {   // an open shelter: posts and a roof 3 m up
      const P = p.P.map(([a, c]) => [a * T, c * T]), up = m(3);
      for (const [a, c] of P) F('#3a2a1e', Math.round(a) - 1, Math.round(c) - up, 3, up);
      ctx.beginPath(); P.forEach(([a, c], i) => i ? ctx.lineTo(a, c - up) : ctx.moveTo(a, c - up)); ctx.closePath();
      ctx.fillStyle = '#6a3a2a'; ctx.fill(); ctx.strokeStyle = '#2a1a14'; ctx.lineWidth = 2; ctx.stroke();
      return;
    }
    return _dp(p);
  };
}
// the Remington Lake walkway: planks you can walk out on
function drawDocks() {
  for (const [x, y, a, L, W] of PB.dock) {
    const sx = (x / 4 - camX) * T, sy = (y / 4 - camY) * T; if (sx < -L * PM || sx > SW + L * PM || sy < -L * PM || sy > SH + L * PM) continue;
    ctx.save(); ctx.translate(Math.round(sx), Math.round(sy)); ctx.rotate(a);
    const l = L * PM, w = W * PM; ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-l / 2 + 2, -w / 2 + 3, l, w);
    ctx.fillStyle = '#3a2a1e'; ctx.fillRect(-l / 2 - 1, -w / 2 - 1, l + 2, w + 2); ctx.fillStyle = '#9a7a56'; ctx.fillRect(-l / 2, -w / 2, l, w);
    ctx.fillStyle = '#7e6044'; for (let u = -l / 2 + 3; u < l / 2; u += 4) ctx.fillRect(Math.round(u), -w / 2, 1, w);
    ctx.fillStyle = '#2a1e16'; for (let u = -l / 2 + 2; u < l / 2; u += 24) { ctx.fillRect(Math.round(u), -w / 2 - 2, 3, 3); ctx.fillRect(Math.round(u), w / 2 - 1, 3, 3); }
    ctx.restore();
  }
}
{ const _ds = drawStreets; drawStreets = function () { _ds(); drawDocks(); }; }
function onDock(cx, cy) {   // a cell centre (cells) within the walkway
  for (const [x, y, a, L, W] of PB.dock) { const dx = (cx + 0.5) * 4 - x, dy = (cy + 0.5) * 4 - y, u = dx * Math.cos(a) + dy * Math.sin(a), v = -dx * Math.sin(a) + dy * Math.cos(a);
    if (Math.abs(u) <= L / 2 + 1 && Math.abs(v) <= W / 2 + 1.6) return true; }
  return false;
}
{ const _sm = solidM; solidM = function (mx, my) { return onDock(Math.floor(mx / CPD), Math.floor(my / CPD)) ? false : _sm(mx, my); }; }
{ const _look = lookAt;
  lookAt = function (x, y) {
    _look(x, y); if (DLG || mode !== 'walk') return;
    const cx = (x + 0.5) / CPD, cy = (y + 0.5) / CPD;
    for (const [sx, sy, kind, name] of PB.show) if (Math.hypot(sx - cx, sy - cy) < 2.5)
      return say([['', kind === 'tank' ? 'An ' + (name || 'old') + ' tank, on display.' : 'OpenStreetMap marks a historic locomotive on display here.']]);
    for (const [tx, ty, h, name] of PB.tower) if (Math.hypot(tx - cx, ty - cy) < 2.5)
      return say([['', (name ? name.replace(/ \(Antigo\)/, '') + '\'s tower' : 'A communication tower') + ', about ' + Math.round(h * 3.28084 / 5) * 5 + ' feet tall by the county\'s 2017 laser survey.']]);
    if (onDock(Math.floor(cx), Math.floor(cy))) return say([['', 'A walkway out to the water on Remington Lake.']]);
    for (const P of PB.shelter) { const xs = P.map(p => p[0]), ys = P.map(p => p[1]); if (cx > Math.min(...xs) - 1 && cx < Math.max(...xs) + 1 && cy > Math.min(...ys) - 1 && cy < Math.max(...ys) + 1) return say([['', 'A shelter.']]); }
  };
}
