# 交接文档 — EJU 真题试炼（数学 + 理科）

> 本文件面向**完全没有上下文的接手人/代理**。读完即可接手。
> 最后更新：2026-06-14。配套阅读：`PROJECT_STATUS.md`（进度）、`AGENTS.md`（项目规则）。

---

## 0. 一句话概括

百纳日语（baina-tango）是一个 EJU 留考备考的纯静态网页 App。本轮工作是给它做"真题试炼"功能：把历年 EJU 真题 PDF 渲染成图片，配上答题/判分交互。**数学已全部完成并上线；理科做了 2023 第1回 一套样板并上线**。

---

## 1. 项目基础信息

| 项 | 值 |
|---|---|
| 本地目录 | `/Users/domin/Documents/Codex/2026-05-20/files-mentioned-by-the-user-2026/baina-tango` |
| 仓库 | `github.com/domin132012-hash/baina-tango` |
| 线上 | `https://baina-tango.pages.dev`（Cloudflare Pages，**push 到 main 自动部署**） |
| 技术栈 | 纯静态：`index.html` + `assets/eju.js`（无构建步骤） |
| 真题源 PDF | `~/Desktop/ eju高手/绿头EJU资料/EJU过去问/`（注意 "eju高手" 前有个空格） |
| 后端 | Cloudflare Functions + Supabase（**本轮试炼功能未用后端，纯前端 localStorage 存档**） |

源 PDF 子目录：
- 数学1：`EJU文科数学（数学1）/`
- 数学2：`EJU理科数学（数学2）/`
- 理科（物理/化学/生物三科合卷）：`EJU理综/`（63 个 PDF，2002–2024）

---

## 2. 真题试炼是怎么工作的（架构）

用户路径：`学习 tab → 真题试炼 → 选科目（日语/综合/理科/数学）→ 选年份回数 → 答题`。

- **套卷列表**由 `assets/eju-scanned-data.json` 的 `sets[]` 驱动（每条 `{subject,setId,year,session,pageCount,status,...}`）。`subject` 取值：`math1`/`math2`/`humanities`/`science`。
- 点击某套 → `renderEjuScannedSet(subject,setId)`（eju.js）→ 按 key=`subject/setId` 路由：
  - 命中 `EJU_MATH_PAPER_PROTOTYPES` → 数学卷视图（填空答案框）
  - 命中 `EJU_RIKA_PROTOTYPES` → 理科卷视图（单选+判分）
  - 都不命中 → 通用 OCR 文本浏览视图（旧的）
- **图片**：`assets/eju-media/{subject}/{setId}/page-NNN.png`，NNN = 源页号（数学是试卷页码，理科是右上角"理科-N"）。
- 渲染管线：PyMuPDF(fitz) @ **DPI 112** → `scripts/crop_math_paper_images.py` 裁白边。DPI 112 是当初为匹配已有图片尺寸逆向试出来的，别改。

### 数学 vs 理科的本质区别
| | 数学 | 理科 |
|---|---|---|
| 卷子 | 单科，清晰排版 PDF（可 OCR） | 物理+化学+生物三科合卷，**纯图像 PDF 无文本层** |
| 答题 | 填空答案框 A,B,C…（key=`源页:答案框`） | マークシート单选 ①②③④（key=`科目id:解答番号`） |
| 答案来源 | 标定时只标框，不判分 | 取自官方正解表，做对错判分 |

---

## 3. 已完成并已上线的工作（4 个 commit）

> 全部已 push 到 main 并经线上 curl 验证。

### ① 数学1 全 12 套 — commit `b3f37b3`
- `EJU_MATH_PAPER_PROTOTYPES` 新增 12 套 math1：2018-1/-2、2019-1、2020-2、2021-1/-2、2022-1/-2、2023-1/-2、2024-1、2025-1
- 共 885 个答案框，172 张 PNG
- **2024-1 特殊**：源 PDF 是 31 页双课程卷（コース1+コース2），math1 只取 コース1 页 `[4,6,8,10,12,14,15]`
- （数学2 的 12 套是更早就做好的，见 commit `036e4d6` 等）

### ② 理科 2023 第1回 样板 — commit `a8e5f9b`
- `EJU_RIKA_PROTOTYPES['science/2023-1']`：物理19 + 化学20 + 生物18 = **57 题**
- 新单选 UI：`renderEjuRikaPractice` / `ejuRenderRikaView`（科目切换条 + 题面图 + 每个解答番号一行 ①②③④ 圆钮 + 採点判分红绿标记 + 得分）
- 答案全部取自**官方正解表** `2023令和5年第1回理科答案.pdf`（标定时只人工补"选项数 + 所在源页"）
- 三科页范围（源页"理科-N"）：物理 2–20、化学 24–41、生物 43–58

