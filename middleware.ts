import { NextResponse, type NextRequest } from "next/server";

const BACKSLASH_PATH_SEGMENT = /(?:%5c|\\)+/gi;
const HAS_BACKSLASH_PATH_SEGMENT = /(?:%5c|\\)+/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!HAS_BACKSLASH_PATH_SEGMENT.test(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const normalizedPathname = pathname
    .replace(BACKSLASH_PATH_SEGMENT, "/")
    .replace(/\/+$/, "") || "/";

  url.pathname = normalizedPathname;

  return NextResponse.redirect(url, 308);
}
