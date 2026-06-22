#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_INPUT = "docs/dictionary/zh-overlay-pilot-100/translation-input.json";
const DEFAULT_PROMPT = "scripts/dictionary/prompts/jmdict-zh-deepseek-system.md";
const DEFAULT_REVIEW_OUT = "docs/review/jmdict-zh-deepseek-pilot-100-review.md";
const DEFAULT_LEDGER_OUT = "docs/review/jmdict-zh-deepseek-pilot-100-usage-ledger.json";
const DEFAULT_PROBE_REVIEW_OUT = "docs/review/jmdict-zh-deepseek-probe-review.md";
const DEFAULT_PROBE_LEDGER_OUT = "docs/review/jmdict-zh-deepseek-probe-usage-ledger.json";
const DEFAULT_DEBUG_OUT = "docs/review/jmdict-zh-deepseek-last-failure-debug.json";
const PROVIDER_NAME = "deepseek";
const REQUIRED_MODEL = "deepseek-v4-flash";
const REQUIRED_BASE_URL = "https://api.deepseek.com";
const REQUIRED_APPROVAL = "YES_DEEPSEEK_TOP_100_ONLY";
const REQUIRED_MAX_ENTRIES = 100;
const ALLOWED_PROBE_LIMITS = new Set([1, 5]);
const DEFAULT_BATCH_ENTRIES = 20;
const MAX_REVIEW_ARTIFACT_BYTES = 300000;
const REVIEW_STATUS = "ai_generated_unreviewed";
const ESTIMATED_COST_NOTE = "not_estimated_provider_pricing_not_configured";

const ALLOWED_CONFIDENCE = new Set(["high", "medium", "low"]);
const ALLOWED_FLAGS = new Set([
  "none",
  "wrong_sense_risk",
  "specialized",
  "too_rare",
  "archaic",
  "dialect",
  "ambiguous",
  "needs_human_review"
]);

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function usage() {
  console.log(`Usage:
  node scripts/dictionary/jmdict-zh-deepseek-pilot.js --estimate-only
  node scripts/dictionary/jmdict-zh-deepseek-pilot.js --self-test-json-fixtures
  node scripts/dictionary/jmdict-zh-deepseek-pilot.js --probe-provider --probe-limit 1
  node scripts/dictionary/jmdict-zh-deepseek-pilot.js --probe-provider --probe-limit 5
  node scripts/dictionary/jmdict-zh-deepseek-pilot.js --run-provider

Defaults:
  --input ${DEFAULT_INPUT}
  --prompt ${DEFAULT_PROMPT}
  --review-out ${DEFAULT_REVIEW_OUT}
  --ledger-out ${DEFAULT_LEDGER_OUT}
  --debug-out ${DEFAULT_DEBUG_OUT}

Required env for --run-provider or --probe-provider:
  BAINA_ZH_AI_PROVIDER=deepseek
  DEEPSEEK_API_KEY=<secret>
  DEEPSEEK_BASE_URL=https://api.deepseek.com
  DEEPSEEK_MODEL=deepseek-v4-flash
  BAINA_ZH_AI_APPROVE_RUN=YES_DEEPSEEK_TOP_100_ONLY
  BAINA_ZH_AI_MAX_ENTRIES=100
  BAINA_ZH_AI_MAX_INPUT_TOKENS=30000
  BAINA_ZH_AI_MAX_OUTPUT_TOKENS=30000
  BAINA_ZH_AI_MAX_TOTAL_ESTIMATED_TOKENS=60000
  BAINA_ZH_AI_MAX_REQUESTS=100

Without --run-provider or --probe-provider, this script performs no provider call.
Runtime lookup must never import or call this offline batch script.
`);
}

function fail(payload, status = 2) {
  console.error(JSON.stringify(payload, null, 2));
  process.exit(status);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function numberEnv(name) {
  const raw = process.env[name] || "";
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return { raw: raw || "missing", value: 0 };
  }
  return { raw, value };
}

function estimateTokens(text) {
  let asciiChars = 0;
  let nonAsciiChars = 0;
  for (const char of String(text || "")) {
    if (char.charCodeAt(0) <= 0x7f) asciiChars += 1;
    else nonAsciiChars += 1;
  }
  return Math.ceil(asciiChars / 4) + nonAsciiChars;
}

function entryWrittenForm(entry) {
  return entry.headword || entry.seedTerm || entry.entryId || "";
}

function entryForPrompt(entry) {
  return {
    entryId: entry.entryId,
    writtenForm: entryWrittenForm(entry),
    reading: entry.reading || "",
    partOfSpeech: entry.partOfSpeech || [],
    senses: (entry.senses || []).map((sense) => ({
      entryId: sense.entryId || entry.entryId,
      senseIndex: sense.senseIndex,
      partOfSpeech: sense.partOfSpeech || entry.partOfSpeech || [],
      originalEnglishGlosses: sense.originalEnglishGlosses || []
    }))
  };
}

