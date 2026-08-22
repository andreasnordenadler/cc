export function shouldUseDevTrackerPreview(input: { isDev: boolean; authenticated: boolean }): boolean {
  return input.isDev && !input.authenticated;
}
