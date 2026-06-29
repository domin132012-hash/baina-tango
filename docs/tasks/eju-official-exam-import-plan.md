# EJU official scanned exam import

Last updated: 2026-06-29 16:02 JST by Codex

## Scope

- Branch: `feat/eju-official-exam-import`
- Start commit: `d8b2b1062c8edac78f8b6f1420410c56fba6c812`
- Worktree: `/Users/domin/Documents/Codex/2026-05-20/files-mentioned-by-the-user-2026/baina-tango-eju`
- Original dirty Top 50K worktree: not modified

## Imported as scan-browser

These sets have official scanned pages rendered under `assets/eju-media/<subject>/<setId>/page-XXX.png` and are opened as scan-browser pages, not auto-graded structured practice.

### 総合科目

- `humanities/2018-1` - needs_review
- `humanities/2018-2` - pass
- `humanities/2019-1` - pass
- `humanities/2020-2` - pass
- `humanities/2021-1` - pass
- `humanities/2021-2` - pass
- `humanities/2022-1` - pass
- `humanities/2022-2` - pass
- `humanities/2023-1` - needs_review
- `humanities/2023-2` - pass
- `humanities/2025-1` - pass

`humanities/2024-1` remains the existing formal practice MVP.

### 理科

- `science/2018-1` - needs_review
- `science/2018-2` - needs_review
- `science/2020-2` - needs_review
- `science/2024-1` - needs_review
- `science/2025-1` - needs_review

Existing formal practice remains unchanged for `science/2021-1`, `science/2021-2`, `science/2022-1`, `science/2022-2`, `science/2023-1`, and `science/2023-2`.

## Kept unavailable

- `science/2019-1`: kept as construction because `assets/eju-scanned-data.json` marks this set as `status: "fail"` with an OCR error page.

## Assets

- New image sets: 16
- New rendered PNG pages: 571
- Source PDF paths used:
  - `/Users/domin/Desktop/ eju高手/绿头EJU资料/EJU过去问/EJU文综/`
  - `/Users/domin/Desktop/ eju高手/绿头EJU资料/EJU过去问/EJU理综/`
  - `/Users/domin/Desktop/ eju高手/绿头EJU资料/EJU过去问/2025令和7年资料/`
- Raw PDF files were not copied into the repository.

## Validation

- `node --check assets/eju.js`
- `python3 -m json.tool assets/eju-scanned-data.json >/tmp/eju-scanned-data-check.json`
- `git diff --check`
- Local browser smoke at `http://localhost:4173/?eju_scan_import=20260629`
- HTTP image check for all 571 scan-browser PNG URLs: `bad_count=0`
- Browser console errors during smoke: `0`
- R2 writes: `0`
- D1 writes: `0`
- Deploy: `0`
- Push: `0`
- Runtime AI / DeepSeek / Google Translate calls: `0`

## Remaining risks

- Scan-browser sets expose official scanned pages and OCR text, but do not provide auto-grading.
- `needs_review` sets remain visibly marked and should be manually reviewed before any future structured practice conversion.
- `science/2019-1` needs a clean source/OCR pass before it can be opened.
