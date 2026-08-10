import Link from "next/link";
import type { Challenge } from "@/lib/challenges";

const difficultyRank: Record<Challenge["difficulty"], number> = {
  Easy: 0,
  Medium: 1,
  Hard: 2,
  Brutal: 3,
  Absurd: 4,
};

type DesktopOfficialQuestNavigatorProps = {
  challenges: Challenge[];
  currentId: string;
};

export default function DesktopOfficialQuestNavigator({
  challenges,
  currentId,
}: DesktopOfficialQuestNavigatorProps) {
  const browseOrder = [...challenges].sort((left, right) =>
    difficultyRank[left.difficulty] - difficultyRank[right.difficulty]
      || left.reward - right.reward
      || left.title.localeCompare(right.title),
  );
  const currentIndex = browseOrder.findIndex((challenge) => challenge.id === currentId);
  if (currentIndex < 0) return null;

  const previous = browseOrder[currentIndex - 1];
  const next = browseOrder[currentIndex + 1];

  return (
    <nav className="sqc-desktop-quest-navigator" aria-label="Browse official Solo Side Quests">
      <Link className="sqc-desktop-quest-index-link" href="/side-quests">
        <span aria-hidden="true">←</span>
        All Solo Side Quests
      </Link>
      <div className="sqc-desktop-quest-neighbors">
        {previous ? (
          <Link
            className="sqc-desktop-quest-neighbor previous"
            aria-label={`Previous Solo Side Quest: ${previous.title}`}
            href={`/challenges/${previous.id}`}
          >
            <span>Previous quest</span>
            <strong>{previous.title}</strong>
          </Link>
        ) : null}
        {next ? (
          <Link
            className="sqc-desktop-quest-neighbor next"
            aria-label={`Next Solo Side Quest: ${next.title}`}
            href={`/challenges/${next.id}`}
          >
            <span>Next quest</span>
            <strong>{next.title}</strong>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
