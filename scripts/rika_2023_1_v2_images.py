#!/usr/bin/env python3
"""Re-crop science 2023-1 page images and split known two-question pages."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


SPLITS = {
    "034": [("q11", 0, 478), ("q12", 500, None)],
    "035": [("q13", 0, 382), ("q14", 402, None)],
    "045": [("q3", 0, 498), ("q4", 506, None)],
}


def row_groups(img: Image.Image, threshold: int = 225) -> list[tuple[int, int]]:
    gray = ImageOps.grayscale(img.convert("RGB"))
    width, height = gray.size
    pix = gray.load()
    x0, x1 = int(width * 0.06), int(width * 0.94)
    min_hits = max(4, (x1 - x0) // 260)
    rows: list[int] = []
    for y in range(height):
        hits = 0
        for x in range(x0, x1):
            if pix[x, y] < threshold:
                hits += 1
        if hits >= min_hits:
            rows.append(y)
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


def content_box(img: Image.Image, padding: int = 30) -> tuple[int, int, int, int]:
    gray = ImageOps.grayscale(img.convert("RGB"))
    width, height = gray.size
    groups = row_groups(img)
    if not groups:
        return (0, 0, width, height)

    # The rendered EJU pages often have only the printed page number near the
    # bottom. Remove that footer before measuring the true content height.
    if len(groups) > 1:
        last_start, last_end = groups[-1]
        last_height = last_end - last_start + 1
        prev_end = groups[-2][1]
        if last_end > height * 0.92 and last_height <= 28 and last_start - prev_end > 35:
            groups = groups[:-1]

    top = max(0, min(start for start, _ in groups) - padding)
    bottom = min(height, max(end for _, end in groups) + padding)

    pix = gray.load()
    x0 = int(width * 0.03)
    x1 = int(width * 0.97)
    col_hits: list[int] = []
    min_col_hits = max(3, (bottom - top) // 230)
    for x in range(x0, x1):
        hits = 0
        for y in range(top, bottom):
            if pix[x, y] < 235:
                hits += 1
        if hits >= min_col_hits:
            col_hits.append(x)

    if not col_hits:
        return (0, top, width, bottom)
    left = max(0, min(col_hits) - padding)
    right = min(width, max(col_hits) + padding)
    return (left, top, right, bottom)


def crop_image(img: Image.Image) -> Image.Image:
    box = content_box(img)
    return img.crop(box)


def save_crop(path: Path) -> tuple[tuple[int, int], tuple[int, int]]:
    img = Image.open(path).convert("RGB")
    before = img.size
    cropped = crop_image(img)
    cropped.save(path, optimize=True)
    return before, cropped.size


def save_split(src: Path, suffix: str, y0: int, y1: int | None) -> tuple[str, tuple[int, int]]:
    img = Image.open(src).convert("RGB")
    width, height = img.size
    part = img.crop((0, max(0, y0), width, min(height, y1 or height)))
    cropped = crop_image(part)
    out = src.with_name(src.stem + "-" + suffix + src.suffix)
    cropped.save(out, optimize=True)
    return out.name, cropped.size


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "directory",
        type=Path,
        default=Path("assets/eju-media/science/2023-1"),
        nargs="?",
    )
    args = parser.parse_args()

    for path in sorted(args.directory.glob("page-[0-9][0-9][0-9].png")):
        before, after = save_crop(path)
        print(f"crop {path.name}: {before[0]}x{before[1]} -> {after[0]}x{after[1]}")

    for page, parts in SPLITS.items():
        src = args.directory / f"page-{page}.png"
        for suffix, y0, y1 in parts:
            name, size = save_split(src, suffix, y0, y1)
            print(f"split {name}: {size[0]}x{size[1]}")


if __name__ == "__main__":
    main()
