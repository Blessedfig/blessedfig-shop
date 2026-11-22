// Queue for hand corrections (Nov 19). Each js/data/fixes/<area>.js pushes one entry; js/data/fixmerge.js and fixstalls.js apply them.
var FIXQ = [];
// brand signs at stores, restaurants and gas stations (Nov 19): { x, y (gm, the pole's foot), text, bg, fg, style: 'pole' | 'monument' | 'pylon', h (m, pole height) }
var BRANDSIGNS = [];
