---
name: catalog-sourcing-rules
description: Rules for building the manga catalog: sources allowed, wiki use, quoting, 0-10 scale, labels
metadata:
  type: project
  modified: 2026-11-22T15:02:08.932Z
---

Agreed with Christian 2026-11-22 (via research thread and coordinator):
- Build Tier 0 (metadata) + Tier 1 (summary-based) for ALL English-licensed manga now. No page reading yet. Fan-translated/aggregator sites are out (Christian agreed they're self-translated).
- Sources: AniList GraphQL, MangaUpdates API (English publisher/licensing), MangaDex API metadata only, publisher age ratings, official synopses, fan wikis.
- Fan wikis: facts only (who, what, which chapter), never interpretation, adjectives or quotes. Quotes only from the official English edition or Christian's own photos.
- Any fact that drives a score needs two independent sources of different kinds. Flag loaded wording in sources before use.
- Label summary-based entries "From summaries" until checked against real pages; every record carries tier + confidence.
- All scores use a 0 to 10 scale (Christian, 2026-11-22).
- Template entry for each series: https://claude.ai/artifact/Ceu3wrEsEdV9eWBGhCqUeX
- Local prototype first; ask Christian before creating a repo, publishing, or spending money.
- Cloud environment blocks the APIs by default; hosts graphql.anilist.co, api.mangaupdates.com, api.mangadex.org, en.wikipedia.org must be allowed.

Related: [[store-books-manga-focus]]

Hold rule RETIRED (Christian, 2026-11-24 21:28 UTC: "Show all of them with a warning for now"). No entry goes to held/ any more. Titles where two independent sources tie sexualization or depicted sexual assault of a known minor to the manga itself get a "**Content warning.**" paragraph at the top, a Significant depiction concern in every frame, and first place on the print checklist; the site shows a warning banner. Lesser items (stated-only crimes, condemned harassment, innuendo, fan service, anime-only scenes) are Significant depiction concerns without the banner. Only publisher-rated 18+/Mature or explicit-at-core titles stay in adult-overrides.json. Scenes with minors are still marked "Do not photograph or scan; review in print, written note only." The 13 formerly held deep entries (Blue Exorcist, Black Butler, Prison School, Domestic Girlfriend, etc.) were moved back to manga-entries/ with warnings.
- adult-overrides scope (site thread, 2026-11-24): a VIZ M / publisher Mature rating alone does NOT go in adult-overrides; the site already shows a red Mature chip and drops it from younger groups. adult-overrides is for explicit-at-core titles or a content warning on top of an 18+ rating (e.g. Alice in Borderland).
- Warning threshold widened (site thread, 2026-11-24 23:10 UTC): two independent sources tying nudity of a named minor to the manga also gets a content warning, even when not sexualized (first case: Evangelion). Reader reviews/image captions alone still do not count.
- Stated-only sexual exploitation of a NAMED child, with two sources, also gets a warning even if told in dialogue (Vanitas, Blue Exorcist; agreed with site thread 2026-11-25). Stated crimes against unnamed victims stay notes (JoJo Part 4 Angelo).
- Skip rule (2026-11-25): titles built around explicit sexual content involving minors (e.g. A Girl on the Shore, Kodansha 18+) get no deep entry, only a content warning + 18+ flag; queue row marked "skipped". Writers stop and report if they hit one.
