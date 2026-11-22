"use strict";
// =====================================================================
//  CORE DATA: attributes, statuses, skills, items, gear, bookmarks and the three classes.
//  Everything here is plain data. A skill or item is a list of EFFECT PIECES (engine.js, FX), so a new one is
//  usually one line: pick a target, a cost, and the pieces. See notes/battle-system.md.
// =====================================================================

// ---------- attributes (the seven from the body-stats report; Danny's training at UMA raises the body ones) ----------
const ATTRS = ['STR', 'STA', 'AGI', 'DEX', 'INT', 'WIS', 'CHA'];
const ATTR_INFO = {
  STR: 'STRENGTH. Physical power: STRIKE and techniques.', STA: 'STAMINA. Hit points and physical defense.',
  AGI: 'AGILITY. Speed (how fast the time gauge fills) and evasion.', DEX: 'DEXTERITY. Accuracy and critical hits.',
  INT: 'INTELLECT. Power of the understanding commands.', WIS: 'WISDOM. Clarity, and defense of the mind.',
  CHA: 'CHARISMA. Healing, cheers, and resisting statuses.' };
// derived stats from attributes and level (one place; party.js adds gear, bookmarks and statuses on top)
function deriveStats(a, L) {
  return {
    hpMax: 24 + 6 * L + 3 * a.STA,          // HP: how much a hit can take
    clMax: 6 + 2 * L + a.WIS + (a.INT >> 1), // CLARITY: spent on understanding commands (the game's MP)
    atk: a.STR + L,                          // ATK: physical power
    mag: a.INT + (a.CHA >> 1) + L,           // MAG: power of the mind commands
    def: a.STA + (a.AGI >> 2) + (L >> 1),    // DEF: against physical hits
    res: a.WIS + (a.CHA >> 2) + (L >> 1),    // RES: against hits to the mind
    heal: a.CHA + (a.WIS >> 1) + L,          // HEAL: power of healing
    spd: 4 + a.AGI,                          // SPD: fills the time gauge
    acc: 92 + a.DEX,                         // ACC and EVA: hit chance is ACC - EVA (physical only)
    eva: 2 + (a.AGI >> 1),
    crit: 2 + (a.DEX >> 2),                  // CRIT: % chance, capped at 25
    sres: a.WIS + a.CHA,                     // SRES: % chance to shrug off a status, capped at 60
  };
}
const STAT_LABEL = { hpMax: 'HP', clMax: 'CLARITY', atk: 'ATK', mag: 'MAG', def: 'DEF', res: 'RES', heal: 'HEAL', spd: 'SPD', acc: 'ACC', eva: 'EVA', crit: 'CRIT', sres: 'SRES' };

// ---------- aspects (the battle's "elements"): what a command does to a story. Foes are weak to some, resist others. ----------
const ASPECTS = {
  force: 'FORCE', question: 'QUESTION', listen: 'LISTEN', name: 'NAME IT', reflect: 'REFLECT', step: 'STEP BACK',
  cite: 'CITE', aloud: 'READ ALOUD', hold: 'HOLD BOTH', book: 'THE RIGHT BOOK' };

// ---------- statuses. Hooks the engine reads: turns, skip, wakeOnHit, auto, noCost, atb, mods, tick, dmgIn, oneHit... ----------
// Every status clears after battle (report: statuses never punish a returning visitor). Each bad one has a cure.
const STATUSES = {
  dazed:    { name: 'DAZED', bad: 1, col: '#8a8a9a', perm: 1, desc: 'Down. Cannot act. A Friend\'s Letter or a cheer brings them back.' },
  dread:    { name: 'DREAD', bad: 1, col: '#9a5ac8', turns: 4, tick: { hpPct: -0.08 }, desc: 'Loses HP each turn until it is named (NAME IT) or cured.' },
  absorbed: { name: 'ABSORBED', bad: 1, col: '#5a8ac8', turns: 2, skip: 1, wakeOnHit: 1, desc: '"Just one more chapter." Loses turns until hit or two turns pass.' },
  hooked:   { name: 'HOOKED', bad: 1, col: '#c85a5a', turns: 2, auto: 'strike', desc: 'Swings at whatever hooked it, on its own.' },
  fogged:   { name: 'FOGGED', bad: 1, col: '#8a9aa8', turns: 3, mods: [{ s: 'acc', add: -40 }], desc: 'Physical hits often miss.' },
  cliched:  { name: 'CLICHED', bad: 1, col: '#c8a85a', turns: 3, noCost: 1, desc: 'Stock phrases only: no command that costs Clarity.' },
  slowed:   { name: 'SLOWED', bad: 1, col: '#6a6a8a', turns: 3, atb: 0.5, desc: 'The time gauge fills at half speed.' },
  shaken:   { name: 'SHAKEN', bad: 1, col: '#a87a5a', turns: 3, mods: [{ s: 'atk', mul: 0.75 }, { s: 'mag', mul: 0.75 }], desc: 'ATK and MAG down a quarter.' },
  steady:   { name: 'STEADY', col: '#5ac87a', turns: 4, mods: [{ s: 'def', mul: 1.4 }], desc: 'DEF up 40%.' },
  clear:    { name: 'CLEAR', col: '#5ac8c8', turns: 4, mods: [{ s: 'res', mul: 1.4 }], desc: 'RES up 40%.' },
  quick:    { name: 'QUICK', col: '#e8d85a', turns: 3, atb: 1.5, desc: 'The time gauge fills half again as fast.' },
  rested:   { name: 'RESTED', col: '#7ad87a', turns: 4, tick: { hpPct: 0.06 }, desc: 'Gets back a little HP each turn.' },
  pumped:   { name: 'PUMPED', col: '#e87a5a', turns: 3, mods: [{ s: 'atk', mul: 1.25 }, { s: 'mag', mul: 1.25 }], desc: 'ATK and MAG up a quarter.' },
  distance: { name: 'DISTANCE', col: '#a8c8e8', turns: 2, mods: [{ s: 'eva', add: 30 }], desc: 'A step back: much harder to hit.' },
  guarding: { name: 'GUARD', col: '#c8c8c8', turns: 1, dmgIn: 0.5, desc: 'Takes half damage until its next turn.' },
  focused:  { name: 'FOCUSED', col: '#f0f0a0', oneHit: 'out', desc: 'The next damaging action hits half again as hard.' },
  softened: { name: 'SOFTENED', col: '#d8b8e8', oneHit: 'outFoe', desc: 'Its next blow lands softer (it was listened to).' },
  based:    { name: 'BASE', col: '#d8a85a', turns: 2, counter: 'force', desc: 'Set and balanced: answers the next physical hit with a counter.' },
  covered:  { name: 'SPOTTED', col: '#a8d8a8', turns: 3, desc: 'Someone has their back: hits to them go to the spotter.' },
  open:     { name: 'OPEN', col: '#ffffff', foe: 1, desc: 'Its guard is down: it loses its next turn and takes more from everything.' },
};

// ---------- the understanding command lines (v0.36, kept) ----------
const LINES = {
  question: ['You ask: is that actually true, or just well told?', 'You ask: who decided that?', 'You notice the story skipping the boring, true parts.', 'You ask: what would you say to a friend who felt this?'],
  reflect: ['You breathe. Feet on the floor. You remember who you are.'],
  stepback: ['You step back and see the whole frame, not just the picture.'],
};

