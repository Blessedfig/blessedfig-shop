"use strict";
// =====================================================================
//  THE RULES. Every number the battle system uses lives here, so balance is tuned in one file.
//  Pieces, in the order they load:
//    rules.js      numbers and formulas (this file)
//    data_core.js  attributes, statuses, skills, items, gear, bookmarks, the three classes
//    data_foes.js  the monsters, their AI and formations (generated; edit freely)
//    party.js      the party: levels, stats from every source, gear, learning, healing
//    engine.js     the battle: the time gauges, turns, effects, AI, timed presses, rewards
//    view.js       drawing: backdrops, sprites, windows, numbers, prompts; the art slots
//    menu.js       the field menu (items, skills, equip, status, order, bestiary, config, save) and the Battle Lab
//    hooks.js      where the system meets the town: encounters, rests, food, shelves
//  The research behind the numbers: reports/JRPG systems depth and art direction.md (FF6, Chrono Trigger,
//  EarthBound, Dragon Quest, Super Mario RPG, Octopath Traveler, Sea of Stars). notes/battle-system.md says how to add things.
// =====================================================================
const RULES = {
  // ---- levels: "leveling by understanding". Total Understanding to reach level L; L20 = 11,722 (report curve), cap 50.
  levelCap: 50,
  need: L => L <= 1 ? 0 : Math.round(10 * Math.pow(L - 1, 2.4)),
  // a freed foe pays about a ninth of the gap at its level; a boss about 40% of a level (report)
  foeUnd: (L, boss) => Math.max(4, Math.round((boss ? 9.6 : 2.7) * Math.pow(L, 1.4))),
  foePages: (L, boss) => (boss ? 3 : 1) + Math.floor(L / 6),
  understoodBonus: 1.5,            // freed with understanding (a weakness, OPEN, or the right book) pays +50%
  // ---- the time gauges (FF6's Active Time Battle). A gauge fills to 1000; fill per frame = (SPD + 25) x speed.
  atbFull: 1000,
  atbSpeed: [0.12, 0.16, 0.21, 0.27, 0.35, 0.46],   // CONFIG battle speed 1-6 (3 = default: SPD 10 acts about every 2.2 s)
  atbFill: (spd, sp) => (spd + 25) * RULES.atbSpeed[Math.max(1, Math.min(6, sp)) - 1],
  atbStart: () => 150 + Math.random() * 350,        // gauges start part-filled, as in FF6
  firstStrike: 1000,                                // approached from behind: the party starts full (EarthBound, CT)
  // ---- damage: one formula for everything. P = the skill's power, A = attack (ATK or MAG), D = defense (DEF or RES).
  //      (P + A) x A / (A + D): never negative, about (P + A) / 2 when A = D, and it scales smoothly with levels.
  variance: 0.1,
  mult: { weak: 1.5, resist: 0.5, open: 1.5, crit: 1.5, guard: 0.5, backRow: 0.5, focused: 1.5, softened: 0.6 },
  critChance: u => Math.min(0.25, 0.02 + u.st.crit / 100),
  hitChance: (u, t, kind) => kind === 'mind' ? 1 : Math.max(0.3, Math.min(1, (u.st.acc - t.st.eva) / 100)),
  // ---- timed presses (Super Mario RPG, Sea of Stars). Windows are frames either side of the moment (60 per second).
  timed: { good: 1.2, great: 1.5, block: 0.6, blockGreat: 0.4, win: 7, winGreat: 3, seqFrames: 110, beat: 26, mashFrames: 100 },
  // ---- break (Octopath): weakness hits wear down a foe's guard pips; at zero it is OPEN for one of its turns.
  openTurns: 1,
  // ---- challenge (OPTIONS). MEDIUM: a common foe takes two or three rounds, a boss six or more (Christian, Nov 9).
  challenge: { gentle: { hp: 0.75, dmg: 0.75, healAfter: true }, medium: { hp: 1, dmg: 1 }, hard: { hp: 1.3, dmg: 1.25 } },
  partyScale: n => 0.45 + 0.55 * Math.min(3, n) / 3,   // foes grow with the number of allies fighting
  // ---- EarthBound's rolling meter: a hit rolls HP down over time, so a quick heal can still save someone
  rollRate: u => Math.max(1, u.st.hpMax / 100),
  // ---- the rest
  fleeChance: (pSpd, fSpd) => Math.max(0.2, Math.min(0.95, 0.55 + (pSpd - fSpd) / 40)),
  autoFreeGap: 5,                // contact with a foe this many levels below the party frees it at once (EarthBound)
  itemCap: 9,                    // carry at most 9 of a battle item, so choices stay alive (report)
  statCapTrain: 12,              // training at UMA adds at most +12 to an attribute (body stats report, "Rooted")
};
// the damage roll, used by every damaging effect. M: all multipliers already combined.
function dmgRoll(P, A, D, M) {
  A = Math.max(1, A); D = Math.max(0, D);
  const base = (P + A) * A / (A + D), v = 1 + (Math.random() * 2 - 1) * RULES.variance;
  return Math.max(1, Math.round(base * M * v));
}
function healRoll(P, A, M) { return Math.max(1, Math.round((P + A * 0.75) * (M || 1) * (1 + (Math.random() * 2 - 1) * 0.05))); }
function levelOf(und) { let L = 1; while (L < RULES.levelCap && und >= RULES.need(L + 1)) L++; return L; }
