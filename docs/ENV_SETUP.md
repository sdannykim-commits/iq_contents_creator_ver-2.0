# ENV_SETUP.md — 로컬 개발 환경 설정

> IQ Spark Studio를 로컬 환경에서 실행하기 위한 필수 소프트웨어, 버전, 설치 순서를 안내합니다.

## 1. 필수 소프트웨어

| # | 소프트웨어 | 버전 | 필수 여부 | 용도 |
|---|----------|------|----------|------|
| 1 | Node.js | 18.x 이상 | 🟡 권장 | 로컬 서버 (npx serve) |
| 2 | Python | 3.9 이상 | 🟡 권장 | 로컬 서버 (http.server) |
| 3 | FFmpeg | 4.x 이상 | 🔴 필수 | 영상 렌더링 |
| 4 | Git | 최신 | 🔴 필수 | 버전 관리 |
| 5 | 웹 브라우저 | Chrome 최신 | 🔴 필수 | 웹앱 실행, html2canvas |
| 6 | 텍스트 에디터 | VS Code 권장 | 🟡 권장 | 코드/문서 편집 |

> ℹ️ Node.js와 Python 중 하나만 있어도 로컬 서버를 실행할 수 있습니다.

## 2. 설치 순서

### Step 1. Git 설치

**Windows:**
```bash
# winget 사용
winget install Git.Git

# 또는 공식 사이트에서 다운로드
# https://git-scm.com/download/win
```

**설치 확인:**
```bash
git --version
# git version 2.x.x
```

### Step 2. Node.js 설치

**Windows:**
```bash
# winget 사용
winget install OpenJS.NodeJS.LTS

# 또는 공식 사이트에서 다운로드
# https://nodejs.org/
```

**설치 확인:**
```bash
node --version
# v18.x.x 이상

npm --version
# 9.x.x 이상
```

### Step 3. Python 설치 (선택)

**Windows:**
```bash
# winget 사용
winget install Python.Python.3.12

# 또는 공식 사이트에서 다운로드
# https://www.python.org/downloads/
```

**설치 확인:**
```bash
python --version
# Python 3.9.x 이상
```

### Step 4. FFmpeg 설치

**Windows:**
```bash
# winget 사용
winget install Gyan.FFmpeg

# 또는 공식 사이트에서 다운로드
# https://ffmpeg.org/download.html
```

**설치 확인:**
```bash
ffmpeg -version
# ffmpeg version 4.x.x 이상
```

> ⚠️ FFmpeg가 시스템 PATH에 등록되어 있어야 합니다. `ffmpeg` 명령어가 동작하지 않으면 PATH 설정을 확인하세요.

### Step 5. 프로젝트 클론

```bash
git clone <repository-url>
cd iq_contents_creator_ver-2.0
```

### Step 6. 환경 변수 설정

```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env

# .env 파일을 열어 API 키 입력 (대표님 직접)
# GEMINI_API_KEY=your_actual_key
# CLAUDE_API_KEY=your_actual_key
```

> ⚠️ `.env` 파일은 **절대 Git에 커밋하지 마세요**. `.gitignore`에 이미 포함되어 있습니다.

## 3. 로컬 서버 실행

### 방법 1: Node.js (npx serve)

```bash
cd iq_contents_creator_ver-2.0
npx serve
# → http://localhost:3000
```

### 방법 2: Python http.server

```bash
cd iq_contents_creator_ver-2.0
python -m http.server 8000
# → http://localhost:8000
```

### 방법 3: 단순 실행

`index.html` 파일을 더블클릭하여 브라우저에서 바로 실행
> ℹ️ Web Audio API의 페이드 효과가 일부 제한될 수 있습니다. 최적 환경을 위해 로컬 서버 사용을 권장합니다.

## 4. 작업 폴더 준비

### 일일 콘텐츠 작업 시

```bash
# 오늘 날짜 폴더 생성
mkdir -p reports/20260706/input

# 문제 이미지 배치
cp /path/to/puzzle1.png reports/20260706/input/p1.png
cp /path/to/puzzle2.png reports/20260706/input/p2.png

# BGM 배치 (선택)
cp /path/to/music.mp3 reports/20260706/input/bgm.mp3
```

## 5. 개발 도구 설정 (선택)

### VS Code 확장

| 확장 | 용도 |
|------|------|
| Markdown All in One | 마크다운 편집 |
| Markdown Preview Enhanced | 마크다운 미리보기 |
| Live Server | 로컬 서버 자동 새로고침 |
| GitLens | Git 이력 시각화 |

### VS Code 설정 권장

```json
{
  "files.encoding": "utf8",
  "files.eol": "\n",
  "editor.formatOnSave": true,
  "markdown.preview.fontSize": 14
}
```

## 6. 문제 해결 (Troubleshooting)

| 증상 | 원인 | 해결 |
|------|------|------|
| `ffmpeg: command not found` | PATH 미등록 | FFmpeg 설치 후 시스템 PATH에 추가 |
| `python: command not found` | PATH 미등록 또는 `python3` 사용 | `python3 -m http.server 8000` 시도 |
| html2canvas 투명 문제 | CSS opacity 사용 | 불투명 실색 사용 (WEBAPP RULE 6) |
| Web Audio 재생 안 됨 | 사용자 인터랙션 없음 | 페이지 클릭 후 재생 시도 |
| `.env` 키 인식 불가 | 파일명 오류 | `.env` (확장자 없음) 확인 |

---

*ENV_SETUP.md — Last updated: 2026-07-06*
