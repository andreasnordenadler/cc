import { NextResponse, type NextRequest } from "next/server";

const BACKSLASH_SEGMENT_PATTERN = /(?:\\|%5c)/gi;

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.search(BACKSLASH_SEGMENT_PATTERN) === -1) {
    return NextResponse.next();
  }

  const normalizedPathname = pathname
    .replace(BACKSLASH_SEGMENT_PATTERN, "/")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "") || "/";

  const url = request.nextUrl.clone();
  url.pathname = normalizedPathname;

  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)"],
};
