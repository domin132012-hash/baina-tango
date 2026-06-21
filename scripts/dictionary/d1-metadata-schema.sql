-- Cost-safe Cloudflare D1 metadata schema for JMdict R2 artifacts.
-- This schema intentionally does not store full JMdict entries/forms/senses.
-- The full lookup payload should live in R2 shards unless a paid/approved D1
-- import plan is explicitly chosen later.

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
  source_last_modified TEXT,
  source_url TEXT NOT NULL,
  source_sha256 TEXT NOT NULL,
  r2_bucket TEXT NOT NULL,
  r2_raw_key TEXT NOT NULL,
  r2_manifest_key TEXT NOT NULL,
  r2_checksum_key TEXT NOT NULL,
  shard_strategy TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('staging', 'active', 'inactive', 'rolled_back')),
  entry_count INTEGER NOT NULL DEFAULT 0,
  form_count INTEGER NOT NULL DEFAULT 0,
  sense_count INTEGER NOT NULL DEFAULT 0,
  estimated_full_d1_rows_written INTEGER NOT NULL DEFAULT 0,
  imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activated_at TEXT,
  rolled_back_at TEXT
);

CREATE TABLE IF NOT EXISTS dictionary_active_versions (
  source_id TEXT PRIMARY KEY REFERENCES dictionary_sources(id),
  active_version_id TEXT NOT NULL REFERENCES dictionary_versions(id),
  previous_version_id TEXT REFERENCES dictionary_versions(id),
  switched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
