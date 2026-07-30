const authPathPattern = /^\/sign-(?:in|up)(?:\/|\?|#|$)/;

export function safeAuthReturnPath(value: string | string[] | undefined, fallback = "/") {
  const raw = Array.isArray(value) ? value[0] : value;

  if (
    !raw
    || !raw.startsWith("/")
    || raw.startsWith("//")
    || raw.includes("\\")
    || /[\u0000-\u001f\u007f]/.test(raw)
    || authPathPattern.test(raw)
  ) {
    return fallback;
  }

  return raw;
}

export function buildSignInHref(returnPath: string | undefined) {
  const safeReturnPath = safeAuthReturnPath(returnPath);
  return `/sign-in?redirect_url=${encodeURIComponent(safeReturnPath)}`;
}
