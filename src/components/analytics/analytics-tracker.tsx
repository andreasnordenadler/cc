"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef("");

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    if (!path || lastTracked.current === path) return;
    lastTracked.current = path;

    const body = JSON.stringify({
      type: "page_view",
      path,
      source: "web",
      deviceType: getDeviceType(),
    });

    void fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname, searchParams]);

  return null;
}

function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;

  if (/bot|crawler|spider|crawling|preview|facebookexternalhit|slackbot|telegrambot|discordbot/.test(userAgent)) return "bot";
  if (/ipad|tablet|kindle|silk|playbook/.test(userAgent) || (/android/.test(userAgent) && !/mobile/.test(userAgent))) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/.test(userAgent)) return "mobile";
  if (maxTouchPoints > 1 && /macintosh/.test(userAgent)) return "tablet";
  return "desktop";
}
