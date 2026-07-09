# PROMPTS.md — 재사용 프롬프트 템플릿 모음

> IQ Spark Studio에서 반복적으로 사용하는 프롬프트 템플릿을 모아 관리합니다.
> 각 프롬프트는 Phase별로 분류되어 있습니다.

## 1. Phase 1 — 퍼즐 분석 프롬프트

### P-001. 퍼즐 이미지 분석

```
You are an expert IQ test analyst specializing in Mensa, Raven's Progressive Matrices, and WAIS-level logic puzzles.

Analyze the provided puzzle image and determine:
1. **Puzzle Type**: (pattern_recognition / sequence_reasoning / spatial / logical / numerical)
2. **Options**: List all visible answer options (A, B, C, D)
3. **Correct Answer**: Determine the correct answer
4. **Explanation**: Provide a clear, step-by-step explanation of the solution
5. **Confidence**: Rate your confidence (0.0 to 1.0)

Rules:
- Do NOT guess. If uncertain, say "confidence: low" and explain why.
- Provide the explanation in English.
- The puzzle is designed for US audience at Mensa/WAIS difficulty level.

Output format: JSON
```

### P-002. 정답 역산 3중 검증

```
You are verifying the correctness of a puzzle answer using triple verification.

Given:
- Puzzle Type: {puzzle_type}
- Options: {options}
- Claimed Answer: {answer}
- Initial Explanation: {explanation}

Perform three independent verifications:

1. **Forward Verification**: Solve the puzzle from scratch, step by step, without looking at the claimed answer.
2. **Backward Verification**: Assume the claimed answer is correct. Verify it satisfies ALL conditions and constraints of the puzzle.
3. **Alternative Method**: Solve using a completely different approach or reasoning method.

For each verification, output:
- Method used
- Steps taken
- Result (PASS / FAIL)
- If FAIL: explain the discrepancy

Final verdict: ALL_PASS / PARTIAL_FAIL / ALL_FAIL

Output format: JSON
```

## 2. Phase 2 — 트렌드 리서치 프롬프트

### P-003. 트렌드 키워드 수집

```
Research current trending topics and keywords related to IQ tests, brain teasers, and logic puzzles on social media (YouTube, TikTok, Instagram).

Focus on:
1. **Trending Keywords**: Top 10 keywords/phrases being used this week
2. **Trending Hashtags**: Most popular hashtags in the IQ/puzzle niche
3. **Optimal Posting Time**: Best posting times for US audience engagement
4. **Content Gaps**: What type of IQ content is underserved
5. **Competitor Analysis**: What top IQ puzzle channels are doing differently

Target audience: US, English-speaking, ages 18-35
Platform priority: YouTube Shorts > TikTok > Instagram Reels

Output format: JSON
```

## 3. Phase 3 — 카피라이팅 프롬프트

### P-004. Hook 텍스트 생성

```
Create 5 hook text variations for an IQ puzzle video (YouTube Shorts / TikTok / Instagram Reels).

Context:
- Puzzle 1 (Easy): {p1_type} — Answer: {p1_answer}
- Puzzle 2 (Hard): {p2_type} — Answer: {p2_answer}
- Trending keywords: {trending_keywords}

Requirements (RULE 18 — Hook Golden Format):
- Maximum 10 words
- MUST include a number (e.g., "Only 2%...", "98% fail...")
- Must be instantly recognizable within 0.5 seconds
- Must create curiosity or challenge the viewer
- Language: US English only

Previously used hooks (avoid duplicates):
{previous_hooks}

Output: 5 hook variations ranked by predicted engagement
```

### P-005. 5채널 카피라이팅

```
Create optimized copy for 5 social media platforms based on today's IQ puzzle content.

Input data:
- analysis.json: {analysis}
- trend_report.json: {trends}
- Hook text (chosen): {hook}

Generate copy for each platform:

1. **YouTube Long** (16:9):
   - Title (60 chars max, SEO optimized)
   - Description (500 chars, include iqspark.digital link — ONLY platform where URL is allowed)
   - Tags (10-15, comma separated)
   - Pinned comment (P2 answer: "{p2_answer}")

2. **YouTube Shorts** (9:16):
   - Title (60 chars max)
   - Description (short, 3-5 hashtags)
   - NO URL in description (RULE 4)

3. **TikTok**:
   - Caption (150 chars max, 3-5 hashtags)
   - Include #AIGenerated (RULE 8)
   - NO URL in caption (RULE 4)
   - Note: Set AI label in TikTok settings

4. **Instagram Reels**:
   - Caption (200 chars, 3-5 hashtags)
   - "Link in bio!" CTA (RULE 4)
   - NO URL in caption

5. **Threads**:
   - Text post (300 chars max)
   - 3-5 hashtags
   - NO URL in text

Rules:
- All copy in US English (RULE 5)
- P1 answer: revealed in video (Reveal Mode)
- P2 answer: pinned comment only (Comment Mode)
- Include "💬 Comment your answer 👇" CTA
- Never exceed 5 hashtags per platform

Output format: JSON
```

## 4. Phase 8 — 성과 분석 프롬프트

### P-006. 성과 데이터 분석

```
Analyze the performance data from the last 48 hours across all platforms.

Data:
{performance_data}

Analyze:
1. **Top Performer**: Which platform had the highest engagement rate?
2. **Engagement Breakdown**: Views, likes, comments, shares, saves for each platform
3. **Hook Effectiveness**: Did the hook text drive above-average engagement?
4. **Comment Analysis**: Are viewers engaging with the Q2 puzzle? Comment-to-view ratio?
5. **Pattern Recognition**: Compare with top 20% and bottom 20% historical content
6. **Recommendations**: 3 actionable insights for tomorrow's content

Output format: Markdown report
```

## 5. 유틸리티 프롬프트

### P-007. 해시태그 중복 검사

```
Check the following hashtags against the 30-day history for duplicates.

Proposed hashtags:
{proposed_hashtags}

History (last 30 days):
{hashtag_history}

For each hashtag:
- UNIQUE: Not used in last 30 days
- DUPLICATE: Used on {date}, suggest alternative
- FREQUENT: Used 3+ times, strongly recommend replacement

Output: List with status for each hashtag + alternatives for duplicates
```

### P-008. 메타데이터 복사용 텍스트 생성

```
Format the following copy data into a plain text file that the owner can directly copy-paste when uploading to each platform.

Copy data: {copy_5platform}

Format:
═══════════════════════════════════
📺 YouTube Long (16:9)
═══════════════════════════════════
[제목]
{title}

[설명란]
{description}

[태그]
{tags}

[고정 댓글]
{pinned_comment}

═══════════════════════════════════
📱 YouTube Shorts (9:16)
═══════════════════════════════════
... (repeat for all 5 platforms)

Include clear section dividers for easy copy-pasting.
```

---

*PROMPTS.md — Last updated: 2026-07-06*
