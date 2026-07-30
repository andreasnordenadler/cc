"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useSyncExternalStore, type ReactNode } from "react";
import { buildSignInHref } from "@/lib/auth-return-path";

type CurrentPageSignInLinkProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  "aria-label"?: string;
};

type ReactiveSignInLinkProps = CurrentPageSignInLinkProps & {
  pathname: string;
};

function subscribeToHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function getLocationHash() {
  return window.location.hash;
}

function getServerLocationHash() {
  return "";
}

function ReactiveSignInLink({ pathname, children, ...props }: ReactiveSignInLinkProps) {
  const searchParams = useSearchParams();
  const hash = useSyncExternalStore(subscribeToHash, getLocationHash, getServerLocationHash);
  const query = searchParams.toString();
  const href = buildSignInHref(`${pathname}${query ? `?${query}` : ""}${hash}`);

  return <Link href={href} {...props}>{children}</Link>;
}

export default function CurrentPageSignInLink({ children, ...props }: CurrentPageSignInLinkProps) {
  const pathname = usePathname() || "/";
  const fallback = <Link href={buildSignInHref(pathname)} {...props}>{children}</Link>;

  return (
    <Suspense fallback={fallback}>
      <ReactiveSignInLink pathname={pathname} {...props}>{children}</ReactiveSignInLink>
    </Suspense>
  );
}
