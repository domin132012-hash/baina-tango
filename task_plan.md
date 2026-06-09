# EJU Phase 1 任务清单

## 步骤 1 — Cloudflare Functions（6个）
- [x] functions/api/eju-categories.js
- [x] functions/api/eju-reading-sets.js
- [x] functions/api/eju-reading-list.js
- [x] functions/api/eju-reading-question.js
- [x] functions/api/eju-reading-submit.js
- [x] functions/api/eju-reading-history.js

## 步骤 2 — assets/eju.js（新建）
- [x] A. 全局变量
- [x] B. Hub 渲染（initEjuHub / renderEjuJapanese）
- [x] C. 选集/列表（loadEjuReadingSets / loadEjuReadingList）
- [x] D. 训练状态机（startEjuReadingTrain / renderEjuTrain / ejuAdvancePhase / ejuHandleSubmit / timer）
- [x] E. 结果页（renderEjuResult）
- [x] F. 历史记录（loadEjuHistory）
- [x] G. 辅助函数（ejuUUID / ejuGetToken / ejuFetch）

## 步骤 3 — index.html（Python 字节操作，8处）
- [x] 3-1: defaultState() 追加 ejuSession
- [x] 3-2: migrateState() 追加 ejuSession
- [x] 3-3: CSS 追加（eju-cat-grid / phase-bar / timer / passage / option 等）
- [x] 3-4: 替换 view-exam-trial + 追加 6 个新 section
- [x] 3-5: 追加 <script src="./assets/eju.js"> 标签
- [x] 3-6: parentNavView() 更新（所有 eju-* 视图 → study tab）
- [x] 3-7: switchView() 追加 ejuStopTimer()
- [x] 3-8: openExamTrialBtn 事件更新（追加 initEjuHub()）

## 步骤 4 — 验证
- [x] 验证 Python 修改无弯引号 bug
- [x] 验证所有 section 存在（7个视图均已注入）
- [x] 验证 JS 语法（eju.js + 6个 Function 全部通过 node --check）

## 步骤 5 — 收尾
- [x] 更新 PROJECT_STATUS.md
- [ ] git commit + push
