---
name: store-books-manga-focus
description: Primary use is reviewing books and manga in Christian's store; site stance neutral; tiered reading pipeline plan
metadata:
  type: project
  modified: 2026-11-22T13:57:33.879Z
---

Christian said (2026-11-22) the main intent is a database to review the books and manga sold in their store. Films/TV are secondary. They want ALL manga covered, plus a deeper philosophy essay per series, and want Claude to do the heavy reading.

Site stance: neutral (Christian confirmed 2026-11-22). No "store picks" view.

Plan agreed in v1 doc (https://claude.ai/artifact/RnKYjZ6SFageP7dR9SS4C5): tiered reading. Tier 0 metadata from AniList/MangaUpdates/MangaDex APIs for every series; Tier 1 summaries/fan wikis; Tier 2 AI full read of pages from legal copies (bought ebooks, NetGalley/Edelweiss review copies, staff scans); Tier 3 human check. Don't scrape Crunchyroll Manga pages or read MangaDex chapter images (ToS / unlicensed scans).

**Why:** they need to screen store inventory and can't read everything themselves.
**How to apply:** weight design toward books and manga (per-volume scores, publisher rating, fan service flag); label every record with its tier/confidence.

Update 2026-11-22: audience includes homeschooling parents. Christian wants political-compass axes and "I am..." identity profiles (denominations split: Catholic, Orthodox, Evangelical, Reformed, etc.), all weighed evenly; existing Christian raters are not neutral because they bake in their denomination. Profiles = presets over the same neutral data, built from each group's own sources, none default.

Update 2026-11-22 (later): goal is a PUBLIC site + app for parents now (store screening secondary). Scope: ALL manga, English editions only. Keep all 30 lenses plus a top "life message" layer (evolutionary biology, pragmatic, religious, socio-cultural readings of tropes like romance/fighting). Gender/sexuality/feminism broken into sub-lenses with history and culture. Christian said "there are websites with full manga collections" for full text; Claude flagged that unlicensed aggregator sites can't be used for a public product; awaiting which sites.
Rule (Christian, 2026-11-22): scans of owned copies are analyzed then deleted; only the interpretation, short quotes and page refs are stored. Pirated/scanlation sources stay out regardless of retention.
Rule: fan wikis are used only to locate scenes (volume/chapter), never as a quote source; quotes come from official editions or owned-copy photos. A separate journalistic thread compares fan translations vs official editions for ~10 series Christian owns (manual sampled viewing only, no scraping).
Template decisions (2026-11-22): all scores 0-10 (political axes 0-10, 5 = no side). Each series entry also has "Winners, losers and sympathy" (incl. fan-favorite villains) and "Creator and publisher context" (on-record statements, ownership, deals; documented facts only, "none found" reported). Model entry: https://claude.ai/artifact/Ceu3wrEsEdV9eWBGhCqUeX
