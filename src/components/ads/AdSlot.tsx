"use client";

import { useEffect, useRef } from "react";
import { getAdsConfig, type AdPlacement } from "@/lib/ads/config";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

/**
 * A single responsive AdSense unit.
 *
 * Renders nothing (no placeholder, no empty box) unless both the publisher ID
 * and the slot ID for this placement are configured. Units are labelled
 * "Advertisement" and should only be placed away from tool inputs, result
 * buttons and navigation to avoid accidental clicks.
 */
export function AdSlot({ placement, className }: AdSlotProps) {
  const { client, slots } = getAdsConfig();
  const slot = slots[placement];
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || !slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or network failures: the page works without ads.
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <aside
      aria-label="Advertisement"
      className={`mx-auto my-12 w-full max-w-3xl border-y border-navy-100 py-4 ${className ?? ""}`}
      data-ad-placement={placement}
    >
      <p className="mb-2 text-center text-xs tracking-wide text-navy-500 uppercase">Advertisement</p>
      <ins
        className="adsbygoogle block min-h-[100px]"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