### ③ 理科样板修订（用户第一轮反馈）— commit `a7f2925`
- **化学题号错位修复**：理科-23（常数表/周期表）从翻页里移出，改成可折叠参考资料（proto 字段 `refPage`），化学题目页从 問1=页1 开始
- **生物 page-043 重裁**：裁掉顶部「解答科目記入方法」说明框，只留問1
- **化学 page-023 重裁**：折叠区只留常数表+周期表
- 缓存号 → `20260613-rika-2023-1b`（**当前线上版本**）

### ④ docs — commit `295ebe2`

**当前线上缓存号 = `20260613-rika-2023-1b`，已确认生效。**

---

## 4. ⚠️ 坑 & 容易出问题的地方（务必先读）

1. **`index.html` 只能用 Python 字节操作改，禁止 Edit 工具**。原因：文件里有弯引号(’)，Edit 的精确匹配会踩坑。改它只做一件事——bump 缓存号。`assets/eju.js` 可以正常用 Edit。
   ```python
   # 改缓存号的标准写法
   b=open('index.html','rb').read(); old=b'eju.js?v=旧'; new=b'eju.js?v=新'
   assert b.count(old)==1; open('index.html','wb').write(b.replace(old,new))
   ```
2. **缓存号要同步改两处**：`index.html` 里的 `eju.js?v=` 和 `eju.js` 里的 `eju-scanned-data.json?v=`。改了任何资源都要 bump，否则浏览器/CDN 用旧缓存。
3. **理科 PDF 是纯图像无文本层** → 没有 OCR 数据，每道题的"选项数 + 所在页"必须**人工读图**标定。答案则查正解表，不用自己解题。
4. **每套 PDF 的分科页码不一样**！2024 理科是 物理1-21/化学23-39/生物41-56，2023 是 物理1-21/化学23-41/生物43-58。**做新套前必须先渲染封面页码表确认**，不能套用别套的页码。（数学 2024-1 也有类似的 31 页双课程坑。）
5. **答案来源规则**（用户确认）：有独立 `XXXX理科答案.pdf` 的（2021/2022/2023 各两回 + 2002-04）用它；**没有的年份（2018-2020、2024 等），答案在试卷 PDF 的最后一页**——做之前要先翻到最后一页确认确实是正解表。
6. **CDN 最终一致性**：push 后 curl 验证缓存号，偶尔某个边缘节点还没更新会"假阴性"。多 curl 几次或看 `index.html` 末尾字节，别被一次 grep 空结果骗了。
7. **Claude_Preview 截图会被登录/欢迎弹窗遮挡**。验证以 DOM eval 结果为准（authoritative），截图是辅助。可用 JS 把 `position:fixed` 的弹窗 `display:none` 再截图。
8. **理科存档复用了数学的 localStorage 前缀** `ejuMathPaperStorageKey`（`baina-eju-math-paper-{科目/套}`）。理科 key=`science/2023-1`。测试时记得清掉，别污染。
9. 本地预览：`~/.claude/launch.json` 里配了 `baina-static`（python http.server，端口 8731，`--directory` 指向项目）。`preview_start name=baina-static`。

---

## 5. 🔜 未来要做的工作（按优先级）

### A. 【最高优先 / 被打断未做】理科 2023-1 样板的 3 个体验问题
> 用户在最后一轮提出，我**只建了清单和做了切割线分析，没改任何代码/图，没部署**。这部分**不算已完成**，需要从头做。详见 `task_plan.md`（v2）。三个问题：

1. **导航紫色数字应=实际解答番号**：现在导航按钮是页序号(1,2,3…)，但理科一页可能不是第N题。比如生物理科-45 是問3、解答番号「4」，按钮却显示"3"。需求：导航按"題"走，按钮显示**解答番号**（問2 占番号2、3 显示成 "2·3"）。
2. **题目页底部多余空白要裁掉**：判断题等内容少的页，底部一大片空白没裁干净。`crop_math_paper_images.py` 对这种页留了底部空白（footer 去除逻辑没兜住）。需要更激进地裁到最后一行实质内容。
3. **一页两题被合并显示**：有些源页一页印了两道题，现在两题选项挤一屏。需要一题一屏。涉及的两题页：**生物 理科-45（問3 番号4 + 問4 番号5）、化学 理科-34（問11+問12）、化学 理科-35（問13+問14）**。

