# 交接文档 — EJU 真题试炼（数学 + 理科 + 综合科目）

> 本文件面向**完全没有上下文的接手人/代理**。读完即可接手。
> 最后更新：2026-06-14。配套阅读：`AGENTS.md`（开工规则）、`PROJECT_STATUS.md`（当前进度）、`SOGO_PLAN.md`（综合科目）、`AGENT_WORKLOG.md`（最近动作流水）。

---

## 0. 一句话概括

百纳日语（baina-tango）是一个 EJU 留考备考的纯静态网页 App。本轮工作是在「学习 tab → 真题试炼」里，把历年 EJU 真题 PDF 渲染成图片，并配上答题/判分交互。

当前真实状态：

- 数学1 / 数学2：已完成并上线。
- 理科：2023-1 样板与 bug 修复已上线；2023-2、2022-1、2022-2、2021-1、2021-2 已上线。
- 理科剩余 6 套暂缓：2018-1、2018-2、2019-1、2020-2、2024-1、2025-1。
- 综合科目：2024 一套 MVP 已完成并上线（见下）。

### 综合科目（総合科目）现状（2026-06-14）
- 已上线：`humanities/2024-1`（38 题全 4 択，**27 屏含 p3/p7 两张材料页**）。原型在 `assets/eju.js` 的 `EJU_SOGO_PROTOTYPES`，与理科共用 `ejuRikaProtoFor` + 同一套渲染/判分引擎。
- 渲染脚本独立：`scripts/sogo_render_set.py`（**勿套用理科页码**，综合科目页码自己一套）。图片在 `assets/eju-media/humanities/<set>/`。
- **材料页规则（重要）**：综合科目若子题出现「下線部N」，其所依据的大問引导会話/文章页必须作为材料页渲染（`answers:[]`），否则用户无法作答。本卷 p3=問1材料、p7=問2材料。复刻新套时务必先识别材料页。
- **页眉印刷页号**：卷内「総合科目-N」≠ PDF 页号。proto 用 `pageLabel:'総合科目-'` + `pageNumberOffset`（本卷 -2）；UI 同时标注「PDF pN」。
- localStorage key 与理科/数学同前缀但带 `humanities/` 不冲突：`baina-eju-math-paper-humanities/2024-1`。
- 缓存号当前 `20260614-sogo-2024-1-materials-fix`（两处：index.html 的 `eju.js?v=` 与 eju.js 内 `eju-scanned-data.json?v=`）。
- 复刻新套流程见 `SOGO_PLAN.md` 末「后续年份」；**必须用户明确指示才开做**。

---

## 1. 项目基础信息

| 项 | 值 |
|---|---|
| 本地目录 | `/Users/domin/Documents/Codex/2026-05-20/files-mentioned-by-the-user-2026/baina-tango` |
| 仓库 | `github.com/domin132012-hash/baina-tango` |
| 线上 | `https://baina-tango.pages.dev`（Cloudflare Pages，**push 到 main 自动部署**） |
| 技术栈 | 纯静态：`index.html` + `assets/eju.js`（无构建步骤） |
| 真题源 PDF | `~/Desktop/ eju高手/绿头EJU资料/EJU过去问/`（注意路径里 `Desktop/ eju高手` 有空格） |
| 后端 | Cloudflare Functions + Supabase（本轮试炼功能未用后端，纯前端 localStorage 存档） |

源 PDF 子目录：

- 数学1：`EJU文科数学（数学1）/`
- 数学2：`EJU理科数学（数学2）/`
- 理科（物理/化学/生物三科合卷）：`EJU理综/`
- 综合科目：`EJU文综/`

---

## 2. 代理开工制度

每个代理开工前必须先读：

1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `HANDOVER.md`
4. `AGENT_WORKLOG.md`
5. 相关计划文件（例如 `RIKA_PLAN.md`、`SOGO_PLAN.md`；不存在就先确认，不要猜）

做完后必须：

- 更新 `PROJECT_STATUS.md`。
- 如影响接手信息，更新 `HANDOVER.md`。
- 追加 `AGENT_WORKLOG.md`。
- 更新相关计划文件。
- commit + push，并汇报 commit hash、验证结果、剩余风险。

任务没有写进 GitHub 文档，不算完成。

---

## 3. 真题试炼架构

用户路径：`学习 tab → 真题试炼 → 选科目（日语/综合/理科/数学）→ 选年份回数 → 答题`。

- 套卷列表由 `assets/eju-scanned-data.json` 的 `sets[]` 驱动。
- `subject` 取值：`math1` / `math2` / `humanities` / `science`。
- 点击某套 → `renderEjuScannedSet(subject,setId)`（`assets/eju.js`）→ 按 key=`subject/setId` 路由：
  - 命中 `EJU_MATH_PAPER_PROTOTYPES` → 数学卷视图（填空答案框）。
  - 命中 `EJU_RIKA_PROTOTYPES` → 理科卷视图（单选 + 判分）。
  - 综合科目 MVP 预计新增 `EJU_SOGO_PROTOTYPES` 或同类结构。
  - 都不命中时，旧逻辑会进入 OCR 文本浏览；后续建议改为未部署年份灰色「建设中」。
