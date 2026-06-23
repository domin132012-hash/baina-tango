# ChatGPT Review Round 2 — Deep Review (DeepSeek Top 1000)

## Round Info

- **Round**: 2 (deep evidence review)
- **Protocol**: `docs/agents/hermes-deep-review-protocol.md`
- **Source candidate**: `docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate.json`
- **Reviewed-r1 candidate**: `docs/review/jmdict-zh-deepseek-pilot-1000-overlay-candidate-reviewed-r1.json`
- **Items reviewed**: 67 (P0=15, P1=1, P2=51)
- **R1 audit**: All R1 decisions confirmed justified
- **R2 corrections**: 0 new content corrections, 0 new flag corrections
- **Review depth**: Per-item evidence provided for all 67 items

---

## R1 Depth Audit

R1 decisions:
- P0 (15): All `remove_needs_human_review` — each item inspected: correctly hidden, good usageNotes, truly niche/archaic/specialized senses
- P1 (1): `rewrite_gloss` (下さる si=2 shortGloss) — confirmed correct, natural Chinese
- P2 (51): All `no_action` — each individually verified with evidence below

**Spot-check**: 3 random P0 items (ひと時 si=3, 横目 si=2, 下地 si=4) verified — all correctly assessed.

**R1 verdict**: Decisions were appropriate. No items wrongly classified.

---

## Per-Item Evidence (all 67 items)

### P0 Items (needs_human_review, nhr removed in R1, confirmed in R2)

| # | Item | Evidence | R2 Decision |
|---|------|----------|-------------|
| 1 | ひと時 si=3 "two-hour period" | Archaic Chinese time unit (1 时辰=2 hours). 两小时 gloss correct. Hidden because modern learners don't encounter this sense. | no_action_with_evidence |
| 2 | 一旦 si=3 "one morning" | Archaic usage of 一旦 meaning "one morning" — modern meaning is "once/for the time being". Correctly hidden to avoid confusion. | no_action_with_evidence |
| 3 | 一匹 si=2 "two-tan bolt of cloth" | Obsolete cloth measurement unit (1匹=2反). UsageNote clearly explains. No modern learner value. | no_action_with_evidence |
| 4 | 一分 si=1 "one tenth; 1%" | Group of historical units (length ~3mm, currency 1/4 両, percentage). Complex multi-meaning; correctly hidden for learner dictionary. | no_action_with_evidence |
| 5 | 一文 si=3 "one mon (old coin)" | Obsolete Japanese currency (文). UsageNote clearly states obsolete. | no_action_with_evidence |
| 6 | 一門 si=3 "sumo stable group" | Sumo organizational term. Highly specialized. UsageNote clearly identifies domain. | no_action_with_evidence |
| 7 | 泳ぐ si=4 "to totter" | Archaic/dialect meaning of 泳ぐ (normally "to swim"). UsageNote states rarity. Correctly hidden. | no_action_with_evidence |
| 8 | 駅弁 si=2 "sexual position" | Slang/adult content. UsageNote explicitly says not for ordinary learners. Correctly hidden. | no_action_with_evidence |
| 9 | 越年 si=2 "golf overtime" | Golf-specific term. UsageNote identifies domain. Low learner value. | no_action_with_evidence |
| 10 | 演歌 si=2 "troubadour" | Archaic meaning of 演歌 (modern = enka music genre). Hidden to prevent confusion with modern primary sense. | no_action_with_evidence |
| 11 | 横目 si=2 "short grain (paper)" | Paper-making technical term. Niche domain. UsageNote clear. | no_action_with_evidence |
| 12 | 横目 si=3 "kanji net radical ⺲" | Kanji radical terminology. Only relevant to kanji specialists. Correctly hidden. | no_action_with_evidence |
| 13 | 王子 si=2 "Kumano subordinate shrine" | Shinto-specific religious term. UsageNote states domain. Not useful for general learners. | no_action_with_evidence |
| 14 | 音頭 si=3 "gagaku wind leader" | Gagaku court music term. Extremely niche. Correctly hidden. | no_action_with_evidence |
| 15 | 下地 si=4 "soy sauce (dialect)" | Dialect meaning of 下地 (normally "base/preparation"). Standard soy sauce is 醤油. Hidden to prevent learner confusion. | no_action_with_evidence |

### P1 Item (fixed_expression)

| # | Item | Evidence | R2 Decision |
|---|------|----------|-------------|
| 1 | 下さる si=2 "to kindly do" | R1 changed shortGloss "为我做"→"为我（做）". The "承蒙" in zhGlosses is actually correct for the polite nuance, not a false positive. usageNote accurate. shouldDisplay=true correct for this common 敬語 expression. | no_action_with_evidence |

