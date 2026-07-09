# SKILL.md — 반복 작업 유형 및 입출력 형식

> IQ Spark Studio에서 반복적으로 수행하는 작업 유형, 각 작업의 입출력 형식, 우선순위 및 리소스 추정을 정의합니다.

## 1. 작업 유형 총괄

| # | 작업 유형 | 빈도 | 우선순위 | Phase |
|---|----------|------|---------|-------|
| S1 | 퍼즐 이미지 분석 | 매일 | 🔴 Critical | Phase 1 |
| S2 | 정답 역산 3중 검증 | 매일 | 🔴 Critical | Phase 1 |
| S3 | 트렌드/키워드 리서치 | 매일 | 🟡 High | Phase 2 |
| S4 | 5채널 카피라이팅 | 매일 | 🟡 High | Phase 3 |
| S5 | Hook 텍스트 생성 | 매일 | 🟡 High | Phase 3 |
| S6 | 브랜드 프레임 생성 | 매일 | 🟡 High | Phase 4 |
| S7 | 영상 렌더링 (FFmpeg) | 매일 | 🟡 High | Phase 5 |
| S8 | 메타데이터 패키징 | 매일 | 🟢 Medium | Phase 6 |
| S9 | 성과 데이터 수집 | 격일 (48h 후) | 🟢 Medium | Phase 8 |
| S10 | 중복 검사 | 매일 | 🟡 High | Phase 2 |

## 2. 작업별 상세

### S1. 퍼즐 이미지 분석

| 항목 | 내용 |
|------|------|
| **입력** | `p1.png` (Easy), `p2.png` (Hard) — 1080×1920 이미지 |
| **출력** | `analysis.json` |
| **도구** | Claude Vision API |
| **소요 시간** | ~30초 |
| **API 비용** | ~$0.01~0.03/회 |

**출력 형식 (analysis.json):**
```json
{
  "date": "2026-07-06",
  "puzzles": [
    {
      "id": "p1",
      "difficulty": "easy",
      "type": "pattern_recognition",
      "options": ["A", "B", "C", "D"],
      "answer": "C",
      "verification": {
        "forward": true,
        "backward": true,
        "alternative": true
      },
      "confidence": 0.95,
      "explanation": "The pattern follows a 90° rotation..."
    },
    {
      "id": "p2",
      "difficulty": "hard",
      "type": "sequence_reasoning",
      "options": ["A", "B", "C", "D"],
      "answer": "B",
      "verification": {
        "forward": true,
        "backward": true,
        "alternative": true
      },
      "confidence": 0.92,
      "explanation": "The sequence follows n² + 1..."
    }
  ]
}
```

### S2. 정답 역산 3중 검증

| 항목 | 내용 |
|------|------|
| **입력** | `analysis.json` (1차 분석 결과) |
| **출력** | 검증 결과 (pass/fail) → analysis.json에 반영 |
| **도구** | Gemini 3.5 Flash (medium) + Claude Sonnet 4.6 thinking (교차 검증) |
| **소요 시간** | ~1분 |

**검증 프로세스:**
```
Step 1: 순방향 풀이 (문제 → 정답)
Step 2: 역방향 검증 (정답 → 문제 조건 부합 확인)
Step 3: 대안 풀이 (다른 방법으로 동일 정답 도출)

→ 3개 모두 pass: 진행
→ 1개라도 fail: 즉시 중단 + 대표님 보고
```

### S3. 트렌드/키워드 리서치

| 항목 | 내용 |
|------|------|
| **입력** | 현재 날짜, 퍼즐 유형 |
| **출력** | `trend_report.json` |
| **도구** | Gemini 3.5 Flash (medium), Firecrawl MCP |
| **소요 시간** | ~2분 |

**출력 형식 (trend_report.json):**
```json
{
  "date": "2026-07-06",
  "trending_keywords": ["brain teaser", "IQ test", "logic puzzle"],
  "trending_hashtags": ["#BrainTeaser", "#IQTest", "#PuzzleChallenge"],
  "optimal_posting_time": "10:00 AM EST",
  "competitor_insights": "..."
}
```

