# WORKFLOW.md — 8-Phase 콘텐츠 제작 프로세스

> IQ Spark Studio의 일일 콘텐츠 제작 프로세스를 8단계로 정의합니다.
> 각 단계별 담당자, 도구, 체크포인트를 명시합니다.

## 전체 프로세스 흐름

```
Phase 1        Phase 2        Phase 3        Phase 4
소재 분석 ──→ 트렌드 리서치 ──→ 카피라이팅 ──→ 프레임 생성
  │              │              │              │
  ▼              ▼              ▼              ▼
Phase 5        Phase 6        Phase 7        Phase 8
영상 렌더링 ──→ 플랫폼 최적화 ──→ 업로드 ──→ 성과 보고
```

## Phase 1 — 소재 분석

| 항목 | 내용 |
|------|------|
| **담당** | 지수실장 (AI) |
| **도구** | Claude Vision, Gemini 3.5 Flash (medium) |
| **입력** | `reports/YYYYMMDD/input/p1.png`, `p2.png` |
| **출력** | `analysis.json` |

### 작업 내용
1. `reports/YYYYMMDD/input/` 내 이미지 2장 감지
2. Claude Vision으로 퍼즐 이미지 파싱
3. 문제 유형 식별 (패턴인식, 논리추론, 수열 등)
4. **정답 역산 3중 검증** (RULE 2)
   - 순방향 풀이: 문제 → 정답
   - 역방향 검증: 정답 → 문제 조건 부합 확인
   - 대안 풀이: 다른 방법으로 동일 정답 도출
5. `analysis.json` 저장

### 체크포인트 ✅
- [ ] 이미지 2장 모두 파싱 완료
- [ ] 3중 검증 통과
- [ ] 검증 실패 시 **즉시 중단 + 대표님 보고** (RULE 2)

---

## Phase 2 — 트렌드 리서치

| 항목 | 내용 |
|------|------|
| **담당** | 지수실장 (AI) |
| **도구** | Gemini 3.5 Flash (medium), Firecrawl MCP, Memory MCP |
| **입력** | 현재 날짜, 과거 이력 |
| **출력** | `trend_report.json` |

### 작업 내용
1. Firecrawl MCP로 IQ/퍼즐 트렌드 키워드 수집
2. Memory MCP에서 과거 30일 해시태그 조회 → 중복 회피 (RULE 12)
3. 최적 게시 시간 분석
4. `trend_report.json` 저장

### 체크포인트 ✅
- [ ] 트렌드 키워드 최소 10개 수집
- [ ] 과거 30일 중복 체크 완료
- [ ] 트렌드 데이터 수집 실패 시 이전 데이터 기반 진행 + 보고

---

## Phase 3 — 카피라이팅

| 항목 | 내용 |
|------|------|
| **담당** | 지수실장 (AI) |
| **도구** | Claude Sonnet 4.6 (thinking) |
| **입력** | `analysis.json`, `trend_report.json` |
| **출력** | `copy_5platform.json` |

### 작업 내용
1. 5플랫폼 맞춤 카피 생성:
   - YouTube Long: 제목, 설명, 태그, 고정 댓글
   - YouTube Shorts: 제목, 설명, 해시태그
   - TikTok: 캡션, 해시태그, AI 라벨
   - Instagram Reels: 캡션, 해시태그
   - Threads: 텍스트, 해시태그
2. Hook 오버레이 텍스트 5개 생성 (P1상단, P1하단, A1하단, P2상단, P2하단)
3. 해시태그: 플랫폼별 **3~5개** (15개 초과 금지)
4. `copy_5platform.json` 저장

### 체크포인트 ✅
- [ ] 5채널 모두 카피 생성 완료
- [ ] Hook 텍스트 10단어 이내 (RULE 18)
- [ ] US English 확인 (RULE 5)
- [ ] URL 직접 노출 없음 (RULE 4)
- [ ] AI 라벨 포함 (RULE 8)

---

## Phase 4 — 프레임 생성

| 항목 | 내용 |
|------|------|
| **담당** | 지수실장 (AI) |
| **도구** | html2canvas, IQ Spark 템플릿 |
| **입력** | `analysis.json`, 원본 이미지, Hook 텍스트 |
| **출력** | `reports/YYYYMMDD/frames/` (4장) |

### 작업 내용
1. 4장 프레임 생성:
   - `problem_p1.png` (Easy 문제)
   - `answer_a1.png` (해설 + 정답)
   - `problem_p2.png` (Hard 문제)
   - `cta_frame.png` (CTA 카드)
2. 브랜드 템플릿 적용 (RULE 3):
   - 딥블루 배경 `#0F0F1A`
   - 골드/시안 테두리
   - Inter 폰트
3. 해상도: **1080×1920** (9:16)
4. html2canvas 투명도 버그 방지 (WEBAPP RULE 6)

### 체크포인트 ✅
- [ ] 4장 모두 생성 완료
- [ ] 해상도 1080×1920 확인
- [ ] 브랜드 색상/폰트 일치
- [ ] 문제 원본 1:1 클론 확인 (RULE 3)

