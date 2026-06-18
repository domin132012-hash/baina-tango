#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";
import zlib from "node:zlib";

const SOURCE_URL = "https://www.edrdg.org/pub/Nihongo/JMdict_e.gz";
const ATTRIBUTION_TEXT = "Dictionary data: JMdict / EDRDG, CC BY-SA 4.0";
const LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";
const DEFAULT_BUCKET = "baina-dictionary-artifacts";
const DEFAULT_PREFIX = "dictionary/shards/jmdict";
const DEFAULT_VERSION = "jmdict-english-r2-shards";
const SHARD_HEX_WIDTH = 2;

const REQUIRED_TERMS = [
  "平和",
  "学校",
  "先生",
  "問題",
  "社会",
  "生活",
  "必要",
  "考える",
  "分かる",
  "努力",
  "食べる",
  "読む",
  "高い"
];

function usage() {
  console.log(`Usage:
  node scripts/dictionary/jmdict-build-r2-shards.js --input <JMdict_e.xml|JMdict_e.gz> --out <dir> [options]

Options:
  --version <id>              Immutable dictionary version id
  --r2-bucket <name>          R2 bucket name, defaults to ${DEFAULT_BUCKET}
  --r2-prefix <prefix>        R2 key prefix before version, defaults to ${DEFAULT_PREFIX}
  --source-url <url>          Source URL, defaults to official JMdict_e.gz
  --source-last-modified <v>  Last-Modified header from source download
  --max-entries <n>           Test-only limit for fixture or smoke generation

The script writes deterministic JSON shards and metadata SQL to --out only.
Do not commit generated shards, full JMdict source, SQLite, or DB artifacts.
`);
}

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function decodeBuiltInXml(value) {
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}

function loadEntityMap(xml) {
  const map = new Map();
  const entityRe = /<!ENTITY\s+([A-Za-z0-9_-]+)\s+"([^"]*)">/g;
  let match;
  while ((match = entityRe.exec(xml))) {
    map.set(match[1], decodeBuiltInXml(match[2].trim()));
  }
  return map;
}

function decodeXml(value, entityMap) {
  return decodeBuiltInXml(value).replace(/&([A-Za-z0-9_-]+);/g, (_, name) =>
    entityMap.get(name) || name
  );
}

function textValues(xml, tag, entityMap) {
  const out = [];
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "g");
  let match;
  while ((match = re.exec(xml))) out.push(decodeXml(match[1].trim(), entityMap));
  return out;
}

