"use strict";
// =====================================================================
//  SOUND (Nov 26, 2026): the audio context, the settings, short sound effects, and SND, which the battle engine,
//  the courts, disc golf and the schools already call. Loaded before music.js (v0.36's SNES-style score, ported).
//  Settings live in the save (G.party.cfg: music on/off, music and sound volume 0-10) and are mirrored to this
//  browser so the title screen plays at the same volume before a save is loaded.
//  Browsers only allow sound after the player presses something, so nothing plays until the first key or tap.
// =====================================================================
let AC = null;
function initAudio() { if (AC) return; try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
const AUD_DEF = { music: 1, mvol: 7, svol: 7 };
let AUD_LOCAL = (() => { try { return Object.assign({}, AUD_DEF, JSON.parse(localStorage.getItem('unwritten_audio') || '{}')); } catch (e) { return Object.assign({}, AUD_DEF); } })();
Object.assign(PARTY_CFG, AUD_DEF);
function audCfg() {
  const c = typeof G !== 'undefined' && G && G.party && G.party.cfg;
  if (c && c.mvol != null) {
    if (c.music !== AUD_LOCAL.music || c.mvol !== AUD_LOCAL.mvol || c.svol !== AUD_LOCAL.svol) {
      AUD_LOCAL = { music: c.music, mvol: c.mvol, svol: c.svol };
      try { localStorage.setItem('unwritten_audio', JSON.stringify(AUD_LOCAL)); } catch (e) {}
    }
    return c;
  }
  return AUD_LOCAL;
}
const SET = {
  get music() { return !!audCfg().music; },
  get musicVol() { return Math.max(0, Math.min(10, +audCfg().mvol || 0)) / 10; },
  get sfxVol() { return Math.max(0, Math.min(10, +audCfg().svol || 0)) / 10; },
};
// the season for the town waltzes, from the real calendar (sky.js)
function seasonNow() {
  const p = typeof SKY !== 'undefined' ? SKY.phase : 'spring';
  return p === 'snow' ? 'winter' : p === 'spring' || p === 'leafout' ? 'spring' : p === 'color' || p === 'bare' ? 'fall' : 'summer';
}
function tone(f, d, type = 'square', v = 0.04, delay = 0) {
  if (!AC || AC.state !== 'running') return; const k = SET.sfxVol * 1.25; if (k <= 0.001) return; v *= k;
  try {
    const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f; o.connect(g); g.connect(AC.destination);
    const t = AC.currentTime + delay; g.gain.setValueAtTime(0.0001, AC.currentTime); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.start(t); o.stop(t + d + 0.02);
  } catch (e) {}
}
// short effects, kept quiet and below the music's register (Aristopoulos: separate sound effects from the score)
const SFX = {
  cursor: () => tone(880, 0.035, 'square', 0.025),
  ok: () => { tone(660, 0.05); tone(990, 0.07, 'square', 0.04, 0.05); },
  back: () => { tone(520, 0.05, 'square', 0.03); tone(390, 0.06, 'square', 0.03, 0.05); },
  hit: () => { tone(120, 0.12, 'sawtooth', 0.06); tone(70, 0.08, 'square', 0.04); },
  cast: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.08, 'triangle', 0.045, i * 0.04)); },
  heal: () => { tone(523, 0.08, 'triangle', 0.06); tone(784, 0.12, 'triangle', 0.06, 0.08); },
  weak: () => { tone(330, 0.06, 'square', 0.05); tone(494, 0.09, 'square', 0.05, 0.06); },
  break: () => { tone(80, 0.25, 'sawtooth', 0.08); tone(1800, 0.05, 'square', 0.03); },
  free: () => { [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.12, 'triangle', 0.05, i * 0.07)); },
  ready: () => tone(1175, 0.05, 'triangle', 0.035),
  tick: () => tone(1500, 0.02, 'square', 0.02),
  beat: () => tone(220, 0.05, 'triangle', 0.05),
  bump: () => tone(90, 0.06, 'square', 0.03),
  level: () => { tone(200, 0.1, 'square', 0.06); tone(400, 0.1, 'square', 0.04, 0.07); tone(800, 0.18, 'square', 0.04, 0.14); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? 0.3 : 0.1, 'square', 0.04, i * 0.09)); },
  lose: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.22, 'triangle', 0.05, i * 0.18)); },
};
const SND = {
  play(k) { initAudio(); const f = SFX[k] || SFX.cursor; f(); },
  battle(boss) { initAudio(); },                         // the music picker follows mode === 'battle' and BT.boss
  win() { if (!(typeof MUSIC !== 'undefined' && MUSIC.canSting())) SFX.win(); },   // with music on, the victory track is the fanfare
  lose() { SFX.lose(); },
  resume() {},
};
function audioWake() { initAudio(); if (AC && AC.state === 'suspended') AC.resume().catch(() => {}); }
['keydown', 'pointerdown', 'touchstart'].forEach(ev => addEventListener(ev, audioWake, { capture: true, passive: true }));
