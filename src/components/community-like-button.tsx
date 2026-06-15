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

  if (!signedIn) {
    return (
      <Link className="button ghost community-like-button" href={`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`} aria-label={`Sign in to like this Side Quest. ${countLabel}.`}>
        ♡ {label} · {countLabel}
      </Link>
    );
  }

  return (
    <form action="/api/community-likes" method="post" className="community-like-form">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="intent" value={likedByViewer ? "unlike" : "like"} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button className={`button ghost community-like-button${likedByViewer ? " liked" : ""}`} type="submit" aria-pressed={likedByViewer} aria-label={`${likedByViewer ? "Unlike" : "Like"} this Side Quest. ${countLabel}.`}>
        {likedByViewer ? "♥ Liked" : "♡ Like"} · {countLabel}
      </button>
    </form>
  );
}
