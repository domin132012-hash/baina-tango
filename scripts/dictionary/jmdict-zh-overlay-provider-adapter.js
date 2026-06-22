#!/usr/bin/env node

import fs from "node:fs/promises";

const DEFAULT_INPUT = "docs/dictionary/zh-overlay-pilot-100/translation-input.json";
const SUPPORTED_PROVIDER_SKELETONS = {
  deepl: {
    requiredEnv: ["DEEPL_API_KEY"],
    targetLanguage: "ZH-HANS",
    note: "Dedicated machine translation provider. Confirm plan, quota, and cost before enabling."
  },
  google_cloud_translate: {
    requiredEnv: ["GOOGLE_CLOUD_TRANSLATE_API_KEY"],
    targetLanguage: "zh-CN",
    note: "Dedicated machine translation provider. Confirm billing project, quota, and cost before enabling."
  }
};

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function usage() {
  console.log(`Usage:
  node scripts/dictionary/jmdict-zh-overlay-provider-adapter.js --input <translation-input.json>

Environment:
  BAINA_ZH_MT_PROVIDER=deepl|google_cloud_translate
  DEEPL_API_KEY=<secret> or GOOGLE_CLOUD_TRANSLATE_API_KEY=<secret>

This is a provider adapter skeleton. It intentionally does not call a
translation provider until a dedicated machine translation provider and
billing/quota guardrail are explicitly configured and approved.
`);
}

function countCharacters(batch) {
  return (batch.entries || []).reduce((sum, entry) => {
    return sum + (entry.senses || []).reduce((senseSum, sense) => {
      return senseSum + (sense.originalEnglishGlosses || []).join("; ").length;
    }, 0);
  }, 0);
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    usage();
    return;
  }

  const inputPath = arg("--input") || DEFAULT_INPUT;
  const providerName = process.env.BAINA_ZH_MT_PROVIDER || arg("--provider") || "";
  const batch = JSON.parse(await fs.readFile(inputPath, "utf8"));
  const provider = SUPPORTED_PROVIDER_SKELETONS[providerName];

  if (!providerName || !provider) {
    console.error(JSON.stringify({
      blocked: true,
      reason: "No dedicated machine translation provider configured.",
      acceptedProviders: Object.keys(SUPPORTED_PROVIDER_SKELETONS),
      requiredEnv: {
        deepl: SUPPORTED_PROVIDER_SKELETONS.deepl.requiredEnv,
        google_cloud_translate: SUPPORTED_PROVIDER_SKELETONS.google_cloud_translate.requiredEnv
      },
      entries: batch.entries?.length || 0,
      estimatedEnglishCharactersToTranslate: countCharacters(batch)
    }, null, 2));
    process.exit(2);
  }

  const missingEnv = provider.requiredEnv.filter((name) => !process.env[name]);
  if (missingEnv.length) {
    console.error(JSON.stringify({
      blocked: true,
      reason: "Provider selected but required secret env vars are missing.",
      provider: providerName,
      missingEnv,
      entries: batch.entries?.length || 0,
      estimatedEnglishCharactersToTranslate: countCharacters(batch)
    }, null, 2));
    process.exit(2);
  }

  console.error(JSON.stringify({
    blocked: true,
    reason: "Provider skeleton is present, but network translation calls are intentionally disabled pending explicit cost approval.",
    provider: providerName,
    requiredEnv: provider.requiredEnv,
    targetLanguage: provider.targetLanguage,
    entries: batch.entries?.length || 0,
    estimatedEnglishCharactersToTranslate: countCharacters(batch)
  }, null, 2));
  process.exit(2);
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
