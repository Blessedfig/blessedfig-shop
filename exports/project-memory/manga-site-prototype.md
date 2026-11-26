---
name: manga-site-prototype
description: Where the manga catalog database, build scripts and website preview live, and how they work
metadata:
  type: reference
  modified: 2026-11-22T15:34:59.722Z
---

Manga Worldview Guide prototype (built 2026-11-22):
- Code + SQLite DB: /mnt/project-files/manga-site/ (fetch.py, build.py, schema.sql, web/index.html, catalog.db, README.md).
- Deep entries from the research thread: /mnt/project-files/manga-entries/*.md (template in TEMPLATE-INSTRUCTIONS.md); build.py parses their tables (content scores, lenses, axes, foundations, family frames).
- Private preview artifact: https://claude.ai/artifact/4UyR6GVPBybD2kmCQ8gYHM (republish from the same file path, or pass url).
- Licensing check = MangaUpdates `licensed` + an English publisher. MangaDex matched via its links.al == AniList id; MU id = base36 of MangaDex links.mu.
- Unanalyzed series show only database facts + AniList tag / MU category "signals", never scores.
- Front page = "I'm [tradition]" picker with S-F grades per family frame (Christian asked 2026-11-22). Content scores are "intensity" (higher = more, not better). 31 frames (see [[frame-guides-system]]), guides in /mnt/project-files/frame-guides/. Provisional grade from Depiction concern only (Minor A, Discuss B, Significant C) until an entry carries a Grade column. Lens closeness S-F from strength+stance unless entry gives it.
- Network: environment is unrestricted (Christian asked). Wikipedia rate-limits; ANN has a bot wall; Jikan resets.
- LIVE since 2026-11-22: https://www.theblessedfigtree.com/manga-guide/ (PR Blessedfig/blessedfig-shop#1 merged on Christian's ok). To update: rebuild, copy site files into blessedfig-shop/manga-guide/ (strip synopsis_db), open a PR.

Related: [[catalog-sourcing-rules]], [[store-books-manga-focus]]
- Store site https://www.theblessedfigtree.com (The Blessed Fig Tree, independent bookstore, Antigo WI) is a static site on GitHub Pages (server: GitHub.com). Plan: add the guide as /manga-guide/ in that repo via PR; needs GitHub connected + repo name (asked 2026-11-22).
- Publisher age ratings (added 2026-11-22, coordinator asked after Christian's "continue"): /home/user/manga-catalog/pubratings.py reads English publisher from MangaUpdates, then the rating from VIZ (search + volume page), Yen Press (sitemap + vol 1 page) and Seven Seas (series-list page). Cache full/pubratings.json (copy to /mnt/project-files/manga-site/full/). Kodansha and Dark Horse sites block automated reads (403), so they are not covered; do not work around the block. Site shows chip "VIZ Media: T+ (Older Teen)", red when publisher age > our band, and guided results drop such series from younger groups.
- 2026-11-22: guide index.html is now owned in the repo (blessedfig-shop/manga-guide/index.html, reworked by the "Simplify the manga guide site" thread). deploy.sh ships data.json and entries/ only. For UI changes edit the repo file directly; web/index.html in manga-catalog is stale until re-synced.
- Message delivery field (Christian, 2026-11-23): entry.delivery = {style Subtle|Woven in|Explicit|Heavy-handed, preachiness 0-10, evidence, personified[{character, ideology, role, treatment Sympathetic|Fair|Mixed|Strawman}], opposing_views Fair|Mixed|Strawman|None shown, note}. Required in quick entries (QUICK-ENTRY-SPEC.md, validate.py); deep entries use "## Message delivery" section parsed by build.py. Back-fill lists in /mnt/project-files/manga-quick/batches/delivery/ with DELIVERY-BACKFILL-TASK.md.
- Manual 18+ list (2026-11-23): /mnt/project-files/manga-site/adult-overrides.json maps AniList id to reason; build.py marks those adult (hidden by default) in addition to AniList isAdult. Gantz 30564 and Homunculus 30936 are on it.
- 2026-11-23 friendly redesign (PR #49, live): store fonts Young Serif + Karla, warm palette, "On the shelf" cover row on start page. Covers hotlinked from AniList CDN via coverSrc(s,size) (small/medium/large), never copied into the repo. Interior "issue 1" pages are NOT shown (sources rule); options offered to Christian: link publishers' official free previews, or scans of copies he owns.

2026-11-23: age band now has a minimum from strong AniList tags (build.py band_floor; UI ageBand). Horror genre or Suicide/Self-Harm/Abuse/Death Game >=60% gives 13+. Gore/Psychosexual/Torture/Rape/Cannibalism >=70% or Body Horror >=80% gives 16+. Raised 60 titles (PR #50). Bands only go up.
- Adult flag (2026-11-23): /mnt/project-files/manga-site/adult-overrides.json (AniList id + reason) hides a title as 18+; only for publisher 18+ or explicit-at-core titles. 16+ titles with warnings stay visible (e.g. Made in Abyss).
- Official free previews (Christian chose 2026-11-24, PR #64 live): manga-guide/previews.json maps AniList id -> [{src viz|mangaplus|kmanga|mangaup, url, label}], shown as "Look inside before you buy" under the grade. VIZ vol 1 product pages verified by the 'o_preview o_open-reader' button + title match; app links from MangaDex links.engtl. Scripts/caches: /mnt/project-files/manga-site/previews/ (viz.py, viz2.py, vizre.py, mdlinks.py). Yen Press, Seven Seas and Kodansha sites had no checkable preview (Kodansha 403), so those series are not covered. Re-run for newly graded series.
