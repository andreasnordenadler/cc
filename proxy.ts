import { NextResponse, type NextRequest } from "next/server";

const encodedBackslashPattern = /%5c/gi;
const decodedBackslashPattern = /\\+/g;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPathname = normalizeBackslashPathname(pathname);

  if (normalizedPathname === pathname) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = normalizedPathname;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/:path*",
};

function normalizeBackslashPathname(pathname: string) {
  const decodedBackslashes = pathname.replace(encodedBackslashPattern, "\\");
  const asForwardSlashes = decodedBackslashes.replace(decodedBackslashPattern, "/");
  const withoutDuplicateSlashes = asForwardSlashes.replace(/\/{2,}/g, "/");
  return withoutDuplicateSlashes === "" ? "/" : withoutDuplicateSlashes;
}
