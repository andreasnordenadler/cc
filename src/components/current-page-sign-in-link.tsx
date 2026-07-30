"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { buildSignInHref } from "@/lib/auth-return-path";

type CurrentPageSignInLinkProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  "aria-label"?: string;
};

export default function CurrentPageSignInLink({ children, ...props }: CurrentPageSignInLinkProps) {
  const pathname = usePathname() || "/";
  const href = buildSignInHref(pathname);

  function preserveCurrentQuery(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const exactHref = buildSignInHref(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    if (exactHref === href) return;

    event.preventDefault();
    window.location.assign(exactHref);
  }

  return (
    <Link href={href} onClick={preserveCurrentQuery} {...props}>
      {children}
    </Link>
  );
}
