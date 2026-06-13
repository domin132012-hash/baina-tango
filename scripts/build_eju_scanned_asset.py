#!/usr/bin/env python3
"""Build the local EJU scanned-paper data asset for Baina Tango."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path


SUBJECTS = {
    "math1": {"label": "数学1", "labelJa": "数学コース1", "category": "math"},
    "math2": {"label": "数学2", "labelJa": "数学コース2", "category": "math"},
    "humanities": {"label": "综合科目", "labelJa": "総合科目", "category": "sogo"},
    "science": {"label": "理科", "labelJa": "理科", "category": "science"},
}


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def page_number(path: Path) -> int:
    match = re.search(r"page-(\d+)", path.name)
    return int(match.group(1)) if match else 0


def compact_text(value: object) -> str:
    return re.sub(r"\n{3,}", "\n\n", str(value or "").strip())


def page_payload(path: Path, flagged_by_page: dict[int, list[dict]]) -> dict:
    page = load_json(path)
    pdf_page = int(page.get("pdf_page") or page_number(path))
    flags = flagged_by_page.get(pdf_page, [])
    return {
        "page": pdf_page,
        "pageType": page.get("page_type") or page.get("kind") or "unknown",
        "printedPageNumber": page.get("printed_page_number") or "",
        "printedHeader": page.get("printed_header") or "",
        "containsQuestions": bool(page.get("contains_questions")),
        "containsAnswerKey": bool(page.get("contains_answer_key")),
        "needsReview": bool(page.get("needs_review")) or bool(flags),
        "reviewReason": page.get("review_reason") or "",
        "flags": [
            {
                "code": flag.get("code") or "needs_review",
                "message": flag.get("message") or "",
            }
            for item in flags
            for flag in item.get("flags", [])
        ],
        "text": compact_text(page.get("ocr_text")),
        "figuresText": compact_text(page.get("figures_text")),
        "questionMarkers": page.get("question_markers") or [],
    }


def error_payload(path: Path) -> dict:
    page = load_json(path)
    return {
        "page": int(page.get("pdf_page") or page_number(path)),
        "pageType": page.get("kind") or "error",
        "printedPageNumber": "",
        "printedHeader": "",
        "containsQuestions": False,
        "containsAnswerKey": False,
        "needsReview": True,
        "reviewReason": "OCR error",
        "flags": [{"code": "ocr_error", "message": page.get("error") or "OCR failed"}],
        "text": "",
        "figuresText": "",
        "questionMarkers": [],
        "error": page.get("error") or "OCR failed",
    }


def build_set(staging: Path, qc_path: Path) -> dict:
    qc = load_json(qc_path)
    subject = qc["subject"]
    set_id = qc["set_id"]
    set_dir = staging / "pages" / subject / set_id
    answer_dir = staging / "answer-pages" / subject / set_id

    flagged_by_page: dict[int, list[dict]] = {}
    for item in qc.get("flagged_pages") or []:
        flagged_by_page.setdefault(int(item.get("pdf_page") or 0), []).append(item)

    page_files = sorted(
        [p for p in set_dir.glob("page-*.json") if not p.name.endswith(".error.json")],
        key=page_number,
    )
    error_files = sorted(set_dir.glob("page-*.error.json"), key=page_number)
    pages = [page_payload(path, flagged_by_page) for path in page_files]
    pages.extend(error_payload(path) for path in error_files)
    pages.sort(key=lambda item: item["page"])

    answer_pages = []
    if answer_dir.exists():
        for path in sorted(
            [p for p in answer_dir.glob("page-*.json") if not p.name.endswith(".error.json")],
            key=page_number,
        ):
            page = load_json(path)
            answer_pages.append(
                {
                    "page": int(page.get("pdf_page") or page_number(path)),
                    "pageType": page.get("page_type") or page.get("kind") or "answer",
                    "text": compact_text(page.get("ocr_text")),
                }
            )

    return {
        "subject": subject,
        "setId": set_id,
        "year": int(qc["year"]),
        "session": int(qc["session"]),
        "status": qc["status"],
        "pageCount": int(qc.get("page_count") or len(pages)),
        "expectedPageCount": int(qc.get("expected_page_count") or len(pages)),
        "questionPageCount": int(qc.get("question_page_count") or 0),
        "answerKeyPageCount": int(qc.get("answer_key_page_count") or 0),
        "flaggedPageCount": int(qc.get("flagged_page_count") or 0),
        "errorCount": int(qc.get("error_count") or 0),
        "answerSource": qc.get("answer_source") or "none",
        "typeCounts": qc.get("type_counts") or {},
        "pages": pages,
        "answerPages": answer_pages,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--staging",
        default="/Users/domin/Documents/Codex/2026-05-20/eju-ai/eju_staging",
        help="Path to eju_staging",
    )
    parser.add_argument(
        "--out",
        default="/Users/domin/Documents/Codex/2026-05-20/files-mentioned-by-the-user-2026/baina-tango/assets/eju-scanned-data.json",
        help="Output JSON asset path",
    )
    args = parser.parse_args()

    staging = Path(args.staging)
    out = Path(args.out)
    qc_dir = staging / "qc" / "sets"
    if not qc_dir.exists():
        raise SystemExit(f"Missing QC directory: {qc_dir}")

    sets = []
    for qc_path in sorted(qc_dir.glob("*/*.json")):
        sets.append(build_set(staging, qc_path))

    status_counts: dict[str, int] = {}
    for item in sets:
        status_counts[item["status"]] = status_counts.get(item["status"], 0) + 1

    payload = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "eju_staging page OCR with QC status",
        "subjects": SUBJECTS,
        "summary": {
            "totalSets": len(sets),
            "statusCounts": status_counts,
            "totalPages": sum(len(item["pages"]) for item in sets),
            "totalAnswerPages": sum(len(item["answerPages"]) for item in sets),
        },
        "sets": sets,
    }

    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, separators=(",", ":"))
        handle.write("\n")

    print(f"wrote {out}")
    print(json.dumps(payload["summary"], ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
