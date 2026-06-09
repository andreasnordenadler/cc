import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const encodedBackslashPattern = /%5c/gi;
const decodedBackslashPattern = /\\+/g;

const clerkProxy = clerkMiddleware();

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const normalizedPathname = normalizeBackslashPathname(pathname);

  if (normalizedPathname !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = normalizedPathname;
    return NextResponse.redirect(url, 308);
  }

  return clerkProxy(request, event);
}

export const config = {
  matcher: ["/api/mobile/(.*)", "/api/analytics", "/api/support", "/api/groupquests/(.*)", "/api/groupquests", "/((?!_next|.*\\..*|_vercel|api|trpc).*)"],
};

function normalizeBackslashPathname(pathname: string) {
  const decodedBackslashes = pathname.replace(encodedBackslashPattern, "\\");
  const asForwardSlashes = decodedBackslashes.replace(decodedBackslashPattern, "/");
  const withoutDuplicateSlashes = asForwardSlashes.replace(/\/{2,}/g, "/");
  const withoutTrailingSlash = withoutDuplicateSlashes.length > 1
    ? withoutDuplicateSlashes.replace(/\/+$/g, "")
    : withoutDuplicateSlashes;
  return withoutTrailingSlash === "" ? "/" : withoutTrailingSlash;
}
