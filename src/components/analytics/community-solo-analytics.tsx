"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type CommunitySoloAnalyticsEventType =
  | "community_solo_browse"
  | "community_solo_detail"
  | "community_solo_creator_filter"
  | "community_solo_report_click"
  | "community_solo_account_handoff";

type CommunitySoloAnalyticsPayload = {
  type: CommunitySoloAnalyticsEventType;
  questId?: string;
  status?: string;
};

type CommunitySoloAnalyticsProps = CommunitySoloAnalyticsPayload & {
  onceKey?: string;
};

type CommunitySoloAnalyticsLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "href" | "onClick"> &
  LinkProps &
  CommunitySoloAnalyticsPayload & {
    children: ReactNode;
  };

export function CommunitySoloAnalytics({ type, questId, status, onceKey }: CommunitySoloAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trackedKey = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    const key = onceKey ?? `${type}:${path}:${questId ?? ""}:${status ?? ""}`;
    if (trackedKey.current === key) return;
    trackedKey.current = key;
    trackCommunitySoloEvent({ type, questId, status }, path);
  }, [onceKey, pathname, questId, searchParams, status, type]);

  return null;
}

export function CommunitySoloAnalyticsLink({ type, questId, status, children, ...props }: CommunitySoloAnalyticsLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleClick() {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    trackCommunitySoloEvent({ type, questId, status }, path);
  }

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}

function trackCommunitySoloEvent(payload: CommunitySoloAnalyticsPayload, path: string) {
  const body = JSON.stringify({
    type: payload.type,
    path,
    questId: payload.questId,
    status: payload.status,
    source: "web",
    deviceType: getDeviceType(),
  });

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
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
