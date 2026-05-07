/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { decodePublicProof } from "@/lib/proof-share";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 1600,
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const decoded = await decodePublicProof(token);

  if (!decoded) {
    return new Response("Invalid proof", { status: 404 });
  }

  const { payload, challenge } = decoded;
  const timeZone = safeTimeZone(new URL(request.url).searchParams.get("tz"));
  const dateLabel = formatScrollDate(payload.completedGameAt ?? payload.checkedAt, timeZone);
  const badgeImage = challenge?.badgeIdentity.image ? new URL(challenge.badgeIdentity.image, request.url).toString() : null;
  const sealImage = new URL("/stamps/sqc-wax-seal-canonical.png", request.url).toString();
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
          padding: 70,
          fontFamily: "Georgia, serif",
          color: "#2a160d",
        }}
      >
        <div
          style={{
            width: 860,
            height: 1380,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            padding: "88px 72px 250px",
            overflow: "hidden",
            borderRadius: "26px 42px 32px 48px",
            border: "2px solid rgba(82,38,15,.22)",
            background: "radial-gradient(circle at 50% 28%, rgba(255,255,255,.34), transparent 28%), radial-gradient(circle at 12% 10%, rgba(120,58,18,.22), transparent 18%), radial-gradient(circle at 88% 88%, rgba(120,58,18,.22), transparent 20%), linear-gradient(135deg, #f2d6a5, #c6904f 48%, #f0d2a0)",
            boxShadow: "inset 0 0 80px rgba(82,38,15,.28), 0 54px 120px rgba(0,0,0,.36)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 24,
              border: "2px solid rgba(82,38,15,.18)",
              borderRadius: "30px 48px 34px 44px",
              background: "linear-gradient(90deg, rgba(82,38,15,.1), transparent 14% 86%, rgba(82,38,15,.12))",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -84,
              top: -88,
              width: 184,
              height: 184,
              borderRadius: 999,
              background: "radial-gradient(circle, rgba(74,31,11,.5), rgba(120,58,18,.22) 44%, transparent 70%)",
              opacity: .78,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -96,
              top: -72,
              width: 184,
              height: 184,
              borderRadius: 999,
              background: "radial-gradient(circle, rgba(74,31,11,.5), rgba(120,58,18,.22) 44%, transparent 70%)",
              opacity: .78,
            }}
          />

          <div
            style={{
              height: 330,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {badgeImage ? (
              <img
                src={badgeImage}
                alt=""
                width="300"
                height="300"
                style={{ width: 300, height: 300, objectFit: "contain", filter: "drop-shadow(0 28px 44px rgba(82,38,15,.34))" }}
              />
            ) : (
              <div
                style={{
                  width: 240,
                  height: 270,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "44px 44px 82px 82px",
                  border: "14px solid #7c2d12",
                  background: "linear-gradient(160deg, #24100d, #5f1d14)",
                  color: "#f5c86a",
                  fontSize: 80,
                  fontWeight: 900,
                }}
              >
                {payload.badgeMotif || "SQC"}
              </div>
            )}
          </div>
          <div style={{ color: "rgba(43,23,13,.72)", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 22, letterSpacing: 4.2, textTransform: "uppercase", fontWeight: 1000 }}>
            Side Quest Chess hereby admits
          </div>
          <div style={{ color: "#251109", fontSize: 78, lineHeight: .92, letterSpacing: -3.6, fontWeight: 900, marginTop: 22, maxWidth: 610 }}>
            {payload.badgeName}
          </div>
          <div style={{ color: "rgba(43,23,13,.86)", fontSize: 33, lineHeight: 1.43, fontWeight: 700, marginTop: 30, maxWidth: 640 }}>
            {achievementCopy}
          </div>
          <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 27, lineHeight: 1.32, marginTop: 26, padding: "24px 26px", maxWidth: 650, color: "rgba(43,23,13,.76)", fontWeight: 850, borderTop: "2px solid rgba(82,38,15,.18)", borderBottom: "2px solid rgba(82,38,15,.18)" }}>
            {`Proof accepted: ${payload.challengeTitle} — ${payload.summary}`}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 24, color: "rgba(43,23,13,.66)", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 22, fontWeight: 1000, letterSpacing: 1.6, textTransform: "uppercase" }}>
            <span style={{ padding: "12px 16px", borderRadius: 999, background: "rgba(82,38,15,.08)" }}>{dateLabel}</span>
            <span style={{ padding: "12px 16px", borderRadius: 999, background: "rgba(82,38,15,.08)" }}>+{payload.reward} pts</span>
          </div>
          <img
            src={sealImage}
            alt=""
            width="190"
            height="190"
            style={{ position: "absolute", bottom: 70, left: 335, width: 190, height: 190, objectFit: "contain", transform: "rotate(4deg)", filter: "drop-shadow(0 24px 36px rgba(82,38,15,.42))" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: 70,
            bottom: 42,
            color: "#f8e9c8",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          sidequestchess.com
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    },
  );
}

function formatScrollDate(value?: string, timeZone?: string) {
  if (!value) return "Recorded by SQC";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recorded by SQC";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

function safeTimeZone(value: string | null) {
  if (!value) return undefined;

  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format(new Date());
    return value;
  } catch {
    return undefined;
  }
}
