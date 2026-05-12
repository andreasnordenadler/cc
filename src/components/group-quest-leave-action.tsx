"use client";

import { useRouter } from "next/navigation";

const storagePrefix = "sqc-groupquest-participant:";

export default function GroupQuestLeaveAction({ id }: { id: string }) {
  const router = useRouter();

  function leaveSideQuest() {
    const confirmed = window.confirm(
      "Retire from this Side Quest? Your coat of arms will dramatically sigh, your leaderboard goblin will pack up the tiny scoreboard, and your current entry will be removed from this device."
    );

    if (!confirmed) return;

    window.localStorage.removeItem(`${storagePrefix}${id}`);
    router.push(`/groupquests/${id}`);
  }

  return (
    <section className="groupquest-leave-zone" aria-label="Leave this Multiplayer Side Quest">
      <button className="groupquest-leave-button" type="button" onClick={leaveSideQuest}>
        Leave this Side Quest
      </button>
    </section>
  );
}
