"use client";

import { useEffect, useState } from "react";

type ProofTimeProps = {
  value?: string;
  fallback?: string;
  mode?: "date" | "dateTime";
};

export default function ProofTime({
  value,
  fallback = "Recorded by the suspicious little verifier",
  mode = "dateTime",
}: ProofTimeProps) {
  const [label, setLabel] = useState(() => formatProofTime(value, fallback, mode));

  useEffect(() => {
    setLabel(formatProofTime(value, fallback, mode, Intl.DateTimeFormat().resolvedOptions().timeZone));
  }, [fallback, mode, value]);

  return <>{label}</>;
}

function formatProofTime(value: string | undefined, fallback: string, mode: "date" | "dateTime", timeZone?: string) {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(mode === "dateTime" ? { hour: "2-digit" as const, minute: "2-digit" as const, timeZoneName: "short" as const } : {}),
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}
