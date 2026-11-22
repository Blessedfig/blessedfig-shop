"use strict";
// ============================================================================
// Playgrounds as the WROC May 2025 photo shows them (Christian, Nov 18: "the cherry street park, and most of the parks,
// don't have playground equipment"). OpenStreetMap marked 12 spots and the game drew one climber and one swing set at
// each; some were in the wrong place (City Park East's was in the trees, 60 m from the real one) and several play
// areas were missing. Each area below is measured off a 5 m grid on the photo (game metres): its surface (sand, wood
// chips or poured rubber) and where its equipment stands. The equipment's kind is generic; the photo shows where.
// ============================================================================
(function () {
  const PG = [
    ['Cherry Street Park', [2894, 5078, 2906, 5090], 'sand', [['swings', 2899, 5081], ['climber', 2902, 5088]]],
    ['Lake Park', [3780, 3598, 3810, 3612], 'sand', [['climber', 3790, 3607], ['climber', 3800, 3604], ['swings', 3804, 3610]]],
    ['Lake Park', [3757, 3598, 3768, 3608], 'sand', [['swings', 3762, 3605]]],
    ['Lake Park', [3757, 3614, 3770, 3634], 'sand', [['climber', 3763, 3621], ['climber', 3766, 3631]]],
    ['Lake Park', [3783, 3628, 3791, 3636], 'sand', [], 1],
    ['Lake Park', [3801, 3626, 3811, 3634], 'sand', [['swings', 3806, 3631]]],
    ['Hudson Park', [3575, 3598, 3595, 3620], 'chips', [['climber', 3582, 3606], ['climber', 3590, 3615]]],
    ['City Park East', [4166, 4420, 4186, 4442], 'pour', [['climber', 4174, 4429], ['climber', 4179, 4438]]],
    ['City Park East', [4183, 4370, 4202, 4385], 'sand', [['swings', 4188, 4378], ['climber', 4196, 4380]]],
    ['City Park West', [4000, 4410, 4012, 4422], 'chips', [['climber', 4004, 4414], ['swings', 4009, 4420]]],
    ['Peaceful Valley Park', [3377, 4028, 3399, 4073], 'chips', [['climber', 3385, 4040], ['climber', 3392, 4055], ['swings', 3388, 4067]]],
    ['Mendik Park', [3105, 2590, 3117, 2601], 'sand', [['swings', 3111, 2597]]],
    ['Saratoga Park', [2723, 2884, 2737, 2898], 'sand', [['climber', 2728, 2890], ['swings', 2733, 2896]]],
    ['Third Ward Park', [2466, 3294, 2480, 3308], 'sand', [['swings', 2470, 3300], ['climber', 2476, 3305]]],
    ['', [3412, 3022, 3425, 3033], 'sand', [['climber', 3418, 3029]]],
    ['', [3404, 3042, 3416, 3054], 'chips', [['swings', 3410, 3049]]],
    ['', [2432, 3650, 2450, 3664], 'chips', [['climber', 2440, 3658]]],
    ['North Clermont Playground', [3048, 1800, 3061, 1811], 'sand', [['climber', 3054, 1807]]],
    ['North Clermont Playground', [3070, 1797, 3085, 1815], 'sand', [['swings', 3076, 1803], ['climber', 3079, 1811]]],
    ['North Clermont Playground', [3051, 1782, 3059, 1790], 'sand', [], 1],
    ['', [3835, 4082, 3855, 4094], 'sand', [['climber', 3845, 4089]]],
  ];
  // out with the old generic spots
  for (let i = SPT.length - 1; i >= 0; i--) if (SPT[i].k === 'play') SPT.splice(i, 1);
  for (let i = PROPS.length - 1; i >= 0; i--) if (PROPS[i].k === 'climber' || PROPS[i].k === 'swings') PROPS.splice(i, 1);
  for (const [name, [x0, y0, x1, y1], surf, items, round] of PG) {
    SPT.push({ k: 'pgnd', x: (x0 + x1) / 8, y: (y0 + y1) / 8, a: 0, L: (x1 - x0), W: (y1 - y0), ex: { surf, round } });
    for (const [k, x, y] of items) PROPS.push({ k, x: x / 4, y: y / 4, reach: 2, name });
  }
  PROPS.sort((a, b) => a.y - b.y);
  const COL = { sand: ['#d8c8a0', '#c8b68a'], chips: ['#9a7048', '#7e5a38'], pour: ['#d8dcd8', '#c4c8c4'] };
  SPDRAW.pgnd = s => { const [c1, c2] = COL[s.ex.surf], L = s.L, W = s.W;
    if (s.ex.round) { spArc(0, 0, L / 2, 0, 6.29, '#a89870', c1); return; }
    spRect(shade(c1, -0.25), -L / 2 - 0.3, -W / 2 - 0.3, L + 0.6, W + 0.6); spRect(c1, -L / 2, -W / 2, L, W);
    for (let i = 0; i < L * W / 3; i++) { const h = hash(i * 13, Math.round(s.x * 7 + s.y)); spRect(c2, -L / 2 + (h % 1000) / 1000 * (L - 0.4), -W / 2 + ((h >> 10) % 1000) / 1000 * (W - 0.3), 0.4, 0.25); } };
  SPORT_SAY.pgnd = 'A playground.';
})();
