# SECURITY_PRIVACY.md — 보안 및 개인정보 처리

> 민감 정보 처리 원칙, API 키/자격증명 관리 방식, 접근 권한 관리를 정의합니다.

## 1. 민감 정보 처리 원칙

### 1.1 절대 금지 사항

| # | 금지 항목 | 설명 |
|---|----------|------|
| 1 | API 키 평문 기록 | 어떤 문서에도 API 키를 직접 작성 금지 |
| 2 | 비밀번호 하드코딩 | 코드/문서에 비밀번호 직접 기재 금지 |
| 3 | 개인정보 노출 | 사용자 이름, 이메일, 전화번호 등 평문 노출 금지 |
| 4 | Git 커밋에 시크릿 포함 | `.env`, 키 파일 등을 커밋하지 않음 |
| 5 | 로그에 민감 정보 | 디버그 로그에 API 응답 중 개인정보 출력 금지 |

### 1.2 허용 예외

- **운영 계정 이메일** (`iqspark.info@gmail.com`): CONTEXT.md, RULE.md에 기재 허용 (공개 계정)
- **공식 사이트 URL** (`iqspark.digital`): 문서에 기재 허용

## 2. API 키/자격증명 관리

### 2.1 환경 변수 방식

```bash
# .env 파일 (Git에 커밋하지 않음)
GEMINI_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here
TIKTOK_API_KEY=your_key_here
YOUTUBE_API_KEY=your_key_here
INSTAGRAM_API_KEY=your_key_here
```

### 2.2 .env 파일 규칙

| 항목 | 규칙 |
|------|------|
| 위치 | 프로젝트 루트 (`iq_contents_creator_ver-2.0/.env`) |
| Git | `.gitignore`에 `.env` 포함 — **절대 커밋 금지** |
| 공유 | `.env.example` 파일로 키 이름만 공유 (값은 비움) |
| 관리 | **대표님만** .env 파일 생성/수정 권한 보유 |

### 2.3 .env.example 형식

```bash
# .env.example — API 키 템플릿
# 실제 값은 대표님이 직접 입력합니다.

# LLM APIs
GEMINI_API_KEY=
CLAUDE_API_KEY=

# SNS APIs (향후)
TIKTOK_API_KEY=
YOUTUBE_API_KEY=
INSTAGRAM_API_KEY=

# MCP Servers (향후)
FIRECRAWL_API_KEY=
```

### 2.4 API 키 발급 우선순위

```
🔴 당장 필요: Gemini API Key + Claude API Key
🟡 이번 주: TikTok API (심사 1~2주!) → YouTube API → Instagram API
🟢 확장 시: Supabase/Firebase → AWS S3+Lambda → n8n Cloud
```

## 3. 접근 권한 관리

### 3.1 현재 (1인 운영)

| 역할 | 권한 |
|------|------|
| **대표님** | 모든 권한 (API 키, SNS 계정, 파일 시스템, 의사결정) |
| **지수실장 (AI)** | 로컬 파일 읽기/쓰기, API 호출 (대표님이 설정한 키 사용) |

### 3.2 향후 확장 시

| 역할 | 권한 | 인증 방식 |
|------|------|----------|
| 관리자 (대표님) | 전체 | Supabase Auth (Admin) |
| 에디터 | 콘텐츠 편집, 메타데이터 수정 | Supabase Auth (Editor) |
| 뷰어 | 결과물 조회만 | Supabase Auth (Viewer) |
| AI 에이전트 | API 호출, 파일 생성 | Service Account |

## 4. 데이터 보호

### 4.1 저장 데이터 분류

| 분류 | 예시 | 보호 수준 |
|------|------|----------|
| **공개** | 콘텐츠 결과물, 메타데이터 | 일반 |
| **내부** | analysis.json, trend_report.json | 로컬 저장, Git 커밋 주의 |
| **민감** | API 키, 계정 비밀번호 | .env, 암호화, Git 제외 |

### 4.2 백업 정책

| 항목 | 방법 | 빈도 |
|------|------|------|
| 콘텐츠 결과물 | `reports/YYYYMMDD/` 로컬 보관 | 매일 |
| 프로젝트 문서 | Git 커밋 | 변경 시 |
| .env 파일 | 대표님 별도 안전 보관 | 변경 시 |
| API 키 | 대표님 패스워드 매니저 | 발급/갱신 시 |

## 5. 외부 서비스 보안

### 5.1 API 통신

| 항목 | 기준 |
|------|------|
| 프로토콜 | HTTPS 필수 |
| 인증 | Bearer Token / API Key 방식 |
| 속도 제한 | 각 API의 Rate Limit 준수 |
| 에러 로깅 | 에러 메시지에 API 키 포함 금지 |

### 5.2 SNS 계정 보안

| 항목 | 기준 |
|------|------|
| 계정 | iqspark.info@gmail.com 고정 (RULE 14) |
| 2FA | 가능한 모든 플랫폼에서 활성화 권장 |
| 세션 관리 | 미사용 세션 자동 로그아웃 |
| 업로드 | 대표님만 수동 업로드 (RULE 15) |

## 6. 인시던트 대응

### 6.1 보안 인시던트 유형

| 유형 | 심각도 | 조치 |
|------|--------|------|
| API 키 노출 | 🔴 Critical | 즉시 키 재발급 + Git 이력 정리 |
| 계정 비정상 접근 | 🔴 Critical | 즉시 비밀번호 변경 + 2FA 확인 |
| 민감 정보 커밋 | 🟡 High | git filter-branch 또는 BFG로 이력 제거 |
| API Rate Limit 초과 | 🟢 Medium | 호출 빈도 조정 |

### 6.2 대응 절차

```
1. 발견 즉시 대표님에게 보고
2. 영향 범위 파악
3. 긴급 조치 (키 재발급, 접근 차단 등)
4. 원인 분석 및 재발 방지 대책
5. CONTEXT.md에 인시던트 기록
```

---

*SECURITY_PRIVACY.md — Last updated: 2026-07-06*
