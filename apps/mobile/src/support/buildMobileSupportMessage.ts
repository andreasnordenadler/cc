type MobileSupportMessageInput = {
  message: string;
  diagnostics: string;
  includeDiagnostics: boolean;
};

export function canComposeMobileSupportMessage(input: { isSignedIn: boolean; hasSessionTokenGetter: boolean }): boolean {
  return input.isSignedIn && input.hasSessionTokenGetter;
}

export function buildMobileSupportMessage({
  message,
  diagnostics,
  includeDiagnostics,
}: MobileSupportMessageInput) {
  const trimmedMessage = message.trim();
  return includeDiagnostics
    ? `${trimmedMessage}\n\n---\n${diagnostics}`
    : trimmedMessage;
}
