"use strict";
// =====================================================================
//  HOW TO PLAY (Nov 26; Ham, Learning Video Game Design on the Tabletop, ch. 8: a one-page reference card).
//  CONFIG > HOW TO PLAY: five short pages. It explains controls and rules only, never the story or its purpose.
// =====================================================================
const HOWTO = [
  ['CONTROLS', 'MOVE: arrow keys or WASD. A: Enter, Z or Space (talk, look, choose). B: Esc, X or Backspace (back; hold it to run). M: the town map. C: this menu. N: the sky. A gamepad works too. On a phone, use the pad at the bottom of the screen.'],
  ['GETTING AROUND', 'This is the real Antigo, street by street. Walk up to a door or a sign and press A. Arrows bob over doors you can open. M opens the map: pick a place from PLACES and you can ride there. The NEXT line in this menu always says where to go next.'],
  ['FIGHTS', 'Each fighter acts when their time gauge fills. Press A just as a hit lands for a stronger blow, or just as one comes at you to take less. Nobody dies here: a foe is a story that lets go when it runs out, and a friend who falls is only down.'],
  ['UNDERSTANDING', 'UNDERSTAND holds the moves every story is weak to: QUESTION, LISTEN, NAME IT, REFLECT, STEP BACK and more. A weak spot wears its guard down until it is OPEN. A story freed with understanding pays half again as much. The BESTIARY keeps what you learn about each one.'],
  ['FRIENDS AND SAVING', 'The Blessed Fig Tree is home base. Three fight at a time; the others wait at the store and still learn from every fight. Change who comes along at the store. SAVE in this menu any time. Lose a fight and you just come to again, with nothing lost.'],
];
function pmHowTo() { pmList('HOW TO PLAY', HOWTO.map(([t, s]) => ({ t, right: '', desc: s.split('. ')[0] + '.', f: () => pmMsg(s) }))); }
{ const _pc = pmConfig; pmConfig = function () { _pc(); if (PMN && PMN.view && PMN.view.kind === 'list') PMN.view.rows.unshift({ t: 'HOW TO PLAY', right: '', desc: 'Controls, fights and saving, one page each.', f: () => pmHowTo() }); }; }
