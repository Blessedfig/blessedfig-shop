"use strict";
// ---------- Friends drawn for the game (Nov 13): Christian asked for Cecil (Respawn Gaming Lounge) and Tanner (in the
// store) to be drawn in the game's pixel style until he has sprites for them. First names only; generic looks, not
// likenesses — Christian can describe them and these get matched or replaced. ----------
const FOLKS = {
  cecil: { skin: '#e2b48e', hair: '#3a2a20', shirt: '#2c2f3a', shirt2: '#3c4050', pants: '#3a4a6a', shoes: '#e8e8ea', extra: 'headset' },
  tanner: { skin: '#ecc19c', hair: '#6a4a2a', shirt: '#a8322a', shirt2: '#1e1a1a', pants: '#8a7a58', shoes: '#5a3a24', extra: 'cap' },
};
// Nov 22: drawn by the people generator (sprites.js) at the indoor scale, about 34 px tall. dir and moving are optional
// ('down' and standing by default); the outfit record's colours and extras pick the parts.
function drawFolk(who, cx, by, t, dir, moving) { SPR.folk(who, cx, by, t, dir, moving); }
// Several files wrapped drawFolk with overlays sized for the old 40 px body (hard hats, vests and bow ties, aprons,
// glasses, crew caps, curlers, the snorkel mask, the admin's tie and clipboard, a smaller scale for kids). Those are
// parts of the generator now, so once every script has run the plain version goes back in, ahead of the old wrappers.
// The neighbours outside (npcs.js) and anyone in FOLKS standing outdoors get the generator too, at the outdoor scale;
// party members standing in town keep their own frames.
const NPC_LOOK = {   // Jeremy and his two girls on Clermont Street: generic looks, not likenesses
  dad: { age: 'adult', skin: '#e2b48e', hair: '#5a3a24', hs: 'short', top: 'jacket', c1: '#3a5a7a', c2: '#d8d4cc', pc: '#3a4458', sh: '#5a3a24', beard: 2 },
  big: { age: 'kid', skin: '#ecc19c', hair: '#8a5a2a', hs: 'ponytail', top: 'tee', c1: '#e86aa0', c2: '#f0d040', pc: '#5a8ab0', sh: '#e8e8ea', blush: 1 },
  small: { age: 'kid', skin: '#ecc19c', hair: '#8a5a2a', hs: 'bob', top: 'dress', c1: '#8a5ad8', c2: '#f0d040', pc: '#8a5ad8', sh: '#e86aa0', blush: 1 } };
function npcStep(n, seed) { return n.t > 0.3 ? (((n.x + n.y) & 1) ? 1 : 2) : n.t > 0 ? 0 : SPR.idleFrame(frame, seed); }
document.addEventListener('DOMContentLoaded', () => {
  drawFolk = function (who, cx, by, t, dir, moving) { SPR.folk(who, cx, by, t, dir, moving); };
  if (typeof drawNpc === 'function') { const _dn = drawNpc; drawNpc = function (p) {
    const n = p.n; if (typeof KID_META !== 'undefined' && KID_META[n.g] && n.g !== 'dad') return _dn(p);
    let L = null; if (NPC_LOOK[n.g]) L = NPC_LOOK[n.g].k ? NPC_LOOK[n.g] : (NPC_LOOK[n.g] = SPR.norm(NPC_LOOK[n.g])); else if (FOLKS[n.g]) L = SPR.folkLook(n.g);
    if (!L) return _dn(p);
    const x = Math.round(p.x * T), y = Math.round(p.y * T) - 1;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, y - 1, L.age === 'kid' ? 5 : 7, 2.5, 0, 0, 6.29); ctx.fill();
    SPR.draw(L, 'o', x, y, n.dir || 'down', npcStep(n, n.hx || 0)); }; }
});