// ---------- skills. tgt: foe, foes, ally, allies, self, down (a dazed ally). kind: phys or mind. menu: where it shows.
//  fx pieces (engine.js FX): 'dmg', {k:'heal',p}, {k:'clarity',n,to}, {k:'status',id,ch,to}, {k:'cure',ids,to},
//  {k:'revive',pct}, {k:'scan'}, {k:'atb',n}, {k:'dispel'}, {k:'brk',n}, {k:'weakOnly',p}, {k:'pierce',pct}, {k:'cover'}
const SKILLS = {
  // ---- the main row
  strike_ch: { name: 'STRIKE', tgt: 'foe', kind: 'phys', aspect: 'force', power: 6, timed: 'strike', anim: 'attack', fx: ['dmg'], desc: 'A plain hit. Press A as it lands for more.' },
  strike_dn: { name: 'STRIKE', tgt: 'foe', kind: 'phys', aspect: 'force', power: 8, timed: 'strike', anim: 'punch', fx: ['dmg'], desc: 'A clean jab. Press A as it lands for more.' },
  strike_rb: { name: 'STRIKE', tgt: 'foe', kind: 'phys', aspect: 'force', power: 4, hits: 2, timed: 'strike', anim: 'attack', fx: ['dmg'], desc: 'Two quick wing hits. Press A as each lands.' },
  guard:     { name: 'GUARD', tgt: 'self', anim: 'idle', quiet: 1, fx: [{ k: 'status', id: 'guarding', to: 'self' }], desc: 'Half damage until your next turn.' },
  leave:     { name: 'LEAVE', tgt: 'self', anim: 'run', quiet: 1, fx: [{ k: 'flee' }], desc: 'Try to get out of the story. Not from the big ones.' },
  // ---- UNDERSTAND (everyone; the "practice" commands). Each is aimed at a foe; foes are weak to some of them.
  question:  { name: 'QUESTION', menu: 'und', tgt: 'foe', kind: 'mind', aspect: 'question', power: 9, anim: 'cast', lines: 'question', fx: ['dmg'], desc: 'Doubt the story. Free.' },
  listen:    { name: 'LISTEN', menu: 'und', tgt: 'foe', aspect: 'listen', anim: 'idle', fx: [{ k: 'clarity', n: 3, to: 'self' }, { k: 'status', id: 'softened', to: 'tgt' }, { k: 'weakOnly', p: 16 }], desc: 'Hear what is under it: +3 Clarity, its next blow lands softer. Free.' },
  nameit:    { name: 'NAME IT', menu: 'und', cost: 3, tgt: 'foe', kind: 'mind', aspect: 'name', power: 20, anim: 'cast', fx: ['dmg', { k: 'cure', ids: ['dread'], to: 'party' }], desc: 'See it clearly and say what it is. Ends DREAD.' },
  reflect:   { name: 'REFLECT', menu: 'und', cost: 2, tgt: 'foe', aspect: 'reflect', anim: 'cast', lines: 'reflect', fx: [{ k: 'heal', p: 14, to: 'self' }, { k: 'weakOnly', p: 18 }], desc: 'Steady yourself (heal) while you look at it.' },
  stepback:  { name: 'STEP BACK', menu: 'und', cost: 2, tgt: 'foe', aspect: 'step', anim: 'idle', lines: 'stepback', fx: [{ k: 'status', id: 'distance', to: 'self' }, { k: 'cure', ids: ['absorbed', 'hooked'], to: 'self' }, { k: 'weakOnly', p: 18 }], desc: 'Harder to hit for two turns; shakes off ABSORBED and HOOKED.' },
  cite:      { name: 'CITE SOURCE', menu: 'und', cost: 3, tgt: 'foe', kind: 'mind', aspect: 'cite', power: 12, anim: 'cast', fx: ['dmg', { k: 'dispel' }, { k: 'scan', part: 'weak1' }], desc: 'Where did it come from? Strips a boost and finds a weakness.' },
  aloud:     { name: 'READ ALOUD', menu: 'und', cost: 4, tgt: 'foes', kind: 'mind', aspect: 'aloud', power: 9, anim: 'cast', fx: ['dmg', { k: 'cure', ids: ['fogged', 'cliched'], to: 'party' }], desc: 'Every foe hears it plainly. Clears FOGGED and CLICHED from the party.' },
  holdboth:  { name: 'HOLD BOTH', menu: 'und', cost: 6, tgt: 'foe', kind: 'mind', aspect: 'hold', power: 28, brk: 2, anim: 'cast', fx: ['dmg'], desc: 'Keep two true things in mind at once. Breaks guards.' },
  // ---- Christian: NONFICTION (Nov 16: "I want to be a nonfiction based attack style myself"). FACT is his plain attack;
  //      the store's real sections are his disciplines, each open once he knows the section (memberSections).
  fact:      { name: 'FACT', tgt: 'foe', kind: 'mind', aspect: 'cite', power: 6, timed: 'strike', anim: 'cast', fx: ['dmg'], desc: 'A plain true thing, said plainly. Free. Press A as it lands.' },
  nf_hist:   { name: 'PRECEDENT', menu: 'sig', section: 'hist', cost: 3, tgt: 'foe', kind: 'mind', aspect: 'cite', power: 16, anim: 'cast', fx: ['dmg'], desc: '900 HISTORY: what actually happened the last time.' },
  nf_psych:  { name: 'NAME THE PATTERN', menu: 'sig', section: 'psych', cost: 3, tgt: 'foe', kind: 'mind', aspect: 'name', power: 16, anim: 'cast', fx: ['dmg', { k: 'cure', ids: ['dread'], to: 'party' }], desc: '150 PSYCHOLOGY: a pattern with a name loosens. Ends DREAD.' },
  nf_classics:{ name: 'SOCRATIC METHOD', menu: 'sig', section: 'classics', cost: 2, tgt: 'foe', kind: 'mind', aspect: 'question', power: 8, hits: 2, anim: 'cast', fx: ['dmg'], desc: '100 PHILOSOPHY: two questions, each closer to the truth.' },
  nf_science:{ name: 'TEST IT', menu: 'sig', section: 'science', cost: 3, tgt: 'foe', kind: 'mind', aspect: 'cite', power: 12, anim: 'cast', fx: ['dmg', { k: 'dispel' }, { k: 'scan', part: 'weak1' }], desc: '500 SCIENCE: run the experiment. Strips a boost and finds a weakness.' },
  nf_local:  { name: 'THOSE WHO CAME BEFORE', menu: 'sig', section: 'local', cost: 5, tgt: 'allies', anim: 'cast', fx: [{ k: 'heal', p: 12 }, { k: 'status', id: 'steady' }], field: 1, desc: '977 LOCAL HISTORY: people stood here before you. Heals and steadies the party.' },
  nf_medical:{ name: 'TRIAGE', menu: 'sig', section: 'medical', cost: 4, tgt: 'ally', anim: 'cast', fx: [{ k: 'heal', p: 34 }, { k: 'cure', ids: ['dread', 'shaken', 'slowed'] }], field: 1, desc: '610 MEDICINE: first things first. A big heal; clears DREAD, SHAKEN, SLOWED.' },
  nf_faith:  { name: 'THE OLDEST QUESTIONS', menu: 'sig', section: 'faith', cost: 5, tgt: 'allies', anim: 'cast', fx: [{ k: 'status', id: 'clear' }, { k: 'cure', ids: ['dread', 'shaken', 'hooked'] }], desc: '200 RELIGION: what people have asked for thousands of years. CLEAR for the party.' },
  nf_garden: { name: 'GROWING SEASON', menu: 'sig', section: 'garden', cost: 4, tgt: 'allies', anim: 'cast', fx: [{ k: 'status', id: 'rested' }], desc: '635 GARDENING: slow, steady growth. RESTED for the party.' },
  nf_ref:    { name: 'LOOK IT UP', menu: 'sig', section: 'ref', cost: 3, tgt: 'foes', anim: 'cast', fx: [{ k: 'scan' }], desc: '000 REFERENCE: encyclopedias and almanacs. Shows every foe\'s HP, weaknesses and needs.' },
  nf_social: { name: 'FOLLOW THE MONEY', menu: 'sig', section: 'social', cost: 3, tgt: 'foe', kind: 'mind', aspect: 'cite', power: 14, anim: 'cast', fx: ['dmg', { k: 'dispel' }], desc: '300 SOCIAL SCIENCES: who gains if you believe this? Strips a boost.' },
  nf_lang:   { name: 'DEFINE YOUR TERMS', menu: 'sig', section: 'lang', cost: 3, tgt: 'foe', kind: 'mind', aspect: 'name', power: 14, brk: 1, anim: 'cast', fx: ['dmg', { k: 'cure', ids: ['cliched'], to: 'party' }], desc: '400 LANGUAGE: words mean what they mean. Wears down its guard; clears CLICHED.' },
  nf_bio:    { name: 'A LIFE', menu: 'sig', section: 'bio', cost: 4, tgt: 'ally', anim: 'cast', fx: [{ k: 'heal', p: 10 }, { k: 'status', id: 'focused' }], desc: '920 BIOGRAPHY: someone lived through this. An ally heals and hits harder next.' },
  nf_myco:   { name: 'UNDERGROUND NETWORK', menu: 'sig', section: 'myco', cost: 4, tgt: 'allies', anim: 'cast', fx: [{ k: 'clarity', n: 5 }], desc: '579 MYCOLOGY: the forest shares through its fungal network. +5 Clarity for the party.' },
  // ---- Christian: RECOMMEND (pick the section that answers what the foe really needs; FF6's Lore and a bookseller's eye)
  recommend: { name: 'RECOMMEND', menu: 'sig', tgt: 'foe', kind: 'mind', aspect: 'book', power: 14, anim: 'cast', pickSection: 1, fx: ['dmg'], desc: 'Hand it the book it needs. The right section hits twice as hard.' },
  teabreak:  { name: 'TEA BREAK', menu: 'sig', cost: 5, tgt: 'allies', anim: 'cast', fx: [{ k: 'heal', p: 10 }], field: 1, desc: 'Everyone sits for a minute. Heals the party.' },
  shelftalk: { name: 'SHELF TALKER', menu: 'sig', cost: 1, tgt: 'foe', anim: 'cast', fx: [{ k: 'scan' }], desc: 'Write the card: shows its HP, weaknesses and the book it needs.' },
  specorder: { name: 'SPECIAL ORDER', menu: 'sig', cost: 4, tgt: 'ally', anim: 'cast', fx: [{ k: 'status', id: 'focused' }, { k: 'atb', n: 400 }], desc: 'An ally acts sooner and hits half again as hard.' },
  storyhour: { name: 'STORY HOUR', menu: 'sig', cost: 8, tgt: 'foes', anim: 'cast', fx: [{ k: 'status', id: 'absorbed', ch: 0.6 }], desc: 'Read them a story. They may lose themselves in it.' },
  // ---- Danny: TECHNIQUE (enter the moves, FF6 Blitz-style) and coaching
  jabcross:  { name: 'JAB-CROSS', menu: 'sig', tgt: 'foe', kind: 'phys', aspect: 'force', power: 9, hits: 2, seq: ['left', 'right'], anim: 'punch', fx: ['dmg'], desc: 'Two straight punches.' },
  sprawl:    { name: 'SPRAWL', menu: 'sig', tgt: 'self', seq: ['down', 'down'], anim: 'guard', fx: [{ k: 'status', id: 'based', to: 'self' }, { k: 'status', id: 'steady', to: 'self' }], desc: 'Hips down, base wide: counters the next physical hit.' },
  teep:      { name: 'TEEP', menu: 'sig', tgt: 'foe', kind: 'phys', aspect: 'force', power: 12, seq: ['right', 'right'], anim: 'kick', fx: ['dmg', { k: 'atb', n: -450 }], desc: 'A push kick. Knocks its time gauge back.' },
  hiptoss:   { name: 'HIP TOSS', menu: 'sig', tgt: 'foe', kind: 'phys', aspect: 'force', power: 24, brk: 1, seq: ['down', 'right', 'up'], anim: 'power', fx: ['dmg'], desc: 'Hip in, turn, throw. Wears down its guard.' },
  armbar:    { name: 'ARMBAR', menu: 'sig', tgt: 'foe', kind: 'phys', aspect: 'force', power: 32, brk: 2, seq: ['up', 'down', 'left', 'right'], anim: 'power', fx: [{ k: 'pierce', pct: 0.3 }, 'dmg'], desc: 'A lever: fulcrum at the joint, force far from it. Ignores some DEF.' },
  coach:     { name: 'COACH', menu: 'sig', cost: 3, tgt: 'ally', anim: 'guard', fx: [{ k: 'status', id: 'focused' }, { k: 'atb', n: 300 }], desc: '"Breathe. Now." An ally acts sooner, and harder.' },
  breathe:   { name: 'BREATHE', menu: 'sig', tgt: 'self', anim: 'guard', fx: [{ k: 'heal', p: 12 }, { k: 'cure', ids: ['dread', 'fogged', 'shaken'] }], field: 1, desc: 'Out on the effort, in on the way back. Heals and steadies.' },
  spot:      { name: 'SPOT', menu: 'sig', cost: 2, tgt: 'ally', anim: 'guard', fx: [{ k: 'cover' }], desc: '"I\'ve got you." Takes the hits meant for an ally for three turns.' },
  // ---- the Robin: CHEER (press A on the beat; a better rhythm, a bigger effect)
  fightsong: { name: 'FIGHT SONG', menu: 'sig', tgt: 'allies', rhythm: 4, anim: 'cast', fx: [{ k: 'status', id: 'pumped' }], desc: 'The school song. The party hits harder.' },
  dawnsong:  { name: 'DAWN SONG', menu: 'sig', tgt: 'allies', rhythm: 4, anim: 'cast', fx: [{ k: 'cure', ids: 'bad' }, { k: 'heal', p: 6 }], field: 1, desc: 'First light. Clears statuses and heals a little.' },
  earlybird: { name: 'EARLY BIRD', menu: 'sig', cost: 3, tgt: 'allies', rhythm: 4, anim: 'cast', fx: [{ k: 'atb', n: 450 }, { k: 'status', id: 'quick', ch: 'rhythm' }], desc: 'Up and moving. Fills the party\'s gauges.' },
  homecoming:{ name: 'HOMECOMING', menu: 'sig', cost: 6, tgt: 'any_ally', rhythm: 4, anim: 'cast', fx: [{ k: 'revive', pct: 0.35 }, { k: 'heal', p: 26 }], desc: 'Everybody comes home. Raises a dazed ally, or heals a lot.' },
  razz:      { name: 'RAZZ', menu: 'sig', cost: 2, tgt: 'foes', rhythm: 4, anim: 'attack', fx: [{ k: 'status', id: 'shaken', ch: 0.7 }], desc: 'The student section, loud. Foes lose some nerve.' },
  shareload: { name: 'SHARE THE LOAD', menu: 'sig', cost: 4, tgt: 'allies', rhythm: 4, anim: 'cast', fx: [{ k: 'share' }], desc: 'What one carries, all carry: the party\'s HP evens out, and the beat adds a little.' },
  swoop:     { name: 'SWOOP', menu: 'sig', cost: 3, tgt: 'foe', kind: 'phys', aspect: 'force', power: 15, timed: 'strike', anim: 'attack', fx: ['dmg'], desc: 'A dive from the rafters.' },
  // ---- THE PLAYER (the custom hero you name): a VIDEO GAMER. PLAY. The input is the button mash.
  strike_hr: { name: 'STRIKE', tgt: 'foe', kind: 'phys', aspect: 'force', power: 6, timed: 'strike', anim: 'attack', fx: ['dmg'], desc: 'A plain hit. Press A as it lands for more.' },
  mash:      { name: 'BUTTON MASH', menu: 'sig', tgt: 'foe', kind: 'phys', aspect: 'force', power: 5, mash: 1, anim: 'attack', fx: ['dmg'], desc: 'Mash A. Every few presses is one more hit (up to seven).' },
  extralife: { name: 'EXTRA LIFE', menu: 'sig', cost: 6, tgt: 'down', anim: 'cast', fx: [{ k: 'revive', pct: 0.5 }], desc: 'A 1-UP. Brings a dazed ally back at half HP.' },
  pause:     { name: 'PAUSE', menu: 'sig', cost: 4, tgt: 'foes', anim: 'cast', fx: [{ k: 'status', id: 'slowed', ch: 0.85 }, { k: 'atb', n: -300 }], desc: 'The world waits. Foes slow down and lose ground.' },
  savestate: { name: 'SAVE STATE', menu: 'sig', cost: 3, tgt: 'self', anim: 'cast', fx: [{ k: 'savestate' }], desc: 'Remembers everyone\'s HP and Clarity right now.' },
  loadstate: { name: 'LOAD STATE', menu: 'sig', cost: 5, tgt: 'self', anim: 'cast', fx: [{ k: 'loadstate' }], desc: 'Puts everyone\'s HP and Clarity back to the save state.' },
  speedrun:  { name: 'SPEEDRUN', menu: 'sig', cost: 4, tgt: 'allies', anim: 'cast', fx: [{ k: 'status', id: 'quick' }, { k: 'atb', n: 250 }], desc: 'No wasted moves. The party gets QUICK.' },
  // ---- Cecil (video games, as physical media: the collector): COLLECTION. Cartridges are aspects to swap in.
  strike_cc: { name: 'STRIKE', tgt: 'foe', kind: 'phys', aspect: 'force', power: 6, timed: 'strike', anim: 'attack', fx: ['dmg'], desc: 'A plain hit. Press A as it lands for more.' },
  blowonit:  { name: 'BLOW ON IT', menu: 'sig', cost: 2, tgt: 'ally', anim: 'cast', fx: [{ k: 'cure', ids: 'bad' }], desc: 'The old cartridge fix. Clears an ally\'s statuses.' },
  manual:    { name: 'THE MANUAL', menu: 'sig', cost: 1, tgt: 'foe', anim: 'cast', fx: [{ k: 'scan' }], desc: 'The paper booklet in the box: its HP, weaknesses and needs.' },
  cart_plat: { name: 'PLATFORMER', menu: 'sig', cost: 2, tgt: 'foe', kind: 'mind', aspect: 'step', power: 13, anim: 'cast', fx: ['dmg'], desc: 'Cartridge: jump clear and see the whole level. Hits as STEP BACK.' },
  cart_fight:{ name: 'FIGHTER', menu: 'sig', cost: 2, tgt: 'foe', kind: 'phys', aspect: 'force', power: 8, hits: 2, timed: 'strike', anim: 'attack', fx: ['dmg'], desc: 'Cartridge: a two-hit combo. Press A as each lands.' },
  cart_puzz: { name: 'PUZZLE', menu: 'sig', cost: 2, tgt: 'foe', kind: 'mind', aspect: 'question', power: 13, anim: 'cast', fx: ['dmg'], desc: 'Cartridge: every piece has to fit. Hits as QUESTION.' },
  cart_rpg:  { name: 'RPG', menu: 'sig', cost: 3, tgt: 'foe', kind: 'mind', aspect: 'name', power: 15, anim: 'cast', fx: ['dmg'], desc: 'Cartridge: read the bestiary. Hits as NAME IT.' },
  collection:{ name: 'COLLECTION', menu: 'sig', cost: 4, tgt: 'allies', anim: 'guard', fx: [{ k: 'status', id: 'steady' }, { k: 'status', id: 'clear' }], desc: 'The shelf of boxed games stands behind everyone: STEADY and CLEAR.' },
  mintcond:  { name: 'MINT CONDITION', menu: 'sig', cost: 5, tgt: 'ally', anim: 'cast', fx: [{ k: 'heal', p: 24 }, { k: 'status', id: 'rested' }], field: 1, desc: 'Kept with care: a big heal and RESTED.' },
  // ---- Daniel (video media: film and television): ROLL FILM. His input is the focus: hold A, let go when the picture is sharp.
  strike_dl: { name: 'STRIKE', tgt: 'foe', kind: 'phys', aspect: 'force', power: 5, timed: 'strike', anim: 'attack', fx: ['dmg'], desc: 'A plain hit. Press A as it lands for more.' },
  previews:  { name: 'PREVIEWS', menu: 'sig', cost: 2, tgt: 'foes', anim: 'cast', fx: [{ k: 'scan' }], desc: 'Coming attractions: shows every foe\'s HP, weaknesses and needs.' },
  sfx:       { name: 'SPECIAL EFFECTS', menu: 'sig', cost: 3, tgt: 'foes', kind: 'mind', aspect: 'step', power: 10, charge: 1, anim: 'cast', fx: ['dmg', { k: 'status', id: 'fogged', ch: 0.4 }], desc: 'See the wires: hits every foe and may fog them. Hold A, let go when sharp.' },
  slowmo:    { name: 'SLOW MOTION', menu: 'sig', cost: 4, tgt: 'foes', charge: 1, anim: 'cast', fx: [{ k: 'status', id: 'slowed', ch: 0.75 }], desc: 'Every foe may slow down. Hold A, let go when sharp.' },
  intermis:  { name: 'INTERMISSION', menu: 'sig', cost: 4, tgt: 'allies', anim: 'cast', fx: [{ k: 'status', id: 'rested' }, { k: 'clarity', n: 3 }], field: 1, desc: 'Fifteen minutes. The party gets RESTED and +3 Clarity.' },
  dircut:    { name: 'DIRECTOR\'S CUT', menu: 'sig', cost: 5, tgt: 'foe', kind: 'mind', aspect: 'cite', power: 26, brk: 1, charge: 1, anim: 'cast', fx: ['dmg'], desc: 'The true version, scene by scene. Hold A, let go when sharp.' },
  credits:   { name: 'CREDITS ROLL', menu: 'sig', cost: 8, tgt: 'foes', anim: 'cast', fx: [{ k: 'credits', pct: 0.2 }], desc: 'THE END. Any foe under a fifth of its HP lets go.' },
  // ---- the audio stand-in (radio and audiobooks): BROADCAST. The input is the dial: press A when the needle finds the station.
  strike_vx: { name: 'STRIKE', tgt: 'foe', kind: 'phys', aspect: 'force', power: 4, timed: 'strike', anim: 'attack', fx: ['dmg'], desc: 'A plain hit. Press A as it lands for more.' },
  callin:    { name: 'CALL-IN SHOW', menu: 'sig', cost: 2, tgt: 'foes', aspect: 'listen', anim: 'cast', fx: [{ k: 'clarity', n: 2, to: 'self' }, { k: 'status', id: 'softened' }, { k: 'weakOnly', p: 12 }], desc: 'Every foe gets to talk. Their next blows land softer.' },
  static:    { name: 'STATIC', menu: 'sig', tgt: 'foes', kind: 'mind', aspect: 'aloud', power: 6, tune: 1, anim: 'cast', fx: ['dmg', { k: 'status', id: 'shaken', ch: 0.5 }], desc: 'Noise on every channel. Tune the dial for more.' },
  audiobook: { name: 'AUDIOBOOK', menu: 'sig', cost: 4, tgt: 'allies', tune: 1, anim: 'cast', fx: [{ k: 'status', id: 'rested' }, { k: 'status', id: 'clear' }], desc: 'A chapter in a calm voice: RESTED and CLEAR for the party.' },
  deadair:   { name: 'DEAD AIR', menu: 'sig', cost: 5, tgt: 'foes', anim: 'cast', fx: [{ k: 'status', id: 'absorbed', ch: 0.6 }], desc: 'Silence. They lean in, waiting, and lose a turn.' },
  boost:     { name: 'SIGNAL BOOST', menu: 'sig', cost: 3, tgt: 'ally', tune: 1, anim: 'cast', fx: [{ k: 'status', id: 'focused' }, { k: 'atb', n: 350 }], desc: 'An ally comes in loud and clear: acts sooner and harder.' },
  latenight: { name: 'LATE-NIGHT REQUEST', menu: 'sig', cost: 7, tgt: 'allies', anim: 'cast', fx: [{ k: 'heal', p: 18 }, { k: 'cure', ids: ['dread', 'shaken'] }], field: 1, desc: 'The song somebody needed. Heals the party; clears DREAD and SHAKEN.' },
};
// the RECOMMEND sections: the store's real shelves (inside.js FIG_SHELVES). Each foe needs one or two.
// Christian's sections, on the Dewey Decimal System's nonfiction classes (the library's own standard, and the game's library uses it):
// 000 general works, 100 philosophy and psychology, 200 religion, 300 social sciences, 400 language, 500 science, 600 applied, 900 history.
// 700 (arts and recreation) belongs to the media members and Danny; 800 (literature) is fiction's home, Daimon's ground.
const SECTIONS = { ref: 'REFERENCE (000)', classics: 'PHILOSOPHY (100)', psych: 'PSYCHOLOGY (150)', faith: 'RELIGION (200)', social: 'SOCIAL SCIENCES (300)',
  lang: 'LANGUAGE (400)', science: 'SCIENCE & NATURE (500)', myco: 'MYCOLOGY (579)', medical: 'MEDICINE (610)', garden: 'PLANTS & GARDENING (635)',
  hist: 'HISTORY (900)', bio: 'BIOGRAPHY (920)', local: 'LOCAL HISTORY (977)' };