function blocks(xml, tag) {
  const out = [];
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>[\\s\\S]*?</${tag}>`, "g");
  let match;
  while ((match = re.exec(xml))) out.push(match[0]);
  return out;
}

function createdDate(xml) {
  const match = xml.match(/JMdict created:\s*([0-9-]+)/);
  return match ? match[1] : null;
}

function normalizeTerm(value) {
  return String(value || "").trim().replace(/[　\s]+/g, "");
}

function shardKeyForTerm(value) {
  const term = normalizeTerm(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < term.length; index += 1) {
    hash ^= term.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return (hash & 0xff).toString(16).padStart(SHARD_HEX_WIDTH, "0");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function parseEntry(entryXml, entityMap) {
  const entSeq = textValues(entryXml, "ent_seq", entityMap)[0] || "";
  const kanji = blocks(entryXml, "k_ele").map((block) => ({
    text: textValues(block, "keb", entityMap)[0] || "",
    priority: textValues(block, "ke_pri", entityMap)
  })).filter((item) => item.text);
  const readings = blocks(entryXml, "r_ele").map((block) => ({
    text: textValues(block, "reb", entityMap)[0] || "",
    priority: textValues(block, "re_pri", entityMap)
  })).filter((item) => item.text);
  const senses = blocks(entryXml, "sense").map((block, index) => ({
    senseOrder: index + 1,
    partOfSpeech: textValues(block, "pos", entityMap),
    englishGloss: textValues(block, "gloss", entityMap)
  })).filter((sense) => sense.englishGloss.length > 0);

  const forms = Array.from(new Set([
    ...kanji.map((item) => item.text),
    ...readings.map((item) => item.text)
  ].filter(Boolean)));
  const partOfSpeech = Array.from(new Set(senses.flatMap((sense) => sense.partOfSpeech))).filter(Boolean);
  const isCommon = [...kanji, ...readings].some((item) =>
    item.priority.some((priority) => /^(news|ichi|spec|gai)1$/.test(priority))
  );

  return {
    id: `jmdict-${entSeq}`,
    jmdictEntryId: entSeq,
    headword: kanji[0]?.text || readings[0]?.text || "",
    readings: Array.from(new Set(readings.map((item) => item.text))).filter(Boolean),
    forms,
    partOfSpeech,
    isCommon,
    senses: senses.map((sense) => ({
      englishGloss: sense.englishGloss,
      chineseGloss: null,
      senseOrder: sense.senseOrder,
      partOfSpeech: sense.partOfSpeech
    }))
  };
}

function addToShard(shards, kind, term, entry) {
  const normalized = normalizeTerm(term);
  if (!normalized) return;
  const key = shardKeyForTerm(normalized);
  if (!shards[kind].has(key)) shards[kind].set(key, new Map());
  const terms = shards[kind].get(key);
  if (!terms.has(normalized)) terms.set(normalized, new Map());
  terms.get(normalized).set(entry.id, entry);
}

function addEntryToShards(shards, entry) {
  for (const form of entry.forms) addToShard(shards, "surface", form, entry);
  for (const reading of entry.readings) addToShard(shards, "reading", reading, entry);
}

function sortedShardObject(kind, shardKey, terms) {
  const out = {
    kind,
    shardKey,
    terms: {}
  };
  for (const [term, entries] of [...terms.entries()].sort(([a], [b]) => a.localeCompare(b, "ja"))) {
    out.terms[term] = [...entries.values()].sort((a, b) =>
      a.jmdictEntryId.localeCompare(b.jmdictEntryId)
    );
  }
  return out;
}

async function parseToShards(inputPath, maxEntries) {
  const rawHash = crypto.createHash("sha256");
  const rawStream = fs.createReadStream(inputPath);
  rawStream.on("data", (chunk) => rawHash.update(chunk));
  const xmlStream = inputPath.endsWith(".gz") ? rawStream.pipe(zlib.createGunzip()) : rawStream;
  const decoder = new StringDecoder("utf8");
  const shards = { surface: new Map(), reading: new Map() };
  const counts = {
    entries: 0,
    forms: 0,
    readings: 0,
    senses: 0,
    englishGlosses: 0,
    termsIndexed: 0
  };
  const requiredHits = Object.fromEntries(REQUIRED_TERMS.map((term) => [term, null]));

  let buffer = "";
  let preamble = "";
  let entityMap = new Map();
  let sourceCreatedDate = null;
  let entitiesLoaded = false;
  let xmlBytes = 0;

  const processEntry = (entryXml) => {
    if (maxEntries > 0 && counts.entries >= maxEntries) return;
    const entry = parseEntry(entryXml, entityMap);
    if (!entry.headword || !entry.readings.length || !entry.senses.length) return;
    counts.entries += 1;
    counts.forms += entry.forms.length;
    counts.readings += entry.readings.length;
    counts.senses += entry.senses.length;
    counts.englishGlosses += entry.senses.reduce((sum, sense) => sum + sense.englishGloss.length, 0);
    counts.termsIndexed += entry.forms.length + entry.readings.length;
    addEntryToShards(shards, entry);
    for (const term of REQUIRED_TERMS) {
      if (!requiredHits[term] && entry.forms.includes(term)) {
        requiredHits[term] = {
          jmdictEntryId: entry.jmdictEntryId,
          headword: entry.headword,
          readings: entry.readings,
          senseCount: entry.senses.length,
          firstGloss: entry.senses[0]?.englishGloss || []
        };
      }
    }
  };

  for await (const chunk of xmlStream) {
    const text = decoder.write(chunk);
    xmlBytes += Buffer.byteLength(text);
    buffer += text;
    if (!entitiesLoaded) {
      const firstEntry = buffer.indexOf("<entry>");
      if (firstEntry < 0) {
        preamble += buffer;
        buffer = "";
        continue;
      }
      preamble += buffer.slice(0, firstEntry);
      entityMap = loadEntityMap(preamble);
      sourceCreatedDate = createdDate(preamble);
      buffer = buffer.slice(firstEntry);
      entitiesLoaded = true;
    }

    while (maxEntries <= 0 || counts.entries < maxEntries) {
      const start = buffer.indexOf("<entry>");
      if (start < 0) {
        buffer = buffer.slice(-32);
        break;
      }
      const end = buffer.indexOf("</entry>", start);
      if (end < 0) {
        if (start > 0) buffer = buffer.slice(start);
        break;
      }
      processEntry(buffer.slice(start, end + "</entry>".length));
      buffer = buffer.slice(end + "</entry>".length);
    }
    if (maxEntries > 0 && counts.entries >= maxEntries) {
      xmlStream.destroy();
      break;
    }
  }

  buffer += decoder.end();
  if ((maxEntries <= 0 || counts.entries < maxEntries) && buffer.includes("<entry>") && buffer.includes("</entry>")) {
    const start = buffer.indexOf("<entry>");
    const end = buffer.indexOf("</entry>", start);
    processEntry(buffer.slice(start, end + "</entry>".length));
  }

  return {
    compressedBytes: fs.statSync(inputPath).size,
    xmlBytes,
    sourceSha256: rawHash.digest("hex"),
    sourceCreatedDate,
    counts,
    requiredHits,
    shards
  };
}

function sqlString(value) {
  return `'${String(value || "").replace(/'/g, "''")}'`;
}

