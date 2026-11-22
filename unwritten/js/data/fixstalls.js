// Hand-traced parking stalls (Nov 19): for each lot in clearStallLots (indices into TOWN.PK) the automatic stall lines
// inside it are removed, then the hand-traced dividers in stalls ([x1,y1,x2,y2] in decimetres, game frame) are added.
(function () {
  const inside = (Q, x, y) => { let c = false; for (let i = 0, j = Q.length - 2; i < Q.length; j = i, i += 2) { const xi = Q[i], yi = Q[i + 1], xj = Q[j], yj = Q[j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  for (const f of FIXQ) {
    const lots = (f.clearStallLots || []).map(i => TOWN.PK[i]).filter(Boolean);
    if (lots.length) for (let i = STALLS.length - 1; i >= 0; i--) { const s = STALLS[i], mx = (s[0] + s[2]) / 20, my = (s[1] + s[3]) / 20; if (lots.some(Q => inside(Q, mx, my))) STALLS.splice(i, 1); }
    STALLS.push(...(f.stalls || []));
  }
})();
