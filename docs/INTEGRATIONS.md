# INTEGRATIONS.md — 연동 도구 및 API 목록

> IQ Spark Studio에서 사용하는 외부 도구, API, MCP 서버의 목록과 설정 방법을 문서화합니다.

## 1. 연동 도구 총괄

| # | 도구/API | 용도 | 상태 | 비용 |
|---|----------|------|------|------|
| 1 | Gemini 3.5 Flash (medium) API | 리서치/이미지분석/정답도출 | ✅ 활성 | 저비용 (Flash 요금제) |
| 2 | Claude Sonnet 4.6 (thinking) API | 카피라이팅 (심층 추론) | ✅ 활성 | ~$5~10/월 |
| 3 | Claude Vision API | 퍼즐 이미지 파싱 | ✅ 활성 | Claude 비용에 포함 |
| 4 | FFmpeg | 영상 렌더링 | ✅ 로컬 설치 | 무료 (오픈소스) |
| 5 | html2canvas | 프레임 이미지 캡처 | ✅ 브라우저 내장 | 무료 (오픈소스) |
| 6 | Web Audio API | BGM 재생/페이드 제어 | ✅ 브라우저 내장 | 무료 |
| 7 | TikTok API | 게시/성과 데이터 | 🟡 심사 중 | 무료 |
| 8 | YouTube Data API v3 | 게시/성과 데이터 | 🟡 신청 예정 | 무료 (일일 할당) |
| 9 | Instagram Graph API | 게시/성과 데이터 | 🟡 신청 예정 | 무료 |
| 10 | Firecrawl MCP | 트렌드/키워드 수집 | ✅ MCP 서버 | 무료~유료 |
| 11 | Memory MCP | 이력 관리 | ✅ MCP 서버 | 무료 |

## 2. LLM API 상세

### 2.1 Gemini 3.5 Flash — medium (Google AI)

| 항목 | 내용 |
|------|------|
| **엔드포인트** | `https://generativelanguage.googleapis.com/v1beta/` |
| **인증** | API Key (`.env` → `GEMINI_API_KEY`) |
| **모델** | `gemini-3.5-flash` |
| **모드** | `medium` (속도/품질 균형) |
| **용도** | 트렌드 리서치, 키워드 분석, 정책 리서치, 이미지 분석, 정답 도출 |
| **Rate Limit** | 무료 티어: 60 RPM, 1500 RPD |
| **비용** | 무료 티어 범위 내 운영 |

**설정 방법:**
1. [Google AI Studio](https://aistudio.google.com/)에서 API 키 발급
2. `.env` 파일에 `GEMINI_API_KEY=your_key` 추가
3. 프로젝트에서 환경 변수로 참조

### 2.2 Claude Sonnet 4.6 — thinking (Anthropic)

| 항목 | 내용 |
|------|------|
| **엔드포인트** | `https://api.anthropic.com/v1/messages` |
| **인증** | API Key (`.env` → `CLAUDE_API_KEY`) |
| **모델** | `claude-sonnet-4.6` |
| **모드** | `thinking` (심층 추론 — 카피 품질 극대화) |
| **용도** | 카피라이팅 (Hook, 캡션, 해시태그, 고정 댓글) |
| **Rate Limit** | 티어별 상이 |
| **비용** | ~$3~5/월 (일일 1회 사용 기준) |

**설정 방법:**
1. [Anthropic Console](https://console.anthropic.com/)에서 API 키 발급
2. `.env` 파일에 `CLAUDE_API_KEY=your_key` 추가
3. 프로젝트에서 환경 변수로 참조

## 3. 미디어 도구

### 3.1 FFmpeg

| 항목 | 내용 |
|------|------|
| **용도** | 영상 렌더링 (이미지 시퀀스 → MP4) |
| **버전** | 4.x 이상 권장 |
| **설치** | [ffmpeg.org](https://ffmpeg.org/download.html) |
| **출력 사양** | H.264, 30fps, yuv420p |

**렌더링 명령어 예시:**
```bash
# 세로형 (9:16)
ffmpeg -y -framerate 1/26 -i frames/problem_p1.png \
  -framerate 1/4 -i frames/answer_a1.png \
  -framerate 1/26 -i frames/problem_p2.png \
  -framerate 1/4 -i frames/cta_frame.png \
  -vf "scale=1080:1920" \
  -c:v libx264 -r 30 -pix_fmt yuv420p \
  portrait.mp4

# BGM 적용 시
ffmpeg -y -i portrait.mp4 -i bgm.mp3 \
  -filter:a "volume=0.35,afade=t=in:st=0:d=1,afade=t=out:st=58:d=2" \
  -c:v copy -c:a aac -shortest \
  portrait_with_bgm.mp4
```

### 3.2 html2canvas

| 항목 | 내용 |
|------|------|
| **용도** | HTML 요소 → PNG 이미지 변환 |
| **버전** | Latest |
| **설치** | CDN 또는 npm |
| **주의사항** | 투명도 버그 방지 — 불투명 실색 사용 (WEBAPP RULE 6) |

```html
<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
```

### 3.3 Web Audio API

| 항목 | 내용 |
|------|------|
| **용도** | BGM 60초 재생 + 앞뒤 2초 페이드 인/아웃 |
| **설치** | 불필요 (브라우저 내장) |
| **주의사항** | 사용자 인터랙션 후에만 AudioContext 시작 가능 |

## 4. SNS API (향후)

### 4.1 TikTok API

| 항목 | 내용 |
|------|------|
| **상태** | 🟡 심사 중 (1~2주 소요) |
| **용도** | 게시물 메타데이터 조회, 성과 데이터 수집 |
| **인증** | OAuth 2.0 |
| **주의** | 직접 업로드 금지 (RULE 15) — 메타데이터 조회만 |

### 4.2 YouTube Data API v3

| 항목 | 내용 |
|------|------|
| **상태** | 🟡 신청 예정 |
| **용도** | 영상 메타데이터 조회, 댓글 관리, 성과 데이터 |
| **인증** | OAuth 2.0 + API Key |
| **할당량** | 일일 10,000 units (무료) |

### 4.3 Instagram Graph API

| 항목 | 내용 |
|------|------|
| **상태** | 🟡 신청 예정 |
| **용도** | 게시물 인사이트, 성과 데이터 |
| **인증** | Facebook OAuth |
| **전제** | Facebook 비즈니스 페이지 연결 필요 |

## 5. MCP 서버

### 5.1 Firecrawl MCP

| 항목 | 내용 |
|------|------|
| **용도** | 트렌드/키워드 수집, 정책 리서치 |
| **프로토콜** | MCP (Model Context Protocol) |
| **설정** | MCP 설정 파일에 서버 등록 |

### 5.2 Memory MCP

| 항목 | 내용 |
|------|------|
| **용도** | 과거 이력 관리 (해시태그, Hook, 성과 데이터) |
| **프로토콜** | MCP (Model Context Protocol) |
| **데이터** | 30일 롤링 윈도우 |

## 6. 향후 도입 예정

| 도구 | 시기 | 용도 |
|------|------|------|
| Supabase | 팀 확장 시 | Auth + DB + Storage |
| AWS S3 | SaaS 전환 시 | 파일 스토리지 |
| AWS Lambda | SaaS 전환 시 | 서버리스 렌더링 |
| n8n Cloud | 자동화 고도화 시 | 워크플로우 자동화 |

---

*INTEGRATIONS.md — Last updated: 2026-07-06*
