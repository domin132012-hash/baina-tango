#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import {
  REQUIRED_ZH_OVERLAY_TERMS,
  ZH_OVERLAY_PILOT_TERMS
} from "./zh-overlay-pilot-terms.js";

const DEFAULT_API_BASE = "https://baina-tango.pages.dev/api/dictionary/lookup";
const DEFAULT_OUT = "docs/dictionary/zh-overlay-pilot-100/translation-input.json";
const DEFAULT_VERSION = "jmdict-zh-machine-pilot-100-2026-06-22";

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function usage() {
  console.log(`Usage:
  node scripts/dictionary/jmdict-zh-overlay-build-input.js [options]

Options:
  --api-base <url>     Lookup API URL, defaults to ${DEFAULT_API_BASE}
  --out <path>         Output JSON path, defaults to ${DEFAULT_OUT}
  --limit <n>          Entry limit, defaults to 100
  --version <id>       Overlay version id, defaults to ${DEFAULT_VERSION}

This script reads the existing lookup API only. It does not translate,
write R2, write D1, call AI, or modify English JMdict shards.
`);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeText(value) {
  return String(value || "").trim();
}

function senseInput(entry, sense, index, overlayVersion, sourceVersion) {
  const senseIndex = Number(sense.senseOrder || index + 1);
  return {
    entryId: entry.id,
    senseIndex,
    senseId: `${entry.id}:sense:${senseIndex}`,
    originalEnglishGlosses: Array.isArray(sense.englishGloss) ? sense.englishGloss : [],
    chineseGlosses: [],
    translationStatus: "pending_provider_translation",
    reviewStatus: "unreviewed",
    providerName: null,
    sourceDictionaryVersion: sourceVersion,
    zhOverlayVersion: overlayVersion,
    generatedAt: null,
    partOfSpeech: Array.isArray(sense.partOfSpeech) ? sense.partOfSpeech : []
  };
}

function entryInput(entry, seedTerm, selectionOrder, overlayVersion, sourceVersion) {
  const senses = Array.isArray(entry.senses) ? entry.senses : [];
  return {
    selectionOrder,
    seedTerm,
    entryId: entry.id,
    headword: entry.headword,
    reading: entry.reading || "",
    readings: Array.isArray(entry.readings) ? entry.readings : [],
    partOfSpeech: Array.isArray(entry.partOfSpeech) ? entry.partOfSpeech : [],
    isCommon: !!entry.isCommon,
    matchType: entry.matchType || "",
    source: entry.source || "JMdict",
    sourceDictionaryVersion: sourceVersion,
    license: entry.license || "CC BY-SA 4.0",
    attribution: entry.attribution || "JMdict / EDRDG",
    senses: senses.map((sense, index) => senseInput(entry, sense, index, overlayVersion, sourceVersion))
  };
}

async function lookup(apiBase, term) {
  const url = new URL(apiBase);
  url.searchParams.set("q", term);
  url.searchParams.set("lang", "zh");
  url.searchParams.set("mode", "basic");
  const response = await fetch(url);
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`Lookup failed for ${term}: HTTP ${response.status}`);
  }
  if (data.aiCalled !== false) {
    throw new Error(`Lookup unexpectedly set aiCalled for ${term}`);
  }
  return data;
}

function countCharacters(entries) {
  return entries.reduce((sum, entry) => {
    return sum + entry.senses.reduce((senseSum, sense) => {
      return senseSum + sense.originalEnglishGlosses.join("; ").length;
    }, 0);
  }, 0);
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    usage();
    return;
  }

  const apiBase = arg("--api-base") || DEFAULT_API_BASE;
  const outPath = arg("--out") || DEFAULT_OUT;
  const limit = Number(arg("--limit") || "100");
  const overlayVersion = arg("--version") || DEFAULT_VERSION;
  const generatedAt = new Date().toISOString();
  const seenEntries = new Set();
  const entries = [];
  const lookupResults = [];
  const terms = unique(ZH_OVERLAY_PILOT_TERMS);

  for (const term of terms) {
    if (entries.length >= limit) break;
    const data = await lookup(apiBase, term);
    const sourceVersion = normalizeText(data.source?.sourceVersion) || "jmdict-english-r2-shards-2026-06-18";
    const resultEntries = Array.isArray(data.entries) ? data.entries : [];
    lookupResults.push({
      term,
      dictionarySource: data.dictionarySource || null,
      aiCalled: data.aiCalled,
      resultCount: resultEntries.length
    });
    for (const entry of resultEntries) {
      if (entries.length >= limit) break;
      if (!entry?.id || seenEntries.has(entry.id)) continue;
      seenEntries.add(entry.id);
      entries.push(entryInput(entry, term, entries.length + 1, overlayVersion, sourceVersion));
    }
  }

  const selectedEntryIds = new Set(entries.map((entry) => entry.entryId));
  const requiredCoverage = REQUIRED_ZH_OVERLAY_TERMS.map((term) => {
    const hit = entries.find((entry) => entry.seedTerm === term);
    return {
      term,
      selected: !!hit,
      entryId: hit?.entryId || null,
      headword: hit?.headword || null
    };
  });

  const batch = {
    type: "jmdict-zh-overlay-translation-input",
    overlayVersion,
    generatedAt,
    providerStatus: "blocked_no_dedicated_machine_translation_provider",
    providerName: null,
    sourceLookupApi: apiBase,
    targetR2Prefix: `dictionary/zh-overlays/${overlayVersion}`,
    notes: [
      "English JMdict R2 shards must remain unchanged.",
      "This file is translation input only; chineseGlosses are intentionally empty.",
      "Use a dedicated machine translation provider offline, then review and build an overlay artifact.",
      "Do not use runtime AI translation during lookup."
    ],
    counts: {
      seedTerms: terms.length,
      selectedEntries: entries.length,
      selectedEntryIds: selectedEntryIds.size,
      requiredTerms: REQUIRED_ZH_OVERLAY_TERMS.length,
      estimatedEnglishCharactersToTranslate: countCharacters(entries)
    },
    requiredCoverage,
    lookupResults,
    entries
  };

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(batch, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    outPath,
    overlayVersion,
    selectedEntries: entries.length,
    estimatedEnglishCharactersToTranslate: batch.counts.estimatedEnglishCharactersToTranslate,
    requiredMissing: requiredCoverage.filter((item) => !item.selected)
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
