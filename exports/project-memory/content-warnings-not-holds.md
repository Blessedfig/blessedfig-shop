---
name: content-warnings-not-holds
description: Titles are no longer held for sexual content involving minors; they are shown with a content warning (content-warnings.json)
metadata:
  type: feedback
---

Holds reversed (Christian, 2026-11-24 21:28 UTC: "Show all of them with a warning for now"). No title is held now. A title that would have been held is graded and shown with a parent-facing warning sentence in /mnt/project-files/manga-site/content-warnings.json (AniList id -> text). build.py sets series.warning, and index.html shows a red chip plus a warning box (PR #106). The 18+ flag stays only where it has its own basis (publisher 18+/Mature, explicit premise).

**Why:** Christian would rather parents see the title with a clear warning than have it missing.
**How to apply:** when a writer would hold a title, grade it, add a warning sentence to content-warnings.json (with two sources, as before), and keep the Significant concern and print-check item. Related: [[full-catalog-pull]].

Threshold (site thread, 2026-11-24 23:10 UTC): a warning is added whenever two sources tie nudity or sexual content to a named minor, even when the story condemns it or the adult refuses (e.g. Evangelion 30698). Publisher M/18+ alone does not go in adult-overrides; the publisher-rating chip already drops those titles from younger age groups.
Also warn when two sources state (even only in dialogue) sexual abuse or exploitation of a named child (Vanitas 86568, Blue Exorcist 43492). Unnamed victims, a single source, or no reported nudity stay Sensitive-content notes.
Build note (2026-11-25): build.py has ID_ALIAS (slug -> AniList id) for title collisions (ruridragon 150440, black-clover 86123, citrus 80145, death-note 30021, naruto 30011; Death Note and Naruto had been on one-shots until PR #150). deploy.sh prints "deep-attached: N"; check N roughly equals the deep entry count after every deploy (a bug in PR #137 briefly detached 50 entries; fixed in #138). deploy.sh also prints TITLE-MISMATCH lines when an entry heading differs from its series title; any such line means a new ID_ALIAS is needed.

Deploy note (2026-11-25 15:00 UTC): another thread now commits deep entries straight into the repo (manga-guide/entries/*.md plus manga-guide/realign.json with entries/adult/outlook/exclude). deploy.sh no longer deletes manga-guide/entries (it only copies over), and data.json/outlook.json edits must not touch realign.json. Always check the diff stat before merging.