function metadataSql(manifest) {
  const version = manifest.version;
  return `-- Generated by scripts/dictionary/jmdict-build-r2-shards.js.
-- Metadata only: no full JMdict entries/forms/senses are written to D1.
PRAGMA foreign_keys = ON;

INSERT OR REPLACE INTO dictionary_sources
  (id, name, license, license_url, attribution_text, source_url)
VALUES
  ('jmdict', 'JMdict', 'CC BY-SA 4.0', ${sqlString(LICENSE_URL)}, ${sqlString(ATTRIBUTION_TEXT)}, ${sqlString(manifest.sourceUrl)});

INSERT OR REPLACE INTO dictionary_versions
  (id, source_id, source_version, source_created_date, source_last_modified, source_url, source_sha256, r2_bucket, r2_raw_key, r2_manifest_key, r2_checksum_key, shard_strategy, status, entry_count, form_count, sense_count, estimated_full_d1_rows_written, imported_at, activated_at)
VALUES
  (${sqlString(version)}, 'jmdict', ${sqlString(version)}, ${sqlString(manifest.sourceCreatedDate)}, ${sqlString(manifest.sourceLastModified || "")}, ${sqlString(manifest.sourceUrl)}, ${sqlString(manifest.sourceSha256)}, ${sqlString(manifest.r2Bucket)}, ${sqlString(manifest.rawSourceKey)}, ${sqlString(manifest.r2ManifestKey)}, ${sqlString(manifest.sourceChecksumKey)}, ${sqlString(manifest.shardStrategy)}, 'active', ${manifest.counts.entries}, ${manifest.counts.forms}, ${manifest.counts.senses}, 3, ${sqlString(manifest.generatedAt)}, ${sqlString(manifest.generatedAt)});

INSERT OR REPLACE INTO dictionary_active_versions
  (source_id, active_version_id, previous_version_id, switched_at)
VALUES
  ('jmdict', ${sqlString(version)}, NULL, ${sqlString(manifest.generatedAt)});
`;
}