const SECTION_LV = { psych: 1, hist: 1, classics: 2, ref: 3, science: 4, local: 5, social: 6, medical: 7, lang: 8, faith: 9, bio: 10, garden: 11, myco: 14 };   // the books in town open them early (hooks.js)

// ---------- the three classes. base: attributes at level 1; grow: per level; learn: [level, skill].
const CLASSES = {
  christian: { name: 'CHRISTIAN', title: 'NONFICTION', art: 'ch', sig: 'NONFICTION', strike: 'fact', hand: 'lamp', row: 'back',
    base: { STR: 5, STA: 6, AGI: 6, DEX: 7, INT: 10, WIS: 9, CHA: 10 }, grow: { STR: 0.5, STA: 0.8, AGI: 0.6, DEX: 0.7, INT: 1.4, WIS: 1.3, CHA: 1.2 },
    pick: 'kind', start: { hand: 'penlight', body: 'cardigan' },
    learn: [[1, 'recommend'], [1, 'teabreak'], [2, 'shelftalk'], [6, 'specorder']] },
  danny: { name: 'DANNY', title: 'COACH', art: 'dn', sig: 'TECHNIQUE', strike: 'strike_dn', hand: 'gloves', row: 'front',
    base: { STR: 10, STA: 10, AGI: 8, DEX: 7, INT: 5, WIS: 6, CHA: 6 }, grow: { STR: 1.4, STA: 1.3, AGI: 1.1, DEX: 0.9, INT: 0.6, WIS: 0.8, CHA: 0.7 },
    pick: 'steady', start: { hand: 'handwraps', body: 'scarf' },
    learn: [[1, 'jabcross'], [1, 'sprawl'], [1, 'breathe'], [3, 'coach'], [4, 'teep'], [7, 'hiptoss'], [9, 'spot'], [11, 'armbar']] },
  // Nov 16, Christian: "The Robin will be a physical manifestation of the town's collective character, or collective consciousness"
  robin: { name: 'ROBIN', title: 'COLLECTIVE', art: 'rb', sig: 'CHEER', strike: 'strike_rb', hand: 'horn', row: 'front',
    base: { STR: 7, STA: 7, AGI: 11, DEX: 9, INT: 6, WIS: 6, CHA: 9 }, grow: { STR: 0.8, STA: 0.8, AGI: 1.5, DEX: 1.2, INT: 0.7, WIS: 0.8, CHA: 1.3 },
    pick: 'sharp', start: { hand: 'whistle', body: 'scarf' },
    learn: [[1, 'fightsong'], [1, 'dawnsong'], [3, 'earlybird'], [4, 'swoop'], [6, 'homecoming'], [8, 'shareload'], [9, 'razz']] },
  // Nov 16, Christian: "Cecil is going to be a playable character, Video Games as Physical media, Danny as Physical Body,
  // ... that Theater and Daniel ... from Video Media, ... Radio and Audiobook character standin ... from the Library audiobook section."
  // Nov 16: "start as a custom character, Video Gamer ... in a private room, with them alone". Named at NEW GAME; even growth, like most heroes.
  hero: { name: 'PLAYER', title: 'VIDEO GAMER', medium: 'Video games', art: 'kid', sig: 'PLAY', strike: 'strike_hr', hand: 'pad', row: 'front',
    base: { STR: 7, STA: 7, AGI: 10, DEX: 10, INT: 8, WIS: 7, CHA: 8 }, grow: { STR: 1.0, STA: 1.0, AGI: 1.2, DEX: 1.2, INT: 1.0, WIS: 1.0, CHA: 1.0 },
    pick: 'sharp', start: { hand: 'gamepad', body: 'scarf' },
    learn: [[1, 'mash'], [2, 'extralife'], [4, 'savestate'], [4, 'loadstate'], [6, 'pause'], [9, 'speedrun']] },
  cecil: { name: 'CECIL', title: 'COLLECTOR', medium: 'Video games, as physical media', art: 'folk:cecil', sig: 'COLLECTION', strike: 'strike_cc', hand: 'collect', row: 'front', recruit: 'Respawn Gaming Lounge',
    base: { STR: 7, STA: 8, AGI: 8, DEX: 10, INT: 9, WIS: 8, CHA: 8 }, grow: { STR: 0.9, STA: 1.0, AGI: 0.9, DEX: 1.3, INT: 1.1, WIS: 1.0, CHA: 0.9 },
    pick: 'sharp', start: { hand: 'cartbag', body: 'scarf' },
    learn: [[1, 'blowonit'], [1, 'manual'], [1, 'cart_plat'], [2, 'cart_fight'], [4, 'cart_puzz'], [6, 'cart_rpg'], [8, 'collection'], [10, 'mintcond']] },
  daniel: { name: 'DANIEL', title: 'PROJECTIONIST', medium: 'Video media: film and television', art: 'folk:daniel', sig: 'ROLL FILM', strike: 'strike_dl', hand: 'reel', row: 'back', recruit: 'McKenzie Palace Theatre',
    base: { STR: 6, STA: 7, AGI: 7, DEX: 8, INT: 10, WIS: 8, CHA: 10 }, grow: { STR: 0.6, STA: 0.8, AGI: 0.8, DEX: 1.0, INT: 1.3, WIS: 1.0, CHA: 1.3 },
    pick: 'kind', start: { hand: 'filmreel', body: 'scarf' },
    learn: [[1, 'previews'], [1, 'sfx'], [3, 'slowmo'], [5, 'intermis'], [8, 'dircut'], [12, 'credits']] },
  vox: { name: 'VOX', title: 'VOICE', medium: 'Radio and audiobooks', standin: 1, art: 'folk:vox', sig: 'BROADCAST', strike: 'strike_vx', hand: 'mic', row: 'back', recruit: 'Antigo Public Library, audiobooks',
    base: { STR: 5, STA: 6, AGI: 8, DEX: 8, INT: 8, WIS: 11, CHA: 10 }, grow: { STR: 0.5, STA: 0.8, AGI: 1.0, DEX: 0.9, INT: 1.1, WIS: 1.4, CHA: 1.3 },
    pick: 'kind', start: { hand: 'microphone', body: 'scarf' },
    learn: [[1, 'callin'], [1, 'static'], [3, 'audiobook'], [6, 'deadair'], [8, 'boost'], [11, 'latenight']] },
};
CLASSES.christian.recruit = 'The Blessed Fig Tree'; CLASSES.danny.recruit = 'UMA Martial Arts'; CLASSES.robin.recruit = 'Out in town';
CLASSES.christian.medium = 'Books: nonfiction'; CLASSES.danny.medium = 'The physical body'; CLASSES.robin.medium = 'The town\'s collective character';
// you start alone, as the player; Christian is the first to join, at the store (the base); the rest join where they live (hooks.js)
const START_MEMBERS = ['hero'];

