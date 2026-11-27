"use strict";
// =====================================================================
//  RECORDED MUSIC (Nov 26). Christian: "Use rfab to make the music", "Epic ffvI or chrono trigger style", then "sure, cheap
//  first". Eight draft tracks were made on rfab.ai with ACE-Step 1.5 XL Turbo (about 1,000 tokens each), instrumental,
//  written as original music in the 16-bit orchestral manner (no game is named in the prompts). Trailing silence trimmed,
//  loudness evened to -18 LUFS, 128 kbps (scripts in the session; source files are on rfab under "The Unwritten - ...").
//  This layer sits on top of the chiptune score (music.js): where a recorded track exists for the place the score has
//  picked, the recorded track plays and the chiptune is faded out; everywhere else the chiptune plays as before.
//  Nov 26, Christian: "I like them, put them in." ON by default. CONFIG > MUSIC STYLE > CHIPTUNE (or ?chiptune) brings back the old score.
// =====================================================================
const REC_TRACKS = { title: 'title', battle: 'battle', boss: 'boss', victory: 'victory', store: 'figtree', captured: 'captured',
  town_spring: 'town', town_summer: 'town', town_fall: 'town', town_winter: 'town' };
const REC_ONCE = { victory: 1 };                 // plays once, from the top; the rest loop
const REC_RESTART = { battle: 1, boss: 1, victory: 1 };   // start from the top each time (town and home pick up where they left off)
PARTY_CFG.mrec = /[?&]chiptune\b/.test(location.search) ? 0 : 1;
const REC = { el: {}, cur: null, fade: {} };
function recOn() { try { const c = typeof pcfg === 'function' && G && G.party ? pcfg() : null; return !!SET.music && !!(c && c.mrec != null ? c.mrec : PARTY_CFG.mrec); } catch (e) { return false; } }
function recKey() {
  const w = MUSIC.want; if (!w) return null;
  if (w === 'captured' && typeof G !== 'undefined' && G && G.inside && G.inside.f === 'mill') return 'mill';
  if (/^town_/.test(w)) return 'town';
  return REC_TRACKS[w] || null;
}
function recEl(k) {
  if (!REC.el[k]) { const a = new Audio('audio/music/' + k + '.mp3'); a.preload = 'auto'; a.loop = !REC_ONCE[k]; a.volume = 0; REC.el[k] = a; REC.fade[k] = 0; }
  return REC.el[k];
}
function recTick() {
  const on = recOn(), k = on ? recKey() : null, vol = SET.musicVol * 0.9;
  if (k !== REC.cur) {
    if (k) { const a = recEl(k); if (REC_RESTART[k]) { try { a.currentTime = 0; } catch (e) {} } const p = a.play(); if (p && p.catch) p.catch(() => {}); }
    REC.cur = k;
  }
  for (const id in REC.el) {   // fade each track toward its target: about half a second
    const a = REC.el[id], tgt = id === REC.cur ? 1 : 0;
    REC.fade[id] += Math.sign(tgt - REC.fade[id]) * Math.min(Math.abs(tgt - REC.fade[id]), 0.2);
    a.volume = Math.max(0, Math.min(1, REC.fade[id] * vol));
    if (REC.fade[id] <= 0 && !a.paused) a.pause();
  }
  // the chiptune steps aside while a recorded track plays (its own volume setting is left alone)
  const out = MUSIC.out; if (out && out.gain) { const g = REC.cur ? 0 : 1; if (Math.abs(out.gain.value - g) > 0.01) out.gain.setTargetAtTime(g, AC.currentTime, 0.12); }
}
setInterval(() => { try { recTick(); } catch (e) {} }, 100);
// CONFIG: MUSIC STYLE, just after MUSIC VOLUME
if (typeof CFG_ROWS !== 'undefined') {
  const i = CFG_ROWS.findIndex(r => r[0] === 'mvol');
  CFG_ROWS.splice(i < 0 ? CFG_ROWS.length : i + 1, 0, ['mrec', 'MUSIC STYLE', [0, 1], { 0: 'CHIPTUNE', 1: 'RECORDED' }, 'RECORDED plays the new orchestral drafts where there is one (title, town, the Fig Tree, battles, captured houses, the Story Mill).']);
}
