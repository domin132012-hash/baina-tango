# baina-tango 项目进度

## 最近完成（数学2 全12套真题试炼）

把数学2剩余10套全部做成与 2024-1/2021-1 一致的完整可练样板。现数学2 共 **12 套全部可练**（2018-1/-2、2019-1、2020-2、2021-1/-2、2022-1/-2、2023-1/-2、2024-1、2025-1）。

### 方法
- 渲染 PDF @ DPI 112 → crop 脚本（与 2024-1 一致）
- 答案框逐页人工对图标定（排除灰色参照框、识别合框如 JK/NOP）
- 答案 key = 源页:答案框

### 改动
- `assets/eju.js` — `EJU_MATH_PAPER_PROTOTYPES` 新增 10 套 proto（共 12 套）
- `index.html` — 缓存号 → `20260613-math2-all`
- `assets/eju-media/math2/{10套}/` — 新增约 110 张 PNG（math2 图片总计 30MB）

### OCR 修正（重要）
逐页核对时发现 OCR 的 containsQuestions 有遗漏，已靠图片人工补正：
- **2020-2**（OCR fail）：问题页应为 [3,5,7,8,9,11,13,14]，OCR 只给了 [3,9,11,13,14]
- **2023-2**：问题页补加 page 14（问IV 续页，OCR 漏标）
- **2025-1**：问题页补加 page 3（问I 续页，OCR 漏标）

### 本地验收（Claude Preview 真实浏览器，全部通过）
- ✅ 12 套全部出现在 数学2 列表（2018-2025）
- ✅ 每套每页答案框 DOM 与 proto 完全一致（labelsMatch: true）
- ✅ 所有页图片真实加载（imgFail: 0）
- ✅ 进入试卷底部导航隐藏，返回恢复
- ✅ node --check 通过，index.html 无弯引号

### 需人工复核（标定时偏严，建议抽查）
- **2022-2 page 9**：底部「[V] はマークしない」注记与 VW/XYZ 答案框并存，已按数式中的白框采纳 VW/XYZ（判断该注记指解答用纸的「コース」栏，非答案框 V）

### 待办
- 是否部署（commit/push 触发 Cloudflare）
- 其他科目（数学1/综合/理科）尚未做

---

## 最近完成（math2/2021-1 第二样板）

以 math2/2024-1 为模板，完成数学2 2021年第1回完整可练样板。**仅本地验证，未部署。**

### 关键认知
- 元PDF是官方清晰排版PDF（非扫描），答案框 A〜N 已印刷在页面上 → 渲染即可，答案框靠人工对照图片标定
- 渲染方式：PyMuPDF @ **DPI 112** → `scripts/crop_math_paper_images.py`（threshold=245, padding=34），与 2024-1 一致
- 元PDF：`~/Desktop/ eju高手/绿头EJU资料/EJU过去问/EJU理科数学（数学2）/2021令和3年第1回数学2.pdf`（16页）

### 改动文件
- `assets/eju.js` — `EJU_MATH_PAPER_PROTOTYPES` 新增 `math2/2021-1` proto；scanned-data 缓存号 → `20260613-math2-2021-1`
- `index.html` — eju.js 缓存号 → `20260613-math2-2021-1`（Python 字节操作）
- `assets/eju-media/math2/2021-1/` — 新增 16 张 PNG（page-001〜016）

### 2021-1 问题页 & 答案框（人工标定，已逐页对图核对）
- source page 4（问I-问1）：A BC DE F G H I JK
- source page 6（问I-问2）：L M N O P QR ST UV WX
- source page 8（问II-问1）：A B C D E F G H I J K L M
- source page 10（问II-问2）：N O P Q R S T U V W X Y
- source page 12（问III）：A B CD EF G H I J KL M NO P QR ST U V WX Y
- source page 14（问IV）：A B C D E F G H I J K L M N O P Q R
- 已排除灰色参照框（如 page6 第二个 UV、page10 i sin 的 O/P、page12 「H<I」与重复 J）
- 答案 key 格式：`源页:答案框`（如 `4:A`、`6:L`），跨大题不冲突

