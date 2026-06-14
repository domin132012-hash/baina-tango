#!/usr/bin/env python3
"""渲染综合科目（総合科目）套卷题目页 → 裁白边/去页脚 → assets/eju-media/humanities/{set}/page-NNN.png

用法：python3 scripts/sogo_render_set.py <set_id>
仿 rika_render_set.py，但综合科目页配置不同（不要套用理科页码）。
page 编号 = PDF 物理页号（与 eju.js SOGO proto 的 page 字段一致）。
"""
from __future__ import annotations
import sys, os
from PIL import Image, ImageOps
import fitz

EJU = "/Users/domin/Desktop/ eju高手/绿头EJU资料/EJU过去问"

SETS = {
    # 2024 令和6年（humanities/2024-1）
    # PDF 32 页；题目页 p3~p31；正解表 p32；p3/p7 为大問引导文章页（MVP 不渲染）。
    # 题屏 25 屏（一题一屏），其中两题选项跨页需竖接：
    #   番号5  問2(1)：选项①在 p8、②③④在 p9 → page-008 = merge[8,9]
    #   番号23 問17  ：题面 p22、地图选项 p23 → page-022 = merge[22,23]
    "2024-1": {
        "src": f"{EJU}/EJU文综/2024令和6年综合科目.pdf",
        "pages": [4, 5, 6, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                  21, 22, 24, 25, 26, 27, 28, 29, 30, 31],
        "merge": {8: [8, 9], 22: [22, 23]},
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
    out = f"assets/eju-media/humanities/{set_id}"
    os.makedirs(out, exist_ok=True)
    doc = fitz.open(cfg["src"])
    m = fitz.Matrix(dpi / 72, dpi / 72)
    merge = cfg.get("merge", {})

    def render_one(pdf_page):
        pix = doc[pdf_page - 1].get_pixmap(matrix=m)
        raw = f"/tmp/_raw_sogo_{set_id}_{pdf_page}.png"
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
    render(sys.argv[1] if len(sys.argv) > 1 else "2024-1")