function userPromptForEntries(entries) {
  return JSON.stringify({
    task: "Generate AI-assisted Simplified Chinese learner dictionary gloss candidates for review. Use the supplied JMdict evidence.",
    outputContract: "Return exactly one strict JSON object with a top-level items array. Include exactly one item for every input sense.",
    outputRules: [
      "Output JSON only.",
      "The word json is intentionally present for DeepSeek JSON Output mode.",
      "Do not output Markdown.",
      "Do not wrap the JSON in a ```json code block.",
      "Do not include explanations, prefaces, or afterwords.",
      "The top-level object must be {\"items\":[...]} and must not use another top-level key such as senses.",
      "Prioritize ordinary Japanese learners and EJU learners.",
      "Set shouldDisplay=true only for common learner-useful senses.",
      "Set shouldDisplay=false by default for mahjong, medical, legal, Buddhist, archaic, dialectal, rare-reading, or other specialized senses unless they are common learner-useful senses.",
      "For specialized or rare senses, include suitable issueFlags from specialized, too_rare, archaic, dialect, and needs_human_review.",
      "A correct translation is not enough to set shouldDisplay=true; shouldDisplay means default visibility for ordinary learners, not whether the sense exists."
    ],
    itemSchema: {
      entryId: "string",
      writtenForm: "string",
      reading: "string",
      senseIndex: 1,
      shortGloss: "string",
      zhGlosses: ["string"],
      usageNote: "string",
      shouldDisplay: true,
      confidence: "high|medium|low",
      issueFlags: ["none|wrong_sense_risk|specialized|too_rare|archaic|dialect|ambiguous|needs_human_review"],
      reviewStatus: REVIEW_STATUS,
      provider: PROVIDER_NAME,
      model: REQUIRED_MODEL
    },
    outputExample: {
      items: [
        {
          entryId: "jmdict-example-1",
          writtenForm: "事",
          reading: "こと",
          senseIndex: 1,
          shortGloss: "事情",
          zhGlosses: ["事情", "事项"],
          usageNote: "",
          shouldDisplay: true,
          confidence: "high",
          issueFlags: ["none"],
          reviewStatus: REVIEW_STATUS,
          provider: PROVIDER_NAME,
          model: REQUIRED_MODEL
        },
        {
          entryId: "jmdict-example-2",
          writtenForm: "平和",
          reading: "ピンフ",
          senseIndex: 2,
          shortGloss: "平和牌型",
          zhGlosses: ["平和牌型"],
          usageNote: "麻将术语，普通日语学习默认不展示。",
          shouldDisplay: false,
          confidence: "medium",
          issueFlags: ["specialized", "needs_human_review"],
          reviewStatus: REVIEW_STATUS,
          provider: PROVIDER_NAME,
          model: REQUIRED_MODEL
        }
      ]
    },
    entries: entries.map(entryForPrompt)
  }, null, 2);
}

function chunkEntries(entries, batchSize) {
  const chunks = [];
  for (let index = 0; index < entries.length; index += batchSize) {
    chunks.push(entries.slice(index, index + batchSize));
  }
  return chunks;
}

function expectedSenseKeys(entries) {
  return new Set(entries.flatMap((entry) => {
    return (entry.senses || []).map((sense) => `${entry.entryId}:${sense.senseIndex}`);
  }));
}

function estimateOutputTokens(entries) {
  const senseCount = entries.reduce((sum, entry) => sum + (entry.senses || []).length, 0);
  return (entries.length * 40) + (senseCount * 115);
}

function estimateBatch({ batch, systemPrompt, batchSize = DEFAULT_BATCH_ENTRIES }) {
  const entries = batch.entries || [];
  const groups = chunkEntries(entries, batchSize);
  const requests = groups.map((group, index) => {
    const userPrompt = userPromptForEntries(group);
    const estimatedInputTokens = estimateTokens(`${systemPrompt}\n${userPrompt}`);
    const estimatedOutputTokens = estimateOutputTokens(group);
    return {
      index: index + 1,
      entries: group.length,
      senses: group.reduce((sum, entry) => sum + (entry.senses || []).length, 0),
      estimatedInputTokens,
      estimatedOutputTokens,
      entryIds: group.map((entry) => entry.entryId)
    };
  });
  const estimatedInputTokens = requests.reduce((sum, request) => sum + request.estimatedInputTokens, 0);
  const estimatedOutputTokens = requests.reduce((sum, request) => sum + request.estimatedOutputTokens, 0);
  const estimatedTotalTokens = estimatedInputTokens + estimatedOutputTokens;
  return {
    entries: entries.length,
    senses: entries.reduce((sum, entry) => sum + (entry.senses || []).length, 0),
    requestCount: requests.length,
    batchSize,
    estimatedInputTokens,
    estimatedOutputTokens,
    estimatedTotalTokens,
    estimatedCostUsd: estimateCostUsd(estimatedInputTokens, estimatedOutputTokens),
    requests
  };
}

function estimateCostUsd(inputTokens, outputTokens) {
  void inputTokens;
  void outputTokens;
  return null;
}

function batchWithEntryLimit(batch, limit) {
  return {
    ...batch,
    entries: (batch.entries || []).slice(0, limit)
  };
}

function probeLimitFromArgs() {
  const value = Number(arg("--probe-limit"));
  if (!ALLOWED_PROBE_LIMITS.has(value)) {
    fail({
      blocked: true,
      reason: "Probe limit must be 1 or 5.",
      actual: Number.isFinite(value) ? value : "missing"
    });
  }
  return value;
}

