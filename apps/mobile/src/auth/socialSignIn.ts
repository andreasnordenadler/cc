export type MobilePlatform = "android" | "ios" | "macos" | "web" | "windows";

/**
 * Apple App Review guideline 4.8 requires an equivalent privacy-focused login
 * option when an iOS app offers third-party social login. Until Sign in with
 * Apple is configured and verified, iOS must use the existing email/password
 * flow only. Android and web retain the currently supported social providers.
 */
export function allowsThirdPartySocialSignIn(platform: MobilePlatform) {
  return platform !== "ios";
}
