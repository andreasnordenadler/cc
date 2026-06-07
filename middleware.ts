import { NextResponse, type NextRequest } from "next/server";

const BACKSLASH_PATTERN = /(?:%5c|\\)/i;
const BACKSLASH_REPLACER = /(?:%5c|\\)/gi;

export function middleware(request: NextRequest) {
  const rawUrl = request.url;

  if (!BACKSLASH_PATTERN.test(rawUrl)) {
    return NextResponse.next();
  }

  const sanitizedUrl = rawUrl.replace(BACKSLASH_REPLACER, "");
  const redirectUrl = new URL(sanitizedUrl);

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ["/:path*"],
};
