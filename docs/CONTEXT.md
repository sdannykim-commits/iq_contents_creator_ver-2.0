# CONTEXT.md — 프로젝트 배경 및 현재 상황

> 프로젝트의 배경, 현재 진행 상황, 참고 링크 원본 출처, 이해관계자 및 의사결정 이력을 기록합니다.
> 새 세션 시작 시 가장 먼저 읽는 문서입니다.

## 1. 프로젝트 배경

### 1.1 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | IQ Spark Studio (IQ Contents Creator ver-2.0) |
| **시작일** | 2026년 초 |
| **목적** | IQ/논리 퍼즐 콘텐츠를 자동 생성하여 5대 SNS 플랫폼에 배포하는 자동화 파이프라인 구축 |
| **타겟 시장** | US Audience (미국 IQ/퍼즐 애호가) |
| **공식 사이트** | [iqspark.digital](https://iqspark.digital/) |
| **운영 계정** | iqspark.info@gmail.com |

### 1.2 프로젝트 비전

- **단기**: 일일 1회 IQ 퍼즐 쇼츠 콘텐츠 자동 생산 → 5채널 동시 배포
- **중기**: 성과 데이터 기반 최적화, 구독자 확보, 사이트 트래픽 유입
- **장기**: SaaS 플랫폼 전환 (React/Next.js + Supabase + AWS)

### 1.3 핵심 콘텐츠 구조 (6프레임 쇼츠)

```
Frame 1: Intro         ← 매일 로테이션되는 훅 문구 (RULE 18 골든포맷)
Frame 2: Question 1    ← 정답 공개형 (Reveal Mode) — Easy
Frame 3: Answer 1      ← 해설 및 정답 공개
Frame 4: Question 2    ← 댓글 유도형 (Comment Mode) — Hard
Frame 5: Comment CTA   ← 정답 미공개 + "Check the full solution at iqspark.digital"
Frame 6: Final CTA     ← 최종 사이트 유도 카드
```

## 2. 현재 진행 상황

### 2.1 인프라 확정 사항 (2026-04-02 승인)

| 항목 | 상태 | 세부 |
|------|------|------|
| 투 트랙 LLM | ✅ 확정 | Gemini 3.5 Flash medium(리서치) + Claude Sonnet 4.6 thinking(카피) |
| Supabase | ⏸️ 보류 | 1인 운영 시 불필요, 확장 시 도입 |
| API 우선순위 | ✅ 확정 | 🔴 Gemini+Claude → 🟡 TikTok/YouTube/IG → 🟢 Supabase/AWS |
| 월 비용 | ✅ 확정 | ~$3~5/월 |

### 2.2 콘텐츠 포맷 (확정)

- 문제 2장 업로드 → 템플릿 자동 리포맷
- 30초 × 2문제 = **60초 영상**
- 출력: portrait.mp4(9:16) + landscape.mp4(16:9)
- H.264, 30fps, yuv420p

### 2.3 웹앱 현황

- **Genspark IQ Spark Studio** 웹앱 구현 완료
- 순수 정적 프론트엔드 (HTML/CSS/JS)
- 로컬 다운로드 가능 (Simple Website or Web App.zip)
- 주요 JS 파일: `index.html`, `js/iq-engine.js`, `js/trick-puzzles.js`

### 2.4 골드 레퍼런스

- `reports/20260514_/` — 프레임 디자인 + 메타데이터의 절대 기준
- 이 폴더의 결과물을 기준으로 모든 후속 콘텐츠의 품질 판단

## 3. 참고 링크 원본 출처

| 출처 | URL | 접근일자 | 비고 |
|------|-----|----------|------|
| Genspark IQ Spark Studio Agent | https://www.genspark.ai/agents?id=81014719-fe64-4bb6-9f31-18d5f5e09913 | 2026-07-06 | 메인 에이전트 페이지 |
| IQ Spark 공식 사이트 | https://iqspark.digital/ | 2026-07-06 | 랜딩 페이지 |
| Genspark Workspace | https://www.genspark.ai/agents?id=252f7347-decc-4cfa-9952-82f98c91f3dd | 2026-07-06 | 작업 공간 |
| Genspark Workspace (추가) | https://www.genspark.ai/agents?id=55156920-fecc-4a94-80b6-209b3e80e9a0 | 2026-07-06 | 추가 작업 공간 |

## 4. 이해관계자

| 역할 | 담당 | 책임 |
|------|------|------|
| **대표님** | 최종 의사결정권자 | 전략 방향, 콘텐츠 승인, SNS 업로드, API 키 관리 |
| **지수실장 (AI)** | 전담 에이전트 | 콘텐츠 기획~메타데이터 생성 전 과정 자동화 |

## 5. 의사결정 이력

| 일자 | 결정 사항 | 결정자 | 비고 |
|------|----------|--------|------|
| 2026-04-02 | 투 트랙 LLM 아키텍처 확정 (Gemini+Claude) | 대표님 | infra_decisions.md |
| 2026-04-02 | Supabase 보류 (1인 운영 시 불필요) | 대표님 | 확장 시 재검토 |
| 2026-04-02 | 월 비용 ~$3~5 확정 | 대표님 | Gemini 무료 + Claude ~$3~5 |
| 2026-05-12 | RULE 0~18 전체 반영 확정 | 대표님 | daily_automation_guide.md |
| 2026-05-14 | 골드 레퍼런스 폴더 지정 (20260514_) | 대표님 | 프레임+메타 기준 |
| 2026-07-06 | 문서 체계 ver-2.0 구성 시작 | 대표님 | 본 프로젝트 |
| 2026-07-07 | 6프레임 확장 및 ffmpeg.wasm 도입 확정 | 대표님 | 브라우저 단에서 직접 MP4 비디오 다운로드 지원 |

## 6. 최근 세션 맥락 (직전 5회)

> ℹ️ 일일 콘텐츠 제작 시 이 섹션을 업데이트합니다.
> 형식: `YYYY-MM-DD | 에피소드 번호 | 주요 작업 | 특이사항`

| 일자 | 에피소드 | 주요 작업 | 특이사항 |
|------|---------|----------|---------|
| 2026-07-06 | — | 문서 체계 초기 구성 완료 | ver-2.0 구축 완료 |
| 2026-07-07 | — | 6프레임 및 ffmpeg.wasm 웹앱 연동 완료 | MP4 다이렉트 다운로드 구현 완료 |

## 7. 맥락 유지 프로토콜

새 세션 시작 시 반드시 아래 파일을 순서대로 읽을 것:

1. **CONTEXT.md** (본 문서) — 이전 세션 결정사항 + 최근 에피소드 이력
2. **RULE.md** — RULE 0~18 절대 규칙
3. **reports/latest_context.json** — 마지막 콘텐츠 맥락 데이터

> 🧠 이 프로토콜을 통해 매일 새 세션에서도 동일한 품질의 콘텐츠를 일관되게 생산할 수 있습니다.

---

*CONTEXT.md — Last updated: 2026-07-06*
