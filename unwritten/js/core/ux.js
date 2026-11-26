"use strict";
// =====================================================================
//  UX PASS (Nov 26, 2026), from Laws of UX (Yablonski), applied with Christian's go-ahead:
//  - NEW GAME asks before it replaces a saved game (forgiveness; one save slot).
//  - The pause menu has five commands; PARTY holds skills, equip, status and order; BATTLE LAB sits in CONFIG.
//  - The menu shows one quiet "NEXT" line for the story (Von Restorff, Hick's Law). It names the next beat, never the purpose.
//  - The first walk shows the controls once (Jakob's Law).
//  - Saving ends on a calm line (Peak-End Rule). No streaks, no daily rewards, no "come back" nudges anywhere.
//  - A loading note covers the first seconds (Doherty Threshold).
//  Also changed in place: base.js (taller view on upright phones), touch.js (44 px buttons), mapplus.js (no "x of 56" counter).
// =====================================================================
// ---------- NEW GAME over a saved game: ask first (NO is the default) ----------
{ const T = MODES.title, _u = T.update, _d = T.draw, _e = T.enter;
  T.enter = function () { this.confirm = null; return _e.apply(this, arguments); };
  T.update = function () {
    if (this.confirm) {
      if (pressed.left || pressed.right || pressed.up || pressed.down) this.confirm.sel = 1 - this.confirm.sel;
      if (pressed.b) { this.confirm = null; return; }
      if (pressed.a) { const yes = this.confirm.sel === 0; this.confirm = null; if (yes) setMode('create'); }
      return;
    }
    if (pressed.a && this.opts[this.sel] === 'NEW GAME' && loadGame()) { this.confirm = { sel: 1 }; return; }
    return _u.apply(this, arguments);
  };
  T.draw = function () {
    _d.apply(this, arguments); if (!this.confirm) return;
    const w = 260, h = 70, x = (SW - w) / 2, y = SH / 2 - h / 2; win(x, y, w, h);
    txt('This replaces your saved game.', SW / 2, y + 10, '#fff', 'center'); txt('Start over?', SW / 2, y + 24, '#fff', 'center');
    ['YES, START OVER', 'NO, GO BACK'].forEach((o, i) => txt((this.confirm.sel === i ? '▶ ' : '  ') + o, x + 20 + i * 128, y + 46, this.confirm.sel === i ? '#ffd860' : '#c8c8e8', 'left', SMALL));
  }; }

// ---------- the pause menu: PARTY, BATTLE LAB in CONFIG, a calm SAVE ----------
{ const _do = pmDo; pmDo = function (c) {
  if (c === 'PARTY') return pmList('PARTY', [
    { t: 'STATUS', desc: 'Levels, stats and picks waiting.', f: () => pmPush({ kind: 'status', i: 0 }) },
    { t: 'SKILLS', desc: 'Use a skill outside battle.', f: () => pmWho('SKILLS: WHOSE?', pmSkills) },
    { t: 'EQUIP', desc: 'What each member carries.', f: () => pmWho('EQUIP: WHO?', pmEquip) },
    { t: 'ORDER', desc: 'Who fights, and in which row.', f: () => pmOrder() }]);
  if (c === 'SAVE') { saveGame(); return pmMsg('Saved. A good place to stop for now.'); }
  return _do(c);
}; }
{ const _pc = pmConfig; pmConfig = function () { _pc(); if (PMN && PMN.view && PMN.view.kind === 'list') PMN.view.rows.push({ t: 'BATTLE LAB', right: '', desc: 'Practice fights and timed presses.', f: () => pmLab() }); }; }

// ---------- NEXT: one line for where the story goes next ----------
function uxNext() {
  if (typeof isRPG === 'function' && !isRPG()) return '';
  if (!G || !G.party) return '';
  if (!partyHas('christian')) return G.leftRoom ? 'Walk to The Blessed Fig Tree, at Fifth Avenue and Clermont Street.' : 'Leave your room.';
  const steps = [['danny', 'Find Danny at UMA, the martial arts gym.'], ['cecil', 'Find Cecil at Respawn Gaming Lounge.'], ['daniel', 'Ask for Daniel at the Palace Theatre.'],
    ['vox', 'Look for Vox in the Antigo Public Library.'], ['robin', 'Someone is waiting outside Antigo High School.']];
  for (const [id, line] of steps) if (CLASSES[id] && !partyHas(id)) return line;
  return 'The town is yours to explore.';
}
{ const _dm = pmDrawMain; pmDrawMain = function (sel) {
  _dm(sel); const n = uxNext(); if (!n) return;
  win(264, 222, SW - 270, SH - 228); txt('NEXT', 272, 230, '#ffd860', 'left', SMALL);
  ctx.font = SMALL; wrap(n, SW - 290).slice(0, Math.floor((SH - 250) / 11)).forEach((l, i) => txt(l, 272, 244 + i * 11, '#fff', 'left', SMALL));
}; }

// ---------- the controls, once, on the first walk ----------
{ const W = MODES.walk, _u = W.update; W.update = function () {
  if (G && !G.seenCtl && !DLG && P.t === 0) {
    G.seenCtl = 1; const touch = typeof IS_TOUCH !== 'undefined' && IS_TOUCH;
    say(touch ? [['', 'Controls: the pad walks. A talks, looks and confirms. Hold B to run; B also goes back.'], ['', 'MENU has your party and saving. MAP shows the town.']]
      : [['', 'Controls: arrow keys walk. Z (or Enter) talks, looks and confirms. Hold X to run; X also goes back.'], ['', 'C opens the menu and saves. M shows the map. A gamepad works too.']]);
    return;
  }
  return _u.apply(this, arguments);
}; }

// ---------- the loading note goes away once everything has loaded ----------
requestAnimationFrame(() => { const b = document.getElementById('boot'); if (b) b.remove(); });
