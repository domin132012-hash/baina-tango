# 百纳日语消息通知后台使用说明

本功能把消息通知从 `index.html` 里的固定文字，改成从 Cloudflare KV 读取的远程通知。以后发通知、下线通知，不需要改仓库代码，也不需要重新部署。

## 1. 需要先在 Cloudflare 配置两样东西

### KV 绑定

在 Cloudflare Pages 项目里配置 KV namespace binding：

- Binding name：`NOTICES_KV`
- 存储键：`notices:all`
- 存储格式：JSON 数组

### 管理员 Token

在 Cloudflare Pages 环境变量里配置：

- Variable name：`ADMIN_NOTICE_TOKEN`
- Value：自己生成一串长密码，例如 32 位以上随机字符串
- Production 和 Preview 都建议配置

没有 `ADMIN_NOTICE_TOKEN` 时，管理接口会返回 401。
没有 `NOTICES_KV` 时，公开读取接口会返回空通知，管理接口会返回 500 提示绑定缺失。

## 2. 可视化后台地址

上线后打开：

```text
https://baina-tango.pages.dev/admin/notices.html
```

使用方式：

1. 输入 `ADMIN_NOTICE_TOKEN`。
2. 点「保存到本机」。
3. 点「刷新通知」。
4. 在表单里写标题、内容、时间和开关。
5. 点「保存通知」。
6. 用普通用户页面刷新百纳日语，检查通知是否显示。

## 3. 字段说明

| 字段 | 意思 |
|---|---|
| `id` | 通知唯一编号，新增时可自动生成 |
| `type` | 通知类型，用于图标：`info` / `version` / `tip` / `warning` / `maintenance` / `event` / `success` |
| `title` | 通知标题 |
| `body` | 通知正文 |
| `enabled` | 是否启用。禁用后用户端不显示 |
| `priority` | 优先级，数字越大越靠前 |
| `startAt` | 开始显示时间，可空 |
| `endAt` | 结束显示时间，可空 |
| `dismissible` | 用户是否可以点 × 关闭单条通知 |
| `showOnce` | 用户关闭后是否不再显示 |

## 4. 最推荐的操作方式

### 发一条普通版本通知

- `type`：`version`
- `title`：`版本更新通知`
- `body`：写更新内容
- `enabled`：启用
- `priority`：`5`
- `dismissible`：可以关闭
- `showOnce`：关闭后不再显示

### 发一条维护通知

- `type`：`maintenance`
- `title`：`维护通知`
- `body`：写维护时间和影响范围
- `enabled`：启用
- `priority`：`10`
- `showOnce`：如果很重要，可以设为每次都可再次显示

### 下线通知

最推荐做法是「禁用」，不要直接删除。

后台里找到那条通知，点「禁用」。这样用户端立刻不显示，但历史还在，方便以后恢复或查问题。

### 删除通知

只有测试通知或者彻底不要的通知才删除。

## 5. 命令行管理方式

### 查询所有通知

```bash
curl "https://baina-tango.pages.dev/api/admin/notices" \
  -H "Authorization: Bearer 你的ADMIN_NOTICE_TOKEN"
```

### 新增通知

```bash
curl -X POST "https://baina-tango.pages.dev/api/admin/notices" \
  -H "Authorization: Bearer 你的ADMIN_NOTICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "version",
    "title": "版本更新通知",
    "body": "本次更新优化了通知系统，以后公告可以远程发布。",
    "enabled": true,
    "priority": 10,
    "startAt": null,
    "endAt": null,
    "dismissible": true,
    "showOnce": true
  }'
```

### 禁用通知

```bash
curl -X PUT "https://baina-tango.pages.dev/api/admin/notices" \
  -H "Authorization: Bearer 你的ADMIN_NOTICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"通知id","enabled":false}'
```

### 删除通知

```bash
curl -X DELETE "https://baina-tango.pages.dev/api/admin/notices?id=通知id" \
  -H "Authorization: Bearer 你的ADMIN_NOTICE_TOKEN"
```

## 6. 如果用户端没显示通知，检查这里

1. Cloudflare Pages 是否部署完成。
2. `NOTICES_KV` 是否绑定到 Pages Functions。
3. `ADMIN_NOTICE_TOKEN` 是否配置正确。
4. 通知是否 `enabled=true`。
5. 当前时间是否在 `startAt` / `endAt` 范围内。
6. 用户是否已经点过关闭，且 `showOnce=true`。
7. 浏览器控制台里 `/api/notices` 是否返回 `{ notices: [...] }`。

## 7. 技术说明

- 用户端公开接口：`GET /api/notices`
- 管理接口：`GET/POST/PUT/DELETE /api/admin/notices`
- 存储方式：Cloudflare KV 单键 `notices:all`，值为 JSON 数组
- 前端模块：`assets/notices.js`
- 后台页面：`admin/notices.html`
- 注入方式：`functions/_middleware.js` 在 HTML 响应末尾注入 `assets/notices.js`

注意：当前实现用 Middleware 在运行时接管旧通知弹窗，避免直接大改 `index.html`。后续有本地仓库时，可以再按 `AGENTS.md` 规则用 Python 字节替换把旧硬编码通知块从 `index.html` 源码里彻底删掉。
