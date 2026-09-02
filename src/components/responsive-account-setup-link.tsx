"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function resolveAccountSetupHref(_isDesktop: boolean, mobileHref: string, desktopHref?: string) {
  return desktopHref ?? mobileHref;
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
  return <Link className={className} href={resolveAccountSetupHref(false, mobileHref, desktopHref)}>{children}</Link>;
}