### 本地验收（Claude Preview + 真实浏览器，全部通过）
- ✅ 真题试炼→数学→数学2→2021年第1回 可进入
- ✅ 6 页答案框 DOM 渲染与 proto 完全一致，key=源页:答案框
- ✅ 6 页图片真实加载（naturalWidth>0，无 404）
- ✅ 输入答案保存到 localStorage（key `baina-eju-math-paper-math2/2021-1`），重渲染后保留
- ✅ 进入试卷底部导航隐藏（nav display:none），返回套卷列表后恢复（display:grid）
- ✅ node --check 通过，index.html 无弯引号

### 待办
- 是否 commit（未 commit，留待你审阅 diff）；**不要 push（=部署），用户已明确**
- 其余 10 套（2018-1/-2、2019-1、2020-2、2021-2、2022-1/-2、2023-1/-2、2025-1）尚未做，按需逐套推进

---

## 最近完成（2026-06-10）

### 本次完成 — EJU 真题试炼 Phase 1

所有文件均已创建并通过语法验证，**待用户手动在 Supabase 建表并插入题目数据后即可运行**。

#### 新建文件
1. ✅ `assets/eju.js` — 前端训练模块（约 900 行）
   - Hub 渲染、年份/回数选择、题目列表
   - 四阶段训练状态机（structure→questionRead→locate→answer）
   - SVG 圆形计时器（warn/danger 颜色变化）
   - 后端提交校验、结果页、历史记录
2. ✅ `functions/api/eju-categories.js` — 科目列表（无需登录）
3. ✅ `functions/api/eju-reading-sets.js` — 年份/回数列表（无需登录）
4. ✅ `functions/api/eju-reading-list.js` — 题目列表（需登录，含 practiced/isWrong 状态）
5. ✅ `functions/api/eju-reading-question.js` — 单题详情（需登录，不含答案）
6. ✅ `functions/api/eju-reading-submit.js` — 提交校验（POST，后端读 eju_answers，不返回前端）
7. ✅ `functions/api/eju-reading-history.js` — 训练历史（GET，最近50条）

#### index.html 修改（Python 字节操作，8处，全部通过验证）
- 3-1: `defaultState()` 追加 `ejuSession:{}`
- 3-2: `migrateState()` 追加 ejuSession 迁移
- 3-3: 追加 EJU CSS（约 90 行，含 cat-grid/phase-bar/timer/option/result 样式）
- 3-4: 替换 view-exam-trial + 追加 6 个新 section（共 7 个视图）
- 3-5: 在 `</body>` 前追加 `<script src="./assets/eju.js">`
- 3-6: `parentNavView()` 追加所有 eju-* 视图 → 'study' tab
- 3-7: `switchView()` 开头插入 `ejuStopTimer()` 防计时器泄漏
- 3-8: `openExamTrialBtn` 追加 `initEjuHub()` 调用

### 修改文件清单
- `index.html` — 8处修改（Python 字节操作）
- `assets/eju.js` — 新建
- `functions/api/eju-categories.js` — 新建
- `functions/api/eju-reading-sets.js` — 新建
- `functions/api/eju-reading-list.js` — 新建
- `functions/api/eju-reading-question.js` — 新建
- `functions/api/eju-reading-submit.js` — 新建
- `functions/api/eju-reading-history.js` — 新建

