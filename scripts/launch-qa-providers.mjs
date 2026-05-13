#!/usr/bin/env node
const username = process.env.SQC_QA_CHESS_USERNAME || "and72nor";
const checks = [];

async function record(name, fn) {
  try {
    checks.push({ name, status: "pass", ...(await fn()) });
  } catch (error) {
    checks.push({ name, status: "fail", error: String(error?.message ?? error) });
  }
}

await record(`Lichess public latest games for ${username}`, async () => {
  const response = await fetch(`https://lichess.org/api/games/user/${encodeURIComponent(username)}?max=1&pgnInJson=true&moves=true`, {
    headers: { Accept: "application/x-ndjson" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const firstLine = (await response.text()).trim().split("\n")[0];
  if (!firstLine) throw new Error("no games returned");
  const game = JSON.parse(firstLine);
  return {
    http: response.status,
    gameId: game.id,
    hasMoves: Boolean(game.moves),
    players: Object.keys(game.players || {}).join("/"),
  };
});

await record(`Chess.com public monthly archive for ${username}`, async () => {
  const headers = { "User-Agent": "SideQuestChessLaunchQA/1.0" };
  const archiveResponse = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(username)}/games/archives`, { headers });
  if (!archiveResponse.ok) throw new Error(`archives HTTP ${archiveResponse.status}`);
  const archives = await archiveResponse.json();
  const latestArchive = archives.archives?.at(-1);
  if (!latestArchive) throw new Error("no archives returned");

  const gamesResponse = await fetch(latestArchive, { headers });
  if (!gamesResponse.ok) throw new Error(`games HTTP ${gamesResponse.status}`);
  const games = await gamesResponse.json();
  const game = games.games?.at(-1);
  if (!game) throw new Error("no games in latest archive");
  return {
    http: gamesResponse.status,
    archive: latestArchive,
    url: game.url,
    hasPgn: Boolean(game.pgn),
    timeClass: game.time_class,
  };
});

const report = { checkedAt: new Date().toISOString(), username, checks };
console.log(JSON.stringify(report, null, 2));
if (checks.some((check) => check.status === "fail")) process.exit(1);