function assertEstimateLimits({ estimate, maxEntries, maxInputTokens, maxOutputTokens, maxTotalTokens, maxRequests }) {
  if (estimate.entries > maxEntries) {
    fail({
      blocked: true,
      reason: "Selected entries exceed BAINA_ZH_AI_MAX_ENTRIES.",
      entries: estimate.entries,
      maxEntries
    });
  }
  if (estimate.estimatedInputTokens > maxInputTokens) {
    fail({
      blocked: true,
      reason: "Estimated input tokens exceed BAINA_ZH_AI_MAX_INPUT_TOKENS.",
      estimatedInputTokens: estimate.estimatedInputTokens,
      maxInputTokens
    });
  }
  if (estimate.estimatedOutputTokens > maxOutputTokens) {
    fail({
      blocked: true,
      reason: "Estimated output tokens exceed BAINA_ZH_AI_MAX_OUTPUT_TOKENS.",
      estimatedOutputTokens: estimate.estimatedOutputTokens,
      maxOutputTokens
    });
  }
  if (estimate.estimatedTotalTokens > maxTotalTokens) {
    fail({
      blocked: true,
      reason: "Estimated total tokens exceed BAINA_ZH_AI_MAX_TOTAL_ESTIMATED_TOKENS.",
      estimatedTotalTokens: estimate.estimatedTotalTokens,
      maxTotalTokens
    });
  }
  if (estimate.requestCount > maxRequests) {
    fail({
      blocked: true,
      reason: "Request count exceeds BAINA_ZH_AI_MAX_REQUESTS.",
      requestCount: estimate.requestCount,
      maxRequests
    });
  }
}

function runConfigFromEnv() {
  return {
    provider: process.env.BAINA_ZH_AI_PROVIDER || "",
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseUrl: process.env.DEEPSEEK_BASE_URL || "",
    model: process.env.DEEPSEEK_MODEL || "",
    approvalFlag: process.env.BAINA_ZH_AI_APPROVE_RUN || "",
    maxEntries: numberEnv("BAINA_ZH_AI_MAX_ENTRIES"),
    maxInputTokens: numberEnv("BAINA_ZH_AI_MAX_INPUT_TOKENS"),
    maxOutputTokens: numberEnv("BAINA_ZH_AI_MAX_OUTPUT_TOKENS"),
    maxTotalTokens: numberEnv("BAINA_ZH_AI_MAX_TOTAL_ESTIMATED_TOKENS"),
    maxRequests: numberEnv("BAINA_ZH_AI_MAX_REQUESTS")
  };
}

function assertRunGuardrails({ config, estimate }) {
  if (config.provider !== PROVIDER_NAME) {
    fail({
      blocked: true,
      reason: "AI provider guardrail missing or incorrect.",
      required: { BAINA_ZH_AI_PROVIDER: PROVIDER_NAME },
      actual: { BAINA_ZH_AI_PROVIDER: config.provider || "missing" }
    });
  }
  if (config.model !== REQUIRED_MODEL) {
    fail({
      blocked: true,
      reason: "DeepSeek model guardrail missing or incorrect.",
      required: { DEEPSEEK_MODEL: REQUIRED_MODEL },
      actual: { DEEPSEEK_MODEL: config.model || "missing" }
    });
  }
  if (config.approvalFlag !== REQUIRED_APPROVAL) {
    fail({
      blocked: true,
      reason: "Approval flag missing or incorrect.",
      required: { BAINA_ZH_AI_APPROVE_RUN: REQUIRED_APPROVAL },
      actual: { BAINA_ZH_AI_APPROVE_RUN: config.approvalFlag || "missing" }
    });
  }
  assertEstimateLimits({
    estimate,
    maxEntries: config.maxEntries.value,
    maxInputTokens: config.maxInputTokens.value,
    maxOutputTokens: config.maxOutputTokens.value,
    maxTotalTokens: config.maxTotalTokens.value,
    maxRequests: config.maxRequests.value
  });
  if (!config.apiKey) {
    fail({
      blocked: true,
      reason: "DEEPSEEK_API_KEY is missing.",
      DEEPSEEK_API_KEY_length: 0,
      entries: estimate.entries,
      estimatedInputTokens: estimate.estimatedInputTokens,
      estimatedOutputTokens: estimate.estimatedOutputTokens,
      estimatedTotalTokens: estimate.estimatedTotalTokens,
      requestCount: estimate.requestCount
    });
  }
  if (!config.baseUrl) {
    fail({
      blocked: true,
      reason: "DEEPSEEK_BASE_URL is missing.",
      DEEPSEEK_API_KEY_length: config.apiKey.length
    });
  }
  if (config.baseUrl !== REQUIRED_BASE_URL) {
    fail({
      blocked: true,
      reason: "DeepSeek base URL guardrail missing or incorrect.",
      required: { DEEPSEEK_BASE_URL: REQUIRED_BASE_URL },
      actual: { DEEPSEEK_BASE_URL: config.baseUrl || "missing" },
      DEEPSEEK_API_KEY_length: config.apiKey.length
    });
  }
  return { keyLength: config.apiKey.length };
}

function sanitizeError(error, secrets) {
  let message = error?.stack || error?.message || String(error);
  for (const secret of secrets.filter(Boolean)) {
    message = message.split(secret).join("[REDACTED]");
  }
  return message;
}

function chatCompletionsUrl(baseUrl) {
  const normalized = String(baseUrl || "").replace(/\/+$/, "");
  return `${normalized}/chat/completions`;
}

