"use strict";
// the two halves of 610 Century Ave keep the Street View look of the whole building, each with its own sign (Nov 21)
{ const base = SURVEY_FACADES['@817.2,352.1'] || {};
  SURVEY_FACADES['@815.4,352.1'] = Object.assign({}, base, { sign: "Gina's Pizzeria", signBox: '#3aa83a' });
  SURVEY_FACADES['@819.1,352.1'] = Object.assign({}, base, { sign: 'The Kove', signBox: '#2e5a7a', awning: '#2e5a7a' });
  delete SURVEY_FACADES['@817.2,352.1']; }
