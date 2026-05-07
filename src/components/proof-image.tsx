"use client";

import { useMemo } from "react";

type ProofImageProps = {
  imagePath: string;
  alt: string;
  className?: string;
};

export default function ProofImage({ imagePath, alt, className }: ProofImageProps) {
  const imageUrl = useMemo(() => {
    if (typeof window === "undefined") return imagePath;

    const url = new URL(imagePath, window.location.origin);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) url.searchParams.set("tz", timeZone);

    return url.toString();
  }, [imagePath]);

  return <img src={imageUrl} alt={alt} className={className} loading="lazy" decoding="async" />;
}