### P2 Items (specialized / archaic / religion / too_rare)

| # | Item | Category | Evidence | R2 Decision |
|---|------|----------|----------|-------------|
| 1 | 一手 si=1 "one move (go/shogi)" | specialized | Board game term; domain-specific; usageNote identifies context | no_action_with_evidence |
| 2 | 一石 si=1 "one game of go" | specialized | Go-specific counter; niche domain | no_action_with_evidence |
| 3 | 一段 si=4 "ichidan verb" | specialized | Japanese grammar terminology; useful for linguists not learners | no_action_with_evidence |
| 4 | 一着 si=4 "one move (go)" | specialized | Board game counting term | no_action_with_evidence |
| 5 | 一通 si=3 "pure straight (mahjong)" | specialized | Mahjong hand combination; domain-specific | no_action_with_evidence |
| 6 | 一通り si=4 "one method" | too_rare | Obscure sense; primary meaning is "generally/roughly" | no_action_with_evidence |
| 7 | １年生 si=3 "annual (plant)" | specialized | Botanical descriptor; limited learner utility | no_action_with_evidence |
| 8 | １年生 si=4 "annual plant" | specialized | Plant biology term; niche | no_action_with_evidence |
| 9 | 一泊 si=2 "overnight rental" | specialized | Commercial/rental terminology; primary sense is "one night stay" | no_action_with_evidence |
| 10 | 一流 si=4 "one flag/banner" | too_rare | Literal meaning of 一流 (normally "first-rate"); seldom used | no_action_with_evidence |
| 11 | 一両 si=2 "one ryō (old coin)" | archaic | Obsolete Edo-period currency; historical interest only | no_action_with_evidence |
| 12 | 一塁 si=3 "one fort" | too_rare | Literal meaning of 一塁 (normally "first base" in baseball); rare | no_action_with_evidence |
| 13 | 一連 si=2 "two reams (paper)" | specialized | Paper quantity unit; printing/publishing domain | no_action_with_evidence |
| 14 | 一連 si=3 "verse; stanza" | specialized | Poetry terminology; literary domain | no_action_with_evidence |
| 15 | 因縁 si=4 "hetu and prataya" | religion | Buddhist philosophical concept; technical term | no_action_with_evidence |
| 16 | 陰気 si=2 "spirit of yin" | specialized | Yin-yang cosmology; traditional Chinese philosophy | no_action_with_evidence |
| 17 | 陰謀 si=2 "conspiracy (legal)" | specialized | Legal definition of conspiracy; primary sense is general "plot" | no_action_with_evidence |
| 18 | 右腕 si=3 "right-handed pitcher" | specialized | Baseball terminology; sport-specific | no_action_with_evidence |
| 19 | 羽目 si=1 "wainscoting" | specialized | Architectural/construction term; primary usage is in idiom 羽目になる | no_action_with_evidence |
| 20 | 雨 si=3 "November suit (hanafuda)" | specialized | Hanafuda card game terminology; extremely niche | no_action_with_evidence |
| 21 | 丑 si=2 "hour of the Ox (~2am)" | specialized | Traditional Chinese timekeeping; historical | no_action_with_evidence |
| 22 | 丑 si=3 "north-northeast" | specialized/archaic | Onmyōdō directional system; obscure | no_action_with_evidence |
| 23 | 丑 si=4 "12th lunar month" | specialized/archaic | Lunar calendar; seldom used in modern context | no_action_with_evidence |
| 24 | 営み si=3 "sexual intercourse" | specialized | Euphemistic usage; adult content | no_action_with_evidence |
| 25 | 営む si=3 "hold religious ceremony" | religion | Buddhist/Shinto ceremonial context | no_action_with_evidence |
| 26 | 営団 si=1 "public corporation" | specialized | Japanese legal entity type (特殊法人); administrative term | no_action_with_evidence |
| 27 | 映像 si=3 "reflection" | too_rare | Obscure sense; primary meaning is "video/image" | no_action_with_evidence |
| 28 | 永代 si=1 "permanence" | religion | Religious context (永代供養 = perpetual memorial service); Buddhist | no_action_with_evidence |
| 29 | 英雄 si=2 "Eroica Symphony" | specialized | Musical work reference; proper name | no_action_with_evidence |
| 30 | 英雄 si=3 "Heroic Polonaise" | specialized | Musical work reference; proper name | no_action_with_evidence |
| 31 | 駅 si=2 "staging post (pre-modern)" | archaic | Edo-period highway system; historical | no_action_with_evidence |
| 32 | 駅伝 si=2 "stagecoach" | archaic | Pre-modern relay system; primary modern meaning is relay race | no_action_with_evidence |
| 33 | 煙突 si=2 "taxi without meter" | specialized | Taxi industry slang; primary meaning is "chimney" | no_action_with_evidence |
| 34 | 燕 si=2 "barn swallow (species)" | too_rare | Specific bird taxonomy; common 燕 means "swallow (general)" | no_action_with_evidence |
| 35 | 燕 si=3 "boy toy" | specialized | Slang term for kept man; informal register | no_action_with_evidence |
| 36 | 縁起 si=3 "dependent arising" | religion | Core Buddhist doctrine (縁起/ pratītyasamutpāda); philosophical | no_action_with_evidence |
| 37 | 縁側 si=2 "fish fin base meat" | specialized | Culinary/fish butchery term; niche | no_action_with_evidence |
| 38 | 艶 si=4 "romance; sexiness" | specialized | Erotic/romantic nuance of 艶; adult content adjacent | no_action_with_evidence |
| 39 | 遠慮 si=3 "forethought" | too_rare | Obscure sense; primary meaning is "restraint/reserve/refrain" | no_action_with_evidence |
| 40 | 横転 si=2 "barrel roll" | specialized | Aviation acrobatics term; niche | no_action_with_evidence |
| 41 | 王手 si=1 "check (shogi)" | specialized | Shogi game term; domain-specific | no_action_with_evidence |
| 42 | 王将 si=1 "king (shogi)" | specialized | Shogi piece name; domain-specific | no_action_with_evidence |
| 43 | 王将 si=2 "Ōshō title" | specialized | Professional shogi title; extremely niche | no_action_with_evidence |
| 44 | 黄金 si=3 "money (old coin)" | archaic | Refers to ōban gold coins; historical | no_action_with_evidence |
| 45 | 下見 si=3 "siding/clapboard" | specialized | Construction/architecture term | no_action_with_evidence |
| 46 | 下限 si=2 "infimum" | specialized | Mathematical term; advanced domain | no_action_with_evidence |
| 47 | 下手 si=2 "underarm grip (judo)" | specialized | Judo technique terminology; domain-specific | no_action_with_evidence |
| 48 | 下駄 si=2 "upside-down character" | specialized | Printing/typesetting term; historical printing | no_action_with_evidence |
| 49 | 下駄 si=3 "net; geta (finance)" | specialized | Financial jargon; niche | no_action_with_evidence |
| 50 | 下地 si=3 "undercoat/first coat" | specialized | Painting/finishing term | no_action_with_evidence |
| 51 | 下町 si=2 "Shitamachi (Tokyo area)" | specialized | Geographic proper name; local Tokyo knowledge | no_action_with_evidence |

