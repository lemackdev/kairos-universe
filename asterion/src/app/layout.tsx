import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { kairospediaHref, kairospediaOrigin } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Asterion Intelligence",
    template: "%s | Asterion Intelligence",
  },
  description:
    "Asterion Intelligence is the parent company of Kairos Esports, a fictional organization in the Kairos Universe.",
  applicationName: "Asterion Intelligence",
  openGraph: {
    title: "Asterion Intelligence",
    description: "Parent company of Kairos Esports. A fictional organization in the Kairos Universe.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const wiki = kairospediaHref("/wiki");

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div className="fiction-notice mono-note">
          Asterion Intelligence is a fictional company in the Kairos Universe.
          {wiki ? (
            <>
              {" "}
              <a href={wiki}>Read the canon on Kairospedia.</a>
            </>
          ) : null}
        </div>
        <SiteHeader kairospediaUrl={kairospediaOrigin} />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
