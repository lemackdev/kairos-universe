/**
 * Cross-product links between KairosDB and Kairospedia. Both are
 * independent Next.js apps with no decided joint deployment yet (see
 * docs/kairosdb/DEPLOYMENT.md), so the base URL is env-configurable and
 * defaults to a same-origin relative path — correct once both apps are
 * eventually served under one domain (e.g. reverse-proxied at /db and /wiki),
 * and trivially overridable if they end up on separate subdomains instead.
 */
const KAIROSPEDIA_BASE_URL = process.env.NEXT_PUBLIC_KAIROSPEDIA_BASE_URL ?? "";

export function kairospediaPlayerUrl(slug: string): string {
  return `${KAIROSPEDIA_BASE_URL}/wiki/players/${slug}`;
}

export function kairospediaTeamUrl(slug: string): string {
  return `${KAIROSPEDIA_BASE_URL}/wiki/teams/${slug}`;
}
