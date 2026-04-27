import { ImageResponse } from "next/og";
import { CHALLENGES, getChallengeById } from "@/lib/challenges";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const challenge = getChallengeById(id) ?? CHALLENGES[0];
  const primary = challenge.badgeIdentity.colors.primary;
  const secondary = challenge.badgeIdentity.colors.secondary;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#10131f",
          color: "#f8f4e8",
          padding: 64,
          fontFamily: "Arial, Helvetica, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 18% 18%, ${primary}66, transparent 30%), radial-gradient(circle at 86% 22%, ${secondary}55, transparent 28%), linear-gradient(135deg, #10131f 0%, #1c2033 54%, #121522 100%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -70,
            top: 70,
            width: 430,
            height: 430,
            borderRadius: 56,
            transform: "rotate(12deg)",
            border: `18px solid ${primary}`,
            boxShadow: `0 0 90px ${challenge.badgeIdentity.colors.glow}`,
            background: `linear-gradient(145deg, ${primary}, ${secondary})`,
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 54,
            top: 160,
            width: 260,
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "34px 34px 90px 90px",
            border: "10px solid rgba(248,244,232,.86)",
            background: "rgba(16,19,31,.84)",
            color: secondary,
            fontSize: 138,
            fontWeight: 900,
            zIndex: 1,
          }}
        >
          {challenge.badgeIdentity.motif}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, position: "relative", zIndex: 2, maxWidth: 760 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 28,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "#f5c86a",
              fontWeight: 800,
            }}
          >
            <span>SQC friend dare</span>
            <span style={{ color: "#f8f4e8", opacity: 0.72 }}>+{challenge.reward} pts</span>
          </div>
          <div style={{ fontSize: 78, lineHeight: 0.94, fontWeight: 950, letterSpacing: -3 }}>
            {challenge.title}
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.22, color: "#d9ddf0", maxWidth: 720 }}>
            {challenge.objective}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 2,
            fontSize: 27,
            color: "#f8f4e8",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <strong>{challenge.badgeIdentity.name}</strong>
            <span style={{ color: "#c7cce1" }}>{challenge.badgeIdentity.heraldry.motto}</span>
          </div>
          <div
            style={{
              border: "2px solid rgba(248,244,232,.36)",
              borderRadius: 999,
              padding: "16px 24px",
              background: "rgba(255,255,255,.08)",
              fontWeight: 800,
            }}
          >
            sidequestchess.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
