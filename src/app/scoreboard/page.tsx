import { auth } from "@clerk/nextjs/server";
import SiteNav from "@/components/site-nav";

const PREVIEW_LISTS = [
  {
    title: "Top all-time users",
    rows: ["ChaosGrandmaster", "QueenlessHero", "KnightBeforeCoffee", "RooklessRunner"],
  },
  {
    title: "Most popular quests",
    rows: ["No Castle Club", "Queen? Never Heard of Her", "Knights Before Coffee", "The Blunder Gambit"],
  },
  {
    title: "Today’s most completed quests",
    rows: ["Bishop Field Trip", "Early King Walk", "Pawn Storm Maniac", "Rookless Rampage"],
  },
  {
    title: "Hardest quests cleared",
    rows: ["Certified Queenless Maniac", "No Castle Survivor", "Blunder Gambit Escapee", "Knightmare Mode"],
  },
  {
    title: "Friend challenge streaks",
    rows: ["3 receipts in a row", "2 brutal clears", "5 proof cards shared", "7-day quest streak"],
  },
  {
    title: "Fastest verified proofs",
    rows: ["Fresh receipt · 2 min", "Quick chaos · 4 min", "One-game wonder · 6 min", "Instant regret · 8 min"],
  },
];

export default async function ScoreboardPage() {
  const { userId } = await auth();

  return (
    <main className="site-shell">
      <SiteNav isSignedIn={Boolean(userId)} active="scoreboard" />

      <div className="content-wrap leaderboard-coming-soon-page">
        <section className="hero-card leaderboard-coming-soon-hero">
          <h1>Leaderboard is coming soon.</h1>
          <p className="hero-copy">
            We are keeping this simple for now: Side Quest Chess will rank real, verified proof receipts only. No fake launch numbers, no manual claims — just completed quests, popular challenges, streaks, and receipt-backed bragging rights once enough games are flowing.
          </p>
        </section>

        <section className="leaderboard-preview-grid" aria-label="Coming leaderboard previews">
          {PREVIEW_LISTS.map((list) => (
            <article className="mission-card leaderboard-blur-card" key={list.title}>
              <h2>{list.title}</h2>
              <div className="leaderboard-blurred-list" aria-hidden="true">
                {list.rows.map((row, index) => (
                  <div className="leaderboard-preview-row" key={row}>
                    <strong>#{index + 1}</strong>
                    <span>{row}</span>
                    <em>{["980", "740", "610", "420"][index]} pts</em>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
