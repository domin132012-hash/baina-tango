-- Draft Cloudflare D1 schema for a full normalized JMdict import.
-- Issue #7 did not apply this full schema remotely because the estimated row
-- writes exceed the Workers Free 100,000 rows written/day guardrail.
-- Use d1-metadata-schema.sql for the cost-safe R2-sharded alternative.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS dictionary_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  license TEXT NOT NULL,
  license_url TEXT NOT NULL,
  attribution_text TEXT NOT NULL,
  source_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dictionary_versions (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES dictionary_sources(id),
  source_version TEXT NOT NULL,
  source_created_date TEXT,
  source_url TEXT NOT NULL,
  source_sha256 TEXT NOT NULL,
  artifact_sha256 TEXT,
  imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activated_at TEXT,
  rolled_back_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('staging', 'active', 'inactive', 'rolled_back')),
  entry_count INTEGER NOT NULL DEFAULT 0,
  sense_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dictionary_entries (
  id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES dictionary_sources(id),
  version_id TEXT NOT NULL REFERENCES dictionary_versions(id),
  jmdict_entry_id TEXT NOT NULL,
  primary_spelling TEXT NOT NULL,
  primary_reading TEXT NOT NULL,
  is_common INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(version_id, jmdict_entry_id)
);

CREATE TABLE IF NOT EXISTS dictionary_forms (
  id INTEGER PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES dictionary_entries(id) ON DELETE CASCADE,
  form TEXT NOT NULL,
  reading TEXT,
  form_type TEXT NOT NULL CHECK (form_type IN ('kanji', 'reading', 'deinflected')),
  priority TEXT,
  form_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_dictionary_forms_form
  ON dictionary_forms(form);

CREATE INDEX IF NOT EXISTS idx_dictionary_forms_reading
  ON dictionary_forms(reading);

CREATE TABLE IF NOT EXISTS dictionary_senses (
  id INTEGER PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES dictionary_entries(id) ON DELETE CASCADE,
  sense_order INTEGER NOT NULL,
  part_of_speech_json TEXT NOT NULL DEFAULT '[]',
  english_gloss_json TEXT NOT NULL DEFAULT '[]',
  chinese_gloss_json TEXT,
  translation_status TEXT NOT NULL DEFAULT 'none'
    CHECK (translation_status IN ('none', 'ai_translated', 'reviewed')),
  review_status TEXT NOT NULL DEFAULT 'none'
    CHECK (review_status IN ('none', 'needs_review', 'reviewed')),
  misc_json TEXT NOT NULL DEFAULT '[]',
  field_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_dictionary_senses_entry_order
  ON dictionary_senses(entry_id, sense_order);

CREATE TABLE IF NOT EXISTS dictionary_active_versions (
  source_id TEXT PRIMARY KEY REFERENCES dictionary_sources(id),
  active_version_id TEXT NOT NULL REFERENCES dictionary_versions(id),
  previous_version_id TEXT REFERENCES dictionary_versions(id),
  switched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dictionary_lookup_cache (
  cache_key TEXT PRIMARY KEY,
  version_id TEXT NOT NULL REFERENCES dictionary_versions(id),
  query TEXT NOT NULL,
  normalized_query TEXT NOT NULL,
  lang TEXT NOT NULL,
  mode TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);
