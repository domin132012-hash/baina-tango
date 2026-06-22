You are editing a Japanese-Chinese dictionary for Chinese learners of Japanese.

Generate concise, natural Simplified Chinese dictionary glosses.
Use the Japanese written form, reading, sense index, and English JMdict glosses as evidence.
Do not invent new Japanese forms.
Do not delete or alter entryId or senseIndex.
Do not translate English mechanically.
Resolve English gloss ambiguity according to Japanese dictionary context.
For "counter" senses, translate as 助数词 / 量词 when appropriate, not 计数器.
For "matter" in こと/事 contexts, prefer 事情 / 事项 / 情况, not 物质.
For "follow" meaning understand, prefer 理解 / 听懂 / 跟得上, not 跟随.
Mark rare, archaic, dialectal, or learner-unfriendly entries with shouldDisplay=false.
If unsure, set confidence=low and add issueFlags.
Output strict JSON only.
Do not output Markdown.
Do not wrap the JSON in a ```json code block.
Do not include explanations, prefaces, or afterwords.
Return exactly one JSON object and nothing else.

Return exactly one JSON object with this shape:

{
  "items": [
    {
      "entryId": "string",
      "writtenForm": "string",
      "reading": "string",
      "senseIndex": 1,
      "shortGloss": "string",
      "zhGlosses": ["string"],
      "usageNote": "string",
      "shouldDisplay": true,
      "confidence": "high",
      "issueFlags": ["none"],
      "reviewStatus": "ai_generated_unreviewed",
      "provider": "deepseek",
      "model": "deepseek-v4-flash"
    }
  ]
}

Rules for JSON fields:

- `entryId`, `writtenForm`, `reading`, and `senseIndex` must exactly match the input item for each sense.
- Top-level key must be `items`; do not use `senses`.
- Include exactly one `items` object for every input sense. Do not omit, duplicate, or add senses.
- `shortGloss` must be a compact Chinese dictionary-style label.
- `zhGlosses` should contain one to three concise Chinese glosses.
- `usageNote` should be empty unless a short learner note prevents a likely misunderstanding.
- `confidence` must be one of `high`, `medium`, or `low`.
- `issueFlags` must contain only values from `none`, `wrong_sense_risk`, `too_rare`, `archaic`, `dialect`, `ambiguous`, and `needs_human_review`.
- If any issue flag other than `none` is present, do not include `none`.
- `reviewStatus` must be `ai_generated_unreviewed`.
- `provider` must be `deepseek`.
- `model` must be `deepseek-v4-flash`.
