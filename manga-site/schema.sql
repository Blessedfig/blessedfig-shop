CREATE TABLE IF NOT EXISTS series (
  anilist_id INTEGER PRIMARY KEY,
  mal_id INTEGER, mu_id INTEGER, mangadex_id TEXT,
  title_en TEXT, title_romaji TEXT, title_native TEXT,
  start_year INTEGER, status TEXT, volumes INTEGER, chapters INTEGER,
  genres TEXT,            -- JSON list (AniList)
  description TEXT,       -- official/database synopsis (AniList), stored for internal use
  cover TEXT, popularity INTEGER, is_adult INTEGER,
  mu_licensed INTEGER,    -- MangaUpdates: licensed in English
  en_publishers TEXT,     -- JSON list of {name, notes}
  mu_categories TEXT,     -- JSON list
  mdex_content_rating TEXT,
  creators TEXT,          -- JSON list {name, role}
  match_notes TEXT,
  tier TEXT DEFAULT 'Tier 0 (metadata)',
  fetched_at TEXT
);
CREATE TABLE IF NOT EXISTS tags (
  anilist_id INTEGER, tag TEXT, category TEXT, rank INTEGER, is_spoiler INTEGER,
  PRIMARY KEY (anilist_id, tag)
);
CREATE TABLE IF NOT EXISTS entries (   -- deep entries from the research thread
  slug TEXT PRIMARY KEY, anilist_id INTEGER, title TEXT, confidence TEXT,
  overall_content INTEGER, json TEXT, markdown TEXT, updated_at TEXT
);
