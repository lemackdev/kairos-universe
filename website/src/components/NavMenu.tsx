"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Desktop: the links sit in the top bar. Phones (<= 820px): they collapse behind a hamburger button and open as a panel.
export function NavMenu({ links }: { links: ReadonlyArray<readonly [string, string]> }) {
  const pathname = usePathname();
  // The panel is open only for the page it was opened on, so navigating closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean | ((current: boolean) => boolean)) => setOpenOn((current) => ((typeof value === "function" ? value(current === pathname) : value) ? pathname : null));
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenOn(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`menuToggle${open ? " isOpen" : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="menuToggleBars" aria-hidden="true"><span /><span /><span /></span>
      </button>
      <div className={`topNavLinks${open ? " isOpen" : ""}`} id={panelId}>
        {links.map(([label, href]) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}