// ---------- COMBOS (Chrono Trigger's Dual and Triple Techs): everyone named must have a full gauge and know their part.
//  who: member -> the skill they must know. cost: Clarity from each. Everything else is a skill (tgt, kind, aspect, power, fx).
//  aspect may be a list: the combo hits a weakness if any of them is one. Stand-in names; rename freely.
const COMBOS = {
  bythebook:  { name: 'BY THE BOOK', who: { christian: 'recommend', danny: 'jabcross' }, cost: { christian: 2, danny: 0 }, tgt: 'foe', kind: 'phys', aspect: ['force', 'book'], power: 30, brk: 1, pickSection: 1, timed: 'strike', fx: ['dmg'], desc: 'Danny hits while Christian names the book it needs.' },
  teaching:   { name: 'TEACHING MOMENT', who: { christian: 'teabreak', danny: 'breathe' }, cost: { christian: 4, danny: 0 }, tgt: 'allies', fx: [{ k: 'heal', p: 16 }, { k: 'cure', ids: 'bad' }, { k: 'status', id: 'steady' }], desc: 'Sit, breathe, drink the tea. Heals, clears statuses, steadies everyone.' },
  readalong:  { name: 'READ-ALONG', who: { christian: 'question', robin: 'fightsong' }, cost: { christian: 3, robin: 0 }, tgt: 'foes', kind: 'mind', aspect: ['question', 'aloud'], power: 16, fx: ['dmg', { k: 'status', id: 'pumped', to: 'party' }], desc: 'Christian reads, the Robin leads the crowd. Hits every foe; the party pumps up.' },
  spiritweek: { name: 'SPIRIT WEEK', who: { christian: 'specorder', robin: 'earlybird' }, cost: { christian: 3, robin: 2 }, tgt: 'allies', fx: [{ k: 'atb', n: 500 }, { k: 'status', id: 'focused' }], desc: 'Everyone acts sooner and hits half again as hard.' },
  mascottoss: { name: 'MASCOT TOSS', who: { danny: 'hiptoss', robin: 'swoop' }, cost: { danny: 0, robin: 3 }, tgt: 'foe', kind: 'phys', aspect: 'force', power: 44, brk: 2, timed: 'strike', fx: ['dmg'], desc: 'Danny throws, the Robin flies. A huge hit that breaks guards.' },
  twoadays:   { name: 'TWO-A-DAYS', who: { danny: 'coach', robin: 'earlybird' }, cost: { danny: 2, robin: 2 }, tgt: 'allies', fx: [{ k: 'atb', n: 600 }, { k: 'status', id: 'quick' }], desc: 'Practice twice a day: the party moves sooner and faster.' },
  playersguide: { name: 'PLAYER\'S GUIDE', who: { hero: 'mash', christian: 'recommend' }, cost: { hero: 0, christian: 2 }, tgt: 'foe', kind: 'phys', aspect: ['force', 'book'], power: 6, mash: 1, pickSection: 1, fx: ['dmg'], desc: 'Christian reads out the right page while you mash. Many hits, and the right book.' },
  stratguide: { name: 'STRATEGY GUIDE', who: { christian: 'shelftalk', cecil: 'manual' }, cost: { christian: 1, cecil: 1 }, tgt: 'foes', fx: [{ k: 'scan' }, { k: 'status', id: 'focused', to: 'party' }], desc: 'Look it up together: shows every foe, and the party hits harder.' },
  combobreak: { name: 'COMBO BREAKER', who: { danny: 'jabcross', hero: 'mash' }, cost: { danny: 0, hero: 0 }, tgt: 'foe', kind: 'phys', aspect: 'force', power: 7, mash: 1, brk: 1, fx: ['dmg'], desc: 'Mash A while Danny counts the rounds. Up to nine hits.' },
  highscore:  { name: 'HIGH SCORE', who: { robin: 'fightsong', hero: 'speedrun' }, cost: { robin: 0, hero: 3 }, tgt: 'allies', fx: [{ k: 'status', id: 'pumped' }, { k: 'status', id: 'quick' }], desc: 'New record. The party pumps up and speeds up.' },
  adaptation: { name: 'BASED ON THE BOOK', who: { christian: 'recommend', daniel: 'dircut' }, cost: { christian: 2, daniel: 4 }, tgt: 'foe', kind: 'mind', aspect: ['book', 'cite'], power: 40, brk: 2, pickSection: 1, charge: 1, fx: ['dmg'], desc: 'The book, then the film that kept faith with it. A huge hit.' },
  cutscene:   { name: 'CUTSCENE', who: { daniel: 'previews', hero: 'savestate' }, cost: { daniel: 2, hero: 2 }, tgt: 'foes', fx: [{ k: 'status', id: 'absorbed', ch: 0.7 }, { k: 'clarity', n: 4, to: 'party' }], desc: 'Nobody can skip it. Foes may lose a turn; the party gets +4 Clarity.' },
  audioed:    { name: 'AUDIOBOOK EDITION', who: { christian: 'teabreak', vox: 'audiobook' }, cost: { christian: 3, vox: 3 }, tgt: 'allies', fx: [{ k: 'heal', p: 20 }, { k: 'status', id: 'rested' }, { k: 'status', id: 'clear' }], desc: 'The book, read aloud. Heals the party, RESTED and CLEAR.' },
  radiodrama: { name: 'RADIO DRAMA', who: { daniel: 'sfx', vox: 'deadair' }, cost: { daniel: 2, vox: 3 }, tgt: 'foes', kind: 'mind', aspect: ['step', 'aloud'], power: 18, fx: ['dmg', { k: 'status', id: 'absorbed', ch: 0.5 }], desc: 'Sound effects in the dark. Hits every foe; they may lose a turn.' },
  breathwork: { name: 'GUIDED BREATHING', who: { danny: 'breathe', vox: 'callin' }, cost: { danny: 0, vox: 2 }, tgt: 'allies', fx: [{ k: 'cure', ids: 'bad' }, { k: 'clarity', n: 6 }], desc: 'In for four, out for six. Clears the party\'s statuses; +6 Clarity.' },
  halftime:   { name: 'HALFTIME SHOW', who: { robin: 'fightsong', daniel: 'slowmo' }, cost: { robin: 0, daniel: 3 }, tgt: 'foes', fx: [{ k: 'status', id: 'slowed', ch: 0.8 }, { k: 'status', id: 'pumped', to: 'party' }], desc: 'Foes slow down to watch; the party pumps up.' },
  pa:         { name: 'P.A. ANNOUNCEMENT', who: { vox: 'static', robin: 'razz' }, cost: { vox: 0, robin: 2 }, tgt: 'foes', kind: 'mind', aspect: 'aloud', power: 14, tune: 1, fx: ['dmg', { k: 'status', id: 'shaken', ch: 0.8 }], desc: 'Attention, please. Hits every foe and shakes them.' },
  wholetown:  { name: 'THE WHOLE TOWN READS', who: { christian: 'aloud', danny: 'teep', robin: 'razz' }, cost: { christian: 4, danny: 0, robin: 2 }, tgt: 'foes', kind: 'mind', aspect: ['aloud', 'book', 'force'], power: 34, brk: 2, fx: ['dmg'], desc: 'All three at once. Hits every foe hard and breaks guards.' },
  openhouse:  { name: 'OPEN HOUSE', who: { christian: 'teabreak', danny: 'spot', robin: 'homecoming' }, cost: { christian: 4, danny: 2, robin: 4 }, tgt: 'party_all', fx: [{ k: 'revive', pct: 0.5 }, { k: 'heal', p: 30 }, { k: 'cure', ids: 'bad' }], desc: 'Doors open, everyone welcome. Raises the dazed and heals the whole party.' },
  multimedia: { name: 'ADAPTATION', who: { christian: 'recommend', daniel: 'dircut', vox: 'audiobook' }, cost: { christian: 3, daniel: 4, vox: 3 }, tgt: 'foes', kind: 'mind', aspect: ['book', 'cite', 'aloud'], power: 38, brk: 2, pickSection: 1, fx: ['dmg'], desc: 'Page, screen and voice tell it true together. Hits every foe very hard.' },
  retrolink:  { name: 'LINK CABLE', who: { hero: 'mash', cecil: 'cart_fight' }, cost: { hero: 0, cecil: 2 }, tgt: 'foe', kind: 'phys', aspect: 'force', power: 7, mash: 1, brk: 1, timed: null, fx: ['dmg'], desc: 'Two players, one cable. Mash A: up to nine hits.' },
  gamenight:  { name: 'GAME NIGHT', who: { hero: 'mash', cecil: 'cart_plat', robin: 'swoop' }, cost: { hero: 0, cecil: 2, robin: 3 }, tgt: 'foes', kind: 'phys', aspect: 'force', power: 6, mash: 1, brk: 1, fx: ['dmg'], desc: 'Everybody on the couch. Mash A: many hits on every foe.' },
};
// TEAM BONUSES: who fights together. need: all of these in the three; mods go on everyone in the fight.
const TEAMS = [
  { name: 'NEIGHBORS ON FIFTH', need: ['christian', 'danny'], mods: [{ s: 'def', mul: 1.1 }], desc: 'Two Fifth Avenue owners: everyone DEF +10%.' },
  { name: 'PHYSICAL MEDIA', need: ['christian', 'cecil'], mods: [{ s: 'res', mul: 1.1 }], desc: 'Books and cartridges you can hold: everyone RES +10%.' },
  { name: 'FIRST CUSTOMER', need: ['hero', 'christian'], mods: [{ s: 'sres', add: 10 }], desc: 'The player and the store: everyone shrugs off statuses more often.' },
  { name: 'PLAYER TWO', need: ['hero', 'cecil'], mods: [{ s: 'crit', add: 4 }], desc: 'A second controller: everyone CRIT +4.' },
  { name: 'MOVIE NIGHT', need: ['daniel', 'vox'], mods: [{ s: 'clMax', add: 4 }], desc: 'Picture and sound: everyone +4 max Clarity.' },
  { name: 'BODY AND VOICE', need: ['danny', 'vox'], mods: [{ s: 'heal', mul: 1.15 }], desc: 'Breath and body: healing +15%.' },
  { name: 'HOME TEAM', need: ['robin', 'danny'], mods: [{ s: 'spd', add: 1 }], desc: 'Game day: everyone SPD +1.' },
  { name: 'ALL THE MEDIA', need: ['christian', 'cecil', 'daniel'], mods: [{ s: 'mag', mul: 1.1 }], desc: 'Page, game and screen: everyone MAG +10%.' },
];
// everyone learns the understanding commands at the same levels (report: all by the midpoint)
const UND_LEARN = [[1, 'question'], [1, 'listen'], [1, 'nameit'], [1, 'reflect'], [4, 'stepback'], [7, 'cite'], [7, 'aloud'], [10, 'holdboth']];
// the level-up choice (Super Mario RPG's bonus, as the report's three annotations): no best answer
const LEVEL_PICKS = { steady: { name: 'STEADY', add: { STA: 1, STR: 1 }, desc: 'Body: +1 STA, +1 STR' },
  sharp: { name: 'SHARP', add: { DEX: 1, INT: 1 }, desc: 'Mind: +1 DEX, +1 INT' }, kind: { name: 'KIND', add: { CHA: 1, WIS: 1 }, desc: 'Heart: +1 CHA, +1 WIS' } };

