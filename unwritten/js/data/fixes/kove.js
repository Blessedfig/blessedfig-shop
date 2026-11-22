// 610 Century Ave holds two shops side by side (Christian, Nov 21): Gina's Pizzeria and The Kove, a coffee shop that is a story place
// in the game. The one building is split down the middle at the shared front walk. Which half is which is a first guess (the Kove takes
// the east half, the side with the picnic table on the lawn); swap the two names here if it's the other way round.
FIXQ.push({ area: 'kove', tiles: {}, goneLots: [], goneBld: [620], newBld: [
  { type: 'store', name: "Gina's Pizzeria", addr: '610 CENTURY AVE', poly: [3254, 1401, 3269, 1401, 3269, 1416, 3254, 1416], h: 4.5, flat: 0, rc: '#a89a84' },
  { type: 'store', name: 'The Kove', addr: '610 CENTURY AVE', poly: [3269, 1401, 3284, 1401, 3284, 1416, 3269, 1416], h: 4.5, flat: 0, rc: '#a89a84' }],
  clearStallLots: [], stalls: [], notes: ["610 Century Ave split: Gina's Pizzeria (west) and The Kove (east)"] });
