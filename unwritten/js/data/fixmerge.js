// Applies the hand corrections in FIXQ to the data town.js reads (Nov 19):
//   tiles:   { tileIndex (y*TW+x): ground type }  GRASS 0, FARM 1, WOODS 2, PARKING 7, LAWN 9, SAND 11, YARD 13, PAVED 14, MARSH 15
//            (never roads, water, paths or building cells; town.js skips those)
//   goneLots: indices into TOWN.PK of traced lots that are not pavement
//   goneBld:  indices into TOWN.B of buildings the photo shows are gone
//   newBld:   [{ type, poly: [x,y,x,y,...] game metres, h: metres, flat: 0|1, rc: '#rrggbb' }]
//   clearStallLots / stalls: see js/data/fixstalls.js
var FIX_GONE_BLD = [];
for (const f of FIXQ) {
  Object.assign(LOTFIX_EXTRA, f.tiles || {});
  LOTFIX_GONE.push(...(f.goneLots || []));
  NEWBLD.push(...(f.newBld || []));
  FIX_GONE_BLD.push(...(f.goneBld || []));
}
