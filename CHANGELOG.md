# CHANGELOG.md — 변경 이력

> IQ Contents Creator 프로젝트의 버전별 변경 이력을 기록합니다.

## [2.0.0] — 2026-07-06

### 🎉 초기 구성 (Initial Setup)

#### Added
- **프로젝트 문서 체계 전체 구성**
  - `README.md` — 프로젝트 개요, Quick Start, 문서 네비게이션
  - `docs/AGENT.md` — 에이전트 역할, 책임, 권한, 에스컬레이션
  - `docs/PERSONA.md` — 톤앤매너, 타겟 유저, 어조 가이드
  - `docs/SKILL.md` — 반복 작업 유형 10종, 입출력 형식
  - `docs/RULE.md` — RULE 0~18 절대 규칙 + 웹앱 규칙
  - `docs/CONTEXT.md` — 프로젝트 배경, 현황, 의사결정 이력
  - `docs/ARCHITECTURE.md` — 시스템 구성도, 투 트랙 LLM, 기술 스택
  - `docs/WORKFLOW.md` — 8-Phase 콘텐츠 제작 프로세스
  - `docs/STYLE_GUIDE.md` — 브랜드 가이드, 표기 규칙, 파일명 규칙
  - `docs/GLOSSARY.md` — 프로젝트 용어 사전
  - `docs/QA_CHECKLIST.md` — 결과물 검수 체크리스트
  - `docs/SECURITY_PRIVACY.md` — 보안, API 키 관리, 인시던트 대응
  - `docs/INTEGRATIONS.md` — 연동 도구/API 목록
  - `docs/ENV_SETUP.md` — 로컬 개발 환경 설정

- **Vite + ffmpeg.wasm 웹앱 구현**
  - `webapp/` — Vite 프로젝트 빌드 환경 셋업
  - `webapp/src/main.js` — html2canvas 프레임 캡처 및 ffmpeg.wasm 영상 병합 컨트롤러
  - `webapp/src/js/iq-engine.js` — Seeded RNG 문제 생성 및 LocalStorage 이력 중복 회피
  - `webapp/src/js/audio-clip.js` — Web Audio API 60초 크롭 및 Fade-in/out 처리 오프라인 버퍼
  - `webapp/src/styles/main.css` — 프리미엄 다크 테마 및 반응형 레이아웃 스타일시트

- **프롬프트 템플릿**
  - `prompts/PROMPTS.md` — 재사용 프롬프트 8종

- **재사용 템플릿**
  - `templates/daily_report.md` — 일일 보고서 템플릿
  - `templates/metadata_copy.md` — 메타데이터 복사용 템플릿
  - `templates/episode_checklist.md` — 에피소드 체크리스트

- **작업 관리**
  - `tasks/BACKLOG.md` — 작업 백로그
  - `tasks/ROADMAP.md` — 프로젝트 로드맵

- **데이터 관리**
  - `data/DATA_SOURCES.md` — 데이터 출처, 라이선스

- **기타**
  - `CHANGELOG.md` — 변경 이력 (본 파일)
  - `.gitignore` — 버전 관리 제외 대상

#### 데이터 소스
- Genspark 에이전트 페이지 스캔 (2026-07-06)
- 기존 KI: IQ SPARK 인프라 전략, 일일 자동화 워크플로우
- RULE 0~18 + WEBAPP RULE 1~12 통합

---

## [1.0.0] — 2026년 초

### 최초 버전
- IQ Spark Studio 웹앱 구현 (Genspark)
- RULE 0~18 초기 정립
- 투 트랙 LLM 아키텍처 확정
- 6프레임 쇼츠 구조 설계

---

*CHANGELOG.md — Last updated: 2026-07-06*
