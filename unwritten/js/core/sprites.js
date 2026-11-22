"use strict";
// =====================================================================
//  PEOPLE SPRITES (Nov 22). Christian: "We need new sprites that match ... for all the NPCs." One procedural pixel-art
//  generator for every person in town that isn't the player or a party member: SNES/FF6-style, about 2.5 heads tall,
//  a clean 1 px dark outline, three tones per colour (light from the upper left). Made from parts: body (kid, teen,
//  adult, elder; slim, average, broad), skin, hair (bald, buzz, short, side part, messy, curly, bob, long, ponytail, bun),
//  tops (tee, polo, open shirt, hoodie, flannel, sweater, jacket, winter coat, work vest, formal vest, dress, overalls,
//  apron, scrubs, uniform, running top, cycling jersey), bottoms (pants, shorts, skirt), hats (cap, beanie, sun hat,
//  hard hat, cowboy hat, bike helmet, headband), glasses, beards, bags, canes and walkers, and a few things to hold.
//  All generic: no real people, nothing traced from another game.
//  Two scales: 'o' outdoors (PM 8: an adult is 28 px, a little shorter than a car) and 'i' indoors (24 px a metre: 34 px).
//  Each look is drawn once, lazily, into a 4 x 4 sheet (rows down, up, left, right; columns stand, step, step, breath)
//  and cached by its key (LRU). Left is the right view mirrored.
// =====================================================================
const SPR = (() => {
  const OUTC = '#1c1620';
  // ---------- colours: three tones of each, as packed RGBA ints ----------
  const HEX = new Map(), PAL = new Map();
  function rgb(h) { if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; const v = parseInt(h.slice(1, 7), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function toInt(r, g, b) { return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0; }
  function tone(h, k) { const [r, g, b] = rgb(h); if (k > 0) return [r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k * 0.85].map(Math.round);
    return [r * (1 + k) * 0.96, g * (1 + k) * 0.97, Math.min(255, b * (1 + k) + 10)].map(v => Math.max(0, Math.round(v))); }   // shadows lean a little cool
  function ci(h) { let v = HEX.get(h); if (v === undefined) { const [r, g, b] = rgb(h); v = toInt(r, g, b); HEX.set(h, v); } return v; }
  function pal(h) { let p = PAL.get(h); if (!p) { const a = tone(h, 0.3), c = tone(h, -0.3); p = [toInt(a[0], a[1], a[2]), ci(h), toInt(c[0], c[1], c[2])]; PAL.set(h, p); } return p; }
  const OUT = ci(OUTC), EYE = ci('#221a20'), WHITE = ci('#f4f2ee');
  function lum(h) { const [r, g, b] = rgb(h); return (0.3 * r + 0.59 * g + 0.11 * b) / 255; }

  // ---------- body plans, per scale and age ----------
  const BASE = {
    o: { W: 30, H: 36, adult: [10, 10, 8, 8, 2, 8, 3, 2], teen: [10, 9, 8, 7, 2, 7, 3, 2], kid: [10, 8, 6, 5, 2, 5, 3, 1], elder: [10, 10, 8, 8, 2, 7, 3, 2] },
    i: { W: 36, H: 44, adult: [12, 12, 10, 10, 3, 10, 4, 2], teen: [12, 11, 10, 9, 3, 8, 4, 2], kid: [12, 10, 8, 7, 2, 6, 4, 2], elder: [12, 12, 10, 10, 3, 9, 4, 2] } };
  function plan(L, sc) {
    const B = BASE[sc], a = B[L.age] || B.adult, P = { W: B.W, H: B.H, hw: a[0], hh: a[1], tw: a[2], th: a[3], aw: a[4], lh: a[5], lw: a[6], sh: a[7], sc };
    if (L.build === 0 && L.age !== 'kid') P.tw -= 2; if (L.build === 2) P.tw += 2;
    P.cx = P.W >> 1; P.ay = P.H - 3; return P;
  }

  // ---------- one cell: dir 0 down, 1 up, 2 right; fr 0 stand, 1 step, 2 step, 3 breath ----------
  function cell(L, P, dir, fr) {
    const W = P.W, H = P.H, px = new Uint32Array(W * H), { cx, ay, hw, hh, aw, lw, sh } = P, big = P.sc === 'i';
    const put = (x, y, c) => { if (c && x >= 0 && y >= 0 && x < W && y < H) px[y * W + x] = c; };
    const rect = (x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(i, j, c); };
    const box = (x, y, w, h, p, bot) => { rect(x, y, w, h, p[1]); if (w >= 3) { rect(x, y, 1, h, p[0]); rect(x + w - 1, y, 1, h, p[2]); } if (bot && h > 2) rect(x, y + h - 1, w, 1, p[2]); };
    const line = (x0, y0, x1, y1, c) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let k = 0; k <= n; k++) put(Math.round(x0 + (x1 - x0) * k / n), Math.round(y0 + (y1 - y0) * k / n), c); };
    const skin = pal(L.skin), hair = pal(L.hair), c1 = pal(L.c1), c2 = pal(L.c2), pc = pal(L.top === 'overalls' ? L.c1 : L.top === 'scrubs' ? L.c1 : L.pc), shoe = pal(L.sh);
    const side = dir === 2, back = dir === 1, ub = fr === 3 ? 1 : 0;
    let tw = side ? P.tw - 2 : P.tw;
    const coat = L.top === 'coat', longS = L.sleeve !== 'short', tank = L.top === 'run';
    if (coat) tw += 2;
    const yL0 = ay - P.lh + 1, yT1 = yL0 - 1 + ub, yT0 = yT1 - P.th + 1, yH1 = yT0, yH0 = yH1 - hh + 1;
    const tx0 = cx - (tw >> 1), tx1 = tx0 + tw - 1;
    const stoop = L.age === 'elder' && side ? 1 : 0;
    const hx0 = cx - (hw >> 1) + (side ? 1 + stoop : 0), hx1 = hx0 + hw - 1, ey = yH0 + Math.floor(hh * 0.55) + (big ? 0 : 0);
    const topP = L.top === 'overalls' || L.top === 'workvest' || L.top === 'apronb' ? c2 : c1;   // the shirt under a bib or a vest
    const sleeveP = L.top === 'overalls' || L.top === 'workvest' ? c2 : c1;
    const handC = coat && L.mitts ? pal(L.mitts) : skin;
    const handY = yT1 + 2;
    // ----- things behind the body -----
    if (L.aid === 'walker' && back) walker();
    if (L.bag === 'case' && !back) { if (side) { box(tx0 - 3, yT0 - 3, 3, P.th + 4, pal('#2a2224')); } else { rect(tx0 + 1, yT0 - 4, 2, 4, pal('#2a2224')[1]); } }
    if (L.bag === 'pack' && side) box(tx0 - 2, yT0 + 1, 3, P.th - 2, pal(L.bc), true);
    if (L.hs === 'long' && !back && !side) { rect(hx0 - 1, yH0 + 3, 2, hh + 2, hair[2]); rect(hx1, yH0 + 3, 2, hh + 2, hair[2]); }
    // ----- legs -----
    legs();
    // ----- torso -----
    torso();
    // ----- arms -----
    arms();
    // skirt / dress / long coat over the top of the legs
    if (L.bot === 'skirt' || L.top === 'dress') { const p = L.top === 'dress' ? c1 : pc, n = Math.max(2, Math.ceil(P.lh * 0.5));
      for (let j = 0; j < n; j++) { const fl = j >= n >> 1 ? 1 : 0; box(tx0 - fl - (side ? 0 : 0), yL0 + j - 1 + ub, tw + fl * 2, 1, p); }
      rect(tx0 - 1, yL0 + n - 2 + ub, tw + 2, 1, p[2]); }
    if (coat) { for (let j = 0; j < (big ? 4 : 3); j++) box(tx0, yL0 + j + ub, tw, 1, c1); rect(tx0, yL0 + (big ? 3 : 2) + ub, tw, 1, c1[2]); if (!back && !side) rect(cx - 1 + (tw & 1), yT0 + 1, 1, P.th + 2, c1[2]); }
    if (L.apron && !back) { const ap = pal(L.apron), x0 = side ? tx1 - 1 : tx0 + 1, w = side ? 2 : tw - 2; box(x0, yT0 + 2, w, P.th - 2 + Math.ceil(P.lh * 0.45), ap); if (!side) rect(cx - 1, yT0, 2, 2, ap[1]); }
    if (L.apron && back) rect(tx0, yT1 - 1, tw, 1, pal(L.apron)[1]), rect(cx - 1, yT1, 2, 2, pal(L.apron)[1]);
    // ----- head -----
    head();
    hat();
    // ----- held, carried, worn on the front -----
    front();
    if (L.aid === 'cane') { const p = pal('#6a4a2a'); if (side) { const x = tx1 + 2; rect(x, handY - 1, 1, ay - handY + 2, p[1]); put(x - 1, handY - 1, p[1]); }
      else if (!back) { const x = tx1 + aw + 1; rect(x, handY - 1, 1, ay - handY + 2, p[1]); put(x - 1, handY - 1, p[1]); } else { const x = tx0 - aw - 1; rect(x, handY - 1, 1, ay - handY + 2, p[1]); } }
    if (L.aid === 'walker' && !back) walker();
    return px;

    function legs() {
      const lifted = j => !side && ((fr === 1 && j === 0) || (fr === 2 && j === 1));
      const shorts = L.bot === 'shorts' || tank && L.bot !== 'pants', skirt = L.bot === 'skirt' || L.top === 'dress';
      const knee = yL0 + Math.ceil(P.lh * 0.45) - 1, legP = skirt && L.tights ? pal(L.tights) : skin;
      const one = (x, yb, p, far) => {
        for (let y = yL0; y <= yb; y++) {
          let q = y > yb - sh ? shoe : (shorts || skirt) && y > knee ? legP : skirt ? legP : p;
          if (skirt && y <= knee) q = legP;
          const t = far ? [q[2], q[2], q[2]] : q;
          for (let i = 0; i < lw; i++) put(x + i, y, i === 0 ? t[0] : i === lw - 1 ? t[2] : t[1]);
        }
        rect(x, yb, lw, 1, far ? shoe[2] : shoe[2]);
      };
      if (!side) { one(cx - lw, ay - (lifted(0) ? 1 : 0), pc); one(cx, ay - (lifted(1) ? 1 : 0), pc); rect(cx - 1, yL0, 1, Math.max(1, P.lh - sh - 1), pc[2]); }
      else {
        const s = fr === 1 ? 2 : fr === 2 ? -2 : 0, x = cx - (lw >> 1);
        one(x - s - (s ? 0 : 1), ay, pc, true); one(x + s + (s ? 0 : 1), ay, pc, false);
        put(x + s + lw, ay, shoe[1]); put(x - s + lw, ay, shoe[2]);   // toes
      }
    }
    function torso() {
      const p = topP;
      box(tx0, yT0, tw, P.th, p, true);
      put(tx0, yT0, 0); put(tx1, yT0, 0);
      const T = L.top, yb = yT1;
      if (T === 'flannel') for (let y = yT0; y <= yb; y++) for (let x = tx0; x <= tx1; x++) { const a = (x - tx0) % 3 === 2, b = (y - yT0) % 3 === 2; if (a || b) put(x, y, a && b ? c2[2] : c2[1]); }
      if (T === 'sweater') { for (let x = tx0; x <= tx1; x++) { put(x, yT0 + 2, c2[1]); put(x, yT0 + 3, (x & 1) ? c2[1] : c1[0]); } }
      if (T === 'jersey') { rect(tx0, yT0 + 2, tw, 2, c2[1]); }
      if (T === 'run' && !side) { rect(tx0, yT0, 1, P.th - 1, skin[1]); rect(tx1, yT0, 1, P.th - 1, skin[2]); }
      if (T === 'coat') { for (let y = yT0 + 3; y <= yb; y += 3) rect(tx0 + 1, y, tw - 2, 1, c1[2]); }
      if (T === 'workvest' || L.vest) { const v = pal(L.vest || L.c1);
        if (back || side) { box(back ? tx0 : tx0, yT0, tw, P.th - 1, v); }
        else { const w = (tw >> 1) - 1; box(tx0, yT0 + 1, w, P.th - 2, v); box(tx1 - w + 1, yT0 + 1, w, P.th - 2, v); }
        if (T === 'workvest') rect(tx0, yT0 + P.th - 4, tw, 1, ci('#e8e8dc')); }
      if (T === 'overalls') { if (!back && !side) { box(tx0 + 2, yT0 + 2, tw - 4, P.th - 2, c1); rect(tx0 + 2, yT0, 1, 2, c1[1]); rect(tx1 - 2, yT0, 1, 2, c1[1]); put(tx0 + 2, yT0 + 2, c1[0]); put(tx1 - 2, yT0 + 2, ci('#e8d070')); }
        else if (back) { line(tx0 + 2, yT0, tx1 - 2, yT0 + 4, c1[1]); line(tx1 - 2, yT0, tx0 + 2, yT0 + 4, c1[1]); rect(tx0, yb - 1, tw, 2, c1[1]); }
        else { rect(tx0 + 1, yT0, 1, 3, c1[1]); box(tx0, yT0 + 3, tw, P.th - 3, c1); } }
      if (back) { if (T === 'hoodie') rect(tx0 + 1, yT0, tw - 2, 2, c1[2]); if (L.bag === 'pack') { const b = pal(L.bc); box(tx0 + 1, yT0 + 1, tw - 2, P.th - 2, b, true); rect(tx0 + 2, yT0 + 1, tw - 4, 1, b[0]); }
        if (L.bag === 'case') box(cx - 2, yT0 - 3, 4, P.th + 4, pal('#2a2224'));
        if (L.bag === 'side') line(tx1 - 1, yT0, tx0 + 1, yb - 1, pal(L.bc)[2]);
        if (L.neck === 'scarf' || coat) rect(tx0, yT0, tw, 1, c2[1]);
        return; }
      if (side) { if (T === 'open' || T === 'jacket') rect(tx1 - 1, yT0, 2, P.th - 1, c2[1]); if (T === 'hoodie') rect(tx0, yT0, 2, 2, c1[2]);
        if (L.neck === 'scarf' || coat) { rect(tx0, yT0, tw, 1, c2[1]); rect(tx1, yT0 + 1, 1, 2, c2[2]); }
        if (L.bag === 'side') { const b = pal(L.bc); box(tx0 - 1, yb - 2, 3, 3, b); line(tx0 + 1, yT0, tx0, yb - 2, b[2]); }
        if (L.bag === 'pack') rect(tx1 - 1, yT0, 1, 3, pal(L.bc)[2]);
        return; }
      // front details
      if (T === 'tee' || T === 'dress' || T === 'run' || T === 'jersey') { put(cx - 1, yT0, skin[1]); put(cx, yT0, skin[1]); }
      if (T === 'scrubs') { put(cx - 1, yT0, skin[1]); put(cx, yT0, skin[1]); put(cx - 1, yT0 + 1, skin[2]); put(cx, yT0 + 1, skin[2]); put(tx0 + 1, yT0 + 2, c1[0]); }
      if (T === 'polo' || T === 'uniform') { put(cx - 2, yT0, c2[0]); put(cx + 1, yT0, c2[0]); put(cx - 1, yT0, skin[1]); put(cx, yT0, skin[2]); rect(cx - 1 + (tw & 1), yT0 + 1, 1, 2, p[2]); }
      if (T === 'uniform') { put(tx0 + 1, yT0 + 2, ci('#e8c850')); rect(tx0, yb, tw, 1, c2[2]); }
      if (T === 'open' || T === 'jacket') { rect(cx - 1, yT0, 2, P.th - 1, c2[1]); put(cx - 2, yT0, p[0]); put(cx + 1, yT0, p[2]); if (T === 'jacket') { put(cx - 2, yT0 + 1, p[0]); put(cx + 1, yT0 + 1, p[2]); } }
      if (T === 'hoodie') { rect(tx0 + 1, yT0, tw - 2, 1, c1[2]); put(cx - 2, yT0 + 1, ci('#e0dcd4')); put(cx + 1, yT0 + 1, ci('#e0dcd4')); rect(cx - 3, yb - 2, 6, 1, c1[2]); }
      if (T === 'flannel') { put(cx - 1, yT0, c1[0]); put(cx, yT0, c1[0]); }
      if (L.neck === 'scarf' || coat) { rect(tx0, yT0, tw, 1, c2[1]); rect(tx0 + 1, yT0 + 1, 2, big ? 4 : 3, c2[1]); rect(tx0 + 2, yT0 + 1, 1, big ? 4 : 3, c2[2]); }
      if (L.neck === 'bow') { rect(cx - 1, yT0, 2, 1, EYE); put(cx - 2, yT0, EYE); put(cx + 1, yT0, EYE); }   // a bow tie
      if (L.neck === 'tie') rect(cx - 1 + (tw & 1), yT0, 1, P.th - 2, ci('#7a2434'));
      if (L.neck === 'headset') { rect(tx0, yT0, tw, 1, EYE); rect(tx0 - 1, yT0 - 1, 2, 2, ci('#2ab0a8')); rect(tx1, yT0 - 1, 2, 2, ci('#2ab0a8')); }
      if (L.neck === 'lanyard') { line(cx - 2, yT0, cx - 1, yT0 + 3, ci('#3a6ab8')); line(cx + 1, yT0, cx, yT0 + 3, ci('#3a6ab8')); rect(cx - 1, yT0 + 4, 2, 2, WHITE); }
      if (L.bag === 'pack') { const b = pal(L.bc)[2]; rect(tx0 + 1, yT0, 1, 4, b); rect(tx1 - 1, yT0, 1, 4, b); }
      if (L.bag === 'side') { const b = pal(L.bc); line(tx0 + 1, yT0, tx1, yb - 1, b[2]); box(tx1 - 1, yb - 1, 3, 3, b); }
    }
    function arms() {
      const p = sleeveP, n = P.th + 1, sl = longS ? n - 2 : tank ? 1 : Math.max(2, (n >> 1) - 1);
      const arm = (x, y0, len, sw) => {   // one arm: sleeve, bare arm, hand; sw shifts the lower part (a swing)
        for (let j = 0; j < len; j++) { const xs = x + (j > len / 2 ? sw : 0) + (j > len - 3 ? sw : 0);
          const q = j >= len - 2 ? handC : j < sl ? p : skin;
          for (let i = 0; i < aw; i++) put(xs + i, y0 + j, i === aw - 1 ? q[2] : i === 0 ? q[0] : q[1]); }
      };
      if (side) { const s = fr === 1 ? 1 : fr === 2 ? -1 : 0, x = cx - (aw >> 1) - (stoop ? 0 : 0); arm(x, yT0 + 1, n, s); if (coat) rect(x, yT0 + 1, aw, 1, c1[1]); return; }
      const lx = tx0 - aw, rx = tx1 + 1;
      arm(lx, yT0 + 1, n - (fr === 2 ? 1 : 0), 0); arm(rx, yT0 + 1, n - (fr === 1 ? 1 : 0), 0);
      if (!back) { rect(lx + aw - 1, yT0 + 2, 1, Math.min(sl, n - 3), p[2]); }
    }
    function head() {
      // face
      rect(hx0, yH0, hw, hh, skin[1]); rect(hx1, yH0 + 1, 1, hh - 1, skin[2]); rect(hx0 + 1, yH1, hw - 2, 1, skin[2]);
      put(hx0, yH0, 0); put(hx1, yH0, 0); put(hx0, yH1, 0); put(hx1, yH1, 0);
      if (big) { put(hx0, yH0 + 1, 0); put(hx1, yH0 + 1, 0); }
      const hs = L.hs, H0 = hair[0], H1 = hair[1], H2 = hair[2];
      const topN = hs === 'buzz' ? 2 : hs === 'bald' ? 0 : big ? 4 : 3;
      if (back) {
        if (hs === 'bald') { if (L.age === 'elder') rect(hx0, ey - 1, hw, 3, H1); put(hx0 - 1, ey, skin[2]); put(hx1 + 1, ey, skin[2]); return; }
        rect(hx0, yH0, hw, hh - 2, H1); rect(hx0 + 1, yH0 - 1, hw - 2, 1, H1); rect(hx0 + 2, yH0, hw - 5, 1, H0); rect(hx1, yH0, 1, hh - 2, H2);
        if (hs === 'buzz') rect(hx0, yH1 - 3, hw, 2, skin[1]);
        if (hs === 'long') { rect(hx0, yH1 - 2, hw, (P.th >> 1) + 2, H1); rect(hx1, yH1 - 2, 1, (P.th >> 1) + 2, H2); for (let x = hx0 + 2; x < hx1; x += 3) rect(x, yH1, 1, (P.th >> 1), H2); }
        if (hs === 'bob') rect(hx0, yH1 - 2, hw, 2, H1);
        if (hs === 'ponytail') { rect(cx - 1, yH1 - 2, 2, P.th >> 1, H1); put(cx, yH1 - 2, H2); put(cx - 1, yH1 - 3, ci(L.c2)); put(cx, yH1 - 3, ci(L.c2)); }
        if (hs === 'bun') { rect(cx - 2, yH0 - 3, 4, 3, H1); put(cx + 1, yH0 - 2, H2); }
        if (hs === 'curly') { for (let y = yH0; y < yH1 - 1; y += 2) { put(hx0 - 1, y, H1); put(hx1 + 1, y, H2); } for (let x = hx0; x <= hx1; x += 2) put(x, yH0 - 2, H1); }
        return;
      }
      if (side) {
        const bw = Math.ceil(hw * 0.5), fx = hx1;
        put(fx - 2, ey, EYE); put(fx - 2, ey + 1, EYE); put(fx + 1, ey + 1, skin[1]);
        if (big) put(fx - 1, ey + 3, skin[2]);
        if (L.beard) { const b = L.beard === 2 ? 1 : hh - (ey - yH0) - 2; rect(hx0 + bw - 1, ey + 2, fx - hx0 - bw + 2, b, H1); rect(hx0 + bw - 1, yH1, fx - hx0 - bw + 1, L.beard === 2 ? 0 : 1, H2); }
        if (hs === 'bald') { if (L.age === 'elder' || L.age === 'adult') rect(hx0, ey - 1, 3, 3, H1); put(hx0 + bw - 1, ey + 1, skin[2]); put(hx0 + bw - 1, ey + 2, skin[2]); }
        else {
          const backTo = hs === 'buzz' ? ey - 1 : hs === 'long' ? yH1 + (P.th >> 1) : hs === 'bob' ? yH1 - 1 : ey + 2;
          rect(hx0, yH0, bw, backTo - yH0 + 1, H1); rect(hx0, yH0, 1, backTo - yH0 + 1, H0);
          rect(hx0 + 1, yH0 - 1, hw - 2, 1, H1); rect(hx0, yH0, hw, topN, H1); rect(hx0 + 2, yH0 - 1, hw - 5, 1, H0);
          if (hs !== 'buzz') { for (let x = hx0 + bw; x < fx; x++) if ((x + yH0) % 2) put(x, yH0 + topN, H1); put(fx - 1, yH0 + topN, H2); }
          if (hs === 'messy' || hs === 'curly') for (let x = hx0 + 1; x < fx; x += 3) put(x, yH0 - 2, H1);
          if (hs === 'curly') for (let y = yH0; y < backTo; y += 2) put(hx0 - 1, y, H1);
          if (hs === 'ponytail') { rect(hx0 - 2, yH0 + 3, 2, big ? 7 : 5, H1); put(hx0 - 1, yH0 + 3, ci(L.c2)); }
          if (hs === 'bun') rect(hx0 - 1, yH0 - 2, 3, 3, H1);
          if (hs === 'long') rect(hx0 + bw, yH1 - 1, 1, (P.th >> 1) - 1, H2);
          put(hx0 + bw, ey + 1, skin[2]); put(hx0 + bw, ey + 2, skin[2]);   // the ear
        }
        if (L.gl) { put(fx - 3, ey - 1, EYE); put(fx - 2, ey - 1, EYE); put(fx - 1, ey - 1, EYE); line(hx0 + bw + 1, ey - 1, fx - 3, ey - 1, EYE); put(fx - 1, ey, WHITE); }
        if (L.face === 'mask') { rect(fx - 4, ey - 1, 5, 3, EYE); rect(fx - 3, ey, 3, 1, ci('#9ad0f0')); rect(hx0 + 1, yH0 - 3, 1, 6, ci('#f08a30')); }
        return;
      }
      // front
      const ex0 = cx - 3, ex1 = cx + 2;
      put(ex0, ey, EYE); put(ex0, ey + 1, EYE); put(ex1, ey, EYE); put(ex1, ey + 1, EYE);
      if (big) { put(ex0 - 1, ey, EYE); put(ex1 + 1, ey, EYE); put(ex0 - 1, ey + 1, skin[2]); put(ex1 + 1, ey + 1, skin[2]); rect(cx - 1, ey + 3, 2, 1, skin[2]); }
      if (L.blush) { put(ex0 - 1, ey + 2, ci('#e89a8a')); put(ex1 + 1, ey + 2, ci('#e89a8a')); }
      if (L.beard) { const by = ey + 2; if (L.beard === 2) rect(cx - 2, by, 4, 1, H1);
        else { rect(hx0, by, 2, yH1 - by, H1); rect(hx1 - 1, by, 2, yH1 - by, H2); rect(hx0 + 1, yH1 - 1, hw - 2, 2, H1); rect(cx - 2, by, 4, 1, H1); put(cx - 1, by + 1, skin[2]); put(cx, by + 1, skin[2]); put(hx0, yH1, 0); put(hx1, yH1, 0); } }
      if (hs === 'bald') { if (L.age === 'elder') { rect(hx0, ey - 2, 1, 3, H1); rect(hx1, ey - 2, 1, 3, H2); } put(hx0 + 2, yH0 + 1, skin[0]); put(hx0 - 1, ey, skin[2]); put(hx1 + 1, ey, skin[2]); }
      else {
        rect(hx0 + 1, yH0 - 1, hw - 2, 1, H1); rect(hx0, yH0, hw, topN, H1); rect(hx0 + 2, yH0 - 1, hw - 5, 1, H0); rect(hx1, yH0, 1, topN, H2);
        if (hs !== 'buzz') {
          const sideTo = hs === 'long' || hs === 'bob' ? yH1 - 1 : hs === 'curly' ? ey + 1 : ey - 1;
          rect(hx0, yH0, 1, sideTo - yH0 + 1, H1); rect(hx1, yH0, 1, sideTo - yH0 + 1, H2);
          if (hs === 'side') { rect(hx0, yH0 + topN, hw - 4, 1, H1); put(hx0 + 2, yH0 + 1, H0); }
          else if (hs === 'bob' || hs === 'long') { for (let x = hx0; x <= hx1; x++) if (x < cx - 2 || x > cx + 1) put(x, yH0 + topN, H1); put(hx0 + 1, yH0 + topN + 1, H1); put(hx1 - 1, yH0 + topN + 1, H2); }
          else for (let x = hx0 + 1; x < hx1; x++) if ((x - hx0) % 3 !== 2) put(x, yH0 + topN, x > cx ? H2 : H1);
          if (hs === 'messy' || hs === 'curly') for (let x = hx0 + 1; x < hx1; x += 3) put(x, yH0 - 2, H1);
          if (hs === 'curly') for (let y = yH0; y <= ey + 1; y += 2) { put(hx0 - 1, y, H1); put(hx1 + 1, y, H2); }
          if (hs === 'bun') { rect(cx - 2, yH0 - 3, 4, 2, H1); put(cx + 1, yH0 - 3, H2); }
          if (hs === 'ponytail') { put(hx1 + 1, yH0 + 3, H2); put(hx1 + 1, yH0 + 4, H2); }
        }
        put(hx0 + 2, yH0, H0); put(hx0 + 3, yH0, H0); put(hx0 + 3, yH0 + 1, H0);
      }
      if (L.gl) { rect(ex0 - 1, ey - 1, ex1 - ex0 + 3, 1, EYE); put(ex0 + 1, ey, WHITE); put(ex1 + 1, ey, WHITE); if (big) { put(ex0 - 2, ey, EYE); put(ex1 + 2, ey, EYE); } }
      if (L.face === 'mask') { rect(hx0, ey - 1, hw, 3, EYE); rect(hx0 + 1, ey, hw - 2, 1, ci('#9ad0f0')); rect(hx1 - 1, yH0 - 4, 1, 6, ci('#f08a30')); }
      if (L.face === 'curlers') for (let x = hx0; x < hx1; x += 3) { rect(x, yH0 - 2, 2, 2, ci('#f0f0f4')); put(x + 1, yH0 - 1, ci('#3a7ad8')); }
    }
    function hat() {
      const h = L.hat; if (!h) return; const p = pal(L.hc || '#4e5a34'), q = pal(L.hc2 || L.hc || '#4e5a34');
      const crown = (rows, inset) => { rect(hx0 + inset + 1, yH0 - 1 - (rows > 4 ? 1 : 0), hw - inset * 2 - 2, 1, p[1]); rect(hx0 + inset, yH0 - (rows > 4 ? 1 : 0), hw - inset * 2, rows, p[1]);
        rect(hx0 + inset + 1, yH0 - (rows > 4 ? 1 : 0), 2, 1, p[0]); rect(hx1 - inset, yH0, 1, rows - 1, p[2]); };
      const r3 = big ? 4 : 3;
      if (h === 'cap') { crown(r3, 0); if (side) rect(hx1 - 1, yH0 + r3 - 1, 4, 1, q[2]); else if (!back) rect(hx0, yH0 + r3 - 1, hw, 1, q[2]); else put(cx, yH0 + r3 - 1, hair[1]); }
      else if (h === 'beanie') { crown(r3 + 1, 0); rect(hx0, yH0 + r3, hw, 1, p[2]); if (L.hc2) rect(cx - 1, yH0 - 3, 2, 2, q[0]); if (side) put(hx1 + 1, yH0 + r3, p[2]); }
      else if (h === 'headband') { rect(hx0, yH0 + 1, hw, 1, p[1]); if (side) put(hx0 - 1, yH0 + 2, p[2]); }
      else if (h === 'hardhat') { crown(r3 + 1, 0); rect(cx - 1, yH0 - 2, 2, 1, p[0]); rect(hx0 - 1, yH0 + r3, hw + 2, 1, p[2]); if (side) rect(hx1, yH0 + r3, 3, 1, p[2]); }
      else if (h === 'helmet') { crown(r3 + 1, 0); for (let x = hx0 + 2; x < hx1; x += 3) put(x, yH0 - 1, ci('#2a2a30')); if (!back) rect(side ? hx1 - 2 : hx0 + 1, yH0 + r3, side ? 4 : hw - 2, 1, EYE); }
      else if (h === 'sunhat') { crown(r3, 1); rect(hx0 - 2, yH0 + r3 - 1, hw + 4, 1, p[2]); rect(hx0 - 1, yH0 + r3 - 2, hw + 2, 1, p[1]); rect(hx0 + 1, yH0 + r3 - 2, hw - 2, 1, q[2]); }
      else if (h === 'cowboy') { rect(hx0 + 1, yH0 - 3, hw - 2, r3 + 2, p[1]); put(cx - 1, yH0 - 3, 0); put(cx, yH0 - 3, 0); rect(hx0 + 1, yH0 - 3, 1, r3 + 2, p[0]); rect(hx1 - 1, yH0 - 3, 1, r3 + 2, p[2]);
        rect(hx0 + 1, yH0 + r3 - 2, hw - 2, 1, q[2]); rect(hx0 - 2, yH0 + r3 - 1, hw + 4, 1, p[1]); put(hx0 - 3, yH0 + r3 - 2, p[1]); put(hx1 + 3, yH0 + r3 - 2, p[2]); }
    }
    function front() {
      if (back) return;
      const H = L.hold;
      if (H === 'bino') { const x = side ? tx1 - 1 : cx - 2; rect(x, yT0 + 2, side ? 2 : 4, 2, EYE); put(x + 1, yT0 + 2, ci('#6a7a8a')); }
      if (H === 'game' && !side) { rect(cx - 3, yT1 - 2, 6, 3, ci('#5a5c66')); rect(cx - 1, yT1 - 2, 2, 2, ci('#9ad07a')); put(cx + 2, yT1 - 1, ci('#c83a3a')); }
      if (H === 'clip') { const x = side ? tx1 + 1 : tx1 + aw - 1; rect(x, yT1 - 3, 3, 5, ci('#b8915a')); rect(x + 1, yT1 - 2, 1, 3, WHITE); }
      if (H === 'book') { const x = side ? tx1 : cx - 2; rect(x, yT1 - 2, side ? 2 : 4, 3, ci(L.c2)); rect(x, yT1 - 2, 1, 3, WHITE); }
      if (H === 'rod') { const x0 = side ? tx1 + 1 : tx1 + aw, y0 = handY - 1, p = ci('#6a5a4a'); line(x0, y0, x0 + (big ? 6 : 5), y0 - (big ? 20 : 15), p); put(x0 + (big ? 6 : 5), y0 - (big ? 21 : 16), WHITE); }
    }
    function walker() {
      const g = pal('#a8b0b8'), y0 = handY - 1;
      if (side) { const x = tx1 + 2; rect(x, y0, 1, ay - y0 + 1, g[1]); rect(x + 3, y0, 1, ay - y0 + 1, g[2]); rect(x - 1, y0, 5, 1, g[0]); put(x + 3, ay, EYE); put(x, ay, EYE); return; }
      const a = tx0 - aw - 1, b = tx1 + aw + 1; rect(a, y0, 1, ay - y0 + 1, g[1]); rect(b, y0, 1, ay - y0 + 1, g[2]); rect(a, y0, b - a + 1, 1, g[0]); rect(a, y0 + 4, b - a + 1, 1, g[2]); put(a, ay, EYE); put(b, ay, EYE);
    }
  }
  function outline(px, W, H) {
    const o = px.slice();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (px[i]) continue;
      if ((x > 0 && px[i - 1]) || (x < W - 1 && px[i + 1]) || (y > 0 && px[i - W]) || (y < H - 1 && px[i + W])) o[i] = OUT; }
    return o;
  }

  // ---------- the cache: one 4 x 4 sheet per look and scale ----------
  const CACHE = new Map(), MAX = 420; let budget = 0, bf = -1, made = 0;
  function key(L) { return L.k || (L.k = [L.age, L.build, L.skin, L.hair, L.hs, L.top, L.c1, L.c2, L.sleeve, L.bot, L.pc, L.sh, L.tights, L.hat, L.hc, L.hc2, L.gl, L.beard, L.bag, L.bc, L.aid, L.hold, L.neck, L.vest, L.apron, L.mitts, L.face, L.blush].join('|')); }
  function build(L, sc) {
    const P = plan(L, sc), W = P.W, H = P.H, cv = document.createElement('canvas'); cv.width = W * 4; cv.height = H * 4;
    const g = cv.getContext('2d'), im = g.createImageData(W * 4, H * 4), out = new Uint32Array(im.data.buffer);
    for (let d = 0; d < 3; d++) for (let f = 0; f < 4; f++) {
      const px = outline(cell(L, P, d, f), W, H), row = d === 2 ? 3 : d;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = px[y * W + x]; if (!v) continue;
        out[(row * H + y) * W * 4 + f * W + x] = v;
        if (d === 2) out[(2 * H + y) * W * 4 + f * W + (W - 1 - x)] = v; }   // the left view: the right one mirrored
    }
    g.putImageData(im, 0, 0); made++;
    return { cv, W, H, ay: P.ay, cx: P.cx };
  }
  function get(L, sc, force) {
    const k = sc + key(L); let e = CACHE.get(k);
    if (e) { CACHE.delete(k); CACHE.set(k, e); return e; }   // most recently used goes last
    if (typeof frame !== 'undefined' && frame !== bf) { bf = frame; budget = 6; }
    if (!force && budget <= 0) return null;
    budget--; e = build(L, sc); CACHE.set(k, e);
    if (CACHE.size > MAX) CACHE.delete(CACHE.keys().next().value);
    return e;
  }
  const FALL = {};
  function fallback(L, sc) { const k = sc + L.age; return FALL[k] || (FALL[k] = build(norm({ age: L.age, c1: '#5a6a7a', pc: '#3a4a6a', hair: '#5a3a24' }), sc)); }
  const DIR = { down: 0, up: 1, left: 2, right: 3 };
  // draw a person: bottom centre (feet) at (x, by); dir 'down' 'up' 'left' 'right'; fr 0 stand, 1/2 steps, 3 breath
  function draw(L, sc, x, by, dir, fr) {
    const e = get(L, sc) || fallback(L, sc), r = DIR[dir] || 0, s = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(e.cv, (fr || 0) * e.W, r * e.H, e.W, e.H, Math.round(x) - e.cx, Math.round(by) - e.ay, e.W, e.H);
    ctx.imageSmoothingEnabled = s;
  }
  // the walk cycle: stand, step, stand, other step; and a slow breath when standing still
  function walkFrame(f) { return [1, 0, 2, 0][(f >> 3) & 3]; }
  function idleFrame(f, seed) { return ((f + (seed || 0) * 13) >> 5) % 3 === 2 ? 3 : 0; }
  function norm(L) {
    return Object.assign({ age: 'adult', build: 1, skin: '#e2b48e', hair: '#5a3a24', hs: 'short', top: 'tee', c1: '#5a6a7a', c2: '#3a4a5a', sleeve: '', bot: 'pants', pc: '#3a4a6a', sh: '#2a2224',
      tights: '', hat: '', hc: '', hc2: '', gl: 0, beard: 0, bag: '', bc: '#5a4a3a', aid: '', hold: '', neck: '', vest: '', apron: '', mitts: '', face: '', blush: 0 }, L);
  }

  // ---------- palettes and a seeded picker, for anybody who needs a look ----------
  const C = {
    skin: ['#f2d0b0', '#ecc19c', '#e2b48e', '#d9a77c', '#c99878', '#a8714e', '#8a5a3a', '#6a4430'],
    hair: ['#2a1e18', '#3a2a20', '#5a3a24', '#6a4a2a', '#8a5a2a', '#c87a3a', '#d8b060', '#141214', '#a0522d'],
    grey: ['#c8c4bc', '#e8e4dc', '#9a9894', '#b8b4ac', '#8a8a88'],
    cloth: ['#a8322a', '#3a5a8a', '#4a7a5a', '#c8a050', '#6a4a8a', '#2a8a8a', '#d86a2a', '#5a6a7a', '#8a3a5a', '#e8e4dc', '#2c2f3a', '#7a9a4a', '#b85a7a', '#4a6ab0', '#9a6a3a', '#d8c050', '#e8907a', '#5a8ab0'],
    bright: ['#e8c030', '#e84a3a', '#3a8ad8', '#3ab06a', '#e86aa0', '#f08a30', '#8a5ad8', '#2ac0c0'],
    earth: ['#6a7a4a', '#8a7a58', '#5a4a3a', '#7a6a4a', '#4e5a34', '#9a8a6a'],
    pants: ['#3a4a6a', '#2a3a5a', '#4a4a52', '#5a5040', '#8a7a58', '#26262c', '#4a3a2a', '#6a7a8a', '#3a4458'],
    shoes: ['#2a2224', '#5a3a24', '#e8e8ea', '#141416', '#7a4a2a', '#8a8a92'],
    coat: ['#2a3a5a', '#8a2a2a', '#2a4a3a', '#3a3a44', '#6a4a2a', '#4a5a8a', '#a8642a', '#5a2a4a', '#c8a030', '#4a7a8a'],
    knit: ['#c83a3a', '#e8e4dc', '#3a5a8a', '#d8a030', '#4a7a5a', '#8a3a6a', '#f08a30', '#2a2a30'] };
  function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function pick(r, a) { return a[Math.floor(r() * a.length) % a.length]; }
  function strHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // ---------- the FOLKS outfit records (indoor staff, Cecil, Tanner, everyone at a counter) ----------
  const GREYS = new Set(['#c8c4bc', '#b8b4ac', '#e8e4dc', '#8a8a88', '#9a9894']);
  const FL = new Map();
  function folkLook(who) {
    const S = typeof FOLKS !== 'undefined' && FOLKS[who]; if (!S) return null;
    const c = FL.get(who); if (c && c.S === S) return c.L;
    const r = rng(strHash(who)), has = k => S.extra === k || (Array.isArray(S.extra) && S.extra.includes(k));
    const age = S.sc ? (S.sc < 0.85 ? 'kid' : S.sc < 1 ? 'teen' : 'adult') : GREYS.has(S.hair) && who !== 'baker' ? 'elder' : 'adult';
    const L = { age, build: Math.floor(r() * 3), skin: S.skin, hair: S.hair, c1: S.shirt, c2: S.shirt2 || S.shirt, pc: S.pants, sh: S.shoes, gl: S.glasses ? 1 : 0,
      hs: pick(r, age === 'elder' ? ['short', 'bald', 'side', 'bob', 'buzz'] : ['short', 'side', 'messy', 'ponytail', 'bob', 'long', 'bun', 'curly', 'buzz', 'short']) };
    const contrast = Math.abs(lum(L.c1) - lum(L.c2));
    L.top = S.dress ? 'dress' : S.coat ? 'coat' : contrast > 0.25 ? 'open' : 'polo';
    if (S.vest) { L.vest = S.vest; L.neck = who === 'realtor' ? 'tie' : 'bow'; }
    if (S.apron) L.apron = S.apron;
    if (S.hardhat) { L.hat = 'hardhat'; L.hc = S.hardhat; }
    else if (S.fcap) { L.hat = 'cap'; L.hc = S.fcap; }
    else if (has('beanie')) { L.hat = 'beanie'; L.hc = S.hat || '#2a2a30'; }
    else if (has('cap')) { L.hat = 'cap'; L.hc = '#4e5a34'; }
    else if (S.hat) { L.hat = 'cap'; L.hc = S.hat; }
    if (has('headset')) { L.neck = 'headset'; L.top = 'hoodie'; L.hs = 'short'; }
    if (has('handheld')) L.hold = 'game';
    if (S.curlers) { L.face = 'curlers'; L.hs = 'short'; }
    if (S.mask) { L.face = 'mask'; L.top = 'tee'; L.bot = 'shorts'; }
    if (who === 'tanner') { L.top = 'flannel'; L.hs = 'short'; L.beard = 1; }
    if (who === 'cecil') { L.hs = 'messy'; }
    if (who === 'admin') { L.neck = 'lanyard'; L.hold = 'clip'; L.top = 'open'; }
    if (who === 'robe') { L.top = 'dress'; }
    if (!L.hat && !L.beard && age === 'adult' && /short|buzz|side|bald/.test(L.hs) && r() < 0.25) L.beard = r() < 0.4 ? 2 : 1;
    if (age === 'kid') L.blush = 1;
    const out = norm(L); FL.set(who, { S, L: out }); return out;
  }
  function folk(who, cx, by, t, dir, moving) {   // a FOLKS person at the indoor scale (bottom centre at cx, by)
    const L = folkLook(who); if (!L) return;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(cx, by - 1, L.age === 'kid' ? 6 : 8, 2.5, 0, 0, 6.29); ctx.fill();
    draw(L, 'i', cx, by, dir || 'down', moving ? walkFrame(t) : idleFrame(t, strHash(who) & 63));
  }
  // ---------- dogs, for the dog walkers: side view, two walk frames, wagging ----------
  const DOGS = new Map();
  function dog(c, d, x, by, left, f, moving) {
    const k = c + d; let e = DOGS.get(k);
    if (!e) { const W = 18, H = 13, cv = document.createElement('canvas'); cv.width = W * 4; cv.height = H; const g = cv.getContext('2d'), im = g.createImageData(W * 4, H), out = new Uint32Array(im.data.buffer), p = pal(c), q = pal(d);
      for (let fr = 0; fr < 2; fr++) { const px = new Uint32Array(W * H), put = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) px[y * W + x] = v; }, rect = (x, y, w, h, v) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(i, j, v); };
        const ay = H - 2; rect(4, ay - 6, 9, 4, p[1]); rect(4, ay - 6, 9, 1, p[0]); rect(4, ay - 3, 9, 1, p[2]);   // body
        rect(11, ay - 9, 5, 4, p[1]); rect(11, ay - 9, 4, 1, p[0]); put(16, ay - 7, p[1]); put(16, ay - 6, OUT); put(14, ay - 8, EYE); rect(11, ay - 10, 2, 3, q[1]); put(12, ay - 7, q[2]);   // head, nose, eye, ear
        rect(12, ay - 5, 2, 1, ci('#c83a3a'));   // collar
        const a = fr ? 1 : 0; rect(5 - a, ay - 2, 1, 3, q[1]); rect(7 + a, ay - 2, 1, 3, q[2]); rect(10 + a, ay - 2, 1, 3, q[1]); rect(12 - a, ay - 2, 1, 3, q[2]);   // legs
        rect(2, ay - 8 + fr, 2, 1, p[1]); put(3, ay - 7 + fr, p[1]);   // tail
        const o = outline(px, W, H);
        for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) { const v = o[y * W + xx]; if (!v) continue; out[y * W * 4 + fr * W + xx] = v; out[y * W * 4 + (2 + fr) * W + (W - 1 - xx)] = v; } }
      g.putImageData(im, 0, 0); e = { cv, W, H }; DOGS.set(k, e); }
    const fr = moving ? (f >> 3) & 1 : (f >> 4) & 1, col = (left ? 2 : 0) + fr;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x, by - 1, 6, 2, 0, 0, 6.29); ctx.fill();
    const s = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(e.cv, col * e.W, 0, e.W, e.H, Math.round(x - e.W / 2), Math.round(by) - (e.H - 2), e.W, e.H); ctx.imageSmoothingEnabled = s;
  }

  // ---------- the two kids in a trenchcoat (bars.js): a very tall coat, a kid's head on top, another peeking out ----------
  let TRENCH = null;
  function trench(x, by, f) {
    if (!TRENCH) { const W = 26, H = 46, cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H; const g = cv.getContext('2d'), im = g.createImageData(W * 2, H), out = new Uint32Array(im.data.buffer);
      const coat = pal('#b0905a'), skin = pal('#e2b48e'), hat = pal('#4a3c30');
      for (let fr = 0; fr < 2; fr++) { const px = new Uint32Array(W * H), put = (x, y, v) => { if (v && x >= 0 && y >= 0 && x < W && y < H) px[y * W + x] = v; }, rect = (x, y, w, h, v) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(i, j, v); };
        const ay = H - 3, cx = 13;
        rect(cx - 6, ay - 2, 5, 3, ci('#e8e8ea')); rect(cx - 6, ay, 5, 1, ci('#c83a3a')); rect(cx + 1, ay - 2, 5, 3, ci('#3a6ad8')); rect(cx + 1, ay, 5, 1, ci('#f0f0f4'));   // two pairs of sneakers
        rect(cx - 6, ay - 31, 12, 29, coat[1]); rect(cx - 6, ay - 31, 1, 29, coat[0]); rect(cx + 5, ay - 31, 1, 29, coat[2]); rect(cx, ay - 30, 1, 28, coat[2]); rect(cx - 6, ay - 3, 12, 1, coat[2]);   // the long coat
        rect(cx - 6, ay - 18, 12, 2, ci('#6a4a2a')); rect(cx - 1, ay - 18, 2, 2, ci('#d8b060'));   // the belt
        for (const b of [-28, -23, -13, -8]) { put(cx - 3, ay + b, ci('#4a3420')); put(cx + 2, ay + b, ci('#4a3420')); }
        rect(cx - 9, ay - 30, 3, 15, coat[1]); rect(cx + 6, ay - 30, 3, 15, coat[2]); rect(cx - 9, ay - 15, 3, 2, skin[1]); rect(cx + 6, ay - 15, 3, 2, skin[1]);   // sleeves, hands
        if (fr) { rect(cx - 3, ay - 25, 6, 3, skin[1]); put(cx - 2, ay - 24, EYE); put(cx + 1, ay - 24, EYE); }   // the kid on the bottom, peeking out
        rect(cx - 5, ay - 33, 3, 3, coat[0]); rect(cx + 2, ay - 33, 3, 3, coat[1]);   // collar up
        rect(cx - 4, ay - 40, 8, 8, skin[1]); rect(cx + 3, ay - 39, 1, 7, skin[2]); put(cx - 2, ay - 37, EYE); put(cx - 2, ay - 36, EYE); put(cx + 1, ay - 37, EYE); put(cx + 1, ay - 36, EYE); rect(cx - 3, ay - 34, 6, 1, ci('#3a2418'));   // the top kid, and the mustache
        rect(cx - 6, ay - 41, 12, 1, hat[2]); rect(cx - 4, ay - 44, 8, 3, hat[1]); rect(cx - 4, ay - 44, 2, 1, hat[0]); rect(cx - 4, ay - 42, 8, 1, ci('#1e1814'));   // the hat
        const o = outline(px, W, H); for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) if (o[y * W + xx]) out[y * W * 2 + fr * W + xx] = o[y * W + xx]; }
      g.putImageData(im, 0, 0); TRENCH = { cv, W, H }; }
    const s = Math.round(Math.sin(f / 20) * 1.4), fr = (f >> 6) % 4 !== 0 ? 1 : 0, sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, by - 1, 9, 2.5, 0, 0, 6.29); ctx.fill();
    ctx.drawImage(TRENCH.cv, fr * TRENCH.W, 0, TRENCH.W, TRENCH.H, Math.round(x) - 13 + s, Math.round(by) - (TRENCH.H - 3), TRENCH.W, TRENCH.H); ctx.imageSmoothingEnabled = sm;
  }
  return { draw, get, norm, folk, folkLook, dog, trench, walkFrame, idleFrame, C, rng, pick, strHash, cache: CACHE, stats: () => ({ looks: CACHE.size, made }) };
})();