---

## R2 Correction Summary

| Metric | Count |
|--------|:---:|
| Items reviewed | 67 |
| P0 reviewed | 15 |
| P1 reviewed | 1 |
| P2 reviewed | 51 |
| Content corrections | 0 |
| Flag-only corrections | 0 |
| Metadata corrections | 0 |
| no_action_with_evidence | 67 |
| unresolved | 0 |
| flag_for_round3 | 0 |
| R1 decisions confirmed | 67/67 |

## Counter-Argument Spot-Check

3 random P0 items checked:
1. **ひと時 si=3**: Counter: "两小时 is too terse, learners might not understand the archaic context." → Rebuttal: usageNote clearly explains "古时的一个时辰，相当于现代的两小时", sufficient for hidden sense.
2. **横目 si=2**: Counter: "短纹（纸张）is not a natural Chinese term." → Rebuttal: "short grain" is a technical paper term; direct Chinese equivalent may not exist. The parenthetical "(纸张)" clarifies domain. Adequate for hidden sense.
3. **下地 si=4**: Counter: "酱油 is a common word, why hide it?" → Rebuttal: This is a DIALECT meaning of 下地. Standard word is 醤油. Showing "酱油" under 下地 would confuse learners. Correctly hidden.

All rebuttals hold. R1 decisions stand.

## Review-Depth Validation

- ✅ Every item has evidence block
- ✅ P0 items spot-checked (20% = 3 items)
- ✅ P2 items individually verified (51/51)
- ⚠️ P2 all no_action → requires `PASS_WITH_LIMITED_REVIEW` per protocol

**QA Result: PASS_WITH_LIMITED_REVIEW**

Review depth sufficient for R2. No corrections needed. R1 decisions fully confirmed. P2 bulk no_action justified by domain specificity of all 51 senses.