function providerMessageParts(data) {
  const choice = data?.choices?.[0] || {};
  const message = choice?.message || {};
  const content = typeof message.content === "string" ? message.content : "";
  const reasoningContent = typeof message.reasoning_content === "string" ? message.reasoning_content : "";
  return { choice, message, content, reasoningContent };
}

async function writeProviderFailureDebug(filePath, {
  config,
  requestCount,
  batchSize,
  choice,
  content,
  parseErrorMessage,
  usage,
  reasoningContent
}) {
  if (!filePath) return;
  const trimmed = String(content || "").trim();
  await writeJson(filePath, {
    timestamp: new Date().toISOString(),
    provider: PROVIDER_NAME,
    model: config?.model || REQUIRED_MODEL,
    requestCount,
    batchSize,
    finish_reason: choice?.finish_reason ?? null,
    responseContentLength: String(content || "").length,
    responseContentFirst500: String(content || "").slice(0, 500),
    responseContentLast500: String(content || "").slice(-500),
    responseContentStartsWithBrace: trimmed.startsWith("{"),
    responseContentEndsWithBrace: trimmed.endsWith("}"),
    parseErrorMessage,
    usageTokens: {
      promptTokens: usage?.prompt_tokens ?? null,
      completionTokens: usage?.completion_tokens ?? null,
      totalTokens: usage?.total_tokens ?? null
    },
    hasReasoningContent: Boolean(reasoningContent),
    reasoningContentLength: String(reasoningContent || "").length
  });
}

async function callDeepSeek({ config, systemPrompt, entries, maxTokens, debugOut, requestCount, batchSize }) {
  const requestBody = {
    model: config.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPromptForEntries(entries) }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: maxTokens,
    stream: false,
    // DeepSeek v4 thinking mode is enabled by default; dictionary JSON generation
    // uses non-thinking mode to reduce strict JSON failures.
    thinking: { type: "disabled" }
  };
  const response = await fetch(chatCompletionsUrl(config.baseUrl), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  const responseText = await response.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(`DeepSeek returned non-JSON HTTP response: HTTP ${response.status}`);
  }
  if (!response.ok) {
    const reason = data?.error?.message || `HTTP ${response.status}`;
    throw new Error(`DeepSeek request failed: ${reason}`);
  }
  const { choice, content, reasoningContent } = providerMessageParts(data);
  let parsed = {};
  try {
    parsed = parseProviderMessageContent(content);
  } catch (error) {
    await writeProviderFailureDebug(debugOut, {
      config,
      requestCount,
      batchSize,
      choice,
      content,
      parseErrorMessage: error?.message || String(error),
      usage: data?.usage,
      reasoningContent
    });
    throw error;
  }
  return {
    parsed,
    usage: {
      promptTokens: data?.usage?.prompt_tokens ?? null,
      completionTokens: data?.usage?.completion_tokens ?? null,
      totalTokens: data?.usage?.total_tokens ?? null
    }
  };
}

function parseProviderMessageContent(content) {
  const value = String(content || "");
  if (!value) {
    throw new Error("empty_content: DeepSeek response message content was empty.");
  }
  try {
    return JSON.parse(value);
  } catch {
    const trimmed = value.trim();
    const structure = jsonStructureState(trimmed);
    const prefix = trimmed.startsWith("{") && structure.possiblyTruncated ? "possible_truncation: " : "";
    throw new Error(`${prefix}DeepSeek message content was not strict JSON.`);
  }
}

function jsonStructureState(value) {
  let objectDepth = 0;
  let arrayDepth = 0;
  let inString = false;
  let escaped = false;
  for (const char of value) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inString && char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "{") objectDepth += 1;
    else if (char === "}") objectDepth -= 1;
    else if (char === "[") arrayDepth += 1;
    else if (char === "]") arrayDepth -= 1;
  }
  return {
    possiblyTruncated: inString || objectDepth > 0 || arrayDepth > 0
  };
}

function validateSenseOutput(value, expectedKeys) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return ["Sense output must be an object."];
  }
  const requiredStringFields = [
    "entryId",
    "writtenForm",
    "reading",
    "shortGloss",
    "usageNote",
    "reviewStatus",
    "provider",
    "model"
  ];
  for (const field of requiredStringFields) {
    if (typeof value[field] !== "string") errors.push(`${field} must be a string.`);
  }
  if (!Number.isInteger(value.senseIndex) || value.senseIndex <= 0) {
    errors.push("senseIndex must be a positive integer.");
  }
  if (!Array.isArray(value.zhGlosses) || value.zhGlosses.length < 1 || value.zhGlosses.length > 3) {
    errors.push("zhGlosses must contain one to three strings.");
  } else if (value.zhGlosses.some((item) => typeof item !== "string" || !item.trim())) {
    errors.push("zhGlosses must contain non-empty strings.");
  }
  if (typeof value.shouldDisplay !== "boolean") {
    errors.push("shouldDisplay must be a boolean.");
  }
  if (!ALLOWED_CONFIDENCE.has(value.confidence)) {
    errors.push("confidence must be high, medium, or low.");
  }
  if (!Array.isArray(value.issueFlags) || value.issueFlags.length < 1) {
    errors.push("issueFlags must be a non-empty array.");
  } else {
    for (const flag of value.issueFlags) {
      if (!ALLOWED_FLAGS.has(flag)) errors.push(`issueFlags includes invalid value ${flag}.`);
    }
    if (value.issueFlags.length > 1 && value.issueFlags.includes("none")) {
      errors.push("issueFlags must not mix none with other flags.");
    }
  }
  if (value.reviewStatus !== REVIEW_STATUS) {
    errors.push(`reviewStatus must be ${REVIEW_STATUS}.`);
  }
  if (value.provider !== PROVIDER_NAME) {
    errors.push(`provider must be ${PROVIDER_NAME}.`);
  }
  if (value.model !== REQUIRED_MODEL) {
    errors.push(`model must be ${REQUIRED_MODEL}.`);
  }
  const key = `${value.entryId}:${value.senseIndex}`;
  if (!expectedKeys.has(key)) {
    errors.push(`Output sense ${key} is not present in input batch.`);
  }
  return errors;
}

