"use client";

import { useEffect, useState } from "react";

type MobileWebRelativeTimeProps = {
  value?: string | null;
  fallback: string;
};

export function MobileWebRelativeTime({ value, fallback }: MobileWebRelativeTimeProps) {
  const [label, setLabel] = useState(fallback);

  useEffect(() => {
    setLabel(formatRelativeDateTime(value, fallback));
  }, [fallback, value]);

  return <time dateTime={value ?? undefined} suppressHydrationWarning>{label}</time>;
}

function formatRelativeDateTime(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dateKey = date.toDateString();
  const prefix = dateKey === today.toDateString()
    ? "Today"
    : dateKey === yesterday.toDateString()
      ? "Yesterday"
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${prefix} · ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}
