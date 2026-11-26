"use strict";
// =====================================================================
//  OUTGROWN (Nov 26, EarthBound): when the party has clearly outgrown a common story, the fight is skipped and the
//  result shows at once ("YOU WIN!" in EarthBound), with the full Understanding. Never for bosses, practice fights
//  or forced fights. Rule: every party member is at least 6 levels above the strongest foe.
//  It counts as understood: a story that far below you holds no surprises.
// =====================================================================
const OUTGROWN_GAP = 6;
{ const _bs = battleStart; battleStart = function (form, opt) {
  const r = _bs.apply(this, arguments);
  try {
    if (!BT || BT.practice || BT.boss || BT.noEscape || (opt && opt.noSkip)) return r;
    const foes = foeUnits(); if (!foes.length || foes.some(u => u.f.boss)) return r;
    const top = Math.max(...foes.map(u => u.f.lv)), low = Math.min(...partyIds().map(id => G.party.m[id].lv));
    if (low < top + OUTGROWN_GAP) return r;
    for (const u of foes) { u.understood = 1; freeFoe(u); }
    BT.msgs = []; BT.msg = null;
    battleWon();
    BT.res.unshift('YOU WIN! This story is one you have outgrown.');
  } catch (e) {}
  return r;
}; }
