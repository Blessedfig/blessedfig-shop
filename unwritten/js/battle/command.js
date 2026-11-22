"use strict";
// =====================================================================
//  THE COMMAND MENU in battle (FF6's): STRIKE, the class's own command, UNDERSTAND, ITEM, GUARD, LEAVE.
//  Up and down choose; A picks; B goes back; LEFT and RIGHT on the first list switch between ready fighters.
// =====================================================================
function btMenuOpen(u) {
  BT.menu = { u, lvl: 'cmd', i: 0, list: [
    { t: SKILLS[u.C.strike].name, sk: u.C.strike }, { t: u.C.sig, sub: 'sig' }, { t: 'UNDERSTAND', sub: 'und' },
    { t: 'ITEM', sub: 'item' }, { t: 'GUARD', sk: 'guard' }, { t: 'LEAVE', sk: 'leave' }] };
  // Chrono Trigger's combos: shown when this fighter knows a part of one with someone in the fight
  if (combosFor(partyUnits().map(q => q.id)).some(k => COMBOS[k].who[u.id])) BT.menu.list.splice(3, 0, { t: 'COMBO', sub: 'combo' });
  if (u.lastCmdI != null) BT.menu.i = u.lastCmdI;   // FF6's cursor memory
}
function btSubList(u, sub) {
  if (sub === 'item') {
    return Object.keys(G.bag || {}).map(id => ({ id, d: battleItemDef(id) })).filter(x => x.d && x.d.battle)
      .map(x => ({ t: x.d.name, right: 'x' + G.bag[x.id], item: x.id, sk: x.d, ok: true, desc: x.d.desc }));
  }
  if (sub === 'combo') {
    return combosFor(partyUnits().map(q => q.id)).filter(k => COMBOS[k].who[u.id]).map(k => {
      const C = COMBOS[k], sk = Object.assign({ combo: 1, cid: k, anim: C.kind === 'phys' ? 'attack' : 'cast' }, C);
      const partners = Object.keys(C.who).filter(w => w !== u.id).map(w => partyUnits().find(q => q.id === w));
      const ready = partners.every(q => q && alive(q) && (q.ready || BT.ready.includes(q)));
      const afford = [u].concat(partners).every(q => q && (C.cost[q.id] || 0) <= q.cl && !((C.cost[q.id] || 0) && q.status.cliched));
      return { t: C.name, right: '+' + partners.map(q => q ? q.name : '?').join('+'), sk, partners, ok: ready && afford,
        desc: C.desc + (ready ? '' : '  (Everyone in it needs a full gauge.)') + (afford ? '' : '  (Not enough Clarity.)') };
    });
  }
  return memberSkills(u.id, sub).map(s => { const sk = SKILLS[s], c = skillCost(u, sk);
    return { t: sk.name, right: c ? c + ' CL' : '', sk, sid: s, ok: c <= u.cl && !(c && u.status.cliched), desc: sk.desc + (sk.seq ? '  ' + sk.seq.map(d => B_ARROW[d]).join(' ') : '') }; });
}
const B_ARROW = { up: '↑', down: '↓', left: '←', right: '→' };
function btMenuUpdate() {
  const m = BT.menu, u = m.u, nav = (n, k) => { if (pressed.up) { m[k] = (m[k] + n - 1) % n; snd('move'); } if (pressed.down) { m[k] = (m[k] + 1) % n; snd('move'); } };
  if (m.lvl === 'cmd') {
    nav(m.list.length, 'i');
    if ((pressed.left || pressed.right) && BT.ready.length > 1) { const k = BT.ready.indexOf(u); BT.ready.push(...BT.ready.splice(0, (k + 1) % BT.ready.length || 1)); BT.menu = null; snd('move'); return; }
    if (pressed.a) { const c = m.list[m.i]; u.lastCmdI = m.i; snd('ok');
      if (c.sk) return btToTarget(SKILLS[c.sk]);
      m.sub = c.sub; m.slist = btSubList(u, c.sub); m.si = 0; m.lvl = 'sub';
      if (!m.slist.length) { m.lvl = 'cmd'; bmsg(c.sub === 'item' ? 'Nothing to use.' : 'Nothing learned yet.'); } }
    return;
  }
  if (m.lvl === 'sub') {
    nav(m.slist.length, 'si');
    if (pressed.b) { m.lvl = 'cmd'; snd('back'); return; }
    if (pressed.a) { const e = m.slist[m.si]; if (!e.ok) { snd('no'); return; } snd('ok'); m.item = e.item || null; m.partners = e.partners || null;
      if (e.sk.pickSection) { m.secs = memberSections(u.id); m.ci = 0; m.lvl = 'sec'; return; }
      return btToTarget(e.sk); }
    return;
  }
  if (m.lvl === 'sec') {
    nav(m.secs.length, 'ci');
    if (pressed.b) { m.lvl = 'sub'; snd('back'); return; }
    if (pressed.a) { m.section = m.secs[m.ci]; snd('ok'); return btToTarget(SKILLS.recommend); }
    return;
  }
  if (m.lvl === 'tgt') {
    const L = m.tl;
    if (!m.all) { if (pressed.up || pressed.left) { m.ti = (m.ti + L.length - 1) % L.length; snd('move'); } if (pressed.down || pressed.right) { m.ti = (m.ti + 1) % L.length; snd('move'); } }
    if (pressed.b) { m.lvl = m.sk.pickSection ? 'sec' : m.fromSub ? 'sub' : 'cmd'; snd('back'); return; }
    if (pressed.a) { snd('ok'); btCommit(m.all ? L : [L[m.ti]]); }
  }
}
function btToTarget(sk) {
  const m = BT.menu, u = m.u; m.sk = sk; m.fromSub = m.lvl === 'sub' || m.lvl === 'sec';
  const T = sk.tgt;
  if (T === 'self') return btCommit([u]);
  let L = [], all = false;
  if (T === 'foe' || T === 'foes') { L = livingFoes(); all = T === 'foes'; }
  else if (T === 'ally' || T === 'allies') { L = livingParty(); all = T === 'allies'; }
  else if (T === 'down') { L = partyUnits().filter(p => p.status.dazed); if (!L.length) { bmsg('Nobody is down.'); return; } }
  else if (T === 'any_ally') L = partyUnits();
  else if (T === 'party_all') { L = partyUnits(); all = true; }
  if (!L.length) return;
  m.tl = L; m.all = all; m.lvl = 'tgt';
  m.ti = Math.max(0, L.indexOf(T.startsWith('foe') ? (u.lastFoe && L.includes(u.lastFoe) ? u.lastFoe : L[0]) : u));
}
function btCommit(tgts) {
  const m = BT.menu, u = m.u;
  if (tgts[0] && tgts[0].side === 'f') u.lastFoe = tgts[0];
  const partners = m.sk.combo ? m.partners : null;
  BT.queue.push({ u, sk: m.sk, tgts, item: m.item || null, section: m.section || null, partners });
  u.ready = 0; u.queued = 1; BT.ready = BT.ready.filter(r => r !== u); BT.menu = null;
  if (partners) for (const q of partners) { q.ready = 0; q.queued = 1; BT.ready = BT.ready.filter(r => r !== q); }
}
function snd(k) { if (typeof SND !== 'undefined') SND.play(k); }
