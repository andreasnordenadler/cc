const MOBILE_SUPPORT_EMAIL = "sam@crowdler.com";
const MOBILE_SUPPORT_SUBJECT = "Side Quest Chess support";

export function buildMobileSupportEmailUrl() {
  return `mailto:${MOBILE_SUPPORT_EMAIL}?subject=${encodeURIComponent(MOBILE_SUPPORT_SUBJECT)}`;
}
