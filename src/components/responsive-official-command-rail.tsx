"use client";

import { Fragment, useSyncExternalStore, type ReactNode } from "react";

const DESKTOP_QUERY = "(min-width: 1180px)";

export function getOfficialCommandRailItems(isDesktop: boolean, primaryAction: ReactNode, sharing: ReactNode) {
  return isDesktop
    ? [{ key: "primary", content: primaryAction }, { key: "sharing", content: sharing }] as const
    : [{ key: "sharing", content: sharing }, { key: "primary", content: primaryAction }] as const;
}

function subscribeToDesktopBoundary(onStoreChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

export default function ResponsiveOfficialCommandRail({
  primaryAction,
  sharing,
}: {
  primaryAction: ReactNode;
  sharing: ReactNode;
}) {
  const isDesktop = useSyncExternalStore(subscribeToDesktopBoundary, getDesktopSnapshot, () => false);
  const items = getOfficialCommandRailItems(isDesktop, primaryAction, sharing);

  return (
    <aside className="sqc-quest-command-rail" aria-label="Solo Side Quest actions">
      {items.map((item) => <Fragment key={item.key}>{item.content}</Fragment>)}
    </aside>
  );
}
