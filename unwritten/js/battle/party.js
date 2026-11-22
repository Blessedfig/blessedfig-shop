"use strict";
// =====================================================================
//  THE PARTY: who fights, their levels and Understanding, attributes from every source, gear, what they have learned,
//  and HP and Clarity between fights. Saved in G.party.
//  A stat is built in layers, always in this order:
//    class base + growth per level  ->  level-up picks (bonus)  ->  training at UMA (train, capped)  ->  deriveStats()
//    ->  gear and bookmarks (mods)  ->  in battle, statuses (engine.js S()).
// =====================================================================
const PARTY_CFG = { atb: 'wait', speed: 3, timing: 'on', roll: 1, challenge: 'medium', msg: 2 };
function partyEnsure() {
  if (!G) return null;
  if (!G.party) G.party = { v: 1, m: {}, order: [], cfg: {}, best: {}, pages: 0 };
  const P = G.party;
  P.cfg = Object.assign({}, PARTY_CFG, P.cfg || {});
  for (const id of Object.keys(CLASSES)) if (!P.m[id]) P.m[id] = { lv: 1, und: 0, hp: null, cl: null, row: CLASSES[id].row,
    gear: Object.assign({ hand: null, body: null, m1: null, m2: null }, CLASSES[id].start), bonus: {}, train: {}, picks: [], extra: {}, sections: {} };
  // who has joined: the three you can play start in; Cecil, Daniel and Vox join where they live (hooks.js). The one you play leads.
  // the lead: the custom hero (a boy or girl look), or, in an older save, whoever was picked then
  const lead = G.kid && CLASSES[G.kid.g] && G.kid.g !== 'hero' ? G.kid.g : 'hero';
  if (!P.joined) { P.joined = {}; P.joined[lead] = 1; }
  if (!P.order.length) P.order = [lead];
  for (const id in P.joined) if (P.joined[id] && !P.order.includes(id)) P.order.push(id);
  P.order = P.order.filter(id => P.joined[id] && CLASSES[id]);
  if (!P.gave) { P.gave = 1; G.bag = G.bag || {}; G.bag.letter = (G.bag.letter || 0) + 2; G.bag.figcookie = (G.bag.figcookie || 0) + 3; }   // Christian's starter: two letters, three cookies (stand-in)
  return P;
}
function pcfg() { return (G && G.party && G.party.cfg) || PARTY_CFG; }
function memberName(id) { return id === 'hero' ? String((G.kid && G.kid.name) || 'PLAYER').toUpperCase().slice(0, 10) : CLASSES[id].name; }
function atBase() { return mode === 'inside' && G.inside && /^(main|up|base)$/.test(G.inside.f); }   // the Fig Tree: the party's home
function partyIds() { return partyEnsure().order.slice(0, 3); }   // the three who fight: the first three in ORDER
function partyJoin(id) { const P = partyEnsure(); if (!CLASSES[id] || P.joined[id]) return false; P.joined[id] = 1; P.order.push(id); saveGame(); return true; }
function partyHas(id) { return !!(G && G.party && G.party.joined && G.party.joined[id]); }
// combos: which ones these members could do (each knows their part); ready-ness is checked in battle
function combosFor(ids) {
  return Object.keys(COMBOS).filter(k => { const C = COMBOS[k], who = Object.keys(C.who); return who.every(w => ids.includes(w) && memberSkills(w).includes(C.who[w])); });
}
function teamBonuses(ids) { return TEAMS.filter(t => t.need.every(id => ids.includes(id))); }
function memberAttrs(id) {
  const C = CLASSES[id], M = G.party.m[id], a = {};
  for (const k of ATTRS) a[k] = Math.floor(C.base[k] + C.grow[k] * (M.lv - 1)) + (M.bonus[k] || 0) + Math.min(RULES.statCapTrain, M.train[k] || 0);
  return a;
}
function applyMod(st, m) { if (m.add) st[m.s] += m.add; if (m.mul) st[m.s] = Math.round(st[m.s] * m.mul); }
function memberStats(id) {
  const M = G.party.m[id], st = deriveStats(memberAttrs(id), M.lv);
  for (const s of ['hand', 'body', 'm1', 'm2']) { const d = GEAR[M.gear[s]]; if (d && d.mods) d.mods.forEach(m => applyMod(st, m)); }
  return st;
}
function memberFlags(id) {   // the rule-bending bookmarks: flags the engine reads, and statuses they block
  const M = G.party.m[id], flags = {}; let blocks = [];
  for (const s of ['m1', 'm2']) { const d = GEAR[M.gear[s]]; if (!d) continue; if (d.flag) flags[d.flag] = 1; if (d.blocks === 'all') blocks = 'all'; else if (d.blocks && blocks !== 'all') blocks = blocks.concat(d.blocks); }
  return { flags, blocks };
}
function partyFlag(f) { return partyIds().some(id => memberFlags(id).flags[f]); }
function hpOf(id) { const M = G.party.m[id], mx = memberStats(id).hpMax; return M.hp == null ? mx : Math.max(0, Math.min(M.hp, mx)); }
function clOf(id) { const M = G.party.m[id], mx = memberStats(id).clMax; return M.cl == null ? mx : Math.max(0, Math.min(M.cl, mx)); }
// ---------- what each one knows ----------
function memberSkills(id, menu) {
  const C = CLASSES[id], M = G.party.m[id], out = [];
  const add = s => { if (SKILLS[s] && !out.includes(s)) out.push(s); };
  if (!menu || menu === 'und') UND_LEARN.forEach(([lv, s]) => { if (M.lv >= lv) add(s); });
  if (!menu || menu === 'sig') { C.learn.forEach(([lv, s]) => { if (M.lv >= lv) add(s); }); Object.keys(M.extra || {}).forEach(s => { if (SKILLS[s] && SKILLS[s].menu === 'sig') add(s); });
    if (id === 'christian') { const sec = memberSections(id); Object.keys(SKILLS).forEach(s => { if (SKILLS[s].section && sec.includes(SKILLS[s].section)) add(s); }); } }
  return out;
}
function memberSections(id) { const M = G.party.m[id]; return Object.keys(SECTIONS).filter(k => M.lv >= SECTION_LV[k] || (M.sections && M.sections[k])); }
function skillCost(u, sk) { const c = sk.cost || 0; return u && u.flags && u.flags.halfCost ? Math.ceil(c / 2) : c; }
// ---------- Understanding and levels ----------
// gives n Understanding to one member; returns [{lv, learned:[names]}] for each new level
function giveUnd(id, n) {
  const M = G.party.m[id], before = M.lv, beforeSk = memberSkills(id), beforeSec = memberSections(id);
  M.und = Math.max(0, M.und + Math.round(n)); M.lv = Math.min(RULES.levelCap, levelOf(M.und));
  const out = [];
  for (let L = before + 1; L <= M.lv; L++) out.push({ lv: L });
  if (out.length) {
    out.forEach(() => M.picks.push(CLASSES[id].pick));   // a pick waits for each level (the default is the class's own)
    const nowSk = memberSkills(id).filter(s => !beforeSk.includes(s)).map(s => SKILLS[s].name);
    const nowSec = memberSections(id).filter(s => !beforeSec.includes(s)).map(s => SECTIONS[s] + ' (to RECOMMEND)');
    out[out.length - 1].learned = nowSk.concat(nowSec);
  }
  return out;
}
function applyPick(id, k) { const M = G.party.m[id], d = LEVEL_PICKS[k]; if (!d) return; for (const a in d.add) M.bonus[a] = (M.bonus[a] || 0) + d.add[a]; }
// Understanding found outside battle (a true thing learned in town, a page of a book): everyone in the party grows
function partyLearn(n, why) {
  partyEnsure(); const lines = [];
  for (const id of Object.keys(G.party.joined)) { const r = giveUnd(id, n); if (r.length) lines.push(memberName(id) + ' reached level ' + G.party.m[id].lv + '.'); }
  return lines;
}
// ---------- healing between fights ----------
function partyRestore() { partyEnsure(); for (const id of Object.keys(G.party.m)) { const M = G.party.m[id]; M.hp = null; M.cl = null; } }
function partyHealPct(p, clarityToo) {
  partyEnsure();
  for (const id of partyIds()) { const M = G.party.m[id], st = memberStats(id);
    M.hp = Math.min(st.hpMax, hpOf(id) + Math.round(st.hpMax * p)); if (M.hp >= st.hpMax) M.hp = null;
    if (clarityToo) { M.cl = Math.min(st.clMax, clOf(id) + Math.round(st.clMax * p)); if (M.cl >= st.clMax) M.cl = null; } }
}
// ---------- equipping ----------
function canEquip(id, gid) { const d = GEAR[gid]; return !!d && (!d.who || d.who.includes(id)); }
function equip(id, slot, gid) {   // gid null = take it off; gear lives in the bag (G.bag) when not worn
  const M = G.party.m[id], old = M.gear[slot];
  if (gid && !bagTake(gid)) return false;
  if (old) bagAdd(old);
  M.gear[slot] = gid || null; M.hp = Math.min(hpOf(id), memberStats(id).hpMax); M.cl = Math.min(clOf(id), memberStats(id).clMax);
  return true;
}
// ---------- the bestiary ----------
function bestNote(fid) { partyEnsure(); return G.party.best[fid] || (G.party.best[fid] = { seen: 0, freed: 0, und: 0, weak: {}, res: {}, need: 0, scan: 0 }); }