- 图片路径：`assets/eju-media/{subject}/{setId}/page-NNN.png`。

---

## 4. 已完成并上线

### 数学

- 数学2：早期已完成。
- 数学1 全 12 套：commit `b3f37b3`，缓存号 `20260613-math1-all`。
- 数学1套数：2018-1、2018-2、2019-1、2020-2、2021-1、2021-2、2022-1、2022-2、2023-1、2023-2、2024-1、2025-1。
- 2024-1 特殊：双课程卷，只取数学1对应的コース1页。

### 理科

| 套 | commit | 状态 | 备注 |
|---|---|---|---|
| 2023-1 | `a8e5f9b` / `a7f2925` / v2修订 | ✅ 上线 | 第一套样板，后续修过化学错位、生物裁顶、页导航、物理答案 bug |
| 2023-2 | `feccfcc` | ✅ 上线 | 同时修复 2023-1 物理 no16/17/18 答案错位 |
| 2022-1 | `e90b3f2` | ✅ 上线 | 物理 no9 题干+选项续页拼接，opts=8 |
| 2022-2 | `3b9bb65` | ✅ 上线 | 化学双题6页，生物問4/問15双答 |
| 2021-1 | `d57a747` | ✅ 上线 | 2个前置说明页导致页码偏移；生物問12双答 |
| 2021-2 | `ef7c68b` | ✅ 上线 | 化学双题6页；生物問10双答 |

理科 2021/2022/2023 的答案均来自独立官方正解表，并按 8x 分段读取确认。

---

## 5. 当前方向：综合科目 2024 MVP

用户已经把综合科目 2024 MVP 交给 Claude。下一位代理不要同时改 `assets/eju.js`，除非已经确认 Claude 完成并合并/推送。

综合科目本地 PDF 目录：

```text
/Users/domin/Desktop/ eju高手/绿头EJU资料/EJU过去问/EJU文综/
```

先做最新一套：

```text
/Users/domin/Desktop/ eju高手/绿头EJU资料/EJU过去问/EJU文综/2024令和6年综合科目.pdf
```

原则：

- 只跑 2024 一套 MVP，不批量做旧年份。
- 必须确认答案/正解表在 PDF 哪一页，不允许猜。
- 答案必须 8x 分段读取。
- 逐题确认 `no/page/opts/ans`，不要默认全部 4 択。
- 若新增综合科目 proto，注意不要和数学/理科 localStorage 冲突。

---

## 6. 重要坑

1. **`index.html` 只能用 Python 字节操作改，禁止直接 Edit。** 通常只改缓存号。
   ```python
   b=open('index.html','rb').read(); old=b'eju.js?v=旧'; new=b'eju.js?v=新'
   assert b.count(old)==1
   open('index.html','wb').write(b.replace(old,new))
   ```
2. **缓存号要同步改两处**：`index.html` 里的 `eju.js?v=` 和 `assets/eju.js` 里的 `eju-scanned-data.json?v=`。
3. 理科 PDF 多为纯图像无文本层，选项数和题页必须人工读图。
4. 每套 PDF 页码体系不同，不能套用上一套。
5. 有独立 `XXXX理科答案.pdf` 的年份用独立正解表；没有的年份（2018-2020、2024 等）答案通常在试卷最后一页，但必须先翻卷尾确认。
6. 多代理并行时，`assets/eju.js` 是最高冲突点。先 pull/rebase，再开工。
7. Claude_Preview 截图可能被登录/欢迎弹窗遮挡；验证以 DOM eval / 功能结果为准，截图只是辅助。

---

## 7. 下一步建议

1. 等 Claude 完成综合科目 2024 MVP 后，先验收：能作答、能保存、能採点、官方答案满分、线上缓存号正确。
2. 再让 Codex 做「未部署年份灰色 + 点击弹建设中」UI，避免现在撞 `assets/eju.js`。
3. 综合 2024 稳定后，再决定继续综合旧年份还是回头做理科剩余 6 套。

---

## 8. 关键文件地图

| 文件 | 作用 |
|---|---|
| `AGENTS.md` | 代理开工规则、桥工具规则、交接制度 |
| `AGENT_WORKLOG.md` | 每次代理工作流水账 |
| `PROJECT_STATUS.md` | 当前真实进度 |
| `HANDOVER.md` | 完整交接文档 |
| `assets/eju.js` | 真题试炼主要前端逻辑和 proto 数据 |
| `assets/eju-scanned-data.json` | 扫描题库套卷列表 |
| `assets/eju-media/` | 渲染后的题图资源 |
| `scripts/rika_render_set.py` | 理科渲染脚本，可参考但不要无脑套综合科目 |
