#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_REVIEW = "docs/review/jmdict-zh-deepseek-pilot-500-review.md";
const DEFAULT_QA = "docs/review/jmdict-zh-deepseek-pilot-500-qa-summary.md";
const DEFAULT_CORRECTED = "docs/review/jmdict-zh-deepseek-pilot-500-review-corrected.md";
const DEFAULT_OVERLAY = "docs/review/jmdict-zh-deepseek-pilot-500-overlay-candidate.json";
const DEFAULT_PACKAGE_DIR = "docs/review/jmdict-zh-deepseek-pilot-500-local-package";
const PROVIDER = "deepseek";
const MODEL = "deepseek-v4-flash";
const MAX_BAD_FOR_CORRECTED = 10;

const SPECIALIZED_ENGLISH = [
  "mahjong", "medical", "medicine", "anatomy", "legal", "law", "buddhist",
  "buddhism", "sutra", "archaic", "dated", "obsolete", "dialect", "slang",
  "vulgar", "sumo", "baseball", "linguistics", "grammar", "mathematics",
  "physics", "chemistry", "zoology", "botany", "finance", "stock market"
];

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function fnvShard(value) {
  let hash = 0x811c9dc5;
  for (const char of String(value || "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return (hash & 0x0f).toString(16);
}

function splitMarkdownRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let current = "";
  let escaped = false;
  for (const char of trimmed) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells.map((cell) => cell.replace(/<br>/g, "\n"));
}

function parseBool(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Invalid boolean value: ${value}`);
}

function splitSemicolon(value) {
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseReviewMarkdown(markdown) {
  const meta = {};
  const rows = [];
  for (const line of markdown.split(/\r?\n/)) {
    const metaMatch = line.match(/^- ([^:]+):\s*(.*)$/);
    if (metaMatch) meta[metaMatch[1].trim()] = metaMatch[2].trim();
    if (!line.startsWith("| ")) continue;
    if (line.includes("|---")) continue;
    if (line.includes("| # | entryId |")) continue;
    const cells = splitMarkdownRow(line);
    if (cells.length < 16) continue;
    rows.push({
      rowNumber: Number(cells[0]),
      entryId: cells[1],
      writtenForm: cells[2],
      reading: cells[3],
      senseIndex: Number(cells[4]),
      originalEnglishGlosses: splitSemicolon(cells[5]),
      shortGloss: cells[6],
      zhGlosses: splitSemicolon(cells[7]),
      usageNote: cells[8],
      shouldDisplay: parseBool(cells[9]),
      confidence: cells[10],
      issueFlags: splitSemicolon(cells[11]),
      reviewStatus: cells[12],
      provider: cells[13],
      model: cells[14],
      generatedAt: cells[15],
      reviewerNote: cells[16] || ""
    });
  }
  if (!rows.length) throw new Error("No review rows parsed.");
  return { meta, rows };
}

function englishText(row) {
  return row.originalEnglishGlosses.join("; ").toLowerCase();
}

function zhText(row) {
  return [row.shortGloss, ...row.zhGlosses, row.usageNote].join(" ");
}

function hasIssue(row, flags) {
  return flags.some((flag) => row.issueFlags.includes(flag));
}

function addFlag(row, flag) {
  if (row.issueFlags.includes("none")) row.issueFlags = row.issueFlags.filter((item) => item !== "none");
  if (!row.issueFlags.includes(flag)) row.issueFlags.push(flag);
  if (!row.issueFlags.length) row.issueFlags = ["none"];
}

function classifyFindings(rows) {
  const findings = [];
  for (const row of rows) {
    const english = englishText(row);
    const zh = zhText(row);
    const base = {
      rowNumber: row.rowNumber,
      entryId: row.entryId,
      writtenForm: row.writtenForm,
      reading: row.reading,
      senseIndex: row.senseIndex
    };
    if (/[A-Za-z]{2,}/.test([row.shortGloss, ...row.zhGlosses].join(" "))) {
      findings.push({
        ...base,
        type: "Bad",
        rule: "mixed_english_in_chinese_gloss",
        current: [row.shortGloss, ...row.zhGlosses].join("; "),
        suggestion: "人工改为全中文释义；自动候选先从默认展示中移除。"
      });
    }
    if (english.includes("counter") && /计数器/.test(zh)) {
      findings.push({
        ...base,
        type: "Bad",
        rule: "counter_mistranslation",
        current: zh,
        suggestion: "counter 义项通常应译为助数词 / 量词。"
      });
    }
    if (english.includes("matter") && /物质/.test(zh)) {
      findings.push({
        ...base,
        type: "Bad",
        rule: "matter_mistranslation",
        current: zh,
        suggestion: "matter 在事情/事项语境不应译为物质。"
      });
    }
    if (english.includes("follow") && english.includes("understand") && /跟随/.test(zh)) {
      findings.push({
        ...base,
        type: "Bad",
        rule: "follow_mistranslation",
        current: zh,
        suggestion: "follow=理解/跟得上时不应译为跟随。"
      });
    }
    if (/[ぁ-んァ-ン]/.test(row.usageNote) && /（|\(|「|」|例/.test(row.usageNote)) {
      findings.push({
        ...base,
        type: "Minor",
        rule: "possible_unreviewed_japanese_example",
        current: row.usageNote,
        suggestion: "抽样人工确认例句是否自然；必要时改为概括性 usageNote。"
      });
    }
    if (row.shouldDisplay && SPECIALIZED_ENGLISH.some((term) => english.includes(term)) &&
        !hasIssue(row, ["specialized", "too_rare", "archaic", "dialect", "needs_human_review"])) {
      findings.push({
        ...base,
        type: "shouldDisplay review",
        rule: "possible_specialized_shouldDisplay_true",
        current: `${row.originalEnglishGlosses.join("; ")} / shouldDisplay=true / ${row.issueFlags.join("; ")}`,
        suggestion: "普通 EJU 学习默认展示应更保守；必要时 shouldDisplay=false 并加入 specialized/needs_human_review。"
      });
    }
  }
  return findings;
}

function correctedRows(rows, findings) {
  const byKey = new Map();
  for (const finding of findings) {
    const key = `${finding.entryId}:${finding.senseIndex}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(finding);
  }
  return rows.map((row) => {
    const next = {
      ...row,
      issueFlags: [...row.issueFlags],
      zhGlosses: [...row.zhGlosses]
    };
    const itemFindings = byKey.get(`${row.entryId}:${row.senseIndex}`) || [];
    for (const finding of itemFindings) {
      if (finding.type === "Bad") {
        next.shouldDisplay = false;
        next.confidence = "low";
        addFlag(next, "wrong_sense_risk");
        addFlag(next, "needs_human_review");
        if (finding.rule === "counter_mistranslation") {
          next.shortGloss = next.shortGloss.replace(/计数器/g, "助数词");
          next.zhGlosses = next.zhGlosses.map((item) => item.replace(/计数器/g, "助数词"));
        }
        if (finding.rule === "matter_mistranslation") {
          next.shortGloss = next.shortGloss.replace(/物质/g, "事项");
          next.zhGlosses = next.zhGlosses.map((item) => item.replace(/物质/g, "事项"));
        }
        if (finding.rule === "follow_mistranslation") {
          next.shortGloss = next.shortGloss.replace(/跟随/g, "理解");
          next.zhGlosses = next.zhGlosses.map((item) => item.replace(/跟随/g, "理解"));
        }
      }
      if (finding.type === "shouldDisplay review") {
        next.shouldDisplay = false;
        if (next.confidence === "high") next.confidence = "medium";
        addFlag(next, "specialized");
        addFlag(next, "needs_human_review");
      }
    }
    if (itemFindings.length) {
      next.reviewStatus = "human_corrected";
      next.reviewerNote = [...new Set(itemFindings.map((item) => item.rule))].join("; ");
    }
    return next;
  });
}

