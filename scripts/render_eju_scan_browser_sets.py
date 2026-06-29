#!/usr/bin/env python3
"""Render scan-browser EJU sets into assets/eju-media.

This is intentionally limited to the official scanned exams opened in
scan-browser mode. It does not copy source PDFs into the repository.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import fitz
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "assets/eju-scanned-data.json"
MEDIA_ROOT = ROOT / "assets/eju-media"
EJU_ROOT = Path("/Users/domin/Desktop/ eju高手/绿头EJU资料/EJU过去问")


TARGETS = {
    "humanities/2018-1": EJU_ROOT / "EJU文综/2018平成30年第1回综合科目.pdf",
    "humanities/2018-2": EJU_ROOT / "EJU文综/2018平成30年第2回综合科目.pdf",
    "humanities/2019-1": EJU_ROOT / "EJU文综/2019令和元年第1回综合科目.pdf",
    "humanities/2020-2": EJU_ROOT / "EJU文综/2020令和2年第2回综合科目.pdf",
    "humanities/2021-1": EJU_ROOT / "EJU文综/2021令和3年第1回综合科目.pdf",
    "humanities/2021-2": EJU_ROOT / "EJU文综/2021令和3年第2回综合科目.pdf",
    "humanities/2022-1": EJU_ROOT / "EJU文综/2022令和4年第1回综合科目.pdf",
    "humanities/2022-2": EJU_ROOT / "EJU文综/2022令和4年第2回综合科目.pdf",
    "humanities/2023-1": EJU_ROOT / "EJU文综/2023令和5年第1回综合科目.pdf",
    "humanities/2023-2": EJU_ROOT / "EJU文综/2023令和5年第2回综合科目.pdf",
    "humanities/2025-1": EJU_ROOT / "2025令和7年资料/2025令和7年综合科目.pdf",
    "science/2018-1": EJU_ROOT / "EJU理综/2018平成30年第1回理科.pdf",
    "science/2018-2": EJU_ROOT / "EJU理综/2018平成30年第2回理科.pdf",
    "science/2020-2": EJU_ROOT / "EJU理综/2020令和2年第2回理科.pdf",
    "science/2024-1": EJU_ROOT / "EJU理综/2024令和6年理科.pdf",
    "science/2025-1": EJU_ROOT / "2025令和7年资料/2025令和7年理科.pdf",
}


def row_groups(img: Image.Image, threshold: int = 225) -> list[tuple[int, int]]:
    gray = ImageOps.grayscale(img.convert("RGB"))
    width, height = gray.size
    px = gray.load()
    x0, x1 = int(width * 0.06), int(width * 0.94)
    min_hits = max(4, (x1 - x0) // 260)
    rows = [
        y
        for y in range(height)
        if sum(1 for x in range(x0, x1) if px[x, y] < threshold) >= min_hits
    ]
    if not rows:
        return []
    groups: list[tuple[int, int]] = []
    start = prev = rows[0]
    for y in rows[1:]:
        if y - prev <= 14:
            prev = y
            continue
        groups.append((start, prev))
        start = prev = y
    groups.append((start, prev))

    merged: list[tuple[int, int]] = []
    for start, end in groups:
        if merged and start - merged[-1][1] <= 22:
            merged[-1] = (merged[-1][0], end)
        else:
            merged.append((start, end))
    return merged


def crop_page(img: Image.Image) -> Image.Image:
    groups = row_groups(img)
    if not groups:
        return img
    top = groups[0][0]
    bottom = groups[-1][1]
    if len(groups) >= 2:
        last_start, last_end = groups[-1]
        prev_end = groups[-2][1]
        if (last_end - last_start) < img.height * 0.03 and (last_start - prev_end) > img.height * 0.04:
            bottom = prev_end
    pad = 12
    return img.crop((0, max(0, top - pad), img.width, min(img.height, bottom + pad)))


def load_sets() -> dict[str, dict]:
    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    return {
        f"{item['subject']}/{item['setId']}": item
        for item in payload.get("sets", [])
    }


def render_page(doc: fitz.Document, page_num: int, dpi: int) -> Image.Image:
    pix = doc[page_num - 1].get_pixmap(matrix=fitz.Matrix(dpi / 72, dpi / 72), alpha=False)
    mode = "RGB" if pix.n < 4 else "RGBA"
    img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
    return crop_page(img.convert("L"))


def render_target(key: str, source: Path, item: dict, dpi: int, overwrite: bool) -> tuple[int, int]:
    if not source.exists():
        raise FileNotFoundError(f"missing source PDF for {key}: {source}")
    subject, set_id = key.split("/", 1)
    out_dir = MEDIA_ROOT / subject / set_id
    out_dir.mkdir(parents=True, exist_ok=True)
    pages = sorted({int(page["page"]) for page in item.get("pages", [])})
    rendered = skipped = 0
    with fitz.open(source) as doc:
        for page_num in pages:
            if page_num < 1 or page_num > doc.page_count:
                raise ValueError(f"{key} page {page_num} outside source page count {doc.page_count}")
            out = out_dir / f"page-{page_num:03d}.png"
            if out.exists() and not overwrite:
                skipped += 1
                continue
            img = render_page(doc, page_num, dpi)
            img.save(out, optimize=True)
            rendered += 1
    return rendered, skipped


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("targets", nargs="*", help="Optional keys such as humanities/2023-2")
    parser.add_argument("--dpi", type=int, default=130)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    sets = load_sets()
    keys = args.targets or sorted(TARGETS)
    for key in keys:
        if key not in TARGETS:
            raise SystemExit(f"unknown target: {key}")
        if key not in sets:
            raise SystemExit(f"target not found in {DATA_PATH}: {key}")
        rendered, skipped = render_target(key, TARGETS[key], sets[key], args.dpi, args.overwrite)
        print(f"{key}: rendered={rendered} skipped={skipped} source={TARGETS[key]}")


if __name__ == "__main__":
    main()
