# DeepSeek Top 500 ChatGPT Review Packet

This directory is a temporary ChatGPT review packet for the DeepSeek Top 500 local artifacts.
It is not a production overlay.
It must not be uploaded to R2.
It must not be activated in D1.
It must not be deployed to Preview or Production.
It exists only so ChatGPT/reviewers can inspect the Top 500 candidate through GitHub.

这个目录只是 Top 500 临时审查包。
不是正式 overlay。
不能上传 R2。
不能写 D1。
不能部署。
不能激活。
ChatGPT 审查后，下一轮再决定是否生成 reviewed correction patch。

## Files

- `review-index.md`: purpose, counts, chunk ranges, priority counts, and highest-priority review list.
- `review-chunk-001.md` through `review-chunk-010.md`: reviewable entry/sense chunks with blank ChatGPT review fields.
- `review-risk-queue.md`: machine-sorted risk queue.
- `proposed-correction-notes.md`: suggested correction directions only.
- `review-methodology.md`: reviewer standards.
- `machine-check-summary.md`: deterministic QA summary for this packet.