"use strict";
// Street facts by address (Nov 12), taken from Street View screenshots Christian sent as visual reference.
// Only plain facts are recorded here: colours, materials, roof shape, porches, number of storeys, and the name
// on a business's own sign. Nothing is traced or copied; every building is still drawn by the game's own painter.
// Homes are styled only; no owner or resident is ever named.
//
// Keys: an address ('1114 5TH AVE'), or '@x,y' for a building with no address (its centre in 4 m cells).
// An address entry styles the tallest building at that address (the lidar's house, not the shed),
// unless the entry says all: 1. A building the county typed as a garage gets house windows when styled as a home.
// Fields: wall, mat, roof, roofCol, m (wall height in metres), floors, win, awning, porch ('full'|'L'|'R'|'C'),
// porchCol, stone (stone base colour), gd (garage doors), gdAt, gdCol, winAwn, chimney, name, addr,
// shop ('wdw' = window, door, window), upWin, trim, panels, accents, plaque, stack ('W'|'E'), piers,
// baseCol/baseH/baseMat (a different lower storey), cornice, metalBand, bandCol, signBox, pediment, temple.
const FACADES = {
  // name fixes only (capitals as the businesses write them)
  '734 5TH AVE': { name: 'BMO Bank' },
  // Respawn Gaming Lounge, 725 5th Ave (Christian, Nov 13, from Respawn's own contact page photo): cream stucco upstairs with two
  // windows, red brick storefront, a green-and-yellow striped awning, the shop window between two doors. Its own 8 m x 37 m
  // building since Nov 13 (scripts/town/split_respawn.py cut it from the 721 outline on the county parcel line).
  '725 5TH AVE': { name: 'Respawn Gaming Lounge', wall: '#d6c79e', mat: 'board', baseCol: '#8e3a2c', baseMat: 'brick', baseH: 3.6, awning: '#3e6a2c', awnStripe: '#e2c64a', win: 'store', shop: 'wdw', floors: 2, m: 7.6 },
  '1704 NEVA RD': { name: 'KFC / Taco Bell' },
  // Volm Companies' plant and offices (Nov 14). The county parcel lists the owner as the bag company; the sign name is the company's own.
  '1804 EDISON ST': { name: 'Volm Companies' },
  // ---------- the 800 block, north side ----------
  '802 5TH AVE': { wall: '#c39c6a', mat: 'brick', cornice: 1, awning: '#d8c49a' },
  '808 5TH AVE': { wall: '#ecebe4', mat: 'panel', win: 'band', awning: null },
  '814 5TH AVE': { wall: '#a8563e', mat: 'brick', awning: null },
  '816 5TH AVE': { wall: '#e4e2dc', mat: 'brick', awning: null, trim: '#8a8c90' },
  '820 5TH AVE': { wall: '#dcdad4', mat: 'brick', awning: null, trim: '#8a8c90' },
  // Harper's Mercantile: the taller red-brick front with a rounded stepped parapet and stone plaque, three upper windows,
  // a dark sign fascia and a dark awning. 826, the lower red-brick front beside it, has recessed panels and no upper windows.
  '824 5TH AVE': { wall: '#b25a3c', mat: 'brick', awning: '#3a3a3e', floors: 2, upWin: 3, trim: '#e4dcc8', plaque: 1 },
  '826 5TH AVE': { wall: '#a8553c', mat: 'brick', awning: '#4a4a4e', floors: 1, panels: 1 },
  // Unified Martial Arts: one storey (with a basement), brown brick with light stone accents in the parapet,
  // a shingled pent awning, and a glass door between two display windows.
  '832 5TH AVE': { wall: '#8a5a40', mat: 'brick', awning: '#7a6a5a', m: 5.4, floors: 1, shop: 'wdw', accents: '#d8c8a6' },
  '836 5TH AVE': { wall: '#e6e2d8', mat: 'brick', awning: null, trim: '#d4a48a', metalBand: 1, pediment: 'HILL' },
  // the McKenzie Palace Theatre (Nov 13): Antigo's two-screen movie house. Its public address is 823 Fifth Ave (Travel
  // Wisconsin lists 825); the county parcel files the 17 x 53 m building under 827. Red brick, a marquee and a PALACE sign
  // (Christian's photo, reference only); the doors are in the middle of the front. Inside: js/core/palace.js.
  // Kastawayz (burgers, sandwiches, panini; the county's dining list puts it at 827 Fifth): the narrow 827 storefront beside
  // the theater. The data had the name on a small outbuilding behind it.
  '@727.3,967.4': { name: 'Kastawayz' }, '@727.3,973.1': { name: '' },
  '@730.1,968.9': { name: 'McKenzie Palace Theatre', addr: '823 5TH AVE', door: [730, 962], wall: '#9a4a36', mat: 'brick', win: 'none', awning: null, m: 10, floors: 2 },
  // ---------- Edison and Fifth ----------
  '902 5TH AVE': { name: "Colleen's Craft Shed", wall: '#e0624c', mat: 'brick', awning: null, metalBand: 1, bandCol: '#5c5e64', signBox: '#e8735a' },
  '907 5TH AVE': { wall: '#7e8c9a', mat: 'panel', awning: null },
  // 918: a painted white block building with tan brick corner piers and a red awning (its sign reads Pampered Paws Pet Grooming);
  // 924, west of it, is small, gabled, in red-brown vertical boards.
  '918 5TH AVE': { name: 'Pampered Paws Pet Grooming', wall: '#efebe0', mat: 'panel', awning: '#b8282e', piers: '#c8a070', m: 4.2, floors: 1 },
  '924 5TH AVE': { wall: '#9a5a48', mat: 'board', roof: 'gable', roofCol: '#7a5a4a', awning: null, floors: 1 },
  // ---------- the 1000 block ----------
  // Pavek's Antigo Bakery is at 1012 Fifth Ave (Chamber listing); the county footprint carried 1004. Two-storey brick, flat roof,
  // a tall chimney at the west end, a small brown awning over the corner door.
  '1004 5TH AVE': { name: "Pavek's Antigo Bakery", addr: '1012 5TH AVE', wall: '#a8553a', mat: 'brick', awning: '#7a5a3a', stack: 'W', floors: 2 },
  '1005 5TH AVE': { wall: '#b4b8bc', mat: 'ribbed', awning: null },
  '1009 5TH AVE': { wall: '#a24a34', mat: 'brick', awning: null },
  '1015 5TH AVE': { name: "Hix's Hoffman House", wall: '#c8b898', mat: 'stone', cornice: 1, awning: null },
  '1027 5TH AVE': { wall: '#9a9ea2', mat: 'ribbed', awning: '#b03030' },
  '1029 5TH AVE': { name: 'Antigo Family Chiropractic Center', wall: '#c8b896', mat: 'siding', awning: '#2a6a4a', floors: 1 },
  '1031 5TH AVE': { wall: '#eeede8', mat: 'siding', roof: 'gable', roofCol: '#8a7a6a', win: 'house', awning: null, parapet: 0 },
  '1046 5TH AVE': { wall: '#ecebe6', mat: 'panel', awning: null },
  // ---------- the 700 block, north side ----------
  '734 5TH AVE': { wall: '#e8e2d4', mat: 'panel', awning: '#5a4a3e' },
  '728 5TH AVE': { wall: '#a8503a', mat: 'brick', awning: null, upWin: 3, trim: '#e4dcc0', floors: 2 },
  '720 5TH AVE': { wall: '#c9ab84', mat: 'brick', awning: '#3a8a3a' },
  '716 5TH AVE': { name: 'Dixie Lunch', wall: '#9a6a50', mat: 'stone', awning: '#a85a48' },
  '710 5TH AVE': { name: '', wall: '#e8e0cc', mat: 'stone', cornice: 1, awning: '#b8323a' },
  // Fifth and Superior, northwest corner (owner's photo): Chase is the three-storey limestone bank on the corner itself,
  // a pediment over four tall columns and an arched door; its Superior St side has blue awnings. West of it, the taller
  // building that carries the big flag mural on its east wall above the bank's roof.
  '@786.4,952.4': { name: 'Chase Bank', wall: '#d6ccb8', mat: 'stone', awning: null, temple: 1, floors: 3, m: 12.5, cornice: 1 },
  '@782.3,952.4': { name: '', wall: '#ddd4c0', mat: 'panel', awning: null, mural: 1 },
  // the northeast corner of Fifth and Superior is all the VP Fuels station (owner's photos, checked on the 2025 aerial):
  // the outline at the corner is the pump canopy itself (you can walk under it), and the store behind it to the north,
  // signed Rem's Midtown, is the long low white building with a stone base and a blue band
  '601 SUPERIOR ST': { name: 'VP Fuels', canopyOnly: 1, canopyH: 4.6, pylon: [797.0, 955.6] },
  '@802.2,945.1': { name: '', wall: '#efeee8', mat: 'panel', win: 'store', baseCol: '#9a8a78', baseMat: 'stone', baseH: 0.9, awning: '#1e4fb0', roof: 'flat', roofCol: '#5e6064', floors: 1, m: 4.4, chimney: 0 },
  '609 SUPERIOR ST': { name: '', wall: '#efeee8', mat: 'panel', win: 'store', baseCol: '#9a8a78', baseMat: 'stone', baseH: 0.9, awning: '#1e4fb0', roof: 'flat', roofCol: '#5e6064', floors: 1, m: 4.4, chimney: 0 },
  // the southeast corner (owner's photo facing south): Chase's drive-up, a small red-brick building under a white flat canopy
  // over the drive lanes, a flag and the CHASE pylon; east of it a tan stucco two-storey; behind, bb jack's in red brick
  '535 SUPERIOR ST': { wall: '#a8503a', mat: 'brick', awning: null, floors: 1, canopy: [798.4, 962.4, 800.8, 967.2, 3.6], canopyCol: '#eeeeea', postCol: '#eeeeea', pumps: 0 },
  '631 5TH AVE': { wall: '#c4b8a4', mat: 'panel', awning: null, floors: 2 },
  '629 5TH AVE': { wall: '#cfae98', mat: 'brick', awning: null },
  '523 SUPERIOR ST': { wall: '#9a4a36', mat: 'brick', awning: null, floors: 1 },
  // ---------- the 600 block, north side ----------
  // 612, east of the station's lawn and the alley ramp (owner's photo): dark grey painted brick, tall upper windows,
  // a ground storey in grey vertical panels with wide windows and a white sign board
  '612 5TH AVE': { wall: '#4a4e54', mat: 'brick', cornice: 1, awning: null, floors: 3, baseCol: '#6a6e72', baseMat: 'board', baseH: 3.4, shop: 'wdw' },
  '604 5TH AVE': { wall: '#e6dcc4', mat: 'panel', baseCol: '#9a7a62', baseMat: 'stone', baseH: 3.2, piers: '#b06a3a', awning: null, floors: 2 },
  // 602, on the corner: red brick with white trim, wrapped at the corner by a log-post porch under a shingled roof
  '602 5TH AVE': { wall: '#a04a36', mat: 'brick', awning: null, trim: '#ecebe6', porch: 'R', porchCol: '#7a4030' },
  // across the side street: Lakeside Market, tan ribbed metal over a fieldstone base, a low gable with maroon trim
  '536 5TH AVE': { name: 'Lakeside Market', wall: '#d6c8a8', mat: 'ribbed', baseCol: '#a89a88', baseMat: 'stone', baseH: 1.1, roof: 'gable', roofCol: '#8a5a52', win: 'none', awning: null, parapet: 0 },
  // the 500 block east of Lakeside Market: a white storey-and-a-half with a teal window awning, then a cream two-storey
  // with dark brown roof, dark shutters and a brick-based porch
  '508 5TH AVE': { wall: '#f2f1ea', roofCol: '#5c6064', winAwn: '#2a8a7a', chimney: 1 },
  '504 5TH AVE': { wall: '#e8dcc0', roofCol: '#6a4a40', porch: 'R', porchCol: '#9a4a38', chimney: 1 },
  // ---------- east of Superior: the 400s down to the hospital, north side ----------
  '434 5TH AVE': { wall: '#5e646a', roofCol: '#5c6064', porch: 'full', porchCol: '#f2f1ea' },
  '426 5TH AVE': { wall: '#a8b2bc', roofCol: '#6a6c70', porch: 'L', chimney: 1, floors: 1 },
  '418 5TH AVE': { wall: '#a6a8a4', roofCol: '#5c6064', porch: 'full', porchCol: '#f2f1ea' },
  '412 5TH AVE': { wall: '#cdb894', mat: 'panel', roofCol: '#6a4a3a', chimney: 1, stone: '#8a7a6a', porch: 'R', porchCol: '#7a4a32' },
  '402 5TH AVE': { wall: '#f2f1ea', roofCol: '#5c6064', porch: 'full' },
  '336 5TH AVE': { wall: '#e6dcc4', mat: 'brick', roofCol: '#8a8a88', porch: 'C', porchCol: '#d8d0b8' },
  '330 5TH AVE': { wall: '#a24a38', mat: 'brick', roofCol: '#7a7a78', floors: 1 },
  '322 5TH AVE': { wall: '#b4b896', roofCol: '#6a5040', gd: 1, gdAt: 'R' },
  '316 5TH AVE': { wall: '#a8968a', roofCol: '#7a6a64', porch: 'R' },
  '310 5TH AVE': { wall: '#f2f1ea', roofCol: '#6a6c70', porch: 'L' },
  // the tan-brick apartment buildings on Virginia St, just off Fifth
  '604 VIRGINIA ST': { all: 1, wall: '#c98a5c', mat: 'brick', roof: 'gable', roofCol: '#6a5a50', win: 'house', floors: 2, parapet: 0 },
  '234 5TH AVE': { wall: '#f2f1ea', roofCol: '#6a6c70' },
  '224 5TH AVE': { wall: '#ece4d4', roofCol: '#8a7a68' },
  '202 5TH AVE': { wall: '#9aa4ae', roofCol: '#5c6064' },
  '136 5TH AVE': { wall: '#b8b4a4', roofCol: '#6a4a40', porch: 'R', chimney: 1 },
  '128 5TH AVE': { wall: '#c4ae88', roofCol: '#6a5a4c', stone: '#8a8278' },
  '116 5TH AVE': { wall: '#f4f3ee', roofCol: '#5a7a5a', porch: 'full', floors: 2 },
  '102 5TH AVE': { wall: '#a8683c', mat: 'board', roofCol: '#6a4a3a', porch: 'full', porchCol: '#8a5a32' },
  // Aspirus Langlade Hospital (owner's photos, Nov 12): north of Fifth, tan brick with high strip windows, a green-glass
  // curtain wall and a stone pier carrying the Aspirus sign, facing the big parking lot; south of Fifth, the long beige
  // outpatient and cancer-center buildings with a domed entrance canopy, joined to the north side by an enclosed walkway over Fifth.
  // its real outline, traced from the 2017 county lidar (the old map data had only a box around the whole campus):
  // the main block set at an angle, and the Antigo Clinic wing running south toward Fifth along Aurora St
  '112 E 5TH AVE': { type: 'hospital', okind: 'health', wall: '#c9a47a', mat: 'brick', win: 'band', awning: null, glass: 1, pier: '#b09878', door: [1052, 931],
    polyQ: [4139, 3792, 4121, 3792, 4116, 3788, 4118, 3765, 4114, 3756, 4118, 3752, 4118, 3735, 4114, 3731, 4114, 3709, 4131, 3710, 4140, 3702, 4128, 3689, 4132, 3676, 4142, 3671, 4140, 3666, 4148, 3659, 4152, 3652, 4150, 3648, 4164, 3638, 4203, 3638, 4235, 3650, 4236, 3694, 4232, 3691, 4236, 3688, 4229, 3682, 4211, 3720, 4206, 3720, 4181, 3712, 4174, 3717, 4174, 3725, 4169, 3732, 4164, 3727, 4166, 3716, 4162, 3712, 4156, 3714, 4148, 3720, 4146, 3756, 4150, 3767, 4144, 3774, 4146, 3788] },
  '103 E 5TH AVE': { wall: '#d8ccb4', mat: 'panel', win: 'band', dome: 1, domeDx: 2 },
  '113 E 5TH AVE': { wall: '#d8ccb4', mat: 'panel', win: 'band', skyway: [1044.7, 1046.3, 954.6, 968.6, 4.4, 8.2] },
  '115 E 5TH AVE': { wall: '#d8ccb4', mat: 'panel', win: 'band' },
  // E Fifth by Langlade Rd: the cream Queen Anne with a corner turret at its west end and a green-roofed wraparound porch;
  // east of it a white house with red trim; behind them on Langlade Rd a tan two-storey
  '208 E 5TH AVE': { wall: '#efe8d4', roofCol: '#7a6a5e', porch: 'full', porchCol: '#f2f1ea', turret: 1, turretAt: 'L' },
  '220 E 5TH AVE': { wall: '#aeb4ba', roofCol: '#5c6064', trim: '#8a2a3a', winAwn: '#8a2a3a' },
  '224 E 5TH AVE': { wall: '#ebe2cc', roofCol: '#8a7a68', stone: '#9a8268', chimney: 1, floors: 1 },
  '228 E 5TH AVE': { wall: '#f2f1ea', roofCol: '#6a6c70', porch: 'R', floors: 1 },
  '230 E 5TH AVE': { all: 1, wall: '#f2f1ea', roofCol: '#6a6c70' },
  '236 E 5TH AVE': { wall: '#ecebe4', roofCol: '#a0603e', chimney: 1, porch: 'R', porchCol: '#8a6a50' },
  '328 E 5TH AVE': { wall: '#f2f1ea', roofCol: '#5c6064', chimney: 1, floors: 1 },
  // north side of E Fifth past Park St (the county writes County Rd F as CTY F)
  '309 E 5TH AVE': { wall: '#f2f1ea', roofCol: '#a0603e', chimney: 1 },
  '311 E 5TH AVE': { wall: '#8e9282', mat: 'board', roofCol: '#7a7670', porch: 'C', porchCol: '#c8b498', floors: 2, m: 6.2 },
  '313 E 5TH AVE': { all: 1, wall: '#f2f1ea', roofCol: '#5c6064', chimney: 1, winAwn: '#e8ecf0', floors: 1 },
  '423 CTY F': { wall: '#c8ccd2', roofCol: '#6a6c70', stone: '#b04a3a', stoneH: 0.6, porch: 'C', porchCol: '#a87a58' },
  '425 CTY F': { wall: '#f2f1ea', roofCol: '#8a8a86', porch: 'L', floors: 1 },
  '503 CTY F': { wall: '#f2f1ea', roofCol: '#4e5258', porch: 'L', floors: 2 },
  '511 CTY F': { wall: '#e4dcc0', roofCol: '#6a6c70', chimney: 1, gd: 1, gdAt: 'L', floors: 1 },
  '517 CTY F': { wall: '#eeeee8', roofCol: '#7a7a78', porch: 'C', porchCol: '#8a3a2a' },
  '521 CTY F': { all: 1, wall: '#f2f1ea', roofCol: '#8a8a86', porch: 'full' },
  '525 CTY F': { wall: '#2a3a5a', roofCol: '#6a6c70', porch: 'L', porchCol: '#f2f1ea' },
  // County Rd F, south side, out past the town line
  'W9610 CTY F': { wall: '#2e3a48', mat: 'board', roofCol: '#4e5258', stone: '#a89480', gd: 1, gdAt: 'L', gdCol: '#f2f1ea' },
  'W9588 CTY F': { wall: '#f2f1ea', roofCol: '#5c6064', gd: 2, gdAt: 'L', floors: 1 },
  'W9582 CTY F': { all: 1, wall: '#c4ccd4', roofCol: '#b8bcc0', chimney: 1, floors: 1 },
  'W9576 CTY F': { wall: '#5e7488', mat: 'board', roofCol: '#8a7e70', stone: '#a89480', chimney: 1, floors: 1 },
  'W9482 CTY F': { wall: '#cbb38e', roofCol: '#8a7a68', gd: 2, gdAt: 'R', porch: 'L', porchCol: '#cbb38e', floors: 1 },
  'W9515 COUNTY ROAD F': { wall: '#6a3e2c', mat: 'board', roofCol: '#6a6662', gd: 2, gdAt: 'R', gdCol: '#7a5a42', chimney: 1, floors: 1 },
  'W9439 CTY F': { wall: '#4e6a8a', mat: 'siding', roofCol: '#6a6c70', gd: 1, gdAt: 'L', gdCol: '#f2f1ea', chimney: 1, floors: 1 },
  'W9427 CTY F': { all: 1, wall: '#f2f1ea', roofCol: '#8a6a60', winAwn: '#a8323a', chimney: 1, floors: 1 },
  'W9407 CTY F': { all: 1, wall: '#f2f1ea', roofCol: '#8a8a88', porch: 'L', porchCol: '#9a7a5a', floors: 1 },
  'W9535 CTY F': { wall: '#f2f1ea', roofCol: '#a8443e', porch: 'full', chimney: 1 },
  // the newer grey ranches on the north side of the 200 block
  '203 5TH AVE': { wall: '#c8b496', roofCol: '#7a7670', gd: 1, gdAt: 'L', m: 3.6, floors: 1 },
  '209 5TH AVE': { wall: '#6e7276', roofCol: '#7a7670', m: 3.6, floors: 1 },
  '213 5TH AVE': { wall: '#6e7276', roofCol: '#7a7670', gd: 2, gdAt: 'L', m: 3.6, floors: 1 },
  '739 LANGLADE RD': { wall: '#f2f1ea', roofCol: '#4e5258', porch: 'C', floors: 2 },
  '617 LANGLADE RD': { wall: '#c8b090', roofCol: '#6a5a4c' },
  // ---------- Lincoln and Fifth: the Queen Anne on the northwest corner ----------
  '602 LINCOLN ST': { wall: '#8494a6', mat: 'siding', roof: 'gable', roofCol: '#5e6064', win: 'house', floors: 2, awning: null, parapet: 0, porch: 'full', porchCol: '#d8b880' },
  // ---------- homes along Fifth, north side, from Lincoln west ----------
  '1114 5TH AVE': { wall: '#b9c3cc', roof: 'gambrel', roofCol: '#5c6064', porch: 'full' },
  '1120 5TH AVE': { wall: '#cdbf9e', roofCol: '#7a6e62', floors: 1 },
  '1122 5TH AVE': { wall: '#f2f1ea', roofCol: '#7a3a34', porch: 'L' },
  '1126 5TH AVE': { wall: '#e4d9b8', porch: 'R', porchCol: '#8a5a3a' },
  '1130 5TH AVE': { wall: '#c8caa6', roofCol: '#8a7a6a', porch: 'R', porchCol: '#8a3a2a' },
  '1138 5TH AVE': { wall: '#f2f1ea', roofCol: '#7a5a48', stone: '#8a8278' },
  '1142 5TH AVE': { wall: '#b4a486', roof: 'gambrel', roofCol: '#6a625a', chimney: 1, floors: 2 },
  '1202 5TH AVE': { wall: '#e0d4b0', roofCol: '#7a6a5a', porch: 'full', porchCol: '#f0ece2' },
  '1208 5TH AVE': { wall: '#e2e4e2', roofCol: '#7a6a5a', gd: 2, gdAt: 'C', gdCol: '#5a4a40', floors: 1 },
  '1216 5TH AVE': { wall: '#b2c0ce', roofCol: '#62666a' },
  '1218 5TH AVE': { wall: '#f0ece2', roofCol: '#9a8a72', stone: '#8a8278', floors: 1 },
  '1224 5TH AVE': { wall: '#f2f1ea', roof: 'gambrel', roofCol: '#8a8680', porch: 'full' },
  '1232 5TH AVE': { wall: '#b0bccb', roofCol: '#62666a', porch: 'full', stone: '#7a7268' },
  '1302 5TH AVE': { wall: '#e6e0d0', roofCol: '#8a7462', porch: 'R', porchCol: '#8a6a5a' },
  '1312 5TH AVE': { wall: '#f0efe8', roofCol: '#3e4248', floors: 1 },
  '1320 5TH AVE': { wall: '#a8b6c6', roofCol: '#8a8a86', floors: 1 },
  '1328 5TH AVE': { wall: '#f0efe8', roofCol: '#8a7a68', stone: '#cbbfa8', porch: 'R', porchCol: '#9a3a30' },
  '1404 5TH AVE': { wall: '#c8b694', roofCol: '#b0403a', floors: 2 },
  // ---------- Fifth Ave, south side (photos facing south) ----------
  '1405 5TH AVE': { wall: '#f2f1ea', roofCol: '#6a6c70', stone: '#5e6064', chimney: 1 },
  '1411 5TH AVE': { wall: '#a8b0b0', roofCol: '#6a6c70', floors: 1 },
  '1417 5TH AVE': { wall: '#c8b8a4', roof: 'hip', roofCol: '#7a6e66', stone: '#a89480', stoneH: 2.4, porch: 'full', porchCol: '#8a6a50', winAwn: null, chimney: 1 },
  // Church of Christ (its sign): a plain single-storey building in tan lap siding, two gables, a door with a ramp
  '1427 5TH AVE': { name: 'Church of Christ', wall: '#d4c8a4', mat: 'siding', roof: 'gable', roofCol: '#6a5a50', steeple: 0, win: 'house', floors: 1, m: 3.4 },
  '1502 5TH AVE': { wall: '#f2f1ea', roofCol: '#7a3a44', porch: 'L' },
  '1504 5TH AVE': { wall: '#a8b4c0', roof: 'hip', roofCol: '#a06a4a', porch: 'full' },
  '1524 5TH AVE': { wall: '#eeeeea', roof: 'hip', roofCol: '#9a6a52', floors: 2 },
  '1528 5TH AVE': { wall: '#e6dcc0', roofCol: '#8a5a4a', porch: 'L' },
  '1602 5TH AVE': { wall: '#f2f1ea', roofCol: '#5c6064' },
  '1608 5TH AVE': { wall: '#9aa290', porch: 'full', porchCol: '#6a6e62' },
  '1622 5TH AVE': { wall: '#f2f1ea', roofCol: '#5c6064', winAwn: '#2a6a4a', chimney: 1 },
  '1626 5TH AVE': { wall: '#f0efe8', roofCol: '#8a8f8a', floors: 1 },
  '1630 5TH AVE': { wall: '#ece6d4', roofCol: '#9a8a72', stone: '#d0c4a8', chimney: 1, floors: 1 },
  '1634 5TH AVE': { wall: '#eeeeea', roofCol: '#6a6e72', chimney: 1, floors: 1 },
  '1708 5TH AVE': { wall: '#6a4a3a', mat: 'board', roofCol: '#8a5a48', chimney: 1, floors: 1 },
  '1714 5TH AVE': { wall: '#5e6a7a', roofCol: '#6a6e72', stone: '#a08070', gd: 1, gdAt: 'L', floors: 1 },
  '1802 5TH AVE': { wall: '#ecebe4', roofCol: '#a8a49a', gd: 1, gdAt: 'L', floors: 1 },
  '1820 5TH AVE': { wall: '#e8e4d8', roofCol: '#5c6064', porch: 'C', porchCol: '#9a4a38' },
  '1828 5TH AVE': { wall: '#d8c8a8', roofCol: '#8a6a58', stone: '#c8b898', floors: 1 },
  '1928 5TH AVE': { wall: '#f0efe8', stone: '#a89e90' },
  '1930 5TH AVE': { wall: '#f2f1ea', all: 1 },
  '2000 5TH AVE': { wall: '#ebe4d0', roofCol: '#8a7a68', winAwn: '#8a6a4a', gd: 1, gdAt: 'R', gdCol: '#6a4a3a', floors: 1 },
  '2004 5TH AVE': { wall: '#8a4a38', mat: 'board', roofCol: '#9a8270', stone: '#c8b898', gd: 1, gdAt: 'L', floors: 1 },
  // the United Church of Christ: a low grey-roofed building with two square towers, one carrying a cross
  '2034 5TH AVE': { wall: '#dcdcd8', mat: 'siding', roofCol: '#7a7c7e', steeple: 0, win: 'band' },
  '2044 5TH AVE': { wall: '#7a4a34', mat: 'board', roofCol: '#8a6a58', stone: '#bdb2a0', chimney: 1, floors: 1 },
  '2100 5TH AVE': { wall: '#f2f1ea', roofCol: '#5c6064', porch: 'full', porchCol: '#f2f1ea' },
  // west edge of town: the grey metal machine shed (the county had it as a red barn) and the long white building beside it
  '@247.7,941.6': { wall: '#b8bcc0', mat: 'ribbed', roof: 'gable', roofCol: '#c4c8cc', win: 'high' },
  'N3120 WESTERN AVE': { wall: '#eeeeea', mat: 'ribbed', roof: 'gable', roofCol: '#d4d4d2', win: 'high', chimney: 0 },
};

