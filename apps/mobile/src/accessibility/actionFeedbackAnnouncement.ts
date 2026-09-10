export type MobileActionFeedbackAnnouncement = {
  message: string;
  options: { queue: true };
};

export function getMobileActionFeedbackAnnouncement(
  platform: string,
  message: string,
): MobileActionFeedbackAnnouncement | null {
  if (platform !== "ios") return null;
  return {
    message,
    options: { queue: true },
  };
}
