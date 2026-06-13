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
  const resolvedParams = await params;
  const token = normalizeProofToken(resolvedParams?.token);

  if (!token) {
    return new Response("Invalid proof", { status: 404 });
  }

  const decoded = await decodePublicProof(token);

  if (!decoded) {
    return new Response("Invalid proof", { status: 404 });
  }

  const { payload, challenge } = decoded;
  const timeZone = safeTimeZone(new URL(request.url).searchParams.get("tz"));
  const dateLabel = formatScrollDate(payload.completedGameAt ?? payload.checkedAt, timeZone);
  const badgeImageSource = payload.badgeImageUrl || challenge?.badgeIdentity.image;
  const badgeImage = badgeImageSource ? new URL(badgeImageSource, request.url).toString() : null;
  const sealImage = new URL("/stamps/sqc-wax-seal-canonical.png", request.url).toString();
  const scrollTemplateImage = new URL("/scrolls/sqc-victory-scroll-template-og.jpg", request.url).toString();
  const achievementCopy = payload.challengeId === "finish-any-game"
    ? "A public chess game was completed, verified, and entered into the Side Quest Chess ledgers."
    : "The verifier accepted the public-game proof. The coat of arms may now be displayed with entirely appropriate smugness.";
  const proofLine = `${payload.summary}`;

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
          fontFamily: "Georgia, serif",
          color: "#2a160d",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 1024,
            height: 1536,
            display: "flex",
            position: "relative",
            filter: "drop-shadow(0 42px 76px rgba(0,0,0,.46))",
          }}
        >
          <img
            src={scrollTemplateImage}
            alt=""
            width="1024"
            height="1536"
            style={{ position: "absolute", inset: 0, width: 1024, height: 1536, objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              left: 256,
              top: 276,
              width: 512,
              height: 920,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={sealImage}
              alt=""
              width="86"
              height="86"
              style={{ width: 86, height: 86, objectFit: "contain", marginTop: 42, filter: "drop-shadow(0 12px 16px rgba(82,38,15,.32))" }}
            />
            <div style={{ marginTop: 18, color: "rgba(58,32,12,.78)", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 21, letterSpacing: 3.1, textTransform: "uppercase", fontWeight: 1000 }}>
              Side Quest completed
            </div>
            <div style={{ color: "#2d1808", fontSize: 54, lineHeight: .95, letterSpacing: -1.8, fontWeight: 900, marginTop: 18, maxWidth: 470 }}>
              {payload.challengeTitle}
            </div>
            <div
              style={{
                height: 218,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 18,
                width: 240,
                borderRadius: 48,
                background: "radial-gradient(circle at 50% 45%, rgba(255,244,219,.98), rgba(236,194,125,.92) 58%, rgba(151,84,36,.18) 78%, transparent 79%)",
                boxShadow: "inset 0 0 0 3px rgba(82,38,15,.1), 0 18px 30px rgba(82,38,15,.2)",
              }}
            >
              {badgeImage ? (
                <img
                  src={badgeImage}
                  alt=""
                  width="210"
                  height="210"
                  style={{ width: 210, height: 210, objectFit: "contain", filter: "drop-shadow(0 18px 24px rgba(82,38,15,.3))" }}
                />
              ) : (
                <div
                  style={{
                    width: 160,
                    height: 185,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "32px 32px 58px 58px",
                    border: "10px solid #7c2d12",
                    background: "linear-gradient(160deg, #24100d, #5f1d14)",
                    color: "#f5c86a",
                    fontSize: 54,
                    fontWeight: 900,
                  }}
                >
                  {payload.badgeMotif || "SQC"}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "rgba(43,23,13,.76)", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 24, lineHeight: 1.22, fontWeight: 950, maxWidth: 450 }}>
              <span>Coat of arms unlocked:</span>
              <span style={{ color: "#251109" }}>{payload.badgeName}</span>
            </div>
            <div style={{ color: "rgba(43,23,13,.86)", fontSize: 24, lineHeight: 1.24, fontWeight: 700, marginTop: 18, maxWidth: 455 }}>
              {achievementCopy}
            </div>
            <div style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: 18, lineHeight: 1.22, marginTop: 18, padding: "13px 0", width: 430, color: "rgba(43,23,13,.76)", fontWeight: 850, borderTop: "2px solid rgba(82,38,15,.2)", borderBottom: "2px solid rgba(82,38,15,.2)" }}>
              {proofLine}
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 10, color: "rgba(43,23,13,.72)", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 17, fontWeight: 1000, letterSpacing: 1.1, textTransform: "uppercase" }}>
              <span>{dateLabel}</span>
              <span>·</span>
              <span>{`+${payload.reward} pts`}</span>
            </div>
          </div>
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

function normalizeProofToken(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value) && typeof value[0] === "string") return value[0].trim();
  return "";
}
