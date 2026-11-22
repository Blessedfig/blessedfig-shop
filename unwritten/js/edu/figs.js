"use strict";
// =====================================================================
//  DRAWINGS FOR THE STUDY WINDOW: small labelled SVGs, the words on the drawing (spatial contiguity). FIG.name(...args).
//  A card asks for one with fig: ['name', arg, ...]. Colours stay few and quiet so the drawing never outshouts the idea.
// =====================================================================
const FIG = (() => {
  const FF = "font-family=\"Atkinson Hyperlegible,Verdana,sans-serif\"";
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" ${FF} font-size="${o.size || 13}" fill="${o.fill || '#1c1c26'}" text-anchor="${o.anchor || 'middle'}"${o.bold ? ' font-weight="700"' : ''}>${String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
  const S = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;
  const INK = '#1a1c4a', HI = '#e8a020', SOFT = '#c8d4f0';
  const arrow = (x1, y1, x2, y2, c = INK) => { const a = Math.atan2(y2 - y1, x2 - x1), h = 7; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2"/><path d="M${x2},${y2} L${x2 - h * Math.cos(a - 0.45)},${y2 - h * Math.sin(a - 0.45)} L${x2 - h * Math.cos(a + 0.45)},${y2 - h * Math.sin(a + 0.45)} Z" fill="${c}"/>`; };
  return {
    numline(a, b, step, marks) {   // marks: values to circle (array) or {value: label}
      const W = 360, x0 = 20, x1 = 340, px = v => x0 + (v - a) / (b - a) * (x1 - x0); let s = `<line x1="${x0}" y1="40" x2="${x1}" y2="40" stroke="${INK}" stroke-width="2"/>`;
      for (let v = a; v <= b + 1e-9; v += step) { const x = px(v); s += `<line x1="${x}" y1="34" x2="${x}" y2="46" stroke="${INK}"/>` + T(x, 62, +v.toFixed(2)); }
      const M = Array.isArray(marks) ? Object.fromEntries(marks.map(v => [v, ''])) : (marks || {});
      for (const k in M) { const x = px(+k); s += `<circle cx="${x}" cy="40" r="6" fill="${HI}"/>` + (M[k] ? T(x, 22, M[k], { bold: 1 }) : ''); }
      return S(W, 72, s);
    },
    blocks(h, t, o) {   // place value: hundreds flats, tens rods, ones cubes
      let s = '', x = 6; const u = 5;
      for (let i = 0; i < h; i++) { s += `<rect x="${x}" y="10" width="${u * 10}" height="${u * 10}" fill="${SOFT}" stroke="${INK}"/>`; for (let k = 1; k < 10; k++) s += `<line x1="${x + k * u}" y1="10" x2="${x + k * u}" y2="${10 + u * 10}" stroke="#9aa8d0" stroke-width=".6"/><line x1="${x}" y1="${10 + k * u}" x2="${x + u * 10}" y2="${10 + k * u}" stroke="#9aa8d0" stroke-width=".6"/>`; x += u * 10 + 6; }
      const hx = x; for (let i = 0; i < t; i++) { s += `<rect x="${x}" y="10" width="${u}" height="${u * 10}" fill="#f6d890" stroke="${INK}"/>`; x += u + 3; }
      const tx = x; x += 4; for (let i = 0; i < o; i++) { s += `<rect x="${x + (i % 3) * (u + 2)}" y="${48 + Math.floor(i / 3) * (u + 2)}" width="${u}" height="${u}" fill="#f0a0a0" stroke="${INK}"/>`; }
      s += T(Math.max(30, hx / 2), 80, h + ' hundreds') + T((hx + tx) / 2 || hx + 20, 80, t + ' tens') + T(x + 14, 80, o + ' ones');
      return S(Math.max(240, x + 40), 90, s);
    },
    fracbars(list) {   // [[n, d, label?], ...]: each a bar cut in d equal parts, n shaded
      let s = ''; list.forEach(([n, d, lab], r) => { const y = 10 + r * 40, w = 260;
        for (let i = 0; i < d; i++) s += `<rect x="${10 + i * w / d}" y="${y}" width="${w / d}" height="26" fill="${i < n ? HI : '#fff'}" stroke="${INK}"/>`;
        s += T(300, y + 18, lab || n + '/' + d, { anchor: 'start', bold: 1 }); });
      return S(360, 14 + list.length * 40, s);
    },
    clock(h, m) {
      const cx = 80, cy = 80, r = 64; let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
      for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; s += T(cx + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14) + 5, i); }
      const ma = m / 60 * Math.PI * 2 - Math.PI / 2, ha = ((h % 12) + m / 60) / 12 * Math.PI * 2 - Math.PI / 2;
      s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(ha) * 34}" y2="${cy + Math.sin(ha) * 34}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
      s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(ma) * 52}" y2="${cy + Math.sin(ma) * 52}" stroke="${HI}" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="4" fill="${INK}"/>`;
      s += T(200, 60, 'short hand: the hour', { anchor: 'start' }) + T(200, 84, 'long hand: the minutes', { anchor: 'start', fill: '#a86a10' });
      return S(360, 160, s);
    },
    coins(list) {   // 'q' 'd' 'n' 'p' (and '$' for a dollar bill)
      const C = { q: [25, 22, '#c8c8d0', '25¢'], d: [10, 15, '#c8c8d0', '10¢'], n: [5, 18, '#b8b8c0', '5¢'], p: [1, 16, '#c8844a', '1¢'], $: [100, 0, '#a8d0a0', '$1'] };
      let s = '', x = 10; list.forEach(k => { const c = C[k]; if (k === '$') { s += `<rect x="${x}" y="22" width="70" height="36" fill="${c[2]}" stroke="${INK}"/>` + T(x + 35, 45, '$1', { bold: 1 }); x += 80; }
        else { s += `<circle cx="${x + c[1]}" cy="40" r="${c[1]}" fill="${c[2]}" stroke="${INK}"/>` + T(x + c[1], 45, c[3], { size: 12, bold: 1 }); x += c[1] * 2 + 8; } });
      return S(Math.max(200, x + 10), 80, s);
    },
    rect(w, h, unit) {   // a rectangle with its sides labelled, a grid if small
      const k = Math.min(240 / w, 120 / h), W = w * k, H = h * k; let s = `<rect x="40" y="20" width="${W}" height="${H}" fill="${SOFT}" stroke="${INK}" stroke-width="2"/>`;
      if (w <= 12 && h <= 12) for (let i = 1; i < w; i++) s += `<line x1="${40 + i * k}" y1="20" x2="${40 + i * k}" y2="${20 + H}" stroke="#9aa8d0"/>`;
      if (w <= 12 && h <= 12) for (let i = 1; i < h; i++) s += `<line x1="40" y1="${20 + i * k}" x2="${40 + W}" y2="${20 + i * k}" stroke="#9aa8d0"/>`;
      s += T(40 + W / 2, 14, w + ' ' + (unit || '')) + T(30, 20 + H / 2, h + ' ' + (unit || ''), { anchor: 'end' });
      return S(Math.max(300, 60 + W), 40 + H, s);
    },
    box3(l, w, h) {
      const s = `<path d="M40,60 h120 v80 h-120 Z" fill="${SOFT}" stroke="${INK}" stroke-width="2"/><path d="M40,60 l40,-36 h120 l-40,36 Z" fill="#dfe6f8" stroke="${INK}" stroke-width="2"/><path d="M160,60 l40,-36 v80 l-40,36 Z" fill="#b8c6ea" stroke="${INK}" stroke-width="2"/>` +
        T(100, 158, 'length ' + l) + T(214, 90, 'width ' + w, { anchor: 'start' }) + T(30, 104, 'height ' + h, { anchor: 'end' });
      return S(320, 170, s);
    },
    coord(points, max) {   // points: [[x, y, label], ...] on a grid 0..max
      const M = max || 8, k = 150 / M; let s = '';
      for (let i = 0; i <= M; i++) s += `<line x1="${30 + i * k}" y1="10" x2="${30 + i * k}" y2="160" stroke="#d8dce8"/><line x1="30" y1="${160 - i * k}" x2="180" y2="${160 - i * k}" stroke="#d8dce8"/>` + T(30 + i * k, 175, i, { size: 10 }) + T(22, 164 - i * k, i, { size: 10, anchor: 'end' });
      s += `<line x1="30" y1="160" x2="186" y2="160" stroke="${INK}" stroke-width="2"/><line x1="30" y1="160" x2="30" y2="4" stroke="${INK}" stroke-width="2"/>` + T(196, 164, 'x', { bold: 1 }) + T(30, 0 + 10, 'y', { bold: 1, anchor: 'start' });
      (points || []).forEach(([x, y, lab]) => { s += `<circle cx="${30 + x * k}" cy="${160 - y * k}" r="5" fill="${HI}"/>` + T(36 + x * k, 156 - y * k, lab || '(' + x + ', ' + y + ')', { anchor: 'start', bold: 1 }); });
      return S(300, 184, s);
    },
    rtri(a, b, c) {   // a right triangle: legs a (up), b (across), hypotenuse c
      const s = `<path d="M40,150 v-110 l180,110 Z" fill="${SOFT}" stroke="${INK}" stroke-width="2"/><path d="M40,150 v-14 h14 v14" fill="none" stroke="${INK}"/>` +
        T(30, 100, a, { anchor: 'end', bold: 1 }) + T(130, 170, b, { bold: 1 }) + T(140, 86, c, { bold: 1, anchor: 'start' });
      return S(300, 180, s);
    },
    angle(deg) {
      const r = 90, a = deg * Math.PI / 180, x = 60 + Math.cos(a) * r, y = 130 - Math.sin(a) * r;
      const s = `<line x1="60" y1="130" x2="170" y2="130" stroke="${INK}" stroke-width="2"/><line x1="60" y1="130" x2="${x}" y2="${y}" stroke="${INK}" stroke-width="2"/>` +
        `<path d="M${60 + 30},130 A30,30 0 ${deg > 180 ? 1 : 0},0 ${60 + Math.cos(a) * 30},${130 - Math.sin(a) * 30}" fill="none" stroke="${HI}" stroke-width="3"/>` + T(100, 112, deg + '°', { bold: 1, anchor: 'start' });
      return S(240, 150, s);
    },
    circle(r, unit) {
      const s = `<circle cx="90" cy="80" r="64" fill="${SOFT}" stroke="${INK}" stroke-width="2"/><line x1="90" y1="80" x2="154" y2="80" stroke="${HI}" stroke-width="3"/><circle cx="90" cy="80" r="3" fill="${INK}"/>` +
        T(122, 72, 'r = ' + r + (unit ? ' ' + unit : ''), { bold: 1 }) + T(200, 60, 'area = π × r × r', { anchor: 'start' }) + T(200, 90, 'around = 2 × π × r', { anchor: 'start' }) + T(200, 120, 'π ≈ 3.14', { anchor: 'start' });
      return S(360, 160, s);
    },
    bars(vals, labs, unit, title) {
      const mx = Math.max(...vals), W = Math.max(260, vals.length * 64); let s = title ? T(W / 2, 14, title, { bold: 1 }) : '';
      vals.forEach((v, i) => { const h = v / mx * 110, x = 20 + i * 60; s += `<rect x="${x}" y="${140 - h}" width="40" height="${h}" fill="${[HI, '#5a9ae8', '#5ac878', '#e8645a', '#b878e8', '#4ac8c8'][i % 6]}" stroke="${INK}"/>` + T(x + 20, 134 - h, v + (unit || ''), { size: 12, bold: 1 }) + T(x + 20, 158, labs[i], { size: 11 }); });
      return S(W, 168, s);
    },
    flow(steps, cyc) {   // boxes joined by arrows; cyc: back to the start
      const n = steps.length, per = Math.min(n, 3), rows = Math.ceil(n / per), bw = 104, bh = 46, gx = 22, W = per * bw + (per - 1) * gx + 20; let s = '';
      steps.forEach((t, i) => { const r = Math.floor(i / per), c = r % 2 ? per - 1 - (i % per) : i % per, x = 10 + c * (bw + gx), y = 10 + r * (bh + 30);
        s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="${i % 2 ? '#fff' : '#fff7e0'}" stroke="${INK}" stroke-width="2"/>`;
        const words = String(t).split(' '), lines = []; let cur = ''; words.forEach(w => { if ((cur + ' ' + w).trim().length > 13 && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }); lines.push(cur);
        lines.slice(0, 3).forEach((l, k) => { s += T(x + bw / 2, y + bh / 2 + 5 + (k - (Math.min(lines.length, 3) - 1) / 2) * 14, l, { size: 12 }); });
        if (i < n - 1) { const r2 = Math.floor((i + 1) / per), c2 = r2 % 2 ? per - 1 - ((i + 1) % per) : (i + 1) % per, x2 = 10 + c2 * (bw + gx), y2 = 10 + r2 * (bh + 30);
          s += r2 === r ? (c2 > c ? arrow(x + bw, y + bh / 2, x2, y2 + bh / 2) : arrow(x, y + bh / 2, x2 + bw, y2 + bh / 2)) : arrow(x + bw / 2, y + bh, x2 + bw / 2, y2); } });
      if (cyc && n > 1) s += T(W / 2, 10 + rows * (bh + 30) - 8, '↺ and around again', { size: 12, fill: '#6a6252' });
      return S(W, 10 + rows * (bh + 30) + (cyc ? 4 : -20), s);
    },
    punnett(p1, p2) {   // two parents' gene pairs, e.g. 'Bb' and 'Bb'
      let s = T(110, 16, p2[0], { bold: 1, size: 16 }) + T(170, 16, p2[1], { bold: 1, size: 16 }) + T(66, 62, p1[0], { bold: 1, size: 16 }) + T(66, 122, p1[1], { bold: 1, size: 16 });
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const g = [p1[r], p2[c]].sort((x, y) => (x === x.toUpperCase() ? 0 : 1) - (y === y.toUpperCase() ? 0 : 1)).join('');
        s += `<rect x="${80 + c * 60}" y="${26 + r * 60}" width="60" height="60" fill="${g === g.toLowerCase() ? '#fbe4e4' : '#fff'}" stroke="${INK}" stroke-width="2"/>` + T(110 + c * 60, 62 + r * 60, g, { bold: 1, size: 16 }); }
      return S(260, 150, s + T(230, 70, 'parent 2 →', { size: 11 }));
    },
    circuit(v, r) {
      const s = `<rect x="40" y="30" width="220" height="110" fill="none" stroke="${INK}" stroke-width="3"/><rect x="20" y="64" width="40" height="40" fill="#fff" stroke="${INK}" stroke-width="2"/>` + T(40, 90, v + ' V', { bold: 1 }) +
        `<path d="M120,30 l8,-10 l10,20 l10,-20 l10,20 l10,-20 l10,20 l8,-10" fill="#fff" stroke="${HI}" stroke-width="3"/>` + T(150, 60, r + ' Ω', { bold: 1 }) + T(150, 162, 'current I = V ÷ R', {}) + arrow(240, 120, 240, 60, '#5a9ae8');
      return S(300, 172, s);
    },
    staff(notes) {   // notes on the treble staff, e.g. ['E4','G4','B4','D5','F5']
      const pos = { C4: -2, D4: -1, E4: 0, F4: 1, G4: 2, A4: 3, B4: 4, C5: 5, D5: 6, E5: 7, F5: 8, G5: 9 }; let s = '';
      for (let i = 0; i < 5; i++) s += `<line x1="20" y1="${40 + i * 14}" x2="340" y2="${40 + i * 14}" stroke="${INK}" stroke-width="1.5"/>`;
      s += T(38, 104, '𝄞', { size: 64 });
      notes.forEach((nt, i) => { const p = pos[nt], y = 96 - p * 7, x = 90 + i * 50; s += `<ellipse cx="${x}" cy="${y}" rx="9" ry="7" fill="${INK}" transform="rotate(-20 ${x} ${y})"/>`; if (p <= -2) s += `<line x1="${x - 14}" y1="${96 + 14}" x2="${x + 14}" y2="${96 + 14}" stroke="${INK}"/>`; s += T(x, 136, nt[0], { bold: 1 }); });
      return S(360, 146, s);
    },
    colorwheel() {
      const C = [['red', '#e03a3a'], ['orange', '#f08a30'], ['yellow', '#f0d030'], ['green', '#3aa84a'], ['blue', '#3a6ad8'], ['violet', '#8a4ac8']]; let s = '';
      C.forEach(([n, c], i) => { const a0 = i / 6 * Math.PI * 2 - Math.PI / 2, a1 = (i + 1) / 6 * Math.PI * 2 - Math.PI / 2;
        s += `<path d="M90,90 L${90 + Math.cos(a0) * 70},${90 + Math.sin(a0) * 70} A70,70 0 0,1 ${90 + Math.cos(a1) * 70},${90 + Math.sin(a1) * 70} Z" fill="${c}" stroke="#fff" stroke-width="2"/>`;
        const am = (a0 + a1) / 2; s += T(90 + Math.cos(am) * 92, 94 + Math.sin(am) * 92, n, { size: 12 }); });
      return S(200, 190, s + T(100, 186, 'primary: red, yellow, blue', { size: 11 }));
    },
    compass() {
      let s = `<circle cx="80" cy="80" r="58" fill="#fffdf6" stroke="${INK}"/>`;
      [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([d, a]) => { const r = a * Math.PI / 180; s += arrow(80, 80, 80 + Math.sin(r) * 48, 80 - Math.cos(r) * 48) + T(80 + Math.sin(r) * 66, 85 - Math.cos(r) * 66, d, { bold: 1, size: 15 }); });
      return S(220, 160, s + T(170, 40, 'Never Eat', { anchor: 'start', size: 12 }) + T(170, 56, 'Soggy Waffles', { anchor: 'start', size: 12 }));
    },
    tape(len, unit) {   // a ruler 0-4 inches in sixteenths, a length marked
      const k = 80; let s = `<rect x="10" y="10" width="${4 * k + 20}" height="44" fill="#f6e08a" stroke="${INK}"/>`;
      for (let i = 0; i <= 64; i++) { const h = i % 16 === 0 ? 24 : i % 8 === 0 ? 18 : i % 4 === 0 ? 13 : i % 2 === 0 ? 9 : 6; s += `<line x1="${20 + i * k / 16}" y1="10" x2="${20 + i * k / 16}" y2="${10 + h}" stroke="${INK}"/>`; if (i % 16 === 0) s += T(20 + i * k / 16, 50, i / 16, { bold: 1 }); }
      if (len != null) s += `<rect x="20" y="60" width="${len * k}" height="8" fill="${HI}"/>` + T(20 + len * k / 2, 84, (unit || '') , { bold: 1 });
      return S(4 * k + 40, 92, s);
    },
    timeline(events) {   // [[year, label], ...]
      const ys = events.map(e => e[0]), a = Math.min(...ys), b = Math.max(...ys), px = y => 30 + (b === a ? 0.5 : (y - a) / (b - a)) * 300; let s = `<line x1="20" y1="60" x2="340" y2="60" stroke="${INK}" stroke-width="2"/>`;
      events.forEach(([y, l], i) => { const x = px(y), up = i % 2 === 0; s += `<circle cx="${x}" cy="60" r="5" fill="${HI}"/>` + T(x, up ? 44 : 84, y, { bold: 1, size: 12 }) + T(x, up ? 28 : 100, l, { size: 11 }); });
      return S(360, 110, s);
    },
    plate() {   // MyPlate's five groups
      const s = `<circle cx="100" cy="90" r="74" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M100,90 L100,16 A74,74 0 0,1 174,90 Z" fill="#f0a0a0"/><path d="M100,90 L174,90 A74,74 0 0,1 100,164 Z" fill="#9ad08a"/>` +
        `<path d="M100,90 L100,164 A74,74 0 0,1 26,90 Z" fill="#f6d890"/><path d="M100,90 L26,90 A74,74 0 0,1 100,16 Z" fill="#b8a0e0"/><circle cx="196" cy="34" r="18" fill="#a8c8f0" stroke="${INK}"/>` +
        T(130, 62, 'fruits', { size: 12 }) + T(130, 126, 'vegetables', { size: 12 }) + T(68, 126, 'grains', { size: 12 }) + T(68, 62, 'protein', { size: 12 }) + T(196, 38, 'dairy', { size: 11 });
      return S(240, 180, s);
    },
    money(rows) {   // where money comes from: [[label, share 0-1], ...] as one stacked bar with labels beside
      let s = '', y = 10; const tot = rows.reduce((a, r) => a + r[1], 0); const cols = [HI, '#5a9ae8', '#5ac878', '#e8645a', '#b878e8'];
      rows.forEach(([l, v], i) => { const h = Math.max(18, v / tot * 160); s += `<rect x="20" y="${y}" width="60" height="${h}" fill="${cols[i % 5]}" stroke="${INK}"/>` + T(92, y + h / 2 + 5, l, { anchor: 'start', size: 13 }); y += h; });
      return S(360, y + 10, s);
    } };
})();
