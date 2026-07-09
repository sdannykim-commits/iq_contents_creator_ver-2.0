# DATA_SOURCES.md — 데이터 출처 및 라이선스

> IQ Spark Studio에서 참고/수집/사용하는 데이터의 출처, 접근 일자, 라이선스 상태를 명시합니다.

## 1. 프로젝트 원본 출처

| # | 출처 | URL | 접근일자 | 유형 | 라이선스 |
|---|------|-----|----------|------|---------|
| 1 | Genspark IQ Spark Studio Agent | https://www.genspark.ai/agents?id=81014719-fe64-4bb6-9f31-18d5f5e09913 | 2026-07-06 | 에이전트 페이지 | Genspark ToS |
| 2 | Genspark Workspace (1) | https://www.genspark.ai/agents?id=252f7347-decc-4cfa-9952-82f98c91f3dd | 2026-07-06 | 작업 공간 | Genspark ToS |
| 3 | Genspark Workspace (2) | https://www.genspark.ai/agents?id=55156920-fecc-4a94-80b6-209b3e80e9a0 | 2026-07-06 | 작업 공간 | Genspark ToS |
| 4 | IQ Spark 공식 사이트 | https://iqspark.digital/ | 2026-07-06 | 랜딩 페이지 | 자체 소유 |

## 2. 내부 지식 아이템 (Knowledge Items)

| # | KI 이름 | 경로 | 최종 업데이트 | 내용 |
|---|---------|------|-------------|------|
| 1 | IQ SPARK 인프라 전략 | `knowledge/iq_spark_infra_strategy/` | 2026-05-14 | 투 트랙 LLM, Supabase 보류, API 우선순위 |
| 2 | IQ Spark 일일 자동화 워크플로우 | `knowledge/iq_spark_daily_workflow/` | 2026-05-12 | RULE 0~18, 8-Phase 프로세스 |
| 3 | Project Environment Lifecycle | `knowledge/project_environment_lifecycle/` | 2026-05-13 | 마이그레이션 패턴, 배포 전략 |
| 4 | IQ Spark 웹앱 플랜 | `knowledge/iq_spark_web_app_plan/` | 2026-05-09 | SaaS 전환 설계도 |

## 3. 외부 도구 및 라이브러리

| # | 도구 | 라이선스 | URL | 비고 |
|---|------|---------|-----|------|
| 1 | FFmpeg | LGPL 2.1+ / GPL 2+ | https://ffmpeg.org/ | 영상 렌더링 |
| 2 | html2canvas | MIT | https://html2canvas.hertzen.com/ | 프레임 캡처 |
| 3 | Inter Font | OFL 1.1 | https://fonts.google.com/specimen/Inter | 브랜드 폰트 |

## 4. API 데이터 출처

| # | API | 제공자 | 데이터 유형 | 이용 약관 |
|---|-----|--------|-----------|----------|
| 1 | Gemini API | Google | LLM 응답, 이미지 분석 | Google AI ToS |
| 2 | Claude API | Anthropic | LLM 응답, 카피라이팅 | Anthropic Usage Policy |
| 3 | YouTube Data API | Google | 성과 데이터 | YouTube API ToS |
| 4 | TikTok API | TikTok | 성과 데이터 | TikTok Developer ToS |
| 5 | Instagram Graph API | Meta | 성과 데이터 | Meta Platform ToS |

## 5. 콘텐츠 소재 출처

| 유형 | 출처 | 라이선스 | 비고 |
|------|------|---------|------|
| 퍼즐 이미지 | 대표님 직접 제공/큐레이션 | 사용 권한 확보 | RULE 3에 따라 1:1 클론 |
| BGM | 대표님 직접 제공 | 사용 권한 확보 | RULE 17에 따라 적용 |
| 트렌드 데이터 | 공개 SNS 데이터 | 공개 정보 | Firecrawl MCP로 수집 |

## 6. 라이선스 준수 체크리스트

- [ ] FFmpeg: LGPL/GPL 라이선스 조건 확인
- [ ] html2canvas: MIT 라이선스 (자유 사용 가능)
- [ ] Inter Font: OFL 라이선스 (자유 사용 가능)
- [ ] 퍼즐 이미지: 원본 저작권 확인 → 그대로 복제 배포 금지
- [ ] BGM: 저작권 확인 → 대표님 확보분만 사용

---

*DATA_SOURCES.md — Last updated: 2026-07-06*