function validateProviderOutput(parsed, entries) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Provider output must be a JSON object.");
  }
  if (!Array.isArray(parsed.items)) {
    throw new Error("Provider output must include an items array.");
  }
  const expectedKeys = expectedSenseKeys(entries);
  const seenKeys = new Set();
  const errors = [];
  if (parsed.items.length !== expectedKeys.size) {
    errors.push(`Provider output item count ${parsed.items.length} does not match expected sense count ${expectedKeys.size}.`);
  }
  for (const sense of parsed.items) {
    const senseErrors = validateSenseOutput(sense, expectedKeys);
    const key = `${sense?.entryId}:${sense?.senseIndex}`;
    if (seenKeys.has(key)) senseErrors.push(`Duplicate output sense ${key}.`);
    seenKeys.add(key);
    errors.push(...senseErrors.map((error) => `${key}: ${error}`));
  }
  for (const key of expectedKeys) {
    if (!seenKeys.has(key)) errors.push(`Missing output sense ${key}.`);
  }
  if (errors.length) {
    throw new Error(`Provider output schema validation failed:\n${errors.join("\n")}`);
  }
  return parsed.items;
}

function fixtureEntries() {
  return [
    {
      entryId: "jmdict-fixture-1",
      seedTerm: "事",
      headword: "事",
      reading: "こと",
      senses: [
        {
          senseIndex: 1,
          originalEnglishGlosses: ["thing", "matter"]
        },
        {
          senseIndex: 2,
          originalEnglishGlosses: ["incident", "event"]
        }
      ]
    }
  ];
}

function validFixtureOutput() {
  return {
    items: [
      {
        entryId: "jmdict-fixture-1",
        writtenForm: "事",
        reading: "こと",
        senseIndex: 1,
        shortGloss: "事情",
        zhGlosses: ["事情", "事项"],
        usageNote: "",
        shouldDisplay: true,
        confidence: "high",
        issueFlags: ["none"],
        reviewStatus: REVIEW_STATUS,
        provider: PROVIDER_NAME,
        model: REQUIRED_MODEL
      },
      {
        entryId: "jmdict-fixture-1",
        writtenForm: "事",
        reading: "こと",
        senseIndex: 2,
        shortGloss: "事件",
        zhGlosses: ["事件"],
        usageNote: "",
        shouldDisplay: true,
        confidence: "medium",
        issueFlags: ["none"],
        reviewStatus: REVIEW_STATUS,
        provider: PROVIDER_NAME,
        model: REQUIRED_MODEL
      }
    ]
  };
}

function assertFixture(name, shouldPass, content, options = {}) {
  const entries = fixtureEntries();
  let passed = false;
  let reason = "";
  try {
    validateProviderOutput(parseProviderMessageContent(content), entries);
    passed = true;
  } catch (error) {
    reason = error?.message || String(error);
  }
  if (passed !== shouldPass) {
    throw new Error(`Fixture ${name} expected ${shouldPass ? "pass" : "fail"} but ${passed ? "passed" : `failed: ${reason}`}`);
  }
  if (!passed && options.reasonIncludes && !reason.includes(options.reasonIncludes)) {
    throw new Error(`Fixture ${name} failed without expected reason ${options.reasonIncludes}: ${reason}`);
  }
  return { name, passed: true };
}

function assertResponseFixture(name, shouldPass, data, options = {}) {
  const { content } = providerMessageParts(data);
  return assertFixture(name, shouldPass, content, options);
}

