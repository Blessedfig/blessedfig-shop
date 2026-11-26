---
name: antigo-almanac
description: "Almanac" = the Antigo Almanac on the store site (theblessedfigtree.com/almanac/), hand-written HTML; how to add entries
metadata:
  type: project
---

When Christian says "the almanac" they mean the Antigo Almanac: https://www.theblessedfigtree.com/almanac/ (repo file almanac/index.html; every entry is on one long line 234). It shows Antigo's year in sourced numbers. The game version lives separately in unwritten/js/core/almanac.js (different page set, leaves hidden around town) and is not auto-synced.
- Entry markup: details.am-page > summary + .am-body (figure.am-chart with am-strip / am-months (am-col, .two for high/low pairs, .hl) / am-bars / am-tiles / am-marks) + .am-text paragraphs ending with p.am-src "Source: ...".
- When the entry count changes, also update: the hero count ("N entries in X parts"), the meta descriptions, the helper/faq.json "What is the Antigo Almanac?" answer, and the sitemap lastmod.
- 2026-11-26: Christian asked to "enhance the almanac information". PR #174 added Weather by month (NOAA normals, station USC00470239), Daylight, and a new part "Land and history" with Woods and water, How Antigo began, and Books in Antigo (library data from Wisconsin DPI). That makes 24 entries in four parts.
- PR #174 merged 2026-11-26 15:22 UTC on Christian's ok (merging almanac changes is NOT covered by the manga-guide standing permission; ask first). Live page verified.
