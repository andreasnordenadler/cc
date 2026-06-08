import { NextResponse, type NextRequest } from "next/server";

function normalizeBackslashPath(pathname: string): string | null {
  const hasBackslash = pathname.includes("\\");
  const hasEncodedBackslash = /%5c/i.test(pathname);

  if (!hasBackslash && !hasEncodedBackslash) {
    return null;
  }

  const normalized = pathname
    .replace(/%5c/gi, "/")
    .replace(/\\+/g, "/")
    .replace(/\/+/g, "/");

  if (normalized !== "/" && normalized.endsWith("/")) {
    return normalized.replace(/\/+$/g, "");
  }

  return normalized || "/";
}

export function middleware(request: NextRequest) {
  const normalizedPath = normalizeBackslashPath(request.nextUrl.pathname);

  if (!normalizedPath || normalizedPath === request.nextUrl.pathname) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = normalizedPath;

  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/:path*",
};
