"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ChallengeBadge from "@/components/challenge-badge";
import type { Challenge } from "@/lib/challenges";

type SortMode = "recommended" | "easy-first" | "hard-first" | "points-high" | "points-low";
type DifficultyFilter = "All" | Challenge["difficulty"];
type StatusFilter = "All" | "Active" | "Completed" | "Open";

type ChallengeDeckBrowserProps = {
  challenges: Challenge[];
  activeChallengeId?: string;
  completedChallengeIds: string[];
};

const difficultyRank: Record<Challenge["difficulty"], number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
  Brutal: 4,
  Absurd: 5,
};

const difficultyFilters: DifficultyFilter[] = ["All", "Easy", "Medium", "Hard", "Brutal", "Absurd"];

export default function ChallengeDeckBrowser({ challenges, activeChallengeId, completedChallengeIds }: ChallengeDeckBrowserProps) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [sort, setSort] = useState<SortMode>("recommended");
  const completedSet = useMemo(() => new Set(completedChallengeIds), [completedChallengeIds]);

  const visibleChallenges = useMemo(() => {
    const filtered = challenges.filter((challenge) => {
      const isActive = activeChallengeId === challenge.id;
      const isCompleted = completedSet.has(challenge.id);

      if (difficulty !== "All" && challenge.difficulty !== difficulty) return false;
      if (status === "Active" && !isActive) return false;
      if (status === "Completed" && !isCompleted) return false;
      if (status === "Open" && (isActive || isCompleted)) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "easy-first") return difficultyRank[a.difficulty] - difficultyRank[b.difficulty] || a.reward - b.reward;
      if (sort === "hard-first") return difficultyRank[b.difficulty] - difficultyRank[a.difficulty] || b.reward - a.reward;
      if (sort === "points-high") return b.reward - a.reward || difficultyRank[b.difficulty] - difficultyRank[a.difficulty];
      if (sort === "points-low") return a.reward - b.reward || difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
      return challenges.indexOf(a) - challenges.indexOf(b);
    });
  }, [activeChallengeId, challenges, completedSet, difficulty, sort, status]);

  return (
    <>
      <section className="mission-card quest-filter-panel" aria-label="Quest filters and sorting">
        <div>
          <h2>Find your next quest.</h2>
        </div>
        <div className="quest-filter-grid">
          <label>
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)}>
              {difficultyFilters.map((filter) => <option key={filter}>{filter}</option>)}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
              <option>All</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Open</option>
            </select>
          </label>
          <label>
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              <option value="recommended">Recommended</option>
              <option value="easy-first">Easy first</option>
              <option value="hard-first">Hard first</option>
              <option value="points-high">Most points</option>
              <option value="points-low">Fewest points</option>
            </select>
          </label>
          <div className="quest-filter-count" aria-live="polite">
            <strong>{visibleChallenges.length}</strong>
            <span>{visibleChallenges.length === 1 ? "quest" : "quests"}</span>
          </div>
        </div>
      </section>

      <section className="big-grid" aria-label="Available quests">
        {visibleChallenges.map((challenge, index) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            featured={sort === "recommended" && index === 0}
            completed={completedSet.has(challenge.id)}
            active={activeChallengeId === challenge.id}
          />
        ))}
      </section>
    </>
  );
}

function ChallengeCard({ challenge, featured, completed, active }: { challenge: Challenge; featured?: boolean; completed?: boolean; active?: boolean }) {
  const difficultyTone = getDifficultyTone(challenge.difficulty);
  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className={`challenge-card clickable-quest-card ${featured ? "featured" : ""} ${active ? "active-quest-card" : ""}`}
      aria-current={active ? "true" : undefined}
    >
      {active ? <span className="active-quest-stamp" aria-label="Active quest" /> : null}
      <div className="card-meta quest-card-meta">
        <strong className="quest-points">+{challenge.reward} pts</strong>
        <span className={`badge difficulty-badge ${difficultyTone}`}>{challenge.difficulty}</span>
      </div>
      <div className="challenge-card-title-row">
        <ChallengeBadge challenge={challenge} earned={completed} presentation="art" />
        <div>
          <h3>{challenge.title}</h3>
          <p>{challenge.objective}</p>
          <em>{challenge.openingHint}</em>
        </div>
      </div>
      {completed ? (
        <div className="card-footer quest-state-row">
          <span className="badge green">completed</span>
        </div>
      ) : null}
    </Link>
  );
}

function getDifficultyTone(difficulty: Challenge["difficulty"]) {
  if (difficulty === "Easy") return "green";
  if (difficulty === "Medium") return "gold";
  if (difficulty === "Hard") return "orange";
  if (difficulty === "Absurd") return "absurd";
  return "danger";
}
