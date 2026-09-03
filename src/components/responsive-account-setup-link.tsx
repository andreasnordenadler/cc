"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";

const DESKTOP_QUERY = "(min-width: 1180px)";

function subscribeToDesktopBoundary(onStoreChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

export function resolveAccountSetupHref(isDesktop: boolean, mobileHref: string, desktopHref?: string) {
  return isDesktop && desktopHref ? desktopHref : mobileHref;
}

export default function ResponsiveAccountSetupLink({
  mobileHref,
  desktopHref,
  className,
  children,
}: {
  mobileHref: string;
  desktopHref?: string;
  className?: string;
  children: ReactNode;
}) {
  const isDesktop = useSyncExternalStore(subscribeToDesktopBoundary, getDesktopSnapshot, () => false);
  return <Link className={className} href={resolveAccountSetupHref(isDesktop, mobileHref, desktopHref)}>{children}</Link>;
}
