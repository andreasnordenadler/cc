"use client";

type RandomSoloQuestLinkProps = {
  challengeIds: string[];
  activeChallengeId?: string;
  completedChallengeIds?: string[];
};

export default function RandomSoloQuestLink({
  challengeIds,
  activeChallengeId,
  completedChallengeIds = [],
}: RandomSoloQuestLinkProps) {
  const handleClick = () => {
    const completedSet = new Set(completedChallengeIds);
    const openPool = challengeIds.filter((id) => id !== activeChallengeId && !completedSet.has(id));
    const pool = openPool.length > 0 ? openPool : challengeIds;
    const nextId = pool[Math.floor(Math.random() * pool.length)] ?? challengeIds[0];
    window.location.href = nextId ? `/challenges/${nextId}` : "/challenges";
  };

  return (
    <button type="button" className="button secondary" aria-label="Surprise me with a random Solo Side Quest" onClick={handleClick}>
      Surprise me with a random Solo Side Quest
    </button>
  );
}
