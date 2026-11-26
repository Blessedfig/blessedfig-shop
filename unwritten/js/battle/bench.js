"use strict";
// =====================================================================
//  THE BENCH (Nov 26, from the JRPG books): nobody falls behind for waiting at the Fig Tree.
//  - Chrono Trigger gives members who sit out 75% of the experience; here they get 75% of the Understanding.
//  - FFVI brings a new recruit in at the party's level; here a new member starts at the average Understanding of
//    everyone already in the party (their level-up picks wait in the menu as usual).
//  Summons (the City Administrator) are not party members and are skipped.
// =====================================================================
const BENCH_SHARE = 0.75;
const benchSkip = id => id === 'admin' || !CLASSES[id] || CLASSES[id].summon;
{ const _pj = partyJoin; partyJoin = function (id) {
  const before = G && G.party ? Object.keys(G.party.joined || {}).filter(k => !benchSkip(k) && k !== id && G.party.m[k]) : [];
  const r = _pj.apply(this, arguments);
  if (r && !benchSkip(id) && before.length && G.party.m[id]) {
    const avg = before.reduce((s, k) => s + G.party.m[k].und, 0) / before.length;
    if (avg > G.party.m[id].und) { giveUnd(id, avg - G.party.m[id].und); saveGame(); }
  }
  return r;
}; }
{ const _bw = battleWon; battleWon = function () {
  let und = 0;
  if (BT && !BT.practice) for (const u of foeUnits()) { const f = u.f; let x = RULES.foeUnd(f.lv, f.boss); if (u.understood) x *= RULES.understoodBonus; und += x; }
  const r = _bw.apply(this, arguments);
  if (und > 0 && BT && G && G.party) {
    const fought = new Set(partyUnits().map(u => u.id));
    const bench = Object.keys(G.party.joined || {}).filter(id => !fought.has(id) && !benchSkip(id) && G.party.m[id]);
    for (const id of bench) {
      const x = Math.round(und * BENCH_SHARE), ups = giveUnd(id, x);
      BT.res.push(memberName(id) + ' (at the Fig Tree) +' + x + ' UNDERSTANDING');
      for (const L of ups) { BT.res.push(memberName(id) + ' reached level ' + L.lv + '!'); BT.picks.push(id); }
    }
  }
  return r;
}; }
