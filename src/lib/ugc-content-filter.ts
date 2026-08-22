const BLOCKED_PUBLIC_UGC_TOKENS = new Set([
  "fuck",
  "fucking",
  "shit",
  "cunt",
  "faggot",
  "nigger",
]);

function canonicalToken(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/\p{Cf}/gu, "")
    .replace(/υ/g, "u")
    .replace(/[асеіорѕхк]/g, character => ({ "а": "a", "с": "c", "е": "e", "і": "i", "о": "o", "р": "p", "ѕ": "s", "х": "x", "к": "k" })[character] ?? character)
    .replace(/[013457@$]/g, character => ({ "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" })[character] ?? character)
    .replace(/([^\p{M}])\1{2,}/gu, "$1")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

const BLOCKED_PUBLIC_UGC_SUFFIXES = ["s", "you"];

function isBlockedCandidate(candidate: string): boolean {
  return [...BLOCKED_PUBLIC_UGC_TOKENS].some(blocked => candidate === blocked || BLOCKED_PUBLIC_UGC_SUFFIXES.some(suffix => candidate === `${blocked}${suffix}`));
}

function hasBlockedToken(value: string): boolean {
  const tokens = value.split(/\s+/u).map(canonicalToken).filter(Boolean);
  if (tokens.some(isBlockedCandidate)) return true;

  for (let start = 0; start < tokens.length; start += 1) {
    let joined = "";
    for (let end = start; end < Math.min(tokens.length, start + 8); end += 1) {
      joined += tokens[end];
      if (isBlockedCandidate(joined)) return true;
    }
  }
  return false;
}

export function containsObjectionablePublicText(...values: string[]): boolean {
  return values.some(hasBlockedToken);
}
