---
name: deep-family-profile
description: The optional in-depth family profile quiz (#deep) on the manga guide, its parts and how the match score works
metadata:
  type: project
  modified: 2026-11-23T01:50:26.788Z
---

Live 2026-11-23 (PR #26) at theblessedfigtree.com/manga-guide/#deep, code in manga-guide/deep.js (index.html only has hooks). Christian asked for a deeper test across all categories; the two-question start stays the simple path.

Parts, all skippable: reader age; tradition (+ optional second, depiction-concern weight); per-category content limits (age defaults from BAND_CAPS, hide vs rank lower, framing); 33 lenses (Avoid..Championed) plus message delivery style and fairness to opposing views (reads entry.delivery from the catalog thread: preachiness, opposing_views, personified; missing = unknown); 12 moral foundations items; 8 politics items; 18 folkways items; Big Five of the READER (light genre/fear nudge only, Christian asked about Big Five); importance weights.
Match = weighted mean of part scores 0-100, skipped parts or missing series data are left out, not zero. Answers in sessionStorage; localStorage only on Save.

**How to apply:** new per-series fields should be wired into scoreSeries() in deep.js. See [[culture-clusters-layer]], [[frame-guides-system]].
