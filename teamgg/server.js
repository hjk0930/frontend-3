const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, "data");
const DATA_PATH = path.join(DATA_DIR, "players.json");

app.use(express.json({ limit: "200kb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, "[]\n", "utf-8");
}

function normalizeNickname(nickname) {
  return String(nickname || "").trim().toLowerCase();
}

function sanitizePlayer(player = {}) {
  return {
    nickname: String(player.nickname || "").trim(),
    tier: String(player.tier || "").trim(),
    line: String(player.line || "").trim(),
    champion: String(player.champion || "").trim(),
    score: Number(player.score) || 0
  };
}

function isValidPlayer(player) {
  return Boolean(
    player &&
    player.nickname &&
    player.tier &&
    player.line &&
    Number.isFinite(Number(player.score))
  );
}

function readPlayers() {
  ensureDataFile();
  try {
    const rawData = fs.readFileSync(DATA_PATH, "utf-8");
    if (!rawData.trim()) return [];
    const parsedData = JSON.parse(rawData);
    if (!Array.isArray(parsedData)) return [];
    return parsedData.map(sanitizePlayer).filter(isValidPlayer);
  } catch (error) {
    console.error("players.json 읽기/파싱 실패:", error);
    return [];
  }
}

function savePlayers(players) {
  ensureDataFile();
  const sanitizedPlayers = players.map(sanitizePlayer).filter(isValidPlayer);
  const tempPath = `${DATA_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(sanitizedPlayers, null, 2)}
`, "utf-8");
  fs.renameSync(tempPath, DATA_PATH);
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: DATA_PATH });
});

app.get("/api/player-db", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readPlayers());
});

app.post("/api/player-db", (req, res) => {
  const newPlayer = sanitizePlayer(req.body);
  if (!isValidPlayer(newPlayer)) {
    return res.status(400).json({
      success: false,
      message: "nickname, tier, line, score가 필요합니다. champion은 선택 사항입니다."
    });
  }

  const players = readPlayers();
  const existingIndex = players.findIndex(
    player => normalizeNickname(player.nickname) === normalizeNickname(newPlayer.nickname)
  );

  if (existingIndex >= 0) players[existingIndex] = newPlayer;
  else players.push(newPlayer);

  savePlayers(players);
  res.json({ success: true, players });
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`TEAM.GG 서버 실행 중: http://localhost:${PORT}`);
  console.log(`선수 DB 경로: ${DATA_PATH}`);
});
