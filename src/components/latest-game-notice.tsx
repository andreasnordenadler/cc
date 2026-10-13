import { buildLatestGameNotice, type LatestGameVisibility } from "../../apps/mobile/src/home/latestGameNotice";

export default function LatestGameNotice({ visibility }: { visibility?: LatestGameVisibility | null }) {
  const notice = buildLatestGameNotice(visibility);
  if (!notice) return null;
  return (
    <section data-testid="latest-game-visibility" aria-label="Latest game found and last check" style={{ padding: "12px 16px", margin: "12px 0 20px", border: "1px solid rgba(245,200,106,.22)", borderRadius: 12, background: "rgba(8,19,25,.65)", color: "#ece3cf", display: "grid", gap: 6, fontSize: 13, lineHeight: 1.5 }}>
      <strong>{notice.title}</strong>
      <span>{notice.gameLine}</span>
      <small>{notice.checkLine}</small>
      {notice.guidance ? <span>{notice.guidance}</span> : null}
    </section>
  );
}
