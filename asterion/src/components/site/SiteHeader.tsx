"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wordmark } from "@/components/site/Wordmark";
import { navItems } from "@/lib/site";

export function SiteHeader({ kairospediaUrl }: { kairospediaUrl: string | null }) {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="frame site-header-inner">
        <Wordmark />
        <nav className="nav-links" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-menu-trigger">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation menu">
                <Menu size={18} aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Asterion</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/">Overview</Link>
              </DropdownMenuItem>
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
              {kairospediaUrl ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Kairos Universe</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <a href={`${kairospediaUrl}/wiki`}>Kairospedia</a>
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
