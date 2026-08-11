import type { Metadata } from "next";

import { NoticeBanner } from "@/components/NoticeBanner";
import { TopNavigation } from "@/components/TopNavigation";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KairosDB",
    template: "%s · KairosDB",
  },
  description: "Competitive careers and results from the Kairos Universe",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <NoticeBanner />
        <TopNavigation />
        <main id="main-content">{children}</main>
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            marginTop: "3rem",
            padding: "1.5rem",
            color: "var(--text-faint)",
            fontSize: "12.5px",
          }}
        >
          <div className="container">
            KairosDB · Competitive careers and results from the Kairos
            Universe. External data adapted from{" "}
            <a
              href="https://lol.fandom.com/"
              target="_blank"
              rel="noreferrer noopener"
              style={{ color: "var(--text-muted)" }}
            >
              Leaguepedia
            </a>
            . See{" "}
            <a href="/sources" style={{ color: "var(--text-muted)" }}>
              /sources
            </a>{" "}
            for attribution details.
          </div>
        </footer>
      </body>
    </html>
  );
}
