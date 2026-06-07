import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!hasEncodedBackslash(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = normalizeBackslashPath(pathname);

  return NextResponse.redirect(url, 308);
}

function hasEncodedBackslash(pathname: string) {
  return /(?:\\|%5c)/i.test(pathname);
}

function normalizeBackslashPath(pathname: string) {
  const normalized = pathname
    .replace(/(?:\\|%5c)+/gi, "/")
    .replace(/\/+/g, "/");

  if (normalized.length > 1 && normalized.endsWith("/")) {
    return normalized.slice(0, -1);
  }

  return normalized || "/";
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)",
};
