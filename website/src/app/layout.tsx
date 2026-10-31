import type { Metadata } from "next";
import type { ReactNode } from "react";

import { WikiShell } from "@/components/WikiShell";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kairospedia",
    template: "%s | Kairospedia",
  },
  description: "The esports encyclopedia of the Kairos Universe",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WikiShell>{children}</WikiShell>
      </body>
    </html>
  );
}