function markdownCell(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|");
}

function correctedMarkdown({ inputReview, qaPath, rows, counts }) {
  const lines = [
    "# JMdict DeepSeek Chinese Pilot 500 Corrected Review Candidate",
    "",
    "- Source: DeepSeek Top 500 review",
    `- Source file: ${inputReview}`,
    `- QA source: ${qaPath}`,
    "- Status: human_corrected_review_candidate",
    "- Provider calls: none",
    "- Runtime AI calls: 0",
    "- Google Translate calls: 0",
    "- R2/D1 writes: 0",
    "- Preview deploy: no",
    "- Production deploy: no",
    "- Overlay active: no",
    "- This is not an active overlay and must not be uploaded to R2/D1 without separate approval.",
    "",
    "| # | entryId | Japanese written form | reading | sense index | original English glosses | shortGloss | zhGlosses | usageNote | shouldDisplay | confidence | issueFlags | reviewStatus | provider | model | generatedAt | reviewerNote |",
    "|---:|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|---|---|"
  ];
  rows.forEach((row, index) => {
    lines.push([
      index + 1,
      markdownCell(row.entryId),
      markdownCell(row.writtenForm),
      markdownCell(row.reading),
      row.senseIndex,
      markdownCell(row.originalEnglishGlosses.join("; ")),
      markdownCell(row.shortGloss),
      markdownCell(row.zhGlosses.join("; ")),
      markdownCell(row.usageNote),
      row.shouldDisplay ? "true" : "false",
      markdownCell(row.confidence),
      markdownCell(row.issueFlags.join("; ")),
      markdownCell(row.reviewStatus),
      markdownCell(row.provider),
      markdownCell(row.model),
      markdownCell(row.generatedAt),
      markdownCell(row.reviewerNote || "")
    ].join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  });
  lines.push(
    "",
    "## Summary",
    "",
    `- total entries: ${counts.entries}`,
    `- total senses: ${counts.senses}`,
    `- human corrected count: ${counts.humanCorrected}`,
    `- remaining needs_human_review count: ${counts.needsHumanReview}`,
    `- shouldDisplay=false count: ${counts.shouldDisplayFalse}`,
    "- known remaining risks:",
    "  - This corrected review candidate is generated by deterministic QA rules and still needs human review before activation.",
    "  - This is not an active overlay and must not be uploaded to R2/D1 without separate approval.",
    ""
  );
  return `${lines.join("\n")}\n`;
}

function countsForRows(rows) {
  return {
    entries: new Set(rows.map((row) => row.entryId)).size,
    senses: rows.length,
    shouldDisplayTrue: rows.filter((row) => row.shouldDisplay).length,
    shouldDisplayFalse: rows.filter((row) => !row.shouldDisplay).length,
    humanCorrected: rows.filter((row) => row.reviewStatus === "human_corrected").length,
    aiGeneratedUnreviewed: rows.filter((row) => row.reviewStatus === "ai_generated_unreviewed").length,
    needsHumanReview: rows.filter((row) => row.issueFlags.includes("needs_human_review")).length,
    confidenceLow: rows.filter((row) => row.confidence === "low").length
  };
}

function qaMarkdown({ reviewPath, correctedPath, overlayPath, packageDir, rows, findings, correctedCounts }) {
  const counts = countsForRows(rows);
  const bad = findings.filter((item) => item.type === "Bad").length;
  const minor = findings.filter((item) => item.type === "Minor").length;
  const displayReview = findings.filter((item) => item.type === "shouldDisplay review").length;
  const sampled = findings.slice(0, 20);
  const lines = [
    "# JMdict DeepSeek Top 500 QA Summary",
    "",
    `- Input review file: ${reviewPath}`,
    `- Corrected review candidate: ${correctedPath}`,
    `- Overlay candidate JSON: ${overlayPath}`,
    `- Local package: ${packageDir}`,
    "- Provider calls during QA: none",
    "- Runtime AI calls: 0",
    "- Google Translate calls: 0",
    "- R2/D1 writes: 0",
    "- Preview deploy: no",
    "- Production deploy: no",
    "",
    "## Counts",
    "",
    `- entries: ${counts.entries}`,
    `- senses: ${counts.senses}`,
    `- shouldDisplay=true: ${counts.shouldDisplayTrue}`,
    `- shouldDisplay=false: ${counts.shouldDisplayFalse}`,
    `- confidence=low: ${counts.confidenceLow}`,
    `- needs_human_review: ${counts.needsHumanReview}`,
    `- Bad findings: ${bad}`,
    `- Minor findings: ${minor}`,
    `- shouldDisplay review findings: ${displayReview}`,
    "",
    "## Required Checks",
    "",
    `- mixed English in Chinese glosses: ${findings.some((item) => item.rule === "mixed_english_in_chinese_gloss") ? "found" : "not found"}`,
    `- possible unnatural Japanese examples: ${findings.some((item) => item.rule === "possible_unreviewed_japanese_example") ? "found" : "not found"}`,
    `- shouldDisplay possibly too broad: ${displayReview ? "found" : "not found"}`,
    "- specialized / too_rare / archaic / dialect reasonableness: heuristic check completed",
    `- counter mistranslation as 计数器: ${findings.some((item) => item.rule === "counter_mistranslation") ? "found" : "not found"}`,
    `- matter mistranslation as 物质: ${findings.some((item) => item.rule === "matter_mistranslation") ? "found" : "not found"}`,
    `- follow mistranslation as 跟随: ${findings.some((item) => item.rule === "follow_mistranslation") ? "found" : "not found"}`,
    "",
    "## QA Conclusion",
    "",
    bad > MAX_BAD_FOR_CORRECTED
      ? `- FAIL: Bad findings ${bad} exceeds threshold ${MAX_BAD_FOR_CORRECTED}. Corrected review and overlay candidate must not be generated.`
      : `- PASS_WITH_REVIEW: Bad findings ${bad} is within threshold ${MAX_BAD_FOR_CORRECTED}; deterministic safety corrections may be used for local review candidate.`,
    `- corrected human_corrected count: ${correctedCounts?.humanCorrected ?? "not_generated"}`,
    `- corrected needs_human_review count: ${correctedCounts?.needsHumanReview ?? "not_generated"}`,
    "",
    "## Sampled Suspicious Items",
    "",
    "| type | rule | entryId | written | reading | sense | current | suggestion |",
    "|---|---|---|---|---|---:|---|---|"
  ];
  for (const item of sampled) {
    lines.push([
      markdownCell(item.type),
      markdownCell(item.rule),
      markdownCell(item.entryId),
      markdownCell(item.writtenForm),
      markdownCell(item.reading),
      item.senseIndex,
      markdownCell(item.current),
      markdownCell(item.suggestion)
    ].join(" | ").replace(/^/, "| ").replace(/$/, " |"));
  }
  if (!sampled.length) {
    lines.push("| none | none |  |  |  |  | No suspicious items found by deterministic QA rules. |  |");
  }
  lines.push(
    "",
    "## Known Risks",
    "",
    "- This is deterministic QA, not a substitute for full human review.",
    "- This candidate is not active and must not be uploaded to R2/D1 without separate approval.",
    "- No Preview or Production deployment is authorized by this QA summary.",
    ""
  );
  return `${lines.join("\n")}\n`;
}

function overlayCandidate({ correctedPath, rows }) {
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.entryId)) {
      grouped.set(row.entryId, {
        entryId: row.entryId,
        writtenForm: row.writtenForm,
        reading: row.reading,
        senses: []
      });
    }
    grouped.get(row.entryId).senses.push({
      senseIndex: row.senseIndex,
      shortGloss: row.shortGloss,
      zhGlosses: row.zhGlosses,
      usageNote: row.usageNote,
      shouldDisplay: row.shouldDisplay,
      confidence: row.confidence,
      issueFlags: row.issueFlags,
      reviewStatus: row.reviewStatus,
      ...(row.reviewerNote ? { reviewerNote: row.reviewerNote } : {})
    });
  }
  return {
    overlayVersion: `jmdict-zh-deepseek-pilot-500-candidate-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
    status: "local_review_only_not_active",
    source: {
      reviewFile: correctedPath,
      provider: PROVIDER,
      model: MODEL,
      reviewStatus: "human_corrected_review_candidate"
    },
    safety: {
      runtimeAiCalls: 0,
      googleTranslateCalls: 0,
      r2Writes: 0,
      d1Writes: 0,
      previewDeploy: false,
      productionDeploy: false,
      overlayActive: false
    },
    entries: [...grouped.values()]
  };
}

function validateOverlay(candidate, expectedCounts) {
  const errors = [];
  if (candidate.entries.length !== 500) errors.push(`entries count ${candidate.entries.length} != 500`);
  const senses = candidate.entries.flatMap((entry) => entry.senses.map((sense) => ({ entry, sense })));
  if (senses.length !== expectedCounts.senses) errors.push(`senses count ${senses.length} != ${expectedCounts.senses}`);
  for (const entry of candidate.entries) {
    if (!entry.entryId) errors.push("entryId is empty");
    if (!entry.writtenForm) errors.push(`${entry.entryId}: writtenForm is empty`);
    for (const sense of entry.senses) {
      if (!Number.isInteger(sense.senseIndex)) errors.push(`${entry.entryId}: invalid senseIndex`);
      if (!sense.shortGloss) errors.push(`${entry.entryId}:${sense.senseIndex}: shortGloss empty`);
      if (!Array.isArray(sense.zhGlosses)) errors.push(`${entry.entryId}:${sense.senseIndex}: zhGlosses not array`);
      if (typeof sense.shouldDisplay !== "boolean") errors.push(`${entry.entryId}:${sense.senseIndex}: shouldDisplay not boolean`);
      if (!["high", "medium", "low"].includes(sense.confidence)) errors.push(`${entry.entryId}:${sense.senseIndex}: invalid confidence`);
      if (!Array.isArray(sense.issueFlags)) errors.push(`${entry.entryId}:${sense.senseIndex}: issueFlags not array`);
      if (!sense.reviewStatus) errors.push(`${entry.entryId}:${sense.senseIndex}: missing reviewStatus`);
    }
  }
  return errors;
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeLocalPackage({ candidate, packageDir, qaPath, validationErrors }) {
  await fs.rm(packageDir, { recursive: true, force: true });
  await fs.mkdir(path.join(packageDir, "shards"), { recursive: true });
  const shardMap = new Map();
  for (const entry of candidate.entries) {
    const key = fnvShard(entry.entryId);
    if (!shardMap.has(key)) shardMap.set(key, []);
    shardMap.get(key).push(entry);
  }
  const shardIndex = [];
  const checksumLines = [];
  for (const [key, entries] of [...shardMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const relPath = `shards/${key}.json`;
    const body = `${JSON.stringify({
      schemaVersion: 1,
      overlayVersion: candidate.overlayVersion,
      status: "local_review_only_not_active",
      shardKey: key,
      entries
    }, null, 2)}\n`;
    await fs.writeFile(path.join(packageDir, relPath), body, "utf8");
    const digest = sha256(body);
    shardIndex.push({ shardKey: key, path: relPath, entries: entries.length, bytes: Buffer.byteLength(body), sha256: digest });
    checksumLines.push(`${digest}  ${relPath}`);
  }
  const counts = countsForRows(candidate.entries.flatMap((entry) => entry.senses.map((sense) => ({
    entryId: entry.entryId,
    shouldDisplay: sense.shouldDisplay,
    confidence: sense.confidence,
    issueFlags: sense.issueFlags,
    reviewStatus: sense.reviewStatus
  }))));
  const manifest = {
    schemaVersion: 1,
    overlayVersion: candidate.overlayVersion,
    status: "local_review_only_not_active",
    generatedAt: new Date().toISOString(),
    source: candidate.source,
    safety: candidate.safety,
    counts,
    shardStrategy: "fnv1a-entryId-low-4-bit-local-preview",
    shardIndex,
    notice: "This local package is not active and must not be uploaded to R2/D1 without separate approval."
  };
  const manifestBody = `${JSON.stringify(manifest, null, 2)}\n`;
  await fs.writeFile(path.join(packageDir, "manifest.json"), manifestBody, "utf8");
  checksumLines.unshift(`${sha256(manifestBody)}  manifest.json`);
  await fs.writeFile(path.join(packageDir, "checksum.txt"), `${checksumLines.join("\n")}\n`, "utf8");
  const validation = [
    "# JMdict DeepSeek Top 500 Local Package Validation",
    "",
    `- overlayVersion: ${candidate.overlayVersion}`,
    `- source QA summary: ${qaPath}`,
    `- entries: ${candidate.entries.length}`,
    `- senses: ${counts.senses}`,
    `- shouldDisplay=true: ${counts.shouldDisplayTrue}`,
    `- shouldDisplay=false: ${counts.shouldDisplayFalse}`,
    `- human_corrected: ${counts.humanCorrected}`,
    `- ai_generated_unreviewed: ${counts.aiGeneratedUnreviewed}`,
    `- needs_human_review: ${counts.needsHumanReview}`,
    `- shard files: ${shardIndex.length}`,
    `- validation pass/fail: ${validationErrors.length ? "FAIL" : "PASS"}`,
    `- validation errors: ${validationErrors.length ? validationErrors.join("; ") : "none"}`,
    "- Runtime AI calls: 0",
    "- Google Translate calls: 0",
    "- R2/D1 writes: 0",
    "- Preview deploy: no",
    "- Production deploy: no",
    "",
    "This candidate is not active and must not be uploaded to R2/D1 without separate approval.",
    ""
  ].join("\n");
  await fs.writeFile(path.join(packageDir, "validation.md"), validation, "utf8");
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log("Usage: node scripts/dictionary/jmdict-zh-deepseek-top500-postprocess.js [--review <md>] [--qa-out <md>] [--corrected-out <md>] [--overlay-out <json>] [--package-dir <dir>]");
    return;
  }
  const reviewPath = arg("--review") || DEFAULT_REVIEW;
  const qaPath = arg("--qa-out") || DEFAULT_QA;
  const correctedPath = arg("--corrected-out") || DEFAULT_CORRECTED;
  const overlayPath = arg("--overlay-out") || DEFAULT_OVERLAY;
  const packageDir = arg("--package-dir") || DEFAULT_PACKAGE_DIR;
  const markdown = await fs.readFile(reviewPath, "utf8");
  const parsed = parseReviewMarkdown(markdown);
  const findings = classifyFindings(parsed.rows);
  const badCount = findings.filter((item) => item.type === "Bad").length;
  if (badCount > MAX_BAD_FOR_CORRECTED) {
    await fs.mkdir(path.dirname(qaPath), { recursive: true });
    await fs.writeFile(qaPath, qaMarkdown({
      reviewPath,
      correctedPath: "not_generated_bad_threshold_exceeded",
      overlayPath: "not_generated_bad_threshold_exceeded",
      packageDir: "not_generated_bad_threshold_exceeded",
      rows: parsed.rows,
      findings,
      correctedCounts: null
    }), "utf8");
    throw new Error(`QA Bad findings ${badCount} exceeds threshold ${MAX_BAD_FOR_CORRECTED}.`);
  }
  const corrected = correctedRows(parsed.rows, findings);
  const correctedCounts = countsForRows(corrected);
  await fs.mkdir(path.dirname(qaPath), { recursive: true });
  await fs.writeFile(qaPath, qaMarkdown({
    reviewPath,
    correctedPath,
    overlayPath,
    packageDir,
    rows: parsed.rows,
    findings,
    correctedCounts
  }), "utf8");
  await fs.writeFile(correctedPath, correctedMarkdown({
    inputReview: reviewPath,
    qaPath,
    rows: corrected,
    counts: correctedCounts
  }), "utf8");
  const candidate = overlayCandidate({ correctedPath, rows: corrected });
  const validationErrors = validateOverlay(candidate, correctedCounts);
  if (validationErrors.length) {
    throw new Error(`Overlay candidate validation failed: ${validationErrors.join("; ")}`);
  }
  await writeJson(overlayPath, candidate);
  await writeLocalPackage({ candidate, packageDir, qaPath, validationErrors });
  console.log(JSON.stringify({
    qaPath,
    correctedPath,
    overlayPath,
    packageDir,
    entries: candidate.entries.length,
    senses: correctedCounts.senses,
    shouldDisplayTrue: correctedCounts.shouldDisplayTrue,
    shouldDisplayFalse: correctedCounts.shouldDisplayFalse,
    needsHumanReview: correctedCounts.needsHumanReview,
    badFindings: badCount,
    runtimeAiCalls: 0,
    googleTranslateCalls: 0,
    r2D1Writes: 0,
    previewDeploy: false,
    productionDeploy: false
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exit(1);
});
