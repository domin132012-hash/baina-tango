#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function usage() {
  console.log(`Usage:
  node scripts/dictionary/jmdict-import-spike.js --input <JMdict_e.xml|JMdict_e.gz> [--out <dir>] [--max-entries <n>] [--beta-module <path>] [--beta-count <n>]

Examples:
  node scripts/dictionary/jmdict-import-spike.js --input scripts/dictionary/fixtures/sample-fixture.xml --out /tmp/jmdict-spike
  node scripts/dictionary/jmdict-import-spike.js --input /tmp/JMdict_e.gz --out /tmp/jmdict-spike --max-entries 1000
  node scripts/dictionary/jmdict-import-spike.js --input /tmp/JMdict_e.gz --out /tmp/jmdict-spike --beta-module functions/api/dictionary/_beta-data.js --beta-count 1000
`);
}

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : "";
}

function readInput(inputPath) {
  const raw = fs.readFileSync(inputPath);
  const sha256 = crypto.createHash("sha256").update(raw).digest("hex");
  const xml = inputPath.endsWith(".gz") ? zlib.gunzipSync(raw).toString("utf8") : raw.toString("utf8");
  return { xml, compressedBytes: raw.byteLength, sha256 };
}

let xmlEntityMap = new Map();

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
  const re = /<!ENTITY\s+([A-Za-z0-9_-]+)\s+"([^"]*)">/g;
  let match;
  while ((match = re.exec(xml))) {
    map.set(match[1], decodeBuiltInXml(match[2].trim()));
  }
  xmlEntityMap = map;
}

function textValues(xml, tag) {
  const out = [];
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "g");
  let match;
  while ((match = re.exec(xml))) out.push(decodeXml(match[1].trim()));
  return out;
}

