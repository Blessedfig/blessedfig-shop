---
name: philosophies-explained-page
description: Live "Philosophies explained" glossary page at manga-guide/#explained (explained.js); update it when traditions, lenses, clusters or breakdown fields change
metadata:
  type: project
  modified: 2026-11-24T22:01:41.981Z
---

Christian asked 2026-11-24 for a "philosophies explained" section about the breakdown, each tradition, and all ideologies and folk regions. Live since PR #111 at https://www.theblessedfigtree.com/manga-guide/#explained (Explore menu). Code: manga-guide/explained.js (loaded after deep.js).

Sections (deep links #explained-<key>): breakdown, traditions, philosophies, leanings, values, hope.
- Traditions: hand-written neutral intro per picker option in TRAD (33 incl. Techno-Puritan and Christian (any)). "What it looks for in stories" comes from reasons.json frames[n].stories.
- Philosophies: LENSES in explained.js (33 lenses, plus "in a story" line). Lenses in data.json missing from it are listed as "Also checked".
- Clusters and heritage come from data.json live; scale descriptions are in DIMS.

**How to apply:** when adding a tradition, lens, breakdown field or cluster group, add its plain description to explained.js too. Related: [[frame-guides-system]], [[family-frames-list]], [[philosophy-first-outlook]].
