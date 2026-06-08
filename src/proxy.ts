import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const BACKSLASH_TOKEN_PATTERN = /(?:\\|%5c)/i;

function normalizeBackslashPath(pathname: string) {
  if (!BACKSLASH_TOKEN_PATTERN.test(pathname)) {
    return null;
  }

  const normalizedPathname = pathname
    .replace(/%5c/gi, "/")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "");

  return normalizedPathname || "/";
}

const clerkProxy = clerkMiddleware();

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const normalizedPathname = normalizeBackslashPath(request.nextUrl.pathname);

  if (normalizedPathname) {
    const destination = request.nextUrl.clone();
    destination.pathname = normalizedPathname;

    return NextResponse.redirect(destination, 308);
  }

  return clerkProxy(request, event);
}

export const config = {
  matcher: ["/api/mobile/(.*)", "/api/analytics", "/api/groupquests/(.*)", "/api/groupquests", "/((?!_next|.*\\..*|_vercel|api|trpc).*)"],
};
