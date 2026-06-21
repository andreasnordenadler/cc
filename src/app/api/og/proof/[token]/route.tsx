/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { decodePublicProof } from "@/lib/proof-share";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
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
  const proofLine = payload.summary || "Verified public-game proof accepted by Side Quest Chess.";
  const achievementCopy = payload.challengeId === "finish-any-game"
    ? "A public chess game was completed, verified, and entered into the Side Quest Chess ledgers."
    : "The verifier accepted the public-game proof. The coat of arms may now be displayed with entirely appropriate smugness.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #140d0d 0%, #2a150d 50%, #090807 100%)",
          color: "#fff7e8",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            border: "2px solid rgba(245,200,106,.42)",
            borderRadius: 38,
            boxShadow: "inset 0 0 0 1px rgba(255,247,232,.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -140,
            top: -180,
            width: 560,
            height: 560,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(245,200,106,.24), transparent 68%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -130,
            bottom: -210,
            width: 610,
            height: 610,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(167,29,42,.32), transparent 66%)",
          }}
        />
        <div style={{ display: "flex", width: "100%", height: "100%", padding: "58px 70px", gap: 42 }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 735, gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "Arial, Helvetica, sans-serif", textTransform: "uppercase", letterSpacing: 4, fontSize: 22, color: "#f5c86a", fontWeight: 1000 }}>
              <img src={sealImage} alt="" width="58" height="58" style={{ width: 58, height: 58, objectFit: "contain" }} />
              Side Quest completed
            </div>
            <div style={{ fontSize: 76, lineHeight: .9, letterSpacing: -3.4, fontWeight: 950, maxWidth: 720 }}>
              {payload.challengeTitle}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, fontFamily: "Arial, Helvetica, sans-serif", fontSize: 28, lineHeight: 1.18, color: "rgba(255,247,232,.86)", fontWeight: 850, maxWidth: 715 }}>
              <span>Coat unlocked: <b style={{ color: "#f5c86a" }}>{payload.badgeName}</b></span>
              <span>{achievementCopy}</span>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 22, lineHeight: 1.18, color: "rgba(255,247,232,.78)", fontWeight: 850, maxWidth: 690 }}>
              <span>{proofLine}</span>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center", fontFamily: "Arial, Helvetica, sans-serif", textTransform: "uppercase", letterSpacing: 2.1, fontSize: 20, color: "rgba(245,200,106,.9)", fontWeight: 1000 }}>
              <span>{dateLabel}</span>
              <span>·</span>
              <span>Coat of Arms</span>
              <span>·</span>
              <span>sidequestchess.com</span>
            </div>
          </div>
          <div style={{ width: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: 270,
                height: 270,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 62,
                background: "radial-gradient(circle at 50% 45%, rgba(255,244,219,.98), rgba(236,194,125,.92) 58%, rgba(151,84,36,.24) 78%, transparent 79%)",
                boxShadow: "inset 0 0 0 4px rgba(245,200,106,.18), 0 28px 52px rgba(0,0,0,.38)",
              }}
            >
              {badgeImage ? (
                <img src={badgeImage} alt="" width="236" height="236" style={{ width: 236, height: 236, objectFit: "contain", filter: "drop-shadow(0 18px 24px rgba(82,38,15,.32))" }} />
              ) : (
                <div style={{ width: 180, height: 205, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "36px 36px 68px 68px", border: "11px solid #7c2d12", background: "linear-gradient(160deg, #24100d, #5f1d14)", color: "#f5c86a", fontSize: 58, fontWeight: 1000 }}>
                  {payload.badgeMotif || "SQC"}
                </div>
              )}
            </div>
          </div>
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
