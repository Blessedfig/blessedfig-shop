"use strict";
// =====================================================================
//  THE STORE FILLS UP (Nov 26, Suikoden's headquarters; Persona 4's Junes): whoever has joined but isn't in the three
//  waits on the Fig Tree's main floor, each at their own spot. They are solid, and A talks to them: a line, and a way
//  to change who comes along. Lines are stand-ins until Christian writes them.
// =====================================================================
const BASE_SPOTS = {
  danny:  { x: 6, y: 4,  dir: 'left',  line: 'Stretching out while I wait. Say the word and I\'m in.' },
  cecil:  { x: 2, y: 15, dir: 'right', line: 'Found a box of old strategy guides in the used section. Don\'t tell Christian I\'m reading them for free.' },
  daniel: { x: 5, y: 14, dir: 'left',  line: 'This place has better light than the projection booth.' },
  vox:    { x: 1, y: 22, dir: 'right', line: 'One more chapter. Okay, two. Tap me in when you need a voice.' },
  robin:  { x: 6, y: 22, dir: 'left',  line: 'The Robin hops along the shelf edge, reading spines.' },
};
function baseWaiting() {
  if (!(typeof isRPG === 'function' && isRPG()) || !G || !G.party || !G.inside || G.inside.f !== 'main') return [];
  const out = partyIds();
  return Object.keys(BASE_SPOTS).filter(id => partyHas(id) && !out.includes(id)).map(id => Object.assign({ id }, BASE_SPOTS[id]));
}
function insideChars(chars, ox, oy) {
  for (const w of baseWaiting()) chars.push({ y: w.y, draw: () => {
    const sx = Math.round(ox + w.x * IT + IT / 2), sy = Math.round(oy + w.y * IT + IT - 1);
    R(sx - 7, sy - 3, 14, 4, 'rgba(0,0,0,.25)');
    const C = CLASSES[w.id], art = C && C.art || '';
    if (art.startsWith('folk:')) drawFolk(art.slice(5), sx, sy, frame, w.dir, false);
    else kidFrame(w.id, w.dir, 0, sx, sy);
  } });
}
{ const _ff = figFree; figFree = function (x, y) { if (baseWaiting().some(w => w.x === x && w.y === y)) return false; return _ff(x, y); }; }
{ const _fl = figLook; figLook = function (x, y) {
  const w = baseWaiting().find(q => q.x === x && q.y === y);
  if (!w) return _fl(x, y);
  const who = memberName(w.id), name = w.id === 'robin' ? '' : who.charAt(0) + who.slice(1).toLowerCase();
  return ask((name ? name + ': ' : '') + w.line, [{ t: 'Who comes along?', f: () => { pmOpen('inside'); pmOrder(); } }, { t: 'See you in a bit' }]);
}; }
