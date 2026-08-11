"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getAccountReadinessHref, type AccountReadinessField } from "@/lib/account-readiness-navigation";

const DESKTOP_ACCOUNT_QUERY = "(min-width: 1180px)";

function subscribeToDesktopAccount(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_ACCOUNT_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getDesktopAccountSnapshot() {
  return window.matchMedia(DESKTOP_ACCOUNT_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export default function AccountReadinessLink({
  field,
  label,
  value,
}: {
  field: AccountReadinessField;
  label: string;
  value: string;
}) {
  const desktop = useSyncExternalStore(subscribeToDesktopAccount, getDesktopAccountSnapshot, getServerSnapshot);

  return (
    <Link href={getAccountReadinessHref(field, desktop)} className="sqc-readiness-chip">
      <span>{label}</span>
      <strong>{value || "Add"}</strong>
    </Link>
  );
}