**建议方案**（已分析，未实施）：
- proto 由"按解答番号扁平列表"重构为"按題(problem)分组"：`problem = {qno, imgName, answers:[{no,opts,ans}]}`。注意区分：問2 是**一题两空**(番号2,3 要一起显示)，問3+問4 是**两道题**(要拆开)。
- 导航按 problem 走，按钮文字=解答番号。
- 三个两题页切成两张图（理科-45/34/35），各题独立图。切割线我已分析过投影（见下方数据），但**未最终确认未切**。
- 重裁所有理科页去底部空白。
- 改完 bump 缓存号、本地 Claude_Preview 验证（重点核对题号↔题面、无空白、无合并）、部署、线上确认。

### B. 理科其它年份铺开
- 优先**有独立正解表**的：2023第2回、2022两回、2021两回（答案现成最稳）。
- 再做无独立答案的（2018-2020、2024…）：答案在试卷 PDF 最后一页，做前先验证。
- 每套都要：读封面页码表 → 渲染裁剪 → 逐页标定（选项数+答案查正解表）→ 加 proto → 注意分科页码因套而异。

### C.（可选）给数学卷补判分
- 同一份理科正解表里也含**数学答案**（コース1/コース2，解答番号 A,B,C…）。以后可给已上线的数学卷加自动判分。

---

## 6. 关键文件地图

| 文件 | 作用 |
|---|---|
| `index.html` | 主页面。**只 Python 字节操作改缓存号** |
| `assets/eju.js` | 全部 EJU 前端逻辑。`EJU_MATH_PAPER_PROTOTYPES`(数学)、`EJU_RIKA_PROTOTYPES`(理科)、各渲染函数、`runEjuTests()` |
| `assets/eju-scanned-data.json` | 套卷列表数据源（science 已注册 12 套，含未做的） |
| `assets/eju-media/{subject}/{setId}/page-NNN.png` | 题面图 |
| `scripts/crop_math_paper_images.py` | 裁白边脚本（DPI 112 渲染后用） |
| `PROJECT_STATUS.md` | 进度（每次任务结束必更新） |
| `AGENTS.md` | 项目长期规则 |
| `task_plan.md` | 当前是被打断的 v2 临时清单（属于"未来工作 A"） |

理科 proto 关键函数（eju.js）：`renderEjuRikaPractice`、`ejuRenderRikaView`、`ejuRikaPick`、`ejuRikaGrade`、`ejuRikaSubjectScore`、`ejuRikaGetSubject`。路由分支在 `renderEjuScannedSet` 里（math 检查之后加的 rika 分支）。

---

## 7. 理科 2023-1 完整答案数据（已从官方正解表读出，可直接复用）

格式 `(解答番号: opts选项数, ans正解)`：

- **物理(19)**：1:5,2 / 2:6,5 / 3:4,3 / 4:5,4 / 5:5,4 / 6:6,4 / 7:6,1 / 8:5,3 / 9:6,2 / 10:6,4 / 11:4,2 / 12:5,5 / 13:8,1 / 14:6,6 / 15:8,6 / 16:6,1 / 17:8,4 / 18:6,1 / 19:4,1
- **化学(20)**：1:6,5 / 2:7,4 / 3:6,6 / 4:6,6 / 5:6,2 / 6:4,4 / 7:6,3 / 8:6,5 / 9:6,2 / 10:6,3 / 11:6,5 / 12:6,1 / 13:5,1 / 14:5,3 / 15:6,6 / 16:5,3 / 17:6,1 / 18:6,5 / 19:6,3 / 20:6,4
- **生物(18)**：1:6,3 / 2:6,3 / 3:6,3 / 4:6,5 / 5:6,5 / 6:6,5 / 7:4,3 / 8:6,4 / 9:5,4 / 10:6,6 / 11:8,3 / 12:8,2 / 13:6,4 / 14:6,6 / 15:5,4 / 16:6,1 / 17:5,5 / 18:4,1

题号↔源页映射见 eju.js 里 `EJU_RIKA_PROTOTYPES['science/2023-1']` 的 questions[]。生物分页：43問1 / 44問2(番号2,3) / 45問3(4)+問4(5) / 46問5 / 47問6 / 48問7 / … / 58問17。

---

## 8. 标准部署流程（每次改完）

```
1. node --check assets/eju.js          # 语法
2. 本地验证：preview_start baina-static → DOM eval 核对 → 截图
3. bump 缓存号（index.html + eju.js 两处）
4. git add → commit → git push origin main
5. 等 CF Pages 构建，curl 线上确认缓存号 + 抽查图片 200
6. 更新 PROJECT_STATUS.md
```
