#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";
import zlib from "node:zlib";

const SOURCE_URL = "https://www.edrdg.org/pub/Nihongo/JMdict_e.gz";
const ATTRIBUTION_TEXT = "Dictionary data: JMdict / EDRDG, CC BY-SA 4.0";
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
  node scripts/dictionary/jmdict-full-dry-run.js --input /tmp/JMdict_e.gz --out /tmp/jmdict-full-dry-run [options]

Options:
  --source-url <url>             Source URL, defaults to official JMdict_e.gz
  --source-last-modified <value> Last-Modified header from the download response
  --r2-bucket <name>             R2 bucket used for raw source and manifest
  --r2-prefix <prefix>           R2 key prefix, e.g. dictionary/raw/jmdict/2026-06-18
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
    gloss: textValues(block, "gloss", entityMap)
  }));
  return { entSeq, kanji, readings, senses };
}

function entryForms(entry) {
  return new Set([
    ...entry.kanji.map((item) => item.text),
    ...entry.readings.map((item) => item.text)
  ].filter(Boolean));
}

function hasCommonPriority(entry) {
  return [...entry.kanji, ...entry.readings].some((item) =>
    item.priority.some((priority) => /^(news|ichi|spec|gai)1$/.test(priority))
  );
}

function estimateD1Rows(counts) {
  const metadataRows = 3;
  const baseRows = metadataRows + counts.entries + counts.forms + counts.senses;
  const indexedRows = baseRows + counts.entries + (counts.forms * 2) + counts.senses;
  const freeRowsWrittenPerDay = 100000;
  return {
    metadataRows,
    baseRows,
    conservativeRowsWrittenWithCurrentIndexes: indexedRows,
    freeRowsWrittenPerDay,
    estimatedDaysAtFreeWriteLimit: Math.ceil(indexedRows / freeRowsWrittenPerDay)
  };
}

function r2Keys(prefix) {
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, "");
  return {
    raw: `${cleanPrefix}/JMdict_e.gz`,
    checksum: `${cleanPrefix}/JMdict_e.gz.sha256`,
    manifest: `${cleanPrefix}/manifest.json`,
    estimate: `${cleanPrefix}/import-estimate.json`
  };
}

