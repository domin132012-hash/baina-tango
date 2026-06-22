#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_INPUT = "docs/dictionary/zh-overlay-pilot-100/translation-input.json";
const DEFAULT_REVIEW_OUT = "docs/review/jmdict-zh-pilot-100-review.md";
const DEFAULT_LEDGER_OUT = "docs/review/jmdict-zh-pilot-100-usage-ledger.json";
const GOOGLE_TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate/v2";
const PROVIDER_NAME = "google_cloud_translate";
const TARGET_LANGUAGE = "zh-CN";
const REQUIRED_APPROVAL = "YES_TOP_100_ONLY";
const REQUIRED_MAX_ENTRIES = 100;
const REQUIRED_MAX_CHARS = 10000;
const MAX_REVIEW_ARTIFACT_BYTES = 300000;

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function usage() {
  console.log(`Usage:
  node scripts/dictionary/jmdict-zh-overlay-provider-adapter.js --input <translation-input.json> --review-out <review.md>

Environment:
  GOOGLE_TRANSLATE_API_KEY=<secret>
  BAINA_ZH_MT_APPROVE_RUN=YES_TOP_100_ONLY
  BAINA_ZH_MT_MAX_ENTRIES=100
  BAINA_ZH_MT_MAX_CHARS=10000

This Phase A script translates only the Top 100 pilot review artifact.
It does not write runtime overlays, R2, D1, Production config, or API keys.
`);
}

function fail(payload, status = 2) {
  console.error(JSON.stringify(payload, null, 2));
  process.exit(status);
}

