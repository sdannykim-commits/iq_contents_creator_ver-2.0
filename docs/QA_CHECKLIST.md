# QA_CHECKLIST.md — 결과물 검수 체크리스트

> IQ Spark Studio 콘텐츠의 품질을 보장하기 위한 검수 체크리스트입니다.
> 매 에피소드 제작 시 Phase 완료 후 실행합니다.

## 1. Phase 1 검수 — 퍼즐 분석

### 정답 검증
- [ ] 순방향 풀이 통과 (문제 → 정답)
- [ ] 역방향 검증 통과 (정답 → 문제 조건 부합)
- [ ] 대안 풀이 통과 (다른 방법으로 동일 정답)
- [ ] 3중 검증 결과 analysis.json에 기록

### 문제 유형 확인
- [ ] P1 난이도: Easy (적절한 수준)
- [ ] P2 난이도: Hard (Mensa/Raven/WAIS급)
- [ ] 난이도 순서: Easy(P1) → Hard(P2) (RULE 7)
- [ ] 퍼즐 유형 식별 완료 (패턴인식/논리추론/수열 등)

### 중복 검사
- [ ] 과거 30일 이내 동일 퍼즐 없음 (RULE 12)
- [ ] localStorage 서명 중복 없음 (WEBAPP RULE 1)

## 2. Phase 3 검수 — 카피라이팅

### 언어 및 문법
- [ ] 모든 콘텐츠 US English (RULE 5)
- [ ] 오탈자/문법 오류 없음
- [ ] Title Case 적용 (제목)

### Hook 텍스트
- [ ] 10단어 이내 (RULE 18)
- [ ] 숫자 포함 (RULE 18)
- [ ] 0.5초 내 인지 가능한 간결함
- [ ] 과거 30일 이내 동일 Hook 없음 (RULE 12)

### 해시태그
- [ ] 플랫폼별 3~5개 (15개 초과 금지)
- [ ] 트렌드 키워드 반영
- [ ] 과거 이력 중복 체크

### URL 규칙
- [ ] TikTok 캡션에 URL 없음 (RULE 4)
- [ ] IG Reels 캡션에 URL 없음 (RULE 4)
- [ ] YouTube Shorts 캡션에 URL 없음 (RULE 4)
- [ ] Threads 캡션에 URL 없음 (RULE 4)
- [ ] YouTube Long 설명란에만 iqspark.digital (RULE 4 예외)
- [ ] 고정 댓글에 URL 없음 (RULE 11)

### AI 고지
- [ ] TikTok AI 라벨 설정 표기 (RULE 8)
- [ ] 기타 플랫폼 #AIGenerated 포함 (RULE 8)

### CTA 확인
- [ ] 댓글 유도 CTA 포함 ("💬 Comment your answer 👇")
- [ ] 사이트 CTA 포함 ("Check the full solution at iqspark.digital")
- [ ] "Link in bio!" CTA (TikTok/IG)

### 정답 공개 전략
- [ ] P1 (Easy): Reveal Mode — 영상에서 공개 (RULE 6)
- [ ] P2 (Hard): Comment Mode — 고정 댓글에서만 공개 (RULE 6)

## 3. Phase 4 검수 — 프레임

### 해상도 및 포맷
- [ ] 해상도: 1080×1920 (9:16) 확인
- [ ] PNG 포맷
- [ ] 4장 모두 생성 (problem_p1, answer_a1, problem_p2, cta_frame)

### 브랜드 일관성
- [ ] 배경색: `#0F0F1A` (Dark Navy)
- [ ] 강조색: `#F59E0B` (Amber Gold) 또는 `#6366F1` (Indigo Glow)
- [ ] 테두리: 딥블루 + 골드/시안 글로우
- [ ] 폰트: Inter
- [ ] 문제 원본 1:1 클론 (RULE 3)

### 렌더링 품질
- [ ] html2canvas 투명도 버그 없음 (WEBAPP RULE 6)
- [ ] Hook 텍스트 가독성 양호
- [ ] 선택지(A,B,C,D) 명확히 표시

## 4. Phase 5 검수 — 영상

### 기술 사양
- [ ] 총 길이: 60초 정확히
- [ ] 코덱: H.264
- [ ] 프레임레이트: 30fps
- [ ] 색공간: yuv420p
- [ ] portrait.mp4 (9:16) 생성
- [ ] landscape.mp4 (16:9) 생성

### 타이밍
- [ ] P1 Easy: ~26초
- [ ] A1: ~4초
- [ ] P2 Hard: ~26초
- [ ] CTA: ~4초

### BGM (적용 시)
- [ ] 볼륨: 35% (RULE 17)
- [ ] Fade In: 1초 (RULE 17)
- [ ] Fade Out: 2초 (RULE 17)
- [ ] 대표님 제공 BGM만 사용

### 워터마크
- [ ] 타 플랫폼 워터마크 없음 (RULE 9)

## 5. Phase 6 검수 — 메타데이터

### 파일 배치
- [ ] `youtube_long/` — landscape.mp4 + metadata.json
- [ ] `youtube_shorts/` — portrait.mp4 + metadata.json
- [ ] `tiktok/` — portrait.mp4 + metadata.json
- [ ] `instagram_reels/` — portrait.mp4 + metadata.json
- [ ] `threads/` — metadata.json
- [ ] `메타데이터_복사용.txt` 생성

### 메타데이터 내용
- [ ] 5채널 모두 카피 포함
- [ ] 고정 댓글 내용 포함 (P2 정답)
- [ ] 계정: iqspark.info@gmail.com (RULE 14)

## 6. 최종 검수 (Phase 6 완료 후)

### 저작권
- [ ] 원본 저작권 콘텐츠 그대로 복제 아님
- [ ] 사용 이미지 라이선스 확인
- [ ] BGM 저작권 확인 (대표님 제공분)

### 보안
- [ ] API 키/비밀번호 평문 노출 없음
- [ ] 개인정보 포함 없음

### 파일 무결성
- [ ] 모든 파일 UTF-8 인코딩
- [ ] 파일명 규칙 준수 (snake_case)
- [ ] `reports/YYYYMMDD/` 구조 준수 (RULE 10)

---

## 검수 결과 기록 형식

```
📋 QA 검수 결과 — YYYY-MM-DD

■ Phase 1 (퍼즐 분석): ✅ PASS / ❌ FAIL
■ Phase 3 (카피라이팅): ✅ PASS / ❌ FAIL
■ Phase 4 (프레임): ✅ PASS / ❌ FAIL
■ Phase 5 (영상): ✅ PASS / ❌ FAIL
■ Phase 6 (메타데이터): ✅ PASS / ❌ FAIL
■ 최종 검수: ✅ PASS / ❌ FAIL

특이사항: [있을 경우 기재]
```

---

*QA_CHECKLIST.md — Last updated: 2026-07-06*
