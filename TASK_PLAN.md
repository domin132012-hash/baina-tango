# TASK_PLAN.md — 综合科目 2024 MVP ✅ 已完成

> 主线变更（2026-06-14）：暂停理科剩余 6 套，转做「综合科目/総合科目」真题试炼，先跑通 2024 一套 MVP。
> 计划详见 `SOGO_PLAN.md`。完成情况见 `AGENT_WORKLOG.md`。

## 阶段一：暂停理科 + 文档
- [x] SOGO_PLAN.md 已存在并记录 2024-1 完整采集数据
- [x] 更新 PROJECT_STATUS.md / HANDOVER.md / AGENT_WORKLOG.md（本轮）

## 阶段四：渲染 PDF
- [x] dump PDF 结构（32页；题目页3-31；封面p1/空白p2；正解表p32；跨页 p8-9、p22-23）
- [x] 新建 scripts/sogo_render_set.py
- [x] 渲染 assets/eju-media/humanities/2024-1/page-NNN.png（25 张）

## 阶段五：读答案（8x 分段，已核验非猜测）
- [x] 8x 渲染 p32 正解表，分段读左右两列 + p31 末页确认作答番号 1-38
- [x] 答案序列(38) 全 1-4（全 4択）：4,4,3,2,3,2,4,4,1,3,1,1,2,4,1,3,1,2,2,2,3,3,1,4,3,2,4,1,1,2,3,4,1,2,3,1,3,4

## 阶段六：写 proto + 接线
- [x] eju.js 新增 EJU_SOGO_PROTOTYPES['humanities/2024-1']（38 题，全 opts:4）
- [x] 新增 ejuRikaProtoFor 并替换 4 处直接查表 + renderEjuRikaPractice
- [x] renderEjuScannedSet 加 SOGO 路由（ejuRikaProtoFor 命中）
- [x] ejuRenderRikaView：pageLabel='総合-' 去理科硬编码 + 单科目隐藏切换条
- [x] runEjuTests 加综合科目断言（38题/4択/番号连续/25屏）

## 阶段七：缓存号 + 验证
- [x] bump 缓存号两处 → 20260614-sogo-2024-1（index.html 用 Python 字节替换）
- [x] node --check assets/eju.js + runEjuTests 自检 0 失败
- [x] preview 验证：进入综合科目练习（非OCR浏览）/题图/单选保存/採点/满分38-38/错一题37-38
- [x] 题图全 25/25 200，控制台无报错

## 阶段八：提交
- [x] commit + push: feat(eju): add humanities 2024 practice MVP
