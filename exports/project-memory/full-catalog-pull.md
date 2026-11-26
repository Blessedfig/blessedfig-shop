---
name: full-catalog-pull
description: Scale of the all-English-licensed-manga expansion Christian asked for (2026-11-22) and how it is being pulled
metadata:
  type: project
---

Christian, 2026-11-22: "populate all american translated manga to the list". MangaUpdates shows about 22,300 English-licensed manga (type Manga, licensed=yes), about 6,300 genre-tagged Adult (overlapping Hentai 4.1k, Smut 4.2k). Search caps at 10k hits, so enumerate by year.

- **Tier 0 pull:** /home/user/manga-catalog/full/fetch_all.py writes full.db (table mu; resumable). Phase 1 enumerates; phase 2 fetches per-series details at 1/s, about 6 to 8 h. The container is ephemeral, so copy the results to /mnt/project-files/manga-site/ when done.
- **AniList pull:** fetch.py 24 extends the AniList-keyed catalog to about the top 1,000 most-read.
- **Adult titles:** plan is to list them marked 18+ and hidden by default.
- **Grading scope:** Christian chose "Top 3,000 most-read" (20:06 UTC). Batches via /home/user/manga-catalog/make_batches.py (batch-13 onward, 23 each, most-read first); 2 helpers at a time; new quick entries carry a "folkways" block (spec updated).

**Why:** the scale is roughly 75x the pilot, so cost and time need Christian's call.
**How to apply:** check the decision outcome before grading past 1,000. See [[manga-site-prototype]].

Status 2026-11-23 12:50 UTC: all 1,928 titles in catalog.db are graded or skipped (1,821 graded live, PR #47). Batches 13-83 done. Next: fetch.py 200 (fetch3.log) extends the list toward 3,000, then make_batches.py makes batch-84+. MangaUpdates API was returning 502s. Helper prompt now includes an advisory-framing paragraph (helpers had declined ordinary teen-romance titles). Judgement calls and understated scores are logged in /mnt/project-files/manga-quick/batches/RECHECK-NO-SUMMARY.md; removed entries go to manga-quick/skipped/.

2026-11-23 18:40 UTC: popularity walk (fetch.py) is exhausted: everything left near the top has no English publisher on MangaUpdates. New source is fetch_mu.py, which walks full/full.db (MU English-licensed list, by votes), matches AniList by title and year, and logs to fetch_mu.log. Helper prompt v2 asks helpers to confirm the AniList/MU match. make_batches.py now skips AniList-adult titles. Batches 84 and 85 are running.

2026-11-23 20:15 UTC: fetch_mu.py done: catalog.db now has 3,031 licensed series (319 AniList-adult, which are listed but not graded). Grading the last queued batches (98 to 112 plus leftover) covers the top 3,000. Holds for review (possible minors in sexual content) go in manga-quick/held/. More adult flags were added to adult-overrides.json (ZE, Super Morning Star, Lies, Men of Tattoos, Man of Tango).

2026-11-23 21:40 UTC: mainstream titles in the top 3,000 are all graded: 2,312 live (PR #58). Batches 107-112 and 116-118 hold about 190 titles from boys-love/adult imprints (Juné, Renta!, Futekiya, etc.). They wait on Christian's decision card (recommended: mainstream first, those later). 26 entries are held in manga-quick/held/ (README there) for human review of possible minors in sexual content.
- 2026-11-24 08:55 UTC: coordinator asked that each newly graded quick batch also add an outlook to blessedfig-shop manga-guide/outlook.json (series[al_id] = {"o": "h"|"m"|"b", "hope": one of G R F L E S P K J N, optional "msg"}; codes listed in philosophy-first-outlook memory). It is not built by build.py or deploy.sh. All 2,312 live graded series already have one.
- Hold rule as applied 2026-11-24: hold (listing only, 18+, files in manga-quick/held/ and manga-entries/held/) when the work sexualizes minors or depicts sexual acts or sexual violence involving them (Onani Master Kurosawa, Mushoku Tensei, Akira). Harassment the story shows as wrong, innuendo and fan service stay graded as depiction concerns (Tomo-chan, Bungo Stray Dogs, Mieruko-chan). build.py reads manga-entries/*.md non-recursively, so held/ is excluded.
- Hold line refined 2026-11-24 20:25 UTC: hold if a source ties sexual content to a known minor: sexual acts, eroticized nudity, sexual content played for titillation or comedy (Prison School, 100 Girlfriends), or sexual assault or rape (Black Butler, Blue Exorcist). Graded with a Significant depiction concern plus a print-check item: brief harassment the story condemns (Tomo-chan, Our Dreams at Dusk), innuendo, fan-service gags (Evangelion), and general board "sexualised imagery" notes with no minor named (More Than a Married Couple). Facts that drive a hold need 2 independent sources.

Hold rule superseded 2026-11-24: see [[content-warnings-not-holds]].

2026-11-25 14:30 UTC: Christian answered the BL/adult card: grade them normally; outright hentai goes on a separate list later. Helpers follow manga-quick/BL-ADULT-ADDENDUM.md and log skipped explicit titles to manga-quick/explicit-later.md. DONE 2026-11-25 ~20:00 UTC: all BL/adult batches live (2528 graded, 421 adult). 5 explicit titles set aside in explicit-later.md; 5 wrong-record ids ungraded (35377, 93916, 111564, 170653, 116723).
