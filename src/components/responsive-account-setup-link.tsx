"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

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
  const [resolvedHref, setResolvedHref] = useState(desktopHref ?? mobileHref);

  useEffect(() => {
    if (!desktopHref) return;

    const desktopQuery = window.matchMedia("(min-width: 1180px)");
    const updateHref = () => {
      if (desktopQuery.matches) setResolvedHref(desktopHref);
      else setResolvedHref(mobileHref);
    };

    updateHref();
    desktopQuery.addEventListener("change", updateHref);
    return () => desktopQuery.removeEventListener("change", updateHref);
  }, [desktopHref, mobileHref]);

  return <Link className={className} href={resolvedHref}>{children}</Link>;
}