async function analyze(inputPath) {
  const rawHash = crypto.createHash("sha256");
  const rawStream = fs.createReadStream(inputPath);
  rawStream.on("data", (chunk) => rawHash.update(chunk));
  const xmlStream = inputPath.endsWith(".gz") ? rawStream.pipe(zlib.createGunzip()) : rawStream;
  const decoder = new StringDecoder("utf8");

  let buffer = "";
  let preamble = "";
  let entityMap = new Map();
  let sourceCreatedDate = null;
  let entitiesLoaded = false;
  let xmlBytes = 0;
  const counts = {
    entries: 0,
    kanjiElements: 0,
    readingElements: 0,
    forms: 0,
    senses: 0,
    englishGlosses: 0,
    commonEntries: 0,
    entriesWithEnglishGloss: 0
  };
  const requiredHits = Object.fromEntries(REQUIRED_TERMS.map((term) => [term, null]));

  const processEntry = (entryXml) => {
    const entry = parseEntry(entryXml, entityMap);
    counts.entries += 1;
    counts.kanjiElements += entry.kanji.length;
    counts.readingElements += entry.readings.length;
    counts.forms += entry.kanji.length + entry.readings.length;
    counts.senses += entry.senses.length;
    counts.englishGlosses += entry.senses.reduce((sum, sense) => sum + sense.gloss.length, 0);
    if (entry.senses.some((sense) => sense.gloss.length > 0)) counts.entriesWithEnglishGloss += 1;
    if (hasCommonPriority(entry)) counts.commonEntries += 1;
    const forms = entryForms(entry);
    for (const term of REQUIRED_TERMS) {
      if (!requiredHits[term] && forms.has(term)) {
        requiredHits[term] = {
          jmdictEntryId: entry.entSeq,
          kanji: entry.kanji.map((item) => item.text),
          readings: entry.readings.map((item) => item.text),
          senseCount: entry.senses.length,
          firstGloss: entry.senses.find((sense) => sense.gloss.length)?.gloss || []
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

    while (true) {
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
      const entryXml = buffer.slice(start, end + "</entry>".length);
      processEntry(entryXml);
      buffer = buffer.slice(end + "</entry>".length);
    }
  }
  buffer += decoder.end();
  if (buffer.includes("<entry>") && buffer.includes("</entry>")) {
    const start = buffer.indexOf("<entry>");
    const end = buffer.indexOf("</entry>", start);
    processEntry(buffer.slice(start, end + "</entry>".length));
  }

  const stat = fs.statSync(inputPath);
  return {
    input: inputPath,
    compressedBytes: stat.size,
    xmlBytes,
    sourceSha256: rawHash.digest("hex"),
    sourceCreatedDate,
    entityCount: entityMap.size,
    counts,
    requiredHits
  };
}

const input = arg("--input");
const outDir = arg("--out");
if (!input || process.argv.includes("--help")) {
  usage();
  process.exit(input ? 0 : 1);
}

const sourceUrl = arg("--source-url") || SOURCE_URL;
const sourceLastModified = arg("--source-last-modified") || null;
const r2Bucket = arg("--r2-bucket") || "baina-dictionary-artifacts";
const r2Prefix = arg("--r2-prefix") || "dictionary/raw/jmdict/unknown";
const keys = r2Keys(r2Prefix);
const analyzed = await analyze(input);
const d1Estimate = estimateD1Rows(analyzed.counts);
const missingRequiredTerms = Object.entries(analyzed.requiredHits)
  .filter(([, hit]) => !hit)
  .map(([term]) => term);
const manifest = {
  source: "JMdict",
  source_url: sourceUrl,
  source_created_date: analyzed.sourceCreatedDate,
  source_last_modified: sourceLastModified,
  source_sha256: analyzed.sourceSha256,
  license: "CC BY-SA 4.0",
  license_url: "https://creativecommons.org/licenses/by-sa/4.0/",
  attribution_text: ATTRIBUTION_TEXT,
  imported_at: new Date().toISOString(),
  r2_bucket: r2Bucket,
  r2_keys: keys,
  counts: analyzed.counts,
  required_terms: {
    terms: REQUIRED_TERMS,
    missing: missingRequiredTerms,
    hits: analyzed.requiredHits
  },
  d1_full_import_estimate: d1Estimate,
  cost_safe_recommendation: {
    recommended: "R2 sharded dictionary lookup with D1 metadata only",
    reason: "Full normalized D1 import exceeds the Workers Free 100,000 rows written/day limit in one pass.",
    d1_metadata_rows: 3,
    r2_shard_strategy: "Hash or prefix shards for surface and reading lookup; each lookup reads one to a few small shards, while D1 stores only source/version/active metadata.",
    full_d1_import_free_tier_path: {
      allowed_rows_written_per_day: d1Estimate.freeRowsWrittenPerDay,
      estimated_days: d1Estimate.estimatedDaysAtFreeWriteLimit,
      risk: "Long-running multi-day import coordination and index-write accounting; not suitable for this Preview task."
    }
  },
  r2_usage_estimate: {
    standard_storage_bytes_for_uploaded_objects: analyzed.compressedBytes + 20000,
    class_a_operations_for_this_task: 4,
    class_b_operations_for_this_task: 0,
    free_tier_reference: {
      standard_storage_gb_month: 10,
      class_a_operations_per_month: 1000000,
      class_b_operations_per_month: 10000000
    }
  },
  full_source_committed_to_git: false,
  generated_large_artifacts_committed_to_git: false,
  ai_generated_entries: false,
  chinese_gloss_status: "null/not generated"
};

const report = {
  ...analyzed,
  d1FullImportEstimate: d1Estimate,
  r2UsageEstimate: manifest.r2_usage_estimate,
  missingRequiredTerms,
  manifest
};

if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "jmdict-full-dry-run-report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(outDir, "JMdict_e.gz.sha256"), `${analyzed.sourceSha256}  JMdict_e.gz\n`);
}

console.log(JSON.stringify(report, null, 2));
