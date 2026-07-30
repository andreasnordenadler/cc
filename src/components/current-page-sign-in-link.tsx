"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { buildSignInHref } from "@/lib/auth-return-path";

type CurrentPageSignInLinkProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  "aria-label"?: string;
};

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener("hashchange", onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener("hashchange", onStoreChange);
  };
}

function getLocationSuffix() {
  return `${window.location.search}${window.location.hash}`;
}

function getServerLocationSuffix() {
  return "";
}

export default function CurrentPageSignInLink({ children, ...props }: CurrentPageSignInLinkProps) {
  const pathname = usePathname() || "/";
  const locationSuffix = useSyncExternalStore(subscribeToLocation, getLocationSuffix, getServerLocationSuffix);
  const href = buildSignInHref(`${pathname}${locationSuffix}`);

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
