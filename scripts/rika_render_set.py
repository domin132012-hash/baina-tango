#!/usr/bin/env python3
"""渲染理科套卷题目页 → 裁上下白边/去页脚 → assets/eju-media/science/{set}/page-NNN.png

用法：python3 scripts/rika_render_set.py <set_id>
页配置见 SETS。page 编号 = PDF 物理页号（与 eju.js proto 的 page 字段一致）。
"""
from __future__ import annotations
import sys, os
from PIL import Image, ImageOps
import fitz

EJU = "/Users/domin/Desktop/ eju高手/绿头EJU资料/EJU过去问"

SETS = {
    "2023-2": {
        "src": f"{EJU}/EJU理综/2023令和5年第2回理科.pdf",
        # 物理3-21, 化学常数表24 + 题25-40, 生物43-55
        "pages": list(range(3, 22)) + [24] + list(range(25, 41)) + list(range(42, 56)),
    },
    "2022-1": {
        "src": f"{EJU}/EJU理综/2022令和4年第1回理科.pdf",
        # 物理3-11,13-22(no9选项表续页12并入11), 化学常数表24+题25-40, 生物42-58
        "pages": list(range(3, 12)) + list(range(13, 23)) + [24] + list(range(25, 41)) + list(range(42, 59)),
        "merge": {11: [11, 12]},  # page-011 = PDF11题干 + PDF12选项表 竖接
    },
    "2022-2": {
        "src": f"{EJU}/EJU理综/2022令和4年第2回理科.pdf",
        # 物理3-21, 化学常数表23+题24-37, 生物39-51(含说明+問1)
        "pages": list(range(3, 22)) + [23] + list(range(24, 38)) + list(range(39, 52)),
    },
}


def row_groups(img: Image.Image, threshold: int = 225):
    gray = ImageOps.grayscale(img.convert("RGB"))
    w, h = gray.size
    px = gray.load()
    x0, x1 = int(w * 0.06), int(w * 0.94)
    min_hits = max(4, (x1 - x0) // 260)
    rows = [y for y in range(h) if sum(1 for x in range(x0, x1) if px[x, y] < threshold) >= min_hits]
    if not rows:
        return []
    groups = []
    start = prev = rows[0]
    for y in rows[1:]:
        if y - prev <= 14:
            prev = y
            continue
        groups.append((start, prev))
        start = prev = y
    groups.append((start, prev))
    merged = []
    for s, e in groups:
        if merged and s - merged[-1][1] <= 22:
            merged[-1] = (merged[-1][0], e)
        else:
            merged.append((s, e))
    return merged


def crop_page(im: Image.Image) -> Image.Image:
    groups = row_groups(im)
    if not groups:
        return im
    top = groups[0][0]
    bottom = groups[-1][1]
    # 去页脚：最后一组很矮(<3%高)且与上一组间隔>4%高 → 视为页脚页码，丢弃
    if len(groups) >= 2:
        ls, le = groups[-1]
        prev_e = groups[-2][1]
        if (le - ls) < im.height * 0.03 and (ls - prev_e) > im.height * 0.04:
            bottom = prev_e
    pad = 12
    return im.crop((0, max(0, top - pad), im.width, min(im.height, bottom + pad)))


def render(set_id: str, dpi: int = 150):
    cfg = SETS[set_id]
    out = f"assets/eju-media/science/{set_id}"
    os.makedirs(out, exist_ok=True)
    doc = fitz.open(cfg["src"])
    m = fitz.Matrix(dpi / 72, dpi / 72)
    merge = cfg.get("merge", {})

    def render_one(pdf_page):
        pix = doc[pdf_page - 1].get_pixmap(matrix=m)
        raw = f"/tmp/_raw_{set_id}_{pdf_page}.png"
        pix.save(raw)
        return crop_page(Image.open(raw).convert("RGB"))

    for p in cfg["pages"]:
        if p in merge:
            ims = [render_one(pp) for pp in merge[p]]
            W = max(i.width for i in ims)
            H = sum(i.height for i in ims) + 10 * (len(ims) - 1)
            canvas = Image.new("RGB", (W, H), "white")
            y = 0
            for i in ims:
                canvas.paste(i, (0, y))
                y += i.height + 10
            canvas.save(f"{out}/page-{p:03d}.png")
        else:
            render_one(p).save(f"{out}/page-{p:03d}.png")
    print(f"{set_id}: 渲染 {len(cfg['pages'])} 页 → {out}")


if __name__ == "__main__":
    render(sys.argv[1] if len(sys.argv) > 1 else "2023-2")
