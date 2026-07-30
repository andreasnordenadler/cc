const authPathPattern = /^\/sign-(?:in|up)(?:\/|$)/;
const returnOrigin = "https://return.sidequestchess.invalid";

function isUnsafePath(pathname: string) {
  return pathname.startsWith("//")
    || pathname.includes("\\")
    || /[\u0000-\u001f\u007f]/.test(pathname)
    || authPathPattern.test(pathname);
}

export function safeAuthReturnPath(value: string | string[] | undefined, fallback = "/") {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\") || /[\u0000-\u001f\u007f]/.test(raw)) {
    return fallback;
  }

  let normalized: URL;
  let decodedPathname: string;
  try {
    normalized = new URL(raw, returnOrigin);
    decodedPathname = decodeURIComponent(normalized.pathname);
  } catch {
    return fallback;
  }

  if (normalized.origin !== returnOrigin || isUnsafePath(normalized.pathname) || isUnsafePath(decodedPathname)) {
    return fallback;
  }

  let decodedNormalizedPath: string;
  try {
    decodedNormalizedPath = new URL(decodedPathname, returnOrigin).pathname;
  } catch {
    return fallback;
  }

  if (isUnsafePath(decodedNormalizedPath)) {
    return fallback;
  }

  return `${normalized.pathname}${normalized.search}${normalized.hash}`;
}

export function buildSignInHref(returnPath: string | undefined) {
  const safeReturnPath = safeAuthReturnPath(returnPath);
  return `/sign-in?redirect_url=${encodeURIComponent(safeReturnPath)}`;
}
