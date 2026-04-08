import Link from "next/link";
import { revalidatePath } from "next/cache";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

export default async function AccountPage() {
  const user = await currentUser();
  const lichessUsername =
    typeof user?.publicMetadata?.lichessUsername === "string"
      ? user.publicMetadata.lichessUsername
      : "";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
        background:
          "radial-gradient(circle at top, rgba(96,165,250,0.18), transparent 32%), linear-gradient(180deg, #0b1020 0%, #111827 100%)",
        color: "#f8fafc",
      }}
    >
      <section
        style={{
          margin: "0 auto",
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
          Authenticated account
        </div>

        <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
            }}
          >
            Public chess identity
          </h1>

          <p style={{ fontSize: 18, color: "#cbd5e1", lineHeight: 1.6 }}>
            Save a public Lichess username once, then it will persist on this account
            and survive refresh.
          </p>

          {lichessUsername ? (
            <p style={{ color: "#86efac", marginTop: 0, fontSize: 14 }}>
              Current saved username: <strong>{lichessUsername}</strong>
            </p>
          ) : null}
        </div>

        <form
          action={saveLichessUsername}
          style={{
            marginTop: 24,
            display: "grid",
            gap: 12,
          }}
        >
          <label htmlFor="lichessUsername" style={{ fontSize: 13, color: "#bfdbfe" }}>
            Lichess username
          </label>
          <input
            id="lichessUsername"
            name="lichessUsername"
            defaultValue={lichessUsername}
            placeholder="and72nor"
            style={{
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.26)",
              background: "rgba(15,23,42,0.72)",
              color: "#f8fafc",
              padding: "12px 14px",
              fontSize: 16,
              maxWidth: 320,
            }}
            required
            minLength={1}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="submit"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(96,165,250,0.32)",
                background: "#eff6ff",
                color: "#0f172a",
                padding: "10px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Save public username
            </button>
            <Link
              href="/"
              style={{
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.28)",
                padding: "10px 16px",
                color: "#cbd5e1",
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Back to home
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

async function saveLichessUsername(formData: FormData) {
  "use server";
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const submitted = formData.get("lichessUsername");
  const lichessUsername =
    typeof submitted === "string" ? submitted.trim() : "";

  if (!lichessUsername) {
    return;
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      lichessUsername,
    },
  });

  revalidatePath("/account");
}