function runJsonFixtureSelfTests() {
  const valid = validFixtureOutput();
  const fixtures = [
    {
      name: "valid_strict_json_object",
      shouldPass: true,
      content: JSON.stringify(valid)
    },
    {
      name: "markdown_json_code_block",
      shouldPass: false,
      content: `\`\`\`json\n${JSON.stringify(valid)}\n\`\`\``
    },
    {
      name: "empty_content",
      shouldPass: false,
      content: "",
      reasonIncludes: "empty_content"
    },
    {
      name: "json_array_without_items",
      shouldPass: false,
      content: JSON.stringify(valid.items)
    },
    {
      name: "json_object_without_items",
      shouldPass: false,
      content: JSON.stringify({ senses: valid.items })
    },
    {
      name: "json_with_trailing_explanation",
      shouldPass: false,
      content: `${JSON.stringify(valid)}\nHere is the result.`
    },
    {
      name: "truncated_content",
      shouldPass: false,
      content: JSON.stringify(valid).slice(0, -2),
      reasonIncludes: "possible_truncation"
    },
    {
      name: "item_count_mismatch",
      shouldPass: false,
      content: JSON.stringify({ items: valid.items.slice(0, 1) })
    },
    {
      name: "missing_entryId",
      shouldPass: false,
      content: JSON.stringify({ items: valid.items.map((item, index) => index === 0 ? Object.fromEntries(Object.entries(item).filter(([key]) => key !== "entryId")) : item) })
    },
    {
      name: "missing_senseIndex",
      shouldPass: false,
      content: JSON.stringify({ items: valid.items.map((item, index) => index === 0 ? Object.fromEntries(Object.entries(item).filter(([key]) => key !== "senseIndex")) : item) })
    },
    {
      name: "entryId_mismatch",
      shouldPass: false,
      content: JSON.stringify({ items: valid.items.map((item, index) => index === 0 ? { ...item, entryId: "wrong-entry" } : item) })
    },
    {
      name: "senseIndex_mismatch",
      shouldPass: false,
      content: JSON.stringify({ items: valid.items.map((item, index) => index === 0 ? { ...item, senseIndex: 99 } : item) })
    },
    {
      name: "invalid_confidence",
      shouldPass: false,
      content: JSON.stringify({ items: valid.items.map((item, index) => index === 0 ? { ...item, confidence: "certain" } : item) })
    },
    {
      name: "issueFlags_not_array",
      shouldPass: false,
      content: JSON.stringify({ items: valid.items.map((item, index) => index === 0 ? { ...item, issueFlags: "none" } : item) })
    },
    {
      name: "specialized_flag_allowed",
      shouldPass: true,
      content: JSON.stringify({
        items: valid.items.map((item, index) => index === 1 ? {
          ...item,
          shouldDisplay: false,
          confidence: "medium",
          issueFlags: ["specialized", "needs_human_review"]
        } : item)
      })
    },
    {
      name: "response_reasoning_content_ignored_when_content_is_json",
      shouldPass: true,
      response: {
        choices: [
          {
            message: {
              content: JSON.stringify(valid),
              reasoning_content: "This reasoning text must not be parsed as the result."
            }
          }
        ]
      }
    },
    {
      name: "response_reasoning_content_without_content",
      shouldPass: false,
      response: {
        choices: [
          {
            message: {
              content: "",
              reasoning_content: JSON.stringify(valid)
            }
          }
        ]
      },
      reasonIncludes: "empty_content"
    }
  ];
  const results = fixtures.map((fixture) => {
    if (fixture.response) return assertResponseFixture(fixture.name, fixture.shouldPass, fixture.response, fixture);
    return assertFixture(fixture.name, fixture.shouldPass, fixture.content, fixture);
  });
  console.log(JSON.stringify({
    mode: "json_fixture_self_test_no_provider_call",
    tests: results.length,
    passed: results.length,
    deepseekApiCalled: false,
    runtimeAiCalls: false,
    r2D1Writes: false,
    productionChanged: false
  }, null, 2));
}

function indexEnglishSenses(entries) {
  const byKey = new Map();
  for (const entry of entries) {
    for (const sense of entry.senses || []) {
      byKey.set(`${entry.entryId}:${sense.senseIndex}`, {
        entry,
        sense,
        originalEnglishGlosses: sense.originalEnglishGlosses || []
      });
    }
  }
  return byKey;
}

function markdownCell(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|");
}

function buildReviewArtifact({ batch, inputPath, aiSenses, estimate, actualUsage }) {
  const generatedAt = new Date().toISOString();
  const byKey = indexEnglishSenses(batch.entries || []);
  const outputByKey = new Map(aiSenses.map((sense) => [`${sense.entryId}:${sense.senseIndex}`, sense]));
  const entries = (batch.entries || []).map((entry) => {
    const senses = (entry.senses || []).map((sense) => {
      const output = outputByKey.get(`${entry.entryId}:${sense.senseIndex}`);
      return {
        senseIndex: sense.senseIndex,
        senseId: sense.senseId,
        originalEnglishGlosses: sense.originalEnglishGlosses || [],
        shortGloss: output?.shortGloss || "",
        zhGlosses: output?.zhGlosses || [],
        usageNote: output?.usageNote || "",
        shouldDisplay: output?.shouldDisplay ?? false,
        confidence: output?.confidence || "low",
        issueFlags: output?.issueFlags || ["needs_human_review"],
        reviewStatus: REVIEW_STATUS,
        provider: PROVIDER_NAME,
        model: REQUIRED_MODEL,
        generatedAt
      };
    });
    return {
      entryId: entry.entryId,
      seedTerm: entry.seedTerm,
      japaneseHeadword: entryWrittenForm(entry),
      reading: entry.reading || "",
      readings: entry.readings || [],
      senses
    };
  });
  return {
    type: "jmdict-zh-deepseek-pilot-100-review",
    phase: "AI_review_artifact_only",
    overlayVersion: batch.overlayVersion,
    provider: PROVIDER_NAME,
    model: REQUIRED_MODEL,
    reviewStatus: REVIEW_STATUS,
    generatedAt,
    sourceInput: inputPath,
    constraints: {
      runtimeAiCalls: false,
      runtimeOverlayActive: false,
      productionChanged: false,
      r2D1Writes: false
    },
    counts: {
      selectedEntries: entries.length,
      generatedEntries: entries.filter((entry) => entry.senses.some((sense) => sense.zhGlosses.length)).length,
      generatedSenses: aiSenses.length,
      estimatedInputTokens: estimate.estimatedInputTokens,
      estimatedOutputTokens: estimate.estimatedOutputTokens,
      estimatedTotalTokens: estimate.estimatedTotalTokens,
      actualInputTokens: actualUsage.promptTokens,
      actualOutputTokens: actualUsage.completionTokens,
      requestCount: estimate.requestCount
    },
    entries,
    _byKeySize: byKey.size
  };
}

