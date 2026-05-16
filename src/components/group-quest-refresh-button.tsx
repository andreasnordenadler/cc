"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GroupQuestRefreshButton({ id }: { id: string }) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <button
      className="button secondary groupquest-refresh-button"
      type="button"
      disabled={refreshing}
      onClick={async () => {
        setRefreshing(true);
        try {
          await fetch(`/api/groupquests/${id}/refresh`, { method: "POST" });
        } finally {
          router.refresh();
          setTimeout(() => setRefreshing(false), 700);
        }
      }}
    >
      {refreshing ? "Refreshing…" : "Refresh checks"}
    </button>
  );
}
