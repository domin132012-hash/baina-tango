#!/usr/bin/env node

import fs from "node:fs";

const checks = [];

function read(path) {
  try {
    return fs.readFileSync(path, "utf8");
  } catch (error) {
    checks.push({ ok: false, label: `${path} is readable`, detail: error.message });
    return "";
  }
}

function add(ok, label, detail = "") {
  checks.push({ ok, label, detail });
}

const worklog = read("AGENT_WORKLOG.md");
const syncBoard = read("AGENT_SYNC_BOARD.md");

add(/\d{4}-\d{2}-\d{2} \d{2}:\d{2} JST/.test(worklog), "AGENT_WORKLOG.md contains a JST timestamp");
add(/Last updated:/i.test(syncBoard), "AGENT_SYNC_BOARD.md contains Last updated");
add(/external services touched/i.test(worklog), "AGENT_WORKLOG.md contains external services touched");
add(/start commit/i.test(worklog), "AGENT_WORKLOG.md contains start commit");
add(/end commit/i.test(worklog), "AGENT_WORKLOG.md contains end commit");

const forbiddenSecretPatterns = [
  { name: "OpenAI or DeepSeek style raw key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: "GitHub OAuth token", regex: /\bgho_[A-Za-z0-9_]{20,}\b/ },
  { name: "JWT-like token", regex: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/ },
];

const combinedDocs = `${worklog}\n${syncBoard}`;
for (const pattern of forbiddenSecretPatterns) {
  add(!pattern.regex.test(combinedDocs), `No ${pattern.name} in closeout docs`);
}

let failed = 0;
for (const check of checks) {
  if (check.ok) {
    console.log(`ok - ${check.label}`);
  } else {
    failed += 1;
    console.error(`not ok - ${check.label}${check.detail ? `: ${check.detail}` : ""}`);
  }
}

if (failed > 0) {
  process.exitCode = 1;
}
