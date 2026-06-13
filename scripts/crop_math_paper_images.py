#!/usr/bin/env python3
"""Crop whitespace from rendered EJU math paper page images."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageOps


def occupied_groups(rows: list[int], merge_gap: int = 18) -> list[tuple[int, int]]:
    groups: list[tuple[int, int]] = []
    start = prev = rows[0]
    for row in rows[1:]:
        if row - prev <= merge_gap:
            prev = row
            continue
        groups.append((start, prev))
        start = prev = row
    groups.append((start, prev))
    return groups


def crop_box(img: Image.Image, threshold: int, padding: int) -> tuple[int, int, int, int]:
    gray = ImageOps.grayscale(img.convert("RGB"))
    width, height = gray.size
    pix = gray.load()

    row_hits: list[int] = []
    min_pixels_per_row = max(4, width // 260)
    for y in range(height):
        hits = 0
        for x in range(width):
            if pix[x, y] < threshold:
                hits += 1
        if hits >= min_pixels_per_row:
            row_hits.append(y)

    if not row_hits:
        return (0, 0, width, height)

    groups = occupied_groups(row_hits)
    if len(groups) > 1:
        last_start, last_end = groups[-1]
        prev_start, prev_end = groups[-2]
        last_height = last_end - last_start + 1
        gap = last_start - prev_end
        if gap > height * 0.14 and last_height < height * 0.08:
            groups = groups[:-1]

    top = max(0, min(g[0] for g in groups) - padding)
    bottom = min(height, max(g[1] for g in groups) + padding)

    col_hits: list[int] = []
    min_pixels_per_col = max(3, (bottom - top) // 220)
    for x in range(width):
        hits = 0
        for y in range(top, bottom):
            if pix[x, y] < threshold:
                hits += 1
        if hits >= min_pixels_per_col:
            col_hits.append(x)

    if not col_hits:
        return (0, top, width, bottom)

    left = max(0, min(col_hits) - padding)
    right = min(width, max(col_hits) + padding)
    return (left, top, right, bottom)


def crop_file(path: Path, threshold: int, padding: int) -> dict[str, object]:
    img = Image.open(path).convert("RGB")
    before = img.size
    box = crop_box(img, threshold=threshold, padding=padding)
    cropped = img.crop(box)
    cropped.save(path, optimize=True)
    return {
        "file": path.name,
        "before": before,
        "after": cropped.size,
        "box": box,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path)
    parser.add_argument("--threshold", type=int, default=245)
    parser.add_argument("--padding", type=int, default=34)
    args = parser.parse_args()

    for path in sorted(args.directory.glob("page-*.png")):
        result = crop_file(path, threshold=args.threshold, padding=args.padding)
        print(
            f"{result['file']}: {result['before'][0]}x{result['before'][1]} -> "
            f"{result['after'][0]}x{result['after'][1]} box={result['box']}"
        )


if __name__ == "__main__":
    main()
