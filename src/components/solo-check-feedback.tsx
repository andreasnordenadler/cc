import type { SoloCheckActionResult } from "@/lib/solo-check-result";

export function SoloCheckFeedback({ result }: { result: SoloCheckActionResult }) {
  if (result.status === "idle") {
    return null;
  }

  if (result.error) {
    return <p className="sqc-solo-check-feedback error" role="alert">{result.error}</p>;
  }

  return <p className="sqc-solo-check-feedback success" role="status">{result.message}</p>;
}