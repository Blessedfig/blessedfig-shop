"use strict";
// ---------- Cemeteries (Nov 13, Christian: 'Cemeteries can be added ... they are historical'): OpenStreetMap outlines with
// rows of small headstones drawn in, the name and sourced history when you look; no grave is ever named.
// Parking stalls: the painted lines the 2025 aerial shows, inside lots traced from the same photo (scripts/town/parking.py). ----------
const CEMS = (typeof CEMETERIES !== 'undefined' ? CEMETERIES : []).map(([name, note, Q]) => { const P = []; for (let i = 0; i < Q.length; i += 2) P.push([Q[i] / 4, Q[i + 1] / 4]);
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]); return { name, note, P, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; });
const MEMS = (typeof MEMORIALS !== 'undefined' ? MEMORIALS : []).map(([x, y, kind, lines]) => ({ x, y, kind, lines, k: 'memorial', reach: 3 }));
PROPS.push(...MEMS); PROPS.sort((a, b) => a.y - b.y);
{ const _dp2 = drawProp;   // the two memorials, drawn at their recorded spots (HMDB coordinates)
  drawProp = function (p) {
    if (p.k !== 'memorial') return _dp2(p);
    const x = Math.round(p.x * T), y = Math.round(p.y * T), m = v => Math.round(v * PM), o = '#2e2e34';
    F('rgba(0,0,0,.25)', x - m(1.6), y - 2, m(3.6), 5);
    if (p.kind === 'gar') {   // a granite pedestal with carved names, a Union soldier standing at rest on top
      F(o, x - m(1.4) - 1, y - m(0.6) - 1, m(2.8) + 2, m(0.6) + 1); F('#9aa0a6', x - m(1.4), y - m(0.6), m(2.8), m(0.6));
      F(o, x - m(0.9) - 1, y - m(3.2) - 1, m(1.8) + 2, m(2.6) + 1); F('#b4b8bc', x - m(0.9), y - m(3.2), m(1.8), m(2.6)); F('rgba(255,255,255,.3)', x - m(0.9), y - m(3.2), 2, m(2.6));
      for (let i = 0; i < 5; i++) F('rgba(60,60,70,.35)', x - m(0.6), y - m(2.9) + i * m(0.42), m(1.2), 1);
      F(o, x - m(1.1) - 1, y - m(3.5) - 1, m(2.2) + 2, m(0.4) + 2); F('#a8acb0', x - m(1.1), y - m(3.5), m(2.2), m(0.4));
      const s = '#8e9296', top = y - m(3.5);
      F(o, x - m(0.35) - 1, top - m(1.7) - 1, m(0.7) + 2, m(1.7) + 1); F(s, x - m(0.35), top - m(1.7), m(0.7), m(1.7));
      F(o, x - m(0.22) - 1, top - m(2.2) - 1, m(0.44) + 2, m(0.5) + 1); F(s, x - m(0.22), top - m(2.2), m(0.44), m(0.5));
      F(o, x - m(0.3) - 1, top - m(2.35) - 1, m(0.6) + 2, m(0.18) + 1); F(s, x - m(0.3), top - m(2.35), m(0.6), m(0.18));
      F(o, x + m(0.42), top - m(2.0), 2, m(1.9));
    } else {   // a wide dark granite stone with three flags behind it
      for (const dx of [-1.2, 0, 1.2]) { const fx = x + m(dx); F('#3a3a40', fx, y - m(2.8), 1, m(1.5)); F('#f2f1ea', fx + 1, y - m(2.8), m(0.6), m(0.4));
        F('#b8323a', fx + 1, y - m(2.8), m(0.6), 1); F('#b8323a', fx + 1, y - m(2.6), m(0.6), 1); F('#2a3a7a', fx + 1, y - m(2.8), m(0.25), m(0.22)); }
      F(o, x - m(1.6) - 1, y - m(1.4) - 1, m(3.2) + 2, m(1.4) + 1); F('#4a4e56', x - m(1.6), y - m(1.4), m(3.2), m(1.4)); F('rgba(255,255,255,.25)', x - m(1.6), y - m(1.4), m(3.2), 2);
      for (let i = 0; i < 4; i++) F('rgba(220,220,230,.35)', x - m(1.1), y - m(1.1) + i * m(0.25), m(2.2), 1);
    }
  };
}
function cemAt(x, y) { return CEMS.find(c => x >= c.x0 && x <= c.x1 && y >= c.y0 && y <= c.y1 && inPoly(c.P, x, y)) || null; }
const NOSTONE = new Set([3, 4, 5, 6, 7, 8, 12, 14]);   // water, streets, paths, lots, rail, buildings, pavement
const STONE_COL = ['#b8bcc0', '#9aa0a6', '#c4b8b0', '#8c9096'];
function drawCemeteries() {
  const vx0 = camX * 4 - 2, vx1 = (camX + SW / T) * 4 + 2, vy0 = camY * 4 - 2, vy1 = (camY + SH / T) * 4 + 4;
  for (const c of CEMS) {
    if (!onScreen(c, 2)) continue;
    const mx0 = Math.max(c.x0 * 4, vx0), mx1 = Math.min(c.x1 * 4, vx1), my0 = Math.max(c.y0 * 4, vy0), my1 = Math.min(c.y1 * 4, vy1);
    for (let j = Math.ceil(my0 / 3.2); j * 3.2 <= my1; j++) for (let i = Math.ceil(mx0 / 1.6); i * 1.6 <= mx1; i++) {
      const h = hash(i * 7 + 3, j * 13 + 1); if (h % 10 < 3) continue;                         // gaps in the rows
      const mx = i * 1.6, my = j * 3.2, cx = mx / 4, cy = my / 4;
      if (NOSTONE.has(tAt(Math.floor(cx), Math.floor(cy)))) continue;
      if (MEMS.some(q => Math.hypot(q.x - cx, q.y - cy) < (q.kind === 'gar' ? 1.6 : 0.9))) continue;   // the Soldiers' Circle, the memorial's plaza
      if (!inPoly(c.P, cx, cy) || !inPoly(c.P, cx - 0.4, cy) || !inPoly(c.P, cx + 0.4, cy) || !inPoly(c.P, cx, cy - 0.4) || !inPoly(c.P, cx, cy + 0.4)) continue;
      const x = Math.round((cx - camX) * T), y = Math.round((cy - camY) * T), tall = (h >> 6) % 3 === 0 ? 2 : 0;
      F('rgba(0,0,0,.22)', x + 1, y - 1, 6, 2);
      F('#34343a', x - 3, y - 7 - tall, 6, 7 + tall); F(STONE_COL[(h >> 4) & 3], x - 2, y - 6 - tall, 4, 6 + tall);
      F('rgba(255,255,255,.35)', x - 2, y - 6 - tall, 1, 5 + tall); F('#34343a', x - 3, y - 7 - tall, 1, 1); F('#34343a', x + 2, y - 7 - tall, 1, 1);
    }
  }
}
const STL = (typeof STALLS !== 'undefined' ? STALLS : []).map(([a, b, c, d]) => ({ x1: a / 40, y1: b / 40, x2: c / 40, y2: d / 40 }));
const STL_ROWS = []; for (const s of STL) { const r = Math.floor(Math.min(s.y1, s.y2)); (STL_ROWS[r] || (STL_ROWS[r] = [])).push(s); }
function drawStalls() {
  if (!STL.length) return;
  ctx.strokeStyle = 'rgba(238,238,228,.85)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let r = Math.floor(camY) - 2; r < camY + SH / T + 2; r++) { const L = STL_ROWS[r]; if (!L) continue;
    for (const s of L) { if (Math.max(s.x1, s.x2) < camX - 1 || Math.min(s.x1, s.x2) > camX + SW / T + 1) continue;
      ctx.moveTo(Math.round((s.x1 - camX) * T) + 0.5, Math.round((s.y1 - camY) * T) + 0.5); ctx.lineTo(Math.round((s.x2 - camX) * T) + 0.5, Math.round((s.y2 - camY) * T) + 0.5); } }
  ctx.stroke();
}
{ const _ds = drawStreets; drawStreets = function () { _ds(); drawStalls(); drawCemeteries(); }; }
{ const _look = lookAt;
  lookAt = function (x, y) {
    _look(x, y); if (DLG || mode !== 'walk') return;
    const cx = (x + 0.5) / CPD, cy = (y + 0.5) / CPD;
    const mem = MEMS.find(q => Math.hypot(q.x - cx, q.y - (cy + 0.3)) < 1.3);
    if (mem) return say(mem.lines.map(t => ['', t]));
    const c = cemAt(cx, cy); if (!c) return;
    say([['', (c.name || 'A cemetery') + '. Rows of headstones, and the quiet of the place.']].concat(c.note ? [['', c.note + '.']] : []));
    const H = typeof CEM_HISTORIC !== 'undefined' && CEM_HISTORIC[c.name];
    if (H) { DLG.opts = [{ t: 'Move on' }, { t: 'Historic graves here', f: () => say(H.map(([h, t]) => ['', h + '\n' + t])) }]; DLG.sel = 0; }
  };
}
