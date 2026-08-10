"use client";

export function pickRandomQuestId(ids: readonly string[], random: () => number = Math.random) {
  if (!ids.length) return null;
  const index = Math.min(ids.length - 1, Math.max(0, Math.floor(random() * ids.length)));
  return ids[index] ?? null;
}

export default function DesktopRandomQuestButton({ questIds }: { questIds: readonly string[] }) {
  function handleClick() {
    const id = pickRandomQuestId(questIds);
    if (id) window.location.assign(`/challenges/${encodeURIComponent(id)}`);
  }

  return (
    <button type="button" className="sqc-desktop-random-quest" onClick={handleClick} disabled={!questIds.length}>
      Surprise me with a random Solo Side Quest
    </button>
  );
}
