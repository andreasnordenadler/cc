"use client";

import { useEffect, useRef, useState } from "react";

type DifficultyItem = {
  difficulty: string;
  count: number;
};

export function getDifficultyItemsSignature(items: DifficultyItem[]) {
  return JSON.stringify(items.map(({ difficulty, count }) => [difficulty, count]));
}

export default function DesktopSoloDifficultyNav({ items }: { items: DifficultyItem[] }) {
  const [activeDifficulty, setActiveDifficulty] = useState(items[0]?.difficulty ?? "");
  const initialHashHandledRef = useRef<string | null>(null);
  const itemsSignature = getDifficultyItemsSignature(items);

  useEffect(() => {
    const trackedItems = JSON.parse(itemsSignature) as Array<[string, number]>;
    const difficulties = trackedItems.map(([difficulty]) => difficulty);
    if (!difficulties.length) return;

    let animationFrame = 0;
    const updateActiveDifficulty = () => {
      animationFrame = 0;
      const orientationLine = 168;
      let current = difficulties[0];

      for (const difficulty of difficulties) {
        const heading = document.getElementById(`solo-difficulty-${difficulty.toLowerCase()}`);
        if (heading && heading.getBoundingClientRect().top <= orientationLine) {
          current = difficulty;
        }
      }

      const atDocumentEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      setActiveDifficulty(atDocumentEnd ? difficulties[difficulties.length - 1] : current);
    };
    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateActiveDifficulty);
    };

    const initialHashDifficulty = difficulties.find(
      (difficulty) => window.location.hash === `#solo-difficulty-${difficulty.toLowerCase()}`,
    );
    if (initialHashDifficulty && initialHashHandledRef.current !== window.location.hash) {
      initialHashHandledRef.current = window.location.hash;
      document.getElementById(`solo-difficulty-${initialHashDifficulty.toLowerCase()}`)?.scrollIntoView();
      scheduleUpdate();
    } else {
      scheduleUpdate();
    }
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [itemsSignature]);

  return (
    <nav className="sqc-solo-difficulty-nav" aria-label="Jump to quest difficulty">
      <span>Difficulty</span>
      {items.map((item) => (
        <a
          className="sqc-solo-difficulty-link"
          href={`#solo-difficulty-${item.difficulty.toLowerCase()}`}
          aria-current={activeDifficulty === item.difficulty ? "location" : undefined}
          key={item.difficulty}
          onClick={() => setActiveDifficulty(item.difficulty)}
        >
          <span>{item.difficulty}</span>
          <small>{item.count}</small>
        </a>
      ))}
    </nav>
  );
}
