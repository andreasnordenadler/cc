"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const DESKTOP_QUERY = "(min-width: 1180px)";

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
  const [isDesktop, setIsDesktop] = useState(Boolean(desktopHref));

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return <Link className={className} href={resolveAccountSetupHref(isDesktop, mobileHref, desktopHref)}>{children}</Link>;
}
