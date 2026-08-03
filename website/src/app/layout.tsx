import type { Metadata } from "next";
import type { ReactNode } from "react";

import { WikiShell } from "@/components/WikiShell";
import { getCatalog } from "@/lib/canon/server";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kairospedia",
    template: "%s | Kairospedia",
  },
  description: "The esports encyclopedia of the Kairos Universe",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const catalog = getCatalog();

  return (
    <html lang="en">
      <body>
        <WikiShell metadata={catalog.metadata}>{children}</WikiShell>
      </body>
    </html>
  );
}
