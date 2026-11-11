import type { ReactNode } from "react";

import type { SearchRecord } from "@/types/catalog";
import { TopNavigation } from "./TopNavigation";

export function WikiShell({
  children,
  searchRecords,
}: {
  children: ReactNode;
  searchRecords: SearchRecord[];
}) {
  return (
    <>
      <a className="skipLink" href="#main-content">
        Skip to content
      </a>
      <TopNavigation searchRecords={searchRecords} />
      <div className="wikiGrid">
        <main className="mainContent" id="main-content">
          {children}
        </main>
      </div>
      <footer className="footer">
        <div className="footerInner">
          <span>Kairospedia, the esports encyclopedia of the Kairos Universe</span>
          <span>Canon is sourced from the repository, not the interface.</span>
        </div>
      </footer>
    </>
  );
}
