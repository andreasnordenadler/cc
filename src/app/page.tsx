export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
        background:
          "radial-gradient(circle at top, rgba(96,165,250,0.18), transparent 32%), linear-gradient(180deg, #0b1020 0%, #111827 100%)",
        color: "#f8fafc",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 760,
          border: "1px solid rgba(148,163,184,0.22)",
          background: "rgba(15,23,42,0.72)",
          backdropFilter: "blur(14px)",
          borderRadius: 28,
          padding: "32px",
          boxShadow: "0 30px 80px rgba(2,6,23,0.45)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 999,
            padding: "8px 14px",
            background: "rgba(59,130,246,0.14)",
            border: "1px solid rgba(96,165,250,0.28)",
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#bfdbfe",
          }}
        >
          CC restart
        </div>

        <div style={{ marginTop: 20, display: "grid", gap: 18 }}>
          <h1
            style={{
              fontSize: "clamp(2.3rem, 5vw, 4.25rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
            }}
          >
            Chess Challenge.
          </h1>

          <p
            style={{
              maxWidth: 620,
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.6,
              color: "#cbd5e1",
            }}
          >
            BlunderCheck restart foundation. The first goal is one tiny real live loop:
            sign in, save a public chess username, pick a challenge, come back, and
            verify a real result.
          </p>
        </div>

        <div
          style={{
            marginTop: 28,
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          {[
            "GitHub → Vercel",
            "Clerk auth",
            "Neon Postgres",
            "Lichess-first verification",
          ].map((item) => (
            <div
              key={item}
              style={{
                borderRadius: 18,
                padding: "16px 18px",
                background: "rgba(15,23,42,0.58)",
                border: "1px solid rgba(148,163,184,0.18)",
                color: "#e2e8f0",
                fontSize: 14,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 28,
            paddingTop: 18,
            borderTop: "1px solid rgba(148,163,184,0.14)",
            fontSize: 14,
            color: "#94a3b8",
          }}
        >
          Live bootstrap in progress.
        </div>
      </section>
    </main>
  );
}
