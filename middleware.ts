import { NextResponse, type NextRequest } from "next/server";

const BACKSLASH_SEGMENT_PATTERN = /(?:%5c|\\)+/gi;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.match(BACKSLASH_SEGMENT_PATTERN)) {
    return NextResponse.next();
  }

  const normalizedUrl = request.nextUrl.clone();
  normalizedUrl.pathname = stripTrailingSlash(
    pathname.replace(BACKSLASH_SEGMENT_PATTERN, "/").replace(/\/+/g, "/"),
  );

  return NextResponse.redirect(normalizedUrl, 308);
}

function stripTrailingSlash(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/g, "") : pathname;
}