function estimateCharacters(entries) {
  return entries.reduce((sum, entry) => {
    return sum + (entry.senses || []).reduce((senseSum, sense) => {
      return senseSum + (sense.originalEnglishGlosses || []).join("; ").length;
    }, 0);
  }, 0);
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function sanitizeError(error, secrets) {
  let message = error?.stack || error?.message || String(error);
  for (const secret of secrets.filter(Boolean)) {
    message = message.split(secret).join("[REDACTED]");
  }
  return message;
}

function assertGuardrails(batch, apiKey) {
  const entries = batch.entries || [];
  const estimatedChars = estimateCharacters(entries);
  const approveFlag = process.env.BAINA_ZH_MT_APPROVE_RUN || "";
  const maxEntries = Number(process.env.BAINA_ZH_MT_MAX_ENTRIES || "0");
  const maxChars = Number(process.env.BAINA_ZH_MT_MAX_CHARS || "0");

  if (!apiKey) {
    fail({
      blocked: true,
      reason: "GOOGLE_TRANSLATE_API_KEY is missing.",
      keyLength: 0,
      entries: entries.length,
      estimatedChars
    });
  }
  if (approveFlag !== REQUIRED_APPROVAL) {
    fail({
      blocked: true,
      reason: "Approval flag missing or incorrect.",
      required: { BAINA_ZH_MT_APPROVE_RUN: REQUIRED_APPROVAL },
      actual: { BAINA_ZH_MT_APPROVE_RUN: approveFlag || "missing" },
      keyLength: apiKey.length,
      entries: entries.length,
      estimatedChars
    });
  }
  if (maxEntries !== REQUIRED_MAX_ENTRIES) {
    fail({
      blocked: true,
      reason: "Max entries guardrail missing or incorrect.",
      required: { BAINA_ZH_MT_MAX_ENTRIES: REQUIRED_MAX_ENTRIES },
      actual: { BAINA_ZH_MT_MAX_ENTRIES: process.env.BAINA_ZH_MT_MAX_ENTRIES || "missing" },
      keyLength: apiKey.length,
      entries: entries.length,
      estimatedChars
    });
  }
  if (maxChars !== REQUIRED_MAX_CHARS) {
    fail({
      blocked: true,
      reason: "Max chars guardrail missing or incorrect.",
      required: { BAINA_ZH_MT_MAX_CHARS: REQUIRED_MAX_CHARS },
      actual: { BAINA_ZH_MT_MAX_CHARS: process.env.BAINA_ZH_MT_MAX_CHARS || "missing" },
      keyLength: apiKey.length,
      entries: entries.length,
      estimatedChars
    });
  }
  if (entries.length > REQUIRED_MAX_ENTRIES) {
    fail({
      blocked: true,
      reason: "Pilot input exceeds allowed entry count.",
      entries: entries.length,
      maxEntries: REQUIRED_MAX_ENTRIES,
      keyLength: apiKey.length,
      estimatedChars
    });
  }
  if (estimatedChars > REQUIRED_MAX_CHARS) {
    fail({
      blocked: true,
      reason: "Pilot input exceeds allowed character count.",
      entries: entries.length,
      estimatedChars,
      maxChars: REQUIRED_MAX_CHARS,
      keyLength: apiKey.length
    });
  }

  return { entries: entries.length, estimatedChars, keyLength: apiKey.length };
}

function translationItems(entries) {
  const items = [];
  for (const [entryIndex, entry] of entries.entries()) {
    for (const [senseIndex, sense] of (entry.senses || []).entries()) {
      const text = (sense.originalEnglishGlosses || []).join("; ").trim();
      if (!text) continue;
      items.push({
        entryIndex,
        senseIndex,
        entryId: entry.entryId,
        senseId: sense.senseId,
        senseNumber: sense.senseIndex,
        text,
        chars: text.length
      });
    }
  }
  return items;
}

function chunks(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

async function translateGoogleCloud({ apiKey, texts }) {
  const url = new URL(GOOGLE_TRANSLATE_ENDPOINT);
  url.searchParams.set("key", apiKey);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: texts,
      source: "en",
      target: TARGET_LANGUAGE,
      format: "text"
    })
  });
  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : {};
  if (!response.ok) {
    const reason = data?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Google Cloud Translation request failed: ${reason}`);
  }
  const translations = data?.data?.translations || [];
  if (translations.length !== texts.length) {
    throw new Error(`Google Cloud Translation returned ${translations.length} translations for ${texts.length} inputs`);
  }
  return translations.map((item) => decodeHtmlEntities(item.translatedText).trim());
}

function buildReviewArtifact({ batch, inputPath, items, translations, guardrails, requestCount }) {
  const generatedAt = new Date().toISOString();
  const translatedBySense = new Map();
  items.forEach((item, index) => {
    translatedBySense.set(`${item.entryIndex}:${item.senseIndex}`, translations[index]);
  });

  const entries = (batch.entries || []).map((entry, entryIndex) => {
    const senses = (entry.senses || []).map((sense, senseIndex) => {
      const originalEnglishGlosses = sense.originalEnglishGlosses || [];
      const estimatedChars = originalEnglishGlosses.join("; ").length;
      return {
        senseIndex: sense.senseIndex,
        senseId: sense.senseId,
        originalEnglishGlosses,
        machineTranslatedChineseGlosses: [translatedBySense.get(`${entryIndex}:${senseIndex}`) || ""].filter(Boolean),
        translationStatus: "machine_translated",
        reviewStatus: "unreviewed",
        provider: PROVIDER_NAME,
        estimatedChars,
        actualChars: estimatedChars,
        generatedAt
      };
    });
    return {
      entryId: entry.entryId,
      seedTerm: entry.seedTerm,
      japaneseHeadword: entry.headword,
      reading: entry.reading || "",
      readings: entry.readings || [],
      senses
    };
  });

  return {
    type: "jmdict-zh-pilot-100-review",
    phase: "A_review_artifact_only",
    overlayVersion: batch.overlayVersion,
    provider: PROVIDER_NAME,
    targetLanguage: TARGET_LANGUAGE,
    translationStatus: "machine_translated",
    reviewStatus: "unreviewed",
    generatedAt,
    sourceInput: inputPath,
    constraints: {
      maxEntries: REQUIRED_MAX_ENTRIES,
      maxChars: REQUIRED_MAX_CHARS,
      approveRun: REQUIRED_APPROVAL,
      runtimeGoogleCalls: false,
      runtimeOverlayActive: false,
      productionChanged: false
    },
    counts: {
      selectedEntries: entries.length,
      translatedEntries: entries.filter((entry) => entry.senses.some((sense) => sense.machineTranslatedChineseGlosses.length)).length,
      translatedSenses: items.length,
      estimatedChars: guardrails.estimatedChars,
      actualChars: guardrails.estimatedChars,
      providerRequests: requestCount
    },
    entries
  };
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function markdownCell(value) {
  return String(value || "")
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|");
}

function reviewMarkdown(artifact) {
  const lines = [
    "# JMdict Chinese Pilot 100 Review",
    "",
    `- Phase: ${artifact.phase}`,
    `- Provider: ${artifact.provider}`,
    `- Target language: ${artifact.targetLanguage}`,
    `- Translation status: ${artifact.translationStatus}`,
    `- Review status: ${artifact.reviewStatus}`,
    `- Generated at: ${artifact.generatedAt}`,
    `- Source input: ${artifact.sourceInput}`,
    `- Selected entries: ${artifact.counts.selectedEntries}`,
    `- Translated entries: ${artifact.counts.translatedEntries}`,
    `- Translated senses: ${artifact.counts.translatedSenses}`,
    `- Estimated chars: ${artifact.counts.estimatedChars}`,
    `- Actual chars: ${artifact.counts.actualChars}`,
    `- Runtime Google calls: ${artifact.constraints.runtimeGoogleCalls ? "yes" : "no"}`,
    `- Runtime overlay active: ${artifact.constraints.runtimeOverlayActive ? "yes" : "no"}`,
    `- Production changed: ${artifact.constraints.productionChanged ? "yes" : "no"}`,
    "",
    "| # | entryId | Japanese written form | reading | sense index | original English glosses | machine translated Chinese glosses | translationStatus | reviewStatus | provider | estimated chars | actual chars | generatedAt |",
    "|---:|---|---|---|---:|---|---|---|---|---|---:|---:|---|"
  ];

  let rowNumber = 0;
  for (const entry of artifact.entries) {
    for (const sense of entry.senses) {
      rowNumber += 1;
      lines.push([
        rowNumber,
        markdownCell(entry.entryId),
        markdownCell(entry.japaneseHeadword),
        markdownCell(entry.reading || (entry.readings || []).join("; ")),
        sense.senseIndex,
        markdownCell((sense.originalEnglishGlosses || []).join("; ")),
        markdownCell((sense.machineTranslatedChineseGlosses || []).join("; ")),
        markdownCell(sense.translationStatus),
        markdownCell(sense.reviewStatus),
        markdownCell(sense.provider),
        sense.estimatedChars,
        sense.actualChars,
        markdownCell(sense.generatedAt)
      ].join(" | ").replace(/^/, "| ").replace(/$/, " |"));
    }
  }

  return `${lines.join("\n")}\n`;
}

async function writeReviewArtifact(filePath, artifact) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  if (filePath.endsWith(".json")) {
    await fs.writeFile(filePath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
    return;
  }
  await fs.writeFile(filePath, reviewMarkdown(artifact), "utf8");
}

async function assertSmallArtifact(filePath) {
  const stat = await fs.stat(filePath);
  if (stat.size > MAX_REVIEW_ARTIFACT_BYTES) {
    await fs.rm(filePath, { force: true });
    fail({
      blocked: true,
      reason: "Review artifact exceeded size guardrail and was removed.",
      path: filePath,
      bytes: stat.size,
      maxBytes: MAX_REVIEW_ARTIFACT_BYTES
    });
  }
  return stat.size;
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    usage();
    return;
  }

  const inputPath = arg("--input") || DEFAULT_INPUT;
  const reviewOut = arg("--review-out") || DEFAULT_REVIEW_OUT;
  const ledgerOut = arg("--ledger-out") || DEFAULT_LEDGER_OUT;
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || "";
  const batch = JSON.parse(await fs.readFile(inputPath, "utf8"));
  const guardrails = assertGuardrails(batch, apiKey);
  const items = translationItems(batch.entries || []);

  const translations = [];
  const requestBatches = chunks(items, 100);
  try {
    for (const group of requestBatches) {
      translations.push(...await translateGoogleCloud({
        apiKey,
        texts: group.map((item) => item.text)
      }));
    }
  } catch (error) {
    console.error(sanitizeError(error, [apiKey]));
    process.exit(1);
  }

  const reviewArtifact = buildReviewArtifact({
    batch,
    inputPath,
    items,
    translations,
    guardrails,
    requestCount: requestBatches.length
  });
  await writeReviewArtifact(reviewOut, reviewArtifact);
  const reviewBytes = await assertSmallArtifact(reviewOut);

  const ledger = {
    type: "jmdict-zh-pilot-100-usage-ledger",
    generatedAt: reviewArtifact.generatedAt,
    provider: PROVIDER_NAME,
    targetLanguage: TARGET_LANGUAGE,
    inputPath,
    reviewOut,
    entries: guardrails.entries,
    translatedEntries: reviewArtifact.counts.translatedEntries,
    translatedSenses: reviewArtifact.counts.translatedSenses,
    estimatedChars: guardrails.estimatedChars,
    actualChars: guardrails.estimatedChars,
    maxEntries: REQUIRED_MAX_ENTRIES,
    maxChars: REQUIRED_MAX_CHARS,
    approvalFlag: REQUIRED_APPROVAL,
    providerRequests: requestBatches.map((group, index) => ({
      index: index + 1,
      items: group.length,
      chars: group.reduce((sum, item) => sum + item.chars, 0)
    })),
    runtimeGoogleCalls: false,
    runtimeOverlayActive: false,
    productionChanged: false,
    billingPromptSeen: false,
    reviewArtifactBytes: reviewBytes
  };
  await writeJson(ledgerOut, ledger);

  console.log(JSON.stringify({
    provider: PROVIDER_NAME,
    reviewOut,
    ledgerOut,
    entries: guardrails.entries,
    translatedEntries: reviewArtifact.counts.translatedEntries,
    estimatedChars: guardrails.estimatedChars,
    actualChars: guardrails.estimatedChars,
    reviewArtifactBytes: reviewBytes,
    runtimeGoogleCalls: false,
    billingPromptSeen: false
  }, null, 2));
}

main().catch((error) => {
  console.error(sanitizeError(error, [process.env.GOOGLE_TRANSLATE_API_KEY]));
  process.exit(1);
});
