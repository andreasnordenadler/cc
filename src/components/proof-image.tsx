"use client";

import { useSyncExternalStore } from "react";

type ProofImageProps = {
  imagePath: string;
  alt: string;
  className?: string;
};

export default function ProofImage({ imagePath, alt, className }: ProofImageProps) {
  const imageUrl = useSyncExternalStore(
    () => () => undefined,
    () => buildProofImageUrl(imagePath),
    () => null,
  );

  if (!imageUrl) {
    return <div className={`${className ?? ""} proof-generated-image-placeholder`} aria-label="Preparing victory scroll image" />;
  }

  return <img src={imageUrl} alt={alt} className={className} loading="lazy" decoding="async" />;
}

function buildProofImageUrl(imagePath: string) {
  const url = new URL(imagePath, window.location.origin);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timeZone) url.searchParams.set("tz", timeZone);

  return url.toString();
}
