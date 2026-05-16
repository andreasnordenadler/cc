"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GroupQuestRefreshButton() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <button
      className="button secondary groupquest-refresh-button"
      type="button"
      disabled={refreshing}
      onClick={() => {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => setRefreshing(false), 700);
      }}
    >
      {refreshing ? "Refreshing…" : "Refresh checks"}
    </button>
  );
}