---

## Phase 5 — 영상 렌더링

| 항목 | 내용 |
|------|------|
| **담당** | 지수실장 (AI) |
| **도구** | ffmpeg.wasm (웹앱), 로컬 FFmpeg CLI |
| **입력** | 프레임 4장, bgm.mp3 (선택) |
| **출력** | `portrait.mp4` (9:16), `landscape.mp4` (16:9) |

### 작업 내용
1. **웹앱 내 렌더링 (ffmpeg.wasm)**:
   - html2canvas로 프레임 4장을 고해상도 PNG로 캡처
   - Web Audio API (AudioClipProcessor)로 BGM 60초 크롭 및 페이드 처리된 WAV 바이너리 생성
   - ffmpeg.wasmDemuxer로 60초 타이밍 슬라이드 합성 및 오디오 병합 후 브라우저 다운로드 트리거
2. **로컬 렌더링 (FFmpeg CLI)**:
   - 프레임 4장 배치 파일 로컬 처리
   - P1 Easy (26초) → A1 (4초) → P2 Hard (26초) → CTA (4초) = **60초**
3. 출력 사양:
   - 코덱: H.264
   - 프레임레이트: 30fps
   - 색공간: yuv420p
4. BGM 적용 (RULE 17):
   - 볼륨: 35%
   - Fade In: 1초
   - Fade Out: 2초
5. 세로형(portrait) + 가로형(landscape) 두 버전

### 체크포인트 ✅
- [ ] 영상 60초 정확히
- [ ] portrait.mp4 + landscape.mp4 생성 (웹앱 또는 로컬 CLI)
- [ ] BGM 볼륨/페이드 확인 (적용 시)
- [ ] 렌더링 오류 없음

---

## Phase 6 — 플랫폼 최적화 + 메타데이터

| 항목 | 내용 |
|------|------|
| **담당** | 지수실장 (AI) |
| **도구** | 파일 시스템 |
| **입력** | `copy_5platform.json`, 렌더링된 영상 |
| **출력** | 각 폴더별 영상 + `메타데이터_복사용.txt` |

### 작업 내용
1. `메타데이터_복사용.txt` 생성 (대표님 복사·붙여넣기용)
2. 플랫폼별 영상 파일 배치:
   - `youtube_long/` — landscape.mp4 + metadata.json
   - `youtube_shorts/` — portrait.mp4 + metadata.json
   - `tiktok/` — portrait.mp4 + metadata.json
   - `instagram_reels/` — portrait.mp4 + metadata.json
   - `threads/` — 텍스트+이미지 metadata.json

### 체크포인트 ✅
- [ ] 5개 폴더 모두 파일 배치 완료
- [ ] 메타데이터_복사용.txt 생성
- [ ] 각 플랫폼별 metadata.json 포함

---

## Phase 7 — 업로드 (대표님 수동)

| 항목 | 내용 |
|------|------|
| **담당** | **대표님** (수동) |
| **도구** | 각 SNS 플랫폼 |
| **입력** | `메타데이터_복사용.txt` + 영상 파일 |

### 작업 내용
1. 대표님이 직접 각 SNS에 로그인 (RULE 14: iqspark.info@gmail.com)
2. `메타데이터_복사용.txt`에서 제목/캡션/해시태그/고정 댓글 복사·붙여넣기
3. 각 플랫폼에 영상 업로드
4. TikTok AI 라벨 설정 (RULE 8)

### 체크포인트 ✅
- [ ] 5채널 모두 업로드 완료
- [ ] 고정 댓글 설정 (P2 정답)
- [ ] 워터마크 없는 영상 확인 (RULE 9)

---

## Phase 8 — 성과 보고

| 항목 | 내용 |
|------|------|
| **담당** | 지수실장 (AI) |
| **도구** | SNS API, Memory MCP |
| **입력** | 게시물 ID, 48시간 경과 |
| **출력** | `daily_summary.md` |

### 작업 내용
1. 게시 **48시간 후** 데이터 수집 (RULE 13):
   - 조회수, 좋아요, 댓글, 공유, 저장
2. 상위/하위 20% 패턴 분석
3. `daily_summary.md` 작성
4. Memory MCP에 성과 데이터 축적
5. 다음 콘텐츠에 인사이트 반영

### 체크포인트 ✅
- [ ] 5채널 데이터 수집 완료
- [ ] 패턴 분석 완료
- [ ] daily_summary.md 저장
- [ ] Memory MCP 업데이트

---

## 실행 트리거 조건

| 트리거 | 설명 |
|--------|------|
| 대표님 지시 | "오늘 콘텐츠 만들어 줘" / "X월 XX일 콘텐츠 만들자" |
| 입력 폴더 감지 | `reports/YYYYMMDD/input/`에 문제 이미지 2장 감지 |
| 정기 스케줄 | (향후 n8n 자동화 시 설정) |

---

*WORKFLOW.md — Last updated: 2026-07-06*
