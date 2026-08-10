import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = { width: 1200, height: 630 };

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        color: "#fff8e8",
        background: "linear-gradient(135deg, #03050a 0%, #07152e 58%, #050811 100%)",
        padding: "64px 72px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ position: "absolute", right: -80, top: -130, width: 620, height: 620, borderRadius: 999, border: "2px solid rgba(232,189,97,.15)", boxShadow: "0 0 0 80px rgba(13,61,137,.08), 0 0 0 160px rgba(13,61,137,.04)" }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Arial, sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, fontWeight: 800, letterSpacing: 3 }}>
            <div style={{ width: 46, height: 46, borderRadius: 999, border: "2px solid rgba(232,189,97,.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e8bd61", fontSize: 24, fontFamily: "Georgia, serif", fontWeight: 700 }}>S</div>
            SIDE QUEST CHESS
          </div>
          <div style={{ padding: "12px 20px", borderRadius: 999, border: "2px solid rgba(232,189,97,.4)", color: "#e8bd61", fontSize: 18, fontWeight: 800, letterSpacing: 3 }}>COMING SOON</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: .87, letterSpacing: -5 }}>
          <div style={{ fontSize: 92 }}>Every game deserves</div>
          <div style={{ fontSize: 112, color: "#e8bd61", fontStyle: "italic" }}>a side quest.</div>
        </div>
        <div style={{ color: "#a9b3c7", fontFamily: "Arial, sans-serif", fontSize: 25, letterSpacing: 1 }}>
          Pick the quest. Play the game. Bring proof.
        </div>
      </div>
    </div>,
    size,
  );
}
