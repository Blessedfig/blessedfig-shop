"use strict";
// Menu sounds (Nov 26): a soft blip when the cursor moves in the field menu or a dialog choice, a two-note OK
// when a choice is taken, a falling pair when B backs out. Watches the selection instead of editing each menu.
(function () {
  const selOf = () => {
    if (mode === 'pmenu' && typeof PMN !== 'undefined' && PMN && PMN.view) return 'p' + (PMN.view.sel != null ? PMN.view.sel : PMN.view.i);
    if (typeof DLG !== 'undefined' && DLG && DLG.opts) return 'd' + DLG.sel;
    return null;
  };
  for (const k of Object.keys(MODES)) {
    const M = MODES[k]; if (!M || !M.update) continue;
    const up = M.update;
    M.update = function () {
      const before = selOf(), inChoice = typeof DLG !== 'undefined' && DLG && DLG.opts, a = pressed.a, b = pressed.b;
      const r = up.apply(this, arguments);
      try {
        const after = selOf();
        if (before != null && a && (inChoice || mode === 'pmenu')) SND.play('ok');
        else if (before != null && b) SND.play('back');
        else if (before != null && after != null && before !== after && before[0] === after[0]) SND.play('cursor');
      } catch (e) {}
      return r;
    };
  }
})();

// CONFIG rows for sound (FF6 keeps sound settings in CONFIG too). Volumes run 0-10; music OFF keeps the effects.
CFG_ROWS.push(
  ['music', 'MUSIC', [1, 0], { 1: 'ON', 0: 'OFF' }, 'The score: the town by season, the store, battles. Sound effects stay on either way.'],
  ['mvol', 'MUSIC VOLUME', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], null, 'Press A to step it up; after 10 it goes back to 0.'],
  ['svol', 'SOUND VOLUME', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], null, 'Menu blips and battle sounds. 0 is silent.']);
