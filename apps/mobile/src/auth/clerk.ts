import { tokenCache } from "@clerk/clerk-expo/token-cache";

export const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const clerkTokenCache = tokenCache;

export function isClerkMobileAuthConfigured() {
  return Boolean(clerkPublishableKey);
}
