"use client";

import { useRouter } from "next/navigation";

const storagePrefix = "sqc-groupquest-participant:";

export default function GroupQuestLeaveAction({ id }: { id: string }) {
  const router = useRouter();

  function leaveSideQuest() {
    const confirmed = window.confirm(
      "Leave this Multiplayer Side Quest? Your leaderboard entry on this device will be removed, but you can rejoin later if the quest is still open."
    );

    if (!confirmed) return;

    window.localStorage.removeItem(`${storagePrefix}${id}`);
    router.push(`/groupquests/${id}`);
  }

  return (
    <section className="groupquest-leave-zone" aria-label="Leave this Multiplayer Side Quest">
      <p>Need to leave this Multiplayer Side Quest?</p>
      <button className="groupquest-leave-button" type="button" onClick={leaveSideQuest}>
        Leave quest
      </button>
    </section>
  );
}