function applyFacades() {
  const byAddr = new Map();
  for (const b of BLD) if (b.addr) { if (!byAddr.has(b.addr)) byAddr.set(b.addr, []); byAddr.get(b.addr).push(b); }
  // the Street View survey (Nov 17, js/data/survey_facades.js) goes first, so a hand-made entry here always wins
  for (const SET of [typeof SURVEY_FACADES !== 'undefined' ? SURVEY_FACADES : {}, FACADES]) for (const key in SET) {
    const f = SET[key]; let targets;
    if (key[0] === '@') { const [x, y] = key.slice(1).split(',').map(Number);
      targets = BLD.filter(b => Math.abs((b.pxMin + b.pxMax) / 2 - x) < 1.5 && Math.abs((b.pyMin + b.pyMax) / 2 - y) < 1.5); }
    else { const all = (byAddr.get(key) || []).filter(b => b.type !== 'shed');
      targets = f.all ? all : all.length ? [all.reduce((a, c) => (c.lh || 0) > (a.lh || 0) ? c : a)] : []; }
    for (const b of targets) {
      if (Object.keys(f).some(k => !['name', 'addr', 'type', 'okind', 'all', 'sign', 'stype'].includes(k))) b.photo = 1;   // styled from a street photo (the Survey says so)
      if (f.polyQ) { b.traced = 1; b.polyQ = f.polyQ; b.poly = []; for (let i = 0; i < f.polyQ.length; i += 2) b.poly.push([f.polyQ[i] / 4, f.polyQ[i + 1] / 4]);
        // the old box's 4 m cells outside the traced outline are ground again, not building (Christian, Nov 18: the hospital's
        // box made its lot and drives draw as slab and read as "inside the hospital")
        { const P = b.poly, inP = (x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
          const home = b.type === 'house' || b.type === 'farmhouse' || b.type === 'garage' || b.type === 'shed';
          for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) { const k = y * TW + x; if (TB[k] !== b.id) continue;
            const hits = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75], [0.5, 0.5]].filter(([a, c]) => inP(x + a, y + c)).length;
            if (!hits) { TB[k] = 0; TT[k] = (typeof LOTFIX_EXTRA !== 'undefined' && LOTFIX_EXTRA[k] !== undefined) ? LOTFIX_EXTRA[k] : home ? TL.YARD : TL.PAVED; } }
          let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) if (TB[y * TW + x] === b.id) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
          if (x1 >= 0) Object.assign(b, { x0, y0, x1, y1 }); }
        let a2 = 0; for (let i = 0, n = b.poly.length; i < n; i++) { const [x1, y1] = b.poly[i], [x2, y2] = b.poly[(i + 1) % n]; a2 += x1 * y2 - x2 * y1; } b.area = Math.abs(a2) / 2 * 16;
        const xs = b.poly.map(p => p[0]), ys = b.poly.map(p => p[1]); b.pxMin = Math.min(...xs); b.pxMax = Math.max(...xs); b.pyMin = Math.min(...ys); b.pyMax = Math.max(...ys); }
      if (f.door) b.door = f.door;
      if (f.type) b.type = f.type; if (f.okind) b.okind = f.okind;
      if (f.floors) b.floorsKnown = f.floors; if (f.m) b.mKnown = f.m;
      // the survey's own reading of the place (Christian, Nov 18): the name painted on the sign goes up where the game had
      // none, and the surveyor's building type counts in play, except on landmarks, the bookstore and hand-named places
      if (SET !== FACADES) {
        if (f.sign && !b.name) { b.name = f.sign; b.signRead = 1; }
        if (f.stype && b.type !== f.stype && b.type !== 'fig' && !b.landmark && !(b.name && !b.signRead && !['civic', 'hospital', 'barn'].includes(f.stype))) { b.typeWas = b.type; b.type = f.stype; }
      }
      const s = bstyle(b), st = Object.assign({}, f); delete st.all; delete st.sign; delete st.stype; delete st.name; delete st.addr; delete st.polyQ; delete st.door; delete st.type; delete st.okind;
      if (b.type === 'garage' && !st.win) st.win = 'house';
      Object.assign(s, st);
      if (f.m) { s.h = Math.round(f.m * PM); if (!f.floors) s.floors = Math.max(1, Math.round(f.m / 3.3)); }
      if (f.name !== undefined) b.name = f.name || null;
      if (f.addr) b.addr = f.addr;
    }
  }
}
