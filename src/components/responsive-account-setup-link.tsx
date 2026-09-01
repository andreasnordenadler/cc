"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const DESKTOP_QUERY = "(min-width: 1180px)";

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
  const [href, setHref] = useState(mobileHref);

  useEffect(() => {
    if (!desktopHref) return;
    const media = window.matchMedia(DESKTOP_QUERY);
    const syncHref = () => setHref(media.matches ? desktopHref : mobileHref);
    syncHref();
    media.addEventListener("change", syncHref);
    return () => media.removeEventListener("change", syncHref);
  }, [desktopHref, mobileHref]);

  if (!desktopHref) {
    return <Link className={className} href={mobileHref}>{children}</Link>;
  }

  return (
    <Link className={className} data-desktop-href={desktopHref} href={href}>
      {children}
    </Link>
  );
}
