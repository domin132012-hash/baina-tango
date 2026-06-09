# baina-tango 项目进度

## 最近完成（2026-05-25）

### 本次完成
1. ✅ 顶部定价区块已删除（index.html）
2. ✅ purchaseDetails 改为 `<div>` 常驻展开（不再折叠）—— 个人页直接可见
3. ✅ 修复 index.html 中弯引号 bug（166 处，Python 字节级替换）
4. ✅ 修复 onclick 箭头函数 `=>` 导致 HTML 解析中断
5. ✅ 新建 `/pricing.html` 独立双语定价页（日英）— 满足 Stripe 合规要求
   - URL: https://baina-tango.pages.dev/pricing
   - 无需登录即可访问
   - 包含全部 7 个产品（词库包 ×5 + AI 次数包 ×2）
   - 日英双语产品名称、价格、描述、支付政策

### 修改文件
- `index.html` — 删顶部 #pricing，purchaseDetails 改常驻展开
- `pricing.html` — 新建独立双语定价页（NEW）

### Git 提交记录
- `0c39e26` feat: 新增 /pricing 独立双语定价页（日英）供 Stripe 合规审核
- `92b1d1d` refactor: 删顶部定价区块，购买面板改为个人页常驻展开
- `3125339` fix+style: 修复弯引号 + 重设计定价区块排版

## 待处理（用户需手动操作）

### Stripe 合规（紧急，14天内）
1. **更新 Stripe Dashboard 网站 URL**
   - 登录 https://dashboard.stripe.com
   - 设置 → 账户设置 → 网站 → 填入 `https://baina-tango.pages.dev`

2. **回复 Larry（Stripe Support）邮件**（5月21日那封）
   - 回复内容见下方草稿

3. **查看 5月23日 Stripe 第二封邮件**
   - 上次截图中可见还有第二封，内容未查看，需确认是否有额外要求

### 回复邮件草稿（日英双语）

English:
> Hi Larry,
> 
> Thank you for your message. We have now updated our website and created a public pricing page.
> 
> - Website: https://baina-tango.pages.dev
> - Pricing page (no login required): https://baina-tango.pages.dev/pricing
> 
> The pricing page is fully bilingual (Japanese & English) and lists all products, prices, and our payment/refund policy. The checkout flow is handled via Stripe Checkout.
> 
> Please re-review at your convenience. Thank you!

日本語:
> Larry 様
> 
> ご連絡ありがとうございます。ウェブサイトと公開料金ページを整備いたしました。
> 
> - ウェブサイト: https://baina-tango.pages.dev
> - 料金ページ（ログイン不要）: https://baina-tango.pages.dev/pricing
> 
> 料金ページは日英バイリンガルで、全商品の価格・説明・返金ポリシーを掲載しています。
> ご確認のほど、よろしくお願いいたします。

## 已知问题 / 风险
- index.html 中 Edit 工具写 HTML 属性会产生弯引号 bug → 后续修改必须用 Python 字节操作
- 旧词库（原 Netlify 域名 localStorage）数据仍未恢复 → 如需恢复，从旧域名 export JSON 再 import

## 下次继续
- 确认 Stripe 第二封邮件内容
- 等待 Stripe 审核结果
- 如需修改 pricing.html 内容再调整