### 用户需手动完成（Phase 1 生效前提）
1. **Supabase SQL Editor 运行建表 SQL**：
   ```sql
   -- eju_questions（题目本体，普通用户只读）
   CREATE TABLE eju_questions (
     id TEXT PRIMARY KEY,
     category TEXT NOT NULL,
     skill TEXT NOT NULL,
     year INTEGER NOT NULL,
     session INTEGER NOT NULL,
     question_no INTEGER,
     passage TEXT NOT NULL,
     question TEXT NOT NULL,
     options_json TEXT NOT NULL,
     source TEXT,
     difficulty TEXT DEFAULT 'normal',
     tags_json TEXT DEFAULT '[]',
     version INTEGER DEFAULT 1,
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   CREATE INDEX ON eju_questions(year, session, skill);

   -- eju_answers（答案，仅 service role 可读）
   CREATE TABLE eju_answers (
     question_id TEXT PRIMARY KEY REFERENCES eju_questions(id),
     answer TEXT NOT NULL,
     explanation TEXT DEFAULT '',
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   ALTER TABLE eju_answers ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "service only" ON eju_answers USING (false);

   -- eju_user_records（训练记录）
   CREATE TABLE eju_user_records (
     id TEXT PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id),
     question_id TEXT NOT NULL,
     category TEXT, skill TEXT,
     year INTEGER, session INTEGER,
     timestamp TIMESTAMPTZ DEFAULT now(),
     phases_json TEXT,
     selected_answer TEXT,
     is_correct BOOLEAN,
     total_elapsed INTEGER,
     ai_analysis_json TEXT
   );
   CREATE INDEX ON eju_user_records(user_id, question_id);
   ALTER TABLE eju_user_records ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "own records" ON eju_user_records
     USING (user_id = auth.uid())
     WITH CHECK (user_id = auth.uid());

   -- eju_wrong_book（错题本）
   CREATE TABLE eju_wrong_book (
     id TEXT PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id),
     question_id TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT now(),
     last_practiced_at TIMESTAMPTZ,
     wrong_count INTEGER DEFAULT 1,
     resolved BOOLEAN DEFAULT false,
     UNIQUE(user_id, question_id)
   );
   ALTER TABLE eju_wrong_book ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "own wrong book" ON eju_wrong_book
     USING (user_id = auth.uid())
     WITH CHECK (user_id = auth.uid());
   ```

2. **向 eju_questions + eju_answers 插入初始题目数据**
   - ID 格式示例：`2024-1-r-001`（year-session-r-序号）
   - options_json 格式：`{"1":"选项1","2":"选项2","3":"选项3","4":"选项4"}`
   - answer 为 "1"~"4" 之一

3. **确认 Cloudflare Dashboard → Variables and Secrets 已有**：
   - `SUPABASE_URL`（已有）
   - `SUPABASE_SERVICE_ROLE_KEY`（已有）

### Phase 1 验收标准
1. 真题试炼 hub 显示 4 科目卡，只有日语可点
2. 日语页显示阅读/听力/写作，只有阅读可点
3. 阅读选择页显示年份/回数（从数据库加载）
4. 点某年某回 → 题目列表（含练习状态）
5. 开始训练 → 四阶段依次，计时器正常
6. 超时自动进入下一阶段
7. 提交 → 后端校验 → 结果页：正误 + 正确答案 + 各阶段耗时
8. 训练记录写入 eju_user_records（Supabase 控制台验证）
9. 历史记录页可查
10. 未登录访问 → 提示登录，不报错
11. 切 tab 再返回 → 计时器不重启

## 待处理

### Phase 2（后续）
- 统计页：答题正确率、按年份回数统计
- 错题本页面（目前后端已维护，前端未展示）

### Phase 3（后续）
- `functions/api/eju-analyze.js` — DeepSeek AI 复盘
- 结果页追加 AI 分析面板

### Phase 4（后续）
- `admin.html` + `functions/api/eju-admin-upload.js` — 管理员批量上传题目

### Stripe 合规（老任务，待跟进）
- 更新 Stripe Dashboard 网站 URL → `https://baina-tango.pages.dev`
- 回复 Larry 邮件（草稿见旧版 PROJECT_STATUS.md）

## 已知问题 / 风险
- index.html 中 Edit 工具写 HTML 属性会产生弯引号 bug → 后续修改必须用 Python 字节操作
- eju.js 依赖全局变量 `supabaseClient`（index.html 已初始化）和 `apiUrl()`（index.html line 451）
- eju-reading-sets.js 未做 auth，任何人可查年份列表（设计如此）

## 下次继续
1. 用户建表+插数据后，部署测试 Phase 1 验收标准
2. 如有问题，先检查 Cloudflare Functions 日志（Dashboard → Functions → Logs）
3. 问题修复后考虑 Phase 2（统计/错题本）
