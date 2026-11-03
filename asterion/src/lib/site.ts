const raw = process.env.NEXT_PUBLIC_KAIROSPEDIA_URL?.trim();

/** Absolute Kairospedia origin, or null when not configured. */
export const kairospediaOrigin: string | null = raw ? raw.replace(/\/+$/, "") : null;

/** Build an absolute Kairospedia URL. Returns null when no origin is configured. */
export function kairospediaHref(pathname: string): string | null {
  if (!kairospediaOrigin) return null;
  return `${kairospediaOrigin}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export const navItems = [
  { label: "Approach", href: "/approach" },
  { label: "Systems", href: "/systems" },
  { label: "Ventures", href: "/ventures" },
  { label: "Company", href: "/company" },
] as const;