function writeJson(filePath, value) {
  const body = `${JSON.stringify(value, null, 2)}\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, body);
  return {
    bytes: Buffer.byteLength(body),
    sha256: sha256(body)
  };
}

const input = arg("--input");
const outDir = arg("--out");
if (!input || !outDir || process.argv.includes("--help")) {
  usage();
  process.exit(input && process.argv.includes("--help") ? 0 : 1);
}

const versionArg = arg("--version") || "";
const sourceUrl = arg("--source-url") || SOURCE_URL;
const sourceLastModified = arg("--source-last-modified") || null;
const r2Bucket = arg("--r2-bucket") || DEFAULT_BUCKET;
const r2Prefix = (arg("--r2-prefix") || DEFAULT_PREFIX).replace(/^\/+|\/+$/g, "");
const maxEntries = Number(arg("--max-entries") || "0");

const parsed = await parseToShards(input, maxEntries);
const sourceVersionDate = parsed.sourceCreatedDate || new Date().toISOString().slice(0, 10);
const version = versionArg || `${DEFAULT_VERSION}-${sourceVersionDate}`;
const versionPrefix = `${r2Prefix}/${version}`;
const shardFiles = [];

for (const kind of ["surface", "reading"]) {
  const kindDir = path.join(outDir, "shards", kind);
  for (const [shardKey, terms] of [...parsed.shards[kind].entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const shard = sortedShardObject(kind, shardKey, terms);
    const relPath = `shards/${kind}/${shardKey}.json`;
    const stats = writeJson(path.join(outDir, relPath), shard);
    shardFiles.push({
      kind,
      shardKey,
      terms: Object.keys(shard.terms).length,
      entries: Object.values(shard.terms).reduce((sum, entries) => sum + entries.length, 0),
      bytes: stats.bytes,
      sha256: stats.sha256,
      r2Key: `${versionPrefix}/${relPath}`
    });
  }
}

const totalShardBytes = shardFiles.reduce((sum, item) => sum + item.bytes, 0);
const maxShardBytes = shardFiles.reduce((max, item) => Math.max(max, item.bytes), 0);
const missingRequiredTerms = Object.entries(parsed.requiredHits)
  .filter(([, hit]) => !hit)
  .map(([term]) => term);
const manifest = {
  schemaVersion: 1,
  source: "JMdict",
  version,
  generatedAt: new Date().toISOString(),
  sourceUrl,
  sourceCreatedDate: parsed.sourceCreatedDate,
  sourceLastModified,
  sourceSha256: parsed.sourceSha256,
  license: "CC BY-SA 4.0",
  licenseUrl: LICENSE_URL,
  attribution: "JMdict / EDRDG",
  attributionText: ATTRIBUTION_TEXT,
  r2Bucket,
  r2Prefix: versionPrefix,
  r2ManifestKey: `${versionPrefix}/manifest.json`,
  rawSourceKey: `dictionary/raw/jmdict/${sourceVersionDate}/JMdict_e.gz`,
  sourceChecksumKey: `dictionary/raw/jmdict/${sourceVersionDate}/JMdict_e.gz.sha256`,
  shardStrategy: `fnv1a-utf16-low-${SHARD_HEX_WIDTH * 4}-bit surface/reading shards`,
  counts: parsed.counts,
  compressedBytes: parsed.compressedBytes,
  xmlBytes: parsed.xmlBytes,
  shardCount: shardFiles.length,
  averageShardBytes: shardFiles.length ? Math.round(totalShardBytes / shardFiles.length) : 0,
  maxShardBytes,
  totalShardBytes,
  shardIndex: shardFiles,
  requiredTerms: {
    terms: REQUIRED_TERMS,
    missing: missingRequiredTerms,
    hits: parsed.requiredHits
  },
  d1MetadataRows: 3,
  aiGeneratedEntries: false,
  chineseGlossStatus: "null/not generated",
  fullSourceCommittedToGit: false,
  generatedLargeArtifactsCommittedToGit: false,
  uploadCommands: {
    shardsDirectory: path.join(outDir, "shards"),
    shardObjectPrefix: `${r2Bucket}/${versionPrefix}/shards/`,
    manifest: `npx wrangler r2 object put ${r2Bucket}/${versionPrefix}/manifest.json --file ${path.join(outDir, "manifest.json")} --content-type application/json --remote`,
    metadata: `npx wrangler d1 execute baina-dictionary --remote --file ${path.join(outDir, "d1-active-version.sql")}`
  },
  r2UsageEstimate: {
    storageBytesAdded: totalShardBytes,
    classAOperationsForUpload: shardFiles.length + 1,
    classBOperationsForRequiredValidation: REQUIRED_TERMS.length,
    expectedFreeTierStatus: "yes"
  }
};

const manifestStats = writeJson(path.join(outDir, "manifest.json"), manifest);
fs.writeFileSync(path.join(outDir, "manifest.json.sha256"), `${manifestStats.sha256}  manifest.json\n`);
fs.writeFileSync(path.join(outDir, "d1-active-version.sql"), metadataSql(manifest));
writeJson(path.join(outDir, "build-report.json"), {
  version,
  sourceSha256: parsed.sourceSha256,
  sourceCreatedDate: parsed.sourceCreatedDate,
  counts: parsed.counts,
  missingRequiredTerms,
  shardCount: manifest.shardCount,
  averageShardBytes: manifest.averageShardBytes,
  maxShardBytes: manifest.maxShardBytes,
  totalShardBytes: manifest.totalShardBytes,
  r2UsageEstimate: manifest.r2UsageEstimate,
  output: outDir
});

console.log(JSON.stringify({
  version,
  sourceSha256: parsed.sourceSha256,
  sourceCreatedDate: parsed.sourceCreatedDate,
  counts: parsed.counts,
  missingRequiredTerms,
  shardCount: manifest.shardCount,
  averageShardBytes: manifest.averageShardBytes,
  maxShardBytes: manifest.maxShardBytes,
  totalShardBytes: manifest.totalShardBytes,
  r2UsageEstimate: manifest.r2UsageEstimate,
  output: outDir
}, null, 2));
