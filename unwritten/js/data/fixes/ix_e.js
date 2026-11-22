"use strict";
// East-half intersection pass (Nov 21): the fixes are geometric and run on the drawn town in js/core/sweep_ix_e.js
// (street ends joined, lots cut to the curb, lot gaps closed, diagonal walks across lots cut, grass notches filled, and the
// city lot behind 5th Avenue / Superior Street by Spring Brook re-traced from the 2025 photo). No tile or lot data changes here.
FIXQ.push({ area: 'ix_e', tiles: {}, goneLots: [], goneBld: [], newBld: [], clearStallLots: [], stalls: [], notes: ['see js/core/sweep_ix_e.js'] });
