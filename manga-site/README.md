# Manga Worldview Guide (prototype)
- fetch.py: Tier 0 pull. AniList (popularity order, JP manga) -> MangaDex metadata (match by AniList link) -> MangaUpdates (keep only series licensed in English). Writes catalog.db (SQLite). Run: python3 fetch.py <pages of 50>. Resumable.
- build.py: reads catalog.db + deep entries in ../manga-entries/*.md, writes site/data.json and site/entries/. Never invents scores: unanalyzed series show database facts and tag signals only.
- web/index.html: the static site (copy into site/). Host the site/ folder anywhere static.
- Preview (private): https://claude.ai/artifact/4UyR6GVPBybD2kmCQ8gYHM
