import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

type ActiveNavItem = "home" | "challenges" | "account";

type SiteNavProps = {
  isSignedIn: boolean;
  active: ActiveNavItem;
};

export default function SiteNav({ isSignedIn, active }: SiteNavProps) {
  return (
    <header style={shellStyle}>
      <div style={innerStyle}>
        <nav style={navLinksStyle} aria-label="Primary">
          <Link href="/" style={getNavItemStyle(active === "home")}>Home</Link>
          <Link href="/challenges" style={getNavItemStyle(active === "challenges")}>Challenges</Link>
          <Link href="/account" style={getNavItemStyle(active === "account")}>Account</Link>
        </nav>

        <div style={actionStyle}>
          {isSignedIn ? (
            <span style={statusStyle}>Signed in</span>
          ) : (
            <>
              <SignInButton mode="modal">
                <button type="button" style={outlineButtonStyle}>
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button type="button" style={primaryButtonStyle}>
                  Create account
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const shellStyle = {
  borderBottom: "1px solid rgba(148,163,184,0.18)",
  background: "#111827",
};

const innerStyle = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto",
  padding: "12px 0",
  display: "flex",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap" as const,
};

const navLinksStyle = {
  display: "inline-flex",
  flex: 1,
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap" as const,
};

const navItemBase = {
  borderRadius: 999,
  padding: "8px 12px",
  textDecoration: "none",
  fontWeight: 500,
};

const getNavItemStyle = (isActive: boolean) => ({
  ...navItemBase,
  color: isActive ? "#dbeafe" : "#cbd5e1",
  background: isActive ? "rgba(59,130,246,0.16)" : "transparent",
  border: isActive ? "1px solid rgba(96,165,250,0.35)" : "1px solid transparent",
});

const actionStyle = {
  display: "inline-flex",
  gap: 8,
  alignItems: "center",
};

const statusStyle = {
  color: "#93c5fd",
  fontSize: 13,
};

const primaryButtonStyle = {
  borderRadius: 999,
  border: "1px solid rgba(59,130,246,0.32)",
  background: "#1e3a8a",
  color: "#dbeafe",
  padding: "8px 12px",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

const outlineButtonStyle = {
  ...primaryButtonStyle,
  background: "#1e293b",
  borderColor: "rgba(148,163,184,0.32)",
  color: "#f8fafc",
};
