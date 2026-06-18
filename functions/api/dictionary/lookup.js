import { BETA_ENTRIES, DICTIONARY_SOURCE } from "./_beta-data.js";

const DEFAULT_R2_MANIFEST_KEY = "dictionary/shards/jmdict/jmdict-english-r2-shards-2026-06-18/manifest.json";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function normalizeQuery(value) {
  return String(value || "").trim().replace(/[　\s]+/g, "");
}

function shardKeyForTerm(value) {
  const term = normalizeQuery(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < term.length; index += 1) {
    hash ^= term.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return (hash & 0xff).toString(16).padStart(2, "0");
}

function toHiragana(value) {
  return String(value || "").replace(/[ァ-ン]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

function deinflect(query) {
  const rules = [
    { suffix: "まなかった", replacement: "む", note: "godan negative past" },
    { suffix: "まない", replacement: "む", note: "godan negative" },
    { suffix: "んだ", replacement: "む", note: "godan past" },
    { suffix: "んで", replacement: "む", note: "godan te-form" },
    { suffix: "なかった", replacement: "る", note: "ichidan negative past" },
    { suffix: "ない", replacement: "る", note: "ichidan negative" },
    { suffix: "ました", replacement: "る", note: "masu past" },
    { suffix: "ます", replacement: "る", note: "masu form" },
    { suffix: "かった", replacement: "い", note: "i-adjective past" },
    { suffix: "くなかった", replacement: "い", note: "i-adjective negative past" },
    { suffix: "くない", replacement: "い", note: "i-adjective negative" },
    { suffix: "くて", replacement: "い", note: "i-adjective te-form" }
  ];
  const candidates = [];
  for (const rule of rules) {
    if (query.length > rule.suffix.length && query.endsWith(rule.suffix)) {
      candidates.push({
        form: query.slice(0, -rule.suffix.length) + rule.replacement,
        matchType: "deinflected",
        rankReason: `surface form -> deinflection -> dictionary lookup (${rule.note})`,
        deinflection: {
          surface: query,
          dictionaryForm: query.slice(0, -rule.suffix.length) + rule.replacement,
          rule: rule.note
        }
      });
    }
  }
  return candidates;
}

function lookupCandidates(query) {
  const normalized = normalizeQuery(query);
  const candidates = [
    {
      form: normalized,
      matchType: "exact",
      rankReason: "exact match"
    }
  ];
  const hiragana = toHiragana(normalized);
  if (hiragana && hiragana !== normalized) {
    candidates.push({
      form: hiragana,
      matchType: "reading",
      rankReason: "katakana normalized to hiragana reading match"
    });
  }
  candidates.push(...deinflect(normalized), ...deinflect(hiragana));

  const seen = new Set();
  return candidates.filter((candidate) => {
    const key = `${candidate.matchType}:${candidate.form}`;
    if (!candidate.form || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchEntry(entry, candidate) {
  const form = candidate.form;
  const forms = new Set([entry.headword, ...(entry.forms || [])]);
  const readings = new Set(entry.readings || []);

  if (candidate.matchType === "exact" && forms.has(form)) return true;
  if (candidate.matchType === "reading" && readings.has(form)) return true;
  if (candidate.matchType === "deinflected" && forms.has(form)) return true;
  if (forms.has(form)) return true;
  if (readings.has(form)) return true;
  return false;
}

function sourceFromManifest(manifest) {
  if (!manifest) return DICTIONARY_SOURCE;
  return {
    source: manifest.source || "JMdict",
    sourceVersion: manifest.version || manifest.sourceVersion || "jmdict-english-r2-shards",
    sourceUrl: manifest.sourceUrl,
    sourceCreatedDate: manifest.sourceCreatedDate,
    sourceLastModified: manifest.sourceLastModified || null,
    sourceSha256: manifest.sourceSha256,
    license: manifest.license || "CC BY-SA 4.0",
    attribution: manifest.attribution || "JMdict / EDRDG",
    attributionText: manifest.attributionText || "Dictionary data: JMdict / EDRDG, CC BY-SA 4.0",
    licenseUrl: manifest.licenseUrl || "https://creativecommons.org/licenses/by-sa/4.0/",
    entryCount: manifest.counts?.entries || manifest.entryCount || 0,
    shardStrategy: manifest.shardStrategy,
    r2ManifestKey: manifest.r2ManifestKey || null
  };
}

function publicEntry(entry, candidate, mode, source = DICTIONARY_SOURCE, dictionarySource = "fallback") {
  const senses = mode === "all" ? entry.senses : entry.senses.slice(0, 3);
  return {
    id: entry.id,
    headword: entry.headword,
    reading: entry.readings[0] || "",
    readings: entry.readings,
    partOfSpeech: entry.partOfSpeech,
    senses,
    source: source.source,
    sourceVersion: source.sourceVersion,
    license: source.license,
    attribution: source.attribution,
    attributionText: source.attributionText,
    licenseUrl: source.licenseUrl,
    matchType: candidate.matchType,
    rankReason: candidate.rankReason,
    deinflection: candidate.deinflection || null,
    isCommon: !!entry.isCommon,
    dictionarySource
  };
}

function sortMatches(matches) {
  return matches.sort((a, b) => {
    const rank = { exact: 0, reading: 1, deinflected: 2 };
    return (rank[a.matchType] ?? 9) - (rank[b.matchType] ?? 9);
  });
}

function lookupFallback(query, mode) {
  const matches = [];
  const seen = new Set();
  for (const candidate of lookupCandidates(query)) {
    for (const entry of BETA_ENTRIES) {
      if (!matchEntry(entry, candidate) || seen.has(entry.id)) continue;
      seen.add(entry.id);
      matches.push(publicEntry(entry, candidate, mode, DICTIONARY_SOURCE, "fallback"));
    }
  }
  return sortMatches(matches);
}

async function readR2Json(bucket, key) {
  const object = await bucket.get(key);
  if (!object) return null;
  return JSON.parse(await object.text());
}

async function activeManifestKeyFromD1(env) {
  if (!env?.DICTIONARY_DB?.prepare) return null;
  const row = await env.DICTIONARY_DB.prepare(`
    SELECT v.r2_manifest_key
    FROM dictionary_active_versions a
    JOIN dictionary_versions v ON v.id = a.active_version_id
    WHERE a.source_id = ?
    LIMIT 1
  `).bind("jmdict").first();
  return row?.r2_manifest_key || null;
}

async function readR2Manifest(env) {
  if (!env?.DICTIONARY_R2?.get) return null;
  const key = await activeManifestKeyFromD1(env)
    || env.DICTIONARY_MANIFEST_KEY
    || DEFAULT_R2_MANIFEST_KEY;
  const manifest = await readR2Json(env.DICTIONARY_R2, key);
  return manifest ? { ...manifest, r2ManifestKey: key } : null;
}

async function lookupR2(query, mode, env) {
  const manifest = await readR2Manifest(env);
  if (!manifest?.r2Prefix) return null;

  const source = sourceFromManifest(manifest);
  const matches = [];
  const seen = new Set();
  const shardCache = new Map();
  const candidates = lookupCandidates(query);
  for (const candidate of candidates) {
    const kinds = candidate.matchType === "reading" ? ["reading", "surface"] : ["surface"];
    for (const kind of kinds) {
      const shardKey = shardKeyForTerm(candidate.form);
      const r2Key = `${manifest.r2Prefix}/shards/${kind}/${shardKey}.json`;
      if (!shardCache.has(r2Key)) shardCache.set(r2Key, await readR2Json(env.DICTIONARY_R2, r2Key));
      const shard = shardCache.get(r2Key);
      const entries = shard?.terms?.[candidate.form] || [];
      for (const entry of entries) {
        if (!matchEntry(entry, candidate) || seen.has(entry.id)) continue;
        seen.add(entry.id);
        matches.push(publicEntry(entry, candidate, mode, source, "r2-shard"));
      }
    }
  }
  return {
    entries: sortMatches(matches),
    source,
    manifest
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") return json(200, { ok: true });
  if (request.method !== "GET") return json(405, { error: "Method not allowed" });

  const url = new URL(request.url);
  const query = normalizeQuery(url.searchParams.get("q"));
  const lang = url.searchParams.get("lang") || "zh";
  const mode = url.searchParams.get("mode") === "all" ? "all" : "basic";

  if (!query) {
    return json(400, {
      error: "Missing query",
      fallbackAvailable: false,
      canUseAiExplain: false
    });
  }

  let lookupResult = null;
  try {
    lookupResult = await lookupR2(query, mode, env);
  } catch (error) {
    lookupResult = null;
  }
  const entries = lookupResult?.entries || lookupFallback(query, mode);
  const source = lookupResult?.source || DICTIONARY_SOURCE;
  return json(200, {
    query,
    normalizedQuery: query,
    lang,
    mode,
    entries,
    results: entries,
    fallbackAvailable: true,
    canUseAiExplain: entries.length === 0,
    aiCalled: false,
    source,
    dictionarySource: lookupResult ? "r2-shard" : "fallback"
  });
}
