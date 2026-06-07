import { clerkMiddleware } from "@clerk/nextjs/server";
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

export default clerkMiddleware((_auth, request) => {
  const normalizedPathname = normalizeBackslashPath(request.nextUrl.pathname);

  if (!normalizedPathname) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = normalizedPathname;

  return NextResponse.redirect(destination, 308);
});

export const config = {
  matcher: ["/api/mobile/(.*)", "/api/analytics", "/api/groupquests/(.*)", "/api/groupquests", "/((?!_next|.*\\..*|_vercel|api|trpc).*)"],
};
