# Post-login Navigation Restructure

## New Five-tab Structure

The post-login bottom navigation is now:

- 学习
- 词库
- 首页
- 社区
- 我的

## Old-to-new Mapping

| Old location | New location | Status | Construction badge |
|---|---|---|---|
| 学习 / 真题试炼 / EJU | 学习 / EJU | Available | No |
| 学习 / 单词 / 新学词汇 | 词库 / 背词 / 新学词汇 | Available | No |
| 学习 / 单词 / 今日复习 | 词库 / 背词 / 今日复习 | Available | No |
| 新增 / 查词收藏 | 词库 / 查词 | Available | No |
| 新增 / 导入 / 导出 | 词库 / 导入导出 | Available | No |
| 管理 / 文件夹 / 单词列表 | 词库 / 词库管理 | Available | No |
| 首页 dashboard | 首页 | Available | No |
| 个人 / 头像 / 昵称 | 我的 | Available | No |
| 个人 / 邮箱登录 / 云端同步 | 我的 | Available | No |
| 个人 / 购买扩容 / AI 次数 / 购买记录 | 我的 | Available | No |
| 个人 / 兑换码 / 兑换记录 | 我的 / 奖励中心 and 兑换码 | Available | No |
| 个人 / 发音设置 / 账号设置 / 数据设置 | 我的 / 设置 | Available | No |
| 个人 / 软件使用说明 | 我的 / 软件使用说明 | Available | No |
| 个人 / 联系 / 加入我们 | 我的 / 联系 / 加入我们 | Available | No |

## Construction Features

The following entries are visible but explicitly marked as `建设中`:

- JLPT
- 口语
- 住房
- 大学专业
- 地域美食
- 大学合格记录
- 大学讨论
- 邀请制度
- 给开发者建议

These entries only show a construction toast. They do not call a backend and do not write user data.

## Preserved Functions

- Home dashboard, check-in calendar, task stats, and today review shortcut.
- EJU trial flow, Japanese/reading views, list, training, result, and history views.
- New-word learning and daily review queues.
- JMdict lookup and lookup collection.
- Manual import, file import, PDF/image preview import, article import, export backup, and quick single-word add.
- Folder overview, word search, edit, and delete.
- Profile, cloud sync, avatar, nickname, purchase, purchase history, redemption, speech settings, account settings, data settings, help, and contact.

## EJU Deep Entry Status

PR #13 keeps EJU under `学习 -> EJU`, but the local static preview must not pretend every deep entry is fully backed by data.

| Entry | Current status | Local static preview behavior |
|---|---|---|
| `日本語 -> 読解` | Needs backend or local reading-set data | Shows `需要后端` and a friendly unavailable card instead of requesting `/api/eju-reading-sets` on `localhost:4173` |
| `日本語 -> 記述` | Available entry | Loads the existing `assets/eju-essay.js` module on demand and opens the essay home |
| `综合科目 -> 2024 第 1 回` | Available scanned paper | Shows the scan set list and opens the local `humanities/2024-1` question image |
| Other scanned-paper sets without local prototype/images | Construction/future data | Remain visible as `建设中` / unavailable instead of exposing raw missing-file errors |

The local UI must not display raw Python/HTML 404 text such as `DOCTYPE`, `Error response`, `Error code: 404`, `File not found`, or `Nothing matches the given URI`.

## Backend Work Deferred

These features need future backend or policy work before they can become real:

- Community posting, comments, image upload, moderation, reporting, messaging, and recommendation feeds.
- Invite code generation, invite entry, reward settlement, invite history, and anti-abuse logic.
- Developer feedback submission storage and routing.
- JLPT and speaking training content/data.