// ---------- battle items (prices in cents, like the rest of the town). field: usable from the menu; battle: in a fight.
const BITEMS = {
  figcookie:   { name: 'Fig Cookie', price: 200, tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'heal', flat: 35 }], desc: '+35 HP to one ally.' },
  cocoa:       { name: 'Mug of Cocoa', price: 450, tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'heal', flat: 100 }], desc: '+100 HP to one ally.' },
  grilledchz:  { name: 'Grilled Cheese', price: 800, tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'heal', full: 1 }], desc: 'All HP back to one ally.' },
  peppermint:  { name: 'Peppermint', price: 100, tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'clarity', n: 10 }], desc: '+10 Clarity.' },
  lavender:    { name: 'Lavender Sachet', price: 600, tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'clarity', n: 30 }], desc: '+30 Clarity.' },
  chamomile:   { name: 'Chamomile Tea', price: 300, tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'cure', ids: 'bad' }], desc: 'Clears every status.' },
  letter:      { name: 'A Friend\'s Letter', price: 0, tgt: 'down', battle: 1, field: 1, fx: [{ k: 'revive', pct: 0.25 }], desc: 'Brings a dazed ally back at a quarter HP. Not sold anywhere.' },
  thermos:     { name: 'Picnic Thermos', price: 1500, tgt: 'allies', field: 1, fx: [{ k: 'revive', pct: 1 }, { k: 'heal', full: 1 }, { k: 'clarity', full: 1 }, { k: 'cure', ids: 'bad' }], desc: 'Outside a fight: everyone back to full.' },
  // the town's own goods, now with a use (shops.js stocks them)
  lk_bandage:  { name: 'Box of Bandages', tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'heal', flat: 45 }], desc: '+45 HP to one ally.' },
  lk_cough:    { name: 'Cough Drops', tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'cure', ids: ['cliched'] }, { k: 'clarity', n: 4 }], desc: 'Clears CLICHED; +4 Clarity.' },
  lk_ice:      { name: 'Instant Cold Pack', tgt: 'ally', battle: 1, field: 1, fx: [{ k: 'heal', flat: 20 }, { k: 'cure', ids: ['shaken'] }], desc: '+20 HP; clears SHAKEN.' },
};

