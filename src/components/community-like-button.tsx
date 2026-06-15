import Link from "next/link";
import type { CommunityLikeTargetType } from "@/lib/community-likes";

type CommunityLikeButtonProps = {
  targetType: CommunityLikeTargetType;
  targetId: string;
  count: number;
  likedByViewer: boolean;
  signedIn: boolean;
  returnTo: string;
  label?: string;
};

export default function CommunityLikeButton({
  count,
  label = "Like",
  likedByViewer,
  returnTo,
  signedIn,
  targetId,
  targetType,
}: CommunityLikeButtonProps) {
  const countLabel = `${count} like${count === 1 ? "" : "s"}`;
  const ariaLabel = `${signedIn ? (likedByViewer ? "Unlike" : "Like") : "Sign in to like"} ${label}. ${countLabel}.`;
  const className = `community-like-inline${likedByViewer ? " liked" : ""}`;

  if (!signedIn) {
    return (
      <Link className={className} href={`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`} aria-label={ariaLabel} title="Sign in to like">
        <span className="community-like-icon" aria-hidden="true">👍</span>
        <span className="community-like-count">{count}</span>
      </Link>
    );
  }

  return (
    <form action="/api/community-likes" method="post" className="community-like-form" aria-label={ariaLabel}>
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="intent" value={likedByViewer ? "unlike" : "like"} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button className={className} type="submit" aria-pressed={likedByViewer} aria-label={ariaLabel} title={likedByViewer ? "Unlike" : "Like"}>
        <span className="community-like-icon" aria-hidden="true">👍</span>
        <span className="community-like-count">{count}</span>
      </button>
    </form>
  );
}