### S4. 5채널 카피라이팅

| 항목 | 내용 |
|------|------|
| **입력** | `analysis.json`, `trend_report.json` |
| **출력** | `copy_5platform.json` |
| **도구** | Claude Sonnet 4.6 (thinking) |
| **소요 시간** | ~2분 |
| **API 비용** | ~$0.05~0.10/회 |

**출력 형식 (copy_5platform.json):**
```json
{
  "date": "2026-07-06",
  "hook_overlay_texts": {
    "p1_top": "Can YOU solve this? 🧩",
    "p1_bottom": "Only 2% get it right",
    "a1_bottom": "The answer is C! 🧠",
    "p2_top": "Even HARDER puzzle! 💡",
    "p2_bottom": "💬 Comment your answer 👇"
  },
  "youtube_long": {
    "title": "...",
    "description": "...",
    "tags": ["..."],
    "pinned_comment": "Answer to Q2: B 🧠"
  },
  "youtube_shorts": { "..." },
  "tiktok": { "..." },
  "instagram_reels": { "..." },
  "threads": { "..." }
}
```

### S5. Hook 텍스트 생성

| 항목 | 내용 |
|------|------|
| **입력** | `trend_report.json`, RULE 18 규칙 |
| **출력** | Hook 텍스트 5종 (copy_5platform.json 내 포함) |
| **도구** | Claude Sonnet 4.6 (thinking) |
| **규칙** | 10단어 이내, 숫자 포함, 0.5초 내 인지 |

### S6. 브랜드 프레임 생성

| 항목 | 내용 |
|------|------|
| **입력** | 원본 이미지, analysis.json, Hook 텍스트 |
| **출력** | 4장 PNG (1080×1920) |
| **도구** | html2canvas, IQ Spark 템플릿 |
| **소요 시간** | ~1분 |

### S7. 영상 렌더링

| 항목 | 내용 |
|------|------|
| **입력** | 프레임 4장, bgm.mp3 (선택) |
| **출력** | portrait.mp4 (9:16), landscape.mp4 (16:9) |
| **도구** | FFmpeg |
| **소요 시간** | ~3분 |
| **사양** | H.264, 30fps, yuv420p, 60초 |

### S8. 메타데이터 패키징

| 항목 | 내용 |
|------|------|
| **입력** | `copy_5platform.json`, 영상 파일 |
| **출력** | 5폴더 + `메타데이터_복사용.txt` |
| **도구** | 파일 시스템 |
| **소요 시간** | ~30초 |

### S9. 성과 데이터 수집

| 항목 | 내용 |
|------|------|
| **입력** | 게시물 ID, 48시간 경과 |
| **출력** | `daily_summary.md` |
| **도구** | SNS API, Memory MCP |
| **수집 항목** | 조회수, 좋아요, 댓글, 공유, 저장 |

### S10. 중복 검사

| 항목 | 내용 |
|------|------|
| **입력** | 현재 Hook/해시태그 후보 |
| **출력** | 중복 여부 (pass/reject) |
| **도구** | Memory MCP, localStorage 서명 |
| **규칙** | 동일 퍼즐 30일 간격 (RULE 12) |

## 3. 우선순위 매트릭스

```
              높은 영향         낮은 영향
            ┌─────────────┬─────────────┐
높은 긴급   │ S1 퍼즐분석  │ S10 중복검사 │
            │ S2 3중검증   │             │
            ├─────────────┼─────────────┤
낮은 긴급   │ S3 트렌드    │ S8 패키징   │
            │ S4 카피      │ S9 성과수집  │
            │ S5 Hook      │             │
            │ S6 프레임    │             │
            │ S7 렌더링    │             │
            └─────────────┴─────────────┘
```

## 4. 일일 총 리소스 추정

| 항목 | 추정 |
|------|------|
| **총 소요 시간** | ~10~15분 (자동화) |
| **API 비용** | ~$0.10~0.15/일 (~$3~5/월) |
| **로컬 디스크** | ~50~100MB/에피소드 |
| **네트워크** | API 호출 5~10회 |

---

*SKILL.md — Last updated: 2026-07-06*
