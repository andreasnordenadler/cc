type MobileSupportMessageInput = {
  message: string;
  diagnostics: string;
  includeDiagnostics: boolean;
};

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
