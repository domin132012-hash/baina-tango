#!/usr/bin/env node
// Dry-run helper: estimates Top 1000 DeepSeek token counts without calling provider.
// Reads local BETA_ENTRIES (entries 500-999) only. No provider, no R2/D1, no deploy.

import fs from "node:fs/promises";
import {
  BETA_ENTRIES,
  DICTIONARY_SOURCE
} from "../../functions/api/dictionary/_beta-data.js";

const BATCH_ENTRIES = 20;
const SKIP = 500;
const LIMIT = 1000;
const PROMPT_PATH = "scripts/dictionary/prompts/jmdict-zh-deepseek-system.md";

function estimateTokens(text) {
  let asciiChars = 0;
  let nonAsciiChars = 0;
  for (const char of String(text || "")) {
    if (char.charCodeAt(0) <= 0x7f) asciiChars += 1;
    else nonAsciiChars += 1;
  }
  return Math.ceil(asciiChars / 4) + nonAsciiChars;
}

function estimateOutputTokens(entries) {
  const senseCount = entries.reduce((sum, entry) => sum + (entry.senses || []).length, 0);
  return (entries.length * 40) + (senseCount * 115);
}

function entryWrittenForm(entry) {
  return entry.headword || entry.seedTerm || entry.entryId || "";
}

function entryForPrompt(entry) {
  return {
    entryId: entry.id,
    writtenForm: entryWrittenForm(entry),
    reading: (entry.readings && entry.readings[0]) || "",
    partOfSpeech: entry.partOfSpeech || [],
    senses: (entry.senses || []).map((sense) => ({
      entryId: entry.id,
      senseIndex: Number(sense.senseOrder || 1),
      partOfSpeech: sense.partOfSpeech || entry.partOfSpeech || [],
      originalEnglishGlosses: sense.englishGloss || []
    }))
  };
}

function chunkEntries(entries, batchSize) {
  const chunks = [];
  for (let i = 0; i < entries.length; i += batchSize) {
    chunks.push(entries.slice(i, i + batchSize));
  }
  return chunks;
}

const systemPrompt = await fs.readFile(PROMPT_PATH, "utf8");

const entries = BETA_ENTRIES.slice(SKIP, LIMIT).map((entry) => {
  const reading = (entry.readings && entry.readings[0]) || "";
  return {
    entryId: entry.id,
    headword: entry.headword,
    reading,
    partOfSpeech: entry.partOfSpeech || [],
    isCommon: !!entry.isCommon,
    senses: (entry.senses || []).map((sense) => ({
      entryId: entry.id,
      senseIndex: Number(sense.senseOrder || 1),
      partOfSpeech: sense.partOfSpeech || entry.partOfSpeech || [],
      originalEnglishGlosses: sense.englishGloss || []
    }))
  };
});

const senseCount = entries.reduce((sum, e) => sum + e.senses.length, 0);
const groups = chunkEntries(entries, BATCH_ENTRIES);

const requests = groups.map((group, idx) => {
  const userPrompt = JSON.stringify({
    entries: group.map(entryForPrompt)
  });
  const estimatedInputTokens = estimateTokens(systemPrompt + "\n" + userPrompt);
  const estimatedOutputTokens = estimateOutputTokens(group);
  return {
    index: idx + 1,
    entries: group.length,
    senses: group.reduce((sum, e) => sum + e.senses.length, 0),
    estimatedInputTokens,
    estimatedOutputTokens
  };
});

const totalInput = requests.reduce((s, r) => s + r.estimatedInputTokens, 0);
const totalOutput = requests.reduce((s, r) => s + r.estimatedOutputTokens, 0);
const totalTokens = totalInput + totalOutput;

// Check against current guardrail values
const currentGuardMaxInput = 30000;
const currentGuardMaxOutput = 30000;
const currentGuardMaxTotal = 60000;
const currentGuardMaxEntries = 500;
const currentGuardMaxRequests = 100;

const guardResults = {
  inputTokens: totalInput <= currentGuardMaxInput ? "PASS" : `EXCEEDS (${totalInput} > ${currentGuardMaxInput})`,
  outputTokens: totalOutput <= currentGuardMaxOutput ? "PASS" : `EXCEEDS (${totalOutput} > ${currentGuardMaxOutput})`,
  totalTokens: totalTokens <= currentGuardMaxTotal ? "PASS" : `EXCEEDS (${totalTokens} > ${currentGuardMaxTotal})`,
  entries: entries.length <= currentGuardMaxEntries ? "PASS" : `EXCEEDS (${entries.length} > ${currentGuardMaxEntries})`,
  requests: requests.length <= currentGuardMaxRequests ? "PASS" : `EXCEEDS (${requests.length} > ${currentGuardMaxRequests})`
};

const guardAllPass = Object.values(guardResults).every(r => r === "PASS");

const suggestedGuardrails = {
  BAINA_ZH_AI_MAX_ENTRIES: 500,
  BAINA_ZH_AI_MAX_INPUT_TOKENS: Math.ceil(totalInput * 1.15),
  BAINA_ZH_AI_MAX_OUTPUT_TOKENS: Math.ceil(totalOutput * 1.1),
  BAINA_ZH_AI_MAX_TOTAL_ESTIMATED_TOKENS: Math.ceil(totalTokens * 1.15),
  BAINA_ZH_AI_MAX_REQUESTS: requests.length,
  BAINA_ZH_AI_APPROVE_RUN: "YES_DEEPSEEK_TOP_1000_ONLY"
};

console.log(JSON.stringify({
  mode: "estimate_only_no_provider_call",
  scope: "Top 1000 (JMdict beta entries 500-999)",
  source: DICTIONARY_SOURCE.source,
  sourceVersion: DICTIONARY_SOURCE.sourceVersion,
  license: DICTIONARY_SOURCE.license,
  promptPath: PROMPT_PATH,
  promptCharLength: systemPrompt.length,
  entries: entries.length,
  senses: senseCount,
  requestCount: requests.length,
  batchSize: BATCH_ENTRIES,
  estimatedInputTokens: totalInput,
  estimatedOutputTokens: totalOutput,
  estimatedTotalTokens: totalTokens,
  estimatedCostUsd: null,
  estimatedCostNote: "not_estimated_provider_pricing_not_configured",
  deepseekApiCalled: false,
  googleTranslateCalled: false,
  runtimeAiCalls: 0,
  r2D1Writes: 0,
  previewDeploy: false,
  productionDeploy: false,
  currentGuardrailCheck: guardResults,
  currentGuardrailAllPass: guardAllPass,
  suggestedGuardrails,
  requests: requests.map(r => ({
    index: r.index,
    entries: r.entries,
    senses: r.senses,
    estimatedInputTokens: r.estimatedInputTokens,
    estimatedOutputTokens: r.estimatedOutputTokens
  }))
}, null, 2));
