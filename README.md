# IQ Contents Creator ver-2.0

> IQ Spark Studio — SNS IQ/논리 퍼즐 콘텐츠 자동화 파이프라인의 운영·개발 문서 체계

## 📋 프로젝트 개요

IQ Contents Creator는 **IQ/논리 퍼즐 콘텐츠**를 자동 생성하여 유튜브 쇼츠, 틱톡, 인스타그램 릴스, 유튜브 롱폼, Threads 등 5대 SNS 플랫폼에 배포하는 **원스톱 자동화 파이프라인**입니다.

### 핵심 특징
- **투 트랙 LLM 아키텍처**: Gemini(리서치/이미지분석) + Claude(카피라이팅)
- **6프레임 쇼츠 구조**: Intro → Q1(Reveal) → A1 → Q2(Comment) → CTA → Final CTA
- **5채널 동시 배포**: YouTube Long/Shorts, TikTok, Instagram Reels, Threads
- **Mensa/Raven/WAIS 급 난이도**: US Audience 타겟, 영문 전용
- **로컬 파일 기반**: 순수 정적 프론트엔드(HTML/CSS/JS), 서버 불필요

## 🚀 Quick Start

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd iq_contents_creator_ver-2.0
```

### 2. 로컬 서버 실행
```bash
# Python
python -m http.server 8000
# → http://localhost:8000

# Node.js
npx serve
# → http://localhost:3000
```

### 3. 단순 실행
`index.html` 더블클릭으로 브라우저에서 바로 실행 가능

### 4. 일일 콘텐츠 제작
1. `reports/YYYYMMDD/input/` 폴더에 문제 이미지 2장(`p1.png`, `p2.png`) 배치
2. 에이전트에게 "오늘 콘텐츠 만들어 줘" 지시
3. 8-Phase 자동화 프로세스 실행
4. `메타데이터_복사용.txt`로 각 플랫폼에 복사·붙여넣기 업로드

## 📂 폴더 구조

```
iq_contents_creator_ver-2.0/
├── docs/                     ← 운영·개발 문서
│   ├── AGENT.md              ← 에이전트 역할·책임·권한
│   ├── PERSONA.md            ← 톤앤매너·타겟 유저·어조 가이드
│   ├── SKILL.md              ← 반복 작업 유형·입출력 형식
│   ├── RULE.md               ← RULE 0~18 절대 규칙
│   ├── CONTEXT.md            ← 프로젝트 배경·현황·출처
│   ├── ARCHITECTURE.md       ← 시스템 구성도·기술 스택
│   ├── WORKFLOW.md           ← 8-Phase 프로세스
│   ├── STYLE_GUIDE.md        ← 브랜드 가이드·표기 규칙
│   ├── GLOSSARY.md           ← 용어 사전
│   ├── QA_CHECKLIST.md       ← 결과물 검수 체크리스트
│   ├── SECURITY_PRIVACY.md   ← 보안·개인정보 처리
│   ├── INTEGRATIONS.md       ← 외부 연동·API 목록
│   └── ENV_SETUP.md          ← 개발 환경 설정
├── prompts/
│   └── PROMPTS.md            ← 재사용 프롬프트 템플릿
├── templates/
│   ├── daily_report.md       ← 일일 보고서 템플릿
│   ├── metadata_copy.md      ← 메타데이터 복사용 템플릿
│   └── episode_checklist.md  ← 에피소드 체크리스트 템플릿
├── tasks/
│   ├── BACKLOG.md            ← 작업 백로그
│   └── ROADMAP.md            ← 로드맵·마일스톤
├── data/
│   └── DATA_SOURCES.md       ← 데이터 출처·라이선스
├── CHANGELOG.md              ← 변경 이력
└── .gitignore                ← Git 제외 대상
```

## 📖 문서 네비게이션

| 카테고리 | 문서 | 설명 |
|----------|------|------|
| **핵심** | [AGENT.md](docs/AGENT.md) | 에이전트의 역할, 책임, 권한, 금지 행동 |
| **핵심** | [RULE.md](docs/RULE.md) | RULE 0~18 절대 규칙 및 예외 처리 |
| **핵심** | [CONTEXT.md](docs/CONTEXT.md) | 프로젝트 배경, 현재 진행 상황 |
| **운영** | [PERSONA.md](docs/PERSONA.md) | 톤앤매너, 타겟 유저, 어조 가이드 |
| **운영** | [SKILL.md](docs/SKILL.md) | 반복 작업 유형, 입출력 형식, 우선순위 |
| **운영** | [WORKFLOW.md](docs/WORKFLOW.md) | 8-Phase 콘텐츠 제작 프로세스 |
| **기술** | [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 시스템 구성도, 기술 스택, 데이터 흐름 |
| **기술** | [INTEGRATIONS.md](docs/INTEGRATIONS.md) | 외부 도구/API 연동 목록 |
| **기술** | [ENV_SETUP.md](docs/ENV_SETUP.md) | 로컬 개발 환경 설정 |
| **가이드** | [STYLE_GUIDE.md](docs/STYLE_GUIDE.md) | 브랜드 보이스, 표기 규칙, 파일명 규칙 |
| **가이드** | [GLOSSARY.md](docs/GLOSSARY.md) | 프로젝트 전용 용어 사전 |
| **품질** | [QA_CHECKLIST.md](docs/QA_CHECKLIST.md) | 결과물 검수 체크리스트 |
| **보안** | [SECURITY_PRIVACY.md](docs/SECURITY_PRIVACY.md) | 민감 정보 처리, API 키 관리 |
| **프롬프트** | [PROMPTS.md](prompts/PROMPTS.md) | 재사용 프롬프트 템플릿 모음 |
| **계획** | [BACKLOG.md](tasks/BACKLOG.md) | 향후 작업 목록 |
| **계획** | [ROADMAP.md](tasks/ROADMAP.md) | 마일스톤, 로드맵 |
| **데이터** | [DATA_SOURCES.md](data/DATA_SOURCES.md) | 데이터 출처, 라이선스 상태 |
| **이력** | [CHANGELOG.md](CHANGELOG.md) | 버전별 변경 이력 |

## 🔗 관련 링크

- **IQ Spark 공식 사이트**: [iqspark.digital](https://iqspark.digital/)
- **콘텐츠 엔진 (Genspark)**: [IQ Spark Studio Agent](https://www.genspark.ai/agents?id=81014719-fe64-4bb6-9f31-18d5f5e09913)
- **운영 계정**: iqspark.info@gmail.com

## 📌 운영 원칙

1. **RULE 0 — 사전 보고**: 모든 게시/API 호출은 대표님 승인 후 실행
2. **Zero Hallucination**: 존재하지 않는 수치 생성 금지, 출처 명시 필수
3. **수학적 무결성**: 정답 역산 3중 검증 필수
4. **US English Only**: 모든 콘텐츠 출력은 미국 영어
5. **로컬 파일 기반**: 모든 결과물은 `reports/YYYYMMDD/` 내 저장

---

*IQ Contents Creator ver-2.0 — Last updated: 2026-07-06*
