import { ImageResponse } from "next/og";
import { decodePublicProof } from "@/lib/proof-share";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const decoded = await decodePublicProof(token);

  if (!decoded) {
    return new Response("Invalid proof", { status: 404 });
  }

  const { payload } = decoded;
  const dateLabel = formatScrollDate(payload.completedGameAt ?? payload.checkedAt);
  const achievementCopy = payload.challengeId === "finish-any-game"
    ? "A public chess game was, against all odds, completed. Win, loss, or draw — the clerks checked the paperwork and declared this good enough for a coat of arms."
    : `${payload.summary} The verifier accepted the evidence, so the coat of arms may now be displayed with entirely appropriate smugness.`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #140d0d 0%, #21130d 48%, #0e0b09 100%)",
          padding: 42,
          fontFamily: "Georgia, serif",
          color: "#2a160d",
        }}
      >
        <div
          style={{
            width: 610,
            height: 560,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            padding: "34px 46px 120px",
            borderRadius: 34,
            border: "2px solid rgba(117,70,31,.34)",
            background: "linear-gradient(180deg, #f6dfad 0%, #eecb87 54%, #d7a65d 100%)",
            boxShadow: "0 28px 80px rgba(0,0,0,.42), inset 0 0 0 10px rgba(255,246,210,.18)",
          }}
        >
          <div
            style={{
              width: 104,
              height: 118,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "24px 24px 42px 42px",
              border: "7px solid #7c2d12",
              background: "linear-gradient(160deg, #24100d, #5f1d14)",
              color: "#f5c86a",
              fontSize: 36,
              fontWeight: 900,
              marginBottom: 18,
            }}
          >
            SQC
          </div>
          <div style={{ fontSize: 18, letterSpacing: 3.4, textTransform: "uppercase", color: "#7b3f18", fontWeight: 800 }}>
            Side Quest Chess hereby admits
          </div>
          <div style={{ fontSize: 52, lineHeight: 1, fontWeight: 900, marginTop: 10, maxWidth: 520 }}>
            {payload.badgeName}
          </div>
          <div style={{ fontSize: 24, lineHeight: 1.24, marginTop: 18, maxWidth: 490 }}>
            {achievementCopy}
          </div>
          <div style={{ fontSize: 21, lineHeight: 1.24, marginTop: 14, maxWidth: 500, color: "#5f3217" }}>
            {`Proof accepted: ${payload.challengeTitle} — ${payload.summary}`}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 16, color: "#6d3918", fontSize: 20, fontWeight: 800 }}>
            <span>{dateLabel}</span>
            <span>+{payload.reward} pts</span>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 34,
              left: "50%",
              transform: "translateX(-50%) rotate(4deg)",
              width: 94,
              height: 94,
              borderRadius: 999,
              background: "radial-gradient(circle at 38% 32%, #f06d57, #9f160f 62%, #5c0c09 100%)",
              border: "5px solid #7f100c",
              boxShadow: "0 10px 24px rgba(82,20,11,.42)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: 54,
            bottom: 36,
            color: "#f8e9c8",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          sidequestchess.com
        </div>
      </div>
    ),
    size,
  );
}

function formatScrollDate(value?: string) {
  if (!value) return "Recorded by SQC";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recorded by SQC";

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
