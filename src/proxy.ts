import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BACKSLASH_NORMALIZED_PATHS = new Set(["/support", "/terms"]);

function normalizeTrailingBackslashPath(pathname: string) {
  let decodedPathname = pathname;

  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    decodedPathname = pathname;
  }

  const normalizedPathname = decodedPathname.replace(/\\+$/u, "");
  if (normalizedPathname === decodedPathname) return null;
  if (!BACKSLASH_NORMALIZED_PATHS.has(normalizedPathname)) return null;

  return normalizedPathname;
}

export default clerkMiddleware((_auth, request) => {
  const normalizedPathname = normalizeTrailingBackslashPath(request.nextUrl.pathname);
  if (!normalizedPathname) return undefined;

  const url = request.nextUrl.clone();
  url.pathname = normalizedPathname;
  return NextResponse.redirect(url, 308);
});

export const config = {
  matcher: ["/api/mobile/(.*)", "/api/analytics", "/api/groupquests/(.*)", "/api/groupquests", "/((?!_next|.*\\..*|_vercel|api|trpc).*)"],
};
