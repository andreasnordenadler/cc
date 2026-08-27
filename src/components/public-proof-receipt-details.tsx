import type { PublicProofPayload } from "@/lib/proof-share";

type PublicProofReceiptDetail = {
  label: string;
  value: string;
};

const providerLabels: Record<string, string> = {
  chesscom: "Chess.com",
  lichess: "Lichess",
};

export function buildPublicProofReceiptDetails(payload: PublicProofPayload): PublicProofReceiptDetail[] {
  const providerKey = payload.provider?.trim() ?? "";
  const provider = (providerLabels[providerKey] ?? providerKey) || "Side Quest Chess verifier";
  const gameId = payload.gameId?.trim();
  const finalMove = payload.lastMoveSan?.trim() || payload.lastMoveUci?.trim() || "Final move not attached";
  const completed = formatProofTime(payload.completedGameAt ?? payload.checkedAt);

  return [
    { label: "Game", value: gameId ? `${provider} · ${gameId}` : provider },
    { label: "Final move", value: finalMove },
    { label: "Completed", value: completed },
    { label: "Public proof", value: "Canonical proof link available" },
  ];
}

export default function PublicProofReceiptDetails({ payload }: { payload: PublicProofPayload }) {
  return (
    <dl className="sqc-public-proof-receipt-details" aria-label="Proof receipt details">
      {buildPublicProofReceiptDetails(payload).map((detail) => (
        <div key={detail.label}>
          <dt>{detail.label}</dt>
          <dd>{detail.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatProofTime(value?: string) {
  if (!value) return "Completion time not attached";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Completion time not attached";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}