function blocks(xml, tag) {
  const out = [];
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>[\\s\\S]*?</${tag}>`, "g");
  let match;
  while ((match = re.exec(xml))) out.push(match[0]);
  return out;
}

function decodeXml(value) {
  return decodeBuiltInXml(value).replace(/&([A-Za-z0-9_-]+);/g, (_, name) =>
    xmlEntityMap.get(name) || name
  );
}

function createdDate(xml) {
  const match = xml.match(/JMdict created:\s*([0-9-]+)/);
  return match ? match[1] : null;
}

function parseEntry(entryXml) {
  const entSeq = textValues(entryXml, "ent_seq")[0] || "";
  const kanji = blocks(entryXml, "k_ele").map((block) => ({
    text: textValues(block, "keb")[0] || "",
    priority: textValues(block, "ke_pri")
  })).filter((item) => item.text);
  const readings = blocks(entryXml, "r_ele").map((block) => ({
    text: textValues(block, "reb")[0] || "",
    priority: textValues(block, "re_pri"),
    noKanji: textValues(block, "re_nokanji").length > 0
  })).filter((item) => item.text);
  const senseBlocks = blocks(entryXml, "sense");
  const senses = senseBlocks.map((block, index) => ({
    senseOrder: index + 1,
    partOfSpeech: textValues(block, "pos"),
    misc: textValues(block, "misc"),
    field: textValues(block, "field"),
    gloss: textValues(block, "gloss")
  }));
  const primarySpelling = kanji[0]?.text || readings[0]?.text || "";
  const primaryReading = readings[0]?.text || "";
  return {
    entSeq,
    primarySpelling,
    primaryReading,
    isCommon: [...kanji, ...readings].some((item) => item.priority.some((p) => /^(news|ichi|spec|gai)1$/.test(p))),
    kanji,
    readings,
    senses
  };
}

const REQUIRED_BETA_TERMS = [
  "平和",
  "学校",
  "先生",
  "問題",
  "勉強",
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

function entryForms(entry) {
  return new Set([
    entry.primarySpelling,
    entry.primaryReading,
    ...entry.kanji.map((item) => item.text),
    ...entry.readings.map((item) => item.text)
  ].filter(Boolean));
}

function hasPriority(entry) {
  return [...entry.kanji, ...entry.readings].some((item) => item.priority.length > 0);
}

function hasKanji(value) {
  return /[\u3400-\u9fff]/.test(value);
}

function hasKatakana(value) {
  return /[\u30a0-\u30ff\uff21-\uff3a]/.test(value);
}

function isLearnerBetaExcluded(entry) {
  const text = entry.senses.flatMap((sense) => sense.gloss).join(" ").toLowerCase();
  return /\b(erotic|pornographic|obscene|genitals|sexual desire|bikini thong|private parts|menses)\b/.test(text);
}

function betaScore(entry) {
  const forms = Array.from(entryForms(entry));
  let score = 0;
  if (hasPriority(entry)) score += 100;
  if (entry.isCommon) score += 50;
  if (forms.some(hasKanji)) score += 40;
  if (entry.primarySpelling && hasKanji(entry.primarySpelling)) score += 20;
  if (forms.some((form) => /^[ぁ-ん]+$/.test(form))) score += 8;
  if (entry.senses.length <= 4) score += 5;
  if (entry.primarySpelling && hasKatakana(entry.primarySpelling)) score -= 25;
  if (!forms.some(hasKanji) && forms.some(hasKatakana)) score -= 35;
  return score;
}

function betaEntry(entry) {
  const forms = Array.from(entryForms(entry));
  const partOfSpeech = Array.from(new Set(entry.senses.flatMap((sense) => sense.partOfSpeech))).filter(Boolean);
  return {
    id: `jmdict-${entry.entSeq}`,
    jmdictEntryId: entry.entSeq,
    headword: entry.primarySpelling,
    readings: Array.from(new Set(entry.readings.map((item) => item.text))).filter(Boolean),
    forms,
    partOfSpeech,
    isCommon: entry.isCommon || hasPriority(entry),
    senses: entry.senses.map((sense) => ({
      englishGloss: sense.gloss,
      chineseGloss: null,
      senseOrder: sense.senseOrder,
      partOfSpeech: sense.partOfSpeech
    })).filter((sense) => sense.englishGloss.length > 0)
  };
}

function selectBetaEntries(entries, count) {
  const selected = [];
  const seen = new Set();
  const add = (entry) => {
    if (!entry || seen.has(entry.entSeq) || selected.length >= count) return;
    const converted = betaEntry(entry);
    if (!converted.headword || !converted.readings.length || !converted.senses.length) return;
    selected.push(converted);
    seen.add(entry.entSeq);
  };

  for (const term of REQUIRED_BETA_TERMS) {
    add(entries.find((entry) => entryForms(entry).has(term)));
  }
  const rankedEntries = entries
    .map((entry, index) => ({ entry, index, score: betaScore(entry) }))
    .filter((item) => hasPriority(item.entry) && !isLearnerBetaExcluded(item.entry))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  for (const item of rankedEntries) add(item.entry);
  for (const entry of entries) {
    if (!isLearnerBetaExcluded(entry)) add(entry);
  }

  const betaTerms = new Set(selected.flatMap((entry) => entry.forms));
  const missingRequiredTerms = REQUIRED_BETA_TERMS.filter((term) => !betaTerms.has(term));
  if (missingRequiredTerms.length) {
    throw new Error(`Missing required beta terms from JMdict source: ${missingRequiredTerms.join(", ")}`);
  }
  if (selected.length !== count) {
    throw new Error(`Expected ${count} beta entries, got ${selected.length}`);
  }
  return selected;
}

function writeBetaModule(modulePath, entries, metadata) {
  const sourceVersion = `jmdict-english-beta-${entries.length}-${metadata.sourceCreatedDate || "unknown"}`;
  const body = `// Generated by scripts/dictionary/jmdict-import-spike.js from official JMdict source data.
// Do not edit entries by hand. Do not replace this bounded beta with full JMdict raw XML/gzip.

export const DICTIONARY_SOURCE = ${JSON.stringify({
    source: "JMdict",
    sourceVersion,
    sourceUrl: "https://www.edrdg.org/pub/Nihongo/JMdict_e.gz",
    sourceCreatedDate: metadata.sourceCreatedDate,
    sourceLastModified: metadata.sourceLastModified || "Wed, 17 Jun 2026 03:30:21 GMT",
    sourceSha256: metadata.inputSha256,
    license: "CC BY-SA 4.0",
    attribution: "JMdict / EDRDG",
    attributionText: "Dictionary data: JMdict / EDRDG, CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    entryCount: entries.length,
    selection: "Required Issue #5 terms plus scored JMdict priority/common learner entries, preferring kanji/basic forms and excluding obvious adult-content glosses from this bounded beta. English glosses are parsed from JMdict; Chinese glosses are intentionally null."
  }, null, 2)};

export const BETA_ENTRY_COUNT = ${entries.length};

export const BETA_ENTRIES = ${JSON.stringify(entries)};
`;
  fs.mkdirSync(path.dirname(modulePath), { recursive: true });
  fs.writeFileSync(modulePath, body);
}

function normalize(entries) {
  const source = {
    id: "jmdict",
    name: "JMdict",
    license: "CC BY-SA 4.0",
    attributionText: "Dictionary data: JMdict / EDRDG, CC BY-SA 4.0"
  };
  const version = {
    id: "jmdict-spike",
    sourceId: source.id,
    status: "staging"
  };
  const rows = {
    sources: [source],
    versions: [version],
    entries: [],
    forms: [],
    senses: []
  };
  for (const entry of entries) {
    rows.entries.push({
      id: entry.entSeq,
      sourceId: source.id,
      versionId: version.id,
      jmdictEntryId: entry.entSeq,
      primarySpelling: entry.primarySpelling,
      primaryReading: entry.primaryReading,
      isCommon: entry.isCommon
    });
    let formOrder = 0;
    for (const item of entry.kanji) {
      rows.forms.push({
        entryId: entry.entSeq,
        form: item.text,
        reading: entry.primaryReading,
        formType: "kanji",
        priority: item.priority,
        formOrder: ++formOrder
      });
    }
    for (const item of entry.readings) {
      rows.forms.push({
        entryId: entry.entSeq,
        form: item.text,
        reading: item.text,
        formType: "reading",
        priority: item.priority,
        formOrder: ++formOrder
      });
    }
    for (const sense of entry.senses) {
      rows.senses.push({
        entryId: entry.entSeq,
        senseOrder: sense.senseOrder,
        partOfSpeech: sense.partOfSpeech,
        englishGloss: sense.gloss,
        chineseGloss: null,
        translationStatus: "none",
        reviewStatus: "none"
      });
    }
  }
  return rows;
}

const input = arg("--input");
const outDir = arg("--out");
const maxEntries = Number(arg("--max-entries") || "0");
const betaModule = arg("--beta-module");
const betaCount = Number(arg("--beta-count") || "1000");

if (!input || process.argv.includes("--help")) {
  usage();
  process.exit(input ? 0 : 1);
}

const { xml, compressedBytes, sha256 } = readInput(input);
loadEntityMap(xml);
const entryXmlBlocks = blocks(xml, "entry");
const selectedBlocks = maxEntries > 0 ? entryXmlBlocks.slice(0, maxEntries) : entryXmlBlocks;
const entries = selectedBlocks.map(parseEntry);
const rows = normalize(entries);
const report = {
  input: path.basename(input),
  sourceCreatedDate: createdDate(xml),
  inputSha256: sha256,
  compressedBytes,
  xmlBytes: Buffer.byteLength(xml),
  totalEntryBlocks: entryXmlBlocks.length,
  parsedEntries: entries.length,
  normalizedCounts: {
    entries: rows.entries.length,
    forms: rows.forms.length,
    senses: rows.senses.length
  },
  sampleQueries: ["努力", "平和", "食べる", "読まなかった"],
  betaModule: betaModule || null,
  betaEntryCount: betaModule ? betaCount : 0,
  warnings: [
    "This spike parser is intentionally dependency-free and regex-based for import shape analysis.",
    "Production import should use a streaming XML parser and entity-aware validation before writing D1/R2 artifacts.",
    "Do not write full JMdict/KANJIDIC2 raw files or generated SQLite artifacts into Git."
  ]
};

if (betaModule) {
  const allEntries = maxEntries > 0 ? entries : entryXmlBlocks.map(parseEntry);
  const betaEntries = selectBetaEntries(allEntries, betaCount);
  writeBetaModule(betaModule, betaEntries, {
    sourceCreatedDate: report.sourceCreatedDate,
    inputSha256: sha256
  });
  report.betaEntryCount = betaEntries.length;
  report.betaRequiredTerms = REQUIRED_BETA_TERMS;
}

if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "jmdict-import-report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, "jmdict-normalized-sample.json"), JSON.stringify({
    ...rows,
    entries: rows.entries.slice(0, 20),
    forms: rows.forms.slice(0, 80),
    senses: rows.senses.slice(0, 80)
  }, null, 2));
}

console.log(JSON.stringify(report, null, 2));
