import MobileAppWebShell, { MobileSimpleScreen } from "@/components/mobile-app-web-shell";

export default function NotFound() {
  return (
    <MobileAppWebShell activeTab="home" signedIn={false}>
      <MobileSimpleScreen
        eyebrow="Home"
        title="Side Quest Chess"
        body="Chess, but with stupidly hard side quests — solo or multiplayer. Browse the live boards first; sign in when you want SQC to save progress, verify proof, or join a table."
        primaryAction={{ label: "Browse Solo Side Quests", href: "/side-quests" }}
        secondaryAction={{ label: "Browse Multiplayer Side Quests", href: "/multiplayer" }}
      />
    </MobileAppWebShell>
  );
}
