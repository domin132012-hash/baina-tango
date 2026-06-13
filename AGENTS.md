## Local Token Saving Rule

For non-trivial engineering tasks in this project, start with:

```sh
codex-preflight --task "<task>"
```

Then read `.codex-context-pack.json` before reading many source files.
Do not read large files directly. Use `repo-map`, `smart-read`, `rg`, `jq`, or bridge tools first.
Use `deepseek-bridge` for long logs, documents, or diffs. Use `visual-bridge` for screenshots, OCR, and UI image checks.
Before editing based on bridge output, verify original evidence.
Project root check: run codex-preflight from the project root; if it prints a project-root WARNING, cd to the real root first.
Bridge threshold: use deepseek-bridge only for logs >500 lines, docs >3000 tokens, or diffs >200 changed lines. Small inputs: direct read is cheaper (the tool refuses <1500-token inputs unless --force).
