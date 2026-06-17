#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function usage() {
  console.log(`Usage:
  node scripts/dictionary/jmdict-import-spike.js --input <JMdict_e.xml|JMdict_e.gz> [--out <dir>] [--max-entries <n>]

Examples:
  node scripts/dictionary/jmdict-import-spike.js --input scripts/dictionary/fixtures/sample-fixture.xml --out /tmp/jmdict-spike
  node scripts/dictionary/jmdict-import-spike.js --input /tmp/JMdict_e.gz --out /tmp/jmdict-spike --max-entries 1000
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
  return String(value)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&([A-Za-z0-9_-]+);/g, "$1");
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

if (!input || process.argv.includes("--help")) {
  usage();
  process.exit(input ? 0 : 1);
}

const { xml, compressedBytes, sha256 } = readInput(input);
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
  warnings: [
    "This spike parser is intentionally dependency-free and regex-based for import shape analysis.",
    "Production import should use a streaming XML parser and entity-aware validation before writing D1/R2 artifacts.",
    "Do not write full JMdict/KANJIDIC2 raw files or generated SQLite artifacts into Git."
  ]
};

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
