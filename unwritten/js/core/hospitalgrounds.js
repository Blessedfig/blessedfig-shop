"use strict";
// ============================================================================
// Aspirus Langlade Hospital grounds (Christian, Nov 18: "there is a wooden gazebo and some kind of power/dumpster area next to
// the parking lot"). From the May 2025 photo: the walled service enclosure at the west parking lot (transformers and a
// dumpster), and a wooden gazebo by the west garden. The paving around the hospital is now drawn as the photo shows it
// (lawn or asphalt drive, js/data/lotfix.js), and the "lot" that sat on the east wing's roof is gone.
// ============================================================================
(function () {
  PROPS.push({ k: 'hs_encl', x: 4141 / 4, y: 3662 / 4, reach: 2 });   // on the walled pad the May 2025 photo shows (Nov 19 check)
  PROPS.push({ k: 'hs_gazebo', x: 4246 / 4, y: 3562 / 4, reach: 2 });   // the small brown roof beside the loop walk (likely; Christian to confirm)
  // walks the photo doesn't show: the west leg of 1313 along the service drive, and 1317 / 1318
  { const o = VEC[1313]; if (o && o.cl === 'path') { let bi = 0, bd = 1e9; o.P.forEach(([x, y], i) => { const d = Math.hypot(x - 4179 / 4, y - 3598 / 4); if (d < bd) { bd = d; bi = i; } });
      if (bd < 3 && bi >= 1) { o.P = o.P.slice(0, bi + 1); o.x0 = Math.min(...o.P.map(p => p[0])); o.x1 = Math.max(...o.P.map(p => p[0])); o.y0 = Math.min(...o.P.map(p => p[1])); o.y1 = Math.max(...o.P.map(p => p[1])); } }
    for (const vi of [1317, 1318]) if (VEC[vi] && VEC[vi].cl === 'path') VEC[vi].cl = 'boardwalk_hidden'; }
  PROPS.sort((a, b) => a.y - b.y);
  const _dp = drawProp;
  drawProp = function (p) {
    const X = Math.round(p.x * T), Y = Math.round(p.y * T), m = v => Math.round(v * PM);
    if (p.k === 'hs_encl') {   // a 7 x 4.5 m walled pad: two transformers and a dumpster behind a wall with an open gate
      const w = m(7), d = m(4.5), h = m(2.2), x0 = X - w / 2, top = Y - d;
      F('rgba(0,0,0,.22)', x0 + 4, Y - 2, w, 5); F('#b8b4ac', x0, top, w, d);
      F('#3a6a4a', x0 + m(0.8), top + m(0.6) - m(1.4), m(1.6), m(1.4) + m(1.1)); F('#4a7a5a', x0 + m(0.8), top + m(0.6) - m(1.4), m(1.6), 3);
      F('#3a6a4a', x0 + m(3.0), top + m(0.6) - m(1.4), m(1.6), m(1.4) + m(1.1)); F('#4a7a5a', x0 + m(3.0), top + m(0.6) - m(1.4), m(1.6), 3);
      F('#2a4a7a', x0 + m(5.0), top + m(1.0) - m(1.2), m(1.8), m(1.2) + m(1.0)); F('#1c3a62', x0 + m(5.0), top + m(1.0) - m(1.2) - 2, m(1.8), 3);
      for (const [a, b] of [[0, 0], [0, 1], [1, 0]]) { }
      F('#d8d4cc', x0 - 2, top - h, 3, d + h); F('#d8d4cc', x0 + w - 1, top - h, 3, d + h); F('#e4e0d8', x0 - 2, top - h, w + 3, 3);   // walls, back and sides
      F('#cfcbc3', x0 - 2, Y - h, m(2.5), h); F('#cfcbc3', x0 + w - m(2.5), Y - h, m(2.5) + 2, h);   // front wall with the gate gap
      F('#8a8e94', x0 + m(2.5), Y - m(1.8), w - m(5), 2); for (let x = x0 + m(2.5); x < x0 + w - m(2.5); x += 4) F('#8a8e94', x, Y - m(1.8), 1, m(1.8));   // the gate
      return; }
    if (p.k === 'hs_gazebo') {   // an eight-sided wooden gazebo, 4 m across
      const r = m(2.1), wood = '#8a6440';
      ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(X + 4, Y + 2, r + 2, r * 0.45, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#a07a52'; ctx.beginPath(); ctx.ellipse(X, Y - 2, r, r * 0.42, 0, 0, 7); ctx.fill();   // deck
      for (const a of [-2.7, -1.9, -1.2, -0.4, 0.4, 1.2, 1.9, 2.7]) { const px = X + Math.cos(a) * r * 0.92, py = Y - 2 + Math.sin(a) * r * 0.4; F(wood, Math.round(px) - 1, Math.round(py - m(2.4)), 3, m(2.4)); }
      F(shade(wood, -0.2), X - r, Y - m(1.0), r * 2, 2);   // rail
      ctx.fillStyle = '#5a3e28'; ctx.beginPath(); ctx.moveTo(X - r - 4, Y - m(2.4)); ctx.lineTo(X, Y - m(4.2)); ctx.lineTo(X + r + 4, Y - m(2.4)); ctx.lineTo(X, Y - m(1.9)); ctx.fill();
      ctx.fillStyle = '#6e4e34'; ctx.beginPath(); ctx.moveTo(X - r - 4, Y - m(2.4)); ctx.lineTo(X, Y - m(4.2)); ctx.lineTo(X, Y - m(1.9)); ctx.fill();
      F('#3a2a1c', X - 1, Y - m(4.5), 3, m(0.4)); return; }
    return _dp(p);
  };
})();
