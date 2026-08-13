"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type TrophyDifficulty = "Easy" | "Medium" | "Hard" | "Brutal" | "Absurd";
type TrophyCoat = {
  id: string;
  title: string;
  objective: string;
  difficulty: TrophyDifficulty;
  category: string;
  image: string;
  earned: boolean;
};

const DIFFICULTIES: TrophyDifficulty[] = ["Easy", "Medium", "Hard", "Brutal", "Absurd"];

export default function DesktopTrophyCollection({ coats, signedIn }: { coats: TrophyCoat[]; signedIn: boolean }) {
  const [difficulty, setDifficulty] = useState<TrophyDifficulty | "All">("All");
  const [desktopFiltering, setDesktopFiltering] = useState(false);
  const visibleCoats = desktopFiltering && difficulty !== "All" ? coats.filter((coat) => coat.difficulty === difficulty) : coats;
  const filters: Array<{ label: TrophyDifficulty | "All coats"; value: TrophyDifficulty | "All"; count: number }> = [
    { label: "All coats", value: "All", count: coats.length },
    ...DIFFICULTIES.map((value) => ({ label: value, value, count: coats.filter((coat) => coat.difficulty === value).length })),
  ];

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1180px)");
    const update = () => {
      setDesktopFiltering(desktop.matches);
      if (!desktop.matches) setDifficulty("All");
    };
    update();
    desktop.addEventListener("change", update);
    return () => desktop.removeEventListener("change", update);
  }, []);

  return (
    <div className="sqc-trophy-collection-workspace">
      <aside className="sqc-trophy-difficulty-index" aria-label="Filter coats by difficulty">
        <strong>Browse by difficulty</strong>
        {filters.map((filter) => (
          <button
            className="sqc-trophy-difficulty-count"
            type="button"
            aria-pressed={difficulty === filter.value}
            key={filter.value}
            onClick={() => setDifficulty(filter.value)}
          >
            <span>{filter.label}</span>
            <small>{filter.count}</small>
          </button>
        ))}
      </aside>
      <div className="sqc-coat-grid" aria-label="Official Solo Side Quest coat grid">
        {visibleCoats.map((coat) => (
          <Link key={coat.id} href={`/challenges/${coat.id}`} className="sqc-coat-tile">
            <span className="sqc-coat-tile-art" aria-hidden="true">
              <Image
                className={signedIn && !coat.earned ? "sqc-coat-tile-image locked" : "sqc-coat-tile-image"}
                alt=""
                src={coat.image}
                width={74}
                height={74}
              />
            </span>
            <span className="sqc-coat-tile-details">
              <span className="sqc-coat-tile-context">
                <span>{coat.difficulty}</span>
                <span>{coat.category}</span>
              </span>
              <strong>{coat.title}</strong>
              <span className="sqc-coat-tile-objective">{coat.objective}</span>
              <small>{signedIn ? (coat.earned ? "Unlocked" : "Locked preview") : "Official coat preview"}</small>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
