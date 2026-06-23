#!/usr/bin/env node
// Dry-run test: validates that Top 500 and Top 1000 approval flags are distinct
// and fail-closed. No provider call. No R2/D1. No deploy.

import fs from "node:fs/promises";

const TOP_500_APPROVAL = "YES_DEEPSEEK_TOP_500_ONLY";
const TOP_1000_APPROVAL = "YES_DEEPSEEK_TOP_1000_ONLY";
const REQUIRED_APPROVAL = "YES_DEEPSEEK_TOP_100_ONLY";

// Simulate the detectPilotScope and runApprovalForEstimate logic
// (duplicated from jmdict-zh-deepseek-pilot.js for isolated testing)

function detectPilotScope(inputPath, batch) {
  const input = String(inputPath || "").toLowerCase();
  if (input.includes("pilot-1000")) return "top1000";
  if (input.includes("pilot-500")) return "top500";
  if (input.includes("pilot-100")) return "top100";
  if (input.includes("probe")) return "probe";

  const entries = batch.entries || [];
  if (entries.length === 0) return "unknown";
  if (entries.length === 500) return "unknown";
  if (entries.length === 100) return "top100";
  if (entries.length <= 5) return "probe";
  return "unknown";
}

function runApprovalForEstimate(estimate) {
  if (estimate.scope === "top1000") return TOP_1000_APPROVAL;
  if (estimate.scope === "top500") return TOP_500_APPROVAL;
  if (estimate.scope === "top100") return REQUIRED_APPROVAL;
  if (estimate.scope === "probe") return REQUIRED_APPROVAL;
  if (estimate.entries === 500) return TOP_500_APPROVAL;
  if (estimate.entries === 100) return REQUIRED_APPROVAL;
  return REQUIRED_APPROVAL;
}

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    tests.push({ name, result: "PASS" });
  } catch (e) {
    failed++;
    tests.push({ name, result: "FAIL", error: e.message });
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg}: expected ${expected}, got ${actual}`);
  }
}

// Test 1: Top 500 input path → scope top500
test("Top 500 input path → scope top500", () => {
  const scope = detectPilotScope("docs/dictionary/zh-overlay-pilot-500/translation-input.json", { entries: Array(500) });
  assertEqual(scope, "top500", "scope mismatch");
});

// Test 2: Top 1000 input path → scope top1000
test("Top 1000 input path → scope top1000", () => {
  const scope = detectPilotScope("docs/dictionary/zh-overlay-pilot-1000/translation-input.json", { entries: Array(500) });
  assertEqual(scope, "top1000", "scope mismatch");
});

// Test 3: Top 100 input path → scope top100
test("Top 100 input path → scope top100", () => {
  const scope = detectPilotScope("docs/dictionary/zh-overlay-pilot-100/translation-input.json", { entries: Array(100) });
  assertEqual(scope, "top100", "scope mismatch");
});

// Test 4: Probe path → scope probe
test("Probe path → scope probe", () => {
  const scope = detectPilotScope("docs/review/jmdict-zh-deepseek-probe-review.md", { entries: Array(5) });
  assertEqual(scope, "probe", "scope mismatch");
});

// Test 5: 500 entries with no path → unknown (conservative)
test("500 entries no path → scope unknown", () => {
  const scope = detectPilotScope("", { entries: Array(500) });
  assertEqual(scope, "unknown", "scope mismatch");
});

// Test 6: Top 500 scope → TOP_500_APPROVAL
test("scope top500 → YES_DEEPSEEK_TOP_500_ONLY", () => {
  const approval = runApprovalForEstimate({ entries: 500, scope: "top500" });
  assertEqual(approval, TOP_500_APPROVAL, "approval mismatch");
});

// Test 7: Top 1000 scope → TOP_1000_APPROVAL
test("scope top1000 → YES_DEEPSEEK_TOP_1000_ONLY", () => {
  const approval = runApprovalForEstimate({ entries: 500, scope: "top1000" });
  assertEqual(approval, TOP_1000_APPROVAL, "approval mismatch");
});

// Test 8: Top 500 and Top 1000 approval flags are DIFFERENT
test("Top 500 ≠ Top 1000 approval flags", () => {
  assertEqual(TOP_500_APPROVAL !== TOP_1000_APPROVAL, true, "flags must differ");
  assertEqual(TOP_500_APPROVAL, "YES_DEEPSEEK_TOP_500_ONLY", "Top 500 flag");
  assertEqual(TOP_1000_APPROVAL, "YES_DEEPSEEK_TOP_1000_ONLY", "Top 1000 flag");
});

// Test 9: Wrong approval flag fail-closed — Top 500 approval for Top 1000 scope
test("Top 1000 scope does NOT return TOP_500_APPROVAL", () => {
  const approval = runApprovalForEstimate({ entries: 500, scope: "top1000" });
  assertEqual(approval !== TOP_500_APPROVAL, true, "must not return Top 500 approval for Top 1000");
});

// Test 10: Legacy heuristic (no scope) still works for 500 entries → TOP_500_APPROVAL
test("Legacy: 500 entries no scope → TOP_500_APPROVAL", () => {
  const approval = runApprovalForEstimate({ entries: 500 });
  assertEqual(approval, TOP_500_APPROVAL, "legacy compatibility");
});

// Test 11: Legacy heuristic (no scope) still works for 100 entries → REQUIRED_APPROVAL
test("Legacy: 100 entries no scope → REQUIRED_APPROVAL", () => {
  const approval = runApprovalForEstimate({ entries: 100 });
  assertEqual(approval, REQUIRED_APPROVAL, "legacy compatibility");
});

// Test 12: Top 100 scope → REQUIRED_APPROVAL (not Top 500 or Top 1000)
test("scope top100 → YES_DEEPSEEK_TOP_100_ONLY", () => {
  const approval = runApprovalForEstimate({ entries: 100, scope: "top100" });
  assertEqual(approval, REQUIRED_APPROVAL, "approval mismatch");
});

console.log(JSON.stringify({
  mode: "approval_compatibility_dry_run_test_no_provider_call",
  tests: tests.length,
  passed,
  failed,
  deepseekApiCalled: false,
  runtimeAiCalls: 0,
  r2D1Writes: 0,
  previewDeploy: false,
  productionDeploy: false,
  results: tests
}, null, 2));

process.exit(failed > 0 ? 1 : 0);
