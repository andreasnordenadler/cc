import { containsObjectionablePublicText } from "./ugc-content-filter";

const OBJECTIONABLE_PROFILE_MESSAGE = "Remove objectionable language before publishing your profile.";

export function validatePublicProfileText(displayName: string | undefined, bio: string | undefined): string | null {
  return containsObjectionablePublicText(displayName ?? "", bio ?? "")
    ? OBJECTIONABLE_PROFILE_MESSAGE
    : null;
}
