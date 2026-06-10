# TEAM.GG

LOL 내전 팀 생성기 + 밴픽 + 선수 DB 저장 서버입니다.

## 로컬 실행

```bash
npm install
npm start
```

브라우저에서 `http://localhost:3000` 접속.

## 폴더 구조

```text
TEAM.GG/
├─ public/
│  ├─ index.html
│  └─ images/
├─ data/
│  └─ players.json
├─ server.js
├─ package.json
└─ README.md
```

## 배포 주의

GitHub Pages는 정적 파일만 제공하므로 `/api/player-db` 같은 서버 API와 파일 DB 저장이 작동하지 않습니다.
DB를 여러 사람이 공유하려면 Render, Railway, Fly.io 같은 Node 서버 호스팅에 GitHub 저장소를 연결해 배포해야 합니다.

GitHub Pages에 `public/index.html`만 올리면 화면은 열리지만 선수 DB는 브라우저 localStorage에만 저장됩니다.
즉, 사용자마다 DB가 따로 생깁니다.

## Render 배포 예시

- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variable 선택 사항: `DATA_DIR=/data`

Render 무료 서버의 일반 파일 시스템은 재배포/재시작 시 데이터가 사라질 수 있습니다.
선수 DB를 오래 보존하려면 Render Disk를 붙이고 `DATA_DIR`를 디스크 경로로 설정하세요.