function reviewMarkdown(artifact) {
  const title = artifact.counts.selectedEntries < REQUIRED_MAX_ENTRIES
    ? "JMdict DeepSeek Chinese Probe Review"
    : "JMdict DeepSeek Chinese Pilot 100 Review";
  const lines = [
    `# ${title}`,
    "",
    `- Phase: ${artifact.phase}`,
    `- Provider: ${artifact.provider}`,
    `- Model: ${artifact.model}`,
    `- Review status: ${artifact.reviewStatus}`,
    `- Generated at: ${artifact.generatedAt}`,
    `- Source input: ${artifact.sourceInput}`,
    `- Selected entries: ${artifact.counts.selectedEntries}`,
    `- Generated entries: ${artifact.counts.generatedEntries}`,
    `- Generated senses: ${artifact.counts.generatedSenses}`,
    `- Estimated input tokens: ${artifact.counts.estimatedInputTokens}`,
    `- Estimated output tokens: ${artifact.counts.estimatedOutputTokens}`,
    `- Estimated total tokens: ${artifact.counts.estimatedTotalTokens}`,
    `- Actual input tokens: ${artifact.counts.actualInputTokens ?? "unknown"}`,
    `- Actual output tokens: ${artifact.counts.actualOutputTokens ?? "unknown"}`,
    `- Runtime AI calls: ${artifact.constraints.runtimeAiCalls ? "yes" : "no"}`,
    `- Runtime overlay active: ${artifact.constraints.runtimeOverlayActive ? "yes" : "no"}`,
    `- R2/D1 writes: ${artifact.constraints.r2D1Writes ? "yes" : "no"}`,
    `- Production changed: ${artifact.constraints.productionChanged ? "yes" : "no"}`,
    "",
    "| # | entryId | Japanese written form | reading | sense index | original English glosses | shortGloss | zhGlosses | usageNote | shouldDisplay | confidence | issueFlags | reviewStatus | provider | model | generatedAt |",
    "|---:|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|---|"
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
        markdownCell(sense.shortGloss),
        markdownCell((sense.zhGlosses || []).join("; ")),
        markdownCell(sense.usageNote),
        sense.shouldDisplay ? "true" : "false",
        markdownCell(sense.confidence),
        markdownCell((sense.issueFlags || []).join("; ")),
        markdownCell(sense.reviewStatus),
        markdownCell(sense.provider),
        markdownCell(sense.model),
        markdownCell(sense.generatedAt)
      ].join(" | ").replace(/^/, "| ").replace(/$/, " |"));
    }
  }
  return `${lines.join("\n")}\n`;
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeReviewArtifact(filePath, artifact) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  if (filePath.endsWith(".json")) {
    await writeJson(filePath, artifact);
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

async function writeUsageLedger(filePath, value) {
  const type = value.estimate.entries < REQUIRED_MAX_ENTRIES
    ? "jmdict-zh-deepseek-probe-usage-ledger"
    : "jmdict-zh-deepseek-pilot-100-usage-ledger";
  const ledger = {
    type,
    generatedAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    provider: PROVIDER_NAME,
    model: REQUIRED_MODEL,
    entriesRequested: value.estimate.entries,
    selectedEntries: value.estimate.entries,
    sensesRequested: value.estimate.senses,
    generatedEntries: value.reviewArtifact?.counts?.generatedEntries ?? null,
    generatedSenses: value.reviewArtifact?.counts?.generatedSenses ?? null,
    estimatedInputTokens: value.estimate.estimatedInputTokens,
    estimatedOutputTokens: value.estimate.estimatedOutputTokens,
    estimatedTotalTokens: value.estimate.estimatedTotalTokens,
    actualInputTokens: value.actualUsage?.promptTokens ?? null,
    actualOutputTokens: value.actualUsage?.completionTokens ?? null,
    actualTotalTokens: value.actualUsage?.totalTokens ?? null,
    estimatedCostUsd: value.estimate.estimatedCostUsd,
    estimatedCostNote: ESTIMATED_COST_NOTE,
    actualCostUsd: null,
    actualCostNote: ESTIMATED_COST_NOTE,
    requestCount: value.estimate.requestCount,
    providerRequests: value.estimate.requests.map((request) => ({
      index: request.index,
      entries: request.entries,
      senses: request.senses,
      estimatedInputTokens: request.estimatedInputTokens,
      estimatedOutputTokens: request.estimatedOutputTokens
    })),
    providerCalled: Boolean(value.providerCalled),
    providerRunStatus: value.providerCalled ? "succeeded" : "not_run",
    failedRequestCount: 0,
    runtimeAiCalls: false,
    r2D1Writes: false,
    productionChanged: false,
    billingPromptSeen: false
  };
  await writeJson(filePath, ledger);
}

async function runProvider({ batch, inputPath, systemPrompt, estimate, config, reviewOut, ledgerOut, debugOut }) {
  const guard = assertRunGuardrails({ config, estimate });
  console.log(`DEEPSEEK_API_KEY_length=${guard.keyLength}`);

  const aiSenses = [];
  const actualUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  const groups = chunkEntries(batch.entries || [], estimate.batchSize);
  for (const group of groups) {
    const estimatedGroupOutput = estimateOutputTokens(group);
    const result = await callDeepSeek({
      config,
      systemPrompt,
      entries: group,
      maxTokens: Math.min(8192, Math.max(1000, estimatedGroupOutput + 1000)),
      debugOut,
      requestCount: estimate.requestCount,
      batchSize: group.length
    });
    aiSenses.push(...validateProviderOutput(result.parsed, group));
    actualUsage.promptTokens += result.usage.promptTokens || 0;
    actualUsage.completionTokens += result.usage.completionTokens || 0;
    actualUsage.totalTokens += result.usage.totalTokens || 0;
  }

  validateProviderOutput({ items: aiSenses }, batch.entries || []);

  const reviewArtifact = buildReviewArtifact({
    batch,
    inputPath,
    aiSenses,
    estimate,
    actualUsage
  });
  delete reviewArtifact._byKeySize;
  await writeReviewArtifact(reviewOut, reviewArtifact);
  const reviewBytes = await assertSmallArtifact(reviewOut);
  await writeUsageLedger(ledgerOut, { estimate, actualUsage, providerCalled: true, reviewArtifact });

  console.log(JSON.stringify({
    provider: PROVIDER_NAME,
    model: REQUIRED_MODEL,
    reviewOut,
    ledgerOut,
    translatedEntries: reviewArtifact.counts.generatedEntries,
    translatedSenses: reviewArtifact.counts.generatedSenses,
    estimatedInputTokens: estimate.estimatedInputTokens,
    estimatedOutputTokens: estimate.estimatedOutputTokens,
    estimatedTotalTokens: estimate.estimatedTotalTokens,
    actualInputTokens: actualUsage.promptTokens,
    actualOutputTokens: actualUsage.completionTokens,
    requestCount: estimate.requestCount,
    reviewArtifactBytes: reviewBytes,
    runtimeAiCalls: false,
    r2D1Writes: false,
    productionChanged: false,
    billingPromptSeen: false
  }, null, 2));
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    usage();
    return;
  }

  if (hasFlag("--self-test-json-fixtures")) {
    runJsonFixtureSelfTests();
    return;
  }

  const inputPath = arg("--input") || DEFAULT_INPUT;
  const promptPath = arg("--prompt") || DEFAULT_PROMPT;
  const probeProvider = hasFlag("--probe-provider");
  const fullProvider = hasFlag("--run-provider");
  if (probeProvider && fullProvider) {
    fail({
      blocked: true,
      reason: "Use either --probe-provider or --run-provider, not both."
    });
  }
  const reviewOut = arg("--review-out") || (probeProvider ? DEFAULT_PROBE_REVIEW_OUT : DEFAULT_REVIEW_OUT);
  const ledgerOut = arg("--ledger-out") || (probeProvider ? DEFAULT_PROBE_LEDGER_OUT : DEFAULT_LEDGER_OUT);
  const debugOut = arg("--debug-out") || DEFAULT_DEBUG_OUT;
  const batch = await readJson(inputPath);
  const systemPrompt = await fs.readFile(promptPath, "utf8");
  const effectiveBatch = probeProvider ? batchWithEntryLimit(batch, probeLimitFromArgs()) : batch;
  const estimate = estimateBatch({ batch: effectiveBatch, systemPrompt });

  if (hasFlag("--estimate-only") || (!fullProvider && !probeProvider)) {
    console.log(JSON.stringify({
      provider: PROVIDER_NAME,
      model: REQUIRED_MODEL,
      mode: probeProvider ? "probe_estimate_only_no_provider_call" : "estimate_only_no_provider_call",
      inputPath,
      promptPath,
      reviewOut,
      ledgerOut,
      debugOut,
      entries: estimate.entries,
      senses: estimate.senses,
      requestCount: estimate.requestCount,
      estimatedInputTokens: estimate.estimatedInputTokens,
      estimatedOutputTokens: estimate.estimatedOutputTokens,
      estimatedTotalTokens: estimate.estimatedTotalTokens,
      estimatedCostUsd: estimate.estimatedCostUsd,
      estimatedCostNote: ESTIMATED_COST_NOTE,
      deepseekApiCalled: false,
      runtimeAiCalls: false,
      r2D1Writes: false,
      productionChanged: false
    }, null, 2));
    return;
  }

  const config = runConfigFromEnv();
  try {
    await runProvider({
      batch: effectiveBatch,
      inputPath,
      systemPrompt,
      estimate,
      config,
      reviewOut,
      ledgerOut,
      debugOut
    });
  } catch (error) {
    console.error(sanitizeError(error, [config.apiKey]));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(sanitizeError(error, [process.env.DEEPSEEK_API_KEY]));
  process.exit(1);
});
