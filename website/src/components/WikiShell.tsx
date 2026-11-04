import type { ReactNode } from "react";

import type { SearchRecord } from "@/types/catalog";
import { SidebarNavigation, type SidebarLink } from "./SidebarNavigation";
import { TopNavigation } from "./TopNavigation";

export function WikiShell({
  children,
  contextLinks,
  searchRecords,
}: {
  children: ReactNode;
  contextLinks?: SidebarLink[];
  searchRecords: SearchRecord[];
}) {
  return (
    <>
      <a className="skipLink" href="#main-content">
        Skip to content
      </a>
      <TopNavigation searchRecords={searchRecords} />
      <div className="wikiGrid">
        <SidebarNavigation links={contextLinks} />
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