// ---------- gear. slot: hand, body or mark (a bookmark: two slots, FF6's relics). who: which classes can use it.
//  mods: [{s: stat, add|mul}]. flag: a rule the engine reads (see engine.js MARK_RULES). Prices in cents; 0 = found only.
const GEAR = {
  // hand: Christian's lamps (MAG), Danny's gloves (ATK), the Robin's horns (both)
  penlight:    { name: 'Penlight', slot: 'hand', who: ['christian'], mods: [{ s: 'mag', add: 3 }], price: 0, desc: 'MAG +3.' },
  readinglamp: { name: 'Reading Lamp', slot: 'hand', who: ['christian'], mods: [{ s: 'mag', add: 6 }], price: 4000, desc: 'MAG +6.' },
  brasslamp:   { name: 'Brass Lantern', slot: 'hand', who: ['christian'], mods: [{ s: 'mag', add: 10 }], price: 12000, desc: 'MAG +10.' },
  stormlamp:   { name: 'Storm Lantern', slot: 'hand', who: ['christian'], mods: [{ s: 'mag', add: 14 }], price: 24000, desc: 'MAG +14.' },
  lighthouse:  { name: 'Lighthouse Lens', slot: 'hand', who: ['christian'], mods: [{ s: 'mag', add: 18 }], price: 42000, desc: 'MAG +18.' },
  frontwindow: { name: 'Front-Window Light', slot: 'hand', who: ['christian'], mods: [{ s: 'mag', add: 23 }, { s: 'heal', add: 6 }], price: 0, desc: 'MAG +23, HEAL +6. Found, never sold.' },
  handwraps:   { name: 'Hand Wraps', slot: 'hand', who: ['danny'], mods: [{ s: 'atk', add: 3 }], price: 0, desc: 'ATK +3.' },
  baggloves:   { name: 'Bag Gloves', slot: 'hand', who: ['danny'], mods: [{ s: 'atk', add: 6 }], price: 4000, desc: 'ATK +6.' },
  sparglove:   { name: 'Sparring Gloves', slot: 'hand', who: ['danny'], mods: [{ s: 'atk', add: 10 }], price: 12000, desc: 'ATK +10.' },
  grapglove:   { name: 'Grappling Gloves', slot: 'hand', who: ['danny'], mods: [{ s: 'atk', add: 14 }, { s: 'crit', add: 3 }], price: 24000, desc: 'ATK +14, CRIT +3.' },
  instructor:  { name: 'Instructor\'s Belt', slot: 'hand', who: ['danny'], mods: [{ s: 'atk', add: 19 }, { s: 'def', add: 4 }], price: 0, desc: 'ATK +19, DEF +4. Found, never sold.' },
  whistle:     { name: 'Whistle', slot: 'hand', who: ['robin'], mods: [{ s: 'atk', add: 2 }, { s: 'mag', add: 2 }], price: 0, desc: 'ATK +2, MAG +2.' },
  megaphone:   { name: 'Megaphone', slot: 'hand', who: ['robin'], mods: [{ s: 'atk', add: 4 }, { s: 'mag', add: 4 }], price: 4500, desc: 'ATK +4, MAG +4.' },
  bandrum:     { name: 'Pep-Band Drum', slot: 'hand', who: ['robin'], mods: [{ s: 'atk', add: 7 }, { s: 'mag', add: 7 }], price: 13000, desc: 'ATK +7, MAG +7.' },
  airhorn:     { name: 'Air Horn', slot: 'hand', who: ['robin'], mods: [{ s: 'atk', add: 10 }, { s: 'mag', add: 10 }], price: 25000, desc: 'ATK +10, MAG +10.' },
  maroonwhite: { name: 'Maroon-and-White Pennant', slot: 'hand', who: ['robin'], mods: [{ s: 'atk', add: 13 }, { s: 'mag', add: 13 }, { s: 'spd', add: 2 }], price: 0, desc: 'ATK +13, MAG +13, SPD +2. Found, never sold.' },
  gamepad:     { name: 'Game Pad', slot: 'hand', who: ['hero'], mods: [{ s: 'atk', add: 2 }, { s: 'crit', add: 2 }], price: 0, desc: 'ATK +2, CRIT +2.' },
  arcadestick: { name: 'Arcade Stick', slot: 'hand', who: ['hero'], mods: [{ s: 'atk', add: 6 }, { s: 'crit', add: 3 }], price: 4500, desc: 'ATK +6, CRIT +3.' },
  lightgun:    { name: 'Light Gun', slot: 'hand', who: ['hero'], mods: [{ s: 'atk', add: 10 }, { s: 'acc', add: 6 }], price: 12500, desc: 'ATK +10, ACC +6.' },
  procontrol:  { name: 'Pro Controller', slot: 'hand', who: ['hero'], mods: [{ s: 'atk', add: 14 }, { s: 'crit', add: 5 }], price: 24000, desc: 'ATK +14, CRIT +5.' },
  goldcart:    { name: 'Gold Cartridge', slot: 'hand', who: ['hero'], mods: [{ s: 'atk', add: 18 }, { s: 'crit', add: 8 }], price: 0, desc: 'ATK +18, CRIT +8. Found, never sold.' },
  cartbag:     { name: 'Cartridge Bag', slot: 'hand', who: ['cecil'], mods: [{ s: 'atk', add: 3 }, { s: 'mag', add: 2 }], price: 0, desc: 'ATK +3, MAG +2.' },
  cibcopy:     { name: 'Complete-in-Box Copy', slot: 'hand', who: ['cecil'], mods: [{ s: 'atk', add: 6 }, { s: 'mag', add: 4 }], price: 4500, desc: 'ATK +6, MAG +4. Box, manual and all.' },
  cleankit:    { name: 'Cleaning Kit', slot: 'hand', who: ['cecil'], mods: [{ s: 'atk', add: 9 }, { s: 'mag', add: 7 }, { s: 'sres', add: 5 }], price: 12500, desc: 'ATK +9, MAG +7, SRES +5.' },
  sealed:      { name: 'Factory-Sealed Copy', slot: 'hand', who: ['cecil'], mods: [{ s: 'atk', add: 12 }, { s: 'mag', add: 10 }], price: 24000, desc: 'ATK +12, MAG +10.' },
  prototype:   { name: 'Prototype Cartridge', slot: 'hand', who: ['cecil'], mods: [{ s: 'atk', add: 16 }, { s: 'mag', add: 14 }, { s: 'crit', add: 5 }], price: 0, desc: 'ATK +16, MAG +14, CRIT +5. Found, never sold.' },
  filmreel:    { name: 'Film Reel', slot: 'hand', who: ['daniel'], mods: [{ s: 'mag', add: 3 }], price: 0, desc: 'MAG +3.' },
  clapper:     { name: 'Clapperboard', slot: 'hand', who: ['daniel'], mods: [{ s: 'mag', add: 6 }], price: 4000, desc: 'MAG +6.' },
  projlens:    { name: 'Projector Lens', slot: 'hand', who: ['daniel'], mods: [{ s: 'mag', add: 10 }], price: 12000, desc: 'MAG +10.' },
  carbonarc:   { name: 'Carbon-Arc Lamp', slot: 'hand', who: ['daniel'], mods: [{ s: 'mag', add: 14 }], price: 24000, desc: 'MAG +14.' },
  silverscreen:{ name: 'Silver Screen', slot: 'hand', who: ['daniel'], mods: [{ s: 'mag', add: 19 }, { s: 'heal', add: 4 }], price: 0, desc: 'MAG +19, HEAL +4. Found, never sold.' },
  microphone:  { name: 'Microphone', slot: 'hand', who: ['vox'], mods: [{ s: 'mag', add: 2 }, { s: 'heal', add: 2 }], price: 0, desc: 'MAG +2, HEAL +2.' },
  headphones:  { name: 'Studio Headphones', slot: 'hand', who: ['vox'], mods: [{ s: 'mag', add: 5 }, { s: 'heal', add: 3 }], price: 4000, desc: 'MAG +5, HEAL +3.' },
  condenser:   { name: 'Condenser Mic', slot: 'hand', who: ['vox'], mods: [{ s: 'mag', add: 8 }, { s: 'heal', add: 5 }], price: 12000, desc: 'MAG +8, HEAL +5.' },
  boommic:     { name: 'Boom Mic', slot: 'hand', who: ['vox'], mods: [{ s: 'mag', add: 12 }, { s: 'heal', add: 7 }], price: 24000, desc: 'MAG +12, HEAL +7.' },
  goldrecord:  { name: 'Gold Record', slot: 'hand', who: ['vox'], mods: [{ s: 'mag', add: 16 }, { s: 'heal', add: 10 }], price: 0, desc: 'MAG +16, HEAL +10. Found, never sold.' },
  // body: everyone
  scarf:       { name: 'Scarf', slot: 'body', mods: [{ s: 'def', add: 2 }, { s: 'res', add: 1 }], price: 0, desc: 'DEF +2, RES +1.' },
  cardigan:    { name: 'Cardigan', slot: 'body', mods: [{ s: 'def', add: 5 }, { s: 'res', add: 3 }], price: 3500, desc: 'DEF +5, RES +3.' },
  woolcoat:    { name: 'Wool Coat', slot: 'body', mods: [{ s: 'def', add: 8 }, { s: 'res', add: 5 }], price: 11000, desc: 'DEF +8, RES +5.' },
  barnjacket:  { name: 'Barn Jacket', slot: 'body', mods: [{ s: 'def', add: 12 }, { s: 'res', add: 7 }], price: 22000, desc: 'DEF +12, RES +7.' },
  parka:       { name: 'Quilted Parka', slot: 'body', mods: [{ s: 'def', add: 15 }, { s: 'res', add: 10 }], price: 40000, desc: 'DEF +15, RES +10.' },
  afghan:      { name: 'Heirloom Afghan', slot: 'body', mods: [{ s: 'def', add: 19 }, { s: 'res', add: 14 }], price: 0, desc: 'DEF +19, RES +14. Found, never sold.' },
  // bookmarks (two slots). The five sold ones are plain; the rule-benders are found (report: FF6 sells boosts, hides the relics)
  brassclip:   { name: 'Brass Clip', slot: 'mark', flag: 'physUp', price: 12000, desc: 'Physical damage +25%.' },
  silkribbon:  { name: 'Silk Ribbon', slot: 'mark', flag: 'mindUp', price: 12000, desc: 'Damage from understanding commands +25%.' },
  clover:      { name: 'Pressed Clover', slot: 'mark', mods: [{ s: 'hpMax', mul: 1.5 }], price: 30000, desc: 'Max HP +50%.' },
  tassel:      { name: 'Leather Tassel', slot: 'mark', blocks: ['fogged', 'cliched'], price: 40000, desc: 'Blocks FOGGED and CLICHED.' },
  librarycard: { name: 'Library Card', slot: 'mark', flag: 'undUp', price: 64000, desc: 'Understanding from battles +25%.' },
  stitch:      { name: 'Running Stitch', slot: 'mark', flag: 'walkFast', price: 0, desc: 'Walk twice as fast. Found.' },
  dnd:         { name: 'Do Not Disturb', slot: 'mark', flag: 'shy', price: 0, desc: 'Weaker stories let go before a fight starts. Found.' },
  secondwind:  { name: 'Second Wind', slot: 'mark', flag: 'autoLife', price: 0, desc: 'Gets back up once per battle. Found.' },
  speedreader: { name: 'Speed-Reader', slot: 'mark', flag: 'fourHits', price: 0, desc: 'STRIKE becomes four half-power hits. Found.' },
  doublefeat:  { name: 'Double Feature', slot: 'mark', flag: 'twice', price: 0, desc: 'Understanding commands act twice. Found.' },
  marginalia:  { name: 'Marginalia', slot: 'mark', flag: 'halfCost', price: 0, desc: 'Clarity costs halved. Found.' },
  rebuttal:    { name: 'Rebuttal', slot: 'mark', flag: 'counter', price: 0, desc: 'Often answers a physical hit with one of its own. Found.' },
  giftreceipt: { name: 'Gift Receipt', slot: 'mark', flag: 'pages', price: 0, desc: 'Twice the Loose Pages, half the Understanding. Found.' },
  earlyed:     { name: 'Early Edition', slot: 'mark', flag: 'firstFull', price: 0, desc: 'Starts every battle ready to act. Found.' },
  nightlight:  { name: 'Night Light', slot: 'mark', flag: 'seeWeak', price: 0, desc: 'Shows every foe\'s weaknesses. Found.' },
  dustjacket:  { name: 'Dust Jacket', slot: 'mark', blocks: 'all', price: 0, desc: 'Blocks every status. Found late.' },
};
