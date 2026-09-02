"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

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
  const openMobileDestination = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      !desktopHref
      || event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || window.matchMedia("(min-width: 1180px)").matches
    ) return;

    event.preventDefault();
    window.location.assign(mobileHref);
  };

  return <Link className={className} href={desktopHref ?? mobileHref} onClick={openMobileDestination}>{children}</Link>;
}
