import { containsObjectionablePublicText } from "./ugc-content-filter";

const OBJECTIONABLE_PROFILE_MESSAGE = "Remove objectionable language before publishing your profile.";
const PRIVATE_IDENTITY_PROFILE_MESSAGE = "Use a public name instead of an email address.";

export function validatePublicProfileText(displayName: string | undefined, bio: string | undefined): string | null {
  if (displayName && /[^\s@]+@[^\s@]+/.test(displayName)) return PRIVATE_IDENTITY_PROFILE_MESSAGE;
  return containsObjectionablePublicText(displayName ?? "", bio ?? "")
    ? OBJECTIONABLE_PROFILE_MESSAGE
    : null;
}
