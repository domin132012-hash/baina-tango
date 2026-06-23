#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import {
  BETA_ENTRIES,
  DICTIONARY_SOURCE
} from "../../functions/api/dictionary/_beta-data.js";

const DEFAULT_OUT = "docs/dictionary/zh-overlay-pilot-500/translation-input.json";
const DEFAULT_LIMIT = 500;

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function usage() {
  console.log(`Usage:
  node scripts/dictionary/jmdict-zh-deepseek-build-top500-input.js [options]

Options:
  --out <path>       Output JSON path, defaults to ${DEFAULT_OUT}
  --limit <n>        Entry limit, defaults to ${DEFAULT_LIMIT}; must be 500 for provider run
  --version <id>     Overlay version id, defaults to jmdict-zh-deepseek-pilot-500-YYYY-MM-DD

This script reads local bounded JMdict beta data only. It does not call AI,
Google Translate, R2, D1, or any runtime lookup endpoint.
`);
}

function normalizeEntry(entry, selectionOrder, overlayVersion) {
  const reading = Array.isArray(entry.readings) ? entry.readings[0] || "" : "";
  return {
    selectionOrder,
    seedTerm: entry.headword,
    entryId: entry.id,
    headword: entry.headword,
    reading,
    readings: Array.isArray(entry.readings) ? entry.readings : [],
    partOfSpeech: Array.isArray(entry.partOfSpeech) ? entry.partOfSpeech : [],
    isCommon: !!entry.isCommon,
    matchType: "local_beta_top500_order",
    source: DICTIONARY_SOURCE.source,
    sourceDictionaryVersion: DICTIONARY_SOURCE.sourceVersion,
    license: DICTIONARY_SOURCE.license,
    attribution: DICTIONARY_SOURCE.attribution,
    senses: (entry.senses || []).map((sense, index) => {
      const senseIndex = Number(sense.senseOrder || index + 1);
      return {
        entryId: entry.id,
        senseIndex,
        senseId: `${entry.id}:sense:${senseIndex}`,
        originalEnglishGlosses: Array.isArray(sense.englishGloss) ? sense.englishGloss : [],
        chineseGlosses: [],
        translationStatus: "pending_deepseek_translation",
        reviewStatus: "unreviewed",
        providerName: null,
        sourceDictionaryVersion: DICTIONARY_SOURCE.sourceVersion,
        zhOverlayVersion: overlayVersion,
        generatedAt: null,
        partOfSpeech: Array.isArray(sense.partOfSpeech) ? sense.partOfSpeech : []
      };
    })
  };
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

  const outPath = arg("--out") || DEFAULT_OUT;
  const limit = Number(arg("--limit") || String(DEFAULT_LIMIT));
  if (!Number.isInteger(limit) || limit <= 0 || limit > DEFAULT_LIMIT) {
    throw new Error(`limit must be a positive integer <= ${DEFAULT_LIMIT}`);
  }

  const date = new Date().toISOString().slice(0, 10);
  const overlayVersion = arg("--version") || `jmdict-zh-deepseek-pilot-500-${date}`;
  const entries = BETA_ENTRIES.slice(0, limit).map((entry, index) =>
    normalizeEntry(entry, index + 1, overlayVersion)
  );
  const senseCount = entries.reduce((sum, entry) => sum + entry.senses.length, 0);
  const batch = {
    type: "jmdict-zh-overlay-translation-input",
    overlayVersion,
    generatedAt: new Date().toISOString(),
    providerStatus: "pending_deepseek_local_artifact_only",
    providerName: null,
    source: {
      file: "functions/api/dictionary/_beta-data.js",
      sourceDictionaryVersion: DICTIONARY_SOURCE.sourceVersion,
      sourceCreatedDate: DICTIONARY_SOURCE.sourceCreatedDate,
      selection: DICTIONARY_SOURCE.selection
    },
    targetR2Prefix: null,
    notes: [
      "Top 500 local artifact input only.",
      "Do not upload this output to R2 or write D1 without separate approval.",
      "Do not use runtime AI translation during lookup.",
      "English JMdict R2 shards remain unchanged."
    ],
    safety: {
      runtimeAiCalls: 0,
      googleTranslateCalls: 0,
      r2Writes: 0,
      d1Writes: 0,
      previewDeploy: false,
      productionDeploy: false,
      overlayActive: false
    },
    counts: {
      selectedEntries: entries.length,
      selectedEntryIds: new Set(entries.map((entry) => entry.entryId)).size,
      selectedSenses: senseCount,
      estimatedEnglishCharactersToTranslate: countCharacters(entries)
    },
    entries
  };

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(batch, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({
    outPath,
    overlayVersion,
    selectedEntries: entries.length,
    selectedSenses: senseCount,
    runtimeAiCalls: 0,
    googleTranslateCalls: 0,
    r2Writes: 0,
    d1Writes: 0,
    previewDeploy: false,
    productionDeploy: false
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
