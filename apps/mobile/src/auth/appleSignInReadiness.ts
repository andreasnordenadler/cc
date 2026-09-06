type AppleSignInReadiness = {
  platform: string;
  nativeAvailable: boolean;
  signInLoaded: boolean;
  signUpLoaded: boolean;
};

export function shouldExposeAppleSignIn({
  platform,
  nativeAvailable,
  signInLoaded,
  signUpLoaded,
}: AppleSignInReadiness): boolean {
  return platform === "ios" && nativeAvailable && signInLoaded && signUpLoaded;
}
