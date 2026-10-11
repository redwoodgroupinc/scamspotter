import { buildAdsTxt, getAdsConfig } from "@/lib/ads/config";

export const dynamic = "force-static";

/** Serves /ads.txt only when a real AdSense publisher ID is configured. */
export function GET() {
  const body = buildAdsTxt(getAdsConfig().client);
  if (!body) return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain" } });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
