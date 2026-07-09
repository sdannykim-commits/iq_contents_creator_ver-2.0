# STYLE_GUIDE.md — 브랜드 가이드 및 표기 규칙

> IQ Spark Studio의 브랜드 보이스, 시각 디자인 기준, 파일명 규칙, 콘텐츠 작성 표기법을 정의합니다.

## 1. 브랜드 비주얼 시스템

### 1.1 색상 팔레트

| 용도 | 색상명 | HEX | 사용처 |
|------|--------|-----|--------|
| 주 배경 | Dark Navy | `#0F0F1A` | 모든 프레임 배경 |
| 강조 1 | Amber Gold | `#F59E0B` | 제목, 하이라이트, 정답 강조 |
| 강조 2 | Indigo Glow | `#6366F1` | 부제목, 액센트, 글로우 효과 |
| 텍스트 | White | `#FFFFFF` | 본문 텍스트 |
| 보조 | Cyan | `#06B6D4` | 테두리, 글로우 효과 |

### 1.2 폰트

| 용도 | 폰트 | 굵기 | 크기 |
|------|------|------|------|
| 제목/Hook | Inter | Bold (700) | 48~72px |
| 본문 | Inter | Regular (400) | 24~36px |
| 캡션 | Inter | Medium (500) | 18~24px |
| 선택지 (A,B,C,D) | Inter | SemiBold (600) | 32~48px |

### 1.3 프레임 디자인 규격

| 항목 | 사양 |
|------|------|
| 해상도 | 1080 × 1920 (9:16 세로형) |
| 가로형 | 1920 × 1080 (16:9, YouTube Long용) |
| 테두리 | 딥블루 + 골드/시안 글로우 |
| 코너 | 라운드 12px |
| 문제 이미지 | 원본 1:1 클론 (RULE 3), 변형 금지 |

### 1.4 html2canvas 렌더링 주의사항

- 훅 텍스트 투명도 버그 방지
- 반드시 **불투명 실색(흰색) + Cyan 글로우** 렌더링 유지 (WEBAPP RULE 6)
- `opacity` 대신 `rgba()` 또는 실색 사용

## 2. 콘텐츠 표기 규칙

### 2.1 언어 규칙

| 용도 | 언어 | 비고 |
|------|------|------|
| SNS 콘텐츠 (영상/캡션/해시태그) | US English | RULE 5 |
| 내부 문서/보고 | 한국어 | 대표님 소통용 |
| 코드 주석 | English | 개발 표준 |
| 파일명 | English (소문자) | 아래 규칙 참조 |

### 2.2 영문 표기 규칙

- **대문자**: 제목(Title Case), Hook(첫 글자 대문자)
- **이모지**: Hook/캡션에 1~2개 사용 (과다 사용 금지)
- **숫자**: Hook에 반드시 숫자 포함 (RULE 18)
  - ✅ "Only 2% get this right"
  - ❌ "Most people fail this test"

### 2.3 해시태그 규칙

| 플랫폼 | 해시태그 수 | 형식 |
|--------|-----------|------|
| YouTube Shorts | 3~5개 | #CamelCase |
| TikTok | 3~5개 | #camelcase or #lowercase |
| Instagram Reels | 3~5개 | #CamelCase |
| Threads | 3~5개 | #CamelCase |
| YouTube Long | 태그 필드 사용 | 쉼표 구분 |

**15개 초과 금지** (모든 플랫폼 합산 아닌 플랫폼별 기준)

### 2.4 CTA(Call to Action) 표기

| CTA 유형 | 표기 | 사용 위치 |
|----------|------|----------|
| 댓글 유도 | `💬 Comment your answer 👇` | Frame 5, 캡션 |
| 사이트 유입 | `Check the full solution at iqspark.digital` | Frame 5 |
| 링크 유도 | `Link in bio!` | TikTok/IG 캡션 |
| URL 직접 | `https://iqspark.digital` | YouTube Long 설명란만 |

## 3. 파일명 규칙

### 3.1 일반 규칙

- **영문 소문자 + 언더스코어** (snake_case)
- 공백, 한글, 특수문자 사용 금지
- 날짜 포함 시: `YYYYMMDD` 형식

### 3.2 입력 파일

| 파일 | 규칙 |
|------|------|
| Easy 문제 | `p1.png` |
| Hard 문제 | `p2.png` |
| 배경음악 | `bgm.mp3` |

### 3.3 출력 파일

| 파일 | 규칙 |
|------|------|
| Easy 프레임 | `problem_p1.png` |
| 해설 프레임 | `answer_a1.png` |
| Hard 프레임 | `problem_p2.png` |
| CTA 프레임 | `cta_frame.png` |
| 세로 영상 | `portrait.mp4` |
| 가로 영상 | `landscape.mp4` |
| 분석 결과 | `analysis.json` |
| 트렌드 보고 | `trend_report.json` |
| 카피 | `copy_5platform.json` |
| 메타데이터 | `메타데이터_복사용.txt` (유일한 한글 파일명 예외) |

### 3.4 폴더명 규칙

| 폴더 | 규칙 |
|------|------|
| 일일 폴더 | `reports/YYYYMMDD/` |
| 입력 | `input/` |
| 프레임 | `frames/` |
| 플랫폼별 | `youtube_long/`, `youtube_shorts/`, `tiktok/`, `instagram_reels/`, `threads/` |

## 4. 문서 작성 규칙

### 4.1 마크다운 규칙

- 제목: `#`~`####` (4단계까지)
- 테이블: 가독성 우선, 파이프(`|`) 정렬
- 코드블록: 언어 명시 (```json, ```bash 등)
- 이모지: 제목에 1개, 본문에 적절히 사용
- 링크: 상대 경로 사용 (`[RULE.md](RULE.md)`)

### 4.2 버전 표기

- 문서 하단에 `*파일명 — Last updated: YYYY-MM-DD*` 형식
- CHANGELOG.md에 주요 변경 기록

## 5. 브랜드 보이스 가이드

| 속성 | Do ✅ | Don't ❌ |
|------|------|---------|
| **Smart** | 정확한 데이터, 수학적 엄밀함 | 모호한 표현, 추측성 주장 |
| **Challenging** | "Can YOU solve this?" | "This is easy" |
| **Premium** | Mensa급 난이도 언급 | 저급한 퍼즐, 아이 수준 |
| **Engaging** | CTA 자연스럽게 삽입 | 스팸성 URL 나열 |
| **Consistent** | 매일 동일한 템플릿/색상 | 매번 다른 디자인 |

---

*STYLE_GUIDE.md — Last updated: 2026-07-06*
